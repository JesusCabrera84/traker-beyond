// GENERADO AUTOMÁTICAMENTE — NO EDITAR A MANO.
//
// La fuente única de estos textos es el generador de documentos legales; de ahí
// salen también los .docx de `docs/legal/` que revisa el abogado. Editar aquí
// hace que la página publicada y el documento revisado digan cosas distintas,
// que es exactamente el problema que este generador existe para evitar.

export const doc = {
	slug: 'cookies',
	titulo: 'Política de Cookies',
	descripcion:
		'Política de Cookies de Geminis Labs. Qué almacenamos en tu navegador en NEXUS y Signum, con qué finalidad y cómo eliminarlo. Sin analítica ni publicidad.',
	actualizado: '6 de agosto de 2026',
	intro: [
		{
			t: 'p',
			text: 'Esta política describe las cookies y demás tecnologías de almacenamiento que utilizan las plataformas de Geminis Labs, su finalidad, su duración y la forma de gestionarlas.'
		},
		{
			t: 'accept',
			text: 'Las plataformas de Geminis Labs no utilizan cookies de analítica, publicidad ni perfilamiento. Todo el almacenamiento es técnico o de preferencias configuradas por el propio usuario.'
		}
	],
	secciones: [
		{
			id: 'responsable',
			num: '01',
			titulo: 'Responsable',
			blocks: [
				{
					t: 'table',
					head: ['Dato', 'Información'],
					rows: [
						['Razón social', '[RAZÓN SOCIAL COMPLETA, S.A. DE C.V. / S. DE R.L. DE C.V.]'],
						['Nombre comercial', 'Geminis Labs'],
						['R.F.C.', '[REGISTRO FEDERAL DE CONTRIBUYENTES]'],
						[
							'Domicilio fiscal',
							'[CALLE Y NÚMERO, COLONIA, ALCALDÍA/MUNICIPIO, C.P., ENTIDAD FEDERATIVA, MÉXICO]'
						],
						['Correo de contacto', 'contacto@geminislabs.com'],
						['Asuntos de privacidad', 'privacidad@geminislabs.com']
					]
				}
			]
		},
		{
			id: 'marco',
			num: '02',
			titulo: 'Marco normativo',
			blocks: [
				{
					t: 'ul',
					items: [
						'**LFPDPPP**, publicada en el DOF el 20 de marzo de 2025 y en vigor desde el 21 de marzo de 2025.',
						'**Reglamento de la LFPDPPP** (DOF 21/12/2011), aplicable supletoriamente en lo que no contravenga la ley vigente.',
						'**Lineamientos del Aviso de Privacidad** (DOF 17/01/2013), que regulan el uso de mecanismos en medios remotos o locales de comunicación electrónica —cookies, web beacons y análogos—.'
					]
				},
				{
					t: 'p',
					text: 'La autoridad competente es la **Secretaría Anticorrupción y Buen Gobierno**, que asumió las atribuciones del extinto INAI tras la reforma constitucional de diciembre de 2024.'
				}
			]
		},
		{
			id: 'que-son',
			num: '03',
			titulo: 'Qué son y qué alcanza esta política',
			blocks: [
				{
					t: 'p',
					text: 'Una **cookie** es un archivo que un sitio descarga en el equipo del usuario para almacenar información recuperable posteriormente. La normativa mexicana no se limita a las cookies: alcanza a **cualquier mecanismo que recabe información de manera automática y simultánea** al contacto del titular con el medio. Por ello esta política cubre también:'
				},
				{
					t: 'ul',
					items: [
						'**localStorage**: almacenamiento persistente en el navegador, que **no se envía automáticamente al servidor** en cada petición.',
						'**sessionStorage**: equivalente pero volátil; **se borra al cerrar la pestaña o el navegador**.',
						'**Cookies de terceros** establecidas por proveedores externos integrados en las plataformas.'
					]
				}
			]
		},
		{
			id: 'declaracion',
			num: '04',
			titulo: 'Declaración general',
			blocks: [
				{
					t: 'ul',
					items: [
						'Las plataformas de Geminis Labs **no utilizan cookies ni almacenamiento propio con fines publicitarios, de perfilamiento comercial ni de publicidad conductual**.',
						'**No se incorporan herramientas de analítica web de terceros** (Google Analytics, Google Tag Manager, Meta Pixel, Hotjar u otras equivalentes).',
						'**No se comercializa ni comparte** con terceros la información almacenada en el dispositivo con fines de mercadotecnia.',
						'El almacenamiento es **técnico y estrictamente necesario** para la autenticación y el mantenimiento de la sesión, o responde a **preferencias de personalización** configuradas por el propio usuario.'
					]
				}
			]
		},
		{
			id: 'nexus',
			num: '05',
			titulo: 'NEXUS — almacenamiento utilizado',
			blocks: [
				{
					t: 'h3',
					text: 'Técnico necesario (autenticación y sesión)'
				},
				{
					t: 'p',
					text: '**Indispensable**: permite verificar la identidad, mantener la sesión y evitar reintroducir credenciales. **Su deshabilitación impide el uso del servicio.**'
				},
				{
					t: 'table',
					head: ['Identificador', 'Tecnología', 'Finalidad', 'Duración'],
					rows: [
						[
							'token',
							'localStorage',
							'Token de acceso (JWT) que acredita la sesión autenticada ante las API.',
							'Hasta el cierre de sesión o su expiración'
						],
						[
							'refresh_token',
							'localStorage',
							'Token de renovación que prolonga la sesión sin pedir credenciales.',
							'Hasta el cierre de sesión o su expiración'
						],
						[
							'id_token',
							'localStorage',
							'Token de identidad con los datos identificativos básicos de la cuenta.',
							'Hasta el cierre de sesión o su expiración'
						],
						[
							'token_expires_at',
							'localStorage',
							'Marca de caducidad de la sesión; permite cerrarla automáticamente.',
							'Hasta el cierre de sesión o su expiración'
						],
						[
							'user',
							'localStorage',
							'Datos básicos del perfil autenticado (identificador, nombre, rol).',
							'Hasta el cierre de sesión'
						],
						[
							'nexus-workspace',
							'sessionStorage',
							'Espacio de trabajo o cliente activo durante la navegación.',
							'Sesión'
						]
					]
				},
				{
					t: 'h3',
					text: 'Preferencias y personalización'
				},
				{
					t: 'p',
					text: '**No identifican a personas físicas ni permiten seguimiento.** Su eliminación no impide el uso del servicio: restablece los valores por omisión.'
				},
				{
					t: 'table',
					head: ['Identificador', 'Tecnología', 'Finalidad', 'Duración'],
					rows: [
						[
							'nexus-theme',
							'localStorage',
							'Modo de visualización elegido (claro u oscuro); se lee antes del renderizado para evitar parpadeos.',
							'Persistente'
						],
						[
							'app_theme',
							'localStorage',
							'Preferencia de tema en módulos heredados de la interfaz.',
							'Persistente'
						],
						[
							'nexus_onboarding_complete',
							'localStorage',
							'Indica que el tutorial de bienvenida ya se completó.',
							'Persistente'
						]
					]
				}
			]
		},
		{
			id: 'signum',
			num: '06',
			titulo: 'Signum — cookies utilizadas',
			blocks: [
				{
					t: 'p',
					text: 'Signum instala cookies **únicamente al iniciar sesión**. Todas llevan los atributos httpOnly, secure, sameSite lax y el prefijo __Host-, que las restringe a su propio subdominio e impide compartirlas con el resto de la infraestructura corporativa.'
				},
				{
					t: 'table',
					head: ['Cookie', 'Finalidad', 'Duración'],
					rows: [
						['__Host-signum_session', 'Mantiene la sesión iniciada en el portal.', '30 días'],
						['__Host-signum_admin', 'Mantiene la sesión del panel interno del equipo.', '8 horas']
					]
				},
				{
					t: 'p',
					text: '**La página pública accesible mediante código QR no instala cookie alguna**, no ejecuta JavaScript y no carga recursos de terceros: nadie observa quién consulta una ficha.'
				}
			]
		},
		{
			id: 'terceros',
			num: '07',
			titulo: 'Servicios de terceros',
			blocks: [
				{
					t: 'p',
					text: 'Los siguientes proveedores pueden establecer cookies o acceder a información del dispositivo. **Geminis Labs no controla dichas tecnologías**, regidas por las políticas de sus titulares.'
				},
				{
					t: 'table',
					head: ['Proveedor', 'Finalidad', 'Observaciones'],
					rows: [
						[
							'**Google Maps Platform**',
							'Cartografía, geolocalización de unidades, rutas y zonas geográficas.',
							'Puede establecer cookies en dominios de Google y recibir la dirección IP, con fines de seguridad, prevención del fraude y control de cuotas. Técnica necesaria para la funcionalidad principal.'
						],
						[
							'**Google Fonts**',
							'Tipografías de determinados módulos de la interfaz.',
							'Implica la comunicación de la dirección IP a Google. **No instala cookies de seguimiento.**'
						]
					]
				}
			]
		},
		{
			id: 'consentimiento',
			num: '08',
			titulo: 'Régimen de consentimiento en México',
			blocks: [
				{
					t: 'p',
					text: '**La legislación mexicana no exige un panel o banner de consentimiento de cookies.** Los Lineamientos del Aviso de Privacidad establecen un régimen de transparencia: cuando se utilizan mecanismos que recaban datos personales de manera automática y simultánea, debe informarse al titular mediante comunicación o advertencia visible, señalando su uso, que por su medio se obtienen datos personales y **la forma de deshabilitarlos, salvo que sean necesarios por motivos técnicos**.'
				},
				{
					t: 'ul',
					items: [
						'El almacenamiento técnico es **necesario por motivos técnicos** y queda comprendido en la excepción: no puede deshabilitarse sin impedir el funcionamiento.',
						'El almacenamiento de preferencias **puede eliminarse libremente**, sin consecuencia sobre la prestación.'
					]
				},
				{
					t: 'p',
					text: 'Si en el futuro se incorporan cookies analíticas, publicitarias o de finalidad no necesaria, **se implementarán previamente los mecanismos de información y deshabilitación correspondientes** y se actualizará este documento.'
				}
			]
		},
		{
			id: 'gestion',
			num: '09',
			titulo: 'Cómo gestionarlas y eliminarlas',
			blocks: [
				{
					t: 'ul',
					items: [
						'**Cerrando sesión**, lo que elimina de inmediato los tokens de autenticación y las cookies de sesión.',
						'**Cerrando el navegador o la pestaña**, lo que elimina el contenido de sessionStorage.',
						'Desde la **configuración del navegador**: Chrome, Firefox, Edge, Safari u Opera, siguiendo la documentación oficial de cada fabricante.'
					]
				},
				{
					t: 'p',
					text: '**Advertencia**: bloquear o eliminar el almacenamiento técnico provoca el cierre de sesión y **la imposibilidad de acceder a las plataformas**. La página pública de Signum, en cambio, seguirá funcionando con normalidad.'
				}
			]
		},
		{
			id: 'privacidad',
			num: '10',
			titulo: 'Relación con el Aviso de Privacidad',
			blocks: [
				{
					t: 'p',
					text: 'Parte de la información descrita constituye datos personales. El régimen completo —finalidades, plazos de conservación, transferencias y procedimiento de derechos ARCO— se detalla en el **Aviso de Privacidad Integral**, disponible en /legal/privacidad, que forma parte integrante de esta política.'
				},
				{
					t: 'p',
					text: 'El titular puede ejercer sus derechos ARCO y revocar su consentimiento escribiendo a **privacidad@geminislabs.com**, y acudir ante la **Secretaría Anticorrupción y Buen Gobierno** si considera que sus derechos no fueron debidamente atendidos.'
				}
			]
		},
		{
			id: 'cambios',
			num: '11',
			titulo: 'Actualizaciones',
			blocks: [
				{
					t: 'p',
					text: 'Las modificaciones se publicarán en esta dirección con la fecha de última actualización y, cuando el cambio sea sustancial, mediante aviso destacado dentro de las plataformas.'
				}
			]
		},
		{
			id: 'contacto',
			num: '12',
			titulo: 'Contacto',
			blocks: [
				{
					t: 'p',
					text: 'privacidad@geminislabs.com'
				}
			]
		}
	]
};
