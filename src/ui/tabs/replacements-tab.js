// Section et règles de remplacement automatique de capacités
import { PokeSkip } from '../../core/state.js';
import { LineageManager } from '../../core/lineage-manager.js';
import { AssetLoader } from '../../core/asset-loader.js';
import { getPokemonFullLearnset } from '../../core/moves-resolver.js';
import { POKEMON_TYPES, MOVE_CATEGORIES } from '../../constants/types.js';
import { t, getCurrentLang } from '../../core/i18n.js';
import { UI } from '../index.js';

export const ReplacementsTab = {
    renderReplacementSection(container, target, defaultLearnable = [], defaultCurrent = [], onUpdate = null) {
      if (!PokeSkip.settings.advancedMode) return;

      const familyInfo = LineageManager.getFamilyInfo(target);
      const famKey = familyInfo.familyKey;
      const replacements = PokeSkip.getFamilyReplacements(target);
      const activeCount = replacements.filter(r => r.enabled).length;

      // Préparation et déduplication des capacités avec leurs niveaux
      const moveMap = new Map();

      const getMoveLevelWeight = (lvl) => {
        if (typeof lvl === 'number') {
          if (lvl < 0) return 0;
          if (lvl === 0) return 0.5;
          return lvl;
        }
        if (typeof lvl === 'string') {
          const s = lvl.trim().toLowerCase();
          if (s.includes('départ') || s.includes('depart') || s.includes('start')) return 0;
          if (s.includes('œuf') || s.includes('oeuf') || s.includes('egg')) return 0.2;
          if (s.includes('évol') || s.includes('evol')) return 0.5;
          if (s.includes('actuelle') || s.includes('current')) return 0.1;
          const match = s.match(/\d+/);
          if (match) return parseInt(match[0], 10);
        }
        return 999;
      };

      if (Array.isArray(defaultLearnable)) {
        for (const item of defaultLearnable) {
          if (!item) continue;
          const rawName = typeof item === 'string' ? item : item.name;
          const name = (rawName || '').trim();
          if (!name) continue;
          const key = name.toLowerCase();
          const level = typeof item === 'object' && item.level !== undefined ? item.level : null;
          const weight = getMoveLevelWeight(level);
          const evolutionSpecies = (typeof item === 'object' && item.evolutionSpecies) ? item.evolutionSpecies : null;

          if (!moveMap.has(key)) {
            moveMap.set(key, { name, level, isCurrent: false, weight, evolutionSpecies });
          } else {
            const existing = moveMap.get(key);
            if (existing.weight === 999 && weight !== 999) {
              existing.level = level;
              existing.weight = weight;
              if (evolutionSpecies) existing.evolutionSpecies = evolutionSpecies;
            }
          }
        }
      }

      if (Array.isArray(defaultCurrent)) {
        for (const item of defaultCurrent) {
          if (!item) continue;
          const rawName = typeof item === 'string' ? item : item.name;
          const name = (rawName || '').trim();
          if (!name) continue;
          const key = name.toLowerCase();
          if (moveMap.has(key)) {
            moveMap.get(key).isCurrent = true;
          } else {
            moveMap.set(key, { name, level: 'Actuelle', isCurrent: true, weight: 0.1 });
          }
        }
      }

      const familyRule = PokeSkip.getFamilyRule(target);
      if (familyRule) {
        if (familyRule.skippedMoves) {
          for (const rawName of Object.keys(familyRule.skippedMoves)) {
            if (rawName.startsWith('id_')) continue;
            const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            const key = name.toLowerCase();
            if (!moveMap.has(key)) {
              moveMap.set(key, { name, level: null, isCurrent: false, weight: 999 });
            }
          }
        }
        if (Array.isArray(familyRule.replacements)) {
          for (const rep of familyRule.replacements) {
            if (rep.oldMoveName && !moveMap.has(rep.oldMoveName.toLowerCase())) {
              moveMap.set(rep.oldMoveName.toLowerCase(), { name: rep.oldMoveName, level: null, isCurrent: false, weight: 999 });
            }
            if (rep.newMoveName && !moveMap.has(rep.newMoveName.toLowerCase())) {
              moveMap.set(rep.newMoveName.toLowerCase(), { name: rep.newMoveName, level: null, isCurrent: false, weight: 999 });
            }
          }
        }
      }

      // Tri strict par niveau obtenu croissant, puis ordre alphabétique
      const sortedMoves = Array.from(moveMap.values()).sort((a, b) => {
        if (a.weight !== b.weight) {
          return a.weight - b.weight;
        }
        return a.name.localeCompare(b.name, getCurrentLang());
      });

      const formatOptionText = (m, showCurrentBadge = true) => {
        let prefix = '';
        if (m.level !== undefined && m.level !== null && m.level !== '') {
          if (typeof m.level === 'number') {
            if (m.level < 0) prefix = t('rep_opt_start');
            else if (m.level === 0) prefix = t('rep_opt_evol');
            else prefix = t('rep_opt_level', { level: m.level });
          } else {
            const s = String(m.level).trim();
            if (/^\d+$/.test(s)) prefix = t('rep_opt_level', { level: s });
            else if (/œuf|oeuf|egg/i.test(s)) prefix = t('rep_opt_egg');
            else if (/évol/i.test(s)) prefix = t('rep_opt_evol');
            else if (/départ|depart|start/i.test(s)) prefix = t('rep_opt_start');
            else if (/actuelle|current/i.test(s)) prefix = t('rep_opt_current');
            else prefix = `[${s}] `;
          }
        } else if (m.isCurrent && showCurrentBadge) {
          prefix = t('rep_opt_current');
        }

        const evoSuffix = m.evolutionSpecies ? ` (${m.evolutionSpecies})` : '';
        const currentPrefix = t('rep_opt_current');
        const suffix = (m.isCurrent && showCurrentBadge && prefix !== currentPrefix) ? t('rep_opt_suffix_current') : '';
        return `${prefix}${m.name}${evoSuffix}${suffix}`;
      };

      const uniqueRand = Math.random().toString(36).substring(2, 6);
      const newDatalistId = `datalist-new-${uniqueRand}`;
      const oldDatalistId = `datalist-old-${uniqueRand}`;

      const secEl = document.createElement('div');
      secEl.className = 'pokeskip-replacement-section';
      secEl.style.cssText = 'margin-top: 14px; background: #080e1e; border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 12px; padding: 14px;';

      secEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 15px;">⚡</span>
            <span style="font-size: 13px; font-weight: 700; color: #c084fc;">
              ${t('rep_header')}
            </span>
            <span style="font-size: 11px; background: rgba(168, 85, 247, 0.2); color: #d8b4fe; padding: 2px 7px; border-radius: 10px; font-weight: 600;">
              ${t('rep_active_count', { active: activeCount, total: replacements.length })}
            </span>
          </div>
          ${replacements.length > 0 ? `
            <button class="pokeskip-btn-clear-rep" style="background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">
              ${t('rep_clear_all', { count: replacements.length })}
            </button>
          ` : ''}
        </div>

        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px; line-height: 1.4;">
          ${t('rep_desc')}
        </div>

        <!-- Formulaire d'ajout : Ancienne attaque d'abord, puis Nouvelle attaque -->
        <div style="background: #111a2e; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 12px;">
          <div style="font-size: 12px; font-weight: 600; color: #f8fafc; margin-bottom: 8px;">
            ${t('rep_add_title')}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 170px;">
              <div style="font-size: 11px; color: #f43f5e; font-weight: 600; margin-bottom: 3px;">${t('rep_label_old')}</div>
              <input type="text" class="pokeskip-rep-input-old" list="${oldDatalistId}" placeholder="${t('rep_placeholder_old')}" style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 6px; padding: 6px 10px; color: #fff; font-size: 12px; outline: none;">
              <datalist id="${oldDatalistId}">
                ${sortedMoves.map(m => `<option value="${formatOptionText(m, true)}" label="${formatOptionText(m, true)}">`).join('')}
              </datalist>
            </div>

            <div style="color: #c084fc; font-weight: bold; font-size: 14px; padding-top: 16px; white-space: nowrap;">${t('rep_arrow')}</div>

            <div style="flex: 1; min-width: 170px;">
              <div style="font-size: 11px; color: #38bdf8; font-weight: 600; margin-bottom: 3px;">${t('rep_label_new')}</div>
              <input type="text" class="pokeskip-rep-input-new" list="${newDatalistId}" placeholder="${t('rep_placeholder_new')}" style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 6px 10px; color: #fff; font-size: 12px; outline: none;">
              <datalist id="${newDatalistId}">
                ${sortedMoves.map(m => `<option value="${formatOptionText(m, false)}" label="${formatOptionText(m, false)}">`).join('')}
              </datalist>
            </div>

            <div style="padding-top: 16px;">
              <button class="pokeskip-btn-add-rep" style="background: #7e22ce; color: #fff; border: 1px solid #c084fc; padding: 7px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                ${t('rep_save_btn')}
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des règles -->
        <div class="pokeskip-rep-list-container" style="display: flex; flex-direction: column; gap: 6px;">
          ${replacements.length === 0 ? `
            <div style="color: #64748b; font-size: 12px; text-align: center; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 6px;">
              ${t('rep_empty', { name: familyInfo.lineageName })}
            </div>
          ` : replacements.map(r => `
            <div style="background: #111a2e; border: 1px solid ${r.enabled ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; opacity: ${r.enabled ? '1' : '0.6'};">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 12px; color: #94a3b8;">${t('rep_label_old').replace(' :', '').replace(':', '')}</span>
                <span style="font-weight: 700; color: #f43f5e; font-size: 13px;">${r.oldMoveName}</span>
                <span style="color: #a855f7; font-size: 12px; font-weight: bold;">${t('rep_arrow')}</span>
                <span style="font-weight: 700; color: #38bdf8; font-size: 13px;">${r.newMoveName}</span>
                <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${r.enabled ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)'}; color: ${r.enabled ? '#c084fc' : '#94a3b8'};">
                  ${r.enabled ? t('rep_status_active') : t('rep_status_disabled')}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button class="pokeskip-btn-toggle-single-rep" data-id="${r.id}" style="background: ${r.enabled ? '#334155' : '#7e22ce'}; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                  ${r.enabled ? t('rep_toggle_disable') : t('rep_toggle_enable')}
                </button>
                <button class="pokeskip-btn-delete-single-rep" data-id="${r.id}" style="background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;" title="${t('saved_del_btn')}">
                  🗑️
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      container.appendChild(secEl);

      const inputOld = secEl.querySelector('.pokeskip-rep-input-old');
      const inputNew = secEl.querySelector('.pokeskip-rep-input-new');
      const btnAdd = secEl.querySelector('.pokeskip-btn-add-rep');

      const cleanMoveName = (raw) => {
        if (!raw) return '';
        return String(raw)
          .replace(/^\[.*?\]\s*/, '')
          .replace(/\s*\(.*?\)$/, '')
          .trim();
      };

      const handleAdd = () => {
        const rawOld = inputOld?.value.trim();
        const rawNew = inputNew?.value.trim();
        const oldM = cleanMoveName(rawOld);
        const newM = cleanMoveName(rawNew);

        if (!oldM || !newM) {
          UI.showToast(t('toast_rep_missing_inputs'), 'warning');
          return;
        }
        if (newM.toLowerCase() === oldM.toLowerCase()) {
          UI.showToast(t('toast_rep_identical_inputs'), 'warning');
          return;
        }

        const findMoveId = (mName) => {
          const norm = mName.trim().toLowerCase();
          if (Array.isArray(defaultCurrent)) {
            const found = defaultCurrent.find(m => m && typeof m === 'object' && (m.name || '').trim().toLowerCase() === norm);
            if (found && (found.moveId || found.id)) return found.moveId || found.id;
          }
          if (Array.isArray(defaultLearnable)) {
            const found = defaultLearnable.find(m => m && typeof m === 'object' && (m.name || '').trim().toLowerCase() === norm);
            if (found && (found.moveId || found.id)) return found.moveId || found.id;
          }
          if (PokeSkip.knownMovesCache) {
            for (const [idStr, name] of Object.entries(PokeSkip.knownMovesCache)) {
              if (name && name.trim().toLowerCase() === norm) return Number(idStr);
            }
          }
          return LineageManager.findMoveIdByName ? LineageManager.findMoveIdByName(mName) : null;
        };

        const oldId = findMoveId(oldM);
        const newId = findMoveId(newM);

        PokeSkip.addReplacementRule(target, newM, oldM, newId, oldId);
        PokeSkip.setMoveSkipped(target, null, newM, newId, false);

        const resolveMoveInfo = (moveName) => {
          if (!moveName) return { name: '', type: null, category: null };
          const lower = moveName.trim().toLowerCase();
          if (Array.isArray(defaultLearnable)) {
            const found = defaultLearnable.find(m => m && m.name && m.name.trim().toLowerCase() === lower);
            if (found) {
              return {
                name: found.name || moveName,
                type: found.type || null,
                category: found.category || null
              };
            }
          }
          let foundId = null;
          if (PokeSkip.knownMovesCache) {
            for (const [idStr, mName] of Object.entries(PokeSkip.knownMovesCache)) {
              if (mName && mName.trim().toLowerCase() === lower) {
                foundId = Number(idStr);
                break;
              }
            }
          }
          const pokemonRef = (target && typeof target === 'object') ? target : null;
          return LineageManager.getMoveDetails(moveName, foundId, pokemonRef);
        };

        const oldMoveDetails = resolveMoveInfo(oldM);
        const newMoveDetails = resolveMoveInfo(newM);

        const getMoveTypeColor = (m) => (m && m.type && m.type.bg) ? (
          m.type.name === 'Combat' || m.type.name === 'Fighting' ? '#ea580c' :
          m.type.name === 'Ténèbres' || m.type.name === 'Dark' ? '#c4a482' :
          m.type.name === 'Poison' ? '#a855f7' :
          m.type.bg
        ) : '#38bdf8';

        const oldTypeColor = getMoveTypeColor(oldMoveDetails);
        const newTypeColor = getMoveTypeColor(newMoveDetails);
        const oldCatIcon = oldMoveDetails?.category?.icon || '🌀';
        const newCatIcon = newMoveDetails?.category?.icon || '💥';
        const oldTooltip = [oldMoveDetails?.type?.name, oldMoveDetails?.category?.name].filter(Boolean).join(' • ');
        const newTooltip = [newMoveDetails?.type?.name, newMoveDetails?.category?.name].filter(Boolean).join(' • ');
        const pokemonName = LineageManager.getSinglePokemonName(target);

        const oldHtml = `<span title="${oldTooltip}">${oldCatIcon} <b style="color: ${oldTypeColor} !important;">${oldMoveDetails.name || oldM}</b></span>`;
        const newHtml = `<span title="${newTooltip}">${newCatIcon} <b style="color: ${newTypeColor} !important;">${newMoveDetails.name || newM}</b></span>`;
        const pokeHtml = `<b style="color: #38bdf8 !important;">${pokemonName}</b>`;

        UI.showToast(
          t('rep_toast_success', { oldHtml, newHtml, pokeHtml }),
          'advanced',
          PokeSkip.settings.toastDuration || 2800
        );
        if (typeof onUpdate === 'function') {
          onUpdate();
        }
      };

      btnAdd?.addEventListener('click', handleAdd);

      const isolateRepInput = (inp, onEnter) => {
        if (!inp) return;
        ['keydown', 'keyup', 'keypress'].forEach(type => {
          inp.addEventListener(type, (e) => {
            e.stopPropagation();
            if (e.key === 'Enter' && type === 'keydown') {
              e.preventDefault();
              if (typeof onEnter === 'function') onEnter();
            }
          });
        });
      };

      isolateRepInput(inputOld, () => {
        if (!inputNew?.value.trim()) {
          inputNew?.focus();
          try { if (typeof inputNew.showPicker === 'function') inputNew.showPicker(); } catch (err) {}
        } else {
          handleAdd();
        }
      });

      isolateRepInput(inputNew, () => {
        handleAdd();
      });

      inputOld?.addEventListener('click', () => {
        try { if (typeof inputOld.showPicker === 'function') inputOld.showPicker(); } catch (err) {}
      });
      inputNew?.addEventListener('click', () => {
        try { if (typeof inputNew.showPicker === 'function') inputNew.showPicker(); } catch (err) {}
      });

      this.isolateInputs(secEl);

      secEl.querySelectorAll('.pokeskip-btn-toggle-single-rep').forEach(btn => {
        btn.addEventListener('click', () => {
          const ruleId = btn.getAttribute('data-id');
          PokeSkip.toggleReplacementRule(target, ruleId);
          if (typeof onUpdate === 'function') onUpdate();
        });
      });

      secEl.querySelectorAll('.pokeskip-btn-delete-single-rep').forEach(btn => {
        btn.addEventListener('click', () => {
          const ruleId = btn.getAttribute('data-id');
          PokeSkip.deleteReplacementRule(target, ruleId);
          UI.showToast(t('toast_rep_deleted'), 'info');
          if (typeof onUpdate === 'function') onUpdate();
        });
      });

      const btnClear = secEl.querySelector('.pokeskip-btn-clear-rep');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          if (confirm(t('rep_confirm_clear', { name: familyInfo.lineageName }))) {
            PokeSkip.clearAllReplacements(target);
            const targetName = LineageManager.getSinglePokemonName(target);
            UI.showToast(t('toast_rep_all_deleted', { name: targetName }), 'info');
            if (typeof onUpdate === 'function') onUpdate();
          }
        });
      }
    },
};
