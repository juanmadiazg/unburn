# Conceptos de información de Unburn

Los conceptos de información describen qué datos maneja el sistema y son la base del modelo de datos.

- Las llaves **{…}** agrupan datos que se repiten varias veces dentro del mismo concepto (por ejemplo, las llamadas de una sesión).
- Unburn **no guarda el texto** de las peticiones ni de las respuestas de IA. Solo guarda metadatos: quién, cuándo, cuánto costó y qué se decidió.
- Una **huella** es un código corto calculado a partir de un texto. Permite saber si dos textos son iguales sin guardarlos y sin poder reconstruirlos.

## 1. Clientes y suscripción

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| IC-01 | Cliente (organización) | nombre, datos fiscales (CIF/NIF), zona horaria, política ante fallos por defecto, socio que lo trajo, fecha de alta, estado,… | Es la empresa o el desarrollador que contrata Unburn. La zona horaria marca cuándo empieza cada día y cada mes en los presupuestos. |
| IC-02 | Usuario del panel | email, nombre, apellidos, cliente, rol,… | El campo "rol" indica si es administrador (puede cambiarlo todo) o lector (solo consulta). Los auditores acceden con el rol lector o trabajan con una exportación. |
| IC-03 | Plan | nombre, precio mensual, peticiones incluidas, precio del excedente, máximo de claves virtuales, días de retención del registro, canales de alerta, funciones incluidas,… | Gratis, Pro o Enterprise. En Enterprise las condiciones se negocian en un contrato personalizado (IC-05). |
| IC-04 | Suscripción | cliente, plan, fecha de alta, contrato de tratamiento de datos aceptado, {mes, peticiones facturables, excedente}, tope de excedente, estado, fecha de baja,… | El campo "estado" indica si está activa, con la cuota agotada (plan Gratis), con el tope de excedente alcanzado (plan Pro) o de baja. Solo cuentan las peticiones de generación (Chat Completions, Responses API o Messages) que se reenvían al proveedor de IA. |
| IC-05 | Contrato Enterprise | nº contrato, cliente, precio, peticiones incluidas, disponibilidad garantizada (SLA), soporte, días de retención, estrategia de salida, modalidad, fecha de firma,… | Lo negocian Ventas y Legal. "modalidad": nube confidencial o despliegue privado. Sustituye a las condiciones del plan estándar. En despliegue privado, el precio es una licencia anual y no se cuentan peticiones. |
| IC-06 | Factura | nº factura, fecha factura, cliente, datos fiscales, periodo, plan, peticiones facturables, bloques de excedente, importe, estado del cobro,… | Solo cobra la suscripción de Unburn: el gasto en IA lo paga el cliente directamente al proveedor de IA. El cobro se hace con la plataforma de pagos, que es quien guarda los datos de la tarjeta. |

## 2. Configuración del cliente

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| IC-07 | Clave de proveedor | cliente, proveedor de IA, clave real cifrada, cuenta o proyecto del proveedor al que se carga el gasto, fecha de alta,… | Es la clave que el proveedor de IA da al cliente. Se guarda cifrada y nadie puede volver a verla en claro. |
| IC-08 | Clave virtual | nombre, prefijo visible, huella de la clave, estado, clave de proveedor, modelos permitidos, agentes permitidos, herramientas autorizadas (del proveedor en el plan Gratis; del cliente y del proveedor en Pro y Enterprise si la clave no tiene lista de agentes), política de bucles, política ante fallos, modelo sustituto, tamaño máximo de entrada y de respuesta, clave a la que sustituye,… | Clave de Unburn para un equipo, agente o entorno. Cada clave virtual trabaja con un solo proveedor. Se muestra completa una sola vez; solo se guarda su huella. "estado": activa o revocada. Al rotarla, la nueva hereda la configuración, lo gastado en el periodo actual y su línea base de consumo (IC-12 e IC-19). Plan Gratis: hasta 3. |
| IC-09 | Agente | nombre, cliente, claves virtuales que puede usar,… | Programa de IA del cliente que hace las peticiones. Se identifica por su clave o, si varios comparten clave, por la cabecera de agente. |
| IC-10 | Herramienta | nombre, cliente, quién la ejecuta, categoría de datos, fecha en que se vio por primera vez, agentes que la usan, estado, usos máximos, tamaño máximo del resultado,… | "quién la ejecuta": el cliente o el proveedor de IA. "estado": pendiente de revisar, aprobada o denegada. El estado indica si la herramienta está aprobada para usarse. Quién puede usarla lo decide la clave virtual (IC-08: en el plan Gratis, y en cualquier plan si la clave no tiene lista de agentes) o el grafo de autorización (IC-11, por agente). Las del proveedor están denegadas por defecto y son las únicas con límite de usos y de tamaño. |
| IC-11 | Grafo de autorización | cliente, modo, {agente, herramienta que puede usar}, {agente, agente en quien puede delegar}, {agente, categoría de datos prohibida}, {caminos indirectos detectados}, versión de la configuración,… | Mapa de permisos de los agentes. "modo": aprendizaje (solo registra) o protección (deniega lo no permitido). En cada cambio avisa de los caminos indirectos: llegar a datos prohibidos delegando en otro agente. |
| IC-12 | Presupuesto | ámbito, periodo, límite blando, límite duro, gastado y reservado en el periodo actual,… | "ámbito": cliente o clave virtual. "periodo": diario o mensual. El límite blando avisa y el duro corta. Controla el gasto en IA del cliente, no la suscripción. |
| IC-13 | Canal de alertas | cliente, tipo, destino, avisos que recibe,… | "tipo": email, mensajería de equipo o webhook. Plan Gratis: solo email. |

## 3. Operación (tráfico de IA)

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| IC-14 | Modelo de IA y precios | proveedor de IA, modelo, fecha de vigencia, {precio por tipo de token: entrada, salida, razonamiento, caché}, recargos, {herramienta del proveedor, tarifa por uso, entrada adicional estimada}, {opción admitida, efecto en el precio},… | Catálogo que mantiene Ingeniería para calcular reservas y costes. Una opción nueva solo se admite cuando su precio está registrado. |
| IC-15 | Sesión | identificador, cliente, inicio, número de llamadas, coste acumulado, estado, {petición, agente, agente que encargó la tarea, herramienta pedida, llamadas de las que depende, decisión},… | Una tarea de uno o varios agentes; su identificador lo envía el cliente. Sus llamadas y relaciones forman el grafo de sesión (qué pasó y por qué), base de la detección de bucles y del diagnóstico causal. Las huellas del contenido de cada llamada se guardan solo 24 horas para detectar bucles; las de las llamadas implicadas en un incidente se conservan con el incidente (IC-20). |
| IC-16 | Evento de auditoría | identificador, tipo, fecha y hora, cliente, clave virtual, sesión, agente, agente que encargó la tarea, llamadas de las que depende, proveedor, API, modelo pedido y usado, herramienta pedida, {tokens de entrada, salida, razonamiento y caché}, usos de herramientas del proveedor, coste estimado y real, latencia, decisión, motivo o regla aplicada, versión de la configuración, IP de origen, usuario final (seudónimo), huella del grupo de eventos anterior,… | "tipo": inicio (al reservar), cierre (al liquidar), rechazo (petición rechazada antes de llegar al proveedor), resumen de rechazos (los rechazos rápidos de claves sin presupuesto o sin cuota, agrupados cada pocos segundos) o auxiliar (petición sin coste que llega al proveedor, como borrar una respuesta). "decisión": permitida, bloqueada, frenada o con modelo sustituido. Los eventos se encadenan para detectar manipulaciones. Se conservan según el plan. Las peticiones con una clave virtual que no existe no se auditan, porque no pertenecen a ningún cliente. Quedan en los registros técnicos de la plataforma. |
| IC-17 | Reserva | identificador, petición, importe reservado, presupuestos afectados, caducidad, estado,… | Dinero apartado con el peor caso antes de enviar la petición. Al terminar se cuenta el coste real y se libera el resto. Si vence sin liquidarse, se cuenta como gasto estimado. Si el proveedor rechaza la petición de entrada, sin generar nada, la reserva se libera sin gasto. |
| IC-18 | Cadena de respuestas | identificador de la respuesta en el proveedor, clave virtual propietaria, tokens acumulados,… | Para conversaciones cuyo historial guarda el proveedor de IA. Permite estimar su coste y que solo la clave propietaria las continúe. Al rotar la clave, pasan a la nueva. |
| IC-19 | Línea base de consumo | clave virtual, ámbito, media y variabilidad de euros por minuto, media y variabilidad de tokens por minuto, límites endurecidos hasta,… | Consumo normal de una clave virtual, sesión o usuario final. El sistema inmunológico compara el consumo actual con ella. Tras un incidente de consumo anómalo, en los planes Pro y Enterprise, se endurecen los límites durante 24 horas. |
| IC-20 | Incidente | identificador, tipo, fecha, clave virtual, sesión, agente, parte afectada, respuesta aplicada, causa raíz, coste del incidente, cota superior del coste atribuible, ahorro estimado con su hipótesis, coste previsto, huellas de las llamadas implicadas, estado,… | "tipo": bucle, consumo anómalo, presupuesto agotado o herramienta denegada (incluye las herramientas nuevas bloqueadas en modo protección). "estado": abierto o cerrado (se cierra cuando el administrador lo marca como revisado). Si ya hay un incidente abierto con la misma causa y la misma parte afectada, y ha tenido actividad en la última hora (ejemplo), se actualiza en lugar de crear otro. Solo hay ahorro si Unburn detuvo o frenó algo; si solo avisó, se muestra el coste previsto. |
| IC-21 | Agregado de gasto | cliente, clave virtual, intervalo de 15 minutos, euros gastados, peticiones facturables,… | Totales que se conservan 13 meses. Sirven para facturar, para los informes y para reconstruir los contadores si se pierden. |
| IC-22 | Sello de auditoría | fecha y hora, resumen de todas las cadenas con eventos nuevos, firma,… | Se genera cada pocos minutos y se guarda en un almacenamiento del proveedor de cloud que nadie, ni siquiera Unburn, puede modificar ni borrar. Demuestra que el registro no se ha manipulado. No contiene datos de clientes. En despliegue privado, el registro y los sellos se guardan en la infraestructura del cliente. |
| IC-23 | Alerta | cliente, fecha y hora, canal de alertas, motivo, resumen, enlace al panel,… | "motivo": incidente, límite blando de un presupuesto, 80% o 100% de la cuota, o 80% o 100% del tope de excedente. Se genera al atender peticiones (límite blando), al gestionar incidentes y al facturar (cuota y tope). |
| IC-24 | Exportación de datos | Igual que IC-16 Evento de auditoría, más la configuración del cliente (claves virtuales con su nombre, prefijo y permisos, presupuestos y permisos de los agentes), nunca la clave real ni la clave virtual completa | El cliente puede descargarla en cualquier momento (CSV o JSON), lo que facilita cambiar de proveedor. |

## 4. Gestión interna de Unburn

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| IC-25 | Empleado de Unburn | email, nombre, apellidos, departamento, rol,… | Personas de Soporte, Ventas, Finanzas, Ingeniería, etc. Nunca ven el texto de las peticiones ni las claves reales. |
| IC-26 | Ticket de soporte | nº ticket, cliente, usuario que lo abre, empleado asignado, fecha, descripción, petición relacionada, estado, resolución,… | "estado": abierto, escalado a Ingeniería o cerrado. Se analiza solo con los metadatos del registro. |
| IC-27 | Incidencia técnica | identificador, fecha, origen, componente afectado, gravedad, causa, acciones de recuperación, clientes afectados, notificada a reguladores, estado,… | "origen": alarma de la plataforma o ticket escalado. Son fallos de la propia plataforma de Unburn; no confundir con IC-20 Incidente, que trata el tráfico del cliente. |
| IC-28 | Versión de la plataforma | nº versión, fecha, cambios incluidos, revisión legal, resultado de las pruebas, firma, lista de componentes (SBOM), {porcentaje de tráfico, indicadores}, estado,… | "estado": en pruebas, en despliegue gradual, publicada o revertida. El código se guarda en la plataforma de desarrollo. |
| IC-29 | Socio | nombre, tipo, estado del acuerdo, comisión, {clientes que ha traído},… | "tipo": agencia de automatización, plataforma de automatización y de agentes o marketplace del proveedor de cloud. Hoy son propuestas, no acuerdos firmados. |
| IC-30 | Proveedor de Unburn | nombre, servicio que presta, condiciones del contrato, coste mensual, trata datos de clientes,… | Proveedor de cloud, plataforma de pagos o plataforma de desarrollo. Los proveedores de modelos de IA no están aquí porque los contrata el cliente. |
| IC-31 | Informe mensual | mes, ingresos, clientes por plan, peticiones, incidentes, tickets, {costes propios: infraestructura, plan gratuito, comisiones de socios}, estadísticas,… | Lo usan Finanzas y Dirección para decidir precios, prioridades y gasto. Se calcula con suscripciones, facturas, agregados de gasto, incidentes, tickets, proveedores de Unburn (costes de infraestructura) y socios (comisiones). |

## 5. Relaciones principales (para el modelo de datos)

Se usa la notación del diagrama de clases: **1** (exactamente uno), **0..1** (ninguno o uno) y **\*** (muchos, incluido ninguno). La cardinalidad se lee en el orden de las columnas: "Cliente 1 : \* Usuario del panel" significa que un cliente tiene muchos usuarios y cada usuario pertenece a un solo cliente.

**Cliente y suscripción**

| Concepto | Relación | Concepto | Cardinalidad |
|---|---|---|---|
| Cliente | tiene | Suscripción | 1 : 1 |
| Suscripción | sigue | Plan | * : 1 |
| Cliente | firma | Contrato Enterprise | 1 : 0..1 |
| Suscripción | genera | Factura | 1 : * |
| Socio | trae | Cliente | 0..1 : * |
| Cliente | tiene | Usuario del panel | 1 : * |
| Cliente | descarga | Exportación de datos | 1 : * |

**Configuración**

| Concepto | Relación | Concepto | Cardinalidad |
|---|---|---|---|
| Cliente | guarda | Clave de proveedor | 1 : * |
| Clave de proveedor | se usa en | Clave virtual | 1 : * |
| Clave virtual | sustituye a (rotación) | Clave virtual | 0..1 : 0..1 |
| Cliente | tiene | Agente | 1 : * |
| Clave virtual | permite | Agente | * : * |
| Cliente | tiene | Herramienta | 1 : * |
| Clave virtual | autoriza | Herramienta | * : * |
| Cliente | tiene | Grafo de autorización | 1 : 1 |
| Agente | puede usar (grafo de autorización) | Herramienta | * : * |
| Agente | puede delegar en (grafo de autorización) | Agente | * : * |
| Cliente | tiene | Presupuesto | 1 : * |
| Clave virtual | tiene | Presupuesto | 0..1 : * |
| Cliente | tiene | Canal de alertas | 1 : * |

**Operación**

| Concepto | Relación | Concepto | Cardinalidad |
|---|---|---|---|
| Cliente | tiene | Sesión | 1 : * |
| Evento de auditoría | lo genera | Clave virtual | * : 1 |
| Evento de auditoría | lo hace | Agente | * : 0..1 |
| Evento de auditoría | usa el precio de | Modelo de IA y precios | * : 0..1 |
| Sesión | agrupa | Evento de auditoría | 0..1 : * |
| Evento de auditoría (inicio) | crea | Reserva | 1 : 0..1 |
| Reserva | aparta dinero en | Presupuesto | * : * |
| Evento de auditoría | se suma en | Agregado de gasto | * : 0..1 |
| Clave virtual | acumula | Agregado de gasto | 1 : * |
| Sello de auditoría | resume | Evento de auditoría | 0..1 : * |
| Cadena de respuestas | pertenece a | Clave virtual | * : 1 |
| Línea base de consumo | pertenece a | Clave virtual | * : 1 |
| Cliente | tiene | Incidente | 1 : * |
| Sesión | tiene | Incidente | 0..1 : * |
| Incidente | afecta a | Clave virtual | * : 0..1 |
| Incidente | lo provoca | Agente | * : 0..1 |
| Cliente | recibe | Alerta | 1 : * |
| Incidente | genera | Alerta | 0..1 : * |
| Presupuesto | genera (límite blando) | Alerta | 0..1 : * |
| Suscripción | genera (cuota o tope) | Alerta | 0..1 : * |
| Canal de alertas | envía | Alerta | 1 : * |

**Gestión interna**

| Concepto | Relación | Concepto | Cardinalidad |
|---|---|---|---|
| Ticket de soporte | pertenece a | Cliente | * : 1 |
| Ticket de soporte | lo abre | Usuario del panel | * : 1 |
| Ticket de soporte | está asignado a | Empleado de Unburn | * : 1 |
| Ticket de soporte | consulta | Evento de auditoría | * : * |
| Ticket de soporte | se escala a | Incidencia técnica | * : 0..1 |
| Versión de la plataforma | provoca | Incidencia técnica | 0..1 : * |
| Proveedor de Unburn | provoca | Incidencia técnica | 0..1 : * |

El Informe mensual (IC-31) no tiene relaciones propias: es un documento que se calcula con suscripciones, facturas, agregados de gasto, incidentes, tickets, proveedores de Unburn (costes de infraestructura) y socios (comisiones).