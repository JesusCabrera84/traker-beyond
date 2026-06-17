import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
	test('landing page loads', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Geminis Labs/i);
	});

	test('auth page shows login UI', async ({ page }) => {
		await page.goto('/auth');
		await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
	});
});
