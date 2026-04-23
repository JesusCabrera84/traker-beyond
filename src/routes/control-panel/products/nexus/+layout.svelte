<script>
	import ProductSectionLayout from '$lib/components/control-panel/ProductSectionLayout.svelte';

	const tabs = [
		{ href: '/control-panel/products/nexus/status', label: 'Estado', icon: 'pulse' },
		{ href: '/control-panel/products/nexus/devices', label: 'Dispositivos', icon: 'cpu' },
		{ href: '/control-panel/products/nexus/consumption', label: 'Consumo', icon: 'chart' }
	];
</script>

<ProductSectionLayout
	accent="nexus"
	sectionTitle="Nexus"
	sectionSubtitle="Telemetría, dispositivos y consumo de tu flota"
	{tabs}
>
	<svelte:fragment slot="icon">
		<svg class="h-5 w-5 stroke-sky-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 16.5V21m3.75-18v1.5m0 16.5V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
			/>
		</svg>
	</svelte:fragment>
	<slot />
</ProductSectionLayout>
