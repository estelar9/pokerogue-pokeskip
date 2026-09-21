// PokeSkip Extension Content Script
(function () {
  'use strict';
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {
    console.error('[PokeSkip Extension] Échec injection:', e);
  }
})();
