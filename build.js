const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version || '1.10.2';

const USERSCRIPT_BANNER = `// ==UserScript==
// @name         PokéSkip — Auto-Skip Sélectif des Capacités pour PokéRogue
// @namespace    https://github.com/estelar9/pokerogue-pokeskip
// @version      ${version}
// @description  Choisis pour chaque Pokémon de ton équipe quelles futures capacités ignorer automatiquement lors des montées de niveau. Affiche type, catégorie, puissance, PP et description. Sauvegarde éternelle par espèce !
// @author       PokéSkip Team
// @match        https://pokerogue.net/*
// @match        https://beta.pokerogue.net/*
// @match        http://localhost:*/*
// @match        *://*/*pokerogue*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-start
// @icon         https://pokerogue.net/favicon.ico
// ==/UserScript==
`;

const isWatch = process.argv.includes('--watch');

const commonConfig = {
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  loader: {
    '.css': 'text'
  },
  legalComments: 'inline'
};

async function build() {
  console.log(`[PokéSkip Build] Version ${version}...`);

  // 1. Build Userscript
  await esbuild.build({
    ...commonConfig,
    outfile: 'pokeskip.user.js',
    banner: {
      js: USERSCRIPT_BANNER
    }
  });
  console.log('✓ pokeskip.user.js généré avec succès');

  // 2. Build Extension inject.js
  await esbuild.build({
    ...commonConfig,
    outfile: 'extension/inject.js',
    banner: {
      js: `// PokéSkip Extension Inject Script v${version}\n`
    }
  });
  console.log('✓ extension/inject.js généré avec succès');

  // 3. Build RogueTop Plugin (Standalone Bundle + Auto-Updating Wrapper)
  await esbuild.build({
    ...commonConfig,
    outfile: 'pokeskip.roguetop.bundle.js',
    banner: {
      js: `// PokéSkip RogueTop Bundle v${version}\n`
    }
  });
  console.log('✓ pokeskip.roguetop.bundle.js généré avec succès');

  const bundleCode = fs.readFileSync('pokeskip.roguetop.bundle.js', 'utf8');
  const roguetopWrapper = `// ==PokéSkip RogueTop Plugin==
// Auto-updating plugin loader for RogueTop Desktop Client v${version}
(function () {
  'use strict';
  const EMBEDDED_VERSION = '${version}';
  const CACHE_KEY = 'pokeskip_roguetop_cached_code';
  const CACHE_VER_KEY = 'pokeskip_roguetop_cached_version';

  function compareSemver(v1, v2) {
    if (!v1 || !v2) return 0;
    const p1 = v1.replace(/^v/, '').split('.').map(Number);
    const p2 = v2.replace(/^v/, '').split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const a = p1[i] || 0;
      const b = p2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  const cachedVer = localStorage.getItem(CACHE_VER_KEY);
  const cachedCode = localStorage.getItem(CACHE_KEY);

  let executed = false;
  if (cachedCode && cachedVer && compareSemver(cachedVer, EMBEDDED_VERSION) > 0) {
    try {
      console.log('[PokéSkip RogueTop] Lancement de la version en cache v' + cachedVer);
      (new Function(cachedCode))();
      executed = true;
    } catch (err) {
      console.error('[PokéSkip RogueTop] Échec lancement version cache, repli sur version intégrée :', err);
      try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_VER_KEY);
      } catch (_) {}
    }
  }

  if (!executed) {
    console.log('[PokéSkip RogueTop] Lancement de la version intégrée v' + EMBEDDED_VERSION);
    ${bundleCode}
  }

  // Recherche de mise à jour automatique en arrière-plan
  setTimeout(() => {
    try {
      fetch('https://raw.githubusercontent.com/estelar9/pokerogue-pokeskip/main/package.json', { cache: 'no-store' })
        .then(r => r.json())
        .then(async (pkg) => {
          const remoteVer = pkg?.version;
          const activeVer = (cachedVer && compareSemver(cachedVer, EMBEDDED_VERSION) > 0) ? cachedVer : EMBEDDED_VERSION;

          if (remoteVer && compareSemver(remoteVer, activeVer) > 0) {
            console.log('[PokéSkip RogueTop] Nouvelle version v' + remoteVer + ' disponible. Téléchargement...');
            const codeRes = await fetch('https://raw.githubusercontent.com/estelar9/pokerogue-pokeskip/main/pokeskip.roguetop.bundle.js', { cache: 'no-store' });
            if (codeRes.ok) {
              const newCode = await codeRes.text();
              if (newCode && newCode.length > 500) {
                localStorage.setItem(CACHE_KEY, newCode);
                localStorage.setItem(CACHE_VER_KEY, remoteVer);
                console.log('[PokéSkip RogueTop] Mis à jour avec succès en v' + remoteVer + ' !');
                if (window.PokeSkipUI?.showToast) {
                  window.PokeSkipUI.showToast('🚀 PokéSkip a été mis à jour en v' + remoteVer + ' ! Redémarrez RogueTop (ou Ctrl+R) pour appliquer.', 'success', 8000);
                }
              }
            }
          }
        })
        .catch(() => {});
    } catch (_) {}
  }, 4000);
})();
`;
  fs.writeFileSync('pokeskip.roguetop.js', roguetopWrapper);
  console.log('✓ pokeskip.roguetop.js généré avec succès (Auto-Updater activé)');

  if (isWatch) {
    console.log('[PokéSkip Build] Mode --watch activé. En attente de modifications...');
    const ctxUserscript = await esbuild.context({
      ...commonConfig,
      outfile: 'pokeskip.user.js',
      banner: { js: USERSCRIPT_BANNER }
    });
    const ctxExtension = await esbuild.context({
      ...commonConfig,
      outfile: 'extension/inject.js',
      banner: { js: `// PokéSkip Extension Inject Script v${version}\n` }
    });
    const ctxRogueTop = await esbuild.context({
      ...commonConfig,
      outfile: 'pokeskip.roguetop.bundle.js',
      banner: { js: `// PokéSkip RogueTop Bundle v${version}\n` }
    });
    await ctxUserscript.watch();
    await ctxExtension.watch();
    await ctxRogueTop.watch();
  }
}

build().catch((err) => {
  console.error('[PokéSkip Build] Erreur:', err);
  process.exit(1);
});
