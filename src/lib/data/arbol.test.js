import { describe, it, expect } from 'vitest';
import { arbolNodos, arbolRamas, ramaDeNodo, amplitudNodo } from './services.js';

describe('árbol tecnológico', () => {
	it('no repite identificadores', () => {
		const ids = arbolNodos.map((n) => n.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	// `capa` alimenta el parallax: 1 casi no se mueve, 3 flota por delante. Un
	// nodo sin capa se quedaría clavado mientras el resto respira.
	it('da a cada nodo posición, tamaño y capa', () => {
		for (const n of arbolNodos) {
			expect(Number.isFinite(n.x), `${n.id} sin x`).toBe(true);
			expect(Number.isFinite(n.y), `${n.id} sin y`).toBe(true);
			expect(n.tamano, `${n.id} sin tamaño`).toBeGreaterThan(0);
			expect([1, 2, 3], `${n.id}: capa ${n.capa}`).toContain(n.capa);
		}
	});

	it('resuelve la rama de cada nodo a una que existe', () => {
		const ramas = new Set(arbolRamas.map((r) => r.id));
		for (const n of arbolNodos) {
			expect(ramas, `${n.id} apunta a una rama inexistente`).toContain(ramaDeNodo(n.id));
		}
	});

	it('manda al tronco todo lo que vive sobre el eje', () => {
		for (const id of ['copa', 'raiz', 'union-2', 'union-3', 'union-4']) {
			expect(ramaDeNodo(id)).toBe('tronco');
		}
	});

	it('manda hojas y nodos de paso a la rama de su nivel y lado', () => {
		expect(ramaDeNodo('hoja-3i')).toBe('rama-3i');
		expect(ramaDeNodo('paso-2i')).toBe('rama-2i');
		expect(ramaDeNodo('hoja-4d')).toBe('rama-4d');
	});

	// La silueta es lo que hace que quince imágenes sueltas se lean como un
	// árbol: si un nivel alcanza menos lejos que el de arriba, el contorno deja
	// de crecer y vuelve a ser una columna con bultos.
	it('ensancha la silueta nivel por nivel, en los dos lados', () => {
		const nivel = (n) => Number(n.id.match(/(\d)[id]$/)?.[1] ?? 0);
		const bordes = [1, 2, 3, 4].map((k) => {
			const hojas = arbolNodos.filter((n) => n.id.startsWith('hoja-') && nivel(n) === k);
			return {
				izq: Math.min(...hojas.map((n) => n.x - n.tamano / 2)),
				der: Math.max(...hojas.map((n) => n.x + n.tamano / 2))
			};
		});
		for (let k = 1; k < bordes.length; k++) {
			expect(bordes[k].izq, `nivel ${k + 1} no alcanza más a la izquierda`).toBeLessThan(
				bordes[k - 1].izq
			);
			expect(bordes[k].der, `nivel ${k + 1} no alcanza más a la derecha`).toBeGreaterThan(
				bordes[k - 1].der
			);
		}
	});
});

describe('amplitud del parallax', () => {
	it('deja la raíz prácticamente quieta y da a la copa el recorrido mayor', () => {
		const raiz = arbolNodos.find((n) => n.id === 'raiz');
		const copa = arbolNodos.find((n) => n.id === 'copa');
		expect(amplitudNodo(raiz)).toBeLessThan(1);
		expect(amplitudNodo(copa)).toBeGreaterThan(amplitudNodo(raiz) * 5);
	});

	// La regresión que este cambio arregla: con una amplitud por capa y nada más,
	// las quince piezas se desplazaban en bloque y el árbol patinaba sobre la foto
	// en vez de reaccionar.
	it('no da la misma amplitud a dos hojas de la misma capa a distinta altura', () => {
		const alta = arbolNodos.find((n) => n.id === 'hoja-1i');
		const baja = arbolNodos.find((n) => n.id === 'hoja-4i');
		expect(alta.capa).toBe(baja.capa);
		expect(amplitudNodo(alta)).toBeGreaterThan(amplitudNodo(baja) * 1.5);
	});

	it('nunca inmoviliza del todo un nodo', () => {
		for (const n of arbolNodos) {
			expect(amplitudNodo(n), `${n.id} inmóvil`).toBeGreaterThan(0);
		}
	});
});
