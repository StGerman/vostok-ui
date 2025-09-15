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
