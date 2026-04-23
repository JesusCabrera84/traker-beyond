<script>
	import ProductSectionLayout from '$lib/components/control-panel/ProductSectionLayout.svelte';

	const tabs = [
		{ href: '/control-panel/products/orion/api-keys', label: 'API Keys', icon: 'key' },
		{ href: '/control-panel/products/orion/limits', label: 'Límites', icon: 'chart' },
		{ href: '/control-panel/products/orion/logs', label: 'Logs', icon: 'file' },
		{ href: '/control-panel/products/orion/playground', label: 'Playground', icon: 'play' }
	];
</script>

<ProductSectionLayout
	accent="orion"
	sectionTitle="Orion"
	sectionSubtitle="APIs, cuotas y trazabilidad de integraciones"
	{tabs}
>
	<svelte:fragment slot="icon">
		<svg class="h-5 w-5 stroke-cyan-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M3.75 13.5h8.25L19.5 3.75v6.75H11.25L4.5 20.25v-6.75z"
			/>
		</svg>
	</svelte:fragment>
	<slot />
</ProductSectionLayout>
