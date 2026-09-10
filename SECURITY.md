# Política de seguridad

## Versiones soportadas

| Versión         | Soportada | Notas                             |
| --------------- | --------- | --------------------------------- |
| Último tag `v*` | Sí        | Releases desplegados a producción |
| `develop`       | Sí        | Rama de integración activa        |
| Otras ramas     | No        | Sin garantía de parches           |

## Reportar una vulnerabilidad

**No reportes vulnerabilidades de seguridad mediante issues públicos de GitHub.**

Envía un reporte privado a:

**[security@geminislabs.com](mailto:security@geminislabs.com)**

Si el buzón no está disponible, usa **[contacto@geminislabs.com](mailto:contacto@geminislabs.com)** con asunto `SECURITY: geminis-labs-web-page`.

Incluye en tu reporte:

1. Descripción del problema y el impacto potencial
2. Pasos para reproducir (o prueba de concepto)
3. Versión o commit afectado
4. Tu contacto para seguimiento

### Qué esperar

| Plazo           | Acción                                  |
| --------------- | --------------------------------------- |
| 72 horas        | Acuse de recibo del reporte             |
| 7 días          | Evaluación inicial y severidad estimada |
| Según severidad | Fix, mitigación o plan de remediación   |

Te mantendremos informado del progreso. Coordinaremos la fecha de divulgación pública si aplica.

## Qué **no** es una vulnerabilidad de seguridad

Reporta estos casos como issues normales, no por este canal:

- Bugs de UI o funcionalidad sin impacto de seguridad
- Solicitudes de nuevas features
- Alertas de Dependabot ya visibles en el repositorio (usa el flujo de PR de dependencias)
- Problemas que requieren acceso físico al dispositivo del usuario o credenciales ya comprometidas

## Buenas prácticas del proyecto

Este frontend consume APIs backend y servicios de terceros (Google Maps, reCAPTCHA, Stripe). Ten en cuenta:

- **Nunca** commitees API keys, tokens JWT, secretos de Stripe ni credenciales en el repositorio
- Las variables `VITE_*` son **públicas** en el bundle del navegador; no coloques secretos ahí
- Los tokens de sesión deben manejarse según las políticas definidas en `src/lib/services/authService.js`

## Dependencias

Las vulnerabilidades en dependencias npm se gestionan vía Renovate/Dependabot y `npm audit`. Si encuentras una CVE sin alerta automática, repórtala por el canal de seguridad.

### Vulnerabilidades conocidas pendientes

Publicadas después de `v1.11.0` y **posteriores** al trabajo de `chore/audit-fix-cves`, así que ese branch no las cubre. Bloquean los jobs `security` y `quality` del CI.

| Paquete                    | Actual | Corregida en | Severidad    | Aviso                                                                                         |
| -------------------------- | ------ | ------------ | ------------ | --------------------------------------------------------------------------------------------- |
| `maplibre-gl`              | 5.22.0 | 6.4.1        | 10.0 crítica | [GHSA-jrc7-96c5-q579](https://osv.dev/GHSA-jrc7-96c5-q579) — bypass del sanitizador XSS       |
| `vitest`, `@vitest/mocker` | 3.2.7  | 4.1.11       | 5.9 moderada | [GHSA-82fw-gwwq-j7x9](https://osv.dev/GHSA-82fw-gwwq-j7x9) — path traversal (solo desarrollo) |

Se investigaron y se documentan aquí para que quien las resuelva no repita el trabajo:

- **`maplibre-gl` no se importa en ningún archivo del repositorio.** Aparece una sola vez, en su propia declaración de `package.json`. Los mapas usan `@googlemaps/js-api-loader`. La crítica se resuelve **eliminando la dependencia**, sin subir a la major 6.x.
- **Subir vitest a 4.x obliga a quitar `@vitest/browser` y `vitest-browser-svelte`**, que fijan peers en la 3.x. Ambos son andamiaje: browser mode no está configurado en `vite.config.js` (usa `happy-dom`), y el único test que los usa —`src/routes/page.svelte.spec.js`, el demo de SvelteKit— está excluido por config y nunca se ejecuta. `vitest-setup-client.js` solo contiene referencias de tipos y no lo carga nadie.
- **Vitest 4 mide la cobertura más estricto** (remapeo AST por defecto, sin opción para desactivarlo). Con el mismo código, las métricas bajan de pasar los umbrales a: statements 83.6%, funciones 83.92%, líneas 88.8% — contra el 90% documentado en [GOVERNANCE.md](docs/GOVERNANCE.md). El hueco se concentra en `billingService`, `authStore`, `userStore` y `gpsService`. **Hay que decidir entre recalibrar los umbrales o escribir los tests que faltan**, y esa decisión no debería ir junto a un cambio de contenido.
- El scanner de OSV falla con **cualquier** severidad, así que eliminar solo `maplibre-gl` no pone el CI en verde; `npm audit --audit-level=high`, en cambio, sí ignoraría la moderada de vitest.
