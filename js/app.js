class App {
  constructor() {
    this.currentPage = 'level-select';
    this.currentLevel = null;
    this.selectedOptionIndex = -1;
    this.hintRevealed = false;
    this.customLevels = [];
    this.loadCustomLevels();
    this.init();
  }

  loadCustomLevels() {
    try {
      const data = localStorage.getItem('syntax_game_custom_levels');
      if (data) {
        this.customLevels = JSON.parse(data);
      }
    } catch (e) {
      this.customLevels = [];
    }
  }

  saveCustomLevels() {
    localStorage.setItem('syntax_game_custom_levels', JSON.stringify(this.customLevels));
  }

  init() {
    this.bindGlobalEvents();
    this.navigateTo('level-select');
    this.updateStatusBar();
  }

  bindGlobalEvents() {
    document.getElementById('themeToggle').addEventListener('click', () => {
      themeManager.toggle();
      this.updateThemeIcon();
      this.renderCurrentPage();
    });

    document.getElementById('btnBackToMenu').addEventListener('click', () => {
      this.navigateTo('level-select');
    });

    document.getElementById('btnCustomLevel').addEventListener('click', () => {
      this.navigateTo('custom-level');
    });

    document.getElementById('btnFavorites').addEventListener('click', () => {
      this.openFavorites();
    });

    document.getElementById('btnReviewPage').addEventListener('click', () => {
      this.navigateTo('review');
    });

    document.getElementById('btnWrongBook').addEventListener('click', () => {
      this.navigateTo('wrong-book');
    });

    document.getElementById('btnValidateLevels').addEventListener('click', () => {
      this.validateLevels();
    });

    document.getElementById('btnBackFromCustom').addEventListener('click', () => {
      this.navigateTo('level-select');
    });

    document.getElementById('btnCancelCustom').addEventListener('click', () => {
      this.navigateTo('level-select');
    });

    document.getElementById('btnSubmitCustom').addEventListener('click', () => {
      this.submitCustomLevel();
    });

    document.getElementById('btnBackFromReview').addEventListener('click', () => {
      this.navigateTo('level-select');
    });

    document.getElementById('btnBackFromWrongBook').addEventListener('click', () => {
      this.navigateTo('level-select');
    });

    document.getElementById('btnResetReview').addEventListener('click', () => {
      if (confirm('\u786E\u5B9A\u8981\u6E05\u9664\u6240\u6709\u590D\u76D8\u6570\u636E\u5417\uFF1F\uFF08\u5F97\u5206\u548C\u751F\u547D\u503C\u4E0D\u4F1A\u53D7\u5F71\u54CD\uFF09')) {
        scoreManager.resetReviewData();
        this.navigateTo('review');
      }
    });

    document.getElementById('gameOverRestart').addEventListener('click', () => {
      this.closeGameOver();
    });

    document.getElementById('gameOverMenu').addEventListener('click', () => {
      this.closeGameOver();
      this.navigateTo('level-select');
    });

    document.getElementById('closeKnowledgeCard').addEventListener('click', () => {
      this.saveKnowledgeNoteFromModal();
      document.getElementById('knowledgeCardOverlay').classList.add('hidden');
    });

    document.getElementById('knowledgeCardOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.saveKnowledgeNoteFromModal();
        document.getElementById('knowledgeCardOverlay').classList.add('hidden');
      }
    });

    document.getElementById('btnPreviewKnowledge').addEventListener('click', () => {
      this.showKnowledgeCardForCurrentLevel();
    });

    document.getElementById('btnToggleFavorite').addEventListener('click', () => {
      this.toggleKnowledgeFavorite();
    });

    document.getElementById('knowledgeNoteTextarea').addEventListener('input', () => {
      this.saveKnowledgeNoteFromModal();
    });

    document.getElementById('closeValidateModal').addEventListener('click', () => {
      document.getElementById('validateOverlay').classList.add('hidden');
    });

    document.getElementById('validateOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('validateOverlay').classList.add('hidden');
      }
    });

    document.getElementById('closeFavorites').addEventListener('click', () => {
      document.getElementById('favoritesOverlay').classList.add('hidden');
    });

    document.getElementById('favoritesOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('favoritesOverlay').classList.add('hidden');
      }
    });

    document.getElementById('filterMastery').addEventListener('change', () => {
      if (this.currentPage === 'wrong-book') {
        this.renderWrongBook();
      }
    });

    document.getElementById('sortWrongBook').addEventListener('change', () => {
      if (this.currentPage === 'wrong-book') {
        this.renderWrongBook();
      }
    });
  }

  saveKnowledgeNoteFromModal() {
    const textarea = document.getElementById('knowledgeNoteTextarea');
    const cardId = textarea.dataset.cardId;
    if (cardId) {
      scoreManager.setKnowledgeNote(cardId, textarea.value);
    }
  }

  toggleKnowledgeFavorite() {
    const btn = document.getElementById('btnToggleFavorite');
    const cardId = btn.dataset.cardId;
    if (!cardId) return;
    const isNowFav = scoreManager.toggleFavorite(cardId);
    btn.textContent = isNowFav ? '\u2605 \u5DF2\u6536\u85CF' : '\u2606 \u6536\u85CF';
    btn.classList.toggle('btn--favorited', isNowFav);
  }

  updateThemeIcon() {
    const icon = document.getElementById('themeToggle');
    if (themeManager.getTheme() === 'dark') {
      icon.textContent = '\u2600';
      icon.title = '\u5207\u6362\u5230\u4EAE\u8272\u6A21\u5F0F';
    } else {
      icon.textContent = '\u263D';
      icon.title = '\u5207\u6362\u5230\u6697\u8272\u6A21\u5F0F';
    }
  }

  updateStatusBar() {
    const stats = scoreManager.getStats();
    document.getElementById('scoreValue').textContent = stats.score;
    this.renderHearts(stats.lives);
  }

  renderHearts(lives) {
    const container = document.getElementById('livesContainer');
    let html = '';
    for (let i = 0; i < 3; i++) {
      if (i < lives) {
        html += '<span class="heart heart--alive">\u2665</span>';
      } else {
        html += '<span class="heart heart--dead">\u2661</span>';
      }
    }
    container.innerHTML = html;
  }

  navigateTo(page, data) {
    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

    switch (page) {
      case 'level-select':
        document.getElementById('pageLevelSelect').classList.remove('hidden');
        break;
      case 'game-board':
        document.getElementById('pageGameBoard').classList.remove('hidden');
        break;
      case 'custom-level':
        document.getElementById('pageCustomLevel').classList.remove('hidden');
        break;
      case 'review':
        document.getElementById('pageReview').classList.remove('hidden');
        break;
      case 'wrong-book':
        document.getElementById('pageWrongBook').classList.remove('hidden');
        break;
    }
    this.renderCurrentPage(data);
  }

  renderCurrentPage(data) {
    switch (this.currentPage) {
      case 'level-select':
        this.renderLevelSelect();
        break;
      case 'game-board':
        this.renderGameBoard(data);
        break;
      case 'custom-level':
        this.renderCustomLevel();
        break;
      case 'review':
        this.renderReviewPage();
        break;
      case 'wrong-book':
        this.renderWrongBook();
        break;
    }
  }

  renderLevelSelect() {
    const path = document.getElementById('learningPath');
    const allLevels = [...LEVELS, ...this.customLevels];
    const stats = scoreManager.getStats();

    document.getElementById('completedCount').textContent = stats.completedCount;
    document.getElementById('totalLevelCount').textContent = allLevels.length;

    let html = '';

    for (const catDef of LEVEL_CATEGORIES) {
      let levels;
      if (catDef.id === 'custom') {
        levels = this.customLevels;
      } else {
        levels = LEVELS.filter(l => CATEGORY_MAP[l.id] === catDef.id);
      }
      if (levels.length === 0) continue;

      const completed = levels.filter(l => scoreManager.isLevelCompleted(l.id)).length;
      const total = levels.length;
      const progress = Math.round((completed / total) * 100);

      let nextLevel = null;
      for (const l of levels) {
        if (!scoreManager.isLevelCompleted(l.id)) {
          nextLevel = l;
          break;
        }
      }

      html += `<div class="learning-path__group">
        <div class="learning-path__group-header">
          <div class="learning-path__group-info">
            <span class="learning-path__group-name">${catDef.name}</span>
            <span class="learning-path__group-desc">${catDef.description}</span>
          </div>
          <div class="learning-path__group-progress">
            <div class="learning-path__progress-bar">
              <div class="learning-path__progress-fill" style="width:${progress}%"></div>
            </div>
            <span class="learning-path__progress-text">${completed}/${total} 关卡 · ${progress}%</span>
          </div>
        </div>
        <div class="learning-path__nodes">`;

      levels.forEach((level, idx) => {
        const isCompleted = scoreManager.isLevelCompleted(level.id);
        const isNext = nextLevel && level.id === nextLevel.id;
        const isBuiltIn = level.id <= 100;
        const mastery = isCompleted ? scoreManager.calculateMastery(level.id) : 0;
        const mClass = scoreManager.getMasteryColorClass(mastery);
        const mText = scoreManager.getMasteryLevelText(mastery);
        const langLabel = level.language === 'python' ? 'Python' : 'JavaScript';
        const langClass = level.language === 'python' ? 'lang-python' : 'lang-javascript';

        let statusBadge = '';
        if (isCompleted) {
          statusBadge = `<span class="lp-node__mastery ${mClass}">${mText}</span>`;
        } else if (isNext) {
          statusBadge = '<span class="lp-node__next">推荐</span>';
        } else {
          statusBadge = '<span class="lp-node__locked">待解锁</span>';
        }

        html += `
          <div class="lp-node ${isCompleted ? 'lp-node--completed' : ''} ${isNext ? 'lp-node--next' : ''}" data-level-id="${level.id}">
            <div class="lp-node__step">${idx + 1}</div>
            <div class="lp-node__content">
              <div class="lp-node__title">${this.escapeHtml(level.title)}</div>
              <div class="lp-node__meta">
                <span class="level-card__lang ${langClass}">${langLabel}</span>
                <span class="level-card__stars">${this.renderStars(level.difficulty)}</span>
                ${statusBadge}
              </div>
              <div class="lp-node__knowledge">${this.escapeHtml(level.knowledgePoint)}</div>
            </div>
            ${!isBuiltIn ? '<span class="level-badge level-badge--custom">\u81EA\u5B9A\u4E49</span>' : ''}
          </div>
        `;
      });

      html += '</div></div>';
    }

    path.innerHTML = html;

    path.querySelectorAll('.lp-node').forEach(node => {
      node.addEventListener('click', () => {
        const levelId = parseInt(node.dataset.levelId);
        this.startLevel(levelId);
      });
    });

    this.updateStatusBar();
    this.updateThemeIcon();
  }

  startLevel(levelId) {
    const allLevels = [...LEVELS, ...this.customLevels];
    const level = allLevels.find(l => l.id === levelId);
    if (!level) return;

    if (scoreManager.isGameOver() && !scoreManager.isLevelCompleted(levelId)) {
      this.showGameOver();
      return;
    }

    this.currentLevel = level;
    this.selectedOptionIndex = -1;
    this.hintRevealed = false;
    scoreManager.recordLevelMeta(level);
    scoreManager.recordAttempt(levelId);
    this.navigateTo('game-board', level);
  }

  renderGameBoard() {
    const level = this.currentLevel;
    if (!level) return;

    document.getElementById('levelTitle').textContent = `\u5173\u5361 ${level.id}: ${level.title}`;
    document.getElementById('levelLanguage').textContent = level.language === 'python' ? 'Python' : 'JavaScript';
    document.getElementById('levelDifficulty').textContent = this.renderStars(level.difficulty);

    this.renderCodeDisplay(level.buggyCode, level.language, level.errorLine, this.hintRevealed);

    this.renderOptions(level);

    this.renderSandbox();

    document.getElementById('btnKnowledge').style.display = 'inline-flex';
    document.getElementById('btnPreviewKnowledge').style.display = 'inline-flex';

    this.updateGameControls();
    this.updateStatusBar();
  }

  renderCodeDisplay(code, language, errorLine, hintRevealed) {
    const container = document.getElementById('codeDisplay');
    const lines = code.split('\n');

    let html = '';
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const isErrorLine = hintRevealed && lineNum === errorLine;
      const errorClass = isErrorLine ? 'code-line--error' : '';
      const highlighted = this.syntaxHighlight(line, language);

      html += `
        <div class="code-line ${errorClass}">
          <span class="code-line__number">${lineNum}</span>
          <span class="code-line__content">${highlighted}</span>
          ${isErrorLine ? '<span class="code-line__error-tag">\u26A0 \u9519\u8BEF</span>' : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  }

  syntaxHighlight(code, language) {
    let result = this.escapeHtml(code);

    if (language === 'python') {
      result = result.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="syn-string">$1</span>');
      result = result.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="syn-string">$1</span>');
      result = result.replace(/\b(def|if|else|elif|for|while|in|return|print|import|from|class|try|except|True|False|None|and|or|not|is|as|with|break|continue|pass|del)\b/g, '<span class="syn-keyword">$1</span>');
      result = result.replace(/(#.*$)/gm, '<span class="syn-comment">$1</span>');
      result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-number">$1</span>');
    } else {
      result = result.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="syn-string">$1</span>');
      result = result.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="syn-string">$1</span>');
      result = result.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="syn-string">$1</span>');
      result = result.replace(/\b(function|let|const|var|if|else|for|while|return|console|log|true|false|null|undefined|new|class|this|typeof|instanceof|try|catch|throw)\b/g, '<span class="syn-keyword">$1</span>');
      result = result.replace(/(\/\/.*$)/gm, '<span class="syn-comment">$1</span>');
      result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-number">$1</span>');
    }

    return result;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  renderStars(difficulty) {
    let stars = '';
    for (let i = 0; i < difficulty; i++) {
      stars += '\u2605';
    }
    for (let i = difficulty; i < 4; i++) {
      stars += '\u2606';
    }
    return stars;
  }

  renderOptions(level) {
    const container = document.getElementById('optionsContainer');
    const labels = ['A', 'B', 'C', 'D'];
    let html = '';

    level.options.forEach((option, index) => {
      const isSelected = this.selectedOptionIndex === index;
      const selectedClass = isSelected ? 'option-card--selected' : '';

      html += `
        <div class="option-card ${selectedClass}" data-option-index="${index}">
          <div class="option-card__label">${labels[index]}</div>
          <div class="option-card__code">
            <pre>${this.escapeHtml(option)}</pre>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.optionIndex);
        this.selectOption(index);
      });
    });
  }

  selectOption(index) {
    this.selectedOptionIndex = index;
    const cards = document.querySelectorAll('.option-card');
    cards.forEach((card, i) => {
      card.classList.toggle('option-card--selected', i === index);
    });
  }

  renderSandbox() {
    const outputEl = document.getElementById('sandboxOutput');
    const errorEl = document.getElementById('sandboxError');
    outputEl.textContent = '\u70B9\u51FB\u201C\u8FD0\u884C\u201D\u6309\u94AE\u67E5\u770B\u4EE3\u7801\u6267\u884C\u7ED3\u679C...';
    outputEl.classList.remove('sandbox--success');
    errorEl.textContent = '';
    document.getElementById('sandboxErrorLabel').style.display = 'none';
  }

  updateGameControls() {
    const runBtn = document.getElementById('btnRun');
    const hintBtn = document.getElementById('btnHint');
    const knowledgeBtn = document.getElementById('btnKnowledge');

    runBtn.onclick = () => this.runCode();
    hintBtn.onclick = () => this.showHint();
    knowledgeBtn.onclick = () => this.showKnowledgeCard();

    hintBtn.disabled = this.hintRevealed;
    if (this.hintRevealed) {
      hintBtn.classList.add('btn--disabled');
    } else {
      hintBtn.classList.remove('btn--disabled');
    }

    const level = this.currentLevel;
    if (level && level.isCompleted) {
      runBtn.disabled = true;
    } else {
      runBtn.disabled = false;
    }
  }

  runCode() {
    if (this.selectedOptionIndex === -1) {
      this.showSandboxError('\u8BF7\u5148\u9009\u62E9\u4E00\u4E2A\u4FEE\u590D\u65B9\u6848\uFF01');
      return;
    }

    const level = this.currentLevel;
    const selectedCode = level.options[this.selectedOptionIndex];
    const result = sandbox.run(selectedCode, level.language);

    const isOptionCorrect = this.selectedOptionIndex === level.correctIndex;
    const isOutputCorrect = result.success && result.output === level.expectedOutput;

    if (isOptionCorrect && isOutputCorrect) {
      this.showSandboxOutput(result.success ? result.output : selectedCode, true);
      this.onLevelComplete();
      return;
    }

    scoreManager.recordWrongAnswerDetail(
      level.id,
      this.selectedOptionIndex,
      selectedCode,
      level
    );

    let msg = '';
    if (isOptionCorrect && !isOutputCorrect) {
      msg = `\u9009\u62E9\u4E86\u6B63\u786E\u65B9\u6848\uff0c\u4F46\u8FD0\u884C\u8F93\u51FA\u4E0D\u5339\u914D\u3002\n\u671F\u671B\u8F93\u51FA\uFF1A${level.expectedOutput}\n\u5B9E\u9645\u8F93\u51FA\uFF1A${result.success ? result.output : ('\u9519\u8BEF: ' + result.error)}`;
    } else if (!isOptionCorrect && isOutputCorrect) {
      msg = `\u8F93\u51FA\u5DE7\u5DE7\u6B63\u786E\uFF0C\u4F46\u8FD9\u4E0D\u662F\u76EE\u6807\u4FEE\u590D\u65B9\u6848\u3002\n\u9898\u76EE\u8981\u6C42\u4FEE\u590D\u5B83\u662F\u5173\u952E\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002`;
    } else if (result.success) {
      msg = `\u6267\u884C\u6210\u529F\uFF0C\u4F46\u8F93\u51FA\u4E0D\u6B63\u786E\u3002\n\u671F\u671B\u8F93\u51FA\uFF1A${level.expectedOutput}\n\u5B9E\u9645\u8F93\u51FA\uFF1A${result.output}`;
    } else {
      msg = `\u6267\u884C\u9519\u8BEF\uFF1A${result.error}`;
    }

    this.showSandboxError(msg);
    this.onWrongAnswer();
  }

  showSandboxOutput(output, isCorrect) {
    const outputEl = document.getElementById('sandboxOutput');
    const errorEl = document.getElementById('sandboxError');
    outputEl.textContent = output;
    errorEl.textContent = '';
    document.getElementById('sandboxErrorLabel').style.display = 'none';

    if (isCorrect) {
      outputEl.classList.add('sandbox--success');
      setTimeout(() => outputEl.classList.remove('sandbox--success'), 2000);
    }
  }

  showSandboxError(errorMsg) {
    const errorEl = document.getElementById('sandboxError');
    errorEl.textContent = errorMsg;
    document.getElementById('sandboxErrorLabel').style.display = 'block';
  }

  onLevelComplete() {
    const level = this.currentLevel;
    const wasAlreadyCompleted = scoreManager.isLevelCompleted(level.id);
    if (wasAlreadyCompleted) {
      scoreManager.updateMasteryOnRedo(level.id);
    } else {
      scoreManager.completeLevel(level.id, scoreManager.wasHintUsed(level.id));
    }
    this.updateStatusBar();

    document.getElementById('btnRun').disabled = true;
    document.getElementById('btnHint').disabled = true;

    setTimeout(() => {
      this.showKnowledgeCard();
    }, 800);
  }

  onWrongAnswer() {
    const level = this.currentLevel;
    scoreManager.recordWrongAnswer(level.id, level.errorType);
    const livesLeft = scoreManager.loseLife();
    this.updateStatusBar();

    if (scoreManager.isGameOver()) {
      setTimeout(() => {
        this.showGameOver();
      }, 600);
    } else {
      this.shakeElement(document.getElementById('pageGameBoard'));
    }
  }

  shakeElement(el) {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 500);
  }

  showHint() {
    this.hintRevealed = true;
    scoreManager.markHintUsed(this.currentLevel.id);

    const level = this.currentLevel;
    this.renderCodeDisplay(level.buggyCode, level.language, level.errorLine, true);
    this.updateGameControls();

    const errorTypeEl = document.getElementById('sandboxError');
    errorTypeEl.textContent = `\u63D0\u793A\uFF1A\u9519\u8BEF\u7C7B\u578B\u4E3A\u201C${level.errorType}\u201D\uFF0C\u8BF7\u68C0\u67E5\u7B2C ${level.errorLine} \u884C\u3002`;
    document.getElementById('sandboxErrorLabel').style.display = 'block';
  }

  showKnowledgeCard() {
    const level = this.currentLevel;
    this.openKnowledgeCard(level);
  }

  showKnowledgeCardForCurrentLevel() {
    if (!this.currentLevel) return;
    this.openKnowledgeCard(this.currentLevel);
  }

  openKnowledgeCard(level) {
    const knowledge = this.getKnowledgeData(level);
    if (!knowledge) return;

    const cardId = level.inlineKnowledge ? ('custom_' + level.id) : (level.knowledgeId || ('level_' + level.id));

    document.getElementById('knowledgeTitle').textContent = knowledge.title;
    document.getElementById('knowledgeSummary').textContent = knowledge.summary;
    document.getElementById('knowledgeDetail').textContent = knowledge.detail;
    document.getElementById('knowledgeCorrectCode').textContent = knowledge.correctExample;
    document.getElementById('knowledgeWrongCode').textContent = knowledge.wrongExample;

    const noteTextarea = document.getElementById('knowledgeNoteTextarea');
    noteTextarea.value = scoreManager.getKnowledgeNote(cardId);

    const favBtn = document.getElementById('btnToggleFavorite');
    const isFav = scoreManager.isFavorite(cardId);
    favBtn.textContent = isFav ? '\u2605 \u5DF2\u6536\u85CF' : '\u2606 \u6536\u85CF';
    favBtn.classList.toggle('btn--favorited', isFav);
    favBtn.dataset.cardId = cardId;

    noteTextarea.dataset.cardId = cardId;

    const masteryLog = scoreManager.getMasteryLog(level.id);
    const historyContainer = document.getElementById('masteryHistoryContent');
    if (masteryLog.length > 0) {
      document.getElementById('knowledgeMasteryHistory').style.display = 'block';
      let historyHtml = '';
      masteryLog.forEach(log => {
        const date = new Date(log.timestamp);
        const timeStr = (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
        const deltaSign = log.delta >= 0 ? '+' : '';
        const deltaClass = log.delta >= 0 ? 'mastery-delta--up' : 'mastery-delta--down';
        historyHtml += `
          <div class="mastery-history-entry">
            <span class="mastery-history__reason">${log.reason}</span>
            <span class="mastery-history__change ${deltaClass}">${deltaSign}${log.delta}</span>
            <span class="mastery-history__value">${log.before} → ${log.after}</span>
            <span class="mastery-history__time">${timeStr}</span>
          </div>
        `;
      });
      historyContainer.innerHTML = historyHtml;
    } else {
      document.getElementById('knowledgeMasteryHistory').style.display = 'none';
      historyContainer.innerHTML = '';
    }

    document.getElementById('knowledgeCardOverlay').classList.remove('hidden');
  }

  openFavorites() {
    const favorites = scoreManager.getFavorites();
    const container = document.getElementById('favoritesContent');

    if (favorites.length === 0) {
      container.innerHTML = '<div class="review-empty">暂无收藏的知识卡片</div>';
      document.getElementById('favoritesOverlay').classList.remove('hidden');
      return;
    }

    let html = '<div class="favorites-list">';
    const allLevels = [...LEVELS, ...this.customLevels];

    for (const favId of favorites) {
      let entry = null;
      let levelFound = null;
      let note = '';

      if (favId.startsWith('custom_')) {
        const levelId = parseInt(favId.slice(7));
        levelFound = allLevels.find(l => l.id === levelId);
        if (levelFound) {
          entry = this.getKnowledgeData(levelFound);
        }
      } else {
        entry = KNOWLEDGE_CARDS[favId];
      }
      note = scoreManager.getKnowledgeNote(favId);

      if (!entry) continue;

      html += `
        <div class="favorite-card" data-card-id="${favId}">
          <div class="favorite-card__info">
            <div class="favorite-card__title">${this.escapeHtml(entry.title)}</div>
            <div class="favorite-card__summary">${this.escapeHtml(entry.summary)}</div>
            <div class="favorite-card__note">${note ? ('💬 ' + this.escapeHtml(note.slice(0, 60) + (note.length > 60 ? '...' : ''))) : '(暂无笔记)'}</div>
          </div>
          <button class="btn btn--outline btn--sm favorite-card__open-btn" data-card-id="${favId}">打开</button>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.favorite-card__open-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardId = btn.dataset.cardId;

        let level = null;
        if (cardId.startsWith('custom_')) {
          const levelId = parseInt(cardId.slice(7));
          level = allLevels.find(l => l.id === levelId);
        } else {
          for (const l of allLevels) {
            if (l.knowledgeId === cardId) {
              level = l;
              break;
            }
          }
        }

        document.getElementById('favoritesOverlay').classList.add('hidden');
        if (level) {
          this.openKnowledgeCard(level);
        }
      });
    });

    container.querySelectorAll('.favorite-card').forEach(card => {
      card.addEventListener('click', () => {
        const cardId = card.dataset.cardId;
        let level = null;
        const allLevels = [...LEVELS, ...this.customLevels];
        if (cardId.startsWith('custom_')) {
          const levelId = parseInt(cardId.slice(7));
          level = allLevels.find(l => l.id === levelId);
        } else {
          for (const l of allLevels) {
            if (l.knowledgeId === cardId) {
              level = l;
              break;
            }
          }
        }
        document.getElementById('favoritesOverlay').classList.add('hidden');
        if (level) {
          this.openKnowledgeCard(level);
        }
      });
    });

    document.getElementById('favoritesOverlay').classList.remove('hidden');
  }

  getKnowledgeData(level) {
    if (level.inlineKnowledge) {
      return level.inlineKnowledge;
    }
    if (level.knowledgeId && KNOWLEDGE_CARDS[level.knowledgeId]) {
      return KNOWLEDGE_CARDS[level.knowledgeId];
    }
    return null;
  }

  showGameOver() {
    const stats = scoreManager.getStats();
    document.getElementById('gameOverScore').textContent = stats.score;
    document.getElementById('gameOverLevels').textContent = stats.completedCount;
    document.getElementById('gameOverOverlay').classList.remove('hidden');
  }

  closeGameOver() {
    document.getElementById('gameOverOverlay').classList.add('hidden');
    scoreManager.reset();
    this.updateStatusBar();
    this.navigateTo('level-select');
  }

  renderCustomLevel() {
    document.getElementById('customLanguage').value = 'python';
    document.getElementById('customBuggyCode').value = '';
    document.getElementById('customCorrectCode').value = '';
    document.getElementById('customKnowledgePoint').value = '';
    document.getElementById('customErrorType').value = '';
    document.getElementById('customExpectedOutput').value = '';
    document.getElementById('customTitle').value = '';
    document.getElementById('customErrorLine').value = '1';
    document.getElementById('customDifficulty').value = '1';
    document.getElementById('customKnowledgeTitle').value = '';
    document.getElementById('customKnowledgeSummary').value = '';
    document.getElementById('customKnowledgeDetail').value = '';
    document.getElementById('customKnowledgeCorrect').value = '';
    document.getElementById('customKnowledgeWrong').value = '';
    this.updateStatusBar();
  }

  submitCustomLevel() {
    const language = document.getElementById('customLanguage').value;
    const buggyCode = document.getElementById('customBuggyCode').value.trim();
    const correctCode = document.getElementById('customCorrectCode').value.trim();
    const knowledgePoint = document.getElementById('customKnowledgePoint').value.trim();
    const errorType = document.getElementById('customErrorType').value.trim();
    const expectedOutput = document.getElementById('customExpectedOutput').value.trim();
    const title = document.getElementById('customTitle').value.trim();
    const errorLine = parseInt(document.getElementById('customErrorLine').value) || 1;
    const difficulty = parseInt(document.getElementById('customDifficulty').value) || 1;
    const knTitle = document.getElementById('customKnowledgeTitle').value.trim();
    const knSummary = document.getElementById('customKnowledgeSummary').value.trim();
    const knDetail = document.getElementById('customKnowledgeDetail').value.trim();
    const knCorrect = document.getElementById('customKnowledgeCorrect').value.trim();
    const knWrong = document.getElementById('customKnowledgeWrong').value.trim();

    if (!buggyCode || !correctCode) {
      alert('\u8BF7\u586B\u5199\u9519\u8BEF\u4EE3\u7801\u548C\u6B63\u786E\u4EE3\u7801\uFF01');
      return;
    }

    const verifyResult = sandbox.run(correctCode, language);
    if (!verifyResult.success) {
      if (!confirm(`\u6B63\u786E\u4EE3\u7801\u6267\u884C\u5931\u8D25\uFF1A${verifyResult.error}\n\n\u786E\u5B9A\u63D0\u4EA4\u5417\uFF1F`)) {
        return;
      }
    }

    const hasKnowledge = knTitle || knSummary || knDetail || knCorrect || knWrong;

    const newLevel = {
      id: 200 + this.customLevels.length,
      title: title || `\u81EA\u5B9A\u4E49\u5173\u5361 ${this.customLevels.length + 1}`,
      language: language,
      difficulty: difficulty,
      knowledgePoint: knowledgePoint || '\u81EA\u5B9A\u4E49\u77E5\u8BC6\u70B9',
      knowledgeId: hasKnowledge ? null : 'python_print',
      buggyCode: buggyCode,
      correctCode: correctCode,
      options: [
        correctCode,
        buggyCode,
        buggyCode.split('\n')[0] + '\n// \u9519\u8BEF\u4FEE\u590D\u5C1D\u8BD5',
        correctCode.replace(/[{}()[\]]/g, '')
      ],
      correctIndex: 0,
      errorLine: errorLine,
      errorType: errorType || '\u81EA\u5B9A\u4E49\u9519\u8BEF',
      expectedOutput: expectedOutput || (verifyResult.success ? verifyResult.output : '')
    };

    if (hasKnowledge) {
      newLevel.inlineKnowledge = {
        title: knTitle || newLevel.title,
        summary: knSummary || '\u81EA\u5B9A\u4E49\u8BED\u6CD5\u77E5\u8BC6\u70B9',
        detail: knDetail || '',
        correctExample: knCorrect || correctCode,
        wrongExample: knWrong || buggyCode
      };
    }

    this.customLevels.push(newLevel);
    this.saveCustomLevels();
    alert(`\u81EA\u5B9A\u4E49\u5173\u5361\u201C${newLevel.title}\u201D\u521B\u5EFA\u6210\u529F\uFF01`);
    this.navigateTo('level-select');
  }

  validateLevels() {
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const level of LEVELS) {
      const result = sandbox.run(level.expectedOutput ? level.correctCode : level.correctCode, level.language);
      const outputOk = result.success && result.output === level.expectedOutput;

      if (outputOk) {
        passed++;
      } else {
        failed++;
        results.push({
          id: level.id,
          title: level.title,
          language: level.language,
          expected: level.expectedOutput,
          actual: result.success ? result.output : ('\u9519\u8BEF: ' + result.error),
          success: false
        });
      }
    }

    const total = passed + failed;
    let html = '';

    if (failed === 0) {
      html += `<div class="validate-summary validate-summary--all-pass">
        <span class="validate-icon">\u2705</span>
        <span>\u5168\u90E8 ${total} \u4E2A\u5173\u5361\u6821\u9A8C\u901A\u8FC7\uFF01</span>
      </div>`;
    } else {
      html += `<div class="validate-summary validate-summary--has-fail">
        <span class="validate-icon">\u26A0\uFE0F</span>
        <span>\u5DF2\u901A\u8FC7 ${passed}/${total}\uFF0C\u5931\u8D25 ${failed} \u4E2A\u5173\u5361</span>
      </div>`;

      html += '<div class="validate-list">';
      for (const r of results) {
        html += `
          <div class="validate-item">
            <div class="validate-item__header">
              <span class="validate-item__title">\u5173\u5361 ${r.id}: ${this.escapeHtml(r.title)}</span>
              <span class="validate-item__lang">${r.language === 'python' ? 'Python' : 'JavaScript'}</span>
            </div>
            <div class="validate-item__row">
              <span class="validate-item__label">\u671F\u671B\u8F93\u51FA\uFF1A</span>
              <code>${this.escapeHtml(r.expected)}</code>
            </div>
            <div class="validate-item__row">
              <span class="validate-item__label">\u5B9E\u9645\u8F93\u51FA\uFF1A</span>
              <code class="validate-item__actual">${this.escapeHtml(r.actual)}</code>
            </div>
          </div>
        `;
      }
      html += '</div>';
    }

    document.getElementById('validateResults').innerHTML = html;
    document.getElementById('validateOverlay').classList.remove('hidden');
  }

  renderReviewPage() {
    const data = scoreManager.getReviewData();

    document.getElementById('reviewScore').textContent = data.score;
    document.getElementById('reviewCompleted').textContent = data.completedCount + '/' + data.totalLevels;
    document.getElementById('reviewHintsUsed').textContent = data.totalHintsUsed;
    document.getElementById('reviewWrongAttempts').textContent = data.totalWrongAttempts;

    let errorTypeHtml = '';
    if (data.errorTypeStats.length === 0) {
      errorTypeHtml = '<div class="review-empty">\u6682\u65E0\u9519\u8BEF\u7C7B\u578B\u7EDF\u8BA1\u6570\u636E\uFF0C\u5F00\u59CB\u89E3\u9898\u540E\u4F1A\u81EA\u52A8\u8FFD\u8E2A\u3002</div>';
    } else {
      errorTypeHtml = '<div class="review-chart">';
      const maxCount = data.errorTypeStats[0].count;
      for (const stat of data.errorTypeStats) {
        const barWidth = Math.round((stat.count / maxCount) * 100);
        errorTypeHtml += `
          <div class="review-chart__row">
            <span class="review-chart__label">${this.escapeHtml(stat.type)}</span>
            <div class="review-chart__bar-wrap">
              <div class="review-chart__bar" style="width:${barWidth}%"></div>
            </div>
            <span class="review-chart__count">${stat.count}\u6B21</span>
          </div>
        `;
      }
      errorTypeHtml += '</div>';
    }
    document.getElementById('reviewErrorTypes').innerHTML = errorTypeHtml;

    const levelMap = {};
    for (const d of data.levelDetails) {
      const cat = d.category || 'custom';
      if (!levelMap[cat]) {
        levelMap[cat] = [];
      }
      levelMap[cat].push(d);
    }

    let groupHtml = '';
    if (data.levelDetails.length === 0) {
      groupHtml = '<div class="review-empty">\u6682\u65E0\u5173\u5361\u7EC6\u8282\u6570\u636E\u3002</div>';
    } else {
      for (const catDef of LEVEL_CATEGORIES) {
        const levels = levelMap[catDef.id] || [];
        if (levels.length === 0) continue;

        const completedCount = levels.filter(l => l.completed).length;
        const totalCount = levels.length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        let totalWrongs = 0;
        let latestTime = 0;
        for (const l of levels) {
          totalWrongs += l.wrongs;
          if (l.lastTime && l.lastTime > latestTime) {
            latestTime = l.lastTime;
          }
        }
        const avgWrongs = totalCount > 0 ? (totalWrongs / totalCount).toFixed(1) : '0';

        let lastTimeStr = '\u6682\u65E0\u8BB0\u5F55';
        if (latestTime > 0) {
          const d = new Date(latestTime);
          lastTimeStr = (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        }

        groupHtml += `
          <div class="review-category" data-category="${catDef.id}">
            <div class="review-category__header">
              <div class="review-category__info">
                <span class="review-category__name">${catDef.name}</span>
                <span class="review-category__desc">${catDef.description}</span>
              </div>
              <div class="review-category__stats">
                <div class="review-category__stat">
                  <span class="review-category__stat-value">${completionRate}%</span>
                  <span class="review-category__stat-label">\u5B8C\u6210\u5EA6</span>
                </div>
                <div class="review-category__stat">
                  <span class="review-category__stat-value">${avgWrongs}</span>
                  <span class="review-category__stat-label">\u5747\u9519\u6B21\u6570</span>
                </div>
                <div class="review-category__stat">
                  <span class="review-category__stat-value">${lastTimeStr}</span>
                  <span class="review-category__stat-label">\u6700\u8FD1\u7EC3\u4E60</span>
                </div>
              </div>
              <button class="review-category__toggle" data-toggle="${catDef.id}">\u25BC</button>
            </div>
            <div class="review-category__body" id="reviewCatBody_${catDef.id}">
              <div class="review-table-wrap"><table class="review-table">
                <thead><tr>
                  <th>\u5173\u5361</th><th>\u8BED\u8A00</th><th>\u96BE\u5EA6</th><th>\u5C1D\u8BD5</th><th>\u7B54\u9519</th><th>\u63D0\u793A</th><th>\u751F\u547D</th><th>\u638C\u63E1\u5EA6</th><th>\u72B6\u6001</th><th>\u64CD\u4F5C</th>
                </tr></thead><tbody>
        `;

        const allLevels = [...LEVELS, ...this.customLevels];
        for (const d of levels) {
          const langLabel = d.language === 'python' ? 'Python' : 'JavaScript';
          const hintIcon = d.hintUsed ? '\uD83D\uDCA1' : '-';
          const statusIcon = d.completed ? '\u2705' : '\u274C';
          const wrongClass = d.wrongs > 0 ? 'review-table__cell--warn' : '';
          const level = allLevels.find(l => l.id === d.id);
          const hasKnowledge = level && (level.inlineKnowledge || level.knowledgeId);
          const knowledgeBtn = hasKnowledge
            ? `<button class="btn btn--sm btn--ghost review-knowledge-btn" data-level-id="${d.id}">\u77E5\u8BC6\u70B9</button>`
            : '';

          const mClass = scoreManager.getMasteryColorClass(d.mastery);
          const mText = scoreManager.getMasteryLevelText(d.mastery);
          const masteryHtml = d.completed
            ? `<span class="mastery-badge ${mClass}">${mText} (${d.mastery})</span>`
            : '<span class="mastery-badge mastery-none">\u672A\u901A\u5173</span>';

          groupHtml += `
            <tr>
              <td>${this.escapeHtml(d.title)}</td>
              <td>${langLabel}</td>
              <td>${this.renderStars(d.difficulty)}</td>
              <td>${d.attempts}</td>
              <td class="${wrongClass}">${d.wrongs}</td>
              <td>${hintIcon}</td>
              <td>${d.livesLost}</td>
              <td>${masteryHtml}</td>
              <td>${statusIcon}</td>
              <td>${knowledgeBtn}</td>
            </tr>
          `;
        }

        groupHtml += '</tbody></table></div></div></div>';
      }
    }
    document.getElementById('reviewLevelGroups').innerHTML = groupHtml;

    document.querySelectorAll('.review-category__toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const catId = btn.dataset.toggle;
        const body = document.getElementById('reviewCatBody_' + catId);
        if (body) {
          body.classList.toggle('hidden');
          btn.classList.toggle('review-category__toggle--open');
        }
      });
    });

    document.querySelectorAll('.review-category__header').forEach(header => {
      header.addEventListener('click', () => {
        const toggleBtn = header.querySelector('.review-category__toggle');
        if (toggleBtn) {
          toggleBtn.click();
        }
      });
    });

    document.querySelectorAll('.review-knowledge-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const levelId = parseInt(btn.dataset.levelId);
        const allLevels = [...LEVELS, ...this.customLevels];
        const level = allLevels.find(l => l.id === levelId);
        if (level) {
          this.openKnowledgeCard(level);
        }
      });
    });

    this.updateStatusBar();
  }

  renderWrongBook() {
    const masteryFilter = document.getElementById('filterMastery').value;
    const sortOrder = document.getElementById('sortWrongBook').value;
    const filters = { mastery: masteryFilter, sort: sortOrder };
    const data = scoreManager.getWrongBookDataFiltered(filters);
    const container = document.getElementById('wrongBookContent');

    const reviewPlan = scoreManager.getTodayReviewPlan();
    const todaySection = document.getElementById('reviewTodaySection');
    if (reviewPlan.length > 0) {
      let planHtml = '';
      for (const item of reviewPlan) {
        const mClass = scoreManager.getMasteryColorClass(item.mastery);
        const mText = scoreManager.getMasteryLevelText(item.mastery);
        planHtml += `
          <div class="review-today__item" data-level-id="${item.levelId}">
            <div class="review-today__item-info">
              <span class="review-today__item-title">${this.escapeHtml(item.title)}</span>
              <span class="mastery-badge ${mClass}">${mText} (${item.mastery})</span>
            </div>
            <button class="btn btn--outline btn--sm review-today__redo-btn" data-level-id="${item.levelId}">重做</button>
          </div>
        `;
      }
      document.getElementById('reviewTodayList').innerHTML = planHtml;
      todaySection.style.display = 'block';

      todaySection.querySelectorAll('.review-today__item, .review-today__redo-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const levelId = parseInt(el.dataset.levelId);
          this.startLevel(levelId);
        });
      });
    } else {
      todaySection.style.display = 'none';
    }

    if (data.length === 0) {
      container.innerHTML = '<div class="review-empty">暂无符合条件的错题记录，继续加油！</div>';
      this.updateStatusBar();
      return;
    }

    let html = '';
    for (const entry of data) {
      const langLabel = entry.language === 'python' ? 'Python' : 'JavaScript';
      const labels = ['A', 'B', 'C', 'D'];

      let wrongOptionsHtml = '';
      const seen = new Set();
      for (const detail of entry.allWrongDetails) {
        const key = detail.optionIndex;
        if (seen.has(key)) continue;
        seen.add(key);
        wrongOptionsHtml += `
          <div class="wrong-option-item">
            <span class="wrong-option-item__label">${labels[detail.optionIndex]}</span>
            <pre class="wrong-option-item__code">${this.escapeHtml(detail.optionCode)}</pre>
          </div>
        `;
      }

      const hasKnowledge = entry.knowledgeId || entry.inlineKnowledge;

      const mClass = scoreManager.getMasteryColorClass(entry.mastery);
      const mText = scoreManager.getMasteryLevelText(entry.mastery);
      const masteryHtml = entry.mastery > 0
        ? `<span class="mastery-badge ${mClass}">${mText} (${entry.mastery})</span>`
        : '';

      const masteryLog = scoreManager.getMasteryLog(entry.levelId);
      let historyHtml = '';
      if (masteryLog.length > 0) {
        historyHtml = '<div class="wrong-book-card__section"><span class="wrong-book-card__section-label">掌握度变化：</span><div class="mastery-log-mini">';
        for (const log of masteryLog.slice(0, 3)) {
          const deltaSign = log.delta >= 0 ? '+' : '';
          const deltaClass = log.delta >= 0 ? 'mastery-delta--up' : 'mastery-delta--down';
          historyHtml += `<span class="mastery-log-entry ${deltaClass}">${log.reason} ${deltaSign}${log.delta} (${log.before}→${log.after})</span>`;
        }
        historyHtml += '</div></div>';
      }

      html += `
        <div class="wrong-book-card">
          <div class="wrong-book-card__header">
            <div class="wrong-book-card__info">
              <span class="wrong-book-card__title">${this.escapeHtml(entry.title)}</span>
              <span class="wrong-book-card__meta">
                <span class="lang-tag">${langLabel}</span>
                <span>${this.renderStars(entry.difficulty)}</span>
                <span>答错 ${entry.wrongCount} 次</span>
                ${masteryHtml}
              </span>
            </div>
            <div class="wrong-book-card__actions">
              <button class="btn btn--outline btn--sm wrong-book-card__redo-btn" data-level-id="${entry.levelId}">重做此关</button>
            </div>
          </div>

          <div class="wrong-book-card__body">
            <div class="wrong-book-card__section">
              <span class="wrong-book-card__section-label">错误类型：</span>
              <span>${this.escapeHtml(entry.errorType)}</span>
            </div>

            <div class="wrong-book-card__section">
              <span class="wrong-book-card__section-label">你选择的错误方案：</span>
              <div class="wrong-options-list">${wrongOptionsHtml}</div>
            </div>

            <div class="wrong-book-card__section">
              <span class="wrong-book-card__section-label">正确修复思路：</span>
              <pre class="wrong-book-card__correct-code">${this.escapeHtml(entry.correctOptionCode)}</pre>
            </div>

            ${historyHtml}
          </div>

          ${hasKnowledge ? `
          <div class="wrong-book-card__footer">
            <button class="btn btn--ghost btn--sm wrong-book-card__knowledge-btn" data-level-id="${entry.levelId}">
              📚 查看知识点
            </button>
          </div>
          ` : ''}
        </div>
      `;
    }

    container.innerHTML = html;

    container.querySelectorAll('.wrong-book-card__redo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const levelId = parseInt(btn.dataset.levelId);
        this.startLevel(levelId);
      });
    });

    container.querySelectorAll('.wrong-book-card__knowledge-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const levelId = parseInt(btn.dataset.levelId);
        const allLevels = [...LEVELS, ...this.customLevels];
        const level = allLevels.find(l => l.id === levelId);
        if (level) {
          this.openKnowledgeCard(level);
        }
      });
    });

    this.updateStatusBar();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});