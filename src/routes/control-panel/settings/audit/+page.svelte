<script>
	const entries = [
		{
			id: 'a1',
			at: '2026-04-22 11:04:22',
			user: 'admin@geme.com',
			action: 'settings.webhook.update',
			resource: 'wh_2',
			outcome: 'OK',
			ip: '201.141.x.x'
		},
		{
			id: 'a2',
			at: '2026-04-22 10:18:01',
			user: 'admin@geme.com',
			action: 'billing.payment_method.add',
			resource: 'pm_9k2…',
			outcome: 'OK',
			ip: '201.141.x.x'
		},
		{
			id: 'a3',
			at: '2026-04-22 09:55:40',
			user: 'ops@cliente.com',
			action: 'orion.api_key.revoke',
			resource: 'key_7fa…',
			outcome: 'OK',
			ip: '189.204.x.x'
		},
		{
			id: 'a4',
			at: '2026-04-21 16:40:12',
			user: 'sistema',
			action: 'auth.login.failed',
			resource: 'usuario desconocido',
			outcome: 'Denegado',
			ip: '185.220.x.x'
		},
		{
			id: 'a5',
			at: '2026-04-21 14:02:00',
			user: 'admin@geme.com',
			action: 'organization.user.invite',
			resource: 'nuevo@cliente.com',
			outcome: 'OK',
			ip: '201.141.x.x'
		}
	];
</script>

<svelte:head><title>Auditoría — Configuración | Geminis Labs</title></svelte:head>

<div
	style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;"
>
	<p style="margin:0;font-size:13px;color:#64748b;max-width:520px;line-height:1.5;">
		Registro inmutable de acciones sensibles en la organización. Exporta CSV cuando conectes
		almacenamiento de auditoría.
	</p>
	<button
		type="button"
		disabled
		style="border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);padding:9px 16px;font-size:13px;font-weight:600;color:#64748b;cursor:not-allowed;"
	>
		Exportar CSV
	</button>
</div>

<div
	style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"
>
	<div style="overflow-x:auto;">
		<table style="width:100%;min-width:900px;border-collapse:collapse;font-size:13px;">
			<thead>
				<tr style="background:rgba(0,0,0,0.3);">
					{#each ['Fecha / hora', 'Usuario', 'Acción', 'Recurso', 'Resultado', 'IP'] as col (col)}
						<th
							style="padding:11px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap;"
							>{col}</th
						>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each entries as e (e.id)}
					<tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
						<td style="padding:13px 16px;font-family:monospace;font-size:12px;color:#64748b;"
							>{e.at}</td
						>
						<td style="padding:13px 16px;color:#e2e8f0;font-size:13px;">{e.user}</td>
						<td style="padding:13px 16px;font-family:monospace;font-size:12px;color:#a5b4fc;"
							>{e.action}</td
						>
						<td style="padding:13px 16px;color:#94a3b8;font-size:12px;">{e.resource}</td>
						<td style="padding:13px 16px;">
							<span
								style="font-size:11px;font-weight:600;color:{e.outcome === 'OK'
									? '#86efac'
									: '#fca5a5'};">{e.outcome}</span
							>
						</td>
						<td style="padding:13px 16px;font-family:monospace;font-size:11px;color:#475569;"
							>{e.ip}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
