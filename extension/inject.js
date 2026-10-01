// PokéSkip Extension Inject Script v1.14.0

(() => {
  // src/data/megas.js
  var megaFamilies = {
    3: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10033 },
    6: { suffix: "(M\xE9ga X / Y)", defaultMegaSpriteId: 10034 },
    9: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10036 },
    15: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10090 },
    18: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10073 },
    65: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10037 },
    80: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10074 },
    94: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10038 },
    115: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10039 },
    127: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10040 },
    130: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10041 },
    142: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10042 },
    150: { suffix: "(M\xE9ga X / Y)", defaultMegaSpriteId: 10043 },
    181: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10045 },
    208: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10075 },
    212: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10046 },
    214: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10047 },
    229: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10048 },
    248: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10049 },
    254: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10065 },
    257: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10050 },
    260: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10064 },
    282: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10051 },
    302: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10066 },
    303: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10052 },
    306: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10053 },
    308: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10054 },
    310: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10055 },
    319: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10070 },
    323: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10071 },
    334: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10067 },
    354: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10056 },
    359: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10057 },
    362: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10078 },
    373: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10089 },
    376: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10076 },
    380: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10062 },
    381: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10063 },
    384: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10079 },
    428: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10088 },
    445: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10058 },
    448: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10059 },
    460: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10060 },
    475: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10068 },
    531: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10069 },
    719: { suffix: "(M\xE9ga)", defaultMegaSpriteId: 10077 }
  };

  // src/core/asset-loader.js
  var AssetLoader = {
    _cache: {},
    _pending: /* @__PURE__ */ new Set(),
    _variantDataCache: {},
    _masterlist: null,
    _masterlistPromise: null,
    init() {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (k.startsWith("pokeskip_pkr_sprite_") || k.startsWith("pokeskip_pkr_v2_"))) {
            localStorage.removeItem(k);
          } else if (k && k.startsWith("pokeskip_pkr_v3_")) {
            this._cache[k] = localStorage.getItem(k);
          }
        }
      } catch (e) {
      }
      this.getMasterlist();
    },
    getMasterlist() {
      if (this._masterlist) return Promise.resolve(this._masterlist);
      if (this._masterlistPromise) return this._masterlistPromise;
      const localUrl = "./images/pokemon/variant/_masterlist.json";
      const fallbackUrl = "https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/variant/_masterlist.json";
      this._masterlistPromise = fetch(localUrl).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      }).catch(() => fetch(fallbackUrl).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })).then((data) => {
        this._masterlist = data || {};
        return this._masterlist;
      }).catch(() => {
        this._masterlist = {};
        return {};
      });
      return this._masterlistPromise;
    },
    getAssetKey(id) {
      if (!id) return "";
      const strId = String(id);
      if (strId.includes("-mega")) return strId;
      const numId = Number(id);
      if (numId >= 1e4) {
        const megas = megaFamilies || {};
        for (const [sid, info] of Object.entries(megas)) {
          if (info.defaultMegaSpriteId === numId) {
            if (Number(sid) === 6) return "6-mega-x";
            if (Number(sid) === 150) return "150-mega-x";
            return `${sid}-mega`;
          }
        }
      }
      return strId;
    },
    getCacheKey(speciesId, isShiny, variant) {
      const v = isShiny && typeof variant === "number" ? variant : 0;
      if (v > 0) {
        return `pokeskip_pkr_v3_${speciesId}_shiny_v${v}`;
      }
      return `pokeskip_pkr_v3_${speciesId}_${isShiny ? "shiny" : "normal"}`;
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
      } catch (e) {
      }
      return null;
    },
    /**
     * Applique un mapping de couleurs (palette swap) sur un canvas ImageData.
     * colorMap = { "rrggbb_source": "rrggbb_dest", ... }
     */
    _applyPaletteSwap(imageData, colorMap) {
      if (!colorMap || typeof colorMap !== "object") return imageData;
      const data = imageData.data;
      const lookup = /* @__PURE__ */ new Map();
      const paletteList = [];
      for (const [src, dst] of Object.entries(colorMap)) {
        const srcHex = String(src).toLowerCase().replace("#", "");
        const dstHex = String(dst).toLowerCase().replace("#", "");
        if (srcHex.length !== 6 || dstHex.length !== 6) continue;
        const sr = parseInt(srcHex.substring(0, 2), 16);
        const sg = parseInt(srcHex.substring(2, 4), 16);
        const sb = parseInt(srcHex.substring(4, 6), 16);
        const dr = parseInt(dstHex.substring(0, 2), 16);
        const dg = parseInt(dstHex.substring(2, 4), 16);
        const db = parseInt(dstHex.substring(4, 6), 16);
        const key = (sr << 16 | sg << 8 | sb) >>> 0;
        lookup.set(key, [dr, dg, db]);
        paletteList.push({ sr, sg, sb, dr, dg, db });
      }
      if (lookup.size === 0) return imageData;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const key = (r << 16 | g << 8 | b) >>> 0;
        let mapped = lookup.get(key);
        if (!mapped && paletteList.length > 0) {
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
      if (this._variantDataCache[speciesKey] !== void 0) {
        return Promise.resolve(this._variantDataCache[speciesKey]);
      }
      const localUrl = `./images/pokemon/variant/${speciesKey}.json`;
      const fallbackUrl = `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/variant/${speciesKey}.json`;
      return fetch(localUrl).then((res) => {
        if (!res.ok) throw new Error(`Local ${res.status}`);
        return res.json();
      }).catch(() => {
        return fetch(fallbackUrl).then((res) => {
          if (!res.ok) throw new Error(`Fallback ${res.status}`);
          return res.json();
        });
      }).then((data) => {
        this._variantDataCache[speciesKey] = data;
        return data;
      }).catch(() => {
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
        if (idx >= urls.length) return Promise.reject(new Error("No JSON url worked"));
        return fetch(urls[idx]).then((r) => {
          if (!r.ok) return tryFetchJson(urls, idx + 1);
          return r.json();
        }).catch(() => tryFetchJson(urls, idx + 1));
      };
      const tryFetchBlob = (urls, idx = 0) => {
        if (idx >= urls.length) return Promise.reject(new Error("No PNG blob url worked"));
        return fetch(urls[idx]).then((r) => {
          if (!r.ok) return tryFetchBlob(urls, idx + 1);
          return r.blob();
        }).catch(() => tryFetchBlob(urls, idx + 1));
      };
      return tryFetchJson(jsonUrls).then((atlasJson) => {
        const frames = atlasJson?.textures?.[0]?.frames || [];
        const targetFrameObj = frames.find((f) => f.filename === "0001.png" || f.filename === "1.png") || frames[0];
        const targetFrame = targetFrameObj?.frame;
        if (!targetFrame || !targetFrame.w || !targetFrame.h) throw new Error("Invalid frame");
        return tryFetchBlob(pngUrls).then((blob) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            const blobUrl = URL.createObjectURL(blob);
            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = targetFrame.w;
                canvas.height = targetFrame.h;
                const ctx = canvas.getContext("2d");
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
      if (!speciesId || typeof window === "undefined") return;
      const effectiveVariant = isShiny && typeof variant === "number" && variant > 0 ? variant : 0;
      const cacheKey = this.getCacheKey(speciesId, isShiny, effectiveVariant);
      if (this._cache[cacheKey] || this._pending.has(cacheKey)) return;
      this._pending.add(cacheKey);
      const assetKey = this.getAssetKey(speciesId);
      this.getMasterlist().then((masterlist) => {
        let variantType = 0;
        if (isShiny && effectiveVariant > 0) {
          if (masterlist && masterlist[assetKey] && Array.isArray(masterlist[assetKey])) {
            variantType = masterlist[assetKey][effectiveVariant] || 0;
          }
        }
        if (isShiny && effectiveVariant > 0 && (variantType === 2 || variantType === 0 && !masterlist[assetKey])) {
          const dedicatedSuffix = `_${effectiveVariant + 1}`;
          const dedicatedJsonUrls = [
            `./images/pokemon/variant/${assetKey}${dedicatedSuffix}.json`,
            `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/variant/${assetKey}${dedicatedSuffix}.json`
          ];
          const dedicatedPngUrls = [
            `./images/pokemon/variant/${assetKey}${dedicatedSuffix}.png`,
            `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/variant/${assetKey}${dedicatedSuffix}.png`
          ];
          return this._loadFrameFromAtlas(dedicatedJsonUrls, dedicatedPngUrls).then(({ canvas }) => {
            const dataUrl = canvas.toDataURL("image/png");
            this._storeAndUpdateSprite(cacheKey, speciesId, isShiny, effectiveVariant, dataUrl);
            this._pending.delete(cacheKey);
          }).catch(() => {
            return this._loadPaletteOrBaseShiny(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
          });
        }
        if (isShiny && effectiveVariant > 0 && variantType === 1) {
          return this._loadPaletteOrBaseShiny(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
        }
        return this._loadStandardSprite(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
      }).catch((err) => {
        console.warn("[Pok\xE9Skip] Erreur chargement sprite pour", speciesId, err);
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
      return this._fetchVariantData(assetKey).then((variantJson) => {
        const colorMap = variantJson ? variantJson[String(effectiveVariant)] : null;
        if (colorMap && typeof colorMap === "object") {
          return this._loadFrameFromAtlas(normJsonUrls, normPngUrls).then(({ canvas, ctx }) => {
            try {
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              this._applyPaletteSwap(imgData, colorMap);
              ctx.putImageData(imgData, 0, 0);
            } catch (e) {
              console.warn("[Pok\xE9Skip] Erreur palette swap:", e);
            }
            const dataUrl = canvas.toDataURL("image/png");
            this._storeAndUpdateSprite(cacheKey, speciesId, isShiny, effectiveVariant, dataUrl);
            this._pending.delete(cacheKey);
          });
        }
        return this._loadStandardSprite(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
      }).catch((err) => {
        console.warn("[Pok\xE9Skip] \xC9chec palette swap, repli base shiny:", err);
        return this._loadStandardSprite(assetKey, speciesId, cacheKey, isShiny, effectiveVariant);
      });
    },
    _loadStandardSprite(assetKey, speciesId, cacheKey, isShiny, effectiveVariant) {
      const sub = isShiny ? "shiny/" : "";
      const jsonUrls = [
        `./images/pokemon/${sub}${assetKey}.json`,
        `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/${sub}${assetKey}.json`
      ];
      const pngUrls = [
        `./images/pokemon/${sub}${assetKey}.png`,
        `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/pokemon/${sub}${assetKey}.png`
      ];
      return this._loadFrameFromAtlas(jsonUrls, pngUrls).then(({ canvas }) => {
        const dataUrl = canvas.toDataURL("image/png");
        this._storeAndUpdateSprite(cacheKey, speciesId, isShiny, effectiveVariant, dataUrl);
        this._pending.delete(cacheKey);
      }).catch(() => {
        this._pending.delete(cacheKey);
      });
    },
    _storeAndUpdateSprite(cacheKey, speciesId, isShiny, variant, dataUrl) {
      this._cache[cacheKey] = dataUrl;
      try {
        localStorage.setItem(cacheKey, dataUrl);
      } catch (quotaErr) {
      }
      this.updateDomSprites(speciesId, isShiny, variant, dataUrl);
    },
    updateDomSprites(speciesId, isShiny, variant, dataUrl) {
      if (!dataUrl) return;
      const v = isShiny && typeof variant === "number" ? variant : 0;
      const selector = `img[data-pokeskip-species="${speciesId}"][data-pokeskip-shiny="${isShiny}"][data-pokeskip-variant="${v}"]`;
      const imgs = document.querySelectorAll(selector);
      imgs.forEach((img) => {
        img.src = dataUrl;
      });
    }
  };

  // src/data/families.js
  var families = {
    "1": {
      "name": "Bulbizarre \u2192 Herbizarre \u2192 Florizarre",
      "members": [
        1,
        2,
        3
      ]
    },
    "4": {
      "name": "Salam\xE8che \u2192 Reptincel \u2192 Dracaufeu",
      "members": [
        4,
        5,
        6
      ]
    },
    "7": {
      "name": "Carapuce \u2192 Carabaffe \u2192 Tortank",
      "members": [
        7,
        8,
        9
      ]
    },
    "10": {
      "name": "Chenipan \u2192 Crisacier \u2192 Papilusion",
      "members": [
        10,
        11,
        12
      ]
    },
    "13": {
      "name": "Aspicot \u2192 Coconfort \u2192 Dardargnan",
      "members": [
        13,
        14,
        15
      ]
    },
    "16": {
      "name": "Roucool \u2192 Roucoups \u2192 Roucarnage",
      "members": [
        16,
        17,
        18
      ]
    },
    "19": {
      "name": "Rattata \u2192 Rattatac",
      "members": [
        19,
        20
      ]
    },
    "21": {
      "name": "Piafabec \u2192 Rapasdepic",
      "members": [
        21,
        22
      ]
    },
    "23": {
      "name": "Abo \u2192 Arbok",
      "members": [
        23,
        24
      ]
    },
    "27": {
      "name": "Sabelette \u2192 Sablaireau",
      "members": [
        27,
        28
      ]
    },
    "29": {
      "name": "Nidoran\u2640 \u2192 Nidorina \u2192 Nidoqueen",
      "members": [
        29,
        30,
        31
      ]
    },
    "32": {
      "name": "Nidoran\u2642 \u2192 Nidorino \u2192 Nidoking",
      "members": [
        32,
        33,
        34
      ]
    },
    "37": {
      "name": "Goupix \u2192 Feunard",
      "members": [
        37,
        38
      ]
    },
    "41": {
      "name": "Nosferapti \u2192 Nosferalto \u2192 Nostenfer",
      "members": [
        41,
        42,
        169
      ]
    },
    "43": {
      "name": "Mystherbe \u2192 Ortide \u2192 Rafflesia / Joliflor",
      "members": [
        43,
        44,
        45,
        182
      ]
    },
    "46": {
      "name": "Paras \u2192 Parasect",
      "members": [
        46,
        47
      ]
    },
    "48": {
      "name": "Mimitoss \u2192 A\xE9romite",
      "members": [
        48,
        49
      ]
    },
    "50": {
      "name": "Taupiqueur \u2192 Triopikeur",
      "members": [
        50,
        51
      ]
    },
    "52": {
      "name": "Miaouss \u2192 Persian",
      "members": [
        52,
        53
      ]
    },
    "53": {
      "name": "Miaouss \u2192 Persian",
      "members": [
        52,
        53
      ]
    },
    "54": {
      "name": "Psykokwak \u2192 Akwakwak",
      "members": [
        54,
        55
      ]
    },
    "56": {
      "name": "F\xE9rosinge \u2192 Colossinge \u2192 Courrousinge",
      "members": [
        56,
        57,
        979
      ]
    },
    "58": {
      "name": "Caninos \u2192 Arcanin",
      "members": [
        58,
        59
      ]
    },
    "60": {
      "name": "Ptitard \u2192 T\xEAtarte \u2192 Tartard / Tarpaud",
      "members": [
        60,
        61,
        62,
        186
      ]
    },
    "63": {
      "name": "Abra \u2192 Kadabra \u2192 Alakazam",
      "members": [
        63,
        64,
        65
      ]
    },
    "66": {
      "name": "Machoc \u2192 Machopeur \u2192 Mackogneur",
      "members": [
        66,
        67,
        68
      ]
    },
    "69": {
      "name": "Ch\xE9tiflor \u2192 Boustiflor \u2192 Empiflor",
      "members": [
        69,
        70,
        71
      ]
    },
    "72": {
      "name": "Tentacool \u2192 Tentacruel",
      "members": [
        72,
        73
      ]
    },
    "74": {
      "name": "Racaillou \u2192 Gravalanch \u2192 Grolem",
      "members": [
        74,
        75,
        76
      ]
    },
    "77": {
      "name": "Ponyta \u2192 Galopa",
      "members": [
        77,
        78
      ]
    },
    "79": {
      "name": "Ramoloss \u2192 Flagadoss / Roigada",
      "members": [
        79,
        80,
        199
      ]
    },
    "81": {
      "name": "Magn\xE9ti \u2192 Magn\xE9ton \u2192 Magn\xE9zone",
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
      "name": "Doduo \u2192 Dodrio",
      "members": [
        84,
        85
      ]
    },
    "86": {
      "name": "Otaria \u2192 Lamantine",
      "members": [
        86,
        87
      ]
    },
    "88": {
      "name": "Tadmorv \u2192 Grotadmorv",
      "members": [
        88,
        89
      ]
    },
    "90": {
      "name": "Kokiyas \u2192 Crustabri",
      "members": [
        90,
        91
      ]
    },
    "92": {
      "name": "Fantominus \u2192 Spectrum \u2192 Ectoplasma",
      "members": [
        92,
        93,
        94
      ]
    },
    "95": {
      "name": "Onix \u2192 Steelix",
      "members": [
        95,
        208
      ]
    },
    "96": {
      "name": "Soporifik \u2192 Hypnomade",
      "members": [
        96,
        97
      ]
    },
    "98": {
      "name": "Krabby \u2192 Krabboss",
      "members": [
        98,
        99
      ]
    },
    "100": {
      "name": "Voltorbe \u2192 \xC9lectrode",
      "members": [
        100,
        101
      ]
    },
    "102": {
      "name": "N\u0153un\u0153uf \u2192 Noadkoko",
      "members": [
        102,
        103
      ]
    },
    "104": {
      "name": "Osselait \u2192 Ossatueur",
      "members": [
        104,
        105
      ]
    },
    "108": {
      "name": "Excelangue \u2192 Coudlangue",
      "members": [
        108,
        463
      ]
    },
    "109": {
      "name": "Smogo \u2192 Smogogo",
      "members": [
        109,
        110
      ]
    },
    "111": {
      "name": "Rhinocorne \u2192 Rhinof\xE9ros \u2192 Rhinastoc",
      "members": [
        111,
        112,
        464
      ]
    },
    "114": {
      "name": "Saquedeneu \u2192 Bouldeneu",
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
      "name": "Hypotrempe \u2192 Hypoc\xE9an \u2192 Hyporoi",
      "members": [
        116,
        117,
        230
      ]
    },
    "118": {
      "name": "Poissir\xE8ne \u2192 Poissoroy",
      "members": [
        118,
        119
      ]
    },
    "120": {
      "name": "Stari \u2192 Staross",
      "members": [
        120,
        121
      ]
    },
    "123": {
      "name": "Ins\xE9cateur \u2192 Cizayox / Hach\xE9cateur",
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
      "name": "Magicarpe \u2192 L\xE9viator",
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
      "name": "M\xE9tamorph",
      "members": [
        132
      ]
    },
    "133": {
      "name": "\xC9voli \u2192 Aquali / Voltali / Pyroli / Mentali / Noctali / Phyllali / Givrali / Nymphali",
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
      "name": "Porygon \u2192 Porygon2 \u2192 Porygon-Z",
      "members": [
        137,
        233,
        474
      ]
    },
    "138": {
      "name": "Amonita \u2192 Amonistar",
      "members": [
        138,
        139
      ]
    },
    "140": {
      "name": "Kabuto \u2192 Kabutops",
      "members": [
        140,
        141
      ]
    },
    "142": {
      "name": "Pt\xE9ra",
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
      "name": "\xC9lecthor",
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
      "name": "Minidraco \u2192 Draco \u2192 Dracolosse",
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
      "name": "Germignon \u2192 Macronium \u2192 M\xE9ganium",
      "members": [
        152,
        153,
        154
      ]
    },
    "155": {
      "name": "H\xE9ricendre \u2192 Feurisson \u2192 Typhlosion",
      "members": [
        155,
        156,
        157
      ]
    },
    "158": {
      "name": "Kaiminus \u2192 Crocrodil \u2192 Aligatueur",
      "members": [
        158,
        159,
        160
      ]
    },
    "161": {
      "name": "Fouinette \u2192 Fouinar",
      "members": [
        161,
        162
      ]
    },
    "163": {
      "name": "Hoothoot \u2192 Noarfang",
      "members": [
        163,
        164
      ]
    },
    "165": {
      "name": "Coxy \u2192 Coxyclaque",
      "members": [
        165,
        166
      ]
    },
    "167": {
      "name": "Mimigal \u2192 Migalos",
      "members": [
        167,
        168
      ]
    },
    "172": {
      "name": "Pichu \u2192 Pikachu \u2192 Raichu",
      "members": [
        172,
        25,
        26
      ]
    },
    "173": {
      "name": "M\xE9lo \u2192 M\xE9lof\xE9e \u2192 M\xE9lodelfe",
      "members": [
        173,
        35,
        36
      ]
    },
    "174": {
      "name": "Toudoudou \u2192 Rondoudou \u2192 Grodoudou",
      "members": [
        174,
        39,
        40
      ]
    },
    "175": {
      "name": "Togepi \u2192 Togetic \u2192 Togekiss",
      "members": [
        175,
        176,
        468
      ]
    },
    "177": {
      "name": "Natu \u2192 Xatu",
      "members": [
        177,
        178
      ]
    },
    "179": {
      "name": "Wattouat \u2192 Lainergie \u2192 Pharamp",
      "members": [
        179,
        180,
        181
      ]
    },
    "187": {
      "name": "Granivol \u2192 Floravol \u2192 Cotovol",
      "members": [
        187,
        188,
        189
      ]
    },
    "190": {
      "name": "Capumain \u2192 Capidextre",
      "members": [
        190,
        424
      ]
    },
    "191": {
      "name": "Tournegrin \u2192 H\xE9liatronc",
      "members": [
        191,
        192
      ]
    },
    "193": {
      "name": "Yanma \u2192 Yanm\xE9ga",
      "members": [
        193,
        469
      ]
    },
    "194": {
      "name": "Axoloto \u2192 Maraiste",
      "members": [
        194,
        195
      ]
    },
    "195": {
      "name": "Axoloto \u2192 Maraiste",
      "members": [
        194,
        195
      ]
    },
    "198": {
      "name": "Corn\xE8bre \u2192 Corboss",
      "members": [
        198,
        430
      ]
    },
    "200": {
      "name": "Feufor\xEAve \u2192 Magir\xEAve",
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
      "name": "Girafarig \u2192 Farigiraf",
      "members": [
        203,
        981
      ]
    },
    "204": {
      "name": "Pomdepik \u2192 Foretress",
      "members": [
        204,
        205
      ]
    },
    "206": {
      "name": "Insolourdo \u2192 Deusolourdo",
      "members": [
        206,
        982
      ]
    },
    "207": {
      "name": "Scorplane \u2192 Scorvol",
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
      "name": "Farfuret \u2192 Dimoret",
      "members": [
        215,
        461
      ]
    },
    "461": {
      "name": "Farfuret \u2192 Dimoret",
      "members": [
        215,
        461
      ]
    },
    "216": {
      "name": "Teddiursa \u2192 Ursaring \u2192 Ursaking",
      "members": [
        216,
        217,
        901
      ]
    },
    "218": {
      "name": "Limagma \u2192 Volcaropod",
      "members": [
        218,
        219
      ]
    },
    "220": {
      "name": "Marcacrin \u2192 Cochignon \u2192 Mammochon",
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
      "name": "R\xE9moraid \u2192 Octillery",
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
      "name": "Malosse \u2192 D\xE9molosse",
      "members": [
        228,
        229
      ]
    },
    "231": {
      "name": "Phanpy \u2192 Donphan",
      "members": [
        231,
        232
      ]
    },
    "234": {
      "name": "Cerfrousse \u2192 Cerbyllin",
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
      "name": "Debugant \u2192 Kicklee / Tygnon / Kapoera",
      "members": [
        236,
        106,
        107,
        237
      ]
    },
    "238": {
      "name": "Lippouti \u2192 Lippoutou",
      "members": [
        238,
        124
      ]
    },
    "239": {
      "name": "\xC9lekid \u2192 \xC9lektek \u2192 \xC9lekable",
      "members": [
        239,
        125,
        466
      ]
    },
    "240": {
      "name": "Magby \u2192 Magmar \u2192 Maganon",
      "members": [
        240,
        126,
        467
      ]
    },
    "241": {
      "name": "\xC9cr\xE9meuh",
      "members": [
        241
      ]
    },
    "246": {
      "name": "Embrylex \u2192 Ymphect \u2192 Tyranocif",
      "members": [
        246,
        247,
        248
      ]
    },
    "252": {
      "name": "Arcko \u2192 Massko \u2192 Jungko",
      "members": [
        252,
        253,
        254
      ]
    },
    "255": {
      "name": "Poussifeu \u2192 Galifeu \u2192 Bras\xE9gali",
      "members": [
        255,
        256,
        257
      ]
    },
    "258": {
      "name": "Gobou \u2192 Flobio \u2192 Laggron",
      "members": [
        258,
        259,
        260
      ]
    },
    "261": {
      "name": "Medhy\xE8na \u2192 Grahy\xE8na",
      "members": [
        261,
        262
      ]
    },
    "263": {
      "name": "Zigzaton \u2192 Lin\xE9on",
      "members": [
        263,
        264
      ]
    },
    "265": {
      "name": "Chenipotte \u2192 Armulys / Blindalys \u2192 Charmillon / Papinox",
      "members": [
        265,
        266,
        267,
        268,
        269
      ]
    },
    "270": {
      "name": "N\xE9nupiot \u2192 Lombre \u2192 Ludicolo",
      "members": [
        270,
        271,
        272
      ]
    },
    "273": {
      "name": "Grainipiot \u2192 Pifeuil \u2192 Tengalice",
      "members": [
        273,
        274,
        275
      ]
    },
    "276": {
      "name": "Nirondelle \u2192 H\xE9l\xE9delle",
      "members": [
        276,
        277
      ]
    },
    "278": {
      "name": "Go\xE9lise \u2192 Bekipan",
      "members": [
        278,
        279
      ]
    },
    "280": {
      "name": "Tarsal \u2192 Kirlia \u2192 Gardevoir / Gallame",
      "members": [
        280,
        281,
        282,
        475
      ]
    },
    "283": {
      "name": "Arakdo \u2192 Maskadra",
      "members": [
        283,
        284
      ]
    },
    "285": {
      "name": "Balignon \u2192 Chapignon",
      "members": [
        285,
        286
      ]
    },
    "287": {
      "name": "Parecool \u2192 Vigoroth \u2192 Monafl\xE8mit",
      "members": [
        287,
        288,
        289
      ]
    },
    "290": {
      "name": "Ningale \u2192 Ninjask / Munja",
      "members": [
        290,
        291,
        292
      ]
    },
    "293": {
      "name": "Chuchmur \u2192 Ramboum \u2192 Brouhabam",
      "members": [
        293,
        294,
        295
      ]
    },
    "296": {
      "name": "Makuhita \u2192 Hariyama",
      "members": [
        296,
        297
      ]
    },
    "298": {
      "name": "Azurill \u2192 Marill \u2192 Azumarill",
      "members": [
        298,
        183,
        184
      ]
    },
    "299": {
      "name": "Tarinor \u2192 Tarinorme",
      "members": [
        299,
        476
      ]
    },
    "300": {
      "name": "Skitty \u2192 Delcatty",
      "members": [
        300,
        301
      ]
    },
    "302": {
      "name": "T\xE9n\xE9fix",
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
      "name": "Galekid \u2192 Galegon \u2192 Galeking",
      "members": [
        304,
        305,
        306
      ]
    },
    "307": {
      "name": "M\xE9ditikka \u2192 Charmina",
      "members": [
        307,
        308
      ]
    },
    "309": {
      "name": "Dynavolt \u2192 \xC9lecsprint",
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
      "name": "N\xE9gapi",
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
      "name": "Gloupti \u2192 Avaltout",
      "members": [
        316,
        317
      ]
    },
    "318": {
      "name": "Carvanha \u2192 Sharpedo",
      "members": [
        318,
        319
      ]
    },
    "320": {
      "name": "Wailmer \u2192 Wailord",
      "members": [
        320,
        321
      ]
    },
    "322": {
      "name": "Chamallot \u2192 Cam\xE9rupt",
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
      "name": "Spoink \u2192 Groret",
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
      "name": "Kraknoix \u2192 Vibraninf \u2192 Lib\xE9gon",
      "members": [
        328,
        329,
        330
      ]
    },
    "331": {
      "name": "Cacnea \u2192 Cacturne",
      "members": [
        331,
        332
      ]
    },
    "333": {
      "name": "Tylton \u2192 Altaria",
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
      "name": "S\xE9viper",
      "members": [
        336
      ]
    },
    "337": {
      "name": "S\xE9l\xE9roc",
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
      "name": "Barloche \u2192 Barbicha",
      "members": [
        339,
        340
      ]
    },
    "341": {
      "name": "\xC9crapince \u2192 Colhomard",
      "members": [
        341,
        342
      ]
    },
    "343": {
      "name": "Balbuto \u2192 Kaorine",
      "members": [
        343,
        344
      ]
    },
    "345": {
      "name": "Lilia \u2192 Vacillys",
      "members": [
        345,
        346
      ]
    },
    "347": {
      "name": "Anorith \u2192 Armaldo",
      "members": [
        347,
        348
      ]
    },
    "349": {
      "name": "Barpau \u2192 Milobellus",
      "members": [
        349,
        350
      ]
    },
    "351": {
      "name": "Morph\xE9o",
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
      "name": "Polichombr \u2192 Branette",
      "members": [
        353,
        354
      ]
    },
    "355": {
      "name": "Skel\xE9nox \u2192 T\xE9raclope \u2192 Noctunoir",
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
      "name": "Ok\xE9ok\xE9 \u2192 Qulbutok\xE9",
      "members": [
        360,
        202
      ]
    },
    "361": {
      "name": "Stalgamin \u2192 Oniglali / Momartik",
      "members": [
        361,
        362,
        478
      ]
    },
    "363": {
      "name": "Obalie \u2192 Phogleur \u2192 Kaimorse",
      "members": [
        363,
        364,
        365
      ]
    },
    "366": {
      "name": "Coquiperl \u2192 Serpang / Rosabyss",
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
      "name": "Draby \u2192 Drackhaus \u2192 Drattak",
      "members": [
        371,
        372,
        373
      ]
    },
    "374": {
      "name": "Terhal \u2192 M\xE9tang \u2192 M\xE9talosse",
      "members": [
        374,
        375,
        376
      ]
    },
    "387": {
      "name": "Tortipouss \u2192 Boskara \u2192 Torterra",
      "members": [
        387,
        388,
        389
      ]
    },
    "390": {
      "name": "Ouisticram \u2192 Chimpenfeu \u2192 Simiabraz",
      "members": [
        390,
        391,
        392
      ]
    },
    "393": {
      "name": "Tiplouf \u2192 Prinplouf \u2192 Pingol\xE9on",
      "members": [
        393,
        394,
        395
      ]
    },
    "396": {
      "name": "\xC9tourmi \u2192 \xC9tourvol \u2192 \xC9touraptor",
      "members": [
        396,
        397,
        398
      ]
    },
    "399": {
      "name": "Keunotor \u2192 Castorno",
      "members": [
        399,
        400
      ]
    },
    "401": {
      "name": "Crikzik \u2192 M\xE9lokrik",
      "members": [
        401,
        402
      ]
    },
    "403": {
      "name": "Lixy \u2192 Luxio \u2192 Luxray",
      "members": [
        403,
        404,
        405
      ]
    },
    "406": {
      "name": "Rozbouton \u2192 Ros\xE9lia \u2192 Roserade",
      "members": [
        406,
        315,
        407
      ]
    },
    "408": {
      "name": "Kranidos \u2192 Charkos",
      "members": [
        408,
        409
      ]
    },
    "410": {
      "name": "Dinoclier \u2192 Bastiodon",
      "members": [
        410,
        411
      ]
    },
    "412": {
      "name": "Cheniti \u2192 Cheniselle / Papilord",
      "members": [
        412,
        413,
        414
      ]
    },
    "415": {
      "name": "Apitrini \u2192 Apireine",
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
      "name": "Must\xE9bou\xE9e \u2192 Must\xE9flott",
      "members": [
        418,
        419
      ]
    },
    "420": {
      "name": "Ceribou \u2192 Ceriflor",
      "members": [
        420,
        421
      ]
    },
    "422": {
      "name": "Sancoki \u2192 Tritosor",
      "members": [
        422,
        423
      ]
    },
    "425": {
      "name": "Baudrive \u2192 Grodrive",
      "members": [
        425,
        426
      ]
    },
    "427": {
      "name": "Laporeille \u2192 Lockpin",
      "members": [
        427,
        428
      ]
    },
    "431": {
      "name": "Chaglam \u2192 Chaffreux",
      "members": [
        431,
        432
      ]
    },
    "433": {
      "name": "Korillon \u2192 \xC9oko",
      "members": [
        433,
        358
      ]
    },
    "434": {
      "name": "Moufouette \u2192 Mouflair",
      "members": [
        434,
        435
      ]
    },
    "436": {
      "name": "Arch\xE9omire \u2192 Arch\xE9odong",
      "members": [
        436,
        437
      ]
    },
    "438": {
      "name": "Manza\xEF \u2192 Simularbre",
      "members": [
        438,
        185
      ]
    },
    "439": {
      "name": "Mime Jr. \u2192 M. Mime",
      "members": [
        439,
        122
      ]
    },
    "122": {
      "name": "Mime Jr. \u2192 M. Mime",
      "members": [
        439,
        122
      ]
    },
    "440": {
      "name": "Ptiravi \u2192 Leveinard \u2192 Leuphorie",
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
      "name": "Griknot \u2192 Carmache \u2192 Carchacrok",
      "members": [
        443,
        444,
        445
      ]
    },
    "446": {
      "name": "Goinfrex \u2192 Ronflex",
      "members": [
        446,
        143
      ]
    },
    "447": {
      "name": "Riolu \u2192 Lucario",
      "members": [
        447,
        448
      ]
    },
    "449": {
      "name": "Hippopotas \u2192 Hippodocus",
      "members": [
        449,
        450
      ]
    },
    "451": {
      "name": "Rapion \u2192 Drascore",
      "members": [
        451,
        452
      ]
    },
    "453": {
      "name": "Cradopaud \u2192 Coatox",
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
      "name": "\xC9cayon \u2192 Lumin\xE9on",
      "members": [
        456,
        457
      ]
    },
    "458": {
      "name": "Babimanta \u2192 D\xE9manta",
      "members": [
        458,
        226
      ]
    },
    "459": {
      "name": "Blizzi \u2192 Blizzaroi",
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
      "name": "Vip\xE9lierre \u2192 Lianaja \u2192 Majaspic",
      "members": [
        495,
        496,
        497
      ]
    },
    "498": {
      "name": "Gruikui \u2192 Grotichon \u2192 Roitiflam",
      "members": [
        498,
        499,
        500
      ]
    },
    "501": {
      "name": "Moustillon \u2192 Mateloutre \u2192 Clamiral",
      "members": [
        501,
        502,
        503
      ]
    },
    "504": {
      "name": "Ratentif \u2192 Miradar",
      "members": [
        504,
        505
      ]
    },
    "506": {
      "name": "Ponchiot \u2192 Ponchien \u2192 Mastouffe",
      "members": [
        506,
        507,
        508
      ]
    },
    "509": {
      "name": "Chacripan \u2192 L\xE9opardus",
      "members": [
        509,
        510
      ]
    },
    "511": {
      "name": "Feuillajou \u2192 Feuiloutan",
      "members": [
        511,
        512
      ]
    },
    "513": {
      "name": "Flamajou \u2192 Flamoutan",
      "members": [
        513,
        514
      ]
    },
    "515": {
      "name": "Flotajou \u2192 Flotoutan",
      "members": [
        515,
        516
      ]
    },
    "517": {
      "name": "Munna \u2192 Mushana",
      "members": [
        517,
        518
      ]
    },
    "519": {
      "name": "Poichigeon \u2192 Colombeau \u2192 D\xE9flaisan",
      "members": [
        519,
        520,
        521
      ]
    },
    "522": {
      "name": "Z\xE9bibron \u2192 Z\xE9blitz",
      "members": [
        522,
        523
      ]
    },
    "524": {
      "name": "Nodulithe \u2192 G\xE9olithe \u2192 Gigalithe",
      "members": [
        524,
        525,
        526
      ]
    },
    "527": {
      "name": "Chovsourir \u2192 Rhinolove",
      "members": [
        527,
        528
      ]
    },
    "529": {
      "name": "Rototaupe \u2192 Minotaupe",
      "members": [
        529,
        530
      ]
    },
    "532": {
      "name": "Charpenti \u2192 Ouvifier \u2192 B\xE9tochef",
      "members": [
        532,
        533,
        534
      ]
    },
    "535": {
      "name": "Tritonde \u2192 Batracn\xE9 \u2192 Crapustule",
      "members": [
        535,
        536,
        537
      ]
    },
    "540": {
      "name": "Larveyette \u2192 Coupenotte \u2192 Manternel",
      "members": [
        540,
        541,
        542
      ]
    },
    "543": {
      "name": "Venipatte \u2192 Scobolide \u2192 Brutapode",
      "members": [
        543,
        544,
        545
      ]
    },
    "546": {
      "name": "Doudouvet \u2192 Farfaduvet",
      "members": [
        546,
        547
      ]
    },
    "548": {
      "name": "Chlorobule \u2192 Fragilady",
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
      "name": "Masca\xEFman \u2192 Escroco \u2192 Crocorible",
      "members": [
        551,
        552,
        553
      ]
    },
    "554": {
      "name": "Darumarond \u2192 Darumacho",
      "members": [
        554,
        555
      ]
    },
    "557": {
      "name": "Crabicoque \u2192 Crabaraque",
      "members": [
        557,
        558
      ]
    },
    "559": {
      "name": "Baggiguane \u2192 Bagga\xEFd",
      "members": [
        559,
        560
      ]
    },
    "562": {
      "name": "Tutafeh \u2192 Tutankafer",
      "members": [
        562,
        563
      ]
    },
    "563": {
      "name": "Tutafeh \u2192 Tutankafer",
      "members": [
        562,
        563
      ]
    },
    "564": {
      "name": "Carapagos \u2192 M\xE9gapagos",
      "members": [
        564,
        565
      ]
    },
    "566": {
      "name": "Ark\xE9apti \u2192 A\xE9ropt\xE9ryx",
      "members": [
        566,
        567
      ]
    },
    "568": {
      "name": "Miamiasme \u2192 Miasmax",
      "members": [
        568,
        569
      ]
    },
    "570": {
      "name": "Zorua \u2192 Zoroark",
      "members": [
        570,
        571
      ]
    },
    "572": {
      "name": "Chinchidou \u2192 Pashmilla",
      "members": [
        572,
        573
      ]
    },
    "574": {
      "name": "Nucl\xE9os \u2192 M\xE9ios \u2192 Symbios",
      "members": [
        574,
        575,
        576
      ]
    },
    "577": {
      "name": "Couaneton \u2192 Lakm\xE9cygne",
      "members": [
        577,
        578
      ]
    },
    "580": {
      "name": "Sorb\xE9b\xE9 \u2192 Sorboul \u2192 Sorbouboul",
      "members": [
        580,
        581,
        582
      ]
    },
    "585": {
      "name": "Vivaldaim \u2192 Haydaim",
      "members": [
        585,
        586
      ]
    },
    "588": {
      "name": "Carabing \u2192 Lan\xE7argot",
      "members": [
        588,
        589
      ]
    },
    "590": {
      "name": "Trompignon \u2192 Gaulet",
      "members": [
        590,
        591
      ]
    },
    "592": {
      "name": "Viscuse \u2192 Moyade",
      "members": [
        592,
        593
      ]
    },
    "595": {
      "name": "Statitik \u2192 Mygavolt",
      "members": [
        595,
        596
      ]
    },
    "597": {
      "name": "Grindur \u2192 Noacier",
      "members": [
        597,
        598
      ]
    },
    "599": {
      "name": "Tic \u2192 Clic \u2192 Cliticlic",
      "members": [
        599,
        600,
        601
      ]
    },
    "602": {
      "name": "Anchwatt \u2192 Lamp\xE9roie \u2192 Ohmassacre",
      "members": [
        602,
        603,
        604
      ]
    },
    "605": {
      "name": "Lewsor \u2192 Neitram",
      "members": [
        605,
        606
      ]
    },
    "607": {
      "name": "Fun\xE9cire \u2192 M\xE9lancolux \u2192 Lugulabre",
      "members": [
        607,
        608,
        609
      ]
    },
    "610": {
      "name": "Coupenotte \u2192 Incisache \u2192 Tranchodon",
      "members": [
        610,
        611,
        612
      ]
    },
    "613": {
      "name": "Polarhume \u2192 Polagriffe",
      "members": [
        613,
        614
      ]
    },
    "616": {
      "name": "Escargaume \u2192 Limaspeed",
      "members": [
        616,
        617
      ]
    },
    "619": {
      "name": "Kungfouine \u2192 Shaofouine",
      "members": [
        619,
        620
      ]
    },
    "622": {
      "name": "Gringolem \u2192 Golemastoc",
      "members": [
        622,
        623
      ]
    },
    "624": {
      "name": "Scalpion \u2192 Scalproie \u2192 Scalpereur",
      "members": [
        624,
        625,
        983
      ]
    },
    "627": {
      "name": "Furaiglon \u2192 Gueriaigle",
      "members": [
        627,
        628
      ]
    },
    "629": {
      "name": "Vostourno \u2192 Vaututrice",
      "members": [
        629,
        630
      ]
    },
    "633": {
      "name": "Solochi \u2192 Diamat \u2192 Trioxhydre",
      "members": [
        633,
        634,
        635
      ]
    },
    "636": {
      "name": "Pyronille \u2192 Pyrax",
      "members": [
        636,
        637
      ]
    },
    "650": {
      "name": "Marisson \u2192 Boguenisse \u2192 Blind\xE9pique",
      "members": [
        650,
        651,
        652
      ]
    },
    "653": {
      "name": "Feunnec \u2192 Roussil \u2192 Goupelin",
      "members": [
        653,
        654,
        655
      ]
    },
    "656": {
      "name": "Grenousse \u2192 Cro\xE2poral \u2192 Amphinobi",
      "members": [
        656,
        657,
        658
      ]
    },
    "659": {
      "name": "Sapereau \u2192 Excavarenne",
      "members": [
        659,
        660
      ]
    },
    "661": {
      "name": "Passerouge \u2192 Braisillon \u2192 Flambusard",
      "members": [
        661,
        662,
        663
      ]
    },
    "664": {
      "name": "L\xE9pidonille \u2192 P\xE9r\xE9grain \u2192 Prismillon",
      "members": [
        664,
        665,
        666
      ]
    },
    "667": {
      "name": "H\xE9lionceau \u2192 N\xE9m\xE9lios",
      "members": [
        667,
        668
      ]
    },
    "669": {
      "name": "Flab\xE9b\xE9 \u2192 Floette \u2192 Florges",
      "members": [
        669,
        670,
        671
      ]
    },
    "672": {
      "name": "Cabriolaine \u2192 Chevroum",
      "members": [
        672,
        673
      ]
    },
    "674": {
      "name": "Pandespi\xE8gle \u2192 Pandarbare",
      "members": [
        674,
        675
      ]
    },
    "677": {
      "name": "Psystigri \u2192 Mistigrix",
      "members": [
        677,
        678
      ]
    },
    "679": {
      "name": "Monorpale \u2192 Dimocl\xE8s \u2192 Exagide",
      "members": [
        679,
        680,
        681
      ]
    },
    "682": {
      "name": "Fluvetin \u2192 Cocotine",
      "members": [
        682,
        683
      ]
    },
    "684": {
      "name": "Sucroquin \u2192 Cupcanaille",
      "members": [
        684,
        685
      ]
    },
    "686": {
      "name": "Sepiatop \u2192 Sepiatroce",
      "members": [
        686,
        687
      ]
    },
    "688": {
      "name": "Opermine \u2192 Golgopathe",
      "members": [
        688,
        689
      ]
    },
    "690": {
      "name": "Venalgue \u2192 Kravarech",
      "members": [
        690,
        691
      ]
    },
    "692": {
      "name": "Flingouste \u2192 Gamblast",
      "members": [
        692,
        693
      ]
    },
    "694": {
      "name": "Galvaran \u2192 Iguolta",
      "members": [
        694,
        695
      ]
    },
    "696": {
      "name": "Ptyranidur \u2192 Rexillius",
      "members": [
        696,
        697
      ]
    },
    "698": {
      "name": "Amagara \u2192 Dragmara",
      "members": [
        698,
        699
      ]
    },
    "704": {
      "name": "Mucuscule \u2192 Colimucus \u2192 Muplodocus",
      "members": [
        704,
        705,
        706
      ]
    },
    "708": {
      "name": "Broc\xE9l\xF4me \u2192 Dess\xE9liande",
      "members": [
        708,
        709
      ]
    },
    "710": {
      "name": "Pitrouille \u2192 Banshitrouye",
      "members": [
        710,
        711
      ]
    },
    "712": {
      "name": "Grela\xE7on \u2192 S\xE9racrawl",
      "members": [
        712,
        713
      ]
    },
    "714": {
      "name": "Sonistrelle \u2192 Bruyverne",
      "members": [
        714,
        715
      ]
    },
    "722": {
      "name": "Brindibou \u2192 Effl\xE8che \u2192 Arch\xE9duc",
      "members": [
        722,
        723,
        724
      ]
    },
    "725": {
      "name": "Flamiaou \u2192 Matoufeu \u2192 F\xE9linferno",
      "members": [
        725,
        726,
        727
      ]
    },
    "728": {
      "name": "Otaquin \u2192 Otarlette \u2192 Oratoria",
      "members": [
        728,
        729,
        730
      ]
    },
    "731": {
      "name": "Picassaut \u2192 Piclairon \u2192 Bazoucan",
      "members": [
        731,
        732,
        733
      ]
    },
    "734": {
      "name": "Manglouton \u2192 Argouste",
      "members": [
        734,
        735
      ]
    },
    "736": {
      "name": "Larvibule \u2192 Chrysapile \u2192 Lucanon",
      "members": [
        736,
        737,
        738
      ]
    },
    "739": {
      "name": "Crabagarre \u2192 Crabominable",
      "members": [
        739,
        740
      ]
    },
    "742": {
      "name": "Bombydou \u2192 Rubombelle",
      "members": [
        742,
        743
      ]
    },
    "744": {
      "name": "Rocabot \u2192 Lougaroc",
      "members": [
        744,
        745
      ]
    },
    "747": {
      "name": "Vorast\xE9rie \u2192 Pr\xE9dast\xE9rie",
      "members": [
        747,
        748
      ]
    },
    "749": {
      "name": "Tiboudet \u2192 Bourrinos",
      "members": [
        749,
        750
      ]
    },
    "751": {
      "name": "Araqua \u2192 Tarenbulle",
      "members": [
        751,
        752
      ]
    },
    "753": {
      "name": "Mimantis \u2192 Floramantis",
      "members": [
        753,
        754
      ]
    },
    "755": {
      "name": "Spododo \u2192 Gu\xE9rilande",
      "members": [
        755,
        756
      ]
    },
    "757": {
      "name": "Tritox \u2192 Malamandre",
      "members": [
        757,
        758
      ]
    },
    "759": {
      "name": "Nounourson \u2192 Chelours",
      "members": [
        759,
        760
      ]
    },
    "761": {
      "name": "Croquine \u2192 Candine \u2192 Sucreine",
      "members": [
        761,
        762,
        763
      ]
    },
    "767": {
      "name": "Sovkipou \u2192 Sarmura\xEF",
      "members": [
        767,
        768
      ]
    },
    "769": {
      "name": "Bacabouh \u2192 Tr\xE9passable",
      "members": [
        769,
        770
      ]
    },
    "772": {
      "name": "Type:0 \u2192 Silvalli\xE9",
      "members": [
        772,
        773
      ]
    },
    "782": {
      "name": "B\xE9b\xE9caille \u2192 \xC9ca\xEFd \u2192 \xC9ka\xEFser",
      "members": [
        782,
        783,
        784
      ]
    },
    "789": {
      "name": "Cosmog \u2192 Cosmoem \u2192 Solgaleo / Lunala",
      "members": [
        789,
        790,
        791,
        792
      ]
    },
    "803": {
      "name": "V\xE9mini \u2192 Mandrillon",
      "members": [
        803,
        804
      ]
    },
    "808": {
      "name": "Meltan \u2192 Melmetal",
      "members": [
        808,
        809
      ]
    },
    "810": {
      "name": "Ouistempo \u2192 Badabouin \u2192 Gorythmic",
      "members": [
        810,
        811,
        812
      ]
    },
    "813": {
      "name": "Flambino \u2192 Lapyro \u2192 Pyrobut",
      "members": [
        813,
        814,
        815
      ]
    },
    "816": {
      "name": "Larm\xE9l\xE9on \u2192 Arrozard \u2192 L\xE9zargus",
      "members": [
        816,
        817,
        818
      ]
    },
    "819": {
      "name": "Rongourmand \u2192 Rongrigou",
      "members": [
        819,
        820
      ]
    },
    "821": {
      "name": "Minisange \u2192 Bleuseille \u2192 Corvaillus",
      "members": [
        821,
        822,
        823
      ]
    },
    "824": {
      "name": "Larvadar \u2192 Col\xE9od\xF4me \u2192 Astronelle",
      "members": [
        824,
        825,
        826
      ]
    },
    "827": {
      "name": "Goupilou \u2192 Roublenard",
      "members": [
        827,
        828
      ]
    },
    "829": {
      "name": "Tournicoton \u2192 Blancoton",
      "members": [
        829,
        830
      ]
    },
    "831": {
      "name": "Moumouton \u2192 Moumouflon",
      "members": [
        831,
        832
      ]
    },
    "833": {
      "name": "Kh\xE9locrok \u2192 Torgamord",
      "members": [
        833,
        834
      ]
    },
    "835": {
      "name": "Voltoutou \u2192 Fulgudog",
      "members": [
        835,
        836
      ]
    },
    "837": {
      "name": "Charbi \u2192 Wagomine \u2192 Monthracite",
      "members": [
        837,
        838,
        839
      ]
    },
    "840": {
      "name": "Verpome \u2192 Pomdrapi / Dratatin / Pomdramour",
      "members": [
        840,
        841,
        842,
        1011
      ]
    },
    "843": {
      "name": "Dunaja \u2192 Dunaconda",
      "members": [
        843,
        844
      ]
    },
    "846": {
      "name": "Embrochet \u2192 Hastacuda",
      "members": [
        846,
        847
      ]
    },
    "848": {
      "name": "Toxizap \u2192 Salarsen",
      "members": [
        848,
        849
      ]
    },
    "850": {
      "name": "Grillepattes \u2192 Scolocendre",
      "members": [
        850,
        851
      ]
    },
    "852": {
      "name": "Poulpaf \u2192 Krakos",
      "members": [
        852,
        853
      ]
    },
    "854": {
      "name": "Th\xE9ffroi \u2192 Polth\xE9geist",
      "members": [
        854,
        855
      ]
    },
    "856": {
      "name": "Bibichut \u2192 Chapotus \u2192 Sorcilence",
      "members": [
        856,
        857,
        858
      ]
    },
    "859": {
      "name": "Grimalin \u2192 Fourbelin \u2192 Angoliath",
      "members": [
        859,
        860,
        861
      ]
    },
    "4263": {
      "name": "Zigzaton de Galar \u2192 Lin\xE9on de Galar \u2192 Ixon",
      "members": [
        4263,
        4264,
        862
      ]
    },
    "862": {
      "name": "Zigzaton de Galar \u2192 Lin\xE9on de Galar \u2192 Ixon",
      "members": [
        4263,
        4264,
        862
      ]
    },
    "4052": {
      "name": "Miaouss de Galar \u2192 Berserkatt",
      "members": [
        4052,
        863
      ]
    },
    "863": {
      "name": "Miaouss de Galar \u2192 Berserkatt",
      "members": [
        4052,
        863
      ]
    },
    "4083": {
      "name": "Canarticho de Galar \u2192 Palarticho",
      "members": [
        4083,
        865
      ]
    },
    "865": {
      "name": "Canarticho de Galar \u2192 Palarticho",
      "members": [
        4083,
        865
      ]
    },
    "4222": {
      "name": "Corayon de Galar \u2192 Coray\xF4me",
      "members": [
        4222,
        864
      ]
    },
    "864": {
      "name": "Corayon de Galar \u2192 Coray\xF4me",
      "members": [
        4222,
        864
      ]
    },
    "4562": {
      "name": "Tutafeh de Galar \u2192 Tut\xE9t\xE9kri",
      "members": [
        4562,
        867
      ]
    },
    "867": {
      "name": "Tutafeh de Galar \u2192 Tut\xE9t\xE9kri",
      "members": [
        4562,
        867
      ]
    },
    "6215": {
      "name": "Farfuret de Hisui \u2192 Farfurex",
      "members": [
        6215,
        903
      ]
    },
    "903": {
      "name": "Farfuret de Hisui \u2192 Farfurex",
      "members": [
        6215,
        903
      ]
    },
    "2052": {
      "name": "Miaouss d'Alola \u2192 Persian d'Alola",
      "members": [
        2052,
        2053
      ]
    },
    "2053": {
      "name": "Miaouss d'Alola \u2192 Persian d'Alola",
      "members": [
        2052,
        2053
      ]
    },
    "4122": {
      "name": "M. Mime de Galar \u2192 M. Glaquette",
      "members": [
        4122,
        866
      ]
    },
    "866": {
      "name": "M. Mime de Galar \u2192 M. Glaquette",
      "members": [
        4122,
        866
      ]
    },
    "6211": {
      "name": "Qwilfish de Hisui \u2192 Qwilpik",
      "members": [
        6211,
        904
      ]
    },
    "904": {
      "name": "Qwilfish de Hisui \u2192 Qwilpik",
      "members": [
        6211,
        904
      ]
    },
    "6550": {
      "name": "Bargantua \xE0 Rayures Blanches \u2192 Paragruel",
      "members": [
        6550,
        902
      ]
    },
    "902": {
      "name": "Bargantua \xE0 Rayures Blanches \u2192 Paragruel",
      "members": [
        6550,
        902
      ]
    },
    "8194": {
      "name": "Axoloto de Paldea \u2192 Terraiste",
      "members": [
        8194,
        980
      ]
    },
    "980": {
      "name": "Axoloto de Paldea \u2192 Terraiste",
      "members": [
        8194,
        980
      ]
    },
    "868": {
      "name": "Cr\xE8my \u2192 Charmilly",
      "members": [
        868,
        869
      ]
    },
    "872": {
      "name": "Frissonille \u2192 Beldeneige",
      "members": [
        872,
        873
      ]
    },
    "878": {
      "name": "Charibari \u2192 Pachyradjah",
      "members": [
        878,
        879
      ]
    },
    "884": {
      "name": "Duralugon \u2192 Pondralugon",
      "members": [
        884,
        1018
      ]
    },
    "885": {
      "name": "Fantyrm \u2192 Dispareptil \u2192 Lanssorien",
      "members": [
        885,
        886,
        887
      ]
    },
    "891": {
      "name": "Wushours \u2192 Shifours",
      "members": [
        891,
        892
      ]
    },
    "906": {
      "name": "Poussacha \u2192 Matourgeon \u2192 Miascarade",
      "members": [
        906,
        907,
        908
      ]
    },
    "909": {
      "name": "Chochodile \u2192 Crocogril \u2192 Fl\xE2migator",
      "members": [
        909,
        910,
        911
      ]
    },
    "912": {
      "name": "Coiffeton \u2192 Canarbello \u2192 Palmaval",
      "members": [
        912,
        913,
        914
      ]
    },
    "915": {
      "name": "Gourmelet \u2192 Fragroin",
      "members": [
        915,
        916
      ]
    },
    "917": {
      "name": "Tissenboule \u2192 Filentrappe",
      "members": [
        917,
        918
      ]
    },
    "919": {
      "name": "Lilliterre \u2192 Gambex",
      "members": [
        919,
        920
      ]
    },
    "921": {
      "name": "Pohm \u2192 Pohmotte \u2192 Pohmarmotte",
      "members": [
        921,
        922,
        923
      ]
    },
    "924": {
      "name": "Compagnol \u2192 Famignol",
      "members": [
        924,
        925
      ]
    },
    "926": {
      "name": "P\xE2tachiot \u2192 Briochien",
      "members": [
        926,
        927
      ]
    },
    "928": {
      "name": "Olivini \u2192 Olivado \u2192 Arboliva",
      "members": [
        928,
        929,
        930
      ]
    },
    "932": {
      "name": "Selstin \u2192 Amonbiste \u2192 Gigansel",
      "members": [
        932,
        933,
        934
      ]
    },
    "935": {
      "name": "Charbambin \u2192 Carmadura / Malvalame",
      "members": [
        935,
        936,
        937
      ]
    },
    "938": {
      "name": "T\xEAtampoule \u2192 Ampibidou",
      "members": [
        938,
        939
      ]
    },
    "940": {
      "name": "Zap\xE9trel \u2192 Fulgulairo",
      "members": [
        940,
        941
      ]
    },
    "942": {
      "name": "Grondogue \u2192 Dogrino",
      "members": [
        942,
        943
      ]
    },
    "944": {
      "name": "Gribouraigne \u2192 Tag-Tag",
      "members": [
        944,
        945
      ]
    },
    "946": {
      "name": "Viroquin \u2192 Virevorreur",
      "members": [
        946,
        947
      ]
    },
    "948": {
      "name": "L\xE9boul\xE9rou \u2192 B\xE9rasca",
      "members": [
        948,
        949
      ]
    },
    "951": {
      "name": "Pimentin \u2192 Scovilain",
      "members": [
        951,
        952
      ]
    },
    "955": {
      "name": "Flotillon \u2192 Cl\xE9opsytra",
      "members": [
        955,
        956
      ]
    },
    "957": {
      "name": "Forgella \u2192 Forgeline \u2192 Forgelina",
      "members": [
        957,
        958,
        959
      ]
    },
    "960": {
      "name": "Taupikeur \u2192 Trioppikeur",
      "members": [
        960,
        961
      ]
    },
    "963": {
      "name": "Dofin \u2192 Superdofin",
      "members": [
        963,
        964
      ]
    },
    "965": {
      "name": "Vrombi \u2192 Vrombotor",
      "members": [
        965,
        966
      ]
    },
    "968": {
      "name": "Germ\xE9clat \u2192 Flor\xE9clat",
      "members": [
        968,
        969
      ]
    },
    "970": {
      "name": "Toutombe \u2192 Tomberro",
      "members": [
        970,
        971
      ]
    },
    "996": {
      "name": "Frigodo \u2192 Gla\xE7odo \u2192 Glaivodo",
      "members": [
        996,
        997,
        998
      ]
    },
    "999": {
      "name": "Mordudor \u2192 Gromago",
      "members": [
        999,
        1e3
      ]
    },
    "1012": {
      "name": "Poltchageist \u2192 Th\xE9ffroyable",
      "members": [
        1012,
        1013
      ]
    }
  };

  // src/data/branched-prevolutions.js
  var branchedPrevolutions = {
    // 43: Mystherbe -> Ortide -> Rafflesia (45) / Joliflor (182)
    44: 43,
    45: 44,
    182: 44,
    // 60: Ptitard -> Têtarte -> Tartard (62) / Tarpaud (186)
    61: 60,
    62: 61,
    186: 61,
    // 79: Ramoloss -> Flagadoss (80) / Roigada (199)
    80: 79,
    199: 79,
    // 123: Insécateur -> Cizayox (212) / Hachécateur (900)
    212: 123,
    900: 123,
    // 133: Évoli -> Aquali (134), Voltali (135), Pyroli (136), Mentali (196), Noctali (197), Phyllali (470), Givrali (471), Nymphali (700)
    134: 133,
    135: 133,
    136: 133,
    196: 133,
    197: 133,
    470: 133,
    471: 133,
    700: 133,
    // 236: Debugant -> Kicklee (106) / Tygnon (107) / Kapoera (237)
    106: 236,
    107: 236,
    237: 236,
    // 265: Chenipotte -> Armulys (266) -> Charmillon (267) / Blindalys (268) -> Papinox (269)
    266: 265,
    267: 266,
    268: 265,
    269: 268,
    // 280: Tarsal -> Kirlia (281) -> Gardevoir (282) / Gallame (475)
    281: 280,
    282: 281,
    475: 281,
    // 290: Ningale -> Ninjask (291) / Munja (292)
    291: 290,
    292: 290,
    // 361: Stalgamin -> Oniglali (362) / Momartik (478)
    362: 361,
    478: 361,
    // 366: Coquiperl -> Serpang (367) / Rosabyss (368)
    367: 366,
    368: 366,
    // 412: Cheniti -> Cheniselle (413) / Papilord (414)
    413: 412,
    414: 412,
    // 789: Cosmog -> Cosmoem (790) -> Solgaleo (791) / Lunala (792)
    790: 789,
    791: 790,
    792: 790,
    // 840: Verpom -> Pomdrapi (841) / Dratatin (842) / Pomdramour (1011) -> Pomdorochi (1019)
    841: 840,
    842: 840,
    1011: 840,
    1019: 1011,
    // 935: Charbambin -> Carmadura (936) / Malvalame (937)
    936: 935,
    937: 935
  };

  // src/data/species-names.js
  var staticSpeciesNames = {
    1: "Bulbizarre",
    2: "Herbizarre",
    3: "Florizarre",
    4: "Salam\xE8che",
    5: "Reptincel",
    6: "Dracaufeu",
    7: "Carapuce",
    8: "Carabaffe",
    9: "Tortank",
    10: "Chenipan",
    11: "Chrysacier",
    12: "Papilusion",
    13: "Aspicot",
    14: "Coconfort",
    15: "Dardargnan",
    16: "Roucool",
    17: "Roucoups",
    18: "Roucarnage",
    19: "Rattata",
    20: "Rattatac",
    21: "Piafabec",
    22: "Rapasdepic",
    23: "Abo",
    24: "Arbok",
    25: "Pikachu",
    26: "Raichu",
    27: "Sabelette",
    28: "Sablaireau",
    29: "Nidoran\u2640",
    30: "Nidorina",
    31: "Nidoqueen",
    32: "Nidoran\u2642",
    33: "Nidorino",
    34: "Nidoking",
    35: "M\xE9lof\xE9e",
    36: "M\xE9lodelfe",
    37: "Goupix",
    38: "Feunard",
    39: "Rondoudou",
    40: "Grodoudou",
    41: "Nosferapti",
    42: "Nosferalto",
    43: "Mystherbe",
    44: "Ortide",
    45: "Rafflesia",
    46: "Paras",
    47: "Parasect",
    48: "Mimitoss",
    49: "A\xE9romite",
    50: "Taupiqueur",
    51: "Triopikeur",
    52: "Miaouss",
    53: "Persian",
    54: "Psykokwak",
    55: "Akwakwak",
    56: "F\xE9rosinge",
    57: "Colossinge",
    58: "Caninos",
    59: "Arcanin",
    60: "Ptitard",
    61: "T\xEAtarte",
    62: "Tartard",
    63: "Abra",
    64: "Kadabra",
    65: "Alakazam",
    66: "Machoc",
    67: "Machopeur",
    68: "Mackogneur",
    69: "Ch\xE9tiflor",
    70: "Boustiflor",
    71: "Empiflor",
    72: "Tentacool",
    73: "Tentacruel",
    74: "Racaillou",
    75: "Gravalanch",
    76: "Grolem",
    77: "Ponyta",
    78: "Galopa",
    79: "Ramoloss",
    80: "Flagadoss",
    81: "Magn\xE9ti",
    82: "Magn\xE9ton",
    83: "Canarticho",
    84: "Doduo",
    85: "Dodrio",
    86: "Otaria",
    87: "Lamantine",
    88: "Tadmorv",
    89: "Grotadmorv",
    90: "Kokiyas",
    91: "Crustabri",
    92: "Fantominus",
    93: "Spectrum",
    94: "Ectoplasma",
    95: "Onix",
    96: "Soporifik",
    97: "Hypnomade",
    98: "Krabby",
    99: "Krabboss",
    100: "Voltorbe",
    101: "\xC9lectrode",
    102: "Noeunoeuf",
    103: "Noadkoko",
    104: "Osselait",
    105: "Ossatueur",
    106: "Kicklee",
    107: "Tygnon",
    108: "Excelangue",
    109: "Smogo",
    110: "Smogogo",
    111: "Rhinocorne",
    112: "Rhinof\xE9ros",
    113: "Leveinard",
    114: "Saquedeneu",
    115: "Kangourex",
    116: "Hypotrempe",
    117: "Hypoc\xE9an",
    118: "Poissir\xE8ne",
    119: "Poissoroy",
    120: "Stari",
    121: "Staross",
    122: "M. Mime",
    123: "Ins\xE9cateur",
    124: "Lippoutou",
    125: "\xC9lektek",
    126: "Magmar",
    127: "Scarabrute",
    128: "Tauros",
    129: "Magicarpe",
    130: "L\xE9viator",
    131: "Lokhlass",
    132: "M\xE9tamorph",
    133: "\xC9voli",
    134: "Aquali",
    135: "Voltali",
    136: "Pyroli",
    137: "Porygon",
    138: "Amonita",
    139: "Amonistar",
    140: "Kabuto",
    141: "Kabutops",
    142: "Pt\xE9ra",
    143: "Ronflex",
    144: "Artikodin",
    145: "\xC9lecthor",
    146: "Sulfura",
    147: "Minidraco",
    148: "Draco",
    149: "Dracolosse",
    150: "Mewtwo",
    151: "Mew",
    152: "Germignon",
    153: "Macronium",
    154: "M\xE9ganium",
    155: "H\xE9ricendre",
    156: "Feurisson",
    157: "Typhlosion",
    158: "Kaiminus",
    159: "Crocrodil",
    160: "Aligatueur",
    161: "Fouinette",
    162: "Fouinar",
    163: "Hoothoot",
    164: "Noarfang",
    165: "Coxy",
    166: "Coxyclaque",
    167: "Mimigal",
    168: "Migalos",
    169: "Nostenfer",
    170: "Loupio",
    171: "Lanturn",
    172: "Pichu",
    173: "M\xE9lo",
    174: "Toudoudou",
    175: "Togepi",
    176: "Togetic",
    177: "Natu",
    178: "Xatu",
    179: "Wattouat",
    180: "Lainergie",
    181: "Pharamp",
    182: "Joliflor",
    183: "Marill",
    184: "Azumarill",
    185: "Simularbre",
    186: "Tarpaud",
    187: "Granivol",
    188: "Floravol",
    189: "Cotovol",
    190: "Capumain",
    191: "Tournegrin",
    192: "H\xE9liatronc",
    193: "Yanma",
    194: "Axoloto",
    195: "Maraiste",
    196: "Mentali",
    197: "Noctali",
    198: "Corn\xE8bre",
    199: "Roigada",
    200: "Feufor\xEAve",
    201: "Zarbi",
    202: "Qulbutok\xE9",
    203: "Girafarig",
    204: "Pomdepik",
    205: "Foretress",
    206: "Insolourdo",
    207: "Scorplane",
    208: "Steelix",
    209: "Snubbull",
    210: "Granbull",
    211: "Qwilfish",
    212: "Cizayox",
    213: "Caratroc",
    214: "Scarhino",
    215: "Farfuret",
    216: "Teddiursa",
    217: "Ursaring",
    218: "Limagma",
    219: "Volcaropod",
    220: "Marcacrin",
    221: "Cochignon",
    222: "Corayon",
    223: "R\xE9moraid",
    224: "Octillery",
    225: "Cadoizo",
    226: "D\xE9manta",
    227: "Airmure",
    228: "Malosse",
    229: "D\xE9molosse",
    230: "Hyporoi",
    231: "Phanpy",
    232: "Donphan",
    233: "Porygon2",
    234: "Cerfrousse",
    235: "Queulorior",
    236: "Debugant",
    237: "Kapoera",
    238: "Lippouti",
    239: "\xC9lekid",
    240: "Magby",
    241: "\xC9cr\xE9meuh",
    242: "Leuphorie",
    243: "Raikou",
    244: "Entei",
    245: "Suicune",
    246: "Embrylex",
    247: "Ymphect",
    248: "Tyranocif",
    249: "Lugia",
    250: "Ho-Oh",
    251: "Celebi",
    252: "Arcko",
    253: "Massko",
    254: "Jungko",
    255: "Poussifeu",
    256: "Galifeu",
    257: "Bras\xE9gali",
    258: "Gobou",
    259: "Flobio",
    260: "Laggron",
    261: "Medhy\xE8na",
    262: "Grahy\xE8na",
    263: "Zigzaton",
    264: "Lin\xE9on",
    265: "Chenipotte",
    266: "Armulys",
    267: "Charmillon",
    268: "Blindalys",
    269: "Papinox",
    270: "N\xE9nupiot",
    271: "Lombre",
    272: "Ludicolo",
    273: "Grainipiot",
    274: "Pifeuil",
    275: "Tengalice",
    276: "Nirondelle",
    277: "H\xE9l\xE9delle",
    278: "Go\xE9lise",
    279: "Bekipan",
    280: "Tarsal",
    281: "Kirlia",
    282: "Gardevoir",
    283: "Arakdo",
    284: "Maskadra",
    285: "Balignon",
    286: "Chapignon",
    287: "Parecool",
    288: "Vigoroth",
    289: "Monafl\xE8mit",
    290: "Ningale",
    291: "Ninjask",
    292: "Munja",
    293: "Chuchmur",
    294: "Ramboum",
    295: "Brouhabam",
    296: "Makuhita",
    297: "Hariyama",
    298: "Azurill",
    299: "Tarinor",
    300: "Skitty",
    301: "Delcatty",
    302: "T\xE9n\xE9fix",
    303: "Mysdibule",
    304: "Galekid",
    305: "Galegon",
    306: "Galeking",
    307: "M\xE9ditikka",
    308: "Charmina",
    309: "Dynavolt",
    310: "\xC9lecsprint",
    311: "Posipi",
    312: "N\xE9gapi",
    313: "Muciole",
    314: "Lumivole",
    315: "Ros\xE9lia",
    316: "Gloupti",
    317: "Avaltout",
    318: "Carvanha",
    319: "Sharpedo",
    320: "Wailmer",
    321: "Wailord",
    322: "Chamallot",
    323: "Cam\xE9rupt",
    324: "Chartor",
    325: "Spoink",
    326: "Groret",
    327: "Spinda",
    328: "Kraknoix",
    329: "Vibraninf",
    330: "Lib\xE9gon",
    331: "Cacnea",
    332: "Cacturne",
    333: "Tylton",
    334: "Altaria",
    335: "Mangriff",
    336: "S\xE9viper",
    337: "S\xE9l\xE9roc",
    338: "Solaroc",
    339: "Barloche",
    340: "Barbicha",
    341: "\xC9crapince",
    342: "Colhomard",
    343: "Balbuto",
    344: "Kaorine",
    345: "Lilia",
    346: "Vacilys",
    347: "Anorith",
    348: "Armaldo",
    349: "Barpau",
    350: "Milobellus",
    351: "Morph\xE9o",
    352: "Kecleon",
    353: "Polichombr",
    354: "Branette",
    355: "Skel\xE9nox",
    356: "T\xE9raclope",
    357: "Tropius",
    358: "\xC9oko",
    359: "Absol",
    360: "Ok\xE9ok\xE9",
    361: "Stalgamin",
    362: "Oniglali",
    363: "Obalie",
    364: "Phogleur",
    365: "Kaimorse",
    366: "Coquiperl",
    367: "Serpang",
    368: "Rosabyss",
    369: "Relicanth",
    370: "Lovdisc",
    371: "Draby",
    372: "Drackhaus",
    373: "Drattak",
    374: "Terhal",
    375: "M\xE9tang",
    376: "M\xE9talosse",
    377: "Regirock",
    378: "Regice",
    379: "Registeel",
    380: "Latias",
    381: "Latios",
    382: "Kyogre",
    383: "Groudon",
    384: "Rayquaza",
    385: "Jirachi",
    386: "Deoxys",
    387: "Tortipouss",
    388: "Boskara",
    389: "Torterra",
    390: "Ouisticram",
    391: "Chimpenfeu",
    392: "Simiabraz",
    393: "Tiplouf",
    394: "Prinplouf",
    395: "Pingol\xE9on",
    396: "\xC9tourmi",
    397: "\xC9tourvol",
    398: "\xC9touraptor",
    399: "Keunotor",
    400: "Castorno",
    401: "Crikzik",
    402: "M\xE9lokrik",
    403: "Lixy",
    404: "Luxio",
    405: "Luxray",
    406: "Rozbouton",
    407: "Roserade",
    408: "Kranidos",
    409: "Charkos",
    410: "Dinoclier",
    411: "Bastiodon",
    412: "Cheniti",
    413: "Cheniselle",
    414: "Papilord",
    415: "Apitrini",
    416: "Apireine",
    417: "Pachirisu",
    418: "Must\xE9bou\xE9e",
    419: "Must\xE9flott",
    420: "Ceribou",
    421: "Ceriflor",
    422: "Sancoki",
    423: "Tritosor",
    424: "Capidextre",
    425: "Baudrive",
    426: "Grodrive",
    427: "Laporeille",
    428: "Lockpin",
    429: "Magir\xEAve",
    430: "Corboss",
    431: "Chaglam",
    432: "Chaffreux",
    433: "Korillon",
    434: "Moufouette",
    435: "Moufflair",
    436: "Arch\xE9omire",
    437: "Arch\xE9odong",
    438: "Manza\xEF",
    439: "Mime Jr.",
    440: "Ptiravi",
    441: "Pijako",
    442: "Spiritomb",
    443: "Griknot",
    444: "Carmache",
    445: "Carchacrok",
    446: "Goinfrex",
    447: "Riolu",
    448: "Lucario",
    449: "Hippopotas",
    450: "Hippodocus",
    451: "Rapion",
    452: "Drascore",
    453: "Cradopaud",
    454: "Coatox",
    455: "Vortente",
    456: "\xC9cayon",
    457: "Lumin\xE9on",
    458: "Babimanta",
    459: "Blizzi",
    460: "Blizzaroi",
    461: "Dimoret",
    462: "Magn\xE9zone",
    463: "Coudlangue",
    464: "Rhinastoc",
    465: "Bouldeneu",
    466: "\xC9lekable",
    467: "Maganon",
    468: "Togekiss",
    469: "Yanmega",
    470: "Phyllali",
    471: "Givrali",
    472: "Scorvol",
    473: "Mammochon",
    474: "Porygon-Z",
    475: "Gallame",
    476: "Tarinorme",
    477: "Noctunoir",
    478: "Momartik",
    479: "Motisma",
    480: "Cr\xE9helf",
    481: "Cr\xE9follet",
    482: "Cr\xE9fadet",
    483: "Dialga",
    484: "Palkia",
    485: "Heatran",
    486: "Regigigas",
    487: "Giratina",
    488: "Cresselia",
    489: "Phione",
    490: "Manaphy",
    491: "Darkrai",
    492: "Shaymin",
    493: "Arceus",
    494: "Victini",
    495: "Vip\xE9lierre",
    496: "Lianaja",
    497: "Majaspic",
    498: "Gruikui",
    499: "Grotichon",
    500: "Roitiflam",
    501: "Moustillon",
    502: "Mateloutre",
    503: "Clamiral",
    504: "Ratentif",
    505: "Miradar",
    506: "Ponchiot",
    507: "Ponchien",
    508: "Mastouffe",
    509: "Chacripan",
    510: "L\xE9opardus",
    511: "Feuillajou",
    512: "Feuiloutan",
    513: "Flamajou",
    514: "Flamoutan",
    515: "Flotajou",
    516: "Flotoutan",
    517: "Munna",
    518: "Mushana",
    519: "Poichigeon",
    520: "Colombeau",
    521: "D\xE9flaisan",
    522: "Z\xE9bibron",
    523: "Z\xE9blitz",
    524: "Nodulithe",
    525: "G\xE9olithe",
    526: "Gigalithe",
    527: "Chovsourir",
    528: "Rhinolove",
    529: "Rototaupe",
    530: "Minotaupe",
    531: "Nanm\xE9ou\xEFe",
    532: "Charpenti",
    533: "Ouvrifier",
    534: "B\xE9tochef",
    535: "Tritonde",
    536: "Batracn\xE9",
    537: "Crapustule",
    538: "Judokrak",
    539: "Karacl\xE9e",
    540: "Larveyette",
    541: "Couverdure",
    542: "Manternel",
    543: "Venipatte",
    544: "Scobolide",
    545: "Brutapode",
    546: "Doudouvet",
    547: "Farfaduvet",
    548: "Chlorobule",
    549: "Fragilady",
    550: "Bargantua",
    551: "Masca\xEFman",
    552: "Escroco",
    553: "Crocorible",
    554: "Darumarond",
    555: "Darumacho",
    556: "Maracachi",
    557: "Crabicoque",
    558: "Crabaraque",
    559: "Baggiguane",
    560: "Bagga\xEFd",
    561: "Crypt\xE9ro",
    562: "Tutafeh",
    563: "Tutankafer",
    564: "Carapagos",
    565: "M\xE9gapagos",
    566: "Ark\xE9apti",
    567: "A\xE9ropt\xE9ryx",
    568: "Miamiasme",
    569: "Miasmax",
    570: "Zorua",
    571: "Zoroark",
    572: "Chinchidou",
    573: "Pashmilla",
    574: "Scrutella",
    575: "Mesm\xE9rella",
    576: "Sid\xE9rella",
    577: "Nucl\xE9os",
    578: "M\xE9ios",
    579: "Symbios",
    580: "Couaneton",
    581: "Lakm\xE9cygne",
    582: "Sorb\xE9b\xE9",
    583: "Sorboul",
    584: "Sorbouboul",
    585: "Vivaldaim",
    586: "Haydaim",
    587: "Emolga",
    588: "Carabing",
    589: "Lan\xE7argot",
    590: "Trompignon",
    591: "Gaulet",
    592: "Viskuse",
    593: "Moyade",
    594: "Mamanbo",
    595: "Statitik",
    596: "Mygavolt",
    597: "Grindur",
    598: "Noacier",
    599: "Tic",
    600: "Clic",
    601: "Cliticlic",
    602: "Anchwatt",
    603: "Lamp\xE9roie",
    604: "Ohmassacre",
    605: "Lewsor",
    606: "Neitram",
    607: "Fun\xE9cire",
    608: "M\xE9lancolux",
    609: "Lugulabre",
    610: "Coupenotte",
    611: "Incisache",
    612: "Tranchodon",
    613: "Polarhume",
    614: "Polagriffe",
    615: "Hexagel",
    616: "Escargaume",
    617: "Limaspeed",
    618: "Limonde",
    619: "Kungfouine",
    620: "Shaofouine",
    621: "Drakkarmin",
    622: "Gringolem",
    623: "Golemastoc",
    624: "Scalpion",
    625: "Scalproie",
    626: "Frison",
    627: "Furaiglon",
    628: "Gueriaigle",
    629: "Vostourno",
    630: "Vaututrice",
    631: "Aflamanoir",
    632: "Fermite",
    633: "Solochi",
    634: "Diamat",
    635: "Trioxhydre",
    636: "Pyronille",
    637: "Pyrax",
    638: "Cobaltium",
    639: "Terrakium",
    640: "Viridium",
    641: "Bor\xE9as",
    642: "Fulguris",
    643: "Reshiram",
    644: "Zekrom",
    645: "D\xE9m\xE9t\xE9ros",
    646: "Kyurem",
    647: "Keldeo",
    648: "Meloetta",
    649: "Genesect",
    650: "Marisson",
    651: "Bogu\xE9risse",
    652: "Blind\xE9pique",
    653: "Feunnec",
    654: "Roussil",
    655: "Goupelin",
    656: "Grenousse",
    657: "Cro\xE2poral",
    658: "Amphinobi",
    659: "Sapereau",
    660: "Excavarenne",
    661: "Passerouge",
    662: "Braisillon",
    663: "Flambusard",
    664: "L\xE9pidonille",
    665: "P\xE9r\xE9grain",
    666: "Prismillon",
    667: "H\xE9lionceau",
    668: "N\xE9m\xE9lios",
    669: "Flab\xE9b\xE9",
    670: "Floette",
    671: "Florges",
    672: "Cabriolaine",
    673: "Chevroum",
    674: "Pandespi\xE8gle",
    675: "Pandarbare",
    676: "Couafarel",
    677: "Psystigri",
    678: "Mistigrix",
    679: "Monorpale",
    680: "Dimocl\xE8s",
    681: "Exagide",
    682: "Fluvetin",
    683: "Cocotine",
    684: "Sucroquin",
    685: "Cupcanaille",
    686: "Sepiatop",
    687: "Sepiatroce",
    688: "Opermine",
    689: "Golgopathe",
    690: "Venalgue",
    691: "Kravarech",
    692: "Flingouste",
    693: "Gamblast",
    694: "Galvaran",
    695: "Iguolta",
    696: "Ptyranidur",
    697: "Rexillius",
    698: "Amagara",
    699: "Dragmara",
    700: "Nymphali",
    701: "Brutalibr\xE9",
    702: "Dedenne",
    703: "Strassie",
    704: "Mucuscule",
    705: "Colimucus",
    706: "Muplodocus",
    707: "Trousselin",
    708: "Broc\xE9l\xF4me",
    709: "Dess\xE9liande",
    710: "Pitrouille",
    711: "Banshitrouye",
    712: "Grela\xE7on",
    713: "S\xE9racrawl",
    714: "Sonistrelle",
    715: "Bruyverne",
    716: "Xerneas",
    717: "Yveltal",
    718: "Zygarde",
    719: "Diancie",
    720: "Hoopa",
    721: "Volcanion",
    722: "Brindibou",
    723: "Effl\xE8che",
    724: "Arch\xE9duc",
    725: "Flamiaou",
    726: "Matoufeu",
    727: "F\xE9linferno",
    728: "Otaquin",
    729: "Otarlette",
    730: "Oratoria",
    731: "Picassaut",
    732: "Piclairon",
    733: "Bazoucan",
    734: "Manglouton",
    735: "Argouste",
    736: "Larvibule",
    737: "Chrysapile",
    738: "Lucanon",
    739: "Crabagarre",
    740: "Crabominable",
    741: "Plumeline",
    742: "Bombydou",
    743: "Rubombelle",
    744: "Rocabot",
    745: "Lougaroc",
    746: "Froussardine",
    747: "Vorast\xE9rie",
    748: "Pr\xE9dast\xE9rie",
    749: "Tiboudet",
    750: "Bourrinos",
    751: "Araqua",
    752: "Tarenbulle",
    753: "Mimantis",
    754: "Floramantis",
    755: "Spododo",
    756: "Lampignon",
    757: "Tritox",
    758: "Malamandre",
    759: "Nounourson",
    760: "Chelours",
    761: "Croquine",
    762: "Candine",
    763: "Sucreine",
    764: "Gu\xE9rilande",
    765: "Gouroutan",
    766: "Quartermac",
    767: "Sovkipou",
    768: "Sarmura\xEF",
    769: "Bacabouh",
    770: "Tr\xE9passable",
    771: "Concombaffe",
    772: "Type:0",
    773: "Silvalli\xE9",
    774: "M\xE9t\xE9no",
    775: "Dodoala",
    776: "Boumata",
    777: "Togedemaru",
    778: "Mimiqui",
    779: "Denticrisse",
    780: "Dra\xEFeul",
    781: "Sinistrail",
    782: "B\xE9b\xE9caille",
    783: "\xC9ca\xEFd",
    784: "\xC9ka\xEFser",
    785: "Tokorico",
    786: "Tokopiyon",
    787: "Tokotoro",
    788: "Tokopisco",
    789: "Cosmog",
    790: "Cosmovum",
    791: "Solgaleo",
    792: "Lunala",
    793: "Z\xE9ro\xEFd",
    794: "Mouscoto",
    795: "Cancrelove",
    796: "C\xE2blif\xE8re",
    797: "Bamboiselle",
    798: "Katagami",
    799: "Engloutyran",
    800: "Necrozma",
    801: "Magearna",
    802: "Marshadow",
    803: "V\xE9mini",
    804: "Mandrillon",
    805: "Ama-Ama",
    806: "Pierroteknik",
    807: "Zeraora",
    808: "Meltan",
    809: "Melmetal",
    810: "Ouistempo",
    811: "Badabouin",
    812: "Gorythmic",
    813: "Flambino",
    814: "Lapyro",
    815: "Pyrobut",
    816: "Larm\xE9l\xE9on",
    817: "Arrozard",
    818: "L\xE9zargus",
    819: "Rongourmand",
    820: "Rongrigou",
    821: "Minisange",
    822: "Bleuseille",
    823: "Corvaillus",
    824: "Larvadar",
    825: "Col\xE9od\xF4me",
    826: "Astronelle",
    827: "Goupilou",
    828: "Roublenard",
    829: "Tournicoton",
    830: "Blancoton",
    831: "Moumouton",
    832: "Moumouflon",
    833: "Kh\xE9locrok",
    834: "Torgamord",
    835: "Voltoutou",
    836: "Fulgudog",
    837: "Charbi",
    838: "Wagomine",
    839: "Monthracite",
    840: "Verpom",
    841: "Pomdrapi",
    842: "Dratatin",
    843: "Dunaja",
    844: "Dunaconda",
    845: "Nigosier",
    846: "Embrochet",
    847: "Hastacuda",
    848: "Toxizap",
    849: "Salarsen",
    850: "Grillepattes",
    851: "Scolocendre",
    852: "Poulpaf",
    853: "Krakos",
    854: "Th\xE9ffroi",
    855: "Polth\xE9geist",
    856: "Bibichut",
    857: "Chapotus",
    858: "Sorcilence",
    859: "Grimalin",
    860: "Fourbelin",
    861: "Angoliath",
    862: "Ixon",
    863: "Berserkatt",
    864: "Coray\xF4me",
    865: "Palarticho",
    866: "M. Glaquette",
    867: "Tut\xE9t\xE9kri",
    868: "Cr\xE8my",
    869: "Charmilly",
    870: "Hexadron",
    871: "Wattapik",
    872: "Frissonille",
    873: "Beldeneige",
    874: "Dolman",
    875: "Bekagla\xE7on",
    876: "Wimessir",
    877: "Morpeko",
    878: "Charibari",
    879: "Pachyradjah",
    880: "Galvagon",
    881: "Galvagla",
    882: "Hydragon",
    883: "Hydragla",
    884: "Duralugon",
    885: "Fantyrm",
    886: "Dispareptil",
    887: "Lanssorien",
    888: "Zacian",
    889: "Zamazenta",
    890: "\xC9thernatos",
    891: "Wushours",
    892: "Shifours",
    893: "Zarude",
    894: "Regieleki",
    895: "Regidrago",
    896: "Blizzeval",
    897: "Spectreval",
    898: "Sylveroy",
    899: "Cerbyllin",
    900: "Hach\xE9cateur",
    901: "Ursaking",
    902: "Paragruel",
    903: "Farfurex",
    904: "Qwilpik",
    905: "Amov\xE9nus",
    906: "Poussacha",
    907: "Matourgeon",
    908: "Miascarade",
    909: "Chochodile",
    910: "Crocogril",
    911: "Fl\xE2migator",
    912: "Coiffeton",
    913: "Canarbello",
    914: "Palmaval",
    915: "Gourmelet",
    916: "Fragroin",
    917: "Tissenboule",
    918: "Filentrappe",
    919: "Lilliterelle",
    920: "Gambex",
    921: "Pohm",
    922: "Pohmotte",
    923: "Pohmarmotte",
    924: "Compagnol",
    925: "Famignol",
    926: "P\xE2tachiot",
    927: "Briochien",
    928: "Olivini",
    929: "Olivado",
    930: "Arboliva",
    931: "Tapato\xE8s",
    932: "Selutin",
    933: "Amassel",
    934: "Gigansel",
    935: "Charbambin",
    936: "Carmadura",
    937: "Malvalame",
    938: "T\xEAtampoule",
    939: "Ampibidou",
    940: "Zap\xE9trel",
    941: "Fulgulairo",
    942: "Grondogue",
    943: "Dogrino",
    944: "Gribouraigne",
    945: "Tag-Tag",
    946: "Virovent",
    947: "Virevorreur",
    948: "Terracool",
    949: "Terracruel",
    950: "Craparoi",
    951: "Pimito",
    952: "Scovilain",
    953: "L\xE9boul\xE9rou",
    954: "B\xE9rasca",
    955: "Flotillon",
    956: "Cl\xE9opsytra",
    957: "Forgerette",
    958: "Forgella",
    959: "Forgelina",
    960: "Taupikeau",
    961: "Triopikeau",
    962: "Lestombaile",
    963: "Dofin",
    964: "Superdofin",
    965: "Vrombi",
    966: "Vrombotor",
    967: "Motorizard",
    968: "Ferdeter",
    969: "Germ\xE9clat",
    970: "Flor\xE9clat",
    971: "Toutombe",
    972: "Tomberro",
    973: "Flamenroule",
    974: "Pi\xE9tac\xE9",
    975: "Balbal\xE8ze",
    976: "D\xE9lestin",
    977: "Oyacata",
    978: "Nigirigon",
    979: "Courrousinge",
    980: "Terraiste",
    981: "Farigiraf",
    982: "Deusolourdo",
    983: "Scalpereur",
    984: "Fort-Ivoire",
    985: "Hurle-Queue",
    986: "Fongus-Furie",
    987: "Flotte-M\xE8che",
    988: "Rampe-Ailes",
    989: "Pelage-Sabl\xE9",
    990: "Roue-de-Fer",
    991: "Hotte-de-Fer",
    992: "Paume-de-Fer",
    993: "T\xEAtes-de-Fer",
    994: "Mite-de-Fer",
    995: "\xC9pine-de-Fer",
    996: "Frigodo",
    997: "Cryodo",
    998: "Glaivodo",
    999: "Mordudor",
    1e3: "Gromago",
    1001: "Chongjian",
    1002: "Baojian",
    1003: "Dinglu",
    1004: "Yuyu",
    1005: "Rugit-Lune",
    1006: "Garde-de-Fer",
    1007: "Koraidon",
    1008: "Miraidon",
    1009: "Serpente-Eau",
    1010: "Vert-de-Fer",
    1011: "Pomdramour",
    1012: "Poltchageist",
    1013: "Th\xE9ffroyable",
    1014: "F\xE9licanis",
    1015: "Fortusimia",
    1016: "Favianos",
    1017: "Ogerpon",
    1018: "Pondralugon",
    1019: "Pomdorochi",
    1020: "Feu-Per\xE7ant",
    1021: "Ire-Foudre",
    1022: "Roc-de-Fer",
    1023: "Chef-de-Fer",
    1024: "Terapagos",
    1025: "P\xEAchaminus"
  };

  // src/core/storage.js
  var PokeStorage = {
    get(key, defaultValue) {
      try {
        if (typeof GM_getValue === "function") {
          const val = GM_getValue(key);
          if (val !== void 0) return JSON.parse(val);
        }
      } catch (e) {
      }
      try {
        const localVal = localStorage.getItem(key);
        if (localVal !== null) return JSON.parse(localVal);
      } catch (e) {
      }
      return defaultValue;
    },
    set(key, value) {
      const json = JSON.stringify(value);
      try {
        if (typeof GM_setValue === "function") {
          GM_setValue(key, json);
        }
      } catch (e) {
      }
      try {
        localStorage.setItem(key, json);
      } catch (e) {
      }
    }
  };

  // src/constants/storage-keys.js
  var STORAGE_KEY = "pokeskip_species_rules_v1";
  var SETTINGS_KEY = "pokeskip_settings_v1";
  var STATS_KEY = "pokeskip_stats_v1";

  // src/core/state.js
  var PokeSkip = {
    rules: PokeStorage.get(STORAGE_KEY, {}),
    settings: (() => {
      const s = Object.assign({
        enabled: true,
        showToasts: true,
        toastDuration: 2800,
        soundFeedback: false,
        showQuickPrompt: true,
        quickPromptDuration: 15,
        showHudCount: true,
        advancedMode: false,
        promptAutoReplacement: true
      }, PokeStorage.get(SETTINGS_KEY, {}));
      if (s.toastDuration === 4e3) s.toastDuration = 2800;
      return s;
    })(),
    stats: PokeStorage.get(STATS_KEY, {
      totalSkipped: 0,
      currentSeed: null,
      runSkipped: 0
    }),
    onStatsChanged: null,
    game: null,
    scene: null,
    hooked: false,
    activeParty: [],
    knownMovesCache: {},
    saveRules() {
      PokeStorage.set(STORAGE_KEY, this.rules);
    },
    saveSettings() {
      PokeStorage.set(SETTINGS_KEY, this.settings);
    },
    saveStats() {
      PokeStorage.set(STATS_KEY, this.stats);
    },
    getCurrentRunSeed() {
      try {
        const sc = this.scene || (typeof unsafeWindow !== "undefined" ? unsafeWindow : window).globalScene;
        if (sc && sc.seed) return String(sc.seed);
      } catch (e) {
      }
      return "default_session";
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
      if (typeof this.onStatsChanged === "function") {
        this.onStatsChanged();
      }
    },
    migrateRules() {
      let changed = false;
      const newRules = {};
      for (const [key, rule] of Object.entries(this.rules)) {
        if (!rule) continue;
        if (key.startsWith("family_")) {
          newRules[key] = {
            familyId: rule.familyId,
            lineageName: rule.lineageName,
            skippedMoves: Object.assign({}, rule.skippedMoves || {}),
            doNotPromptMoves: Object.assign({}, rule.doNotPromptMoves || {}),
            skipAll: !!rule.skipAll,
            enabled: rule.enabled !== false,
            replacements: Array.isArray(rule.replacements) ? rule.replacements.slice() : [],
            updatedAt: rule.updatedAt || Date.now()
          };
        }
      }
      for (const [key, rule] of Object.entries(this.rules)) {
        if (!rule || key.startsWith("family_")) continue;
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
        this.rules[famKey].enabled = this.rules[famKey].enabled === false;
        this.rules[famKey].updatedAt = Date.now();
      }
      this.saveRules();
      return this.rules[famKey].enabled;
    },
    isMoveSkipped(target, moveName, moveId) {
      if (!this.settings.enabled) return false;
      const rule = this.getFamilyRule(target);
      if (!rule) return false;
      if (rule.enabled === false) return false;
      if (rule.skipAll) return true;
      if (!rule.skippedMoves) return false;
      if (moveName && rule.skippedMoves[moveName.trim().toLowerCase()]) return true;
      if (moveId && rule.skippedMoves[`id_${moveId}`]) return true;
      return false;
    },
    shouldSkip(target, moveName, moveId) {
      return this.isMoveSkipped(target, moveName, moveId);
    },
    isMoveCandidateToSkip(target, moveName, moveId) {
      return this.isMoveSkipped(target, moveName, moveId);
    },
    isMoveAutoReplaced(target, moveName, moveId) {
      return Boolean(this.findActiveReplacement(target, moveName, moveId));
    },
    addMoveToSkip(target, moveName, moveId) {
      return this.setMoveSkipped(target, null, moveName, moveId, true);
    },
    setMoveSkipped(target, speciesName, moveName, moveId, isSkipped) {
      const familyInfo = LineageManager.getFamilyInfo(target, speciesName);
      const familyKey = familyInfo.familyKey;
      if (!this.rules[familyKey]) {
        this.rules[familyKey] = {
          familyId: familyInfo.rootId,
          lineageName: familyInfo.lineageName,
          skippedMoves: {},
          doNotPromptMoves: {},
          skipAll: false,
          enabled: true,
          replacements: [],
          updatedAt: Date.now()
        };
      }
      const rule = this.rules[familyKey];
      if (!rule.doNotPromptMoves) rule.doNotPromptMoves = {};
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
    setMovePromptSuppressed(target, speciesName, moveName, moveId, isSuppressed) {
      const familyInfo = LineageManager.getFamilyInfo(target, speciesName);
      const familyKey = familyInfo.familyKey;
      if (!this.rules[familyKey]) {
        this.rules[familyKey] = {
          familyId: familyInfo.rootId,
          lineageName: familyInfo.lineageName,
          skippedMoves: {},
          doNotPromptMoves: {},
          skipAll: false,
          enabled: true,
          replacements: [],
          updatedAt: Date.now()
        };
      }
      const rule = this.rules[familyKey];
      if (!rule.doNotPromptMoves) rule.doNotPromptMoves = {};
      if (familyInfo.lineageName) rule.lineageName = familyInfo.lineageName;
      const key = moveName ? moveName.trim().toLowerCase() : `id_${moveId}`;
      if (isSuppressed) {
        rule.doNotPromptMoves[key] = true;
        if (moveId) rule.doNotPromptMoves[`id_${moveId}`] = true;
      } else {
        delete rule.doNotPromptMoves[key];
        if (moveId) delete rule.doNotPromptMoves[`id_${moveId}`];
      }
      rule.updatedAt = Date.now();
      this.saveRules();
    },
    isMoveAutoReplacementTarget(target, moveName, moveId) {
      if (!this.settings.advancedMode) return false;
      const rule = this.getFamilyRule(target);
      if (!rule || !Array.isArray(rule.replacements) || rule.replacements.length === 0) return false;
      if (rule.enabled === false) return false;
      const normalize = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, "");
      const normName = normalize(moveName);
      const numId = moveId !== void 0 && moveId !== null ? Number(moveId) : null;
      return rule.replacements.some((r) => {
        if (!r.enabled) return false;
        if (numId && r.newMoveId && Number(r.newMoveId) === numId) return true;
        if (normName && normalize(r.newMoveName) === normName) return true;
        return false;
      });
    },
    isMovePromptSuppressed(target, moveName, moveId) {
      if (this.isMoveAutoReplacementTarget(target, moveName, moveId)) {
        return true;
      }
      const rule = this.getFamilyRule(target);
      if (!rule || !rule.doNotPromptMoves) return false;
      if (moveName) {
        const key = moveName.trim().toLowerCase();
        if (rule.doNotPromptMoves[key]) return true;
      }
      if (moveId && rule.doNotPromptMoves[`id_${moveId}`]) {
        return true;
      }
      return false;
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
      return rule && Array.isArray(rule.replacements) ? rule.replacements : [];
    },
    addReplacementRule(target, newMoveName, arg2, arg3 = null, arg4 = null) {
      let oldMoveName = "";
      let newMoveId = null;
      let oldMoveId = null;
      if (typeof arg2 === "string") {
        oldMoveName = arg2;
        newMoveId = arg3;
        oldMoveId = arg4;
      } else {
        newMoveId = arg2;
        oldMoveName = typeof arg3 === "string" ? arg3 : "";
        oldMoveId = arg4;
      }
      if (!newMoveName || !oldMoveName) return null;
      if (!this.settings.advancedMode) {
        this.settings.advancedMode = true;
        this.saveSettings();
      }
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
      const normalize = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, "");
      const newNorm = normalize(newMoveName);
      this.rules[famKey].replacements = this.rules[famKey].replacements.filter(
        (r) => normalize(r.newMoveName) !== newNorm
      );
      const ruleObj = {
        id: "rep_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        newMoveName: newMoveName.trim(),
        newMoveId: newMoveId || LineageManager.findMoveIdByName(newMoveName) || null,
        oldMoveName: oldMoveName.trim(),
        oldMoveId: oldMoveId || LineageManager.findMoveIdByName(oldMoveName) || null,
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
      const r = rule.replacements.find((item) => item.id === ruleId);
      if (r) {
        r.enabled = enabled !== void 0 ? enabled : !r.enabled;
        rule.updatedAt = Date.now();
        this.saveRules();
        return true;
      }
      return false;
    },
    deleteReplacementRule(target, ruleId) {
      const rule = this.getFamilyRule(target);
      if (!rule || !Array.isArray(rule.replacements)) return false;
      rule.replacements = rule.replacements.filter((item) => item.id !== ruleId);
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
      if (!this.settings.enabled) return null;
      if (this.settings.advancedMode === false) return null;
      const rule = this.getFamilyRule(target);
      if (!rule || !Array.isArray(rule.replacements) || rule.replacements.length === 0) return null;
      if (rule.enabled === false) return null;
      const normalize = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, "");
      const incNorm = normalize(incomingMoveName);
      const incId = incomingMoveId !== void 0 && incomingMoveId !== null ? Number(incomingMoveId) : null;
      return rule.replacements.find((r) => {
        if (!r.enabled) return false;
        if (incId && r.newMoveId && Number(r.newMoveId) === incId) return true;
        if (incNorm && normalize(r.newMoveName) === incNorm) return true;
        return false;
      }) || null;
    }
  };

  // src/constants/categories.js
  var MOVE_CATEGORIES = [
    { name: "Physique", icon: "\u{1F4A5}", color: "#f87171" },
    { name: "Sp\xE9ciale", icon: "\u2728", color: "#60a5fa" },
    { name: "Statut", icon: "\u{1F300}", color: "#94a3b8" }
  ];

  // src/constants/types.js
  var POKEMON_TYPES = [
    { name: "Normal", code: "NOR", color: "#ffffff", bg: "#ada594" },
    { name: "Combat", code: "COM", color: "#ffffff", bg: "#a55239" },
    { name: "Vol", code: "VOL", color: "#ffffff", bg: "#9cadf7" },
    { name: "Poison", code: "POI", color: "#ffffff", bg: "#9141cb" },
    { name: "Sol", code: "SOL", color: "#ffffff", bg: "#ae7a3b" },
    { name: "Roche", code: "ROC", color: "#ffffff", bg: "#bda55a" },
    { name: "Insecte", code: "INS", color: "#ffffff", bg: "#adbd21" },
    { name: "Spectre", code: "SPE", color: "#ffffff", bg: "#6363b5" },
    { name: "Acier", code: "ACI", color: "#ffffff", bg: "#81a6be" },
    { name: "Feu", code: "FEU", color: "#ffffff", bg: "#f75231" },
    { name: "Eau", code: "EAU", color: "#ffffff", bg: "#399cff" },
    { name: "Plante", code: "PLA", color: "#ffffff", bg: "#7bce52" },
    { name: "\xC9lectrik", code: "\xC9LE", color: "#ffffff", bg: "#ffc631" },
    { name: "Psy", code: "PSY", color: "#ffffff", bg: "#ef4179" },
    { name: "Glace", code: "GLA", color: "#ffffff", bg: "#5acee7" },
    { name: "Dragon", code: "DRA", color: "#ffffff", bg: "#7b63e7" },
    { name: "T\xE9n\xE8bres", code: "T\xC9N", color: "#ffffff", bg: "#735a4a" },
    { name: "F\xE9e", code: "F\xC9E", color: "#ffffff", bg: "#ef70ef" },
    { name: "Stellaire", code: "STE", color: "#ffffff", bg: "#6299bd" }
  ];
  var TYPE_CHART = [
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

  // src/core/lineage-manager.js
  var LineageManager = {
    families,
    branchedPrevolutions,
    megaFamilies,
    staticSpeciesNames,
    speciesNames: {},
    memberToRoot: {},
    init() {
      if (this.staticSpeciesNames) {
        for (const [idStr, name] of Object.entries(this.staticSpeciesNames)) {
          this.speciesNames[Number(idStr)] = name;
        }
      }
      for (const [rStr, fam] of Object.entries(this.families)) {
        const root = fam.members && fam.members.length > 0 ? fam.members[0] : Number(rStr);
        this.memberToRoot[root] = root;
        if (fam.members) {
          for (const m of fam.members) {
            this.memberToRoot[m] = root;
          }
          if (fam.name) {
            const rawNames = fam.name.replace(/\(Méga.*?\)/g, "").split(/[→/]/).map((s) => s.trim()).filter(Boolean);
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
          for (const m of fam.members) {
            if (this.megaFamilies[m] && !fam.name.includes("(M\xE9ga")) {
              fam.name += ` ${this.megaFamilies[m].suffix}`;
              break;
            }
          }
        }
      }
    },
    getSpeciesName(speciesId, formIndex = 0, pokemon = null) {
      if (!speciesId) return "";
      const sid = Number(speciesId);
      if (isNaN(sid)) return "";
      const isMega = pokemon ? this.isPokemonMega(pokemon) : false;
      if (this.speciesNames[sid]) {
        let n = this.speciesNames[sid];
        if (isMega && !n.toLowerCase().includes("m\xE9ga") && !n.toLowerCase().includes("mega")) {
          n = `M\xE9ga-${n}`;
        }
        return n;
      }
      if (sid >= 8e3 && sid < 1e4) {
        const base = this.getSpeciesName(sid - 8e3);
        if (base) return `${base} de Paldea`;
      }
      if (sid >= 6e3 && sid < 8e3) {
        const base = this.getSpeciesName(sid - 6e3);
        if (base) return `${base} de Hisui`;
      }
      if (sid >= 4e3 && sid < 6e3) {
        const base = this.getSpeciesName(sid - 4e3);
        if (base) return `${base} de Galar`;
      }
      if (sid >= 2e3 && sid < 4e3) {
        const base = this.getSpeciesName(sid - 2e3);
        if (base) return `${base} d'Alola`;
      }
      const fIdx = formIndex !== void 0 && formIndex !== null && formIndex > 0 ? Number(formIndex) : pokemon?.formIndex ? Number(pokemon.formIndex) : 0;
      if (fIdx > 0 && sid > 0 && sid < 1025) {
        if (pokemon?.species && typeof pokemon.species.getName === "function") {
          try {
            const locName = pokemon.species.getName(fIdx);
            if (locName && typeof locName === "string" && locName.trim()) {
              return locName.trim();
            }
          } catch (_) {
          }
        }
        const base = this.speciesNames[sid] || this.staticSpeciesNames && this.staticSpeciesNames[sid] || "";
        if (base) {
          const alolanIds = [19, 20, 26, 27, 28, 37, 38, 50, 51, 52, 53, 74, 75, 76, 88, 89, 103, 105];
          const galarianIds = [52, 77, 78, 79, 80, 83, 110, 122, 144, 145, 146, 199, 222, 263, 264, 554, 555, 562, 618];
          const hisuianIds = [58, 59, 100, 101, 157, 211, 215, 503, 549, 550, 570, 571, 628, 706, 713, 724];
          const paldeanIds = [128, 194];
          if (alolanIds.includes(sid) && fIdx === 1) return `${base} d'Alola`;
          if (galarianIds.includes(sid) && (fIdx === 1 || sid === 52 && fIdx === 2)) return `${base} de Galar`;
          if (hisuianIds.includes(sid) && fIdx === 1) return `${base} de Hisui`;
          if (paldeanIds.includes(sid) && fIdx === 1) return `${base} de Paldea`;
        }
      }
      if (this.staticSpeciesNames && this.staticSpeciesNames[sid]) {
        let n = this.staticSpeciesNames[sid];
        this.speciesNames[sid] = n;
        if (isMega && !n.toLowerCase().includes("m\xE9ga") && !n.toLowerCase().includes("mega")) {
          n = `M\xE9ga-${n}`;
        }
        return n;
      }
      try {
        const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        const scene = PokeSkip.scene || win.globalScene;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry || scene && scene.speciesDataRegistry || scene && scene.gameData && scene.gameData.speciesDataRegistry;
        if (sdr) {
          const sp = sdr.data ? sdr.data[sid] : typeof sdr.get === "function" ? sdr.get(sid) : null;
          if (sp) {
            const n = typeof sp.getName === "function" ? sp.getName(fIdx) : sp.name || sp.speciesName;
            if (n && typeof n === "string") {
              this.speciesNames[sid] = n;
              return n;
            }
          }
        }
      } catch (_) {
      }
      if (typeof PokeSkip !== "undefined" && PokeSkip.rules && PokeSkip.rules[sid] && PokeSkip.rules[sid].lineageName) {
        const ln = PokeSkip.rules[sid].lineageName;
        if (ln && !ln.startsWith("Esp\xE8ce #") && !ln.startsWith("Lign\xE9e #")) {
          this.speciesNames[sid] = ln;
          return ln;
        }
      }
      return "";
    },
    getParentSpeciesId(speciesId) {
      const idNum = Number(speciesId);
      if (!idNum) return null;
      if (this.branchedPrevolutions && this.branchedPrevolutions[idNum] !== void 0) {
        return this.branchedPrevolutions[idNum];
      }
      try {
        const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        const scene = PokeSkip.scene || win.globalScene;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry || scene && scene.speciesDataRegistry || scene && scene.gameData && scene.gameData.speciesDataRegistry;
        if (sdr && sdr.data && sdr.data[idNum] && sdr.data[idNum].prevolution !== void 0 && sdr.data[idNum].prevolution !== null) {
          const prev = Number(sdr.data[idNum].prevolution);
          if (prev && prev > 0) return prev;
        }
      } catch (_) {
      }
      return null;
    },
    /**
     * Construit dynamiquement la chaîne d'évolution depuis le speciesDataRegistry du jeu.
     * Remonte via prevolution et descend via getEvolutions/evolutions.
     * Retourne un tableau ordonné [racine, stade2, stade3, ...] ou null si inaccessible.
     */
    _getRegistryLineage(speciesId, pokemon = null) {
      try {
        const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        const scene = PokeSkip.scene || win.globalScene;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry || scene && scene.speciesDataRegistry || scene && scene.gameData && scene.gameData.speciesDataRegistry;
        if (!sdr || !sdr.data) return null;
        const data = sdr.data;
        const idNum = Number(speciesId);
        if (!idNum || !data[idNum]) return null;
        let rootId = null;
        if (pokemon && typeof pokemon.species?.getRootSpeciesId === "function") {
          try {
            rootId = Number(pokemon.species.getRootSpeciesId(false));
          } catch (_) {
          }
        }
        if (!rootId || !data[rootId]) {
          rootId = idNum;
          const visited = /* @__PURE__ */ new Set();
          while (data[rootId] && data[rootId].prevolution !== void 0 && data[rootId].prevolution !== null) {
            if (visited.has(rootId)) break;
            visited.add(rootId);
            rootId = Number(data[rootId].prevolution);
          }
        }
        const chain = [];
        const buildChain = (sid) => {
          if (chain.includes(sid)) return;
          chain.push(sid);
          let evos = [];
          if (typeof sdr.getEvolutions === "function") {
            try {
              evos = sdr.getEvolutions(sid) || [];
            } catch (_) {
            }
          }
          if ((!evos || evos.length === 0) && data[sid] && Array.isArray(data[sid].evolutions)) {
            evos = data[sid].evolutions;
          }
          if (evos && evos.length > 0) {
            const normalEvos = evos.filter((e) => {
              if (e.evoFormKey) {
                const fk = String(e.evoFormKey).toLowerCase();
                if (fk.includes("mega") || fk.includes("m\xE9ga") || fk.includes("gigantamax") || fk.includes("eternamax")) return false;
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
      } catch (e) {
      }
      return null;
    },
    getLineageMembers(pokemon) {
      const rootId = this.getRootId(pokemon);
      const currentId = Number(pokemon?.species?.speciesId ?? pokemon?.speciesId ?? rootId);
      let allMembers = this._getRegistryLineage(currentId, pokemon);
      if (!allMembers || allMembers.length === 0) {
        const fam = this.families[rootId];
        allMembers = fam && Array.isArray(fam.members) && fam.members.length > 0 ? [...fam.members] : rootId ? [rootId] : [];
      }
      try {
        const sp = pokemon?.species || (typeof pokemon?.getSpeciesForm === "function" ? pokemon.getSpeciesForm(true) : null);
        if (sp && typeof sp.getEvolutionLevels === "function") {
          const evos = sp.getEvolutionLevels();
          if (Array.isArray(evos)) {
            for (const item of evos) {
              const sid = Array.isArray(item) ? item[0] : item?.speciesId ?? item;
              if (sid && !allMembers.includes(sid)) {
                allMembers.push(sid);
              }
            }
          }
        }
      } catch (_) {
      }
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
      const name = (pokemon.name || pokemon.species?.name || "").toLowerCase();
      if (name.includes("mega") || name.includes("m\xE9ga")) return true;
      if (typeof pokemon.formeIndex === "number" && pokemon.formeIndex > 0) return true;
      if (typeof pokemon.formIndex === "number" && pokemon.formIndex > 0) return true;
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
        const scene = PokeSkip.scene || (typeof unsafeWindow !== "undefined" ? unsafeWindow.globalScene : window.globalScene);
        if (!scene || !scene.textures) return null;
        const speciesId = Number(pokemon?.species?.speciesId ?? pokemon?.speciesId);
        if (!speciesId || isNaN(speciesId)) return null;
        const isShiny = !!pokemon.shiny;
        let variant = 0;
        if (typeof pokemon.variant === "number") variant = pokemon.variant;
        else if (typeof pokemon.shinyTier === "number") variant = Math.max(0, pokemon.shinyTier - 1);
        const cacheKey = `pkm_${speciesId}_${isShiny ? "shiny" : "norm"}_v${variant}`;
        if (this._spriteCache && this._spriteCache[cacheKey]) {
          return this._spriteCache[cacheKey];
        }
        let textureKey = null;
        let frameName = null;
        if (pokemon.sprite && pokemon.sprite.texture && pokemon.sprite.texture.key) {
          textureKey = pokemon.sprite.texture.key;
          if (pokemon.sprite.frame && pokemon.sprite.frame.name) {
            frameName = pokemon.sprite.frame.name;
          }
        } else if (typeof pokemon.getBattleSpriteKey === "function") {
          try {
            textureKey = pokemon.getBattleSpriteKey(false);
          } catch (_) {
          }
        } else if (typeof pokemon.getSpriteKey === "function") {
          try {
            textureKey = pokemon.getSpriteKey();
          } catch (_) {
          }
        } else if (pokemon.spriteKey) {
          textureKey = pokemon.spriteKey;
        }
        if (!textureKey || !scene.textures.exists(textureKey)) {
          const allKeys = scene.textures.getTextureKeys();
          if (!allKeys || !allKeys.length) return null;
          const targetIdStr = String(speciesId);
          if (isShiny) {
            const variantSuffix = variant > 0 ? `_${variant + 1}` : "";
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
              textureKey = allKeys.find((k) => {
                const lk = k.toLowerCase();
                if (!lk.includes("shiny")) return false;
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
            textureKey = allKeys.find((k) => {
              const lk = k.toLowerCase();
              if (lk.includes("icon") || lk.includes("item") || lk.includes("ui") || lk.includes("bg")) return false;
              const parts = lk.split(/[/_.]/);
              return parts.includes(targetIdStr);
            });
          }
        }
        if (!textureKey || !scene.textures.exists(textureKey)) return null;
        const texture = scene.textures.get(textureKey);
        if (!texture || texture.key === "__MISSING") return null;
        let targetFrame = null;
        if (frameName && texture.has(frameName)) {
          targetFrame = texture.get(frameName);
        } else {
          const frameNames = texture.getFrameNames().filter((f) => f !== "__BASE");
          if (frameNames.length > 0) {
            targetFrame = texture.get(frameNames[0]);
          } else {
            targetFrame = texture.get("__BASE");
          }
        }
        if (!targetFrame) return null;
        const sourceImage = targetFrame.source?.image;
        if (!sourceImage) return null;
        if (sourceImage instanceof HTMLImageElement && (!sourceImage.complete || sourceImage.naturalWidth === 0)) {
          return null;
        }
        const cutX = targetFrame.cutX !== void 0 ? targetFrame.cutX : targetFrame.x || 0;
        const cutY = targetFrame.cutY !== void 0 ? targetFrame.cutY : targetFrame.y || 0;
        const cutW = targetFrame.cutWidth || targetFrame.width;
        const cutH = targetFrame.cutHeight || targetFrame.height;
        if (!cutW || !cutH) return null;
        const canvas = document.createElement("canvas");
        canvas.width = cutW;
        canvas.height = cutH;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sourceImage, cutX, cutY, cutW, cutH, 0, 0, cutW, cutH);
        const hasVariantTexture = textureKey.endsWith(`_${variant + 1}`);
        if (isShiny && variant > 0 && !hasVariantTexture) {
          if (!this._pendingVariantSwap[cacheKey]) {
            this._pendingVariantSwap[cacheKey] = true;
            AssetLoader._fetchVariantData(speciesId).then((variantJson) => {
              try {
                const colorMap = variantJson ? variantJson[String(variant)] : null;
                if (colorMap && typeof colorMap === "object") {
                  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  AssetLoader._applyPaletteSwap(imgData, colorMap);
                  ctx.putImageData(imgData, 0, 0);
                }
                const swappedUrl = canvas.toDataURL("image/png");
                if (!this._spriteCache) this._spriteCache = {};
                this._spriteCache[cacheKey] = swappedUrl;
                AssetLoader._storeAndUpdateSprite(AssetLoader.getCacheKey(speciesId, true, variant), speciesId, true, variant, swappedUrl);
              } catch (e) {
                console.warn("[Pok\xE9Skip] Erreur palette swap Phaser:", e);
              } finally {
                delete this._pendingVariantSwap[cacheKey];
              }
            });
          }
          const tempUrl = canvas.toDataURL("image/png");
          return tempUrl;
        }
        const dataUrl = canvas.toDataURL("image/png");
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
        if (typeof pokemon.variant === "number") variant = pokemon.variant;
        else if (typeof pokemon.shinyTier === "number") variant = Math.max(0, pokemon.shinyTier - 1);
      }
      const speciesId = customSpeciesId ?? (pokemon?.species?.speciesId ?? pokemon?.speciesId ?? this.getRootId(pokemon));
      const isShiny = pokemon ? !!pokemon.shiny : false;
      const isMega = pokemon ? this.isPokemonMega(pokemon) : false;
      let spriteId = speciesId;
      if (isMega && this.megaFamilies[speciesId]) {
        const name = (pokemon?.name || pokemon?.species?.name || "").toUpperCase();
        if (speciesId === 6) {
          spriteId = name.includes("Y") ? 10035 : 10034;
        } else if (speciesId === 150) {
          spriteId = name.includes("Y") ? 10044 : 10043;
        } else {
          spriteId = this.megaFamilies[speciesId].defaultMegaSpriteId;
        }
      }
      const stored = AssetLoader.getStoredSprite(spriteId, isShiny, variant);
      if (stored) return stored;
      const phaserSprite = this.extractPhaserSprite(pokemon);
      if (phaserSprite) return phaserSprite;
      AssetLoader.loadSpriteInBackground(spriteId, isShiny, variant);
      return isShiny ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${spriteId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`;
    },
    getPokemonShinyInfo(pokemon) {
      if (!pokemon || !pokemon.shiny) {
        return { isShiny: false, tier: 0, stars: "", title: "", className: "" };
      }
      let tier = 1;
      if (typeof pokemon.shinyTier === "number") {
        tier = Math.max(1, Math.min(3, pokemon.shinyTier));
      } else if (typeof pokemon.variant === "number") {
        tier = Math.max(1, Math.min(3, pokemon.variant + 1));
      } else if (typeof pokemon.luck === "number" && pokemon.luck >= 1) {
        tier = Math.min(3, pokemon.luck);
      }
      let stars = "\u2728";
      let title = "Chromatique Commun (Tier 1 \u2022 +1 Chance)";
      if (tier === 2) {
        stars = "\u2728\u2728";
        title = "Chromatique Rare (Tier 2 \u2022 +2 Chance)";
      } else if (tier === 3) {
        stars = "\u2728\u2728\u2728";
        title = "Chromatique \xC9pique (Tier 3 \u2022 +3 Chance)";
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
      if (typeof target === "string" && target.startsWith("family_")) {
        target = target.replace("family_", "");
      }
      try {
        if (typeof target?.species?.getRootSpeciesId === "function") {
          const r = target.species.getRootSpeciesId(false);
          if (r !== void 0 && r !== null) return Number(r);
        }
        if (typeof target?.getRootSpeciesId === "function") {
          const r = target.getRootSpeciesId(false);
          if (r !== void 0 && r !== null) return Number(r);
        }
      } catch (e) {
      }
      const spId = Number(target?.species?.speciesId ?? target?.speciesId ?? target);
      if (!isNaN(spId) && spId > 0) {
        try {
          const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
          const scene = PokeSkip.scene || win.globalScene;
          const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry || scene && scene.speciesDataRegistry || scene && scene.gameData && scene.gameData.speciesDataRegistry;
          if (sdr && sdr.data && sdr.data[spId]) {
            let rId = spId;
            const visited = /* @__PURE__ */ new Set();
            while (sdr.data[rId] && sdr.data[rId].prevolution !== void 0 && sdr.data[rId].prevolution !== null) {
              if (visited.has(rId)) break;
              visited.add(rId);
              rId = Number(sdr.data[rId].prevolution);
            }
            if (rId && rId > 0) {
              this.memberToRoot[spId] = rId;
              return rId;
            }
          }
        } catch (_) {
        }
        if (this.memberToRoot[spId]) return this.memberToRoot[spId];
        return spId;
      }
      return 0;
    },
    getFamilyKey(target) {
      const rootId = this.getRootId(target);
      return "family_" + rootId;
    },
    getFamilyInfo(target, fallbackName) {
      const rootId = this.getRootId(target);
      const familyKey = "family_" + rootId;
      let lineageName = "";
      if (this.families[rootId]) {
        lineageName = this.families[rootId].name;
      } else {
        const resolvedName = this.getSpeciesName(rootId);
        if (resolvedName) {
          lineageName = resolvedName;
          if (this.megaFamilies[rootId] && !lineageName.includes("(M\xE9ga")) {
            lineageName += ` ${this.megaFamilies[rootId].suffix}`;
          }
        } else {
          const directName = target?.species?.name || target?.name || fallbackName || "Esp\xE8ce #" + rootId;
          lineageName = directName;
        }
      }
      return { rootId, familyKey, lineageName };
    },
    getPokemonDisplayName(pokemon) {
      if (!pokemon) return "Pok\xE9mon";
      if (pokemon.nickname && typeof pokemon.nickname === "string" && pokemon.nickname.trim()) {
        return pokemon.nickname.trim();
      }
      const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      const gameLang = win.i18next?.language || typeof localStorage !== "undefined" && localStorage.getItem("i18nextLng") || "fr";
      const isFrench = !gameLang || gameLang.startsWith("fr");
      const sid = Number(pokemon?.species?.speciesId ?? pokemon?.speciesId ?? pokemon?.id);
      const isMega = this.isPokemonMega(pokemon);
      if (isFrench && sid && !isNaN(sid)) {
        let frName = this.getSpeciesName(sid, pokemon.formIndex, pokemon);
        if (frName) {
          if (isMega && !frName.toLowerCase().includes("m\xE9ga") && !frName.toLowerCase().includes("mega")) {
            frName = `M\xE9ga-${frName}`;
          }
          return frName;
        }
      }
      if (typeof pokemon.getName === "function") {
        try {
          const n = pokemon.getName();
          if (n && typeof n === "string" && n.trim()) {
            if (isFrench && sid && this.speciesNames[sid]) {
              let fr = this.getSpeciesName(sid, pokemon.formIndex, pokemon);
              if (isMega && !fr.toLowerCase().includes("m\xE9ga") && !fr.toLowerCase().includes("mega")) {
                fr = `M\xE9ga-${fr}`;
              }
              return fr;
            }
            return n.trim();
          }
        } catch (_) {
        }
      }
      if (pokemon.species && typeof pokemon.species.getName === "function") {
        try {
          const n = pokemon.species.getName(pokemon.formIndex);
          if (n && typeof n === "string" && n.trim()) {
            if (isFrench && sid && this.speciesNames[sid]) {
              let fr = this.getSpeciesName(sid, pokemon.formIndex, pokemon);
              if (isMega && !fr.toLowerCase().includes("m\xE9ga") && !fr.toLowerCase().includes("mega")) {
                fr = `M\xE9ga-${fr}`;
              }
              return fr;
            }
            return n.trim();
          }
        } catch (_) {
        }
      }
      if (sid && !isNaN(sid)) {
        let name = this.getSpeciesName(sid, pokemon.formIndex, pokemon);
        if (name) {
          if (isMega && !name.toLowerCase().includes("m\xE9ga") && !name.toLowerCase().includes("mega")) {
            name = `M\xE9ga-${name}`;
          }
          return name;
        }
      }
      if (pokemon.species?.name && typeof pokemon.species.name === "string") {
        return pokemon.species.name;
      }
      if (pokemon.name && typeof pokemon.name === "string") {
        return pokemon.name;
      }
      const fam = this.getFamilyInfo(pokemon);
      if (fam.lineageName) {
        return fam.lineageName.split(" / ")[0].trim();
      }
      return "Pok\xE9mon";
    },
    getCurrentFormName(pokemon) {
      return this.getPokemonDisplayName(pokemon);
    },
    getSinglePokemonName(target, extra = null) {
      if (!target && !extra) return "Pok\xE9mon";
      if (target && typeof target === "object" && (target.species || target.speciesId || target.moveset || typeof target.getName === "function")) {
        const name = this.getPokemonDisplayName(target);
        if (name && !name.includes(" / ")) return name;
      }
      const famKey = typeof target === "string" ? target : extra?.familyKey || (target?.familyKey ? target.familyKey : this.getFamilyKey(target));
      if (famKey && PokeSkip.activeParty && Array.isArray(PokeSkip.activeParty)) {
        const partyMember = PokeSkip.activeParty.find((p) => this.getFamilyKey(p) === famKey);
        if (partyMember) {
          const name = this.getPokemonDisplayName(partyMember);
          if (name && !name.includes(" / ")) return name;
        }
      }
      const rawName = extra?.lineageName || target?.lineageName || (typeof target === "string" && !target.startsWith("family_") ? target : "");
      if (rawName && typeof rawName === "string") {
        const single = rawName.split(" / ")[0].trim();
        if (single) return single;
      }
      const rootId = this.getRootId(target || extra);
      if (rootId) {
        const spName = this.getSpeciesName(rootId);
        if (spName) return spName;
      }
      return "Pok\xE9mon";
    },
    getMoveDetails(move, moveId, pokemon) {
      let moveObj = move && typeof move === "object" ? move : null;
      const mId = moveId || moveObj?.id || moveObj?.moveId;
      if ((!moveObj || moveObj.type === void 0 || moveObj.category === void 0) && mId) {
        let getMoveFn = null;
        if (pokemon?.moveset && pokemon.moveset.length > 0 && typeof pokemon.moveset[0].getMove === "function") {
          getMoveFn = pokemon.moveset[0].getMove;
        } else if (PokeSkip.activeParty && Array.isArray(PokeSkip.activeParty)) {
          for (const p of PokeSkip.activeParty) {
            if (p?.moveset && p.moveset.length > 0 && typeof p.moveset[0].getMove === "function") {
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
          } catch (_) {
          }
        }
      }
      const name = moveObj?.name || (move && typeof move === "string" ? move : null) || (mId ? PokeSkip.knownMovesCache[mId] : null) || `Capacit\xE9 #${mId || "?"}`;
      let typeIdx = 0;
      if (moveObj && moveObj.type !== void 0) {
        if (typeof moveObj.type === "number") {
          typeIdx = moveObj.type;
        } else if (typeof moveObj.type === "string") {
          const idx = POKEMON_TYPES.findIndex((t) => t.name.toLowerCase() === moveObj.type.toLowerCase() || t.code.toLowerCase() === moveObj.type.toLowerCase());
          if (idx !== -1) typeIdx = idx;
        } else if (typeof moveObj.type === "object" && moveObj.type.name) {
          const idx = POKEMON_TYPES.findIndex((t) => t.name.toLowerCase() === moveObj.type.name.toLowerCase());
          if (idx !== -1) typeIdx = idx;
        }
      }
      let catIdx = 2;
      if (moveObj && moveObj.category !== void 0) {
        if (typeof moveObj.category === "number") {
          catIdx = moveObj.category;
        } else if (typeof moveObj.category === "string") {
          const idx = MOVE_CATEGORIES.findIndex((c) => c.name.toLowerCase() === moveObj.category.toLowerCase());
          if (idx !== -1) catIdx = idx;
        } else if (typeof moveObj.category === "object" && moveObj.category.name) {
          const idx = MOVE_CATEGORIES.findIndex((c) => c.name.toLowerCase() === moveObj.category.name.toLowerCase());
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
      if (moveId === void 0 || moveId === null) return "";
      const numId = Number(moveId);
      if (PokeSkip.knownMovesCache && PokeSkip.knownMovesCache[numId]) {
        return PokeSkip.knownMovesCache[numId];
      }
      const details = this.getMoveDetails(null, numId, pokemon);
      if (details && details.name && !details.name.startsWith("Capacit\xE9 #")) {
        return details.name;
      }
      return PokeSkip.knownMovesCache?.[numId] || `Move #${numId}`;
    },
    findMoveIdByName(name) {
      if (!name) return null;
      const norm = (name || "").toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, "");
      if (PokeSkip.knownMovesCache) {
        for (const [idStr, mName] of Object.entries(PokeSkip.knownMovesCache)) {
          if (mName && mName.toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, "") === norm) {
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
        members = fam && Array.isArray(fam.members) && fam.members.length > 0 ? fam.members : rootId ? [rootId] : [];
      }
      let effectiveVariant = variant;
      if (pokemon && isShiny && effectiveVariant === 0) {
        if (typeof pokemon.variant === "number") effectiveVariant = pokemon.variant;
        else if (typeof pokemon.shinyTier === "number") effectiveVariant = Math.max(0, pokemon.shinyTier - 1);
      }
      const currentSpeciesId = pokemon ? pokemon.species?.speciesId ?? pokemon.speciesId ?? this.getRootId(pokemon) : null;
      const list = [];
      const seen = /* @__PURE__ */ new Set();
      for (let i = 0; i < members.length; i++) {
        const mId = members[i];
        if (seen.has(mId)) continue;
        seen.add(mId);
        const name = pokemon && mId === currentSpeciesId ? this.getPokemonDisplayName(pokemon) : this.getSpeciesName(mId) || `Esp\xE8ce #${mId}`;
        let url = "";
        if (pokemon && (mId === currentSpeciesId || !currentSpeciesId && mId === rootId)) {
          url = this.getPokemonSpriteUrl(pokemon);
        }
        if (!url) {
          const stored = AssetLoader.getStoredSprite(mId, isShiny, effectiveVariant);
          if (!stored) {
            AssetLoader.loadSpriteInBackground(mId, isShiny, effectiveVariant);
          }
          url = stored || (isShiny ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${mId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mId}.png`);
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
            let megaUrl = "";
            if (pokemon && this.isPokemonMega(pokemon) && (mId === currentSpeciesId || megaId === currentSpeciesId)) {
              megaUrl = this.getPokemonSpriteUrl(pokemon);
            }
            if (!megaUrl) {
              const storedMega = AssetLoader.getStoredSprite(megaId, isShiny, effectiveVariant);
              if (!storedMega) {
                AssetLoader.loadSpriteInBackground(megaId, isShiny, effectiveVariant);
              }
              megaUrl = storedMega || (isShiny ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${megaId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${megaId}.png`);
            }
            list.push({
              id: megaId,
              name: `${name} (M\xE9ga)`,
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
      if (!memberSprites || !memberSprites.length) return "";
      const rootId = memberSprites[0]?.id;
      const count = memberSprites.length;
      let sizeClass = isLarge ? "large" : "";
      if (count >= 7) {
        sizeClass = "extra-compact";
      } else if (count >= 5) {
        sizeClass = "compact";
      }
      return `
        <div class="pokeskip-evolution-chain ${sizeClass}">
          ${memberSprites.map((ms, idx) => {
        let connectorHtml = "";
        if (idx > 0) {
          const prev = memberSprites[idx - 1];
          if (ms.isMega && ms.parentId === prev.id) {
            connectorHtml = `
                  <div class="pokeskip-evo-arrow mega" title="Transformation M\xE9ga-\xC9volution de ${prev.name}">
                    <span class="pokeskip-evo-mega-pill">\u{1F9EC} M\xE9ga</span>
                    <span class="pokeskip-evo-arrow-char">\u2794</span>
                  </div>
                `;
          } else if (ms.parentId === prev.id && !ms.isMega) {
            connectorHtml = `
                  <div class="pokeskip-evo-arrow" title="\xC9volution de ${prev.name} en ${ms.name}">
                    <span class="pokeskip-evo-arrow-char">\u2794</span>
                  </div>
                `;
          } else {
            const parentObj = memberSprites.find((m) => m.id === ms.parentId);
            const parentName = parentObj ? parentObj.name.replace(/\s*\(Méga\)/, "") : this.getSpeciesName(ms.parentId) || "forme pr\xE9c\xE9dente";
            const isBranchFromRoot = ms.parentId === rootId;
            connectorHtml = `
                  <div class="pokeskip-evo-branch-divider" title="Branche alternative : ${ms.name} \xE9volue depuis ${parentName}">
                    <div class="pokeskip-evo-branch-badge">
                      <span class="pokeskip-evo-branch-icon">\u2442</span>
                      <span class="pokeskip-evo-branch-label">${isBranchFromRoot && memberSprites.length > 4 ? "ou" : "Branche"}</span>
                    </div>
                    <div class="pokeskip-evo-branch-origin" title="\xC9volution alternative issue de ${parentName}">
                      <span>depuis <b>${parentName}</b></span>
                      <span class="pokeskip-evo-branch-arrow">\u2794</span>
                    </div>
                  </div>
                `;
          }
        }
        return `
              ${connectorHtml}
              <div class="pokeskip-evo-node ${ms.id === activeSpeciesId ? "current-active" : ""}">
                <div class="pokeskip-evo-sprite-wrap" title="${ms.name}">
                  <img src="${ms.url}" alt="${ms.name}" class="pokeskip-evo-sprite"
                       data-pokeskip-species="${ms.id}" data-pokeskip-shiny="${!!ms.isShiny}" data-pokeskip-variant="${ms.variant || 0}"
                       onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                  <div style="display:none; font-size: 20px;">\u26A1</div>
                  ${ms.isMega ? '<span class="pokeskip-mini-mega-tag">M\xC9GA</span>' : ""}
                </div>
                <div class="pokeskip-evo-name" title="${ms.name}">${ms.name}</div>
              </div>
            `;
      }).join("")}
        </div>
      `;
    }
  };

  // src/ui/styles.css
  var styles_default = `#pokeskip-hud {
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
/* --- SCROLLBARS INT\xC9GR\xC9ES SOMBRES & \xC9L\xC9GANTES --- */
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

/* Slot vide pour les Pok\xE9mon non captur\xE9s */
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

/* --- SPRITES ET ANIMATION HOP SACCAD\xC9E --- */
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

/* --- BROCHETTE D'\xC9VOLUTIONS DE LA LIGN\xC9E --- */
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

/* S\xE9parateur de Branche Alternative */
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

/* Brochette pour l'onglet R\xE8gles & Esp\xE8ces */
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

/* Mode compact automatique pour les grandes lign\xE9es (5 \xE0 6 membres / formes comme Tarsal ou Verpom) */
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

/* Mode extra-compact pour les tr\xE8s grandes lign\xE9es (7+ membres comme \xC9voli avec 9 formes) */
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

/* --- BOUTON UNIQUE D'ACTIVATION / D\xC9SACTIVATION DU FILTRAGE --- */
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
  position: relative;
  width: 100%;
  box-sizing: border-box;
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

/* Zone d'action (Badge d'\xE9tat + Checkbox) TOUJOURS fix\xE9e dans le coin sup\xE9rieur droit */
.pokeskip-move-action {
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
  user-select: none;
}

.pokeskip-move-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-right: 285px;
  box-sizing: border-box;
  min-height: 28px;
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

.pokeskip-move-stats,
.pokeskip-move-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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
.pokeskip-egg-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  user-select: none;
  letter-spacing: 0.2px;
}
.pokeskip-silence-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 11px;
}
.pokeskip-silence-label.disabled {
  cursor: not-allowed;
  opacity: 0.8;
}
.pokeskip-silence-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.05);
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.15s;
}
.pokeskip-silence-badge.silenced {
  background: rgba(168, 85, 247, 0.18);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.45);
}
.pokeskip-silence-badge.auto {
  background: rgba(168, 85, 247, 0.25);
  color: #d8b4fe;
  border: 1px dashed rgba(168, 85, 247, 0.6);
}
.pokeskip-silence-checkbox {
  accent-color: #a855f7 !important;
  width: 17px !important;
  height: 17px !important;
  cursor: pointer;
}
.pokeskip-silence-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.pokeskip-keep-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
  z-index: 10000004;
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
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
  font-family: inherit;
  font-size: 13px;
}
.pokeskip-quick-text b,
.pokeskip-quick-text strong {
  color: #38bdf8;
  font-weight: 700;
}
.pokeskip-quick-btn {
  font-family: inherit;
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
.pokeskip-quick-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: none;
}
.pokeskip-quick-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.04);
  filter: none;
}
.pokeskip-quick-close {
  font-family: inherit;
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
  z-index: 10000005;
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
.pokeskip-toast.advanced,
.pokeskip-toast.purple {
  border-left-color: #a855f7;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 18px rgba(168, 85, 247, 0.3);
}
.pokeskip-toast.advanced b,
.pokeskip-toast.advanced strong,
.pokeskip-toast.purple b,
.pokeskip-toast.purple strong {
  color: #d8b4fe;
}
.pokeskip-toast-action-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.pokeskip-toast-btn-action {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 2px 10px rgba(168, 85, 247, 0.45);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.pokeskip-toast-btn-action:hover {
  background: linear-gradient(135deg, #c084fc 0%, #9333ea 100%);
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 14px rgba(168, 85, 247, 0.65);
}
.pokeskip-toast-btn-close {
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 5px 9px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  line-height: 1;
  transition: all 0.15s ease;
}
.pokeskip-toast-btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #f8fafc;
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

/* --- TABLEAU DES TYPES 18x18 & VUE SYNTH\xC9TIQUE --- */
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

/* Super efficace (\xD72) : Vert \xE9clatant */
.pokeskip-td-cell.super {
  background: linear-gradient(180deg, #10b981 0%, #047857 100%);
  color: #ffffff !important;
  font-weight: 900;
  border: 1px solid rgba(0, 0, 0, 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
}

/* Peu efficace (\xD70.5) : Rouge carmin */
.pokeskip-td-cell.half {
  background: linear-gradient(180deg, #f43f5e 0%, #be123c 100%);
  color: #ffffff !important;
  font-weight: 900;
  border: 1px solid rgba(0, 0, 0, 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 1px 2px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
}

/* Inefficace (\xD70) : Noir ardoise */
.pokeskip-td-cell.zero {
  background: #060913;
  color: #94a3b8 !important;
  font-weight: 900;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.9);
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.35);
}

/* Neutre (\xD71) */
.pokeskip-td-cell.neutral {
  color: #475569;
  font-size: 11px;
  border: 1px solid transparent;
}

/* Z\xE9brure subtile */
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

/* --- MODE SIMPLIFI\xC9 --- */
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

/* Toggle switch des immunit\xE9s */
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

/* --- PASTILLES DE TYPE OFFICIELLES (STYLE POK\xC9ROGUE) --- */
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

/* Suppression de tout contour blanc / bordure de focus sur le canvas de jeu */
canvas:focus,
#app canvas:focus,
canvas:focus-visible,
#app canvas:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}`;

  // src/game/phaser-hook.js
  function findPhaserScene() {
    const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    try {
      if (win.globalScene && win.globalScene.phaseManager) {
        return { game: win.globalScene.game, scene: win.globalScene };
      }
      if (win.Phaser) {
        if (win.Phaser.Display?.Canvas?.CanvasPool?.pool?.[0]?.parent?.game) {
          const g = win.Phaser.Display.Canvas.CanvasPool.pool[0].parent.game;
          const sc = g.scene?.getScene("battle") || g.scene?.scenes?.find((s) => s.scene?.key === "battle" || s.phaseManager);
          if (sc && sc.phaseManager) return { game: g, scene: sc };
        }
        if (win.Phaser.GAMES && win.Phaser.GAMES.length > 0) {
          for (const g of win.Phaser.GAMES) {
            if (!g || !g.scene) continue;
            const sc = g.scene.getScene("battle") || g.scene.scenes?.find((s) => s.scene?.key === "battle" || s.phaseManager);
            if (sc && sc.phaseManager) return { game: g, scene: sc };
          }
        }
      }
      const canvas = document.querySelector("#app canvas") || document.querySelector("canvas");
      if (canvas) {
        const g = canvas.__game || canvas.game;
        if (g && g.scene) {
          const sc = g.scene.getScene("battle") || g.scene.scenes?.find((s) => s.scene?.key === "battle" || s.phaseManager);
          if (sc && sc.phaseManager) return { game: g, scene: sc };
        }
      }
    } catch (e) {
      console.warn("[PokeSkip] Erreur recherche scene:", e);
    }
    return null;
  }
  function initGameHook() {
    let hookAttempts = 0;
    const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes((window.location.hostname || "").toLowerCase());
    const maxHookAttempts = isLocal ? 60 : Infinity;
    function checkAndHook() {
      if (PokeSkip.hooked) return;
      hookAttempts++;
      const found = findPhaserScene();
      if (!found) {
        if (hookAttempts < maxHookAttempts) {
          setTimeout(checkAndHook, 800);
        }
        return;
      }
      PokeSkip.game = found.game;
      PokeSkip.scene = found.scene;
      PokeSkip.migrateRules();
      applyPhaseManagerHooks(found.scene);
      PokeSkip.hooked = true;
      console.log("\u{1F389} [Pok\xE9Skip] Connect\xE9 avec succ\xE8s \xE0 Pok\xE9Rogue !");
      UI.showToast("Pok\xE9Skip activ\xE9 et pr\xEAt !", "success", 2e3);
      UI.updateHudBadge();
    }
    checkAndHook();
    setInterval(() => {
      const found = findPhaserScene();
      if (found && found.scene && found.scene !== PokeSkip.scene) {
        PokeSkip.game = found.game;
        PokeSkip.scene = found.scene;
        applyPhaseManagerHooks(found.scene);
      }
    }, 2e3);
  }
  function applyPhaseManagerHooks(scene) {
    const pm = scene.phaseManager;
    if (!pm) return;
    function inspectPhase(phase) {
      if (!phase) return;
      if (phase.phaseName === "LearnMovePhase" || phase.is?.("LearnMovePhase") || phase.constructor?.name === "LearnMovePhase") {
        hookLearnMovePhasePrototype(Object.getPrototypeOf(phase));
      }
    }
    if (pm.unshiftPhase && !pm._pokeskipHookedUnshift) {
      const origUnshift = pm.unshiftPhase.bind(pm);
      pm.unshiftPhase = function(...phases) {
        for (const p of phases) inspectPhase(p);
        return origUnshift(...phases);
      };
      pm._pokeskipHookedUnshift = true;
    }
    if (pm.pushPhase && !pm._pokeskipHookedPush) {
      const origPush = pm.pushPhase.bind(pm);
      pm.pushPhase = function(...phases) {
        for (const p of phases) inspectPhase(p);
        return origPush(...phases);
      };
      pm._pokeskipHookedPush = true;
    }
    if (pm.shiftPhase && !pm._pokeskipHookedShift) {
      const origShift = pm.shiftPhase.bind(pm);
      pm.shiftPhase = function() {
        const res = origShift();
        const curr = pm.getCurrentPhase ? pm.getCurrentPhase() : pm.currentPhase;
        if (curr) inspectPhase(curr);
        return res;
      };
      pm._pokeskipHookedShift = true;
    }
    const currentPhase = pm.getCurrentPhase ? pm.getCurrentPhase() : pm.currentPhase || pm.phase;
    if (currentPhase) inspectPhase(currentPhase);
    if (Array.isArray(pm.phaseQueue)) {
      for (const p of pm.phaseQueue) inspectPhase(p);
    }
  }
  function snapshotMoveset(pokemon) {
    if (!pokemon) return [];
    const currentMoveset = typeof pokemon.getMoveset === "function" ? pokemon.getMoveset() : pokemon.moveset || [];
    return currentMoveset.map((m, idx) => {
      if (!m) return null;
      const mId = m.moveId ?? m.id ?? (typeof m === "number" ? m : null);
      let name = "";
      if (typeof m.getName === "function") {
        try {
          name = m.getName();
        } catch (_) {
        }
      }
      if (!name && m.name) name = m.name;
      if (!name && typeof m.getMove === "function") {
        try {
          const mv = m.getMove();
          if (mv?.name) name = mv.name;
        } catch (_) {
        }
      }
      if (!name && mId) {
        if (PokeSkip.knownMovesCache[mId]) name = PokeSkip.knownMovesCache[mId];
        const lmName = LineageManager.getMoveName(mId, pokemon);
        if (lmName) name = lmName;
      }
      return {
        slot: idx,
        id: mId ? Number(mId) : null,
        name: name || (mId ? `Move #${mId}` : "")
      };
    });
  }
  function checkManualMoveReplacement(phase) {
    if (!PokeSkip.settings.enabled || !PokeSkip.settings.advancedMode || PokeSkip.settings.promptAutoReplacement === false) return;
    if (phase._pokeskipAutoReplaced) return;
    if (phase._pokeskipIgnored) return;
    const pokemon = phase._pokeskipPokemon;
    const initialMoveset = phase._pokeskipInitialMoveset;
    const incoming = phase._pokeskipIncomingMove;
    if (!pokemon || !Array.isArray(initialMoveset) || initialMoveset.length < 4 || !incoming || !incoming.name) {
      return;
    }
    setTimeout(() => {
      try {
        const postMoveset = snapshotMoveset(pokemon);
        if (!postMoveset || postMoveset.length === 0) return;
        const normalize = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, "");
        const incNorm = normalize(incoming.name);
        const incId = incoming.id ? Number(incoming.id) : null;
        const learnedIncomingIndex = postMoveset.findIndex((m) => {
          if (!m) return false;
          if (incId && m.id && Number(m.id) === incId) return true;
          if (incNorm && normalize(m.name) === incNorm) return true;
          return false;
        });
        if (learnedIncomingIndex === -1) return;
        let replacedMove = null;
        const chosenSlot = phase._pokeskipChosenSlotIndex;
        if (chosenSlot !== void 0 && chosenSlot !== null && initialMoveset[chosenSlot]) {
          replacedMove = initialMoveset[chosenSlot];
        } else if (initialMoveset[learnedIncomingIndex]) {
          replacedMove = initialMoveset[learnedIncomingIndex];
        } else {
          replacedMove = initialMoveset.find((oldM) => {
            if (!oldM) return false;
            const oldNorm = normalize(oldM.name);
            const oldId = oldM.id ? Number(oldM.id) : null;
            const stillPresent = postMoveset.some((newM) => {
              if (!newM) return false;
              if (oldId && newM.id && Number(newM.id) === oldId) return true;
              if (oldNorm && normalize(newM.name) === oldNorm) return true;
              return false;
            });
            return !stillPresent;
          });
        }
        if (!replacedMove || !replacedMove.name) return;
        if (normalize(replacedMove.name) === incNorm) return;
        const existingRules = PokeSkip.getFamilyReplacements(pokemon);
        const repOldNorm = normalize(replacedMove.name);
        const repOldId = replacedMove.id ? Number(replacedMove.id) : null;
        const ruleExists = existingRules.some((r) => {
          if (!r) return false;
          const rNewNorm = normalize(r.newMoveName);
          const rOldNorm = normalize(r.oldMoveName);
          const rNewId = r.newMoveId ? Number(r.newMoveId) : null;
          const rOldId = r.oldMoveId ? Number(r.oldMoveId) : null;
          const newMatches = incId && rNewId && rNewId === incId || incNorm && rNewNorm === incNorm;
          const oldMatches = repOldId && rOldId && rOldId === repOldId || repOldNorm && rOldNorm === repOldNorm;
          return newMatches && oldMatches;
        });
        if (ruleExists) {
          return;
        }
        const currentPokemonName = LineageManager.getCurrentFormName(pokemon);
        const message = `\u{1F504} Toujours remplacer <b>${replacedMove.name}</b> par <b>${incoming.name}</b> sur <b>${currentPokemonName}</b> ?`;
        console.log(`\u{1F4A1} [Pok\xE9Skip] Remplacement manuel d\xE9tect\xE9 : "${replacedMove.name}" -> "${incoming.name}" sur ${currentPokemonName}. Proposition d'enregistrement.`);
        UI.showActionToast(
          message,
          "Enregistrer",
          () => {
            PokeSkip.addReplacementRule(
              pokemon,
              incoming.name,
              replacedMove.name,
              incoming.id,
              replacedMove.id
            );
            UI.showToast(
              `\u2705 R\xE8gle enregistr\xE9e : <b>${replacedMove.name}</b> \u279C <b>${incoming.name}</b> sur <b>${currentPokemonName}</b> !`,
              "success",
              3500
            );
            UI.updateHudBadge();
            if (UI.isModalOpen()) {
              const teamBody = document.getElementById("pokeskip-body-team");
              if (teamBody && teamBody.style.display !== "none" && typeof UI.renderTeamTab === "function") {
                UI.renderTeamTab();
              }
              const savedBody = document.getElementById("pokeskip-body-saved");
              if (savedBody && savedBody.style.display !== "none" && typeof UI.renderSavedSpeciesList === "function") {
                UI.renderSavedSpeciesList();
              }
            }
          },
          1e4,
          "advanced"
        );
      } catch (err) {
        console.error("[Pok\xE9Skip] Erreur lors de la d\xE9tection du remplacement manuel :", err);
      }
    }, 120);
  }
  function hookLearnMovePhasePrototype(proto) {
    if (!proto || proto._pokeskipHooked) return;
    proto._pokeskipHooked = true;
    if (typeof proto.learnMove === "function" && !proto._pokeskipHookedLearnMove) {
      const origLearnMove = proto.learnMove;
      proto.learnMove = function(slotIndex, ...args) {
        this._pokeskipChosenSlotIndex = slotIndex;
        return origLearnMove.apply(this, arguments);
      };
      proto._pokeskipHookedLearnMove = true;
    }
    const origEnd = proto.end;
    if (typeof origEnd === "function") {
      proto.end = function() {
        UI.dismissQuickSkipPrompt();
        if (this._pokeskipEnded) return origEnd.apply(this, arguments);
        this._pokeskipEnded = true;
        if (typeof this._restoreUi === "function") {
          this._restoreUi();
        }
        checkManualMoveReplacement(this);
        return origEnd.apply(this, arguments);
      };
    }
    const origReplaceMoveCheck = proto.replaceMoveCheck;
    if (!origReplaceMoveCheck) return;
    proto.replaceMoveCheck = async function(moveArg, pokemonArg) {
      const phase = this;
      const pokemon = pokemonArg || (typeof phase.getPokemon === "function" ? phase.getPokemon() : phase.pokemon) || (arguments[0]?.species ? arguments[0] : null);
      const move = moveArg && (moveArg.name || moveArg.id !== void 0) ? moveArg : phase.move || arguments[0];
      const moveId = phase.moveId ?? move?.id ?? move?.moveId ?? (typeof moveArg === "number" ? moveArg : void 0);
      if (move && move.id && move.name) {
        PokeSkip.knownMovesCache[move.id] = move.name;
      }
      const moveName = move?.name || (moveId !== void 0 ? LineageManager.getMoveName(moveId, pokemon) : `Move #${moveId || "?"}`);
      phase._pokeskipPokemon = pokemon;
      phase._pokeskipIncomingMove = { id: moveId, name: moveName };
      phase._pokeskipInitialMoveset = snapshotMoveset(pokemon);
      if (typeof phase.learnMove === "function" && !phase._pokeskipHookedInstanceLearnMove) {
        const origInstLearnMove = phase.learnMove;
        phase.learnMove = function(slotIndex, ...args) {
          phase._pokeskipChosenSlotIndex = slotIndex;
          return origInstLearnMove.apply(this, arguments);
        };
        phase._pokeskipHookedInstanceLearnMove = true;
      }
      const isLevelUpMove = phase.learnMoveType === 0 || phase.learnMoveType === void 0;
      if (PokeSkip.settings.enabled && isLevelUpMove && pokemon) {
        const familyInfo = LineageManager.getFamilyInfo(pokemon);
        const replacement = PokeSkip.findActiveReplacement(pokemon, moveName, moveId);
        if (replacement) {
          const currentMoveset = typeof pokemon.getMoveset === "function" ? pokemon.getMoveset() : pokemon.moveset || [];
          const normalize = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, "");
          const oldNorm = normalize(replacement.oldMoveName);
          const oldId = replacement.oldMoveId ? Number(replacement.oldMoveId) : null;
          const targetMoveIndex = currentMoveset.findIndex((m) => {
            if (!m) return false;
            const mId = m.moveId ?? m.id ?? (typeof m === "number" ? m : null);
            if (oldId && mId && Number(mId) === oldId) return true;
            const names = [];
            if (typeof m.getName === "function") {
              try {
                names.push(m.getName());
              } catch (_) {
              }
            }
            if (m.name) names.push(m.name);
            if (typeof m.getMove === "function") {
              try {
                const mv = m.getMove();
                if (mv?.name) names.push(mv.name);
              } catch (_) {
              }
            }
            if (mId) {
              if (PokeSkip.knownMovesCache[mId]) names.push(PokeSkip.knownMovesCache[mId]);
              const lmName = LineageManager.getMoveName(mId, pokemon);
              if (lmName) names.push(lmName);
            }
            for (const n of names) {
              if (n && normalize(n) === oldNorm) return true;
            }
            return false;
          });
          if (targetMoveIndex !== -1) {
            phase._pokeskipAutoReplaced = true;
            console.log(`\u{1F504} [Pok\xE9Skip] Remplacement auto : "${replacement.oldMoveName}" -> "${moveName}" sur ${familyInfo.lineageName} (slot ${targetMoveIndex})`);
            if (typeof UI.dismissQuickSkipPrompt === "function") {
              UI.dismissQuickSkipPrompt();
            }
            PokeSkip.recordSkip();
            if (PokeSkip.settings.showToasts) {
              const currentPokemonName = LineageManager.getCurrentFormName(pokemon);
              UI.showToast(`\u{1F504} <b>${moveName}</b> a automatiquement remplac\xE9 <b>${replacement.oldMoveName}</b> sur <b>${currentPokemonName}</b> !`, "info", PokeSkip.settings.toastDuration || 3e3);
            }
            UI.updateHudBadge();
            const effectiveMove = move || { id: moveId, name: moveName };
            if (phase.moveId === void 0 && moveId !== void 0) {
              phase.moveId = moveId;
            }
            try {
              if (typeof phase.learnMove === "function") {
                phase.learnMove(targetMoveIndex, effectiveMove, pokemon);
                return;
              } else if (typeof pokemon.setMove === "function") {
                pokemon.setMove(targetMoveIndex, moveId);
                phase.end();
                return;
              } else if (typeof pokemon.learnMove === "function") {
                pokemon.learnMove(moveId, targetMoveIndex);
                phase.end();
                return;
              } else {
                phase.end();
                return;
              }
            } catch (err) {
              console.error("[Pok\xE9Skip] Erreur lors de l'ex\xE9cution du remplacement auto :", err);
              try {
                if (typeof pokemon.setMove === "function") {
                  pokemon.setMove(targetMoveIndex, moveId);
                }
                phase.end();
              } catch (fallbackErr) {
                console.error("[Pok\xE9Skip] Erreur fallback critique :", fallbackErr);
              }
              return;
            }
          } else {
            console.warn(`[Pok\xE9Skip] Remplacement configur\xE9 ("${replacement.oldMoveName}" -> "${moveName}") mais l'ancienne capacit\xE9 n'est pas dans le moveset actuel :`, currentMoveset);
          }
        }
        if (PokeSkip.isMoveSkipped(pokemon, moveName, moveId)) {
          phase._pokeskipIgnored = true;
          console.log(`\u{1F6E1}\uFE0F [Pok\xE9Skip] Auto-Skip activ\xE9 pour "${moveName}" sur ${familyInfo.lineageName} !`);
          PokeSkip.recordSkip();
          if (PokeSkip.settings.showToasts) {
            const currentPokemonName = LineageManager.getCurrentFormName(pokemon);
            UI.showToast(`\u{1F6E1}\uFE0F Capacit\xE9 <b>${moveName}</b> ignor\xE9e pour <b>${currentPokemonName}</b> !`, "info", PokeSkip.settings.toastDuration);
          }
          UI.updateHudBadge();
          phase.end();
          return;
        }
        if (PokeSkip.settings.showQuickPrompt !== false) {
          UI.showQuickSkipPrompt(phase, pokemon, move);
        }
      }
      if (phase._pokeskipIgnored) {
        UI.dismissQuickSkipPrompt();
        phase.end();
        return;
      }
      const scene = phase.scene || PokeSkip.scene || window.globalScene;
      const ui = scene?.ui;
      if (ui && typeof ui.showTextPromise === "function") {
        const origShowTextPromise = ui.showTextPromise;
        const origSetModeWithoutClear = ui.setModeWithoutClear;
        ui.showTextPromise = async function(text, callbackDelay, prompt2, promptDelay) {
          if (phase._pokeskipIgnored) {
            return;
          }
          return origShowTextPromise.call(this, text, callbackDelay, prompt2, promptDelay);
        };
        if (typeof origSetModeWithoutClear === "function") {
          ui.setModeWithoutClear = function(mode, ...args) {
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
    console.log("\u26A1 [Pok\xE9Skip] Prototype LearnMovePhase intercept\xE9 avec succ\xE8s.");
  }

  // src/game/input-blocker.js
  function disableGameKeyboard() {
    try {
      const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      const found = typeof findPhaserScene === "function" ? findPhaserScene() : null;
      const sc = found?.scene || PokeSkip.scene || win.globalScene;
      const game = found?.game || sc?.game;
      if (game?.scene?.scenes && Array.isArray(game.scene.scenes)) {
        game.scene.scenes.forEach((s) => {
          if (s?.input?.keyboard) {
            s.input.keyboard.enabled = false;
            if (typeof s.input.keyboard.resetKeys === "function") {
              s.input.keyboard.resetKeys();
            }
          }
        });
      }
      if (sc?.input?.keyboard) {
        sc.input.keyboard.enabled = false;
        if (typeof sc.input.keyboard.resetKeys === "function") {
          sc.input.keyboard.resetKeys();
        }
      }
      if (game?.input?.keyboard) {
        game.input.keyboard.enabled = false;
        if (typeof game.input.keyboard.resetKeys === "function") {
          game.input.keyboard.resetKeys();
        }
      }
    } catch (err) {
      console.warn("[Pok\xE9Skip] Erreur d\xE9sactivation clavier Phaser:", err);
    }
  }
  function enableGameKeyboard() {
    try {
      const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
      const found = typeof findPhaserScene === "function" ? findPhaserScene() : null;
      const sc = found?.scene || PokeSkip.scene || win.globalScene;
      const game = found?.game || sc?.game;
      if (game?.scene?.scenes && Array.isArray(game.scene.scenes)) {
        game.scene.scenes.forEach((s) => {
          if (s?.input?.keyboard) {
            s.input.keyboard.enabled = true;
            if (typeof s.input.keyboard.resetKeys === "function") {
              s.input.keyboard.resetKeys();
            }
          }
        });
      }
      if (sc?.input?.keyboard) {
        sc.input.keyboard.enabled = true;
        if (typeof sc.input.keyboard.resetKeys === "function") {
          sc.input.keyboard.resetKeys();
        }
      }
      if (game?.input?.keyboard) {
        game.input.keyboard.enabled = true;
        if (typeof game.input.keyboard.resetKeys === "function") {
          game.input.keyboard.resetKeys();
        }
      }
      const canvas = document.querySelector("#app canvas") || document.querySelector("canvas");
      if (canvas) {
        canvas.style.outline = "none";
        canvas.style.boxShadow = "none";
        const activeEl = document.activeElement;
        const isExternalInput = activeEl && activeEl !== canvas && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT");
        if (!isExternalInput) {
          if (!canvas.hasAttribute("tabindex")) {
            canvas.setAttribute("tabindex", "0");
          }
          try {
            canvas.focus({ preventScroll: true });
          } catch (_) {
          }
        }
      }
    } catch (err) {
      console.warn("[Pok\xE9Skip] Erreur r\xE9activation clavier Phaser:", err);
    }
  }
  function isolateInputs(container) {
    if (!container) return;
    const elements = container.querySelectorAll("input, select, textarea");
    elements.forEach((el) => {
      if (el._pksIsolated) return;
      el._pksIsolated = true;
      ["keydown", "keyup", "keypress"].forEach((type) => {
        el.addEventListener(type, (e) => {
          e.stopPropagation();
        });
      });
    });
  }

  // src/ui/toast.js
  var Toast = {
    createToastContainer() {
      if (!document.body) return null;
      let el = document.getElementById("pokeskip-toasts");
      if (!el) {
        el = document.createElement("div");
        el.id = "pokeskip-toasts";
        document.body.appendChild(el);
      }
      this.toastContainer = el;
      return el;
    },
    showToast(message, type = "info", duration = PokeSkip.settings?.toastDuration || 2800) {
      if (!document.body) {
        document.addEventListener("DOMContentLoaded", () => this.showToast(message, type, duration), { once: true });
        return;
      }
      const container = this.createToastContainer() || document.getElementById("pokeskip-toasts");
      if (!container) return;
      let cleanMsg = typeof message === "string" ? message.replace(/\[PokéSkip\]\s*/gi, "") : message;
      if (typeof cleanMsg === "string" && cleanMsg.includes(" / ")) {
        cleanMsg = cleanMsg.replace(/<b>([^<]*?\s*\/\s*[^<]*?)<\/b>/g, (match, p1) => {
          const first = p1.split(/\s*\/\s*/)[0].trim();
          return `<b>${first}</b>`;
        });
      }
      const toast = document.createElement("div");
      toast.className = `pokeskip-toast ${type}`;
      toast.innerHTML = cleanMsg;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => {
          if (toast && toast.parentNode) toast.remove();
        }, 250);
      }, duration);
    },
    showActionToast(message, actionLabel, onAction, duration = 1e4, type = "advanced") {
      if (!document.body) {
        document.addEventListener("DOMContentLoaded", () => this.showActionToast(message, actionLabel, onAction, duration, type), { once: true });
        return;
      }
      const container = this.createToastContainer() || document.getElementById("pokeskip-toasts");
      if (!container) return;
      let cleanMsg = typeof message === "string" ? message.replace(/\[PokéSkip\]\s*/gi, "") : message;
      if (typeof cleanMsg === "string" && cleanMsg.includes(" / ")) {
        cleanMsg = cleanMsg.replace(/<b>([^<]*?\s*\/\s*[^<]*?)<\/b>/g, (match, p1) => {
          const first = p1.split(/\s*\/\s*/)[0].trim();
          return `<b>${first}</b>`;
        });
      }
      const toast = document.createElement("div");
      toast.className = `pokeskip-toast ${type}`;
      const contentWrap = document.createElement("div");
      contentWrap.className = "pokeskip-toast-action-container";
      const textSpan = document.createElement("span");
      textSpan.innerHTML = cleanMsg;
      contentWrap.appendChild(textSpan);
      const actionBtn = document.createElement("button");
      actionBtn.type = "button";
      actionBtn.className = "pokeskip-toast-btn-action";
      actionBtn.innerHTML = actionLabel || "Enregistrer";
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "pokeskip-toast-btn-close";
      closeBtn.innerHTML = "\u2715";
      closeBtn.title = "Fermer";
      contentWrap.appendChild(actionBtn);
      contentWrap.appendChild(closeBtn);
      toast.appendChild(contentWrap);
      container.appendChild(toast);
      let hideTimeout = null;
      const dismiss = () => {
        if (hideTimeout) clearTimeout(hideTimeout);
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => {
          if (toast && toast.parentNode) toast.remove();
        }, 250);
      };
      const startTimer = () => {
        if (duration > 0) {
          hideTimeout = setTimeout(dismiss, duration);
        }
      };
      startTimer();
      toast.addEventListener("mouseenter", () => {
        if (hideTimeout) clearTimeout(hideTimeout);
      });
      toast.addEventListener("mouseleave", () => {
        startTimer();
      });
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dismiss();
        if (typeof onAction === "function") {
          try {
            onAction();
          } catch (err) {
            console.error("[Pok\xE9Skip] Erreur callback action toast :", err);
          }
        }
      });
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dismiss();
      });
    }
  };

  // src/ui/hud.js
  var Hud = {
    getPokeballSvg(size = 20, enabled = true) {
      const isEnabled = enabled !== false;
      const centerFill = isEnabled ? "#34d399" : "#475569";
      return `
        <svg class="pokeskip-hud-ball ${isEnabled ? "on" : "off"}" viewBox="0 0 100 100" width="${size}" height="${size}" style="display:block; flex-shrink:0;">
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
      if (document.getElementById("pokeskip-hud")) return;
      const hud = document.createElement("div");
      hud.id = "pokeskip-hud";
      const enabled = PokeSkip.settings.enabled;
      hud.className = enabled ? "on" : "off";
      hud.title = `Pok\xE9Skip (${enabled ? "Actif - ON" : "En pause - OFF"}) \u2022 Raccourci P \u2022 Glisser pour d\xE9placer`;
      const runCount = PokeSkip.getRunSkippedCount();
      const showCount = PokeSkip.settings.showHudCount !== false;
      hud.innerHTML = `
        <div class="pokeskip-hud-pill" title="Pok\xE9Skip (${enabled ? "Actif - ON" : "En pause - OFF"}) \u2022 Clic pour g\xE9rer les capacit\xE9s \u2022 Raccourci P">
          <div class="pokeskip-hud-ball-wrap" title="${enabled ? "Pok\xE9Skip : ACTIF (ON)" : "Pok\xE9Skip : EN PAUSE (OFF)"}">
            ${this.getPokeballSvg(20, enabled)}
          </div>
          <span class="pokeskip-hud-badge" id="pokeskip-hud-count" style="display: ${showCount ? "inline-block" : "none"};">${runCount} pass\xE9e${runCount > 1 ? "s" : ""}</span>
        </div>
        <button id="pokeskip-hud-type-btn" title="Tableau des Types (Touche T)">\u2694\uFE0F</button>
      `;
      this.makeHudDraggable(hud);
      const typeBtn = hud.querySelector("#pokeskip-hud-type-btn");
      if (typeBtn) {
        typeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleTypeChart(false);
        });
      }
      document.body.appendChild(hud);
      this.hudContainer = hud;
    },
    applyHudPosition(hud) {
      if (!hud) return;
      const savedPos = PokeStorage.get("pokeskip_hud_pos", null);
      if (!savedPos) return;
      const hudW = hud.offsetWidth || 120;
      const hudH = hud.offsetHeight || 40;
      const maxLeft = Math.max(10, window.innerWidth - hudW - 10);
      const maxTop = Math.max(10, window.innerHeight - hudH - 10);
      let targetLeft, targetTop;
      if (typeof savedPos.ratioX === "number" && typeof savedPos.ratioY === "number") {
        const rX = Math.max(0, Math.min(1, savedPos.ratioX));
        const rY = Math.max(0, Math.min(1, savedPos.ratioY));
        targetLeft = 10 + rX * (maxLeft - 10);
        targetTop = 10 + rY * (maxTop - 10);
      } else if (typeof savedPos.x === "number" && typeof savedPos.y === "number") {
        targetLeft = Math.max(10, Math.min(maxLeft, savedPos.x));
        targetTop = Math.max(10, Math.min(maxTop, savedPos.y));
        const rX = maxLeft > 10 ? (targetLeft - 10) / (maxLeft - 10) : 1;
        const rY = maxTop > 10 ? (targetTop - 10) / (maxTop - 10) : 0.5;
        PokeStorage.set("pokeskip_hud_pos", {
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
      hud.style.right = "auto";
      hud.style.transform = "none";
    },
    makeHudDraggable(hud) {
      this.applyHudPosition(hud);
      let isDragging = false;
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;
      let hasMoved = false;
      hud.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        if (e.target && e.target.closest("#pokeskip-hud-type-btn")) return;
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = hud.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        hud.classList.add("dragging");
        e.preventDefault();
      });
      window.addEventListener("mousemove", (e) => {
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
        hud.style.right = "auto";
        hud.style.transform = "none";
      });
      window.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        hud.classList.remove("dragging");
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
          PokeStorage.set("pokeskip_hud_pos", {
            ratioX: Math.max(0, Math.min(1, ratioX)),
            ratioY: Math.max(0, Math.min(1, ratioY)),
            x: clampedLeft,
            y: clampedTop
          });
          hud.style.left = `${Math.round(clampedLeft)}px`;
          hud.style.top = `${Math.round(clampedTop)}px`;
          hud.style.right = "auto";
          hud.style.transform = "none";
        }
      });
      hud.addEventListener("click", (e) => {
        if (hasMoved) {
          e.stopPropagation();
          hasMoved = false;
          return;
        }
        if (e.target && e.target.closest("#pokeskip-hud-type-btn")) {
          return;
        }
        if (e.target && e.target.closest(".pokeskip-hud-pill")) {
          this.toggleModal();
        }
      });
    },
    updateHudBadge() {
      const hud = document.getElementById("pokeskip-hud");
      const pill = hud?.querySelector(".pokeskip-hud-pill");
      const ball = hud?.querySelector(".pokeskip-hud-ball");
      const ballWrap = hud?.querySelector(".pokeskip-hud-ball-wrap");
      const countEl = document.getElementById("pokeskip-hud-count");
      const dividerEl = document.getElementById("pokeskip-hud-divider");
      const statusEl = document.querySelector(".pokeskip-hud-status");
      const enabled = PokeSkip.settings.enabled;
      const showCount = PokeSkip.settings.showHudCount !== false;
      const runCount = PokeSkip.getRunSkippedCount();
      if (hud) {
        hud.classList.toggle("on", !!enabled);
        hud.classList.toggle("off", !enabled);
        hud.title = `Pok\xE9Skip (${enabled ? "Actif - ON" : "En pause - OFF"}) \u2022 Raccourci P \u2022 Glisser pour d\xE9placer`;
      }
      if (pill) {
        pill.title = `Pok\xE9Skip (${enabled ? "Actif - ON" : "En pause - OFF"}) \u2022 Clic pour g\xE9rer les capacit\xE9s \u2022 Raccourci P`;
      }
      if (ballWrap) {
        ballWrap.title = enabled ? "Pok\xE9Skip : ACTIF (ON)" : "Pok\xE9Skip : EN PAUSE (OFF)";
      }
      if (ball) {
        ball.classList.toggle("on", !!enabled);
        ball.classList.toggle("off", !enabled);
        const centerDot = ball.querySelector(".pks-ball-center-dot");
        if (centerDot) {
          centerDot.setAttribute("fill", enabled ? "#34d399" : "#475569");
        }
      }
      if (countEl) {
        countEl.textContent = `${runCount} pass\xE9e${runCount > 1 ? "s" : ""}`;
        countEl.style.display = showCount ? "inline-block" : "none";
      }
      if (dividerEl) {
        dividerEl.style.display = "none";
      }
      if (statusEl) {
        statusEl.className = `pokeskip-hud-status ${enabled ? "on" : "off"}`;
        statusEl.textContent = enabled ? "\u25CF ON" : "\u25CB OFF";
      }
    }
  };

  // src/ui/tabs/settings-tab.js
  var SettingsTab = {
    getSettingsTabHtml() {
      return `
      <div style="max-width: 500px; display: flex; flex-direction: column; gap: 16px;">
        <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0 0 2px 0; font-size: 14px; color: #38bdf8;">Notifications & Alertes</h4>
          
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
            <input type="checkbox" id="pokeskip-opt-toasts" ${PokeSkip.settings.showToasts ? "checked" : ""} style="accent-color: #38bdf8;">
            Afficher les notifications toast lors d'un auto-skip
          </label>

          <div id="pokeskip-opt-toast-duration-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8; padding-left: 24px; opacity: ${PokeSkip.settings.showToasts ? "1" : "0.4"};">
            <span>Dur\xE9e d'affichage des notifications :</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="number" id="pokeskip-opt-toast-duration" min="1" max="15" step="0.5" value="${(PokeSkip.settings.toastDuration || 2800) / 1e3}" ${!PokeSkip.settings.showToasts ? "disabled" : ""} style="width: 50px; background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f8fafc; padding: 4px 6px; text-align: center; font-size: 12px;">
              <span>secondes</span>
            </div>
          </div>

          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
            <input type="checkbox" id="pokeskip-opt-hud-count" ${PokeSkip.settings.showHudCount !== false ? "checked" : ""} style="accent-color: #38bdf8;">
            Afficher le compteur de capacit\xE9s pass\xE9es sur la pastille
          </label>

          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; display: flex; flex-direction: column; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
              <input type="checkbox" id="pokeskip-opt-quick-prompt" ${PokeSkip.settings.showQuickPrompt !== false ? "checked" : ""} style="accent-color: #38bdf8;">
              Proposer d'ignorer pour toujours une nouvelle attaque en combat
            </label>
            
            <div id="pokeskip-opt-duration-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8; padding-left: 24px; opacity: ${PokeSkip.settings.showQuickPrompt !== false ? "1" : "0.4"};">
              <span>Dur\xE9e d'affichage du message rapide :</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <input type="number" id="pokeskip-opt-quick-duration" min="3" max="60" value="${PokeSkip.settings.quickPromptDuration || 15}" ${PokeSkip.settings.showQuickPrompt === false ? "disabled" : ""} style="width: 50px; background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f8fafc; padding: 4px 6px; text-align: center; font-size: 12px;">
                <span>secondes</span>
              </div>
            </div>
          </div>
        </div>

        <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h4 style="margin: 0; font-size: 14px; color: #c084fc; display: flex; align-items: center; gap: 6px;">
              <span>\u26A1 Mode Avanc\xE9 : Remplacement d'Attaques</span>
            </h4>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #fff; font-weight: 600;">
              <input type="checkbox" id="pokeskip-opt-advanced-mode" ${PokeSkip.settings.advancedMode ? "checked" : ""} style="accent-color: #a855f7; width: 16px; height: 16px;">
              Activer
            </label>
          </div>
          <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
            Permet de configurer des remplacements automatiques d'anciennes attaques lorsqu'une nouvelle capacit\xE9 (non ignor\xE9e) est apprise et que le Pok\xE9mon poss\xE8de d\xE9j\xE0 4 attaques.
          </div>
          <div id="pokeskip-advanced-status-desc" style="font-size: 11px; color: ${PokeSkip.settings.advancedMode ? "#a855f7" : "#64748b"};">
            ${PokeSkip.settings.advancedMode ? "\u2713 Actif : les sections de remplacement sont visibles dans les onglets." : "\u2715 D\xE9sactiv\xE9 : les r\xE8gles sont conserv\xE9es mais non ex\xE9cut\xE9es."}
          </div>

          <div id="pokeskip-opt-prompt-auto-replacement-container" style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; display: flex; flex-direction: column; gap: 6px; opacity: ${PokeSkip.settings.advancedMode ? "1" : "0.4"};">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
              <input type="checkbox" id="pokeskip-opt-prompt-auto-replacement" ${PokeSkip.settings.promptAutoReplacement !== false ? "checked" : ""} ${!PokeSkip.settings.advancedMode ? "disabled" : ""} style="accent-color: #a855f7;">
              Proposer d'enregistrer les remplacements manuels d\xE9tect\xE9s
            </label>
            <div style="font-size: 11px; color: #94a3b8; padding-left: 24px; line-height: 1.3;">
              Affiche un toast interactif lorsqu'un remplacement est effectu\xE9 manuellement en jeu pour l'enregistrer dans les r\xE8gles de remplacement automatique.
            </div>
          </div>
        </div>

        <div style="background: #111a2e; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #38bdf8;">Exportation / Importation</h4>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8;">Transf\xE9rez vos r\xE8gles de skip vers un autre navigateur ou ordinateur.</p>
          <div style="display: flex; gap: 10px;">
            <button id="pokeskip-btn-export" style="background:#0284c7; color:#fff; border:1px solid #38bdf8; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">\u{1F4E4} Exporter (JSON)</button>
            <button id="pokeskip-btn-import" style="background:#1e293b; color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">\u{1F4E5} Importer (JSON)</button>
          </div>
        </div>

        <div style="background: rgba(225,29,72,0.1); padding: 14px; border-radius: 10px; border: 1px solid rgba(225,29,72,0.25);">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #f43f5e;">R\xE9initialisation</h4>
          <button id="pokeskip-btn-reset-rules" style="background:#be123c; border:1px solid #f43f5e; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">
            Supprimer toutes mes r\xE8gles enregistr\xE9es
          </button>
        </div>
      </div>
    `;
    },
    bindSettingsTabEvents(container, ui) {
      const optToasts = container.querySelector("#pokeskip-opt-toasts");
      if (optToasts) {
        optToasts.addEventListener("change", (e) => {
          PokeSkip.settings.showToasts = e.target.checked;
          PokeSkip.saveSettings();
          const toastDurContainer = container.querySelector("#pokeskip-opt-toast-duration-container");
          const toastDurInput = container.querySelector("#pokeskip-opt-toast-duration");
          if (toastDurContainer) {
            toastDurContainer.style.opacity = e.target.checked ? "1" : "0.4";
          }
          if (toastDurInput) {
            toastDurInput.disabled = !e.target.checked;
          }
        });
      }
      const optToastDuration = container.querySelector("#pokeskip-opt-toast-duration");
      if (optToastDuration) {
        optToastDuration.addEventListener("input", (e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val) && val >= 1 && val <= 30) {
            PokeSkip.settings.toastDuration = Math.round(val * 1e3);
            PokeSkip.saveSettings();
          }
        });
        optToastDuration.addEventListener("change", (e) => {
          let val = parseFloat(e.target.value);
          if (isNaN(val) || val < 1) val = 1;
          if (val > 30) val = 30;
          e.target.value = val;
          PokeSkip.settings.toastDuration = Math.round(val * 1e3);
          PokeSkip.saveSettings();
        });
      }
      const optHudCount = container.querySelector("#pokeskip-opt-hud-count");
      if (optHudCount) {
        optHudCount.addEventListener("change", (e) => {
          PokeSkip.settings.showHudCount = e.target.checked;
          PokeSkip.saveSettings();
          ui.updateHudBadge();
        });
      }
      const optAdvancedMode = container.querySelector("#pokeskip-opt-advanced-mode");
      const optPromptAutoReplacement = container.querySelector("#pokeskip-opt-prompt-auto-replacement");
      const promptAutoRepContainer = container.querySelector("#pokeskip-opt-prompt-auto-replacement-container");
      if (optAdvancedMode) {
        optAdvancedMode.addEventListener("change", (e) => {
          PokeSkip.settings.advancedMode = e.target.checked;
          PokeSkip.saveSettings();
          const statusDesc = container.querySelector("#pokeskip-advanced-status-desc");
          if (statusDesc) {
            statusDesc.textContent = e.target.checked ? "\u2713 Actif : les sections de remplacement sont visibles dans les onglets." : "\u2715 D\xE9sactiv\xE9 : les r\xE8gles sont conserv\xE9es mais non ex\xE9cut\xE9es.";
            statusDesc.style.color = e.target.checked ? "#a855f7" : "#64748b";
          }
          if (optPromptAutoReplacement) {
            optPromptAutoReplacement.disabled = !e.target.checked;
          }
          if (promptAutoRepContainer) {
            promptAutoRepContainer.style.opacity = e.target.checked ? "1" : "0.4";
          }
          ui.showToast(
            e.target.checked ? "\u26A1 Mode Avanc\xE9 activ\xE9" : "Mode Avanc\xE9 d\xE9sactiv\xE9 (r\xE8gles conserv\xE9es)",
            e.target.checked ? "success" : "info"
          );
        });
      }
      if (optPromptAutoReplacement) {
        optPromptAutoReplacement.addEventListener("change", (e) => {
          PokeSkip.settings.promptAutoReplacement = e.target.checked;
          PokeSkip.saveSettings();
        });
      }
      const optQuickPrompt = container.querySelector("#pokeskip-opt-quick-prompt");
      const optQuickDuration = container.querySelector("#pokeskip-opt-quick-duration");
      const optDurationContainer = container.querySelector("#pokeskip-opt-duration-container");
      if (optQuickPrompt) {
        optQuickPrompt.addEventListener("change", (e) => {
          PokeSkip.settings.showQuickPrompt = e.target.checked;
          PokeSkip.saveSettings();
          if (optDurationContainer) {
            optDurationContainer.style.opacity = e.target.checked ? "1" : "0.4";
          }
          if (optQuickDuration) {
            optQuickDuration.disabled = !e.target.checked;
          }
        });
      }
      if (optQuickDuration) {
        optQuickDuration.addEventListener("input", (e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val) && val >= 3 && val <= 120) {
            PokeSkip.settings.quickPromptDuration = val;
            PokeSkip.saveSettings();
          }
        });
        optQuickDuration.addEventListener("change", (e) => {
          let val = parseInt(e.target.value, 10);
          if (isNaN(val) || val < 3) val = 3;
          if (val > 120) val = 120;
          e.target.value = val;
          PokeSkip.settings.quickPromptDuration = val;
          PokeSkip.saveSettings();
        });
      }
      const btnExport = container.querySelector("#pokeskip-btn-export");
      if (btnExport) {
        btnExport.addEventListener("click", () => {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(PokeSkip.rules, null, 2));
          const a = document.createElement("a");
          a.setAttribute("href", dataStr);
          a.setAttribute("download", `pokeskip-rules-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`);
          document.body.appendChild(a);
          a.click();
          a.remove();
          ui.showToast("R\xE8gles export\xE9es en fichier JSON", "success");
        });
      }
      const btnImport = container.querySelector("#pokeskip-btn-import");
      if (btnImport) {
        btnImport.addEventListener("click", () => {
          const json = prompt("Collez ici le contenu JSON de vos r\xE8gles :");
          if (!json) return;
          try {
            const parsed = JSON.parse(json);
            if (typeof parsed === "object") {
              PokeSkip.rules = { ...PokeSkip.rules, ...parsed };
              PokeSkip.saveRules();
              ui.showToast("R\xE8gles import\xE9es avec succ\xE8s !", "success");
              ui.renderTeamTab();
            }
          } catch (err) {
            alert("Erreur : le format JSON est invalide.");
          }
        });
      }
      const btnReset = container.querySelector("#pokeskip-btn-reset-rules");
      if (btnReset) {
        btnReset.addEventListener("click", () => {
          if (confirm("Voulez-vous vraiment effacer TOUTES les r\xE8gles enregistr\xE9es ? Rien ne sera plus skip.")) {
            PokeSkip.rules = {};
            PokeSkip.saveRules();
            ui.showToast("Toutes les r\xE8gles ont \xE9t\xE9 effac\xE9es.", "warning");
            ui.renderTeamTab();
          }
        });
      }
    }
  };

  // src/ui/modal.js
  var Modal = {
    createModal() {
      if (document.getElementById("pokeskip-modal-backdrop")) return;
      const backdrop = document.createElement("div");
      backdrop.id = "pokeskip-modal-backdrop";
      backdrop.innerHTML = `
      <div id="pokeskip-modal">
        <div class="pokeskip-modal-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${this.getPokeballSvg(26)}
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #f8fafc; letter-spacing: -0.2px;">Pok\xE9Skip</h2>
                <span class="pokeskip-header-badge">Auto-Skip Intelligent</span>
              </div>
              <span style="font-size: 11.5px; color: #94a3b8;">Gestion automatis\xE9e des nouvelles capacit\xE9s par Pok\xE9mon</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <label class="pokeskip-switch-label" title="Activer / D\xE9sactiver Pok\xE9Skip">
              <span class="pokeskip-switch-text ${PokeSkip.settings.enabled ? "active" : ""}" id="pokeskip-switch-status-text">${PokeSkip.settings.enabled ? "Actif" : "Inactif"}</span>
              <span class="pokeskip-switch">
                <input type="checkbox" id="pokeskip-toggle-enabled" ${PokeSkip.settings.enabled ? "checked" : ""}>
                <span class="pokeskip-slider"></span>
              </span>
            </label>
            <button id="pokeskip-modal-close" class="pokeskip-close-btn" title="Fermer la fen\xEAtre (\xC9chap)">\u2715</button>
          </div>
        </div>

        <div class="pokeskip-modal-tabs">
          <button class="pokeskip-tab-btn active" data-tab="team"><span>\u2694\uFE0F</span> <span>Mon \xC9quipe</span></button>
          <button class="pokeskip-tab-btn" data-tab="saved"><span>\u{1F9EC}</span> <span>R\xE8gles & Esp\xE8ces</span></button>
          <button class="pokeskip-tab-btn" data-tab="settings"><span>\u2699\uFE0F</span> <span>Param\xE8tres</span></button>
        </div>

        <div class="pokeskip-modal-body" id="pokeskip-body-team">
          <div id="pokeskip-team-selector" class="pokeskip-team-row"></div>
          <div id="pokeskip-selected-pokemon-content"></div>
        </div>

        <div class="pokeskip-modal-body" id="pokeskip-body-saved" style="display: none;">
          <div id="pokeskip-saved-species-list"></div>
        </div>

        <div class="pokeskip-modal-body" id="pokeskip-body-settings" style="display: none;">
          ${SettingsTab.getSettingsTabHtml()}
        </div>
      </div>
    `;
      document.body.appendChild(backdrop);
      this.modalContainer = backdrop;
      const stopModalKeyboard = (e) => {
        if (e.key === "Escape" && e.type === "keydown") {
          this.closeModal();
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        e.stopPropagation();
      };
      ["keydown", "keyup", "keypress"].forEach((type) => {
        backdrop.addEventListener(type, stopModalKeyboard);
      });
      this.isolateInputs(backdrop);
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.closeModal();
      });
      document.getElementById("pokeskip-modal-close").addEventListener("click", () => this.closeModal());
      document.getElementById("pokeskip-toggle-enabled").addEventListener("change", (e) => {
        PokeSkip.settings.enabled = e.target.checked;
        PokeSkip.saveSettings();
        this.updateHudBadge();
        const statusText = document.getElementById("pokeskip-switch-status-text");
        if (statusText) {
          statusText.textContent = PokeSkip.settings.enabled ? "Actif" : "Inactif";
          statusText.classList.toggle("active", PokeSkip.settings.enabled);
        }
        this.showToast(PokeSkip.settings.enabled ? "Pok\xE9Skip activ\xE9" : "Pok\xE9Skip en pause", "info");
      });
      backdrop.querySelectorAll(".pokeskip-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          backdrop.querySelectorAll(".pokeskip-tab-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const tab = btn.dataset.tab;
          document.getElementById("pokeskip-body-team").style.display = tab === "team" ? "block" : "none";
          document.getElementById("pokeskip-body-saved").style.display = tab === "saved" ? "block" : "none";
          document.getElementById("pokeskip-body-settings").style.display = tab === "settings" ? "block" : "none";
          if (tab === "saved") this.renderSavedSpeciesTab();
        });
      });
      SettingsTab.bindSettingsTabEvents(backdrop, this);
    },
    toggleModal() {
      if (!this.modalContainer) this.createModal();
      if (this.modalContainer.classList.contains("active")) {
        this.closeModal();
      } else {
        this.openModal();
      }
    },
    openModal() {
      this.disableGameKeyboard();
      this.refreshPartyFromGame();
      this.renderTeamTab();
      this.modalContainer.classList.add("active");
    },
    closeModal() {
      if (this.modalContainer) {
        this.modalContainer.classList.remove("active");
      }
      if (!this.isModalOpen()) {
        this.enableGameKeyboard();
      }
    },
    typeChartContainer: null,
    typeChartOpenedViaKey: false,
    typeChartViewMode: "simplified",
    typeChartShowImmunities: true
  };

  // src/core/battle-analyzer.js
  function getActiveEnemyTypes() {
    try {
      const scene = PokeSkip.scene || (typeof unsafeWindow !== "undefined" ? unsafeWindow.globalScene : window.globalScene);
      if (!scene) return { types: [], name: "", enemies: [] };
      const activePokemonList = [];
      const addPokemon = (p) => {
        if (!p || typeof p !== "object") return;
        const actual = p.pokemon || p;
        if (!actual) return;
        const hasTypes = typeof actual.getTypes === "function" || Array.isArray(actual.types) || actual.species || actual.type1 !== void 0;
        if (!hasTypes) return;
        if (typeof actual.isFainted === "function" && actual.isFainted()) return;
        if (actual.hp !== void 0 && actual.hp <= 0) return;
        if (activePokemonList.some((item) => item === actual || item.id && actual.id && item.id === actual.id)) return;
        activePokemonList.push(actual);
      };
      if (typeof scene.getEnemyField === "function") {
        try {
          const field = scene.getEnemyField();
          if (Array.isArray(field)) {
            field.forEach(addPokemon);
          }
        } catch (_) {
        }
      }
      if (scene.enemySide) {
        if (Array.isArray(scene.enemySide.pokemon)) {
          scene.enemySide.pokemon.forEach(addPokemon);
        }
        if (Array.isArray(scene.enemySide.active)) {
          scene.enemySide.active.forEach(addPokemon);
        }
      }
      if (typeof scene.getEnemyPokemon === "function") {
        try {
          addPokemon(scene.getEnemyPokemon(0));
        } catch (_) {
          try {
            addPokemon(scene.getEnemyPokemon());
          } catch (_2) {
          }
        }
        try {
          addPokemon(scene.getEnemyPokemon(1));
        } catch (_) {
        }
      }
      if (scene.currentBattle && typeof scene.currentBattle.getEnemyPokemon === "function") {
        try {
          addPokemon(scene.currentBattle.getEnemyPokemon(0));
        } catch (_) {
          try {
            addPokemon(scene.currentBattle.getEnemyPokemon());
          } catch (_2) {
          }
        }
        try {
          addPokemon(scene.currentBattle.getEnemyPokemon(1));
        } catch (_) {
        }
      }
      if (activePokemonList.length === 0) {
        const party = scene.currentBattle && Array.isArray(scene.currentBattle.enemyParty) ? scene.currentBattle.enemyParty : Array.isArray(scene.enemyParty) ? scene.enemyParty : null;
        if (party && party.length > 0) {
          const isDouble = Boolean(scene.currentBattle?.double || scene.currentBattle?.isDouble);
          const count = isDouble ? Math.min(2, party.length) : 1;
          for (let i = 0; i < count; i++) {
            addPokemon(party[i]);
          }
        }
      }
      if (activePokemonList.length === 0) return { types: [], name: "", enemies: [] };
      const getTypesFromPokemon = (poke) => {
        let rawTypes = [];
        if (typeof poke.getTypes === "function") {
          rawTypes = poke.getTypes();
        } else if (Array.isArray(poke.types)) {
          rawTypes = poke.types;
        } else if (poke.type1 !== void 0 || poke.type2 !== void 0) {
          if (poke.type1 !== void 0 && poke.type1 !== null) rawTypes.push(poke.type1);
          if (poke.type2 !== void 0 && poke.type2 !== null && poke.type2 !== poke.type1) rawTypes.push(poke.type2);
        } else if (poke.species) {
          if (poke.species.type1 !== void 0) rawTypes.push(poke.species.type1);
          if (poke.species.type2 !== void 0 && poke.species.type2 !== poke.species.type1) rawTypes.push(poke.species.type2);
        }
        const indices = [];
        for (const t of rawTypes) {
          if (typeof t === "number" && t >= 0 && t < 18) {
            if (!indices.includes(t)) indices.push(t);
          } else if (typeof t === "string") {
            const idx = POKEMON_TYPES.findIndex((pt) => pt.name.toLowerCase() === t.toLowerCase());
            if (idx !== -1 && idx < 18 && !indices.includes(idx)) indices.push(idx);
          } else if (t && typeof t === "object" && t.name) {
            const idx = POKEMON_TYPES.findIndex((pt) => pt.name.toLowerCase() === t.name.toLowerCase());
            if (idx !== -1 && idx < 18 && !indices.includes(idx)) indices.push(idx);
          }
        }
        return indices;
      };
      const getNameFromPokemon = (poke) => {
        return LineageManager.getPokemonDisplayName(poke) || "Adversaire";
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
        name: enemies.map((e) => e.name).join(" & "),
        enemies
      };
    } catch (e) {
      console.warn("[PokeSkip] Erreur d\xE9tection types adverses:", e);
      return { types: [], name: "", enemies: [] };
    }
  }

  // src/ui/type-chart.js
  var TypeChart = {
    createTypeChartContainer() {
      if (document.getElementById("pokeskip-typechart-overlay")) {
        this.typeChartContainer = document.getElementById("pokeskip-typechart-overlay");
        this.typeChartViewMode = PokeStorage.get("pokeskip_typechart_view_mode", "simplified");
        this.typeChartShowImmunities = PokeStorage.get("pokeskip_typechart_show_immunities", true);
        return;
      }
      this.typeChartViewMode = PokeStorage.get("pokeskip_typechart_view_mode", "simplified");
      this.typeChartShowImmunities = PokeStorage.get("pokeskip_typechart_show_immunities", true);
      const overlay = document.createElement("div");
      overlay.id = "pokeskip-typechart-overlay";
      const stopOverlayKeyboard = (e) => {
        if (e.key === "Escape" && e.type === "keydown") {
          this.hideTypeChart(false);
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        e.stopPropagation();
      };
      ["keydown", "keyup", "keypress"].forEach((type) => {
        overlay.addEventListener(type, stopOverlayKeyboard);
      });
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.hideTypeChart(false);
        }
      });
      document.body.appendChild(overlay);
      this.typeChartContainer = overlay;
      this.isolateInputs(overlay);
    },
    getTypeChartContentHtml(mode) {
      const enemyInfo = getActiveEnemyTypes();
      const enemyTypeIndices = enemyInfo.types || [];
      const types18 = POKEMON_TYPES.slice(0, 18);
      let bodyHtml = "";
      let footerHtml = "";
      if (mode === "table") {
        bodyHtml = `
          <div class="pokeskip-typechart-table-wrap">
            <div class="pokeskip-table-stage">
              <table class="pokeskip-typechart-table">
                <thead>
                  <tr>
                    <th class="pokeskip-th-corner">
                      <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; font-size: 8.5px; padding: 3px 2px; box-sizing: border-box;">
                        <span style="align-self: flex-end; color: #38bdf8; font-weight: 800;">\u{1F6E1}\uFE0F D\xE9f. \u2794</span>
                        <span style="align-self: flex-start; color: #f8fafc; font-weight: 800;">\u2B07 \u2694\uFE0F Att.</span>
                      </div>
                    </th>
                    ${types18.map((t, colIdx) => {
          const isHigh = enemyTypeIndices.includes(colIdx);
          return `
                        <th class="pokeskip-th-col ${isHigh ? "highlighted-col" : ""}" data-col="${colIdx}" style="background-color: ${t.bg};" title="D\xE9fenseur : ${t.name}">
                          <div class="pokeskip-th-col-content">
                            ${isHigh ? '<span class="pokeskip-col-marker">\u{1F3AF}</span>' : ""}
                            <span class="pokeskip-th-col-name">${t.name}</span>
                          </div>
                        </th>
                      `;
        }).join("")}
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
          let cellContent = "\u2014";
          let cellClass = "neutral";
          if (mult === 2) {
            cellContent = "2";
            cellClass = "super";
          } else if (mult === 0.5) {
            cellContent = "\xBD";
            cellClass = "half";
          } else if (mult === 0) {
            cellContent = "0";
            cellClass = "zero";
          }
          return `
                          <td class="pokeskip-td-cell ${cellClass}" data-row="${rowIdx}" data-col="${colIdx}" title="${rowType.name} \u2794 ${colType.name} : \xD7${mult}">
                            ${cellContent}
                          </td>
                        `;
        }).join("")}
                    </tr>
                  `).join("")}
                </tbody>
              </table>
              <div class="pokeskip-col-bubble-layer"></div>
            </div>
          </div>
        `;
        footerHtml = `
          <div class="pokeskip-typechart-footer">
            <div class="pokeskip-typechart-legend">
              <span class="legend-badge super">2</span> <span>\xD72 Super</span>
              <span class="legend-badge half">\xBD</span> <span>\xD70.5 Peu</span>
              <span class="legend-badge zero">0</span> <span>\xD70 Inefficace</span>
              <span class="legend-badge neutral">\u2014</span> <span>\xD71 Neutre</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">
              <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">T</kbd> ou <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">\xC9chap</kbd> Fermer
            </div>
          </div>
        `;
      } else {
        const showImmunities = this.typeChartShowImmunities;
        const SIMPLIFIED_ORDER_NAMES = [
          "F\xE9e",
          "Acier",
          "T\xE9n\xE8bres",
          "Dragon",
          "Spectre",
          "Roche",
          "Insecte",
          "Psy",
          "Vol",
          "Sol",
          "Poison",
          "Combat",
          "Glace",
          "Plante",
          "\xC9lectrik",
          "Eau",
          "Feu",
          "Normal"
        ];
        const getRowHtml = (name, isEnemy) => {
          const idx = types18.findIndex((item) => item.name === name);
          if (idx === -1) return "";
          const t = types18[idx];
          const weaknesses = [];
          const strengths = [];
          const immunities = [];
          for (let otherIdx = 0; otherIdx < 18; otherIdx++) {
            if (TYPE_CHART[otherIdx][idx] === 2) weaknesses.push(types18[otherIdx]);
            if (TYPE_CHART[idx][otherIdx] === 2) strengths.push(types18[otherIdx]);
            if (TYPE_CHART[otherIdx][idx] === 0) immunities.push(types18[otherIdx]);
          }
          const weakPills = weaknesses.map((w) => `
            <span class="pokeskip-badge-pill" data-type="${w.name}" style="background-color: ${w.bg};" title="Subit \xD72 de ${w.name}">
              ${w.name}
            </span>
          `).join("");
          const strongPills = strengths.map((s) => `
            <span class="pokeskip-badge-pill" data-type="${s.name}" style="background-color: ${s.bg};" title="Inflige \xD72 \xE0 ${s.name}">
              ${s.name}
            </span>
          `).join("");
          const immPills = immunities.length > 0 ? `
            <div class="pokeskip-ref-immunity-wrap" style="${showImmunities ? "" : "display: none;"}">
              <div style="display: inline-flex; align-items: center; margin-right: 4px; padding-right: 4px; border-right: 1px solid rgba(255,255,255,0.12);">
                ${immunities.map((imm) => `
                  <span class="pokeskip-badge-pill" data-type="${imm.name}" style="background-color: ${imm.bg}; opacity: 0.85;" title="Immunis\xE9 contre ${imm.name} (\xD70)">
                    ${imm.name}<span class="pokeskip-mult-tag x0">\xD70</span>
                  </span>
                `).join("")}
              </div>
            </div>
          ` : "";
          return `
            <div class="pokeskip-ref-row ${isEnemy ? "enemy-row" : ""}">
              <div class="pokeskip-ref-left">
                ${immPills}
                ${weakPills}
              </div>
              <div class="pokeskip-ref-arrow-left">\u2794</div>
              <div class="pokeskip-ref-center">
                <span class="pokeskip-badge-pill" data-type="${t.name}" style="background-color: ${t.bg};" title="${t.name}">
                  ${t.name}
                </span>
              </div>
              <div class="pokeskip-ref-arrow-right">\u2794</div>
              <div class="pokeskip-ref-right">
                ${strongPills}
              </div>
            </div>
          `;
        };
        const isEnemyList = SIMPLIFIED_ORDER_NAMES.map((name) => {
          const idx = types18.findIndex((item) => item.name === name);
          return idx !== -1 && enemyTypeIndices.includes(idx);
        });
        const rowNodesHtml = [];
        for (let i = 0; i < SIMPLIFIED_ORDER_NAMES.length; i++) {
          const isEnemy = isEnemyList[i];
          const isNextEnemy = i + 1 < SIMPLIFIED_ORDER_NAMES.length && isEnemyList[i + 1];
          if (isEnemy && isNextEnemy) {
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
            const row = getRowHtml(SIMPLIFIED_ORDER_NAMES[i], true);
            rowNodesHtml.push(`
              <div class="pokeskip-ref-enemy-bubble">
                ${row}
              </div>
            `);
          } else {
            rowNodesHtml.push(getRowHtml(SIMPLIFIED_ORDER_NAMES[i], false));
          }
        }
        bodyHtml = `
          <div class="pokeskip-ref-container ${showImmunities ? "" : "pks-hide-immunities"}">
            <div class="pokeskip-ref-header">
              <div class="pokeskip-ref-left-label">
                <label class="pokeskip-tc-switch" title="Afficher ou masquer les immunit\xE9s (\xD70)">
                  <input type="checkbox" class="pks-immunity-checkbox" ${showImmunities ? "checked" : ""}>
                  <span class="pks-tc-slider"></span>
                  <span class="pks-tc-label">\u{1F6E1}\uFE0F Immunit\xE9s (\xD70)</span>
                </label>
                <span>\u26A0\uFE0F Faiblesses (re\xE7oit \xD72)</span>
              </div>
              <div class="pokeskip-ref-center-label">Type</div>
              <div class="pokeskip-ref-right-label">Forces (inflige \xD72) \u2694\uFE0F</div>
            </div>
            ${rowNodesHtml.join("")}
          </div>
        `;
        footerHtml = `
          <div class="pokeskip-typechart-footer">
            <div class="pokeskip-typechart-legend">
              <span style="color: #fca5a5; font-weight: 700;">Faiblesses \u2794</span> <span>Types re\xE7us \xD72</span>
              <span style="margin: 0 4px; color: #475569;">\u2022</span>
              <span style="color: #86efac; font-weight: 700;">\u2794 Forces</span> <span>Types inflig\xE9s \xD72</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">
              <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">T</kbd> ou <kbd style="background: #1e293b; border: 1px solid #475569; padding: 1px 4px; border-radius: 3px; color: #fff;">\xC9chap</kbd> Fermer
            </div>
          </div>
        `;
      }
      return { bodyHtml, footerHtml };
    },
    updateTypeChartColumnBubbles() {
      if (!this.typeChartContainer) return;
      const stage = this.typeChartContainer.querySelector(".pokeskip-table-stage");
      const table = this.typeChartContainer.querySelector(".pokeskip-typechart-table");
      const bubbleLayer = this.typeChartContainer.querySelector(".pokeskip-col-bubble-layer");
      if (!stage || !table || !bubbleLayer) return;
      bubbleLayer.innerHTML = "";
      const enemyInfo = getActiveEnemyTypes();
      const enemyTypeIndices = enemyInfo.types || [];
      const validCols = [...new Set(enemyTypeIndices)].filter((idx) => idx >= 0 && idx < 18).sort((a, b) => a - b);
      if (validCols.length === 0) return;
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
        const bubble = document.createElement("div");
        bubble.className = "pokeskip-col-bubble";
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
      PokeStorage.set("pokeskip_typechart_view_mode", newMode);
      const modeBtns = this.typeChartContainer.querySelectorAll(".pokeskip-mode-btn");
      modeBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === newMode);
      });
      const { bodyHtml, footerHtml } = this.getTypeChartContentHtml(newMode);
      const bodyEl = this.typeChartContainer.querySelector(".pokeskip-typechart-body");
      const footerEl = this.typeChartContainer.querySelector(".pokeskip-typechart-footer-wrap");
      if (bodyEl) {
        bodyEl.innerHTML = bodyHtml;
        bodyEl.classList.remove("pks-tab-fade");
        void bodyEl.offsetWidth;
        bodyEl.classList.add("pks-tab-fade");
      }
      if (footerEl) {
        footerEl.innerHTML = footerHtml;
      }
      this.bindTypeChartTabEvents(newMode);
    },
    bindTypeChartTabEvents(mode) {
      if (!this.typeChartContainer) return;
      if (mode === "table") {
        this.updateTypeChartColumnBubbles();
        requestAnimationFrame(() => this.updateTypeChartColumnBubbles());
      } else {
        const checkbox = this.typeChartContainer.querySelector(".pks-immunity-checkbox");
        if (checkbox) {
          checkbox.addEventListener("change", (e) => {
            this.typeChartShowImmunities = e.target.checked;
            PokeStorage.set("pokeskip_typechart_show_immunities", this.typeChartShowImmunities);
            const container = this.typeChartContainer.querySelector(".pokeskip-ref-container");
            if (container) {
              container.classList.toggle("pks-hide-immunities", !this.typeChartShowImmunities);
              container.querySelectorAll(".pokeskip-ref-immunity-wrap").forEach((el) => {
                el.style.display = this.typeChartShowImmunities ? "" : "none";
              });
            }
          });
        }
      }
    },
    renderTypeChart() {
      if (!this.typeChartContainer) this.createTypeChartContainer();
      if (!this.typeChartViewMode) {
        this.typeChartViewMode = PokeStorage.get("pokeskip_typechart_view_mode", "simplified");
      }
      if (this.typeChartShowImmunities === void 0) {
        this.typeChartShowImmunities = PokeStorage.get("pokeskip_typechart_show_immunities", true);
      }
      const mode = this.typeChartViewMode;
      const enemyInfo = getActiveEnemyTypes();
      const enemyTypeIndices = enemyInfo.types || [];
      const hasEnemy = enemyTypeIndices.length > 0;
      const enemiesList = hasEnemy && enemyInfo.enemies && enemyInfo.enemies.length > 0 ? enemyInfo.enemies : hasEnemy ? [{ name: enemyInfo.name || "Adversaire", types: enemyTypeIndices }] : [];
      let targetHeaderHtml = "";
      if (hasEnemy && enemiesList.length > 0) {
        const targetBlocks = enemiesList.map((en) => {
          const badges = en.types.map((idx) => {
            const t = POKEMON_TYPES[idx];
            return `<span class="pokeskip-badge-pill" style="background-color: ${t.bg}; margin-left: 2px;">${t.name}</span>`;
          }).join("");
          return `
            <div style="display: inline-flex; align-items: center; gap: 4px;">
              <span style="color: #ffffff; font-weight: 700; font-size: 11px;">${en.name}</span>
              ${badges}
            </div>
          `;
        }).join('<span style="color: #64748b; font-size: 11px; margin: 0 4px; font-weight: bold;">\u2022</span>');
        targetHeaderHtml = `
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.14); border: 1px solid rgba(56, 189, 248, 0.4); padding: 2px 8px; border-radius: 6px; font-size: 11px; flex-wrap: wrap;">
            <span style="color: #38bdf8; font-weight: 800;">\u{1F3AF} ${enemiesList.length > 1 ? "Cibles :" : "Cible :"}</span>
            ${targetBlocks}
          </div>
        `;
      }
      const { bodyHtml, footerHtml } = this.getTypeChartContentHtml(mode);
      this.typeChartContainer.innerHTML = `
        <div class="pokeskip-typechart-box">
          <div class="pokeskip-typechart-header">
            <div class="pokeskip-typechart-title-wrap">
              <span style="font-size: 16px;">\u2694\uFE0F</span>
              <span class="pokeskip-typechart-title">Forces & Faiblesses</span>
              <div class="pokeskip-mode-switch">
                <button class="pokeskip-mode-btn ${mode === "simplified" ? "active" : ""}" data-mode="simplified" title="Vue simplifi\xE9e">\u26A1 Simplifi\xE9</button>
                <button class="pokeskip-mode-btn ${mode === "table" ? "active" : ""}" data-mode="table" title="Matrice compl\xE8te 18\xD718">\u{1F4CA} Complet</button>
              </div>
              <div class="pokeskip-typechart-targets-wrap">
                ${targetHeaderHtml}
              </div>
            </div>
            <button class="pokeskip-typechart-close" title="Fermer (T ou \xC9chap)">&times;</button>
          </div>

          <div class="pokeskip-typechart-body pks-tab-fade">
            ${bodyHtml}
          </div>
          <div class="pokeskip-typechart-footer-wrap">
            ${footerHtml}
          </div>
        </div>
      `;
      const modeBtns = this.typeChartContainer.querySelectorAll(".pokeskip-mode-btn");
      modeBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const newMode = btn.dataset.mode;
          if (newMode && newMode !== this.typeChartViewMode) {
            this.switchTypeChartTab(newMode);
          }
        });
      });
      const closeBtn = this.typeChartContainer.querySelector(".pokeskip-typechart-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          this.hideTypeChart(false);
        });
      }
      this.bindTypeChartTabEvents(mode);
      this.updateTypeChartResponsiveScale();
    },
    updateTypeChartResponsiveScale() {
      if (!this.typeChartContainer) return;
      const box = this.typeChartContainer.querySelector(".pokeskip-typechart-box");
      if (!box) return;
      const baseW = 770;
      const baseH = 620;
      const availW = window.innerWidth * 0.94;
      const availH = window.innerHeight * 0.9;
      let scale = Math.min(availW / baseW, availH / baseH);
      scale = Math.max(0.65, Math.min(2.5, scale));
      box.style.setProperty("--pks-tc-scale", scale.toFixed(2));
      if (this.typeChartViewMode === "table") {
        this.updateTypeChartColumnBubbles();
      }
    },
    showTypeChart() {
      this.disableGameKeyboard();
      if (!this.typeChartContainer) {
        this.createTypeChartContainer();
      }
      this.renderTypeChart();
      this.typeChartContainer.style.display = "flex";
      this.updateTypeChartResponsiveScale();
    },
    hideTypeChart() {
      if (this.typeChartContainer) {
        this.typeChartContainer.style.display = "none";
      }
      this.typeChartOpenedViaKey = false;
      if (!this.isModalOpen()) {
        this.enableGameKeyboard();
      }
    },
    toggleTypeChart() {
      if (this.typeChartContainer && this.typeChartContainer.style.display === "flex") {
        this.hideTypeChart();
      } else {
        this.showTypeChart();
      }
    }
  };

  // src/ui/hotkeys.js
  var Hotkeys = {
    bindHotkeys() {
      window.addEventListener("keydown", (e) => {
        const activeEl = document.activeElement;
        const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT" || activeEl.isContentEditable);
        if (e.key === "p" || e.key === "P") {
          if (isInput) return;
          if (e.repeat) return;
          e.stopPropagation();
          e.preventDefault();
          this.toggleModal();
        } else if (e.key === "t" || e.key === "T") {
          if (isInput) return;
          if (e.repeat) return;
          e.stopPropagation();
          e.preventDefault();
          this.toggleTypeChart();
        } else if (e.key === "Escape") {
          if (this.typeChartContainer && this.typeChartContainer.style.display === "flex") {
            e.stopPropagation();
            e.preventDefault();
            this.hideTypeChart();
          } else if (this.modalContainer && this.modalContainer.classList.contains("active")) {
            e.stopPropagation();
            e.preventDefault();
            this.closeModal();
          }
        }
      });
      const isPokeSkipElement = (el) => {
        if (!el || typeof el.closest !== "function") return false;
        return !!(el.closest("#pokeskip-modal") || el.closest("#pokeskip-type-chart") || el.closest("#pokeskip-quick-prompt") || el.closest("#pokeskip-hud") || el.closest(".pokeskip-container"));
      };
      document.addEventListener("focusin", (e) => {
        const t = e.target;
        if (t && isPokeSkipElement(t) && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) {
          this.disableGameKeyboard();
        }
      }, true);
      document.addEventListener("focusout", (e) => {
        const t = e.target;
        if (t && isPokeSkipElement(t) && !this.isModalOpen()) {
          this.enableGameKeyboard();
        }
      }, true);
      window.addEventListener("resize", () => {
        this.applyHudPosition(this.hudContainer || document.getElementById("pokeskip-hud"));
        if (this.typeChartContainer && this.typeChartContainer.style.display === "flex") {
          this.updateTypeChartResponsiveScale();
        }
      });
    }
  };

  // src/core/moves-resolver.js
  function getPokemonFullLearnset(pokemon) {
    const moves = [];
    const seenMoveIds = /* @__PURE__ */ new Set();
    let getMoveFn = null;
    if (pokemon?.moveset && pokemon.moveset.length > 0 && typeof pokemon.moveset[0].getMove === "function") {
      getMoveFn = pokemon.moveset[0].getMove;
    }
    if (!getMoveFn && PokeSkip.activeParty && Array.isArray(PokeSkip.activeParty)) {
      for (const p of PokeSkip.activeParty) {
        if (p?.moveset && p.moveset.length > 0 && typeof p.moveset[0].getMove === "function") {
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
        } catch (e) {
        }
      }
      const name = moveObj?.name || PokeSkip.knownMovesCache[moveId] || `Capacit\xE9 #${moveId}`;
      const typeIdx = moveObj && moveObj.type !== void 0 ? moveObj.type : 0;
      const catIdx = moveObj && moveObj.category !== void 0 ? moveObj.category : 2;
      const power = moveObj && moveObj.power > 0 ? moveObj.power : "\u2014";
      let accuracyText = "\u2014";
      if (moveObj && moveObj.accuracy !== void 0) {
        if (moveObj.accuracy > 0) {
          accuracyText = `${moveObj.accuracy}%`;
        } else if (moveObj.accuracy < 0) {
          accuracyText = "Infaillible";
        } else {
          accuracyText = "\u2014";
        }
      }
      const pp = moveObj && moveObj.pp !== void 0 && moveObj.pp > 0 ? moveObj.pp : moveObj && moveObj.maxPp ? moveObj.maxPp : "\u2014";
      const desc = moveObj?.effect || "Inflige des d\xE9g\xE2ts ou applique un effet.";
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
        evolutionSpecies: evolutionSpecies || null,
        isEgg: level === "\u0152uf"
      };
    }
    const lineage = LineageManager.getLineageMembers(pokemon);
    const currentSpeciesId = lineage.currentId;
    function getRawLevelMovesForSpecies(targetSpeciesId) {
      if (!targetSpeciesId) return null;
      if (targetSpeciesId === currentSpeciesId) {
        try {
          if (typeof pokemon?.getSpeciesForm === "function") {
            const sf = pokemon.getSpeciesForm(true);
            if (sf && typeof sf.getLevelMoves === "function") {
              const res = sf.getLevelMoves();
              if (res && Array.isArray(res) && res.length > 0) return res;
            }
          }
          if (pokemon?.species && typeof pokemon.species.getLevelMoves === "function") {
            const res = pokemon.species.getLevelMoves();
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {
        }
      }
      let sp = pokemon?.species || (typeof pokemon?.getSpeciesForm === "function" ? pokemon.getSpeciesForm(true) : null);
      if (!sp && PokeSkip.activeParty && PokeSkip.activeParty.length > 0) {
        for (const p of PokeSkip.activeParty) {
          const cand = p?.species || (typeof p?.getSpeciesForm === "function" ? p.getSpeciesForm(true) : null);
          if (cand && typeof cand.getLevelMoves === "function") {
            sp = cand;
            break;
          }
        }
      }
      if (sp) {
        try {
          const proto = Object.getPrototypeOf(sp);
          const superProto = proto ? Object.getPrototypeOf(proto) : null;
          if (superProto && typeof superProto.getLevelMoves === "function") {
            const res = superProto.getLevelMoves.call({ speciesId: targetSpeciesId });
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {
        }
        try {
          const proto = Object.getPrototypeOf(sp);
          if (proto && typeof proto.getLevelMoves === "function") {
            const ctx = Object.create(proto);
            ctx.speciesId = targetSpeciesId;
            ctx.formIndex = 0;
            ctx.getFormKey = () => void 0;
            const res = proto.getLevelMoves.call(ctx);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {
        }
        try {
          if (typeof sp.getLevelMoves === "function") {
            const ctx = Object.create(sp);
            ctx.speciesId = targetSpeciesId;
            ctx.formIndex = 0;
            ctx.getFormKey = () => void 0;
            const res = sp.getLevelMoves.call(ctx);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {
        }
      }
      try {
        const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry;
        if (sdr && typeof sdr.getLevelMoves === "function") {
          const res = sdr.getLevelMoves(targetSpeciesId);
          if (res && Array.isArray(res) && res.length > 0) return res;
        }
      } catch (_) {
      }
      try {
        const sc = PokeSkip.scene || (typeof unsafeWindow !== "undefined" ? unsafeWindow.globalScene : window.globalScene);
        if (sc && sc.speciesDataRegistry && typeof sc.speciesDataRegistry.getLevelMoves === "function") {
          const res = sc.speciesDataRegistry.getLevelMoves(targetSpeciesId);
          if (res && Array.isArray(res) && res.length > 0) return res;
        }
      } catch (_) {
      }
      return null;
    }
    function getRawEggMovesForSpecies(targetSpeciesId) {
      if (!targetSpeciesId) return null;
      const targetNum = Number(targetSpeciesId);
      if (!targetNum) return null;
      if (targetNum === currentSpeciesId && pokemon) {
        try {
          if (typeof pokemon.getEggMoves === "function") {
            const res = pokemon.getEggMoves();
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
          if (Array.isArray(pokemon.eggMoves) && pokemon.eggMoves.length > 0) {
            return pokemon.eggMoves;
          }
          if (Array.isArray(pokemon.compatibleEggMoves) && pokemon.compatibleEggMoves.length > 0) {
            return pokemon.compatibleEggMoves;
          }
          if (typeof pokemon.getSpeciesForm === "function") {
            const sf = pokemon.getSpeciesForm(true);
            if (sf) {
              if (typeof sf.getEggMoves === "function") {
                const res = sf.getEggMoves();
                if (res && Array.isArray(res) && res.length > 0) return res;
              }
              if (Array.isArray(sf.eggMoves) && sf.eggMoves.length > 0) {
                return sf.eggMoves;
              }
            }
          }
          if (pokemon.species) {
            if (typeof pokemon.species.getEggMoves === "function") {
              const res = pokemon.species.getEggMoves();
              if (res && Array.isArray(res) && res.length > 0) return res;
            }
            if (Array.isArray(pokemon.species.eggMoves) && pokemon.species.eggMoves.length > 0) {
              return pokemon.species.eggMoves;
            }
          }
        } catch (_) {
        }
      }
      if (PokeSkip.activeParty && Array.isArray(PokeSkip.activeParty)) {
        for (const p of PokeSkip.activeParty) {
          const pSid = Number(p?.species?.speciesId ?? p?.speciesId);
          if (pSid === targetNum) {
            try {
              if (typeof p.getEggMoves === "function") {
                const res = p.getEggMoves();
                if (res && Array.isArray(res) && res.length > 0) return res;
              }
              if (Array.isArray(p.eggMoves) && p.eggMoves.length > 0) return p.eggMoves;
              if (Array.isArray(p.compatibleEggMoves) && p.compatibleEggMoves.length > 0) return p.compatibleEggMoves;
              if (p.species) {
                if (typeof p.species.getEggMoves === "function") {
                  const res = p.species.getEggMoves();
                  if (res && Array.isArray(res) && res.length > 0) return res;
                }
                if (Array.isArray(p.species.eggMoves) && p.species.eggMoves.length > 0) {
                  return p.species.eggMoves;
                }
              }
            } catch (_) {
            }
          }
        }
      }
      try {
        const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        const scene = PokeSkip.scene || win.globalScene;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry || scene && scene.speciesDataRegistry || scene && scene.gameData && scene.gameData.speciesDataRegistry;
        if (sdr) {
          if (typeof sdr.getEggMoves === "function") {
            const res = sdr.getEggMoves(targetNum);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
          const sp2 = sdr.data ? sdr.data[targetNum] : typeof sdr.get === "function" ? sdr.get(targetNum) : null;
          if (sp2) {
            if (typeof sp2.getEggMoves === "function") {
              const res = sp2.getEggMoves();
              if (res && Array.isArray(res) && res.length > 0) return res;
            }
            if (Array.isArray(sp2.eggMoves) && sp2.eggMoves.length > 0) {
              return sp2.eggMoves;
            }
          }
        }
      } catch (_) {
      }
      let sp = pokemon?.species || (typeof pokemon?.getSpeciesForm === "function" ? pokemon.getSpeciesForm(true) : null);
      if (!sp && PokeSkip.activeParty && PokeSkip.activeParty.length > 0) {
        for (const p of PokeSkip.activeParty) {
          const cand = p?.species || (typeof p?.getSpeciesForm === "function" ? p.getSpeciesForm(true) : null);
          if (cand && (typeof cand.getEggMoves === "function" || cand.eggMoves)) {
            sp = cand;
            break;
          }
        }
      }
      if (sp) {
        try {
          const proto = Object.getPrototypeOf(sp);
          const superProto = proto ? Object.getPrototypeOf(proto) : null;
          if (superProto && typeof superProto.getEggMoves === "function") {
            const res = superProto.getEggMoves.call({ speciesId: targetNum });
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {
        }
        try {
          const proto = Object.getPrototypeOf(sp);
          if (proto && typeof proto.getEggMoves === "function") {
            const ctx = Object.create(proto);
            ctx.speciesId = targetNum;
            ctx.formIndex = 0;
            ctx.getFormKey = () => void 0;
            const res = proto.getEggMoves.call(ctx);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {
        }
        try {
          if (typeof sp.getEggMoves === "function") {
            const ctx = Object.create(sp);
            ctx.speciesId = targetNum;
            ctx.formIndex = 0;
            ctx.getFormKey = () => void 0;
            const res = sp.getEggMoves.call(ctx);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {
        }
      }
      try {
        const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        if (win.pokemonSpecies && Array.isArray(win.pokemonSpecies[targetNum]?.eggMoves)) {
          return win.pokemonSpecies[targetNum].eggMoves;
        }
        if (win.allSpecies && Array.isArray(win.allSpecies[targetNum]?.eggMoves)) {
          return win.allSpecies[targetNum].eggMoves;
        }
      } catch (_) {
      }
      return null;
    }
    const currentMovesRaw = getRawLevelMovesForSpecies(currentSpeciesId);
    if (currentMovesRaw && Array.isArray(currentMovesRaw)) {
      for (const entry of currentMovesRaw) {
        const lvl = entry[0];
        const moveId = entry[1];
        if (!seenMoveIds.has(moveId)) {
          seenMoveIds.add(moveId);
          moves.push(resolveMove(moveId, lvl > 0 ? lvl : lvl === 0 ? "\xC9volution" : "D\xE9part", null));
        }
      }
    }
    for (const evoId of lineage.futureEvoIds) {
      const evoMovesRaw = getRawLevelMovesForSpecies(evoId);
      if (evoMovesRaw && Array.isArray(evoMovesRaw)) {
        const evoName = LineageManager.getSpeciesName(evoId) || `\xC9volution #${evoId}`;
        for (const entry of evoMovesRaw) {
          const lvl = entry[0];
          const moveId = entry[1];
          if (!seenMoveIds.has(moveId)) {
            seenMoveIds.add(moveId);
            moves.push(resolveMove(moveId, lvl > 0 ? lvl : lvl === 0 ? "\xC9volution" : "D\xE9part", evoName));
          }
        }
      }
    }
    for (const otherId of lineage.otherMemberIds) {
      const otherMovesRaw = getRawLevelMovesForSpecies(otherId);
      if (otherMovesRaw && Array.isArray(otherMovesRaw)) {
        const otherName = LineageManager.getSpeciesName(otherId) || `Esp\xE8ce #${otherId}`;
        for (const entry of otherMovesRaw) {
          const lvl = entry[0];
          const moveId = entry[1];
          if (!seenMoveIds.has(moveId)) {
            seenMoveIds.add(moveId);
            moves.push(resolveMove(moveId, lvl > 0 ? lvl : lvl === 0 ? "\xC9volution" : "D\xE9part", otherName));
          }
        }
      }
    }
    const rootId = LineageManager.getRootId(pokemon);
    const eggSpeciesCandidates = [rootId, currentSpeciesId, ...lineage.allMembers || [], ...lineage.otherMemberIds || [], ...lineage.futureEvoIds || []];
    const checkedEggSpecies = /* @__PURE__ */ new Set();
    if (pokemon) {
      try {
        const directEggMoves = (typeof pokemon.getEggMoves === "function" ? pokemon.getEggMoves() : null) || (Array.isArray(pokemon.eggMoves) ? pokemon.eggMoves : null) || (Array.isArray(pokemon.compatibleEggMoves) ? pokemon.compatibleEggMoves : null);
        if (directEggMoves && Array.isArray(directEggMoves)) {
          for (const entry of directEggMoves) {
            const moveId = typeof entry === "object" && entry !== null ? Number(entry.moveId ?? entry.id ?? entry) : Number(entry);
            if (moveId && !isNaN(moveId) && moveId > 0 && !seenMoveIds.has(moveId)) {
              seenMoveIds.add(moveId);
              moves.push(resolveMove(moveId, "\u0152uf", null));
            }
          }
        }
      } catch (_) {
      }
    }
    for (const sid of eggSpeciesCandidates) {
      if (!sid || checkedEggSpecies.has(sid)) continue;
      checkedEggSpecies.add(sid);
      const eggMovesRaw = getRawEggMovesForSpecies(sid);
      if (eggMovesRaw && Array.isArray(eggMovesRaw)) {
        const sourceName = sid !== currentSpeciesId ? LineageManager.getSpeciesName(sid) : null;
        for (const entry of eggMovesRaw) {
          const moveId = typeof entry === "object" && entry !== null ? Number(entry.moveId ?? entry.id ?? entry) : Number(entry);
          if (moveId && !isNaN(moveId) && moveId > 0 && !seenMoveIds.has(moveId)) {
            seenMoveIds.add(moveId);
            moves.push(resolveMove(moveId, "\u0152uf", sourceName));
          }
        }
      }
    }
    const getLevelWeight = (lvl) => {
      if (typeof lvl === "number") {
        if (lvl < 0) return 0;
        if (lvl === 0) return 0.5;
        return lvl;
      }
      if (lvl === "D\xE9part") return 0;
      if (lvl === "\u0152uf") return 0.2;
      if (lvl === "\xC9volution") return 0.5;
      if (lvl === "Actuelle") return -1;
      return 999;
    };
    moves.sort((a, b) => {
      const wA = getLevelWeight(a.level);
      const wB = getLevelWeight(b.level);
      if (wA !== wB) return wA - wB;
      if (!a.evolutionSpecies && b.evolutionSpecies) return -1;
      if (a.evolutionSpecies && !b.evolutionSpecies) return 1;
      return a.name.localeCompare(b.name, "fr");
    });
    if (pokemon?.moveset && Array.isArray(pokemon.moveset)) {
      for (let i = pokemon.moveset.length - 1; i >= 0; i--) {
        const pm = pokemon.moveset[i];
        if (pm && pm.moveId && !seenMoveIds.has(pm.moveId)) {
          seenMoveIds.add(pm.moveId);
          const resolved = resolveMove(pm.moveId, "Actuelle", null);
          moves.unshift(resolved);
        }
      }
    }
    return moves;
  }

  // src/ui/tabs/team-tab.js
  var TeamTab = {
    refreshPartyFromGame() {
      PokeSkip.activeParty = [];
      try {
        if (PokeSkip.scene && PokeSkip.scene.party && Array.isArray(PokeSkip.scene.party)) {
          PokeSkip.activeParty = PokeSkip.scene.party.filter(Boolean);
        }
      } catch (e) {
        console.warn("[PokeSkip] Impossible de lire scene.party:", e);
      }
    },
    renderTeamTab() {
      const teamContainer = document.getElementById("pokeskip-team-selector");
      const contentContainer = document.getElementById("pokeskip-selected-pokemon-content");
      if (!teamContainer || !contentContainer) return;
      teamContainer.innerHTML = "";
      contentContainer.innerHTML = "";
      const party = PokeSkip.activeParty;
      if (!party || party.length === 0) {
        teamContainer.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: #94a3b8; background: #111a2e; border-radius: 12px;">
            \u26A0\uFE0F Aucune partie en cours d\xE9tect\xE9e ou \xE9quipe vide.<br>
            Lancez une partie dans Pok\xE9Rogue pour voir votre \xE9quipe active, ou utilisez l'onglet <b>"Esp\xE8ces M\xE9moris\xE9es"</b> !
          </div>
        `;
        return;
      }
      party.forEach((pkmn, idx) => {
        const familyInfo = LineageManager.getFamilyInfo(pkmn);
        const name = LineageManager.getPokemonDisplayName(pkmn);
        const level = pkmn.level || 1;
        const shinyInfo = LineageManager.getPokemonShinyInfo(pkmn);
        const isMega = LineageManager.isPokemonMega(pkmn);
        const spriteUrl = LineageManager.getPokemonSpriteUrl(pkmn);
        const card = document.createElement("div");
        card.className = `pokeskip-member-card ${idx === this.selectedTeamIndex ? "active" : ""}`;
        const speciesId = pkmn.species?.speciesId ?? pkmn.speciesId ?? LineageManager.getRootId(pkmn);
        const pkmVariant = shinyInfo.isShiny ? typeof pkmn.variant === "number" ? pkmn.variant : typeof pkmn.shinyTier === "number" ? Math.max(0, pkmn.shinyTier - 1) : 0 : 0;
        card.innerHTML = `
          ${shinyInfo.isShiny ? `<span class="pokeskip-shiny-badge ${shinyInfo.className}" title="${shinyInfo.title}">${shinyInfo.stars}</span>` : ""}
          <div class="pokeskip-member-sprite-container">
            <img src="${spriteUrl}" alt="${name}" class="pokeskip-member-sprite"
                 data-pokeskip-species="${speciesId}" data-pokeskip-shiny="${shinyInfo.isShiny}" data-pokeskip-variant="${pkmVariant}"
                 loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display:none; font-size: 24px;">\u26A1</div>
          </div>
          <div class="pokeskip-member-name">${name}</div>
          <div style="font-size: 11px; color: #94a3b8;">Niv. ${level}</div>
          ${isMega ? '<div class="pokeskip-mega-badge">\u{1F9EC} M\xC9GA</div>' : ""}
        `;
        card.addEventListener("click", () => {
          this.selectedTeamIndex = idx;
          this.renderTeamTab();
        });
        teamContainer.appendChild(card);
      });
      const MAX_PARTY_SLOTS = 6;
      for (let emptyIdx = party.length; emptyIdx < MAX_PARTY_SLOTS; emptyIdx++) {
        const emptyCard = document.createElement("div");
        emptyCard.className = "pokeskip-member-card empty-slot";
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
      const currentName = LineageManager.getPokemonDisplayName(pokemon);
      const shinyInfo = LineageManager.getPokemonShinyInfo(pokemon);
      const isMega = LineageManager.isPokemonMega(pokemon);
      const currentSpeciesId = pokemon.species?.speciesId ?? pokemon.speciesId ?? LineageManager.getRootId(pokemon);
      const memberSprites = LineageManager.getLineageMemberSprites(familyInfo.familyKey, shinyInfo.isShiny, pokemon);
      const rule = PokeSkip.getFamilyRule(familyInfo.familyKey) || { skippedMoves: {}, skipAll: false };
      const isRuleActive = PokeSkip.isFamilyRuleEnabled(familyInfo.familyKey);
      const learnable = getPokemonFullLearnset(pokemon);
      container.innerHTML = `
        <div class="pokeskip-lineage-header-box">
          <div class="pokeskip-lineage-title-row">
            <div class="pokeskip-lineage-title">
              <span>Lign\xE9e de <b>${currentName}</b></span>
              <span class="pokeskip-lineage-lvl">Niv. ${pokemon.level || 1}</span>
              ${shinyInfo.isShiny ? `<span class="pokeskip-shiny-badge ${shinyInfo.className}" style="position:static;" title="${shinyInfo.title}">${shinyInfo.stars}</span>` : ""}
              ${isMega ? '<span class="pokeskip-mega-badge">\u{1F9EC} M\xC9GA</span>' : ""}
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <label class="pokeskip-switch-label" title="Activer ou mettre en pause l'auto-skip pour cette lign\xE9e">
                <span class="pokeskip-switch-text ${isRuleActive ? "active" : ""}" id="pokeskip-lineage-switch-text">
                  ${isRuleActive ? "Param\xE9trage actif" : "Param\xE9trage en pause"}
                </span>
                <span class="pokeskip-switch">
                  <input type="checkbox" id="pokeskip-toggle-lineage-active" ${isRuleActive ? "checked" : ""}>
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
            <input type="text" id="pokeskip-move-filter" placeholder="Filtrer une attaque par nom ou esp\xE8ce..." style="background:#111a2e; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:7px 12px; color:#fff; font-size:13px; outline:none; flex:1;">
          </div>

          <div class="pokeskip-moves-container" id="pokeskip-moves-grid-el"></div>
        </div>
      `;
      const grid = container.querySelector("#pokeskip-moves-grid-el");
      const lineageToggleInput = container.querySelector("#pokeskip-toggle-lineage-active");
      const lineageToggleText = container.querySelector("#pokeskip-lineage-switch-text");
      const updateLineageToggle = () => {
        const active = PokeSkip.isFamilyRuleEnabled(familyInfo.familyKey);
        if (lineageToggleInput) lineageToggleInput.checked = active;
        if (lineageToggleText) {
          lineageToggleText.className = `pokeskip-switch-text ${active ? "active" : ""}`;
          lineageToggleText.textContent = active ? "Param\xE9trage actif" : "Param\xE9trage en pause";
        }
      };
      if (lineageToggleInput) {
        lineageToggleInput.addEventListener("change", () => {
          const isNowActive = PokeSkip.toggleFamilyRuleEnabled(familyInfo.familyKey);
          updateLineageToggle();
          if (isNowActive) {
            UI.showToast(`\u2705 Param\xE9trage r\xE9activ\xE9 pour <b>${currentName}</b>`, "success");
          } else {
            UI.showToast(`\u23F8\uFE0F Param\xE9trage mis en pause pour <b>${currentName}</b> (s\xE9lections conserv\xE9es)`, "info");
          }
        });
      }
      const renderGrid = (filter = "") => {
        grid.innerHTML = "";
        const currentRule = PokeSkip.getFamilyRule(familyInfo.familyKey) || { skippedMoves: {} };
        const filtered = learnable.filter((m) => {
          if (!filter) return true;
          const f = filter.toLowerCase();
          const isEggFilter = f.includes("oeuf") || f.includes("\u0153uf") || f.includes("egg");
          return m.name.toLowerCase().includes(f) || m.evolutionSpecies && m.evolutionSpecies.toLowerCase().includes(f) || isEggFilter && (m.level === "\u0152uf" || m.isEgg);
        });
        if (filtered.length === 0) {
          grid.innerHTML = `<div style="color: #64748b; font-size: 13px; text-align: center; padding: 20px;">Aucune capacit\xE9 trouv\xE9e.</div>`;
          return;
        }
        filtered.forEach((moveItem) => {
          const isEggMove = moveItem.isEgg || moveItem.level === "\u0152uf";
          const isSkipped = !isEggMove && PokeSkip.isMoveSkipped(pokemon, moveItem.name, moveItem.moveId);
          const isKept = !isSkipped;
          const isAutoReplacement = !isEggMove && PokeSkip.settings.advancedMode && PokeSkip.isMoveAutoReplacementTarget(pokemon, moveItem.name, moveItem.moveId);
          const isPromptSuppressed = isAutoReplacement || !isEggMove && PokeSkip.isMovePromptSuppressed(pokemon, moveItem.name, moveItem.moveId);
          const isSilenceDisabled = isAutoReplacement;
          const silenceTooltip = isAutoReplacement ? "Cette attaque remplace automatiquement une autre capacit\xE9 (Mode Avanc\xE9) : elle ne peut pas \xEAtre prompt\xE9e pour \xEAtre ignor\xE9e." : isPromptSuppressed ? "Ne plus demander d'ignorer cette attaque en combat (cliquer pour r\xE9activer le prompt)" : "Cliquer pour ne plus \xEAtre interrog\xE9 en combat pour ignorer cette attaque";
          const cardEl = document.createElement("div");
          cardEl.className = `pokeskip-move-card ${isSkipped ? "skipped" : ""}`;
          if (isEggMove) {
            cardEl.style.cursor = "default";
          }
          let lvlStyle = "";
          if (moveItem.level === "Actuelle") {
            lvlStyle = 'style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);"';
          } else if (moveItem.level === "\xC9volution") {
            lvlStyle = 'style="background: rgba(56, 189, 248, 0.18); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35);"';
          } else if (isEggMove) {
            lvlStyle = 'style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);"';
          }
          let lvlLabel = typeof moveItem.level === "number" ? `Niv. ${moveItem.level}` : moveItem.level;
          if (isEggMove) {
            lvlLabel = "\u{1F95A} \u0152uf";
          }
          cardEl.innerHTML = `
            <div class="pokeskip-move-action">
              ${isEggMove ? `
                <span class="pokeskip-egg-badge" title="Capacit\xE9 \u0153uf obtenue au d\xE9part : le jeu ne propose jamais de l'apprendre par mont\xE9e de niveau.">\u{1F95A} Capacit\xE9 \u0152uf</span>
              ` : `
                <label class="pokeskip-silence-label ${isAutoReplacement ? "disabled" : ""}" title="${silenceTooltip}">
                  <input type="checkbox" class="pokeskip-checkbox pokeskip-silence-checkbox" ${isPromptSuppressed ? "checked" : ""} ${isSilenceDisabled ? "disabled" : ""}>
                  <span class="pokeskip-silence-badge ${isPromptSuppressed ? "silenced" : ""} ${isAutoReplacement ? "auto" : ""}">${isAutoReplacement ? "\u{1F504} Remplacement auto" : "\u{1F515} Ne plus demander"}</span>
                </label>
                <div class="pokeskip-keep-action" title="${isKept ? "Attaque gard\xE9e (d\xE9cocher pour ignorer)" : "Attaque ignor\xE9e (cocher pour garder)"}">
                  <span class="pokeskip-keep-badge ${isKept ? "kept" : "skip"}">${isKept ? "\u2713 Gard\xE9e" : "\u2715 Ignor\xE9e"}</span>
                  <input type="checkbox" class="pokeskip-checkbox pokeskip-keep-checkbox" ${isKept ? "checked" : ""}>
                </div>
              `}
            </div>
            <div class="pokeskip-move-top">
              <div class="pokeskip-move-left">
                <span class="pokeskip-move-lvl-pill" ${lvlStyle}>${lvlLabel}</span>
                <span class="pokeskip-move-name-txt">${moveItem.name}</span>
                ${moveItem.evolutionSpecies ? `<span class="pokeskip-evo-tag" title="Capacit\xE9 apprise par ${moveItem.evolutionSpecies} dans cette lign\xE9e">\u{1F9EC} ${moveItem.evolutionSpecies}</span>` : ""}
                <span class="pokeskip-type-tag" style="background:${moveItem.type.bg}; color:${moveItem.type.color};">${moveItem.type.name}</span>
                <span class="pokeskip-cat-tag" style="color:${moveItem.category.color};">${moveItem.category.icon} ${moveItem.category.name}</span>
              </div>
              <div class="pokeskip-move-stats">
                <span class="pokeskip-stat-pill">\u2694\uFE0F Puissance : <b>${moveItem.power}</b></span>
                <span class="pokeskip-stat-pill" style="border-color: rgba(56, 189, 248, 0.3);">\u{1F3AF} Pr\xE9cision : <b style="color: #38bdf8;">${moveItem.accuracy}</b></span>
                <span class="pokeskip-stat-pill">\u{1F50B} PP : <b>${moveItem.pp}</b></span>
              </div>
            </div>
            ${moveItem.desc ? `<div class="pokeskip-move-desc">${moveItem.desc}</div>` : ""}
          `;
          if (!isEggMove) {
            const keepCheckbox = cardEl.querySelector(".pokeskip-keep-checkbox");
            const keepBadge = cardEl.querySelector(".pokeskip-keep-badge");
            const silenceCheckbox = cardEl.querySelector(".pokeskip-silence-checkbox");
            const silenceBadge = cardEl.querySelector(".pokeskip-silence-badge");
            const silenceLabel = cardEl.querySelector(".pokeskip-silence-label");
            const updateCardState = (kept) => {
              keepCheckbox.checked = kept;
              cardEl.classList.toggle("skipped", !kept);
              if (keepBadge) {
                keepBadge.className = `pokeskip-keep-badge ${kept ? "kept" : "skip"}`;
                keepBadge.textContent = kept ? "\u2713 Gard\xE9e" : "\u2715 Ignor\xE9e";
              }
              PokeSkip.setMoveSkipped(pokemon, currentName, moveItem.name, moveItem.moveId, !kept);
              UI.updateHudBadge();
              updateLineageToggle();
            };
            cardEl.addEventListener("click", (e) => {
              if (e.target.closest(".pokeskip-silence-label")) {
                return;
              }
              if (e.target !== keepCheckbox) {
                updateCardState(!keepCheckbox.checked);
              }
            });
            keepCheckbox.addEventListener("change", () => {
              updateCardState(keepCheckbox.checked);
            });
            if (silenceCheckbox && !isSilenceDisabled) {
              silenceCheckbox.addEventListener("change", (e) => {
                e.stopPropagation();
                const silenced = silenceCheckbox.checked;
                PokeSkip.setMovePromptSuppressed(pokemon, currentName, moveItem.name, moveItem.moveId, silenced);
                if (silenceBadge) {
                  silenceBadge.className = `pokeskip-silence-badge ${silenced ? "silenced" : ""}`;
                }
              });
            }
            if (silenceLabel) {
              silenceLabel.addEventListener("click", (e) => {
                e.stopPropagation();
              });
            }
          }
          grid.appendChild(cardEl);
        });
      };
      renderGrid();
      updateLineageToggle();
      const filterInput = container.querySelector("#pokeskip-move-filter");
      if (filterInput) {
        ["keydown", "keyup", "keypress"].forEach((type) => {
          filterInput.addEventListener(type, (e) => {
            e.stopPropagation();
            if (e.key === "Enter" && type === "keydown") {
              e.preventDefault();
            }
          });
        });
        filterInput.addEventListener("input", (e) => {
          renderGrid(e.target.value);
        });
      }
      this.isolateInputs(container);
      if (PokeSkip.settings.advancedMode) {
        const slotEl = container.querySelector("#pokeskip-pokemon-replacements-slot");
        if (slotEl) {
          const currentMoveset = typeof pokemon.getMoveset === "function" ? pokemon.getMoveset() : pokemon.moveset || [];
          const currentMoveNames = currentMoveset.map((m) => {
            if (!m) return "";
            if (typeof m.getName === "function") return m.getName();
            if (typeof m.getMove === "function") return m.getMove()?.name || "";
            return m.name || (m.moveId ? PokeSkip.knownMovesCache[m.moveId] : "") || "";
          }).filter(Boolean);
          const refreshReplacements = () => {
            slotEl.innerHTML = "";
            this.renderReplacementSection(slotEl, pokemon, learnable, currentMoveNames, refreshReplacements);
            renderGrid(container.querySelector("#pokeskip-move-filter").value);
          };
          refreshReplacements();
        }
      }
    }
  };

  // src/ui/tabs/saved-species-tab.js
  var SavedSpeciesTab = {
    renderSavedSpeciesTab() {
      const container = document.getElementById("pokeskip-saved-species-list");
      if (!container) return;
      container.innerHTML = "";
      const familyKeys = Object.keys(PokeSkip.rules);
      if (familyKeys.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #94a3b8; background: #111a2e; border-radius: 12px;">
            Aucune r\xE8gle m\xE9moris\xE9e pour le moment.<br>
            D\xE9cochez des attaques dans l'\xE9quipe actuelle pour les ignorer : elles resteront enregistr\xE9es pour toute la lign\xE9e !
          </div>
        `;
        return;
      }
      container.innerHTML = `
        <div style="margin-bottom: 12px; color: #94a3b8; font-size: 13px;">
          Retrouvez ici toutes les lign\xE9es d'esp\xE8ces configur\xE9es. Vos r\xE9glages s'appliquent automatiquement \xE0 tous leurs stades \xE9volutifs et formes, d'une partie \xE0 l'autre.
        </div>
      `;
      familyKeys.forEach((famKey) => {
        const rule = PokeSkip.rules[famKey];
        const skippedKeys = Object.keys(rule.skippedMoves || {}).filter((k) => !k.startsWith("id_"));
        const memberSprites = LineageManager.getLineageMemberSprites(famKey);
        let cardTitle = rule.lineageName;
        if (!cardTitle || cardTitle.startsWith("Esp\xE8ce #") || cardTitle.startsWith("Lign\xE9e #")) {
          const cleanId = String(rule.familyId || famKey).replace("family_", "");
          const resolved = LineageManager.getSpeciesName(cleanId);
          if (resolved) {
            cardTitle = resolved;
            if (LineageManager.megaFamilies[cleanId] && !cardTitle.includes("(M\xE9ga")) {
              cardTitle += ` ${LineageManager.megaFamilies[cleanId].suffix}`;
            }
            rule.lineageName = cardTitle;
          } else {
            cardTitle = rule.lineageName || `Lign\xE9e #${cleanId}`;
          }
        }
        const el = document.createElement("div");
        el.className = "pokeskip-saved-species-card";
        el.style.flexDirection = "column";
        el.style.alignItems = "stretch";
        el.style.gap = "12px";
        el.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="font-size: 16px; font-weight: 700; color: #fff;">${cardTitle}</div>
              ${rule.enabled === false ? `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">\u23F8\uFE0F En pause</span>` : ""}
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
              <button class="pokeskip-btn-edit-lineage" style="background:#0369a1; border:1px solid #38bdf8; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600; white-space:nowrap;">
                \u270F\uFE0F Modifier
              </button>
              <button class="pokeskip-btn-del-lineage" style="background:rgba(225,29,72,0.2); border:1px solid rgba(225,29,72,0.4); color:#fda4af; padding:6px 10px; border-radius:6px; font-size:12px; cursor:pointer; white-space:nowrap;" title="Supprimer la r\xE8gle">
                \u2715
              </button>
            </div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05);">
            ${LineageManager.renderEvolutionChainHtml(memberSprites, null, true)}
          </div>

          <div style="font-size: 12px; color: ${rule.enabled === false ? "#94a3b8" : "#38bdf8"};">
            ${skippedKeys.length > 0 ? `Capacit\xE9s ignor\xE9es (${skippedKeys.length}) : <b>${skippedKeys.join(", ")}</b>` : "<i>Aucune capacit\xE9 ignor\xE9e</i>"}
          </div>
        `;
        el.addEventListener("click", (e) => {
          if (e.target.closest(".pokeskip-btn-del-lineage")) {
            e.stopPropagation();
            if (confirm(`Supprimer les r\xE8gles enregistr\xE9es pour ${rule.lineageName} ?`)) {
              PokeSkip.deleteFamilyRule(famKey);
              this.renderSavedSpeciesTab();
              const singleName = LineageManager.getSinglePokemonName(famKey, rule);
              UI.showToast(`R\xE8gle supprim\xE9e pour <b>${singleName}</b>`, "info");
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
      const skippedList = Object.keys(rule.skippedMoves || {}).filter((k) => !k.startsWith("id_"));
      const teamIdx = PokeSkip.activeParty.findIndex((p) => LineageManager.getFamilyKey(p) === famKey);
      let editorTitle = rule.lineageName;
      if (!editorTitle || editorTitle.startsWith("Esp\xE8ce #") || editorTitle.startsWith("Lign\xE9e #")) {
        const rootId = String(rule.familyId || famKey).replace("family_", "");
        const resolved = LineageManager.getSpeciesName(rootId);
        if (resolved) {
          editorTitle = resolved;
          if (LineageManager.megaFamilies[rootId] && !editorTitle.includes("(M\xE9ga")) {
            editorTitle += ` ${LineageManager.megaFamilies[rootId].suffix}`;
          }
          rule.lineageName = editorTitle;
        } else {
          editorTitle = rule.lineageName || `Lign\xE9e #${rootId}`;
        }
      }
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <button id="pokeskip-btn-back-saved" style="background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.12); padding: 7px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              \u2190 Retour aux esp\xE8ces
            </button>
            ${teamIdx !== -1 ? `
              <button id="pokeskip-btn-open-in-team" style="background: #0284c7; color: #fff; border: 1px solid #38bdf8; padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600;">
                \u{1F465} Voir dans l'\xC9quipe Actuelle
              </button>
            ` : ""}
          </div>

          <div class="pokeskip-lineage-header-box">
            <div class="pokeskip-lineage-title-row">
              <div class="pokeskip-lineage-title">
                <span>Lign\xE9e : <b>${editorTitle}</b></span>
                ${rule.enabled === false ? `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">\u23F8\uFE0F En pause</span>` : ""}
              </div>
              <div style="font-size: 12px; color: #94a3b8;">
                Modifiez les capacit\xE9s ignor\xE9es pour toute la lign\xE9e (tous stades et formes).
              </div>
            </div>

            ${LineageManager.renderEvolutionChainHtml(memberSprites, null, true)}
          </div>

          <!-- Section Ajout rapide d'une attaque \xE0 ignorer -->
          <div style="background: #111a2e; padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); display: flex; gap: 10px; align-items: center;">
            <input type="text" id="pokeskip-input-add-move" placeholder="Ajouter une capacit\xE9 \xE0 ignorer (ex: Tornade, Charge)..." style="flex: 1; background: #090e1a; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 13px; outline: none;">
            <button id="pokeskip-btn-add-move" style="background: #e11d48; color: #fff; border: 1px solid #fda4af; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 600; white-space: nowrap;">
              + Ignorer
            </button>
          </div>

          <!-- Liste des capacit\xE9s ignor\xE9es -->
          <div style="background: #111a2e; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="font-size: 14px; font-weight: 700; color: #f8fafc;">
                Capacit\xE9s actuellement ignor\xE9es (${skippedList.length}) :
              </div>
              ${skippedList.length > 0 ? `
                <button id="pokeskip-btn-clear-lineage-moves" style="background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                  Tout r\xE9tablir (Ne rien ignorer)
                </button>
              ` : ""}
            </div>

            <div id="pokeskip-family-moves-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
              ${skippedList.length === 0 ? `
                <div style="color: #64748b; font-size: 13px; text-align: center; padding: 22px;">
                  Aucune capacit\xE9 n'est ignor\xE9e pour cette lign\xE9e.<br>Toutes les attaques propos\xE9es seront apprises ou pr\xE9sent\xE9es normalement.
                </div>
              ` : skippedList.map((mvKey) => {
        const displayName = mvKey.charAt(0).toUpperCase() + mvKey.slice(1);
        return `
                  <div style="background: #090e1a; border: 1px solid rgba(244,63,94,0.3); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="color: #f43f5e; font-weight: 700; font-size: 13px;">\u2715 Ignor\xE9e</span>
                      <span style="color: #fff; font-weight: 600; font-size: 14px;">${displayName}</span>
                    </div>
                    <button class="pokeskip-btn-unskip-move" data-move="${mvKey}" style="background: #10b981; color: #fff; border: 1px solid #34d399; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">
                      \u2713 Garder \xE0 nouveau
                    </button>
                  </div>
                `;
      }).join("")}
            </div>
          </div>
        </div>
      `;
      container.querySelector("#pokeskip-btn-back-saved").addEventListener("click", () => {
        this.renderSavedSpeciesTab();
      });
      const btnOpenTeam = container.querySelector("#pokeskip-btn-open-in-team");
      if (btnOpenTeam && teamIdx !== -1) {
        btnOpenTeam.addEventListener("click", () => {
          this.selectedTeamIndex = teamIdx;
          const tabBtn = document.querySelector('.pokeskip-tab-btn[data-tab="team"]');
          if (tabBtn) tabBtn.click();
        });
      }
      const singleName = LineageManager.getSinglePokemonName(famKey, rule);
      const inputAdd = container.querySelector("#pokeskip-input-add-move");
      const btnAdd = container.querySelector("#pokeskip-btn-add-move");
      const handleAdd = () => {
        const val = inputAdd.value.trim();
        if (!val) return;
        PokeSkip.setMoveSkipped(famKey, rule.lineageName, val, null, true);
        UI.showToast(`Capacit\xE9 <b>${val}</b> ignor\xE9e pour <b>${singleName}</b>`, "warning");
        this.renderFamilyRuleEditor(container, famKey);
      };
      btnAdd.addEventListener("click", handleAdd);
      if (inputAdd) {
        ["keydown", "keyup", "keypress"].forEach((type) => {
          inputAdd.addEventListener(type, (e) => {
            e.stopPropagation();
            if (e.key === "Enter" && type === "keydown") {
              e.preventDefault();
              handleAdd();
            }
          });
        });
      }
      this.isolateInputs(container);
      const btnClearAll = container.querySelector("#pokeskip-btn-clear-lineage-moves");
      if (btnClearAll) {
        btnClearAll.addEventListener("click", () => {
          rule.skippedMoves = {};
          rule.updatedAt = Date.now();
          PokeSkip.saveRules();
          UI.showToast(`Toutes les capacit\xE9s sont r\xE9tablies pour <b>${singleName}</b>`, "info");
          this.renderFamilyRuleEditor(container, famKey);
        });
      }
      container.querySelectorAll(".pokeskip-btn-unskip-move").forEach((btn) => {
        btn.addEventListener("click", () => {
          const moveKey = btn.dataset.move;
          delete rule.skippedMoves[moveKey];
          rule.updatedAt = Date.now();
          PokeSkip.saveRules();
          UI.showToast(`Capacit\xE9 <b>${moveKey}</b> r\xE9tablie pour <b>${singleName}</b>`, "success");
          this.renderFamilyRuleEditor(container, famKey);
        });
      });
      if (PokeSkip.settings.advancedMode) {
        const rootId = LineageManager.getRootId(famKey);
        const activePartyMember = teamIdx !== -1 ? PokeSkip.activeParty[teamIdx] : rootId ? { speciesId: rootId } : null;
        let partyCurrentMoves = [];
        let partyLearnable = [];
        if (activePartyMember) {
          const ms = typeof activePartyMember.getMoveset === "function" ? activePartyMember.getMoveset() : activePartyMember.moveset || [];
          partyCurrentMoves = ms.map((m) => {
            if (!m) return "";
            if (typeof m.getName === "function") return m.getName();
            if (typeof m.getMove === "function") return m.getMove()?.name || "";
            return m.name || "";
          }).filter(Boolean);
          partyLearnable = getPokemonFullLearnset(activePartyMember);
        }
        const repWrapper = document.createElement("div");
        container.firstElementChild.appendChild(repWrapper);
        const refreshReplacements = () => {
          repWrapper.innerHTML = "";
          this.renderReplacementSection(repWrapper, famKey, partyLearnable, partyCurrentMoves, refreshReplacements);
        };
        refreshReplacements();
      }
    }
  };

  // src/ui/tabs/replacements-tab.js
  var ReplacementsTab = {
    renderReplacementSection(container, target, defaultLearnable = [], defaultCurrent = [], onUpdate = null) {
      if (!PokeSkip.settings.advancedMode) return;
      const familyInfo = LineageManager.getFamilyInfo(target);
      const famKey = familyInfo.familyKey;
      const replacements = PokeSkip.getFamilyReplacements(target);
      const activeCount = replacements.filter((r) => r.enabled).length;
      const moveMap = /* @__PURE__ */ new Map();
      const getMoveLevelWeight = (lvl) => {
        if (typeof lvl === "number") {
          if (lvl < 0) return 0;
          if (lvl === 0) return 0.5;
          return lvl;
        }
        if (typeof lvl === "string") {
          const s = lvl.trim().toLowerCase();
          if (s.includes("d\xE9part") || s.includes("depart")) return 0;
          if (s.includes("\u0153uf") || s.includes("oeuf") || s.includes("egg")) return 0.2;
          if (s.includes("\xE9vol") || s.includes("evol")) return 0.5;
          if (s.includes("actuelle")) return 0.1;
          const match = s.match(/\d+/);
          if (match) return parseInt(match[0], 10);
        }
        return 999;
      };
      if (Array.isArray(defaultLearnable)) {
        for (const item of defaultLearnable) {
          if (!item) continue;
          const rawName = typeof item === "string" ? item : item.name;
          const name = (rawName || "").trim();
          if (!name) continue;
          const key = name.toLowerCase();
          const level = typeof item === "object" && item.level !== void 0 ? item.level : null;
          const weight = getMoveLevelWeight(level);
          const evolutionSpecies = typeof item === "object" && item.evolutionSpecies ? item.evolutionSpecies : null;
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
          const rawName = typeof item === "string" ? item : item.name;
          const name = (rawName || "").trim();
          if (!name) continue;
          const key = name.toLowerCase();
          if (moveMap.has(key)) {
            moveMap.get(key).isCurrent = true;
          } else {
            moveMap.set(key, { name, level: "Actuelle", isCurrent: true, weight: 0.1 });
          }
        }
      }
      const familyRule = PokeSkip.getFamilyRule(target);
      if (familyRule) {
        if (familyRule.skippedMoves) {
          for (const rawName of Object.keys(familyRule.skippedMoves)) {
            if (rawName.startsWith("id_")) continue;
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
      const sortedMoves = Array.from(moveMap.values()).sort((a, b) => {
        if (a.weight !== b.weight) {
          return a.weight - b.weight;
        }
        return a.name.localeCompare(b.name, "fr");
      });
      const formatOptionText = (m, showCurrentBadge = true) => {
        let prefix = "";
        if (m.level !== void 0 && m.level !== null && m.level !== "") {
          if (typeof m.level === "number") {
            if (m.level < 0) prefix = "[D\xE9part] ";
            else if (m.level === 0) prefix = "[\xC9volution] ";
            else prefix = `[Niv. ${m.level}] `;
          } else {
            const s = String(m.level).trim();
            if (/^\d+$/.test(s)) prefix = `[Niv. ${s}] `;
            else if (/œuf|oeuf|egg/i.test(s)) prefix = "[\u{1F95A} \u0152uf] ";
            else if (/évol/i.test(s)) prefix = "[\xC9volution] ";
            else if (/départ|depart/i.test(s)) prefix = "[D\xE9part] ";
            else if (/actuelle/i.test(s)) prefix = "[Actuelle] ";
            else prefix = `[${s}] `;
          }
        } else if (m.isCurrent && showCurrentBadge) {
          prefix = "[Actuelle] ";
        }
        const evoSuffix = m.evolutionSpecies ? ` (${m.evolutionSpecies})` : "";
        const suffix = m.isCurrent && showCurrentBadge && prefix !== "[Actuelle] " ? " (Actuelle)" : "";
        return `${prefix}${m.name}${evoSuffix}${suffix}`;
      };
      const uniqueRand = Math.random().toString(36).substring(2, 6);
      const newDatalistId = `datalist-new-${uniqueRand}`;
      const oldDatalistId = `datalist-old-${uniqueRand}`;
      const secEl = document.createElement("div");
      secEl.className = "pokeskip-replacement-section";
      secEl.style.cssText = "margin-top: 14px; background: #080e1e; border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 12px; padding: 14px;";
      secEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 15px;">\u26A1</span>
            <span style="font-size: 13px; font-weight: 700; color: #c084fc;">
              Mode Avanc\xE9 : Remplacement Automatique de Capacit\xE9s
            </span>
            <span style="font-size: 11px; background: rgba(168, 85, 247, 0.2); color: #d8b4fe; padding: 2px 7px; border-radius: 10px; font-weight: 600;">
              ${activeCount}/${replacements.length} active(s)
            </span>
          </div>
          ${replacements.length > 0 ? `
            <button class="pokeskip-btn-clear-rep" style="background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">
              \u{1F5D1}\uFE0F Tout supprimer (${replacements.length})
            </button>
          ` : ""}
        </div>

        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px; line-height: 1.4;">
          D\xE9finit les attaques \xE0 remplacer automatiquement : d\xE8s que la nouvelle capacit\xE9 est d\xE9bloqu\xE9e et que le Pok\xE9mon poss\xE8de 4 attaques, l'ancienne est remplac\xE9e sans interrompre le jeu.
        </div>

        <!-- Formulaire d'ajout : Ancienne attaque d'abord, puis Nouvelle attaque -->
        <div style="background: #111a2e; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 12px;">
          <div style="font-size: 12px; font-weight: 600; color: #f8fafc; margin-bottom: 8px;">
            \u2795 Ajouter une r\xE8gle de remplacement :
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 170px;">
              <div style="font-size: 11px; color: #f43f5e; font-weight: 600; margin-bottom: 3px;">Toujours remplacer :</div>
              <input type="text" class="pokeskip-rep-input-old" list="${oldDatalistId}" placeholder="Ancienne capacit\xE9..." style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 6px; padding: 6px 10px; color: #fff; font-size: 12px; outline: none;">
              <datalist id="${oldDatalistId}">
                ${sortedMoves.map((m) => `<option value="${formatOptionText(m, true)}" label="${formatOptionText(m, true)}">`).join("")}
              </datalist>
            </div>

            <div style="color: #c084fc; font-weight: bold; font-size: 14px; padding-top: 16px; white-space: nowrap;">\u2794 par \u2794</div>

            <div style="flex: 1; min-width: 170px;">
              <div style="font-size: 11px; color: #38bdf8; font-weight: 600; margin-bottom: 3px;">Par la nouvelle :</div>
              <input type="text" class="pokeskip-rep-input-new" list="${newDatalistId}" placeholder="Nouvelle capacit\xE9..." style="width: 100%; box-sizing: border-box; background: #090e1a; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 6px 10px; color: #fff; font-size: 12px; outline: none;">
              <datalist id="${newDatalistId}">
                ${sortedMoves.map((m) => `<option value="${formatOptionText(m, false)}" label="${formatOptionText(m, false)}">`).join("")}
              </datalist>
            </div>

            <div style="padding-top: 16px;">
              <button class="pokeskip-btn-add-rep" style="background: #7e22ce; color: #fff; border: 1px solid #c084fc; padding: 7px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                + Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des r\xE8gles -->
        <div class="pokeskip-rep-list-container" style="display: flex; flex-direction: column; gap: 6px;">
          ${replacements.length === 0 ? `
            <div style="color: #64748b; font-size: 12px; text-align: center; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 6px;">
              Aucune r\xE8gle de remplacement pour <b>${familyInfo.lineageName}</b>.<br>
              Cr\xE9ez une r\xE8gle ci-dessus pour remplacer automatiquement une ancienne attaque d\xE8s le d\xE9blocage d'une nouvelle.
            </div>
          ` : replacements.map((r) => `
            <div style="background: #111a2e; border: 1px solid ${r.enabled ? "rgba(168, 85, 247, 0.35)" : "rgba(255, 255, 255, 0.08)"}; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; opacity: ${r.enabled ? "1" : "0.6"};">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 12px; color: #94a3b8;">Toujours remplacer</span>
                <span style="font-weight: 700; color: #f43f5e; font-size: 13px;">${r.oldMoveName}</span>
                <span style="color: #a855f7; font-size: 12px; font-weight: bold;">\u2794 par \u2794</span>
                <span style="font-weight: 700; color: #38bdf8; font-size: 13px;">${r.newMoveName}</span>
                <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${r.enabled ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.06)"}; color: ${r.enabled ? "#c084fc" : "#94a3b8"};">
                  ${r.enabled ? "Active" : "D\xE9sactiv\xE9e"}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button class="pokeskip-btn-toggle-single-rep" data-id="${r.id}" style="background: ${r.enabled ? "#334155" : "#7e22ce"}; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                  ${r.enabled ? "D\xE9sactiver" : "Activer"}
                </button>
                <button class="pokeskip-btn-delete-single-rep" data-id="${r.id}" style="background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;" title="Supprimer cette r\xE8gle">
                  \u{1F5D1}\uFE0F
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      `;
      container.appendChild(secEl);
      const inputOld = secEl.querySelector(".pokeskip-rep-input-old");
      const inputNew = secEl.querySelector(".pokeskip-rep-input-new");
      const btnAdd = secEl.querySelector(".pokeskip-btn-add-rep");
      const cleanMoveName = (raw) => {
        if (!raw) return "";
        return String(raw).replace(/^\[.*?\]\s*/, "").replace(/\s*\(.*?\)$/, "").trim();
      };
      const handleAdd = () => {
        const rawOld = inputOld?.value.trim();
        const rawNew = inputNew?.value.trim();
        const oldM = cleanMoveName(rawOld);
        const newM = cleanMoveName(rawNew);
        if (!oldM || !newM) {
          UI.showToast("Veuillez renseigner l'ancienne capacit\xE9 \xE0 remplacer et la nouvelle capacit\xE9.", "warning");
          return;
        }
        if (newM.toLowerCase() === oldM.toLowerCase()) {
          UI.showToast("La nouvelle capacit\xE9 et l'ancienne doivent \xEAtre diff\xE9rentes.", "warning");
          return;
        }
        const findMoveId = (mName) => {
          const norm = mName.trim().toLowerCase();
          if (Array.isArray(defaultCurrent)) {
            const found = defaultCurrent.find((m) => m && typeof m === "object" && (m.name || "").trim().toLowerCase() === norm);
            if (found && (found.moveId || found.id)) return found.moveId || found.id;
          }
          if (Array.isArray(defaultLearnable)) {
            const found = defaultLearnable.find((m) => m && typeof m === "object" && (m.name || "").trim().toLowerCase() === norm);
            if (found && (found.moveId || found.id)) return found.moveId || found.id;
          }
          if (PokeSkip.knownMovesCache) {
            for (const [idStr, name] of Object.entries(PokeSkip.knownMovesCache)) {
              if (name && name.trim().toLowerCase() === norm) return Number(idStr);
            }
          }
          return LineageManager.findMoveIdByName ? LineageManager.findMoveIdByName(mName) : null;
        };
        const oldId = findMoveId(oldM);
        const newId = findMoveId(newM);
        PokeSkip.addReplacementRule(target, newM, oldM, newId, oldId);
        PokeSkip.setMoveSkipped(target, null, newM, newId, false);
        const resolveMoveInfo = (moveName) => {
          if (!moveName) return { name: "", type: null, category: null };
          const lower = moveName.trim().toLowerCase();
          if (Array.isArray(defaultLearnable)) {
            const found = defaultLearnable.find((m) => m && m.name && m.name.trim().toLowerCase() === lower);
            if (found) {
              return {
                name: found.name || moveName,
                type: found.type || null,
                category: found.category || null
              };
            }
          }
          let foundId = null;
          if (PokeSkip.knownMovesCache) {
            for (const [idStr, mName] of Object.entries(PokeSkip.knownMovesCache)) {
              if (mName && mName.trim().toLowerCase() === lower) {
                foundId = Number(idStr);
                break;
              }
            }
          }
          const pokemonRef = target && typeof target === "object" ? target : null;
          return LineageManager.getMoveDetails(moveName, foundId, pokemonRef);
        };
        const oldMoveDetails = resolveMoveInfo(oldM);
        const newMoveDetails = resolveMoveInfo(newM);
        const getMoveTypeColor = (m) => m && m.type && m.type.bg ? m.type.name === "Combat" ? "#ea580c" : m.type.name === "T\xE9n\xE8bres" ? "#c4a482" : m.type.name === "Poison" ? "#a855f7" : m.type.bg : "#38bdf8";
        const oldTypeColor = getMoveTypeColor(oldMoveDetails);
        const newTypeColor = getMoveTypeColor(newMoveDetails);
        const oldCatIcon = oldMoveDetails?.category?.icon || "\u{1F300}";
        const newCatIcon = newMoveDetails?.category?.icon || "\u{1F4A5}";
        const oldTooltip = [oldMoveDetails?.type?.name, oldMoveDetails?.category?.name].filter(Boolean).join(" \u2022 ");
        const newTooltip = [newMoveDetails?.type?.name, newMoveDetails?.category?.name].filter(Boolean).join(" \u2022 ");
        const pokemonName = LineageManager.getSinglePokemonName(target);
        UI.showToast(
          `\u26A1 R\xE8gle enregistr\xE9e : remplacer <span title="${oldTooltip}">${oldCatIcon} <b style="color: ${oldTypeColor} !important;">${oldMoveDetails.name || oldM}</b></span> par <span title="${newTooltip}">${newCatIcon} <b style="color: ${newTypeColor} !important;">${newMoveDetails.name || newM}</b></span> sur <b style="color: #38bdf8 !important;">${pokemonName}</b> !`,
          "advanced",
          PokeSkip.settings.toastDuration || 2800
        );
        if (typeof onUpdate === "function") {
          onUpdate();
        }
      };
      btnAdd?.addEventListener("click", handleAdd);
      const isolateRepInput = (inp, onEnter) => {
        if (!inp) return;
        ["keydown", "keyup", "keypress"].forEach((type) => {
          inp.addEventListener(type, (e) => {
            e.stopPropagation();
            if (e.key === "Enter" && type === "keydown") {
              e.preventDefault();
              if (typeof onEnter === "function") onEnter();
            }
          });
        });
      };
      isolateRepInput(inputOld, () => {
        if (!inputNew?.value.trim()) {
          inputNew?.focus();
          try {
            if (typeof inputNew.showPicker === "function") inputNew.showPicker();
          } catch (err) {
          }
        } else {
          handleAdd();
        }
      });
      isolateRepInput(inputNew, () => {
        handleAdd();
      });
      inputOld?.addEventListener("click", () => {
        try {
          if (typeof inputOld.showPicker === "function") inputOld.showPicker();
        } catch (err) {
        }
      });
      inputNew?.addEventListener("click", () => {
        try {
          if (typeof inputNew.showPicker === "function") inputNew.showPicker();
        } catch (err) {
        }
      });
      this.isolateInputs(secEl);
      secEl.querySelectorAll(".pokeskip-btn-toggle-single-rep").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ruleId = btn.getAttribute("data-id");
          PokeSkip.toggleReplacementRule(target, ruleId);
          if (typeof onUpdate === "function") onUpdate();
        });
      });
      secEl.querySelectorAll(".pokeskip-btn-delete-single-rep").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ruleId = btn.getAttribute("data-id");
          PokeSkip.deleteReplacementRule(target, ruleId);
          UI.showToast("R\xE8gle de remplacement supprim\xE9e.", "info");
          if (typeof onUpdate === "function") onUpdate();
        });
      });
      const btnClear = secEl.querySelector(".pokeskip-btn-clear-rep");
      if (btnClear) {
        btnClear.addEventListener("click", () => {
          if (confirm(`Supprimer toutes les r\xE8gles de remplacement pour ${familyInfo.lineageName} ?`)) {
            PokeSkip.clearAllReplacements(target);
            const targetName = LineageManager.getSinglePokemonName(target);
            UI.showToast(`Toutes les r\xE8gles de remplacement supprim\xE9es pour <b>${targetName}</b>.`, "info");
            if (typeof onUpdate === "function") onUpdate();
          }
        });
      }
    }
  };

  // src/ui/quick-prompt.js
  var QuickPrompt = {
    dismissQuickSkipPrompt() {
      const el = document.getElementById("pokeskip-quick-prompt");
      if (el && el.parentNode) {
        el.style.opacity = "0";
        el.style.transform = "translate(-50%, -15px)";
        el.style.transition = "all 0.2s ease";
        setTimeout(() => {
          if (el && el.parentNode) el.remove();
        }, 200);
      }
      if (typeof UI?.enableGameKeyboard === "function" && !UI.isModalOpen()) {
        UI.enableGameKeyboard();
      }
    },
    showQuickSkipPrompt(arg1, arg2, arg3) {
      if (!document.body) return;
      let phaseInstance, pokemon, move;
      if (arg1 && typeof arg1.end === "function") {
        phaseInstance = arg1;
        pokemon = arg2;
        move = arg3;
      } else if (arg3 && typeof arg3.end === "function") {
        pokemon = arg1;
        move = arg2;
        phaseInstance = arg3;
      } else if (arg1?.species || arg1?.speciesId) {
        pokemon = arg1;
        move = arg2;
        phaseInstance = arg3;
      } else {
        phaseInstance = arg1;
        pokemon = arg2;
        move = arg3;
      }
      if (document.getElementById("pokeskip-quick-prompt")) {
        document.getElementById("pokeskip-quick-prompt").remove();
      }
      const pokemonName = LineageManager.getCurrentFormName(pokemon);
      const moveDetails = LineageManager.getMoveDetails(move, phaseInstance?.moveId, pokemon);
      const moveName = moveDetails?.name || move?.name || (phaseInstance?.moveId !== void 0 ? LineageManager.getMoveName(phaseInstance.moveId) : "Capacit\xE9");
      const finalMoveId = phaseInstance?.moveId ?? moveDetails?.moveId ?? move?.id;
      if (PokeSkip.isMovePromptSuppressed(pokemon, moveName, finalMoveId)) {
        return;
      }
      const typeColor = moveDetails?.type && moveDetails.type.bg ? moveDetails.type.name === "Combat" ? "#ea580c" : moveDetails.type.name === "T\xE9n\xE8bres" ? "#c4a482" : moveDetails.type.name === "Poison" ? "#a855f7" : moveDetails.type.bg : "#38bdf8";
      const catIcon = moveDetails?.category?.icon || "\u{1F300}";
      const catName = moveDetails?.category?.name || "";
      const typeName = moveDetails?.type?.name || "";
      const tooltip = [typeName, catName].filter(Boolean).join(" \u2022 ");
      const el = document.createElement("div");
      el.id = "pokeskip-quick-prompt";
      el.innerHTML = `
        <span class="pokeskip-quick-text">\u26A1 Ignorer <span title="${tooltip}">${catIcon} <b style="color: ${typeColor} !important;">${moveName}</b></span> sur <b>${pokemonName}</b> ?</span>
        <button class="pokeskip-quick-btn" id="pokeskip-quick-skip-always">Toujours ignorer</button>
        <button class="pokeskip-quick-btn pokeskip-quick-btn-secondary" id="pokeskip-quick-never-ask" title="Ne plus proposer d'ignorer cette attaque pour ce Pok\xE9mon">Ne plus demander</button>
        <button class="pokeskip-quick-close" id="pokeskip-quick-close" title="Fermer">&times;</button>
      `;
      document.body.appendChild(el);
      const dismiss = () => {
        this.dismissQuickSkipPrompt();
      };
      el.querySelector("#pokeskip-quick-close").addEventListener("click", (e) => {
        e.stopPropagation();
        dismiss();
      });
      el.querySelector("#pokeskip-quick-never-ask").addEventListener("click", (e) => {
        e.stopPropagation();
        PokeSkip.setMovePromptSuppressed(pokemon, pokemon?.species?.name, moveName, finalMoveId, true);
        UI.showToast(`\u2139\uFE0F Vous ne serez plus interrog\xE9 pour <b>${moveName}</b> sur <b>${pokemonName}</b>.`, "info");
        dismiss();
        if (UI.isModalOpen()) {
          const teamBody = document.getElementById("pokeskip-body-team");
          if (teamBody && teamBody.style.display !== "none" && typeof UI.renderTeamTab === "function") {
            UI.renderTeamTab();
          }
        }
      });
      el.querySelector("#pokeskip-quick-skip-always").addEventListener("click", (e) => {
        e.stopPropagation();
        PokeSkip.setMoveSkipped(pokemon, pokemon?.species?.name, moveName, finalMoveId, true);
        PokeSkip.recordSkip();
        UI.showToast(`\u2705 R\xE8gle enregistr\xE9e : <b>${pokemonName}</b> ignorera <span title="${tooltip}">${catIcon} <b style="color: ${typeColor} !important;">${moveName}</b></span> !`, "success");
        dismiss();
        if (phaseInstance) {
          phaseInstance._pokeskipIgnored = true;
        }
        const scene = phaseInstance?.scene || PokeSkip.scene || window.globalScene;
        const pm = scene?.phaseManager;
        const currentPhase = pm ? typeof pm.getCurrentPhase === "function" ? pm.getCurrentPhase() : pm.currentPhase : null;
        const ui = scene?.ui;
        const currentMode = ui ? typeof ui.getMode === "function" ? ui.getMode() : ui.mode : null;
        const isConfirmOrSummaryActive = currentMode === 14 || currentMode === 9;
        let isOtherNatureMessage = false;
        try {
          const msgHandler = typeof ui?.getMessageHandler === "function" ? ui.getMessageHandler() : null;
          const currentText = msgHandler?.message?.text || "";
          if (currentText && moveName && !currentText.includes(moveName)) {
            isOtherNatureMessage = true;
          }
        } catch (err) {
        }
        if (isConfirmOrSummaryActive && ui) {
          try {
            const handler = typeof ui.getHandler === "function" ? ui.getHandler() : null;
            if (handler && typeof handler.clear === "function") handler.clear();
            if (ui.handlers && ui.handlers[14] && typeof ui.handlers[14].clear === "function") {
              ui.handlers[14].clear();
            }
          } catch (err) {
          }
          const targetMode = phaseInstance?.messageMode ?? 0;
          let ended = false;
          const safeEnd = () => {
            if (ended) return;
            ended = true;
            try {
              if (phaseInstance && typeof phaseInstance.end === "function") {
                phaseInstance.end();
              }
            } catch (err) {
              console.warn("[PokeSkip] Erreur cl\xF4ture phase:", err);
            }
          };
          if (typeof ui.setMode === "function") {
            try {
              ui.setMode(targetMode).then(safeEnd).catch(safeEnd);
              setTimeout(safeEnd, 150);
            } catch (err) {
              safeEnd();
            }
          } else {
            safeEnd();
          }
        } else if (!isOtherNatureMessage && (!currentPhase || currentPhase === phaseInstance || currentPhase.phaseName === "LearnMovePhase")) {
          try {
            if (phaseInstance && typeof phaseInstance.end === "function") {
              phaseInstance.end();
            }
          } catch (err) {
            console.warn("[PokeSkip] Erreur cl\xF4ture phase:", err);
          }
        }
      });
      const durationSec = Math.max(3, PokeSkip.settings.quickPromptDuration || 15);
      setTimeout(() => {
        dismiss();
      }, durationSec * 1e3);
    }
  };

  // src/ui/index.js
  var UI = {
    hudContainer: null,
    modalContainer: null,
    toastContainer: null,
    quickActionElement: null,
    selectedTeamIndex: 0,
    isModalOpen() {
      const modalActive = this.modalContainer && this.modalContainer.classList.contains("active");
      const typeChartActive = this.typeChartContainer && this.typeChartContainer.style.display === "flex";
      return Boolean(modalActive || typeChartActive);
    },
    disableGameKeyboard,
    enableGameKeyboard,
    isolateInputs,
    init() {
      PokeSkip.onStatsChanged = () => this.updateHudBadge();
      this.injectStyles();
      this.createToastContainer();
      this.createHudButton();
      this.createModal();
      this.bindHotkeys();
    },
    injectStyles() {
      const style = document.createElement("style");
      style.id = "pokeskip-styles";
      style.textContent = styles_default;
      document.head.appendChild(style);
    },
    // Toast
    ...Toast,
    // HUD
    ...Hud,
    // Modal
    ...Modal,
    // Type Chart
    ...TypeChart,
    // Hotkeys
    ...Hotkeys,
    // Tabs & Views
    ...TeamTab,
    ...SavedSpeciesTab,
    ...ReplacementsTab,
    ...SettingsTab,
    // Quick Prompt
    ...QuickPrompt
  };

  // src/index.js
  (function() {
    "use strict";
    if (window.__POKESKIP_INJECTED__) {
      console.log("[Pok\xE9Skip] Le plugin est d\xE9j\xE0 actif sur cette page !");
      return;
    }
    window.__POKESKIP_INJECTED__ = true;
    window.PokeSkip = PokeSkip;
    window.PokeSkipUI = UI;
    AssetLoader.init();
    LineageManager.init();
    function isPokerogueEnvironment() {
      if (document.getElementById("demo-team-tabs") || document.getElementById("demo-stats-counter")) {
        return false;
      }
      const host = (window.location.hostname || "").toLowerCase();
      const href = (window.location.href || "").toLowerCase();
      const title = (document.title || "").toLowerCase();
      if (host === "pokerogue.net" || host.endsWith(".pokerogue.net")) {
        return true;
      }
      if (host.includes("google.") || host.includes("bing.") || host.includes("duckduckgo.") || host.includes("github.com")) {
        return false;
      }
      if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
        if (title.includes("pokerogue")) return true;
        const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        if (win.Phaser || document.querySelector("#app canvas")) return true;
        return false;
      }
      if (typeof window !== "undefined" && (window.__TAURI__ || window.__TAURI_INTERNALS__)) {
        return true;
      }
      if (host.includes("pokerogue")) {
        return true;
      }
      if (href.includes("pokerogue") && title.includes("pokerogue")) {
        return true;
      }
      return false;
    }
    let pokeSkipStarted = false;
    function startPokeSkip() {
      if (pokeSkipStarted) return;
      pokeSkipStarted = true;
      UI.init();
      initGameHook();
    }
    function setupAutoDetection() {
      if (isPokerogueEnvironment()) {
        startPokeSkip();
        return;
      }
      const host = (window.location.hostname || "").toLowerCase();
      if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
        let attempts = 0;
        const maxAttempts = 8;
        const checkInterval = setInterval(() => {
          attempts++;
          if (isPokerogueEnvironment()) {
            clearInterval(checkInterval);
            startPokeSkip();
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
          }
        }, 1e3);
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setupAutoDetection();
      });
    } else {
      setupAutoDetection();
    }
  })();
})();
