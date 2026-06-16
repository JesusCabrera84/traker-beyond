import { browser } from '$app/environment';
import { toastStore } from '$lib/stores/toastStore.js';

/**
 * Handles 401 session expiry without a static apiClient → authStore import cycle.
 */
export async function handleSessionExpired() {
	if (!browser) return;

	try {
		const { pageTransitionStore } = await import('$lib/stores/pageTransitionStore.js');
		const { authStore } = await import('$lib/stores/authStore.js');

		await authStore.logout();
		toastStore.warning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
		await pageTransitionStore.goto('/auth', {
			transitionType: 'fade',
			replaceState: true
		});
	} catch {
		// Silent failure while handling expired session
	}
}
