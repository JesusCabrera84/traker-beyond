import { describe, it, expect, beforeEach } from 'vitest';
import {
	getOrCreatePaymentIdempotencyKey,
	clearPaymentIdempotencyKey,
	peekPaymentIdempotencyKey
} from './idempotency.js';

describe('payment idempotency keys', () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	it('rejects missing plan or cycle', () => {
		expect(() => getOrCreatePaymentIdempotencyKey('', 'MONTHLY')).toThrow(/requeridos/);
		expect(() => getOrCreatePaymentIdempotencyKey('plan-1', '')).toThrow(/requeridos/);
	});

	it('reuses the same key for the same plan and cycle', () => {
		const first = getOrCreatePaymentIdempotencyKey('plan-a', 'monthly');
		const second = getOrCreatePaymentIdempotencyKey('plan-a', 'MONTHLY');
		expect(first).toBe(second);
		expect(first).toContain('plan-a-MONTHLY-');
	});

	it('issues a different key when the billing cycle changes', () => {
		const monthly = getOrCreatePaymentIdempotencyKey('plan-a', 'MONTHLY');
		const yearly = getOrCreatePaymentIdempotencyKey('plan-a', 'YEARLY');
		expect(monthly).not.toBe(yearly);
	});

	it('issues a different key for a different plan', () => {
		const a = getOrCreatePaymentIdempotencyKey('plan-a', 'MONTHLY');
		const b = getOrCreatePaymentIdempotencyKey('plan-b', 'MONTHLY');
		expect(a).not.toBe(b);
	});

	it('clears only the targeted plan/cycle key', () => {
		getOrCreatePaymentIdempotencyKey('plan-a', 'MONTHLY');
		getOrCreatePaymentIdempotencyKey('plan-a', 'YEARLY');
		clearPaymentIdempotencyKey('plan-a', 'MONTHLY');
		expect(peekPaymentIdempotencyKey('plan-a', 'MONTHLY')).toBeNull();
		expect(peekPaymentIdempotencyKey('plan-a', 'YEARLY')).toBeTruthy();
	});

	it('clear and peek ignore incomplete arguments', () => {
		expect(() => clearPaymentIdempotencyKey('', 'MONTHLY')).not.toThrow();
		expect(peekPaymentIdempotencyKey(null, 'MONTHLY')).toBeNull();
	});
});
