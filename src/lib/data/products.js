/**
 * Catálogo de productos de la landing.
 *
 * El orden importa: Orion va en medio a propósito. Su plata acromática separa
 * el verde de Nexus del rojo de Signum, que son complementarios y vibrarían si
 * quedaran adyacentes en el rail.
 *
 * `rail` es el descriptor funcional que se muestra bajo el nombre. No es
 * decorativo: un visitante que solo lea el rail y nunca abra el panel debe
 * saber qué son los tres productos.
 */
export const products = [
	{
		id: 'nexus',
		name: 'NEXUS',
		rail: 'Rastreo GPS en tiempo real',
		audience: 'Familias y flotillas',
		subtitle:
			'Nexus es una plataforma de rastreo inteligente diseñada para proteger vehículos, personas y operaciones mediante ubicación en tiempo real, alertas y análisis de movilidad',
		mark: '/img/products/mark-nexus.webp',
		logo: '/img/logo-nexus-3x.png',
		logoAlt: 'Logotipo de Nexus',
		href: '/products/nexus',
		external: false,
		cta: 'Explorar Nexus',
		audiences: [
			{ label: 'Para familia', benefit: 'Protege a quienes más quieres' },
			{ label: 'Para flotillas', benefit: 'Control donde quiera que estés' },
			{ label: 'Para negocios', benefit: 'Integra fácil tus datos' }
		],
		featuresTitle: 'Características',
		features: [
			'Ubicación en tiempo real',
			'Historial de recorridos',
			'Geocercas personalizadas',
			'Notificaciones',
			'Panel web + App móvil',
			'API para integradores'
		],
		useCases: [
			'Protección vehicular',
			'Rastreo familiar',
			'Control de flotillas',
			'Recuperación ante robo',
			'Seguridad en campo',
			'Integración con terceros'
		]
	},
	{
		id: 'orion',
		name: 'ORION',
		rail: 'API de geolocalización sin GPS',
		audience: 'Desarrolladores e integradores',
		subtitle:
			'Una capa silenciosa de inteligencia geoespacial para productos que requieren localización, análisis territorial y validación de eventos sin depender exclusivamente del GPS.',
		mark: '/img/products/mark-orion.webp',
		logo: '/img/products/logo-orion.png',
		logoAlt: 'Logotipo de Orion',
		href: 'https://orion.geminislabs.com/',
		external: true,
		cta: 'Explorar Orion',
		audiences: null,
		featuresTitle: 'Características principales',
		features: [
			'Localización por Cell ID',
			'API de geolocalización',
			'Enriquecimiento geoespacial',
			'Soporte para múltiples operadores',
			'Integración con plataformas IoT',
			'Procesamiento por lotes'
		],
		useCases: [
			'Localización sin GPS',
			'Validación de eventos IoT',
			'Enriquecimiento de telemetría',
			'Seguridad vehicular',
			'Sistemas antifraude',
			'Integración con ERPs o CRMs'
		]
	},
	{
		id: 'signum',
		name: 'SIGNUM',
		rail: 'Identidad médica de emergencia',
		audience: 'Motociclistas y outdoor',
		badge: 'Nuevo',
		subtitle:
			'Identificación médica de emergencia mediante un código QR. Al escanearlo se abre una página de 11 KB con tipo de sangre, alergias, padecimientos, medicamentos y contactos: sin instalar una app y sin crear una cuenta.',
		mark: '/img/products/mark-signum.webp',
		logo: '/img/products/logo-signum.webp',
		logoAlt: 'Logotipo de Signum',
		href: 'https://signum.geminislabs.com/',
		external: true,
		cta: 'Explorar Signum',
		audiences: null,
		featuresTitle: 'Características principales',
		features: [
			'QR único por persona',
			'Página pública de 11 KB',
			'Funciona con mala señal',
			'Etiquetas bilingües ES/EN',
			'Tipo de sangre impreso',
			'Control total de privacidad'
		],
		useCases: [
			'Motociclismo',
			'Deporte al aire libre',
			'Condiciones crónicas',
			'Adultos mayores',
			'Menores de edad',
			'Viajes y trabajo de campo'
		]
	}
];

/** Índice del producto por id; -1 si no existe. */
export function productIndex(id) {
	return products.findIndex((p) => p.id === id);
}

/**
 * Id del producto vecino, con envolvente. `step` es +1 o -1.
 * Sustituye al ternario binario que hacía inalcanzable el tercer producto.
 */
export function neighborProduct(id, step) {
	const i = productIndex(id);
	if (i === -1) return products[0].id;
	return products[(i + step + products.length) % products.length].id;
}
