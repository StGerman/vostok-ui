export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemePreference {
  mode: ThemeMode;
  auto_detect_system: boolean;
  persist_choice: boolean;
  custom_colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
}

export interface ThemeState {
  currentTheme: 'light' | 'dark';
  preference: ThemePreference;
  isSystemDark: boolean;
}
