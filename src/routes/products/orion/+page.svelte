<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import './orion.css';

	const pageTitle = 'Orion by Geminis Labs — Plataforma de APIs y datos';
	const pageDescription =
		'APIs seguras, webhooks y gobierno de integraciones para conectar tu operación con Geminis Labs.';

	const pillars = [
		{
			title: 'APIs REST coherentes',
			body: 'Autenticación por claves de organización, versionado claro y respuestas predecibles para integrar ERP, apps y socios logísticos.'
		},
		{
			title: 'Webhooks firmados',
			body: 'Eventos de negocio entregados a tus endpoints con verificación criptográfica y reintentos controlados.'
		},
		{
			title: 'Cuotas y observabilidad',
			body: 'Límites por ambiente, métricas de uso y trazas para diagnosticar latencias o errores sin adivinar.'
		},
		{
			title: 'Pensado para escalar',
			body: 'Desde pruebas en sandbox hasta producción regional, con el mismo contrato y herramientas de gobierno.'
		}
	];

	/** @param {HTMLVideoElement} node */
	function lazyVideo(node, src) {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					node.src = src;
					node.load();
					const p = node.play();
					if (p !== undefined) p.catch(() => {});
					observer.unobserve(node);
				}
			},
			{ rootMargin: '400px' }
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<div class="orion-page-root">
	<Navbar />

	<section class="orion-hero" aria-labelledby="orion-hero-title">
		<div class="orion-hero-video-wrap" aria-hidden="true">
			<video muted playsinline loop use:lazyVideo={'/img/products/orion/planeta-tierra.webm'}
			></video>
		</div>
		<div class="orion-hero-foreground">
			<div class="orion-hero-brand" aria-hidden="true">
				<img
					class="orion-hero-logo"
					src="/img/products/logo-orion.png"
					alt=""
					width="200"
					height="200"
				/>
			</div>
			<div class="orion-hero-inner">
				<h1 id="orion-hero-title" class="orion-hero-title">Orion</h1>
				<p class="orion-hero-lead">
					Capa de integración de Geminis Labs: expón y consume datos de flota, facturación y eventos
					operativos con seguridad de nivel empresarial.
				</p>
				<div class="orion-hero-actions">
					<a class="orion-btn orion-btn-primary" href="/control-panel/products/orion/api-keys">
						Gestionar en panel
					</a>
					<a class="orion-btn orion-btn-ghost" href="/#productos">← Volver a productos</a>
				</div>
			</div>
		</div>
	</section>

	<section class="orion-section" aria-labelledby="orion-cap-title">
		<h2 id="orion-cap-title">Qué resuelve Orion</h2>
		<p class="section-lead">
			Orion unifica el acceso programático a tus datos y procesos: menos acoplamientos frágiles y
			más control sobre quién llama qué, cuándo y desde dónde.
		</p>
		<div class="orion-grid">
			{#each pillars as block (block.title)}
				<article class="orion-card">
					<h3>{block.title}</h3>
					<p>{block.body}</p>
				</article>
			{/each}
		</div>
	</section>

	<div class="orion-cta-band">
		<p>
			¿Ya tienes cuenta? Abre el panel de <strong>Orion</strong> para API keys, límites, logs y playground.
			Si aún no, contáctanos desde la landing principal.
		</p>
		<a class="orion-btn orion-btn-primary" href="/control-panel/products/orion/api-keys"
			>Ir a API Keys</a
		>
	</div>

	<Footer />
</div>
