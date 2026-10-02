// Types Pokémon et Table d'efficacité multilingue
import { isEnglish } from '../core/i18n.js';
export { MOVE_CATEGORIES } from './categories.js';

export const POKEMON_TYPES = [
  { id: 0, key: 'Normal', nameFr: 'Normal', nameEn: 'Normal', codeFr: 'NOR', codeEn: 'NOR', color: '#ffffff', bg: '#ada594', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 1, key: 'Combat', nameFr: 'Combat', nameEn: 'Fighting', codeFr: 'COM', codeEn: 'FIG', color: '#ffffff', bg: '#a55239', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 2, key: 'Vol', nameFr: 'Vol', nameEn: 'Flying', codeFr: 'VOL', codeEn: 'FLY', color: '#ffffff', bg: '#9cadf7', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 3, key: 'Poison', nameFr: 'Poison', nameEn: 'Poison', codeFr: 'POI', codeEn: 'POI', color: '#ffffff', bg: '#9141cb', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 4, key: 'Sol', nameFr: 'Sol', nameEn: 'Ground', codeFr: 'SOL', codeEn: 'GRO', color: '#ffffff', bg: '#ae7a3b', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 5, key: 'Roche', nameFr: 'Roche', nameEn: 'Rock', codeFr: 'ROC', codeEn: 'ROC', color: '#ffffff', bg: '#bda55a', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 6, key: 'Insecte', nameFr: 'Insecte', nameEn: 'Bug', codeFr: 'INS', codeEn: 'BUG', color: '#ffffff', bg: '#adbd21', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 7, key: 'Spectre', nameFr: 'Spectre', nameEn: 'Ghost', codeFr: 'SPE', codeEn: 'GHO', color: '#ffffff', bg: '#6363b5', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 8, key: 'Acier', nameFr: 'Acier', nameEn: 'Steel', codeFr: 'ACI', codeEn: 'STE', color: '#ffffff', bg: '#81a6be', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 9, key: 'Feu', nameFr: 'Feu', nameEn: 'Fire', codeFr: 'FEU', codeEn: 'FIR', color: '#ffffff', bg: '#f75231', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 10, key: 'Eau', nameFr: 'Eau', nameEn: 'Water', codeFr: 'EAU', codeEn: 'WAT', color: '#ffffff', bg: '#399cff', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 11, key: 'Plante', nameFr: 'Plante', nameEn: 'Grass', codeFr: 'PLA', codeEn: 'GRA', color: '#ffffff', bg: '#7bce52', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 12, key: 'Électrik', nameFr: 'Électrik', nameEn: 'Electric', codeFr: 'ÉLE', codeEn: 'ELE', color: '#ffffff', bg: '#ffc631', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 13, key: 'Psy', nameFr: 'Psy', nameEn: 'Psychic', codeFr: 'PSY', codeEn: 'PSY', color: '#ffffff', bg: '#ef4179', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 14, key: 'Glace', nameFr: 'Glace', nameEn: 'Ice', codeFr: 'GLA', codeEn: 'ICE', color: '#ffffff', bg: '#5acee7', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 15, key: 'Dragon', nameFr: 'Dragon', nameEn: 'Dragon', codeFr: 'DRA', codeEn: 'DRA', color: '#ffffff', bg: '#7b63e7', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 16, key: 'Ténèbres', nameFr: 'Ténèbres', nameEn: 'Dark', codeFr: 'TÉN', codeEn: 'DAR', color: '#ffffff', bg: '#735a4a', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 17, key: 'Fée', nameFr: 'Fée', nameEn: 'Fairy', codeFr: 'FÉE', codeEn: 'FAI', color: '#ffffff', bg: '#ef70ef', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } },
  { id: 18, key: 'Stellaire', nameFr: 'Stellaire', nameEn: 'Stellar', codeFr: 'STE', codeEn: 'STL', color: '#ffffff', bg: '#6299bd', get name() { return isEnglish() ? this.nameEn : this.nameFr; }, get code() { return isEnglish() ? this.codeEn : this.codeFr; } }
];

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
];
