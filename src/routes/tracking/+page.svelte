<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import GoogleMap from '$lib/components/GoogleMap.svelte';
	import Header from '$lib/components/Header.svelte';
	import { gpsService } from '$lib/services/gpsService.js';

	let activeTab = 'actual';
	let devices = [];
	let loading = true;
	let error = null;

	// Configuración del mapa
	const mapConfig = {
		apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
		center: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México
		zoom: 12
	};

	onMount(async () => {
		// Verificar si está logueado
		if (browser) {
			const isLoggedIn = localStorage.getItem('isLoggedIn');
			if (isLoggedIn !== 'true') {
				goto('/');
				return;
			}
		}

		await loadDevices();
	});

	onDestroy(() => {
		// Limpiar intervalos al destruir el componente
		gpsService.stopLiveUpdates();
	});

	async function loadDevices() {
		loading = true;
		error = null;

		try {
			if (activeTab === 'live') {
				// Iniciar actualizaciones en tiempo real
				gpsService.startLiveUpdates((updatedDevices) => {
					devices = updatedDevices;
				});
			} else {
				// Detener actualizaciones en tiempo real si estaban activas
				gpsService.stopLiveUpdates();
				
				// Cargar datos una sola vez
				if (mapConfig.apiKey) {
					// Intentar cargar desde la API real
					try {
						devices = await gpsService.getDevices();
					} catch (apiError) {
						console.warn('API no disponible, usando datos de prueba:', apiError);
						devices = gpsService.getMockDevices();
					}
				} else {
					// Usar datos de prueba si no hay API key
					devices = gpsService.getMockDevices();
				}
			}
		} catch (err) {
			error = err.message;
			console.error('Error loading devices:', err);
		} finally {
			loading = false;
		}
	}

	function handleTabChange(event) {
		const newTab = event.detail;
		if (newTab !== activeTab) {
			activeTab = newTab;
			loadDevices();
		}
	}

	function handleLogout() {
		if (browser) {
			localStorage.removeItem('isLoggedIn');
			localStorage.removeItem('userEmail');
		}
		goto('/');
	}
</script>

<svelte:head>
	<title>GPS Tracker - Mapa en Tiempo Real</title>
	<meta name="description" content="Sistema de seguimiento GPS en tiempo real" />
</svelte:head>

<div class="full-screen">
	<!-- Header transparente -->
	<Header {activeTab} on:tabChange={handleTabChange} />

	<!-- Botón de logout -->
	<div class="absolute top-4 right-4 z-50">
		<button
			on:click={handleLogout}
			class="logout-button"
		>
			Cerrar sesión
		</button>
	</div>

	<!-- Mapa de Google Maps -->
	<div class="map-container">
		{#if mapConfig.apiKey}
			<GoogleMap
				apiKey={mapConfig.apiKey}
				center={mapConfig.center}
				zoom={mapConfig.zoom}
				markers={devices}
			/>
		{:else}
			<!-- Placeholder cuando no hay API key -->
			<div class="map-placeholder">
				<div class="map-placeholder-content">
					<div class="text-6xl mb-4">🗺️</div>
					<h1 class="text-lg-bold mb-2">Google Maps no configurado</h1>
					<p class="text-gray-300 mb-4">
						Necesitas configurar VITE_GOOGLE_MAPS_API_KEY en tu archivo .env
					</p>
					<div class="bg-gray-800 p-4 rounded-lg text-left text-sm">
						<code class="text-green-400">VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui</code>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Indicador de carga -->
	{#if loading}
		<div class="loading-overlay">
			<div class="loading-container">
				<div class="flex-items-center flex-space-x-2">
					<div class="spinner"></div>
					<span class="text-sm-medium text-gray-700">
						{activeTab === 'live' ? 'Actualizando en tiempo real...' : 'Cargando dispositivos...'}
					</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- Indicador de error -->
	{#if error}
		<div class="loading-overlay">
			<div class="error-container">
				<div class="flex-items-center flex-space-x-2">
					<span class="text-white text-sm">⚠️ Error: {error}</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- Contador de dispositivos -->
	{#if devices.length > 0}
		<div class="device-counter">
			<div class="device-counter-container">
				<span class="text-sm-medium text-gray-700">
					{devices.length} dispositivo{devices.length !== 1 ? 's' : ''} activo{devices.length !== 1 ? 's' : ''}
				</span>
			</div>
		</div>
	{/if}
</div> 