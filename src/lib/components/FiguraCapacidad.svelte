<script>
	import { figuras } from '$lib/data/figuras.js';

	export let slug;

	$: f = figuras[slug] ?? {};
</script>

<!--
	La figura de una capacidad dentro de su hexágono. Tres planos con tratamiento
	distinto: `base` son las placas apagadas —el sistema como está—, `vivo` es lo
	que la capacidad cambia, y `detalle` los trazos que lo explican. Esa
	separación es la que permite que al activarse la celda se encienda solo lo que
	la capacidad APORTA, en vez de subir el brillo de todo por igual.
-->
<svg viewBox="0 0 100 100" role="presentation" focusable="false">
	{#each f.base ?? [] as d (d)}
		<path class="fg-base" {d} />
	{/each}
	{#each f.detalle ?? [] as d (d)}
		<path class="fg-detalle" {d} />
	{/each}
	{#each f.vivo ?? [] as d (d)}
		<path class="fg-vivo" {d} />
	{/each}
	{#each f.nube ?? [] as [cx, cy] (`${cx}-${cy}`)}
		<circle class="fg-polvo" {cx} {cy} r="1.4" />
	{/each}
	{#each f.nodos ?? [] as [cx, cy] (`${cx}-${cy}`)}
		<circle class="fg-nodo" {cx} {cy} r="2.2" />
	{/each}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	path {
		fill: none;
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* El sistema como está: presente pero apagado. */
	.fg-base {
		stroke: rgba(127, 227, 245, 0.3);
		stroke-width: 1;
	}

	.fg-detalle {
		stroke: rgba(127, 227, 245, 0.45);
		stroke-width: 1;
	}

	/* Lo que la capacidad aporta. Es lo único que sube al encenderse la celda, y
	   por eso la figura dice algo en vez de solo brillar más. */
	.fg-vivo {
		stroke: var(--sv-accent);
		stroke-width: 1.5;
		fill: rgba(127, 227, 245, 0.07);
	}

	.fg-polvo {
		fill: rgba(127, 227, 245, 0.34);
	}

	.fg-nodo {
		fill: var(--sv-accent);
	}
</style>
