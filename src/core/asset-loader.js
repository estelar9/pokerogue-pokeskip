// Chargement asynchrone des assets PokéRogue & cache local
import { megaFamilies } from '../data/megas.js';

export const AssetLoader = {
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
        const megas = megaFamilies || {};
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
