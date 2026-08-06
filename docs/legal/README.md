# Documentos legales — Geminis Labs

Juego documental corporativo, redactado el 6 de agosto de 2026 bajo la **LFPDPPP publicada en el
DOF el 20 de marzo de 2025**, con el Reglamento de 2011 supletorio, los Lineamientos del Aviso de
Privacidad (DOF 17/01/2013) y la **Secretaría Anticorrupción y Buen Gobierno** como autoridad.

## Estructura

Un aviso corporativo único, con un anexo por producto:

| Documento                         | Cubre                                                                   |
| --------------------------------- | ----------------------------------------------------------------------- |
| `01-Aviso-de-Privacidad-Integral` | Todos los servicios · Anexo A: NEXUS · Anexo B: Signum · Anexo C: Orion |
| `02-Terminos-de-Uso`              | Todos los servicios                                                     |
| `03-Aviso-Legal`                  | Sitios, aplicaciones y plataformas                                      |
| `04-Politica-de-Cookies`          | NEXUS y Signum, con inventario de identificadores                       |

**En caso de discrepancia entre el cuerpo principal y un anexo, prevalece el anexo** respecto del
producto que regula.

## Qué sustituyen

Estos documentos **fusionan y reemplazan**:

- Las páginas publicadas en `src/routes/legal/{privacidad,terminos,aviso-legal}`, que conservan su
  alcance comercial pero arrastran placeholders sin rellenar en producción.
- Los borradores específicos de NEXUS en `nexus-web-page/docs/legal/`, cuyo contenido pasó al
  cuerpo principal y al Anexo A.

Signum mantiene además **documentos propios** —aviso de privacidad, términos, aviso médico y aviso
de cookies— en `signum/packages/domain/src/legal/`, servidos desde su tabla `legal_documents`,
porque su régimen de datos sensibles y su flujo de consentimiento versionado no caben en un anexo.

## Antes de publicar

1. Rellenar **razón social, R.F.C. y domicilio fiscal**. Es lo único que falta.
2. Confirmar el **alcance del cifrado en reposo y la política de respaldos** (apartado 10 del aviso).
3. Fijar el **tope cuantitativo de responsabilidad** en el contrato, no en los términos públicos.
4. Confirmar el **perímetro comercial**: si se vende a consumidores finales, entra PROFECO y la
   cláusula de sumisión de fuero podría resultar inoponible.

Los plazos de conservación declarados —3 meses en crudo, 12 en agregados y logs, 5 años en fiscal
y consentimientos— **deben coincidir con lo que implemente el proyecto de retención**.

## Cómo se regeneran

Los `.docx` se generan por script; no se editan a mano. Cualquier corrección se aplica al script y
se vuelve a generar, para que los cuatro documentos no diverjan entre sí.
