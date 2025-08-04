<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { children } = $props();

	onMount(() => {
		// Verificar autenticación en el layout
		if (browser) {
			const isLoggedIn = localStorage.getItem('isLoggedIn');
			if (isLoggedIn !== 'true') {
				goto('/');
			}
		}
	});
</script>

<div class="min-h-screen w-full">
	{@render children?.()}
</div> 