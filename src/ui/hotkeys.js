// Raccourcis clavier globaux (F2, Alt+S, Echap)
import { PokeSkip } from '../core/state.js';
import { UI } from './index.js';

export const Hotkeys = {
    bindHotkeys() {
      window.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable);

        if (e.key === 'p' || e.key === 'P') {
          if (isInput) return;
          if (e.repeat) return;
          e.stopPropagation();
          e.preventDefault();
          this.toggleModal();
        } else if (e.key === 't' || e.key === 'T') {
          if (isInput) return;
          if (e.repeat) return;
          e.stopPropagation();
          e.preventDefault();
          this.toggleTypeChart();
        } else if (e.key === 'Escape') {
          if (this.typeChartContainer && this.typeChartContainer.style.display === 'flex') {
            e.stopPropagation();
            e.preventDefault();
            this.hideTypeChart();
          } else if (this.modalContainer && this.modalContainer.classList.contains('active')) {
            e.stopPropagation();
            e.preventDefault();
            this.closeModal();
          }
        } else if (this.isModalOpen()) {
          // Sécurité absolue : empêcher toute fuite de touches vers PokéRogue quand PokéSkip est ouvert
          if (!isInput) {
            e.stopPropagation();
          }
        }
      });

      const isPokeSkipElement = (el) => {
        if (!el || typeof el.closest !== 'function') return false;
        return !!(el.closest('#pokeskip-modal') ||
                  el.closest('#pokeskip-type-chart') ||
                  el.closest('#pokeskip-quick-prompt') ||
                  el.closest('#pokeskip-hud') ||
                  el.closest('.pokeskip-container'));
      };

      document.addEventListener('focusin', (e) => {
        const t = e.target;
        if (t && isPokeSkipElement(t) && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
          this.disableGameKeyboard();
        }
      }, true);

      document.addEventListener('focusout', (e) => {
        const t = e.target;
        if (t && isPokeSkipElement(t) && !this.isModalOpen()) {
          this.enableGameKeyboard();
        }
      }, true);

      window.addEventListener('resize', () => {
        this.applyHudPosition(this.hudContainer || document.getElementById('pokeskip-hud'));
        if (this.typeChartContainer && this.typeChartContainer.style.display === 'flex') {
          this.updateTypeChartResponsiveScale();
        }
      });
    },
};
