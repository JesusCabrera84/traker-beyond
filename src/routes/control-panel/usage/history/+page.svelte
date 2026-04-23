<script>
	let search = '';
	let typeFilter = 'all';

	const rows = [
		{
			id: '1',
			at: '2026-04-22 14:32:01',
			type: 'api',
			actor: 'or_live_8f3k•••',
			action: 'GET /v1/devices',
			detail: '200 · 42 ms',
			ip: '189.204.x.x'
		},
		{
			id: '2',
			at: '2026-04-22 14:31:48',
			type: 'webhook',
			actor: 'Sistema',
			action: 'delivery.invoice.paid',
			detail: '200 · 118 ms',
			ip: '52.84.x.x'
		},
		{
			id: '3',
			at: '2026-04-22 14:28:12',
			type: 'panel',
			actor: 'admin@geme.com',
			action: 'Login panel',
			detail: 'OK · MFA',
			ip: '201.141.x.x'
		},
		{
			id: '4',
			at: '2026-04-22 14:15:03',
			type: 'api',
			actor: 'or_test_2a9x•••',
			action: 'POST /v1/telemetry/batch',
			detail: '201 · 186 ms',
			ip: '10.0.3.12'
		},
		{
			id: '5',
			at: '2026-04-22 14:02:55',
			type: 'api',
			actor: 'or_live_8f3k•••',
			action: 'GET /v1/geofences',
			detail: '429 · rate limit',
			ip: '189.204.x.x'
		},
		{
			id: '6',
			at: '2026-04-22 13:58:00',
			type: 'integration',
			actor: 'Slack',
			action: 'notify.route_alert',
			detail: '200',
			ip: '—'
		}
	];

	function typeLabel(t) {
		if (t === 'api') return 'API';
		if (t === 'webhook') return 'Webhook';
		if (t === 'panel') return 'Panel';
		if (t === 'integration') return 'Integración';
		return t;
	}

	function typeColor(t) {
		if (t === 'api')
			return { bg: 'rgba(129,140,248,0.12)', fg: '#a5b4fc', border: 'rgba(129,140,248,0.25)' };
		if (t === 'webhook')
			return { bg: 'rgba(52,211,153,0.1)', fg: '#6ee7b7', border: 'rgba(52,211,153,0.25)' };
		if (t === 'panel')
			return { bg: 'rgba(251,191,36,0.1)', fg: '#fcd34d', border: 'rgba(251,191,36,0.25)' };
		return { bg: 'rgba(148,163,184,0.1)', fg: '#94a3b8', border: 'rgba(148,163,184,0.2)' };
	}

	$: filtered = rows.filter((r) => {
		const q =
			!search ||
			r.action.toLowerCase().includes(search.toLowerCase()) ||
			r.actor.toLowerCase().includes(search.toLowerCase()) ||
			r.detail.toLowerCase().includes(search.toLowerCase());
		const t = typeFilter === 'all' || r.type === typeFilter;
		return q && t;
	});
</script>

<svelte:head><title>Historial — Uso | Geminis Labs</title></svelte:head>

<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;">
	<div style="position:relative;flex:1;min-width:240px;">
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
			placeholder="Buscar acción, actor o detalle…"
			style="width:100%;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(10,16,26,0.6);padding:9px 12px 9px 34px;font-size:13px;color:#e2e8f0;outline:none;box-sizing:border-box;"
		/>
	</div>
	<div
		style="display:flex;gap:4px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:4px;"
	>
		{#each [['all', 'Todos'], ['api', 'API'], ['webhook', 'Webhook'], ['panel', 'Panel'], ['integration', 'Integración']] as [val, lbl] (val)}
			<button
				type="button"
				on:click={() => (typeFilter = val)}
				style="border-radius:7px;border:none;padding:6px 10px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;background:{typeFilter ===
				val
					? 'linear-gradient(135deg,#10b981,#047857)'
					: 'transparent'};color:{typeFilter === val ? '#fff' : '#64748b'};"
			>
				{lbl}
			</button>
		{/each}
	</div>
</div>

<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"
>
	<div style="overflow-x:auto;">
		<table style="width:100%;min-width:920px;border-collapse:collapse;font-size:13px;">
			<thead>
				<tr style="background:rgba(0,0,0,0.3);">
					{#each ['Fecha / hora', 'Tipo', 'Actor', 'Acción', 'Detalle', 'IP / origen'] as col (col)}
						<th
							style="padding:11px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap;"
							>{col}</th
						>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each filtered as r (r.id)}
					{@const tc = typeColor(r.type)}
					<tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
						<td style="padding:13px 16px;font-family:monospace;font-size:12px;color:#64748b;"
							>{r.at}</td
						>
						<td style="padding:13px 16px;">
							<span
								style="display:inline-block;font-size:11px;font-weight:600;padding:3px 8px;border-radius:99px;border:1px solid {tc.border};background:{tc.bg};color:{tc.fg};"
								>{typeLabel(r.type)}</span
							>
						</td>
						<td style="padding:13px 16px;color:#94a3b8;font-size:12px;">{r.actor}</td>
						<td style="padding:13px 16px;font-weight:500;color:#e2e8f0;">{r.action}</td>
						<td style="padding:13px 16px;color:#64748b;font-size:12px;">{r.detail}</td>
						<td style="padding:13px 16px;font-family:monospace;font-size:11px;color:#475569;"
							>{r.ip}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<p style="margin:16px 0 0;font-size:12px;color:#475569;text-align:center;">
	Retención de ejemplo: 30 días. En producción define políticas y exportación.
</p>
