# 📜 Journal des Modifications (Changelog & Patch Notes)

Toutes les modifications notables apportées à PokéSkip sont consignées dans ce document.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

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
