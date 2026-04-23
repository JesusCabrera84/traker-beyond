import { apiClient, ApiError } from './apiClient.js';
import { API_CONFIG } from '$lib/config/api.js';
import {
	demoBillingSummary,
	demoPaymentMethods,
	demoInvoices,
	normalizeBillingSummary
} from '$lib/billing/billingDemoData.js';

class BillingService {
	getAccessToken() {
		if (typeof window === 'undefined') return null;
		return sessionStorage.getItem('geminis_id_token');
	}

	/**
	 * Resumen de facturación (plan, próximo cobro, ciclo).
	 * Si la API no está disponible, devuelve datos de demostración.
	 */
	async getSummary() {
		const token = this.getAccessToken();
		try {
			const raw = await apiClient.get(API_CONFIG.ENDPOINTS.BILLING_SUMMARY, {}, token);
			return { data: normalizeBillingSummary(raw), fromDemo: false };
		} catch (e) {
			if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
				throw e;
			}
			return { data: { ...demoBillingSummary }, fromDemo: true };
		}
	}

	/**
	 * Métodos de pago (tokens Stripe, etc.)
	 */
	async getPaymentMethods() {
		const token = this.getAccessToken();
		try {
			const raw = await apiClient.get(API_CONFIG.ENDPOINTS.BILLING_PAYMENTS, {}, token);
			const list = Array.isArray(raw) ? raw : (raw?.payment_methods ?? raw?.data ?? []);
			return { data: list, fromDemo: false };
		} catch (e) {
			if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
				throw e;
			}
			return { data: [...demoPaymentMethods], fromDemo: true };
		}
	}

	/**
	 * Facturas / comprobantes fiscales
	 */
	async getInvoices() {
		const token = this.getAccessToken();
		try {
			const raw = await apiClient.get(API_CONFIG.ENDPOINTS.BILLING_INVOICES, {}, token);
			const list = Array.isArray(raw) ? raw : (raw?.invoices ?? raw?.data ?? []);
			return { data: list, fromDemo: false };
		} catch (e) {
			if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
				throw e;
			}
			return { data: [...demoInvoices], fromDemo: true };
		}
	}
}

export const billingService = new BillingService();
