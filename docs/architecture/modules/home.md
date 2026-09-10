# Módulo: Home (Página de Inicio)

## 📌 Descripción

Página de inicio (landing page) de Geminis Labs.
Presenta los tres productos (Nexus, Orion, Signum), la oferta de ingeniería y
consultoría, el formulario de contacto y secciones informativas.

Es además el único punto del sitio con formulario de contacto: las páginas de
servicios y de partners delegan aquí su conversión en vez de duplicar un
formulario con su propio reCAPTCHA.

---

## 👤 Actor

- Usuario público (no requiere autenticación)
- Visitante interesado en productos o contacto

---

## 🔌 APIs y Servicios Consumidos

### 🔹 Backend API (admin-api)

| Endpoint                       | Método | Uso                        |
| ------------------------------ | ------ | -------------------------- |
| `/api/v1/contact/send-message` | POST   | Enviar mensaje de contacto |

### 🔹 Google reCAPTCHA v3

| Servicio                                  | Uso                                             |
| ----------------------------------------- | ----------------------------------------------- |
| `https://www.google.com/recaptcha/api.js` | Verificación anti-bot en formulario de contacto |
| reCAPTCHA execute                         | Generar token de verificación                   |

---

## 🔁 Flujo funcional

### Navegación general

1. Usuario accede a `/` (home)
2. Renderizar secciones, en este orden: Hero → ¿Qué es Geminis Labs? (`#nosotros`)
   → Tecnologías que convergen (`#tecnologias`) → Productos (`#productos`)
   → Servicios (`#servicios`) → ¿Por qué existimos? → Futuro → Contacto (`#contacto`)
3. Animaciones de scroll y efectos visuales
4. Navegación a productos (`/products/nexus`, y sitios externos de Orion y Signum)
   y a servicios (`/servicios`, `/servicios/diagnostico`)

> **El orden de Productos antes de Servicios es intencional**: los productos son
> la prueba de lo que la sección de servicios afirma, y el «también» de su
> titular necesita que el visitante ya los haya visto para tener antecedente.

### Formulario de contacto

1. Usuario completa formulario (nombre, email, teléfono, mensaje)
2. Validación de campos (frontend)
3. Ejecutar reCAPTCHA v3 para obtener token
4. POST a `/api/v1/contact/send-message` con datos + recaptcha_token
5. Mostrar mensaje de confirmación o error
6. Limpiar formulario si exitoso

---

## 📊 Fuentes de datos

| Archivo                       | Sección                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `src/lib/data/products.js`    | Rail y panel de `#productos`                                  |
| `src/lib/data/nexusModels.js` | Banda de contratación de Nexus (suscripción/SaaS/white-label) |
| `src/lib/data/services.js`    | Riel de proceso y anotaciones de `#servicios`                 |

---

## 🎨 Notas de la sección de servicios

- La ilustración `/img/servicios-cadena.webp` **lleva canal alfa generado a
  medida**: su fondo se eliminó del archivo derivando la transparencia de la
  luminancia contra un modelo por bloques del propio degradado de la imagen.
  Igualar el color de la sección no funcionaba porque la ilustración va de
  `#000911` en una esquina a `#001b29` en otra
- Las anotaciones (`scenePins`) **están calculadas, no ajustadas a ojo**: la
  silueta del dibujo se midió columna a columna y cada `labelY` se fija para que
  el rótulo quede por encima del punto más alto de la silueta en todo su rango
  horizontal. La tabla está en `services.js`. **Si se alarga un texto y le crece
  una línea, hay que rebajar su `labelY`**
- Por debajo de 1280px las anotaciones se apagan y el mismo contenido se lee como
  lista

---

## ⚠️ Colisiones de CSS global

`nexus.css` y `login-page.css` son hojas **sin scope**. SvelteKit carga la de
Nexus al precargar la ruta cuando el puntero entra en un enlace hacia ella, y a
partir de ahí sus clases afectan a la landing. Ya provocó un bloque blanco al
hacer hover sobre «Explorar Nexus»: sus `.nx-proof` y `.nx-panel` pisaban los de
la landing, que se renombraron a `.nx-evidence` y `.nx-slide`.

El scope de Svelte impide que los estilos de un componente se escapen, **no que
los globales entren**. Antes de crear una clase `nx-*` nueva en la landing,
comprobar que no exista ya en `nexus.css`.

---

## 🔐 Configuración reCAPTCHA

- **Variable de entorno**: `VITE_RECAPTCHA_SITE_KEY`
- **Carga dinámica**: Script de reCAPTCHA se carga en `onMount`
- **Acción**: `contact_form`
- **Validación**: Backend valida el token con Google

---

## 📤 Estructura de datos - Contacto

Request a `/api/v1/contact/send-message`:

```json
{
	"name": "Nombre del usuario",
	"email": "user@example.com",
	"phone": "+52 1234567890",
	"message": "Mensaje del usuario",
	"recaptcha_token": "token_generado_por_recaptcha"
}
```

---

## ⚠️ Consideraciones

- No requiere autenticación
- reCAPTCHA v3 es invisible (no requiere interacción del usuario)
- Formulario de contacto valida email y campos requeridos
- Animaciones de scroll pueden afectar rendimiento en dispositivos lentos

---

## 🧭 Relación C4

- **Container:** Web App (SvelteKit)
- **Component:** Home Module (Landing Page)
- **Consumes:**
  - Backend API (admin-api) - endpoint de contacto
  - Google reCAPTCHA v3 - verificación anti-bot
- **Uses components:** Navbar

---

## 📂 Archivos Relacionados

- [`src/routes/+page.svelte`](file:///home/chch/Code/geminis-labs-web-page/src/routes/+page.svelte) - Vista principal
- [`src/lib/config/api.js`](file:///home/chch/Code/geminis-labs-web-page/src/lib/config/api.js) - Configuración de endpoints
- [`src/lib/components/Navbar.svelte`](file:///home/chch/Code/geminis-labs-web-page/src/lib/components/Navbar.svelte) - Barra de navegación
