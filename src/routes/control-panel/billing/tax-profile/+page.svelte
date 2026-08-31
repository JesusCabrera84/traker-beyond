<script>
	import { onMount } from 'svelte';
	import { billingService } from '$lib/services/billingService.js';
	import { toastStore } from '$lib/stores/toastStore.js';

	let loading = true;
	let saving = false;
	let error = null;
	let taxSystems = [];
	let cfdiUses = [];
	let isComplete = false;

	let rfc = '';
	let legalName = '';
	let taxSystem = '601';
	let zip = '';
	let email = '';
	let defaultCfdiUse = 'G03';

	onMount(async () => {
		await load();
	});

	async function load() {
		loading = true;
		error = null;
		try {
			const data = await billingService.getTaxProfile();
			rfc = data.rfc ?? '';
			legalName = data.legal_name ?? '';
			taxSystem = data.tax_system || '601';
			zip = data.zip ?? '';
			email = data.email ?? '';
			defaultCfdiUse = data.default_cfdi_use || 'G03';
			isComplete = data.is_complete === true;
			taxSystems = data.tax_systems ?? [];
			cfdiUses = data.cfdi_uses ?? [];
		} catch (e) {
			error = e?.message ?? 'No se pudieron cargar los datos fiscales.';
		} finally {
			loading = false;
		}
	}

	function normalizeRfc() {
		rfc = String(rfc || '')
			.toUpperCase()
			.replace(/[\s-]/g, '');
	}

	async function save(event) {
		event.preventDefault();
		if (saving) return;
		saving = true;
		error = null;
		normalizeRfc();
		try {
			const data = await billingService.saveTaxProfile({
				rfc,
				legal_name: legalName.trim(),
				tax_system: taxSystem,
				zip: String(zip || '').trim(),
				email: email.trim() || null,
				default_cfdi_use: defaultCfdiUse
			});
			rfc = data.rfc ?? rfc;
			legalName = data.legal_name ?? legalName;
			taxSystem = data.tax_system || taxSystem;
			zip = data.zip ?? zip;
			email = data.email ?? '';
			defaultCfdiUse = data.default_cfdi_use || defaultCfdiUse;
			isComplete = data.is_complete === true;
			toastStore.success('Datos fiscales guardados. Ya puedes emitir CFDI desde Facturas.');
		} catch (e) {
			toastStore.error(e);
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head><title>Datos fiscales — Facturación | Geminis Labs</title></svelte:head>

{#if loading}
	<div class="skeleton h-24 rounded-xl mb"></div>
	<div class="skeleton h-96 rounded-2xl"></div>
{:else if error}
	<div class="error-card">
		<p>{error}</p>
		<button type="button" class="btn-link" on:click={load}>Reintentar</button>
	</div>
{:else}
	<div class="intro">
		<div>
			<p class="eyebrow">{isComplete ? 'Listo para facturar' : 'Faltan datos del SAT'}</p>
			<h2 class="intro-title">Receptor del CFDI</h2>
			<p class="intro-text">
				RFC, razón social, régimen y código postal se envían al SAT al timbrar. El comprobante
				interno de pago sigue disponible aunque no emitas factura fiscal.
			</p>
		</div>
		{#if isComplete}
			<span class="pill pill--ok">Perfil completo</span>
		{:else}
			<span class="pill">Incompleto</span>
		{/if}
	</div>

	<form class="card" on:submit={save}>
		<div class="grid">
			<label class="field field--wide">
				<span class="label">RFC</span>
				<input
					class="input input--mono"
					bind:value={rfc}
					on:blur={normalizeRfc}
					maxlength="13"
					autocomplete="off"
					required
					placeholder="ABC101010111"
				/>
			</label>
			<label class="field field--wide">
				<span class="label">Razón social</span>
				<input
					class="input"
					bind:value={legalName}
					required
					minlength="3"
					placeholder="Tal como aparece en el CIF"
				/>
			</label>
			<label class="field">
				<span class="label">Régimen fiscal</span>
				<select class="input" bind:value={taxSystem} required>
					{#each taxSystems as item (item.code)}
						<option value={item.code}>{item.code} · {item.name}</option>
					{/each}
				</select>
			</label>
			<label class="field">
				<span class="label">Código postal</span>
				<input
					class="input input--mono"
					bind:value={zip}
					required
					inputmode="numeric"
					maxlength="5"
					placeholder="85900"
				/>
			</label>
			<label class="field">
				<span class="label">Correo del CFDI <span class="optional">opcional</span></span>
				<input class="input" type="email" bind:value={email} placeholder="facturacion@empresa.mx" />
			</label>
			<label class="field">
				<span class="label">Uso de CFDI predeterminado</span>
				<select class="input" bind:value={defaultCfdiUse} required>
					{#each cfdiUses as item (item.code)}
						<option value={item.code}>{item.code} · {item.name}</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="actions">
			<button type="submit" class="save-btn" disabled={saving}>
				{saving ? 'Guardando…' : 'Guardar datos fiscales'}
			</button>
			<a href="/control-panel/billing/invoices" class="ghost-link">Ir a facturas</a>
		</div>
	</form>
{/if}

<style>
	.mb {
		margin-bottom: 16px;
	}
	.skeleton {
		background: rgba(255, 255, 255, 0.04);
		animation: pulse 1.5s infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
	.error-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		background: rgba(248, 113, 113, 0.06);
		border: 1px solid rgba(248, 113, 113, 0.18);
		border-radius: 16px;
		padding: 32px;
		text-align: center;
		color: #fca5a5;
		font-size: 13px;
	}
	.btn-link {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 12px;
		color: #6366f1;
		text-decoration: underline;
	}
	.intro {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 20px;
	}
	.eyebrow {
		margin: 0 0 6px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #334155;
	}
	.intro-title {
		margin: 0 0 6px;
		font-size: 18px;
		font-weight: 700;
		color: #f1f5f9;
		letter-spacing: -0.02em;
	}
	.intro-text {
		margin: 0;
		max-width: 62ch;
		font-size: 13px;
		line-height: 1.65;
		color: #64748b;
	}
	.pill {
		flex-shrink: 0;
		border-radius: 99px;
		border: 1px solid rgba(251, 191, 36, 0.25);
		background: rgba(251, 191, 36, 0.08);
		color: #fbbf24;
		font-size: 11px;
		font-weight: 700;
		padding: 5px 10px;
	}
	.pill--ok {
		border-color: rgba(74, 222, 128, 0.25);
		background: rgba(74, 222, 128, 0.08);
		color: #4ade80;
	}
	.card {
		background: rgba(10, 16, 26, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 16px;
		padding: 22px;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px 18px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.field--wide {
		grid-column: 1 / -1;
	}
	.label {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #334155;
	}
	.optional {
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: none;
		color: #1e293b;
	}
	.input {
		appearance: none;
		background: rgba(10, 16, 26, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		padding: 10px 12px;
		font-size: 13px;
		color: #e2e8f0;
		outline: none;
	}
	.input:focus {
		border-color: rgba(99, 102, 241, 0.45);
	}
	.input--mono {
		font-family: 'Courier New', monospace;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.input option {
		background: #0f172a;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-top: 22px;
		padding-top: 18px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}
	.save-btn {
		border: none;
		border-radius: 12px;
		background: linear-gradient(135deg, #6366f1, #7c3aed);
		color: #fff;
		font-size: 13px;
		font-weight: 700;
		padding: 11px 18px;
		cursor: pointer;
		box-shadow: 0 2px 12px rgba(99, 102, 241, 0.3);
	}
	.save-btn:disabled {
		opacity: 0.55;
		cursor: wait;
	}
	.save-btn:not(:disabled):hover {
		filter: brightness(1.08);
	}
	.ghost-link {
		font-size: 13px;
		color: #818cf8;
		text-decoration: none;
	}
	.ghost-link:hover {
		text-decoration: underline;
	}
	@media (max-width: 720px) {
		.grid {
			grid-template-columns: 1fr;
		}
		.field--wide {
			grid-column: auto;
		}
		.intro {
			flex-direction: column;
		}
		.actions {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
