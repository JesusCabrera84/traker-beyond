<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { services, processSteps } from '$lib/data/services.js';

	// Abierta la primera: la página nunca se ve vacía y el visitante entiende de
	// inmediato que las filas se abren. El resto colapsadas para que las seis
	// capacidades quepan en pantalla y se puedan comparar.
	let abierta = services[0].slug;

	function alternar(slug) {
		abierta = abierta === slug ? null : slug;
	}
</script>

<svelte:head>
	<title>Servicios de ingeniería y consultoría tecnológica | Geminis Labs</title>
	<meta
		name="description"
		content="Consultoría y arquitectura, software y cloud, IA y datos, IoT y hardware, Industria 4.0 y soluciones integrales. De la idea a una solución operando, con un solo equipo."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet" />
</svelte:head>

<Navbar />

<main class="sv-page">
	<!-- ── HERO ──────────────────────────────────────────── -->
	<section class="sv-hero">
		<div class="sv-container">
			<p class="sv-overline">Ingeniería y consultoría</p>
			<h1 class="sv-hero-title">De la idea a una solución que funciona.</h1>
			<p class="sv-hero-sub">
				Tomamos un problema de negocio desde que todavía es una idea y lo llevamos hasta una
				solución operando. Diseñamos la estrategia, la arquitectura, el software, el hardware y la
				infraestructura que hagan falta. <strong
					>Un solo equipo, de la estrategia a producción.</strong
				>
			</p>
			<div class="sv-hero-actions">
				<a href="/servicios/diagnostico" class="sv-btn sv-btn--primary">Agenda un diagnóstico</a>
				<a href="/#productos" class="sv-btn sv-btn--ghost">Ver lo que hemos construido</a>
			</div>
		</div>
	</section>

	<!-- ── RIEL DE PROCESO ───────────────────────────────── -->
	<section class="sv-process-wrap" aria-labelledby="sv-process-title">
		<div class="sv-container">
			<h2 id="sv-process-title" class="sv-sr-only">Cómo trabajamos</h2>
			<ol class="sv-process">
				{#each processSteps as p, i (p.key)}
					<li class="sv-process-step">
						<span class="sv-process-node" aria-hidden="true"></span>
						<span class="sv-process-label">{p.label}</span>
						<span class="sv-process-desc">{p.desc}</span>
						{#if i < processSteps.length - 1}
							<span class="sv-process-line" aria-hidden="true"></span>
						{/if}
					</li>
				{/each}
			</ol>
		</div>
	</section>

	<!-- ── LAS SEIS CAPACIDADES ──────────────────────────── -->
	<section class="sv-index" aria-labelledby="sv-index-title">
		<div class="sv-container">
			<header class="sv-head">
				<p class="sv-overline">Qué hacemos</p>
				<h2 id="sv-index-title" class="sv-title">Seis capacidades, una sola casa</h2>
				<p class="sv-sub">
					No vendemos horas de programador. Vendemos capacidad de ingeniería: entender el problema,
					diseñar la tecnología y construir la solución.
				</p>
			</header>
		</div>

		<!-- Filas a sangre. Es un índice, no una cuadrícula: la landing ya tiene
		     dos rejillas (capas tecnológicas y áreas) y una tercera se leería como
		     más de lo mismo. -->
		<ol class="sv-rows">
			{#each services as s (s.slug)}
				<li class="sv-row-item">
					<button
						type="button"
						class="sv-row"
						class:is-open={abierta === s.slug}
						aria-expanded={abierta === s.slug}
						aria-controls="cap-{s.slug}"
						on:click={() => alternar(s.slug)}
					>
						<span class="sv-row-num" aria-hidden="true">{s.num}</span>
						<span class="sv-row-main">
							<span class="sv-row-title">{s.title}</span>
							<span class="sv-row-promise">{s.promise}</span>
						</span>
						<span class="sv-row-chevron" aria-hidden="true"></span>
					</button>
					<div
						class="sv-row-detail"
						id="cap-{s.slug}"
						class:is-open={abierta === s.slug}
						inert={abierta !== s.slug}
					>
						<div class="sv-row-detail-inner">
							<ul class="sv-chips">
								{#each s.chips as chip (chip)}
									<li class="sv-chip">{chip}</li>
								{/each}
							</ul>
							<div class="sv-row-foot">
								<a class="sv-row-link" href="/servicios/{s.slug}">
									Ver {s.title}
									<span class="sv-row-link-arrow" aria-hidden="true">→</span>
								</a>
								<p class="sv-row-entry">{s.entrada}</p>
							</div>
						</div>
					</div>
				</li>
			{/each}
		</ol>
	</section>

	<!-- ── DOS PUERTAS DE ENTRADA ────────────────────────── -->
	<section class="sv-doors" id="doors">
		<div class="sv-container">
			<header class="sv-head">
				<p class="sv-overline">Por dónde empezar</p>
				<h2 class="sv-title">No tienes que contratar el proyecto completo</h2>
			</header>
			<div class="sv-door-grid">
				<article class="sv-door">
					<h3 class="sv-door-title">Diagnóstico tecnológico</h3>
					<p class="sv-door-desc">
						«Dime qué está mal y qué debería hacer.» Revisamos arquitectura, infraestructura,
						costos, escalabilidad y seguridad, y te entregamos un documento con el que puedes
						decidir — contrates con nosotros o no.
					</p>
					<p class="sv-door-deliverable">
						Estado actual → riesgos → oportunidades → arquitectura recomendada → roadmap →
						estimación de inversión
					</p>
					<a href="/servicios/diagnostico" class="sv-btn sv-btn--primary">Agenda un diagnóstico</a>
				</article>
				<article class="sv-door">
					<h3 class="sv-door-title">CTO as a Service</h3>
					<p class="sv-door-desc">
						No necesitas un CTO de tiempo completo, necesitas que alguien te diga «no compres eso»,
						«ese proveedor te está vendiendo de más», «esta arquitectura no va a escalar» o «antes
						de meter IA arreglemos los datos».
					</p>
					<ul class="sv-door-list">
						<li>Estrategia tecnológica y roadmaps</li>
						<li>Evaluación de proveedores y propuestas</li>
						<li>Supervisión técnica de quien ya te desarrolla</li>
						<li>Acompañamiento en la contratación de tu equipo</li>
					</ul>
					<a href="/#contacto" class="sv-btn sv-btn--ghost">Hablar de acompañamiento</a>
				</article>
			</div>
		</div>
	</section>

	<!-- ── INNOVATION LAB ────────────────────────────────── -->
	<section class="sv-lab">
		<div class="sv-container sv-lab-inner">
			<div>
				<p class="sv-overline">Innovation Lab</p>
				<h2 class="sv-title">¿Tienes una idea y no sabes si se puede construir?</h2>
				<p class="sv-sub">
					Lo averiguamos con un PoC antes de que comprometas presupuesto en algo que quizá no es
					viable. Evaluación técnica, selección de tecnologías, arquitectura inicial y estimación de
					costos.
				</p>
				<a href="/#contacto" class="sv-btn sv-btn--primary sv-btn--inline">Evalúa tu idea</a>
			</div>
			<ol class="sv-flow">
				{#each ['Idea', 'PoC', 'MVP', 'Producto', 'Producción'] as paso, i (paso)}
					<li class="sv-flow-step">
						<span class="sv-flow-n" aria-hidden="true">{i + 1}</span>
						{paso}
					</li>
				{/each}
			</ol>
		</div>
	</section>

	<!-- ── CIERRE ────────────────────────────────────────── -->
	<section class="sv-close">
		<div class="sv-container">
			<h2 class="sv-title sv-close-title">
				Entendemos el problema, diseñamos la tecnología y construimos la solución.
			</h2>
			<p class="sv-sub sv-close-sub">
				Nexus es la prueba: dispositivo, conectividad, streaming, geoproceso, alertas, panel, apps e
				infraestructura, construidos e integrados por el mismo equipo.
			</p>
			<div class="sv-hero-actions sv-close-actions">
				<a href="/servicios/diagnostico" class="sv-btn sv-btn--primary">Agenda un diagnóstico</a>
				<a href="/products/nexus" class="sv-btn sv-btn--ghost">Ver Nexus</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.sv-page {
		background: var(--sv-bg);
		color: var(--sv-text);
		font-family: var(--gl-font-body);
	}

	/* `login-page.css` declara un `section { min-height: 100vh; display: flex }`
	   sin scope que se filtra a todo el sitio. Se neutraliza aquí, igual que hace
	   nexus.css para los suyos. */
	.sv-page section {
		min-height: 0;
		display: block;
	}

	.sv-container {
		width: min(1180px, 92vw);
		margin: 0 auto;
	}

	.sv-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.sv-overline {
		font-family: var(--gl-font-label);
		font-size: 0.72rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--sv-accent);
		margin: 0 0 1rem;
	}

	.sv-title {
		font-family: var(--gl-font-body);
		font-weight: 600;
		font-size: clamp(1.5rem, 3.2vw, 2.3rem);
		line-height: 1.2;
		text-wrap: balance;
		margin: 0 0 1rem;
	}

	.sv-sub {
		font-size: clamp(0.98rem, 1.2vw, 1.1rem);
		line-height: 1.65;
		color: var(--sv-text-muted);
		max-width: 62ch;
		margin: 0;
	}

	.sv-head {
		margin-bottom: clamp(2rem, 4vw, 3rem);
	}

	/* ── Hero ──────────────────────────────────────────── */

	.sv-hero {
		padding: clamp(6.5rem, 13vw, 9.5rem) 0 clamp(3rem, 6vw, 4.5rem);
		background:
			radial-gradient(ellipse at 15% 0%, rgba(8, 131, 160, 0.28), transparent 58%), var(--sv-bg);
	}

	.sv-hero-title {
		font-family: var(--gl-font-body);
		font-weight: 700;
		font-size: clamp(2.1rem, 5.4vw, 3.7rem);
		line-height: 1.08;
		letter-spacing: -0.02em;
		text-wrap: balance;
		margin: 0 0 1.25rem;
		max-width: 18ch;
	}

	.sv-hero-sub {
		font-size: clamp(1rem, 1.3vw, 1.18rem);
		line-height: 1.65;
		color: var(--sv-text-muted);
		max-width: 60ch;
		margin: 0 0 2rem;
	}

	.sv-hero-sub strong {
		color: var(--sv-text);
		font-weight: 600;
	}

	.sv-hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	/* ── Botones ───────────────────────────────────────── */

	.sv-btn {
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

	.sv-btn--primary {
		background: var(--sv-accent);
		color: var(--sv-accent-ink);
		border: 1px solid var(--sv-accent);
	}

	.sv-btn--primary:hover {
		transform: translateY(-2px);
		background: #a4ecf9;
		border-color: #a4ecf9;
	}

	.sv-btn--ghost {
		background: transparent;
		color: var(--sv-text);
		border: 1px solid var(--sv-rule);
	}

	.sv-btn--ghost:hover {
		border-color: var(--sv-accent);
	}

	.sv-btn--inline {
		margin-top: 1.75rem;
	}

	.sv-btn:focus-visible {
		outline: 2px solid var(--sv-accent);
		outline-offset: 3px;
	}

	/* ── Riel de proceso ───────────────────────────────── */

	.sv-process-wrap {
		padding: clamp(1.5rem, 3vw, 2.25rem) 0;
		border-top: 1px solid var(--sv-rule);
		border-bottom: 1px solid var(--sv-rule);
		background: var(--sv-bg-2);
	}

	.sv-process {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0;
	}

	.sv-process-step {
		position: relative;
		display: grid;
		grid-template-rows: auto auto auto;
		gap: 0.4rem;
		padding-right: 1rem;
	}

	.sv-process-node {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--sv-accent);
		margin-bottom: 0.35rem;
	}

	/* La línea de 1px que une los nodos: gradiente de la escalera teal. */
	.sv-process-line {
		position: absolute;
		top: 3px;
		left: 7px;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, var(--gl-teal-400), var(--gl-teal-200));
		opacity: 0.45;
	}

	.sv-process-label {
		font-family: var(--gl-font-label);
		font-size: 0.68rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--sv-text);
	}

	.sv-process-desc {
		font-size: 0.82rem;
		line-height: 1.45;
		color: var(--sv-text-faint);
		max-width: 22ch;
	}

	/* ── Índice de capacidades ─────────────────────────── */

	.sv-index {
		padding: clamp(3.5rem, 7vw, 5.5rem) 0 0;
	}

	.sv-rows {
		list-style: none;
		padding: 0;
		margin: clamp(1.5rem, 3vw, 2.5rem) 0 0;
		border-top: 1px solid var(--sv-rule);
	}

	.sv-row-item {
		border-bottom: 1px solid var(--sv-rule);
	}

	/* Botón, no div: el contenido revelado solo por hover es inalcanzable con
	   teclado y en táctil. */
	/* A sangre de verdad: el botón ocupa todo el ancho y el padding lateral
	   alinea su contenido con el contenedor. Con `width: min(1180px,92vw)` el
	   fondo del hover y el riel de acento se quedaban dentro de la caja, que es
	   justo lo que distingue este patrón de una cuadrícula más. */
	.sv-row {
		position: relative;
		width: 100%;
		padding-inline: max(4vw, calc((100% - 1180px) / 2));
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 0 clamp(1rem, 2.5vw, 2.25rem);
		align-items: start;
		padding-block: clamp(1.5rem, 2.4vw, 2.1rem);
		background: transparent;
		border: 0;
		text-align: left;
		color: inherit;
		font: inherit;
		cursor: pointer;
		transition: background var(--gl-dur) var(--gl-ease);
	}

	.sv-row::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 3px;
		background: var(--sv-accent);
		transform: scaleY(0);
		transform-origin: 50% 0;
		transition: transform var(--gl-dur) var(--gl-ease);
	}

	.sv-row:hover,
	.sv-row.is-open {
		background: var(--sv-row-hover);
	}

	.sv-row:hover::before,
	.sv-row.is-open::before {
		transform: scaleY(1);
	}

	.sv-row:focus-visible {
		outline: 2px solid var(--sv-accent);
		outline-offset: -2px;
	}

	.sv-row-num {
		font-family: var(--gl-font-label);
		font-size: 0.72rem;
		letter-spacing: 0.28em;
		color: var(--sv-text-faint);
		padding-top: 0.5rem;
	}

	.sv-row-main {
		display: grid;
		gap: 0.4rem;
		min-width: 0;
	}

	.sv-row-title {
		font-size: clamp(1.3rem, 2.2vw, 2rem);
		font-weight: 600;
		line-height: 1.2;
		transition: transform var(--gl-dur) var(--gl-ease);
	}

	.sv-row:hover .sv-row-title {
		transform: translateX(6px);
	}

	.sv-row-promise {
		font-size: clamp(0.95rem, 1.1vw, 1.1rem);
		line-height: 1.55;
		color: var(--sv-text-muted);
		max-width: 52ch;
	}

	.sv-row-chevron {
		width: 12px;
		height: 12px;
		border-right: 2px solid var(--sv-text-faint);
		border-bottom: 2px solid var(--sv-text-faint);
		transform: rotate(45deg);
		margin-top: 0.6rem;
		transition: transform var(--gl-dur) var(--gl-ease);
	}

	.sv-row.is-open .sv-row-chevron {
		transform: rotate(-135deg);
	}

	/* grid-template-rows 0fr → 1fr anima alto sin conocerlo de antemano. */
	.sv-row-detail {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--gl-dur) var(--gl-ease);
	}

	.sv-row-detail.is-open {
		grid-template-rows: 1fr;
	}

	.sv-row-detail-inner {
		overflow: hidden;
		padding-inline: max(4vw, calc((100% - 1180px) / 2));
	}

	.sv-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
		margin: 0 0 1rem;
	}

	.sv-chip {
		padding: 0.35rem 0.8rem;
		border-radius: var(--gl-r-pill);
		border: 1px solid rgba(127, 227, 245, 0.28);
		font-size: 0.82rem;
		color: var(--sv-text-muted);
	}

	.sv-row-foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1.5rem;
		margin-bottom: clamp(1.25rem, 2.4vw, 1.75rem);
	}
	.sv-row-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 44px;
		padding: 0.55rem 1.2rem;
		border-radius: var(--gl-r-sm);
		border: 1px solid rgba(127, 227, 245, 0.35);
		color: var(--sv-text);
		font-size: 0.88rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			border-color var(--gl-dur) var(--gl-ease),
			background var(--gl-dur) var(--gl-ease);
	}
	.sv-row-link:hover {
		border-color: var(--sv-accent);
		background: rgba(127, 227, 245, 0.07);
	}
	.sv-row-link:focus-visible {
		outline: 2px solid var(--sv-accent);
		outline-offset: 3px;
	}
	.sv-row-link-arrow {
		transition: transform var(--gl-dur) var(--gl-ease);
	}
	.sv-row-link:hover .sv-row-link-arrow {
		transform: translateX(3px);
	}
	.sv-row-entry {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--sv-accent);
		margin: 0;
	}

	/* ── Puertas de entrada ────────────────────────────── */

	.sv-doors {
		padding: clamp(3.5rem, 7vw, 5.5rem) 0;
		background: var(--sv-bg-2);
		border-top: 1px solid var(--sv-rule);
	}

	.sv-door-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(24rem, 100%), 1fr));
		gap: 1.25rem;
	}

	.sv-door {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		align-items: flex-start;
		padding: clamp(1.5rem, 3vw, 2.25rem);
		border: 1px solid var(--sv-rule);
		border-radius: var(--gl-r-md);
		background: rgba(127, 227, 245, 0.03);
	}

	.sv-door-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}

	.sv-door-desc {
		color: var(--sv-text-muted);
		line-height: 1.6;
		margin: 0;
	}

	.sv-door-deliverable {
		font-family: var(--gl-font-label);
		font-size: 0.7rem;
		line-height: 1.7;
		letter-spacing: 0.06em;
		color: var(--sv-accent);
		margin: 0;
	}

	.sv-door-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.5rem;
	}

	.sv-door-list li {
		position: relative;
		padding-left: 1.15rem;
		font-size: 0.92rem;
		color: var(--sv-text-muted);
	}

	.sv-door-list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55em;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--sv-accent);
	}

	.sv-door .sv-btn {
		margin-top: auto;
	}

	/* ── Innovation Lab ────────────────────────────────── */

	.sv-lab {
		padding: clamp(3.5rem, 7vw, 5.5rem) 0;
	}

	.sv-lab-inner {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(22rem, 100%), 1fr));
		gap: clamp(2rem, 5vw, 4rem);
		align-items: center;
	}

	.sv-flow {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.6rem;
	}

	.sv-flow-step {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1.1rem;
		border: 1px solid var(--sv-rule);
		border-radius: var(--gl-r-sm);
		font-weight: 600;
	}

	.sv-flow-n {
		font-family: var(--gl-font-label);
		font-size: 0.7rem;
		color: var(--sv-accent);
	}

	/* ── Cierre ────────────────────────────────────────── */

	.sv-close {
		padding: clamp(3.5rem, 7vw, 5.5rem) 0;
		border-top: 1px solid var(--sv-rule);
		background:
			radial-gradient(ellipse at 50% 100%, rgba(8, 131, 160, 0.22), transparent 62%), var(--sv-bg);
	}

	.sv-close-title {
		max-width: 24ch;
	}

	.sv-close-sub {
		margin-bottom: 2rem;
	}

	.sv-close-actions {
		margin: 0;
	}

	/* ── Responsive ────────────────────────────────────── */

	@media (max-width: 900px) {
		.sv-process {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.sv-process-line {
			display: none;
		}

		.sv-process-desc {
			max-width: none;
		}
	}

	@media (max-width: 700px) {
		.sv-row {
			grid-template-columns: auto 1fr;
		}

		.sv-row-chevron {
			grid-column: 2;
			justify-self: end;
			margin-top: 0.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sv-row,
		.sv-row::before,
		.sv-row-title,
		.sv-row-chevron,
		.sv-row-detail,
		.sv-row-link,
		.sv-row-link-arrow,
		.sv-btn {
			transition: none;
		}

		.sv-row:hover .sv-row-title {
			transform: none;
		}

		.sv-btn--primary:hover {
			transform: none;
		}
	}
</style>
