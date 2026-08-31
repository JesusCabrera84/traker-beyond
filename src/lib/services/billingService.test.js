import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockMount = vi.fn();
const mockElements = {
	create: vi.fn(() => ({ mount: mockMount })),
	submit: vi.fn(async () => ({ error: null })),
	update: vi.fn()
};

const mockStripe = {
	elements: vi.fn(() => mockElements),
	confirmSetup: vi.fn(async () => ({ error: null })),
	confirmPayment: vi.fn(async () => ({ paymentIntent: { id: 'pi_1' } })),
	confirmCardPayment: vi.fn(async () => ({ paymentIntent: { id: 'pi_2' } })),
	retrievePaymentIntent: vi.fn(async () => ({
		paymentIntent: { id: 'pi_3', status: 'succeeded' }
	}))
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
		sessionStorage.clear();
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
			invoice_url: 'https://r',
			has_receipt: false,
			has_cfdi: false,
			cfdi_uuid: null
		});
	});

	it('downloadInvoiceReceipt saves a PDF blob', async () => {
		const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			blob: async () => blob
		});
		vi.stubGlobal('URL', {
			createObjectURL: vi.fn(() => 'blob:receipt'),
			revokeObjectURL: vi.fn()
		});
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		await billingService.downloadInvoiceReceipt('inv-1', 'INV-2026-0002');
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/billing/invoices/inv-1/receipt.pdf'),
			expect.any(Object)
		);
		expect(URL.createObjectURL).toHaveBeenCalled();
		expect(click).toHaveBeenCalled();
		click.mockRestore();
	});

	it('getTaxProfile and saveTaxProfile call billing endpoints', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ rfc: 'ABC101010111', is_complete: true })
		});
		await expect(billingService.getTaxProfile()).resolves.toMatchObject({
			rfc: 'ABC101010111',
			is_complete: true
		});
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ rfc: 'ABC101010111', is_complete: true })
		});
		await billingService.saveTaxProfile({
			rfc: 'ABC101010111',
			legal_name: 'Acme',
			tax_system: '601',
			zip: '85900',
			default_cfdi_use: 'G03'
		});
		expect(fetch).toHaveBeenLastCalledWith(
			expect.stringContaining('/api/v1/billing/tax-profile'),
			expect.objectContaining({ method: 'PUT' })
		);
	});

	it('stampInvoiceCfdi posts use and downloadInvoiceCfdi saves the file', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ id: 'inv-1', has_cfdi: true, cfdi_uuid: 'uuid-1' })
		});
		await expect(billingService.stampInvoiceCfdi('inv-1', 'G03')).resolves.toMatchObject({
			has_cfdi: true
		});
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/billing/invoices/inv-1/cfdi'),
			expect.objectContaining({ method: 'POST' })
		);

		const blob = new Blob(['<cfdi/>'], { type: 'application/xml' });
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			blob: async () => blob
		});
		vi.stubGlobal('URL', {
			createObjectURL: vi.fn(() => 'blob:cfdi'),
			revokeObjectURL: vi.fn()
		});
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		await billingService.downloadInvoiceCfdi('inv-1', 'xml', 'INV-2026-0002');
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/billing/invoices/inv-1/cfdi.xml'),
			expect.any(Object)
		);
		expect(click).toHaveBeenCalled();
		click.mockRestore();
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

	it('confirmSetupIntent posts the setup intent id', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => [{ id: 'pm_1', last4: '4242' }]
		});
		await expect(billingService.confirmSetupIntent('si_1')).resolves.toEqual([
			{ id: 'pm_1', last4: '4242' }
		]);
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/stripe/payment-methods/confirm'),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ setup_intent_id: 'si_1', gateway: 'stripe' })
			})
		);
	});

	it('confirmSetupIntent never surfaces [object Object] for FastAPI 422', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 422,
			json: async () => ({
				detail: [
					{
						loc: ['body', 'setup_intent_id'],
						msg: 'Value error, setup_intent_id inválido'
					}
				]
			})
		});
		const err = await billingService.confirmSetupIntent('seti_1').catch((e) => e);
		expect(err).toBeInstanceOf(Error);
		expect(err.message).toBe('setup_intent_id inválido');
		expect(err.message).not.toBe('[object Object]');
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
		).rejects.toMatchObject({ message: 'Ya pagado', code: 'PAYMENT_ALREADY_PROCESSED' });

		fetch.mockResolvedValueOnce({
			ok: false,
			status: 403,
			json: async () => ({ detail: 'Sin permiso' })
		});
		await expect(
			billingService.createPaymentIntent({ planId: 'p1', billingCycle: 'monthly' })
		).rejects.toThrow('Sin permiso');
	});

	it('createPaymentIntent sends a stable Idempotency-Key', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 201,
			json: async () => ({ client_token: 'cs_test' })
		});
		await billingService.createPaymentIntent({ planId: 'plan-9', billingCycle: 'MONTHLY' });
		const firstHeaders = fetch.mock.calls[0][1].headers;
		expect(firstHeaders['Idempotency-Key']).toContain('plan-9-MONTHLY-');

		fetch.mockResolvedValueOnce({
			ok: true,
			status: 201,
			json: async () => ({ client_token: 'cs_test' })
		});
		await billingService.createPaymentIntent({ planId: 'plan-9', billingCycle: 'MONTHLY' });
		const secondHeaders = fetch.mock.calls[1][1].headers;
		expect(secondHeaders['Idempotency-Key']).toBe(firstHeaders['Idempotency-Key']);
	});

	it('createPaymentIntent surfaces generic API errors', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			json: async () => ({ detail: 'Stripe down' })
		});
		await expect(
			billingService.createPaymentIntent({ planId: 'p3', billingCycle: 'MONTHLY' })
		).rejects.toThrow('Stripe down');
	});

	it('createPaymentIntent uses explicit idempotencyKey when provided', async () => {
		const explicitIdem = 'explicit-idem-12345678';
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 201,
			json: async () => ({ client_token: 'cs_explicit' })
		});
		await billingService.createPaymentIntent({
			planId: 'plan-x',
			billingCycle: 'YEARLY',
			idempotencyKey: explicitIdem
		});
		expect(fetch.mock.calls[0][1].headers['Idempotency-Key']).toBe(explicitIdem);
	});

	it('createPaymentIntent refuses to call the API without a key', async () => {
		await expect(
			billingService.createPaymentIntent({
				planId: 'plan-x',
				billingCycle: 'YEARLY',
				idempotencyKey: ''
			})
		).rejects.toThrow(/idempotencia/);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('createPaymentIntent maps structured 409 detail objects', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 409,
			json: async () => ({
				detail: { code: 'PAYMENT_ALREADY_PROCESSED', message: 'Ya cobrado' }
			})
		});
		await expect(
			billingService.createPaymentIntent({ planId: 'p2', billingCycle: 'YEARLY' })
		).rejects.toMatchObject({ message: 'Ya cobrado', code: 'PAYMENT_ALREADY_PROCESSED' });
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

		const form = await billingService.mountCardForm({ mountId: 'pay-mount', amountCents: 9950 });
		expect(mockMount).toHaveBeenCalledWith(el);
		expect(mockStripe.elements).toHaveBeenCalledWith(
			expect.objectContaining({ amount: 9950, currency: 'mxn' })
		);
		await expect(form.submit()).resolves.toEqual({ error: null });
		await form.confirmPayment('pi_secret', 'https://return');
		expect(mockStripe.confirmPayment).toHaveBeenCalled();

		el.remove();
	});

	it('mountCardForm can requote the element so it matches the PaymentIntent', async () => {
		const el = document.createElement('div');
		el.id = 'requote-mount';
		document.body.appendChild(el);

		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ publishable_key: 'pk_test' })
		});

		const form = await billingService.mountCardForm({
			mountId: 'requote-mount',
			amountCents: 34684
		});
		form.updateAmount(346840);
		expect(mockElements.update).toHaveBeenCalledWith({ amount: 346840 });

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
			paymentMethodToken: 'pm_1',
			returnUrl: 'https://return'
		});
		expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith('cs', {
			payment_method: 'pm_1',
			return_url: 'https://return'
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

	it('maps Failed to fetch to a human connection error', async () => {
		fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
		await expect(billingService.getSummary()).rejects.toThrow(
			'No se pudo conectar con el servidor'
		);
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
			billingService.mountCardForm({ mountId: 'missing-node', amountCents: 1000 })
		).rejects.toThrow('no encontrado');
	});

	it('setDefaultPaymentMethod throws on failure', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: async () => ({ detail: 'No es tuyo' })
		});
		await expect(billingService.setDefaultPaymentMethod('pm_bad')).rejects.toThrow('No es tuyo');
	});

	it('waitForPaymentIntent returns as soon as the bank confirms', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ publishable_key: 'pk_test' })
		});
		mockStripe.retrievePaymentIntent
			.mockResolvedValueOnce({ paymentIntent: { status: 'requires_action' } })
			.mockResolvedValueOnce({ paymentIntent: { status: 'succeeded' } });

		const result = await billingService.waitForPaymentIntent('cs_test', {
			timeoutMs: 5000,
			intervalMs: 1
		});
		expect(result.paymentIntent.status).toBe('succeeded');
		expect(mockStripe.retrievePaymentIntent).toHaveBeenCalledTimes(2);
	});

	it('getQuote asks the backend for the official price', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({
				subtotal: '1333.33',
				tax: '213.33',
				total: '1546.66',
				amount_cents: 154666
			})
		});
		const quoted = await billingService.getQuote('plan-1', 'MONTHLY');
		expect(quoted.amount_cents).toBe(154666);
		expect(quoted.total).toBe('1546.66');
	});

	it('createPaymentIntent uses fallback message when 409 body is empty', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 409,
			json: async () => ({})
		});
		await expect(
			billingService.createPaymentIntent({ planId: 'p4', billingCycle: 'MONTHLY' })
		).rejects.toMatchObject({
			message: 'Este período ya fue pagado',
			code: 'PAYMENT_ALREADY_PROCESSED'
		});
	});
});
