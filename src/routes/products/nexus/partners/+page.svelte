<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { partnerModels } from '$lib/data/nexusModels.js';
	import '../nexus.css';

	// Los protocolos y los tiempos salen de lo que ya está publicado en /faq y en
	// la página de Nexus. Lo que NO está documentado en ninguna parte —puertos,
	// esquema de payload, límites de frecuencia y retención— se resuelve en la
	// llamada técnica a propósito: publicar cifras inventadas aquí sería peor que
	// no publicarlas, porque un integrador las usaría para dimensionar.
	const protocolos = [
		{
			nombre: 'TCP',
			para: 'Dispositivos que ya transmiten por socket',
			detalle:
				'Para equipos que envían telemetría mediante sockets personalizados o protocolos compatibles. Es la vía habitual del hardware GPS que ya tienes instalado en campo.'
		},
		{
			nombre: 'MQTT',
			para: 'Escenarios IoT y telemetría distribuida',
			detalle:
				'Para flotas de sensores y dispositivos que publican por tópicos. Pensado para volúmenes altos de mensajes pequeños y conexiones intermitentes.'
		},
		{
			nombre: 'REST',
			para: 'Integración desde tu backend',
			detalle:
				'Para enviar telemetría y consumir datos desde tus propios sistemas: consultas en tiempo real, cargas por lote y sincronización con tu ERP o CRM.'
		},
		{
			nombre: 'Webhooks',
			para: 'Eventos hacia tus sistemas',
			detalle:
				'Nexus emite eventos hacia donde tú digas —geocerca cruzada, desconexión, alerta— para que dispares automatizaciones sin estar consultando.'
		}
	];

	const formatos = ['JSON', 'Payloads estructurados', 'Protocolos propietarios', 'TCP custom'];

	const pasos = [
		{
			n: '01',
			titulo: 'Llamada técnica',
			desc: 'Nos cuentas qué hardware tienes y cómo transmite. Salimos de ahí sabiendo si es compatible.',
			tiempo: 'Misma semana'
		},
		{
			n: '02',
			titulo: 'Acceso y credenciales',
			desc: 'Te damos entorno, credenciales y la documentación del protocolo que te toca.',
			tiempo: 'Al confirmar'
		},
		{
			n: '03',
			titulo: 'Integración de datos',
			desc: 'Un equipo con experiencia básica en APIs conecta el flujo de telemetría y lo valida.',
			tiempo: '1 a 3 días hábiles'
		},
		{
			n: '04',
			titulo: 'Marca propia',
			desc: 'Solo si vas por Nexus Platform: logotipo, paleta, dominio y planes.',
			tiempo: '1 a 2 días más'
		}
	];

	const whiteLabel = [
		'Tu logotipo y tu paleta en panel y app',
		'Dominio propio',
		'Tus planes y tus precios',
		'Tus clientes y tu facturación',
		'La ingeniería, el mantenimiento y la operación, de nuestro lado'
	];
</script>

<svelte:head>
	<title>Nexus para partners — conecta tu hardware o lanza con tu marca | Geminis Labs</title>
	<meta
		name="description"
		content="Conecta tu propio hardware GPS o IoT a la infraestructura de Nexus por TCP, MQTT o REST, u opera la plataforma completa bajo tu marca. Documentación de protocolos y acceso técnico."
	/>
	<!-- nexus.css pide Audiowide para los títulos pero no la carga nadie en esta
	     rama de rutas; sin esto los títulos caen a system-ui. -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet" />
</svelte:head>

<div class="nx-page-wrap">
	<Navbar />
	<div class="nx-page">
		<main class="pt-page">
			<!-- ── HERO ────────────────────────────────────────── -->
			<section class="pt-hero">
				<div class="pt-container">
					<nav class="pt-breadcrumb" aria-label="Ruta de navegación">
						<a href="/products/nexus">Nexus</a>
						<span aria-hidden="true">/</span>
						<span>Para partners</span>
					</nav>
					<p class="pt-overline">Nexus Connect · Nexus Platform</p>
					<h1 class="pt-hero-title">Tu hardware.<br />Nuestra infraestructura.</h1>
					<p class="pt-hero-sub">
						Ya construimos el rastreo, el streaming, el geoproceso, las alertas, el panel y las
						apps. Si ya tienes dispositivos en campo, conéctalos. Si además quieres venderlo como
						tuyo, ponle tu marca.
					</p>
					<div class="pt-hero-actions">
						<a href="/#contacto" class="pt-btn pt-btn--primary">Solicitar acceso técnico</a>
						<a href="#protocolos" class="pt-btn pt-btn--ghost">Ver protocolos</a>
					</div>
				</div>
			</section>

			<!-- ── LAS DOS MODALIDADES ─────────────────────────── -->
			<section class="pt-section" id="modalidades">
				<div class="pt-container">
					<header class="pt-head">
						<p class="pt-overline">Dos formas</p>
						<h2 class="pt-title">Qué pones tú, qué ponemos nosotros</h2>
					</header>
					<div class="pt-models">
						{#each partnerModels as m (m.key)}
							<article class="pt-model">
								<p class="pt-model-axis">{m.axis}</p>
								<h3 class="pt-model-name">{m.label}</h3>
								<p class="pt-model-line">{m.line}</p>
								<ul class="pt-model-list">
									{#each m.bullets as b (b)}
										<li>{b}</li>
									{/each}
								</ul>
								<p class="pt-model-tech">{m.tech}</p>
							</article>
						{/each}
					</div>
				</div>
			</section>

			<!-- ── PROTOCOLOS ──────────────────────────────────── -->
			<section class="pt-section pt-section--alt" id="protocolos">
				<div class="pt-container">
					<header class="pt-head">
						<p class="pt-overline">Cómo se conecta</p>
						<h2 class="pt-title">Protocolos soportados</h2>
						<p class="pt-sub">
							Si tu hardware transmite por alguno de estos, la integración es cuestión de días. Si
							usa un protocolo propietario, lo evaluamos: hemos hecho ese trabajo antes.
						</p>
					</header>
					<div class="pt-protos">
						{#each protocolos as p (p.nombre)}
							<article class="pt-proto">
								<h3 class="pt-proto-name">{p.nombre}</h3>
								<p class="pt-proto-for">{p.para}</p>
								<p class="pt-proto-detail">{p.detalle}</p>
							</article>
						{/each}
					</div>
					<div class="pt-formats">
						<h3 class="pt-formats-title">Formatos que aceptamos</h3>
						<ul class="pt-chips">
							{#each formatos as f (f)}
								<li class="pt-chip">{f}</li>
							{/each}
						</ul>
					</div>
				</div>
			</section>

			<!-- ── WHITE-LABEL ─────────────────────────────────── -->
			<section class="pt-section" id="marca">
				<div class="pt-container pt-split">
					<div>
						<p class="pt-overline">Nexus Platform</p>
						<h2 class="pt-title">Qué significa exactamente «con tu marca»</h2>
						<p class="pt-sub">
							White-label no es poner un logotipo encima. Es que tu cliente nunca sepa que
							existimos: entra a tu dominio, ve tu marca, contrata tus planes y te paga a ti.
						</p>
						<a href="/#contacto" class="pt-btn pt-btn--primary pt-btn--inline"
							>Hablar con el equipo de partners</a
						>
					</div>
					<ul class="pt-checklist">
						{#each whiteLabel as item (item)}
							<li>
								<span class="pt-check" aria-hidden="true">✓</span>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</div>
			</section>

			<!-- ── ONBOARDING ──────────────────────────────────── -->
			<section class="pt-section pt-section--alt" id="onboarding">
				<div class="pt-container">
					<header class="pt-head">
						<p class="pt-overline">Qué tarda</p>
						<h2 class="pt-title">De la llamada a producción</h2>
					</header>
					<ol class="pt-steps">
						{#each pasos as p (p.n)}
							<li class="pt-step">
								<span class="pt-step-n" aria-hidden="true">{p.n}</span>
								<div>
									<h3 class="pt-step-title">{p.titulo}</h3>
									<p class="pt-step-desc">{p.desc}</p>
									<p class="pt-step-time">{p.tiempo}</p>
								</div>
							</li>
						{/each}
					</ol>
				</div>
			</section>

			<!-- ── CIERRE ──────────────────────────────────────── -->
			<section class="pt-section pt-close">
				<div class="pt-container">
					<h2 class="pt-title pt-close-title">¿Traes hardware o traes clientes?</h2>
					<p class="pt-sub pt-close-sub">
						En la llamada técnica resolvemos compatibilidad, límites de tu operación y qué modalidad
						te conviene. Sin compromiso comercial.
					</p>
					<a href="/#contacto" class="pt-btn pt-btn--primary">Solicitar acceso técnico</a>
					<p class="pt-close-note">
						¿Buscas rastreo para tu propia flotilla, sin integrar nada?
						<a href="/products/nexus">Ver Nexus</a>
					</p>
				</div>
			</section>
		</main>
		<Footer />
	</div>
</div>

<style>
	/* Los tokens (--nx-*) los aporta `.nx-page` desde nexus.css: esta es una
	   subpágina de Nexus, no un producto aparte, así que hereda su paleta en vez
	   de abrir una segunda. */
	.pt-page {
		background: var(--nx-bg-primary);
		color: var(--nx-text-primary);
	}

	/* `login-page.css` declara un `section { min-height: 100vh; display: flex;
	   align-items: center }` sin scope que se filtra a todo el sitio: dejaba cada
	   bloque de esta página en 949px con el contenido centrado a la fuerza.
	   nexus.css ya lo neutraliza para los suyos; aquí hacemos lo mismo en vez de
	   tocar el global, del que otras páginas ya dependen. */
	.pt-page section {
		min-height: 0;
		display: block;
	}

	.pt-container {
		width: min(1180px, 92vw);
		margin: 0 auto;
	}

	.pt-section {
		padding: clamp(3.5rem, 8vw, 6.5rem) 0;
	}

	.pt-section--alt {
		background: var(--nx-bg-secondary);
	}

	.pt-overline {
		font-family: 'Audiowide', system-ui, sans-serif;
		font-size: 0.72rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--nx-accent-a);
		margin: 0 0 0.9rem;
	}

	.pt-title {
		font-family: 'Audiowide', system-ui, sans-serif;
		font-size: clamp(1.6rem, 3.4vw, 2.5rem);
		line-height: 1.18;
		text-wrap: balance;
		margin: 0 0 1rem;
	}

	.pt-sub {
		font-size: clamp(0.98rem, 1.2vw, 1.1rem);
		line-height: 1.65;
		color: var(--nx-text-secondary);
		max-width: 60ch;
		margin: 0;
	}

	.pt-head {
		margin-bottom: clamp(2rem, 4vw, 3rem);
	}

	/* ── Hero ──────────────────────────────────────────────── */

	.pt-hero {
		padding: clamp(6rem, 12vw, 9rem) 0 clamp(3rem, 7vw, 5rem);
		background:
			radial-gradient(ellipse at 20% 0%, rgba(62, 193, 40, 0.16), transparent 55%),
			var(--nx-bg-primary);
	}

	.pt-breadcrumb {
		display: flex;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--nx-text-muted);
		margin-bottom: 1.5rem;
	}

	.pt-breadcrumb a {
		color: var(--nx-text-secondary);
		text-decoration: none;
	}

	.pt-breadcrumb a:hover {
		color: var(--nx-accent-a);
	}

	.pt-hero-title {
		font-family: 'Audiowide', system-ui, sans-serif;
		font-size: clamp(2.1rem, 5.6vw, 3.9rem);
		line-height: 1.1;
		margin: 0 0 1.25rem;
		text-wrap: balance;
	}

	.pt-hero-sub {
		font-size: clamp(1rem, 1.35vw, 1.2rem);
		line-height: 1.65;
		color: var(--nx-text-secondary);
		max-width: 58ch;
		margin: 0 0 2rem;
	}

	.pt-hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	/* ── Botones ───────────────────────────────────────────── */

	.pt-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0.75rem 1.6rem;
		border-radius: 10px;
		font-weight: 600;
		font-size: 0.95rem;
		text-decoration: none;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease,
			background 0.25s ease;
	}

	.pt-btn--primary {
		/* Tinta oscura sobre el verde de marca: blanco sobre #3ec128 no llega a AA. */
		background: var(--nx-gradient-cta);
		color: #04140a;
		border: 1px solid var(--nx-accent-a);
	}

	.pt-btn--primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 24px -12px rgba(62, 193, 40, 0.8);
	}

	.pt-btn--ghost {
		background: transparent;
		color: var(--nx-text-primary);
		border: 1px solid var(--nx-card-border-hover);
	}

	.pt-btn--ghost:hover {
		border-color: var(--nx-accent-a);
	}

	.pt-btn--inline {
		margin-top: 1.75rem;
	}

	.pt-btn:focus-visible {
		outline: 2px solid var(--nx-accent-c);
		outline-offset: 3px;
	}

	/* ── Modalidades ───────────────────────────────────────── */

	.pt-models {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(22rem, 100%), 1fr));
		gap: 1.25rem;
	}

	.pt-model {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: clamp(1.5rem, 3vw, 2.25rem);
		border: 1px solid var(--nx-card-border);
		border-radius: 16px;
		background: var(--nx-card-bg);
		transition: border-color 0.25s ease;
	}

	.pt-model:hover {
		border-color: var(--nx-card-border-hover);
	}

	.pt-model-axis {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--nx-text-muted);
		margin: 0;
	}

	.pt-model-name {
		font-family: 'Audiowide', system-ui, sans-serif;
		font-size: 1.25rem;
		margin: 0;
	}

	.pt-model-line {
		color: var(--nx-text-secondary);
		line-height: 1.6;
		margin: 0;
	}

	.pt-model-list {
		list-style: none;
		padding: 1rem 0 0;
		margin: 0.5rem 0 0;
		border-top: 1px solid var(--nx-card-border);
		display: grid;
		gap: 0.5rem;
	}

	.pt-model-list li {
		position: relative;
		padding-left: 1.15rem;
		font-size: 0.92rem;
		color: var(--nx-text-secondary);
	}

	.pt-model-list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55em;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--nx-accent-a);
	}

	.pt-model-tech {
		font-size: 0.76rem;
		color: var(--nx-text-muted);
		margin: auto 0 0;
		padding-top: 1rem;
	}

	/* ── Protocolos ────────────────────────────────────────── */

	.pt-protos {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
		gap: 1px;
		background: var(--nx-card-border);
		border: 1px solid var(--nx-card-border);
		border-radius: 16px;
		overflow: hidden;
	}

	.pt-proto {
		background: var(--nx-bg-primary);
		padding: clamp(1.35rem, 2.6vw, 1.9rem);
	}

	.pt-proto-name {
		font-family: 'Audiowide', system-ui, sans-serif;
		font-size: 1.1rem;
		color: var(--nx-accent-a);
		margin: 0 0 0.35rem;
	}

	.pt-proto-for {
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		color: var(--nx-text-primary);
		margin: 0 0 0.7rem;
	}

	.pt-proto-detail {
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--nx-text-secondary);
		margin: 0;
	}

	.pt-formats {
		margin-top: 2rem;
	}

	.pt-formats-title {
		font-family: 'Audiowide', system-ui, sans-serif;
		font-size: 0.8rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--nx-text-muted);
		margin: 0 0 0.85rem;
	}

	.pt-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.pt-chip {
		padding: 0.35rem 0.8rem;
		border-radius: 999px;
		border: 1px solid var(--nx-card-border-hover);
		font-size: 0.82rem;
		color: var(--nx-text-secondary);
	}

	/* ── White-label ───────────────────────────────────────── */

	.pt-split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(24rem, 100%), 1fr));
		gap: clamp(2rem, 5vw, 4rem);
		align-items: start;
	}

	.pt-checklist {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.9rem;
	}

	.pt-checklist li {
		display: grid;
		grid-template-columns: 1.5rem 1fr;
		gap: 0.75rem;
		align-items: start;
		padding-bottom: 0.9rem;
		border-bottom: 1px solid var(--nx-card-border);
		color: var(--nx-text-secondary);
		line-height: 1.55;
	}

	.pt-check {
		color: var(--nx-accent-a);
		font-weight: 700;
	}

	/* ── Onboarding ────────────────────────────────────────── */

	.pt-steps {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr));
		gap: clamp(1.5rem, 3vw, 2.5rem);
	}

	.pt-step {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.9rem;
		align-items: start;
	}

	.pt-step-n {
		font-family: 'Audiowide', system-ui, sans-serif;
		font-size: 0.9rem;
		color: var(--nx-accent-a);
		padding-top: 0.15rem;
	}

	.pt-step-title {
		font-size: 1rem;
		font-weight: 700;
		margin: 0 0 0.35rem;
	}

	.pt-step-desc {
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--nx-text-secondary);
		margin: 0 0 0.5rem;
	}

	.pt-step-time {
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		color: var(--nx-accent-a);
		margin: 0;
	}

	/* ── Cierre ────────────────────────────────────────────── */

	.pt-close {
		text-align: center;
		background:
			radial-gradient(ellipse at 50% 100%, rgba(62, 193, 40, 0.14), transparent 60%),
			var(--nx-bg-primary);
	}

	.pt-close-sub {
		margin: 0 auto 2rem;
	}

	.pt-close-note {
		margin: 1.75rem 0 0;
		font-size: 0.86rem;
		color: var(--nx-text-muted);
	}

	.pt-close-note a {
		color: var(--nx-text-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		.pt-btn,
		.pt-model {
			transition: none;
		}

		.pt-btn--primary:hover {
			transform: none;
		}
	}
</style>
