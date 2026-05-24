<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import './nexus.css';

	// SEO
	const pageTitle = 'Nexus by Geminis Labs - Inteligencia Vehicular en Tiempo Real';
	const pageDescription =
		'Plataforma avanzada de rastreo GPS, telemetría y control de flotas para familias, flotillas y partners TaaS. Nexus by GeminisLabs.';

	let scrollY = $state(0);
	let isImageLoaded = $state(false);
	let loadingProgress = $state(0);

	// Orbital HUD Logic
	let hudData = $state({
		lat: '19.4326',
		lon: '-99.1332',
		unit: 'MX-0391 Distribución Norte',
		status: 'EN RUTA',
		speed: '87 km/h',
		alert: 'Ninguna'
	});

	// Sys-Position Logic
	let hasScrolled = $state(false);
	let isIdle = $state(false);
	let velocity = $state(0);
	let lastScrollY = 0;
	let lastTime = Date.now();
	let velocityTimeout;
	let idleTimeout;

	const sysLat = $derived(
		`20.${Math.floor(scrollY % 10000)
			.toString()
			.padStart(4, '0')}`
	);
	const sysLon = $derived(
		`-99.${Math.floor((scrollY * 3) % 10000)
			.toString()
			.padStart(4, '0')}`
	);
	const sysAlt = $derived(`${Math.floor(scrollY * 2)}m`);
	const sysVel = $derived(`${velocity} units/s`);

	$effect(() => {
		if (scrollY !== lastScrollY) {
			if (!hasScrolled) hasScrolled = true;
			isIdle = false;

			const now = Date.now();
			const dt = (now - lastTime) / 1000;
			if (dt > 0) {
				velocity = Math.round(Math.abs(scrollY - lastScrollY) / dt);
			}
			lastScrollY = scrollY;
			lastTime = now;

			clearTimeout(velocityTimeout);
			velocityTimeout = setTimeout(() => {
				velocity = 0;
			}, 150);

			clearTimeout(idleTimeout);
			idleTimeout = setTimeout(() => {
				isIdle = true;
			}, 2000);
		}
	});

	// Transitions Logic based on scrollY and Viewport Height (ih)
	let heroOpacity = $derived.by(() => {
		if (typeof window === 'undefined') return 1;
		const ih = window.innerHeight;
		if (scrollY < ih * 0.1) return 1;
		if (scrollY < ih * 0.8) return 1 - (scrollY - ih * 0.1) / (ih * 0.7);
		return 0;
	});

	let heroTranslateY = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		return (scrollY / window.innerHeight) * -100;
	});

	let themeProgress = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		const ih = window.innerHeight;
		if (scrollY < ih * 1.5) return 0;
		return Math.min(1, (scrollY - ih * 1.5) / (ih * 1.0));
	});

	// ── FAQ State ──────────────────────────────────────────────────────────────
	let faqTab = $state('familias');

	const faqData = {
		familias: [
			{
				q: '¿Mi familiar va a saber que lo estoy rastreando?',
				a: 'Nexus te da control total sobre la visibilidad del monitoreo. Puedes configurarlo para que sea visible (transparencia con tu familia) o discreto. La decisión es completamente tuya.'
			},
			{
				q: '¿Qué pasa si desconectan el dispositivo?',
				a: 'Nexus genera una alerta automática cuando el dispositivo pierde alimentación de forma inesperada. Recibes la última posición registrada y el momento exacto en que ocurrió.'
			},
			{
				q: '¿Funciona con cualquier marca o modelo de auto?',
				a: 'Compatible con cualquier vehículo con puerto OBD-II, que incluye prácticamente todos los autos fabricados a partir del año 2000.'
			},
			{
				q: '¿Cuántos vehículos puedo tener en mi cuenta?',
				a: 'Una cuenta Nexus puede gestionar múltiples vehículos. Ves todos en el mismo mapa, con alertas independientes y control de quién accede a cada uno.'
			}
		],
		flotillas: [
			{
				q: '¿Puedo exportar los reportes a Excel o PDF?',
				a: 'Sí. Los reportes operacionales son exportables en formato Excel y PDF. Puedes programar envíos automáticos o generarlos bajo demanda.'
			},
			{
				q: '¿Cuántos administradores puede tener mi cuenta?',
				a: 'Sin límite restrictivo. Administrador general, supervisores regionales, operadores con vista limitada — permisos configurables por rol y por vehículo.'
			},
			{
				q: '¿Se integra con nuestro ERP o sistema de gestión?',
				a: 'Nexus cuenta con API para clientes de flotilla que necesitan conectividad con sistemas externos. Contacta a nuestro equipo para evaluar tu integración específica.'
			},
			{
				q: '¿Qué pasa si un vehículo opera sin señal celular?',
				a: 'El dispositivo guarda los datos localmente y los sincroniza automáticamente cuando recupera señal. El historial de ruta queda completo, sin huecos.'
			}
		],
		partners: [
			{
				q: '¿Qué hardware es compatible con la integración TaaS?',
				a: 'Cualquier dispositivo que pueda enviar datos en formato JSON con campos de posición (lat, lon, timestamp). Si tu dispositivo puede enviar datos por HTTP o MQTT, la integración es directa.'
			},
			{
				q: '¿Cómo se protegen los datos de mis clientes?',
				a: 'TLS en tránsito, AES-256 en reposo. Tus clientes son tus clientes — su información no se comparte con terceros. Acuerdo de confidencialidad disponible durante el onboarding.'
			},
			{
				q: '¿Cuánto tiempo toma la integración?',
				a: 'Un equipo técnico con experiencia básica en APIs completa la integración en 1 a 3 días hábiles. Nuestro equipo de integraciones te acompaña en cada paso.'
			}
		]
	};

	let openFaq = $state({ familias: null, flotillas: null, partners: null });

	function toggleFaq(tab, index) {
		openFaq[tab] = openFaq[tab] === index ? null : index;
	}

	// ── Flotillas vertical tab ─────────────────────────────────────────────────
	let activeVertical = $state(0);

	const flotillaVerticals = [
		{
			label: 'Distribución',
			problem: 'Rutas ineficientes + combustible desperdiciado'
		},
		{
			label: 'Paquetería',
			problem: 'Prueba de entrega automatizada'
		},
		{
			label: 'Construcción',
			problem: 'Alertas de robo fuera de horario'
		},
		{
			label: 'Seguridad',
			problem: 'Verificación de rondines con historial'
		},
		{
			label: 'Corporativo',
			problem: 'Detección de uso no autorizado'
		}
	];

	onMount(() => {
		window.scrollTo({ top: 0, behavior: 'instant' });

		const img = new Image();
		img.src = '/img/products/nexus/hero-bg.png';
		const progressInterval = setInterval(() => {
			if (loadingProgress < 90) loadingProgress += Math.random() * 15;
		}, 200);
		img.onload = () => {
			loadingProgress = 100;
			setTimeout(() => {
				isImageLoaded = true;
				clearInterval(progressInterval);
			}, 500);
		};

		const interval = setInterval(() => {
			hudData.lat = (19 + Math.random() * 2).toFixed(4);
			hudData.lon = (-99 + Math.random() * 2).toFixed(4);
			hudData.speed = Math.floor(70 + Math.random() * 60) + ' km/h';
		}, 1000);

		// Scroll reveal for new sections
		const revealObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						revealObserver.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
		);
		document.querySelectorAll('.reveal-on-scroll').forEach((el) => revealObserver.observe(el));

		return () => {
			clearInterval(interval);
			clearInterval(progressInterval);
			revealObserver.disconnect();
		};
	});
</script>

<svelte:window bind:scrollY />

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Audiowide&family=Revalia&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="nexus-page-container" style="--theme-progress: {themeProgress}">
	<Navbar />

	<div class="sys-position-hud" class:active={hasScrolled && !isIdle}>
		<div class="sys-title">SYS.POSITION</div>
		<div class="sys-data-group">
			<div class="sys-row"><span class="label">LAT:</span><span class="value">{sysLat}</span></div>
			<div class="sys-row"><span class="label">LON:</span><span class="value">{sysLon}</span></div>
			<div class="sys-row"><span class="label">ALT:</span><span class="value">{sysAlt}</span></div>
			<div class="sys-row"><span class="label">VEL:</span><span class="value">{sysVel}</span></div>
		</div>
	</div>

	<main class="nexus-page">
		<!-- 1. HERO -->
		<section class="hero-initial-container">
			{#if !isImageLoaded}
				<div class="nexus-loader-overlay">
					<div class="loader-content">
						<div class="loader-logo">
							<div class="loader-ring"></div>
							<div class="loader-core"></div>
						</div>
						<div class="loader-status">
							<span class="glitch-text" data-text="ESTABLISHING CONNECTION"
								>ESTABLISHING CONNECTION</span
							>
							<div class="progress-bar">
								<div class="progress-fill" style="width: {loadingProgress}%"></div>
							</div>
							<span class="loading-detail"
								>INICIALIZANDO NEXUS... {Math.floor(loadingProgress)}%</span
							>
						</div>
					</div>
					<div class="scan-line-loader"></div>
				</div>
			{/if}
			<div
				class="hero-scroll-wrapper"
				style="opacity: {heroOpacity}; transform: translateY({heroTranslateY}px); z-index: 2; visibility: {isImageLoaded
					? 'visible'
					: 'hidden'}"
			>
				<div class="hero-bg-image"></div>

				<!-- Orbital Rings Overlay -->
				<div class="orbital-overlay">
					<div class="orbital-center">
						<div class="orbital-ring nexus-hero-ring-1"></div>
						<div class="orbital-ring nexus-hero-ring-2"></div>
						<div class="orbital-ring nexus-hero-ring-3"></div>
					</div>
					<div class="hud-data top-left">
						<span class="label">UNIDAD</span><span class="value">{hudData.unit}</span>
					</div>
					<div class="hud-data top-right">
						<span class="label">STATUS</span><span class="value">{hudData.status}</span>
					</div>
					<div class="hud-data bottom-left">
						<span class="label">VEL</span><span class="value">{hudData.speed}</span>
					</div>
					<div class="hud-data bottom-right">
						<span class="label">ALERTA</span><span class="value">{hudData.alert}</span>
					</div>
				</div>

				<!-- Hero Text Overlay -->
				<div class="hero-text-overlay" class:hero-text-visible={isImageLoaded}>
					<div class="hero-status-pill">
						<span class="hero-status-dot"></span>
						RASTREO EN VIVO
					</div>
					<h1 class="hero-headline">Sabe exactamente<br />dónde están.</h1>
					<p class="hero-sub">Nexus convierte cada vehículo en inteligencia en tiempo real.</p>
					<div class="hero-cta-row">
						<a href="#segmentos" class="btn-hero-primary">Ver para quién es Nexus</a>
						<a href="#demo-form" class="btn-hero-secondary">Ver una demo</a>
					</div>
				</div>

				<!-- Scroll Cue -->
				<div class="hero-scroll-cue" class:hero-text-visible={isImageLoaded} aria-hidden="true">
					<div class="scroll-cue-line"></div>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M6 9l6 6 6-6" />
					</svg>
				</div>
			</div>
		</section>

		<!-- 3. VALUE PROPOSITION BANNER -->
		<section class="value-prop-section" id="inicio">
			<div class="value-prop-inner reveal-on-scroll">
				<h2 class="value-prop-headline">Sabe exactamente dónde están.</h2>
				<p class="value-prop-sub">
					Nexus convierte cada vehículo en inteligencia en tiempo real — para tu familia, tu
					flotilla y tu negocio.
				</p>
				<div class="value-prop-badges">
					<span class="vp-badge">Familias</span>
					<span class="vp-badge-sep" aria-hidden="true">|</span>
					<span class="vp-badge">Flotillas</span>
					<span class="vp-badge-sep" aria-hidden="true">|</span>
					<span class="vp-badge">Partners TaaS</span>
				</div>
			</div>
		</section>

		<!-- 4. THREE SEGMENTS -->
		<section class="segments-section" id="segmentos">
			<div class="container">
				<div class="segments-grid">
					<!-- FAMILIAS -->
					<div class="segment-card familias reveal-on-scroll" id="familias">
						<div class="segment-eyebrow">Para Familias</div>
						<h3 class="segment-headline">Protege a quien quieres. Sabe dónde están, siempre.</h3>
						<p class="segment-desc">
							Nexus te avisa si alguien sale de su ruta, llega a donde no debe, o si el carro se
							mueve sin permiso. Control total, sin ser invasivo.
						</p>

						<ul class="segment-usecases">
							<li>Tu hijo adolescente maneja solo — sabes si llegó bien y a qué velocidad fue</li>
							<li>Prestaste el auto a un empleado — confirma que lo usa solo para el trabajo</li>
							<li>Tus padres adultos mayores salen solos — llegaron sin contratiempos</li>
							<li>Tu auto de valor está en la calle — cualquier movimiento inesperado te alerta</li>
						</ul>

						<div class="segment-pain">
							<span class="pain-icon">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
									/></svg
								>
							</span>
							<p>
								En México se roban más de 100,000 vehículos al año. La mayoría de los dueños no
								saben hasta horas después.
							</p>
						</div>

						<div class="segment-resolution">
							Con Nexus, sabes exactamente dónde está tu vehículo y quién lo mueve, desde tu
							teléfono, en segundos.
						</div>

						<a href="#download" class="btn-segment primary">Descargar la App</a>
					</div>

					<!-- FLOTILLAS -->
					<div class="segment-card featured flotillas reveal-on-scroll" id="flotillas">
						<div class="segment-badge">Más popular</div>
						<div class="segment-eyebrow">Para Flotillas</div>
						<h3 class="segment-headline">Tu operación no para. Tu visibilidad tampoco.</h3>
						<p class="segment-desc">
							Conoce el estado real de cada vehículo: dónde está, cómo se comporta, cuánto consume —
							ahora mismo. Las flotillas pierden entre el 20 y el 30% de su presupuesto operativo en
							ineficiencias perfectamente prevenibles.
						</p>

						<div class="flotilla-verticals">
							{#each flotillaVerticals as v, i (v.label)}
								<button
									class="vertical-chip"
									class:active={activeVertical === i}
									onclick={() => (activeVertical = i)}
								>
									{v.label}
								</button>
							{/each}
						</div>
						<div class="vertical-problem">
							{flotillaVerticals[activeVertical].problem}
						</div>

						<div class="segment-roi">
							Una flota de 20 vehículos puede ahorrar entre $192,000 y $270,000 MXN al año solo en
							combustible.
						</div>

						<a href="#demo-form" class="btn-segment primary">Agendar una Demo</a>
					</div>

					<!-- PARTNERS TAAS -->
					<div class="segment-card partners reveal-on-scroll" id="partners">
						<div class="segment-eyebrow">Para Partners TaaS</div>
						<h3 class="segment-headline">Tu hardware ya funciona. Ahora dale la app que merece.</h3>
						<p class="segment-desc">
							Conéctate a Nexus enviando JSON desde tus dispositivos y ofrece a tus clientes una
							plataforma completa — sin escribir una sola línea de front-end.
						</p>

						<div class="partner-lists">
							<div class="partner-list-col">
								<div class="partner-list-label gets">Lo que obtienen</div>
								<ul class="partner-checklist gets">
									<li>Apps nativas (iOS, Android, Web)</li>
									<li>Telemetría en tiempo real</li>
									<li>Reportes y alertas</li>
									<li>Control de permisos</li>
								</ul>
							</div>
							<div class="partner-list-col">
								<div class="partner-list-label noget">Lo que no hacen</div>
								<ul class="partner-checklist noget">
									<li>Sin cambio de hardware</li>
									<li>Sin desarrollo de app</li>
									<li>Sin infraestructura propia</li>
								</ul>
							</div>
						</div>

						<a href="#partner-contact" class="btn-segment secondary">Contactar al Equipo</a>
					</div>
				</div>
			</div>
		</section>

		<!-- 5. FEATURES -->
		<section class="features-section" id="features">
			<div class="container">
				<h2 class="section-title">Todo lo que necesitas, en una sola plataforma</h2>
				<p class="section-subtitle">Ocho capacidades clave diseñadas para el mundo real.</p>

				<div class="features-grid">
					<div class="feature-item reveal-on-scroll">
						<div class="feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><circle cx="12" cy="12" r="3" /><path
									d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"
								/></svg
							>
						</div>
						<h4>Monitoreo en tiempo real</h4>
						<p>
							Posición exacta, velocidad y estado del motor de cada vehículo, actualizado al
							momento.
						</p>
					</div>
					<div class="feature-item reveal-on-scroll">
						<div class="feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path
									d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
								/></svg
							>
						</div>
						<h4>Historial con replay</h4>
						<p>
							Reproduce el recorrido completo de cualquier vehículo en cualquier día, con cronología
							exacta.
						</p>
					</div>
					<div class="feature-item reveal-on-scroll">
						<div class="feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle
									cx="12"
									cy="10"
									r="3"
								/></svg
							>
						</div>
						<h4>Geocercas de precisión</h4>
						<p>
							Zonas de operación con tecnología de precisión de siguiente generación — cero falsos
							positivos.
						</p>
					</div>
					<div class="feature-item reveal-on-scroll">
						<div class="feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path
									d="M13.73 21a2 2 0 01-3.46 0"
								/></svg
							>
						</div>
						<h4>Alertas inteligentes</h4>
						<p>Notificaciones push para encendido, salida de zona, velocidad o pérdida de señal.</p>
					</div>
					<div class="feature-item reveal-on-scroll">
						<div class="feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path
									d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/></svg
							>
						</div>
						<h4>Reportes operacionales</h4>
						<p>Combustible, km, tiempo y batería — exportables a PDF/Excel.</p>
					</div>
					<div class="feature-item reveal-on-scroll">
						<div class="feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle
									cx="9"
									cy="7"
									r="4"
								/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg
							>
						</div>
						<h4>Control de permisos</h4>
						<p>
							Cada usuario ve solo lo que debe ver. Conductor, supervisor, admin — cada rol, su
							vista.
						</p>
					</div>
					<div class="feature-item reveal-on-scroll">
						<div class="feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line
									x1="12"
									y1="18"
									x2="12.01"
									y2="18"
								/></svg
							>
						</div>
						<h4>Apps nativas</h4>
						<p>iPhone, Android y Web. Construidas para cada plataforma, no adaptadas.</p>
					</div>
					<div class="feature-item reveal-on-scroll">
						<div class="feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg
							>
						</div>
						<h4>Integración TaaS via JSON</h4>
						<p>
							Conecta tu hardware existente en días. Sin cambiar equipos, sin infraestructura
							propia.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- 6. DIFFERENTIATORS -->
		<section class="diff-section" id="diferenciadores">
			<div class="container">
				<h2 class="section-title">Por qué Nexus y no otro</h2>
				<p class="section-subtitle">Ventajas reales, no promesas de marketing.</p>

				<div class="diff-list">
					<div class="diff-item reveal-on-scroll">
						<div class="diff-number">01</div>
						<div class="diff-content">
							<h4>Zonificación de precisión milimétrica</h4>
							<p>
								La mayoría de las plataformas GPS usan círculos aproximados. Nexus utiliza
								tecnología de zonificación de siguiente generación — la misma que usan las
								plataformas de movilidad más exigentes del mundo — para definir perímetros exactos,
								formas complejas, sin falsos positivos.
							</p>
						</div>
					</div>
					<div class="diff-item reveal-on-scroll">
						<div class="diff-number">02</div>
						<div class="diff-content">
							<h4>Telemetría real. No solo un punto en el mapa.</h4>
							<p>
								Monitorea batería del vehículo, calidad de señal, consumo de combustible calculado y
								comportamiento — datos que revelan el estado real de tu activo.
							</p>
						</div>
					</div>
					<div class="diff-item reveal-on-scroll">
						<div class="diff-number">03</div>
						<div class="diff-content">
							<h4>Privacidad granular por usuario</h4>
							<p>
								Control exacto de qué usuario puede ver qué vehículo. Conductor, supervisor
								regional, administrador global — cada rol tiene su vista, sin configuraciones
								complicadas.
							</p>
						</div>
					</div>
					<div class="diff-item reveal-on-scroll">
						<div class="diff-number">04</div>
						<div class="diff-content">
							<h4>App nativa. La diferencia se siente.</h4>
							<p>
								Nexus no es un navegador web disfrazado de app. Construida desde cero para iOS y
								Android — mapas fluidos, notificaciones confiables, sin fricciones cuando más la
								necesitas.
							</p>
						</div>
					</div>
					<div class="diff-item reveal-on-scroll">
						<div class="diff-number">05</div>
						<div class="diff-content">
							<h4>TaaS: tu hardware, nuestra plataforma</h4>
							<p>
								Si ya tienes dispositivos GPS, Nexus recibe sus datos vía JSON. Sin cambiar
								hardware, sin desarrollar app. Tu cliente ve todo desde el primer día.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 7. SOCIAL PROOF -->
		<section class="proof-section" id="clientes">
			<div class="container">
				<!-- Stats Bar -->
				<div class="stats-bar">
					<div class="stat-item reveal-on-scroll">
						<span class="stat-number">10,000+</span>
						<span class="stat-label">Vehículos bajo control</span>
					</div>
					<div class="stat-divider"></div>
					<div class="stat-item reveal-on-scroll">
						<span class="stat-number">500+</span>
						<span class="stat-label">Clientes activos</span>
					</div>
					<div class="stat-divider"></div>
					<div class="stat-item reveal-on-scroll">
						<span class="stat-number">4.8<span class="stat-star">★</span></span>
						<span class="stat-label">Calificación en tiendas</span>
					</div>
				</div>

				<!-- Testimonials -->
				<div class="testimonials-grid">
					<div class="testimonial-card reveal-on-scroll">
						<div class="testimonial-quote">"</div>
						<p>
							Tengo tres hijos y dos carros que les presto. Ahora sé exactamente dónde están y me
							avisa si se salen de la ruta. Nexus me devolvió la calma.
						</p>
						<div class="testimonial-author">
							<span class="author-name">Madre de familia</span>
							<span class="author-role">Monterrey</span>
						</div>
					</div>
					<div class="testimonial-card featured reveal-on-scroll">
						<div class="testimonial-quote">"</div>
						<p>
							En los primeros dos meses bajamos el desperdicio de combustible de 12% a menos del 2%.
							Los números hablan solos.
						</p>
						<div class="testimonial-author">
							<span class="author-name">Director de Operaciones</span>
							<span class="author-role">Empresa de distribución</span>
						</div>
					</div>
					<div class="testimonial-card reveal-on-scroll">
						<div class="testimonial-quote">"</div>
						<p>
							Desde que pusimos Nexus, no hemos tenido un solo robo. Las zonas de alerta nos avisan
							de madrugada si algo se mueve.
						</p>
						<div class="testimonial-author">
							<span class="author-name">Gerente de Proyectos</span>
							<span class="author-role">Constructora</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 8. FAQ -->
		<section class="faq-section" id="faq">
			<div class="container">
				<h2 class="section-title">Preguntas frecuentes</h2>
				<p class="section-subtitle">Respuestas claras, sin rodeos.</p>

				<div class="faq-tabs">
					<button
						class="faq-tab-btn"
						class:active={faqTab === 'familias'}
						onclick={() => {
							faqTab = 'familias';
						}}>Familias</button
					>
					<button
						class="faq-tab-btn"
						class:active={faqTab === 'flotillas'}
						onclick={() => {
							faqTab = 'flotillas';
						}}>Flotillas</button
					>
					<button
						class="faq-tab-btn"
						class:active={faqTab === 'partners'}
						onclick={() => {
							faqTab = 'partners';
						}}>Técnico / Partners</button
					>
				</div>

				<div class="faq-accordion">
					{#each faqData[faqTab] as item, i (item.q)}
						<div class="faq-entry" class:open={openFaq[faqTab] === i}>
							<button
								class="faq-question"
								onclick={() => toggleFaq(faqTab, i)}
								aria-expanded={openFaq[faqTab] === i}
							>
								<span>{item.q}</span>
								<span class="faq-chevron">{openFaq[faqTab] === i ? '−' : '+'}</span>
							</button>
							{#if openFaq[faqTab] === i}
								<div class="faq-answer">
									<p>{item.a}</p>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 9. THREE CTAs -->
		<section class="cta-section" id="cta">
			<div class="container">
				<div class="cta-grid">
					<!-- Familias CTA -->
					<div class="cta-card reveal-on-scroll">
						<div class="cta-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline
									points="9 22 9 12 15 12 15 22"
								/></svg
							>
						</div>
						<h3 class="cta-card-title">Para tu familia</h3>
						<p class="cta-card-sub">
							Descarga la app y empieza en minutos. Sin contratos forzosos.
						</p>
						<div class="cta-card-actions">
							<a href="#download" class="btn-cta-store">
								<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"
									><path
										d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
									/></svg
								>
								App Store
							</a>
							<a href="#download" class="btn-cta-store">
								<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"
									><path
										d="M3.18 23.76c.3.17.65.18.96.03L16.53 12 12 7.47 3.18 23.76zm16.65-11.4L17.7 11.2 14.94 12l2.76.8 2.13-1.16c.82-.47.82-1.57 0-2.04v.76zM3.34.31c-.3-.15-.65-.14-.96.03L12 12l4.53-4.53L3.34.31zm8.13 12.17L3.18.31C2.36.78 2.36 1.88 2.36 1.88l8.82 10.6z"
									/></svg
								>
								Google Play
							</a>
						</div>
					</div>

					<!-- Flotillas CTA -->
					<div class="cta-card featured reveal-on-scroll">
						<div class="cta-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><rect x="1" y="3" width="15" height="13" /><polygon
									points="16 8 20 8 23 11 23 16 16 16 16 8"
								/><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg
							>
						</div>
						<div class="cta-badge">Empieza hoy</div>
						<h3 class="cta-card-title">Para tu flotilla</h3>
						<p class="cta-card-sub">
							Te mostramos cómo Nexus se adapta a tu operación — en 30 minutos.
						</p>
						<div class="cta-card-actions">
							<a href="#demo-form" class="btn-cta-primary">Agendar una Demo</a>
						</div>
					</div>

					<!-- Partners CTA -->
					<div class="cta-card reveal-on-scroll">
						<div class="cta-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg
							>
						</div>
						<h3 class="cta-card-title">Para Partners</h3>
						<p class="cta-card-sub">
							Habla con nuestro equipo técnico y pon en marcha tu primera integración esta semana.
						</p>
						<div class="cta-card-actions">
							<a href="#partner-contact" class="btn-cta-secondary">Contactar al Equipo</a>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 10. LEGAL / TRANSPARENCY -->
		<section class="legal-section reveal-on-scroll" id="legal">
			<div class="container">
				<h2 class="legal-heading">Transparencia y confianza</h2>
				<p class="legal-sub">
					En Nexus tomamos en serio la privacidad de tus datos y los de quienes monitoreas.
				</p>
				<nav class="legal-links" aria-label="Documentos legales">
					<a href="/legal/terminos" class="legal-link">Términos de Uso</a>
					<span class="legal-sep" aria-hidden="true">|</span>
					<a href="/legal/privacidad" class="legal-link">Política de Privacidad</a>
					<span class="legal-sep" aria-hidden="true">|</span>
					<a href="/legal/aviso" class="legal-link">Aviso Legal</a>
				</nav>
				<p class="legal-note">
					Los precios no incluyen IVA. Disponibilidad sujeta a cobertura de red en tu región. Nexus
					es una plataforma de Geminis Labs.
				</p>
			</div>
		</section>
	</main>

	<Footer />
</div>
