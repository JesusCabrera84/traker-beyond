<script>
	import { onMount } from 'svelte';

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
	const API_PLATFORM_KEYS_ENDPOINT = '/api/v1/api-platform/keys';
	const API_PLATFORM_USAGE_SUMMARY_ENDPOINT = '/api/v1/api-platform/usage/summary';
	const ORION_PRODUCT_CODE = 'orion';

	let keys = [];
	let keysLoading = true;
	let keysError = null;
	let usageSummary = null;

	onMount(() => {
		loadKeys();
		loadUsageSummary();
	});

	async function loadKeys() {
		keysLoading = true;
		keysError = null;
		try {
			const token = getAuthToken();
			if (!token) throw new Error('No hay sesión activa');
			const params = new URLSearchParams({ product_code: ORION_PRODUCT_CODE });
			if (keyStatusFilter === 'active') params.set('status', 'ACTIVE');
			if (keyStatusFilter === 'revoked') params.set('status', 'REVOKED');
			const res = await fetch(
				`${API_BASE_URL}${API_PLATFORM_KEYS_ENDPOINT}?${params.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: 'application/json'
					}
				}
			);
			if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
			keys = await res.json();
		} catch (e) {
			keysError = e.message;
		} finally {
			keysLoading = false;
		}
	}

	function formatDate(iso) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('es-MX', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatNumber(value) {
		const amount = Number(value ?? 0);
		return Number.isFinite(amount) ? amount.toLocaleString('es-MX') : '0';
	}

	function formatErrorRate(value) {
		const rate = Number(value ?? 0);
		return Number.isFinite(rate) ? `${(rate * 100).toFixed(2)}%` : '0.00%';
	}

	async function loadUsageSummary() {
		try {
			const token = getAuthToken();
			if (!token) throw new Error('No hay sesión activa');
			const res = await fetch(`${API_BASE_URL}${API_PLATFORM_USAGE_SUMMARY_ENDPOINT}`, {
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/json'
				}
			});
			if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
			usageSummary = await res.json();
		} catch {
			usageSummary = null;
		}
	}

	$: stats = [
		{
			label: 'Claves activas',
			value: usageSummary ? formatNumber(usageSummary.active_keys) : '—',
			color: '#4ade80',
			border: 'rgba(74,222,128,0.25)',
			glow: 'rgba(74,222,128,0.06)'
		},
		{
			label: 'Req. hoy',
			value: usageSummary ? formatNumber(usageSummary.requests_today) : '—',
			color: '#818cf8',
			border: 'rgba(99,102,241,0.25)',
			glow: 'rgba(99,102,241,0.08)'
		},
		{
			label: 'Req. este mes',
			value: usageSummary ? formatNumber(usageSummary.requests_month) : '—',
			color: '#a5b4fc',
			border: 'rgba(165,180,252,0.25)',
			glow: 'rgba(165,180,252,0.06)'
		},
		{
			label: 'Tasa de error',
			value: usageSummary ? formatErrorRate(usageSummary.error_rate) : '—',
			color: '#34d399',
			border: 'rgba(52,211,153,0.25)',
			glow: 'rgba(52,211,153,0.06)'
		}
	];

	const plans = [
		{ id: 'free', label: 'Gratis', limit: '100 req/día', enabled: true },
		{ id: 'developer', label: 'Developer', limit: '5,000 req/día', enabled: false },
		{ id: 'pro', label: 'Pro', limit: '50,000 req/día', enabled: false },
		{ id: 'enterprise', label: 'Enterprise', limit: 'Ilimitado', enabled: false }
	];

	let view = 'table';
	let keyStatusFilter = 'all';
	let keyName = '';
	let selectedPlan = 'free';
	let creating = false;
	let createError = null;
	let newApiKey = null;
	let keyCopied = false;
	let revoking = null;
	let revokeError = null;
	let confirmingRevoke = null;

	function getAuthToken() {
		return sessionStorage.getItem('geminis_id_token') || sessionStorage.getItem('geminis_access_token');
	}

	function setKeyStatusFilter(status) {
		if (keyStatusFilter === status) return;
		keyStatusFilter = status;
		loadKeys();
	}

	async function revokeKey(keyId) {
		revoking = keyId;
		revokeError = null;
		confirmingRevoke = null;
		try {
			const token = getAuthToken();
			if (!token) throw new Error('No hay sesión activa');
			const res = await fetch(
				`${API_BASE_URL}${API_PLATFORM_KEYS_ENDPOINT}/${keyId}/revoke`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: 'application/json'
					}
				}
			);
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.detail || `Error ${res.status}: ${res.statusText}`);
			}
			await loadKeys();
			await loadUsageSummary();
		} catch (e) {
			revokeError = e.message;
		} finally {
			revoking = null;
		}
	}

	function copyKey() {
		navigator.clipboard.writeText(newApiKey);
		keyCopied = true;
		setTimeout(() => (keyCopied = false), 2000);
	}

	async function createKey() {
		if (!keyName.trim()) return;
		creating = true;
		createError = null;
		try {
			if (!API_BASE_URL) throw new Error('Falta configurar VITE_API_BASE_URL');

			const token = getAuthToken();
			if (!token) throw new Error('No hay sesión activa para crear API keys');

			const res = await fetch(`${API_BASE_URL}${API_PLATFORM_KEYS_ENDPOINT}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify({
					product_code: ORION_PRODUCT_CODE,
					name: keyName.trim(),
					expires_at: null
				})
			});
			if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
			const data = await res.json();
			newApiKey = data.full_key;
			if (!newApiKey) throw new Error('La API no devolvió full_key');
				view = 'reveal';
			await loadKeys();
			await loadUsageSummary();
		} catch (e) {
			createError = e.message;
		} finally {
			creating = false;
		}
	}

	function resetForm() {
		keyName = '';
		selectedPlan = 'free';
		createError = null;
		newApiKey = null;
		keyCopied = false;
		view = 'table';
	}

	function envMeta(prefix) {
		const isLive = typeof prefix === 'string' && prefix.toLowerCase().includes('live');
		return isLive
			? {
					color: '#4ade80',
					bg: 'rgba(74,222,128,0.08)',
					border: 'rgba(74,222,128,0.2)',
					label: 'Live'
				}
			: {
					color: '#fbbf24',
					bg: 'rgba(251,191,36,0.08)',
					border: 'rgba(251,191,36,0.2)',
					label: 'Test'
				};
	}
</script>

<svelte:head><title>API Keys — Orion | Geminis Labs</title></svelte:head>

<!-- ───── KPIs ───── -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
	{#each stats as s (s.label)}
		<div
			style="position:relative;overflow:hidden;background:rgba(10,16,26,0.75);border:1px solid {s.border};border-radius:16px;padding:22px 20px;"
		>
			<div
				style="position:absolute;top:-20px;right:-20px;width:70px;height:70px;border-radius:50%;background:{s.glow};pointer-events:none;"
			></div>
			<div
				style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:{s.color};margin-bottom:10px;"
			>
				{s.label}
			</div>
			<div style="font-size:28px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;">
				{s.value}
			</div>
		</div>
	{/each}
</div>

<!-- ───── Banner seguridad ───── -->
<div
	style="display:flex;align-items:flex-start;gap:10px;background:rgba(14,165,233,0.06);border:1px solid rgba(14,165,233,0.2);border-radius:12px;padding:12px 16px;margin-bottom:16px;"
>
	<svg
		style="flex-shrink:0;margin-top:2px;"
		width="15"
		height="15"
		fill="none"
		viewBox="0 0 24 24"
		stroke="#38bdf8"
		stroke-width="2"
		><path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
		/></svg
	>
	<p style="margin:0;font-size:13px;color:#7dd3fc;line-height:1.5;">
		Las claves completas se muestran <strong>una sola vez</strong> al crearlas. Usa entornos
		separados (<code
			style="background:rgba(0,0,0,0.2);padding:1px 5px;border-radius:4px;font-size:12px;"
			>test</code
		>
		vs
		<code style="background:rgba(0,0,0,0.2);padding:1px 5px;border-radius:4px;font-size:12px;"
			>live</code
		>) y rota credenciales periódicamente.
	</p>
</div>

<!-- ───── Header + botón ───── -->
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
	<div style="font-size:14px;font-weight:600;color:#e2e8f0;">
		{#if view === 'table'}Claves de acceso{:else if view === 'form'}Nueva API Key{:else}Tu nueva API Key{/if}
	</div>
	{#if view === 'table'}
		<button
			on:click={() => (view = 'form')}
			style="display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:none;background:linear-gradient(135deg,#6366f1,#7c3aed);padding:9px 16px;font-size:13px;font-weight:600;color:#fff;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,0.3);"
		>
			<svg
				width="14"
				height="14"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"><path stroke-linecap="round" d="M12 4v16M4 12h16" /></svg
			>
			Nueva API key
		</button>
	{:else}
		<button
			on:click={resetForm}
			style="display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);padding:9px 16px;font-size:13px;font-weight:600;color:#94a3b8;cursor:pointer;"
		>
			<svg
				width="14"
				height="14"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg
			>
			Volver
		</button>
	{/if}
</div>

{#if view === 'table'}
	<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
		<span
			style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;"
			>Estado:</span
		>
		<div
			style="display:flex;gap:3px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:3px;"
		>
			{#each [['all', 'Todas'], ['active', 'Activas'], ['revoked', 'Revocadas']] as [value, label] (value)}
				<button
					on:click={() => setKeyStatusFilter(value)}
					style="border-radius:6px;border:none;padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;background:{keyStatusFilter ===
					value
						? 'rgba(99,102,241,0.8)'
						: 'transparent'};color:{keyStatusFilter === value ? '#fff' : '#64748b'};"
				>
					{label}
				</button>
			{/each}
		</div>
	</div>
{/if}

<!-- ───── Vista: Tabla ───── -->
{#if view === 'table'}
	{#if keysLoading}
		<div style="display:flex;align-items:center;justify-content:center;padding:48px;color:#475569;font-size:13px;gap:10px;">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;"><path stroke-linecap="round" d="M12 2a10 10 0 0110 10"/></svg>
			Cargando claves…
		</div>
	{:else if keysError}
		<div style="display:flex;align-items:center;gap:8px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 16px;margin-bottom:14px;">
			<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#f87171" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
			<span style="font-size:13px;color:#f87171;flex:1;">{keysError}</span>
			<button on:click={loadKeys} style="border-radius:8px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);padding:4px 10px;font-size:11px;font-weight:600;color:#f87171;cursor:pointer;">Reintentar</button>
		</div>
	{:else if revokeError}
		<div style="display:flex;align-items:center;gap:8px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:10px 14px;margin-bottom:14px;">
			<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#f87171" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
			<span style="font-size:13px;color:#f87171;flex:1;">Error al revocar: {revokeError}</span>
			<button on:click={() => (revokeError = null)} style="border-radius:8px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);padding:4px 10px;font-size:11px;font-weight:600;color:#f87171;cursor:pointer;">Cerrar</button>
		</div>
	{:else}
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;margin-bottom:14px;"
	>
		<div style="overflow-x:auto;">
			<table style="width:100%;min-width:600px;border-collapse:collapse;font-size:13px;">
				<thead>
					<tr style="background:rgba(0,0,0,0.3);">
						{#each ['Nombre', 'Entorno', 'Creada', 'Último uso', 'Estado', ''] as col (col)}
							<th
								style="padding:11px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap;"
								>{col}</th
							>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#if keys.length === 0}
						<tr>
							<td colspan="7" style="padding:32px 16px;text-align:center;font-size:13px;color:#475569;">No hay claves creadas aún.</td>
						</tr>
					{:else}
						{#each keys as k (k.id)}
							{@const env = envMeta(k.prefix)}
							<tr
								style="border-bottom:1px solid rgba(255,255,255,0.03);{k.status !== 'ACTIVE'
									? 'opacity:.6;'
									: ''}"
							>
								<td style="padding:14px 16px;font-size:13px;font-weight:500;color:#e2e8f0;">{k.name}</td>
								<td style="padding:14px 16px;">
									<span
										style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid {env.border};background:{env.bg};padding:3px 8px;font-size:10px;font-weight:700;color:{env.color};"
										>{env.label}</span
									>
								</td>
								<td style="padding:14px 16px;font-size:12px;color:#475569;white-space:nowrap;">{formatDate(k.created_at)}</td>
								<td style="padding:14px 16px;font-size:12px;color:#475569;white-space:nowrap;">{formatDate(k.last_used_at)}</td>
								<td style="padding:14px 16px;">
									{#if k.status === 'ACTIVE'}
										<span
											style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(74,222,128,0.2);background:rgba(74,222,128,0.08);padding:3px 8px;font-size:10px;font-weight:600;color:#4ade80;"
										>
											<span style="width:5px;height:5px;border-radius:50%;background:#4ade80;"></span>Activa
										</span>
									{:else if k.status === 'REVOKED'}
										<span
											style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.07);padding:3px 8px;font-size:10px;font-weight:600;color:#f87171;"
										>Revocada</span
										>
									{:else}
										<span
											style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(100,116,139,0.2);background:rgba(100,116,139,0.08);padding:3px 8px;font-size:10px;font-weight:600;color:#64748b;"
										>Expirada</span
										>
									{/if}
								</td>
								<td style="padding:14px 16px;text-align:right;">
									{#if k.status === 'ACTIVE'}
										{#if confirmingRevoke === k.id}
											<div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">
												<span style="font-size:11px;color:#94a3b8;white-space:nowrap;">¿Confirmar? Esta acción es irreversible.</span>
												<button
													on:click={() => (confirmingRevoke = null)}
													style="border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);padding:5px 10px;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;white-space:nowrap;"
												>Cancelar</button>
												<button
													on:click={() => revokeKey(k.id)}
													disabled={revoking === k.id}
													style="border-radius:8px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.12);padding:5px 10px;font-size:11px;font-weight:700;color:#f87171;cursor:{revoking === k.id ? 'not-allowed' : 'pointer'};opacity:{revoking === k.id ? 0.6 : 1};white-space:nowrap;"
												>
													{revoking === k.id ? 'Revocando…' : 'Sí, revocar'}
												</button>
											</div>
										{:else}
											<button
												on:click={() => (confirmingRevoke = k.id)}
												style="border-radius:8px;border:1px solid rgba(239,68,68,0.15);background:rgba(239,68,68,0.06);padding:5px 10px;font-size:11px;font-weight:600;color:rgba(248,113,113,0.7);cursor:pointer;white-space:nowrap;"
											>Revocar</button>
										{/if}
									{/if}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
	{/if}

<!-- ───── Vista: Formulario creación ───── -->
{:else if view === 'form'}
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px;"
	>
		<!-- Nombre -->
		<div style="margin-bottom:24px;">
			<label
				for="key-name"
				style="display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:8px;"
				>Nombre de la clave</label
			>
			<input
				id="key-name"
				bind:value={keyName}
				placeholder="Ej. Producción — ERP"
				style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:11px 14px;font-size:14px;color:#e2e8f0;outline:none;"
				on:focus={(e) =>
					(e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
				on:blur={(e) =>
					(e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
			/>
		</div>

		<!-- Selector de plan -->
		<div style="margin-bottom:28px;">
			<div
				style="display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:12px;"
			>Plan</div>
			<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
				{#each plans as plan (plan.id)}
					<button
						type="button"
						disabled={!plan.enabled}
						on:click={() => plan.enabled && (selectedPlan = plan.id)}
						style="position:relative;text-align:left;border-radius:12px;padding:14px 16px;cursor:{plan.enabled
							? 'pointer'
							: 'not-allowed'};opacity:{plan.enabled
							? 1
							: 0.45};transition:border-color .15s,background .15s;background:{selectedPlan ===
							plan.id && plan.enabled
							? 'rgba(99,102,241,0.1)'
							: 'rgba(0,0,0,0.2)'};border:1px solid {selectedPlan === plan.id && plan.enabled
							? 'rgba(99,102,241,0.5)'
							: 'rgba(255,255,255,0.07)'};"
					>
						<div
							style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;"
						>
							<span
								style="font-size:13px;font-weight:700;color:{selectedPlan === plan.id &&
								plan.enabled
									? '#a5b4fc'
									: '#94a3b8'};">{plan.label}</span
							>
							{#if !plan.enabled}
								<span
									style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;border-radius:99px;border:1px solid rgba(99,102,241,0.2);background:rgba(99,102,241,0.08);padding:2px 7px;color:#818cf8;"
									>Próximamente</span
								>
							{:else if selectedPlan === plan.id}
								<svg
									width="14"
									height="14"
									fill="none"
									viewBox="0 0 24 24"
									stroke="#6366f1"
									stroke-width="2.5"
									><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
								>
							{/if}
						</div>
						<div style="font-size:12px;color:#475569;">{plan.limit}</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Error -->
		{#if createError}
			<div
				style="display:flex;align-items:center;gap:8px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:10px 14px;margin-bottom:20px;"
			>
				<svg
					width="14"
					height="14"
					fill="none"
					viewBox="0 0 24 24"
					stroke="#f87171"
					stroke-width="2"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
					/></svg
				>
				<span style="font-size:13px;color:#f87171;">{createError}</span>
			</div>
		{/if}

		<!-- Acciones -->
		<div style="display:flex;gap:10px;justify-content:flex-end;">
			<button
				on:click={resetForm}
				style="border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);padding:10px 20px;font-size:13px;font-weight:600;color:#64748b;cursor:pointer;"
				>Cancelar</button
			>
			<button
				on:click={createKey}
				disabled={creating || !keyName.trim()}
				style="display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:none;background:{creating ||
				!keyName.trim()
					? 'rgba(99,102,241,0.4)'
					: 'linear-gradient(135deg,#6366f1,#7c3aed)'};padding:10px 20px;font-size:13px;font-weight:600;color:#fff;cursor:{creating ||
				!keyName.trim()
					? 'not-allowed'
					: 'pointer'};box-shadow:{creating || !keyName.trim()
					? 'none'
					: '0 4px 12px rgba(99,102,241,0.3)'};"
			>
				{#if creating}
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						style="animation:spin 1s linear infinite;"
						><path
							stroke-linecap="round"
							d="M12 2a10 10 0 0110 10"
						/></svg
					>
					Creando…
				{:else}
					<svg
						width="14"
						height="14"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"><path stroke-linecap="round" d="M12 4v16M4 12h16" /></svg
					>
					Crear API Key
				{/if}
			</button>
		</div>
	</div>

<!-- ───── Vista: Revelación de la key ───── -->
{:else if view === 'reveal'}
	<!-- Advertencia -->
	<div
		style="display:flex;align-items:flex-start;gap:10px;background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.25);border-radius:12px;padding:14px 16px;margin-bottom:16px;"
	>
		<svg
			style="flex-shrink:0;margin-top:1px;"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 24 24"
			stroke="#fbbf24"
			stroke-width="2"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
			/></svg
		>
		<div>
			<p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#fbbf24;">
				Guarda esta clave ahora — no la volverás a ver
			</p>
			<p style="margin:0;font-size:12px;color:#92400e;color:#d97706;line-height:1.5;">
				Por seguridad, la clave completa se muestra <strong>una única vez</strong>. Una vez que
				cierres esta pantalla no podrás recuperarla.
			</p>
		</div>
	</div>

	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px;"
	>
		<div
			style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:10px;"
		>
			{keyName}
		</div>

		<!-- Key display -->
		<div
			style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.35);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:14px 16px;margin-bottom:20px;"
		>
			<code
				style="flex:1;font-family:monospace;font-size:13px;color:#a5b4fc;word-break:break-all;line-height:1.6;"
				>{newApiKey}</code
			>
			<button
				on:click={copyKey}
				style="flex-shrink:0;display:inline-flex;align-items:center;gap:5px;border-radius:8px;border:1px solid {keyCopied
					? 'rgba(74,222,128,0.3)'
					: 'rgba(99,102,241,0.3)'};background:{keyCopied
					? 'rgba(74,222,128,0.08)'
					: 'rgba(99,102,241,0.08)'};padding:7px 12px;font-size:12px;font-weight:600;color:{keyCopied
					? '#4ade80'
					: '#818cf8'};cursor:pointer;transition:all .2s;white-space:nowrap;"
			>
				{#if keyCopied}
					<svg
						width="13"
						height="13"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2.5"
						><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
					>
					Copiado
				{:else}
					<svg
						width="13"
						height="13"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
						><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path
							d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
						/></svg
					>
					Copiar
				{/if}
			</button>
		</div>

		<!-- Plan info -->
		<div
			style="display:flex;align-items:center;gap:8px;background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.12);border-radius:10px;padding:10px 14px;margin-bottom:24px;"
		>
			<svg
				width="13"
				height="13"
				fill="none"
				viewBox="0 0 24 24"
				stroke="#818cf8"
				stroke-width="2"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span style="font-size:12px;color:#64748b;">
				Plan <strong style="color:#818cf8;">Gratis</strong> — 100 req/día · límite 1 req/seg · burst de
				2 req
			</span>
		</div>

		<div style="display:flex;justify-content:flex-end;">
			<button
				on:click={resetForm}
				style="display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:none;background:linear-gradient(135deg,#6366f1,#7c3aed);padding:10px 22px;font-size:13px;font-weight:600;color:#fff;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,0.3);"
			>
				Entendido, ir a mis claves
			</button>
		</div>
	</div>
{/if}

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
