<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	export let data;

	$: ({ capacidad, anterior, siguiente } = data);
</script>

<svelte:head>
	<title>{capacidad.title} | Servicios | Geminis Labs</title>
	<meta name="description" content={capacidad.promise} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet" />
</svelte:head>

<Navbar />

<main class="cp-page">
	<section class="cp-hero">
		<div class="cp-container">
			<nav class="cp-breadcrumb" aria-label="Ruta de navegación">
				<a href="/servicios">Servicios</a>
				<span aria-hidden="true">/</span>
				<span>{capacidad.title}</span>
			</nav>
			<p class="cp-overline">Capacidad {capacidad.num}</p>
			<h1 class="cp-hero-title">{capacidad.title}</h1>
			<p class="cp-hero-promise">{capacidad.promise}</p>
			<p class="cp-hero-intro">{capacidad.detail.intro}</p>
			<div class="cp-actions">
				<a href="/servicios/diagnostico" class="cp-btn cp-btn--primary">{capacidad.entrada}</a>
				<a href="/#contacto" class="cp-btn cp-btn--ghost">Cuéntanos tu caso</a>
			</div>
		</div>
	</section>

	<section class="cp-body">
		<div class="cp-container">
			<div class="cp-groups">
				{#each capacidad.detail.groups as g (g.title)}
					<section class="cp-group">
						<h2 class="cp-group-title">{g.title}</h2>
						<ul class="cp-group-list">
							{#each g.items as item (item)}
								<li>{item}</li>
							{/each}
						</ul>
					</section>
				{/each}
			</div>

			{#if capacidad.detail.nota}
				<p class="cp-note">{capacidad.detail.nota}</p>
			{/if}
		</div>
	</section>

	<!-- Recorrido entre capacidades: desde aquí se llega a las otras cinco sin
	     volver al hub. -->
	<nav class="cp-siblings" aria-label="Otras capacidades">
		<div class="cp-container cp-siblings-inner">
			<a class="cp-sibling cp-sibling--prev" href="/servicios/{anterior.slug}">
				<span class="cp-sibling-dir">← Anterior</span>
				<span class="cp-sibling-title">{anterior.title}</span>
			</a>
			<a class="cp-sibling cp-sibling--hub" href="/servicios">Ver las seis capacidades</a>
			<a class="cp-sibling cp-sibling--next" href="/servicios/{siguiente.slug}">
				<span class="cp-sibling-dir">Siguiente →</span>
				<span class="cp-sibling-title">{siguiente.title}</span>
			</a>
		</div>
	</nav>
</main>

<Footer />

<style>
	.cp-page {
		background: var(--sv-bg);
		color: var(--sv-text);
		font-family: var(--gl-font-body);
	}

	/* Neutraliza el `section { min-height: 100vh }` sin scope de login-page.css. */
	.cp-page section {
		min-height: 0;
		display: block;
	}

	.cp-container {
		width: min(1080px, 92vw);
		margin: 0 auto;
	}

	.cp-overline {
		font-family: var(--gl-font-label);
		font-size: 0.72rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--sv-accent);
		margin: 0 0 0.9rem;
	}

	/* ── Hero ──────────────────────────────────────────── */

	.cp-hero {
		padding: clamp(6rem, 12vw, 9rem) 0 clamp(2.5rem, 5vw, 3.5rem);
		background:
			radial-gradient(ellipse at 18% 0%, rgba(8, 131, 160, 0.26), transparent 58%), var(--sv-bg);
	}

	.cp-breadcrumb {
		display: flex;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--sv-text-faint);
		margin-bottom: 1.5rem;
	}

	.cp-breadcrumb a {
		color: var(--sv-text-muted);
		text-decoration: none;
	}

	.cp-breadcrumb a:hover {
		color: var(--sv-accent);
	}

	.cp-hero-title {
		font-weight: 700;
		font-size: clamp(2rem, 5vw, 3.3rem);
		line-height: 1.1;
		letter-spacing: -0.02em;
		text-wrap: balance;
		margin: 0 0 1rem;
	}

	.cp-hero-promise {
		font-size: clamp(1.05rem, 1.4vw, 1.28rem);
		font-weight: 500;
		line-height: 1.5;
		color: var(--sv-text);
		max-width: 54ch;
		margin: 0 0 1rem;
	}

	.cp-hero-intro {
		font-size: clamp(0.96rem, 1.15vw, 1.05rem);
		line-height: 1.7;
		color: var(--sv-text-muted);
		max-width: 62ch;
		margin: 0 0 2rem;
	}

	.cp-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	/* ── Botones ───────────────────────────────────────── */

	.cp-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0.75rem 1.6rem;
		border-radius: var(--gl-r-sm);
		font-weight: 600;
		font-size: 0.95rem;
		text-decoration: none;
		transition:
			transform var(--gl-dur) var(--gl-ease),
			background var(--gl-dur) var(--gl-ease),
			border-color var(--gl-dur) var(--gl-ease);
	}

	.cp-btn--primary {
		background: var(--sv-accent);
		color: var(--sv-accent-ink);
		border: 1px solid var(--sv-accent);
	}

	.cp-btn--primary:hover {
		transform: translateY(-2px);
		background: #a4ecf9;
		border-color: #a4ecf9;
	}

	.cp-btn--ghost {
		background: transparent;
		color: var(--sv-text);
		border: 1px solid var(--sv-rule);
	}

	.cp-btn--ghost:hover {
		border-color: var(--sv-accent);
	}

	.cp-btn:focus-visible {
		outline: 2px solid var(--sv-accent);
		outline-offset: 3px;
	}

	/* ── Grupos de servicios ───────────────────────────── */

	.cp-body {
		padding: clamp(3rem, 6vw, 4.5rem) 0;
		background: var(--sv-bg-2);
		border-top: 1px solid var(--sv-rule);
	}

	/* Multicolumna, no grid: los grupos van de dos a cinco según la capacidad, y
	   con rejilla siempre queda alguno solo en la última fila estirándose sobre
	   espacio muerto. Aquí fluyen y se empaquetan solos. */
	.cp-groups {
		columns: 19rem 3;
		column-gap: clamp(1.75rem, 3.5vw, 2.75rem);
	}

	.cp-group {
		break-inside: avoid;
		display: inline-block;
		width: 100%;
		margin-bottom: clamp(1.75rem, 3.5vw, 2.5rem);
	}

	.cp-group-title {
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.35;
		margin: 0 0 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--sv-rule);
		text-wrap: balance;
	}

	.cp-group-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.55rem;
	}

	.cp-group-list li {
		position: relative;
		padding-left: 1.1rem;
		font-size: 0.92rem;
		line-height: 1.5;
		color: var(--sv-text-muted);
	}

	.cp-group-list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.6em;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--sv-accent);
		opacity: 0.7;
	}

	.cp-note {
		margin: clamp(2rem, 4vw, 3rem) 0 0;
		padding: 1.15rem 1.35rem;
		border-left: 3px solid var(--sv-accent);
		background: rgba(127, 227, 245, 0.05);
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--sv-text-muted);
		max-width: 68ch;
	}

	/* ── Recorrido entre capacidades ───────────────────── */

	.cp-siblings {
		padding: clamp(2rem, 4vw, 3rem) 0;
		border-top: 1px solid var(--sv-rule);
	}

	.cp-siblings-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.cp-sibling {
		display: grid;
		gap: 0.2rem;
		text-decoration: none;
		color: var(--sv-text);
		padding: 0.5rem 0;
	}

	.cp-sibling--next {
		text-align: right;
	}

	.cp-sibling--hub {
		font-size: 0.85rem;
		color: var(--sv-text-muted);
		border-bottom: 1px solid var(--sv-rule);
		padding-bottom: 2px;
	}

	.cp-sibling--hub:hover {
		color: var(--sv-text);
		border-bottom-color: var(--sv-accent);
	}

	.cp-sibling-dir {
		font-family: var(--gl-font-label);
		font-size: 0.66rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--sv-text-faint);
	}

	.cp-sibling-title {
		font-weight: 600;
		font-size: 1rem;
		transition: color var(--gl-dur) var(--gl-ease);
	}

	.cp-sibling:hover .cp-sibling-title {
		color: var(--sv-accent);
	}

	.cp-sibling:focus-visible {
		outline: 2px solid var(--sv-accent);
		outline-offset: 3px;
	}

	@media (max-width: 620px) {
		.cp-siblings-inner {
			flex-direction: column;
			align-items: stretch;
		}

		.cp-sibling--next {
			text-align: left;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cp-btn,
		.cp-sibling-title {
			transition: none;
		}

		.cp-btn--primary:hover {
			transform: none;
		}
	}
</style>
