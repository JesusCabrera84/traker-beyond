import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockMount = vi.fn();
const mockElements = {
	create: vi.fn(() => ({ mount: mockMount })),
	submit: vi.fn(async () => ({ error: null }))
};

const mockStripe = {
	elements: vi.fn(() => mockElements),
	confirmSetup: vi.fn(async () => ({ error: null })),
	confirmPayment: vi.fn(async () => ({ paymentIntent: { id: 'pi_1' } })),
	confirmCardPayment: vi.fn(async () => ({ paymentIntent: { id: 'pi_2' } }))
};

vi.mock('@stripe/stripe-js', () => ({
	loadStripe: vi.fn(async () => mockStripe)
}));

vi.mock('$lib/stores/authStore.js', () => ({
	authStore: {
		subscribe: (fn) => {
			fn({});
			return () => {};
		}
	}
}));

describe('billingService', () => {
	let billingService;

	beforeEach(async () => {
		vi.resetModules();
		vi.clearAllMocks();
		sessionStorage.setItem('geminis_access_token', 'access-token');
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ plans: [{ id: 'basic' }] })
			})
		);
		({ billingService } = await import('./billingService.js'));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('getPlans returns plans array', async () => {
		const plans = await billingService.getPlans();
		expect(plans).toEqual([{ id: 'basic' }]);
	});

	it('getSummary returns billing summary', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ total_mxn: 100 })
		});
		await expect(billingService.getSummary()).resolves.toEqual({ total_mxn: 100 });
	});

	it('getPayments normalizes payment fields', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({
				payments: [{ payment_status: 'paid', succeeded_at: '2026-01-01' }],
				total: 1,
				has_more: false
			})
		});
		const result = await billingService.getPayments({ status: 'paid' });
		expect(result.data[0]).toMatchObject({
			status: 'paid',
			paid_at: '2026-01-01',
			method: 'card'
		});
	});

	it('getInvoices normalizes invoice fields', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({
				invoices: [{ total_amount: 50, stripe_receipt_url: 'https://r' }],
				total: 1
			})
		});
		const result = await billingService.getInvoices();
		expect(result.data[0]).toMatchObject({
			total_mxn: 50,
			invoice_url: 'https://r'
		});
	});

	it('getAvailableGateways returns configured gateways', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ publishable_key: 'pk', available_gateways: ['stripe', 'other'] })
		});
		await expect(billingService.getAvailableGateways()).resolves.toEqual(['stripe', 'other']);
	});

	it('getAvailableGateways falls back to stripe on error', async () => {
		fetch.mockRejectedValueOnce(new Error('network'));
		await expect(billingService.getAvailableGateways()).resolves.toEqual(['stripe']);
	});

	it('getGatewayConfig caches response', async () => {
		fetch.mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ publishable_key: 'pk_test' })
		});
		const first = await billingService.getGatewayConfig();
		const second = await billingService.getGatewayConfig();
		expect(first).toEqual(second);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it('getPaymentMethods returns array', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => [{ id: 'pm_1' }]
		});
		await expect(billingService.getPaymentMethods()).resolves.toEqual([{ id: 'pm_1' }]);
	});

	it('deletePaymentMethod accepts 204', async () => {
		fetch.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) });
		await expect(billingService.deletePaymentMethod('pm_1')).resolves.toEqual({ ok: true });
	});

	it('setDefaultPaymentMethod returns body', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ default: 'pm_1' })
		});
		await expect(billingService.setDefaultPaymentMethod('pm_1')).resolves.toEqual({
			default: 'pm_1'
		});
	});

	it('createPaymentIntent maps conflict and forbidden errors', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 409,
			json: async () => ({ detail: 'Ya pagado' })
		});
		await expect(
			billingService.createPaymentIntent({ planId: 'p1', billingCycle: 'monthly' })
		).rejects.toThrow('Ya pagado');

		fetch.mockResolvedValueOnce({
			ok: false,
			status: 403,
			json: async () => ({ detail: 'Sin permiso' })
		});
		await expect(
			billingService.createPaymentIntent({ planId: 'p1', billingCycle: 'monthly' })
		).rejects.toThrow('Sin permiso');
	});

	it('initAddPaymentMethodFlow mounts stripe elements', async () => {
		fetch
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({ publishable_key: 'pk_test' })
			})
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({ client_token: 'seti_secret' })
			});

		const flow = await billingService.initAddPaymentMethodFlow('card-mount');
		expect(flow.gateway).toBe('stripe');
		expect(mockMount).toHaveBeenCalledWith('#card-mount');
		await flow.confirmSetup('https://return');
		expect(mockStripe.confirmSetup).toHaveBeenCalled();
	});

	it('mountCardForm mounts payment element in DOM', async () => {
		const el = document.createElement('div');
		el.id = 'pay-mount';
		document.body.appendChild(el);

		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ publishable_key: 'pk_test' })
		});

		const form = await billingService.mountCardForm({ mountId: 'pay-mount', amountMxn: 99.5 });
		expect(mockMount).toHaveBeenCalledWith(el);
		await expect(form.submit()).resolves.toEqual({ error: null });
		await form.confirmPayment('pi_secret', 'https://return');
		expect(mockStripe.confirmPayment).toHaveBeenCalled();

		el.remove();
	});

	it('confirmWithSavedPM delegates to stripe', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ publishable_key: 'pk_test' })
		});
		await billingService.confirmWithSavedPM({
			clientSecret: 'cs',
			paymentMethodToken: 'pm_1'
		});
		expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith('cs', {
			payment_method: 'pm_1'
		});
	});

	it('throws when session token is missing', async () => {
		sessionStorage.clear();
		await expect(billingService.getSummary()).rejects.toThrow('Sesión no iniciada');
	});

	it('throws on 401 from authFetch', async () => {
		fetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
		await expect(billingService.getSummary()).rejects.toThrow('Tu sesión expiró');
	});

	it('rejects unsupported gateway flow', async () => {
		fetch
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({ publishable_key: 'pk' })
			})
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({ client_token: 'seti' })
			});

		await expect(billingService.initAddPaymentMethodFlow('mount', 'unknown')).rejects.toThrow(
			'no implementado'
		);
	});

	it('surfaces API errors from summary endpoint', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			json: async () => ({ detail: 'Server down' })
		});
		await expect(billingService.getSummary()).rejects.toThrow('Server down');
	});

	it('deletePaymentMethod throws on failure', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: async () => ({ detail: 'Cannot delete' })
		});
		await expect(billingService.deletePaymentMethod('pm_bad')).rejects.toThrow('Cannot delete');
	});

	it('mountCardForm throws when mount element is missing', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ publishable_key: 'pk_test' })
		});
		await expect(
			billingService.mountCardForm({ mountId: 'missing-node', amountMxn: 10 })
		).rejects.toThrow('no encontrado');
	});
});
