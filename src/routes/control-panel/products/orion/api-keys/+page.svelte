<script>
	const keys = [
		{
			id: '1',
			name: 'Producción — ERP',
			prefix: 'or_live_8f3k',
			env: 'live',
			created: '2026-01-12',
			lastUsed: 'hace 2 h',
			requests: 48320,
			status: 'active'
		},
		{
			id: '2',
			name: 'Staging — Backend',
			prefix: 'or_test_2a9x',
			env: 'test',
			created: '2025-11-03',
			lastUsed: 'hace 4 d',
			requests: 1240,
			status: 'active'
		},
		{
			id: '3',
			name: 'Demo interno',
			prefix: 'or_test_9k2m',
			env: 'test',
			created: '2025-08-30',
			lastUsed: 'hace 2 sem',
			requests: 82,
			status: 'inactive'
		}
	];

	const stats = [
		{
			label: 'Claves activas',
			value: 2,
			color: '#4ade80',
			border: 'rgba(74,222,128,0.25)',
			glow: 'rgba(74,222,128,0.06)'
		},
		{
			label: 'Req. hoy',
			value: '1,284',
			color: '#818cf8',
			border: 'rgba(99,102,241,0.25)',
			glow: 'rgba(99,102,241,0.08)'
		},
		{
			label: 'Req. este mes',
			value: '49,642',
			color: '#a5b4fc',
			border: 'rgba(165,180,252,0.25)',
			glow: 'rgba(165,180,252,0.06)'
		},
		{
			label: 'Tasa de error',
			value: '0.03%',
			color: '#34d399',
			border: 'rgba(52,211,153,0.25)',
			glow: 'rgba(52,211,153,0.06)'
		}
	];

	let copied = null;
	function copy(id) {
		copied = id;
		setTimeout(() => (copied = null), 2000);
	}

	function envMeta(e) {
		return e === 'live'
			? {
					color: '#4ade80',
					bg: 'rgba(74,222,128,0.08)',
					border: 'rgba(74,222,128,0.2)',
					label: 'Live'
				}
			: {
					color: '#fbbf24',
					bg: 'rgba(251,191,36,0.08)',
					border: 'rgba(251,191,36,0.2)',
					label: 'Test'
				};
	}
</script>

<svelte:head><title>API Keys — Orion | Geminis Labs</title></svelte:head>

<!-- ───── KPIs ───── -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
	{#each stats as s (s.label)}
		<div
			style="position:relative;overflow:hidden;background:rgba(10,16,26,0.75);border:1px solid {s.border};border-radius:16px;padding:22px 20px;"
		>
			<div
				style="position:absolute;top:-20px;right:-20px;width:70px;height:70px;border-radius:50%;background:{s.glow};pointer-events:none;"
			></div>
			<div
				style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:{s.color};margin-bottom:10px;"
			>
				{s.label}
			</div>
			<div style="font-size:28px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;">
				{s.value}
			</div>
		</div>
	{/each}
</div>

<!-- ───── Banner seguridad ───── -->
<div
	style="display:flex;align-items:flex-start;gap:10px;background:rgba(14,165,233,0.06);border:1px solid rgba(14,165,233,0.2);border-radius:12px;padding:12px 16px;margin-bottom:16px;"
>
	<svg
		style="flex-shrink:0;margin-top:2px;"
		width="15"
		height="15"
		fill="none"
		viewBox="0 0 24 24"
		stroke="#38bdf8"
		stroke-width="2"
		><path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
		/></svg
	>
	<p style="margin:0;font-size:13px;color:#7dd3fc;line-height:1.5;">
		Las claves completas se muestran <strong>una sola vez</strong> al crearlas. Usa entornos
		separados (<code
			style="background:rgba(0,0,0,0.2);padding:1px 5px;border-radius:4px;font-size:12px;"
			>test</code
		>
		vs
		<code style="background:rgba(0,0,0,0.2);padding:1px 5px;border-radius:4px;font-size:12px;"
			>live</code
		>) y rota credenciales periódicamente.
	</p>
</div>

<!-- ───── Header + botón ───── -->
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
	<div style="font-size:14px;font-weight:600;color:#e2e8f0;">Claves de acceso</div>
	<button
		style="display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:none;background:linear-gradient(135deg,#6366f1,#7c3aed);padding:9px 16px;font-size:13px;font-weight:600;color:#fff;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,0.3);"
	>
		<svg
			width="14"
			height="14"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"><path stroke-linecap="round" d="M12 4v16M4 12h16" /></svg
		>
		Nueva API key
	</button>
</div>

<!-- ───── Tabla ───── -->
<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;margin-bottom:14px;"
>
	<div style="overflow-x:auto;">
		<table style="width:100%;min-width:700px;border-collapse:collapse;font-size:13px;">
			<thead>
				<tr style="background:rgba(0,0,0,0.3);">
					{#each ['Nombre', 'Entorno', 'Clave', 'Creada', 'Último uso', 'Solicitudes', 'Estado', ''] as col (col)}
						<th
							style="padding:11px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap;"
							>{col}</th
						>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each keys as k (k.id)}
					{@const env = envMeta(k.env)}
					<tr
						style="border-bottom:1px solid rgba(255,255,255,0.03);{k.status === 'inactive'
							? 'opacity:.6;'
							: ''}"
					>
						<td style="padding:14px 16px;font-size:13px;font-weight:500;color:#e2e8f0;">{k.name}</td
						>
						<td style="padding:14px 16px;">
							<span
								style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid {env.border};background:{env.bg};padding:3px 8px;font-size:10px;font-weight:700;color:{env.color};"
								>{env.label}</span
							>
						</td>
						<td style="padding:14px 16px;">
							<code
								style="display:inline-flex;align-items:center;gap:6px;border-radius:8px;border:1px solid rgba(255,255,255,0.07);background:rgba(0,0,0,0.25);padding:5px 10px;font-family:monospace;font-size:12px;color:#94a3b8;"
							>
								{k.prefix}••••••••
							</code>
						</td>
						<td style="padding:14px 16px;font-size:12px;color:#475569;white-space:nowrap;"
							>{k.created}</td
						>
						<td style="padding:14px 16px;font-size:12px;color:#475569;white-space:nowrap;"
							>{k.lastUsed}</td
						>
						<td
							style="padding:14px 16px;font-size:13px;font-weight:600;color:#94a3b8;font-variant-numeric:tabular-nums;"
							>{k.requests.toLocaleString('es-MX')}</td
						>
						<td style="padding:14px 16px;">
							{#if k.status === 'active'}
								<span
									style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(74,222,128,0.2);background:rgba(74,222,128,0.08);padding:3px 8px;font-size:10px;font-weight:600;color:#4ade80;"
								>
									<span style="width:5px;height:5px;border-radius:50%;background:#4ade80;"
									></span>Activa
								</span>
							{:else}
								<span
									style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(100,116,139,0.2);background:rgba(100,116,139,0.08);padding:3px 8px;font-size:10px;font-weight:600;color:#64748b;"
									>Inactiva</span
								>
							{/if}
						</td>
						<td style="padding:14px 16px;text-align:right;">
							<div style="display:flex;justify-content:flex-end;gap:6px;">
								<button
									on:click={() => copy(k.id)}
									style="border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);padding:5px 10px;font-size:11px;font-weight:600;color:{copied ===
									k.id
										? '#4ade80'
										: '#64748b'};cursor:pointer;transition:color .2s;white-space:nowrap;"
								>
									{copied === k.id ? '✓ Copiado' : 'Copiar prefijo'}
								</button>
								<button
									style="border-radius:8px;border:1px solid rgba(239,68,68,0.15);background:rgba(239,68,68,0.06);padding:5px 10px;font-size:11px;font-weight:600;color:rgba(248,113,113,0.7);cursor:pointer;"
									>Revocar</button
								>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- ───── Uso por clave (mini-barras) ───── -->
<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px 22px;"
>
	<div style="font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:14px;">
		Distribución de solicitudes (mes actual)
	</div>
	{#each keys as k (k.id)}
		{@const pct = Math.round((k.requests / 49642) * 100)}
		<div style="margin-bottom:12px;">
			<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
				<span style="font-size:12px;color:#94a3b8;">{k.name}</span>
				<span
					style="font-size:12px;font-weight:600;color:#e2e8f0;font-variant-numeric:tabular-nums;"
					>{k.requests.toLocaleString('es-MX')}
					<span style="color:#334155;font-weight:400;">({pct}%)</span></span
				>
			</div>
			<div style="height:5px;background:rgba(255,255,255,0.04);border-radius:99px;overflow:hidden;">
				<div
					style="height:100%;width:{pct}%;border-radius:99px;background:{k.env === 'live'
						? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
						: 'rgba(251,191,36,0.5)'};transition:width .4s ease;"
				></div>
			</div>
		</div>
	{/each}
</div>
