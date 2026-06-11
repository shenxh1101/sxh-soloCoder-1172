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

    document.getElementById('btnReviewPage').addEventListener('click', () => {
      this.navigateTo('review');
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
      document.getElementById('knowledgeCardOverlay').classList.add('hidden');
    });

    document.getElementById('knowledgeCardOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('knowledgeCardOverlay').classList.add('hidden');
      }
    });

    document.getElementById('closeValidateModal').addEventListener('click', () => {
      document.getElementById('validateOverlay').classList.add('hidden');
    });

    document.getElementById('validateOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('validateOverlay').classList.add('hidden');
      }
    });
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
    }
  }

  renderLevelSelect() {
    const grid = document.getElementById('levelGrid');
    const allLevels = [...LEVELS, ...this.customLevels];
    const stats = scoreManager.getStats();

    document.getElementById('completedCount').textContent = stats.completedCount;
    document.getElementById('totalLevelCount').textContent = allLevels.length;

    let html = '';
    allLevels.forEach((level, index) => {
      const isCompleted = scoreManager.isLevelCompleted(level.id);
      const isBuiltIn = level.id <= 100;
      const stars = this.renderStars(level.difficulty);
      const langLabel = level.language === 'python' ? 'Python' : 'JavaScript';
      const langClass = level.language === 'python' ? 'lang-python' : 'lang-javascript';
      const statusClass = isCompleted ? 'completed' : '';
      const customBadge = !isBuiltIn ? '<span class="level-badge level-badge--custom">\u81EA\u5B9A\u4E49</span>' : '';

      html += `
        <div class="level-card ${statusClass}" data-level-id="${level.id}">
          <div class="level-card__number">#${index + 1}</div>
          <div class="level-card__title">${this.escapeHtml(level.title)}</div>
          <div class="level-card__meta">
            <span class="level-card__lang ${langClass}">${langLabel}</span>
            <span class="level-card__stars">${stars}</span>
          </div>
          <div class="level-card__knowledge">${this.escapeHtml(level.knowledgePoint)}</div>
          <div class="level-card__footer">
            ${customBadge}
            <span class="level-card__status">
              ${isCompleted ? '\u2705 \u5DF2\u901A\u5173' : ''}
            </span>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.level-card').forEach(card => {
      card.addEventListener('click', () => {
        const levelId = parseInt(card.dataset.levelId);
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

    if (this.selectedOptionIndex === level.correctIndex) {
      this.showSandboxOutput(result.success ? result.output : selectedCode, true);
      this.onLevelComplete();
      return;
    }

    if (result.success) {
      if (result.output === level.expectedOutput) {
        const msg = `\u8F93\u51FA\u6B63\u786E\uFF0C\u4F46\u8FD9\u4E0D\u662F\u76EE\u6807\u4FEE\u590D\u65B9\u6848\u3002\n\u8BF7\u9009\u62E9\u80FD\u4ECE\u6839\u672C\u4E0A\u89E3\u51B3\u8BED\u6CD5\u9519\u8BEF\u7684\u9009\u9879\u3002`;
        this.showSandboxError(msg);
        this.onWrongAnswer();
      } else {
        const msg = `\u6267\u884C\u6210\u529F\uFF0C\u4F46\u8F93\u51FA\u4E0D\u6B63\u786E\u3002\n\u671F\u671B\u8F93\u51FA\uFF1A${level.expectedOutput}\n\u5B9E\u9645\u8F93\u51FA\uFF1A${result.output}`;
        this.showSandboxError(msg);
        this.onWrongAnswer();
      }
    } else {
      this.showSandboxError(`\u6267\u884C\u9519\u8BEF\uFF1A${result.error}`);
      this.onWrongAnswer();
    }
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
    scoreManager.completeLevel(level.id, scoreManager.wasHintUsed(level.id));
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
    const knowledge = this.getKnowledgeData(level);
    if (!knowledge) return;

    document.getElementById('knowledgeTitle').textContent = knowledge.title;
    document.getElementById('knowledgeSummary').textContent = knowledge.summary;
    document.getElementById('knowledgeDetail').textContent = knowledge.detail;
    document.getElementById('knowledgeCorrectCode').textContent = knowledge.correctExample;
    document.getElementById('knowledgeWrongCode').textContent = knowledge.wrongExample;

    document.getElementById('knowledgeCardOverlay').classList.remove('hidden');
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

    let levelHtml = '';
    if (data.levelDetails.length === 0) {
      levelHtml = '<div class="review-empty">\u6682\u65E0\u5173\u5361\u7EC6\u8282\u6570\u636E\u3002</div>';
    } else {
      levelHtml = '<div class="review-table-wrap"><table class="review-table">';
      levelHtml += '<thead><tr>';
      levelHtml += '<th>\u5173\u5361</th><th>\u8BED\u8A00</th><th>\u96BE\u5EA6</th><th>\u5C1D\u8BD5\u6B21\u6570</th><th>\u7B54\u9519\u6B21\u6570</th><th>\u63D0\u793A</th><th>\u751F\u547D\u6D88\u8017</th><th>\u72B6\u6001</th>';
      levelHtml += '</tr></thead><tbody>';

      for (const d of data.levelDetails) {
        const langLabel = d.language === 'python' ? 'Python' : 'JavaScript';
        const hintIcon = d.hintUsed ? '\uD83D\uDCA1' : '-';
        const statusIcon = d.completed ? '\u2705' : '\u274C';
        const wrongClass = d.wrongs > 0 ? 'review-table__cell--warn' : '';
        levelHtml += `
          <tr>
            <td>${this.escapeHtml(d.title)}</td>
            <td>${langLabel}</td>
            <td>${this.renderStars(d.difficulty)}</td>
            <td>${d.attempts}</td>
            <td class="${wrongClass}">${d.wrongs}</td>
            <td>${hintIcon}</td>
            <td>${d.livesLost}</td>
            <td>${statusIcon}</td>
          </tr>
        `;
      }
      levelHtml += '</tbody></table></div>';
    }
    document.getElementById('reviewLevelDetails').innerHTML = levelHtml;

    this.updateStatusBar();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});