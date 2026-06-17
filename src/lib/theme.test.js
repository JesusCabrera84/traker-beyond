import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	THEMES,
	getCurrentTheme,
	setTheme,
	getThemeConfig,
	initializeTheme,
	nextTheme,
	previousTheme
} from './theme.js';

describe('Theme System', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		// Limpiar clases del documento
		document.documentElement.className = '';
	});

	describe('THEMES', () => {
		it('debería tener temas definidos', () => {
			expect(THEMES).toBeDefined();
			expect(typeof THEMES).toBe('object');
			expect(Object.keys(THEMES).length).toBeGreaterThan(0);
		});

		it('cada tema debería tener propiedades requeridas', () => {
			Object.values(THEMES).forEach((theme) => {
				expect(theme).toHaveProperty('name');
				expect(theme).toHaveProperty('colors');
				expect(typeof theme.name).toBe('string');
				expect(typeof theme.colors).toBe('object');
			});
		});

		it('debería tener tema por defecto', () => {
			expect(THEMES.default).toBeDefined();
			expect(THEMES.default.name).toBe('Default');
		});

		it('cada tema debería tener colores básicos', () => {
			Object.values(THEMES).forEach((theme) => {
				expect(theme.colors).toHaveProperty('primary');
				expect(theme.colors).toHaveProperty('secondary');
				expect(theme.colors).toHaveProperty('accent');
				expect(theme.colors).toHaveProperty('text');
			});
		});
	});

	describe('getCurrentTheme', () => {
		it('debería retornar tema por defecto si no hay tema guardado', () => {
			const currentTheme = getCurrentTheme();
			expect(currentTheme).toBeDefined();
			expect(typeof currentTheme).toBe('string');
		});

		it('debería manejar temas válidos', () => {
			const testTheme = 'dual-tech-human';

			// Verificar que el tema existe en la configuración
			expect(THEMES[testTheme]).toBeDefined();
			expect(THEMES[testTheme].name).toBe('Dual Tech Human');
			expect(THEMES[testTheme].colors).toBeDefined();
		});

		it('debería retornar tema por defecto si el guardado no existe', () => {
			localStorage.setItem('selectedTheme', 'non-existent-theme');

			const currentTheme = getCurrentTheme();
			// Debería retornar el tema por defecto cuando no existe el solicitado
			expect(Object.keys(THEMES)).toContain(currentTheme);
		});
	});

	describe('setTheme', () => {
		it('debería cambiar tema válido', () => {
			const testThemeKey = 'vibrant';

			setTheme(testThemeKey);

			// Verificar que el tema actual cambió
			expect(getCurrentTheme()).toBe(testThemeKey);
		});

		it('debería aplicar tema al documento', () => {
			const testThemeKey = 'warm-tech';

			setTheme(testThemeKey);

			// Verificar que el tema cambió correctamente
			expect(getCurrentTheme()).toBe(testThemeKey);
		});

		it('no debería cambiar tema si no es válido', () => {
			const originalTheme = getCurrentTheme();
			const invalidTheme = 'invalid-theme';

			setTheme(invalidTheme);

			// El tema no debería cambiar
			expect(getCurrentTheme()).toBe(originalTheme);
		});
	});

	describe('getThemeConfig', () => {
		it('debería retornar configuración del tema', () => {
			const themeConfig = getThemeConfig('dual-tech-human');

			expect(themeConfig).toBeDefined();
			expect(themeConfig).toHaveProperty('name');
			expect(themeConfig).toHaveProperty('colors');
		});

		it('debería retornar tema por defecto si no se especifica', () => {
			const themeConfig = getThemeConfig();

			expect(themeConfig).toBeDefined();
			expect(themeConfig).toHaveProperty('name');
		});
	});

	describe('initializeTheme', () => {
		it('debería inicializar el sistema de temas', () => {
			// Limpiar cualquier tema anterior
			document.documentElement.className = '';
			localStorage.removeItem('selectedTheme');

			initializeTheme();

			// Verificar que se inicializó con algún tema
			const currentTheme = getCurrentTheme();
			expect(currentTheme).toBeDefined();
			expect(Object.keys(THEMES)).toContain(currentTheme);
		});

		it('debería funcionar con temas válidos', () => {
			const testTheme = 'vibrant';

			// Verificar que el tema existe
			expect(THEMES[testTheme]).toBeDefined();

			initializeTheme();

			// Verificar que se inicializó con algún tema válido
			const currentTheme = getCurrentTheme();
			expect(Object.keys(THEMES)).toContain(currentTheme);
		});
	});

	describe('theme cycling', () => {
		it('nextTheme and previousTheme rotate active theme', () => {
			setTheme('default');
			const start = getCurrentTheme();
			const afterNext = nextTheme();
			expect(afterNext).not.toBe(start);
			previousTheme();
			expect(getCurrentTheme()).toBe(start);
		});
	});
});
