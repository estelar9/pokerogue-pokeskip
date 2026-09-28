// Onglet Paramètres : options, import/export, reset
import { PokeSkip } from '../../core/state.js';

export const SettingsTab = {
  getSettingsTabHtml() {
    return `
      <div style="max-width: 500px; display: flex; flex-direction: column; gap: 16px;">
        <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0 0 2px 0; font-size: 14px; color: #38bdf8;">Notifications & Alertes</h4>
          
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
            <input type="checkbox" id="pokeskip-opt-toasts" ${PokeSkip.settings.showToasts ? 'checked' : ''} style="accent-color: #38bdf8;">
            Afficher les notifications toast lors d'un auto-skip
          </label>

          <div id="pokeskip-opt-toast-duration-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8; padding-left: 24px; opacity: ${PokeSkip.settings.showToasts ? '1' : '0.4'};">
            <span>Durée d'affichage des notifications :</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="number" id="pokeskip-opt-toast-duration" min="1" max="15" step="0.5" value="${((PokeSkip.settings.toastDuration || 2800) / 1000)}" ${!PokeSkip.settings.showToasts ? 'disabled' : ''} style="width: 50px; background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f8fafc; padding: 4px 6px; text-align: center; font-size: 12px;">
              <span>secondes</span>
            </div>
          </div>

          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
            <input type="checkbox" id="pokeskip-opt-hud-count" ${PokeSkip.settings.showHudCount !== false ? 'checked' : ''} style="accent-color: #38bdf8;">
            Afficher le compteur de capacités passées sur la pastille
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

        <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h4 style="margin: 0; font-size: 14px; color: #c084fc; display: flex; align-items: center; gap: 6px;">
              <span>⚡ Mode Avancé : Remplacement d'Attaques</span>
            </h4>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #fff; font-weight: 600;">
              <input type="checkbox" id="pokeskip-opt-advanced-mode" ${PokeSkip.settings.advancedMode ? 'checked' : ''} style="accent-color: #a855f7; width: 16px; height: 16px;">
              Activer
            </label>
          </div>
          <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
            Permet de configurer des remplacements automatiques d'anciennes attaques lorsqu'une nouvelle capacité (non ignorée) est apprise et que le Pokémon possède déjà 4 attaques.
          </div>
          <div id="pokeskip-advanced-status-desc" style="font-size: 11px; color: ${PokeSkip.settings.advancedMode ? '#a855f7' : '#64748b'};">
            ${PokeSkip.settings.advancedMode ? '✓ Actif : les sections de remplacement sont visibles dans les onglets.' : '✕ Désactivé : les règles sont conservées mais non exécutées.'}
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
    `;
  },

  bindSettingsTabEvents(container, ui) {
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
    if (optAdvancedMode) {
      optAdvancedMode.addEventListener('change', (e) => {
        PokeSkip.settings.advancedMode = e.target.checked;
        PokeSkip.saveSettings();
        const statusDesc = container.querySelector('#pokeskip-advanced-status-desc');
        if (statusDesc) {
          statusDesc.textContent = e.target.checked
            ? '✓ Actif : les sections de remplacement sont visibles dans les onglets.'
            : '✕ Désactivé : les règles sont conservées mais non exécutées.';
          statusDesc.style.color = e.target.checked ? '#a855f7' : '#64748b';
        }
        ui.showToast(
          e.target.checked ? '⚡ Mode Avancé activé' : 'Mode Avancé désactivé (règles conservées)',
          e.target.checked ? 'success' : 'info'
        );
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
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(PokeSkip.rules, null, 2));
        const a = document.createElement('a');
        a.setAttribute('href', dataStr);
        a.setAttribute('download', `pokeskip-rules-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        ui.showToast('Règles exportées en fichier JSON', 'success');
      });
    }

    const btnImport = container.querySelector('#pokeskip-btn-import');
    if (btnImport) {
      btnImport.addEventListener('click', () => {
        const json = prompt('Collez ici le contenu JSON de vos règles :');
        if (!json) return;
        try {
          const parsed = JSON.parse(json);
          if (typeof parsed === 'object') {
            PokeSkip.rules = { ...PokeSkip.rules, ...parsed };
            PokeSkip.saveRules();
            ui.showToast('Règles importées avec succès !', 'success');
            ui.renderTeamTab();
          }
        } catch (err) {
          alert('Erreur : le format JSON est invalide.');
        }
      });
    }

    const btnReset = container.querySelector('#pokeskip-btn-reset-rules');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment effacer TOUTES les règles enregistrées ? Rien ne sera plus skip.')) {
          PokeSkip.rules = {};
          PokeSkip.saveRules();
          ui.showToast('Toutes les règles ont été effacées.', 'warning');
          ui.renderTeamTab();
        }
      });
    }
  }
};
