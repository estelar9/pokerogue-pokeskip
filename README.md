<div align="center">

# ⚡ PokéSkip — Auto-Skip Intelligent pour PokéRogue

**L'extension & userscript sélectif qui automatise le refus des capacités indésirables dans PokéRogue et affiche la table des types en combat.**  
*Ne perdez plus votre temps à refuser manuellement Mimi-Queue ou Rugissement à chaque niveau !*

[![Version](https://img.shields.io/badge/version-1.9.0-38bdf8.svg?style=for-the-badge)](https://github.com/estelar9/pokerogue-pokeskip/releases)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-10b981.svg?style=for-the-badge)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-f59e0b.svg?style=for-the-badge)](https://www.tampermonkey.net/)
[![PokéRogue](https://img.shields.io/badge/PokéRogue-pokerogue.net-ef4444.svg?style=for-the-badge)](https://pokerogue.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-a855f7.svg?style=for-the-badge)](LICENSE)

<br/>

[🚀 Installation Rapide](#-installation-rapide) •
[🎯 Fonctionnalités Clés](#-fonctionnalités-clés) •
[⚔️ Tableau des Types (T)](#️-tableau-des-types--forces--faiblesses) •
[🎮 Utilisation en Jeu](#-comment-lutiliser-en-jeu) •
[📱 Mobile / Android](#-compatibilité-mobile-android) •
[📦 Releases](CHANGELOG.md) •
[🤝 Contribuer](CONTRIBUTING.md)

</div>

---

## 💡 Pourquoi PokéSkip ?

Dans [PokéRogue](https://pokerogue.net/), vos Pokémon montent de niveau à un rythme effréné. À chaque niveau, le jeu interrompt les combats pour vous proposer des attaques de base souvent obsolètes (*Mimi-Queue*, *Rugissement*, *Groz'Yeux*...). 

- ❌ **Sans PokéSkip** : Vous devez appuyer frénétiquement sur B / Refuser à répétition, ralentissant vos runs et risquant d'écraser une attaque essentielle par mégarde.
- ✅ **Avec PokéSkip** : **Par défaut, rien n'est sauté**. Vous visualisez la liste complète des attaques que votre Pokémon apprendra jusqu'au niveau 100 (incluant toute sa lignée évolutive). Vous décochez simplement celles que vous ne voulez jamais voir, configurez si vous le souhaitez des remplacements automatiques (Mode Avancé), et profitez d'un tableau des types instantané en un appui sur <kbd>T</kbd> !

---

## 🚀 Installation Rapide

Choisissez la méthode qui vous convient le mieux :

### Option 1 : En 1 Clic via Tampermonkey *(Recommandé — Tous Navigateurs)*

Compatible avec **Google Chrome, Mozilla Firefox, Microsoft Edge, Opera, Brave, Vivaldi, Safari, Kiwi Browser (Android)**.

1. Installez l'extension [Tampermonkey](https://www.tampermonkey.net/) (ou Violentmonkey) depuis le store de votre navigateur.
2. Cliquez sur le lien direct suivant :  
   👉 **[Installer PokéSkip (pokeskip.user.js)](https://raw.githubusercontent.com/estelar9/pokerogue-pokeskip/main/pokeskip.user.js)**
3. Tampermonkey s'ouvre : cliquez sur **« Installer »** (ou « Mettre à jour »).
4. Rendez-vous sur [PokéRogue](https://pokerogue.net/) : la pastille PokéSkip apparaît sur votre écran !

---

### Option 2 : Extension Navigateur Directe *(Sans Outil Tiers)*

Compatible avec **Chrome, Edge, Brave, Opera, Opera GX, Vivaldi**.

1. Téléchargez la dernière archive **[`pokeskip-extension.zip`](https://github.com/estelar9/pokerogue-pokeskip/releases/latest/download/pokeskip-extension.zip)** depuis la page des [Releases](https://github.com/estelar9/pokerogue-pokeskip/releases) et décompressez-la dans un dossier permanent.
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
| 🧬 **Lignée Évolutive Complète** | Visualisez et configurez d'avance **toutes les capacités futures de votre espèce et de ses évolutions** (ex: Salamèche affiche les capacités exclusives de Reptincel et Dracaufeu). Badges d'espèce dédiés `🧬 Nom` et tri chronologique par niveau. |
| ⚡ **Mode Simple vs Mode Avancé** | • **Mode Simple** : Cochez/décochez simplement les capacités à garder ou sauter.<br/>• **Mode Avancé** : Automatisez le remplacement d'une attaque spécifique existante dès l'apprentissage d'une nouvelle capacité ciblée. |
| ⚔️ **Tableau des Types Instantané (<kbd>T</kbd>)** | Matrice des forces & faiblesses complète en jeu avec détection automatique de l'adversaire en combat. Bascule fluide entre vue **`⚡ Simplifié`** (100% visible sans scroll, switch d'immunités) et **`📊 Complet`** (matrice 18×18). |
| 📊 **Fiches Techniques Détaillées** | Affiche le **Type officiel** (badge coloré), la **Catégorie** (💥 Physique, ✨ Spéciale, 🌀 Statut), la **Puissance**, la **Précision**, les **PP**, ainsi que la **description exacte de l'effet**. |
| 🔍 **Recherche & Filtre Rapide** | Filtrez instantanément par nom de capacité ou par nom d'évolution (ex: taper *"Dracaufeu"* filtre directement les capacités de Dracaufeu). |
| ⏱️ **Prompt Rapide Personnalisable** | Si une attaque inconnue ou non configurée apparaît, une alerte discrète permet de l'ignorer pour toujours en 1 clic. Durée et activation ajustables dans les options. |
| 💾 **Sauvegarde Éternelle par Espèce** | Vos réglages sont mémorisés de manière permanente par espèce (`speciesId`). Relancez une run plus tard avec le même Pokémon : vos préférences sont retrouvées ! |
| 🎈 **HUD Flottant & Responsive** | Bulle discrète avec PokéBall bleue, compteur de skips et boutons d'accès rapide (`⚙️ PokéSkip`, `⚔️ Types`). Maintien automatique dans l'écran lors du redimensionnement de la fenêtre. |
| ⌨️ **Raccourcis Clavier Dédiés** | • <kbd>P</kbd> : Ouvrir / Fermer le menu PokéSkip.<br/>• <kbd>T</kbd> : Ouvrir / Fermer le tableau des types (mode bascule on/off).<br/>• <kbd>Échap</kbd> : Fermer la fenêtre active. |
| 🛡️ **Respect des Choix Volontaires** | N'interfère jamais avec les **Capsules Techniques (CTs)** ou les **Champignons Mémoire** : vos apprentissages délibérés restent 100% manuels. |

---

## ⚔️ Tableau des Types & Forces / Faiblesses

En combat, appuyez simplement sur la touche **<kbd>T</kbd>** ou cliquez sur le bouton **`⚔️`** du HUD pour ouvrir instantanément l'aide tactique des types.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ⚔️ Forces & Faiblesses    [ ⚡ Simplifié ] [ 📊 Complet ]   🎯 Cible   ✕ │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Mode Simplifié :                                                      │
│  ⚠️ Faiblesses [🛡️ Immunités (×0) ●]  ➔  Type  ➔  Forces (inflige ×2) ⚔️ │
│  Subit ×2 / Immunisé                   Badge      Inflige ×2           │
│  (Tous les 18 types visibles d'un coup d'œil, 0 défilement)             │
│                                                                        │
│  Mode Complet :                                                        │
│  Matrice 18 × 18 interactive avec surbrillance continue de la colonne   │
│  du défenseur adverse (bulle unifiée si deux types adjacents).         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- **Onglet `⚡ Simplifié`** :
  - Affiche les 18 types directement sans aucun défilement vertical (`overflow: hidden`).
  - **Commutateur d'immunités** : Activez ou masquez les immunités (×0) en un clic grâce au toggle `🛡️ Immunités (×0)`.
  - **Bulle de ciblage unifiée** : Si le Pokémon adverse a deux types consécutifs dans la liste, ils sont englobés dans **une seule et même bulle continue**.
  - Zéro effet de survol invasif pour une lecture claire et immédiate.
- **Onglet `📊 Complet` (Matrice 18×18)** :
  - Matrice des 18 types contre 18 types.
  - La colonne correspondant au Pokémon adverse est surlignée par une **bulle verticale continue** sur toute la hauteur. Si l'adversaire a deux types adjacents, une **bulle unique** enveloppe les deux colonnes ensemble.
  - Surbrillance sobre de la ligne au survol (`tr:hover`).
- **Transition Fluide** : Le basculement entre `⚡ Simplifié` et `📊 Complet` se fait sans aucun clignotement ni rechargement de fenêtre grâce à une animation de fondu native (`pks-tab-fade`).

---

## 🎮 Comment l'utiliser en Jeu ?

1. Lancez **[PokéRogue](https://pokerogue.net/)**.
2. **Pour configurer vos capacités** :
   - Cliquez sur la pastille bleue PokéSkip ou appuyez sur <kbd>P</kbd>.
   - Sélectionnez un Pokémon de votre équipe : parcourez ses capacités futures par niveau (ainsi que celles de sa lignée).
   - Décochez les attaques indésirables, ou configurez des remplacements dans le Mode Avancé.
3. **Pour inspecter les types adverses en plein combat** :
   - Appuyez simplement sur <kbd>T</kbd> pour afficher le tableau des types adapté à votre combat.
   - Appuyez à nouveau sur <kbd>T</kbd> ou <kbd>Échap</kbd> pour le fermer.
4. **C'est tout !** Pendant vos combats, les attaques que vous avez refusées sont sautées automatiquement et instantanément.

---

## 📱 Compatibilité Mobile (Android)

Vous pouvez utiliser PokéSkip sur votre smartphone ou tablette Android :

1. Installez un navigateur supportant les extensions (ex: **Kiwi Browser** ou **Firefox pour Android**).
2. Installez l'extension **Tampermonkey** depuis le store de votre navigateur.
3. Ouvrez ce dépôt et cliquez sur **[`pokeskip.user.js`](https://raw.githubusercontent.com/estelar9/pokerogue-pokeskip/main/pokeskip.user.js)** pour l'installer.
4. Lancez PokéRogue : la pastille flottante est disponible au doigt et repositionnable !

---

## 📂 Organisation du Code

```text
pokeskip/
├── extension/             # Extension WebExtension Manifest V3 (Chrome, Edge, Brave...)
│   ├── manifest.json      # Configuration du manifest
│   ├── content.js         # Script injecteur de page
│   ├── inject.js          # Moteur principal : interception, UI, TypeChart & logique
│   ├── popup.html/js/css  # Menu d'extension dans la barre d'outils
│   └── icons/             # Icônes officielles
├── pokeskip.user.js       # Script tout-en-un pour Tampermonkey / Violentmonkey
├── pokeskip-extension.zip # Archive précompilée de l'extension
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
