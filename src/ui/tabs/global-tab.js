// ============================================================================
// Onglet Règles Globales : Améliorations Directes Universelles
// Permet d'activer/désactiver globalement, par chaîne, et individuellement chaque attaque
// Survol enrichi avec statistiques en direct du moteur PokéRogue et infobulles
// ============================================================================

import { PokeSkip } from '../../core/state.js';
import { MOVE_UPGRADE_CHAINS, getLiveMoveInfo } from '../../constants/move-chains.js';
import { POKEMON_TYPES } from '../../constants/types.js';
import { t, isEnglish } from '../../core/i18n.js';
import { UI } from '../index.js';

export const GlobalTab = {
  globalSearchQuery: '',

  _ensureMoveTooltip() {
    let tooltip = document.getElementById('pokeskip-move-rich-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'pokeskip-move-rich-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        z-index: 99999999;
        pointer-events: none;
        background: #0d1321;
        border: 1px solid rgba(168, 85, 247, 0.5);
        border-radius: 12px;
        padding: 12px 14px;
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.92), 0 0 24px rgba(168, 85, 247, 0.28);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        width: 300px;
        box-sizing: border-box;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.15s ease, transform 0.15s ease;
        display: none;
        font-family: inherit;
        color: #f1f5f9;
      `;
      document.body.appendChild(tooltip);
    }
    return tooltip;
  },

  _showMoveTooltip(pill, moveDef, chainId) {
    if (!pill || !moveDef) return;
    const tooltip = this._ensureMoveTooltip();
    const chain = MOVE_UPGRADE_CHAINS.find(c => c.id === chainId);
    const moveInfo = getLiveMoveInfo(moveDef, chain, PokeSkip);
    const isMoveDisabled = PokeSkip.isUniversalMoveDisabled(chainId, moveDef.id);

    tooltip.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 9px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header: Nom + Type + Catégorie -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span style="font-size: 14px; font-weight: 700; color: #f8fafc; letter-spacing: -0.2px;">
            ${moveInfo.name}
          </span>
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="background: ${moveInfo.type.bg}; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.6);">
              ${moveInfo.type.name}
            </span>
            <span style="background: rgba(255,255,255,0.08); color: ${moveInfo.category.color}; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);">
              ${moveInfo.category.icon} ${moveInfo.category.name}
            </span>
          </div>
        </div>

        <!-- Grille de Stats: Puissance / Précision / PP -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: rgba(0, 0, 0, 0.45); padding: 7px; border-radius: 7px; text-align: center; border: 1px solid rgba(255,255,255,0.06);">
          <div>
            <div style="font-size: 9.5px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">${t('global_move_tooltip_power')}</div>
            <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-top: 2px;">${moveInfo.power}</div>
          </div>
          <div>
            <div style="font-size: 9.5px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">${t('global_move_tooltip_acc')}</div>
            <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-top: 2px;">${moveInfo.accuracy}</div>
          </div>
          <div>
            <div style="font-size: 9.5px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">${t('global_move_tooltip_pp')}</div>
            <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-top: 2px;">${moveInfo.pp}</div>
          </div>
        </div>

        <!-- Description officielle PokéRogue -->
        <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.45; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.07); padding: 8px 10px; border-radius: 7px;">
          ${moveInfo.desc}
        </div>

        <!-- Indication discrète : petit et gris sans la partie statut -->
        <div style="font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 5px; margin-top: 1px; letter-spacing: 0.1px;">
          ${isMoveDisabled ? t('global_move_tooltip_click_enable') : t('global_move_tooltip_click_disable')}
        </div>
      </div>
    `;

    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';

    const rect = pill.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = rect.top - tooltipRect.height - 10;
    if (top < 10) {
      top = rect.bottom + 10;
    }
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    left = Math.max(12, Math.min(window.innerWidth - tooltipRect.width - 12, left));

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
  },

  _hideMoveTooltip() {
    const tooltip = document.getElementById('pokeskip-move-rich-tooltip');
    if (tooltip) {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(4px)';
      setTimeout(() => {
        if (tooltip.style.opacity === '0') {
          tooltip.style.display = 'none';
        }
      }, 150);
    }
  },

  renderGlobalTab() {
    const container = document.getElementById('pokeskip-global-rules-content');
    if (!container) return;

    const modalBody = container.closest('#pokeskip-modal-body');
    const prevScrollTop = modalBody ? modalBody.scrollTop : 0;

    const isMasterActive = Boolean(PokeSkip.settings.universalUpgradesEnabled);
    const disabledChains = PokeSkip.settings.disabledUniversalChains || {};
    const totalCount = MOVE_UPGRADE_CHAINS.length;
    const activeCount = MOVE_UPGRADE_CHAINS.filter(c => !disabledChains[c.id]).length;

    const filteredChains = MOVE_UPGRADE_CHAINS.filter(chain => {
      if (!this.globalSearchQuery) return true;
      const q = this.globalSearchQuery.toLowerCase().trim();
      const name = (isEnglish() ? chain.nameEn : chain.nameFr).toLowerCase();
      const type = (chain.type || '').toLowerCase();
      const category = (chain.category || '').toLowerCase();
      const hasMove = chain.moves.some(m => {
        return (m.name || '').toLowerCase().includes(q) || (m.nameEn || '').toLowerCase().includes(q);
      });
      return name.includes(q) || type.includes(q) || category.includes(q) || hasMove;
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- En-tête avec Switch Maître -->
        <div style="background: linear-gradient(135deg, rgba(88, 28, 135, 0.35) 0%, rgba(15, 23, 42, 0.8) 100%); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
            <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 240px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">🌐</span>
                <span style="font-size: 15px; font-weight: 700; color: #f8fafc; letter-spacing: -0.2px;">
                  ${t('global_title')}
                </span>
                <span style="font-size: 11px; background: ${isMasterActive ? 'rgba(168, 85, 247, 0.25)' : 'rgba(100, 116, 139, 0.2)'}; color: ${isMasterActive ? '#d8b4fe' : '#94a3b8'}; padding: 2px 8px; border-radius: 10px; font-weight: 600;">
                  ${t('global_active_count', { active: isMasterActive ? activeCount : 0, total: totalCount })}
                </span>
              </div>
              <span style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
                ${t('global_subtitle')}
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 13px; font-weight: 600; color: ${isMasterActive ? '#c084fc' : '#64748b'};" id="pokeskip-global-master-label">
                ${isMasterActive ? t('global_master_active') : t('global_master_inactive')}
              </span>
              <label class="pokeskip-switch" title="${t('global_master_switch')}">
                <input type="checkbox" id="pokeskip-toggle-master-universal" ${isMasterActive ? 'checked' : ''}>
                <span class="pokeskip-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Barre de recherche et actions rapides -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 220px; position: relative;">
            <input type="text" id="pokeskip-input-search-global" placeholder="${t('global_search_placeholder')}" value="${this.globalSearchQuery || ''}" style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 12.5px; outline: none;">
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="pokeskip-btn-enable-all-global" style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 11.5px; cursor: pointer; font-weight: 600;">
              ✓ ${t('global_btn_enable_all')}
            </button>
            <button id="pokeskip-btn-disable-all-global" style="background: rgba(225, 29, 72, 0.15); color: #fda4af; border: 1px solid rgba(225, 29, 72, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 11.5px; cursor: pointer; font-weight: 600;">
              ✕ ${t('global_btn_disable_all')}
            </button>
          </div>
        </div>

        <!-- Liste des chaînes d'attaques -->
        <div id="pokeskip-global-chains-list" style="display: flex; flex-direction: column; gap: 10px; opacity: ${isMasterActive ? '1' : '0.45'}; transition: opacity 0.25s ease;">
          ${filteredChains.length === 0 ? `
            <div style="text-align: center; padding: 30px; color: #64748b; background: #090e1a; border-radius: 10px; font-size: 13px;">
              ${t('global_empty_search')}
            </div>
          ` : filteredChains.map(chain => {
            const isChainEnabled = !disabledChains[chain.id] && isMasterActive;
            const chainName = isEnglish() ? chain.nameEn : chain.nameFr;
            const typeInfo = POKEMON_TYPES.find(t => t.nameFr === chain.type || t.key === chain.type) || { bg: '#64748b', name: chain.type };
            const typeColor = typeInfo.bg;
            const typeDisplay = typeInfo.name || chain.type;

            return `
              <div class="pokeskip-global-chain-card" data-chain-id="${chain.id}" style="background: #111a2e; border: 1px solid ${isChainEnabled ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span style="font-size: 13.5px; font-weight: 700; color: #f8fafc;">${chainName}</span>
                    <span style="background: ${typeColor}; color: #fff; font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                      ${typeDisplay}
                    </span>
                    <span style="background: rgba(255,255,255,0.06); color: #cbd5e1; font-size: 10.5px; padding: 2px 6px; border-radius: 4px;">
                      ${chain.category}
                    </span>
                  </div>

                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="pokeskip-chain-status-text" style="font-size: 11.5px; color: ${isChainEnabled ? '#d8b4fe' : '#64748b'}; font-weight: 600;">
                      ${isChainEnabled ? t('global_chain_enabled') : t('global_chain_disabled')}
                    </span>
                    <label class="pokeskip-switch" title="${chainName}">
                      <input type="checkbox" class="pokeskip-toggle-chain" data-id="${chain.id}" ${!disabledChains[chain.id] ? 'checked' : ''} ${!isMasterActive ? 'disabled' : ''}>
                      <span class="pokeskip-slider"></span>
                    </label>
                  </div>
                </div>

                <!-- Flux visuel de l'amélioration d'attaque avec pastilles interactives -->
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
                  ${chain.moves.map((m, idx) => {
                    const moveInfo = getLiveMoveInfo(m, chain, PokeSkip);
                    const isMoveDisabled = PokeSkip.isUniversalMoveDisabled(chain.id, m.id);
                    const isLast = idx === chain.moves.length - 1;
                    const powerText = (moveInfo.power !== '—' && moveInfo.power > 0)
                      ? `${moveInfo.power}`
                      : (moveInfo.accuracy !== '—' ? moveInfo.accuracy : '');

                    const actionHint = isMoveDisabled
                      ? t('global_move_tooltip_click_enable')
                      : t('global_move_tooltip_click_disable');
                    const titleFallback = `${moveInfo.name} (${moveInfo.type.name} • ${moveInfo.category.name})\n` +
                      `${t('global_move_tooltip_power')}: ${moveInfo.power} | ${t('global_move_tooltip_acc')}: ${moveInfo.accuracy} | ${t('global_move_tooltip_pp')}: ${moveInfo.pp}\n` +
                      `"${moveInfo.desc}"\n\n` +
                      `👉 💡 ${actionHint}`;

                    return `
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <button
                          type="button"
                          class="pokeskip-universal-move-pill ${isMoveDisabled ? 'is-disabled' : ''}"
                          data-chain-id="${chain.id}"
                          data-move-id="${m.id}"
                          title="${titleFallback.replace(/"/g, '&quot;')}"
                          style="
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            background: ${isMoveDisabled ? 'rgba(239, 68, 68, 0.12)' : (isLast ? 'rgba(168, 85, 247, 0.22)' : 'rgba(255, 255, 255, 0.06)')};
                            border: 1px ${isMoveDisabled ? 'dashed rgba(239, 68, 68, 0.55)' : (isLast ? 'solid rgba(168, 85, 247, 0.45)' : 'solid rgba(255, 255, 255, 0.12)')};
                            padding: 5px 11px;
                            border-radius: 7px;
                            font-size: 12px;
                            font-weight: ${isLast ? '700' : '600'};
                            color: ${isMoveDisabled ? '#fca5a5' : (isLast ? '#f3e8ff' : '#cbd5e1')};
                            cursor: pointer;
                            transition: all 0.18s ease;
                            outline: none;
                            user-select: none;
                            text-decoration: ${isMoveDisabled ? 'line-through' : 'none'};
                            opacity: ${isMoveDisabled ? '0.62' : '1'};
                          "
                        >
                          <span>${moveInfo.name}</span>
                          ${powerText ? `<span style="font-size: 10px; opacity: 0.75; font-weight: 500;">(${powerText})</span>` : ''}
                          ${isMoveDisabled ? `<span style="background: rgba(239, 68, 68, 0.35); color: #fecaca; font-size: 9px; padding: 1px 4px; border-radius: 3px; text-decoration: none; font-weight: 700;">${t('global_move_excluded_badge')}</span>` : ''}
                        </button>
                        ${!isLast ? `<span style="color: ${isMoveDisabled ? 'rgba(168, 85, 247, 0.4)' : '#a855f7'}; font-size: 13px; font-weight: bold;">➔</span>` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Écouteurs d'événements
    this.bindGlobalTabEvents(container);

    if (modalBody && prevScrollTop) {
      modalBody.scrollTop = prevScrollTop;
    }
  },

  bindGlobalTabEvents(container) {
    // Switch Maître
    const masterSwitch = container.querySelector('#pokeskip-toggle-master-universal');
    if (masterSwitch) {
      masterSwitch.addEventListener('change', (e) => {
        PokeSkip.settings.universalUpgradesManual = true;
        PokeSkip.settings.universalUpgradesEnabled = e.target.checked;
        PokeSkip.saveSettings();
        UI.showToast(
          e.target.checked ? '🌐 ' + t('global_master_active') : t('global_master_inactive'),
          e.target.checked ? 'success' : 'info'
        );
        this.renderGlobalTab();
      });
    }

    // Barre de recherche
    const searchInput = container.querySelector('#pokeskip-input-search-global');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.globalSearchQuery = e.target.value;
        this.renderGlobalTab();
        const updatedInput = container.querySelector('#pokeskip-input-search-global');
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.selectionStart = updatedInput.selectionEnd = updatedInput.value.length;
        }
      });
      ['keydown', 'keyup', 'keypress'].forEach(type => {
        searchInput.addEventListener(type, (e) => e.stopPropagation());
      });
    }

    // Tout activer
    const btnEnableAll = container.querySelector('#pokeskip-btn-enable-all-global');
    if (btnEnableAll) {
      btnEnableAll.addEventListener('click', () => {
        PokeSkip.setAllUniversalChains(true);
        UI.showToast(t('toast_universal_all_enabled'), 'success');
        this.renderGlobalTab();
      });
    }

    // Tout désactiver
    const btnDisableAll = container.querySelector('#pokeskip-btn-disable-all-global');
    if (btnDisableAll) {
      btnDisableAll.addEventListener('click', () => {
        PokeSkip.setAllUniversalChains(false);
        UI.showToast(t('toast_universal_all_disabled'), 'info');
        this.renderGlobalTab();
      });
    }

    // Switches individuels par chaîne
    container.querySelectorAll('.pokeskip-toggle-chain').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const chainId = toggle.getAttribute('data-id');
        const enabled = e.target.checked;
        PokeSkip.toggleUniversalChain(chainId, enabled);
        const card = toggle.closest('.pokeskip-global-chain-card');
        const statusText = card?.querySelector('.pokeskip-chain-status-text');
        if (statusText) {
          statusText.textContent = enabled ? t('global_chain_enabled') : t('global_chain_disabled');
          statusText.style.color = enabled ? '#d8b4fe' : '#64748b';
        }
        if (card) {
          card.style.borderColor = enabled ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.08)';
        }
        const chainObj = MOVE_UPGRADE_CHAINS.find(c => c.id === chainId);
        const chainName = chainObj ? (isEnglish() ? chainObj.nameEn : chainObj.nameFr) : chainId;
        UI.showToast(
          t('toast_universal_chain_toggled', { name: chainName, status: enabled ? t('global_chain_enabled') : t('global_chain_disabled') }),
          enabled ? 'success' : 'info',
          1800
        );
      });
    });

    // Infobulles au survol & clic individuel pour chaque attaque
    container.querySelectorAll('.pokeskip-universal-move-pill').forEach(pill => {
      const chainId = pill.getAttribute('data-chain-id');
      const moveId = Number(pill.getAttribute('data-move-id'));
      const chain = MOVE_UPGRADE_CHAINS.find(c => c.id === chainId);
      const moveDef = chain?.moves.find(m => Number(m.id) === moveId);

      pill.addEventListener('mouseenter', () => {
        this._showMoveTooltip(pill, moveDef, chainId);
      });

      pill.addEventListener('mousemove', () => {
        this._showMoveTooltip(pill, moveDef, chainId);
      });

      pill.addEventListener('mouseleave', () => {
        this._hideMoveTooltip();
      });

      // Clic pour désactiver / réactiver l'attaque dans cette chaîne
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        this._hideMoveTooltip();

        if (!moveDef) return;
        const nowEnabled = PokeSkip.toggleUniversalMove(chainId, moveId);
        const chainName = isEnglish() ? chain.nameEn : chain.nameFr;
        const moveInfo = getLiveMoveInfo(moveDef, chain, PokeSkip);

        this.renderGlobalTab();

        UI.showToast(
          t(nowEnabled ? 'toast_universal_move_enabled' : 'toast_universal_move_disabled', {
            move: moveInfo.name,
            chain: chainName
          }),
          nowEnabled ? 'success' : 'warning',
          1800
        );
      });
    });

    // Masquer le tooltip au défilement du corps de modal
    const modalBody = container.closest('#pokeskip-modal-body');
    if (modalBody && !modalBody.__hasTooltipScrollListener) {
      modalBody.__hasTooltipScrollListener = true;
      modalBody.addEventListener('scroll', () => {
        this._hideMoveTooltip();
      }, { passive: true });
    }

    UI.isolateInputs(container);
  }
};
