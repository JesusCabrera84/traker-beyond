<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	export let type = 'info'; // 'success', 'error', 'warning', 'info'
	export let message = '';
	export let duration = 5000; // Duración en milisegundos
	export let onClose = () => {};

	let visible = true;
	let timeoutId;

	onMount(() => {
		if (duration > 0) {
			timeoutId = setTimeout(() => {
				close();
			}, duration);
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	function close() {
		visible = false;
		setTimeout(() => {
			onClose();
		}, 300); // Esperar a que termine la animación
	}

	// Configuración de estilos según el tipo
	$: typeStyles = {
		success: {
			bg: 'bg-green-500/20',
			border: 'border-green-500/30',
			text: 'text-green-200',
			icon: '✓'
		},
		error: {
			bg: 'bg-red-500/20',
			border: 'border-red-500/30',
			text: 'text-red-200',
			icon: '✕'
		},
		warning: {
			bg: 'bg-yellow-500/20',
			border: 'border-yellow-500/30',
			text: 'text-yellow-200',
			icon: '⚠'
		},
		info: {
			bg: 'bg-blue-500/20',
			border: 'border-blue-500/30',
			text: 'text-blue-200',
			icon: 'ℹ'
		}
	}[type];
</script>

{#if visible}
	<div class="toast-container fixed top-4 right-4 z-50" transition:fly={{ x: 300, duration: 300 }}>
		<div
			class="toast-content {typeStyles.bg} {typeStyles.border} {typeStyles.text} 
				   max-w-96 min-w-80 rounded-lg border p-4 shadow-lg backdrop-blur-md"
		>
			<div class="flex items-start gap-3">
				<div class="toast-icon flex-shrink-0 text-xl font-bold">
					{typeStyles.icon}
				</div>
				<div class="toast-message flex-1 text-sm leading-relaxed">
					{message}
				</div>
				<button
					class="toast-close flex-shrink-0 text-lg leading-none opacity-70 transition-opacity hover:opacity-100"
					on:click={close}
					aria-label="Cerrar notificación"
				>
					×
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.toast-container {
		pointer-events: auto;
	}

	.toast-content {
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.toast-close {
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
	}
</style>
