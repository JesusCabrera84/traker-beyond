<script>
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import HeroParticles from '$lib/components/HeroParticles.svelte';
	import HeroGlitch from '$lib/components/HeroGlitch.svelte';
	import HeroTitle from '$lib/components/HeroTitle.svelte';
	import { buildApiUrl, API_CONFIG } from '$lib/config/api.js';

	// Variables para efectos parallax
	let scrollY = 0;
	let innerHeight = 0;

	// Variable para detectar si estamos en móvil
	let isMobile = false;

	// Selector de producto (Nexus / Orion)
	let activeProduct = 'nexus';
	function onProductTabKey(e) {
		if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
		e.preventDefault();
		activeProduct = e.key === 'ArrowLeft' || e.key === 'Home' ? 'nexus' : 'orion';
		e.currentTarget.parentElement?.querySelector('#tab-' + activeProduct)?.focus();
	}

	// Partículas del fondo de Orion (fluyen de la esquina inferior izquierda hacia el logo,
	// cruzando también por detrás del texto de la izquierda)
	const orionParticles = Array.from({ length: 44 }, () => ({
		sx: -(220 + Math.random() * 820), // desplazamiento inicial a la izquierda (px)
		sy: 60 + Math.random() * 440, // desplazamiento inicial hacia abajo (px)
		d: +(Math.random() * 8).toFixed(2),
		dur: +(5 + Math.random() * 5).toFixed(2),
		s: +(1.8 + Math.random() * 2.6).toFixed(1),
		o: +(0.35 + Math.random() * 0.5).toFixed(2)
	}));

	// Video de fondo del título: pausado, reproduce en hover, rebobina en reversa al salir
	let titleVideo;
	let titleRewindRAF;
	function titlePlay() {
		if (!titleVideo) return;
		cancelAnimationFrame(titleRewindRAF);
		titleVideo.play().catch(() => {});
	}
	function titleRewind() {
		if (!titleVideo) return;
		titleVideo.pause();
		cancelAnimationFrame(titleRewindRAF);
		const step = () => {
			if (!titleVideo) return;
			titleVideo.currentTime = Math.max(0, titleVideo.currentTime - 1 / 30);
			if (titleVideo.currentTime > 0.01) titleRewindRAF = requestAnimationFrame(step);
		};
		titleRewindRAF = requestAnimationFrame(step);
	}

	// Áreas (badges) con efecto hover de cuadros a negro + descripción
	let hoveredArea = null;
	const areas = [
		{
			label: 'Inteligencia Artificial',
			icon: 'brain',
			headline: 'IA + Intuición Humana',
			sub: 'Mejores decisiones, no reemplazo humano'
		},
		{
			label: 'IoT',
			icon: 'cpu',
			headline: 'Mundo físico + Mundo digital',
			sub: 'Sensores, ubicación, datos, contexto y soluciones'
		},
		{
			label: 'Telecomunicaciones',
			icon: 'radio',
			headline: 'Humanidad + tecnología',
			sub: 'La tecnología amplifica capacidades y alcance humano'
		},
		{
			label: 'Análisis Geoespacial',
			icon: 'satellite',
			headline: 'Datos + Propósito',
			sub: 'Información convertida en acción'
		},
		{
			label: 'Investigación',
			icon: 'flask',
			headline: 'Soluciones eficientes + innovación =',
			brand: 'Geminis Labs',
			sub: ''
		}
	];
	// Variable para reCAPTCHA
	const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

	// Variables para el formulario de contacto
	let formData = {
		nombre: '',
		correo_electronico: '',
		telefono: '',
		mensaje: ''
	};

	let formErrors = {
		nombre: '',
		correo_electronico: '',
		telefono: '',
		mensaje: '',
		general: ''
	};

	let isSubmitting = false;
	let submitSuccess = false;
	let submitMessage = '';

	// Carousel Nexus
	const nexusImages = [
		'/img/products/nexus/flayer-1.jpg',
		'/img/products/nexus/flayer-2.png',
		'/img/products/nexus/flayer-3.png',
		'/img/products/nexus/flayer-4.png'
	];
	let currentNexusSlide = 0;
	let nexusCarouselInterval;

	// Rotating Features Data
	const nexusFeatures = [
		{
			title: 'Rastreo en tiempo real',
			items: [
				'Ubicación precisa por GPS',
				'Historial y reproducción de trayectos',
				'Estados de movimiento y detención'
			]
		},
		{
			title: 'Eventos que importan',
			items: [
				'Alertas por movimiento no autorizado',
				'Excesos, desconexiones y anomalías',
				'Notificaciones configurables en tiempo real'
			]
		},
		{
			title: 'Control operativo centralizado',
			items: [
				'Gestión de flotas y unidades',
				'Mantenimiento y consumo',
				'Visibilidad completa desde un solo panel'
			]
		},
		{
			title: 'Datos listos para decisión',
			items: [
				'Reportes automáticos',
				'Métricas operativas clave',
				'Información accionable, no solo registros'
			]
		},
		{
			title: 'Diseñado para escalar',
			items: [
				'Desde una unidad hasta miles',
				'Arquitectura preparada para crecimiento',
				'Operación estable 24/7'
			]
		}
	];
	let currentFeatureIndex = 0;
	let nexusFeaturesInterval;

	// Orion Features Data
	const orionFeatures = [
		{
			title: 'Motor de Localización',
			description:
				'Triangulación multi-celda, Procesamiento de señal independiente del carrier, Lógica adaptativa para entornos urbanos y rurales, No requiere GPS'
		},
		{
			title: 'Modelo de Precisión',
			description:
				'Radio de confianza dinámico, Precisión ajustada por densidad de señal, Estimación basada en entorno, Ponderación por intensidad de señal'
		},
		{
			title: 'Rendimiento y Respuesta',
			description:
				'Resolución casi en tiempo real, Optimizado para baja latencia, Arquitectura de alta disponibilidad, Diseñado para escalamiento masivo'
		},
		{
			title: 'Cobertura',
			description:
				'Soporte nacional y transfronterizo, Independiente del operador, Lógica optimizada para ciudad y carretera'
		},
		{
			title: 'Capa de Inteligencia',
			description:
				'Análisis histórico de patrones, Inferencia de movimiento, Estimación probabilística de zonas, Preparado para detección de anomalías'
		},
		{
			title: 'Seguridad y Privacidad',
			description:
				'Sin rastreo de dispositivos, Sin identificadores persistentes, Flujo de solicitudes cifrado, Arquitectura orientada a privacidad'
		},
		{
			title: 'Integración',
			description:
				'API REST, Consultas en tiempo real y por lotes, Diseñado para sistemas backend, Preparado para fusión con Nexus'
		}
	];
	let currentOrionFeatureIndex = 0;
	let orionInterval;

	let innerWindowWidth;

	onMount(() => {
		// Nexus Carousel Autoplay
		nexusCarouselInterval = setInterval(() => {
			currentNexusSlide = (currentNexusSlide + 1) % nexusImages.length;
		}, 8000); // Cambia cada 8 segundos

		// Orion Features Rotation
		orionInterval = setInterval(() => {
			currentOrionFeatureIndex = (currentOrionFeatureIndex + 1) % orionFeatures.length;
		}, 8000); // Cambia cada 8 segundos

		// Nexus Features Rotation
		nexusFeaturesInterval = setInterval(() => {
			currentFeatureIndex = (currentFeatureIndex + 1) % nexusFeatures.length;
		}, 8000); // Cambia cada 8 segundos

		// Cargar el script de reCAPTCHA v3
		if (recaptchaSiteKey) {
			loadRecaptchaScript();
		}

		// Detectar si estamos en móvil
		const checkMobile = () => {
			isMobile = window.innerWidth <= 768;
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		// Smooth scrolling para los enlaces de navegación
		const links = document.querySelectorAll('a[href^="#"]');
		links.forEach((link) => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const target = document.querySelector(link.getAttribute('href'));
				if (target) {
					target.scrollIntoView({ behavior: 'smooth' });
				}
			});
		});

		// Cleanup
		return () => {
			window.removeEventListener('resize', checkMobile);

			if (nexusCarouselInterval) clearInterval(nexusCarouselInterval);
			if (nexusFeaturesInterval) clearInterval(nexusFeaturesInterval);
			if (orionInterval) clearInterval(orionInterval);
		};
	});

	// Función para lazy loading de videos que no están en el viewport inicial
	function _lazyVideo(node, src) {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					node.src = src;
					node.load();
					const playPromise = node.play();
					if (playPromise !== undefined) {
						playPromise.catch(() => {});
					}
					observer.unobserve(node);
				}
			},
			{ rootMargin: '400px' } // Cargamos el video 400px antes de que entre en pantalla
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	// Scroll-reveal: añade la clase 'is-revealed' cuando el nodo entra en viewport.
	// Solo anima opacity/transform (sin reflow). Seguro sin JS: el default es visible.
	function _reveal(node) {
		const reduce =
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			node.classList.add('is-revealed');
			return {};
		}
		node.classList.add('tc-reveal');
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-revealed');
						observer.unobserve(entry.target);
					}
				});
			},
			{ rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	// Capas de la sección "Tecnologías que convergen"
	const tcLayers = [
		{
			num: '01',
			title: 'Capa de señales',
			accent: '#0e3a4a',
			icon: 'signal',
			desc: 'Capturamos el mundo físico en tiempo real.',
			chips: [
				'GPS',
				'Celdas celulares',
				'WiFi',
				'Sensores',
				'LoRa',
				'Dispositivos móviles',
				'Telemetría vehicular'
			]
		},
		{
			num: '02',
			title: 'Capa de infraestructura',
			accent: '#0a5266',
			icon: 'infra',
			desc: 'Movemos y almacenamos los datos a gran escala.',
			chips: [
				'Cloud',
				'APIs',
				'Kafka/Redpanda',
				'Bases geoespaciales',
				'Procesamiento en tiempo real',
				'Sistemas distribuidos'
			]
		},
		{
			num: '03',
			title: 'Capa de inteligencia',
			accent: '#0a6a80',
			icon: 'brain',
			desc: 'Convertimos datos en patrones y predicciones.',
			chips: [
				'IA',
				'Modelos predictivos',
				'Detección de anomalías',
				'Análisis histórico',
				'Clasificación de eventos'
			]
		},
		{
			num: '04',
			title: 'Capa de experiencia',
			accent: '#0883a0',
			icon: 'layout',
			desc: 'Entregamos decisiones a las personas.',
			chips: ['Panel web', 'App móvil', 'Alertas', 'Mapas', 'Reportes', 'APIs e integraciones']
		}
	];

	// Función para cargar el script de reCAPTCHA v3
	function loadRecaptchaScript() {
		if (document.querySelector(`script[src*="recaptcha"]`)) {
			return; // Script ya cargado
		}

		const script = document.createElement('script');
		script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);
	}

	// Función para generar el token de reCAPTCHA
	async function generateRecaptchaToken(action = 'submit') {
		if (!recaptchaSiteKey || !window.grecaptcha) {
			console.warn('reCAPTCHA no está configurado o no se ha cargado');
			return null;
		}

		try {
			await window.grecaptcha.ready(() => {});
			const token = await window.grecaptcha.execute(recaptchaSiteKey, { action });
			return token;
		} catch (error) {
			console.error('Error al generar token de reCAPTCHA:', error);
			return null;
		}
	}

	// Función para sanitizar HTML y caracteres especiales
	function sanitizeInput(input) {
		if (!input) return '';
		// Remover etiquetas HTML
		const div = document.createElement('div');
		div.textContent = input;
		return div.innerHTML
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#x27;')
			.replace(/\//g, '&#x2F;');
	}

	// Función para validar email
	function isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Función para validar teléfono (solo dígitos entre 7 y 20)
	function isValidPhone(phone) {
		const digits = phone.replace(/\D/g, ''); // Eliminar todo lo que no sea dígito
		return digits.length >= 7 && digits.length <= 20;
	}

	// Función para validar el formulario
	function validateForm() {
		let isValid = true;
		formErrors = {
			nombre: '',
			correo_electronico: '',
			telefono: '',
			mensaje: '',
			general: ''
		};

		// Validar nombre
		if (!formData.nombre.trim()) {
			formErrors.nombre = 'El nombre es requerido';
			isValid = false;
		} else if (formData.nombre.length > 200) {
			formErrors.nombre = 'El nombre no puede exceder los 200 caracteres';
			isValid = false;
		}

		// Validar mensaje
		if (!formData.mensaje.trim()) {
			formErrors.mensaje = 'El mensaje es requerido';
			isValid = false;
		} else if (formData.mensaje.length > 5000) {
			formErrors.mensaje = 'El mensaje no puede exceder los 5000 caracteres';
			isValid = false;
		}

		// Validar que al menos uno de correo o teléfono esté presente
		const hasEmail = formData.correo_electronico.trim().length > 0;
		const hasPhone = formData.telefono.trim().length > 0;

		if (!hasEmail && !hasPhone) {
			formErrors.general = 'Debes proporcionar al menos un correo electrónico o teléfono';
			isValid = false;
		}

		// Validar formato de email si está presente
		if (hasEmail && !isValidEmail(formData.correo_electronico)) {
			formErrors.correo_electronico = 'El formato del correo electrónico no es válido';
			isValid = false;
		}

		// Validar teléfono si está presente
		if (hasPhone && !isValidPhone(formData.telefono)) {
			formErrors.telefono = 'El teléfono debe contener entre 7 y 20 dígitos';
			isValid = false;
		}

		return isValid;
	}

	// Función para manejar el envío del formulario de contacto
	async function handleContactSubmit(event) {
		event.preventDefault();

		// Resetear mensajes previos
		submitSuccess = false;
		submitMessage = '';

		// Validar formulario
		if (!validateForm()) {
			return;
		}

		// Preparar datos sanitizados
		const sanitizedData = {
			nombre: sanitizeInput(formData.nombre.trim()),
			mensaje: sanitizeInput(formData.mensaje.trim())
		};

		// Agregar correo si está presente
		if (formData.correo_electronico.trim()) {
			sanitizedData.correo_electronico = sanitizeInput(formData.correo_electronico.trim());
		}

		// Agregar teléfono si está presente
		if (formData.telefono.trim()) {
			sanitizedData.telefono = sanitizeInput(formData.telefono.trim());
		}

		// Enviar a la API
		isSubmitting = true;

		try {
			// Generar token de reCAPTCHA v3
			const recaptchaToken = await generateRecaptchaToken('contact_form');

			// Agregar token de reCAPTCHA si se generó correctamente
			if (recaptchaToken) {
				sanitizedData.recaptcha_token = recaptchaToken;
			} else if (recaptchaSiteKey) {
				// Si está configurado pero falló, mostrar error
				submitSuccess = false;
				submitMessage = 'Error al verificar reCAPTCHA. Por favor, intenta nuevamente.';
				isSubmitting = false;
				return;
			}

			// Construir la URL usando la configuración centralizada
			const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.SEND_CONTACT_MESSAGE);

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: API_CONFIG.DEFAULT_HEADERS,
				body: JSON.stringify(sanitizedData)
			});

			const result = await response.json();

			if (response.ok) {
				submitSuccess = true;
				submitMessage = result.message || 'Mensaje enviado exitosamente';

				// Limpiar formulario
				formData = {
					nombre: '',
					correo_electronico: '',
					telefono: '',
					mensaje: ''
				};

				// Ocultar mensaje de éxito después de 5 segundos
				setTimeout(() => {
					submitSuccess = false;
					submitMessage = '';
				}, 5000);
			} else {
				submitSuccess = false;
				submitMessage =
					result.message || 'Error al enviar el mensaje. Por favor, intenta nuevamente.';
			}
		} catch (error) {
			submitSuccess = false;
			submitMessage =
				'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.';
			console.error('Error al enviar mensaje:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:window bind:scrollY bind:innerHeight bind:innerWidth={innerWindowWidth} />

<svelte:head>
	<title>Geminis Labs</title>
	<meta name="description" content="Soluciones avanzadas" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet" />
</svelte:head>

<!-- Canvas decorativo de fondo (CSS puro, sin video) -->
<div class="page-canvas" aria-hidden="true">
	<div class="orb orb-1"></div>
	<div class="orb orb-2"></div>
	<div class="orb orb-3"></div>
	<div class="orb orb-4"></div>
	<div class="grid-lines"></div>
</div>

<!-- Navegación fija -->
<Navbar />

<!-- Sección Hero -->
<section id="inicio" class="hero-particle-section">
	<!-- Video original oculto — HeroGlitch lo dibuja en canvas con el efecto -->
	<video
		class="hero-bg-video"
		src="/vid/cyberhuman-hero.mp4"
		autoplay
		muted
		loop
		playsinline
		on:loadedmetadata={(e) => (e.currentTarget.playbackRate = 0.85)}
	></video>
	<HeroGlitch />

	<!-- Capas de atmósfera visual -->
	<div class="hero-vignette" aria-hidden="true"></div>
	<div class="hero-video-fade" aria-hidden="true"></div>
	<div class="hero-video-bottom-fade" aria-hidden="true"></div>
	<div class="hero-scanlines" aria-hidden="true"></div>
	<div class="hero-right-glow" aria-hidden="true"></div>

	<HeroParticles />

	<div class="hero-text-overlay" style="transform: translateY({isMobile ? 0 : scrollY * 0.08}px)">
		<div class="hero-label" aria-hidden="true">// GEMINIS LABS · AI &amp; CONNECTIVITY</div>
		<HeroTitle />
		<div
			class="hero-particle-buttons"
			style="transform: translateY({isMobile ? 0 : -scrollY * 0.08}px)"
		>
			<a href="#servicios" class="btn-primary">Descubre Nuestros Servicios</a>
			<a href="#contacto" class="btn-secondary">Contactar Ahora</a>
		</div>
	</div>
</section>

<!-- Sección Laboratorio Tecnológico -->
<section id="ecosistema" class="lab-section">
	<span id="servicios" style="position:absolute; top:-80px;"></span>
	<div class="lab-noise" aria-hidden="true"></div>
	<div class="lab-head">
		<h2 class="landing-section-title lab-section-title">
			¿Qué es <span class="brand">Geminis Labs</span>?
		</h2>
	</div>
	<div class="container lab-grid">
		<div class="lab-left">
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="lab-title-media" on:mouseenter={titlePlay} on:mouseleave={titleRewind}>
				<video
					bind:this={titleVideo}
					class="lab-title-video"
					src="/vid/title-tech.mp4"
					muted
					playsinline
					preload="auto"
				></video>
				<span class="lab-title-scrim" aria-hidden="true"></span>
				<h2 class="landing-section-title lab-title">Tecnología al servicio de la humanidad</h2>
			</div>
		</div>
		<div class="lab-center">
			<img
				src="/img/foco-no-bg.png"
				alt="Foco con tecnología y naturaleza integradas"
				class="lab-bulb"
			/>
		</div>
		<div class="lab-right">
			<p class="lab-lead">
				Geminis Labs es un laboratorio tecnológico dedicado a construir
				<strong>productos e infraestructura</strong> para resolver problemas reales mediante
				inteligencia artificial, IoT, telecomunicaciones, análisis geoespacial y sistemas
				distribuidos — <strong>a beneficio de la humanidad</strong>.
			</p>
		</div>
	</div>

	<!-- Áreas: badges con icono + efecto hover -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="lab-areas"
		class:focused={hoveredArea !== null}
		on:mouseleave={() => (hoveredArea = null)}
	>
		{#each areas as area, i (area.label)}
			<div
				class="lab-cap"
				class:active={hoveredArea === i}
				class:dim={hoveredArea !== null && hoveredArea !== i}
				on:mouseenter={() => (hoveredArea = i)}
			>
				<span class="lab-cap-icon">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						{#if area.icon === 'brain'}
							<path
								d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"
							/>
							<path
								d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"
							/>
						{:else if area.icon === 'cpu'}
							<rect x="4" y="4" width="16" height="16" rx="2" />
							<rect x="9" y="9" width="6" height="6" />
							<path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
						{:else if area.icon === 'radio'}
							<circle cx="12" cy="12" r="2" />
							<path
								d="M4.93 19.07a10 10 0 0 1 0-14.14M7.76 16.24a6 6 0 0 1 0-8.49M16.24 7.76a6 6 0 0 1 0 8.49M19.07 4.93a10 10 0 0 1 0 14.14"
							/>
						{:else if area.icon === 'satellite'}
							<path d="M4 10a7.31 7.31 0 0 0 10 10Z" />
							<path d="m9 15 3-3" />
							<path d="M17 13a6 6 0 0 0-6-6" />
							<path d="M21 13A10 10 0 0 0 11 3" />
						{:else if area.icon === 'flask'}
							<path d="M10 2v7.31" />
							<path d="M14 9.3V2" />
							<path d="M8.5 2h7" />
							<path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
							<path d="M5.52 16h12.96" />
						{/if}
					</svg>
				</span>
				<span class="lab-cap-label">{area.label}</span>
				<div class="lab-cap-detail">
					<h3>
						{area.headline}
						{#if area.brand}<span class="brand"> {area.brand}</span>{/if}
					</h3>
					{#if area.sub}<p>{area.sub}</p>{/if}
				</div>
			</div>
		{/each}
	</div>
</section>

<div class="section-sep"></div>

<!-- Sección Tecnologías que convergen -->
<section id="tecnologias" class="tc-section" aria-labelledby="tc-title">
	<span id="tecnologias-anchor" style="position:absolute; top:-80px;"></span>

	<div class="tc-inner">
		<header class="tc-head">
			<h2 id="tc-title" class="landing-section-title tc-title">Tecnologías que convergen</h2>
			<p class="tc-subhead">De la señal física a la decisión humana.</p>
		</header>

		<div class="tc-grid">
			<!-- LEFT: cuadrícula 2×2 de las cuatro capas -->
			<ol class="tc-layers">
				{#each tcLayers as layer, i (layer.num)}
					<li class="tc-layer-item" style="--tc-accent: {layer.accent};">
						<article class="tc-card" use:_reveal style="--tc-delay: {i * 90}ms;">
							<div class="tc-card-head">
								<span class="tc-icon" aria-hidden="true">
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.8"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										{#if layer.icon === 'signal'}
											<path d="M2 20h.01" />
											<path d="M7 20v-4" />
											<path d="M12 20v-8" />
											<path d="M17 20V8" />
											<path d="M22 4v16" />
										{:else if layer.icon === 'infra'}
											<rect x="2" y="3" width="20" height="6" rx="1.5" />
											<rect x="2" y="15" width="20" height="6" rx="1.5" />
											<path d="M6 6h.01M6 18h.01" />
										{:else if layer.icon === 'brain'}
											<path
												d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 0 3 3 0 0 0 2-5 3 3 0 0 0-2-5 3 3 0 0 0-3-3Z"
											/>
											<path d="M12 5v14" />
										{:else if layer.icon === 'layout'}
											<rect x="3" y="3" width="18" height="18" rx="2" />
											<path d="M3 9h18M9 21V9" />
										{/if}
									</svg>
								</span>
								<span class="tc-num" aria-hidden="true">{layer.num}</span>
								<h3 class="tc-card-title">{layer.title}</h3>
							</div>

							<p class="tc-card-desc">{layer.desc}</p>

							<ul class="tc-chips">
								{#each layer.chips as chip (`${layer.num}-${chip}`)}
									<li class="tc-chip">{chip}</li>
								{/each}
							</ul>
						</article>
					</li>
				{/each}
			</ol>

			<!-- RIGHT: spine de convergencia -->
			<aside class="tc-spine" aria-hidden="true">
				<div class="tc-spine-frame">
					<span class="tc-spine-bloom"></span>
					<video
						class="tc-spine-video"
						muted
						loop
						autoplay
						playsinline
						preload="metadata"
						poster="/img/technology-man.png"
						on:loadedmetadata={(e) => (e.currentTarget.playbackRate = 0.7)}
					>
						<source src="/vid/technology-man.mp4" type="video/mp4" />
					</video>
				</div>
			</aside>
		</div>

		<p class="tc-message">
			No construimos tecnología aislada. Construimos sistemas completos:
			<strong>desde la señal física hasta la decisión humana.</strong>
		</p>
	</div>
</section>

<div class="section-sep"></div>

<!-- Sección Productos -->
<section id="productos" class="nexus-section">
	<div class="nexus-head">
		<h2 class="landing-section-title">Nuestros Productos</h2>
		<div class="nx-tabs" role="tablist" aria-label="Productos">
			<button
				type="button"
				role="tab"
				id="tab-nexus"
				class="nx-tab"
				class:is-active={activeProduct === 'nexus'}
				aria-selected={activeProduct === 'nexus'}
				aria-controls="panel-nexus"
				tabindex={activeProduct === 'nexus' ? 0 : -1}
				on:click={() => (activeProduct = 'nexus')}
				on:keydown={onProductTabKey}
			>
				Nexus
			</button>
			<button
				type="button"
				role="tab"
				id="tab-orion"
				class="nx-tab"
				class:is-active={activeProduct === 'orion'}
				aria-selected={activeProduct === 'orion'}
				aria-controls="panel-orion"
				tabindex={activeProduct === 'orion' ? 0 : -1}
				on:click={() => (activeProduct = 'orion')}
				on:keydown={onProductTabKey}
			>
				Orion
			</button>
		</div>
	</div>

	<article class="nx-card" data-product={activeProduct} use:_reveal>
		<div class="nx-panels">
			<!-- NEXUS -->
			<div
				class="nx-panel"
				class:is-active={activeProduct === 'nexus'}
				id="panel-nexus"
				role="tabpanel"
				aria-labelledby="tab-nexus"
				aria-hidden={activeProduct !== 'nexus'}
			>
				<div class="nx-content">
					<p class="nx-eyebrow">Producto</p>
					<h3 class="nx-title">NEXUS</h3>
					<p class="nx-subtitle">
						Nexus es una plataforma de rastreo inteligente diseñada para proteger vehículos,
						personas y operaciones mediante ubicación en tiempo real, alertas y análisis de
						movilidad
					</p>

					<ul class="nx-audiences">
						<li class="nx-aud">
							<span class="nx-aud-label">Para familia</span>
							<span class="nx-aud-benefit">Protege a quienes más quieres</span>
						</li>
						<li class="nx-aud">
							<span class="nx-aud-label">Para flotillas</span>
							<span class="nx-aud-benefit">Control donde quiera que estés</span>
						</li>
						<li class="nx-aud">
							<span class="nx-aud-label">Para negocios</span>
							<span class="nx-aud-benefit">Integra fácil tus datos</span>
						</li>
					</ul>

					<div class="nx-lists">
						<div class="nx-list-col">
							<h3 class="nx-list-title">Características</h3>
							<ul class="nx-chips">
								<li class="nx-chip">Ubicación en tiempo real</li>
								<li class="nx-chip">Historial de recorridos</li>
								<li class="nx-chip">Geocercas personalizadas</li>
								<li class="nx-chip">Detección de movimiento</li>
								<li class="nx-chip">Informes de consumo de combustible y batería</li>
								<li class="nx-chip">Notificaciones</li>
								<li class="nx-chip">Compartir ubicación</li>
								<li class="nx-chip">Panel web responsive</li>
								<li class="nx-chip">App móvil</li>
								<li class="nx-chip">API para integradores</li>
								<li class="nx-chip">Seguridad por roles</li>
							</ul>
						</div>
						<div class="nx-list-col">
							<h3 class="nx-list-title">Casos de uso</h3>
							<ul class="nx-chips">
								<li class="nx-chip nx-chip--case">Protección vehicular</li>
								<li class="nx-chip nx-chip--case">Rastreo familiar</li>
								<li class="nx-chip nx-chip--case">Control de flotillas</li>
								<li class="nx-chip nx-chip--case">Monitoreo operativo</li>
								<li class="nx-chip nx-chip--case">Seguridad en campo</li>
								<li class="nx-chip nx-chip--case">Recuperación ante robo</li>
								<li class="nx-chip nx-chip--case">Supervisión de rutas</li>
								<li class="nx-chip nx-chip--case">Administración de activos</li>
								<li class="nx-chip nx-chip--case">Telemetría básica</li>
								<li class="nx-chip nx-chip--case">Integración con terceros</li>
							</ul>
						</div>
					</div>

					<a class="nx-cta" href="/products/nexus">
						Explorar Nexus <span class="nx-cta-arrow" aria-hidden="true">→</span>
					</a>
				</div>

				<div class="nx-stage" aria-hidden="true">
					<span class="nx-halo"></span>
					<a
						href="/products/nexus"
						class="nx-logo-link"
						tabindex={activeProduct === 'nexus' ? 0 : -1}
					>
						<img src="/img/logo-nexus-3x.png" alt="Logotipo de Nexus" class="nx-logo" />
					</a>
					<span class="nx-floor"></span>
				</div>
			</div>

			<!-- ORION -->
			<div
				class="nx-panel nx-panel--orion"
				class:is-active={activeProduct === 'orion'}
				id="panel-orion"
				role="tabpanel"
				aria-labelledby="tab-orion"
				aria-hidden={activeProduct !== 'orion'}
			>
				<div class="nx-orion-fx" aria-hidden="true">
					{#each orionParticles as pt (`${pt.sx}-${pt.sy}-${pt.d}`)}
						<span
							style="--sx:{pt.sx}px; --sy:{pt.sy}px; --d:{pt.d}s; --dur:{pt.dur}s; --s:{pt.s}px; --o:{pt.o};"
						></span>
					{/each}
				</div>
				<div class="nx-content">
					<p class="nx-eyebrow">Producto</p>
					<h3 class="nx-title">ORION</h3>
					<p class="nx-subtitle">
						Una capa silenciosa de inteligencia geoespacial para productos que requieren
						localización, análisis territorial y validación de eventos sin depender exclusivamente
						del GPS.
					</p>

					<div class="nx-lists">
						<div class="nx-list-col">
							<h3 class="nx-list-title">Características principales</h3>
							<ul class="nx-chips">
								<li class="nx-chip">Localización por Cell ID</li>
								<li class="nx-chip">API de geolocalización</li>
								<li class="nx-chip">Enriquecimiento geoespacial</li>
								<li class="nx-chip">Consulta por MCC / MNC / LAC / Cell ID</li>
								<li class="nx-chip">Soporte para múltiples operadores</li>
								<li class="nx-chip">Estimación de ubicación aproximada</li>
								<li class="nx-chip">Integración con plataformas IoT</li>
								<li class="nx-chip">Respuesta JSON estructurada</li>
								<li class="nx-chip">Resolución H3 configurable</li>
								<li class="nx-chip">Procesamiento por lotes</li>
								<li class="nx-chip">Consultas en tiempo real</li>
								<li class="nx-chip">Métricas de consumo API</li>
								<li class="nx-chip">Control por planes</li>
								<li class="nx-chip">Llaves de API</li>
								<li class="nx-chip">Administración por cuenta</li>
								<li class="nx-chip">Preparado para integradores</li>
							</ul>
						</div>
						<div class="nx-list-col">
							<h3 class="nx-list-title">Casos de uso</h3>
							<ul class="nx-chips">
								<li class="nx-chip nx-chip--case">Localización sin GPS</li>
								<li class="nx-chip nx-chip--case">Validación de eventos IoT</li>
								<li class="nx-chip nx-chip--case">Enriquecimiento de telemetría</li>
								<li class="nx-chip nx-chip--case">Análisis de cobertura celular</li>
								<li class="nx-chip nx-chip--case">Seguridad vehicular</li>
								<li class="nx-chip nx-chip--case">Rastreo alternativo</li>
								<li class="nx-chip nx-chip--case">Plataformas de movilidad</li>
								<li class="nx-chip nx-chip--case">Sistemas antifraude</li>
								<li class="nx-chip nx-chip--case">Verificación territorial</li>
								<li class="nx-chip nx-chip--case">Análisis de riesgo geográfico</li>
								<li class="nx-chip nx-chip--case">Integración con ERPs o CRMs</li>
								<li class="nx-chip nx-chip--case">Monitoreo de activos</li>
								<li class="nx-chip nx-chip--case">Inteligencia para operadores</li>
								<li class="nx-chip nx-chip--case">Backups de ubicación</li>
								<li class="nx-chip nx-chip--case">APIs para terceros</li>
							</ul>
						</div>
					</div>

					<a class="nx-cta" href="/products/orion">
						Explorar Orion <span class="nx-cta-arrow" aria-hidden="true">→</span>
					</a>
				</div>

				<div class="nx-stage" aria-hidden="true">
					<span class="nx-halo"></span>
					<a
						href="/products/orion"
						class="nx-logo-link"
						tabindex={activeProduct === 'orion' ? 0 : -1}
					>
						<img src="/img/products/logo-orion.png" alt="Logotipo de Orion" class="nx-logo" />
					</a>
					<span class="nx-floor"></span>
				</div>
			</div>
		</div>
	</article>
</section>

<div class="section-sep"></div>

<!-- Sección Capacidades Tecnológicas -->
<section id="capacidades" class="capabilities-section">
	<div class="container">
		<h2 class="landing-section-title">Capacidades Tecnológicas</h2>
		<div class="section-description">
			<h3>Infraestructura pensada para entornos exigentes</h3>
		</div>
		<div class="capabilities-grid">
			<div class="capability-card">
				<div class="capability-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
						<path d="M2 8h20" />
					</svg>
				</div>
				<h3>Infraestructura moderna</h3>
				<p>Arquitectura cloud diseñada para escalabilidad, resiliencia y operación continua.</p>
			</div>
			<div class="capability-card">
				<div class="capability-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
					</svg>
				</div>
				<h3>Integración API-first</h3>
				<p>
					Plataformas preparadas para integrarse con sistemas empresariales, automatización y
					terceros.
				</p>
			</div>
			<div class="capability-card">
				<div class="capability-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="5" y="2" width="14" height="20" rx="2" />
						<path d="M12 18h.01" />
						<path d="M9 6h6M9 10h6" />
					</svg>
				</div>
				<h3>Web y móvil</h3>
				<p>Experiencias consistentes en navegador, iPhone y Android.</p>
			</div>
			<div class="capability-card">
				<div class="capability-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
					</svg>
				</div>
				<h3>Procesamiento en tiempo real</h3>
				<p>Captura, procesamiento y análisis de eventos con baja latencia.</p>
			</div>
			<div class="capability-card">
				<div class="capability-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="12" cy="12" r="10" />
						<path
							d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
						/>
					</svg>
				</div>
				<h3>Inteligencia geoespacial</h3>
				<p>
					Modelado espacial, triangulación, análisis probabilístico y enriquecimiento contextual.
				</p>
			</div>
			<div class="capability-card">
				<div class="capability-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="11" width="18" height="11" rx="2" />
						<path d="M7 11V7a5 5 0 0 1 10 0v4" />
					</svg>
				</div>
				<h3>Seguridad y privacidad</h3>
				<p>Diseño orientado a protección de datos, control de acceso y operación segura.</p>
			</div>
		</div>
	</div>
</section>

<div class="section-sep"></div>

<!-- Sección Cómo Trabajamos -->
<section id="como-trabajamos" class="business-models-section">
	<div class="container">
		<h2 class="landing-section-title">Cómo Trabajamos</h2>
		<div class="section-description">
			<h3>Modelos de servicio adaptados a tu contexto</h3>
		</div>
		<div class="business-models-grid">
			<div class="business-model-card">
				<div class="bm-label">SaaS Platforms</div>
				<p>Acceso por suscripción a nuestras plataformas operativas.</p>
				<div class="bm-example">Ejemplo: <span>Nexus</span></div>
			</div>
			<div class="business-model-card">
				<div class="bm-label">APIs &amp; Data Services</div>
				<p>Servicios programables bajo consumo o volumen.</p>
				<div class="bm-example">Ejemplo: <span>Orion</span></div>
			</div>
			<div class="business-model-card">
				<div class="bm-label">Enterprise Solutions</div>
				<p>Desarrollo e integración de soluciones personalizadas para necesidades específicas.</p>
			</div>
			<div class="business-model-card">
				<div class="bm-label">Strategic Consulting</div>
				<p>
					Acompañamiento técnico en conectividad, IoT, infraestructura y arquitectura de producto.
				</p>
			</div>
		</div>
		<div class="bm-cta-wrapper">
			<a href="#contacto" class="btn-secondary">Conversemos sobre tu proyecto</a>
		</div>
	</div>
</section>

<div class="section-sep"></div>

<!-- Sección Quiénes Somos -->
<section id="nosotros" class="about-section">
	<div class="container">
		<div class="about-content">
			<div class="about-text">
				<h2 class="landing-section-title">Quiénes Somos</h2>
				<div class="section-description">
					<h3>Tecnología donde convergen software, datos y conectividad</h3>
					<p>
						Geminis Labs es una empresa tecnológica mexicana enfocada en construir productos donde
						convergen software, conectividad, datos e inteligencia geoespacial.
					</p>
					<p>
						Nuestro equipo combina experiencia en telemática, telecomunicaciones, infraestructura
						cloud, sistemas distribuidos de alta disponibilidad y desarrollo de plataformas móviles
						y web. Diseñamos tecnología no solo para visualizar información, sino para convertir
						datos complejos en decisiones útiles, escalables y accionables.
					</p>
					<p>
						Creemos en construir productos propios con visión de largo plazo, capaces de evolucionar
						desde soluciones concretas hasta plataformas tecnológicas de alcance global.
					</p>
				</div>
				<p class="social-proof-line">
					Construido por especialistas en telemática, telecomunicaciones e infraestructura cloud.
					Arquitectura moderna diseñada para disponibilidad, escalabilidad y evolución continua.
				</p>
				<div class="differentiators-pills">
					<span class="diff-pill">Inteligencia más allá del GPS</span>
					<span class="diff-pill">API-first</span>
					<span class="diff-pill">Tecnología propia</span>
					<span class="diff-pill">Infraestructura moderna</span>
					<span class="diff-pill">Soluciones enterprise</span>
					<span class="diff-pill">Visión de largo plazo</span>
				</div>
			</div>
			<div class="about-image">
				<div class="tech-showcase">
					<!-- Partículas flotantes de fondo -->
					<div class="floating-particles">
						<div class="particle particle-1"></div>
						<div class="particle particle-2"></div>
						<div class="particle particle-3"></div>
						<div class="particle particle-4"></div>
						<div class="particle particle-5"></div>
						<div class="particle particle-6"></div>
					</div>

					<!-- Anillos externos decorativos (fondo lejano) -->
					<div class="tech-ring-wrap tech-ring-wrap-1"><div class="tech-ring ring-1"></div></div>
					<div class="tech-ring-wrap tech-ring-wrap-2"><div class="tech-ring ring-2"></div></div>
					<div class="tech-ring-wrap tech-ring-wrap-3"><div class="tech-ring ring-3"></div></div>

					<!-- Logo central con órbitas -->
					<div class="logo-container">
						<div class="logo-aura aura-1"></div>
						<div class="logo-aura aura-2"></div>
						<div class="logo-aura aura-3"></div>

						<!-- Anillos orbitales inmediatos al logo -->
						<div class="orbital-ring ring-inner"></div>
						<div class="orbital-ring ring-middle"></div>
						<div class="orbital-ring ring-outer"></div>

						<!-- Puntos que orbitan -->
						<div class="orbital-dot dot-1"></div>
						<div class="orbital-dot dot-2"></div>
						<div class="orbital-dot dot-3"></div>
						<div class="orbital-dot dot-4"></div>

						<!-- Logo -->
						<div class="logo-floating animate-[rotateSlow_30s_linear_infinite]">
							<picture>
								<source srcset="/img/geminis-labs-logo-short.png" media="(max-width: 768px)" />
								<img src="/img/geminis-labs-logo.png" alt="" />
							</picture>
						</div>

						<!-- Ondas de energía -->
						<div class="energy-waves">
							<div class="energy-wave wave-1"></div>
							<div class="energy-wave wave-2"></div>
							<div class="energy-wave wave-3"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<div class="section-sep"></div>

<!-- Sección El Futuro que Estamos Construyendo -->
<section id="futuro" class="lo-que-hacemos-section">
	<div class="container">
		<h2 class="landing-section-title">El Futuro que Estamos Construyendo</h2>
		<div class="section-description">
			<h3>Lo que estamos construyendo para los próximos años</h3>
			<span>
				Nuestra visión va más allá del monitoreo. Desarrollamos capacidades que integran
				inteligencia artificial, redes de conectividad y análisis avanzado para construir un
				ecosistema tecnológico de largo plazo.
			</span>
		</div>

		<div class="future-actions-grid">
			<div class="future-action-card">
				<div class="future-action-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2L2 7l10 5 10-5-10-5z" />
						<path d="M2 17l10 5 10-5" />
						<path d="M2 12l10 5 10-5" />
					</svg>
				</div>
				<h3>Telemetría Móvil</h3>
				<p>
					Recopilamos información de redes celulares y WiFi, siempre con consentimiento del usuario,
					para ampliar nuestra cobertura y crear una red más inteligente.
				</p>
			</div>

			<div class="future-action-card">
				<div class="future-action-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="3" />
						<path d="M12 1v6m0 6v6" />
						<path d="M21 12h-6m-6 0H3" />
						<path d="M18.36 6.64l-4.24 4.24m-4.24 0L5.64 6.64" />
						<path d="M18.36 17.36l-4.24-4.24m-4.24 0L5.64 17.36" />
					</svg>
				</div>
				<h3>Localización por Celdas y WiFi</h3>
				<p>
					Ofreceremos una API avanzada para ubicar dispositivos sin GPS, con datos ya mapeados en
					todo México para mayor precisión y cobertura.
				</p>
			</div>

			<div class="future-action-card">
				<div class="future-action-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 12l2 2 4-4" />
						<path
							d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1"
						/>
						<path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6" />
						<circle cx="12" cy="8" r="2" />
					</svg>
				</div>
				<h3>Análisis de Riesgo</h3>
				<p>
					Aplicaremos inteligencia artificial y datos de ingeniería civil para evaluar zonas,
					hábitos de conducción y patrones de riesgo en tiempo real.
				</p>
			</div>

			<div class="future-action-card">
				<div class="future-action-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
						<path d="M8 12l2 2 4-4" />
						<circle cx="12" cy="12" r="8" />
						<path d="M16 8l-4 4-2-2" />
					</svg>
				</div>
				<h3>Red LoRa Nacional</h3>
				<p>
					Desplegaremos gateways en puntos estratégicos del país para brindar localización segura y
					resiliente frente al jamming y interferencias.
				</p>
			</div>

			<div class="future-action-card">
				<div class="future-action-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2a10 10 0 1 0 10 10" />
						<path d="M12 8v4l3 3" />
						<path d="M16 2l2 2-2 2" />
						<path d="M21 7l-2-2 2-2" />
					</svg>
				</div>
				<h3>AI Analytics</h3>
				<p>
					Modelos de análisis inteligente sobre datos geoespaciales para detección de patrones,
					anomalías y predicción de comportamiento.
				</p>
			</div>
		</div>
	</div>
</section>

<div class="section-sep"></div>

<!-- Sección Nuestra Visión -->
<section id="vision" class="vision-section">
	<div class="container">
		<div class="vision-content">
			<h2 class="landing-section-title">Nuestra Visión</h2>
			<div class="vision-text-block">
				<p class="vision-lead">
					Geminis Labs nace con una ambición simple: construir tecnología capaz de entender mejor el
					mundo físico.
				</p>
				<p>
					Comenzamos en geolocalización, conectividad y análisis espacial porque creemos que el
					movimiento es una de las fuentes más valiosas de información.
				</p>
				<p>Pero nuestra visión va más allá.</p>
				<p>
					Queremos desarrollar productos donde converjan inteligencia artificial, infraestructura
					digital, datos, automatización y sistemas conectados para resolver problemas reales a
					escala.
				</p>
				<p class="vision-closing">
					No estamos construyendo una sola herramienta.<br />
					<strong>Estamos construyendo un ecosistema tecnológico.</strong>
				</p>
			</div>
			<div class="vision-cta">
				<a href="#contacto" class="btn-primary">Construye con nosotros</a>
			</div>
		</div>
	</div>
</section>

<div class="section-sep"></div>

<!-- Sección Contacto -->
<section id="contacto" class="contact-section">
	<div class="container">
		<h2 class="landing-section-title">Contacto</h2>
		<div class="contact-content">
			<div class="contact-info">
				<h3>Información de Contacto</h3>
				<div class="contact-item">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
						<circle cx="12" cy="10" r="3" />
					</svg>
					<p>Ciudad de México, México</p>
				</div>
				<div class="contact-item">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path
							d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
						/>
					</svg>
					<p>+52 55 1234 5678</p>
				</div>
				<div class="contact-item">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
						<polyline points="22,6 12,13 2,6" />
					</svg>
					<p>contacto@geminislabs.com</p>
				</div>

				<div class="social-links">
					<h4>Síguenos</h4>
					<div class="social-icons">
						<a
							href="https://twitter.com"
							class="social-link"
							aria-label="Síguenos en Twitter"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
								/>
							</svg>
						</a>
						<a
							href="https://facebook.com"
							class="social-link"
							aria-label="Síguenos en Facebook"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
								/>
							</svg>
						</a>
						<a
							href="https://linkedin.com"
							class="social-link"
							aria-label="Síguenos en LinkedIn"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>

			<form class="contact-form" on:submit={handleContactSubmit}>
				<h3>Envíanos un Mensaje</h3>

				{#if submitMessage}
					<div class="form-message" class:success={submitSuccess} class:error={!submitSuccess}>
						{submitMessage}
					</div>
				{/if}

				{#if formErrors.general}
					<div class="form-error general-error">
						{formErrors.general}
					</div>
				{/if}

				<div class="form-group">
					<input
						type="text"
						placeholder="Nombre completo *"
						bind:value={formData.nombre}
						maxlength="200"
						class:error={formErrors.nombre}
						disabled={isSubmitting}
					/>
					{#if formErrors.nombre}
						<span class="error-text">{formErrors.nombre}</span>
					{/if}
					<span class="char-count">{formData.nombre.length}/200</span>
				</div>

				<div class="form-group">
					<input
						type="email"
						placeholder="Correo electrónico"
						bind:value={formData.correo_electronico}
						class:error={formErrors.correo_electronico}
						disabled={isSubmitting}
					/>
					{#if formErrors.correo_electronico}
						<span class="error-text">{formErrors.correo_electronico}</span>
					{/if}
				</div>

				<div class="form-group">
					<input
						type="tel"
						placeholder="Teléfono"
						bind:value={formData.telefono}
						class:error={formErrors.telefono}
						disabled={isSubmitting}
					/>
					{#if formErrors.telefono}
						<span class="error-text">{formErrors.telefono}</span>
					{/if}
					<span class="hint-text">Ejemplo: +52 123 456 7890 (7-20 dígitos)</span>
				</div>

				<div class="form-group">
					<textarea
						placeholder="Mensaje *"
						rows="5"
						bind:value={formData.mensaje}
						maxlength="5000"
						class:error={formErrors.mensaje}
						disabled={isSubmitting}
					></textarea>
					{#if formErrors.mensaje}
						<span class="error-text">{formErrors.mensaje}</span>
					{/if}
					<span class="char-count">{formData.mensaje.length}/5000</span>
				</div>

				<div class="submit-wrapper">
					<button type="submit" class="btn-primary" disabled={isSubmitting}>
						{#if isSubmitting}
							Enviando...
						{:else}
							Enviar Mensaje
						{/if}
					</button>
				</div>

				<p class="form-note">
					* Campos requeridos. Debes proporcionar al menos un correo o teléfono.
				</p>

				{#if recaptchaSiteKey}
					<p class="recaptcha-notice">
						Este sitio está protegido por reCAPTCHA y se aplican la
						<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
							Política de Privacidad
						</a>
						y los
						<a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
							Términos de Servicio
						</a>
						de Google.
					</p>
				{/if}
			</form>
		</div>
	</div>
</section>

<Footer />

<style>
	.form-group {
		position: relative;
		margin-bottom: 1.5rem;
	}
	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.875rem;
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		color: #d8d7cc;
		font-size: 1rem;
		transition: all 0.3s ease;
	}
	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #00a6c0;
		background: rgba(255, 255, 255, 0.08);
	}
	.form-group input:disabled,
	.form-group textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.form-group input.error,
	.form-group textarea.error {
		border-color: #ff4444;
		background: rgba(255, 68, 68, 0.1);
	}

	.error-text {
		display: block;
		color: #ff6b6b;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		font-weight: 500;
	}
	.char-count {
		display: block;
		text-align: right;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.4);
		margin-top: 0.25rem;
	}
	.hint-text {
		display: block;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		margin-top: 0.25rem;
		font-style: italic;
	}

	.form-message {
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		font-weight: 500;
		animation: slideIn 0.3s ease;
	}
	.form-message.success {
		background: rgba(46, 213, 115, 0.1);
		border: 2px solid #2ed573;
		color: #2ed573;
	}
	.form-message.error {
		background: rgba(255, 68, 68, 0.1);
		border: 2px solid #ff4444;
		color: #ff6b6b;
	}

	.form-error.general-error {
		background: rgba(255, 68, 68, 0.1);
		border: 2px solid #ff4444;
		border-radius: 8px;
		padding: 0.875rem;
		margin-bottom: 1.5rem;
		color: #ff6b6b;
		font-weight: 500;
		animation: slideIn 0.3s ease;
	}
	.form-note {
		margin-top: 1rem;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		text-align: center;
		font-style: italic;
	}
	.recaptcha-notice {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		text-align: center;
		line-height: 1.5;
	}
	.recaptcha-notice a {
		color: #00a6c0;
		text-decoration: underline;
		transition: color 0.3s ease;
	}
	.recaptcha-notice a:hover {
		color: #d8d7cc;
	}
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.form-group input,
		.form-group textarea {
			font-size: 0.9375rem;
		}
		.error-text,
		.form-note {
			font-size: 0.8125rem;
		}
		.char-count,
		.hint-text {
			font-size: 0.6875rem;
		}
	}

	.product-content {
		display: flex;
		gap: 4rem;
		align-items: center;
		justify-content: space-between;
	}

	.product-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.product-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.product-logo {
		height: 90px;
		width: auto;
		object-fit: contain;
		filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.1));
	}

	.product-title {
		font-size: 3.5rem;
		font-weight: 800;
		margin: 0;
		line-height: 1;
		font-family: 'Outfit', sans-serif;
		letter-spacing: -1px;
	}

	.nexus-title {
		font-size: 4.5rem;
		color: #ffffff;
		filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))
			drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
		text-shadow:
			0 0 12px rgba(120, 255, 220, 0.25),
			0 0 32px rgba(0, 180, 255, 0.15);
	}

	.product-info p {
		color: #b0b3b8;
		line-height: 1.6;
		font-size: 1.2rem;
	}

	.product-features {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.product-features li {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: #d8d7cc;
		font-size: 1.1rem;
	}
	.product-features li svg {
		width: 24px;
		height: 24px;
		color: #00a6c0;
		flex-shrink: 0;
	}

	.product-divider {
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		margin: 5rem 0;
		width: 100%;
	}

	.nexus-full-container {
		position: relative;
		padding: 2rem;
		margin-top: 5rem;
		margin-bottom: 5rem;
	}

	.nexus-item {
		position: relative;
		overflow: hidden;
		border-radius: 20px;
	}

	.orion-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 0;
	}

	.product-bg-video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
	}
	.product-bg-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(6, 20, 59, 0.2);
		z-index: 1;
		pointer-events: none;
	}

	.nexus-item .product-content {
		position: relative;
		z-index: 2;
		padding-left: 2rem;
	}

	.centered-info {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 5;
	}
	.centered-info::before {
		content: none;
	}

	.nexus-logo {
		width: 180px;
		max-width: 100%;
		height: auto;
		filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
	}
	.nexus-slogan-title {
		font-size: 2.2rem;
		font-weight: 700;
		color: #ffffff;
		text-shadow: 0 4px 8px rgba(0, 0, 0, 0.9);
		margin-bottom: 0.5rem;
		line-height: 1.2;
	}
	.nexus-slogan-subtitle {
		font-size: 1.5rem !important;
		color: #ffffff !important;
		font-weight: 500;
		text-shadow: 0 3px 6px rgba(0, 0, 0, 0.9);
		margin-bottom: 2rem;
	}

	.overlay-features-container {
		position: absolute;
		right: 2rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 10;
		width: 300px;
	}
	.feature-block {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
	}
	.feature-title {
		font-size: 1.6rem;
		font-weight: 700;
		color: #ffffff;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.8rem;
		text-align: right;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		padding: 0.5rem 1.2rem;
		border-radius: 8px;
		border-right: 4px solid #4db6ac;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}
	.overlay-features {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.8rem;
	}
	.overlay-features li {
		background: rgba(0, 0, 0, 0.6);
		padding: 0.8rem 1.5rem;
		border-radius: 50px;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		font-size: 0.95rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
		transition: transform 0.3s ease;
	}
	.overlay-features li:hover {
		transform: translateX(-5px);
		background: rgba(0, 0, 0, 0.8);
		border-color: rgba(77, 182, 172, 0.5);
	}

	.nexus-visual {
		position: relative;
	}

	.product-visual {
		flex: 1;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 20px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		aspect-ratio: 4/3;
		min-height: 600px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
	}
	.nexus-visual {
		border: none;
		-webkit-mask-image: radial-gradient(ellipse 97% 184% at 71% 50%, black 50%, transparent 70%);
		mask-image: radial-gradient(ellipse 97% 184% at 71% 50%, black 50%, transparent 70%);
	}

	.carousel-container {
		width: 100%;
		height: 100%;
		position: relative;
	}
	.carousel-slide {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		opacity: 0;
		transition: opacity 1s ease-in-out;
		z-index: 1;
		transform: scale(1);
	}
	.carousel-slide.active {
		opacity: 1;
		z-index: 2;
		animation: zoomOut 8s linear forwards;
	}
	@keyframes zoomOut {
		from {
			transform: scale(1.1);
		}
		to {
			transform: scale(1);
		}
	}

	.fade-in {
		animation: fadeIn 0.8s ease-out forwards;
		opacity: 0;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 900px) {
		.product-content {
			flex-direction: column;
			gap: 3rem;
			text-align: center;
		}
		.product-header {
			justify-content: center;
			flex-direction: column;
		}
		.product-info {
			align-items: center;
		}
		.product-features li {
			justify-content: center;
			text-align: left;
		}
		.product-visual {
			width: 100%;
		}
	}

	.audiowide-regular {
		font-family: 'Audiowide', sans-serif;
		font-weight: 400;
		font-style: normal;
	}

	.orion-visual-branding {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: radial-gradient(
			circle at center,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(15, 22, 32, 0) 70%
		);
		border: none;
		box-shadow: none;
		position: relative;
		overflow: hidden;
	}

	.orion-planet-rings {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.orion-ring {
		position: absolute;
		border-radius: 50%;
		top: 50%;
		left: 50%;
	}
	.orion-ring-1 {
		width: 54%;
		aspect-ratio: 1;
		margin-top: -27%;
		margin-left: -27%;
		border: 1.5px dashed rgba(0, 198, 255, 0.55);
		box-shadow: 0 0 12px rgba(0, 198, 255, 0.12);
		animation: orion-orbit-1 22s linear infinite;
	}
	.orion-ring-2 {
		width: 76%;
		aspect-ratio: 1;
		margin-top: -38%;
		margin-left: -38%;
		border: 1px dotted rgba(0, 198, 255, 0.32);
		animation: orion-orbit-2 38s linear infinite reverse;
	}
	.orion-ring-3 {
		width: 96%;
		aspect-ratio: 1;
		margin-top: -48%;
		margin-left: -48%;
		border-top: 2px solid transparent;
		border-right: 2px solid transparent;
		border-bottom: 2px solid rgba(0, 198, 255, 0.22);
		border-left: 2px solid rgba(0, 198, 255, 0.35);
		animation: orion-orbit-3 60s linear infinite;
	}
	@keyframes orion-orbit-1 {
		0% {
			transform: rotateX(68deg) rotateZ(0deg);
		}
		100% {
			transform: rotateX(68deg) rotateZ(360deg);
		}
	}
	@keyframes orion-orbit-2 {
		0% {
			transform: rotateX(72deg) rotateY(12deg) rotateZ(0deg);
		}
		100% {
			transform: rotateX(72deg) rotateY(12deg) rotateZ(360deg);
		}
	}
	@keyframes orion-orbit-3 {
		0% {
			transform: rotateX(55deg) rotateY(-8deg) rotateZ(0deg);
		}
		100% {
			transform: rotateX(55deg) rotateY(-8deg) rotateZ(360deg);
		}
	}

	.orion-bg-video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.3;
		z-index: 0;
		mix-blend-mode: screen;
	}

	.orion-logo-content {
		position: relative;
		z-index: 3;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		border-radius: 12px;
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.orion-logo-content:focus-visible {
		outline: 2px solid rgba(167, 139, 250, 0.85);
		outline-offset: 6px;
	}

	.orion-logo-content:hover {
		transform: scale(1.02);
	}

	.orion-big-logo {
		width: 180px;
		height: auto;
		filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4));
		margin-bottom: 1rem;
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			filter 0.3s ease;
	}

	.orion-logo-content:hover .orion-big-logo {
		transform: scale(1.08);
		filter: drop-shadow(0 0 35px rgba(255, 255, 255, 0.8));
	}

	.orion-brand-name {
		font-size: 4rem;
		color: #ffffff;
		text-transform: uppercase;
		letter-spacing: 2px;
		text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
		margin: 0;
	}

	.orion-features-container {
		width: 100%;
		flex: 1.2;
	}
	.orion-features-grid {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.orion-list-body {
		display: block;
		position: relative;
	}
	.orion-divider-container {
		position: absolute;
		left: 35%;
		top: 0;
		bottom: 0;
		width: 2px;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		z-index: 10;
		margin: 0;
	}

	.orion-feature-row {
		display: flex;
		padding: 0.75rem 0;
		opacity: 0.5;
		transition: all 0.5s ease;
		border-bottom: 1px solid rgba(255, 255, 255, 0.02);
	}
	.orion-feature-row:last-child {
		border-bottom: none;
	}
	.orion-feature-row.feature-active {
		opacity: 1;
		transform: scale(1.01);
		background: rgba(255, 255, 255, 0.03);
	}

	.orion-feature-title {
		width: 35%;
		padding-right: 1.5rem;
		text-align: right;
		font-weight: 500;
		color: #d1d5db;
		transition:
			color 0.3s,
			font-weight 0.3s;
		font-size: 0.95rem;
	}
	.orion-feature-desc {
		flex: 1;
		padding-left: 1.5rem;
		color: #9ca3af;
		font-weight: 300;
		transition:
			color 0.3s,
			font-weight 0.3s;
		font-size: 0.85rem;
		line-height: 1.4;
	}
	.feature-active .orion-feature-title {
		color: #ffffff;
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
	}
	.feature-active .orion-feature-desc {
		color: #e5e7eb;
	}

	@media (max-width: 1024px) {
		.orion-divider-container {
			display: none;
		}
		.orion-feature-row {
			flex-direction: column;
			text-align: center;
			gap: 0.25rem;
			padding: 0.8rem 0;
		}
		.orion-feature-title,
		.orion-feature-desc {
			width: 100%;
			padding: 0;
			text-align: center;
		}
		.orion-visual-branding {
			margin-top: 1rem;
		}
		.product-visual {
			min-height: 300px;
			width: 100%;
			aspect-ratio: auto;
		}
		.nexus-visual {
			aspect-ratio: 1/1;
		}
	}

	.tech-showcase {
		position: relative;
		width: 400px;
		height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tech-ring-wrap {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}
	.tech-ring-wrap .tech-ring {
		position: relative;
		top: auto;
		left: auto;
		transform: none;
		flex-shrink: 0;
	}
	.tech-ring-wrap-1 .tech-ring {
		width: 200px;
		height: 200px;
		border: 2px dashed #4caf4f77 !important;
		border-radius: 50%;
		animation: tech-rotate 20s linear infinite;
	}
	.tech-ring-wrap-2 .tech-ring {
		width: 280px;
		height: 280px;
		border: 2px dotted #4caf4fa1 !important;
		border-radius: 50%;
		animation: tech-rotate 30s linear infinite reverse;
	}
	.tech-ring-wrap-3 .tech-ring {
		width: 360px;
		height: 360px;
		border: none !important;
		border-left: 3px solid #4caf4f80 !important;
		border-bottom: 3px solid #4caf4f96 !important;
		border-radius: 50%;
		animation: tech-rotate 40s linear infinite;
	}
	@keyframes tech-rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.logo-container {
		position: relative;
		z-index: 10;
		width: 200px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.logo-aura {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		pointer-events: none;
	}
	.aura-1 {
		width: 120px;
		height: 120px;
		background: radial-gradient(
			circle,
			rgba(0, 166, 192, 0.3) 0%,
			rgba(0, 166, 192, 0.1) 40%,
			transparent 70%
		);
		animation: pulse-aura 3s ease-in-out infinite;
	}
	.aura-2 {
		width: 160px;
		height: 160px;
		background: radial-gradient(
			circle,
			transparent 0%,
			rgba(0, 166, 192, 0.15) 30%,
			rgba(68, 160, 141, 0.1) 60%,
			transparent 80%
		);
		animation: pulse-aura 4s ease-in-out infinite 1s;
	}
	.aura-3 {
		width: 200px;
		height: 200px;
		background: radial-gradient(
			circle,
			transparent 0%,
			rgba(78, 205, 196, 0.08) 40%,
			transparent 70%
		);
		animation: pulse-aura 5s ease-in-out infinite 2s;
	}

	@keyframes pulse-aura {
		0%,
		100% {
			opacity: 0.3;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 0.7;
			transform: translate(-50%, -50%) scale(1.1);
		}
	}

	.orbital-ring {
		position: absolute;
		border-radius: 50%;
		inset: 0;
		margin: auto;
	}
	.ring-inner {
		width: 100px;
		height: 100px;
		border: 1px dashed rgba(0, 166, 192, 0.4);
		animation: tech-rotate 12s linear infinite;
	}
	.ring-middle {
		width: 140px;
		height: 140px;
		border: 1px dotted rgba(0, 166, 192, 0.3);
		animation: tech-rotate 18s linear infinite reverse;
	}
	.ring-outer {
		width: 180px;
		height: 180px;
		border-left: 2px solid rgba(0, 166, 192, 0.6);
		border-right: 2px solid transparent;
		border-top: 2px solid transparent;
		border-bottom: 2px solid rgba(0, 166, 192, 0.6);
		animation: tech-rotate 25s linear infinite;
	}

	.logo-floating {
		position: relative;
		z-index: 15;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100px;
		height: 100px;
	}
	.logo-floating img {
		width: 90px;
		height: 90px;
		filter: drop-shadow(0 0 20px rgba(0, 166, 192, 0.6))
			drop-shadow(0 0 40px rgba(0, 166, 192, 0.3)) drop-shadow(0 0 60px rgba(0, 166, 192, 0.1));
		transition:
			filter 0.3s ease,
			transform 0.3s ease;
	}
	.logo-floating:hover img {
		filter: drop-shadow(0 0 30px rgba(0, 166, 192, 0.8))
			drop-shadow(0 0 60px rgba(0, 166, 192, 0.5)) drop-shadow(0 0 90px rgba(0, 166, 192, 0.2));
		transform: scale(1.05);
	}

	.orbital-dot {
		position: absolute;
		width: 6px;
		height: 6px;
		background: var(--accent-cyan, #00a6c0);
		border-radius: 50%;
		box-shadow: 0 0 15px rgba(0, 166, 192, 0.8);
		top: calc(50% - 3px);
		left: calc(50% - 3px);
	}
	.dot-1 {
		animation: orbital-dot-spin 8s linear infinite;
	}
	.dot-2 {
		animation: orbital-dot-spin 10s linear infinite 2s;
		--r: 70px;
	}
	.dot-3 {
		animation: orbital-dot-spin 12s linear infinite 4s;
	}
	.dot-4 {
		animation: orbital-dot-spin 14s linear infinite 6s;
		--r: 70px;
	}

	@keyframes orbital-dot-spin {
		from {
			transform: rotate(0deg) translateX(var(--r, 50px)) rotate(0deg);
		}
		to {
			transform: rotate(360deg) translateX(var(--r, 50px)) rotate(-360deg);
		}
	}

	.energy-waves {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}
	.energy-wave {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border: 2px solid rgba(0, 166, 192, 0.3);
		border-radius: 50%;
		opacity: 0;
	}
	.wave-1 {
		width: 80px;
		height: 80px;
		animation: wave-expand 4s ease-out infinite;
	}
	.wave-2 {
		width: 80px;
		height: 80px;
		animation: wave-expand 4s ease-out infinite 1.3s;
	}
	.wave-3 {
		width: 80px;
		height: 80px;
		animation: wave-expand 4s ease-out infinite 2.6s;
	}

	@keyframes wave-expand {
		0% {
			width: 80px;
			height: 80px;
			opacity: 0.8;
			border-width: 2px;
		}
		50% {
			opacity: 0.4;
			border-width: 1px;
		}
		100% {
			width: 200px;
			height: 200px;
			opacity: 0;
			border-width: 0;
		}
	}

	.floating-particles {
		position: absolute;
		width: 100%;
		height: 100%;
	}
	.particle {
		position: absolute;
		width: 4px;
		height: 4px;
		background: var(--accent-cyan, #00a6c0);
		border-radius: 50%;
		box-shadow: 0 0 10px rgba(0, 166, 192, 0.8);
		will-change: transform;
	}
	.particle-1 {
		top: 20%;
		left: 15%;
		animation: float 6s ease-in-out infinite;
	}
	.particle-2 {
		top: 30%;
		right: 20%;
		animation: float 8s ease-in-out infinite 1s;
	}
	.particle-3 {
		bottom: 25%;
		left: 25%;
		animation: float 7s ease-in-out infinite 2s;
	}
	.particle-4 {
		bottom: 35%;
		right: 15%;
		animation: float 9s ease-in-out infinite 0.5s;
	}
	.particle-5 {
		top: 60%;
		left: 10%;
		animation: float 5s ease-in-out infinite 1.5s;
	}
	.particle-6 {
		top: 15%;
		right: 35%;
		animation: float 10s ease-in-out infinite 3s;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0) translateX(0);
			opacity: 0.7;
		}
		25% {
			transform: translateY(-10px) translateX(5px);
			opacity: 1;
		}
		50% {
			transform: translateY(-5px) translateX(-5px);
			opacity: 0.8;
		}
		75% {
			transform: translateY(-15px) translateX(3px);
			opacity: 1;
		}
	}

	@media (max-width: 768px) {
		.tech-showcase {
			width: 300px;
			height: 300px;
		}
		.tech-ring-wrap-1 .tech-ring {
			width: 150px;
			height: 150px;
		}
		.tech-ring-wrap-2 .tech-ring {
			width: 200px;
			height: 200px;
		}
		.tech-ring-wrap-3 .tech-ring {
			width: 250px;
			height: 250px;
		}
		.logo-container {
			width: 150px;
			height: 150px;
		}
		.logo-floating {
			width: 80px;
			height: 80px;
		}
		.logo-floating img {
			width: 70px;
			height: 70px;
		}
		.aura-1 {
			width: 90px;
			height: 90px;
		}
		.aura-2 {
			width: 120px;
			height: 120px;
		}
		.aura-3 {
			width: 150px;
			height: 150px;
		}
		.ring-inner {
			width: 80px;
			height: 80px;
		}
		.ring-middle {
			width: 110px;
			height: 110px;
		}
		.ring-outer {
			width: 140px;
			height: 140px;
		}
		.orbital-dot {
			width: 4px;
			height: 4px;
		}
		.animated-circle,
		.energy-wave,
		.particle,
		.tech-ring {
			display: none;
		}
		.floating-card {
			animation: none;
		}
	}

	/* ===== ECOSYSTEM SECTION ===== */
	/* ===== LAB SECTION (Laboratorio Tecnológico) ===== */
	.lab-section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 100vh;
		padding: 0;
		position: relative;
		overflow: hidden;
		background-color: #000000; /* negro total y uniforme */
	}
	/* Ruido sutil sobre el negro */
	.lab-noise {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		opacity: 0.04;
		background-image:
			radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.7) 0.5px, transparent 0.6px),
			radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.7) 0.5px, transparent 0.6px);
		background-size:
			8px 8px,
			11px 11px;
	}
	.lab-head {
		position: relative;
		z-index: 1;
		text-align: center;
		padding: clamp(2rem, 3vw, 3.5rem) 1.5rem 0;
	}
	.lab-section .lab-section-title {
		margin-bottom: 0;
	}
	.lab-section-title .brand {
		font-family: 'Dune Rise', 'Inter', sans-serif;
		font-weight: 400;
	}
	.lab-grid {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0;
		/* aprovecha pantallas ultrawide (34") sin tanto hueco lateral */
		max-width: clamp(1200px, 92vw, 2400px);
		margin: 0 auto;
		padding: clamp(2.5rem, 3.5vw, 5rem) clamp(1.5rem, 3vw, 5rem) clamp(2.5rem, 3vw, 4rem);
	}
	.lab-left {
		flex: 0 0 52%;
		max-width: 52%;
		position: relative;
		z-index: 1;
	}
	/* Panel del título con video de fondo: llega hasta el centro del foco */
	.lab-title-media {
		position: relative;
		display: flex;
		align-items: center;
		/* el alto no supera el 90% del alto del foco (≈498px → 448px) */
		min-height: clamp(340px, 28vw, 448px);
		max-height: 448px;
		border-radius: 18px;
		overflow: hidden;
		padding: 1.6rem 1.8rem;
		cursor: default;
	}
	.lab-title-video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
	}
	.lab-title-scrim {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: linear-gradient(135deg, rgba(6, 16, 28, 0.66) 0%, rgba(6, 16, 28, 0.4) 100%);
		transition: opacity 0.5s ease;
	}
	/* En hover: el texto casi se desvanece y se ve el video */
	.lab-title-media:hover .lab-title {
		opacity: 0;
	}
	.lab-title-media:hover .lab-title-scrim {
		opacity: 0.3;
	}
	.lab-right {
		flex: 0 1 32%;
		max-width: 32%;
		margin-left: auto;
		position: relative;
	}
	/* Áreas: fila de badges (acordeón) */
	.lab-areas {
		position: relative;
		z-index: 1;
		display: flex;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;
		gap: clamp(0.75rem, 2vw, 2rem);
		height: 200px; /* altura FIJA: la expansión nunca mueve el layout */
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}
	/* Badge — acordeón: el activo se ensancha con su texto, los demás se atenúan */
	.lab-cap {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.85rem;
		width: 146px;
		text-align: center;
		overflow: hidden;
		transition:
			width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.35s ease,
			transform 0.35s ease;
	}
	.lab-cap-icon {
		flex: 0 0 auto;
		width: 86px;
		height: 86px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: #7fe3f5;
		border: 1px solid rgba(127, 227, 245, 0.28);
		background: radial-gradient(circle at 50% 32%, rgba(18, 38, 52, 0.9), rgba(6, 16, 28, 0.95));
		box-shadow:
			inset 0 0 22px rgba(0, 0, 0, 0.55),
			0 0 0 6px rgba(127, 227, 245, 0.04);
		transition: all 0.35s ease;
	}
	.lab-cap-icon svg {
		width: 38px;
		height: 38px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.lab-cap-label {
		font-size: 0.82rem;
		font-weight: 500;
		line-height: 1.3;
		color: #c4d0d6;
		overflow-wrap: break-word;
		transition: opacity 0.25s ease;
	}
	.lab-cap-detail {
		display: none;
		width: 330px; /* ancho fijo: el texto no reflua durante la expansión */
		max-width: 100%;
		flex: 0 0 auto;
	}
	/* Atenuar los no activos */
	.lab-areas.focused .lab-cap.dim {
		opacity: 0.28;
		transform: scale(0.9);
		width: 90px;
	}
	.lab-areas.focused .lab-cap.dim .lab-cap-label {
		opacity: 0;
	}
	/* Badge activo: fila icono + texto */
	.lab-cap.active {
		flex-direction: row;
		align-items: center;
		gap: 1.4rem;
		width: 470px;
		text-align: left;
	}
	.lab-cap.active .lab-cap-icon {
		color: #ffffff;
		border-color: rgba(127, 227, 245, 0.7);
		box-shadow:
			inset 0 0 22px rgba(0, 0, 0, 0.4),
			0 0 26px rgba(52, 208, 192, 0.28);
	}
	.lab-cap.active .lab-cap-label {
		display: none;
	}
	.lab-cap.active .lab-cap-detail {
		display: block;
		animation: detailFade 0.55s ease 0.18s both;
	}
	@keyframes detailFade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.lab-cap-detail h3 {
		margin: 0 0 0.4rem;
		font-size: clamp(1.15rem, 1.5vw, 1.7rem);
		font-weight: 700;
		line-height: 1.2;
		color: #ffffff;
	}
	.lab-cap-detail p {
		margin: 0;
		font-size: clamp(0.95rem, 1vw, 1.15rem);
		line-height: 1.4;
		color: #9fdbe6;
	}
	.lab-cap-detail :global(.brand) {
		font-family: 'Dune Rise', 'Inter', sans-serif;
		font-weight: 400;
	}
	.lab-center {
		flex: 0 0 auto;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: -10%; /* el foco se solapa sobre el panel */
		z-index: 2;
	}
	.lab-bulb {
		display: block;
		width: 100%;
		max-width: 290px;
		height: auto;
		filter: drop-shadow(0 14px 26px rgba(10, 37, 64, 0.16));
		animation: labFloat 8s ease-in-out infinite;
	}
	@keyframes labFloat {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}
	.lab-eyebrow {
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
		letter-spacing: 3px;
		color: #0883a0;
		margin-bottom: 1.1rem;
		text-transform: uppercase;
	}
	.lab-section .lab-title {
		position: relative;
		z-index: 2;
		text-align: left;
		margin-bottom: 0;
		font-size: clamp(2rem, 2.8vw, 4.6rem);
		color: #ffffff;
		-webkit-text-fill-color: #ffffff;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
		transition: opacity 0.5s ease;
		max-width: clamp(330px, 27vw, 660px); /* el texto se mantiene a la izquierda, fuera del foco */
	}
	.lab-lead {
		position: relative;
		z-index: 1;
		font-size: clamp(1.1rem, 1.05vw, 1.5rem);
		line-height: 1.75;
		color: #c4d0d6;
		margin: 0 0 2rem;
	}
	.lab-lead strong {
		color: #ffffff;
		font-weight: 700;
	}
	@media (prefers-reduced-motion: reduce) {
		.lab-bulb {
			animation: none;
		}
	}
	@media (max-width: 900px) {
		.lab-grid {
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 2rem;
			padding: 3.5rem 1rem 2.5rem;
		}
		.lab-left,
		.lab-right {
			flex: 1 1 100%;
			max-width: 520px;
		}
		.lab-center {
			margin-left: 0;
		}
		.lab-right {
			margin-left: auto;
			margin-right: auto;
		}
		.lab-section .lab-title {
			text-align: center;
			max-width: none;
		}
		.lab-title-media {
			min-height: 200px;
		}
		.lab-bulb {
			max-width: 230px;
		}
		.lab-areas {
			flex-wrap: wrap;
			height: auto;
			gap: 1.5rem 2rem;
		}
		.lab-cap.active {
			width: 100%;
		}
		.lab-cap-detail {
			width: auto;
		}
	}

	/* ============================================================
	   Tecnologías que convergen — pila de ascensión sobre blanco
	   ============================================================ */
	.tc-section {
		display: block;
		min-height: auto;
		background: #eceff2; /* blanco menos brillante */
		position: relative;
		overflow: hidden;
		padding: clamp(4rem, 8vw, 8rem) 0 clamp(3rem, 5vw, 6rem);
	}
	.tc-inner {
		max-width: clamp(1200px, 92vw, 2400px);
		margin: 0 auto;
		padding-inline: clamp(1.5rem, 3vw, 5rem);
	}
	.tc-head {
		text-align: center;
		margin-bottom: clamp(2.5rem, 4vw, 4rem);
	}
	.tc-section .tc-title {
		background: linear-gradient(90deg, #0a2540, #0883a0);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: #0a2540;
		margin-bottom: 0.75rem;
	}
	.tc-subhead {
		color: #475569;
		font-size: clamp(1rem, 1.2vw, 1.35rem);
		margin: 0;
	}

	.tc-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
		gap: clamp(2rem, 4vw, 5rem);
		align-items: stretch;
	}

	/* --- columna izquierda: cuadrícula 2×2 de tarjetas --- */
	.tc-layers {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: clamp(1.25rem, 2vw, 2rem);
		align-content: start;
	}

	.tc-layer-item {
		position: relative;
		display: flex;
	}

	/* --- tarjeta de capa --- */
	.tc-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 20px;
		border-left: 3px solid var(--tc-accent);
		padding: clamp(1.75rem, 2.2vw, 2.5rem);
		box-shadow: 0 1px 2px rgba(10, 37, 64, 0.04);
		transition:
			transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
			border-left-color 0.3s ease;
		will-change: transform;
	}
	.tc-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 24px 50px -24px rgba(10, 37, 64, 0.3);
		border-left-color: color-mix(in srgb, var(--tc-accent) 75%, #fff);
	}

	.tc-card-head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	.tc-icon {
		color: var(--tc-accent);
		display: inline-flex;
		flex-shrink: 0;
	}
	.tc-num {
		font-family: 'Audiowide', sans-serif;
		font-size: clamp(1.5rem, 2vw, 2.4rem);
		line-height: 1;
		color: var(--tc-accent);
		opacity: 0.85;
	}
	.tc-card-title {
		font-size: clamp(1.15rem, 1.5vw, 1.7rem);
		font-weight: 600;
		color: #0f172a;
		margin: 0;
	}
	.tc-card-desc {
		color: #475569;
		font-size: clamp(0.95rem, 1vw, 1.1rem);
		margin: 0 0 1rem;
		line-height: 1.5;
	}

	.tc-chips {
		list-style: none;
		margin: auto 0 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.tc-chip {
		border: 1px solid #e2e8f0;
		border-radius: 999px;
		background: #f8fafc;
		color: #334155;
		padding: 0.4rem 0.85rem;
		font-size: 0.85rem;
		font-weight: 500;
		transition: border-color 0.3s ease;
	}
	.tc-layer-item:hover .tc-chip {
		border-color: color-mix(in srgb, var(--tc-accent) 55%, #e2e8f0);
	}

	/* --- columna derecha: spine de convergencia --- */
	.tc-spine {
		position: relative;
		align-self: stretch;
		display: flex;
	}
	.tc-spine-frame {
		position: relative;
		width: 100%;
		height: 100%; /* misma altura que la cuadrícula de tarjetas */
		border-radius: 24px;
		overflow: hidden;
		background: #061722;
		border: 1px solid rgba(127, 227, 245, 0.35);
		box-shadow: 0 40px 90px -40px rgba(10, 37, 64, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.tc-spine-bloom {
		position: absolute;
		inset: -20%;
		background: radial-gradient(circle at 50% 45%, rgba(52, 208, 192, 0.35), transparent 60%);
		filter: blur(40px);
		pointer-events: none;
		z-index: 0;
	}
	.tc-spine-video {
		position: absolute;
		inset: 0;
		z-index: 1;
		width: 100%;
		height: 100%;
		object-fit: cover;
		-webkit-mask-image: linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent);
		mask-image: linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent);
	}

	/* --- mensaje clave --- */
	.tc-message {
		max-width: 60ch;
		margin: clamp(3rem, 5vw, 5rem) auto 0;
		text-align: center;
		font-size: clamp(1.25rem, 2.2vw, 2rem);
		line-height: 1.5;
		color: #0f172a;
	}
	.tc-message strong {
		color: #0883a0;
		font-weight: 700;
	}

	/* --- scroll-reveal (solo opacity/transform) ---
	   La clase .tc-reveal se aplica imperativamente vía JS (use:_reveal),
	   por eso se marca :global para que el compilador no la considere sin uso. */
	:global(.tc-reveal) {
		opacity: 0;
		transform: translateY(16px);
		transition:
			opacity 0.6s ease,
			transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: var(--tc-delay, 0ms);
	}
	:global(.tc-reveal.is-revealed) {
		opacity: 1;
		transform: translateY(0);
	}

	/* ≥768px hasta <1024px: cuadrícula 2×2 con el spine arriba como banner */
	@media (max-width: 1023px) {
		.tc-grid {
			grid-template-columns: 1fr;
		}
		.tc-spine {
			order: -1;
			margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
		}
		.tc-spine-frame {
			position: static;
			aspect-ratio: 1168 / 784;
			max-height: 360px;
		}
	}

	/* ≤767px: una sola columna de tarjetas, sin spine video */
	@media (max-width: 767px) {
		.tc-spine {
			display: none;
		}
		.tc-layers {
			grid-template-columns: 1fr;
		}
		.tc-num {
			font-size: clamp(1.3rem, 6vw, 1.8rem);
		}
		.tc-section {
			padding-bottom: clamp(2rem, 6vw, 3rem);
		}
		.tc-message {
			margin-top: 2rem;
			font-size: clamp(1.15rem, 5vw, 1.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.tc-reveal) {
			opacity: 1;
			transform: none;
			transition: none;
		}
		.tc-card,
		.tc-chip {
			transition: none;
		}
		.tc-card:hover {
			transform: none;
		}
		.tc-spine-video {
			display: none;
		}
		.tc-spine-frame::after {
			content: '';
			position: absolute;
			inset: 0;
			background: url('/img/technology-man.png') center / cover no-repeat;
			z-index: 1;
		}
	}

	.ecosystem-section {
		padding: 5rem 0 3rem;
		position: relative;
	}
	.ecosystem-products-preview {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		margin-top: 3rem;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}
	.ecosystem-product-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2.5rem 2rem;
		text-decoration: none;
		color: #d8d7cc;
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(255, 255, 255, 0.02);
		transition: all 0.3s ease;
		gap: 0.75rem;
	}
	.ecosystem-product-card:hover {
		border-color: rgba(0, 166, 192, 0.3);
		background: rgba(0, 166, 192, 0.05);
		transform: translateY(-4px);
	}
	.ecosystem-logo {
		height: 70px;
		width: auto;
		object-fit: contain;
		filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.1));
	}
	.ecosystem-product-name {
		font-size: 2rem;
		font-weight: 800;
		color: #ffffff;
		margin: 0;
		letter-spacing: 1px;
	}
	.ecosystem-product-tagline {
		font-size: 0.95rem;
		color: #9ca3af;
		margin: 0;
		line-height: 1.4;
	}
	.ecosystem-cta {
		font-size: 0.875rem;
		color: #00a6c0;
		font-weight: 500;
		margin-top: 0.5rem;
		transition: color 0.2s;
	}
	.ecosystem-product-card:hover .ecosystem-cta {
		color: #ffffff;
	}
	.ecosystem-divider {
		width: 1px;
		height: 120px;
		background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.15), transparent);
		flex-shrink: 0;
		margin: 0 1rem;
	}
	@media (max-width: 600px) {
		.ecosystem-products-preview {
			flex-direction: column;
			gap: 1rem;
		}
		.ecosystem-divider {
			width: 80px;
			height: 1px;
			background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent);
		}
	}

	/* ===== BTN-PRODUCT-CTA ===== */
	.btn-product-cta {
		display: inline-block;
		margin-top: 1.25rem;
		padding: 0.625rem 1.5rem;
		background: transparent;
		border: 1px solid rgba(0, 166, 192, 0.5);
		color: #00a6c0;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.25s ease;
		letter-spacing: 0.03em;
	}
	.btn-product-cta:hover {
		background: rgba(0, 166, 192, 0.1);
		border-color: #00a6c0;
		color: #ffffff;
	}
	.orion-tagline {
		font-size: 1rem;
		color: #9ca3af;
		margin: 0.25rem 0 0;
		font-family: 'Outfit', sans-serif;
	}
	.orion-subtitle {
		font-size: 0.85rem;
		color: #6b7280;
		margin: 0.5rem 0 0;
		max-width: 260px;
		text-align: center;
		line-height: 1.4;
	}

	/* ===== CAPABILITIES SECTION ===== */
	.capabilities-section {
		padding: 6rem 0;
		background: linear-gradient(to bottom, #000000 0%, #00001a 50%, #000000 100%);
	}
	.capabilities-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		margin-top: 3.5rem;
	}
	.capability-card {
		padding: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.02);
		transition: all 0.3s ease;
	}
	.capability-card:hover {
		border-color: rgba(0, 166, 192, 0.2);
		background: rgba(0, 166, 192, 0.03);
		transform: translateY(-2px);
	}
	.capability-icon {
		width: 40px;
		height: 40px;
		color: #00a6c0;
		margin-bottom: 1.25rem;
	}
	.capability-icon svg {
		width: 100%;
		height: 100%;
	}
	.capability-card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 0.75rem;
	}
	.capability-card p {
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.6;
		margin: 0;
	}
	@media (max-width: 900px) {
		.capabilities-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 600px) {
		.capabilities-grid {
			grid-template-columns: 1fr;
		}
	}

	/* ===== BUSINESS MODELS SECTION ===== */
	.business-models-section {
		padding: 6rem 0;
	}
	.business-models-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		margin-top: 3.5rem;
		max-width: 900px;
		margin-left: auto;
		margin-right: auto;
	}
	.business-model-card {
		padding: 2rem 2rem 1.75rem;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.02);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		transition: all 0.3s ease;
	}
	.business-model-card:hover {
		border-color: rgba(0, 166, 192, 0.25);
		background: rgba(0, 166, 192, 0.04);
	}
	.bm-label {
		font-size: 1.05rem;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 0.01em;
	}
	.business-model-card p {
		font-size: 0.9rem;
		color: #6b7280;
		line-height: 1.6;
		margin: 0;
		flex: 1;
	}
	.bm-example {
		font-size: 0.8rem;
		color: #4b5563;
		margin-top: 0.5rem;
	}
	.bm-example span {
		color: #00a6c0;
		font-weight: 500;
	}
	.bm-cta-wrapper {
		text-align: center;
		margin-top: 3rem;
	}
	@media (max-width: 640px) {
		.business-models-grid {
			grid-template-columns: 1fr;
		}
	}

	/* ===== DIFFERENTIATORS (Quiénes Somos) ===== */
	.social-proof-line {
		font-size: 0.9rem;
		color: #6b7280;
		line-height: 1.7;
		margin: 1.5rem 0 1.25rem;
		font-style: italic;
	}
	.differentiators-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	.diff-pill {
		padding: 0.4rem 0.9rem;
		border: 1px solid rgba(0, 166, 192, 0.3);
		border-radius: 50px;
		font-size: 0.8rem;
		color: #9ca3af;
		background: rgba(0, 166, 192, 0.04);
		white-space: nowrap;
	}

	/* ===== VISION SECTION ===== */
	.vision-section {
		padding: 7rem 0;
		background: linear-gradient(to bottom, #000000, #00001a 50%, #000000);
	}
	.vision-content {
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
	}
	.vision-text-block {
		margin-top: 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.vision-text-block p {
		font-size: 1.125rem;
		color: #9ca3af;
		line-height: 1.8;
		margin: 0;
	}
	.vision-lead {
		font-size: 1.3rem !important;
		color: #d8d7cc !important;
		font-weight: 500;
	}
	.vision-closing {
		font-size: 1.2rem !important;
		color: #d8d7cc !important;
		margin-top: 0.75rem !important;
	}
	.vision-closing strong {
		color: #ffffff;
	}
	.vision-cta {
		margin-top: 3rem;
	}

	/* ═══════════════════════════════════════════════════
	   SISTEMA VISUAL GLASS — REDISEÑO COMPLETO
	   ═══════════════════════════════════════════════════ */

	/* Fondo de página global */
	:global(body) {
		background: #071628 !important;
		background-image:
			radial-gradient(ellipse 90% 60% at 10% 5%, rgba(0, 166, 192, 0.22) 0%, transparent 50%),
			radial-gradient(ellipse 70% 50% at 90% 70%, rgba(59, 91, 219, 0.2) 0%, transparent 50%),
			radial-gradient(ellipse 60% 70% at 50% 45%, rgba(14, 165, 233, 0.1) 0%, transparent 65%) !important;
	}

	/* Canvas decorativo fijo */
	.page-canvas {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(70px);
		animation: orb-drift 24s ease-in-out infinite;
	}
	.orb-1 {
		width: 800px;
		height: 800px;
		top: -300px;
		left: -250px;
		background: radial-gradient(circle, rgba(0, 166, 192, 0.32) 0%, transparent 65%);
		animation-duration: 28s;
	}
	.orb-2 {
		width: 650px;
		height: 650px;
		top: 20%;
		right: -180px;
		background: radial-gradient(circle, rgba(59, 91, 219, 0.28) 0%, transparent 65%);
		animation-duration: 34s;
		animation-delay: -12s;
	}
	.orb-3 {
		width: 500px;
		height: 500px;
		bottom: 25%;
		left: 10%;
		background: radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, transparent 65%);
		animation-duration: 26s;
		animation-delay: -6s;
	}
	.orb-4 {
		width: 400px;
		height: 400px;
		bottom: 5%;
		right: 15%;
		background: radial-gradient(circle, rgba(0, 210, 200, 0.2) 0%, transparent 65%);
		animation-duration: 20s;
		animation-delay: -18s;
	}
	@keyframes orb-drift {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		25% {
			transform: translate(35px, -45px) scale(1.06);
		}
		50% {
			transform: translate(-25px, 35px) scale(0.94);
		}
		75% {
			transform: translate(45px, 25px) scale(1.03);
		}
	}

	.grid-lines {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(0, 166, 192, 0.025) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 166, 192, 0.025) 1px, transparent 1px);
		background-size: 64px 64px;
		mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 20%, transparent 80%);
		-webkit-mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 20%, transparent 80%);
	}

	/* Todas las secciones encima del canvas */
	section {
		position: relative;
		z-index: 1;
	}

	/* Separadores entre secciones */
	.section-sep {
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(0, 166, 192, 0.3) 25%,
			rgba(14, 165, 233, 0.35) 50%,
			rgba(59, 91, 219, 0.3) 75%,
			transparent 100%
		);
		position: relative;
		z-index: 1;
		box-shadow: 0 0 12px rgba(0, 166, 192, 0.15);
	}

	/* Fondos de sección */
	.ecosystem-section {
		padding: 5rem 0 3rem;
		background: transparent;
	}
	.capabilities-section {
		padding: 6rem 0;
		background: transparent;
	}
	.business-models-section {
		padding: 6rem 0;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(4, 15, 40, 0.65) 20%,
			rgba(4, 15, 40, 0.65) 80%,
			transparent 100%
		);
	}
	:global(.about-section) {
		padding: 6rem 0 !important;
		background: transparent !important;
	}
	:global(.about-section .container) {
		background: transparent !important;
	}
	.lo-que-hacemos-section {
		padding: 6rem 0;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(0, 10, 30, 0.7) 15%,
			rgba(0, 10, 30, 0.7) 85%,
			transparent 100%
		);
	}
	.vision-section {
		padding: 7rem 0;
		background: transparent;
	}
	:global(.contact-section) {
		padding: 6rem 0 !important;
		background: transparent !important;
	}

	/* ── Tarjetas Ecosystem ──────────────────────────── */
	.ecosystem-product-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2.75rem 2rem;
		text-decoration: none;
		color: #e2e8f0;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.07);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.14);
		box-shadow:
			0 8px 40px rgba(0, 0, 0, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.12);
		transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
		gap: 0.75rem;
	}
	.ecosystem-product-card:hover {
		background: rgba(0, 166, 192, 0.12);
		border-color: rgba(0, 166, 192, 0.45);
		box-shadow:
			0 16px 56px rgba(0, 166, 192, 0.22),
			inset 0 1px 0 rgba(0, 166, 192, 0.16);
		transform: translateY(-8px);
	}

	/* ── Nexus sin video ─────────────────────────────── */
	.nexus-item {
		position: relative;
		overflow: hidden;
		border-radius: 24px;
		background: linear-gradient(
			135deg,
			rgba(0, 166, 192, 0.1) 0%,
			rgba(4, 20, 55, 0.65) 50%,
			rgba(0, 80, 130, 0.1) 100%
		) !important;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(0, 166, 192, 0.18) !important;
		box-shadow:
			0 0 70px rgba(0, 166, 192, 0.07),
			0 20px 60px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(0, 166, 192, 0.12);
	}
	.product-bg-overlay {
		display: none;
	}
	.product-bg-video {
		display: none;
	}
	.orion-bg-video {
		display: none;
	}

	.overlay-features li {
		background: rgba(5, 15, 40, 0.7) !important;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(0, 166, 192, 0.18) !important;
	}
	.feature-title {
		background: rgba(5, 15, 40, 0.72) !important;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-right: 3px solid rgba(0, 166, 192, 0.65) !important;
	}

	/* ── Orion sin video planeta ─────────────────────── */
	.orion-visual-branding {
		background: radial-gradient(
			ellipse 80% 80% at center,
			rgba(0, 166, 192, 0.1) 0%,
			rgba(14, 165, 233, 0.06) 35%,
			rgba(5, 15, 40, 0.3) 70%,
			transparent 100%
		) !important;
		border: 1px solid rgba(0, 166, 192, 0.1) !important;
		border-radius: 20px;
		box-shadow:
			0 0 60px rgba(0, 166, 192, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
	}

	/* ── Capacidades glass ───────────────────────────── */
	.capability-card {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.065);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.13);
		border-radius: 16px;
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.28),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}
	.capability-card:hover {
		background: rgba(0, 166, 192, 0.1);
		border-color: rgba(0, 166, 192, 0.35);
		box-shadow:
			0 10px 36px rgba(0, 166, 192, 0.16),
			inset 0 1px 0 rgba(0, 166, 192, 0.12);
		transform: translateY(-4px);
	}
	.capability-card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #f1f5f9;
		margin: 0 0 0.625rem;
	}
	.capability-card p {
		font-size: 0.875rem;
		color: #7a8fa6;
		line-height: 1.65;
		margin: 0;
	}

	/* ── Modelos comerciales glass ───────────────────── */
	.business-model-card {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.065);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.13);
		border-radius: 16px;
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.28),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		transition: all 0.3s ease;
	}
	.business-model-card:hover {
		background: rgba(59, 91, 219, 0.12);
		border-color: rgba(59, 91, 219, 0.35);
		box-shadow:
			0 10px 36px rgba(59, 91, 219, 0.16),
			inset 0 1px 0 rgba(59, 91, 219, 0.12);
	}
	.bm-label {
		font-size: 1.05rem;
		font-weight: 700;
		color: #f1f5f9;
	}
	.business-model-card p {
		font-size: 0.875rem;
		color: #64748b;
		line-height: 1.6;
		margin: 0;
		flex: 1;
	}
	.bm-example {
		font-size: 0.8rem;
		color: #475569;
		margin-top: 0.25rem;
	}
	.bm-example span {
		color: #00a6c0;
		font-weight: 500;
	}

	/* ── Future cards glass ──────────────────────────── */
	.future-action-card {
		background: rgba(255, 255, 255, 0.065) !important;
		backdrop-filter: blur(20px) !important;
		-webkit-backdrop-filter: blur(20px) !important;
		border: 1px solid rgba(255, 255, 255, 0.13) !important;
		border-radius: 16px !important;
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.28),
			inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
		transition: all 0.3s ease !important;
	}
	.future-action-card:hover {
		background: rgba(0, 166, 192, 0.1) !important;
		border-color: rgba(0, 166, 192, 0.3) !important;
		transform: translateY(-5px) !important;
		box-shadow:
			0 12px 36px rgba(0, 166, 192, 0.16),
			inset 0 1px 0 rgba(0, 166, 192, 0.1) !important;
	}

	/* ── Quiénes somos ───────────────────────────────── */
	.diff-pill {
		padding: 0.4rem 1rem;
		background: rgba(0, 166, 192, 0.07);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(0, 166, 192, 0.22);
		border-radius: 50px;
		font-size: 0.8rem;
		color: #94a3b8;
		transition: all 0.2s ease;
		white-space: nowrap;
	}
	.diff-pill:hover {
		background: rgba(0, 166, 192, 0.15);
		border-color: rgba(0, 166, 192, 0.45);
		color: #e2e8f0;
	}

	/* ── Visión glass container ──────────────────────── */
	.vision-content {
		background: rgba(255, 255, 255, 0.06);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 24px;
		padding: 4rem 3rem;
		box-shadow:
			0 12px 48px rgba(0, 0, 0, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.12);
		position: relative;
		overflow: hidden;
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
	}
	.vision-content::before {
		content: '';
		position: absolute;
		top: -40%;
		left: -15%;
		width: 55%;
		height: 90%;
		background: radial-gradient(circle, rgba(0, 166, 192, 0.06) 0%, transparent 70%);
		pointer-events: none;
	}

	/* ── Contacto glass ──────────────────────────────── */
	:global(.contact-form) {
		background: rgba(255, 255, 255, 0.07) !important;
		backdrop-filter: blur(24px) saturate(180%) !important;
		-webkit-backdrop-filter: blur(24px) saturate(180%) !important;
		border: 1px solid rgba(255, 255, 255, 0.14) !important;
		border-radius: 20px !important;
		padding: 2.5rem !important;
		box-shadow:
			0 10px 40px rgba(0, 0, 0, 0.32),
			inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
	}
	:global(.contact-info) {
		background: rgba(255, 255, 255, 0.06) !important;
		backdrop-filter: blur(20px) !important;
		-webkit-backdrop-filter: blur(20px) !important;
		border: 1px solid rgba(255, 255, 255, 0.12) !important;
		border-radius: 20px !important;
		padding: 2.5rem !important;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.28),
			inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
	}

	/* ── Tech showcase (Quiénes Somos visual) ────────── */
	.tech-showcase {
		background: radial-gradient(ellipse at center, rgba(0, 166, 192, 0.07) 0%, transparent 70%);
	}

	/* ── Overrides agresivos contra fondos oscuros del CSS global ── */
	:global(section.about-section),
	:global(.about-section) {
		background: transparent !important;
	}
	:global(.about-section .container) {
		background: transparent !important;
	}
	:global(.lo-que-hacemos-section) {
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(0, 10, 30, 0.68) 15%,
			rgba(0, 10, 30, 0.68) 85%,
			transparent 100%
		) !important;
	}
	:global(.contact-section) {
		background: transparent !important;
	}
	:global(.contact-section .container) {
		background: transparent !important;
	}
	:global(.services-section) {
		background: transparent !important;
	}

	/* Responsive — ocultar orbes en mobile para perf */
	@media (max-width: 768px) {
		.orb-3,
		.orb-4 {
			display: none;
		}
		.orb-1,
		.orb-2 {
			filter: blur(60px);
		}
		.vision-content {
			padding: 2.5rem 1.5rem;
		}
	}

	/* ── Hero partículas ─────────────────────────────────── */
	.hero-particle-section {
		position: relative;
		width: 100%;
		min-height: 100vh;
		overflow: hidden;
		background-image: url('/img/deepspace.png');
		background-size: cover;
		background-position: center center;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.hero-bg-video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center center;
		z-index: 0;
		pointer-events: none;
		opacity: 0; /* HeroGlitch canvas maneja el display */
	}

	/* Gradiente izquierda → legibilidad del texto */
	.hero-video-fade {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background: linear-gradient(
			to right,
			rgba(0, 0, 0, 0.82) 0%,
			rgba(0, 0, 0, 0.55) 32%,
			rgba(0, 0, 0, 0.18) 58%,
			transparent 100%
		);
		z-index: 2;
		pointer-events: none;
	}

	/* Viñeta radial para enfocar la atención */
	.hero-vignette {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		background: radial-gradient(
			ellipse 110% 100% at 50% 50%,
			transparent 40%,
			rgba(0, 0, 0, 0.55) 100%
		);
	}

	/* Scanlines — textura CRT sutil */
	.hero-scanlines {
		position: absolute;
		inset: 0;
		z-index: 4;
		pointer-events: none;
		background: repeating-linear-gradient(
			0deg,
			transparent 0px,
			transparent 3px,
			rgba(0, 0, 0, 0.06) 3px,
			rgba(0, 0, 0, 0.06) 4px
		);
	}

	/* Línea de barrido horizontal que recorre la pantalla */
	.hero-sweep {
		position: absolute;
		left: 0;
		width: 100%;
		height: 2px;
		z-index: 5;
		pointer-events: none;
		background: linear-gradient(
			to right,
			transparent 0%,
			rgba(0, 255, 150, 0) 20%,
			rgba(0, 255, 150, 0.35) 50%,
			rgba(0, 200, 255, 0.25) 65%,
			transparent 100%
		);
		animation: heroSweep 7s ease-in-out infinite;
	}
	@keyframes heroSweep {
		0% {
			top: -2px;
			opacity: 0;
		}
		4% {
			opacity: 1;
		}
		96% {
			opacity: 0.5;
		}
		100% {
			top: 100%;
			opacity: 0;
		}
	}

	/* Resplandor verde suave en el lado del logo */
	.hero-right-glow {
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		width: 55%;
		z-index: 2;
		pointer-events: none;
		background: radial-gradient(
			ellipse at 78% 44%,
			rgba(0, 255, 140, 0.07) 0%,
			rgba(0, 200, 255, 0.04) 35%,
			transparent 65%
		);
		animation: rightGlowPulse 4s ease-in-out infinite;
	}
	@keyframes rightGlowPulse {
		0%,
		100% {
			opacity: 0.8;
		}
		50% {
			opacity: 1;
		}
	}

	/* Esquinas decorativas estilo HUD */
	.hero-corner-tl,
	.hero-corner-bl {
		position: absolute;
		left: 2.5vw;
		z-index: 6;
		pointer-events: none;
		width: 28px;
		height: 28px;
	}
	.hero-corner-tl {
		top: 5rem;
		border-top: 1.5px solid rgba(0, 255, 150, 0.45);
		border-left: 1.5px solid rgba(0, 255, 150, 0.45);
		animation: hudCornerFade 3s ease-in-out infinite;
	}
	.hero-corner-bl {
		bottom: 3rem;
		border-bottom: 1.5px solid rgba(0, 200, 255, 0.35);
		border-left: 1.5px solid rgba(0, 200, 255, 0.35);
		animation: hudCornerFade 3s ease-in-out infinite 1.5s;
	}
	@keyframes hudCornerFade {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 0.9;
		}
	}

	.hero-video-bottom-fade {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 25%;
		width: 100%;
		background: linear-gradient(to top, #000000 65%, transparent 100%);
		z-index: 2;
		pointer-events: none;
	}

	.hero-text-overlay {
		position: relative;
		z-index: 10;
		width: 100%;
		text-align: left;
		padding: 0 5vw 4vh;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.1rem;
		pointer-events: none;
	}

	.hero-text-overlay a {
		pointer-events: all;
	}

	/* Etiqueta pequeña tipo código sobre el título */
	.hero-label {
		font-family: 'Courier New', 'Consolas', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.18em;
		color: rgba(0, 255, 150, 0.65);
		text-transform: uppercase;
		animation: heroLabelFlicker 5s ease-in-out infinite;
	}
	@keyframes heroLabelFlicker {
		0%,
		89%,
		91%,
		93%,
		100% {
			opacity: 0.65;
		}
		90%,
		92% {
			opacity: 0.2;
		}
	}

	.hero-particle-title {
		font-family:
			'Dune Rise',
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		font-size: clamp(1.4rem, 3.2vw, 2.4rem);
		font-weight: normal;
		background: linear-gradient(
			135deg,
			var(--light-cream, #f5f0e8) 0%,
			var(--accent-cyan, #00a6c0) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1.25;
		letter-spacing: 0.02em;
		min-height: 2.6em;
		white-space: nowrap;
		animation: titleGlitch 11s ease-in-out infinite;
	}

	/* Glitch ocasional en el título */
	@keyframes titleGlitch {
		0%,
		88%,
		100% {
			transform: none;
			filter: none;
		}
		89% {
			transform: translateX(-3px) skewX(-1.5deg);
			filter: brightness(1.6) hue-rotate(40deg);
		}
		90% {
			transform: translateX(3px);
			filter: brightness(0.7) hue-rotate(-40deg);
		}
		91% {
			transform: translateX(-1px);
			filter: brightness(1.2);
		}
		92% {
			transform: none;
			filter: none;
		}
	}

	/* Barra de estado tipo HUD */
	.hero-status-bar {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 0.5rem;
	}
	.hero-status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #00ff99;
		box-shadow:
			0 0 6px #00ff99,
			0 0 12px rgba(0, 255, 153, 0.4);
		animation: statusPulse 1.8s ease-in-out infinite;
	}
	@keyframes statusPulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.7);
		}
	}
	.hero-status-text {
		font-family: 'Courier New', monospace;
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		color: rgba(0, 255, 150, 0.5);
		text-transform: uppercase;
	}
	.hero-status-sep {
		color: rgba(255, 255, 255, 0.15);
		font-size: 0.7rem;
	}

	.hero-blink-cursor {
		-webkit-text-fill-color: var(--accent-cyan, #00a6c0);
		animation: hero-blink 2s infinite;
	}

	@keyframes hero-blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	.hero-particle-subtitle {
		font-size: 1.05rem;
		color: rgba(216, 215, 204, 0.75);
		line-height: 1.65;
		max-width: 460px;
	}

	.hero-particle-buttons {
		display: flex;
		gap: 1.25rem;
		flex-wrap: wrap;
		justify-content: flex-end;
		width: 100%;
		margin-top: 0.25rem;
	}

	@media (max-width: 600px) {
		.hero-text-overlay {
			padding: 0 1.25rem 6vh;
			gap: 1rem;
		}
		.hero-particle-buttons {
			flex-direction: column;
			align-items: center;
		}
	}

	/* ── NEXUS PRODUCT SECTION ──────────────────────────────────── */
	.nexus-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(2rem, 4vw, 3.5rem);
		padding: 6rem 0;
		position: relative;
		overflow: hidden;
		background: #ffffff;
	}
	.nexus-head {
		position: relative;
		z-index: 1;
		text-align: center;
	}
	/* Título en fondo blanco: gradiente oscuro para contraste */
	.nexus-section .landing-section-title {
		background: linear-gradient(90deg, #0a2540, #0883a0);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: #0a2540;
	}

	/* Selector de producto (pills) */
	.nx-tabs {
		display: inline-flex;
		gap: 0.4rem;
		margin-top: 1.5rem;
		padding: 0.35rem;
		border-radius: 999px;
		background: rgba(10, 37, 64, 0.05);
		border: 1px solid rgba(10, 37, 64, 0.1);
	}
	.nx-tab {
		appearance: none;
		border: none;
		background: transparent;
		cursor: pointer;
		font-family: 'Dune Rise', system-ui, sans-serif;
		font-size: 0.95rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #0a2540;
		padding: 0.55rem 1.7rem;
		border-radius: 999px;
		transition:
			background 0.25s ease,
			color 0.25s ease,
			box-shadow 0.25s ease;
	}
	.nx-tab:hover {
		color: #0883a0;
	}
	.nx-tab.is-active {
		background: linear-gradient(135deg, #0a2540, #0883a0);
		color: #fff;
		box-shadow: 0 8px 20px -8px rgba(8, 131, 160, 0.55);
	}
	.nx-tab:focus-visible {
		outline: 2px solid #0883a0;
		outline-offset: 2px;
	}

	/* Tarjeta-marco (el fondo cambia según el producto activo) */
	.nx-card {
		position: relative;
		z-index: 1;
		overflow: hidden;
		width: min(2400px, 92vw);
		min-height: min(86vh, 920px);
		margin: 0 auto;
		padding: clamp(2rem, 4vw, 4.5rem);
		border: 1px solid rgba(244, 241, 232, 0.55);
		border-radius: clamp(20px, 2vw, 32px);
		transition:
			background 0.4s ease,
			box-shadow 0.4s ease;
	}
	/* Tema Nexus (grafito-teal + verde) */
	.nx-card[data-product='nexus'] {
		background:
			radial-gradient(120% 90% at 78% 38%, rgba(63, 174, 58, 0.1) 0%, transparent 55%),
			radial-gradient(90% 80% at 50% 110%, rgba(0, 166, 192, 0.07) 0%, transparent 60%),
			linear-gradient(165deg, #11171c 0%, #141d20 45%, #0f1518 100%);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset 0 0 60px rgba(244, 241, 232, 0.04),
			0 30px 80px -40px rgba(0, 0, 0, 0.6),
			0 0 40px -10px rgba(63, 174, 58, 0.1);
	}
	/* Tema Orion (negro mate + plata) */
	.nx-card[data-product='orion'] {
		background:
			radial-gradient(120% 90% at 78% 38%, rgba(214, 222, 230, 0.12) 0%, transparent 55%),
			radial-gradient(90% 80% at 50% 110%, rgba(176, 186, 198, 0.05) 0%, transparent 60%),
			linear-gradient(165deg, #0c0d0f 0%, #101113 45%, #08090a 100%);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset 0 0 60px rgba(244, 241, 232, 0.03),
			0 30px 80px -40px rgba(0, 0, 0, 0.7),
			0 0 40px -10px rgba(214, 222, 230, 0.12);
	}
	/* Ruido (noise.png) en el fondo de la tarjeta */
	.nx-card::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
		border-radius: inherit;
		pointer-events: none;
		background-image: url('/img/noise.png');
		background-size: 180px 180px;
		opacity: 0.09;
		mix-blend-mode: overlay;
	}

	/* Pila de paneles: ambos en la misma celda → altura estable, crossfade */
	.nx-panels {
		position: relative;
		z-index: 1;
		display: grid;
	}
	.nx-panel {
		grid-area: 1 / 1;
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: clamp(2rem, 4vw, 5rem);
		align-items: center;
		opacity: 0;
		visibility: hidden;
		transform: translateY(8px);
		pointer-events: none;
		transition:
			opacity 0.28s ease,
			transform 0.28s ease,
			visibility 0s linear 0.28s;
	}
	.nx-panel.is-active {
		opacity: 1;
		visibility: visible;
		transform: none;
		pointer-events: auto;
		transition:
			opacity 0.28s ease,
			transform 0.28s ease,
			visibility 0s;
	}
	.nx-content,
	.nx-stage {
		position: relative;
		z-index: 1;
	}

	/* Acentos Orion (plata) */
	.nx-panel--orion .nx-eyebrow {
		color: rgba(205, 213, 221, 0.85);
	}
	.nx-panel--orion .nx-title {
		background: linear-gradient(120deg, #ffffff 0%, #dfe5ea 45%, #aeb8c2 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.nx-panel--orion .nx-chip {
		border-color: rgba(205, 213, 221, 0.28);
	}
	.nx-panel--orion .nx-chip::before {
		background: #c3ccd6;
	}
	.nx-panel--orion .nx-chip--case {
		border-color: rgba(205, 213, 221, 0.16);
	}
	.nx-panel--orion .nx-cta {
		color: #d7dde4;
	}
	.nx-panel--orion .nx-cta:focus-visible {
		outline-color: #d7dde4;
	}
	.nx-panel--orion .nx-halo {
		background: radial-gradient(
			circle,
			rgba(232, 237, 242, 0.22) 0%,
			rgba(180, 190, 200, 0.08) 42%,
			transparent 72%
		);
	}
	.nx-panel--orion .nx-logo {
		filter: drop-shadow(0 0 26px rgba(228, 234, 240, 0.5))
			drop-shadow(0 18px 40px rgba(0, 0, 0, 0.5));
	}
	.nx-panel--orion .nx-floor {
		background: radial-gradient(ellipse at center, rgba(228, 234, 240, 0.14) 0%, transparent 70%);
	}

	/* Partículas de Orion: fluyen de la esquina inferior izquierda hacia el logo */
	.nx-orion-fx {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.nx-orion-fx span {
		position: absolute;
		left: 74%;
		top: 48%;
		width: var(--s, 3px);
		height: var(--s, 3px);
		border-radius: 50%;
		background: rgba(224, 231, 238, 0.95);
		box-shadow: 0 0 6px rgba(210, 220, 230, 0.5);
		opacity: 0;
		animation: orionDrift var(--dur, 6s) linear var(--d, 0s) infinite;
		will-change: transform, opacity;
	}
	@keyframes orionDrift {
		0% {
			transform: translate(calc(-50% + var(--sx)), calc(-50% + var(--sy))) scale(0.5);
			opacity: 0;
		}
		14% {
			opacity: var(--o, 0.7);
		}
		82% {
			opacity: calc(var(--o, 0.7) * 0.55);
		}
		100% {
			transform: translate(-50%, -50%) scale(1.05);
			opacity: 0;
		}
	}

	/* Left content */
	.nx-content {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.nx-eyebrow {
		font-family: 'Inter', system-ui, sans-serif;
		font-size: 0.72rem;
		font-weight: 600;
		color: rgba(95, 209, 88, 0.85);
		text-transform: uppercase;
		letter-spacing: 0.28em;
		margin: 0 0 0.75rem;
	}
	.nx-title {
		font-family: 'Dune Rise', system-ui, sans-serif;
		font-size: clamp(2.6rem, 5vw, 4.4rem);
		letter-spacing: 0.04em;
		line-height: 1;
		margin: 0 0 1.25rem;
		background: linear-gradient(120deg, #f4f1e8 0%, #cfe9c6 45%, #5fd158 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.nx-subtitle {
		font-family: 'Inter', system-ui, sans-serif;
		font-size: clamp(1rem, 1.25vw, 1.18rem);
		font-weight: 400;
		color: rgba(244, 241, 232, 0.78);
		line-height: 1.55;
		max-width: 46ch;
		margin: 0;
	}

	/* Audiences */
	.nx-audiences {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		border-top: 1px solid rgba(244, 241, 232, 0.1);
		padding: 1.5rem 0 0;
		margin: 1.5rem 0 0;
	}
	.nx-aud {
		display: flex;
		align-items: baseline;
	}
	.nx-aud::before {
		content: '';
		flex: 0 0 auto;
		width: 3px;
		height: 1.1em;
		background: #3fae3a;
		border-radius: 2px;
		margin-right: 0.75rem;
		align-self: flex-start;
		transform: translateY(0.15em);
	}
	.nx-aud-label {
		font-family: 'Inter', system-ui, sans-serif;
		font-weight: 700;
		color: #eef2e9;
		min-width: 9.5rem;
	}
	.nx-aud-benefit {
		font-family: 'Inter', system-ui, sans-serif;
		color: rgba(244, 241, 232, 0.65);
	}

	/* Spec sheet lists */
	.nx-lists {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(1.5rem, 3vw, 3rem);
		margin-top: clamp(1.5rem, 3vw, 2.5rem);
	}
	.nx-list-col {
		min-width: 0;
	}
	.nx-list-title {
		font-family: 'Audiowide', system-ui, sans-serif;
		font-weight: 700;
		font-size: 0.82rem;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: rgba(244, 241, 232, 0.55);
		margin: 0 0 0.75rem;
	}
	.nx-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.55rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.nx-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.34rem 0.7rem;
		border-radius: 999px;
		border: 1px solid rgba(63, 174, 58, 0.28);
		background: rgba(255, 255, 255, 0.03);
		color: rgba(244, 241, 232, 0.82);
		font-family: 'Inter', system-ui, sans-serif;
		font-size: 0.82rem;
		font-weight: 500;
		line-height: 1.2;
		transition:
			transform 0.25s ease,
			opacity 0.25s ease,
			box-shadow 0.25s ease;
	}
	.nx-chip::before {
		content: '';
		flex: 0 0 auto;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: #3fae3a;
		margin-right: 0.45rem;
	}
	.nx-chip--case {
		border-color: rgba(0, 166, 192, 0.22);
	}
	.nx-chip--case::before {
		content: none;
	}
	.nx-chip:hover {
		transform: translateY(-2px);
		opacity: 1;
		box-shadow: 0 6px 18px -10px rgba(0, 0, 0, 0.7);
	}

	/* CTA */
	.nx-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		align-self: flex-start;
		margin-top: clamp(1.5rem, 3vw, 2.25rem);
		font-family: 'Inter', system-ui, sans-serif;
		font-size: 0.95rem;
		font-weight: 600;
		color: #5fd158;
		text-decoration: none;
		border-radius: 6px;
	}
	.nx-cta:focus-visible {
		outline: 2px solid #5fd158;
		outline-offset: 3px;
	}
	.nx-cta-arrow {
		display: inline-block;
		transition: transform 0.25s ease;
	}
	.nx-cta:hover .nx-cta-arrow {
		transform: translateX(4px);
	}

	/* Right stage */
	.nx-stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100%;
	}
	.nx-halo {
		position: absolute;
		z-index: 2;
		width: 120%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(63, 174, 58, 0.22) 0%,
			rgba(0, 166, 192, 0.08) 40%,
			transparent 70%
		);
		filter: blur(10px);
		animation: nexusHaloPulse 7s ease-in-out infinite;
		pointer-events: none;
	}
	.nx-logo-link {
		display: contents;
	}
	.nx-logo {
		position: relative;
		z-index: 3;
		width: clamp(240px, 26vw, 460px);
		aspect-ratio: 1;
		object-fit: contain;
		cursor: pointer;
		filter: drop-shadow(0 0 28px rgba(63, 174, 58, 0.35))
			drop-shadow(0 18px 40px rgba(0, 0, 0, 0.45));
		transition: transform 0.3s ease;
	}
	.nx-logo:hover {
		transform: scale(1.04);
	}
	.nx-floor {
		position: absolute;
		bottom: 6%;
		width: 55%;
		height: 36px;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(63, 174, 58, 0.16) 0%, transparent 70%);
		filter: blur(6px);
		pointer-events: none;
	}

	@keyframes nexusHaloPulse {
		0%,
		100% {
			opacity: 0.7;
		}
		50% {
			opacity: 1;
		}
	}

	/* Tablet: single column, stage above content */
	@media (max-width: 1023px) {
		.nexus-section {
			min-height: auto;
			align-items: flex-start;
			padding: 4rem 0;
		}
		.nx-card {
			min-height: auto;
		}
		.nx-panel {
			grid-template-columns: 1fr;
		}
		.nx-stage {
			order: -1;
			min-height: auto;
		}
		.nx-logo {
			width: clamp(200px, 38vw, 300px);
		}
	}

	/* Mobile */
	@media (max-width: 639px) {
		.nexus-section {
			padding: 3.5rem 0;
		}
		.nx-card {
			width: 94vw;
			padding: clamp(1.25rem, 5vw, 2rem);
			border-radius: 18px;
		}
		.nx-subtitle {
			max-width: 100%;
		}
		.nx-logo {
			width: clamp(150px, 50vw, 220px);
		}
		.nx-lists {
			grid-template-columns: 1fr;
		}
		.nx-aud {
			flex-direction: column;
		}
		.nx-aud-label {
			min-width: 0;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.nx-logo,
		.nx-halo {
			animation: none;
		}
		.nx-card,
		.nx-chip,
		.nx-cta-arrow,
		.nx-panel {
			transition: none;
		}
		.nx-orion-fx span {
			animation: none;
			opacity: 0;
		}
	}
</style>
