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
      hintsUsedForLevel: this.hintsUsedForLevel
    };
    localStorage.setItem('syntax_game_progress', JSON.stringify(data));
  }

  reset() {
    this.score = 0;
    this.lives = this.INITIAL_LIVES;
    this.completedLevels = [];
    this.hintsUsedForLevel = {};
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
}

const scoreManager = new ScoreManager();