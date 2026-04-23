<script>
	let search = '';
	let filterStatus = 'all';

	const devices = [
		{
			id: 'NX-4821',
			unit: 'Unidad Norte 01',
			imei: '354811099123456',
			model: 'GT06N-4G',
			fw: '3.2.1',
			status: 'online',
			signal: 4,
			lat: 25.6866,
			lng: -100.3161,
			lastSeen: 'hace 8 s',
			bat: 92
		},
		{
			id: 'NX-4822',
			unit: 'Unidad Norte 02',
			imei: '354811099234567',
			model: 'GT06N-4G',
			fw: '3.2.1',
			status: 'online',
			signal: 3,
			lat: 25.6712,
			lng: -100.3089,
			lastSeen: 'hace 22 s',
			bat: 78
		},
		{
			id: 'NX-4823',
			unit: 'Logística Sur A',
			imei: '354811099345678',
			model: 'TK915',
			fw: '3.1.0',
			status: 'idle',
			signal: 4,
			lat: 20.6597,
			lng: -103.3496,
			lastSeen: 'hace 4 min',
			bat: 55
		},
		{
			id: 'NX-4824',
			unit: 'Ruta Occidente 3',
			imei: '354811099456789',
			model: 'TK915',
			fw: '3.2.1',
			status: 'online',
			signal: 2,
			lat: 20.6714,
			lng: -103.3682,
			lastSeen: 'hace 11 s',
			bat: 41
		},
		{
			id: 'NX-4825',
			unit: 'Flotilla Centro 1',
			imei: '354811099567890',
			model: 'GT06N-4G',
			fw: '3.2.1',
			status: 'offline',
			signal: 0,
			lat: 19.4326,
			lng: -99.1332,
			lastSeen: 'hace 3 h',
			bat: 12
		},
		{
			id: 'NX-4826',
			unit: 'Flotilla Centro 2',
			imei: '354811099678901',
			model: 'TK915',
			fw: '3.1.0',
			status: 'online',
			signal: 4,
			lat: 19.4271,
			lng: -99.1678,
			lastSeen: 'hace 5 s',
			bat: 88
		},
		{
			id: 'NX-4827',
			unit: 'Reparto Bajío 01',
			imei: '354811099789012',
			model: 'GT06N-4G',
			fw: '3.2.1',
			status: 'idle',
			signal: 3,
			lat: 21.019,
			lng: -101.2574,
			lastSeen: 'hace 9 min',
			bat: 66
		}
	];

	const counts = {
		online: devices.filter((d) => d.status === 'online').length,
		idle: devices.filter((d) => d.status === 'idle').length,
		offline: devices.filter((d) => d.status === 'offline').length
	};

	$: filtered = devices.filter((d) => {
		const matchSearch =
			!search ||
			d.unit.toLowerCase().includes(search.toLowerCase()) ||
			d.id.toLowerCase().includes(search.toLowerCase());
		const matchStatus = filterStatus === 'all' || d.status === filterStatus;
		return matchSearch && matchStatus;
	});

	function statusMeta(s) {
		if (s === 'online')
			return {
				color: '#4ade80',
				bg: 'rgba(74,222,128,0.08)',
				border: 'rgba(74,222,128,0.2)',
				label: 'En línea'
			};
		if (s === 'idle')
			return {
				color: '#fbbf24',
				bg: 'rgba(251,191,36,0.08)',
				border: 'rgba(251,191,36,0.2)',
				label: 'Detenido'
			};
		return {
			color: '#f87171',
			bg: 'rgba(248,113,113,0.08)',
			border: 'rgba(248,113,113,0.2)',
			label: 'Sin señal'
		};
	}

	function signalBars(n) {
		return [1, 2, 3, 4].map((i) => i <= n);
	}
	function batColor(b) {
		return b > 50 ? '#4ade80' : b > 20 ? '#fbbf24' : '#f87171';
	}
</script>

<svelte:head><title>Dispositivos — Nexus | Geminis Labs</title></svelte:head>

<!-- ───── KPIs ───── -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
	{#each [{ label: 'Total', value: devices.length, color: '#818cf8', border: 'rgba(99,102,241,0.25)', glow: 'rgba(99,102,241,0.08)' }, { label: 'En línea', value: counts.online, color: '#4ade80', border: 'rgba(74,222,128,0.25)', glow: 'rgba(74,222,128,0.08)' }, { label: 'Detenidos', value: counts.idle, color: '#fbbf24', border: 'rgba(251,191,36,0.25)', glow: 'rgba(251,191,36,0.06)' }, { label: 'Sin señal', value: counts.offline, color: '#f87171', border: 'rgba(248,113,113,0.25)', glow: 'rgba(248,113,113,0.06)' }] as k (k.label)}
		<div
			style="position:relative;overflow:hidden;background:rgba(10,16,26,0.75);border:1px solid {k.border};border-radius:16px;padding:22px 20px;"
		>
			<div
				style="position:absolute;top:-20px;right:-20px;width:70px;height:70px;border-radius:50%;background:{k.glow};pointer-events:none;"
			></div>
			<div
				style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:{k.color};margin-bottom:8px;"
			>
				{k.label}
			</div>
			<div
				style="font-size:36px;font-weight:800;color:#fff;line-height:1;font-variant-numeric:tabular-nums;"
			>
				{k.value}
			</div>
		</div>
	{/each}
</div>

<!-- ───── Filtros ───── -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
	<!-- Buscador -->
	<div style="position:relative;flex:1;min-width:220px;">
		<svg
			style="position:absolute;left:12px;top:50%;transform:translateY(-50%);"
			width="14"
			height="14"
			fill="none"
			viewBox="0 0 24 24"
			stroke="#475569"
			stroke-width="2"
			><circle cx="11" cy="11" r="8" /><path stroke-linecap="round" d="M21 21l-4.35-4.35" /></svg
		>
		<input
			bind:value={search}
			placeholder="Buscar unidad o ID…"
			style="width:100%;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(10,16,26,0.6);padding:9px 12px 9px 34px;font-size:13px;color:#e2e8f0;outline:none;box-sizing:border-box;"
		/>
	</div>
	<!-- Filtros estado -->
	<div
		style="display:flex;gap:4px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:4px;"
	>
		{#each [['all', 'Todos'], ['online', 'En línea'], ['idle', 'Detenido'], ['offline', 'Sin señal']] as [val, lbl] (val)}
			<button
				on:click={() => (filterStatus = val)}
				style="border-radius:7px;border:none;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;background:{filterStatus ===
				val
					? 'linear-gradient(135deg,#6366f1,#7c3aed)'
					: 'transparent'};color:{filterStatus === val ? '#fff' : '#64748b'};"
			>
				{lbl}
			</button>
		{/each}
	</div>
	<button
		disabled
		style="display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:none;background:linear-gradient(135deg,#6366f1,#7c3aed);padding:9px 16px;font-size:13px;font-weight:600;color:#fff;opacity:.5;cursor:not-allowed;"
	>
		<svg
			width="14"
			height="14"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"><path stroke-linecap="round" d="M12 4v16M4 12h16" /></svg
		>
		Añadir dispositivo
	</button>
</div>

<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"
>
	<div style="overflow-x:auto;">
		<table style="width:100%;min-width:800px;border-collapse:collapse;font-size:13px;">
			<thead>
				<tr style="background:rgba(0,0,0,0.3);">
					{#each ['ID', 'Unidad', 'Modelo', 'Firmware', 'Señal', 'Batería', 'Última vez', 'Estado', ''] as col (col)}
						<th
							style="padding:11px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap;"
							>{col}</th
						>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each filtered as d (d.id)}
					{@const st = statusMeta(d.status)}
					<tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
						<td
							style="padding:14px 16px;font-family:monospace;font-size:12px;font-weight:600;color:#818cf8;"
							>{d.id}</td
						>
						<td style="padding:14px 16px;">
							<div style="font-size:13px;font-weight:500;color:#e2e8f0;">{d.unit}</div>
							<div style="font-size:10px;color:#334155;font-family:monospace;margin-top:2px;">
								{d.imei}
							</div>
						</td>
						<td style="padding:14px 16px;color:#94a3b8;">{d.model}</td>
						<td style="padding:14px 16px;font-family:monospace;font-size:12px;color:#475569;"
							>v{d.fw}</td
						>
						<!-- Señal -->
						<td style="padding:14px 16px;">
							<div style="display:flex;align-items:flex-end;gap:2px;height:14px;">
								{#each signalBars(d.signal) as on, i (i)}
									<div
										style="width:4px;height:{6 + i * 3}px;border-radius:1px;background:{on
											? '#818cf8'
											: 'rgba(255,255,255,0.08)'};"
									></div>
								{/each}
							</div>
						</td>
						<!-- Batería -->
						<td style="padding:14px 16px;">
							<div style="display:flex;align-items:center;gap:6px;">
								<div
									style="width:30px;height:10px;border-radius:3px;border:1px solid rgba(255,255,255,0.12);overflow:hidden;position:relative;"
								>
									<div
										style="height:100%;width:{d.bat}%;background:{batColor(
											d.bat
										)};border-radius:2px;transition:width .3s;"
									></div>
								</div>
								<span
									style="font-size:11px;color:{batColor(d.bat)};font-variant-numeric:tabular-nums;"
									>{d.bat}%</span
								>
							</div>
						</td>
						<td style="padding:14px 16px;font-size:12px;color:#475569;white-space:nowrap;"
							>{d.lastSeen}</td
						>
						<td style="padding:14px 16px;">
							<span
								style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid {st.border};background:{st.bg};padding:3px 8px;font-size:11px;font-weight:600;color:{st.color};white-space:nowrap;"
							>
								<span
									style="width:5px;height:5px;border-radius:50%;background:{st.color};flex-shrink:0;"
								></span>
								{st.label}
							</span>
						</td>
						<td style="padding:14px 16px;text-align:right;">
							<button
								style="border-radius:7px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);padding:5px 10px;font-size:11px;font-weight:500;color:#64748b;cursor:pointer;"
								>Ver</button
							>
						</td>
					</tr>
				{/each}
				{#if filtered.length === 0}
					<tr>
						<td
							colspan="9"
							style="padding:48px 16px;text-align:center;color:#334155;font-size:13px;"
							>Sin resultados para la búsqueda.</td
						>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
	<div
		style="padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);font-size:11px;color:#334155;"
	>
		{filtered.length} de {devices.length} dispositivos
	</div>
</div>
