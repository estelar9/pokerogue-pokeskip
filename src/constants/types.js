// Types Pokémon et Table d'efficacité
export { MOVE_CATEGORIES } from './categories.js';
export const POKEMON_TYPES = [
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
  ];;

export const TYPE_CHART = [
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
  ];;
