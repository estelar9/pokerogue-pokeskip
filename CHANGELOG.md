# 📜 Journal des Modifications (Changelog & Patch Notes)

Toutes les modifications notables apportées à PokéSkip sont consignées dans ce document.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

---

## [v1.5.0] - 2026-09-23

### 🌟 Nouveautés majeures

- **Gestion Unifiée des Lignées Évolutives (`LineageManager`)** :
  - Fin de la gestion éclatée par stade d'évolution (Roucool / Roucoups / Roucarnage).
  - Un seul profil commun regroupe désormais toute la famille d'un Pokémon.
  - Les attaques cochées ou décochées s'appliquent immédiatement à **tous les stades et formes** (actuels et futurs).
  - Affichage explicite des arbres avec flèches :
    - Évolutions linéaires : `Roucool → Roucoups → Roucarnage`, `Salamèche → Reptincel → Dracaufeu`
    - Évolutions à embranchements : `Évoli → Aquali / Voltali / Pyroli / Mentali / Noctali / Phyllali / Givrali / Nymphali`, `Ramoloss → Flagadoss / Roigada`, `Debugant → Kicklee / Tygnon / Kapoera`
  - Migration 100% automatique et sans perte de vos anciennes règles vers les nouvelles lignées.

- **Intégration des Sprites Pixel-Art Officiels** :
  - Remplacement des emojis de substitution par les **sprites officiels des Pokémon** (via PokeAPI).
  - Support natif des formes **Chromatiques / Shiny ✨** avec le sprite shiny dédié et un badge visuel.
  - Rendu haute fidélité (`image-rendering: pixelated`), ombrage dynamique et zoom fluide au survol.
  - Fallback automatique et silencieux vers l'icône de secours si la connexion réseau est indisponible.

- **Refonte Épurée de la Pastille Flottante (HUD)** :
  - **Statut non cliquable** : Affiche `● ON` (vert émeraude) ou `○ OFF` (gris/ambre) de manière purement informative, éliminant tout risque de désactivation accidentelle en déplaçant la pastille.
  - **Compteur par Run uniquement** : Indique le nombre de capacités évitées pendant la partie en cours (`0 passée`, `1 passée`, etc.) sans estimation spéculative de temps.
  - **Détection automatique de Run** : Le compteur se réinitialise automatiquement au début de chaque nouvelle partie (détection par graine de génération `scene.seed`), tandis que l'historique global reste sauvegardé.

### 🛡️ Corrections & Fiabilité

- **Protection des messages in-game d'autre nature** :
  - Résolution d'un cas où l'affichage préalable d'un message d'évolution ou de montée de niveau pouvait être tronqué ou bloquer l'auto-skip de la capacité suivante.
  - Le système inspecte le texte du dialogue en cours : les messages informatifs tiers sont préservés pour la lecture du joueur, et la demande d'apprentissage est contournée immédiatement dès sa présentation.

### 🧹 Maintenance & Organisation du Répertoire

- **Désindexation du dossier de démo locale** :
  - Le dossier `demo/` est désormais ignoré par Git et exclu du dépôt GitHub (`.gitignore`), tout en restant utilisable localement pour les tests.
  - Nettoyage des scripts npm et de la documentation.
- **Automatisation des Releases GitHub** :
  - Ajout d'un workflow GitHub Actions (`.github/workflows/release.yml`) pour générer automatiquement une Release GitHub avec les archives téléchargeables (`pokeskip-extension.zip` et `pokeskip.user.js`) à chaque nouveau tag `v*`.

---

## [v1.4.0] - 2026-09-20

### Ajouté
- Détection dynamique des attaques apprises par montée de niveau.
- Filtre instantané des attaques par nom.
- Synchronisation des règles entre sessions via le LocalStorage.

---

## [v1.0.0] - 2026-09-15

### Ajouté
- Version initiale de PokéSkip pour PokéRogue.
- Support UserScript (Tampermonkey) et Extension Navigateur (Chrome / Firefox / Brave / Edge).
- Widget HUD déplaçable avec mémorisation de la position.
