import { describe, it, expect } from 'vitest';
import { useThemeStore } from './themeStore';

const getState = () => useThemeStore.getState();

describe('themeStore', () => {
  it('toggles theme', () => {
    const initial = getState().currentTheme;
    getState().toggleTheme();
    const after = getState().currentTheme;
    expect(after).not.toBe(initial);
  });

  it('sets explicit theme', () => {
    getState().setTheme('dark');
    expect(getState().currentTheme).toBe('dark');
    getState().setTheme('light');
    expect(getState().currentTheme).toBe('light');
  });
});
