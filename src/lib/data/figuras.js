/**
 * LAS SEIS FIGURAS DEL PANAL
 *
 * Regla de fondo: NUNCA se dibuja la cosa, se dibuja el CAMBIO DE ESTADO que la
 * capacidad produce. Nada de lupas, nubes, cerebros, abanicos de wifi, engranes
 * ni piezas de puzzle: esos dibujan el sustantivo y no dicen nada que el título
 * no diga ya.
 *
 * Regla de forma, que es la que faltaba en el primer intento: a 130 px la LÍNEA
 * NO EXISTE. La primera versión eran diagramas de trazo fino al 30-45% de
 * opacidad y se leían como garabatos tenues, además de parecerse entre sí por
 * compartir vocabulario. Aquí manda la MASA: pocas piezas, rellenas, con
 * silueta distinta cada una. Lo que sobrevive al tamaño pequeño es el bulto, no
 * el detalle.
 *
 * Cada figura tiene dos planos y nada más: `fondo` es el sistema como está —
 * apagado, sin protagonismo— y `figura` es lo que la capacidad aporta, relleno
 * y al color de su celda. Al encenderse solo sube lo segundo, así que el dibujo
 * dice algo en vez de brillar más.
 */

/** Placa en escorzo: el rombo achatado del vocabulario del hero. */
const placa = (cx, cy, ancho, alto) =>
	`M${cx - ancho} ${cy} L${cx} ${cy - alto} L${cx + ancho} ${cy} L${cx} ${cy + alto} Z`;

export const figuras = {
	/*
	 * Una pila de tres placas con la del medio EXTRAÍDA y encendida.
	 * Sacar la capa que está mal de un sistema que ya existe.
	 */
	'consultoria-estrategia': {
		fondo: [placa(46, 76, 30, 11), placa(46, 30, 30, 11)],
		figura: [placa(60, 53, 30, 11)]
	},

	/*
	 * Dos placas con la MISMA huella a distinta altura, unidas por tres columnas
	 * gruesas. El mismo sistema, reconstruido un nivel arriba: que la huella
	 * coincida es el argumento, porque no se pierde nada al modernizar.
	 */
	'software-cloud': {
		fondo: [placa(50, 82, 32, 12)],
		figura: [placa(50, 26, 32, 12), 'M36 76 V32', 'M50 82 V26', 'M64 76 V32']
	},

	/*
	 * Una placa cargada de puntos y, encima, UN solo bloque pequeño y macizo.
	 * Disperso → decisión. La salida es deliberadamente más chica que la
	 * entrada: la respuesta pesa menos que los datos que hicieron falta.
	 */
	'ai-data': {
		fondo: [placa(50, 78, 34, 12)],
		figura: [placa(50, 30, 15, 10)],
		polvo: [
			[32, 78],
			[41, 72],
			[41, 84],
			[50, 68],
			[50, 78],
			[50, 88],
			[59, 72],
			[59, 84],
			[68, 78]
		]
	},

	/*
	 * Un bloque macizo abajo y tres arcos gruesos que salen DECRECIENDO hacia
	 * arriba. Decrecen porque el dibujo está hecho desde el punto de vista del
	 * dispositivo —una cosa pequeña en un sitio malo, hablando hacia arriba— y
	 * ese punto de vista es el argumento entero de esta capacidad.
	 */
	'iot-hardware': {
		fondo: [placa(50, 84, 30, 11)],
		figura: [
			'M40 72 H60 V84 H40 Z',
			'M30 62 A24 18 0 0 1 70 62',
			'M37 48 A16 12 0 0 1 63 48',
			'M44 36 A8 6 0 0 1 56 36'
		]
	},

	/*
	 * Tres bloques DISTINTOS en fila, cada uno con una columna que sube a UNA
	 * MISMA barra gruesa. Máquinas heterogéneas resueltas sobre una sola línea de
	 * medición. Un engrane diría mecánica; esta capacidad es integración, así que
	 * lo que hay que enseñar es la juntura y no la maquinaria.
	 */
	'industria-automatizacion': {
		fondo: [
			placa(50, 86, 34, 11),
			'M30 74 H42 V82 H30 Z',
			'M46 70 H56 V82 H46 Z',
			'M62 76 H72 V82 H62 Z'
		],
		figura: ['M26 40 H74 V50 H26 Z', 'M36 74 V50', 'M51 70 V50', 'M67 76 V50']
	},

	/*
	 * Cinco placas macizas atravesadas por UN SOLO eje grueso, limpio de abajo
	 * arriba y sin cortes. «Nadie se echa la culpa entre proveedores» es una
	 * afirmación sobre la AUSENCIA DE JUNTAS: el argumento entero del dibujo es
	 * que el eje no se interrumpe. Un puzzle o un apretón de manos dirían
	 * colaboración, que es lo contrario de lo que se promete — aquí no hay dos
	 * partes que colaboren, hay una sola.
	 */
	'soluciones-integrales': {
		fondo: [],
		figura: [
			'M50 8 V92',
			placa(50, 20, 19, 7),
			placa(50, 36, 22, 8),
			placa(50, 52, 25, 9),
			placa(50, 68, 22, 8),
			placa(50, 84, 19, 7)
		]
	}
};
