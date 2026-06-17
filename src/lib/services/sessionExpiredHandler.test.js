import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSessionExpired } from './sessionExpiredHandler.js';

const { logout, goto, warning } = vi.hoisted(() => ({
	logout: vi.fn(),
	goto: vi.fn(),
	warning: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true
}));

vi.mock('$lib/stores/toastStore.js', () => ({
	toastStore: { warning }
}));

vi.mock('$lib/stores/authStore.js', () => ({
	authStore: { logout }
}));

vi.mock('$lib/stores/pageTransitionStore.js', () => ({
	pageTransitionStore: { goto }
}));

describe('handleSessionExpired', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		logout.mockResolvedValue(undefined);
		goto.mockResolvedValue(undefined);
	});

	it('logs out, warns user, and redirects to auth', async () => {
		await handleSessionExpired();

		expect(logout).toHaveBeenCalledOnce();
		expect(warning).toHaveBeenCalledWith(
			'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
		);
		expect(goto).toHaveBeenCalledWith('/auth', {
			transitionType: 'fade',
			replaceState: true
		});
	});

	it('swallows errors during expiry handling', async () => {
		logout.mockRejectedValueOnce(new Error('logout failed'));
		await expect(handleSessionExpired()).resolves.toBeUndefined();
	});
});
