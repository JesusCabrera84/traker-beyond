import { nexusModels } from './nexusModels.js';

/**
 * Catálogo de productos de la landing.
 *
 * El orden importa: Orion va en medio a propósito. Su plata acromática separa
 * el verde de Nexus del rojo de Signum, que son complementarios y vibrarían si
 * quedaran adyacentes en el rail.
 *
 * `rail` es el descriptor funcional que se muestra bajo el nombre y `audience`
 * el "para quién". No son decorativos: un visitante que solo lea el rail y
 * nunca abra el panel debe saber qué son los tres productos y cuál es el suyo.
 *
 * Los campos del panel responden, en orden, a las preguntas que el visitante se
 * hace: qué es (`oneLiner`), si es para él (`problem`), qué tendría que hacer
 * (`howItWorks`), cómo se compra (`models`) y si es real (`proof`). El esquema
 * anterior —subtítulo de 45 palabras y doce chips del mismo peso— respondía
 * bien a ninguna: los tres paneles quedaban con la misma silueta y la sección
 * comunicaba "hay tres cosas parecidas".
 *
 * `models` es un slot fijo en los tres productos y solo varía cuántas píldoras
 * lleva. Ahí es donde SaaS y white-label dejan de ser el chip número once y
 * ocupan el mismo lugar jerárquico que "compra única".
 */
export const products = [
	{
		id: 'nexus',
		name: 'NEXUS',
		rail: 'Rastreo GPS en tiempo real',
		kind: 'Plataforma · SaaS y white-label',
		audience: 'Familias y flotillas',
		oneLiner: 'Dónde está, a dónde fue y cuándo salió de la zona.',
		problem: 'No saber dónde están tus vehículos, tu carga o tu gente.',
		howItWorks: ['Conectas el dispositivo', 'Ves todo en el panel', 'Recibes la alerta'],
		models: nexusModels,
		proof: 'Panel web + apps nativas iOS y Android',
		mark: '/img/products/mark-nexus.webp',
		logo: '/img/logo-nexus-3x.png',
		logoAlt: 'Logotipo de Nexus',
		href: '/products/nexus',
		external: false,
		primaryCta: 'Explorar Nexus',
		secondaryCta: { label: '¿Tienes tu propio hardware?', href: '/products/nexus/partners' }
	},
	{
		id: 'orion',
		name: 'ORION',
		rail: 'API de geolocalización sin GPS',
		kind: 'API · pago por uso',
		audience: 'Desarrolladores e integradores',
		oneLiner: 'Ubica un dispositivo por señal celular, sin GPS a bordo.',
		problem: 'Necesitas ubicar equipos que no traen GPS, o validar que un evento pasó donde dice.',
		howItWorks: ['Envías el Cell ID', 'Recibes coordenadas y radio', 'Enriqueces tu telemetría'],
		models: [
			{
				key: 'consumo',
				label: 'API por consumo',
				axis: 'Pagas lo que consultas',
				line: 'Sin mínimos ni contrato: cada consulta se cobra por separado.',
				tech: 'REST · consultas en tiempo real'
			},
			{
				key: 'volumen',
				label: 'Contrato por volumen',
				axis: 'Pagas por bloque',
				line: 'Tarifa por lote para integraciones que resuelven millones de consultas.',
				tech: 'Procesamiento por lotes · SLA a convenir'
			}
		],
		proof: 'API REST · consultas en tiempo real y por lotes',
		mark: '/img/products/mark-orion.webp',
		logo: '/img/products/logo-orion.png',
		logoAlt: 'Logotipo de Orion',
		href: 'https://orion.geminislabs.com/',
		external: true,
		primaryCta: 'Explorar Orion',
		secondaryCta: null
	},
	{
		id: 'signum',
		name: 'SIGNUM',
		rail: 'Identidad médica de emergencia',
		kind: 'Servicio · compra única',
		audience: 'Motociclistas y outdoor',
		badge: 'Nuevo',
		oneLiner: 'Un QR que habla por ti cuando tú no puedes.',
		problem: 'En un accidente, quien te auxilia no sabe nada de ti.',
		howItWorks: ['Llenas tu ficha', 'Pegas el QR en el casco', 'Quien te auxilia lo escanea'],
		models: [
			{
				key: 'compra-unica',
				label: 'Compra única',
				axis: 'Sin cuenta ni suscripción',
				line: 'Pagas una vez por tu QR. No hay app que instalar ni mensualidad.',
				tech: 'Página pública de 11 KB · etiquetas bilingües ES/EN'
			}
		],
		proof: 'Página de 11 KB · abre con mala señal',
		mark: '/img/products/mark-signum.webp',
		logo: '/img/products/logo-signum.webp',
		logoAlt: 'Logotipo de Signum',
		href: 'https://signum.geminislabs.com/',
		external: true,
		primaryCta: 'Explorar Signum',
		secondaryCta: null
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
