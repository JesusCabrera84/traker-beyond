<script>
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { goto, beforeNavigate } from '$app/navigation';
	import { authStore, isAuthenticated } from '$lib/stores/authStore.js';

	let { children } = $props();

	function checkAuth() {
		if (!get(isAuthenticated)) {
			goto('/auth', { replaceState: true });
		}
	}

	onMount(() => {
		// Re-inicializar para revalidar expiración del token
		authStore.init();
		checkAuth();
	});

	beforeNavigate(checkAuth);
</script>

{@render children?.()}
