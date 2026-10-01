// Résolution complète des capacités futures et actuelles de la lignée
import { PokeSkip } from './state.js';
import { LineageManager } from './lineage-manager.js';
import { POKEMON_TYPES, MOVE_CATEGORIES } from '../constants/types.js';

export   function getPokemonFullLearnset(pokemon) {
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
        evolutionSpecies: evolutionSpecies || null,
        isEgg: level === 'Œuf'
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

    function getRawEggMovesForSpecies(targetSpeciesId) {
      if (!targetSpeciesId) return null;
      const targetNum = Number(targetSpeciesId);
      if (!targetNum) return null;

      // 1. Si espèce courante, tenter les méthodes et propriétés directes du Pokémon
      if (targetNum === currentSpeciesId && pokemon) {
        try {
          if (typeof pokemon.getEggMoves === 'function') {
            const res = pokemon.getEggMoves();
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
          if (Array.isArray(pokemon.eggMoves) && pokemon.eggMoves.length > 0) {
            return pokemon.eggMoves;
          }
          if (Array.isArray(pokemon.compatibleEggMoves) && pokemon.compatibleEggMoves.length > 0) {
            return pokemon.compatibleEggMoves;
          }
          if (typeof pokemon.getSpeciesForm === 'function') {
            const sf = pokemon.getSpeciesForm(true);
            if (sf) {
              if (typeof sf.getEggMoves === 'function') {
                const res = sf.getEggMoves();
                if (res && Array.isArray(res) && res.length > 0) return res;
              }
              if (Array.isArray(sf.eggMoves) && sf.eggMoves.length > 0) {
                return sf.eggMoves;
              }
            }
          }
          if (pokemon.species) {
            if (typeof pokemon.species.getEggMoves === 'function') {
              const res = pokemon.species.getEggMoves();
              if (res && Array.isArray(res) && res.length > 0) return res;
            }
            if (Array.isArray(pokemon.species.eggMoves) && pokemon.species.eggMoves.length > 0) {
              return pokemon.species.eggMoves;
            }
          }
        } catch (_) {}
      }

      // 2. Recherche dans l'équipe active
      if (PokeSkip.activeParty && Array.isArray(PokeSkip.activeParty)) {
        for (const p of PokeSkip.activeParty) {
          const pSid = Number(p?.species?.speciesId ?? p?.speciesId);
          if (pSid === targetNum) {
            try {
              if (typeof p.getEggMoves === 'function') {
                const res = p.getEggMoves();
                if (res && Array.isArray(res) && res.length > 0) return res;
              }
              if (Array.isArray(p.eggMoves) && p.eggMoves.length > 0) return p.eggMoves;
              if (Array.isArray(p.compatibleEggMoves) && p.compatibleEggMoves.length > 0) return p.compatibleEggMoves;
              if (p.species) {
                if (typeof p.species.getEggMoves === 'function') {
                  const res = p.species.getEggMoves();
                  if (res && Array.isArray(res) && res.length > 0) return res;
                }
                if (Array.isArray(p.species.eggMoves) && p.species.eggMoves.length > 0) {
                  return p.species.eggMoves;
                }
              }
            } catch (_) {}
          }
        }
      }

      // 3. Tenter via le speciesDataRegistry du jeu
      try {
        const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
        const scene = PokeSkip.scene || win.globalScene;
        const sdr = win.speciesDataRegistry || win.globalSpeciesDataRegistry
                    || (scene && scene.speciesDataRegistry)
                    || (scene && scene.gameData && scene.gameData.speciesDataRegistry);
        if (sdr) {
          if (typeof sdr.getEggMoves === 'function') {
            const res = sdr.getEggMoves(targetNum);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
          const sp = sdr.data ? sdr.data[targetNum] : (typeof sdr.get === 'function' ? sdr.get(targetNum) : null);
          if (sp) {
            if (typeof sp.getEggMoves === 'function') {
              const res = sp.getEggMoves();
              if (res && Array.isArray(res) && res.length > 0) return res;
            }
            if (Array.isArray(sp.eggMoves) && sp.eggMoves.length > 0) {
              return sp.eggMoves;
            }
          }
        }
      } catch (_) {}

      // 4. Invoquer getEggMoves via prototypes d'espèces si disponibles
      let sp = pokemon?.species || (typeof pokemon?.getSpeciesForm === 'function' ? pokemon.getSpeciesForm(true) : null);
      if (!sp && PokeSkip.activeParty && PokeSkip.activeParty.length > 0) {
        for (const p of PokeSkip.activeParty) {
          const cand = p?.species || (typeof p?.getSpeciesForm === 'function' ? p.getSpeciesForm(true) : null);
          if (cand && (typeof cand.getEggMoves === 'function' || cand.eggMoves)) {
            sp = cand;
            break;
          }
        }
      }

      if (sp) {
        try {
          const proto = Object.getPrototypeOf(sp);
          const superProto = proto ? Object.getPrototypeOf(proto) : null;
          if (superProto && typeof superProto.getEggMoves === 'function') {
            const res = superProto.getEggMoves.call({ speciesId: targetNum });
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {}

        try {
          const proto = Object.getPrototypeOf(sp);
          if (proto && typeof proto.getEggMoves === 'function') {
            const ctx = Object.create(proto);
            ctx.speciesId = targetNum;
            ctx.formIndex = 0;
            ctx.getFormKey = () => undefined;
            const res = proto.getEggMoves.call(ctx);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {}

        try {
          if (typeof sp.getEggMoves === 'function') {
            const ctx = Object.create(sp);
            ctx.speciesId = targetNum;
            ctx.formIndex = 0;
            ctx.getFormKey = () => undefined;
            const res = sp.getEggMoves.call(ctx);
            if (res && Array.isArray(res) && res.length > 0) return res;
          }
        } catch (_) {}
      }

      // 5. Registres ou dictionnaires globaux possibles
      try {
        const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
        if (win.pokemonSpecies && Array.isArray(win.pokemonSpecies[targetNum]?.eggMoves)) {
          return win.pokemonSpecies[targetNum].eggMoves;
        }
        if (win.allSpecies && Array.isArray(win.allSpecies[targetNum]?.eggMoves)) {
          return win.allSpecies[targetNum].eggMoves;
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

    // 4. Récupérer les capacités œuf de toute la lignée (racine, espèce courante, et autres membres)
    const rootId = LineageManager.getRootId(pokemon);
    const eggSpeciesCandidates = [rootId, currentSpeciesId, ...(lineage.allMembers || []), ...(lineage.otherMemberIds || []), ...(lineage.futureEvoIds || [])];
    const checkedEggSpecies = new Set();

    if (pokemon) {
      try {
        const directEggMoves = (typeof pokemon.getEggMoves === 'function' ? pokemon.getEggMoves() : null)
          || (Array.isArray(pokemon.eggMoves) ? pokemon.eggMoves : null)
          || (Array.isArray(pokemon.compatibleEggMoves) ? pokemon.compatibleEggMoves : null);
        if (directEggMoves && Array.isArray(directEggMoves)) {
          for (const entry of directEggMoves) {
            const moveId = (typeof entry === 'object' && entry !== null) ? Number(entry.moveId ?? entry.id ?? entry) : Number(entry);
            if (moveId && !isNaN(moveId) && moveId > 0 && !seenMoveIds.has(moveId)) {
              seenMoveIds.add(moveId);
              moves.push(resolveMove(moveId, 'Œuf', null));
            }
          }
        }
      } catch (_) {}
    }

    for (const sid of eggSpeciesCandidates) {
      if (!sid || checkedEggSpecies.has(sid)) continue;
      checkedEggSpecies.add(sid);

      const eggMovesRaw = getRawEggMovesForSpecies(sid);
      if (eggMovesRaw && Array.isArray(eggMovesRaw)) {
        const sourceName = sid !== currentSpeciesId ? LineageManager.getSpeciesName(sid) : null;
        for (const entry of eggMovesRaw) {
          const moveId = (typeof entry === 'object' && entry !== null) ? Number(entry.moveId ?? entry.id ?? entry) : Number(entry);
          if (moveId && !isNaN(moveId) && moveId > 0 && !seenMoveIds.has(moveId)) {
            seenMoveIds.add(moveId);
            moves.push(resolveMove(moveId, 'Œuf', sourceName));
          }
        }
      }
    }

    // 5. Trier les attaques apprises par niveau croissant
    const getLevelWeight = (lvl) => {
      if (typeof lvl === 'number') {
        if (lvl < 0) return 0;
        if (lvl === 0) return 0.5;
        return lvl;
      }
      if (lvl === 'Départ') return 0;
      if (lvl === 'Œuf') return 0.2;
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
