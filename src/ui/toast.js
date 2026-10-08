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

      let cleanMsg = typeof message === 'string' ? message.replace(/\[PokéSkip\]\s*/gi, '') : message;
      if (typeof cleanMsg === 'string' && cleanMsg.includes(' / ')) {
        // Remplacer toute séquence de noms séparés par des slashes par uniquement le premier
        cleanMsg = cleanMsg.replace(/<b>([^<]*?\s*\/\s*[^<]*?)<\/b>/g, (match, p1) => {
          const first = p1.split(/\s*\/\s*/)[0].trim();
          return `<b>${first}</b>`;
        });
      }

      const toast = document.createElement('div');
      toast.className = `pokeskip-toast ${type}`;
      toast.innerHTML = cleanMsg;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          if (toast && toast.parentNode) toast.remove();
        }, 250);
      }, duration);
    },

    showActionToast(message, actionLabel, onAction, duration = ((PokeSkip.settings?.autoReplacementPromptDuration || 10) * 1000), type = 'advanced', secondaryActionLabel = null, onSecondaryAction = null) {
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', () => this.showActionToast(message, actionLabel, onAction, duration, type, secondaryActionLabel, onSecondaryAction), { once: true });
        return;
      }

      const container = this.createToastContainer() || document.getElementById('pokeskip-toasts');
      if (!container) return;

      let cleanMsg = typeof message === 'string' ? message.replace(/\[PokéSkip\]\s*/gi, '') : message;
      if (typeof cleanMsg === 'string' && cleanMsg.includes(' / ')) {
        cleanMsg = cleanMsg.replace(/<b>([^<]*?\s*\/\s*[^<]*?)<\/b>/g, (match, p1) => {
          const first = p1.split(/\s*\/\s*/)[0].trim();
          return `<b>${first}</b>`;
        });
      }

      const toast = document.createElement('div');
      toast.className = `pokeskip-toast ${type}`;

      const contentWrap = document.createElement('div');
      contentWrap.className = 'pokeskip-toast-action-container';

      const textSpan = document.createElement('span');
      textSpan.innerHTML = cleanMsg;
      contentWrap.appendChild(textSpan);

      const actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.className = 'pokeskip-toast-btn-action';
      actionBtn.innerHTML = actionLabel || 'Enregistrer';
      contentWrap.appendChild(actionBtn);

      let secondaryBtn = null;
      if (secondaryActionLabel) {
        secondaryBtn = document.createElement('button');
        secondaryBtn.type = 'button';
        secondaryBtn.className = 'pokeskip-toast-btn-secondary';
        secondaryBtn.textContent = secondaryActionLabel;
        contentWrap.appendChild(secondaryBtn);
      }

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'pokeskip-toast-btn-close';
      closeBtn.innerHTML = '✕';
      closeBtn.title = 'Fermer';
      contentWrap.appendChild(closeBtn);

      toast.appendChild(contentWrap);
      container.appendChild(toast);

      let hideTimeout = null;
      const dismiss = () => {
        if (hideTimeout) clearTimeout(hideTimeout);
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          if (toast && toast.parentNode) toast.remove();
        }, 250);
      };

      const startTimer = () => {
        if (duration > 0) {
          hideTimeout = setTimeout(dismiss, duration);
        }
      };

      startTimer();

      toast.addEventListener('mouseenter', () => {
        if (hideTimeout) clearTimeout(hideTimeout);
      });
      toast.addEventListener('mouseleave', () => {
        startTimer();
      });

      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
        if (typeof onAction === 'function') {
          try {
            onAction();
          } catch (err) {
            console.error('[PokéSkip] Erreur callback action toast :', err);
          }
        }
      });

      if (secondaryBtn) {
        secondaryBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dismiss();
          if (typeof onSecondaryAction === 'function') {
            try {
              onSecondaryAction();
            } catch (err) {
              console.error('[PokéSkip] Erreur callback action secondaire toast :', err);
            }
          }
        });
      }

      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
      });
    },
};
