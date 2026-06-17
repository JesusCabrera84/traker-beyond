import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { pageTransitionStore } from './pageTransitionStore.js';

const { goto } = vi.hoisted(() => ({
	goto: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	goto
}));

describe('pageTransitionStore', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		goto.mockResolvedValue(undefined);
		pageTransitionStore.endTransition();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('goto runs transition and navigates', async () => {
		const promise = pageTransitionStore.goto('/auth', { duration: 100 });
		expect(get(pageTransitionStore).isTransitioning).toBe(true);
		await vi.advanceTimersByTimeAsync(100);
		await promise;
		expect(goto).toHaveBeenCalledWith('/auth', { replaceState: false });
		expect(get(pageTransitionStore).isTransitioning).toBe(false);
	});

	it('startTransition and endTransition toggle state', () => {
		pageTransitionStore.startTransition('slide');
		expect(get(pageTransitionStore)).toMatchObject({
			isTransitioning: true,
			transitionType: 'slide'
		});
		pageTransitionStore.endTransition();
		expect(get(pageTransitionStore).isTransitioning).toBe(false);
	});
});
