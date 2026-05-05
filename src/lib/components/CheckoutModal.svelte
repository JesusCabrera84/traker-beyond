<!-- src/lib/components/CheckoutModal.svelte -->
<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { billingService } from '$lib/services/billingService.js';

	/** @type {{ id: string, name: string, code: string, pricing: { monthly: number, yearly: number } }} */
	export let plan;
	/** @type {'MONTHLY' | 'YEARLY'} */
	export let initialCycle = 'MONTHLY';
	/** @type {Array} */
	export let savedMethods = [];

	const dispatch = createEventDispatcher();

	let visible = false;
	let cycle = initialCycle;
	let step = 'confirm'; // 'confirm' | 'new-card' | 'processing' | 'done'

	let paymentFlow = null;
	let loading = false;
	let error = null;
	let selectedPm = savedMethods.find((m) => m.is_default) ?? savedMethods[0] ?? null;
	let useNewCard = savedMethods.length === 0;

	$: amountBase =
		cycle === 'YEARLY' ? Number(plan?.pricing?.yearly ?? 0) : Number(plan?.pricing?.monthly ?? 0);
	$: amountIva = amountBase * 0.16;
	$: amountTotal = amountBase * 1.16;

	function fmtMxn(v) {
		return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v ?? 0);
	}

	onMount(async () => {
		await new Promise((r) => setTimeout(r, 50));
		visible = true;
	});

	onDestroy(() => {
		const el = document.getElementById('checkout-card-el');
		if (el) el.innerHTML = '';
	});

	async function initNewCard() {
		step = 'new-card';
		loading = true;
		error = null;
		await new Promise((r) => setTimeout(r, 80));
		try {
			paymentFlow = await billingService.initAddPaymentMethodFlow('checkout-card-el', 'stripe');
		} catch (e) {
			error = e.message;
			step = 'confirm';
		} finally {
			loading = false;
		}
	}

	async function pay() {
		step = 'processing';
		loading = true;
		error = null;
		try {
			const flow = await billingService.initSubscriptionPaymentFlow({
				planId: plan.id,
				billingCycle: cycle,
				gateway: 'stripe'
			});

			const returnUrl = `${window.location.origin}/control-panel/billing/summary?checkout=success`;
			const { error: err } = await flow.confirmPayment(returnUrl);

			if (err) {
				error = err.message ?? 'Error al procesar el pago';
				step = 'confirm';
				loading = false;
				return;
			}

			step = 'done';
			setTimeout(() => dispatch('success'), 1500);
		} catch (e) {
			error = e.message ?? 'Error al iniciar el pago';
			step = 'confirm';
			loading = false;
		}
	}

	function close() {
		dispatch('close');
	}

	function brandMeta(brand) {
		const b = (brand ?? '').toLowerCase();
		if (b === 'visa') return 'from-[#1a1f71] to-blue-600';
		if (b === 'mastercard') return 'from-[#1a0a0a] to-red-700';
		if (b === 'amex') return 'from-[#0c3357] to-sky-500';
		return 'from-slate-800 to-slate-700';
	}
</script>

<!-- Backdrop -->
<div
	class="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/75 backdrop-blur-md"
	on:click|self={close}
	role="dialog"
	aria-modal="true"
	aria-label="Completar pago"
>
	<div
		class="w-full sm:max-w-[500px] bg-[#0d1520] border border-white/8
		       rounded-t-3xl sm:rounded-3xl p-6
		       shadow-[0_24px_64px_rgb(0_0_0/0.6)]
		       transition-all duration-300 ease-out"
		class:translate-y-0={visible}
		class:opacity-100={visible}
		class:translate-y-6={!visible}
		class:opacity-0={!visible}
	>
		<!-- Header -->
		<div class="flex items-start justify-between mb-5">
			<div>
				<h2 class="text-[17px] font-bold text-slate-100">
					{step === 'done' ? '¡Pago exitoso!' : 'Completar suscripción'}
				</h2>
				<p class="text-[12px] text-slate-600 mt-0.5">
					{plan.name}
				</p>
			</div>
			{#if step !== 'processing' && step !== 'done'}
				<button
					on:click={close}
					class="text-slate-500 hover:text-slate-400 bg-transparent border-none cursor-pointer text-lg leading-none"
					>✕</button
				>
			{/if}
		</div>

		<!-- Error -->
		{#if error}
			<div
				class="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-2.5 text-[13px] text-red-300 mb-4"
			>
				{error}
			</div>
		{/if}

		<!-- STEP: confirm -->
		{#if step === 'confirm'}
			<!-- Ciclo de facturación -->
			<div class="flex rounded-xl border border-white/8 overflow-hidden mb-5">
				{#each [['MONTHLY', 'Mensual'], ['YEARLY', 'Anual']] as [val, label] (val)}
					<button
						on:click={() => (cycle = val)}
						class="flex-1 py-2.5 text-[13px] font-semibold transition-all border-none cursor-pointer
						       {cycle === val
							? 'bg-indigo-500/15 text-indigo-300'
							: 'bg-transparent text-slate-600 hover:text-slate-400'}"
					>
						{label}
						{#if val === 'YEARLY'}
							<span class="ml-1 text-[10px] text-emerald-400">-17%</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Desglose de precio -->
			<div class="bg-white/2 border border-white/5 rounded-xl overflow-hidden mb-5">
				<div class="flex justify-between px-4 py-3 border-b border-white/4">
					<span class="text-[13px] text-slate-500">Plan {plan.name}</span>
					<span class="text-[13px] text-slate-300 tabular-nums">{fmtMxn(amountBase)}</span>
				</div>
				<div class="flex justify-between px-4 py-3 border-b border-white/4">
					<span class="text-[13px] text-slate-500">IVA (16%)</span>
					<span class="text-[13px] text-slate-500 tabular-nums">+ {fmtMxn(amountIva)}</span>
				</div>
				<div class="flex justify-between items-center px-4 py-3 bg-indigo-500/4">
					<span class="text-[13px] font-semibold text-slate-400">Total</span>
					<span class="text-[17px] font-extrabold text-slate-100 tabular-nums"
						>{fmtMxn(amountTotal)}</span
					>
				</div>
			</div>

			<!-- Método de pago -->
			<div class="mb-5">
				<p class="text-[12px] font-semibold text-slate-600 uppercase tracking-wider mb-3">
					Método de pago
				</p>

				{#if savedMethods.length > 0}
					<div class="space-y-2 mb-3">
						{#each savedMethods as pm (pm.external_token)}
							<button
								on:click={() => {
									selectedPm = pm;
									useNewCard = false;
								}}
								class="w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left cursor-pointer transition-all
								       {selectedPm?.external_token === pm.external_token && !useNewCard
									? 'border-indigo-500/40 bg-indigo-500/6'
									: 'border-white/6 bg-white/2 hover:border-white/12'}"
							>
								<!-- Mini tarjeta -->
								<div
									class="w-10 h-7 rounded-md bg-gradient-to-br {brandMeta(pm.brand)} flex-shrink-0"
								></div>
								<div class="flex-1 min-w-0">
									<p class="text-[13px] font-semibold text-slate-200">•••• {pm.last4}</p>
									<p class="text-[11px] text-slate-600">
										{(pm.brand ?? '').toUpperCase()} · {pm.exp_month}/{String(pm.exp_year).slice(
											-2
										)}
									</p>
								</div>
								{#if selectedPm?.external_token === pm.external_token && !useNewCard}
									<svg
										width="16"
										height="16"
										fill="none"
										viewBox="0 0 24 24"
										stroke="#818cf8"
										stroke-width="2.5"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				{/if}

				<button
					on:click={() => {
						useNewCard = true;
						selectedPm = null;
						initNewCard();
					}}
					class="w-full flex items-center gap-2 rounded-xl border border-dashed border-indigo-500/25
					       bg-indigo-500/3 hover:bg-indigo-500/6 text-indigo-400 px-3.5 py-3
					       text-[13px] cursor-pointer transition-all"
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
					Usar tarjeta diferente
				</button>
			</div>

			<!-- CTA -->
			<div class="flex gap-2.5">
				<button
					on:click={close}
					class="flex-1 rounded-xl border border-white/7 bg-white/4 py-3 text-[13px] font-medium
					       text-slate-500 cursor-pointer hover:bg-white/7 transition-all border-none">Cancelar</button
				>
				<button
					on:click={pay}
					disabled={useNewCard || (!selectedPm && !useNewCard)}
					class="flex-[2] flex items-center justify-center gap-2 rounded-xl border-none
					       bg-gradient-to-br from-indigo-500 to-violet-600 py-3
					       text-[13px] font-bold text-white cursor-pointer
					       shadow-[0_2px_12px_rgb(99_102_241/0.35)]
					       hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
				>
					Pagar {fmtMxn(amountTotal)}
				</button>
			</div>

			<!-- STEP: new-card -->
		{:else if step === 'new-card'}
			{#if loading}
				<div class="flex items-center justify-center gap-3 py-10 text-[13px] text-slate-500">
					<span
						class="size-4 rounded-full border-2 border-indigo-500/25 border-t-indigo-400 animate-spin"
					></span>
					Cargando formulario seguro…
				</div>
			{:else}
				<div id="checkout-card-el" class="min-h-[140px] mb-4"></div>
			{/if}

			<div class="flex items-center gap-1.5 text-[11px] text-slate-700 mb-5">
				<svg
					width="11"
					height="11"
					fill="none"
					viewBox="0 0 24 24"
					stroke="#10b981"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
				TLS cifrado · PCI DSS · procesado por Stripe
			</div>

			<div class="flex gap-2.5">
				<button
					on:click={() => {
						step = 'confirm';
						useNewCard = false;
					}}
					class="flex-1 rounded-xl border border-white/7 bg-white/4 py-3 text-[13px] font-medium
					       text-slate-500 cursor-pointer hover:bg-white/7 transition-all border-none">Volver</button
				>
				<button
					on:click={async () => {
						if (!paymentFlow) return;
						loading = true;
						const returnUrl = `${window.location.origin}/control-panel/billing/summary?checkout=success`;
						const { error: err } = await paymentFlow.confirmSetup(returnUrl);
						if (err) {
							error = err.message;
							loading = false;
							return;
						}
						// Después de guardar tarjeta, recargar métodos y pagar
						await pay();
					}}
					disabled={loading || !paymentFlow}
					class="flex-[2] flex items-center justify-center gap-2 rounded-xl border-none
					       bg-gradient-to-br from-indigo-500 to-violet-600 py-3
					       text-[13px] font-bold text-white cursor-pointer
					       shadow-[0_2px_12px_rgb(99_102_241/0.35)]
					       hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
				>
					{#if loading}
						<span class="size-3.5 rounded-full border-2 border-white/25 border-t-white animate-spin"
						></span>
						Procesando…
					{:else}
						Guardar y pagar
					{/if}
				</button>
			</div>

			<!-- STEP: processing -->
		{:else if step === 'processing'}
			<div class="flex flex-col items-center py-10 gap-4">
				<span
					class="size-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin"
				></span>
				<p class="text-[14px] text-slate-400">Procesando tu pago…</p>
				<p class="text-[12px] text-slate-600">No cierres esta ventana</p>
			</div>

			<!-- STEP: done -->
		{:else if step === 'done'}
			<div class="flex flex-col items-center py-8 gap-4 text-center">
				<div
					class="size-16 rounded-full bg-green-400/10 border border-green-400/25 flex items-center justify-center"
				>
					<svg
						width="28"
						height="28"
						fill="none"
						viewBox="0 0 24 24"
						stroke="#4ade80"
						stroke-width="2.5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<div>
					<p class="text-[16px] font-bold text-slate-100">Suscripción activada</p>
					<p class="text-[13px] text-slate-500 mt-1">El recibo llegará a tu correo electrónico</p>
				</div>
			</div>
		{/if}
	</div>
</div>
