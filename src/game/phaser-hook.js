// Hooks sur le moteur de jeu Phaser et interception des phases d'apprentissage
import { PokeSkip } from '../core/state.js';
import { LineageManager } from '../core/lineage-manager.js';
import { UI } from '../ui/index.js';

export function findPhaserScene() {
  const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  try {
    if (win.globalScene && win.globalScene.phaseManager) {
      return { game: win.globalScene.game, scene: win.globalScene };
    }

    if (win.Phaser) {
      if (win.Phaser.Display?.Canvas?.CanvasPool?.pool?.[0]?.parent?.game) {
        const g = win.Phaser.Display.Canvas.CanvasPool.pool[0].parent.game;
        const sc = g.scene?.getScene('battle') || g.scene?.scenes?.find(s => s.scene?.key === 'battle' || s.phaseManager);
        if (sc && sc.phaseManager) return { game: g, scene: sc };
      }
      if (win.Phaser.GAMES && win.Phaser.GAMES.length > 0) {
        for (const g of win.Phaser.GAMES) {
          if (!g || !g.scene) continue;
          const sc = g.scene.getScene('battle') || g.scene.scenes?.find(s => s.scene?.key === 'battle' || s.phaseManager);
          if (sc && sc.phaseManager) return { game: g, scene: sc };
        }
      }
    }

    const canvas = document.querySelector('#app canvas') || document.querySelector('canvas');
    if (canvas) {
      const g = canvas.__game || canvas.game;
      if (g && g.scene) {
        const sc = g.scene.getScene('battle') || g.scene.scenes?.find(s => s.scene?.key === 'battle' || s.phaseManager);
        if (sc && sc.phaseManager) return { game: g, scene: sc };
      }
    }
  } catch (e) {
    console.warn('[PokeSkip] Erreur recherche scene:', e);
  }
  return null;
}

export function initGameHook() {
  let hookAttempts = 0;
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes((window.location.hostname || '').toLowerCase());
  const maxHookAttempts = isLocal ? 60 : Infinity;

  function checkAndHook() {
    if (PokeSkip.hooked) return;
    hookAttempts++;

    const found = findPhaserScene();
    if (!found) {
      if (hookAttempts < maxHookAttempts) {
        setTimeout(checkAndHook, 800);
      }
      return;
    }

    PokeSkip.game = found.game;
    PokeSkip.scene = found.scene;
    PokeSkip.migrateRules();
    applyPhaseManagerHooks(found.scene);
    PokeSkip.hooked = true;
    console.log('🎉 [PokéSkip] Connecté avec succès à PokéRogue !');
    UI.showToast('PokéSkip activé et prêt !', 'success', 2000);
    UI.updateHudBadge();
  }

  checkAndHook();

  // Surveillance continue pour ré-accrocher si la scène est rechargée ou change
  setInterval(() => {
    const found = findPhaserScene();
    if (found && found.scene && found.scene !== PokeSkip.scene) {
      PokeSkip.game = found.game;
      PokeSkip.scene = found.scene;
      applyPhaseManagerHooks(found.scene);
    }
  }, 2000);
}

function applyPhaseManagerHooks(scene) {
  const pm = scene.phaseManager;
  if (!pm) return;

  function inspectPhase(phase) {
    if (!phase) return;
    if (phase.phaseName === 'LearnMovePhase' || phase.is?.('LearnMovePhase') || phase.constructor?.name === 'LearnMovePhase') {
      hookLearnMovePhasePrototype(Object.getPrototypeOf(phase));
    }
  }

  if (pm.unshiftPhase && !pm._pokeskipHookedUnshift) {
    const origUnshift = pm.unshiftPhase.bind(pm);
    pm.unshiftPhase = function (...phases) {
      for (const p of phases) inspectPhase(p);
      return origUnshift(...phases);
    };
    pm._pokeskipHookedUnshift = true;
  }

  if (pm.pushPhase && !pm._pokeskipHookedPush) {
    const origPush = pm.pushPhase.bind(pm);
    pm.pushPhase = function (...phases) {
      for (const p of phases) inspectPhase(p);
      return origPush(...phases);
    };
    pm._pokeskipHookedPush = true;
  }

  if (pm.shiftPhase && !pm._pokeskipHookedShift) {
    const origShift = pm.shiftPhase.bind(pm);
    pm.shiftPhase = function () {
      const res = origShift();
      const curr = pm.getCurrentPhase ? pm.getCurrentPhase() : pm.currentPhase;
      if (curr) inspectPhase(curr);
      return res;
    };
    pm._pokeskipHookedShift = true;
  }

  const currentPhase = pm.getCurrentPhase ? pm.getCurrentPhase() : (pm.currentPhase || pm.phase);
  if (currentPhase) inspectPhase(currentPhase);

  if (Array.isArray(pm.phaseQueue)) {
    for (const p of pm.phaseQueue) inspectPhase(p);
  }
}

function hookLearnMovePhasePrototype(proto) {
  if (!proto || proto._pokeskipHooked) return;
  proto._pokeskipHooked = true;

  // Fermeture automatique du prompt dès que LearnMovePhase se termine
  const origEnd = proto.end;
  if (typeof origEnd === 'function') {
    proto.end = function () {
      UI.dismissQuickSkipPrompt();
      if (this._pokeskipEnded) return;
      this._pokeskipEnded = true;
      if (typeof this._restoreUi === 'function') {
        this._restoreUi();
      }
      return origEnd.apply(this, arguments);
    };
  }

  const origReplaceMoveCheck = proto.replaceMoveCheck;
  if (!origReplaceMoveCheck) return;

  proto.replaceMoveCheck = async function (moveArg, pokemonArg) {
    const phase = this;
    const pokemon = pokemonArg || (typeof phase.getPokemon === 'function' ? phase.getPokemon() : phase.pokemon) || (arguments[0]?.species ? arguments[0] : null);
    const move = (moveArg && (moveArg.name || moveArg.id !== undefined)) ? moveArg : (phase.move || arguments[0]);
    const moveId = phase.moveId ?? move?.id ?? move?.moveId ?? (typeof moveArg === 'number' ? moveArg : undefined);

    if (move && move.id && move.name) {
      PokeSkip.knownMovesCache[move.id] = move.name;
    }

    // learnMoveType: 0 = LEARN_MOVE (montée de niveau / évolution), 1 = MEMORY, 2 = TM
    const isLevelUpMove = phase.learnMoveType === 0 || phase.learnMoveType === undefined;

    if (PokeSkip.settings.enabled && isLevelUpMove && pokemon) {
      const familyInfo = LineageManager.getFamilyInfo(pokemon);
      const moveName = move?.name || (moveId !== undefined ? LineageManager.getMoveName(moveId, pokemon) : `Move #${moveId || '?'}`);

      // Cas 1 : Remplacement automatique configuré (Mode Avancé)
      const replacement = PokeSkip.findActiveReplacement(pokemon, moveName, moveId);
      if (replacement) {
        const currentMoveset = (typeof pokemon.getMoveset === 'function')
          ? pokemon.getMoveset()
          : (pokemon.moveset || []);

        const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, '');
        const oldNorm = normalize(replacement.oldMoveName);
        const oldId = replacement.oldMoveId ? Number(replacement.oldMoveId) : null;

        const targetMoveIndex = currentMoveset.findIndex((m) => {
          if (!m) return false;
          const mId = m.moveId ?? m.id ?? (typeof m === 'number' ? m : null);
          if (oldId && mId && Number(mId) === oldId) return true;

          const names = [];
          if (typeof m.getName === 'function') {
            try { names.push(m.getName()); } catch (_) {}
          }
          if (m.name) names.push(m.name);
          if (typeof m.getMove === 'function') {
            try { const mv = m.getMove(); if (mv?.name) names.push(mv.name); } catch (_) {}
          }
          if (mId) {
            if (PokeSkip.knownMovesCache[mId]) names.push(PokeSkip.knownMovesCache[mId]);
            const lmName = LineageManager.getMoveName(mId, pokemon);
            if (lmName) names.push(lmName);
          }

          for (const n of names) {
            if (n && normalize(n) === oldNorm) return true;
          }
          return false;
        });

        if (targetMoveIndex !== -1) {
          console.log(`🔄 [PokéSkip] Remplacement auto : "${replacement.oldMoveName}" -> "${moveName}" sur ${familyInfo.lineageName} (slot ${targetMoveIndex})`);

          if (typeof UI.dismissQuickSkipPrompt === 'function') {
            UI.dismissQuickSkipPrompt();
          }

          PokeSkip.recordSkip();

          if (PokeSkip.settings.showToasts) {
            UI.showToast(`🔄 <b>${moveName}</b> a automatiquement remplacé <b>${replacement.oldMoveName}</b> !`, 'info', PokeSkip.settings.toastDuration || 3000);
          }
          UI.updateHudBadge();

          const effectiveMove = move || { id: moveId, name: moveName };
          if (phase.moveId === undefined && moveId !== undefined) {
            phase.moveId = moveId;
          }

          try {
            if (typeof phase.learnMove === 'function') {
              phase.learnMove(targetMoveIndex, effectiveMove, pokemon);
              return;
            } else if (typeof pokemon.setMove === 'function') {
              pokemon.setMove(targetMoveIndex, moveId);
              phase.end();
              return;
            } else if (typeof pokemon.learnMove === 'function') {
              pokemon.learnMove(moveId, targetMoveIndex);
              phase.end();
              return;
            } else {
              phase.end();
              return;
            }
          } catch (err) {
            console.error('[PokéSkip] Erreur lors de l\'exécution du remplacement auto :', err);
            try {
              if (typeof pokemon.setMove === 'function') {
                pokemon.setMove(targetMoveIndex, moveId);
              }
              phase.end();
            } catch (fallbackErr) {
              console.error('[PokéSkip] Erreur fallback critique :', fallbackErr);
            }
            return;
          }
        } else {
          console.warn(`[PokéSkip] Remplacement configuré ("${replacement.oldMoveName}" -> "${moveName}") mais l'ancienne capacité n'est pas dans le moveset actuel :`, currentMoveset);
        }
      }

      // Cas 2 : Auto-Skip configuré dans les règles
      if (PokeSkip.isMoveSkipped(pokemon, moveName, moveId)) {
        console.log(`🛡️ [PokéSkip] Auto-Skip activé pour "${moveName}" sur ${familyInfo.lineageName} !`);
        PokeSkip.recordSkip();

        if (PokeSkip.settings.showToasts) {
          UI.showToast(`🛡️ Capacité <b>${moveName}</b> ignorée pour <b>${familyInfo.lineageName}</b> !`, 'info', PokeSkip.settings.toastDuration);
        }
        UI.updateHudBadge();
        phase.end();
        return;
      }

      // Cas 3 : Quick Skip Prompt si la capacité n'est pas déjà ignorée
      if (PokeSkip.settings.showQuickPrompt !== false) {
        UI.showQuickSkipPrompt(phase, pokemon, move);
      }
    }

    // Si le joueur a déjà cliqué sur "Toujours ignorer" via le Quick Prompt :
    if (phase._pokeskipIgnored) {
      UI.dismissQuickSkipPrompt();
      phase.end();
      return;
    }

    // Gestion de l'interception de l'UI in-game pour neutraliser la boîte de dialogue si ignorée en cours de route
    const scene = phase.scene || PokeSkip.scene || window.globalScene;
    const ui = scene?.ui;

    if (ui && typeof ui.showTextPromise === 'function') {
      const origShowTextPromise = ui.showTextPromise;
      const origSetModeWithoutClear = ui.setModeWithoutClear;

      ui.showTextPromise = async function (text, callbackDelay, prompt, promptDelay) {
        if (phase._pokeskipIgnored) {
          return;
        }
        return origShowTextPromise.call(this, text, callbackDelay, prompt, promptDelay);
      };

      if (typeof origSetModeWithoutClear === 'function') {
        ui.setModeWithoutClear = function (mode, ...args) {
          if (phase._pokeskipIgnored && mode === 14) {
            phase.end();
            return Promise.resolve();
          }
          return origSetModeWithoutClear.call(this, mode, ...args);
        };
      }

      const restoreUi = () => {
        ui.showTextPromise = origShowTextPromise;
        if (origSetModeWithoutClear) ui.setModeWithoutClear = origSetModeWithoutClear;
      };
      phase._restoreUi = restoreUi;

      try {
        return await origReplaceMoveCheck.apply(phase, arguments);
      } finally {
        restoreUi();
      }
    }

    return origReplaceMoveCheck.apply(this, arguments);
  };

  console.log('⚡ [PokéSkip] Prototype LearnMovePhase intercepté avec succès.');
}
