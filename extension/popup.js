document.addEventListener('DOMContentLoaded', () => {
  const applyTranslations = (isEn) => {
    if (!isEn) return;
    const statusText = document.getElementById('status-text');
    const statusSub = document.getElementById('status-sub');
    const labelSkipped = document.getElementById('label-skipped');
    const labelRules = document.getElementById('label-rules');
    const btnLaunch = document.getElementById('btn-launch');
    const popupHint = document.getElementById('popup-hint');

    if (statusText) statusText.textContent = 'Ready for PokéRogue';
    if (statusSub) statusSub.textContent = 'Nothing skipped by default';
    if (labelSkipped) labelSkipped.textContent = 'Moves skipped';
    if (labelRules) labelRules.textContent = 'Configured species';
    if (btnLaunch) btnLaunch.innerHTML = '🚀 Launch PokéRogue';
    if (popupHint) popupHint.innerHTML = '💡 In-game, click the <b>PokéSkip</b> capsule or press <b>P</b> to manage your team\'s moves!';
  };

  // Initial check based on browser UI language
  try {
    const uiLang = (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage)
      ? chrome.i18n.getUILanguage()
      : (navigator.language || 'en');
    if (!uiLang.toLowerCase().startsWith('fr')) {
      applyTranslations(true);
    }
  } catch (_) {}

  try {
    const api = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);
    if (!api || !api.tabs) return;

    api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].url) return;

      if (tabs[0].url.includes('pokerogue') || tabs[0].url.includes('localhost')) {
        if (api.scripting && api.scripting.executeScript) {
          api.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              try {
                return {
                  stats: JSON.parse(localStorage.getItem('pokeskip_stats_v1') || '{"totalSkipped":0}'),
                  rules: JSON.parse(localStorage.getItem('pokeskip_species_rules_v1') || '{}'),
                  settings: JSON.parse(localStorage.getItem('pokeskip_settings_v1') || '{}'),
                  gameLang: localStorage.getItem('i18nextLng') || ''
                };
              } catch (e) {
                return null;
              }
            }
          }, (results) => {
            if (results && results[0] && results[0].result) {
              const data = results[0].result;
              const skippedEl = document.getElementById('stat-skipped');
              const rulesEl = document.getElementById('stat-rules');
              if (skippedEl) skippedEl.textContent = data.stats.totalSkipped || 0;
              if (rulesEl) rulesEl.textContent = Object.keys(data.rules || {}).length;

              // Check in-game language settings if available
              const prefLang = data.settings?.language || 'auto';
              if (prefLang === 'en') {
                applyTranslations(true);
              } else if (prefLang === 'auto' && data.gameLang && !data.gameLang.toLowerCase().startsWith('fr')) {
                applyTranslations(true);
              }
            }
          });
        }
      }
    });
  } catch (e) {
    console.warn('[PokeSkip Popup] Info:', e);
  }
});
