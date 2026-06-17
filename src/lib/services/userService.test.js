import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from './userService.js';

// Mock del apiClient
vi.mock('./apiClient.js', () => ({
	apiClient: {
		get: vi.fn(),
		patch: vi.fn()
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

describe('UserService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Limpiar sessionStorage
		Object.keys(sessionStorage).forEach((key) => {
			sessionStorage.removeItem(key);
		});
	});

	describe('getCurrentUser', () => {
		it('debería obtener el usuario actual', async () => {
			const mockUser = {
				id: 1,
				email: 'test@example.com',
				name: 'Test User'
			};

			// Simular token en sessionStorage
			sessionStorage.setItem('geminis_access_token', 'valid-token');

			const { apiClient } = await import('./apiClient.js');
			apiClient.get.mockResolvedValueOnce(mockUser);

			const result = await userService.getCurrentUser();

			expect(apiClient.get).toHaveBeenCalledWith('/api/v1/users/me', {}, 'valid-token');

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockUser);
		});

		it('debería manejar errores cuando no hay token', async () => {
			const result = await userService.getCurrentUser();

			expect(result.success).toBe(false);
			expect(result.message).toBe('No hay token de acceso disponible');
		});

		it('debería manejar errores de la API', async () => {
			sessionStorage.setItem('geminis_access_token', 'valid-token');

			const { apiClient, ApiError } = await import('./apiClient.js');
			const error = new ApiError('Usuario no encontrado', 404, {});

			apiClient.get.mockRejectedValueOnce(error);

			const result = await userService.getCurrentUser();

			expect(result.success).toBe(false);
			expect(result.message).toBe('Usuario no encontrado');
		});
	});

	describe('getUsers', () => {
		it('debería obtener todos los usuarios', async () => {
			const mockUsers = [
				{ id: 1, email: 'user1@example.com' },
				{ id: 2, email: 'user2@example.com' }
			];

			sessionStorage.setItem('geminis_access_token', 'valid-token');

			const { apiClient } = await import('./apiClient.js');
			apiClient.get.mockResolvedValueOnce(mockUsers);

			const result = await userService.getUsers();

			expect(apiClient.get).toHaveBeenCalledWith('/api/v1/users', {}, 'valid-token');
			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockUsers);
		});
	});

	describe('changePassword', () => {
		it('debería cambiar la contraseña exitosamente', async () => {
			const mockResponse = { message: 'Contraseña actualizada' };

			sessionStorage.setItem('geminis_access_token', 'valid-token');

			const { apiClient } = await import('./apiClient.js');
			apiClient.patch.mockResolvedValueOnce(mockResponse);

			const result = await userService.changePassword('old-password', 'new-password');

			expect(apiClient.patch).toHaveBeenCalledWith(
				'/api/v1/auth/password',
				{
					old_password: 'old-password',
					new_password: 'new-password'
				},
				'valid-token'
			);

			expect(result.success).toBe(true);
			expect(result.message).toBe('Contraseña actualizada correctamente');
		});
	});

	describe('handleUserError', () => {
		it('maps validation, auth, server and network errors', async () => {
			sessionStorage.setItem('geminis_access_token', 'valid-token');
			const { apiClient, ApiError } = await import('./apiClient.js');

			apiClient.get.mockRejectedValueOnce(
				new ApiError('bad', 422, { detail: [{ msg: 'Campo requerido' }] })
			);
			expect((await userService.getCurrentUser()).message).toBe('Campo requerido');

			apiClient.get.mockRejectedValueOnce(new ApiError('auth', 401, {}));
			expect((await userService.getCurrentUser()).message).toBe('Sesión expirada o sin permisos');

			apiClient.get.mockRejectedValueOnce(new ApiError('server', 500, {}));
			expect((await userService.getCurrentUser()).message).toBe(
				'Error del servidor. Intenta más tarde.'
			);

			apiClient.get.mockRejectedValueOnce(new ApiError('offline', 0, {}));
			expect((await userService.getCurrentUser()).message).toBe(
				'Error de conexión. Verifica tu internet.'
			);
		});
	});

	describe('utility methods', () => {
		it('formatLastLogin debería formatear fechas correctamente', () => {
			const date = '2023-01-01T12:00:00Z';
			const formatted = userService.formatLastLogin(date);

			expect(formatted).toBeDefined();
			expect(typeof formatted).toBe('string');
		});

		it('formatLastLogin debería manejar fechas nulas', () => {
			const result = userService.formatLastLogin(null);
			expect(result).toBe('Nunca');
		});

		it('getUserRole debería retornar rol correcto', () => {
			expect(userService.getUserRole(true)).toBe('Administrador principal');
			expect(userService.getUserRole(false)).toBe('Usuario vinculado');
		});

		it('getRoleBadgeColor debería retornar colores correctos', () => {
			const masterColor = userService.getRoleBadgeColor(true);
			const userColor = userService.getRoleBadgeColor(false);

			expect(masterColor).toContain('cyan');
			expect(userColor).toContain('gray');
		});
	});
});
