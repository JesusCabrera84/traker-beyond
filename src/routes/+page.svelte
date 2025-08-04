<script>
	import { onMount } from 'svelte';
	
	// Página de login con video de fondo y markers sobrepuestos
	
	let markers = [];
	
	onMount(() => {
		// Crear markers aleatorios
		createRandomMarkers();
	});
	
	function createRandomMarkers() {
		const markerImages = [
			'/img/marker-blue.png',
			'/img/marker-red-1.png',
			'/img/marker-green.png',
			'/img/marker-orange.png'
		];
		
		// Crear entre 6 y 10 markers aleatorios
		const numMarkers = Math.floor(Math.random() * 4) + 6;
		
		markers = [];
		for (let i = 0; i < numMarkers; i++) {
			markers.push({
				id: i,
				src: markerImages[Math.floor(Math.random() * markerImages.length)],
				left: Math.random() * 80 + 10, // 10% a 90% del ancho
				top: Math.random() * 80 + 10,  // 10% a 90% del alto
				opacity: 0.5 + Math.random() * 0.3 // Opacidad entre 0.7 y 1.0
			});
		}
	}
</script>

<svelte:head>
	<title>GPS Tracker - Login</title>
	<meta name="description" content="Sistema de seguimiento GPS" />
</svelte:head>

<!-- Video de fondo -->
<video class="background-video" autoplay muted loop playsinline>
	<source src="/vid/map-back.mp4" type="video/mp4" />
	Tu navegador no soporta videos.
</video>

<!-- Markers sobrepuestos -->
{#each markers as marker}
	<img 
		src={marker.src} 
		alt="GPS Marker" 
		class="overlay-marker"
		style="
			left: {marker.left}%; 
			top: {marker.top}%; 
			opacity: {marker.opacity};
		"
		draggable="false"
		on:contextmenu|preventDefault
	/>
{/each}

<!-- Overlay de login -->
<div class="login-overlay">
	<h1>Bienvenido</h1>
	<!-- Formulario de login -->
</div>
  