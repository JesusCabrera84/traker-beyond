import { buildApiUrl, API_CONFIG } from '$lib/config/api.js';

/**
 * Envío de contacto: validación, saneado, reCAPTCHA y llamada al API.
 *
 * Vive aquí y no dentro de una página porque hay DOS formularios —el de la
 * landing y el del diagnóstico en servicios— y solo puede haber una copia de
 * estas reglas. Duplicarlas es cómo un sitio acaba con un formulario que valida
 * el teléfono y otro que no, o con uno que perdió el token de reCAPTCHA en un
 * refactor y nadie se enteró hasta que llegó el spam.
 *
 * El MARCADO sí es de cada página: la landing y servicios tienen lenguajes
 * visuales distintos, y un componente único acabaría con más props de estilo que
 * campos. Lo que se comparte es la lógica, que es lo que duele cuando diverge.
 */

/**
 * Saneado del texto que escribe el visitante. Depende de `document`, así que
 * solo corre en el navegador — y solo se llama al enviar, nunca en render.
 */
export function sanearTexto(entrada) {
	if (!entrada) return '';
	// El nodo de texto hace el trabajo pesado: cualquier etiqueta queda escapada
	// al leerla de vuelta como innerHTML.
	const div = document.createElement('div');
	div.textContent = entrada;
	return div.innerHTML
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;');
}

export function correoValido(correo) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

/** Entre 7 y 20 dígitos, ignorando espacios, guiones y paréntesis. */
export function telefonoValido(telefono) {
	const digitos = telefono.replace(/\D/g, '');
	return digitos.length >= 7 && digitos.length <= 20;
}

export const LIMITE_NOMBRE = 200;
export const LIMITE_MENSAJE = 5000;

/**
 * Valida los cuatro campos y devuelve los errores por campo.
 *
 * La regla que no es obvia: correo y teléfono son opcionales por separado pero
 * obligatorios en conjunto. Sin al menos uno de los dos no hay forma de
 * responderle a quien escribió, y el mensaje se pierde.
 */
export function validarContacto(datos) {
	const errores = { nombre: '', correo_electronico: '', telefono: '', mensaje: '', general: '' };

	if (!datos.nombre.trim()) {
		errores.nombre = 'El nombre es requerido';
	} else if (datos.nombre.length > LIMITE_NOMBRE) {
		errores.nombre = `El nombre no puede exceder los ${LIMITE_NOMBRE} caracteres`;
	}

	if (!datos.mensaje.trim()) {
		errores.mensaje = 'El mensaje es requerido';
	} else if (datos.mensaje.length > LIMITE_MENSAJE) {
		errores.mensaje = `El mensaje no puede exceder los ${LIMITE_MENSAJE} caracteres`;
	}

	const hayCorreo = datos.correo_electronico.trim().length > 0;
	const hayTelefono = datos.telefono.trim().length > 0;

	if (!hayCorreo && !hayTelefono) {
		errores.general = 'Debes proporcionar al menos un correo electrónico o teléfono';
	}
	if (hayCorreo && !correoValido(datos.correo_electronico)) {
		errores.correo_electronico = 'El formato del correo electrónico no es válido';
	}
	if (hayTelefono && !telefonoValido(datos.telefono)) {
		errores.telefono = 'El teléfono debe contener entre 7 y 20 dígitos';
	}

	return { valido: Object.values(errores).every((e) => !e), errores };
}

export const claveRecaptcha = () => import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/** Inyecta el script de reCAPTCHA una sola vez por documento. */
export function cargarRecaptcha(clave = claveRecaptcha()) {
	if (!clave || typeof document === 'undefined') return;
	if (document.querySelector('script[src*="recaptcha"]')) return;

	const script = document.createElement('script');
	script.src = `https://www.google.com/recaptcha/api.js?render=${clave}`;
	script.async = true;
	script.defer = true;
	document.head.appendChild(script);
}

export async function tokenRecaptcha(accion = 'submit', clave = claveRecaptcha()) {
	if (!clave || !window.grecaptcha) {
		console.warn('reCAPTCHA no está configurado o no se ha cargado');
		return null;
	}
	try {
		await window.grecaptcha.ready(() => {});
		return await window.grecaptcha.execute(clave, { action: accion });
	} catch (error) {
		console.error('Error al generar token de reCAPTCHA:', error);
		return null;
	}
}

/**
 * Sanea, adjunta el token y envía. Devuelve `{ ok, mensaje }` para que cada
 * formulario lo pinte en su propio lenguaje.
 *
 * `contexto` se antepone al mensaje en vez de ir como campo aparte: el contrato
 * del API no es nuestro para extenderlo desde el front, y un campo desconocido
 * podría rebotar el envío entero. Anteponerlo hace que quien contesta vea de
 * dónde viene sin que nada más cambie.
 */
export async function enviarContacto(datos, { accion = 'contact_form', contexto = '' } = {}) {
	const cuerpo = {
		nombre: sanearTexto(datos.nombre.trim()),
		mensaje: sanearTexto((contexto ? `[${contexto}] ` : '') + datos.mensaje.trim())
	};
	if (datos.correo_electronico.trim()) {
		cuerpo.correo_electronico = sanearTexto(datos.correo_electronico.trim());
	}
	if (datos.telefono.trim()) {
		cuerpo.telefono = sanearTexto(datos.telefono.trim());
	}

	const clave = claveRecaptcha();
	const token = await tokenRecaptcha(accion, clave);
	if (token) {
		cuerpo.recaptcha_token = token;
	} else if (clave) {
		// Configurado pero fallido: enviar sin token dejaría pasar spam que el
		// servidor cree verificado.
		return { ok: false, mensaje: 'Error al verificar reCAPTCHA. Por favor, intenta nuevamente.' };
	}

	try {
		const respuesta = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SEND_CONTACT_MESSAGE), {
			method: 'POST',
			headers: API_CONFIG.DEFAULT_HEADERS,
			body: JSON.stringify(cuerpo)
		});
		const resultado = await respuesta.json();

		return respuesta.ok
			? { ok: true, mensaje: resultado.message || 'Mensaje enviado exitosamente' }
			: {
					ok: false,
					mensaje: resultado.message || 'Error al enviar el mensaje. Por favor, intenta nuevamente.'
				};
	} catch (error) {
		console.error('Error al enviar mensaje:', error);
		return {
			ok: false,
			mensaje: 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.'
		};
	}
}
