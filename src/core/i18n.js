// ============================================================================
// Module d'internationalisation (i18n) pour PokéSkip
// Support officiel : Français (fr) et Anglais (en)
// ============================================================================

import { PokeSkip } from './state.js';

export const TYPE_NAMES = {
  fr: {
    Normal: { name: 'Normal', code: 'NOR' },
    Combat: { name: 'Combat', code: 'COM' },
    Vol: { name: 'Vol', code: 'VOL' },
    Poison: { name: 'Poison', code: 'POI' },
    Sol: { name: 'Sol', code: 'SOL' },
    Roche: { name: 'Roche', code: 'ROC' },
    Insecte: { name: 'Insecte', code: 'INS' },
    Spectre: { name: 'Spectre', code: 'SPE' },
    Acier: { name: 'Acier', code: 'ACI' },
    Feu: { name: 'Feu', code: 'FEU' },
    Eau: { name: 'Eau', code: 'EAU' },
    Plante: { name: 'Plante', code: 'PLA' },
    Électrik: { name: 'Électrik', code: 'ÉLE' },
    Psy: { name: 'Psy', code: 'PSY' },
    Glace: { name: 'Glace', code: 'GLA' },
    Dragon: { name: 'Dragon', code: 'DRA' },
    Ténèbres: { name: 'Ténèbres', code: 'TÉN' },
    Fée: { name: 'Fée', code: 'FÉE' },
    Stellaire: { name: 'Stellaire', code: 'STE' }
  },
  en: {
    Normal: { name: 'Normal', code: 'NOR' },
    Combat: { name: 'Fighting', code: 'FIG' },
    Vol: { name: 'Flying', code: 'FLY' },
    Poison: { name: 'Poison', code: 'POI' },
    Sol: { name: 'Ground', code: 'GRO' },
    Roche: { name: 'Rock', code: 'ROC' },
    Insecte: { name: 'Bug', code: 'BUG' },
    Spectre: { name: 'Ghost', code: 'GHO' },
    Acier: { name: 'Steel', code: 'STE' },
    Feu: { name: 'Fire', code: 'FIR' },
    Eau: { name: 'Water', code: 'WAT' },
    Plante: { name: 'Grass', code: 'GRA' },
    Électrik: { name: 'Electric', code: 'ELE' },
    Psy: { name: 'Psychic', code: 'PSY' },
    Glace: { name: 'Ice', code: 'ICE' },
    Dragon: { name: 'Dragon', code: 'DRA' },
    Ténèbres: { name: 'Dark', code: 'DAR' },
    Fée: { name: 'Fairy', code: 'FAI' },
    Stellaire: { name: 'Stellar', code: 'STL' }
  }
};

export const CATEGORY_NAMES = {
  fr: ['Physique', 'Spéciale', 'Statut'],
  en: ['Physical', 'Special', 'Status']
};

export const TRANSLATIONS = {
  fr: {
    // HUD
    hud_active: 'PokéSkip (Actif - ON) • Raccourci P • Glisser pour déplacer',
    hud_paused: 'PokéSkip (En pause - OFF) • Raccourci P • Glisser pour déplacer',
    hud_pill_title_on: 'PokéSkip (Actif - ON) • Clic pour gérer les capacités • Raccourci P',
    hud_pill_title_off: 'PokéSkip (En pause - OFF) • Clic pour gérer les capacités • Raccourci P',
    hud_type_btn_title: 'Tableau des Types (Touche T)',
    hud_count_passed_one: '{count} passée',
    hud_count_passed_many: '{count} passées',

    // Modal Header & Tabs
    header_badge: 'Auto-Skip Intelligent',
    header_subtitle: 'Gestion automatisée des nouvelles capacités par Pokémon',
    status_active: 'Actif',
    status_inactive: 'Inactif',
    switch_title: 'Activer / Désactiver PokéSkip',
    close_btn_title: 'Fermer la fenêtre (Échap)',
    tab_team: 'Mon Équipe',
    tab_saved: 'Règles & Espèces',
    tab_global: 'Règles Globales',
    tab_settings: 'Paramètres',

    // Global Rules Tab (Universal Move Upgrades)
    global_title: 'Améliorations Universelles d\'Attaques',
    global_subtitle: 'Remplace automatiquement les attaques de base par leurs évolutions supérieures directes sur l\'ensemble de vos Pokémon.',
    global_master_switch: 'Activer les améliorations universelles',
    global_master_active: 'Actif',
    global_master_inactive: 'Désactivé',
    global_search_placeholder: 'Rechercher une attaque ou un type (ex: Flamme, Plante, Surf)...',
    global_active_count: '{active}/{total} active(s)',
    global_btn_enable_all: 'Tout activer',
    global_btn_disable_all: 'Tout désactiver',
    global_empty_search: 'Aucune chaîne d\'amélioration ne correspond à votre recherche.',
    global_chain_disabled: '⏸️ Chaîne en pause',
    global_chain_enabled: '✓ Chaîne active',
    global_move_tooltip_power: 'Puissance',
    global_move_tooltip_acc: 'Précision',
    global_move_tooltip_pp: 'PP',
    global_move_tooltip_cat: 'Type de dégât',
    global_move_tooltip_type: 'Type',
    global_move_tooltip_active: '✓ Active dans la chaîne',
    global_move_tooltip_disabled: '❌ Exclue de la chaîne (sautée)',
    global_move_tooltip_click_disable: 'Cliquer pour exclure',
    global_move_tooltip_click_enable: 'Cliquer pour réactiver',
    global_move_excluded_badge: 'Exclue',

    // Team Tab
    team_empty_msg: '⚠️ Aucune partie en cours détectée ou équipe vide.<br>Lancez une partie dans PokéRogue pour voir votre équipe active, ou utilisez l\'onglet <b>"Espèces Mémorisées"</b> !',
    team_pause_rules: 'Mettre en pause les règles de ce Pokémon',
    team_resume_rules: 'Réactiver les règles pour ce Pokémon',
    team_search_placeholder: 'Filtrer une capacité ou évolution...',
    team_th_move: 'Capacité',
    team_th_type: 'Type',
    team_th_cat: 'Catégorie',
    team_th_power: 'Puissance',
    team_th_acc: 'Précision',
    team_th_pp: 'PP',
    team_th_effect: 'Description & Effet',
    team_th_skip: 'Ignorer ?',
    team_no_moves: 'Aucune capacité ne correspond à votre filtre.',
    team_evo_badge: '🧬 {name}',
    team_egg_badge: '🥚 Œuf',
    team_level_prefix: 'Niv. ',
    team_keep_title: 'Coché = Apprendre normalement',
    team_skip_title: 'Décoché = Ignorer automatiquement',

    // Saved Species Tab
    saved_empty: 'Aucune règle mémorisée pour le moment.<br>Décochez des attaques dans l\'équipe actuelle pour les ignorer : elles resteront enregistrées pour toute la lignée !',
    saved_subtitle: 'Retrouvez ici toutes les lignées d\'espèces configurées. Vos réglages s\'appliquent automatiquement à tous leurs stades évolutifs et formes, d\'une partie à l\'autre.',
    saved_search_placeholder: 'Rechercher une espèce...',
    saved_edit_btn: '✏️ Modifier',
    saved_del_btn: 'Supprimer la règle',
    saved_confirm_del: 'Supprimer les règles enregistrées pour {name} ?',
    saved_skipped_summary: 'Capacités ignorées ({count}) : <b>{moves}</b>',
    saved_none_skipped: '<i>Aucune capacité ignorée</i>',
    saved_back_btn: '← Retour aux espèces',
    saved_view_in_team: '👥 Voir dans l\'Équipe Actuelle',
    saved_lineage_label: 'Lignée : <b>{name}</b>',
    saved_lineage_desc: 'Modifiez les capacités ignorées pour toute la lignée (tous stades et formes).',
    saved_add_placeholder: 'Ajouter une capacité à ignorer (ex: Tornade, Charge)...',
    saved_add_btn: '+ Ignorer',
    saved_current_ignored_title: 'Capacités actuellement ignorées ({count}) :',
    saved_restore_all_btn: 'Tout rétablir (Ne rien ignorer)',
    saved_no_moves_ignored: 'Aucune capacité n\'est ignorée pour cette lignée.<br>Toutes les attaques proposées seront apprises ou présentées normalement.',
    saved_badge_ignored: '✕ Ignorée',
    saved_keep_again: '✓ Garder à nouveau',
    saved_lineage_fallback: 'Lignée #{id}',
    saved_count_skipped_one: '{count} capacité ignorée',
    saved_count_skipped_many: '{count} capacités ignorées',
    saved_paused: '⏸️ En pause',
    saved_restore_all: 'Tout rétablir',
    saved_back: '⬅ Retour à la liste',

    // Replacements Tab
    rep_header: 'Mode Avancé : Remplacement Automatique de Capacités',
    rep_active_count: '{active}/{total} active(s)',
    rep_clear_all: '🗑️ Tout supprimer ({count})',
    rep_desc: 'Définit les attaques à remplacer automatiquement : dès que la nouvelle capacité est débloquée et que le Pokémon possède 4 attaques, l\'ancienne est remplacée sans interrompre le jeu.',
    rep_add_title: '➕ Ajouter une règle de remplacement :',
    rep_label_old: 'Toujours remplacer :',
    rep_label_new: 'Par la nouvelle :',
    rep_placeholder_old: 'Ancienne capacité...',
    rep_placeholder_new: 'Nouvelle capacité...',
    rep_save_btn: '+ Enregistrer',
    rep_arrow: '➔ par ➔',
    rep_empty: 'Aucune règle de remplacement pour <b>{name}</b>.<br>Créez une règle ci-dessus pour remplacer automatiquement une ancienne attaque dès le déblocage d\'une nouvelle.',
    rep_toggle_disable: 'Désactiver',
    rep_toggle_enable: 'Activer',
    rep_status_active: 'Active',
    rep_status_disabled: 'Désactivée',
    rep_opt_start: '[Départ] ',
    rep_opt_evol: '[Évolution] ',
    rep_opt_level: '[Niv. {level}] ',
    rep_opt_egg: '[🥚 Œuf] ',
    rep_opt_current: '[Actuelle] ',
    rep_opt_suffix_current: ' (Actuelle)',
    rep_confirm_clear: 'Supprimer toutes les règles de remplacement pour {name} ?',

    // Settings Tab
    settings_lang_title: 'Langue de l\'interface',
    settings_lang_desc: 'Choisissez la langue d\'affichage de PokéSkip (ou synchronisez-la automatiquement avec PokéRogue).',
    settings_lang_auto: 'Automatique (selon PokéRogue)',
    settings_lang_fr: 'Français',
    settings_lang_en: 'English (Anglais)',
    settings_notif_title: 'Notifications & Alertes',
    settings_toasts_label: 'Afficher les notifications toast lors d\'un auto-skip',
    settings_toast_duration: 'Durée d\'affichage des notifications :',
    settings_hud_count_label: 'Afficher le compteur de capacités passées sur la pastille',
    settings_quick_prompt_label: 'Proposer d\'ignorer pour toujours une nouvelle attaque en combat',
    settings_quick_prompt_duration: 'Durée d\'affichage du message rapide :',
    settings_seconds: 'secondes',
    settings_advanced_title: '⚡ Mode Avancé : Remplacement d\'Attaques',
    settings_advanced_enable: 'Activer',
    settings_advanced_desc: 'Permet de configurer des remplacements automatiques d\'anciennes attaques lorsqu\'une nouvelle capacité (non ignorée) est apprise et que le Pokémon possède déjà 4 attaques.',
    settings_advanced_status_on: '✓ Actif : les sections de remplacement sont visibles dans les onglets.',
    settings_advanced_status_off: '✕ Désactivé : les règles sont conservées mais non exécutées.',
    settings_prompt_auto_rep: 'Proposer d\'enregistrer les remplacements manuels détectés',
    settings_prompt_auto_rep_desc: 'Affiche un toast interactif lorsqu\'un remplacement est effectué manuellement en jeu pour l\'enregistrer dans les règles de remplacement automatique.',
    settings_replacement_prompt_duration: 'Durée d\'affichage du toast de remplacement :',
    settings_io_title: 'Exportation / Importation',
    settings_io_desc: 'Transférez vos règles de skip et vos paramètres d\'options vers un autre navigateur ou ordinateur.',
    settings_export_btn: '📤 Exporter (JSON)',
    settings_import_btn: '📥 Importer (JSON)',
    settings_reset_title: 'Réinitialisation',
    settings_reset_desc: 'Effacer l\'ensemble de vos règles de skip ou restaurer les réglages par défaut.',
    settings_reset_rules_btn: '🗑️ Réinitialiser toutes les règles',
    settings_reset_settings_btn: '↺ Restaurer les options par défaut',

    // Type Chart
    tc_title: 'Forces & Faiblesses',
    tc_tab_simplified: '⚡ Simplifié',
    tc_tab_complete: '📊 Complet',
    tc_immunities: '🛡️ Immunités (×0)',
    tc_weaknesses: '⚠️ Faiblesses (reçoit ×2)',
    tc_type: 'Type',
    tc_strengths: 'Forces (inflige ×2) ⚔️',
    tc_def_header: '🛡️ Déf. ➔',
    tc_att_header: '⬇ ⚔️ Att.',
    tc_legend_super: '×2 Super',
    tc_legend_half: '×0.5 Peu',
    tc_legend_zero: '×0 Inefficace',
    tc_legend_neutral: '×1 Neutre',
    tc_close_tip: '{t_key} ou {esc_key} Fermer',
    tc_takes_double: 'Subit ×2 de {type}',
    tc_deals_double: 'Inflige ×2 à {type}',
    tc_immune_against: 'Immunisé contre {type} (×0)',

    // Quick Prompt
    qp_prompt_text: '⚡ Ignorer {move} sur <b>{pokemon}</b> ?',
    qp_skip_always: 'Toujours ignorer',
    qp_never_ask: 'Ne plus demander',
    qp_never_ask_title: 'Ne plus proposer d\'ignorer cette attaque pour ce Pokémon',

    // Toasts & Messages
    toast_enabled: 'PokéSkip activé',
    toast_paused: 'PokéSkip en pause',
    toast_ready: 'PokéSkip activé et prêt !',
    toast_never_ask_ack: 'ℹ️ Vous ne serez plus interrogé pour <b>{move}</b> sur <b>{pokemon}</b>.',
    toast_rule_saved: '✅ Règle enregistrée : <b>{pokemon}</b> ignorera {move} !',
    toast_move_skipped: '🛡️ Capacité <b>{move}</b> ignorée pour <b>{pokemon}</b> !',
    toast_auto_replaced: '🔄 <b>{newMove}</b> a automatiquement remplacé <b>{oldMove}</b> sur <b>{pokemon}</b> !',
    toast_save_manual_rep: '💾 Remplacement manuel : Enregistrer {oldMove} ➔ {newMove} sur {pokemon} ?',
    toast_save_btn: 'Enregistrer',
    toast_export_success: 'Règles et paramètres exportés en fichier JSON',
    toast_import_invalid: 'Erreur : le fichier JSON est invalide ou vide.',
    toast_import_success: 'Succès : {details} importé(s) !',
    toast_import_empty: 'Aucune règle ou paramètre trouvé dans ce fichier.',
    toast_import_error: 'Erreur : impossible de lire ou parser ce fichier JSON.',
    toast_read_error: 'Erreur lors de la lecture du fichier.',
    toast_rules_cleared: 'Toutes les règles ont été effacées.',
    toast_settings_reset: 'Options réinitialisées par défaut.',
    toast_lineage_paused: '⏸️ Paramétrage mis en pause pour <b>{name}</b> (sélections conservées)',
    toast_lineage_resumed: '✅ Paramétrage réactivé pour <b>{name}</b>',
    toast_rep_added: '✅ Règle de remplacement enregistrée pour <b>{name}</b> !',
    toast_rep_deleted: 'Règle de remplacement supprimée.',
    toast_rep_all_deleted: 'Toutes les règles de remplacement supprimées pour <b>{name}</b>.',
    toast_rep_missing_inputs: 'Veuillez renseigner l\'ancienne capacité à remplacer et la nouvelle capacité.',
    toast_rep_identical_inputs: 'La nouvelle capacité et l\'ancienne doivent être différentes.',
    toast_all_moves_restored: 'Toutes les capacités sont rétablies pour <b>{name}</b>',
    toast_single_move_restored: 'Capacité <b>{move}</b> rétablie pour <b>{name}</b>',
    toast_single_move_skipped: 'Capacité <b>{move}</b> ignorée pour <b>{name}</b>',
    toast_single_rule_deleted: 'Règle supprimée pour <b>{name}</b>',
    toast_universal_auto_replaced: '🔄 <b>{newMove}</b> a automatiquement amélioré <b>{oldMove}</b> sur <b>{pokemon}</b> !',
    toast_universal_all_enabled: 'Toutes les chaînes d\'améliorations globales sont activées.',
    toast_universal_all_disabled: 'Toutes les chaînes d\'améliorations globales sont désactivées.',
    toast_universal_chain_toggled: 'Lignée <b>{name}</b> : {status}',
    toast_universal_move_disabled: '🚫 Capacité <b>{move}</b> exclue de l\'automatisation ({chain})',
    toast_universal_move_enabled: '✓ Capacité <b>{move}</b> réactivée dans l\'automatisation ({chain})',

    // Move Resolver
    move_infallible: 'Infaillible',
    move_egg: 'Œuf',
    move_default_name: 'Capacité #{id}',
    move_default_desc: 'Inflige des dégâts ou applique un effet.',

    // Regional
    regional_alola: "{base} d'Alola",
    regional_galar: '{base} de Galar',
    regional_hisui: '{base} de Hisui',
    regional_paldea: '{base} de Paldea'
  },

  en: {
    // HUD
    hud_active: 'PokéSkip (Active - ON) • Shortcut P • Drag to move',
    hud_paused: 'PokéSkip (Paused - OFF) • Shortcut P • Drag to move',
    hud_pill_title_on: 'PokéSkip (Active - ON) • Click to manage moves • Shortcut P',
    hud_pill_title_off: 'PokéSkip (Paused - OFF) • Click to manage moves • Shortcut P',
    hud_type_btn_title: 'Type Chart (Key T)',
    hud_count_passed_one: '{count} skipped',
    hud_count_passed_many: '{count} skipped',

    // Modal Header & Tabs
    header_badge: 'Smart Auto-Skip',
    header_subtitle: 'Automated move management per Pokémon',
    status_active: 'Active',
    status_inactive: 'Paused',
    switch_title: 'Enable / Disable PokéSkip',
    close_btn_title: 'Close window (Esc)',
    tab_team: 'My Team',
    tab_saved: 'Rules & Species',
    tab_global: 'Global Rules',
    tab_settings: 'Settings',

    // Global Rules Tab (Universal Move Upgrades)
    global_title: 'Universal Move Upgrades',
    global_subtitle: 'Automatically replaces base moves with their direct superior upgrades across all your Pokémon.',
    global_master_switch: 'Enable universal move upgrades',
    global_master_active: 'Active',
    global_master_inactive: 'Disabled',
    global_search_placeholder: 'Search a move or type (e.g. Fire, Grass, Surf)...',
    global_active_count: '{active}/{total} active',
    global_btn_enable_all: 'Enable all',
    global_btn_disable_all: 'Disable all',
    global_empty_search: 'No move upgrade chains match your search.',
    global_chain_disabled: '⏸️ Chain paused',
    global_chain_enabled: '✓ Chain active',
    global_move_tooltip_power: 'Power',
    global_move_tooltip_acc: 'Accuracy',
    global_move_tooltip_pp: 'PP',
    global_move_tooltip_cat: 'Category',
    global_move_tooltip_type: 'Type',
    global_move_tooltip_active: '✓ Active in chain',
    global_move_tooltip_disabled: '❌ Excluded from chain (skipped)',
    global_move_tooltip_click_disable: 'Click to exclude',
    global_move_tooltip_click_enable: 'Click to re-enable',
    global_move_excluded_badge: 'Excluded',

    // Team Tab
    team_empty_msg: '⚠️ No active game detected or party is empty.<br>Start a game in PokéRogue to view your party, or check the <b>"Rules & Species"</b> tab!',
    team_pause_rules: 'Pause rules for this Pokémon',
    team_resume_rules: 'Resume rules for this Pokémon',
    team_search_placeholder: 'Filter a move or evolution...',
    team_th_move: 'Move',
    team_th_type: 'Type',
    team_th_cat: 'Category',
    team_th_power: 'Power',
    team_th_acc: 'Accuracy',
    team_th_pp: 'PP',
    team_th_effect: 'Description & Effect',
    team_th_skip: 'Skip?',
    team_no_moves: 'No moves match your filter.',
    team_evo_badge: '🧬 {name}',
    team_egg_badge: '🥚 Egg',
    team_level_prefix: 'Lv. ',
    team_keep_title: 'Checked = Learn normally',
    team_skip_title: 'Unchecked = Auto-skip',

    // Saved Species Tab
    saved_empty: 'No saved rules yet.<br>Uncheck moves in your active team to auto-skip them: they will stay saved for the whole evolutionary line!',
    saved_subtitle: 'Find all configured species lines here. Your preferences automatically apply to all evolutionary stages and forms across runs.',
    saved_search_placeholder: 'Search a species...',
    saved_edit_btn: '✏️ Edit',
    saved_del_btn: 'Delete rule',
    saved_confirm_del: 'Delete saved rules for {name}?',
    saved_skipped_summary: 'Ignored moves ({count}): <b>{moves}</b>',
    saved_none_skipped: '<i>No ignored moves</i>',
    saved_back_btn: '← Back to species',
    saved_view_in_team: '👥 View in Active Team',
    saved_lineage_label: 'Lineage: <b>{name}</b>',
    saved_lineage_desc: 'Manage ignored moves for the entire lineage (all stages and forms).',
    saved_add_placeholder: 'Add a move to ignore (e.g. Tackle, Scratch)...',
    saved_add_btn: '+ Ignore',
    saved_current_ignored_title: 'Currently ignored moves ({count}):',
    saved_restore_all_btn: 'Restore all (Ignore nothing)',
    saved_no_moves_ignored: 'No moves are ignored for this lineage.<br>All moves offered will be learned or shown normally.',
    saved_badge_ignored: '✕ Ignored',
    saved_keep_again: '✓ Keep again',
    saved_lineage_fallback: 'Lineage #{id}',
    saved_count_skipped_one: '{count} move skipped',
    saved_count_skipped_many: '{count} moves skipped',
    saved_paused: '⏸️ Paused',
    saved_restore_all: 'Restore all',
    saved_back: '⬅ Back to list',

    // Replacements Tab
    rep_header: 'Advanced Mode: Auto Move Replacements',
    rep_active_count: '{active}/{total} active',
    rep_clear_all: '🗑️ Clear all ({count})',
    rep_desc: 'Configure moves to automatically replace: once the new move is learned and the Pokémon already has 4 moves, the old one is replaced seamlessly.',
    rep_add_title: '➕ Add a replacement rule:',
    rep_label_old: 'Always replace:',
    rep_label_new: 'With new move:',
    rep_placeholder_old: 'Old move...',
    rep_placeholder_new: 'New move...',
    rep_save_btn: '+ Save',
    rep_arrow: '➔ with ➔',
    rep_empty: 'No replacement rules for <b>{name}</b>.<br>Add a rule above to automatically replace an old move when learning a new one.',
    rep_toggle_disable: 'Disable',
    rep_toggle_enable: 'Enable',
    rep_status_active: 'Active',
    rep_status_disabled: 'Disabled',
    rep_opt_start: '[Start] ',
    rep_opt_evol: '[Evolution] ',
    rep_opt_level: '[Lv. {level}] ',
    rep_opt_egg: '[🥚 Egg] ',
    rep_opt_current: '[Current] ',
    rep_opt_suffix_current: ' (Current)',
    rep_confirm_clear: 'Delete all replacement rules for {name}?',

    // Settings Tab
    settings_lang_title: 'Interface Language',
    settings_lang_desc: 'Choose PokéSkip\'s display language (or synchronize automatically with PokéRogue).',
    settings_lang_auto: 'Automatic (match PokéRogue)',
    settings_lang_fr: 'Français (French)',
    settings_lang_en: 'English',
    settings_notif_title: 'Notifications & Alerts',
    settings_toasts_label: 'Show toast notifications on auto-skip',
    settings_toast_duration: 'Toast notification duration:',
    settings_hud_count_label: 'Show skipped moves count on HUD pill',
    settings_quick_prompt_label: 'Prompt to decline new moves in battle (Quick Prompt)',
    settings_quick_prompt_duration: 'Quick prompt duration:',
    settings_seconds: 'seconds',
    settings_advanced_title: '⚡ Advanced Mode: Move Replacements',
    settings_advanced_enable: 'Enable',
    settings_advanced_desc: 'Configure automated replacements for old moves when a new move is learned and the Pokémon already has 4 moves.',
    settings_advanced_status_on: '✓ Active: replacement sections are visible in tabs.',
    settings_advanced_status_off: '✕ Disabled: rules are preserved but not executed.',
    settings_prompt_auto_rep: 'Prompt to save manual replacements detected in-game',
    settings_prompt_auto_rep_desc: 'Displays an interactive toast when a replacement is performed manually in-game to save it as an auto-replacement rule.',
    settings_replacement_prompt_duration: 'Replacement toast duration:',
    settings_io_title: 'Export / Import',
    settings_io_desc: 'Transfer your skip rules and settings to another browser or computer.',
    settings_export_btn: '📤 Export (JSON)',
    settings_import_btn: '📥 Import (JSON)',
    settings_reset_title: 'Reset',
    settings_reset_desc: 'Clear all your skip rules or restore default settings.',
    settings_reset_rules_btn: '🗑️ Reset all rules',
    settings_reset_settings_btn: '↺ Restore default settings',

    // Type Chart
    tc_title: 'Strengths & Weaknesses',
    tc_tab_simplified: '⚡ Simplified',
    tc_tab_complete: '📊 Complete',
    tc_immunities: '🛡️ Immunities (×0)',
    tc_weaknesses: '⚠️ Weaknesses (takes ×2)',
    tc_type: 'Type',
    tc_strengths: 'Strengths (deals ×2) ⚔️',
    tc_def_header: '🛡️ Def. ➔',
    tc_att_header: '⬇ ⚔️ Att.',
    tc_legend_super: '×2 Super',
    tc_legend_half: '×0.5 Resisted',
    tc_legend_zero: '×0 Immune',
    tc_legend_neutral: '×1 Neutral',
    tc_close_tip: '{t_key} or {esc_key} Close',
    tc_takes_double: 'Takes ×2 from {type}',
    tc_deals_double: 'Deals ×2 to {type}',
    tc_immune_against: 'Immune to {type} (×0)',

    // Quick Prompt
    qp_prompt_text: '⚡ Skip {move} on <b>{pokemon}</b>?',
    qp_skip_always: 'Always Skip',
    qp_never_ask: 'Never ask again',
    qp_never_ask_title: 'Do not prompt to skip this move for this Pokémon',

    // Toasts & Messages
    toast_enabled: 'PokéSkip enabled',
    toast_paused: 'PokéSkip paused',
    toast_ready: 'PokéSkip enabled and ready!',
    toast_never_ask_ack: 'ℹ️ You will no longer be asked about <b>{move}</b> on <b>{pokemon}</b>.',
    toast_rule_saved: '✅ Rule saved: <b>{pokemon}</b> will skip {move}!',
    toast_move_skipped: '🛡️ Move <b>{move}</b> skipped for <b>{pokemon}</b>!',
    toast_auto_replaced: '🔄 <b>{newMove}</b> automatically replaced <b>{oldMove}</b> on <b>{pokemon}</b>!',
    toast_save_manual_rep: '💾 Manual replacement: Save {oldMove} ➔ {newMove} on {pokemon}?',
    toast_save_btn: 'Save',
    toast_export_success: 'Rules and settings exported to JSON file',
    toast_import_invalid: 'Error: JSON file is invalid or empty.',
    toast_import_success: 'Success: {details} imported!',
    toast_import_empty: 'No rules or settings found in this file.',
    toast_import_error: 'Error: unable to read or parse this JSON file.',
    toast_read_error: 'Error reading file.',
    toast_rules_cleared: 'All rules have been cleared.',
    toast_settings_reset: 'Settings reset to default.',
    toast_lineage_paused: '⏸️ Settings paused for <b>{name}</b> (selections kept)',
    toast_lineage_resumed: '✅ Settings resumed for <b>{name}</b>',
    toast_rep_added: '✅ Replacement rule saved for <b>{name}</b>!',
    toast_rep_deleted: 'Replacement rule deleted.',
    toast_rep_all_deleted: 'All replacement rules deleted for <b>{name}</b>.',
    toast_rep_missing_inputs: 'Please enter both the old move to replace and the new move.',
    toast_rep_identical_inputs: 'The new move and old move must be different.',
    toast_all_moves_restored: 'All moves restored for <b>{name}</b>',
    toast_single_move_restored: 'Move <b>{move}</b> restored for <b>{name}</b>',
    toast_single_move_skipped: 'Move <b>{move}</b> skipped for <b>{name}</b>',
    toast_single_rule_deleted: 'Rule deleted for <b>{name}</b>',
    toast_universal_auto_replaced: '🔄 <b>{newMove}</b> automatically upgraded <b>{oldMove}</b> on <b>{pokemon}</b>!',
    toast_universal_all_enabled: 'All global move upgrade chains are enabled.',
    toast_universal_all_disabled: 'All global move upgrade chains are disabled.',
    toast_universal_chain_toggled: 'Chain <b>{name}</b>: {status}',
    toast_universal_move_disabled: '🚫 Move <b>{move}</b> excluded from automation ({chain})',
    toast_universal_move_enabled: '✓ Move <b>{move}</b> re-enabled in automation ({chain})',

    // Move Resolver
    move_infallible: 'Never-miss',
    move_egg: 'Egg',
    move_default_name: 'Move #{id}',
    move_default_desc: 'Deals damage or applies an effect.',

    // Regional
    regional_alola: 'Alolan {base}',
    regional_galar: 'Galarian {base}',
    regional_hisui: 'Hisuian {base}',
    regional_paldea: 'Paldean {base}'
  }
};

/**
 * Détecte la langue courante (fr ou en)
 */
export function getCurrentLang() {
  const pref = PokeSkip.settings?.language || 'auto';
  if (pref === 'fr') return 'fr';
  if (pref === 'en') return 'en';

  // Mode Auto : détection de PokéRogue puis du navigateur
  try {
    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const gameLang = win.i18next?.language || (typeof localStorage !== 'undefined' && localStorage.getItem('i18nextLng'));
    if (gameLang) {
      if (gameLang.toLowerCase().startsWith('fr')) return 'fr';
      return 'en';
    }
  } catch (_) {}

  if (typeof navigator !== 'undefined' && navigator.language) {
    if (navigator.language.toLowerCase().startsWith('fr')) return 'fr';
  }

  return 'en';
}

/**
 * Renvoie vrai si la langue active est le français
 */
export function isFrench() {
  return getCurrentLang() === 'fr';
}

/**
 * Renvoie vrai si la langue active est l'anglais
 */
export function isEnglish() {
  return getCurrentLang() === 'en';
}

/**
 * Traduit une clé textuelle
 * @param {string} key
 * @param {Object} [params]
 * @returns {string}
 */
export function t(key, params = {}) {
  const lang = getCurrentLang();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let text = dict[key] ?? (TRANSLATIONS.fr[key] || key);

  if (params && typeof params === 'object') {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }
  }

  return text;
}

/**
 * Renvoie le nom d'un type selon la langue courante
 */
export function getTypeName(frenchName) {
  const lang = getCurrentLang();
  const item = TYPE_NAMES[lang]?.[frenchName] || TYPE_NAMES.fr[frenchName];
  return item?.name || frenchName;
}

/**
 * Renvoie le code court d'un type selon la langue courante
 */
export function getTypeCode(frenchName) {
  const lang = getCurrentLang();
  const item = TYPE_NAMES[lang]?.[frenchName] || TYPE_NAMES.fr[frenchName];
  return item?.code || frenchName.substring(0, 3).toUpperCase();
}

/**
 * Renvoie le libellé d'une catégorie (0: Physique, 1: Spéciale, 2: Statut)
 */
export function getCategoryName(catIndex) {
  const lang = getCurrentLang();
  const list = CATEGORY_NAMES[lang] || CATEGORY_NAMES.en;
  return list[catIndex] || list[2];
}
