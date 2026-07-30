import { describe, it, expect } from 'vitest';
import { products, productIndex, neighborProduct } from './products.js';

describe('catálogo de productos', () => {
	it('expone los tres productos', () => {
		expect(products.map((p) => p.id)).toEqual(['nexus', 'orion', 'signum']);
	});

	// Orion es acromático y separa el verde de Nexus del rojo de Signum, que son
	// complementarios. Si alguien reordena el array, esto debe fallar.
	it('mantiene a Orion entre Nexus y Signum', () => {
		expect(products[1].id).toBe('orion');
	});

	// El rail tiene que ser autosuficiente: si un producto se queda sin nombre o
	// sin descriptor funcional, el visitante no sabe qué es y volvemos al problema
	// que esta sección resuelve.
	it('da a cada producto nombre, descriptor y audiencia', () => {
		for (const p of products) {
			expect(p.name, `${p.id} sin nombre`).toBeTruthy();
			expect(p.rail, `${p.id} sin descriptor de rail`).toBeTruthy();
			expect(p.audience, `${p.id} sin audiencia`).toBeTruthy();
		}
	});

	it('da a cada producto destino, marca y logotipo', () => {
		for (const p of products) {
			expect(p.href, `${p.id} sin href`).toBeTruthy();
			expect(p.mark, `${p.id} sin marca de rail`).toMatch(/^\/img\//);
			expect(p.logo, `${p.id} sin logo`).toMatch(/^\/img\//);
			expect(p.logoAlt, `${p.id} sin texto alternativo`).toBeTruthy();
		}
	});

	it('marca como externos solo los destinos fuera del dominio', () => {
		for (const p of products) {
			expect(p.external, `${p.id}: external no concuerda con href`).toBe(p.href.startsWith('http'));
		}
	});
});

describe('productIndex', () => {
	it('localiza cada producto', () => {
		expect(productIndex('nexus')).toBe(0);
		expect(productIndex('signum')).toBe(2);
	});

	it('devuelve -1 si no existe', () => {
		expect(productIndex('marte')).toBe(-1);
	});
});

describe('neighborProduct', () => {
	it('avanza y retrocede', () => {
		expect(neighborProduct('nexus', 1)).toBe('orion');
		expect(neighborProduct('orion', 1)).toBe('signum');
		expect(neighborProduct('orion', -1)).toBe('nexus');
	});

	// La regresión concreta: el ternario binario anterior nunca llegaba al tercer
	// producto ni volvía al primero.
	it('envuelve en ambos extremos', () => {
		expect(neighborProduct('signum', 1)).toBe('nexus');
		expect(neighborProduct('nexus', -1)).toBe('signum');
	});

	it('cae al primero si el id es desconocido', () => {
		expect(neighborProduct('marte', 1)).toBe('nexus');
	});
});
