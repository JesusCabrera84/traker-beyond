<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Navbar from '$lib/components/Navbar.svelte';
	import { buildApiUrl, API_CONFIG } from '$lib/config/api.js';

	// Variables para efectos parallax
	let scrollY = 0;
	let innerHeight = 0;

	// Variable para detectar si estamos en móvil
	let isMobile = false;

	// Variables para los círculos animados de fondo
	let circles = [];

	// Variables para el texto de hero
	let text = 'CONECTAMOS HUMANIDAD Y TECNOLOGÍA';
	let display = '';
	let index = 0;
	let showCursor = true;

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

		// Iniciar generación de círculos de fondo
		startCircleGeneration();

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

		const interval = setInterval(() => {
			if (index < text.length) {
				display += text[index];
				index++;
			} else {
				clearInterval(interval);
				// Espera un segundo y desvanece el cursor
				setTimeout(() => (showCursor = false), 2000);
			}
		}, 65);

		// Cleanup
		return () => {
			window.removeEventListener('resize', checkMobile);

			if (nexusCarouselInterval) clearInterval(nexusCarouselInterval);
			if (nexusFeaturesInterval) clearInterval(nexusFeaturesInterval);
			if (orionInterval) clearInterval(orionInterval);
		};
	});

	// Función para lazy loading de videos que no están en el viewport inicial
	function lazyVideo(node, src) {
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

	function startCircleGeneration() {
		const generateGroup = () => {
			const groupSize = Math.floor(Math.random() * 4) + 2; // 2-5 círculos

			for (let i = 0; i < groupSize; i++) {
				setTimeout(() => {
					const circle = createRandomCircle();
					circles = [...circles, circle];

					// Remover el círculo después de 12 segundos
					setTimeout(() => {
						circles = circles.filter((c) => c.id !== circle.id);
					}, 12000);
				}, i * 300); // Delay escalonado
			}
		};

		// Generar primer grupo inmediatamente
		generateGroup();

		// Generar grupos cada 5-8 segundos
		setInterval(generateGroup, Math.random() * 3000 + 5000);
	}

	function createRandomCircle() {
		const colors = [
			'radial-gradient(circle, transparent 0%, transparent 40%, rgba(34, 40, 49, 0.3) 100%)',
			'radial-gradient(circle, transparent 0%, transparent 40%, rgba(40, 59, 72, 0.4) 100%)',
			'radial-gradient(circle, transparent 0%, transparent 40%, rgba(0, 166, 192, 0.2) 100%)',
			'radial-gradient(circle, transparent 0%, transparent 40%, rgba(216, 215, 204, 0.1) 100%)'
		];

		return {
			id: Date.now() + Math.random(),
			left: Math.random() * 90 + 5, // 5% a 95%
			top: Math.random() * 90 + 5, // 5% a 95%
			size: Math.random() * 120 + 20, // 20px a 140px
			color: colors[Math.floor(Math.random() * colors.length)]
		};
	}

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

<!-- Bind scroll y window dimensions -->
<svelte:window bind:scrollY bind:innerHeight bind:innerWidth={innerWindowWidth} />

<svelte:head>
	<title>Geminis Labs</title>
	<meta name="description" content="Soluciones avanzadas" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet" />
</svelte:head>

<!-- Video de fondo -->
<video class="background-video" autoplay muted loop playsinline>
	<source src="/vid/map-back.mp4" type="video/mp4" />
	Tu navegador no soporta videos.
</video>

<!-- Overlay con degradado -->
<div class="gradient-overlay"></div>

<!-- Círculos animados de fondo -->
{#each circles as circle (circle.id)}
	<div
		class="animated-circle"
		style="
			left: {circle.left}%; 
			top: {circle.top}%; 
			width: {circle.size}px; 
			height: {circle.size}px;
			background: {circle.color};
		"
	></div>
{/each}

<!-- Navegación fija -->
<Navbar />

<!-- Sección Hero -->
<section id="inicio" class="hero-section">
	<div class="hero-content" style="transform: translateY({isMobile ? 0 : scrollY * 0.2}px)">
		<div class="hero-title-container">
			<h1 class="hero-title">
				{display}
				{#if showCursor}
					<span
						class="hero-title animate-[blink_2s_infinite]"
						style="transition: opacity 0.6s ease;"
					>
						_
					</span>
				{/if}
			</h1>
		</div>
		<p class="hero-subtitle">Creamos tecnología que potencia a la humanidad.</p>
		<div class="hero-buttons">
			<a href="#servicios" class="btn-primary">Descubre Nuestros Servicios</a>
			<a href="#contacto" class="btn-secondary">Contactar Ahora</a>
		</div>
	</div>
	<div class="hero-image" style="transform: translateY({isMobile ? 0 : scrollY * -0.1}px)">
		<div class="floating-card">
			<div class="card-content">
				<h3>Monitoreo 24/7</h3>
				<p>Seguimiento en tiempo real</p>
			</div>
		</div>
	</div>
</section>

<!-- Sección Servicios -->
<section id="servicios" class="services-section">
	<div class="container">
		<h2 class="landing-section-title">Nuestros Servicios</h2>
		<div class="section-description">
			<h3>Soluciones que evolucionan contigo</h3>
			<span>
				En Geminis-Labs desarrollamos tecnología para el monitoreo inteligente de vehículos,
				diseñada para ofrecer precisión, control y tranquilidad. Nuestro ecosistema combina hardware
				avanzado, aplicaciones web y móviles, y un sistema de alertas que te mantiene siempre
				conectado con lo que importa. Cada dispositivo, cada señal y cada dato nos ayudan a
				construir una red más inteligente, preparada para anticipar riesgos y ofrecer información en
				tiempo real.
			</span>
		</div>
		<div class="services-grid">
			<div class="service-card">
				<div class="service-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path
							d="M21.5679 11.223C21.7255 11.5066 21.8042 11.6484 21.8351 11.7985C21.8625 11.9315 21.8625 12.0685 21.8351 12.2015C21.8042 12.3516 21.7255 12.4934 21.5679 12.777L17.4568 20.177C17.2904 20.4766 17.2072 20.6263 17.0889 20.7354C16.9842 20.8318 16.8601 20.9049 16.7249 20.9495C16.5721 21 16.4008 21 16.0582 21H7.94104C7.5984 21 7.42708 21 7.27428 20.9495C7.1391 20.9049 7.01502 20.8318 6.91033 20.7354C6.79199 20.6263 6.70879 20.4766 6.54239 20.177L2.43128 12.777C2.27372 12.4934 2.19494 12.3516 2.16406 12.2015C2.13672 12.0685 2.13672 11.9315 2.16406 11.7985C2.19494 11.6484 2.27372 11.5066 2.43128 11.223L6.54239 3.82297C6.70879 3.52345 6.79199 3.37369 6.91033 3.26463C7.01502 3.16816 7.1391 3.09515 7.27428 3.05048C7.42708 3 7.5984 3 7.94104 3L16.0582 3C16.4008 3 16.5721 3 16.7249 3.05049C16.8601 3.09515 16.9842 3.16816 17.0889 3.26463C17.2072 3.37369 17.2904 3.52345 17.4568 3.82297L21.5679 11.223Z"
						></path>
						<circle cx="12" cy="12" r="2" />
					</svg>
				</div>
				<h3>Localización por Celdas Celulares</h3>
				<p>
					Tecnología avanzada de triangulación celular para ubicación precisa incluso sin GPS
					tradicional.
				</p>
			</div>

			<div class="service-card">
				<div class="service-icon">
					<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
						<path
							class="a"
							d="M7.9851,13.2308c-.0144.3113-.0471.6179-.0471.9328a19.9695,19.9695,0,0,0,32.124,15.87Z"
						></path>
						<line class="a" x1="23.8898" y1="21.5621" x2="25.2102" y2="19.2587"></line>
						<path
							class="a"
							d="M24.31,33.8306S24,37.9907,27.2,43.5H10.0706a89.0143,89.0143,0,0,0,5.0706-13.9688"
						></path>
						<path class="a" d="M39.03,15.6537a12.8128,12.8128,0,0,0-18.233-9.9"></path>
						<path class="a" d="M35.517,16.1106a9.269,9.269,0,0,0-13.19-7.1616"></path>
						<path class="a" d="M32.0042,16.5674a5.7249,5.7249,0,0,0-8.1466-4.4232"></path>
						<circle class="a" cx="25.7436" cy="18.3281" r="1.0765"></circle>
					</svg>
				</div>
				<h3>Monitoreo de 24/7</h3>
				<p>
					Seguimiento completo de flotas vehiculares con alertas inteligentes y reportes detallados.
				</p>
			</div>

			<div class="service-card">
				<div class="service-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
						<path
							d="M10.0932 10.7463C10.1827 10.6184 10.2571 10.5122 10.3233 10.4213C10.3793 10.5188 10.4418 10.6324 10.517 10.7692L12.2273 13.8788C12.3933 14.1809 12.5562 14.4771 12.7197 14.6921C12.8947 14.9222 13.2023 15.2374 13.6954 15.2467C14.1884 15.2559 14.5077 14.9525 14.6912 14.7292C14.8627 14.5205 15.0365 14.2305 15.2138 13.9349L15.2692 13.8426C15.49 13.4745 15.629 13.2445 15.752 13.0783C15.8654 12.9251 15.9309 12.8752 15.9798 12.8475C16.0286 12.8198 16.1052 12.7894 16.2948 12.771C16.5006 12.751 16.7694 12.7501 17.1986 12.7501H18C18.4142 12.7501 18.75 12.4144 18.75 12.0001C18.75 11.5859 18.4142 11.2501 18 11.2501L17.1662 11.2501C16.7791 11.2501 16.4367 11.2501 16.1497 11.278C15.8385 11.3082 15.5357 11.3752 15.2407 11.5422C14.9457 11.7092 14.7325 11.9345 14.5465 12.1857C14.3749 12.4175 14.1988 12.7111 13.9996 13.0431L13.9521 13.1223C13.8654 13.2668 13.793 13.3872 13.7284 13.4906C13.6676 13.3849 13.5999 13.2618 13.5186 13.1141L11.8092 10.006C11.6551 9.72563 11.5015 9.44629 11.3458 9.2415C11.1756 9.01778 10.8839 8.72197 10.4164 8.69673C9.94887 8.67149 9.62698 8.93417 9.43373 9.13826C9.25683 9.32509 9.0741 9.58628 8.89069 9.84844L8.58131 10.2904C8.35416 10.6149 8.21175 10.8171 8.08848 10.9629C7.975 11.0972 7.91193 11.1411 7.86538 11.1654C7.81882 11.1896 7.74663 11.2161 7.57159 11.2321C7.38144 11.2494 7.13413 11.2501 6.73803 11.2501H6C5.58579 11.2501 5.25 11.5859 5.25 12.0001C5.25 12.4144 5.58579 12.7501 6 12.7501L6.76812 12.7501C7.12509 12.7502 7.44153 12.7502 7.70801 12.7258C7.99707 12.6994 8.27904 12.6411 8.55809 12.4958C8.83714 12.3506 9.04661 12.153 9.234 11.9313C9.40676 11.727 9.58821 11.4677 9.79291 11.1753L10.0932 10.7463Z"
						></path>
						<path
							fill="currentColor"
							d="M22.75 9.26043C22.75 6.07929 21.2578 3.60642 18.9755 2.65694C16.8461 1.77108 14.2743 2.30955 12 4.43676C9.72568 2.30955 7.15386 1.77113 5.02447 2.65702C2.74218 3.60652 1.25 6.07939 1.25 9.26046C1.25 11.3863 2.37926 13.4794 3.7862 15.2825C5.20736 17.1039 6.99532 18.735 8.48775 19.952L8.62247 20.062C9.82232 21.0418 10.6895 21.75 12 21.75C13.3105 21.75 14.1777 21.0418 15.3775 20.062L15.5123 19.952C17.0047 18.735 18.7926 17.104 20.2138 15.2826C21.6207 13.4794 22.75 11.3863 22.75 9.26043ZM12.5491 6.00969C14.6472 3.75481 16.827 3.38777 18.3994 4.04187C19.9921 4.70447 21.25 6.53048 21.25 9.26043C21.25 10.8822 20.3695 12.6446 19.0312 14.3598C17.7071 16.0569 16.0142 17.6072 14.5643 18.7895C13.1713 19.9255 12.7216 20.25 12 20.25C11.2785 20.25 10.8287 19.9255 9.43571 18.7895C7.98585 17.6072 6.29293 16.0568 4.96881 14.3598C3.63045 12.6445 2.75 10.8821 2.75 9.26046C2.75 6.5306 4.0079 4.70457 5.60065 4.04194C7.17297 3.38781 9.35285 3.75482 11.4509 6.00969C11.5928 6.16218 11.7917 6.2488 12 6.2488C12.2083 6.2488 12.4072 6.16218 12.5491 6.00969Z"
						></path>
					</svg>
				</div>
				<h3>Panel Web y App M&oacute;vil</h3>
				<p>
					Control total desde cualquier dispositivo, con historial, zonas seguras y notificaciones
					instantáneas.
				</p>
			</div>

			<div class="service-card">
				<div class="service-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
						<line x1="8" y1="21" x2="16" y2="21"></line>
						<line x1="12" y1="17" x2="12" y2="21"></line>
						<polyline points="7 9 12 13 17 9"></polyline>
					</svg>
				</div>
				<h3>Consultoría Tecnológica</h3>
				<p>
					Asesoría especializada en comunicaciones, innovación en software y hardware. Diseñamos
					soluciones a medida que impulsan la transformación digital de tu organización.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Sección Productos -->
<section id="productos" class="products-section">
	<div class="container">
		<h2 class="landing-section-title">Nuestros Productos</h2>
		<div class="section-description">
			<h3>Innovación que impulsa tu operación</h3>
			<span>
				Descubre nuestras plataformas especializadas, diseñadas para transformar datos en decisiones
				estratégicas.
			</span>
		</div>

		<div class="products-container">
			<!-- Nexus Container Wrapper (Header + Content) -->
			<div class="nexus-full-container">
				<a
					href="/products/nexus"
					class="product-header product-header-nexus cursor-pointer"
					style="text-decoration: none; display: flex; flex-direction: column; align-items: center; margin-bottom: 3rem;"
				>
					<img
						src="/img/products/logo-nexus.png"
						alt="Logo Nexus"
						class="product-logo nexus-logo"
					/>
					<h3 class="product-title nexus-title">NEXUS</h3>
				</a>
				<!-- Nexus -->
				<div class="product-item nexus-item fade-in cursor-default">
					<video
						class="product-bg-video"
						muted
						playsinline
						loop
						use:lazyVideo={'/img/products/nexus/mapa.webm'}
					>
						<!-- El src se carga vía lazyVideo en background -->
					</video>
					<div class="product-bg-overlay"></div>

					<div class="product-content">
						<div class="product-info centered-info">
							<h4 class="nexus-slogan-title">Movilidad Inteligente .</h4>
							<p class="nexus-slogan-subtitle">
								Soluci&oacute;n para el hogar, negocio y transporte.
							</p>
						</div>
						<div class="product-visual nexus-visual">
							<div class="carousel-container">
								{#each nexusImages as image, i (image)}
									<div
										class="carousel-slide"
										class:active={i === currentNexusSlide}
										style="background-image: url('{image}')"
									></div>
								{/each}
							</div>

							<!-- Overlay Features -->
							<div class="overlay-features-container">
								{#key currentFeatureIndex}
									<div class="feature-block" in:fade={{ duration: 300 }}>
										<h5 class="feature-title">{nexusFeatures[currentFeatureIndex].title}</h5>
										<ul class="product-features overlay-features">
											{#each nexusFeatures[currentFeatureIndex].items as item (item)}
												<li>
													<svg
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
													>
														<polyline points="20 6 9 17 4 12"></polyline>
													</svg>
													{item}
												</li>
											{/each}
										</ul>
									</div>
								{/key}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Divider -->
			<div class="product-divider"></div>

			<!-- Orion -->
			<!-- Orion -->
			<div class="product-item orion-item fade-in" style="position: relative;">
				<div class="product-content">
					<!-- Left Side: Features List -->
					<div class="product-info orion-features-container">
						<div class="orion-features-grid">
							<!-- Header Removed as per user request -->

							<div class="orion-list-body">
								<!-- Divider Line and Scroll Indicator -->
								<div class="orion-divider-container">
									<div class="orion-divider-line"></div>
									<div
										class="orion-scroll-indicator"
										style="top: {currentOrionFeatureIndex *
											(100 / orionFeatures.length)}%; height: {100 / orionFeatures.length}%"
									></div>
								</div>

								<!-- Features Items -->
								<div class="orion-items-column">
									{#each orionFeatures as feature, i (feature.title)}
										<div
											class="orion-feature-row"
											class:feature-active={i === currentOrionFeatureIndex}
										>
											<div class="orion-feature-title">{feature.title}</div>
											<div class="orion-feature-desc">{feature.description}</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>

					<!-- Right Side: Visual (Logo + Name) -->
					<div class="product-visual orion-visual-branding">
						<video
							class="orion-bg-video"
							muted
							loop
							playsinline
							use:lazyVideo={'/img/products/orion/planeta-tierra.webm'}
						>
							<!-- El src se carga vía lazyVideo en background -->
						</video>
						<div class="orion-logo-content">
							<img
								src="/img/products/logo-orion.png"
								alt="Logo Orion"
								class="product-logo orion-big-logo"
							/>
							<h3 class="audiowide-regular orion-brand-name">ORION</h3>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Sección Quiénes Somos -->
<section id="nosotros" class="about-section">
	<div class="container">
		<div class="about-content">
			<div class="about-text">
				<h2 class="landing-section-title">Quiénes Somos</h2>
				<div class="section-description">
					<h3>Conectamos humanidad y tecnolog&iacute;a para crear el futuro</h3>
					<p>
						Geminis-Labs es una empresa mexicana enfocada en el desarrollo de tecnología
						geoespacial, análisis predictivo y sistemas de localización avanzada. Nacimos con una
						visión clara: usar la innovación para proteger y entender el movimiento, no solo
						rastrearlo.
					</p>
					<p>
						Creemos que la tecnología debe <b>amplificar lo humano</b>, y por eso diseñamos
						soluciones que combinan ingeniería, ciencia de datos y propósito. Cada avance que
						logramos busca acercarnos a un futuro donde la información no solo se procesa,
						<b>se comprende.</b>
					</p>
				</div>
				<div class="stats-grid">
					<div class="stat-item">
						<h3>10,000+</h3>
						<p>Vehículos Monitoreados</p>
					</div>
					<div class="stat-item">
						<h3>99.9%</h3>
						<p>Tiempo de Actividad</p>
					</div>
					<div class="stat-item">
						<h3>24/7</h3>
						<p>Soporte Técnico</p>
					</div>
				</div>
			</div>
			<div class="about-image">
				<div class="tech-showcase">
					<!-- Elementos decorativos de fondo -->
					<div class="tech-rings">
						<div class="tech-ring ring-1"></div>
						<div class="tech-ring ring-2"></div>
						<div class="tech-ring ring-3"></div>
					</div>

					<!-- Partículas flotantes -->
					<div class="floating-particles">
						<div class="particle particle-1"></div>
						<div class="particle particle-2"></div>
						<div class="particle particle-3"></div>
						<div class="particle particle-4"></div>
						<div class="particle particle-5"></div>
						<div class="particle particle-6"></div>
					</div>

					<!-- Logo central con efectos -->
					<div class="logo-container">
						<!-- Múltiples capas de resplandor -->
						<div class="logo-aura aura-1"></div>
						<div class="logo-aura aura-2"></div>
						<div class="logo-aura aura-3"></div>

						<!-- Anillos orbitales alrededor del logo -->
						<div class="orbital-rings">
							<div class="orbital-ring ring-inner"></div>
							<div class="orbital-ring ring-middle"></div>
							<div class="orbital-ring ring-outer"></div>
						</div>

						<!-- Puntos orbitales -->
						<div class="orbital-dots">
							<div class="orbital-dot dot-1"></div>
							<div class="orbital-dot dot-2"></div>
							<div class="orbital-dot dot-3"></div>
							<div class="orbital-dot dot-4"></div>
						</div>

						<!-- Logo flotante sin contenedor -->
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

<!-- seccion lo que viene-->
<section id="lo-que-hacemos" class="lo-que-hacemos-section">
	<div class="container">
		<h2 class="landing-section-title">Lo que viene</h2>
		<div class="section-description">
			<h3>Una red inteligente que evoluciona contigo</h3>
			<span>
				Nuestra visión va más allá del monitoreo. Estamos construyendo una red que aprende del
				entorno, que conecta vehículos, personas y territorios para crear un ecosistema de <b
					>inteligencia geoespacial</b
				> en constante crecimiento.
			</span>

			<div class="vision-statement">
				<h3 class="vision-line-1">
					En Geminis-Labs no solo <span class="highlight-text">seguimos</span> el movimiento.
				</h3>
				<h3 class="vision-line-2">
					Lo <span class="gradient-text">entendemos</span>, lo
					<span class="gradient-text">conocemos</span>
					y lo <span class="gradient-text">transformamos</span>.
				</h3>
			</div>
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
		</div>
	</div>
</section>

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

				<button type="submit" class="btn-primary" disabled={isSubmitting}>
					{#if isSubmitting}
						Enviando...
					{:else}
						Enviar Mensaje
					{/if}
				</button>

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

<!-- Footer -->
<footer class="footer">
	<div class="container">
		<div class="footer-content">
			<div class="footer-section">
				<h3>Geminis Labs</h3>
				<p>Tecnología avanzada de monitoreo GPS para un mundo conectado.</p>
			</div>
			<div class="footer-section">
				<h4>Servicios</h4>
				<ul>
					<li><a href="#servicios">Localización Celular</a></li>
					<li><a href="#servicios">Monitoreo Vehicular</a></li>
					<li><a href="#servicios">Consultoría Tecnológica</a></li>
					<li><a href="#servicios">Análisis de Riesgos</a></li>
				</ul>
			</div>
			<div class="footer-section">
				<h4>Empresa</h4>
				<ul>
					<li><a href="#nosotros">Quiénes Somos</a></li>
					<li><a href="#contacto">Contacto</a></li>
					<li><a href="/privacidad" aria-label="Política de Privacidad">Privacidad</a></li>
				</ul>
			</div>
		</div>
		<div class="footer-bottom">
			<p>&copy; 2025 Geminis Labs. Todos los derechos reservados.</p>
		</div>
	</div>
</footer>

<style>
	/* Estilos para el formulario de contacto */
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

	/* Responsive adjustments */
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

	/* Estilos para la sección de Productos */
	.products-section {
		padding: 6rem 0;
		position: relative;
		background: linear-gradient(to bottom, black 11%, #000028 34%, #000000 90%);
	}

	.products-container {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* Eliminados estilos de tabs/selector */

	.product-item {
		width: 100%;
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
		font-family: 'Outfit', sans-serif; /* Asumiendo que se usa esta fuente o similar */
		letter-spacing: -1px;
	}

	.nexus-title {
		font-size: 4.5rem;
		background-clip: text;
		color: #ffffff;
		filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))
			drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
		position: relative;
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
		/* Removed heavy black background - now transparent */
		position: relative;
		padding: 2rem;
		margin-top: 5rem; /* Improvement #1: More space from section title */
		margin-bottom: 5rem;
	}

	.nexus-item {
		position: relative;
		overflow: hidden;
		border-radius: 20px; /* Slightly smaller radius for inner content if needed, or 0 */
		/* Background moved to container */
	}

	.orion-item {
		min-height: auto; /* Allow natural height rather than forcing 100vh which might clip on smaller screens */
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 0; /* Reduced padding to help fit on screen better */
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
		padding-left: 2rem; /* Separación del borde izquierdo */
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

	/* Black strip backdrop removed */
	.centered-info::before {
		content: none;
	}

	.nexus-logo {
		width: 180px; /* Increased size */
		max-width: 100%;
		height: auto;
		filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5)); /* Add depth */
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
		width: 300px; /* Limit width for consistency */
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

		/* Visual enhancement */
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
		position: static; /* Let container handle positioning */
		transform: none;
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
		position: relative; /* Context for overlay */
	}

	.product-visual {
		flex: 1;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 20px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		aspect-ratio: 4/3; /* Taller aspect ratio (approx 50% taller than 16/10 which is 8/5) */
		min-height: 600px; /* Ensure sufficient height */
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
	}

	.nexus-visual {
		border: none;
		/* Fade curvo del lado izquierdo */
		-webkit-mask-image: radial-gradient(ellipse 100% 100% at 68% 50%, black 50%, transparent 70%);

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
		background-repeat: no-repeat;
		opacity: 0;
		transition: opacity 1s ease-in-out;
		z-index: 1;
		transform: scale(1); /* Base state matches end of animation */
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
	/* Estilos para Orion (Nuevo) */
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
		overflow: hidden; /* Ensure video stays within bounds */
	}

	/* Removed hover from container, moving to logo */

	.orion-bg-video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.3; /* Semi-transparent as requested */
		z-index: 0;
		mix-blend-mode: screen; /* Optional: helps blend better with dark background */
	}

	.orion-logo-content {
		position: relative;
		z-index: 1; /* Above video */
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.orion-big-logo {
		width: 180px; /* Tamaño grande */
		height: auto;
		filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4));
		margin-bottom: 1rem;
		cursor: pointer;
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			filter 0.3s ease;
	}

	.orion-big-logo:hover {
		transform: scale(1.1); /* Slightly larger scale for better effect */
		filter: drop-shadow(0 0 35px rgba(255, 255, 255, 0.8));
	}

	.orion-brand-name {
		font-size: 4rem; /* Grande */
		color: #ffffff;
		text-transform: uppercase;
		letter-spacing: 2px;
		text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
		margin: 0;
	}

	.orion-features-container {
		width: 100%;
		flex: 1.2; /* Darle un poco más de espacio al texto */
	}

	.orion-features-grid {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.orion-list-body {
		display: grid;
		grid-template-columns: 2px 1fr; /* La línea divisoria es absoluta, ajustamos el grid para el contenido */
		position: relative;
		/* Usamos un grid trick para alinear */
		grid-template-columns: 1fr 2px 2fr;
		gap: 2rem;
	}

	.orion-divider-container {
		grid-column: 2;
		grid-row: 1 / span 10; /* Abarca todas las filas */
		position: relative;
		width: 2px;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 1px;
	}

	.orion-scroll-indicator {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		width: 4px; /* Más grueso que la línea */
		background: #ffffff;
		border-radius: 4px;
		transition:
			top 0.5s ease-in-out,
			height 0.5s ease-in-out;
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
	}

	.orion-items-column {
		display: contents; /* Permite que los hijos de este div sean parte del grid padre (.orion-list-body) */
	}

	/* Ya que 'display: contents' elimina el contenedor visualmente, necesitamos iterar items que sean "features rows"
	   pero como queremos que Titulo quede en col 1 y Desc en col 3, mejor reestructuramos un poco el HTML o CSS.
	   
	   Mejor aproximación dada la estructura HTML actual:
	   .orion-feature-row contiene titulo y descripcion.
	   Haremos que .orion-feature-row sea un sub-grid o display flex que se alinee visualmente.
	   
	   PERO, el requerimiento es que la línea divisoria esté ENTRE sección y descripción.
	   Entonces la estructura visual debe ser: [SECCION] [LINEA] [DESCRIPCION]
	*/

	.orion-list-body {
		display: flex;
		flex-direction: row;
		position: relative;
		gap: 0; /* Espacio manejado por padding/width */
	}

	.orion-divider-container {
		width: 2px;
		background: rgba(255, 255, 255, 0.1);
		position: relative;
		margin: 0 2rem;
		flex-shrink: 0;
	}

	.orion-items-column {
		/* No se usa layout de columna, en realidad el body envuelve todo. 
		   Espera, mi HTML estructura:
		   Grid Header: [Span] [Div] [Span]
		   List Body: [Divider] [Items Column] -> Esto no alinea la linea EN MEDIO.
		   
		   Revisemos el HTML que propuse:
		   .orion-list-body
			  .orion-divider-container (linea)
			  .orion-items-column (filas)
				 .orion-feature-row (titulo, desc) 
				 
		   Esto pondría la linea a la izquierda de TODO. NO es lo pedido.
		   
		   CORRECCION EN CSS (hacky pero funciona sin cambiar HTML otra vez):
		   Vamos a posicionar la linea divider de forma absoluta en el centro relativo de los items.
		*/
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.orion-list-body {
		display: block; /* Reset */
		position: relative;
	}

	.orion-divider-container {
		position: absolute;
		left: 35%; /* Ajustar porcentaje según ancho de columna título */
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
		padding: 0.75rem 0; /* Reduced padding from 1rem to 0.75rem to fit all 7 features */
		opacity: 0.5;
		transition: all 0.5s ease;
		border-bottom: 1px solid rgba(255, 255, 255, 0.02);
	}

	.orion-feature-row:last-child {
		border-bottom: none;
	}

	.orion-feature-row.feature-active {
		opacity: 1;
		transform: scale(1.01); /* Reduced scale on active state to prevent layout jumps */
		background: rgba(255, 255, 255, 0.03); /* Sutil highlight fondo */
	}

	.orion-feature-title {
		width: 35%; /* Debe coincidir */
		padding-right: 1.5rem; /* Reduced padding to fit smaller screens */
		text-align: right;
		font-weight: 500;
		color: #d1d5db;
		transition:
			color 0.3s,
			font-weight 0.3s;
		font-size: 0.95rem; /* Slightly smaller font to fit screen */
	}

	.orion-feature-desc {
		flex: 1; /* Resto del espacio */
		padding-left: 1.5rem; /* Reduced padding to fit smaller screens */
		color: #9ca3af;
		font-weight: 300;
		transition:
			color 0.3s,
			font-weight 0.3s;
		font-size: 0.85rem; /* Smaller font to ensure all text fits on laptop screens */
		line-height: 1.4;
	}

	.feature-active .orion-feature-title {
		color: #ffffff;
		/* font-weight: 700; Caused layout shift */
		text-shadow:
			0 0 1px currentColor,
			0 0 1px currentColor; /* Bold simulation without shift */
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
	}

	.feature-active .orion-feature-desc {
		color: #e5e7eb;
		/* font-weight: 600; Caused layout shift */
		text-shadow:
			0 0 1px currentColor,
			0 0 0.5px currentColor; /* Bold simulation */
	}

	@media (max-width: 1024px) {
		.orion-divider-container {
			display: none; /* Ocultar linea en movil y tablets si no cabe */
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

		/* Fix horizontal overflow caused by min-height + aspect-ratio on product-visual */
		.product-visual {
			min-height: 300px;
			width: 100%;
			aspect-ratio: auto;
		}

		.nexus-visual {
			aspect-ratio: 1/1; /* Keep some square aspect for nexus */
		}
	}
</style>
