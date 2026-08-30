<script>
	import { toastStore } from '$lib/stores/toastStore.js';
	import Toast from './Toast.svelte';
</script>

<div class="toasts" aria-live="polite" aria-relevant="additions text">
	{#each $toastStore as toast (toast.id)}
		<Toast type={toast.type} message={toast.message} onClose={() => toastStore.remove(toast.id)} />
	{/each}
</div>

<style>
	.toasts {
		position: fixed;
		top: max(16px, env(safe-area-inset-top));
		right: max(16px, env(safe-area-inset-right));
		z-index: 20000;
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: min(380px, calc(100vw - 32px));
		max-height: calc(100vh - 32px);
		overflow: auto;
		pointer-events: none;
	}
</style>
