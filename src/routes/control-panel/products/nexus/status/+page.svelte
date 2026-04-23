<script>
	import { onMount, onDestroy } from 'svelte';

	let tick = 0;
	let interval;

	const gateways = [
		{ id: 'gw-mty-01', region: 'Monterrey', v: '2.14.0', ok: true, latency: 142, uptime: '99.98%' },
		{ id: 'gw-cdmx-02', region: 'CDMX', v: '2.14.0', ok: true, latency: 98, uptime: '99.99%' },
		{
			id: 'gw-gdl-01',
			region: 'Guadalajara',
			v: '2.13.2',
			ok: false,
			latency: 201,
			uptime: '97.41%'
		}
	];

	const events = [
		{ time: 'hace 12 s', type: 'ingesta', msg: 'Lote procesado — 142 registros', ok: true },
		{ time: 'hace 1 min', type: 'alerta', msg: 'gw-gdl-01 requiere actualización', ok: false },
		{ time: 'hace 3 min', type: 'ingesta', msg: 'Lote procesado — 138 registros', ok: true },
		{ time: 'hace 5 min', type: 'sistema', msg: 'Heartbeat OK — todos los nodos', ok: true },
		{ time: 'hace 8 min', type: 'ingesta', msg: 'Lote procesado — 145 registros', ok: true }
	];

	onMount(() => {
		interval = setInterval(() => {
			tick++;
		}, 1000);
	});
	onDestroy(() => clearInterval(interval));

	$: devicesOnline = 142 + (tick % 3 === 0 ? 1 : 0);
	$: lastIngestaSec = tick % 18;
</script>

<svelte:head><title>Estado — Nexus | Geminis Labs</title></svelte:head>

<!-- ───── KPIs ───── -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
	<!-- Servicio -->
	<div
		style="position:relative;overflow:hidden;background:rgba(10,16,26,0.75);border:1px solid rgba(16,185,129,0.3);border-radius:16px;padding:22px 20px;"
	>
		<div
			style="position:absolute;top:-24px;right:-24px;width:80px;height:80px;border-radius:50%;background:rgba(16,185,129,0.1);pointer-events:none;"
		></div>
		<div
			style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#10b981;margin-bottom:10px;display:flex;align-items:center;gap:6px;"
		>
			<span
				style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;box-shadow:0 0 8px #10b981;"
			></span>
			Servicio
		</div>
		<div style="font-size:26px;font-weight:800;color:#fff;margin-bottom:4px;">Operativo</div>
		<div style="font-size:11px;color:#334155;">0 incidentes · últimas 24 h</div>
	</div>

	<!-- Última ingesta -->
	<div
		style="position:relative;overflow:hidden;background:rgba(10,16,26,0.75);border:1px solid rgba(99,102,241,0.25);border-radius:16px;padding:22px 20px;"
	>
		<div
			style="position:absolute;top:-24px;right:-24px;width:80px;height:80px;border-radius:50%;background:rgba(99,102,241,0.08);pointer-events:none;"
		></div>
		<div
			style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#818cf8;margin-bottom:10px;"
		>
			Última ingesta
		</div>
		<div
			style="font-size:26px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;margin-bottom:4px;"
		>
			hace {lastIngestaSec} s
		</div>
		<div style="font-size:11px;color:#334155;">Promedio 1 h: 1.8 s</div>
	</div>

	<!-- Dispositivos -->
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:22px 20px;"
	>
		<div
			style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#475569;margin-bottom:10px;"
		>
			Dispositivos online
		</div>
		<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
			<span
				style="font-size:32px;font-weight:800;color:#fff;line-height:1;font-variant-numeric:tabular-nums;"
				>{devicesOnline}</span
			>
			<span style="font-size:12px;color:#475569;">/ 180</span>
		</div>
		<div style="height:3px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;">
			<div
				style="height:100%;width:{((devicesOnline / 180) * 100).toFixed(
					0
				)}%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:99px;transition:width .4s ease;"
			></div>
		</div>
	</div>

	<!-- Latencia p95 -->
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:22px 20px;"
	>
		<div
			style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#475569;margin-bottom:10px;"
		>
			Latencia p95
		</div>
		<div
			style="font-size:32px;font-weight:800;color:#34d399;font-variant-numeric:tabular-nums;margin-bottom:4px;"
		>
			186 ms
		</div>
		<div style="font-size:11px;color:#334155;">
			Tasa de error: <span style="color:#4ade80;font-weight:600;">0.02%</span>
		</div>
	</div>
</div>

<!-- ───── Gateways + Actividad ───── -->
<div style="display:grid;grid-template-columns:1fr 340px;gap:14px;margin-bottom:14px;">
	<!-- Gateways -->
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"
	>
		<div
			style="padding:18px 22px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;"
		>
			<div>
				<div style="font-size:14px;font-weight:600;color:#e2e8f0;">Gateways</div>
				<div style="font-size:11px;color:#334155;margin-top:2px;">
					Nodos de procesamiento activos
				</div>
			</div>
			<span
				style="display:inline-flex;align-items:center;gap:5px;border-radius:99px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);padding:4px 10px;font-size:11px;font-weight:600;color:#4ade80;"
			>
				<span style="width:5px;height:5px;border-radius:50%;background:#4ade80;"></span>
				3 activos
			</span>
		</div>
		<div style="padding:8px;">
			{#each gateways as gw (gw.id)}
				<div
					style="display:flex;align-items:center;gap:14px;padding:14px 14px;border-radius:10px;margin-bottom:4px;background:{gw.ok
						? 'rgba(255,255,255,0.02)'
						: 'rgba(245,158,11,0.04)'};border:1px solid {gw.ok
						? 'rgba(255,255,255,0.04)'
						: 'rgba(245,158,11,0.15)'};"
				>
					<!-- Indicador -->
					<div
						style="width:8px;height:8px;border-radius:50%;background:{gw.ok
							? '#10b981'
							: '#f59e0b'};box-shadow:0 0 10px {gw.ok ? '#10b981' : '#f59e0b'};flex-shrink:0;"
					></div>
					<!-- Info -->
					<div style="flex:1;min-width:0;">
						<div style="font-family:monospace;font-size:13px;font-weight:600;color:#e2e8f0;">
							{gw.id}
						</div>
						<div style="font-size:11px;color:#475569;">{gw.region}</div>
					</div>
					<!-- Latencia -->
					<div style="text-align:right;">
						<div
							style="font-size:13px;font-weight:600;color:{gw.latency < 150
								? '#4ade80'
								: gw.latency < 200
									? '#fbbf24'
									: '#f87171'};font-variant-numeric:tabular-nums;"
						>
							{gw.latency} ms
						</div>
						<div style="font-size:10px;color:#334155;">latencia</div>
					</div>
					<!-- Uptime -->
					<div style="text-align:right;width:60px;">
						<div style="font-size:13px;font-weight:600;color:#94a3b8;">{gw.uptime}</div>
						<div style="font-size:10px;color:#334155;">uptime</div>
					</div>
					<!-- Versión / badge -->
					<div>
						{#if !gw.ok}
							<span
								style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.1);padding:3px 8px;font-size:10px;font-weight:700;color:#fbbf24;white-space:nowrap;"
							>
								↑ v{gw.v}
							</span>
						{:else}
							<span
								style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);padding:3px 8px;font-size:10px;font-weight:600;color:#475569;white-space:nowrap;"
							>
								v{gw.v}
							</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Señales + Cola -->
	<div style="display:flex;flex-direction:column;gap:12px;">
		<div
			style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px 20px;flex:1;"
		>
			<div style="font-size:12px;font-weight:600;color:#e2e8f0;margin-bottom:14px;">
				Métricas en tiempo real
			</div>
			<dl style="margin:0;display:flex;flex-direction:column;gap:0;">
				{#each [{ label: 'Registros / min', value: '~482', color: '#a5b4fc' }, { label: 'Cola de eventos', value: 'Estable', color: '#4ade80' }, { label: 'CPU promedio', value: '14%', color: '#94a3b8' }, { label: 'RAM promedio', value: '38%', color: '#94a3b8' }] as m (m.label)}
					<div
						style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);"
					>
						<dt style="font-size:12px;color:#475569;">{m.label}</dt>
						<dd
							style="margin:0;font-size:13px;font-weight:600;color:{m.color};font-variant-numeric:tabular-nums;"
						>
							{m.value}
						</dd>
					</div>
				{/each}
			</dl>
		</div>
		<div
			style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px 20px;"
		>
			<div
				style="font-size:11px;font-weight:600;color:#334155;margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em;"
			>
				Disponibilidad 30 d
			</div>
			<div style="display:flex;gap:3px;">
				{#each Array(30) as _, i (i)}
					<div
						style="flex:1;height:28px;border-radius:3px;background:{i === 28
							? 'rgba(245,158,11,0.6)'
							: i === 15
								? 'rgba(239,68,68,0.4)'
								: 'rgba(16,185,129,0.5)'};"
					></div>
				{/each}
			</div>
			<div style="display:flex;justify-content:space-between;margin-top:6px;">
				<span style="font-size:10px;color:#334155;">30 d atrás</span>
				<span style="font-size:10px;color:#4ade80;font-weight:700;">99.81% SLA</span>
				<span style="font-size:10px;color:#334155;">Hoy</span>
			</div>
		</div>
	</div>
</div>

<!-- ───── Feed de actividad ───── -->
<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"
>
	<div
		style="padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;"
	>
		<div style="font-size:14px;font-weight:600;color:#e2e8f0;">Actividad reciente</div>
		<span style="font-size:11px;color:#334155;">Actualización automática</span>
	</div>
	<div style="padding:8px;">
		{#each events as ev, i (i)}
			<div
				style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:8px;margin-bottom:2px;{i ===
				0
					? 'background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.12);'
					: ''}"
			>
				<div
					style="width:8px;height:8px;border-radius:50%;background:{ev.ok
						? '#10b981'
						: '#f59e0b'};flex-shrink:0;"
				></div>
				<div style="flex:1;font-size:13px;color:{i === 0 ? '#e2e8f0' : '#94a3b8'};">{ev.msg}</div>
				<div style="font-size:11px;color:#334155;white-space:nowrap;">{ev.time}</div>
				<span
					style="display:inline-flex;border-radius:99px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);padding:2px 8px;font-size:10px;color:#475569;white-space:nowrap;"
					>{ev.type}</span
				>
			</div>
		{/each}
	</div>
</div>
