<div align="center">

# ⚡ PokéSkip — Auto-Skip Intelligent pour PokéRogue

**L'extension & userscript sélectif qui automatise le refus des capacités indésirables dans PokéRogue.**  
*Ne perdez plus votre temps à refuser manuellement Mimi-Queue ou Rugissement à chaque niveau !*

[![Version](https://img.shields.io/badge/version-1.4.1-38bdf8.svg?style=for-the-badge)](https://github.com)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-10b981.svg?style=for-the-badge)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-f59e0b.svg?style=for-the-badge)](https://www.tampermonkey.net/)
[![PokéRogue](https://img.shields.io/badge/PokéRogue-pokerogue.net-ef4444.svg?style=for-the-badge)](https://pokerogue.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-a855f7.svg?style=for-the-badge)](LICENSE)

<br/>

[🚀 Installation Rapide](#-installation-rapide) •
[🎯 Fonctionnalités](#-fonctionnalités-clés) •
[🎮 Utilisation en Jeu](#-comment-lutiliser-en-jeu) •
[📱 Mobile / Android](#-compatibilité-mobile-android) •
[🛠️ Simulateur Démo](#-simulateur-interactif-hors-ligne) •
[🤝 Contribuer](CONTRIBUTING.md)

</div>

---

## 💡 Pourquoi PokéSkip ?

Dans [PokéRogue](https://pokerogue.net/), vos Pokémon montent de niveau à un rythme effréné. À chaque niveau, le jeu interrompt les combats pour vous proposer des attaques de base souvent obsolètes (*Mimi-Queue*, *Rugissement*, *Groz'Yeux*...). 

- ❌ **Sans PokéSkip** : Vous devez appuyer frénétiquement sur B / Refuser à répétition, ralentissant vos runs et risquant d'écraser une attaque essentielle par mégarde.
- ✅ **Avec PokéSkip** : **Par défaut, rien n'est sauté**. Vous avez la liste complète des attaques que votre Pokémon apprendra jusqu'au niveau 100. Vous décochez simplement celles que vous ne voulez jamais voir, et le jeu continue sans la moindre interruption !

---

## 🚀 Installation Rapide

Choisissez la méthode qui vous convient le mieux :

### Option 1 : En 1 Clic via Tampermonkey *(Recommandé — Tous Navigateurs)*

Compatible avec **Google Chrome, Mozilla Firefox, Microsoft Edge, Opera, Brave, Vivaldi, Safari, Kiwi Browser (Android)**.

1. Installez l'extension [Tampermonkey](https://www.tampermonkey.net/) (ou Violentmonkey) depuis le store de votre navigateur.
2. Cliquez sur le lien direct suivant :  
   👉 **[Installer PokéSkip (pokeskip.user.js)](pokeskip.user.js?raw=1)**
3. Tampermonkey s'ouvre : cliquez sur **« Installer »**.
4. Rendez-vous sur [PokéRogue](https://pokerogue.net/) : la pastille bleue PokéSkip apparaît sur votre écran !

---

### Option 2 : Extension Navigateur Directe *(Sans Outil Tiers)*

Compatible avec **Chrome, Edge, Brave, Opera, Opera GX, Vivaldi**.

1. Téléchargez l'archive pré-empaquetée **[`pokeskip-extension.zip`](pokeskip-extension.zip)** et décompressez-la dans un dossier.
2. Ouvrez la page de gestion des extensions de votre navigateur :
   - **Chrome / Brave** : `chrome://extensions`
   - **Edge** : `edge://extensions`
   - **Opera / Opera GX** : `opera://extensions`
   - **Vivaldi** : `vivaldi://extensions`
3. Activez le bouton **« Mode Développeur »** (en haut à droite).
4. Cliquez sur **« Charger l'extension non empaquetée »** et sélectionnez le dossier `extension` extrait.
5. Lancez [PokéRogue](https://pokerogue.net/) : c'est prêt !

---

## 🎯 Fonctionnalités Clés

| Fonctionnalité | Description |
| :--- | :--- |
| 🔮 **Toutes les Capacités Futures (Niv. 1 à 100)** | Explore l'arbre d'apprentissage complet de l'espèce. Vous pouvez configurer d'avance les attaques à ignorer avant même qu'elles n'apparaissent ! |
| 📊 **Fiches Techniques Détaillées** | Affiche le **Type officiel** (badge coloré), la **Catégorie** (💥 Physique, ✨ Spéciale, 🌀 Statut), la **Puissance**, la **Précision**, les **PP**, ainsi que la **description exacte de l'effet**. |
| 🔵 **Contrôle Total (Gardé par défaut)** | Chaque capacité est cochée en bleu par défaut. Décochez simplement celles que vous souhaitez sauter automatiquement. Boutons rapides *« 🔵 Tout garder »* et *« ⬜ Tout ignorer »*. |
| ⏱️ **Prompt Rapide Personnalisable** | Si une attaque non configurée apparaît, une alerte discrète en haut au centre vous permet de l'ignorer pour toujours en 1 clic. Vous pouvez **désactiver ce prompt** ou **ajuster sa durée d'affichage** (15s par défaut) dans l'onglet Options ! |
| 💾 **Sauvegarde Éternelle par Espèce** | Vos réglages sont mémorisés par identifiant d'espèce (`speciesId`). Relancez une partie 1 mois plus tard avec le même Pokémon : vos règles sont instantanément retrouvées ! |
| 🎈 **Pastille Discrète & Déplaçable** | Pastille compacte avec vraie PokéBall bleue en SVG vectoriel et compteur d'attaques évitées. **Glissez-déposez-la n'importe où** sur l'écran selon votre convenance (position sauvegardée). |
| ⌨️ **Raccourci Clavier Dédié** | Appuyez simplement sur la touche <kbd>P</kbd> pour ouvrir ou fermer l'interface instantanément. |
| 🛡️ **Respect des Choix Volontaires** | N'interfère jamais avec les **Capsules Techniques (CTs)** ou les **Champignons Mémoire** : vos apprentissages délibérés restent 100% manuels. |

---

## 🎮 Comment l'utiliser en Jeu ?

1. Lancez **[PokéRogue](https://pokerogue.net/)**.
2. Cliquez sur la **pastille bleue** sur le bord de l'écran ou appuyez sur <kbd>P</kbd>.
3. Sélectionnez le Pokémon de votre équipe que vous souhaitez configurer :
   - Parcourez ses capacités futures par niveau.
   - **Décochez** les attaques inutiles pour votre stratégie (ex: *Mimi-Queue*, *Flash*...).
4. Fermez la fenêtre (<kbd>Échap</kbd> ou croix `✕`).
5. **C'est tout !** Pendant vos combats, toutes les attaques cochées vous seront proposées normalement, tandis que les attaques décochées seront passées instantanément et silencieusement.

---

## 📱 Compatibilité Mobile (Android)

Vous pouvez utiliser PokéSkip sur votre smartphone ou tablette Android :

1. Installez un navigateur supportant les extensions (ex: **Kiwi Browser** ou **Firefox pour Android**).
2. Installez l'extension **Tampermonkey** depuis le Chrome Web Store ou Firefox Add-ons.
3. Ouvrez ce dépôt et cliquez sur **[`pokeskip.user.js`](pokeskip.user.js?raw=1)** pour l'installer.
4. Lancez PokéRogue : la pastille flottante est disponible au doigt et repositionnable !

---

## 📂 Organisation du Code

```text
pokeskip/
├── extension/             # Extension WebExtension Manifest V3 (Chrome, Edge, Brave...)
│   ├── manifest.json      # Configuration de l'extension
│   ├── content.js         # Script injecteur
│   ├── inject.js          # Moteur d'interception, UI HUD & logique
│   ├── popup.html/js/css  # Menu d'extension dans la barre d'outils
│   └── icons/             # Icônes officielles
├── pokeskip.user.js       # Script tout-en-un pour Tampermonkey / Violentmonkey
├── pokeskip-extension.zip # Archive précompilée prête au téléchargement
├── CHANGELOG.md           # Journal détaillé des versions et patch notes
├── CONTRIBUTING.md        # Guide de contribution
└── LICENSE                # Licence MIT
```

---

## 📦 Releases & Patch Notes

Chaque version est documentée et publiée avec ses livrables prêts à l'emploi :
- Consultez le [**Journal des Modifications (CHANGELOG.md)**](CHANGELOG.md) pour retrouver le patch note détaillé de chaque version.
- Téléchargez directement les archives pré-packagées sur la page des [**Releases GitHub**](https://github.com/estelar9/pokerogue-pokeskip/releases).

---

## 📄 Licence & Avertissements

- Distribué sous licence open-source **MIT**. Voir le fichier [`LICENSE`](LICENSE) pour plus de détails.
- **Avertissement légal** : PokéSkip est un outil communautaire indépendant et gratuit pour améliorer l'expérience de jeu sur PokéRogue. Pokémon et les noms de Pokémon sont des marques déposées de Nintendo, Creatures Inc. et Game Freak Inc. Ce projet n'est ni affilié ni approuvé par Nintendo ou PokéRogue.
