import { families } from '../data/families.js';
import { branchedPrevolutions } from '../data/branched-prevolutions.js';
import { megaFamilies } from '../data/megas.js';
import { staticSpeciesNames } from '../data/species-names.js';
import { AssetLoader } from './asset-loader.js';
import { PokeSkip } from './state.js';
import { POKEMON_TYPES, MOVE_CATEGORIES } from '../constants/types.js';
import { t, isFrench, isEnglish } from './i18n.js';

export const LineageManager = {
  families,
  branchedPrevolutions,
  megaFamilies,
  staticSpeciesNames,
  speciesNames: {},
  memberToRoot: {},
    init() {
      // 1. Charger tous les 1025 noms d'espèces officiels en français
      if (this.staticSpeciesNames) {
        for (const [idStr, name] of Object.entries(this.staticSpeciesNames)) {
          this.speciesNames[Number(idStr)] = name;
        }
      }

      // 2. Traiter les familles pour construire memberToRoot et compléter les espèces régionales (> 1025)
      for (const [rStr, fam] of Object.entries(this.families)) {
        const root = (fam.members && fam.members.length > 0) ? fam.members[0] : Number(rStr);
        this.memberToRoot[root] = root;
        if (fam.members) {
          for (const m of fam.members) {
            this.memberToRoot[m] = root;
          }
          if (fam.name) {
            const rawNames = fam.name.replace(/\(Méga.*?\)/g, '').split(/[→/]/).map(s => s.trim()).filter(Boolean);
            if (rawNames.length === fam.members.length) {
              fam.members.forEach((m, i) => {
                if (!this.speciesNames[m]) {
                  this.speciesNames[m] = rawNames[i];
                }
              });
            } else if (fam.members.length === 1 && rawNames.length > 1) {
              if (!this.speciesNames[fam.members[0]]) {
                this.speciesNames[fam.members[0]] = rawNames[rawNames.length - 1];
              }
            }
          }
          // Enrichir l'intitulé avec la mention Méga si un membre est concerné
          for (const m of fam.members) {
            if (this.megaFamilies[m] && !fam.name.includes('(Méga')) {
              fam.name += ` ${this.megaFamilies[m].suffix}`;
              break;
            }
          }
        }
      }
    },
    getSpeciesName(speciesId, formIndex = 0, pokemon = null) {
      if (!speciesId) return '';
      const sid = Number(speciesId);
      if (isNaN(sid)) return '';

      // Méga vérification
      const isMega = pokemon ? this.isPokemonMega(pokemon) : false;

      // En mode anglais, tenter d'abord d'obtenir le nom en anglais depuis le jeu ou pokemon
      if (isEnglish()) {
        try {
          if (pokemon?.species && typeof pokemon.species.getName === 'function') {
            const loc = pokemon.species.getName(formIndex);
            if (loc && typeof loc === 'string' && loc.trim()) {
              return isMega && !loc.toLowerCase().includes('mega') ? `Mega ${loc.trim()}` : loc.trim();
            }
          }
          if (pokemon?.species?.name) {
            const n = pokemon.species.name;
            return isMega && !n.toLowerCase().includes('mega') ? `Mega ${n}` : n;
          }
          const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
          const scene = PokeSkip.scene || win.globalScene;
          const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry
                      || (scene && scene.speciesDataRegistry)
                      || (scene && scene.gameData && scene.gameData.speciesDataRegistry);
          if (sdr) {
            const sp = sdr.data ? sdr.data[sid] : (typeof sdr.get === 'function' ? sdr.get(sid) : null);
            if (sp) {
              const n = typeof sp.getName === 'function' ? sp.getName(formIndex) : (sp.name || sp.speciesName);
              if (n && typeof n === 'string' && n.trim()) {
                return isMega && !n.toLowerCase().includes('mega') ? `Mega ${n.trim()}` : n.trim();
              }
            }
          }
        } catch (_) {}
      }

      // 1. Formes régionales par tranches d'ID PokéRogue (2000+, 4000+, 6000+, 8000+)
      if (this.speciesNames[sid] && isFrench()) {
        let n = this.speciesNames[sid];
        if (isMega && !n.toLowerCase().includes('méga') && !n.toLowerCase().includes('mega')) {
          n = `Méga-${n}`;
        }
        return n;
      }
      if (sid >= 8000 && sid < 10000) {
        const base = this.getSpeciesName(sid - 8000, 0, pokemon);
        if (base) return t('regional_paldea', { base });
      }
      if (sid >= 6000 && sid < 8000) {
        const base = this.getSpeciesName(sid - 6000, 0, pokemon);
        if (base) return t('regional_hisui', { base });
      }
      if (sid >= 4000 && sid < 6000) {
        const base = this.getSpeciesName(sid - 4000, 0, pokemon);
        if (base) return t('regional_galar', { base });
      }
      if (sid >= 2000 && sid < 4000) {
        const base = this.getSpeciesName(sid - 2000, 0, pokemon);
        if (base) return t('regional_alola', { base });
      }

      // 2. Formes régionales par formIndex (si sid < 1025 mais formIndex > 0)
      const fIdx = (formIndex !== undefined && formIndex !== null && formIndex > 0)
        ? Number(formIndex)
        : (pokemon?.formIndex ? Number(pokemon.formIndex) : 0);

      if (fIdx > 0 && sid > 0 && sid < 1025) {
        if (pokemon?.species && typeof pokemon.species.getName === 'function') {
          try {
            const locName = pokemon.species.getName(fIdx);
            if (locName && typeof locName === 'string' && locName.trim()) {
              return locName.trim();
            }
          } catch (_) {}
        }

        const base = (isFrench() ? (this.speciesNames[sid] || (this.staticSpeciesNames && this.staticSpeciesNames[sid])) : '')
                     || (pokemon?.species?.name)
                     || (this.staticSpeciesNames && this.staticSpeciesNames[sid])
                     || '';
        if (base) {
          const alolanIds = [19, 20, 26, 27, 28, 37, 38, 50, 51, 52, 53, 74, 75, 76, 88, 89, 103, 105];
          const galarianIds = [52, 77, 78, 79, 80, 83, 110, 122, 144, 145, 146, 199, 222, 263, 264, 554, 555, 562, 618];
          const hisuianIds = [58, 59, 100, 101, 157, 211, 215, 503, 549, 550, 570, 571, 628, 706, 713, 724];
          const paldeanIds = [128, 194];

          if (alolanIds.includes(sid) && fIdx === 1) return t('regional_alola', { base });
          if (galarianIds.includes(sid) && (fIdx === 1 || (sid === 52 && fIdx === 2))) return t('regional_galar', { base });
          if (hisuianIds.includes(sid) && fIdx === 1) return t('regional_hisui', { base });
          if (paldeanIds.includes(sid) && fIdx === 1) return t('regional_paldea', { base });
        }
      }

      // 3. Dictionnaire statique officiel (en français)
      if (isFrench() && this.staticSpeciesNames && this.staticSpeciesNames[sid]) {
        let n = this.staticSpeciesNames[sid];
        this.speciesNames[sid] = n;
        if (isMega && !n.toLowerCase().includes('méga') && !n.toLowerCase().includes('mega')) {
          n = `Méga-${n}`;
        }
        return n;
      }

      // 4. Interrogation dynamique du registre du jeu PokéRogue
      try {
        const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
        const scene = PokeSkip.scene || win.globalScene;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry
                    || (scene && scene.speciesDataRegistry)
                    || (scene && scene.gameData && scene.gameData.speciesDataRegistry);
        if (sdr) {
          const sp = sdr.data ? sdr.data[sid] : (typeof sdr.get === 'function' ? sdr.get(sid) : null);
          if (sp) {
            const n = typeof sp.getName === 'function' ? sp.getName(fIdx) : (sp.name || sp.speciesName);
            if (n && typeof n === 'string') {
              this.speciesNames[sid] = n;
              return n;
            }
          }
        }
      } catch (_) {}

      // 5. Vérifier les règles sauvegardées
      if (typeof PokeSkip !== 'undefined' && PokeSkip.rules && PokeSkip.rules[sid] && PokeSkip.rules[sid].lineageName) {
        const ln = PokeSkip.rules[sid].lineageName;
        if (ln && !ln.startsWith('Espèce #') && !ln.startsWith('Lignée #')) {
          this.speciesNames[sid] = ln;
          return ln;
        }
      }

      return '';
    },
    getParentSpeciesId(speciesId) {
      const idNum = Number(speciesId);
      if (!idNum) return null;
      if (this.branchedPrevolutions && this.branchedPrevolutions[idNum] !== undefined) {
        return this.branchedPrevolutions[idNum];
      }
      try {
        const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
        const scene = PokeSkip.scene || win.globalScene;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry
                    || (scene && scene.speciesDataRegistry)
                    || (scene && scene.gameData && scene.gameData.speciesDataRegistry);
        if (sdr && sdr.data && sdr.data[idNum] && sdr.data[idNum].prevolution !== undefined && sdr.data[idNum].prevolution !== null) {
          const prev = Number(sdr.data[idNum].prevolution);
          if (prev && prev > 0) return prev;
        }
      } catch (_) {}
      return null;
    },
    /**
     * Construit dynamiquement la chaîne d'évolution depuis le speciesDataRegistry du jeu.
     * Remonte via prevolution et descend via getEvolutions/evolutions.
     * Retourne un tableau ordonné [racine, stade2, stade3, ...] ou null si inaccessible.
     */
    _getRegistryLineage(speciesId, pokemon = null) {
      try {
        const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
        const scene = PokeSkip.scene || win.globalScene;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry
                    || (scene && scene.speciesDataRegistry)
                    || (scene && scene.gameData && scene.gameData.speciesDataRegistry);
        if (!sdr || !sdr.data) return null;

        const data = sdr.data;
        const idNum = Number(speciesId);
        if (!idNum || !data[idNum]) return null;

        // 1. Remonter jusqu'à la racine via getRootSpeciesId du pokemon ou prevolution
        let rootId = null;
        if (pokemon && typeof pokemon.species?.getRootSpeciesId === 'function') {
          try { rootId = Number(pokemon.species.getRootSpeciesId(false)); } catch (_) {}
        }
        if (!rootId || !data[rootId]) {
          rootId = idNum;
          const visited = new Set();
          while (data[rootId] && data[rootId].prevolution !== undefined && data[rootId].prevolution !== null) {
            if (visited.has(rootId)) break; // sécurité anti-boucle
            visited.add(rootId);
            rootId = Number(data[rootId].prevolution);
          }
        }

        // 2. Descendre récursivement via evolutions du registre
        const chain = [];
        const buildChain = (sid) => {
          if (chain.includes(sid)) return;
          chain.push(sid);
          let evos = [];
          if (typeof sdr.getEvolutions === 'function') {
            try { evos = sdr.getEvolutions(sid) || []; } catch (_) {}
          }
          if ((!evos || evos.length === 0) && data[sid] && Array.isArray(data[sid].evolutions)) {
            evos = data[sid].evolutions;
          }
          if (evos && evos.length > 0) {
            // Filtrer les méga-évolutions (evoFormKey contient "mega")
            const normalEvos = evos.filter(e => {
              if (e.evoFormKey) {
                const fk = String(e.evoFormKey).toLowerCase();
                if (fk.includes('mega') || fk.includes('méga') || fk.includes('gigantamax') || fk.includes('eternamax')) return false;
              }
              return true;
            });
            for (const evo of normalEvos) {
              const evoSid = Number(evo.speciesId ?? evo);
              if (evoSid && !chain.includes(evoSid) && data[evoSid]) {
                buildChain(evoSid);
              }
            }
          }
        };
        buildChain(rootId);

        if (chain.length > 0) {
          for (const sid of chain) {
            this.memberToRoot[sid] = rootId;
          }
          return chain;
        }
      } catch (e) {}
      return null;
    },
    getLineageMembers(pokemon) {
      const rootId = this.getRootId(pokemon);
      const currentId = Number(pokemon?.species?.speciesId ?? pokemon?.speciesId ?? rootId);

      // 1. Essayer d'abord le registre dynamique du jeu (source de vérité absolue)
      let allMembers = this._getRegistryLineage(currentId, pokemon);

      // 2. Fallback sur les families statiques
      if (!allMembers || allMembers.length === 0) {
        const fam = this.families[rootId];
        allMembers = (fam && Array.isArray(fam.members) && fam.members.length > 0) ? [...fam.members] : (rootId ? [rootId] : []);
      }

      // 3. Compléter avec getEvolutionLevels du Pokémon (évolutions contextuelles en combat)
      try {
        const sp = pokemon?.species || (typeof pokemon?.getSpeciesForm === 'function' ? pokemon.getSpeciesForm(true) : null);
        if (sp && typeof sp.getEvolutionLevels === 'function') {
          const evos = sp.getEvolutionLevels();
          if (Array.isArray(evos)) {
            for (const item of evos) {
              const sid = Array.isArray(item) ? item[0] : (item?.speciesId ?? item);
              if (sid && !allMembers.includes(sid)) {
                allMembers.push(sid);
              }
            }
          }
        }
      } catch (_) {}

      const futureEvoIds = [];
      const currentIdx = allMembers.indexOf(currentId);
      if (currentIdx !== -1) {
        for (let i = currentIdx + 1; i < allMembers.length; i++) {
          futureEvoIds.push(allMembers[i]);
        }
      } else {
        for (const sid of allMembers) {
          if (sid !== currentId) futureEvoIds.push(sid);
        }
      }

      const otherMemberIds = [];
      for (const sid of allMembers) {
        if (sid !== currentId && !futureEvoIds.includes(sid) && !otherMemberIds.includes(sid)) {
          otherMemberIds.push(sid);
        }
      }

      return {
        currentId,
        futureEvoIds,
        otherMemberIds,
        allMembers
      };
    },

    isPokemonMega(pokemon) {
      if (!pokemon) return false;
      const name = (pokemon.name || pokemon.species?.name || '').toLowerCase();
      if (name.includes('mega') || name.includes('méga')) return true;
      if (typeof pokemon.formeIndex === 'number' && pokemon.formeIndex > 0) return true;
      if (typeof pokemon.formIndex === 'number' && pokemon.formIndex > 0) return true;
      return false;
    },
    _spriteCache: {},
    _pendingVariantSwap: {},
    /**
     * Extraire le sprite d'un Pokémon depuis Phaser.
     * Pour les shiny variant 1/2, applique le palette swap si nécessaire.
     */
    extractPhaserSprite(pokemon) {
      if (!pokemon) return null;
      try {
        const scene = PokeSkip.scene || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.globalScene : window.globalScene);
        if (!scene || !scene.textures) return null;

        const speciesId = Number(pokemon?.species?.speciesId ?? pokemon?.speciesId);
        if (!speciesId || isNaN(speciesId)) return null;

        const isShiny = !!pokemon.shiny;
        let variant = 0;
        if (typeof pokemon.variant === 'number') variant = pokemon.variant;
        else if (typeof pokemon.shinyTier === 'number') variant = Math.max(0, pokemon.shinyTier - 1);

        const cacheKey = `pkm_${speciesId}_${isShiny ? 'shiny' : 'norm'}_v${variant}`;
        if (this._spriteCache && this._spriteCache[cacheKey]) {
          return this._spriteCache[cacheKey];
        }

        let textureKey = null;
        let frameName = null;

        // 1. Référence directe sur l'objet Pokémon s'il a un sprite Phaser attaché
        if (pokemon.sprite && pokemon.sprite.texture && pokemon.sprite.texture.key) {
          textureKey = pokemon.sprite.texture.key;
          if (pokemon.sprite.frame && pokemon.sprite.frame.name) {
            frameName = pokemon.sprite.frame.name;
          }
        } else if (typeof pokemon.getBattleSpriteKey === 'function') {
          try { textureKey = pokemon.getBattleSpriteKey(false); } catch (_) {}
        } else if (typeof pokemon.getSpriteKey === 'function') {
          try { textureKey = pokemon.getSpriteKey(); } catch (_) {}
        } else if (pokemon.spriteKey) {
          textureKey = pokemon.spriteKey;
        }

        // 2. Recherche parmi les textures chargées dans le TextureManager de Phaser
        if (!textureKey || !scene.textures.exists(textureKey)) {
          const allKeys = scene.textures.getTextureKeys();
          if (!allKeys || !allKeys.length) return null;

          const targetIdStr = String(speciesId);

          if (isShiny) {
            const variantSuffix = variant > 0 ? `_${variant + 1}` : '';
            const shinyCandidates = [
              `pkmn__shiny__${speciesId}${variantSuffix}`,
              `pkmn__shiny__${speciesId}`,
              `pokemon/shiny/${speciesId}${variantSuffix}`,
              `pokemon/shiny/${speciesId}`,
              `pokemon_shiny_${speciesId}`,
              `pkmn/shiny/${speciesId}`,
              `shiny/${speciesId}`
            ];
            for (const cand of shinyCandidates) {
              if (scene.textures.exists(cand)) {
                textureKey = cand;
                break;
              }
            }

            if (!textureKey) {
              textureKey = allKeys.find(k => {
                const lk = k.toLowerCase();
                if (!lk.includes('shiny')) return false;
                const parts = lk.split(/[/_.]/);
                return parts.includes(targetIdStr);
              });
            }
          }

          if (!textureKey) {
            const normalCandidates = [
              `pkmn__${speciesId}`,
              `pokemon/${speciesId}`,
              `pkmn/${speciesId}`,
              `pokemon_${speciesId}`,
              `${speciesId}`
            ];
            for (const cand of normalCandidates) {
              if (scene.textures.exists(cand)) {
                textureKey = cand;
                break;
              }
            }
          }

          if (!textureKey) {
            textureKey = allKeys.find(k => {
              const lk = k.toLowerCase();
              if (lk.includes('icon') || lk.includes('item') || lk.includes('ui') || lk.includes('bg')) return false;
              const parts = lk.split(/[/_.]/);
              return parts.includes(targetIdStr);
            });
          }
        }

        if (!textureKey || !scene.textures.exists(textureKey)) return null;

        const texture = scene.textures.get(textureKey);
        if (!texture || texture.key === '__MISSING') return null;

        let targetFrame = null;
        if (frameName && texture.has(frameName)) {
          targetFrame = texture.get(frameName);
        } else {
          const frameNames = texture.getFrameNames().filter(f => f !== '__BASE');
          if (frameNames.length > 0) {
            targetFrame = texture.get(frameNames[0]);
          } else {
            targetFrame = texture.get('__BASE');
          }
        }
        if (!targetFrame) return null;

        const sourceImage = targetFrame.source?.image;
        if (!sourceImage) return null;

        if (sourceImage instanceof HTMLImageElement && (!sourceImage.complete || sourceImage.naturalWidth === 0)) {
          return null;
        }

        const cutX = targetFrame.cutX !== undefined ? targetFrame.cutX : (targetFrame.x || 0);
        const cutY = targetFrame.cutY !== undefined ? targetFrame.cutY : (targetFrame.y || 0);
        const cutW = targetFrame.cutWidth || targetFrame.width;
        const cutH = targetFrame.cutHeight || targetFrame.height;

        if (!cutW || !cutH) return null;

        const canvas = document.createElement('canvas');
        canvas.width = cutW;
        canvas.height = cutH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(sourceImage, cutX, cutY, cutW, cutH, 0, 0, cutW, cutH);

        // Si la texture est déjà une variante dédiée, pas besoin de palette swap
        const hasVariantTexture = textureKey.endsWith(`_${variant + 1}`);

        // Pour les shiny variant > 0 sans texture dédiée, appliquer le palette swap
        if (isShiny && variant > 0 && !hasVariantTexture) {
          if (!this._pendingVariantSwap[cacheKey]) {
            this._pendingVariantSwap[cacheKey] = true;
            AssetLoader._fetchVariantData(speciesId).then(variantJson => {
              try {
                const colorMap = variantJson ? variantJson[String(variant)] : null;
                if (colorMap && typeof colorMap === 'object') {
                  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  AssetLoader._applyPaletteSwap(imgData, colorMap);
                  ctx.putImageData(imgData, 0, 0);
                }
                const swappedUrl = canvas.toDataURL('image/png');
                if (!this._spriteCache) this._spriteCache = {};
                this._spriteCache[cacheKey] = swappedUrl;
                AssetLoader._storeAndUpdateSprite(AssetLoader.getCacheKey(speciesId, true, variant), speciesId, true, variant, swappedUrl);
              } catch (e) {
                console.warn('[PokéSkip] Erreur palette swap Phaser:', e);
              } finally {
                delete this._pendingVariantSwap[cacheKey];
              }
            });
          }
          const tempUrl = canvas.toDataURL('image/png');
          return tempUrl;
        }

        const dataUrl = canvas.toDataURL('image/png');
        if (!this._spriteCache) this._spriteCache = {};
        this._spriteCache[cacheKey] = dataUrl;
        AssetLoader._storeAndUpdateSprite(AssetLoader.getCacheKey(speciesId, isShiny, variant), speciesId, isShiny, variant, dataUrl);
        return dataUrl;
      } catch (err) {
        return null;
      }
    },
    getPokemonSpriteUrl(pokemon, customSpeciesId = null) {
      let variant = 0;
      if (pokemon && pokemon.shiny) {
        if (typeof pokemon.variant === 'number') variant = pokemon.variant;
        else if (typeof pokemon.shinyTier === 'number') variant = Math.max(0, pokemon.shinyTier - 1);
      }

      const speciesId = customSpeciesId ?? (pokemon?.species?.speciesId ?? pokemon?.speciesId ?? this.getRootId(pokemon));
      const isShiny = pokemon ? !!pokemon.shiny : false;
      const isMega = pokemon ? this.isPokemonMega(pokemon) : false;

      let spriteId = speciesId;
      if (isMega && this.megaFamilies[speciesId]) {
        const name = (pokemon?.name || pokemon?.species?.name || '').toUpperCase();
        if (speciesId === 6) { // Dracaufeu
          spriteId = name.includes('Y') ? 10035 : 10034;
        } else if (speciesId === 150) { // Mewtwo
          spriteId = name.includes('Y') ? 10044 : 10043;
        } else {
          spriteId = this.megaFamilies[speciesId].defaultMegaSpriteId;
        }
      }

      // 1. Tenter d'abord le cache local (déjà découpé et swappé)
      const stored = AssetLoader.getStoredSprite(spriteId, isShiny, variant);
      if (stored) return stored;

      // 2. Tenter l'extraction directe depuis Phaser en mémoire
      const phaserSprite = this.extractPhaserSprite(pokemon);
      if (phaserSprite) return phaserSprite;

      // 3. Déclencher le chargement asynchrone en arrière-plan
      AssetLoader.loadSpriteInBackground(spriteId, isShiny, variant);

      // 4. Repli temporaire immédiat (remplacé dès chargement terminé)
      return isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${spriteId}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`;
    },
    getPokemonShinyInfo(pokemon) {
      if (!pokemon || !pokemon.shiny) {
        return { isShiny: false, tier: 0, stars: '', title: '', className: '' };
      }
      let tier = 1;
      if (typeof pokemon.shinyTier === 'number') {
        tier = Math.max(1, Math.min(3, pokemon.shinyTier));
      } else if (typeof pokemon.variant === 'number') {
        tier = Math.max(1, Math.min(3, pokemon.variant + 1));
      } else if (typeof pokemon.luck === 'number' && pokemon.luck >= 1) {
        tier = Math.min(3, pokemon.luck);
      }

      let stars = '✨';
      let title = 'Chromatique Commun (Tier 1 • +1 Chance)';
      if (tier === 2) {
        stars = '✨✨';
        title = 'Chromatique Rare (Tier 2 • +2 Chance)';
      } else if (tier === 3) {
        stars = '✨✨✨';
        title = 'Chromatique Épique (Tier 3 • +3 Chance)';
      }

      return {
        isShiny: true,
        tier,
        stars,
        title,
        className: `tier-${tier}`
      };
    },
    getRootId(target) {
      if (!target && target !== 0) return 0;
      if (typeof target === 'string' && target.startsWith('family_')) {
        target = target.replace('family_', '');
      }
      try {
        if (typeof target?.species?.getRootSpeciesId === 'function') {
          const r = target.species.getRootSpeciesId(false);
          if (r !== undefined && r !== null) return Number(r);
        }
        if (typeof target?.getRootSpeciesId === 'function') {
          const r = target.getRootSpeciesId(false);
          if (r !== undefined && r !== null) return Number(r);
        }
      } catch (e) {}
      const spId = Number(target?.species?.speciesId ?? target?.speciesId ?? target);
      if (!isNaN(spId) && spId > 0) {
        // Essayer aussi de remonter via le registre du jeu
        try {
          const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
          const scene = PokeSkip.scene || win.globalScene;
          const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry
                      || (scene && scene.speciesDataRegistry)
                      || (scene && scene.gameData && scene.gameData.speciesDataRegistry);
          if (sdr && sdr.data && sdr.data[spId]) {
            let rId = spId;
            const visited = new Set();
            while (sdr.data[rId] && sdr.data[rId].prevolution !== undefined && sdr.data[rId].prevolution !== null) {
              if (visited.has(rId)) break;
              visited.add(rId);
              rId = Number(sdr.data[rId].prevolution);
            }
            if (rId && rId > 0) {
              this.memberToRoot[spId] = rId;
              return rId;
            }
          }
        } catch (_) {}
        if (this.memberToRoot[spId]) return this.memberToRoot[spId];
        return spId;
      }
      return 0;
    },
    getFamilyKey(target) {
      const rootId = this.getRootId(target);
      return 'family_' + rootId;
    },
    getFamilyInfo(target, fallbackName) {
      const rootId = this.getRootId(target);
      const familyKey = 'family_' + rootId;
      let lineageName = '';
      if (this.families[rootId]) {
        lineageName = this.families[rootId].name;
      } else {
        const resolvedName = this.getSpeciesName(rootId);
        if (resolvedName) {
          lineageName = resolvedName;
          if (this.megaFamilies[rootId] && !lineageName.includes('(Méga')) {
            lineageName += ` ${this.megaFamilies[rootId].suffix}`;
          }
        } else {
          const directName = target?.species?.name || target?.name || fallbackName || ('Espèce #' + rootId);
          lineageName = directName;
        }
      }
      return { rootId, familyKey, lineageName };
    },
    getPokemonDisplayName(pokemon) {
      if (!pokemon) return 'Pokémon';

      // 1. Surnom personnalisé donné par le joueur en jeu
      if (pokemon.nickname && typeof pokemon.nickname === 'string' && pokemon.nickname.trim()) {
        return pokemon.nickname.trim();
      }

      // 2. Détection de la langue de jeu
      const isFr = isFrench();
      const sid = Number(pokemon?.species?.speciesId ?? pokemon?.speciesId ?? pokemon?.id);
      const isMega = this.isPokemonMega(pokemon);

      // 3. En français : résolution prioritaire via notre dictionnaire complet et officiel
      if (isFr && sid && !isNaN(sid)) {
        let frName = this.getSpeciesName(sid, pokemon.formIndex, pokemon);
        if (frName) {
          if (isMega && !frName.toLowerCase().includes('méga') && !frName.toLowerCase().includes('mega')) {
            frName = `Méga-${frName}`;
          }
          return frName;
        }
      }

      // 4. Si anglais ou autre langue sélectionnée :
      if (typeof pokemon.getName === 'function') {
        try {
          const n = pokemon.getName();
          if (n && typeof n === 'string' && n.trim()) {
            return n.trim();
          }
        } catch (_) {}
      }

      if (pokemon?.species?.name) {
        const n = pokemon.species.name;
        return isMega && !n.toLowerCase().includes('mega') ? `Mega ${n}` : n;
      }

      if (pokemon.species && typeof pokemon.species.getName === 'function') {
        try {
          const n = pokemon.species.getName(pokemon.formIndex);
          if (n && typeof n === 'string' && n.trim()) {
            if (isFrench && sid && this.speciesNames[sid]) {
              let fr = this.getSpeciesName(sid, pokemon.formIndex, pokemon);
              if (isMega && !fr.toLowerCase().includes('méga') && !fr.toLowerCase().includes('mega')) {
                fr = `Méga-${fr}`;
              }
              return fr;
            }
            return n.trim();
          }
        } catch (_) {}
      }

      // 5. Fallback dictionnaire français
      if (sid && !isNaN(sid)) {
        let name = this.getSpeciesName(sid, pokemon.formIndex, pokemon);
        if (name) {
          if (isMega && !name.toLowerCase().includes('méga') && !name.toLowerCase().includes('mega')) {
            name = `Méga-${name}`;
          }
          return name;
        }
      }

      // 6. Si rien d'autre n'est trouvé, utiliser le nom de famille ou propriété
      if (pokemon.species?.name && typeof pokemon.species.name === 'string') {
        return pokemon.species.name;
      }
      if (pokemon.name && typeof pokemon.name === 'string') {
        return pokemon.name;
      }

      const fam = this.getFamilyInfo(pokemon);
      if (fam.lineageName) {
        return fam.lineageName.split(' / ')[0].trim();
      }

      return 'Pokémon';
    },
    getCurrentFormName(pokemon) {
      return this.getPokemonDisplayName(pokemon);
    },
    getSinglePokemonName(target, extra = null) {
      if (!target && !extra) return 'Pokémon';

      // 1. Si target est déjà un Pokémon (de l'équipe ou du combat)
      if (target && typeof target === 'object' && (target.species || target.speciesId || target.moveset || typeof target.getName === 'function')) {
        const name = this.getPokemonDisplayName(target);
        if (name && !name.includes(' / ')) return name;
      }

      // 2. Si target est une clé de famille (ex: 'family_4') ou un objet avec familyKey
      const famKey = typeof target === 'string' ? target : (extra?.familyKey || (target?.familyKey ? target.familyKey : this.getFamilyKey(target)));

      // Vérifier si un membre de cette famille est actuellement dans l'équipe active
      if (famKey && PokeSkip.activeParty && Array.isArray(PokeSkip.activeParty)) {
        const partyMember = PokeSkip.activeParty.find(p => this.getFamilyKey(p) === famKey);
        if (partyMember) {
          const name = this.getPokemonDisplayName(partyMember);
          if (name && !name.includes(' / ')) return name;
        }
      }

      // 3. Si on a un nom direct dans extra ou target (ex: rule.lineageName)
      const rawName = extra?.lineageName || target?.lineageName || (typeof target === 'string' && !target.startsWith('family_') ? target : '');
      if (rawName && typeof rawName === 'string') {
        const single = rawName.split(' / ')[0].trim();
        if (single) return single;
      }

      // 4. Résolution via rootId
      const rootId = this.getRootId(target || extra);
      if (rootId) {
        const spName = this.getSpeciesName(rootId);
        if (spName) return spName;
      }

      return 'Pokémon';
    },
    getMoveDetails(move, moveId, pokemon) {
      let moveObj = (move && typeof move === 'object') ? move : null;
      const mId = moveId || moveObj?.id || moveObj?.moveId;

      if ((!moveObj || moveObj.type === undefined || moveObj.category === undefined) && mId) {
        let getMoveFn = null;
        if (pokemon?.moveset && pokemon.moveset.length > 0 && typeof pokemon.moveset[0].getMove === 'function') {
          getMoveFn = pokemon.moveset[0].getMove;
        } else if (PokeSkip.activeParty && Array.isArray(PokeSkip.activeParty)) {
          for (const p of PokeSkip.activeParty) {
            if (p?.moveset && p.moveset.length > 0 && typeof p.moveset[0].getMove === 'function') {
              getMoveFn = p.moveset[0].getMove;
              break;
            }
          }
        }
        if (getMoveFn) {
          try {
            const resolved = getMoveFn.call({ moveId: mId });
            if (resolved) {
              moveObj = Object.assign({}, resolved, moveObj || {});
            }
          } catch (_) {}
        }
      }

      const name = moveObj?.name || (move && typeof move === 'string' ? move : null) || (mId ? PokeSkip.knownMovesCache[mId] : null) || `Capacité #${mId || '?'}`;

      let typeIdx = 0;
      if (moveObj && moveObj.type !== undefined) {
        if (typeof moveObj.type === 'number') {
          typeIdx = moveObj.type;
        } else if (typeof moveObj.type === 'string') {
          const idx = POKEMON_TYPES.findIndex(t => t.name.toLowerCase() === moveObj.type.toLowerCase() || t.code.toLowerCase() === moveObj.type.toLowerCase());
          if (idx !== -1) typeIdx = idx;
        } else if (typeof moveObj.type === 'object' && moveObj.type.name) {
          const idx = POKEMON_TYPES.findIndex(t => t.name.toLowerCase() === moveObj.type.name.toLowerCase());
          if (idx !== -1) typeIdx = idx;
        }
      }

      let catIdx = 2;
      if (moveObj && moveObj.category !== undefined) {
        if (typeof moveObj.category === 'number') {
          catIdx = moveObj.category;
        } else if (typeof moveObj.category === 'string') {
          const idx = MOVE_CATEGORIES.findIndex(c => c.name.toLowerCase() === moveObj.category.toLowerCase());
          if (idx !== -1) catIdx = idx;
        } else if (typeof moveObj.category === 'object' && moveObj.category.name) {
          const idx = MOVE_CATEGORIES.findIndex(c => c.name.toLowerCase() === moveObj.category.name.toLowerCase());
          if (idx !== -1) catIdx = idx;
        }
      }

      return {
        moveId: mId,
        name,
        type: POKEMON_TYPES[typeIdx] || POKEMON_TYPES[0],
        category: MOVE_CATEGORIES[catIdx] || MOVE_CATEGORIES[2]
      };
    },
    getMoveName(moveId, pokemon = null) {
      if (moveId === undefined || moveId === null) return '';
      const numId = Number(moveId);
      if (PokeSkip.knownMovesCache && PokeSkip.knownMovesCache[numId]) {
        return PokeSkip.knownMovesCache[numId];
      }
      const details = this.getMoveDetails(null, numId, pokemon);
      if (details && details.name && !details.name.startsWith('Capacité #')) {
        return details.name;
      }
      return PokeSkip.knownMovesCache?.[numId] || `Move #${numId}`;
    },
    findMoveIdByName(name) {
      if (!name) return null;
      const norm = (name || '').toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, '');
      if (PokeSkip.knownMovesCache) {
        for (const [idStr, mName] of Object.entries(PokeSkip.knownMovesCache)) {
          if (mName && mName.toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, '') === norm) {
            return Number(idStr);
          }
        }
      }
      return null;
    },
    getLineageMemberSprites(target, isShiny = false, pokemon = null, variant = 0) {
      const rootId = this.getRootId(pokemon || target);
      const fam = this.families[rootId];
      let members = [];
      if (pokemon) {
        const lineage = this.getLineageMembers(pokemon);
        if (lineage && Array.isArray(lineage.allMembers) && lineage.allMembers.length > 0) {
          members = lineage.allMembers;
        }
      }
      if (!members.length) {
        members = (fam && Array.isArray(fam.members) && fam.members.length > 0) ? fam.members : (rootId ? [rootId] : []);
      }

      // Déterminer le variant depuis le pokémon si non fourni
      let effectiveVariant = variant;
      if (pokemon && isShiny && effectiveVariant === 0) {
        if (typeof pokemon.variant === 'number') effectiveVariant = pokemon.variant;
        else if (typeof pokemon.shinyTier === 'number') effectiveVariant = Math.max(0, pokemon.shinyTier - 1);
      }

      const currentSpeciesId = pokemon ? (pokemon.species?.speciesId ?? pokemon.speciesId ?? this.getRootId(pokemon)) : null;
      const list = [];
      const seen = new Set();

      for (let i = 0; i < members.length; i++) {
        const mId = members[i];
        if (seen.has(mId)) continue;
        seen.add(mId);
        const name = (pokemon && mId === currentSpeciesId)
          ? this.getPokemonDisplayName(pokemon)
          : (this.getSpeciesName(mId) || `Espèce #${mId}`);
        let url = '';

        // Pour le Pokémon actif de l'équipe, utiliser exactement le sprite extrait de Phaser (bonne couleur shiny & variante)
        if (pokemon && (mId === currentSpeciesId || (!currentSpeciesId && mId === rootId))) {
          url = this.getPokemonSpriteUrl(pokemon);
        }

        if (!url) {
          const stored = AssetLoader.getStoredSprite(mId, isShiny, effectiveVariant);
          if (!stored) {
            AssetLoader.loadSpriteInBackground(mId, isShiny, effectiveVariant);
          }
          url = stored || (isShiny
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${mId}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mId}.png`);
        }

        let parentId = this.getParentSpeciesId(mId);
        if (parentId === null && i > 0) {
          parentId = members[i - 1];
        }

        list.push({ id: mId, name, url, isMega: false, isShiny, variant: effectiveVariant, parentId });

        if (this.megaFamilies[mId]) {
          const megaId = this.megaFamilies[mId].defaultMegaSpriteId;
          if (!seen.has(megaId)) {
            seen.add(megaId);
            let megaUrl = '';
            if (pokemon && this.isPokemonMega(pokemon) && (mId === currentSpeciesId || megaId === currentSpeciesId)) {
              megaUrl = this.getPokemonSpriteUrl(pokemon);
            }
            if (!megaUrl) {
              const storedMega = AssetLoader.getStoredSprite(megaId, isShiny, effectiveVariant);
              if (!storedMega) {
                AssetLoader.loadSpriteInBackground(megaId, isShiny, effectiveVariant);
              }
              megaUrl = storedMega || (isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${megaId}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${megaId}.png`);
            }

            list.push({
              id: megaId,
              name: `${name} (Méga)`,
              url: megaUrl,
              isMega: true,
              isShiny,
              variant: effectiveVariant,
              parentId: mId,
              baseSpeciesId: mId
            });
          }
        }
      }
      return list;
    },
    renderEvolutionChainHtml(memberSprites, activeSpeciesId = null, isLarge = false) {
      if (!memberSprites || !memberSprites.length) return '';
      const rootId = memberSprites[0]?.id;
      const count = memberSprites.length;

      let sizeClass = isLarge ? 'large' : '';
      if (count >= 7) {
        sizeClass = 'extra-compact';
      } else if (count >= 5) {
        sizeClass = 'compact';
      }

      return `
        <div class="pokeskip-evolution-chain ${sizeClass}">
          ${memberSprites.map((ms, idx) => {
            let connectorHtml = '';
            if (idx > 0) {
              const prev = memberSprites[idx - 1];
              // 1. Transformation Méga-Évolution
              if (ms.isMega && ms.parentId === prev.id) {
                connectorHtml = `
                  <div class="pokeskip-evo-arrow mega" title="Transformation Méga-Évolution de ${prev.name}">
                    <span class="pokeskip-evo-mega-pill">🧬 Méga</span>
                    <span class="pokeskip-evo-arrow-char">➔</span>
                  </div>
                `;
              }
              // 2. Évolution séquentielle directe dans la même branche
              else if (ms.parentId === prev.id && !ms.isMega) {
                connectorHtml = `
                  <div class="pokeskip-evo-arrow" title="Évolution de ${prev.name} en ${ms.name}">
                    <span class="pokeskip-evo-arrow-char">➔</span>
                  </div>
                `;
              }
              // 3. Branche alternative ! Le parent n'est pas le Pokémon précédent
              else {
                const parentObj = memberSprites.find(m => m.id === ms.parentId);
                const parentName = parentObj ? parentObj.name.replace(/\s*\(Méga\)/, '') : (this.getSpeciesName(ms.parentId) || 'forme précédente');
                const isBranchFromRoot = ms.parentId === rootId;

                connectorHtml = `
                  <div class="pokeskip-evo-branch-divider" title="Branche alternative : ${ms.name} évolue depuis ${parentName}">
                    <div class="pokeskip-evo-branch-badge">
                      <span class="pokeskip-evo-branch-icon">⑂</span>
                      <span class="pokeskip-evo-branch-label">${isBranchFromRoot && memberSprites.length > 4 ? 'ou' : 'Branche'}</span>
                    </div>
                    <div class="pokeskip-evo-branch-origin" title="Évolution alternative issue de ${parentName}">
                      <span>depuis <b>${parentName}</b></span>
                      <span class="pokeskip-evo-branch-arrow">➔</span>
                    </div>
                  </div>
                `;
              }
            }

            return `
              ${connectorHtml}
              <div class="pokeskip-evo-node ${ms.id === activeSpeciesId ? 'current-active' : ''}">
                <div class="pokeskip-evo-sprite-wrap" title="${ms.name}">
                  <img src="${ms.url}" alt="${ms.name}" class="pokeskip-evo-sprite"
                       data-pokeskip-species="${ms.id}" data-pokeskip-shiny="${!!ms.isShiny}" data-pokeskip-variant="${ms.variant || 0}"
                       onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                  <div style="display:none; font-size: 20px;">⚡</div>
                  ${ms.isMega ? '<span class="pokeskip-mini-mega-tag">MÉGA</span>' : ''}
                </div>
                <div class="pokeskip-evo-name" title="${ms.name}">${ms.name}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
};
