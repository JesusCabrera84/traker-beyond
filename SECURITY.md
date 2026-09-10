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
