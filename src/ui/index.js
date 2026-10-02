// Point d'entrée du sous-système UI de PokéSkip
import cssStyles from './styles.css';
import { PokeSkip } from '../core/state.js';
import { disableGameKeyboard, enableGameKeyboard, isolateInputs } from '../game/input-blocker.js';
import { Toast } from './toast.js';
import { Hud } from './hud.js';
import { Modal } from './modal.js';
import { TypeChart } from './type-chart.js';
import { Hotkeys } from './hotkeys.js';
import { TeamTab } from './tabs/team-tab.js';
import { SavedSpeciesTab } from './tabs/saved-species-tab.js';
import { ReplacementsTab } from './tabs/replacements-tab.js';
import { GlobalTab } from './tabs/global-tab.js';
import { SettingsTab } from './tabs/settings-tab.js';
import { QuickPrompt } from './quick-prompt.js';

export const UI = {
  hudContainer: null,
  modalContainer: null,
  toastContainer: null,
  quickActionElement: null,
  selectedTeamIndex: 0,

  isModalOpen() {
    const modalActive = this.modalContainer && this.modalContainer.classList.contains('active');
    const typeChartActive = this.typeChartContainer && this.typeChartContainer.style.display === 'flex';
    return Boolean(modalActive || typeChartActive);
  },

  disableGameKeyboard,
  enableGameKeyboard,
  isolateInputs,

  init() {
    PokeSkip.onStatsChanged = () => this.updateHudBadge();
    this.injectStyles();
    this.createToastContainer();
    this.createHudButton();
    this.createModal();
    this.bindHotkeys();
  },

  injectStyles() {
    const style = document.createElement('style');
    style.id = 'pokeskip-styles';
    style.textContent = cssStyles;
    document.head.appendChild(style);
  },

  // Toast
  ...Toast,

  // HUD
  ...Hud,

  // Modal
  ...Modal,

  // Type Chart
  ...TypeChart,

  // Hotkeys
  ...Hotkeys,

  // Tabs & Views
  ...TeamTab,
  ...SavedSpeciesTab,
  ...ReplacementsTab,
  ...GlobalTab,
  ...SettingsTab,

  // Quick Prompt
  ...QuickPrompt
};
