// Widget de confirmation rapide in-game (Quick Prompt)
import { PokeSkip } from '../core/state.js';
import { LineageManager } from '../core/lineage-manager.js';
import { UI } from './index.js';

export const QuickPrompt = {
    dismissQuickSkipPrompt() {
      const el = document.getElementById('pokeskip-quick-prompt');
      if (el && el.parentNode) {
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -15px)';
        el.style.transition = 'all 0.2s ease';
        setTimeout(() => {
          if (el && el.parentNode) el.remove();
        }, 200);
      }
    },

    showQuickSkipPrompt(arg1, arg2, arg3) {
      if (!document.body) return;

      let phaseInstance, pokemon, move;
      if (arg1 && typeof arg1.end === 'function') {
        phaseInstance = arg1;
        pokemon = arg2;
        move = arg3;
      } else if (arg3 && typeof arg3.end === 'function') {
        pokemon = arg1;
        move = arg2;
        phaseInstance = arg3;
      } else if (arg1?.species || arg1?.speciesId) {
        pokemon = arg1;
        move = arg2;
        phaseInstance = arg3;
      } else {
        phaseInstance = arg1;
        pokemon = arg2;
        move = arg3;
      }

      if (document.getElementById('pokeskip-quick-prompt')) {
        document.getElementById('pokeskip-quick-prompt').remove();
      }

      const pokemonName = LineageManager.getCurrentFormName(pokemon);
      const moveDetails = LineageManager.getMoveDetails(move, phaseInstance?.moveId, pokemon);
      const moveName = moveDetails?.name || move?.name || (phaseInstance?.moveId !== undefined ? LineageManager.getMoveName(phaseInstance.moveId) : 'Capacité');
      const finalMoveId = phaseInstance?.moveId ?? moveDetails?.moveId ?? move?.id;

      const typeColor = (moveDetails?.type && moveDetails.type.bg) ? (
        moveDetails.type.name === 'Combat' ? '#ea580c' :
        moveDetails.type.name === 'Ténèbres' ? '#c4a482' :
        moveDetails.type.name === 'Poison' ? '#a855f7' :
        moveDetails.type.bg
      ) : '#38bdf8';
      const catIcon = moveDetails?.category?.icon || '🌀';
      const catName = moveDetails?.category?.name || '';
      const typeName = moveDetails?.type?.name || '';
      const tooltip = [typeName, catName].filter(Boolean).join(' • ');

      const el = document.createElement('div');
      el.id = 'pokeskip-quick-prompt';
      el.innerHTML = `
        <span class="pokeskip-quick-text">⚡ Ignorer <span title="${tooltip}">${catIcon} <b style="color: ${typeColor} !important;">${moveName}</b></span> sur <b>${pokemonName}</b> ?</span>
        <button class="pokeskip-quick-btn" id="pokeskip-quick-skip-always">Toujours ignorer</button>
        <button class="pokeskip-quick-close" id="pokeskip-quick-close" title="Fermer">&times;</button>
      `;

      document.body.appendChild(el);

      const dismiss = () => {
        this.dismissQuickSkipPrompt();
      };

      el.querySelector('#pokeskip-quick-close').addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
      });

      el.querySelector('#pokeskip-quick-skip-always').addEventListener('click', (e) => {
        e.stopPropagation();
        PokeSkip.setMoveSkipped(pokemon, pokemon?.species?.name, moveName, finalMoveId, true);
        PokeSkip.recordSkip();

        UI.showToast(`✅ Règle enregistrée : <b>${pokemonName}</b> ignorera <span title="${tooltip}">${catIcon} <b style="color: ${typeColor} !important;">${moveName}</b></span> !`, 'success');
        dismiss();

        // 1. Marquer la phase comme ignorée par PokéSkip
        if (phaseInstance) {
          phaseInstance._pokeskipIgnored = true;
        }

        const scene = phaseInstance?.scene || PokeSkip.scene || window.globalScene;
        const pm = scene?.phaseManager;
        const currentPhase = pm ? (typeof pm.getCurrentPhase === 'function' ? pm.getCurrentPhase() : pm.currentPhase) : null;
        const ui = scene?.ui;

        // Vérifier l'état actuel de l'UI in-game
        const currentMode = ui ? (typeof ui.getMode === 'function' ? ui.getMode() : ui.mode) : null;
        const isConfirmOrSummaryActive = currentMode === 14 || currentMode === 9;

        // VÉRIFICATION DU TEXTE :
        // Déterminer si le texte actuellement affiché est un message d'une autre nature
        // (ex: évolution, montée de niveau, stats) ou bien le message d'apprentissage de cette capacité
        let isOtherNatureMessage = false;
        try {
          const msgHandler = typeof ui?.getMessageHandler === 'function' ? ui.getMessageHandler() : null;
          const currentText = msgHandler?.message?.text || '';
          // Si du texte est présent et qu'il ne mentionne pas le nom de cette capacité, c'est un message d'une autre nature
          if (currentText && moveName && !currentText.includes(moveName)) {
            isOtherNatureMessage = true;
          }
        } catch (err) {}

        // 2. Gestion de l'UI in-game :
        // Si le menu Oui/Non (CONFIRM = 14) ou de sélection des attaques (SUMMARY = 9) était déjà ouvert,
        // on le ferme immédiatement pour ne pas bloquer le joueur
        if (isConfirmOrSummaryActive && ui) {
          try {
            const handler = typeof ui.getHandler === 'function' ? ui.getHandler() : null;
            if (handler && typeof handler.clear === 'function') handler.clear();
            if (ui.handlers && ui.handlers[14] && typeof ui.handlers[14].clear === 'function') {
              ui.handlers[14].clear();
            }
          } catch (err) {}

          const targetMode = phaseInstance?.messageMode ?? 0;
          let ended = false;
          const safeEnd = () => {
            if (ended) return;
            ended = true;
            try {
              if (phaseInstance && typeof phaseInstance.end === 'function') {
                phaseInstance.end();
              }
            } catch (err) {
              console.warn('[PokeSkip] Erreur clôture phase:', err);
            }
          };

          if (typeof ui.setMode === 'function') {
            try {
              ui.setMode(targetMode).then(safeEnd).catch(safeEnd);
              setTimeout(safeEnd, 150);
            } catch (err) {
              safeEnd();
            }
          } else {
            safeEnd();
          }
        } else if (!isOtherNatureMessage && (!currentPhase || currentPhase === phaseInstance || currentPhase.phaseName === 'LearnMovePhase')) {
          // Si ce n'est PAS un message d'une autre nature et qu'on est déjà dans LearnMovePhase,
          // on peut clôturer la phase en toute sécurité
          try {
            if (phaseInstance && typeof phaseInstance.end === 'function') {
              phaseInstance.end();
            }
          } catch (err) {
            console.warn('[PokeSkip] Erreur clôture phase:', err);
          }
        }
      });

      // Reste selon la durée configurée (par défaut 15s) pour laisser le temps de décider
      const durationSec = Math.max(3, PokeSkip.settings.quickPromptDuration || 15);
      setTimeout(() => {
        dismiss();
      }, durationSec * 1000);
    }
};
