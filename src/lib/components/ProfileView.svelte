<script>
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { userService } from '$lib/services/userService.js';
	import { userStore } from '$lib/stores/userStore.js';
	import { toastStore } from '$lib/stores/toastStore.js';

	// Importar estilos específicos del componente
	import '$lib/styles/profile-view.css';

	export let user = null;
	export let loading = false;
	export let error = null;
	export let users = []; // Usuarios asociados (para master)
	export let isMaster = false; // Si el usuario es master

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

	// Estado del formulario de cambiar contraseña
	let showPasswordForm = false;
	let oldPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let passwordErrors = {};
	let passwordLoading = false;

	let showOldPassword = false;
	let showNewPassword = false;
	let showConfirmPassword = false;

	// Manejar click en cambiar contraseña
	function handleChangePassword() {
		showPasswordForm = !showPasswordForm;
		if (!showPasswordForm) {
			// Limpiar formulario al cerrar
			resetPasswordForm();
		}
	}

	// Resetear formulario
	function resetPasswordForm() {
		oldPassword = '';
		newPassword = '';
		confirmPassword = '';
		passwordErrors = {};
		passwordLoading = false;
		showOldPassword = false;
		showNewPassword = false;
		showConfirmPassword = false;
	}

	// Validar formulario
	function validatePasswordForm() {
		passwordErrors = {};
		if (!oldPassword) {
			passwordErrors.oldPassword = 'La contraseña actual es requerida.';
		}
		if (!newPassword) {
			passwordErrors.newPassword = 'La nueva contraseña es requerida.';
		} else if (newPassword.length < 8) {
			passwordErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres.';
		}
		if (!confirmPassword) {
			passwordErrors.confirmPassword = 'Confirma la nueva contraseña.';
		} else if (newPassword !== confirmPassword) {
			passwordErrors.confirmPassword = 'Las contraseñas no coinciden.';
		}
		return Object.keys(passwordErrors).length === 0;
	}

	// Enviar formulario
	async function handlePasswordSubmit() {
		if (!validatePasswordForm()) {
			return;
		}

		passwordLoading = true;
		passwordErrors = {};

		// Llamar directamente al userStore
		try {
			const result = await userStore.changePassword(oldPassword, newPassword);

			if (result.success) {
				toastStore.add('Contraseña actualizada correctamente', 'success');
				resetPasswordForm();
				showPasswordForm = false;
			} else {
				// Manejar errores específicos del servidor
				if (result.details && result.details.detail) {
					if (Array.isArray(result.details.detail)) {
						result.details.detail.forEach((err) => {
							if (err.loc && err.loc.includes('old_password')) {
								passwordErrors.oldPassword = err.msg || 'La contraseña actual es incorrecta';
							} else if (err.loc && err.loc.includes('new_password')) {
								passwordErrors.newPassword = err.msg || 'La nueva contraseña es inválida';
							}
						});
					} else if (typeof result.details.detail === 'string') {
						passwordErrors.general = result.details.detail;
					}
				} else {
					passwordErrors.general = result.message || 'Error al cambiar la contraseña';
				}
			}
		} catch {
			passwordErrors.general = 'Error inesperado al cambiar la contraseña';
		} finally {
			passwordLoading = false;
		}
	}

	// Estado para la eliminación de cuenta
	let showDeleteModal = false;
	let deleteConfirmationText = '';
	let deleteLoading = false;

	function handleOpenDeleteModal() {
		showDeleteModal = true;
		deleteConfirmationText = '';
	}

	function handleCloseDeleteModal() {
		showDeleteModal = false;
		deleteConfirmationText = '';
	}

	async function handleDeleteAccountSubmit() {
		if (deleteConfirmationText !== user.email) return;

		deleteLoading = true;

		try {
			// Simulamos un retraso para una experiencia de usuario premium
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Mostramos un toast explicativo/exitoso para simular
			toastStore.add('Simulación: Solicitud de eliminación recibida en frontend.', 'info');

			toastStore.add('API de eliminación de cuenta no configurada aún.', 'warning');

			handleCloseDeleteModal();
		} catch {
			toastStore.add('Error al procesar la eliminación', 'error');
		} finally {
			deleteLoading = false;
		}
	}
</script>

<!-- Vista Mi Perfil rediseñada -->
<div class="profile-view {mounted ? 'animate-in' : 'opacity-0'}">
	{#if loading}
		<!-- Loading state -->
		<div class="loading-state">
			<div class="loading-header">
				<div class="loading-avatar"></div>
				<div class="loading-title"></div>
				<div class="loading-subtitle"></div>
			</div>
			<div class="loading-card">
				<div class="loading-grid">
					{#each Array(4) as _, i (i)}
						<div class="loading-field">
							<div class="loading-label"></div>
							<div class="loading-value"></div>
						</div>
					{/each}
				</div>
				<div class="loading-separator"></div>
				<div class="loading-button"></div>
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
				<h3 class="error-title">Error al cargar el perfil</h3>
				<p class="error-message">{error}</p>
			</div>
		</div>
	{:else if user}
		<!-- Encabezado del perfil limpio -->
		<div class="profile-header">
			<!-- Microcabecera opcional -->
			<div class="micro-header">
				<p class="micro-title">Información personal y seguridad</p>
			</div>

			<!-- Avatar y badge centrados -->
			<div class="avatar-section">
				<div class="avatar-container">
					<div class="avatar-circle">
						<span class="avatar-initials">{getUserInitials(user)}</span>
						<div class="avatar-glow"></div>
					</div>
				</div>
				<!-- Badge de rol separado y bien posicionado -->
				<div class="role-badge-wrapper">
					<div class="role-badge {user.is_master ? 'master' : 'user'}">
						{#if user.is_master}
							<svg class="role-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						{:else}
							<svg class="role-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						{/if}
						<span class="role-text">{getUserRole(user.is_master)}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Tarjeta principal de información optimizada -->
		<div class="main-info-card">
			<div class="info-grid-optimized">
				<!-- Primera fila: Nombre y Correo -->
				<div class="info-field">
					<div class="field-label">Nombre completo</div>
					<div class="field-container">
						<p class="field-value">{user.full_name || 'No especificado'}</p>
					</div>
				</div>

				<div class="info-field">
					<div class="field-label">
						<svg class="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
							/>
						</svg>
						Correo electrónico
					</div>
					<div class="field-container">
						<p class="field-value">{user.email}</p>
					</div>
				</div>

				<!-- Segunda fila: Último acceso (centrado) -->
				<div class="info-field full-width">
					<div class="field-label">
						<svg class="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Último acceso
					</div>
					<div class="field-container">
						<p class="field-value">{formatLastLogin(user.last_login_at)}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Sección de seguridad expandible -->
		<div class="security-section-expandable {showPasswordForm ? 'expanded' : ''}">
			<div class="security-content">
				<div class="security-left">
					<div class="security-header-compact">
						<svg class="security-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
						<h3 class="security-title-compact">Seguridad</h3>
					</div>
					<p class="security-description">
						{showPasswordForm
							? 'Completa los campos para actualizar tu contraseña'
							: 'Cambia tu contraseña regularmente para mayor seguridad'}
					</p>
				</div>

				<div class="security-right">
					<button
						class="change-password-btn-compact {showPasswordForm ? 'active' : ''}"
						on:click={handleChangePassword}
					>
						<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{#if showPasswordForm}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							{:else}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"
								/>
							{/if}
						</svg>
						<span class="btn-text">{showPasswordForm ? 'Cancelar' : 'Cambiar contraseña'}</span>
					</button>
				</div>
			</div>

			<!-- Formulario expandible -->
			{#if showPasswordForm}
				<div class="password-form" transition:slide={{ duration: 400, easing: quintOut }}>
					<!-- Mensaje de error general -->
					{#if passwordErrors.general}
						<div class="error-banner">
							<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>{passwordErrors.general}</span>
						</div>
					{/if}

					<div class="password-fields">
						<!-- Contraseña actual -->
						<div class="password-field">
							<label for="oldPassword" class="password-label">Contraseña actual</label>
							<div class="password-input-wrapper">
								<input
									type={showOldPassword ? 'text' : 'password'}
									id="oldPassword"
									bind:value={oldPassword}
									class="password-input {passwordErrors.oldPassword ? 'error' : ''}"
									placeholder="Ingresa tu contraseña actual"
									autocomplete="current-password"
								/>
								<button
									type="button"
									class="toggle-password"
									on:click={() => (showOldPassword = !showOldPassword)}
								>
									{#if showOldPassword}
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.268 5.477M4.5 19.5l15-15"
											/>
										</svg>
									{:else}
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
									{/if}
								</button>
							</div>
							{#if passwordErrors.oldPassword}
								<p class="password-error">{passwordErrors.oldPassword}</p>
							{/if}
						</div>

						<!-- Nueva contraseña -->
						<div class="password-field">
							<label for="newPassword" class="password-label">Nueva contraseña</label>
							<div class="password-input-wrapper">
								<input
									type={showNewPassword ? 'text' : 'password'}
									id="newPassword"
									bind:value={newPassword}
									class="password-input {passwordErrors.newPassword ? 'error' : ''}"
									placeholder="Mínimo 8 caracteres"
									autocomplete="new-password"
								/>
								<button
									type="button"
									class="toggle-password"
									on:click={() => (showNewPassword = !showNewPassword)}
								>
									{#if showNewPassword}
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.268 5.477M4.5 19.5l15-15"
											/>
										</svg>
									{:else}
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
									{/if}
								</button>
							</div>
							{#if passwordErrors.newPassword}
								<p class="password-error">{passwordErrors.newPassword}</p>
							{/if}
						</div>

						<!-- Confirmar nueva contraseña -->
						<div class="password-field">
							<label for="confirmPassword" class="password-label">Confirmar nueva contraseña</label>
							<div class="password-input-wrapper">
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									id="confirmPassword"
									bind:value={confirmPassword}
									class="password-input {passwordErrors.confirmPassword ? 'error' : ''}"
									placeholder="Repite tu nueva contraseña"
									autocomplete="new-password"
								/>
								<button
									type="button"
									class="toggle-password"
									on:click={() => (showConfirmPassword = !showConfirmPassword)}
								>
									{#if showConfirmPassword}
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.268 5.477M4.5 19.5l15-15"
											/>
										</svg>
									{:else}
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
									{/if}
								</button>
							</div>
							{#if passwordErrors.confirmPassword}
								<p class="password-error">{passwordErrors.confirmPassword}</p>
							{/if}
						</div>
					</div>

					<!-- Botón de envío -->
					<div class="password-actions">
						<button
							type="button"
							class="submit-password-btn"
							on:click={handlePasswordSubmit}
							disabled={passwordLoading}
						>
							{#if passwordLoading}
								<div class="spinner"></div>
								Actualizando...
							{:else}
								<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								Actualizar contraseña
							{/if}
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Secciones de configuración (solo para usuarios master) -->
		{#if isMaster}
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
						<div class="info-grid-config">
							<div class="info-item-config">
								<div class="info-label-config">Administrador principal</div>
								<div class="info-value-config">
									<p class="info-text-config">{user.full_name || user.email}</p>
									<span class="info-email-config">{user.email}</span>
								</div>
							</div>

							<div class="info-item-config">
								<div class="info-label-config">Estado de la cuenta</div>
								<div class="info-value-config">
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
											<svg class="login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
						<p class="card-description">Gestiona tus métodos de pago y facturación</p>
					</div>
				</div>

				<div class="card-content">
					<div class="coming-soon">
						<div class="coming-soon-icon">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h4 class="coming-soon-title">Próximamente disponible</h4>
						<p class="coming-soon-description">
							Podrás registrar tus métodos de pago aquí (tarjeta, PayPal, MercadoPago, etc.)
						</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Zona de peligro -->
		<div class="config-card danger-zone">
			<div class="card-header danger">
				<div class="card-icon text-red-500">
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</div>
				<div class="card-title-section">
					<h3 class="card-title text-red-500">Zona de peligro</h3>
					<p class="card-description text-red-400/80">Acciones destructivas e irreversibles</p>
				</div>
			</div>

			<div class="card-content">
				<div class="danger-action-row">
					<div class="danger-action-info">
						<h4 class="danger-action-title">Eliminar cuenta</h4>
						<p class="danger-action-description">
							Al eliminar tu cuenta, se borrarán todos tus datos personales, configuraciones y
							accesos de forma permanente. Esta acción no se puede deshacer.
						</p>
					</div>
					<div class="danger-action-btn-container">
						<button class="delete-account-btn" on:click={handleOpenDeleteModal}>
							Eliminar mi cuenta
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal de confirmación para eliminar cuenta -->
		{#if showDeleteModal}
			<div
				class="modal-overlay open"
				role="dialog"
				aria-modal="true"
				on:click|self={handleCloseDeleteModal}
			>
				<div class="modal-content danger-modal">
					<div class="modal-header">
						<h3 class="modal-title">¿Eliminar tu cuenta?</h3>
						<button class="modal-close" on:click={handleCloseDeleteModal} aria-label="Cerrar">
							<svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<div class="modal-body">
						<div class="alert-icon-wrapper text-red-500">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>

						<p class="modal-text">
							Estás a punto de eliminar de forma permanente tu cuenta de <strong
								>Geminis Labs</strong
							>. Esta acción es definitiva y <strong>no se puede deshacer</strong>.
						</p>

						<p class="modal-text sub-text text-gray-400">
							Se borrarán permanentemente todos tus datos de perfil, historial, configuraciones y
							perderás el acceso a todos nuestros servicios, incluidos <strong>Nexus</strong> y
							<strong>Orion</strong>.
						</p>

						<div class="confirmation-input-wrapper">
							<label for="deleteConfirmation" class="field-label-confirm">
								Escribe tu correo <strong>{user.email}</strong> para confirmar:
							</label>
							<input
								type="text"
								id="deleteConfirmation"
								bind:value={deleteConfirmationText}
								class="confirmation-input"
								placeholder={user.email}
								autocomplete="off"
							/>
						</div>
					</div>

					<div class="modal-actions-confirm">
						<button class="btn-cancel" on:click={handleCloseDeleteModal} disabled={deleteLoading}>
							Cancelar
						</button>
						<button
							class="btn-delete"
							disabled={deleteConfirmationText !== user.email || deleteLoading}
							on:click={handleDeleteAccountSubmit}
						>
							{#if deleteLoading}
								<div class="spinner"></div>
								Eliminando...
							{:else}
								Eliminar cuenta permanentemente
							{/if}
						</button>
					</div>
				</div>
			</div>
		{/if}
	{:else}
		<!-- Estado sin datos -->
		<div class="empty-state">
			<svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
				/>
			</svg>
			<p class="empty-message">No se pudo cargar la información del perfil</p>
		</div>
	{/if}
</div>

<!-- Los estilos ahora están en /src/lib/styles/profile-view.css -->

<style>
	/* ===================================================================
	   CONTENEDOR PRINCIPAL
	   ================================================================== */
	.profile-view {
		transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.profile-view.animate-in {
		animation: profileViewFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes profileViewFadeIn {
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
	   ENCABEZADO DEL PERFIL LIMPIO
	   ================================================================== */
	.profile-header {
		text-align: center;
		margin-bottom: 2rem;
		padding: 0;
	}

	/* Microcabecera sutil */
	.micro-header {
		margin-bottom: 1.5rem;
	}

	.micro-title {
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--color-text-muted);
		margin: 0;
		opacity: 0.8;
		letter-spacing: 0.025em;
	}

	/* Avatar y badge bien separados */
	.avatar-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0;
	}

	.avatar-container {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.role-badge-wrapper {
		display: flex;
		justify-content: center;
		margin-top: 0.5rem;
	}

	.avatar-circle {
		position: relative;
		width: 100px;
		height: 100px;
		background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 15px 30px var(--color-shadow-primary),
			0 0 0 3px rgba(255, 255, 255, 0.1);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
	}

	.avatar-circle:hover {
		transform: scale(1.05) translateY(-3px);
		box-shadow:
			0 20px 40px var(--color-shadow-secondary),
			0 0 0 4px rgba(255, 255, 255, 0.15);
	}

	.avatar-initials {
		font-size: 2rem;
		font-weight: 700;
		color: white;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		position: relative;
		z-index: 1;
	}

	.avatar-glow {
		position: absolute;
		inset: -8px;
		background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
		border-radius: 50%;
		opacity: 0;
		z-index: -1;
		transition: opacity 0.4s ease;
		animation: avatarPulse 4s ease-in-out infinite;
	}

	@keyframes avatarPulse {
		0%,
		100% {
			opacity: 0;
			transform: scale(1);
		}
		50% {
			opacity: 0.4;
			transform: scale(1.1);
		}
	}

	/* Badge de rol junto al avatar */
	.role-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		border: 1px solid;
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.3s ease;
		animation: roleBadgePulse 4s ease-in-out infinite;
	}

	.role-badge.master {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-accent-primary) 20%, transparent),
			color-mix(in srgb, var(--color-accent-secondary) 20%, transparent)
		);
		color: var(--color-accent-primary);
		border-color: color-mix(in srgb, var(--color-accent-primary) 40%, transparent);
	}

	.role-badge.user {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-text-muted) 20%, transparent),
			color-mix(in srgb, var(--color-text-muted) 15%, transparent)
		);
		color: var(--color-text-muted);
		border-color: color-mix(in srgb, var(--color-text-muted) 40%, transparent);
	}

	.role-badge:hover {
		transform: scale(1.05);
	}

	.role-badge .role-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	@keyframes roleBadgePulse {
		0%,
		100% {
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		}
		50% {
			box-shadow: 0 6px 20px rgba(0, 166, 192, 0.2);
		}
	}

	/* ===================================================================
	   TARJETA PRINCIPAL DE INFORMACIÓN
	   ================================================================== */
	.main-info-card {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 24px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow:
			0 15px 30px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		position: relative;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.main-info-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(0, 166, 192, 0.6),
			rgba(33, 230, 140, 0.6),
			transparent
		);
	}

	.main-info-card:hover {
		transform: translateY(-4px);
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 0 0 1px rgba(0, 166, 192, 0.1);
	}

	/* Grid optimizado para mejor distribución */
	.info-grid-optimized {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 2rem;
		align-items: start;
	}

	.info-grid-optimized .info-field.full-width {
		grid-column: 1 / -1;
		max-width: 50%;
		margin: 0 auto;
	}

	.info-field {
		position: relative;
	}

	.field-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.75rem;
	}

	.field-icon {
		width: 1.125rem;
		height: 1.125rem;
		color: #00a6c0;
	}

	.field-container {
		position: relative;
		padding: 1rem 1.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: default;
		overflow: hidden;
	}

	.field-container::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(0, 166, 192, 0.05), rgba(33, 230, 140, 0.05));
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.field-container:hover {
		transform: translateY(-2px);
		border-color: rgba(0, 166, 192, 0.2);
		box-shadow:
			0 8px 25px rgba(0, 166, 192, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.field-container:hover::before {
		opacity: 1;
	}

	.field-value {
		font-size: 1.125rem;
		font-weight: 500;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.4;
		position: relative;
		z-index: 1;
	}

	/* ===================================================================
	   BADGE DE ROL
	   ================================================================== */
	.role-badge {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-radius: 16px;
		font-size: 0.875rem;
		font-weight: 600;
		border: 1px solid;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: default;
	}

	.role-badge.master {
		background: linear-gradient(135deg, rgba(0, 166, 192, 0.15), rgba(33, 230, 140, 0.15));
		color: #00a6c0;
		border-color: rgba(0, 166, 192, 0.3);
		box-shadow: 0 0 20px rgba(0, 166, 192, 0.2);
	}

	.role-badge.user {
		background: linear-gradient(135deg, rgba(156, 163, 175, 0.15), rgba(107, 114, 128, 0.15));
		color: #9ca3af;
		border-color: rgba(156, 163, 175, 0.3);
		box-shadow: 0 0 20px rgba(156, 163, 175, 0.1);
	}

	.role-badge:hover {
		transform: scale(1.05);
	}

	.role-badge.master:hover {
		box-shadow: 0 0 30px rgba(0, 166, 192, 0.3);
	}

	.role-icon {
		width: 1.125rem;
		height: 1.125rem;
		position: relative;
		z-index: 1;
	}

	.role-text {
		position: relative;
		z-index: 1;
	}

	@keyframes roleGlow {
		0%,
		100% {
			opacity: 0;
		}
		50% {
			opacity: 0.3;
		}
	}

	/* ===================================================================
	   SECCIÓN DE SEGURIDAD EXPANDIBLE
	   ================================================================== */
	.security-section-expandable {
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(15px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 20px;
		padding: 1.5rem 2rem;
		margin-top: 2rem;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.security-section-expandable:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 166, 192, 0.1);
		border-color: rgba(0, 166, 192, 0.15);
	}

	.security-section-expandable.expanded {
		border-color: rgba(0, 166, 192, 0.2);
		box-shadow: 0 12px 40px rgba(0, 166, 192, 0.15);
		background: rgba(255, 255, 255, 0.03);
	}

	.security-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.security-left {
		flex: 1;
		text-align: left;
	}

	.security-header-compact {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.security-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: #00a6c0;
	}

	.security-title-compact {
		font-size: 1.25rem;
		font-weight: 500;
		color: var(--color-text-primary);
		margin: 0;
	}

	.security-description {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.security-right {
		flex-shrink: 0;
	}

	/* ===================================================================
	   BOTÓN CAMBIAR CONTRASEÑA COMPACTO
	   ================================================================== */
	.change-password-btn-compact {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.5rem;
		background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
		color: white;
		border: none;
		border-radius: 16px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		box-shadow:
			0 4px 15px var(--color-shadow-primary),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.change-password-btn-compact:hover {
		transform: translateY(-2px) scale(1.02);
		box-shadow:
			0 8px 25px var(--color-shadow-secondary),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.change-password-btn-compact:active {
		transform: translateY(-1px) scale(1.01);
	}

	.btn-icon {
		width: 1rem;
		height: 1rem;
		transition: transform 0.3s ease;
		position: relative;
		z-index: 1;
	}

	.change-password-btn-compact:hover .btn-icon {
		transform: rotate(10deg) scale(1.05);
	}

	.change-password-btn-compact.active {
		background: linear-gradient(
			135deg,
			var(--color-error-primary, #ef4444),
			var(--color-error-secondary, #dc2626)
		);
		border-color: var(--color-error-shadow, rgba(239, 68, 68, 0.4));
	}

	.change-password-btn-compact.active:hover {
		box-shadow: 0 8px 25px var(--color-error-shadow, rgba(239, 68, 68, 0.4));
	}

	.btn-text {
		position: relative;
		z-index: 1;
	}

	/* ===================================================================
	   FORMULARIO DE CONTRASEÑA EXPANDIBLE
	   ================================================================== */
	.password-form {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 12px;
		padding: 0.875rem 1rem;
		margin-bottom: 1.5rem;
		color: #fca5a5;
		font-size: 0.875rem;
	}

	.error-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.password-fields {
		display: grid;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.password-field {
		position: relative;
	}

	.password-label {
		display: block;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.password-input-wrapper {
		position: relative;
	}

	.password-input {
		width: 100%;
		padding: 1rem 1.5rem;
		padding-right: 3rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		color: var(--color-text-primary);
		font-size: 1rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;
	}

	.password-input:focus {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px rgba(0, 166, 192, 0.2);
		background: rgba(255, 255, 255, 0.05);
	}

	.password-input.error {
		border-color: #ef4444;
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
	}

	.password-input::placeholder {
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.toggle-password {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.toggle-password:hover {
		color: var(--color-text-primary);
		background: rgba(255, 255, 255, 0.1);
	}

	.password-error {
		color: #ef4444;
		font-size: 0.75rem;
		margin-top: 0.5rem;
		margin-left: 0.25rem;
	}

	.password-actions {
		display: flex;
		justify-content: center;
	}

	.submit-password-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
		color: white;
		border: none;
		border-radius: 16px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 15px var(--color-shadow-primary);
		position: relative;
		overflow: hidden;
	}

	.submit-password-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px var(--color-shadow-secondary);
	}

	.submit-password-btn:disabled {
		background: var(--color-text-muted, #4a5568);
		cursor: not-allowed;
		opacity: 0.7;
		transform: none;
	}

	.spinner {
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid #fff;
		border-radius: 50%;
		width: 1rem;
		height: 1rem;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
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

	.loading-avatar {
		width: 120px;
		height: 120px;
		background: rgba(156, 163, 175, 0.2);
		border-radius: 50%;
		margin: 0 auto 2rem;
		animation: loadingPulse 2s ease-in-out infinite;
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
		max-width: 400px;
		animation: loadingPulse 2s ease-in-out infinite;
	}

	.loading-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 32px;
		padding: 4rem;
		margin-bottom: 3rem;
	}

	.loading-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.loading-field {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.loading-label {
		height: 1rem;
		background: rgba(156, 163, 175, 0.2);
		border-radius: 4px;
		width: 40%;
		margin-bottom: 1rem;
		animation: loadingPulse 2s ease-in-out infinite;
	}

	.loading-value {
		height: 3rem;
		background: rgba(156, 163, 175, 0.15);
		border-radius: 20px;
		animation: loadingPulse 2s ease-in-out infinite;
	}

	.loading-separator {
		height: 1px;
		background: rgba(156, 163, 175, 0.1);
		margin: 3rem 0;
		animation: loadingPulse 2s ease-in-out infinite;
	}

	.loading-button {
		height: 3.5rem;
		background: rgba(156, 163, 175, 0.2);
		border-radius: 20px;
		width: 200px;
		margin: 0 auto;
		animation: loadingPulse 2s ease-in-out infinite;
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

	.empty-state {
		text-align: center;
		padding: 6rem 2rem;
	}

	.empty-icon {
		width: 5rem;
		height: 5rem;
		color: var(--color-text-muted);
		margin: 0 auto 2rem;
	}

	.empty-message {
		color: var(--color-text-muted);
		font-size: 1.25rem;
		margin: 0;
	}

	/* ===================================================================
	   RESPONSIVE DESIGN
	   ================================================================== */
	@media (max-width: 768px) {
		.micro-title {
			font-size: 0.8rem;
		}

		.main-info-card {
			padding: 1.5rem;
		}

		.info-grid-optimized {
			grid-template-columns: 1fr;
			gap: 1.25rem;
		}

		.info-grid-optimized .info-field.full-width {
			max-width: 100%;
		}

		.avatar-circle {
			width: 80px;
			height: 80px;
		}

		.avatar-initials {
			font-size: 1.75rem;
		}

		.security-content {
			flex-direction: column;
			text-align: center;
			gap: 1.5rem;
		}

		.security-left {
			text-align: center;
		}

		.loading-card {
			padding: 2rem;
		}

		.loading-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.profile-header {
			padding: 0;
			margin-bottom: 1.25rem;
		}

		.micro-header {
			margin-bottom: 1rem;
		}

		.micro-title {
			font-size: 0.75rem;
		}

		.avatar-section {
			gap: 0.75rem;
		}

		.main-info-card {
			padding: 1.25rem;
		}

		.change-password-btn-compact {
			padding: 0.75rem 1.25rem;
			font-size: 0.8rem;
		}

		.avatar-circle {
			width: 70px;
			height: 70px;
		}

		.avatar-initials {
			font-size: 1.5rem;
		}

		.role-badge {
			font-size: 0.7rem;
			padding: 0.375rem 0.75rem;
		}
	}
</style>
