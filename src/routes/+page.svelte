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

	// Parallax del fondo de la tarjeta (solo se mueve la capa de fondo, no la tarjeta)
	function onNxMove(e) {
		const card = e.currentTarget;
		const r = card.getBoundingClientRect();
		card.style.setProperty('--nx-mx', (e.clientX - r.left) / r.width - 0.5);
		card.style.setProperty('--nx-my', (e.clientY - r.top) / r.height - 0.5);
	}
	function onNxLeave(e) {
		e.currentTarget.style.setProperty('--nx-mx', 0);
		e.currentTarget.style.setProperty('--nx-my', 0);
	}

	// Partículas del fondo de Orion (fluyen de la esquina inferior izquierda hacia el logo,
	// cruzando también por detrás del texto de la izquierda)
	const orionParticles = Array.from({ length: 50 }, () => ({
		sx: -(120 + Math.random() * 1080), // desplazamiento inicial a la izquierda (px)
		sy: -40 + Math.random() * 640, // desplazamiento inicial vertical (px)
		d: +(Math.random() * 9).toFixed(2),
		dur: +(4.5 + Math.random() * 5.5).toFixed(2),
		s: +(1.6 + Math.random() * 2.8).toFixed(1),
		o: +(0.28 + Math.random() * 0.42).toFixed(2)
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

	// Video del futuro: textos secuenciales
	let futuroVideo;
	let currentTextIndex = 0;
	let exitingTextIndex = -1;
	let futuroTextInterval;
	let videoFadeState = ''; // '' | 'out' | 'in'
	let futuroProgressKey = 0; // fuerza recrear la barra de progreso en cada cambio

	function _futuroReveal(node) {
		const show = () => node.classList.add('futuro-in-view');
		// fallback: siempre visible después de 200ms aunque el observer no dispare
		const fallback = setTimeout(show, 200);
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						show();
						clearTimeout(fallback);
						observer.unobserve(node);
					}
				});
			},
			{ threshold: 0 }
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
				clearTimeout(fallback);
			}
		};
	}

	const futuroTextos = [
		{
			title: 'Señales móviles',
			desc: 'Capturamos señales del mundo real para ampliar cobertura, precisión y contexto.'
		},
		{
			title: 'Localización híbrida',
			desc: 'Ubicación basada en GPS, celdas, WiFi y contexto geoespacial.'
		},
		{
			title: 'Contexto geoespacial',
			desc: 'Convertimos coordenadas en significado: zonas, patrones, cercanía y comportamiento.'
		},
		{
			title: 'Inteligencia de riesgo',
			desc: 'Detectamos anomalías, zonas críticas y señales relevantes antes de que sea tarde.'
		},
		{
			title: 'Red resiliente',
			desc: 'Infraestructura IoT de largo alcance para escenarios donde la conectividad tradicional no basta.'
		},
		{
			title: 'Modelos predictivos',
			desc: 'Anticipamos eventos y transformamos comportamiento en decisiones accionables.'
		}
	];

	function onFuturoVideoEnded() {
		if (!futuroVideo) return;
		futuroVideo.pause();
		// 1. Fade a oscuro en 800ms
		videoFadeState = 'out';
		setTimeout(() => {
			if (!futuroVideo) return;
			// 2. Mantener oscuro 2s y rebobinar
			futuroVideo.currentTime = 0;
			setTimeout(() => {
				if (!futuroVideo) return;
				// 3. Fade-in rápido en 400ms
				videoFadeState = 'in';
				futuroVideo.play().catch(() => {});
				setTimeout(() => {
					videoFadeState = '';
				}, 400);
			}, 2000);
		}, 800);
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

		// Futuro Video & Text Rotation
		if (futuroVideo) {
			futuroVideo.play().catch(() => {});
		}
		futuroTextInterval = setInterval(() => {
			exitingTextIndex = currentTextIndex;
			setTimeout(() => {
				exitingTextIndex = -1;
			}, 400);
			currentTextIndex = (currentTextIndex + 1) % futuroTextos.length;
			futuroProgressKey += 1;
		}, 5000);

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
			if (futuroTextInterval) clearInterval(futuroTextInterval);
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

	<!-- Logo estático — solo visible en móvil -->
	<div class="hero-mobile-logo" aria-label="Geminis Labs">
		<img src="/img/geminis-labs-logo-short.png" alt="Geminis Labs" class="hero-mobile-logo-img" />
		<span class="hero-mobile-logo-text">GEMINIS LABS</span>
	</div>

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
					preload="none"
				></video>
				<span class="lab-title-scrim" aria-hidden="true"></span>
				<h2 class="landing-section-title lab-title">Tecnología al servicio de la humanidad</h2>
			</div>
		</div>
		<div class="lab-center">
			<img
				src="/img/foco-no-bg.webp"
				alt="Foco con tecnología y naturaleza integradas"
				class="lab-bulb"
				loading="lazy"
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
						poster="/img/technology-man.webp"
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

	<div class="nx-card-shell" use:_reveal>
		<article
			class="nx-card"
			data-product={activeProduct}
			on:mousemove={onNxMove}
			on:mouseleave={onNxLeave}
		>
			<div class="nx-bg" aria-hidden="true"></div>
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
									<li class="nx-chip">Notificaciones</li>
									<li class="nx-chip">Panel web + App móvil</li>
									<li class="nx-chip">API para integradores</li>
								</ul>
							</div>
							<div class="nx-list-col">
								<h3 class="nx-list-title">Casos de uso</h3>
								<ul class="nx-chips">
									<li class="nx-chip nx-chip--case">Protección vehicular</li>
									<li class="nx-chip nx-chip--case">Rastreo familiar</li>
									<li class="nx-chip nx-chip--case">Control de flotillas</li>
									<li class="nx-chip nx-chip--case">Recuperación ante robo</li>
									<li class="nx-chip nx-chip--case">Seguridad en campo</li>
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
									<li class="nx-chip">Soporte para múltiples operadores</li>
									<li class="nx-chip">Integración con plataformas IoT</li>
									<li class="nx-chip">Procesamiento por lotes</li>
								</ul>
							</div>
							<div class="nx-list-col">
								<h3 class="nx-list-title">Casos de uso</h3>
								<ul class="nx-chips">
									<li class="nx-chip nx-chip--case">Localización sin GPS</li>
									<li class="nx-chip nx-chip--case">Validación de eventos IoT</li>
									<li class="nx-chip nx-chip--case">Enriquecimiento de telemetría</li>
									<li class="nx-chip nx-chip--case">Seguridad vehicular</li>
									<li class="nx-chip nx-chip--case">Sistemas antifraude</li>
									<li class="nx-chip nx-chip--case">Integración con ERPs o CRMs</li>
								</ul>
							</div>
						</div>

						<a class="nx-cta" href="https://orion.geminislabs.com/">
							Explorar Orion <span class="nx-cta-arrow" aria-hidden="true">→</span>
						</a>
					</div>

					<div class="nx-stage" aria-hidden="true">
						<span class="nx-halo"></span>
						<a
							href="https://orion.geminislabs.com/"
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
	</div>
</section>

<!-- Sección ¿Por qué existimos? -->
<section id="existimos" class="existimos-section">
	<div class="existimos-inner">
		<h2 class="existimos-title">¿Por qué existimos?</h2>

		<p class="existimos-text existimos-text-1">
			Porque el mundo genera más señales de las que las personas pueden interpretar.
		</p>

		<div class="existimos-text-columns">
			<p class="existimos-text existimos-text-2">
				Datos, ubicaciones, eventos, movimiento, riesgo y comportamiento ocurren todo el tiempo,
				pero rara vez llegan con suficiente contexto para tomar buenas decisiones.
			</p>

			<p class="existimos-text existimos-text-3">
				<strong>Geminis Labs existe</strong> para transformar esas señales en conocimiento útil: tecnología
				que ayuda a comprender mejor el entorno, proteger lo que importa y actuar con mayor claridad.
			</p>
		</div>

		<div class="existimos-layout">
			<div class="existimos-image-side">
				<img
					src="/img/existimos-white-2.webp"
					alt="Visión de Geminis Labs: Comprender, Proteger, Actuar"
					class="existimos-image"
					loading="lazy"
				/>
			</div>

			<div class="existimos-concepts-side">
				<div class="concept-item">
					<div class="concept-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="1" />
							<path
								d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 0l4.24-4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08 0l4.24 4.24"
							/>
						</svg>
					</div>
					<h3>Comprender</h3>
					<p>Convertir datos dispersos en contexto.</p>
				</div>

				<div class="concept-item">
					<div class="concept-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
						</svg>
					</div>
					<h3>Proteger</h3>
					<p>Detectar señales relevantes antes de que sea tarde.</p>
				</div>

				<div class="concept-item">
					<div class="concept-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
						</svg>
					</div>
					<h3>Actuar</h3>
					<p>Convertir el contexto en decisiones claras.</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Sección El Futuro que Estamos Construyendo -->
<section id="futuro" class="futuro-section">
	<div class="futuro-bg" aria-hidden="true">
		<div class="futuro-orb futuro-orb-1"></div>
		<div class="futuro-orb futuro-orb-2"></div>
		<div class="futuro-orb futuro-orb-3"></div>
		<div class="futuro-noise"></div>
	</div>
	<div class="futuro-content">
		<!-- Video Container with all overlays -->
		<div class="futuro-video-container" use:_futuroReveal>
			<!-- Video (sin loop — manejamos el loop manualmente para el fade) -->
			<video
				bind:this={futuroVideo}
				class="futuro-video"
				muted
				playsinline
				preload="none"
				use:_lazyVideo={'/vid/futuro-mapa.mp4'}
				on:ended={onFuturoVideoEnded}
			></video>

			<!-- Dark Overlay Layer: vignette + gradients -->
			<div class="futuro-dark-overlay"></div>

			<!-- Cover image que aparece al terminar el video -->
			<div
				class="futuro-black-cover"
				style="opacity: {videoFadeState === 'out' ? 1 : 0}; transition: opacity {videoFadeState ===
				'out'
					? '0.8s ease-in'
					: '0.4s ease-out'};"
			>
				<img src="/img/future-bg-2.webp" alt="" class="futuro-cover-img" loading="lazy" />
			</div>

			<!-- Title Overlay (top-left) -->
			<div class="futuro-title-overlay">
				<h2 class="landing-section-title futuro-title">El Futuro que Estamos Construyendo</h2>
			</div>

			<!-- Sequential Text Panel (right, over video) -->
			<div class="futuro-text-panel">
				<!-- Counter -->
				<span class="futuro-counter"
					>{String(currentTextIndex + 1).padStart(2, '0')} / {String(futuroTextos.length).padStart(
						2,
						'0'
					)}</span
				>

				<!-- Rotating text -->
				<div class="futuro-text-content">
					{#each futuroTextos as texto, i (i)}
						<div
							class="futuro-text-item"
							class:is-active={currentTextIndex === i}
							class:is-exiting={exitingTextIndex === i}
						>
							<h3 class="futuro-text-title">{texto.title}</h3>
							<p class="futuro-text-desc">{texto.desc}</p>
						</div>
					{/each}
				</div>

				<!-- Progress bar: 6 interactive segments -->
				<div class="futuro-progress-bar" aria-label="Progreso de contenido">
					{#each futuroTextos as _, i (i)}
						<button
							class="futuro-progress-seg"
							class:is-active={currentTextIndex === i}
							on:click={() => {
								currentTextIndex = i;
								futuroProgressKey += 1;
							}}
							aria-label="Ir al elemento {i + 1}"
						>
							{#if currentTextIndex === i}
								<span class="futuro-progress-fill" key={futuroProgressKey}></span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Sección Contacto -->
<section id="contacto" class="contact-section">
	<!-- Fondo imagen flujos de luz (overlay sutil) -->
	<div class="contact-bg" aria-hidden="true"></div>
	<!-- Orb ambiental cyan -->
	<div class="contact-orb" aria-hidden="true"></div>
	<!-- Scan-line decorativa -->
	<div class="contact-scan-line" aria-hidden="true"></div>

	<div class="container">
		<div class="contact-header">
			<span class="contact-eyebrow">// INICIA UNA CONVERSACIÓN</span>
			<h2 class="landing-section-title contact-heading">
				De la señal a la decisión<br />— empieza aquí
			</h2>
			<p class="contact-intro">
				Cuéntanos tu proyecto. Nuestro equipo responde en menos de 24 horas.
			</p>
		</div>

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
					<p>+52 442 46 77 127</p>
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
						<a
							href="https://www.instagram.com/geminislabs_official/"
							class="social-link"
							aria-label="Síguenos en Instagram"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
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

				<div class="form-row">
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
					<button type="submit" class="btn-contact-submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<svg
								class="spin-icon"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"
							>
								<path
									d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
								/>
							</svg>
							Enviando...
						{:else}
							Iniciar conversación
							<span class="btn-arrow" aria-hidden="true">→</span>
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
		line-height: 1.4;
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
			min-height: auto;
			padding: 2rem 1.5rem;
			border-radius: 14px;
			background: rgba(0, 166, 192, 0.06);
			border: 1px solid rgba(0, 166, 192, 0.15);
		}
		.lab-title-video,
		.lab-title-scrim {
			display: none;
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
		background: #eceff2; /* blanco menos brillante */
		position: relative;
		overflow: hidden;
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
		line-height: 1.4;
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
		line-height: 1.4;
		color: #0f172a;
	}
	.tc-message strong {
		color: #0883a0;
		font-weight: 700;
	}

	/* --- scroll-reveal (solo opacity/transform) ---
	   La clase .tc-reveal se aplica imperativamente vía JS (use:_reveal),
	   por eso se marca :global para que el compilador no la considere sin uso. */

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
		.tc-message {
			margin-top: 2rem;
			font-size: clamp(1.15rem, 5vw, 1.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
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
			background: url('/img/technology-man.webp') center / cover no-repeat;
			z-index: 1;
		}
	}

	/* ===== BTN-PRODUCT-CTA ===== */

	/* ===== CAPABILITIES SECTION ===== */

	/* ===== BUSINESS MODELS SECTION ===== */

	/* ===== DIFFERENTIATORS (Quiénes Somos) ===== */

	/* ===== EXISTIMOS SECTION ===== */
	.existimos-section {
		padding: 6rem 0;
		background: linear-gradient(180deg, #eceff2 0%, #f5f7f9 100%);
		position: relative;
	}

	.existimos-inner {
		max-width: 1380px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.existimos-title {
		font-size: 2.5rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 3rem;
		text-align: center;
		letter-spacing: -0.01em;
		line-height: 1.3;
	}

	.existimos-text {
		font-size: 1.125rem;
		color: #4a4a4a;
		line-height: 1.7;
		font-weight: 400;
	}

	.existimos-text-1 {
		font-size: 1.5rem;
		font-weight: 500;
		color: #2a2a2a;
		margin: 0 0 3.5rem;
		letter-spacing: -0.01em;
		text-align: center;
		max-width: 100%;
		padding: 0 2rem;
	}

	.existimos-text-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		margin: 0 0 4rem;
		max-width: 1100px;
		margin-left: auto;
		margin-right: auto;
		padding: 0 2rem;
	}

	.existimos-text-2,
	.existimos-text-3 {
		text-align: left;
		max-width: 100%;
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.75;
	}

	.existimos-text-2 {
		color: #4a4a4a;
	}

	.existimos-text-3 {
		color: #4a4a4a;
	}

	.existimos-text-3 strong {
		color: #1a1a1a;
		font-weight: 600;
		background: linear-gradient(135deg, #007a5c 0%, #005a47 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.existimos-layout {
		position: relative;
		display: grid;
		grid-template-columns: 1.4fr 0.85fr;
		gap: 2.5rem;
		align-items: stretch;
		min-height: auto;
		overflow: visible;
	}

	.existimos-image-side {
		position: relative;
		border-radius: 12px;
		box-shadow: 0 12px 32px rgba(0, 168, 120, 0.08);
		overflow: hidden;
		transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.existimos-image-side::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 12px;
		background:
			radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
			radial-gradient(circle at 85% 85%, rgba(0, 168, 120, 0.08) 0%, transparent 60%);
		pointer-events: none;
		z-index: 2;
		transition: all 500ms ease;
	}

	.existimos-image-side:hover::after {
		background:
			radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
			radial-gradient(circle at 85% 85%, rgba(0, 168, 120, 0.12) 0%, transparent 60%);
	}

	.existimos-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		border-radius: 12px;
		position: relative;
		z-index: 1;
	}

	.existimos-concepts-side {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: 0.75rem;
		position: relative;
		z-index: 10;
		padding-left: 0;
	}

	.concept-item {
		flex: 1;
		padding: 1.2rem 1.2rem 1.2rem 1.5rem;
		display: flex;
		flex-direction: column;
		justify-content: center;

		background: white;
		border-radius: 8px;
		border-left: 3px solid transparent;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

		transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.concept-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: #007a5c;
		border-radius: 8px 0 0 8px;
		opacity: 0;
		transition: opacity 300ms ease;
	}

	.concept-item:hover {
		box-shadow: 0 8px 24px rgba(0, 168, 120, 0.12);
		transform: translateY(-2px);
		background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(0, 168, 120, 0.02) 100%);
	}

	.concept-item:hover::before {
		opacity: 1;
	}

	.concept-icon {
		width: 38px;
		height: 38px;
		margin: 0 0 0.6rem 0;
		color: #007a5c;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.concept-icon svg {
		width: 100%;
		height: 100%;
		stroke-width: 2;
	}

	.concept-item:hover .concept-icon {
		transform: scale(1.08) rotateZ(5deg);
		filter: drop-shadow(0 4px 12px rgba(0, 168, 120, 0.3));
	}

	.concept-item h3 {
		font-size: 1rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 0.4rem 0;
		letter-spacing: 0.01em;
		transition: color 300ms ease;
	}

	.concept-item:hover h3 {
		color: #007a5c;
	}

	.concept-item p {
		font-size: 0.85rem;
		color: #5a5a5a;
		line-height: 1.4;
		margin: 0;
		font-weight: 400;
		transition: color 300ms ease;
	}

	.concept-item:hover p {
		color: #4a4a4a;
	}

	@media (max-width: 1024px) {
		.existimos-section {
			padding: 5rem 0;
		}

		.existimos-text-columns {
			grid-template-columns: 1fr;
			gap: 2rem;
			margin: 0 0 3rem;
		}

		.existimos-layout {
			grid-template-columns: 1fr;
			gap: 2rem;
			min-height: auto;
			overflow: visible;
		}

		.existimos-title {
			font-size: 2.5rem;
		}

		.existimos-text-1 {
			font-size: 1.35rem;
			margin-bottom: 2.5rem;
		}
	}

	@media (max-width: 768px) {
		.existimos-section {
			padding: 4rem 0;
		}

		.existimos-inner {
			padding: 0 1.5rem;
		}

		.existimos-title {
			font-size: 2rem;
			margin-bottom: 1.5rem;
		}

		.existimos-text-1 {
			font-size: 1.2rem;
			margin-bottom: 2rem;
			padding: 0 1rem;
		}

		.existimos-text-columns {
			padding: 0 1rem;
			gap: 2rem;
		}

		.existimos-text-2,
		.existimos-text-3 {
			font-size: 0.95rem;
		}

		.existimos-layout {
			min-height: auto;
		}

		.concept-item {
			padding: 1.5rem 1.5rem 1.5rem 2rem;
		}

		.concept-item h3 {
			font-size: 1.05rem;
		}

		.concept-item p {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 640px) {
		.existimos-section {
			padding: 3.5rem 0;
		}

		.existimos-inner {
			padding: 0 1rem;
		}

		.existimos-title {
			font-size: 1.75rem;
			margin-bottom: 1rem;
		}

		.existimos-text-1 {
			font-size: 1.05rem;
			margin-bottom: 1.5rem;
			padding: 0;
		}

		.existimos-text-columns {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 0;
		}

		.existimos-text-2,
		.existimos-text-3 {
			font-size: 0.9rem;
		}

		.existimos-layout {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.concept-item {
			padding: 1.25rem 1.25rem 1.25rem 1.75rem;
		}

		.concept-item h3 {
			font-size: 0.95rem;
		}

		.concept-item p {
			font-size: 0.85rem;
		}

		.concept-icon {
			width: 40px;
			height: 40px;
			margin-bottom: 0.75rem;
		}
	}

	/* ===== VISION SECTION ===== */

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

	/* Fondos de sección */
	:global(.about-section .container) {
		background: transparent !important;
	}
	:global(.contact-section) {
		padding: 8rem 0 6rem !important;
		background: transparent !important;
		position: relative !important;
		isolation: isolate !important;
		overflow: hidden !important;
	}

	/* ── Tarjetas Ecosystem ──────────────────────────── */

	/* ── Nexus sin video ─────────────────────────────── */

	/* ── Orion sin video planeta ─────────────────────── */

	/* ── Capacidades glass ───────────────────────────── */

	/* ── Modelos comerciales glass ───────────────────── */

	/* ── Future cards glass ──────────────────────────── */

	/* ── Quiénes somos ───────────────────────────────── */

	/* ── Visión glass container ──────────────────────── */

	/* ── Contacto glass ──────────────────────────────── */
	:global(.contact-form) {
		background: rgba(8, 13, 24, 0.55) !important;
		backdrop-filter: blur(28px) saturate(180%) !important;
		-webkit-backdrop-filter: blur(28px) saturate(180%) !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		border-top: 1px solid rgba(0, 166, 192, 0.4) !important;
		border-radius: 24px !important;
		padding: 2.5rem !important;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(0, 166, 192, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
		transition: box-shadow 0.3s ease !important;
	}
	:global(.contact-form:focus-within) {
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.45),
			0 0 40px rgba(0, 166, 192, 0.08),
			inset 0 1px 0 rgba(0, 166, 192, 0.12) !important;
	}
	:global(.contact-info) {
		background: rgba(8, 13, 24, 0.5) !important;
		backdrop-filter: blur(20px) !important;
		-webkit-backdrop-filter: blur(20px) !important;
		border: 1px solid rgba(255, 255, 255, 0.09) !important;
		border-top: 1px solid rgba(0, 166, 192, 0.3) !important;
		border-radius: 20px !important;
		padding: 2.5rem !important;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
	}

	/* ── Tech showcase (Quiénes Somos visual) ────────── */

	/* ── Overrides agresivos contra fondos oscuros del CSS global ── */
	:global(.about-section .container) {
		background: transparent !important;
	}
	:global(.contact-section) {
		background: transparent !important;
	}
	:global(.contact-section .container) {
		background: transparent !important;
	}

	/* ── Contacto: elementos decorativos y header ────── */
	.contact-bg {
		position: absolute;
		inset: 0;
		background-image: url('/img/contact-bg.webp');
		background-size: cover;
		background-position: center center;
		/* fixed: la imagen se ancla al viewport, no escala con la altura de la sección */
		background-attachment: fixed;
		opacity: 0.1;
		mix-blend-mode: screen;
		z-index: -1;
		pointer-events: none;
	}
	/* background-attachment: fixed no funciona en iOS — desactivar en mobile */
	@media (max-width: 768px) {
		.contact-bg {
			background-attachment: scroll;
			background-position: center 30%;
		}
	}
	.contact-orb {
		position: absolute;
		width: 600px;
		height: 600px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(0, 166, 192, 0.1) 0%, transparent 70%);
		filter: blur(80px);
		top: -150px;
		right: -100px;
		z-index: -1;
		pointer-events: none;
		animation: contact-orb-float 12s ease-in-out infinite alternate;
	}
	@keyframes contact-orb-float {
		from {
			transform: translate(0, 0) scale(1);
		}
		to {
			transform: translate(-40px, 50px) scale(1.1);
		}
	}
	@keyframes contact-scan-move {
		0% {
			transform: translateY(-100%);
			opacity: 0;
		}
		8% {
			opacity: 1;
		}
		92% {
			opacity: 1;
		}
		100% {
			transform: translateY(120vh);
			opacity: 0;
		}
	}
	.contact-scan-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(0, 166, 192, 0.4) 20%,
			rgba(0, 200, 230, 0.7) 50%,
			rgba(0, 166, 192, 0.4) 80%,
			transparent 100%
		);
		animation: contact-scan-move 10s linear infinite;
		pointer-events: none;
		z-index: 0;
	}
	/* Línea superior divisora */
	:global(.contact-section)::before {
		content: '';
		position: absolute;
		top: 0;
		left: 10%;
		right: 10%;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(0, 166, 192, 0.35) 30%,
			rgba(0, 166, 192, 0.6) 50%,
			rgba(0, 166, 192, 0.35) 70%,
			transparent 100%
		);
		z-index: 1;
	}
	.contact-header {
		text-align: center;
		margin-bottom: 4rem;
	}
	.contact-eyebrow {
		display: inline-block;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #00a6c0;
		margin-bottom: 1.25rem;
		border-left: 2px solid #00a6c0;
		padding-left: 0.75rem;
	}
	.contact-heading {
		font-size: clamp(2rem, 4vw, 3.2rem) !important;
		margin-bottom: 1rem !important;
	}
	.contact-intro {
		font-size: 1.05rem;
		color: rgba(216, 215, 204, 0.7);
		max-width: 480px;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* ── Fila doble nombre + correo ────────────────── */
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}

	/* ── Botón submit mejorado ─────────────────────── */
	.btn-contact-submit {
		width: 100%;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #00a6c0 0%, #0086a0 100%);
		color: #fff;
		font-family: inherit;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		position: relative;
		overflow: hidden;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		box-shadow:
			0 4px 20px rgba(0, 166, 192, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.18);
	}
	.btn-contact-submit:hover:not(:disabled) {
		background: linear-gradient(135deg, #00c0dd 0%, #00a6c0 100%);
		transform: translateY(-2px);
		box-shadow:
			0 8px 32px rgba(0, 166, 192, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.22);
	}
	.btn-contact-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	/* Shimmer sweep en hover */
	.btn-contact-submit::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 60%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.14) 50%,
			transparent 100%
		);
		transform: skewX(-20deg);
		transition: left 0.5s ease;
		pointer-events: none;
	}
	.btn-contact-submit:hover::after {
		left: 160%;
	}
	.btn-arrow {
		font-size: 1.1rem;
		transition: transform 0.2s ease;
	}
	.btn-contact-submit:hover .btn-arrow {
		transform: translateX(4px);
	}
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.spin-icon {
		width: 18px;
		height: 18px;
		animation: spin 1s linear infinite;
	}

	/* ── Inputs mejorados: focus con glow cyan ──────── */
	.form-group input:focus,
	.form-group textarea:focus {
		border-color: rgba(0, 166, 192, 0.6) !important;
		background: rgba(0, 166, 192, 0.06) !important;
		box-shadow:
			0 0 0 3px rgba(0, 166, 192, 0.1),
			0 4px 16px rgba(0, 166, 192, 0.12) !important;
	}
	.form-group input,
	.form-group textarea {
		background: rgba(8, 13, 24, 0.6) !important;
		caret-color: #00a6c0;
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
	}

	/* ── Hero partículas ─────────────────────────────────── */
	.hero-particle-section {
		position: relative;
		width: 100%;
		min-height: 100vh;
		overflow: hidden;
		background-image: url('/img/deepspace.webp');
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

	.hero-particle-buttons {
		display: flex;
		gap: 1.25rem;
		flex-wrap: wrap;
		justify-content: flex-end;
		width: 100%;
		margin-top: 0.25rem;
	}

	/* ── Hero móvil: solo logo centrado ──────────────────────── */
	.hero-mobile-logo {
		display: none; /* oculto en desktop */
	}

	@media (max-width: 600px) {
		/* Ocultar todas las capas animadas y el canvas de título */
		.hero-bg-video,
		.hero-vignette,
		.hero-video-fade,
		.hero-video-bottom-fade,
		.hero-scanlines,
		.hero-right-glow,
		.hero-text-overlay {
			display: none !important;
		}

		/* Logo centrado */
		.hero-mobile-logo {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 1rem;
			position: absolute;
			inset: 0;
			z-index: 10;
		}

		.hero-mobile-logo-img {
			width: 72px;
			height: 72px;
			object-fit: contain;
			filter: drop-shadow(0 0 18px rgba(0, 166, 192, 0.55));
		}

		.hero-mobile-logo-text {
			font-family: 'Audiowide', sans-serif;
			font-size: 1.35rem;
			letter-spacing: 0.12em;
			color: #ffffff;
			text-shadow: 0 0 24px rgba(0, 166, 192, 0.4);
		}
	}

	/* ── NEXUS PRODUCT SECTION ──────────────────────────────────── */
	.nexus-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(2rem, 4vw, 3.5rem);
		position: relative;
		overflow: hidden;
		background: #eceff2;
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

	/* Shell: centra la tarjeta + reveal de scroll */
	.nx-card-shell {
		width: min(2400px, 92vw);
		margin: 0 auto;
	}
	/* Tarjeta-marco (el fondo cambia según el producto) */
	.nx-card {
		position: relative;
		z-index: 1;
		overflow: hidden;
		width: 100%;
		min-height: min(86vh, 920px);
		padding: clamp(2rem, 4vw, 4.5rem);
		border: 1px solid rgba(244, 241, 232, 0.55);
		border-radius: clamp(20px, 2vw, 32px);
		transition:
			background 0.4s ease,
			box-shadow 0.4s ease;
	}
	/* Capa de fondo (parallax con el mouse) — sobredimensionada para no revelar bordes */
	.nx-bg {
		position: absolute;
		inset: -14%;
		z-index: 0;
		pointer-events: none;
		transition: transform 0.18s ease-out;
	}
	/* Tema Nexus (grafito-teal + verde) */
	.nx-card[data-product='nexus'] {
		background: #0f1518;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset 0 0 60px rgba(244, 241, 232, 0.04),
			0 30px 80px -40px rgba(0, 0, 0, 0.6),
			0 0 40px -10px rgba(63, 174, 58, 0.1);
	}
	.nx-card[data-product='nexus'] .nx-bg {
		background:
			linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)),
			url('/img/nexus-card-bg-2.webp') center / cover no-repeat,
			#0f1518;
		transform: translate(calc(var(--nx-mx, 0) * 70px), calc(var(--nx-my, 0) * 70px)) scale(1.08);
	}
	/* Tema Orion (negro mate + plata) */
	.nx-card[data-product='orion'] {
		background: #08090a;
		border-color: rgba(244, 241, 232, 0.28);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset 0 0 60px rgba(244, 241, 232, 0.03),
			0 30px 80px -40px rgba(0, 0, 0, 0.7),
			0 0 40px -10px rgba(214, 222, 230, 0.12);
	}
	.nx-card[data-product='orion'] .nx-bg {
		background:
			linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
			url('/img/orion-card-bg-2.webp') center / cover no-repeat,
			#08090a;
		transform: translate(calc(var(--nx-mx, 0) * 70px), calc(var(--nx-my, 0) * 70px)) scale(1.08);
	}
	/* Ruido (noise.png) sobre el fondo */
	.nx-card::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: inherit;
		pointer-events: none;
		background-image: url('/img/noise.webp');
		background-size: 180px 180px;
		opacity: 0.09;
		mix-blend-mode: overlay;
	}
	/* Pila de paneles: ambos en la misma celda → altura estable, crossfade */
	.nx-panels {
		position: relative;
		z-index: 3;
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
		filter: drop-shadow(0 0 14px rgba(228, 234, 240, 0.5))
			drop-shadow(0 14px 30px rgba(0, 0, 0, 0.5));
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
		position: relative;
		z-index: 2;
	}
	.nx-panel--orion .nx-content::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(
			to right,
			rgba(0, 0, 0, 0.32) 0%,
			rgba(0, 0, 0, 0.12) 45%,
			transparent 100%
		);
		border-radius: inherit;
		pointer-events: none;
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
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
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
		border-color: rgba(95, 209, 88, 0.8);
	}
	.nx-panel--orion .nx-chip:hover {
		border-color: rgba(205, 213, 221, 0.8);
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
		color: #ffffff;
		text-decoration: none;
		border-radius: 8px;
		padding: 0.7rem 1.4rem;
		background: #5fd158;
		border: 1px solid #5fd158;
		transition: all 0.25s ease;
		cursor: pointer;
	}
	.nx-cta:hover {
		background: #6fe668;
		border-color: #6fe668;
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(95, 209, 88, 0.28);
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
	.nx-panel--orion .nx-cta {
		background: #d7dde4;
		color: #08090a;
		border-color: #d7dde4;
	}
	.nx-panel--orion .nx-cta:hover {
		background: #ffffff;
		border-color: #ffffff;
		box-shadow: 0 8px 16px rgba(200, 210, 220, 0.28);
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
		width: 67%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(63, 174, 58, 0.18) 0%,
			rgba(0, 166, 192, 0.06) 40%,
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
		width: clamp(230px, 24vw, 420px);
		aspect-ratio: 1;
		object-fit: contain;
		cursor: pointer;
		filter: drop-shadow(0 0 14px rgba(63, 174, 58, 0.32))
			drop-shadow(0 14px 30px rgba(0, 0, 0, 0.45));
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
		.nx-bg {
			transform: none !important;
			transition: none;
		}
	}

	/* ── Futuro Section ─────────────────────────────────────── */
	.futuro-section {
		background: #0b1220;
		padding: 5rem 0 6rem;
		position: relative;
		overflow: hidden;
	}

	/* Background: orbs + noise */
	.futuro-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	.futuro-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(90px);
	}

	.futuro-orb-1 {
		width: 700px;
		height: 700px;
		top: -200px;
		left: -150px;
		background: radial-gradient(circle, rgba(0, 166, 192, 0.22) 0%, transparent 65%);
		animation: futuro-drift-1 22s ease-in-out infinite;
	}

	.futuro-orb-2 {
		width: 500px;
		height: 500px;
		bottom: -100px;
		right: -80px;
		background: radial-gradient(circle, rgba(33, 230, 140, 0.14) 0%, transparent 65%);
		animation: futuro-drift-2 28s ease-in-out infinite;
		animation-delay: -10s;
	}

	.futuro-orb-3 {
		width: 400px;
		height: 400px;
		top: 40%;
		left: 40%;
		background: radial-gradient(circle, rgba(59, 91, 219, 0.12) 0%, transparent 65%);
		animation: futuro-drift-1 34s ease-in-out infinite reverse;
		animation-delay: -18s;
	}

	@keyframes futuro-drift-1 {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(40px, -50px) scale(1.07);
		}
		66% {
			transform: translate(-30px, 40px) scale(0.93);
		}
	}

	@keyframes futuro-drift-2 {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		40% {
			transform: translate(-50px, 30px) scale(1.05);
		}
		70% {
			transform: translate(35px, -40px) scale(0.96);
		}
	}

	.futuro-noise {
		position: absolute;
		inset: 0;
		background-image: url('/img/noise.webp');
		background-repeat: repeat;
		background-size: 180px 180px;
		opacity: 0.045;
		mix-blend-mode: overlay;
	}

	.futuro-content {
		position: relative;
		z-index: 1;
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.futuro-video-container {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5);
		animation: futuroReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
	}

	@keyframes futuroReveal {
		from {
			opacity: 0;
			transform: translateY(24px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.futuro-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: opacity 1.5s ease;
	}

	.futuro-black-cover {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		overflow: hidden;
	}

	.futuro-cover-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		display: block;
	}

	/* Dark Overlay: vignette perimetral + gradiente derecho denso + tono de marca */
	.futuro-dark-overlay {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.55) 100%),
			linear-gradient(
				to left,
				rgba(0, 15, 25, 0.78) 0%,
				rgba(0, 15, 25, 0.12) 50%,
				transparent 65%
			),
			linear-gradient(135deg, rgba(0, 30, 40, 0.45) 0%, transparent 45%),
			linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, transparent 18%);
		pointer-events: none;
		z-index: 1;
		transition: background-color 1.5s ease;
	}

	/* Title Overlay – top-left */
	.futuro-title-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 55%;
		bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.5rem;
		padding: 3.5rem 3rem;
		z-index: 4;
		pointer-events: none;
	}

	.futuro-title {
		font-size: clamp(1.8rem, 3.5vw, 3rem);
		font-weight: 700;
		letter-spacing: -0.5px;
		margin: 0;
		color: #ffffff;
		text-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
		line-height: 1.15;
		border-left: 3px solid #00a6c0;
		padding-left: 1rem;
	}

	/* Text Panel – right side, over video */
	.futuro-text-panel {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 45%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 3rem;
		z-index: 4;
		border-left: 1px solid rgba(0, 166, 192, 0.2);
	}

	.futuro-counter {
		display: block;
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.4);
		margin-bottom: 1.25rem;
		font-variant-numeric: tabular-nums;
	}

	.futuro-text-content {
		position: relative;
		min-height: 160px;
	}

	.futuro-text-item {
		position: absolute;
		width: 100%;
		opacity: 0;
		transform: translateY(12px);
		transition:
			opacity 0.5s ease,
			transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
		pointer-events: none;
	}

	.futuro-text-item.is-active {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	.futuro-text-item.is-exiting {
		opacity: 0;
		transform: translateY(-12px);
		transition:
			opacity 0.35s ease,
			transform 0.35s ease-in;
	}

	.futuro-text-title {
		font-size: clamp(1.3rem, 2.2vw, 1.7rem);
		font-weight: 700;
		color: #21e68c;
		margin: 0 0 0.75rem 0;
		letter-spacing: 0.02em;
		text-shadow:
			0 0 20px rgba(33, 230, 140, 0.3),
			0 2px 8px rgba(0, 0, 0, 0.7);
	}

	.futuro-text-desc {
		font-size: clamp(0.88rem, 1.4vw, 0.98rem);
		color: rgba(240, 240, 240, 0.88);
		line-height: 1.65;
		margin: 0;
		text-shadow:
			0 1px 4px rgba(0, 0, 0, 0.8),
			0 0 12px rgba(0, 0, 0, 0.6);
	}

	/* Progress bar: 6 interactive segments */
	.futuro-progress-bar {
		display: flex;
		gap: 5px;
		margin-top: 1.75rem;
	}

	.futuro-progress-seg {
		flex: 1;
		height: 3px;
		background: rgba(255, 255, 255, 0.15);
		border: none;
		cursor: pointer;
		border-radius: 2px;
		padding: 0;
		position: relative;
		overflow: hidden;
		transition: background 0.3s;
	}

	.futuro-progress-seg:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.futuro-progress-fill {
		position: absolute;
		inset: 0;
		background: #00a6c0;
		transform-origin: left;
		animation: seg-fill 5s linear forwards;
	}

	@keyframes seg-fill {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	/* Tablet */
	@media (max-width: 1023px) {
		.futuro-title {
			font-size: 1.8rem;
		}

		.futuro-text-panel {
			width: 50%;
			padding: 2.5rem;
		}

		.futuro-text-title {
			font-size: 1.3rem;
		}

		.futuro-text-desc {
			font-size: 0.88rem;
		}
	}

	/* Mobile */
	@media (max-width: 639px) {
		/* Reset the global section { min-height: 100vh; align-items: center } */
		.futuro-section {
			min-height: auto !important;
			align-items: flex-start !important;
			padding: 2.5rem 0 3rem;
		}

		.futuro-content {
			padding: 0 1rem;
			width: 100%;
			flex-direction: column;
		}

		/* Ocultar solo video y overlays — el título se muestra sobre el panel */
		.futuro-video,
		.futuro-dark-overlay,
		.futuro-black-cover {
			display: none;
		}

		/* Título en flujo normal, encima del panel de texto */
		.futuro-title-overlay {
			display: block !important;
			position: static !important;
			width: 100% !important;
			padding: 0 0 1.25rem;
			background: none;
		}

		.futuro-title {
			font-size: 1.55rem !important;
			line-height: 1.25;
		}

		/* El contenedor colapsa sin video — lo quitamos del flow */
		.futuro-video-container {
			position: static !important;
			width: 100% !important;
			aspect-ratio: unset !important;
			height: auto !important;
			overflow: visible !important;
			box-shadow: none !important;
			border-radius: 0 !important;
		}

		.futuro-text-panel {
			position: relative !important;
			left: auto !important;
			right: auto !important;
			top: auto !important;
			bottom: auto !important;
			width: 100% !important;
			max-width: 100% !important;
			padding: 1.75rem 1.25rem;
			border-left: none;
			border-top: none;
			border-radius: 16px;
			margin-top: 0;
			background: rgba(10, 18, 30, 0.85);
			border: 1px solid rgba(0, 166, 192, 0.18);
			box-sizing: border-box !important;
		}

		.futuro-text-content {
			min-height: 120px;
		}

		.futuro-text-title {
			font-size: 1.15rem;
		}

		.futuro-text-desc {
			font-size: 0.85rem;
		}
	}
</style>
