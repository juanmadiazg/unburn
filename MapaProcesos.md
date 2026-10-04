# Mapa de procesos de Unburn

El mapa de procesos recoge las secuencias de actividades con las que Unburn alcanza sus objetivos. Como Unburn es un SaaS, la empresa emprendedora y la que explota el sistema son la misma, así que se presenta un único mapa.

La excepción es el despliegue privado, en el que el cliente explota su propia instalación. Por eso ahí cambian algunos procesos:
- no se aplica BP-12, porque se paga una licencia anual;
- el registro y los sellos de BP-19 quedan en la infraestructura del cliente;
- la operación diaria de la plataforma (BP-17) la hace el cliente con el soporte de Unburn.

Cada proceso pertenece a uno de estos tres grupos, indicado al principio de la columna *Observaciones*:
- **Front-office:** lo hace el cliente desde el panel web.
- **Back-office:** lo hace el equipo de Unburn.
- **Automático:** lo ejecuta el sistema sin intervención humana.

Los procesos **BP-08** y **BP-09** son los **procesos core** de Unburn (ver apartado 3).

## 1. Procesos de negocio

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| BP-01 | Gestionar socios | Buscar, acordar y seguir colaboraciones con agencias de automatización, plataformas de automatización y de agentes y el marketplace del proveedor de cloud; registrar los clientes que traen y calcular su comisión, que paga Finanzas | **Back-office.** Lo hace Ventas. Los socios son propuestas, no acuerdos firmados. Los clientes captados se dan de alta en BP-03 |
| BP-02 | Vender contrato Enterprise | Atender el interés de una gran empresa, hacer una demostración, superar su revisión de seguridad, negociar un contrato personalizado (precio, disponibilidad garantizada, soporte, retención de datos, estrategia de salida) y elegir la modalidad: nube confidencial o despliegue privado | **Back-office.** Lo hacen Ventas y Legal. Solo para grandes empresas y sectores regulados. Termina en el alta del cliente (BP-03) |
| BP-03 | Gestionar suscripción | **Alta:** el administrador registra su organización, acepta el contrato de tratamiento de datos, elige plan y guarda la clave real de su proveedor de modelos de IA, que Unburn cifra; después, el administrador crea las claves virtuales (BP-05) para empezar a enviar tráfico. **Modificación:** cambiar los datos, el plan o el tope de excedente, sustituir la clave real del proveedor (por ejemplo, si el proveedor la ha cambiado o se ha filtrado) y consultar las facturas. **Anulación:** exportar los datos y darse de baja | **Front-office.** Lo hace el administrador del cliente; en los contratos Enterprise, Ventas prepara el alta. Las facturas se crean en BP-12. Tras la baja, los datos se borran en 30 días (BP-19). Se conservan solo las facturas (plazo legal), los agregados de gasto hasta cerrar la última factura y los sellos de auditoría hasta que vence su bloqueo (no contienen datos personales) |
| BP-04 | Gestionar usuarios del panel | Creación, consulta, modificación y borrado de los usuarios del panel, con rol administrador (puede cambiarlo todo) o lector (solo consulta) | **Front-office.** Lo hace el administrador del cliente |
| BP-05 | Gestionar claves virtuales | Creación, consulta, modificación, revocación y rotación de claves virtuales (una por equipo, agente o entorno), con sus modelos y agentes permitidos y sus políticas (bucles, fallos, modelo sustituto), y alta, modificación y baja de los agentes que se asignan a cada clave | **Front-office.** Lo hace el administrador del cliente. La clave completa se muestra una sola vez. Al rotarla, la nueva hereda la configuración, lo gastado en el periodo actual y la línea base de consumo. Después, el desarrollador pone en su código la clave y la dirección de Unburn. Plan Gratis: hasta 3 claves |
| BP-06 | Gestionar presupuestos y alertas | Creación, consulta, modificación y borrado de presupuestos (de la organización o de una clave; diarios o mensuales; con un límite blando que avisa y uno duro que corta) y de los canales donde llegan las alertas | **Front-office.** Lo hace el administrador del cliente. Plan Gratis: alertas solo por email |
| BP-07 | Gestionar permisos de agentes | Revisar las herramientas que Unburn descubre en modo aprendizaje, asignarles una categoría de datos, definir qué herramientas puede usar cada agente, o cada clave que no tenga lista de agentes, y en quién puede delegar cada agente, autorizar las herramientas del proveedor, revisar los avisos de caminos indirectos y activar el modo protección | **Front-office.** Lo hace el administrador del cliente. Completo en Pro y Enterprise; la autorización de herramientas del proveedor, en todos los planes |
| BP-08 | **Atender petición de IA** | Recibir cada petición de un agente del cliente, comprobar acceso, agente, modelo, opciones, consumo, herramientas, bucles y presupuesto, reservar el gasto, reenviarla al proveedor de modelos de IA, revisar la respuesta, devolverla, liquidar el coste real y dejarlo todo registrado | **Automático.** **Proceso core.** Lo inicia la aplicación del cliente. No guarda el texto de las peticiones. Ver BPMN (apartado 4) |
| BP-09 | **Gestionar incidente** | Registrar cada bucle, consumo anómalo, presupuesto agotado o herramienta denegada, diagnosticar su causa y su coste, estimar el ahorro, avisar al administrador y cerrar el incidente tras su revisión | **Automático.** **Proceso core.** Lo inicia BP-08; el administrador del cliente revisa el incidente. Ver BPMN (apartado 5) |
| BP-10 | Consultar gasto e incidentes | Ver en el panel el gasto del día y del mes por clave y, dentro del plazo de retención del plan, por agente y por sesión, los incidentes con su diagnóstico y el ahorro estimado | **Front-office.** Lo hacen el administrador y el lector del cliente. Los datos salen de BP-08 y BP-09 |
| BP-11 | Auditar el registro | Buscar en el registro qué hizo la IA, cuánto costó y por qué se permitió o bloqueó cada acción, verificar que el registro no se ha manipulado y exportarlo | **Front-office.** Lo hacen el administrador y los usuarios lectores del cliente. Los auditores acceden con el rol lector o trabajan con una exportación. El registro lo genera BP-08 y lo sella BP-19. Retención: 7 días (Gratis), 30 días (Pro), 6 meses o más (Enterprise) |
| BP-12 | Generar facturas | Contar las peticiones facturables de cada cliente, avisar al 80% y al 100% de la cuota y, en el plan Pro, del tope de excedente, cerrar el mes aplicando el plan y el excedente, cobrar a través de la plataforma de pagos y emitir la factura | **Automático.** Finanzas gestiona los cobros fallidos. Cuentan las peticiones de generación (Chat Completions, Responses API o Messages) que se reenvían al proveedor de IA, aunque fallen o se bloquee su respuesta. El gasto en IA no lo cobra Unburn: el cliente lo paga al proveedor. No se aplica al despliegue privado, que se paga con una licencia anual (contrato Enterprise) |
| BP-13 | Atender tickets | Recibir la duda o incidencia de un cliente (por ejemplo, por qué se bloqueó una petición), analizarla con los metadatos del registro, resolverla o escalarla a Ingeniería (BP-17) y cerrar el ticket | **Back-office.** Lo hace Soporte. Soporte nunca ve el texto de las peticiones ni las claves reales |
| BP-14 | Generar informe mensual | Recopilar los ingresos, los clientes por plan, las peticiones, los incidentes, los tickets y los costes propios de Unburn (infraestructura, plan gratuito, comisiones de socios), calcular estadísticas y visualizar el informe | **Back-office.** Lo prepara Finanzas para Dirección. Sirve para decidir precios, prioridades del producto y gasto. Si Dirección cambia los precios, Finanzas actualiza los planes |
| BP-15 | Gestionar catálogo de modelos y precios | Alta, modificación y baja de los modelos de cada proveedor de IA con todas sus tarifas, y de las opciones admitidas en cada API. Una opción nueva solo se admite cuando su precio está registrado | **Back-office.** Lo hace Ingeniería. Si el catálogo está desactualizado, las reservas de BP-08 dejan de cubrir el peor caso |
| BP-16 | Desarrollar y desplegar versiones | Programar un cambio, revisar con Legal si crea obligaciones legales, probarlo de forma automática, firmar la versión y publicarla poco a poco, volviendo atrás automáticamente si empeoran los indicadores | **Back-office.** Lo hace Ingeniería con la plataforma de desarrollo. Las dependencias se fijan y verifican para evitar ataques a la cadena de suministro |
| BP-17 | Resolver incidencia técnica | Recibir una alarma de la plataforma o un ticket escalado, diagnosticar el fallo, mitigarlo, recuperar el servicio (por ejemplo, ampliando recursos o volviendo a una versión anterior) y documentarlo. Si es grave, avisar a los clientes afectados y, con Legal, a los reguladores | **Back-office.** Lo hacen Ingeniería y Ciberseguridad, con equipo de guardia. Meta: 99,9% de disponibilidad. No confundir con BP-09, que trata los problemas del tráfico del cliente |
| BP-18 | Gestionar proveedores | Alta, revisión y baja de los proveedores de Unburn (proveedor de cloud, plataforma de pagos, plataforma de desarrollo): comparar ofertas, firmar el contrato, revisar costes y condiciones, y avisar a los clientes si cambia algún proveedor que trata sus datos | **Back-office.** Lo hacen Finanzas y Legal. Los proveedores de modelos de IA no se gestionan aquí, porque los contrata el cliente |
| BP-19 | Mantener registro y contadores | Generar cada pocos minutos el sello firmado del registro de auditoría, convertir en gasto estimado las reservas que vencen sin liquidarse, comparar los contadores de gasto con la base de datos y reconstruirlos si se pierden, y borrar los datos cuando vence su retención y tras la baja | **Automático.** Se ejecuta de forma periódica. Los sellos se guardan en un almacenamiento del proveedor de cloud (en despliegue privado, en la infraestructura del cliente) que nadie puede modificar |

## 2. Cómo se encadenan los procesos

- **BP-01** y **BP-02** traen clientes, que se dan de alta en **BP-03**.
- Tras el alta, el administrador configura **BP-04**, **BP-05**, **BP-06** y **BP-07**. Con las claves creadas, el tráfico del cliente empieza a pasar por **BP-08**.
- **BP-08** inicia **BP-09** cuando detecta un problema. Desde **BP-09**, el administrador puede volver a **BP-05**, **BP-06** o **BP-07** para ajustar la configuración.
- Desde los avisos de cuota y de tope de **BP-12**, el administrador puede ir a **BP-03** para mejorar de plan o subir el tope.
- **BP-08** alimenta **BP-10** (gasto), **BP-11** (registro) y **BP-12** (peticiones facturables).
- **BP-14** usa datos de:
  - **BP-03** (clientes por plan);
  - **BP-08** (agregados de gasto);
  - **BP-09** (incidentes);
  - **BP-12** (facturas);
  - **BP-13** (tickets);
  - **BP-01** (comisiones);
  - **BP-18** (costes de proveedores).
- **BP-13** pasa a **BP-17** cuando una incidencia es técnica.
- **BP-15**, **BP-16**, **BP-17** y **BP-18** sostienen a **BP-08**.
- **BP-19** sostiene a **BP-08** y a **BP-11**.

## 3. Procesos core

Los procesos core de Unburn son **BP-08 Atender petición de IA** y **BP-09 Gestionar incidente**:

- **BP-08** es el corazón del negocio. Cada petición de cada cliente pasa por él, y es donde Unburn resuelve los cuatro problemas que justifican su existencia: gasto descontrolado, falta de control, riesgo en las herramientas y falta de trazabilidad. También es lo que se factura.
- **BP-09** convierte lo que detecta BP-08 en valor visible para el cliente: alertas, diagnóstico de la causa, coste del problema y ahorro estimado. Contiene buena parte de lo que diferencia a Unburn (diagnóstico causal y sistema inmunológico).

## 4. Diagrama BPMN de BP-08 Atender petición de IA

**Participantes**
- Pool **Aplicación del cliente** (colapsado): el agente de IA que envía la petición y recibe la respuesta o el error.
- Pool **Unburn**, con dos carriles:
  - **Gateway:** controles en tiempo real.
  - **Servicios de apoyo:** registro y estadísticas, sin hacer esperar al cliente.
- Pool **Proveedor de modelos de IA** (colapsado): genera la respuesta.

**Flujo principal** (carril Gateway, salvo que se indique otro)

1. **[Inicio de mensaje]** *Petición recibida*, desde la aplicación del cliente.
2. **[Tarea] Validar acceso:** límite de volumen, rechazo barato (la clave ya agotó su presupuesto o la cuota), clave virtual válida, API admitida y cuota del plan disponible.
3. **[Compuerta exclusiva] ¿Acceso válido?** No → **camino de rechazo** (429, 402, 401 o 403).
4. **[Tarea] Identificar sesión y agente:** lee las cabeceras de la petición y añade la llamada al grafo de sesión.
5. **[Compuerta exclusiva] ¿Agente permitido para esa clave?** No → **camino de rechazo** (403).
6. **[Tarea] Normalizar petición:** comprueba que el modelo está entre los permitidos de la clave virtual, que las opciones están admitidas y que las respuestas a las que hace referencia son de la misma clave; fija la cuenta del proveedor a la que se carga, ajusta el tamaño máximo de respuesta y estima los tokens de entrada.
7. **[Compuerta exclusiva] ¿Petición admitida y dentro de los límites del cliente?** No → **camino de rechazo** (400 o 403).

   **[Compuerta exclusiva] ¿Petición de generación?**
   - No (lista de modelos, contar tokens, consultar o borrar una respuesta) → unión 16, sin reservar.
   - Sí → paso 8.
8. **[Tarea] Analizar consumo (sistema inmunológico):** compara la velocidad de gasto con la habitual.
9. **[Compuerta exclusiva] ¿Consumo anómalo?**
   - No → unión 9.
   - Sí, avisar → *Incidente detectado* → unión 9.
   - Sí, cambiar de modelo (si el cliente lo configuró) → *Incidente detectado* → **[Tarea] Sustituir por modelo económico** → unión 9.
   - Sí, frenar o bloquear → *Incidente detectado* → **camino de rechazo** (429).

   **[Compuerta exclusiva de unión 9]** → paso 10.
10. **[Tarea] Filtrar herramientas (escudo MCP):**
    - **Herramientas del proveedor** (todos los planes): deja solo las autorizadas, con sus usos limitados.
    - **Herramientas del cliente** (Pro y Enterprise):
      - En modo aprendizaje no se quita ninguna: se registran y las nuevas se añaden al catálogo.
      - En modo protección se quitan las que el agente no tiene permitidas (o la clave, si no tiene lista de agentes).

    **[Compuerta exclusiva] ¿Se ha quitado una herramienta del cliente que no estaba en el catálogo?**
    - Sí → *Incidente detectado* (herramienta denegada) → unión 10.
    - No → unión 10.

    **[Compuerta exclusiva de unión 10]** → paso 11.
11. **[Compuerta exclusiva] ¿Obliga a usar una herramienta quitada, o alguna si no queda ninguna?** Sí → *Incidente detectado* → **camino de rechazo** (403).
12. **[Tarea] Comprobar bucles:** aplica las reglas de repetición al contenido nuevo de la sesión.
13. **[Compuerta exclusiva] ¿Bucle?**
    - No → unión 13.
    - Sí, en modo aviso → **[Tarea] Marcar respuesta** → *Incidente detectado* → unión 13.
    - Sí, en modo bloqueo → *Incidente detectado* → **camino de rechazo** (422).

    **[Compuerta exclusiva de unión 13]** → paso 14.
14. **[Tarea] Reservar presupuesto:** aparta el coste máximo posible en todos los presupuestos afectados a la vez y escribe el registro de inicio. Si se cruza un límite blando, encarga un aviso al servicio de alertas.
15. **[Compuerta exclusiva] ¿Cabe en todos los presupuestos?** No → *Incidente detectado* → **camino de rechazo** (402).
16. **[Compuerta exclusiva de unión 16]:** junta las peticiones de generación (paso 15) y las auxiliares (paso 7).

    **[Tarea de envío] Reenviar al proveedor**, con la clave real del cliente.
17. **[Compuerta basada en eventos]** espera lo primero que ocurra:
    - **[Recepción de mensaje] Respuesta recibida**, desde el proveedor → paso 18.
    - **[Recepción de mensaje] Rechazo de entrada del proveedor** (no genera nada: petición incorrecta, su propio límite de velocidad o clave real inválida) → **[Tarea] Liberar la reserva sin gasto** → **[Tarea de envío] Devolver el error del proveedor** tal cual → unión 21.
    - **[Recepción de mensaje] Fallo a medias del proveedor** (la generación ya había empezado, o no se puede saber si empezó) → **[Tarea] Liquidar con estimación** → **[Tarea de envío] Devolver error** (502) → unión 21.
    - **[Temporizador] Tiempo agotado** → **[Tarea] Cancelar petición y liquidar con estimación** → **[Tarea de envío] Devolver error** (504) → unión 21.
    - **[Recepción de mensaje] Cliente desconectado**, desde la aplicación del cliente → **[Tarea] Cancelar petición y liquidar con estimación** → unión 21.
18. **[Tarea] Revisar herramientas pedidas:** comprueba si el modelo pide usar alguna herramienta del cliente.
19. **[Compuerta exclusiva] ¿Pide una herramienta no permitida, en modo protección?**
    - Sí → **[Tarea de envío] Bloquear respuesta** (403, o corte si es streaming) → *Incidente detectado* → unión 19.
    - No → **[Tarea de envío] Devolver respuesta al cliente** (trozo a trozo si es streaming) → unión 19. En modo aprendizaje, la respuesta se devuelve y la herramienta solo se registra.

    **[Compuerta exclusiva de unión 19]** → paso 20.
20. **[Tarea] Liquidar gasto:** calcula el coste real con el consumo que informa el proveedor, lo suma al gasto de todos los presupuestos afectados, libera el resto de la reserva y escribe el registro de cierre → unión 21. Las peticiones auxiliares no liquidan gasto: solo se registran.
21. **[Compuerta exclusiva de unión 21]:** junta la liquidación normal (paso 20), las salidas de rechazo de entrada, fallo a medias, tiempo agotado y desconexión del paso 17, y el camino de rechazo.
22. **[Compuerta paralela]**:
    - → **[Fin]** *Petición finalizada*.
    - → carril **Servicios de apoyo**: **[Tarea] Registrar y actualizar** → **[Fin]**. Esta tarea:
      - guarda en el registro de auditoría la decisión y su motivo, también de los rechazos y de las peticiones fallidas;
      - actualiza el grafo de sesión y el catálogo de herramientas vistas;
      - si la petición llegó al proveedor, actualiza además los agregados de gasto y el consumo habitual;
      - si además era una petición de generación, actualiza la cuota del plan.

**Camino de rechazo**

Todas las salidas "camino de rechazo" (pasos 3, 5, 7, 9, 11, 13 y 15) llegan a:
- **[Compuerta exclusiva de unión] Rechazos** → **[Tarea de envío] Devolver rechazo**, con un flujo de mensaje hacia la aplicación del cliente que lleva el código de error → unión 21.

**Notas**
- Cada *Incidente detectado* es un **[Evento intermedio de envío de mensaje]** que inicia BP-09. Si ya hay un incidente abierto con la misma causa y la misma parte afectada, y ha tenido actividad en la última hora (ejemplo), BP-09 lo actualiza en lugar de crear otro. Así, un ataque de cientos de peticiones genera un solo incidente y una sola alerta.
- **Qué cuenta para la cuota:**
  - Las peticiones que rechaza Unburn no llegan al proveedor: no tienen gasto ni cuentan para la cuota (BP-12).
  - Las peticiones de generación que el proveedor rechaza de entrada no tienen gasto, porque se libera la reserva. Sí cuentan para la cuota, porque Unburn las reenvió.
  - Las que fallan a medias, se cancelan, agotan el tiempo o tienen la respuesta bloqueada tienen gasto (real o estimado) y cuentan para la cuota.
  - Las peticiones auxiliares (lista de modelos, contar tokens, consultar o borrar una respuesta) no tienen coste: no pasan por la reserva ni cuentan para la cuota. En ellas, las tareas de liberar o liquidar no mueven ningún gasto.
- Los rechazos rápidos de claves sin presupuesto se registran agrupados, como un resumen cada pocos segundos.
- Las peticiones con una clave virtual que no existe no pertenecen a ningún cliente. Se registran en los registros técnicos de la plataforma, no en el registro de auditoría. Las de claves revocadas sí se auditan.
- Si falla un componente interno de Unburn, se aplica la política ante fallos de la clave: por defecto, rechazar (503).

## 5. Diagrama BPMN de BP-09 Gestionar incidente

**Participantes**
- Pool **Unburn**, con dos carriles:
  - **Servicios de apoyo:** registro, diagnóstico y alertas.
  - **Gateway:** aplica los límites.
- Pool **Administrador del cliente**.

La respuesta inmediata (rechazar, frenar, cambiar de modelo o solo avisar) ya la aplicó BP-08 en la propia petición. Este proceso gestiona lo que viene después.

**Flujo en Unburn** (carril Servicios de apoyo, salvo que se indique otro)

1. **[Inicio de mensaje]** *Incidente detectado*, desde BP-08: bucle, consumo anómalo, presupuesto agotado o herramienta denegada.
2. **[Tarea] Registrar o actualizar incidente:**
   - Si ya hay uno abierto con la misma causa y la misma parte afectada, y ha tenido actividad en la última hora (ejemplo), lo actualiza (peticiones afectadas, coste).
   - Si no, crea uno nuevo con su tipo, sesión, agente, parte afectada y respuesta aplicada, que tendrá su propia alerta y, si corresponde, su endurecimiento de límites.
3. **[Compuerta exclusiva] ¿Incidente nuevo?**
   - No → **[Fin]** *Incidente actualizado* (no se envía otra alerta).
   - Sí → paso 4.
4. **[Compuerta paralela de división]** abre dos ramas:
   - **Rama A**
     - **[Compuerta exclusiva] ¿Consumo anómalo en plan Pro o Enterprise?**
       - Sí → **[Tarea, carril Gateway] Endurecer límites:** límites más estrictos sobre la parte afectada durante 24 horas → unión A.
       - No → unión A.
     - **[Compuerta exclusiva de unión A]** → paso 5.
   - **Rama B**
     - **[Tarea] Calcular coste del incidente.**
     - **[Compuerta exclusiva] ¿Es un bucle en plan Pro o Enterprise?**
       - Sí → **[Tarea] Diagnosticar causa:** recorre el grafo de sesión para obtener la causa raíz, el coste del bucle y la cota superior del coste atribuible → unión B1.
       - No → unión B1.
     - **[Compuerta exclusiva de unión B1].**
     - **[Compuerta exclusiva] ¿Qué pasó con el gasto?**
       - Unburn lo detuvo o frenó (bucle bloqueado, presupuesto agotado o consumo anómalo frenado o bloqueado) → **[Tarea] Estimar ahorro:** rango con su hipótesis visible → unión B2.
       - El gasto continúa (bucle en modo aviso, o consumo anómalo con aviso o cambio de modelo) → **[Tarea] Calcular coste previsto** si el problema sigue → unión B2.
       - Herramienta denegada (no hay gasto que estimar) → unión B2.
     - **[Compuerta exclusiva de unión B2]** → paso 5.
5. **[Compuerta paralela de unión]:** espera a la unión A y a la unión B2.
6. **[Tarea] Publicar diagnóstico** en el panel.
7. **[Tarea de envío] Enviar alerta** por los canales configurados (email, mensajería de equipo o webhook), con enlace al diagnóstico.
8. **[Evento intermedio de recepción de mensaje]** *Incidente revisado*, desde el administrador.
9. **[Tarea] Cerrar incidente** → **[Fin]** *Incidente cerrado*.

**Flujo en el Administrador del cliente**

1. **[Inicio de mensaje]** *Alerta recibida*.
2. **[Tarea] Revisar incidente** en el panel: causa, coste y ahorro.
3. **[Compuerta exclusiva] ¿Hay que cambiar la configuración?**
   - Sí → **[Subproceso reutilizable] Ajustar configuración:** cambiar claves, presupuestos o permisos (BP-05, BP-06 o BP-07) → unión.
   - No → unión.
4. **[Compuerta exclusiva de unión]** → **[Tarea de envío] Marcar incidente como revisado** → mensaje a Unburn.
5. **[Fin]** *Incidente revisado*.

**Nota:** si el administrador no revisa el incidente, este sigue abierto en el panel y Unburn mantiene la respuesta configurada. Mientras tenga actividad en la última hora (ejemplo), los nuevos avisos con la misma causa y la misma parte afectada lo actualizan sin enviar otra alerta. Pasado ese tiempo sin actividad, un nuevo aviso crea otro incidente, con su alerta y su endurecimiento de límites.