import { describe, it, expect } from 'vitest';
import { parseServerInstant, formatDateTimeLocal } from './datetime.js';

describe('parseServerInstant', () => {
	it('trata ISO sin zona como UTC (naive Python utcnow)', () => {
		const d = parseServerInstant('2026-04-22T17:37:00');
		expect(d).not.toBeNull();
		expect(d.getTime()).toBe(Date.parse('2026-04-22T17:37:00.000Z'));
	});

	it('respeta Z explícito', () => {
		const d = parseServerInstant('2026-04-22T17:37:00.000Z');
		expect(d.getTime()).toBe(Date.parse('2026-04-22T17:37:00.000Z'));
	});

	it('devuelve null para vacío', () => {
		expect(parseServerInstant(null)).toBeNull();
		expect(parseServerInstant('')).toBeNull();
	});
});

describe('formatDateTimeLocal', () => {
	it('formatea sin lanzar para ISO naive', () => {
		const s = formatDateTimeLocal('2026-04-22T17:37:00');
		expect(s).not.toBe('Nunca');
		expect(s).not.toBe('Fecha inválida');
	});

	it('returns Nunca for empty values', () => {
		expect(formatDateTimeLocal(null)).toBe('Nunca');
	});
});

describe('formatDateLocal', () => {
	it('formats date-only values', async () => {
		const { formatDateLocal } = await import('./datetime.js');
		expect(formatDateLocal('2026-04-22')).not.toBe('N/A');
	});

	it('returns empty label when missing', async () => {
		const { formatDateLocal } = await import('./datetime.js');
		expect(formatDateLocal(null, 'Sin fecha')).toBe('Sin fecha');
	});
});

describe('parseServerInstant edge cases', () => {
	it('parses explicit offset', async () => {
		const d = parseServerInstant('2026-04-22T17:37:00+00:00');
		expect(d).not.toBeNull();
	});

	it('returns null for invalid date', () => {
		expect(parseServerInstant('not-a-date')).toBeNull();
	});

	it('parses Date instances', () => {
		const d = new Date('2026-04-22T12:00:00Z');
		expect(parseServerInstant(d)).toEqual(d);
	});

	it('returns Fecha inválida for unparseable values', () => {
		expect(formatDateTimeLocal('not-a-date')).toBe('Fecha inválida');
	});
});
