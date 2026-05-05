<!-- src/routes/control-panel/billing/invoices/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { billingService } from '$lib/services/billingService.js';
	import { formatMxn } from '$lib/utils/currency.js';
	import { formatDateLocal } from '$lib/utils/datetime.js';

	const PAGE_SIZE = 20;

	let loading = true;
	let loadingMore = false;
	let fromDemo = false;
	let rows = [];
	let total = 0;
	let hasMore = false;
	let offset = 0;
	let error = null;
	let yearFilter = 'all';
	let statusFilter = 'all';

	onMount(async () => {
		await fetchPage(0, true);
	});

	async function fetchPage(newOffset, reset = false) {
		if (reset) {
			loading = true;
			rows = [];
			offset = 0;
		} else {
			loadingMore = true;
		}
		error = null;
		try {
			const res = await billingService.getInvoices({ limit: PAGE_SIZE, offset: newOffset });
			const newRows = res.data;
			if (reset) {
				rows = newRows;
			} else {
				rows = [...rows, ...newRows];
			}
			total = res.total;
			hasMore = res.has_more;
			offset = newOffset + newRows.length;
			fromDemo = res.fromDemo;
		} catch {
			error = 'No se pudieron cargar las facturas.';
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	async function loadMore() {
		await fetchPage(offset);
	}

	// ── Field accessors ──────────────────────────────────────────────────────

	function rowDate(inv) {
		return inv.issued_at ?? inv.paid_at ?? inv.date ?? inv.created_at;
	}
	function rowPaidAt(inv) {
		return inv.paid_at;
	}
	function rowTotal(inv) {
		const t = inv.total_mxn ?? inv.total ?? inv.amount_mxn ?? inv.amount;
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
	function rowNumber(inv) {
		// API returns invoice_number like "INV-2024-0012"
		if (inv.invoice_number) return inv.invoice_number;
		if (inv.series && inv.folio) return `${inv.series}-${inv.folio}`;
		if (inv.folio) return String(inv.folio);
		return null;
	}
	function rowDesc(inv) {
		return inv.description ?? inv.concepto ?? 'Suscripción Nexus';
	}
	function rowUrl(inv) {
		return inv.invoice_url ?? null;
	}
	function rowPaymentId(inv) {
		return inv.payment_id ?? null;
	}

	function statusInfo(status) {
		const s = (status || '').toUpperCase();
		if (s === 'PAID' || s === 'PAGADA' || s === 'PAID_OUT')
			return {
				label: 'Pagada',
				color: '#4ade80',
				bg: 'rgba(74,222,128,0.08)',
				border: 'rgba(74,222,128,0.2)'
			};
		if (s === 'PENDING' || s === 'PENDIENTE' || s === 'OPEN')
			return {
				label: 'Pendiente',
				color: '#fbbf24',
				bg: 'rgba(251,191,36,0.08)',
				border: 'rgba(251,191,36,0.2)'
			};
		if (s === 'OVERDUE')
			return {
				label: 'Vencida',
				color: '#f87171',
				bg: 'rgba(248,113,113,0.08)',
				border: 'rgba(248,113,113,0.2)'
			};
		if (s === 'VOID' || s === 'CANCELADA')
			return {
				label: 'Anulada',
				color: '#64748b',
				bg: 'rgba(100,116,139,0.08)',
				border: 'rgba(100,116,139,0.2)'
			};
		if (s === 'DRAFT')
			return {
				label: 'Borrador',
				color: '#94a3b8',
				bg: 'rgba(148,163,184,0.06)',
				border: 'rgba(148,163,184,0.15)'
			};
		return {
			label: status || '—',
			color: '#818cf8',
			bg: 'rgba(129,140,248,0.08)',
			border: 'rgba(129,140,248,0.2)'
		};
	}

	// ── Filters ──────────────────────────────────────────────────────────────

	$: years = (() => {
		const y = new SvelteSet();
		for (const inv of rows) {
			const d = rowDate(inv);
			if (d) y.add(String(d).slice(0, 4));
		}
		return Array.from(y).sort((a, b) => b.localeCompare(a));
	})();

	$: filtered = rows.filter((inv) => {
		if (yearFilter !== 'all') {
			const d = rowDate(inv);
			if (!d || !String(d).startsWith(yearFilter)) return false;
		}
		if (statusFilter !== 'all') {
			const s = (inv.status || '').toUpperCase();
			if (s !== statusFilter) return false;
		}
		return true;
	});

	$: totalFiltered = filtered.reduce((acc, inv) => acc + (rowTotal(inv) ?? 0), 0);
	$: paidCount = filtered.filter((inv) => {
		const s = (inv.status || '').toUpperCase();
		return s === 'PAID' || s === 'PAGADA' || s === 'PAID_OUT';
	}).length;
	$: pendingCount = filtered.filter((inv) => {
		const s = (inv.status || '').toUpperCase();
		return s === 'PENDING' || s === 'OPEN';
	}).length;
</script>

<svelte:head><title>Facturas — Facturación | Geminis Labs</title></svelte:head>

<!-- ── Demo banner ────────────────────────────────────────────────────────── -->
{#if fromDemo && !loading}
	<div class="alert alert--demo">
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
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span
			><strong>Modo demostración.</strong> Cuando el backend conecte el historial, aquí verás tus CFDI
			reales.</span
		>
	</div>
{/if}

<!-- ── Loading ────────────────────────────────────────────────────────────── -->
{#if loading}
	<div class="kpi-row mb-4">
		{#each [1, 2, 3] as i (i)}<div class="skeleton h-20 rounded-xl"></div>{/each}
	</div>
	<div class="skeleton h-96 rounded-2xl"></div>

	<!-- ── Error ──────────────────────────────────────────────────────────────── -->
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
		<button on:click={() => fetchPage(0, true)} class="btn-link">Reintentar</button>
	</div>
{:else if rows.length === 0}
	<!-- ── Estado vacío ───────────────────────────────────────────────────────── -->
	<div class="empty-state">
		<div class="empty-state__icon">
			<svg
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
				stroke="#334155"
				stroke-width="1.5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
		</div>
		<h3 class="empty-state__title">Sin facturas aún</h3>
		<p class="empty-state__text">
			Los cobros de tu suscripción aparecerán aquí con número de factura, importes e IVA desglosado.
			Una vez realizados los primeros pagos, podrás descargar tus comprobantes en PDF y XML.
		</p>
		<a href="/control-panel/billing/summary" class="btn-secondary">
			<svg
				width="13"
				height="13"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Ir al resumen de facturación
		</a>
	</div>
{:else}
	<!-- ── KPIs ──────────────────────────────────────────────────────────────── -->
	<div class="kpi-row mb-5">
		<div class="kpi-mini">
			<p class="kpi-mini__label">Total facturas</p>
			<p class="kpi-mini__value" style="color:#e2e8f0;">{total > 0 ? total : filtered.length}</p>
		</div>
		<div class="kpi-sep"></div>
		<div class="kpi-mini">
			<p class="kpi-mini__label">Pagadas</p>
			<p class="kpi-mini__value" style="color:#4ade80;">{paidCount}</p>
		</div>
		{#if pendingCount > 0}
			<div class="kpi-sep"></div>
			<div class="kpi-mini">
				<p class="kpi-mini__label">Pendientes</p>
				<p class="kpi-mini__value" style="color:#fbbf24;">{pendingCount}</p>
			</div>
		{/if}
		<div class="kpi-sep"></div>
		<div class="kpi-mini kpi-mini--right">
			<p class="kpi-mini__label">
				{yearFilter !== 'all' ? `Total ${yearFilter}` : 'Importe total'}
			</p>
			<p class="kpi-mini__value" style="color:#818cf8; font-size:18px;">
				{formatMxn(totalFiltered)}
			</p>
		</div>
	</div>

	<!-- ── Filtros ───────────────────────────────────────────────────────────── -->
	<div class="filters-bar mb-4">
		<div class="filters-bar__group">
			<label for="yr" class="filter-label">Período</label>
			<select id="yr" bind:value={yearFilter} class="filter-select">
				<option value="all">Todos los años</option>
				{#each years as y (y)}<option value={y}>{y}</option>{/each}
			</select>
		</div>
		<div class="filters-bar__group">
			<label for="st" class="filter-label">Estado</label>
			<select id="st" bind:value={statusFilter} class="filter-select">
				<option value="all">Todos</option>
				<option value="PAID">Pagadas</option>
				<option value="PENDING">Pendientes</option>
				<option value="OVERDUE">Vencidas</option>
				<option value="VOID">Anuladas</option>
			</select>
		</div>
		{#if yearFilter !== 'all' || statusFilter !== 'all'}
			<button
				on:click={() => {
					yearFilter = 'all';
					statusFilter = 'all';
				}}
				class="filter-clear"
			>
				<svg
					width="12"
					height="12"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2.5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
				Limpiar filtros
			</button>
		{/if}
		<div class="filters-bar__right">
			<span class="results-count"
				>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span
			>
		</div>
	</div>

	<!-- ── Tabla ─────────────────────────────────────────────────────────────── -->
	<div class="table-wrap mb-4">
		<table class="inv-table">
			<thead>
				<tr>
					<th class="th">N.° Factura</th>
					<th class="th">Descripción</th>
					<th class="th th--right">Importe</th>
					<th class="th">Fecha emisión</th>
					<th class="th">Fecha pago</th>
					<th class="th th--center">Estado</th>
					<th class="th th--center">Descargar</th>
				</tr>
			</thead>
			<tbody>
				{#if filtered.length === 0}
					<tr>
						<td colspan="7" class="td td--empty">
							<div class="no-results">
								<svg
									width="18"
									height="18"
									fill="none"
									viewBox="0 0 24 24"
									stroke="#334155"
									stroke-width="1.5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
								No hay facturas con los filtros aplicados.
							</div>
						</td>
					</tr>
				{:else}
					{#each filtered as inv (inv.id ?? rowNumber(inv) + rowDate(inv))}
						{@const st = statusInfo(inv.status)}
						{@const num = rowNumber(inv)}
						{@const url = rowUrl(inv)}
						{@const sub = rowSub(inv)}
						{@const tax = rowTax(inv)}
						{@const tot = rowTotal(inv)}
						<tr class="tbody-row">
							<td class="td td--num">
								{#if num}
									<span class="inv-number">{num}</span>
								{:else}
									<span class="inv-number inv-number--empty">—</span>
								{/if}
							</td>
							<td class="td">
								<span class="inv-desc">{rowDesc(inv)}</span>
								{#if rowPaymentId(inv)}
									<span class="inv-payid">ref: {String(rowPaymentId(inv)).slice(-8)}</span>
								{/if}
							</td>
							<td class="td td--right">
								<span class="inv-amount">{tot != null ? formatMxn(tot) : '—'}</span>
								{#if sub != null || tax != null}
									<span class="inv-breakdown">
										{#if sub != null}{formatMxn(sub)} + IVA{/if}
									</span>
								{/if}
							</td>
							<td class="td td--date">{formatDateLocal(rowDate(inv))}</td>
							<td class="td td--date">{rowPaidAt(inv) ? formatDateLocal(rowPaidAt(inv)) : '—'}</td>
							<td class="td td--center">
								<span
									class="status-pill"
									style="color:{st.color}; background:{st.bg}; border-color:{st.border};"
								>
									<span class="status-dot" style="background:{st.color};"></span>
									{st.label}
								</span>
							</td>
							<td class="td td--center">
								{#if url}
									<a
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										class="dl-btn dl-btn--active"
										title="Descargar comprobante"
									>
										<svg
											width="12"
											height="12"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2.5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
											/>
										</svg>
										PDF
									</a>
								{:else}
									<span
										class="dl-btn dl-btn--disabled"
										title="Disponible cuando el esquema fiscal esté vinculado"
									>
										<svg
											width="12"
											height="12"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2.5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
											/>
										</svg>
										PDF
									</span>
								{/if}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
			{#if filtered.length > 0}
				<tfoot>
					<tr class="tfoot-row">
						<td colspan="2" class="tfoot-td tfoot-td--label">
							{filtered.length} factura{filtered.length !== 1 ? 's' : ''}
							{yearFilter !== 'all' ? `· ${yearFilter}` : ''}
						</td>
						<td class="tfoot-td tfoot-td--total">{formatMxn(totalFiltered)}</td>
						<td colspan="4"></td>
					</tr>
				</tfoot>
			{/if}
		</table>
	</div>

	<!-- ── Load more ─────────────────────────────────────────────────────────── -->
	{#if hasMore && yearFilter === 'all' && statusFilter === 'all'}
		<div class="load-more-row mb-5">
			<button on:click={loadMore} disabled={loadingMore} class="load-more-btn">
				{#if loadingMore}
					<span class="spinner-xs"></span> Cargando…
				{:else}
					Cargar más facturas
				{/if}
			</button>
			<span class="load-more-info">{rows.length} de {total}</span>
		</div>
	{/if}

	<!-- ── Nota fiscal ────────────────────────────────────────────────────────── -->
	<div class="fiscal-note">
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
			Importes mostrados <strong>con IVA incluido</strong>. Las descargas PDF se habilitan cuando el
			esquema fiscal esté vinculado a tu organización. Cargos bajo cláusulas generales
			<strong>Nexus by GeminisLabs</strong>. ¿Requieres CFDI? Contacta a
			<a href="mailto:facturacion@geminislabs.io" class="note-link">facturacion@geminislabs.io</a>.
		</p>
	</div>
{/if}

<style>
	/* ── Alert ───────────────────────────────────────────────────────────────── */
	.alert--demo {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		background: rgba(139, 92, 246, 0.07);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 12px;
		padding: 12px 16px;
		font-size: 13px;
		color: #c4b5fd;
		margin-bottom: 16px;
	}

	/* ── Error / empty ───────────────────────────────────────────────────────── */
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

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		border: 1px dashed rgba(255, 255, 255, 0.08);
		border-radius: 20px;
		background: rgba(10, 16, 26, 0.4);
		padding: 64px 24px;
		text-align: center;
	}
	.empty-state__icon {
		width: 52px;
		height: 52px;
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: rgba(255, 255, 255, 0.03);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.empty-state__title {
		font-size: 17px;
		font-weight: 700;
		color: #e2e8f0;
		margin: 0;
	}
	.empty-state__text {
		font-size: 13px;
		color: #475569;
		line-height: 1.7;
		max-width: 44ch;
		margin: 0;
	}
	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: 10px;
		padding: 9px 16px;
		font-size: 13px;
		font-weight: 500;
		color: #94a3b8;
		text-decoration: none;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #e2e8f0;
	}

	/* ── Skeleton ────────────────────────────────────────────────────────────── */
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
	.mb-4 {
		margin-bottom: 16px;
	}
	.mb-5 {
		margin-bottom: 20px;
	}

	/* ── KPI row ─────────────────────────────────────────────────────────────── */
	.kpi-row {
		display: flex;
		align-items: center;
		gap: 0;
		background: rgba(10, 16, 26, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 16px;
		padding: 16px 20px;
		flex-wrap: wrap;
	}
	.kpi-mini {
		min-width: 80px;
	}
	.kpi-mini--right {
		margin-left: auto;
		text-align: right;
	}
	.kpi-mini__label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #334155;
		margin: 0 0 4px;
	}
	.kpi-mini__value {
		font-size: 22px;
		font-weight: 800;
		margin: 0;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.03em;
	}
	.kpi-sep {
		width: 1px;
		height: 36px;
		background: rgba(255, 255, 255, 0.06);
		margin: 0 20px;
	}

	/* ── Filters ─────────────────────────────────────────────────────────────── */
	.filters-bar {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		flex-wrap: wrap;
	}
	.filters-bar__group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.filters-bar__right {
		margin-left: auto;
		display: flex;
		align-items: flex-end;
	}
	.filter-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #334155;
	}
	.filter-select {
		appearance: none;
		background: rgba(10, 16, 26, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		padding: 8px 12px;
		font-size: 13px;
		color: #e2e8f0;
		outline: none;
		cursor: pointer;
		min-width: 150px;
		transition: border-color 0.15s;
	}
	.filter-select:focus {
		border-color: rgba(99, 102, 241, 0.4);
	}
	.filter-select option {
		background: #0f172a;
	}
	.filter-clear {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		align-self: flex-end;
		background: none;
		border: 1px solid rgba(248, 113, 113, 0.2);
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 12px;
		font-weight: 600;
		color: #f87171;
		cursor: pointer;
		transition: background 0.15s;
	}
	.filter-clear:hover {
		background: rgba(248, 113, 113, 0.07);
	}
	.results-count {
		font-size: 12px;
		color: #334155;
	}

	/* ── Table ───────────────────────────────────────────────────────────────── */
	.table-wrap {
		overflow-x: auto;
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: rgba(10, 16, 26, 0.6);
	}
	.inv-table {
		width: 100%;
		min-width: 760px;
		border-collapse: collapse;
		font-size: 13px;
	}

	.th {
		padding: 11px 16px;
		text-align: left;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #334155;
		background: rgba(0, 0, 0, 0.2);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		white-space: nowrap;
	}
	.th--right {
		text-align: right;
	}
	.th--center {
		text-align: center;
	}

	.tbody-row {
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		transition: background 0.1s;
	}
	.tbody-row:last-child {
		border-bottom: none;
	}
	.tbody-row:hover {
		background: rgba(255, 255, 255, 0.015);
	}

	.td {
		padding: 13px 16px;
		vertical-align: middle;
	}
	.td--num {
		white-space: nowrap;
	}
	.td--right {
		text-align: right;
	}
	.td--center {
		text-align: center;
	}
	.td--date {
		white-space: nowrap;
		font-size: 12px;
		color: #475569;
		font-variant-numeric: tabular-nums;
	}
	.td--empty {
		padding: 40px;
	}

	.inv-number {
		font-family: 'Courier New', monospace;
		font-size: 12px;
		font-weight: 700;
		color: #6366f1;
		background: rgba(99, 102, 241, 0.08);
		border: 1px solid rgba(99, 102, 241, 0.18);
		border-radius: 6px;
		padding: 3px 8px;
		white-space: nowrap;
	}
	.inv-number--empty {
		color: #334155;
		background: none;
		border: none;
		font-family: inherit;
	}

	.inv-desc {
		display: block;
		font-weight: 500;
		color: #e2e8f0;
		line-height: 1.4;
	}
	.inv-payid {
		display: block;
		font-family: monospace;
		font-size: 10px;
		color: #334155;
		margin-top: 2px;
	}

	.inv-amount {
		display: block;
		font-weight: 700;
		color: #f1f5f9;
		font-variant-numeric: tabular-nums;
	}
	.inv-breakdown {
		display: block;
		font-size: 11px;
		color: #475569;
		margin-top: 2px;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		border-radius: 99px;
		border: 1px solid;
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 700;
		white-space: nowrap;
	}
	.status-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* ── Download buttons ────────────────────────────────────────────────────── */
	.dl-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		border-radius: 7px;
		border: 1px solid;
		padding: 4px 10px;
		font-size: 11px;
		font-weight: 700;
		white-space: nowrap;
		text-decoration: none;
		transition: filter 0.15s;
	}
	.dl-btn--active {
		background: rgba(99, 102, 241, 0.1);
		border-color: rgba(99, 102, 241, 0.3);
		color: #a5b4fc;
		cursor: pointer;
	}
	.dl-btn--active:hover {
		filter: brightness(1.25);
	}
	.dl-btn--disabled {
		background: rgba(255, 255, 255, 0.02);
		border-color: rgba(255, 255, 255, 0.07);
		color: #334155;
		cursor: not-allowed;
	}

	/* ── Table footer ────────────────────────────────────────────────────────── */
	.tfoot-row {
		background: rgba(0, 0, 0, 0.2);
		border-top: 1px solid rgba(255, 255, 255, 0.07);
	}
	.tfoot-td {
		padding: 12px 16px;
	}
	.tfoot-td--label {
		text-align: right;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #334155;
	}
	.tfoot-td--total {
		text-align: right;
		font-size: 17px;
		font-weight: 800;
		color: #fff;
		font-variant-numeric: tabular-nums;
	}

	/* ── No results ──────────────────────────────────────────────────────────── */
	.no-results {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 13px;
		color: #334155;
		padding: 24px 0;
	}

	/* ── Load more ───────────────────────────────────────────────────────────── */
	.load-more-row {
		display: flex;
		align-items: center;
		gap: 12px;
		justify-content: center;
	}
	.load-more-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: 10px;
		padding: 9px 20px;
		font-size: 13px;
		font-weight: 600;
		color: #94a3b8;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.load-more-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.load-more-btn:not(:disabled):hover {
		background: rgba(255, 255, 255, 0.07);
		color: #e2e8f0;
	}
	.load-more-info {
		font-size: 11px;
		color: #334155;
	}
	.spinner-xs {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 2px solid rgba(148, 163, 184, 0.25);
		border-top-color: #94a3b8;
		animation: spin 0.7s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ── Fiscal note ─────────────────────────────────────────────────────────── */
	.fiscal-note {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.04);
		border-radius: 10px;
		padding: 12px 16px;
	}
	.fiscal-note p {
		margin: 0;
		font-size: 11px;
		color: #334155;
		line-height: 1.7;
	}
	.fiscal-note strong {
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
