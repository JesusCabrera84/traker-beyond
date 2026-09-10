import { error } from '@sveltejs/kit';
import { service, services } from '$lib/data/services.js';

/**
 * Una sola plantilla sirve las seis capacidades. Un slug que no existe es un
 * 404 de verdad, no una página vacía: si dejamos que renderice, Google indexa
 * rutas inventadas y el visitante ve una cáscara sin contenido.
 */
export function load({ params }) {
	const capacidad = service(params.slug);
	if (!capacidad) error(404, 'Esa capacidad no existe');

	const i = services.indexOf(capacidad);
	return {
		capacidad,
		// Vecinas con envolvente: desde la última se vuelve a la primera, así el
		// visitante puede recorrer las seis sin volver al hub.
		anterior: services[(i - 1 + services.length) % services.length],
		siguiente: services[(i + 1) % services.length]
	};
}

/** Las seis rutas son conocidas de antemano; se prerenderizan. */
export function entries() {
	return services.map((s) => ({ slug: s.slug }));
}
