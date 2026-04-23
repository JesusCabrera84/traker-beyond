/**
 * Datos de demostración / normalización de facturación (sin nombres comerciales de paquetes).
 * Los nombres de planes definitivos vendrán de la API.
 */

const TAX_NOTE =
	'Precios más IVA en caso de requerir facturación (cláusulas generales Nexus by GeminisLabs).';

export const demoBillingSummary = {
	plan_key: 'default_public',
	plan_name: 'Plan contratado',
	plan_tagline: 'Cobro recurrente según los términos de tu suscripción',
	product_line: 'Suscripción',
	base_mxn: 199,
	vehicles_included: 1,
	vehicles_active: 3,
	extra_vehicle_mxn: 199,
	billing_cycle: 'monthly',
	annual_terms:
		'Pago anual anticipado puede incluir condiciones de descuento según el contrato vigente. Revisa con tu asesor comercial o las cláusulas de tu acuerdo.',
	next_charge_date: '2026-05-01',
	next_amount_mxn: 597,
	estimated_tax_label: TAX_NOTE,
	currency: 'MXN',
	processor: 'stripe',
	addons_mxn: 0
};

export const demoPaymentMethods = [
	{
		id: 'pm_demo_visa',
		brand: 'visa',
		last4: '4242',
		exp_month: 12,
		exp_year: 2027,
		is_default: true,
		label: 'Visa terminación 4242'
	},
	{
		id: 'pm_demo_mc',
		brand: 'mastercard',
		last4: '5555',
		exp_month: 8,
		exp_year: 2026,
		is_default: false,
		label: 'Mastercard terminación 5555'
	}
];

export const demoInvoices = [
	{
		id: 'inv_2026_04',
		issued_at: '2026-04-01',
		description: 'Renta de suscripción — 3 unidades (3 × $199.00 MXN)',
		subtotal_mxn: 514.66,
		tax_mxn: 82.34,
		total_mxn: 597,
		status: 'paid',
		series: 'NEX',
		folio: 'A-00048'
	},
	{
		id: 'inv_2026_03',
		issued_at: '2026-03-01',
		description: 'Renta de suscripción — 3 unidades',
		subtotal_mxn: 514.66,
		tax_mxn: 82.34,
		total_mxn: 597,
		status: 'paid',
		series: 'NEX',
		folio: 'A-00047'
	},
	{
		id: 'inv_2026_02',
		issued_at: '2026-02-01',
		description: 'Renta de suscripción — 2 unidades',
		subtotal_mxn: 343.1,
		tax_mxn: 54.9,
		total_mxn: 398,
		status: 'paid',
		series: 'NEX',
		folio: 'A-00046'
	}
];

/**
 * Normaliza respuesta GET /billing/summary si el backend envía otro shape.
 */
export function normalizeBillingSummary(raw) {
	if (!raw || typeof raw !== 'object') return { ...demoBillingSummary };
	const p = raw.plan || raw;
	return {
		plan_key: p.plan_key ?? raw.plan_key ?? demoBillingSummary.plan_key,
		plan_name: p.name ?? raw.plan_name ?? demoBillingSummary.plan_name,
		plan_tagline: p.tagline ?? raw.plan_tagline ?? demoBillingSummary.plan_tagline,
		product_line: raw.product_line ?? p.product_line ?? demoBillingSummary.product_line,
		base_mxn: Number(p.base_mxn ?? raw.base_mxn ?? demoBillingSummary.base_mxn),
		vehicles_included: Number(p.vehicles_included ?? raw.vehicles_included ?? 1),
		vehicles_active: Number(
			raw.vehicles_active ?? p.vehicles_active ?? demoBillingSummary.vehicles_active
		),
		extra_vehicle_mxn: Number(
			p.extra_vehicle_mxn ?? raw.extra_vehicle_mxn ?? demoBillingSummary.extra_vehicle_mxn
		),
		billing_cycle: raw.billing_cycle ?? p.billing_cycle ?? 'monthly',
		annual_terms: raw.annual_terms ?? demoBillingSummary.annual_terms,
		next_charge_date:
			raw.next_charge_date ?? raw.next_payment_date ?? demoBillingSummary.next_charge_date,
		next_amount_mxn: Number(
			raw.next_amount_mxn ?? raw.amount_mxn ?? demoBillingSummary.next_amount_mxn
		),
		estimated_tax_label: raw.estimated_tax_label ?? demoBillingSummary.estimated_tax_label,
		currency: raw.currency ?? 'MXN',
		processor: raw.processor ?? 'stripe',
		addons_mxn: Number(raw.addons_mxn ?? 0)
	};
}
