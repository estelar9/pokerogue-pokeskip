# 🤝 Contribuer à PokéSkip

Merci de vous intéresser à **PokéSkip** ! Les contributions, suggestions d'améliorations et signalements de bugs sont les bienvenus.

---

## 📁 Architecture du Projet

Le projet est conçu pour être à la fois une **extension de navigateur native** (Manifest V3) et un **Userscript autonome** (Tampermonkey / Violentmonkey) :

- **`extension/`** : Code source de l'extension native WebExtension (Manifest V3).
  - `manifest.json` : Déclaration de l'extension et permissions.
  - `content.js` : Script de contenu injectant `inject.js` dans le contexte de la page PokéRogue.
  - `inject.js` : Cœur logique du plugin (hook de la phase d'apprentissage `LearnMovePhase`, UI du HUD, modal, stockage).
  - `popup.html` / `popup.js` / `popup.css` : Interface de la popup de la barre d'outils navigateur.
  - `icons/` : Icônes aux formats 16x16, 48x48 et 128x128.
- **`pokeskip.user.js`** : Version Userscript prête à l'emploi avec en-têtes `// ==UserScript==` pour Tampermonkey.
- **`pokeskip-extension.zip`** : Archive compressée du dossier `extension/` pour installation directe en un clic.

---

## 🛠️ Développement Local

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-nom/pokeskip.git
   cd pokeskip
   ```

2. Validez la syntaxe des scripts JavaScript :
   ```bash
   npm run lint
   ```

3. Pour régénérer l'archive de l'extension après modification :
   ```bash
   npm run build:zip
   ```

4. Pour synchroniser les modifications entre `extension/inject.js` et `pokeskip.user.js`, veillez à reporter les changements du moteur logique dans les deux fichiers (en préservant l'en-tête Userscript sur `pokeskip.user.js`).

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
