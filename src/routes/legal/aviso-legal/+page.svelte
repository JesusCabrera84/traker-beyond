<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import '../legal.css';

	let activeSection = $state('');

	const sections = [
		{ id: 'identidad', num: '01', title: 'Identidad del Operador' },
		{ id: 'naturaleza', num: '02', title: 'Naturaleza del Servicio' },
		{ id: 'limitaciones', num: '03', title: 'Limitaciones Técnicas' },
		{ id: 'emergencia', num: '04', title: 'No Servicio de Emergencia' },
		{ id: 'uso-legal', num: '05', title: 'Uso Legal del Monitoreo' },
		{ id: 'propiedad', num: '06', title: 'Propiedad Intelectual' },
		{ id: 'terceros', num: '07', title: 'Servicios de Terceros' },
		{ id: 'seguridad', num: '08', title: 'Seguridad' },
		{ id: 'modificaciones', num: '09', title: 'Modificaciones' },
		{ id: 'legislacion', num: '10', title: 'Legislación Aplicable' },
		{ id: 'contacto', num: '11', title: 'Contacto' }
	];

	onMount(() => {
		const sectionEls = document.querySelectorAll('.tos-section[id]');
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) activeSection = e.target.id;
				});
			},
			{ rootMargin: '-20% 0px -70% 0px' }
		);
		sectionEls.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>Aviso Legal — Geminis Labs</title>
	<meta
		name="description"
		content="Aviso Legal de Geminis Labs. Condiciones de acceso y uso de los sitios web, aplicaciones y plataformas digitales de Geminis Labs."
	/>
</svelte:head>

<div class="tos-page">
	<Navbar />

	<!-- Page header -->
	<header class="tos-hero">
		<div class="tos-hero-inner">
			<span class="tos-eyebrow">Legal</span>
			<h1 class="tos-h1">Aviso Legal</h1>
			<div class="tos-meta">
				<span class="tos-meta-item"
					>Última actualización: <span class="tos-placeholder">[FECHA]</span></span
				>
			</div>
		</div>
	</header>

	<!-- Body: TOC + Content -->
	<div class="tos-body">
		<!-- Sticky TOC -->
		<nav class="tos-toc" aria-label="Tabla de contenidos">
			<span class="tos-toc-label">Contenido</span>
			<ul class="tos-toc-list">
				{#each sections as s (s.id)}
					<li>
						<a href="#{s.id}" class:is-active={activeSection === s.id}>
							<span style="color: #94a3b8; margin-right: 0.4rem; font-size: 0.7rem;">{s.num}</span
							>{s.title}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- Content -->
		<main class="tos-content">
			<!-- Intro -->
			<div class="tos-intro">
				<p>
					Este Aviso Legal regula el acceso y uso del sitio web, aplicaciones, plataformas digitales
					y servicios tecnológicos operados por <strong
						><span class="tos-placeholder">[RAZÓN SOCIAL LEGAL]</span></strong
					>, comercialmente conocida como <strong>Geminis Labs</strong>.
				</p>
				<p>Esto incluye, sin limitarse a:</p>
				<ul>
					<li>Sitios web corporativos</li>
					<li>Aplicaciones móviles</li>
					<li>Plataformas web</li>
					<li>Nexus</li>
					<li>Orion</li>
					<li>APIs</li>
					<li>Dashboards</li>
					<li>Herramientas empresariales</li>
					<li>Servicios TaaS</li>
					<li>Integraciones TCP</li>
					<li>Integraciones MQTT</li>
					<li>Servicios tecnológicos relacionados</li>
				</ul>
				<div class="tos-accept">
					Al acceder o utilizar cualquiera de estos medios, aceptas este Aviso Legal en su
					totalidad.
				</div>
			</div>

			<!-- 01. Identidad del Operador -->
			<section class="tos-section" id="identidad">
				<div class="tos-section-badge">01</div>
				<h2>Identidad del Operador</h2>
				<p>Operador del servicio:</p>
				<div class="tos-contact-box">
					<p><strong><span class="tos-placeholder">[RAZÓN SOCIAL LEGAL]</span></strong></p>
					<p>Nombre comercial: <strong>Geminis Labs</strong></p>
					<p>Domicilio fiscal: <span class="tos-placeholder">[DOMICILIO FISCAL]</span></p>
					<p>
						Correo de contacto: <a href="mailto:contacto@geminislabs.com"
							>contacto@geminislabs.com</a
						>
					</p>
				</div>
			</section>

			<!-- 02. Naturaleza del Servicio -->
			<section class="tos-section" id="naturaleza">
				<div class="tos-section-badge">02</div>
				<h2>Naturaleza Informativa y Tecnológica del Servicio</h2>
				<p>
					Geminis Labs proporciona plataformas tecnológicas para monitoreo, visualización,
					telemetría, integración de dispositivos y análisis operativo.
				</p>
				<p>La información mostrada en nuestros Servicios tiene carácter informativo y operativo.</p>
				<p>Aunque procuramos precisión razonable, no garantizamos:</p>
				<ul>
					<li>Exactitud absoluta</li>
					<li>Disponibilidad ininterrumpida</li>
					<li>Actualización inmediata</li>
					<li>Ausencia de errores</li>
					<li>Continuidad permanente</li>
				</ul>
			</section>

			<!-- 03. Limitaciones Técnicas -->
			<section class="tos-section" id="limitaciones">
				<div class="tos-section-badge">03</div>
				<h2>Limitaciones Técnicas</h2>
				<p>
					El funcionamiento de los Servicios puede depender de factores fuera de nuestro control,
					incluyendo:
				</p>
				<ul>
					<li>Cobertura GPS</li>
					<li>Redes celulares</li>
					<li>Conectividad a internet</li>
					<li>Hardware de terceros</li>
					<li>Firmware</li>
					<li>Dispositivos IoT</li>
					<li>Infraestructura cloud</li>
					<li>Servicios de mapas</li>
					<li>Proveedores externos</li>
					<li>Condiciones ambientales</li>
					<li>Interferencia urbana</li>
					<li>Errores de integración</li>
				</ul>
				<p>
					Por ello, la información mostrada puede presentar retrasos, interrupciones o
					inconsistencias inherentes a la naturaleza de la tecnología de monitoreo.
				</p>
			</section>

			<!-- 04. No Servicio de Emergencia -->
			<section class="tos-section" id="emergencia">
				<div class="tos-section-badge">04</div>
				<h2>No Servicio de Emergencia</h2>

				<div class="tos-callout">
					<svg class="tos-callout-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
							clip-rule="evenodd"
						/>
					</svg>
					<div class="tos-callout-body">
						<p class="tos-callout-title">Geminis Labs NO presta servicios de emergencia</p>
						<p class="tos-callout-text">
							Nuestras plataformas son herramientas tecnológicas de apoyo y no deben utilizarse como
							sustituto de autoridades u organismos de emergencia.
						</p>
						<p class="tos-callout-text">
							Los servicios que <strong>no prestamos</strong> incluyen:
						</p>
						<ul class="tos-callout-text">
							<li>Seguridad pública</li>
							<li>Atención de emergencias</li>
							<li>Monitoreo humano</li>
							<li>Despacho de incidentes</li>
							<li>Respuesta policial</li>
							<li>Aseguramiento de activos</li>
							<li>Recuperación garantizada de vehículos o bienes</li>
						</ul>
					</div>
				</div>

				<p>Nuestros Servicios no deben utilizarse como sustituto de:</p>
				<ul>
					<li>Autoridades competentes</li>
					<li>Protocolos internos de seguridad</li>
					<li>Servicios de emergencia</li>
					<li>Seguros</li>
					<li>Vigilancia física</li>
				</ul>
			</section>

			<!-- 05. Uso Legal del Monitoreo -->
			<section class="tos-section" id="uso-legal">
				<div class="tos-section-badge">05</div>
				<h2>Uso Legal del Monitoreo</h2>
				<p>
					El usuario es responsable de utilizar los Servicios conforme a la legislación aplicable.
				</p>
				<p>Geminis Labs <strong>no autoriza</strong> el uso de sus plataformas para:</p>
				<ul>
					<li>Espionaje</li>
					<li>Vigilancia ilegal</li>
					<li>Acoso</li>
					<li>Monitoreo sin autorización</li>
					<li>Invasión de privacidad</li>
					<li>Actividades ilícitas</li>
				</ul>
				<p>
					El usuario es responsable de contar con las autorizaciones legales necesarias para
					monitorear activos, dispositivos o personas cuando así lo requiera la ley aplicable.
				</p>
			</section>

			<!-- 06. Propiedad Intelectual -->
			<section class="tos-section" id="propiedad">
				<div class="tos-section-badge">06</div>
				<h2>Propiedad Intelectual</h2>
				<p>
					Todo contenido, software, diseño, documentación, arquitectura, interfaces, marcas y
					materiales relacionados con Geminis Labs son propiedad de Geminis Labs o de sus
					licenciantes. Esto incluye, sin limitarse a:
				</p>
				<ul>
					<li>Logotipos y marcas comerciales</li>
					<li>Interfaces y dashboards</li>
					<li>Código propietario</li>
					<li>APIs</li>
					<li>Documentación técnica</li>
					<li>Elementos visuales</li>
					<li>Materiales comerciales</li>
				</ul>
				<p>
					Queda prohibida su reproducción, distribución o explotación no autorizada por cualquier
					medio o formato.
				</p>
			</section>

			<!-- 07. Servicios de Terceros -->
			<section class="tos-section" id="terceros">
				<div class="tos-section-badge">07</div>
				<h2>Enlaces y Servicios de Terceros</h2>
				<p>
					Nuestros Servicios pueden integrar o enlazar herramientas de terceros. Geminis Labs no
					controla ni garantiza el contenido, disponibilidad o políticas de dichos terceros.
				</p>
				<p>
					El uso de servicios externos puede quedar sujeto a términos y condiciones independientes
					de los respectivos proveedores.
				</p>
			</section>

			<!-- 08. Seguridad -->
			<section class="tos-section" id="seguridad">
				<div class="tos-section-badge">08</div>
				<h2>Seguridad</h2>
				<p>
					Aunque implementamos medidas razonables de seguridad técnica y organizacional, ningún
					sistema es completamente inmune a incidentes técnicos o cibernéticos.
				</p>
				<p>
					El usuario reconoce este riesgo inherente al uso de plataformas digitales conectadas a
					internet.
				</p>
			</section>

			<!-- 09. Modificaciones -->
			<section class="tos-section" id="modificaciones">
				<div class="tos-section-badge">09</div>
				<h2>Modificaciones</h2>
				<p>
					Geminis Labs podrá modificar este Aviso Legal en cualquier momento. La versión publicada
					en el sitio web será la versión vigente y aplicable.
				</p>
				<p>
					El uso continuado de los Servicios tras la publicación de modificaciones implica la
					aceptación de las mismas.
				</p>
			</section>

			<!-- 10. Legislación Aplicable -->
			<section class="tos-section" id="legislacion">
				<div class="tos-section-badge">10</div>
				<h2>Legislación Aplicable</h2>
				<p>
					Este Aviso Legal se regirá por las leyes de los <strong>Estados Unidos Mexicanos</strong>.
				</p>
				<p>Cualquier controversia será sometida a los tribunales competentes de:</p>
				<div class="tos-contact-box">
					<p><strong><span class="tos-placeholder">[CIUDAD / ESTADO EN MÉXICO]</span></strong></p>
					<p style="font-size: 0.875rem; color: #94a3b8; margin-top: 0.25rem;">
						Salvo disposición legal distinta.
					</p>
				</div>
			</section>

			<!-- 11. Contacto -->
			<section class="tos-section" id="contacto">
				<div class="tos-section-badge">11</div>
				<h2>Contacto</h2>
				<p>Para consultas legales relacionadas con este Aviso Legal:</p>
				<div class="tos-contact-box">
					<p>Correo: <a href="mailto:contacto@geminislabs.com">contacto@geminislabs.com</a></p>
				</div>
			</section>
		</main>
	</div>

	<Footer />
</div>
