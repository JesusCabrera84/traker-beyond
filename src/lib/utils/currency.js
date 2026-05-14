/** Formato de moneda para facturación (Nexus / MXN). */
const _mxnFmt = new Intl.NumberFormat('es-MX', {
	style: 'currency',
	currency: 'MXN',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

/**
 * Formatea un número como moneda MXN.
 * @param {number} amount
 * @returns {string} ej: "$1,499.00"
 */
export function formatMxn(amount) {
	return _mxnFmt.format(amount ?? 0);
}

/**
 * Calcula el total con IVA (16%).
 * @param {number} subtotal
 * @returns {{ subtotal: number, iva: number, total: number }}
 */
export function withIva(subtotal) {
	const n = Number(subtotal ?? 0);
	const iva = n * 0.16;
	return { subtotal: n, iva, total: n + iva };
}
