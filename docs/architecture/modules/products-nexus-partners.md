# Módulo: Products - Nexus para Partners

## 📌 Descripción

Página técnica para integradores y fabricantes: las dos modalidades en que Nexus
se vende a partners —conectar hardware propio, u operar la plataforma con marca
propia— con los protocolos, los formatos y el proceso de onboarding.

Existe porque ese contenido vivía enterrado dentro de `/products/nexus`, a dos
clics y ~1200 líneas de scroll, **sin URL propia**: no se le podía mandar a un
prospecto. La página de Nexus **no se modificó** más allá de añadirle un enlace,
porque está convirtiendo.

---

## 👤 Actor

- Integrador o fabricante con hardware GPS/IoT ya desplegado
- Empresa que quiere revender rastreo bajo su propia marca
- Perfil técnico: evalúa compatibilidad antes que precio

---

## 🗺️ Ruta

| Ruta                       | Archivo                                           |
| -------------------------- | ------------------------------------------------- |
| `/products/nexus/partners` | `src/routes/products/nexus/partners/+page.svelte` |

---

## 🔌 APIs y Recursos Consumidos

Ninguna API backend. La conversión termina en `/#contacto`.

### 🔹 Recursos Estáticos

| Recurso                  | Tipo    | Uso                      |
| ------------------------ | ------- | ------------------------ |
| `../nexus.css`           | Estilos | Tokens `--nx-*` de Nexus |
| Google Fonts — Audiowide | Fuente  | Títulos                  |

---

## 📊 Fuente de datos

[`src/lib/data/nexusModels.js`](../../../src/lib/data/nexusModels.js) es la
**fuente única** de las tres formas de tener Nexus. La leen la tarjeta de
producto de la landing, la sección de partners de `/products/nexus` y esta
página.

El contenido vive en dos páginas a propósito —no se le hace cirugía a la página
de Nexus— así que el dato compartido es lo único que evita que se contradigan
dentro de unos meses.

| Modalidad      | `axis`                | Término técnico                            |
| -------------- | --------------------- | ------------------------------------------ |
| Nexus          | Nosotros ponemos todo | Suscripción SaaS                           |
| Nexus Connect  | Tú pones el hardware  | SaaS multi-tenant · TaaS                   |
| Nexus Platform | Tú pones la marca     | White-label sobre la misma infraestructura |

`partnerModels` excluye la suscripción: a un integrador no se le vende eso.

> **Nombres**: `label` es el gancho comercial y `tech` el término técnico. Van
> separados porque las tres modalidades son SaaS —también la familiar—, así que
> etiquetar solo a Connect como «SaaS» se lee impreciso ante un comprador técnico.

---

## 🔁 Flujo funcional

1. Entrada desde el `secondaryCta` de la tarjeta de Nexus en la landing, desde el
   footer, o por URL directa enviada a un prospecto
2. Hero, las dos modalidades, protocolos, qué incluye el white-label y onboarding
3. CTA **«Solicitar acceso técnico»** → `/#contacto`

---

## ⚠️ Consideraciones

- **`nexus.css` es una hoja global sin scope.** Se importa aquí para heredar los
  tokens `--nx-*`, pero sus clases afectan a todo el sitio una vez cargada.
  SvelteKit la carga al precargar la ruta cuando el puntero entra en un enlace
  hacia ella; ya provocó una colisión con `.nx-proof` y `.nx-panel` de la landing.
  **Cualquier clase `nx-*` nueva puede volver a colisionar**
- Neutraliza localmente el `section { min-height: 100vh }` sin scope de
  `login-page.css`
- Carga Audiowide en su `svelte:head`: `nexus.css` la pide en una docena de
  reglas pero nadie la carga en esa rama de rutas. **`/products/nexus` sigue sin
  cargarla**, así que sus títulos caen a `system-ui`

### Contenido deliberadamente ausente

Puertos, esquema de payload, límites de frecuencia de reporte, dispositivos por
cuenta y retención de histórico **no están publicados** porque no están
documentados en ninguna parte. Un integrador los usaría para dimensionar, así
que publicar cifras inventadas sería peor que omitirlas: se resuelven en la
llamada técnica. Lo que sí aparece sale de `/faq` y de la página de Nexus.

---

## 🧭 Relación C4

- **Container:** Web App (SvelteKit)
- **Component:** Nexus Partners Page
- **Consumes:** `src/lib/data/nexusModels.js`, `nexus.css`
- **Delegates to:** Home Module (formulario de contacto)
