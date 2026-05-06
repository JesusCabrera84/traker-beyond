import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService.js';

// Mock del apiClient
vi.mock('./apiClient.js', () => ({
	apiClient: {
		post: vi.fn(),
		get: vi.fn()
	},
	ApiError: class ApiError extends Error {
		constructor(message, status, data) {
			super(message);
			this.status = status;
			this.data = data;
		}
		isAuthError() {
			return this.status === 401;
		}
		isValidationError() {
			return this.status === 422;
		}
		isServerError() {
			return this.status >= 500;
		}
		isNetworkError() {
			return this.status === 0;
		}
	}
}));

describe('AuthService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Limpiar sessionStorage
		Object.keys(sessionStorage).forEach((key) => {
			sessionStorage.removeItem(key);
		});
	});

	describe('login', () => {
		it('debería realizar login exitoso', async () => {
			const mockResponse = {
				access_token: 'mock-access-token',
				id_token: 'mock-id-token',
				user: { id: 1, email: 'test@example.com' }
			};

			const { apiClient } = await import('./apiClient.js');
			apiClient.post.mockResolvedValueOnce(mockResponse);

			const result = await authService.login({
				email: 'test@example.com',
				password: 'password'
			});

			expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', {
				email: 'test@example.com',
				password: 'password'
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe('Sesión iniciada exitosamente');
		});

		it('debería manejar errores de login', async () => {
			const { apiClient, ApiError } = await import('./apiClient.js');
			const error = new ApiError('Credenciales inválidas', 401, {});

			apiClient.post.mockRejectedValueOnce(error);

			const result = await authService.login({
				email: 'test@example.com',
				password: 'wrong-password'
			});

			expect(result.success).toBe(false);
			expect(result.message).toBe('Credenciales inválidas');
		});
	});

	describe('logout', () => {
		it('debería limpiar el sessionStorage al hacer logout', async () => {
			// Simular tokens almacenados
			sessionStorage.setItem('geminis_access_token', 'mock-token');
			sessionStorage.setItem('geminis_id_token', 'mock-id-token');
			sessionStorage.setItem('geminis_user_data', JSON.stringify({ id: 1 }));

			const result = await authService.logout();

			expect(result.success).toBe(true);
			expect(sessionStorage.getItem('geminis_access_token')).toBeNull();
			expect(sessionStorage.getItem('geminis_id_token')).toBeNull();
			expect(sessionStorage.getItem('geminis_user_data')).toBeNull();
		});
	});

	describe('isAuthenticated', () => {
		it('debería retornar true si hay tokens válidos', () => {
			// JWT simulado con expiración futura (exp)
			const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
			const payload = btoa(
				JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 }) // expira en 60 segundos
			);
			const signature = 'signature';
			const fakeJwt = `${header}.${payload}.${signature}`;

			sessionStorage.setItem('geminis_access_token', fakeJwt);
			sessionStorage.setItem('geminis_id_token', fakeJwt);

			const result = authService.isAuthenticated();

			expect(result).toBe(true);
		});

		it('debería retornar false si no hay tokens', () => {
			const result = authService.isAuthenticated();

			expect(result).toBe(false);
		});

		it('debería retornar false si los tokens están vacíos', () => {
			sessionStorage.setItem('geminis_access_token', '');
			sessionStorage.setItem('geminis_id_token', '');

			const result = authService.isAuthenticated();

			expect(result).toBe(false);
		});
	});

	describe('getUserData', () => {
		it('debería retornar datos del usuario almacenados', () => {
			const userData = { id: 1, email: 'test@example.com' };
			sessionStorage.setItem('geminis_user_data', JSON.stringify(userData));

			const result = authService.getUserData();

			expect(result).toEqual(userData);
		});

		it('debería retornar null si no hay datos', () => {
			const result = authService.getUserData();

			expect(result).toBeNull();
		});
	});
});
