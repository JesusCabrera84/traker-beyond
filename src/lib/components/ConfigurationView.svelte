<script>
	import { onMount } from 'svelte';
	import { userService } from '$lib/services/userService.js';
	import BillingSnapshot from '$lib/components/BillingSnapshot.svelte';

	export let user = null;
	export let users = [];
	export let loading = false;
	export let error = null;
	export let isMaster = false;

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	// Formatear fecha de último acceso
	function formatLastLogin(lastLoginAt) {
		return userService.formatLastLogin(lastLoginAt);
	}

	// Obtener rol del usuario
	function getUserRole(isMaster) {
		return userService.getUserRole(isMaster);
	}

	// Obtener iniciales del usuario para el avatar
	function getUserInitials(user) {
		if (!user?.full_name) return 'U';
		const names = user.full_name.split(' ');
		if (names.length >= 2) {
			return (names[0][0] + names[names.length - 1][0]).toUpperCase();
		}
		return user.full_name[0].toUpperCase();
	}
</script>

<!-- Vista Configuración rediseñada -->
<div class="config-view {mounted ? 'animate-in' : 'opacity-0'}">
	{#if loading}
		<!-- Loading state -->
		<div class="loading-state">
			<div class="loading-header">
				<div class="loading-title"></div>
				<div class="loading-subtitle"></div>
			</div>
			<div class="loading-cards">
				{#each Array(3) as _, i (i)}
					<div class="loading-card">
						<div class="loading-card-header"></div>
						<div class="loading-card-content">
							{#each Array(3) as _, j (j)}
								<div class="loading-line"></div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="error-state">
			<div class="error-card">
				<div class="error-icon">
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>
				<h3 class="error-title">Error al cargar la configuración</h3>
				<p class="error-message">{error}</p>
			</div>
		</div>
	{:else}
		<!-- Encabezado de configuración -->
		<div class="config-header">
			<h1 class="config-title">
				<span class="title-accent">Configuración</span>
			</h1>
			{#if isMaster}
				<p class="config-subtitle">
					Como administrador principal, puedes gestionar la configuración de tu cuenta y usuarios
					asociados
				</p>
			{:else}
				<p class="config-subtitle">
					Esta cuenta pertenece a un administrador principal. Solo el administrador puede gestionar
					la configuración
				</p>
			{/if}
		</div>

		{#if !isMaster}
			<!-- Mensaje para usuarios no maestro -->
			<div class="restricted-access">
				<div class="restricted-card">
					<div class="restricted-icon">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
					<h3 class="restricted-title">Acceso restringido</h3>
					<p class="restricted-message">
						Esta cuenta pertenece a un administrador principal. Solo el administrador puede
						gestionar la configuración de la cuenta.
					</p>
				</div>
			</div>
		{:else}
			<!-- Tarjetas de configuración para usuarios maestro -->
			<div class="config-cards">
				<!-- Información general de la cuenta -->
				<div class="config-card account-info">
					<div class="card-header">
						<div class="card-icon">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2"
								/>
							</svg>
						</div>
						<div class="card-title-section">
							<h3 class="card-title">Información general de la cuenta</h3>
							<p class="card-description">Datos principales y estado de tu cuenta</p>
						</div>
					</div>

					{#if user}
						<div class="card-content">
							<div class="info-grid">
								<div class="info-item">
									<div class="info-label">Administrador principal</div>
									<div class="info-value">
										<p class="info-text">{user.full_name || user.email}</p>
										<span class="info-email">{user.email}</span>
									</div>
								</div>

								<div class="info-item">
									<div class="info-label">Estado de la cuenta</div>
									<div class="info-value">
										<div class="status-badge active">
											<div class="status-indicator"></div>
											<span class="status-text">Activa</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Usuarios vinculados -->
				<div class="config-card users-section">
					<div class="card-header">
						<div class="card-icon">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
								/>
							</svg>
						</div>
						<div class="card-title-section">
							<h3 class="card-title">Usuarios vinculados</h3>
							<p class="card-description">Gestiona los usuarios asociados a tu cuenta</p>
						</div>
						<div class="card-actions">
							<button class="invite-btn" disabled title="Próximamente disponible">
								<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
								<span>Invitar usuario</span>
							</button>
						</div>
					</div>

					<div class="card-content">
						{#if users && users.length > 0}
							<div class="users-list">
								{#each users as associatedUser (associatedUser.id || associatedUser.email)}
									<div class="user-item">
										<div class="user-avatar">
											<span class="user-initials">{getUserInitials(associatedUser)}</span>
										</div>
										<div class="user-info">
											<h4 class="user-name">{associatedUser.full_name || 'Sin nombre'}</h4>
											<p class="user-email">{associatedUser.email}</p>
										</div>
										<div class="user-meta">
											<div class="user-role {associatedUser.is_master ? 'master' : 'user'}">
												{getUserRole(associatedUser.is_master)}
											</div>
											<div class="user-last-login">
												<svg
													class="login-icon"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
												<span>{formatLastLogin(associatedUser.last_login_at)}</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="empty-users">
								<div class="empty-icon">
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
										/>
									</svg>
								</div>
								<h4 class="empty-title">No hay usuarios asociados todavía</h4>
								<p class="empty-description">
									Próximamente podrás invitar usuarios para que accedan a tu cuenta
								</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Métodos de pago -->
				<div class="config-card payment-section">
					<div class="card-header">
						<div class="card-icon">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
								/>
							</svg>
						</div>
						<div class="card-title-section">
							<h3 class="card-title">Métodos de pago</h3>
							<p class="card-description">Plan, tarjetas guardadas y facturación</p>
						</div>
						<div class="card-actions">
							<a href="/control-panel/billing/payment-methods" class="invite-btn">
								<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M14 5l7 7m0 0l-7 7m7-7H3"
									/>
								</svg>
								<span>Gestionar</span>
							</a>
						</div>
					</div>

					<div class="card-content">
						<BillingSnapshot />
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* ===================================================================
	   CONTENEDOR PRINCIPAL
	   ================================================================== */
	.config-view {
		transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.config-view.animate-in {
		animation: configViewFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes configViewFadeIn {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ===================================================================
	   ENCABEZADO DE CONFIGURACIÓN
	   ================================================================== */
	.config-header {
		text-align: center;
		margin-bottom: 2.5rem;
		padding: 1.5rem 0;
	}

	.config-title {
		font-size: 2.75rem;
		font-weight: 200;
		color: var(--color-text-primary);
		margin-bottom: 0.75rem;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.title-accent {
		background: linear-gradient(135deg, #00a6c0, #21e68c);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-weight: 400;
		position: relative;
	}

	.title-accent::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, #00a6c0, #21e68c);
		opacity: 0.6;
		border-radius: 1px;
	}

	.config-subtitle {
		font-size: 1.125rem;
		color: var(--color-text-muted);
		font-weight: 300;
		line-height: 1.5;
		margin: 0 auto;
		max-width: 500px;
	}

	/* ===================================================================
	   ACCESO RESTRINGIDO
	   ================================================================== */
	.restricted-access {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 40vh;
	}

	.restricted-card {
		text-align: center;
		padding: 3rem;
		background: rgba(255, 193, 7, 0.08);
		border: 1px solid rgba(255, 193, 7, 0.2);
		border-radius: 24px;
		backdrop-filter: blur(20px);
		max-width: 500px;
		transition: all 0.3s ease;
	}

	.restricted-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(255, 193, 7, 0.15);
	}

	.restricted-icon {
		width: 4rem;
		height: 4rem;
		color: #fbbf24;
		margin: 0 auto 1.5rem;
	}

	.restricted-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #fbbf24;
		margin-bottom: 1rem;
	}

	.restricted-message {
		color: #fde68a;
		line-height: 1.6;
		margin: 0;
	}

	/* ===================================================================
	   TARJETAS DE CONFIGURACIÓN
	   ================================================================== */
	.config-cards {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.config-card {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 24px;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.config-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(0, 166, 192, 0.4),
			rgba(33, 230, 140, 0.4),
			transparent
		);
	}

	.config-card:hover {
		transform: translateY(-8px);
		box-shadow:
			0 25px 60px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 0 0 1px rgba(0, 166, 192, 0.1);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 2.5rem 3rem 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.card-icon {
		width: 3rem;
		height: 3rem;
		color: #00a6c0;
		flex-shrink: 0;
	}

	.card-title-section {
		flex: 1;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.card-description {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.card-actions {
		flex-shrink: 0;
	}

	.card-content {
		padding: 1.5rem 2rem 2rem;
	}

	/* ===================================================================
	   INFORMACIÓN DE LA CUENTA
	   ================================================================== */
	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}

	.info-item {
		position: relative;
	}

	.info-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.75rem;
	}

	.info-value {
		padding: 1.25rem 1.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 16px;
		transition: all 0.3s ease;
	}

	.info-value:hover {
		background: rgba(255, 255, 255, 0.04);
		border-color: rgba(0, 166, 192, 0.2);
		transform: translateY(-2px);
	}

	.info-text {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 0.25rem 0;
	}

	.info-email {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	/* ===================================================================
	   BADGE DE ESTADO
	   ================================================================== */
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.25rem;
		border-radius: 12px;
		font-size: 0.875rem;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.status-badge.active {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-accent-secondary) 15%, transparent),
			color-mix(in srgb, var(--color-accent-primary) 15%, transparent)
		);
		color: var(--color-accent-secondary);
		border: 1px solid color-mix(in srgb, var(--color-accent-secondary) 30%, transparent);
	}

	.status-indicator {
		width: 0.75rem;
		height: 0.75rem;
		background: var(--color-accent-secondary);
		border-radius: 50%;
		animation: statusPulse 2s ease-in-out infinite;
	}

	@keyframes statusPulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	.status-text {
		position: relative;
	}

	/* ===================================================================
	   BOTÓN INVITAR
	   ================================================================== */
	.invite-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.5rem;
		background: rgba(0, 166, 192, 0.1);
		border: 1px solid rgba(0, 166, 192, 0.3);
		border-radius: 12px;
		color: #00a6c0;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
	}

	.invite-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.invite-btn:not(:disabled):hover {
		background: rgba(0, 166, 192, 0.15);
		border-color: rgba(0, 166, 192, 0.4);
		transform: translateY(-1px);
	}

	a.invite-btn:hover {
		background: rgba(0, 166, 192, 0.15);
		border-color: rgba(0, 166, 192, 0.4);
		transform: translateY(-1px);
	}

	.btn-icon {
		width: 1rem;
		height: 1rem;
	}

	/* ===================================================================
	   LISTA DE USUARIOS
	   ================================================================== */
	.users-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.user-item {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 20px;
		transition: all 0.3s ease;
	}

	.user-item:hover {
		background: rgba(255, 255, 255, 0.04);
		border-color: rgba(0, 166, 192, 0.2);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 166, 192, 0.1);
	}

	.user-avatar {
		width: 3rem;
		height: 3rem;
		background: linear-gradient(135deg, #00a6c0, #21e68c);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.user-initials {
		font-size: 1rem;
		font-weight: 600;
		color: white;
	}

	.user-info {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 0.25rem 0;
	}

	.user-email {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.user-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
	}

	.user-role {
		padding: 0.375rem 0.75rem;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.user-role.master {
		background: rgba(0, 166, 192, 0.15);
		color: #00a6c0;
		border: 1px solid rgba(0, 166, 192, 0.3);
	}

	.user-role.user {
		background: rgba(156, 163, 175, 0.15);
		color: #9ca3af;
		border: 1px solid rgba(156, 163, 175, 0.3);
	}

	.user-last-login {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.login-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	/* ===================================================================
	   ESTADOS VACÍOS
	   ================================================================== */
	.empty-users {
		text-align: center;
		padding: 3rem 2rem;
	}

	.empty-icon {
		width: 4rem;
		height: 4rem;
		color: var(--color-text-muted);
		margin: 0 auto 1.5rem;
	}

	.empty-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-bottom: 0.75rem;
	}

	.empty-description {
		color: var(--color-text-muted);
		line-height: 1.5;
		margin: 0;
	}

	/* ===================================================================
	   ESTADOS DE CARGA Y ERROR
	   ================================================================== */
	.loading-state {
		text-align: center;
	}

	.loading-header {
		margin-bottom: 4rem;
	}

	.loading-title {
		height: 3rem;
		background: rgba(156, 163, 175, 0.2);
		border-radius: 8px;
		margin: 0 auto 1rem;
		max-width: 300px;
		animation: loadingPulse 2s ease-in-out infinite;
	}

	.loading-subtitle {
		height: 1.5rem;
		background: rgba(156, 163, 175, 0.15);
		border-radius: 6px;
		margin: 0 auto;
		max-width: 500px;
		animation: loadingPulse 2s ease-in-out infinite;
	}

	.loading-cards {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	.loading-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 32px;
		overflow: hidden;
	}

	.loading-card-header {
		height: 5rem;
		background: rgba(156, 163, 175, 0.1);
		animation: loadingPulse 2s ease-in-out infinite;
	}

	.loading-card-content {
		padding: 2rem 3rem 3rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.loading-line {
		height: 2rem;
		background: rgba(156, 163, 175, 0.1);
		border-radius: 8px;
		animation: loadingPulse 2s ease-in-out infinite;
	}

	.loading-line:nth-child(2) {
		animation-delay: 0.2s;
	}

	.loading-line:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes loadingPulse {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.8;
		}
	}

	.error-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.error-card {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 3rem;
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 24px;
		backdrop-filter: blur(20px);
		max-width: 400px;
	}

	.error-icon {
		width: 3rem;
		height: 3rem;
		color: #f87171;
	}

	.error-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #fca5a5;
		margin: 0;
	}

	.error-message {
		color: #fecaca;
		margin: 0;
		line-height: 1.5;
	}

	/* ===================================================================
	   RESPONSIVE DESIGN
	   ================================================================== */
	@media (max-width: 768px) {
		.config-title {
			font-size: 2.5rem;
		}

		.config-cards {
			gap: 2rem;
		}

		.card-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
			padding: 2rem;
		}

		.card-content {
			padding: 1.5rem 2rem 2rem;
		}

		.info-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.user-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.user-meta {
			align-items: flex-start;
			width: 100%;
		}

		.loading-cards {
			gap: 2rem;
		}

		.loading-card-content {
			padding: 1.5rem 2rem 2rem;
		}
	}

	@media (max-width: 480px) {
		.config-header {
			padding: 1rem 0;
			margin-bottom: 2rem;
		}

		.config-title {
			font-size: 2rem;
		}

		.card-header {
			padding: 1.5rem;
		}

		.card-content {
			padding: 1rem 1.5rem 1.5rem;
		}

		.user-item {
			padding: 1rem;
		}

		.restricted-card {
			padding: 2rem;
		}

		.empty-users {
			padding: 2rem 1rem;
		}
	}
</style>
