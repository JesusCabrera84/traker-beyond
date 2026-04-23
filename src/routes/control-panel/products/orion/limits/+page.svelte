<script>
	const quotas = [
		{ label: 'Solicitudes / minuto', used: 142, limit: 300, unit: 'rpm', tier: 'Plan actual' },
		{ label: 'Solicitudes / día', used: 1284, limit: 10000, unit: 'req', tier: 'Plan actual' },
		{ label: 'Solicitudes / mes', used: 49642, limit: 250000, unit: 'req', tier: 'Plan actual' },
		{ label: 'Burst máximo', used: 18, limit: 50, unit: 'rpm', tier: 'Plan actual' }
	];

	const history = [
		{ date: '2026-04-22', peak: 142, avg: 38 },
		{ date: '2026-04-21', peak: 198, avg: 51 },
		{ date: '2026-04-20', peak: 176, avg: 44 },
		{ date: '2026-04-19', peak: 89, avg: 22 },
		{ date: '2026-04-18', peak: 201, avg: 55 },
		{ date: '2026-04-17', peak: 167, avg: 41 },
		{ date: '2026-04-16', peak: 134, avg: 33 }
	];
	const maxPeak = Math.max(...history.map((h) => h.peak));

	function pct(used, limit) {
		return Math.min(100, Math.round((used / limit) * 100));
	}
	function color(p) {
		return p >= 90 ? '#f87171' : p >= 70 ? '#fbbf24' : '#4ade80';
	}
	function fmt(n) {
		return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : String(n);
	}
</script>

<svelte:head><title>Límites — Orion | Geminis Labs</title></svelte:head>

<!-- ───── KPIs ───── -->
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;">
	{#each [{ label: 'Plan', value: 'Growth', sub: 'Solicitudes ilimitadas próximamente', color: '#818cf8', border: 'rgba(99,102,241,0.25)', glow: 'rgba(99,102,241,0.08)' }, { label: 'Cuota mensual', value: '49,642 / 250k', sub: '20% consumido', color: '#34d399', border: 'rgba(52,211,153,0.25)', glow: 'rgba(52,211,153,0.06)' }, { label: 'Throttle hoy', value: '0 eventos', sub: 'Sin límites alcanzados', color: '#4ade80', border: 'rgba(74,222,128,0.25)', glow: 'rgba(74,222,128,0.06)' }] as k (k.label)}
		<div
			style="position:relative;overflow:hidden;background:rgba(10,16,26,0.75);border:1px solid {k.border};border-radius:16px;padding:22px 20px;"
		>
			<div
				style="position:absolute;top:-20px;right:-20px;width:70px;height:70px;border-radius:50%;background:{k.glow};pointer-events:none;"
			></div>
			<div
				style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:{k.color};margin-bottom:10px;"
			>
				{k.label}
			</div>
			<div
				style="font-size:24px;font-weight:800;color:#fff;margin-bottom:4px;font-variant-numeric:tabular-nums;"
			>
				{k.value}
			</div>
			<div style="font-size:11px;color:#334155;">{k.sub}</div>
		</div>
	{/each}
</div>

<!-- ───── Cuotas detalladas ───── -->
<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;margin-bottom:14px;"
>
	<div style="padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.05);">
		<div style="font-size:14px;font-weight:600;color:#e2e8f0;">Cuotas de API</div>
		<div style="font-size:11px;color:#334155;margin-top:2px;">
			Consumo actual vs límite del plan
		</div>
	</div>
	<div style="padding:16px;">
		{#each quotas as q (q.label)}
			{@const p = pct(q.used, q.limit)}
			{@const c = color(p)}
			<div style="margin-bottom:20px;">
				<div
					style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;"
				>
					<div>
						<div style="font-size:13px;font-weight:500;color:#e2e8f0;">{q.label}</div>
						<div style="font-size:10px;color:#475569;margin-top:1px;">{q.tier}</div>
					</div>
					<div style="text-align:right;">
						<div
							style="font-size:13px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums;"
						>
							{fmt(q.used)}
							<span style="color:#334155;font-weight:400;">/ {fmt(q.limit)} {q.unit}</span>
						</div>
						<div style="font-size:10px;color:{c};font-weight:600;">{p}% utilizado</div>
					</div>
				</div>
				<div
					style="height:6px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;"
				>
					<div
						style="height:100%;width:{p}%;border-radius:99px;background:{p >= 90
							? 'linear-gradient(90deg,#ef4444,#f87171)'
							: p >= 70
								? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
								: 'linear-gradient(90deg,#10b981,#34d399)'};box-shadow:{p >= 70
							? '0 0 8px ' + c
							: 'none'};transition:width .4s ease;"
					></div>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- ───── Historial de picos ───── -->
<div style="display:grid;grid-template-columns:1fr 280px;gap:14px;">
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px 22px;"
	>
		<div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:4px;">
			Picos de solicitudes (rpm)
		</div>
		<div style="font-size:11px;color:#334155;margin-bottom:20px;">Últimos 7 días</div>
		<div style="display:flex;align-items:flex-end;gap:10px;height:100px;">
			{#each history as h, i (h.date)}
				{@const ph = Math.round((h.peak / maxPeak) * 100)}
				{@const ah = Math.round((h.avg / maxPeak) * 100)}
				<div
					style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;"
				>
					<div style="flex:1;width:100%;display:flex;align-items:flex-end;gap:2px;">
						<div
							style="flex:1;border-radius:3px 3px 0 0;height:{ph}%;background:{i === 0
								? 'linear-gradient(180deg,#818cf8,#6366f1)'
								: 'rgba(99,102,241,0.3)'};min-height:3px;"
						></div>
						<div
							style="flex:1;border-radius:3px 3px 0 0;height:{ah}%;background:rgba(255,255,255,0.08);min-height:2px;"
						></div>
					</div>
					<div style="font-size:9px;color:#334155;">{h.date.slice(5)}</div>
				</div>
			{/each}
		</div>
		<div
			style="display:flex;align-items:center;gap:16px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.04);"
		>
			<div style="display:flex;align-items:center;gap:6px;">
				<div style="width:10px;height:10px;border-radius:2px;background:#6366f1;"></div>
				<span style="font-size:11px;color:#475569;">Pico</span>
			</div>
			<div style="display:flex;align-items:center;gap:6px;">
				<div
					style="width:10px;height:10px;border-radius:2px;background:rgba(255,255,255,0.15);"
				></div>
				<span style="font-size:11px;color:#475569;">Promedio</span>
			</div>
		</div>
	</div>

	<!-- Alertas de umbral -->
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px 20px;"
	>
		<div style="font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:14px;">
			Alertas de umbral
		</div>
		{#each [{ label: '80% cuota mensual', active: false, threshold: '200,000 req' }, { label: 'Burst sostenido', active: false, threshold: '> 200 rpm / 5 min' }, { label: 'Error rate > 5%', active: true, threshold: 'Último 1 h' }] as alert (alert.label)}
			<div
				style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);"
			>
				<!-- Toggle simulado -->
				<div
					style="width:32px;height:18px;border-radius:99px;background:{alert.active
						? 'rgba(99,102,241,0.8)'
						: 'rgba(255,255,255,0.08)'};position:relative;flex-shrink:0;cursor:pointer;"
				>
					<div
						style="position:absolute;top:2px;left:{alert.active
							? '14px'
							: '2px'};width:14px;height:14px;border-radius:50%;background:#fff;transition:left .2s;"
					></div>
				</div>
				<div>
					<div style="font-size:12px;font-weight:500;color:{alert.active ? '#e2e8f0' : '#475569'};">
						{alert.label}
					</div>
					<div style="font-size:10px;color:#334155;">{alert.threshold}</div>
				</div>
			</div>
		{/each}
		<div style="margin-top:14px;">
			<button
				disabled
				style="width:100%;border-radius:9px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);padding:9px;font-size:12px;font-weight:600;color:#818cf8;cursor:not-allowed;opacity:.5;"
			>
				Configurar alertas
			</button>
		</div>
	</div>
</div>
