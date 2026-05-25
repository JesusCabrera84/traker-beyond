<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import '../legal.css';

	let activeSection = $state('');

	const sections = [
		{ id: 'descripcion', num: '01', title: 'Descripción de los Servicios' },
		{ id: 'elegibilidad', num: '02', title: 'Elegibilidad' },
		{ id: 'cuentas', num: '03', title: 'Cuentas y Acceso' },
		{ id: 'uso-permitido', num: '04', title: 'Uso Permitido' },
		{ id: 'telemetria', num: '05', title: 'Datos de Telemetría y Dispositivos' },
		{ id: 'apis', num: '06', title: 'APIs, TCP, MQTT e Integraciones' },
		{ id: 'partner', num: '07', title: 'Uso Partner / White-label / Reventa' },
		{ id: 'disponibilidad', num: '08', title: 'Disponibilidad del Servicio' },
		{ id: 'alertas', num: '09', title: 'Alertas y Notificaciones' },
		{ id: 'emergencia', num: '10', title: 'No es un Servicio de Emergencia' },
		{ id: 'precision', num: '11', title: 'Precisión y Exactitud' },
		{ id: 'pagos', num: '12', title: 'Pagos y Facturación' },
		{ id: 'propiedad', num: '13', title: 'Propiedad Intelectual' },
		{ id: 'datos', num: '14', title: 'Datos del Usuario' },
		{ id: 'privacidad', num: '15', title: 'Privacidad' },
		{ id: 'suspension', num: '16', title: 'Suspensión o Terminación' },
		{ id: 'limitacion', num: '17', title: 'Limitación de Responsabilidad' },
		{ id: 'indemnizacion', num: '18', title: 'Indemnización' },
		{ id: 'modificaciones', num: '19', title: 'Modificaciones' },
		{ id: 'legislacion', num: '20', title: 'Legislación Aplicable' },
		{ id: 'contacto', num: '21', title: 'Contacto' },
		{ id: 'operador', num: '22', title: 'Operador del Servicio' }
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
	<title>Términos de Uso — Geminis Labs</title>
	<meta
		name="description"
		content="Términos de Uso de los servicios de Geminis Labs, incluyendo Nexus, Orion, APIs, telemetría y plataformas de monitoreo vehicular."
	/>
</svelte:head>

<div class="tos-page">
	<Navbar />

	<!-- Page header -->
	<header class="tos-hero">
		<div class="tos-hero-inner">
			<span class="tos-eyebrow">Legal</span>
			<h1 class="tos-h1">Términos de Uso</h1>
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
							{s.num}. {s.title}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- Main content -->
		<main class="tos-content">
			<!-- Intro -->
			<div class="tos-intro">
				<p>Bienvenido a Geminis Labs.</p>
				<p>
					Los presentes Términos de Uso ("Términos") regulan el acceso y uso de los sitios web,
					aplicaciones, APIs, plataformas, servicios de telemetría, servicios de integración y demás
					productos tecnológicos operados por <strong
						><span class="tos-placeholder">[RAZÓN SOCIAL LEGAL]</span></strong
					>, comercialmente conocida como <strong>Geminis Labs</strong> ("Geminis Labs", "nosotros", "nuestro").
				</p>
				<p>Esto incluye, sin limitarse a:</p>
				<ul>
					<li>Nexus</li>
					<li>Orion</li>
					<li>Plataformas de monitoreo</li>
					<li>Servicios de telemetría</li>
					<li>APIs</li>
					<li>Integraciones TCP</li>
					<li>Integraciones MQTT</li>
					<li>Servicios TaaS (Telemetry as a Service)</li>
					<li>Integraciones white-label</li>
					<li>Dashboards</li>
					<li>Aplicaciones móviles</li>
					<li>Aplicaciones web</li>
					<li>Herramientas empresariales relacionadas</li>
				</ul>
				<div class="tos-accept">
					Al acceder, navegar, registrarte, integrar sistemas o utilizar cualquiera de nuestros
					Servicios, aceptas estos Términos. Si no estás de acuerdo, no debes utilizar los
					Servicios.
				</div>
			</div>

			<!-- Section 1 -->
			<section id="descripcion" class="tos-section">
				<div class="tos-section-badge">01</div>
				<h2>Descripción de los Servicios</h2>
				<p>
					Geminis Labs desarrolla y opera soluciones tecnológicas relacionadas con monitoreo,
					localización, telemetría, análisis de datos, integración de dispositivos y plataformas
					empresariales.
				</p>
				<p>Los Servicios pueden incluir:</p>
				<ul>
					<li>Monitoreo GPS</li>
					<li>Localización de activos</li>
					<li>Geocercas</li>
					<li>Alertas y notificaciones</li>
					<li>Historial de recorridos</li>
					<li>Replay de trayectos</li>
					<li>Dashboards analíticos</li>
					<li>Monitoreo vehicular</li>
					<li>Telemetría IoT</li>
					<li>APIs de integración</li>
					<li>Endpoints TCP</li>
					<li>Servicios MQTT</li>
					<li>Ingestión de telemetría</li>
					<li>Servicios para partners</li>
					<li>Plataformas white-label</li>
					<li>Visualización de datos</li>
					<li>Servicios empresariales relacionados</li>
				</ul>
				<p>
					Algunas funcionalidades pueden estar sujetas a planes comerciales, contratos empresariales
					o acuerdos específicos.
				</p>
			</section>

			<!-- Section 2 -->
			<section id="elegibilidad" class="tos-section">
				<div class="tos-section-badge">02</div>
				<h2>Elegibilidad</h2>
				<p>Solo puedes utilizar los Servicios si:</p>
				<ul>
					<li>tienes capacidad legal para celebrar acuerdos vinculantes;</li>
					<li>utilizas los Servicios conforme a la legislación aplicable;</li>
					<li>
						si representas a una empresa, cuentas con autorización suficiente para obligarla
						legalmente.
					</li>
				</ul>
				<p>
					Si utilizas los Servicios en nombre de una organización, dicha organización acepta estos
					Términos.
				</p>
			</section>

			<!-- Section 3 -->
			<section id="cuentas" class="tos-section">
				<div class="tos-section-badge">03</div>
				<h2>Cuentas y Acceso</h2>
				<p>Algunos Servicios requieren registro. Aceptas:</p>
				<ul>
					<li>proporcionar información veraz;</li>
					<li>mantener tus credenciales seguras;</li>
					<li>restringir accesos no autorizados;</li>
					<li>notificarnos oportunamente ante sospechas de compromiso de seguridad.</li>
				</ul>
				<p>
					Eres responsable de toda actividad realizada desde tu cuenta. Geminis Labs podrá suspender
					o restringir accesos por razones de seguridad, abuso, fraude, incumplimiento o estabilidad
					operativa.
				</p>
			</section>

			<!-- Section 4 -->
			<section id="uso-permitido" class="tos-section">
				<div class="tos-section-badge">04</div>
				<h2>Uso Permitido</h2>
				<p>Aceptas no:</p>
				<ul>
					<li>utilizar los Servicios de forma ilícita;</li>
					<li>intentar acceder sin autorización;</li>
					<li>vulnerar mecanismos de seguridad;</li>
					<li>realizar ingeniería inversa sobre sistemas protegidos;</li>
					<li>abusar de APIs o infraestructura;</li>
					<li>enviar tráfico malicioso;</li>
					<li>introducir malware;</li>
					<li>suplantar identidades;</li>
					<li>realizar monitoreo ilegal;</li>
					<li>vulnerar derechos de privacidad;</li>
					<li>enviar telemetría falsa o manipulada;</li>
					<li>afectar la disponibilidad de la plataforma.</li>
				</ul>
				<p>El uso debe cumplir con la legislación aplicable.</p>
			</section>

			<!-- Section 5 -->
			<section id="telemetria" class="tos-section">
				<div class="tos-section-badge">05</div>
				<h2>Datos de Telemetría y Dispositivos de Terceros</h2>
				<p>Geminis Labs puede procesar datos provenientes de:</p>
				<ul>
					<li>dispositivos GPS</li>
					<li>hardware IoT</li>
					<li>dispositivos administrados por terceros</li>
					<li>infraestructura del cliente</li>
					<li>integraciones TCP</li>
					<li>integraciones MQTT</li>
					<li>gateways externos</li>
					<li>software de terceros</li>
					<li>integraciones partner</li>
				</ul>
				<p>Aceptas que:</p>
				<ul>
					<li>Geminis Labs no fabrica ni controla todo hardware integrado;</li>
					<li>la calidad del dato depende del origen;</li>
					<li>puede existir latencia, pérdida, duplicidad o corrupción de datos;</li>
					<li>proveedores externos pueden fallar;</li>
					<li>cobertura celular, GPS o internet puede verse afectada.</li>
				</ul>
				<p>Geminis Labs no garantiza exactitud absoluta sobre datos originados por terceros.</p>
			</section>

			<!-- Section 6 -->
			<section id="apis" class="tos-section">
				<div class="tos-section-badge">06</div>
				<h2>APIs, TCP, MQTT e Integraciones</h2>
				<p>Si utilizas APIs o servicios de integración:</p>
				<ul>
					<li>eres responsable de la seguridad de tus credenciales;</li>
					<li>tus sistemas deben operar de forma segura;</li>
					<li>no debes enviar payloads maliciosos o abusivos;</li>
					<li>debes respetar límites operativos y autenticación.</li>
				</ul>
				<p>Geminis Labs podrá:</p>
				<ul>
					<li>aplicar rate limiting;</li>
					<li>limitar throughput;</li>
					<li>rechazar payloads inválidos;</li>
					<li>suspender integraciones abusivas;</li>
					<li>modificar endpoints, esquemas o protocolos.</li>
				</ul>
				<p>Cuando sea razonablemente posible, notificaremos cambios relevantes.</p>
			</section>

			<!-- Section 7 -->
			<section id="partner" class="tos-section">
				<div class="tos-section-badge">07</div>
				<h2>Uso Partner / White-label / Reventa</h2>
				<p>
					Cuando los Servicios se utilicen mediante partners, distribuidores, integradores o
					white-label:
				</p>
				<ul>
					<li>el partner es responsable frente a sus clientes finales;</li>
					<li>
						Geminis Labs no asume automáticamente obligaciones contractuales con usuarios finales
						del partner;
					</li>
					<li>declaraciones comerciales hechas por partners son responsabilidad de éstos.</li>
				</ul>
				<p>Podrán aplicar contratos adicionales.</p>
			</section>

			<!-- Section 8 -->
			<section id="disponibilidad" class="tos-section">
				<div class="tos-section-badge">08</div>
				<h2>Disponibilidad del Servicio</h2>
				<p>
					Buscamos mantener alta disponibilidad, pero no garantizamos operación ininterrumpida. El
					servicio puede verse afectado por:
				</p>
				<ul>
					<li>mantenimiento programado;</li>
					<li>mantenimiento emergente;</li>
					<li>fallas cloud;</li>
					<li>fallas de telecomunicaciones;</li>
					<li>incidentes de ciberseguridad;</li>
					<li>fallas GPS;</li>
					<li>errores de terceros;</li>
					<li>dependencia de proveedores externos.</li>
				</ul>
				<p>Salvo acuerdo expreso por escrito, no existe SLA implícito.</p>
			</section>

			<!-- Section 9 -->
			<section id="alertas" class="tos-section">
				<div class="tos-section-badge">09</div>
				<h2>Alertas y Notificaciones</h2>
				<p>Podemos enviar alertas mediante:</p>
				<ul>
					<li>push notifications</li>
					<li>correo electrónico</li>
					<li>SMS (cuando aplique)</li>
					<li>notificaciones internas</li>
					<li>webhooks</li>
					<li>integraciones externas</li>
				</ul>
				<p>La entrega depende de terceros. No garantizamos:</p>
				<ul>
					<li>entrega inmediata;</li>
					<li>entrega única;</li>
					<li>entrega continua;</li>
					<li>ausencia de retrasos.</li>
				</ul>
				<p>No debes depender exclusivamente de alertas para decisiones críticas.</p>
			</section>

			<!-- Section 10 — Warning callout -->
			<section id="emergencia" class="tos-section">
				<div class="tos-section-badge">10</div>
				<h2>No es un Servicio de Emergencia o Seguridad Física</h2>
				<p>Geminis Labs proporciona herramientas tecnológicas.</p>

				<div class="tos-callout">
					<svg
						class="tos-callout-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path
							d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
						/>
						<line x1="12" y1="9" x2="12" y2="13" />
						<line x1="12" y1="17" x2="12.01" y2="17" />
					</svg>
					<div class="tos-callout-body">
						<p class="tos-callout-title">Aviso Importante</p>
						<p class="tos-callout-text">
							Geminis Labs <strong>NO es</strong>: autoridad de seguridad pública, empresa de
							respuesta de emergencias, aseguradora, proveedor de vigilancia física ni servicio
							garantizado de recuperación vehicular.
						</p>
						<p class="tos-callout-text" style="margin-top: 0.75rem;">
							Nuestros Servicios no garantizan: prevención de robo, recuperación de activos,
							detección total de incidentes, notificación inmediata ni intervención humana.
						</p>
					</div>
				</div>

				<p>La responsabilidad operativa y de seguridad permanece con el usuario.</p>
			</section>

			<!-- Section 11 -->
			<section id="precision" class="tos-section">
				<div class="tos-section-badge">11</div>
				<h2>Precisión y Exactitud</h2>
				<p>
					Datos como ubicación, alertas, geocercas, métricas, historial y telemetría son
					estimaciones basadas en información disponible.
				</p>
				<p>Su precisión depende de:</p>
				<ul>
					<li>hardware y firmware</li>
					<li>señal GPS</li>
					<li>conectividad celular e internet</li>
					<li>latencia</li>
					<li>condiciones ambientales</li>
					<li>interferencia urbana</li>
					<li>integridad del origen</li>
				</ul>
				<p>No garantizamos exactitud absoluta.</p>
			</section>

			<!-- Section 12 -->
			<section id="pagos" class="tos-section">
				<div class="tos-section-badge">12</div>
				<h2>Pagos y Facturación</h2>
				<p>Algunos Servicios pueden requerir pago. Cuando aplique:</p>
				<ul>
					<li>precios se mostrarán previamente;</li>
					<li>podrán aplicarse impuestos;</li>
					<li>suscripciones podrán renovarse;</li>
					<li>incumplimiento de pago podrá causar suspensión.</li>
				</ul>
				<p>Contratos empresariales pueden definir condiciones distintas.</p>
			</section>

			<!-- Section 13 -->
			<section id="propiedad" class="tos-section">
				<div class="tos-section-badge">13</div>
				<h2>Propiedad Intelectual</h2>
				<p>
					Todos los derechos sobre los Servicios pertenecen a Geminis Labs o sus licenciantes. Esto
					incluye:
				</p>
				<ul>
					<li>software e interfaces</li>
					<li>APIs y documentación</li>
					<li>diseño visual</li>
					<li>marcas y logotipos</li>
					<li>arquitectura y dashboards</li>
					<li>código propietario</li>
				</ul>
				<p>Estos Términos no transfieren propiedad intelectual.</p>
			</section>

			<!-- Section 14 -->
			<section id="datos" class="tos-section">
				<div class="tos-section-badge">14</div>
				<h2>Datos del Usuario</h2>
				<p>
					Conservas la titularidad sobre datos que legalmente proporciones. Nos otorgas autorización
					para recibir, procesar, almacenar, transmitir, visualizar y analizar dichos datos
					exclusivamente para operar y mejorar los Servicios.
				</p>
				<p>Declaras contar con derechos suficientes para compartir dichos datos.</p>
			</section>

			<!-- Section 15 -->
			<section id="privacidad" class="tos-section">
				<div class="tos-section-badge">15</div>
				<h2>Privacidad</h2>
				<p>
					El uso de los Servicios también se rige por nuestra
					<a href="/privacidad">Política de Privacidad</a>.
				</p>
			</section>

			<!-- Section 16 -->
			<section id="suspension" class="tos-section">
				<div class="tos-section-badge">16</div>
				<h2>Suspensión o Terminación</h2>
				<p>Podremos suspender o cancelar acceso cuando exista:</p>
				<ul>
					<li>incumplimiento o abuso;</li>
					<li>fraude o riesgo operativo;</li>
					<li>riesgo de seguridad;</li>
					<li>incumplimiento de pago;</li>
					<li>requerimiento legal.</li>
				</ul>
			</section>

			<!-- Section 17 -->
			<section id="limitacion" class="tos-section">
				<div class="tos-section-badge">17</div>
				<h2>Limitación de Responsabilidad</h2>
				<p>
					En la máxima medida permitida por ley, Geminis Labs no será responsable por daños
					indirectos, lucro cesante, pérdida de ingresos, pérdida de datos, interrupciones
					operativas, robo de activos, alertas perdidas, retrasos, fallas de terceros, fallas de
					integración o indisponibilidad externa.
				</p>
				<p>
					Los Servicios se proporcionan <strong>"tal cual"</strong> y
					<strong>"según disponibilidad"</strong>.
				</p>
			</section>

			<!-- Section 18 -->
			<section id="indemnizacion" class="tos-section">
				<div class="tos-section-badge">18</div>
				<h2>Indemnización</h2>
				<p>Aceptas defender e indemnizar a Geminis Labs frente a reclamaciones derivadas de:</p>
				<ul>
					<li>uso indebido o monitoreo ilegal;</li>
					<li>abuso de APIs o payloads maliciosos;</li>
					<li>incumplimientos regulatorios;</li>
					<li>reclamaciones de terceros.</li>
				</ul>
			</section>

			<!-- Section 19 -->
			<section id="modificaciones" class="tos-section">
				<div class="tos-section-badge">19</div>
				<h2>Modificaciones</h2>
				<p>
					Podremos actualizar estos Términos. La versión publicada será la vigente. El uso continuo
					implica aceptación.
				</p>
			</section>

			<!-- Section 20 -->
			<section id="legislacion" class="tos-section">
				<div class="tos-section-badge">20</div>
				<h2>Legislación Aplicable</h2>
				<p>
					Estos Términos se regirán por las leyes de los Estados Unidos Mexicanos. La jurisdicción
					corresponderá a tribunales competentes de
					<span class="tos-placeholder">[CIUDAD / ESTADO EN MÉXICO]</span>, salvo disposición legal
					distinta.
				</p>
			</section>

			<!-- Section 21 -->
			<section id="contacto" class="tos-section">
				<div class="tos-section-badge">21</div>
				<h2>Contacto</h2>
				<p>Consultas legales, contractuales o de privacidad:</p>
				<div class="tos-contact-box">
					<p>
						<strong>Correo:</strong>
						<a href="mailto:contacto@geminislabs.com">contacto@geminislabs.com</a>
					</p>
				</div>
			</section>

			<!-- Section 22 -->
			<section id="operador" class="tos-section">
				<div class="tos-section-badge">22</div>
				<h2>Operador del Servicio</h2>
				<p>Servicios operados por:</p>
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
