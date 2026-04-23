/**
 * Resuelve el locale del usuario (navegador) para fechas; fallback en SSR/Node.
 */
function getUserLocale() {
	if (typeof navigator !== 'undefined' && navigator.language) {
		return navigator.language;
	}
	return 'es';
}

/**
 * Indica si el string ISO ya incluye Z u offset (+hh:mm / -hh:mm).
 */
function hasExplicitTimeZone(s) {
	return /Z$/i.test(s) || /[+-]\d{2}:\d{2}$/.test(s) || /[+-]\d{4}$/.test(s);
}

/**
 * Convierte un instante del API a un Date fiable.
 *
 * El backend (Python) suele enviar `datetime` UTC *naive* en JSON, p. ej.
 * `2026-04-22T17:37:00` sin `Z`. ECMA-262 interpreta eso como hora **local**,
 * no UTC, y se desfasa respecto a GMT-6, etc.
 *
 * Si el valor es un ISO 8601 con `T` y sin zona, se asume **UTC** (mismo
 * sentido que `datetime.utcnow()` en el servidor) añadiendo `Z` al parsear.
 */
export function parseServerInstant(value) {
	if (value == null || value === '') {
		return null;
	}
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}
	const s = String(value).trim();
	if (!s) {
		return null;
	}
	// Incluye Z o ±offset → dejar que el motor interprete el instante
	if (hasExplicitTimeZone(s)) {
		const d = new Date(s);
		return Number.isNaN(d.getTime()) ? null : d;
	}
	// `YYYY-MM-DD` sin hora: la especificación lo trata como UTC medianoche
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
		const d = new Date(s);
		return Number.isNaN(d.getTime()) ? null : d;
	}
	// ISO *con* hora pero *sin* zona: asumir UTC (backend naive UTC)
	if (/^\d{4}-\d{2}-\d{2}T/.test(s) || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) {
		const normalized = s.replace(' ', 'T');
		const withZ = `${normalized}Z`;
		const d = new Date(withZ);
		if (!Number.isNaN(d.getTime())) {
			return d;
		}
	}
	const fallback = new Date(s);
	return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Convierte un instante (ISO 8601 u otro) a texto en la zona horaria y locale
 * del dispositivo, asumiendo UTC cuando el API envía fechas sin offset.
 */
export function formatDateTimeLocal(value) {
	if (value == null || value === '') {
		return 'Nunca';
	}
	const date = parseServerInstant(value);
	if (!date) {
		return 'Fecha inválida';
	}
	return date.toLocaleString(getUserLocale(), {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Fecha (sin hora) en locale y timezone local; mismas reglas de parseo UTC.
 */
export function formatDateLocal(value, emptyLabel = 'N/A') {
	if (value == null || value === '') {
		return emptyLabel;
	}
	const date = parseServerInstant(value);
	if (!date) {
		return 'Fecha inválida';
	}
	return date.toLocaleDateString(getUserLocale(), {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}
