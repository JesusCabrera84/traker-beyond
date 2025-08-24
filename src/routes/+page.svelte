<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Variables para efectos parallax
	let scrollY = 0;
	let innerHeight = 0;
	let innerWidth = 0;

	// Variables para los círculos animados de fondo
	let circles = [];

	onMount(() => {
		// Iniciar generación de círculos de fondo
		startCircleGeneration();
		
		// Smooth scrolling para los enlaces de navegación
		const links = document.querySelectorAll('a[href^="#"]');
		links.forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const target = document.querySelector(link.getAttribute('href'));
				if (target) {
					target.scrollIntoView({ behavior: 'smooth' });
				}
			});
		});
	});

	function startCircleGeneration() {
		const generateGroup = () => {
			const groupSize = Math.floor(Math.random() * 4) + 2; // 2-5 círculos
			
			for (let i = 0; i < groupSize; i++) {
				setTimeout(() => {
					const circle = createRandomCircle();
					circles = [...circles, circle];
					
					// Remover el círculo después de 12 segundos
					setTimeout(() => {
						circles = circles.filter(c => c.id !== circle.id);
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
			top: Math.random() * 90 + 5,  // 5% a 95%
			size: Math.random() * 120 + 20, // 20px a 140px
			color: colors[Math.floor(Math.random() * colors.length)]
		};
	}

	// Función para manejar el envío del formulario de contacto
	function handleContactSubmit(event) {
		event.preventDefault();
		// Aquí iría la lógica real de envío del formulario
		alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
		event.target.reset();
	}
</script>

<svelte:head>
	<title>Tracker Beyond - Monitoreo GPS Avanzado</title>
	<meta name="description" content="Soluciones avanzadas de monitoreo GPS para vehículos, localización celular y análisis de riesgos para aseguradoras" />
</svelte:head>

<svelte:window bind:scrollY bind:innerHeight bind:innerWidth />

<!-- Video de fondo -->
<video class="background-video" autoplay muted loop playsinline>
	<source src="/vid/map-back.mp4" type="video/mp4" />
	Tu navegador no soporta videos.
</video>

<!-- Overlay con degradado -->
<div class="gradient-overlay"></div>

<!-- Círculos animados de fondo -->
{#each circles as circle}
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
<nav class="navbar">
	<div class="nav-container">
		<div class="nav-logo">
			<h1>Tracker Beyond</h1>
		</div>
		<ul class="nav-menu">
			<li><a href="#inicio">Inicio</a></li>
			<li><a href="#servicios">Servicios</a></li>
			<li><a href="#nosotros">Nosotros</a></li>
			<li><a href="#contacto">Contacto</a></li>
		</ul>
	</div>
</nav>

<!-- Sección Hero -->
<section id="inicio" class="hero-section">
	<div class="hero-content" style="transform: translateY({scrollY * 0.5}px)">
		<h1 class="hero-title">El Futuro del Monitoreo GPS</h1>
		<p class="hero-subtitle">Tecnología avanzada para el seguimiento y análisis de vehículos en tiempo real</p>
		<div class="hero-buttons">
			<a href="#servicios" class="btn-primary">Descubre Nuestros Servicios</a>
			<a href="#contacto" class="btn-secondary">Contactar Ahora</a>
		</div>
	</div>
	<div class="hero-image" style="transform: translateY({scrollY * -0.3}px)">
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
		<h2 class="section-title">Nuestros Servicios</h2>
		<div class="services-grid">
			<div class="service-card">
				<div class="service-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
						<circle cx="12" cy="10" r="3"/>
					</svg>
				</div>
				<h3>Localización por Celdas Celulares</h3>
				<p>Tecnología avanzada de triangulación celular para ubicación precisa incluso sin GPS tradicional.</p>
			</div>
			
			<div class="service-card">
				<div class="service-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
					</svg>
				</div>
				<h3>Monitoreo de Vehículos</h3>
				<p>Seguimiento completo de flotas vehiculares con alertas inteligentes y reportes detallados.</p>
			</div>
			
			<div class="service-card">
				<div class="service-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<h3>Análisis de Riesgos para Aseguradoras</h3>
				<p>Evaluación predictiva de riesgos basada en patrones de conducción y datos históricos.</p>
			</div>
		</div>
	</div>
</section>

<!-- Sección Quiénes Somos -->
<section id="nosotros" class="about-section">
	<div class="container">
		<div class="about-content">
			<div class="about-text" style="transform: translateX({scrollY * -0.1}px)">
				<h2 class="section-title">Quiénes Somos</h2>
				<p>Tracker Beyond es una empresa líder en tecnología de monitoreo GPS, especializada en soluciones innovadoras para el seguimiento vehicular y análisis predictivo.</p>
				<p>Con años de experiencia en el sector, ofrecemos tecnología de vanguardia que combina precisión, confiabilidad y análisis inteligente para satisfacer las necesidades más exigentes del mercado.</p>
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
			<div class="about-image" style="transform: translateX({scrollY * 0.1}px)">
				<div class="image-placeholder">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
						<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
						<polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
						<line x1="12" y1="22.08" x2="12" y2="12"/>
					</svg>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Sección Contacto -->
<section id="contacto" class="contact-section">
	<div class="container">
		<h2 class="section-title">Contacto</h2>
		<div class="contact-content">
			<div class="contact-info">
				<h3>Información de Contacto</h3>
				<div class="contact-item">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
						<circle cx="12" cy="10" r="3"/>
					</svg>
					<p>Ciudad de México, México</p>
				</div>
				<div class="contact-item">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
					</svg>
					<p>+52 55 1234 5678</p>
				</div>
				<div class="contact-item">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
						<polyline points="22,6 12,13 2,6"/>
					</svg>
					<p>contacto@trackerbeyond.com</p>
				</div>
				
				<div class="social-links">
					<h4>Síguenos</h4>
					<div class="social-icons">
						<a href="#" class="social-link">
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
							</svg>
						</a>
						<a href="#" class="social-link">
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
							</svg>
						</a>
						<a href="#" class="social-link">
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
							</svg>
						</a>
					</div>
				</div>
			</div>
			
			<form class="contact-form" on:submit={handleContactSubmit}>
				<h3>Envíanos un Mensaje</h3>
				<div class="form-group">
					<input type="text" placeholder="Nombre completo" required />
				</div>
				<div class="form-group">
					<input type="email" placeholder="Correo electrónico" required />
				</div>
				<div class="form-group">
					<input type="tel" placeholder="Teléfono" />
				</div>
				<div class="form-group">
					<textarea placeholder="Mensaje" rows="5" required></textarea>
				</div>
				<button type="submit" class="btn-primary">Enviar Mensaje</button>
			</form>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="footer">
	<div class="container">
		<div class="footer-content">
			<div class="footer-section">
				<h3>Tracker Beyond</h3>
				<p>Tecnología avanzada de monitoreo GPS para un mundo conectado.</p>
			</div>
			<div class="footer-section">
				<h4>Servicios</h4>
				<ul>
					<li><a href="#servicios">Localización Celular</a></li>
					<li><a href="#servicios">Monitoreo Vehicular</a></li>
					<li><a href="#servicios">Análisis de Riesgos</a></li>
				</ul>
			</div>
			<div class="footer-section">
				<h4>Empresa</h4>
				<ul>
					<li><a href="#nosotros">Quiénes Somos</a></li>
					<li><a href="#contacto">Contacto</a></li>
					<li><a href="#">Privacidad</a></li>
				</ul>
			</div>
		</div>
		<div class="footer-bottom">
			<p>&copy; 2024 Tracker Beyond. Todos los derechos reservados.</p>
		</div>
	</div>
</footer>
  