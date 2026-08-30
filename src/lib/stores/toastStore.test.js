import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { humanizeToastMessage, toastStore } from './toastStore.js';

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

	it('supports convenience helpers', () => {
		const id = toastStore.success('Done', 0);
		expect(get(toastStore)[0]).toMatchObject({ type: 'success', message: 'Done' });
		toastStore.remove(id);
	});

	it('never surfaces [object Object] from FastAPI 422 bodies', () => {
		toastStore.error({
			detail: [{ loc: ['body'], msg: 'Value error, setup_intent_id inválido' }]
		});
		expect(get(toastStore)[0].message).toBe('setup_intent_id inválido');
	});

	it('reads Error.message instead of [object Object]', () => {
		toastStore.error(new Error('La tarjeta fue declinada'));
		expect(get(toastStore)[0].message).toBe('La tarjeta fue declinada');
	});
});

describe('humanizeToastMessage', () => {
	it('strips FastAPI Value error prefix', () => {
		expect(humanizeToastMessage([{ msg: 'Value error, setup_intent_id inválido' }])).toBe(
			'setup_intent_id inválido'
		);
	});

	it('rejects [object Object]', () => {
		expect(humanizeToastMessage('[object Object]')).toBe('Algo salió mal. Intenta de nuevo.');
	});
});
