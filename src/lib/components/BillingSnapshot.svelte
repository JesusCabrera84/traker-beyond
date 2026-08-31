<script>
	import { onMount } from 'svelte';
	import { billingService } from '$lib/services/billingService.js';
	import { formatMxn } from '$lib/utils/currency.js';
	import { formatDateLocal } from '$lib/utils/datetime.js';

	let loading = true;
	let error = null;
	let summary = null;
	let methods = [];

	onMount(async () => {
		try {
			const [s, m] = await Promise.all([
				billingService.getSummary(),
				billingService.getPaymentMethods('stripe').catch(() => [])
			]);
			summary = s;
			methods = Array.isArray(m) ? m : [];
		} catch (e) {
			error = e.message ?? 'No se pudo cargar la facturación';
		} finally {
			loading = false;
		}
	});

	$: plan = summary?.current_plan ?? null;
	$: defaultPm = methods.find((m) => m.is_default) ?? methods[0] ?? null;
	$: extraCount = Math.max(0, methods.length - (defaultPm ? 1 : 0));
	$: renewal = summary?.renewal ?? null;

	function brandLabel(brand) {
		if (!brand) return 'Tarjeta';
		const s = String(brand).trim();
		if (!s) return 'Tarjeta';
		return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
	}

	function cycleLabel(cycle) {
		if (cycle === 'YEARLY') return 'Anual';
		if (cycle === 'MONTHLY') return 'Mensual';
		return cycle ?? '';
	}

	function expiryLabel(pm) {
		if (!pm?.exp_month || !pm?.exp_year) return null;
		return `${String(pm.exp_month).padStart(2, '0')}/${String(pm.exp_year).slice(-2)}`;
	}

	$: renewalHint = (() => {
		switch (renewal?.state) {
			case 'past_due':
				return 'El último cobro no pasó. Revisa tu tarjeta para no perder el servicio.';
			case 'action_required':
				return 'Tu banco pide autorizar el cargo de la renovación.';
			case 'no_payment_method':
				return 'Agrega una tarjeta para que el plan se renueve solo.';
			default:
				return null;
		}
	})();
</script>

{#if loading}
	<div class="snap-skel" aria-busy="true" aria-label="Cargando facturación">
		<div class="snap-skel__bar"></div>
		<div class="snap-skel__bar snap-skel__bar--short"></div>
	</div>
{:else if error}
	<div class="snap-empty">
		<p class="snap-empty__title">No se pudo cargar la facturación</p>
		<p class="snap-empty__text">{error}</p>
		<a href="/control-panel/billing/summary" class="snap-link">Abrir facturación</a>
	</div>
{:else}
	<div class="snap">
		<div class="snap-row">
			<div class="snap-row__icon" aria-hidden="true">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.8"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			</div>
			<div class="snap-row__body">
				<p class="snap-label">Plan actual</p>
				{#if plan}
					<p class="snap-title">
						{plan.plan_name}
						{#if plan.billing_cycle}
							<span class="snap-chip">{cycleLabel(plan.billing_cycle)}</span>
						{/if}
					</p>
					<p class="snap-meta">
						{#if plan.next_billing_date}
							Próximo cobro {formatDateLocal(plan.next_billing_date)}
							{#if plan.quote?.total}
								· {formatMxn(plan.quote.total)}
							{/if}
						{:else if plan.quote?.total}
							{formatMxn(plan.quote.total)} con IVA
						{:else}
							Suscripción activa
						{/if}
					</p>
				{:else}
					<p class="snap-title">Sin plan activo</p>
					<p class="snap-meta">Contrata un plan para usar NEXUS con tu flota.</p>
				{/if}
			</div>
			<a
				href={plan ? '/control-panel/billing/summary' : '/control-panel/billing/plans'}
				class="snap-side"
			>
				{plan ? 'Ver detalle' : 'Ver planes'}
			</a>
		</div>

		<div class="snap-row">
			<div class="snap-card" aria-hidden="true">
				<span class="snap-card__chip"></span>
				<span class="snap-card__digits">
					{defaultPm?.last4 ? `···· ${defaultPm.last4}` : '····'}
				</span>
			</div>
			<div class="snap-row__body">
				<p class="snap-label">Método de cobro</p>
				{#if defaultPm}
					<p class="snap-title">
						{brandLabel(defaultPm.brand)} ···· {defaultPm.last4}
						{#if defaultPm.is_default}
							<span class="snap-chip snap-chip--muted">Predeterminada</span>
						{/if}
					</p>
					<p class="snap-meta">
						{#if expiryLabel(defaultPm)}
							Vence {expiryLabel(defaultPm)}
						{/if}
						{#if extraCount > 0}
							{expiryLabel(defaultPm) ? ' · ' : ''}{extraCount} más guardada{extraCount === 1
								? ''
								: 's'}
						{/if}
						{#if !expiryLabel(defaultPm) && extraCount === 0}
							Se usa para renovaciones y cargos nuevos
						{/if}
					</p>
				{:else}
					<p class="snap-title">Sin tarjetas guardadas</p>
					<p class="snap-meta">Agrega una para renovar el plan y pagar facturas.</p>
				{/if}
			</div>
			<a href="/control-panel/billing/payment-methods" class="snap-side">
				{defaultPm ? 'Gestionar' : 'Agregar'}
			</a>
		</div>

		{#if renewalHint}
			<p class="snap-alert">{renewalHint}</p>
		{/if}

		<div class="snap-actions">
			<a href="/control-panel/billing/payment-methods" class="snap-cta">
				<svg class="snap-cta__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
					/>
				</svg>
				{defaultPm ? 'Gestionar tarjetas' : 'Agregar tarjeta'}
			</a>
			<a href="/control-panel/billing/summary" class="snap-ghost">Ver facturación</a>
			<a href="/control-panel/billing/invoices" class="snap-ghost">Facturas</a>
		</div>
	</div>
{/if}

<style>
	.snap {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.snap-row {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1.25rem 1.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 20px;
	}

	.snap-row__icon {
		width: 2.75rem;
		height: 2.75rem;
		flex-shrink: 0;
		color: #00a6c0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.snap-row__icon svg {
		width: 1.75rem;
		height: 1.75rem;
	}

	.snap-row__body {
		flex: 1;
		min-width: 0;
	}

	.snap-label {
		margin: 0 0 0.2rem;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.snap-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.snap-meta {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.4;
	}

	.snap-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.15rem 0.55rem;
		border-radius: 8px;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		background: rgba(0, 166, 192, 0.15);
		color: #00a6c0;
	}

	.snap-chip--muted {
		background: rgba(255, 255, 255, 0.06);
		color: var(--color-text-muted);
	}

	.snap-side {
		flex-shrink: 0;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #00a6c0;
		text-decoration: none;
	}

	.snap-side:hover {
		text-decoration: underline;
	}

	.snap-card {
		width: 4.5rem;
		height: 2.85rem;
		flex-shrink: 0;
		border-radius: 8px;
		background: linear-gradient(135deg, #0d3a44 0%, #00a6c0 55%, #21e68c 140%);
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow: 0 6px 16px rgba(0, 166, 192, 0.18);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 0.4rem 0.45rem 0.35rem;
	}

	.snap-card__chip {
		width: 0.85rem;
		height: 0.6rem;
		border-radius: 2px;
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
		opacity: 0.9;
	}

	.snap-card__digits {
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: rgba(255, 255, 255, 0.92);
		font-variant-numeric: tabular-nums;
		align-self: flex-end;
	}

	.snap-alert {
		margin: 0;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		font-size: 0.8125rem;
		line-height: 1.45;
		color: #fbbf24;
		background: rgba(251, 191, 36, 0.08);
		border: 1px solid rgba(251, 191, 36, 0.22);
	}

	.snap-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1rem;
		padding-top: 0.25rem;
	}

	.snap-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.5rem;
		background: rgba(0, 166, 192, 0.1);
		border: 1px solid rgba(0, 166, 192, 0.3);
		border-radius: 12px;
		color: #00a6c0;
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.3s ease;
	}

	.snap-cta:hover {
		background: rgba(0, 166, 192, 0.15);
		border-color: rgba(0, 166, 192, 0.4);
		transform: translateY(-1px);
	}

	.snap-cta__icon {
		width: 1rem;
		height: 1rem;
	}

	.snap-ghost {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.snap-ghost:hover {
		color: var(--color-text-primary);
		text-decoration: underline;
	}

	.snap-empty {
		text-align: center;
		padding: 1.5rem 0.5rem;
	}

	.snap-empty__title {
		margin: 0 0 0.4rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.snap-empty__text {
		margin: 0 0 1rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.snap-link {
		color: #00a6c0;
		font-weight: 500;
		text-decoration: none;
	}

	.snap-link:hover {
		text-decoration: underline;
	}

	.snap-skel {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.snap-skel__bar {
		height: 4.5rem;
		border-radius: 20px;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04) 0%,
			rgba(255, 255, 255, 0.08) 50%,
			rgba(255, 255, 255, 0.04) 100%
		);
		background-size: 200% 100%;
		animation: snapPulse 1.4s ease-in-out infinite;
	}

	.snap-skel__bar--short {
		height: 3.25rem;
		width: 72%;
	}

	@keyframes snapPulse {
		0% {
			background-position: 100% 0;
		}
		100% {
			background-position: -100% 0;
		}
	}

	@media (max-width: 640px) {
		.snap-row {
			flex-wrap: wrap;
		}

		.snap-side {
			width: 100%;
			margin-left: 0;
		}

		.snap-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.snap-cta {
			justify-content: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.snap-skel__bar {
			animation: none;
		}

		.snap-cta:hover {
			transform: none;
		}
	}
</style>
