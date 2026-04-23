<script>
	let filterStatus = 'all';
	let filterMethod = 'all';
	let search = '';

	const logs = [
		{
			id: 'req_001',
			ts: '14:32:18.821',
			method: 'POST',
			path: '/v1/locate',
			status: 200,
			ms: 142,
			key: 'or_live_8f3k',
			ip: '187.174.12.44'
		},
		{
			id: 'req_002',
			ts: '14:32:16.504',
			method: 'GET',
			path: '/v1/status',
			status: 200,
			ms: 38,
			key: 'or_live_8f3k',
			ip: '187.174.12.44'
		},
		{
			id: 'req_003',
			ts: '14:31:58.113',
			method: 'POST',
			path: '/v1/locate/batch',
			status: 200,
			ms: 317,
			key: 'or_test_2a9x',
			ip: '10.0.0.15'
		},
		{
			id: 'req_004',
			ts: '14:31:44.882',
			method: 'POST',
			path: '/v1/locate',
			status: 422,
			ms: 61,
			key: 'or_live_8f3k',
			ip: '187.174.12.44'
		},
		{
			id: 'req_005',
			ts: '14:31:33.210',
			method: 'POST',
			path: '/v1/locate',
			status: 200,
			ms: 188,
			key: 'or_live_8f3k',
			ip: '187.174.12.44'
		},
		{
			id: 'req_006',
			ts: '14:30:57.442',
			method: 'GET',
			path: '/v1/status',
			status: 200,
			ms: 29,
			key: 'or_test_2a9x',
			ip: '10.0.0.15'
		},
		{
			id: 'req_007',
			ts: '14:30:41.111',
			method: 'POST',
			path: '/v1/locate',
			status: 429,
			ms: 5,
			key: 'or_live_8f3k',
			ip: '187.174.12.44'
		},
		{
			id: 'req_008',
			ts: '14:29:58.770',
			method: 'POST',
			path: '/v1/locate/batch',
			status: 200,
			ms: 284,
			key: 'or_live_8f3k',
			ip: '187.174.12.44'
		},
		{
			id: 'req_009',
			ts: '14:28:12.334',
			method: 'POST',
			path: '/v1/locate',
			status: 200,
			ms: 155,
			key: 'or_test_2a9x',
			ip: '10.0.0.15'
		},
		{
			id: 'req_010',
			ts: '14:27:44.991',
			method: 'POST',
			path: '/v1/locate',
			status: 500,
			ms: 8001,
			key: 'or_live_8f3k',
			ip: '187.174.12.44'
		}
	];

	$: filtered = logs.filter((l) => {
		const s =
			filterStatus === 'all' ||
			(filterStatus === '2xx' && l.status < 300) ||
			(filterStatus === '4xx' && l.status >= 400 && l.status < 500) ||
			(filterStatus === '5xx' && l.status >= 500);
		const m = filterMethod === 'all' || l.method === filterMethod;
		const q = !search || l.path.includes(search) || l.key.includes(search) || l.ip.includes(search);
		return s && m && q;
	});

	function statusMeta(c) {
		if (c < 300)
			return { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' };
		if (c < 500)
			return { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' };
		return { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' };
	}

	function latencyColor(ms) {
		return ms < 100 ? '#4ade80' : ms < 500 ? '#fbbf24' : '#f87171';
	}

	function methodColor(m) {
		return m === 'GET' ? '#38bdf8' : '#a78bfa';
	}
</script>

<svelte:head><title>Logs — Orion | Geminis Labs</title></svelte:head>

<!-- ───── KPIs ───── -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
	{#each [{ label: 'Solicitudes hoy', value: '1,284', color: '#818cf8', border: 'rgba(99,102,241,0.25)', glow: 'rgba(99,102,241,0.08)' }, { label: 'Tasa de éxito', value: '99.1%', color: '#4ade80', border: 'rgba(74,222,128,0.25)', glow: 'rgba(74,222,128,0.06)' }, { label: 'Latencia p50', value: '144 ms', color: '#34d399', border: 'rgba(52,211,153,0.25)', glow: 'rgba(52,211,153,0.06)' }, { label: 'Errores 24 h', value: '11', color: '#fbbf24', border: 'rgba(251,191,36,0.25)', glow: 'rgba(251,191,36,0.06)' }] as k (k.label)}
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
			<div style="font-size:28px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;">
				{k.value}
			</div>
		</div>
	{/each}
</div>

<!-- ───── Filtros ───── -->
<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
	<div style="position:relative;flex:1;min-width:200px;">
		<svg
			style="position:absolute;left:12px;top:50%;transform:translateY(-50%);"
			width="13"
			height="13"
			fill="none"
			viewBox="0 0 24 24"
			stroke="#475569"
			stroke-width="2"
			><circle cx="11" cy="11" r="8" /><path stroke-linecap="round" d="M21 21l-4.35-4.35" /></svg
		>
		<input
			bind:value={search}
			placeholder="Filtrar por ruta, clave, IP…"
			style="width:100%;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(10,16,26,0.6);padding:8px 12px 8px 32px;font-size:12px;color:#e2e8f0;outline:none;box-sizing:border-box;"
		/>
	</div>
	<!-- Status -->
	<div
		style="display:flex;gap:3px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:3px;"
	>
		{#each [['all', 'Todos'], ['2xx', '2xx'], ['4xx', '4xx'], ['5xx', '5xx']] as [v, l] (v)}
			<button
				on:click={() => (filterStatus = v)}
				style="border-radius:6px;border:none;padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;background:{filterStatus ===
				v
					? 'rgba(99,102,241,0.8)'
					: 'transparent'};color:{filterStatus === v ? '#fff' : '#64748b'};">{l}</button
			>
		{/each}
	</div>
	<!-- Método -->
	<div
		style="display:flex;gap:3px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:3px;"
	>
		{#each [['all', 'Todos'], ['GET', 'GET'], ['POST', 'POST']] as [v, l] (v)}
			<button
				on:click={() => (filterMethod = v)}
				style="border-radius:6px;border:none;padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;background:{filterMethod ===
				v
					? 'rgba(99,102,241,0.8)'
					: 'transparent'};color:{filterMethod === v ? '#fff' : '#64748b'};">{l}</button
			>
		{/each}
	</div>
	<button
		style="border-radius:9px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);padding:8px 12px;font-size:12px;color:#64748b;cursor:pointer;"
		>↓ Exportar CSV</button
	>
</div>

<!-- ───── Tabla de logs ───── -->
<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"
>
	<div style="overflow-x:auto;">
		<table style="width:100%;min-width:760px;border-collapse:collapse;font-size:12px;">
			<thead>
				<tr style="background:rgba(0,0,0,0.3);">
					{#each ['Hora', 'Método', 'Endpoint', 'Estado', 'Latencia', 'API Key', 'IP', ''] as col (col)}
						<th
							style="padding:10px 14px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap;"
							>{col}</th
						>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each filtered as l (l.id)}
					{@const st = statusMeta(l.status)}
					<tr
						style="border-bottom:1px solid rgba(255,255,255,0.025);{l.status >= 500
							? 'background:rgba(248,113,113,0.03);'
							: l.status >= 400
								? 'background:rgba(251,191,36,0.02);'
								: ''}"
					>
						<td
							style="padding:11px 14px;font-family:monospace;font-size:11px;color:#475569;white-space:nowrap;"
							>{l.ts}</td
						>
						<td style="padding:11px 14px;">
							<code
								style="border-radius:5px;background:rgba({l.method === 'GET'
									? '56,189,248'
									: '167,139,250'},0.1);padding:2px 6px;font-size:10px;font-weight:700;color:{methodColor(
									l.method
								)};">{l.method}</code
							>
						</td>
						<td
							style="padding:11px 14px;font-family:monospace;font-size:11px;color:#94a3b8;white-space:nowrap;"
							>{l.path}</td
						>
						<td style="padding:11px 14px;">
							<span
								style="display:inline-flex;align-items:center;gap:3px;border-radius:99px;border:1px solid {st.border};background:{st.bg};padding:2px 7px;font-size:10px;font-weight:700;color:{st.color};"
								>{l.status}</span
							>
						</td>
						<td
							style="padding:11px 14px;font-family:monospace;font-size:11px;font-weight:600;color:{latencyColor(
								l.ms
							)};font-variant-numeric:tabular-nums;white-space:nowrap;"
							>{l.ms >= 1000 ? (l.ms / 1000).toFixed(1) + 's' : l.ms + 'ms'}</td
						>
						<td
							style="padding:11px 14px;font-family:monospace;font-size:10px;color:#475569;white-space:nowrap;"
							>{l.key}••••</td
						>
						<td
							style="padding:11px 14px;font-family:monospace;font-size:10px;color:#334155;white-space:nowrap;"
							>{l.ip}</td
						>
						<td style="padding:11px 14px;">
							<button
								style="border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);padding:3px 8px;font-size:10px;color:#475569;cursor:pointer;"
								>Ver</button
							>
						</td>
					</tr>
				{/each}
				{#if filtered.length === 0}
					<tr
						><td colspan="8" style="padding:40px;text-align:center;color:#334155;font-size:13px;"
							>Sin registros para los filtros seleccionados.</td
						></tr
					>
				{/if}
			</tbody>
		</table>
	</div>
	<div
		style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;"
	>
		<span style="font-size:11px;color:#334155;"
			>{filtered.length} registros · Datos de demostración</span
		>
		<span style="font-size:11px;color:#334155;">Retención: 30 días</span>
	</div>
</div>
