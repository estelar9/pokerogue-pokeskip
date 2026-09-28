# 🤝 Contribuer à PokéSkip

Merci de vous intéresser à **PokéSkip** ! Les contributions, suggestions d'améliorations et signalements de bugs sont les bienvenus.

---

## 📁 Architecture du Projet

Le projet est structuré selon une **architecture modulaire moderne** avec une source de vérité unique dans le dossier `src/` :

- **`src/`** : Code source modulaire ES6.
  - **`constants/`** : Référentiels types (`types.js`), catégories (`categories.js`), clés de stockage (`storage-keys.js`).
  - **`data/`** : Dictionnaires volumineux séparés (`families.js`, `branched-prevolutions.js`, `megas.js`, `species-names.js`).
  - **`core/`** : Services métier (`storage.js`, `asset-loader.js`, `lineage-manager.js`, `state.js`, `moves-resolver.js`, `battle-analyzer.js`).
  - **`game/`** : Intégration moteur PokéRogue Phaser (`phaser-hook.js`, `input-blocker.js`).
  - **`ui/`** : Interface utilisateur découpée (`styles.css`, `hud.js`, `modal.js`, `type-chart.js`, `hotkeys.js`, `quick-prompt.js`, et les sous-onglets dans `tabs/`).
  - **`index.js`** : Orchestrateur et point d'entrée principal.
- **`build.js`** : Script de compilation unifié avec **esbuild** qui génère simultanément le Userscript et l'Extension.
- **`pokeskip.user.js`** : *(Généré automatiquement)* Version Userscript avec en-têtes Tampermonkey.
- **`extension/`** : Extension native WebExtension (Manifest V3).
  - `inject.js` : *(Généré automatiquement)* Bundle injecté dans le contexte du jeu.
  - `content.js`, `manifest.json`, `popup.html`, `popup.js`, `popup.css`, `icons/`.
- **`pokeskip-extension.zip`** : Archive compressée prête à être déployée.

---

## 🛠️ Développement Local

1. Installez les dépendances de développement :
   ```bash
   npm install
   ```

2. Compilez le projet (génère `pokeskip.user.js` et `extension/inject.js` en une commande) :
   ```bash
   npm run build
   ```

3. Mode développement avec rechargement automatique (watch) :
   ```bash
   npm run dev
   ```

4. Validez la syntaxe de l'ensemble du projet :
   ```bash
   npm run lint
   ```

5. Générez l'archive de déploiement de l'extension :
   ```bash
   npm run build:zip
   ```

---

## 🐛 Signaler un Problème

Avant d'ouvrir une *Issue*, merci de vérifier :
- La version de votre navigateur.
- Si le problème survient avec l'extension native ou le userscript.
- Le nom du Pokémon et de l'attaque concernée.
- Les éventuels messages dans la console de développement (`F12` > Console).

---

## 📜 Règles de Code & Style

- **Zéro dépendance lourde** : Le projet utilise du JavaScript moderne et du Vanilla CSS pour garantir une exécution ultra-rapide sans ralentir PokéRogue.
- **Respect de la sauvegarde** : Ne pas modifier sans précaution les clés `localStorage` (`pokeskip_rules_v1`, `pokeskip_settings_v1`, etc.) pour préserver les configurations des utilisateurs.
- **Identifiants sûrs** : Conserver les identifiants techniques et classes CSS sans accents (`pokeskip_*`) pour éviter tout bug d'encodage.
