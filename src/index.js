// ============================================================================
// PokéSkip — Auto-Skip Sélectif des Capacités pour PokéRogue
// Orchestrateur principal & Point d'entrée
// ============================================================================

import { AssetLoader } from './core/asset-loader.js';
import { LineageManager } from './core/lineage-manager.js';
import { PokeSkip } from './core/state.js';
import { UI } from './ui/index.js';
import { initGameHook } from './game/phaser-hook.js';

(function () {
  'use strict';

  if (window.__POKESKIP_INJECTED__) {
    console.log('[PokéSkip] Le plugin est déjà actif sur cette page !');
    return;
  }
  window.__POKESKIP_INJECTED__ = true;
  window.PokeSkip = PokeSkip;
  window.PokeSkipUI = UI;

  // Initialisation des données et caches
  AssetLoader.init();
  LineageManager.init();

  // --- DÉTECTION DE L'ENVIRONNEMENT POKÉROGUE ---
  function isPokerogueEnvironment() {
    // 1. Exclure la page de démo / simulateur intégrée de PokéSkip si ouverte en local
    if (document.getElementById('demo-team-tabs') || document.getElementById('demo-stats-counter')) {
      return false;
    }

    const host = (window.location.hostname || '').toLowerCase();
    const href = (window.location.href || '').toLowerCase();
    const title = (document.title || '').toLowerCase();

    // 2. Domaines officiels PokéRogue
    if (host === 'pokerogue.net' || host.endsWith('.pokerogue.net')) {
      return true;
    }

    // 3. Exclure explicitement les moteurs de recherche et sites tiers
    if (host.includes('google.') || host.includes('bing.') || host.includes('duckduckgo.') || host.includes('github.com')) {
      return false;
    }

    // 4. Sur localhost / 127.0.0.1 (développement ou jeu local)
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
      if (title.includes('pokerogue')) return true;
      const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
      if (win.Phaser || document.querySelector('#app canvas')) return true;
      return false;
    }

    // 5. Client Desktop Tauri / RogueTop
    if (typeof window !== 'undefined' && (window.__TAURI__ || window.__TAURI_INTERNALS__)) {
      return true;
    }

    // 6. Autre domaine personnalisé ou miroir local (ex: pokerogue.local, pokerogue.lan)
    if (host.includes('pokerogue')) {
      return true;
    }

    // 7. Chemin ou titre contenant pokerogue
    if (href.includes('pokerogue') && title.includes('pokerogue')) {
      return true;
    }

    return false;
  }

  let pokeSkipStarted = false;
  function startPokeSkip() {
    if (pokeSkipStarted) return;
    pokeSkipStarted = true;
    UI.init();
    initGameHook();
  }

  function setupAutoDetection() {
    if (isPokerogueEnvironment()) {
      startPokeSkip();
      return;
    }

    // Si on est sur localhost/127.0.0.1 mais que le DOM/Phaser n'était pas encore prêt à l'instant T,
    // on effectue une brève surveillance (max 8 secondes) avant d'abandonner définitivement.
    const host = (window.location.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
      let attempts = 0;
      const maxAttempts = 8;
      const checkInterval = setInterval(() => {
        attempts++;
        if (isPokerogueEnvironment()) {
          clearInterval(checkInterval);
          startPokeSkip();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          // Cette page localhost n'est pas PokéRogue : PokéSkip reste complètement éteint.
        }
      }, 1000);
    }
  }

  // --- INITIALISATION AU CHARGEMENT ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupAutoDetection();
    });
  } else {
    setupAutoDetection();
  }
})();
