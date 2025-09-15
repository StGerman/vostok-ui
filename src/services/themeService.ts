import type { ThemePreference } from '../types/theme';

export class ThemeService {
  private static readonly STORAGE_KEY = 'theme_preference';
  private mediaQuery: MediaQueryList | null = null;
  private listeners: ((isDark: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
    }
  }

  /**
   * Get the current system theme preference
   */
  getSystemTheme(): boolean {
    return this.mediaQuery?.matches ?? false;
  }

  /**
   * Save theme preference to localStorage
   */
  savePreference(preference: ThemePreference): void {
    if (preference.persist_choice && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(ThemeService.STORAGE_KEY, JSON.stringify(preference));
      } catch (error) {
        console.warn('Failed to save theme preference:', error);
      }
    }
  }

  /**
   * Load theme preference from localStorage
   */
  loadPreference(): ThemePreference | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(ThemeService.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ThemePreference;
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }

    return null;
  }

  /**
   * Clear stored theme preference
   */
  clearPreference(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ThemeService.STORAGE_KEY);
    }
  }

  /**
   * Apply theme to the document
   */
  applyTheme(theme: 'light' | 'dark'): void {
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;

      if (theme === 'dark') {
        htmlElement.classList.add('dark');
        htmlElement.style.colorScheme = 'dark';
      } else {
        htmlElement.classList.remove('dark');
        htmlElement.style.colorScheme = 'light';
      }

      // Set meta theme-color for mobile browsers
      this.updateThemeColorMeta(theme);
    }
  }

  /**
   * Calculate the effective theme based on preference and system setting
   */
  calculateEffectiveTheme(preference: ThemePreference): 'light' | 'dark' {
    switch (preference.mode) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      case 'system':
      default:
        return this.getSystemTheme() ? 'dark' : 'light';
    }
  }

  /**
   * Get default theme preference
   */
  getDefaultPreference(): ThemePreference {
    return {
      mode: 'system',
      auto_detect_system: true,
      persist_choice: true,
    };
  }

  /**
   * Subscribe to system theme changes
   */
  onSystemThemeChange(callback: (isDark: boolean) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateThemeColorMeta(theme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    // Set appropriate theme colors based on your design system
    const themeColors = {
      light: '#ffffff',
      dark: '#1f2937', // gray-800 in Tailwind
    };

    metaThemeColor.setAttribute('content', themeColors[theme]);
  }

  /**
   * Handle system theme change event
   */
  private handleSystemThemeChange(event: MediaQueryListEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event.matches);
      } catch (error) {
        console.warn('Theme change listener error:', error);
      }
    });
  }

  /**
   * Validate theme preference object
   */
  isValidPreference(preference: unknown): preference is ThemePreference {
    if (!preference || typeof preference !== 'object') {
      return false;
    }

    const pref = preference as Partial<ThemePreference>;

    return (
      typeof pref.mode === 'string' &&
      ['light', 'dark', 'system'].includes(pref.mode) &&
      typeof pref.auto_detect_system === 'boolean' &&
      typeof pref.persist_choice === 'boolean'
    );
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
    }
    this.listeners.length = 0;
  }
}

// Default service instance
export const themeService = new ThemeService();
