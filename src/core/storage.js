// Cross-browser Storage wrapper (Tampermonkey GM storage + localStorage fallback)
export const PokeStorage = {
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

export { PokeStorage as Storage };
