# Módulo: Servicios (Ingeniería y Consultoría)

## 📌 Descripción

Oferta de servicios de ingeniería y consultoría tecnológica. Vive en rutas
propias, separada de los productos, porque el comprador es distinto: dirección
técnica u operaciones de una empresa, no el consumidor final que contrata Nexus.

La landing solo la **anuncia** (sección `#servicios`); el detalle vive aquí.

---

## 👤 Actor

- Usuario público (no requiere autenticación)
- Comprador corporativo: CTO, dirección de operaciones, dirección general de PyME
- Integrador o fabricante evaluando capacidad de ingeniería

---

## 🗺️ Rutas

| Ruta                     | Archivo                                         | Contenido                                        |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------ |
| `/servicios`             | `src/routes/servicios/+page.svelte`             | Hub: seis capacidades + puertas de entrada + I+D |
| `/servicios/[slug]`      | `src/routes/servicios/[slug]/+page.svelte`      | Detalle de una capacidad (seis slugs)            |
| `/servicios/diagnostico` | `src/routes/servicios/diagnostico/+page.svelte` | Auditoría: puerta de entrada comercial           |

Slugs válidos: `consultoria-estrategia`, `software-cloud`, `ai-data`,
`iot-hardware`, `industria-automatizacion`, `soluciones-integrales`.

---

## 🔌 APIs y Recursos Consumidos

Ninguna API backend. Son páginas informativas; la conversión termina en el
formulario de contacto de la home (`/#contacto`), que sí consume
`/api/v1/contact/send-message`. Se reutiliza ese formulario en vez de duplicar
uno con su propio reCAPTCHA.

### 🔹 Recursos Estáticos

| Recurso                      | Tipo   | Uso                                                     |
| ---------------------------- | ------ | ------------------------------------------------------- |
| `/img/servicios-cadena.webp` | Imagen | Ilustración isométrica anotada de la sección en la home |
| Google Fonts — Audiowide     | Fuente | Etiquetas y numerales                                   |

---

## 📊 Fuente de datos

Todo el contenido sale de [`src/lib/data/services.js`](../../../src/lib/data/services.js),
sin texto embebido en las plantillas.

| Export          | Uso                                                                                   |
| --------------- | ------------------------------------------------------------------------------------- |
| `services`      | Las seis capacidades: `slug`, `num`, `title`, `promise`, `chips`, `entrada`, `detail` |
| `processSteps`  | Flujo Entendemos → Diseñamos → Construimos → Integramos → Operamos                    |
| `scenePins`     | Anotaciones sobre la ilustración de la home                                           |
| `service(slug)` | Búsqueda por slug; `undefined` si no existe                                           |

Cubierto por `src/lib/data/services.test.js`.

---

## 🔁 Flujo funcional

### Hub `/servicios`

1. Hero con la propuesta y CTA a diagnóstico
2. Riel de proceso (cinco pasos)
3. Índice de seis capacidades. La primera abierta; el resto se expanden al pulsar
4. Dos puertas de entrada: Diagnóstico tecnológico y CTO as a Service
5. Innovation Lab (Idea → PoC → MVP → Producto → Producción)
6. Cierre con CTA

### Capacidad `/servicios/[slug]`

1. `+page.js` resuelve el slug con `service()`. Si no existe, **`error(404)`**
2. Devuelve además la capacidad anterior y siguiente, con envolvente
3. La página muestra intro, grupos de servicios y, si la hay, una nota de alcance
4. Pie de navegación entre capacidades sin volver al hub

`entries()` declara los seis slugs para prerenderizado.

---

## 🎨 Características Visuales

- **Índice de filas a sangre**, no cuadrícula: la landing ya tiene la rejilla de
  capas tecnológicas y los badges de áreas; una tercera se leería como más de lo
  mismo
- **Multicolumna** en el detalle de capacidad: los grupos van de dos a cinco
  según la capacidad y con rejilla siempre quedaba alguno solo en la última fila
- **Paleta propia** (`--sv-*` en `tokens.css`): azul-teal profundo, deliberadamente
  ninguno de los tres negros de producto. Verde, plata y rojo pertenecen a Nexus,
  Orion y Signum

---

## ♿ Accesibilidad

- Las filas del índice son `<button aria-expanded aria-controls>`, no `div` con
  hover: el contenido revelado solo por hover es inalcanzable con teclado y en
  táctil
- El panel plegado va `inert`, porque `grid-template-rows: 0fr` recorta el
  contenido pero no lo saca del orden de tabulación
- Foco visible en todos los controles; `prefers-reduced-motion` respetado

---

## ⚠️ Consideraciones

- **`login-page.css` declara un `section { min-height: 100vh; display: flex }`
  sin scope** que se filtra a todo el sitio. Cada página de este módulo lo
  neutraliza localmente (`.sv-page section`, `.dg-page section`, `.cp-page section`).
  Arreglarlo de raíz afectaría a páginas que ya dependen de la fuga
- **Audiowide se carga en cada página** vía `svelte:head`. No hay carga global
- El campo `entrada` dice cómo **arranca** el trabajo, no cuánto cuesta. No hay
  precios publicados: el documento fuente no los fija. Cuando existan, el campo
  natural es `precio`, junto a `entrada`

---

## 🧭 Relación C4

- **Container:** Web App (SvelteKit)
- **Component:** Services Module
- **Consumes:** `src/lib/data/services.js`, recursos estáticos
- **Delegates to:** Home Module (formulario de contacto)
