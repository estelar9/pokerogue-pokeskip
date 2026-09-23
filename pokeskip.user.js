// ==UserScript==
// @name         PokéSkip — Auto-Skip Sélectif des Capacités pour PokéRogue
// @namespace    https://github.com/estelar9/pokerogue-pokeskip
// @version      1.5.0
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

  const STORAGE_KEY = 'pokeskip_species_rules_v1';
  const SETTINGS_KEY = 'pokeskip_settings_v1';
  const STATS_KEY = 'pokeskip_stats_v1';

  // --- RÉFÉRENTIELS TYPES & CATÉGORIES POKÉMON ---
  const POKEMON_TYPES = [
    { name: 'Normal', color: '#f8fafc', bg: '#64748b' },
    { name: 'Combat', color: '#ffffff', bg: '#b91c1c' },
    { name: 'Vol', color: '#ffffff', bg: '#2563eb' },
    { name: 'Poison', color: '#ffffff', bg: '#7e22ce' },
    { name: 'Sol', color: '#ffffff', bg: '#b45309' },
    { name: 'Roche', color: '#ffffff', bg: '#78350f' },
    { name: 'Insecte', color: '#ffffff', bg: '#4d7c0f' },
    { name: 'Spectre', color: '#ffffff', bg: '#581c87' },
    { name: 'Acier', color: '#ffffff', bg: '#475569' },
    { name: 'Feu', color: '#ffffff', bg: '#dc2626' },
    { name: 'Eau', color: '#ffffff', bg: '#0284c7' },
    { name: 'Plante', color: '#ffffff', bg: '#16a34a' },
    { name: 'Électrik', color: '#0f172a', bg: '#eab308' },
    { name: 'Psy', color: '#ffffff', bg: '#db2777' },
    { name: 'Glace', color: '#0f172a', bg: '#38bdf8' },
    { name: 'Dragon', color: '#ffffff', bg: '#4338ca' },
    { name: 'Ténèbres', color: '#ffffff', bg: '#27272a' },
    { name: 'Fée', color: '#ffffff', bg: '#be185d' },
    { name: 'Stellaire', color: '#ffffff', bg: '#4f46e5' }
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
    "name": "Miaouss → Persian / Berserkatt",
    "members": [
      52,
      53,
      863
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
    "name": "Canarticho → Palarticho",
    "members": [
      83,
      865
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
    "name": "Axoloto → Maraiste / Barbicha",
    "members": [
      194,
      195,
      980
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
  "215": {
    "name": "Farfuret → Dimoret / Farfurien",
    "members": [
      215,
      461,
      903
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
    "name": "Corayon → Corayôme",
    "members": [
      222,
      864
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
    "name": "Zigzaton → Linéon → Ixon",
    "members": [
      263,
      264,
      862
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
    "name": "Mime Jr. → M. Mime → M. Glaquette",
    "members": [
      439,
      122,
      866
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
    "name": "Bargantua → Paragruel",
    "members": [
      550,
      902
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
    "name": "Tutafeh → Tutankafer / Tutétékri",
    "members": [
      562,
      563,
      867
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
    "name": "Passerouge → Braisillon → Flambusard",
    "members": [
      659,
      660,
      661
    ]
  },
  "662": {
    "name": "Lépidonille → Pérégrain → Prismillon",
    "members": [
      662,
      663,
      664
    ]
  },
  "665": {
    "name": "Hélionceau → Némélios",
    "members": [
      665,
      666
    ]
  },
  "667": {
    "name": "Flabébé → Floette → Florges",
    "members": [
      667,
      668,
      669
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
    init() {
      for (const [rStr, fam] of Object.entries(this.families)) {
        const r = Number(rStr);
        this.memberToRoot[r] = r;
        if (fam.members) {
          for (const m of fam.members) {
            this.memberToRoot[m] = r;
          }
        }
      }
    },
    getRootId(target) {
      if (!target && target !== 0) return 0;
      try {
        if (typeof target?.species?.getRootSpeciesId === 'function') {
          const r = target.species.getRootSpeciesId();
          if (r !== undefined && r !== null) return Number(r);
        }
        if (typeof target?.getRootSpeciesId === 'function') {
          const r = target.getRootSpeciesId();
          if (r !== undefined && r !== null) return Number(r);
        }
      } catch (e) {}
      const spId = Number(target?.species?.speciesId ?? target?.speciesId ?? target);
      if (!isNaN(spId) && spId > 0) {
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
        const directName = target?.species?.name || target?.name || fallbackName || ('Espèce #' + rootId);
        lineageName = directName;
      }
      return { rootId, familyKey, lineageName };
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
      quickPromptDuration: 15
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

    isMoveSkipped(target, moveName, moveId) {
      if (!this.settings.enabled) return false;
      const rule = this.getFamilyRule(target);
      if (!rule) return false; // Par défaut : RIEN n'est skip !
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

  // --- RÉCUPÉRATION COMPLÈTE DES CAPACITÉS FUTURES & ACTUELLES ---
  function getPokemonFullLearnset(pokemon) {
    const moves = [];
    const seenMoveIds = new Set();

    let getMoveFn = null;
    if (pokemon.moveset && pokemon.moveset.length > 0 && typeof pokemon.moveset[0].getMove === 'function') {
      getMoveFn = pokemon.moveset[0].getMove;
    }

    function resolveMove(moveId, level) {
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
        desc
      };
    }

    // 1. Récupérer TOUTES les attaques apprenables par montée de niveau
    let rawLevelMoves = null;
    try {
      if (typeof pokemon.getSpeciesForm === 'function') {
        const sf = pokemon.getSpeciesForm(true);
        if (sf && typeof sf.getLevelMoves === 'function') {
          rawLevelMoves = sf.getLevelMoves();
        }
      }
      if (!rawLevelMoves && pokemon.species && typeof pokemon.species.getLevelMoves === 'function') {
        rawLevelMoves = pokemon.species.getLevelMoves();
      }
    } catch (e) {
      console.warn('[PokeSkip] Erreur getLevelMoves:', e);
    }

    if (rawLevelMoves && Array.isArray(rawLevelMoves)) {
      // Trier par niveau croissant
      const sorted = [...rawLevelMoves].sort((a, b) => a[0] - b[0]);
      for (const entry of sorted) {
        const lvl = entry[0];
        const moveId = entry[1];
        if (!seenMoveIds.has(moveId)) {
          seenMoveIds.add(moveId);
          moves.push(resolveMove(moveId, lvl > 0 ? lvl : (lvl === 0 ? 'Évolution' : 'Départ')));
        }
      }
    }

    // 2. Récupérer les attaques actuelles si non présentes
    if (pokemon.moveset && Array.isArray(pokemon.moveset)) {
      for (const pm of pokemon.moveset) {
        if (pm && pm.moveId && !seenMoveIds.has(pm.moveId)) {
          seenMoveIds.add(pm.moveId);
          const resolved = resolveMove(pm.moveId, 'Actuelle');
          moves.unshift(resolved);
        }
      }
    }

    return moves;
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
          gap: 8px;
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: none !important;
          backdrop-filter: blur(12px);
          padding: 6px 14px;
          border-radius: 9999px;
          cursor: grab;
          user-select: none;
          transition: border-color 0.2s;
          font-family: system-ui, -apple-system, sans-serif;
          color: #f8fafc;
        }
        #pokeskip-hud:hover {
          border-color: rgba(255, 255, 255, 0.35);
          box-shadow: none !important;
        }
        #pokeskip-hud.dragging {
          cursor: grabbing;
          transition: none !important;
          opacity: 0.85;
          box-shadow: none !important;
        }
        .pokeskip-ball-icon {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
        }
        .pokeskip-ball-center {
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
          border: 2px solid #0f172a;
        }
        .pokeskip-hud-title {
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #ffffff 40%, #bae6fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pokeskip-hud-status {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
          letter-spacing: 0.3px;
          user-select: none;
        }
        .pokeskip-hud-status.on {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.35);
        }
        .pokeskip-hud-status.off {
          background: rgba(148, 163, 184, 0.15);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.25);
        }
        .pokeskip-hud-divider {
          color: rgba(255, 255, 255, 0.2);
          font-size: 12px;
          font-weight: 300;
        }
        .pokeskip-hud-badge {
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 12px;
          background: rgba(14, 165, 233, 0.25);
          color: #7dd3fc;
          font-weight: 600;
          border: 1px solid rgba(56, 189, 248, 0.3);
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
        .pokeskip-modal-header {
          padding: 16px 22px;
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.5) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pokeskip-modal-tabs {
          display: flex;
          background: #0d1527;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0 16px;
          gap: 8px;
        }
        .pokeskip-tab-btn {
          padding: 12px 18px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .pokeskip-tab-btn:hover { color: #f8fafc; }
        .pokeskip-tab-btn.active { color: #38bdf8; border-bottom-color: #38bdf8; }
        .pokeskip-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        /* --- TEAM ROW --- */
        .pokeskip-team-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        .pokeskip-member-card {
          background: #111a2e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .pokeskip-member-card:hover {
          background: #16243f;
          border-color: rgba(56, 189, 248, 0.4);
        }
        .pokeskip-member-card.active {
          background: linear-gradient(145deg, #132746 0%, #0c1b33 100%);
          border-color: #38bdf8;
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.25);
        }
        .pokeskip-member-name {
          font-weight: 700;
          font-size: 13px;
          color: #f8fafc;
          margin-top: 4px;
        }
        .pokeskip-member-badge {
          font-size: 10px;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.15);
          padding: 2px 6px;
          border-radius: 6px;
          margin-top: 4px;
        }
        .pokeskip-member-sprite-container {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-bottom: 2px;
        }
        .pokeskip-member-sprite {
          max-width: 52px;
          max-height: 52px;
          object-fit: contain;
          image-rendering: pixelated;
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.45));
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pokeskip-member-card:hover .pokeskip-member-sprite {
          transform: scale(1.15);
        }
        .pokeskip-shiny-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          font-size: 11px;
          filter: drop-shadow(0 0 3px #facc15);
        }

        /* --- NOUVEAU DESIGN DES CARTES D'ATTAQUES --- */
        .pokeskip-moves-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 10px;
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
        .pokeskip-move-name-txt {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
        }
        .pokeskip-type-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
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

        /* --- TOASTS --- */
        #pokeskip-toasts {
          position: fixed;
          top: 65px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000001;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          pointer-events: none;
        }
        .pokeskip-toast {
          background: rgba(15, 23, 42, 0.95);
          border-left: 4px solid #38bdf8;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          padding: 10px 16px;
          border-radius: 8px;
          color: #f8fafc;
          font-size: 13px;
          pointer-events: auto;
          animation: pokeskipSlideIn 0.25s ease-out;
          transition: all 0.25s;
        }
        @keyframes pokeskipSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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

    getPokeballSvg(size = 20) {
      return `
        <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="display:block; flex-shrink:0;">
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
          <circle cx="50" cy="50" r="3.5" fill="#cbd5e1"/>
        </svg>
      `;
    },

    createHudButton() {
      if (document.getElementById('pokeskip-hud')) return;
      const hud = document.createElement('div');
      hud.id = 'pokeskip-hud';
      hud.title = 'PokéSkip (P) • Glisser-déposer pour déplacer';
      const runCount = PokeSkip.getRunSkippedCount();
      const enabled = PokeSkip.settings.enabled;
      hud.innerHTML = `
        ${this.getPokeballSvg(20)}
        <span class="pokeskip-hud-status ${enabled ? 'on' : 'off'}">
          ${enabled ? '● ON' : '○ OFF'}
        </span>
        <span class="pokeskip-hud-divider">|</span>
        <span class="pokeskip-hud-badge" id="pokeskip-hud-count">${runCount} passée${runCount > 1 ? 's' : ''}</span>
      `;
      this.makeHudDraggable(hud);
      document.body.appendChild(hud);
      this.hudContainer = hud;
    },

    makeHudDraggable(hud) {
      const savedPos = Storage.get('pokeskip_hud_pos', null);
      if (savedPos && typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
        hud.style.left = `${Math.max(10, Math.min(window.innerWidth - 120, savedPos.x))}px`;
        hud.style.top = `${Math.max(10, Math.min(window.innerHeight - 40, savedPos.y))}px`;
        hud.style.right = 'auto';
        hud.style.transform = 'none';
      }

      let isDragging = false;
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;
      let hasMoved = false;

      hud.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
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

        const newX = Math.max(10, Math.min(window.innerWidth - hud.offsetWidth - 10, initialLeft + dx));
        const newY = Math.max(10, Math.min(window.innerHeight - hud.offsetHeight - 10, initialTop + dy));

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
          Storage.set('pokeskip_hud_pos', { x: rect.left, y: rect.top });
        }
      });

      hud.addEventListener('click', (e) => {
        if (hasMoved) {
          e.stopPropagation();
          hasMoved = false;
          return;
        }
        this.toggleModal();
      });
    },

    updateHudBadge() {
      const countEl = document.getElementById('pokeskip-hud-count');
      const statusEl = document.querySelector('.pokeskip-hud-status');
      const enabled = PokeSkip.settings.enabled;
      const runCount = PokeSkip.getRunSkippedCount();

      if (countEl) {
        countEl.textContent = `${runCount} passée${runCount > 1 ? 's' : ''}`;
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
            <div style="display: flex; align-items: center; gap: 10px;">
              ${this.getPokeballSvg(22)}
              <h2 style="margin: 0; font-size: 17px; font-weight: 700; color: #fff;">PokéSkip — Gestion des Futures Capacités par Pokémon</h2>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; cursor: pointer;">
                <input type="checkbox" id="pokeskip-toggle-enabled" ${PokeSkip.settings.enabled ? 'checked' : ''} style="accent-color: #38bdf8;">
                Plugin Actif
              </label>
              <button id="pokeskip-modal-close" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; line-height: 1;">&times;</button>
            </div>
          </div>

          <div class="pokeskip-modal-tabs">
            <button class="pokeskip-tab-btn active" data-tab="team">🎮 Équipe Actuelle</button>
            <button class="pokeskip-tab-btn" data-tab="saved">📚 Espèces Mémorisées</button>
            <button class="pokeskip-tab-btn" data-tab="settings">⚙️ Options & Sauvegarde</button>
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

    bindHotkeys() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
          this.toggleModal();
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
        const speciesId = pkmn.species?.speciesId ?? pkmn.speciesId ?? LineageManager.getRootId(pkmn);
        const name = pkmn.name || pkmn.species?.name || `Pokémon #${idx + 1}`;
        const level = pkmn.level || 1;
        const isShiny = !!pkmn.shiny;
        const spriteUrl = isShiny
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${speciesId}.png`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
        const rule = PokeSkip.getFamilyRule(familyInfo.familyKey);
        const skippedCount = rule?.skippedMoves ? Object.keys(rule.skippedMoves).filter(k => !k.startsWith('id_')).length : 0;

        const card = document.createElement('div');
        card.className = `pokeskip-member-card ${idx === this.selectedTeamIndex ? 'active' : ''}`;
        card.innerHTML = `
          <div class="pokeskip-member-sprite-container">
            <img src="${spriteUrl}" alt="${name}" class="pokeskip-member-sprite" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display:none; font-size: 24px;">⚡</div>
            ${isShiny ? '<span class="pokeskip-shiny-badge" title="Chromatique / Shiny">✨</span>' : ''}
          </div>
          <div class="pokeskip-member-name">${name}</div>
          <div style="font-size: 11px; color: #94a3b8;">Niv. ${level}</div>
          <div class="pokeskip-member-badge">${skippedCount > 0 ? `${skippedCount} ignorée(s)` : 'Toutes gardées'}</div>
        `;
        card.addEventListener('click', () => {
          this.selectedTeamIndex = idx;
          this.renderTeamTab();
        });
        teamContainer.appendChild(card);
      });

      const currentPkmn = party[this.selectedTeamIndex] || party[0];
      if (currentPkmn) {
        this.renderPokemonMoveConfig(contentContainer, currentPkmn);
      }
    },

    renderPokemonMoveConfig(container, pokemon) {
      const familyInfo = LineageManager.getFamilyInfo(pokemon);
      const currentName = pokemon.species?.name || pokemon.name || 'Pokémon';
      const speciesId = pokemon.species?.speciesId ?? pokemon.speciesId ?? LineageManager.getRootId(pokemon);
      const isShiny = !!pokemon.shiny;
      const spriteUrl = isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${speciesId}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
      const rule = PokeSkip.getFamilyRule(familyInfo.familyKey) || { skippedMoves: {}, skipAll: false };

      // Récupération de TOUTES les attaques apprenables (futures + actuelles)
      const learnable = getPokemonFullLearnset(pokemon);

      container.innerHTML = `
        <div style="background: #0f172a; padding: 16px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.2);">
          <div class="pokeskip-moves-header">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="pokeskip-member-sprite-container" style="width: 48px; height: 48px; flex-shrink: 0;">
                <img src="${spriteUrl}" alt="${currentName}" class="pokeskip-member-sprite" style="max-width: 48px; max-height: 48px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="display:none; font-size: 24px;">⚡</div>
                ${isShiny ? '<span class="pokeskip-shiny-badge" title="Chromatique / Shiny">✨</span>' : ''}
              </div>
              <div>
                <h3 style="margin: 0 0 4px 0; font-size: 16px; color: #fff;">
                  Lignée : <span style="color: #38bdf8;">${familyInfo.lineageName}</span>
                </h3>
                <div style="font-size: 12px; color: #94a3b8;">
                  Actuel : <b style="color: #f8fafc;">${currentName}</b> • Les capacités sélectionnées s'appliquent à tous les membres et formes de cette lignée.
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button id="pokeskip-btn-select-all" style="background:#0369a1; color:#fff; border:1px solid #38bdf8; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600;">🔵 Tout garder (Tout cocher)</button>
              <button id="pokeskip-btn-deselect-all" style="background:#1e293b; color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer;">⬜ Tout ignorer (Tout décocher)</button>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 14px;">
            <input type="text" id="pokeskip-move-filter" placeholder="Filtrer une attaque par nom..." style="background:#111a2e; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:7px 12px; color:#fff; font-size:13px; outline:none; flex:1;">
          </div>

          <div class="pokeskip-moves-container" id="pokeskip-moves-grid-el"></div>
        </div>
      `;

      const grid = container.querySelector('#pokeskip-moves-grid-el');

      const renderGrid = (filter = '') => {
        grid.innerHTML = '';
        const currentRule = PokeSkip.getFamilyRule(familyInfo.familyKey) || { skippedMoves: {} };

        const filtered = learnable.filter(m => !filter || m.name.toLowerCase().includes(filter.toLowerCase()));

        if (filtered.length === 0) {
          grid.innerHTML = `<div style="color: #64748b; font-size: 13px; text-align: center; padding: 20px;">Aucune capacité trouvée.</div>`;
          return;
        }

        filtered.forEach(moveItem => {
          const isSkipped = PokeSkip.isMoveSkipped(pokemon, moveItem.name, moveItem.moveId);
          const isKept = !isSkipped;
          const cardEl = document.createElement('div');
          cardEl.className = `pokeskip-move-card ${isSkipped ? 'skipped' : ''}`;
          cardEl.innerHTML = `
            <div class="pokeskip-move-top">
              <div class="pokeskip-move-left">
                <span class="pokeskip-move-lvl-pill">${typeof moveItem.level === 'number' ? `Niv. ${moveItem.level}` : moveItem.level}</span>
                <span class="pokeskip-move-name-txt">${moveItem.name}</span>
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

      container.querySelector('#pokeskip-move-filter').addEventListener('input', (e) => {
        renderGrid(e.target.value);
      });

      container.querySelector('#pokeskip-btn-select-all').addEventListener('click', () => {
        // Tout garder (Tout cocher en bleu)
        learnable.forEach(m => PokeSkip.setMoveSkipped(pokemon, currentName, m.name, m.moveId, false));
        if (rule.skippedMoves) {
          for (const k of Object.keys(rule.skippedMoves)) {
            PokeSkip.setMoveSkipped(pokemon, currentName, k, null, false);
          }
        }
        renderGrid(container.querySelector('#pokeskip-move-filter').value);
        UI.showToast(`Toutes les capacités sont <b>gardées</b> pour <b>${familyInfo.lineageName}</b>`, 'info');
      });

      container.querySelector('#pokeskip-btn-deselect-all').addEventListener('click', () => {
        // Tout ignorer (Tout décocher)
        learnable.forEach(m => PokeSkip.setMoveSkipped(pokemon, currentName, m.name, m.moveId, true));
        renderGrid(container.querySelector('#pokeskip-move-filter').value);
        UI.showToast(`Toutes les capacités sont <b>ignorées</b> pour <b>${familyInfo.lineageName}</b>`, 'warning');
      });
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
        const el = document.createElement('div');
        el.style.cssText = 'background: #111a2e; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 14px;';
        el.innerHTML = `
          <div style="flex: 1;">
            <div style="font-size: 15px; font-weight: 700; color: #fff;">${rule.lineageName || `Lignée #${rule.familyId || famKey}`}</div>
            <div style="font-size: 12px; color: #38bdf8; margin-top: 4px;">
              ${skippedKeys.length > 0 ? `Capacités ignorées (${skippedKeys.length}) : ${skippedKeys.join(', ')}` : 'Aucune capacité ignorée'}
            </div>
          </div>
          <button style="background:rgba(225,29,72,0.2); border:1px solid rgba(225,29,72,0.4); color:#fda4af; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; white-space:nowrap;">
            Supprimer la règle
          </button>
        `;

        el.querySelector('button').addEventListener('click', () => {
          if (confirm(`Supprimer les règles enregistrées pour ${rule.lineageName} ?`)) {
            PokeSkip.deleteFamilyRule(famKey);
            this.renderSavedSpeciesTab();
            this.showToast(`Règle supprimée pour ${rule.lineageName}`, 'info');
          }
        });

        container.appendChild(el);
      });
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
