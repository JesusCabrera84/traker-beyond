<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/authStore.js';
	import { organizationService } from '$lib/services/organizationService.js';
	import { formatDateLocal } from '$lib/utils/datetime.js';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let organizations = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		if (!$isAuthenticated) {
			goto('/auth');
			return;
		}

		try {
			organizations = await organizationService.getOrganizations();
		} catch (err) {
			console.error('Error fetching organizations:', err);
			error = 'No se pudieron cargar las organizaciones. Por favor, intenta de nuevo más tarde.';
		} finally {
			loading = false;
		}
	});

	function formatDate(dateString) {
		return formatDateLocal(dateString);
	}
</script>

<svelte:head>
	<title>Organizaciones - Geminis Labs</title>
</svelte:head>

<Navbar />
<Sidebar />

<main class="control-panel-main">
	<div class="control-panel-content">
		<header class="page-header">
			<div class="header-info">
				<h1>Organizaciones</h1>
				<p>Gestiona y visualiza todas tus organizaciones registradas</p>
			</div>
			<div class="header-actions">
				<button class="btn-primary" disabled>
					<span>+</span> Nueva Organización
				</button>
			</div>
		</header>

		{#if loading}
			<div class="loading-container">
				<div class="spinner"></div>
				<p>Cargando organizaciones...</p>
			</div>
		{:else if error}
			<div class="error-container">
				<div class="error-icon">⚠️</div>
				<p>{error}</p>
				<button class="btn-secondary" on:click={() => window.location.reload()}>Reintentar</button>
			</div>
		{:else if organizations.length === 0}
			<div class="empty-container">
				<div class="empty-icon">🏢</div>
				<h3>No hay organizaciones</h3>
				<p>Aún no tienes ninguna organización vinculada a tu cuenta.</p>
			</div>
		{:else}
			<div class="org-grid">
				{#each organizations as org (org.id)}
					<div class="org-card">
						<div class="org-header">
							<div class="org-avatar">
								{org.name.charAt(0).toUpperCase()}
							</div>
							<div class="org-title-group">
								<h3>{org.name}</h3>
								<span class="status-badge" class:active={org.status === 'ACTIVE'}>
									{org.status === 'ACTIVE' ? 'Activa' : org.status}
								</span>
							</div>
						</div>

						<div class="org-details">
							<div class="detail-item">
								<span class="label">ID</span>
								<span class="value truncated" title={org.id}>{org.id}</span>
							</div>
							<div class="detail-item">
								<span class="label">Email de Facturación</span>
								<span class="value">{org.billing_email || 'No especificado'}</span>
							</div>
							<div class="detail-item">
								<span class="label">País</span>
								<span class="value">{org.country || 'N/A'}</span>
							</div>
							<div class="detail-item">
								<span class="label">Zona Horaria</span>
								<span class="value">{org.timezone || 'N/A'}</span>
							</div>
							<div class="detail-item">
								<span class="label">Creado el</span>
								<span class="value">{formatDate(org.created_at)}</span>
							</div>
						</div>

						<div class="org-footer">
							<button
								class="btn-outline"
								on:click={() => goto(`/control-panel/organization/${org.id}`)}>Editar</button
							>
							<button class="btn-text">Ver Nexus</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>

<style>
	/* Heredar estilos base del panel de control */
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
		padding-top: calc(70px + 2rem);
		margin-left: 260px;
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

	/* Header */
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 3rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		padding-bottom: 1.5rem;
	}

	.header-info h1 {
		color: #f1f5f9;
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		font-weight: 700;
	}

	.header-info p {
		color: #94a3b8;
		margin: 0;
		font-size: 1.1rem;
	}

	/* Grid */
	.org-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
		gap: 2rem;
	}

	/* Card */
	.org-card {
		background: rgba(30, 41, 59, 0.4);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		transition: all 0.3s ease;
	}

	.org-card:hover {
		transform: translateY(-5px);
		border-color: rgba(99, 102, 241, 0.3);
		box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
		background: rgba(30, 41, 59, 0.6);
	}

	.org-header {
		display: flex;
		gap: 1.25rem;
		margin-bottom: 2rem;
		align-items: center;
	}

	.org-avatar {
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, #6366f1, #a855f7);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
	}

	.org-title-group h3 {
		margin: 0 0 0.35rem 0;
		color: #f1f5f9;
		font-size: 1.25rem;
	}

	.status-badge {
		font-size: 0.75rem;
		padding: 0.2rem 0.6rem;
		border-radius: 20px;
		background: rgba(239, 68, 68, 0.1);
		color: #f87171;
		font-weight: 600;
		text-transform: uppercase;
	}

	.status-badge.active {
		background: rgba(34, 197, 94, 0.1);
		color: #4ade80;
	}

	.org-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
		flex: 1;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.detail-item .label {
		font-size: 0.75rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.detail-item .value {
		color: #cbd5e1;
		font-size: 0.95rem;
	}

	.value.truncated {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.org-footer {
		display: flex;
		gap: 1rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	/* Buttons */
	.btn-primary {
		background: linear-gradient(90deg, #6366f1, #a855f7);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
		transform: scale(1.02);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #cbd5e1;
		padding: 0.5rem 1rem;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-outline:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.btn-text {
		background: transparent;
		border: none;
		color: #818cf8;
		font-weight: 600;
		cursor: pointer;
		padding: 0.5rem;
	}

	.btn-text:hover {
		color: #a5b4fc;
	}

	/* Status states */
	.loading-container,
	.empty-container,
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 5rem 2rem;
		background: rgba(30, 41, 59, 0.3);
		border-radius: 20px;
		border: 1px dashed rgba(255, 255, 255, 0.1);
		text-align: center;
		color: #cbd5e1;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(99, 102, 241, 0.2);
		border-top-color: #6366f1;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1.5rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty-icon,
	.error-icon {
		font-size: 3rem;
		margin-bottom: 1.5rem;
		opacity: 0.5;
	}

	@media (max-width: 1024px) {
		.control-panel-main {
			margin-left: 220px;
		}
	}

	@media (max-width: 768px) {
		.control-panel-main {
			padding: 1rem;
			margin-left: 0;
		}

		.org-grid {
			grid-template-columns: 1fr;
		}

		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.5rem;
		}
	}
</style>
