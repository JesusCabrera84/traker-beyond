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
		<div class="authenticated-menu">
			<!-- Header del usuario -->
			<div class="user-header">
				<div class="user-avatar-wrap">
					<div class="user-avatar-circle">
						{#if user?.full_name}
							{user.full_name.charAt(0).toUpperCase()}
						{:else}
							U
						{/if}
					</div>
					<div class="user-avatar-status"></div>
				</div>
				<div class="user-info">
					<p class="user-name">{user?.full_name || 'Usuario'}</p>
					<p class="user-email">{user?.email || ''}</p>
				</div>
			</div>

			<!-- Separador -->
			<div class="menu-sep"></div>

			<!-- Opciones -->
			<div class="menu-options">
				<button type="button" class="menu-item" on:click={handleProfile}>
					<span class="menu-item-icon">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
					</span>
					<span class="menu-item-label">Mi perfil</span>
					<svg
						class="menu-item-chevron"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						width="14"
						height="14"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>

				<button type="button" class="menu-item" on:click={handleControlPanel}>
					<span class="menu-item-icon">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
							/>
						</svg>
					</span>
					<span class="menu-item-label">Panel de control</span>
					<svg
						class="menu-item-chevron"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						width="14"
						height="14"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>

				<div class="menu-divider"></div>

				<button type="button" class="menu-item menu-item--danger" on:click={handleLogout}>
					<span class="menu-item-icon menu-item-icon--danger">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</span>
					<span class="menu-item-label">Cerrar sesión</span>
				</button>
			</div>
		</div>
	{:else}
		<!-- Estado: sin sesión -->
		<div class="unauthenticated-menu">
			<div class="guest-header">
				<div class="guest-icon">
					<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
				</div>
				<div>
					<p class="guest-title">Bienvenido</p>
					<p class="guest-sub">Inicia sesión para acceder a tu cuenta</p>
				</div>
			</div>

			<div class="menu-sep"></div>

			<div class="menu-options">
				<button type="button" class="menu-item menu-item--primary" on:click={handleLogin}>
					<span class="menu-item-icon menu-item-icon--primary">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							/>
						</svg>
					</span>
					<span class="menu-item-label">Iniciar sesión</span>
					<svg
						class="menu-item-chevron"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						width="14"
						height="14"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>

				<button type="button" class="menu-item" on:click={handleRegister}>
					<span class="menu-item-icon">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
							/>
						</svg>
					</span>
					<span class="menu-item-label">Crear cuenta</span>
					<svg
						class="menu-item-chevron"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						width="14"
						height="14"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	/* ── Contenedor base ── */
	.account-menu-container {
		animation: menuIn 0.15s ease;
	}

	@keyframes menuIn {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* ══════════════════════════════════════════
	   MENÚ AUTENTICADO
	══════════════════════════════════════════ */
	.authenticated-menu {
		background: rgba(12, 18, 28, 0.97);
		backdrop-filter: blur(24px);
		border-radius: 16px;
		overflow: hidden;
		min-width: 220px;
		box-shadow:
			0 0 0 1px rgba(0, 168, 120, 0.3),
			0 0 0 2px rgba(255, 255, 255, 0.06),
			0 16px 48px rgba(0, 0, 0, 0.5);
	}

	/* ── Header del usuario ── */
	.user-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
	}

	.user-avatar-wrap {
		position: relative;
		flex-shrink: 0;
	}

	.user-avatar-circle {
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		font-weight: 700;
		color: white;
	}

	.user-avatar-status {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 9px;
		height: 9px;
		background: #22c55e;
		border-radius: 50%;
		border: 2px solid rgba(12, 18, 28, 0.97);
	}

	.user-info {
		min-width: 0;
		flex: 1;
	}

	.user-name {
		font-size: 13px;
		font-weight: 600;
		color: #f1f5f9;
		margin: 0 0 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-email {
		font-size: 11px;
		color: #475569;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ══════════════════════════════════════════
	   MENÚ NO AUTENTICADO
	══════════════════════════════════════════ */
	.unauthenticated-menu {
		background: rgba(12, 18, 28, 0.97);
		backdrop-filter: blur(24px);
		border-radius: 16px;
		overflow: hidden;
		min-width: 230px;
		box-shadow:
			0 0 0 1px rgba(0, 168, 120, 0.3),
			0 0 0 2px rgba(255, 255, 255, 0.06),
			0 16px 48px rgba(0, 0, 0, 0.5),
			0 0 24px rgba(0, 166, 192, 0.12);
	}

	.guest-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
	}

	.guest-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(0, 166, 192, 0.1);
		border: 1px solid rgba(0, 166, 192, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-accent-primary);
		flex-shrink: 0;
	}

	.guest-title {
		font-size: 13px;
		font-weight: 600;
		color: #f1f5f9;
		margin: 0 0 2px;
	}

	.guest-sub {
		font-size: 11px;
		color: #475569;
		margin: 0;
	}

	/* ── Separador ── */
	.menu-sep {
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
		margin: 0 12px;
	}

	/* ── Opciones del menú ── */
	.menu-options {
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 10px;
		color: rgba(203, 213, 225, 0.85);
		background: transparent;
		border: none;
		width: 100%;
		text-align: left;
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		transition: all 0.18s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.menu-item:hover,
	.menu-item:active {
		background: rgba(255, 255, 255, 0.06);
		color: #fff;
	}

	.menu-item--primary:hover,
	.menu-item--primary:active {
		background: rgba(0, 166, 192, 0.1);
		color: var(--color-accent-primary);
	}

	.menu-item--danger {
		color: rgba(252, 165, 165, 0.75);
	}

	.menu-item--danger:hover,
	.menu-item--danger:active {
		background: rgba(239, 68, 68, 0.1);
		color: #fca5a5;
	}

	.menu-item-icon {
		width: 30px;
		height: 30px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.18s ease;
	}

	.menu-item-icon svg {
		width: 15px;
		height: 15px;
	}

	.menu-item-icon--primary {
		background: rgba(0, 166, 192, 0.1);
		color: var(--color-accent-primary);
	}

	.menu-item-icon--danger {
		background: rgba(239, 68, 68, 0.08);
		color: #fca5a5;
	}

	.menu-item-label {
		flex: 1;
	}

	.menu-item-chevron {
		color: rgba(255, 255, 255, 0.2);
		transition: transform 0.18s ease;
		flex-shrink: 0;
	}

	.menu-item:hover .menu-item-chevron {
		transform: translateX(3px);
		color: rgba(255, 255, 255, 0.5);
	}

	.menu-divider {
		height: 1px;
		background: rgba(255, 255, 255, 0.05);
		margin: 3px 4px;
	}

	/* ══════════════════════════════════════════
	   MÓVIL / TABLET (≤1024px) — BOTTOM SHEET
	══════════════════════════════════════════ */
	@media (max-width: 1024px) {
		.account-menu-container {
			animation: none; /* la animación la maneja AccountSwitch */
		}

		.authenticated-menu,
		.unauthenticated-menu {
			border-radius: 0;
			min-width: unset;
			width: 100%;
			/* Borde superior redondeado — el handle lo da AccountSwitch */
			box-shadow: none;
		}

		/* Más espacio de toque en móvil */
		.menu-item {
			padding: 13px 14px;
			font-size: 14px;
		}

		.menu-item-icon {
			width: 36px;
			height: 36px;
		}

		.menu-item-icon svg {
			width: 17px;
			height: 17px;
		}

		.user-header,
		.guest-header {
			padding: 16px 18px 14px;
		}

		.user-avatar-circle {
			width: 44px;
			height: 44px;
			font-size: 1rem;
		}

		.user-name {
			font-size: 14px;
		}

		.user-email {
			font-size: 12px;
		}

		.guest-icon {
			width: 44px;
			height: 44px;
		}

		.guest-title {
			font-size: 14px;
		}

		.guest-sub {
			font-size: 12px;
		}

		.menu-options {
			padding: 8px;
			/* Safe area para dispositivos con notch */
			padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));
		}
	}
</style>
