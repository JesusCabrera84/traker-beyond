<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isAuthenticated, currentUser } from '$lib/stores/authStore.js';
	import { toastStore } from '$lib/stores/toastStore.js';
	import AccountMenu from './AccountMenu.svelte';

	// Estado del componente
	let isMenuOpen = false;
	let switchRef;

	// Cerrar menú al hacer clic fuera
	onMount(() => {
		function handleClickOutside(event) {
			if (switchRef && !switchRef.contains(event.target)) {
				isMenuOpen = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	async function handleLogout() {
		try {
			// Cerrar menú inmediatamente para mejor UX
			isMenuOpen = false;

			// Ejecutar logout que limpia tokens automáticamente
			await authStore.logout();

			// Mostrar confirmación
			toastStore.success('Sesión cerrada correctamente');
		} catch {
			toastStore.error('Error al cerrar sesión');
		}
	}

	function goToProfile() {
		isMenuOpen = false;
		goto('/profile');
	}

	function goToControlPanel() {
		isMenuOpen = false;
		goto('/control-panel');
	}

	function goToLogin() {
		isMenuOpen = false;
		goto('/auth');
	}

	function goToRegister() {
		isMenuOpen = false;
		goto('/auth?mode=register');
	}

	// Estado reactivo para el tooltip
	$: tooltipText = $isAuthenticated ? 'Mi cuenta' : 'Iniciar sesión';
</script>

<div class="relative" bind:this={switchRef}>
	<!-- Switch principal -->
	<button
		class="account-switch relative flex h-10 w-10 items-center justify-center
			   rounded-full border-2 shadow-md transition-all duration-300
			   ease-in-out hover:shadow-lg"
		class:authenticated={$isAuthenticated}
		class:unauthenticated={!$isAuthenticated}
		on:click={toggleMenu}
		aria-label={tooltipText}
	>
		<!-- Ícono de usuario centrado -->
		<div class="relative flex items-center justify-center">
			<!-- Ícono siempre centrado con color forzado -->
			<svg
				class="user-icon relative z-10 h-5 w-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
				/>
			</svg>
		</div>
	</button>

	<!-- Menú desplegable -->
	{#if isMenuOpen}
		<div class="account-menu">
			<AccountMenu
				isAuthenticated={$isAuthenticated}
				user={$currentUser}
				on:logout={handleLogout}
				on:profile={goToProfile}
				on:controlpanel={goToControlPanel}
				on:login={goToLogin}
				on:register={goToRegister}
				on:close={() => (isMenuOpen = false)}
			/>
		</div>
	{/if}
</div>

<style>
	.account-switch {
		/* Transiciones suaves para todos los estados */
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		color: var(--color-text-primary);
	}

	.account-switch:hover {
		transform: translateY(-1px);
	}

	.account-switch:active {
		transform: translateY(0);
	}

	.account-switch:focus {
		outline: none;
		box-shadow:
			0 0 0 2px rgba(0, 168, 120, 0.4),
			0 0 0 4px rgba(255, 255, 255, 0.1);
	}

	/* Forzar color del ícono de usuario */
	.user-icon {
		color: #d8d7cc !important; /* light-cream */
		stroke: #d8d7cc !important;
	}

	/* Estados del switch usando variables CSS del tema */
	.account-switch.authenticated {
		border-color: var(--color-accent-primary);
		background-color: color-mix(in srgb, var(--color-accent-primary) 10%, transparent);
		box-shadow: 0 0 20px color-mix(in srgb, var(--color-accent-primary) 40%, transparent);
	}

	.account-switch.unauthenticated {
		border-color: #6b7280; /* gray-500 */
		background-color: #374151; /* gray-700 */
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translate(-50%, -8px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0) scale(1);
		}
	}

	/* Evitar que el menú expanda el navbar */
	.account-menu {
		position: absolute;
		right: 0;
		top: 100%;
		margin-top: 0.75rem;
		z-index: 50;
		/* Esta es la clave: el menú no debe afectar el layout del padre */
		pointer-events: auto;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.account-switch {
			width: 2.25rem; /* w-9 */
			height: 2.25rem; /* h-9 */
		}
	}
</style>
