import { describe, it, expect } from 'vitest';
import { nexusModels, nexusModel, partnerModels } from './nexusModels.js';

describe('modalidades de Nexus', () => {
	it('expone las tres formas de tenerlo, en orden de menor a mayor implicación', () => {
		expect(nexusModels.map((m) => m.key)).toEqual(['suscripcion', 'connect', 'white-label']);
	});

	// Separar gancho comercial de término técnico es la decisión que evita
	// etiquetar solo a Connect como "SaaS" cuando las tres modalidades lo son.
	it('separa el gancho comercial del término técnico', () => {
		for (const m of nexusModels) {
			expect(m.label, `${m.key} sin gancho`).toBeTruthy();
			expect(m.tech, `${m.key} sin término técnico`).toBeTruthy();
			expect(m.label, `${m.key}: el gancho no debe llevar el acrónimo`).not.toMatch(
				/SaaS|TaaS|white-?label/i
			);
		}
	});

	it('describe cada modalidad por lo que pone el cliente', () => {
		expect(nexusModels.map((m) => m.axis)).toEqual([
			'Nosotros ponemos todo',
			'Tú pones el hardware',
			'Tú pones la marca'
		]);
	});

	it('da a cada modalidad viñetas y un CTA con destino', () => {
		for (const m of nexusModels) {
			expect(m.bullets.length, `${m.key} sin viñetas`).toBeGreaterThan(0);
			expect(m.cta.label, `${m.key}: CTA sin etiqueta`).toBeTruthy();
			expect(m.cta.href, `${m.key}: CTA sin destino`).toBeTruthy();
		}
	});

	it('manda a las modalidades de partner a su ruta propia', () => {
		for (const m of partnerModels) {
			expect(m.cta.href, `${m.key}: destino equivocado`).toBe('/products/nexus/partners');
		}
	});
});

describe('nexusModel', () => {
	it('localiza una modalidad por clave', () => {
		expect(nexusModel('connect').label).toBe('Nexus Connect');
	});

	it('devuelve undefined si no existe', () => {
		expect(nexusModel('marte')).toBeUndefined();
	});
});

describe('partnerModels', () => {
	// Lo que se le vende a un integrador es hardware propio o marca propia; la
	// suscripción familiar no pinta nada en la página de partners.
	it('deja fuera la suscripción y conserva las otras dos', () => {
		expect(partnerModels.map((m) => m.key)).toEqual(['connect', 'white-label']);
	});
});
