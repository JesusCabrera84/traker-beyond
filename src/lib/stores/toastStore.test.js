import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { toastStore } from './toastStore.js';

describe('toastStore', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		toastStore.clear();
	});

	it('adds a toast with string message', () => {
		toastStore.add('Hello', 'success');
		const toasts = get(toastStore);
		expect(toasts).toHaveLength(1);
		expect(toasts[0].message).toBe('Hello');
		expect(toasts[0].type).toBe('success');
	});

	it('removes a toast by id', () => {
		const id = toastStore.warning('Warn');
		toastStore.remove(id);
		expect(get(toastStore)).toHaveLength(0);
	});

	it('clears all toasts', () => {
		toastStore.info('One');
		toastStore.error('Two');
		toastStore.clear();
		expect(get(toastStore)).toHaveLength(0);
	});
});
