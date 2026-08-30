import { writable } from 'svelte/store';

const MAX_VISIBLE = 4;
const FALLBACK = 'Algo salió mal. Intenta de nuevo.';

/**
 * Convierte lo que sea que le pasen al toast en una frase para humanos.
 * FastAPI manda `detail` como string, objeto o lista; `throw err` a veces
 * llega como Error, a veces como objeto crudo. Nunca debe verse [object Object].
 */
export function humanizeToastMessage(input, fallback = FALLBACK) {
	if (input == null || input === '') return fallback;
	if (typeof input === 'string') {
		const text = input
			.trim()
			.replace(/^Value error,\s*/i, '')
			.trim();
		if (!text || text === '[object Object]') return fallback;
		return text;
	}
	if (input instanceof Error) return humanizeToastMessage(input.message, fallback);
	if (Array.isArray(input) && input.length > 0) {
		return humanizeToastMessage(input[0], fallback);
	}
	if (typeof input === 'object') {
		const nested = input.detail ?? input.message ?? input.msg ?? input.error;
		if (nested != null && nested !== input) {
			return humanizeToastMessage(nested, fallback);
		}
	}
	return fallback;
}

function createToastStore() {
	const { subscribe, update } = writable([]);

	return {
		subscribe,

		add(message, type = 'info', duration = 5000) {
			let toastData;
			if (typeof message === 'string' || message instanceof Error) {
				toastData = { message, type, duration };
			} else if (message && typeof message === 'object' && !Array.isArray(message)) {
				toastData = { type: 'info', duration: 5000, ...message };
			} else {
				toastData = { message, type, duration };
			}

			const id = Date.now() + Math.random();
			const newToast = {
				id,
				type: toastData.type || 'info',
				duration: toastData.duration ?? 5000,
				message: humanizeToastMessage(toastData.message ?? toastData)
			};

			update((toasts) => {
				const next = [...toasts, newToast];
				return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
			});

			if (newToast.duration > 0) {
				setTimeout(() => {
					this.remove(id);
				}, newToast.duration);
			}

			return id;
		},

		remove(id) {
			update((toasts) => toasts.filter((toast) => toast.id !== id));
		},

		clear() {
			update(() => []);
		},

		success(message, duration = 5000) {
			return this.add({ type: 'success', message, duration });
		},

		error(message, duration = 7000) {
			return this.add({ type: 'error', message, duration });
		},

		warning(message, duration = 6000) {
			return this.add({ type: 'warning', message, duration });
		},

		info(message, duration = 5000) {
			return this.add({ type: 'info', message, duration });
		}
	};
}

export const toastStore = createToastStore();
