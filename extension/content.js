// PokeSkip Extension Content Script
(function () {
  'use strict';
  try {
    const api = (typeof browser !== 'undefined' && browser.runtime) ? browser : chrome;
    const script = document.createElement('script');
    script.src = api.runtime.getURL('inject.js');
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {
    console.error('[PokeSkip Extension] Échec injection:', e);
  }
})();
