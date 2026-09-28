// Visualiseur d'efficacité des types & analyse de combat
import { PokeSkip } from '../core/state.js';
import { POKEMON_TYPES, TYPE_CHART } from '../constants/types.js';
import { getActiveEnemyTypes } from '../core/battle-analyzer.js';
import { PokeStorage } from '../core/storage.js';
import { UI } from './index.js';

export const TypeChart = {
    createTypeChartContainer() {
      if (document.getElementById('pokeskip-typechart-overlay')) {
        this.typeChartContainer = document.getElementById('pokeskip-typechart-overlay');
        this.typeChartViewMode = PokeStorage.get('pokeskip_typechart_view_mode', 'simplified');
        this.typeChartShowImmunities = PokeStorage.get('pokeskip_typechart_show_immunities', true);
        return;
      }
      this.typeChartViewMode = PokeStorage.get('pokeskip_typechart_view_mode', 'simplified');
      this.typeChartShowImmunities = PokeStorage.get('pokeskip_typechart_show_immunities', true);
      const overlay = document.createElement('div');
      overlay.id = 'pokeskip-typechart-overlay';
      const stopOverlayKeyboard = (e) => {
        if (e.key === 'Escape' && e.type === 'keydown') {
          this.hideTypeChart(false);
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        e.stopPropagation();
      };
      ['keydown', 'keyup', 'keypress'].forEach(type => {
        overlay.addEventListener(type, stopOverlayKeyboard);
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hideTypeChart(false);
        }
      });
      document.body.appendChild(overlay);
      this.typeChartContainer = overlay;
      this.isolateInputs(overlay);
    },

    getTypeChartContentHtml(mode) {
      const enemyInfo = getActiveEnemyTypes();
      const enemyTypeIndices = enemyInfo.types || [];
      const types18 = POKEMON_TYPES.slice(0, 18);

      let bodyHtml = '';
      let footerHtml = '';

      if (mode === 'table') {
        bodyHtml = `
          <div class="pokeskip-typechart-table-wrap">
            <div class="pokeskip-table-stage">
              <table class="pokeskip-typechart-table">
                <thead>
                  <tr>
                    <th class="pokeskip-th-corner">
                      <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; font-size: 8.5px; padding: 3px 2px; box-sizing: border-box;">
                        <span style="align-self: flex-end; color: #38bdf8; font-weight: 800;">🛡️ Déf. ➔</span>
                        <span style="align-self: flex-start; color: #f8fafc; font-weight: 800;">⬇ ⚔️ Att.</span>
                      </div>
                    </th>
                    ${types18.map((t, colIdx) => {
                      const isHigh = enemyTypeIndices.includes(colIdx);
                      return `
                        <th class="pokeskip-th-col ${isHigh ? 'highlighted-col' : ''}" data-col="${colIdx}" style="background-color: ${t.bg};" title="Défenseur : ${t.name}">
                          <div class="pokeskip-th-col-content">
                            ${isHigh ? '<span class="pokeskip-col-marker">🎯</span>' : ''}
                            <span class="pokeskip-th-col-name">${t.name}</span>
                          </div>
                        </th>
                      `;
                    }).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${types18.map((rowType, rowIdx) => `
                    <tr>
                      <th class="pokeskip-th-row" data-row="${rowIdx}" style="background-color: ${rowType.bg};" title="Attaquant : ${rowType.name}">
                        ${rowType.name}
                      </th>
                      ${types18.map((colType, colIdx) => {
                        const mult = TYPE_CHART[rowIdx][colIdx];
                        let cellContent = '—';
                        let cellClass = 'neutral';
                        if (mult === 2) {
                          cellContent = '2';
                          cellClass = 'super';
                        } else if (mult === 0.5) {
                          cellContent = '½';
                          cellClass = 'half';
                        } else if (mult === 0) {
                          cellContent = '0';
                          cellClass = 'zero';
                        }
                        return `
                          <td class="pokeskip-td-cell ${cellClass}" data-row="${rowIdx}" data-col="${colIdx}" title="${rowType.name} ➔ ${colType.name} : ×${mult}">
                            ${cellContent}
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="pokeskip-col-bubble-layer"></div>
            </div>
          </div>
        `;

        footerHtml = `
          <div class="pokeskip-typechart-footer">
            <div class="pokeskip-typechart-legend">
              <span class="legend-badge super">2</span> <span>×2 Super</span>
              <span class="legend-badge half">½</span> <span>×0.5 Peu</span>
              <span class="legend-badge zero">0</span> <span>×0 Inefficace</span>
              <span class="legend-badge neutral">—</span> <span>×1 Neutre</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">
              <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">T</kbd> ou <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">Échap</kbd> Fermer
            </div>
          </div>
        `;
      } else {
        // Mode Simplifié
        const showImmunities = this.typeChartShowImmunities;
        const SIMPLIFIED_ORDER_NAMES = [
          'Fée', 'Acier', 'Ténèbres', 'Dragon', 'Spectre', 'Roche',
          'Insecte', 'Psy', 'Vol', 'Sol', 'Poison', 'Combat',
          'Glace', 'Plante', 'Électrik', 'Eau', 'Feu', 'Normal'
        ];

        const getRowHtml = (name, isEnemy) => {
          const idx = types18.findIndex(item => item.name === name);
          if (idx === -1) return '';
          const t = types18[idx];
          const weaknesses = [];
          const strengths = [];
          const immunities = [];

          for (let otherIdx = 0; otherIdx < 18; otherIdx++) {
            if (TYPE_CHART[otherIdx][idx] === 2) weaknesses.push(types18[otherIdx]);
            if (TYPE_CHART[idx][otherIdx] === 2) strengths.push(types18[otherIdx]);
            if (TYPE_CHART[otherIdx][idx] === 0) immunities.push(types18[otherIdx]);
          }

          const weakPills = weaknesses.map(w => `
            <span class="pokeskip-badge-pill" data-type="${w.name}" style="background-color: ${w.bg};" title="Subit ×2 de ${w.name}">
              ${w.name}
            </span>
          `).join('');

          const strongPills = strengths.map(s => `
            <span class="pokeskip-badge-pill" data-type="${s.name}" style="background-color: ${s.bg};" title="Inflige ×2 à ${s.name}">
              ${s.name}
            </span>
          `).join('');

          const immPills = immunities.length > 0 ? `
            <div class="pokeskip-ref-immunity-wrap" style="${showImmunities ? '' : 'display: none;'}">
              <div style="display: inline-flex; align-items: center; margin-right: 4px; padding-right: 4px; border-right: 1px solid rgba(255,255,255,0.12);">
                ${immunities.map(imm => `
                  <span class="pokeskip-badge-pill" data-type="${imm.name}" style="background-color: ${imm.bg}; opacity: 0.85;" title="Immunisé contre ${imm.name} (×0)">
                    ${imm.name}<span class="pokeskip-mult-tag x0">×0</span>
                  </span>
                `).join('')}
              </div>
            </div>
          ` : '';

          return `
            <div class="pokeskip-ref-row ${isEnemy ? 'enemy-row' : ''}">
              <div class="pokeskip-ref-left">
                ${immPills}
                ${weakPills}
              </div>
              <div class="pokeskip-ref-arrow-left">➔</div>
              <div class="pokeskip-ref-center">
                <span class="pokeskip-badge-pill" data-type="${t.name}" style="background-color: ${t.bg};" title="${t.name}">
                  ${t.name}
                </span>
              </div>
              <div class="pokeskip-ref-arrow-right">➔</div>
              <div class="pokeskip-ref-right">
                ${strongPills}
              </div>
            </div>
          `;
        };

        const isEnemyList = SIMPLIFIED_ORDER_NAMES.map(name => {
          const idx = types18.findIndex(item => item.name === name);
          return idx !== -1 && enemyTypeIndices.includes(idx);
        });

        const rowNodesHtml = [];
        for (let i = 0; i < SIMPLIFIED_ORDER_NAMES.length; i++) {
          const isEnemy = isEnemyList[i];
          const isNextEnemy = (i + 1 < SIMPLIFIED_ORDER_NAMES.length) && isEnemyList[i + 1];

          if (isEnemy && isNextEnemy) {
            // Deux types adverses consécutifs (l'un au-dessus de l'autre) :
            // Englobés dans une seule et unique bulle !
            const row1 = getRowHtml(SIMPLIFIED_ORDER_NAMES[i], true);
            const row2 = getRowHtml(SIMPLIFIED_ORDER_NAMES[i + 1], true);
            rowNodesHtml.push(`
              <div class="pokeskip-ref-enemy-bubble">
                ${row1}
                ${row2}
              </div>
            `);
            i++;
          } else if (isEnemy) {
            // Type adverse isolé dans sa propre bulle
            const row = getRowHtml(SIMPLIFIED_ORDER_NAMES[i], true);
            rowNodesHtml.push(`
              <div class="pokeskip-ref-enemy-bubble">
                ${row}
              </div>
            `);
          } else {
            // Ligne normale
            rowNodesHtml.push(getRowHtml(SIMPLIFIED_ORDER_NAMES[i], false));
          }
        }

        bodyHtml = `
          <div class="pokeskip-ref-container ${showImmunities ? '' : 'pks-hide-immunities'}">
            <div class="pokeskip-ref-header">
              <div class="pokeskip-ref-left-label">
                <label class="pokeskip-tc-switch" title="Afficher ou masquer les immunités (×0)">
                  <input type="checkbox" class="pks-immunity-checkbox" ${showImmunities ? 'checked' : ''}>
                  <span class="pks-tc-slider"></span>
                  <span class="pks-tc-label">🛡️ Immunités (×0)</span>
                </label>
                <span>⚠️ Faiblesses (reçoit ×2)</span>
              </div>
              <div class="pokeskip-ref-center-label">Type</div>
              <div class="pokeskip-ref-right-label">Forces (inflige ×2) ⚔️</div>
            </div>
            ${rowNodesHtml.join('')}
          </div>
        `;

        footerHtml = `
          <div class="pokeskip-typechart-footer">
            <div class="pokeskip-typechart-legend">
              <span style="color: #fca5a5; font-weight: 700;">Faiblesses ➔</span> <span>Types reçus ×2</span>
              <span style="margin: 0 4px; color: #475569;">•</span>
              <span style="color: #86efac; font-weight: 700;">➔ Forces</span> <span>Types infligés ×2</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">
              <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">T</kbd> ou <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">Échap</kbd> Fermer
            </div>
          </div>
        `;
      }

      return { bodyHtml, footerHtml };
    },

    updateTypeChartColumnBubbles() {
      if (!this.typeChartContainer) return;
      const stage = this.typeChartContainer.querySelector('.pokeskip-table-stage');
      const table = this.typeChartContainer.querySelector('.pokeskip-typechart-table');
      const bubbleLayer = this.typeChartContainer.querySelector('.pokeskip-col-bubble-layer');
      if (!stage || !table || !bubbleLayer) return;

      bubbleLayer.innerHTML = '';

      const enemyInfo = getActiveEnemyTypes();
      const enemyTypeIndices = enemyInfo.types || [];
      const validCols = [...new Set(enemyTypeIndices)]
        .filter(idx => idx >= 0 && idx < 18)
        .sort((a, b) => a - b);

      if (validCols.length === 0) return;

      // Grouper les colonnes contiguës
      const clusters = [];
      let currentCluster = [];
      for (const col of validCols) {
        if (currentCluster.length === 0) {
          currentCluster.push(col);
        } else {
          const last = currentCluster[currentCluster.length - 1];
          if (col === last + 1) {
            currentCluster.push(col);
          } else {
            clusters.push(currentCluster);
            currentCluster = [col];
          }
        }
      }
      if (currentCluster.length > 0) clusters.push(currentCluster);

      for (const cluster of clusters) {
        const firstCol = cluster[0];
        const lastCol = cluster[cluster.length - 1];
        const thFirst = table.querySelector(`.pokeskip-th-col[data-col="${firstCol}"]`);
        const thLast = table.querySelector(`.pokeskip-th-col[data-col="${lastCol}"]`);
        if (!thFirst || !thLast) continue;

        const left = thFirst.offsetLeft - 1;
        const right = thLast.offsetLeft + thLast.offsetWidth + 1;
        const width = right - left;
        const top = thFirst.offsetTop - 1;
        const height = table.offsetHeight - top + 1;

        const bubble = document.createElement('div');
        bubble.className = 'pokeskip-col-bubble';
        bubble.style.left = `${left}px`;
        bubble.style.top = `${top}px`;
        bubble.style.width = `${width}px`;
        bubble.style.height = `${height}px`;

        bubbleLayer.appendChild(bubble);
      }
    },

    switchTypeChartTab(newMode) {
      if (!this.typeChartContainer) return;
      this.typeChartViewMode = newMode;
      PokeStorage.set('pokeskip_typechart_view_mode', newMode);

      const modeBtns = this.typeChartContainer.querySelectorAll('.pokeskip-mode-btn');
      modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === newMode);
      });

      const { bodyHtml, footerHtml } = this.getTypeChartContentHtml(newMode);

      const bodyEl = this.typeChartContainer.querySelector('.pokeskip-typechart-body');
      const footerEl = this.typeChartContainer.querySelector('.pokeskip-typechart-footer-wrap');

      if (bodyEl) {
        bodyEl.innerHTML = bodyHtml;
        bodyEl.classList.remove('pks-tab-fade');
        void bodyEl.offsetWidth;
        bodyEl.classList.add('pks-tab-fade');
      }
      if (footerEl) {
        footerEl.innerHTML = footerHtml;
      }

      this.bindTypeChartTabEvents(newMode);
    },

    bindTypeChartTabEvents(mode) {
      if (!this.typeChartContainer) return;

      if (mode === 'table') {
        this.updateTypeChartColumnBubbles();
        requestAnimationFrame(() => this.updateTypeChartColumnBubbles());
      } else {
        const checkbox = this.typeChartContainer.querySelector('.pks-immunity-checkbox');
        if (checkbox) {
          checkbox.addEventListener('change', (e) => {
            this.typeChartShowImmunities = e.target.checked;
            PokeStorage.set('pokeskip_typechart_show_immunities', this.typeChartShowImmunities);
            const container = this.typeChartContainer.querySelector('.pokeskip-ref-container');
            if (container) {
              container.classList.toggle('pks-hide-immunities', !this.typeChartShowImmunities);
              container.querySelectorAll('.pokeskip-ref-immunity-wrap').forEach(el => {
                el.style.display = this.typeChartShowImmunities ? '' : 'none';
              });
            }
          });
        }
      }
    },

    renderTypeChart() {
      if (!this.typeChartContainer) this.createTypeChartContainer();
      if (!this.typeChartViewMode) {
        this.typeChartViewMode = PokeStorage.get('pokeskip_typechart_view_mode', 'simplified');
      }
      if (this.typeChartShowImmunities === undefined) {
        this.typeChartShowImmunities = PokeStorage.get('pokeskip_typechart_show_immunities', true);
      }
      const mode = this.typeChartViewMode;

      const enemyInfo = getActiveEnemyTypes();
      const enemyTypeIndices = enemyInfo.types || [];
      const hasEnemy = enemyTypeIndices.length > 0;

      const enemiesList = (hasEnemy && enemyInfo.enemies && enemyInfo.enemies.length > 0)
        ? enemyInfo.enemies
        : (hasEnemy ? [{ name: enemyInfo.name || 'Adversaire', types: enemyTypeIndices }] : []);

      let targetHeaderHtml = '';
      if (hasEnemy && enemiesList.length > 0) {
        const targetBlocks = enemiesList.map(en => {
          const badges = en.types.map(idx => {
            const t = POKEMON_TYPES[idx];
            return `<span class="pokeskip-badge-pill" style="background-color: ${t.bg}; margin-left: 2px;">${t.name}</span>`;
          }).join('');
          return `
            <div style="display: inline-flex; align-items: center; gap: 4px;">
              <span style="color: #ffffff; font-weight: 700; font-size: 11px;">${en.name}</span>
              ${badges}
            </div>
          `;
        }).join('<span style="color: #64748b; font-size: 11px; margin: 0 4px; font-weight: bold;">•</span>');

        targetHeaderHtml = `
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.14); border: 1px solid rgba(56, 189, 248, 0.4); padding: 2px 8px; border-radius: 6px; font-size: 11px; flex-wrap: wrap;">
            <span style="color: #38bdf8; font-weight: 800;">🎯 ${enemiesList.length > 1 ? 'Cibles :' : 'Cible :'}</span>
            ${targetBlocks}
          </div>
        `;
      }

      const { bodyHtml, footerHtml } = this.getTypeChartContentHtml(mode);

      this.typeChartContainer.innerHTML = `
        <div class="pokeskip-typechart-box">
          <div class="pokeskip-typechart-header">
            <div class="pokeskip-typechart-title-wrap">
              <span style="font-size: 16px;">⚔️</span>
              <span class="pokeskip-typechart-title">Forces & Faiblesses</span>
              <div class="pokeskip-mode-switch">
                <button class="pokeskip-mode-btn ${mode === 'simplified' ? 'active' : ''}" data-mode="simplified" title="Vue simplifiée">⚡ Simplifié</button>
                <button class="pokeskip-mode-btn ${mode === 'table' ? 'active' : ''}" data-mode="table" title="Matrice complète 18×18">📊 Complet</button>
              </div>
              <div class="pokeskip-typechart-targets-wrap">
                ${targetHeaderHtml}
              </div>
            </div>
            <button class="pokeskip-typechart-close" title="Fermer (T ou Échap)">&times;</button>
          </div>

          <div class="pokeskip-typechart-body pks-tab-fade">
            ${bodyHtml}
          </div>
          <div class="pokeskip-typechart-footer-wrap">
            ${footerHtml}
          </div>
        </div>
      `;

      // Event listeners des onglets
      const modeBtns = this.typeChartContainer.querySelectorAll('.pokeskip-mode-btn');
      modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newMode = btn.dataset.mode;
          if (newMode && newMode !== this.typeChartViewMode) {
            this.switchTypeChartTab(newMode);
          }
        });
      });

      // Fermeture
      const closeBtn = this.typeChartContainer.querySelector('.pokeskip-typechart-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.hideTypeChart(false);
        });
      }

      this.bindTypeChartTabEvents(mode);
      this.updateTypeChartResponsiveScale();
    },

    updateTypeChartResponsiveScale() {
      if (!this.typeChartContainer) return;
      const box = this.typeChartContainer.querySelector('.pokeskip-typechart-box');
      if (!box) return;

      const baseW = 770;
      const baseH = 620;
      const availW = window.innerWidth * 0.94;
      const availH = window.innerHeight * 0.90;

      let scale = Math.min(availW / baseW, availH / baseH);
      scale = Math.max(0.65, Math.min(2.5, scale));
      box.style.setProperty('--pks-tc-scale', scale.toFixed(2));
      if (this.typeChartViewMode === 'table') {
        this.updateTypeChartColumnBubbles();
      }
    },

    showTypeChart() {
      this.disableGameKeyboard();
      if (!this.typeChartContainer) {
        this.createTypeChartContainer();
      }
      this.renderTypeChart();
      this.typeChartContainer.style.display = 'flex';
      this.updateTypeChartResponsiveScale();
    },

    hideTypeChart() {
      if (this.typeChartContainer) {
        this.typeChartContainer.style.display = 'none';
      }
      this.typeChartOpenedViaKey = false;
      if (!this.isModalOpen()) {
        this.enableGameKeyboard();
      }
    },

    toggleTypeChart() {
      if (this.typeChartContainer && this.typeChartContainer.style.display === 'flex') {
        this.hideTypeChart();
      } else {
        this.showTypeChart();
      }
    },
};
