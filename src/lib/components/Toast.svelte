<script>
	import { fly } from 'svelte/transition';

	export let type = 'info';
	export let message = '';
	export let onClose = () => {};

	const copy = {
		success: { label: 'Listo', icon: 'check' },
		error: { label: 'Error', icon: 'cross' },
		warning: { label: 'Atención', icon: 'warn' },
		info: { label: 'Aviso', icon: 'info' }
	};

	$: kind = copy[type] ?? copy.info;
	$: text =
		typeof message === 'string' && message.trim() && message !== '[object Object]'
			? message.trim()
			: 'Algo salió mal. Intenta de nuevo.';
</script>

<div
	class="toast"
	class:toast--success={type === 'success'}
	class:toast--error={type === 'error'}
	class:toast--warning={type === 'warning'}
	class:toast--info={type !== 'success' && type !== 'error' && type !== 'warning'}
	role={type === 'error' ? 'alert' : 'status'}
	transition:fly={{ x: 18, duration: 220 }}
>
	<span class="toast__rail" aria-hidden="true"></span>
	<span class="toast__glyph" aria-hidden="true">
		{#if kind.icon === 'check'}
			<svg
				width="14"
				height="14"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2.4"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
			</svg>
		{:else if kind.icon === 'cross'}
			<svg
				width="14"
				height="14"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2.4"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		{:else if kind.icon === 'warn'}
			<svg
				width="14"
				height="14"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2.2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
				/>
			</svg>
		{:else}
			<svg
				width="14"
				height="14"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2.2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		{/if}
	</span>
	<div class="toast__body">
		<p class="toast__label">{kind.label}</p>
		<p class="toast__msg">{text}</p>
	</div>
	<button type="button" class="toast__close" on:click={onClose} aria-label="Cerrar aviso">
		<svg
			width="12"
			height="12"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2.4"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</button>
</div>

<style>
	.toast {
		pointer-events: auto;
		display: grid;
		grid-template-columns: 3px 32px 1fr 28px;
		align-items: stretch;
		gap: 0;
		width: 100%;
		background: #101820;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			0 18px 40px rgba(0, 0, 0, 0.45),
			0 0 0 1px rgba(255, 255, 255, 0.03) inset;
	}

	.toast__rail {
		display: block;
		align-self: stretch;
		background: #64748b;
	}
	.toast--success .toast__rail {
		background: #34d399;
	}
	.toast--error .toast__rail {
		background: #f87171;
	}
	.toast--warning .toast__rail {
		background: #fbbf24;
	}
	.toast--info .toast__rail {
		background: #818cf8;
	}

	.toast__glyph {
		display: flex;
		align-items: center;
		justify-content: center;
		align-self: start;
		width: 32px;
		height: 40px;
		margin-top: 10px;
	}
	.toast--success .toast__glyph {
		color: #34d399;
	}
	.toast--error .toast__glyph {
		color: #f87171;
	}
	.toast--warning .toast__glyph {
		color: #fbbf24;
	}
	.toast--info .toast__glyph {
		color: #a5b4fc;
	}

	.toast__body {
		padding: 12px 8px 14px 0;
		min-width: 0;
	}
	.toast__label {
		margin: 0 0 3px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #64748b;
	}
	.toast--success .toast__label {
		color: #6ee7b7;
	}
	.toast--error .toast__label {
		color: #fca5a5;
	}
	.toast--warning .toast__label {
		color: #fcd34d;
	}
	.toast--info .toast__label {
		color: #a5b4fc;
	}
	.toast__msg {
		margin: 0;
		font-size: 13px;
		line-height: 1.45;
		font-weight: 500;
		color: #e2e8f0;
		overflow-wrap: anywhere;
	}

	.toast__close {
		width: 28px;
		height: 28px;
		margin: 8px 6px 0 0;
		align-self: start;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 7px;
		color: #64748b;
		cursor: pointer;
	}
	.toast__close:hover {
		background: rgba(255, 255, 255, 0.06);
		color: #cbd5e1;
	}
	.toast__close:focus-visible {
		outline: 2px solid rgba(129, 140, 248, 0.7);
		outline-offset: 1px;
	}

	@media (prefers-reduced-motion: reduce) {
		.toast {
			transition: none;
		}
	}
</style>
