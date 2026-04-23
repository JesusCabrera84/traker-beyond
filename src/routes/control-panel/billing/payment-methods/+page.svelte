<script>
	import { onMount } from 'svelte';
	import { billingService } from '$lib/services/billingService.js';

	let loading = true;
	let fromDemo = false;
	let methods = [];
	let error = null;

	onMount(async () => {
		try {
			const res = await billingService.getPaymentMethods();
			methods = res.data;
			fromDemo = res.fromDemo;
		} catch {
			error = 'No se pudieron cargar los métodos de pago.';
		} finally {
			loading = false;
		}
	});

	function displayMethod(m) {
		const brand = (m.brand || m.card?.brand || 'card').toLowerCase();
		const last4 = m.last4 ?? m.card?.last4 ?? '----';
		const expM = m.exp_month ?? m.card?.exp_month;
		const expY = m.exp_year ?? m.card?.exp_year;
		const exp =
			expM != null && expY != null
				? `${String(expM).padStart(2, '0')}/${String(expY).slice(-2)}`
				: '—';
		const def = m.is_default ?? m.default;
		const isExpired = expY != null && expM != null ? new Date(expY, expM - 1) < new Date() : false;
		return { brand, last4, exp, def, isExpired, id: m.id ?? m.label };
	}

	const brandMeta = {
		visa: { label: 'Visa', gradient: 'linear-gradient(135deg,#1a56db,#1e3a8a)' },
		mastercard: { label: 'Mastercard', gradient: 'linear-gradient(135deg,#c2410c,#991b1b)' },
		mc: { label: 'Mastercard', gradient: 'linear-gradient(135deg,#c2410c,#991b1b)' },
		amex: { label: 'American Express', gradient: 'linear-gradient(135deg,#0e7490,#164e63)' }
	};

	function getBrand(b) {
		return (
			brandMeta[b.toLowerCase()] ?? {
				label: b.toUpperCase(),
				gradient: 'linear-gradient(135deg,#334155,#1e293b)'
			}
		);
	}
</script>

<svelte:head><title>Métodos de pago — Facturación | Geminis Labs</title></svelte:head>

{#if loading}
	<div
		style="display:flex;flex-direction:column;align-items:center;padding:64px 16px;color:#64748b;"
	>
		<div
			style="width:36px;height:36px;border-radius:50%;border:3px solid rgba(99,102,241,0.15);border-top-color:#6366f1;animation:spin 1s linear infinite;margin-bottom:12px;"
		></div>
		<p style="margin:0;font-size:14px;">Cargando métodos de pago…</p>
	</div>
{:else if error}
	<div
		style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:14px;padding:24px;text-align:center;color:#fca5a5;"
	>
		{error}
	</div>
{:else}
	{#if fromDemo}
		<div
			style="display:flex;align-items:flex-start;gap:10px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:12px 16px;margin-bottom:20px;"
		>
			<svg
				style="flex-shrink:0;margin-top:2px;"
				width="15"
				height="15"
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
			<p style="margin:0;font-size:13px;color:#a5b4fc;line-height:1.5;">
				<strong>Datos de demostración.</strong> Cuando Stripe esté integrado verás tus tarjetas reales
				aquí.
			</p>
		</div>
	{/if}

	{#if methods.length === 0 && !fromDemo}
		<div
			style="display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed rgba(255,255,255,0.08);border-radius:16px;background:rgba(10,16,26,0.4);padding:64px 24px;text-align:center;"
		>
			<div
				style="width:56px;height:56px;border-radius:14px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;margin-bottom:16px;"
			>
				<svg
					width="26"
					height="26"
					fill="none"
					viewBox="0 0 24 24"
					stroke="#475569"
					stroke-width="1.5"
					><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg
				>
			</div>
			<h3 style="font-size:16px;font-weight:600;color:#e2e8f0;margin:0 0 8px;">
				Sin métodos de pago guardados
			</h3>
			<p style="font-size:13px;color:#475569;line-height:1.6;max-width:36ch;margin:0 0 20px;">
				Añade una tarjeta para que tus cobros mensuales se procesen de forma automática.
			</p>
			<button
				disabled
				style="display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);padding:10px 18px;font-size:13px;font-weight:600;color:#475569;cursor:not-allowed;opacity:.6;"
			>
				Añadir tarjeta (próximamente)
			</button>
		</div>
	{:else}
		<div
			style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:20px;"
		>
			{#each methods as m (m.id || m.last4)}
				{@const d = displayMethod(m)}
				{@const meta = getBrand(d.brand)}

				<div
					style="border-radius:16px;overflow:hidden;border:{d.def
						? '1px solid rgba(99,102,241,0.4)'
						: '1px solid rgba(255,255,255,0.07)'};box-shadow:{d.def
						? '0 0 0 1px rgba(99,102,241,0.1),0 8px 32px rgba(0,0,0,0.3)'
						: '0 4px 16px rgba(0,0,0,0.2)'};"
				>
					<div style="background:{meta.gradient};padding:22px;position:relative;overflow:hidden;">
						<div
							style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.06);pointer-events:none;"
						></div>
						<div
							style="position:absolute;bottom:-30px;right:20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.04);pointer-events:none;"
						></div>

						<div
							style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;"
						>
							<div
								style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,0.7);"
							>
								{meta.label}
							</div>
							{#if d.def}
								<span
									style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.12);padding:3px 8px;font-size:10px;font-weight:700;color:#fff;backdrop-filter:blur(4px);"
								>
									<span style="width:5px;height:5px;border-radius:50%;background:#4ade80;"></span>
									Predeterminada
								</span>
							{/if}
							{#if d.isExpired}
								<span
									style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.2);padding:3px 8px;font-size:10px;font-weight:700;color:#fca5a5;"
								>
									Vencida
								</span>
							{/if}
						</div>

						<div
							style="width:36px;height:26px;border-radius:5px;background:linear-gradient(135deg,rgba(255,221,100,0.8),rgba(255,180,50,0.6));border:1px solid rgba(255,220,100,0.3);margin-bottom:18px;"
						></div>

						<div
							style="font-family:monospace;font-size:18px;font-weight:600;letter-spacing:.15em;color:rgba(255,255,255,0.9);margin-bottom:14px;font-variant-numeric:tabular-nums;"
						>
							•••• •••• •••• {d.last4}
						</div>

						<div style="display:flex;justify-content:space-between;align-items:flex-end;">
							<div>
								<div
									style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,0.45);margin-bottom:2px;"
								>
									Válida hasta
								</div>
								<div
									style="font-family:monospace;font-size:13px;font-weight:600;color:{d.isExpired
										? '#fca5a5'
										: 'rgba(255,255,255,0.8)'};"
								>
									{d.exp}
								</div>
							</div>
						</div>
					</div>

					<div
						style="background:rgba(10,16,26,0.8);padding:12px 18px;display:flex;align-items:center;justify-content:space-between;"
					>
						<div style="font-size:12px;color:{d.def ? '#4ade80' : '#334155'};">
							{d.def ? 'Usada para cobros automáticos' : 'No predeterminada'}
						</div>
						<div style="display:flex;gap:6px;">
							{#if !d.def}
								<button
									disabled
									style="border-radius:8px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);padding:5px 10px;font-size:11px;font-weight:500;color:#334155;cursor:not-allowed;opacity:.5;"
								>
									Usar por defecto
								</button>
							{/if}
							<button
								disabled
								style="border-radius:8px;border:1px solid rgba(239,68,68,0.15);background:rgba(239,68,68,0.06);padding:5px 10px;font-size:11px;font-weight:500;color:rgba(252,165,165,0.5);cursor:not-allowed;opacity:.5;"
							>
								Eliminar
							</button>
						</div>
					</div>
				</div>
			{/each}

			<div
				style="display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed rgba(255,255,255,0.08);border-radius:16px;background:rgba(10,16,26,0.3);padding:32px;text-align:center;min-height:200px;"
			>
				<div
					style="width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;margin-bottom:10px;"
				>
					<svg
						width="18"
						height="18"
						fill="none"
						viewBox="0 0 24 24"
						stroke="#475569"
						stroke-width="2"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/></svg
					>
				</div>
				<div style="font-size:13px;font-weight:500;color:#475569;margin-bottom:4px;">
					Agregar tarjeta
				</div>
				<div style="font-size:11px;color:#1e293b;">Próximamente</div>
			</div>
		</div>

		<div
			style="background:rgba(10,16,26,0.5);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px 22px;"
		>
			<div style="font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:14px;">
				Seguridad y cumplimiento
			</div>
			<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
				{#each [{ icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Certificación PCI DSS', desc: 'El procesador maneja los datos de tarjeta; nosotros solo guardamos referencias tokenizadas.' }, { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Sin número completo', desc: 'Solo almacenamos los últimos 4 dígitos y la fecha de expiración, nunca el PAN.' }, { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Antes de eliminar', desc: 'Asegúrate de tener otro método activo antes de quitar la tarjeta predeterminada.' }] as item (item.title)}
					<div style="display:flex;gap:10px;">
						<div
							style="width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;"
						>
							<svg
								width="14"
								height="14"
								fill="none"
								viewBox="0 0 24 24"
								stroke="#475569"
								stroke-width="2"
								><path stroke-linecap="round" stroke-linejoin="round" d={item.icon} /></svg
							>
						</div>
						<div>
							<div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:3px;">
								{item.title}
							</div>
							<div style="font-size:11px;color:#334155;line-height:1.6;">{item.desc}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/if}

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
