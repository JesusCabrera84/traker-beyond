/**
 * Capacidades de ingeniería y consultoría.
 *
 * El documento fuente lista trece áreas. Mostrarlas todas en la navegación
 * convierte la oferta en un catálogo que nadie lee, así que se agrupan en seis
 * capacidades y el detalle vive dentro de cada una.
 *
 * `promise` está escrita en lenguaje de cliente, no de ingeniero: es lo que el
 * visitante tiene que entender sin saber qué es Kafka. Las tecnologías concretas
 * van en `chips`, que es el nivel al que un comprador técnico baja después.
 *
 * `entrada` dice cómo ARRANCA el trabajo, no cuánto cuesta. El documento fuente
 * no fija precios ni modalidades de contratación, y publicar cifras inventadas
 * comprometería a la empresa. Cuando existan, el campo natural es `precio` y va
 * junto a `entrada`.
 */
export const services = [
	{
		slug: 'consultoria-estrategia',
		num: '01',
		title: 'Consultoría & Estrategia',
		promise:
			'Te decimos qué está mal, qué construir primero y cuánto va a costar, antes de que gastes.',
		chips: ['Diagnóstico', 'Arquitectura', 'Roadmap', 'CTO as a Service', 'Due diligence técnica'],
		detail: {
			intro:
				'Muchas organizaciones no necesitan que alguien escriba código todavía. Necesitan que alguien mire lo que ya tienen y diga qué está mal, qué se puede salvar y en qué orden conviene moverse. Ese trabajo se cobra aparte y se entrega aparte: es tuyo, contrates lo que sigue con nosotros o no.',
			groups: [
				{
					title: 'Arquitectura de sistemas',
					items: [
						'Diseño de arquitecturas de software',
						'Sistemas distribuidos',
						'Arquitecturas orientadas a eventos',
						'Microservicios',
						'Sistemas de tiempo real',
						'APIs y servicios backend',
						'Alta disponibilidad y escalabilidad',
						'Arquitecturas multi-tenant',
						'SaaS y PaaS',
						'Integración de sistemas existentes'
					]
				},
				{
					title: 'Auditoría y diagnóstico',
					items: [
						'Auditoría de arquitectura',
						'Auditoría de infraestructura',
						'Evaluación cloud',
						'Evaluación de escalabilidad',
						'Revisión de código',
						'Evaluación de seguridad',
						'Análisis de costos',
						'Diagnóstico de rendimiento',
						'Evaluación de estrategia de datos e IA',
						'Technical due diligence'
					]
				},
				{
					title: 'Acompañamiento tecnológico',
					items: [
						'CTO externo / Fractional CTO',
						'Definición de estrategia tecnológica',
						'Evaluación de proveedores',
						'Selección de tecnologías',
						'Planeación de proyectos y roadmaps',
						'Evaluación de propuestas técnicas',
						'Supervisión técnica de proveedores',
						'Acompañamiento en la contratación de equipos'
					]
				}
			]
		},
		entrada: 'Empieza con un diagnóstico'
	},
	{
		slug: 'software-cloud',
		num: '02',
		title: 'Software & Cloud',
		promise:
			'Construimos y modernizamos plataformas que aguantan crecer, sin que se caigan un martes.',
		chips: [
			'Plataformas web',
			'APIs y backend',
			'Sistemas distribuidos',
			'DevOps',
			'Migración a cloud',
			'Observabilidad'
		],
		detail: {
			intro:
				'A veces no hace falta una aplicación nueva: hace falta que la que ya tienes deje de ser el cuello de botella. Evaluamos si conviene modernizar o rehacer, y luego lo hacemos — con la infraestructura, los despliegues y la observabilidad que hacen que siga en pie después de que nos vayamos.',
			groups: [
				{
					title: 'Desarrollo',
					items: [
						'Plataformas web',
						'Aplicaciones móviles',
						'Backend y APIs',
						'Dashboards operativos',
						'Sistemas administrativos',
						'Plataformas B2B y B2C',
						'Sistemas internos',
						'Integraciones con ERP, CRM y terceros'
					]
				},
				{
					title: 'Modernización',
					items: [
						'Evaluación de sistemas existentes',
						'Modernización de sistemas legacy',
						'Migración de monolitos',
						'Migración hacia cloud',
						'Rediseño de arquitectura',
						'Reducción de deuda técnica',
						'Diagnóstico de rendimiento y escalabilidad'
					]
				},
				{
					title: 'Cloud e infraestructura',
					items: [
						'Diseño de infraestructura cloud',
						'Arquitecturas híbridas',
						'Contenedores',
						'Alta disponibilidad',
						'Disaster recovery',
						'Optimización de costos cloud'
					]
				},
				{
					title: 'DevOps y observabilidad',
					items: [
						'CI/CD',
						'Docker y containerización',
						'Infrastructure as Code',
						'Automatización de despliegues',
						'Ambientes de desarrollo, staging y producción',
						'Logging centralizado',
						'Métricas y alertamiento',
						'Diagnóstico de sistemas distribuidos'
					]
				},
				{
					title: 'Seguridad',
					items: [
						'Security by Design',
						'Arquitecturas seguras',
						'IAM',
						'Gestión de secretos',
						'Seguridad cloud',
						'Seguridad de APIs',
						'Hardening',
						'Estrategias de respaldo y recuperación',
						'Observabilidad de seguridad'
					]
				}
			],
			nota: 'No ofrecemos pentesting ni red team. Son especialidades que requieren un equipo dedicado, y preferimos decirlo antes que venderlo.'
		},
		entrada: 'Empieza con una evaluación del sistema actual'
	},
	{
		slug: 'ai-data',
		num: '03',
		title: 'IA & Datos',
		promise:
			'IA aplicada a tu operación real: automatizar procesos, ordenar información y decidir con datos, no con demos.',
		chips: [
			'Casos de uso y viabilidad',
			'Agentes de IA',
			'RAG y búsqueda semántica',
			'Pipelines de datos',
			'Streaming de eventos',
			'Tiempo real'
		],
		detail: {
			intro:
				'La pregunta no es si se puede meter IA. Es si tus datos aguantan lo que quieres hacer con ellos, y si el caso de uso devuelve más de lo que cuesta. Empezamos por ahí, no por el modelo.',
			groups: [
				{
					title: 'AI Engineering',
					items: [
						'Identificación de casos de uso',
						'Evaluación de viabilidad y ROI',
						'Integración de modelos de lenguaje',
						'RAG y búsqueda semántica',
						'Automatización inteligente',
						'Procesamiento y clasificación de información',
						'Sistemas de recomendación',
						'Computer Vision cuando aplique'
					]
				},
				{
					title: 'Agentic AI',
					items: [
						'Diseño de agentes de IA',
						'Sistemas multiagente',
						'Agentes conectados con herramientas y APIs',
						'Human-in-the-loop',
						'Memoria y contexto',
						'Orquestación de agentes',
						'Evaluación y observabilidad de agentes',
						'Integración con sistemas empresariales'
					]
				},
				{
					title: 'Data Engineering',
					items: [
						'Diseño de pipelines de datos',
						'Procesamiento en tiempo real',
						'Streaming de eventos',
						'ETL y ELT',
						'Integración de fuentes de datos',
						'Almacenamiento de series temporales',
						'Data APIs'
					]
				},
				{
					title: 'Sistemas en tiempo real',
					items: [
						'Kafka y event streaming',
						'Telemetría',
						'Procesamiento de eventos',
						'Geoprocesamiento',
						'Tracking',
						'Sistemas de alertamiento',
						'Sistemas basados en ubicación',
						'Procesamiento masivo de dispositivos'
					]
				}
			]
		},
		entrada: 'Empieza con un PoC'
	},
	{
		slug: 'iot-hardware',
		num: '04',
		title: 'IoT & Hardware',
		promise:
			'Dispositivos, sensores y conectividad que mandan datos confiables desde donde pasa el trabajo.',
		chips: [
			'Arquitectura device → cloud',
			'Sensores y gateways',
			'Firmware y embebidos',
			'LoRaWAN',
			'MQTT',
			'GPS/GNSS',
			'NFC/RFID',
			'Edge computing'
		],
		detail: {
			intro:
				'Un dispositivo que manda datos malos es peor que no tener dispositivo. Diseñamos la cadena completa —sensor, conectividad, protocolo, ingesta— y antes de eso te ayudamos a responder si de verdad necesitas hardware propio.',
			groups: [
				{
					title: 'IoT',
					items: [
						'Diseño de soluciones IoT',
						'Arquitectura device → cloud',
						'Telemetría',
						'Sensores y gateways',
						'Protocolos de comunicación',
						'MQTT',
						'Redes celulares',
						'LoRaWAN',
						'Wi-Fi y BLE',
						'GPS/GNSS',
						'NFC/RFID',
						'Edge computing',
						'Administración remota de dispositivos'
					]
				},
				{
					title: 'Plataformas IoT',
					items: [
						'Device management',
						'Dashboards',
						'Alertas',
						'Recolección de telemetría',
						'Procesamiento en tiempo real',
						'Geolocalización',
						'Analítica',
						'Automatización basada en eventos'
					]
				},
				{
					title: 'Hardware y embebidos',
					items: [
						'Selección de componentes',
						'Diseño conceptual de dispositivos',
						'Arquitectura electrónica',
						'Prototipado',
						'Integración de sensores',
						'Sistemas embebidos',
						'Firmware',
						'Comunicación dispositivo-servidor',
						'Integración hardware/software'
					]
				},
				{
					title: 'Build vs Buy',
					items: [
						'Costo',
						'Tiempo de desarrollo',
						'Escalabilidad',
						'Mantenimiento',
						'Disponibilidad de componentes',
						'Integración',
						'Riesgo tecnológico'
					]
				}
			],
			nota: '«¿Debemos desarrollar hardware propio o integrar tecnología existente?» Es una consultoría que se contrata sola, independiente de que después construyamos el dispositivo o no.'
		},
		entrada: 'Empieza resolviendo build vs buy'
	},
	{
		slug: 'industria-automatizacion',
		num: '05',
		title: 'Industria & Automatización',
		promise: 'Conectamos máquinas, personas, procesos y software para que la planta se mida sola.',
		chips: [
			'Digitalización de procesos',
			'Monitoreo de maquinaria',
			'Integración OT/IT',
			'Trazabilidad',
			'Computer Vision',
			'Integración ERP/MES'
		],
		detail: {
			intro:
				'Conectamos máquinas, personas, procesos y software. En el Bajío y en Querétaro esto casi siempre empieza igual: una operación que ya funciona pero que se mide a mano, en papel o en una hoja de cálculo que solo entiende una persona.',
			groups: [
				{
					title: 'Captura y monitoreo',
					items: [
						'Digitalización de procesos',
						'Captura automática de datos',
						'Monitoreo de maquinaria',
						'Telemetría industrial',
						'Trazabilidad',
						'RFID y NFC'
					]
				},
				{
					title: 'Integración',
					items: [
						'Integración OT/IT',
						'Integración con ERP y MES',
						'Automatización de procesos',
						'Edge computing'
					]
				},
				{
					title: 'Decisión',
					items: [
						'Dashboards operativos',
						'Alertamiento',
						'Mantenimiento basado en datos',
						'Analítica operacional',
						'Computer Vision'
					]
				}
			]
		},
		entrada: 'Empieza con un recorrido de planta'
	},
	{
		slug: 'soluciones-integrales',
		num: '06',
		title: 'Soluciones Integrales',
		promise: 'Un solo proveedor del sensor al dashboard: nadie se echa la culpa entre proveedores.',
		chips: ['Hardware', 'Conectividad', 'Software', 'Cloud', 'Datos', 'IA', 'Operación'],
		detail: {
			intro:
				'La diferencia no es que hagamos hardware y software. Es que podemos analizar y diseñar el sistema entero, y eso te evita coordinar a cinco proveedores que se echan la culpa entre ellos cuando algo no funciona.',
			groups: [
				{
					title: '«Necesito saber dónde están mis activos y cuándo salen de una zona»',
					items: [
						'Dispositivo',
						'Conectividad',
						'Protocolo',
						'Backend',
						'Streaming',
						'Base de datos',
						'Geoprocesamiento',
						'Alertas',
						'Dashboard',
						'Aplicación',
						'Infraestructura',
						'Operación'
					]
				},
				{
					title: '«Quiero medir las condiciones de mis cultivos»',
					items: [
						'Sensores',
						'LoRaWAN',
						'Gateway',
						'Edge',
						'Cloud',
						'Plataforma',
						'Datos',
						'IA',
						'Alertas',
						'Automatización'
					]
				}
			],
			nota: 'Nexus es la prueba de que esta cadena la hemos recorrido completa, no en una lámina: dispositivo, conectividad, streaming, geoproceso, alertas, panel, apps e infraestructura, en producción.'
		},
		entrada: 'Empieza contándonos el problema'
	}
];

/**
 * El flujo que se muestra como riel de proceso encima de las capacidades.
 * Es una secuencia real, no una decoración: por eso va numerada y en orden.
 */
export const processSteps = [
	{
		key: 'entendemos',
		label: 'Entendemos',
		short: 'Tu problema',
		desc: 'Qué problema hay debajo de lo que nos pides.'
	},
	{
		key: 'disenamos',
		label: 'Diseñamos',
		short: 'Plan claro',
		desc: 'La arquitectura y el camino, antes de escribir código.'
	},
	{
		key: 'construimos',
		label: 'Construimos',
		short: 'Tecnología real',
		desc: 'Software, hardware e infraestructura.'
	},
	{
		key: 'integramos',
		label: 'Integramos',
		short: 'Con lo que ya tienes',
		desc: 'Con lo que ya tienes funcionando.'
	},
	{
		key: 'operamos',
		label: 'Operamos',
		short: 'En producción',
		desc: 'Y lo mantenemos en producción.'
	}
];

/** Capacidad por slug; `undefined` si no existe. */
export function service(slug) {
	return services.find((s) => s.slug === slug);
}

/**
 * Etiquetas sobre la ilustración de la sección de servicios en la landing.
 *
 * Los rótulos viven en la banda vacía que queda SOBRE la silueta de la escena
 * isométrica, nunca encima del dibujo: `x`/`labelY` colocan el anillo y la línea
 * es la que baja a buscar el elemento, hasta `y`.
 *
 * Los `labelY` no son a ojo. La silueta de la ilustración se midió columna a
 * columna sobre el propio archivo (primera fila con contenido, en % del alto):
 *
 *   x   10%  18%  26%  34%  42%  50%  58%  66%  74%  82%  90%
 *   y   45   35   31   36   31   27   25   19   16    7   13
 *
 * Cada rótulo ocupa ~15% del ancho y ~10% del alto, así que su `labelY` se fija
 * para que el borde inferior quede 1.5% por encima del punto más alto de la
 * silueta en TODO el rango horizontal que cubre. Si cambias un texto y crece de
 * línea, hay que rebajar su `labelY` en la misma proporción.
 *
 * Los anclajes van cada 16 puntos y el rótulo mide 14, así que tampoco se tocan
 * en horizontal a ningún ancho al que se muestre esta versión (>1200px).
 */
export const scenePins = [
	{
		title: 'Hardware & IoT',
		desc: 'Dispositivos, sensores y conectividad',
		x: 11,
		labelY: 11,
		y: 46
	},
	{
		title: 'Datos',
		desc: 'Ingesta, procesamiento y almacenamiento',
		x: 27,
		labelY: 5,
		y: 42
	},
	{
		title: 'Infraestructura & Cloud',
		desc: 'Escalable, segura y confiable',
		x: 43,
		labelY: -1,
		y: 38
	},
	{
		title: 'IA & Analítica',
		desc: 'Modelos, automatización y decisiones',
		x: 59,
		labelY: -7,
		y: 30
	},
	{
		title: 'Aplicaciones',
		desc: 'Dashboards, APIs y experiencias',
		x: 75,
		labelY: -13,
		y: 20
	}
];
