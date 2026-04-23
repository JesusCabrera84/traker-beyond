<script>
	let selectedEndpoint = '/v1/locate';
	let selectedKey = 'or_test_2a9x';
	let loading = false;
	let response = null;
	let responseTime = null;

	const endpoints = [
		{ path: '/v1/locate', method: 'POST', desc: 'Localizar dispositivo por celdas' },
		{ path: '/v1/locate/batch', method: 'POST', desc: 'Localización en lote (hasta 100)' },
		{ path: '/v1/status', method: 'GET', desc: 'Estado del servicio y latencia' }
	];

	const keys = [
		{ id: 'or_test_2a9x', label: 'Staging — Backend (test)' },
		{ id: 'or_live_8f3k', label: 'Producción — ERP (live)' }
	];

	const defaultBodies = {
		'/v1/locate': `{\n  "mcc": 334,\n  "mnc": 20,\n  "cells": [\n    { "cid": 12345, "lac": 1001, "signal": -78 },\n    { "cid": 12346, "lac": 1001, "signal": -91 }\n  ]\n}`,
		'/v1/locate/batch': `[\n  { "mcc":334,"mnc":20,"cells":[{"cid":12345,"lac":1001,"signal":-78}] },\n  { "mcc":334,"mnc":20,"cells":[{"cid":22001,"lac":2002,"signal":-84}] }\n]`,
		'/v1/status': ''
	};

	$: body = defaultBodies[selectedEndpoint] ?? '';
	$: method = endpoints.find((e) => e.path === selectedEndpoint)?.method ?? 'POST';

	const mockResponses = {
		'/v1/locate': {
			lat: 25.6866,
			lng: -100.3161,
			accuracy: 580,
			confidence: 0.87,
			provider: 'cell-triangulation'
		},
		'/v1/locate/batch': [
			{ lat: 25.6866, lng: -100.3161, accuracy: 580 },
			{ lat: 20.6597, lng: -103.3496, accuracy: 720 }
		],
		'/v1/status': {
			status: 'operational',
			latency_p50_ms: 144,
			latency_p95_ms: 312,
			uptime_30d: '99.81%'
		}
	};

	async function runRequest() {
		loading = true;
		response = null;
		const t0 = performance.now();
		await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
		responseTime = Math.round(performance.now() - t0);
		response = mockResponses[selectedEndpoint];
		loading = false;
	}
</script>

<svelte:head><title>Playground — Orion | Geminis Labs</title></svelte:head>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start;">
	<!-- Panel izquierdo: configuración -->
	<div style="display:flex;flex-direction:column;gap:12px;">
		<!-- Endpoint selector -->
		<div
			style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"
		>
			<div style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.05);">
				<div
					style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#475569;"
				>
					Endpoint
				</div>
			</div>
			<div style="padding:8px;">
				{#each endpoints as ep (ep.path)}
					<button
						on:click={() => (selectedEndpoint = ep.path)}
						style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:{selectedEndpoint ===
						ep.path
							? 'rgba(99,102,241,0.12)'
							: 'transparent'};cursor:pointer;text-align:left;margin-bottom:2px;border:{selectedEndpoint ===
						ep.path
							? '1px solid rgba(99,102,241,0.25)'
							: '1px solid transparent'};"
					>
						<code
							style="border-radius:5px;background:{ep.method === 'GET'
								? 'rgba(56,189,248,0.1)'
								: 'rgba(167,139,250,0.1)'};padding:2px 6px;font-size:10px;font-weight:700;color:{ep.method ===
							'GET'
								? '#38bdf8'
								: '#a78bfa'};flex-shrink:0;">{ep.method}</code
						>
						<div>
							<div
								style="font-family:monospace;font-size:12px;color:{selectedEndpoint === ep.path
									? '#e2e8f0'
									: '#94a3b8'};"
							>
								{ep.path}
							</div>
							<div style="font-size:10px;color:#334155;margin-top:1px;">{ep.desc}</div>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- API Key -->
		<div
			style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px 18px;"
		>
			<div
				style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin-bottom:10px;"
			>
				API Key
			</div>
			<select
				bind:value={selectedKey}
				style="width:100%;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px 10px;font-size:12px;color:#e2e8f0;outline:none;"
			>
				{#each keys as k (k.id)}<option value={k.id}>{k.label}</option>{/each}
			</select>
		</div>

		<!-- Body -->
		{#if method === 'POST'}
			<div
				style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;"
			>
				<div
					style="padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;"
				>
					<div
						style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#475569;"
					>
						Body · JSON
					</div>
					<span style="font-size:10px;color:#334155;">application/json</span>
				</div>
				<textarea
					value={body}
					readonly
					rows="9"
					style="width:100%;background:rgba(0,0,0,0.2);border:none;padding:14px 18px;font-family:monospace;font-size:12px;color:#94a3b8;resize:none;outline:none;box-sizing:border-box;line-height:1.6;"
				></textarea>
			</div>
		{/if}

		<!-- Botón enviar -->
		<button
			on:click={runRequest}
			disabled={loading}
			style="display:flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;border:none;background:{loading
				? 'rgba(99,102,241,0.4)'
				: 'linear-gradient(135deg,#6366f1,#7c3aed)'};padding:12px;font-size:14px;font-weight:700;color:#fff;cursor:{loading
				? 'not-allowed'
				: 'pointer'};box-shadow:{loading
				? 'none'
				: '0 4px 16px rgba(99,102,241,0.35)'};transition:all .2s;"
		>
			{#if loading}
				<div
					style="width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;animation:spin 1s linear infinite;"
				></div>
				Enviando…
			{:else}
				<svg
					width="16"
					height="16"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
					/><path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				Enviar solicitud
			{/if}
		</button>
	</div>

	<!-- Panel derecho: respuesta -->
	<div
		style="background:rgba(10,16,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;min-height:400px;"
	>
		<div
			style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;"
		>
			<div
				style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#475569;"
			>
				Respuesta
			</div>
			{#if response !== null}
				<div style="display:flex;align-items:center;gap:8px;">
					<span
						style="display:inline-flex;align-items:center;gap:4px;border-radius:99px;border:1px solid rgba(74,222,128,0.25);background:rgba(74,222,128,0.08);padding:3px 8px;font-size:10px;font-weight:700;color:#4ade80;"
					>
						<span style="width:5px;height:5px;border-radius:50%;background:#4ade80;"></span>200 OK
					</span>
					<span style="font-size:11px;color:#334155;font-variant-numeric:tabular-nums;"
						>{responseTime} ms</span
					>
				</div>
			{/if}
		</div>

		{#if response === null && !loading}
			<!-- Estado vacío -->
			<div
				style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;gap:12px;"
			>
				<div
					style="width:48px;height:48px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);display:flex;align-items:center;justify-content:center;"
				>
					<svg
						width="22"
						height="22"
						fill="none"
						viewBox="0 0 24 24"
						stroke="#334155"
						stroke-width="1.5"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
						/><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
				</div>
				<div style="text-align:center;">
					<div style="font-size:13px;font-weight:500;color:#475569;margin-bottom:4px;">
						Listo para probar
					</div>
					<div style="font-size:11px;color:#1e293b;">
						Selecciona un endpoint y envía la solicitud
					</div>
				</div>
			</div>
		{:else if loading}
			<div style="display:flex;align-items:center;justify-content:center;height:300px;gap:10px;">
				<div
					style="width:20px;height:20px;border-radius:50%;border:2px solid rgba(99,102,241,0.2);border-top-color:#6366f1;animation:spin 1s linear infinite;"
				></div>
				<span style="font-size:13px;color:#475569;">Procesando solicitud…</span>
			</div>
		{:else}
			<pre
				style="margin:0;padding:18px;font-family:monospace;font-size:12px;color:#94a3b8;line-height:1.7;overflow:auto;background:rgba(0,0,0,0.15);height:100%;box-sizing:border-box;">{JSON.stringify(
					response,
					null,
					2
				)}</pre>
		{/if}
	</div>
</div>

<!-- ───── Nota ───── -->
<div
	style="margin-top:12px;display:flex;align-items:flex-start;gap:8px;background:rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:11px 14px;"
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
		Este playground simula respuestas. Conecta tu clave <strong style="color:#475569;">live</strong>
		para realizar solicitudes reales contra el motor de localización de Orion. Las solicitudes de prueba
		(<code style="background:rgba(0,0,0,0.2);padding:1px 4px;border-radius:3px;">test</code>) no se
		facturan.
	</p>
</div>

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
