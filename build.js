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
    await ctxUserscript.watch();
    await ctxExtension.watch();
  }
}

build().catch((err) => {
  console.error('[PokéSkip Build] Erreur:', err);
  process.exit(1);
});
