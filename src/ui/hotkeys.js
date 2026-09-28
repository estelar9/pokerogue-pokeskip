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
        }
      });

      document.addEventListener('focusin', (e) => {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
          this.disableGameKeyboard();
        }
      }, true);

      document.addEventListener('focusout', (e) => {
        if (!this.isModalOpen()) {
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
