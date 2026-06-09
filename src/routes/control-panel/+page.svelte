<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/authStore.js';
	import { organizationService } from '$lib/services/organizationService.js';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let organizations = [];
	let loading = true;
	let error = null;

	// Verificar autenticación y cargar datos
	onMount(async () => {
		if (!$isAuthenticated) {
			goto('/auth');
			return;
		}

		try {
			organizations = await organizationService.getOrganizations();
		} catch (err) {
			console.error('Error fetching organizations:', err);
			error = 'No se pudieron cargar las organizaciones';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Panel de Control - Geminis Labs</title>
	<meta name="description" content="Panel de control de administración de Geminis Labs" />
</svelte:head>

<!-- Navbar -->
<Navbar />

<!-- Sidebar -->
<Sidebar />

<!-- Contenedor principal -->
<main class="control-panel-main">
	<div class="control-panel-content">
		<!-- Header -->
		<div class="dashboard-header">
			<h1>Panel de Control</h1>
			<p class="welcome-message">Bienvenido a tu panel de administración</p>
		</div>

		<!-- Grid de estadísticas rápidas -->
		<div class="stats-grid">
			<!-- Organizaciones -->
			<button
				class="stat-card"
				on:click={() => goto('/control-panel/organization/info')}
				type="button"
			>
				<div class="stat-icon">🏢</div>
				<div class="stat-info">
					<span class="stat-value">{loading ? '...' : organizations.length}</span>
					<span class="stat-label">Organizaciones</span>
				</div>
			</button>

			<!-- Productos -->
			<div class="stat-card">
				<div class="stat-icon">📦</div>
				<div class="stat-info">
					<span class="stat-value">0</span>
					<span class="stat-label">Productos</span>
				</div>
			</div>

			<!-- Planes -->
			<div class="stat-card">
				<div class="stat-icon">💎</div>
				<div class="stat-info">
					<span class="stat-value">0</span>
					<span class="stat-label">Planes</span>
				</div>
			</div>
		</div>

		<!-- Grid de secciones (Contenido más detallado si es necesario) -->
		<div class="dashboard-grid">
			<!-- Sección de Organizaciones (Preview) -->
			<button
				class="dashboard-card clickable"
				on:click={() => goto('/control-panel/organization/info')}
				type="button"
			>
				<h2 class="card-title">
					<span class="card-icon">🏢</span>
					Mis Organizaciones
				</h2>
				<div class="card-content">
					{#if loading}
						<p class="placeholder-text">Cargando...</p>
					{:else if error}
						<p class="error-text">{error}</p>
					{:else if organizations.length === 0}
						<p class="placeholder-text">No tienes organizaciones registradas.</p>
					{:else}
						<div class="org-preview-list">
							{#each organizations.slice(0, 3) as org (org.id)}
								<div class="org-item">
									<span class="org-name">{org.name}</span>
									<span class="org-status" class:active={org.status === 'ACTIVE'}>
										{org.status === 'ACTIVE' ? 'Activa' : org.status}
									</span>
								</div>
							{/each}
							{#if organizations.length > 3}
								<p class="more-link">Y {organizations.length - 3} más...</p>
							{/if}
						</div>
					{/if}
				</div>
			</button>

			<!-- Próximamente: Más secciones -->
		</div>
	</div>
</main>

<style>
	/* ===================================================================
	   CONTENEDOR PRINCIPAL
	   ================================================================== */
	.control-panel-main {
		min-height: 100vh;
		background: linear-gradient(
			270deg,
			rgba(31, 41, 55, 0.95) 0%,
			rgba(28, 36, 48, 0.95) 50%,
			rgba(24, 31, 42, 0.95) 100%
		);
		background-color: #1c2430;
		padding: 2rem;
		padding-top: calc(70px + 2rem); /* Navbar + original padding */
		margin-left: 260px; /* Espacio para el sidebar */
		transition: margin-left 0.3s ease;
		position: relative;
		box-sizing: border-box;
	}

	.control-panel-main::after {
		content: '';
		position: fixed;
		top: 0;
		left: 260px;
		right: 0;
		bottom: 0;
		background-image: url('/img/noise.webp');
		background-repeat: repeat;
		opacity: 0.03;
		pointer-events: none;
		z-index: 1;
	}

	.control-panel-content {
		max-width: 1400px;
		margin: 0 auto;
		position: relative;
		z-index: 2;
	}

	/* ===================================================================
	   DASHBOARD HEADER
	   ================================================================== */
	.dashboard-header {
		margin-bottom: 2.5rem;
		padding-bottom: 1.5rem;
	}

	.dashboard-header h1 {
		color: rgba(226, 232, 240, 1);
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		font-weight: 700;
		letter-spacing: -0.5px;
	}

	.welcome-message {
		color: rgba(148, 163, 184, 0.9);
		font-size: 1.125rem;
		line-height: 1.6;
		margin: 0;
	}

	/* ===================================================================
	   STATS GRID
	   ================================================================== */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2.5rem;
	}

	.stat-card {
		background: rgba(31, 41, 55, 0.4);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 16px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1.25rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		position: relative;
		overflow: hidden;
		width: 100%;
		text-align: left;
		font-family: inherit;
	}

	.stat-card:hover {
		transform: translateY(-4px);
		background: rgba(31, 41, 55, 0.6);
		border-color: rgba(99, 102, 241, 0.3);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
	}

	.stat-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 4px;
		background: linear-gradient(90deg, #6366f1, #a855f7);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.stat-card:hover::before {
		opacity: 1;
	}

	.stat-icon {
		font-size: 2rem;
		background: rgba(99, 102, 241, 0.1);
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		color: #818cf8;
	}

	.stat-info {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: #f8fafc;
		line-height: 1;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #94a3b8;
		margin-top: 0.25rem;
		font-weight: 500;
	}

	/* ===================================================================
	   DASHBOARD GRID
	   ================================================================== */
	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
		gap: 2rem;
	}

	/* ===================================================================
	   DASHBOARD CARDS
	   ================================================================== */
	.dashboard-card {
		background: rgba(30, 41, 59, 0.4);
		border-radius: 20px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		overflow: hidden;
		transition: all 0.3s ease;
		width: 100%;
		padding: 0;
		text-align: left;
		font-family: inherit;
	}

	.dashboard-card.clickable:hover {
		border-color: rgba(99, 102, 241, 0.2);
		background: rgba(30, 41, 59, 0.6);
		cursor: pointer;
	}

	.card-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem 2rem;
		margin: 0;
		background: rgba(15, 23, 42, 0.4);
		color: rgba(226, 232, 240, 1);
		font-size: 1.25rem;
		font-weight: 600;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.card-icon {
		font-size: 1.5rem;
		filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.3));
	}

	.card-content {
		padding: 2rem;
		min-height: 180px;
	}

	.org-preview-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	.org-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.875rem 1.25rem;
		background: rgba(15, 23, 42, 0.3);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.org-name {
		font-weight: 600;
		color: #e2e8f0;
	}

	.org-status {
		font-size: 0.75rem;
		padding: 0.25rem 0.625rem;
		border-radius: 20px;
		background: rgba(239, 68, 68, 0.1);
		color: #f87171;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.org-status.active {
		background: rgba(34, 197, 94, 0.1);
		color: #4ade80;
	}

	.more-link {
		text-align: center;
		color: #6366f1;
		font-size: 0.875rem;
		font-weight: 600;
		margin-top: 0.5rem;
	}

	.placeholder-text {
		color: #cbd5e1;
		font-size: 0.9375rem;
		font-style: italic;
		margin: 0;
		text-align: center;
		width: 100%;
	}

	.error-text {
		color: #f87171;
		text-align: center;
		width: 100%;
	}

	/* ===================================================================
	   RESPONSIVE
	   ================================================================== */
	@media (max-width: 1024px) {
		.control-panel-main {
			margin-left: 220px;
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.control-panel-main {
			padding: 1rem;
			margin-left: 0;
		}

		.dashboard-header h1 {
			font-size: 2rem;
		}

		.dashboard-grid {
			gap: 1.5rem;
			grid-template-columns: 1fr;
		}

		.card-title {
			padding: 1.25rem 1.5rem;
			font-size: 1.125rem;
		}

		.card-content {
			padding: 1.5rem;
			min-height: 150px;
		}
	}
</style>
