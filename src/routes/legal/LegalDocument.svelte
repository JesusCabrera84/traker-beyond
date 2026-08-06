<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import './legal.css';

	let { doc } = $props();

	let activeSection = $state('');

	/*
		Marcado en línea sin `{@html}`.

		Los textos vienen de un módulo generado, no de entrada de usuario, pero
		renderizarlos como HTML abriría la puerta a que un día alguien alimente esta
		misma plantilla desde la base de datos y se lleve un XSS de regalo. Tokenizar
		cuesta veinte líneas y cierra el asunto para siempre.

		  **negrita**      · énfasis
		  *cursiva*        · matices y aclaraciones
		  [entre corchetes]· dato pendiente de completar; se pinta resaltado
		  /legal/slug      · enlace entre documentos
	*/
	const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]|(\/legal\/[a-z-]+)/g;

	const TITULOS = {
		'/legal/privacidad': 'Aviso de Privacidad',
		'/legal/terminos': 'Términos de Uso',
		'/legal/aviso-legal': 'Aviso Legal',
		'/legal/cookies': 'Política de Cookies'
	};

	function tokens(text) {
		const out = [];
		let last = 0;
		let m;
		INLINE.lastIndex = 0;
		while ((m = INLINE.exec(text)) !== null) {
			if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) });
			if (m[1] !== undefined) out.push({ kind: 'b', text: m[1] });
			else if (m[2] !== undefined) out.push({ kind: 'i', text: m[2] });
			else if (m[3] !== undefined) out.push({ kind: 'ph', text: `[${m[3]}]` });
			else out.push({ kind: 'link', text: TITULOS[m[4]] ?? m[4], href: m[4] });
			last = m.index + m[0].length;
		}
		if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
		return out;
	}

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

{#snippet inline(text)}
	{#each tokens(text) as tk, i (i)}
		{#if tk.kind === 'b'}<strong>{tk.text}</strong>
		{:else if tk.kind === 'i'}<em>{tk.text}</em>
		{:else if tk.kind === 'ph'}<span class="tos-placeholder">{tk.text}</span>
		{:else if tk.kind === 'link'}<a href={tk.href}>{tk.text}</a>
		{:else}{tk.text}{/if}
	{/each}
{/snippet}

{#snippet blocks(list)}
	{#each list as b, i (i)}
		{#if b.t === 'p'}
			<p>{@render inline(b.text)}</p>
		{:else if b.t === 'h3'}
			<h3>{b.text}</h3>
		{:else if b.t === 'ul'}
			<ul>
				{#each b.items as it, i (i)}
					<li>{@render inline(it)}</li>
				{/each}
			</ul>
		{:else if b.t === 'ol'}
			<ol class="tos-ol">
				{#each b.items as it, i (i)}
					<li>{@render inline(it)}</li>
				{/each}
			</ol>
		{:else if b.t === 'table'}
			<div class="tos-table-wrap">
				<table class="tos-table">
					<thead>
						<tr>
							{#each b.head as th, i (i)}
								<th>{@render inline(th)}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each b.rows as row, i (i)}
							<tr>
								{#each row as cell, j (j)}
									<td>{@render inline(cell)}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if b.t === 'note'}
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
					<p class="tos-callout-title">Nota para revisión legal</p>
					<p class="tos-callout-text">{@render inline(b.text)}</p>
				</div>
			</div>
		{:else if b.t === 'accept'}
			<div class="tos-accept">{@render inline(b.text)}</div>
		{/if}
	{/each}
{/snippet}

<svelte:head>
	<title>{doc.titulo} — Geminis Labs</title>
	<meta name="description" content={doc.descripcion} />
</svelte:head>

<div class="tos-page">
	<Navbar />

	<header class="tos-hero">
		<div class="tos-hero-inner">
			<span class="tos-eyebrow">Legal</span>
			<h1 class="tos-h1">{doc.titulo}</h1>
			<div class="tos-meta">
				<span class="tos-meta-item">Última actualización: {doc.actualizado}</span>
			</div>
		</div>
	</header>

	<div class="tos-body">
		<nav class="tos-toc" aria-label="Tabla de contenidos">
			<span class="tos-toc-label">Contenido</span>
			<ul class="tos-toc-list">
				{#each doc.secciones as s (s.id)}
					<li>
						<a href="#{s.id}" class:is-active={activeSection === s.id}>
							{s.num}. {s.titulo}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<main class="tos-content">
			<div class="tos-intro">
				{@render blocks(doc.intro)}
			</div>

			{#each doc.secciones as s (s.id)}
				<section id={s.id} class="tos-section">
					<div class="tos-section-badge">{s.num}</div>
					<h2>{s.titulo}</h2>
					{@render blocks(s.blocks)}
				</section>
			{/each}
		</main>
	</div>

	<Footer />
</div>
