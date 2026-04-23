<script>
	import { formatMxn } from '$lib/utils/currency.js';

	const months = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'];
	const eventData = [18420, 21830, 19640, 24100, 22780, 26340, 28910];
	const costData = [597, 597, 597, 796, 796, 796, 796];
	const maxEvents = Math.max(...eventData);
	const maxCost = Math.max(...costData);

	const summary = {
		eventsMonth: 28910,
		eventsDay: Math.round(28910 / 30),
		devicesCurr: 4,
		costCurr: 796,
		costBase: 597,
		costExtra: 199
	};

	const breakdown = [
		{ label: 'Plan base (1 unidad)', amount: 199, note: 'incluido' },
		{ label: 'Vehículo adicional ×3', amount: 597, note: '+199 c/u' },
		{ label: 'Almacenamiento histórico', amount: 0, note: 'incluido' },
		{ label: 'Soporte técnico', amount: 0, note: 'incluido' }
	];
</script>

<svelte:head><title>Consumo — Nexus | Geminis Labs</title></svelte:head>

<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
	{#each [{ label: 'Eventos este mes', value: summary.eventsMonth.toLocaleString('es-MX'), sub: '↑ 9.7% vs mes anterior', color: '#818cf8', border: 'rgba(99,102,241,0.25)', glow: 'rgba(99,102,241,0.08)' }, { label: 'Promedio diario', value: summary.eventsDay.toLocaleString('es-MX'), sub: 'Registros procesados', color: '#34d399', border: 'rgba(52,211,153,0.25)', glow: 'rgba(52,211,153,0.06)' }, { label: 'Dispositivos', value: summary.devicesCurr, sub: '1 incluido + 3 adicionales', color: '#fbbf24', border: 'rgba(251,191,36,0.25)', glow: 'rgba(251,191,36,0.06)' }, { label: 'Cargo mensual', value: formatMxn(summary.costCurr), sub: 'Sin IVA · ciclo actual', color: '#a5b4fc', border: 'rgba(165,180,252,0.25)', glow: 'rgba(165,180,252,0.06)' }] as k (k.label)}
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
				style="font-size:28px;font-weight:800;color:#fff;line-height:1;margin-bottom:6px;font-variant-numeric:tabular-nums;"
			>
				{k.value}
			</div>
			<div style="font-size:11px;color:#334155;">{k.sub}</div>
		</div>
	{/each}
</div>

<div style="display:grid;grid-template-columns:1fr 320px;gap:14px;margin-bottom:14px;">
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px 22px;"
	>
		<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
			<div>
				<div style="font-size:14px;font-weight:600;color:#e2e8f0;">Volumen de eventos</div>
				<div style="font-size:11px;color:#334155;margin-top:2px;">Últimos 7 meses</div>
			</div>
			<span
				style="display:inline-flex;align-items:center;gap:5px;border-radius:99px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);padding:3px 10px;font-size:11px;font-weight:600;color:#818cf8;"
				>Eventos / mes</span
			>
		</div>

		<div style="display:flex;align-items:flex-end;gap:8px;height:140px;">
			{#each eventData as v, i (i)}
				{@const h = Math.round((v / maxEvents) * 100)}
				<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
					<div style="font-size:9px;color:#334155;font-variant-numeric:tabular-nums;">
						{(v / 1000).toFixed(1)}k
					</div>
					<div
						style="width:100%;border-radius:4px 4px 0 0;background:{i === 6
							? 'linear-gradient(180deg,#818cf8,#6366f1)'
							: 'rgba(99,102,241,0.3)'};height:{h}%;min-height:4px;box-shadow:{i === 6
							? '0 -4px 12px rgba(99,102,241,0.4)'
							: 'none'};transition:height .3s;"
					></div>
				</div>
			{/each}
		</div>
		<div style="display:flex;gap:8px;margin-top:8px;">
			{#each months as m (m)}
				<div style="flex:1;text-align:center;font-size:10px;color:#334155;">{m}</div>
			{/each}
		</div>
	</div>

	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"
	>
		<div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">
			<div style="font-size:14px;font-weight:600;color:#e2e8f0;">Desglose del ciclo</div>
			<div style="font-size:11px;color:#334155;margin-top:2px;">MXN · sin IVA</div>
		</div>
		<div style="padding:8px;">
			{#each breakdown as row (row.label)}
				<div
					style="display:flex;align-items:center;justify-content:space-between;padding:12px 12px;border-radius:8px;margin-bottom:2px;"
				>
					<div>
						<div
							style="font-size:12px;font-weight:500;color:{row.amount > 0 ? '#e2e8f0' : '#475569'};"
						>
							{row.label}
						</div>
						<div style="font-size:10px;color:#334155;margin-top:1px;">{row.note}</div>
					</div>
					<div
						style="font-size:14px;font-weight:700;color:{row.amount > 0
							? '#fff'
							: '#334155'};font-variant-numeric:tabular-nums;"
					>
						{row.amount > 0 ? formatMxn(row.amount) : '—'}
					</div>
				</div>
			{/each}
		</div>

		<div
			style="margin:0 8px 8px;background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.04));border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:14px 12px;display:flex;align-items:center;justify-content:space-between;"
		>
			<div
				style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#818cf8;"
			>
				Total mensual
			</div>
			<div style="font-size:20px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;">
				{formatMxn(summary.costCurr)}
			</div>
		</div>
	</div>
</div>

<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px 22px;margin-bottom:14px;"
>
	<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
		<div>
			<div style="font-size:14px;font-weight:600;color:#e2e8f0;">Historial de cargos</div>
			<div style="font-size:11px;color:#334155;">MXN · últimos 7 meses</div>
		</div>
	</div>

	<div style="display:flex;align-items:flex-end;gap:12px;height:80px;position:relative;">
		<div
			style="position:absolute;top:0;left:0;right:0;height:1px;background:rgba(255,255,255,0.04);"
		></div>
		<div
			style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,0.04);"
		></div>
		{#each costData as v, i (i)}
			{@const h = Math.round((v / maxCost) * 100)}
			<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
				<div style="font-size:9px;color:#334155;font-variant-numeric:tabular-nums;">
					{formatMxn(v)}
				</div>
				<div
					style="width:100%;border-radius:4px 4px 0 0;height:{h}%;min-height:4px;background:{v > 597
						? 'linear-gradient(180deg,#fbbf24,#f59e0b)'
						: 'rgba(251,191,36,0.25)'};box-shadow:{v > 597
						? '0 -4px 10px rgba(251,191,36,0.3)'
						: 'none'};"
				></div>
			</div>
		{/each}
	</div>
	<div style="display:flex;gap:12px;margin-top:8px;">
		{#each months as m (m)}
			<div style="flex:1;text-align:center;font-size:10px;color:#334155;">{m}</div>
		{/each}
	</div>
</div>

<div
	style="display:flex;align-items:flex-start;gap:8px;background:rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:12px 16px;"
>
	<svg
		style="flex-shrink:0;margin-top:1px;"
		width="13"
		height="13"
		fill="none"
		viewBox="0 0 24 24"
		stroke="#334155"
		stroke-width="2"
		><path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		/></svg
	>
	<p style="margin:0;font-size:11px;color:#334155;line-height:1.6;">
		Importes <strong style="color:#475569;">antes de IVA</strong>. El IVA (16%) aplica solo si
		solicitas CFDI. Cargos bajo cláusulas generales
		<strong style="color:#475569;">Nexus by GeminisLabs</strong>. Para ajustar el número de unidades
		contáctanos.
	</p>
</div>
