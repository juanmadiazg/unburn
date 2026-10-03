# Conceptos de información de Unburn

Los conceptos de información describen qué datos maneja el sistema y son la base del modelo de datos. Como Unburn es un SaaS, la empresa emprendedora y la que explota el sistema coinciden, así que se presenta un único mapa.

- Las llaves **{…}** agrupan datos que se repiten varias veces dentro del mismo concepto (por ejemplo, las llamadas de una sesión).
- Unburn **no guarda el texto** de las peticiones ni de las respuestas de IA. Solo guarda metadatos: quién, cuándo, cuánto costó y qué se decidió.
- Una **huella** es un código corto calculado a partir de un texto. Permite saber si dos textos son iguales sin guardarlos y sin poder reconstruirlos.

## 1. Clientes y suscripción

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| IC-01 | Cliente (organización) | nombre, datos fiscales (CIF/NIF), zona horaria, política ante fallos por defecto, socio que lo trajo, fecha de alta, estado,… | Es la empresa o el desarrollador que contrata Unburn. La zona horaria marca cuándo empieza cada día y cada mes en los presupuestos. |
| IC-02 | Usuario del panel | email, nombre, apellidos, cliente, rol,… | El campo "rol" indica si es administrador (puede cambiarlo todo) o lector (solo consulta). |
| IC-03 | Plan | nombre, precio mensual, peticiones incluidas, precio del excedente, máximo de claves virtuales, días de retención del registro, canales de alerta, funciones incluidas,… | Gratis, Pro o Enterprise. En Enterprise las condiciones se negocian en un contrato personalizado (IC-05). |
| IC-04 | Suscripción | cliente, plan, fecha de alta, contrato de tratamiento de datos aceptado, {mes, peticiones facturables, excedente}, tope de excedente, estado, fecha de baja,… | El campo "estado" indica si está activa, con la cuota agotada o de baja. Solo cuentan las peticiones que llegan al proveedor de IA. Se avisa al 80% y al 100% de la cuota. |
| IC-05 | Contrato Enterprise | nº contrato, cliente, precio, peticiones incluidas, disponibilidad garantizada (SLA), soporte, días de retención, estrategia de salida, modalidad, fecha de firma,… | Lo negocian Ventas y Legal. "modalidad": nube confidencial o despliegue privado. Sustituye a las condiciones del plan estándar. |
| IC-06 | Factura | nº factura, fecha factura, cliente, datos fiscales, periodo, plan, peticiones facturables, bloques de excedente, importe, estado del cobro,… | Solo cobra la suscripción de Unburn: el gasto en IA lo paga el cliente directamente al proveedor de IA. El cobro se hace con la plataforma de pago, que es quien guarda los datos de la tarjeta. |

## 2. Configuración del cliente

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| IC-07 | Clave de proveedor | cliente, proveedor de IA, clave real cifrada, cuenta o proyecto del proveedor al que se carga el gasto, fecha de alta,… | Es la clave que el proveedor de IA da al cliente. Se guarda cifrada y nadie puede volver a verla en claro. |
| IC-08 | Clave virtual | nombre, prefijo visible, huella de la clave, estado, clave de proveedor, modelos permitidos, agentes permitidos, herramientas del proveedor autorizadas, {política de bucles, política ante fallos, modelo sustituto, tamaño máximo de entrada y de respuesta}, clave a la que sustituye,… | Clave de Unburn para un equipo, agente o entorno. Se muestra completa una sola vez; solo se guarda su huella. "estado": activa o revocada. Al rotarla, la nueva hereda la configuración. Plan Gratis: hasta 3. |
| IC-09 | Agente | nombre, cliente, claves virtuales que puede usar,… | Programa de IA del cliente que hace las peticiones. Se identifica por su clave o, si varios comparten clave, por la cabecera de agente. |
| IC-10 | Herramienta | nombre, quién la ejecuta, categoría de datos, fecha en que se vio por primera vez, agentes que la usan, estado, {usos máximos, tamaño máximo del resultado},… | "quién la ejecuta": el cliente o el proveedor de IA. "estado": pendiente de revisar, aprobada o denegada. Las del proveedor están denegadas por defecto y son las únicas con límite de usos y de tamaño. |
| IC-11 | Grafo de autorización | cliente, modo, {agente, herramienta que puede usar}, {agente, agente en quien puede delegar}, {agente, categoría de datos prohibida}, {caminos indirectos detectados}, versión de la configuración,… | Mapa de permisos de los agentes. "modo": aprendizaje (solo registra) o protección (deniega lo no permitido). En cada cambio avisa de los caminos indirectos: llegar a datos prohibidos delegando en otro agente. |
| IC-12 | Presupuesto | ámbito, periodo, límite blando, límite duro, {gastado, reservado},… | "ámbito": cliente o clave virtual. "periodo": diario o mensual. El límite blando avisa y el duro corta. Controla el gasto en IA del cliente, no la suscripción. |
| IC-13 | Canal de alertas | cliente, tipo, destino, avisos que recibe,… | "tipo": email, mensajería de equipo o webhook. Plan Gratis: solo email. |

## 3. Operación (tráfico de IA)

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| IC-14 | Modelo de IA y precios | proveedor de IA, modelo, fecha de vigencia, {precio por tipo de token: entrada, salida, razonamiento, caché}, recargos, {herramienta del proveedor, tarifa por uso, entrada adicional estimada}, {opción admitida, efecto en el precio},… | Catálogo que mantiene Ingeniería para calcular reservas y costes. Una opción nueva solo se admite cuando su precio está registrado. |
| IC-15 | Sesión | identificador, cliente, inicio, número de llamadas, coste acumulado, estado, {petición, agente, agente que encargó la tarea, herramienta pedida, llamadas de las que depende, huella del contenido nuevo, decisión},… | Una tarea de uno o varios agentes; su identificador lo envía el cliente. Sus llamadas y relaciones forman el grafo de sesión (qué pasó y por qué), base de la detección de bucles y del diagnóstico causal. |
| IC-16 | Evento de auditoría | identificador, tipo, fecha y hora, cliente, clave virtual, sesión, agente, llamadas de las que depende, proveedor, modelo pedido y usado, {tokens de entrada, salida, razonamiento y caché}, coste estimado y real, latencia, decisión, motivo o regla aplicada, versión de la configuración, IP de origen, usuario final (seudónimo), huella del evento anterior,… | Registro de cada petición: "tipo" de inicio (al reservar) o de cierre (al liquidar). "decisión": permitida, bloqueada, frenada o con modelo sustituido. Los eventos se encadenan para detectar manipulaciones. Se conservan según el plan. |
| IC-17 | Reserva | identificador, petición, importe reservado, presupuestos afectados, caducidad, estado,… | Dinero apartado con el peor caso antes de enviar la petición. Al terminar se cuenta el coste real y se libera el resto. Si vence sin liquidarse, se cuenta como gasto estimado. |
| IC-18 | Cadena de respuestas | identificador de la respuesta en el proveedor, clave virtual propietaria, tokens acumulados,… | Para conversaciones cuyo historial guarda el proveedor de IA. Permite estimar su coste y que solo la clave propietaria las continúe. Al rotar la clave, pasan a la nueva. |
| IC-19 | Línea base de consumo | ámbito, media y variabilidad de euros por minuto, media y variabilidad de tokens por minuto, límites endurecidos hasta,… | Consumo normal de una clave virtual, sesión o usuario final. El sistema inmunológico compara el consumo actual con ella. Tras un incidente, se endurecen los límites durante 24 horas. |
| IC-20 | Incidente | identificador, tipo, fecha, sesión, agente, parte afectada, respuesta aplicada, {causa raíz, coste del incidente, cota superior del coste atribuible, ahorro estimado con su hipótesis}, huellas de las llamadas implicadas, estado,… | "tipo": bucle, consumo anómalo, presupuesto agotado o herramienta denegada. "estado": abierto, revisado o cerrado. Solo hay ahorro si Unburn detuvo o frenó algo; si solo avisó, se muestra el coste previsto. |
| IC-21 | Agregado de gasto | cliente, clave virtual, intervalo de 15 minutos, euros gastados, peticiones facturables,… | Totales que se conservan 13 meses. Sirven para facturar, para los informes y para reconstruir los contadores si se pierden. |
| IC-22 | Sello de auditoría | fecha y hora, resumen de todas las cadenas con eventos nuevos, firma,… | Se genera cada pocos minutos y se guarda en un almacenamiento del proveedor de cloud que nadie, ni siquiera Unburn, puede modificar ni borrar. Demuestra que el registro no se ha manipulado. No contiene datos de clientes. |
| IC-23 | Alerta | Igual que IC-20 Incidente (resumen), con enlace al diagnóstico | También se envía al cruzar un límite blando o al llegar al 80% y al 100% de la cuota. |
| IC-24 | Exportación de datos | Igual que IC-16 Evento de auditoría, más la configuración del cliente (claves, presupuestos, permisos) | El cliente puede descargarla en cualquier momento (CSV o JSON), lo que facilita cambiar de proveedor. |

## 4. Gestión interna de Unburn

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| IC-25 | Empleado de Unburn | email, nombre, apellidos, departamento, rol,… | Personas de Soporte, Ventas, Finanzas, Ingeniería, etc. Nunca ven el texto de las peticiones ni las claves reales. |
| IC-26 | Ticket de soporte | nº ticket, cliente, usuario que lo abre, empleado asignado, fecha, descripción, petición relacionada, estado, resolución,… | "estado": abierto, escalado a Ingeniería o cerrado. Se analiza solo con los metadatos del registro. |
| IC-27 | Incidencia técnica | identificador, fecha, origen, componente afectado, gravedad, causa, acciones de recuperación, clientes afectados, notificada a reguladores, estado,… | "origen": alarma de la plataforma o ticket escalado. Son fallos de la propia plataforma de Unburn; no confundir con IC-20 Incidente, que trata el tráfico del cliente. |
| IC-28 | Versión de la plataforma | nº versión, fecha, cambios incluidos, revisión legal, resultado de las pruebas, firma, lista de componentes (SBOM), {porcentaje de tráfico, indicadores}, estado,… | "estado": en pruebas, en despliegue gradual, publicada o revertida. El código se guarda en la plataforma de desarrollo. |
| IC-29 | Socio | nombre, tipo, estado del acuerdo, comisión, {clientes que ha traído},… | "tipo": agencia de automatización, plataforma de automatización y de agentes o marketplace del proveedor de cloud. Hoy son propuestas, no acuerdos firmados. |
| IC-30 | Proveedor de Unburn | nombre, servicio que presta, condiciones del contrato, coste mensual, trata datos de clientes,… | Proveedor de cloud, plataforma de pago o plataforma de desarrollo. Los proveedores de modelos de IA no están aquí porque los contrata el cliente. |
| IC-31 | Informe mensual | mes, ingresos, clientes por plan, peticiones, incidentes, tickets, {costes propios: infraestructura, plan gratuito, comisiones de socios}, estadísticas,… | Lo usan Finanzas y Dirección para decidir precios, prioridades y gasto. Se calcula con facturas, agregados de gasto, incidentes y tickets. |

## 5. Relaciones principales (para el modelo de datos)

"1 : N" significa que uno se relaciona con muchos; "N : M", muchos con muchos.

| Concepto | Relación | Concepto | Cardinalidad |
|---|---|---|---|
| Cliente | tiene | Suscripción | 1 : 1 |
| Suscripción | sigue | Plan | N : 1 |
| Cliente | firma | Contrato Enterprise | 1 : 1 |
| Suscripción | genera | Factura | 1 : N |
| Cliente | tiene | Usuario del panel | 1 : N |
| Cliente | guarda | Clave de proveedor | 1 : N |
| Clave de proveedor | se usa en | Clave virtual | 1 : N |
| Clave virtual | sustituye a (rotación) | Clave virtual | 1 : 1 |
| Clave virtual | permite | Agente | N : M |
| Agente | puede usar (grafo de autorización) | Herramienta | N : M |
| Agente | puede delegar en (grafo de autorización) | Agente | N : M |
| Cliente o Clave virtual | tiene | Presupuesto | 1 : N |
| Sesión | agrupa | Evento de auditoría | 1 : N |
| Evento de auditoría (inicio) | crea | Reserva | 1 : 1 |
| Reserva | aparta dinero en | Presupuesto | N : M |
| Sesión | tiene | Incidente | 1 : N |
| Incidente | se notifica con | Alerta (por cada Canal de alertas) | 1 : N |
| Sello de auditoría | resume | Evento de auditoría | 1 : N |
| Evento de auditoría | se suma en | Agregado de gasto | N : 1 |
| Ticket de soporte | consulta | Evento de auditoría | N : M |
| Ticket de soporte | se escala a | Incidencia técnica | N : 1 |
| Socio | trae | Cliente | 1 : N |