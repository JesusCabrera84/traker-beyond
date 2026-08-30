<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { billingService } from '$lib/services/billingService.js';
	import CheckoutModal from '$lib/components/CheckoutModal.svelte';
	import { formatMxn, multiplyAmount } from '$lib/utils/currency.js';

	let loading = true;
	let plans = [];
	let currentPlanCode = null;
	let savedMethods = [];
	let error = null;

	let cycle = 'MONTHLY';
	let showCheckout = false;
	let selectedPlan = null;

	onMount(async () => {
		try {
			const [rawPlans, summary, methods] = await Promise.all([
				billingService.getPlans(),
				billingService.getSummary().catch(() => null),
				billingService.getPaymentMethods('stripe').catch(() => [])
			]);
			plans = rawPlans;
			currentPlanCode = summary?.current_plan?.plan_code ?? null;
			savedMethods = Array.isArray(methods) ? methods : [];
		} catch (e) {
			error = e.message ?? 'No se pudieron cargar los planes.';
		} finally {
			loading = false;
		}
	});

	function fmtMxn(v) {
		return formatMxn(v);
	}

	function quoteFor(plan, cyc = cycle) {
		return cyc === 'YEARLY' ? plan.pricing?.yearly_quote : plan.pricing?.monthly_quote;
	}

	function savings(plan) {
		return plan.pricing?.yearly_savings_percent ?? 0;
	}

	/** Lo que costaría el año si se pagara mes a mes. No es el cargo anual. */
	function yearAtMonthlyPrice(plan) {
		const monthlyTotal = plan.pricing?.monthly_quote?.total;
		if (monthlyTotal == null || monthlyTotal === '') return null;
		try {
			return multiplyAmount(monthlyTotal, 12);
		} catch {
			return null;
		}
	}

	$: maxYearlySave = plans.length ? Math.max(0, ...plans.map(savings)) : 0;

	function isPopular(plan) {
		return plan.features?.is_popular === true || plan.is_popular === true;
	}

	function isCurrent(plan) {
		return plan.code === currentPlanCode;
	}

	function capVal(plan, key) {
		const caps = plan.capabilities ?? {};
		return caps[key] ?? null;
	}

	function highlightList(plan) {
		return plan.highlighted_features ?? plan.features?.highlighted ?? [];
	}

	function openCheckout(plan) {
		selectedPlan = plan;
		showCheckout = true;
	}

	function featureText(feat) {
		if (feat == null) return '—';
		if (typeof feat === 'string' || typeof feat === 'number') return String(feat);
		if (typeof feat === 'object') {
			return feat.label ?? feat.text ?? '—';
		}
		return '—';
	}

	const capRows = [
		{ key: 'max_devices', label: 'Dispositivos GPS', type: 'int' },
		{ key: 'max_units', label: 'Unidades / Vehículos', type: 'int' },
		{ key: 'max_geofences', label: 'Geocercas activas', type: 'int' },
		{ key: 'max_users', label: 'Usuarios', type: 'int' },
		{ key: 'history_days', label: 'Historial de ubicaciones', type: 'days' },
		{ key: 'real_time_alerts', label: 'Alertas en tiempo real', type: 'bool' },
		{ key: 'analytics_tools', label: 'Analytics avanzado', type: 'bool' },
		{ key: 'export_data', label: 'Exportación de datos', type: 'bool' },
		{ key: 'ai_features', label: 'Funciones de IA', type: 'bool' },
		{ key: 'custom_reports', label: 'Reportes personalizados', type: 'bool' },
		{ key: 'api_access', label: 'Acceso API (Orion)', type: 'bool' },
		{ key: 'priority_support', label: 'Soporte prioritario 24/7', type: 'bool' }
	];

	function displayCap(plan, row) {
		const v = capVal(plan, row.key);
		if (v === null || v === undefined) return '—';
		if (row.type === 'bool') return v ? '✓' : null;
		if (row.type === 'days') return `${v} días`;
		if (row.type === 'int') return v >= 999 ? 'Ilimitado' : `${v}`;
		return String(v);
	}
</script>

<svelte:head><title>Planes — Facturación | Geminis Labs</title></svelte:head>

{#if loading}
	<div class="plans-loading">
		<div class="spinner"></div>
		<p>Cargando planes…</p>
	</div>
{:else if error}
	<div class="error-card">
		<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f87171" stroke-width="1.5">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
			/>
		</svg>
		<p>{error}</p>
	</div>
{:else if plans.length === 0}
	<div class="empty-state">
		<p>No hay planes disponibles en este momento. Contacta a soporte.</p>
	</div>
{:else}
	<div class="plans-intro">
		<div>
			<p class="plans-intro__eyebrow">Planes NEXUS</p>
			<h2 class="plans-intro__title">Elige el plan adecuado para tu flota</h2>
			<p class="plans-intro__sub">
				{#if cycle === 'YEARLY'}
					El precio anual es un solo cargo por 12 meses, no 12 pagos mensuales.
				{:else}
					Todos los planes incluyen acceso completo a la plataforma. Sin contratos forzosos.
				{/if}
			</p>
		</div>
	</div>

	<div class="cycle-toggle-wrap">
		<div class="cycle-toggle">
			<button
				type="button"
				class="cycle-btn"
				class:cycle-btn--active={cycle === 'MONTHLY'}
				on:click={() => (cycle = 'MONTHLY')}>Mensual</button
			>
			<button
				type="button"
				class="cycle-btn"
				class:cycle-btn--active={cycle === 'YEARLY'}
				on:click={() => (cycle = 'YEARLY')}
			>
				Anual
				{#if maxYearlySave > 0}
					<span class="save-badge">Ahorra hasta {maxYearlySave}%</span>
				{/if}
			</button>
		</div>
	</div>

	<div class="plan-mini-grid">
		{#each plans as plan (plan.id)}
			{@const popular = isPopular(plan)}
			{@const current = isCurrent(plan)}
			{@const quoted = quoteFor(plan, cycle)}
			{@const savePct = savings(plan)}
			{@const monthlyYear = yearAtMonthlyPrice(plan)}
			<div class="plan-mini" class:plan-mini--popular={popular} class:plan-mini--current={current}>
				<div class="plan-mini__main">
					<div class="plan-mini__front">
						<div class="plan-mini__tags">
							{#if popular && !current}
								<span class="plan-mini__tag plan-mini__tag--popular">Popular</span>
							{/if}
							{#if current}
								<span class="plan-mini__tag plan-mini__tag--current">Tu plan</span>
							{/if}
						</div>
						<p class="plan-mini__name">{plan.name}</p>
						<div class="plan-mini__price-block">
							<p class="plan-mini__price">{fmtMxn(quoted?.total)}</p>
							<p class="plan-mini__period">
								{cycle === 'YEARLY' ? 'un solo cargo · 12 meses' : 'al mes'}
							</p>
							{#if cycle === 'YEARLY' && (savePct > 0 || monthlyYear)}
								<p class="plan-mini__yearly">
									{#if monthlyYear}
										<span class="plan-mini__was">{monthlyYear}</span>
										<span class="plan-mini__was-label">si pagaras mes a mes</span>
									{/if}
									{#if savePct > 0}
										<span class="plan-mini__save">−{savePct}%</span>
									{/if}
								</p>
							{/if}
							<p class="plan-mini__iva">IVA incluido</p>
						</div>
					</div>
					<div class="plan-mini__peek app-scrollbar">
						<p class="plan-mini__peek-label">Qué ofrece</p>
						{#if plan.description}
							<p class="plan-mini__desc">{plan.description}</p>
						{/if}
						{#if highlightList(plan).length > 0}
							<ul class="plan-mini__feature-list">
								{#each highlightList(plan) as feat, i (i)}
									<li>
										<svg
											width="12"
											height="12"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2.5"
											aria-hidden="true"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
										</svg>
										{featureText(feat)}
									</li>
								{/each}
							</ul>
						{:else}
							<p class="plan-mini__empty">
								Consulta la comparativa de abajo para límites y funciones.
							</p>
						{/if}
					</div>
				</div>
				<div class="plan-mini__footer">
					{#if current}
						<span class="plan-mini__cta plan-mini__cta--current">Plan activo</span>
					{:else}
						<button
							type="button"
							class="plan-mini__cta"
							class:plan-mini__cta--popular={popular}
							on:click={() => openCheckout(plan)}
						>
							{currentPlanCode ? 'Cambiar plan' : 'Contratar'}
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="compare-wrap">
		<p class="compare-title">Comparativa completa</p>
		<div class="compare-scroll app-scrollbar">
			<table class="compare-table">
				<thead>
					<tr>
						<th class="compare-th compare-th--feature">Característica</th>
						{#each plans as plan (plan.id)}
							<th class="compare-th" class:compare-th--popular={isPopular(plan)}>
								{plan.name}
								{#if isCurrent(plan)}<span class="current-tag">actual</span>{/if}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					<tr class="compare-row">
						<td class="compare-td compare-td--label">
							{cycle === 'YEARLY' ? 'Precio (12 meses)' : 'Precio mensual'}
						</td>
						{#each plans as plan (plan.id)}
							{@const quoted = quoteFor(plan, cycle)}
							<td class="compare-td compare-td--val" class:compare-td--popular={isPopular(plan)}>
								<div class="cell-center">
									<span class="cap-val cap-val--price">{fmtMxn(quoted?.total)}</span>
								</div>
							</td>
						{/each}
					</tr>
					{#each capRows as row (row.key)}
						<tr class="compare-row">
							<td class="compare-td compare-td--label">{row.label}</td>
							{#each plans as plan (plan.id)}
								{@const val = displayCap(plan, row)}
								<td class="compare-td compare-td--val" class:compare-td--popular={isPopular(plan)}>
									<div class="cell-center">
										{#if row.type === 'bool'}
											{#if val === '✓'}
												<svg class="icon-check" viewBox="0 0 24 24">
													<path d="M5 13l4 4L19 7" />
												</svg>
											{:else}
												<svg class="icon-x" viewBox="0 0 24 24">
													<path d="M6 18L18 6M6 6l12 12" />
												</svg>
											{/if}
										{:else}
											<span class="cap-val">{val}</span>
										{/if}
									</div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div class="plans-note">
		<svg
			width="13"
			height="13"
			fill="none"
			viewBox="0 0 24 24"
			stroke="#334155"
			stroke-width="2"
			style="flex-shrink:0; margin-top:1px;"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<p>
			Precios <strong>con IVA</strong> del 16%. El plan anual se cobra una sola vez por 12 meses; no
			son 12 cargos mensuales. Puedes cancelar en cualquier momento desde tu panel. ¿Necesitas un
			plan personalizado o mayor capacidad? Escríbenos a
			<a href="mailto:ventas@geminislabs.io" class="note-link">ventas@geminislabs.io</a>.
		</p>
	</div>
{/if}

{#if showCheckout && selectedPlan}
	<CheckoutModal
		plan={selectedPlan}
		initialCycle={cycle}
		{savedMethods}
		on:close={() => {
			showCheckout = false;
			selectedPlan = null;
		}}
		on:success={() => {
			showCheckout = false;
			selectedPlan = null;
			goto('/control-panel/billing/summary?checkout=success');
		}}
		on:pending={() => {
			showCheckout = false;
			selectedPlan = null;
			goto('/control-panel/billing/summary?checkout=pending');
		}}
	/>
{/if}

<style>
	.plans-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 64px 0;
		color: #475569;
		font-size: 13px;
	}
	.spinner {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 3px solid rgba(99, 102, 241, 0.15);
		border-top-color: #6366f1;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
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
	.empty-state {
		text-align: center;
		padding: 48px;
		font-size: 13px;
		color: #475569;
	}

	.plans-intro {
		margin-bottom: 24px;
	}
	.plans-intro__eyebrow {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #6366f1;
		margin: 0 0 6px;
	}
	.plans-intro__title {
		font-size: 22px;
		font-weight: 800;
		color: #f1f5f9;
		margin: 0 0 6px;
		letter-spacing: -0.03em;
	}
	.plans-intro__sub {
		font-size: 13px;
		color: #475569;
		margin: 0;
	}

	.cycle-toggle-wrap {
		display: flex;
		margin-bottom: 24px;
	}
	.cycle-toggle {
		display: inline-flex;
		gap: 4px;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 10px;
		padding: 4px;
	}
	.cycle-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 7px 16px;
		border-radius: 7px;
		border: none;
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		color: #475569;
		background: none;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.cycle-btn--active {
		background: linear-gradient(135deg, #6366f1, #7c3aed);
		color: #fff;
	}
	.save-badge {
		background: rgba(52, 211, 153, 0.15);
		border: 1px solid rgba(52, 211, 153, 0.25);
		color: #34d399;
		border-radius: 99px;
		padding: 1px 7px;
		font-size: 10px;
		font-weight: 700;
	}

	.plan-mini-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		align-items: stretch;
		margin-bottom: 20px;
	}
	@media (min-width: 640px) {
		.plan-mini-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1024px) {
		.plan-mini-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.plan-mini {
		display: flex;
		flex-direction: column;
		min-height: 280px;
		border-radius: 16px;
		background: rgba(10, 16, 26, 0.65);
		border: 1px solid rgba(255, 255, 255, 0.07);
		overflow: hidden;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}
	.plan-mini--popular {
		border-color: rgba(99, 102, 241, 0.45);
		box-shadow:
			0 0 0 1px rgba(99, 102, 241, 0.08),
			0 10px 36px rgba(0, 0, 0, 0.35);
		background: rgba(14, 18, 32, 0.85);
	}
	.plan-mini--current {
		border-color: rgba(52, 211, 153, 0.35);
		background: rgba(10, 26, 22, 0.45);
	}
	@media (hover: hover) {
		.plan-mini:hover {
			border-color: rgba(255, 255, 255, 0.14);
		}
		.plan-mini--popular:hover {
			border-color: rgba(99, 102, 241, 0.55);
		}
	}

	.plan-mini__main {
		flex: 1;
		position: relative;
		min-height: 200px;
	}
	.plan-mini__front {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 18px 14px;
		transition: opacity 0.22s ease;
		z-index: 1;
	}
	.plan-mini__tags {
		min-height: 22px;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: center;
		margin-bottom: 10px;
	}
	.plan-mini__tag {
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		border-radius: 99px;
		padding: 3px 9px;
	}
	.plan-mini__tag--popular {
		background: linear-gradient(135deg, #6366f1, #7c3aed);
		color: #fff;
	}
	.plan-mini__tag--current {
		background: rgba(52, 211, 153, 0.12);
		border: 1px solid rgba(52, 211, 153, 0.28);
		color: #34d399;
	}
	.plan-mini__name {
		margin: 0 0 12px;
		font-size: 15px;
		font-weight: 800;
		color: #f1f5f9;
		line-height: 1.3;
		letter-spacing: -0.02em;
	}
	.plan-mini__price-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.plan-mini__price {
		margin: 0;
		font-size: 22px;
		font-weight: 900;
		color: #fff;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.04em;
	}
	.plan-mini__period {
		margin: 0;
		font-size: 11px;
		font-weight: 600;
		color: #94a3b8;
		letter-spacing: 0.02em;
	}
	.plan-mini__yearly {
		margin: 2px 0 0;
		font-size: 10px;
		color: #64748b;
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		justify-content: center;
		line-height: 1.35;
	}
	.plan-mini__was {
		text-decoration: line-through;
		color: #64748b;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.plan-mini__was-label {
		color: #475569;
	}
	.plan-mini__save {
		background: rgba(52, 211, 153, 0.12);
		border: 1px solid rgba(52, 211, 153, 0.22);
		color: #34d399;
		border-radius: 5px;
		padding: 1px 5px;
		font-size: 9px;
		font-weight: 700;
	}
	.plan-mini__iva {
		margin: 2px 0 0;
		font-size: 10px;
		color: #475569;
	}

	.plan-mini__peek {
		position: absolute;
		inset: 0;
		z-index: 2;
		padding: 12px 12px 10px;
		overflow-y: auto;
		overflow-x: hidden;
		background: rgba(11, 16, 26, 0.96);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 0.22s ease,
			visibility 0.22s ease;
		pointer-events: none;
		text-align: left;
	}
	.plan-mini__peek-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #6366f1;
		margin: 0 0 8px;
	}
	.plan-mini__desc {
		font-size: 11px;
		color: #64748b;
		line-height: 1.5;
		margin: 0 0 10px;
	}
	.plan-mini__feature-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 7px;
	}
	.plan-mini__feature-list li {
		display: flex;
		align-items: flex-start;
		gap: 7px;
		font-size: 11px;
		color: #cbd5e1;
		line-height: 1.35;
	}
	.plan-mini__feature-list svg {
		flex-shrink: 0;
		margin-top: 1px;
		color: #4ade80;
	}
	.plan-mini__empty {
		font-size: 11px;
		color: #475569;
		line-height: 1.45;
		margin: 0;
	}

	@media (hover: hover) {
		.plan-mini:hover .plan-mini__peek {
			opacity: 1;
			visibility: visible;
			pointer-events: auto;
		}
		.plan-mini:hover .plan-mini__front {
			opacity: 0;
			pointer-events: none;
		}
	}

	.plan-mini__footer {
		flex-shrink: 0;
		padding: 12px 14px 14px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(0, 0, 0, 0.15);
	}
	.plan-mini__cta {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px 14px;
		border-radius: 11px;
		font-size: 12px;
		font-weight: 700;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.06);
		color: #94a3b8;
		cursor: pointer;
		transition: all 0.15s;
	}
	.plan-mini__cta:hover {
		background: rgba(255, 255, 255, 0.09);
		color: #e2e8f0;
	}
	.plan-mini__cta:focus-visible {
		outline: 2px solid rgba(99, 102, 241, 0.5);
		outline-offset: 2px;
	}
	.plan-mini__cta--popular {
		background: linear-gradient(135deg, #6366f1, #7c3aed);
		color: #fff;
		border: none;
		box-shadow: 0 2px 12px rgba(99, 102, 241, 0.28);
	}
	.plan-mini__cta--popular:hover {
		filter: brightness(1.07);
	}
	.plan-mini__cta--current {
		background: rgba(52, 211, 153, 0.08);
		border-color: rgba(52, 211, 153, 0.22);
		color: #4ade80;
		cursor: default;
	}

	.compare-wrap {
		margin-bottom: 20px;
		padding-left: clamp(12px, 3vw, 28px);
		padding-right: clamp(12px, 3vw, 28px);
		box-sizing: border-box;
		width: 100%;
		max-width: 100%;
	}
	.compare-title {
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #334155;
		margin: 0 0 12px;
	}
	.compare-scroll {
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior-x: contain;
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: rgba(10, 16, 26, 0.5);
		width: 100%;
		max-width: 100%;
	}
	.compare-table {
		width: max-content;
		min-width: 100%;
		border-collapse: collapse;
		font-size: 13px;
		table-layout: auto;
	}
	.compare-th {
		padding: 12px 16px;
		text-align: center;
		font-size: 10px;
		font-weight: 700;
		color: #334155;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		background: rgba(0, 0, 0, 0.2);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		white-space: nowrap;
		width: 130px;
	}
	.compare-th--feature {
		text-align: left;
		padding-left: 24px;
		min-width: 220px;
	}
	.compare-th--popular {
		color: #a5b4fc;
	}
	.current-tag {
		display: inline-block;
		margin-left: 6px;
		background: rgba(52, 211, 153, 0.12);
		border: 1px solid rgba(52, 211, 153, 0.25);
		color: #34d399;
		border-radius: 5px;
		padding: 1px 6px;
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
	}
	.compare-row {
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}
	.compare-row:last-child {
		border-bottom: none;
	}
	.compare-row:hover {
		background: rgba(255, 255, 255, 0.01);
	}
	.compare-td {
		padding: 0;
		height: 44px;
		text-align: center;
		vertical-align: middle;
	}
	.compare-td--label {
		text-align: left;
		font-size: 12px;
		color: #64748b;
		padding: 0 16px 0 24px;
		line-height: 1.4;
		white-space: normal;
		min-width: 220px;
	}
	.compare-td--popular {
		background: rgba(99, 102, 241, 0.03);
	}
	.cell-center {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	.icon-check,
	.icon-x {
		width: 18px;
		height: 18px;
		stroke-width: 2.5;
		fill: none;
		display: block;
	}
	.icon-check {
		stroke: #4ade80;
	}
	.icon-x {
		stroke: #334155;
		opacity: 0.7;
	}
	.cap-val {
		font-size: 13px;
		font-weight: 600;
		color: #cbd5e1;
		display: block;
	}
	.cap-val--price {
		font-variant-numeric: tabular-nums;
		color: #f1f5f9;
	}

	.plans-note {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.04);
		border-radius: 10px;
		padding: 12px 16px;
	}
	.plans-note p {
		margin: 0;
		font-size: 11px;
		color: #334155;
		line-height: 1.7;
	}
	.plans-note strong {
		color: #475569;
	}
	.note-link {
		color: #6366f1;
		text-decoration: none;
	}
	.note-link:hover {
		text-decoration: underline;
	}
</style>
