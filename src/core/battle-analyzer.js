// Détection des types des Pokémon ennemis en combat (simple ou double)
import { PokeSkip } from './state.js';
import { POKEMON_TYPES, TYPE_CHART } from '../constants/types.js';

export   function getActiveEnemyTypes() {
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
