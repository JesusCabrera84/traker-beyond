import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, ApiError } from './apiClient.js';

vi.mock('./sessionExpiredHandler.js', () => ({
	handleSessionExpired: vi.fn()
}));

describe('ApiError', () => {
	it('classifies error types', () => {
		expect(new ApiError('auth', 401).isAuthError()).toBe(true);
		expect(new ApiError('validation', 422).isValidationError()).toBe(true);
		expect(new ApiError('server', 500).isServerError()).toBe(true);
		expect(new ApiError('network', 0).isNetworkError()).toBe(true);
	});
});

describe('ApiClient', () => {
	let client;

	beforeEach(() => {
		client = new ApiClient();
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ ok: true })
			})
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('performs GET requests', async () => {
		const data = await client.get('/api/v1/users/me', {}, 'token-1');
		expect(data).toEqual({ ok: true });
		expect(fetch).toHaveBeenCalledOnce();
	});

	it('throws ApiError on non-ok responses', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 404,
			statusText: 'Not Found',
			json: async () => ({ message: 'Not found' })
		});

		await expect(client.get('/missing')).rejects.toMatchObject({
			name: 'ApiError',
			status: 404,
			message: 'Not found'
		});
	});
});
