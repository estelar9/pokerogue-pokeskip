// Hooks sur le moteur de jeu Phaser et interception des phases d'apprentissage
import { PokeSkip } from '../core/state.js';
import { LineageManager } from '../core/lineage-manager.js';
import { t } from '../core/i18n.js';
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

function snapshotMoveset(pokemon) {
  if (!pokemon) return [];
  const currentMoveset = (typeof pokemon.getMoveset === 'function')
    ? pokemon.getMoveset()
    : (pokemon.moveset || []);

  return currentMoveset.map((m, idx) => {
    if (!m) return null;
    const mId = m.moveId ?? m.id ?? (typeof m === 'number' ? m : null);
    let name = '';
    if (typeof m.getName === 'function') {
      try { name = m.getName(); } catch (_) {}
    }
    if (!name && m.name) name = m.name;
    if (!name && typeof m.getMove === 'function') {
      try { const mv = m.getMove(); if (mv?.name) name = mv.name; } catch (_) {}
    }
    if (!name && mId) {
      if (PokeSkip.knownMovesCache[mId]) name = PokeSkip.knownMovesCache[mId];
      const lmName = LineageManager.getMoveName(mId, pokemon);
      if (lmName) name = lmName;
    }
    return {
      slot: idx,
      id: mId ? Number(mId) : null,
      name: name || (mId ? `Move #${mId}` : '')
    };
  });
}

function checkManualMoveReplacement(phase) {
  // Fonctionne UNIQUEMENT si le Mode Avancé, PokéSkip et la proposition automatique sont actifs
  if (!PokeSkip.settings.enabled || !PokeSkip.settings.advancedMode || PokeSkip.settings.promptAutoReplacement === false) return;

  // Si c'est déjà un remplacement automatique effectué par PokéSkip, ne rien demander
  if (phase._pokeskipAutoReplaced) return;

  // Si la capacité a été ignorée (Auto-Skip ou Quick Skip)
  if (phase._pokeskipIgnored) return;

  const pokemon = phase._pokeskipPokemon;
  const initialMoveset = phase._pokeskipInitialMoveset;
  const incoming = phase._pokeskipIncomingMove;

  if (!pokemon || !Array.isArray(initialMoveset) || initialMoveset.length < 4 || !incoming || !incoming.name) {
    return;
  }

  // Petite temporisation pour laisser le moteur Phaser / PokéRogue mettre à jour l'instance du Pokémon
  setTimeout(() => {
    try {
      const postMoveset = snapshotMoveset(pokemon);
      if (!postMoveset || postMoveset.length === 0) return;

      const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, '');
      const incNorm = normalize(incoming.name);
      const incId = incoming.id ? Number(incoming.id) : null;

      // 1. Vérifier si la nouvelle attaque est présente dans le nouveau moveset
      const learnedIncomingIndex = postMoveset.findIndex(m => {
        if (!m) return false;
        if (incId && m.id && Number(m.id) === incId) return true;
        if (incNorm && normalize(m.name) === incNorm) return true;
        return false;
      });

      // Si l'attaque n'est pas dans le moveset post-phase, le joueur n'a pas appris l'attaque (annulé/refusé)
      if (learnedIncomingIndex === -1) return;

      // 2. Identifier l'attaque qui a été remplacée
      let replacedMove = null;
      const chosenSlot = phase._pokeskipChosenSlotIndex;

      if (chosenSlot !== undefined && chosenSlot !== null && initialMoveset[chosenSlot]) {
        replacedMove = initialMoveset[chosenSlot];
      } else if (initialMoveset[learnedIncomingIndex]) {
        replacedMove = initialMoveset[learnedIncomingIndex];
      } else {
        // Déduction par différence d'ensemble : l'attaque qui était là avant mais n'y est plus
        replacedMove = initialMoveset.find(oldM => {
          if (!oldM) return false;
          const oldNorm = normalize(oldM.name);
          const oldId = oldM.id ? Number(oldM.id) : null;
          const stillPresent = postMoveset.some(newM => {
            if (!newM) return false;
            if (oldId && newM.id && Number(newM.id) === oldId) return true;
            if (oldNorm && normalize(newM.name) === oldNorm) return true;
            return false;
          });
          return !stillPresent;
        });
      }

      if (!replacedMove || !replacedMove.name) return;
      if (normalize(replacedMove.name) === incNorm) return;

      // 3. Vérifier si cette règle exacte existe déjà pour cette lignée
      const existingRules = PokeSkip.getFamilyReplacements(pokemon);
      const repOldNorm = normalize(replacedMove.name);
      const repOldId = replacedMove.id ? Number(replacedMove.id) : null;

      const ruleExists = existingRules.some(r => {
        if (!r) return false;
        const rNewNorm = normalize(r.newMoveName);
        const rOldNorm = normalize(r.oldMoveName);
        const rNewId = r.newMoveId ? Number(r.newMoveId) : null;
        const rOldId = r.oldMoveId ? Number(r.oldMoveId) : null;

        const newMatches = (incId && rNewId && rNewId === incId) || (incNorm && rNewNorm === incNorm);
        const oldMatches = (repOldId && rOldId && rOldId === repOldId) || (repOldNorm && rOldNorm === repOldNorm);
        return newMatches && oldMatches;
      });

      if (ruleExists) {
        return;
      }

      // 4. Afficher le toast d'action demandant si l'on souhaite enregistrer ce remplacement automatique
      const currentPokemonName = LineageManager.getCurrentFormName(pokemon);
      const message = t('toast_save_manual_rep', {
        oldMove: `<b>${replacedMove.name}</b>`,
        newMove: `<b>${incoming.name}</b>`,
        pokemon: `<b>${currentPokemonName}</b>`
      });

      console.log(`💡 [PokéSkip] Remplacement manuel détecté : "${replacedMove.name}" -> "${incoming.name}" sur ${currentPokemonName}. Proposition d'enregistrement.`);

      UI.showActionToast(
        message,
        t('toast_save_btn'),
        () => {
          PokeSkip.addReplacementRule(
            pokemon,
            incoming.name,
            replacedMove.name,
            incoming.id,
            replacedMove.id
          );
          UI.showToast(
            `✅ Règle enregistrée : <b>${replacedMove.name}</b> ➜ <b>${incoming.name}</b> sur <b>${currentPokemonName}</b> !`,
            'success',
            3500
          );
          UI.updateHudBadge();
          if (UI.isModalOpen()) {
            const teamBody = document.getElementById('pokeskip-body-team');
            if (teamBody && teamBody.style.display !== 'none' && typeof UI.renderTeamTab === 'function') {
              UI.renderTeamTab();
            }
            const savedBody = document.getElementById('pokeskip-body-saved');
            if (savedBody && savedBody.style.display !== 'none' && typeof UI.renderSavedSpeciesList === 'function') {
              UI.renderSavedSpeciesList();
            }
          }
        },
        Math.max(3, PokeSkip.settings?.autoReplacementPromptDuration || 10) * 1000,
        'advanced'
      );
    } catch (err) {
      console.error('[PokéSkip] Erreur lors de la détection du remplacement manuel :', err);
    }
  }, 120);
}

function hookLearnMovePhasePrototype(proto) {
  if (!proto || proto._pokeskipHooked) return;
  proto._pokeskipHooked = true;

  // Interception de learnMove pour capturer le slot choisi manuellement
  if (typeof proto.learnMove === 'function' && !proto._pokeskipHookedLearnMove) {
    const origLearnMove = proto.learnMove;
    proto.learnMove = function (slotIndex, ...args) {
      this._pokeskipChosenSlotIndex = slotIndex;
      return origLearnMove.apply(this, arguments);
    };
    proto._pokeskipHookedLearnMove = true;
  }

  // Fermeture automatique du prompt dès que LearnMovePhase se termine
  const origEnd = proto.end;
  if (typeof origEnd === 'function') {
    proto.end = function () {
      UI.dismissQuickSkipPrompt();
      if (this._pokeskipEnded) return origEnd.apply(this, arguments);
      this._pokeskipEnded = true;
      if (typeof this._restoreUi === 'function') {
        this._restoreUi();
      }

      checkManualMoveReplacement(this);

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

    const moveName = move?.name || (moveId !== undefined ? LineageManager.getMoveName(moveId, pokemon) : `Move #${moveId || '?'}`);

    // Snapshot pour détection du remplacement manuel si le joueur choisit une attaque
    phase._pokeskipPokemon = pokemon;
    phase._pokeskipIncomingMove = { id: moveId, name: moveName };
    phase._pokeskipInitialMoveset = snapshotMoveset(pokemon);

    if (typeof phase.learnMove === 'function' && !phase._pokeskipHookedInstanceLearnMove) {
      const origInstLearnMove = phase.learnMove;
      phase.learnMove = function (slotIndex, ...args) {
        phase._pokeskipChosenSlotIndex = slotIndex;
        return origInstLearnMove.apply(this, arguments);
      };
      phase._pokeskipHookedInstanceLearnMove = true;
    }

    // learnMoveType: 0 = LEARN_MOVE (montée de niveau / évolution), 1 = MEMORY, 2 = TM
    const isLevelUpMove = phase.learnMoveType === 0 || phase.learnMoveType === undefined;

    if (PokeSkip.settings.enabled && isLevelUpMove && pokemon) {
      const familyInfo = LineageManager.getFamilyInfo(pokemon);

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
          phase._pokeskipAutoReplaced = true;
          console.log(`🔄 [PokéSkip] Remplacement auto : "${replacement.oldMoveName}" -> "${moveName}" sur ${familyInfo.lineageName} (slot ${targetMoveIndex})`);

          if (typeof UI.dismissQuickSkipPrompt === 'function') {
            UI.dismissQuickSkipPrompt();
          }

          PokeSkip.recordSkip();

          if (PokeSkip.settings.showToasts) {
            const currentPokemonName = LineageManager.getCurrentFormName(pokemon);
            const toastKey = replacement.isUniversal ? 'toast_universal_auto_replaced' : 'toast_auto_replaced';
            UI.showToast(
              t(toastKey, {
                newMove: moveName,
                oldMove: replacement.oldMoveName,
                pokemon: currentPokemonName
              }),
              replacement.isUniversal ? 'advanced' : 'info',
              PokeSkip.settings.toastDuration || 3000
            );
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
        phase._pokeskipIgnored = true;
        console.log(`🛡️ [PokéSkip] Auto-Skip activé pour "${moveName}" sur ${familyInfo.lineageName} !`);
        PokeSkip.recordSkip();

        if (PokeSkip.settings.showToasts) {
          const currentPokemonName = LineageManager.getCurrentFormName(pokemon);
          UI.showToast(`🛡️ Capacité <b>${moveName}</b> ignorée pour <b>${currentPokemonName}</b> !`, 'info', PokeSkip.settings.toastDuration);
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
