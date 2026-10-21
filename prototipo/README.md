# Unburn · Prototipo no funcional (v2)

Prototipo navegable de **Unburn**, construido a partir del documento de arquitectura empresarial en su versión final, *Unburn_Entrega2_LaTeX* (2.ª entrega). Cubre cuatro zonas:

- la **web pública** (landing con la tabla de precios de 2.4, login y registro);
- el **alta de autoservicio** (BP-03);
- el **Panel web del cliente** (AP-01);
- la **Consola de back-office** de Unburn (AP-12).

No hay backend. Los datos de partida son inventados y vienen de archivos JSON. Un **motor de simulación** en el navegador hace que el producto «esté vivo»:

- el Gateway atiende peticiones cada 1–3 segundos;
- suben el gasto, la cuota y los contadores;
- aparecen eventos nuevos en el registro de auditoría;
- se ve el patrón reservar y liquidar en los presupuestos.

Todas las acciones tienen respuesta visual (modales, toasts, cambios de estado), pero nada se guarda: al recargar la página o con «Restablecer datos de ejemplo», todo vuelve al estado inicial.

La versión anterior (estática, con la hora fija) está en `../prototipo-v1`.

---

## Cómo arrancarlo

Requisitos: Node.js 18 o superior (probado con Node 22.17 y npm 10.9).

```bash
cd prototipo
npm install
npm run dev          # http://localhost:5173
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Versión de producción en `dist/` |
| `npm run preview` | Sirve la versión compilada (http://localhost:4173) |

La página de inicio (`/#/`) es la landing pública. Para entrar al panel:

- pulsa **«Ver la demo del panel»**, que lleva al login con accesos de demostración;
- o ve directamente a `/#/app`.

---

## Cómo usar la demo

### Usuarios de demostración

Se eligen en el menú **«Demo»**, arriba a la derecha, o en la pantalla de login.

| Usuario | Zona | Rol / departamento | Qué enseña |
|---|---|---|---|
| Laura Gómez | Panel web · Nexo Analytics (Pro) | Administradora | Todo el panel con permisos completos |
| Carlos Ruiz | Panel web · Nexo Analytics (Pro) | Lector (auditor externo) | Las mismas pantallas en solo lectura. Puede exportar y verificar el registro, usar el probador y abrir tickets |
| Pablo Martín | Panel web · cuenta personal (Gratis) | Administrador | Límites del plan Gratis: 3 claves, solo email, sin diagnóstico causal, sistema inmunológico básico |
| Sergio Campos | Back-office | Dirección | Cuadro de mando e informe mensual |
| Marta Soler | Back-office | Soporte | Tickets |
| Diego Navarro | Back-office | Ingeniería y Ciberseguridad | Incidencias técnicas, versiones, catálogo de modelos y tickets escalados |
| Javier Lozano | Back-office | Ventas | Contratos Enterprise y socios |
| Elena Prieto | Back-office | Finanzas | Cobros, proveedores, socios (comisiones) e informe mensual |
| Lucía Herrera | Back-office | Legal y cumplimiento | Revisión legal de contratos, proveedores y notificación a reguladores |

En el back-office cada empleado solo ve las secciones de su departamento (AP-12). Si entra por URL a otra, ve «Esta sección no es de tu departamento».

### Simulación en directo

- **Indicador «En directo»** en la barra superior: pausa o reanuda la simulación (también con la tecla Espacio) y cambia la velocidad entre **1×** y **10×**.
- **Tráfico de fondo:** los agentes de Nexo Analytics, y de vez en cuando los de Pablo, hacen peticiones verosímiles con su clave, su modelo, sus herramientas y su sesión. El coste se calcula con el catálogo de modelos (IC-14).
- **Reservas en curso:** se ven en Presupuestos y suben y bajan al liquidarse.
- **Cifras en vivo:** destellan brevemente al cambiar.
- **Cuadran entre pantallas:** el gasto del Resumen, el de cada clave y agente, los presupuestos, la cuota de la suscripción, la gráfica de «Hoy» en intervalos de 15 minutos y el registro de auditoría.
- **Fechas:** los datos de ejemplo se desplazan a la **hora real del navegador**. Lo que pasó «hace 8 min» sigue pasando hace 8 min, se abra el día que se abra.

### Escenarios de demostración

Se lanzan desde **Demo → Escenarios de demostración**, o con Ctrl+K y escribiendo su nombre. Solo funcionan con un usuario de cliente y se ejecutan sobre su organización.

Cada escenario muestra su progreso abajo a la izquierda. Al terminar, el botón **«Ver resultado»** lleva a la pantalla correspondiente. Las alertas llegan a la campana, como toast y a la **bandeja de los canales** (Canales de alerta), que simula lo que reciben Slack, Teams, el email y el webhook.

Los escenarios usan la **configuración actual**: si cambias la política de bucles de una clave, el modo del escudo o una delegación, el resultado cambia.

| Escenario | Qué recorre | Resultado en Pro (Laura) | Resultado en Gratis (Pablo) |
|---|---|---|---|
| **Bucle entre dos agentes** | BP-08 → BP-09 · OF-02, OF-05, OF-06 | Sesión nueva en directo en el grafo de contexto. La política «bloquear» de la clave corta con 422, se crea el incidente con causa raíz, coste, cota superior y gasto evitado, y se envían las alertas | La política «avisar» marca la respuesta. Incidente con coste previsto y sin diagnóstico causal |
| **Ataque de consumo** | OF-10 · sistema inmunológico | Respuesta por grados solo sobre el usuario final atacante: aviso → freno 429 → modelo económico → bloqueo temporal, y límites endurecidos 24 h. El tráfico de los demás usuarios sigue pasando | Solo aviso y freno 429 (4.2 · 3.3) |
| **Presupuesto al límite** | BP-06, BP-08 · OF-03 · DEC-05, DEC-06 | Ráfagas en prod-chatbot-soporte: las reservas suben y bajan, alerta del límite blando y corte con 402 al llegar al duro. Incidente con el gasto evitado | Lo mismo con el presupuesto diario de bot-telegram |
| **Prompt injection y camino indirecto** | BP-07, BP-08 · OF-07, OF-08 · DEC-10, DEC-12 | El escudo quita las herramientas de la petición y bloquea la respuesta que pide consultar_bd_clientes (403). Después el agente delega en agente-sql por el camino indirecto CI-01 y llega un aviso. Si antes quitas la delegación, se bloquea | Herramienta del proveedor no autorizada (code_execution): se quita y se bloquea la respuesta |
| **Cuota al 80 % y al 100 %** | BP-12 → BP-03 · OF-13 · DEC-03 | Avisos del 100 % y del excedente al 80 % y 100 % del tope. Después, 402 por tope alcanzado | Aviso del 100 % y corte del servicio con 402. «Pasar a Pro» lo reactiva |

Para repetir un escenario desde cero: **Demo → Restablecer datos de ejemplo**.

### Otros controles

- **Ctrl+K:** paleta de comandos. Navega, busca incidentes, claves, sesiones, clientes y tickets, lanza escenarios, cambia el tema y pausa la simulación.
- **Atajos:** `?` lista los atajos; `/` busca en la tabla de la pantalla; `g` + `r/i/c/p/a/g` va a Resumen, Incidentes, Claves, Presupuestos, Auditoría o Gasto; Espacio pausa la simulación.
- **Tema claro, oscuro o del sistema:** en el menú de usuario (abajo en la barra lateral) o en Mi cuenta.
- **Demo → Mostrar referencias al documento:** muestra junto a cada título los IDs del documento (AP, BP, OF, IC, DEC) que cubre la pantalla.

---

## Pantallas

### Web pública

1. **Landing** (`/#/`): propuesta de valor, cambio de dos líneas de código, funciones diferenciales (5.2), recorrido de cada petición, tabla de precios de 2.4 y preguntas frecuentes.
2. **Login** (`/#/login`): contraseña y **segundo factor** (código de 6 dígitos, DEC-27), entrada con SSO y accesos de demostración.
3. **Registro** (`/#/registro`): lleva al alta guiada.
4. **Página 404**.

### Cliente: Panel web (AP-01)

5. **Alta de cliente** (`/#/alta`): cuenta, organización, contrato de tratamiento de datos, plan, clave real del proveedor, primera clave virtual (se muestra una sola vez) y comprobación de la conexión.
6. **Resumen:** gasto de hoy y del mes en directo frente a los presupuestos, **previsión del gasto al cierre del mes** (OF-16), gasto evitado, cuota, gráfica de 30 días u hoy (15 min), **indicadores de 4.2**, incidentes abiertos, presupuestos al límite, gasto por clave y cómo conectar una aplicación.
7. **Recomendaciones** (soporte a la decisión del cliente, OF-17, DEC-34):
   - indicadores de 4.2;
   - solo los cuatro tipos del documento: **probar un modelo más económico** en un agente con tareas sencillas (con el ahorro mensual estimado), **crear o ajustar el presupuesto** de una clave que lo agota o no lo tiene, **quitar una delegación** que abre un camino indirecto y **revisar las herramientas nuevas**;
   - cada una con el dato en que se basa y su efecto estimado; solo el administrador la aplica o la descarta, y nunca se aplica sola;
   - al aplicarla se publica una versión nueva de la configuración y queda en el registro de auditoría;
   - pestañas de aplicadas y descartadas.
8. **Gasto y sesiones:** gasto apilado por clave; desglose por clave (con la previsión del mes), por agente, **por modelo** y por sesión o tarea (con sesiones en curso); exportación CSV (OF-16).
9. **Incidentes:** lista con filtros y avisos agrupados.
10. **Detalle de incidente:**
    - qué pasó y respuesta aplicada;
    - **línea de tiempo del BPMN de BP-09**;
    - diagnóstico causal, sistema inmunológico o presupuesto afectado, según el tipo;
    - coste, cota superior, gasto evitado con su hipótesis o coste previsto;
    - alertas enviadas, huellas y botón de marcar como revisado.
11. **Claves virtuales:**
    - crear, editar, rotar (hereda configuración, gasto, línea base y cadenas) y revocar (con confirmación escrita);
    - la clave completa se muestra una sola vez;
    - claves de proveedor cifradas;
    - en el detalle: línea base (IC-19), cadenas de respuestas (IC-18) y proveedor alternativo «Próximamente».
12. **Presupuestos:** **reservas en curso** en directo (IC-17) y presupuestos de organización y de clave con lo gastado, lo reservado, el límite blando y la **previsión al cierre del periodo**, con el día en que se llegaría al límite al ritmo actual (OF-16).
13. **Agentes y permisos:** modo aprendizaje o protección, grafo de autorización, caminos indirectos recalculados en vivo, herramientas descubiertas, alta de agentes y proxy MCP «Próximamente».
14. **Grafo de contexto:** sesiones en carriles por agente, con dependencias, decisiones, causa raíz y detalle de cada llamada. Las sesiones de los escenarios se dibujan en directo.
15. **Registro de auditoría:**
    - eventos nuevos en directo, con búsqueda, filtros y detalle completo de IC-16;
    - sellos firmados;
    - verificación de integridad;
    - exportación en JSON o CSV con o sin configuración.
16. **Probador de peticiones:** envía una petición de prueba con una clave real y muestra paso a paso, animados, los **14 pasos del BPMN de BP-08** con su latencia, la respuesta (código, cabeceras y cuerpo), lo reservado, el coste real, lo liberado y si cuenta en la cuota. Tiene **17 casos** que acaban en cada salida posible (200, 400, 401, 402, 403, 422, 429, 502, 503 y 504). La petición se registra de verdad en la auditoría.
17. **API y webhooks (Desarrolladores):**
    - cómo conectar una aplicación con ejemplos en Python, Node y curl para OpenAI y Anthropic;
    - cabeceras X-Unburn-Session y X-Unburn-Agent, cabeceras de respuesta y códigos de error;
    - endpoints de la API de administración;
    - **tokens de API** (crear con la clave mostrada una vez, y revocar);
    - **webhooks** con secreto de firma, entregas recientes y ejemplo de carga.
18. **Canales de alerta:** email, Slack, Teams y webhook; avisos por canal, prueba de envío, pausa, **bandeja simulada de los canales** e historial (IC-23).
19. **Suscripción y facturas:** plan, cuota en directo con la marca del 80 %, excedente y tope (Pro), medio de pago, cambio de plan (Gratis ↔ Pro; Enterprise con Ventas), avisos de cuota agotada o tope alcanzado y facturas.
20. **Usuarios:** invitar, cambiar el rol y quitar el acceso.
21. **Soporte:** abrir tickets con la petición relacionada y conversar.
22. **Ajustes de la organización:**
    - datos fiscales y política ante fallos por defecto;
    - datos y privacidad;
    - modalidad de servicio: nube de Unburn, nube confidencial y despliegue privado;
    - funciones **«Próximamente»** de la arquitectura objetivo y programa de acceso anticipado;
    - exportación y baja.
23. **Mi cuenta:** perfil, tema, verificación en dos pasos, sesiones abiertas, avisos por email y atajos.
24. **Notificaciones:** centro de notificaciones con filtros. También hay un desplegable en la campana.

### Unburn: Consola de back-office (AP-12)

25. **Cuadro de mando de Dirección** (soporte a la decisión de Unburn):
    - **versiones pendientes de aprobar** (BP-16);
    - ingresos, margen, clientes y peticiones en directo;
    - ingresos por mes y objetivos de servicio (disponibilidad y latencia, OG-07);
    - **«Para decidir»**: lecturas del informe que piden una decisión;
    - indicadores de producto de 4.2 mes a mes.
26. **Clientes:** plan, estado de la suscripción, uso de la cuota y cobro. Finanzas puede reintentar los cobros fallidos.
27. **Tickets:** cola por estado, prioridad y asignación. Metadatos de la petición relacionada sin su contenido (IF-28), asignarse, responder, nota interna, **escalar a Ingeniería** (crea una IC-27) y cerrar.
28. **Incidencias técnicas:**
    - estado de la plataforma (AP-16);
    - incidencias con causa, acciones, clientes afectados, aviso a los clientes y **notificación a reguladores** (con Legal);
    - **versiones** con revisión de Legal, **aprobación de Dirección** (8.3), despliegue gradual, avance y reversión (BP-16).
29. **Modelos y precios:** catálogo con tarifas por tipo de token, herramientas del proveedor y opciones; nueva tarifa, alta y retirada de modelos y registro del precio de una opción (BP-15).
30. **Contratos Enterprise:**
    - embudo de oportunidades (prospección → demostración → revisión de seguridad → negociación);
    - contrato IC-05;
    - **revisión de Legal** (RGPD, Data Act, DORA, Reglamento Europeo de IA y SLA);
    - firma, que **prepara el alta del cliente** (IF-27).
31. **Socios:** agencias, plataformas y marketplace, todos propuestas; estado del acuerdo (Ventas) y comisiones (Finanzas).
32. **Cobros:** facturado, cobrado, fallido y pendiente; reintentar y contactar; cierre del mes (BP-12).
33. **Proveedores:** AWS, Stripe y GitHub con su coste y si tratan datos de clientes; revisar, avisar a los clientes de un cambio, dar de alta y de baja (BP-18).
34. **Informe mensual:** ingresos, clientes por plan con altas, **cambios de plan** (Gratis → Pro y otros), bajas y **margen de cada plan**, incidentes, tickets y costes propios; presentar a Dirección y actualizar los precios de los planes (BP-14, OF-18).

---

## Tabla de trazabilidad: pantalla → AP / BP / OF / IC

| Pantalla | Aplicaciones | Procesos | Objetivos funcionales | Información |
|---|---|---|---|---|
| Landing, login y registro | AP-01 | BP-03 | OF-12, OF-13 | IC-03 |
| Alta de cliente | AP-01, AP-02, AP-14 | BP-03, BP-05 | OF-01, OF-13 | IC-01, IC-02, IC-04, IC-07, IC-08 |
| Resumen | AP-01, AP-08 | BP-10 | OF-03, OF-06, OF-12, OF-13 | IC-12, IC-20, IC-21 |
| Recomendaciones | AP-01, AP-02, AP-05, AP-08 | BP-05, BP-06, BP-07, BP-10 | OF-03, OF-04, OF-05, OF-07, OF-08, OF-10 | IC-08, IC-11, IC-12, IC-16 |
| Gasto y sesiones | AP-01, AP-08 | BP-10 | OF-02, OF-12 | IC-09, IC-15, IC-21 |
| Incidentes y detalle | AP-01, AP-09, AP-10 | BP-09, BP-10 | OF-05, OF-06, OF-10 | IC-15, IC-19, IC-20, IC-23 |
| Claves virtuales | AP-01, AP-02 | BP-03, BP-05 | OF-01, OF-04, OF-14 | IC-07, IC-08, IC-09, IC-18, IC-19 |
| Presupuestos | AP-01, AP-04 | BP-06, BP-19 | OF-03 | IC-12, IC-17 |
| Agentes y permisos | AP-01, AP-05 (AP-13 próximamente) | BP-05, BP-07 | OF-07, OF-08, OF-09 | IC-09, IC-10, IC-11 |
| Grafo de contexto | AP-01, AP-07, AP-09 | BP-10, BP-11 | OF-02, OF-06, OF-12 | IC-15, IC-16 |
| Registro de auditoría | AP-01, AP-07 | BP-11, BP-19 | OF-11 | IC-16, IC-22, IC-24 |
| Probador de peticiones | AP-01, AP-03, AP-04 | BP-08 | OF-02, OF-03, OF-04, OF-05, OF-07, OF-10, OF-14 | IC-08, IC-14, IC-16, IC-17 |
| API y webhooks | AP-02, AP-10 | BP-03 a BP-07, BP-10, BP-11 | OF-12 | IC-08, IC-13, IC-23 |
| Canales de alerta | AP-01, AP-10 | BP-06, BP-09, BP-12 | OF-12 | IC-13, IC-23 |
| Suscripción y facturas | AP-01, AP-11, AP-14 | BP-02, BP-03, BP-12 | OF-13 | IC-03, IC-04, IC-06 |
| Usuarios | AP-01, AP-02 | BP-04 | OF-12 | IC-02 |
| Soporte (cliente) | AP-01, AP-02 | BP-13 | OF-12 | IC-26 |
| Ajustes de la organización | AP-01, AP-02 | BP-03, BP-19 | OF-10, OF-14, OF-15 | IC-01, IC-24 |
| Cuadro de mando (Dirección) | AP-12, AP-08, AP-16 | BP-14 | OF-13 | IC-31 |
| Clientes | AP-12, AP-11 | BP-03, BP-12 | OF-13 | IC-01, IC-04, IC-05 |
| Tickets | AP-12, AP-07 | BP-13, BP-17 | OF-11 | IC-16, IC-25, IC-26, IC-27 |
| Incidencias técnicas | AP-12, AP-15, AP-16 | BP-16, BP-17 | — | IC-27, IC-28 |
| Modelos y precios | AP-12, AP-06 | BP-15 | OF-04 | IC-14 |
| Contratos Enterprise | AP-12, AP-02 | BP-02, BP-03 | OF-15 | IC-05 |
| Socios | AP-12 | BP-01 | — | IC-29 |
| Cobros | AP-12, AP-11, AP-14 | BP-12 | OF-13 | IC-06 |
| Proveedores | AP-12 | BP-18 | — | IC-30 |
| Informe mensual | AP-12, AP-08, AP-09 | BP-14 | OF-13 | IC-03, IC-31 |

---

## Tabla de cumplimiento: requisito del documento → dónde se ve

He revisado el documento final completo (secciones 1 a 21). Los requisitos de la arquitectura objetivo aparecen marcados como «Próximamente» o «Enterprise».

### Objetivos funcionales (3.2)

| Requisito | Dónde se ve |
|---|---|
| OF-01 Gestionar las claves | Claves virtuales: crear, revocar, rotar, modelos, agentes y políticas; claves de proveedor cifradas; alta |
| OF-02 Identificar tareas y agentes | Gasto › Sesiones; grafo de contexto (agente, quién encargó la tarea, dependencias); cabeceras en Desarrolladores |
| OF-03 Aplicar presupuestos | Presupuestos (blando y duro, diario y mensual, reservas en curso); escenario «Presupuesto al límite»; probador (402) |
| OF-04 Acotar cada petición | Tamaños máximos por clave; catálogo (opción sin precio = no admitida); probador: «Opción sin precio» (400) |
| OF-05 Detectar bucles (3 tipos) | Repetición, ping-pong y límites de tarea en incidentes; escenario «Bucle»; probador (422 o respuesta marcada). Por significado: «Próximamente» en Ajustes |
| OF-06 Diagnosticar incidentes | Detalle de incidente: causa raíz, coste, cota superior, ahorro con hipótesis o coste previsto. Medir qué intervención funciona mejor: «Próximamente» |
| OF-07 Controlar las herramientas | Agentes y permisos: grafo, modo aprendizaje o protección, herramientas del proveedor denegadas por defecto, nuevas bloqueadas hasta aprobarlas; escenario de inyección; probador |
| OF-08 Detectar caminos indirectos | Aviso en Agentes y permisos, recalculado con cada cambio; recomendación con acción; escenario de inyección |
| OF-09 Proxy MCP (objetivo) | Agentes y permisos y Ajustes: «Próximamente» |
| OF-10 Responder a consumos anómalos | Escenario «Ataque»: aviso, freno, modelo económico, bloqueo y endurecimiento 24 h, solo sobre la parte afectada; línea base en la clave; caché «Próximamente» |
| OF-11 Registrar la auditoría | Registro: metadatos sin texto, decisión, motivo, versión de configuración, encadenado, sellos, verificación, retención por plan y exportación con configuración |
| OF-12 Informar al cliente | Alertas por email, Slack, Teams y webhook con bandeja; panel; API de administración; roles administrador y lector |
| OF-13 Gestionar suscripciones | Suscripción: peticiones facturables, avisos del 80 % y del 100 %, tope de excedente; Cobros (back-office); escenario «Cuota» |
| OF-14 Responder a fallos | Política por clave (bloquear o dejar pasar); probador «Fallo interno» (503 o sin control); proveedor alternativo «Próximamente» |
| OF-15 Proteger el procesamiento (objetivo) | Ajustes › Modalidad de servicio (nube confidencial con atestación, despliegue privado); Contratos Enterprise |
| OF-16 Analizar el gasto y prever el cierre del mes | Resumen (previsión al cierre); Presupuestos (previsión por presupuesto y día en que se llegaría al límite); Gasto (por clave, agente, modelo y tarea, con previsión por clave) |
| OF-17 Recomendar ajustes de configuración | Recomendaciones: los cuatro tipos del documento, con evidencia y efecto; aplicar o descartar (solo administrador); el cambio queda en la auditoría |
| OF-18 Elaborar el informe de negocio | Informe mensual (altas, cambios de plan, bajas, margen de cada plan) y Cuadro de mando |
| OF-19 Atender a los clientes | Tickets (back-office) con metadatos y escalado; Soporte (cliente) |
| OF-20 Mantener el catálogo de modelos y precios | Modelos y precios |
| OF-21 Gestionar ventas y socios | Contratos Enterprise (alta preparada) y Socios (clientes traídos y comisiones) |
| OF-22 Publicar versiones y operar la plataforma | Incidencias técnicas (versiones, estado de la plataforma, incidencias) y Proveedores (cuáles tratan datos) |
| OG-09 Que Unburn sea rentable y se gestione con datos | Cuadro de mando, Informe mensual (margen de cada plan) y back-office digital |

### Procesos (10.1) y BPMN (10.4 y 10.5)

| Proceso | Dónde se ve |
|---|---|
| BP-01 Gestionar socios | Back-office › Socios (Ventas; comisiones, Finanzas) |
| BP-02 Vender contrato Enterprise | Back-office › Contratos Enterprise (embudo, revisión de Legal, firma y alta preparada); «Hablar con Ventas» en Suscripción |
| BP-03 Gestionar suscripción | Alta, Suscripción (cambio de plan y tope), Ajustes (datos, exportación y baja) |
| BP-04 Gestionar usuarios | Usuarios |
| BP-05 Gestionar claves | Claves virtuales; alta de agentes de cada clave |
| BP-06 Presupuestos y alertas | Presupuestos y Canales de alerta (Gratis: solo email) |
| BP-07 Permisos de agentes | Agentes y permisos (en Gratis, solo herramientas del proveedor) |
| BP-08 Atender petición (14 pasos) | Tráfico en directo, escenarios y **probador**, que anima los 14 pasos y los eventos del paso 11 (respuesta, rechazo del proveedor, fallo a medias, tiempo agotado). Los rechazos baratos se agrupan |
| BP-09 Gestionar incidente | Incidentes creados por el motor; agrupación en una hora sin nueva alerta; endurecimiento; diagnóstico; ahorro o coste previsto; alerta con enlace; revisar y cerrar. Línea de tiempo en el detalle |
| BP-10 Consultar gasto e incidentes (soporte a la decisión) | Resumen, Gasto y sesiones, Incidentes, previsión del gasto y Recomendaciones (se aplican en BP-05, BP-06 o BP-07, o se descartan) |
| BP-11 Auditar el registro | Registro de auditoría (también para el lector o auditor) |
| BP-12 Generar facturas | Avisos de cuota y de tope, estado de la suscripción, facturas; Cobros (cierre del mes, fallidos) |
| BP-13 Atender tickets | Soporte (cliente) y Tickets (back-office) con metadatos sin contenido y escalado |
| BP-14 Informe mensual | Informe mensual (Finanzas) y Cuadro de mando (Dirección); actualizar los precios de los planes |
| BP-15 Catálogo de modelos | Modelos y precios (Ingeniería) |
| BP-16 Desarrollar y desplegar | Incidencias técnicas › Versiones: Legal marca la revisión, Dirección aprueba en el Cuadro de mando y después Ingeniería inicia el despliegue gradual (firma, SBOM, reversión) |
| BP-17 Incidencia técnica | Incidencias técnicas (clientes afectados, reguladores) y escalado desde Tickets |
| BP-18 Gestionar proveedores | Proveedores (Finanzas y Legal) |
| BP-19 Registro y contadores | Sellos cada 5 min en directo; reservas vencidas cerradas con gasto estimado (eventos «cierre estimado»); retención por plan |

### Aplicaciones (12.1)

| Requisito | Dónde se ve |
|---|---|
| AP-01: alta, suscripción, usuarios, claves, presupuestos, canales y permisos (administrador) | Alta, Suscripción, Usuarios, Claves, Presupuestos, Canales, Agentes y permisos |
| AP-01: gasto, incidentes, ahorro, grafo de contexto, registro, facturas y tickets (administrador y lector) | Resumen, Gasto, Incidentes, Grafo de contexto, Auditoría, Suscripción, Soporte |
| AP-02: límites del plan y clave completa mostrada una vez | Botón de crear clave desactivado con 3/3 en Gratis; modales de clave y de token |
| AP-12: Soporte, Ventas, Ingeniería, Finanzas con Legal, y Dirección | Las 10 secciones del back-office, con acceso por departamento |
| AP-13 a AP-16 | Proxy MCP «Próximamente»; plataforma de pagos (medio de pago y cobros); plataforma de desarrollo (versiones); observabilidad (estado de la plataforma) |

### Planes (2.4)

| Requisito | Dónde se ve |
|---|---|
| Gratis: 10.000 peticiones; corte al agotar | Cuota de Pablo y escenario «Cuota» (402 y aviso «Servicio cortado») |
| Gratis: 3 claves, solo email | Botón de crear clave desactivado; canales distintos de email desactivados |
| Gratis: control básico de consumos anómalos | Escenario «Ataque»: solo aviso y 429 |
| Pro: 49 €, 500.000 peticiones, excedente con tope | Suscripción (excedente, tope y avisos) |
| Pro: escudo y diagnóstico completos | Grafo de autorización y diagnóstico causal |
| Enterprise: a medida, nube confidencial o privado, SLA, 6 meses o más | Planes, Ajustes, Contratos Enterprise |
| Las rechazadas no cuentan en la cuota | Probador («¿Cuenta en la cuota?») y motor (DEC-03) |
| Gasto evitado en el panel | Resumen, Incidentes, Recomendaciones (ROI) |

### Roles y stakeholders (8)

| Stakeholder | Cómo aparece |
|---|---|
| Administrador y lector del cliente | Laura y Carlos |
| Desarrollador del cliente | Desarrolladores y probador |
| Usuario final | Seudónimo en la auditoría; atacante en el escenario «Ataque» |
| Auditores | Lector, verificación y exportación |
| Fundadores y Dirección, Soporte, Ingeniería, Ventas, Finanzas, Legal | Sus usuarios de back-office |
| Socios | Pantalla Socios |
| Proveedores tecnológicos | Pantalla Proveedores |
| Reguladores | Notificación desde Incidencias técnicas |
| Proveedores de IA | Catálogo de modelos |
| Inversores | Sin pantalla: no tienen proceso en 10.1 |

### Decisiones (7) que afectan a la interfaz

| Decisión | Cómo se respeta |
|---|---|
| DEC-01 | Autoservicio y plan Gratis en la landing, el registro y el alta |
| DEC-02 | Diferenciadores en la landing |
| DEC-03 | Reglas de cuota en el motor y en el probador |
| DEC-04 | El ahorro siempre es un rango con hipótesis, solo al detener o frenar |
| DEC-05 | Reserva del peor caso; sobrepaso acotado |
| DEC-06 | 402 para presupuesto, cuota y tope; 429 solo para velocidad y freno |
| DEC-07 | Bucles en modo aviso por defecto; bloqueo opcional |
| DEC-08 | Política ante fallos por clave y por defecto |
| DEC-09 | En el probador: «con reglas y tablas, sin IA en medio» |
| DEC-10 | Herramientas del proveedor denegadas por defecto |
| DEC-11 | X-Unburn-Agent solo con claves compartidas |
| DEC-12 | Proxy MCP «Próximamente» |
| DEC-13 | Nunca se muestra el texto de las peticiones; caché opcional «Próximamente» |
| DEC-14 | Registro encadenado con sellos |
| DEC-15 | Región UE (Irlanda) en Ajustes y en el estado de la plataforma |
| DEC-17 | Nube confidencial y despliegue privado (Enterprise) |
| DEC-23 | Registro de inicio y de cierre, y cierre estimado de las reservas vencidas |
| DEC-25 | El panel no tiene lógica propia: todo pasa por la API de administración |
| DEC-26 | Una sola consola de back-office con acceso por departamento |
| DEC-27 | Inicio de sesión con segundo factor |
| DEC-34 | Recomendaciones por reglas sobre los metadatos del cliente, que solo se aplican si el administrador las acepta; el modelo económico solo se propone probar |
| DEC-18 a DEC-22, DEC-24 y DEC-28 a DEC-33 | Infraestructura (EKS, Valkey, SNS/SQS, KMS, imágenes firmadas, versiones de componentes): sin efecto en la interfaz |

### Información (11) que se muestra

IC-01 a IC-31: todos los conceptos aparecen en alguna pantalla, según la tabla de trazabilidad. Los que se han añadido en esta versión:

- IC-05 Contrato Enterprise;
- IC-17 Reservas;
- IC-18 Cadenas de respuestas;
- IC-19 Línea base;
- IC-27 Incidencia técnica, completa;
- IC-28 Versión de la plataforma;
- IC-29 Socio;
- IC-30 Proveedor.

### Indicadores de 4.2 (3.1 y 3.2)

| Indicador | Dónde se ve |
|---|---|
| Coste medio por sesión resuelta | Resumen, Recomendaciones, Cuadro de mando |
| Tasa de peticiones bloqueadas por seguridad | Ídem |
| Latencia añadida por el Gateway (p95, objetivo < 50 ms) | Ídem, probador y estado de la plataforma |
| Diferencia de coste por modelo sustituto | Ídem |
| ROI | Recomendaciones y Cuadro de mando |
| Gasto evitado | Resumen, Incidentes, Recomendaciones, Cuadro de mando |
| Paneles en tiempo real con agregados de 15 min | Gráfica «Hoy» y cifras en directo |

### Otros puntos

| Requisito | Dónde se ve |
|---|---|
| «Toda la configuración también se puede hacer desde código» (2.3) | API y webhooks |
| Soporte a la toma de decisiones (12.5) | Recomendaciones (cliente) y Cuadro de mando con «Para decidir» (Dirección) |

---

## Datos y simulación

**Datos de partida (`src/data/`):** los mismos JSON que en la v1, más:

- en `backoffice.json`: socios, oportunidades, contratos, proveedores, versiones, incidencias técnicas completas, estado de la plataforma y KPIs mensuales;
- en `claves.json`: tokens de API, línea base, cadenas de respuestas y porcentaje de peticiones sin sesión;
- en `usuarios.json`: tres personas más.

**Generación al arrancar (`src/sim/generar.js`):** con semilla fija y relativo a la hora real se generan los eventos de auditoría encadenados con huellas, los sellos, el gasto diario de 30 días y los intervalos de 15 minutos de hoy. Sustituye a los JSON generados de la v1.

**Motor (`src/sim/motor.js`):** funciones puras que reproducen:

- BP-08: rechazo barato → reserva en todos los presupuestos afectados → liquidación → registro;
- los avisos del límite blando, de la cuota y del tope;
- la creación o actualización de incidentes en BP-09, agrupando la misma causa en una hora sin nueva alerta;
- el envío de alertas a los canales activos según el plan;
- el cierre estimado de reservas vencidas (BP-19).

**Escenarios (`src/sim/escenarios.js`):** guiones asíncronos que usan el mismo motor.

**Indicadores y recomendaciones:** `src/lib/kpis.js` y `src/lib/recomendaciones.js`.

---

## Decisiones tomadas por mi cuenta

### Heredadas de la v1 (siguen vigentes)

1. Proyecto en `prototipo/` para no tocar la raíz del repositorio.
2. Formato de los identificadores: `ub_live_`/`ub_test_`, `inc_…`, `ses_…`, `evt_…`, `TCK-…`, `UNB-…`, `IT-…`, `cfg-vNN`, `ENT-…`. El documento no los define.
3. Cabeceras `X-Unburn-Session` y `X-Unburn-Agent` y dirección `https://gateway.unburn.eu/v1`. La API de administración está en `https://api.unburn.eu/admin/v1`.
4. Excedente de Pro: bloques de 50.000 peticiones a 5 €, con tope del cliente.
5. Precios de los modelos aproximados e inventados, en € por millón de tokens.
6. HashRouter (`/#/…`) para servir el prototipo desde cualquier servidor estático.

### Nuevas en la v2

7. **Lo que dice el documento prevalece:**
   - en Gratis el sistema inmunológico se limita a avisar y frenar (4.2 · 3.3);
   - el back-office restringe el acceso por departamento (12.5);
   - Ventas, Legal y Dirección tienen usuario y pantallas;
   - los datos de la organización, la exportación y la baja pasan a Ajustes.
8. **Hora real:** las fechas de ejemplo se desplazan para que la referencia (21/10/2026, 16:45) coincida con el momento en que se abre el prototipo. Los importes del mes (por ejemplo, el gasto acumulado) se mantienen como en los datos y la simulación los incrementa. Las ventanas que dependían de «octubre» pasan a ser el mes actual o los últimos 30 días.
9. **Ritmo de la simulación:** una petición de Nexo cada 1–3 s y una de Pablo de vez en cuando. A 10× todo va diez veces más rápido, incluidos los escenarios y las liquidaciones. La simulación también corre en las pantallas del back-office.
10. **Escenarios comprimidos en el tiempo:**
    - el de presupuesto lanza ráfagas de 12 peticiones para llegar al límite en segundos;
    - el de cuota suma las peticiones facturables en ráfagas agregadas, sin una línea de auditoría por cada una, para no inundar el registro.
11. **El tráfico de fondo nunca genera incidentes nuevos**, para que la demo sea predecible. Los incidentes salen de los escenarios, del probador o de los 402 de `equipo-datos`, que actualizan el incidente que ya existe.
12. **El probador ejecuta la petición de verdad** contra la configuración real: aparece en la auditoría y, si llega al proveedor, cuenta en la cuota. El caso elegido fuerza la salida; los controles reales (clave revocada, agente o modelo no permitidos, presupuesto sin hueco, cuota) se aplican siempre.
13. **Recomendaciones:** reglas sencillas y explicables sobre los metadatos de la organización (DEC-34). Con el documento final se han dejado solo los cuatro tipos de OF-17, y el modelo económico se presenta como algo que probar, no como un cambio seguro. El ahorro mensual es una estimación con su evidencia visible.
    - **Previsión del cierre de mes:** ritmo medio de los últimos 7 días completos, proyectado hasta fin de mes (o hasta el final del día en los presupuestos diarios).
    - **Margen de cada plan:** el plan Gratis asume su coste propio; el resto de la infraestructura y las plataformas se reparte entre Pro y Enterprise en proporción 55/45.
14. **Cuadro de mando de Dirección:** las lecturas «Para decidir» se calculan con el informe mensual y el estado actual (clientes cerca del tope, coste del plan Gratis, tipo de incidente más frecuente, pipeline ponderado y socios).
15. **Web pública mínima:** landing de una página, login con accesos de demostración y registro que lleva al alta. Cualquier contraseña de 6 o más caracteres entra.
16. **Modo oscuro:** los grises, la superficie y el azul marino son variables CSS que se invierten, así que no hay clases duplicadas. Los colores de estado tienen su equivalente oscuro y los SVG (gráficas y grafos) reciben la paleta según el tema.
17. **Stack:** se mantienen React 18 y JavaScript (JSX) con Vite. El documento prevé React 19 y TypeScript para el producto (TE-17); en un prototipo desechable he priorizado la velocidad de iteración. Migrar es directo.
18. **Funciones de la arquitectura objetivo** (proxy MCP, caché, bucles por significado, proveedor alternativo, credenciales firmadas, atestación): se muestran desactivadas con la etiqueta «Próximamente» y su referencia (OF-, DEC-), sin simular su comportamiento.

### Diseño

19. **Identidad:** símbolo SVG oficial más la palabra «unburn» en Inter, en color `navy`, que en modo oscuro pasa a claro. Favicon `unburn-icono.svg`. Azul marino `#0B1526` para los botones primarios; naranja `#FF5A1F` solo para la acción principal de cada pantalla, el foco, el elemento activo del menú y los contadores sin leer.
20. **Sistema visual:**
    - grises neutros, bordes de 1 px y radios de 6 y 8 px;
    - sombras solo en menús, modales y toasts;
    - Inter con base de 13 px y cifras tabulares;
    - iconos de lucide-react de 14–16 px;
    - badges sobrios (punto de color con texto);
    - sin degradados decorativos ni emojis.
21. **Gráficas:** colores apagados (4 tonos validados para daltonismo y contraste, más «Otras» en gris), con tooltips. Los KPIs llevan un icono de ayuda con su definición.
22. **Microinteracciones:**
    - destello breve de las cifras que cambian y filas nuevas resaltadas un instante;
    - skeleton de 240 ms al cambiar de pantalla;
    - fundido de entrada;
    - toasts con enlace «Ver detalle»;
    - confirmación escrita en las acciones destructivas.
23. **Estados:** vacío en todas las tablas; carga con skeleton; error con un límite de errores por pantalla («No se ha podido cargar esta pantalla · Reintentar»); 404 propio; acceso restringido.
24. **Accesibilidad básica:** enlace «Saltar al contenido», `aria-label` en los botones de icono, `role="dialog"` en los modales y foco visible.

---

## Verificación realizada

- `npm run build` compila sin errores.
- **Prueba de humo** con Chrome sin interfaz (`puppeteer-core`, fuera del proyecto, sin capturas):
  - **pantallas:** las públicas; las 18 del panel con Laura, Carlos y Pablo en tema claro y con Laura en oscuro; las del back-office con los 6 empleados (una en oscuro), más la comprobación del acceso restringido de cada uno;
  - **escenarios:** los 5 con Laura (Pro) a 10× y 3 con Pablo (Gratis). Todos terminan y su «Ver resultado» abre la pantalla correcta;
  - **probador:** los 17 casos devuelven el código esperado;
  - **acciones:** aplicar una recomendación, paleta de comandos, atajos, pausa, notificaciones, revisión legal y firma Enterprise, avanzar una versión, registrar una incidencia, reintentar un cobro, revisar un proveedor y escalar un ticket.
  - Resultado: **0 errores y 0 avisos de consola**.

## Estructura

```
prototipo/
├── public/brand/              Logos oficiales
└── src/
    ├── data/                  JSON de partida
    ├── sim/                   generar.js (datos al arrancar), motor.js (BP-08/BP-09), escenarios.js
    ├── store/AppStore.jsx     Estado en memoria, simulación, escenarios, notificaciones y tema
    ├── lib/                   tiempo, formato, dominio (caminos indirectos), kpis, recomendaciones, hooks
    ├── components/            UI común, layout, navegación por departamento, paleta, gráficas, grafo, KPIs
    └── pages/
        ├── publico/           Landing, login, registro, 404
        ├── Alta.jsx
        ├── comun/             Mi cuenta, notificaciones
        ├── cliente/           Panel web (AP-01)
        └── backoffice/        Consola de back-office (AP-12)
```
