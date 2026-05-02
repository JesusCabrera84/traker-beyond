<script>
	import { onMount } from 'svelte';

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
	const API_PLATFORM_USAGE_LIMITS_ENDPOINT = '/api/v1/api-platform/usage/limits';

	let limitsData = null;
	let limitsLoading = true;
	let limitsError = null;

	onMount(() => {
		loadLimits();
	});

	function getAuthToken() {
		return sessionStorage.getItem('geminis_id_token') || sessionStorage.getItem('geminis_access_token');
	}

	async function loadLimits() {
		limitsLoading = true;
		limitsError = null;
		try {
			const token = getAuthToken();
			if (!token) throw new Error('No hay sesión activa');
			const res = await fetch(`${API_BASE_URL}${API_PLATFORM_USAGE_LIMITS_ENDPOINT}`, {
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/json'
				}
			});
			if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
			limitsData = await res.json();
		} catch (e) {
			limitsError = e.message;
		} finally {
			limitsLoading = false;
		}
	}

	function hasLimit(limit) {
		return typeof limit === 'number' && Number.isFinite(limit) && limit > 0;
	}

	function pct(used, limit) {
		if (!hasLimit(limit)) return 0;
		return Math.min(100, Math.round((used / limit) * 100));
	}

	function color(p, limit) {
		if (!hasLimit(limit)) return '#818cf8';
		return p >= 90 ? '#f87171' : p >= 70 ? '#fbbf24' : '#4ade80';
	}

	function fmt(n) {
		if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
		return n.toLocaleString('es-MX');
	}

	function fmtQuota(used, limit, unit) {
		if (!hasLimit(limit)) return `${fmt(used)} / sin límite`;
		return `${fmt(used)} / ${fmt(limit)} ${unit}`;
	}

	function fmtPct(used, limit) {
		if (!hasLimit(limit)) return 'Sin límite configurado';
		return `${pct(used, limit)}% utilizado`;
	}

	$: quotas = [
		{
			label: 'Solicitudes / minuto',
			used: limitsData?.rpm_current ?? 0,
			limit: limitsData?.rpm_limit ?? null,
			unit: 'rpm',
			tier: 'Plan actual'
		},
		{
			label: 'Solicitudes / día',
			used: limitsData?.daily_current ?? 0,
			limit: limitsData?.daily_limit ?? null,
			unit: 'req',
			tier: 'Plan actual'
		},
		{
			label: 'Solicitudes / mes',
			used: limitsData?.monthly_current ?? 0,
			limit: limitsData?.monthly_limit ?? null,
			unit: 'req',
			tier: 'Plan actual'
		},
		{
			label: 'Burst máximo',
			used: limitsData?.burst_current ?? 0,
			limit: limitsData?.burst_limit ?? null,
			unit: 'rpm',
			tier: 'Plan actual'
		}
	];

	$: kpis = [
		{
			label: 'Límite por minuto',
			value: hasLimit(limitsData?.rpm_limit)
				? `${fmt(limitsData?.rpm_current ?? 0)} / ${fmt(limitsData?.rpm_limit)}`
				: `${fmt(limitsData?.rpm_current ?? 0)} / sin límite`,
			sub: fmtPct(limitsData?.rpm_current ?? 0, limitsData?.rpm_limit ?? null),
			color: '#818cf8',
			border: 'rgba(99,102,241,0.25)',
			glow: 'rgba(99,102,241,0.08)'
		},
		{
			label: 'Cuota diaria',
			value: hasLimit(limitsData?.daily_limit)
				? `${fmt(limitsData?.daily_current ?? 0)} / ${fmt(limitsData?.daily_limit)}`
				: `${fmt(limitsData?.daily_current ?? 0)} / sin límite`,
			sub: fmtPct(limitsData?.daily_current ?? 0, limitsData?.daily_limit ?? null),
			color: '#34d399',
			border: 'rgba(52,211,153,0.25)',
			glow: 'rgba(52,211,153,0.06)'
		},
		{
			label: 'Cuota mensual',
			value: hasLimit(limitsData?.monthly_limit)
				? `${fmt(limitsData?.monthly_current ?? 0)} / ${fmt(limitsData?.monthly_limit)}`
				: `${fmt(limitsData?.monthly_current ?? 0)} / sin límite`,
			sub: fmtPct(limitsData?.monthly_current ?? 0, limitsData?.monthly_limit ?? null),
			color: '#4ade80',
			border: 'rgba(74,222,128,0.25)',
			glow: 'rgba(74,222,128,0.06)'
		}
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

</script>

<svelte:head><title>Límites — Orion | Geminis Labs</title></svelte:head>

<!-- ───── KPIs ───── -->
{#if limitsError}
	<div
		style="display:flex;align-items:center;gap:8px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 16px;margin-bottom:14px;"
	>
		<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#f87171" stroke-width="2"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
			/></svg
		>
		<span style="font-size:13px;color:#f87171;flex:1;">{limitsError}</span>
		<button
			on:click={loadLimits}
			style="border-radius:8px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);padding:4px 10px;font-size:11px;font-weight:600;color:#f87171;cursor:pointer;"
			>Reintentar</button
		>
	</div>
{/if}

<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;">
	{#if limitsLoading}
		<div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;padding:24px;color:#475569;font-size:13px;gap:10px;">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;"><path stroke-linecap="round" d="M12 2a10 10 0 0110 10"/></svg>
			Cargando límites…
		</div>
	{:else}
	{#each kpis as k (k.label)}
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
	{/if}
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
		{#if limitsLoading}
			<div style="padding:10px 4px;font-size:12px;color:#475569;">Cargando cuotas…</div>
		{:else}
		{#each quotas as q (q.label)}
			{@const p = pct(q.used, q.limit)}
			{@const c = color(p, q.limit)}
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
							{fmtQuota(q.used, q.limit, q.unit)}
						</div>
						<div style="font-size:10px;color:{c};font-weight:600;">{fmtPct(q.used, q.limit)}</div>
					</div>
				</div>
				<div
					style="height:6px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;"
				>
					<div
						style="height:100%;width:{hasLimit(q.limit) ? p : 100}%;border-radius:99px;background:{!hasLimit(q.limit)
							? 'linear-gradient(90deg,#6366f1,#818cf8)'
							: p >= 90
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
		{/if}
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
