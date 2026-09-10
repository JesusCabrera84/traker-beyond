import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	userStore,
	currentUser,
	associatedUsers,
	userLoading,
	userError,
	isMasterUser
} from './userStore.js';

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

	it('getAssociatedUsers guarda el mensaje del servicio si falla', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getUsers.mockResolvedValueOnce({ success: false, message: 'Sin permiso' });

		const result = await userStore.getAssociatedUsers();

		expect(result.success).toBe(false);
		expect(get(userStore).error).toBe('Sin permiso');
		expect(get(userStore).loading).toBe(false);
	});

	it('getAssociatedUsers cae a su mensaje por defecto si el servicio lanza', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getUsers.mockRejectedValueOnce(new Error('red caída'));

		const result = await userStore.getAssociatedUsers();

		expect(result).toEqual({
			success: false,
			message: 'Error al obtener usuarios asociados'
		});
		expect(get(userStore).error).toBe('Error al obtener usuarios asociados');
	});

	// Una lista vacía no es un error: el estado debe quedar limpio, no con el
	// listado anterior ni con un mensaje.
	it('getAssociatedUsers acepta una respuesta sin datos', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getUsers.mockResolvedValueOnce({ success: true });

		await userStore.getAssociatedUsers();

		expect(get(userStore).associatedUsers).toEqual([]);
		expect(get(userStore).error).toBeNull();
	});

	it('changePassword guarda el mensaje del servicio si falla', async () => {
		const { userService } = await import('../services/userService.js');
		userService.changePassword.mockResolvedValueOnce({
			success: false,
			message: 'La contraseña actual no coincide'
		});

		const result = await userStore.changePassword('vieja', 'nueva');

		expect(result.success).toBe(false);
		expect(get(userStore).error).toBe('La contraseña actual no coincide');
	});

	it('changePassword cae a su mensaje por defecto si el servicio lanza', async () => {
		const { userService } = await import('../services/userService.js');
		userService.changePassword.mockRejectedValueOnce(new Error('502'));

		const result = await userStore.changePassword('vieja', 'nueva');

		expect(result).toEqual({ success: false, message: 'Error al cambiar la contraseña' });
		expect(get(userStore).error).toBe('Error al cambiar la contraseña');
		expect(get(userStore).loading).toBe(false);
	});

	it('clear deja el store en su estado inicial', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getCurrentUser.mockResolvedValueOnce({ success: true, data: { id: 9 } });
		await userStore.getCurrentUser();

		userStore.clear();

		expect(get(userStore)).toMatchObject({
			currentUser: null,
			associatedUsers: [],
			loading: false,
			error: null
		});
	});

	it('los stores derivados reflejan el estado', async () => {
		const { userService } = await import('../services/userService.js');
		userService.getCurrentUser.mockResolvedValueOnce({
			success: true,
			data: { id: 3, is_master: true }
		});
		await userStore.getCurrentUser();

		expect(get(currentUser)).toEqual({ id: 3, is_master: true });
		expect(get(isMasterUser)).toBe(true);
		expect(get(associatedUsers)).toEqual([]);
		expect(get(userLoading)).toBe(false);
		expect(get(userError)).toBeNull();
	});

	it('isMasterUser es false cuando no hay usuario', () => {
		userStore.clear();
		expect(get(isMasterUser)).toBe(false);
	});
});
