/** Formato de moneda para facturación (Nexus / MXN). */
const _mxnFmt = new Intl.NumberFormat('es-MX', {
	style: 'currency',
	currency: 'MXN',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

/**
 * Convierte una cantidad de la API a centavos enteros.
 *
 * Acepta strings ("1546.66") e enteros de pesos (1499). Rechaza floats:
 * `346.84 * 100` no es 34684 en IEEE-754, y eso es lo que Stripe cobra.
 *
 * @param {string|number|null|undefined} value
 * @returns {number} centavos enteros
 */
export function toCents(value) {
	if (value == null || value === '') return 0;
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) return 0;
		if (!Number.isInteger(value)) {
			throw new Error('el dinero no se representa en punto flotante');
		}
		return value * 100;
	}
	const text = String(value).trim().replace(/,/g, '');
	const match = text.match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/);
	if (!match) {
		throw new Error(`cantidad inválida: ${value}`);
	}
	const sign = match[1] === '-' ? -1 : 1;
	const whole = parseInt(match[2], 10);
	const frac = parseInt((match[3] ?? '').padEnd(2, '0') || '0', 10);
	return sign * (whole * 100 + frac);
}

/**
 * Formatea centavos enteros como MXN sin pasar por float.
 * @param {number} cents
 * @returns {string}
 */
export function formatCents(cents) {
	const n = Number.isInteger(cents) ? cents : 0;
	const sign = n < 0 ? '-' : '';
	const abs = Math.abs(n);
	const whole = Math.trunc(abs / 100);
	const frac = String(abs % 100).padStart(2, '0');
	const grouped = new Intl.NumberFormat('es-MX').format(whole);
	return `${sign}$${grouped}.${frac}`;
}

/**
 * Formatea una cantidad de la API (string o pesos enteros) como MXN.
 * @param {string|number|null|undefined} amount
 * @returns {string}
 */
export function formatMxn(amount) {
	try {
		return formatCents(toCents(amount));
	} catch {
		return _mxnFmt.format(0);
	}
}

/**
 * Multiplica una cantidad de la API por un entero (p. ej. 12 meses).
 * Solo factor entero: `230.84 * 12` en float no es el total del año.
 *
 * @param {string|number|null|undefined} amount
 * @param {number} factor
 * @returns {string}
 */
export function multiplyAmount(amount, factor) {
	if (!Number.isInteger(factor) || factor < 0) {
		throw new Error('el factor debe ser un entero no negativo');
	}
	return formatCents(toCents(amount) * factor);
}

/**
 * IVA 16% en aritmética de enteros (centavos), igual que el backend.
 * Solo para pruebas del redondeo: el checkout no calcula, muestra la cotización.
 *
 * @param {string|number} subtotal
 * @returns {{ subtotal: string, iva: string, total: string, amount_cents: number }}
 */
export function withIva(subtotal) {
	const base = toCents(subtotal);
	// (base * 16) / 100, half-up, todo en enteros.
	const tax = Math.trunc((base * 16 + 50) / 100);
	return {
		subtotal: fromCents(base),
		iva: fromCents(tax),
		total: fromCents(base + tax),
		amount_cents: base + tax
	};
}

function fromCents(cents) {
	const sign = cents < 0 ? '-' : '';
	const abs = Math.abs(cents);
	return `${sign}${Math.trunc(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
