/**
 * billingService.js — sin mocks, todo de la API real.
 */
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/authStore.js';
import { loadStripe } from '@stripe/stripe-js';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8100';
const _sdkInstances = {};
let _gatewayConfig = null;

function _getToken() {
	const auth = get(authStore);
	return (
		auth?.accessToken ??
		auth?.access_token ??
		sessionStorage.getItem('geminis_access_token') ??
		null
	);
}

async function authFetch(path, options = {}) {
	const token = _getToken();
	if (!token) throw new Error('Sesión no iniciada');
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			...(options.headers ?? {})
		}
	});
	if (res.status === 401) throw new Error('Tu sesión expiró. Por favor inicia sesión de nuevo.');
	return res;
}

async function getGatewayConfig(gateway) {
	if (_gatewayConfig && !gateway) return _gatewayConfig;
	const res = await authFetch(`/api/v1/stripe/config${gateway ? `?gateway=${gateway}` : ''}`);
	if (!res.ok) throw new Error('No se pudo obtener la configuración de pagos');
	const config = await res.json();
	if (!gateway) _gatewayConfig = config;
	return config;
}

async function getAvailableGateways() {
	try {
		return (await getGatewayConfig()).available_gateways ?? ['stripe'];
	} catch {
		return ['stripe'];
	}
}

async function getSDK(gateway = 'stripe') {
	if (_sdkInstances[gateway]) return _sdkInstances[gateway];
	const config = await getGatewayConfig(gateway);
	if (gateway === 'stripe') {
		const instance = await loadStripe(config.publishable_key);
		if (!instance) throw new Error('Error cargando Stripe.js');
		_sdkInstances['stripe'] = instance;
		return instance;
	}
	throw new Error(`SDK para pasarela '${gateway}' no implementado`);
}

function stripeAppearance() {
	return {
		theme: 'night',
		variables: {
			colorPrimary: '#6366f1',
			colorBackground: '#0d1520',
			colorText: '#e2e8f0',
			colorTextSecondary: '#64748b',
			colorDanger: '#ef4444',
			fontFamily: '"Inter",system-ui,sans-serif',
			fontSizeBase: '14px',
			borderRadius: '10px'
		},
		rules: {
			'.Input': {
				backgroundColor: 'rgba(255,255,255,0.04)',
				border: '1px solid rgba(255,255,255,0.08)',
				boxShadow: 'none',
				color: '#e2e8f0'
			},
			'.Input:focus': {
				border: '1px solid rgba(99,102,241,0.5)',
				boxShadow: '0 0 0 3px rgba(99,102,241,0.12)'
			},
			'.Label': { color: '#64748b', fontSize: '12px', fontWeight: '600' },
			'.Tab': {
				backgroundColor: 'rgba(255,255,255,0.03)',
				border: '1px solid rgba(255,255,255,0.06)'
			},
			'.Tab--selected': {
				backgroundColor: 'rgba(99,102,241,0.12)',
				border: '1px solid rgba(99,102,241,0.3)',
				color: '#a5b4fc'
			}
		}
	};
}

// ── Billing read-only ─────────────────────────────────────────────────────────
async function getSummary() {
	const res = await authFetch('/api/v1/billing/summary');
	if (!res.ok) {
		const b = await res.json().catch(() => ({}));
		throw new Error(b.detail ?? `Error ${res.status}`);
	}
	return res.json();
}

async function getPayments({ limit = 20, offset = 0, status = null } = {}) {
	let url = `/api/v1/billing/payments?limit=${limit}&offset=${offset}`;
	if (status) url += `&status=${status}`;
	const res = await authFetch(url);
	if (!res.ok) {
		const b = await res.json().catch(() => ({}));
		throw new Error(b.detail ?? `Error ${res.status}`);
	}
	const body = await res.json();
	return { data: body.payments ?? [], total: body.total ?? 0, has_more: body.has_more ?? false };
}

async function getInvoices({ limit = 20, offset = 0 } = {}) {
	const res = await authFetch(`/api/v1/billing/invoices?limit=${limit}&offset=${offset}`);
	if (!res.ok) {
		const b = await res.json().catch(() => ({}));
		throw new Error(b.detail ?? `Error ${res.status}`);
	}
	const body = await res.json();
	return { data: body.invoices ?? [], total: body.total ?? 0, has_more: body.has_more ?? false };
}

async function getPlans() {
	const res = await fetch(`${API_BASE}/api/v1/plans`);
	if (!res.ok) throw new Error(`Error ${res.status} al obtener planes`);
	const body = await res.json();
	return body.plans ?? [];
}

// ── Payment methods ───────────────────────────────────────────────────────────
async function getPaymentMethods(gateway = 'stripe') {
	const res = await authFetch(`/api/v1/stripe/payment-methods?gateway=${gateway}`);
	if (!res.ok) {
		const b = await res.json().catch(() => ({}));
		throw new Error(b.detail ?? `Error ${res.status}`);
	}
	const data = await res.json();
	return Array.isArray(data) ? data : [];
}

async function initAddPaymentMethodFlow(mountId, gateway = 'stripe') {
	const res = await authFetch(`/api/v1/stripe/setup-intent?gateway=${gateway}`, { method: 'POST' });
	if (!res.ok) {
		const b = await res.json().catch(() => ({}));
		throw new Error(b.detail ?? 'Error al inicializar el guardado de tarjeta');
	}
	const { client_token } = await res.json();
	if (gateway === 'stripe') {
		const stripe = await getSDK('stripe');
		const elements = stripe.elements({
			clientSecret: client_token,
			appearance: stripeAppearance(),
			locale: 'es'
		});
		elements.create('payment').mount(`#${mountId}`);
		return {
			gateway,
			async confirmSetup(returnUrl) {
				return stripe.confirmSetup({
					elements,
					confirmParams: { return_url: returnUrl },
					redirect: 'if_required'
				});
			}
		};
	}
	throw new Error(`Flujo no implementado para '${gateway}'`);
}

async function deletePaymentMethod(externalToken, gateway = 'stripe') {
	const res = await authFetch(
		`/api/v1/stripe/payment-methods/${encodeURIComponent(externalToken)}?gateway=${gateway}`,
		{ method: 'DELETE' }
	);
	if (res.status === 204) return { ok: true };
	const b = await res.json().catch(() => ({}));
	throw new Error(b.detail ?? 'Error al eliminar');
}

async function setDefaultPaymentMethod(externalToken, gateway = 'stripe') {
	const res = await authFetch('/api/v1/stripe/payment-methods/default', {
		method: 'PATCH',
		body: JSON.stringify({ external_token: externalToken, gateway })
	});
	if (!res.ok) {
		const b = await res.json().catch(() => ({}));
		throw new Error(b.detail ?? 'Error al actualizar');
	}
	return res.json();
}

async function initSubscriptionPaymentFlow({ planId, billingCycle, gateway = 'stripe' }) {
	const res = await authFetch('/api/v1/stripe/payment-intent', {
		method: 'POST',
		body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle, gateway })
	});
	if (!res.ok) {
		const b = await res.json().catch(() => ({}));
		if (res.status === 409) throw new Error(b.detail ?? 'Este período ya fue pagado');
		throw new Error(b.detail ?? 'Error al inicializar el pago');
	}
	const { client_token, amount_mxn, amount_with_iva, plan_name, plan_code } = await res.json();
	if (gateway === 'stripe') {
		const stripe = await getSDK('stripe');
		const elements = stripe.elements({
			clientSecret: client_token,
			appearance: stripeAppearance(),
			locale: 'es'
		});
		return {
			gateway,
			paymentInfo: { amount_mxn, amount_with_iva, plan_name, plan_code },
			elements,
			async confirmPayment(returnUrl) {
				return stripe.confirmPayment({
					elements,
					confirmParams: { return_url: returnUrl },
					redirect: 'if_required'
				});
			}
		};
	}
	throw new Error(`Flujo de pago no implementado para '${gateway}'`);
}

export const billingService = {
	getGatewayConfig,
	getAvailableGateways,
	getSummary,
	getPayments,
	getInvoices,
	getPlans,
	getPaymentMethods,
	initAddPaymentMethodFlow,
	deletePaymentMethod,
	setDefaultPaymentMethod,
	initSubscriptionPaymentFlow
};
