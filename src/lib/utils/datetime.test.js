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
});
