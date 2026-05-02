<script>
	import { toastStore } from '$lib/stores/toastStore.js';
	import Toast from './Toast.svelte';
</script>

<!-- Contenedor de notificaciones -->
<div class="toast-container-wrapper pointer-events-none fixed top-0 right-0 z-50 p-4">
	{#each $toastStore as toast (toast.id)}
		<div class="mb-3">
			<Toast
				type={toast.type}
				message={toast.message}
				duration={0}
				onClose={() => toastStore.remove(toast.id)}
			/>
		</div>
	{/each}
</div>

<style>
	.toast-container-wrapper {
		max-height: 100vh;
		overflow-y: auto;
	}
</style>
