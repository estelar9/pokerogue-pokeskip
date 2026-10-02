// State & Store de PokeSkip
import { PokeStorage } from './storage.js';
import { STORAGE_KEY, SETTINGS_KEY, STATS_KEY } from '../constants/storage-keys.js';
import { LineageManager } from './lineage-manager.js';

export const PokeSkip = {
    rules: PokeStorage.get(STORAGE_KEY, {}),
    settings: (() => {
      const s = Object.assign({
        enabled: true,
        language: 'auto',
        showToasts: true,
        toastDuration: 2800,
        soundFeedback: false,
        showQuickPrompt: true,
        quickPromptDuration: 15,
        showHudCount: true,
        advancedMode: false,
        promptAutoReplacement: true
      }, PokeStorage.get(SETTINGS_KEY, {}));
      if (s.toastDuration === 4000) s.toastDuration = 2800;
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
        const sc = this.scene || (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window).globalScene;
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
      if (typeof this.onStatsChanged === 'function') {
        this.onStatsChanged();
      }
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
            doNotPromptMoves: Object.assign({}, rule.doNotPromptMoves || {}),
            skipAll: !!rule.skipAll,
            enabled: rule.enabled !== false,
            replacements: Array.isArray(rule.replacements) ? rule.replacements.slice() : [],
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
        this.rules[famKey].enabled = (this.rules[famKey].enabled === false);
        this.rules[famKey].updatedAt = Date.now();
      }
      this.saveRules();
      return this.rules[famKey].enabled;
    },

    isMoveSkipped(target, moveName, moveId) {
      if (!this.settings.enabled) return false;
      const rule = this.getFamilyRule(target);
      if (!rule) return false; // Par défaut : RIEN n'est skip !
      if (rule.enabled === false) return false; // Paramétrage suspendu / en pause pour cette lignée
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

      const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, '');
      const normName = normalize(moveName);
      const numId = (moveId !== undefined && moveId !== null) ? Number(moveId) : null;

      return rule.replacements.some(r => {
        if (!r.enabled) return false;
        if (numId && r.newMoveId && Number(r.newMoveId) === numId) return true;
        if (normName && normalize(r.newMoveName) === normName) return true;
        return false;
      });
    },

    isMovePromptSuppressed(target, moveName, moveId) {
      // 1. Si l'attaque remplace automatiquement une autre en Mode Avancé, le prompt d'ignorance est TOUJOURS supprimé
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
      return (rule && Array.isArray(rule.replacements)) ? rule.replacements : [];
    },

    addReplacementRule(target, newMoveName, arg2, arg3 = null, arg4 = null) {
      let oldMoveName = '';
      let newMoveId = null;
      let oldMoveId = null;

      if (typeof arg2 === 'string') {
        oldMoveName = arg2;
        newMoveId = arg3;
        oldMoveId = arg4;
      } else {
        newMoveId = arg2;
        oldMoveName = typeof arg3 === 'string' ? arg3 : '';
        oldMoveId = arg4;
      }

      if (!newMoveName || !oldMoveName) return null;

      // Auto-activer le mode avancé si l'utilisateur ajoute une règle de remplacement
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

      const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, '');
      const newNorm = normalize(newMoveName);

      // Supprimer une éventuelle règle déjà existante sur la même nouvelle attaque
      this.rules[famKey].replacements = this.rules[famKey].replacements.filter(
        r => normalize(r.newMoveName) !== newNorm
      );

      const ruleObj = {
        id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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
      const r = rule.replacements.find(item => item.id === ruleId);
      if (r) {
        r.enabled = enabled !== undefined ? enabled : !r.enabled;
        rule.updatedAt = Date.now();
        this.saveRules();
        return true;
      }
      return false;
    },

    deleteReplacementRule(target, ruleId) {
      const rule = this.getFamilyRule(target);
      if (!rule || !Array.isArray(rule.replacements)) return false;
      rule.replacements = rule.replacements.filter(item => item.id !== ruleId);
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
      if (rule.enabled === false) return null; // Paramétrage suspendu / en pause pour cette lignée

      const normalize = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, '');
      const incNorm = normalize(incomingMoveName);
      const incId = (incomingMoveId !== undefined && incomingMoveId !== null) ? Number(incomingMoveId) : null;

      return rule.replacements.find(r => {
        if (!r.enabled) return false;
        if (incId && r.newMoveId && Number(r.newMoveId) === incId) return true;
        if (incNorm && normalize(r.newMoveName) === incNorm) return true;
        return false;
      }) || null;
    }
};
