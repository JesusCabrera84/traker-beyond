<script>
	export let activeTab = 'actual';

	function handleTabChange(tab) {
		activeTab = tab;
		// Disparar evento para que el componente padre pueda manejar el cambio
		dispatchEvent(new CustomEvent('tabChange', { detail: tab }));
	}
</script>

<header class="header-container">
	<div class="py-4">
		<div class="header-nav">
			<button
				class="header-button {activeTab === 'actual' ? 'header-button-active' : 'header-button-inactive'}"
				on:click={() => handleTabChange('actual')}
			>
				Actual
			</button>
			<button
				class="header-button {activeTab === 'live' ? 'header-button-active' : 'header-button-inactive'}"
				on:click={() => handleTabChange('live')}
			>
				Live
			</button>
			<button
				class="header-button {activeTab === 'grupos' ? 'header-button-active' : 'header-button-inactive'}"
				on:click={() => handleTabChange('grupos')}
			>
				Grupos
			</button>
		</div>
	</div>
</header> 