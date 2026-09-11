<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import {
		services,
		processSteps,
		arbolNodos,
		arbolRamas,
		ramaDeNodo,
		amplitudNodo
	} from '$lib/data/services.js';

	// Abierta la primera: la página nunca se ve vacía y el visitante entiende de
	// inmediato que las filas se abren. El resto colapsadas para que las seis
	// capacidades quepan en pantalla y se puedan comparar.
	let abierta = services[0].slug;

	function alternar(slug) {
		abierta = abierta === slug ? null : slug;
	}

	// ── Árbol: parallax y foco ────────────────────────────────────────────
	//
	// El nodo bajo el puntero se ilumina junto con la rama que lo alimenta, y el
	// resto del árbol se apaga un poco. No hay `:hover` de por medio a propósito:
	// los nodos son PNG con mucho resplandor transparente alrededor, así que sus
	// cajas se solapan y el puntero picaría el rectángulo de un vecino invisible
	// mucho antes que el dibujo que se ve. Se ilumina el nodo cuyo CENTRO está
	// más cerca del puntero, que es lo que la vista entiende como «ese».
	let nodoActivo = null;
	$: ramaActiva = nodoActivo ? ramaDeNodo(nodoActivo) : null;

	// En unidades del sistema 0–100 del árbol. Más ancho y el foco salta entre
	// nodos lejanos; más estrecho y hay que apuntar.
	const RADIO_FOCO = 11;

	// El árbol reacciona donde está el puntero y casi no se inmuta lejos de él.
	// El radio es ancho a propósito: es un campo blando que alcanza a la rama
	// entera, no un foco que ilumina una pieza y deja muertas a sus vecinas.
	const RADIO_CAMPO = 52;
	// Suelo del peso. Con cero, todo lo que está lejos del puntero se congela, y
	// una pieza inmóvil entre otras que respiran se lee como pegada a la foto.
	const PESO_LEJOS = 0.25;

	const acotar = (v) => Math.max(-1, Math.min(1, v));

	/**
	 * Escucha el puntero sobre el hero. Las dos coordenadas se escriben como
	 * custom properties sobre la sección —que es la caja que contiene tanto la
	 * fotografía como el árbol— y no como estado de Svelte: cambian en cada
	 * fotograma, y pasarlas por el ciclo de render reevaluaría los quince nodos
	 * sesenta veces por segundo para moverlos unos píxeles. Lo que sí es estado
	 * es el nodo enfocado, que cambia unas pocas veces por recorrido.
	 */
	function arbolVivo(hero) {
		const caja = hero.querySelector('.sv-arbol');
		if (!caja) return;

		const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
		// Se buscan por su identificador y no por orden: acoplar este array al del
		// `{#each}` haría que reordenar los datos moviera los pesos de sitio en
		// silencio.
		const piezas = arbolNodos.map((n) => caja.querySelector(`[data-nodo="${n.id}"]`));
		let cuadro = 0;
		let puntero = null;

		function pintar() {
			cuadro = 0;
			if (!puntero) return;
			const r = caja.getBoundingClientRect();
			if (!r.width || !r.height) return;

			// El puntero, en el mismo sistema 0–100 en el que viven los nodos.
			const x = ((puntero.x - r.left) / r.width) * 100;
			const y = ((puntero.y - r.top) / r.height) * 100;

			// Acotado porque el hero es más ancho que el árbol: sin esto, el puntero
			// sobre el texto empujaría las hojas muy lejos de su rama.
			if (!quieto.matches) {
				hero.style.setProperty('--px', acotar((x - 50) / 50).toFixed(3));
				hero.style.setProperty('--py', acotar((y - 50) / 50).toFixed(3));
			}

			let cerca = null;
			let minima = RADIO_FOCO;
			for (let i = 0; i < arbolNodos.length; i++) {
				const n = arbolNodos[i];
				const d = Math.hypot(n.x - x, n.y - y);
				if (d < minima) {
					minima = d;
					cerca = n.id;
				}
				// Quince escrituras de estilo por fotograma, no quince renders: sigue
				// sin tocar el ciclo de Svelte.
				const w = PESO_LEJOS + (1 - PESO_LEJOS) * Math.max(0, 1 - d / RADIO_CAMPO);
				piezas[i]?.style.setProperty('--w', w.toFixed(3));
			}
			nodoActivo = cerca;
		}

		function mover(e) {
			// El dedo no tiene hover: en táctil el árbol se quedaría encendido bajo
			// la yema y se apagaría al levantarla, que no es lo que el gesto pide.
			if (e.pointerType === 'touch') return;
			puntero = { x: e.clientX, y: e.clientY };
			if (!cuadro) cuadro = requestAnimationFrame(pintar);
		}

		function salir() {
			puntero = null;
			if (cuadro) {
				cancelAnimationFrame(cuadro);
				cuadro = 0;
			}
			hero.style.setProperty('--px', '0');
			hero.style.setProperty('--py', '0');
			nodoActivo = null;
		}

		hero.addEventListener('pointermove', mover);
		hero.addEventListener('pointerleave', salir);

		return {
			destroy() {
				hero.removeEventListener('pointermove', mover);
				hero.removeEventListener('pointerleave', salir);
				if (cuadro) cancelAnimationFrame(cuadro);
			}
		};
	}
</script>

<svelte:head>
	<title>Servicios de ingeniería y consultoría tecnológica | Geminis Labs</title>
	<meta
		name="description"
		content="Consultoría y arquitectura, software y cloud, IA y datos, IoT y hardware, Industria 4.0 y soluciones integrales. De la idea a una solución operando, con un solo equipo."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet" />
</svelte:head>

<Navbar />

<main class="sv-page">
	<!-- ── HERO ──────────────────────────────────────────── -->
	<!--
		La fotografía va como <img> y no como background-image: es el elemento más
		grande de la primera pantalla, así que conviene que el navegador la
		descubra en el HTML y pueda priorizarla.

		El texto se apoya sobre el hombro y la manga, que es la zona más oscura de
		la imagen —luminancia media 14.5 sobre 255, medida sobre el archivo—, y la
		mitad derecha queda libre a propósito: ahí crece el árbol.
	-->
	<section class="sv-hero" use:arbolVivo>
		<div class="sv-hero-foto">
			<img
				src="/img/servicios-hero.webp"
				alt=""
				width="1672"
				height="941"
				fetchpriority="high"
				decoding="async"
			/>
			<div class="sv-hero-velo" aria-hidden="true"></div>
		</div>

		<div class="sv-hero-inner">
			<div class="sv-hero-copy">
				<p class="sv-overline">Ingeniería y consultoría</p>
				<h1 class="sv-hero-title">De la idea a una solución que funciona.</h1>
				<p class="sv-hero-sub">
					Tomamos un problema de negocio desde que todavía es una idea y lo llevamos hasta una
					solución operando.
					<strong>Un solo equipo, de la estrategia a producción.</strong>
				</p>
				<div class="sv-hero-actions">
					<a href="/servicios/diagnostico" class="sv-btn sv-btn--primary">Agenda un diagnóstico</a>
					<a href="/#productos" class="sv-btn sv-btn--ghost">Ver nuestros productos</a>
				</div>
			</div>

			<!--
				El árbol tecnológico. Nace de la mano del hombre y crece hacia arriba y
				a la derecha. Es decorativo: lo que cuenta ya está en el texto y en las
				seis capacidades, así que queda fuera del árbol de accesibilidad.
			-->
			<div class="sv-hero-arbol" aria-hidden="true">
				<div class="sv-arbol" class:sv-arbol--enfocado={nodoActivo}>
					<!-- Los trazos van detrás de los nodos, en el mismo sistema de 0–100
					     que sus coordenadas, para que todo escale junto. -->
					<svg class="sv-arbol-trazos" viewBox="0 0 100 100" preserveAspectRatio="none">
						{#each arbolRamas as rama (rama.id)}
							<path
								class="sv-arbol-linea"
								class:sv-arbol-linea--tronco={rama.tronco}
								class:sv-arbol-linea--activa={rama.id === ramaActiva}
								d={rama.d}
							/>
							<path
								class="sv-arbol-pulso"
								class:sv-arbol-pulso--tronco={rama.tronco}
								d={rama.d}
								style="--d: {rama.retardo}s"
							/>
						{/each}
					</svg>

					{#each arbolNodos as nodo (nodo.id)}
						<img
							class="sv-arbol-nodo"
							src="/img/arbol/{nodo.img}.webp"
							alt=""
							decoding="async"
							data-capa={nodo.capa}
							data-nodo={nodo.id}
							class:sv-arbol-nodo--volteado={nodo.voltear}
							class:sv-arbol-nodo--activo={nodo.id === nodoActivo}
							style="--x: {nodo.x}%; --y: {nodo.y}%; --t: {nodo.tamano}%; --amp: {amplitudNodo(
								nodo
							)}px;"
						/>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- ── RIEL DE PROCESO ───────────────────────────────── -->
	<section class="sv-process-wrap" aria-labelledby="sv-process-title">
		<div class="sv-container">
			<h2 id="sv-process-title" class="sv-sr-only">Cómo trabajamos</h2>
			<ol class="sv-process">
				{#each processSteps as p, i (p.key)}
					<li class="sv-process-step" style="--i: {i}">
						<span class="sv-process-node" aria-hidden="true"></span>
						<span class="sv-process-label">{p.label}</span>
						<span class="sv-process-desc">{p.desc}</span>
						{#if i < processSteps.length - 1}
							<span class="sv-process-line" aria-hidden="true"></span>
						{/if}
					</li>
				{/each}
			</ol>
		</div>
	</section>

	<!-- ── LAS SEIS CAPACIDADES ──────────────────────────── -->
	<section class="sv-index" aria-labelledby="sv-index-title">
		<div class="sv-container">
			<header class="sv-head">
				<p class="sv-overline">Qué hacemos</p>
				<h2 id="sv-index-title" class="sv-title">Seis capacidades, una sola casa</h2>
				<p class="sv-sub">
					No vendemos horas de programador. Vendemos capacidad de ingeniería: entender el problema,
					diseñar la tecnología y construir la solución.
				</p>
			</header>
		</div>

		<!-- Filas a sangre. Es un índice, no una cuadrícula: la landing ya tiene
		     dos rejillas (capas tecnológicas y áreas) y una tercera se leería como
		     más de lo mismo. -->
		<ol class="sv-rows">
			{#each services as s (s.slug)}
				<li class="sv-row-item">
					<button
						type="button"
						class="sv-row"
						class:is-open={abierta === s.slug}
						aria-expanded={abierta === s.slug}
						aria-controls="cap-{s.slug}"
						on:click={() => alternar(s.slug)}
					>
						<span class="sv-row-num" aria-hidden="true">{s.num}</span>
						<span class="sv-row-main">
							<span class="sv-row-title">{s.title}</span>
							<span class="sv-row-promise">{s.promise}</span>
						</span>
						<span class="sv-row-chevron" aria-hidden="true"></span>
					</button>
					<div
						class="sv-row-detail"
						id="cap-{s.slug}"
						class:is-open={abierta === s.slug}
						inert={abierta !== s.slug}
					>
						<div class="sv-row-detail-inner">
							<ul class="sv-chips">
								{#each s.chips as chip (chip)}
									<li class="sv-chip">{chip}</li>
								{/each}
							</ul>
							<div class="sv-row-foot">
								<a class="sv-row-link" href="/servicios/{s.slug}">
									Ver {s.title}
									<span class="sv-row-link-arrow" aria-hidden="true">→</span>
								</a>
								<p class="sv-row-entry">{s.entrada}</p>
							</div>
						</div>
					</div>
				</li>
			{/each}
		</ol>
	</section>

	<!-- ── DOS PUERTAS DE ENTRADA ────────────────────────── -->
	<section class="sv-doors" id="doors">
		<div class="sv-container">
			<header class="sv-head">
				<p class="sv-overline">Por dónde empezar</p>
				<h2 class="sv-title">No tienes que contratar el proyecto completo</h2>
			</header>
			<div class="sv-door-grid">
				<article class="sv-door">
					<div class="sv-door-copy">
						<h3 class="sv-door-title">Diagnóstico tecnológico</h3>
						<p class="sv-door-desc">
							«Dime qué está mal y qué debería hacer.» Revisamos arquitectura, infraestructura,
							costos, escalabilidad y seguridad, y te entregamos un documento con el que puedes
							decidir — contrates con nosotros o no.
						</p>
						<a href="/servicios/diagnostico" class="sv-btn sv-btn--primary">Agenda un diagnóstico</a
						>
					</div>

					<!--
						Los seis apartados eran una cadena de flechas que se partía en dos
						líneas y se leía como una nota al pie. Como índice del documento
						dicen lo mismo, se leen de un vistazo y le dan a esta puerta el
						peso visual que la otra ya tenía por su diagrama.

						No lleva `aria-hidden`: aquí viven los seis apartados y en ningún
						otro sitio, a diferencia del diagrama del CTOaaS, que repite lo
						que su lista ya dice.
					-->
					<figure class="sv-entrega">
						<div class="sv-entrega-hoja">
							<p class="sv-entrega-titulo">Lo que recibes</p>
							<ol class="sv-entrega-indice">
								<li>Estado actual</li>
								<li>Riesgos</li>
								<li>Oportunidades</li>
								<li>Arquitectura recomendada</li>
								<li>Roadmap</li>
								<li>Estimación de inversión</li>
							</ol>
						</div>
						<figcaption class="sv-entrega-pie">
							El índice del documento que se entrega al cerrar el diagnóstico.
						</figcaption>
					</figure>
				</article>
				<article class="sv-door">
					<div class="sv-door-copy">
						<h3 class="sv-door-title">CTO as a Service</h3>
						<p class="sv-door-desc">
							No necesitas un CTO de tiempo completo, necesitas que alguien te diga «no compres
							eso», «ese proveedor te está vendiendo de más», «esta arquitectura no va a escalar» o
							«antes de meter IA arreglemos los datos».
						</p>
						<ul class="sv-door-list">
							<li>Estrategia tecnológica y roadmaps</li>
							<li>Evaluación de proveedores y propuestas</li>
							<li>Supervisión técnica de quien ya te desarrolla</li>
							<li>Acompañamiento en la contratación de tu equipo</li>
						</ul>
						<a href="/#contacto" class="sv-btn sv-btn--ghost">Hablar de acompañamiento</a>
					</div>
					<!-- El diagrama va como SVG y no como imagen: escala sin pixelarse,
					     hereda la paleta de la sección y puede animarse con el mismo pulso
					     que el resto. Es decorativo —lo que dice ya está en la lista de
					     arriba— así que queda fuera del árbol de accesibilidad. -->
					<figure class="sv-cto" aria-hidden="true">
						<svg viewBox="0 0 260 122" role="presentation" focusable="false">
							<defs>
								<!-- En coordenadas de usuario, no de caja delimitadora: una línea
								     recta tiene caja de área cero y ahí un degradado en
								     objectBoundingBox queda indefinido y no llega a pintarse. -->
								<linearGradient
									id="svCtoLinea"
									gradientUnits="userSpaceOnUse"
									x1="0"
									y1="0"
									x2="0"
									y2="122"
								>
									<stop offset="0%" stop-color="var(--gl-teal-400)" />
									<stop offset="100%" stop-color="var(--sv-accent)" />
								</linearGradient>
							</defs>

							<text class="sv-cto-origen" x="130" y="10" text-anchor="middle">TU EMPRESA</text>
							<path class="sv-cto-guia" d="M130 18 V34" />

							<rect class="sv-cto-caja" x="88" y="34" width="84" height="30" rx="8" />
							<text class="sv-cto-nodo" x="130" y="54" text-anchor="middle">CTOaaS</text>

							<!-- Tronco y tres ramas hacia los frentes que se supervisan -->
							<path class="sv-cto-guia" d="M130 64 V76" />
							<path class="sv-cto-guia" d="M40 76 H220" />
							<path class="sv-cto-guia" d="M40 76 V90" />
							<path class="sv-cto-guia" d="M130 76 V90" />
							<path class="sv-cto-guia" d="M220 76 V90" />
							<path class="sv-cto-pulso" d="M40 76 V90" style="--d: 0s" />
							<path class="sv-cto-pulso" d="M130 76 V90" style="--d: 0.32s" />
							<path class="sv-cto-pulso" d="M220 76 V90" style="--d: 0.64s" />

							<circle class="sv-cto-punto" cx="40" cy="90" r="2.6" />
							<circle class="sv-cto-punto" cx="130" cy="90" r="2.6" />
							<circle class="sv-cto-punto" cx="220" cy="90" r="2.6" />

							<text class="sv-cto-hoja" x="40" y="110" text-anchor="middle">Equipo</text>
							<text class="sv-cto-hoja" x="130" y="110" text-anchor="middle">Vendors</text>
							<text class="sv-cto-hoja" x="220" y="110" text-anchor="middle">Tecnología</text>
						</svg>
						<figcaption class="sv-cto-pie">
							Una sola cabeza técnica sobre los tres frentes donde se pierde el dinero.
						</figcaption>
					</figure>
				</article>
			</div>
		</div>
	</section>

	<!-- ── INNOVATION LAB ────────────────────────────────── -->
	<section class="sv-lab">
		<div class="sv-container sv-lab-inner">
			<div class="sv-lab-copy">
				<p class="sv-overline">Innovation Lab</p>
				<h2 class="sv-title">¿Tienes una idea y no sabes si se puede construir?</h2>
				<p class="sv-sub">
					Lo averiguamos con un PoC antes de que comprometas presupuesto en algo que quizá no es
					viable. Evaluación técnica, selección de tecnologías, arquitectura inicial y estimación de
					costos.
				</p>
				<a href="/#contacto" class="sv-btn sv-btn--primary sv-btn--inline">Evalúa tu idea</a>
			</div>

			<!--
				La ilustración no repite lo que dice la lista. La lista nombra las
				FASES —idea, PoC, MVP— y la ilustración enseña las DISCIPLINAS que
				hay que atravesar para recorrerlas: electrónica, conectividad, nube y
				aplicaciones. Por eso lleva texto alternativo propio y no `alt=""`.

				Va abajo del todo de la página, así que carga en diferido: no compite
				con la fotografía del hero, que es la que decide el LCP.
			-->
			<figure class="sv-lab-figura">
				<!-- El lienzo existe solo para que el velo de bordes se ciña a la imagen:
				     sobre la `figure` entera taparía también las fases de abajo. -->
				<div class="sv-lab-lienzo">
					<img
						src="/img/servicios-lab.webp"
						alt="El recorrido completo de un producto: el boceto de una idea, la electrónica de un prototipo, el dispositivo terminado, la nube que recibe sus datos y los tableros donde se consultan."
						width="1672"
						height="941"
						loading="lazy"
						decoding="async"
					/>
				</div>

				<!-- Las fases van SOBRE la imagen, apoyadas en su borde inferior: de
				     paso tapan la franja donde el archivo se funde con la sección. -->
				<ol class="sv-flow">
					{#each ['Idea', 'PoC', 'MVP', 'Producto', 'Producción'] as paso, i (paso)}
						<li class="sv-flow-step">
							<span class="sv-flow-n" aria-hidden="true">{i + 1}</span>
							{paso}
						</li>
					{/each}
				</ol>
			</figure>
		</div>
	</section>

	<!-- ── CIERRE ────────────────────────────────────────── -->
	<section class="sv-close">
		<div class="sv-container">
			<h2 class="sv-title sv-close-title">
				Entendemos el problema, diseñamos la tecnología y construimos la solución.
			</h2>
			<p class="sv-sub sv-close-sub">
				Nexus es la prueba: dispositivo, conectividad, streaming, geoproceso, alertas, panel, apps e
				infraestructura, construidos e integrados por el mismo equipo.
			</p>
			<div class="sv-hero-actions sv-close-actions">
				<a href="/servicios/diagnostico" class="sv-btn sv-btn--primary">Agenda un diagnóstico</a>
				<a href="/products/nexus" class="sv-btn sv-btn--ghost">Ver Nexus</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.sv-page {
		background: var(--sv-bg);
		color: var(--sv-text);
		font-family: var(--gl-font-body);
	}

	/* `login-page.css` declara un `section { min-height: 100vh; display: flex }`
	   sin scope que se filtra a todo el sitio. Se neutraliza aquí, igual que hace
	   nexus.css para los suyos. */
	.sv-page section:not(.sv-hero) {
		min-height: 0;
		display: block;
	}

	.sv-container {
		width: min(1180px, 92vw);
		margin: 0 auto;
	}

	.sv-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.sv-overline {
		font-family: var(--gl-font-label);
		font-size: 0.72rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--sv-accent);
		margin: 0 0 1rem;
	}

	.sv-title {
		font-family: var(--gl-font-body);
		font-weight: 600;
		font-size: clamp(1.5rem, 3.2vw, 2.3rem);
		line-height: 1.2;
		text-wrap: balance;
		margin: 0 0 1rem;
	}

	.sv-sub {
		font-size: clamp(0.98rem, 1.2vw, 1.1rem);
		line-height: 1.65;
		color: var(--sv-text-muted);
		max-width: 62ch;
		margin: 0;
	}

	.sv-head {
		margin-bottom: clamp(2rem, 4vw, 3rem);
	}

	/* ── Hero ──────────────────────────────────────────── */

	.sv-hero {
		/* Puntero normalizado a −1..1, que escribe el JS. Vive aquí y no en el
		   árbol porque la fotografía también lo lee, y son hermanos. El valor de
		   reposo va declarado para que el hero se dibuje quieto antes de que
		   nadie lo toque. */
		--px: 0;
		--py: 0;
		position: relative;
		isolation: isolate;
		min-height: clamp(38rem, 84vh, 60rem);
		display: flex;
		align-items: stretch;
		overflow: hidden;
		background: var(--sv-bg);
	}
	.sv-hero-foto {
		position: absolute;
		inset: 0;
		z-index: -1;
	}
	.sv-hero-foto img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* El hombre vive en el borde izquierdo de la foto: anclando ahí, es lo
		   último que se recorta cuando la ventana se estrecha. */
		object-position: left center;
		/* La fotografía es de noche y ya venía oscura de origen; un poco de brillo
		   y saturación devuelven la mesa, las tarjetas y la cara, que se perdían. */
		filter: brightness(1.24) saturate(1.06);
		/*
		 * La foto se mueve CONTRA el puntero y el árbol a favor, que es lo que
		 * separa un plano del otro: lo que la vista lee como profundidad es el
		 * desplazamiento RELATIVO entre los dos, no el de cada uno.
		 *
		 * Poco y lento a propósito. Es el plano más lejano —la mesa, no lo que
		 * flota sobre ella—, así que se mueve la mitad que la hoja más adelantada
		 * y tarda casi el doble en llegar: esa pereza es la que le da peso.
		 *
		 * El 1.03 de escala es lo que paga el movimiento. Sin sobremedida, siete
		 * píxeles de desplazamiento destaparían siete píxeles de fondo en el
		 * borde contrario.
		 */
		transform: scale(1.03) translate(calc(var(--px) * -7px), calc(var(--py) * -4px));
		transition: transform 0.8s var(--gl-ease);
		will-change: transform;
	}
	/*
	 * Dos velos, no uno. El vertical asienta la parte baja para el texto y los
	 * botones; el horizontal apaga la ventana de la ciudad, que es la zona más
	 * clara de la imagen (34.5 de luminancia frente a 14.5 del hombro) y la
	 * única que podría comerse un titular blanco.
	 */
	/*
	 * El velo se concentra DEBAJO DEL TEXTO, no sobre toda la imagen. Antes eran
	 * dos degradados a lo ancho que se multiplicaban entre sí y apagaban la
	 * escena entera para proteger un bloque de texto que ocupa un tercio.
	 *
	 * El radial hace ese trabajo donde hace falta —abajo a la izquierda, sobre el
	 * hombro— y el lineal solo asienta los bordes superior e inferior lo justo
	 * para que la barra de navegación y el corte con la sección siguiente no
	 * queden duros.
	 */
	.sv-hero-velo {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(
				115% 95% at 10% 76%,
				rgba(0, 12, 21, 0.88) 0%,
				rgba(0, 12, 21, 0.5) 34%,
				transparent 64%
			),
			linear-gradient(180deg, rgba(0, 12, 21, 0.4) 0%, transparent 22%, rgba(0, 12, 21, 0.45) 100%);
	}
	.sv-hero-inner {
		position: relative;
		width: 100%;
		display: grid;
		grid-template-columns: minmax(0, 0.38fr) minmax(0, 0.62fr);
		align-items: end;
		gap: clamp(1.5rem, 3vw, 3rem);
		padding: clamp(7rem, 14vw, 10rem) 0 clamp(2.5rem, 5vw, 4rem);
		padding-left: max(2rem, calc((100% - 1180px) / 2));
		padding-right: clamp(1rem, 2vw, 2rem);
	}
	.sv-hero-copy {
		max-width: 30rem;
	}
	.sv-hero-arbol {
		align-self: stretch;
		min-height: clamp(12rem, 30vw, 24rem);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	/* Caja de referencia del árbol: todo dentro se posiciona en porcentajes
	   sobre ella, así la composición aguanta cualquier ancho sin recalcular. */
	.sv-arbol {
		position: relative;
		width: 100%;
		max-width: 42rem;
		max-height: 100%;
		aspect-ratio: 1 / 1.02;
	}
	.sv-arbol-trazos {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		/* Los trazos se quedan quietos: son el esqueleto sobre el que respiran los
		   nodos. Pueden hacerlo porque cada rama muere en el CENTRO de su nodo, no
		   en su borde, así que la pieza sigue tapando el remate por mucho que se
		   aparte. */
	}
	.sv-arbol-linea {
		fill: none;
		stroke: var(--sv-accent);
		stroke-width: 1.6;
		stroke-linejoin: round;
		stroke-linecap: round;
		opacity: 0.62;
		vector-effect: non-scaling-stroke;
		filter: drop-shadow(0 0 4px rgba(127, 227, 245, 0.75));
	}
	.sv-arbol-linea--tronco {
		stroke-width: 8;
		opacity: 0.72;
		filter: drop-shadow(0 0 12px rgba(127, 227, 245, 0.85));
	}
	/* La rama que alimenta al nodo enfocado. No toca `stroke-width` en el tronco:
	   engordarlo de 8 a 2.8 lo adelgazaría, que es lo contrario de encenderlo. */
	.sv-arbol--enfocado .sv-arbol-linea {
		opacity: 0.28;
	}
	.sv-arbol--enfocado .sv-arbol-linea--activa {
		opacity: 1;
		filter: drop-shadow(0 0 11px rgba(127, 227, 245, 0.95));
	}
	.sv-arbol--enfocado .sv-arbol-linea--activa:not(.sv-arbol-linea--tronco) {
		stroke-width: 2.8;
	}
	.sv-arbol-linea,
	.sv-arbol-nodo {
		transition:
			transform 0.45s var(--gl-ease),
			opacity 0.35s var(--gl-ease),
			filter 0.35s var(--gl-ease),
			stroke-width 0.35s var(--gl-ease);
	}
	/* El mismo pulso de señal del resto de la página: la decisión entra por el
	   tronco y recorre las ramas. */
	.sv-arbol-pulso {
		fill: none;
		stroke: #ddfaff;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
		stroke-dasharray: 4 46;
		filter: drop-shadow(0 0 4px rgba(127, 227, 245, 0.9));
		animation: svArbolFluir 4.2s linear infinite;
		animation-delay: var(--d);
	}
	.sv-arbol-pulso--tronco {
		stroke-width: 5;
		stroke-dasharray: 6 44;
		filter: drop-shadow(0 0 10px rgba(127, 227, 245, 0.95));
	}

	@keyframes svArbolFluir {
		from {
			stroke-dashoffset: 50;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
	/* Los nodos se centran en su coordenada, no se anclan por la esquina: así
	   `--x`/`--y` señalan el punto del trazo con el que deben coincidir. */
	.sv-arbol-nodo {
		/* `--amp` llega en línea desde los datos: mezcla la capa con la altura del
		   nodo. `--w` lo escribe el JS en cada fotograma con la cercanía del
		   puntero. El valor de reposo va aquí para que el árbol se dibuje quieto
		   antes de que nadie lo toque. */
		--amp: 0px;
		--w: 1;
		--giro: 1;
		--acerca: 1;
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--t);
		height: auto;
		/* El desplazamiento del puntero va DESPUÉS del volteo en la lista, así que
		   el espejo no le cambia el signo: una hoja volteada se aparta hacia el
		   mismo lado que sus vecinas. */
		transform: translate(-50%, -50%)
			translate(calc(var(--px) * var(--amp) * var(--w)), calc(var(--py) * var(--amp) * var(--w)))
			scaleX(var(--giro)) scale(var(--acerca));
		will-change: transform;
	}
	.sv-arbol-nodo[data-capa='3'] {
		filter: drop-shadow(0 0 14px rgba(127, 227, 245, 0.35));
	}
	.sv-arbol-nodo--volteado {
		--giro: -1;
	}

	.sv-arbol--enfocado .sv-arbol-nodo {
		opacity: 0.62;
	}
	.sv-arbol-nodo.sv-arbol-nodo--activo {
		--acerca: 1.07;
		opacity: 1;
		z-index: 2;
		filter: drop-shadow(0 0 26px rgba(127, 227, 245, 0.8)) brightness(1.16);
	}

	@media (prefers-reduced-motion: reduce) {
		.sv-arbol-pulso,
		.sv-process-line::after,
		.sv-process-node::after {
			display: none;
		}
		/* Los textos se quedan en su color de reposo, que es el que declara la
		   regla: aquí basta con quitarles la animación. */
		.sv-process-label,
		.sv-process-desc {
			animation: none;
		}
		/* El foco se queda: encender un nodo no es movimiento, y sin él el árbol
		   dejaría de responder. Lo que se va es el desplazamiento, que además el
		   JS ni siquiera llega a escribir. */
		.sv-hero-foto img {
			transform: none;
		}
		.sv-arbol-trazos {
			transform: none;
		}
		.sv-arbol-nodo {
			transform: translate(-50%, -50%) scaleX(var(--giro));
		}
		.sv-arbol-linea,
		.sv-arbol-nodo {
			transition:
				opacity 0.2s linear,
				filter 0.2s linear;
		}
	}
	.sv-hero-title {
		font-family: var(--gl-font-body);
		font-weight: 700;
		font-size: clamp(2rem, 4.4vw, 3.4rem);
		line-height: 1.08;
		letter-spacing: -0.02em;
		text-wrap: balance;
		margin: 0 0 1.1rem;
		max-width: 15ch;
		text-shadow: 0 2px 18px rgba(0, 12, 21, 0.6);
	}
	.sv-hero-sub {
		font-size: clamp(0.98rem, 1.2vw, 1.12rem);
		line-height: 1.6;
		color: var(--sv-text-muted);
		max-width: 44ch;
		margin: 0 0 1.75rem;
		text-shadow: 0 1px 12px rgba(0, 12, 21, 0.6);
	}
	.sv-hero-sub strong {
		color: var(--sv-text);
		font-weight: 600;
	}

	.sv-hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	/* ── Botones ───────────────────────────────────────── */

	.sv-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0.75rem 1.6rem;
		border-radius: var(--gl-r-sm);
		font-weight: 600;
		font-size: 0.95rem;
		text-decoration: none;
		transition:
			transform var(--gl-dur) var(--gl-ease),
			background var(--gl-dur) var(--gl-ease),
			border-color var(--gl-dur) var(--gl-ease);
	}

	.sv-btn--primary {
		background: var(--sv-accent);
		color: var(--sv-accent-ink);
		border: 1px solid var(--sv-accent);
	}

	.sv-btn--primary:hover {
		transform: translateY(-2px);
		background: #a4ecf9;
		border-color: #a4ecf9;
	}

	.sv-btn--ghost {
		background: transparent;
		color: var(--sv-text);
		border: 1px solid var(--sv-rule);
	}

	.sv-btn--ghost:hover {
		border-color: var(--sv-accent);
	}

	.sv-btn--inline {
		margin-top: 1.75rem;
	}

	.sv-btn:focus-visible {
		outline: 2px solid var(--sv-accent);
		outline-offset: 3px;
	}

	/* ── Riel de proceso ───────────────────────────────── */

	.sv-process-wrap {
		padding: clamp(1.5rem, 3vw, 2.25rem) 0;
		border-top: 1px solid var(--sv-rule);
		border-bottom: 1px solid var(--sv-rule);
		background: var(--sv-bg-2);
	}

	.sv-process {
		/*
		 * Una SOLA partícula recorre el riel de principio a fin, tramo por tramo, y
		 * cada nodo destella cuando llega. Es la misma señal del árbol y del
		 * diagrama del CTOaaS, pero aquí cuenta algo: esto es un proceso ordenado,
		 * y cuatro partículas corriendo a la vez lo leerían como cinco cosas
		 * simultáneas, que es justo lo que no es.
		 *
		 * El ciclo se reparte en CINCO franjas para cuatro tramos: la quinta es la
		 * pausa después de «operamos». Sin ella la partícula reaparecería en el
		 * origen en el mismo instante en que llega al final, y el recorrido no se
		 * leería como un recorrido sino como un bucle sin principio.
		 */
		--sv-riel-ciclo: 7s;
		--sv-riel-franja: calc(var(--sv-riel-ciclo) / 5);
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0;
	}

	.sv-process-step {
		position: relative;
		display: grid;
		grid-template-rows: auto auto auto;
		gap: 0.4rem;
		padding-right: 1rem;
	}

	.sv-process-node {
		position: relative;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--sv-accent);
		margin-bottom: 0.35rem;
	}
	/* El destello de llegada. Va en un pseudoelemento y no en el nodo para que
	   sea solo `transform` y `opacity`: animar el `box-shadow` del propio punto
	   repintaría en cada fotograma. */
	.sv-process-node::after {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(127, 227, 245, 0.9) 0%, rgba(127, 227, 245, 0) 70%);
		opacity: 0;
		animation: svRielDestello var(--sv-riel-ciclo) linear infinite;
		/* El nodo `i` se enciende cuando la partícula TERMINA el tramo `i − 1`, que
		   es exactamente el arranque de la franja `i`. */
		animation-delay: calc(var(--i) * var(--sv-riel-franja));
	}

	/*
	 * La línea de 1px que une los nodos: gradiente de la escalera teal.
	 *
	 * La transparencia va en los colores y no en `opacity`, porque `opacity`
	 * multiplica a los hijos y dejaría la partícula al 45% de su brillo.
	 */
	.sv-process-line {
		position: absolute;
		top: 3px;
		left: 7px;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, rgba(8, 131, 160, 0.5), rgba(127, 227, 245, 0.45));
	}
	/*
	 * La partícula. Se desplaza con `left` y no con `transform` porque el recorrido
	 * es el ancho del tramo, que lo fija la rejilla: un `translateX` en porcentaje
	 * se mediría contra los 5 px de la propia partícula, no contra el tramo.
	 */
	.sv-process-line::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		width: 5px;
		height: 5px;
		margin: -2.5px 0 0 -2.5px;
		border-radius: 50%;
		background: #ddfaff;
		box-shadow: 0 0 9px 1px rgba(127, 227, 245, 0.9);
		opacity: 0;
		animation: svRielParticula var(--sv-riel-ciclo) linear infinite;
		animation-delay: calc(var(--i) * var(--sv-riel-franja));
	}

	/*
	 * Cada animación dura el ciclo ENTERO y solo se mueve durante su primer
	 * quinto; el resto del tiempo espera invisible en el destino. Es lo que
	 * permite escalonar los cuatro tramos con un simple retardo: con una duración
	 * de un quinto y repetición infinita, los cuatro irían en fase y se vería una
	 * lluvia de partículas en paralelo en vez de una sola recorriendo el riel.
	 */
	@keyframes svRielParticula {
		0% {
			left: 0%;
			opacity: 0;
		}
		3% {
			opacity: 1;
		}
		17% {
			opacity: 1;
		}
		20% {
			left: 100%;
			opacity: 0;
		}
		100% {
			left: 100%;
			opacity: 0;
		}
	}

	@keyframes svRielDestello {
		0% {
			opacity: 0;
			transform: scale(0.6);
		}
		4% {
			opacity: 1;
			transform: scale(2.4);
		}
		20% {
			opacity: 0;
			transform: scale(3.3);
		}
		100% {
			opacity: 0;
			transform: scale(3.3);
		}
	}

	/*
	 * El rótulo y su descripción se encienden con el paso de la partícula, con el
	 * mismo retardo que el destello del nodo: lo que recorre el riel no es un
	 * adorno, es la lectura del proceso paso por paso.
	 *
	 * Se apagan más tarde de lo que tarda el siguiente en encenderse —vuelven al
	 * reposo en el 30% y el vecino arranca en el 20%— para que haya un instante
	 * con los dos vivos. Sin ese solape el riel parpadea; con él, avanza.
	 */
	.sv-process-label {
		font-family: var(--gl-font-label);
		font-size: 0.68rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--sv-text);
		animation: svRielRotulo var(--sv-riel-ciclo) linear infinite;
		animation-delay: calc(var(--i) * var(--sv-riel-franja));
	}

	/* El reposo va como sombra transparente y no como `none`: entre `none` y una
	   sombra con color no hay interpolación, y el resplandor aparecería de golpe. */
	@keyframes svRielRotulo {
		0%,
		30%,
		100% {
			color: var(--sv-text);
			text-shadow: 0 0 0 rgba(127, 227, 245, 0);
		}
		5%,
		18% {
			color: var(--sv-accent);
			text-shadow: 0 0 14px rgba(127, 227, 245, 0.5);
		}
	}

	@keyframes svRielTexto {
		0%,
		30%,
		100% {
			color: var(--sv-text-faint);
		}
		5%,
		18% {
			color: var(--sv-text-muted);
		}
	}

	.sv-process-desc {
		font-size: 0.82rem;
		line-height: 1.45;
		color: var(--sv-text-faint);
		max-width: 22ch;
		animation: svRielTexto var(--sv-riel-ciclo) linear infinite;
		animation-delay: calc(var(--i) * var(--sv-riel-franja));
	}

	/* ── Índice de capacidades ─────────────────────────── */

	.sv-index {
		padding: clamp(3.5rem, 7vw, 5.5rem) 0 0;
	}

	.sv-rows {
		list-style: none;
		padding: 0;
		margin: clamp(1.5rem, 3vw, 2.5rem) 0 0;
		border-top: 1px solid var(--sv-rule);
	}

	.sv-row-item {
		border-bottom: 1px solid var(--sv-rule);
	}

	/* Botón, no div: el contenido revelado solo por hover es inalcanzable con
	   teclado y en táctil. */
	/* A sangre de verdad: el botón ocupa todo el ancho y el padding lateral
	   alinea su contenido con el contenedor. Con `width: min(1180px,92vw)` el
	   fondo del hover y el riel de acento se quedaban dentro de la caja, que es
	   justo lo que distingue este patrón de una cuadrícula más. */
	.sv-row {
		position: relative;
		width: 100%;
		padding-inline: max(4vw, calc((100% - 1180px) / 2));
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 0 clamp(1rem, 2.5vw, 2.25rem);
		align-items: start;
		padding-block: clamp(1.5rem, 2.4vw, 2.1rem);
		background: transparent;
		border: 0;
		text-align: left;
		color: inherit;
		font: inherit;
		cursor: pointer;
		transition: background var(--gl-dur) var(--gl-ease);
	}

	.sv-row::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 3px;
		background: var(--sv-accent);
		transform: scaleY(0);
		transform-origin: 50% 0;
		transition: transform var(--gl-dur) var(--gl-ease);
	}

	.sv-row:hover,
	.sv-row.is-open {
		background: var(--sv-row-hover);
	}

	.sv-row:hover::before,
	.sv-row.is-open::before {
		transform: scaleY(1);
	}

	.sv-row:focus-visible {
		outline: 2px solid var(--sv-accent);
		outline-offset: -2px;
	}

	.sv-row-num {
		font-family: var(--gl-font-label);
		font-size: 0.72rem;
		letter-spacing: 0.28em;
		color: var(--sv-text-faint);
		padding-top: 0.5rem;
	}

	.sv-row-main {
		display: grid;
		gap: 0.4rem;
		min-width: 0;
	}

	.sv-row-title {
		font-size: clamp(1.3rem, 2.2vw, 2rem);
		font-weight: 600;
		line-height: 1.2;
		transition: transform var(--gl-dur) var(--gl-ease);
	}

	.sv-row:hover .sv-row-title {
		transform: translateX(6px);
	}

	.sv-row-promise {
		font-size: clamp(0.95rem, 1.1vw, 1.1rem);
		line-height: 1.55;
		color: var(--sv-text-muted);
		max-width: 52ch;
	}

	.sv-row-chevron {
		width: 12px;
		height: 12px;
		border-right: 2px solid var(--sv-text-faint);
		border-bottom: 2px solid var(--sv-text-faint);
		transform: rotate(45deg);
		margin-top: 0.6rem;
		transition: transform var(--gl-dur) var(--gl-ease);
	}

	.sv-row.is-open .sv-row-chevron {
		transform: rotate(-135deg);
	}

	/* grid-template-rows 0fr → 1fr anima alto sin conocerlo de antemano. */
	.sv-row-detail {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--gl-dur) var(--gl-ease);
	}

	.sv-row-detail.is-open {
		grid-template-rows: 1fr;
	}

	.sv-row-detail-inner {
		overflow: hidden;
		padding-inline: max(4vw, calc((100% - 1180px) / 2));
	}

	.sv-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
		margin: 0 0 1rem;
	}

	.sv-chip {
		padding: 0.35rem 0.8rem;
		border-radius: var(--gl-r-pill);
		border: 1px solid rgba(127, 227, 245, 0.28);
		font-size: 0.82rem;
		color: var(--sv-text-muted);
	}

	.sv-row-foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1.5rem;
		margin-bottom: clamp(1.25rem, 2.4vw, 1.75rem);
	}
	.sv-row-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 44px;
		padding: 0.55rem 1.2rem;
		border-radius: var(--gl-r-sm);
		border: 1px solid rgba(127, 227, 245, 0.35);
		color: var(--sv-text);
		font-size: 0.88rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			border-color var(--gl-dur) var(--gl-ease),
			background var(--gl-dur) var(--gl-ease);
	}
	.sv-row-link:hover {
		border-color: var(--sv-accent);
		background: rgba(127, 227, 245, 0.07);
	}
	.sv-row-link:focus-visible {
		outline: 2px solid var(--sv-accent);
		outline-offset: 3px;
	}
	.sv-row-link-arrow {
		transition: transform var(--gl-dur) var(--gl-ease);
	}
	.sv-row-link:hover .sv-row-link-arrow {
		transform: translateX(3px);
	}
	.sv-row-entry {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--sv-accent);
		margin: 0;
	}

	/* ── Puertas de entrada ────────────────────────────── */

	.sv-doors {
		padding: clamp(3.5rem, 7vw, 5.5rem) 0;
		background: var(--sv-bg-2);
		border-top: 1px solid var(--sv-rule);
	}

	/*
	 * Una puerta por fila, no dos en paralelo. Las dos ofertas traen volúmenes de
	 * contenido muy distintos —una acaba en un botón y la otra lleva un diagrama—
	 * y al ponerlas en columnas la corta dejaba medio metro de hueco debajo.
	 * Estirarlas a la misma altura tampoco servía: eso ya se probó y abría el
	 * mismo vacío, pero dentro de la tarjeta.
	 *
	 * Cada puerta es ahora un ancho completo con el texto a un lado y su prueba al
	 * otro. El hueco desaparece porque no hay dos columnas que igualar, y cada
	 * oferta recibe el mismo espacio que la otra.
	 */
	.sv-door-grid {
		display: grid;
		gap: 1.25rem;
	}

	.sv-door {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
		gap: clamp(1.5rem, 4vw, 3.5rem);
		align-items: center;
		padding: clamp(1.5rem, 3vw, 2.5rem);
		border: 1px solid var(--sv-rule);
		border-radius: var(--gl-r-md);
		background: rgba(127, 227, 245, 0.03);
	}

	.sv-door-copy {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		align-items: flex-start;
	}

	.sv-door-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}

	.sv-door-desc {
		color: var(--sv-text-muted);
		line-height: 1.6;
		margin: 0;
	}

	/* ── Entregable del diagnóstico ────────────────────── */

	.sv-entrega {
		margin: 0;
		display: grid;
		gap: 0.7rem;
	}

	.sv-entrega-hoja {
		position: relative;
		overflow: hidden;
		padding: 1.3rem 1.35rem 1.1rem;
		border: 1px solid var(--sv-rule);
		border-radius: var(--gl-r-sm);
		background: rgba(127, 227, 245, 0.045);
	}
	/* La banda superior es lo que hace que el bloque se lea como un documento y
	   no como otra tarjeta más dentro de la tarjeta. */
	.sv-entrega-hoja::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--gl-teal-400), var(--sv-accent));
	}

	.sv-entrega-titulo {
		font-family: var(--gl-font-label);
		font-size: 0.64rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--sv-text-faint);
		margin: 0 0 0.9rem;
	}

	.sv-entrega-indice {
		list-style: none;
		margin: 0;
		padding: 0;
		counter-reset: sv-apartado;
	}

	.sv-entrega-indice li {
		counter-increment: sv-apartado;
		display: flex;
		align-items: baseline;
		gap: 0.9rem;
		padding: 0.52rem 0;
		border-top: 1px solid var(--sv-rule);
		font-size: 0.92rem;
		color: var(--sv-text-muted);
	}
	.sv-entrega-indice li:first-child {
		border-top: 0;
		padding-top: 0;
	}

	/* La numeración se pinta con contadores y no viene en el marcado: es
	   ordinal del índice, no contenido que haya que leer en voz alta. */
	.sv-entrega-indice li::before {
		content: counter(sv-apartado, decimal-leading-zero);
		font-family: var(--gl-font-label);
		font-size: 0.6rem;
		color: var(--sv-accent);
	}

	.sv-entrega-pie {
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--sv-text-faint);
	}

	.sv-door-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.5rem;
	}

	.sv-door-list li {
		position: relative;
		padding-left: 1.15rem;
		font-size: 0.92rem;
		color: var(--sv-text-muted);
	}

	.sv-door-list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55em;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--sv-accent);
	}

	/* ── Diagrama del CTO as a Service ─────────────────── */
	.sv-cto {
		margin: 0.5rem 0 0;
		padding: 1.1rem 0.75rem 0.75rem;
		border: 1px solid var(--sv-rule);
		border-radius: var(--gl-r-md);
		background:
			radial-gradient(70% 90% at 50% 38%, rgba(127, 227, 245, 0.07), transparent 70%),
			rgba(127, 227, 245, 0.02);
		width: 100%;
	}
	.sv-cto svg {
		display: block;
		width: 100%;
		height: auto;
	}
	/* El origen y las hojas son de la caja; el nodo es de quien la atiende, así
	   que se lleva el acento. */
	.sv-cto-origen,
	.sv-cto-hoja {
		font-family: var(--gl-font-label);
		font-size: 9px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		fill: var(--sv-text-muted);
	}
	.sv-cto-nodo {
		font-family: var(--gl-font-label);
		font-size: 12px;
		letter-spacing: 0.08em;
		fill: var(--sv-accent);
	}
	.sv-cto-caja {
		fill: rgba(127, 227, 245, 0.06);
		stroke: var(--sv-accent);
		stroke-width: 1;
	}
	.sv-cto-guia {
		fill: none;
		stroke: url(#svCtoLinea);
		stroke-width: 1.1;
		opacity: 0.55;
	}
	.sv-cto-punto {
		fill: var(--sv-accent);
	}
	/* Un pulso baja por cada rama, escalonado: la decisión entra por arriba y
	   sale hacia los tres frentes. Es el mismo gesto que el de la landing. */
	.sv-cto-pulso {
		fill: none;
		stroke: var(--sv-accent);
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-dasharray: 5 23;
		animation: svCtoBajar 2.8s linear infinite;
		animation-delay: var(--d);
	}
	@keyframes svCtoBajar {
		from {
			stroke-dashoffset: 28;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
	.sv-cto-pie {
		margin: 0.75rem 0 0;
		font-size: 0.78rem;
		line-height: 1.5;
		color: var(--sv-text-faint);
		text-align: center;
	}

	.sv-door .sv-btn {
		margin-top: auto;
	}

	/* ── Innovation Lab ────────────────────────────────── */

	.sv-lab {
		padding: clamp(3.5rem, 7vw, 5.5rem) 0;
	}

	/*
	 * El texto no se estira a todo el ancho del contenedor: a 1180 px una línea
	 * de párrafo se vuelve ilegible. La ilustración sí lo ocupa entero.
	 *
	 * El margen NEGATIVO monta el final del texto sobre el inicio de la imagen.
	 * Cae en la banda superior del archivo, que está vacía de lado a lado durante
	 * unos doscientos píxeles, así que no hace falta oscurecer nada para que el
	 * texto se lea encima. Sin ese solape los dos bloques se leían como dos cosas
	 * puestas una tras otra en vez de como una sola composición.
	 *
	 * El solape es constante —lo fija el margen, no el alto del texto—, así que el
	 * titular puede crecer a tres líneas sin comerse el dibujo.
	 */
	.sv-lab-copy {
		position: relative;
		z-index: 2;
		max-width: 46rem;
		margin-bottom: clamp(-11rem, -11vw, -2rem);
	}

	.sv-lab-figura {
		position: relative;
		margin: 0;
	}
	/* El desvanecido vertical va en el contenedor y el horizontal en la imagen:
	   una máscara por elemento se multiplican solas al componerse. */
	.sv-lab-lienzo {
		position: relative;
		-webkit-mask-image: linear-gradient(
			180deg,
			transparent 0%,
			#000 17%,
			#000 89%,
			transparent 100%
		);
		mask-image: linear-gradient(180deg, transparent 0%, #000 17%, #000 89%, transparent 100%);
	}
	.sv-lab-lienzo img {
		display: block;
		width: 100%;
		height: auto;
		-webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 9%, #000 91%, transparent 100%);
		mask-image: linear-gradient(90deg, transparent 0%, #000 9%, #000 91%, transparent 100%);
	}
	/*
	 * EL BORDE DE LA ILUSTRACIÓN
	 *
	 * El archivo no tiene un fondo plano: lleva un resplandor ancho que va de
	 * #01131e en los costados a #012c40 en el centro, y se mantiene así hacia
	 * abajo. La sección sí era plana, y esa diferencia —no el corte— es lo que
	 * dibujaba el rectángulo. Ningún velo corto puede tapar una diferencia que
	 * continúa más allá del borde.
	 *
	 * Así que la sección recibe el mismo resplandor (`.sv-lab-figura::before`) y
	 * la imagen se desvanece con MÁSCARA en vez de con un velo de color encima.
	 * Con el fondo ya no plano, pintar `--sv-bg` sobre los bordes abriría una
	 * banda OSCURA donde antes había una clara: el mismo error al revés. La
	 * máscara no supone nada sobre lo que hay detrás.
	 *
	 * Dos elementos con una máscara cada uno en vez de uno con dos: así no hace
	 * falta `mask-composite`, que es lo único de esta receta que no está en todos
	 * los navegadores que nos importan.
	 */
	.sv-lab-figura::before {
		content: '';
		position: absolute;
		inset: -14% -5%;
		pointer-events: none;
		background: radial-gradient(
			ellipse at 50% 50%,
			rgba(0, 90, 140, 0.26) 0%,
			rgba(0, 90, 140, 0.13) 42%,
			transparent 72%
		);
	}

	/*
	 * Las cinco fases van SOBRE la ilustración, apoyadas en su borde inferior y en
	 * horizontal, para que cada una caiga sobre el tramo que le toca: la lista
	 * deja de ser un bloque suelto y pasa a ser la leyenda de lo que se está
	 * viendo. De paso cubren la franja donde el archivo se funde con la sección,
	 * que es el punto donde el cambio de tono se nota.
	 */
	.sv-flow {
		position: absolute;
		left: 0;
		right: 0;
		bottom: clamp(0.75rem, 2.5vw, 2.25rem);
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(9rem, 100%), 1fr));
		gap: 0.6rem;
	}

	/*
	 * Fondo propio y no solo borde: encima de la ilustración, una etiqueta
	 * transparente compite con los reflejos de las plataformas.
	 *
	 * `cursor: default` porque son rótulos, no párrafos. El cursor de texto
	 * invitaba a seleccionarlos como si fueran contenido que se lee, y a
	 * confundirlos con algo pulsable que no responde.
	 */
	.sv-flow-step {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1.1rem;
		border: 1px solid rgba(127, 227, 245, 0.22);
		border-radius: var(--gl-r-sm);
		background: rgba(7, 26, 34, 0.74);
		backdrop-filter: blur(7px);
		font-weight: 600;
		cursor: default;
	}

	.sv-flow-n {
		font-family: var(--gl-font-label);
		font-size: 0.7rem;
		color: var(--sv-accent);
	}

	/* ── Cierre ────────────────────────────────────────── */

	.sv-close {
		padding: clamp(3.5rem, 7vw, 5.5rem) 0;
		border-top: 1px solid var(--sv-rule);
		background:
			radial-gradient(ellipse at 50% 100%, rgba(8, 131, 160, 0.22), transparent 62%), var(--sv-bg);
	}

	.sv-close-title {
		max-width: 24ch;
	}

	.sv-close-sub {
		margin-bottom: 2rem;
	}

	.sv-close-actions {
		margin: 0;
	}

	/* ── Responsive ────────────────────────────────────── */

	@media (max-width: 900px) {
		/* A una columna: el árbol no cabe al costado y el texto necesita el ancho.
		   La foto sigue detrás, con el velo más cerrado para que el titular aguante
		   sobre la ventana de la ciudad. */
		.sv-hero-inner {
			grid-template-columns: 1fr;
			padding-right: max(2rem, calc((100% - 1180px) / 2));
		}
		.sv-hero-arbol {
			display: none;
		}
		.sv-hero-velo {
			background: linear-gradient(
				180deg,
				rgba(0, 12, 21, 0.62) 0%,
				rgba(0, 12, 21, 0.45) 30%,
				rgba(0, 12, 21, 0.88) 100%
			);
		}
		.sv-process {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.sv-process-line {
			display: none;
		}

		.sv-process-desc {
			max-width: none;
		}

		/* Las puertas se apilan: a este ancho el texto y su prueba no caben uno al
		   lado del otro sin que los dos queden estrechos. */
		.sv-door {
			grid-template-columns: 1fr;
		}

		/* El montaje del Innovation Lab se deshace. Aquí la ilustración mide la
		   mitad de alto y las cinco fases necesitan dos o tres filas: encima de
		   ella no caben, y el texto tampoco tiene banda vacía donde apoyarse. */
		.sv-lab-copy {
			margin-bottom: 1.75rem;
		}

		.sv-flow {
			position: static;
			margin-top: 1rem;
		}
	}

	@media (max-width: 700px) {
		.sv-row {
			grid-template-columns: auto 1fr;
		}

		.sv-row-chevron {
			grid-column: 2;
			justify-self: end;
			margin-top: 0.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sv-row,
		.sv-row::before,
		.sv-row-title,
		.sv-row-chevron,
		.sv-cto-pulso {
			display: none;
		}
		.sv-row-detail,
		.sv-row-link,
		.sv-row-link-arrow,
		.sv-btn {
			transition: none;
		}

		.sv-row:hover .sv-row-title {
			transform: none;
		}

		.sv-btn--primary:hover {
			transform: none;
		}
	}
</style>
