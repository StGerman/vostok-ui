import '@testing-library/jest-dom';

// Minimal ResizeObserver polyfill for components using it
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
// @ts-ignore
if (!global.ResizeObserver) {
	// @ts-ignore
	global.ResizeObserver = ResizeObserver;
}

// Mock window.matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Add vi import for the mock
import { vi } from 'vitest';
