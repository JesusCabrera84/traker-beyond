<script>
	import { createEventDispatcher } from 'svelte';

	export let isAuthenticated = false;
	export let user = null;

	const dispatch = createEventDispatcher();

	function handleLogin() {
		dispatch('close');
		dispatch('login');
	}

	function handleRegister() {
		dispatch('close');
		dispatch('register');
	}

	function handleProfile() {
		dispatch('close');
		dispatch('profile');
	}

	function handleControlPanel() {
		dispatch('close');
		dispatch('controlpanel');
	}

	function handleLogout() {
		dispatch('logout');
	}
</script>

<div class="account-menu-container">
	{#if isAuthenticated}
		<!-- Estado 2: Usuario con sesión activa -->
		<div
			class="authenticated-menu bg-gray-800/80 backdrop-blur-md shadow-lg border
					rounded-xl overflow-hidden min-w-56 animate-in slide-in-from-top-2 duration-150"
		>
			<!-- Header del usuario -->
			<div class="user-header p-3 border-b border-gray-700/40">
				<div class="flex items-center gap-3">
					<div class="user-info flex-1 min-w-0">
						<p class="user-name text-white font-medium text-sm truncate text-center">
							{user?.full_name || 'Usuario'}
						</p>
					</div>
				</div>
			</div>

			<!-- Opciones del menú autenticado: alineadas a la izquierda -->
			<div class="menu-options menu-options-auth py-2 flex flex-col gap-2 items-stretch">
				<button
					type="button"
					class="menu-item menu-item-centered w-full text-left text-white hover:bg-gray-700/50
						   transition-[background-color,box-shadow] duration-200 flex items-center justify-start
						   text-sm group rounded-xl"
					on:click={handleProfile}
				>
					<span class="menu-item-row flex w-full min-w-0 items-center justify-start gap-4">
						<svg
							class="menu-item-icon w-4.5 h-4.5 shrink-0 text-gray-400 group-hover:text-white transition-colors"
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
						<span>Mi perfil</span>
					</span>
				</button>

				<button
					type="button"
					class="menu-item menu-item-centered w-full text-left text-white hover:bg-gray-700/50
						   transition-[background-color,box-shadow] duration-200 flex items-center justify-start
						   text-sm group rounded-xl"
					on:click={handleControlPanel}
				>
					<span class="menu-item-row flex w-full min-w-0 items-center justify-start gap-4">
						<svg
							class="menu-item-icon w-4.5 h-4.5 shrink-0 text-gray-400 group-hover:text-white transition-colors"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
							/>
						</svg>
						<span>Panel de control</span>
					</span>
				</button>

				<hr class="menu-separator border-gray-700/40 w-full shrink-0" />

				<button
					type="button"
					class="menu-item menu-item-centered menu-item-danger w-full text-left text-red-300
						   hover:bg-red-500/15 hover:text-red-200
						   transition-[background-color,box-shadow] duration-200 flex items-center justify-start
						   text-sm group rounded-xl"
					on:click={handleLogout}
				>
					<span class="menu-item-row flex w-full min-w-0 items-center justify-start gap-4">
						<svg
							class="menu-item-icon w-4.5 h-4.5 shrink-0 group-hover:text-red-200 transition-colors"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						<span>Cerrar sesión</span>
					</span>
				</button>
			</div>
		</div>
	{:else}
		<!-- Estado 1: Usuario sin sesión -->
		<div
			class="unauthenticated-menu bg-gray-800/80 backdrop-blur-md
					rounded-xl overflow-hidden min-w-60 w-max max-w-[min(100vw-2rem,20rem)]
					animate-in slide-in-from-top-2 duration-150"
		>
			<!-- Opciones del menú no autenticado -->
			<div class="menu-options menu-options-guest py-2 flex flex-col gap-2 items-stretch">
				<button
					type="button"
					class="menu-item menu-item-centered w-full text-left text-white hover:bg-gray-700/50
						   transition-[background-color,box-shadow] duration-200 flex items-center justify-start
						   text-sm group rounded-xl"
					on:click={handleLogin}
				>
					<span class="menu-item-row flex w-full min-w-0 items-center justify-start gap-4">
						<svg
							class="menu-item-icon w-4.5 h-4.5 shrink-0 text-gray-400 group-hover:text-white transition-colors"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							/>
						</svg>
						<span>Iniciar sesión</span>
					</span>
				</button>

				<button
					type="button"
					class="menu-item menu-item-centered w-full text-left text-white hover:bg-gray-700/50
						   transition-[background-color,box-shadow] duration-200 flex items-center justify-start
						   text-sm group rounded-xl"
					on:click={handleRegister}
				>
					<span class="menu-item-row flex w-full min-w-0 items-center justify-start gap-4">
						<svg
							class="menu-item-icon w-4.5 h-4.5 shrink-0 text-gray-400 group-hover:text-white transition-colors"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
							/>
						</svg>
						<span>Crear cuenta</span>
					</span>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.authenticated-menu {
		box-shadow:
			0 0 0 2px rgba(0, 168, 120, 0.4),
			0 0 0 4px rgba(255, 255, 255, 0.1);
		padding: 0.625rem;
	}

	.unauthenticated-menu {
		/* Mismo lenguaje que el menú con sesión: doble aro + ligero halo cian/verde marca */
		padding: 0.625rem;
		box-shadow:
			0 0 0 2px rgba(0, 168, 120, 0.45),
			0 0 0 4px rgba(255, 255, 255, 0.1),
			0 0 24px rgba(0, 166, 192, 0.18),
			0 12px 32px rgba(0, 0, 0, 0.35);
	}

	/* Padding generoso; hover mantiene el mismo box (sin salto) pero refuerza fondo y sombra */
	.menu-item-centered {
		padding: 0.75rem 1.125rem;
	}

	.menu-item-centered:hover {
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
	}

	.menu-item-danger:hover {
		box-shadow: inset 0 0 0 1px rgba(252, 165, 165, 0.15);
	}

	.account-menu-container {
		/* Animación de entrada suave con escala y opacidad */
		animation: menuSlideIn 0.15s ease-out;
	}

	.menu-separator {
		margin: 0.125rem 0;
	}

	@keyframes menuSlideIn {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.unauthenticated-menu {
			min-width: 15rem;
		}

		.authenticated-menu {
			min-width: 13.5rem;
		}
	}
</style>
