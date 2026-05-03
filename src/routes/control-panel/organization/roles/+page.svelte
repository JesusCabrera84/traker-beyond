<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/authStore.js';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	onMount(() => {
		if (!$isAuthenticated) goto('/auth');
	});

	const roles = [
		{
			id: 'owner',
			name: 'Dueño',
			desc: 'Control total sobre la organización, facturación, usuarios y configuración.',
			color: '#fbbf24',
			bg: 'rgba(251,191,36,0.08)',
			border: 'rgba(251,191,36,0.25)',
			glow: 'rgba(251,191,36,0.12)',
			icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
			count: 1
		},
		{
			id: 'admin',
			name: 'Administrador',
			desc: 'Gestión de usuarios, productos Nexus/Orion y configuración operativa.',
			color: '#818cf8',
			bg: 'rgba(129,140,248,0.08)',
			border: 'rgba(129,140,248,0.25)',
			glow: 'rgba(99,102,241,0.1)',
			icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
			count: 0
		},
		{
			id: 'billing',
			name: 'Facturación',
			desc: 'Acceso de lectura/escritura a facturación, pagos e historial de consumo.',
			color: '#34d399',
			bg: 'rgba(52,211,153,0.08)',
			border: 'rgba(52,211,153,0.25)',
			glow: 'rgba(16,185,129,0.1)',
			icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
			count: 0
		},
		{
			id: 'member',
			name: 'Miembro',
			desc: 'Acceso de solo lectura a dispositivos, métricas y reportes de uso.',
			color: '#94a3b8',
			bg: 'rgba(148,163,184,0.08)',
			border: 'rgba(148,163,184,0.2)',
			glow: 'rgba(100,116,139,0.08)',
			icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
			count: 1
		}
	];

	const permissions = [
		{
			category: 'Organización',
			icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16',
			items: [
				{ label: 'Ver información', owner: true, admin: true, billing: true, member: true },
				{ label: 'Editar organización', owner: true, admin: true, billing: false, member: false },
				{ label: 'Eliminar organización', owner: true, admin: false, billing: false, member: false }
			]
		},
		{
			category: 'Usuarios',
			icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
			items: [
				{ label: 'Ver usuarios', owner: true, admin: true, billing: false, member: false },
				{ label: 'Invitar usuarios', owner: true, admin: true, billing: false, member: false },
				{ label: 'Cambiar roles', owner: true, admin: false, billing: false, member: false },
				{ label: 'Eliminar usuarios', owner: true, admin: false, billing: false, member: false }
			]
		},
		{
			category: 'Nexus',
			icon: 'M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 16.5V21m3.75-18v1.5m0 16.5V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z',
			items: [
				{ label: 'Ver dispositivos', owner: true, admin: true, billing: false, member: true },
				{ label: 'Estado del servicio', owner: true, admin: true, billing: false, member: true },
				{ label: 'Ver consumo', owner: true, admin: true, billing: true, member: false }
			]
		},
		{
			category: 'Orion',
			icon: 'M3.75 13.5h8.25L19.5 3.75v6.75H11.25L4.5 20.25v-6.75z',
			items: [
				{ label: 'Ver API keys', owner: true, admin: true, billing: false, member: false },
				{ label: 'Crear / revocar keys', owner: true, admin: true, billing: false, member: false },
				{ label: 'Ver logs', owner: true, admin: true, billing: false, member: false },
				{ label: 'Usar playground', owner: true, admin: true, billing: false, member: false }
			]
		},
		{
			category: 'Facturación',
			icon: 'M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v4.125c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 16.125V12m18 0h-3.75M3 12h3.75',
			items: [
				{ label: 'Ver resumen', owner: true, admin: true, billing: true, member: false },
				{ label: 'Ver facturas', owner: true, admin: true, billing: true, member: false },
				{ label: 'Gestionar pagos', owner: true, admin: false, billing: true, member: false }
			]
		},
		{
			category: 'Configuración',
			icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.723 6.723 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.417-.612.41-.992a6.723 6.723 0 010-.255c.007-.378-.138-.75-.41-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z',
			items: [
				{ label: 'Webhooks', owner: true, admin: true, billing: false, member: false },
				{ label: 'Integraciones', owner: true, admin: true, billing: false, member: false },
				{ label: 'Auditoría', owner: true, admin: true, billing: true, member: false }
			]
		}
	];

	const roleKeys = ['owner', 'admin', 'billing', 'member'];

	function getRoleColor(roleId) {
		return roles.find((r) => r.id === roleId)?.color ?? '#94a3b8';
	}
</script>

<svelte:head>
	<title>Roles y Permisos — Geminis Labs</title>
</svelte:head>

<Navbar />
<Sidebar />

<main class="roles-main">
	<div class="roles-content">
		<header class="roles-header">
			<div class="roles-header-left">
				<div class="roles-icon">
					<svg
						width="22"
						height="22"
						fill="none"
						viewBox="0 0 24 24"
						stroke="#818cf8"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
						/>
					</svg>
				</div>
				<div>
					<h1 class="roles-title">Roles y Permisos</h1>
					<p class="roles-subtitle">Define qué puede hacer cada miembro de tu organización</p>
				</div>
			</div>
			<div class="roles-header-right">
				<span class="coming-soon-badge">
					<svg
						width="12"
						height="12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					Roles personalizados próximamente
				</span>
			</div>
		</header>

		<section class="roles-grid">
			{#each roles as role (role.id)}
				<div
					class="role-card"
					style="background:{role.bg};border-color:{role.border};box-shadow:0 0 0 0 {role.glow};"
				>
					<div class="role-card-top">
						<div class="role-icon-wrap" style="background:{role.bg};border-color:{role.border};">
							<svg
								width="18"
								height="18"
								fill="none"
								viewBox="0 0 24 24"
								stroke={role.color}
								stroke-width="1.8"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d={role.icon} />
							</svg>
						</div>
						<div class="role-card-info">
							<div class="role-name" style="color:{role.color};">{role.name}</div>
							<div class="role-count">
								{role.count}
								{role.count === 1 ? 'miembro' : 'miembros'}
							</div>
						</div>
						{#if role.id === 'owner'}
							<span class="role-badge-fixed" style="color:{role.color};border-color:{role.border};"
								>Predefinido</span
							>
						{/if}
					</div>
					<p class="role-desc">{role.desc}</p>
				</div>
			{/each}
		</section>

		<div class="roles-divider"></div>

		<section class="permissions-section">
			<div class="permissions-header">
				<h2 class="permissions-title">Matriz de permisos</h2>
				<p class="permissions-sub">Referencia de accesos por rol para esta organización</p>
			</div>

			<div class="permissions-table-wrap">
				<table class="permissions-table">
					<thead>
						<tr>
							<th class="perm-col-label">Permiso</th>
							{#each roles as role (role.id)}
								<th class="perm-col-role" style="color:{role.color};">
									<span class="role-th-dot" style="background:{role.color};"></span>
									{role.name}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each permissions as cat (cat.category)}
							<tr class="cat-row">
								<td colspan="5">
									<div class="cat-label">
										<svg
											width="13"
											height="13"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d={cat.icon} />
										</svg>
										{cat.category}
									</div>
								</td>
							</tr>
							{#each cat.items as perm (perm.label)}
								<tr class="perm-row">
									<td class="perm-label">{perm.label}</td>
									{#each roleKeys as rk (rk)}
										<td class="perm-check">
											{#if perm[rk]}
												<span class="check-yes" style="color:{getRoleColor(rk)};">
													<svg
														width="15"
														height="15"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														stroke-width="2.5"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															d="M5 13l4 4L19 7"
														/>
													</svg>
												</span>
											{:else}
												<span class="check-no">
													<svg
														width="13"
														height="13"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														stroke-width="2"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</span>
											{/if}
										</td>
									{/each}
								</tr>
							{/each}
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<div class="roles-note">
			<svg
				width="14"
				height="14"
				fill="none"
				viewBox="0 0 24 24"
				stroke="#334155"
				stroke-width="2"
				style="flex-shrink:0;margin-top:1px;"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p>
				Los roles predefinidos no se pueden editar. Los <strong>roles personalizados</strong> con
				permisos granulares estarán disponibles próximamente. Para cambiar el rol de un miembro, ve
				a
				<a href="/control-panel/organization/users">Usuarios</a>.
			</p>
		</div>
	</div>
</main>

<style>
	.roles-main {
		min-height: 100vh;
		background-color: #0d1117;
		background-image:
			radial-gradient(ellipse 70% 40% at 0% 0%, rgba(99, 102, 241, 0.07) 0%, transparent 60%),
			radial-gradient(ellipse 50% 30% at 100% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
		padding: 2rem;
		padding-top: calc(70px + 2rem);
		margin-left: 260px;
		box-sizing: border-box;
		position: relative;
	}

	.roles-content {
		max-width: 1100px;
		margin: 0 auto;
	}

	.roles-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 28px;
		flex-wrap: wrap;
	}

	.roles-header-left {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.roles-icon {
		width: 46px;
		height: 46px;
		border-radius: 13px;
		border: 1px solid rgba(129, 140, 248, 0.25);
		background: rgba(129, 140, 248, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.roles-title {
		font-size: 22px;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0 0 3px;
		letter-spacing: -0.02em;
	}

	.roles-subtitle {
		font-size: 13px;
		color: #334155;
		margin: 0;
	}

	.coming-soon-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border-radius: 99px;
		border: 1px solid rgba(251, 191, 36, 0.25);
		background: rgba(251, 191, 36, 0.08);
		padding: 6px 12px;
		font-size: 11px;
		font-weight: 600;
		color: #fbbf24;
		white-space: nowrap;
	}

	.roles-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
		margin-bottom: 28px;
	}

	.role-card {
		border-radius: 16px;
		border: 1px solid;
		padding: 18px 16px;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.role-card:hover {
		transform: translateY(-3px);
	}

	.role-card-top {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}

	.role-icon-wrap {
		width: 36px;
		height: 36px;
		border-radius: 9px;
		border: 1px solid;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.role-card-info {
		flex: 1;
		min-width: 0;
	}

	.role-name {
		font-size: 14px;
		font-weight: 700;
		line-height: 1.2;
	}

	.role-count {
		font-size: 11px;
		color: #475569;
		margin-top: 2px;
	}

	.role-badge-fixed {
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 3px 7px;
		border-radius: 99px;
		border: 1px solid;
		background: rgba(0, 0, 0, 0.2);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.role-desc {
		font-size: 12px;
		color: #475569;
		line-height: 1.5;
		margin: 0;
	}

	.roles-divider {
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(99, 102, 241, 0.3),
			rgba(139, 92, 246, 0.2),
			transparent
		);
		margin-bottom: 28px;
	}

	.permissions-section {
		background: rgba(10, 16, 26, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 18px;
		overflow: hidden;
		margin-bottom: 16px;
	}

	.permissions-header {
		padding: 18px 22px 14px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.permissions-title {
		font-size: 15px;
		font-weight: 600;
		color: #e2e8f0;
		margin: 0 0 3px;
	}

	.permissions-sub {
		font-size: 12px;
		color: #334155;
		margin: 0;
	}

	.permissions-table-wrap {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.permissions-table {
		width: 100%;
		min-width: 560px;
		border-collapse: collapse;
		font-size: 12.5px;
	}

	.permissions-table thead tr {
		background: rgba(0, 0, 0, 0.3);
	}

	.perm-col-label {
		padding: 11px 16px;
		text-align: left;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #334155;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		min-width: 180px;
	}

	.perm-col-role {
		padding: 11px 12px;
		text-align: center;
		font-size: 11px;
		font-weight: 700;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		min-width: 90px;
		vertical-align: middle;
	}

	.role-th-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		margin-right: 5px;
		vertical-align: middle;
	}

	.cat-row td {
		padding: 0;
	}

	.cat-label {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 10px 16px 6px;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #475569;
		background: rgba(0, 0, 0, 0.15);
		border-top: 1px solid rgba(255, 255, 255, 0.04);
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}

	.perm-row {
		border-bottom: 1px solid rgba(255, 255, 255, 0.03);
		transition: background 0.15s;
	}

	.perm-row:hover {
		background: rgba(255, 255, 255, 0.02);
	}

	.perm-row:last-child {
		border-bottom: none;
	}

	.perm-label {
		padding: 10px 16px;
		color: #94a3b8;
		font-size: 12.5px;
	}

	.perm-check {
		padding: 10px 12px;
		text-align: center;
		vertical-align: middle;
	}

	.check-yes {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 6px;
	}

	.check-no {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 6px;
		color: rgba(100, 116, 139, 0.35);
	}

	.roles-note {
		display: flex;
		align-items: flex-start;
		gap: 9px;
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.04);
		border-radius: 12px;
		padding: 12px 16px;
	}

	.roles-note p {
		margin: 0;
		font-size: 11.5px;
		color: #334155;
		line-height: 1.6;
	}

	.roles-note strong {
		color: #475569;
	}

	.roles-note a {
		color: #818cf8;
		text-decoration: none;
	}

	.roles-note a:hover {
		text-decoration: underline;
	}

	@media (max-width: 1024px) {
		.roles-main {
			margin-left: 0;
			padding: 1.25rem;
			padding-top: calc(70px + 1.25rem);
			padding-bottom: 5rem;
		}

		.roles-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.roles-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 640px) {
		.roles-header-left {
			gap: 10px;
		}

		.roles-icon {
			width: 40px;
			height: 40px;
		}

		.roles-title {
			font-size: 18px;
		}

		.roles-subtitle {
			font-size: 11px;
		}

		.roles-grid {
			grid-template-columns: 1fr 1fr;
			gap: 10px;
		}

		.role-card {
			padding: 14px 12px;
		}

		.role-desc {
			font-size: 11px;
		}

		.permissions-header {
			padding: 14px 16px 10px;
		}

		.perm-col-label {
			min-width: 140px;
			padding: 9px 12px;
		}

		.perm-col-role {
			min-width: 70px;
			padding: 9px 8px;
			font-size: 10px;
		}
	}

	@media (max-width: 400px) {
		.roles-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
