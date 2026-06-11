class ScoreManager {
  constructor() {
    this.INITIAL_LIVES = 3;
    this.BASE_SCORE = 100;
    this.NO_HINT_BONUS = 50;
    this.MASTERY_WRONG_PENALTY = 10;
    this.MASTERY_HINT_PENALTY = 15;
    this.MASTERY_DAY_DECAY = 5;
    this.MASTERY_REDO_BONUS = 20;
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem('syntax_game_progress');
      if (data) {
        const parsed = JSON.parse(data);
        this.score = parsed.score || 0;
        this.lives = parsed.lives !== undefined ? parsed.lives : this.INITIAL_LIVES;
        this.completedLevels = parsed.completedLevels || [];
        this.hintsUsedForLevel = parsed.hintsUsedForLevel || {};
        this.wrongAttempts = parsed.wrongAttempts || {};
        this.errorTypesEncountered = parsed.errorTypesEncountered || {};
        this.attemptsPerLevel = parsed.attemptsPerLevel || {};
        this.livesLostPerLevel = parsed.livesLostPerLevel || {};
        this.wrongRecords = parsed.wrongRecords || {};
        this.levelMeta = parsed.levelMeta || {};
        this.lastAttemptTimes = parsed.lastAttemptTimes || {};
        this.masteryLog = parsed.masteryLog || [];
      } else {
        this.reset();
      }
    } catch (e) {
      this.reset();
    }

    try {
      const notesData = localStorage.getItem('syntax_game_notes');
      this.notes = notesData ? JSON.parse(notesData) : {};
    } catch (e) {
      this.notes = {};
    }

    try {
      const favData = localStorage.getItem('syntax_game_favorites');
      this.favorites = favData ? JSON.parse(favData) : [];
    } catch (e) {
      this.favorites = [];
    }
  }

  save() {
    const data = {
      score: this.score,
      lives: this.lives,
      completedLevels: this.completedLevels,
      hintsUsedForLevel: this.hintsUsedForLevel,
      wrongAttempts: this.wrongAttempts,
      errorTypesEncountered: this.errorTypesEncountered,
      attemptsPerLevel: this.attemptsPerLevel,
      livesLostPerLevel: this.livesLostPerLevel,
      wrongRecords: this.wrongRecords,
      levelMeta: this.levelMeta,
      lastAttemptTimes: this.lastAttemptTimes,
      masteryLog: this.masteryLog
    };
    localStorage.setItem('syntax_game_progress', JSON.stringify(data));
  }

  saveNotes() {
    localStorage.setItem('syntax_game_notes', JSON.stringify(this.notes));
  }

  saveFavorites() {
    localStorage.setItem('syntax_game_favorites', JSON.stringify(this.favorites));
  }

  reset() {
    this.score = 0;
    this.lives = this.INITIAL_LIVES;
    this.completedLevels = [];
    this.hintsUsedForLevel = {};
    this.wrongAttempts = {};
    this.errorTypesEncountered = {};
    this.attemptsPerLevel = {};
    this.livesLostPerLevel = {};
    this.wrongRecords = {};
    this.levelMeta = {};
    this.lastAttemptTimes = {};
    this.masteryLog = [];
    this.notes = {};
    this.favorites = [];
    this.save();
    this.saveNotes();
    this.saveFavorites();
  }

  isLevelCompleted(levelId) {
    return this.completedLevels.includes(levelId);
  }

  isLevelUnlocked(levelId) {
    if (levelId <= 10) return true;
    return this.completedLevels.includes(levelId);
  }

  completeLevel(levelId, usedHint) {
    if (this.completedLevels.includes(levelId)) return;

    this.completedLevels.push(levelId);
    this.score += this.BASE_SCORE;

    if (!usedHint) {
      this.score += this.NO_HINT_BONUS;
    }

    this.save();
    return this.score;
  }

  markHintUsed(levelId) {
    if (this.isLevelCompleted(levelId)) {
      const before = this.calculateMastery(levelId);
      this.hintsUsedForLevel[levelId] = true;
      const after = this.calculateMastery(levelId);
      this.logMasteryChange(levelId, '使用提示', after - before, before, after);
    } else {
      this.hintsUsedForLevel[levelId] = true;
    }
    this.save();
  }

  wasHintUsed(levelId) {
    return !!this.hintsUsedForLevel[levelId];
  }

  recordAttempt(levelId) {
    this.attemptsPerLevel[levelId] = (this.attemptsPerLevel[levelId] || 0) + 1;
    this.recordLastAttempt(levelId);
    this.save();
  }

  recordLastAttempt(levelId) {
    this.lastAttemptTimes[levelId] = Date.now();
    this.save();
  }

  getLastAttemptTime(levelId) {
    return this.lastAttemptTimes[levelId] || null;
  }

  recordLevelMeta(level) {
    this.levelMeta[level.id] = {
      title: level.title,
      language: level.language,
      difficulty: level.difficulty,
      knowledgePoint: level.knowledgePoint,
      knowledgeId: level.knowledgeId,
      inlineKnowledge: level.inlineKnowledge || null,
      errorType: level.errorType,
      category: level.id <= 10 ? (CATEGORY_MAP[level.id] || 'basic-syntax') : 'custom'
    };
    this.save();
  }

  getLevelMeta(levelId) {
    return this.levelMeta[levelId] || null;
  }

  calculateMastery(levelId) {
    if (!this.isLevelCompleted(levelId)) {
      return 0;
    }

    let mastery = 100;
    const wrongCount = this.wrongAttempts[levelId] || 0;
    const usedHint = this.wasHintUsed(levelId) ? 1 : 0;
    const lastTime = this.lastAttemptTimes[levelId];

    mastery -= wrongCount * this.MASTERY_WRONG_PENALTY;
    mastery -= usedHint * this.MASTERY_HINT_PENALTY;

    if (lastTime) {
      const daysSince = (Date.now() - lastTime) / (1000 * 60 * 60 * 24);
      mastery -= Math.floor(daysSince / 7) * this.MASTERY_DAY_DECAY;
    }

    mastery = Math.max(0, Math.min(100, mastery));
    return Math.round(mastery);
  }

  getMasteryLevelText(mastery) {
    if (mastery === 0) return '未掌握';
    if (mastery < 30) return '生疏';
    if (mastery < 60) return '掌握中';
    if (mastery < 85) return '已掌握';
    return '精通';
  }

  getMasteryColorClass(mastery) {
    if (mastery === 0) return 'mastery-none';
    if (mastery < 30) return 'mastery-low';
    if (mastery < 60) return 'mastery-medium';
    if (mastery < 85) return 'mastery-high';
    return 'mastery-perfect';
  }

  updateMasteryOnRedo(levelId) {
    if (!this.isLevelCompleted(levelId)) {
      return;
    }
    const before = this.calculateMastery(levelId);
    this.wrongAttempts[levelId] = 0;
    this.hintsUsedForLevel[levelId] = false;
    this.recordLastAttempt(levelId);
    const after = this.calculateMastery(levelId);
    this.logMasteryChange(levelId, '重做通关', after - before, before, after);
    this.save();
    return after;
  }

  logMasteryChange(levelId, reason, delta, before, after) {
    this.masteryLog.push({
      levelId,
      reason,
      delta,
      before,
      after,
      timestamp: Date.now()
    });
    if (this.masteryLog.length > 500) {
      this.masteryLog = this.masteryLog.slice(-300);
    }
    this.save();
  }

  getMasteryLog(levelId) {
    return this.masteryLog.filter(e => e.levelId === levelId).sort((a, b) => b.timestamp - a.timestamp);
  }

  getWrongBookDataFiltered(filters) {
    const allEntries = this.getWrongBookData();
    if (!filters) return allEntries;

    let result = [...allEntries];

    if (filters.mastery) {
      result = result.filter(e => {
        if (filters.mastery === 'low') return e.mastery < 30;
        if (filters.mastery === 'medium') return e.mastery >= 30 && e.mastery < 60;
        if (filters.mastery === 'high') return e.mastery >= 60 && e.mastery < 85;
        return true;
      });
    }

    if (filters.sort) {
      if (filters.sort === 'last-desc') {
        result.sort((a, b) => b.lastWrongTime - a.lastWrongTime);
      } else if (filters.sort === 'mastery-asc') {
        result.sort((a, b) => a.mastery - b.mastery);
      } else if (filters.sort === 'mastery-desc') {
        result.sort((a, b) => b.mastery - a.mastery);
      } else if (filters.sort === 'wrong-count') {
        result.sort((a, b) => b.wrongCount - a.wrongCount);
      }
    }

    return result;
  }

  getTodayReviewPlan() {
    const allEntries = this.getWrongBookData();
    const today = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    return allEntries.filter(e => {
      const mastery = e.mastery;
      const daysSince = (today - e.lastWrongTime) / (1000 * 60 * 60 * 24);
      return mastery < 50 || daysSince > 7;
    }).sort((a, b) => a.mastery - b.mastery).slice(0, 5);
  }

  setKnowledgeNote(cardId, note) {
    this.notes[cardId] = note;
    this.saveNotes();
  }

  getKnowledgeNote(cardId) {
    return this.notes[cardId] || '';
  }

  toggleFavorite(cardId) {
    const index = this.favorites.indexOf(cardId);
    if (index >= 0) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(cardId);
    }
    this.saveFavorites();
    return this.isFavorite(cardId);
  }

  isFavorite(cardId) {
    return this.favorites.includes(cardId);
  }

  getFavorites() {
    return this.favorites;
  }

  recordWrongAnswer(levelId, errorType) {
    if (this.isLevelCompleted(levelId)) {
      const before = this.calculateMastery(levelId);
      this.wrongAttempts[levelId] = (this.wrongAttempts[levelId] || 0) + 1;
      if (errorType) {
        this.errorTypesEncountered[errorType] = (this.errorTypesEncountered[errorType] || 0) + 1;
      }
      const prevLost = this.livesLostPerLevel[levelId] || 0;
      this.livesLostPerLevel[levelId] = prevLost + 1;
      const after = this.calculateMastery(levelId);
      this.logMasteryChange(levelId, '答错', after - before, before, after);
    } else {
      this.wrongAttempts[levelId] = (this.wrongAttempts[levelId] || 0) + 1;
      if (errorType) {
        this.errorTypesEncountered[errorType] = (this.errorTypesEncountered[errorType] || 0) + 1;
      }
      const prevLost = this.livesLostPerLevel[levelId] || 0;
      this.livesLostPerLevel[levelId] = prevLost + 1;
    }
    this.save();
  }

  recordWrongAnswerDetail(levelId, wrongOptionIndex, wrongOptionCode, levelSnapshot) {
    if (!this.wrongRecords[levelId]) {
      this.wrongRecords[levelId] = [];
    }
    this.wrongRecords[levelId].push({
      wrongOptionIndex: wrongOptionIndex,
      wrongOptionCode: wrongOptionCode,
      levelSnapshot: {
        id: levelId,
        title: levelSnapshot.title,
        language: levelSnapshot.language,
        difficulty: levelSnapshot.difficulty,
        knowledgePoint: levelSnapshot.knowledgePoint,
        knowledgeId: levelSnapshot.knowledgeId,
        errorType: levelSnapshot.errorType,
        correctOptionCode: levelSnapshot.options[levelSnapshot.correctIndex],
        inlineKnowledge: levelSnapshot.inlineKnowledge || null
      },
      timestamp: Date.now()
    });
    this.save();
  }

  getWrongBookData() {
    const entries = [];
    const levelIds = Object.keys(this.wrongRecords).map(Number);

    for (const id of levelIds) {
      const records = this.wrongRecords[id];
      if (!records || records.length === 0) continue;

      const latest = records[records.length - 1];
      const snap = latest.levelSnapshot;
      const meta = this.levelMeta[id];
      const wrongCount = records.length;
      const uniqueWrongOptions = [...new Set(records.map(r => r.wrongOptionIndex))];

      const allWrongDetails = records.map(r => ({
        optionIndex: r.wrongOptionIndex,
        optionCode: r.wrongOptionCode
      }));

      const title = meta ? meta.title : snap.title;
      const language = meta ? meta.language : snap.language;
      const difficulty = meta ? meta.difficulty : snap.difficulty;
      const knowledgePoint = meta ? meta.knowledgePoint : snap.knowledgePoint;
      const knowledgeId = meta ? meta.knowledgeId : snap.knowledgeId;
      const inlineKnowledge = meta ? meta.inlineKnowledge : snap.inlineKnowledge;

      entries.push({
        levelId: id,
        title,
        language,
        difficulty,
        knowledgePoint,
        knowledgeId,
        errorType: snap.errorType,
        correctOptionCode: snap.correctOptionCode,
        inlineKnowledge,
        wrongCount,
        uniqueWrongOptions,
        allWrongDetails,
        lastWrongTime: latest.timestamp,
        mastery: this.calculateMastery(id)
      });
    }

    entries.sort((a, b) => b.lastWrongTime - a.lastWrongTime);
    return entries;
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    this.save();
    return this.lives;
  }

  isGameOver() {
    return this.lives <= 0;
  }

  getStats() {
    return {
      score: this.score,
      lives: this.lives,
      completedCount: this.completedLevels.length,
      totalLevels: LEVELS.length,
      isGameOver: this.isGameOver()
    };
  }

  getReviewData() {
    const errorTypeStats = [];
    const entries = Object.entries(this.errorTypesEncountered);
    entries.sort((a, b) => b[1] - a[1]);
    for (const [type, count] of entries) {
      errorTypeStats.push({ type, count });
    }

    let totalHintsUsed = 0;
    let totalWrongAttempts = 0;
    const levelDetails = [];

    const allLevelIds = new Set([
      ...Object.keys(this.attemptsPerLevel),
      ...Object.keys(this.wrongAttempts),
      ...this.completedLevels.map(String)
    ]);

    const allLevels = [...LEVELS];
    for (const idStr of allLevelIds) {
      const id = parseInt(idStr);
      const level = allLevels.find(l => l.id === id);
      const meta = this.levelMeta[id];
      const title = meta ? meta.title : (level ? level.title : ('\u5173\u5361 ' + id));
      const language = meta ? meta.language : (level ? level.language : '');
      const difficulty = meta ? meta.difficulty : (level ? level.difficulty : 1);
      const knowledgePoint = meta ? meta.knowledgePoint : (level ? level.knowledgePoint : '');
      const knowledgeId = meta ? meta.knowledgeId : (level ? level.knowledgeId : '');
      const inlineKnowledge = meta ? meta.inlineKnowledge : (level ? level.inlineKnowledge : null);
      const category = meta ? meta.category : (level && level.id <= 10 ? (CATEGORY_MAP[level.id] || 'basic-syntax') : 'custom');
      const attempts = this.attemptsPerLevel[id] || 0;
      const wrongs = this.wrongAttempts[id] || 0;
      const hintUsed = this.wasHintUsed(id);
      const livesLost = this.livesLostPerLevel[id] || 0;
      const completed = this.isLevelCompleted(id);
      const mastery = completed ? this.calculateMastery(id) : 0;
      const lastTime = this.lastAttemptTimes[id] || null;

      if (hintUsed) totalHintsUsed++;
      totalWrongAttempts += wrongs;

      levelDetails.push({
        id, title, language, difficulty,
        knowledgePoint, knowledgeId, inlineKnowledge,
        category, attempts, wrongs, hintUsed, livesLost, completed,
        mastery, lastTime
      });
    }

    levelDetails.sort((a, b) => a.id - b.id);

    return {
      score: this.score,
      lives: this.lives,
      completedCount: this.completedLevels.length,
      totalLevels: LEVELS.length,
      totalHintsUsed,
      totalWrongAttempts,
      errorTypeStats,
      levelDetails
    };
  }

  resetReviewData() {
    this.wrongAttempts = {};
    this.errorTypesEncountered = {};
    this.attemptsPerLevel = {};
    this.livesLostPerLevel = {};
    this.hintsUsedForLevel = {};
    this.wrongRecords = {};
    this.levelMeta = {};
    this.lastAttemptTimes = {};
    this.save();
  }
}

const scoreManager = new ScoreManager();