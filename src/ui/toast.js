// Système de toasts / notifications éphémères
import { PokeSkip } from '../core/state.js';

export const Toast = {
    createToastContainer() {
      if (document.getElementById('pokeskip-toasts')) return;
      const el = document.createElement('div');
      el.id = 'pokeskip-toasts';
      document.body.appendChild(el);
      this.toastContainer = el;
    },

    showToast(message, type = 'info', duration = (PokeSkip.settings?.toastDuration || 2800)) {
      this.createToastContainer();
      const toast = document.createElement('div');
      toast.className = `pokeskip-toast ${type}`;
      toast.innerHTML = message;
      this.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 250);
      }, duration);
    },
};
