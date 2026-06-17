import { describe, it, expect } from 'vitest';
import { SHOW_THEME_SELECTOR, THEME_SELECTOR_CONFIG } from './config.js';

describe('config', () => {
	it('exports theme selector defaults', () => {
		expect(SHOW_THEME_SELECTOR).toBe(true);
		expect(THEME_SELECTOR_CONFIG.position).toEqual({ top: '100px', right: '20px' });
		expect(THEME_SELECTOR_CONFIG.showOnMobile).toBe(true);
	});
});
