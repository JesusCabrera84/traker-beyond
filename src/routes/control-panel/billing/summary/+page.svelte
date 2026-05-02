<script>
	import { onMount } from 'svelte';
	import { billingService } from '$lib/services/billingService.js';
	import { formatMxn } from '$lib/utils/currency.js';
	import { formatDateLocal } from '$lib/utils/datetime.js';

	let loading = true;
	let fromDemo = false;
	let summary = null;
	let error = null;

	onMount(async () => {
		try {
			const res = await billingService.getSummary();
			summary = res.data;
			fromDemo = res.fromDemo;
		} catch {
			error = 'No se pudo cargar el resumen.';
		} finally {
			loading = false;
		}
	});

	$: extra = summary ? Math.max(0, summary.vehicles_active - summary.vehicles_included) : 0;
	$: extraCharge = extra * (summary?.extra_vehicle_mxn ?? 0);
	$: subtotal = (summary?.base_mxn ?? 0) + extraCharge + (summary?.addons_mxn ?? 0);
	$: iva = subtotal * 0.16;
	$: days = (() => {
		if (!summary?.next_charge_date) return null;
		return Math.max(0, Math.ceil((new Date(summary.next_charge_date) - new Date()) / 86400000));
	})();
	$: urgency =
		days === null ? '#10b981' : days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981';
	$: daysLabel =
		days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : days !== null ? `En ${days} días` : '';
</script>

<svelte:head><title>Resumen — Facturación | Geminis Labs</title></svelte:head>

{#if loading}
	<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
		{#each [1, 2, 3] as i (i)}
			<div style="height:110px;border-radius:14px;background:rgba(255,255,255,0.04);"></div>
		{/each}
	</div>
{:else if error}
	<div
		style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:14px;padding:24px;text-align:center;color:#fca5a5;"
	>
		{error}
	</div>
{:else if summary}
	{#if fromDemo}
		<div
			style="display:flex;align-items:flex-start;gap:10px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:12px 16px;margin-bottom:20px;"
		>
			<svg
				style="flex-shrink:0;margin-top:2px;"
				width="15"
				height="15"
				fill="none"
				viewBox="0 0 24 24"
				stroke="#f59e0b"
				stroke-width="2"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<p style="margin:0;font-size:13px;color:#fbbf24;line-height:1.5;">
				<strong>Datos de demostración.</strong> Cuando tu suscripción esté activa verás los importes reales.
			</p>
		</div>
	{/if}

	<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px;">
		<div
			style="background:rgba(10,16,26,0.7);border:1px solid {urgency}40;border-radius:14px;padding:22px;position:relative;overflow:hidden;"
		>
			<div
				style="position:absolute;top:-16px;right:-16px;width:70px;height:70px;background:{urgency}14;border-radius:50%;pointer-events:none;"
			></div>
			<div
				style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:{urgency};margin-bottom:8px;"
			>
				Próximo cobro
			</div>
			<div
				style="font-size:30px;font-weight:800;color:#fff;line-height:1;margin-bottom:8px;font-variant-numeric:tabular-nums;"
			>
				{formatMxn(summary.next_amount_mxn)}
			</div>
			<div style="font-size:12px;color:#475569;display:flex;align-items:center;gap:6px;">
				<span
					style="display:inline-block;width:6px;height:6px;border-radius:50%;background:{urgency};flex-shrink:0;"
				></span>
				{daysLabel}{daysLabel ? ' · ' : ''}{formatDateLocal(summary.next_charge_date)}
			</div>
		</div>

		<div
			style="background:rgba(10,16,26,0.7);border:1px solid rgba(99,102,241,0.25);border-radius:14px;padding:22px;"
		>
			<div
				style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#818cf8;margin-bottom:8px;"
			>
				Plan activo
			</div>
			<div style="font-size:17px;font-weight:700;color:#f1f5f9;line-height:1.2;margin-bottom:6px;">
				{summary.plan_name}
			</div>
			<div style="font-size:12px;color:#475569;line-height:1.5;margin-bottom:12px;">
				{summary.plan_tagline}
			</div>
			<span
				style="display:inline-flex;align-items:center;gap:5px;border-radius:99px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.12);padding:3px 10px;font-size:11px;font-weight:600;color:#a5b4fc;"
			>
				<span style="width:5px;height:5px;border-radius:50%;background:#a5b4fc;"></span>
				Activo
			</span>
		</div>

		<div
			style="background:rgba(10,16,26,0.7);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:22px;"
		>
			<div
				style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#475569;margin-bottom:8px;"
			>
				Vehículos
			</div>
			<div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px;">
				<span style="font-size:32px;font-weight:800;color:#fff;line-height:1;"
					>{summary.vehicles_active}</span
				>
				<span style="font-size:12px;color:#475569;">activos</span>
			</div>
			<div
				style="height:3px;background:rgba(255,255,255,0.06);border-radius:99px;margin-bottom:8px;overflow:hidden;"
			>
				<div
					style="height:100%;width:{Math.min(
						100,
						(summary.vehicles_active /
							Math.max(summary.vehicles_active, summary.vehicles_included)) *
							100
					)}%;background:{extra > 0 ? '#f59e0b' : '#10b981'};border-radius:99px;"
				></div>
			</div>
			<div style="font-size:12px;color:#475569;">
				{summary.vehicles_included} incluido{summary.vehicles_included !== 1 ? 's' : ''} en el plan
				{#if extra > 0}<span style="color:#f59e0b;font-weight:600;">
						· +{extra} adicional{extra !== 1 ? 'es' : ''}</span
					>{/if}
			</div>
		</div>
	</div>

	<div style="display:grid;grid-template-columns:1fr 320px;gap:14px;margin-bottom:14px;">
		<div
			style="background:rgba(10,16,26,0.7);border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;"
		>
			<div style="padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.05);">
				<div style="font-size:14px;font-weight:600;color:#e2e8f0;">Desglose del próximo cobro</div>
				<div style="font-size:11px;color:#334155;margin-top:2px;">MXN · antes de IVA</div>
			</div>

			<div
				style="display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,0.04);"
			>
				<div style="display:flex;align-items:center;gap:10px;">
					<div
						style="width:30px;height:30px;border-radius:8px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;"
					>
						<svg
							width="14"
							height="14"
							fill="none"
							viewBox="0 0 24 24"
							stroke="#818cf8"
							stroke-width="2"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/></svg
						>
					</div>
					<div>
						<div style="font-size:13px;font-weight:500;color:#cbd5e1;">Cargo base del plan</div>
						<div style="font-size:11px;color:#334155;">
							{summary.vehicles_included} vehículo{summary.vehicles_included !== 1 ? 's' : ''} incluido{summary.vehicles_included !==
							1
								? 's'
								: ''}
						</div>
					</div>
				</div>
				<div style="text-align:right;">
					<div
						style="font-size:14px;font-weight:600;color:#f1f5f9;font-variant-numeric:tabular-nums;"
					>
						{formatMxn(summary.base_mxn)}
					</div>
					<div style="font-size:11px;color:#334155;">/ mes</div>
				</div>
			</div>

			{#if extra > 0}
				<div
					style="display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(245,158,11,0.04);"
				>
					<div style="display:flex;align-items:center;gap:10px;">
						<div
							style="width:30px;height:30px;border-radius:8px;background:rgba(245,158,11,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;"
						>
							<svg
								width="14"
								height="14"
								fill="none"
								viewBox="0 0 24 24"
								stroke="#f59e0b"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/></svg
							>
						</div>
						<div>
							<div style="font-size:13px;font-weight:500;color:#cbd5e1;">Vehículos adicionales</div>
							<div style="font-size:11px;color:#334155;">
								{extra} × {formatMxn(summary.extra_vehicle_mxn)} c/u
							</div>
						</div>
					</div>
					<div style="text-align:right;">
						<div
							style="font-size:14px;font-weight:600;color:#fcd34d;font-variant-numeric:tabular-nums;"
						>
							{formatMxn(extraCharge)}
						</div>
						<div style="font-size:11px;color:#334155;">/ mes</div>
					</div>
				</div>
			{/if}

			<div
				style="display:flex;align-items:center;justify-content:space-between;padding:12px 22px;background:rgba(0,0,0,0.2);border-bottom:1px solid rgba(255,255,255,0.04);"
			>
				<span
					style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;"
					>Subtotal (sin IVA)</span
				>
				<span
					style="font-size:13px;font-weight:600;color:#94a3b8;font-variant-numeric:tabular-nums;"
					>{formatMxn(subtotal)}</span
				>
			</div>

			<div
				style="display:flex;align-items:center;justify-content:space-between;padding:11px 22px;border-bottom:1px solid rgba(255,255,255,0.04);"
			>
				<div>
					<div style="font-size:12px;color:#334155;">IVA estimado (16%)</div>
					<div style="font-size:10px;color:#1e293b;margin-top:1px;">
						Solo aplica si solicitas factura fiscal
					</div>
				</div>
				<span style="font-size:12px;color:#334155;font-variant-numeric:tabular-nums;"
					>+ {formatMxn(iva)}</span
				>
			</div>

			<div
				style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(99,102,241,0.02));"
			>
				<div>
					<div
						style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#818cf8;margin-bottom:3px;"
					>
						Total a cobrar
					</div>
					<div style="font-size:11px;color:#334155;">
						{formatDateLocal(summary.next_charge_date)}
					</div>
				</div>
				<div style="text-align:right;">
					<div
						style="font-size:26px;font-weight:800;color:#fff;line-height:1;font-variant-numeric:tabular-nums;"
					>
						{formatMxn(summary.next_amount_mxn)}
					</div>
					<div style="font-size:10px;color:#334155;margin-top:3px;">MXN · sin IVA</div>
				</div>
			</div>
		</div>

		<div style="display:flex;flex-direction:column;gap:12px;">
			<div
				style="background:rgba(10,16,26,0.7);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px;flex:1;"
			>
				<div
					style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#334155;margin-bottom:12px;"
				>
					Ciclo de facturación
				</div>
				<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
					<div
						style="width:34px;height:34px;border-radius:9px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;"
					>
						<svg
							width="16"
							height="16"
							fill="none"
							viewBox="0 0 24 24"
							stroke="#818cf8"
							stroke-width="2"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/></svg
						>
					</div>
					<div>
						<div style="font-size:13px;font-weight:600;color:#e2e8f0;">
							{summary.billing_cycle === 'annual' ? 'Facturación anual' : 'Facturación mensual'}
						</div>
						<div style="font-size:11px;color:#334155;">Cargo automático recurrente</div>
					</div>
				</div>
				<div style="padding-left:13px;border-left:1px dashed rgba(255,255,255,0.08);">
					<div style="position:relative;margin-bottom:11px;">
						<div
							style="position:absolute;left:-18px;top:4px;width:9px;height:9px;border-radius:50%;background:#10b981;"
						></div>
						<div style="font-size:11px;color:#334155;">Último cobro</div>
						<div style="font-size:12px;font-weight:500;color:#94a3b8;">Exitoso</div>
					</div>
					<div style="position:relative;">
						<div
							style="position:absolute;left:-18px;top:4px;width:9px;height:9px;border-radius:50%;border:2px solid #818cf8;background:#0a1016;"
						></div>
						<div style="font-size:11px;color:#334155;">Próximo cobro</div>
						<div style="font-size:12px;font-weight:600;color:#a5b4fc;">
							{formatDateLocal(summary.next_charge_date)}
						</div>
					</div>
				</div>
			</div>

			<div
				style="background:rgba(10,16,26,0.7);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px 18px;"
			>
				<div
					style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#334155;margin-bottom:10px;"
				>
					Procesador de pago
				</div>
				<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
					<div
						style="width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="#64748b"
							><path
								d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"
							/></svg
						>
					</div>
					<div>
						<div style="font-size:13px;font-weight:600;color:#cbd5e1;text-transform:capitalize;">
							{summary.processor}
						</div>
						<div style="font-size:11px;color:#334155;">Certificado PCI</div>
					</div>
				</div>
				<a
					href="/control-panel/billing/payment-methods"
					style="font-size:12px;color:#818cf8;text-decoration:none;">Ver métodos de pago →</a
				>
			</div>

			<div
				style="background:rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:13px 15px;"
			>
				<p style="font-size:11px;color:#334155;line-height:1.6;margin:0;">
					Importes <strong style="color:#475569;">antes de IVA</strong>. El IVA aplica solo si
					solicitas CFDI. Cobros en <strong style="color:#475569;">MXN</strong> bajo cláusulas generales
					Nexus by GeminisLabs.
				</p>
			</div>
		</div>
	</div>

	<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
		<a
			href="/control-panel/billing/payment-methods"
			style="display:flex;align-items:center;gap:10px;background:rgba(10,16,26,0.5);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:13px 16px;text-decoration:none;"
		>
			<div
				style="width:30px;height:30px;border-radius:8px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;"
			>
				<svg
					width="14"
					height="14"
					fill="none"
					viewBox="0 0 24 24"
					stroke="#818cf8"
					stroke-width="2"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
					/></svg
				>
			</div>
			<div style="flex:1;">
				<div style="font-size:13px;font-weight:500;color:#e2e8f0;">Métodos de pago</div>
				<div style="font-size:11px;color:#334155;">Tarjetas y mandatos</div>
			</div>
			<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#334155" stroke-width="2"
				><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg
			>
		</a>
		<a
			href="/control-panel/billing/invoices"
			style="display:flex;align-items:center;gap:10px;background:rgba(10,16,26,0.5);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:13px 16px;text-decoration:none;"
		>
			<div
				style="width:30px;height:30px;border-radius:8px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;"
			>
				<svg
					width="14"
					height="14"
					fill="none"
					viewBox="0 0 24 24"
					stroke="#818cf8"
					stroke-width="2"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/></svg
				>
			</div>
			<div style="flex:1;">
				<div style="font-size:13px;font-weight:500;color:#e2e8f0;">Facturas</div>
				<div style="font-size:11px;color:#334155;">PDF, XML, CFDI</div>
			</div>
			<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#334155" stroke-width="2"
				><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg
			>
		</a>
	</div>
{/if}
