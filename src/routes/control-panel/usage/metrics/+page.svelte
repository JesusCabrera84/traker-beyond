<script>
	const period = 'Últimas 24 h';

	const kpis = [
		{
			label: 'Peticiones',
			value: '184.2k',
			delta: '+12%',
			color: '#34d399',
			border: 'rgba(52,211,153,0.25)',
			glow: 'rgba(52,211,153,0.08)'
		},
		{
			label: 'Errores 5xx',
			value: '0.04%',
			delta: '−0.01%',
			color: '#fbbf24',
			border: 'rgba(251,191,36,0.25)',
			glow: 'rgba(251,191,36,0.06)'
		},
		{
			label: 'Latencia p95',
			value: '142 ms',
			delta: '+8 ms',
			color: '#818cf8',
			border: 'rgba(129,140,248,0.25)',
			glow: 'rgba(99,102,241,0.08)'
		},
		{
			label: 'Ancho de banda',
			value: '38 GB',
			delta: '+4%',
			color: '#38bdf8',
			border: 'rgba(56,189,248,0.25)',
			glow: 'rgba(56,189,248,0.08)'
		}
	];

	const hourly = [
		12, 18, 9, 22, 31, 28, 35, 42, 38, 45, 52, 48, 55, 62, 58, 64, 70, 66, 72, 68, 75, 80, 76, 82
	];
	const maxH = Math.max(...hourly, 1);
</script>

<svelte:head><title>Métricas — Uso | Geminis Labs</title></svelte:head>

<div
	style="display:flex;align-items:flex-start;gap:10px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:12px 16px;margin-bottom:20px;"
>
	<svg
		style="flex-shrink:0;margin-top:2px;"
		width="15"
		height="15"
		fill="none"
		viewBox="0 0 24 24"
		stroke="#f59e0b"
		stroke-width="2"
		><path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		/></svg
	>
	<p style="margin:0;font-size:13px;color:#fbbf24;line-height:1.5;">
		<strong>Datos de ejemplo.</strong> Conecta tu pipeline de métricas (Prometheus, Datadog, etc.) para
		series en vivo.
	</p>
</div>

<div
	style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;"
>
	<h2 style="margin:0;font-size:15px;font-weight:600;color:#e2e8f0;">Resumen · {period}</h2>
	<span
		style="font-size:11px;font-weight:600;color:#64748b;border:1px solid rgba(255,255,255,0.08);border-radius:99px;padding:4px 12px;background:rgba(0,0,0,0.25);"
		>Zona horaria: America/Mexico_City</span
	>
</div>

<div
	style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:24px;"
>
	{#each kpis as k (k.label)}
		<div
			style="position:relative;overflow:hidden;background:rgba(10,16,26,0.75);border:1px solid {k.border};border-radius:16px;padding:20px 18px;"
		>
			<div
				style="position:absolute;top:-18px;right:-18px;width:64px;height:64px;border-radius:50%;background:{k.glow};pointer-events:none;"
			></div>
			<div
				style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:{k.color};margin-bottom:8px;"
			>
				{k.label}
			</div>
			<div style="font-size:28px;font-weight:800;color:#fff;line-height:1;margin-bottom:4px;">
				{k.value}
			</div>
			<div style="font-size:12px;color:#475569;">vs. ayer {k.delta}</div>
		</div>
	{/each}
</div>

<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:22px 20px 18px;margin-bottom:20px;"
>
	<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
		<span style="font-size:13px;font-weight:600;color:#cbd5e1;">Peticiones por hora</span>
		<span style="font-size:11px;color:#475569;">Orion + Nexus agregado</span>
	</div>
	<div style="display:flex;align-items:flex-end;gap:4px;height:140px;padding-top:8px;">
		{#each hourly as h, i (i)}
			<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
				<div
					style="width:100%;max-width:14px;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,#10b981,#047857);height:{Math.round(
						(h / maxH) * 110
					)}px;min-height:4px;opacity:0.85;"
					title="{h}k"
				></div>
				<span style="font-size:9px;color:#334155;font-variant-numeric:tabular-nums;">{i}</span>
			</div>
		{/each}
	</div>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;">
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;"
	>
		<h3 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#e2e8f0;">Top rutas</h3>
		<ul style="margin:0;padding:0;list-style:none;">
			{#each [{ r: '/v1/telemetry/batch', n: '42%' }, { r: '/v1/devices', n: '19%' }, { r: '/v1/geofences', n: '11%' }] as row (row.r)}
				<li
					style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;"
				>
					<span style="font-family:monospace;color:#94a3b8;">{row.r}</span>
					<span style="font-weight:600;color:#34d399;">{row.n}</span>
				</li>
			{/each}
		</ul>
	</div>
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;"
	>
		<h3 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#e2e8f0;">Códigos HTTP</h3>
		<ul style="margin:0;padding:0;list-style:none;">
			{#each [{ c: '2xx', p: '98.2%', col: '#4ade80' }, { c: '4xx', p: '1.5%', col: '#fbbf24' }, { c: '5xx', p: '0.3%', col: '#f87171' }] as row (row.c)}
				<li
					style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;"
				>
					<span style="color:#64748b;">{row.c}</span>
					<span style="font-weight:700;color:{row.col};">{row.p}</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
