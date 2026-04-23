/** Formato de moneda para facturación (Nexus / MXN). */
export function formatMxn(amount) {
	if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
		return '—';
	}
	return new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'MXN',
		maximumFractionDigits: 2
	}).format(Number(amount));
}
