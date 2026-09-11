/**
 * LAS SEIS FIGURAS DEL PANAL
 *
 * Regla de partida, y es lo único que impide que seis dibujos se conviertan en
 * seis clip-arts: NUNCA se dibuja la cosa, se dibuja el CAMBIO DE ESTADO que la
 * capacidad produce. Nada de lupas, nubes, cerebros, abanicos de wifi, engranes
 * ni piezas de puzzle — esos dibujan el sustantivo y no dicen nada que el título
 * no diga ya.
 *
 * Las seis comparten vocabulario: placas de vidrio vistas en escorzo, nodos y
 * trazos. Lo único que cambia es qué ocurre encima de ellas. Así el conjunto se
 * lee como seis estados de un mismo sistema y no como seis iconos sueltos, que
 * es exactamente el argumento de la sección.
 *
 * Van en un viewBox 0–100 y con trazo sin escalar, para que sobrevivan al
 * tamaño al que se dibujan dentro del hexágono (~135 px de lado útil).
 */

/** Placa en escorzo: un rombo achatado, que es el vocabulario del árbol del hero. */
const placa = (cx, cy, ancho, alto = 9) =>
	`M${cx - ancho} ${cy} L${cx} ${cy - alto} L${cx + ancho} ${cy} L${cx} ${cy + alto} Z`;

export const figuras = {
	/*
	 * Una pila de placas con UNA extraída y encendida, y sobre ella un trazo que
	 * se corta antes de llegar al borde.
	 *
	 * El motivo es «sacar la capa que está mal de un sistema que ya existe», que
	 * es la promesa literal. El trazo inacabado dice que el roadmap está
	 * decidido pero todavía no construido, que es justo lo que se compra aquí.
	 */
	'consultoria-estrategia': {
		base: [placa(46, 76, 30), placa(46, 30, 30)],
		vivo: [placa(58, 53, 30)],
		detalle: ['M44 53 H70'],
		nodos: [
			[48, 53],
			[58, 53],
			[68, 53]
		]
	},

	/*
	 * Dos placas a distinta altura con la MISMA huella: abajo una retícula vieja,
	 * arriba la misma superficie redibujada como servicios conectados, y tres
	 * hilos migrando entre ambas.
	 *
	 * El motivo es «el mismo sistema, reconstruido un nivel arriba». Que la
	 * huella coincida es el argumento: se moderniza sin perder nada. Una nube o
	 * un `</>` dirían «escribimos código», que no es lo que se vende.
	 */
	'software-cloud': {
		base: [placa(50, 80, 32)],
		vivo: [placa(50, 26, 32)],
		detalle: [
			'M34 80 H66',
			'M50 72 V88',
			'M38 26 L50 20 L62 26',
			'M38 26 L50 32 L62 26',
			'M40 72 V34',
			'M50 71 V33',
			'M60 72 V34'
		],
		nodos: [
			[38, 26],
			[50, 20],
			[62, 26],
			[50, 32]
		]
	},

	/*
	 * Una placa con muchos puntos apagados y, encima, una placa MÁS PEQUEÑA donde
	 * todo eso se ha resuelto en un solo trazo que termina en un nodo.
	 *
	 * El motivo es «disperso → decisión», que es «decidir con datos, no con
	 * demos». La salida es deliberadamente más chica que la entrada: la respuesta
	 * pesa menos que los datos que hicieron falta para llegar a ella.
	 */
	'ai-data': {
		base: [placa(50, 78, 34)],
		vivo: [placa(50, 30, 18, 6)],
		detalle: ['M38 30 L46 27 L54 32 L62 28'],
		nube: [
			[34, 78],
			[42, 74],
			[42, 82],
			[50, 71],
			[50, 79],
			[50, 86],
			[58, 74],
			[58, 82],
			[66, 78],
			[46, 78],
			[62, 78]
		],
		nodos: [[62, 28]]
	},

	/*
	 * Una placa con un componente pequeño encima y un arco de anillos que salen
	 * hacia arriba DECRECIENDO.
	 *
	 * Decrecen, y no al revés, porque el dibujo está hecho desde el punto de
	 * vista del dispositivo: una cosa pequeña en un sitio malo hablando hacia
	 * arriba. Ese punto de vista es el argumento entero de esta capacidad —«desde
	 * donde pasa el trabajo»— y un abanico de wifi creciente lo contaría al revés.
	 */
	'iot-hardware': {
		base: [placa(50, 82, 30)],
		vivo: ['M42 74 H58 V84 H42 Z'],
		detalle: [
			'M44 74 V70',
			'M50 74 V68',
			'M56 74 V70',
			'M32 62 A22 16 0 0 1 68 62',
			'M38 50 A15 11 0 0 1 62 50',
			'M43 40 A9 7 0 0 1 57 40',
			'M47 32 A4 3 0 0 1 53 32'
		],
		nodos: [[50, 28]]
	},

	/*
	 * La placa como piso de planta: tres huellas de máquina DISTINTAS en fila,
	 * cada una con un vástago que sube a UNA MISMA barra, y una marca de lectura
	 * sobre ella.
	 *
	 * El motivo es «máquinas heterogéneas resueltas sobre una sola línea de
	 * medición» — que la planta se mida sola. Un engrane diría mecánica; esta
	 * capacidad es integración, así que lo que hay que dibujar es la JUNTURA y no
	 * la maquinaria. Que las tres huellas sean distintas es parte del argumento.
	 */
	'industria-automatizacion': {
		base: [placa(50, 84, 34)],
		vivo: ['M28 40 H72'],
		detalle: [
			'M32 78 H42 V84 H32 Z',
			'M46 76 L54 76 L56 84 L44 84 Z',
			'M60 79 A5 5 0 1 1 70 79 A5 5 0 1 1 60 79',
			'M37 78 V40',
			'M50 76 V40',
			'M65 74 V40',
			'M44 40 L50 32 L56 40'
		],
		nodos: [
			[37, 40],
			[50, 40],
			[65, 40]
		]
	},

	/*
	 * Las cinco anteriores en pequeño, apiladas, atravesadas por UN SOLO hilo
	 * vertical limpio de abajo arriba, sin cortes.
	 *
	 * «Nadie se echa la culpa entre proveedores» es una afirmación sobre la
	 * AUSENCIA DE JUNTAS, así que el argumento entero del dibujo es que el hilo no
	 * se interrumpe. Un puzzle o un apretón de manos dirían colaboración, que es
	 * lo contrario de lo que se promete: aquí no hay dos partes que colaboren,
	 * hay una sola.
	 */
	'soluciones-integrales': {
		base: [placa(50, 22, 20, 6), placa(50, 53, 20, 6), placa(50, 84, 20, 6)],
		vivo: [placa(50, 37, 24, 7), placa(50, 68, 24, 7)],
		detalle: ['M50 12 V94'],
		nodos: [
			[50, 22],
			[50, 37],
			[50, 53],
			[50, 68],
			[50, 84]
		]
	}
};
