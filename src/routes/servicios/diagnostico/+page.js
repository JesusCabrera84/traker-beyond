import { redirect } from '@sveltejs/kit';

/**
 * El diagnóstico vivía aquí como página propia. Su contenido se fusionó en el
 * hub de servicios porque el embudo eran tres navegaciones —servicios,
 * diagnóstico, contacto— antes de que nadie pudiera escribir una letra.
 *
 * La ruta se conserva como redirección permanente y no se borra: la URL está en
 * enlaces que no controlamos y en lo que Google ya indexó. Un 301 traslada ese
 * historial al ancla nueva; un 404 lo tira.
 */
export const prerender = false;

export function load() {
	redirect(301, '/servicios#diagnostico');
}
