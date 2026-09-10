import { describe, it, expect } from 'vitest';
import { services, processSteps, service } from './services.js';

describe('capacidades', () => {
	// Seis, no trece. El documento fuente lista trece áreas; mostrarlas todas
	// convierte la oferta en un catálogo que nadie lee.
	it('agrupa la oferta en seis capacidades numeradas en orden', () => {
		expect(services).toHaveLength(6);
		expect(services.map((s) => s.num)).toEqual(['01', '02', '03', '04', '05', '06']);
	});

	it('da a cada capacidad slug, título, promesa y entrada', () => {
		for (const s of services) {
			expect(s.slug, 'slug').toMatch(/^[a-z0-9-]+$/);
			expect(s.title, `${s.slug} sin título`).toBeTruthy();
			expect(s.promise, `${s.slug} sin promesa`).toBeTruthy();
			expect(s.entrada, `${s.slug} sin entrada`).toBeTruthy();
			expect(s.chips.length, `${s.slug} sin sub-servicios`).toBeGreaterThan(2);
		}
	});

	it('no repite slugs', () => {
		const slugs = services.map((s) => s.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	// La promesa se le lee a un director de operaciones, no a un arquitecto: si
	// se cuela jerga, el visitante deja de entender qué le estamos vendiendo.
	it('mantiene la jerga fuera de la promesa', () => {
		const jerga = /Kafka|microservi|event-driven|multi-tenant|RAG|LoRaWAN|MQTT|Kubernetes/i;
		for (const s of services) {
			expect(s.promise, `${s.slug}: jerga en la promesa`).not.toMatch(jerga);
		}
	});

	// Toda capacidad arranca por algo concreto y barato de decir que sí.
	it('hace que cada capacidad empiece por algo', () => {
		for (const s of services) {
			expect(s.entrada, `${s.slug}`).toMatch(/^Empieza/);
		}
	});
});

describe('flujo de trabajo', () => {
	it('va de entender a operar, en cinco pasos', () => {
		expect(processSteps.map((p) => p.key)).toEqual([
			'entendemos',
			'disenamos',
			'construimos',
			'integramos',
			'operamos'
		]);
	});

	it('describe cada paso', () => {
		for (const p of processSteps) {
			expect(p.label, `${p.key} sin etiqueta`).toBeTruthy();
			expect(p.desc, `${p.key} sin descripción`).toBeTruthy();
		}
	});
});

describe('service', () => {
	it('localiza una capacidad por slug', () => {
		expect(service('iot-hardware').title).toBe('IoT & Hardware');
	});

	it('devuelve undefined si no existe', () => {
		expect(service('marte')).toBeUndefined();
	});
});

describe('detalle de capacidad', () => {
	it('da a cada capacidad introducción y grupos de servicios', () => {
		for (const s of services) {
			expect(s.detail.intro, `${s.slug} sin introducción`).toBeTruthy();
			expect(s.detail.groups.length, `${s.slug} sin grupos`).toBeGreaterThan(1);
			for (const g of s.detail.groups) {
				expect(g.title, `${s.slug}: grupo sin título`).toBeTruthy();
				expect(g.items.length, `${s.slug}/${g.title} vacío`).toBeGreaterThan(2);
			}
		}
	});

	// Las trece áreas del documento fuente caben aquí: agrupar no es recortar.
	it('conserva el detalle que el agrupamiento esconde', () => {
		const total = services.reduce(
			(n, s) => n + s.detail.groups.reduce((m, g) => m + g.items.length, 0),
			0
		);
		expect(total).toBeGreaterThan(100);
	});

	it('no repite un servicio dentro del mismo grupo', () => {
		for (const s of services) {
			for (const g of s.detail.groups) {
				expect(new Set(g.items).size, `${s.slug}/${g.title}: repetidos`).toBe(g.items.length);
			}
		}
	});
});
