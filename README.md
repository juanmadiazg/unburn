# Unburn: documento de contexto del proyecto

> **Versión:** octubre de 2026.
> **Qué es esto:** el planteamiento completo de **Unburn**, una startup ficticia creada para una asignatura universitaria. El profesor pide entregas siguiendo los cuatro dominios de arquitectura de **TOGAF**: negocio, datos, aplicación y tecnología. El profesor los llama "capas"; en este documento ambos términos significan lo mismo.
> **Estado del proyecto:** idea desde cero. No existe todavía ningún código.

---

## 0. Cómo usar este documento

### 0.1. Para qué sirve

Este README es la **fuente única de contexto** del proyecto. Está pensado para:

- **Los miembros del equipo**, con conocimientos básicos de informática.
- **Cualquier IA** a la que se le pase este documento para ayudar con el proyecto (redactar entregas, diseñar diagramas, programar el MVP, etc.).

Si algo que diga una persona o una IA contradice este documento, **manda este documento**, salvo que se actualice explícitamente. Las decisiones ya tomadas están en la sección 12 ("Registro de decisiones") y no deben reabrirse sin acordarlo con el equipo.

**Historial de revisiones:**
- **v1** (3 de octubre de 2026): primera versión.
- **v2** (3 de octubre de 2026): correcciones tras una revisión externa. Se actualizan normativa y competencia, se añade la *Responses API* al MVP, se corrigen errores técnicos y contradicciones, y se añaden la arquitectura de partida y el análisis de brechas de cada dominio.
- **v3** (3 de octubre de 2026): segunda revisión externa. Se resuelven contradicciones de la v2 (caducidad de reservas, códigos de error, plan Gratis, persistencia del grafo de contexto, identidad de agentes, tope de excedente), se fijan las APIs que admite el MVP, se corrigen detalles de AWS y de la auditoría, se matiza la IA causal y se marca como punto abierto la cadena de arranque de la nube confidencial.
- **v4** (3 de octubre de 2026): tercera revisión externa. Se añaden la lista de opciones admitidas y la rotación de claves, se refuerzan la fiabilidad del registro de auditoría y la gestión de reservas, y se ajustan tiempos de espera, límites de entrada, borrado tras la baja y criterios de éxito.
- **v5** (3 de octubre de 2026): cuarta revisión externa y **simplificación del nivel técnico**: el documento describe qué hace cada pieza y qué garantiza, no cómo se programa (ver 0.4). Además, la reserva incluye la entrada adicional que provocan las herramientas del proveedor, ningún gasto queda sin contar aunque se pierda una reserva, Redis no puede descartar datos por falta de memoria, Unburn fija a qué cuenta del proveedor se carga cada petición y la rotación de claves funciona tras cualquier número de rotaciones.

### 0.2. Regla de uso (MUY IMPORTANTE)

> **Regla de uso del documento:**
> - **Entregas al profesor** (TOGAF, presentaciones, memorias o cualquier documento que describa la empresa): se incluye **TODO**, tanto lo marcado como **[Fase 1 – MVP]** como lo marcado como **[Arquitectura objetivo]**.
> - **Implementación técnica del MVP** (programar, elegir qué construir, preparar una demo o pruebas): se usa **SOLO** lo marcado como **[Fase 1 – MVP]**. Cómo programarlo lo decide el equipo, respetando las garantías del documento (ver 0.4).
> - **En caso de duda:** se trata como entrega y se incluye todo.

El motivo: el profesor quiere ver el planteamiento de **una empresa real y completa**, no solo de un prototipo. El MVP es únicamente la primera parte que se construiría. TOGAF encaja con esto, porque distingue entre la **arquitectura objetivo** (la empresa completa a la que se aspira) y las **arquitecturas de transición** (los pasos intermedios). El MVP es la primera arquitectura de transición.

### 0.3. Etiquetas

| Etiqueta | Significado |
|---|---|
| **[Fase 1 – MVP]** | Se construiría en la primera versión del producto. Debe ser realista y técnicamente correcto. |
| **[Arquitectura objetivo]** | Forma parte de la empresa completa que se presenta al profesor, pero **no** se construye en el MVP. También es técnicamente correcto, solo que más ambicioso. |
| Sin etiqueta | Aplica a todo el proyecto (MVP y arquitectura objetivo). |

En las columnas "Fase" de las tablas se abrevian como **MVP** y **Objetivo**.

### 0.4. Otras convenciones

- **Nivel de detalle.** Este documento describe la **arquitectura**: qué hace cada pieza, qué garantiza y con qué tecnología. **No** describe cómo se programa (estructuras de datos, algoritmos, nombres de parámetros, ajustes de configuración): eso se decide al implementar el MVP, respetando las garantías que aquí se describen. Cuando aparece algún detalle técnico concreto, es porque condiciona una garantía o una decisión. Para las entregas al profesor, las secciones 4 a 6 se pueden resumir aún más.
- **Todas las cifras** (precios, límites, porcentajes, tiempos) son **estimaciones de ejemplo**, marcadas como *(ejemplo)*. Sirven para ilustrar, no son datos reales ni compromisos.
- **No se nombran modelos de IA concretos** (como versiones de GPT o Claude), porque cambian cada pocos meses. Se habla de "modelo caro" y "modelo económico".
- **Los dominios y claves de los ejemplos son ficticios**, por ejemplo `api.unburn.example` o `ub_live_agente_auditor_123`.
- **Los datos de mercado, competencia y normativa** reflejan la situación a **octubre de 2026** y pueden quedar desactualizados.
- **Las referencias legales son orientativas.** Este documento no es asesoramiento jurídico.

### 0.5. Mapa del documento

TOGAF organiza la arquitectura en **dominios**: negocio, datos, aplicación y tecnología. ArchiMate, el lenguaje de modelado asociado a TOGAF, habla de **capas**, y el profesor también usa esa palabra. En este documento, "dominio" y "capa" son sinónimos.

| Sección | Contenido | Elemento de TOGAF |
|---|---|---|
| 1 | Resumen en una página | Visión de arquitectura |
| 2 | Conceptos básicos para entender el proyecto | (apoyo) |
| 3 | Arquitectura de negocio | Dominio de negocio |
| 4 | Arquitectura de datos | Dominio de datos |
| 5 | Arquitectura de aplicación | Dominio de aplicación |
| 6 | Arquitectura tecnológica | Dominio de tecnología |
| 7 | Tecnologías emergentes | (transversal) |
| 8 | Análisis de brechas y hoja de ruta | Arquitectura de partida, brechas, oportunidades y planificación de la migración |
| 9 | Alcance del MVP | (apoyo a la implementación) |
| 10 | Limitaciones conocidas | (transversal) |
| 11 | Glosario | (apoyo) |
| 12 | Registro de decisiones | (apoyo) |

---

## 1. Resumen en una página

**Qué es Unburn.** Una plataforma **SaaS** (software que se usa por internet pagando una suscripción) que se coloca **entre las aplicaciones de IA de una empresa y los proveedores de modelos de IA** (OpenAI, Anthropic). En lugar de que los agentes de IA de la empresa hablen directamente con OpenAI, hablan primero con Unburn, que comprueba, limita y registra cada petición antes de dejarla pasar. Técnicamente es un **AI Gateway con estado**: un intermediario que tiene memoria (contadores de gasto, historial de cada sesión, permisos).

**Qué problema resuelve.** Las empresas usan cada vez más **agentes de IA** (programas que usan un modelo de IA para tomar decisiones y actuar solos) y **sistemas multiagente** (varios agentes colaborando). Esto genera cuatro problemas:

1. **Gasto descontrolado:** agentes que entran en bucles, respuestas enormes o abusos externos que disparan la factura del proveedor de IA.
2. **Falta de control y atribución:** una misma clave del proveedor repartida entre todos los equipos, sin saber quién gasta qué.
3. **Riesgo sobre los datos:** los agentes se conectan a herramientas y bases de datos de la empresa mediante **MCP**, y un atacante puede engañarles para que hagan lo que no deben.
4. **Falta de trazabilidad:** no queda registro de qué hizo la IA, cuándo y por qué se permitió o se bloqueó.

**Qué ofrece Unburn.**

- **Funciones base** (lo mínimo que espera el mercado): claves virtuales por equipo, presupuestos que cortan el gasto en tiempo real, límites de tamaño de respuesta, permisos de herramientas por agente, alertas y registro de auditoría.
- **Funciones diferenciales** (lo que nos distingue):
  - **Control de agentes:** detecta bucles por sesión de agentes y diagnostica qué agente y qué paso los causaron, usando **IA causal**.
  - **Escudo MCP con análisis de caminos indirectos:** limita qué herramientas y qué categorías de datos puede usar cada agente, y detecta cuándo un agente puede llegar a datos prohibidos **delegando** en otro agente.
  - **Grafo de contexto:** registra qué hizo cada agente, quién encargó qué y **por qué** Unburn permitió o bloqueó cada acción, durante el plazo de retención del plan.
  - **Sistema inmunológico digital:** detecta consumos anómalos y responde de forma gradual, sin tumbar todo el servicio.
  - **Control de gasto y seguridad de agentes en un solo producto** de autoservicio, pensado para startups y PYMES. Es una ventaja por segmento, pero no está libre de competencia: algunos grandes fabricantes también llegan a las PYMES (ver 3.10).
  - **Nube confidencial para grandes empresas** **[Arquitectura objetivo]**: procesamiento protegido por hardware mediante **computación confidencial**.

**Para quién.** Desarrolladores individuales, startups, PYMES y grandes empresas que usan agentes de IA.

**Cómo gana dinero.** Suscripción mensual según el número de peticiones que Unburn reenvía a los proveedores de IA, con un plan gratuito limitado, un plan Pro y contratos personalizados (Enterprise) para grandes empresas.

**Tecnologías emergentes del proyecto (7):** Sistemas Multiagente, Agentes de IA, Model Context Protocol (MCP), Context Graphs, Causal AI, Digital Immune System y Confidential Computing. Están explicadas en la sección 7.

**Dónde está alojado.** Los servidores y los datos de Unburn están en la nube de AWS, en una región de la Unión Europea (Irlanda). Las peticiones se reenvían al proveedor de IA que elige el cliente, que puede procesarlas fuera de la UE según el contrato del cliente con ese proveedor.

---

## 2. Conceptos básicos para entender el proyecto

Estos conceptos aparecen en todo el documento. Hay más en el glosario (sección 11).

- **Modelo de lenguaje (LLM):** una IA que recibe texto y genera texto, como los modelos de OpenAI (GPT) o Anthropic (Claude). Las empresas los usan a través de internet pagando por uso.
- **API:** la "puerta" por la que un programa habla con otro. Por ejemplo, una aplicación envía una pregunta a la API de OpenAI y recibe la respuesta.
- **Petición:** cada mensaje que una aplicación envía a la API de un modelo. Una conversación con un agente suele implicar muchas peticiones.
- **Token:** el trozo de texto con el que los modelos miden y cobran el trabajo (aproximadamente una palabra corta o parte de una palabra). Los proveedores cobran por **tokens de entrada** (lo que se envía) y **tokens de salida** (lo que el modelo genera). Algunos modelos también "piensan" internamente antes de responder (**tokens de razonamiento**). Esos tokens no se ven, pero se cobran como salida.
- **Clave de API (clave real):** la contraseña que da el proveedor (OpenAI, Anthropic) para usar su API. Quien la tiene puede gastar dinero de la empresa.
- **Agente de IA:** un programa que usa un modelo de IA para decidir qué hacer y actuar por su cuenta, por ejemplo buscando información o ejecutando acciones.
- **Herramienta (tool):** una función que un agente puede usar, como `buscar_cliente` o `crear_ticket`. El modelo decide cuándo usarla. Normalmente la ejecuta el programa del agente, pero algunas las ejecuta el propio proveedor de IA en sus servidores (por ejemplo, la búsqueda web). Ver 5.7.
- **Sistema multiagente:** varios agentes que colaboran y se pasan tareas entre sí. Por ejemplo, un agente planificador, un programador y un auditor.
- **MCP (Model Context Protocol):** un estándar abierto que define cómo los agentes descubren y usan herramientas y datos externos (bases de datos, archivos, servicios).
- **Proxy o gateway (pasarela):** un servidor intermediario por el que pasa el tráfico. Unburn es un gateway especializado en IA.
- **Streaming:** forma de recibir la respuesta del modelo a trozos, conforme se genera, en lugar de esperar al final.
- **Sesión:** el conjunto de peticiones que forman una misma tarea de uno o varios agentes. Por ejemplo, "resolver la incidencia 8812".

---

## 3. Arquitectura de negocio

> **Regla de uso:** en las entregas se incluye todo, tanto [Fase 1 – MVP] como [Arquitectura objetivo]. Para implementar el MVP, solo [Fase 1 – MVP].

### 3.1. Situación actual del cliente (arquitectura de partida)

En TOGAF, la **arquitectura de partida** (*baseline*) describe cómo están las cosas hoy. Como Unburn todavía no existe, la arquitectura de partida es **la situación actual de nuestros clientes**. Aquí se describe el dominio de negocio; la de los dominios de datos, aplicación y tecnología, junto con el análisis de brechas, está en la sección 8.

- Las aplicaciones y agentes de IA de la empresa hablan **directamente** con OpenAI o Anthropic.
- La **clave real** del proveedor está copiada en muchos sitios: servidores, repositorios de código, ordenadores de los desarrolladores.
- Los agentes se conectan a herramientas y datos internos mediante MCP **sin un control central** de permisos por agente.
- El gasto se descubre en la factura del proveedor o en su panel, normalmente cuando ya ha ocurrido.

Esto provoca cuatro problemas concretos:

**Problema 1. Gasto descontrolado.**
- **Bucles de agentes:** dos agentes pueden quedarse atascados repitiendo lo mismo. Por ejemplo, el agente auditor rechaza una solución y el programador la reenvía sin cambios, una y otra vez, durante horas.
- **Respuestas desmesuradas:** una petición sin límite de tamaño puede generar miles de tokens innecesarios.
- **Abuso externo:** un atacante envía muchas peticiones a la aplicación de IA de la empresa solo para hacerle gastar dinero. Se conoce como **ataque de agotamiento de costes** o **denegación de cartera** (*denial of wallet*).

**Problema 2. Falta de control y atribución.**
- Con una sola clave compartida, es difícil saber qué equipo o qué agente gasta qué.
- Si la clave se filtra, hay que revocarla, y eso afecta a todos los que la usan.
- Los proveedores ya ofrecen **límites de gasto básicos** (por proyecto o por espacio de trabajo), pero cada uno por separado y sin entender de agentes, sesiones ni herramientas.

**Problema 3. Riesgo sobre los datos y las herramientas (MCP).**
- Con MCP, un agente puede consultar bases de datos o ejecutar acciones.
- Un atacante puede introducir instrucciones engañosas en un texto que el agente lee. Esto se llama **inyección de instrucciones** (*prompt injection*). El objetivo es que el modelo pida usar herramientas que no debería, por ejemplo leer datos de facturación desde un agente de soporte.

**Problema 4. Falta de trazabilidad.**
- No queda un registro ordenado de qué se pidió, cuánto costó y por qué se permitió o bloqueó. Esto dificulta las auditorías internas y el cumplimiento normativo (RGPD, Reglamento Europeo de IA y, en el sector financiero, DORA; ver 3.11).

### 3.2. Propuesta de valor

**Unburn ofrece control financiero, seguridad y trazabilidad para empresas que usan agentes de IA**, con una integración que solo requiere cambiar una dirección y una clave en el código del cliente.

| Problema | Qué ofrece Unburn | Fase |
|---|---|---|
| Gasto descontrolado | Presupuestos con corte en tiempo real (patrón **reservar y liquidar**), límites de tamaño de respuesta, alertas | [Fase 1 – MVP] |
| Bucles de agentes | Detección de bucles por sesión y diagnóstico causal (qué agente y qué paso lo provocó y cuánto costó) | [Fase 1 – MVP] (versión básica) y [Arquitectura objetivo] (versión avanzada) |
| Abuso externo | **Sistema inmunológico digital**: detecta consumo anómalo y frena solo la parte afectada | [Fase 1 – MVP] |
| Control y atribución | **Claves virtuales** por equipo o agente, revocables una a una | [Fase 1 – MVP] |
| Riesgo MCP | **Escudo MCP**: cada agente solo ve y usa las herramientas permitidas por su **grafo de autorización**, y Unburn avisa de los **caminos indirectos** por delegación entre agentes | [Fase 1 – MVP] (versión básica) y [Arquitectura objetivo] (proxy MCP completo) |
| Trazabilidad | **Registro de auditoría** con metadatos de cada petición, sin guardar el texto, y **grafo de contexto** con el porqué de cada decisión | [Fase 1 – MVP] |
| Privacidad máxima (grandes empresas) | **Unburn Cloud Confidencial** (computación confidencial) o **despliegue privado** | [Arquitectura objetivo] |

**Funciones base frente a funciones diferenciales.** Las claves virtuales, los presupuestos y los **permisos de herramientas por agente** son la **base**: sin ellos el producto no sería creíble, pero la competencia ya los ofrece (ver 3.10). Lo que **diferencia** a Unburn es:
- el análisis de **caminos indirectos** entre agentes;
- la detección y el **diagnóstico causal de bucles** por sesión;
- el **grafo de contexto** con el porqué de cada decisión;
- el sistema inmunológico con respuesta gradual;
- y, sobre todo, la **combinación de control de gasto (FinOps) y seguridad de agentes en un solo producto** sencillo, pensado para startups y PYMES.

### 3.3. Segmentos de clientes

Unburn es principalmente **B2B** (vende a empresas), con un plan para **desarrolladores individuales**.

| Segmento | Qué necesita | Plan habitual |
|---|---|---|
| Desarrolladores individuales y estudiantes | Proteger sus proyectos personales de facturas inesperadas | Gratis |
| Startups | Controlar el gasto de sus agentes y saber qué equipo gasta qué | Gratis → Pro |
| PYMES que usan agentes (incluidas las que usan herramientas de automatización como n8n) | Control sencillo, alertas y seguridad sin un equipo técnico grande | Pro |
| Grandes empresas y sectores regulados (banca, seguros, salud) | Auditoría, contratos, garantías de disponibilidad y máxima privacidad | Enterprise (contrato personalizado) |

### 3.4. Actores y roles

En TOGAF, los **actores** son quienes participan en el negocio.

| Actor | Tipo | Qué hace |
|---|---|---|
| Administrador del cliente | Persona | Da de alta la empresa, guarda la clave real, crea claves virtuales y configura presupuestos, permisos y alertas en el panel web. |
| Desarrollador del cliente | Persona | Cambia la dirección y la clave en el código de su aplicación para que el tráfico pase por Unburn. |
| Agente de IA del cliente | Máquina | Envía peticiones al modelo de IA a través de Unburn. Es quien realmente "gasta". |
| Usuario final del cliente | Persona | Usa la aplicación de IA del cliente (por ejemplo, un chatbot). Puede ser legítimo o un atacante. |
| Proveedor de modelos | Organización externa | OpenAI o Anthropic. Ejecuta el modelo y cobra al cliente por tokens. |
| Equipo de Unburn | Personas | Ingeniería (construye y mantiene), soporte (ayuda a clientes) y ventas (contratos Enterprise). |
| Socios | Organizaciones externas | Ver 3.9. |

### 3.5. Capacidades de negocio

Las **capacidades** son lo que la empresa sabe hacer.

1. **Gestión de claves e identidades:** crear, revocar y asignar claves virtuales.
2. **Gestión financiera del consumo de IA (FinOps):** presupuestos, reservas, liquidación, alertas e informes de gasto.
3. **Gobierno de agentes:** sesiones, detección de bucles y diagnóstico causal.
4. **Seguridad de herramientas (MCP):** grafo de autorización, permisos por agente y análisis de caminos indirectos.
5. **Detección y respuesta ante anomalías:** sistema inmunológico digital.
6. **Auditoría y cumplimiento:** registro de eventos, exportación y retención.
7. **Gestión de suscripciones y facturación:** planes, cuotas de peticiones y cobros.
8. **Soporte y éxito del cliente.**
9. **Gestión de socios** (canal de venta e integraciones).
10. **Privacidad avanzada para grandes empresas** **[Arquitectura objetivo]**: nube confidencial y despliegue privado.

### 3.6. Procesos de negocio principales

**Proceso 1. Alta y configuración del cliente (onboarding).** Meta: completar el caso básico en menos de 15 minutos *(ejemplo)*.
1. El administrador se registra en el panel web.
2. Guarda la **clave real** de su proveedor (OpenAI o Anthropic). Unburn la cifra y nadie puede volver a verla en claro desde el panel.
3. Crea **claves virtuales**, por ejemplo una para "Agente de Marketing", otra para "Pruebas" y otra para "Producción".
4. Configura **presupuestos y alertas** para cada clave y, si usa MCP, los **permisos de herramientas** (ver 5.7).
5. El desarrollador cambia la **dirección** y la **clave** en su código y añade la **cabecera de sesión** y, si varios agentes comparten una clave, la **cabecera de agente** (ver 5.3).

**Proceso 2. Atención de peticiones (operación diaria).** Cada petición pasa por Unburn, que la comprueba, la reenvía al proveedor, devuelve la respuesta y registra los metadatos. El detalle está en 5.4.

**Proceso 3. Gestión de incidentes.** Cuando Unburn detecta un bucle, un consumo anómalo o un presupuesto agotado:
1. Aplica la respuesta configurada (avisar, frenar, cambiar de modelo o cortar).
2. Envía una alerta (email, Slack, Microsoft Teams o un webhook).
3. Muestra en el panel el diagnóstico: causa probable, coste del incidente y, si Unburn lo detuvo, ahorro estimado.
4. El administrador revisa el incidente y ajusta la configuración si hace falta.

**Proceso 4. Facturación de la suscripción.** Unburn cuenta las peticiones facturables de cada cliente (ver 3.7), aplica su plan, cobra mensualmente mediante una pasarela de pagos y avisa al 80% y al 100% de la cuota.

**Proceso 5. Venta Enterprise** **[Arquitectura objetivo]**. Venta consultiva para grandes empresas: demostración, revisión de seguridad, contrato personalizado (precio, garantías de disponibilidad, soporte, retención de datos) y elección entre nube confidencial o despliegue privado.

### 3.7. Modelo de ingresos y planes

**Hay dos contadores distintos que no hay que confundir:**

| Contador | Qué mide | Quién cobra |
|---|---|---|
| **Cuota de peticiones** | Cuántas peticiones de generación **reenvía** Unburn al proveedor para el cliente cada mes | **Unburn** (es nuestra suscripción) |
| **Presupuesto de IA** | Cuántos euros gasta el cliente en OpenAI o Anthropic | **El proveedor de IA**. Unburn solo lo **controla**; ese dinero no es nuestro. |

**Planes** (todas las cifras son *ejemplos*):

| | Gratis | Pro | Enterprise **[Arquitectura objetivo]** |
|---|---|---|---|
| Precio | 0 € | 49 €/mes *(ejemplo)* | Contrato personalizado |
| Peticiones incluidas al mes | 10.000 *(ejemplo)* | 500.000 *(ejemplo)* | Negociadas |
| Si se supera la cuota | Se corta el servicio hasta el mes siguiente o hasta que mejore de plan | Excedente: 8 € por cada bloque de 100.000 peticiones o fracción *(ejemplo)*, con un tope de gasto que fija el cliente | Negociado |
| Claves virtuales | Hasta 3 *(ejemplo)* | Ilimitadas | Ilimitadas |
| Presupuestos, límites de respuesta, detección de bucles | Sí | Sí | Sí |
| Sistema inmunológico | Básico: alertas y límite de velocidad | Completo: respuesta gradual, cambio de modelo, memoria | Completo |
| Control de las herramientas que ejecuta el proveedor (denegadas por defecto y acotadas; ver 5.4, paso 5) | Sí, por clave virtual | Sí, por agente | Sí, por agente |
| Escudo MCP completo (grafo de autorización por agente, caminos indirectos), diagnóstico causal | No | Sí | Sí |
| Alertas | Email | Email, Slack, Teams, webhooks | Todas |
| Retención del registro de auditoría | 7 días *(ejemplo)* | 30 días *(ejemplo)* | 6 meses o más, configurable |
| Nube confidencial o despliegue privado, garantías contractuales de disponibilidad (SLA), soporte dedicado | No | No | Sí |

**Ejemplo de cálculo** *(ejemplo)*: un cliente Pro al que Unburn le reenvía 650.000 peticiones en un mes paga 49 € más 2 bloques de excedente (150.000 peticiones = 1,5 bloques, redondeado a 2), es decir, 49 + 16 = **65 €**.

**Qué cuenta como "petición facturable":**
- **Cuentan** las **peticiones de generación** (las que piden al modelo que responda: *Chat Completions*, *Responses API* o *Messages*) que Unburn **reenvía al proveedor**, aunque luego bloquee la respuesta (por ejemplo, porque el modelo pidió una herramienta prohibida). En la arquitectura objetivo también cuentan las respondidas desde la caché semántica.
- **No cuentan:**
  - las peticiones auxiliares que no generan nada, como consultar la lista de modelos, contar tokens o consultar una respuesta ya creada (ver 5.3);
  - las que Unburn rechaza **antes** de llegar al proveedor: clave inválida, petición que no cumple los límites del cliente (400), cuota agotada, presupuesto o tope agotado (402), agente, API u opción no permitidos (403), bucle bloqueado (422) o frenada por el sistema inmunológico o por los límites de volumen de la entrada (429).

**Por qué así:** si contaran las peticiones rechazadas, un atacante podría agotar la cuota del cliente a propósito, por ejemplo enviando peticiones a una clave cuyo presupuesto ya está agotado, y dejar su servicio sin funcionar o generarle excedentes. Para que estas peticiones rechazadas tampoco le cuesten demasiado a Unburn, se rechazan por un **camino muy barato** y los volúmenes abusivos se frenan en la entrada (ver 5.8 y 6.7).

**Qué pasa al agotar la cuota del plan gratuito:** Unburn devuelve un error (402) y **la IA del cliente deja de funcionar** hasta que empiece el mes siguiente o mejore de plan, porque todo su tráfico de IA pasa por Unburn. Se avisa por email al 80% y al 100%.

**Qué pasa al alcanzar el tope de excedente del plan Pro:** igual que en el plan Gratis, Unburn devuelve un error (402) indicando que se ha alcanzado el tope, y la IA del cliente se detiene. El administrador puede **subir el tope desde el panel** en cualquier momento y el servicio se reanuda al instante; si no lo hace, se reanuda al empezar el mes siguiente. Se avisa por email al 80% y al 100% del tope. El tope existe precisamente para que el cliente decida cuánto está dispuesto a pagar como máximo.

### 3.8. Estrategia de crecimiento

**Crecimiento guiado por el producto (*Product-Led Growth*).** El producto se vende solo a través de su uso, sin depender de largos procesos de venta:
1. El **plan gratuito** atrae a desarrolladores que quieren proteger sus proyectos personales.
2. Si les resulta útil, lo proponen en las empresas donde trabajan (se convierten en "campeones internos").
3. La empresa pasa al plan Pro y, si es grande, a Enterprise.

**El ahorro como gancho.** El panel muestra el impacto en euros, por ejemplo: *"Hoy se han detenido 2 bucles y se han frenado 3 picos de tráfico anómalo. Ahorro estimado: entre 60 y 90 €, suponiendo que habrían seguido una hora más al mismo ritmo"* *(ejemplo)*. El ahorro es siempre una **estimación** con su hipótesis visible, porque calcula lo que **habría** pasado sin Unburn. Solo se atribuye ahorro cuando Unburn **detiene o frena** algo; si solo avisa, se muestra el coste del incidente, no un ahorro (ver 5.6).

**Retención por valor, no por encierro.** Los clientes se quedan porque el producto les resulta útil (historial de gasto, configuración de agentes, alertas, auditoría), no porque sea difícil irse. Unburn permite **exportar** el registro de auditoría y la configuración en cualquier momento. Además, la normativa lo exige: el **Data Act** obliga a los servicios en la nube a facilitar el cambio de proveedor, y **DORA** exige a los clientes financieros poder salir (ver 3.11).

### 3.9. Socios clave

Son propuestas del plan de negocio, **no acuerdos existentes**.

| Tipo de socio | Ejemplos | Qué aportan | Qué reciben |
|---|---|---|---|
| **Canal de venta** | Agencias de automatización e integradores que montan agentes y flujos de n8n para PYMES | Llevan Unburn a sus clientes | Comisión por cliente referido |
| **Ecosistema** | Frameworks de agentes y plataformas de automatización (n8n, LangChain, CrewAI…) | Visibilidad: Unburn aparece en sus guías de integración | Una integración útil para sus usuarios |
| **Infraestructura** | *Marketplace* de AWS | Un canal de compra para grandes empresas, que a menudo prefieren comprar a través de su nube | Ventas a través de su *marketplace* |

**Nota sobre n8n:** no hace falta ninguna alianza para funcionar con n8n. Sus nodos de OpenAI permiten cambiar la dirección base, así que basta con apuntarlos a Unburn. Publicar un nodo propio verificado en n8n es una mejora futura **[Arquitectura objetivo]**.

### 3.10. Competencia y diferenciación

El mercado se ha consolidado mucho en 2026. Los grandes fabricantes de ciberseguridad y de datos están comprando gateways de IA y plataformas de seguridad de agentes:

- **Palo Alto Networks** completó la compra de **Portkey** el 29 de mayo de 2026 y lo convirtió en el gateway de su plataforma de seguridad de IA, **Prisma AIRS**. Ofrece identidad de agentes, políticas centralizadas y acceso a servidores MCP.
- **Snowflake** anunció el 28 de mayo de 2026 la compra de **Natoma**, un gateway MCP que aplica identidad, políticas y auditoría a cada llamada a herramienta, y la completó a principios de junio de 2026.
- **Proofpoint** compró **Acuvity** (seguridad de IA) en febrero de 2026. Además, desde diciembre de 2025 es dueña de **Hornetsecurity**, que vende seguridad a PYMES a través de miles de proveedores de servicios gestionados, y presentó esa compra como una forma de proteger a personas, agentes de IA y datos también en las PYMES. Es decir: los grandes fabricantes **no** se limitan a las grandes empresas.
- En observabilidad de IA, **ClickHouse** compró **Langfuse** (enero de 2026) y **Mintlify** compró **Helicone** (marzo de 2026), que quedó en modo mantenimiento.
- En código abierto, **Envoy AI Gateway** publicó su versión 1.0 el 23 de junio de 2026, con enrutamiento MCP, filtrado de herramientas y atribución de costes por tipo de token.
- **LiteLLM** sufrió el 24 de marzo de 2026 un **ataque a la cadena de suministro**: dos versiones publicadas en PyPI robaban credenciales (claves de nube, SSH, Kubernetes) al instalarse. Es un recordatorio de que un gateway de IA es una pieza crítica y un objetivo valioso (ver 6.10).

| Alternativa | Qué ofrece | Qué aporta Unburn |
|---|---|---|
| **Límites nativos de los proveedores** (OpenAI, Anthropic) | Límites de gasto y claves por proyecto o espacio de trabajo, cada proveedor por separado | Una sola consola para varios proveedores; control por sesión y por agente; detección de bucles; escudo MCP |
| **Gateways de IA** (LiteLLM, Bifrost, Kong AI Gateway, Cloudflare AI Gateway, Envoy AI Gateway…) | Claves virtuales, presupuestos, caché, cambio entre proveedores; varios incluyen filtrado de herramientas MCP | Detección y diagnóstico causal de bucles por sesión de agentes; grafo de contexto con el porqué de cada decisión; análisis de caminos indirectos; sistema inmunológico con respuesta gradual |
| **Gateways MCP y plataformas de seguridad de agentes** (Prisma AIRS con Portkey, Natoma, Acuvity en Proofpoint…) | Identidad propia para cada agente, políticas por herramienta, registro de cada llamada; algunas atribuyen cada acción a lo largo de la cadena de delegación usuario → agente → subagente | Control de gasto (FinOps) y seguridad de agentes **en el mismo producto**; análisis de caminos indirectos en la configuración; diagnóstico de bucles; producto de autoservicio pensado para startups y PYMES, no solo para grandes empresas |
| **API gateways tradicionales** (sin módulos de IA) | Enrutar y limitar tráfico web | Entiende tokens, costes, modelos, agentes y herramientas |

**Nota honesta:**
- Las funciones base (claves virtuales, presupuestos, caché) y los **permisos de herramientas por agente** ya **no nos diferencian**: son lo que el mercado espera.
- Lo que sigue siendo diferencial es el **análisis de caminos indirectos**, la **detección y el diagnóstico de bucles** y la **combinación de FinOps y seguridad de agentes** en un producto sencillo y de autoservicio para empresas pequeñas y medianas.
- La diferenciación por segmento (startups y PYMES) **existe, pero no está libre de competencia**: fabricantes como Proofpoint ya llegan a las PYMES a través de canales de servicios gestionados. La ventaja de Unburn en ese segmento es el **autoservicio** (alta en minutos, plan gratuito, sin venta consultiva) y la combinación con el control de gasto, no la ausencia de competidores.
- La consolidación es una buena y una mala noticia. Confirma que el problema es real y que hay mercado, pero también que competimos con fabricantes muy grandes. La estrategia de Unburn es no competir de frente por la gran empresa al principio: crecer desde desarrolladores, startups y PYMES (ver 3.8).
- Este mercado cambia muy rápido. La comparación refleja la situación de octubre de 2026 y debe revisarse antes de cada entrega.
- Unburn **no sustituye** a los límites nativos de los proveedores. Se recomienda mantenerlos como segunda barrera de seguridad.

### 3.11. Marco normativo

> No es asesoramiento jurídico. Antes de usar este planteamiento comercialmente, debería revisarlo un abogado.

- **RGPD (protección de datos).** Unburn tiene **dos papeles distintos**:
  - **Como encargado del tratamiento** (trata datos por cuenta del cliente): el contenido de las peticiones y los metadatos de auditoría, incluidas IP y seudónimos de usuarios finales. El **cliente** es el **responsable** de esos datos. Unburn necesita un **contrato de encargo** con cada cliente (artículo 28 del RGPD) y una lista de sus **subencargados**: AWS (alojamiento y, si las alertas por email contienen datos personales, Amazon SES). La observabilidad también se aloja en AWS (ver 6.8), para no añadir más subencargados.
  - **Como responsable del tratamiento** (datos propios de Unburn): las cuentas de los usuarios del panel y la facturación. Aquí la pasarela de pagos (Stripe) es encargado de Unburn, **no** un subencargado de los datos del cliente.
  - El **proveedor de IA** lo contrata el cliente directamente con su propia clave real. Unburn transmite las peticiones siguiendo las instrucciones del cliente. Ese proveedor puede procesar los datos **fuera de la UE**, según el contrato entre el cliente y el proveedor.
  - Las **direcciones IP** y los **identificadores de usuario final** son datos personales. Por eso Unburn recomienda enviar identificadores seudonimizados (ver 4.7).
- **Reglamento Europeo de IA (AI Act).** El llamado **Ómnibus Digital sobre IA** modificó sus plazos: se publicó en el Diario Oficial de la UE el 24 de julio de 2026 como **Reglamento (UE) 2026/1744** y entró en vigor el 27 de julio de 2026. Las fechas que quedan son:
  - **Obligaciones de transparencia** (artículo 50, por ejemplo avisar de que se habla con una IA): desde el **2 de agosto de 2026**.
  - **Sistemas de alto riesgo independientes** (anexo III, por ejemplo en empleo o educación): desde el **2 de diciembre de 2027**.
  - **Sistemas de alto riesgo integrados en productos regulados** (anexo I): desde el **2 de agosto de 2028**.

  Los proveedores y los responsables del despliegue de sistemas de alto riesgo deben **conservar los registros automáticos al menos seis meses** (artículos 19 y 26.6). El registro de auditoría de Unburn puede **complementar** esos registros, pero solo con una retención suficiente: por eso el plan Enterprise ofrece 6 meses o más. Con las retenciones de los planes Gratis y Pro (7 y 30 días) **no sirve** para este fin.
- **Data Act** (Reglamento de Datos de la UE, aplicable desde el 12 de septiembre de 2025). Impone a los servicios de tratamiento de datos, **incluidos los SaaS como Unburn**, obligaciones para facilitar el **cambio de proveedor**: cláusulas contractuales específicas, exportación de los datos, plazos máximos de preaviso y de transición, y eliminación de las tarifas por cambio desde el **12 de enero de 2027**. Unburn las cumple con la exportación completa de datos y configuración (ver 3.8) y con contratos que recogen estas condiciones.
- **DORA** (resiliencia digital del sector financiero, aplicable desde enero de 2025). Para un banco o aseguradora, Unburn sería un **proveedor externo de servicios tecnológicos**. Los contratos con esos clientes deben incluir derechos de auditoría, garantías de continuidad y una **estrategia de salida** (poder irse llevándose sus datos).
- **Cyber Resilience Act (CRA)** (Reglamento de Ciberresiliencia). Se aplica al software que se **entrega para instalar**, como el **despliegue privado** de la arquitectura objetivo (ver 6.12). El servicio SaaS en sí queda, en general, fuera de su alcance. Fechas:
  - Obligación de **notificar vulnerabilidades explotadas e incidentes graves**: desde el **11 de septiembre de 2026**.
  - **Obligaciones completas** (marcado CE, lista de componentes del software o SBOM, gestión de vulnerabilidades durante todo el periodo de soporte): desde el **11 de diciembre de 2027**.

  Si el proyecto empezara hoy, la Fase 3 de la hoja de ruta (donde está el despliegue privado) empezaría después de esa fecha, así que tendría que cumplirlo desde el primer día.

### 3.12. Origen del nombre

En el mundo de las startups, ***burn rate*** (tasa de quema) es la velocidad a la que una empresa gasta su dinero. **"Unburn"** significa "dejar de quemar dinero". Es un nombre directo que conecta con la principal preocupación de fundadores y directores técnicos: que la IA no se coma su presupuesto.

---

## 4. Arquitectura de datos

> **Regla de uso:** en las entregas se incluye todo, tanto [Fase 1 – MVP] como [Arquitectura objetivo]. Para implementar el MVP, solo [Fase 1 – MVP].

### 4.1. Principios

1. **Minimización:** por defecto, Unburn **no guarda el texto** de las peticiones ni de las respuestas. Solo pasa por su memoria mientras se procesa. Se guardan metadatos (quién, cuándo, cuánto costó, qué se decidió y por qué).
2. **Almacenamiento en la UE:** todos los datos que guarda Unburn se alojan en una región de AWS de la Unión Europea (Irlanda). Las peticiones, en cambio, se reenvían al proveedor de IA que elige el cliente, que puede procesarlas fuera de la UE según su propio contrato con ese proveedor.
3. **Cifrado siempre:** en tránsito (HTTPS/TLS) y en reposo (bases de datos cifradas). Las claves reales de los proveedores, además, con cifrado específico (ver 4.6).
4. **Retención limitada:** los registros se borran pasado un plazo que depende del plan (ver 4.7).
5. **El cliente es dueño de sus datos:** puede exportarlos en cualquier momento.

### 4.2. Entidades de datos

Estas son las "cosas" sobre las que Unburn guarda información. La columna "Dónde" se explica en 4.4.

| Entidad | Qué representa | Datos principales | Dónde | Fase |
|---|---|---|---|---|
| **Organización** | Una empresa o desarrollador cliente | Nombre, plan, zona horaria, política ante fallos | PostgreSQL | MVP |
| **Usuario del panel** | Una persona que entra al panel web | Email, rol (administrador o lector) | PostgreSQL | MVP |
| **Clave de proveedor** | La clave real de OpenAI o Anthropic del cliente | Proveedor, clave **cifrada**, organización o proyecto del proveedor al que se cargan las peticiones (si el proveedor lo permite), fecha de alta | PostgreSQL (cifrada con KMS) | MVP |
| **Clave virtual** | Una clave de Unburn para un equipo, agente o entorno | Nombre, prefijo visible, **huella** de la clave (nunca la clave completa), estado (activa o revocada), clave de proveedor asociada, modelos permitidos, **agentes permitidos** (opcional; ver 5.3), herramientas del proveedor autorizadas, políticas (bucles, fallos, modelo sustituto), clave a la que sustituye (si viene de una rotación) | PostgreSQL (copia rápida en Redis) | MVP |
| **Presupuesto** | Un límite de gasto en IA | Ámbito (organización o clave virtual), periodo (diario o mensual), límite blando (avisa), límite duro (corta) | PostgreSQL | MVP |
| **Contador de gasto** | Lo gastado y lo reservado en el periodo actual | Ámbito, periodo, euros gastados, euros reservados | Redis | MVP |
| **Reserva** | Dinero apartado temporalmente para una petición en curso | Identificador único, importe, presupuestos afectados, caducidad (se renueva mientras dura la petición; ver 5.5) | Redis | MVP |
| **Agregado de gasto** | Totales por intervalos de 15 minutos, para reconstruir contadores, facturar y generar informes | Organización, clave virtual, intervalo, euros gastados, peticiones facturables | PostgreSQL | MVP |
| **Tabla de precios** | Todo lo que cobra cada proveedor por cada modelo | Proveedor, modelo, fecha de vigencia y **todas las dimensiones de precio**: tokens de entrada, salida y razonamiento; lectura y escritura en caché; contexto largo; niveles de servicio (por ejemplo, prioritario); imagen y audio; y, para cada herramienta del proveedor, su **tarifa por uso** y una **estimación de la entrada adicional por uso**, porque sus resultados se cobran como tokens de entrada (ver 5.5) | PostgreSQL | MVP |
| **Cadena de respuestas** | Para conversaciones cuyo historial guarda el proveedor (ver 5.4, paso 3) | Identificador de la respuesta del proveedor, **clave virtual propietaria** (al rotar una clave, la propiedad pasa a la nueva; ver 5.3), tokens acumulados de la conversación | Redis (con copia en PostgreSQL) | MVP |
| **Sesión** | Una tarea de uno o varios agentes | Identificador (lo envía el cliente), inicio, número de llamadas, coste acumulado, estado | Redis (activa) y PostgreSQL (resumen) | MVP |
| **Agente** | Un agente de IA del cliente | Nombre, organización, claves virtuales que puede usar | PostgreSQL | MVP |
| **Grafo de sesión** | Parte del **grafo de contexto** (ver 7.5): las llamadas de una sesión, cómo se relacionan y qué decidió Unburn en cada una | Nodos: llamadas (agente, herramienta pedida, coste, decisión de Unburn, motivo y regla aplicada). Aristas: "esta llamada usó el resultado de aquella", "este agente encargó la tarea a aquel" | Redis mientras la sesión está activa. Además, **cada evento de auditoría guarda sus aristas y su decisión** (ver 4.3), así que el grafo se puede reconstruir desde PostgreSQL durante todo el plazo de retención del plan | MVP |
| **Grafo de autorización** | Parte del **grafo de contexto**: los permisos de herramientas y datos de cada agente | Nodos: agentes, herramientas (del cliente y del proveedor), categorías de datos. Aristas: "puede usar", "accede a", "puede delegar en" | PostgreSQL (copia rápida en Redis) | MVP |
| **Catálogo de herramientas** | Las herramientas que Unburn ha visto usar a cada agente | Nombre de la herramienta, quién la ejecuta (cliente o proveedor), primera vez vista, agentes que la usan, categoría de datos asignada | PostgreSQL | MVP |
| **Línea base de consumo** | El consumo "normal" de cada clave, sesión o usuario final | Media y variabilidad de euros por minuto y tokens por minuto | Redis | MVP |
| **Evento de auditoría** | El registro de una petición. Si llega al proveedor, tiene dos: uno de inicio al reservar y otro de cierre al liquidar | Ver 4.3 | PostgreSQL (llega a través de Redis y de la cola; ver 4.5) | MVP |
| **Sello de auditoría** | Un resumen firmado de cómo estaban, en un momento dado, **todas** las cadenas de auditoría con eventos nuevos (ver 4.8) | Hora, resumen de las cadenas (con identificadores anónimos de cadena, sin datos de los clientes), firma | Amazon S3 con bloqueo de objetos en modo cumplimiento (y en PostgreSQL, lo necesario para que cada organización compruebe que su cadena está incluida) | MVP |
| **Incidente** | Un bucle, anomalía, presupuesto agotado o permiso denegado | Tipo, sesión, causa raíz, coste del incidente (en bucles, coste del bucle y cota superior del coste atribuible), ahorro estimado (solo si Unburn lo detuvo, como rango y con su hipótesis), respuesta aplicada, estado | PostgreSQL | MVP |
| **Canal de alertas** | A dónde se envían los avisos | Tipo (email, Slack, Teams, webhook), destino, umbrales | PostgreSQL | MVP |
| **Uso de la suscripción** | Peticiones facturables consumidas del plan (ver 3.7) | Contador del mes, excedente, tope de excedente | Redis (contador) y PostgreSQL (cierre mensual) | MVP |
| **Entrada de caché semántica** | Una respuesta guardada para reutilizarla | Vector de la pregunta, respuesta, clave virtual, caducidad | Base de datos vectorial | Objetivo |

### 4.3. Qué se guarda y qué no

| Dato | ¿Se guarda? | Detalle |
|---|---|---|
| Texto de las peticiones (*prompts*) y de las respuestas | **No** | Solo pasa por la memoria del proxy mientras se procesa. Única excepción: la caché semántica, que es **opcional, viene desactivada** y solo existe en la arquitectura objetivo. |
| **Huellas** (*hashes*) del contenido nuevo de cada llamada (último mensaje, argumentos y resultado de herramientas) | Sí. En Redis durante 24 horas *(ejemplo)*. Si la sesión tuvo un incidente, las huellas de las llamadas implicadas se guardan **con el incidente** en PostgreSQL durante el plazo de retención del plan | Hacen falta para detectar bucles y diagnosticarlos (ver 5.6). Una huella es un código corto calculado a partir del texto que **no permite reconstruirlo**: sirve para saber si dos textos son idénticos sin guardarlos. Se calcula con una clave secreta distinta para cada organización (técnica HMAC), para que nadie pueda adivinar textos cortos probando combinaciones. |
| Metadatos de cada petición | Sí | Fecha y hora, organización, clave virtual, sesión, agente, agente que encargó la tarea, **identificadores de las llamadas de las que depende**, proveedor, API, modelo pedido y modelo usado, tokens (entrada, salida, razonamiento, caché), usos de herramientas del proveedor, coste estimado y real, latencia, decisión (permitida, bloqueada, frenada o con modelo sustituido), **motivo, regla o permiso que la justificó** y **versión de la configuración** vigente. |
| Nombres de herramientas y de agentes | Sí | Son nombres técnicos que define el cliente, como `buscar_cliente` o `agente-soporte`. |
| Dirección IP de origen | Sí | Normalmente es la del **servidor del cliente**, no la del usuario final. Es un dato personal y se trata como tal. |
| Identificador del usuario final | Solo si el cliente lo envía | Se recomienda enviar un **seudónimo** (un código que no revele quién es la persona), nunca un email o un nombre. |
| Clave real del proveedor | Sí, **cifrada** | Ver 4.6. Nadie puede volver a verla en claro desde el panel. |
| Clave virtual | Solo su **huella** y un prefijo visible | La clave completa se muestra **una sola vez** al crearla, como una contraseña. Si se pierde, se crea otra. |
| Datos de pago (tarjetas) | **No** | Los gestiona la pasarela de pagos. |

### 4.4. Dónde vive cada dato (almacenes)

| Almacén | Para qué | Tipo de dato | Fase |
|---|---|---|---|
| **Redis** (base de datos en memoria; en AWS se usa ElastiCache con Valkey, una versión compatible) | Lo que hay que leer y escribir en milisegundos en cada petición | Contadores, reservas, registros de auditoría pendientes de enviar, copia de claves virtuales y permisos, sesiones activas, huellas, líneas base, cadenas de respuestas | MVP |
| **PostgreSQL** (base de datos relacional) | Lo permanente. Es la **fuente de verdad** | Configuración, claves cifradas, presupuestos, grafos, auditoría, agregados de gasto, incidentes, facturación | MVP |
| **AWS KMS** (servicio de gestión de claves de cifrado) | Guardar la **llave maestra** que cifra las claves reales y **firmar** los sellos de auditoría | Las llaves nunca salen de KMS | MVP |
| **Amazon SQS** (cola de mensajes) | Llevar los eventos de auditoría hasta el servicio de auditoría, con reintentos | Eventos en tránsito, normalmente durante unos segundos | MVP |
| **Amazon S3 con bloqueo de objetos** (*Object Lock*) en **modo cumplimiento** | Guardar los sellos de auditoría de forma que **nadie**, ni siquiera el administrador principal de la cuenta de AWS de Unburn, pueda modificarlos ni borrarlos hasta que venza su plazo | Sellos firmados | MVP |
| **Pasarela de pagos** (por ejemplo Stripe) | Cobrar las suscripciones | Datos de pago del cliente (no los guarda Unburn) | MVP |
| **Base de datos vectorial** | Caché semántica y detección semántica de bucles | Vectores numéricos y respuestas guardadas | Objetivo |

**Redis guarda datos que no se pueden perder** (contadores, reservas y registros de auditoría pendientes de enviar), no solo una caché. Por eso se configura para que **nunca descarte datos** cuando se queda sin memoria (por defecto podría borrar datos con caducidad, y eso reiniciaría presupuestos sin que nadie se enterara), y con **alarmas de memoria** para ampliarlo antes de que se llene (6.5 y 6.8).

### 4.5. Flujo de los datos

```
Petición del cliente
   │
   ▼
Gateway (memoria del proxy) ──► el texto se procesa aquí y NO se guarda
   │
   ├──► Proveedor de IA (OpenAI / Anthropic): recibe la petición completa
   │
   └──► Redis: cada cambio de gasto se guarda junto con su registro de auditoría
        (además: reservas, huellas temporales, sesión activa)
             │
             ▼
        Cola SQS ──► Servicio de auditoría ──► PostgreSQL (eventos encadenados y agregados de gasto)
                           │                        └──► Panel, informes, exportación
                           └──► cada pocos minutos: un sello firmado con KMS ──► S3
```

### 4.6. Protección de las claves reales de los proveedores

Unburn usa **cifrado por sobres** (*envelope encryption*), una técnica estándar:

1. En **AWS KMS** vive una **llave maestra** que nunca sale de allí.
2. Cada clave real del cliente se cifra con una **llave de datos**, y esa llave de datos se cifra a su vez con la llave maestra. En PostgreSQL solo se guardan versiones cifradas.
3. Cuando el proxy necesita una clave real, pide a KMS que descifre la llave de datos, descifra la clave real y la guarda **en memoria durante unos minutos** *(ejemplo: 5 minutos)*, para no llamar a KMS en cada petición.

**Limitación honesta:** mientras se usa, la clave real está **sin cifrar en la memoria del proxy**. Un atacante con acceso total al servidor podría leerla. Eliminar este riesgo es justo lo que aporta la **computación confidencial** en la arquitectura objetivo (ver 6.11 y 7.7).

### 4.7. Datos personales y retención

**Retención del registro de auditoría** *(ejemplo)*:

| Plan | Retención |
|---|---|
| Gratis | 7 días |
| Pro | 30 días |
| Enterprise | 6 meses o más, configurable según contrato (6 meses es el mínimo que exige el AI Act para los registros de sistemas de alto riesgo; ver 3.11) |

- **Agregados de gasto:** 13 meses *(ejemplo)*, independientemente del plan. Solo contienen totales por organización, clave virtual e intervalo (sin IP ni usuarios finales), y hacen falta para facturar y para reconstruir los contadores (ver 4.9). Se guardan en intervalos de 15 minutos porque todas las zonas horarias del mundo se diferencian de la hora universal (UTC) en múltiplos de 15 minutos. Así se puede reconstruir el día y el mes **en la zona horaria de cada organización**, que es como se aplican los presupuestos (5.5).
- **Huellas temporales:** 24 horas *(ejemplo)*, salvo las vinculadas a un incidente, que siguen la retención del plan.
- **Al darse de baja:** el cliente puede exportar sus datos. Después, en un plazo de 30 días *(ejemplo)*, se borran la configuración, las claves, el registro de auditoría, los incidentes y las huellas. Hay tres excepciones:
  - **Facturas y datos de facturación:** se conservan durante los plazos que exige la legislación fiscal y mercantil (en España, varios años).
  - **Agregados de gasto:** se conservan solo hasta cerrar la última factura y resolver posibles reclamaciones sobre ella, y después se borran.
  - **Sellos de auditoría en S3:** no se pueden borrar hasta que vence su bloqueo (4.8). No contienen datos personales ni contenido, solo huellas con identificadores anónimos de cadena, y una vez borrados los datos del cliente ya no se pueden vincular con él. Cada sello se bloquea solo durante el tiempo necesario: la retención más larga contratada en ese momento por algún cliente.
- **Datos personales tratados:** IP de origen, identificador seudónimo del usuario final (si se envía) y emails de los usuarios del panel. Se tratan conforme al RGPD (ver 3.11).

### 4.8. Integridad del registro de auditoría

Para que el registro sirva como prueba en una auditoría, Unburn garantiza tres cosas:

1. **Ningún registro se pierde aunque se caiga el gateway.** El registro de cada cambio de gasto se guarda **junto con ese cambio**, en una misma operación de Redis: el registro de inicio al reservar y el de cierre al liquidar. Después viaja por la cola SQS, con reintentos, hasta el servicio de auditoría, que lo guarda en PostgreSQL. Si el gateway se cae justo después de responder, el registro ya está a salvo. Cada registro tiene un identificador único, así que recibirlo dos veces no lo duplica. Las peticiones rechazadas también se registran, con su decisión y su motivo; las rechazadas por el camino barato (5.8), agrupadas en un resumen cada pocos segundos.
2. **Nadie puede modificar un registro sin que se note.** Los eventos de cada organización se guardan **encadenados**: cada grupo de eventos incluye la huella del grupo anterior, como los eslabones de una cadena. Si alguien modifica o borra un evento, la cadena se rompe.
3. **Ni siquiera quien controle la base de datos puede rehacer la cadena.** Quien pudiera escribir en PostgreSQL podría recalcular la cadena entera. Por eso, cada 5 minutos *(ejemplo)*, el servicio de auditoría genera un **sello**: un resumen de cómo estaban en ese momento **todas** las cadenas con eventos nuevos, calculado con un **árbol de Merkle** (ver glosario). El sello se firma con KMS y se guarda en S3 en modo cumplimiento, donde nadie puede modificarlo ni borrarlo. Es un único sello para todos los clientes, no uno por cliente, y aun así cada organización puede comprobar que su cadena está incluida **sin ver las de las demás**. El sello solo usa identificadores anónimos de cadena, sin datos personales (4.7).

Para verificar el registro de una organización, se recalcula su cadena y se comprueba que coincide con lo que dice el sello firmado.

**Lo que queda sin proteger.**
- Los eventos posteriores al último sello (como máximo, unos 5 minutos *(ejemplo)*) aún no están sellados. Si alguien con acceso a la base de datos los modificara en ese intervalo, la manipulación no se podría demostrar. La ventana se reduce acortando el intervalo entre sellos.
- Si falla el nodo principal de Redis, pueden perderse los registros de los últimos instantes que aún no habían salido hacia la cola, junto con los cambios de gasto de esos mismos instantes. El gasto se sigue contando como se explica en 4.9.
- Si se cae un contenedor del gateway, se pierde el resumen de rechazos baratos de sus últimos segundos. Solo son recuentos de peticiones rechazadas, sin gasto.

**Retención sin romper la cadena.** Al borrar eventos antiguos por la retención del plan, se borran tramos completos entre dos sellos, y la verificación empieza en el sello más antiguo que se conserva. Así el borrado previsto no se confunde con una manipulación.

### 4.9. Qué pasa si se pierden datos de Redis

Redis es rápido, pero vive en memoria. Por eso:

- Tiene una **réplica** en otra zona del centro de datos, que se actualiza con un pequeño retraso. Si falla el nodo principal, pueden perderse los cambios de los últimos instantes: gastos, reservas y registros de auditoría que aún no habían salido hacia la cola.
- **Aun así, el gasto que cobra el proveedor se sigue contando:**
  - si una petición en curso pierde su reserva, al terminar se **suma igualmente su coste real** y se escribe su registro de cierre;
  - si el registro de inicio de una petición llegó a PostgreSQL pero su cierre no llega nunca, el servicio de auditoría, pasado un tiempo mayor que la duración máxima de una petición, la cuenta como **gasto estimado** por el importe reservado. Si el cierre real llega después, sustituye a la estimación;
  - la única excepción es un fallo doble: se pierde el rastro de una petición si, a la vez, falla el nodo principal de Redis antes de que su registro de inicio salga hacia la cola **y** se cae el contenedor que la atendía. Es una de las causas de **sobrepaso acotado** (5.5).
- Si se pierden los contadores, se **reconstruyen** desde PostgreSQL, la fuente de verdad: los agregados de gasto dan los totales del día y del mes en la zona horaria de la organización, y los eventos de auditoría, lo ocurrido desde el último intervalo cerrado. Así la reconstrucción no depende del plazo de retención del registro de auditoría.
- Además, los contadores de Redis se **comparan periódicamente** con lo registrado en PostgreSQL y se corrigen si les falta algún gasto.
- Mientras se reconstruyen, se aplica la política ante fallos de cada clave (por defecto, bloquear; ver 5.11).

---

## 5. Arquitectura de aplicación

> **Regla de uso:** en las entregas se incluye todo, tanto [Fase 1 – MVP] como [Arquitectura objetivo]. Para implementar el MVP, solo [Fase 1 – MVP].

### 5.1. Vista general

```
        Aplicación y agentes del cliente
                     │   HTTPS + clave virtual + cabeceras de sesión y agente
                     ▼
┌──────────────────────────── UNBURN ─────────────────────────────┐
│  GATEWAY (proxy en Go). Pasos en orden:                         │
│    1. Autenticación y cuota del plan                            │
│    2. Identificación de sesión y agente                         │
│    3. Normalización                                             │
│    4. Sistema inmunológico                                      │
│    5. Escudo MCP (grafo de autorización)                        │
│    6. Detector de bucles                                        │
│    7. Motor de presupuestos (reserva)                           │
│    8. Conectores de proveedores ──────────────────────┐         │
│    9. Respuesta (comprobación de herramientas)        │         │
│   10. Liquidación                                     │         │
│                                                       │         │
│  SERVICIOS DE APOYO: auditoría · diagnóstico causal · │         │
│  alertas · facturación · panel web y API de admin     │         │
└───────────────────────────────────────────────────────┼─────────┘
                                                        ▼
                                          OpenAI  /  Anthropic
```

### 5.2. Componentes

| # | Componente | Qué hace | Fase |
|---|---|---|---|
| 1 | **Gateway (proxy)** | Recibe todas las peticiones de IA y las pasa por los pasos de control | MVP |
| 2 | **Autenticación y cuota** | Comprueba la clave virtual, el agente declarado y si queda cuota en el plan | MVP |
| 3 | **Normalizador** | Comprueba que las opciones de la petición están admitidas (5.3), identifica proveedor y modelo, ajusta el límite de respuesta y estima los tokens | MVP |
| 4 | **Sistema inmunológico** | Detecta consumo anómalo y responde de forma gradual (5.8) | MVP |
| 5 | **Escudo MCP** | Aplica el grafo de autorización a las herramientas de cada agente, tanto las que ejecuta el cliente como las que ejecuta el proveedor (5.7). El control de las herramientas del proveedor funciona en todos los planes | MVP (básico); el **proxy MCP completo** es Objetivo |
| 6 | **Detector de bucles** | Detecta repeticiones por sesión de agentes con reglas (5.6) | MVP (reglas); la **detección semántica** es Objetivo |
| 7 | **Motor de presupuestos** | Reserva y liquida el gasto, y convierte en gasto estimado las reservas que vencen (5.5) | MVP |
| 8 | **Conectores de proveedores** | Hablan con cada proveedor en su formato propio | MVP: OpenAI (*Chat Completions* y *Responses API*) y Anthropic (*Messages*). Objetivo: Google Gemini y cambio automático entre proveedores |
| 9 | **Servicio de auditoría** | Recoge los eventos de la cola, los guarda encadenados en PostgreSQL, mantiene los agregados de gasto y genera los sellos firmados (4.8) | MVP |
| 10 | **Servicio de diagnóstico causal** | Analiza los incidentes: causa raíz, coste del bucle, cota superior del coste atribuible y ahorro estimado (5.6) | MVP (grafo causal, causa raíz, coste del bucle, cota superior del coste atribuible, ahorro con hipótesis visible); Objetivo (efecto de cada intervención y ahorro contrafactual estimado con datos) |
| 11 | **Servicio de alertas** | Envía avisos por email, Slack, Microsoft Teams o webhook | MVP |
| 12 | **Servicio de facturación** | Cuenta las peticiones facturables, aplica el plan y se conecta con la pasarela de pagos | MVP |
| 13 | **Panel web y API de administración** | Interfaz para configurar todo y ver gastos e incidentes (5.10) | MVP |
| 14 | **Exportación de datos** | Descarga de auditoría y configuración (CSV o JSON) | MVP |
| 15 | **Caché semántica** | Reutiliza respuestas a preguntas equivalentes (5.8) | Objetivo |
| 16 | **Proxy MCP** | Se coloca delante de los servidores MCP para controlar cada llamada (5.7) | Objetivo |

### 5.3. Integración del cliente

**Opción A: cambiar la dirección base y la clave [Fase 1 – MVP].** Las librerías oficiales de OpenAI y Anthropic permiten indicar a qué dirección enviar las peticiones. El desarrollador cambia esa dirección por la de Unburn y pone la **clave virtual** en lugar de la clave real.

*Antes de Unburn (OpenAI, Python):*
```python
from openai import OpenAI

client = OpenAI(api_key="sk-...clave-real...")  # clave real repartida por el código
```

*Después de Unburn (OpenAI, Python):*
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.unburn.example/openai/v1",  # dirección de Unburn (ficticia)
    api_key="ub_live_agente_auditor_123",             # clave virtual (ficticia)
)

# Con la Responses API (la que OpenAI recomienda para proyectos nuevos)
respuesta = client.responses.create(
    model="nombre-del-modelo",
    input="Revisa esta propuesta de código",
    extra_headers={                       # cabeceras de Unburn (recomendadas)
        "X-Unburn-Session": "pedido-8812",
        "X-Unburn-Agent": "agente-auditor",
    },
)

# Con Chat Completions funciona igual: client.chat.completions.create(...)
```

*Después de Unburn (Anthropic, Python):*
```python
import anthropic

client = anthropic.Anthropic(
    base_url="https://api.unburn.example/anthropic",  # dirección de Unburn (ficticia)
    api_key="ub_live_agente_redactor_456",             # clave virtual (ficticia)
)
```

Unburn reconoce el proveedor por la ruta (`/openai/...` o `/anthropic/...`) y lee la clave virtual de la cabecera que usa cada librería: `Authorization` en OpenAI y `x-api-key` en Anthropic.

**Por qué la Responses API está en el MVP.** OpenAI la recomienda para todos los proyectos nuevos, aunque *Chat Completions* sigue soportada. Las funciones nuevas (herramientas integradas, MCP, gestión del estado de la conversación) solo llegan a Responses, y algunos modelos solo están disponibles ahí. Además, frameworks de agentes como el **OpenAI Agents SDK** la usan por defecto. Sin ella, Unburn no serviría para buena parte del mercado de agentes.

**Cabeceras propias de Unburn.** Son campos extra que viajan con cada petición. Sin la cabecera de sesión, Unburn funciona, pero **solo ve peticiones sueltas**: no puede saber qué peticiones forman una misma tarea. Y si varios agentes comparten una clave, sin la cabecera de agente no puede saber cuál hizo cada petición.

| Cabecera | ¿Obligatoria? | Para qué sirve | Si no se envía… |
|---|---|---|---|
| `X-Unburn-Session` | Recomendada | Agrupa las peticiones de una misma tarea | No hay detección de bucles por sesión ni diagnóstico causal |
| `X-Unburn-Agent` | Depende de la clave (ver "Identidad del agente") | Indica qué agente hace la petición | Ver "Identidad del agente" |
| `X-Unburn-Parent-Agent` | Opcional | Indica qué agente encargó la tarea (delegación) | El diagnóstico causal pierde precisión |
| `X-Unburn-End-User` | Opcional | Seudónimo del usuario final (por ejemplo, un código aleatorio) | El sistema inmunológico solo puede frenar por clave o por sesión, no por usuario |

**Identidad del agente.** Una cabecera la puede escribir cualquiera que tenga la clave virtual. Si los permisos dependieran solo de `X-Unburn-Agent`, un programa podría hacerse pasar por el agente con más permisos. Por eso la identidad depende de cómo esté configurada cada clave virtual:

| Configuración de la clave | Cómo se identifica al agente | ¿Cabecera `X-Unburn-Agent`? | Permisos |
|---|---|---|---|
| **Sin lista de agentes** (por ejemplo, claves por entorno como "Pruebas" o "Producción") | No hay identidad de agente: **la clave es la identidad** | Opcional. Si llega, solo se registra para el diagnóstico y **no da permisos** | Los de la clave |
| **Con un solo agente** (recomendado) | Por la clave, que es secreta | Opcional. Si llega, tiene que coincidir con ese agente (si no, **403**) | Los de ese agente |
| **Con varios agentes** | Por lo que **declara** la cabecera, entre los agentes permitidos de la clave | **Obligatoria**. Si falta o el agente no está en la lista, **403** | Los del agente declarado |

- **Recomendación: una clave virtual por agente.** Así el agente queda identificado por su clave, que es secreta, y no solo por lo que declara. Es la única forma de que los permisos por agente sean realmente fiables.
- Si varios agentes comparten una clave, Unburn **confía** en lo que declara la cabecera entre los agentes permitidos de esa clave. Esta suposición figura en las limitaciones (sección 10).
- Las herramientas que **no permiten añadir cabeceras** (por ejemplo, algunas configuraciones de n8n) deben usar claves sin lista de agentes o con un solo agente.
- **[Arquitectura objetivo]:** identidad de agente verificable con credenciales firmadas que emite el sistema de identidad del cliente (por ejemplo, tokens OAuth), en lugar de una cabecera declarada.

**Rotación de claves.** Si una clave virtual se filtra, el administrador la **rota** desde el panel: se revoca la clave antigua y se crea una nueva que **hereda** su configuración (agentes, presupuestos, permisos, políticas). Además, la **propiedad** de las conversaciones guardadas en el proveedor **pasa a la clave nueva**. Así, las referencias a respuestas anteriores (5.4, paso 3) siguen funcionando aunque la clave se rote varias veces, y la antigua deja de funcionar al instante. El cambio queda registrado en la auditoría.

**APIs y opciones que admite el MVP.** Las librerías de los proveedores pueden llamar a muchas más funciones que las de generar texto. El MVP solo deja pasar estas; el resto se rechaza con **403** y un mensaje que explica que no está admitido:

| Proveedor | Se admite | ¿Facturable? |
|---|---|---|
| OpenAI | Generar con *Chat Completions* | Sí |
| OpenAI | Generar con la *Responses API* (sin modo en segundo plano ni conversaciones guardadas; ver más abajo) | Sí |
| OpenAI | Consultar o borrar una respuesta de la *Responses API*, solo si pertenece a la **misma clave virtual** (ver "Rotación de claves") | No |
| OpenAI | Consultar la lista de modelos | No |
| Anthropic | Generar con *Messages* | Sí |
| Anthropic | Contar los tokens de un mensaje | No |
| Anthropic | Consultar la lista de modelos | No |

**No se admite en el MVP** *[Arquitectura objetivo: las más útiles se irán añadiendo; ver la hoja de ruta en 8.2]*:
- archivos subidos al proveedor y las peticiones que hacen referencia a ellos por su identificador, así como los documentos (por ejemplo, PDF) adjuntos directamente a la petición, porque Unburn no puede estimar con fiabilidad cuántos tokens tienen;
- el **modo en segundo plano** de la *Responses API*, en el que la respuesta se recoge más tarde con otra petición, así que no se puede liquidar en la original;
- las **conversaciones guardadas** de la *Responses API*;
- lotes (*batch*), *embeddings*, tiempo real (voz), generación de imágenes y audio, y ajuste fino de modelos.

Las **imágenes enlazadas por URL** sí se admiten. Como Unburn no las descarga, reserva para cada una el **máximo de tokens** que el proveedor puede cobrar por una imagen en ese modelo. Las imágenes incluidas directamente en la petición se cuentan normalmente.

**Opciones admitidas.** No basta con controlar qué API se usa. Dentro de cada petición hay **opciones** (por ejemplo, el nivel de servicio, o funciones experimentales que se activan con **cabeceras *beta***), y los proveedores añaden opciones nuevas cada pocos meses. Muchas cambian el precio. Si una opción desconocida pasara sin control, la reserva podría quedarse corta. Por eso:
- Unburn mantiene, para cada API, una **lista de opciones admitidas**, cada una asociada a su precio en la tabla de precios (4.2) o marcada como "no cambia el precio". Lo que no está en la lista se rechaza con **403** y un mensaje que nombra la opción no admitida.
- Una opción nueva solo se añade a la lista cuando su precio ya está en la tabla de precios. La contrapartida es que los clientes no podrán usarla a través de Unburn hasta entonces (ver sección 10).
- Las cabeceras que solo identifican la librería (versión, sistema operativo y similares) no cambian el precio y pasan sin tocarse.
- Las cabeceras que deciden **a qué cuenta o proyecto del proveedor** se carga la petición (en OpenAI, `OpenAI-Organization` y `OpenAI-Project`) las fija siempre Unburn, según la configuración de la clave de proveedor (4.2). Las que envíe el cliente se descartan, para que nadie pueda cargar su gasto a otro proyecto de la misma clave real.

**Cabeceras que Unburn añade a la respuesta:**

| Cabecera | Significado |
|---|---|
| `X-Unburn-Request-Id` | Identificador de la petición, para buscarla en la auditoría |
| `X-Unburn-Model-Substituted` | Aparece si Unburn cambió el modelo (indica cuál se pidió y cuál se usó) |
| `X-Unburn-Loop-Warning` | Aparece si se detectó un posible bucle en modo aviso |
| `X-Unburn-Cost-Estimated` | Aparece si el coste de la petición es una estimación (por ejemplo, porque se cortó la conexión) |

**Herramientas de automatización (n8n y similares) [Fase 1 – MVP].** Basta con configurar la credencial de OpenAI con la dirección base de Unburn y la clave virtual. Las cabeceras de Unburn solo se podrán enviar si la herramienta permite añadir cabeceras. Si no lo permite, Unburn funciona por petición, y conviene usar una clave por agente o una clave sin lista de agentes (ver "Identidad del agente").

**Opción B: dominio propio del cliente [Arquitectura objetivo].** Las grandes empresas pueden preferir usar una dirección suya, por ejemplo `ia.miempresa.example`. El cliente crea un **registro CNAME** en su DNS (un alias que dice "esta dirección en realidad es Unburn") y Unburn genera un **certificado TLS** para ese dominio, de modo que la conexión siga siendo segura. El tráfico sigue pasando por la nube de Unburn: es solo un cambio de nombre, no un despliegue privado.

### 5.4. Recorrido completo de una petición

Este apartado describe **qué** comprueba Unburn en cada paso y **en qué orden**. Cómo se programa cada comprobación se decide al implementar el MVP (ver 0.4).

**Paso 1. Entrada y autenticación.**
- La petición llega cifrada por HTTPS.
- Se aplica el **límite de volumen** de la clave virtual (5.8). Si se supera, responde **429**.
- Si el gateway recuerda que esa clave ya agotó su presupuesto o su cuota (**rechazo barato**, 5.8), responde **402** sin hacer nada más.
- Comprueba la clave virtual. Si no existe o está revocada, responde **401**.
- Comprueba que la API pedida está admitida (5.3). Si no lo está, responde **403**.
- Comprueba la cuota del plan. Si está agotada (plan Gratis) o se ha alcanzado el tope de excedente (plan Pro), responde **402**.

**Paso 2. Identificación.**
- Lee las cabeceras de sesión, agente y usuario final, y determina el agente según la configuración de la clave (ver "Identidad del agente" en 5.3). Si la cabecera de agente es obligatoria y falta, o el agente declarado no está permitido, responde **403**.
- Añade la llamada al **grafo de sesión**.

**Paso 3. Normalización.**
- Identifica el proveedor, la API (*Chat Completions*, *Responses* o *Messages*) y el modelo, comprueba que el modelo está entre los permitidos de la clave virtual y que todas las opciones de la petición están admitidas (5.3). Si algo no lo está, responde **403**. Fija también la cuenta o el proyecto del proveedor al que se carga la petición.
- **Límite de respuesta.** Si la petición no trae un tamaño máximo de respuesta, Unburn le añade uno; si trae uno mayor que el máximo configurado por el cliente, lo reduce. El valor por defecto debe ser generoso, porque en los modelos que razonan ese límite incluye los tokens de razonamiento, y uno demasiado bajo puede agotarse antes de que el modelo responda. Si la petición pide más razonamiento del que permite el máximo del cliente, Unburn responde **400** con una explicación, en lugar de reenviar una petición que el proveedor rechazaría.
- **Consumo real en streaming.** Unburn se asegura de que el proveedor informe del consumo real al final de la respuesta. Si para ello tiene que activar una opción que el cliente no pidió, no le reenvía esa información extra, para no romper su código.
- **Estimación de los tokens de entrada.** Se cuenta de forma aproximada el contenido de la petición y se añade un margen de seguridad. Si la entrada supera el máximo configurado por el cliente, responde **400**.
- **Conversaciones con historial guardado en el proveedor.** En la *Responses API*, el cliente puede enviar solo el mensaje nuevo y una referencia a la respuesta anterior; el historial lo guarda OpenAI, así que Unburn **no lo ve**. Para estimarlo usa su **cadena de respuestas** (4.2): como la respuesta anterior pasó por Unburn, sabe cuántos tokens acumulaba la conversación. Por eso Unburn **solo acepta referencias a respuestas que pertenecen a la misma clave virtual** (ver "Rotación de claves" en 5.3). Si la respuesta no pasó por Unburn o pertenece a otra clave, responde **403**. Además de permitir la estimación, esto impide que un equipo continúe (y lea) las conversaciones de otro, ya que todas las claves virtuales de una organización usan la misma clave real.
- **Herramientas que ejecuta el proveedor.** Detecta si la petición activa herramientas que el proveedor ejecuta en sus servidores: búsqueda web, ejecución de código o conectores MCP remotos. Se tratan en el paso 5.

**Paso 4. Sistema inmunológico.** Compara la velocidad de consumo con la línea base. Si hay anomalía, aplica la respuesta configurada: avisar, frenar con **429** o cambiar a un modelo económico. Va **antes** de la reserva, para que esta use el precio del modelo que realmente se va a usar.

**Paso 5. Escudo MCP.**
- **Herramientas del cliente** *(planes Pro y Enterprise)*: quita de la petición las que ese agente no tiene permitidas según el grafo de autorización. El modelo nunca llega a "ver" las prohibidas.
- **Herramientas del proveedor** *(todos los planes, porque el presupuesto depende de ello)*: están **denegadas por defecto**. Solo pasan las que el administrador ha autorizado para esa clave (plan Gratis) o para ese agente (Pro y Enterprise). Unburn limita además, cuando el proveedor lo permite, el **número de usos** de cada una y el **tamaño de sus resultados**, para poder acotar su coste en la reserva.
- Si la petición **obliga** al modelo a usar una herramienta que Unburn ha quitado, o a usar alguna cuando no queda ninguna permitida, Unburn responde **403** con una explicación, **sin** enviarla, porque el proveedor la rechazaría.

**Paso 6. Detector de bucles.** Aplica las reglas de bucle (5.6) al contenido nuevo de la llamada.
- En **modo aviso** (por defecto), marca la respuesta, crea un incidente y avisa.
- En **modo bloqueo**, responde **422** con un error que explica el motivo. Las librerías de OpenAI y Anthropic convierten los errores 4xx en excepciones, así que normalmente **la ejecución del agente se detiene**, que es justo el objetivo del bloqueo. El modelo solo "lee" el mensaje si el framework del agente captura la excepción y se la pasa.

**Paso 7. Reserva.** Calcula el **peor caso** de la petición con todas las dimensiones de precio que apliquen (ver 5.5) y lo aparta en **todos** los presupuestos afectados a la vez, junto con el registro de inicio de la auditoría (4.8). Si algún presupuesto superaría su límite duro, responde **402**. Si se cruza un límite blando, envía un aviso.

**Paso 8. Envío al proveedor.**
- Obtiene la clave real (de la memoria o descifrándola con KMS) y envía la petición.
- **Tiempos de espera amplios** *(ejemplos, configurables)*, porque un modelo que razona puede pasar varios minutos sin producir nada visible: hasta **15 minutos** para que empiece a llegar contenido, hasta **5 minutos** de silencio a mitad de la respuesta y **30 minutos** en total. Para tareas largas se recomienda usar streaming. La infraestructura se configura para no cortar estas peticiones (ver 6.4).
- **La reserva se mantiene viva** mientras la petición sigue en curso, así que nunca caduca a mitad de una petición larga.
- **Si la petición se cancela o el proveedor falla a medias,** Unburn **no libera** la reserva como si no hubiera pasado nada, porque el proveedor puede haber cobrado parte del trabajo. Liquida con una **estimación** (lo recibido hasta ese momento o, si no sabe nada, el importe reservado), la marca como estimada y responde **504** (tiempo agotado) o **502** (error del proveedor).
- **Reintentos automáticos:** las librerías reintentan solas los errores 5xx, lo que puede repetir una petición cara. Cada reintento pasa de nuevo por la reserva, así que el presupuesto sigue protegido. Aun así, se recomienda a los clientes reducir los reintentos automáticos en las peticiones largas.

**Paso 9. Respuesta y comprobación de herramientas.**
- La respuesta se reenvía al cliente **trozo a trozo** según llega (streaming).
- **Herramientas del cliente.** Si el modelo pide usar una, Unburn **retiene esa parte** hasta tenerla completa y la comprueba contra el grafo de autorización. Si no está permitida (por ejemplo, porque el modelo fue engañado por una inyección de instrucciones), la bloquea: sin streaming responde **403**; con streaming corta la respuesta y envía un evento de error que indica la herramienta denegada. Esta retención añade un pequeño retraso, **solo** en las respuestas que piden herramientas.
- **Herramientas del proveedor.** Cuando aparecen en la respuesta, **ya se han ejecutado** en los servidores del proveedor, así que aquí solo se registran en la auditoría y en el grafo de sesión. Su control se hace antes, en el paso 5.

**Paso 10. Liquidación.**
- Cuando termina la respuesta, el proveedor informa del consumo real (tokens de cada tipo y usos de herramientas). Unburn calcula el coste real, lo suma al gasto, **libera el resto de la reserva** y escribe el registro de cierre de la auditoría.
- Si el cliente cortó la conexión a medias, Unburn cancela la petición al proveedor y liquida con una estimación, con la misma regla del paso 8.
- Actualiza la **cadena de respuestas** con los tokens acumulados de la conversación.
- Los casos especiales (el gateway se cae, la reserva se ha perdido o la liquidación llega tarde) se explican en 5.5.

**Paso 11. Después de responder (sin hacer esperar al cliente).**
- Los registros de auditoría viajan por la cola hasta PostgreSQL y se actualizan los agregados de gasto (4.8).
- Se actualizan el grafo de sesión y las líneas base de consumo.
- Si hay un incidente, el servicio de diagnóstico causal lo analiza y se envían las alertas.

### 5.5. Motor de presupuestos (reservar y liquidar) [Fase 1 – MVP]

**El problema:** el coste de una petición no se conoce hasta que el modelo termina de responder. Si Unburn esperara al final para comprobar el presupuesto, varias peticiones simultáneas podrían pasarse todas a la vez del límite.

**La solución, reservar y liquidar:** igual que un hotel bloquea un importe en la tarjeta al hacer el check-in y cobra lo real al salir.

**Ejemplo numérico** (precios inventados *(ejemplo)*: 2 € por millón de tokens de entrada y 8 € por millón de tokens de salida; sin caché, sin herramientas del proveedor y con una sola respuesta):

| Momento | Cálculo | Importe |
|---|---|---|
| **Reserva** | 2.000 tokens de entrada × 2 €/M + 4.000 tokens de salida máximos × 8 €/M = 0,004 + 0,032 | **0,036 €** |
| **Coste real** | 2.000 de entrada × 2 €/M + 500 de salida reales × 8 €/M = 0,004 + 0,004 | **0,008 €** |
| **Se devuelve** | 0,036 − 0,008 | **0,028 €** |

**Qué incluye el peor caso.** Para que la reserva sea de verdad el peor caso (salvo con herramientas del proveedor, ver el último punto), suma **todas** las dimensiones de precio que apliquen (tabla de precios, 4.2):
- los tokens de entrada estimados, incluida la escritura en caché si la petición la pide (en Anthropic es más cara que la entrada normal);
- el tamaño máximo de respuesta, multiplicado por el número de respuestas si la petición pide varias a la vez;
- los recargos por contexto largo o por un nivel de servicio más caro;
- las **herramientas del proveedor**: por cada uso permitido, su tarifa **y la entrada adicional que provoca**. Sus resultados (páginas encontradas, salida del código, respuesta de un conector MCP) se cobran como **tokens de entrada**, y si el modelo hace varias vueltas internas dentro de la misma respuesta, según cómo cobre cada proveedor puede volver a cobrarse en cada vuelta la petición original además de los resultados. Ese extra depende del tamaño de cada petición y de cada resultado, así que **con herramientas del proveedor la reserva es siempre una estimación con margen**, no un peor caso garantizado: se calcula con el tamaño de la petición y los usos permitidos, se revisa con lo observado, y cualquier exceso sobre la reserva queda registrado.

**Reglas:**
- **Jerarquía [Fase 1 – MVP]:** organización → clave virtual. Una petición debe caber en **todos** sus niveles. Si se agota el presupuesto de la organización, se bloquean todas sus claves. *[Arquitectura objetivo]: un nivel intermedio de "proyecto" entre organización y clave virtual.*
- **Periodos:** diario y mensual, según la zona horaria de la organización.
- **Límites:** blando (avisa) y duro (corta).
- **Todo o nada:** la comprobación y la reserva en todos los niveles se hacen como una **operación atómica**: o se reserva en todos a la vez o en ninguno, y ninguna otra petición puede colarse en medio. Así, dos peticiones simultáneas nunca pueden gastar el mismo dinero.

**Para que ningún gasto quede sin contar:**
- **La reserva no caduca mientras la petición sigue viva:** se renueva mientras dura.
- **Si se cae el contenedor que atendía la petición,** la reserva deja de renovarse y vence a los pocos minutos *(ejemplo: 3 minutos)*. Unburn revisa periódicamente las reservas vencidas y convierte cada una en **gasto estimado** por el importe reservado, con su registro de cierre. Es preferible contar de más que dejar de contar algo que el proveedor sí cobró.
- **Si la liquidación real llega tarde** (por ejemplo, tras un corte de red), **sustituye** al gasto estimado en lugar de sumarse a él: cada reserva tiene un identificador único, así que nada se cuenta dos veces.
- **Si la reserva se ha perdido** por un fallo de Redis, la liquidación suma igualmente el coste real y escribe el registro de cierre (4.9).
- **Los contadores se comparan periódicamente con PostgreSQL**, la fuente de verdad, y se corrigen si les falta algún gasto.

**Consecuencia a tener en cuenta:** la reserva es **pesimista** (aparta el peor caso). Si al presupuesto le quedan 0,05 € y llegan dos peticiones como la del ejemplo, la primera pasa (reserva 0,036 €) y la segunda se rechaza, aunque la primera acabe gastando solo 0,008 €. El cliente puede reducir este efecto bajando el límite máximo de respuesta.

**Sobrepaso acotado.** La reserva atómica garantiza que **las peticiones simultáneas nunca provocan un sobrepaso**. Pero el presupuesto sí puede superarse ligeramente por otras vías. Unburn no promete "sobrepaso cero", sino **sobrepaso acotado y registrado**:

| Causa del sobrepaso | Cómo se limita |
|---|---|
| La estimación de los tokens de entrada se queda corta | Margen de seguridad en la estimación. Al liquidar se usa siempre la cifra real del proveedor. |
| Una petición con herramientas del proveedor cuesta más de lo estimado (resultados más grandes o más vueltas internas de lo previsto; sobre todo en los conectores MCP, cuyo tamaño el proveedor no limita) | Las herramientas del proveedor están denegadas por defecto, y el administrador que autoriza una sabe que su coste solo se puede estimar. Se limitan sus usos y el tamaño de sus resultados cuando el proveedor lo permite, y la estimación se revisa con lo observado (5.4, paso 5). |
| Falla el nodo principal de Redis y se pierden reservas o gastos de los últimos instantes | Ventana de pérdida muy corta, liquidación aunque falte la reserva y reconstrucción desde PostgreSQL (4.9) |
| El cliente eligió el modo *fail-open* (5.11) | Es una elección explícita del cliente. Lo que pasa durante el fallo se registra después. |
| Peticiones canceladas o fallidas que el proveedor cobra igualmente | Se liquidan con una estimación en lugar de liberar la reserva (5.4, paso 8) |

**Precios:**
- Unburn mantiene una **tabla de precios** de cada modelo con **todas** sus dimensiones de precio (ver 4.2) y la actualiza cuando los proveedores cambian sus tarifas. Si falta una dimensión, el "peor caso" deja de ser el peor caso.
- El coste calculado es una **estimación muy cercana** a lo que cobrará el proveedor, pero no una cifra oficial: pueden influir descuentos, redondeos o cortes de conexión.
- *[Arquitectura objetivo]: conciliación periódica con los informes de uso de cada proveedor.*

### 5.6. Detector de bucles y diagnóstico causal

**Requisito:** el cliente debe enviar la cabecera de sesión, y Unburn tiene que poder distinguir a los agentes, ya sea por su clave virtual o por la cabecera de agente (ver 5.3).

**Por qué no se compara el texto completo de cada llamada.** En una conversación, cada petición reenvía todo el historial anterior. Dos peticiones seguidas siempre se parecen casi al 100%, aunque la conversación avance con normalidad. Compararlas así daría falsas alarmas constantes. Por eso Unburn compara **solo el contenido nuevo** de cada llamada: el último mensaje, la herramienta pedida y sus argumentos, y el resultado de la herramienta.

**Detección por reglas [Fase 1 – MVP].** Son reglas exactas, rápidas y fáciles de explicar *(números de ejemplo, configurables)*:

| Regla | Qué detecta | Ejemplo |
|---|---|---|
| **R1. Reintento idéntico** | El mismo agente pide la misma herramienta con los mismos argumentos y recibe el mismo resultado 3 veces seguidas | El agente llama a `ejecutar_tests` con lo mismo y recibe el mismo fallo una y otra vez |
| **R2. Ping-pong entre agentes** | Dos agentes intercambian el mismo contenido nuevo durante 3 vueltas seguidas. Una **vuelta** es un mensaje de A a B y la respuesta de B a A, es decir, dos llamadas | El programador envía la misma propuesta y el auditor la rechaza siempre igual |
| **R3. Límites de sesión** | La sesión supera un número máximo de llamadas, de euros o de duración | Más de 200 llamadas, más de 20 € o más de 2 horas en una sola tarea |

**Respuesta:**
- **Modo aviso** (por defecto): se crea un incidente, se envía una alerta y se marca la respuesta con `X-Unburn-Loop-Warning`. El bucle **no se detiene**.
- **Modo bloqueo** (configurable por clave): la llamada que completa el patrón se rechaza con el error **422**, que explica el motivo. Normalmente el framework del agente convierte ese error en una excepción y **detiene la ejecución**. Solo si el framework captura la excepción y se la pasa al modelo, este "lee" el mensaje (ver 5.4, paso 6).

El modo aviso es el predeterminado porque ninguna detección es perfecta, y bloquear por error un trabajo legítimo sería peor que avisar.

**Diagnóstico causal [Fase 1 – MVP].** Cuando salta un incidente, el servicio de diagnóstico trabaja sobre el **grafo de sesión**, que es un **grafo causal** de la tarea. Sus flechas no se adivinan, se **observan** en el tráfico:
- "esta llamada **usó el resultado** de aquella": la petición incluye el resultado de una herramienta que pidió una respuesta anterior (los identificadores de llamada a herramienta lo indican), o continúa una respuesta anterior (cadena de respuestas o historial);
- "este agente **encargó la tarea** a aquel" (cabecera `X-Unburn-Parent-Agent`).

Con ese grafo calcula tres cosas:

1. **Causa raíz:** recorre el grafo hacia atrás desde el bucle hasta el primer paso cuyo resultado se repite y alimenta el ciclo.
2. **Coste del bucle (medido):** la suma del coste de las llamadas repetidas que llegaron al proveedor. **No es una estimación**: es lo que se gastó en el bucle.
3. **Cota superior del coste atribuible (un contrafactual sencillo):** la suma del coste de **todas** las llamadas que dependen de la causa raíz, es decir, de todas las que hay "aguas abajo" en el grafo. Intenta responder a *"¿qué gasto no se habría producido si ese paso no hubiera ocurrido?"*, pero con una **hipótesis fuerte**: que sin ese paso el agente no habría hecho nada más. En realidad habría seguido por otro camino, que también cuesta. Por eso es una **cota superior** (el valor real es igual o menor) y se muestra siempre con su hipótesis. Si la causa raíz está al principio de la sesión, casi todo el trabajo, también el legítimo, queda "aguas abajo", y la cota pierde utilidad. En ese caso el dato fiable es el coste del bucle.

Ejemplo de diagnóstico *(ejemplo)*:

> **Sesión `pedido-8812`.** Bucle detectado (regla R2). Modo bloqueo: la llamada 20, que completaba la tercera vuelta, se rechazó y el agente se detuvo.
> **Causa raíz:** llamada 14. La herramienta `ejecutar_tests` devolvió un resultado que recibió el *agente-auditor*. Desde ahí, el *agente-programador* y el *agente-auditor* repitieron el mismo intercambio (mismas huellas) en las llamadas 15 a 20.
> **Coste del bucle:** 1,30 € (las 5 llamadas repetidas que llegaron al proveedor, de la 15 a la 19, en unos 3 minutos).
> **Cota superior del coste atribuible:** 1,30 €. Aquí coincide con el coste del bucle porque nada más dependía de la llamada 14; en otras sesiones puede ser mucho mayor.
> **Ahorro estimado:** entre 18 y 30 €, **suponiendo** que el bucle habría seguido una hora más a un ritmo de entre 0,30 y 0,50 € por minuto.

Como Unburn no guarda el texto, el diagnóstico se basa en la **estructura** (quién usó el resultado de quién, qué herramienta, si el resultado se repite), no en lo que decían los mensajes.

**Ahorro estimado [Fase 1 – MVP]. Reglas:**
- Solo se atribuye ahorro cuando Unburn **detiene o frena** algo: bloqueo de un bucle, corte por presupuesto o freno del sistema inmunológico. **En modo aviso no hay ahorro**, porque Unburn no detiene nada. Se muestran el **coste hasta ahora** y el **coste previsto si continúa**.
- Cálculo: ritmo de gasto del bucle × un **horizonte de proyección** (por defecto, 1 hora *(ejemplo)*, configurable). Se muestra como un rango, según lo que varíe el ritmo, y **siempre con la hipótesis visible**.
- El horizonte **no** se basa en los límites del propio Unburn (como la regla R3), porque sin Unburn esos límites no existirían.

**[Arquitectura objetivo]:**
- **Detección semántica:** compara el **significado** del contenido nuevo (usando *embeddings*, ver glosario) para detectar bucles en los que el agente repite lo mismo con otras palabras.
- **Modo "aviso al agente":** una intervención más suave. Unburn añade una nota a las instrucciones de la siguiente petición (por ejemplo, "estás repitiendo la misma acción con el mismo resultado; cambia de estrategia") en lugar de devolver un error.
- **Efecto de cada intervención:** medir qué pasa después de cada tipo de respuesta (alerta al administrador, aviso al agente, cambio de modelo, bloqueo) para saber cuál detiene mejor los bucles con menos daño. Los datos que se recogen de forma natural **no bastan** para medirlo bien:
  - la alerta del modo aviso **ya es una intervención**, porque el administrador puede parar el bucle al recibirla;
  - la regla R3 corta las sesiones largas, así que muchos bucles no se observan hasta el final;
  - los clientes que eligen cada modo no son una muestra al azar: quien elige el modo aviso puede tener agentes distintos de quien elige el bloqueo.

  Por eso la medición seria exige **asignar las intervenciones al azar** entre los clientes que lo acepten (como en un ensayo clínico) y usar métodos estadísticos que tengan en cuenta los cortes de la regla R3.
- **Ahorro contrafactual con modelo causal:** sustituye el horizonte fijo de 1 hora por una estimación basada en esos datos: cuánto habría durado y costado el bucle sin la intervención, con su margen de error.

La explicación de por qué esto es IA causal, y qué parte lo es en el MVP, está en 7.4.

### 5.7. Escudo MCP y grafo de autorización

**Disponibilidad por plan.** El control de las **herramientas que ejecuta el proveedor** funciona en **todos los planes**, porque el presupuesto depende de él (5.5). El resto del escudo (filtrado de las herramientas del cliente, grafo de autorización por agente y análisis de caminos indirectos) está en los planes **Pro y Enterprise**.

**Dos tipos de herramientas.** Unburn tiene que distinguir quién ejecuta cada herramienta:

| Tipo | Quién la ejecuta | Ejemplos | Qué ve Unburn |
|---|---|---|---|
| **Herramienta del cliente** | El programa del agente | Funciones propias, herramientas MCP que el programa del agente traduce a "funciones" | La lista de herramientas en la petición y la decisión del modelo de usar una en la respuesta. **No** ve la ejecución: el programa habla con el servidor MCP directamente. |
| **Herramienta del proveedor** | OpenAI o Anthropic, en sus servidores, dentro de la misma respuesta | Búsqueda web, ejecución de código, conectores MCP remotos (`mcp_servers` en Anthropic, herramientas MCP en la *Responses API*) | La petición que las activa y, después, el registro de lo que se ejecutó. **No** puede pararlas a mitad, porque se ejecutan fuera de Unburn. |

```
HERRAMIENTAS DEL CLIENTE
  Programa del agente ──(petición con lista de herramientas)──► UNBURN ──► Modelo de IA
          ▲                                                        │
          │◄──────(respuesta: "quiero usar la herramienta X")──────┘
          │
          └──(ejecuta la herramienta X)──► Servidor MCP ──► Base de datos
                     ▲
                     └── este tramo NO pasa por Unburn en el MVP

HERRAMIENTAS DEL PROVEEDOR
  Programa del agente ──(petición)──► UNBURN ──► Proveedor de IA ──(ejecuta)──► Servidor MCP remoto / web
                                        ▲
                                        └── el control se hace AQUÍ, antes de enviar
```

**Descubrimiento y modos [Fase 1 – MVP].**
1. **Modo aprendizaje** (primeros días *(ejemplo)*): Unburn **no bloquea las herramientas del cliente**. Registra qué herramientas usa cada agente y las muestra en el panel. Las herramientas del proveedor, en cambio, siguen **denegadas** salvo que el administrador las autorice, porque se ejecutan en cuanto llega la petición y no se pueden parar después.
2. El administrador asigna a cada herramienta una **categoría de datos** (por ejemplo, `buscar_factura` → "Datos de facturación") y define qué puede usar cada agente.
3. **Modo protección:** lo que no está permitido se **deniega**. Si aparece una herramienta nueva, se bloquea y se avisa al administrador, que puede aprobarla con un clic. Es el principio de **confianza cero** (*zero trust*): nada está permitido hasta que se autoriza.

**El grafo de autorización [Fase 1 – MVP].** Los permisos se representan como un **grafo**: puntos (nodos) unidos por flechas (aristas). Es una de las dos partes del **grafo de contexto** de Unburn (ver 7.5).
- **Nodos:** agentes, herramientas (del cliente y del proveedor) y categorías de datos.
- **Aristas:** "puede usar" (agente → herramienta), "accede a" (herramienta → datos) y "puede delegar en" (agente → agente).

Ejemplo *(ejemplo)*:
```
Agente Soporte ──puede usar──► buscar_manual ──accede a──► [Manuales]
Agente Soporte ──puede usar──► ver_ticket    ──accede a──► [Tickets]
Agente Soporte ──puede delegar en──► Agente Facturación
Agente Facturación ──puede usar──► ver_factura ──accede a──► [Datos de facturación]
```

**Por qué un grafo y no una simple lista: los caminos indirectos.** El administrador puede fijar reglas como *"el Agente Soporte nunca debe llegar a [Datos de facturación]"*. Con una lista de permisos, esa regla parece cumplirse, porque el Agente Soporte no tiene `ver_factura`. Pero el grafo revela un **camino indirecto**: Soporte → delega en Facturación → `ver_factura` → [Datos de facturación]. Un atacante que engañe al Agente Soporte podría pedirle que "le pase la tarea" al de Facturación. Unburn analiza el grafo **cada vez que cambia la configuración** y avisa en el panel de estos caminos indirectos, para que el administrador decida si los corta. Es un control **preventivo**: encuentra el riesgo antes de que nadie lo aproveche.

**Comprobación en tiempo real.** Cada vez que cambia la configuración, el grafo se convierte en una tabla de permisos (agente + herramienta → sí o no) que se consulta en cada petición. Comprobar un permiso es inmediato, sea cual sea el tamaño del grafo. No hace falta preguntar a otro modelo de IA si la acción "parece segura", algo que sería más lento, más caro y menos fiable.

**Dónde actúa** (pasos de 5.4):
1. **En la petición (paso 5):**
   - quita las herramientas del cliente no permitidas;
   - deja pasar solo las herramientas del proveedor autorizadas y, cuando el proveedor lo permite, limita sus usos y el tamaño de sus resultados;
   - rechaza las peticiones que obligan a usar una herramienta no permitida.
2. **En la respuesta (paso 9):** si el modelo pide una herramienta del cliente no permitida, la bloquea.

**Qué protege y qué no (MVP):**
- **Protege** frente a la amenaza principal de la inyección de instrucciones: que el **modelo** sea engañado para usar herramientas que no debe, tanto del cliente como del proveedor.
- **No protege** frente a que el **propio programa del agente** llame al servidor MCP por su cuenta (por un error de programación o porque alguien lo haya modificado), porque ese tráfico no pasa por Unburn.
- **No controla los argumentos** de las herramientas permitidas. Por ejemplo, no impide que `buscar_cliente` se pida con un filtro que devuelva todos los clientes.
- **No ve los datos** que devuelve la herramienta antes de que salgan de la base de datos.
- **Herramientas del proveedor autorizadas:** una vez autorizadas, Unburn no puede controlar qué hacen dentro de esa respuesta (con qué argumentos se llaman ni qué devuelven), porque todo ocurre en los servidores del proveedor.
- **La identidad del agente** depende de cómo se asignen las claves (ver 5.3).

**Proxy MCP completo [Arquitectura objetivo].** Unburn se coloca **también delante de los servidores MCP remotos**, de modo que cada ejecución de herramienta pasa por él. Esto permite:
- Controlar las llamadas aunque el programa del agente intente saltarse el modelo, siempre que los servidores MCP **solo sean accesibles a través de Unburn**.
- Aplicar **reglas sobre los argumentos** (por ejemplo, "máximo 50 resultados por consulta").
- Limitar el **volumen de datos** que devuelve cada herramienta.

Requisitos y límites del proxy MCP:
- **Lectura del contenido.** En la versión actual de la especificación MCP (2026-07-28), cada mensaje lleva cabeceras HTTP que indican la operación y la herramienta. Eso permite aplicar reglas **por nombre de herramienta** sin abrir el mensaje. Las reglas sobre **argumentos** y **volumen de datos** sí exigen leer el contenido de la petición y de la respuesta.
- **Autorización.** La especificación alinea la autorización con OAuth 2.0 y OpenID Connect. Los permisos (*tokens*) que recibe un agente están ligados a un servidor MCP concreto, y la especificación **prohíbe reenviarlos tal cual** a otro servidor. Por eso el proxy no puede limitarse a pasar los tokens del agente: tiene que **autenticar él mismo a los agentes** y **obtener sus propias credenciales** ante cada servidor MCP.
- **Solo servidores remotos** (transporte *Streamable HTTP*). Los servidores **locales**, que se ejecutan en el mismo ordenador que el agente (transporte *stdio*), no pasan por la red y ningún proxy puede interceptarlos.

### 5.8. Sistema inmunológico digital [Fase 1 – MVP]

Funciona como el sistema inmunitario del cuerpo: **detecta** algo anómalo, **responde** de forma proporcional (sin "matar" todo el organismo) y **recuerda** el incidente para reaccionar mejor la próxima vez. Esta sección describe cómo protege el **tráfico de IA del cliente**. El mismo concepto se aplica a la **propia plataforma de Unburn** (ver 6.10 y 7.6).

**1. Detectar.**
- Mide la **velocidad de consumo** (euros por minuto y tokens por minuto) por clave virtual, por sesión y por usuario final (si se envía su seudónimo).
- La compara con la **línea base** de los últimos 7 días *(ejemplo)*. Las claves nuevas, sin historial, usan valores por defecto del plan.
- Hay anomalía si el consumo supera la línea base en más de 3 veces su variabilidad habitual durante 2 minutos seguidos *(ejemplo)*.

**2. Responder de forma gradual** (configurable), siempre **sobre la parte afectada** (un usuario final, una sesión o una clave), nunca sobre todo el cliente:

| Nivel | Respuesta | Plan |
|---|---|---|
| 1 | Alerta al administrador | Todos |
| 2 | Límite de velocidad: se frenan las peticiones de esa parte con **429** y se indica cuánto esperar | Todos |
| 3 | Cambio a modelo económico, **solo si el cliente lo ha configurado** (qué modelo sustituye a cuál), y siempre indicado en la cabecera `X-Unburn-Model-Substituted` | Pro y Enterprise |
| 4 | Bloqueo temporal de esa parte | Pro y Enterprise |

**3. Recordar.** Tras un incidente, se aplican límites más estrictos a esa parte durante 24 horas *(ejemplo)*. *(Pro y Enterprise.)*

**Barreras preventivas:**
- Límite de tamaño de respuesta ajustado (ver 5.4, paso 3).
- Rechazo de peticiones con una entrada mayor que el máximo configurado (**400**).
- **Rechazo barato:** cuando una clave (o su organización) ya ha **gastado** todo su presupuesto, o la cuota del plan está agotada, cada instancia del gateway lo **recuerda** durante unos segundos *(ejemplo: 5 segundos)* y rechaza las peticiones siguientes con **402** directamente, sin hacer más trabajo. Solo cuenta lo ya gastado, no las reservas en curso, que se liberan en segundos: así no rechaza peticiones que sí cabían. Una avalancha de peticiones inútiles apenas consume recursos de Unburn, y el 402 no se reintenta solo. Estos rechazos se registran en la auditoría agrupados, como un resumen cada pocos segundos (4.8). Como el recuerdo dura poco, si el administrador sube el presupuesto, el servicio se reanuda casi al instante.
- **Límites de volumen en la entrada:** antes de cualquier otro trabajo, el gateway limita el número de peticiones por segundo de cada clave virtual, y el WAF limita el de cada dirección IP (6.7). Son límites altos, pensados para avalanchas, y responden con **429** (exceso de velocidad).

**Nota importante:** la IP que ve Unburn suele ser la del **servidor del cliente**, no la del atacante. Para frenar a un usuario final concreto, el cliente debe enviar la cabecera `X-Unburn-End-User`.

**Caché semántica [Arquitectura objetivo].** Opcional y **desactivada por defecto**. Si el cliente la activa, Unburn guarda respuestas y, si llega una pregunta con el mismo significado, devuelve la respuesta guardada sin llamar al proveedor. Ahorra dinero ante consultas repetidas (incluidas las de ataques automatizados), pero tiene tres condiciones:
- **Guarda contenido.** Por eso es opcional y caduca pronto.
- **Se aísla por clave virtual,** para no devolver la respuesta de un usuario a otro.
- **Se consulta después** del escudo MCP y del detector de bucles, para no saltarse los controles.

No sirve para peticiones con herramientas ni para respuestas personalizadas.

### 5.9. Errores que devuelve Unburn

Las librerías oficiales de OpenAI y Anthropic **reintentan automáticamente** ciertos errores (como 429 y los 5xx). Por eso cada situación usa un código concreto: los problemas temporales usan códigos que se reintentan, y los que no se arreglan reintentando usan códigos que no.

| Código | Cuándo | ¿La librería lo reintenta sola? |
|---|---|---|
| **400** | La petición no cumple los límites que ha configurado el cliente: su entrada supera el máximo, o el máximo de respuesta no deja sitio al razonamiento que pide | No |
| **401** | Clave virtual inválida o revocada | No |
| **402** | Presupuesto agotado, cuota del plan agotada o tope de excedente alcanzado | No (a propósito: reintentar no lo arregla) |
| **403** | API u opción no admitida (5.3); modelo no permitido para esa clave; referencia a una respuesta de otra clave o creada fuera de Unburn; agente no permitido para esa clave o cabecera de agente obligatoria ausente; petición que obliga a usar una herramienta no permitida; o el modelo pidió una herramienta no permitida (sin streaming) | No |
| **422** | Bucle detectado en modo bloqueo | No |
| **429** | Frenado por el sistema inmunológico o por los límites de volumen de la entrada (WAF por dirección IP y gateway por clave virtual). Indica **exceso de velocidad**, nunca falta de presupuesto | Sí, tras esperar |
| **502** | El proveedor devolvió un error o no está disponible | Sí |
| **503** | Unburn no puede comprobar presupuestos o permisos por un fallo interno (en modo bloqueo) | Sí |
| **504** | El proveedor tardó demasiado | Sí |

Los errores que genera el propio proveedor (por ejemplo, una petición mal formada) se reenvían al cliente tal cual.

### 5.10. Panel web y API de administración [Fase 1 – MVP]

**Secciones del panel:**
- **Inicio:** gasto del día y del mes, coste de los incidentes, ahorro estimado (solo de lo que Unburn detuvo, como rango y con su hipótesis) e incidentes recientes.
- **Claves virtuales:** crear, revocar, rotar (5.3), asignar agentes permitidos, presupuestos y políticas.
- **Presupuestos y alertas.**
- **Sesiones e incidentes:** con el grafo de sesión y el diagnóstico causal de cada uno.
- **Grafo de contexto:** vista visual del grafo de autorización (agentes, herramientas y datos, con avisos de caminos indirectos) y de las decisiones de Unburn en cada sesión.
- **Auditoría:** búsqueda, verificación de integridad y exportación.
- **Facturación:** plan, consumo de peticiones y facturas.
- **Ajustes:** política ante fallos y usuarios del panel.

**Roles:** administrador (puede cambiarlo todo) y lector (solo consulta).

**API de administración:** permite hacer lo mismo que el panel desde código, para automatizar la configuración.

### 5.11. Comportamiento ante fallos [Fase 1 – MVP]

- **Si el proveedor falla o tarda demasiado:** se cancela la petición, se liquida con una estimación (ver 5.4, paso 8) y se responde 502 o 504.
- **Si falla un componente interno** (por ejemplo, Redis no responde): cada clave virtual tiene una **política ante fallos**:
  - **Bloquear** (*fail-closed*), **la opción por defecto**: si Unburn no puede garantizar que la petición está dentro del presupuesto y es segura, la rechaza (503). Protege el dinero y los datos, pero **la IA del cliente deja de funcionar** mientras dure el fallo.
  - **Dejar pasar** (*fail-open*), opcional: la petición pasa sin controles y se registra en cuanto el sistema se recupera. Mantiene el servicio, pero sin protección durante el fallo, y es una de las causas posibles de sobrepaso del presupuesto (5.5).
- **[Arquitectura objetivo]: cambio automático de proveedor.** Si OpenAI falla, la petición se envía a Anthropic, o al revés. Exige **traducir** entre formatos, porque cada proveedor organiza los mensajes, las herramientas y el streaming de forma distinta.

---

## 6. Arquitectura tecnológica

> **Regla de uso:** en las entregas se incluye todo, tanto [Fase 1 – MVP] como [Arquitectura objetivo]. Para implementar el MVP, solo [Fase 1 – MVP].

### 6.1. Vista general [Fase 1 – MVP]

```
Internet (aplicaciones de los clientes)
   │  HTTPS
   ▼
AWS WAF (filtro de ataques básicos) ──► Application Load Balancer (reparte el tráfico)
                                              │
                ┌─────────────────────────────┴─────────────────────────────┐
                ▼                                                           ▼
     Zona de disponibilidad A                                 Zona de disponibilidad B
     Contenedores del gateway (Go)                            Contenedores del gateway (Go)
     en Amazon ECS + Fargate                                  en Amazon ECS + Fargate
                │                                                           │
                └──────────────┬──────────────────────────────┬─────────────┘
                               ▼                              ▼
              ElastiCache (Valkey/Redis)            AWS KMS (llaves de cifrado y firma)
              con réplica en la otra zona
                               │
                  Tareas de fondo (Go): envío de registros de auditoría
                  a la cola y revisión de reservas vencidas
                               │
        Amazon SQS ──► Servicios de apoyo (Go): auditoría, diagnóstico,
                       alertas, facturación ──► Amazon RDS PostgreSQL (con réplica)
                                     │
                                     └──► Amazon S3 con bloqueo (sellos de auditoría)

           Panel web (React) ──► API de administración

Salidas externas: OpenAI · Anthropic · Stripe (pagos) · Amazon SES (email)
                  · Slack / Microsoft Teams (webhooks)
Observabilidad: recolector OpenTelemetry ──► Prometheus gestionado (métricas), X-Ray (trazas),
                CloudWatch Logs (registros) ──► Amazon Managed Grafana (paneles y alertas)
Todo dentro de una red privada (VPC) en AWS, región Europa (Irlanda).
```

### 6.2. Proveedor de nube y región

- **Proveedor:** **Amazon Web Services (AWS)**.
- **Región: Europa (Irlanda).** Hay dos motivos:
  - **Mantener los datos en la UE.**
  - **Facilitar la arquitectura objetivo.** AWS ofrece máquinas virtuales confidenciales (AMD SEV-SNP) en **servidores compartidos** solo en dos regiones: EE. UU. Este (Ohio) y Europa (Irlanda). Desde julio de 2026 también las ofrece en cualquier región comercial con instancias AMD, pero solo en **servidores dedicados** (*Dedicated Hosts*), que son bastante más caros. Irlanda permite empezar con la opción más económica (ver 6.11).
- **Zonas de disponibilidad:** el MVP usa **dos zonas** de la misma región (centros de datos separados físicamente), para que un fallo en uno no tumbe el servicio.
- **[Arquitectura objetivo]: segunda región de la UE** (por ejemplo, Frankfurt), para recuperarse ante desastres. Si la nube confidencial también tiene que recuperarse allí, en Frankfurt solo podría usar **servidores dedicados**, con el sobrecoste correspondiente. Ese coste se repercute en los contratos Enterprise que exijan recuperación ante desastres de la nube confidencial.

### 6.3. Lenguajes

| Pieza | Lenguaje | Por qué |
|---|---|---|
| Gateway y servicios de apoyo | **Go** | Compilado, rápido, muy usado en proxies y servicios de red, y más rápido de desarrollar que alternativas como Rust |
| Panel web | **TypeScript con React** | Estándar para interfaces web |

### 6.4. Ejecución (cómputo)

- **Contenedores Docker:** cada componente se empaqueta con todo lo que necesita para funcionar igual en cualquier entorno.
- **Amazon ECS con Fargate:** AWS ejecuta los contenedores sin que haya que gestionar servidores. Escala automáticamente, añadiendo contenedores cuando sube el tráfico y quitándolos cuando baja.
- **Application Load Balancer (ALB):** reparte las peticiones entre los contenedores de las dos zonas y deja de enviar tráfico a los que fallan. Como una petición a un modelo que razona puede durar hasta 30 minutos *(ejemplo)* (5.4, paso 8), se amplían dos de sus tiempos por defecto: el de **inactividad** (por defecto cierra las conexiones que pasan 60 segundos sin actividad) y el de **vaciado** (cuánto espera a que terminen las peticiones de un contenedor que se retira; por defecto, 5 minutos).
- **Apagado ordenado:** cuando un contenedor del gateway recibe la orden de parar, deja de aceptar peticiones nuevas y termina las que tiene en curso, liquidando sus reservas.

### 6.5. Almacenamiento y mensajería

| Servicio | Uso | Configuración |
|---|---|---|
| **Amazon ElastiCache (Valkey, compatible con Redis)** | Contadores, reservas, registros de auditoría pendientes de enviar, sesiones activas, huellas, líneas base, cadenas de respuestas | Réplica en la segunda zona y copias periódicas. Configurado para **no descartar nunca datos** por falta de memoria, con alarmas de memoria (ver 4.4) |
| **Amazon RDS for PostgreSQL** | Datos permanentes (fuente de verdad) | Réplica en la segunda zona, copias de seguridad diarias, cifrado en reposo |
| **Amazon SQS** | Cola de eventos de auditoría, entre Redis y el servicio de auditoría | Entrega con reintentos; el orden lo fija el servicio de auditoría al encadenar los eventos (4.8) |
| **Amazon S3 con bloqueo de objetos (modo cumplimiento)** | Sellos firmados del registro de auditoría (uno cada 5 minutos *(ejemplo)* para todas las cadenas) | Nadie, ni siquiera el administrador principal de la cuenta, puede modificarlos ni borrarlos hasta que vence el plazo |
| **AWS KMS** | Llave maestra para cifrar las claves reales y llave para firmar los sellos de auditoría | Las llaves nunca salen de KMS |

### 6.6. Servicios externos

| Servicio | Para qué |
|---|---|
| **APIs de OpenAI y Anthropic** | Proveedores de modelos de IA (el cliente paga con su propia clave) |
| **Stripe** (pasarela de pagos) | Cobro de las suscripciones de Unburn (datos de los que Unburn es responsable; ver 3.11) |
| **Amazon SES** | Envío de emails de alertas y avisos |
| **Webhooks de Slack y Microsoft Teams** | Alertas en los canales del cliente |

### 6.7. Seguridad de la infraestructura

- **Cifrado en tránsito:** todas las conexiones usan HTTPS/TLS, tanto con los clientes como con los proveedores.
- **Cifrado en reposo:** bases de datos y copias de seguridad cifradas.
- **Red privada (VPC):** las bases de datos no son accesibles desde internet; solo los componentes de Unburn pueden hablar con ellas.
- **AWS WAF** (cortafuegos de aplicaciones web): filtra en la entrada ataques básicos y **volúmenes abusivos por dirección IP**, y responde con **429** (exceso de velocidad). Esto también protege **a Unburn**: un ataque masivo cuesta recursos aunque luego se bloquee. Los límites **por clave virtual** se aplican en el gateway (5.8), no en el WAF, y los registros del WAF **ocultan** las cabeceras que llevan la clave.
- **Mínimo privilegio:** cada componente tiene solo los permisos de AWS que necesita. Por ejemplo, solo el gateway puede pedir a KMS que descifre, y solo el servicio de auditoría puede firmar.
- **Registros técnicos sin contenido:** los registros de los servidores, del balanceador y del WAF **nunca** incluyen el texto de las peticiones ni claves.

### 6.8. Observabilidad

Se usa **OpenTelemetry**, un estándar abierto para recoger métricas, trazas y registros. Las piezas son:
- un **recolector de OpenTelemetry** (la distribución de AWS) que recibe los datos de los componentes de Unburn;
- **Amazon Managed Service for Prometheus**, que guarda las métricas;
- **AWS X-Ray**, que guarda las trazas (el recorrido de cada petición por los componentes);
- **Amazon CloudWatch Logs**, que guarda los registros técnicos;
- **Amazon Managed Grafana**, que **solo visualiza**: muestra paneles y lanza alertas a partir de los datos guardados en los servicios anteriores.

Al ser todos servicios de AWS, no añaden otro subencargado del tratamiento (ver 3.11). Se vigila:
- latencia que añade Unburn;
- errores;
- uso de CPU y memoria, y en especial la **memoria de Redis** (4.4);
- registros de auditoría pendientes de enviar y tamaño de la cola (si la cola deja de responder, los pendientes crecen en Redis);
- tiempos de respuesta de los proveedores.

El equipo de guardia recibe un aviso si algo se sale de lo normal.

### 6.9. Disponibilidad

- **Meta de disponibilidad: 99,9%** *(ejemplo)*, es decir, como máximo unas **8,8 horas** de caída al año.
- **Por qué no 99,99%** (menos de 1 hora al año):
  - Con la política de bloquear ante fallos, cualquier fallo interno detiene el servicio.
  - Los proveedores de IA tampoco garantizan ese nivel, así que prometerlo no sería realista.
- **Objetivos de nivel de servicio (SLO):** el equipo fija metas internas medibles, como disponibilidad o latencia añadida, y un **margen de error** (cuánto fallo se tolera al mes). Si se agota el margen, se priorizan las mejoras de estabilidad sobre las funciones nuevas. Es una práctica de ingeniería de fiabilidad (SRE).
- **Medidas:** dos zonas de disponibilidad, réplicas de las bases de datos, reconstrucción de contadores (ver 4.9) y escalado automático.
- **[Arquitectura objetivo]:** compromisos contractuales de disponibilidad (**SLA**) para clientes Enterprise y una segunda región de la UE.

### 6.10. Desarrollo, despliegue y seguridad de la cadena de suministro

Un gateway de IA guarda claves y ve todo el tráfico de IA de sus clientes, así que es un objetivo muy valioso para un atacante. El ataque a **LiteLLM** de marzo de 2026 lo demostró: los atacantes consiguieron las credenciales de publicación a través de una herramienta comprometida de su sistema de construcción, y publicaron versiones que robaban credenciales al instalarse (ver 3.10). Por eso el desarrollo de Unburn sigue estas prácticas:

**[Fase 1 – MVP]:**
- **Integración y despliegue continuos (CI/CD) con GitHub Actions:** cada cambio de código se compila y pasa pruebas automáticas antes de publicarse.
- **Despliegue canario con vuelta atrás automática:** la nueva versión recibe primero un 5% del tráfico *(ejemplo)*. Los contenedores de la versión anterior se retiran sin cortar las peticiones en curso (ver 6.4). Si los indicadores de observabilidad se mantienen bien durante un tiempo, pasa gradualmente al 100%. Si empeoran, se vuelve automáticamente a la versión anterior. Así se actualiza sin parar el servicio.
- **Seguridad de la cadena de suministro:**
  - las dependencias se fijan a versiones concretas y se verifican, en lugar de instalar automáticamente la última versión;
  - el sistema de construcción tiene los permisos mínimos y sus propias herramientas también se fijan a versiones verificadas;
  - las imágenes de contenedor se **firman**, y solo se despliegan imágenes firmadas;
  - cada versión lleva su **SBOM** (lista de todos los componentes que incluye);
  - se escanean las vulnerabilidades de forma continua.

**[Arquitectura objetivo]:**
- **Ingeniería del caos:** simulacros controlados de fallos (caída de Redis, proveedor lento, pérdida de una zona) para comprobar que Unburn reacciona como está previsto.
- **Pruebas aumentadas con IA:** generación automática de casos de prueba, por ejemplo peticiones anómalas o bucles sintéticos, para entrenar y comprobar el detector de bucles y el sistema inmunológico.

Estas prácticas, junto con la observabilidad (6.8), los SLO (6.9) y la autorreparación (vuelta atrás automática y reconstrucción de contadores), forman el **sistema inmunológico digital de la propia plataforma** (ver 7.6).

### 6.11. Unburn Cloud Confidencial [Arquitectura objetivo]

Es la modalidad Enterprise para empresas que quieren usar la nube de Unburn, pero sin que **ni Unburn ni AWS** puedan inspeccionar por software lo que se procesa. Ese es el **objetivo de diseño**. Hasta dónde se cumple frente a AWS depende de un punto abierto, explicado más abajo.

**Cómo funciona.**
- **Máquinas confidenciales.** El gateway se ejecuta en un clúster separado de **máquinas virtuales confidenciales** de AWS: instancias EC2 con **AMD SEV-SNP**, en la región de Irlanda. Esta tecnología cifra la memoria de la máquina con una clave que solo conoce el procesador.
- **El cifrado TLS termina dentro de la máquina confidencial.** En la nube normal (6.1), la conexión HTTPS se descifra en el balanceador y en el WAF, que están **fuera** de la zona protegida, y allí el texto estaría en claro. Por eso aquí se usa un **balanceador de red que no descifra** el tráfico, y se **renuncia a la inspección del WAF**: solo se mantienen protecciones de red, como los límites de conexiones.
- **Atestación remota.** Antes de enviar tráfico, el cliente recibe una prueba firmada con una cadena de confianza que lleva hasta AMD (el fabricante del procesador). La prueba va **vinculada a la conexión TLS**, para que el cliente sepa que corresponde a la misma máquina con la que está hablando. El verificador **rechaza las versiones de firmware sin parchear**, imprescindible por ataques como *RMPocalypse* (ver más abajo).
- **Builds reproducibles.** Unburn publica cómo construir exactamente la imagen completa, para que el cliente o un auditor compruebe que lo que se ejecuta corresponde al código revisado.
- **Claves reales.** Las claves de los proveedores solo se descifran **dentro** de las máquinas confidenciales, y solo después de una atestación válida.

**Punto abierto (hay que verificarlo antes de prometerlo).** La atestación de AMD solo mide el **código de arranque inicial** de la máquina, no el sistema operativo ni el gateway que se cargan después. Para demostrar qué software exacto se ejecuta hace falta una **cadena de arranque medido**, en la que cada pieza mide a la siguiente hasta llegar al gateway. En EC2, el código de arranque inicial lo pone AWS, y el módulo que AWS ofrece para guardar esas medidas (NitroTPM) está **fuera** de la máquina confidencial: usarlo obligaría a volver a confiar en AWS. No se ha encontrado en la documentación de AWS una forma confirmada de evitarlo. Si no la hay, la promesa debe rebajarse a: protege frente al personal de Unburn y frente al acceso por software a la memoria desde fuera de la máquina, **confiando en el firmware de arranque de AWS**.

**Coste.** AWS cobra un recargo por usar SEV-SNP en servidores compartidos (un 10% sobre el precio de la instancia, según su documentación). Se repercute en el precio del contrato Enterprise. En otras regiones solo se puede usar con servidores dedicados (ver 6.2).

**Qué NO protege** (ver también 7.7 y sección 10):
- **Ataques desde el hipervisor** (el software con el que AWS gestiona las máquinas) **si el firmware no está actualizado.** En octubre de 2025 se publicó *RMPocalypse* (CVE-2025-0033), que permitía a un hipervisor malicioso falsificar la atestación e inyectar código. Afecta a los procesadores AMD Zen 3, Zen 4 y Zen 5, y AMD publicó correcciones de firmware. Por eso la verificación de la versión del firmware es obligatoria.
- **Ataques físicos sofisticados** con acceso al hardware. En 2025 se publicaron ataques de este tipo (por ejemplo, *TEE.Fail*) contra AMD SEV-SNP e Intel TDX. Los fabricantes los consideran fuera de lo que su tecnología pretende cubrir.
- **Al proveedor de IA:** el texto sigue llegando legible a OpenAI o Anthropic.
- **Las bases de datos (Redis y PostgreSQL)** están fuera de la zona protegida. Por eso solo guardan metadatos y datos cifrados.

### 6.12. Despliegue privado [Arquitectura objetivo]

Es la alternativa Enterprise para empresas que no pueden enviar su tráfico a ninguna nube externa.

- **Qué se entrega:** Unburn se entrega como **imágenes de contenedor**, con plantillas para Kubernetes (Helm) y Docker Compose, y se instala en la infraestructura del cliente.
- **Qué pone el cliente:** su propio Redis y su propio PostgreSQL.
- **Cómo se instala:** como un **servicio central** dentro de su red, por el que pasan todas sus aplicaciones. **No** se instala un "sidecar" (una copia junto a cada aplicación), porque los presupuestos necesitan un **contador único y compartido**. Con una copia por aplicación, cada una llevaría su propia cuenta y los límites no funcionarían.
- **Licencia y actualizaciones:** licencia anual, con actualizaciones publicadas por Unburn.
- **Privacidad:** ningún dato sale de la red del cliente. El envío de métricas técnicas anónimas a Unburn es opcional.
- **Cyber Resilience Act:** al ser software que se entrega para instalar, está sujeto al CRA (ver 3.11). Desde el primer día necesita:
  - marcado CE;
  - SBOM de cada versión;
  - un proceso de gestión de vulnerabilidades durante todo el periodo de soporte;
  - notificación de vulnerabilidades explotadas e incidentes graves.

  Las prácticas de 6.10 son la base para cumplirlo.

### 6.13. Alternativas descartadas (y por qué)

| Alternativa | Por qué se descarta |
|---|---|
| **Edge computing** (Cloudflare Workers, Vercel Edge) | Los presupuestos necesitan un contador central. Ejecutar el código en cientos de ciudades no ahorra tiempo si cada petición tiene que consultar igualmente ese contador en una sola región. Además, Cloudflare Workers no ejecuta Go de forma nativa (habría que compilarlo a WebAssembly), y Vercel recomienda migrar desde su entorno Edge a Node.js. El retraso extra de un núcleo regional es pequeño comparado con los segundos que tarda un modelo en responder. |
| **Kafka o RabbitMQ** para la auditoría | Son más complejos de operar de lo que necesita este volumen. Amazon SQS es suficiente. |
| **Rust** | Algo más eficiente, pero más lento de desarrollar. Go es suficiente para este tipo de proxy. |
| **Sidecar por aplicación** en el despliegue privado | Rompería los presupuestos compartidos (ver 6.12). |

---

## 7. Tecnologías emergentes

> **Regla de uso:** en las entregas se incluye todo, tanto [Fase 1 – MVP] como [Arquitectura objetivo]. Para implementar el MVP, solo [Fase 1 – MVP].

### 7.1. Resumen

| Tecnología | Papel en Unburn | Dónde se aplica | Fase |
|---|---|---|---|
| **AI Agents** (agentes de IA) | El tipo de software que Unburn protege y controla | Todo el producto | Contexto del producto |
| **Multiagent Systems** (sistemas multiagente) | El escenario de riesgo que diferencia a Unburn | Sesiones, detección de bucles, delegación entre agentes | Contexto del producto |
| **Model Context Protocol (MCP)** | El protocolo cuyo uso se controla | Escudo MCP (5.7) | MVP (básico) y Objetivo (proxy MCP) |
| **Context Graphs** (grafos de contexto) | Registrar el contexto de cada decisión: qué hizo cada agente, quién encargó qué y por qué Unburn lo permitió o lo bloqueó | Grafo de sesión (traza de decisiones) y grafo de autorización | MVP |
| **Causal AI** (IA causal) | Encontrar la causa de bucles y picos de gasto, acotar el coste que provocaron y medir el efecto de las intervenciones | Diagnóstico causal (5.6) | MVP (grafo causal, causa raíz y cota superior del coste atribuible) y Objetivo (efecto de intervenciones y contrafactuales estimados con datos) |
| **Digital Immune System** (sistema inmunológico digital) | Detectar problemas y responder o repararse de forma automática, tanto en el tráfico del cliente como en la propia plataforma | Sistema inmunológico (5.8) y prácticas de la plataforma (6.8 a 6.10) | MVP (casi todo) y Objetivo (ingeniería del caos, pruebas con IA) |
| **Confidential Computing** (computación confidencial) | Proteger los datos mientras se procesan | Unburn Cloud Confidencial (6.11) | Objetivo |

### 7.2. AI Agents y Multiagent Systems

**Qué son.** Un **agente de IA** es un programa que usa un modelo de IA para decidir y actuar por su cuenta: buscar información, ejecutar herramientas, escribir código. Un **sistema multiagente** es un conjunto de agentes que colaboran y se reparten el trabajo. Por ejemplo, un agente planificador divide la tarea, un programador escribe el código, un auditor lo revisa y otro ejecuta las pruebas.

**Por qué son un riesgo nuevo.**
- Trabajan **sin supervisión humana constante**, a veces de noche o durante horas.
- Cada paso implica una o varias peticiones de pago al modelo.
- Los errores se encadenan: un agente puede atascar a otro, y dos agentes pueden quedarse en bucle.
- Un **gateway tradicional** solo ve peticiones sueltas, sin saber que diez peticiones forman parte de la misma conversación entre máquinas.

**Cómo los usa Unburn.** Unburn entiende **sesiones** y **agentes** (gracias a las claves y cabeceras de 5.3). Así puede:
- poner límites por tarea y no solo por petición;
- detectar bucles entre agentes;
- reconstruir qué agente provocó un problema;
- vigilar la **delegación** entre agentes, que puede abrir caminos indirectos a datos protegidos (5.7).

### 7.3. Model Context Protocol (MCP)

**Qué es.** Un **estándar abierto** que define cómo una aplicación de IA se conecta con herramientas y fuentes de datos externas: bases de datos, archivos, servicios. Lo presentó Anthropic en noviembre de 2024 y en diciembre de 2025 lo cedió a la **Agentic AI Foundation**, dentro de la **Linux Foundation**, que lo gobierna de forma neutral. Sus mensajes usan el formato JSON-RPC. Hay dos formas de conexión:
- **stdio**, para servidores locales que se ejecutan en el mismo ordenador que el agente;
- **Streamable HTTP**, para servidores remotos accesibles por la red.

La especificación se versiona por fechas. La revisión del **28 de julio de 2026** hizo el protocolo **sin estado** (cada mensaje es independiente y ya no hay un "saludo" inicial), añadió cabeceras HTTP que indican la operación y la herramienta de cada mensaje, y alineó la autorización con OAuth 2.0 y OpenID Connect.

Los propios proveedores de IA también pueden conectarse a servidores MCP remotos desde sus servidores. Es el caso del conector MCP de Anthropic y de las herramientas MCP de la *Responses API* de OpenAI.

**El riesgo.** MCP da a los agentes acceso real a datos y acciones. Si un atacante consigue que el modelo lea instrucciones maliciosas (inyección de instrucciones), puede intentar que use herramientas indebidas.

**Cómo lo usa Unburn.**
- **[Fase 1 – MVP]:** escudo MCP que controla, según el grafo de autorización, qué herramientas ve y puede pedir el modelo, y qué herramientas y conectores MCP del proveedor se pueden activar en cada petición.
- **[Arquitectura objetivo]:** proxy MCP completo delante de los servidores MCP remotos, con reglas sobre los argumentos y el volumen de datos, y con su propia gestión de credenciales (5.7).

### 7.4. Causal AI (IA causal)

**Qué es.** La mayoría de la IA aprende **correlaciones** ("cuando pasa A, suele pasar B"). La **IA causal** intenta entender **causas** ("A provoca B"). Usa tres herramientas:

1. **Grafo causal:** un mapa de qué cosas provocan cuáles.
2. **Intervenciones:** "si hago X, ¿qué cambia?".
3. **Contrafactuales:** "¿qué habría pasado si no hubiera hecho X?".

**Cómo la usa Unburn:**

| Herramienta causal | Aplicación en Unburn | Fase |
|---|---|---|
| Grafo causal | El **grafo de sesión** es un grafo causal de la tarea. Sus flechas no se adivinan: se **observan** en el tráfico ("esta llamada usó el resultado de aquella", "este agente encargó la tarea a aquel"). | MVP |
| Contrafactual sencillo sobre el grafo | **Cota superior del coste atribuible:** el coste de todas las llamadas que dependen de la causa raíz. Intenta responder a "¿qué no se habría gastado si ese paso no hubiera ocurrido?", pero supone que, sin ese paso, el agente no habría hecho nada más. Como en realidad habría seguido por otro camino, que también cuesta, el resultado es solo una **cota superior**. | MVP |
| Intervenciones | Unburn **interviene** en los bucles: alerta al administrador, aviso al agente, cambio de modelo o bloqueo. Comparando qué ocurre después de cada tipo de intervención, incluso asignándolas al azar entre clientes que lo acepten, se mide **cuál funciona mejor**. | Objetivo |
| Contrafactuales estimados con datos | **Ahorro riguroso:** cuánto habría durado y costado un bucle sin intervención, estimado con experimentos de asignación al azar y con métodos que tienen en cuenta que la alerta ya es una intervención y que la regla R3 corta las sesiones. Se da con su margen de error. | Objetivo (en el MVP, una estimación con hipótesis visible; ver 5.6) |

**Qué parte es IA causal en el MVP (nota honesta).**
- **Recorrer el grafo hacia atrás** para encontrar el origen es, por sí solo, **trazabilidad** (saber de dónde viene cada cosa), no IA causal.
- Lo que el MVP añade es usar ese grafo como **modelo causal** cuya estructura se observa (no hay que estimarla) y hacerle una **pregunta contrafactual sencilla**: la cota superior del coste atribuible. Es un primer paso de razonamiento causal, **limitado por una hipótesis fuerte** (que sin la causa raíz el agente no habría hecho nada más). Por eso se presenta como cota superior y no como el coste real causado.
- Lo que el MVP **no** hace es **estimar efectos causales a partir de datos**: medir el efecto de cada intervención o calcular el ahorro con un modelo estadístico. Eso, que es la IA causal en sentido completo, está en la arquitectura objetivo.
- Si alguien presentara **solo** el MVP, podría objetarse con razón que su componente causal es ligero. Por eso, según la regla de uso (D1), las entregas incluyen también la arquitectura objetivo, donde la IA causal está completa.
- **Detectar** un bucle no requiere IA causal: se hace con reglas (5.6). Presentarla como el detector de bucles sería incorrecto.

### 7.5. Context Graphs (grafos de contexto)

**Qué son.** Un grafo es una estructura de **nodos** (puntos) unidos por **aristas** (relaciones). Desde finales de 2025, a raíz de un artículo de la firma de inversión Foundation Capital, "grafo de contexto" se usa sobre todo para el registro de las **trazas de decisiones** de los agentes: no solo **qué** se hizo, sino **por qué** se decidió así (qué regla se aplicó, qué excepción se hizo, quién la aprobó, qué información se usó). La idea es que ese registro permita auditar las decisiones y aprender de ellas.

**Cómo los usa Unburn [Fase 1 – MVP].** El grafo de contexto de Unburn tiene dos partes, y la principal es la primera:

1. **Grafo de sesión: la traza de decisiones.** Recoge cada llamada de cada tarea, de qué otras llamadas depende, qué agente encargó qué a quién y, sobre todo, **cada decisión de Unburn con su motivo**: permitida, bloqueada, frenada o con modelo sustituido, por qué regla o por qué permiso, y con qué versión de la configuración. Todos esos datos se guardan **en cada evento de auditoría** (4.3), así que la traza se conserva y se puede reconstruir durante **todo el plazo de retención del plan** (4.7), no solo mientras la sesión está activa. Sirve para:
   - el **diagnóstico causal** (7.4);
   - la **auditoría** (4.8);
   - **explicar** al cliente por qué pasó cada cosa.
2. **Grafo de autorización: el contexto de las reglas.** Agentes, herramientas y categorías de datos, unidos por "puede usar", "accede a" y "puede delegar en". En sentido estricto es un **grafo de permisos**. Forma parte del contexto porque **cada decisión de la traza apunta a la arista o regla que la justificó**, que es lo que permite contestar "por qué". Además sirve para:
   - aplicar el **mínimo privilegio**: cada agente solo accede a lo que necesita;
   - descubrir **caminos indirectos** hacia datos protegidos, algo que una lista de permisos no puede hacer (5.7).

### 7.6. Digital Immune System (sistema inmunológico digital)

**Qué es.** Según la definición de Gartner, un sistema inmunológico digital combina **seis prácticas** para que el software detecte problemas, se proteja y se recupere solo, sin depender de que un humano reaccione a tiempo:
1. observabilidad;
2. pruebas aumentadas con IA;
3. ingeniería del caos;
4. autorreparación;
5. ingeniería de fiabilidad (SRE);
6. seguridad de la cadena de suministro del software.

La comparación con el sistema inmunitario es literal: detectar lo anómalo, responder en proporción, recordar y reforzarse.

**Cómo lo usa Unburn.** Se aplica en **dos niveles**, para no quedarse en un simple limitador de velocidad:

| Práctica | En el tráfico de IA del cliente | En la propia plataforma de Unburn | Fase |
|---|---|---|---|
| Observabilidad | Velocidad de consumo por clave, sesión y usuario final, comparada con su comportamiento normal (5.8) | Métricas, trazas y alertas con OpenTelemetry y Grafana (6.8) | MVP |
| Autorreparación | Respuesta gradual y localizada: avisar, frenar, cambiar de modelo o bloquear **solo** la parte afectada. Memoria del incidente (5.8) | Vuelta atrás automática en despliegues canario; reconstrucción de contadores (4.9, 6.10) | MVP |
| SRE | — | Objetivos de nivel de servicio y margen de error (6.9) | MVP |
| Seguridad de la cadena de suministro | — | Dependencias fijadas, imágenes firmadas, SBOM, escaneo de vulnerabilidades (6.10) | MVP |
| Ingeniería del caos | — | Simulacros de caída de Redis, de un proveedor o de una zona (6.10) | Objetivo |
| Pruebas aumentadas con IA | Bucles y ataques sintéticos para comprobar el detector y el sistema inmunológico | Generación automática de casos de prueba (6.10) | Objetivo |

### 7.7. Confidential Computing (computación confidencial)

**Qué es.** Los datos pueden estar en tres estados:
- **en tránsito**, viajando por la red (se protegen con TLS);
- **en reposo**, guardados en disco (se protegen con cifrado);
- **en uso**, mientras un programa los procesa en memoria.

Hasta hace poco, los datos en uso estaban necesariamente **sin cifrar** en la memoria. La computación confidencial crea **entornos de ejecución confiables** (TEE) con ayuda del procesador: la memoria se cifra con una clave que solo conoce el chip, y ni el sistema operativo ni el administrador del servidor ni el proveedor de nube pueden leerla por software. Además ofrece **atestación remota**: una prueba firmada por el fabricante del procesador de qué software se está ejecutando.

**Cómo la usa Unburn [Arquitectura objetivo]:** en **Unburn Cloud Confidencial** (6.11), el gateway se ejecuta en máquinas virtuales confidenciales (AMD SEV-SNP):
- El cifrado TLS termina **dentro** de la máquina confidencial, así que el texto de las peticiones y las claves reales de los proveedores solo existen en claro **dentro** de la zona protegida.
- El cliente puede verificar mediante atestación, vinculada a la conexión TLS, qué código procesa sus datos.

Es la respuesta al principal freno de los sectores regulados para usar un intermediario en la nube.

**Límites honestos:**
- **Las vulnerabilidades del propio hardware y firmware importan.** En 2025 se publicó *RMPocalypse*, un ataque **por software** desde el hipervisor contra AMD SEV-SNP que permitía falsificar la atestación. AMD lo corrigió con actualizaciones de firmware. Por eso la verificación debe rechazar las versiones de firmware sin parchear.
- **No protege frente a ataques físicos sofisticados** con acceso al hardware: en 2025 se demostraron ataques así (por ejemplo, *TEE.Fail*) contra las tecnologías de AMD e Intel.
- **No protege frente al proveedor de IA**, que sigue recibiendo el texto.
- **La atestación inicial solo mide el código de arranque.** Para que demuestre qué software se ejecuta, hace falta una cadena de arranque medido hasta la imagen del gateway. En EC2, construirla **sin volver a confiar en AWS** es un punto abierto que hay que verificar; si no es posible, la protección frente a AWS se limita a confiar en su firmware de arranque (6.11).
- **La atestación demuestra qué código se ejecuta, no que ese código sea seguro.** Por eso hacen falta builds reproducibles y revisiones de código.

---

## 8. Análisis de brechas y hoja de ruta

> **Regla de uso:** en las entregas se presenta todo el análisis y la hoja de ruta completa. Para implementar el MVP, solo la Fase 1.

### 8.1. Arquitectura de partida, arquitectura objetivo y brechas por dominio

TOGAF pide describir, en **cada dominio**, tres cosas:
- la **arquitectura de partida** (*baseline*): cómo están las cosas hoy;
- la **arquitectura objetivo** (*target*): a dónde se quiere llegar;
- las **brechas** (*gaps*): lo que falta para pasar de una a otra.

Como Unburn no existe todavía, la partida es la situación actual de los clientes.

| Dominio | Partida (hoy, en el cliente) | Objetivo (con Unburn) | Brecha (qué falta) | Qué la cierra |
|---|---|---|---|---|
| **Negocio** | Gasto en IA sin control en tiempo real; agentes sin gobierno; seguridad de herramientas sin centralizar; cumplimiento normativo difícil (3.1) | Control financiero en tiempo real, gobierno de agentes, seguridad de herramientas y trazabilidad como servicio, con planes Gratis, Pro y Enterprise (3.2 a 3.9) | Crear el producto, la oferta comercial, los canales de venta y los contratos (incluidos los exigidos por RGPD, Data Act y DORA) | Fase 1 (Gratis y Pro, autoservicio); Fase 3 (Enterprise y venta consultiva) |
| **Datos** | Claves reales copiadas en servidores, repositorios y ordenadores; datos de gasto solo en el panel de cada proveedor, sin desglose por agente ni por sesión; ningún registro de las decisiones de los agentes | Claves reales cifradas en un solo sitio; gasto por organización, clave, agente y sesión; registro de auditoría íntegro y verificable; grafo de contexto con las decisiones (4.2 a 4.9) | Modelo de datos de gasto, sesiones y decisiones; custodia de claves; integridad y retención del registro | Fase 1; retención de 6 meses o más en Fase 3 (Enterprise) |
| **Aplicación** | Las aplicaciones y agentes llaman directamente a las librerías del proveedor; los servidores MCP se conectan sin control central; nada detecta bucles ni anomalías | Gateway intermedio con presupuestos, escudo MCP, detector de bucles, diagnóstico causal y sistema inmunológico; proxy MCP completo (5.1 a 5.11) | Construir el gateway y los servicios de apoyo; el proxy MCP; la IA causal completa; más proveedores | Fase 1 (gateway y servicios); Fase 2 (proxy MCP, IA causal completa, Gemini) |
| **Tecnología** | Infraestructura propia del cliente y APIs de los proveedores por internet; nada protege los datos en uso | Plataforma de Unburn en AWS (UE) con alta disponibilidad; nube confidencial; despliegue privado; segunda región (6.1 a 6.12) | Desplegar la plataforma en la nube; la nube confidencial con atestación; el producto instalable conforme al CRA; la recuperación ante desastres | Fase 1 (plataforma en Irlanda); Fase 3 (confidencial, privado, segunda región) |

### 8.2. Hoja de ruta (arquitecturas de transición)

La hoja de ruta describe cómo se pasa de la arquitectura de partida a la arquitectura objetivo mediante **arquitecturas de transición**. Las duraciones son *(ejemplo)*.

| Fase | Duración *(ejemplo)* | Contenido |
|---|---|---|
| **Fase 1 – MVP** | Meses 0–6 | Todo lo marcado como [Fase 1 – MVP]:<br>• Gateway para OpenAI (*Chat Completions* y *Responses API*) y Anthropic (*Messages*), solo con las APIs y opciones de 5.3.<br>• Claves virtuales con agentes permitidos y rotación; lista de opciones admitidas; reservar y liquidar con todas las dimensiones de precio (incluida la entrada adicional de las herramientas del proveedor), sin que ningún gasto quede sin contar; presupuestos de dos niveles; límite de respuesta.<br>• Detección de bucles por reglas; diagnóstico causal (grafo causal, causa raíz, coste del bucle, cota superior del coste atribuible, ahorro con hipótesis visible).<br>• Escudo MCP básico con grafo de autorización, caminos indirectos y control de las herramientas del proveedor.<br>• Sistema inmunológico.<br>• Registro de auditoría que no se pierde aunque se caiga el gateway y a prueba de manipulaciones (eventos encadenados y sellos firmados en S3); agregados de gasto.<br>• Seguridad de la cadena de suministro; alertas; panel web; facturación con plan Gratis y Pro.<br>• Región de Irlanda con dos zonas. |
| **Fase 2 – Crecimiento** | Meses 6–18 | • Proxy MCP completo, con reglas de argumentos y de volumen y gestión propia de credenciales.<br>• Detección semántica de bucles; modo "aviso al agente"; medición del efecto de las intervenciones y ahorro contrafactual (IA causal completa).<br>• Identidad de agentes con credenciales firmadas.<br>• Caché semántica opcional; Google Gemini; cambio automático entre proveedores; nivel "proyecto" en los presupuestos; conciliación con los informes de los proveedores.<br>• Ingeniería del caos y pruebas aumentadas con IA.<br>• Más APIs de los proveedores: modo en segundo plano y conversaciones guardadas de la *Responses API*, archivos y documentos, lotes y *embeddings*.<br>• Dominio propio del cliente; nodo verificado de n8n. |
| **Fase 3 – Enterprise** | Meses 18–36 | • Unburn Cloud Confidencial (TLS dentro de la máquina, atestación vinculada, verificación de firmware y, si se resuelve el punto abierto de 6.11, cadena de arranque medido sin depender de AWS).<br>• Despliegue privado conforme al Cyber Resilience Act.<br>• Segunda región de la UE; SLA contractuales; retención de 6 meses o más.<br>• Venta a través del *marketplace* de AWS. |

---

## 9. Alcance del MVP

> Esta sección es la referencia para **implementar** el MVP. Para las entregas, ver la regla de uso (0.2).

### 9.1. Qué entra y qué no

| Entra en el MVP | No entra en el MVP (arquitectura objetivo) |
|---|---|
| Gateway en Go para OpenAI (*Chat Completions* y *Responses API*) y Anthropic (*Messages*), con y sin streaming, solo con las APIs y opciones de 5.3 | Google Gemini; cambio automático entre proveedores; modo en segundo plano y conversaciones guardadas de la *Responses API*; archivos y documentos; lotes; *embeddings*; tiempo real |
| Claves virtuales (crear, revocar, rotar, políticas, agentes permitidos); lista de opciones admitidas; cuenta o proyecto del proveedor fijado por Unburn | Identidad de agentes con credenciales firmadas; dominio propio del cliente |
| Reservar y liquidar con todas las dimensiones de precio (incluida la entrada adicional de las herramientas del proveedor), reservas renovadas mientras dura la petición y revisión de reservas vencidas; presupuestos organización → clave, diarios y mensuales, blandos y duros | Nivel "proyecto"; conciliación con informes de proveedores |
| Ajuste del límite de respuesta y del consumo en streaming según cada API | — |
| Cabeceras de sesión, agente, agente padre y usuario final | — |
| Detección de bucles por reglas (R1, R2, R3), en modo aviso o bloqueo | Detección semántica con *embeddings*; modo "aviso al agente" |
| Diagnóstico causal: grafo causal, causa raíz, coste del bucle, cota superior del coste atribuible y ahorro con hipótesis visible | Efecto de intervenciones y ahorro contrafactual estimado con datos |
| Control de las herramientas del proveedor en la petición (todos los planes). Escudo MCP básico (Pro y Enterprise): modo aprendizaje y modo protección, grafo de autorización, caminos indirectos, filtrado de herramientas del cliente en petición y respuesta | Proxy MCP completo con reglas de argumentos y volumen |
| Sistema inmunológico: líneas base, respuesta gradual, memoria, rechazo barato, límites de volumen en la entrada | Caché semántica |
| Registro de auditoría que no se pierde aunque se caiga el gateway, con eventos encadenados y sellos firmados en S3 (modo cumplimiento); agregados de gasto y exportación | Retención de 6 meses o más por contrato |
| Seguridad de la cadena de suministro, SLO, despliegue canario con vuelta atrás | Ingeniería del caos; pruebas aumentadas con IA |
| Alertas por email, Slack, Teams y webhook | — |
| Panel web y API de administración | — |
| Planes Gratis y Pro con Stripe | Contratos Enterprise |
| AWS Irlanda, dos zonas de disponibilidad | Segunda región, Cloud Confidencial, despliegue privado |

### 9.2. Criterios de éxito del MVP *(ejemplos)*

- Un desarrollador integra Unburn en **menos de 15 minutos**.
- Unburn añade **menos de 50 ms** de retraso (en el 95% de las peticiones), sin contar lo que tarda el proveedor.
- **En las pruebas sin fallos simulados y sin herramientas del proveedor, el coste real de ninguna petición supera su reserva.** Si se cumple, no puede haber sobrepaso: las peticiones simultáneas ya están cubiertas por la reserva atómica (5.5). Este criterio comprueba que la reserva es de verdad el peor caso, sea cual sea el tamaño de la petición o el precio del modelo.
- **Con herramientas del proveedor**, cuyo coste solo se puede estimar (5.5), todo exceso sobre la reserva queda registrado y sirve para ajustar la estimación.
- En las pruebas con fallos simulados por separado (caída del nodo principal de Redis, peticiones canceladas, caída de un contenedor), ninguna petición que llegó al proveedor queda sin contar, con su coste real o estimado, y todo sobrepaso queda registrado.
- En el escenario de demostración, se detecta el bucle y se muestra el diagnóstico correcto.
- En el escenario de demostración, se bloquea el intento de usar una herramienta no permitida.
- La verificación del registro de auditoría detecta cualquier modificación de un evento anterior al último sello.
- Si un contenedor del gateway se cae justo después de responder, el registro de auditoría de esa petición no se pierde.
- Una petición de 30 minutos no se corta por un despliegue ni por la caducidad de su reserva.

### 9.3. Escenarios de demostración sugeridos

1. **Bucle entre agentes:** un agente programador y un agente auditor se rechazan mutuamente la misma propuesta. Unburn detecta el bucle (regla R2) en modo bloqueo, lo detiene y avisa en Slack. El panel muestra la causa raíz, el coste del bucle, la cota superior del coste atribuible y el ahorro estimado con su hipótesis.
2. **Inyección de instrucciones:** un ticket de soporte contiene un texto que ordena al agente "consultar las facturas del cliente". El escudo MCP ya había quitado `ver_factura` de la lista de herramientas del Agente Soporte, así que el modelo no puede usarla. Si aun así la pide, Unburn bloquea la respuesta y lo registra en la auditoría.
3. **Camino indirecto:** al configurar que el Agente Soporte puede delegar en el Agente Facturación, el panel avisa de que Soporte puede llegar indirectamente a los datos de facturación.
4. **Ataque de agotamiento de costes:** un script lanza cientos de peticiones con el mismo usuario final. El sistema inmunológico frena solo a ese usuario y el resto sigue funcionando.
5. **Presupuesto agotado:** una clave de pruebas alcanza su límite duro y recibe el error 402, mientras las demás claves siguen funcionando. Las peticiones rechazadas no consumen la cuota del plan.

---

## 10. Limitaciones conocidas

Lo que Unburn **no** hace o **no** garantiza. Es importante tenerlo claro para no prometer de más en las entregas.

1. **Solo controla el tráfico que pasa por Unburn.** Si una aplicación del cliente usa la clave real directamente, Unburn no la ve. Por eso se recomienda guardar la clave real solo en Unburn y **mantener también los límites nativos del proveedor** como segunda barrera.
2. **Escudo MCP (MVP):**
   - no impide que el programa del agente llame a un servidor MCP por su cuenta;
   - no controla los argumentos;
   - no ve los datos en su origen;
   - una vez autorizada una herramienta del proveedor, no controla qué hace dentro de la respuesta.

   El proxy MCP (objetivo) cubre los tres primeros puntos, pero solo con servidores MCP remotos que únicamente sean accesibles a través de Unburn, nunca con servidores locales (5.7).
3. **La identidad del agente es declarada** cuando varios agentes comparten una clave virtual. Unburn solo comprueba que el agente declarado está entre los permitidos de esa clave. Con claves sin lista de agentes, no hay identidad de agente: los permisos son los de la clave. Para que los permisos por agente sean fiables, hay que usar **una clave por agente** (5.3). La identidad con credenciales firmadas está en la arquitectura objetivo.
4. **No detecta todas las inyecciones de instrucciones.** No existe una solución completa a este problema. Unburn **reduce su impacto** limitando lo que un agente engañado puede hacer (mínimo privilegio), pero no lee ni juzga el contenido.
5. **La detección de bucles no es perfecta:**
   - las reglas del MVP no detectan bucles en los que el agente repite lo mismo con otras palabras;
   - una tarea legítima muy repetitiva puede parecer un bucle.

   Por eso el modo por defecto es avisar, no bloquear. Y en modo bloqueo, lo normal es que la ejecución del agente se detenga, no que el agente "entienda" el aviso y cambie de estrategia (5.4, paso 6).
6. **Sin la cabecera de sesión**, Unburn funciona solo por petición: no hay detección de bucles por sesión ni diagnóstico causal. **Sin poder distinguir a los agentes** (ni por clave ni por cabecera), tampoco hay permisos por agente.
7. **Los costes son estimaciones** hasta que el proveedor informa del consumo real, y pueden diferir ligeramente de la factura oficial (descuentos, redondeos, conexiones cortadas). La tabla de precios, con todas sus dimensiones, hay que mantenerla actualizada.
8. **El presupuesto puede superarse ligeramente.** Las peticiones simultáneas nunca lo superan, pero otras causas sí pueden hacerlo (estimaciones cortas, resultados de herramientas del proveedor mayores de lo estimado, fallos de Redis, modo *fail-open*, peticiones canceladas que el proveedor cobra). El sobrepaso es **acotado y registrado**, no cero (5.5).
9. **El MVP solo admite algunas APIs y opciones de los proveedores** (5.3). Quedan fuera, entre otras, el modo en segundo plano y las conversaciones guardadas de la *Responses API*, los archivos y documentos, los lotes, los *embeddings* y el tiempo real. Las referencias a respuestas anteriores solo se aceptan si pertenecen a la misma clave virtual (al rotar una clave, sus conversaciones pasan a la nueva). Los clientes que dependan de esas funciones tendrán que esperar a la arquitectura objetivo.
10. **El ahorro es siempre una estimación**, porque mide algo que no llegó a pasar. Solo se calcula cuando Unburn detiene algo, y depende de una hipótesis que se muestra (5.6).
11. **El componente causal del MVP es básico:** un grafo causal observado y un contrafactual sencillo sobre él, que solo da una **cota superior** del coste atribuible, porque supone que sin la causa raíz el agente no habría hecho nada más. La estimación de efectos causales a partir de datos está en la arquitectura objetivo (7.4).
12. **La reserva es pesimista:** cerca del límite, puede rechazar peticiones que en realidad habrían cabido (5.5).
13. **Unburn añade un pequeño retraso** a cada petición, algo mayor en las respuestas que piden herramientas del cliente (5.4, paso 9).
14. **Con la política de bloquear ante fallos, si Unburn falla, la IA del cliente se detiene.** Es una decisión consciente: se prioriza la protección sobre la disponibilidad, salvo que el cliente elija lo contrario.
15. **Los reintentos automáticos de las librerías** pueden repetir peticiones caras tras un error 5xx. El presupuesto sigue protegiendo, pero cada reintento cuesta (5.4, paso 8).
16. **La IP que ve Unburn suele ser la del servidor del cliente.** Para frenar a usuarios finales concretos, el cliente debe enviar su seudónimo.
17. **Quedan pequeñas ventanas sin protección en la auditoría:** los eventos posteriores al último sello (como máximo unos minutos) aún no están sellados; si falla el nodo principal de Redis, pueden perderse registros de los últimos instantes, aunque el gasto se sigue contando (4.9); y si se cae un contenedor, se pierde el resumen de rechazos baratos de sus últimos segundos (4.8).
18. **La lista de opciones admitidas va por detrás de los proveedores.** Si un proveedor saca un parámetro o una función *beta* nueva, los clientes no podrán usarla a través de Unburn hasta que se añada a la lista con su precio (5.3). Es el precio de que la reserva sea siempre el peor caso.
19. **Los tiempos de espera pueden cortar peticiones legítimas extremas:** una petición que tarde más de 15 minutos en producir contenido, que pase más de 5 minutos en silencio a mitad de la respuesta o que dure más de 30 minutos en total *(ejemplos)* se cancela (5.4, paso 8).
20. **Computación confidencial (objetivo):**
    - depende de que el firmware del procesador esté actualizado (ataques como *RMPocalypse*);
    - no protege frente a ataques físicos sofisticados ni frente al proveedor de IA;
    - exige renunciar a la inspección del WAF;
    - la atestación demuestra qué código se ejecuta, no que sea seguro;
    - extender la cadena de arranque medido hasta el gateway **sin volver a confiar en AWS** es un punto abierto sin confirmar (6.11).
21. **Unburn no puede ofrecer más disponibilidad que la de los proveedores de IA:** si OpenAI cae, las peticiones a OpenAI fallan.
22. **El registro de auditoría de los planes Gratis y Pro no sirve para la obligación de conservación del AI Act**, que exige al menos 6 meses en sistemas de alto riesgo. Solo el plan Enterprise la cubre (3.11).
23. **Las referencias legales son orientativas** y deben revisarse con un abogado.
24. **La comparación con la competencia y el contexto normativo** reflejan octubre de 2026 y pueden cambiar.

---

## 11. Glosario

| Término | Significado |
|---|---|
| **Agregado de gasto** | Totales de gasto y peticiones por organización, clave virtual e intervalo de 15 minutos. Se conservan más tiempo que el registro de auditoría y permiten reconstruir días y meses en cualquier zona horaria. |
| **AI Gateway** | Intermediario especializado en tráfico de IA que se coloca entre las aplicaciones y los proveedores de modelos. |
| **API** | Interfaz que permite que un programa use los servicios de otro. |
| **Árbol de Merkle** | Técnica que resume muchas huellas en una sola, juntándolas de dos en dos. Si cambia cualquiera de ellas, cambia el resumen, y con unas pocas huellas se puede demostrar que una concreta está incluida sin revelar las demás. |
| **Arista** | En un grafo, la relación o flecha que une dos nodos. |
| **Arquitectura de partida (*baseline*)** | En TOGAF, la situación actual. |
| **Arquitectura de transición** | En TOGAF, un paso intermedio entre la situación actual y la objetivo. El MVP es la primera. |
| **Arquitectura objetivo (*target*)** | En TOGAF, la situación completa a la que se quiere llegar. |
| **Arranque medido** | Cadena en la que cada pieza del arranque de una máquina (firmware, sistema, aplicación) calcula la huella de la siguiente antes de ejecutarla, de modo que se puede demostrar qué software se cargó. |
| **Atestación remota** | Prueba firmada por el hardware de qué software se está ejecutando en un entorno confidencial. |
| **Brecha (*gap*)** | En TOGAF, la diferencia entre la arquitectura de partida y la objetivo: lo que falta construir o cambiar. |
| **Cabecera *beta*** | Cabecera con la que se activan funciones experimentales de un proveedor de IA. Algunas cambian el precio. |
| **Cabecera HTTP** | Campo de información adicional que viaja con una petición o respuesta web. |
| **Caché semántica** | Almacén de respuestas que se reutilizan cuando llega una pregunta con el mismo significado. |
| **Camino indirecto** | En el grafo de autorización, una ruta por la que un agente puede llegar a datos protegidos a través de otro agente. |
| **CI/CD** | Integración y despliegue continuos: automatización que compila, prueba y publica el software. |
| **Cifrado por sobres** | Técnica en la que los datos se cifran con una llave de datos, y esa llave se cifra a su vez con una llave maestra guardada en un servicio seguro. |
| **Clave real** | La clave de API del proveedor (OpenAI, Anthropic), asociada a la facturación del cliente. |
| **Clave virtual** | Clave emitida por Unburn para un equipo, agente o entorno. Se puede limitar y revocar sin afectar a las demás. |
| **CNAME** | Registro de DNS que hace que un dominio sea un alias de otro. |
| **Confianza cero (*zero trust*)** | Principio de seguridad según el cual nada está permitido por defecto: todo se verifica y se autoriza explícitamente. |
| **Contrafactual** | Lo que habría pasado en una situación que no ocurrió ("¿y si no hubiéramos actuado?"). |
| **Coste del bucle** | En Unburn, lo que se gastó realmente en las llamadas repetidas de un bucle. Es una medida, no una estimación. |
| **Cota superior del coste atribuible** | En Unburn, el coste de todas las llamadas que dependen de la causa raíz de un incidente. Supone que, sin ese paso, el agente no habría hecho nada más; como en realidad habría seguido por otro camino, el coste real causado es igual o menor. |
| **Cyber Resilience Act (CRA)** | Reglamento europeo que exige requisitos de ciberseguridad al software y hardware que se comercializa para instalar. |
| **Data Act** | Reglamento europeo de datos. Entre otras cosas, obliga a los servicios en la nube a facilitar el cambio de proveedor. |
| **Denegación de cartera (*denial of wallet*)** | Ataque cuyo objetivo es hacer gastar dinero a la víctima. También se llama ataque de agotamiento de costes. |
| **Dominio de arquitectura** | En TOGAF, cada una de las cuatro áreas de la arquitectura: negocio, datos, aplicación y tecnología. El profesor y ArchiMate las llaman "capas". |
| **DORA** | Reglamento europeo de resiliencia operativa digital del sector financiero. |
| ***Embeddings*** | Representación de un texto como una lista de números (vector), de forma que textos con significado parecido den vectores parecidos. |
| **Encargado del tratamiento** | En el RGPD, quien trata datos personales por cuenta de otro (el responsable). |
| ***Fail-closed* / *fail-open*** | Ante un fallo interno, bloquear todo (cerrado) o dejar pasar todo (abierto). |
| **FinOps** | Disciplina de gestión y optimización del gasto en servicios de nube, aplicada aquí al gasto en IA. |
| **Grafo** | Estructura de nodos unidos por aristas. |
| **Grafo de autorización** | En Unburn, el grafo de permisos que relaciona agentes, herramientas y categorías de datos. Es una de las dos partes del grafo de contexto. |
| **Grafo de contexto** | Registro de las trazas de decisiones: qué se hizo, quién lo encargó y por qué se decidió así. En Unburn lo forman el grafo de sesión y el grafo de autorización. |
| **Grafo de sesión** | En Unburn, la traza de decisiones de una tarea: sus llamadas, qué llamada usó el resultado de cuál, qué agente encargó qué y qué decidió Unburn en cada paso y por qué. Se conserva en los eventos de auditoría durante la retención del plan. |
| **Herramienta (*tool*)** | Función que un agente puede ejecutar, como consultar una base de datos. |
| **Herramienta del proveedor** | Herramienta que ejecuta el propio proveedor de IA en sus servidores, dentro de la misma respuesta (por ejemplo, búsqueda web o un conector MCP remoto). |
| **Hipervisor** | Software que crea y gestiona las máquinas virtuales en un servidor. En la nube lo controla el proveedor de nube. |
| **HMAC** | Forma de calcular huellas usando una clave secreta, para que nadie sin la clave pueda calcular la misma huella. |
| **Huella (*hash*)** | Código corto calculado a partir de un contenido. Permite saber si dos contenidos son idénticos sin guardarlos, y no permite reconstruir el original. |
| **Inyección de instrucciones (*prompt injection*)** | Ataque que mete instrucciones maliciosas en un texto que lee el modelo para que haga algo indebido. |
| **Latencia** | Tiempo de espera o retraso. |
| **Límite blando / duro** | Umbral de presupuesto que avisa (blando) o que corta (duro). |
| **Línea base** | El comportamiento normal de consumo de una clave, sesión o usuario, con el que se comparan los valores actuales. |
| **LLM (modelo de lenguaje)** | Modelo de IA que genera texto, como GPT o Claude. |
| **MCP (Model Context Protocol)** | Estándar abierto para que los agentes usen herramientas y datos externos. |
| **Mínimo privilegio** | Principio de dar a cada componente solo los permisos imprescindibles. |
| **Modo cumplimiento** (*S3 Object Lock*) | Modo de bloqueo de Amazon S3 en el que nadie, ni siquiera el administrador principal de la cuenta, puede modificar ni borrar un objeto hasta que vence su plazo. |
| **MVP** | Producto mínimo viable: la primera versión con lo esencial. |
| **Nodo** | En un grafo, cada punto o entidad. |
| **Operación atómica** | Operación que se ejecuta entera o no se ejecuta, sin que otra pueda colarse en medio. |
| **Petición** | Cada mensaje que una aplicación envía a la API de un modelo. |
| **Petición facturable** | Petición de generación (*Chat Completions*, *Responses API* o *Messages*) que Unburn reenvía al proveedor (o, en la arquitectura objetivo, responde desde la caché). Es lo que cuenta para la cuota del plan. |
| **Proxy** | Servidor intermediario por el que pasa el tráfico. |
| **Rechazo barato** | En Unburn, rechazar directamente con 402, durante unos segundos y sin hacer más trabajo, las peticiones de una clave que ya ha gastado su presupuesto o se ha quedado sin cuota. |
| **Reservar y liquidar** | Patrón que aparta el coste máximo antes de la petición y ajusta al coste real al terminar. |
| **Responsable del tratamiento** | En el RGPD, quien decide para qué y cómo se tratan los datos personales. Para el tráfico de IA es el cliente; para las cuentas y la facturación, Unburn. |
| ***Responses API*** | La API de OpenAI recomendada para proyectos nuevos. Puede guardar el historial de la conversación en OpenAI y ejecutar herramientas integradas. |
| **RGPD** | Reglamento General de Protección de Datos de la UE. |
| **Rotación de claves** | Sustituir una clave virtual por otra nueva que hereda su configuración y pasa a ser la propietaria de sus conversaciones, revocando la antigua. |
| **SaaS** | Software como servicio: se usa por internet pagando una suscripción. |
| **SBOM** | Lista de todos los componentes de software que incluye un producto, con sus versiones. |
| **Sello de auditoría** | En Unburn, resumen firmado de cómo estaban, en un momento dado, todas las cadenas de auditoría con eventos nuevos, guardado en S3 en modo cumplimiento, donde nadie puede modificarlo. Permite demostrar que el registro no se ha manipulado. |
| **Sesión** | Conjunto de peticiones que forman una misma tarea de uno o varios agentes. |
| **Seudónimo** | Identificador que no revela directamente quién es una persona. |
| **Sistema multiagente** | Varios agentes de IA que colaboran. |
| **SLA** | Acuerdo de nivel de servicio: compromiso contractual de disponibilidad y tiempos. |
| **SLO** | Objetivo de nivel de servicio: meta interna medible, como disponibilidad o latencia, que guía al equipo. |
| **Sobrepaso acotado** | En Unburn, la garantía de que el presupuesto solo puede superarse por causas limitadas, pequeñas y registradas, nunca por peticiones simultáneas. |
| **Streaming** | Envío de la respuesta a trozos, según se genera. |
| **TEE** | Entorno de ejecución confiable: zona protegida por el procesador para procesar datos sin que se puedan leer desde fuera. |
| **TLS / HTTPS** | Protocolo que cifra las comunicaciones por internet. |
| **TOGAF** | Marco de arquitectura empresarial. Organiza la arquitectura en dominios: negocio, datos, aplicación y tecnología. |
| **Token** | Unidad de texto con la que los modelos miden y cobran el trabajo. Puede ser de entrada, de salida o de razonamiento. |
| **Traza de decisiones** | Registro de por qué se tomó cada decisión: qué regla se aplicó, con qué información y quién la aprobó. |
| **Webhook** | Mensaje automático que un sistema envía a otro (por ejemplo, a Slack) cuando ocurre algo. |
| **Zona de disponibilidad** | Centro de datos independiente dentro de una región de nube. |

---

## 12. Registro de decisiones

Decisiones tomadas por el equipo. No deben cambiarse sin acordarlo y actualizar este documento.

| # | Decisión | Motivo |
|---|---|---|
| D1 | En las entregas se incluye todo (MVP y arquitectura objetivo). En la implementación técnica del MVP, solo el MVP. En caso de duda, se incluye todo. | El profesor quiere el planteamiento de una empresa real. TOGAF distingue entre arquitectura objetivo y de transición. |
| D2 | Clientes: desarrolladores individuales, startups, PYMES y grandes empresas que usan agentes de IA. | Modelo de suscripción válido para todos; las grandes empresas, con contrato personalizado. |
| D3 | Diferenciación: análisis de caminos indirectos, detección y diagnóstico causal de bucles, grafo de contexto con el porqué de cada decisión, sistema inmunológico y la combinación de FinOps y seguridad de agentes en un producto de autoservicio para startups y PYMES. Claves virtuales, presupuestos y permisos de herramientas por agente son funciones base. La ventaja por segmento no está libre de competencia. | En 2026 los gateways y las plataformas de seguridad de agentes ya ofrecen las funciones base, varios han sido comprados por grandes fabricantes y alguno de ellos (Proofpoint) también llega a las PYMES. |
| D4 | Siete tecnologías emergentes: AI Agents, Multiagent Systems, MCP, Context Graphs, Causal AI, Digital Immune System y Confidential Computing. No se añaden más. | Proyecto acotado. |
| D5 | Suscripción por peticiones facturables: Gratis (corte al agotar la cuota), Pro (excedente con tope) y Enterprise (contrato). Las cifras son ejemplos. | Simplicidad y modelo habitual del sector. |
| D6 | Solo cuentan para la cuota las peticiones de generación que Unburn reenvía al proveedor. Las auxiliares (modelos, contar tokens, consultar respuestas) y las rechazadas antes de llegar al proveedor (400, 402, 403, 422, 429, clave inválida) no cuentan. Las peticiones de claves cuyo gasto ya alcanzó el límite, o sin cuota, se rechazan por un camino barato (402 recordado unos segundos en memoria, sin contar reservas). Los volúmenes abusivos se frenan con 429: por dirección IP en el WAF y por clave virtual en el gateway. | Evitar que un atacante agote la cuota del cliente con peticiones rechazadas, sin que esas peticiones le cuesten demasiado a Unburn, sin convertir un problema de presupuesto en un error "temporal" y sin que el WAF tenga que manejar claves. |
| D7 | Núcleo regional en AWS Europa (Irlanda), dos zonas, contenedores en ECS con Fargate. Se descarta el edge. | Los presupuestos necesitan un contador central. Irlanda es una de las dos regiones con máquinas confidenciales en servidores compartidos, la opción más económica para la arquitectura objetivo. |
| D8 | Lenguaje Go para el gateway y los servicios; React con TypeScript para el panel. | Rapidez de desarrollo y adecuación a proxies de red. |
| D9 | Proveedores en el MVP: OpenAI (*Chat Completions* y *Responses API*) y Anthropic (*Messages*) en su formato nativo. Gemini y el cambio automático entre proveedores, en la arquitectura objetivo. | OpenAI recomienda la *Responses API* para proyectos nuevos, algunos modelos solo están ahí y frameworks como el OpenAI Agents SDK la usan por defecto. Traducir entre proveedores es mucho trabajo. |
| D10 | Ante fallos internos, bloquear por defecto, configurable por clave. Disponibilidad objetivo: 99,9%. | El valor principal es la protección; 99,99% no sería realista. |
| D11 | Presupuestos de dos niveles (organización → clave virtual), diarios y mensuales, blandos y duros. La reserva incluye todas las dimensiones de precio, también la entrada adicional que provocan las herramientas del proveedor. Las reservas se renuevan mientras dura la petición; las que vencen se convierten en gasto estimado, y ningún gasto queda sin contar aunque se pierda una reserva. Error 402 al agotarse el presupuesto, la cuota o el tope de excedente; el 429 se reserva para el exceso de velocidad. Garantía de sobrepaso acotado, no de sobrepaso cero. | El 429 se reintenta solo y daría a entender un problema temporal. Es preferible contar de más que dejar sin contar algo que el proveedor cobró. Las únicas garantías que se pueden cumplir son las acotadas. |
| D12 | Bucles: detección por reglas en el MVP, modo aviso por defecto. La IA causal se usa para el diagnóstico (grafo causal, causa raíz, coste del bucle y cota superior del coste atribuible, siempre con su hipótesis), no para la detección. Solo hay ahorro cuando Unburn detiene algo, con hipótesis visible. La medición del efecto de las intervenciones exige asignación al azar. | Evitar falsos positivos, usar la IA causal de forma correcta y no atribuirse ahorros ni costes que no existen. |
| D13 | Control de las herramientas que ejecuta el proveedor (denegadas por defecto, con usos y tamaño de resultados limitados cuando el proveedor lo permite) en **todos los planes**. Escudo MCP básico en Pro y Enterprise: filtra las herramientas del cliente en petición y respuesta, con grafo de autorización y caminos indirectos. Proxy MCP completo en la arquitectura objetivo. | El presupuesto depende de acotar las herramientas del proveedor; lo que ejecuta el proveedor solo se puede controlar antes de enviarlo; lo que no pasa por Unburn no se puede controlar sin un proxy MCP. |
| D14 | Caché semántica opcional y desactivada por defecto, solo en la arquitectura objetivo. | Choca con la promesa de no guardar contenido. |
| D15 | El cambio de modelo es opcional, lo configura el cliente y se indica en una cabecera. No se nombran modelos concretos en la documentación. | Cambiar el modelo en silencio puede romper la aplicación del cliente; los nombres de modelos caducan pronto. |
| D16 | Enterprise: Unburn Cloud Confidencial (TLS terminado dentro de la máquina, atestación vinculada al canal, verificación del firmware) como modalidad principal y despliegue privado como alternativa, ambos en la arquitectura objetivo. La cadena de arranque medido sin depender de AWS queda como **punto abierto** que hay que verificar; si no es posible, se rebaja la promesa frente a AWS. | Mantener la computación confidencial con promesas honestas y cubrir a quien no puede usar una nube externa. |
| D17 | Almacenamiento de Unburn solo en la UE, sin guardar el texto por defecto, retención por plan (Enterprise: 6 meses o más). Unburn es encargado del tratamiento para el tráfico de IA y responsable para sus cuentas y facturación. Tras la baja se borra todo en 30 días salvo facturas (plazos legales), agregados (hasta cerrar la última factura) y sellos de auditoría en S3 (sin datos personales; bloqueados el mínimo necesario). | RGPD, minimización de datos, obligación de conservación del AI Act y obligaciones fiscales y mercantiles. |
| D18 | El dominio no forma parte del planteamiento; los ejemplos usan direcciones ficticias. | No aporta a la idea. |
| D19 | Integración con n8n cambiando la dirección base, sin alianza formal. Socios: canal de venta, ecosistema e infraestructura. | Funciona sin acuerdos; las alianzas se plantean como propuestas. |
| D20 | El README es la fuente única de contexto, escrita para personas con conocimientos básicos de informática y para IAs. | Se comparte con el equipo y se usa como contexto en cualquier tarea del proyecto. |
| D21 | Identidad de agentes según la clave: sin lista de agentes, la clave es la identidad (permisos por clave); con un agente, la clave identifica al agente; con varios, la cabecera es obligatoria y se confía en ella entre los permitidos. Se recomienda una clave por agente. La identidad con credenciales firmadas queda para la arquitectura objetivo. | Una cabecera declarada no basta para aplicar permisos por agente de forma fiable, y hay herramientas (como algunas configuraciones de n8n) que no permiten añadir cabeceras. |
| D22 | Registro de auditoría que no se pierde aunque se caiga el gateway (cada registro se guarda junto con su cambio de gasto y viaja por una cola SQS con reintentos), con los eventos de cada organización encadenados por huellas y un único sello firmado con KMS cada pocos minutos para todas las cadenas, guardado en S3 en modo cumplimiento. Agregados de gasto por intervalos de 15 minutos, independientes de la retención. Cada evento guarda sus dependencias, su decisión, la regla que la justificó y la versión de la configuración. | Que ningún registro se pierda si el gateway se cae; que el registro sea verificable aunque alguien pueda escribir en la base de datos; que la retención no impida reconstruir contadores en cualquier zona horaria; y que el grafo de contexto se conserve durante la retención. |
| D23 | El grafo de contexto es, ante todo, la traza de decisiones (grafo de sesión); el grafo de permisos se llama grafo de autorización y es su complemento. | Es el significado dominante del término desde finales de 2025. |
| D24 | El sistema inmunológico digital se aplica al tráfico del cliente y a la propia plataforma: observabilidad, autorreparación, SRE y cadena de suministro en el MVP; ingeniería del caos y pruebas con IA en la arquitectura objetivo. | Cubrir las seis prácticas de la definición de Gartner y no quedarse en un limitador de velocidad. |
| D25 | En las entregas de TOGAF se presentan, por cada dominio, la arquitectura de partida, la objetivo y las brechas (sección 8). "Dominio" y "capa" son sinónimos en este documento. | Es lo que pide TOGAF; "capa" es la palabra que usan el profesor y ArchiMate. |
| D26 | Se tienen en cuenta el Data Act (cambio de proveedor) para el SaaS y el Cyber Resilience Act para el despliegue privado. | Son obligaciones aplicables a este tipo de producto. |
| D27 | El MVP solo admite generar con *Chat Completions*, *Responses API* (sin modo en segundo plano ni conversaciones guardadas) y *Messages*, más algunas funciones auxiliares (5.3). Dentro de cada API, solo se admiten las opciones de una lista asociada a la tabla de precios. Se rechazan con 403 el resto de APIs y opciones, los archivos y documentos, y las referencias a respuestas de otra clave o creadas fuera de Unburn. Las imágenes por URL se reservan por su máximo. La cuenta o el proyecto del proveedor al que se carga cada petición lo fija siempre Unburn. | Sin estas reglas no se puede garantizar que la reserva sea el peor caso, ni impedir que un equipo lea las conversaciones de otro o cargue su gasto a otro proyecto. El resto se irá añadiendo en la arquitectura objetivo. |
| D28 | Tiempos de espera amplios: hasta 15 minutos hasta que empieza a llegar contenido, 5 minutos de silencio a mitad de la respuesta y 30 minutos en total. El balanceador y los despliegues se configuran para no cortar estas peticiones. Todas las cifras son ejemplos. | Los modelos que razonan pueden tardar mucho en producir contenido, y los despliegues no deben cortar peticiones en curso. |
| D29 | Las claves virtuales se pueden rotar: la nueva hereda la configuración y pasa a ser la propietaria de las conversaciones de la revocada, de modo que funciona tras cualquier número de rotaciones. | Revocar una clave filtrada no debe romper las conversaciones en curso del agente. |
| D30 | El README describe la arquitectura (qué hace cada pieza, qué garantiza y con qué tecnología), no la programación. Los detalles de implementación los decide quien implemente el MVP, respetando las garantías del documento. | El documento es para personas con conocimientos básicos de informática y para las entregas de TOGAF; el diseño a bajo nivel forma parte de programar el MVP. |
