# 📜 Journal des Modifications (Changelog & Patch Notes)

Toutes les modifications notables apportées à PokéSkip sont consignées dans ce document.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [v1.16.1] - 2026-10-04

### 🌐 Internationalisation WebExtensions & Multi-Stores (Chrome & Edge)
- **Localisation Complète WebExtensions (`_locales`)** :
  - Intégration des dictionnaires officiels `_locales/fr/messages.json` et `_locales/en/messages.json`.
  - Prise en charge des variables `__MSG_appName__`, `__MSG_appDesc__` et `__MSG_actionTitle__` dans le manifeste.
- **Résolution du Conflit de Langue Microsoft Edge Add-ons** :
  - Déclaration explicite du Français (`fr`) comme `default_locale` du package avec l'Anglais (`en`) en langue additionnelle.
  - Permet la reconnaissance immédiate des deux langues sur le Partner Center Edge sans blocage linguistique.
- **Activation de l'Internationalisation Chrome Web Store** :
  - Reconnaissance automatique du support multilingue par le Chrome Web Store Developer Dashboard.
- **Améliorations de la Popup d'Extension** :
  - Traduction bidirectionnelle automatique (FR/EN) et synchronisation dynamique du numéro de version depuis le manifeste.
  - Validation automatique de la syntaxe JSON des dictionnaires lors de `npm run lint`.

---

## [v1.16.0] - 2026-10-02

### 🌐 Améliorations Directes Universelles d'Attaques (Règles Globales)
- **Nouvel Onglet "Règles Globales" (Mode Avancé)** :
  - Permet d'automatiser l'évolution des capacités directes sur l'ensemble de vos Pokémon (ex: *Pistolet à O* ➔ *Bulles d'O* ➔ *Hydrocanon* ou *Éclair* ➔ *Étincelle* ➔ *Tonnerre*).
  - Plus de 25 familles d'attaques progressives intégrées pour tous les types élémentaires (Plante, Feu, Eau, Électrik, Glace, Psy, Ténèbres, Combat, Sol, Roche, Vol, Insecte, Spectre, Poison, Dragon, Acier, Fée, Normal, Statut).
  - Désactivé par défaut : le joueur garde un contrôle total et doit l'activer intentionnellement via l'interrupteur maître.
- **Infobulles Riches & Statistiques en Direct de PokéRogue** :
  - Survol interactif de chaque pastille d'attaque affichant le Type, la Catégorie (Physique, Spéciale, Statut), la Puissance, la Précision (avec mention des attaques infaillibles), les PP et la description de l'effet.
  - Extraction dynamique prioritaire depuis le moteur PokéRogue afin d'afficher fidèlement les équilibrages et modifications propres au jeu.
- **Saut d'Attaque ("Skip-Over") & Exclusion Individuelle** :
  - Possibilité d'exclure ou de réactiver n'importe quelle capacité d'une chaîne d'un simple clic.
  - L'automatisation saute par-dessus les attaques exclues (ex: passer de *Bulles d'O* directement à *Hydrocanon* sans jamais apprendre *Surf*).
  - Marquage visuel immédiat (texte barré, bordure rouge pointillée et badge d'exclusion).
- **Priorité des Espèces Préservée** :
  - Les règles spécifiques définies sur une espèce ou une lignée particulière restent strictement prioritaires sur les règles universelles.

---

## [v1.15.0] - 2026-10-02

### 🌐 Support Multilingue Complet (Français & Anglais)
- **Internationalisation Intégrale (i18n)** :
  - Traduction bilingue complète de l'interface utilisateur : pastille HUD, en-têtes, tableau des types, onglet Équipe, onglet Espèces, mode avancé de remplacements, alertes et notifications toast.
  - Traduction des 19 types Pokémon et des 3 catégories d'attaques (*Physique*, *Spéciale*, *Statut* / *Physical*, *Special*, *Status*).
  - Intégration des noms officiels anglais des Pokémon et des formes régionales (*Alolan*, *Galarian*, *Hisuian*, *Paldean*).
- **Détection Automatique & Sélecteur de Langue** :
  - Synchronisation automatique avec la langue choisie dans PokéRogue (`i18next`) et repli sur la langue du navigateur.
  - Sélecteur dédié dans l'onglet *Paramètres* avec rechargement dynamique immédiat de l'interface.
- **Déploiement Automatisé Multi-Stores** :
  - Intégration du workflow de publication automatique pour Microsoft Edge Add-ons et Chrome Web Store en complément de Firefox AMO.

---

## [v1.14.3] - 2026-10-01

### 💾 Sauvegarde & Importation Complète (Règles + Paramètres)
- **Exportation et Importation Unifiées** :
  - Le fichier de sauvegarde JSON inclut désormais l'ensemble des options et paramètres utilisateur (durées de notifications, affichage HUD, mode avancé de remplacement, alertes rapides).
  - Prise en charge universelle : rétrocompatibilité totale avec les anciens fichiers contenant uniquement des règles de combat.
  - Mise à jour visuelle instantanée des cases à cocher et réglages dans l'onglet Paramètres dès l'importation.

---

## [v1.14.2] - 2026-10-01

### ✨ Amélioration de l'Importation de Règles & UX RogueTop
- **Importation de Règles Intuitive via Sélecteur de Fichier Natif** :
  - Remplacement de la boîte de dialogue textuelle (`prompt`) par l'ouverture directe du sélecteur de fichiers de votre système d'exploitation (`<input type="file" accept=".json">`).
  - Sélection simple de votre fichier `pokeskip-rules-*.json` sauvegardé.
  - Validation et fusion sécurisée des règles en local avec notification du nombre exact de règles importées.
  - Rafraîchissement dynamique et immédiat des listes d'équipes et de remplacements.
- **Précision du Toast de Mise à Jour RogueTop** :
  - Recommandation explicite de redémarrage de l'application de bureau RogueTop pour une application immédiate de la version mise en cache.

---

## [v1.14.1] - 2026-10-01

### 🛡️ Correctifs d'Isolation Clavier & Écran de Connexion
- **Résolution du Conflit de Saisie sur l'Écran de Connexion (RogueTop & Web)** :
  - Restriction stricte des écouteurs `focusin` et `focusout` aux seuls champs internes de PokéSkip.
  - Suppression du vol de focus intempestif vers le canvas lors de la saisie d'identifiants de jeu.
  - Élimination définitive du contour blanc/ligne de focus sur le canvas de jeu.
- **Renforcement de la Protection Clavier en Arrière-Plan** :
  - Verrouillage total garanti des touches vers PokéRogue tant que le menu PokéSkip ou le tableau des types est ouvert.

---

## [v1.14.0] - 2026-10-01

### 🖥️ Compatibilité Client Desktop RogueTop & Mises à Jour Automatiques
- **Support Natif du Client Desktop RogueTop** :
  - Génération d'un plugin dédié `pokeskip.roguetop.js` compatible avec le système de mods de RogueTop (Tauri).
  - Détection automatique de l'environnement Tauri / RogueTop en modes en ligne et hors ligne.
- **Auto-Updater Transparent Intégré** :
  - Le plugin RogueTop intègre un chargeur intelligent avec mise en cache locale (`localStorage`).
  - Détection silencieuse en arrière-plan des nouvelles versions disponibles sur GitHub.
  - Téléchargement automatique de la mise à jour et notification discrète par toast en jeu (`Ctrl+R` pour appliquer).
- **Intégration du Workflow de Release** :
  - Publication automatique de `pokeskip.roguetop.js` parmi les assets officiels des releases GitHub.

---

## [v1.13.0] - 2026-10-01

### 🚀 Nouveautés & Gestion Avancée des Prompts
- **Bouton "Ne plus demander" dans le Quick Prompt** :
  - Permet d'indiquer en un clic de ne plus jamais afficher de confirmation d'auto-skip pour cette capacité sur cette lignée/Pokémon.
- **Statut "Ne plus demander" dans l'onglet Mon Équipe** :
  - Ajout d'une case à cocher et du badge `🔕 Ne plus demander` sur chaque carte de capacité apprenable.
  - Liaison automatique avec le Mode Avancé : si une capacité remplace automatiquement une autre, la case est cochée d'office, grisée (`disabled`) avec le badge `🔄 Remplacement auto` et un tooltip explicatif dédié.
- **Paramètre de Désactivation des Toasts de Remplacement** :
  - Nouveau réglage dans l'onglet Paramètres (`promptAutoReplacement`) permettant de désactiver les invites demandant d'enregistrer les remplacements manuels détectés.
- **Base Pokédex Complète en Français (Générations 1 à 9)** :
  - Intégration des 1025 espèces Pokémon avec leurs noms officiels français, gestion des formes régionales et méga-évolutions.

### 🛡️ Correctifs Critiques & Améliorations de Stabilité
- **Résolution du Blocage lors de l'Apprentissage Manuel (`LearnMovePhase`)** :
  - Correction de l'interception de `learnMove` sur les instances de phase pour transmettre fidèlement tous les arguments, éliminant le gel du jeu sur l'écran *"Quelle capacité doit être oubliée ?"*.
- **Réactivation du Clavier & Refocalisation du Canvas** :
  - Amélioration de `enableGameKeyboard()` pour réactiver les entrées sur toutes les scènes actives de Phaser (`game.scene.scenes`) et refocaliser automatiquement le canvas du jeu.
  - Réactivation immédiate des contrôles à la fermeture du Quick Prompt.
- **Formatage Épuré des Toasts d'Action** :
  - Le toast de confirmation de remplacement tient désormais sur une seule ligne élégante et compacte.

---

## [v1.12.1] - 2026-10-01

### 🎨 Améliorations de l'Interface & Correctifs d'Affichage
- **Gestion Dédiée des Capacités Œuf** :
  - Ajout d'un badge distinctif ambré `🥚 Capacité Œuf` dans l'onglet Équipe pour les capacités issues des œufs.
  - Ces capacités ne peuvent plus être cochées/décochées par erreur (le jeu ne propose jamais de les apprendre par montée de niveau).
  - Info-bulle explicative précisant que ces attaques sont obtenues au départ.
- **Positionnement et Alignement des Cartes de Capacités** :
  - Ancrage fixe de la zone d'action (badge d'état `✓ Gardée` / `✕ Ignorée` et case à cocher) dans le coin supérieur droit de chaque carte.
  - Suppression définitive des chevauchements de texte avec les statistiques d'attaque (Puissance, Précision, PP).
- **Ajustement de la Configuration par Défaut** :
  - Désactivation par défaut du Mode Avancé (`advancedMode: false`) pour une expérience utilisateur initiale simplifiée et épurée.

---

## [v1.12.0] - 2026-09-30

### 🔄 Automatisation Robuste des Remplacements & Résolution Intelligente des Capacités
- **Résolution Hybride ID / Nom Normalisé** :
  - Détection automatique et mise en cache des identifiants numériques de capacités (`moveId`) lors de la création de règles de remplacement.
  - Normalisation insensible à la casse, aux espaces et aux accents pour la comparaison de noms de capacités.
  - Recherche bidirectionnelle dans le moveset actuel du Pokémon via `LineageManager.findMoveIdByName`, `PokeSkip.knownMovesCache` et les accesseurs PokéRogue (`getMoveset()`, `getName()`, `getMove()`).
- **Exécution Sécurisée du Remplacement en Combat** :
  - Support multi-version pour l'apprentissage automatique : exécution via `phase.learnMove()`, `pokemon.setMove()` ou `pokemon.learnMove()` avec gestion d'erreurs et reprise sécurisée.
  - Clôture propre des phases sans blocage du flux de combat et sans perte des dialogues annexes (évolutions, passages de niveau).
  - Activation automatique transparente du Mode Avancé dès l'ajout d'une règle de remplacement.
- **Améliorations UI & Affichage des Toasts** :
  - Correction de l'appel `UI.showToast` dans l'onglet des espèces enregistrées.
  - Initialisation différée et sécurisée du conteneur de toasts si le DOM n'est pas encore prêt.
  - Nettoyage automatique des préfixes textuels redondants dans les notifications.
  - Rehaussement des `z-index` des overlays de notification et du prompt rapide (`10000004`+) pour garantir leur visibilité au-dessus de tous les éléments du jeu.
- **Interception & Débogage Globaux** :
  - Exposition des objets `window.PokeSkip` et `window.PokeSkipUI` facilitant les diagnostics et l'interopérabilité.

---

## [v1.11.0] - 2026-09-28

### 🏗️ Refonte Architecturale Majeure & Modularité Complète (`src/`)
- **Découpage du Monolithe de 10 000 Lignes** :
  - Décomposition intégrale du code en modules ES6 clairs et spécialisés dans le dossier `src/` (`constants/`, `data/`, `core/`, `game/`, `ui/`).
  - Isolation des dictionnaires de données volumineux (`families.js`, `branched-prevolutions.js`, `megas.js`, `species-names.js`) dégageant plus de 3 000 lignes du cœur de calcul.
  - Extraction de plus de 1 900 lignes de styles CSS dans un fichier dédié [src/ui/styles.css](file:///d:/esteb/Documents/%21dev/Antigravity/Pokeskip/src/ui/styles.css).
  - Découpage de l'interface en modules distincts pour chaque composant et onglet (`hud.js`, `modal.js`, `type-chart.js`, `hotkeys.js`, `team-tab.js`, `saved-species-tab.js`, `replacements-tab.js`, `settings-tab.js`).
- **Pipeline de Compilation Automatisé avec esbuild** :
  - Création de `build.js` générant simultanément [pokeskip.user.js](file:///d:/esteb/Documents/%21dev/Antigravity/Pokeskip/pokeskip.user.js) et [extension/inject.js](file:///d:/esteb/Documents/%21dev/Antigravity/Pokeskip/extension/inject.js) en moins de 50 ms.
  - Fin définitive de la duplication manuelle : une source de vérité unique garantissant la synchronisation parfaite des deux distributions.
  - Nouvelles commandes développeur ajoutées : `npm run build`, `npm run dev` (watch), `npm run lint` et `npm run build:zip`.
- **Zéro Régression & Parité Fonctionnelle Totale** :
  - Conservation intégrale de tous les comportements, règles enregistrées, isolation du clavier Phaser et fonctionnalités du jeu.

---

## [v1.10.2] - 2026-09-28

### ⌨️ Isolation Totale des Touches Clavier (Filtre, Listes Déroulantes & Saisie)
- **Suppression des Interactions Parasites avec PokéRogue** :
  - Résolution d'un problème majeur où la saisie de texte dans la barre de filtre (`Filtrer une attaque...`), la navigation dans les listes déroulantes de remplacement (`Toujours remplacer / Par la nouvelle`) ou le champ d'ajout manuel transmettait les frappes au jeu en arrière-plan (déclenchant involontairement des attaques, validations ou déplacements de curseur dans les menus de combat).
- **Isolation Multi-Couche des Événements Clavier (`stopPropagation`)** :
  - Blocage immédiat de la propagation (`keydown`, `keyup`, `keypress`) sur tous les champs de saisie, les listes déroulantes et l'ensemble du conteneur modal de l'équipe et de l'overlay de table des types.
  - La touche **Entrée** est interceptée avec `preventDefault()` pour valider l'action de l'interface PokéSkip sans déclencher d'attaque dans PokéRogue.
  - Les touches de déplacement (flèches haut/bas, gauche/droite, espace, effacement) fonctionnent normalement dans les champs de texte et les listes de suggestions natives (datalist) sans impacter le jeu.
- **Désactivation Intelligente du Clavier Phaser (`disableGameKeyboard` / `enableGameKeyboard`)** :
  - Le clavier Phaser du jeu est désactivé et l'état des touches est automatiquement réinitialisé (`resetKeys()`) à l'ouverture de la modal ou lors de la prise de focus sur un champ de texte.
  - Le clavier de PokéRogue est réactivé proprement à la fermeture de la fenêtre ou à la perte de focus.
- **Fermeture Sécurisée via la Touche Échap** :
  - L'appui sur Échap depuis la modal ou un champ de saisie ferme PokéSkip sans ouvrir le menu de paramètres/pause de PokéRogue.

---

## [v1.10.1] - 2026-09-28

### 🛡️ Détection Stricte de l'Environnement PokéRogue & Zéro Faux Positif en Local
- **Filtrage Intelligent sur Localhost & 127.0.0.1** :
  - PokéSkip vérifie désormais activement la signature de la page avant d'injecter la moindre interface (titre contenant *PokéRogue*, conteneur `#app` ou canvas Phaser du jeu).
  - Si un développeur travaille sur un projet web local (React, Vue, Next.js, etc.), PokéSkip reste **100% silencieux** : aucune pastille flottante, aucun style injecté et aucune capture de raccourci clavier (`P`, `T`, `Échap`).
  - Détection préservée pour les instances locales de PokéRogue (dev du jeu ou version hors-ligne).
  - Exclusion explicite du simulateur de présentation intégré (`demo/index.html`) pour éviter toute superposition d'UI.
- **Sécurisation des Boucles de Scan** :
  - Arrêt automatique des tentatives d'accrochage (`initGameHook`) après ~48 secondes sur localhost en l'absence de Phaser pour économiser les ressources de la machine.

---

## [v1.10.0] - 2026-09-28

### 🥚 Intégration des Capacités Œuf (Egg Moves)
- **Support Complet de la Lignée Évolutive** :
  - Les capacités œuf (Egg Moves) sont désormais interrogées et intégrées pour toute la lignée dans la liste des capacités ("Mes Pokémon" / Équipe Actuelle).
  - Détection dynamique sur l'espèce de départ/racine, l'espèce actuelle et les évolutions via le `speciesDataRegistry` et les données d'espèces.
  - Attribution d'un badge distinctif ambré `🥚 Œuf` et tag de l'espèce source si apprise par un autre stade évolutif (ex: `🧬 Salamèche`).
  - Prise en charge dans le filtre de recherche rapide (taper `oeuf`, `œuf` ou `egg` filtre instantanément toutes les capacités œuf).
  - Intégration complète dans les listes déroulantes du **Mode Avancé** (*"Toujours remplacer :"* et *"Par la nouvelle :"*) avec préfixe `[🥚 Œuf]`.

### 🔔 Notifications Toasts & Invites Visuelles Épurées et Harmoniques
- **Toast d'Auto-Skip** :
  - Affiche uniquement le nom du Pokémon sous sa forme actuelle en bleu ciel (`#38bdf8`), sans encombrer avec toute la lignée.
  - Suppression de la mention superflue `(règle mémorisée)`.
  - Nom de la capacité coloré selon son type élémentaire avec icône de catégorie (💥 Physique, ✨ Spéciale, 🌀 Statut) et infobulle détaillée.
- **Bouton Toast d'Apprentissage Rapide (Quick Prompt)** :
  - Harmonisation de la typographie avec le reste de l'interface (`system-ui`).
  - Affichage simplifié du Pokémon actuel avec type et catégorie de l'attaque.
- **Toasts de Remplacement Automatique (Mode Avancé)** :
  - Style violet dédié (`advanced`), nom du Pokémon en bleu ciel et capacités formatées avec leurs types et emojis de catégorie.
  - Toast confirmant l'enregistrement d'une règle de remplacement harmonisé avec le même design élégant.
- **Durée des Notifications Paramétrable** :
  - Ajout d'un curseur de réglage dans les Paramètres pour ajuster la durée d'affichage des toasts de 1 à 15 secondes (valeur par défaut : 2,8s).

---

## [v1.9.0] - 2026-09-26

### ⚔️ Refonte Complète du Modal Forces & Faiblesses (Tableau des Types)

- **Navigation & Changement d'Onglet Fluide (Zero Clignotement)** :
  - Le passage d'un mode à l'autre ne remplace plus l'intégralité du modal ni de l'écran : le cadre et l'en-tête restent parfaitement stables et immobiles.
  - Seul le contenu intérieur effectue une transition douce et moderne (`pks-tab-fade`).
  - Les onglets ont été renommés avec clarté : **`⚡ Simplifié`** (anciennement *Synthèse Tactique*) et **`📊 Complet`** (anciennement *Matrice 18×18*).

- **Mode `⚡ Simplifié` : Épuré, 100% Lisible sans Défilement** :
  - **Suppression Totale de la Carte de Combat** : Retrait du bloc d'analyse multi-types (×4, ×2, ×0.5...) pour un affichage direct et immédiat des 18 types.
  - **Suppression Complète des Filtres** : Disparition de la barre de boutons de filtrage pour une interface légère et épurée.
  - **Aucun Défilement Vertical** : Hauteur précisément calibrée pour afficher les 18 types d'un seul coup d'œil sans barre de scroll (`overflow: hidden`).
  - **Suppression des Effets de Survol Intrusifs** : Retrait de toute surbrillance et zoom de pastilles au survol de la souris.
  - **Interrupteur (Toggle Switch) des Immunités (`🛡️ Immunités (×0)`)** : Ajout d'un commutateur stylisé et réactif dans l'en-tête de la colonne des faiblesses pour afficher ou masquer instantanément les immunités avec sauvegarde automatique des préférences.
  - **Bulle de Surbrillance Unifiée pour les Types Adverses Consécutifs** : Lorsque le Pokémon adverse possède deux types superposés (l'un au-dessus de l'autre dans la liste), ils sont enveloppés dans **une seule et même bulle continue**, supprimant tout effet de bordures collées ou coupées.

- **Mode `📊 Complet` (Matrice 18×18) : Focus & Propreté Visuelle** :
  - **Suppression des Effets Parasites** : Retrait du survol agressif des cases individuelles, du survol de colonnes et du pavé de résumé en bas.
  - **Surbrillance Sobre au Survol** : Seule la ligne survolée (`tr:hover`) bénéficie d'un éclaircissement subtil et d'un liseré élégant pour faciliter la lecture.
  - **Bulle Continue sur les Colonnes des Types Adverses** : Le ou les types de l'adversaire sont entourés d'une bulle néon prenant toute la hauteur de la colonne (de l'en-tête jusqu'au bas du tableau).
  - **Fusion des Colonnes Adjacentes** : Si les deux types adverses sont côte à côte, une **bulle unique et continue** englobe les deux colonnes ensemble.

---

## [v1.8.0] - 2026-09-25

### 🧬 Capacités à Venir de la Lignée Évolutive Complète ("Mes Pokémon" & Équipe Actuelle)

- **Vision Globale de la Lignée** :
  - Dans la section **Mes Pokémon** (Équipe Actuelle), les attaques affichées ne se limitent plus à l'espèce courante : elles regroupent désormais **toutes les capacités à venir de sa lignée évolutive** (ex : un Salamèche affiche également les capacités exclusives de Reptincel et Dracaufeu, un Évoli affiche les capacités des 8 évolutions).
  - Résout le problème où les capacités clés acquises uniquement lors d'une évolution ultérieure (ex : Cru-Ailes ou Lame d'Air pour Dracaufeu, Hydrocanon pour Aquali, etc.) ne pouvaient pas être pré-configurées dans la règle de lignée.
- **Badges d'Espèce Évolutive Dédiés (`🧬 Nom`)** :
  - Chaque capacité issue d'une évolution porte un badge violet stylisé `🧬 <Espèce>` (ex : `🧬 Reptincel`, `🧬 Dracaufeu`) pour distinguer instantanément à quel stade de l'évolution l'attaque devient disponible.
  - Les attaques apprenables par l'espèce courante conservent leur affichage direct sans surcharge visuelle.
- **Tri Chronologique & Harmonieux par Niveau** :
  - Les attaques sont ordonnées logiquement :
    1. Attaques actuellement équipées (`Actuelle`)
    2. Attaques de base (`Départ`)
    3. Attaques apprises à l'évolution (`Évolution`)
    4. Progression par niveau croissant (Niv. 1 à Niv. 100)
  - En cas d'attaque apprise à la fois par l'espèce de base et une évolution, l'obtention la plus précoce par l'espèce courante prime sans doublon.
- **Filtre Instantané par Nom & Espèce** :
  - Le champ de recherche en direct permet désormais de filtrer aussi bien par nom de capacité (ex : *"Flamme"*, *"Cru"*) que par nom d'évolution dans la lignée (ex : taper *"Dracaufeu"* affiche directement toutes les capacités spécifiques à Dracaufeu).
- **Intégration au Mode Avancé (Remplacements Automatiques)** :
  - Les capacités à venir de toute la lignée sont désormais également répertoriées dans les listes déroulantes du **Mode Avancé**, permettant de planifier à l'avance les remplacements d'anciennes attaques par de futures capacités d'évolution.

### ⚔️ Raccourci Touche `T` : Mode Bascule (Toggle) & Interaction Souris Complète

- **Passage en Bascule Persistante (`Toggle`)** :
  - La touche **`T`** fonctionne désormais en mode bascule (on/off), exactement comme la touche **`P`** pour la fenêtre principale.
  - Plus besoin de garder physiquement la touche enfoncée : un simple appui ouvre le tableau et le laisse ouvert.
  - Vos mains restent totalement libres pour utiliser la souris sans aucune contrainte : cliquer sur les boutons de mode (`⚡ Simplifié` / `📊 Tableau 18×18`), survoler les types et les cellules pour lire les infobulles, scroller, etc.
  - Un nouvel appui sur `T`, sur `Échap`, un clic sur la croix `✕` ou un clic sur l'arrière-plan referme instantanément le tableau.
- **Suppression du Conflit de Maintien / Relâchement (`keyup`)** :
  - La fermeture forcée lors du relâchement de la touche a été supprimée, éliminant la disparition brutale du tableau dès qu'on déplaçait la main vers la souris.
- **Fluidité & Ergonomie Souris Améliorées** :
  - Activation du défilement vertical (`overflow-y: auto`) sur la vue synthétique.
  - Ajout d'un survol visuel blanc (`outline`) sur chaque cellule du tableau 18×18 pour repérer immédiatement la position du curseur de la souris.
  - Mise à jour du texte d'aide du pied de page : `<kbd>T</kbd> ou <kbd>Échap</kbd> Fermer`.

### 🎈 Bulle Flottante HUD : Maintien dans la Fenêtre & Positionnement Relatif Responsive

- **Positionnement Proportionnel aux Dimensions de l'Écran (`ratioX` / `ratioY`)** :
  - La position de la bulle flottante est désormais enregistrée sous forme de ratios relatifs par rapport à l'espace utile de la fenêtre.
  - Si vous placez la bulle à droite ou à une certaine hauteur, elle **conserve exactement sa position proportionnelle** lorsque vous redimensionnez ou déplacez la fenêtre du navigateur.
- **Garantie Anti-Perte lors du Redimensionnement (`window.resize`)** :
  - Branchement d'un recalcul automatique de la position lors de chaque événement de redimensionnement de la fenêtre.
  - La bulle est automatiquement maintenue et bridée avec une marge de sécurité de 10 px par rapport aux 4 bords de l'écran : elle ne peut plus jamais sortir du cadre ni devenir inaccessible lors d'un passage en petit écran, d'un basculement en mode fenêtré ou de l'ouverture des outils de développement.
- **Rétrocompatibilité Totale** :
  - Les anciennes coordonnées absolues en pixels stockées localement sont automatiquement converties en ratios relatifs et bridées dans le champ visible dès le premier affichage.

---

## [v1.7.0] - 2026-09-24

### ⚔️ Table des Types Rapide (Mode Simplifié & Tableau 18 × 18) avec Détection Adversaire

- **Accès Éclair Peek & Toggle** :
  - **Touche `T` (Peek)** : Maintenir la touche `T` enfoncée affiche instantanément la table des types en surimpression transparente ; la relâcher masque immédiatement le tableau.
  - **Bouton `⚔️` Déporté sur le HUD** : Le bouton d'accès au tableau des types est désormais placé juste à droite de la pastille flottante sous forme de bouton circulaire dédié avec uniquement l'icône `⚔️`. Cela évite tout clic malencontreux entre la gestion des attaques (sur la pastille) et l'ouverture du tableau des types.
  - **Mémorisation persistante de la vue active** : Le mode choisi (Simplifié ou Complet) est mémorisé automatiquement dans le stockage local. Chaque appui/maintien sur `T` rouvre fidèlement la vue dans l'état où elle a été laissée.
  - Fermeture possible également via la touche `Échap`, la croix `✕` ou un clic en dehors de la fenêtre.
  - Aucun déclenchement parasite lors de la saisie dans un champ texte.
- **Bouton Switch de Mode d'Affichage** :
  - Un sélecteur à deux boutons dans l'en-tête permet d'alterner instantanément entre :
    - `⚡ Mode Simplifié` (vue synthétique rapide)
    - `📊 Tableau 18×18` (matrice complète détaillée)
- **Mode Simplifié (Vue Référence Unique en 1 Colonne)** :
  - **Pastilles 3D Homogènes & Identiques (58 × 20 px)** : Toutes les pastilles (faiblesses, type central et forces) possèdent strictement la même taille et le même rendu visuel fidèle aux cartouches officielles de jeux Pokémon (biseautage 3D en relief avec reflet supérieur et ombre inférieure, liseré sombre et typographie blanche détourée de noir).
  - **Harmonisation de Hauteur & Espacement Aéré (550 px)** : Le conteneur du mode simplifié adopte exactement la même hauteur verticale que la matrice complète (`550 px`) et le même cadre stylisé. Les 18 lignes bénéficient d'un espacement vertical confortable (`gap: 4 px`), offrant une aération optimale sans aucun soubresaut lors du passage d'un mode à l'autre.
  - **Alignement Rigoureux en Colonne Centrale** : Les 18 types sont empilés verticalement, avec la colonne des types principaux et les flèches `➔` parfaitement alignées sur des axes verticaux fixes.
  - **Flux Directionnel Clair** :
    - À gauche : les types super efficaces contre lui (faiblesses reçues) progressent vers la flèche centrale.
    - Au centre : le type principal mis en valeur.
    - À droite : les types contre lesquels il est super efficace (forces infligées) démarrent de la flèche centrale.
  - Surlignage automatique de la ligne du Pokémon adverse actif avec contour cyan lumineux `🎯`.
- **Mode Complet : Matrice 18 × 18 (Générations 6 à 9)** :
  - **Couleurs 100% fidèles aux pastilles de jeu** : Utilisation de la palette officielle canonique des types Pokémon (Feu `#EE8130`, Eau `#6390F0`, Plante `#7AC74C`, Vol `#A98FF3`, Normal `#A8A77A`, etc.), garantissant une cohérence visuelle parfaite entre les pastilles des lignes d'attaques et les en-têtes du tableau sans aucune altération de luminosité.
  - **Pastilles d'En-têtes en Style Cartouche 3D** : Déploiement du style authentique des pastilles 3D (biseautage en relief, reflets d'ombre et de lumière, liseré sombre et texte blanc détouré de noir) sur les en-têtes de lignes et de colonnes de la matrice complète, offrant une lisibilité parfaite y compris sur les types clairs (Sol, Acier, Glace, Électrik).
  - **Pastilles d'En-têtes Homogènes & Non Écrasées (66 × 24 px)** : Les pastilles de colonnes (`Défenseurs`) possèdent désormais rigoureusement la même taille que celles des lignes (`Attaquants`) avec une longueur complète de `66 px`, supprimant tout aspect écrasé pour les noms longs (`TÉNÈBRES`, `ÉLECTRIK`, `NORMAL`). La case d'angle `Déf. / Att.` forme un carré parfait de `66 × 66 px`.
  - **Centrage Parfait des Noms & Dégagement du Viseur `🎯`** : Typographie alignée à `9 px` sur toutes les pastilles avec un décalage de respiration sous le marqueur `🎯` en cas de cible adverse surlignée.
  - **Mise à l'Échelle Dynamique & Responsive (1080p, 1440p, 4K)** : Le tableau et la vue simplifiée adaptent automatiquement leur échelle (`zoom` vectoriel natif) selon les dimensions de l'écran en temps réel. Fini l'effet "minuscule" sur les grands écrans (1440p / 4K / ultrawide) ou le débordement sur les petits écrans : la fenêtre occupe naturellement ~84 à 88% de la hauteur de l'écran, toujours parfaitement centrée et nette au pixel près.
  - **Extension Vers le Bas & Coussin de Respiration (550 px)** : Le conteneur s'étend confortablement vers le bas de l'écran avec une marge inférieure de `14 px`, assurant que la ligne inférieure (`FÉE`) ne soit plus jamais rognée ou collée contre le pied de page.
  - **Contraste Éclatant des Multiplicateurs** :
    - `2` (Vert Émeraude Vibrant) : Dégradé vert soutenu, texte blanc gras 900 détouré avec relief (`linear-gradient(180deg, #22c55e 0%, #15803d 100%)`).
    - `½` (Rouge Vif Éclatant) : Dégradé carmin puissant, texte blanc net et lisible (`linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)`).
    - `0` (Noir Profond & Argent) : Fond noir profond avec liseré contrasté et chiffre 0 blanc/argenté éclatant.
    - `—` (Gris Neutre) : Teinte discrète pour laisser ressortir les multiplicateurs clés au premier coup d'œil.
  - **Zébrures alternées & Survol** : Alternance visuelle subtile entre les lignes paires et impaires et mise en surbrillance au survol de la souris.
- **Prise en Charge Intelligente des Combats Doubles & Multi-Cibles** :
  - **Détection Exhaustive des Ennemis Actifs** : PokéSkip inspecte désormais simultanément toutes les sources du terrain (`getEnemyField()`, `enemySide.pokemon/active`, `getEnemyPokemon(0/1)`, `currentBattle`) pour identifier l'ensemble des Pokémon adverses actuellement en vie sur le champ de bataille.
  - **Affichage Multi-Cibles dans l'En-tête** : En combat double, l'en-tête affiche distinctement chaque Pokémon adverse avec son nom et ses pastilles de types respectives (ex : `🎯 Cibles : Léviator [Eau] [Vol] • Ronflex [Normal]`).
  - **Surlignage Cumulé (2, 3 ou 4 types)** :
    - En **mode tableau**, toutes les colonnes de défense correspondant aux types des deux adversaires sont simultanément surlignées en cyan avec le marqueur `🎯`.
    - En **mode simplifié**, toutes les lignes correspondant aux types des deux adversaires sont simultanément encadrées et mises en valeur.
  - Respect strict des consignes : aucun calcul intrusif sur le Pokémon du joueur et aucune grille de pastilles encombrante.
- **Pastille Flottante (HUD) Ultra-Compacte avec Pokéball Dynamique** :
  - **Indication d'état ON / OFF intégrée à la Pokéball** : Suppression du badge texte encombrant (`● ON` / `○ OFF`) pour un gain de place immédiat de plus de 35% sur l'écran.
  - **État ON (Actif)** : Pokéball aux couleurs vives cyan/bleu avec bouton central LED émeraude pulsant (`#34d399`) et halo lumineux bleu.
  - **État OFF (En pause)** : Pokéball en veille/dormante en niveaux de gris atténués (`grayscale(1) opacity(0.42)`) avec bouton sombre inactif (`#475569`).
  - Infobulle explicite au survol rappelant le statut et les raccourcis.

---

## [v1.6.0] - 2026-09-23

### ⚡ Mode Avancé : Remplacement Automatique de Capacités

- **Moteur de Remplacement In-Game Automatisé** :
  - Permet de remplacer automatiquement une ancienne capacité par une nouvelle dès son déblocage lors d'une montée de niveau.
  - S'active uniquement lorsque le Pokémon possède déjà ses 4 capacités et que la nouvelle capacité **n'est pas ignorée** par PokéSkip.
  - Apprentissage direct dans le slot de combat sans dialogue de confirmation intempestif, garantissant un flow de jeu 100% fluide.
- **Contrôle & Confidentialité (Interrupteur Dédié)** :
  - Le Mode Avancé est **désactivé par défaut** et caché derrière un interrupteur dans l'onglet **Options & Sauvegarde**.
  - Sa désactivation suspend immédiatement la fonctionnalité en jeu et masque les formulaires de remplacement, tout en **conservant précieusement en mémoire toutes les règles configurées** en cas de réactivation.
- **Gestion Flexible des Règles par Lignée** :
  - Création de règles intuitives suivant la logique : *Toujours remplacer [Ancienne Attaque A] ➔ par ➔ [Nouvelle Attaque B]*.
  - Suggestions intelligentes avec listes déroulantes **triées chronologiquement par niveau d'obtention** avec affichage explicite des niveaux (`[Niv. X]`, `[Départ]`, `[Évolution]`, `(Actuelle)`).
  - Activation ou désactivation individuelle d'une règle (bouton toggle ON/OFF).
  - Suppression d'une règle individuelle (icône 🗑️) ou suppression groupée de toutes les règles de la lignée.

### 🧬 Prise en charge Complète des Méga-Évolutions

- **Intitulés enrichis des 46 familles Méga** :
  - Mention explicite dans les noms de lignées : `Bulbizarre → Herbizarre → Florizarre (Méga)`, `Salamèche → Reptincel → Dracaufeu (Méga X / Y)`, `Mewtwo (Méga X / Y)`, etc.
- **Détection in-game des formes actives** :
  - Affichage d'un badge violet lumineux `🧬 MÉGA` sur le Pokémon en combat ou dans l'équipe.
  - Récupération dynamique et affichage du sprite pixel-art officiel de la forme Méga (avec gestion des formes X/Y et du caractère Chromatique / Shiny ✨).

### 📚 Éditeur Visuel d'Espèces Mémorisées

- **Sprites pixel-art dans l'onglet Espèces** :
  - Rendu miniature officiel pour chaque lignée mémorisée.
- **Édition directe sans avoir le Pokémon en équipe** :
  - En cliquant sur une espèce ou sur `✏️ Modifier`, ouverture d'un écran dédié permettant de réactiver une capacité ignorée, d'ajouter manuellement une attaque à ignorer, ou de gérer les règles de remplacement du Mode Avancé.
  - Bouton d'accès direct `👥 Voir dans l'Équipe Actuelle` si un membre de la lignée fait partie du groupe actif.

### ⚙️ Options d'Affichage HUD

- **Masquage du compteur sur la pastille** :
  - Nouvelle option permettant de cacher le libellé `X passée(s)` de la pastille flottante pour une discrétion maximale en jeu, tout en continuant à incrémenter les statistiques de run et globales en arrière-plan.

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
