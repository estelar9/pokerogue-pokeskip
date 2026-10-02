// Catégories de capacités multilingues
import { isEnglish } from '../core/i18n.js';

export const MOVE_CATEGORIES = [
  { id: 0, nameFr: 'Physique', nameEn: 'Physical', icon: '💥', color: '#f87171', get name() { return isEnglish() ? this.nameEn : this.nameFr; } },
  { id: 1, nameFr: 'Spéciale', nameEn: 'Special', icon: '✨', color: '#60a5fa', get name() { return isEnglish() ? this.nameEn : this.nameFr; } },
  { id: 2, nameFr: 'Statut', nameEn: 'Status', icon: '🌀', color: '#94a3b8', get name() { return isEnglish() ? this.nameEn : this.nameFr; } }
];
