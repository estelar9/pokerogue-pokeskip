// Onglet Règles sauvegardées par espèce / famille
import { PokeSkip } from '../../core/state.js';
import { LineageManager } from '../../core/lineage-manager.js';
import { AssetLoader } from '../../core/asset-loader.js';
import { getPokemonFullLearnset } from '../../core/moves-resolver.js';
import { t } from '../../core/i18n.js';
import { UI } from '../index.js';

export const SavedSpeciesTab = {
    renderSavedSpeciesTab() {
      const container = document.getElementById('pokeskip-saved-species-list');
      if (!container) return;
      container.innerHTML = '';

      const familyKeys = Object.keys(PokeSkip.rules);
      if (familyKeys.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #94a3b8; background: #111a2e; border-radius: 12px;">
            ${t('saved_empty')}
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div style="margin-bottom: 12px; color: #94a3b8; font-size: 13px;">
          ${t('saved_subtitle')}
        </div>
      `;

      familyKeys.forEach(famKey => {
        const rule = PokeSkip.rules[famKey];
        const skippedKeys = Object.keys(rule.skippedMoves || {}).filter(k => !k.startsWith('id_'));
        const memberSprites = LineageManager.getLineageMemberSprites(famKey);

        let cardTitle = rule.lineageName;
        if (!cardTitle || cardTitle.startsWith('Espèce #') || cardTitle.startsWith('Lignée #') || cardTitle.startsWith('Lineage #')) {
          const cleanId = String(rule.familyId || famKey).replace('family_', '');
          const resolved = LineageManager.getSpeciesName(cleanId);
          if (resolved) {
            cardTitle = resolved;
            if (LineageManager.megaFamilies[cleanId] && !cardTitle.includes('(Méga') && !cardTitle.includes('(Mega')) {
              cardTitle += ` ${LineageManager.megaFamilies[cleanId].suffix}`;
            }
            rule.lineageName = cardTitle;
          } else {
            cardTitle = rule.lineageName || t('saved_lineage_fallback', { id: cleanId });
          }
        }

        const el = document.createElement('div');
        el.className = 'pokeskip-saved-species-card';
        el.style.flexDirection = 'column';
        el.style.alignItems = 'stretch';
        el.style.gap = '12px';
        el.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="font-size: 16px; font-weight: 700; color: #fff;">${cardTitle}</div>
              ${rule.enabled === false ? `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">${t('saved_paused')}</span>` : ''}
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
              <button class="pokeskip-btn-edit-lineage" style="background:#0369a1; border:1px solid #38bdf8; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600; white-space:nowrap;">
                ${t('saved_edit_btn')}
              </button>
              <button class="pokeskip-btn-del-lineage" style="background:rgba(225,29,72,0.2); border:1px solid rgba(225,29,72,0.4); color:#fda4af; padding:6px 10px; border-radius:6px; font-size:12px; cursor:pointer; white-space:nowrap;" title="${t('saved_del_btn')}">
                ✕
              </button>
            </div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05);">
            ${LineageManager.renderEvolutionChainHtml(memberSprites, null, true)}
          </div>

          <div style="font-size: 12px; color: ${rule.enabled === false ? '#94a3b8' : '#38bdf8'};">
            ${skippedKeys.length > 0 ? t('saved_skipped_summary', { count: skippedKeys.length, moves: skippedKeys.join(', ') }) : t('saved_none_skipped')}
          </div>
        `;

        el.addEventListener('click', (e) => {
          if (e.target.closest('.pokeskip-btn-del-lineage')) {
            e.stopPropagation();
            if (confirm(t('saved_confirm_del', { name: rule.lineageName }))) {
              PokeSkip.deleteFamilyRule(famKey);
              this.renderSavedSpeciesTab();
              const singleName = LineageManager.getSinglePokemonName(famKey, rule);
              UI.showToast(t('toast_single_rule_deleted', { name: singleName }), 'info');
            }
            return;
          }
          this.renderFamilyRuleEditor(container, famKey);
        });

        container.appendChild(el);
      });
    },

    renderFamilyRuleEditor(container, famKey) {
      const rule = PokeSkip.rules[famKey];
      if (!rule) {
        this.renderSavedSpeciesTab();
        return;
      }
      const memberSprites = LineageManager.getLineageMemberSprites(famKey);
      const skippedList = Object.keys(rule.skippedMoves || {}).filter(k => !k.startsWith('id_'));

      // Vérifier si un membre de cette lignée est actuellement dans l'équipe active
      const teamIdx = PokeSkip.activeParty.findIndex(p => LineageManager.getFamilyKey(p) === famKey);

      let editorTitle = rule.lineageName;
      if (!editorTitle || editorTitle.startsWith('Espèce #') || editorTitle.startsWith('Lignée #') || editorTitle.startsWith('Lineage #')) {
        const rootId = String(rule.familyId || famKey).replace('family_', '');
        const resolved = LineageManager.getSpeciesName(rootId);
        if (resolved) {
          editorTitle = resolved;
          if (LineageManager.megaFamilies[rootId] && !editorTitle.includes('(Méga') && !editorTitle.includes('(Mega')) {
            editorTitle += ` ${LineageManager.megaFamilies[rootId].suffix}`;
          }
          rule.lineageName = editorTitle;
        } else {
          editorTitle = rule.lineageName || t('saved_lineage_fallback', { id: rootId });
        }
      }

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <button id="pokeskip-btn-back-saved" style="background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.12); padding: 7px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              ${t('saved_back_btn')}
            </button>
            ${teamIdx !== -1 ? `
              <button id="pokeskip-btn-open-in-team" style="background: #0284c7; color: #fff; border: 1px solid #38bdf8; padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600;">
                ${t('saved_view_in_team')}
              </button>
            ` : ''}
          </div>

          <div class="pokeskip-lineage-header-box">
            <div class="pokeskip-lineage-title-row">
              <div class="pokeskip-lineage-title">
                <span>${t('saved_lineage_label', { name: editorTitle })}</span>
                ${rule.enabled === false ? `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">${t('saved_paused')}</span>` : ''}
              </div>
              <div style="font-size: 12px; color: #94a3b8;">
                ${t('saved_lineage_desc')}
              </div>
            </div>

            ${LineageManager.renderEvolutionChainHtml(memberSprites, null, true)}
          </div>

          <!-- Section Ajout rapide d'une attaque à ignorer -->
          <div style="background: #111a2e; padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); display: flex; gap: 10px; align-items: center;">
            <input type="text" id="pokeskip-input-add-move" placeholder="${t('saved_add_placeholder')}" style="flex: 1; background: #090e1a; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 13px; outline: none;">
            <button id="pokeskip-btn-add-move" style="background: #e11d48; color: #fff; border: 1px solid #fda4af; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 600; white-space: nowrap;">
              ${t('saved_add_btn')}
            </button>
          </div>

          <!-- Liste des capacités ignorées -->
          <div style="background: #111a2e; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="font-size: 14px; font-weight: 700; color: #f8fafc;">
                ${t('saved_current_ignored_title', { count: skippedList.length })}
              </div>
              ${skippedList.length > 0 ? `
                <button id="pokeskip-btn-clear-lineage-moves" style="background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                  ${t('saved_restore_all_btn')}
                </button>
              ` : ''}
            </div>

            <div id="pokeskip-family-moves-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
              ${skippedList.length === 0 ? `
                <div style="color: #64748b; font-size: 13px; text-align: center; padding: 22px;">
                  ${t('saved_no_moves_ignored')}
                </div>
              ` : skippedList.map(mvKey => {
                const displayName = mvKey.charAt(0).toUpperCase() + mvKey.slice(1);
                return `
                  <div style="background: #090e1a; border: 1px solid rgba(244,63,94,0.3); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="color: #f43f5e; font-weight: 700; font-size: 13px;">${t('saved_badge_ignored')}</span>
                      <span style="color: #fff; font-weight: 600; font-size: 14px;">${displayName}</span>
                    </div>
                    <button class="pokeskip-btn-unskip-move" data-move="${mvKey}" style="background: #10b981; color: #fff; border: 1px solid #34d399; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">
                      ${t('saved_keep_again')}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;

      // Bouton retour
      container.querySelector('#pokeskip-btn-back-saved').addEventListener('click', () => {
        this.renderSavedSpeciesTab();
      });

      // Bouton "Voir dans l'Équipe Actuelle" si présent
      const btnOpenTeam = container.querySelector('#pokeskip-btn-open-in-team');
      if (btnOpenTeam && teamIdx !== -1) {
        btnOpenTeam.addEventListener('click', () => {
          this.selectedTeamIndex = teamIdx;
          const tabBtn = document.querySelector('.pokeskip-tab-btn[data-tab="team"]');
          if (tabBtn) tabBtn.click();
        });
      }

      const singleName = LineageManager.getSinglePokemonName(famKey, rule);

      // Ajout manuel d'une capacité
      const inputAdd = container.querySelector('#pokeskip-input-add-move');
      const btnAdd = container.querySelector('#pokeskip-btn-add-move');
      const handleAdd = () => {
        const val = inputAdd.value.trim();
        if (!val) return;
        PokeSkip.setMoveSkipped(famKey, rule.lineageName, val, null, true);
        UI.showToast(t('toast_single_move_skipped', { move: val, name: singleName }), 'warning');
        this.renderFamilyRuleEditor(container, famKey);
      };
      btnAdd.addEventListener('click', handleAdd);
      if (inputAdd) {
        ['keydown', 'keyup', 'keypress'].forEach(type => {
          inputAdd.addEventListener(type, (e) => {
            e.stopPropagation();
            if (e.key === 'Enter' && type === 'keydown') {
              e.preventDefault();
              handleAdd();
            }
          });
        });
      }
      this.isolateInputs(container);

      // Rétablir tout
      const btnClearAll = container.querySelector('#pokeskip-btn-clear-lineage-moves');
      if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
          rule.skippedMoves = {};
          rule.updatedAt = Date.now();
          PokeSkip.saveRules();
          UI.showToast(t('toast_all_moves_restored', { name: singleName }), 'info');
          this.renderFamilyRuleEditor(container, famKey);
        });
      }

      // Boutons individuels "Garder à nouveau"
      container.querySelectorAll('.pokeskip-btn-unskip-move').forEach(btn => {
        btn.addEventListener('click', () => {
          const moveKey = btn.dataset.move;
          delete rule.skippedMoves[moveKey];
          rule.updatedAt = Date.now();
          PokeSkip.saveRules();
          UI.showToast(t('toast_single_move_restored', { move: moveKey, name: singleName }), 'success');
          this.renderFamilyRuleEditor(container, famKey);
        });
      });

      if (PokeSkip.settings.advancedMode) {
        const rootId = LineageManager.getRootId(famKey);
        const activePartyMember = teamIdx !== -1 ? PokeSkip.activeParty[teamIdx] : (rootId ? { speciesId: rootId } : null);
        let partyCurrentMoves = [];
        let partyLearnable = [];
        if (activePartyMember) {
          const ms = typeof activePartyMember.getMoveset === 'function' ? activePartyMember.getMoveset() : (activePartyMember.moveset || []);
          partyCurrentMoves = ms.map(m => {
            if (!m) return '';
            if (typeof m.getName === 'function') return m.getName();
            if (typeof m.getMove === 'function') return m.getMove()?.name || '';
            return m.name || '';
          }).filter(Boolean);
          partyLearnable = getPokemonFullLearnset(activePartyMember);
        }

        const repWrapper = document.createElement('div');
        container.firstElementChild.appendChild(repWrapper);

        const refreshReplacements = () => {
          repWrapper.innerHTML = '';
          this.renderReplacementSection(repWrapper, famKey, partyLearnable, partyCurrentMoves, refreshReplacements);
        };
        refreshReplacements();
      }
    },
};
