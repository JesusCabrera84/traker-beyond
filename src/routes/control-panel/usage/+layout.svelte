<script>
	import ProductSectionLayout from '$lib/components/control-panel/ProductSectionLayout.svelte';

	const tabs = [
		{ href: '/control-panel/usage/metrics', label: 'Métricas', icon: 'chart' },
		{ href: '/control-panel/usage/history', label: 'Historial', icon: 'clock' }
	];
</script>

<ProductSectionLayout
	accent="usage"
	sectionTitle="Uso"
	sectionSubtitle="Volumen de llamadas, latencias y registro de actividad"
	{tabs}
>
	<svelte:fragment slot="icon">
		<svg class="h-5 w-5 stroke-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v4.125c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 17.25v-4.125zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v8.625c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v13.125c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
			/>
		</svg>
	</svelte:fragment>
	<slot />
</ProductSectionLayout>
