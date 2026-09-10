<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let activeSection = $state('general');
	const openItems = new SvelteSet();

	const categories = [
		{ id: 'general', label: 'General' },
		{ id: 'nexus', label: 'Nexus / Usuarios Finales' },
		{ id: 'flotillas', label: 'Flotillas' },
		{ id: 'partners', label: 'Partners / TaaS' }
	];

	function toggle(id) {
		if (openItems.has(id)) openItems.delete(id);
		else openItems.add(id);
	}

	function stripHtml(value) {
		return value ? value.replace(/<[^>]+>/g, '') : value;
	}

	onMount(() => {
		const sectionEls = document.querySelectorAll('.faq-category[id]');
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) activeSection = e.target.id;
				});
			},
			{ rootMargin: '-10% 0px -70% 0px' }
		);
		sectionEls.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>Preguntas Frecuentes — Geminis Labs</title>
	<meta
		name="description"
		content="Respuestas a las preguntas más frecuentes sobre Geminis Labs, Nexus, flotillas, TaaS e integraciones tecnológicas."
	/>
</svelte:head>

<div class="faq-page">
	<Navbar />

	<!-- Hero -->
	<header class="faq-hero">
		<div class="faq-hero-inner">
			<span class="faq-eyebrow">Soporte</span>
			<h1 class="faq-h1">Preguntas Frecuentes</h1>
			<p class="faq-subtitle">
				Todo lo que necesitas saber sobre Geminis Labs, Nexus, flotillas e integraciones.
			</p>
		</div>
	</header>

	<!-- Body -->
	<div class="faq-body">
		<!-- TOC -->
		<nav class="faq-toc" aria-label="Categorías">
			<span class="faq-toc-label">Categorías</span>
			<ul class="faq-toc-list">
				{#each categories as cat (cat.id)}
					<li>
						<a href="#{cat.id}" class:is-active={activeSection === cat.id}>
							{cat.label}
						</a>
					</li>
				{/each}
			</ul>
			<div class="faq-toc-cta">
				<p>¿No encuentras tu respuesta?</p>
				<a href="/#contacto" class="faq-toc-link">Contáctanos</a>
			</div>
		</nav>

		<!-- Content -->
		<main class="faq-content">
			<!-- GENERAL -->
			<section class="faq-category" id="general">
				<div class="faq-category-header">
					<span class="faq-category-badge">01</span>
					<h2 class="faq-category-title">General</h2>
				</div>

				{#each [{ id: 'g1', q: '¿Qué es Geminis Labs?', a: 'Geminis Labs es una empresa tecnológica enfocada en soluciones de movilidad conectada, monitoreo, telemetría e integración IoT. Construimos plataformas que permiten rastrear, visualizar y operar activos en tiempo real, tanto para usuarios finales como para empresas y partners tecnológicos.' }, { id: 'g2', q: '¿Qué productos ofrece Geminis Labs?', a: null, items: ['<strong>Nexus</strong> — plataforma de monitoreo vehicular para usuarios individuales, familias y flotillas.', '<strong>Geminis TaaS (Telemetry as a Service)</strong> — infraestructura para partners que desean conectar su propio hardware a nuestra plataforma.', '<strong>Integraciones empresariales</strong> — APIs, TCP, MQTT y servicios white-label.', '<strong>Orion</strong> — próximo producto enfocado en inteligencia operativa y automatización.'] }, { id: 'g3', q: '¿Cuál es la diferencia entre Geminis Labs y Nexus?', a: '<strong>Geminis Labs</strong> es la empresa. <strong>Nexus</strong> es uno de nuestros productos. Piensa en Geminis Labs como la compañía que construye tecnología de movilidad, mientras que Nexus es la plataforma que utilizan usuarios y empresas para monitoreo vehicular, alertas, geocercas y telemetría.' }, { id: 'g4', q: '¿Necesito instalar hardware?', a: 'Depende del servicio. Para monitoreo vehicular con Nexus normalmente se requiere un dispositivo GPS compatible. En soluciones empresariales o TaaS también es posible integrar hardware existente, siempre que cumpla con los protocolos soportados.' }, { id: 'g5', q: '¿En qué países funciona?', a: 'Nuestra plataforma opera sobre infraestructura cloud y puede funcionar internacionalmente, sujeto a cobertura GPS, conectividad celular, disponibilidad del hardware y regulaciones locales aplicables. Si tienes una operación fuera de México, contáctanos para validar compatibilidad.' }, { id: 'g6', q: '¿Tienen apps móviles?', a: 'Sí. Nuestras plataformas están disponibles en iOS, Android y Web, dependiendo del plan o producto contratado.' }] as item (item.id)}
					<div class="faq-item" class:is-open={openItems.has(item.id)}>
						<button
							class="faq-question"
							onclick={() => toggle(item.id)}
							aria-expanded={openItems.has(item.id)}
						>
							<span>{item.q}</span>
							<svg class="faq-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M4 6l4 4 4-4"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
						{#if openItems.has(item.id)}
							<div class="faq-answer">
								{#if item.a}
									<p>{stripHtml(item.a)}</p>
								{/if}
								{#if item.items}
									<ul>
										{#each item.items as li (li)}
											<li>{stripHtml(li)}</li>
										{/each}
									</ul>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</section>

			<!-- NEXUS / USUARIOS FINALES -->
			<section class="faq-category" id="nexus">
				<div class="faq-category-header">
					<span class="faq-category-badge">02</span>
					<h2 class="faq-category-title">Nexus / Usuarios Finales</h2>
				</div>

				{#each [{ id: 'n1', q: '¿Cómo funciona Nexus?', a: 'Nexus conecta tu vehículo o activo a nuestra plataforma mediante hardware compatible. Una vez conectado puedes ver ubicación en tiempo real, consultar historial de recorridos, crear geocercas, recibir alertas, visualizar eventos relevantes y acceder desde móvil o navegador — todo desde una sola cuenta.' }, { id: 'n2', q: '¿Mi familiar sabrá que lo estoy monitoreando?', a: 'El uso legal y ético del monitoreo es responsabilidad del cliente. Geminis Labs no autoriza usos ilegales, invasivos o sin las autorizaciones correspondientes. Si el monitoreo involucra terceros, recomendamos cumplir con la legislación aplicable y actuar con transparencia.' }, { id: 'n3', q: '¿Qué pasa si desconectan el dispositivo?', a: 'Dependerá del hardware instalado. Muchos dispositivos generan eventos de desconexión, pérdida de energía, pérdida de señal o comportamiento anómalo. Cuando el hardware lo soporta, Nexus puede notificar estos eventos.' }, { id: 'n4', q: '¿Funciona con cualquier vehículo?', a: 'En la mayoría de los casos sí, siempre que exista hardware compatible. La compatibilidad puede variar según tipo de vehículo, protocolo del dispositivo, instalación requerida y capacidades del fabricante. Si tienes un caso específico, podemos validarlo.' }, { id: 'n5', q: '¿Qué tan precisa es la ubicación?', a: 'La precisión depende de la calidad del hardware, señal GPS, cobertura celular, condiciones urbanas e interferencia ambiental. En condiciones normales, la precisión suele ser adecuada para monitoreo operativo, pero no se garantiza exactitud absoluta.' }, { id: 'n6', q: '¿Recibo alertas en tiempo real?', a: 'Sí, cuando el flujo de datos y conectividad lo permiten. Podemos enviar alertas mediante push notifications, eventos internos e integraciones. La velocidad de entrega puede variar según red, hardware y proveedor.' }, { id: 'n7', q: '¿Puedo ver historial de recorridos?', a: null, items: ['Rutas y trayectos', 'Eventos relevantes', 'Tiempos en movimiento y detenido', 'Replay de recorrido'] }, { id: 'n8', q: '¿Puedo crear geocercas?', a: 'Sí. Puedes crear zonas de monitoreo para generar alertas cuando un vehículo entra, sale, permanece o viola reglas configuradas. Las capacidades pueden variar según producto y plan.' }] as item (item.id)}
					<div class="faq-item" class:is-open={openItems.has(item.id)}>
						<button
							class="faq-question"
							onclick={() => toggle(item.id)}
							aria-expanded={openItems.has(item.id)}
						>
							<span>{item.q}</span>
							<svg class="faq-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M4 6l4 4 4-4"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
						{#if openItems.has(item.id)}
							<div class="faq-answer">
								{#if item.a}
									<p>{stripHtml(item.a)}</p>
								{/if}
								{#if item.items}
									<ul>
										{#each item.items as li (li)}
											<li>{stripHtml(li)}</li>
										{/each}
									</ul>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</section>

			<!-- FLOTILLAS -->
			<section class="faq-category" id="flotillas">
				<div class="faq-category-header">
					<span class="faq-category-badge">03</span>
					<h2 class="faq-category-title">Flotillas</h2>
				</div>

				{#each [{ id: 'f1', q: '¿Puedo monitorear múltiples unidades?', a: 'Sí. Nexus está diseñado para operar desde una sola cuenta múltiples vehículos o activos. Puedes administrar desde pequeñas operaciones hasta flotillas empresariales.' }, { id: 'f2', q: '¿Qué reportes ofrece Nexus?', a: null, items: ['Recorridos y trayectos', 'Tiempos detenido y en movimiento', 'Actividad por unidad', 'Alertas y eventos operativos', 'Excepciones detectadas', 'Métricas de telemetría'] }, { id: 'f3', q: '¿Cómo funciona el control de combustible?', a: 'El análisis de combustible depende del hardware y datos disponibles. Según la integración, Nexus puede trabajar con consumo estimado, sensores dedicados, CAN bus, OBD o reglas operativas. La precisión depende del origen del dato.' }, { id: 'f4', q: '¿Puedo definir usuarios con distintos permisos?', a: null, items: ['Administrador', 'Supervisor', 'Operador', 'Usuario de solo lectura'] }, { id: 'f5', q: '¿Se integra con mis procesos actuales?', a: 'Sí. Podemos integrarnos con sistemas existentes mediante API REST, webhooks, exportación de datos, integraciones empresariales y TaaS.' }] as item (item.id)}
					<div class="faq-item" class:is-open={openItems.has(item.id)}>
						<button
							class="faq-question"
							onclick={() => toggle(item.id)}
							aria-expanded={openItems.has(item.id)}
						>
							<span>{item.q}</span>
							<svg class="faq-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M4 6l4 4 4-4"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
						{#if openItems.has(item.id)}
							<div class="faq-answer">
								{#if item.a}
									<p>{stripHtml(item.a)}</p>
								{/if}
								{#if item.items}
									<ul>
										{#each item.items as li (li)}
											<li>{stripHtml(li)}</li>
										{/each}
									</ul>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</section>

			<!-- PARTNERS / TaaS -->
			<section class="faq-category" id="partners">
				<div class="faq-category-header">
					<span class="faq-category-badge">04</span>
					<h2 class="faq-category-title">Partners / TaaS</h2>
				</div>

				{#each [{ id: 'p1', q: '¿Qué es Geminis TaaS?', a: 'Geminis TaaS (Telemetry as a Service) es nuestra infraestructura para partners tecnológicos. Permite que fabricantes, integradores o empresas conecten su propio hardware y utilicen nuestra plataforma, APIs y servicios sin construir toda la infraestructura desde cero. Comercialmente lo verás como <strong>Nexus Connect</strong> (conectas tu hardware) y <strong>Nexus Platform</strong> (operas la plataforma con tu marca): el detalle técnico está en <a href="/products/nexus/partners">Nexus para partners</a>.' }, { id: 'p2', q: '¿Puedo conectar mi propio hardware?', a: 'Sí. Si tu hardware puede transmitir datos mediante protocolos compatibles, podemos evaluar integración.' }, { id: 'p3', q: '¿Aceptan TCP?', a: 'Sí. Soportamos integración vía TCP para dispositivos que transmiten telemetría mediante sockets personalizados o protocolos compatibles.' }, { id: 'p4', q: '¿Aceptan MQTT?', a: 'Sí. Geminis TaaS soporta integración vía MQTT para escenarios IoT y telemetría distribuida.' }, { id: 'p5', q: '¿Tienen API REST?', a: 'Sí. Disponemos de APIs para integración y consumo de datos según el caso de uso y plan contratado.' }, { id: 'p6', q: '¿Manejan webhooks?', a: 'Sí. Podemos emitir eventos hacia sistemas externos para automatización e integración operativa.' }, { id: 'p7', q: '¿Qué formato de datos aceptan?', a: null, items: ['JSON', 'Payloads estructurados', 'Protocolos propietarios', 'TCP custom', 'MQTT messages'] }, { id: 'p8', q: '¿Ofrecen white-label?', a: 'Sí, es la modalidad <strong>Nexus Platform</strong>: tu logotipo, tu dominio, tus planes, tus clientes y tu facturación, sobre nuestra infraestructura. Disponibilidad según acuerdo comercial. Ver <a href="/products/nexus/partners#marca">qué incluye exactamente</a>.' }, { id: 'p9', q: '¿Cuánto tarda una integración?', a: 'Depende de la complejidad. Integraciones simples pueden tomar pocos días; hardware compatible existente permite implementación rápida; protocolos propietarios requieren mayor tiempo. Nuestro objetivo es acelerar el time-to-market lo más posible.' }] as item (item.id)}
					<div class="faq-item" class:is-open={openItems.has(item.id)}>
						<button
							class="faq-question"
							onclick={() => toggle(item.id)}
							aria-expanded={openItems.has(item.id)}
						>
							<span>{item.q}</span>
							<svg class="faq-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M4 6l4 4 4-4"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
						{#if openItems.has(item.id)}
							<div class="faq-answer">
								{#if item.a}
									<p>{stripHtml(item.a)}</p>
								{/if}
								{#if item.items}
									<ul>
										{#each item.items as li (li)}
											<li>{stripHtml(li)}</li>
										{/each}
									</ul>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</section>
		</main>
	</div>

	<Footer />
</div>

<style>
	/* ── Page shell ─────────────────────────────────────────── */
	.faq-page {
		background: #f8fafc;
		color: #0f172a;
		font-family: 'Outfit', sans-serif;
		min-height: 100vh;
	}

	/* ── Hero ───────────────────────────────────────────────── */
	.faq-hero {
		background: #ffffff;
		border-bottom: 1px solid #e2e8f0;
		padding: 4rem 2rem 3rem;
	}

	.faq-hero-inner {
		max-width: 1100px;
		margin: 0 auto;
	}

	.faq-eyebrow {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #00a6c0;
		display: block;
		margin-bottom: 0.875rem;
	}

	.faq-h1 {
		font-family: 'Audiowide', sans-serif;
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 0.75rem;
		letter-spacing: -0.01em;
	}

	.faq-subtitle {
		font-size: 1rem;
		color: #64748b;
		margin: 0;
		line-height: 1.6;
	}

	/* ── Body layout ────────────────────────────────────────── */
	.faq-body {
		max-width: 1100px;
		margin: 0 auto;
		padding: 3rem 2rem 6rem;
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 5rem;
		align-items: start;
	}

	/* ── TOC ────────────────────────────────────────────────── */
	.faq-toc {
		position: sticky;
		top: 88px;
	}

	.faq-toc-label {
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #94a3b8;
		display: block;
		margin-bottom: 0.875rem;
	}

	.faq-toc-list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-left: 1px solid #e2e8f0;
	}

	.faq-toc-list li a {
		display: block;
		padding: 0.4rem 0.75rem;
		font-size: 0.8rem;
		color: #64748b;
		text-decoration: none;
		border-left: 3px solid transparent;
		margin-left: -1px;
		line-height: 1.5;
		transition:
			color 0.2s,
			border-color 0.2s,
			background 0.2s;
	}

	.faq-toc-list li a:hover {
		color: #0369a1;
	}

	.faq-toc-list li a.is-active {
		color: #0369a1;
		font-weight: 600;
		border-left-color: #00a6c0;
		background: rgba(0, 166, 192, 0.06);
		border-radius: 0 4px 4px 0;
	}

	.faq-toc-cta {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e2e8f0;
	}

	.faq-toc-cta p {
		font-size: 0.775rem;
		color: #94a3b8;
		margin: 0 0 0.5rem;
		line-height: 1.5;
	}

	.faq-toc-link {
		font-size: 0.8rem;
		font-weight: 600;
		color: #00a6c0;
		text-decoration: none;
		transition: color 0.2s;
	}

	.faq-toc-link:hover {
		color: #0369a1;
	}

	/* ── Content ────────────────────────────────────────────── */
	.faq-content {
		min-width: 0;
	}

	/* ── Category section ───────────────────────────────────── */
	.faq-category {
		display: block;
		margin-bottom: 3.5rem;
		scroll-margin-top: 100px;
	}

	.faq-category-header {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.faq-category-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: #e0f2fe;
		border: 1px solid rgba(0, 166, 192, 0.2);
		font-family: 'JetBrains Mono', 'Courier New', monospace;
		font-size: 0.7rem;
		font-weight: 600;
		color: #0369a1;
		flex-shrink: 0;
	}

	.faq-category-title {
		font-family: 'Audiowide', sans-serif;
		font-size: 1rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0;
		letter-spacing: -0.01em;
	}

	/* ── FAQ item (accordion) ───────────────────────────────── */
	.faq-item {
		border-bottom: 1px solid #e2e8f0;
	}

	.faq-item:first-of-type {
		border-top: none;
	}

	.faq-question {
		width: 100%;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.125rem 0;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		font-family: 'Outfit', sans-serif;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #1e293b;
		line-height: 1.5;
		transition: color 0.2s;
	}

	.faq-question:hover {
		color: #00a6c0;
	}

	.faq-item.is-open .faq-question {
		color: #00a6c0;
	}

	.faq-chevron {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: #94a3b8;
		margin-top: 2px;
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.faq-item.is-open .faq-chevron {
		transform: rotate(180deg);
		color: #00a6c0;
	}

	.faq-answer {
		padding: 0 0 1.25rem;
	}

	.faq-answer p {
		font-size: 0.9375rem;
		color: #475569;
		line-height: 1.8;
		margin: 0 0 0.75rem;
	}

	.faq-answer p:last-child {
		margin-bottom: 0;
	}

	.faq-answer ul {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.faq-answer ul li {
		font-size: 0.9rem;
		color: #475569;
		line-height: 1.7;
		padding-left: 1.1rem;
		position: relative;
	}

	.faq-answer ul li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.58em;
		width: 5px;
		height: 5px;
		background: #00a6c0;
		border-radius: 1px;
		transform: rotate(45deg);
	}

	/* ── Responsive ─────────────────────────────────────────── */
	@media (max-width: 1023px) {
		.faq-body {
			grid-template-columns: 1fr;
			gap: 0;
			padding: 2rem 1.5rem 4rem;
		}

		.faq-toc {
			display: none;
		}
	}

	@media (max-width: 640px) {
		.faq-hero {
			padding: 3rem 1.25rem 2rem;
		}

		.faq-body {
			padding: 1.5rem 1.25rem 3rem;
		}

		.faq-category-title {
			font-size: 0.9rem;
		}
	}
</style>
