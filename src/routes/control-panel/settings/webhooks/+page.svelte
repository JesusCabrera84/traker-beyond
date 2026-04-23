<script>
	const hooks = [
		{
			id: 'wh_1',
			url: 'https://api.cliente.com/hooks/geminis',
			events: 'invoice.paid, device.offline',
			active: true,
			last: '200 · hace 12 min',
			fail: 0
		},
		{
			id: 'wh_2',
			url: 'https://staging.erp.local/nexus-hook',
			events: 'telemetry.batch',
			active: true,
			last: '200 · hace 1 h',
			fail: 0
		},
		{
			id: 'wh_3',
			url: 'https://hooks.slack.com/services/xxx/yyy',
			events: 'route.alert',
			active: false,
			last: '410 Gone · hace 2 d',
			fail: 12
		}
	];
</script>

<svelte:head><title>Webhooks — Configuración | Geminis Labs</title></svelte:head>

<div
	style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;"
>
	<p style="margin:0;max-width:560px;font-size:13px;color:#64748b;line-height:1.5;">
		Recibe eventos firmados (cabecera <span style="font-family:monospace;color:#94a3b8;"
			>X-Geminis-Signature</span
		>) en tus endpoints HTTPS.
	</p>
	<button
		type="button"
		disabled
		style="display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:none;background:linear-gradient(135deg,#6366f1,#7c3aed);padding:9px 16px;font-size:13px;font-weight:600;color:#fff;opacity:0.45;cursor:not-allowed;"
	>
		<svg
			width="14"
			height="14"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"><path stroke-linecap="round" d="M12 4v16m8-8H4" /></svg
		>
		Nuevo endpoint
	</button>
</div>

<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"
>
	<div style="overflow-x:auto;">
		<table style="width:100%;min-width:800px;border-collapse:collapse;font-size:13px;">
			<thead>
				<tr style="background:rgba(0,0,0,0.3);">
					{#each ['URL', 'Eventos', 'Estado', 'Última entrega', 'Fallos 24h', ''] as col (col)}
						<th
							style="padding:11px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap;"
							>{col}</th
						>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each hooks as h (h.id)}
					<tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
						<td style="padding:14px 16px;">
							<div style="font-family:monospace;font-size:12px;color:#a5b4fc;word-break:break-all;">
								{h.url}
							</div>
						</td>
						<td style="padding:14px 16px;font-size:12px;color:#64748b;max-width:220px;"
							>{h.events}</td
						>
						<td style="padding:14px 16px;">
							<span
								style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:99px;border:1px solid {h.active
									? 'rgba(74,222,128,0.3)'
									: 'rgba(248,113,113,0.3)'};background:{h.active
									? 'rgba(74,222,128,0.1)'
									: 'rgba(248,113,113,0.08)'};color:{h.active ? '#86efac' : '#fca5a5'};"
							>
								{h.active ? 'Activo' : 'Pausado'}
							</span>
						</td>
						<td style="padding:14px 16px;font-size:12px;color:#94a3b8;">{h.last}</td>
						<td
							style="padding:14px 16px;font-weight:600;color:{h.fail > 0 ? '#f87171' : '#64748b'};"
							>{h.fail}</td
						>
						<td style="padding:14px 16px;text-align:right;">
							<button
								type="button"
								style="margin-right:6px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);padding:6px 10px;font-size:11px;font-weight:600;color:#cbd5e1;cursor:pointer;"
							>
								Probar
							</button>
							<button
								type="button"
								style="border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);padding:6px 10px;font-size:11px;font-weight:600;color:#cbd5e1;cursor:pointer;"
							>
								Editar
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
