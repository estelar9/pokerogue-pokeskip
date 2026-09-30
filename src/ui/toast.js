// Système de toasts / notifications éphémères
import { PokeSkip } from '../core/state.js';

export const Toast = {
    createToastContainer() {
      if (!document.body) return null;
      let el = document.getElementById('pokeskip-toasts');
      if (!el) {
        el = document.createElement('div');
        el.id = 'pokeskip-toasts';
        document.body.appendChild(el);
      }
      this.toastContainer = el;
      return el;
    },

    showToast(message, type = 'info', duration = (PokeSkip.settings?.toastDuration || 2800)) {
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', () => this.showToast(message, type, duration), { once: true });
        return;
      }

      const container = this.createToastContainer() || document.getElementById('pokeskip-toasts');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `pokeskip-toast ${type}`;
      toast.innerHTML = typeof message === 'string' ? message.replace(/\[PokéSkip\]\s*/gi, '') : message;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          if (toast && toast.parentNode) toast.remove();
        }, 250);
      }, duration);
    },
};
