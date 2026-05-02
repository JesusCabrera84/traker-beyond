<script>
	import { page } from '$app/stores';

	// Helper function for hash links
	function getLinkHref(hash) {
		if ($page.url.pathname === '/') {
			return hash;
		}
		return `/${hash}`;
	}
</script>

<footer class="footer">
	<div class="container-padding container">
		<div class="footer-content">
			<div class="footer-section">
				<h3>Geminis Labs</h3>
				<p>Tecnología avanzada de monitoreo GPS para un mundo conectado.</p>
			</div>
			<div class="footer-section">
				<h4>Servicios</h4>
				<ul>
					<li><a href={getLinkHref('#servicios')}>Localización Celular</a></li>
					<li><a href={getLinkHref('#servicios')}>Monitoreo Vehicular</a></li>
					<li><a href={getLinkHref('#servicios')}>Consultoría Tecnológica</a></li>
					<li><a href={getLinkHref('#servicios')}>Análisis de Riesgos</a></li>
				</ul>
			</div>
			<div class="footer-section">
				<h4>Empresa</h4>
				<ul>
					<li><a href={getLinkHref('#nosotros')}>Quiénes Somos</a></li>
					<li><a href={getLinkHref('#contacto')}>Contacto</a></li>
					<li><a href="/privacidad" aria-label="Política de Privacidad">Privacidad</a></li>
				</ul>
			</div>
		</div>
		<div class="footer-bottom">
			<p>&copy; 2025 Geminis Labs. Todos los derechos reservados.</p>
		</div>
	</div>
</footer>

<style>
	/* Footer Styles */
	.footer {
		background: #0b1016;
		color: #ffffff;
		padding: 4rem 0 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.footer-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 3rem;
		margin-bottom: 3rem;
	}

	.footer-section h3 {
		font-family: 'Audiowide', sans-serif;
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #ffffff;
	}

	.footer-section h4 {
		font-size: 1.1rem;
		margin-bottom: 1.2rem;
		color: #00a6c0;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.footer-section p {
		color: #9ca3af;
		line-height: 1.6;
	}

	.footer-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.footer-section ul li {
		margin-bottom: 0.8rem;
	}

	.footer-section ul li a {
		color: #d1d5db;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.footer-section ul li a:hover {
		color: #00a6c0;
	}

	.footer-bottom {
		text-align: center;
		padding-top: 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.footer-bottom p {
		color: #6b7280;
		font-size: 0.9rem;
	}

	/* Utility from layout.css */
	.container-padding {
		padding: 0 2rem;
	}

	@media (max-width: 768px) {
		.footer {
			padding: 3rem 0 1.5rem;
		}

		.footer-content {
			gap: 2rem;
		}
	}
</style>
