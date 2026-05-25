<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import '../legal.css';

	let activeSection = $state('');

	const sections = [
		{ id: 'informacion', num: '01', title: 'Información que Recopilamos' },
		{ id: 'uso-info', num: '02', title: 'Cómo Utilizamos la Información' },
		{ id: 'geolocalizacion', num: '03', title: 'Geolocalización y Datos Sensibles' },
		{ id: 'comparticion', num: '04', title: 'Compartición de Información' },
		{ id: 'no-venta', num: '05', title: 'No Vendemos Datos Personales' },
		{ id: 'conservacion', num: '06', title: 'Conservación de Datos' },
		{ id: 'seguridad', num: '07', title: 'Seguridad' },
		{ id: 'terceros', num: '08', title: 'Servicios de Terceros' },
		{ id: 'transferencias', num: '09', title: 'Transferencias Internacionales' },
		{ id: 'menores', num: '10', title: 'Menores de Edad' },
		{ id: 'derechos', num: '11', title: 'Derechos del Usuario' },
		{ id: 'uso-ilegal', num: '12', title: 'Uso Ilegal o No Autorizado' },
		{ id: 'cookies', num: '13', title: 'Cookies y Preferencias' },
		{ id: 'cambios', num: '14', title: 'Cambios a esta Política' },
		{ id: 'contacto', num: '15', title: 'Contacto' },
		{ id: 'responsable', num: '16', title: 'Responsable' }
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
	<title>Política de Privacidad — Geminis Labs</title>
	<meta
		name="description"
		content="Política de Privacidad de Geminis Labs. Cómo recopilamos, usamos y protegemos tu información en Nexus, Orion y demás servicios tecnológicos."
	/>
</svelte:head>

<div class="tos-page">
	<Navbar />

	<header class="tos-hero">
		<div class="tos-hero-inner">
			<span class="tos-eyebrow">Legal</span>
			<h1 class="tos-h1">Política de Privacidad</h1>
			<div class="tos-meta">
				<span class="tos-meta-item"
					>Última actualización: <span class="tos-placeholder">[FECHA]</span></span
				>
			</div>
		</div>
	</header>

	<div class="tos-body">
		<!-- Sticky TOC -->
		<nav class="tos-toc" aria-label="Tabla de contenidos">
			<span class="tos-toc-label">Contenido</span>
			<ul class="tos-toc-list">
				{#each sections as s (s.id)}
					<li>
						<a href="#{s.id}" class:is-active={activeSection === s.id}>
							{s.num}. {s.title}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<main class="tos-content">
			<!-- Intro -->
			<div class="tos-intro">
				<p>
					En Geminis Labs, la privacidad y protección de datos personales son importantes para
					nosotros.
				</p>
				<p>
					La presente Política de Privacidad describe cómo <strong
						><span class="tos-placeholder">[RAZÓN SOCIAL LEGAL]</span></strong
					>, comercialmente conocida como <strong>Geminis Labs</strong> ("Geminis Labs", "nosotros", "nuestro"),
					recopila, utiliza, almacena y protege información relacionada con nuestros sitios web, aplicaciones,
					plataformas, APIs y servicios tecnológicos.
				</p>
				<p>Esto incluye, sin limitarse a:</p>
				<ul>
					<li>Nexus</li>
					<li>Orion</li>
					<li>Plataformas de monitoreo</li>
					<li>Aplicaciones móviles y web</li>
					<li>APIs</li>
					<li>Integraciones TCP / MQTT</li>
					<li>Servicios TaaS</li>
					<li>Dashboards</li>
					<li>Herramientas empresariales relacionadas</li>
				</ul>
				<div class="tos-accept">
					Al utilizar nuestros Servicios, aceptas las prácticas descritas en esta Política.
				</div>
			</div>

			<!-- Section 1 -->
			<section id="informacion" class="tos-section">
				<div class="tos-section-badge">01</div>
				<h2>Información que Recopilamos</h2>
				<p>Dependiendo del servicio utilizado, podemos recopilar distintos tipos de información.</p>

				<h3><span class="tos-subsection-num">1.1</span> Información de Cuenta</h3>
				<p>Podemos recopilar:</p>
				<ul>
					<li>nombre</li>
					<li>correo electrónico</li>
					<li>número telefónico</li>
					<li>empresa u organización</li>
					<li>credenciales de acceso</li>
					<li>información de autenticación</li>
					<li>identificadores de usuario</li>
					<li>roles y permisos</li>
				</ul>

				<h3>
					<span class="tos-subsection-num">1.2</span> Información de Dispositivos y Aplicaciones
				</h3>
				<p>
					Podemos recopilar información técnica relacionada con dispositivos que acceden a nuestros
					Servicios:
				</p>
				<ul>
					<li>modelo del dispositivo y sistema operativo</li>
					<li>versión de la aplicación</li>
					<li>identificadores técnicos</li>
					<li>idioma y configuración regional</li>
					<li>dirección IP</li>
					<li>tipo de navegador</li>
					<li>timestamps de acceso</li>
					<li>logs técnicos y crash reports</li>
				</ul>

				<h3>
					<span class="tos-subsection-num">1.3</span> Información de Geolocalización y Telemetría
				</h3>
				<p>Dependiendo del producto, podemos procesar:</p>
				<ul>
					<li>coordenadas GPS e historial de ubicación</li>
					<li>eventos de movimiento, velocidad, rumbo y altitud</li>
					<li>estado del dispositivo e ignición</li>
					<li>alertas de telemetría y eventos de geocerca</li>
					<li>tiempos de conexión y datos de sensores</li>
					<li>eventos MQTT y payloads TCP</li>
					<li>mensajes enviados vía APIs</li>
					<li>telemetría IoT y datos operativos del activo monitoreado</li>
				</ul>

				<h3><span class="tos-subsection-num">1.4</span> Información Enviada por Integraciones</h3>
				<p>Si utilizas APIs, TCP, MQTT o integraciones empresariales, podemos procesar:</p>
				<ul>
					<li>credenciales técnicas, API keys y tokens</li>
					<li>payloads transmitidos y mensajes entrantes</li>
					<li>logs operativos y metadata técnica</li>
					<li>métricas de uso y tasas de consumo</li>
					<li>eventos de autenticación</li>
				</ul>

				<h3><span class="tos-subsection-num">1.5</span> Información de Facturación y Comercial</h3>
				<p>Cuando aplique:</p>
				<ul>
					<li>datos fiscales, razón social y RFC</li>
					<li>dirección fiscal</li>
					<li>historial comercial e información de suscripción</li>
					<li>estado de pagos</li>
				</ul>
				<p>
					Geminis Labs podrá utilizar proveedores externos de pago, por lo que no necesariamente
					almacenamos información financiera sensible directamente.
				</p>

				<h3><span class="tos-subsection-num">1.6</span> Cookies y Tecnologías Similares</h3>
				<p>
					Nuestros sitios pueden utilizar cookies, local storage, session storage, analytics tags y
					tecnologías equivalentes para:
				</p>
				<ul>
					<li>mantener sesiones activas;</li>
					<li>recordar preferencias;</li>
					<li>mejorar rendimiento;</li>
					<li>analizar uso del sitio;</li>
					<li>reforzar seguridad.</li>
				</ul>
			</section>

			<!-- Section 2 -->
			<section id="uso-info" class="tos-section">
				<div class="tos-section-badge">02</div>
				<h2>Cómo Utilizamos la Información</h2>
				<p>Podemos utilizar la información para:</p>
				<ul>
					<li>prestar los Servicios y autenticar usuarios;</li>
					<li>administrar cuentas y operar plataformas;</li>
					<li>procesar telemetría y visualizar activos;</li>
					<li>generar alertas y entregar notificaciones;</li>
					<li>mejorar estabilidad y prevenir abuso;</li>
					<li>monitorear seguridad y ofrecer soporte;</li>
					<li>cumplir obligaciones contractuales;</li>
					<li>responder solicitudes y facturación;</li>
					<li>análisis estadístico y mejora de producto.</li>
				</ul>
			</section>

			<!-- Section 3 -->
			<section id="geolocalizacion" class="tos-section">
				<div class="tos-section-badge">03</div>
				<h2>Geolocalización y Datos Sensibles Operativos</h2>
				<p>
					Algunos Servicios procesan información de ubicación o monitoreo operativo. Aceptas que:
				</p>
				<ul>
					<li>la localización puede corresponder a vehículos, activos o dispositivos;</li>
					<li>dichos datos pueden considerarse sensibles dependiendo del uso;</li>
					<li>
						eres responsable de contar con autorizaciones legales necesarias para monitorear activos
						o personas cuando corresponda;
					</li>
					<li>
						Geminis Labs actúa como proveedor tecnológico y no valida automáticamente legitimidad
						del monitoreo realizado por clientes.
					</li>
				</ul>
				<p>El usuario o cliente es responsable del uso legal del monitoreo.</p>
			</section>

			<!-- Section 4 -->
			<section id="comparticion" class="tos-section">
				<div class="tos-section-badge">04</div>
				<h2>Compartición de Información</h2>
				<p>Podemos compartir información cuando sea necesario con:</p>

				<h3><span class="tos-subsection-num">4.1</span> Proveedores Tecnológicos</h3>
				<p>
					Por ejemplo: infraestructura cloud, hosting, servicios de mapas, notificaciones push,
					monitoreo técnico, autenticación, email transaccional y servicios analíticos.
				</p>

				<h3><span class="tos-subsection-num">4.2</span> Partners o Integraciones</h3>
				<p>
					Cuando el servicio opere mediante partners, distribuidores, integradores, white-label o
					contratos empresariales, la información podrá ser compartida conforme a la arquitectura
					contratada.
				</p>

				<h3><span class="tos-subsection-num">4.3</span> Cumplimiento Legal</h3>
				<p>
					Podremos divulgar información cuando exista obligación legal, autoridad competente lo
					requiera, sea necesario proteger derechos, prevenir fraude o responder incidentes de
					seguridad.
				</p>
			</section>

			<!-- Section 5 -->
			<section id="no-venta" class="tos-section">
				<div class="tos-section-badge">05</div>
				<h2>No Vendemos Datos Personales</h2>
				<p>
					Geminis Labs no comercializa datos personales de usuarios como modelo principal de
					negocio.
				</p>
				<p>
					Sin embargo, podremos utilizar información agregada, anonimizada o estadística para fines
					operativos, analíticos o de mejora.
				</p>
			</section>

			<!-- Section 6 -->
			<section id="conservacion" class="tos-section">
				<div class="tos-section-badge">06</div>
				<h2>Conservación de Datos</h2>
				<p>Conservaremos información durante el tiempo razonablemente necesario para:</p>
				<ul>
					<li>operar Servicios y cumplir contratos;</li>
					<li>soporte técnico y seguridad;</li>
					<li>auditoría y cumplimiento legal;</li>
					<li>resolución de controversias.</li>
				</ul>
				<p>Los periodos exactos pueden variar según el producto.</p>
			</section>

			<!-- Section 7 -->
			<section id="seguridad" class="tos-section">
				<div class="tos-section-badge">07</div>
				<h2>Seguridad</h2>
				<p>
					Implementamos medidas razonables de seguridad administrativas, técnicas y operativas. Esto
					puede incluir:
				</p>
				<ul>
					<li>control de acceso y autenticación;</li>
					<li>cifrado cuando aplique;</li>
					<li>segmentación de sistemas;</li>
					<li>monitoreo y logs de seguridad;</li>
					<li>mitigación de abuso.</li>
				</ul>
				<p>No obstante, ningún sistema es completamente invulnerable.</p>
			</section>

			<!-- Section 8 -->
			<section id="terceros" class="tos-section">
				<div class="tos-section-badge">08</div>
				<h2>Servicios de Terceros</h2>
				<p>
					Nuestros Servicios pueden depender de terceros como: proveedores cloud, mapas, push
					notifications, telecomunicaciones, servicios de autenticación e integraciones partner.
				</p>
				<p>
					El tratamiento de información por dichos terceros puede regirse por sus propias políticas.
				</p>
			</section>

			<!-- Section 9 -->
			<section id="transferencias" class="tos-section">
				<div class="tos-section-badge">09</div>
				<h2>Transferencias Internacionales</h2>
				<p>
					Dependiendo de la infraestructura utilizada, la información podrá procesarse fuera del
					país de residencia del usuario.
				</p>
				<p>
					Al utilizar los Servicios, aceptas dichas transferencias cuando sean necesarias para la
					operación.
				</p>
			</section>

			<!-- Section 10 -->
			<section id="menores" class="tos-section">
				<div class="tos-section-badge">10</div>
				<h2>Menores de Edad</h2>
				<p>
					Nuestros Servicios no están diseñados para menores sin supervisión o autorización legal
					aplicable. Cuando corresponda, el responsable del monitoreo deberá contar con facultades
					suficientes.
				</p>
			</section>

			<!-- Section 11 -->
			<section id="derechos" class="tos-section">
				<div class="tos-section-badge">11</div>
				<h2>Derechos del Usuario</h2>
				<p>Dependiendo de la legislación aplicable, podrás solicitar:</p>
				<ul>
					<li>acceso;</li>
					<li>rectificación;</li>
					<li>actualización;</li>
					<li>limitación;</li>
					<li>oposición;</li>
					<li>eliminación cuando proceda.</li>
				</ul>
				<div class="tos-contact-box">
					<p>
						<strong>Solicitudes:</strong>
						<a href="mailto:contacto@geminislabs.com">contacto@geminislabs.com</a>
					</p>
				</div>
				<p style="margin-top: 1rem;">Podremos requerir verificación razonable de identidad.</p>
			</section>

			<!-- Section 12 -->
			<section id="uso-ilegal" class="tos-section">
				<div class="tos-section-badge">12</div>
				<h2>Uso Ilegal o No Autorizado</h2>
				<p>Geminis Labs no autoriza el uso de sus Servicios para:</p>
				<ul>
					<li>espionaje ilegal;</li>
					<li>vigilancia sin autorización;</li>
					<li>acoso;</li>
					<li>monitoreo ilícito;</li>
					<li>actividades delictivas;</li>
					<li>invasión de privacidad.</li>
				</ul>
				<p>Nos reservamos el derecho de suspender cuentas ante sospechas razonables.</p>
			</section>

			<!-- Section 13 -->
			<section id="cookies" class="tos-section">
				<div class="tos-section-badge">13</div>
				<h2>Cookies y Preferencias del Navegador</h2>
				<p>
					El usuario puede restringir ciertas cookies desde su navegador. Esto puede afectar
					funcionalidad de los Servicios.
				</p>
			</section>

			<!-- Section 14 -->
			<section id="cambios" class="tos-section">
				<div class="tos-section-badge">14</div>
				<h2>Cambios a esta Política</h2>
				<p>
					Podremos actualizar esta Política periódicamente. La versión publicada será la vigente.
				</p>
			</section>

			<!-- Section 15 -->
			<section id="contacto" class="tos-section">
				<div class="tos-section-badge">15</div>
				<h2>Contacto</h2>
				<p>Consultas de privacidad:</p>
				<div class="tos-contact-box">
					<p>
						<strong>Correo:</strong>
						<a href="mailto:contacto@geminislabs.com">contacto@geminislabs.com</a>
					</p>
				</div>
			</section>

			<!-- Section 16 -->
			<section id="responsable" class="tos-section">
				<div class="tos-section-badge">16</div>
				<h2>Responsable</h2>
				<p>Operado por:</p>
				<div class="tos-contact-box">
					<p>
						<strong>Razón social:</strong> <span class="tos-placeholder">[RAZÓN SOCIAL LEGAL]</span>
					</p>
					<p><strong>Nombre comercial:</strong> Geminis Labs</p>
					<p><strong>Domicilio:</strong> <span class="tos-placeholder">[DOMICILIO FISCAL]</span></p>
				</div>
			</section>
		</main>
	</div>

	<Footer />
</div>
