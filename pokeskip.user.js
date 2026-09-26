// ==UserScript==
// @name         PokéSkip — Auto-Skip Sélectif des Capacités pour PokéRogue
// @namespace    https://github.com/estelar9/pokerogue-pokeskip
// @version      1.9.0
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


(function () {
  'use strict';

  if (window.__POKESKIP_INJECTED__) {
    console.log('[PokéSkip] Le plugin est déjà actif sur cette page !');
    return;
  }
  window.__POKESKIP_INJECTED__ = true;

  const STORAGE_KEY = 'pokeskip_species_rules_v1';
  const SETTINGS_KEY = 'pokeskip_settings_v1';
  const STATS_KEY = 'pokeskip_stats_v1';

  // --- RÉFÉRENTIELS TYPES & CATÉGORIES POKÉMON ---
  const POKEMON_TYPES = [
    { name: 'Normal', code: 'NOR', color: '#ffffff', bg: '#ada594' },
    { name: 'Combat', code: 'COM', color: '#ffffff', bg: '#a55239' },
    { name: 'Vol', code: 'VOL', color: '#ffffff', bg: '#9cadf7' },
    { name: 'Poison', code: 'POI', color: '#ffffff', bg: '#9141cb' },
    { name: 'Sol', code: 'SOL', color: '#ffffff', bg: '#ae7a3b' },
    { name: 'Roche', code: 'ROC', color: '#ffffff', bg: '#bda55a' },
    { name: 'Insecte', code: 'INS', color: '#ffffff', bg: '#adbd21' },
    { name: 'Spectre', code: 'SPE', color: '#ffffff', bg: '#6363b5' },
    { name: 'Acier', code: 'ACI', color: '#ffffff', bg: '#81a6be' },
    { name: 'Feu', code: 'FEU', color: '#ffffff', bg: '#f75231' },
    { name: 'Eau', code: 'EAU', color: '#ffffff', bg: '#399cff' },
    { name: 'Plante', code: 'PLA', color: '#ffffff', bg: '#7bce52' },
    { name: 'Électrik', code: 'ÉLE', color: '#ffffff', bg: '#ffc631' },
    { name: 'Psy', code: 'PSY', color: '#ffffff', bg: '#ef4179' },
    { name: 'Glace', code: 'GLA', color: '#ffffff', bg: '#5acee7' },
    { name: 'Dragon', code: 'DRA', color: '#ffffff', bg: '#7b63e7' },
    { name: 'Ténèbres', code: 'TÉN', color: '#ffffff', bg: '#735a4a' },
    { name: 'Fée', code: 'FÉE', color: '#ffffff', bg: '#ef70ef' },
    { name: 'Stellaire', code: 'STE', color: '#ffffff', bg: '#6299bd' }
  ];

  // Matrice 18x18 d'efficacité des types (Gen 6-9) : TYPE_CHART[attaquant][défenseur]
  // 1 = normal, 2 = super efficace, 0.5 = peu efficace, 0 = inefficace
  const TYPE_CHART = [
    // 0: Normal
    [1, 1, 1, 1, 1, 0.5, 1, 0, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // 1: Combat
    [2, 1, 0.5, 0.5, 1, 2, 0.5, 0, 2, 1, 1, 1, 1, 0.5, 2, 1, 2, 0.5],
    // 2: Vol
    [1, 2, 1, 1, 1, 0.5, 2, 1, 0.5, 1, 1, 2, 0.5, 1, 1, 1, 1, 1],
    // 3: Poison
    [1, 1, 1, 0.5, 0.5, 0.5, 1, 0.5, 0, 1, 1, 2, 1, 1, 1, 1, 1, 2],
    // 4: Sol
    [1, 1, 0, 2, 1, 2, 0.5, 1, 2, 2, 1, 0.5, 2, 1, 1, 1, 1, 1],
    // 5: Roche
    [1, 0.5, 2, 1, 0.5, 1, 2, 1, 0.5, 2, 1, 1, 1, 1, 2, 1, 1, 1],
    // 6: Insecte
    [1, 0.5, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 0.5, 1, 2, 1, 2, 1, 1, 2, 0.5],
    // 7: Spectre
    [0, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0.5, 1],
    // 8: Acier
    [1, 1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 0.5, 1, 0.5, 1, 2, 1, 1, 2],
    // 9: Feu
    [1, 1, 1, 1, 1, 0.5, 2, 1, 2, 0.5, 0.5, 2, 1, 1, 2, 0.5, 1, 1],
    // 10: Eau
    [1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 0.5, 0.5, 1, 1, 1, 0.5, 1, 1],
    // 11: Plante
    [1, 1, 0.5, 0.5, 2, 2, 0.5, 1, 0.5, 0.5, 2, 0.5, 1, 1, 1, 0.5, 1, 1],
    // 12: Électrik
    [1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 2, 0.5, 0.5, 1, 1, 0.5, 1, 1],
    // 13: Psy
    [1, 2, 1, 2, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 0.5, 1, 1, 0, 1],
    // 14: Glace
    [1, 1, 2, 1, 2, 1, 1, 1, 0.5, 0.5, 0.5, 2, 1, 1, 0.5, 2, 1, 1],
    // 15: Dragon
    [1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 2, 1, 0],
    // 16: Ténèbres
    [1, 0.5, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0.5, 0.5],
    // 17: Fée
    [1, 2, 1, 0.5, 1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 1, 1, 2, 2, 1]
  ];

  const MOVE_CATEGORIES = [
    { name: 'Physique', icon: '💥', color: '#f87171' },
    { name: 'Spéciale', icon: '✨', color: '#60a5fa' },
    { name: 'Statut', icon: '🌀', color: '#94a3b8' }
  ];

  // --- CROSS-BROWSER STORAGE WRAPPER ---
  const Storage = {
    get(key, defaultValue) {
      try {
        if (typeof GM_getValue === 'function') {
          const val = GM_getValue(key);
          if (val !== undefined) return JSON.parse(val);
        }
      } catch (e) {}
      try {
        const localVal = localStorage.getItem(key);
        if (localVal !== null) return JSON.parse(localVal);
      } catch (e) {}
      return defaultValue;
    },
    set(key, value) {
      const json = JSON.stringify(value);
      try {
        if (typeof GM_setValue === 'function') {
          GM_setValue(key, json);
        }
      } catch (e) {}
      try {
        localStorage.setItem(key, json);
      } catch (e) {}
    }
  };

  // --- CHARGEMENT ASYNCHRONE DES ASSETS POKEROGUE & CACHE LOCAL ---
  const AssetLoader = {
    _cache: {},
    _pending: new Set(),
    _variantDataCache: {},
    _masterlist: null,
    _masterlistPromise: null,

    init() {
      try {
        // Nettoyer les anciens caches v1/v2 potentiellement corrompus avec les mauvais shinies
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('pokeskip_pkr_sprite_') || k.startsWith('pokeskip_pkr_v2_'))) {
            localStorage.removeItem(k);
          } else if (k && k.startsWith('pokeskip_pkr_v3_')) {
            this._cache[k] = localStorage.getItem(k);
          }
        }
      } catch (e) {}
      this.getMasterlist();
    },

    getMasterlist() {
      if (this._masterlist) return Promise.resolve(this._masterlist);
      if (this._masterlistPromise) return this._masterlistPromise;
      const localUrl = './images/pokemon/variant/_masterlist.json';
      const fallbackUrl = 'https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/variant/_masterlist.json';
      this._masterlistPromise = fetch(localUrl)
        .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
        .catch(() => fetch(fallbackUrl).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }))
        .then(data => {
          this._masterlist = data || {};
          return this._masterlist;
        })
        .catch(() => {
          this._masterlist = {};
          return {};
        });
      return this._masterlistPromise;
    },

    getAssetKey(id) {
      if (!id) return '';
      const strId = String(id);
      if (strId.includes('-mega')) return strId;
      const numId = Number(id);
      if (numId >= 10000) {
        const megas = (typeof LineageManager !== 'undefined' && LineageManager.megaFamilies) ? LineageManager.megaFamilies : {};
        for (const [sid, info] of Object.entries(megas)) {
          if (info.defaultMegaSpriteId === numId) {
            if (Number(sid) === 6) return '6-mega-x';
            if (Number(sid) === 150) return '150-mega-x';
            return `${sid}-mega`;
          }
        }
      }
      return strId;
    },

    getCacheKey(speciesId, isShiny, variant) {
      const v = (isShiny && typeof variant === 'number') ? variant : 0;
      if (v > 0) {
        return `pokeskip_pkr_v3_${speciesId}_shiny_v${v}`;
      }
      return `pokeskip_pkr_v3_${speciesId}_${isShiny ? 'shiny' : 'normal'}`;
    },

    getStoredSprite(speciesId, isShiny, variant) {
      const cacheKey = this.getCacheKey(speciesId, isShiny, variant);
      if (this._cache[cacheKey]) return this._cache[cacheKey];
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          this._cache[cacheKey] = stored;
          return stored;
        }
      } catch (e) {}
      return null;
    },

    /**
     * Applique un mapping de couleurs (palette swap) sur un canvas ImageData.
     * colorMap = { "rrggbb_source": "rrggbb_dest", ... }
     */
    _applyPaletteSwap(imageData, colorMap) {
      if (!colorMap || typeof colorMap !== 'object') return imageData;
      const data = imageData.data;
      const lookup = new Map();
      const paletteList = [];

      for (const [src, dst] of Object.entries(colorMap)) {
        const srcHex = String(src).toLowerCase().replace('#', '');
        const dstHex = String(dst).toLowerCase().replace('#', '');
        if (srcHex.length !== 6 || dstHex.length !== 6) continue;
        const sr = parseInt(srcHex.substring(0, 2), 16);
        const sg = parseInt(srcHex.substring(2, 4), 16);
        const sb = parseInt(srcHex.substring(4, 6), 16);
        const dr = parseInt(dstHex.substring(0, 2), 16);
        const dg = parseInt(dstHex.substring(2, 4), 16);
        const db = parseInt(dstHex.substring(4, 6), 16);
        const key = ((sr << 16) | (sg << 8) | sb) >>> 0;
        lookup.set(key, [dr, dg, db]);
        paletteList.push({ sr, sg, sb, dr, dg, db });
      }

      if (lookup.size === 0) return imageData;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue; // pixel transparent
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const key = (((r << 16) | (g << 8) | b) >>> 0);
        let mapped = lookup.get(key);

        if (!mapped && paletteList.length > 0) {
          // Tolérance légère si conversion d'espace colorimétrique par le navigateur
          for (let p = 0; p < paletteList.length; p++) {
            const item = paletteList[p];
            if (Math.abs(r - item.sr) <= 2 && Math.abs(g - item.sg) <= 2 && Math.abs(b - item.sb) <= 2) {
              mapped = [item.dr, item.dg, item.db];
              break;
            }
          }
        }

        if (mapped) {
          data[i] = mapped[0];
          data[i + 1] = mapped[1];
          data[i + 2] = mapped[2];
        }
      }
      return imageData;
    },

    /**
     * Charge le JSON de mapping variant pour une espèce (local puis fallback GitHub).
     * Retourne une Promise<Object|null>.
     */
    _fetchVariantData(speciesKey) {
      if (this._variantDataCache[speciesKey] !== undefined) {
        return Promise.resolve(this._variantDataCache[speciesKey]);
      }
      const localUrl = `./images/pokemon/variant/${speciesKey}.json`;
      const fallbackUrl = `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/variant/${speciesKey}.json`;

      return fetch(localUrl)
        .then(res => {
          if (!res.ok) throw new Error(`Local ${res.status}`);
          return res.json();
        })
        .catch(() => {
          return fetch(fallbackUrl).then(res => {
            if (!res.ok) throw new Error(`Fallback ${res.status}`);
            return res.json();
          });
        })
        .then(data => {
          this._variantDataCache[speciesKey] = data;
          return data;
        })
        .catch(() => {
          this._variantDataCache[speciesKey] = null;
          return null;
        });
    },

    /**
     * Tente de charger une image via Blob (garantissant un canvas non-tainted)
     * et découpe sa frame '0001.png' ou première frame selon le JSON de texture atlas.
     */
    _loadFrameFromAtlas(jsonUrls, pngUrls) {
      const tryFetchJson = (urls, idx = 0) => {
        if (idx >= urls.length) return Promise.reject(new Error('No JSON url worked'));
        return fetch(urls[idx]).then(r => {
          if (!r.ok) return tryFetchJson(urls, idx + 1);
          return r.json();
        }).catch(() => tryFetchJson(urls, idx + 1));
      };

      const tryFetchBlob = (urls, idx = 0) => {
        if (idx >= urls.length) return Promise.reject(new Error('No PNG blob url worked'));
        return fetch(urls[idx]).then(r => {
          if (!r.ok) return tryFetchBlob(urls, idx + 1);
          return r.blob();
        }).catch(() => tryFetchBlob(urls, idx + 1));
      };

      return tryFetchJson(jsonUrls).then(atlasJson => {
        const frames = atlasJson?.textures?.[0]?.frames || [];
        const targetFrameObj = frames.find(f => f.filename === '0001.png' || f.filename === '1.png') || frames[0];
        const targetFrame = targetFrameObj?.frame;
        if (!targetFrame || !targetFrame.w || !targetFrame.h) throw new Error('Invalid frame');

        return tryFetchBlob(pngUrls).then(blob => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            const blobUrl = URL.createObjectURL(blob);
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = targetFrame.w;
                canvas.height = targetFrame.h;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, targetFrame.x, targetFrame.y, targetFrame.w, targetFrame.h, 0, 0, targetFrame.w, targetFrame.h);
                URL.revokeObjectURL(blobUrl);
                resolve({ canvas, ctx });
              } catch (drawErr) {
                URL.revokeObjectURL(blobUrl);
                reject(drawErr);
              }
            };
            img.onerror = (e) => {
              URL.revokeObjectURL(blobUrl);
              reject(e);
            };
            img.src = blobUrl;
          });
        });
      });
    },

    loadSpriteInBackground(speciesId, isShiny, variant) {
      if (!speciesId || typeof window === 'undefined') return;
      const effectiveVariant = (isShiny && typeof variant === 'number' && variant > 0) ? variant : 0;
      const cacheKey = this.getCacheKey(speciesId, isShiny, effectiveVariant);
      if (this._cache[cacheKey] || this._pending.has(cacheKey)) return;
      this._pending.add(cacheKey);

      const assetKey = this.getAssetKey(speciesId);

      this.getMasterlist().then(masterlist => {
        let variantType = 0;
        if (isShiny && effectiveVariant > 0) {
          if (masterlist && masterlist[assetKey] && Array.isArray(masterlist[assetKey])) {
            variantType = masterlist[assetKey][effectiveVariant] || 0;
          }
        }

        // Cas 1: Spritesheet dédié (type 2 dans masterlist, ex: 2_2.png, 6_2.png, 3-mega_2.png)
        if (isShiny && effectiveVariant > 0 && (variantType === 2 || (variantType === 0 && !masterlist[assetKey]))) {
          const dedicatedSuffix = `_${effectiveVariant + 1}`;
          const dedicatedJsonUrls = [
            `./images/pokemon/variant/${assetKey}${dedicatedSuffix}.json`,
            `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/variant/${assetKey}${dedicatedSuffix}.json`
          ];
          const dedicatedPngUrls = [
            `./images/pokemon/variant/${assetKey}${dedicatedSuffix}.png`,
            `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/variant/${assetKey}${dedicatedSuffix}.png`
          ];

          return this._loadFrameFromAtlas(dedicatedJsonUrls, dedicatedPngUrls)
            .then(({ canvas }) => {
              const dataUrl = canvas.toDataURL('image/png');
              this._storeAndUpdateSprite(cacheKey, speciesId, isShiny, effectiveVariant, dataUrl);
              this._pending.delete(cacheKey);
            })
            .catch(() => {
              // Si le spritesheet dédié échoue, tenter la palette swap ou le base shiny
              return this._loadPaletteOrBaseShiny(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
            });
        }

        // Cas 2: Palette swap sur le sprite normal (type 1 dans masterlist, ex: 1.json, 3.json)
        if (isShiny && effectiveVariant > 0 && variantType === 1) {
          return this._loadPaletteOrBaseShiny(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
        }

        // Cas 3: Base shiny (type 0 ou Tier 1) ou normal (non-shiny)
        return this._loadStandardSprite(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
      }).catch(err => {
        console.warn('[PokéSkip] Erreur chargement sprite pour', speciesId, err);
        this._pending.delete(cacheKey);
      });
    },

    _loadPaletteOrBaseShiny(assetKey, speciesId, cacheKey, isShiny, effectiveVariant) {
      const normJsonUrls = [
        `./images/pokemon/${assetKey}.json`,
        `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/${assetKey}.json`
      ];
      const normPngUrls = [
        `./images/pokemon/${assetKey}.png`,
        `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/${assetKey}.png`
      ];

      return this._fetchVariantData(assetKey).then(variantJson => {
        const colorMap = variantJson ? variantJson[String(effectiveVariant)] : null;
        if (colorMap && typeof colorMap === 'object') {
          // Charger le sprite normal et lui appliquer le palette swap
          return this._loadFrameFromAtlas(normJsonUrls, normPngUrls).then(({ canvas, ctx }) => {
            try {
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              this._applyPaletteSwap(imgData, colorMap);
              ctx.putImageData(imgData, 0, 0);
            } catch (e) {
              console.warn('[PokéSkip] Erreur palette swap:', e);
            }
            const dataUrl = canvas.toDataURL('image/png');
            this._storeAndUpdateSprite(cacheKey, speciesId, isShiny, effectiveVariant, dataUrl);
            this._pending.delete(cacheKey);
          });
        }
        // Pas de mapping de couleur: charger le base shiny
        return this._loadStandardSprite(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
      }).catch(err => {
        console.warn('[PokéSkip] Échec palette swap, repli base shiny:', err);
        return this._loadStandardSprite(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
      });
    },

    _loadStandardSprite(assetKey, speciesId, cacheKey, isShiny, effectiveVariant) {
      const sub = isShiny ? 'shiny/' : '';
      const jsonUrls = [
        `./images/pokemon/${sub}${assetKey}.json`,
        `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/${sub}${assetKey}.json`
      ];
      const pngUrls = [
        `./images/pokemon/${sub}${assetKey}.png`,
        `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/${sub}${assetKey}.png`
      ];

      return this._loadFrameFromAtlas(jsonUrls, pngUrls)
        .then(({ canvas }) => {
          const dataUrl = canvas.toDataURL('image/png');
          this._storeAndUpdateSprite(cacheKey, speciesId, isShiny, effectiveVariant, dataUrl);
          this._pending.delete(cacheKey);
        })
        .catch(() => {
          this._pending.delete(cacheKey);
        });
    },

    _storeAndUpdateSprite(cacheKey, speciesId, isShiny, variant, dataUrl) {
      this._cache[cacheKey] = dataUrl;
      try {
        localStorage.setItem(cacheKey, dataUrl);
      } catch (quotaErr) {}
      this.updateDomSprites(speciesId, isShiny, variant, dataUrl);
    },

    updateDomSprites(speciesId, isShiny, variant, dataUrl) {
      if (!dataUrl) return;
      const v = (isShiny && typeof variant === 'number') ? variant : 0;
      const selector = `img[data-pokeskip-species="${speciesId}"][data-pokeskip-shiny="${isShiny}"][data-pokeskip-variant="${v}"]`;
      const imgs = document.querySelectorAll(selector);
      imgs.forEach(img => {
        img.src = dataUrl;
      });
    }
  };
  AssetLoader.init();

  // --- GESTIONNAIRE DES LIGNÉES ÉVOLUTIVES (PROFILS PARTAGÉS PAR FAMILLE) ---
  const LineageManager = {
    families: {
  "1": {
    "name": "Bulbizarre → Herbizarre → Florizarre",
    "members": [
      1,
      2,
      3
    ]
  },
  "4": {
    "name": "Salamèche → Reptincel → Dracaufeu",
    "members": [
      4,
      5,
      6
    ]
  },
  "7": {
    "name": "Carapuce → Carabaffe → Tortank",
    "members": [
      7,
      8,
      9
    ]
  },
  "10": {
    "name": "Chenipan → Crisacier → Papilusion",
    "members": [
      10,
      11,
      12
    ]
  },
  "13": {
    "name": "Aspicot → Coconfort → Dardargnan",
    "members": [
      13,
      14,
      15
    ]
  },
  "16": {
    "name": "Roucool → Roucoups → Roucarnage",
    "members": [
      16,
      17,
      18
    ]
  },
  "19": {
    "name": "Rattata → Rattatac",
    "members": [
      19,
      20
    ]
  },
  "21": {
    "name": "Piafabec → Rapasdepic",
    "members": [
      21,
      22
    ]
  },
  "23": {
    "name": "Abo → Arbok",
    "members": [
      23,
      24
    ]
  },
  "27": {
    "name": "Sabelette → Sablaireau",
    "members": [
      27,
      28
    ]
  },
  "29": {
    "name": "Nidoran♀ → Nidorina → Nidoqueen",
    "members": [
      29,
      30,
      31
    ]
  },
  "32": {
    "name": "Nidoran♂ → Nidorino → Nidoking",
    "members": [
      32,
      33,
      34
    ]
  },
  "37": {
    "name": "Goupix → Feunard",
    "members": [
      37,
      38
    ]
  },
  "41": {
    "name": "Nosferapti → Nosferalto → Nostenfer",
    "members": [
      41,
      42,
      169
    ]
  },
  "43": {
    "name": "Mystherbe → Ortide → Rafflesia / Joliflor",
    "members": [
      43,
      44,
      45,
      182
    ]
  },
  "46": {
    "name": "Paras → Parasect",
    "members": [
      46,
      47
    ]
  },
  "48": {
    "name": "Mimitoss → Aéromite",
    "members": [
      48,
      49
    ]
  },
  "50": {
    "name": "Taupiqueur → Triopikeur",
    "members": [
      50,
      51
    ]
  },
  "52": {
    "name": "Miaouss → Persian",
    "members": [
      52,
      53
    ]
  },
  "53": {
    "name": "Miaouss → Persian",
    "members": [
      52,
      53
    ]
  },
  "54": {
    "name": "Psykokwak → Akwakwak",
    "members": [
      54,
      55
    ]
  },
  "56": {
    "name": "Férosinge → Colossinge → Courrousinge",
    "members": [
      56,
      57,
      979
    ]
  },
  "58": {
    "name": "Caninos → Arcanin",
    "members": [
      58,
      59
    ]
  },
  "60": {
    "name": "Ptitard → Têtarte → Tartard / Tarpaud",
    "members": [
      60,
      61,
      62,
      186
    ]
  },
  "63": {
    "name": "Abra → Kadabra → Alakazam",
    "members": [
      63,
      64,
      65
    ]
  },
  "66": {
    "name": "Machoc → Machopeur → Mackogneur",
    "members": [
      66,
      67,
      68
    ]
  },
  "69": {
    "name": "Chétiflor → Boustiflor → Empiflor",
    "members": [
      69,
      70,
      71
    ]
  },
  "72": {
    "name": "Tentacool → Tentacruel",
    "members": [
      72,
      73
    ]
  },
  "74": {
    "name": "Racaillou → Gravalanch → Grolem",
    "members": [
      74,
      75,
      76
    ]
  },
  "77": {
    "name": "Ponyta → Galopa",
    "members": [
      77,
      78
    ]
  },
  "79": {
    "name": "Ramoloss → Flagadoss / Roigada",
    "members": [
      79,
      80,
      199
    ]
  },
  "81": {
    "name": "Magnéti → Magnéton → Magnézone",
    "members": [
      81,
      82,
      462
    ]
  },
  "83": {
    "name": "Canarticho",
    "members": [
      83
    ]
  },
  "84": {
    "name": "Doduo → Dodrio",
    "members": [
      84,
      85
    ]
  },
  "86": {
    "name": "Otaria → Lamantine",
    "members": [
      86,
      87
    ]
  },
  "88": {
    "name": "Tadmorv → Grotadmorv",
    "members": [
      88,
      89
    ]
  },
  "90": {
    "name": "Kokiyas → Crustabri",
    "members": [
      90,
      91
    ]
  },
  "92": {
    "name": "Fantominus → Spectrum → Ectoplasma",
    "members": [
      92,
      93,
      94
    ]
  },
  "95": {
    "name": "Onix → Steelix",
    "members": [
      95,
      208
    ]
  },
  "96": {
    "name": "Soporifik → Hypnomade",
    "members": [
      96,
      97
    ]
  },
  "98": {
    "name": "Krabby → Krabboss",
    "members": [
      98,
      99
    ]
  },
  "100": {
    "name": "Voltorbe → Électrode",
    "members": [
      100,
      101
    ]
  },
  "102": {
    "name": "Nœunœuf → Noadkoko",
    "members": [
      102,
      103
    ]
  },
  "104": {
    "name": "Osselait → Ossatueur",
    "members": [
      104,
      105
    ]
  },
  "108": {
    "name": "Excelangue → Coudlangue",
    "members": [
      108,
      463
    ]
  },
  "109": {
    "name": "Smogo → Smogogo",
    "members": [
      109,
      110
    ]
  },
  "111": {
    "name": "Rhinocorne → Rhinoféros → Rhinastoc",
    "members": [
      111,
      112,
      464
    ]
  },
  "114": {
    "name": "Saquedeneu → Bouldeneu",
    "members": [
      114,
      465
    ]
  },
  "115": {
    "name": "Kangourex",
    "members": [
      115
    ]
  },
  "116": {
    "name": "Hypotrempe → Hypocéan → Hyporoi",
    "members": [
      116,
      117,
      230
    ]
  },
  "118": {
    "name": "Poissirène → Poissoroy",
    "members": [
      118,
      119
    ]
  },
  "120": {
    "name": "Stari → Staross",
    "members": [
      120,
      121
    ]
  },
  "123": {
    "name": "Insécateur → Cizayox / Hachécateur",
    "members": [
      123,
      212,
      900
    ]
  },
  "127": {
    "name": "Scarabrute",
    "members": [
      127
    ]
  },
  "128": {
    "name": "Tauros",
    "members": [
      128
    ]
  },
  "129": {
    "name": "Magicarpe → Léviator",
    "members": [
      129,
      130
    ]
  },
  "131": {
    "name": "Lokhlass",
    "members": [
      131
    ]
  },
  "132": {
    "name": "Métamorph",
    "members": [
      132
    ]
  },
  "133": {
    "name": "Évoli → Aquali / Voltali / Pyroli / Mentali / Noctali / Phyllali / Givrali / Nymphali",
    "members": [
      133,
      134,
      135,
      136,
      196,
      197,
      470,
      471,
      700
    ]
  },
  "137": {
    "name": "Porygon → Porygon2 → Porygon-Z",
    "members": [
      137,
      233,
      474
    ]
  },
  "138": {
    "name": "Amonita → Amonistar",
    "members": [
      138,
      139
    ]
  },
  "140": {
    "name": "Kabuto → Kabutops",
    "members": [
      140,
      141
    ]
  },
  "142": {
    "name": "Ptéra",
    "members": [
      142
    ]
  },
  "144": {
    "name": "Artikodin",
    "members": [
      144
    ]
  },
  "145": {
    "name": "Électhor",
    "members": [
      145
    ]
  },
  "146": {
    "name": "Sulfura",
    "members": [
      146
    ]
  },
  "147": {
    "name": "Minidraco → Draco → Dracolosse",
    "members": [
      147,
      148,
      149
    ]
  },
  "150": {
    "name": "Mewtwo",
    "members": [
      150
    ]
  },
  "151": {
    "name": "Mew",
    "members": [
      151
    ]
  },
  "152": {
    "name": "Germignon → Macronium → Méganium",
    "members": [
      152,
      153,
      154
    ]
  },
  "155": {
    "name": "Héricendre → Feurisson → Typhlosion",
    "members": [
      155,
      156,
      157
    ]
  },
  "158": {
    "name": "Kaiminus → Crocrodil → Aligatueur",
    "members": [
      158,
      159,
      160
    ]
  },
  "161": {
    "name": "Fouinette → Fouinar",
    "members": [
      161,
      162
    ]
  },
  "163": {
    "name": "Hoothoot → Noarfang",
    "members": [
      163,
      164
    ]
  },
  "165": {
    "name": "Coxy → Coxyclaque",
    "members": [
      165,
      166
    ]
  },
  "167": {
    "name": "Mimigal → Migalos",
    "members": [
      167,
      168
    ]
  },
  "172": {
    "name": "Pichu → Pikachu → Raichu",
    "members": [
      172,
      25,
      26
    ]
  },
  "173": {
    "name": "Mélo → Mélofée → Mélodelfe",
    "members": [
      173,
      35,
      36
    ]
  },
  "174": {
    "name": "Toudoudou → Rondoudou → Grodoudou",
    "members": [
      174,
      39,
      40
    ]
  },
  "175": {
    "name": "Togepi → Togetic → Togekiss",
    "members": [
      175,
      176,
      468
    ]
  },
  "177": {
    "name": "Natu → Xatu",
    "members": [
      177,
      178
    ]
  },
  "179": {
    "name": "Wattouat → Lainergie → Pharamp",
    "members": [
      179,
      180,
      181
    ]
  },
  "187": {
    "name": "Granivol → Floravol → Cotovol",
    "members": [
      187,
      188,
      189
    ]
  },
  "190": {
    "name": "Capumain → Capidextre",
    "members": [
      190,
      424
    ]
  },
  "191": {
    "name": "Tournegrin → Héliatronc",
    "members": [
      191,
      192
    ]
  },
  "193": {
    "name": "Yanma → Yanméga",
    "members": [
      193,
      469
    ]
  },
  "194": {
    "name": "Axoloto → Maraiste",
    "members": [
      194,
      195
    ]
  },
  "195": {
    "name": "Axoloto → Maraiste",
    "members": [
      194,
      195
    ]
  },
  "198": {
    "name": "Cornèbre → Corboss",
    "members": [
      198,
      430
    ]
  },
  "200": {
    "name": "Feuforêve → Magirêve",
    "members": [
      200,
      429
    ]
  },
  "201": {
    "name": "Zarbi",
    "members": [
      201
    ]
  },
  "203": {
    "name": "Girafarig → Farigiraf",
    "members": [
      203,
      981
    ]
  },
  "204": {
    "name": "Pomdepik → Foretress",
    "members": [
      204,
      205
    ]
  },
  "206": {
    "name": "Insolourdo → Deusolourdo",
    "members": [
      206,
      982
    ]
  },
  "207": {
    "name": "Scorplane → Scorvol",
    "members": [
      207,
      472
    ]
  },
  "211": {
    "name": "Qwilfish",
    "members": [
      211
    ]
  },
  "215": {
    "name": "Farfuret → Dimoret",
    "members": [
      215,
      461
    ]
  },
  "461": {
    "name": "Farfuret → Dimoret",
    "members": [
      215,
      461
    ]
  },
  "216": {
    "name": "Teddiursa → Ursaring → Ursaking",
    "members": [
      216,
      217,
      901
    ]
  },
  "218": {
    "name": "Limagma → Volcaropod",
    "members": [
      218,
      219
    ]
  },
  "220": {
    "name": "Marcacrin → Cochignon → Mammochon",
    "members": [
      220,
      221,
      473
    ]
  },
  "222": {
    "name": "Corayon",
    "members": [
      222
    ]
  },
  "223": {
    "name": "Rémoraid → Octillery",
    "members": [
      223,
      224
    ]
  },
  "225": {
    "name": "Cadoizo",
    "members": [
      225
    ]
  },
  "227": {
    "name": "Airmure",
    "members": [
      227
    ]
  },
  "228": {
    "name": "Malosse → Démolosse",
    "members": [
      228,
      229
    ]
  },
  "231": {
    "name": "Phanpy → Donphan",
    "members": [
      231,
      232
    ]
  },
  "234": {
    "name": "Cerfrousse → Cerbyllin",
    "members": [
      234,
      899
    ]
  },
  "235": {
    "name": "Queulorior",
    "members": [
      235
    ]
  },
  "236": {
    "name": "Debugant → Kicklee / Tygnon / Kapoera",
    "members": [
      236,
      106,
      107,
      237
    ]
  },
  "238": {
    "name": "Lippouti → Lippoutou",
    "members": [
      238,
      124
    ]
  },
  "239": {
    "name": "Élekid → Élektek → Élekable",
    "members": [
      239,
      125,
      466
    ]
  },
  "240": {
    "name": "Magby → Magmar → Maganon",
    "members": [
      240,
      126,
      467
    ]
  },
  "241": {
    "name": "Écrémeuh",
    "members": [
      241
    ]
  },
  "246": {
    "name": "Embrylex → Ymphect → Tyranocif",
    "members": [
      246,
      247,
      248
    ]
  },
  "252": {
    "name": "Arcko → Massko → Jungko",
    "members": [
      252,
      253,
      254
    ]
  },
  "255": {
    "name": "Poussifeu → Galifeu → Braségali",
    "members": [
      255,
      256,
      257
    ]
  },
  "258": {
    "name": "Gobou → Flobio → Laggron",
    "members": [
      258,
      259,
      260
    ]
  },
  "261": {
    "name": "Medhyèna → Grahyèna",
    "members": [
      261,
      262
    ]
  },
  "263": {
    "name": "Zigzaton → Linéon",
    "members": [
      263,
      264
    ]
  },
  "265": {
    "name": "Chenipotte → Armulys / Blindalys → Charmillon / Papinox",
    "members": [
      265,
      266,
      267,
      268,
      269
    ]
  },
  "270": {
    "name": "Nénupiot → Lombre → Ludicolo",
    "members": [
      270,
      271,
      272
    ]
  },
  "273": {
    "name": "Grainipiot → Pifeuil → Tengalice",
    "members": [
      273,
      274,
      275
    ]
  },
  "276": {
    "name": "Nirondelle → Hélédelle",
    "members": [
      276,
      277
    ]
  },
  "278": {
    "name": "Goélise → Bekipan",
    "members": [
      278,
      279
    ]
  },
  "280": {
    "name": "Tarsal → Kirlia → Gardevoir / Gallame",
    "members": [
      280,
      281,
      282,
      475
    ]
  },
  "283": {
    "name": "Arakdo → Maskadra",
    "members": [
      283,
      284
    ]
  },
  "285": {
    "name": "Balignon → Chapignon",
    "members": [
      285,
      286
    ]
  },
  "287": {
    "name": "Parecool → Vigoroth → Monaflèmit",
    "members": [
      287,
      288,
      289
    ]
  },
  "290": {
    "name": "Ningale → Ninjask / Munja",
    "members": [
      290,
      291,
      292
    ]
  },
  "293": {
    "name": "Chuchmur → Ramboum → Brouhabam",
    "members": [
      293,
      294,
      295
    ]
  },
  "296": {
    "name": "Makuhita → Hariyama",
    "members": [
      296,
      297
    ]
  },
  "298": {
    "name": "Azurill → Marill → Azumarill",
    "members": [
      298,
      183,
      184
    ]
  },
  "299": {
    "name": "Tarinor → Tarinorme",
    "members": [
      299,
      476
    ]
  },
  "300": {
    "name": "Skitty → Delcatty",
    "members": [
      300,
      301
    ]
  },
  "302": {
    "name": "Ténéfix",
    "members": [
      302
    ]
  },
  "303": {
    "name": "Mysdibule",
    "members": [
      303
    ]
  },
  "304": {
    "name": "Galekid → Galegon → Galeking",
    "members": [
      304,
      305,
      306
    ]
  },
  "307": {
    "name": "Méditikka → Charmina",
    "members": [
      307,
      308
    ]
  },
  "309": {
    "name": "Dynavolt → Élecsprint",
    "members": [
      309,
      310
    ]
  },
  "311": {
    "name": "Posipi",
    "members": [
      311
    ]
  },
  "312": {
    "name": "Négapi",
    "members": [
      312
    ]
  },
  "313": {
    "name": "Muciole",
    "members": [
      313
    ]
  },
  "314": {
    "name": "Lumivole",
    "members": [
      314
    ]
  },
  "316": {
    "name": "Gloupti → Avaltout",
    "members": [
      316,
      317
    ]
  },
  "318": {
    "name": "Carvanha → Sharpedo",
    "members": [
      318,
      319
    ]
  },
  "320": {
    "name": "Wailmer → Wailord",
    "members": [
      320,
      321
    ]
  },
  "322": {
    "name": "Chamallot → Camérupt",
    "members": [
      322,
      323
    ]
  },
  "324": {
    "name": "Chartor",
    "members": [
      324
    ]
  },
  "325": {
    "name": "Spoink → Groret",
    "members": [
      325,
      326
    ]
  },
  "327": {
    "name": "Spinda",
    "members": [
      327
    ]
  },
  "328": {
    "name": "Kraknoix → Vibraninf → Libégon",
    "members": [
      328,
      329,
      330
    ]
  },
  "331": {
    "name": "Cacnea → Cacturne",
    "members": [
      331,
      332
    ]
  },
  "333": {
    "name": "Tylton → Altaria",
    "members": [
      333,
      334
    ]
  },
  "335": {
    "name": "Mangriff",
    "members": [
      335
    ]
  },
  "336": {
    "name": "Séviper",
    "members": [
      336
    ]
  },
  "337": {
    "name": "Séléroc",
    "members": [
      337
    ]
  },
  "338": {
    "name": "Solaroc",
    "members": [
      338
    ]
  },
  "339": {
    "name": "Barloche → Barbicha",
    "members": [
      339,
      340
    ]
  },
  "341": {
    "name": "Écrapince → Colhomard",
    "members": [
      341,
      342
    ]
  },
  "343": {
    "name": "Balbuto → Kaorine",
    "members": [
      343,
      344
    ]
  },
  "345": {
    "name": "Lilia → Vacillys",
    "members": [
      345,
      346
    ]
  },
  "347": {
    "name": "Anorith → Armaldo",
    "members": [
      347,
      348
    ]
  },
  "349": {
    "name": "Barpau → Milobellus",
    "members": [
      349,
      350
    ]
  },
  "351": {
    "name": "Morphéo",
    "members": [
      351
    ]
  },
  "352": {
    "name": "Kecleon",
    "members": [
      352
    ]
  },
  "353": {
    "name": "Polichombr → Branette",
    "members": [
      353,
      354
    ]
  },
  "355": {
    "name": "Skelénox → Téraclope → Noctunoir",
    "members": [
      355,
      356,
      477
    ]
  },
  "357": {
    "name": "Tropius",
    "members": [
      357
    ]
  },
  "359": {
    "name": "Absol",
    "members": [
      359
    ]
  },
  "360": {
    "name": "Okéoké → Qulbutoké",
    "members": [
      360,
      202
    ]
  },
  "361": {
    "name": "Stalgamin → Oniglali / Momartik",
    "members": [
      361,
      362,
      478
    ]
  },
  "363": {
    "name": "Obalie → Phogleur → Kaimorse",
    "members": [
      363,
      364,
      365
    ]
  },
  "366": {
    "name": "Coquiperl → Serpang / Rosabyss",
    "members": [
      366,
      367,
      368
    ]
  },
  "369": {
    "name": "Relicanth",
    "members": [
      369
    ]
  },
  "370": {
    "name": "Lovdisc",
    "members": [
      370
    ]
  },
  "371": {
    "name": "Draby → Drackhaus → Drattak",
    "members": [
      371,
      372,
      373
    ]
  },
  "374": {
    "name": "Terhal → Métang → Métalosse",
    "members": [
      374,
      375,
      376
    ]
  },
  "387": {
    "name": "Tortipouss → Boskara → Torterra",
    "members": [
      387,
      388,
      389
    ]
  },
  "390": {
    "name": "Ouisticram → Chimpenfeu → Simiabraz",
    "members": [
      390,
      391,
      392
    ]
  },
  "393": {
    "name": "Tiplouf → Prinplouf → Pingoléon",
    "members": [
      393,
      394,
      395
    ]
  },
  "396": {
    "name": "Étourmi → Étourvol → Étouraptor",
    "members": [
      396,
      397,
      398
    ]
  },
  "399": {
    "name": "Keunotor → Castorno",
    "members": [
      399,
      400
    ]
  },
  "401": {
    "name": "Crikzik → Mélokrik",
    "members": [
      401,
      402
    ]
  },
  "403": {
    "name": "Lixy → Luxio → Luxray",
    "members": [
      403,
      404,
      405
    ]
  },
  "406": {
    "name": "Rozbouton → Rosélia → Roserade",
    "members": [
      406,
      315,
      407
    ]
  },
  "408": {
    "name": "Kranidos → Charkos",
    "members": [
      408,
      409
    ]
  },
  "410": {
    "name": "Dinoclier → Bastiodon",
    "members": [
      410,
      411
    ]
  },
  "412": {
    "name": "Cheniti → Cheniselle / Papilord",
    "members": [
      412,
      413,
      414
    ]
  },
  "415": {
    "name": "Apitrini → Apireine",
    "members": [
      415,
      416
    ]
  },
  "417": {
    "name": "Pachirisu",
    "members": [
      417
    ]
  },
  "418": {
    "name": "Mustébouée → Mustéflott",
    "members": [
      418,
      419
    ]
  },
  "420": {
    "name": "Ceribou → Ceriflor",
    "members": [
      420,
      421
    ]
  },
  "422": {
    "name": "Sancoki → Tritosor",
    "members": [
      422,
      423
    ]
  },
  "425": {
    "name": "Baudrive → Grodrive",
    "members": [
      425,
      426
    ]
  },
  "427": {
    "name": "Laporeille → Lockpin",
    "members": [
      427,
      428
    ]
  },
  "431": {
    "name": "Chaglam → Chaffreux",
    "members": [
      431,
      432
    ]
  },
  "433": {
    "name": "Korillon → Éoko",
    "members": [
      433,
      358
    ]
  },
  "434": {
    "name": "Moufouette → Mouflair",
    "members": [
      434,
      435
    ]
  },
  "436": {
    "name": "Archéomire → Archéodong",
    "members": [
      436,
      437
    ]
  },
  "438": {
    "name": "Manzaï → Simularbre",
    "members": [
      438,
      185
    ]
  },
  "439": {
    "name": "Mime Jr. → M. Mime",
    "members": [
      439,
      122
    ]
  },
  "122": {
    "name": "Mime Jr. → M. Mime",
    "members": [
      439,
      122
    ]
  },
  "440": {
    "name": "Ptiravi → Leveinard → Leuphorie",
    "members": [
      440,
      113,
      242
    ]
  },
  "441": {
    "name": "Pijako",
    "members": [
      441
    ]
  },
  "442": {
    "name": "Spiritomb",
    "members": [
      442
    ]
  },
  "443": {
    "name": "Griknot → Carmache → Carchacrok",
    "members": [
      443,
      444,
      445
    ]
  },
  "446": {
    "name": "Goinfrex → Ronflex",
    "members": [
      446,
      143
    ]
  },
  "447": {
    "name": "Riolu → Lucario",
    "members": [
      447,
      448
    ]
  },
  "449": {
    "name": "Hippopotas → Hippodocus",
    "members": [
      449,
      450
    ]
  },
  "451": {
    "name": "Rapion → Drascore",
    "members": [
      451,
      452
    ]
  },
  "453": {
    "name": "Cradopaud → Coatox",
    "members": [
      453,
      454
    ]
  },
  "455": {
    "name": "Vortente",
    "members": [
      455
    ]
  },
  "456": {
    "name": "Écayon → Luminéon",
    "members": [
      456,
      457
    ]
  },
  "458": {
    "name": "Babimanta → Démanta",
    "members": [
      458,
      226
    ]
  },
  "459": {
    "name": "Blizzi → Blizzaroi",
    "members": [
      459,
      460
    ]
  },
  "479": {
    "name": "Motisma",
    "members": [
      479
    ]
  },
  "495": {
    "name": "Vipélierre → Lianaja → Majaspic",
    "members": [
      495,
      496,
      497
    ]
  },
  "498": {
    "name": "Gruikui → Grotichon → Roitiflam",
    "members": [
      498,
      499,
      500
    ]
  },
  "501": {
    "name": "Moustillon → Mateloutre → Clamiral",
    "members": [
      501,
      502,
      503
    ]
  },
  "504": {
    "name": "Ratentif → Miradar",
    "members": [
      504,
      505
    ]
  },
  "506": {
    "name": "Ponchiot → Ponchien → Mastouffe",
    "members": [
      506,
      507,
      508
    ]
  },
  "509": {
    "name": "Chacripan → Léopardus",
    "members": [
      509,
      510
    ]
  },
  "511": {
    "name": "Feuillajou → Feuiloutan",
    "members": [
      511,
      512
    ]
  },
  "513": {
    "name": "Flamajou → Flamoutan",
    "members": [
      513,
      514
    ]
  },
  "515": {
    "name": "Flotajou → Flotoutan",
    "members": [
      515,
      516
    ]
  },
  "517": {
    "name": "Munna → Mushana",
    "members": [
      517,
      518
    ]
  },
  "519": {
    "name": "Poichigeon → Colombeau → Déflaisan",
    "members": [
      519,
      520,
      521
    ]
  },
  "522": {
    "name": "Zébibron → Zéblitz",
    "members": [
      522,
      523
    ]
  },
  "524": {
    "name": "Nodulithe → Géolithe → Gigalithe",
    "members": [
      524,
      525,
      526
    ]
  },
  "527": {
    "name": "Chovsourir → Rhinolove",
    "members": [
      527,
      528
    ]
  },
  "529": {
    "name": "Rototaupe → Minotaupe",
    "members": [
      529,
      530
    ]
  },
  "532": {
    "name": "Charpenti → Ouvifier → Bétochef",
    "members": [
      532,
      533,
      534
    ]
  },
  "535": {
    "name": "Tritonde → Batracné → Crapustule",
    "members": [
      535,
      536,
      537
    ]
  },
  "540": {
    "name": "Larveyette → Coupenotte → Manternel",
    "members": [
      540,
      541,
      542
    ]
  },
  "543": {
    "name": "Venipatte → Scobolide → Brutapode",
    "members": [
      543,
      544,
      545
    ]
  },
  "546": {
    "name": "Doudouvet → Farfaduvet",
    "members": [
      546,
      547
    ]
  },
  "548": {
    "name": "Chlorobule → Fragilady",
    "members": [
      548,
      549
    ]
  },
  "550": {
    "name": "Bargantua",
    "members": [
      550
    ]
  },
  "551": {
    "name": "Mascaïman → Escroco → Crocorible",
    "members": [
      551,
      552,
      553
    ]
  },
  "554": {
    "name": "Darumarond → Darumacho",
    "members": [
      554,
      555
    ]
  },
  "557": {
    "name": "Crabicoque → Crabaraque",
    "members": [
      557,
      558
    ]
  },
  "559": {
    "name": "Baggiguane → Baggaïd",
    "members": [
      559,
      560
    ]
  },
  "562": {
    "name": "Tutafeh → Tutankafer",
    "members": [
      562,
      563
    ]
  },
  "563": {
    "name": "Tutafeh → Tutankafer",
    "members": [
      562,
      563
    ]
  },
  "564": {
    "name": "Carapagos → Mégapagos",
    "members": [
      564,
      565
    ]
  },
  "566": {
    "name": "Arkéapti → Aéroptéryx",
    "members": [
      566,
      567
    ]
  },
  "568": {
    "name": "Miamiasme → Miasmax",
    "members": [
      568,
      569
    ]
  },
  "570": {
    "name": "Zorua → Zoroark",
    "members": [
      570,
      571
    ]
  },
  "572": {
    "name": "Chinchidou → Pashmilla",
    "members": [
      572,
      573
    ]
  },
  "574": {
    "name": "Nucléos → Méios → Symbios",
    "members": [
      574,
      575,
      576
    ]
  },
  "577": {
    "name": "Couaneton → Lakmécygne",
    "members": [
      577,
      578
    ]
  },
  "580": {
    "name": "Sorbébé → Sorboul → Sorbouboul",
    "members": [
      580,
      581,
      582
    ]
  },
  "585": {
    "name": "Vivaldaim → Haydaim",
    "members": [
      585,
      586
    ]
  },
  "588": {
    "name": "Carabing → Lançargot",
    "members": [
      588,
      589
    ]
  },
  "590": {
    "name": "Trompignon → Gaulet",
    "members": [
      590,
      591
    ]
  },
  "592": {
    "name": "Viscuse → Moyade",
    "members": [
      592,
      593
    ]
  },
  "595": {
    "name": "Statitik → Mygavolt",
    "members": [
      595,
      596
    ]
  },
  "597": {
    "name": "Grindur → Noacier",
    "members": [
      597,
      598
    ]
  },
  "599": {
    "name": "Tic → Clic → Cliticlic",
    "members": [
      599,
      600,
      601
    ]
  },
  "602": {
    "name": "Anchwatt → Lampéroie → Ohmassacre",
    "members": [
      602,
      603,
      604
    ]
  },
  "605": {
    "name": "Lewsor → Neitram",
    "members": [
      605,
      606
    ]
  },
  "607": {
    "name": "Funécire → Mélancolux → Lugulabre",
    "members": [
      607,
      608,
      609
    ]
  },
  "610": {
    "name": "Coupenotte → Incisache → Tranchodon",
    "members": [
      610,
      611,
      612
    ]
  },
  "613": {
    "name": "Polarhume → Polagriffe",
    "members": [
      613,
      614
    ]
  },
  "616": {
    "name": "Escargaume → Limaspeed",
    "members": [
      616,
      617
    ]
  },
  "619": {
    "name": "Kungfouine → Shaofouine",
    "members": [
      619,
      620
    ]
  },
  "622": {
    "name": "Gringolem → Golemastoc",
    "members": [
      622,
      623
    ]
  },
  "624": {
    "name": "Scalpion → Scalproie → Scalpereur",
    "members": [
      624,
      625,
      983
    ]
  },
  "627": {
    "name": "Furaiglon → Gueriaigle",
    "members": [
      627,
      628
    ]
  },
  "629": {
    "name": "Vostourno → Vaututrice",
    "members": [
      629,
      630
    ]
  },
  "633": {
    "name": "Solochi → Diamat → Trioxhydre",
    "members": [
      633,
      634,
      635
    ]
  },
  "636": {
    "name": "Pyronille → Pyrax",
    "members": [
      636,
      637
    ]
  },
  "650": {
    "name": "Marisson → Boguenisse → Blindépique",
    "members": [
      650,
      651,
      652
    ]
  },
  "653": {
    "name": "Feunnec → Roussil → Goupelin",
    "members": [
      653,
      654,
      655
    ]
  },
  "656": {
    "name": "Grenousse → Croâporal → Amphinobi",
    "members": [
      656,
      657,
      658
    ]
  },
  "659": {
    "name": "Sapereau → Excavarenne",
    "members": [
      659,
      660
    ]
  },
  "661": {
    "name": "Passerouge → Braisillon → Flambusard",
    "members": [
      661,
      662,
      663
    ]
  },
  "664": {
    "name": "Lépidonille → Pérégrain → Prismillon",
    "members": [
      664,
      665,
      666
    ]
  },
  "667": {
    "name": "Hélionceau → Némélios",
    "members": [
      667,
      668
    ]
  },
  "669": {
    "name": "Flabébé → Floette → Florges",
    "members": [
      669,
      670,
      671
    ]
  },
  "672": {
    "name": "Cabriolaine → Chevroum",
    "members": [
      672,
      673
    ]
  },
  "674": {
    "name": "Pandespiègle → Pandarbare",
    "members": [
      674,
      675
    ]
  },
  "677": {
    "name": "Psystigri → Mistigrix",
    "members": [
      677,
      678
    ]
  },
  "679": {
    "name": "Monorpale → Dimoclès → Exagide",
    "members": [
      679,
      680,
      681
    ]
  },
  "682": {
    "name": "Fluvetin → Cocotine",
    "members": [
      682,
      683
    ]
  },
  "684": {
    "name": "Sucroquin → Cupcanaille",
    "members": [
      684,
      685
    ]
  },
  "686": {
    "name": "Sepiatop → Sepiatroce",
    "members": [
      686,
      687
    ]
  },
  "688": {
    "name": "Opermine → Golgopathe",
    "members": [
      688,
      689
    ]
  },
  "690": {
    "name": "Venalgue → Kravarech",
    "members": [
      690,
      691
    ]
  },
  "692": {
    "name": "Flingouste → Gamblast",
    "members": [
      692,
      693
    ]
  },
  "694": {
    "name": "Galvaran → Iguolta",
    "members": [
      694,
      695
    ]
  },
  "696": {
    "name": "Ptyranidur → Rexillius",
    "members": [
      696,
      697
    ]
  },
  "698": {
    "name": "Amagara → Dragmara",
    "members": [
      698,
      699
    ]
  },
  "704": {
    "name": "Mucuscule → Colimucus → Muplodocus",
    "members": [
      704,
      705,
      706
    ]
  },
  "708": {
    "name": "Brocélôme → Desséliande",
    "members": [
      708,
      709
    ]
  },
  "710": {
    "name": "Pitrouille → Banshitrouye",
    "members": [
      710,
      711
    ]
  },
  "712": {
    "name": "Grelaçon → Séracrawl",
    "members": [
      712,
      713
    ]
  },
  "714": {
    "name": "Sonistrelle → Bruyverne",
    "members": [
      714,
      715
    ]
  },
  "722": {
    "name": "Brindibou → Efflèche → Archéduc",
    "members": [
      722,
      723,
      724
    ]
  },
  "725": {
    "name": "Flamiaou → Matoufeu → Félinferno",
    "members": [
      725,
      726,
      727
    ]
  },
  "728": {
    "name": "Otaquin → Otarlette → Oratoria",
    "members": [
      728,
      729,
      730
    ]
  },
  "731": {
    "name": "Picassaut → Piclairon → Bazoucan",
    "members": [
      731,
      732,
      733
    ]
  },
  "734": {
    "name": "Manglouton → Argouste",
    "members": [
      734,
      735
    ]
  },
  "736": {
    "name": "Larvibule → Chrysapile → Lucanon",
    "members": [
      736,
      737,
      738
    ]
  },
  "739": {
    "name": "Crabagarre → Crabominable",
    "members": [
      739,
      740
    ]
  },
  "742": {
    "name": "Bombydou → Rubombelle",
    "members": [
      742,
      743
    ]
  },
  "744": {
    "name": "Rocabot → Lougaroc",
    "members": [
      744,
      745
    ]
  },
  "747": {
    "name": "Vorastérie → Prédastérie",
    "members": [
      747,
      748
    ]
  },
  "749": {
    "name": "Tiboudet → Bourrinos",
    "members": [
      749,
      750
    ]
  },
  "751": {
    "name": "Araqua → Tarenbulle",
    "members": [
      751,
      752
    ]
  },
  "753": {
    "name": "Mimantis → Floramantis",
    "members": [
      753,
      754
    ]
  },
  "755": {
    "name": "Spododo → Guérilande",
    "members": [
      755,
      756
    ]
  },
  "757": {
    "name": "Tritox → Malamandre",
    "members": [
      757,
      758
    ]
  },
  "759": {
    "name": "Nounourson → Chelours",
    "members": [
      759,
      760
    ]
  },
  "761": {
    "name": "Croquine → Candine → Sucreine",
    "members": [
      761,
      762,
      763
    ]
  },
  "767": {
    "name": "Sovkipou → Sarmuraï",
    "members": [
      767,
      768
    ]
  },
  "769": {
    "name": "Bacabouh → Trépassable",
    "members": [
      769,
      770
    ]
  },
  "772": {
    "name": "Type:0 → Silvallié",
    "members": [
      772,
      773
    ]
  },
  "782": {
    "name": "Bébécaille → Écaïd → Ékaïser",
    "members": [
      782,
      783,
      784
    ]
  },
  "789": {
    "name": "Cosmog → Cosmoem → Solgaleo / Lunala",
    "members": [
      789,
      790,
      791,
      792
    ]
  },
  "803": {
    "name": "Vémini → Mandrillon",
    "members": [
      803,
      804
    ]
  },
  "808": {
    "name": "Meltan → Melmetal",
    "members": [
      808,
      809
    ]
  },
  "810": {
    "name": "Ouistempo → Badabouin → Gorythmic",
    "members": [
      810,
      811,
      812
    ]
  },
  "813": {
    "name": "Flambino → Lapyro → Pyrobut",
    "members": [
      813,
      814,
      815
    ]
  },
  "816": {
    "name": "Larméléon → Arrozard → Lézargus",
    "members": [
      816,
      817,
      818
    ]
  },
  "819": {
    "name": "Rongourmand → Rongrigou",
    "members": [
      819,
      820
    ]
  },
  "821": {
    "name": "Minisange → Bleuseille → Corvaillus",
    "members": [
      821,
      822,
      823
    ]
  },
  "824": {
    "name": "Larvadar → Coléodôme → Astronelle",
    "members": [
      824,
      825,
      826
    ]
  },
  "827": {
    "name": "Goupilou → Roublenard",
    "members": [
      827,
      828
    ]
  },
  "829": {
    "name": "Tournicoton → Blancoton",
    "members": [
      829,
      830
    ]
  },
  "831": {
    "name": "Moumouton → Moumouflon",
    "members": [
      831,
      832
    ]
  },
  "833": {
    "name": "Khélocrok → Torgamord",
    "members": [
      833,
      834
    ]
  },
  "835": {
    "name": "Voltoutou → Fulgudog",
    "members": [
      835,
      836
    ]
  },
  "837": {
    "name": "Charbi → Wagomine → Monthracite",
    "members": [
      837,
      838,
      839
    ]
  },
  "840": {
    "name": "Verpome → Pomdrapi / Dratatin / Pomdramour",
    "members": [
      840,
      841,
      842,
      1011
    ]
  },
  "843": {
    "name": "Dunaja → Dunaconda",
    "members": [
      843,
      844
    ]
  },
  "846": {
    "name": "Embrochet → Hastacuda",
    "members": [
      846,
      847
    ]
  },
  "848": {
    "name": "Toxizap → Salarsen",
    "members": [
      848,
      849
    ]
  },
  "850": {
    "name": "Grillepattes → Scolocendre",
    "members": [
      850,
      851
    ]
  },
  "852": {
    "name": "Poulpaf → Krakos",
    "members": [
      852,
      853
    ]
  },
  "854": {
    "name": "Théffroi → Polthégeist",
    "members": [
      854,
      855
    ]
  },
  "856": {
    "name": "Bibichut → Chapotus → Sorcilence",
    "members": [
      856,
      857,
      858
    ]
  },
  "859": {
    "name": "Grimalin → Fourbelin → Angoliath",
    "members": [
      859,
      860,
      861
    ]
  },
  "4263": {
    "name": "Zigzaton de Galar → Linéon de Galar → Ixon",
    "members": [
      4263,
      4264,
      862
    ]
  },
  "862": {
    "name": "Zigzaton de Galar → Linéon de Galar → Ixon",
    "members": [
      4263,
      4264,
      862
    ]
  },
  "4052": {
    "name": "Miaouss de Galar → Berserkatt",
    "members": [
      4052,
      863
    ]
  },
  "863": {
    "name": "Miaouss de Galar → Berserkatt",
    "members": [
      4052,
      863
    ]
  },
  "4083": {
    "name": "Canarticho de Galar → Palarticho",
    "members": [
      4083,
      865
    ]
  },
  "865": {
    "name": "Canarticho de Galar → Palarticho",
    "members": [
      4083,
      865
    ]
  },
  "4222": {
    "name": "Corayon de Galar → Corayôme",
    "members": [
      4222,
      864
    ]
  },
  "864": {
    "name": "Corayon de Galar → Corayôme",
    "members": [
      4222,
      864
    ]
  },
  "4562": {
    "name": "Tutafeh de Galar → Tutétékri",
    "members": [
      4562,
      867
    ]
  },
  "867": {
    "name": "Tutafeh de Galar → Tutétékri",
    "members": [
      4562,
      867
    ]
  },
  "6215": {
    "name": "Farfuret de Hisui → Farfurex",
    "members": [
      6215,
      903
    ]
  },
  "903": {
    "name": "Farfuret de Hisui → Farfurex",
    "members": [
      6215,
      903
    ]
  },
  "2052": {
    "name": "Miaouss d'Alola → Persian d'Alola",
    "members": [
      2052,
      2053
    ]
  },
  "2053": {
    "name": "Miaouss d'Alola → Persian d'Alola",
    "members": [
      2052,
      2053
    ]
  },
  "4122": {
    "name": "M. Mime de Galar → M. Glaquette",
    "members": [
      4122,
      866
    ]
  },
  "866": {
    "name": "M. Mime de Galar → M. Glaquette",
    "members": [
      4122,
      866
    ]
  },
  "6211": {
    "name": "Qwilfish de Hisui → Qwilpik",
    "members": [
      6211,
      904
    ]
  },
  "904": {
    "name": "Qwilfish de Hisui → Qwilpik",
    "members": [
      6211,
      904
    ]
  },
  "6550": {
    "name": "Bargantua à Rayures Blanches → Paragruel",
    "members": [
      6550,
      902
    ]
  },
  "902": {
    "name": "Bargantua à Rayures Blanches → Paragruel",
    "members": [
      6550,
      902
    ]
  },
  "8194": {
    "name": "Axoloto de Paldea → Terraiste",
    "members": [
      8194,
      980
    ]
  },
  "980": {
    "name": "Axoloto de Paldea → Terraiste",
    "members": [
      8194,
      980
    ]
  },
  "868": {
    "name": "Crèmy → Charmilly",
    "members": [
      868,
      869
    ]
  },
  "872": {
    "name": "Frissonille → Beldeneige",
    "members": [
      872,
      873
    ]
  },
  "878": {
    "name": "Charibari → Pachyradjah",
    "members": [
      878,
      879
    ]
  },
  "884": {
    "name": "Duralugon → Pondralugon",
    "members": [
      884,
      1018
    ]
  },
  "885": {
    "name": "Fantyrm → Dispareptil → Lanssorien",
    "members": [
      885,
      886,
      887
    ]
  },
  "891": {
    "name": "Wushours → Shifours",
    "members": [
      891,
      892
    ]
  },
  "906": {
    "name": "Poussacha → Matourgeon → Miascarade",
    "members": [
      906,
      907,
      908
    ]
  },
  "909": {
    "name": "Chochodile → Crocogril → Flâmigator",
    "members": [
      909,
      910,
      911
    ]
  },
  "912": {
    "name": "Coiffeton → Canarbello → Palmaval",
    "members": [
      912,
      913,
      914
    ]
  },
  "915": {
    "name": "Gourmelet → Fragroin",
    "members": [
      915,
      916
    ]
  },
  "917": {
    "name": "Tissenboule → Filentrappe",
    "members": [
      917,
      918
    ]
  },
  "919": {
    "name": "Lilliterre → Gambex",
    "members": [
      919,
      920
    ]
  },
  "921": {
    "name": "Pohm → Pohmotte → Pohmarmotte",
    "members": [
      921,
      922,
      923
    ]
  },
  "924": {
    "name": "Compagnol → Famignol",
    "members": [
      924,
      925
    ]
  },
  "926": {
    "name": "Pâtachiot → Briochien",
    "members": [
      926,
      927
    ]
  },
  "928": {
    "name": "Olivini → Olivado → Arboliva",
    "members": [
      928,
      929,
      930
    ]
  },
  "932": {
    "name": "Selstin → Amonbiste → Gigansel",
    "members": [
      932,
      933,
      934
    ]
  },
  "935": {
    "name": "Charbambin → Carmadura / Malvalame",
    "members": [
      935,
      936,
      937
    ]
  },
  "938": {
    "name": "Têtampoule → Ampibidou",
    "members": [
      938,
      939
    ]
  },
  "940": {
    "name": "Zapétrel → Fulgulairo",
    "members": [
      940,
      941
    ]
  },
  "942": {
    "name": "Grondogue → Dogrino",
    "members": [
      942,
      943
    ]
  },
  "944": {
    "name": "Gribouraigne → Tag-Tag",
    "members": [
      944,
      945
    ]
  },
  "946": {
    "name": "Viroquin → Virevorreur",
    "members": [
      946,
      947
    ]
  },
  "948": {
    "name": "Léboulérou → Bérasca",
    "members": [
      948,
      949
    ]
  },
  "951": {
    "name": "Pimentin → Scovilain",
    "members": [
      951,
      952
    ]
  },
  "955": {
    "name": "Flotillon → Cléopsytra",
    "members": [
      955,
      956
    ]
  },
  "957": {
    "name": "Forgella → Forgeline → Forgelina",
    "members": [
      957,
      958,
      959
    ]
  },
  "960": {
    "name": "Taupikeur → Trioppikeur",
    "members": [
      960,
      961
    ]
  },
  "963": {
    "name": "Dofin → Superdofin",
    "members": [
      963,
      964
    ]
  },
  "965": {
    "name": "Vrombi → Vrombotor",
    "members": [
      965,
      966
    ]
  },
  "968": {
    "name": "Germéclat → Floréclat",
    "members": [
      968,
      969
    ]
  },
  "970": {
    "name": "Toutombe → Tomberro",
    "members": [
      970,
      971
    ]
  },
  "996": {
    "name": "Frigodo → Glaçodo → Glaivodo",
    "members": [
      996,
      997,
      998
    ]
  },
  "999": {
    "name": "Mordudor → Gromago",
    "members": [
      999,
      1000
    ]
  },
  "1012": {
    "name": "Poltchageist → Théffroyable",
    "members": [
      1012,
      1013
    ]
  }
},
    memberToRoot: {},
    speciesNames: {},
    branchedPrevolutions: {
      // 43: Mystherbe -> Ortide -> Rafflesia (45) / Joliflor (182)
      44: 43, 45: 44, 182: 44,
      // 60: Ptitard -> Têtarte -> Tartard (62) / Tarpaud (186)
      61: 60, 62: 61, 186: 61,
      // 79: Ramoloss -> Flagadoss (80) / Roigada (199)
      80: 79, 199: 79,
      // 123: Insécateur -> Cizayox (212) / Hachécateur (900)
      212: 123, 900: 123,
      // 133: Évoli -> Aquali (134), Voltali (135), Pyroli (136), Mentali (196), Noctali (197), Phyllali (470), Givrali (471), Nymphali (700)
      134: 133, 135: 133, 136: 133, 196: 133, 197: 133, 470: 133, 471: 133, 700: 133,
      // 236: Debugant -> Kicklee (106) / Tygnon (107) / Kapoera (237)
      106: 236, 107: 236, 237: 236,
      // 265: Chenipotte -> Armulys (266) -> Charmillon (267) / Blindalys (268) -> Papinox (269)
      266: 265, 267: 266, 268: 265, 269: 268,
      // 280: Tarsal -> Kirlia (281) -> Gardevoir (282) / Gallame (475)
      281: 280, 282: 281, 475: 281,
      // 290: Ningale -> Ninjask (291) / Munja (292)
      291: 290, 292: 290,
      // 361: Stalgamin -> Oniglali (362) / Momartik (478)
      362: 361, 478: 361,
      // 366: Coquiperl -> Serpang (367) / Rosabyss (368)
      367: 366, 368: 366,
      // 412: Cheniti -> Cheniselle (413) / Papilord (414)
      413: 412, 414: 412,
      // 789: Cosmog -> Cosmoem (790) -> Solgaleo (791) / Lunala (792)
      790: 789, 791: 790, 792: 790,
      // 840: Verpom -> Pomdrapi (841) / Dratatin (842) / Pomdramour (1011) -> Pomdorochi (1019)
      841: 840, 842: 840, 1011: 840, 1019: 1011,
      // 935: Charbambin -> Carmadura (936) / Malvalame (937)
      936: 935, 937: 935
    },
    megaFamilies: {
      3: { suffix: '(Méga)', defaultMegaSpriteId: 10033 },
      6: { suffix: '(Méga X / Y)', defaultMegaSpriteId: 10034 },
      9: { suffix: '(Méga)', defaultMegaSpriteId: 10036 },
      15: { suffix: '(Méga)', defaultMegaSpriteId: 10090 },
      18: { suffix: '(Méga)', defaultMegaSpriteId: 10073 },
      65: { suffix: '(Méga)', defaultMegaSpriteId: 10037 },
      80: { suffix: '(Méga)', defaultMegaSpriteId: 10074 },
      94: { suffix: '(Méga)', defaultMegaSpriteId: 10038 },
      115: { suffix: '(Méga)', defaultMegaSpriteId: 10039 },
      127: { suffix: '(Méga)', defaultMegaSpriteId: 10040 },
      130: { suffix: '(Méga)', defaultMegaSpriteId: 10041 },
      142: { suffix: '(Méga)', defaultMegaSpriteId: 10042 },
      150: { suffix: '(Méga X / Y)', defaultMegaSpriteId: 10043 },
      181: { suffix: '(Méga)', defaultMegaSpriteId: 10045 },
      208: { suffix: '(Méga)', defaultMegaSpriteId: 10075 },
      212: { suffix: '(Méga)', defaultMegaSpriteId: 10046 },
      214: { suffix: '(Méga)', defaultMegaSpriteId: 10047 },
      229: { suffix: '(Méga)', defaultMegaSpriteId: 10048 },
      248: { suffix: '(Méga)', defaultMegaSpriteId: 10049 },
      254: { suffix: '(Méga)', defaultMegaSpriteId: 10065 },
      257: { suffix: '(Méga)', defaultMegaSpriteId: 10050 },
      260: { suffix: '(Méga)', defaultMegaSpriteId: 10064 },
      282: { suffix: '(Méga)', defaultMegaSpriteId: 10051 },
      302: { suffix: '(Méga)', defaultMegaSpriteId: 10066 },
      303: { suffix: '(Méga)', defaultMegaSpriteId: 10052 },
      306: { suffix: '(Méga)', defaultMegaSpriteId: 10053 },
      308: { suffix: '(Méga)', defaultMegaSpriteId: 10054 },
      310: { suffix: '(Méga)', defaultMegaSpriteId: 10055 },
      319: { suffix: '(Méga)', defaultMegaSpriteId: 10070 },
      323: { suffix: '(Méga)', defaultMegaSpriteId: 10071 },
      334: { suffix: '(Méga)', defaultMegaSpriteId: 10067 },
      354: { suffix: '(Méga)', defaultMegaSpriteId: 10056 },
      359: { suffix: '(Méga)', defaultMegaSpriteId: 10057 },
      362: { suffix: '(Méga)', defaultMegaSpriteId: 10078 },
      373: { suffix: '(Méga)', defaultMegaSpriteId: 10089 },
      376: { suffix: '(Méga)', defaultMegaSpriteId: 10076 },
      380: { suffix: '(Méga)', defaultMegaSpriteId: 10062 },
      381: { suffix: '(Méga)', defaultMegaSpriteId: 10063 },
      384: { suffix: '(Méga)', defaultMegaSpriteId: 10079 },
      428: { suffix: '(Méga)', defaultMegaSpriteId: 10088 },
      445: { suffix: '(Méga)', defaultMegaSpriteId: 10058 },
      448: { suffix: '(Méga)', defaultMegaSpriteId: 10059 },
      460: { suffix: '(Méga)', defaultMegaSpriteId: 10060 },
      475: { suffix: '(Méga)', defaultMegaSpriteId: 10068 },
      531: { suffix: '(Méga)', defaultMegaSpriteId: 10069 },
      719: { suffix: '(Méga)', defaultMegaSpriteId: 10077 }
    },
    staticSpeciesNames: {
      // Gen 1
      83: 'Canarticho', 115: 'Kangourex', 127: 'Scarabrute', 128: 'Tauros',
      131: 'Lokhlass', 132: 'Métamorph', 142: 'Ptéra', 143: 'Ronflex',
      144: 'Artikodin', 145: 'Électhor', 146: 'Sulfura', 150: 'Mewtwo', 151: 'Mew',
      // Gen 2
      206: 'Insolourdo', 211: 'Qwilfish', 213: 'Caratroc', 214: 'Scarhino',
      222: 'Corayon', 225: 'Cadoizo', 227: 'Airmure', 235: 'Queulorior', 241: 'Écrémeuh',
      243: 'Raikou', 244: 'Entei', 245: 'Suicune', 249: 'Lugia', 250: 'Ho-Oh', 251: 'Celebi',
      // Gen 3
      302: 'Ténéfix', 303: 'Mysdibule', 311: 'Posipi', 312: 'Négapi', 313: 'Muciole', 314: 'Lumivole',
      324: 'Chartor', 327: 'Spinda', 335: 'Mangriff', 336: 'Séviper', 337: 'Séléroc', 338: 'Solaroc',
      351: 'Morpheo', 352: 'Kékéon', 357: 'Tropius', 358: 'Éoko', 359: 'Absol',
      369: 'Relicanth', 370: 'Lovdisc',
      377: 'Regirock', 378: 'Regice', 379: 'Registeel',
      380: 'Latias', 381: 'Latios', 382: 'Kyogre', 383: 'Groudon', 384: 'Rayquaza',
      385: 'Jirachi', 386: 'Deoxys',
      // Gen 4
      417: 'Pachirisu', 441: 'Pijako', 442: 'Spiritomb', 455: 'Vortente', 479: 'Motisma',
      480: 'Créhelf', 481: 'Créfollet', 482: 'Créfadet',
      483: 'Dialga', 484: 'Palkia', 485: 'Heatran', 486: 'Regigigas', 487: 'Giratina',
      488: 'Cresselia', 489: 'Phione', 490: 'Manaphy', 491: 'Darkrai', 492: 'Shaymin', 493: 'Arceus',
      // Gen 5
      494: 'Victini', 531: 'Nanméouïe', 538: 'Judokrak', 539: 'Karaclée', 550: 'Bargantua',
      556: 'Maracachi', 561: 'Cryptéro', 587: 'Émolga', 594: 'Mamanbo', 626: 'Frison',
      631: 'Aflamanoir', 632: 'Fermite',
      638: 'Cobaltium', 639: 'Terrakium', 640: 'Viridium',
      641: 'Boréas', 642: 'Fulguris', 643: 'Reshiram', 644: 'Zekrom',
      645: 'Démétéros', 646: 'Kyurem', 647: 'Keldeo', 648: 'Meloetta', 649: 'Genesect',
      // Gen 6
      676: 'Couafarel', 701: 'Brutalibré', 703: 'Strassie', 707: 'Trousselin',
      716: 'Xerneas', 717: 'Yveltal', 718: 'Zygarde', 719: 'Diancie', 720: 'Hoopa', 721: 'Volcanion',
      // Gen 7
      741: 'Plumeline', 746: 'Froussardine', 764: 'Guérilande', 765: 'Gouroutan', 766: 'Quartermac',
      771: 'Concombaffe', 772: 'Type:0', 773: 'Silvallié',
      774: 'Météno', 775: 'Dodoala', 776: 'Boumata', 777: 'Togedemaru',
      778: 'Mimiqui', 779: 'Denticrisse', 780: 'Draïeul', 781: 'Sinistrail',
      785: 'Tokorico', 786: 'Tokopiyon', 787: 'Tokotoro', 788: 'Tokopisco',
      789: 'Cosmog', 790: 'Cosmoem', 791: 'Solgaleo', 792: 'Lunala',
      793: 'Zéroïd', 794: 'Mouscoto', 795: 'Cancrelove', 796: 'Câblifère',
      797: 'Bamboiselle', 798: 'Katagami', 799: 'Engloutyran',
      800: 'Necrozma', 801: 'Magearna', 802: 'Marshadow',
      803: 'Vémini', 804: 'Mandrillon', 805: 'Pierroteknik', 806: 'Ama-Ama', 807: 'Zeraora',
      808: 'Meltan', 809: 'Melmetal',
      // Gen 8
      845: 'Nigosier', 870: 'Hexadron', 871: 'Wattapik', 874: 'Dolman', 875: 'Bekaglaçon',
      877: 'Morpeko', 884: 'Duralugon',
      888: 'Zacian', 889: 'Zamazenta', 890: 'Éthernatos', 891: 'Wushours', 892: 'Shifours',
      893: 'Zarude', 894: 'Regieleki', 895: 'Regidrago', 896: 'Blizzeval', 897: 'Spectreval', 898: 'Sylveroy',
      905: 'Amovénus',
      // Gen 9
      931: 'Tapatoès', 950: 'Craparoi', 962: 'Lestombaile', 967: 'Motorizard',
      969: 'Germéclat', 973: 'Flamirouette', 976: 'Delestin', 977: 'Oyacata', 978: 'Nigirigon',
      // Paradox
      984: 'Fort-Ivoire', 985: 'Hurle-Queue', 986: 'Fongus-Furie', 987: 'Flotte-Mèche', 988: 'Rampe-Ailes', 989: 'Pelage-Sablé',
      990: 'Roue-de-Fer', 991: 'Hotte-de-Fer', 992: 'Paume-de-Fer', 993: 'Têtes-de-Fer', 994: 'Mite-de-Fer', 995: 'Épine-de-Fer',
      1005: 'Rugit-Lune', 1006: 'Garde-de-Fer',
      // Légendaires Gen 9
      1001: 'Chongjian', 1002: 'Baojian', 1003: 'Dinglu', 1004: 'Yuyu',
      1007: 'Koraidon', 1008: 'Miraidon',
      1009: 'Serpente-Eau', 1010: 'Grat-de-Fer',
      1014: 'Félicanis', 1015: 'Fortusimia', 1016: 'Favianos', 1017: 'Ogerpon',
      1020: 'Goulette-Feu', 1021: 'Ire-Foudre', 1022: 'Roc-de-Fer', 1023: 'Chef-de-Fer',
      1024: 'Terapagos', 1025: 'Pêchaminus'
    },
    init() {
      // Charger d'abord tous les noms d'espèces statiques (légendaires, sans-évo, etc.)
      if (this.staticSpeciesNames) {
        for (const [idStr, name] of Object.entries(this.staticSpeciesNames)) {
          this.speciesNames[Number(idStr)] = name;
        }
      }

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
                this.speciesNames[m] = rawNames[i];
              });
            } else if (fam.members.length === 1 && rawNames.length > 1) {
              this.speciesNames[fam.members[0]] = rawNames[rawNames.length - 1];
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
    getSpeciesName(speciesId) {
      if (!speciesId) return '';
      if (this.speciesNames[speciesId]) return this.speciesNames[speciesId];
      const sid = Number(speciesId);
      if (this.speciesNames[sid]) return this.speciesNames[sid];
      if (this.staticSpeciesNames && this.staticSpeciesNames[sid]) {
        this.speciesNames[sid] = this.staticSpeciesNames[sid];
        return this.staticSpeciesNames[sid];
      }

      // Interrogation dynamique du registre du jeu PokéRogue
      try {
        const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
        const scene = PokeSkip.scene || win.globalScene;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry
                    || (scene && scene.speciesDataRegistry)
                    || (scene && scene.gameData && scene.gameData.speciesDataRegistry);
        if (sdr) {
          const sp = sdr.data ? sdr.data[sid] : (typeof sdr.get === 'function' ? sdr.get(sid) : null);
          if (sp) {
            const n = typeof sp.getName === 'function' ? sp.getName() : (sp.name || sp.speciesName);
            if (n && typeof n === 'string') {
              this.speciesNames[sid] = n;
              return n;
            }
          }
        }
      } catch (_) {}

      // Vérifier les règles sauvegardées
      if (typeof PokeSkip !== 'undefined' && PokeSkip.rules && PokeSkip.rules[sid] && PokeSkip.rules[sid].lineageName) {
        const ln = PokeSkip.rules[sid].lineageName;
        if (ln && !ln.startsWith('Espèce #') && !ln.startsWith('Lignée #')) {
          this.speciesNames[sid] = ln;
          return ln;
        }
      }

      // Formes régionales automatiques
      if (sid >= 4000 && sid < 6000) {
        const base = this.getSpeciesName(sid - 4000);
        if (base) return `${base} de Galar`;
      }
      if (sid >= 2000 && sid < 4000) {
        const base = this.getSpeciesName(sid - 2000);
        if (base) return `${base} d'Alola`;
      }
      if (sid >= 6000 && sid < 8000) {
        const base = this.getSpeciesName(sid - 6000);
        if (base) return `${base} de Hisui`;
      }
      if (sid >= 8000 && sid < 10000) {
        const base = this.getSpeciesName(sid - 8000);
        if (base) return `${base} de Paldea`;
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
        const name = this.getSpeciesName(mId) || (pokemon && mId === currentSpeciesId ? (pokemon.species?.name || pokemon.name) : `Espèce #${mId}`);
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
  LineageManager.init();

  // --- STATE & STORE ---
  const PokeSkip = {
    rules: Storage.get(STORAGE_KEY, {}),
    settings: Object.assign({
      enabled: true,
      showToasts: true,
      toastDuration: 2800,
      soundFeedback: false,
      showQuickPrompt: true,
      quickPromptDuration: 15,
      showHudCount: true,
      advancedMode: false
    }, Storage.get(SETTINGS_KEY, {})),
    stats: Storage.get(STATS_KEY, {
      totalSkipped: 0,
      currentSeed: null,
      runSkipped: 0
    }),
    game: null,
    scene: null,
    hooked: false,
    activeParty: [],
    knownMovesCache: {},

    saveRules() {
      Storage.set(STORAGE_KEY, this.rules);
    },
    saveSettings() {
      Storage.set(SETTINGS_KEY, this.settings);
    },
    saveStats() {
      Storage.set(STATS_KEY, this.stats);
    },

    getCurrentRunSeed() {
      try {
        const sc = this.scene || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.globalScene : window.globalScene);
        if (sc && sc.seed) return String(sc.seed);
      } catch (e) {}
      return 'default_session';
    },

    getRunSkippedCount() {
      const seed = this.getCurrentRunSeed();
      if (this.stats.currentSeed !== seed) {
        this.stats.currentSeed = seed;
        this.stats.runSkipped = 0;
        this.saveStats();
      }
      return this.stats.runSkipped || 0;
    },

    recordSkip() {
      this.stats.totalSkipped = (this.stats.totalSkipped || 0) + 1;
      const seed = this.getCurrentRunSeed();
      if (this.stats.currentSeed !== seed) {
        this.stats.currentSeed = seed;
        this.stats.runSkipped = 0;
      }
      this.stats.runSkipped = (this.stats.runSkipped || 0) + 1;
      this.saveStats();
      UI.updateHudBadge();
    },

    migrateRules() {
      let changed = false;
      const newRules = {};

      // 1. D'abord initialiser toutes les règles déjà au format family_
      for (const [key, rule] of Object.entries(this.rules)) {
        if (!rule) continue;
        if (key.startsWith('family_')) {
          newRules[key] = {
            familyId: rule.familyId,
            lineageName: rule.lineageName,
            skippedMoves: Object.assign({}, rule.skippedMoves || {}),
            skipAll: !!rule.skipAll,
            enabled: rule.enabled !== false,
            replacements: Array.isArray(rule.replacements) ? rule.replacements.slice() : [],
            updatedAt: rule.updatedAt || Date.now()
          };
        }
      }

      // 2. Ensuite migrer et fusionner les anciennes règles (ex: IDs d'évolutions séparés)
      for (const [key, rule] of Object.entries(this.rules)) {
        if (!rule || key.startsWith('family_')) continue;
        changed = true;
        const spId = parseInt(rule.speciesId || key, 10);
        const familyInfo = LineageManager.getFamilyInfo(isNaN(spId) ? key : spId, rule.speciesName);
        const famKey = familyInfo.familyKey;

        if (!newRules[famKey]) {
          newRules[famKey] = {
            familyId: familyInfo.rootId,
            lineageName: familyInfo.lineageName,
            skippedMoves: {},
            skipAll: !!rule.skipAll,
            enabled: rule.enabled !== false,
            replacements: Array.isArray(rule.replacements) ? rule.replacements.slice() : [],
            updatedAt: rule.updatedAt || Date.now()
          };
        }
        if (rule.skippedMoves) {
          Object.assign(newRules[famKey].skippedMoves, rule.skippedMoves);
        }
        if (rule.skipAll) {
          newRules[famKey].skipAll = true;
        }
      }

      if (changed) {
        this.rules = newRules;
        this.saveRules();
      }
    },

    getFamilyRule(target) {
      if (!target && target !== 0) return null;
      const key = LineageManager.getFamilyKey(target);
      return this.rules[key] || null;
    },

    getSpeciesRule(target) {
      return this.getFamilyRule(target);
    },

    isFamilyRuleEnabled(target) {
      const rule = this.getFamilyRule(target);
      if (!rule) return true;
      return rule.enabled !== false;
    },

    toggleFamilyRuleEnabled(target) {
      const familyInfo = LineageManager.getFamilyInfo(target);
      const famKey = familyInfo.familyKey;
      if (!this.rules[famKey]) {
        this.rules[famKey] = {
          familyId: familyInfo.rootId,
          lineageName: familyInfo.lineageName,
          skippedMoves: {},
          skipAll: false,
          enabled: false,
          replacements: [],
          updatedAt: Date.now()
        };
      } else {
        this.rules[famKey].enabled = (this.rules[famKey].enabled === false);
        this.rules[famKey].updatedAt = Date.now();
      }
      this.saveRules();
      return this.rules[famKey].enabled;
    },

    isMoveSkipped(target, moveName, moveId) {
      if (!this.settings.enabled) return false;
      const rule = this.getFamilyRule(target);
      if (!rule) return false; // Par défaut : RIEN n'est skip !
      if (rule.enabled === false) return false; // Paramétrage suspendu / en pause pour cette lignée
      if (rule.skipAll) return true;
      if (!rule.skippedMoves) return false;

      if (moveName && rule.skippedMoves[moveName.trim().toLowerCase()]) return true;
      if (moveId && rule.skippedMoves[`id_${moveId}`]) return true;

      return false;
    },

    setMoveSkipped(target, speciesName, moveName, moveId, isSkipped) {
      const familyInfo = LineageManager.getFamilyInfo(target, speciesName);
      const familyKey = familyInfo.familyKey;
      if (!this.rules[familyKey]) {
        this.rules[familyKey] = {
          familyId: familyInfo.rootId,
          lineageName: familyInfo.lineageName,
          skippedMoves: {},
          skipAll: false,
          enabled: true,
          replacements: [],
          updatedAt: Date.now()
        };
      }
      const rule = this.rules[familyKey];
      if (familyInfo.lineageName) rule.lineageName = familyInfo.lineageName;

      const key = moveName ? moveName.trim().toLowerCase() : `id_${moveId}`;
      if (isSkipped) {
        rule.skippedMoves[key] = true;
        if (moveId) rule.skippedMoves[`id_${moveId}`] = true;
      } else {
        delete rule.skippedMoves[key];
        if (moveId) delete rule.skippedMoves[`id_${moveId}`];
      }
      rule.updatedAt = Date.now();
      this.saveRules();
    },

    deleteFamilyRule(familyKey) {
      if (this.rules[familyKey]) {
        delete this.rules[familyKey];
        this.saveRules();
      }
    },

    deleteSpeciesRule(target) {
      const key = LineageManager.getFamilyKey(target);
      this.deleteFamilyRule(key);
    },

    getFamilyReplacements(target) {
      const rule = this.getFamilyRule(target);
      return (rule && Array.isArray(rule.replacements)) ? rule.replacements : [];
    },

    addReplacementRule(target, newMoveName, arg2, arg3 = null, arg4 = null) {
      let oldMoveName = '';
      let newMoveId = null;
      let oldMoveId = null;

      if (typeof arg2 === 'string') {
        oldMoveName = arg2;
        newMoveId = arg3;
        oldMoveId = arg4;
      } else {
        newMoveId = arg2;
        oldMoveName = typeof arg3 === 'string' ? arg3 : '';
        oldMoveId = arg4;
      }

      if (!newMoveName || !oldMoveName) return null;

      const familyInfo = LineageManager.getFamilyInfo(target);
      const famKey = familyInfo.familyKey;
      if (!this.rules[famKey]) {
        this.rules[famKey] = {
          familyId: familyInfo.rootId,
          lineageName: familyInfo.lineageName,
          skippedMoves: {},
          skipAll: false,
          replacements: [],
          updatedAt: Date.now()
        };
      }
      if (!Array.isArray(this.rules[famKey].replacements)) {
        this.rules[famKey].replacements = [];
      }

      // Supprimer une éventuelle règle déjà existante sur la même nouvelle attaque
      this.rules[famKey].replacements = this.rules[famKey].replacements.filter(
        r => r.newMoveName.trim().toLowerCase() !== newMoveName.trim().toLowerCase()
      );

      const ruleObj = {
        id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        newMoveName: newMoveName.trim(),
        newMoveId: newMoveId || null,
        oldMoveName: oldMoveName.trim(),
        oldMoveId: oldMoveId || null,
        enabled: true,
        createdAt: Date.now()
      };

      this.rules[famKey].replacements.push(ruleObj);
      this.rules[famKey].updatedAt = Date.now();
      this.saveRules();
      return ruleObj;
    },

    toggleReplacementRule(target, ruleId, enabled) {
      const rule = this.getFamilyRule(target);
      if (!rule || !Array.isArray(rule.replacements)) return false;
      const r = rule.replacements.find(item => item.id === ruleId);
      if (r) {
        r.enabled = enabled !== undefined ? enabled : !r.enabled;
        rule.updatedAt = Date.now();
        this.saveRules();
        return true;
      }
      return false;
    },

    deleteReplacementRule(target, ruleId) {
      const rule = this.getFamilyRule(target);
      if (!rule || !Array.isArray(rule.replacements)) return false;
      rule.replacements = rule.replacements.filter(item => item.id !== ruleId);
      rule.updatedAt = Date.now();
      this.saveRules();
      return true;
    },

    clearAllReplacements(target) {
      const rule = this.getFamilyRule(target);
      if (!rule) return false;
      rule.replacements = [];
      rule.updatedAt = Date.now();
      this.saveRules();
      return true;
    },

    findActiveReplacement(target, incomingMoveName, incomingMoveId) {
      if (!this.settings.enabled || !this.settings.advancedMode) return null;
      const rule = this.getFamilyRule(target);
      if (!rule || !Array.isArray(rule.replacements)) return null;
      if (rule.enabled === false) return null; // Paramétrage suspendu / en pause pour cette lignée

      const incName = incomingMoveName ? incomingMoveName.trim().toLowerCase() : '';
      return rule.replacements.find(r => {
        if (!r.enabled) return false;
        if (incName && r.newMoveName.trim().toLowerCase() === incName) return true;
        if (incomingMoveId && r.newMoveId && r.newMoveId === incomingMoveId) return true;
        return false;
      }) || null;
    }
  };

  // --- GAME ENGINE HOOKS ---
  function initGameHook() {
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    function findPhaserScene() {
      try {
        if (win.Phaser) {
          if (win.Phaser.Display?.Canvas?.CanvasPool?.pool?.[0]?.parent?.game) {
            const g = win.Phaser.Display.Canvas.CanvasPool.pool[0].parent.game;
            const sc = g.scene?.getScene('battle') || g.scene?.scenes?.find(s => s.scene?.key === 'battle' || s.phaseManager);
            if (sc && sc.phaseManager) return { game: g, scene: sc };
          }
          if (win.Phaser.GAMES && win.Phaser.GAMES.length > 0) {
            for (const g of win.Phaser.GAMES) {
              if (!g || !g.scene) continue;
              const sc = g.scene.getScene('battle') || g.scene.scenes?.find(s => s.scene?.key === 'battle' || s.phaseManager);
              if (sc && sc.phaseManager) return { game: g, scene: sc };
            }
          }
        }

        const canvas = document.querySelector('#app canvas') || document.querySelector('canvas');
        if (canvas) {
          const g = canvas.__game || canvas.game;
          if (g && g.scene) {
            const sc = g.scene.getScene('battle') || g.scene.scenes?.find(s => s.scene?.key === 'battle' || s.phaseManager);
            if (sc && sc.phaseManager) return { game: g, scene: sc };
          }
        }
      } catch (e) {
        console.warn('[PokeSkip] Erreur recherche scene:', e);
      }
      return null;
    }

    function checkAndHook() {
      if (PokeSkip.hooked) return;

      const found = findPhaserScene();
      if (!found) {
        setTimeout(checkAndHook, 800);
        return;
      }

      PokeSkip.game = found.game;
      PokeSkip.scene = found.scene;
      PokeSkip.migrateRules();
      applyPhaseManagerHooks(found.scene);
      PokeSkip.hooked = true;
      console.log('🎉 [PokéSkip] Connecté avec succès à PokéRogue !');
      UI.showToast('PokéSkip activé et prêt !', 'success', 2000);
      UI.updateHudBadge();
    }

    checkAndHook();
  }

  function applyPhaseManagerHooks(scene) {
    const pm = scene.phaseManager;
    if (!pm) return;

    function inspectPhase(phase) {
      if (!phase) return;
      if (phase.phaseName === 'LearnMovePhase' || phase.is?.('LearnMovePhase')) {
        hookLearnMovePhasePrototype(Object.getPrototypeOf(phase));
      }
    }

    if (pm.unshiftPhase && !pm._pokeskipHookedUnshift) {
      const origUnshift = pm.unshiftPhase.bind(pm);
      pm.unshiftPhase = function (...phases) {
        for (const p of phases) inspectPhase(p);
        return origUnshift(...phases);
      };
      pm._pokeskipHookedUnshift = true;
    }

    if (pm.pushPhase && !pm._pokeskipHookedPush) {
      const origPush = pm.pushPhase.bind(pm);
      pm.pushPhase = function (...phases) {
        for (const p of phases) inspectPhase(p);
        return origPush(...phases);
      };
      pm._pokeskipHookedPush = true;
    }

    if (pm.shiftPhase && !pm._pokeskipHookedShift) {
      const origShift = pm.shiftPhase.bind(pm);
      pm.shiftPhase = function () {
        const res = origShift();
        const curr = pm.getCurrentPhase ? pm.getCurrentPhase() : pm.currentPhase;
        if (curr) inspectPhase(curr);
        return res;
      };
      pm._pokeskipHookedShift = true;
    }
  }

  function hookLearnMovePhasePrototype(proto) {
    if (!proto || proto._pokeskipHooked) return;
    proto._pokeskipHooked = true;

    // Fermeture automatique du prompt dès que LearnMovePhase se termine (évite tout débordement sur la phase de récompense)
    // Protection anti-double appel de end()
    const origEnd = proto.end;
    if (typeof origEnd === 'function') {
      proto.end = function () {
        UI.dismissQuickSkipPrompt();
        if (this._pokeskipEnded) return;
        this._pokeskipEnded = true;
        if (typeof this._restoreUi === 'function') {
          this._restoreUi();
        }
        return origEnd.apply(this, arguments);
      };
    }

    const origReplaceMoveCheck = proto.replaceMoveCheck;
    proto.replaceMoveCheck = async function (move, pokemon) {
      if (move && move.id && move.name) {
        PokeSkip.knownMovesCache[move.id] = move.name;
      }

      // learnMoveType: 0 = LEARN_MOVE (level up / evolution), 1 = MEMORY, 2 = TM
      const isLevelUpMove = this.learnMoveType === 0 || this.learnMoveType === undefined;

      if (PokeSkip.settings.enabled && isLevelUpMove) {
        const familyInfo = LineageManager.getFamilyInfo(pokemon);
        const moveName = move?.name || `Move #${this.moveId}`;

        if (PokeSkip.isMoveSkipped(pokemon, moveName, this.moveId)) {
          PokeSkip.recordSkip();

          if (PokeSkip.settings.showToasts) {
            UI.showToast(
              `⏭️ <b>${familyInfo.lineageName}</b> a ignoré <i>${moveName}</i> (Règle mémorisée)`,
              'info',
              PokeSkip.settings.toastDuration
            );
          }

          this.end();
          return;
        }

        // 2. Mode Avancé : Remplacement automatique d'attaque si configuré
        if (PokeSkip.settings.advancedMode) {
          const currentMoveset = typeof pokemon.getMoveset === 'function' ? pokemon.getMoveset() : (pokemon.moveset || []);
          if (currentMoveset && currentMoveset.length === 4) {
            const replRule = PokeSkip.findActiveReplacement(pokemon, moveName, this.moveId);
            if (replRule && replRule.oldMoveName) {
              const targetOld = replRule.oldMoveName.trim().toLowerCase();
              let replaceIndex = -1;
              let foundOldName = '';

              for (let i = 0; i < currentMoveset.length; i++) {
                const m = currentMoveset[i];
                if (!m) continue;
                let mName = '';
                if (typeof m.getName === 'function') mName = m.getName();
                else if (typeof m.getMove === 'function') mName = m.getMove()?.name || '';
                else if (m.name) mName = m.name;
                else if (PokeSkip.knownMovesCache[m.moveId || m.id]) mName = PokeSkip.knownMovesCache[m.moveId || m.id];

                if (mName && mName.trim().toLowerCase() === targetOld) {
                  replaceIndex = i;
                  foundOldName = mName;
                  break;
                }
                if (replRule.oldMoveId && (m.moveId === replRule.oldMoveId || m.id === replRule.oldMoveId)) {
                  replaceIndex = i;
                  foundOldName = mName || replRule.oldMoveName;
                  break;
                }
              }

              if (replaceIndex !== -1) {
                console.log(`⚡ [PokeSkip] Remplacement auto : ${moveName} remplace ${foundOldName} (slot ${replaceIndex})`);
                if (PokeSkip.settings.showToasts) {
                  UI.showToast(
                    `⚡ [PokéSkip] <b>${moveName}</b> a remplacé <i>${foundOldName}</i> sur <b>${familyInfo.lineageName}</b> !`,
                    'success',
                    PokeSkip.settings.toastDuration || 3500
                  );
                }

                if (typeof this.learnMove === 'function') {
                  return this.learnMove(replaceIndex, move, pokemon);
                } else if (typeof pokemon.learnMove === 'function') {
                  pokemon.learnMove(this.moveId, replaceIndex);
                  this.end();
                  return;
                }
              } else {
                console.log(`⚡ [PokeSkip] Règle active trouvée pour ${moveName}, mais ${replRule.oldMoveName} n'est pas connue par le Pokémon. La main est laissée au joueur.`);
              }
            }
          }
        }

        // Si l'attaque n'est pas ignorée et l'option activée : proposer le bouton rapide en haut au milieu
        if (PokeSkip.settings.showQuickPrompt !== false) {
          UI.showQuickSkipPrompt(this, pokemon, move);
        }
      }

      // Si l'utilisateur a déjà cliqué sur "Toujours ignorer" avant que replaceMoveCheck ne démarre :
      if (this._pokeskipIgnored) {
        this.end();
        return;
      }

      const phase = this;
      const scene = phase.scene || PokeSkip.scene || window.globalScene;
      const ui = scene?.ui;

      if (ui && typeof ui.showTextPromise === 'function') {
        const origShowTextPromise = ui.showTextPromise;
        const origSetModeWithoutClear = ui.setModeWithoutClear;

        // Interception des affichages pour cette phase afin de neutraliser la demande d'apprentissage si ignorée
        ui.showTextPromise = async function (text, callbackDelay, prompt, promptDelay) {
          if (phase._pokeskipIgnored) {
            return;
          }
          return origShowTextPromise.call(this, text, callbackDelay, prompt, promptDelay);
        };

        if (typeof origSetModeWithoutClear === 'function') {
          ui.setModeWithoutClear = function (mode, ...args) {
            // Si la capacité a été marquée comme ignorée, bloquer l'ouverture du menu [Oui][Non] (mode CONFIRM = 14)
            if (phase._pokeskipIgnored && mode === 14) {
              phase.end();
              return Promise.resolve();
            }
            return origSetModeWithoutClear.call(this, mode, ...args);
          };
        }

        const restoreUi = () => {
          ui.showTextPromise = origShowTextPromise;
          if (origSetModeWithoutClear) ui.setModeWithoutClear = origSetModeWithoutClear;
        };
        phase._restoreUi = restoreUi;

        try {
          return await origReplaceMoveCheck.apply(phase, arguments);
        } finally {
          restoreUi();
        }
      }

      return origReplaceMoveCheck.apply(this, arguments);
    };

    console.log('⚡ [PokeSkip] Prototype LearnMovePhase intercepté avec succès.');
  }

  // --- RÉCUPÉRATION COMPLÈTE DES CAPACITÉS FUTURES & ACTUELLES DE LA LIGNÉE ---
  function getPokemonFullLearnset(pokemon) {
    const moves = [];
    const seenMoveIds = new Set();

    let getMoveFn = null;
    if (pokemon?.moveset && pokemon.moveset.length > 0 && typeof pokemon.moveset[0].getMove === 'function') {
      getMoveFn = pokemon.moveset[0].getMove;
    }
    if (!getMoveFn && PokeSkip.activeParty && Array.isArray(PokeSkip.activeParty)) {
      for (const p of PokeSkip.activeParty) {
        if (p?.moveset && p.moveset.length > 0 && typeof p.moveset[0].getMove === 'function') {
          getMoveFn = p.moveset[0].getMove;
          break;
        }
      }
    }

    function resolveMove(moveId, level, evolutionSpecies = null) {
      let moveObj = null;
      if (getMoveFn) {
        try {
          moveObj = getMoveFn.call({ moveId });
        } catch (e) {}
      }

      const name = moveObj?.name || PokeSkip.knownMovesCache[moveId] || `Capacité #${moveId}`;
      const typeIdx = (moveObj && moveObj.type !== undefined) ? moveObj.type : 0;
      const catIdx = (moveObj && moveObj.category !== undefined) ? moveObj.category : 2;
      const power = (moveObj && moveObj.power > 0) ? moveObj.power : '—';
      let accuracyText = '—';
      if (moveObj && moveObj.accuracy !== undefined) {
        if (moveObj.accuracy > 0) {
          accuracyText = `${moveObj.accuracy}%`;
        } else if (moveObj.accuracy < 0) {
          accuracyText = 'Infaillible';
        } else {
          accuracyText = '—';
        }
      }

      const pp = (moveObj && moveObj.pp !== undefined && moveObj.pp > 0) ? moveObj.pp : ((moveObj && moveObj.maxPp) ? moveObj.maxPp : '—');
      const desc = moveObj?.effect || 'Inflige des dégâts ou applique un effet.';

      return {
        moveId,
        level,
        name,
        type: POKEMON_TYPES[typeIdx] || POKEMON_TYPES[0],
        category: MOVE_CATEGORIES[catIdx] || MOVE_CATEGORIES[2],
        power,
        accuracy: accuracyText,
        pp,
        desc,
        evolutionSpecies: evolutionSpecies || null
      };
    }

    const lineage = LineageManager.getLineageMembers(pokemon);
    const currentSpeciesId = lineage.currentId;

    function getRawLevelMovesForSpecies(targetSpeciesId) {
      if (!targetSpeciesId) return null;

      // 1. Si espèce courante, tenter d'abord les méthodes directes du pokemon
      if (targetSpeciesId === currentSpeciesId) {
        try {
          if (typeof pokemon?.getSpeciesForm === 'function') {
            const sf = pokemon.getSpeciesForm(true);
            if (sf && typeof sf.getLevelMoves === 'function') {
              const res = sf.getLevelMoves();
              if (res && Array.isArray(res) && res.length > 0) return res;
            }
          }
          if (pokemon?.species && typeof pokemon.species.getLevelMoves === 'function') {
            const res = pokemon.species.getLevelMoves();
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {}
      }

      // 2. Tenter d'invoquer getLevelMoves via les prototypes d'espèces
      let sp = pokemon?.species || (typeof pokemon?.getSpeciesForm === 'function' ? pokemon.getSpeciesForm(true) : null);
      if (!sp && PokeSkip.activeParty && PokeSkip.activeParty.length > 0) {
        for (const p of PokeSkip.activeParty) {
          const cand = p?.species || (typeof p?.getSpeciesForm === 'function' ? p.getSpeciesForm(true) : null);
          if (cand && typeof cand.getLevelMoves === 'function') {
            sp = cand;
            break;
          }
        }
      }

      if (sp) {
        try {
          const proto = Object.getPrototypeOf(sp);
          const superProto = proto ? Object.getPrototypeOf(proto) : null;
          if (superProto && typeof superProto.getLevelMoves === 'function') {
            const res = superProto.getLevelMoves.call({ speciesId: targetSpeciesId });
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {}

        try {
          const proto = Object.getPrototypeOf(sp);
          if (proto && typeof proto.getLevelMoves === 'function') {
            const ctx = Object.create(proto);
            ctx.speciesId = targetSpeciesId;
            ctx.formIndex = 0;
            ctx.getFormKey = () => undefined;
            const res = proto.getLevelMoves.call(ctx);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {}

        try {
          if (typeof sp.getLevelMoves === 'function') {
            const ctx = Object.create(sp);
            ctx.speciesId = targetSpeciesId;
            ctx.formIndex = 0;
            ctx.getFormKey = () => undefined;
            const res = sp.getLevelMoves.call(ctx);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {}
      }

      // 3. Registres globaux fenêtre ou scène
      try {
        const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry;
        if (sdr && typeof sdr.getLevelMoves === 'function') {
          const res = sdr.getLevelMoves(targetSpeciesId);
          if (res && Array.isArray(res) && res.length > 0) return res;
        }
      } catch (_) {}

      try {
        const sc = PokeSkip.scene || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.globalScene : window.globalScene);
        if (sc && sc.speciesDataRegistry && typeof sc.speciesDataRegistry.getLevelMoves === 'function') {
          const res = sc.speciesDataRegistry.getLevelMoves(targetSpeciesId);
          if (res && Array.isArray(res) && res.length > 0) return res;
        }
      } catch (_) {}

      return null;
    }

    // 1. Récupérer TOUTES les attaques apprenables de l'espèce courante
    const currentMovesRaw = getRawLevelMovesForSpecies(currentSpeciesId);
    if (currentMovesRaw && Array.isArray(currentMovesRaw)) {
      for (const entry of currentMovesRaw) {
        const lvl = entry[0];
        const moveId = entry[1];
        if (!seenMoveIds.has(moveId)) {
          seenMoveIds.add(moveId);
          moves.push(resolveMove(moveId, lvl > 0 ? lvl : (lvl === 0 ? 'Évolution' : 'Départ'), null));
        }
      }
    }

    // 2. Récupérer les attaques à venir de ses évolutions dans la lignée
    for (const evoId of lineage.futureEvoIds) {
      const evoMovesRaw = getRawLevelMovesForSpecies(evoId);
      if (evoMovesRaw && Array.isArray(evoMovesRaw)) {
        const evoName = LineageManager.getSpeciesName(evoId) || `Évolution #${evoId}`;
        for (const entry of evoMovesRaw) {
          const lvl = entry[0];
          const moveId = entry[1];
          if (!seenMoveIds.has(moveId)) {
            seenMoveIds.add(moveId);
            moves.push(resolveMove(moveId, lvl > 0 ? lvl : (lvl === 0 ? 'Évolution' : 'Départ'), evoName));
          }
        }
      }
    }

    // 3. Récupérer les attaques des autres membres de la lignée (ex: pré-évolutions)
    for (const otherId of lineage.otherMemberIds) {
      const otherMovesRaw = getRawLevelMovesForSpecies(otherId);
      if (otherMovesRaw && Array.isArray(otherMovesRaw)) {
        const otherName = LineageManager.getSpeciesName(otherId) || `Espèce #${otherId}`;
        for (const entry of otherMovesRaw) {
          const lvl = entry[0];
          const moveId = entry[1];
          if (!seenMoveIds.has(moveId)) {
            seenMoveIds.add(moveId);
            moves.push(resolveMove(moveId, lvl > 0 ? lvl : (lvl === 0 ? 'Évolution' : 'Départ'), otherName));
          }
        }
      }
    }

    // 4. Trier les attaques apprises par niveau croissant
    const getLevelWeight = (lvl) => {
      if (typeof lvl === 'number') {
        if (lvl < 0) return 0;
        if (lvl === 0) return 0.5;
        return lvl;
      }
      if (lvl === 'Départ') return 0;
      if (lvl === 'Évolution') return 0.5;
      if (lvl === 'Actuelle') return -1;
      return 999;
    };

    moves.sort((a, b) => {
      const wA = getLevelWeight(a.level);
      const wB = getLevelWeight(b.level);
      if (wA !== wB) return wA - wB;
      if (!a.evolutionSpecies && b.evolutionSpecies) return -1;
      if (a.evolutionSpecies && !b.evolutionSpecies) return 1;
      return a.name.localeCompare(b.name, 'fr');
    });

    // 5. Récupérer les attaques actuelles si non présentes (insérées au début)
    if (pokemon?.moveset && Array.isArray(pokemon.moveset)) {
      for (let i = pokemon.moveset.length - 1; i >= 0; i--) {
        const pm = pokemon.moveset[i];
        if (pm && pm.moveId && !seenMoveIds.has(pm.moveId)) {
          seenMoveIds.add(pm.moveId);
          const resolved = resolveMove(pm.moveId, 'Actuelle', null);
          moves.unshift(resolved);
        }
      }
    }

    return moves;
  }

  // --- DÉTECTION DES TYPES DES POKÉMON ENNEMIS EN COMBAT (SIMPLE OU DOUBLE) ---
  function getActiveEnemyTypes() {
    try {
      const scene = PokeSkip.scene || (typeof unsafeWindow !== 'undefined' ? unsafeWindow.globalScene : window.globalScene);
      if (!scene) return { types: [], name: '', enemies: [] };

      const activePokemonList = [];

      const addPokemon = (p) => {
        if (!p || typeof p !== 'object') return;
        const actual = p.pokemon || p;
        if (!actual) return;
        // Vérifier que c'est bien une entité Pokémon (types ou espèce)
        const hasTypes = typeof actual.getTypes === 'function' || Array.isArray(actual.types) || actual.species || actual.type1 !== undefined;
        if (!hasTypes) return;
        // Exclure les Pokémon KO / fainted
        if (typeof actual.isFainted === 'function' && actual.isFainted()) return;
        if (actual.hp !== undefined && actual.hp <= 0) return;
        // Éviter les doublons
        if (activePokemonList.some(item => item === actual || (item.id && actual.id && item.id === actual.id))) return;
        activePokemonList.push(actual);
      };

      // 1. Accès via scene.getEnemyField() (combat simple ou double)
      if (typeof scene.getEnemyField === 'function') {
        try {
          const field = scene.getEnemyField();
          if (Array.isArray(field)) {
            field.forEach(addPokemon);
          }
        } catch (_) {}
      }

      // 2. Accès via scene.enemySide.pokemon ou scene.enemySide.active
      if (scene.enemySide) {
        if (Array.isArray(scene.enemySide.pokemon)) {
          scene.enemySide.pokemon.forEach(addPokemon);
        }
        if (Array.isArray(scene.enemySide.active)) {
          scene.enemySide.active.forEach(addPokemon);
        }
      }

      // 3. Accès via scene.getEnemyPokemon(0) et scene.getEnemyPokemon(1)
      if (typeof scene.getEnemyPokemon === 'function') {
        try {
          addPokemon(scene.getEnemyPokemon(0));
        } catch (_) {
          try { addPokemon(scene.getEnemyPokemon()); } catch (_) {}
        }
        try {
          addPokemon(scene.getEnemyPokemon(1));
        } catch (_) {}
      }

      // 4. Accès via scene.currentBattle.getEnemyPokemon(0/1)
      if (scene.currentBattle && typeof scene.currentBattle.getEnemyPokemon === 'function') {
        try {
          addPokemon(scene.currentBattle.getEnemyPokemon(0));
        } catch (_) {
          try { addPokemon(scene.currentBattle.getEnemyPokemon()); } catch (_) {}
        }
        try {
          addPokemon(scene.currentBattle.getEnemyPokemon(1));
        } catch (_) {}
      }

      // 5. Repli : si aucun trouvé, scruter currentBattle.enemyParty ou scene.enemyParty
      if (activePokemonList.length === 0) {
        const party = (scene.currentBattle && Array.isArray(scene.currentBattle.enemyParty))
          ? scene.currentBattle.enemyParty
          : (Array.isArray(scene.enemyParty) ? scene.enemyParty : null);

        if (party && party.length > 0) {
          const isDouble = Boolean(scene.currentBattle?.double || scene.currentBattle?.isDouble);
          const count = isDouble ? Math.min(2, party.length) : 1;
          for (let i = 0; i < count; i++) {
            addPokemon(party[i]);
          }
        }
      }

      if (activePokemonList.length === 0) return { types: [], name: '', enemies: [] };

      // Helper pour extraire les types d'un Pokémon
      const getTypesFromPokemon = (poke) => {
        let rawTypes = [];
        if (typeof poke.getTypes === 'function') {
          rawTypes = poke.getTypes();
        } else if (Array.isArray(poke.types)) {
          rawTypes = poke.types;
        } else if (poke.type1 !== undefined || poke.type2 !== undefined) {
          if (poke.type1 !== undefined && poke.type1 !== null) rawTypes.push(poke.type1);
          if (poke.type2 !== undefined && poke.type2 !== null && poke.type2 !== poke.type1) rawTypes.push(poke.type2);
        } else if (poke.species) {
          if (poke.species.type1 !== undefined) rawTypes.push(poke.species.type1);
          if (poke.species.type2 !== undefined && poke.species.type2 !== poke.species.type1) rawTypes.push(poke.species.type2);
        }

        const indices = [];
        for (const t of rawTypes) {
          if (typeof t === 'number' && t >= 0 && t < 18) {
            if (!indices.includes(t)) indices.push(t);
          } else if (typeof t === 'string') {
            const idx = POKEMON_TYPES.findIndex(pt => pt.name.toLowerCase() === t.toLowerCase());
            if (idx !== -1 && idx < 18 && !indices.includes(idx)) indices.push(idx);
          } else if (t && typeof t === 'object' && t.name) {
            const idx = POKEMON_TYPES.findIndex(pt => pt.name.toLowerCase() === t.name.toLowerCase());
            if (idx !== -1 && idx < 18 && !indices.includes(idx)) indices.push(idx);
          }
        }
        return indices;
      };

      // Helper pour extraire le nom d'un Pokémon
      const getNameFromPokemon = (poke) => {
        if (typeof poke.getName === 'function') return poke.getName();
        if (poke.name) return poke.name;
        if (poke.species?.name) return poke.species.name;
        return 'Adversaire';
      };

      const enemies = [];
      const allUniqueTypes = [];

      for (const poke of activePokemonList) {
        const pokeTypes = getTypesFromPokemon(poke);
        const pokeName = getNameFromPokemon(poke);
        enemies.push({
          name: pokeName,
          types: pokeTypes
        });
        for (const tIdx of pokeTypes) {
          if (!allUniqueTypes.includes(tIdx)) {
            allUniqueTypes.push(tIdx);
          }
        }
      }

      return {
        types: allUniqueTypes,
        name: enemies.map(e => e.name).join(' & '),
        enemies: enemies
      };
    } catch (e) {
      console.warn('[PokeSkip] Erreur détection types adverses:', e);
      return { types: [], name: '', enemies: [] };
    }
  }

  // --- INTERFACE UTILISATEUR (HUD FLOTTANT & MODAL) ---
  const UI = {
    hudContainer: null,
    modalContainer: null,
    toastContainer: null,
    quickActionElement: null,
    selectedTeamIndex: 0,

    init() {
      this.injectStyles();
      this.createToastContainer();
      this.createHudButton();
      this.createModal();
      this.bindHotkeys();
    },

    injectStyles() {
      const css = `
        #pokeskip-hud {
          position: fixed;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          z-index: 999999;
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          box-shadow: none !important;
          padding: 0;
          cursor: grab;
          user-select: none;
          font-family: system-ui, -apple-system, sans-serif;
          color: #f8fafc;
        }
        #pokeskip-hud.dragging {
          cursor: grabbing;
          transition: none !important;
          opacity: 0.85;
          box-shadow: none !important;
        }
        .pokeskip-hud-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(12px);
          padding: 4px 8px;
          border-radius: 9999px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        #pokeskip-hud.on .pokeskip-hud-pill {
          border-color: rgba(56, 189, 248, 0.35);
        }
        #pokeskip-hud.off .pokeskip-hud-pill {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.82);
        }
        .pokeskip-hud-pill:hover {
          border-color: rgba(56, 189, 248, 0.6);
          transform: scale(1.02);
        }
        #pokeskip-hud-type-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid rgba(168, 85, 247, 0.45);
          backdrop-filter: blur(12px);
          color: #e9d5ff;
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
          user-select: none;
        }
        #pokeskip-hud-type-btn:hover {
          background: rgba(168, 85, 247, 0.28);
          border-color: #c084fc;
          color: #ffffff;
          transform: scale(1.12);
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
        #pokeskip-hud-type-btn:active {
          transform: scale(0.95);
        }
        .pokeskip-hud-ball-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .pokeskip-hud-ball {
          display: block;
          flex-shrink: 0;
          transition: all 0.25s ease;
          border-radius: 50%;
        }
        .pokeskip-hud-ball.on {
          filter: drop-shadow(0 0 5px rgba(56, 189, 248, 0.7));
        }
        .pokeskip-hud-ball.on:hover {
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.95));
        }
        .pokeskip-hud-ball.off {
          filter: grayscale(1) opacity(0.42);
        }
        .pokeskip-hud-ball.off:hover {
          filter: grayscale(0.8) opacity(0.65);
        }
        @keyframes pksPulseCenter {
          0%, 100% { fill: #34d399; filter: drop-shadow(0 0 1px #34d399); }
          50% { fill: #10b981; filter: drop-shadow(0 0 3px #34d399); }
        }
        .pokeskip-hud-ball.on .pks-ball-center-dot {
          animation: pksPulseCenter 2.5s infinite ease-in-out;
        }
        .pokeskip-hud-badge {
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 12px;
          background: rgba(14, 165, 233, 0.22);
          color: #7dd3fc;
          font-weight: 600;
          border: 1px solid rgba(56, 189, 248, 0.25);
          white-space: nowrap;
        }
        .pokeskip-hud-status {
          display: none;
        }
        .pokeskip-hud-divider {
          display: none;
        }

        /* --- MODAL --- */
        #pokeskip-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(4, 8, 19, 0.78);
          backdrop-filter: blur(8px);
          z-index: 1000000;
          display: none;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #pokeskip-modal-backdrop.active {
          display: flex;
          opacity: 1;
        }
        #pokeskip-modal {
          background: #090e1a;
          border: 1px solid rgba(56, 189, 248, 0.3);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(14, 165, 233, 0.15);
          border-radius: 20px;
          width: 94%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          color: #f1f5f9;
          overflow: hidden;
          animation: pokeskipPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes pokeskipPop {
          0% { transform: scale(0.94); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        /* --- SCROLLBARS INTÉGRÉES SOMBRES & ÉLÉGANTES --- */
        #pokeskip-modal ::-webkit-scrollbar,
        .pokeskip-modal-body::-webkit-scrollbar,
        .pokeskip-team-row::-webkit-scrollbar,
        .pokeskip-moves-list::-webkit-scrollbar,
        .pokeskip-saved-species-list::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        #pokeskip-modal ::-webkit-scrollbar-track,
        .pokeskip-modal-body::-webkit-scrollbar-track,
        .pokeskip-team-row::-webkit-scrollbar-track,
        .pokeskip-moves-list::-webkit-scrollbar-track,
        .pokeskip-saved-species-list::-webkit-scrollbar-track {
          background: rgba(10, 15, 29, 0.65);
          border-radius: 6px;
        }
        #pokeskip-modal ::-webkit-scrollbar-thumb,
        .pokeskip-modal-body::-webkit-scrollbar-thumb,
        .pokeskip-team-row::-webkit-scrollbar-thumb,
        .pokeskip-moves-list::-webkit-scrollbar-thumb,
        .pokeskip-saved-species-list::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.28);
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        #pokeskip-modal ::-webkit-scrollbar-thumb:hover,
        .pokeskip-modal-body::-webkit-scrollbar-thumb:hover,
        .pokeskip-team-row::-webkit-scrollbar-thumb:hover,
        .pokeskip-moves-list::-webkit-scrollbar-thumb:hover,
        .pokeskip-saved-species-list::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.55);
          background-clip: padding-box;
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
        }
        #pokeskip-modal * {
          scrollbar-width: thin;
          scrollbar-color: rgba(56, 189, 248, 0.3) rgba(10, 15, 29, 0.65);
        }

        .pokeskip-modal-header {
          padding: 14px 22px;
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.7) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pokeskip-header-badge {
          font-size: 11px;
          font-weight: 600;
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 999px;
          padding: 2px 9px;
          letter-spacing: 0.2px;
        }

        /* --- SWITCH TOGGLE BUTTON --- */
        .pokeskip-switch-label {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
          background: rgba(15, 23, 42, 0.6);
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s;
        }
        .pokeskip-switch-label:hover {
          border-color: rgba(56, 189, 248, 0.35);
          background: rgba(15, 23, 42, 0.85);
        }
        .pokeskip-switch-text {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2px;
          color: #94a3b8;
          min-width: 44px;
          transition: color 0.2s;
        }
        .pokeskip-switch-text.active {
          color: #38bdf8;
          text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
        }
        .pokeskip-switch {
          position: relative;
          display: inline-block;
          width: 38px;
          height: 20px;
        }
        .pokeskip-switch input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }
        .pokeskip-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 20px;
        }
        .pokeskip-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 2px;
          bottom: 2px;
          background-color: #94a3b8;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        .pokeskip-switch input:checked + .pokeskip-slider {
          background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
          border-color: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.45);
        }
        .pokeskip-switch input:checked + .pokeskip-slider:before {
          transform: translateX(18px);
          background-color: #ffffff;
        }

        /* --- BOUTON CROIX FERMETURE --- */
        .pokeskip-close-btn {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #94a3b8;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          line-height: 1;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pokeskip-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          color: #ef4444;
          transform: rotate(90deg) scale(1.1);
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.35);
        }
        .pokeskip-close-btn:active {
          transform: rotate(90deg) scale(0.95);
        }

        /* --- ONGLETS MODAL --- */
        .pokeskip-modal-tabs {
          display: flex;
          background: #0d1527;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 18px;
          gap: 8px;
        }
        .pokeskip-tab-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          color: #94a3b8;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pokeskip-tab-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }
        .pokeskip-tab-btn.active {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(14, 165, 233, 0.08) 100%);
          color: #38bdf8;
          border-color: rgba(56, 189, 248, 0.35);
          box-shadow: 0 2px 10px rgba(56, 189, 248, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        .pokeskip-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        /* --- TEAM ROW & SLOTS --- */
        .pokeskip-team-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (max-width: 860px) {
          .pokeskip-team-row {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 520px) {
          .pokeskip-team-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .pokeskip-member-card {
          background: #111a2e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 140px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          position: relative;
        }
        .pokeskip-member-card:hover {
          background: #16243f;
          border-color: rgba(56, 189, 248, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .pokeskip-member-card.active {
          background: linear-gradient(145deg, #132746 0%, #0c1b33 100%);
          border-color: #38bdf8;
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.28);
        }

        /* Slot vide pour les Pokémon non capturés */
        .pokeskip-member-card.empty-slot {
          background: rgba(15, 23, 42, 0.35);
          border: 1.5px dashed rgba(255, 255, 255, 0.12);
          cursor: default;
          opacity: 0.55;
          box-shadow: none;
        }
        .pokeskip-member-card.empty-slot:hover {
          opacity: 0.75;
          transform: none;
          background: rgba(15, 23, 42, 0.45);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .pokeskip-empty-slot-icon {
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pokeskip-member-name.empty-name {
          color: #64748b;
          font-weight: 500;
          font-size: 12px;
        }

        .pokeskip-member-name {
          font-weight: 700;
          font-size: 13px;
          color: #f8fafc;
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        /* --- SPRITES ET ANIMATION HOP SACCADÉE --- */
        .pokeskip-member-sprite-container {
          width: 74px;
          height: 74px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0 auto;
        }
        .pokeskip-member-sprite {
          width: 72px;
          height: 72px;
          max-width: 74px;
          max-height: 74px;
          object-fit: contain;
          image-rendering: pixelated;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
          will-change: transform;
        }
        @keyframes pokeskip-sprite-hop {
          0%, 49% {
            transform: translateY(0);
          }
          50%, 100% {
            transform: translateY(-8px);
          }
        }
        .pokeskip-member-card:hover .pokeskip-member-sprite {
          animation: pokeskip-sprite-hop 0.36s steps(1) infinite;
        }
        .pokeskip-member-card.active .pokeskip-member-sprite {
          filter: drop-shadow(0 4px 10px rgba(56, 189, 248, 0.45));
        }

        /* --- BADGES SHINY 3 TIERS --- */
        .pokeskip-shiny-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          font-size: 11px;
          letter-spacing: -2px;
          padding: 1px 4px;
          border-radius: 6px;
          backdrop-filter: blur(4px);
          pointer-events: none;
          z-index: 2;
        }
        .pokeskip-shiny-badge.tier-1 {
          color: #facc15;
          background: rgba(250, 204, 21, 0.15);
          border: 1px solid rgba(250, 204, 21, 0.35);
          filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.6));
        }
        .pokeskip-shiny-badge.tier-2 {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.18);
          border: 1px solid rgba(56, 189, 248, 0.4);
          filter: drop-shadow(0 0 5px rgba(56, 189, 248, 0.7));
        }
        .pokeskip-shiny-badge.tier-3 {
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.2);
          border: 1px solid rgba(244, 63, 94, 0.45);
          filter: drop-shadow(0 0 6px rgba(244, 63, 94, 0.8));
        }

        .pokeskip-mega-badge {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 6px;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
          letter-spacing: 0.5px;
          margin-top: 2px;
          display: inline-block;
        }
        .pokeskip-saved-species-card {
          background: #111a2e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pokeskip-saved-species-card:hover {
          background: #16243f !important;
          border-color: rgba(56, 189, 248, 0.45) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
          transform: translateY(-1px);
        }

        /* --- BROCHETTE D'ÉVOLUTIONS DE LA LIGNÉE --- */
        .pokeskip-lineage-header-box {
          background: #0f172a;
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        }
        .pokeskip-lineage-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pokeskip-lineage-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
        }
        .pokeskip-lineage-title b {
          color: #38bdf8;
        }
        .pokeskip-lineage-lvl {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.35);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }
        .pokeskip-evolution-chain {
          display: flex;
          align-items: center;
          justify-content: center;
          justify-content: safe center;
          gap: 14px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 8px 4px 10px 4px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
          scrollbar-width: thin;
          scrollbar-color: rgba(56, 189, 248, 0.3) transparent;
        }
        .pokeskip-evolution-chain::-webkit-scrollbar {
          height: 6px;
        }
        .pokeskip-evolution-chain::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.3);
          border-radius: 3px;
        }
        .pokeskip-evo-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .pokeskip-evo-sprite-wrap {
          width: 74px;
          height: 74px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          cursor: default !important;
          transform: none !important;
        }
        .pokeskip-evo-sprite-wrap:hover {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          transform: none !important;
        }

        .pokeskip-mini-mega-tag {
          position: absolute;
          bottom: 2px;
          right: 2px;
          font-size: 8px;
          font-weight: 800;
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          color: #fff;
          border-radius: 3px;
          padding: 0 3px;
          line-height: 1.2;
          z-index: 2;
        }
        .pokeskip-evo-sprite {
          width: 72px;
          height: 72px;
          max-width: 74px;
          max-height: 74px;
          object-fit: contain;
          image-rendering: pixelated;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
          transition: transform 0.15s;
        }
        .pokeskip-evo-node.current-active .pokeskip-evo-sprite {
          filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.65)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.6));
        }
        .pokeskip-evo-name {
          font-size: 12px;
          font-weight: 700;
          color: #cbd5e1;
          max-width: 100px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pokeskip-evo-node.current-active .pokeskip-evo-name {
          color: #38bdf8;
          font-weight: 800;
        }
        .pokeskip-evo-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #38bdf8;
          font-size: 20px;
          font-weight: 900;
          opacity: 0.75;
          user-select: none;
          flex-shrink: 0;
          margin-bottom: 22px;
        }
        .pokeskip-evo-arrow-char {
          line-height: 1;
        }
        .pokeskip-evo-arrow.mega {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          margin-bottom: 22px;
          opacity: 1;
        }
        .pokeskip-evo-mega-pill {
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(236, 72, 153, 0.35) 100%);
          border: 1px solid rgba(168, 85, 247, 0.6);
          color: #f5d0fe;
          border-radius: 4px;
          padding: 1px 5px;
          line-height: 1.2;
          box-shadow: 0 0 6px rgba(168, 85, 247, 0.35);
          white-space: nowrap;
        }
        .pokeskip-evo-arrow.mega .pokeskip-evo-arrow-char {
          color: #ec4899;
          font-size: 15px;
          line-height: 1;
          text-shadow: 0 0 8px rgba(236, 72, 153, 0.6);
        }

        /* Séparateur de Branche Alternative */
        .pokeskip-evo-branch-divider {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          margin: 0 6px 22px 6px;
          padding: 4px 8px;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%);
          border: 1px dashed rgba(56, 189, 248, 0.45);
          border-radius: 8px;
          flex-shrink: 0;
          user-select: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .pokeskip-evo-branch-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(14, 165, 233, 0.25) 100%);
          border: 1px solid rgba(56, 189, 248, 0.5);
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 8.5px;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .pokeskip-evo-branch-icon {
          font-size: 10px;
          line-height: 1;
        }
        .pokeskip-evo-branch-origin {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 9px;
          color: #94a3b8;
          white-space: nowrap;
        }
        .pokeskip-evo-branch-origin b {
          color: #f1f5f9;
          font-weight: 700;
        }
        .pokeskip-evo-branch-arrow {
          color: #38bdf8;
          font-weight: 900;
          font-size: 11px;
          line-height: 1;
        }

        /* Brochette pour l'onglet Règles & Espèces */
        .pokeskip-evolution-chain.large .pokeskip-evo-sprite-wrap {
          width: 74px;
          height: 74px;
        }
        .pokeskip-evolution-chain.large .pokeskip-evo-sprite {
          width: 72px;
          height: 72px;
          max-width: 74px;
          max-height: 74px;
        }
        .pokeskip-evolution-chain.large .pokeskip-evo-name {
          font-size: 12px;
          max-width: 110px;
        }
        .pokeskip-evolution-chain.large .pokeskip-evo-arrow {
          font-size: 22px;
          margin-bottom: 22px;
        }

        /* Mode compact automatique pour les grandes lignées (5 à 6 membres / formes comme Tarsal ou Verpom) */
        .pokeskip-evolution-chain.compact {
          gap: 6px;
          padding: 4px 2px 6px 2px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-node {
          gap: 3px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-sprite-wrap {
          width: 48px;
          height: 48px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-sprite {
          width: 46px;
          height: 46px;
          max-width: 48px;
          max-height: 48px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-name {
          font-size: 10px;
          max-width: 74px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-arrow {
          font-size: 15px;
          margin-bottom: 15px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-arrow.mega {
          margin-bottom: 15px;
          gap: 1px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-mega-pill {
          font-size: 7px;
          padding: 0 3px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-arrow.mega .pokeskip-evo-arrow-char {
          font-size: 11px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-branch-divider {
          margin: 0 2px 15px 2px;
          padding: 2px 5px;
          gap: 2px;
          border-radius: 6px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-branch-badge {
          font-size: 7.5px;
          padding: 0 4px;
        }
        .pokeskip-evolution-chain.compact .pokeskip-evo-branch-origin {
          font-size: 8px;
        }

        /* Mode extra-compact pour les très grandes lignées (7+ membres comme Évoli avec 9 formes) */
        .pokeskip-evolution-chain.extra-compact {
          gap: 3px;
          padding: 3px 1px 4px 1px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-node {
          gap: 2px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-sprite-wrap {
          width: 38px;
          height: 38px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-sprite {
          width: 36px;
          height: 36px;
          max-width: 38px;
          max-height: 38px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-name {
          font-size: 9px;
          max-width: 58px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-arrow {
          font-size: 12px;
          margin-bottom: 12px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-arrow.mega {
          margin-bottom: 12px;
          gap: 1px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-mega-pill {
          font-size: 6.5px;
          padding: 0 2px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-arrow.mega .pokeskip-evo-arrow-char {
          font-size: 9px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-branch-divider {
          margin: 0 1px 12px 1px;
          padding: 1px 3px;
          gap: 1px;
          border-radius: 5px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-branch-badge {
          font-size: 6.5px;
          padding: 0 3px;
        }
        .pokeskip-evolution-chain.extra-compact .pokeskip-evo-branch-origin {
          font-size: 7px;
        }

        /* --- BOUTON UNIQUE D'ACTIVATION / DÉSACTIVATION DU FILTRAGE --- */
        .pokeskip-btn-toggle-filter {
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.1px;
          user-select: none;
        }
        .pokeskip-btn-toggle-filter.active {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.15);
        }
        .pokeskip-btn-toggle-filter.active:hover {
          background: rgba(16, 185, 129, 0.25);
          border-color: rgba(16, 185, 129, 0.6);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
        }
        .pokeskip-btn-toggle-filter.idle {
          background: rgba(245, 158, 11, 0.12);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.35);
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.1);
        }
        .pokeskip-btn-toggle-filter.idle:hover {
          background: rgba(245, 158, 11, 0.22);
          border-color: rgba(245, 158, 11, 0.55);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.2);
        }

        /* --- NOUVEAU DESIGN DES CARTES D'ATTAQUES --- */
        .pokeskip-moves-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pokeskip-moves-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .pokeskip-move-card {
          background: #111a2e;
          border: 1px solid rgba(56, 189, 248, 0.18);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .pokeskip-move-card:hover {
          background: #16243f;
          border-color: rgba(56, 189, 248, 0.45);
        }
        .pokeskip-move-card.skipped {
          background: rgba(244, 63, 94, 0.08);
          border-color: rgba(244, 63, 94, 0.35);
          opacity: 0.72;
        }
        .pokeskip-move-card.skipped .pokeskip-move-name-txt {
          text-decoration: line-through;
          color: #fda4af;
        }

        .pokeskip-move-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pokeskip-move-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pokeskip-move-lvl-pill {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }
        .pokeskip-evo-tag {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.35);
          border-radius: 6px;
          padding: 2px 7px;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          letter-spacing: 0.2px;
        }
        .pokeskip-move-name-txt {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
        }
        .pokeskip-type-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 5px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.4);
          background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.2) 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.35);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85), 0 0 1px #000;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .pokeskip-cat-tag {
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pokeskip-move-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pokeskip-stat-pill {
          background: #090e1a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          color: #cbd5e1;
          font-weight: 600;
        }
        .pokeskip-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #38bdf8;
        }
        .pokeskip-keep-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          transition: all 0.15s;
        }
        .pokeskip-keep-badge.kept {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.35);
        }
        .pokeskip-keep-badge.skip {
          background: rgba(244, 63, 94, 0.15);
          color: #f43f5e;
          border: 1px solid rgba(244, 63, 94, 0.35);
        }

        .pokeskip-move-desc {
          font-size: 12px;
          line-height: 1.45;
          color: #94a3b8;
          background: rgba(0, 0, 0, 0.25);
          padding: 6px 10px;
          border-radius: 6px;
          border-left: 2px solid rgba(56, 189, 248, 0.4);
        }

        /* --- QUICK SKIP PROMPT (EN HAUT AU MILIEU) --- */
        #pokeskip-quick-prompt {
          position: fixed;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999998;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(244, 63, 94, 0.6);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(244, 63, 94, 0.35);
          backdrop-filter: blur(12px);
          padding: 7px 16px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-size: 13px;
          animation: pokeskipSlideDown 0.25s ease-out;
          pointer-events: auto;
        }
        @keyframes pokeskipSlideDown {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .pokeskip-quick-text {
          white-space: nowrap;
          font-size: 13px;
        }
        .pokeskip-quick-btn {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: #fff;
          border: none;
          padding: 5px 14px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(244, 63, 94, 0.4);
          transition: all 0.15s;
        }
        .pokeskip-quick-btn:hover {
          transform: scale(1.04);
          filter: brightness(1.1);
        }
        .pokeskip-quick-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
          padding: 0 4px;
          transition: color 0.15s;
        }
        .pokeskip-quick-close:hover {
          color: #fff;
        }

        /* --- TOASTS NOTIFICATIONS PREMIUM --- */
        #pokeskip-toasts {
          position: fixed;
          top: 65px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000001;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          pointer-events: none;
          max-width: 90vw;
        }
        .pokeskip-toast {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.94) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-left: 4px solid #38bdf8;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(56, 189, 248, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 11px 20px;
          border-radius: 10px;
          color: #f8fafc;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          line-height: 1.45;
          letter-spacing: 0.15px;
          text-align: center;
          pointer-events: auto;
          animation: pokeskipToastIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pokeskip-toast b,
        .pokeskip-toast strong {
          color: #38bdf8;
          font-weight: 700;
        }
        .pokeskip-toast.success {
          border-left-color: #34d399;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(52, 211, 153, 0.2);
        }
        .pokeskip-toast.success b,
        .pokeskip-toast.success strong {
          color: #34d399;
        }
        .pokeskip-toast.warning {
          border-left-color: #f59e0b;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(245, 158, 11, 0.2);
        }
        .pokeskip-toast.warning b,
        .pokeskip-toast.warning strong {
          color: #fbbf24;
        }
        .pokeskip-toast.error {
          border-left-color: #ef4444;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(239, 68, 68, 0.2);
        }
        .pokeskip-toast.error b,
        .pokeskip-toast.error strong {
          color: #f87171;
        }
        @keyframes pokeskipToastIn {
          from {
            transform: translateY(-16px) scale(0.96);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        /* --- TABLEAU DES TYPES 18x18 & VUE SYNTHÉTIQUE --- */
        @keyframes pksTypeChartFadeIn {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes pksTargetPulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.6);
            border-color: #38bdf8;
          }
          50% {
            box-shadow: 0 0 18px rgba(56, 189, 248, 1), 0 0 4px #fff, inset 0 1px 0 rgba(255, 255, 255, 0.8);
            border-color: #7dd3fc;
          }
        }

        #pokeskip-typechart-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000000;
          display: none;
          align-items: center;
          align-items: safe center;
          justify-content: center;
          padding: 8px;
          background: rgba(3, 7, 18, 0.85);
          backdrop-filter: blur(10px) saturate(160%);
          user-select: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          box-sizing: border-box;
          overflow: auto;
        }

        .pokeskip-typechart-box {
          background: linear-gradient(155deg, rgba(14, 20, 38, 0.98) 0%, rgba(7, 11, 22, 0.99) 100%);
          border: 1px solid rgba(168, 85, 247, 0.38);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.92), 0 0 35px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 10px 14px;
          width: 770px;
          min-width: 770px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-sizing: border-box;
          overflow: hidden;
          zoom: var(--pks-tc-scale, 1);
          transform-origin: center center;
          transition: zoom 0.12s ease-out, transform 0.12s ease-out;
          animation: pksTypeChartFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @supports not (zoom: 1) {
          .pokeskip-typechart-box {
            transform: scale(var(--pks-tc-scale, 1));
          }
        }

        .pokeskip-typechart-body {
          position: relative;
          overflow: hidden;
          width: 100%;
        }
        @keyframes pksTabFade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .pks-tab-fade {
          animation: pksTabFade 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pokeskip-typechart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 6px;
          min-height: 34px;
          box-sizing: border-box;
        }

        .pokeskip-typechart-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pokeskip-typechart-title {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.3px;
          color: #f8fafc;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        }

        /* --- COMMUTATEUR DE MODE (SEGMENTED CONTROL) --- */
        .pokeskip-mode-switch {
          display: inline-flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 2px;
          gap: 2px;
        }
        .pokeskip-mode-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          user-select: none;
        }
        .pokeskip-mode-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
        .pokeskip-mode-btn.active {
          background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
          color: #081226;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(56, 189, 248, 0.35);
        }

        .pokeskip-typechart-close {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pokeskip-typechart-close:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          color: #ffffff;
        }

        /* --- CONTENEUR TABLEAU 18x18 --- */
        .pokeskip-typechart-table-wrap {
          overflow: visible;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: rgba(10, 15, 29, 0.6);
          box-sizing: border-box;
          height: 526px;
          min-height: 526px;
          max-height: 526px;
        }
        .pokeskip-table-stage {
          position: relative;
          display: inline-block;
          margin: 0 auto;
        }
        .pokeskip-col-bubble-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10;
        }
        .pokeskip-col-bubble {
          position: absolute;
          pointer-events: none;
          border: 2px solid #38bdf8;
          border-radius: 6px;
          background: rgba(56, 189, 248, 0.08);
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.45), inset 0 0 8px rgba(56, 189, 248, 0.15);
          box-sizing: border-box;
        }
        .pokeskip-typechart-table {
          border-collapse: separate;
          border-spacing: 1px;
          background: #090f20;
          margin: 0 auto;
          font-size: 11.5px;
          table-layout: fixed;
          width: auto;
          user-select: none;
        }

        .pokeskip-th-corner {
          background: #070d1e;
          color: #94a3b8;
          font-size: 9px;
          padding: 2px 4px;
          text-align: center;
          position: sticky;
          top: 0;
          left: 0;
          z-index: 4;
          width: 66px;
          min-width: 66px;
          max-width: 66px;
          height: 66px;
          min-height: 66px;
          max-height: 66px;
          box-sizing: border-box;
          vertical-align: middle;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pokeskip-th-col {
          padding: 0;
          width: 24px;
          min-width: 24px;
          max-width: 24px;
          height: 66px;
          min-height: 66px;
          max-height: 66px;
          position: sticky;
          top: 0;
          z-index: 3;
          border-radius: 4px;
          position: relative;
          box-sizing: border-box;
          vertical-align: middle;
          text-align: center;
          color: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.4);
          background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.22) 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        .pokeskip-th-col.highlighted-col {
          z-index: 5;
        }

        .pokeskip-th-col-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
        }
        .pokeskip-th-col.highlighted-col .pokeskip-th-col-content {
          padding-top: 6px;
        }
        .pokeskip-col-marker {
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          line-height: 1;
          z-index: 2;
        }
        .pokeskip-th-col-name {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          line-height: 1;
          color: #ffffff !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85), 0 0 1px #000;
          display: inline-block;
          margin: 0 auto;
          text-align: center;
        }

        .pokeskip-th-row {
          padding: 0 5px;
          width: 66px;
          min-width: 66px;
          max-width: 66px;
          height: 24px;
          line-height: 22px;
          text-align: center;
          position: sticky;
          left: 0;
          z-index: 2;
          border-radius: 4px;
          white-space: nowrap;
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.4);
          background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.22) 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.4);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85), 0 0 1px #000;
          box-sizing: border-box;
          transition: filter 0.12s, box-shadow 0.12s;
        }

        /* --- CELLULES MULTIPLICATEURS 18x18 --- */
        .pokeskip-td-cell {
          text-align: center;
          padding: 0;
          width: 24px;
          min-width: 24px;
          max-width: 24px;
          height: 24px;
          line-height: 24px;
          border-radius: 3px;
          font-size: 11.5px;
          box-sizing: border-box;
          user-select: none;
          cursor: default;
        }

        /* Super efficace (×2) : Vert éclatant */
        .pokeskip-td-cell.super {
          background: linear-gradient(180deg, #10b981 0%, #047857 100%);
          color: #ffffff !important;
          font-weight: 900;
          border: 1px solid rgba(0, 0, 0, 0.35);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
        }

        /* Peu efficace (×0.5) : Rouge carmin */
        .pokeskip-td-cell.half {
          background: linear-gradient(180deg, #f43f5e 0%, #be123c 100%);
          color: #ffffff !important;
          font-weight: 900;
          border: 1px solid rgba(0, 0, 0, 0.35);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 1px 2px rgba(0, 0, 0, 0.3);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
        }

        /* Inefficace (×0) : Noir ardoise */
        .pokeskip-td-cell.zero {
          background: #060913;
          color: #94a3b8 !important;
          font-weight: 900;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.9);
          text-shadow: 0 0 2px rgba(255, 255, 255, 0.35);
        }

        /* Neutre (×1) */
        .pokeskip-td-cell.neutral {
          color: #475569;
          font-size: 11px;
          border: 1px solid transparent;
        }

        /* Zébrure subtile */
        .pokeskip-typechart-table tbody tr:nth-child(odd) .pokeskip-td-cell.neutral {
          background: rgba(255, 255, 255, 0.02);
        }
        .pokeskip-typechart-table tbody tr:nth-child(even) .pokeskip-td-cell.neutral {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Surbrillance sobre de la ligne au survol (uniquement la ligne) */
        .pokeskip-typechart-table tbody tr:hover .pokeskip-th-row {
          filter: brightness(1.25);
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
        }
        .pokeskip-typechart-table tbody tr:hover .pokeskip-td-cell.neutral {
          background: rgba(255, 255, 255, 0.12) !important;
          color: #f1f5f9 !important;
        }
        .pokeskip-typechart-table tbody tr:hover .pokeskip-td-cell:not(.neutral) {
          filter: brightness(1.15);
        }

        .pokeskip-typechart-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 4px;
        }
        .pokeskip-typechart-legend {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 10.5px;
          color: #cbd5e1;
        }
        .legend-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 900;
        }
        .legend-badge.super {
          background: linear-gradient(180deg, #10b981 0%, #047857 100%);
          color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.4);
        }
        .legend-badge.half {
          background: linear-gradient(180deg, #f43f5e 0%, #be123c 100%);
          color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.4);
        }
        .legend-badge.zero {
          background: #060913;
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        .legend-badge.neutral {
          background: rgba(255, 255, 255, 0.06);
          color: #64748b;
        }

        /* --- MODE SIMPLIFIÉ --- */
        .pokeskip-ref-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 6px 8px;
          box-sizing: border-box;
          height: 526px;
          min-height: 526px;
          max-height: 526px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(10, 15, 29, 0.6);
          overflow: hidden;
          width: 100%;
        }

        /* Toggle switch des immunités */
        .pokeskip-tc-switch {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          user-select: none;
          font-size: 10.5px;
          font-weight: 700;
          color: #94a3b8;
        }
        .pokeskip-tc-switch input {
          display: none;
        }
        .pks-tc-slider {
          position: relative;
          width: 26px;
          height: 14px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
          flex-shrink: 0;
        }
        .pks-tc-slider::after {
          content: '';
          position: absolute;
          top: 1px;
          left: 1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        .pokeskip-tc-switch input:checked + .pks-tc-slider {
          background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
          border-color: #38bdf8;
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
        }
        .pokeskip-tc-switch input:checked + .pks-tc-slider::after {
          transform: translateX(12px);
        }
        .pokeskip-tc-switch:hover .pks-tc-label {
          color: #f8fafc;
        }
        .pokeskip-tc-label {
          transition: color 0.15s;
        }

        .pokeskip-ref-enemy-bubble {
          background: rgba(56, 189, 248, 0.12);
          border: 1.5px solid #38bdf8;
          border-radius: 6px;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.28), inset 0 0 8px rgba(56, 189, 248, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1px;
          box-sizing: border-box;
          padding: 1px 0;
        }
        .pokeskip-ref-enemy-bubble .pokeskip-ref-row {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .pokeskip-ref-header {
          display: flex;
          align-items: center;
          height: 24px;
          min-height: 24px;
          max-height: 24px;
          padding: 0;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 2px;
          user-select: none;
        }
        .pokeskip-ref-left-label {
          width: 320px;
          min-width: 320px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fca5a5;
          letter-spacing: 0.3px;
          padding-right: 6px;
          padding-left: 4px;
          box-sizing: border-box;
        }
        .pokeskip-ref-center-label {
          width: 60px;
          min-width: 60px;
          text-align: center;
          color: #38bdf8;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .pokeskip-ref-right-label {
          width: 320px;
          min-width: 320px;
          text-align: left;
          color: #86efac;
          letter-spacing: 0.3px;
          padding-left: 6px;
          box-sizing: border-box;
        }

        .pokeskip-ref-row {
          display: flex;
          align-items: center;
          height: 24px;
          min-height: 24px;
          max-height: 24px;
          box-sizing: border-box;
          border-radius: 4px;
        }

        .pokeskip-ref-left {
          width: 320px;
          min-width: 320px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
        }
        .pokeskip-ref-arrow-left {
          width: 20px;
          min-width: 20px;
          text-align: center;
          color: #fca5a5;
          font-weight: 900;
          font-size: 13px;
          user-select: none;
          flex-shrink: 0;
        }
        .pokeskip-ref-center {
          width: 60px;
          min-width: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }
        .pokeskip-ref-arrow-right {
          width: 20px;
          min-width: 20px;
          text-align: center;
          color: #86efac;
          font-weight: 900;
          font-size: 13px;
          user-select: none;
          flex-shrink: 0;
        }
        .pokeskip-ref-right {
          width: 320px;
          min-width: 320px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
        }

        /* --- PASTILLES DE TYPE OFFICIELLES (STYLE POKÉROGUE) --- */
        .pokeskip-badge-pill {
          min-width: 52px;
          height: 20px;
          line-height: 18px;
          padding: 0 5px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          box-sizing: border-box;
          position: relative;
          user-select: none;
          flex-shrink: 0;
          color: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.4);
          background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.22) 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.4);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85), 0 0 1px #000;
        }
        .pokeskip-typechart-box .pokeskip-badge-pill:hover {
          transform: none;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.4);
          filter: none;
        }

        /* Badge multiplicateur compact pour la vue combat */
        .pokeskip-mult-tag {
          font-size: 8px;
          font-weight: 900;
          padding: 1px 3px;
          border-radius: 3px;
          line-height: 1;
          margin-left: 2px;
          border: 1px solid rgba(0, 0, 0, 0.3);
        }
        .pokeskip-mult-tag.x4 {
          background: #dc2626;
          color: #fff;
          border-color: #ef4444;
          box-shadow: 0 0 4px rgba(239, 68, 68, 0.8);
        }
        .pokeskip-mult-tag.x2 {
          background: #ea580c;
          color: #fff;
        }
        .pokeskip-mult-tag.x05 {
          background: #16a34a;
          color: #fff;
        }
        .pokeskip-mult-tag.x025 {
          background: #0d9488;
          color: #fff;
        }
        .pokeskip-mult-tag.x0 {
          background: #334155;
          color: #94a3b8;
        }
      `;
      const style = document.createElement('style');
      style.id = 'pokeskip-styles';
      style.textContent = css;
      document.head.appendChild(style);
    },

    createToastContainer() {
      if (document.getElementById('pokeskip-toasts')) return;
      const el = document.createElement('div');
      el.id = 'pokeskip-toasts';
      document.body.appendChild(el);
      this.toastContainer = el;
    },

    showToast(message, type = 'info', duration = 2800) {
      this.createToastContainer();
      const toast = document.createElement('div');
      toast.className = `pokeskip-toast ${type}`;
      toast.innerHTML = message;
      this.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 250);
      }, duration);
    },
    getPokeballSvg(size = 20, enabled = true) {
      const isEnabled = enabled !== false;
      const centerFill = isEnabled ? '#34d399' : '#475569';
      return `
        <svg class="pokeskip-hud-ball ${isEnabled ? 'on' : 'off'}" viewBox="0 0 100 100" width="${size}" height="${size}" style="display:block; flex-shrink:0;">
          <defs>
            <linearGradient id="pksBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
            <linearGradient id="pksWhite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#e2e8f0"/>
            </linearGradient>
          </defs>
          <path d="M 5 50 A 45 45 0 0 1 95 50 Z" fill="url(#pksBlue)"/>
          <path d="M 5 50 A 45 45 0 0 0 95 50 Z" fill="url(#pksWhite)"/>
          <line x1="5" y1="50" x2="95" y2="50" stroke="#0f172a" stroke-width="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#0f172a" stroke-width="8"/>
          <circle cx="50" cy="50" r="14" fill="#0f172a"/>
          <circle cx="50" cy="50" r="8" fill="#ffffff"/>
          <circle class="pks-ball-center-dot" cx="50" cy="50" r="4" fill="${centerFill}"/>
        </svg>
      `;
    },

    createHudButton() {
      if (document.getElementById('pokeskip-hud')) return;
      const hud = document.createElement('div');
      hud.id = 'pokeskip-hud';
      const enabled = PokeSkip.settings.enabled;
      hud.className = enabled ? 'on' : 'off';
      hud.title = `PokéSkip (${enabled ? 'Actif - ON' : 'En pause - OFF'}) • Raccourci P • Glisser pour déplacer`;
      const runCount = PokeSkip.getRunSkippedCount();
      const showCount = PokeSkip.settings.showHudCount !== false;
      hud.innerHTML = `
        <div class="pokeskip-hud-pill" title="PokéSkip (${enabled ? 'Actif - ON' : 'En pause - OFF'}) • Clic pour gérer les capacités • Raccourci P">
          <div class="pokeskip-hud-ball-wrap" title="${enabled ? 'PokéSkip : ACTIF (ON)' : 'PokéSkip : EN PAUSE (OFF)'}">
            ${this.getPokeballSvg(20, enabled)}
          </div>
          <span class="pokeskip-hud-badge" id="pokeskip-hud-count" style="display: ${showCount ? 'inline-block' : 'none'};">${runCount} passée${runCount > 1 ? 's' : ''}</span>
        </div>
        <button id="pokeskip-hud-type-btn" title="Tableau des Types (Touche T)">⚔️</button>
      `;
      this.makeHudDraggable(hud);

      const typeBtn = hud.querySelector('#pokeskip-hud-type-btn');
      if (typeBtn) {
        typeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleTypeChart(false);
        });
      }

      document.body.appendChild(hud);
      this.hudContainer = hud;
    },

    applyHudPosition(hud) {
      if (!hud) return;
      const savedPos = Storage.get('pokeskip_hud_pos', null);
      if (!savedPos) return;

      const hudW = hud.offsetWidth || 120;
      const hudH = hud.offsetHeight || 40;
      const maxLeft = Math.max(10, window.innerWidth - hudW - 10);
      const maxTop = Math.max(10, window.innerHeight - hudH - 10);

      let targetLeft, targetTop;

      if (typeof savedPos.ratioX === 'number' && typeof savedPos.ratioY === 'number') {
        const rX = Math.max(0, Math.min(1, savedPos.ratioX));
        const rY = Math.max(0, Math.min(1, savedPos.ratioY));
        targetLeft = 10 + rX * (maxLeft - 10);
        targetTop = 10 + rY * (maxTop - 10);
      } else if (typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
        targetLeft = Math.max(10, Math.min(maxLeft, savedPos.x));
        targetTop = Math.max(10, Math.min(maxTop, savedPos.y));
        const rX = maxLeft > 10 ? (targetLeft - 10) / (maxLeft - 10) : 1;
        const rY = maxTop > 10 ? (targetTop - 10) / (maxTop - 10) : 0.5;
        Storage.set('pokeskip_hud_pos', {
          ratioX: Math.max(0, Math.min(1, rX)),
          ratioY: Math.max(0, Math.min(1, rY)),
          x: targetLeft,
          y: targetTop
        });
      } else {
        return;
      }

      hud.style.left = `${Math.round(targetLeft)}px`;
      hud.style.top = `${Math.round(targetTop)}px`;
      hud.style.right = 'auto';
      hud.style.transform = 'none';
    },

    makeHudDraggable(hud) {
      this.applyHudPosition(hud);

      let isDragging = false;
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;
      let hasMoved = false;

      hud.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (e.target && e.target.closest('#pokeskip-hud-type-btn')) return;
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;

        const rect = hud.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        hud.classList.add('dragging');
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasMoved = true;
        }

        const hudW = hud.offsetWidth || 120;
        const hudH = hud.offsetHeight || 40;
        const maxLeft = Math.max(10, window.innerWidth - hudW - 10);
        const maxTop = Math.max(10, window.innerHeight - hudH - 10);

        const newX = Math.max(10, Math.min(maxLeft, initialLeft + dx));
        const newY = Math.max(10, Math.min(maxTop, initialTop + dy));

        hud.style.left = `${newX}px`;
        hud.style.top = `${newY}px`;
        hud.style.right = 'auto';
        hud.style.transform = 'none';
      });

      window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        hud.classList.remove('dragging');

        if (hasMoved) {
          const rect = hud.getBoundingClientRect();
          const hudW = hud.offsetWidth || rect.width || 120;
          const hudH = hud.offsetHeight || rect.height || 40;
          const maxLeft = Math.max(10, window.innerWidth - hudW - 10);
          const maxTop = Math.max(10, window.innerHeight - hudH - 10);

          const clampedLeft = Math.max(10, Math.min(maxLeft, rect.left));
          const clampedTop = Math.max(10, Math.min(maxTop, rect.top));

          const ratioX = maxLeft > 10 ? (clampedLeft - 10) / (maxLeft - 10) : 1;
          const ratioY = maxTop > 10 ? (clampedTop - 10) / (maxTop - 10) : 0.5;

          Storage.set('pokeskip_hud_pos', {
            ratioX: Math.max(0, Math.min(1, ratioX)),
            ratioY: Math.max(0, Math.min(1, ratioY)),
            x: clampedLeft,
            y: clampedTop
          });

          hud.style.left = `${Math.round(clampedLeft)}px`;
          hud.style.top = `${Math.round(clampedTop)}px`;
          hud.style.right = 'auto';
          hud.style.transform = 'none';
        }
      });

      hud.addEventListener('click', (e) => {
        if (hasMoved) {
          e.stopPropagation();
          hasMoved = false;
          return;
        }
        if (e.target && e.target.closest('#pokeskip-hud-type-btn')) {
          return;
        }
        if (e.target && e.target.closest('.pokeskip-hud-pill')) {
          this.toggleModal();
        }
      });
    },

    updateHudBadge() {
      const hud = document.getElementById('pokeskip-hud');
      const pill = hud?.querySelector('.pokeskip-hud-pill');
      const ball = hud?.querySelector('.pokeskip-hud-ball');
      const ballWrap = hud?.querySelector('.pokeskip-hud-ball-wrap');
      const countEl = document.getElementById('pokeskip-hud-count');
      const dividerEl = document.getElementById('pokeskip-hud-divider');
      const statusEl = document.querySelector('.pokeskip-hud-status');
      const enabled = PokeSkip.settings.enabled;
      const showCount = PokeSkip.settings.showHudCount !== false;
      const runCount = PokeSkip.getRunSkippedCount();

      if (hud) {
        hud.classList.toggle('on', !!enabled);
        hud.classList.toggle('off', !enabled);
        hud.title = `PokéSkip (${enabled ? 'Actif - ON' : 'En pause - OFF'}) • Raccourci P • Glisser pour déplacer`;
      }
      if (pill) {
        pill.title = `PokéSkip (${enabled ? 'Actif - ON' : 'En pause - OFF'}) • Clic pour gérer les capacités • Raccourci P`;
      }
      if (ballWrap) {
        ballWrap.title = enabled ? 'PokéSkip : ACTIF (ON)' : 'PokéSkip : EN PAUSE (OFF)';
      }
      if (ball) {
        ball.classList.toggle('on', !!enabled);
        ball.classList.toggle('off', !enabled);
        const centerDot = ball.querySelector('.pks-ball-center-dot');
        if (centerDot) {
          centerDot.setAttribute('fill', enabled ? '#34d399' : '#475569');
        }
      }
      if (countEl) {
        countEl.textContent = `${runCount} passée${runCount > 1 ? 's' : ''}`;
        countEl.style.display = showCount ? 'inline-block' : 'none';
      }
      if (dividerEl) {
        dividerEl.style.display = 'none';
      }
      if (statusEl) {
        statusEl.className = `pokeskip-hud-status ${enabled ? 'on' : 'off'}`;
        statusEl.textContent = enabled ? '● ON' : '○ OFF';
      }
    },

    createModal() {
      if (document.getElementById('pokeskip-modal-backdrop')) return;
      const backdrop = document.createElement('div');
      backdrop.id = 'pokeskip-modal-backdrop';
      backdrop.innerHTML = `
        <div id="pokeskip-modal">
          <div class="pokeskip-modal-header">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${this.getPokeballSvg(26)}
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #f8fafc; letter-spacing: -0.2px;">PokéSkip</h2>
                  <span class="pokeskip-header-badge">Auto-Skip Intelligent</span>
                </div>
                <span style="font-size: 11.5px; color: #94a3b8;">Gestion automatisée des nouvelles capacités par Pokémon</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 14px;">
              <label class="pokeskip-switch-label" title="Activer / Désactiver PokéSkip">
                <span class="pokeskip-switch-text ${PokeSkip.settings.enabled ? 'active' : ''}" id="pokeskip-switch-status-text">${PokeSkip.settings.enabled ? 'Actif' : 'Inactif'}</span>
                <span class="pokeskip-switch">
                  <input type="checkbox" id="pokeskip-toggle-enabled" ${PokeSkip.settings.enabled ? 'checked' : ''}>
                  <span class="pokeskip-slider"></span>
                </span>
              </label>
              <button id="pokeskip-modal-close" class="pokeskip-close-btn" title="Fermer la fenêtre (Échap)">✕</button>
            </div>
          </div>

          <div class="pokeskip-modal-tabs">
            <button class="pokeskip-tab-btn active" data-tab="team"><span>⚔️</span> <span>Mon Équipe</span></button>
            <button class="pokeskip-tab-btn" data-tab="saved"><span>🧬</span> <span>Règles & Espèces</span></button>
            <button class="pokeskip-tab-btn" data-tab="settings"><span>⚙️</span> <span>Paramètres</span></button>
          </div>

          <div class="pokeskip-modal-body" id="pokeskip-body-team">
            <div id="pokeskip-team-selector" class="pokeskip-team-row"></div>
            <div id="pokeskip-selected-pokemon-content"></div>
          </div>

          <div class="pokeskip-modal-body" id="pokeskip-body-saved" style="display: none;">
            <div id="pokeskip-saved-species-list"></div>
          </div>

          <div class="pokeskip-modal-body" id="pokeskip-body-settings" style="display: none;">
            <div style="max-width: 500px; display: flex; flex-direction: column; gap: 16px;">
              <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 12px;">
                <h4 style="margin: 0 0 2px 0; font-size: 14px; color: #38bdf8;">Notifications & Alertes</h4>
                
                <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
                  <input type="checkbox" id="pokeskip-opt-toasts" ${PokeSkip.settings.showToasts ? 'checked' : ''} style="accent-color: #38bdf8;">
                  Afficher les notifications toast lors d'un auto-skip
                </label>

                <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
                  <input type="checkbox" id="pokeskip-opt-hud-count" ${PokeSkip.settings.showHudCount !== false ? 'checked' : ''} style="accent-color: #38bdf8;">
                  Afficher le compteur de capacités passées sur la pastille
                </label>

                <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; display: flex; flex-direction: column; gap: 10px;">
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
                    <input type="checkbox" id="pokeskip-opt-quick-prompt" ${PokeSkip.settings.showQuickPrompt !== false ? 'checked' : ''} style="accent-color: #38bdf8;">
                    Proposer d'ignorer pour toujours une nouvelle attaque en combat
                  </label>
                  
                  <div id="pokeskip-opt-duration-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8; padding-left: 24px; opacity: ${PokeSkip.settings.showQuickPrompt !== false ? '1' : '0.4'};">
                    <span>Durée d'affichage du message rapide :</span>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="number" id="pokeskip-opt-quick-duration" min="3" max="60" value="${PokeSkip.settings.quickPromptDuration || 15}" ${PokeSkip.settings.showQuickPrompt === false ? 'disabled' : ''} style="width: 50px; background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f8fafc; padding: 4px 6px; text-align: center; font-size: 12px;">
                      <span>secondes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <h4 style="margin: 0; font-size: 14px; color: #c084fc; display: flex; align-items: center; gap: 6px;">
                    <span>⚡ Mode Avancé : Remplacement d'Attaques</span>
                  </h4>
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #fff; font-weight: 600;">
                    <input type="checkbox" id="pokeskip-opt-advanced-mode" ${PokeSkip.settings.advancedMode ? 'checked' : ''} style="accent-color: #a855f7; width: 16px; height: 16px;">
                    Activer
                  </label>
                </div>
                <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
                  Permet de configurer des remplacements automatiques d'anciennes attaques lorsqu'une nouvelle capacité (non ignorée) est apprise et que le Pokémon possède déjà 4 attaques.
                </div>
                <div id="pokeskip-advanced-status-desc" style="font-size: 11px; color: ${PokeSkip.settings.advancedMode ? '#a855f7' : '#64748b'};">
                  ${PokeSkip.settings.advancedMode ? '✓ Actif : les sections de remplacement sont visibles dans les onglets.' : '✕ Désactivé : les règles sont conservées mais non exécutées.'}
                </div>
              </div>

              <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #38bdf8;">Exportation / Importation</h4>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8;">Transférez vos règles de skip vers un autre navigateur ou ordinateur.</p>
                <div style="display: flex; gap: 10px;">
                  <button id="pokeskip-btn-export" style="background:#0284c7; color:#fff; border:1px solid #38bdf8; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">📤 Exporter (JSON)</button>
                  <button id="pokeskip-btn-import" style="background:#1e293b; color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">📥 Importer (JSON)</button>
                </div>
              </div>

              <div style="background: rgba(225,29,72,0.1); padding: 14px; border-radius: 10px; border: 1px solid rgba(225,29,72,0.25);">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #f43f5e;">Réinitialisation</h4>
                <button id="pokeskip-btn-reset-rules" style="background:#be123c; border:1px solid #f43f5e; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">
                  Supprimer toutes mes règles enregistrées
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      this.modalContainer = backdrop;

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
      document.getElementById('pokeskip-modal-close').addEventListener('click', () => this.closeModal());

      document.getElementById('pokeskip-toggle-enabled').addEventListener('change', (e) => {
        PokeSkip.settings.enabled = e.target.checked;
        PokeSkip.saveSettings();
        this.updateHudBadge();
        const statusText = document.getElementById('pokeskip-switch-status-text');
        if (statusText) {
          statusText.textContent = PokeSkip.settings.enabled ? 'Actif' : 'Inactif';
          statusText.classList.toggle('active', PokeSkip.settings.enabled);
        }
        this.showToast(PokeSkip.settings.enabled ? 'PokéSkip activé' : 'PokéSkip en pause', 'info');
      });

      backdrop.querySelectorAll('.pokeskip-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          backdrop.querySelectorAll('.pokeskip-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.dataset.tab;
          document.getElementById('pokeskip-body-team').style.display = tab === 'team' ? 'block' : 'none';
          document.getElementById('pokeskip-body-saved').style.display = tab === 'saved' ? 'block' : 'none';
          document.getElementById('pokeskip-body-settings').style.display = tab === 'settings' ? 'block' : 'none';
          if (tab === 'saved') this.renderSavedSpeciesTab();
        });
      });

      document.getElementById('pokeskip-opt-toasts').addEventListener('change', (e) => {
        PokeSkip.settings.showToasts = e.target.checked;
        PokeSkip.saveSettings();
      });

      const optHudCount = document.getElementById('pokeskip-opt-hud-count');
      if (optHudCount) {
        optHudCount.addEventListener('change', (e) => {
          PokeSkip.settings.showHudCount = e.target.checked;
          PokeSkip.saveSettings();
          this.updateHudBadge();
        });
      }

      const optAdvancedMode = document.getElementById('pokeskip-opt-advanced-mode');
      if (optAdvancedMode) {
        optAdvancedMode.addEventListener('change', (e) => {
          PokeSkip.settings.advancedMode = e.target.checked;
          PokeSkip.saveSettings();
          const statusDesc = document.getElementById('pokeskip-advanced-status-desc');
          if (statusDesc) {
            statusDesc.textContent = e.target.checked
              ? '✓ Actif : les sections de remplacement sont visibles dans les onglets.'
              : '✕ Désactivé : les règles sont conservées mais non exécutées.';
            statusDesc.style.color = e.target.checked ? '#a855f7' : '#64748b';
          }
          this.showToast(
            e.target.checked ? '⚡ Mode Avancé activé' : 'Mode Avancé désactivé (règles conservées)',
            e.target.checked ? 'success' : 'info'
          );
        });
      }

      const optQuickPrompt = document.getElementById('pokeskip-opt-quick-prompt');
      const optQuickDuration = document.getElementById('pokeskip-opt-quick-duration');
      const optDurationContainer = document.getElementById('pokeskip-opt-duration-container');

      if (optQuickPrompt) {
        optQuickPrompt.addEventListener('change', (e) => {
          PokeSkip.settings.showQuickPrompt = e.target.checked;
          PokeSkip.saveSettings();
          if (optDurationContainer) {
            optDurationContainer.style.opacity = e.target.checked ? '1' : '0.4';
          }
          if (optQuickDuration) {
            optQuickDuration.disabled = !e.target.checked;
          }
        });
      }

      if (optQuickDuration) {
        optQuickDuration.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val) && val >= 3 && val <= 120) {
            PokeSkip.settings.quickPromptDuration = val;
            PokeSkip.saveSettings();
          }
        });
        optQuickDuration.addEventListener('change', (e) => {
          let val = parseInt(e.target.value, 10);
          if (isNaN(val) || val < 3) val = 3;
          if (val > 120) val = 120;
          e.target.value = val;
          PokeSkip.settings.quickPromptDuration = val;
          PokeSkip.saveSettings();
        });
      }

      document.getElementById('pokeskip-btn-export').addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(PokeSkip.rules, null, 2));
        const a = document.createElement('a');
        a.setAttribute('href', dataStr);
        a.setAttribute('download', `pokeskip-rules-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        this.showToast('Règles exportées en fichier JSON', 'success');
      });

      document.getElementById('pokeskip-btn-import').addEventListener('click', () => {
        const json = prompt('Collez ici le contenu JSON de vos règles :');
        if (!json) return;
        try {
          const parsed = JSON.parse(json);
          if (typeof parsed === 'object') {
            PokeSkip.rules = { ...PokeSkip.rules, ...parsed };
            PokeSkip.saveRules();
            this.showToast('Règles importées avec succès !', 'success');
            this.renderTeamTab();
          }
        } catch (err) {
          alert('Erreur : le format JSON est invalide.');
        }
      });

      document.getElementById('pokeskip-btn-reset-rules').addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment effacer TOUTES les règles enregistrées ? Rien ne sera plus skip.')) {
          PokeSkip.rules = {};
          PokeSkip.saveRules();
          this.showToast('Toutes les règles ont été effacées.', 'warning');
          this.renderTeamTab();
        }
      });
    },

    toggleModal() {
      if (!this.modalContainer) this.createModal();
      if (this.modalContainer.classList.contains('active')) {
        this.closeModal();
      } else {
        this.openModal();
      }
    },

    openModal() {
      this.refreshPartyFromGame();
      this.renderTeamTab();
      this.modalContainer.classList.add('active');
    },

    closeModal() {
      if (this.modalContainer) {
        this.modalContainer.classList.remove('active');
      }
    },

    typeChartContainer: null,
    typeChartOpenedViaKey: false,
    typeChartViewMode: 'simplified',
    typeChartShowImmunities: true,

    createTypeChartContainer() {
      if (document.getElementById('pokeskip-typechart-overlay')) {
        this.typeChartContainer = document.getElementById('pokeskip-typechart-overlay');
        this.typeChartViewMode = Storage.get('pokeskip_typechart_view_mode', 'simplified');
        this.typeChartShowImmunities = Storage.get('pokeskip_typechart_show_immunities', true);
        return;
      }
      this.typeChartViewMode = Storage.get('pokeskip_typechart_view_mode', 'simplified');
      this.typeChartShowImmunities = Storage.get('pokeskip_typechart_show_immunities', true);
      const overlay = document.createElement('div');
      overlay.id = 'pokeskip-typechart-overlay';
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hideTypeChart(false);
        }
      });
      document.body.appendChild(overlay);
      this.typeChartContainer = overlay;
    },

    getTypeChartContentHtml(mode) {
      const enemyInfo = getActiveEnemyTypes();
      const enemyTypeIndices = enemyInfo.types || [];
      const types18 = POKEMON_TYPES.slice(0, 18);

      let bodyHtml = '';
      let footerHtml = '';

      if (mode === 'table') {
        bodyHtml = `
          <div class="pokeskip-typechart-table-wrap">
            <div class="pokeskip-table-stage">
              <table class="pokeskip-typechart-table">
                <thead>
                  <tr>
                    <th class="pokeskip-th-corner">
                      <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; font-size: 8.5px; padding: 3px 2px; box-sizing: border-box;">
                        <span style="align-self: flex-end; color: #38bdf8; font-weight: 800;">🛡️ Déf. ➔</span>
                        <span style="align-self: flex-start; color: #f8fafc; font-weight: 800;">⬇ ⚔️ Att.</span>
                      </div>
                    </th>
                    ${types18.map((t, colIdx) => {
                      const isHigh = enemyTypeIndices.includes(colIdx);
                      return `
                        <th class="pokeskip-th-col ${isHigh ? 'highlighted-col' : ''}" data-col="${colIdx}" style="background-color: ${t.bg};" title="Défenseur : ${t.name}">
                          <div class="pokeskip-th-col-content">
                            ${isHigh ? '<span class="pokeskip-col-marker">🎯</span>' : ''}
                            <span class="pokeskip-th-col-name">${t.name}</span>
                          </div>
                        </th>
                      `;
                    }).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${types18.map((rowType, rowIdx) => `
                    <tr>
                      <th class="pokeskip-th-row" data-row="${rowIdx}" style="background-color: ${rowType.bg};" title="Attaquant : ${rowType.name}">
                        ${rowType.name}
                      </th>
                      ${types18.map((colType, colIdx) => {
                        const mult = TYPE_CHART[rowIdx][colIdx];
                        let cellContent = '—';
                        let cellClass = 'neutral';
                        if (mult === 2) {
                          cellContent = '2';
                          cellClass = 'super';
                        } else if (mult === 0.5) {
                          cellContent = '½';
                          cellClass = 'half';
                        } else if (mult === 0) {
                          cellContent = '0';
                          cellClass = 'zero';
                        }
                        return `
                          <td class="pokeskip-td-cell ${cellClass}" data-row="${rowIdx}" data-col="${colIdx}" title="${rowType.name} ➔ ${colType.name} : ×${mult}">
                            ${cellContent}
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="pokeskip-col-bubble-layer"></div>
            </div>
          </div>
        `;

        footerHtml = `
          <div class="pokeskip-typechart-footer">
            <div class="pokeskip-typechart-legend">
              <span class="legend-badge super">2</span> <span>×2 Super</span>
              <span class="legend-badge half">½</span> <span>×0.5 Peu</span>
              <span class="legend-badge zero">0</span> <span>×0 Inefficace</span>
              <span class="legend-badge neutral">—</span> <span>×1 Neutre</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">
              <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">T</kbd> ou <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">Échap</kbd> Fermer
            </div>
          </div>
        `;
      } else {
        // Mode Simplifié
        const showImmunities = this.typeChartShowImmunities;
        const SIMPLIFIED_ORDER_NAMES = [
          'Fée', 'Acier', 'Ténèbres', 'Dragon', 'Spectre', 'Roche',
          'Insecte', 'Psy', 'Vol', 'Sol', 'Poison', 'Combat',
          'Glace', 'Plante', 'Électrik', 'Eau', 'Feu', 'Normal'
        ];

        const getRowHtml = (name, isEnemy) => {
          const idx = types18.findIndex(item => item.name === name);
          if (idx === -1) return '';
          const t = types18[idx];
          const weaknesses = [];
          const strengths = [];
          const immunities = [];

          for (let otherIdx = 0; otherIdx < 18; otherIdx++) {
            if (TYPE_CHART[otherIdx][idx] === 2) weaknesses.push(types18[otherIdx]);
            if (TYPE_CHART[idx][otherIdx] === 2) strengths.push(types18[otherIdx]);
            if (TYPE_CHART[otherIdx][idx] === 0) immunities.push(types18[otherIdx]);
          }

          const weakPills = weaknesses.map(w => `
            <span class="pokeskip-badge-pill" data-type="${w.name}" style="background-color: ${w.bg};" title="Subit ×2 de ${w.name}">
              ${w.name}
            </span>
          `).join('');

          const strongPills = strengths.map(s => `
            <span class="pokeskip-badge-pill" data-type="${s.name}" style="background-color: ${s.bg};" title="Inflige ×2 à ${s.name}">
              ${s.name}
            </span>
          `).join('');

          const immPills = immunities.length > 0 ? `
            <div class="pokeskip-ref-immunity-wrap" style="${showImmunities ? '' : 'display: none;'}">
              <div style="display: inline-flex; align-items: center; margin-right: 4px; padding-right: 4px; border-right: 1px solid rgba(255,255,255,0.12);">
                ${immunities.map(imm => `
                  <span class="pokeskip-badge-pill" data-type="${imm.name}" style="background-color: ${imm.bg}; opacity: 0.85;" title="Immunisé contre ${imm.name} (×0)">
                    ${imm.name}<span class="pokeskip-mult-tag x0">×0</span>
                  </span>
                `).join('')}
              </div>
            </div>
          ` : '';

          return `
            <div class="pokeskip-ref-row ${isEnemy ? 'enemy-row' : ''}">
              <div class="pokeskip-ref-left">
                ${immPills}
                ${weakPills}
              </div>
              <div class="pokeskip-ref-arrow-left">➔</div>
              <div class="pokeskip-ref-center">
                <span class="pokeskip-badge-pill" data-type="${t.name}" style="background-color: ${t.bg};" title="${t.name}">
                  ${t.name}
                </span>
              </div>
              <div class="pokeskip-ref-arrow-right">➔</div>
              <div class="pokeskip-ref-right">
                ${strongPills}
              </div>
            </div>
          `;
        };

        const isEnemyList = SIMPLIFIED_ORDER_NAMES.map(name => {
          const idx = types18.findIndex(item => item.name === name);
          return idx !== -1 && enemyTypeIndices.includes(idx);
        });

        const rowNodesHtml = [];
        for (let i = 0; i < SIMPLIFIED_ORDER_NAMES.length; i++) {
          const isEnemy = isEnemyList[i];
          const isNextEnemy = (i + 1 < SIMPLIFIED_ORDER_NAMES.length) && isEnemyList[i + 1];

          if (isEnemy && isNextEnemy) {
            // Deux types adverses consécutifs (l'un au-dessus de l'autre) :
            // Englobés dans une seule et unique bulle !
            const row1 = getRowHtml(SIMPLIFIED_ORDER_NAMES[i], true);
            const row2 = getRowHtml(SIMPLIFIED_ORDER_NAMES[i + 1], true);
            rowNodesHtml.push(`
              <div class="pokeskip-ref-enemy-bubble">
                ${row1}
                ${row2}
              </div>
            `);
            i++;
          } else if (isEnemy) {
            // Type adverse isolé dans sa propre bulle
            const row = getRowHtml(SIMPLIFIED_ORDER_NAMES[i], true);
            rowNodesHtml.push(`
              <div class="pokeskip-ref-enemy-bubble">
                ${row}
              </div>
            `);
          } else {
            // Ligne normale
            rowNodesHtml.push(getRowHtml(SIMPLIFIED_ORDER_NAMES[i], false));
          }
        }

        bodyHtml = `
          <div class="pokeskip-ref-container ${showImmunities ? '' : 'pks-hide-immunities'}">
            <div class="pokeskip-ref-header">
              <div class="pokeskip-ref-left-label">
                <label class="pokeskip-tc-switch" title="Afficher ou masquer les immunités (×0)">
                  <input type="checkbox" class="pks-immunity-checkbox" ${showImmunities ? 'checked' : ''}>
                  <span class="pks-tc-slider"></span>
                  <span class="pks-tc-label">🛡️ Immunités (×0)</span>
                </label>
                <span>⚠️ Faiblesses (reçoit ×2)</span>
              </div>
              <div class="pokeskip-ref-center-label">Type</div>
              <div class="pokeskip-ref-right-label">Forces (inflige ×2) ⚔️</div>
            </div>
            ${rowNodesHtml.join('')}
          </div>
        `;

        footerHtml = `
          <div class="pokeskip-typechart-footer">
            <div class="pokeskip-typechart-legend">
              <span style="color: #fca5a5; font-weight: 700;">Faiblesses ➔</span> <span>Types reçus ×2</span>
              <span style="margin: 0 4px; color: #475569;">•</span>
              <span style="color: #86efac; font-weight: 700;">➔ Forces</span> <span>Types infligés ×2</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">
              <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">T</kbd> ou <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">Échap</kbd> Fermer
            </div>
          </div>
        `;
      }

      return { bodyHtml, footerHtml };
    },

    updateTypeChartColumnBubbles() {
      if (!this.typeChartContainer) return;
      const stage = this.typeChartContainer.querySelector('.pokeskip-table-stage');
      const table = this.typeChartContainer.querySelector('.pokeskip-typechart-table');
      const bubbleLayer = this.typeChartContainer.querySelector('.pokeskip-col-bubble-layer');
      if (!stage || !table || !bubbleLayer) return;

      bubbleLayer.innerHTML = '';

      const enemyInfo = getActiveEnemyTypes();
      const enemyTypeIndices = enemyInfo.types || [];
      const validCols = [...new Set(enemyTypeIndices)]
        .filter(idx => idx >= 0 && idx < 18)
        .sort((a, b) => a - b);

      if (validCols.length === 0) return;

      // Grouper les colonnes contiguës
      const clusters = [];
      let currentCluster = [];
      for (const col of validCols) {
        if (currentCluster.length === 0) {
          currentCluster.push(col);
        } else {
          const last = currentCluster[currentCluster.length - 1];
          if (col === last + 1) {
            currentCluster.push(col);
          } else {
            clusters.push(currentCluster);
            currentCluster = [col];
          }
        }
      }
      if (currentCluster.length > 0) clusters.push(currentCluster);

      for (const cluster of clusters) {
        const firstCol = cluster[0];
        const lastCol = cluster[cluster.length - 1];
        const thFirst = table.querySelector(`.pokeskip-th-col[data-col="${firstCol}"]`);
        const thLast = table.querySelector(`.pokeskip-th-col[data-col="${lastCol}"]`);
        if (!thFirst || !thLast) continue;

        const left = thFirst.offsetLeft - 1;
        const right = thLast.offsetLeft + thLast.offsetWidth + 1;
        const width = right - left;
        const top = thFirst.offsetTop - 1;
        const height = table.offsetHeight - top + 1;

        const bubble = document.createElement('div');
        bubble.className = 'pokeskip-col-bubble';
        bubble.style.left = `${left}px`;
        bubble.style.top = `${top}px`;
        bubble.style.width = `${width}px`;
        bubble.style.height = `${height}px`;

        bubbleLayer.appendChild(bubble);
      }
    },

    switchTypeChartTab(newMode) {
      if (!this.typeChartContainer) return;
      this.typeChartViewMode = newMode;
      Storage.set('pokeskip_typechart_view_mode', newMode);

      const modeBtns = this.typeChartContainer.querySelectorAll('.pokeskip-mode-btn');
      modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === newMode);
      });

      const { bodyHtml, footerHtml } = this.getTypeChartContentHtml(newMode);

      const bodyEl = this.typeChartContainer.querySelector('.pokeskip-typechart-body');
      const footerEl = this.typeChartContainer.querySelector('.pokeskip-typechart-footer-wrap');

      if (bodyEl) {
        bodyEl.innerHTML = bodyHtml;
        bodyEl.classList.remove('pks-tab-fade');
        void bodyEl.offsetWidth;
        bodyEl.classList.add('pks-tab-fade');
      }
      if (footerEl) {
        footerEl.innerHTML = footerHtml;
      }

      this.bindTypeChartTabEvents(newMode);
    },

    bindTypeChartTabEvents(mode) {
      if (!this.typeChartContainer) return;

      if (mode === 'table') {
        this.updateTypeChartColumnBubbles();
        requestAnimationFrame(() => this.updateTypeChartColumnBubbles());
      } else {
        const checkbox = this.typeChartContainer.querySelector('.pks-immunity-checkbox');
        if (checkbox) {
          checkbox.addEventListener('change', (e) => {
            this.typeChartShowImmunities = e.target.checked;
            Storage.set('pokeskip_typechart_show_immunities', this.typeChartShowImmunities);
            const container = this.typeChartContainer.querySelector('.pokeskip-ref-container');
            if (container) {
              container.classList.toggle('pks-hide-immunities', !this.typeChartShowImmunities);
              container.querySelectorAll('.pokeskip-ref-immunity-wrap').forEach(el => {
                el.style.display = this.typeChartShowImmunities ? '' : 'none';
              });
            }
          });
        }
      }
    },

    renderTypeChart() {
      if (!this.typeChartContainer) this.createTypeChartContainer();
      if (!this.typeChartViewMode) {
        this.typeChartViewMode = Storage.get('pokeskip_typechart_view_mode', 'simplified');
      }
      if (this.typeChartShowImmunities === undefined) {
        this.typeChartShowImmunities = Storage.get('pokeskip_typechart_show_immunities', true);
      }
      const mode = this.typeChartViewMode;

      const enemyInfo = getActiveEnemyTypes();
      const enemyTypeIndices = enemyInfo.types || [];
      const hasEnemy = enemyTypeIndices.length > 0;

      const enemiesList = (hasEnemy && enemyInfo.enemies && enemyInfo.enemies.length > 0)
        ? enemyInfo.enemies
        : (hasEnemy ? [{ name: enemyInfo.name || 'Adversaire', types: enemyTypeIndices }] : []);

      let targetHeaderHtml = '';
      if (hasEnemy && enemiesList.length > 0) {
        const targetBlocks = enemiesList.map(en => {
          const badges = en.types.map(idx => {
            const t = POKEMON_TYPES[idx];
            return `<span class="pokeskip-badge-pill" style="background-color: ${t.bg}; margin-left: 2px;">${t.name}</span>`;
          }).join('');
          return `
            <div style="display: inline-flex; align-items: center; gap: 4px;">
              <span style="color: #ffffff; font-weight: 700; font-size: 11px;">${en.name}</span>
              ${badges}
            </div>
          `;
        }).join('<span style="color: #64748b; font-size: 11px; margin: 0 4px; font-weight: bold;">•</span>');

        targetHeaderHtml = `
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.14); border: 1px solid rgba(56, 189, 248, 0.4); padding: 2px 8px; border-radius: 6px; font-size: 11px; flex-wrap: wrap;">
            <span style="color: #38bdf8; font-weight: 800;">🎯 ${enemiesList.length > 1 ? 'Cibles :' : 'Cible :'}</span>
            ${targetBlocks}
          </div>
        `;
      }

      const { bodyHtml, footerHtml } = this.getTypeChartContentHtml(mode);

      this.typeChartContainer.innerHTML = `
        <div class="pokeskip-typechart-box">
          <div class="pokeskip-typechart-header">
            <div class="pokeskip-typechart-title-wrap">
              <span style="font-size: 16px;">⚔️</span>
              <span class="pokeskip-typechart-title">Forces & Faiblesses</span>
              <div class="pokeskip-mode-switch">
                <button class="pokeskip-mode-btn ${mode === 'simplified' ? 'active' : ''}" data-mode="simplified" title="Vue simplifiée">⚡ Simplifié</button>
                <button class="pokeskip-mode-btn ${mode === 'table' ? 'active' : ''}" data-mode="table" title="Matrice complète 18×18">📊 Complet</button>
              </div>
              <div class="pokeskip-typechart-targets-wrap">
                ${targetHeaderHtml}
              </div>
            </div>
            <button class="pokeskip-typechart-close" title="Fermer (T ou Échap)">&times;</button>
          </div>

          <div class="pokeskip-typechart-body pks-tab-fade">
            ${bodyHtml}
          </div>
          <div class="pokeskip-typechart-footer-wrap">
            ${footerHtml}
          </div>
        </div>
      `;

      // Event listeners des onglets
      const modeBtns = this.typeChartContainer.querySelectorAll('.pokeskip-mode-btn');
      modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newMode = btn.dataset.mode;
          if (newMode && newMode !== this.typeChartViewMode) {
            this.switchTypeChartTab(newMode);
          }
        });
      });

      // Fermeture
      const closeBtn = this.typeChartContainer.querySelector('.pokeskip-typechart-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.hideTypeChart(false);
        });
      }

      this.bindTypeChartTabEvents(mode);
      this.updateTypeChartResponsiveScale();
    },

    updateTypeChartResponsiveScale() {
      if (!this.typeChartContainer) return;
      const box = this.typeChartContainer.querySelector('.pokeskip-typechart-box');
      if (!box) return;

      const baseW = 770;
      const baseH = 620;
      const availW = window.innerWidth * 0.94;
      const availH = window.innerHeight * 0.90;

      let scale = Math.min(availW / baseW, availH / baseH);
      scale = Math.max(0.65, Math.min(2.5, scale));
      box.style.setProperty('--pks-tc-scale', scale.toFixed(2));
      if (this.typeChartViewMode === 'table') {
        this.updateTypeChartColumnBubbles();
      }
    },

    showTypeChart() {
      if (!this.typeChartContainer) {
        this.createTypeChartContainer();
      }
      this.renderTypeChart();
      this.typeChartContainer.style.display = 'flex';
      this.updateTypeChartResponsiveScale();
    },

    hideTypeChart() {
      if (this.typeChartContainer) {
        this.typeChartContainer.style.display = 'none';
      }
      this.typeChartOpenedViaKey = false;
    },

    toggleTypeChart() {
      if (this.typeChartContainer && this.typeChartContainer.style.display === 'flex') {
        this.hideTypeChart();
      } else {
        this.showTypeChart();
      }
    },

    bindHotkeys() {
      window.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) return;

        if (e.key === 'p' || e.key === 'P') {
          if (e.repeat) return;
          this.toggleModal();
        } else if (e.key === 't' || e.key === 'T') {
          if (e.repeat) return;
          this.toggleTypeChart();
        } else if (e.key === 'Escape') {
          if (this.typeChartContainer && this.typeChartContainer.style.display === 'flex') {
            this.hideTypeChart();
          } else {
            this.closeModal();
          }
        }
      });

      window.addEventListener('resize', () => {
        this.applyHudPosition(this.hudContainer || document.getElementById('pokeskip-hud'));
        if (this.typeChartContainer && this.typeChartContainer.style.display === 'flex') {
          this.updateTypeChartResponsiveScale();
        }
      });
    },

    refreshPartyFromGame() {
      PokeSkip.activeParty = [];
      try {
        if (PokeSkip.scene && PokeSkip.scene.party && Array.isArray(PokeSkip.scene.party)) {
          PokeSkip.activeParty = PokeSkip.scene.party.filter(Boolean);
        }
      } catch (e) {
        console.warn('[PokeSkip] Impossible de lire scene.party:', e);
      }
    },

    renderTeamTab() {
      const teamContainer = document.getElementById('pokeskip-team-selector');
      const contentContainer = document.getElementById('pokeskip-selected-pokemon-content');
      if (!teamContainer || !contentContainer) return;

      teamContainer.innerHTML = '';
      contentContainer.innerHTML = '';

      const party = PokeSkip.activeParty;

      if (!party || party.length === 0) {
        teamContainer.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: #94a3b8; background: #111a2e; border-radius: 12px;">
            ⚠️ Aucune partie en cours détectée ou équipe vide.<br>
            Lancez une partie dans PokéRogue pour voir votre équipe active, ou utilisez l'onglet <b>"Espèces Mémorisées"</b> !
          </div>
        `;
        return;
      }

      party.forEach((pkmn, idx) => {
        const familyInfo = LineageManager.getFamilyInfo(pkmn);
        const name = pkmn.name || pkmn.species?.name || `Pokémon #${idx + 1}`;
        const level = pkmn.level || 1;
        const shinyInfo = LineageManager.getPokemonShinyInfo(pkmn);
        const isMega = LineageManager.isPokemonMega(pkmn);
        const spriteUrl = LineageManager.getPokemonSpriteUrl(pkmn);

        const card = document.createElement('div');
        card.className = `pokeskip-member-card ${idx === this.selectedTeamIndex ? 'active' : ''}`;
        const speciesId = pkmn.species?.speciesId ?? pkmn.speciesId ?? LineageManager.getRootId(pkmn);
        const pkmVariant = shinyInfo.isShiny ? (typeof pkmn.variant === 'number' ? pkmn.variant : (typeof pkmn.shinyTier === 'number' ? Math.max(0, pkmn.shinyTier - 1) : 0)) : 0;
        card.innerHTML = `
          ${shinyInfo.isShiny ? `<span class="pokeskip-shiny-badge ${shinyInfo.className}" title="${shinyInfo.title}">${shinyInfo.stars}</span>` : ''}
          <div class="pokeskip-member-sprite-container">
            <img src="${spriteUrl}" alt="${name}" class="pokeskip-member-sprite"
                 data-pokeskip-species="${speciesId}" data-pokeskip-shiny="${shinyInfo.isShiny}" data-pokeskip-variant="${pkmVariant}"
                 loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display:none; font-size: 24px;">⚡</div>
          </div>
          <div class="pokeskip-member-name">${name}</div>
          <div style="font-size: 11px; color: #94a3b8;">Niv. ${level}</div>
          ${isMega ? '<div class="pokeskip-mega-badge">🧬 MÉGA</div>' : ''}
        `;
        card.addEventListener('click', () => {
          this.selectedTeamIndex = idx;
          this.renderTeamTab();
        });
        teamContainer.appendChild(card);
      });

      // Emplacements vides pour compléter jusqu'à 6 membres
      const MAX_PARTY_SLOTS = 6;
      for (let emptyIdx = party.length; emptyIdx < MAX_PARTY_SLOTS; emptyIdx++) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'pokeskip-member-card empty-slot';
        emptyCard.innerHTML = `
          <div class="pokeskip-member-sprite-container empty-sprite">
            <div class="pokeskip-empty-slot-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
          </div>
          <div class="pokeskip-member-name empty-name">Slot #${emptyIdx + 1}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">Libre</div>
        `;
        teamContainer.appendChild(emptyCard);
      }

      const currentPkmn = party[this.selectedTeamIndex] || party[0];
      if (currentPkmn) {
        this.renderPokemonMoveConfig(contentContainer, currentPkmn);
      }
    },

    renderPokemonMoveConfig(container, pokemon) {
      const familyInfo = LineageManager.getFamilyInfo(pokemon);
      const currentName = pokemon.species?.name || pokemon.name || 'Pokémon';
      const shinyInfo = LineageManager.getPokemonShinyInfo(pokemon);
      const isMega = LineageManager.isPokemonMega(pokemon);
      const currentSpeciesId = pokemon.species?.speciesId ?? pokemon.speciesId ?? LineageManager.getRootId(pokemon);
      const memberSprites = LineageManager.getLineageMemberSprites(familyInfo.familyKey, shinyInfo.isShiny, pokemon);
      const rule = PokeSkip.getFamilyRule(familyInfo.familyKey) || { skippedMoves: {}, skipAll: false };
      const isRuleActive = PokeSkip.isFamilyRuleEnabled(familyInfo.familyKey);

      // Récupération de TOUTES les attaques apprenables (futures + actuelles)
      const learnable = getPokemonFullLearnset(pokemon);

      container.innerHTML = `
        <div class="pokeskip-lineage-header-box">
          <div class="pokeskip-lineage-title-row">
            <div class="pokeskip-lineage-title">
              <span>Lignée de <b>${currentName}</b></span>
              <span class="pokeskip-lineage-lvl">Niv. ${pokemon.level || 1}</span>
              ${shinyInfo.isShiny ? `<span class="pokeskip-shiny-badge ${shinyInfo.className}" style="position:static;" title="${shinyInfo.title}">${shinyInfo.stars}</span>` : ''}
              ${isMega ? '<span class="pokeskip-mega-badge">🧬 MÉGA</span>' : ''}
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <label class="pokeskip-switch-label" title="Activer ou mettre en pause l'auto-skip pour cette lignée">
                <span class="pokeskip-switch-text ${isRuleActive ? 'active' : ''}" id="pokeskip-lineage-switch-text">
                  ${isRuleActive ? 'Paramétrage actif' : 'Paramétrage en pause'}
                </span>
                <span class="pokeskip-switch">
                  <input type="checkbox" id="pokeskip-toggle-lineage-active" ${isRuleActive ? 'checked' : ''}>
                  <span class="pokeskip-slider"></span>
                </span>
              </label>
            </div>
          </div>

          ${LineageManager.renderEvolutionChainHtml(memberSprites, currentSpeciesId, false)}
        </div>

        <div style="background: #0f172a; padding: 16px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.2);">
          <div id="pokeskip-pokemon-replacements-slot"></div>

          <div style="display: flex; gap: 10px; margin-bottom: 14px; margin-top: 14px;">
            <input type="text" id="pokeskip-move-filter" placeholder="Filtrer une attaque par nom ou espèce..." style="background:#111a2e; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:7px 12px; color:#fff; font-size:13px; outline:none; flex:1;">
          </div>

          <div class="pokeskip-moves-container" id="pokeskip-moves-grid-el"></div>
        </div>
      `;

      const grid = container.querySelector('#pokeskip-moves-grid-el');
      const lineageToggleInput = container.querySelector('#pokeskip-toggle-lineage-active');
      const lineageToggleText = container.querySelector('#pokeskip-lineage-switch-text');

      const updateLineageToggle = () => {
        const active = PokeSkip.isFamilyRuleEnabled(familyInfo.familyKey);
        if (lineageToggleInput) lineageToggleInput.checked = active;
        if (lineageToggleText) {
          lineageToggleText.className = `pokeskip-switch-text ${active ? 'active' : ''}`;
          lineageToggleText.textContent = active ? 'Paramétrage actif' : 'Paramétrage en pause';
        }
      };

      if (lineageToggleInput) {
        lineageToggleInput.addEventListener('change', () => {
          const isNowActive = PokeSkip.toggleFamilyRuleEnabled(familyInfo.familyKey);
          updateLineageToggle();
          if (isNowActive) {
            UI.showToast(`✅ Paramétrage réactivé pour <b>${familyInfo.lineageName}</b>`, 'success');
          } else {
            UI.showToast(`⏸️ Paramétrage mis en pause pour <b>${familyInfo.lineageName}</b> (sélections conservées)`, 'info');
          }
        });
      }

      const renderGrid = (filter = '') => {
        grid.innerHTML = '';
        const currentRule = PokeSkip.getFamilyRule(familyInfo.familyKey) || { skippedMoves: {} };

        const filtered = learnable.filter(m => {
          if (!filter) return true;
          const f = filter.toLowerCase();
          return m.name.toLowerCase().includes(f) || (m.evolutionSpecies && m.evolutionSpecies.toLowerCase().includes(f));
        });

        if (filtered.length === 0) {
          grid.innerHTML = `<div style="color: #64748b; font-size: 13px; text-align: center; padding: 20px;">Aucune capacité trouvée.</div>`;
          return;
        }

        filtered.forEach(moveItem => {
          const isSkipped = PokeSkip.isMoveSkipped(pokemon, moveItem.name, moveItem.moveId);
          const isKept = !isSkipped;
          const cardEl = document.createElement('div');
          cardEl.className = `pokeskip-move-card ${isSkipped ? 'skipped' : ''}`;

          let lvlStyle = '';
          if (moveItem.level === 'Actuelle') {
            lvlStyle = 'style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);"';
          } else if (moveItem.level === 'Évolution') {
            lvlStyle = 'style="background: rgba(56, 189, 248, 0.18); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35);"';
          }

          const lvlLabel = typeof moveItem.level === 'number' ? `Niv. ${moveItem.level}` : moveItem.level;

          cardEl.innerHTML = `
            <div class="pokeskip-move-top">
              <div class="pokeskip-move-left">
                <span class="pokeskip-move-lvl-pill" ${lvlStyle}>${lvlLabel}</span>
                <span class="pokeskip-move-name-txt">${moveItem.name}</span>
                ${moveItem.evolutionSpecies ? `<span class="pokeskip-evo-tag" title="Capacité apprise par ${moveItem.evolutionSpecies} dans cette lignée">🧬 ${moveItem.evolutionSpecies}</span>` : ''}
                <span class="pokeskip-type-tag" style="background:${moveItem.type.bg}; color:${moveItem.type.color};">${moveItem.type.name}</span>
                <span class="pokeskip-cat-tag" style="color:${moveItem.category.color};">${moveItem.category.icon} ${moveItem.category.name}</span>
              </div>
              <div class="pokeskip-move-right">
                <span class="pokeskip-stat-pill">⚔️ Puissance : <b>${moveItem.power}</b></span>
                <span class="pokeskip-stat-pill" style="border-color: rgba(56, 189, 248, 0.3);">🎯 Précision : <b style="color: #38bdf8;">${moveItem.accuracy}</b></span>
                <span class="pokeskip-stat-pill">🔋 PP : <b>${moveItem.pp}</b></span>
                <span class="pokeskip-keep-badge ${isKept ? 'kept' : 'skip'}">${isKept ? '✓ Gardée' : '✕ Ignorée'}</span>
                <input type="checkbox" class="pokeskip-checkbox" ${isKept ? 'checked' : ''} title="${isKept ? 'Attaque gardée (décocher pour ignorer)' : 'Attaque ignorée (cocher pour garder)'}">
              </div>
            </div>
            ${moveItem.desc ? `<div class="pokeskip-move-desc">${moveItem.desc}</div>` : ''}
          `;

          const checkbox = cardEl.querySelector('.pokeskip-checkbox');
          const badge = cardEl.querySelector('.pokeskip-keep-badge');

          const updateCardState = (kept) => {
            checkbox.checked = kept;
            cardEl.classList.toggle('skipped', !kept);
            if (badge) {
              badge.className = `pokeskip-keep-badge ${kept ? 'kept' : 'skip'}`;
              badge.textContent = kept ? '✓ Gardée' : '✕ Ignorée';
            }
            PokeSkip.setMoveSkipped(pokemon, currentName, moveItem.name, moveItem.moveId, !kept);
            UI.updateHudBadge();
            updateLineageToggle();
          };

          cardEl.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
              updateCardState(!checkbox.checked);
            }
          });
          checkbox.addEventListener('change', () => {
            updateCardState(checkbox.checked);
          });

          grid.appendChild(cardEl);
        });
      };

      renderGrid();
      updateLineageToggle();

      container.querySelector('#pokeskip-move-filter').addEventListener('input', (e) => {
        renderGrid(e.target.value);
      });

      if (PokeSkip.settings.advancedMode) {
        const slotEl = container.querySelector('#pokeskip-pokemon-replacements-slot');
        if (slotEl) {
          const currentMoveset = typeof pokemon.getMoveset === 'function' ? pokemon.getMoveset() : (pokemon.moveset || []);
          const currentMoveNames = currentMoveset.map(m => {
            if (!m) return '';
            if (typeof m.getName === 'function') return m.getName();
            if (typeof m.getMove === 'function') return m.getMove()?.name || '';
            return m.name || (m.moveId ? PokeSkip.knownMovesCache[m.moveId] : '') || '';
          }).filter(Boolean);

          const refreshReplacements = () => {
            slotEl.innerHTML = '';
            this.renderReplacementSection(slotEl, pokemon, learnable, currentMoveNames, refreshReplacements);
            renderGrid(container.querySelector('#pokeskip-move-filter').value);
          };
          refreshReplacements();
        }
      }
    },

    renderSavedSpeciesTab() {
      const container = document.getElementById('pokeskip-saved-species-list');
      if (!container) return;
      container.innerHTML = '';

      const familyKeys = Object.keys(PokeSkip.rules);
      if (familyKeys.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #94a3b8; background: #111a2e; border-radius: 12px;">
            Aucune règle mémorisée pour le moment.<br>
            Décochez des attaques dans l'équipe actuelle pour les ignorer : elles resteront enregistrées pour toute la lignée !
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div style="margin-bottom: 12px; color: #94a3b8; font-size: 13px;">
          Retrouvez ici toutes les lignées d'espèces configurées. Vos réglages s'appliquent automatiquement à tous leurs stades évolutifs et formes, d'une partie à l'autre.
        </div>
      `;

      familyKeys.forEach(famKey => {
        const rule = PokeSkip.rules[famKey];
        const skippedKeys = Object.keys(rule.skippedMoves || {}).filter(k => !k.startsWith('id_'));
        const memberSprites = LineageManager.getLineageMemberSprites(famKey);

        let cardTitle = rule.lineageName;
        if (!cardTitle || cardTitle.startsWith('Espèce #') || cardTitle.startsWith('Lignée #')) {
          const cleanId = String(rule.familyId || famKey).replace('family_', '');
          const resolved = LineageManager.getSpeciesName(cleanId);
          if (resolved) {
            cardTitle = resolved;
            if (LineageManager.megaFamilies[cleanId] && !cardTitle.includes('(Méga')) {
              cardTitle += ` ${LineageManager.megaFamilies[cleanId].suffix}`;
            }
            rule.lineageName = cardTitle;
          } else {
            cardTitle = rule.lineageName || `Lignée #${cleanId}`;
          }
        }

        const el = document.createElement('div');
        el.className = 'pokeskip-saved-species-card';
        el.style.flexDirection = 'column';
        el.style.alignItems = 'stretch';
        el.style.gap = '12px';
        el.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="font-size: 16px; font-weight: 700; color: #fff;">${cardTitle}</div>
              ${rule.enabled === false ? `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">⏸️ En pause</span>` : ''}
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
              <button class="pokeskip-btn-edit-lineage" style="background:#0369a1; border:1px solid #38bdf8; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600; white-space:nowrap;">
                ✏️ Modifier
              </button>
              <button class="pokeskip-btn-del-lineage" style="background:rgba(225,29,72,0.2); border:1px solid rgba(225,29,72,0.4); color:#fda4af; padding:6px 10px; border-radius:6px; font-size:12px; cursor:pointer; white-space:nowrap;" title="Supprimer la règle">
                ✕
              </button>
            </div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05);">
            ${LineageManager.renderEvolutionChainHtml(memberSprites, null, true)}
          </div>

          <div style="font-size: 12px; color: ${rule.enabled === false ? '#94a3b8' : '#38bdf8'};">
            ${skippedKeys.length > 0 ? `Capacités ignorées (${skippedKeys.length}) : <b>${skippedKeys.join(', ')}</b>` : '<i>Aucune capacité ignorée</i>'}
          </div>
        `;

        el.addEventListener('click', (e) => {
          if (e.target.closest('.pokeskip-btn-del-lineage')) {
            e.stopPropagation();
            if (confirm(`Supprimer les règles enregistrées pour ${rule.lineageName} ?`)) {
              PokeSkip.deleteFamilyRule(famKey);
              this.renderSavedSpeciesTab();
              this.showToast(`Règle supprimée pour ${rule.lineageName}`, 'info');
            }
            return;
          }
          this.renderFamilyRuleEditor(container, famKey);
        });

        container.appendChild(el);
      });
    },

    renderFamilyRuleEditor(container, famKey) {
      const rule = PokeSkip.rules[famKey];
      if (!rule) {
        this.renderSavedSpeciesTab();
        return;
      }
      const memberSprites = LineageManager.getLineageMemberSprites(famKey);
      const skippedList = Object.keys(rule.skippedMoves || {}).filter(k => !k.startsWith('id_'));

      // Vérifier si un membre de cette lignée est actuellement dans l'équipe active
      const teamIdx = PokeSkip.activeParty.findIndex(p => LineageManager.getFamilyKey(p) === famKey);

      let editorTitle = rule.lineageName;
      if (!editorTitle || editorTitle.startsWith('Espèce #') || editorTitle.startsWith('Lignée #')) {
        const rootId = String(rule.familyId || famKey).replace('family_', '');
        const resolved = LineageManager.getSpeciesName(rootId);
        if (resolved) {
          editorTitle = resolved;
          if (LineageManager.megaFamilies[rootId] && !editorTitle.includes('(Méga')) {
            editorTitle += ` ${LineageManager.megaFamilies[rootId].suffix}`;
          }
          rule.lineageName = editorTitle;
        } else {
          editorTitle = rule.lineageName || `Lignée #${rootId}`;
        }
      }

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <button id="pokeskip-btn-back-saved" style="background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.12); padding: 7px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              ← Retour aux espèces
            </button>
            ${teamIdx !== -1 ? `
              <button id="pokeskip-btn-open-in-team" style="background: #0284c7; color: #fff; border: 1px solid #38bdf8; padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600;">
                👥 Voir dans l'Équipe Actuelle
              </button>
            ` : ''}
          </div>

          <div class="pokeskip-lineage-header-box">
            <div class="pokeskip-lineage-title-row">
              <div class="pokeskip-lineage-title">
                <span>Lignée : <b>${editorTitle}</b></span>
                ${rule.enabled === false ? `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">⏸️ En pause</span>` : ''}
              </div>
              <div style="font-size: 12px; color: #94a3b8;">
                Modifiez les capacités ignorées pour toute la lignée (tous stades et formes).
              </div>
            </div>

            ${LineageManager.renderEvolutionChainHtml(memberSprites, null, true)}
          </div>

          <!-- Section Ajout rapide d'une attaque à ignorer -->
          <div style="background: #111a2e; padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); display: flex; gap: 10px; align-items: center;">
            <input type="text" id="pokeskip-input-add-move" placeholder="Ajouter une capacité à ignorer (ex: Tornade, Charge)..." style="flex: 1; background: #090e1a; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 13px; outline: none;">
            <button id="pokeskip-btn-add-move" style="background: #e11d48; color: #fff; border: 1px solid #fda4af; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 600; white-space: nowrap;">
              + Ignorer
            </button>
          </div>

          <!-- Liste des capacités ignorées -->
          <div style="background: #111a2e; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="font-size: 14px; font-weight: 700; color: #f8fafc;">
                Capacités actuellement ignorées (${skippedList.length}) :
              </div>
              ${skippedList.length > 0 ? `
                <button id="pokeskip-btn-clear-lineage-moves" style="background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                  Tout rétablir (Ne rien ignorer)
                </button>
              ` : ''}
            </div>

            <div id="pokeskip-family-moves-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
              ${skippedList.length === 0 ? `
                <div style="color: #64748b; font-size: 13px; text-align: center; padding: 22px;">
                  Aucune capacité n'est ignorée pour cette lignée.<br>Toutes les attaques proposées seront apprises ou présentées normalement.
                </div>
              ` : skippedList.map(mvKey => {
                const displayName = mvKey.charAt(0).toUpperCase() + mvKey.slice(1);
                return `
                  <div style="background: #090e1a; border: 1px solid rgba(244,63,94,0.3); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="color: #f43f5e; font-weight: 700; font-size: 13px;">✕ Ignorée</span>
                      <span style="color: #fff; font-weight: 600; font-size: 14px;">${displayName}</span>
                    </div>
                    <button class="pokeskip-btn-unskip-move" data-move="${mvKey}" style="background: #10b981; color: #fff; border: 1px solid #34d399; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">
                      ✓ Garder à nouveau
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;

      // Bouton retour
      container.querySelector('#pokeskip-btn-back-saved').addEventListener('click', () => {
        this.renderSavedSpeciesTab();
      });

      // Bouton "Voir dans l'Équipe Actuelle" si présent
      const btnOpenTeam = container.querySelector('#pokeskip-btn-open-in-team');
      if (btnOpenTeam && teamIdx !== -1) {
        btnOpenTeam.addEventListener('click', () => {
          this.selectedTeamIndex = teamIdx;
          const tabBtn = document.querySelector('.pokeskip-tab-btn[data-tab="team"]');
          if (tabBtn) tabBtn.click();
        });
      }

      // Ajout manuel d'une capacité
      const inputAdd = container.querySelector('#pokeskip-input-add-move');
      const btnAdd = container.querySelector('#pokeskip-btn-add-move');
      const handleAdd = () => {
        const val = inputAdd.value.trim();
        if (!val) return;
        PokeSkip.setMoveSkipped(famKey, rule.lineageName, val, null, true);
        this.showToast(`Capacité <b>${val}</b> ignorée pour <b>${rule.lineageName}</b>`, 'warning');
        this.renderFamilyRuleEditor(container, famKey);
      };
      btnAdd.addEventListener('click', handleAdd);
      inputAdd.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAdd();
      });

      // Rétablir tout
      const btnClearAll = container.querySelector('#pokeskip-btn-clear-lineage-moves');
      if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
          rule.skippedMoves = {};
          rule.updatedAt = Date.now();
          PokeSkip.saveRules();
          this.showToast(`Toutes les capacités sont rétablies pour <b>${rule.lineageName}</b>`, 'info');
          this.renderFamilyRuleEditor(container, famKey);
        });
      }

      // Boutons individuels "Garder à nouveau"
      container.querySelectorAll('.pokeskip-btn-unskip-move').forEach(btn => {
        btn.addEventListener('click', () => {
          const moveKey = btn.dataset.move;
          delete rule.skippedMoves[moveKey];
          rule.updatedAt = Date.now();
          PokeSkip.saveRules();
          this.showToast(`Capacité <b>${moveKey}</b> rétablie pour <b>${rule.lineageName}</b>`, 'success');
          this.renderFamilyRuleEditor(container, famKey);
        });
      });

      if (PokeSkip.settings.advancedMode) {
        const rootId = LineageManager.getRootId(famKey);
        const activePartyMember = teamIdx !== -1 ? PokeSkip.activeParty[teamIdx] : (rootId ? { speciesId: rootId } : null);
        let partyCurrentMoves = [];
        let partyLearnable = [];
        if (activePartyMember) {
          const ms = typeof activePartyMember.getMoveset === 'function' ? activePartyMember.getMoveset() : (activePartyMember.moveset || []);
          partyCurrentMoves = ms.map(m => {
            if (!m) return '';
            if (typeof m.getName === 'function') return m.getName();
            if (typeof m.getMove === 'function') return m.getMove()?.name || '';
            return m.name || '';
          }).filter(Boolean);
          partyLearnable = getPokemonFullLearnset(activePartyMember);
        }

        const repWrapper = document.createElement('div');
        container.firstElementChild.appendChild(repWrapper);

        const refreshReplacements = () => {
          repWrapper.innerHTML = '';
          this.renderReplacementSection(repWrapper, famKey, partyLearnable, partyCurrentMoves, refreshReplacements);
        };
        refreshReplacements();
      }
    },

    renderReplacementSection(container, target, defaultLearnable = [], defaultCurrent = [], onUpdate = null) {
      if (!PokeSkip.settings.advancedMode) return;

      const familyInfo = LineageManager.getFamilyInfo(target);
      const famKey = familyInfo.familyKey;
      const replacements = PokeSkip.getFamilyReplacements(target);
      const activeCount = replacements.filter(r => r.enabled).length;

      // Préparation et déduplication des capacités avec leurs niveaux
      const moveMap = new Map();

      const getMoveLevelWeight = (lvl) => {
        if (typeof lvl === 'number') {
          if (lvl < 0) return 0;
          if (lvl === 0) return 0.5;
          return lvl;
        }
        if (typeof lvl === 'string') {
          const s = lvl.trim().toLowerCase();
          if (s.includes('départ') || s.includes('depart')) return 0;
          if (s.includes('évol') || s.includes('evol')) return 0.5;
          if (s.includes('actuelle')) return 0.1;
          const match = s.match(/\d+/);
          if (match) return parseInt(match[0], 10);
        }
        return 999;
      };

      if (Array.isArray(defaultLearnable)) {
        for (const item of defaultLearnable) {
          if (!item) continue;
          const rawName = typeof item === 'string' ? item : item.name;
          const name = (rawName || '').trim();
          if (!name) continue;
          const key = name.toLowerCase();
          const level = typeof item === 'object' && item.level !== undefined ? item.level : null;
          const weight = getMoveLevelWeight(level);
          const evolutionSpecies = (typeof item === 'object' && item.evolutionSpecies) ? item.evolutionSpecies : null;

          if (!moveMap.has(key)) {
            moveMap.set(key, { name, level, isCurrent: false, weight, evolutionSpecies });
          } else {
            const existing = moveMap.get(key);
            if (existing.weight === 999 && weight !== 999) {
              existing.level = level;
              existing.weight = weight;
              if (evolutionSpecies) existing.evolutionSpecies = evolutionSpecies;
            }
          }
        }
      }

      if (Array.isArray(defaultCurrent)) {
        for (const item of defaultCurrent) {
          if (!item) continue;
          const rawName = typeof item === 'string' ? item : item.name;
          const name = (rawName || '').trim();
          if (!name) continue;
          const key = name.toLowerCase();
          if (moveMap.has(key)) {
            moveMap.get(key).isCurrent = true;
          } else {
            moveMap.set(key, { name, level: 'Actuelle', isCurrent: true, weight: 0.1 });
          }
        }
      }

      const familyRule = PokeSkip.getFamilyRule(target);
      if (familyRule) {
        if (familyRule.skippedMoves) {
          for (const rawName of Object.keys(familyRule.skippedMoves)) {
            if (rawName.startsWith('id_')) continue;
            const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            const key = name.toLowerCase();
            if (!moveMap.has(key)) {
              moveMap.set(key, { name, level: null, isCurrent: false, weight: 999 });
            }
          }
        }
        if (Array.isArray(familyRule.replacements)) {
          for (const rep of familyRule.replacements) {
            if (rep.oldMoveName && !moveMap.has(rep.oldMoveName.toLowerCase())) {
              moveMap.set(rep.oldMoveName.toLowerCase(), { name: rep.oldMoveName, level: null, isCurrent: false, weight: 999 });
            }
            if (rep.newMoveName && !moveMap.has(rep.newMoveName.toLowerCase())) {
              moveMap.set(rep.newMoveName.toLowerCase(), { name: rep.newMoveName, level: null, isCurrent: false, weight: 999 });
            }
          }
        }
      }

      // Tri strict par niveau obtenu croissant, puis ordre alphabétique
      const sortedMoves = Array.from(moveMap.values()).sort((a, b) => {
        if (a.weight !== b.weight) {
          return a.weight - b.weight;
        }
        return a.name.localeCompare(b.name, 'fr');
      });

      const formatOptionText = (m, showCurrentBadge = true) => {
        let prefix = '';
        if (m.level !== undefined && m.level !== null && m.level !== '') {
          if (typeof m.level === 'number') {
            if (m.level < 0) prefix = '[Départ] ';
            else if (m.level === 0) prefix = '[Évolution] ';
            else prefix = `[Niv. ${m.level}] `;
          } else {
            const s = String(m.level).trim();
            if (/^\d+$/.test(s)) prefix = `[Niv. ${s}] `;
            else if (/évol/i.test(s)) prefix = '[Évolution] ';
            else if (/départ|depart/i.test(s)) prefix = '[Départ] ';
            else if (/actuelle/i.test(s)) prefix = '[Actuelle] ';
            else prefix = `[${s}] `;
          }
        } else if (m.isCurrent && showCurrentBadge) {
          prefix = '[Actuelle] ';
        }

        const evoSuffix = m.evolutionSpecies ? ` (${m.evolutionSpecies})` : '';
        const suffix = (m.isCurrent && showCurrentBadge && prefix !== '[Actuelle] ') ? ' (Actuelle)' : '';
        return `${prefix}${m.name}${evoSuffix}${suffix}`;
      };

      const uniqueRand = Math.random().toString(36).substring(2, 6);
      const newDatalistId = `datalist-new-${uniqueRand}`;
      const oldDatalistId = `datalist-old-${uniqueRand}`;

      const secEl = document.createElement('div');
      secEl.className = 'pokeskip-replacement-section';
      secEl.style.cssText = 'margin-top: 14px; background: #080e1e; border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 12px; padding: 14px;';

      secEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 15px;">⚡</span>
            <span style="font-size: 13px; font-weight: 700; color: #c084fc;">
              Mode Avancé : Remplacement Automatique de Capacités
            </span>
            <span style="font-size: 11px; background: rgba(168, 85, 247, 0.2); color: #d8b4fe; padding: 2px 7px; border-radius: 10px; font-weight: 600;">
              ${activeCount}/${replacements.length} active(s)
            </span>
          </div>
          ${replacements.length > 0 ? `
            <button class="pokeskip-btn-clear-rep" style="background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">
              🗑️ Tout supprimer (${replacements.length})
            </button>
          ` : ''}
        </div>

        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px; line-height: 1.4;">
          Définit les attaques à remplacer automatiquement : dès que la nouvelle capacité est débloquée et que le Pokémon possède 4 attaques, l'ancienne est remplacée sans interrompre le jeu.
        </div>

        <!-- Formulaire d'ajout : Ancienne attaque d'abord, puis Nouvelle attaque -->
        <div style="background: #111a2e; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 12px;">
          <div style="font-size: 12px; font-weight: 600; color: #f8fafc; margin-bottom: 8px;">
            ➕ Ajouter une règle de remplacement :
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 170px;">
              <div style="font-size: 11px; color: #f43f5e; font-weight: 600; margin-bottom: 3px;">Toujours remplacer :</div>
              <input type="text" class="pokeskip-rep-input-old" list="${oldDatalistId}" placeholder="Ancienne capacité..." style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 6px; padding: 6px 10px; color: #fff; font-size: 12px; outline: none;">
              <datalist id="${oldDatalistId}">
                ${sortedMoves.map(m => `<option value="${formatOptionText(m, true)}" label="${formatOptionText(m, true)}">`).join('')}
              </datalist>
            </div>

            <div style="color: #c084fc; font-weight: bold; font-size: 14px; padding-top: 16px; white-space: nowrap;">➔ par ➔</div>

            <div style="flex: 1; min-width: 170px;">
              <div style="font-size: 11px; color: #38bdf8; font-weight: 600; margin-bottom: 3px;">Par la nouvelle :</div>
              <input type="text" class="pokeskip-rep-input-new" list="${newDatalistId}" placeholder="Nouvelle capacité..." style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 6px 10px; color: #fff; font-size: 12px; outline: none;">
              <datalist id="${newDatalistId}">
                ${sortedMoves.map(m => `<option value="${formatOptionText(m, false)}" label="${formatOptionText(m, false)}">`).join('')}
              </datalist>
            </div>

            <div style="padding-top: 16px;">
              <button class="pokeskip-btn-add-rep" style="background: #7e22ce; color: #fff; border: 1px solid #c084fc; padding: 7px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                + Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des règles -->
        <div class="pokeskip-rep-list-container" style="display: flex; flex-direction: column; gap: 6px;">
          ${replacements.length === 0 ? `
            <div style="color: #64748b; font-size: 12px; text-align: center; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 6px;">
              Aucune règle de remplacement pour <b>${familyInfo.lineageName}</b>.<br>
              Créez une règle ci-dessus pour remplacer automatiquement une ancienne attaque dès le déblocage d'une nouvelle.
            </div>
          ` : replacements.map(r => `
            <div style="background: #111a2e; border: 1px solid ${r.enabled ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; opacity: ${r.enabled ? '1' : '0.6'};">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 12px; color: #94a3b8;">Toujours remplacer</span>
                <span style="font-weight: 700; color: #f43f5e; font-size: 13px;">${r.oldMoveName}</span>
                <span style="color: #a855f7; font-size: 12px; font-weight: bold;">➔ par ➔</span>
                <span style="font-weight: 700; color: #38bdf8; font-size: 13px;">${r.newMoveName}</span>
                <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${r.enabled ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)'}; color: ${r.enabled ? '#c084fc' : '#94a3b8'};">
                  ${r.enabled ? 'Active' : 'Désactivée'}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button class="pokeskip-btn-toggle-single-rep" data-id="${r.id}" style="background: ${r.enabled ? '#334155' : '#7e22ce'}; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                  ${r.enabled ? 'Désactiver' : 'Activer'}
                </button>
                <button class="pokeskip-btn-delete-single-rep" data-id="${r.id}" style="background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;" title="Supprimer cette règle">
                  🗑️
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      container.appendChild(secEl);

      const inputOld = secEl.querySelector('.pokeskip-rep-input-old');
      const inputNew = secEl.querySelector('.pokeskip-rep-input-new');
      const btnAdd = secEl.querySelector('.pokeskip-btn-add-rep');

      const cleanMoveName = (raw) => {
        if (!raw) return '';
        return String(raw)
          .replace(/^\[.*?\]\s*/, '')
          .replace(/\s*\(.*?\)$/, '')
          .trim();
      };

      const handleAdd = () => {
        const rawOld = inputOld?.value.trim();
        const rawNew = inputNew?.value.trim();
        const oldM = cleanMoveName(rawOld);
        const newM = cleanMoveName(rawNew);

        if (!oldM || !newM) {
          UI.showToast('Veuillez renseigner l\'ancienne capacité à remplacer et la nouvelle capacité.', 'warning');
          return;
        }
        if (newM.toLowerCase() === oldM.toLowerCase()) {
          UI.showToast('La nouvelle capacité et l\'ancienne doivent être différentes.', 'warning');
          return;
        }

        PokeSkip.addReplacementRule(target, newM, oldM, null, null);
        PokeSkip.setMoveSkipped(target, null, newM, null, false);

        UI.showToast(`Règle enregistrée : Toujours remplacer <b>${oldM}</b> par <b>${newM}</b> sur <b>${familyInfo.lineageName}</b>`, 'success');
        if (typeof onUpdate === 'function') {
          onUpdate();
        }
      };

      btnAdd?.addEventListener('click', handleAdd);
      inputOld?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (!inputNew?.value.trim()) {
            inputNew?.focus();
            try { if (typeof inputNew.showPicker === 'function') inputNew.showPicker(); } catch (err) {}
          } else {
            handleAdd();
          }
        }
      });
      inputNew?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAdd();
      });

      inputOld?.addEventListener('click', () => {
        try { if (typeof inputOld.showPicker === 'function') inputOld.showPicker(); } catch (err) {}
      });
      inputNew?.addEventListener('click', () => {
        try { if (typeof inputNew.showPicker === 'function') inputNew.showPicker(); } catch (err) {}
      });

      secEl.querySelectorAll('.pokeskip-btn-toggle-single-rep').forEach(btn => {
        btn.addEventListener('click', () => {
          const ruleId = btn.getAttribute('data-id');
          PokeSkip.toggleReplacementRule(target, ruleId);
          if (typeof onUpdate === 'function') onUpdate();
        });
      });

      secEl.querySelectorAll('.pokeskip-btn-delete-single-rep').forEach(btn => {
        btn.addEventListener('click', () => {
          const ruleId = btn.getAttribute('data-id');
          PokeSkip.deleteReplacementRule(target, ruleId);
          UI.showToast('Règle de remplacement supprimée.', 'info');
          if (typeof onUpdate === 'function') onUpdate();
        });
      });

      const btnClear = secEl.querySelector('.pokeskip-btn-clear-rep');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          if (confirm(`Supprimer toutes les règles de remplacement pour ${familyInfo.lineageName} ?`)) {
            PokeSkip.clearAllReplacements(target);
            UI.showToast(`Toutes les règles de remplacement supprimées pour ${familyInfo.lineageName}.`, 'info');
            if (typeof onUpdate === 'function') onUpdate();
          }
        });
      }
    },

    dismissQuickSkipPrompt() {
      const el = document.getElementById('pokeskip-quick-prompt');
      if (el && el.parentNode) {
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -15px)';
        el.style.transition = 'all 0.2s ease';
        setTimeout(() => {
          if (el && el.parentNode) el.remove();
        }, 200);
      }
    },

    showQuickSkipPrompt(phaseInstance, pokemon, move) {
      if (document.getElementById('pokeskip-quick-prompt')) {
        document.getElementById('pokeskip-quick-prompt').remove();
      }

      const familyInfo = LineageManager.getFamilyInfo(pokemon);
      const moveName = move?.name || `Move #${phaseInstance.moveId}`;

      const el = document.createElement('div');
      el.id = 'pokeskip-quick-prompt';
      el.innerHTML = `
        <span class="pokeskip-quick-text">⚡ Ignorer <b>${moveName}</b> pour <b>${familyInfo.lineageName}</b> ?</span>
        <button class="pokeskip-quick-btn" id="pokeskip-quick-skip-always">Toujours ignorer</button>
        <button class="pokeskip-quick-close" id="pokeskip-quick-close">&times;</button>
      `;

      document.body.appendChild(el);

      const dismiss = () => {
        this.dismissQuickSkipPrompt();
      };

      el.querySelector('#pokeskip-quick-close').addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
      });

      el.querySelector('#pokeskip-quick-skip-always').addEventListener('click', (e) => {
        e.stopPropagation();
        PokeSkip.setMoveSkipped(pokemon, pokemon?.species?.name, moveName, phaseInstance.moveId, true);
        PokeSkip.recordSkip();

        this.showToast(`✅ Règle enregistrée : <b>${familyInfo.lineageName}</b> ignorera <b>${moveName}</b> !`, 'success');
        dismiss();

        // 1. Marquer la phase comme ignorée par PokéSkip
        phaseInstance._pokeskipIgnored = true;

        const scene = phaseInstance.scene || PokeSkip.scene || window.globalScene;
        const pm = scene?.phaseManager;
        const currentPhase = pm ? (typeof pm.getCurrentPhase === 'function' ? pm.getCurrentPhase() : pm.currentPhase) : null;
        const ui = scene?.ui;

        // Vérifier l'état actuel de l'UI in-game
        const currentMode = ui ? (typeof ui.getMode === 'function' ? ui.getMode() : ui.mode) : null;
        const isConfirmOrSummaryActive = currentMode === 14 || currentMode === 9;

        // VÉRIFICATION DU TEXTE :
        // Déterminer si le texte actuellement affiché est un message d'une autre nature
        // (ex: évolution, montée de niveau, stats) ou bien le message d'apprentissage de cette capacité
        let isOtherNatureMessage = false;
        try {
          const msgHandler = typeof ui?.getMessageHandler === 'function' ? ui.getMessageHandler() : null;
          const currentText = msgHandler?.message?.text || '';
          // Si du texte est présent et qu'il ne mentionne pas le nom de cette capacité, c'est un message d'une autre nature
          if (currentText && moveName && !currentText.includes(moveName)) {
            isOtherNatureMessage = true;
          }
        } catch (err) {}

        // 2. Gestion de l'UI in-game :
        // Si le menu Oui/Non (CONFIRM = 14) ou de sélection des attaques (SUMMARY = 9) était déjà ouvert,
        // on le ferme immédiatement pour ne pas bloquer le joueur
        if (isConfirmOrSummaryActive && ui) {
          try {
            const handler = typeof ui.getHandler === 'function' ? ui.getHandler() : null;
            if (handler && typeof handler.clear === 'function') handler.clear();
            if (ui.handlers && ui.handlers[14] && typeof ui.handlers[14].clear === 'function') {
              ui.handlers[14].clear();
            }
          } catch (err) {}

          const targetMode = phaseInstance.messageMode ?? 0;
          let ended = false;
          const safeEnd = () => {
            if (ended) return;
            ended = true;
            try {
              phaseInstance.end();
            } catch (err) {
              console.warn('[PokeSkip] Erreur clôture phase:', err);
            }
          };

          if (typeof ui.setMode === 'function') {
            try {
              ui.setMode(targetMode).then(safeEnd).catch(safeEnd);
              setTimeout(safeEnd, 150);
            } catch (err) {
              safeEnd();
            }
          } else {
            safeEnd();
          }
        } else if (!isOtherNatureMessage && currentPhase && (currentPhase === phaseInstance || currentPhase.phaseName === 'LearnMovePhase')) {
          // Si ce n'est PAS un message d'une autre nature et qu'on est déjà dans LearnMovePhase,
          // on peut clôturer la phase en toute sécurité
          try {
            phaseInstance.end();
          } catch (err) {
            console.warn('[PokeSkip] Erreur clôture phase:', err);
          }
        }
        // NOTE : Si isOtherNatureMessage est vrai, on NE TOUCHE PAS au texte et on ne force pas end() immédiatement.
        // Le joueur peut lire tranquillement son message d'évolution ou de niveau sans le perdre.
        // Dès que ce message d'une autre nature se terminera, l'intercepteur dans replaceMoveCheck
        // verra que _pokeskipIgnored est vrai et sautera automatiquement la demande Oui/Non !
      });

      // Reste selon la durée configurée (par défaut 15s) pour laisser le temps de décider
      const durationSec = Math.max(3, PokeSkip.settings.quickPromptDuration || 15);
      setTimeout(() => {
        dismiss();
      }, durationSec * 1000);
    }
  };

  // --- INITIALISATION AU CHARGEMENT ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      UI.init();
      initGameHook();
    });
  } else {
    UI.init();
    initGameHook();
  }

})();
