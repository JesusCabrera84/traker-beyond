import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, ApiError } from './apiClient.js';
import { handleSessionExpired } from './sessionExpiredHandler.js';

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
		vi.useFakeTimers();
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ ok: true })
			})
		);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('performs GET requests', async () => {
		const data = await client.get('/api/v1/users/me', {}, 'token-1');
		expect(data).toEqual({ ok: true });
		expect(fetch).toHaveBeenCalledOnce();
	});

	it('performs POST, PATCH, PUT and DELETE', async () => {
		await client.post('/p', { a: 1 }, 't');
		await client.patch('/p', { a: 2 }, 't');
		await client.put('/p', { a: 3 }, 't');
		await client.delete('/p', {}, 't');
		expect(fetch).toHaveBeenCalledTimes(4);
	});

	it('returns text when JSON parsing fails', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => {
				throw new Error('not json');
			},
			text: async () => 'plain'
		});
		await expect(client.get('/text')).resolves.toBe('plain');
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

	it('handles 401 by calling handleSessionExpired', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 401,
			statusText: 'Unauthorized',
			json: async () => ({ message: 'expired' })
		});

		await expect(client.get('/secure')).rejects.toThrow('expired');
		expect(handleSessionExpired).toHaveBeenCalled();
	});

	it('handles 401 when error body is not JSON', async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 401,
			statusText: 'Unauthorized',
			json: async () => {
				throw new Error('invalid json');
			}
		});

		await expect(client.get('/secure')).rejects.toMatchObject({ status: 401 });
		expect(handleSessionExpired).toHaveBeenCalled();
	});

	it('throws timeout ApiError on abort', async () => {
		fetch.mockImplementationOnce(
			() =>
				new Promise((_resolve, reject) => {
					setTimeout(() => {
						const err = new Error('aborted');
						err.name = 'AbortError';
						reject(err);
					}, 10);
				})
		);

		const promise = client.get('/slow');
		const assertion = expect(promise).rejects.toMatchObject({ status: 408 });
		await vi.advanceTimersByTimeAsync(10000);
		await assertion;
	});

	it('wraps network errors as ApiError status 0', async () => {
		fetch.mockRejectedValueOnce(new Error('offline'));
		await expect(client.get('/offline')).rejects.toMatchObject({ status: 0 });
	});
});
