import { PokeSkip } from '../../core/state.js';
import { LineageManager } from '../../core/lineage-manager.js';
import { AssetLoader } from '../../core/asset-loader.js';
import { getPokemonFullLearnset } from '../../core/moves-resolver.js';
import { POKEMON_TYPES, MOVE_CATEGORIES } from '../../constants/types.js';
import { UI } from '../index.js';
import { t, isFrench } from '../../core/i18n.js';

export const TeamTab = {
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
            ${t('team_empty_msg')}
          </div>
        `;
        return;
      }

      party.forEach((pkmn, idx) => {
        const familyInfo = LineageManager.getFamilyInfo(pkmn);
        const name = LineageManager.getPokemonDisplayName(pkmn);
        const level = pkmn.level || 1;
        const shinyInfo = LineageManager.getPokemonShinyInfo(pkmn);
        const isMega = LineageManager.isPokemonMega(pkmn);
        const spriteUrl = LineageManager.getPokemonSpriteUrl(pkmn);

        const card = document.createElement('div');
        card.className = `pokeskip-member-card ${idx === this.selectedTeamIndex ? 'active' : ''}`;
        const speciesId = pkmn.species?.speciesId ?? pkmn.speciesId ?? LineageManager.getRootId(pkmn);
        const pkmVariant = shinyInfo.isShiny ? (typeof pkmn.variant === 'number' ? pkmn.variant : (typeof pkmn.shinyTier === 'number' ? Math.max(0, pkmn.shinyTier - 1) : 0)) : 0;
        card.innerHTML = `
          ${shinyInfo.isShiny ? `<span class="pokeskip-shiny-badge ${shinyInfo.className}" title="${shinyInfo.title}">${shinyInfo.stars}</span>` : ''}
          <div class="pokeskip-member-sprite-container">
            <img src="${spriteUrl}" alt="${name}" class="pokeskip-member-sprite"
                 data-pokeskip-species="${speciesId}" data-pokeskip-shiny="${shinyInfo.isShiny}" data-pokeskip-variant="${pkmVariant}"
                 loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display:none; font-size: 24px;">⚡</div>
          </div>
          <div class="pokeskip-member-name">${name}</div>
          <div style="font-size: 11px; color: #94a3b8;">${t('team_level_prefix')}${level}</div>
          ${isMega ? '<div class="pokeskip-mega-badge">🧬 MÉGA</div>' : ''}
        `;
        card.addEventListener('click', () => {
          this.selectedTeamIndex = idx;
          this.renderTeamTab();
        });
        teamContainer.appendChild(card);
      });

      // Emplacements vides pour compléter jusqu'à 6 membres
      const MAX_PARTY_SLOTS = 6;
      for (let emptyIdx = party.length; emptyIdx < MAX_PARTY_SLOTS; emptyIdx++) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'pokeskip-member-card empty-slot';
        emptyCard.innerHTML = `
          <div class="pokeskip-member-sprite-container empty-sprite">
            <div class="pokeskip-empty-slot-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
          </div>
          <div class="pokeskip-member-name empty-name">Slot #${emptyIdx + 1}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">${isFrench() ? 'Libre' : 'Empty'}</div>
        `;
        teamContainer.appendChild(emptyCard);
      }

      const currentPkmn = party[this.selectedTeamIndex] || party[0];
      if (currentPkmn) {
        this.renderPokemonMoveConfig(contentContainer, currentPkmn);
      }
    },

    renderPokemonMoveConfig(container, pokemon) {
      const familyInfo = LineageManager.getFamilyInfo(pokemon);
      const currentName = LineageManager.getPokemonDisplayName(pokemon);
      const shinyInfo = LineageManager.getPokemonShinyInfo(pokemon);
      const isMega = LineageManager.isPokemonMega(pokemon);
      const isGmax = LineageManager.isPokemonGigantamax(pokemon);
      const currentSpeciesId = pokemon.species?.speciesId ?? pokemon.speciesId ?? LineageManager.getRootId(pokemon);
      const memberSprites = LineageManager.getLineageMemberSprites(familyInfo.familyKey, shinyInfo.isShiny, pokemon);
      const rule = PokeSkip.getFamilyRule(familyInfo.familyKey) || { skippedMoves: {}, skipAll: false };
      const isRuleActive = PokeSkip.isFamilyRuleEnabled(familyInfo.familyKey);

      // Récupération de TOUTES les attaques apprenables (futures + actuelles)
      const learnable = getPokemonFullLearnset(pokemon);

      const lineageLabel = isFrench() ? `Lignée de <b>${currentName}</b>` : `<b>${currentName}</b>'s Line`;
      const ruleStatusLabel = isRuleActive ? (isFrench() ? 'Paramétrage actif' : 'Rules active') : (isFrench() ? 'Paramétrage en pause' : 'Rules paused');

      container.innerHTML = `
        <div class="pokeskip-lineage-header-box">
          <div class="pokeskip-lineage-title-row">
            <div class="pokeskip-lineage-title">
              <span>${lineageLabel}</span>
              <span class="pokeskip-lineage-lvl">${t('team_level_prefix')}${pokemon.level || 1}</span>
              ${shinyInfo.isShiny ? `<span class="pokeskip-shiny-badge ${shinyInfo.className}" style="position:static;" title="${shinyInfo.title}">${shinyInfo.stars}</span>` : ''}
              ${isMega ? '<span class="pokeskip-mega-badge">🧬 MÉGA</span>' : ''}
              ${isGmax ? '<span class="pokeskip-gmax-badge">💥 GMAX</span>' : ''}
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <label class="pokeskip-switch-label" title="${t('team_pause_rules')}">
                <span class="pokeskip-switch-text ${isRuleActive ? 'active' : ''}" id="pokeskip-lineage-switch-text">
                  ${ruleStatusLabel}
                </span>
                <span class="pokeskip-switch">
                  <input type="checkbox" id="pokeskip-toggle-lineage-active" ${isRuleActive ? 'checked' : ''}>
                  <span class="pokeskip-slider"></span>
                </span>
              </label>
            </div>
          </div>

          ${LineageManager.renderEvolutionChainHtml(memberSprites, currentSpeciesId, false)}
        </div>

        <div style="background: #0f172a; padding: 16px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.2);">
          <div id="pokeskip-pokemon-replacements-slot"></div>

          <div style="display: flex; gap: 10px; margin-bottom: 14px; margin-top: 14px;">
            <input type="text" id="pokeskip-move-filter" placeholder="${t('team_search_placeholder')}" style="background:#111a2e; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:7px 12px; color:#fff; font-size:13px; outline:none; flex:1;">
          </div>

          <div class="pokeskip-moves-container" id="pokeskip-moves-grid-el"></div>
        </div>
      `;

      const grid = container.querySelector('#pokeskip-moves-grid-el');
      const lineageToggleInput = container.querySelector('#pokeskip-toggle-lineage-active');
      const lineageToggleText = container.querySelector('#pokeskip-lineage-switch-text');

      const updateLineageToggle = () => {
        const active = PokeSkip.isFamilyRuleEnabled(familyInfo.familyKey);
        if (lineageToggleInput) lineageToggleInput.checked = active;
        if (lineageToggleText) {
          lineageToggleText.className = `pokeskip-switch-text ${active ? 'active' : ''}`;
          lineageToggleText.textContent = active ? (isFrench() ? 'Paramétrage actif' : 'Rules active') : (isFrench() ? 'Paramétrage en pause' : 'Rules paused');
        }
      };

      if (lineageToggleInput) {
        lineageToggleInput.addEventListener('change', () => {
          const isNowActive = PokeSkip.toggleFamilyRuleEnabled(familyInfo.familyKey);
          updateLineageToggle();
          if (isNowActive) {
            UI.showToast(t('toast_lineage_resumed', { name: currentName }), 'success');
          } else {
            UI.showToast(t('toast_lineage_paused', { name: currentName }), 'info');
          }
        });
      }

      const renderGrid = (filter = '') => {
        grid.innerHTML = '';
        const currentRule = PokeSkip.getFamilyRule(familyInfo.familyKey) || { skippedMoves: {} };

        const filtered = learnable.filter(m => {
          if (!filter) return true;
          const f = filter.toLowerCase();
          const isEggFilter = f.includes('oeuf') || f.includes('œuf') || f.includes('egg');
          return m.name.toLowerCase().includes(f)
            || (m.evolutionSpecies && m.evolutionSpecies.toLowerCase().includes(f))
            || (isEggFilter && (m.level === 'Œuf' || m.isEgg));
        });

        if (filtered.length === 0) {
          grid.innerHTML = `<div style="color: #64748b; font-size: 13px; text-align: center; padding: 20px;">${t('team_no_moves')}</div>`;
          return;
        }

        filtered.forEach(moveItem => {
          const isEggMove = moveItem.isEgg || moveItem.level === 'Œuf' || moveItem.level === 'Egg';
          const isSkipped = !isEggMove && PokeSkip.isMoveSkipped(pokemon, moveItem.name, moveItem.moveId);
          const isKept = !isSkipped;

          // État "Ne plus demander" et liaison Mode Avancé
          const isAutoReplacement = !isEggMove && PokeSkip.settings.advancedMode && PokeSkip.isMoveAutoReplacementTarget(pokemon, moveItem.name, moveItem.moveId);
          const isPromptSuppressed = isAutoReplacement || (!isEggMove && PokeSkip.isMovePromptSuppressed(pokemon, moveItem.name, moveItem.moveId));
          const isSilenceDisabled = isAutoReplacement;
          const silenceTooltip = isAutoReplacement
            ? (isFrench() ? "Cette attaque remplace automatiquement une autre capacité (Mode Avancé) : elle ne peut pas être promptée pour être ignorée." : "This move automatically replaces another move (Advanced Mode): it cannot be prompted for skip.")
            : (isPromptSuppressed
              ? (isFrench() ? "Ne plus demander d'ignorer cette attaque en combat (cliquer pour réactiver le prompt)" : "Do not ask to skip this move in battle (click to re-enable prompt)")
              : (isFrench() ? "Cliquer pour ne plus être interrogé en combat pour ignorer cette attaque" : "Click to no longer be prompted to skip this move in battle"));

          const cardEl = document.createElement('div');
          cardEl.className = `pokeskip-move-card ${isSkipped ? 'skipped' : ''}`;
          if (isEggMove) {
            cardEl.style.cursor = 'default';
          }

          let lvlStyle = '';
          if (moveItem.level === 'Actuelle') {
            lvlStyle = 'style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);"';
          } else if (moveItem.level === 'Évolution') {
            lvlStyle = 'style="background: rgba(56, 189, 248, 0.18); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35);"';
          } else if (isEggMove) {
            lvlStyle = 'style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);"';
          }

          let lvlLabel = typeof moveItem.level === 'number' ? `${t('team_level_prefix')}${moveItem.level}` : (moveItem.level === 'Œuf' || moveItem.level === 'Egg' ? t('team_egg_badge') : moveItem.level);
          if (isEggMove) {
            lvlLabel = t('team_egg_badge');
          }

          const keptText = isKept ? (isFrench() ? '✓ Gardée' : '✓ Kept') : (isFrench() ? '✕ Ignorée' : '✕ Skipped');
          const silenceText = isAutoReplacement ? (isFrench() ? '🔄 Remplacement auto' : '🔄 Auto replace') : (isFrench() ? '🔕 Ne plus demander' : '🔕 Never ask');

          cardEl.innerHTML = `
            <div class="pokeskip-move-action">
              ${isEggMove ? `
                <span class="pokeskip-egg-badge" title="${t('team_egg_badge')}">${t('team_egg_badge')}</span>
              ` : `
                <label class="pokeskip-silence-label ${isAutoReplacement ? 'disabled' : ''}" title="${silenceTooltip}">
                  <input type="checkbox" class="pokeskip-checkbox pokeskip-silence-checkbox" ${isPromptSuppressed ? 'checked' : ''} ${isSilenceDisabled ? 'disabled' : ''}>
                  <span class="pokeskip-silence-badge ${isPromptSuppressed ? 'silenced' : ''} ${isAutoReplacement ? 'auto' : ''}">${silenceText}</span>
                </label>
                <div class="pokeskip-keep-action" title="${isKept ? t('team_keep_title') : t('team_skip_title')}">
                  <span class="pokeskip-keep-badge ${isKept ? 'kept' : 'skip'}">${keptText}</span>
                  <input type="checkbox" class="pokeskip-checkbox pokeskip-keep-checkbox" ${isKept ? 'checked' : ''}>
                </div>
              `}
            </div>
            <div class="pokeskip-move-top">
              <div class="pokeskip-move-left">
                <span class="pokeskip-move-lvl-pill" ${lvlStyle}>${lvlLabel}</span>
                <span class="pokeskip-move-name-txt">${moveItem.name}</span>
                ${moveItem.evolutionSpecies ? `<span class="pokeskip-evo-tag" title="${moveItem.evolutionSpecies}">🧬 ${moveItem.evolutionSpecies}</span>` : ''}
                <span class="pokeskip-type-tag" style="background:${moveItem.type.bg}; color:${moveItem.type.color};">${moveItem.type.name}</span>
                <span class="pokeskip-cat-tag" style="color:${moveItem.category.color};">${moveItem.category.icon} ${moveItem.category.name}</span>
              </div>
              <div class="pokeskip-move-stats">
                <span class="pokeskip-stat-pill">⚔️ ${t('team_th_power')} : <b>${moveItem.power}</b></span>
                <span class="pokeskip-stat-pill" style="border-color: rgba(56, 189, 248, 0.3);">🎯 ${t('team_th_acc')} : <b style="color: #38bdf8;">${moveItem.accuracy}</b></span>
                <span class="pokeskip-stat-pill">🔋 PP : <b>${moveItem.pp}</b></span>
              </div>
            </div>
            ${moveItem.desc ? `<div class="pokeskip-move-desc">${moveItem.desc}</div>` : ''}
          `;

          if (!isEggMove) {
            const keepCheckbox = cardEl.querySelector('.pokeskip-keep-checkbox');
            const keepBadge = cardEl.querySelector('.pokeskip-keep-badge');
            const silenceCheckbox = cardEl.querySelector('.pokeskip-silence-checkbox');
            const silenceBadge = cardEl.querySelector('.pokeskip-silence-badge');
            const silenceLabel = cardEl.querySelector('.pokeskip-silence-label');

            const updateCardState = (kept) => {
              keepCheckbox.checked = kept;
              cardEl.classList.toggle('skipped', !kept);
              if (keepBadge) {
                keepBadge.className = `pokeskip-keep-badge ${kept ? 'kept' : 'skip'}`;
                keepBadge.textContent = kept ? (isFrench() ? '✓ Gardée' : '✓ Kept') : (isFrench() ? '✕ Ignorée' : '✕ Skipped');
              }
              PokeSkip.setMoveSkipped(pokemon, currentName, moveItem.name, moveItem.moveId, !kept);
              UI.updateHudBadge();
              updateLineageToggle();
            };

            cardEl.addEventListener('click', (e) => {
              if (e.target.closest('.pokeskip-silence-label')) {
                return;
              }
              if (e.target !== keepCheckbox) {
                updateCardState(!keepCheckbox.checked);
              }
            });

            keepCheckbox.addEventListener('change', () => {
              updateCardState(keepCheckbox.checked);
            });

            if (silenceCheckbox && !isSilenceDisabled) {
              silenceCheckbox.addEventListener('change', (e) => {
                e.stopPropagation();
                const silenced = silenceCheckbox.checked;
                PokeSkip.setMovePromptSuppressed(pokemon, currentName, moveItem.name, moveItem.moveId, silenced);
                if (silenceBadge) {
                  silenceBadge.className = `pokeskip-silence-badge ${silenced ? 'silenced' : ''}`;
                }
              });
            }

            if (silenceLabel) {
              silenceLabel.addEventListener('click', (e) => {
                e.stopPropagation();
              });
            }
          }

          grid.appendChild(cardEl);
        });
      };

      renderGrid();
      updateLineageToggle();

      const filterInput = container.querySelector('#pokeskip-move-filter');
      if (filterInput) {
        ['keydown', 'keyup', 'keypress'].forEach(type => {
          filterInput.addEventListener(type, (e) => {
            e.stopPropagation();
            if (e.key === 'Enter' && type === 'keydown') {
              e.preventDefault();
            }
          });
        });
        filterInput.addEventListener('input', (e) => {
          renderGrid(e.target.value);
        });
      }
      this.isolateInputs(container);

      if (PokeSkip.settings.advancedMode) {
        const slotEl = container.querySelector('#pokeskip-pokemon-replacements-slot');
        if (slotEl) {
          const currentMoveset = typeof pokemon.getMoveset === 'function' ? pokemon.getMoveset() : (pokemon.moveset || []);
          const currentMoveNames = currentMoveset.map(m => {
            if (!m) return '';
            if (typeof m.getName === 'function') return m.getName();
            if (typeof m.getMove === 'function') return m.getMove()?.name || '';
            return m.name || (m.moveId ? PokeSkip.knownMovesCache[m.moveId] : '') || '';
          }).filter(Boolean);

          const refreshReplacements = () => {
            slotEl.innerHTML = '';
            this.renderReplacementSection(slotEl, pokemon, learnable, currentMoveNames, refreshReplacements);
            renderGrid(container.querySelector('#pokeskip-move-filter').value);
          };
          refreshReplacements();
        }
      }
    },
};
