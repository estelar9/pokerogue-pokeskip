// Onglet Paramètres : options, langue, import/export, reset
import { PokeSkip } from '../../core/state.js';
import { t } from '../../core/i18n.js';

export const SettingsTab = {
  getSettingsTabHtml() {
    const lang = PokeSkip.settings.language || 'auto';
    return `
      <div style="max-width: 500px; display: flex; flex-direction: column; gap: 16px;">
        <!-- Choix de la langue -->
        <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 10px;">
          <h4 style="margin: 0; font-size: 14px; color: #38bdf8;">🌐 ${t('settings_lang_title')}</h4>
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">${t('settings_lang_desc')}</p>
          <div style="display: flex; align-items: center; gap: 10px;">
            <select id="pokeskip-opt-language" style="background: #1e293b; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #f8fafc; padding: 6px 12px; font-size: 13px; cursor: pointer; outline: none;">
              <option value="auto" ${lang === 'auto' ? 'selected' : ''}>🌐 ${t('settings_lang_auto')}</option>
              <option value="fr" ${lang === 'fr' ? 'selected' : ''}>🇫🇷 ${t('settings_lang_fr')}</option>
              <option value="en" ${lang === 'en' ? 'selected' : ''}>🇬🇧 ${t('settings_lang_en')}</option>
            </select>
          </div>
        </div>

        <!-- Notifications & Alertes -->
        <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0 0 2px 0; font-size: 14px; color: #38bdf8;">${t('settings_notif_title')}</h4>
          
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
            <input type="checkbox" id="pokeskip-opt-toasts" ${PokeSkip.settings.showToasts ? 'checked' : ''} style="accent-color: #38bdf8;">
            ${t('settings_toasts_label')}
          </label>

          <div id="pokeskip-opt-toast-duration-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8; padding-left: 24px; opacity: ${PokeSkip.settings.showToasts ? '1' : '0.4'};">
            <span>${t('settings_toast_duration')}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="number" id="pokeskip-opt-toast-duration" min="1" max="15" step="0.5" value="${((PokeSkip.settings.toastDuration || 2800) / 1000)}" ${!PokeSkip.settings.showToasts ? 'disabled' : ''} style="width: 50px; background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f8fafc; padding: 4px 6px; text-align: center; font-size: 12px;">
              <span>${t('settings_seconds')}</span>
            </div>
          </div>

          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
            <input type="checkbox" id="pokeskip-opt-hud-count" ${PokeSkip.settings.showHudCount !== false ? 'checked' : ''} style="accent-color: #38bdf8;">
            ${t('settings_hud_count_label')}
          </label>

          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; display: flex; flex-direction: column; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
              <input type="checkbox" id="pokeskip-opt-quick-prompt" ${PokeSkip.settings.showQuickPrompt !== false ? 'checked' : ''} style="accent-color: #38bdf8;">
              ${t('settings_quick_prompt_label')}
            </label>
            
            <div id="pokeskip-opt-duration-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8; padding-left: 24px; opacity: ${PokeSkip.settings.showQuickPrompt !== false ? '1' : '0.4'};">
              <span>${t('settings_quick_prompt_duration')}</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <input type="number" id="pokeskip-opt-quick-duration" min="3" max="60" value="${PokeSkip.settings.quickPromptDuration || 15}" ${PokeSkip.settings.showQuickPrompt === false ? 'disabled' : ''} style="width: 50px; background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f8fafc; padding: 4px 6px; text-align: center; font-size: 12px;">
                <span>${t('settings_seconds')}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mode Avancé : Remplacement d'Attaques -->
        <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h4 style="margin: 0; font-size: 14px; color: #c084fc; display: flex; align-items: center; gap: 6px;">
              <span>${t('settings_advanced_title')}</span>
            </h4>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #fff; font-weight: 600;">
              <input type="checkbox" id="pokeskip-opt-advanced-mode" ${PokeSkip.settings.advancedMode ? 'checked' : ''} style="accent-color: #a855f7; width: 16px; height: 16px;">
              ${t('settings_advanced_enable')}
            </label>
          </div>
          <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
            ${t('settings_advanced_desc')}
          </div>
          <div id="pokeskip-advanced-status-desc" style="font-size: 11px; color: ${PokeSkip.settings.advancedMode ? '#a855f7' : '#64748b'};">
            ${PokeSkip.settings.advancedMode ? t('settings_advanced_status_on') : t('settings_advanced_status_off')}
          </div>

          <div id="pokeskip-opt-prompt-auto-replacement-container" style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; display: flex; flex-direction: column; gap: 6px; opacity: ${PokeSkip.settings.advancedMode ? '1' : '0.4'};">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
              <input type="checkbox" id="pokeskip-opt-prompt-auto-replacement" ${PokeSkip.settings.promptAutoReplacement !== false ? 'checked' : ''} ${!PokeSkip.settings.advancedMode ? 'disabled' : ''} style="accent-color: #a855f7;">
              ${t('settings_prompt_auto_rep')}
            </label>
            <div style="font-size: 11px; color: #94a3b8; padding-left: 24px; line-height: 1.3;">
              ${t('settings_prompt_auto_rep_desc')}
            </div>
          </div>
        </div>

        <!-- Exportation / Importation -->
        <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #38bdf8;">${t('settings_io_title')}</h4>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8;">${t('settings_io_desc')}</p>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button id="pokeskip-btn-export" style="background:#0284c7; color:#fff; border:1px solid #38bdf8; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">${t('settings_export_btn')}</button>
            <button id="pokeskip-btn-import" style="background:#1e293b; color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">${t('settings_import_btn')}</button>
            <input type="file" id="pokeskip-file-import" accept=".json,application/json" style="display: none;" />
          </div>
        </div>

        <!-- Réinitialisation -->
        <div style="background: rgba(225,29,72,0.1); padding: 14px; border-radius: 10px; border: 1px solid rgba(225,29,72,0.25);">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #f43f5e;">${t('settings_reset_title')}</h4>
          <button id="pokeskip-btn-reset-rules" style="background:#be123c; border:1px solid #f43f5e; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">
            ${t('settings_reset_rules_btn')}
          </button>
        </div>
      </div>
    `;
  },

  bindSettingsTabEvents(container, ui) {
    const optLang = container.querySelector('#pokeskip-opt-language');
    if (optLang) {
      optLang.addEventListener('change', (e) => {
        PokeSkip.settings.language = e.target.value;
        PokeSkip.saveSettings();
        if (typeof ui?.rebuildModal === 'function') {
          ui.rebuildModal();
        } else if (typeof UI?.rebuildModal === 'function') {
          UI.rebuildModal();
        } else {
          SettingsTab.renderSettingsTab();
          if (typeof ui?.updateHudBadge === 'function') ui.updateHudBadge();
        }
      });
    }

    const optToasts = container.querySelector('#pokeskip-opt-toasts');
    if (optToasts) {
      optToasts.addEventListener('change', (e) => {
        PokeSkip.settings.showToasts = e.target.checked;
        PokeSkip.saveSettings();
        const toastDurContainer = container.querySelector('#pokeskip-opt-toast-duration-container');
        const toastDurInput = container.querySelector('#pokeskip-opt-toast-duration');
        if (toastDurContainer) {
          toastDurContainer.style.opacity = e.target.checked ? '1' : '0.4';
        }
        if (toastDurInput) {
          toastDurInput.disabled = !e.target.checked;
        }
      });
    }

    const optToastDuration = container.querySelector('#pokeskip-opt-toast-duration');
    if (optToastDuration) {
      optToastDuration.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= 1 && val <= 30) {
          PokeSkip.settings.toastDuration = Math.round(val * 1000);
          PokeSkip.saveSettings();
        }
      });
      optToastDuration.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 30) val = 30;
        e.target.value = val;
        PokeSkip.settings.toastDuration = Math.round(val * 1000);
        PokeSkip.saveSettings();
      });
    }

    const optHudCount = container.querySelector('#pokeskip-opt-hud-count');
    if (optHudCount) {
      optHudCount.addEventListener('change', (e) => {
        PokeSkip.settings.showHudCount = e.target.checked;
        PokeSkip.saveSettings();
        ui.updateHudBadge();
      });
    }

    const optAdvancedMode = container.querySelector('#pokeskip-opt-advanced-mode');
    const optPromptAutoReplacement = container.querySelector('#pokeskip-opt-prompt-auto-replacement');
    const promptAutoRepContainer = container.querySelector('#pokeskip-opt-prompt-auto-replacement-container');

    if (optAdvancedMode) {
      optAdvancedMode.addEventListener('change', (e) => {
        PokeSkip.settings.advancedMode = e.target.checked;
        PokeSkip.saveSettings();
        const statusDesc = container.querySelector('#pokeskip-advanced-status-desc');
        if (statusDesc) {
          statusDesc.textContent = e.target.checked
            ? t('settings_advanced_status_on')
            : t('settings_advanced_status_off');
          statusDesc.style.color = e.target.checked ? '#a855f7' : '#64748b';
        }
        if (optPromptAutoReplacement) {
          optPromptAutoReplacement.disabled = !e.target.checked;
        }
        if (promptAutoRepContainer) {
          promptAutoRepContainer.style.opacity = e.target.checked ? '1' : '0.4';
        }
        ui.showToast(
          e.target.checked ? '⚡ ' + t('settings_advanced_status_on') : t('settings_advanced_status_off'),
          e.target.checked ? 'success' : 'info'
        );
      });
    }

    if (optPromptAutoReplacement) {
      optPromptAutoReplacement.addEventListener('change', (e) => {
        PokeSkip.settings.promptAutoReplacement = e.target.checked;
        PokeSkip.saveSettings();
      });
    }

    const optQuickPrompt = container.querySelector('#pokeskip-opt-quick-prompt');
    const optQuickDuration = container.querySelector('#pokeskip-opt-quick-duration');
    const optDurationContainer = container.querySelector('#pokeskip-opt-duration-container');

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

    const btnExport = container.querySelector('#pokeskip-btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const backupData = {
          _format: 'pokeskip_backup_v1',
          exportedAt: new Date().toISOString(),
          settings: PokeSkip.settings,
          rules: PokeSkip.rules
        };
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const a = document.createElement('a');
        a.setAttribute('href', dataStr);
        a.setAttribute('download', `pokeskip-backup-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        ui.showToast(t('toast_export_success'), 'success');
      });
    }

    const btnImport = container.querySelector('#pokeskip-btn-import');
    const fileImport = container.querySelector('#pokeskip-file-import');
    if (btnImport && fileImport) {
      btnImport.addEventListener('click', () => {
        fileImport.value = '';
        fileImport.click();
      });

      fileImport.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
              ui.showToast(t('toast_import_invalid'), 'error');
              return;
            }

            let importedRulesCount = 0;
            let importedSettingsCount = 0;

            // Format structuré (avec section rules et/ou settings)
            if (parsed._format === 'pokeskip_backup_v1' || parsed.rules !== undefined || parsed.settings !== undefined) {
              if (parsed.rules && typeof parsed.rules === 'object' && !Array.isArray(parsed.rules)) {
                importedRulesCount = Object.keys(parsed.rules).length;
                PokeSkip.rules = { ...PokeSkip.rules, ...parsed.rules };
                PokeSkip.saveRules();
              }
              if (parsed.settings && typeof parsed.settings === 'object' && !Array.isArray(parsed.settings)) {
                importedSettingsCount = Object.keys(parsed.settings).length;
                PokeSkip.settings = { ...PokeSkip.settings, ...parsed.settings };
                PokeSkip.saveSettings();
              }
            } else {
              // Format legacy : l'objet racine est directement les règles
              importedRulesCount = Object.keys(parsed).length;
              PokeSkip.rules = { ...PokeSkip.rules, ...parsed };
              PokeSkip.saveRules();
            }

            // Rafraîchir les différentes vues
            if (typeof ui.renderSettingsTab === 'function') ui.renderSettingsTab();
            if (typeof ui.updateHudBadge === 'function') ui.updateHudBadge();
            if (typeof ui.renderTeamTab === 'function') ui.renderTeamTab();
            if (typeof ui.renderReplacementsTab === 'function') ui.renderReplacementsTab();
            if (typeof ui.renderSavedSpeciesTab === 'function') ui.renderSavedSpeciesTab();

            const details = [];
            if (importedRulesCount > 0) details.push(`${importedRulesCount} règle(s)`);
            if (importedSettingsCount > 0) details.push(`${importedSettingsCount} paramètre(s)`);

            if (details.length > 0) {
              ui.showToast(t('toast_import_success', { details: details.join(' & ') }), 'success');
            } else {
              ui.showToast(t('toast_import_empty'), 'warning');
            }
          } catch (err) {
            ui.showToast(t('toast_import_error'), 'error');
          }
        };
        reader.onerror = () => {
          ui.showToast(t('toast_read_error'), 'error');
        };
        reader.readAsText(file);
      });
    }

    const btnReset = container.querySelector('#pokeskip-btn-reset-rules');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm(t('settings_reset_desc') + '?')) {
          PokeSkip.rules = {};
          PokeSkip.saveRules();
          ui.showToast(t('toast_rules_cleared'), 'warning');
          ui.renderTeamTab();
        }
      });
    }
  },

  renderSettingsTab() {
    const settingsBody = document.getElementById('pokeskip-body-settings');
    if (settingsBody) {
      settingsBody.innerHTML = this.getSettingsTabHtml();
      this.bindSettingsTabEvents(settingsBody, this);
      if (typeof this.isolateInputs === 'function') {
        this.isolateInputs(settingsBody);
      }
    }
  }
};
