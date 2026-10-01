---
trigger: always_on
---

# Directives & Contraintes de déploiement Mozilla Add-ons (Firefox AMO)

L'extension PokéSkip est publiée sur le store officiel Firefox (Mozilla Add-ons / AMO).
Toute modification apportée au projet doit obligatoirement respecter les règles suivantes :

## 1. Compatibilité Manifest & Sécurité AMO
- **Identifiant Gecko** : Conserver `browser_specific_settings.gecko.id` (`pokeskip@estelar9`) dans `extension/manifest.json`.
- **Déclaration de collecte de données** : Le manifeste doit impérativement conserver `"data_collection_permissions": { "required": ["none"] }` sous peine d'échec de validation AMO.
- **Permissions minimales** : Ne jamais ajouter de permissions globales ou inutiles. Seules `storage` et l'hôte `*://*.pokerogue.net/*` sont autorisées.
- **API Navigateur** : Toujours supporter l'API WebExtensions Firefox avec fallback Chrome :
  `const api = (typeof browser !== 'undefined' && browser.runtime) ? browser : chrome;`
- **Sécurité du code & innerHTML** :
  - Proscrire `eval()` ou le chargement de code distant non vérifiable.
  - Privilégier `textContent`, `document.createElement()` ou des méthodes sécurisées plutôt que des assignations directes à `innerHTML` avec du contenu dynamique, pour éviter les avertissements et rejets de l'équipe de revue Mozilla.

## 2. Emballage du Code Source (Source Code Archive)
- Pour toute soumission ou mise à jour nécessitant le code source :
  - **Ne pas utiliser `Compress-Archive` natif Windows directement** car il génère des antislashs `\` (`src\index.js`), ce qui fait échouer la validation AMO Linux.
  - Toujours utiliser le script `pwsh -File ./scripts/pack-source.ps1` qui garantit des séparateurs `/` conformes UNIX.
  - Les instructions de build à fournir à Mozilla restent : `npm ci && npm run build`.

## 3. Gestion des Versions & Déploiement Automatisé
- Synchroniser le numéro de version dans :
  - `package.json`
  - `extension/manifest.json`
  - `README.md`
  - `CHANGELOG.md`
- Les releases et mises à jour sur AMO sont gérées automatiquement par le workflow GitHub Actions `.github/workflows/release.yml` lors du push d'un tag `v*.*.*`.
