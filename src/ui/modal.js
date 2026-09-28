// Conteneur principal de la boîte de dialogue modale
import { PokeSkip } from '../core/state.js';
import { SettingsTab } from './tabs/settings-tab.js';

export const Modal = {
  createModal() {
    if (document.getElementById('pokeskip-modal-backdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'pokeskip-modal-backdrop';
    backdrop.innerHTML = `
      <div id="pokeskip-modal">
        <div class="pokeskip-modal-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${this.getPokeballSvg(26)}
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #f8fafc; letter-spacing: -0.2px;">PokéSkip</h2>
                <span class="pokeskip-header-badge">Auto-Skip Intelligent</span>
              </div>
              <span style="font-size: 11.5px; color: #94a3b8;">Gestion automatisée des nouvelles capacités par Pokémon</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <label class="pokeskip-switch-label" title="Activer / Désactiver PokéSkip">
              <span class="pokeskip-switch-text ${PokeSkip.settings.enabled ? 'active' : ''}" id="pokeskip-switch-status-text">${PokeSkip.settings.enabled ? 'Actif' : 'Inactif'}</span>
              <span class="pokeskip-switch">
                <input type="checkbox" id="pokeskip-toggle-enabled" ${PokeSkip.settings.enabled ? 'checked' : ''}>
                <span class="pokeskip-slider"></span>
              </span>
            </label>
            <button id="pokeskip-modal-close" class="pokeskip-close-btn" title="Fermer la fenêtre (Échap)">✕</button>
          </div>
        </div>

        <div class="pokeskip-modal-tabs">
          <button class="pokeskip-tab-btn active" data-tab="team"><span>⚔️</span> <span>Mon Équipe</span></button>
          <button class="pokeskip-tab-btn" data-tab="saved"><span>🧬</span> <span>Règles & Espèces</span></button>
          <button class="pokeskip-tab-btn" data-tab="settings"><span>⚙️</span> <span>Paramètres</span></button>
        </div>

        <div class="pokeskip-modal-body" id="pokeskip-body-team">
          <div id="pokeskip-team-selector" class="pokeskip-team-row"></div>
          <div id="pokeskip-selected-pokemon-content"></div>
        </div>

        <div class="pokeskip-modal-body" id="pokeskip-body-saved" style="display: none;">
          <div id="pokeskip-saved-species-list"></div>
        </div>

        <div class="pokeskip-modal-body" id="pokeskip-body-settings" style="display: none;">
          ${SettingsTab.getSettingsTabHtml()}
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.modalContainer = backdrop;

    // Isoler tous les événements clavier à l'intérieur du modal pour éviter toute transmission à PokéRogue
    const stopModalKeyboard = (e) => {
      if (e.key === 'Escape' && e.type === 'keydown') {
        this.closeModal();
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      e.stopPropagation();
    };
    ['keydown', 'keyup', 'keypress'].forEach(type => {
      backdrop.addEventListener(type, stopModalKeyboard);
    });
    this.isolateInputs(backdrop);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.closeModal();
    });
    document.getElementById('pokeskip-modal-close').addEventListener('click', () => this.closeModal());

    document.getElementById('pokeskip-toggle-enabled').addEventListener('change', (e) => {
      PokeSkip.settings.enabled = e.target.checked;
      PokeSkip.saveSettings();
      this.updateHudBadge();
      const statusText = document.getElementById('pokeskip-switch-status-text');
      if (statusText) {
        statusText.textContent = PokeSkip.settings.enabled ? 'Actif' : 'Inactif';
        statusText.classList.toggle('active', PokeSkip.settings.enabled);
      }
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

    // Lier les événements du tab Paramètres
    SettingsTab.bindSettingsTabEvents(backdrop, this);
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
    this.disableGameKeyboard();
    this.refreshPartyFromGame();
    this.renderTeamTab();
    this.modalContainer.classList.add('active');
  },

  closeModal() {
    if (this.modalContainer) {
      this.modalContainer.classList.remove('active');
    }
    if (!this.isModalOpen()) {
      this.enableGameKeyboard();
    }
  },

  typeChartContainer: null,
  typeChartOpenedViaKey: false,
  typeChartViewMode: 'simplified',
  typeChartShowImmunities: true
};
