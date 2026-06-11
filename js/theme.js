class ThemeManager {
  constructor() {
    this.THEME_KEY = 'syntax_game_theme';
    this.load();
  }

  load() {
    const saved = localStorage.getItem(this.THEME_KEY);
    this.current = saved === 'light' ? 'light' : 'dark';
    this.apply();
  }

  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    this.apply();
    localStorage.setItem(this.THEME_KEY, this.current);
  }

  set(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.current = theme;
      this.apply();
      localStorage.setItem(this.THEME_KEY, this.current);
    }
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this.current);
  }

  getTheme() {
    return this.current;
  }
}

const themeManager = new ThemeManager();