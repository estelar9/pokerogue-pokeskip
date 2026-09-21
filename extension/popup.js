document.addEventListener('DOMContentLoaded', () => {
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
                  rules: JSON.parse(localStorage.getItem('pokeskip_species_rules_v1') || '{}')
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
            }
          });
        }
      }
    });
  } catch (e) {
    console.warn('[PokeSkip Popup] Info:', e);
  }
});
