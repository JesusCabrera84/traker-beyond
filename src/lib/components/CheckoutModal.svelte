<script>
	import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
	import { billingService } from '$lib/services/billingService.js';
	import {
		getOrCreatePaymentIdempotencyKey,
		clearPaymentIdempotencyKey
	} from '$lib/utils/idempotency.js';
	import { formatMxn } from '$lib/utils/currency.js';

	export let plan;
	export let initialCycle = 'MONTHLY';
	export let savedMethods = [];

	const dispatch = createEventDispatcher();

	let visible = false;
	let cycle = initialCycle;
	let step = 'confirm';

	let selectedPm = savedMethods.find((m) => m.is_default) ?? savedMethods[0] ?? null;
	let useNewCard = savedMethods.length === 0;

	let cardForm = null;
	let cardFormReady = false;

	let loading = false;
	let error = null;
	let settled = true;
	let quoting = false;

	// Cotización oficial del backend. La interfaz no calcula IVA ni redondea.
	let quote = null;

	$: amountBase = quote?.subtotal ?? null;
	$: amountIva = quote?.tax ?? null;
	$: amountTotal = quote?.total ?? null;
	$: amountCents = quote?.amount_cents ?? null;

	function fmtMxn(v) {
		return formatMxn(v);
	}

	onMount(async () => {
		await new Promise((r) => setTimeout(r, 50));
		visible = true;
		await loadQuote(cycle);
	});

	onDestroy(() => {
		const el = document.getElementById('checkout-card-el');
		if (el) el.innerHTML = '';
	});

	async function loadQuote(cyc) {
		quoting = true;
		error = null;
		try {
			quote = await billingService.getQuote(plan.id, cyc);
		} catch (e) {
			quote = null;
			error = e.message ?? 'No se pudo obtener el precio';
		} finally {
			quoting = false;
		}
	}

	async function initNewCard() {
		step = 'new-card';
		loading = true;
		cardForm = null;
		cardFormReady = false;
		error = null;

		const existing = document.getElementById('checkout-card-el');
		if (existing) existing.innerHTML = '';

		if (!quote) await loadQuote(cycle);
		if (!Number.isInteger(amountCents) || amountCents <= 0) {
			error = 'No se pudo obtener el precio. Cierra e intenta de nuevo.';
			loading = false;
			return;
		}

		await tick();

		try {
			cardForm = await billingService.mountCardForm({
				mountId: 'checkout-card-el',
				amountCents,
				gateway: 'stripe'
			});
			cardFormReady = true;
		} catch (e) {
			error = e.message ?? 'Error al cargar el formulario de pago';
			if (savedMethods.length > 0) step = 'confirm';
		} finally {
			loading = false;
		}
	}

	async function pay() {
		if (!selectedPm || loading || !Number.isInteger(amountCents)) return;
		step = 'authorizing';
		loading = true;
		error = null;

		try {
			const pi = await billingService.createPaymentIntent({
				planId: plan.id,
				billingCycle: cycle,
				gateway: 'stripe',
				idempotencyKey: getOrCreatePaymentIdempotencyKey(plan.id, cycle)
			});

			if (repriced(pi) !== null) {
				step = 'confirm';
				loading = false;
				return;
			}

			step = 'authorizing';
			const returnUrl = `${window.location.origin}/control-panel/billing/summary?checkout=resume`;
			const { error: err, paymentIntent } = await billingService.confirmWithSavedPM({
				clientSecret: pi.client_token,
				paymentMethodToken: selectedPm.external_token,
				returnUrl,
				gateway: 'stripe'
			});

			if (err) {
				error = xlateStripeError(err);
				step = 'confirm';
				loading = false;
				return;
			}

			await settleIntent(paymentIntent, pi.client_token);
		} catch (e) {
			if (isAlreadyPaidError(e)) {
				finishCheckout({ status: 'succeeded' }, 800);
				return;
			}
			error = e.message ?? 'Error al procesar el pago';
			step = 'confirm';
			loading = false;
		}
	}

	async function confirmNewCard() {
		if (!cardForm || !cardFormReady || loading) return;
		loading = true;
		error = null;

		try {
			const { error: submitErr } = await cardForm.submit();
			if (submitErr) {
				error = xlateStripeError(submitErr);
				step = 'new-card';
				loading = false;
				return;
			}

			const pi = await billingService.createPaymentIntent({
				planId: plan.id,
				billingCycle: cycle,
				gateway: 'stripe',
				idempotencyKey: getOrCreatePaymentIdempotencyKey(plan.id, cycle)
			});

			const newCents = repriced(pi);
			if (newCents !== null) {
				cardForm.updateAmount?.(newCents);
				step = 'new-card';
				loading = false;
				return;
			}

			step = 'authorizing';
			await tick();
			const returnUrl = `${window.location.origin}/control-panel/billing/summary?checkout=resume`;
			const { error: err, paymentIntent } = await cardForm.confirmPayment(
				pi.client_token,
				returnUrl
			);

			if (err) {
				error = xlateStripeError(err);
				step = 'new-card';
				loading = false;
				return;
			}

			await settleIntent(paymentIntent, pi.client_token);
		} catch (e) {
			if (isAlreadyPaidError(e)) {
				finishCheckout({ status: 'succeeded' }, 800);
				return;
			}
			error = e.message ?? 'Error al procesar el pago';
			step = 'new-card';
			loading = false;
		}
	}

	async function selectCycle(val) {
		if (cycle === val || loading || quoting) return;
		cycle = val;
		error = null;
		await loadQuote(val);
		if (Number.isInteger(amountCents)) {
			cardForm?.updateAmount?.(amountCents);
		}
	}

	function goBackToConfirm() {
		step = 'confirm';
		useNewCard = false;
		cardForm = null;
		cardFormReady = false;
		const el = document.getElementById('checkout-card-el');
		if (el) el.innerHTML = '';
	}

	function close() {
		dispatch('close');
	}

	function brandMeta(brand) {
		const b = (brand ?? '').toLowerCase();
		if (b === 'visa') return { label: 'Visa', color: '#2563eb' };
		if (b === 'mastercard' || b === 'mc') return { label: 'Mastercard', color: '#dc2626' };
		if (b === 'amex') return { label: 'Amex', color: '#0284c7' };
		return { label: (brand ?? 'Tarjeta').toUpperCase(), color: '#475569' };
	}

	/**
	 * Si el banco pide autorización, esta ventana espera. No se cobra de nuevo.
	 * Sólo `succeeded` / `requires_capture` se anuncian como pago concretado.
	 */
	async function settleIntent(paymentIntent, clientSecret) {
		let pi = paymentIntent;
		const pending = pi?.status === 'requires_action' || pi?.status === 'processing';
		if (pending && clientSecret) {
			step = 'authorizing';
			const waited = await billingService.waitForPaymentIntent(clientSecret);
			if (waited.error) {
				error = xlateStripeError(waited.error);
				step = savedMethods.length && !useNewCard ? 'confirm' : 'new-card';
				loading = false;
				return;
			}
			pi = waited.paymentIntent;
		}
		if (pi?.status === 'requires_payment_method' || pi?.status === 'canceled') {
			error = 'El banco no autorizó el cargo. Puedes intentar con otra tarjeta.';
			step = savedMethods.length && !useNewCard ? 'confirm' : 'new-card';
			loading = false;
			return;
		}
		finishCheckout(pi);
	}

	function finishCheckout(paymentIntent, delayMs = 1500) {
		const status = paymentIntent?.status;
		settled = !status || status === 'succeeded' || status === 'requires_capture';
		clearPaymentIdempotencyKey(plan.id, cycle);
		loading = false;
		step = 'done';
		setTimeout(() => dispatch(settled ? 'success' : 'pending'), delayMs);
	}

	/**
	 * Nunca se confirma un cargo por un importe que el cliente no vio.
	 * Se compara en centavos enteros, no en float.
	 * @returns {number|null} los nuevos centavos si cambió
	 */
	function repriced(pi) {
		const cents = pi?.amount_cents;
		if (!Number.isInteger(cents) || cents === amountCents) return null;
		quote = {
			subtotal: pi.amount_mxn,
			tax: pi.tax_mxn,
			total: pi.amount_with_iva,
			amount_cents: cents
		};
		error = `El precio de este plan cambió. El cargo sería de ${fmtMxn(pi.amount_with_iva)}. Revisa el importe y confirma de nuevo.`;
		return cents;
	}

	function isAlreadyPaidError(err) {
		return (
			err?.code === 'PAYMENT_ALREADY_PROCESSED' ||
			/ya fue procesado|ya fue pagado/i.test(err?.message ?? '')
		);
	}

	function xlateStripeError(err) {
		const codes = {
			card_declined: 'Tarjeta declinada. Intenta con otra.',
			insufficient_funds: 'Fondos insuficientes.',
			expired_card: 'La tarjeta está vencida.',
			incorrect_cvc: 'CVV incorrecto.',
			invalid_number: 'Número de tarjeta inválido.',
			authentication_required: 'Tu banco pide autorizar el cargo. Confírmalo en tu app.',
			processing_error: 'Error de procesamiento. Intenta de nuevo.'
		};
		return codes[err?.code] ?? err?.message ?? 'Error al procesar el pago.';
	}

	$: canPayWithSaved = !useNewCard && !!selectedPm && Number.isInteger(amountCents);
	$: yearlySave = Number(plan?.pricing?.yearly_savings_percent ?? 0);
	$: payLabel = amountTotal ? `Pagar ${fmtMxn(amountTotal)}` : 'Pagar';
</script>

<div
	class="backdrop"
	on:click|self={step !== 'processing' && step !== 'authorizing' ? close : undefined}
	on:keydown={(e) =>
		e.key === 'Escape' && step !== 'processing' && step !== 'authorizing' && close()}
	role="dialog"
	aria-modal="true"
	aria-label="Completar pago"
	tabindex="-1"
>
	<div class="modal" class:modal--visible={visible}>
		<div class="modal-head">
			<div>
				<h2 class="modal-title">
					{#if step === 'done'}{settled ? 'Pago listo' : 'Estamos confirmando'}
					{:else if step === 'authorizing' || step === 'processing'}Confirma en tu banco
					{:else if step === 'new-card'}Tu tarjeta
					{:else}Pagar {plan.name}{/if}
				</h2>
				<p class="modal-sub">
					{#if step === 'new-card'}
						Los datos van a Stripe. Nosotros no los vemos.
					{:else if step === 'authorizing' || step === 'processing'}
						{plan.name} · {fmtMxn(amountTotal)}
					{:else if step === 'done'}
						{plan.name}
					{:else}
						{cycle === 'YEARLY' ? '12 meses · un solo cargo' : '1 mes'} · IVA incluido
					{/if}
				</p>
			</div>

			{#if step !== 'processing' && step !== 'authorizing' && step !== 'done'}
				<button
					class="close-btn"
					type="button"
					on:click={step === 'new-card' && savedMethods.length > 0 ? goBackToConfirm : close}
					aria-label={step === 'new-card' && savedMethods.length > 0 ? 'Volver' : 'Cerrar'}
				>
					{#if step === 'new-card' && savedMethods.length > 0}
						<svg
							width="15"
							height="15"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
					{:else}
						<svg
							width="15"
							height="15"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{/if}
				</button>
			{/if}
		</div>

		{#if error}
			<div class="error-banner" role="alert">
				<svg
					width="14"
					height="14"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
					style="flex-shrink:0"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
				{error}
			</div>
		{/if}

		{#if step === 'confirm'}
			<div class="cycle-toggle" role="tablist" aria-label="Ciclo de facturación">
				{#each [['MONTHLY', 'Mensual'], ['YEARLY', 'Anual']] as [val, label] (val)}
					<button
						class="cycle-btn"
						class:cycle-btn--on={cycle === val}
						on:click={() => selectCycle(val)}
						disabled={loading || quoting}
						type="button"
					>
						{label}
						{#if val === 'YEARLY' && yearlySave > 0}
							<span class="cycle-save">−{yearlySave}%</span>
						{/if}
					</button>
				{/each}
			</div>

			<div class="price-box" aria-live="polite">
				{#if quoting || !quote}
					<div class="price-line">
						<span class="skel skel--label"></span><span class="skel skel--val"></span>
					</div>
					<div class="price-line">
						<span class="skel skel--label"></span><span class="skel skel--val"></span>
					</div>
					<div class="price-line price-line--total">
						<span class="skel skel--label"></span><span class="skel skel--big"></span>
					</div>
				{:else}
					<div class="price-line">
						<span class="price-line__label">{plan.name}</span>
						<span class="price-line__val">{fmtMxn(amountBase)}</span>
					</div>
					<div class="price-line">
						<span class="price-line__label">IVA (16%)</span>
						<span class="price-line__val price-line__val--dim">+ {fmtMxn(amountIva)}</span>
					</div>
					<div class="price-line price-line--total">
						<span class="price-line__label--bold"
							>{cycle === 'YEARLY' ? 'Total a pagar · 12 meses' : 'Total a pagar · 1 mes'}</span
						>
						<span class="price-line__big">{fmtMxn(amountTotal)}</span>
					</div>
					{#if cycle === 'YEARLY'}
						<p class="price-year-hint">Un solo cargo por el año. No son 12 pagos mensuales.</p>
					{/if}
				{/if}
			</div>

			<div class="pm-section">
				<p class="pm-section__title">Cómo pagas</p>

				{#if savedMethods.length > 0}
					<div class="pm-list">
						{#each savedMethods as pm (pm.external_token)}
							{@const meta = brandMeta(pm.brand)}
							<button
								class="pm-row"
								class:pm-row--on={selectedPm?.external_token === pm.external_token && !useNewCard}
								type="button"
								on:click={() => {
									selectedPm = pm;
									useNewCard = false;
								}}
							>
								<div
									class="pm-chip"
									style="background:{meta.color}18; border-color:{meta.color}40;"
								>
									<span class="pm-chip__label" style="color:{meta.color};">{meta.label}</span>
								</div>
								<div class="pm-row__meta">
									<p class="pm-row__last4">•••• {pm.last4}</p>
									<p class="pm-row__exp">
										{String(pm.exp_month).padStart(2, '0')}/{String(pm.exp_year).slice(-2)}
									</p>
								</div>
								{#if selectedPm?.external_token === pm.external_token && !useNewCard}
									<div class="pm-check" aria-hidden="true">
										<svg
											width="11"
											height="11"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="3"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
										</svg>
									</div>
								{/if}
							</button>
						{/each}
					</div>
					<button
						class="add-btn"
						type="button"
						on:click={() => {
							useNewCard = true;
							selectedPm = null;
							initNewCard();
						}}
					>
						<svg
							width="14"
							height="14"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						Usar otra tarjeta
					</button>
				{:else}
					<p class="pm-empty">
						Aún no tienes una tarjeta guardada. En el siguiente paso la agregas.
					</p>
				{/if}
			</div>

			<div class="cta-row">
				<button class="btn-cancel" type="button" on:click={close}>Cancelar</button>
				{#if savedMethods.length === 0}
					<button
						class="btn-pay"
						type="button"
						on:click={initNewCard}
						disabled={loading || quoting || !Number.isInteger(amountCents)}
					>
						Continuar
					</button>
				{:else}
					<button
						class="btn-pay"
						type="button"
						on:click={pay}
						disabled={loading || quoting || !canPayWithSaved}
					>
						{payLabel}
					</button>
				{/if}
			</div>
			<p class="trust-note">Pago seguro con Stripe · IVA incluido</p>
		{:else if step === 'new-card'}
			<div class="price-recap">
				<span class="price-recap__label"
					>{plan.name} · {cycle === 'YEARLY' ? '12 meses · un solo cargo' : '1 mes'}</span
				>
				<span class="price-recap__total">{fmtMxn(amountTotal)}</span>
			</div>
			<div class="stripe-slot-wrap">
				{#if !cardFormReady && !error}
					<div class="card-loading card-loading--overlay">
						<span class="spin spin--md"></span>
						<span>Cargando formulario seguro…</span>
					</div>
				{/if}
				<div id="checkout-card-el" class="stripe-slot"></div>
			</div>

			<div class="cta-row">
				<button
					class="btn-cancel"
					type="button"
					on:click={savedMethods.length > 0 ? goBackToConfirm : close}
					>{savedMethods.length > 0 ? 'Volver' : 'Cancelar'}</button
				>
				<button
					class="btn-pay"
					type="button"
					on:click={confirmNewCard}
					disabled={loading || !cardFormReady}
				>
					{#if loading}
						<span class="spin spin--xs spin--white"></span>
						Un momento…
					{:else}
						{payLabel}
					{/if}
				</button>
			</div>
			<p class="trust-note">Los datos de la tarjeta van a Stripe. Nosotros no los vemos.</p>
		{:else if step === 'processing' || step === 'authorizing'}
			<div class="state-center" aria-live="polite" aria-busy="true">
				<span class="spin spin--lg"></span>
				<p class="state-title">Autoriza {fmtMxn(amountTotal)} en tu banco</p>
				<p class="state-sub">
					Abre tu app bancaria y confirma. Esta ventana espera: no cierres ni vuelvas a pagar.
				</p>
			</div>
		{:else if step === 'done'}
			<div class="state-center">
				{#if settled}
					<div class="done-ring">
						<svg
							width="30"
							height="30"
							fill="none"
							viewBox="0 0 24 24"
							stroke="#4ade80"
							stroke-width="2.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<p class="state-title">¡Suscripción activada!</p>
					<p class="state-sub">
						El recibo también llega a tu correo. El comprobante en PDF está en Facturas y
						comprobantes.
					</p>
				{:else}
					<div class="done-ring done-ring--wait">
						<svg
							width="30"
							height="30"
							fill="none"
							viewBox="0 0 24 24"
							stroke="#fbbf24"
							stroke-width="2.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 2" />
							<circle cx="12" cy="12" r="9" />
						</svg>
					</div>
					<p class="state-title">Estamos confirmando tu pago</p>
					<p class="state-sub">
						Tu banco aún no confirma la operación. No vuelvas a pagar: en cuanto se acredite, la
						suscripción se activa sola y verás el cobro en tu historial.
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		background: rgba(0, 0, 0, 0.72);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
	}
	@media (min-width: 640px) {
		.backdrop {
			align-items: center;
			padding: 20px;
		}
	}

	.modal {
		width: 100%;
		max-width: 460px;
		max-height: 92vh;
		overflow-y: auto;
		background: #0d1520;
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: 28px 28px 0 0;
		padding: 28px 28px 36px;
		box-shadow: 0 32px 80px rgba(0, 0, 0, 0.65);
		opacity: 0;
		transform: translateY(24px);
		transition:
			opacity 0.28s ease,
			transform 0.28s ease;
	}
	@media (min-width: 640px) {
		.modal {
			border-radius: 24px;
		}
	}
	.modal--visible {
		opacity: 1;
		transform: translateY(0);
	}

	.modal-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 24px;
	}
	.modal-title {
		font-size: 18px;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0 0 4px;
		letter-spacing: -0.02em;
	}
	.modal-sub {
		font-size: 12px;
		color: #475569;
		margin: 0;
	}
	.close-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 9px;
		color: #64748b;
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.close-btn:hover {
		background: rgba(255, 255, 255, 0.09);
		color: #94a3b8;
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(239, 68, 68, 0.07);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 12px;
		padding: 11px 14px;
		font-size: 13px;
		color: #fca5a5;
		margin-bottom: 18px;
	}

	.cycle-toggle {
		display: flex;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 12px;
		padding: 4px;
		gap: 4px;
		margin-bottom: 20px;
	}
	.cycle-btn {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 9px 12px;
		border-radius: 9px;
		border: none;
		font-size: 13px;
		font-weight: 500;
		color: #475569;
		background: transparent;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.cycle-btn--on {
		background: rgba(99, 102, 241, 0.18);
		color: #a5b4fc;
		font-weight: 600;
	}
	.cycle-btn:not(.cycle-btn--on):hover {
		color: #94a3b8;
		background: rgba(255, 255, 255, 0.04);
	}
	.cycle-save {
		font-size: 10px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 6px;
		background: rgba(52, 211, 153, 0.14);
		border: 1px solid rgba(52, 211, 153, 0.25);
		color: #34d399;
	}

	.price-box {
		background: rgba(255, 255, 255, 0.025);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 14px;
		overflow: hidden;
		margin-bottom: 22px;
	}
	.price-line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}
	.price-line:last-child {
		border-bottom: none;
	}
	.price-line--total {
		background: rgba(99, 102, 241, 0.06);
		padding: 14px 16px;
	}
	.price-line__label {
		font-size: 13px;
		color: #64748b;
	}
	.price-line__val {
		font-size: 13px;
		color: #cbd5e1;
		font-variant-numeric: tabular-nums;
	}
	.price-line__val--dim {
		color: #475569;
	}
	.price-line__label--bold {
		font-size: 13px;
		font-weight: 600;
		color: #94a3b8;
	}
	.price-line__big {
		font-size: 22px;
		font-weight: 800;
		color: #f1f5f9;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.03em;
	}
	.price-year-hint {
		margin: 0;
		padding: 8px 16px 12px;
		font-size: 11px;
		color: #64748b;
		line-height: 1.4;
	}
	.skel {
		display: inline-block;
		border-radius: 6px;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04) 0%,
			rgba(255, 255, 255, 0.1) 50%,
			rgba(255, 255, 255, 0.04) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.2s ease-in-out infinite;
	}
	.skel--label {
		width: 88px;
		height: 12px;
	}
	.skel--val {
		width: 72px;
		height: 12px;
	}
	.skel--big {
		width: 110px;
		height: 22px;
	}
	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}
	.price-recap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 16px;
		margin-bottom: 16px;
		border-radius: 12px;
		background: rgba(99, 102, 241, 0.06);
		border: 1px solid rgba(99, 102, 241, 0.18);
	}
	.price-recap__label {
		font-size: 12px;
		color: #64748b;
	}
	.price-recap__total {
		font-size: 16px;
		font-weight: 700;
		color: #f1f5f9;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}

	.pm-section {
		margin-bottom: 24px;
	}
	.pm-section__title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #334155;
		margin: 0 0 12px;
	}
	.pm-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 10px;
	}
	.pm-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: rgba(255, 255, 255, 0.02);
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition:
			border-color 0.15s,
			background 0.15s;
	}
	.pm-row:hover {
		border-color: rgba(255, 255, 255, 0.13);
		background: rgba(255, 255, 255, 0.04);
	}
	.pm-row--on {
		border-color: rgba(99, 102, 241, 0.45);
		background: rgba(99, 102, 241, 0.07);
	}
	.pm-chip {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 54px;
		height: 34px;
		border-radius: 8px;
		border: 1px solid;
		flex-shrink: 0;
	}
	.pm-chip__label {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.04em;
	}
	.pm-row__meta {
		flex: 1;
		min-width: 0;
	}
	.pm-row__last4 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: #e2e8f0;
		font-family: ui-monospace, 'Courier New', monospace;
		font-variant-numeric: tabular-nums;
	}
	.pm-row__exp {
		margin: 2px 0 0;
		font-size: 11px;
		color: #475569;
	}
	.pm-empty {
		margin: 0;
		font-size: 13px;
		line-height: 1.45;
		color: #64748b;
	}
	.pm-check {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #818cf8;
		flex-shrink: 0;
	}
	.add-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px;
		border-radius: 12px;
		border: 1px dashed rgba(99, 102, 241, 0.3);
		background: rgba(99, 102, 241, 0.04);
		color: #818cf8;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition:
			border-color 0.15s,
			background 0.15s,
			color 0.15s;
	}
	.add-btn:hover {
		border-color: rgba(99, 102, 241, 0.5);
		background: rgba(99, 102, 241, 0.08);
		color: #a5b4fc;
	}

	.cta-row {
		display: flex;
		gap: 10px;
	}
	.btn-cancel {
		flex: 1;
		padding: 14px 16px;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: rgba(255, 255, 255, 0.04);
		color: #64748b;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
		white-space: nowrap;
	}
	.btn-cancel:hover {
		background: rgba(255, 255, 255, 0.07);
		color: #94a3b8;
	}
	.btn-pay {
		flex: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px 20px;
		border-radius: 14px;
		border: none;
		background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
		color: #fff;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
		box-shadow:
			0 4px 16px rgba(99, 102, 241, 0.4),
			0 1px 3px rgba(0, 0, 0, 0.3);
		transition:
			filter 0.15s,
			box-shadow 0.15s;
		letter-spacing: -0.01em;
		white-space: nowrap;
	}
	.btn-pay:hover:not(:disabled) {
		filter: brightness(1.1);
		box-shadow:
			0 6px 22px rgba(99, 102, 241, 0.5),
			0 1px 3px rgba(0, 0, 0, 0.3);
	}
	.btn-pay:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		box-shadow: none;
	}

	.stripe-slot-wrap {
		position: relative;
		margin-bottom: 22px;
		min-height: 140px;
	}
	.stripe-slot {
		border-radius: 12px;
		overflow: hidden;
		min-height: 140px;
	}
	.card-loading--overlay {
		position: absolute;
		inset: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: rgba(13, 21, 32, 0.82);
		border-radius: 12px;
		padding: 48px 0;
		font-size: 13px;
		color: #475569;
	}

	.card-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 48px 0 28px;
		font-size: 13px;
		color: #475569;
	}
	.state-center {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 0 20px;
		gap: 14px;
		text-align: center;
	}
	.state-title {
		font-size: 17px;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0;
	}
	.state-sub {
		font-size: 13px;
		color: #475569;
		margin: 0;
	}
	.done-ring {
		width: 68px;
		height: 68px;
		border-radius: 50%;
		background: rgba(74, 222, 128, 0.1);
		border: 1px solid rgba(74, 222, 128, 0.25);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.done-ring--wait {
		background: rgba(251, 191, 36, 0.1);
		border-color: rgba(251, 191, 36, 0.25);
	}

	.spin {
		display: inline-block;
		border-radius: 50%;
		border-style: solid;
		border-color: rgba(99, 102, 241, 0.2);
		border-top-color: #6366f1;
		animation: spinning 0.75s linear infinite;
		flex-shrink: 0;
	}
	.spin--xs {
		width: 14px;
		height: 14px;
		border-width: 2px;
	}
	.spin--md {
		width: 18px;
		height: 18px;
		border-width: 2px;
	}
	.spin--lg {
		width: 44px;
		height: 44px;
		border-width: 4px;
	}
	.spin--white {
		border-color: rgba(255, 255, 255, 0.25);
		border-top-color: #fff;
	}
	@keyframes spinning {
		to {
			transform: rotate(360deg);
		}
	}

	.trust-note {
		margin: 12px 0 0;
		text-align: center;
		font-size: 11px;
		color: #334155;
	}

	.cycle-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.close-btn:focus-visible,
	.cycle-btn:focus-visible,
	.pm-row:focus-visible,
	.add-btn:focus-visible,
	.btn-cancel:focus-visible,
	.btn-pay:focus-visible {
		outline: 2px solid #818cf8;
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.modal,
		.spin,
		.skel,
		.close-btn,
		.cycle-btn,
		.pm-row,
		.add-btn,
		.btn-cancel,
		.btn-pay {
			animation: none;
			transition: none;
		}
	}
</style>
