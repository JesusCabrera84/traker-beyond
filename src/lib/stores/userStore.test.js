import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { userStore } from './userStore.js';

vi.mock('../services/userService.js', () => ({
	userService: {
		getCurrentUser: vi.fn(),
		getUsers: vi.fn(),
		changePassword: vi.fn()
	}
}));

vi.mock('$app/environment', () => ({
	browser: true
}));

describe('userStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		userStore.clear();
	});

	it('getCurrentUser updates state on success', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getCurrentUser.mockResolvedValueOnce({
			success: true,
			data: { id: 1, email: 'a@test.com' }
		});

		const result = await userStore.getCurrentUser();

		expect(result.success).toBe(true);
		expect(get(userStore).currentUser).toEqual({ id: 1, email: 'a@test.com' });
	});

	it('getCurrentUser stores error on failure', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getCurrentUser.mockResolvedValueOnce({
			success: false,
			message: 'No autorizado'
		});

		await userStore.getCurrentUser();

		expect(get(userStore).error).toBe('No autorizado');
	});

	it('getAssociatedUsers stores list', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getUsers.mockResolvedValueOnce({
			success: true,
			data: [{ id: 2 }]
		});

		await userStore.getAssociatedUsers();

		expect(get(userStore).associatedUsers).toEqual([{ id: 2 }]);
	});

	it('changePassword returns service result', async () => {
		const { userService } = await import('../services/userService.js');
		userService.changePassword.mockResolvedValueOnce({
			success: true,
			message: 'OK'
		});

		const result = await userStore.changePassword('old', 'new');

		expect(result.success).toBe(true);
		expect(get(userStore).error).toBeNull();
	});

	it('loadProfileData loads master associated users', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getCurrentUser.mockResolvedValueOnce({
			success: true,
			data: { id: 1, is_master: true }
		});
		userService.getUsers.mockResolvedValueOnce({
			success: true,
			data: [{ id: 2 }]
		});

		const result = await userStore.loadProfileData();

		expect(result.success).toBe(true);
		expect(get(userStore).associatedUsers).toEqual([{ id: 2 }]);
	});

	it('loadProfileData stops on user fetch failure', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getCurrentUser.mockResolvedValueOnce({
			success: false,
			message: 'Sin acceso'
		});

		await userStore.loadProfileData();

		expect(get(userStore).error).toBe('Sin acceso');
	});

	it('clearError and updateCurrentUser work', () => {
		userStore.updateCurrentUser({ name: 'Ana' });
		expect(get(userStore).currentUser).toEqual({ name: 'Ana' });
		userStore.clearError();
		expect(get(userStore).error).toBeNull();
	});

	it('getCurrentUser handles thrown errors', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getCurrentUser.mockRejectedValueOnce(new Error('fail'));

		const result = await userStore.getCurrentUser();

		expect(result.success).toBe(false);
		expect(get(userStore).error).toBe('Error al obtener información del usuario');
	});

	it('loadProfileData handles thrown errors', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getCurrentUser.mockRejectedValueOnce(new Error('fail'));

		const result = await userStore.loadProfileData();

		expect(result.success).toBe(false);
		expect(get(userStore).error).toBe('Error al cargar datos del perfil');
	});
});
