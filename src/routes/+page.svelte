<script>
	import { onMount } from 'svelte';
	
	// Página de login con video de fondo y markers sobrepuestos
	
	let markers = [];
	let circles = [];
	
	onMount(() => {
		// Crear markers aleatorios
		//createRandomMarkers();
		
		// Iniciar generación de círculos
		startCircleGeneration();
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
	
	function startCircleGeneration() {
		// Generar un grupo de círculos cada 3-6 segundos
		setInterval(() => {
			createRandomCircleGroup();
		}, Math.random() * 3000 + 3000); // Entre 3 y 6 segundos
	}
	
	function createRandomCircleGroup() {
		// Crear entre 3 y 8 círculos
		const numCircles = Math.floor(Math.random() * 6) + 3;
		
		for (let i = 0; i < numCircles; i++) {
			// Pequeño delay entre cada círculo del grupo para efecto escalonado
			setTimeout(() => {
				createRandomCircle();
			}, i * 200); // 200ms entre cada círculo
		}
	}
	
	function createRandomCircle() {
		const circle = {
			id: Date.now() + Math.random(),
			left: Math.random() * 90 + 5, // 5% a 95% del ancho
			top: Math.random() * 90 + 5,  // 5% a 95% del alto
			size: Math.random() * 90 + 10, // 10px a 100px
			color: getRandomColor()
		};
		
		circles = [...circles, circle];
		
		// Remover el círculo después de la animación (8 segundos)
		setTimeout(() => {
			circles = circles.filter(c => c.id !== circle.id);
		}, 8000);
	}
	
	function getRandomColor() {
		const colors = [
			'rgba(255, 107, 107, 0.8)',   // Rojo
			'rgba(107, 255, 107, 0.8)',   // Verde
			'rgba(107, 107, 255, 0.8)',   // Azul
			'rgba(255, 255, 107, 0.8)',   // Amarillo
			'rgba(255, 107, 255, 0.8)',   // Magenta
			'rgba(107, 255, 255, 0.8)'    // Cian
		];
		const selectedColor = colors[Math.floor(Math.random() * colors.length)];
		
		// Crear degradado radial desde transparente hasta el color
		return `radial-gradient(circle, transparent 0%, transparent 30%, ${selectedColor} 100%)`;
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

<!-- Círculos animados -->
{#each circles as circle}
	<div 
		class="animated-circle"
		style="
			left: {circle.left}%; 
			top: {circle.top}%; 
			width: {circle.size}px; 
			height: {circle.size}px;
			background: {circle.color};
		"
	></div>
{/each}

<!-- Overlay de login -->
<div class="login-overlay">
	<h1>Bienvenido</h1>
	<!-- Formulario de login -->
</div>
  