<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	// Variables para el formulario
	let email = '';
	let password = '';

	// Variables para los círculos animados
	let circles = [];

	onMount(() => {
		// Verificar si ya está logueado
		if (browser && localStorage.getItem('isLoggedIn') === 'true') {
			goto('/tracking');
			return;
		}

		// Iniciar generación de círculos
		startCircleGeneration();
	});

	function handleLogin() {
		// Simulación de login exitoso
		if (browser) {
			localStorage.setItem('isLoggedIn', 'true');
			goto('/tracking');
		}
	}

	function handleSocialLogin(provider) {
		console.log(`Iniciando sesión con ${provider}`);
		// Aquí iría la lógica real de autenticación con redes sociales
		// Por ahora, simulamos un login exitoso
		if (browser) {
			localStorage.setItem('isLoggedIn', 'true');
			localStorage.setItem('loginProvider', provider);
			goto('/tracking');
		}
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}

	function startCircleGeneration() {
		const generateGroup = () => {
			const groupSize = Math.floor(Math.random() * 6) + 3; // 3-8 círculos
			
			for (let i = 0; i < groupSize; i++) {
				setTimeout(() => {
					const circle = createRandomCircle();
					circles = [...circles, circle];
					
					// Remover el círculo después de 8 segundos
					setTimeout(() => {
						circles = circles.filter(c => c.id !== circle.id);
					}, 8000);
				}, i * 200); // Delay escalonado
			}
		};

		// Generar primer grupo inmediatamente
		generateGroup();
		
		// Generar grupos cada 3-6 segundos
		setInterval(generateGroup, Math.random() * 3000 + 3000);
	}

	function createRandomCircle() {
		const colors = [
			'radial-gradient(circle, transparent 0%, transparent 30%, rgba(255, 107, 107, 0.8) 100%)',
			'radial-gradient(circle, transparent 0%, transparent 30%, rgba(107, 255, 107, 0.8) 100%)',
			'radial-gradient(circle, transparent 0%, transparent 30%, rgba(107, 107, 255, 0.8) 100%)',
			'radial-gradient(circle, transparent 0%, transparent 30%, rgba(255, 255, 107, 0.8) 100%)',
			'radial-gradient(circle, transparent 0%, transparent 30%, rgba(255, 107, 255, 0.8) 100%)',
			'radial-gradient(circle, transparent 0%, transparent 30%, rgba(107, 255, 255, 0.8) 100%)'
		];

		return {
			id: Date.now() + Math.random(),
			left: Math.random() * 90 + 5, // 5% a 95%
			top: Math.random() * 90 + 5,  // 5% a 95%
			size: Math.random() * 90 + 10, // 10px a 100px
			color: colors[Math.floor(Math.random() * colors.length)]
		};
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

<!-- Overlay con degradado -->
<div class="gradient-overlay"></div>

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
	<!-- Formulario de login -->
	<form on:submit|preventDefault={handleLogin} class="login-form">
		<div class="form-group">
			<input 
				type="email" 
				id="email" 
				bind:value={email} 
				placeholder="tu@email.com"
				required
				class="form-input"
			/>
		</div>
		
		<div class="form-group">
			<input 
				type="password" 
				id="password" 
				bind:value={password} 
				placeholder="••••••••"
				required
				class="form-input"
			/>
		</div>
		
		<button type="submit" class="login-button">
			Iniciar Sesión
		</button>
	</form>
	
	<!-- Separador -->
	<div class="separator">
	</div>
	
	<!-- Botones de redes sociales -->
	<div class="social-buttons">
		<button class="social-button google-button" on:click={() => handleSocialLogin('google')}>
			<svg class="social-icon" viewBox="0 0 24 24">
				<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
				<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
				<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
				<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
			</svg>
			
		</button>
		
		<button class="social-button facebook-button" on:click={() => handleSocialLogin('facebook')}>
			<svg class="social-icon" viewBox="0 0 24 24">
				<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
			</svg>

		</button>
		
		<button class="social-button twitter-button" on:click={() => handleSocialLogin('twitter')}>
			<svg class="social-icon" viewBox="0 0 24 24">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000000"/>
			</svg>

		</button>
	</div>
	
	<!-- Enlaces adicionales -->
	<div class="login-links">
		<a href="#" class="link">¿Olvidaste tu contraseña?</a>
		<a href="#" class="link">Crear cuenta</a>
	</div>
</div>
  