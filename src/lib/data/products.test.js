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

describe('contenido del panel', () => {
	// El oneLiner existe para responder "¿qué es esto?" antes de que el visitante
	// decida seguir leyendo. Si crece, vuelve a ser el párrafo que nadie leía.
	it('resuelve el qué-es en doce palabras o menos', () => {
		for (const p of products) {
			const palabras = p.oneLiner.trim().split(/\s+/).length;
			expect(palabras, `${p.id}: oneLiner de ${palabras} palabras`).toBeLessThanOrEqual(12);
		}
	});

	it('da a cada producto problema, prueba y CTA principal', () => {
		for (const p of products) {
			expect(p.problem, `${p.id} sin problema`).toBeTruthy();
			expect(p.proof, `${p.id} sin prueba`).toBeTruthy();
			expect(p.primaryCta, `${p.id} sin CTA principal`).toBeTruthy();
		}
	});

	// Tres pasos: los que caben en la pregunta "¿y yo qué tengo que hacer?".
	it('explica el cómo funciona en exactamente tres pasos', () => {
		for (const p of products) {
			expect(p.howItWorks, `${p.id}: pasos`).toHaveLength(3);
			for (const paso of p.howItWorks) expect(paso).toBeTruthy();
		}
	});

	it('acepta CTA secundario solo con etiqueta y destino', () => {
		for (const p of products) {
			if (!p.secondaryCta) continue;
			expect(p.secondaryCta.label, `${p.id}: CTA secundario sin etiqueta`).toBeTruthy();
			expect(p.secondaryCta.href, `${p.id}: CTA secundario sin destino`).toBeTruthy();
		}
	});
});

describe('modelos de contratación', () => {
	// La banda de modelos es un slot fijo en las tres tarjetas: si un producto se
	// queda sin ella, la simetría se rompe y el visitante deja de poder comparar
	// cómo se compra cada cosa.
	it('da a cada producto al menos un modelo, completo', () => {
		for (const p of products) {
			expect(p.models.length, `${p.id} sin modelos`).toBeGreaterThan(0);
			for (const m of p.models) {
				expect(m.key, `${p.id}: modelo sin clave`).toBeTruthy();
				expect(m.label, `${p.id}/${m.key} sin gancho comercial`).toBeTruthy();
				expect(m.axis, `${p.id}/${m.key} sin eje`).toBeTruthy();
				expect(m.line, `${p.id}/${m.key} sin descripción`).toBeTruthy();
			}
		}
	});

	it('no repite claves de modelo dentro de un producto', () => {
		for (const p of products) {
			const claves = p.models.map((m) => m.key);
			expect(new Set(claves).size, `${p.id}: claves repetidas`).toBe(claves.length);
		}
	});

	// El requisito comercial que originó este rediseño: que desde la landing se
	// vea que Nexus se vende también como SaaS y como white-label.
	it('expone en Nexus las tres formas de tenerlo', () => {
		const nexus = products.find((p) => p.id === 'nexus');
		expect(nexus.models.map((m) => m.key)).toEqual(['suscripcion', 'connect', 'white-label']);
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
