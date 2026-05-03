<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { authStore, isAuthenticated, currentUser } from '$lib/stores/authStore.js';
	import { toastStore } from '$lib/stores/toastStore.js';
	import AccountMenu from './AccountMenu.svelte';

	let isMenuOpen = false;
	let switchRef;
	let buttonRef;
	let isMobile = browser && typeof window !== 'undefined' && window.innerWidth <= 1024;

	function portalToBody(node) {
		if (typeof document === 'undefined') return {};
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	let menuTop = 0;
	let menuRight = 0;

	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth <= 1024;
		};
		checkMobile();
		window.addEventListener('resize', () => {
			checkMobile();
			if (isMenuOpen && !isMobile) calcMenuPosition();
		});

		function handleClickOutside(event) {
			if (event.target?.closest?.('.account-switch-overlay-root')) {
				return;
			}
			if (switchRef && !switchRef.contains(event.target)) {
				closeMenu();
			}
		}

		const handleKeydown = (e) => {
			if (e.key === 'Escape') closeMenu();
		};

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function calcMenuPosition() {
		if (!buttonRef) return;
		const rect = buttonRef.getBoundingClientRect();
		menuTop = rect.bottom + 10;
		menuRight = window.innerWidth - rect.right;
	}

	function toggleMenu() {
		if (isMenuOpen) {
			closeMenu();
			return;
		}
		if (!isMobile) calcMenuPosition();
		isMenuOpen = true;
		if (isMobile && typeof document !== 'undefined') {
			document.body.style.overflow = 'hidden';
		}
	}

	function closeMenu() {
		isMenuOpen = false;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	async function handleLogout() {
		try {
			closeMenu();
			await authStore.logout();
			toastStore.success('Sesión cerrada correctamente');
		} catch {
			toastStore.error('Error al cerrar sesión');
		}
	}

	function goToProfile() {
		closeMenu();
		goto('/profile');
	}
	function goToControlPanel() {
		closeMenu();
		goto('/control-panel');
	}
	function goToLogin() {
		closeMenu();
		goto('/auth');
	}
	function goToRegister() {
		closeMenu();
		goto('/auth?mode=register');
	}

	$: tooltipText = $isAuthenticated ? 'Mi cuenta' : 'Iniciar sesión';
</script>

<!-- Wrapper solo para detectar clicks afuera -->
<div class="account-switch-wrap" bind:this={switchRef}>
	<button
		class="account-switch"
		class:authenticated={$isAuthenticated}
		class:unauthenticated={!$isAuthenticated}
		class:menu-active={isMenuOpen}
		bind:this={buttonRef}
		on:click={toggleMenu}
		aria-label={tooltipText}
		aria-expanded={isMenuOpen}
	>
		<svg class="user-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
			/>
		</svg>
	</button>
</div>

<!-- Overlay al body: fixed respecto al viewport, sin recorte por el nav o aside -->
{#if isMenuOpen}
	<div class="account-switch-overlay-root" use:portalToBody>
		<div
			class="menu-backdrop"
			class:is-mobile={isMobile}
			on:click={closeMenu}
			aria-hidden="true"
		></div>

		<div
			class="account-menu-portal"
			class:is-mobile={isMobile}
			style={!isMobile ? `top:${menuTop}px;right:${menuRight}px;` : ''}
		>
			{#if isMobile}
				<div class="sheet-handle-area" on:click={closeMenu} aria-hidden="true">
					<div class="sheet-handle"></div>
				</div>
			{/if}

			<div class="account-menu-scroll" class:active={isMobile}>
				<AccountMenu
					isAuthenticated={$isAuthenticated}
					user={$currentUser}
					on:logout={handleLogout}
					on:profile={goToProfile}
					on:controlpanel={goToControlPanel}
					on:login={goToLogin}
					on:register={goToRegister}
					on:close={closeMenu}
				/>
			</div>
		</div>
	</div>
{/if}

<style>
	.account-switch-wrap {
		position: relative;
	}

	.account-switch {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		-webkit-tap-highlight-color: transparent;
	}

	.account-switch:hover {
		transform: translateY(-1px);
	}
	.account-switch:active,
	.account-switch.menu-active {
		transform: scale(0.94);
	}

	.account-switch:focus-visible {
		outline: 2px solid rgba(0, 166, 192, 0.6);
		outline-offset: 3px;
	}

	.user-icon {
		width: 18px;
		height: 18px;
		color: #d8d7cc;
	}

	.account-switch.authenticated {
		border-color: var(--color-accent-primary);
		background-color: color-mix(in srgb, var(--color-accent-primary) 10%, transparent);
		box-shadow: 0 0 14px color-mix(in srgb, var(--color-accent-primary) 35%, transparent);
	}

	.account-switch.unauthenticated {
		border-color: #6b7280;
		background-color: #374151;
	}

	.account-switch-overlay-root {
		position: fixed;
		inset: 0;
		z-index: 12000;
		pointer-events: none;
	}

	.account-switch-overlay-root > * {
		pointer-events: auto;
	}

	/* ── Backdrop y panel: absolute dentro del root (evita recortes y fixed anidado raro) ── */
	.menu-backdrop {
		position: absolute;
		inset: 0;
		z-index: 0;
		background: transparent; /* desktop: solo atrapa clicks */
	}

	.menu-backdrop.is-mobile {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		animation: backdropIn 0.22s ease;
	}

	@keyframes backdropIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.account-menu-portal {
		position: absolute;
		z-index: 1;
		pointer-events: auto;
		animation: dropIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes dropIn {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.account-menu-portal.is-mobile {
		right: 0;
		left: 0;
		bottom: 0;
		top: auto;
		/* Móvil: el scroll va en .account-menu-scroll; aquí fijamos altura y flex */
		display: flex;
		flex-direction: column;
		max-height: min(92dvh, 100svh);
		height: auto;
		overflow: hidden;
		padding-bottom: env(safe-area-inset-bottom, 0);
		box-sizing: border-box;
		animation: sheetUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.account-menu-scroll.active {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
		/* Asegurar “Cerrar sesión” y safe area bajo el contenido */
		padding-bottom: max(0px, env(safe-area-inset-bottom, 0px));
	}

	@keyframes sheetUp {
		from {
			transform: translateY(100%);
			opacity: 0.8;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.sheet-handle-area {
		display: flex;
		justify-content: center;
		padding: 10px 0 4px;
		cursor: pointer;
		background: rgba(10, 14, 22, 0.98);
		border-radius: 20px 20px 0 0;
	}

	.sheet-handle {
		width: 40px;
		height: 4px;
		background: rgba(255, 255, 255, 0.18);
		border-radius: 2px;
	}
</style>
