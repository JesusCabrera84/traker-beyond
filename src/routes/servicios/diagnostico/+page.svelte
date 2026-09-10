<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Qué revisamos. Sale del listado de auditoría del documento de servicios.
	const revisamos = [
		{ t: 'Arquitectura', d: 'Cómo está armado hoy y qué te va a costar cuando crezcas.' },
		{ t: 'Infraestructura y cloud', d: 'Qué estás pagando de más y qué se cae si sube la carga.' },
		{ t: 'Escalabilidad y rendimiento', d: 'Dónde está el cuello de botella real, con números.' },
		{ t: 'Código y deuda técnica', d: 'Qué tan caro es cambiar algo, y por qué.' },
		{ t: 'Seguridad', d: 'Accesos, secretos, superficie expuesta y respaldos.' },
		{ t: 'Datos e IA', d: 'Si tus datos aguantan lo que quieres hacer con ellos.' },
		{ t: 'IoT y dispositivos', d: 'Conectividad, telemetría y administración de equipo en campo.' },
		{ t: 'Costos', d: 'Qué se va en licencias, proveedores e infraestructura ociosa.' }
	];

	// El entregable, literal del documento fuente.
	const entregable = [
		{ n: '01', t: 'Estado actual', d: 'Qué tienes, cómo está y qué lo sostiene.' },
		{ n: '02', t: 'Riesgos', d: 'Qué se puede romper y qué pasa si se rompe.' },
		{ n: '03', t: 'Oportunidades', d: 'Dónde hay ahorro o ventaja sin rehacer todo.' },
		{ n: '04', t: 'Arquitectura recomendada', d: 'A dónde deberías llegar, y por qué a eso.' },
		{ n: '05', t: 'Roadmap', d: 'En qué orden, para no parar la operación.' },
		{ n: '06', t: 'Estimación de inversión', d: 'Cuánto cuesta cada tramo del camino.' }
	];

	const paraQuien = [
		'Tu plataforma ya no aguanta y no sabes si es el código, la infraestructura o el diseño',
		'Un proveedor te pasó una cotización y no tienes con qué contrastarla',
		'Vas a invertir en IA pero sospechas que tus datos no están listos',
		'Heredaste un sistema que nadie documentó',
		'Tu factura de cloud sube y nadie sabe explicar por qué',
		'Quieres conectar máquinas o dispositivos y no sabes por dónde se empieza'
	];
</script>

<svelte:head>
	<title>Diagnóstico tecnológico | Geminis Labs</title>
	<meta
		name="description"
		content="Auditoría de arquitectura, infraestructura, escalabilidad, seguridad y costos. Te entregamos estado actual, riesgos, oportunidades, arquitectura recomendada, roadmap y estimación de inversión."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet" />
</svelte:head>

<Navbar />

<main class="dg-page">
	<section class="dg-hero">
		<div class="dg-container">
			<nav class="dg-breadcrumb" aria-label="Ruta de navegación">
				<a href="/servicios">Servicios</a>
				<span aria-hidden="true">/</span>
				<span>Diagnóstico</span>
			</nav>
			<p class="dg-overline">Diagnóstico tecnológico</p>
			<h1 class="dg-hero-title">«Dime qué está mal y qué debería hacer.»</h1>
			<p class="dg-hero-sub">
				No tienes que contratar un proyecto completo para empezar a trabajar con nosotros. Puedes
				empezar contratando una opinión técnica honesta sobre lo que ya tienes —
				<strong>y llevártela, contrates lo que sigue con nosotros o no.</strong>
			</p>
			<div class="dg-actions">
				<a href="/#contacto" class="dg-btn dg-btn--primary">Solicitar un diagnóstico</a>
				<a href="#entregable" class="dg-btn dg-btn--ghost">Ver qué recibes</a>
			</div>
		</div>
	</section>

	<section class="dg-section dg-section--alt">
		<div class="dg-container">
			<header class="dg-head">
				<p class="dg-overline">Para quién es</p>
				<h2 class="dg-title">Si alguna de estas te suena, es para ti</h2>
			</header>
			<ul class="dg-cases">
				{#each paraQuien as caso (caso)}
					<li class="dg-case">{caso}</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="dg-section">
		<div class="dg-container">
			<header class="dg-head">
				<p class="dg-overline">Qué revisamos</p>
				<h2 class="dg-title">Ocho frentes</h2>
				<p class="dg-sub">
					No todos aplican a todos. En la primera llamada acotamos el alcance a lo que de verdad te
					duele, para que el diagnóstico no se vuelva un ejercicio académico.
				</p>
			</header>
			<div class="dg-grid">
				{#each revisamos as r (r.t)}
					<article class="dg-item">
						<h3 class="dg-item-title">{r.t}</h3>
						<p class="dg-item-desc">{r.d}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section class="dg-section dg-section--alt" id="entregable">
		<div class="dg-container">
			<header class="dg-head">
				<p class="dg-overline">Qué recibes</p>
				<h2 class="dg-title">Un documento con el que puedes decidir</h2>
				<p class="dg-sub">
					No una presentación de ventas. Un entregable que puedes poner sobre la mesa de tu consejo,
					de tu socio o del proveedor que ya te está desarrollando.
				</p>
			</header>
			<ol class="dg-deliverable">
				{#each entregable as e (e.n)}
					<li class="dg-step">
						<span class="dg-step-n" aria-hidden="true">{e.n}</span>
						<div>
							<h3 class="dg-step-title">{e.t}</h3>
							<p class="dg-step-desc">{e.d}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</section>

	<section class="dg-close">
		<div class="dg-container">
			<h2 class="dg-title dg-close-title">Empieza por saber en qué estás parado</h2>
			<p class="dg-sub dg-close-sub">
				Escríbenos qué te está pasando. La primera llamada es para acotar el alcance y decirte si
				podemos ayudarte — si no podemos, también te lo decimos.
			</p>
			<a href="/#contacto" class="dg-btn dg-btn--primary">Solicitar un diagnóstico</a>
			<p class="dg-close-note">
				¿Buscas acompañamiento continuo en vez de una revisión puntual?
				<a href="/servicios">Ver CTO as a Service</a>
			</p>
		</div>
	</section>
</main>

<Footer />

<style>
	.dg-page {
		background: var(--sv-bg);
		color: var(--sv-text);
		font-family: var(--gl-font-body);
	}

	/* Neutraliza el `section { min-height: 100vh }` sin scope de login-page.css. */
	.dg-page section {
		min-height: 0;
		display: block;
	}

	.dg-container {
		width: min(1080px, 92vw);
		margin: 0 auto;
	}

	.dg-section {
		padding: clamp(3.25rem, 7vw, 5rem) 0;
	}

	.dg-section--alt {
		background: var(--sv-bg-2);
		border-top: 1px solid var(--sv-rule);
		border-bottom: 1px solid var(--sv-rule);
	}

	.dg-overline {
		font-family: var(--gl-font-label);
		font-size: 0.72rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--sv-accent);
		margin: 0 0 0.9rem;
	}

	.dg-title {
		font-weight: 600;
		font-size: clamp(1.45rem, 3vw, 2.15rem);
		line-height: 1.22;
		text-wrap: balance;
		margin: 0 0 1rem;
	}

	.dg-sub {
		font-size: clamp(0.96rem, 1.15vw, 1.06rem);
		line-height: 1.65;
		color: var(--sv-text-muted);
		max-width: 62ch;
		margin: 0;
	}

	.dg-head {
		margin-bottom: clamp(1.75rem, 3.5vw, 2.75rem);
	}

	/* ── Hero ──────────────────────────────────────────── */

	.dg-hero {
		padding: clamp(6rem, 12vw, 9rem) 0 clamp(3rem, 6vw, 4.5rem);
		background:
			radial-gradient(ellipse at 18% 0%, rgba(8, 131, 160, 0.26), transparent 58%), var(--sv-bg);
	}

	.dg-breadcrumb {
		display: flex;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--sv-text-faint);
		margin-bottom: 1.5rem;
	}

	.dg-breadcrumb a {
		color: var(--sv-text-muted);
		text-decoration: none;
	}

	.dg-breadcrumb a:hover {
		color: var(--sv-accent);
	}

	.dg-hero-title {
		font-weight: 700;
		font-size: clamp(1.95rem, 4.8vw, 3.2rem);
		line-height: 1.12;
		letter-spacing: -0.02em;
		text-wrap: balance;
		margin: 0 0 1.25rem;
		max-width: 20ch;
	}

	.dg-hero-sub {
		font-size: clamp(1rem, 1.25vw, 1.14rem);
		line-height: 1.65;
		color: var(--sv-text-muted);
		max-width: 60ch;
		margin: 0 0 2rem;
	}

	.dg-hero-sub strong {
		color: var(--sv-text);
		font-weight: 600;
	}

	.dg-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	/* ── Botones ───────────────────────────────────────── */

	.dg-btn {
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

	.dg-btn--primary {
		background: var(--sv-accent);
		color: var(--sv-accent-ink);
		border: 1px solid var(--sv-accent);
	}

	.dg-btn--primary:hover {
		transform: translateY(-2px);
		background: #a4ecf9;
		border-color: #a4ecf9;
	}

	.dg-btn--ghost {
		background: transparent;
		color: var(--sv-text);
		border: 1px solid var(--sv-rule);
	}

	.dg-btn--ghost:hover {
		border-color: var(--sv-accent);
	}

	.dg-btn:focus-visible {
		outline: 2px solid var(--sv-accent);
		outline-offset: 3px;
	}

	/* ── Para quién ────────────────────────────────────── */

	.dg-cases {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(21rem, 100%), 1fr));
		gap: 0.75rem;
	}

	.dg-case {
		position: relative;
		padding: 1rem 1.15rem 1rem 2.5rem;
		border: 1px solid var(--sv-rule);
		border-radius: var(--gl-r-sm);
		color: var(--sv-text-muted);
		line-height: 1.55;
		font-size: 0.94rem;
	}

	.dg-case::before {
		content: '';
		position: absolute;
		left: 1.15rem;
		top: 1.5rem;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--sv-accent);
	}

	/* ── Qué revisamos ─────────────────────────────────── */

	.dg-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr));
		gap: 1px;
		background: var(--sv-rule);
		border: 1px solid var(--sv-rule);
		border-radius: var(--gl-r-md);
		overflow: hidden;
	}

	.dg-item {
		background: var(--sv-bg);
		padding: 1.35rem 1.4rem;
	}

	.dg-item-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.4rem;
		color: var(--sv-accent);
	}

	.dg-item-desc {
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--sv-text-muted);
		margin: 0;
	}

	/* ── Entregable ────────────────────────────────────── */

	.dg-deliverable {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(17rem, 100%), 1fr));
		gap: clamp(1.25rem, 3vw, 2rem);
	}

	.dg-step {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.85rem;
		align-items: start;
	}

	.dg-step-n {
		font-family: var(--gl-font-label);
		font-size: 0.78rem;
		color: var(--sv-accent);
		padding-top: 0.2rem;
	}

	.dg-step-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.3rem;
	}

	.dg-step-desc {
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--sv-text-muted);
		margin: 0;
	}

	/* ── Cierre ────────────────────────────────────────── */

	.dg-close {
		padding: clamp(3.25rem, 7vw, 5rem) 0;
		text-align: center;
		background:
			radial-gradient(ellipse at 50% 100%, rgba(8, 131, 160, 0.2), transparent 62%), var(--sv-bg);
	}

	.dg-close-title {
		max-width: none;
	}

	.dg-close-sub {
		margin: 0 auto 2rem;
	}

	.dg-close-note {
		margin: 1.75rem 0 0;
		font-size: 0.86rem;
		color: var(--sv-text-faint);
	}

	.dg-close-note a {
		color: var(--sv-text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.dg-btn {
			transition: none;
		}

		.dg-btn--primary:hover {
			transform: none;
		}
	}
</style>
