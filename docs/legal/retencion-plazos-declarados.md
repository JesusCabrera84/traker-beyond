# Plazos de conservación declarados

**Para el equipo que implementa la retención de datos.**
Fecha: 7 de agosto de 2026 · Repos afectados: `siscom-admin-api`, `database-siscom`,
`telemetry-consolidator`, y el bucket de respaldos en S3.

---

## Por qué existe este documento

Los plazos de abajo **ya están publicados**. No son una propuesta: figuran en el Aviso de
Privacidad de `geminislabs.com/legal/privacidad`, en el Anexo A del Convenio de Tratamiento de
Datos que se firma con cada Cliente, y en la cláusula 18.4 del Contrato Marco v4.1.

Eso invierte el orden habitual: **la implementación tiene que ajustarse a lo declarado**, no al
revés. Si lo implementado no coincide, lo que hay es un aviso de privacidad falso — y eso es un
incumplimiento peor que no haber declarado nada, porque lo documentó la propia empresa.

Si alguno de estos plazos resulta inviable, **decidlo antes de implementar**: se corrige el
documento y se republica. Lo que no puede pasar es que diverjan en silencio.

## Los plazos

| Categoría                                                                                    | Plazo                                       | Dónde vive el dato                                                 |
| -------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| **Geolocalización y telemetría en crudo** — posiciones, comunicaciones y puntos de recorrido | **3 meses** desde la fecha de cada registro | `communications_queclink`, `communications_suntech`, `trip_points` |
| Métricas agregadas por dispositivo                                                           | 12 meses                                    | `telemetry_hourly_stats` y equivalentes                            |
| Métricas disociadas, sin vínculo a dispositivo o persona                                     | Sin plazo                                   | —                                                                  |
| Registros de acceso y auditoría                                                              | 12 meses                                    | Tablas de auditoría                                                |
| Catálogos de unidades, zonas y usuarios                                                      | Vigencia del contrato + 3 meses             | Tablas de catálogo                                                 |
| Documentación fiscal y contable                                                              | 5 años                                      | —                                                                  |
| Solicitudes de derechos ARCO y su respuesta                                                  | 5 años                                      | Bitácora, fuera de la plataforma                                   |

**El Cliente puede instruir plazos distintos por escrito.** El convenio lo prevé, así que la
retención **debe ser configurable por cliente**, no una constante global. Como mínimo, una
variable de entorno; lo correcto, una columna por cliente.

## Cuatro cosas que os ahorran descubrirlas

**1 · `telemetry_hourly_stats` no puede bajar de 180 días.**
`siscom-admin-api/app/schemas/telemetry.py:59` define `MAX_RANGE_DAYS = 180`. Es el tope de
consulta con `granularity=day`, y ese endpoint lee de la tabla agregada, no del crudo. Si los
agregados se purgan antes de 180 días, las consultas devolverán rangos vacíos dentro de un rango
que la propia API acepta. Los 12 meses declarados lo cubren con holgura — solo hay que no bajarlo.

Como el endpoint con `granularity=hour` está topado a 7 días, **no hay conflicto entre el tope de
la API y los 3 meses de retención en crudo.**

**2 · Solo dos tablas están particionadas.**
`trip_alerts` y `trip_events` son `PARTITION BY RANGE (timestamp)`: ahí purgar es soltar
particiones, trivial y barato. Las tablas de volumen —`communications_queclink`,
`communications_suntech` y `trip_points`— **no lo están**. Ahí toca particionar primero o borrar
por lotes con vacuum. Las tres tienen índice por tiempo, así que es viable de las dos formas.

**3 · Los respaldos en S3 no tienen lifecycle.**
`database-siscom/postgres-backup/backup.sh` rota los volcados locales a 7 días (`find -mtime +7`)
y los sube a S3 con `aws s3 cp`, sin política de ciclo de vida. **Purgar la base sin tocar los
respaldos no suprime nada**: el dato solo cambia de sitio, y sigue siendo exigible. La retención de
respaldos tiene que ser más corta que la del dato primario, o estar acotada y documentada.

**4 · Las estadísticas no dependen del dato crudo.**
`telemetry-consolidator` ya calcula agregados horarios por dispositivo en una tabla separada
(`ENABLE_INTELLIGENCE_PIPELINE`). Es decir, purgar el crudo a los 3 meses **no cuesta nada
analíticamente**: lo que se quiere conservar ya está conservado en otro sitio.

## Criterios de aceptación

1. Ningún registro en `communications_*` ni en `trip_points` con antigüedad superior a **3 meses**.
2. `telemetry_hourly_stats` conserva **al menos 180 días** y no más de 12 meses.
3. El bucket de respaldos tiene **política de ciclo de vida** aplicada y documentada.
4. El plazo es **configurable por cliente**, no una constante compilada.
5. La primera ejecución produce **un informe previo** —filas y rango de fechas por cliente— antes
   de borrar nada. El borrado inicial es irreversible y conviene mirarlo antes.
6. El trabajo de purga **registra qué borró y cuándo**. Es la evidencia de que la política se
   cumple; sin ella, declararla no sirve de nada.

## Antes de la primera ejecución

Revisar si algún contrato vigente promete histórico superior a 3 meses. Si lo hubiera, purgar
sería un incumplimiento contractual. A la fecha de este documento no hay clientes en producción,
así que la ventana para hacerlo limpio es ahora.

## Cuando esté hecho

Avisad para verificar que lo implementado coincide con lo declarado. Si algún número cambió, hay
que regenerar el Aviso de Privacidad, el Convenio y la cláusula 18.4 del Contrato Marco: los tres
salen de la misma fuente y se actualizan juntos.
