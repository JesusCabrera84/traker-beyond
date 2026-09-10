/**
 * Las tres formas de tener Nexus.
 *
 * Fuente única: la leen la tarjeta de producto de la landing, la sección de
 * partners de `/products/nexus` y la página `/products/nexus/partners`. El
 * contenido vive en dos páginas a propósito —no se le hace cirugía a la página
 * de Nexus, que está convirtiendo— así que el único modo de que las dos no se
 * contradigan dentro de tres meses es que lean de aquí.
 *
 * Sobre los nombres: `label` es el gancho comercial y `tech` el término técnico.
 * Van separados porque las tres modalidades son SaaS —también la suscripción
 * familiar—, así que etiquetar solo a Connect como "SaaS" se lee impreciso ante
 * un comprador técnico. Lo que de verdad las distingue es `axis`: qué pone el
 * cliente.
 */
export const nexusModels = [
	{
		key: 'suscripcion',
		label: 'Nexus',
		axis: 'Nosotros ponemos todo',
		line: 'Compras el equipo, pagas la plataforma al mes. Sin integrar nada.',
		tech: 'Suscripción SaaS · familias y flotillas',
		bullets: [
			'Ubicación en tiempo real',
			'Geocercas y alertas',
			'Historial de recorridos',
			'App iOS y Android incluida'
		],
		cta: { label: 'Ver planes', href: '/#contacto' }
	},
	{
		key: 'connect',
		label: 'Nexus Connect',
		axis: 'Tú pones el hardware',
		line: 'Conectas tus dispositivos por TCP, MQTT o REST a nuestra infraestructura.',
		tech: 'SaaS multi-tenant · TaaS (Telemetry as a Service)',
		bullets: [
			'TCP, MQTT y REST API',
			'Webhooks hacia tus sistemas',
			'Panel multi-cuenta',
			'Onboarding técnico incluido'
		],
		cta: { label: 'Ver protocolos soportados', href: '/products/nexus/partners' }
	},
	{
		key: 'white-label',
		label: 'Nexus Platform',
		axis: 'Tú pones la marca',
		line: 'La plataforma con tu marca, tu dominio y tus planes. Tus clientes, tu facturación.',
		tech: 'White-label sobre la misma infraestructura',
		bullets: [
			'Tu logotipo y tu paleta',
			'Dominio propio',
			'Tus planes y tus precios',
			'Ingeniería mantenida por nosotros'
		],
		cta: { label: 'Hablar con el equipo de partners', href: '/products/nexus/partners' }
	}
];

/** Modalidad por clave; `undefined` si no existe. */
export function nexusModel(key) {
	return nexusModels.find((m) => m.key === key);
}

/**
 * Las modalidades que se venden a partners: hardware propio y marca propia.
 * Es lo que vive en `/products/nexus/partners` y en la tarjeta de partners.
 */
export const partnerModels = nexusModels.filter((m) => m.key !== 'suscripcion');
