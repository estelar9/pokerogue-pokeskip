// PokéSkip Demo & Interactive Simulator Script
(function () {
  'use strict';

  const STORAGE_KEY = 'pokeskip_species_rules_v1';
  const STATS_KEY = 'pokeskip_stats_v1';
  const SETTINGS_KEY = 'pokeskip_settings_v1';

  function getSettings() {
    try {
      return Object.assign({
        enabled: true,
        showToasts: true,
        showQuickPrompt: true,
        quickPromptDuration: 15
      }, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
    } catch (e) {
      return { enabled: true, showToasts: true, showQuickPrompt: true, quickPromptDuration: 15 };
    }
  }

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
    { name: 'Fée', color: '#ffffff', bg: '#be185d' }
  ];

  const MOVE_CATEGORIES = [
    { name: 'Physique', icon: '💥', color: '#f87171' },
    { name: 'Spéciale', icon: '✨', color: '#60a5fa' },
    { name: 'Statut', icon: '🌀', color: '#94a3b8' }
  ];

  const DEMO_TEAM = [
    {
      speciesId: 25,
      name: 'Pikachu',
      avatar: '⚡',
      level: 22,
      moves: [
        { name: 'Mimi-Queue', level: 1, type: POKEMON_TYPES[0], category: MOVE_CATEGORIES[2], power: '—', accuracy: '100%', pp: 30, desc: 'Baisse la Défense de la cible d\'un niveau.' },
        { name: 'Éclair', level: 1, type: POKEMON_TYPES[12], category: MOVE_CATEGORIES[1], power: 40, accuracy: '100%', pp: 30, desc: 'Une décharge électrique qui a 10% de chance de paralyser l\'ennemi.' },
        { name: 'Frottement', level: 4, type: POKEMON_TYPES[12], category: MOVE_CATEGORIES[0], power: 20, accuracy: '100%', pp: 20, desc: 'Frotte ses joues électrifiées contre l\'ennemi. Paralyse toujours la cible !' },
        { name: 'Vive-Attaque', level: 8, type: POKEMON_TYPES[0], category: MOVE_CATEGORIES[0], power: 40, accuracy: '100%', pp: 30, desc: 'Une attaque fulgurante qui frappe toujours en priorité.' },
        { name: 'Cage-Éclair', level: 12, type: POKEMON_TYPES[12], category: MOVE_CATEGORIES[2], power: '—', accuracy: '90%', pp: 20, desc: 'Envoie un faible choc qui paralyse la cible.' },
        { name: 'Boule Élek', level: 16, type: POKEMON_TYPES[12], category: MOVE_CATEGORIES[1], power: 'Var.', accuracy: '100%', pp: 20, desc: 'Plus le lanceur est rapide comparé à la cible, plus la puissance augmente.' },
        { name: 'Étincelle', level: 20, type: POKEMON_TYPES[12], category: MOVE_CATEGORIES[0], power: 65, accuracy: '100%', pp: 20, desc: 'Une charge électrifiée avec 30% de chance de paralyser la cible.' },
        { name: 'Coup d\'Jus', level: 28, type: POKEMON_TYPES[12], category: MOVE_CATEGORIES[1], power: 80, accuracy: '100%', pp: 15, desc: 'Une énorme explosion électrique touchant tout le terrain (30% paralysie).' },
        { name: 'Tonnerre', level: 36, type: POKEMON_TYPES[12], category: MOVE_CATEGORIES[1], power: 90, accuracy: '100%', pp: 15, desc: 'Une puissante foudre s\'abat sur l\'ennemi (10% de chance de paralysie).' },
        { name: 'Fatal-Foudre', level: 48, type: POKEMON_TYPES[12], category: MOVE_CATEGORIES[1], power: 110, accuracy: '70%', pp: 10, desc: 'La plus puissante attaque foudre. Infaillible sous la pluie !' }
      ]
    },
    {
      speciesId: 6,
      name: 'Dracaufeu',
      avatar: '🔥',
      level: 36,
      moves: [
        { name: 'Griffe', level: 1, type: POKEMON_TYPES[0], category: MOVE_CATEGORIES[0], power: 40, accuracy: '100%', pp: 35, desc: 'Lacère l\'ennemi avec des griffes acérées.' },
        { name: 'Groz\'Yeux', level: 1, type: POKEMON_TYPES[0], category: MOVE_CATEGORIES[2], power: '—', accuracy: '100%', pp: 30, desc: 'Regard menaçant qui baisse la Défense des ennemis.' },
        { name: 'Flammèche', level: 1, type: POKEMON_TYPES[9], category: MOVE_CATEGORIES[1], power: 40, accuracy: '100%', pp: 25, desc: 'Une petite flamme qui a 10% de chance de brûler.' },
        { name: 'Dracosouffle', level: 12, type: POKEMON_TYPES[15], category: MOVE_CATEGORIES[1], power: 60, accuracy: '100%', pp: 20, desc: 'Souffle un vent draconique avec 30% de chance de paralyser.' },
        { name: 'Crocs Feu', level: 17, type: POKEMON_TYPES[9], category: MOVE_CATEGORIES[0], power: 65, accuracy: '95%', pp: 15, desc: 'Morsure enflammée (10% de brûler, 10% d\'apeurer).' },
        { name: 'Tranche', level: 24, type: POKEMON_TYPES[0], category: MOVE_CATEGORIES[0], power: 70, accuracy: '100%', pp: 20, desc: 'Coup de griffe avec un taux de critique élevé.' },
        { name: 'Lance-Flammes', level: 30, type: POKEMON_TYPES[9], category: MOVE_CATEGORIES[1], power: 90, accuracy: '100%', pp: 15, desc: 'Un torrent de flammes dévastateur (10% de brûler).' },
        { name: 'Lame d\'Air', level: 36, type: POKEMON_TYPES[2], category: MOVE_CATEGORIES[1], power: 75, accuracy: '95%', pp: 15, desc: 'Tranche avec le vent (30% de chance d\'apeurer la cible).' },
        { name: 'Danse Draco', level: 44, type: POKEMON_TYPES[15], category: MOVE_CATEGORIES[2], power: '—', accuracy: '—', pp: 20, desc: 'Danse mystique qui augmente l\'Attaque et la Vitesse d\'un niveau.' },
        { name: 'Boutefeu', level: 56, type: POKEMON_TYPES[9], category: MOVE_CATEGORIES[0], power: 120, accuracy: '100%', pp: 15, desc: 'Charge incandescente suprême. Inflige des dégâts de recul.' }
      ]
    },
    {
      speciesId: 130,
      name: 'Léviator',
      avatar: '🌊',
      level: 30,
      moves: [
        { name: 'Trempette', level: 1, type: POKEMON_TYPES[0], category: MOVE_CATEGORIES[2], power: '—', accuracy: '—', pp: 40, desc: 'Gigote bêtement sans infliger le moindre effet.' },
        { name: 'Charge', level: 1, type: POKEMON_TYPES[0], category: MOVE_CATEGORIES[0], power: 40, accuracy: '100%', pp: 35, desc: 'Charge l\'adversaire avec tout son corps.' },
        { name: 'Morsure', level: 20, type: POKEMON_TYPES[16], category: MOVE_CATEGORIES[0], power: 60, accuracy: '100%', pp: 25, desc: 'Morsure féroce avec 30% de chance d\'apeurer.' },
        { name: 'Dracorage', level: 24, type: POKEMON_TYPES[15], category: MOVE_CATEGORIES[1], power: '40 FIXE', accuracy: '100%', pp: 10, desc: 'Inflige toujours exactement 40 PV de dégâts.' },
        { name: 'Danse Draco', level: 32, type: POKEMON_TYPES[15], category: MOVE_CATEGORIES[2], power: '—', accuracy: '—', pp: 20, desc: 'Augmente l\'Attaque et la Vitesse d\'un niveau.' },
        { name: 'Cascade', level: 36, type: POKEMON_TYPES[10], category: MOVE_CATEGORIES[0], power: 80, accuracy: '100%', pp: 15, desc: 'Charge aquatique puissante avec 20% de chance d\'apeurer.' },
        { name: 'Hydrocanon', level: 40, type: POKEMON_TYPES[10], category: MOVE_CATEGORIES[1], power: 110, accuracy: '80%', pp: 5, desc: 'Projette un jet d\'eau massif à haute pression.' }
      ]
    }
  ];

  let activeIndex = 0;
  let rules = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  let stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{"totalSkipped":0}');
  let currentPendingPrompt = null;

  function saveRules() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  }

  function saveStats() {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    document.getElementById('demo-stats-counter').textContent = `${stats.totalSkipped} passée(s)`;
  }

  function isMoveSkipped(speciesId, moveName) {
    const rule = rules[speciesId];
    if (!rule) return false;
    if (rule.skipAll) return true;
    if (!rule.skippedMoves) return false;
    return !!rule.skippedMoves[moveName.toLowerCase()];
  }

  function setMoveSkipped(speciesId, speciesName, moveName, isSkipped) {
    if (!rules[speciesId]) {
      rules[speciesId] = {
        speciesId: speciesId,
        speciesName: speciesName,
        skippedMoves: {},
        skipAll: false,
        updatedAt: Date.now()
      };
    }
    const rule = rules[speciesId];
    rule.speciesName = speciesName;
    const key = moveName.toLowerCase();

    if (isSkipped) {
      rule.skippedMoves[key] = true;
    } else {
      delete rule.skippedMoves[key];
    }
    rule.updatedAt = Date.now();
    saveRules();
  }

  function renderTeamTabs() {
    const container = document.getElementById('demo-team-tabs');
    container.innerHTML = '';

    DEMO_TEAM.forEach((pkmn, idx) => {
      const rule = rules[pkmn.speciesId];
      const count = rule?.skippedMoves ? Object.keys(rule.skippedMoves).length : 0;

      const card = document.createElement('div');
      card.className = `tab-pkmn-card ${idx === activeIndex ? 'active' : ''}`;
      card.innerHTML = `
        <div style="font-size: 20px;">${pkmn.avatar}</div>
        <div class="tab-pkmn-name">${pkmn.name}</div>
        <div class="tab-pkmn-skipped">${count > 0 ? `${count} ignorée(s)` : 'Toutes gardées'}</div>
      `;

      card.addEventListener('click', () => {
        activeIndex = idx;
        renderTeamTabs();
        renderMovesList();
        updateSimActivePokemon();
      });

      container.appendChild(card);
    });
  }

  function renderMovesList() {
    const pkmn = DEMO_TEAM[activeIndex];
    document.getElementById('demo-selected-pkmn-title').textContent = `${pkmn.name} (#${pkmn.speciesId})`;

    const list = document.getElementById('demo-moves-list');
    list.innerHTML = '';

    pkmn.moves.forEach(move => {
      const skipped = isMoveSkipped(pkmn.speciesId, move.name);
      const isKept = !skipped;
      const row = document.createElement('div');
      row.className = `move-row ${skipped ? 'skipped' : ''}`;
      row.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="background: rgba(255,255,255,0.08); color:#94a3b8; font-size:11px; font-weight:700; padding:2px 6px; border-radius:4px;">Niv. ${move.level}</span>
              <span class="move-name-txt" style="font-size: 14px; font-weight: 700; color:#fff;">${move.name}</span>
              <span style="background:${move.type.bg}; color:${move.type.color}; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${move.type.name}</span>
              <span style="color:${move.category.color}; font-size:11px; font-weight:600;">${move.category.icon} ${move.category.name}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="background:#090e1a; border:1px solid rgba(255,255,255,0.08); padding:3px 8px; border-radius:6px; font-size:11px; color:#cbd5e1;">⚔️ Puissance : <b>${move.power}</b></span>
              <span style="background:#090e1a; border:1px solid rgba(56,189,248,0.3); padding:3px 8px; border-radius:6px; font-size:11px; color:#cbd5e1;">🎯 Précision : <b style="color: #38bdf8;">${move.accuracy}</b></span>
              <span style="background:#090e1a; border:1px solid rgba(255,255,255,0.08); padding:3px 8px; border-radius:6px; font-size:11px; color:#cbd5e1;">🔋 PP : <b>${move.pp}</b></span>
              <span class="demo-keep-badge ${isKept ? 'kept' : 'skip'}">${isKept ? '✓ Gardée' : '✕ Ignorée'}</span>
              <input type="checkbox" class="move-checkbox" ${isKept ? 'checked' : ''} title="${isKept ? 'Attaque gardée (décocher pour ignorer)' : 'Attaque ignorée (cocher pour garder)'}">
            </div>
          </div>
          <div style="font-size: 11px; color: #94a3b8; background: rgba(0,0,0,0.25); padding: 4px 8px; border-radius: 4px; border-left: 2px solid rgba(56,189,248,0.4); margin-top: 4px;">
            ${move.desc}
          </div>
        </div>
      `;

      const checkbox = row.querySelector('.move-checkbox');
      const badge = row.querySelector('.demo-keep-badge');

      const updateRowState = (kept) => {
        checkbox.checked = kept;
        row.classList.toggle('skipped', !kept);
        if (badge) {
          badge.className = `demo-keep-badge ${kept ? 'kept' : 'skip'}`;
          badge.textContent = kept ? '✓ Gardée' : '✕ Ignorée';
        }
        setMoveSkipped(pkmn.speciesId, pkmn.name, move.name, !kept);
        renderTeamTabs();
      };

      row.addEventListener('click', (e) => {
        if (e.target !== checkbox) updateRowState(!checkbox.checked);
      });
      checkbox.addEventListener('change', () => {
        updateRowState(checkbox.checked);
      });

      list.appendChild(row);
    });
  }

  function updateSimActivePokemon() {
    const pkmn = DEMO_TEAM[activeIndex];
    document.getElementById('sim-active-avatar').textContent = pkmn.avatar;
    document.getElementById('sim-active-name').textContent = pkmn.name;
    document.getElementById('sim-active-level').textContent = `Niveau ${pkmn.level} • 4/4 Attaques`;
  }

  function simulateMoveProposal(pkmnName, speciesId, moveName) {
    const dialog = document.getElementById('sim-dialog');
    const dialogText = document.getElementById('sim-dialog-text');
    const dialogActions = document.getElementById('sim-dialog-actions');
    const quickPrompt = document.getElementById('sim-quick-prompt');

    const foundIdx = DEMO_TEAM.findIndex(p => p.speciesId === Number(speciesId));
    if (foundIdx !== -1 && foundIdx !== activeIndex) {
      activeIndex = foundIdx;
      renderTeamTabs();
      renderMovesList();
      updateSimActivePokemon();
    }

    if (isMoveSkipped(speciesId, moveName)) {
      stats.totalSkipped++;
      saveStats();
      dialogActions.style.display = 'none';
      if (quickPrompt) quickPrompt.style.display = 'none';

      dialog.style.borderColor = '#10b981';
      dialogText.innerHTML = `
        <span style="color: #38bdf8; font-weight: 700;">⚡ [PokéSkip Auto-Skip Activé]</span><br>
        ⏭️ <b>${pkmnName}</b> a immédiatement ignoré <b>${moveName}</b> sans bloquer le jeu !<br>
        <span style="color: #94a3b8; font-size: 11px;">Règle mémorisée trouvée pour l'espèce #${speciesId}. Aucun dialogue affiché.</span>
      `;
      setTimeout(() => {
        dialog.style.borderColor = 'rgba(56, 189, 248, 0.25)';
      }, 2000);
      return;
    }

    currentPendingPrompt = { speciesId, pkmnName, moveName };
    dialog.style.borderColor = '#f59e0b';
    dialogText.innerHTML = `
      <b>${pkmnName}</b> souhaite apprendre <b>${moveName}</b>.<br>
      Cependant, ${pkmnName} connaît déjà quatre capacités.<br>
      Voulez-vous oublier une capacité pour apprendre <b>${moveName}</b> ?
    `;
    dialogActions.style.display = 'flex';

    const settings = getSettings();
    if (quickPrompt && settings.showQuickPrompt !== false) {
      document.getElementById('quick-move-name').textContent = moveName;
      document.getElementById('quick-pkmn-name').textContent = pkmnName;
      quickPrompt.style.display = 'flex';

      clearTimeout(window._quickPromptTimer);
      const durationSec = Math.max(3, settings.quickPromptDuration || 15);
      window._quickPromptTimer = setTimeout(() => {
        quickPrompt.style.display = 'none';
      }, durationSec * 1000);
    }
  }

  document.getElementById('sim-btn-no').addEventListener('click', () => {
    document.getElementById('sim-dialog-actions').style.display = 'none';
    const qp = document.getElementById('sim-quick-prompt');
    if (qp) qp.style.display = 'none';
    document.getElementById('sim-dialog-text').textContent = `${currentPendingPrompt?.pkmnName || 'Le Pokémon'} n'a pas appris l'attaque.`;
    currentPendingPrompt = null;
  });

  document.getElementById('sim-btn-yes').addEventListener('click', () => {
    document.getElementById('sim-dialog-actions').style.display = 'none';
    const qp = document.getElementById('sim-quick-prompt');
    if (qp) qp.style.display = 'none';
    document.getElementById('sim-dialog-text').textContent = `Ouverture de l'écran de sélection de la capacité à oublier...`;
    currentPendingPrompt = null;
  });

  const btnCloseQp = document.getElementById('btn-close-quick-prompt');
  if (btnCloseQp) {
    btnCloseQp.addEventListener('click', () => {
      document.getElementById('sim-quick-prompt').style.display = 'none';
    });
  }

  const btnTriggerQp = document.getElementById('btn-trigger-quick-skip');
  if (btnTriggerQp) {
    btnTriggerQp.addEventListener('click', () => {
      if (!currentPendingPrompt) return;
      const { speciesId, pkmnName, moveName } = currentPendingPrompt;

      setMoveSkipped(speciesId, pkmnName, moveName, true);
      renderTeamTabs();
      renderMovesList();

      stats.totalSkipped++;
      saveStats();

      document.getElementById('sim-dialog-actions').style.display = 'none';
      document.getElementById('sim-quick-prompt').style.display = 'none';

      document.getElementById('sim-dialog-text').innerHTML = `
        <span style="color: #10b981; font-weight: 700;">✅ Règle mémorisée pour toujours !</span><br>
        <b>${pkmnName}</b> a refusé <b>${moveName}</b> et l'ignorera automatiquement à l'avenir.
      `;
      currentPendingPrompt = null;
    });
  }

  document.querySelectorAll('.btn-sim-action').forEach(btn => {
    btn.addEventListener('click', () => {
      simulateMoveProposal(btn.dataset.pkmn, btn.dataset.speciesId, btn.dataset.move);
    });
  });

  document.getElementById('demo-btn-check-all').addEventListener('click', () => {
    // Tout garder (Tout cocher en bleu)
    const pkmn = DEMO_TEAM[activeIndex];
    pkmn.moves.forEach(m => setMoveSkipped(pkmn.speciesId, pkmn.name, m.name, false));
    renderTeamTabs();
    renderMovesList();
  });

  document.getElementById('demo-btn-uncheck-all').addEventListener('click', () => {
    // Tout ignorer (Tout décocher)
    const pkmn = DEMO_TEAM[activeIndex];
    pkmn.moves.forEach(m => setMoveSkipped(pkmn.speciesId, pkmn.name, m.name, true));
    renderTeamTabs();
    renderMovesList();
  });

  document.getElementById('btn-copy-script').addEventListener('click', async () => {
    try {
      const res = await fetch('../pokeskip.user.js');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById('btn-copy-script');
      btn.textContent = '✅ Userscript copié !';
      setTimeout(() => { btn.textContent = '📋 Copier le Userscript'; }, 2500);
    } catch (e) {
      alert('Téléchargez directement le fichier pokeskip.user.js !');
    }
  });

  saveStats();
  renderTeamTabs();
  renderMovesList();
  updateSimActivePokemon();
})();
