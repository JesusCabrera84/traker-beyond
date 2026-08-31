import { describe, it, expect } from 'vitest';
import { formatMxn, withIva, toCents, formatCents, multiplyAmount } from './currency.js';

describe('currency', () => {
	it('formatMxn formats amounts in MXN', () => {
		expect(formatMxn(1499)).toMatch(/1,?499\.00/);
	});

	it('formatMxn treats nullish values as zero', () => {
		expect(formatMxn(null)).toMatch(/0\.00/);
	});

	it('toCents parses API strings without float', () => {
		expect(toCents('1546.66')).toBe(154666);
		expect(toCents('150.50')).toBe(15050);
		expect(toCents('0.03')).toBe(3);
	});

	it('toCents rejects floats', () => {
		expect(() => toCents(346.84)).toThrow(/flotante/);
	});

	it('formatCents never goes through IEEE-754', () => {
		expect(formatCents(154666)).toBe('$1,546.66');
	});

	it('withIva calculates 16% IVA', () => {
		const result = withIva(100);
		expect(result.subtotal).toBe('100.00');
		expect(result.iva).toBe('16.00');
		expect(result.total).toBe('116.00');
	});

	// Mismos casos que tests/test_billing_period.py en el backend.
	it.each([
		['299.00', '47.84', '346.84'],
		['2990.00', '478.40', '3468.40'],
		['1333.33', '213.33', '1546.66'],
		['0.03', '0.00', '0.03']
	])('withIva(%s) rounds IVA to cents like the backend', (base, iva, total) => {
		const result = withIva(base);
		expect(result.iva).toBe(iva);
		expect(result.total).toBe(total);
	});

	it('multiplyAmount scales a quote by whole months without float', () => {
		expect(multiplyAmount('230.84', 12)).toBe('$2,770.08');
		expect(multiplyAmount('199.00', 12)).toBe('$2,388.00');
	});

	it('multiplyAmount rejects a non-integer factor', () => {
		expect(() => multiplyAmount('100.00', 12.5)).toThrow(/entero/);
	});
});
