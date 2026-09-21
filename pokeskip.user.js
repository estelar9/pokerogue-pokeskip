// ==UserScript==
// @name         PokéSkip — Auto-Skip Sélectif des Capacités pour PokéRogue
// @namespace    https://github.com/pokeskip/pokeskip
// @version      1.1.0
// @description  Choisis pour chaque Pokémon de ton équipe quelles futures capacités ignorer automatiquement lors des montées de niveau. Affiche type, catégorie, puissance, PP et description. Sauvegarde éternelle par espèce !
// @author       PokéSkip Team
// @match        https://pokerogue.net/*
// @match        https://beta.pokerogue.net/*
// @match        http://localhost:*/*
// @match        *://*/*pokerogue*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-start
// @icon         https://pokerogue.net/favicon.ico
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'pokeskip_species_rules_v1';
  const SETTINGS_KEY = 'pokeskip_settings_v1';
  const STATS_KEY = 'pokeskip_stats_v1';

  // --- RÉFÉRENTIELS TYPES & CATÉGORIES POKÉMON ---
  const POKEMON_TYPES = [
    { name: 'Normal', color: '#f8fafc', bg: '#64748b' },
    { name: 'Combat', color: '#ffffff', bg: '#b91c1c' },
    { name: 'Vol', color: '#ffffff', bg: '#2563eb' },
    { name: 'Poison', color: '#ffffff', bg: '#7e22ce' },
    { name: 'Sol', color: '#ffffff', bg: '#b45309' },
    { name: 'Roche', color: '#ffffff', bg: '#78350f' },
    { name: 'Insecte', color: '#ffffff', bg: '#4d7c0f' },
    { name: 'Spectre', color: '#ffffff', bg: '#581c87' },
    { name: 'Acier', color: '#ffffff', bg: '#475569' },
    { name: 'Feu', color: '#ffffff', bg: '#dc2626' },
    { name: 'Eau', color: '#ffffff', bg: '#0284c7' },
    { name: 'Plante', color: '#ffffff', bg: '#16a34a' },
    { name: 'Électrik', color: '#0f172a', bg: '#eab308' },
    { name: 'Psy', color: '#ffffff', bg: '#db2777' },
    { name: 'Glace', color: '#0f172a', bg: '#38bdf8' },
    { name: 'Dragon', color: '#ffffff', bg: '#4338ca' },
    { name: 'Ténèbres', color: '#ffffff', bg: '#27272a' },
    { name: 'Fée', color: '#ffffff', bg: '#be185d' },
    { name: 'Stellaire', color: '#ffffff', bg: '#4f46e5' }
  ];

  const MOVE_CATEGORIES = [
    { name: 'Physique', icon: '💥', color: '#f87171' },
    { name: 'Spéciale', icon: '✨', color: '#60a5fa' },
    { name: 'Statut', icon: '🌀', color: '#94a3b8' }
  ];

  // --- CROSS-BROWSER STORAGE WRAPPER ---
  const Storage = {
    get(key, defaultValue) {
      try {
        if (typeof GM_getValue === 'function') {
          const val = GM_getValue(key);
          if (val !== undefined) return JSON.parse(val);
        }
      } catch (e) {}
      try {
        const localVal = localStorage.getItem(key);
        if (localVal !== null) return JSON.parse(localVal);
      } catch (e) {}
      return defaultValue;
    },
    set(key, value) {
      const json = JSON.stringify(value);
      try {
        if (typeof GM_setValue === 'function') {
          GM_setValue(key, json);
        }
      } catch (e) {}
      try {
        localStorage.setItem(key, json);
      } catch (e) {}
    }
  };

  // --- STATE & STORE ---
  const PokeSkip = {
    rules: Storage.get(STORAGE_KEY, {}),
    settings: Object.assign({
      enabled: true,
      showToasts: true,
      toastDuration: 2800,
      soundFeedback: false,
      showQuickPrompt: true,
      quickPromptDuration: 15
    }, Storage.get(SETTINGS_KEY, {})),
    stats: Storage.get(STATS_KEY, {
      totalSkipped: 0
    }),
    game: null,
    scene: null,
    hooked: false,
    activeParty: [],
    knownMovesCache: {},

    saveRules() {
      Storage.set(STORAGE_KEY, this.rules);
    },
    saveSettings() {
      Storage.set(SETTINGS_KEY, this.settings);
    },
    saveStats() {
      Storage.set(STATS_KEY, this.stats);
    },

    getSpeciesRule(speciesId) {
      if (!speciesId) return null;
      return this.rules[speciesId] || null;
    },

    isMoveSkipped(speciesId, moveName, moveId) {
      if (!this.settings.enabled) return false;
      const rule = this.getSpeciesRule(speciesId);
      if (!rule) return false; // Par défaut : RIEN n'est skip !
      if (rule.skipAll) return true;
      if (!rule.skippedMoves) return false;

      if (moveName && rule.skippedMoves[moveName.trim().toLowerCase()]) return true;
      if (moveId && rule.skippedMoves[`id_${moveId}`]) return true;

      return false;
    },

    setMoveSkipped(speciesId, speciesName, moveName, moveId, isSkipped) {
      if (!speciesId) return;
      if (!this.rules[speciesId]) {
        this.rules[speciesId] = {
          speciesId: speciesId,
          speciesName: speciesName || `Espèce #${speciesId}`,
          skippedMoves: {},
          skipAll: false,
          updatedAt: Date.now()
        };
      }
      const rule = this.rules[speciesId];
      if (speciesName && (!rule.speciesName || rule.speciesName.startsWith('Espèce #'))) {
        rule.speciesName = speciesName;
      }

      const key = moveName ? moveName.trim().toLowerCase() : `id_${moveId}`;
      if (isSkipped) {
        rule.skippedMoves[key] = true;
        if (moveId) rule.skippedMoves[`id_${moveId}`] = true;
      } else {
        delete rule.skippedMoves[key];
        if (moveId) delete rule.skippedMoves[`id_${moveId}`];
      }
      rule.updatedAt = Date.now();
      this.saveRules();
    },

    deleteSpeciesRule(speciesId) {
      if (this.rules[speciesId]) {
        delete this.rules[speciesId];
        this.saveRules();
      }
    }
  };

  // --- GAME ENGINE HOOKS ---
  function initGameHook() {
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    function findPhaserScene() {
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

    function checkAndHook() {
      if (PokeSkip.hooked) return;

      const found = findPhaserScene();
      if (!found) {
        setTimeout(checkAndHook, 800);
        return;
      }

      PokeSkip.game = found.game;
      PokeSkip.scene = found.scene;
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
  }

  function hookLearnMovePhasePrototype(proto) {
    if (!proto || proto._pokeskipHooked) return;
    proto._pokeskipHooked = true;

    // Fermeture automatique du prompt dès que LearnMovePhase se termine (évite tout débordement sur la phase de récompense)
    const origEnd = proto.end;
    if (typeof origEnd === 'function') {
      proto.end = function () {
        UI.dismissQuickSkipPrompt();
        return origEnd.apply(this, arguments);
      };
    }

    const origReplaceMoveCheck = proto.replaceMoveCheck;
    proto.replaceMoveCheck = async function (move, pokemon) {
      if (move && move.id && move.name) {
        PokeSkip.knownMovesCache[move.id] = move.name;
      }

      // learnMoveType: 0 = LEARN_MOVE (level up / evolution), 1 = MEMORY, 2 = TM
      const isLevelUpMove = this.learnMoveType === 0 || this.learnMoveType === undefined;

      if (PokeSkip.settings.enabled && isLevelUpMove) {
        const speciesId = pokemon?.species?.speciesId ?? pokemon?.speciesId;
        const speciesName = pokemon?.species?.name || pokemon?.name || 'Pokémon';
        const moveName = move?.name || `Move #${this.moveId}`;

        if (PokeSkip.isMoveSkipped(speciesId, moveName, this.moveId)) {
          PokeSkip.stats.totalSkipped++;
          PokeSkip.saveStats();
          UI.updateHudBadge();

          if (PokeSkip.settings.showToasts) {
            UI.showToast(
              `⏭️ <b>${speciesName}</b> a ignoré <i>${moveName}</i> (Règle mémorisée)`,
              'info',
              PokeSkip.settings.toastDuration
            );
          }

          this.end();
          return;
        }

        // Si l'attaque n'est pas ignorée et l'option activée : proposer le bouton rapide en haut au milieu
        if (PokeSkip.settings.showQuickPrompt !== false) {
          UI.showQuickSkipPrompt(this, pokemon, move);
        }
      }

      return origReplaceMoveCheck.apply(this, arguments);
    };

    console.log('⚡ [PokeSkip] Prototype LearnMovePhase intercepté avec succès.');
  }

  // --- RÉCUPÉRATION COMPLÈTE DES CAPACITÉS FUTURES & ACTUELLES ---
  function getPokemonFullLearnset(pokemon) {
    const moves = [];
    const seenMoveIds = new Set();

    let getMoveFn = null;
    if (pokemon.moveset && pokemon.moveset.length > 0 && typeof pokemon.moveset[0].getMove === 'function') {
      getMoveFn = pokemon.moveset[0].getMove;
    }

    function resolveMove(moveId, level) {
      let moveObj = null;
      if (getMoveFn) {
        try {
          moveObj = getMoveFn.call({ moveId });
        } catch (e) {}
      }

      const name = moveObj?.name || PokeSkip.knownMovesCache[moveId] || `Capacité #${moveId}`;
      const typeIdx = (moveObj && moveObj.type !== undefined) ? moveObj.type : 0;
      const catIdx = (moveObj && moveObj.category !== undefined) ? moveObj.category : 2;
      const power = (moveObj && moveObj.power > 0) ? moveObj.power : '—';
      let accuracyText = '—';
      if (moveObj && moveObj.accuracy !== undefined) {
        if (moveObj.accuracy > 0) {
          accuracyText = `${moveObj.accuracy}%`;
        } else if (moveObj.accuracy < 0) {
          accuracyText = 'Infaillible';
        } else {
          accuracyText = '—';
        }
      }

      const pp = (moveObj && moveObj.pp !== undefined && moveObj.pp > 0) ? moveObj.pp : ((moveObj && moveObj.maxPp) ? moveObj.maxPp : '—');
      const desc = moveObj?.effect || 'Inflige des dégâts ou applique un effet.';

      return {
        moveId,
        level,
        name,
        type: POKEMON_TYPES[typeIdx] || POKEMON_TYPES[0],
        category: MOVE_CATEGORIES[catIdx] || MOVE_CATEGORIES[2],
        power,
        accuracy: accuracyText,
        pp,
        desc
      };
    }

    // 1. Récupérer TOUTES les attaques apprenables par montée de niveau
    let rawLevelMoves = null;
    try {
      if (typeof pokemon.getSpeciesForm === 'function') {
        const sf = pokemon.getSpeciesForm(true);
        if (sf && typeof sf.getLevelMoves === 'function') {
          rawLevelMoves = sf.getLevelMoves();
        }
      }
      if (!rawLevelMoves && pokemon.species && typeof pokemon.species.getLevelMoves === 'function') {
        rawLevelMoves = pokemon.species.getLevelMoves();
      }
    } catch (e) {
      console.warn('[PokeSkip] Erreur getLevelMoves:', e);
    }

    if (rawLevelMoves && Array.isArray(rawLevelMoves)) {
      // Trier par niveau croissant
      const sorted = [...rawLevelMoves].sort((a, b) => a[0] - b[0]);
      for (const entry of sorted) {
        const lvl = entry[0];
        const moveId = entry[1];
        if (!seenMoveIds.has(moveId)) {
          seenMoveIds.add(moveId);
          moves.push(resolveMove(moveId, lvl > 0 ? lvl : (lvl === 0 ? 'Évolution' : 'Départ')));
        }
      }
    }

    // 2. Récupérer les attaques actuelles si non présentes
    if (pokemon.moveset && Array.isArray(pokemon.moveset)) {
      for (const pm of pokemon.moveset) {
        if (pm && pm.moveId && !seenMoveIds.has(pm.moveId)) {
          seenMoveIds.add(pm.moveId);
          const resolved = resolveMove(pm.moveId, 'Actuelle');
          moves.unshift(resolved);
        }
      }
    }

    return moves;
  }

  // --- INTERFACE UTILISATEUR (HUD FLOTTANT & MODAL) ---
  const UI = {
    hudContainer: null,
    modalContainer: null,
    toastContainer: null,
    quickActionElement: null,
    selectedTeamIndex: 0,

    init() {
      this.injectStyles();
      this.createToastContainer();
      this.createHudButton();
      this.createModal();
      this.bindHotkeys();
    },

    injectStyles() {
      const css = `
        #pokeskip-hud {
          position: fixed;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          z-index: 999999;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: none !important;
          backdrop-filter: blur(12px);
          padding: 6px 14px;
          border-radius: 9999px;
          cursor: grab;
          user-select: none;
          transition: border-color 0.2s;
          font-family: system-ui, -apple-system, sans-serif;
          color: #f8fafc;
        }
        #pokeskip-hud:hover {
          border-color: rgba(255, 255, 255, 0.35);
          box-shadow: none !important;
        }
        #pokeskip-hud.dragging {
          cursor: grabbing;
          transition: none !important;
          opacity: 0.85;
          box-shadow: none !important;
        }
        .pokeskip-ball-icon {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
        }
        .pokeskip-ball-center {
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
          border: 2px solid #0f172a;
        }
        .pokeskip-hud-title {
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #ffffff 40%, #bae6fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pokeskip-hud-badge {
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 12px;
          background: rgba(14, 165, 233, 0.25);
          color: #7dd3fc;
          font-weight: 600;
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        /* --- MODAL --- */
        #pokeskip-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(4, 8, 19, 0.78);
          backdrop-filter: blur(8px);
          z-index: 1000000;
          display: none;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #pokeskip-modal-backdrop.active {
          display: flex;
          opacity: 1;
        }
        #pokeskip-modal {
          background: #090e1a;
          border: 1px solid rgba(56, 189, 248, 0.3);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(14, 165, 233, 0.15);
          border-radius: 20px;
          width: 94%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          color: #f1f5f9;
          overflow: hidden;
          animation: pokeskipPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes pokeskipPop {
          0% { transform: scale(0.94); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pokeskip-modal-header {
          padding: 16px 22px;
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.5) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pokeskip-modal-tabs {
          display: flex;
          background: #0d1527;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0 16px;
          gap: 8px;
        }
        .pokeskip-tab-btn {
          padding: 12px 18px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .pokeskip-tab-btn:hover { color: #f8fafc; }
        .pokeskip-tab-btn.active { color: #38bdf8; border-bottom-color: #38bdf8; }
        .pokeskip-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        /* --- TEAM ROW --- */
        .pokeskip-team-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        .pokeskip-member-card {
          background: #111a2e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .pokeskip-member-card:hover {
          background: #16243f;
          border-color: rgba(56, 189, 248, 0.4);
        }
        .pokeskip-member-card.active {
          background: linear-gradient(145deg, #132746 0%, #0c1b33 100%);
          border-color: #38bdf8;
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.25);
        }
        .pokeskip-member-name {
          font-weight: 700;
          font-size: 13px;
          color: #f8fafc;
          margin-top: 4px;
        }
        .pokeskip-member-badge {
          font-size: 10px;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.15);
          padding: 2px 6px;
          border-radius: 6px;
          margin-top: 4px;
        }

        /* --- NOUVEAU DESIGN DES CARTES D'ATTAQUES --- */
        .pokeskip-moves-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .pokeskip-moves-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .pokeskip-move-card {
          background: #111a2e;
          border: 1px solid rgba(56, 189, 248, 0.18);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .pokeskip-move-card:hover {
          background: #16243f;
          border-color: rgba(56, 189, 248, 0.45);
        }
        .pokeskip-move-card.skipped {
          background: rgba(244, 63, 94, 0.08);
          border-color: rgba(244, 63, 94, 0.35);
          opacity: 0.72;
        }
        .pokeskip-move-card.skipped .pokeskip-move-name-txt {
          text-decoration: line-through;
          color: #fda4af;
        }

        .pokeskip-move-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pokeskip-move-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pokeskip-move-lvl-pill {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }
        .pokeskip-move-name-txt {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
        }
        .pokeskip-type-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .pokeskip-cat-tag {
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pokeskip-move-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pokeskip-stat-pill {
          background: #090e1a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          color: #cbd5e1;
          font-weight: 600;
        }
        .pokeskip-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #38bdf8;
        }
        .pokeskip-keep-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          transition: all 0.15s;
        }
        .pokeskip-keep-badge.kept {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.35);
        }
        .pokeskip-keep-badge.skip {
          background: rgba(244, 63, 94, 0.15);
          color: #f43f5e;
          border: 1px solid rgba(244, 63, 94, 0.35);
        }

        .pokeskip-move-desc {
          font-size: 12px;
          line-height: 1.45;
          color: #94a3b8;
          background: rgba(0, 0, 0, 0.25);
          padding: 6px 10px;
          border-radius: 6px;
          border-left: 2px solid rgba(56, 189, 248, 0.4);
        }

        /* --- QUICK SKIP PROMPT (EN HAUT AU MILIEU) --- */
        #pokeskip-quick-prompt {
          position: fixed;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999998;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(244, 63, 94, 0.6);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(244, 63, 94, 0.35);
          backdrop-filter: blur(12px);
          padding: 7px 16px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-size: 13px;
          animation: pokeskipSlideDown 0.25s ease-out;
          pointer-events: auto;
        }
        @keyframes pokeskipSlideDown {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .pokeskip-quick-text {
          white-space: nowrap;
          font-size: 13px;
        }
        .pokeskip-quick-btn {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: #fff;
          border: none;
          padding: 5px 14px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(244, 63, 94, 0.4);
          transition: all 0.15s;
        }
        .pokeskip-quick-btn:hover {
          transform: scale(1.04);
          filter: brightness(1.1);
        }
        .pokeskip-quick-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
          padding: 0 4px;
          transition: color 0.15s;
        }
        .pokeskip-quick-close:hover {
          color: #fff;
        }

        /* --- TOASTS --- */
        #pokeskip-toasts {
          position: fixed;
          top: 65px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000001;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          pointer-events: none;
        }
        .pokeskip-toast {
          background: rgba(15, 23, 42, 0.95);
          border-left: 4px solid #38bdf8;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          padding: 10px 16px;
          border-radius: 8px;
          color: #f8fafc;
          font-size: 13px;
          pointer-events: auto;
          animation: pokeskipSlideIn 0.25s ease-out;
          transition: all 0.25s;
        }
        @keyframes pokeskipSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      const style = document.createElement('style');
      style.id = 'pokeskip-styles';
      style.textContent = css;
      document.head.appendChild(style);
    },

    createToastContainer() {
      if (document.getElementById('pokeskip-toasts')) return;
      const el = document.createElement('div');
      el.id = 'pokeskip-toasts';
      document.body.appendChild(el);
      this.toastContainer = el;
    },

    showToast(message, type = 'info', duration = 2800) {
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

    getPokeballSvg(size = 20) {
      return `
        <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="display:block; flex-shrink:0;">
          <defs>
            <linearGradient id="pksBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
            <linearGradient id="pksWhite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#e2e8f0"/>
            </linearGradient>
          </defs>
          <path d="M 5 50 A 45 45 0 0 1 95 50 Z" fill="url(#pksBlue)"/>
          <path d="M 5 50 A 45 45 0 0 0 95 50 Z" fill="url(#pksWhite)"/>
          <line x1="5" y1="50" x2="95" y2="50" stroke="#0f172a" stroke-width="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#0f172a" stroke-width="8"/>
          <circle cx="50" cy="50" r="14" fill="#0f172a"/>
          <circle cx="50" cy="50" r="8" fill="#ffffff"/>
          <circle cx="50" cy="50" r="3.5" fill="#cbd5e1"/>
        </svg>
      `;
    },

    createHudButton() {
      if (document.getElementById('pokeskip-hud')) return;
      const hud = document.createElement('div');
      hud.id = 'pokeskip-hud';
      hud.title = 'PokéSkip (P) • Glisser-déposer pour déplacer';
      hud.innerHTML = `
        ${this.getPokeballSvg(20)}
        <span class="pokeskip-hud-badge" id="pokeskip-hud-count">0 passée(s)</span>
      `;
      this.makeHudDraggable(hud);
      document.body.appendChild(hud);
      this.hudContainer = hud;
    },

    makeHudDraggable(hud) {
      const savedPos = Storage.get('pokeskip_hud_pos', null);
      if (savedPos && typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
        hud.style.left = `${Math.max(10, Math.min(window.innerWidth - 120, savedPos.x))}px`;
        hud.style.top = `${Math.max(10, Math.min(window.innerHeight - 40, savedPos.y))}px`;
        hud.style.right = 'auto';
        hud.style.transform = 'none';
      }

      let isDragging = false;
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;
      let hasMoved = false;

      hud.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;

        const rect = hud.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        hud.classList.add('dragging');
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasMoved = true;
        }

        const newX = Math.max(10, Math.min(window.innerWidth - hud.offsetWidth - 10, initialLeft + dx));
        const newY = Math.max(10, Math.min(window.innerHeight - hud.offsetHeight - 10, initialTop + dy));

        hud.style.left = `${newX}px`;
        hud.style.top = `${newY}px`;
        hud.style.right = 'auto';
        hud.style.transform = 'none';
      });

      window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        hud.classList.remove('dragging');

        if (hasMoved) {
          const rect = hud.getBoundingClientRect();
          Storage.set('pokeskip_hud_pos', { x: rect.left, y: rect.top });
        }
      });

      hud.addEventListener('click', (e) => {
        if (hasMoved) {
          e.stopPropagation();
          hasMoved = false;
          return;
        }
        this.toggleModal();
      });
    },

    updateHudBadge() {
      const el = document.getElementById('pokeskip-hud-count');
      if (el) el.textContent = `${PokeSkip.stats.totalSkipped} passée(s)`;
    },

    createModal() {
      if (document.getElementById('pokeskip-modal-backdrop')) return;
      const backdrop = document.createElement('div');
      backdrop.id = 'pokeskip-modal-backdrop';
      backdrop.innerHTML = `
        <div id="pokeskip-modal">
          <div class="pokeskip-modal-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${this.getPokeballSvg(22)}
              <h2 style="margin: 0; font-size: 17px; font-weight: 700; color: #fff;">PokéSkip — Gestion des Futures Capacités par Pokémon</h2>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; cursor: pointer;">
                <input type="checkbox" id="pokeskip-toggle-enabled" ${PokeSkip.settings.enabled ? 'checked' : ''} style="accent-color: #38bdf8;">
                Plugin Actif
              </label>
              <button id="pokeskip-modal-close" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; line-height: 1;">&times;</button>
            </div>
          </div>

          <div class="pokeskip-modal-tabs">
            <button class="pokeskip-tab-btn active" data-tab="team">🎮 Équipe Actuelle</button>
            <button class="pokeskip-tab-btn" data-tab="saved">📚 Espèces Mémorisées</button>
            <button class="pokeskip-tab-btn" data-tab="settings">⚙️ Options & Sauvegarde</button>
          </div>

          <div class="pokeskip-modal-body" id="pokeskip-body-team">
            <div id="pokeskip-team-selector" class="pokeskip-team-row"></div>
            <div id="pokeskip-selected-pokemon-content"></div>
          </div>

          <div class="pokeskip-modal-body" id="pokeskip-body-saved" style="display: none;">
            <div id="pokeskip-saved-species-list"></div>
          </div>

          <div class="pokeskip-modal-body" id="pokeskip-body-settings" style="display: none;">
            <div style="max-width: 500px; display: flex; flex-direction: column; gap: 16px;">
              <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 12px;">
                <h4 style="margin: 0 0 2px 0; font-size: 14px; color: #38bdf8;">Notifications & Alertes</h4>
                
                <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
                  <input type="checkbox" id="pokeskip-opt-toasts" ${PokeSkip.settings.showToasts ? 'checked' : ''} style="accent-color: #38bdf8;">
                  Afficher les notifications toast lors d'un auto-skip
                </label>

                <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; display: flex; flex-direction: column; gap: 10px;">
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
                    <input type="checkbox" id="pokeskip-opt-quick-prompt" ${PokeSkip.settings.showQuickPrompt !== false ? 'checked' : ''} style="accent-color: #38bdf8;">
                    Proposer d'ignorer pour toujours une nouvelle attaque en combat
                  </label>
                  
                  <div id="pokeskip-opt-duration-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8; padding-left: 24px; opacity: ${PokeSkip.settings.showQuickPrompt !== false ? '1' : '0.4'};">
                    <span>Durée d'affichage du message rapide :</span>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="number" id="pokeskip-opt-quick-duration" min="3" max="60" value="${PokeSkip.settings.quickPromptDuration || 15}" ${PokeSkip.settings.showQuickPrompt === false ? 'disabled' : ''} style="width: 50px; background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f8fafc; padding: 4px 6px; text-align: center; font-size: 12px;">
                      <span>secondes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #38bdf8;">Exportation / Importation</h4>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8;">Transférez vos règles de skip vers un autre navigateur ou ordinateur.</p>
                <div style="display: flex; gap: 10px;">
                  <button id="pokeskip-btn-export" style="background:#0284c7; color:#fff; border:1px solid #38bdf8; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">📤 Exporter (JSON)</button>
                  <button id="pokeskip-btn-import" style="background:#1e293b; color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">📥 Importer (JSON)</button>
                </div>
              </div>

              <div style="background: rgba(225,29,72,0.1); padding: 14px; border-radius: 10px; border: 1px solid rgba(225,29,72,0.25);">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #f43f5e;">Réinitialisation</h4>
                <button id="pokeskip-btn-reset-rules" style="background:#be123c; border:1px solid #f43f5e; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">
                  Supprimer toutes mes règles enregistrées
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      this.modalContainer = backdrop;

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
      document.getElementById('pokeskip-modal-close').addEventListener('click', () => this.closeModal());

      document.getElementById('pokeskip-toggle-enabled').addEventListener('change', (e) => {
        PokeSkip.settings.enabled = e.target.checked;
        PokeSkip.saveSettings();
        this.showToast(PokeSkip.settings.enabled ? 'PokéSkip activé' : 'PokéSkip en pause', 'info');
      });

      backdrop.querySelectorAll('.pokeskip-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          backdrop.querySelectorAll('.pokeskip-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.dataset.tab;
          document.getElementById('pokeskip-body-team').style.display = tab === 'team' ? 'block' : 'none';
          document.getElementById('pokeskip-body-saved').style.display = tab === 'saved' ? 'block' : 'none';
          document.getElementById('pokeskip-body-settings').style.display = tab === 'settings' ? 'block' : 'none';
          if (tab === 'saved') this.renderSavedSpeciesTab();
        });
      });

      document.getElementById('pokeskip-opt-toasts').addEventListener('change', (e) => {
        PokeSkip.settings.showToasts = e.target.checked;
        PokeSkip.saveSettings();
      });

      const optQuickPrompt = document.getElementById('pokeskip-opt-quick-prompt');
      const optQuickDuration = document.getElementById('pokeskip-opt-quick-duration');
      const optDurationContainer = document.getElementById('pokeskip-opt-duration-container');

      if (optQuickPrompt) {
        optQuickPrompt.addEventListener('change', (e) => {
          PokeSkip.settings.showQuickPrompt = e.target.checked;
          PokeSkip.saveSettings();
          if (optDurationContainer) {
            optDurationContainer.style.opacity = e.target.checked ? '1' : '0.4';
          }
          if (optQuickDuration) {
            optQuickDuration.disabled = !e.target.checked;
          }
        });
      }

      if (optQuickDuration) {
        optQuickDuration.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val) && val >= 3 && val <= 120) {
            PokeSkip.settings.quickPromptDuration = val;
            PokeSkip.saveSettings();
          }
        });
        optQuickDuration.addEventListener('change', (e) => {
          let val = parseInt(e.target.value, 10);
          if (isNaN(val) || val < 3) val = 3;
          if (val > 120) val = 120;
          e.target.value = val;
          PokeSkip.settings.quickPromptDuration = val;
          PokeSkip.saveSettings();
        });
      }

      document.getElementById('pokeskip-btn-export').addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(PokeSkip.rules, null, 2));
        const a = document.createElement('a');
        a.setAttribute('href', dataStr);
        a.setAttribute('download', `pokeskip-rules-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        this.showToast('Règles exportées en fichier JSON', 'success');
      });

      document.getElementById('pokeskip-btn-import').addEventListener('click', () => {
        const json = prompt('Collez ici le contenu JSON de vos règles :');
        if (!json) return;
        try {
          const parsed = JSON.parse(json);
          if (typeof parsed === 'object') {
            PokeSkip.rules = { ...PokeSkip.rules, ...parsed };
            PokeSkip.saveRules();
            this.showToast('Règles importées avec succès !', 'success');
            this.renderTeamTab();
          }
        } catch (err) {
          alert('Erreur : le format JSON est invalide.');
        }
      });

      document.getElementById('pokeskip-btn-reset-rules').addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment effacer TOUTES les règles enregistrées ? Rien ne sera plus skip.')) {
          PokeSkip.rules = {};
          PokeSkip.saveRules();
          this.showToast('Toutes les règles ont été effacées.', 'warning');
          this.renderTeamTab();
        }
      });
    },

    toggleModal() {
      if (!this.modalContainer) this.createModal();
      if (this.modalContainer.classList.contains('active')) {
        this.closeModal();
      } else {
        this.openModal();
      }
    },

    openModal() {
      this.refreshPartyFromGame();
      this.renderTeamTab();
      this.modalContainer.classList.add('active');
    },

    closeModal() {
      if (this.modalContainer) {
        this.modalContainer.classList.remove('active');
      }
    },

    bindHotkeys() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
          this.toggleModal();
        }
      });
    },

    refreshPartyFromGame() {
      PokeSkip.activeParty = [];
      try {
        if (PokeSkip.scene && PokeSkip.scene.party && Array.isArray(PokeSkip.scene.party)) {
          PokeSkip.activeParty = PokeSkip.scene.party.filter(Boolean);
        }
      } catch (e) {
        console.warn('[PokeSkip] Impossible de lire scene.party:', e);
      }
    },

    renderTeamTab() {
      const teamContainer = document.getElementById('pokeskip-team-selector');
      const contentContainer = document.getElementById('pokeskip-selected-pokemon-content');
      if (!teamContainer || !contentContainer) return;

      teamContainer.innerHTML = '';
      contentContainer.innerHTML = '';

      const party = PokeSkip.activeParty;

      if (!party || party.length === 0) {
        teamContainer.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: #94a3b8; background: #111a2e; border-radius: 12px;">
            ⚠️ Aucune partie en cours détectée ou équipe vide.<br>
            Lancez une partie dans PokéRogue pour voir votre équipe active, ou utilisez l'onglet <b>"Espèces Mémorisées"</b> !
          </div>
        `;
        return;
      }

      party.forEach((pkmn, idx) => {
        const speciesId = pkmn.species?.speciesId ?? pkmn.speciesId;
        const name = pkmn.name || pkmn.species?.name || `Pokémon #${idx + 1}`;
        const level = pkmn.level || 1;
        const rule = PokeSkip.getSpeciesRule(speciesId);
        const skippedCount = rule?.skippedMoves ? Object.keys(rule.skippedMoves).length : 0;

        const card = document.createElement('div');
        card.className = `pokeskip-member-card ${idx === this.selectedTeamIndex ? 'active' : ''}`;
        card.innerHTML = `
          <div style="font-size: 24px;">⚡</div>
          <div class="pokeskip-member-name">${name}</div>
          <div style="font-size: 11px; color: #94a3b8;">Niv. ${level}</div>
          <div class="pokeskip-member-badge">${skippedCount > 0 ? `${skippedCount} ignorée(s)` : 'Toutes gardées'}</div>
        `;
        card.addEventListener('click', () => {
          this.selectedTeamIndex = idx;
          this.renderTeamTab();
        });
        teamContainer.appendChild(card);
      });

      const currentPkmn = party[this.selectedTeamIndex] || party[0];
      if (currentPkmn) {
        this.renderPokemonMoveConfig(contentContainer, currentPkmn);
      }
    },

    renderPokemonMoveConfig(container, pokemon) {
      const speciesId = pokemon.species?.speciesId ?? pokemon.speciesId;
      const speciesName = pokemon.species?.name || pokemon.name || 'Pokémon';
      const rule = PokeSkip.getSpeciesRule(speciesId) || { skippedMoves: {}, skipAll: false };

      // Récupération de TOUTES les attaques apprenables (futures + actuelles)
      const learnable = getPokemonFullLearnset(pokemon);

      container.innerHTML = `
        <div style="background: #0f172a; padding: 16px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.2);">
          <div class="pokeskip-moves-header">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: 16px; color: #fff;">
                Capacités apprenables pour : <span style="color: #38bdf8;">${speciesName}</span>
              </h3>
              <div style="font-size: 12px; color: #94a3b8;">
                🔵 <b>Coché en bleu = Attaque gardée</b> (par défaut). <b>Décochez</b> les attaques que vous souhaitez <b>ignorer automatiquement</b>.
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button id="pokeskip-btn-select-all" style="background:#0369a1; color:#fff; border:1px solid #38bdf8; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600;">🔵 Tout garder (Tout cocher)</button>
              <button id="pokeskip-btn-deselect-all" style="background:#1e293b; color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">⬜ Tout ignorer (Tout décocher)</button>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 14px;">
            <input type="text" id="pokeskip-move-filter" placeholder="Filtrer une attaque par nom..." style="background:#111a2e; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:7px 12px; color:#fff; font-size:13px; outline:none; flex:1;">
          </div>

          <div class="pokeskip-moves-container" id="pokeskip-moves-grid-el"></div>
        </div>
      `;

      const grid = container.querySelector('#pokeskip-moves-grid-el');

      const renderGrid = (filter = '') => {
        grid.innerHTML = '';
        const currentRule = PokeSkip.getSpeciesRule(speciesId) || { skippedMoves: {} };

        const filtered = learnable.filter(m => !filter || m.name.toLowerCase().includes(filter.toLowerCase()));

        if (filtered.length === 0) {
          grid.innerHTML = `<div style="color: #64748b; font-size: 13px; text-align: center; padding: 20px;">Aucune capacité trouvée.</div>`;
          return;
        }

        filtered.forEach(moveItem => {
          const isSkipped = PokeSkip.isMoveSkipped(speciesId, moveItem.name, moveItem.moveId);
          const isKept = !isSkipped;
          const cardEl = document.createElement('div');
          cardEl.className = `pokeskip-move-card ${isSkipped ? 'skipped' : ''}`;
          cardEl.innerHTML = `
            <div class="pokeskip-move-top">
              <div class="pokeskip-move-left">
                <span class="pokeskip-move-lvl-pill">${typeof moveItem.level === 'number' ? `Niv. ${moveItem.level}` : moveItem.level}</span>
                <span class="pokeskip-move-name-txt">${moveItem.name}</span>
                <span class="pokeskip-type-tag" style="background:${moveItem.type.bg}; color:${moveItem.type.color};">${moveItem.type.name}</span>
                <span class="pokeskip-cat-tag" style="color:${moveItem.category.color};">${moveItem.category.icon} ${moveItem.category.name}</span>
              </div>
              <div class="pokeskip-move-right">
                <span class="pokeskip-stat-pill">⚔️ Puissance : <b>${moveItem.power}</b></span>
                <span class="pokeskip-stat-pill" style="border-color: rgba(56, 189, 248, 0.3);">🎯 Précision : <b style="color: #38bdf8;">${moveItem.accuracy}</b></span>
                <span class="pokeskip-stat-pill">🔋 PP : <b>${moveItem.pp}</b></span>
                <span class="pokeskip-keep-badge ${isKept ? 'kept' : 'skip'}">${isKept ? '✓ Gardée' : '✕ Ignorée'}</span>
                <input type="checkbox" class="pokeskip-checkbox" ${isKept ? 'checked' : ''} title="${isKept ? 'Attaque gardée (décocher pour ignorer)' : 'Attaque ignorée (cocher pour garder)'}">
              </div>
            </div>
            ${moveItem.desc ? `<div class="pokeskip-move-desc">${moveItem.desc}</div>` : ''}
          `;

          const checkbox = cardEl.querySelector('.pokeskip-checkbox');
          const badge = cardEl.querySelector('.pokeskip-keep-badge');

          const updateCardState = (kept) => {
            checkbox.checked = kept;
            cardEl.classList.toggle('skipped', !kept);
            if (badge) {
              badge.className = `pokeskip-keep-badge ${kept ? 'kept' : 'skip'}`;
              badge.textContent = kept ? '✓ Gardée' : '✕ Ignorée';
            }
            PokeSkip.setMoveSkipped(speciesId, speciesName, moveItem.name, moveItem.moveId, !kept);
            UI.updateHudBadge();
          };

          cardEl.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
              updateCardState(!checkbox.checked);
            }
          });
          checkbox.addEventListener('change', () => {
            updateCardState(checkbox.checked);
          });

          grid.appendChild(cardEl);
        });
      };

      renderGrid();

      container.querySelector('#pokeskip-move-filter').addEventListener('input', (e) => {
        renderGrid(e.target.value);
      });

      container.querySelector('#pokeskip-btn-select-all').addEventListener('click', () => {
        // Tout garder (Tout cocher en bleu)
        learnable.forEach(m => PokeSkip.setMoveSkipped(speciesId, speciesName, m.name, m.moveId, false));
        if (rule.skippedMoves) {
          for (const k of Object.keys(rule.skippedMoves)) {
            PokeSkip.setMoveSkipped(speciesId, speciesName, k, null, false);
          }
        }
        renderGrid(container.querySelector('#pokeskip-move-filter').value);
        UI.showToast(`Toutes les capacités sont <b>gardées</b> pour <b>${speciesName}</b>`, 'info');
      });

      container.querySelector('#pokeskip-btn-deselect-all').addEventListener('click', () => {
        // Tout ignorer (Tout décocher)
        learnable.forEach(m => PokeSkip.setMoveSkipped(speciesId, speciesName, m.name, m.moveId, true));
        renderGrid(container.querySelector('#pokeskip-move-filter').value);
        UI.showToast(`Toutes les capacités sont <b>ignorées</b> pour <b>${speciesName}</b>`, 'warning');
      });
    },

    renderSavedSpeciesTab() {
      const container = document.getElementById('pokeskip-saved-species-list');
      if (!container) return;
      container.innerHTML = '';

      const speciesKeys = Object.keys(PokeSkip.rules);
      if (speciesKeys.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #94a3b8; background: #111a2e; border-radius: 12px;">
            Aucune règle mémorisée pour le moment.<br>
            Décochez des attaques dans l'équipe actuelle pour les ignorer : elles resteront enregistrées pour toujours !
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div style="margin-bottom: 12px; color: #94a3b8; font-size: 13px;">
          Retrouvez ici toutes les espèces que vous avez configurées. Même si vous commencez une nouvelle équipe, ces réglages seront automatiquement appliqués.
        </div>
      `;

      speciesKeys.forEach(spId => {
        const rule = PokeSkip.rules[spId];
        const skippedKeys = Object.keys(rule.skippedMoves || {}).filter(k => !k.startsWith('id_'));
        const el = document.createElement('div');
        el.style.cssText = 'background: #111a2e; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;';
        el.innerHTML = `
          <div>
            <div style="font-size: 15px; font-weight: 700; color: #fff;">${rule.speciesName || `Espèce #${spId}`}</div>
            <div style="font-size: 12px; color: #38bdf8; margin-top: 4px;">
              ${skippedKeys.length > 0 ? `Capacités ignorées (${skippedKeys.length}) : ${skippedKeys.join(', ')}` : 'Aucune capacité ignorée'}
            </div>
          </div>
          <button style="background:rgba(225,29,72,0.2); border:1px solid rgba(225,29,72,0.4); color:#fda4af; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">
            Supprimer la règle
          </button>
        `;

        el.querySelector('button').addEventListener('click', () => {
          if (confirm(`Supprimer les règles enregistrées pour ${rule.speciesName} ?`)) {
            PokeSkip.deleteSpeciesRule(spId);
            this.renderSavedSpeciesTab();
            this.showToast(`Règle supprimée pour ${rule.speciesName}`, 'info');
          }
        });

        container.appendChild(el);
      });
    },

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

    showQuickSkipPrompt(phaseInstance, pokemon, move) {
      if (document.getElementById('pokeskip-quick-prompt')) {
        document.getElementById('pokeskip-quick-prompt').remove();
      }

      const speciesId = pokemon?.species?.speciesId ?? pokemon?.speciesId;
      const speciesName = pokemon?.species?.name || pokemon?.name || 'ce Pokémon';
      const moveName = move?.name || `Move #${phaseInstance.moveId}`;

      const el = document.createElement('div');
      el.id = 'pokeskip-quick-prompt';
      el.innerHTML = `
        <span class="pokeskip-quick-text">⚡ Ignorer <b>${moveName}</b> pour <b>${speciesName}</b> ?</span>
        <button class="pokeskip-quick-btn" id="pokeskip-quick-skip-always">Toujours ignorer</button>
        <button class="pokeskip-quick-close" id="pokeskip-quick-close">&times;</button>
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
        PokeSkip.setMoveSkipped(speciesId, speciesName, moveName, phaseInstance.moveId, true);
        PokeSkip.stats.totalSkipped++;
        PokeSkip.saveStats();
        this.updateHudBadge();

        this.showToast(`✅ Règle enregistrée : <b>${speciesName}</b> ignorera <b>${moveName}</b> !`, 'success');
        dismiss();

        const scene = phaseInstance.scene || PokeSkip.scene || window.globalScene;
        const pm = scene?.phaseManager;
        const currentPhase = pm ? (typeof pm.getCurrentPhase === 'function' ? pm.getCurrentPhase() : pm.currentPhase) : null;

        // VÉRIFICATION DE SÉCURITÉ :
        // Ne terminer la phase que si LearnMovePhase est encore la phase courante !
        // Si le jeu est déjà passé à SelectModifierPhase (l'objet cadeau), on ne touche SURTOUT PAS à end()
        if (currentPhase && (currentPhase === phaseInstance || currentPhase.phaseName === 'LearnMovePhase')) {
          const targetMode = phaseInstance.messageMode ?? 0;
          let ended = false;
          const safeEnd = () => {
            if (ended) return;
            ended = true;
            try {
              phaseInstance.end();
            } catch (err) {
              console.warn('[PokeSkip] Erreur clôture phase:', err);
            }
          };

          // Si le joueur était dans le menu des 4 attaques (UiMode.SUMMARY = 9) ou confirmation (14),
          // on réinitialise l'UI pour quitter ce menu immédiatement et proprement
          if (scene && scene.ui && typeof scene.ui.setMode === 'function') {
            try {
              scene.ui.setMode(targetMode).then(safeEnd).catch(safeEnd);
              setTimeout(safeEnd, 200);
            } catch (err) {
              safeEnd();
            }
          } else {
            safeEnd();
          }
        } else {
          // Si LearnMovePhase est déjà passée mais que l'UI est restée coincée sur Summary (9) ou Confirm (14) :
          if (scene && scene.ui && typeof scene.ui.setMode === 'function') {
            try {
              const currentMode = typeof scene.ui.getMode === 'function' ? scene.ui.getMode() : scene.ui.mode;
              if (currentMode === 9 || currentMode === 14) {
                scene.ui.setMode(phaseInstance.messageMode ?? 0);
              }
            } catch (err) {}
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

  // --- INITIALISATION AU CHARGEMENT ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      UI.init();
      initGameHook();
    });
  } else {
    UI.init();
    initGameHook();
  }

})();
