<script>
	const items = [
		{
			id: 'slack',
			name: 'Slack',
			desc: 'Alertas de flota y facturación en canales.',
			connected: true,
			meta: 'Workspace: Geminis · #ops-nexus'
		},
		{
			id: 'maps',
			name: 'Google Maps',
			desc: 'Visualización de rutas y geocodificación.',
			connected: true,
			meta: 'Proyecto: geminis-prod-01'
		},
		{
			id: 'erp',
			name: 'ERP interno',
			desc: 'Sincronización de unidades y órdenes.',
			connected: false,
			meta: 'No configurado'
		},
		{
			id: 'sentry',
			name: 'Sentry',
			desc: 'Errores del panel y de APIs públicas.',
			connected: false,
			meta: 'No configurado'
		}
	];
</script>

<svelte:head><title>Integraciones — Configuración | Geminis Labs</title></svelte:head>

<p style="margin:0 0 20px;font-size:13px;color:#64748b;max-width:640px;line-height:1.5;">
	Activa conectores administrados por Geminis Labs. Las credenciales se almacenan cifradas; aquí
	solo ves el estado de conexión.
</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;">
	{#each items as it (it.id)}
		<div
			style="background:rgba(10,16,26,0.75);border:1px solid {it.connected
				? 'rgba(99,102,241,0.25)'
				: 'rgba(255,255,255,0.07)'};border-radius:16px;padding:20px 20px 18px;position:relative;overflow:hidden;"
		>
			{#if it.connected}
				<div
					style="position:absolute;top:0;right:0;width:80px;height:80px;background:rgba(99,102,241,0.06);border-radius:0 0 0 100%;pointer-events:none;"
				></div>
			{/if}
			<div
				style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;"
			>
				<h3 style="margin:0;font-size:16px;font-weight:700;color:#f1f5f9;">{it.name}</h3>
				<span
					style="flex-shrink:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:4px 8px;border-radius:99px;border:1px solid {it.connected
						? 'rgba(74,222,128,0.35)'
						: 'rgba(148,163,184,0.25)'};color:{it.connected
						? '#86efac'
						: '#94a3b8'};background:{it.connected ? 'rgba(74,222,128,0.08)' : 'rgba(0,0,0,0.2)'};"
				>
					{it.connected ? 'Conectado' : 'Desconectado'}
				</span>
			</div>
			<p style="margin:0 0 12px;font-size:13px;color:#64748b;line-height:1.45;">{it.desc}</p>
			<p style="margin:0 0 16px;font-size:12px;color:#475569;font-family:monospace;">{it.meta}</p>
			<button
				type="button"
				style="width:100%;box-sizing:border-box;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:600;cursor:pointer;background:{it.connected
					? 'rgba(248,113,113,0.12)'
					: 'linear-gradient(135deg,#6366f1,#7c3aed)'};color:{it.connected
					? '#fca5a5'
					: '#fff'};border:1px solid {it.connected ? 'rgba(248,113,113,0.25)' : 'transparent'};"
			>
				{it.connected ? 'Desconectar' : 'Conectar'}
			</button>
		</div>
	{/each}
</div>
