<!-- src/routes/control-panel/billing/plans/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { billingService } from '$lib/services/billingService.js';
	import CheckoutModal from '$lib/components/CheckoutModal.svelte';

	let loading = true;
	let plans = [];
	let currentPlanCode = null;
	let savedMethods = [];
	let error = null;

	let cycle = 'MONTHLY'; // 'MONTHLY' | 'YEARLY'
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
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			maximumFractionDigits: 0
		}).format(v ?? 0);
	}

	function yearlyMonthly(plan) {
		// Precio mensual equivalente cuando se paga anual
		return Number(plan.pricing?.yearly ?? plan.price_yearly ?? 0) / 12;
	}

	function savings(plan) {
		const monthly = Number(plan.pricing?.monthly ?? plan.price_monthly ?? 0);
		const yearlySplit = yearlyMonthly(plan);
		if (!monthly || !yearlySplit) return 0;
		return Math.round(((monthly - yearlySplit) / monthly) * 100);
	}

	function currentPrice(plan) {
		if (cycle === 'YEARLY') return yearlyMonthly(plan);
		return Number(plan.pricing?.monthly ?? plan.price_monthly ?? 0);
	}

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

	function openCheckout(plan) {
		selectedPlan = plan;
		showCheckout = true;
	}

	/** @param {unknown} feat */
	function featureText(feat) {
		if (feat == null) return '—';
		if (typeof feat === 'string' || typeof feat === 'number') return String(feat);
		if (typeof feat === 'object') {
			const o = /** @type {{ label?: string; text?: string }} */ (feat);
			return o.label ?? o.text ?? '—';
		}
		return '—';
	}

	// Capabilities a comparar en la tabla
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
		if (row.type === 'bool') return v ? '✓' : null; // null = X
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
	<!-- ── Intro ─────────────────────────────────────────────────────────────── -->
	<div class="plans-intro">
		<div>
			<p class="plans-intro__eyebrow">Planes NEXUS</p>
			<h2 class="plans-intro__title">Elige el plan adecuado para tu flota</h2>
			<p class="plans-intro__sub">
				Todos los planes incluyen acceso completo a la plataforma. Sin contratos forzosos.
			</p>
		</div>
	</div>

	<!-- ── Toggle ciclo ──────────────────────────────────────────────────────── -->
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
				<span class="save-badge">Ahorra hasta {Math.max(...plans.map(savings))}%</span>
			</button>
		</div>
	</div>

	<!-- ── Cards de planes ───────────────────────────────────────────────────── -->
	<div class="plan-cards" style="--count:{plans.length}">
		{#each plans as plan (plan.id)}
			{@const popular = isPopular(plan)}
			{@const current = isCurrent(plan)}
			{@const price = currentPrice(plan)}
			{@const savePct = savings(plan)}

			<div class="plan-card" class:plan-card--popular={popular} class:plan-card--current={current}>
				{#if popular && !current}
					<div class="plan-badge plan-badge--popular">Más popular</div>
				{/if}
				{#if current}
					<div class="plan-badge plan-badge--current">
						<span class="dot dot--green"></span>Tu plan actual
					</div>
				{/if}

				<div class="plan-card__head">
					<h3 class="plan-card__name">{plan.name}</h3>
					{#if plan.description}
						<p class="plan-card__desc">{plan.description}</p>
					{/if}
				</div>

				<div class="plan-card__price">
					<span class="plan-card__amount">{fmtMxn(price)}</span>
					<span class="plan-card__period">/mes</span>
					{#if cycle === 'YEARLY'}
						<div class="plan-card__yearly-note">
							{fmtMxn(Number(plan.pricing?.yearly ?? plan.price_yearly ?? 0))} facturado anualmente
							{#if savePct > 0}
								<span class="plan-card__save">–{savePct}%</span>
							{/if}
						</div>
					{/if}
				</div>

				{#if plan.highlighted_features || plan.features?.highlighted}
					<ul class="plan-card__features">
						{#each plan.highlighted_features ?? plan.features?.highlighted ?? [] as feat, i (i)}
							<li>
								<svg
									width="13"
									height="13"
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
				{/if}

				{#if current}
					<div class="plan-card__cta plan-card__cta--current">Plan activo</div>
				{:else}
					<button
						type="button"
						on:click={() => openCheckout(plan)}
						class="plan-card__cta"
						class:plan-card__cta--popular={popular}
					>
						{currentPlanCode ? 'Cambiar a este plan' : 'Contratar plan'}
						<svg
							width="13"
							height="13"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					</button>
				{/if}
			</div>
		{/each}
	</div>

	<!-- ── Tabla comparativa ─────────────────────────────────────────────────── -->
	<div class="compare-wrap">
		<p class="compare-title">Comparativa completa</p>
		<div class="compare-scroll">
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

	<!-- ── FAQ / nota ────────────────────────────────────────────────────────── -->
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
			Precios <strong>sin IVA</strong>. El IVA del 16% aplica al momento del cobro. Puedes cancelar
			en cualquier momento desde tu panel. ¿Necesitas un plan personalizado o mayor capacidad?
			Escríbenos a
			<a href="mailto:ventas@geminislabs.io" class="note-link">ventas@geminislabs.io</a>.
		</p>
	</div>
{/if}

<!-- ── Checkout modal ──────────────────────────────────────────────────────── -->
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
		}}
	/>
{/if}

<style>
	/* ── Loading / error ─────────────────────────────────────────────────────── */
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

	/* ── Intro ───────────────────────────────────────────────────────────────── */
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

	/* ── Cycle toggle ────────────────────────────────────────────────────────── */
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

	/* ── Plan cards ──────────────────────────────────────────────────────────── */
	.plan-cards {
		display: grid;
		grid-template-columns: repeat(var(--count, 3), 1fr);
		gap: 16px;
		margin-bottom: 32px;
		align-items: start;
	}
	.plan-card {
		position: relative;
		border-radius: 20px;
		padding: 24px;
		background: rgba(10, 16, 26, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.07);
		transition:
			border-color 0.2s,
			transform 0.2s;
	}
	.plan-card:hover {
		border-color: rgba(255, 255, 255, 0.12);
		transform: translateY(-2px);
	}
	.plan-card--popular {
		border-color: rgba(99, 102, 241, 0.4);
		box-shadow:
			0 0 0 1px rgba(99, 102, 241, 0.1),
			0 12px 40px rgba(0, 0, 0, 0.3);
		background: rgba(15, 20, 35, 0.8);
	}
	.plan-card--current {
		border-color: rgba(52, 211, 153, 0.3);
	}

	.plan-badge {
		position: absolute;
		top: -12px;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 99px;
		padding: 4px 14px;
		font-size: 11px;
		font-weight: 700;
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.plan-badge--popular {
		background: linear-gradient(135deg, #6366f1, #7c3aed);
		color: #fff;
	}
	.plan-badge--current {
		background: rgba(52, 211, 153, 0.12);
		border: 1px solid rgba(52, 211, 153, 0.3);
		color: #34d399;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}
	.dot--green {
		background: #4ade80;
	}

	.plan-card__head {
		margin-bottom: 16px;
		padding-top: 8px;
	}
	.plan-card__name {
		font-size: 17px;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0 0 6px;
	}
	.plan-card__desc {
		font-size: 12px;
		color: #475569;
		line-height: 1.6;
		margin: 0;
	}

	.plan-card__price {
		margin-bottom: 20px;
	}
	.plan-card__amount {
		font-size: 32px;
		font-weight: 900;
		color: #fff;
		letter-spacing: -0.04em;
		font-variant-numeric: tabular-nums;
	}
	.plan-card__period {
		font-size: 14px;
		color: #475569;
		margin-left: 2px;
	}
	.plan-card__yearly-note {
		font-size: 11px;
		color: #475569;
		margin-top: 5px;
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.plan-card__save {
		background: rgba(52, 211, 153, 0.12);
		border: 1px solid rgba(52, 211, 153, 0.25);
		color: #34d399;
		border-radius: 6px;
		padding: 1px 6px;
		font-size: 10px;
		font-weight: 700;
	}

	.plan-card__features {
		list-style: none;
		padding: 0;
		margin: 0 0 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.plan-card__features li {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-size: 12px;
		color: #94a3b8;
	}
	.plan-card__features svg {
		flex-shrink: 0;
		margin-top: 1px;
		color: #4ade80;
	}

	.plan-card__cta {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		border-radius: 12px;
		padding: 12px;
		font-size: 13px;
		font-weight: 700;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.05);
		color: #94a3b8;
		cursor: pointer;
		text-decoration: none;
		transition: all 0.15s;
	}
	.plan-card__cta:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #e2e8f0;
	}
	.plan-card__cta--popular {
		background: linear-gradient(135deg, #6366f1, #7c3aed);
		color: #fff;
		border: none;
		box-shadow: 0 2px 12px rgba(99, 102, 241, 0.3);
	}
	.plan-card__cta--popular:hover {
		filter: brightness(1.1);
	}
	.plan-card__cta--current {
		background: rgba(52, 211, 153, 0.06);
		border-color: rgba(52, 211, 153, 0.2);
		color: #4ade80;
		cursor: default;
	}

	/* ── Compare table ───────────────────────────────────────────────────────── */
	.compare-wrap {
		margin-bottom: 20px;
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
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: rgba(10, 16, 26, 0.5);
	}
	.compare-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
		table-layout: fixed;
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
		padding: 11px 16px;
		text-align: center;
		vertical-align: middle;
	}
	.compare-td--label {
		text-align: left;
		font-size: 12px;
		color: #64748b;

		padding: 0 16px 0 24px; /* 👈 más aire a la izquierda */
		line-height: 1.4;

		white-space: normal; /* 👈 permite respirar si es largo */
		min-width: 220px; /* 👈 columna más cómoda */
	}
	.compare-td--popular {
		background: rgba(99, 102, 241, 0.03);
	}
	.cap-val {
		font-size: 13px;
		font-weight: 600;
		color: #cbd5e1;
	}

	/* ── Note ────────────────────────────────────────────────────────────────── */
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

	.compare-td {
		padding: 0; /* importante para centrar perfecto */
		height: 44px; /* altura uniforme */
	}

	.cell-center {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	/* Íconos */
	.icon-check,
	.icon-x {
		width: 18px;
		height: 18px;
		stroke-width: 2.5;
		fill: none;
		display: block; /* 🔥 elimina problemas de baseline */
	}

	.icon-check {
		stroke: #4ade80;
	}

	.icon-x {
		stroke: #334155;
		opacity: 0.7;
	}

	/* Texto centrado igual que iconos */
	.cap-val {
		font-size: 13px;
		font-weight: 600;
		color: #cbd5e1;
		display: block;
	}

	/* ── Responsive ──────────────────────────────────────────────────────────── */
	@media (max-width: 900px) {
		.plan-cards {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (max-width: 580px) {
		.plan-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
