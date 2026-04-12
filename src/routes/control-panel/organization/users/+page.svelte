<script>
	import { onMount } from 'svelte';
	import { isAuthenticated } from '$lib/stores/authStore.js';
	import { goto } from '$app/navigation';
	import { organizationService } from '$lib/services/organizationService.js';
	import { userService } from '$lib/services/userService.js';
	import { authService } from '$lib/services/authService.js';
	import { toastStore } from '$lib/stores/toastStore.js';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { slide, fade } from 'svelte/transition';

	let organizations = [];
	let selectedOrgId = '';
	let users = [];
	let loading = true;
	let loadingUsers = false;
	let error = null;

	// Modal States
	let showAddModal = false;
	let showInviteModal = false;
	let availableUsers = [];
	let selectedUserIdToAdd = '';
	let selectedRoleToAdd = 'member';
	let inviteEmail = '';
	let addingUser = false;
	let invitingUser = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			goto('/auth');
			return;
		}

		try {
			organizations = await organizationService.getOrganizations();
			if (organizations.length > 0) {
				selectedOrgId = organizations[0].id;
				await fetchUsers();
			}
		} catch (err) {
			console.error('Error fetching organizations:', err);
			error = 'No se pudieron cargar las organizaciones.';
		} finally {
			loading = false;
		}
	});

	async function fetchUsers() {
		if (!selectedOrgId) return;
		loadingUsers = true;
		try {
			const response = await organizationService.getOrganizationUsers(selectedOrgId);
			users = response.users || [];
		} catch (err) {
			console.error('Error fetching users:', err);
			toastStore.error('Error al cargar los usuarios de esta organización.');
		} finally {
			loadingUsers = false;
		}
	}

	async function switchOrganization() {
		await fetchUsers();
	}

	async function openAddModal() {
		showAddModal = true;
		try {
			const response = await userService.getUsers();
			if (response.success) {
				// Filter users who are not already in the organization
				const currentMemberIds = users.map((u) => u.user_id);
				availableUsers = response.data.filter((u) => !currentMemberIds.includes(u.id));
			}
		} catch (err) {
			console.error('Error fetching available users:', err);
		}
	}

	async function handleAddUser() {
		if (!selectedUserIdToAdd) return;
		addingUser = true;
		try {
			await organizationService.addOrganizationUser(selectedOrgId, {
				user_id: selectedUserIdToAdd,
				role: selectedRoleToAdd
			});
			toastStore.success('Usuario agregado correctamente');
			showAddModal = false;
			selectedUserIdToAdd = '';
			await fetchUsers();
		} catch (err) {
			console.error('Error adding user:', err);
			toastStore.error('Error al agregar el usuario.');
		} finally {
			addingUser = false;
		}
	}

	async function handleInviteUser() {
		if (!inviteEmail || !inviteEmail.includes('@')) {
			toastStore.error('Por favor, ingresa un correo electrónico válido.');
			return;
		}
		invitingUser = true;
		try {
			await authService.resendVerification(inviteEmail);
			toastStore.success('Invitación enviada correctamente');
			showInviteModal = false;
			inviteEmail = '';
		} catch (err) {
			console.error('Error inviting user:', err);
			toastStore.error('Error al enviar la invitación.');
		} finally {
			invitingUser = false;
		}
	}

	async function handleResendInvitation(email) {
		try {
			await authService.resendVerification(email);
			toastStore.success('Verificación reenviada correctamente');
		} catch (err) {
			console.error('Error resending verification:', err);
			toastStore.error('No se pudo reenviar la verificación.');
		}
	}

	async function changeUserRole(userId, newRole) {
		try {
			await organizationService.updateOrganizationUserRole(selectedOrgId, userId, newRole);
			toastStore.success('Rol actualizado correctamente');
			await fetchUsers();
		} catch (err) {
			console.error('Error updating role:', err);
			toastStore.error('No se pudo actualizar el rol.');
		}
	}

	async function removeUser(userId) {
		if (!confirm('¿Estás seguro de que deseas eliminar a este usuario de la organización?')) return;
		try {
			await organizationService.removeOrganizationUser(selectedOrgId, userId);
			toastStore.success('Usuario eliminado correctamente');
			await fetchUsers();
		} catch (err) {
			console.error('Error removing user:', err);
			toastStore.error('No se pudo eliminar al usuario.');
		}
	}

	function getRoleLabel(role) {
		const roles = {
			owner: 'Dueño',
			admin: 'Administrador',
			billing: 'Facturación',
			member: 'Miembro'
		};
		return roles[role] || role;
	}
</script>

<svelte:head>
	<title>Usuarios - Geminis Labs</title>
</svelte:head>

<Navbar />
<Sidebar />

<main class="control-panel-main">
	<div class="control-panel-content">
		<header class="page-header">
			<div class="header-info">
				<h1>Usuarios</h1>
				<p class="page-description">Administra los miembros y sus permisos en la organización</p>
				<div class="org-selector-inline">
					<span>Organización activa:</span>
					<select id="org-selector" bind:value={selectedOrgId} on:change={switchOrganization}>
						{#each organizations as org (org.id)}
							<option value={org.id}>{org.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="header-actions">
				<button class="btn-secondary" on:click={() => (showInviteModal = true)}>
					Invitar por Email
				</button>
				<button class="btn-primary" on:click={openAddModal} disabled={loading || !selectedOrgId}>
					<span>+</span> Agregar del sistema
				</button>
			</div>
		</header>

		{#if loading}
			<div class="status-container">
				<div class="spinner"></div>
				<p>Cargando organizaciones...</p>
			</div>
		{:else if error}
			<div class="status-container error">
				<div class="error-icon">⚠️</div>
				<p>{error}</p>
				<button class="btn-secondary" on:click={() => window.location.reload()}>Reintentar</button>
			</div>
		{:else}
			<div class="table-card">
				{#if loadingUsers}
					<div class="inner-loading">
						<div class="spinner small"></div>
						<p>Cargando usuarios...</p>
					</div>
				{:else if users.length === 0}
					<div class="inner-empty">
						<p>No hay usuarios registrados en esta organización.</p>
					</div>
				{:else}
					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th>Usuario</th>
									<th>Email</th>
									<th>Rol</th>
									<th>Estado</th>
									<th class="text-right">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{#each users as user (user.user_id)}
									<tr in:fade>
										<td>
											<div class="user-info">
												<div class="avatar">{user.full_name.charAt(0)}</div>
												<span>{user.full_name}</span>
											</div>
										</td>
										<td>{user.email}</td>
										<td>
											<span class="role-chip {user.role}">
												{getRoleLabel(user.role)}
											</span>
										</td>
										<td>
											<span class="status-chip" class:verified={user.email_verified}>
												{user.email_verified ? 'Activo' : 'Pendiente'}
											</span>
										</td>
										<td class="text-right">
											<div class="actions-group">
												<select
													class="inline-select"
													value={user.role}
													on:change={(e) => changeUserRole(user.user_id, e.target.value)}
												>
													<option value="owner">Dueño</option>
													<option value="admin">Admin</option>
													<option value="billing">Billing</option>
													<option value="member">Miembro</option>
												</select>
												<button
													class="btn-icon"
													class:disabled={user.email_verified}
													on:click={() =>
														!user.email_verified && handleResendInvitation(user.email)}
													title={user.email_verified
														? 'Usuario ya verificado'
														: 'Reenviar invitación'}
												>
													<svg
														width="18"
														height="18"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
														/>
													</svg>
												</button>
												<button
													class="btn-icon delete"
													on:click={() => removeUser(user.user_id)}
													title="Eliminar"
												>
													<svg
														width="18"
														height="18"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</main>

<!-- Invite User Modal -->
{#if showInviteModal}
	<div
		class="modal-backdrop"
		role="button"
		tabindex="0"
		on:click|self={() => (showInviteModal = false)}
		on:keydown={(e) => e.key === 'Escape' && (showInviteModal = false)}
		in:fade={{ duration: 200 }}
	>
		<div class="modal-content" in:slide={{ duration: 300, y: 50 }}>
			<h3>Invitar Usuario</h3>
			<p>Envía una invitación por correo electrónico para unirse a Geminis Labs.</p>

			<div class="form-group">
				<label for="invite-email">Correo Electrónico</label>
				<input
					type="email"
					id="invite-email"
					bind:value={inviteEmail}
					placeholder="usuario@ejemplo.com"
					required
				/>
			</div>

			<div class="modal-actions">
				<button class="btn-ghost" on:click={() => (showInviteModal = false)}>Cancelar</button>
				<button
					class="btn-primary"
					on:click={handleInviteUser}
					disabled={invitingUser || !inviteEmail}
				>
					{invitingUser ? 'Enviando...' : 'Enviar Invitación'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Add existing User Modal -->
{#if showAddModal}
	<div
		class="modal-backdrop"
		role="button"
		tabindex="0"
		on:click|self={() => (showAddModal = false)}
		on:keydown={(e) => e.key === 'Escape' && (showAddModal = false)}
		in:fade={{ duration: 200 }}
	>
		<div class="modal-content" in:slide={{ duration: 300, y: 50 }}>
			<h3>Agregar Miembro</h3>
			<p>Selecciona un usuario del sistema para agregarlo a esta organización.</p>

			{#if availableUsers.length === 0}
				<p class="empty-msg">No hay usuarios disponibles para agregar.</p>
				<div class="modal-actions">
					<button class="btn-ghost" on:click={() => (showAddModal = false)}>Cerrar</button>
				</div>
			{:else}
				<div class="form-group">
					<label for="user-to-add">Seleccionar Usuario</label>
					<select id="user-to-add" bind:value={selectedUserIdToAdd}>
						<option value="">-- Elige un usuario --</option>
						{#each availableUsers as user (user.id)}
							<option value={user.id}>{user.full_name} ({user.email})</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="role-to-add">Asignar Rol</label>
					<select id="role-to-add" bind:value={selectedRoleToAdd}>
						<option value="owner">Dueño</option>
						<option value="admin">Administrador</option>
						<option value="billing">Facturación</option>
						<option value="member">Miembro</option>
					</select>
				</div>

				<div class="modal-actions">
					<button class="btn-ghost" on:click={() => (showAddModal = false)}>Cancelar</button>
					<button
						class="btn-primary"
						on:click={handleAddUser}
						disabled={addingUser || !selectedUserIdToAdd}
					>
						{addingUser ? 'Agregando...' : 'Confirmar'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Heredar estilos base */
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
		color: #f1f5f9;
	}

	.control-panel-main::after {
		content: '';
		position: fixed;
		top: 0;
		left: 260px;
		right: 0;
		bottom: 0;
		background-image: url('/img/noise.png');
		background-repeat: repeat;
		opacity: 0.03;
		pointer-events: none;
		z-index: 1;
	}

	.control-panel-content {
		max-width: 1200px;
		margin: 0 auto;
		position: relative;
		z-index: 2;
	}

	/* Header */
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		padding-bottom: 1.5rem;
	}

	.header-info h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		font-weight: 700;
	}

	.page-description {
		color: #94a3b8;
		margin: 0.5rem 0 1.5rem 0;
		font-size: 1rem;
	}

	.org-selector-inline {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: #94a3b8;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}

	.org-selector-inline select {
		padding: 0.4rem 0.75rem;
		background: rgba(15, 23, 42, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: #f1f5f9;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.org-selector-inline select:focus {
		border-color: #6366f1;
		background: rgba(15, 23, 42, 0.5);
	}

	.header-actions {
		display: flex;
		gap: 1rem;
	}

	/* Table Card */
	.table-card {
		background: rgba(30, 41, 59, 0.4);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		padding: 1.5rem;
		overflow: hidden;
	}

	.table-container {
		width: 100%;
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	th {
		padding: 1rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #64748b;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		font-weight: 700;
	}

	td {
		padding: 1.25rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.03);
		color: #cbd5e1;
		font-size: 0.95rem;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.avatar {
		width: 32px;
		height: 32px;
		background: linear-gradient(135deg, #6366f1, #a855f7);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		color: white;
		font-size: 0.8rem;
	}

	.role-chip {
		font-size: 0.75rem;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-weight: 600;
		white-space: nowrap;
	}

	.role-chip.owner {
		background: rgba(234, 179, 8, 0.1);
		color: #facc15;
	}
	.role-chip.admin {
		background: rgba(99, 102, 241, 0.1);
		color: #818cf8;
	}
	.role-chip.billing {
		background: rgba(16, 185, 129, 0.1);
		color: #34d399;
	}
	.role-chip.member {
		background: rgba(148, 163, 184, 0.1);
		color: #94a3b8;
	}

	.status-chip {
		font-size: 0.75rem;
		color: #94a3b8;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-chip::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #ef4444;
	}

	.status-chip.verified {
		color: #4ade80;
	}
	.status-chip.verified::before {
		background: #22c55e;
	}

	.actions-group {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;
	}

	.inline-select {
		background: rgba(15, 23, 42, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.35rem 0.5rem;
		color: #cbd5e1;
		font-size: 0.8rem;
		outline: none;
	}

	.btn-icon {
		background: transparent;
		border: none;
		color: #64748b;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.btn-icon:hover {
		background: rgba(255, 255, 255, 0.05);
		color: #f1f5f9;
	}

	.btn-icon.disabled {
		opacity: 0.2;
		cursor: default;
	}

	.btn-icon.disabled:hover {
		background: transparent;
		color: #64748b;
	}

	.btn-icon.delete:hover {
		color: #f87171;
		background: rgba(239, 68, 68, 0.1);
	}

	/* Form Group Helper */
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.8rem;
		font-weight: 600;
		color: #94a3b8;
	}

	input {
		background: rgba(15, 23, 42, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 0.75rem;
		color: #f1f5f9;
		outline: none;
	}

	input:focus {
		border-color: #6366f1;
		background: rgba(15, 23, 42, 0.5);
	}

	select {
		background: rgba(15, 23, 42, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 0.75rem;
		color: #f1f5f9;
		outline: none;
	}

	select option {
		background: #1e293b;
	}

	/* Modal */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(5px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}

	.modal-content {
		background: #1e293b;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 20px;
		padding: 2.5rem;
		width: 100%;
		max-width: 500px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.modal-content h3 {
		margin: 0;
		font-size: 1.5rem;
		color: #f8fafc;
	}
	.modal-content p {
		color: #cbd5e1;
		margin: 0;
	}

	.empty-msg {
		color: #94a3b8;
		font-style: italic;
		text-align: center;
		padding: 1rem 0;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1rem;
	}

	/* Common utilities */
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
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
	}

	.btn-ghost {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #94a3b8;
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		cursor: pointer;
	}

	.btn-secondary {
		background: rgba(148, 163, 184, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #f1f5f9;
		padding: 0.5rem 1rem;
		border-radius: 12px;
		cursor: pointer;
	}

	.status-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 5rem 2rem;
		color: #cbd5e1;
		background: rgba(30, 41, 59, 0.3);
		border-radius: 20px;
		border: 1px dashed rgba(255, 255, 255, 0.1);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(99, 102, 241, 0.2);
		border-top-color: #6366f1;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	.spinner.small {
		width: 20px;
		height: 20px;
		border-width: 2px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.text-right {
		text-align: right;
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
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.5rem;
		}
	}
</style>
