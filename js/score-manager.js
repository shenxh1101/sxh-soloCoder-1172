class ScoreManager {
  constructor() {
    this.INITIAL_LIVES = 3;
    this.BASE_SCORE = 100;
    this.NO_HINT_BONUS = 50;
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
      } else {
        this.reset();
      }
    } catch (e) {
      this.reset();
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
      wrongRecords: this.wrongRecords
    };
    localStorage.setItem('syntax_game_progress', JSON.stringify(data));
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
    this.save();
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
    this.hintsUsedForLevel[levelId] = true;
    this.save();
  }

  wasHintUsed(levelId) {
    return !!this.hintsUsedForLevel[levelId];
  }

  recordAttempt(levelId) {
    this.attemptsPerLevel[levelId] = (this.attemptsPerLevel[levelId] || 0) + 1;
    this.save();
  }

  recordWrongAnswer(levelId, errorType) {
    this.wrongAttempts[levelId] = (this.wrongAttempts[levelId] || 0) + 1;
    if (errorType) {
      this.errorTypesEncountered[errorType] = (this.errorTypesEncountered[errorType] || 0) + 1;
    }
    const prevLost = this.livesLostPerLevel[levelId] || 0;
    this.livesLostPerLevel[levelId] = prevLost + 1;
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
    const allLevels = [...LEVELS];
    const levelIds = Object.keys(this.wrongRecords).map(Number);

    for (const id of levelIds) {
      const records = this.wrongRecords[id];
      if (!records || records.length === 0) continue;

      const latest = records[records.length - 1];
      const snap = latest.levelSnapshot;
      const wrongCount = records.length;
      const uniqueWrongOptions = [...new Set(records.map(r => r.wrongOptionIndex))];

      const allWrongDetails = records.map(r => ({
        optionIndex: r.wrongOptionIndex,
        optionCode: r.wrongOptionCode
      }));

      entries.push({
        levelId: id,
        title: snap.title,
        language: snap.language,
        difficulty: snap.difficulty,
        knowledgePoint: snap.knowledgePoint,
        knowledgeId: snap.knowledgeId,
        errorType: snap.errorType,
        correctOptionCode: snap.correctOptionCode,
        inlineKnowledge: snap.inlineKnowledge,
        wrongCount,
        uniqueWrongOptions,
        allWrongDetails,
        lastWrongTime: latest.timestamp
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
      const title = level ? level.title : ('\u5173\u5361 ' + id);
      const language = level ? level.language : '';
      const difficulty = level ? level.difficulty : 1;
      const attempts = this.attemptsPerLevel[id] || 0;
      const wrongs = this.wrongAttempts[id] || 0;
      const hintUsed = this.wasHintUsed(id);
      const livesLost = this.livesLostPerLevel[id] || 0;
      const completed = this.isLevelCompleted(id);

      if (hintUsed) totalHintsUsed++;
      totalWrongAttempts += wrongs;

      levelDetails.push({
        id, title, language, difficulty,
        attempts, wrongs, hintUsed, livesLost, completed
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
    this.save();
  }
}

const scoreManager = new ScoreManager();