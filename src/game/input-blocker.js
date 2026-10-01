// Gestion et isolation des événements clavier Phaser & champs de saisie
import { PokeSkip } from '../core/state.js';
import { findPhaserScene } from './phaser-hook.js';

export function disableGameKeyboard() {
  try {
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const found = typeof findPhaserScene === 'function' ? findPhaserScene() : null;
    const sc = found?.scene || PokeSkip.scene || win.globalScene;
    const game = found?.game || sc?.game;

    if (game?.scene?.scenes && Array.isArray(game.scene.scenes)) {
      game.scene.scenes.forEach(s => {
        if (s?.input?.keyboard) {
          s.input.keyboard.enabled = false;
          if (typeof s.input.keyboard.resetKeys === 'function') {
            s.input.keyboard.resetKeys();
          }
        }
      });
    }

    if (sc?.input?.keyboard) {
      sc.input.keyboard.enabled = false;
      if (typeof sc.input.keyboard.resetKeys === 'function') {
        sc.input.keyboard.resetKeys();
      }
    }
    if (game?.input?.keyboard) {
      game.input.keyboard.enabled = false;
      if (typeof game.input.keyboard.resetKeys === 'function') {
        game.input.keyboard.resetKeys();
      }
    }
  } catch (err) {
    console.warn('[PokéSkip] Erreur désactivation clavier Phaser:', err);
  }
}

export function enableGameKeyboard() {
  try {
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const found = typeof findPhaserScene === 'function' ? findPhaserScene() : null;
    const sc = found?.scene || PokeSkip.scene || win.globalScene;
    const game = found?.game || sc?.game;

    if (game?.scene?.scenes && Array.isArray(game.scene.scenes)) {
      game.scene.scenes.forEach(s => {
        if (s?.input?.keyboard) {
          s.input.keyboard.enabled = true;
          if (typeof s.input.keyboard.resetKeys === 'function') {
            s.input.keyboard.resetKeys();
          }
        }
      });
    }

    if (sc?.input?.keyboard) {
      sc.input.keyboard.enabled = true;
      if (typeof sc.input.keyboard.resetKeys === 'function') {
        sc.input.keyboard.resetKeys();
      }
    }
    if (game?.input?.keyboard) {
      game.input.keyboard.enabled = true;
      if (typeof game.input.keyboard.resetKeys === 'function') {
        game.input.keyboard.resetKeys();
      }
    }

    // Refocaliser le canvas de jeu Phaser pour que les touches de direction/action soient actives
    const canvas = document.querySelector('#app canvas') || document.querySelector('canvas');
    if (canvas) {
      if (!canvas.hasAttribute('tabindex')) {
        canvas.setAttribute('tabindex', '0');
      }
      try {
        canvas.focus();
      } catch (_) {}
    }
  } catch (err) {
    console.warn('[PokéSkip] Erreur réactivation clavier Phaser:', err);
  }
}

export function isolateInputs(container) {
  if (!container) return;
  const elements = container.querySelectorAll('input, select, textarea');
  elements.forEach(el => {
    if (el._pksIsolated) return;
    el._pksIsolated = true;
    ['keydown', 'keyup', 'keypress'].forEach(type => {
      el.addEventListener(type, (e) => {
        e.stopPropagation();
      });
    });
  });
}
