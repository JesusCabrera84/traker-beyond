<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import './nexus.css';

	let scrollY = $state(0);
	let faqTab = $state('familias');
	let openFaq = $state({ familias: null, flotillas: null, partners: null });
	let activeVertical = $state(0);
	let heroReady = $state(false);

	let statValues = $state({ vehicles: 0, uptime: 0, rating: 0 });

	let heroOpacity = $derived.by(() => {
		if (typeof window === 'undefined') return 1;
		const ih = window.innerHeight;
		if (scrollY < ih * 0.15) return 1;
		if (scrollY < ih * 0.85) return 1 - (scrollY - ih * 0.15) / (ih * 0.7);
		return 0;
	});

	const faqData = {
		familias: [
			{
				q: '¿Mi familiar va a saber que lo estoy rastreando?',
				a: 'Nexus te da control total sobre la visibilidad del monitoreo. Puedes configurarlo para que la persona monitorizada reciba una notificación (modo transparente) o para que el seguimiento sea discreto. La decisión es completamente tuya.'
			},
			{
				q: '¿Qué pasa si desconectan o retiran el dispositivo?',
				a: 'Nexus genera una alerta automática cuando el dispositivo pierde alimentación de forma inesperada. Recibes la última posición registrada y el momento exacto en que ocurrió. No hay forma de desconectarlo silenciosamente.'
			},
			{
				q: '¿Funciona con cualquier marca o modelo de auto?',
				a: 'Compatible con cualquier vehículo con puerto OBD-II, que incluye prácticamente todos los autos fabricados a partir del año 2000, sin importar la marca.'
			},
			{
				q: '¿Cuántos vehículos puedo tener en mi cuenta familiar?',
				a: 'Una sola cuenta Nexus puede gestionar múltiples vehículos al mismo tiempo, con alertas configuradas de forma independiente para cada uno.'
			}
		],
		flotillas: [
			{
				q: '¿Puedo exportar los reportes sin que el equipo acceda al sistema completo?',
				a: 'Sí. Los reportes son exportables en PDF y Excel, y puedes programarlos para que lleguen automáticamente por correo. Los destinatarios no necesitan cuenta en la plataforma.'
			},
			{
				q: '¿Cuántos administradores o roles distintos puede tener mi cuenta?',
				a: 'Sin límite restrictivo. Los permisos son configurables por rol y por vehículo individual: administrador general, supervisores regionales, operadores con vista limitada y clientes con acceso específico.'
			},
			{
				q: '¿Se puede integrar con nuestro ERP o sistema logístico?',
				a: 'Nexus cuenta con API disponible para clientes de flotilla. El alcance de la integración depende de tu sistema; nuestro equipo técnico evalúa cada caso durante la demo.'
			},
			{
				q: '¿Qué pasa si una unidad opera en zonas sin señal celular?',
				a: 'El dispositivo almacena los datos localmente y los sincroniza automáticamente al recuperar señal. El historial de ruta queda completo, sin huecos en el mapa.'
			}
		],
		partners: [
			{
				q: '¿Qué hardware es compatible con la integración TaaS?',
				a: 'Cualquier dispositivo capaz de transmitir latitud, longitud y timestamp en formato JSON vía HTTP o MQTT. Nuestro equipo valida la compatibilidad en la primera sesión técnica.'
			},
			{
				q: '¿Cómo se protegen los datos de los clientes finales?',
				a: 'TLS en tránsito y AES-256 en reposo. Los datos son tuyos — no los compartimos con terceros. Firmamos NDA durante el onboarding y la retención de datos es configurable por cuenta.'
			},
			{
				q: '¿Cuánto tiempo toma poner la primera integración en producción?',
				a: 'Un equipo técnico con experiencia básica en APIs completa la integración de datos en 1 a 3 días hábiles. La configuración de marca blanca toma 1 a 2 días adicionales.'
			}
		]
	};

	const flotillaVerticals = [
		{
			label: 'Distribución',
			problem: 'Rutas ineficientes generan hasta 12% de desperdicio en combustible'
		},
		{ label: 'Paquetería', problem: 'Prueba de entrega automatizada con foto y geolocalización' },
		{
			label: 'Construcción',
			problem: 'Alertas inmediatas ante movimiento de maquinaria fuera de horario'
		},
		{ label: 'Seguridad', problem: 'Verificación de rondines con historial de recorrido completo' },
		{ label: 'Corporativo', problem: 'Detección de uso no autorizado del vehículo en tiempo real' }
	];

	function toggleFaq(tab, idx) {
		openFaq[tab] = openFaq[tab] === idx ? null : idx;
	}

	onMount(() => {
		setTimeout(() => {
			heroReady = true;
		}, 150);

		const observer = new IntersectionObserver(
			(entries) =>
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add('is-visible');
						observer.unobserve(e.target);
					}
				}),
			{ threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
		);
		document.querySelectorAll('.nx-reveal').forEach((el) => observer.observe(el));

		// Stat counter animation on scroll into view
		const statsEl = document.querySelector('.nx-stats-bar');
		if (statsEl) {
			const statsObs = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						statsObs.disconnect();
						const duration = 1200;
						const start = performance.now();
						const tick = (now) => {
							const t = Math.min((now - start) / duration, 1);
							const ease = 1 - Math.pow(1 - t, 3);
							statValues.vehicles = Math.floor(ease * 10000);
							statValues.uptime = +(ease * 98.7).toFixed(1);
							statValues.rating = +(ease * 4.8).toFixed(1);
							if (t < 1) requestAnimationFrame(tick);
						};
						requestAnimationFrame(tick);
					}
				},
				{ threshold: 0.5 }
			);
			statsObs.observe(statsEl);
		}

		return () => {
			observer.disconnect();
		};
	});
</script>

<svelte:window bind:scrollY />

<svelte:head>
	<title>Nexus by Geminis Labs — Inteligencia Vehicular en Tiempo Real</title>
	<meta
		name="description"
		content="Plataforma de inteligencia vehicular en tiempo real para familias, flotillas y partners TaaS. Rastreo GPS, telemetría, geocercas de precisión y apps nativas. Nexus by Geminis Labs."
	/>
</svelte:head>

<div class="nx-page-wrap">
	<Navbar />
	<main class="nx-page">
		<!-- HERO -->
		<section class="nx-hero">
			<div class="nx-hero-bg" aria-hidden="true"></div>
			<div class="nx-hero-grid" aria-hidden="true"></div>

			<div class="nx-hero-inner">
				<!-- LEFT: text block -->
				<div class="nx-hero-content" style="opacity: {heroOpacity}" class:nx-hero-ready={heroReady}>
					<div class="nx-hero-status">
						<span class="nx-status-dot"></span>
						RASTREO EN VIVO
					</div>
					<h1 class="nx-hero-title">Sabe exactamente<br />dónde está. Siempre.</h1>
					<p class="nx-hero-sub">
						Nexus convierte cada vehículo en inteligencia en tiempo real — para tu familia, tu
						operación y tu negocio.
					</p>
					<div class="nx-hero-actions">
						<a href="#segmentos" class="btn-nx-primary">Ver para quién es Nexus</a>
						<a href="#demo" class="btn-nx-ghost">Ver una demo</a>
					</div>
				</div>

				<!-- RIGHT: radar visualization -->
				<div class="nx-radar-wrap" aria-hidden="true">
					<svg
						class="nx-radar-svg"
						viewBox="0 0 560 560"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<defs>
							<radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stop-color="#00f3ff" stop-opacity="0.18" />
								<stop offset="100%" stop-color="#00f3ff" stop-opacity="0" />
							</radialGradient>
							<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
								<feGaussianBlur stdDeviation="3" result="coloredBlur" />
								<feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge
								>
							</filter>
							<filter id="glowStrong" x="-100%" y="-100%" width="300%" height="300%">
								<feGaussianBlur stdDeviation="6" result="coloredBlur" />
								<feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge
								>
							</filter>
							<clipPath id="radarClip">
								<circle cx="280" cy="280" r="248" />
							</clipPath>
						</defs>

						<!-- Outer dashed ring -->
						<circle
							cx="280"
							cy="280"
							r="268"
							fill="none"
							stroke="rgba(0,243,255,0.06)"
							stroke-width="1"
							stroke-dasharray="4 8"
						/>
						<!-- Rings -->
						<circle
							cx="280"
							cy="280"
							r="240"
							fill="none"
							stroke="rgba(0,243,255,0.10)"
							stroke-width="1"
						/>
						<circle
							cx="280"
							cy="280"
							r="180"
							fill="none"
							stroke="rgba(0,243,255,0.14)"
							stroke-width="1"
						/>
						<circle
							cx="280"
							cy="280"
							r="120"
							fill="none"
							stroke="rgba(0,243,255,0.18)"
							stroke-width="1"
						/>
						<circle
							cx="280"
							cy="280"
							r="60"
							fill="none"
							stroke="rgba(0,243,255,0.22)"
							stroke-width="1"
						/>

						<!-- Range labels -->
						<text
							x="344"
							y="276"
							fill="rgba(0,243,255,0.28)"
							font-size="9"
							font-family="'Courier New',monospace">60m</text
						>
						<text
							x="404"
							y="276"
							fill="rgba(0,243,255,0.22)"
							font-size="9"
							font-family="'Courier New',monospace">120m</text
						>
						<text
							x="462"
							y="276"
							fill="rgba(0,243,255,0.18)"
							font-size="9"
							font-family="'Courier New',monospace">180m</text
						>

						<!-- Crosshairs -->
						<line
							x1="32"
							y1="280"
							x2="528"
							y2="280"
							stroke="rgba(0,243,255,0.07)"
							stroke-width="1"
						/>
						<line
							x1="280"
							y1="32"
							x2="280"
							y2="528"
							stroke="rgba(0,243,255,0.07)"
							stroke-width="1"
						/>
						<line
							x1="104"
							y1="104"
							x2="456"
							y2="456"
							stroke="rgba(0,243,255,0.03)"
							stroke-width="1"
						/>
						<line
							x1="456"
							y1="104"
							x2="104"
							y2="456"
							stroke="rgba(0,243,255,0.03)"
							stroke-width="1"
						/>

						<!-- Rotating sweep -->
						<g class="nx-sweep-group" clip-path="url(#radarClip)">
							<path
								d="M 280 280 L 528 280 A 248 248 0 0 0 365 47 Z"
								fill="url(#sweepGrad)"
								opacity="0.9"
							/>
							<line
								x1="280"
								y1="280"
								x2="528"
								y2="280"
								stroke="rgba(0,243,255,0.6)"
								stroke-width="1.5"
							/>
						</g>

						<!-- Asset dot 1 — VH-04 (green, moving) -->
						<g class="nx-dot-ping" style="--ping-delay:0s">
							<circle cx="392" cy="120" r="10" fill="rgba(0,255,136,0.07)" class="nx-ping-ring" />
							<circle cx="392" cy="120" r="5" fill="#00ff88" filter="url(#glow)" />
							<text
								x="402"
								y="115"
								fill="rgba(0,255,136,0.75)"
								font-size="9"
								font-family="'Courier New',monospace">VH-04 ●</text
							>
							<text
								x="402"
								y="126"
								fill="rgba(0,255,136,0.45)"
								font-size="8"
								font-family="'Courier New',monospace">87km/h</text
							>
						</g>

						<!-- Asset dot 2 — HOGAR (cyan, parked) -->
						<g class="nx-dot-ping" style="--ping-delay:0.7s">
							<circle cx="162" cy="335" r="9" fill="rgba(0,243,255,0.07)" class="nx-ping-ring" />
							<circle cx="162" cy="335" r="4.5" fill="#00f3ff" filter="url(#glow)" />
							<text
								x="88"
								y="330"
								fill="rgba(0,243,255,0.75)"
								font-size="9"
								font-family="'Courier New',monospace">● HOGAR</text
							>
							<text
								x="88"
								y="341"
								fill="rgba(0,243,255,0.45)"
								font-size="8"
								font-family="'Courier New',monospace">detenido</text
							>
						</g>

						<!-- Asset dot 3 — UT-12 (blue, moving) -->
						<g class="nx-dot-ping" style="--ping-delay:1.4s">
							<circle cx="115" cy="418" r="9" fill="rgba(10,122,255,0.08)" class="nx-ping-ring" />
							<circle cx="115" cy="418" r="4.5" fill="#0a7aff" filter="url(#glow)" />
							<text
								x="60"
								y="412"
								fill="rgba(10,122,255,0.75)"
								font-size="9"
								font-family="'Courier New',monospace">● UT-12</text
							>
							<text
								x="60"
								y="423"
								fill="rgba(10,122,255,0.45)"
								font-size="8"
								font-family="'Courier New',monospace">62km/h</text
							>
						</g>

						<!-- Asset dot 4 — VH-01 (green, geofenced) -->
						<g class="nx-dot-ping" style="--ping-delay:2.1s">
							<circle cx="294" cy="201" r="9" fill="rgba(0,255,136,0.06)" class="nx-ping-ring" />
							<circle cx="294" cy="201" r="4" fill="#00ff88" filter="url(#glow)" />
							<text
								x="304"
								y="197"
								fill="rgba(0,255,136,0.70)"
								font-size="9"
								font-family="'Courier New',monospace">VH-01</text
							>
							<text
								x="304"
								y="208"
								fill="rgba(0,255,136,0.40)"
								font-size="8"
								font-family="'Courier New',monospace">geocerca</text
							>
						</g>

						<!-- Asset dot 5 — VH-09 (cyan, moving fast) -->
						<g class="nx-dot-ping" style="--ping-delay:2.8s">
							<circle cx="388" cy="151" r="9" fill="rgba(0,243,255,0.05)" class="nx-ping-ring" />
							<circle cx="388" cy="151" r="4" fill="#00f3ff" filter="url(#glow)" />
							<text
								x="398"
								y="147"
								fill="rgba(0,243,255,0.65)"
								font-size="9"
								font-family="'Courier New',monospace">VH-09</text
							>
							<text
								x="398"
								y="158"
								fill="rgba(0,243,255,0.38)"
								font-size="8"
								font-family="'Courier New',monospace">101km/h</text
							>
						</g>

						<!-- Asset dot 6 — UT-03 (blue, delivery) -->
						<g class="nx-dot-ping" style="--ping-delay:3.5s">
							<circle cx="329" cy="430" r="9" fill="rgba(10,122,255,0.07)" class="nx-ping-ring" />
							<circle cx="329" cy="430" r="4" fill="#0a7aff" filter="url(#glow)" />
							<text
								x="339"
								y="426"
								fill="rgba(10,122,255,0.70)"
								font-size="9"
								font-family="'Courier New',monospace">UT-03</text
							>
							<text
								x="339"
								y="437"
								fill="rgba(10,122,255,0.40)"
								font-size="8"
								font-family="'Courier New',monospace">entrega</text
							>
						</g>

						<!-- Center pip -->
						<circle cx="280" cy="280" r="4" fill="#00f3ff" filter="url(#glowStrong)" />
						<circle
							cx="280"
							cy="280"
							r="9"
							fill="none"
							stroke="rgba(0,243,255,0.4)"
							stroke-width="1"
						/>
						<circle
							cx="280"
							cy="280"
							r="16"
							fill="none"
							stroke="rgba(0,243,255,0.15)"
							stroke-width="1"
						/>

						<!-- HUD corner brackets -->
						<path
							d="M 20 60 L 20 20 L 60 20"
							fill="none"
							stroke="rgba(0,243,255,0.3)"
							stroke-width="1.5"
						/>
						<path
							d="M 500 20 L 540 20 L 540 60"
							fill="none"
							stroke="rgba(0,243,255,0.3)"
							stroke-width="1.5"
						/>
						<path
							d="M 20 500 L 20 540 L 60 540"
							fill="none"
							stroke="rgba(0,243,255,0.3)"
							stroke-width="1.5"
						/>
						<path
							d="M 500 540 L 540 540 L 540 500"
							fill="none"
							stroke="rgba(0,243,255,0.3)"
							stroke-width="1.5"
						/>

						<!-- HUD labels -->
						<text
							x="28"
							y="40"
							fill="rgba(0,243,255,0.4)"
							font-size="8"
							font-family="'Courier New',monospace"
							letter-spacing="0.12em">NEXUS // TRACKING ARRAY</text
						>
						<text
							x="28"
							y="532"
							fill="rgba(0,243,255,0.3)"
							font-size="8"
							font-family="'Courier New',monospace">LAT 19.432° N</text
						>
						<text
							x="28"
							y="545"
							fill="rgba(0,243,255,0.3)"
							font-size="8"
							font-family="'Courier New',monospace">LON 99.133° W</text
						>
						<text
							x="390"
							y="532"
							fill="rgba(0,255,136,0.45)"
							font-size="8"
							font-family="'Courier New',monospace">ASSETS: 6 ACTIVE</text
						>
						<text
							x="390"
							y="545"
							fill="rgba(0,243,255,0.3)"
							font-size="8"
							font-family="'Courier New',monospace">UPTIME: 98.7%</text
						>
					</svg>
				</div>
			</div>

			<div class="nx-scroll-cue" aria-hidden="true">
				<div class="nx-scroll-cue-line"></div>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
					><path d="M6 9l6 6 6-6" /></svg
				>
			</div>
		</section>

		<!-- VALUE PROPOSITION -->
		<section class="nx-value" id="inicio">
			<div class="nx-container">
				<div class="nx-reveal">
					<p class="nx-overline">Plataforma de Inteligencia Vehicular</p>
					<h2 class="nx-value-title">
						Un vehículo que sabes que está bien<br />vale más que uno que supones que está bien.
					</h2>
					<div class="nx-value-badges">
						<span class="nx-badge">Familias</span>
						<span class="nx-badge">Flotillas</span>
						<span class="nx-badge">Partners TaaS</span>
					</div>
				</div>
			</div>
		</section>

		<!-- SEGMENTS -->
		<section class="nx-segments" id="segmentos">
			<div class="nx-container">
				<div class="nx-section-header nx-reveal">
					<p class="nx-overline">Para quién es Nexus</p>
					<h2 class="nx-section-title">Inteligencia vehicular para cada necesidad</h2>
					<p class="nx-section-sub">Tres perfiles. Una plataforma. La misma precisión.</p>
				</div>

				<div class="nx-segments-grid">
					<!-- FAMILIAS -->
					<div class="nx-segment-card nx-card--familias nx-reveal">
						<div class="nx-card-eyebrow">Para Familias</div>
						<h3 class="nx-card-title">Protege a quien quieres. Sabe dónde están, siempre.</h3>
						<p class="nx-card-desc">
							Nexus te avisa si alguien sale de su ruta habitual, llega a un lugar que no debería, o
							si el carro se mueve a una hora en que nadie debería usarlo. No es espiar. Es saber
							que están bien.
						</p>
						<ul class="nx-card-cases">
							<li>Tu hijo adolescente maneja solo — sabes si llegó bien y a qué velocidad fue</li>
							<li>Prestaste el auto a un empleado — confirma que lo usa solo para el trabajo</li>
							<li>Tus padres adultos mayores salen solos — llegaron sin contratiempos</li>
							<li>Tu auto de valor está en la calle — cualquier movimiento inesperado te alerta</li>
						</ul>
						<div class="nx-card-pain">
							En México se roban más de 100,000 vehículos al año. La mayoría no saben hasta horas
							después.
						</div>
						<div class="nx-card-resolution">
							Con Nexus, el momento en que algo cambia, tú ya lo sabes.
						</div>
						<div class="nx-card-cta">
							<a href="#download" class="btn-nx-primary">Descargar la App</a>
						</div>
					</div>

					<!-- FLOTILLAS (featured) -->
					<div class="nx-segment-card nx-card--flotillas nx-card--featured nx-reveal">
						<div class="nx-card-eyebrow">Para Flotillas</div>
						<div class="nx-badge">Más popular</div>
						<h3 class="nx-card-title">Tu operación no para. Tu visibilidad tampoco.</h3>
						<p class="nx-card-desc">
							Conoce el estado real de cada unidad: posición exacta, comportamiento del conductor,
							consumo estimado — ahora mismo. Las flotillas pierden entre 20 y 30% de su presupuesto
							en ineficiencias perfectamente prevenibles.
						</p>

						<div class="nx-flotilla-tabs">
							{#each flotillaVerticals as v, i (v.label)}
								<button
									class="nx-tab-chip"
									class:active={activeVertical === i}
									onclick={() => (activeVertical = i)}
								>
									{v.label}
								</button>
							{/each}
						</div>
						<div class="nx-vertical-display">
							{flotillaVerticals[activeVertical].problem}
						</div>

						<div class="nx-card-resolution">
							Una flota de 20 vehículos puede ahorrar $240,000+ MXN al año solo en combustible.
						</div>
						<div class="nx-card-cta">
							<a href="#demo" class="btn-nx-primary">Agendar una Demo</a>
						</div>
					</div>

					<!-- PARTNERS TaaS -->
					<div class="nx-segment-card nx-card--partners nx-reveal">
						<div class="nx-card-eyebrow">Para Partners TaaS</div>
						<h3 class="nx-card-title">
							Tu hardware ya funciona. Dale la plataforma que se merece.
						</h3>
						<p class="nx-card-desc">
							Conecta tus dispositivos a Nexus vía JSON o MQTT y ofrece a tus clientes una
							plataforma completa — sin escribir front-end, sin construir infraestructura, sin
							contratar desarrollo.
						</p>

						<div class="nx-partner-split">
							<div class="nx-partner-col">
								<div class="nx-partner-col-label">Lo que obtienen</div>
								<ul class="nx-check-list">
									<li>Apps nativas (iOS, Android, Web)</li>
									<li>Telemetría en tiempo real</li>
									<li>Geocercas y alertas</li>
									<li>Reportes exportables</li>
									<li>Marca blanca incluida</li>
								</ul>
							</div>
							<div class="nx-partner-col">
								<div class="nx-partner-col-label">Sin necesitar</div>
								<ul class="nx-check-list">
									<li>Equipo de desarrollo propio</li>
									<li>Infraestructura de servidores</li>
									<li>Contratos mínimos anuales</li>
								</ul>
							</div>
						</div>

						<div class="nx-card-pain">
							El costo de construir esta plataforma desde cero supera los $500,000 MXN. Con Nexus
							TaaS, en producción esta semana.
						</div>
						<div class="nx-card-cta">
							<a href="#contacto" class="btn-nx-secondary">Contactar al Equipo</a>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- FEATURES -->
		<section class="nx-features" id="caracteristicas">
			<div class="nx-container">
				<div class="nx-section-header nx-reveal">
					<p class="nx-overline">Capacidades</p>
					<h2 class="nx-section-title">Todo lo que necesitas, en una sola plataforma</h2>
					<p class="nx-section-sub">Ocho capacidades clave diseñadas para el mundo real.</p>
				</div>

				<div class="nx-features-grid">
					<div class="nx-feature-item nx-reveal">
						<div class="nx-feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="3" />
								<circle cx="12" cy="12" r="7" opacity="0.4" />
								<circle cx="12" cy="12" r="11" opacity="0.2" />
							</svg>
						</div>
						<div class="nx-feature-name">Posición en vivo</div>
						<div class="nx-feature-desc">
							Ubicación exacta actualizada al instante, con velocidad y estado del motor.
						</div>
					</div>

					<div class="nx-feature-item nx-reveal">
						<div class="nx-feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="9" />
								<polyline points="12 7 12 12 15 15" />
								<path d="M17 3l2 2-2 2" />
								<path d="M19 5H12" />
							</svg>
						</div>
						<div class="nx-feature-name">Historial con replay</div>
						<div class="nx-feature-desc">
							Reproduce el recorrido completo de cualquier vehículo en cualquier día.
						</div>
					</div>

					<div class="nx-feature-item nx-reveal">
						<div class="nx-feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polygon points="12 2 19 7 19 17 12 22 5 17 5 7 12 2" />
								<polyline points="12 2 12 22" opacity="0.4" />
								<polyline points="5 7 19 7" opacity="0.4" />
								<polyline points="5 17 19 17" opacity="0.4" />
							</svg>
						</div>
						<div class="nx-feature-name">Geocercas de precisión</div>
						<div class="nx-feature-desc">
							Define zonas poligonales exactas. Sin los círculos aproximados que generan falsas
							alarmas.
						</div>
					</div>

					<div class="nx-feature-item nx-reveal">
						<div class="nx-feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
								<path d="M13.73 21a2 2 0 01-3.46 0" />
								<path d="M20 8l2-2M4 8L2 6" opacity="0.5" />
							</svg>
						</div>
						<div class="nx-feature-name">Alertas instantáneas</div>
						<div class="nx-feature-desc">
							Push inmediato por encendido, salida de zona, velocidad excesiva o pérdida de señal.
						</div>
					</div>

					<div class="nx-feature-item nx-reveal">
						<div class="nx-feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<polyline points="8 17 10 19 14 15" />
							</svg>
						</div>
						<div class="nx-feature-name">Reportes operacionales</div>
						<div class="nx-feature-desc">
							Consumo, kilómetros, tiempos y detenciones — exportables en PDF o Excel.
						</div>
					</div>

					<div class="nx-feature-item nx-reveal">
						<div class="nx-feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
								<path d="M9 12l2 2 4-4" />
							</svg>
						</div>
						<div class="nx-feature-name">Permisos granulares</div>
						<div class="nx-feature-desc">
							Cada usuario accede solo a los vehículos que le corresponden, por rol y por unidad.
						</div>
					</div>

					<div class="nx-feature-item nx-reveal">
						<div class="nx-feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="5" y="2" width="14" height="20" rx="2" />
								<line x1="12" y1="18" x2="12.01" y2="18" />
								<rect x="2" y="7" width="3" height="10" rx="1" opacity="0.4" />
							</svg>
						</div>
						<div class="nx-feature-name">Apps nativas</div>
						<div class="nx-feature-desc">
							Construidas para iOS, Android y Web. No una web disfrazada de app móvil.
						</div>
					</div>

					<div class="nx-feature-item nx-reveal">
						<div class="nx-feature-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="16 18 22 12 16 6" />
								<polyline points="8 6 2 12 8 18" />
								<line x1="12" y1="5" x2="12" y2="19" opacity="0.3" />
							</svg>
						</div>
						<div class="nx-feature-name">Integración JSON/MQTT</div>
						<div class="nx-feature-desc">
							Conecta tu hardware existente en días. Si envía posición, Nexus lo entiende.
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- DIFFERENTIATORS -->
		<section class="nx-diff" id="diferenciadores">
			<div class="nx-container">
				<div class="nx-section-header nx-reveal">
					<p class="nx-overline">Ventajas reales</p>
					<h2 class="nx-section-title">Por qué Nexus y no otro</h2>
					<p class="nx-section-sub">Diferencias concretas, no promesas de marketing.</p>
				</div>

				<ol class="nx-diff-list">
					<li class="nx-diff-item nx-reveal">
						<div class="nx-diff-num">01</div>
						<div class="nx-diff-content">
							<h4 class="nx-diff-title">Geocercas de precisión real</h4>
							<p class="nx-diff-text">
								La mayoría de las plataformas definen zonas con círculos que generan alertas que
								nadie atiende. Nexus utiliza tecnología de zonificación de siguiente generación — la
								misma que usan las plataformas de movilidad más exigentes del mundo — que permite
								perímetros con forma libre y precisión milimétrica.
							</p>
						</div>
					</li>

					<li class="nx-diff-item nx-reveal">
						<div class="nx-diff-num">02</div>
						<div class="nx-diff-content">
							<h4 class="nx-diff-title">Telemetría real, no solo un punto en el mapa</h4>
							<p class="nx-diff-text">
								Un punto te dice dónde está el vehículo. Nexus te dice cómo está: voltaje de
								batería, calidad de señal, velocidad media, paradas detectadas, consumo estimado. La
								diferencia entre rastrear y entender tu activo.
							</p>
						</div>
					</li>

					<li class="nx-diff-item nx-reveal">
						<div class="nx-diff-num">03</div>
						<div class="nx-diff-content">
							<h4 class="nx-diff-title">Privacidad configurable</h4>
							<p class="nx-diff-text">
								Conductor, supervisor, administrador, cliente con vista limitada — cada rol ve
								exactamente lo que debe ver, nada más. Control por vehículo, por usuario y por
								horario. Sin manuales.
							</p>
						</div>
					</li>

					<li class="nx-diff-item nx-reveal">
						<div class="nx-diff-num">04</div>
						<div class="nx-diff-content">
							<h4 class="nx-diff-title">App nativa construida para lo que importa</h4>
							<p class="nx-diff-text">
								No un portal web adaptado para móvil. Mapas fluidos, notificaciones que llegan
								aunque el teléfono esté en reposo, interfaz para usarse con una mano. La diferencia
								se siente la primera vez que recibes una alerta a las 2am.
							</p>
						</div>
					</li>

					<li class="nx-diff-item nx-reveal">
						<div class="nx-diff-num">05</div>
						<div class="nx-diff-content">
							<h4 class="nx-diff-title">TaaS: tu hardware, nuestra plataforma</h4>
							<p class="nx-diff-text">
								Si ya tienes dispositivos GPS o eres fabricante, Nexus recibe sus datos sin cambio
								de equipo. Tu cliente ve una plataforma completa con tu marca desde el primer día.
								El time-to-market que tomaría meses, en días.
							</p>
						</div>
					</li>
				</ol>
			</div>
		</section>

		<!-- SOCIAL PROOF -->
		<section class="nx-proof" id="evidencia">
			<div class="nx-container">
				<div class="nx-stats-bar nx-reveal">
					<div class="nx-stat">
						<span class="nx-stat-num">{statValues.vehicles.toLocaleString()}+</span>
						<span class="nx-stat-label">vehículos monitoreados activamente</span>
					</div>
					<div class="nx-stat">
						<span class="nx-stat-num">{statValues.uptime.toFixed(1)}%</span>
						<span class="nx-stat-label">uptime garantizado en los últimos 12 meses</span>
					</div>
					<div class="nx-stat">
						<span class="nx-stat-num">{statValues.rating.toFixed(1)} / 5</span>
						<span class="nx-stat-label">calificación en App Store y Google Play</span>
					</div>
				</div>

				<div class="nx-testimonials-grid">
					<div class="nx-testimonial nx-reveal">
						<div class="nx-testimonial-quote">"</div>
						<p class="nx-testimonial-text">
							Tengo tres hijos y dos carros que les presto. Ahora sé exactamente dónde están y si se
							salen de la ruta me avisa de inmediato. Nexus me devolvió la calma que no sabía que
							había perdido.
						</p>
						<div class="nx-testimonial-author">
							<strong>Claudia R.</strong>
							<span>Madre de familia, Monterrey</span>
						</div>
					</div>

					<div class="nx-testimonial nx-reveal">
						<div class="nx-testimonial-quote">"</div>
						<p class="nx-testimonial-text">
							En los primeros dos meses redujimos el desperdicio de combustible de 12% a menos del
							2%. Los números hablan solos.
						</p>
						<div class="nx-testimonial-author">
							<strong>Ing. Martínez</strong>
							<span>Director de Operaciones, flota de 35 unidades</span>
						</div>
					</div>

					<div class="nx-testimonial nx-reveal">
						<div class="nx-testimonial-quote">"</div>
						<p class="nx-testimonial-text">
							Desde que implementamos Nexus no hemos tenido un solo robo en obra. Las geocercas nos
							avisan de madrugada si algo se mueve fuera de horario.
						</p>
						<div class="nx-testimonial-author">
							<strong>Gerente de Proyectos</strong>
							<span>Constructora, norte de México</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- FAQ -->
		<section class="nx-faq" id="preguntas">
			<div class="nx-container">
				<div class="nx-section-header nx-reveal">
					<p class="nx-overline">Respuestas claras</p>
					<h2 class="nx-section-title">Preguntas frecuentes</h2>
					<p class="nx-section-sub">Sin rodeos. Sin letra pequeña.</p>
				</div>

				<div class="nx-faq-tabs">
					<button
						class="nx-faq-tab"
						class:active={faqTab === 'familias'}
						onclick={() => {
							faqTab = 'familias';
						}}>Familias</button
					>
					<button
						class="nx-faq-tab"
						class:active={faqTab === 'flotillas'}
						onclick={() => {
							faqTab = 'flotillas';
						}}>Flotillas</button
					>
					<button
						class="nx-faq-tab"
						class:active={faqTab === 'partners'}
						onclick={() => {
							faqTab = 'partners';
						}}>Partners</button
					>
				</div>

				<div class="nx-faq-list">
					{#each faqData[faqTab] as item, i (item.q)}
						<div class="nx-faq-item">
							<button
								class="nx-faq-q"
								onclick={() => toggleFaq(faqTab, i)}
								aria-expanded={openFaq[faqTab] === i}
							>
								<span>{item.q}</span>
								<span class="nx-faq-chevron" class:open={openFaq[faqTab] === i}>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										width="18"
										height="18"
									>
										<path d="M6 9l6 6 6-6" />
									</svg>
								</span>
							</button>
							{#if openFaq[faqTab] === i}
								<div class="nx-faq-a">
									<p>{item.a}</p>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- CTA SECTION -->
		<section class="nx-ctas" id="demo">
			<div class="nx-container">
				<div class="nx-cta-grid">
					<!-- Familias CTA -->
					<div class="nx-cta-card nx-reveal">
						<div class="nx-cta-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
								<polyline points="9 22 9 12 15 12 15 22" />
								<circle cx="18" cy="5" r="2" fill="currentColor" opacity="0.4" />
							</svg>
						</div>
						<h3 class="nx-cta-title">Para tu familia</h3>
						<p class="nx-cta-desc">Descarga la app y empieza en minutos. Sin contratos forzosos.</p>
						<div class="nx-cta-actions">
							<a href="#download" class="btn-nx-secondary">App Store</a>
							<a href="#download" class="btn-nx-secondary">Google Play</a>
						</div>
					</div>

					<!-- Flotillas CTA (featured) -->
					<div class="nx-cta-card nx-cta-card--featured nx-reveal">
						<div class="nx-cta-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="1" y="3" width="15" height="13" />
								<polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
								<circle cx="5.5" cy="18.5" r="2.5" />
								<circle cx="18.5" cy="18.5" r="2.5" />
							</svg>
						</div>
						<h3 class="nx-cta-title">Para tu flotilla</h3>
						<p class="nx-cta-desc">
							Te mostramos cómo Nexus se adapta a tu operación exacta — en 30 minutos.
						</p>
						<div class="nx-cta-actions">
							<a href="#demo-form" class="btn-nx-primary">Agendar una Demo</a>
						</div>
					</div>

					<!-- Partners CTA -->
					<div class="nx-cta-card nx-reveal">
						<div class="nx-cta-icon">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="16 18 22 12 16 6" />
								<polyline points="8 6 2 12 8 18" />
								<circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.4" />
							</svg>
						</div>
						<h3 class="nx-cta-title">Para Partners y Distribuidores</h3>
						<p class="nx-cta-desc">
							Habla con nuestro equipo técnico y pon en marcha tu primera integración esta semana.
						</p>
						<div class="nx-cta-actions">
							<a href="#contacto" class="btn-nx-secondary">Contactar al Equipo</a>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- LEGAL -->
		<section class="nx-legal">
			<div class="nx-container">
				<nav class="nx-legal-links" aria-label="Documentos legales">
					<a href="/legal/terminos">Términos de Uso</a>
					<span class="nx-legal-sep" aria-hidden="true">·</span>
					<a href="/legal/privacidad">Política de Privacidad</a>
					<span class="nx-legal-sep" aria-hidden="true">·</span>
					<a href="/legal/aviso">Aviso Legal</a>
				</nav>
				<p class="nx-legal-note">
					Los precios no incluyen IVA. Disponibilidad sujeta a cobertura de red. Nexus es una
					plataforma de Geminis Labs.
				</p>
			</div>
		</section>
	</main>
</div>
