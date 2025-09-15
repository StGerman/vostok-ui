import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ThemeState, ThemePreference, ThemeMode } from '../types/theme';

interface ThemeStore extends ThemeState {
  // Actions
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  updatePreference: (preference: Partial<ThemePreference>) => void;
  resetToSystemTheme: () => void;
}

const DEFAULT_PREFERENCE: ThemePreference = {
  mode: 'system',
  auto_detect_system: true,
  persist_choice: true,
};

// Detect system theme preference
const getSystemTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Calculate current theme based on preference and system setting
const calculateCurrentTheme = (preference: ThemePreference, isSystemDark: boolean): 'light' | 'dark' => {
  switch (preference.mode) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    case 'system':
    default:
      return isSystemDark ? 'dark' : 'light';
  }
};

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        preference: DEFAULT_PREFERENCE,
        isSystemDark: getSystemTheme(),
        currentTheme: calculateCurrentTheme(DEFAULT_PREFERENCE, getSystemTheme()),

        // Actions
        setTheme: (mode: ThemeMode) => {
          const state = get();
          const newPreference = { ...state.preference, mode };
          const newCurrentTheme = calculateCurrentTheme(newPreference, state.isSystemDark);

          set(
            {
              preference: newPreference,
              currentTheme: newCurrentTheme,
            },
            false,
            'setTheme'
          );

          // Apply theme to document
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newCurrentTheme === 'dark');
          }
        },

        toggleTheme: () => {
          const state = get();
          const newMode: ThemeMode = state.currentTheme === 'light' ? 'dark' : 'light';
          state.setTheme(newMode);
        },

        updatePreference: (newPreference: Partial<ThemePreference>) => {
          const state = get();
          const updatedPreference = { ...state.preference, ...newPreference };
          const newCurrentTheme = calculateCurrentTheme(updatedPreference, state.isSystemDark);

          set(
            {
              preference: updatedPreference,
              currentTheme: newCurrentTheme,
            },
            false,
            'updatePreference'
          );

          // Apply theme to document
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newCurrentTheme === 'dark');
          }
        },

        resetToSystemTheme: () => {
          const state = get();
          const systemPreference: ThemePreference = {
            ...state.preference,
            mode: 'system',
          };
          const newCurrentTheme = calculateCurrentTheme(systemPreference, state.isSystemDark);

          set(
            {
              preference: systemPreference,
              currentTheme: newCurrentTheme,
            },
            false,
            'resetToSystemTheme'
          );

          // Apply theme to document
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newCurrentTheme === 'dark');
          }
        },
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({
          preference: state.preference,
        }),
      }
    ),
    {
      name: 'theme-store',
    }
  )
);

// System theme change listener
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  mediaQuery.addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    const isSystemDark = e.matches;
    const newCurrentTheme = calculateCurrentTheme(store.preference, isSystemDark);

    useThemeStore.setState(
      {
        isSystemDark,
        currentTheme: newCurrentTheme,
      },
      false,
      'systemThemeChange'
    );

    // Apply theme to document if in system mode
    if (store.preference.mode === 'system') {
      document.documentElement.classList.toggle('dark', newCurrentTheme === 'dark');
    }
  });
}

// Initialize theme on load
if (typeof document !== 'undefined') {
  const state = useThemeStore.getState();
  document.documentElement.classList.toggle('dark', state.currentTheme === 'dark');
}
