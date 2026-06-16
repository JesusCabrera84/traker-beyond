import { describe, it, expect } from 'vitest';
import { formatMxn, withIva } from './currency.js';

describe('currency', () => {
	it('formatMxn formats amounts in MXN', () => {
		expect(formatMxn(1499)).toMatch(/1,?499\.00/);
	});

	it('formatMxn treats nullish values as zero', () => {
		expect(formatMxn(null)).toMatch(/0\.00/);
	});

	it('withIva calculates 16% IVA', () => {
		const result = withIva(100);
		expect(result.subtotal).toBe(100);
		expect(result.iva).toBe(16);
		expect(result.total).toBe(116);
	});
});
