<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import './nexus.css';

	// SEO
	const pageTitle = 'Nexus by Geminis Labs - Inteligencia Vehicular en Tiempo Real';
	const pageDescription =
		'Plataforma avanzada de rastreo GPS, telemetría y control de flotas. TrackGo, FleetGuard y Nexus Core by GeminisLabs';

	let scrollY = $state(0);
	let isImageLoaded = $state(false);
	let loadingProgress = $state(0);

	// Orbital HUD Logic
	let hudData = $state({
		lat: '19.4326',
		lon: '-99.1332',
		alt: '2240m',
		speed: '0 km/h',
		status: 'ONLINE'
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

	let logoOpacity = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		const ih = window.innerHeight;
		// SECTION 2 starts at 100vh. It becomes sticky exactly at 100vh.
		// We start revealing the logo at 120vh (already locked at top)
		if (scrollY < ih * 1.2) return 0;
		if (scrollY < ih * 2.0) return Math.min(1, Math.max(0, (scrollY - ih * 1.2) / (ih * 0.8))); // Fade in over 0.8 viewport
		if (scrollY < ih * 3.5) return 1; // Stay visible
		if (scrollY < ih * 4.5) return Math.max(0, 1 - (scrollY - ih * 3.5) / (ih * 1.0)); // Fade out smoothly over 1.0 viewport
		return 0;
	});

	let themeProgress = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		const ih = window.innerHeight;
		// Theme shift starts after logo and taglines are well into their sequence
		if (scrollY < ih * 6.5) return 0;
		return Math.min(1, (scrollY - ih * 6.5) / (ih * 1.0));
	});

	// Tagline 1 Logic
	let tagline1Opacity = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		const ih = window.innerHeight;
		if (scrollY < ih * 4.2) return 0;
		if (scrollY < ih * 5.0) return (scrollY - ih * 4.2) / (ih * 0.8);
		if (scrollY < ih * 6.5) return 1;
		if (scrollY < ih * 7.5) return Math.max(0, 1 - (scrollY - ih * 6.5) / (ih * 1.0));
		return 0;
	});

	let tagline1TranslateY = $derived.by(() => {
		if (typeof window === 'undefined') return 20;
		const ih = window.innerHeight;
		if (scrollY < ih * 4.2) return 20;
		if (scrollY < ih * 5.0) return 20 - ((scrollY - ih * 4.2) / (ih * 0.8)) * 20;
		return 0;
	});

	// Tagline 2 Logic
	let tagline2Opacity = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		const ih = window.innerHeight;
		if (scrollY < ih * 4.8) return 0;
		if (scrollY < ih * 5.6) return (scrollY - ih * 4.8) / (ih * 0.8);
		if (scrollY < ih * 6.5) return 1;
		if (scrollY < ih * 7.5) return Math.max(0, 1 - (scrollY - ih * 6.5) / (ih * 1.0));
		return 0;
	});

	let tagline2TranslateY = $derived.by(() => {
		if (typeof window === 'undefined') return 30;
		const ih = window.innerHeight;
		if (scrollY < ih * 4.8) return 30;
		if (scrollY < ih * 5.6) return 30 - ((scrollY - ih * 4.8) / (ih * 0.8)) * 20;
		return 0;
	});

	// Product Verticals Logic
	let expandedVertical = $state(null);
	let selectedVariantIndex = $state(0);

	const trackgoVariants = [
		{
			id: 'tg-general',
			name: 'TrackGo® – Público General',
			price: '199',
			focus: 'Control y ubicación diaria',
			target: ['Autos particulares', 'Pequeños negocios (1–5 unidades)'],
			features: [
				'GPS en tiempo real 24/7',
				'Historial de recorridos',
				'Geocercas básicas',
				'Acceso App & Web',
				'Equipo 4G de alta gama'
			],
			badge: null
		},
		{
			id: 'tg-moto',
			name: 'TrackGo® Moto – Apps',
			price: '159',
			focus: 'Movilidad constante',
			target: ['DidiFood', 'Uber Eats', 'Rappi', 'Repartidores'],
			features: [
				'GPS en tiempo real',
				'Historial de rutas',
				'App & Web optimizados',
				'Dispositivo 4G compacto',
				'Eficiencia energética'
			],
			badge: '20% OFF'
		},
		{
			id: 'tg-auto',
			name: 'TrackGo® Auto – Apps',
			price: '189',
			focus: 'Respaldo operativo',
			target: ['Uber', 'Didi', 'Taxis por aplicación'],
			features: [
				'GPS 24/7 de alta precisión',
				'Historial de 12 meses',
				'Geocercas de trabajo',
				'App & Web',
				'Equipo 4G robusto'
			],
			badge: '5% OFF'
		}
	];

	const fleetguardVariants = [
		{
			id: 'fg-logistics',
			name: 'FleetGuard® Logistics',
			price: '199',
			installation: '600',
			focus: 'Gestión operativa y control de rutas',
			features: [
				'Rastreo GPS en tiempo real 24/7',
				'Historial de rutas',
				'Geocercas avanzadas',
				'Plataforma web profesional',
				'App móvil',
				'Alertas operativas básicas',
				'Dispositivo 4G de alta gama',
				'Soporte avanzado 24/7'
			],
			badge: null
		},
		{
			id: 'fg-recovery',
			name: 'FleetGuard® Recovery',
			price: '230',
			installation: '720',
			focus: 'Recuperación activa de unidades',
			features: [
				'Todo lo incluido en Logistics',
				'Inmovilización remota del motor',
				'Alertas de movimiento no autorizado',
				'Eventos de encendido fuera de horario'
			],
			badge: 'Popular'
		},
		{
			id: 'fg-secure',
			name: 'FleetGuard® Secure Max',
			price: '350',
			installation: '864',
			focus: 'Seguridad preventiva y detección de riesgo',
			features: [
				'Todo lo incluido en Recovery',
				'Detección Anti-Jamming',
				'Sensores de apertura (puertas/cofre)',
				'Alertas de manipulación'
			],
			badge: 'Seguridad'
		},
		{
			id: 'fg-advanced',
			name: 'FleetGuard® Advanced Core',
			price: '550',
			installation: '1036',
			focus: 'Operación extendida y análisis superior',
			features: [
				'Todo lo incluido en Secure Max',
				'Equipo secundario portátil',
				'Análisis avanzado de datos',
				'Reportes inteligentes',
				'Soporte prioritario'
			],
			badge: 'Pro'
		}
	];

	let nexusCoreVariants = $state([
		{
			id: 'nc-migrate',
			name: 'Nexus Core® Migrate',
			price: '65',
			currency: '$',
			period: 'unidad / mes',
			activeTab: 'propuesta',
			focus: 'Migración de dispositivos (Mín. 20 unidades)',
			includes: [
				'Alta y configuración',
				'Plataforma web y App',
				'Infraestructura Nexus',
				'Soporte técnico 24/7'
			],
			responsibilities: {
				nexus: ['Plataforma', 'Infraestructura', 'Acceso App'],
				client: ['Instalación', 'Mantenimiento', 'SIM / Datos']
			},
			oneTimePayments: [
				{ label: 'Licencia', price: '150' },
				{ label: 'Configuración', price: '400' }
			],
			footerNote: 'Cargo único global por ajuste de reporte',
			badge: 'Migración'
		},
		{
			id: 'nc-partner',
			name: 'Nexus Partner®',
			price: '2.5',
			currency: 'USD',
			period: 'unidad / mes',
			activeTab: 'propuesta',
			focus: 'Para Revendedores de Servicios de Rastreo',
			features: [
				'Plataforma Nexus Partner',
				'Gestión clientes/unidades',
				'GPS tiempo real',
				'Roles y permisos'
			],
			limitations: ['Historial máx. 6 meses', 'Sin módulos avanzados', 'Expansión con costo extra'],
			support: 'Soporte 24/7 solo para el Partner',
			oneTimePayments: [{ label: 'Licencia Partner única', price: '100', currency: 'USD' }],
			badge: 'Partner'
		}
	]);

	function toggleVertical(id, event = null) {
		if (expandedVertical === id && event?.target?.closest('.card-expanded-content')) return;
		selectedVariantIndex = 0;
		expandedVertical = expandedVertical === id ? null : id;
	}

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
			hudData.alt = Math.floor(2000 + Math.random() * 500) + 'm';
			hudData.speed = Math.floor(Math.random() * 120) + ' km/h';
		}, 1000);

		return () => {
			clearInterval(interval);
			clearInterval(progressInterval);
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
						<span class="label">SYS.LAT</span><span class="value">{hudData.lat}</span>
					</div>
					<div class="hud-data top-right">
						<span class="label">SYS.LON</span><span class="value">{hudData.lon}</span>
					</div>
					<div class="hud-data bottom-left">
						<span class="label">ALT</span><span class="value">{hudData.alt}</span>
					</div>
					<div class="hud-data bottom-right">
						<span class="label">SPD</span><span class="value">{hudData.speed}</span>
					</div>
				</div>
			</div>
		</section>

		<!-- 2. LOGO SEQUENCE -->
		<section class="logo-sequence-container">
			<div class="sticky-wrapper">
				<div
					class="nexus-reveal-layer"
					style="opacity: {logoOpacity}; visibility: {logoOpacity > 0 ? 'visible' : 'hidden'}"
				>
					<div class="nexus-logo-large">
						<span>Nexus</span>
						<img src="/img/products/logo-nexus.png" alt="Nexus Logo" />
					</div>
				</div>
				<div class="nexus-taglines">
					<span
						class="tagline-primary"
						style="opacity: {tagline1Opacity}; transform: translateY({tagline1TranslateY}px)"
					>
						La forma inteligente de cuidar lo que importa
					</span>
					<span
						class="tagline-secondary"
						style="opacity: {tagline2Opacity}; transform: translateY({tagline2TranslateY}px)"
					>
						Inteligencia vehicular en tiempo real para personas, activos y operaciones críticas
					</span>
				</div>
			</div>
		</section>

		<!-- 3. EL PROBLEMA -->
		<section class="problem-section" id="contexto">
			<div class="container">
				<h2 class="section-title">El Desafío Actual</h2>
				<p class="section-subtitle">Operar a ciegas ya no es una opción.</p>
				<div class="problems-grid">
					<div class="problem-card">
						<div class="problem-icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/></svg
							>
						</div>
						<h3>Riesgo de Seguridad</h3>
						<p>
							El robo de vehículos y mercancías sigue en aumento. Sin visibilidad en tiempo real, la
							recuperación es casi imposible.
						</p>
					</div>
					<div class="problem-card">
						<div class="problem-icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
								/></svg
							>
						</div>
						<h3>Desconexión Operativa</h3>
						<p>
							Conductores, gestores y clientes operan en silos. La falta de comunicación fluida
							genera retrasos y pérdidas.
						</p>
					</div>
					<div class="problem-card">
						<div class="problem-icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/></svg
							>
						</div>
						<h3>Datos Sin Valor</h3>
						<p>
							Tener miles de puntos GPS no sirve si no se traducen en decisiones. Las plataformas
							antiguas solo acumulan ruido.
						</p>
					</div>
					<div class="problem-card">
						<div class="problem-icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
						</div>
						<h3>Costos Ocultos</h3>
						<p>
							Mantenimientos no programados, rutas ineficientes y uso no autorizado consumen hasta
							el 30% del presupuesto operativo.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- 4. INTRO -->
		<section class="intro-section" id="intro">
			<div class="container-split">
				<div class="intro-text">
					<h2 class="section-title text-left">El Ecosistema de Control Total</h2>
					<p class="section-lead">
						Nexus no es solo un GPS. Es un cerebro digital que centraliza la operación de tu flota,
						seguridad y activos en una sola interfaz.
					</p>
					<ul class="feature-list">
						<li>
							<div class="check-icon">✓</div>
							<div>
								<strong>Tiempo Real Real</strong>
								<p>Latencia menor a 1 segundo. Ve tus unidades moverse como en un videojuego.</p>
							</div>
						</li>
						<li>
							<div class="check-icon">✓</div>
							<div>
								<strong>Multi-Plataforma</strong>
								<p>Accede desde web, iOS o Android con la misma potencia.</p>
							</div>
						</li>
						<li>
							<div class="check-icon">✓</div>
							<div>
								<strong>Alertas Inteligentes</strong>
								<p>Recibe notificaciones solo de lo que realmente importa.</p>
							</div>
						</li>
					</ul>
				</div>
				<div class="intro-visual">
					<div class="dashboard-placeholder">
						<div class="dashboard-mockup">
							<div class="mockup-header">
								<div class="dots"><span></span><span></span><span></span></div>
							</div>
							<div class="mockup-body">
								<div class="sidebar-view"></div>
								<div class="map-view"></div>
								<div class="stats-card card-1"></div>
								<div class="stats-card card-2"></div>
							</div>
							<div class="scan-line"></div>
						</div>
						<div class="glow-effect"></div>
					</div>
				</div>
			</div>
		</section>

		<!-- 5. DEMO WEB -->
		<section class="demo-section web-demo" id="demo">
			<div class="container">
				<div class="demo-split">
					<div class="demo-content">
						<span class="eyebrow">Plataforma Web</span>
						<h2 class="section-title text-left">Control de Misión Completo</h2>
						<p class="section-desc">
							Visualiza toda tu operación en un solo mapa inteligente. Filtra por grupos, estados o
							alertas críticas.
						</p>
						<div class="feature-bullets">
							<div class="bullet-item">
								<span class="bullet-icon">🗺️</span>
								<div class="bullet-text">
									<h4>Rastreo en vivo</h4>
									<p>Google Maps Enterprise con tráfico en tiempo real y Street View.</p>
								</div>
							</div>
							<div class="bullet-item">
								<span class="bullet-icon">⚡</span>
								<div class="bullet-text">
									<h4>Comandos Remotos</h4>
									<p>Apagado de motor, apertura de puertas y activación de sirena en un click.</p>
								</div>
							</div>
							<div class="bullet-item">
								<span class="bullet-icon">📊</span>
								<div class="bullet-text">
									<h4>Reportes Históricos</h4>
									<p>Reproduce rutas de hasta 12 meses atrás con precisión de segundos.</p>
								</div>
							</div>
						</div>
					</div>
					<div class="demo-media desktop-frame">
						<div class="video-container">
							<div class="play-button">▶</div>
							<div class="video-overlay">Demo de Plataforma</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 6. DEMO MÓVIL -->
		<section class="demo-section mobile-demo">
			<div class="container">
				<div class="demo-split reverse">
					<div class="demo-content">
						<span class="eyebrow">App Móvil (iOS & Android)</span>
						<h2 class="section-title text-left">Tu Flota en tu Bolsillo</h2>
						<p class="section-desc">
							La potencia de la web, optimizada para tu smartphone. Recibe notificaciones push y
							mantén el control donde sea.
						</p>
						<div class="feature-bullets">
							<div class="bullet-item">
								<span class="bullet-icon">📱</span>
								<div class="bullet-text">
									<h4>Interfaz Nativa</h4>
									<p>Experiencia fluida y veloz diseñada para iOS y Android.</p>
								</div>
							</div>
							<div class="bullet-item">
								<span class="bullet-icon">🔔</span>
								<div class="bullet-text">
									<h4>Notificaciones Push</h4>
									<p>
										Entérate al instante de encendidos, salidas de geocerca o excesos de velocidad.
									</p>
								</div>
							</div>
						</div>
						<div class="app-store-buttons">
							<button class="store-btn apple">App Store</button>
							<button class="store-btn google">Google Play</button>
						</div>
					</div>
					<div class="demo-media mobile-frame">
						<div class="phone-mockup">
							<div class="notch"></div>
							<div class="screen">
								<div class="app-header"></div>
								<div class="app-map"></div>
								<div class="app-controls"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 7. CAPACIDADES — overview limpio sin marcas (de v1) -->
		<section class="verticals-section" id="capacidades">
			<div class="container">
				<h2 class="section-title">Una plataforma, muchas formas de operar</h2>
				<p class="section-subtitle">
					Nexus concentra rastreo, telemetría y servicios de flota; el alcance concreto se define
					según tu contrato y tu escala.
				</p>
				<div class="problems-grid nexus-pillars">
					<div class="problem-card">
						<div class="problem-icon" aria-hidden="true">📍</div>
						<h3>Visibilidad y rastreo</h3>
						<p>
							Ubicación en tiempo real, historial, geocercas y acceso web y móvil para equipos
							reducidos o de alto recorrido.
						</p>
					</div>
					<div class="problem-card">
						<div class="problem-icon" aria-hidden="true">🛡️</div>
						<h3>Operación y seguridad</h3>
						<p>
							Alertas, reportes y control operativo de flotillas: incidentes, rutas y cumplimiento
							en un tablero.
						</p>
					</div>
					<div class="problem-card">
						<div class="problem-icon" aria-hidden="true">🧩</div>
						<h3>Integración y partners</h3>
						<p>
							Escenarios con migración de equipos, integradores y despliegues empresariales, bajo
							acuerdo y validación técnica.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- 8. ELIGE TU POTENCIA — verticales expandibles con variantes (de v2) -->
		<section class="verticals-section" id="verticals">
			<div class="container">
				<h2 class="section-title">Elige Tu Potencia</h2>
				<p class="section-subtitle">
					Tres niveles de especialización para cada etapa de tu crecimiento.
				</p>

				<div class="verticals-grid" class:has-expanded={expandedVertical !== null}>
					<!-- TrackGo -->
					<div
						class="vertical-card trackgo"
						class:expanded={expandedVertical === 'trackgo'}
						class:hidden={expandedVertical !== null && expandedVertical !== 'trackgo'}
						onclick={(e) => toggleVertical('trackgo', e)}
						onkeydown={(e) => e.key === 'Enter' && toggleVertical('trackgo')}
						role="button"
						tabindex="0"
					>
						<div class="card-glow"></div>
						<div class="card-border-glow"></div>
						<div class="card-technical-grid"></div>
						<div class="bracket top-left"></div>
						<div class="bracket top-right"></div>
						<div class="bracket bottom-left"></div>
						<div class="bracket bottom-right"></div>
						<div class="scanning-line"></div>

						<div class="card-overview">
							<div class="vertical-icon">📍</div>
							<h3>TrackGo</h3>
							<span class="vertical-tag">Esencial</span>
							<p class="vertical-desc">
								Rastreo GPS puro y duro. Ubicación en tiempo real, historial de rutas y alertas
								básicas. Ideal para empezar.
							</p>
							<ul class="vertical-features">
								<li>Rastreo cada 60 segundos</li>
								<li>Historial de 3 meses</li>
								<li>Alertas de encendido/apagado</li>
								<li>App Móvil Básica</li>
							</ul>
							<button class="btn-vertical">Ver Variantes</button>
						</div>

						{#if expandedVertical === 'trackgo'}
							<div class="card-expanded-content">
								<div class="expanded-header">
									<button
										class="btn-back"
										onclick={(e) => {
											e.stopPropagation();
											expandedVertical = null;
										}}
										aria-label="Volver"
									>
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
											stroke-linejoin="round"
											><line x1="19" y1="12" x2="5" y2="12"></line><polyline
												points="12 19 5 12 12 5"
											></polyline></svg
										>
									</button>
									<div class="header-text">
										<h2>Familia TrackGo®</h2>
										<p>Tu vehículo, siempre bajo control con tecnología Nexus</p>
									</div>
								</div>
								<div class="variants-slider-viewport">
									<div
										class="variants-grid"
										style="left: 50%; transform: translateX(calc(-210px - {selectedVariantIndex *
											(420 + 32)}px))"
									>
										{#each trackgoVariants as variant, i (variant.id)}
											<div
												class="variant-card"
												class:is-selected={selectedVariantIndex === i}
												class:is-dimmed={selectedVariantIndex !== i}
												onclick={() => (selectedVariantIndex = i)}
												onkeydown={(e) => e.key === 'Enter' && (selectedVariantIndex = i)}
												role="button"
												tabindex="0"
											>
												{#if variant.badge}<span class="variant-badge">{variant.badge}</span>{/if}
												<div class="variant-header">
													<h4>{variant.name}</h4>
													<div class="variant-price">
														<span class="currency">$</span><span class="amount"
															>{variant.price}</span
														><span class="period">/mo</span>
													</div>
												</div>
												<p class="variant-focus"><strong>Enfoque:</strong> {variant.focus}</p>
												<div class="variant-features-mini">
													<ul>
														{#each variant.features as feature (feature)}<li>{feature}</li>{/each}
													</ul>
												</div>
												<button class="btn-variant-select">Lo quiero</button>
											</div>
										{/each}
									</div>
								</div>
								<div class="variant-selector">
									{#each trackgoVariants as _, i (i)}<button
											class="selector-dot"
											class:active={selectedVariantIndex === i}
											onclick={(e) => {
												e.stopPropagation();
												selectedVariantIndex = i;
											}}
											aria-label="Ver variante {i + 1}"
										></button>{/each}
								</div>
								<div class="expanded-footer">
									<p>
										🔹 <strong>Beneficios TrackGo:</strong> Sin costo de instalación • Equipo 4G diferible
										• 10% OFF en pago anual
									</p>
								</div>
							</div>
						{/if}
					</div>

					<!-- FleetGuard -->
					<div
						class="vertical-card fleetguard"
						class:expanded={expandedVertical === 'fleetguard'}
						class:hidden={expandedVertical !== null && expandedVertical !== 'fleetguard'}
						onclick={(e) => toggleVertical('fleetguard', e)}
						onkeydown={(e) => e.key === 'Enter' && toggleVertical('fleetguard')}
						role="button"
						tabindex="0"
					>
						<div class="card-glow"></div>
						<div class="card-border-glow"></div>
						<div class="card-technical-grid"></div>
						<div class="bracket top-left"></div>
						<div class="bracket top-right"></div>
						<div class="bracket bottom-left"></div>
						<div class="bracket bottom-right"></div>
						<div class="scanning-line"></div>

						<div class="card-overview">
							<div class="vertical-icon">🛡️</div>
							<h3>FleetGuard</h3>
							<span class="vertical-tag popular">Recomendado</span>
							<p class="vertical-desc">
								Seguridad avanzada y telemetría. Paro de motor, detección de jammer, sensores de
								combustible y cámara en cabina.
							</p>
							<ul class="vertical-features">
								<li>Rastreo cada 10 segundos</li>
								<li>Historial de 12 meses</li>
								<li>Paro de motor remoto</li>
								<li>Video en vivo (Dashcam)</li>
							</ul>
							<button class="btn-vertical primary">Ver Variantes</button>
						</div>

						{#if expandedVertical === 'fleetguard'}
							<div class="card-expanded-content">
								<div class="expanded-header">
									<button
										class="btn-back"
										onclick={(e) => {
											e.stopPropagation();
											expandedVertical = null;
										}}>← Volver a productos</button
									>
									<div class="header-text">
										<h2>Familia FleetGuard®</h2>
										<p>Telemetría inteligente para operaciones críticas</p>
									</div>
								</div>
								<div class="variants-slider-viewport">
									<div
										class="variants-grid"
										style="left: 50%; transform: translateX(calc(-210px - {selectedVariantIndex *
											(420 + 32)}px))"
									>
										{#each fleetguardVariants as variant, i (variant.id)}
											<div
												class="variant-card"
												class:is-selected={selectedVariantIndex === i}
												class:is-dimmed={selectedVariantIndex !== i}
												onclick={() => (selectedVariantIndex = i)}
												onkeydown={(e) => e.key === 'Enter' && (selectedVariantIndex = i)}
												role="button"
												tabindex="0"
											>
												{#if variant.badge}<span class="variant-badge">{variant.badge}</span>{/if}
												<div class="variant-header">
													<h4>{variant.name}</h4>
													<div class="variant-price">
														<span class="currency">$</span><span class="amount"
															>{variant.price}</span
														><span class="period">/mo</span>
													</div>
													<div class="installation-tag">Instalación: ${variant.installation}</div>
												</div>
												<p class="variant-focus"><strong>Enfoque:</strong> {variant.focus}</p>
												<div class="variant-features-mini">
													<ul>
														{#each variant.features as feature (feature)}<li>{feature}</li>{/each}
													</ul>
												</div>
												<button class="btn-variant-select">Lo quiero</button>
											</div>
										{/each}
									</div>
								</div>
								<div class="variant-selector">
									{#each fleetguardVariants as _, i (i)}<button
											class="selector-dot"
											class:active={selectedVariantIndex === i}
											onclick={(e) => {
												e.stopPropagation();
												selectedVariantIndex = i;
											}}
											aria-label="Ver variante {i + 1}"
										></button>{/each}
								</div>
								<div class="expanded-footer-detailed">
									<div class="footer-grid">
										<div class="footer-col">
											<h5>🛠️ Condiciones de Equipo</h5>
											<ul>
												<li>
													<strong>Plazo forzoso (18 meses):</strong> Dispositivo incluido + 20% OFF en
													instalación.
												</li>
												<li>
													<strong>Sin plazo forzoso:</strong> Equipo Logistics ($1,200) a Advanced Core
													($2,073).
												</li>
											</ul>
										</div>
										<div class="footer-col">
											<h5>💳 Financiamiento</h5>
											<p>
												6, 12, 18 y 24 meses con tarjeta de crédito. 20% OFF en pago de contado del
												equipo.
											</p>
										</div>
										<div class="footer-col">
											<h5>📞 Soporte Premium</h5>
											<p>Atención avanzada 24/7, telefonía especializada y prioridad según plan.</p>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<!-- Nexus Core -->
					<div
						class="vertical-card nexus-core"
						class:expanded={expandedVertical === 'nexus-core'}
						class:hidden={expandedVertical !== null && expandedVertical !== 'nexus-core'}
						onclick={(e) => toggleVertical('nexus-core', e)}
						onkeydown={(e) => e.key === 'Enter' && toggleVertical('nexus-core')}
						role="button"
						tabindex="0"
					>
						<div class="card-glow"></div>
						<div class="card-border-glow"></div>
						<div class="card-technical-grid"></div>
						<div class="bracket top-left"></div>
						<div class="bracket top-right"></div>
						<div class="bracket bottom-left"></div>
						<div class="bracket bottom-right"></div>
						<div class="scanning-line"></div>

						<div class="card-overview">
							<div class="vertical-icon">🧠</div>
							<h3>Nexus Core®</h3>
							<span class="vertical-tag">Ecosistema</span>
							<p class="vertical-desc">
								La plataforma que se adapta a tu operación. Migración de dispositivos, servicios
								para partners e integraciones empresariales.
							</p>
							<ul class="vertical-features">
								<li>Migración de Flotillas (&gt;20)</li>
								<li>Modalidad Partner / Reseller</li>
								<li>Análisis de Datos Avanzado</li>
								<li>Soporte Técnico 24/7</li>
							</ul>
							<button class="btn-vertical">Ver Soluciones</button>
						</div>

						{#if expandedVertical === 'nexus-core'}
							<div class="card-expanded-content">
								<div class="expanded-header">
									<button
										class="btn-back"
										onclick={(e) => {
											e.stopPropagation();
											expandedVertical = null;
										}}>← Volver a productos</button
									>
									<div class="header-text">
										<h2>Nexus Core® y Ecosistema</h2>
										<p>Tecnología modular para operaciones de alto volumen</p>
									</div>
								</div>
								<div class="variants-slider-viewport">
									<div
										class="variants-grid"
										style="left: 50%; transform: translateX(calc(-210px - {selectedVariantIndex *
											(420 + 32)}px))"
									>
										{#each nexusCoreVariants as variant, i (variant.id)}
											<div
												class="variant-card nexus-variant"
												class:is-selected={selectedVariantIndex === i}
												class:is-dimmed={selectedVariantIndex !== i}
												onclick={() => (selectedVariantIndex = i)}
												onkeydown={(e) => e.key === 'Enter' && (selectedVariantIndex = i)}
												role="button"
												tabindex="0"
											>
												{#if variant.badge}<span class="variant-badge">{variant.badge}</span>{/if}
												<div class="variant-header">
													<h4>{variant.name}</h4>
													<div class="variant-price">
														<span class="currency">{variant.currency}</span><span class="amount"
															>{variant.price}</span
														><span class="period">/{variant.period}</span>
													</div>
												</div>
												<div class="internal-tabs">
													<button
														class="tab-btn"
														class:active={variant.activeTab === 'propuesta'}
														onclick={(e) => {
															e.stopPropagation();
															variant.activeTab = 'propuesta';
														}}>Propuesta</button
													>
													<button
														class="tab-btn"
														class:active={variant.activeTab === 'alcance'}
														onclick={(e) => {
															e.stopPropagation();
															variant.activeTab = 'alcance';
														}}>Alcance</button
													>
												</div>
												<div class="tab-content-wrapper">
													{#if variant.activeTab === 'propuesta'}
														<div class="tab-content fadeIn">
															<p class="variant-focus">{variant.focus}</p>
															<div class="features-icon-grid">
																{#if variant.includes}{#each variant.includes as item (item)}<div
																			class="icon-feature"
																		>
																			<span class="dot"></span><span>{item}</span>
																		</div>{/each}{/if}
																{#if variant.features}{#each variant.features as item (item)}<div
																			class="icon-feature"
																		>
																			<span class="dot"></span><span>{item}</span>
																		</div>{/each}{/if}
															</div>
															{#if variant.oneTimePayments}<div class="one-time-tags mini">
																	{#each variant.oneTimePayments as payment (payment.label)}<div
																			class="payment-tag"
																		>
																			{payment.label}: {payment.currency || '$'}{payment.price}
																		</div>{/each}
																</div>{/if}
														</div>
													{:else}
														<div class="tab-content fadeIn">
															{#if variant.responsibilities}
																<div class="resp-mini-stack">
																	<div class="resp-group">
																		<span class="label">Nexus:</span>
																		<p>{variant.responsibilities.nexus.join(', ')}</p>
																	</div>
																	<div class="resp-group">
																		<span class="label">Cliente:</span>
																		<p>{variant.responsibilities.client.join(', ')}</p>
																	</div>
																</div>
															{/if}
															{#if variant.limitations}<div class="limitations-box">
																	<p class="mini-title">Limitaciones:</p>
																	<ul>
																		{#each variant.limitations as item (item)}<li>{item}</li>{/each}
																	</ul>
																</div>{/if}
															{#if variant.support}<div class="support-tag">
																	{variant.support}
																</div>{/if}
														</div>
													{/if}
												</div>
												{#if variant.footerNote}<p class="variant-footer-note">
														{variant.footerNote}
													</p>{/if}
												<button class="btn-variant-select">Solicitar Información</button>
											</div>
										{/each}
									</div>
								</div>
								<div class="variant-selector">
									{#each nexusCoreVariants as _, i (i)}<button
											class="selector-dot"
											class:active={selectedVariantIndex === i}
											onclick={(e) => {
												e.stopPropagation();
												selectedVariantIndex = i;
											}}
											aria-label="Ver variante {i + 1}"
										></button>{/each}
								</div>
								<div class="expanded-footer-detailed">
									<div class="footer-grid">
										<div class="footer-col addon-highlight">
											<h5>📊 Add-on Opcional</h5>
											<div class="addon-content">
												<strong>Análisis Avanzado de Datos</strong>
												<p>Métricas operativas mejoradas y reportes más precisos.</p>
												<div class="addon-price">+$15 MXN por unidad / mes</div>
											</div>
										</div>
										<div class="footer-col">
											<h5>📝 Notas Técnicas</h5>
											<ul>
												<li>Compatibilidad sujeta a validación técnica de equipos.</li>
												<li>Soporte especializado vía canales directos dedicados.</li>
												<li>Escalabilidad global bajo demanda.</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<!-- 9. TABLAS COMPARATIVAS — las 4 completas (de v2) -->
		<section class="comparison-tables-section">
			<div class="container">
				<h2 class="section-title">Tabla Comparativa de Soluciones</h2>
				<p class="section-subtitle">Nexus by GeminisLabs</p>

				<!-- TrackGo -->
				<div class="comparison-table-wrapper">
					<h3 class="table-title">🔹 TRACKGO® – Rastreo Esencial</h3>
					<div class="table-responsive">
						<table class="comparison-table">
							<thead><tr><th>Característica</th><th>TrackGo®</th></tr></thead>
							<tbody>
								<tr><td>Público objetivo</td><td>Usuarios individuales / pequeñas flotillas</td></tr
								>
								<tr><td>Rastreo en tiempo real</td><td>✅</td></tr>
								<tr><td>Geocercas</td><td>✅</td></tr>
								<tr><td>Alertas básicas</td><td>✅</td></tr>
								<tr><td>Historial de recorridos</td><td>✅</td></tr>
								<tr><td>App móvil y plataforma web</td><td>✅</td></tr>
								<tr><td>Dispositivo</td><td>📡 4G alta gama</td></tr>
								<tr><td>Instalación</td><td>❌ Sin costo</td></tr>
								<tr><td>Costo del equipo</td><td>$1,200 MXN (diferible)</td></tr>
								<tr><td>Pago anual</td><td>10% de descuento</td></tr>
								<tr><td>Soporte</td><td>☎️ Básico 24/7</td></tr>
								<tr><td>Integraciones / APIs</td><td>❌ No aplica</td></tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- FleetGuard -->
				<div class="comparison-table-wrapper">
					<h3 class="table-title">🔹 FLEETGUARD® – Control y Seguridad de Flotillas</h3>
					<div class="table-responsive">
						<table class="comparison-table fleetguard-table">
							<thead
								><tr
									><th>Característica</th><th>Logistics</th><th>Recovery</th><th>Secure Max</th><th
										>Advanced Core</th
									></tr
								></thead
							>
							<tbody>
								<tr
									><td>Precio mensual</td><td>$199 MXN</td><td>$230 MXN</td><td>$350 MXN</td><td
										>$550 MXN</td
									></tr
								>
								<tr
									><td>Instalación</td><td>$600 MXN</td><td>$720 MXN</td><td>$864 MXN</td><td
										>$1,036.80 MXN</td
									></tr
								>
								<tr><td>Rastreo en tiempo real</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
								<tr><td>Geocercas</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
								<tr
									><td>Alertas inteligentes</td><td>Básicas</td><td>Avanzadas</td><td>Críticas</td
									><td>Avanzadas</td></tr
								>
								<tr
									><td>Historial</td><td>Estándar</td><td>Extendido</td><td>Extendido</td><td
										>Avanzado</td
									></tr
								>
								<tr
									><td>Reportes</td><td>Básicos</td><td>Intermedios</td><td>Avanzados</td><td
										>Personalizados</td
									></tr
								>
								<tr><td>Seguridad vehicular</td><td>❌</td><td>✅</td><td>✅</td><td>✅</td></tr>
								<tr><td>Sensores adicionales</td><td>❌</td><td>❌</td><td>✅</td><td>✅</td></tr>
								<tr
									><td>Equipo secundario portátil</td><td>❌</td><td>❌</td><td>✅</td><td>✅</td
									></tr
								>
								<tr
									><td>Análisis de datos</td><td>❌</td><td>❌</td><td>Intermedio</td><td
										>🧠 Avanzado</td
									></tr
								>
								<tr><td>Dispositivo</td><td colspan="4">📡 4G alta gama</td></tr>
								<tr><td>Modalidad sin plazo</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
								<tr><td>Modalidad 18 meses</td><td colspan="4">✅ (equipo incluido)</td></tr>
								<tr><td>Soporte</td><td colspan="4">🛠️ Avanzado 24/7</td></tr>
								<tr><td>Integraciones / APIs</td><td colspan="4">⚙️ Según plan</td></tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- Nexus Core Migrate -->
				<div class="comparison-table-wrapper">
					<h3 class="table-title">🔹 NEXUS CORE MIGRATE – Migración de Flotillas</h3>
					<div class="table-responsive">
						<table class="comparison-table">
							<thead><tr><th>Característica</th><th>Nexus Core Migrate</th></tr></thead>
							<tbody>
								<tr><td>Público objetivo</td><td>Flotillas con GPS ya instalado</td></tr>
								<tr><td>Flotilla mínima</td><td>🚛 20 unidades</td></tr>
								<tr><td>Precio mensual</td><td>$65 MXN por unidad</td></tr>
								<tr><td>Licencia (única)</td><td>$150 MXN</td></tr>
								<tr><td>Configuración (única)</td><td>$400 MXN</td></tr>
								<tr><td>App móvil y plataforma</td><td>✅</td></tr>
								<tr><td>Rastreo en tiempo real</td><td>✅</td></tr>
								<tr><td>Configuración de reporteo</td><td>✅</td></tr>
								<tr><td>Análisis avanzado opcional</td><td>+$15 MXN / unidad</td></tr>
								<tr><td>Instalación de equipo</td><td>❌ Cliente</td></tr>
								<tr><td>SIM y datos</td><td>❌ Cliente</td></tr>
								<tr><td>Mantenimiento</td><td>❌ Cliente</td></tr>
								<tr><td>Soporte</td><td>☎️ Avanzado 24/7</td></tr>
								<tr><td>Integraciones</td><td>⚙️ Opcional</td></tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- Nexus Partner -->
				<div class="comparison-table-wrapper">
					<h3 class="table-title">🔹 NEXUS PARTNER – Plataforma para Reventa</h3>
					<div class="table-responsive">
						<table class="comparison-table">
							<thead><tr><th>Característica</th><th>Nexus Partner</th></tr></thead>
							<tbody>
								<tr><td>Público objetivo</td><td>Empresas de telemetría</td></tr>
								<tr><td>Precio mensual</td><td>$2.5 USD por unidad</td></tr>
								<tr><td>Licencia única</td><td>$100 USD</td></tr>
								<tr><td>Plataforma de rastreo</td><td>✅</td></tr>
								<tr><td>Servicios avanzados Nexus</td><td>❌ No incluidos</td></tr>
								<tr><td>Histórico</td><td>6 meses</td></tr>
								<tr><td>Expansión de histórico</td><td>💰 Con costo</td></tr>
								<tr><td>App móvil</td><td>✅</td></tr>
								<tr><td>Integraciones</td><td>⚙️ Limitadas</td></tr>
								<tr><td>Soporte a partner</td><td>🛠️ Avanzado</td></tr>
								<tr><td>Soporte a clientes finales</td><td>❌ A cargo del partner</td></tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="comparison-notes">
					<h3 class="notes-title">🧠 Notas Generales</h3>
					<ul class="notes-list">
						<li>Todos los planes utilizan <strong>dispositivos 4G de alta gama</strong></li>
						<li>
							Integraciones y desarrollos especiales <strong>requieren evaluación técnica</strong>
						</li>
						<li>Los costos pueden variar según volumen y personalización</li>
						<li>Precios no incluyen IVA</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- 10. CTA FINAL -->
		<section class="final-cta">
			<div class="container">
				<div class="cta-box">
					<h2>¿Listo para tomar el control?</h2>
					<p>Únete a más de 500 empresas que confían en Nexus.</p>
					<div class="cta-actions">
						<button class="btn-primary large">Crear Cuenta Gratis</button>
						<button class="btn-secondary large">Agendar Demo</button>
					</div>
				</div>
			</div>
		</section>

		<!-- 11. TRUST & SUPPORT -->
		<section class="trust-section">
			<div class="container">
				<div class="trust-grid">
					<div class="trust-item">
						<h4>Seguridad Blindada</h4>
						<p>Tus datos viajan encriptados con AES-256. Nadie ve tu ubicación, salvo tú.</p>
					</div>
					<div class="trust-item">
						<h4>Soporte Humano</h4>
						<p>Nada de robots. Ingenieros expertos listos para ayudarte en español.</p>
					</div>
					<div class="trust-item">
						<h4>Garantía de Servicio</h4>
						<p>SLA del 99.9%. Si el sistema cae, te reembolsamos el mes.</p>
					</div>
				</div>
				<div class="faq-container">
					<h3>Preguntas Frecuentes</h3>
					<div class="faq-grid">
						<div class="faq-item">
							<details>
								<summary>¿Necesito instalar algo en mis vehículos?</summary>
								<p>
									Sí, instalamos un dispositivo GPS profesional oculto. La instalación toma 45 min
									por unidad y vamos a tu domicilio.
								</p>
							</details>
						</div>
						<div class="faq-item">
							<details>
								<summary>¿Qué pasa si no tengo señal?</summary>
								<p>
									El dispositivo guarda la ubicación en memoria y la transmite en ráfaga en cuanto
									recupera la señal. Nunca pierdes el historial.
								</p>
							</details>
						</div>
						<div class="faq-item">
							<details>
								<summary>¿Puedo cancelar en cualquier momento?</summary>
								<p>Sí, nuestros planes son mensuales. No amarres ni letras chiquitas.</p>
							</details>
						</div>
					</div>
				</div>
				<div class="payment-methods">
					<p>Aceptamos todas las tarjetas y facturamos fiscalmente.</p>
					<div class="card-icons">
						<span>VISA</span><span>Mastercard</span><span>Amex</span><span>Stripe</span>
					</div>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>
