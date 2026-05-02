<script>
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { billingService } from '$lib/services/billingService.js';
	import { formatMxn } from '$lib/utils/currency.js';
	import { formatDateLocal } from '$lib/utils/datetime.js';

	let loading = true;
	let fromDemo = false;
	let rows = [];
	let error = null;
	let yearFilter = 'all';

	onMount(async () => {
		try {
			const res = await billingService.getInvoices();
			rows = res.data;
			fromDemo = res.fromDemo;
		} catch {
			error = 'No se pudieron cargar las facturas.';
		} finally {
			loading = false;
		}
	});

	function rowDate(inv) {
		return inv.issued_at ?? inv.date ?? inv.created_at;
	}
	function rowTotal(inv) {
		const t = inv.total_mxn ?? inv.total ?? inv.amount_mxn;
		return t != null ? Number(t) : null;
	}
	function rowSub(inv) {
		const s = inv.subtotal_mxn ?? inv.subtotal;
		return s != null ? Number(s) : null;
	}
	function rowTax(inv) {
		const t = inv.tax_mxn ?? inv.tax;
		return t != null ? Number(t) : null;
	}
	function rowFolio(inv) {
		if (inv.series && inv.folio) return `${inv.series}-${inv.folio}`;
		if (inv.folio) return String(inv.folio);
		return null;
	}

	function statusInfo(status) {
		const s = (status || '').toLowerCase();
		if (s === 'paid' || s === 'pagada' || s === 'paid_out')
			return {
				label: 'Pagada',
				color: '#4ade80',
				bg: 'rgba(74,222,128,0.08)',
				border: 'rgba(74,222,128,0.2)'
			};
		if (s === 'open' || s === 'pendiente' || s === 'pending')
			return {
				label: 'Pendiente',
				color: '#fbbf24',
				bg: 'rgba(251,191,36,0.08)',
				border: 'rgba(251,191,36,0.2)'
			};
		if (s === 'void' || s === 'cancelada')
			return {
				label: 'Anulada',
				color: '#64748b',
				bg: 'rgba(100,116,139,0.08)',
				border: 'rgba(100,116,139,0.2)'
			};
		return {
			label: status || '—',
			color: '#818cf8',
			bg: 'rgba(129,140,248,0.08)',
			border: 'rgba(129,140,248,0.2)'
		};
	}

	$: years = (() => {
		const y = new SvelteSet();
		for (const inv of rows) {
			const d = rowDate(inv);
			if (d) y.add(String(d).slice(0, 4));
		}
		return Array.from(y).sort((a, b) => b.localeCompare(a));
	})();

	$: filtered = rows.filter((inv) => {
		if (yearFilter === 'all') return true;
		const d = rowDate(inv);
		return d && String(d).startsWith(yearFilter);
	});

	$: totalFiltered = filtered.reduce((acc, inv) => acc + (rowTotal(inv) ?? 0), 0);
	$: paidCount = filtered.filter((inv) => {
		const s = (inv.status || '').toLowerCase();
		return s === 'paid' || s === 'pagada' || s === 'paid_out';
	}).length;
</script>

<svelte:head><title>Facturas — Facturación | Geminis Labs</title></svelte:head>

{#if loading}
	<div
		style="display:flex;flex-direction:column;align-items:center;padding:64px 16px;color:#64748b;"
	>
		<div
			style="width:36px;height:36px;border-radius:50%;border:3px solid rgba(99,102,241,0.15);border-top-color:#6366f1;animation:spin 1s linear infinite;margin-bottom:12px;"
		></div>
		<p style="margin:0;font-size:14px;">Cargando facturas…</p>
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
			style="display:flex;align-items:flex-start;gap:10px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:12px 16px;margin-bottom:20px;"
		>
			<svg
				style="flex-shrink:0;margin-top:2px;"
				width="15"
				height="15"
				fill="none"
				viewBox="0 0 24 24"
				stroke="#a78bfa"
				stroke-width="2"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<p style="margin:0;font-size:13px;color:#c4b5fd;line-height:1.5;">
				<strong>Datos de demostración.</strong> Cuando el backend conecte el histórico, este listado mostrará
				tus CFDI reales.
			</p>
		</div>
	{/if}

	{#if rows.length === 0 && !fromDemo}
		<div
			style="display:flex;flex-direction:column;align-items:center;border:1px dashed rgba(255,255,255,0.08);border-radius:16px;background:rgba(10,16,26,0.4);padding:64px 24px;text-align:center;"
		>
			<div
				style="width:48px;height:48px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;margin-bottom:14px;"
			>
				<svg
					width="22"
					height="22"
					fill="none"
					viewBox="0 0 24 24"
					stroke="#475569"
					stroke-width="1.5"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/></svg
				>
			</div>
			<h3 style="font-size:16px;font-weight:600;color:#e2e8f0;margin:0 0 8px;">
				Aún no hay facturas
			</h3>
			<p style="font-size:13px;color:#475569;line-height:1.6;max-width:36ch;margin:0;">
				Los cobros de tu suscripción aparecerán aquí con folio, importes e IVA desglosado.
			</p>
		</div>
	{:else}
		<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
			<div style="display:flex;gap:10px;flex:1;min-width:0;">
				<div
					style="background:rgba(10,16,26,0.6);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px 18px;flex:1;"
				>
					<div
						style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;margin-bottom:4px;"
					>
						Total
					</div>
					<div style="font-size:22px;font-weight:800;color:#fff;">{filtered.length}</div>
				</div>
				<div
					style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:12px;padding:12px 18px;flex:1;"
				>
					<div
						style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(74,222,128,0.5);margin-bottom:4px;"
					>
						Pagadas
					</div>
					<div style="font-size:22px;font-weight:800;color:#4ade80;">{paidCount}</div>
				</div>
				<div
					style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:12px;padding:12px 18px;flex:1;"
				>
					<div
						style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(129,140,248,0.6);margin-bottom:4px;"
					>
						Importe
					</div>
					<div
						style="font-size:18px;font-weight:800;color:#a5b4fc;font-variant-numeric:tabular-nums;"
					>
						{formatMxn(totalFiltered)}
					</div>
				</div>
			</div>

			{#if rows.length > 0}
				<div style="display:flex;flex-direction:column;gap:4px;">
					<label
						for="yr"
						style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;"
						>Periodo</label
					>
					<select
						id="yr"
						bind:value={yearFilter}
						style="border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(10,16,26,0.7);padding:8px 12px;font-size:13px;color:#e2e8f0;outline:none;"
					>
						<option value="all">Todos</option>
						{#each years as y (y)}<option value={y}>{y}</option>{/each}
					</select>
				</div>
			{/if}
		</div>

		<div
			style="overflow-x:auto;border-radius:14px;border:1px solid rgba(255,255,255,0.07);background:rgba(10,16,26,0.6);margin-bottom:14px;"
		>
			<table style="width:100%;min-width:700px;border-collapse:collapse;font-size:13px;">
				<thead>
					<tr style="background:rgba(0,0,0,0.25);">
						{#each ['Fecha', 'Descripción / Folio', 'Subtotal', 'IVA', 'Total', 'Estado', ''] as col, i (col)}
							<th
								style="padding:11px {i === 0 || i === 1 ? '18px' : '14px'};text-align:{i > 1 &&
								i < 5
									? 'right'
									: i === 6
										? 'center'
										: 'left'};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#334155;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap;"
							>
								{col}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each filtered as inv (inv.id || rowFolio(inv) + rowDate(inv))}
						{@const st = statusInfo(inv.status)}
						{@const folio = rowFolio(inv)}
						<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
							<td
								style="padding:13px 18px;color:#475569;font-family:monospace;font-size:12px;white-space:nowrap;vertical-align:top;"
							>
								{formatDateLocal(rowDate(inv))}
							</td>
							<td style="padding:13px 18px;vertical-align:top;">
								<div style="font-size:13px;font-weight:500;color:#e2e8f0;line-height:1.4;">
									{inv.description ?? inv.concepto ?? 'Suscripción Nexus'}
								</div>
								{#if folio}
									<div style="margin-top:2px;font-family:monospace;font-size:11px;color:#334155;">
										{folio}
									</div>
								{/if}
							</td>
							<td
								style="padding:13px 14px;text-align:right;color:#94a3b8;font-variant-numeric:tabular-nums;white-space:nowrap;vertical-align:top;"
							>
								{rowSub(inv) != null ? formatMxn(rowSub(inv)) : '—'}
							</td>
							<td
								style="padding:13px 14px;text-align:right;color:#94a3b8;font-variant-numeric:tabular-nums;white-space:nowrap;vertical-align:top;"
							>
								{rowTax(inv) != null ? formatMxn(rowTax(inv)) : '—'}
							</td>
							<td
								style="padding:13px 14px;text-align:right;font-weight:700;font-size:14px;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap;vertical-align:top;"
							>
								{rowTotal(inv) != null ? formatMxn(rowTotal(inv)) : '—'}
							</td>
							<td style="padding:13px 14px;vertical-align:top;">
								<span
									style="display:inline-flex;align-items:center;gap:5px;border-radius:99px;border:1px solid {st.border};background:{st.bg};padding:3px 9px;font-size:11px;font-weight:600;color:{st.color};"
								>
									<span
										style="width:5px;height:5px;border-radius:50%;background:{st.color};flex-shrink:0;"
									></span>
									{st.label}
								</span>
							</td>
							<td
								style="padding:13px 14px;text-align:center;vertical-align:top;white-space:nowrap;"
							>
								<button
									disabled
									title="PDF disponible cuando el esquema fiscal esté vinculado"
									style="border-radius:7px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);padding:4px 9px;font-size:11px;font-weight:600;color:#334155;cursor:not-allowed;margin-right:4px;"
								>
									PDF
								</button>
								<button
									disabled
									title="XML disponible cuando el esquema fiscal esté vinculado"
									style="border-radius:7px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);padding:4px 9px;font-size:11px;font-weight:600;color:#334155;cursor:not-allowed;"
								>
									XML
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr style="background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.07);">
						<td
							colspan="4"
							style="padding:12px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#334155;"
						>
							Total ({filtered.length} factura{filtered.length !== 1 ? 's' : ''})
						</td>
						<td
							style="padding:12px 14px;text-align:right;font-size:16px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;"
						>
							{formatMxn(totalFiltered)}
						</td>
						<td colspan="2"></td>
					</tr>
				</tfoot>
			</table>
		</div>

		<div
			style="display:flex;align-items:flex-start;gap:8px;background:rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.04);border-radius:10px;padding:11px 14px;"
		>
			<svg
				style="flex-shrink:0;margin-top:1px;"
				width="13"
				height="13"
				fill="none"
				viewBox="0 0 24 24"
				stroke="#334155"
				stroke-width="2"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<p style="margin:0;font-size:11px;color:#334155;line-height:1.6;">
				Importes <strong style="color:#475569;">antes de IVA</strong>. El IVA aplica solo cuando
				solicitas factura (CFDI). Las descargas PDF y XML se habilitan cuando el esquema fiscal esté
				vinculado a tu organización. Cargos bajo cláusulas generales
				<strong style="color:#475569;">Nexus by GeminisLabs</strong>.
			</p>
		</div>
	{/if}
{/if}

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	select option {
		background: #0f172a;
	}
</style>
