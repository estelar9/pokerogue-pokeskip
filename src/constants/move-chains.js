// ============================================================================
// Lignées d'Attaques Évolutives Directes (Universal Move Upgrade Chains)
// Définit les familles d'attaques progressives du jeu (du rang le plus faible au plus élevé)
// Enrichies avec stats, PP, précision, effets et récupération dynamique PokéRogue
// ============================================================================

import { POKEMON_TYPES, MOVE_CATEGORIES } from './types.js';
import { isEnglish, t } from '../core/i18n.js';

export const MOVE_UPGRADE_CHAINS = [
  // --- PLANTE ---
  {
    id: 'grass_drain',
    nameFr: 'Drain de PV Plante',
    nameEn: 'Grass HP Drain',
    type: 'Plante',
    category: 'Spéciale',
    moves: [
      {
        name: 'Vol-Vie', nameEn: 'Absorb', id: 71, power: 20, acc: 100, pp: 25,
        descFr: 'Vole des PV à la cible. Rend la moitié des dégâts infligés au lanceur.',
        descEn: 'User recovers half the damage inflicted on target.'
      },
      {
        name: 'Méga-Sangsue', nameEn: 'Mega Drain', id: 72, power: 40, acc: 100, pp: 15,
        descFr: 'Vole des PV à la cible. Rend la moitié des dégâts infligés au lanceur.',
        descEn: 'User recovers half the damage inflicted on target.'
      },
      {
        name: 'Giga-Sangsue', nameEn: 'Giga Drain', id: 202, power: 75, acc: 100, pp: 10,
        descFr: 'Vole des PV à la cible. Rend la moitié des dégâts infligés au lanceur.',
        descEn: 'User recovers half the damage inflicted on target.'
      }
    ]
  },
  {
    id: 'grass_physical',
    nameFr: 'Tranchant Plante',
    nameEn: 'Grass Physical Slices',
    type: 'Plante',
    category: 'Physique',
    moves: [
      {
        name: 'Fouet Lianes', nameEn: 'Vine Whip', id: 22, power: 45, acc: 100, pp: 25,
        descFr: 'Frappe l\'ennemi avec de fines lianes.',
        descEn: 'The target is struck with slender, whiplike vines.'
      },
      {
        name: 'Tranch\'Herbe', nameEn: 'Razor Leaf', id: 75, power: 55, acc: 95, pp: 25,
        descFr: 'Tranche l\'ennemi avec des feuilles acérées. Taux de critiques élevé.',
        descEn: 'Sharp leaves cut the target. High critical-hit ratio.'
      },
      {
        name: 'Lame Feuille', nameEn: 'Leaf Blade', id: 348, power: 90, acc: 100, pp: 15,
        descFr: 'Tranche l\'ennemi avec une feuille tranchante. Taux de critiques élevé.',
        descEn: 'The user handles a sharp leaf like a sword. High critical-hit ratio.'
      }
    ]
  },
  {
    id: 'grass_special',
    nameFr: 'Projectiles Plante',
    nameEn: 'Grass Energy Beams',
    type: 'Plante',
    category: 'Spéciale',
    moves: [
      {
        name: 'Feuille Magik', nameEn: 'Magical Leaf', id: 345, power: 60, acc: -1, pp: 20,
        descFr: 'Projette des feuilles magiques qui n\'échouent jamais.',
        descEn: 'The user scatters curious leaves that never miss.'
      },
      {
        name: 'Éco-Sphère', nameEn: 'Energy Ball', id: 412, power: 90, acc: 100, pp: 10,
        descFr: 'Projette l\'énergie de la nature. Peut baisser la Défense Spéciale de la cible.',
        descEn: 'Draws power from nature and fires it. May lower target\'s Sp. Def.'
      }
    ]
  },

  // --- FEU ---
  {
    id: 'fire_special',
    nameFr: 'Flammes Spéciales',
    nameEn: 'Special Fire Beams',
    type: 'Feu',
    category: 'Spéciale',
    moves: [
      {
        name: 'Flammèche', nameEn: 'Ember', id: 52, power: 40, acc: 100, pp: 25,
        descFr: 'Une faible attaque de flammes pouvant brûler l\'ennemi.',
        descEn: 'A weak fire attack that may burn the target.'
      },
      {
        name: 'Lance-Flammes', nameEn: 'Flamethrower', id: 53, power: 90, acc: 100, pp: 15,
        descFr: 'Un torrent de flammes ardentes. Peut brûler la cible.',
        descEn: 'A stream of fire that may burn the target.'
      }
    ]
  },
  {
    id: 'fire_physical',
    nameFr: 'Flammes Physiques',
    nameEn: 'Physical Fire Attacks',
    type: 'Feu',
    category: 'Physique',
    moves: [
      {
        name: 'Roue de Feu', nameEn: 'Flame Wheel', id: 172, power: 60, acc: 100, pp: 25,
        descFr: 'Une charge enflammée tournoyante pouvant brûler la cible.',
        descEn: 'The user charges while covered in fire. May inflict a burn.'
      },
      {
        name: 'Crocs Feu', nameEn: 'Fire Fang', id: 424, power: 65, acc: 95, pp: 15,
        descFr: 'Morsure de flammes. Peut apeurer ou brûler l\'ennemi.',
        descEn: 'The user bites with flame-cloaked fangs. May burn or flinch.'
      },
      {
        name: 'Boutefeu', nameEn: 'Flare Blitz', id: 394, power: 120, acc: 100, pp: 15,
        descFr: 'Charge incandescente dévastatrice. Blesse aussi le lanceur et peut brûler la cible.',
        descEn: 'A fierce charge covered in fire. User takes recoil damage. May burn.'
      }
    ]
  },

  // --- EAU ---
  {
    id: 'water_special',
    nameFr: 'Jets d\'Eau Spéciaux',
    nameEn: 'Special Water Jets',
    type: 'Eau',
    category: 'Spéciale',
    moves: [
      {
        name: 'Pistolet à O', nameEn: 'Water Gun', id: 55, power: 40, acc: 100, pp: 25,
        descFr: 'Projette un jet d\'eau puissant sur l\'ennemi.',
        descEn: 'Shoots a jet of water at the target.'
      },
      {
        name: 'Bulles d\'O', nameEn: 'Bubble Beam', id: 61, power: 65, acc: 100, pp: 20,
        descFr: 'Projette des bulles puissantes pouvant réduire la Vitesse ennemie.',
        descEn: 'A spray of bubbles that may lower the target\'s Speed.'
      },
      {
        name: 'Surf', nameEn: 'Surf', id: 57, power: 90, acc: 100, pp: 15,
        descFr: 'Une vague géante qui submerge le champ de bataille.',
        descEn: 'A giant wave that crashes down on the battlefield.'
      },
      {
        name: 'Hydrocanon', nameEn: 'Hydro Pump', id: 56, power: 110, acc: 80, pp: 5,
        descFr: 'Un énorme torrent d\'eau projeté à très haute pression.',
        descEn: 'A massive volume of water launched under great pressure.'
      }
    ]
  },
  {
    id: 'water_physical',
    nameFr: 'Impacts d\'Eau Physiques',
    nameEn: 'Physical Water Strikes',
    type: 'Eau',
    category: 'Physique',
    moves: [
      {
        name: 'Pince-Masse', nameEn: 'Crabhammer', id: 152, power: 100, acc: 90, pp: 10,
        descFr: 'Frappe l\'ennemi avec une grosse pince. Taux de critiques élevé.',
        descEn: 'Hammered with a large pincer. High critical-hit ratio.'
      },
      {
        name: 'Cascade', nameEn: 'Waterfall', id: 127, power: 80, acc: 100, pp: 15,
        descFr: 'Charge aquatique impétueuse pouvant apeurer la cible.',
        descEn: 'A powerful aquatic charge that may flinch the target.'
      },
      {
        name: 'Aqua-Brèche', nameEn: 'Liquidation', id: 710, power: 85, acc: 100, pp: 10,
        descFr: 'Attaque avec une lame d\'eau. Peut réduire la Défense de la cible.',
        descEn: 'Slices with a blade of water. May lower the target\'s Defense.'
      }
    ]
  },

  // --- ÉLECTRIK ---
  {
    id: 'electric_special',
    nameFr: 'Foudre Spéciale',
    nameEn: 'Special Electric Jolts',
    type: 'Électrik',
    category: 'Spéciale',
    moves: [
      {
        name: 'Éclair', nameEn: 'Thunder Shock', id: 84, power: 40, acc: 100, pp: 30,
        descFr: 'Une décharge électrique pouvant paralyser la cible.',
        descEn: 'A jolt of electricity that may paralyze the target.'
      },
      {
        name: 'Étincelle', nameEn: 'Spark', id: 209, power: 65, acc: 100, pp: 20,
        descFr: 'Une charge électrisée pouvant paralyser la cible.',
        descEn: 'An electrifying charge that may paralyze the target.'
      },
      {
        name: 'Tonnerre', nameEn: 'Thunderbolt', id: 85, power: 90, acc: 100, pp: 15,
        descFr: 'Une puissante foudre s\'abat sur la cible. Peut la paralyser.',
        descEn: 'A strong electric jolt that may paralyze the target.'
      }
    ]
  },
  {
    id: 'electric_physical',
    nameFr: 'Foudre Physique',
    nameEn: 'Physical Electric Attacks',
    type: 'Électrik',
    category: 'Physique',
    moves: [
      {
        name: 'Crocs Éclair', nameEn: 'Thunder Fang', id: 422, power: 65, acc: 95, pp: 15,
        descFr: 'Morsure électrifiée pouvant apeurer ou paralyser la cible.',
        descEn: 'Bites with electrified fangs. May paralyze or flinch.'
      },
      {
        name: 'Éclair Fou', nameEn: 'Wild Charge', id: 528, power: 90, acc: 100, pp: 15,
        descFr: 'Charge électrisée foudroyante. Blesse un peu le lanceur par recul.',
        descEn: 'The user shrouds itself in electricity and charges. Recoil damage.'
      }
    ]
  },

  // --- GLACE ---
  {
    id: 'ice_special',
    nameFr: 'Rayons de Givre',
    nameEn: 'Special Frost Beams',
    type: 'Glace',
    category: 'Spéciale',
    moves: [
      {
        name: 'Poudreuse', nameEn: 'Powder Snow', id: 181, power: 40, acc: 100, pp: 25,
        descFr: 'Projette un vent de neige pouvant geler la cible.',
        descEn: 'The user blasts snowy powder that may freeze the target.'
      },
      {
        name: 'Onde Boréale', nameEn: 'Aurora Beam', id: 62, power: 65, acc: 100, pp: 20,
        descFr: 'Rayon multicolore glacial. Peut baisser l\'Attaque ennemie.',
        descEn: 'A rainbow-colored ray of light that may lower target\'s Attack.'
      },
      {
        name: 'Laser Glace', nameEn: 'Ice Beam', id: 58, power: 90, acc: 100, pp: 10,
        descFr: 'Un puissant rayon de glace pure pouvant geler la cible.',
        descEn: 'A blast of icy energy that may freeze the target.'
      }
    ]
  },
  {
    id: 'ice_physical',
    nameFr: 'Impacts Glacés Physiques',
    nameEn: 'Physical Ice Strikes',
    type: 'Glace',
    category: 'Physique',
    moves: [
      {
        name: 'Crocs Givre', nameEn: 'Ice Fang', id: 423, power: 65, acc: 95, pp: 15,
        descFr: 'Morsure glaciale pouvant apeurer ou geler la cible.',
        descEn: 'Bites with frost-covered fangs. May freeze or flinch.'
      },
      {
        name: 'Poing Glace', nameEn: 'Ice Punch', id: 8, power: 75, acc: 100, pp: 15,
        descFr: 'Coup de poing glacial pouvant geler la cible.',
        descEn: 'An icy punch that may freeze the target.'
      },
      {
        name: 'Chute Glace', nameEn: 'Icicle Crash', id: 556, power: 85, acc: 90, pp: 10,
        descFr: 'Fait tomber de gros blocs de glace acérés. Peut apeurer la cible.',
        descEn: 'Large icicles fall onto target. May flinch.'
      }
    ]
  },

  // --- PSY ---
  {
    id: 'psychic_special',
    nameFr: 'Ondes Psychiques',
    nameEn: 'Psychic Waves',
    type: 'Psy',
    category: 'Spéciale',
    moves: [
      {
        name: 'Choc Mental', nameEn: 'Confusion', id: 93, power: 50, acc: 100, pp: 25,
        descFr: 'Onde télékinétique pouvant rendre la cible confuse.',
        descEn: 'A telekinetic wave that may confuse the target.'
      },
      {
        name: 'Rafale Psy', nameEn: 'Psybeam', id: 60, power: 65, acc: 100, pp: 20,
        descFr: 'Étrange rayon lumineux pouvant rendre la cible confuse.',
        descEn: 'A peculiar ray of light that may confuse the target.'
      },
      {
        name: 'Psyko', nameEn: 'Psychic', id: 94, power: 90, acc: 100, pp: 10,
        descFr: 'Puissante onde télékinétique pouvant baisser la Défense Spéciale ennemie.',
        descEn: 'Strong telekinetic force that may lower target\'s Sp. Def.'
      }
    ]
  },
  {
    id: 'psychic_physical',
    nameFr: 'Lames Psychiques Physiques',
    nameEn: 'Psychic Physical Cuts',
    type: 'Psy',
    category: 'Physique',
    moves: [
      {
        name: 'Coupe Psycho', nameEn: 'Psycho Cut', id: 427, power: 70, acc: 100, pp: 20,
        descFr: 'Lames psychiques tranchantes. Taux de critiques élevé.',
        descEn: 'Psychic blades tear target. High critical-hit ratio.'
      },
      {
        name: 'Choc Psy', nameEn: 'Psyshock', id: 473, power: 80, acc: 100, pp: 10,
        descFr: 'Matérialise une onde psychique infligeant des dégâts physiques à la Défense.',
        descEn: 'Materializes an odd psychic wave doing physical damage to Defense.'
      }
    ]
  },

  // --- TÉNÈBRES ---
  {
    id: 'dark_bite',
    nameFr: 'Morsure & Mâchouille',
    nameEn: 'Bite & Crunch',
    type: 'Ténèbres',
    category: 'Physique',
    moves: [
      {
        name: 'Morsure', nameEn: 'Bite', id: 44, power: 60, acc: 100, pp: 25,
        descFr: 'Morsure acérée pouvant apeurer la cible.',
        descEn: 'Bites with sharp teeth. May flinch.'
      },
      {
        name: 'Mâchouille', nameEn: 'Crunch', id: 242, power: 80, acc: 100, pp: 15,
        descFr: 'Morsure brutale pouvant réduire la Défense ennemie.',
        descEn: 'Bites down with vicious fangs. May lower target\'s Defense.'
      }
    ]
  },
  {
    id: 'dark_special',
    nameFr: 'Ondes Obscures',
    nameEn: 'Dark Pulses',
    type: 'Ténèbres',
    category: 'Spéciale',
    moves: [
      {
        name: 'Feinte', nameEn: 'Feint Attack', id: 185, power: 60, acc: -1, pp: 20,
        descFr: 'Approche sournoisement et frappe sans jamais échouer.',
        descEn: 'Draws up close then strikes. Never misses.'
      },
      {
        name: 'Vibrobscur', nameEn: 'Dark Pulse', id: 399, power: 80, acc: 100, pp: 15,
        descFr: 'Libère des ténèbres condensées pouvant apeurer la cible.',
        descEn: 'Releases a horrible aura of darkness. May flinch.'
      }
    ]
  },

  // --- COMBAT ---
  {
    id: 'fighting_physical',
    nameFr: 'Coups & Arts Martiaux',
    nameEn: 'Martial Arts Strikes',
    type: 'Combat',
    category: 'Physique',
    moves: [
      {
        name: 'Éclate-Roc', nameEn: 'Rock Smash', id: 249, power: 40, acc: 100, pp: 15,
        descFr: 'Coup de poing destructeur pouvant réduire la Défense de la cible.',
        descEn: 'A smashing punch that may lower the target\'s Defense.'
      },
      {
        name: 'Casse-Brique', nameEn: 'Brick Break', id: 280, power: 75, acc: 100, pp: 15,
        descFr: 'Attaque tranchante détruisant les barrières (Protection, Mur Lumière).',
        descEn: 'Strikes with hard-hitting hands. Breaks barriers.'
      },
      {
        name: 'Close Combat', nameEn: 'Close Combat', id: 370, power: 120, acc: 100, pp: 5,
        descFr: 'Combat rapproché déchaîné sans garde. Baisse la Défense et la Déf. Spé. du lanceur.',
        descEn: 'Fights up close without guarding. Lowers Defense and Sp. Def.'
      }
    ]
  },

  // --- SOL ---
  {
    id: 'ground_earth',
    nameFr: 'Secousses Telluriques',
    nameEn: 'Ground Vibrations',
    type: 'Sol',
    category: 'Physique',
    moves: [
      {
        name: 'Tir de Boue', nameEn: 'Mud Shot', id: 341, power: 55, acc: 95, pp: 15,
        descFr: 'Projette de la terre boueuse qui réduit la Vitesse ennemie.',
        descEn: 'Fires mud at target. Reduces target\'s Speed.'
      },
      {
        name: 'Piétinement', nameEn: 'Bulldoze', id: 523, power: 60, acc: 100, pp: 20,
        descFr: 'Frappe violemment le sol et réduit la Vitesse de toutes les cibles.',
        descEn: 'Stomps the ground hard. Lowers the target\'s Speed.'
      },
      {
        name: 'Séisme', nameEn: 'Earthquake', id: 89, power: 100, acc: 100, pp: 10,
        descFr: 'Tremblement de terre ravageur frappant tous les Pokémon au sol.',
        descEn: 'A huge earthquake that strikes all Pokémon on the ground.'
      }
    ]
  },

  // --- ROCHE ---
  {
    id: 'rock_throw',
    nameFr: 'Projectiles de Pierre',
    nameEn: 'Rock Missiles',
    type: 'Roche',
    category: 'Physique',
    moves: [
      {
        name: 'Jet-Pierres', nameEn: 'Rock Throw', id: 88, power: 50, acc: 90, pp: 15,
        descFr: 'Projette de grosses pierres sur la cible.',
        descEn: 'Throws rocks at the target.'
      },
      {
        name: 'Tomberoche', nameEn: 'Rock Tomb', id: 317, power: 60, acc: 95, pp: 15,
        descFr: 'Fait tomber des rochers qui piègent l\'ennemi et réduisent sa Vitesse.',
        descEn: 'Hurls rocks at the target. Lowers the target\'s Speed.'
      },
      {
        name: 'Éboulement', nameEn: 'Rock Slide', id: 157, power: 75, acc: 90, pp: 10,
        descFr: 'Envoie de gros rochers sur l\'ennemi. Peut apeurer la cible.',
        descEn: 'Large boulders are hurled at target. May flinch.'
      },
      {
        name: 'Lame de Roc', nameEn: 'Stone Edge', id: 444, power: 100, acc: 80, pp: 5,
        descFr: 'Fait surgir des rochers acérés sous la cible. Taux de critiques élevé.',
        descEn: 'Stabs target from below with sharp stones. High critical-hit ratio.'
      }
    ]
  },

  // --- VOL ---
  {
    id: 'flying_peck',
    nameFr: 'Piqués & Coups d\'Ailes',
    nameEn: 'Wing Strikes & Beaks',
    type: 'Vol',
    category: 'Physique',
    moves: [
      {
        name: 'Picpic', nameEn: 'Peck', id: 64, power: 35, acc: 100, pp: 35,
        descFr: 'Frappe l\'ennemi avec un bec pointu ou une corne.',
        descEn: 'The target is poked with a sharp beak or horn.'
      },
      {
        name: 'Cru-Ailes', nameEn: 'Wing Attack', id: 17, power: 60, acc: 100, pp: 35,
        descFr: 'Frappe l\'ennemi en déployant de larges ailes.',
        descEn: 'Strikes the target with large, spread wings.'
      },
      {
        name: 'Bec Vrille', nameEn: 'Drill Peck', id: 65, power: 80, acc: 100, pp: 20,
        descFr: 'Attaque tournoyante perçante comme une vrille.',
        descEn: 'A corkscrewing attack that strikes with a sharp beak.'
      },
      {
        name: 'Rapace', nameEn: 'Brave Bird', id: 413, power: 120, acc: 100, pp: 15,
        descFr: 'Attaque aérienne téméraire à pleine vitesse. Le lanceur subit un recul important.',
        descEn: 'Folds wings and dives. User takes serious recoil damage.'
      }
    ]
  },
  {
    id: 'flying_special',
    nameFr: 'Bourrasques Aériennes',
    nameEn: 'Air Gusts & Slashes',
    type: 'Vol',
    category: 'Spéciale',
    moves: [
      {
        name: 'Tornade', nameEn: 'Gust', id: 16, power: 40, acc: 100, pp: 35,
        descFr: 'Déclenche une tornade de vent en battant des ailes.',
        descEn: 'Strikes target with a gust of wind whipped up by wings.'
      },
      {
        name: 'Lame d\'Air', nameEn: 'Air Slash', id: 403, power: 75, acc: 95, pp: 15,
        descFr: 'Tranche l\'ennemi avec le vent. Peut apeurer la cible.',
        descEn: 'Slices with blades of wind. May cause target to flinch.'
      },
      {
        name: 'Vent Violent', nameEn: 'Hurricane', id: 542, power: 110, acc: 70, pp: 10,
        descFr: 'Ouragan puissant enveloppant la cible. Peut la rendre confuse.',
        descEn: 'A fierce hurricane that may confuse the target.'
      }
    ]
  },

  // --- INSECTE ---
  {
    id: 'bug_physical',
    nameFr: 'Morsures & Griffes Insecte',
    nameEn: 'Bug Physical Bites',
    type: 'Insecte',
    category: 'Physique',
    moves: [
      {
        name: 'Piqûre', nameEn: 'Bug Bite', id: 450, power: 60, acc: 100, pp: 20,
        descFr: 'Pique l\'ennemi et dévore sa baie tenue le cas échéant.',
        descEn: 'Bites the target. Eats target\'s held Berry.'
      },
      {
        name: 'Plaie Croix', nameEn: 'X-Scissor', id: 404, power: 80, acc: 100, pp: 15,
        descFr: 'Tranche l\'ennemi en croisant ses faux ou ses griffes en X.',
        descEn: 'Crosses scythes or claws to slash target.'
      }
    ]
  },
  {
    id: 'bug_special',
    nameFr: 'Ondes Insecte',
    nameEn: 'Bug Sounds & Buzz',
    type: 'Insecte',
    category: 'Spéciale',
    moves: [
      {
        name: 'Survinsecte', nameEn: 'Struggle Bug', id: 522, power: 50, acc: 100, pp: 20,
        descFr: 'Se débat pour frapper les cibles. Réduit leur Attaque Spéciale.',
        descEn: 'Resists struggle and strikes. Lowers target\'s Sp. Atk.'
      },
      {
        name: 'Bourdon', nameEn: 'Bug Buzz', id: 405, power: 90, acc: 100, pp: 10,
        descFr: 'Vibrations sonores déchirantes. Peut réduire la Défense Spéciale ennemie.',
        descEn: 'Vibrates sound waves. May lower target\'s Sp. Def.'
      }
    ]
  },

  // --- SPECTRE ---
  {
    id: 'ghost_special',
    nameFr: 'Ondes Spectrales',
    nameEn: 'Ghost Energy',
    type: 'Spectre',
    category: 'Spéciale',
    moves: [
      {
        name: 'Étonnement', nameEn: 'Astonish', id: 310, power: 30, acc: 100, pp: 30,
        descFr: 'Cri terrifiant pouvant apeurer la cible.',
        descEn: 'Shouts loudly to startle target. May flinch.'
      },
      {
        name: 'Ombre Nocturne', nameEn: 'Night Shade', id: 101, power: 50, acc: 100, pp: 15,
        descFr: 'Mirage ténébreux infligeant des dégâts équivalents au niveau du lanceur.',
        descEn: 'Mirage inflicting damage equal to the user\'s level.'
      },
      {
        name: 'Ball\'Ombre', nameEn: 'Shadow Ball', id: 247, power: 80, acc: 100, pp: 15,
        descFr: 'Projette une masse d\'ombres condensée. Peut réduire la Défense Spéciale.',
        descEn: 'Hurls a shadowy blob. May lower target\'s Sp. Def.'
      }
    ]
  },

  // --- POISON ---
  {
    id: 'poison_physical',
    nameFr: 'Dards & Frappes Toxiques',
    nameEn: 'Poison Strikes',
    type: 'Poison',
    category: 'Physique',
    moves: [
      {
        name: 'Dard-Venin', nameEn: 'Poison Sting', id: 40, power: 15, acc: 100, pp: 35,
        descFr: 'Pique avec un dard venimeux pouvant empoisonner.',
        descEn: 'Stabs with poisonous barb. May poison target.'
      },
      {
        name: 'Poison-Croix', nameEn: 'Cross Poison', id: 440, power: 70, acc: 100, pp: 20,
        descFr: 'Tranchant empoisonné en croix. Taux de critiques élevé, peut empoisonner.',
        descEn: 'Poison slash. High critical-hit ratio, may poison.'
      },
      {
        name: 'Direct Toxik', nameEn: 'Poison Jab', id: 398, power: 80, acc: 100, pp: 20,
        descFr: 'Frappe de poing venimeuse pouvant empoisonner la cible.',
        descEn: 'Poisoned fist strike that may poison target.'
      },
      {
        name: 'Détricanon', nameEn: 'Gunk Shot', id: 441, power: 120, acc: 80, pp: 5,
        descFr: 'Projette des déchets immondes et toxiques. Peut empoisonner la cible.',
        descEn: 'Shoots filthy garbage. May poison target.'
      }
    ]
  },
  {
    id: 'poison_special',
    nameFr: 'Acides & Toxines Liquides',
    nameEn: 'Acid & Sludge Beams',
    type: 'Poison',
    category: 'Spéciale',
    moves: [
      {
        name: 'Acide', nameEn: 'Acid', id: 51, power: 40, acc: 100, pp: 30,
        descFr: 'Arrose d\'acide corrosif. Peut réduire la Défense Spéciale de la cible.',
        descEn: 'Sprays acid that may lower target\'s Sp. Def.'
      },
      {
        name: 'Bomb-Beurk', nameEn: 'Sludge Bomb', id: 188, power: 90, acc: 100, pp: 10,
        descFr: 'Envoie des boues toxiques et infectieuses pouvant empoisonner la cible.',
        descEn: 'Hurls unsanitary sludge. May poison target.'
      },
      {
        name: 'Cradovague', nameEn: 'Sludge Wave', id: 482, power: 95, acc: 100, pp: 10,
        descFr: 'Vague de fange toxique qui submerge le terrain. Peut empoisonner la cible.',
        descEn: 'A swamp wave that may poison the target.'
      }
    ]
  },

  // --- DRAGON ---
  {
    id: 'dragon_physical',
    nameFr: 'Griffes & Crocs Draconiques',
    nameEn: 'Dragon Physical Claws',
    type: 'Dragon',
    category: 'Physique',
    moves: [
      {
        name: 'Draco-Griffe', nameEn: 'Dragon Claw', id: 337, power: 80, acc: 100, pp: 15,
        descFr: 'Lacère la cible avec de grandes griffes acérées.',
        descEn: 'Slashes the target with huge, sharp claws.'
      },
      {
        name: 'Colère', nameEn: 'Outrage', id: 200, power: 120, acc: 100, pp: 10,
        descFr: 'Attaque furieuse pendant 2 à 3 tours, puis rend le lanceur confus.',
        descEn: 'Rampages for 2-3 turns then becomes confused.'
      }
    ]
  },
  {
    id: 'dragon_special',
    nameFr: 'Souffle Draconique',
    nameEn: 'Dragon Breaths',
    type: 'Dragon',
    category: 'Spéciale',
    moves: [
      {
        name: 'Dracosouffle', nameEn: 'Dragon Breath', id: 225, power: 60, acc: 100, pp: 20,
        descFr: 'Souffle draconique incandescent pouvant paralyser la cible.',
        descEn: 'Strikes with breath of dragon. May paralyze.'
      },
      {
        name: 'Draco-Choc', nameEn: 'Dragon Pulse', id: 406, power: 85, acc: 100, pp: 10,
        descFr: 'Onde de choc draconique pure projetée de la gueule du lanceur.',
        descEn: 'Attacks target with a shock wave generated by dragon mouth.'
      }
    ]
  },

  // --- ACIER ---
  {
    id: 'steel_physical',
    nameFr: 'Armes Métalliques',
    nameEn: 'Steel Physical Strikes',
    type: 'Acier',
    category: 'Physique',
    moves: [
      {
        name: 'Griffe Acier', nameEn: 'Metal Claw', id: 232, power: 50, acc: 95, pp: 35,
        descFr: 'Griffe d\'acier pouvant augmenter l\'Attaque du lanceur.',
        descEn: 'Steel claw strike that may raise user\'s Attack.'
      },
      {
        name: 'Tête de Fer', nameEn: 'Iron Head', id: 442, power: 80, acc: 100, pp: 15,
        descFr: 'Coup de tête d\'acier renforcé pouvant apeurer la cible.',
        descEn: 'Hard-as-iron headbutt that may flinch target.'
      }
    ]
  },

  // --- FÉE ---
  {
    id: 'fairy_special',
    nameFr: 'Lumières Féériques',
    nameEn: 'Fairy Radiant Lights',
    type: 'Fée',
    category: 'Spéciale',
    moves: [
      {
        name: 'Vent Féérique', nameEn: 'Fairy Wind', id: 584, power: 40, acc: 100, pp: 30,
        descFr: 'Vent féérique scintillant balayant la cible.',
        descEn: 'The user stirs up a fairy wind to strike the target.'
      },
      {
        name: 'Éclat Magique', nameEn: 'Dazzling Gleam', id: 605, power: 80, acc: 100, pp: 20,
        descFr: 'Éblouit avec une lumière puissante frappant tous les ennemis.',
        descEn: 'Dazzling flash of light that harms adjacent targets.'
      },
      {
        name: 'Pouvoir Lunaire', nameEn: 'Moonblast', id: 295, power: 95, acc: 100, pp: 15,
        descFr: 'Emprunte la puissance de la lune. Peut baisser l\'Attaque Spéciale ennemie.',
        descEn: 'Draws power from the moon. May lower target\'s Sp. Atk.'
      }
    ]
  },

  // --- NORMAL ---
  {
    id: 'normal_tackle',
    nameFr: 'Impacts Normaux Directs',
    nameEn: 'Normal Direct Impacts',
    type: 'Normal',
    category: 'Physique',
    moves: [
      {
        name: 'Charge', nameEn: 'Tackle', id: 33, power: 40, acc: 100, pp: 35,
        descFr: 'Charge l\'ennemi avec force de tout son corps.',
        descEn: 'A physical charge in which user rushes target.'
      },
      {
        name: 'Plaquage', nameEn: 'Body Slam', id: 34, power: 85, acc: 100, pp: 15,
        descFr: 'Écrase la cible de tout son poids. Peut la paralyser.',
        descEn: 'Drops whole body onto target. May paralyze.'
      },
      {
        name: 'Damoclès', nameEn: 'Double-Edge', id: 38, power: 120, acc: 100, pp: 15,
        descFr: 'Charge téméraire surpuissante. Le lanceur subit un recul important.',
        descEn: 'A life-risking tackle that also hurts user.'
      }
    ]
  },

  // --- STATUT SOMMEIL ---
  {
    id: 'sleep_status',
    nameFr: 'Poudres & Spores de Sommeil',
    nameEn: 'Sleep Spores & Powder',
    type: 'Plante',
    category: 'Statut',
    moves: [
      {
        name: 'Poudre Dodo', nameEn: 'Sleep Powder', id: 79, power: '—', acc: 75, pp: 15,
        descFr: 'Répand une poudre endormante qui plonge l\'ennemi dans le sommeil.',
        descEn: 'Scatters sleep powder that puts target to sleep.'
      },
      {
        name: 'Spore', nameEn: 'Spore', id: 147, power: '—', acc: 100, pp: 10,
        descFr: 'Répand des spores plongeant l\'ennemi dans le sommeil à coup sûr.',
        descEn: 'Scatters sleep spores that lull target into sleep.'
      }
    ]
  }
];

// Cache des résolutions d'attaques en temps réel
const _liveMoveCache = new Map();

/**
 * Récupère les caractéristiques réelles d'une attaque directement depuis le moteur PokéRogue.
 * PokéRogue peut modifier la puissance, la précision, les PP ou l'effet d'une attaque.
 * Si le jeu n'est pas encore lancé ou inaccessible, bascule sur les définitions statiques de secours.
 * 
 * @param {Object} moveDef Objet de définition d'attaque (issu de MOVE_UPGRADE_CHAINS)
 * @param {Object} [pokeSkipInstance] Instance PokeSkip optionnelle
 * @returns {Object} Caractéristiques complètes et résolues de l'attaque
 */
export function getLiveMoveInfo(moveDef, chainDef = null, pokeSkipInstance = null) {
  if (!moveDef) return null;
  const moveId = Number(moveDef.id);
  const isEn = isEnglish();
  const cacheKey = `${moveId}_${isEn ? 'en' : 'fr'}`;

  // Si déjà résolu depuis le moteur PokéRogue, réutiliser
  if (_liveMoveCache.has(cacheKey)) {
    const cached = _liveMoveCache.get(cacheKey);
    if (cached._fromGame) return cached;
  }

  let chain = chainDef;
  let ps = pokeSkipInstance;
  if (chainDef && chainDef.settings) {
    ps = chainDef;
    chain = null;
  }
  if (!chain) {
    chain = MOVE_UPGRADE_CHAINS.find(c => c.moves && c.moves.some(m => Number(m.id) === moveId));
  }
  ps = ps || (typeof window !== 'undefined' ? window.PokeSkip : null);
  let liveObj = null;

  // 1. Chercher la fonction getMove() dans le moteur PokéRogue
  let getMoveFn = ps?.cachedGetMoveFn || null;

  if (!getMoveFn && ps) {
    const party = (ps.scene?.party && Array.isArray(ps.scene.party))
      ? ps.scene.party
      : (ps.activeParty && Array.isArray(ps.activeParty) ? ps.activeParty : []);
    for (const p of party) {
      if (p?.moveset && p.moveset.length > 0 && typeof p.moveset[0].getMove === 'function') {
        getMoveFn = p.moveset[0].getMove;
        ps.cachedGetMoveFn = getMoveFn;
        break;
      }
    }
  }

  if (!getMoveFn && ps?.scene?.currentBattle?.enemyParty) {
    for (const p of ps.scene.currentBattle.enemyParty) {
      if (p?.moveset && p.moveset.length > 0 && typeof p.moveset[0].getMove === 'function') {
        getMoveFn = p.moveset[0].getMove;
        if (ps) ps.cachedGetMoveFn = getMoveFn;
        break;
      }
    }
  }

  // 2. Invoquer getMove() de PokéRogue avec le moveId
  if (getMoveFn) {
    try {
      liveObj = getMoveFn.call({ moveId });
    } catch (_) {}
  }

  // 3. Fallback sur allMoves global PokéRogue si exposé
  if (!liveObj && typeof unsafeWindow !== 'undefined' && unsafeWindow.allMoves) {
    try { liveObj = unsafeWindow.allMoves[moveId]; } catch (_) {}
  } else if (!liveObj && typeof window !== 'undefined' && window.allMoves) {
    try { liveObj = window.allMoves[moveId]; } catch (_) {}
  }

  const hasLiveObj = Boolean(liveObj);

  // Résolution du Nom
  let name = isEn ? (moveDef.nameEn || moveDef.name) : (moveDef.name || moveDef.nameEn);
  if (liveObj?.name) {
    name = liveObj.name;
  } else if (ps?.knownMovesCache && ps.knownMovesCache[moveId]) {
    name = ps.knownMovesCache[moveId];
  }

  // Résolution du Type (POKEMON_TYPES)
  let typeObj = null;
  if (liveObj && liveObj.type !== undefined) {
    if (typeof liveObj.type === 'number') {
      typeObj = POKEMON_TYPES[liveObj.type];
    } else if (typeof liveObj.type === 'string') {
      typeObj = POKEMON_TYPES.find(t =>
        t.nameFr.toLowerCase() === liveObj.type.toLowerCase() ||
        t.nameEn.toLowerCase() === liveObj.type.toLowerCase() ||
        t.key.toLowerCase() === liveObj.type.toLowerCase()
      );
    }
  }
  if (!typeObj) {
    const rawType = moveDef.type || chain?.type;
    typeObj = POKEMON_TYPES.find(t =>
      t.nameFr === rawType ||
      t.key === rawType ||
      t.nameEn === rawType
    ) || POKEMON_TYPES[0];
  }

  // Résolution de la Catégorie (MOVE_CATEGORIES)
  let catObj = null;
  if (liveObj && liveObj.category !== undefined) {
    if (typeof liveObj.category === 'number') {
      catObj = MOVE_CATEGORIES[liveObj.category];
    } else if (typeof liveObj.category === 'string') {
      catObj = MOVE_CATEGORIES.find(c =>
        c.nameFr.toLowerCase() === liveObj.category.toLowerCase() ||
        c.nameEn.toLowerCase() === liveObj.category.toLowerCase()
      );
    }
  }
  if (!catObj) {
    const rawCat = moveDef.category || chain?.category;
    catObj = MOVE_CATEGORIES.find(c =>
      c.nameFr === rawCat ||
      c.nameEn === rawCat
    ) || MOVE_CATEGORIES[2];
  }

  // Résolution de la Puissance
  let power = '—';
  if (liveObj && liveObj.power !== undefined) {
    power = liveObj.power > 0 ? liveObj.power : (liveObj.power === 0 ? '—' : (moveDef.power || '—'));
  } else if (moveDef.power !== undefined) {
    power = moveDef.power;
  }

  // Résolution de la Précision
  let accuracy = '—';
  const rawAcc = liveObj?.accuracy !== undefined ? liveObj.accuracy : moveDef.acc;
  if (rawAcc !== undefined && rawAcc !== null) {
    if (typeof rawAcc === 'number') {
      if (rawAcc > 0) {
        accuracy = `${rawAcc}%`;
      } else if (rawAcc < 0) {
        accuracy = t('move_infallible');
      } else {
        accuracy = '—';
      }
    } else {
      accuracy = String(rawAcc);
    }
  }

  // Résolution des PP
  let pp = '—';
  if (liveObj && liveObj.pp !== undefined && liveObj.pp > 0) {
    pp = liveObj.pp;
  } else if (liveObj && liveObj.maxPp !== undefined && liveObj.maxPp > 0) {
    pp = liveObj.maxPp;
  } else if (moveDef.pp !== undefined) {
    pp = moveDef.pp;
  }

  // Résolution de la Description (priorité au texte officiel du moteur PokéRogue)
  let desc = null;
  if (liveObj) {
    if (typeof liveObj.getDescription === 'function') {
      try { desc = liveObj.getDescription(); } catch (_) {}
    }
    if (!desc && liveObj.description) desc = liveObj.description;
    if (!desc && liveObj.effect) desc = liveObj.effect;
    if (!desc && liveObj.effectDescription) desc = liveObj.effectDescription;
  }
  if (!desc) {
    desc = isEn ? moveDef.descEn : moveDef.descFr;
  }
  if (!desc) {
    desc = t('move_default_desc');
  }

  const result = {
    id: moveId,
    name,
    type: typeObj,
    category: catObj,
    power,
    accuracy,
    pp,
    desc,
    _fromGame: hasLiveObj
  };

  _liveMoveCache.set(cacheKey, result);
  return result;
}
