const PREFIX = 'payment_idem_';

function storageKey(planId, billingCycle) {
	return `${PREFIX}${planId}_${String(billingCycle).toUpperCase()}`;
}

/**
 * Key estable por (plan, ciclo) durante la sesión del navegador.
 * Reintentos de red y doble click reutilizan la misma key.
 * Un plan distinto usa otra key.
 */
export function getOrCreatePaymentIdempotencyKey(planId, billingCycle) {
	if (!planId || !billingCycle) {
		throw new Error('planId y billingCycle son requeridos');
	}
	const key = storageKey(planId, billingCycle);
	const existing = sessionStorage.getItem(key);
	if (existing) return existing;

	const generated = `${planId}-${String(billingCycle).toUpperCase()}-${crypto.randomUUID()}`;
	sessionStorage.setItem(key, generated);
	return generated;
}

export function clearPaymentIdempotencyKey(planId, billingCycle) {
	if (!planId || !billingCycle) return;
	sessionStorage.removeItem(storageKey(planId, billingCycle));
}

export function peekPaymentIdempotencyKey(planId, billingCycle) {
	if (!planId || !billingCycle) return null;
	return sessionStorage.getItem(storageKey(planId, billingCycle));
}
