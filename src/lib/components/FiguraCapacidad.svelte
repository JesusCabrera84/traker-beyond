<script>
	import { figuras } from '$lib/data/figuras.js';

	export let slug;

	$: f = figuras[slug] ?? {};
</script>

<!--
	La figura de una capacidad dentro de su hexágono.

	Dos planos y nada más: `fondo` es el sistema como está —apagado, sin
	protagonismo— y `figura` es lo que la capacidad aporta. Al encenderse la celda
	sube solo lo segundo, así que el dibujo dice algo en vez de brillar más.

	Manda la masa, no la línea: a 130 px un trazo de 1 px no se ve, y la primera
	versión de estas figuras se leía como garabatos tenues. Todo va relleno y con
	trazo grueso.
-->
<svg viewBox="0 0 100 100" role="presentation" focusable="false">
	{#each f.fondo ?? [] as d (d)}
		<path class="fg-fondo" {d} />
	{/each}
	{#each f.polvo ?? [] as [cx, cy] (`${cx}-${cy}`)}
		<circle class="fg-polvo" {cx} {cy} r="3" />
	{/each}
	{#each f.figura ?? [] as d (d)}
		<path class="fg-figura" {d} />
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
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* El sistema como está: presente, pero claramente por detrás. */
	.fg-fondo {
		fill: rgba(148, 190, 214, 0.14);
		stroke: rgba(148, 190, 214, 0.4);
		stroke-width: 2;
	}

	.fg-polvo {
		fill: rgba(148, 190, 214, 0.42);
	}

	/*
	 * Lo que la capacidad aporta, al color de su celda. `--celda` es una rampa por
	 * POSICIÓN y no un color por significado: con un solo cian no caben seis
	 * escalones legibles, y seis tonos con significado acabarían formando parejas
	 * que parecen agrupaciones deliberadas que nadie quiso decir.
	 */
	.fg-figura {
		fill: color-mix(in srgb, var(--celda) 26%, transparent);
		stroke: var(--celda);
		stroke-width: 3;
	}
</style>
