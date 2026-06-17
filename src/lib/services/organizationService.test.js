import { describe, it, expect, vi, beforeEach } from 'vitest';
import { organizationService } from './organizationService.js';

vi.mock('./apiClient.js', () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn()
	}
}));

describe('OrganizationService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		sessionStorage.clear();
		sessionStorage.setItem('geminis_id_token', 'id-token');
	});

	it('getOrganizations uses apiClient with token', async () => {
		const { apiClient } = await import('./apiClient.js');
		apiClient.get.mockResolvedValueOnce([{ id: 1 }]);

		const result = await organizationService.getOrganizations();

		expect(apiClient.get).toHaveBeenCalledWith('/api/v1/organizations', {}, 'id-token');
		expect(result).toEqual([{ id: 1 }]);
	});

	it('getTotalOrganizations returns count', async () => {
		const { apiClient } = await import('./apiClient.js');
		apiClient.get.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);

		await expect(organizationService.getTotalOrganizations()).resolves.toBe(2);
	});

	it('removeOrganizationUser calls delete', async () => {
		const { apiClient } = await import('./apiClient.js');
		apiClient.delete.mockResolvedValueOnce({ ok: true });

		await organizationService.removeOrganizationUser('org-1', 'user-9');

		expect(apiClient.delete).toHaveBeenCalledWith(
			'/api/v1/organizations/org-1/users/user-9',
			{},
			'id-token'
		);
	});

	it('getAccessToken returns null without session token', () => {
		sessionStorage.clear();
		expect(organizationService.getAccessToken()).toBeNull();
	});

	it('getOrganizationById fetches single org', async () => {
		const { apiClient } = await import('./apiClient.js');
		apiClient.get.mockResolvedValueOnce({ id: 'org-1' });

		const result = await organizationService.getOrganizationById('org-1');

		expect(apiClient.get).toHaveBeenCalledWith('/api/v1/organizations/org-1', {}, 'id-token');
		expect(result).toEqual({ id: 'org-1' });
	});

	it('updateOrganization patches org', async () => {
		const { apiClient } = await import('./apiClient.js');
		apiClient.patch.mockResolvedValueOnce({ id: 'org-1', name: 'New' });

		await organizationService.updateOrganization('org-1', { name: 'New' });

		expect(apiClient.patch).toHaveBeenCalledWith(
			'/api/v1/organizations/org-1',
			{ name: 'New' },
			'id-token'
		);
	});

	it('getOrganizationUsers lists members', async () => {
		const { apiClient } = await import('./apiClient.js');
		apiClient.get.mockResolvedValueOnce([{ id: 'u1' }]);

		const users = await organizationService.getOrganizationUsers('org-1');
		expect(users).toEqual([{ id: 'u1' }]);
	});

	it('addOrganizationUser posts member', async () => {
		const { apiClient } = await import('./apiClient.js');
		apiClient.post.mockResolvedValueOnce({ id: 'u2' });

		await organizationService.addOrganizationUser('org-1', { email: 'a@test.com' });

		expect(apiClient.post).toHaveBeenCalledWith(
			'/api/v1/organizations/org-1/users',
			{ email: 'a@test.com' },
			'id-token'
		);
	});

	it('updateOrganizationUserRole patches role', async () => {
		const { apiClient } = await import('./apiClient.js');
		apiClient.patch.mockResolvedValueOnce({ role: 'admin' });

		await organizationService.updateOrganizationUserRole('org-1', 'u1', 'admin');

		expect(apiClient.patch).toHaveBeenCalledWith(
			'/api/v1/organizations/org-1/users/u1',
			{ role: 'admin' },
			'id-token'
		);
	});
});
