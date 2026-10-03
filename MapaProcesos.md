# Mapa de procesos de Unburn

El mapa de procesos recoge las secuencias de actividades con las que Unburn alcanza sus objetivos. Como Unburn es un SaaS, la empresa emprendedora y la que explota el sistema son la misma, así que se presenta un único mapa.

- **BP-01 a BP-14** son procesos **operativos**: dan el servicio al cliente. Dos de ellos son los **procesos core** (ver apartado 3).
- **BP-15 a BP-18** son procesos **de soporte**: hacen posible que los operativos funcionen.

En la columna *Observaciones*:
- **front-office:** lo hace el cliente desde el panel web.
- **back-office:** lo hace el equipo de Unburn.
- **automático:** lo ejecuta el sistema sin intervención humana.

## 1. Procesos de negocio

| Id | Título | Descripción | Observaciones |
|---|---|---|---|
| BP-01 | Gestionar socios | Buscar, acordar y seguir colaboraciones con agencias de automatización, plataformas de automatización y de agentes y el marketplace del proveedor de cloud; registrar los clientes que traen y pagarles su comisión | Proceso para Ventas (back-office). Los socios son propuestas, no acuerdos firmados. Los clientes captados se dan de alta en BP-03 |
| BP-02 | Vender contrato Enterprise | Atender el interés de una gran empresa, hacer una demostración, superar su revisión de seguridad, negociar un contrato personalizado (precio, disponibilidad garantizada, soporte, retención de datos, estrategia de salida) y elegir la modalidad: nube confidencial o despliegue privado | Proceso para Ventas y Legal (back-office). Solo para grandes empresas y sectores regulados. Termina en el alta del cliente (BP-03) |
| BP-03 | Gestionar suscripción | **Alta:** el administrador registra su organización, acepta el contrato de tratamiento de datos, elige plan y guarda la clave real de su proveedor de modelos de IA, que Unburn cifra; con esto el servicio queda listo para usarse. **Modificación:** cambiar los datos, el plan o el tope de excedente y consultar las facturas. **Anulación:** exportar los datos y darse de baja | Proceso para el administrador del cliente (front-office) y para Ventas en contratos Enterprise (back-office). Las facturas se crean en BP-12. Tras la baja, los datos se borran en 30 días, salvo las facturas (plazo legal) |
| BP-04 | Gestionar usuarios del panel | Creación, consulta, modificación y borrado de los usuarios del panel, con rol administrador (puede cambiarlo todo) o lector (solo consulta) | Proceso para el administrador del cliente (front-office) |
| BP-05 | Gestionar claves virtuales | Creación, consulta, revocación y rotación de claves virtuales (una por equipo, agente o entorno), con sus modelos y agentes permitidos y sus políticas (bucles, fallos, modelo sustituto) | Proceso para el administrador del cliente (front-office). La clave completa se muestra una sola vez. Al rotarla, la nueva hereda la configuración. Después, el desarrollador pone en su código la clave y la dirección de Unburn. Plan Gratis: hasta 3 claves |
| BP-06 | Gestionar presupuestos y alertas | Creación, consulta, modificación y borrado de presupuestos (de la organización o de una clave; diarios o mensuales; con un límite blando que avisa y uno duro que corta) y de los canales donde llegan las alertas | Proceso para el administrador del cliente (front-office). Plan Gratis: alertas solo por email |
| BP-07 | Gestionar permisos de agentes | Revisar las herramientas que Unburn descubre en modo aprendizaje, asignarles una categoría de datos, definir qué herramientas puede usar y en quién puede delegar cada agente, autorizar las herramientas del proveedor, revisar los avisos de caminos indirectos y activar el modo protección | Proceso para el administrador del cliente (front-office). Completo en Pro y Enterprise; la autorización de herramientas del proveedor, en todos los planes |
| BP-08 | **Atender petición de IA** | Recibir cada petición de un agente del cliente, comprobar acceso, agente, opciones, consumo, herramientas, bucles y presupuesto, reservar el gasto, reenviarla al proveedor de modelos de IA, revisar la respuesta, devolverla, liquidar el coste real y dejarlo todo registrado | **Proceso core.** Automático, lo inicia la aplicación del cliente. No guarda el texto de las peticiones. Ver BPMN (apartado 4) |
| BP-09 | **Gestionar incidente** | Registrar cada bucle, consumo anómalo, presupuesto agotado o herramienta denegada, diagnosticar su causa y su coste, estimar el ahorro, avisar al administrador y cerrar el incidente tras su revisión | **Proceso core.** Automático, con participación del administrador del cliente. Lo inicia BP-08. Ver BPMN (apartado 5) |
| BP-10 | Consultar gasto e incidentes | Ver en el panel el gasto del día y del mes por clave, agente y sesión, los incidentes con su diagnóstico y el ahorro estimado | Proceso para el administrador y el lector del cliente (front-office). Los datos salen de BP-08 y BP-09 |
| BP-11 | Auditar el registro | Buscar en el registro qué hizo la IA, cuánto costó y por qué se permitió o bloqueó cada acción, verificar que el registro no se ha manipulado y exportarlo | Proceso para el administrador del cliente y los auditores (front-office). El registro lo genera BP-08 automáticamente, encadenado y sellado. Retención: 7 días (Gratis), 30 días (Pro), 6 meses o más (Enterprise) |
| BP-12 | Generar facturas | Contar las peticiones facturables de cada cliente, avisar al 80% y al 100% de la cuota, cerrar el mes aplicando el plan y el excedente, cobrar a través de la plataforma de pago y emitir la factura | Automático; Finanzas gestiona los cobros fallidos (back-office). Solo cuentan las peticiones que llegan al proveedor de IA. El gasto en IA no lo cobra Unburn: el cliente lo paga al proveedor |
| BP-13 | Atender tickets | Recibir la duda o incidencia de un cliente (por ejemplo, por qué se bloqueó una petición), analizarla con los metadatos del registro, resolverla o escalarla a Ingeniería (BP-17) y cerrar el ticket | Proceso para Soporte (back-office). Soporte nunca ve el texto de las peticiones ni las claves reales |
| BP-14 | Generar informe mensual | Recopilar los ingresos, los clientes por plan, las peticiones, los incidentes, los tickets y los costes propios de Unburn (infraestructura, plan gratuito, comisiones de socios), calcular estadísticas y visualizar el informe | Proceso para Finanzas y Dirección (back-office). Sirve para decidir precios, prioridades del producto y gasto |
| BP-15 | Gestionar catálogo de modelos y precios | Alta, modificación y baja de los modelos de cada proveedor de IA con todas sus tarifas, y de las opciones admitidas en cada API. Una opción nueva solo se admite cuando su precio está registrado | **Proceso de soporte** para Ingeniería (back-office). Si el catálogo está desactualizado, las reservas de BP-08 dejan de cubrir el peor caso |
| BP-16 | Desarrollar y desplegar versiones | Programar un cambio, revisar con Legal si crea obligaciones legales, probarlo de forma automática, firmar la versión y publicarla poco a poco, volviendo atrás automáticamente si empeoran los indicadores | **Proceso de soporte** para Ingeniería (back-office). Usa la plataforma de desarrollo. Las dependencias se fijan y verifican para evitar ataques a la cadena de suministro |
| BP-17 | Resolver incidencia técnica | Recibir una alarma de la plataforma o un ticket escalado, diagnosticar el fallo, mitigarlo, recuperar el servicio (por ejemplo, reconstruir los contadores de gasto) y documentarlo. Si es grave, avisar a los clientes afectados y, con Legal, a los reguladores | **Proceso de soporte** para Ingeniería y Ciberseguridad (back-office), con equipo de guardia. Meta: 99,9% de disponibilidad. No confundir con BP-09, que trata los problemas del tráfico del cliente |
| BP-18 | Gestionar proveedores | Alta, revisión y baja de los proveedores de Unburn (proveedor de cloud, plataforma de pago, plataforma de desarrollo): comparar ofertas, firmar el contrato, revisar costes y condiciones, y avisar a los clientes si cambia algún proveedor que trata sus datos | **Proceso de soporte** para Finanzas y Legal (back-office). Los proveedores de modelos de IA no se gestionan aquí, porque los contrata el cliente |

## 2. Cómo se encadenan los procesos

- **BP-01** y **BP-02** traen clientes, que se dan de alta en **BP-03**.
- Tras el alta, el administrador configura **BP-04**, **BP-05**, **BP-06** y **BP-07**. Con las claves creadas, el tráfico del cliente empieza a pasar por **BP-08**.
- **BP-08** inicia **BP-09** cuando detecta un problema. Desde **BP-09**, el administrador puede volver a **BP-05**, **BP-06** o **BP-07** para ajustar la configuración.
- **BP-08** alimenta **BP-10** (gasto), **BP-11** (registro) y **BP-12** (peticiones facturables).
- **BP-12** y **BP-13** aportan datos a **BP-14**.
- **BP-13** pasa a **BP-17** cuando una incidencia es técnica.
- **BP-15**, **BP-16**, **BP-17** y **BP-18** sostienen a **BP-08**.

## 3. Procesos core

Los procesos core de Unburn son **BP-08 Atender petición de IA** y **BP-09 Gestionar incidente**:

- **BP-08** es el corazón del negocio. Cada petición de cada cliente pasa por él, y es donde Unburn resuelve los cuatro problemas que justifican su existencia: gasto descontrolado, falta de control, riesgo en las herramientas y falta de trazabilidad. También es lo que se factura.
- **BP-09** convierte lo que detecta BP-08 en valor visible para el cliente: alertas, diagnóstico de la causa, coste del problema y ahorro estimado. Contiene buena parte de lo que diferencia a Unburn (diagnóstico causal y sistema inmunológico).

## 4. Diagrama BPMN de BP-08 Atender petición de IA

**Participantes**
- Pool **Aplicación del cliente** (colapsado): el agente de IA que envía la petición.
- Pool **Unburn**, con dos carriles:
  - **Gateway:** controles en tiempo real.
  - **Servicios de apoyo:** registro y estadísticas, sin hacer esperar al cliente.
- Pool **Proveedor de modelos de IA** (colapsado): genera la respuesta.

**Flujo** (carril Gateway, salvo que se indique otro)

1. **[Inicio de mensaje]** *Petición recibida*, desde la aplicación del cliente.
2. **[Tarea] Validar acceso:** límite de volumen, clave virtual válida, API admitida y cuota del plan disponible.
3. **[Compuerta] ¿Acceso válido?** No → rechazo (429, 401, 403 o 402).
4. **[Tarea] Identificar sesión y agente:** lee las cabeceras de la petición y añade la llamada al grafo de sesión.
5. **[Compuerta] ¿Agente permitido para esa clave?** No → rechazo (403).
6. **[Tarea] Normalizar petición:** comprueba que las opciones están admitidas, fija la cuenta del proveedor a la que se carga, ajusta el tamaño máximo de respuesta y estima los tokens de entrada.
7. **[Compuerta] ¿Petición admitida y dentro de los límites del cliente?** No → rechazo (400 o 403).
8. **[Tarea] Analizar consumo (sistema inmunológico):** compara la velocidad de gasto con la habitual.
9. **[Compuerta] ¿Consumo anómalo?**
   - No → sigue.
   - Sí, y la respuesta es frenar o bloquear → *Incidente detectado* y rechazo (429).
   - Sí, y la respuesta es avisar o cambiar a un modelo económico (si el cliente lo configuró) → *Incidente detectado* y sigue.
10. **[Tarea] Filtrar herramientas (escudo MCP):** quita las herramientas del cliente no permitidas y deja solo las del proveedor autorizadas, con sus usos limitados.
11. **[Compuerta] ¿Obliga a usar una herramienta no permitida?** Sí → rechazo (403).
12. **[Tarea] Comprobar bucles:** aplica las reglas de repetición al contenido nuevo de la sesión.
13. **[Compuerta] ¿Bucle?**
    - No → sigue.
    - Sí, en modo aviso → marca la respuesta, *Incidente detectado* y sigue.
    - Sí, en modo bloqueo → *Incidente detectado* y rechazo (422).
14. **[Tarea] Reservar presupuesto:** aparta el coste máximo posible en todos los presupuestos afectados a la vez y escribe el registro de inicio.
15. **[Compuerta] ¿Cabe en todos los presupuestos?** No → *Incidente detectado* y rechazo (402). Si solo cruza un límite blando, se envía un aviso y sigue.
16. **[Tarea de envío] Reenviar al proveedor**, con la clave real del cliente.
17. **[Tarea de recepción] Recibir respuesta** del proveedor, con dos **eventos de borde**:
    - **[Temporizador] Tiempo agotado** → *Liquidar con estimación* → fin con error (504).
    - **[Error] Fallo del proveedor** → *Liquidar con estimación* → fin con error (502).
18. **[Tarea] Revisar herramientas pedidas:** comprueba si el modelo pide usar alguna herramienta del cliente.
19. **[Compuerta] ¿Pide una herramienta no permitida?**
    - Sí → **[Tarea] Bloquear respuesta** (403, o corte si es streaming), *Incidente detectado* y pasa al paso 21.
    - No → sigue.
20. **[Tarea de envío] Devolver respuesta al cliente**, trozo a trozo si es streaming.
21. **[Tarea] Liquidar gasto:** calcula el coste real con el consumo que informa el proveedor, libera el resto de la reserva y escribe el registro de cierre.
22. **[Compuerta paralela]**:
    - → **[Fin]** *Petición finalizada*.
    - → carril **Servicios de apoyo**: **[Tarea] Registrar y actualizar** (guarda los registros de auditoría y actualiza el gasto, el grafo de sesión y el consumo habitual) → **[Fin]**.

**Notas**
- Cada "rechazo" es un **[Fin de error] Petición rechazada** que devuelve el código indicado al cliente. Las peticiones rechazadas quedan en el registro, pero no cuentan para la cuota del plan (BP-12).
- Cada *Incidente detectado* es un **[Evento intermedio de envío de mensaje]** que inicia BP-09.
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
2. **[Tarea] Registrar incidente:** tipo, sesión, agente, parte afectada y respuesta aplicada.
3. **[Compuerta paralela]** abre dos ramas:
   - **Rama A:** **[Compuerta] ¿Consumo anómalo en plan Pro o Enterprise?** Sí → **[Tarea, carril Gateway] Endurecer límites:** límites más estrictos sobre la parte afectada durante 24 horas. No → sigue.
   - **Rama B:** **[Tarea] Calcular coste del incidente** → **[Compuerta] ¿Es un bucle?** Sí → **[Tarea] Diagnosticar causa:** recorre el grafo de sesión para obtener la causa raíz, el coste del bucle y la cota superior del coste atribuible. → **[Compuerta] ¿Unburn detuvo o frenó algo?**
     - Sí → **[Tarea] Estimar ahorro:** rango con su hipótesis visible.
     - No → **[Tarea] Calcular coste previsto** si el problema continúa.
4. **[Compuerta paralela de unión]** → **[Tarea] Publicar diagnóstico** en el panel.
5. **[Tarea de envío] Enviar alerta** por los canales configurados (email, mensajería de equipo o webhook), con enlace al diagnóstico.
6. **[Evento intermedio de recepción de mensaje]** *Incidente revisado*, desde el administrador.
7. **[Tarea] Cerrar incidente** → **[Fin]** *Incidente cerrado*.

**Flujo en el Administrador del cliente**

1. **[Inicio de mensaje]** *Alerta recibida*.
2. **[Tarea] Revisar incidente** en el panel: causa, coste y ahorro.
3. **[Compuerta] ¿Hay que cambiar la configuración?**
   - Sí → **[Subproceso reutilizable] Ajustar configuración:** cambiar claves, presupuestos o permisos (BP-05, BP-06 o BP-07), o el tope de excedente (BP-03).
   - No → sigue.
4. **[Tarea de envío] Marcar incidente como revisado** → mensaje a Unburn.
5. **[Fin]** *Incidente revisado*.

**Nota:** si el administrador no revisa el incidente, este sigue abierto en el panel y Unburn mantiene la respuesta configurada.