// Hooks sur le moteur de jeu Phaser et interception des phases d'apprentissage
import { PokeSkip } from '../core/state.js';
import { LineageManager } from '../core/lineage-manager.js';
import { UI } from '../ui/index.js';
import { PokeStorage } from '../core/storage.js';
import { STATS_KEY } from '../constants/storage-keys.js';

export function findPhaserScene() {
  const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  try {
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
  const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
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
}

function applyPhaseManagerHooks(scene) {
  const pm = scene.phaseManager;
  if (!pm) return;

  function inspectPhase(phase) {
    if (!phase) return;
    if (phase.phaseName === 'LearnMovePhase' || phase.is?.('LearnMovePhase')) {
      hookLearnMovePhasePrototype(Object.getPrototypeOf(phase));
    }
  }

  if (pm.unshiftPhase && !pm._pokeskipHookedUnshift) {
    const origUnshift = pm.unshiftPhase.bind(pm);
    pm.unshiftPhase = function (phase) {
      inspectPhase(phase);
      return origUnshift(phase);
    };
    pm._pokeskipHookedUnshift = true;
  }

  if (pm.pushPhase && !pm._pokeskipHookedPush) {
    const origPush = pm.pushPhase.bind(pm);
    pm.pushPhase = function (phase) {
      inspectPhase(phase);
      return origPush(phase);
    };
    pm._pokeskipHookedPush = true;
  }

  const currentPhase = pm.getCurrentPhase ? pm.getCurrentPhase() : (pm.currentPhase || pm.phase);
  if (currentPhase) inspectPhase(currentPhase);
}

function hookLearnMovePhasePrototype(proto) {
  if (!proto || proto._pokeskipHooked) return;
  proto._pokeskipHooked = true;

  const origStart = proto.start;
  proto.start = function () {
    const pokemon = this.pokemon;
    const move = this.move;
    const moveId = this.moveId;

    if (pokemon) {
      const familyInfo = LineageManager.getFamilyInfo(pokemon);
      const famKey = familyInfo.familyKey;
      const moveName = move?.name || (moveId !== undefined ? LineageManager.getMoveName(moveId) : 'Capacité');
      const isCandidate = PokeSkip.isMoveCandidateToSkip(pokemon, moveName, moveId);
      const isAutoReplaced = PokeSkip.isMoveAutoReplaced(pokemon, moveName, moveId);

      if (isAutoReplaced) {
        console.log(`⚡ [PokéSkip] Remplacement auto de "${moveName}" prévu via quick prompt / confirmation !`);
      } else if (isCandidate) {
        console.log(`🛡️ [PokéSkip] Capacité candidate au skip : "${moveName}" pour ${familyInfo.lineageName}`);
      }
    }

    if (origStart) {
      return origStart.apply(this, arguments);
    }
  };

  const origReplaceMoveCheck = proto.replaceMoveCheck;
  if (!origReplaceMoveCheck) return;

  proto.replaceMoveCheck = async function () {
    const pokemon = this.pokemon;
    const move = this.move;
    const moveId = this.moveId;

    if (!pokemon) {
      return origReplaceMoveCheck.apply(this, arguments);
    }

    const familyInfo = LineageManager.getFamilyInfo(pokemon);
    const famKey = familyInfo.familyKey;
    const moveName = move?.name || (moveId !== undefined ? LineageManager.getMoveName(moveId) : 'Capacité');

    // Cas 1 : Remplacement automatique configuré
    const replacement = PokeSkip.findActiveReplacement(pokemon, moveName, moveId);
    if (replacement && PokeSkip.settings.enabled) {
      const currentMoveset = (typeof pokemon.getMoveset === 'function')
        ? pokemon.getMoveset()
        : (pokemon.moveset || []);

      const targetMoveIndex = currentMoveset.findIndex(m => {
        if (!m) return false;
        const name = (typeof m.getName === 'function' ? m.getName() : (m.name || '')).trim().toLowerCase();
        if (replacement.oldMoveName && name === replacement.oldMoveName.trim().toLowerCase()) return true;
        if (replacement.oldMoveId && m.moveId === replacement.oldMoveId) return true;
        return false;
      });

      if (targetMoveIndex !== -1) {
        console.log(`🔄 [PokéSkip] Remplacement automatique déclenché : "${replacement.oldMoveName}" -> "${moveName}" (slot ${targetMoveIndex})`);

        this.applyMove(targetMoveIndex);

        PokeSkip.stats.totalSkipped = (PokeSkip.stats.totalSkipped || 0) + 1;
        PokeSkip.stats.recentSkips = PokeSkip.stats.recentSkips || [];
        PokeSkip.stats.recentSkips.unshift({
          pokemonName: familyInfo.lineageName,
          moveName: `${moveName} (remplace ${replacement.oldMoveName})`,
          timestamp: Date.now()
        });
        if (PokeSkip.stats.recentSkips.length > 50) PokeSkip.stats.recentSkips.pop();
        PokeStorage.set(STATS_KEY, PokeSkip.stats);

        UI.showToast(`🔄 [PokéSkip] <b>${moveName}</b> a automatiquement remplacé <b>${replacement.oldMoveName}</b> !`, 'info', 3000);
        UI.updateHudBadge();

        this.end();
        return;
      }
    }

    // Cas 2 : Skip automatique configuré
    if (PokeSkip.shouldSkip(pokemon, moveName, moveId)) {
      console.log(`🛡️ [PokéSkip] Auto-Skip activé pour "${moveName}" sur ${familyInfo.lineageName} !`);

      PokeSkip.stats.totalSkipped = (PokeSkip.stats.totalSkipped || 0) + 1;
      PokeSkip.stats.recentSkips = PokeSkip.stats.recentSkips || [];
      PokeSkip.stats.recentSkips.unshift({
        pokemonName: familyInfo.lineageName,
        moveName: moveName,
        timestamp: Date.now()
      });
      if (PokeSkip.stats.recentSkips.length > 50) PokeSkip.stats.recentSkips.pop();
      PokeStorage.set(STATS_KEY, PokeSkip.stats);

      if (PokeSkip.settings.showToasts) {
        UI.showToast(`🛡️ Capacité <b>${moveName}</b> ignorée pour <b>${familyInfo.lineageName}</b> !`, 'info', PokeSkip.settings.toastDuration);
      }
      UI.updateHudBadge();

      this.end();
      return;
    }

    // Cas 3 : Quick Skip Prompt si la capacité n'est pas déjà dans les règles
    if (PokeSkip.settings.showQuickPrompt && PokeSkip.settings.enabled) {
      const phase = this;
      let uiOriginalMode = null;
      let uiOriginalHandler = null;

      const scene = phase.scene || PokeSkip.scene || window.globalScene;
      const gameUi = scene?.ui;

      if (gameUi) {
        uiOriginalMode = typeof gameUi.getMode === 'function' ? gameUi.getMode() : gameUi.mode;
        uiOriginalHandler = typeof gameUi.getHandler === 'function' ? gameUi.getHandler() : gameUi.handler;
      }

      UI.showQuickSkipPrompt(pokemon, move, phase, () => {
        console.log(`[PokéSkip QuickPrompt] Capacité "${moveName}" ignorée via quick prompt.`);
        PokeSkip.addMoveToSkip(pokemon, moveName, moveId);
        UI.showToast(`🛡️ <b>${moveName}</b> ajoutée aux règles et ignorée !`, 'success', 2500);
        UI.updateHudBadge();
        phase.end();
      });

      const restoreUi = () => {
        UI.dismissQuickSkipPrompt();
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
