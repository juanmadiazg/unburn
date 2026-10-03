# Unburn: documento de contexto del proyecto

> **Versión:** octubre de 2026.
> **Qué es esto:** el planteamiento completo de **Unburn**, una startup ficticia creada para una asignatura universitaria. El profesor pide entregas siguiendo las cuatro capas de arquitectura de **TOGAF**: negocio, datos, aplicación y tecnología.
> **Estado del proyecto:** idea desde cero. No existe todavía ningún código.

---

## 0. Cómo usar este documento

### 0.1. Para qué sirve

Este README es la **fuente única de contexto** del proyecto. Está pensado para:

- **Los miembros del equipo**, con conocimientos básicos de informática.
- **Cualquier IA** a la que se le pase este documento para ayudar con el proyecto (redactar entregas, diseñar diagramas, programar el MVP, etc.).

Si algo que diga una persona o una IA contradice este documento, **manda este documento**, salvo que se actualice explícitamente. Las decisiones ya tomadas están en la sección 12 ("Registro de decisiones") y no deben reabrirse sin acordarlo con el equipo.

### 0.2. Regla de uso (MUY IMPORTANTE)

> **Regla de uso del documento:**
> - **Entregas al profesor** (TOGAF, presentaciones, memorias o cualquier documento que describa la empresa): se incluye **TODO**, tanto lo marcado como **[Fase 1 – MVP]** como lo marcado como **[Arquitectura objetivo]**.
> - **Implementación técnica del MVP** (programar, elegir qué construir, preparar una demo o pruebas): se usa **SOLO** lo marcado como **[Fase 1 – MVP]**.
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

- **Todas las cifras** (precios, límites, porcentajes, tiempos) son **estimaciones de ejemplo**, marcadas como *(ejemplo)*. Sirven para ilustrar, no son datos reales ni compromisos.
- **No se nombran modelos de IA concretos** (como versiones de GPT o Claude), porque cambian cada pocos meses. Se habla de "modelo caro" y "modelo económico".
- **Los dominios y claves de los ejemplos son ficticios**, por ejemplo `api.unburn.example` o `ub_live_marketing_123`.
- **Los datos de mercado, competencia y normativa** reflejan la situación a **octubre de 2026** y pueden quedar desactualizados.
- **Las referencias legales son orientativas.** Este documento no es asesoramiento jurídico.

### 0.5. Mapa del documento

| Sección | Contenido | Capa TOGAF |
|---|---|---|
| 1 | Resumen en una página | Visión de arquitectura |
| 2 | Conceptos básicos para entender el proyecto | (apoyo) |
| 3 | Capa de negocio | Arquitectura de negocio |
| 4 | Capa de datos | Arquitectura de datos |
| 5 | Capa de aplicación | Arquitectura de aplicación |
| 6 | Capa tecnológica | Arquitectura tecnológica |
| 7 | Tecnologías emergentes | (transversal) |
| 8 | Hoja de ruta | Oportunidades, soluciones y planificación de la migración |
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

- **Funciones base** (lo mínimo que espera el mercado): claves virtuales por equipo, presupuestos que cortan el gasto en tiempo real, límites de tamaño de respuesta, alertas y registro de auditoría.
- **Funciones diferenciales** (lo que nos distingue):
  - **Control de agentes:** detecta bucles por sesión de agentes y diagnostica qué agente y qué paso los causaron, usando **IA causal**.
  - **Escudo MCP:** limita qué herramientas y qué categorías de datos puede usar cada agente, usando **grafos de contexto**.
  - **Sistema inmunológico digital:** detecta consumos anómalos y responde de forma gradual, sin tumbar todo el servicio.
  - **Nube confidencial para grandes empresas** **[Arquitectura objetivo]**: procesamiento protegido por hardware mediante **computación confidencial**.

**Para quién.** Desarrolladores individuales, startups, PYMES y grandes empresas que usan agentes de IA.

**Cómo gana dinero.** Suscripción mensual según el número de peticiones procesadas, con un plan gratuito limitado, un plan Pro y contratos personalizados (Enterprise) para grandes empresas.

**Tecnologías emergentes del proyecto (7):** Sistemas Multiagente, Agentes de IA, Model Context Protocol (MCP), Context Graphs, Causal AI, Digital Immune System y Confidential Computing. Están explicadas en la sección 7.

**Dónde está alojado.** En la nube de AWS, en una región de la Unión Europea (Irlanda).

---

## 2. Conceptos básicos para entender el proyecto

Estos conceptos aparecen en todo el documento. Hay más en el glosario (sección 11).

- **Modelo de lenguaje (LLM):** una IA que recibe texto y genera texto, como los modelos de OpenAI (GPT) o Anthropic (Claude). Las empresas los usan a través de internet pagando por uso.
- **API:** la "puerta" por la que un programa habla con otro. Por ejemplo, una aplicación envía una pregunta a la API de OpenAI y recibe la respuesta.
- **Petición:** cada mensaje que una aplicación envía a la API de un modelo. Una conversación con un agente suele implicar muchas peticiones.
- **Token:** el trozo de texto con el que los modelos miden y cobran el trabajo (aproximadamente una palabra corta o parte de una palabra). Los proveedores cobran por **tokens de entrada** (lo que se envía) y **tokens de salida** (lo que el modelo genera). Algunos modelos también "piensan" internamente antes de responder (**tokens de razonamiento**). Esos tokens no se ven, pero se cobran como salida.
- **Clave de API (clave real):** la contraseña que da el proveedor (OpenAI, Anthropic) para usar su API. Quien la tiene puede gastar dinero de la empresa.
- **Agente de IA:** un programa que usa un modelo de IA para decidir qué hacer y actuar por su cuenta, por ejemplo buscando información o ejecutando acciones.
- **Herramienta (tool):** una función que un agente puede usar, como `buscar_cliente` o `crear_ticket`. El modelo decide cuándo usarla y el programa del agente la ejecuta.
- **Sistema multiagente:** varios agentes que colaboran y se pasan tareas entre sí. Por ejemplo, un agente planificador, un programador y un auditor.
- **MCP (Model Context Protocol):** un estándar abierto que define cómo los agentes descubren y usan herramientas y datos externos (bases de datos, archivos, servicios).
- **Proxy o gateway (pasarela):** un servidor intermediario por el que pasa el tráfico. Unburn es un gateway especializado en IA.
- **Streaming:** forma de recibir la respuesta del modelo a trozos, conforme se genera, en lugar de esperar al final.
- **Sesión:** el conjunto de peticiones que forman una misma tarea de uno o varios agentes. Por ejemplo, "resolver la incidencia 8812".

---

## 3. Capa de negocio

> **Regla de uso:** en las entregas se incluye todo, tanto [Fase 1 – MVP] como [Arquitectura objetivo]. Para implementar el MVP, solo [Fase 1 – MVP].

### 3.1. Situación actual del cliente (arquitectura de partida)

En TOGAF, la **arquitectura de partida** (*baseline*) describe cómo están las cosas hoy. Como Unburn todavía no existe, la arquitectura de partida es **la situación actual de nuestros clientes**:

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
| Bucles de agentes | Detección de bucles por sesión y diagnóstico causal (qué agente y qué paso lo provocó) | [Fase 1 – MVP] (versión básica) y [Arquitectura objetivo] (versión avanzada) |
| Abuso externo | **Sistema inmunológico digital**: detecta consumo anómalo y frena solo la parte afectada | [Fase 1 – MVP] |
| Control y atribución | **Claves virtuales** por equipo o agente, revocables una a una | [Fase 1 – MVP] |
| Riesgo MCP | **Escudo MCP** con grafo de contexto: cada agente solo ve y usa las herramientas permitidas | [Fase 1 – MVP] (versión básica) y [Arquitectura objetivo] (proxy MCP completo) |
| Trazabilidad | **Registro de auditoría** con metadatos de cada petición, sin guardar el texto | [Fase 1 – MVP] |
| Privacidad máxima (grandes empresas) | **Unburn Cloud Confidencial** (computación confidencial) o **despliegue privado** | [Arquitectura objetivo] |

**Funciones base frente a funciones diferenciales.** Las claves virtuales y los presupuestos son la **base**: sin ellas el producto no sería creíble, pero la competencia ya las ofrece. Lo que **diferencia** a Unburn es el foco en los **sistemas multiagente** y en **MCP**: control por sesión de agentes, diagnóstico causal de bucles, grafo de contexto por agente y sistema inmunológico.

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
4. **Seguridad de herramientas (MCP):** grafo de contexto, permisos por agente y análisis de caminos indirectos.
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
5. El desarrollador cambia la **dirección** y la **clave** en su código y añade las **cabeceras de sesión y agente** (ver 5.3).

**Proceso 2. Atención de peticiones (operación diaria).** Cada petición pasa por Unburn, que la comprueba, la reenvía al proveedor, devuelve la respuesta y registra los metadatos. El detalle está en 5.4.

**Proceso 3. Gestión de incidentes.** Cuando Unburn detecta un bucle, un consumo anómalo o un presupuesto agotado:
1. Aplica la respuesta configurada (avisar, frenar, cambiar de modelo o cortar).
2. Envía una alerta (email, Slack, Microsoft Teams o un webhook).
3. Muestra en el panel el diagnóstico (causa probable y ahorro estimado).
4. El administrador revisa el incidente y ajusta la configuración si hace falta.

**Proceso 4. Facturación de la suscripción.** Unburn cuenta las peticiones procesadas de cada cliente, aplica su plan, cobra mensualmente mediante una pasarela de pagos y avisa al 80% y al 100% de la cuota.

**Proceso 5. Venta Enterprise** **[Arquitectura objetivo]**. Venta consultiva para grandes empresas: demostración, revisión de seguridad, contrato personalizado (precio, garantías de disponibilidad, soporte, retención de datos) y elección entre nube confidencial o despliegue privado.

### 3.7. Modelo de ingresos y planes

**Hay dos contadores distintos que no hay que confundir:**

| Contador | Qué mide | Quién cobra |
|---|---|---|
| **Cuota de peticiones** | Cuántas peticiones procesa Unburn para el cliente cada mes | **Unburn** (es nuestra suscripción) |
| **Presupuesto de IA** | Cuántos euros gasta el cliente en OpenAI o Anthropic | **El proveedor de IA**. Unburn solo lo **controla**; ese dinero no es nuestro. |

**Planes** (todas las cifras son *ejemplos*):

| | Gratis | Pro | Enterprise **[Arquitectura objetivo]** |
|---|---|---|---|
| Precio | 0 € | 49 €/mes *(ejemplo)* | Contrato personalizado |
| Peticiones incluidas al mes | 10.000 *(ejemplo)* | 500.000 *(ejemplo)* | Negociadas |
| Si se supera la cuota | Se corta el servicio hasta el mes siguiente o hasta que mejore de plan | Excedente: 8 € por cada bloque de 100.000 peticiones o fracción *(ejemplo)*, con un tope de gasto que fija el cliente | Negociado |
| Claves virtuales | Hasta 3 *(ejemplo)* | Ilimitadas | Ilimitadas |
| Presupuestos, límites de respuesta, detección de bucles | Sí | Sí | Sí |
| Escudo MCP, sistema inmunológico, diagnóstico causal, cambio de modelo | No | Sí | Sí |
| Alertas | Email | Email, Slack, Teams, webhooks | Todas |
| Retención del registro de auditoría | 7 días *(ejemplo)* | 30 días *(ejemplo)* | Configurable |
| Nube confidencial o despliegue privado, garantías contractuales de disponibilidad (SLA), soporte dedicado | No | No | Sí |

**Ejemplo de cálculo** *(ejemplo)*: un cliente Pro que procesa 650.000 peticiones en un mes paga 49 € más 2 bloques de excedente (150.000 peticiones = 1,5 bloques, redondeado a 2), es decir, 49 + 16 = **65 €**.

**Qué cuenta como "petición procesada":**
- **Cuentan:** todas las peticiones que Unburn analiza, incluidas las que bloquea por presupuesto, por bucle o por permisos MCP. Todas consumen recursos de Unburn.
- **No cuentan:**
  - Las peticiones con una clave virtual inválida.
  - Las rechazadas porque la cuota del plan ya está agotada.
  - Las frenadas en la entrada por el sistema inmunológico (error 429, ver 5.8). Si contaran, un atacante podría agotar la cuota del cliente a propósito y dejar su servicio sin funcionar.

**Qué pasa al agotar la cuota del plan gratuito:** Unburn devuelve un error (402) y **la IA del cliente deja de funcionar** hasta que empiece el mes siguiente o mejore de plan, porque todo su tráfico de IA pasa por Unburn. Se avisa por email al 80% y al 100%.

### 3.8. Estrategia de crecimiento

**Crecimiento guiado por el producto (*Product-Led Growth*).** El producto se vende solo a través de su uso, sin depender de largos procesos de venta:
1. El **plan gratuito** atrae a desarrolladores que quieren proteger sus proyectos personales.
2. Si les resulta útil, lo proponen en las empresas donde trabajan (se convierten en "campeones internos").
3. La empresa pasa al plan Pro y, si es grande, a Enterprise.

**El ahorro como gancho.** El panel muestra el impacto en euros, por ejemplo: *"Hoy se han detectado 2 bucles y se han frenado 3 picos de tráfico anómalo. Ahorro estimado: entre 60 y 90 €"* *(ejemplo)*. El ahorro es siempre una **estimación**, no una medida exacta, porque calcula lo que **habría** pasado sin Unburn. Por eso se muestra como un rango (ver 5.6).

**Retención por valor, no por encierro.** Los clientes se quedan porque el producto les resulta útil (historial de gasto, configuración de agentes, alertas, auditoría), no porque sea difícil irse. Unburn permite **exportar** el registro de auditoría y la configuración en cualquier momento. Esto además es obligatorio para clientes del sector financiero bajo DORA, que exige poder cambiar de proveedor (ver 3.11).

### 3.9. Socios clave

Son propuestas del plan de negocio, **no acuerdos existentes**.

| Tipo de socio | Ejemplos | Qué aportan | Qué reciben |
|---|---|---|---|
| **Canal de venta** | Agencias de automatización e integradores que montan agentes y flujos de n8n para PYMES | Llevan Unburn a sus clientes | Comisión por cliente referido |
| **Ecosistema** | Frameworks de agentes y plataformas de automatización (n8n, LangChain, CrewAI…) | Visibilidad: Unburn aparece en sus guías de integración | Una integración útil para sus usuarios |
| **Infraestructura** | AWS (alojamiento) y su *marketplace* | Infraestructura y un canal de compra para grandes empresas, que a menudo prefieren comprar a través de su nube | Consumo de infraestructura |

**Nota sobre n8n:** no hace falta ninguna alianza para funcionar con n8n. Sus nodos de OpenAI permiten cambiar la dirección base, así que basta con apuntarlos a Unburn. Publicar un nodo propio verificado en n8n es una mejora futura **[Arquitectura objetivo]**.

### 3.10. Competencia y diferenciación

| Alternativa | Qué ofrece | Qué aporta Unburn |
|---|---|---|
| **Límites nativos de los proveedores** (OpenAI, Anthropic) | Límites de gasto y claves por proyecto o espacio de trabajo, cada proveedor por separado | Una sola consola para varios proveedores; control por sesión y por agente; detección de bucles; escudo MCP |
| **Gateways de IA** (LiteLLM, Portkey, Bifrost, Kong AI Gateway, Cloudflare AI Gateway…) | Claves virtuales, presupuestos, caché, cambio entre proveedores; varios ya incluyen funciones para MCP | Diagnóstico causal de bucles por sesión de agentes; grafo de contexto con categorías de datos y detección de caminos indirectos entre agentes; sistema inmunológico con respuesta gradual; nube confidencial con atestación **[Arquitectura objetivo]** |
| **API gateways tradicionales** (sin módulos de IA) | Enrutar y limitar tráfico web | Entiende tokens, costes, modelos, agentes y herramientas |

**Nota honesta:**
- Las funciones base (claves virtuales, presupuestos, caché) **no nos diferencian**: son lo mínimo que el mercado espera.
- La diferenciación está en el **foco en sistemas multiagente y MCP** y en **cómo** se resuelven esos problemas.
- Este mercado cambia muy rápido. La comparación refleja la situación de octubre de 2026 y debe revisarse antes de cada entrega.
- Unburn **no sustituye** a los límites nativos de los proveedores. Se recomienda mantenerlos como segunda barrera de seguridad.

### 3.11. Marco normativo

> No es asesoramiento jurídico. Antes de usar este planteamiento comercialmente, debería revisarlo un abogado.

- **RGPD (protección de datos):**
  - El **cliente** es el **responsable del tratamiento**: decide qué datos se procesan y para qué.
  - **Unburn** es **encargado del tratamiento**, porque el contenido de las peticiones pasa por sus servidores aunque no lo guarde. Necesita un **contrato de encargo** con cada cliente (artículo 28 del RGPD) y una lista de sus propios subcontratistas: AWS para el alojamiento en la UE, la pasarela de pagos y el servicio de email.
  - El **proveedor de IA** lo contrata el cliente directamente con su propia clave real. Unburn solo transmite las peticiones siguiendo las instrucciones del cliente.
  - Las **direcciones IP** y los **identificadores de usuario final** son datos personales. Por eso Unburn recomienda enviar identificadores seudonimizados (ver 4.7).
- **Reglamento Europeo de IA (AI Act):** exige distintos niveles de documentación y trazabilidad según el riesgo de cada sistema de IA. El registro de auditoría de Unburn ayuda a sus clientes a cumplirlo. En mayo de 2026, el Consejo y el Parlamento Europeo alcanzaron un acuerdo provisional para aplazar las obligaciones de los sistemas de alto riesgo: hasta diciembre de 2027 para los sistemas independientes y hasta agosto de 2028 para los integrados en productos regulados. Conviene comprobar si ya está aprobado formalmente antes de citarlo en una entrega.
- **DORA** (resiliencia digital del sector financiero, aplicable desde enero de 2025): para un banco o aseguradora, Unburn sería un **proveedor externo de servicios tecnológicos**. Los contratos con esos clientes deben incluir derechos de auditoría, garantías de continuidad y una **estrategia de salida** (poder irse llevándose sus datos). Por eso los contratos Enterprise incluyen exportación completa de datos.

### 3.12. Origen del nombre

En el mundo de las startups, ***burn rate*** (tasa de quema) es la velocidad a la que una empresa gasta su dinero. **"Unburn"** significa "dejar de quemar dinero". Es un nombre directo que conecta con la principal preocupación de fundadores y directores técnicos: que la IA no se coma su presupuesto.

---

## 4. Capa de datos

> **Regla de uso:** en las entregas se incluye todo, tanto [Fase 1 – MVP] como [Arquitectura objetivo]. Para implementar el MVP, solo [Fase 1 – MVP].

### 4.1. Principios

1. **Minimización:** por defecto, Unburn **no guarda el texto** de las peticiones ni de las respuestas. Solo pasa por su memoria mientras se procesa. Se guardan metadatos (quién, cuándo, cuánto costó, qué se decidió y por qué).
2. **Todo en la UE:** todos los datos se alojan en una región de AWS de la Unión Europea (Irlanda).
3. **Cifrado siempre:** en tránsito (HTTPS/TLS) y en reposo (bases de datos cifradas). Las claves reales de los proveedores, además, con cifrado específico (ver 4.6).
4. **Retención limitada:** los registros se borran pasado un plazo que depende del plan (ver 4.7).
5. **El cliente es dueño de sus datos:** puede exportarlos en cualquier momento.

### 4.2. Entidades de datos

Estas son las "cosas" sobre las que Unburn guarda información. La columna "Dónde" se explica en 4.4.

| Entidad | Qué representa | Datos principales | Dónde | Fase |
|---|---|---|---|---|
| **Organización** | Una empresa o desarrollador cliente | Nombre, plan, zona horaria, política ante fallos | PostgreSQL | MVP |
| **Usuario del panel** | Una persona que entra al panel web | Email, rol (administrador o lector) | PostgreSQL | MVP |
| **Clave de proveedor** | La clave real de OpenAI o Anthropic del cliente | Proveedor, clave **cifrada**, fecha de alta | PostgreSQL (cifrada con KMS) | MVP |
| **Clave virtual** | Una clave de Unburn para un equipo, agente o entorno | Nombre, prefijo visible, **huella** de la clave (nunca la clave completa), estado (activa o revocada), clave de proveedor asociada, modelos permitidos, políticas (bucles, fallos, modelo sustituto) | PostgreSQL (copia rápida en Redis) | MVP |
| **Presupuesto** | Un límite de gasto en IA | Ámbito (organización o clave virtual), periodo (diario o mensual), límite blando (avisa), límite duro (corta) | PostgreSQL | MVP |
| **Contador de gasto** | Lo gastado y lo reservado en el periodo actual | Ámbito, periodo, euros gastados, euros reservados | Redis | MVP |
| **Reserva** | Dinero apartado temporalmente para una petición en curso | Identificador de petición, importe, ámbitos afectados, caducidad | Redis | MVP |
| **Tabla de precios** | Lo que cobra cada proveedor por cada modelo | Proveedor, modelo, precio por millón de tokens de entrada, salida y entrada en caché, fecha de vigencia | PostgreSQL | MVP |
| **Sesión** | Una tarea de uno o varios agentes | Identificador (lo envía el cliente), inicio, número de llamadas, coste acumulado, estado | Redis (activa) y PostgreSQL (resumen) | MVP |
| **Agente** | Un agente de IA del cliente | Nombre (lo envía el cliente), organización | PostgreSQL | MVP |
| **Grafo de sesión** | Las llamadas de una sesión y cómo se relacionan (base del diagnóstico causal) | Nodos: llamadas (agente, herramienta pedida, huella de argumentos, huella del resultado, coste). Aristas: "esta llamada provocó aquella" | Redis (mientras la sesión está activa) y PostgreSQL (solo si hubo incidente) | MVP |
| **Grafo de contexto** | Los permisos de herramientas y datos de cada agente | Nodos: agentes, herramientas, categorías de datos. Aristas: "puede usar", "accede a", "puede delegar en" | PostgreSQL (versión compilada en Redis) | MVP |
| **Catálogo de herramientas** | Las herramientas que Unburn ha visto usar a cada agente | Nombre de la herramienta, primera vez vista, agentes que la usan, categoría de datos asignada | PostgreSQL | MVP |
| **Línea base de consumo** | El consumo "normal" de cada clave, sesión o usuario final | Media y variabilidad de euros por minuto y tokens por minuto | Redis | MVP |
| **Evento de auditoría** | El registro de una petición | Ver 4.3 | PostgreSQL | MVP |
| **Incidente** | Un bucle, anomalía, presupuesto agotado o permiso denegado | Tipo, sesión, causa raíz, ahorro estimado (rango), respuesta aplicada, estado | PostgreSQL | MVP |
| **Canal de alertas** | A dónde se envían los avisos | Tipo (email, Slack, Teams, webhook), destino, umbrales | PostgreSQL | MVP |
| **Uso de la suscripción** | Peticiones consumidas del plan | Contador del mes, excedente, tope de excedente | Redis (contador) y PostgreSQL (cierre mensual) | MVP |
| **Entrada de caché semántica** | Una respuesta guardada para reutilizarla | Vector de la pregunta, respuesta, clave virtual, caducidad | Base de datos vectorial | Objetivo |

### 4.3. Qué se guarda y qué no

| Dato | ¿Se guarda? | Detalle |
|---|---|---|
| Texto de las peticiones (*prompts*) y de las respuestas | **No** | Solo pasa por la memoria del proxy mientras se procesa. Única excepción: la caché semántica, que es **opcional, viene desactivada** y solo existe en la arquitectura objetivo. |
| **Huellas** (*hashes*) del contenido nuevo de cada llamada (último mensaje, argumentos y resultado de herramientas) | Sí, **temporalmente** (24 horas *(ejemplo)*) y solo en Redis | Hacen falta para detectar bucles (ver 5.6). Una huella es un código corto calculado a partir del texto que **no permite reconstruirlo**: sirve para saber si dos textos son idénticos sin guardarlos. Se calcula con una clave secreta distinta para cada organización (técnica HMAC), para que nadie pueda adivinar textos cortos probando combinaciones. |
| Metadatos de cada petición | Sí | Fecha y hora, organización, clave virtual, sesión, agente, proveedor, modelo pedido y modelo usado, tokens (entrada, salida, razonamiento), coste estimado y real, latencia, decisión (permitida, bloqueada, frenada o con modelo sustituido) y motivo. |
| Nombres de herramientas y de agentes | Sí | Son nombres técnicos que define el cliente, como `buscar_cliente` o `agente-soporte`. |
| Dirección IP de origen | Sí | Normalmente es la del **servidor del cliente**, no la del usuario final. Es un dato personal y se trata como tal. |
| Identificador del usuario final | Solo si el cliente lo envía | Se recomienda enviar un **seudónimo** (un código que no revele quién es la persona), nunca un email o un nombre. |
| Clave real del proveedor | Sí, **cifrada** | Ver 4.6. Nadie puede volver a verla en claro desde el panel. |
| Clave virtual | Solo su **huella** y un prefijo visible | La clave completa se muestra **una sola vez** al crearla, como una contraseña. Si se pierde, se crea otra. |
| Datos de pago (tarjetas) | **No** | Los gestiona la pasarela de pagos. |

### 4.4. Dónde vive cada dato (almacenes)

| Almacén | Para qué | Tipo de dato | Fase |
|---|---|---|---|
| **Redis** (base de datos en memoria; en AWS se usa ElastiCache con Valkey, una versión compatible) | Lo que hay que leer y escribir en milisegundos en cada petición | Contadores, reservas, copia de claves virtuales y permisos, sesiones activas, huellas, líneas base | MVP |
| **PostgreSQL** (base de datos relacional) | Lo permanente. Es la **fuente de verdad** | Configuración, claves cifradas, presupuestos, grafos, auditoría, incidentes, facturación | MVP |
| **AWS KMS** (servicio de gestión de claves de cifrado) | Guardar la **llave maestra** que cifra las claves reales | La llave maestra nunca sale de KMS | MVP |
| **Amazon SQS** (cola de mensajes) | Transportar los eventos de auditoría sin frenar las peticiones | Eventos en tránsito, solo unos segundos | MVP |
| **Pasarela de pagos** (por ejemplo Stripe) | Cobrar las suscripciones | Datos de pago del cliente (no los guarda Unburn) | MVP |
| **Base de datos vectorial** | Caché semántica y detección semántica de bucles | Vectores numéricos y respuestas guardadas | Objetivo |

### 4.5. Flujo de los datos

```
Petición del cliente
   │
   ▼
Gateway (memoria del proxy) ──► el texto se procesa aquí y NO se guarda
   │
   ├──► Redis: contadores, reservas, huellas temporales, sesión activa
   │
   ├──► Proveedor de IA (OpenAI / Anthropic): recibe la petición completa
   │
   └──► Cola SQS ──► Servicio de auditoría ──► PostgreSQL (metadatos permanentes)
                                                    │
                                                    └──► Panel web, informes, exportación
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
| Enterprise | Configurable según contrato |

- **Huellas temporales:** 24 horas *(ejemplo)*.
- **Al darse de baja:** el cliente puede exportar sus datos, y después se borran en un plazo de 30 días *(ejemplo)*.
- **Datos personales tratados:** IP de origen, identificador seudónimo del usuario final (si se envía) y emails de los usuarios del panel. Se tratan conforme al RGPD (ver 3.11).

### 4.8. Integridad del registro de auditoría

Para que el registro sirva como prueba en una auditoría, tiene que ser fiable:

- **Entrega garantizada:** cada evento se envía a la cola SQS y el servicio de auditoría lo guarda en PostgreSQL. Si algo falla, el evento se reintenta. Cada evento tiene un identificador único, así que guardarlo dos veces no lo duplica.
- **Cadena de huellas:** cada evento guarda la huella del evento anterior, como los eslabones de una cadena. Si alguien modifica o borra un evento antiguo, la cadena se rompe y se detecta.

### 4.9. Qué pasa si se pierden los datos de Redis

Redis es rápido pero vive en memoria. Por eso:

- Tiene una **réplica** en otra zona del centro de datos.
- Si aun así se pierden los contadores, se **reconstruyen** sumando los costes del registro de auditoría en PostgreSQL. La pequeña parte que aún esté en la cola se procesa enseguida.
- Mientras se reconstruyen, se aplica la política ante fallos de cada clave (por defecto, bloquear; ver 5.11).

---

## 5. Capa de aplicación

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
│    5. Escudo MCP (grafo de contexto)                            │
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
| 2 | **Autenticación y cuota** | Comprueba la clave virtual y si queda cuota en el plan | MVP |
| 3 | **Normalizador** | Identifica proveedor y modelo, inyecta el límite de respuesta y estima los tokens | MVP |
| 4 | **Sistema inmunológico** | Detecta consumo anómalo y responde de forma gradual (5.8) | MVP |
| 5 | **Escudo MCP** | Aplica el grafo de contexto a las herramientas de cada agente (5.7) | MVP (básico); el **proxy MCP completo** es Objetivo |
| 6 | **Detector de bucles** | Detecta repeticiones por sesión de agentes con reglas (5.6) | MVP (reglas); la **detección semántica** es Objetivo |
| 7 | **Motor de presupuestos** | Reserva y liquida el gasto (5.5) | MVP |
| 8 | **Conectores de proveedores** | Hablan con cada proveedor en su formato propio | MVP: OpenAI (*Chat Completions*) y Anthropic (*Messages*). Objetivo: Google Gemini, la *Responses API* de OpenAI y el cambio automático entre proveedores |
| 9 | **Servicio de auditoría** | Recoge los eventos de la cola y los guarda en PostgreSQL | MVP |
| 10 | **Servicio de diagnóstico causal** | Analiza los incidentes: causa raíz y ahorro estimado (5.6) | MVP (causa raíz y ahorro simple); Objetivo (efecto de cada intervención y ahorro contrafactual) |
| 11 | **Servicio de alertas** | Envía avisos por email, Slack, Microsoft Teams o webhook | MVP |
| 12 | **Servicio de facturación** | Cuenta peticiones, aplica el plan y se conecta con la pasarela de pagos | MVP |
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
    api_key="ub_live_marketing_123",                  # clave virtual (ficticia)
)

respuesta = client.chat.completions.create(
    model="nombre-del-modelo",
    messages=[{"role": "user", "content": "Resume este informe"}],
    extra_headers={                       # cabeceras de Unburn (recomendadas)
        "X-Unburn-Session": "pedido-8812",
        "X-Unburn-Agent": "agente-auditor",
    },
)
```

*Después de Unburn (Anthropic, Python):*
```python
import anthropic

client = anthropic.Anthropic(
    base_url="https://api.unburn.example/anthropic",  # dirección de Unburn (ficticia)
    api_key="ub_live_marketing_123",                  # clave virtual (ficticia)
)
```

Unburn reconoce el proveedor por la ruta (`/openai/...` o `/anthropic/...`) y lee la clave virtual de la cabecera que usa cada librería: `Authorization` en OpenAI y `x-api-key` en Anthropic.

**Cabeceras propias de Unburn.** Son campos extra que viajan con cada petición. Sin ellas Unburn funciona, pero **solo ve peticiones sueltas**: no puede saber qué peticiones forman una misma tarea ni qué agente hizo cada una.

| Cabecera | ¿Obligatoria? | Para qué sirve | Si no se envía… |
|---|---|---|---|
| `X-Unburn-Session` | Recomendada | Agrupa las peticiones de una misma tarea | No hay detección de bucles por sesión ni diagnóstico causal |
| `X-Unburn-Agent` | Recomendada | Indica qué agente hace la petición | Los permisos MCP se aplican por clave virtual, no por agente |
| `X-Unburn-Parent-Agent` | Opcional | Indica qué agente encargó la tarea (delegación) | El diagnóstico causal pierde precisión |
| `X-Unburn-End-User` | Opcional | Seudónimo del usuario final (por ejemplo, un código aleatorio) | El sistema inmunológico solo puede frenar por clave o por sesión, no por usuario |

**Cabeceras que Unburn añade a la respuesta:**

| Cabecera | Significado |
|---|---|
| `X-Unburn-Request-Id` | Identificador de la petición, para buscarla en la auditoría |
| `X-Unburn-Model-Substituted` | Aparece si Unburn cambió el modelo (indica cuál se pidió y cuál se usó) |
| `X-Unburn-Loop-Warning` | Aparece si se detectó un posible bucle en modo aviso |

**Herramientas de automatización (n8n y similares) [Fase 1 – MVP].** Basta con configurar la credencial de OpenAI con la dirección base de Unburn y la clave virtual. Las cabeceras de sesión solo se podrán enviar si la herramienta permite añadir cabeceras. Si no lo permite, Unburn funciona por petición.

**Opción B: dominio propio del cliente [Arquitectura objetivo].** Las grandes empresas pueden preferir usar una dirección suya, por ejemplo `ia.miempresa.example`. El cliente crea un **registro CNAME** en su DNS (un alias que dice "esta dirección en realidad es Unburn") y Unburn genera un **certificado TLS** para ese dominio, de modo que la conexión siga siendo segura. El tráfico sigue pasando por la nube de Unburn: es solo un cambio de nombre, no un despliegue privado.

### 5.4. Recorrido completo de una petición

**Paso 1. Entrada y autenticación.**
- La petición llega cifrada por HTTPS.
- Unburn lee la clave virtual, calcula su huella y la busca en la copia rápida (Redis). Si no existe o está revocada, responde **401**.
- Comprueba la cuota del plan. Si está agotada (plan gratuito), responde **402**.

**Paso 2. Identificación.** Lee las cabeceras de sesión, agente y usuario final, y añade la llamada al **grafo de sesión**.

**Paso 3. Normalización.**
- Identifica el proveedor y el modelo pedido.
- **Límite de respuesta:**
  - En OpenAI, si la petición no trae límite de tamaño, Unburn añade el parámetro correcto (`max_completion_tokens`; el antiguo `max_tokens` está obsoleto y algunos modelos lo rechazan). El valor por defecto lo configura el cliente. Debe ser generoso, porque en los modelos que razonan el límite incluye los tokens de razonamiento: un límite demasiado bajo puede agotarse antes de que el modelo responda.
  - En Anthropic, `max_tokens` ya es obligatorio. Unburn solo lo reduce si supera el máximo configurado por el cliente.
- En respuestas por *streaming* de OpenAI, activa la opción que hace que el proveedor envíe el **consumo real de tokens** al final (`stream_options.include_usage`). Sin ella, Unburn no podría liquidar.
- Estima los tokens de entrada de forma aproximada, con un margen de seguridad.

**Paso 4. Sistema inmunológico.** Compara la velocidad de consumo con la línea base. Si hay anomalía, aplica la respuesta configurada: avisar, frenar con **429** o cambiar a un modelo económico. Se hace **antes** de reservar, para que la reserva use el precio del modelo que realmente se va a usar.

**Paso 5. Escudo MCP.** Quita de la petición las herramientas que ese agente no tiene permitidas según el grafo de contexto. El modelo nunca llega a "ver" las prohibidas.

**Paso 6. Detector de bucles.** Calcula las huellas del contenido nuevo de la llamada y aplica las reglas de bucle (5.6). En **modo aviso** (por defecto), marca la respuesta, crea un incidente y avisa. En **modo bloqueo**, responde **422** con un mensaje que el agente puede leer.

**Paso 7. Reserva.** Calcula el **peor caso**: tokens de entrada estimados más el límite máximo de salida, multiplicados por los precios del modelo. Aparta ese importe en **todos** los presupuestos afectados a la vez. Si alguno superaría su límite duro, responde **402**. Si se cruza un límite blando, envía un aviso.

**Paso 8. Envío al proveedor.**
- Obtiene la clave real (de la memoria o descifrándola con KMS).
- Envía la petición al proveedor.
- Si el proveedor tarda demasiado (por ejemplo, más de 60 segundos sin enviar nada *(ejemplo)*), cancela la petición, libera la reserva y responde **504**.

**Paso 9. Respuesta y comprobación de herramientas.**
- El texto se reenvía al cliente **trozo a trozo** según llega (streaming).
- Si el modelo pide usar una herramienta, Unburn **retiene esa parte** hasta tenerla completa y la comprueba contra el grafo de contexto. Si la herramienta no está permitida (por ejemplo, porque el modelo fue engañado por una inyección de instrucciones), Unburn:
  - sin streaming, responde **403**;
  - con streaming, corta la respuesta y envía un evento de error que indica la herramienta denegada.
- Esta retención añade un pequeño retraso, **solo** en las respuestas que piden herramientas.

**Paso 10. Liquidación.** Cuando termina la respuesta, el proveedor informa del consumo real (tokens de entrada, salida y razonamiento). Unburn calcula el coste real, lo suma al gasto y **libera el resto de la reserva**. Si el cliente cortó la conexión a medias, Unburn estima los tokens generados hasta el corte. Si algo falla y la reserva nunca se liquida, **caduca sola** a los 10 minutos *(ejemplo)*, para no dejar dinero bloqueado.

**Paso 11. Después de responder (sin hacer esperar al cliente).**
- Envía el evento de auditoría a la cola.
- Actualiza el grafo de sesión y las líneas base de consumo.
- Si hay un incidente, el servicio de diagnóstico causal lo analiza y se envían las alertas.

### 5.5. Motor de presupuestos (reservar y liquidar) [Fase 1 – MVP]

**El problema:** el coste de una petición no se conoce hasta que el modelo termina de responder. Si Unburn esperara al final para comprobar el presupuesto, varias peticiones simultáneas podrían pasarse todas a la vez del límite.

**La solución, reservar y liquidar:** igual que un hotel bloquea un importe en la tarjeta al hacer el check-in y cobra lo real al salir.

**Ejemplo numérico** (precios inventados *(ejemplo)*: 2 € por millón de tokens de entrada y 8 € por millón de tokens de salida):

| Momento | Cálculo | Importe |
|---|---|---|
| **Reserva** | 2.000 tokens de entrada × 2 €/M + 4.000 tokens de salida máximos × 8 €/M = 0,004 + 0,032 | **0,036 €** |
| **Coste real** | 2.000 de entrada × 2 €/M + 500 de salida reales × 8 €/M = 0,004 + 0,004 | **0,008 €** |
| **Se devuelve** | 0,036 − 0,008 | **0,028 €** |

**Reglas:**
- **Jerarquía [Fase 1 – MVP]:** organización → clave virtual. Una petición debe caber en **todos** sus niveles. Si se agota el presupuesto de la organización, se bloquean todas sus claves. *[Arquitectura objetivo]: un nivel intermedio de "proyecto" entre organización y clave virtual.*
- **Periodos:** diario y mensual, según la zona horaria de la organización.
- **Límites:** blando (avisa) y duro (corta).
- **Operación atómica:** la comprobación y la reserva en todos los niveles se hacen en una única operación indivisible en Redis. Así es imposible que dos peticiones simultáneas pasen ambas cuando solo hay sitio para una.

**Consecuencia a tener en cuenta:** la reserva es **pesimista** (aparta el peor caso). Si al presupuesto le quedan 0,05 € y llegan dos peticiones como la del ejemplo, la primera pasa (reserva 0,036 €) y la segunda se rechaza, aunque la primera acabe gastando solo 0,008 €. El cliente puede reducir este efecto bajando el límite máximo de respuesta.

**Precios:**
- Unburn mantiene una **tabla de precios** de cada modelo y la actualiza cuando los proveedores cambian sus tarifas.
- El coste calculado es una **estimación muy cercana** a lo que cobrará el proveedor, pero no una cifra oficial: pueden influir descuentos, redondeos o cortes de conexión.
- *[Arquitectura objetivo]: conciliación periódica con los informes de uso de cada proveedor.*

### 5.6. Detector de bucles y diagnóstico causal

**Requisito:** el cliente debe enviar las cabeceras de sesión y agente (ver 5.3).

**Por qué no se compara el texto completo de cada llamada.** En una conversación, cada petición reenvía todo el historial anterior. Dos peticiones seguidas siempre se parecen casi al 100%, aunque la conversación avance con normalidad. Compararlas así daría falsas alarmas constantes. Por eso Unburn compara **solo el contenido nuevo** de cada llamada: el último mensaje, la herramienta pedida y sus argumentos, y el resultado de la herramienta.

**Detección por reglas [Fase 1 – MVP].** Son reglas exactas, rápidas y fáciles de explicar *(números de ejemplo, configurables)*:

| Regla | Qué detecta | Ejemplo |
|---|---|---|
| **R1. Reintento idéntico con error** | El mismo agente pide la misma herramienta con los mismos argumentos y obtiene el mismo resultado de error 3 veces seguidas | El agente llama a `ejecutar_tests` con lo mismo y recibe el mismo fallo una y otra vez |
| **R2. Ping-pong entre agentes** | Dos agentes intercambian el mismo contenido nuevo durante 3 vueltas (A→B→A→B…) | El programador envía la misma propuesta y el auditor la rechaza siempre igual |
| **R3. Límites de sesión** | La sesión supera un número máximo de llamadas, de euros o de duración | Más de 200 llamadas, más de 20 € o más de 2 horas en una sola tarea |

**Respuesta:** en **modo aviso** (por defecto) se crea un incidente, se envía una alerta y se marca la respuesta con `X-Unburn-Loop-Warning`. En **modo bloqueo** (configurable por clave) se responde con el error **422** y un mensaje que el agente puede leer para cambiar de estrategia o detenerse. El modo aviso es el predeterminado porque ninguna detección es perfecta, y bloquear por error un trabajo legítimo sería peor que avisar.

**Diagnóstico causal [Fase 1 – MVP].** Cuando salta un incidente, el servicio de diagnóstico recorre el **grafo de sesión** hacia atrás (qué llamada provocó cuál, qué agente encargó qué) para encontrar **dónde empezó** el problema. Ejemplo de diagnóstico *(ejemplo)*:

> **Sesión `pedido-8812`.** Bucle detectado (regla R2).
> **Origen:** el *agente-programador* y el *agente-auditor* intercambiaron 6 veces el mismo contenido (mismas huellas). En cada vuelta, la herramienta `ejecutar_tests` devolvió el mismo resultado. El bucle empezó en la llamada 14, cuando el auditor recibió ese resultado por primera vez.
> **Coste del bucle:** 3,10 €.
> **Ahorro estimado al detenerlo:** entre 20 y 35 € (si hubiera continuado hasta el límite de la sesión).

Como Unburn no guarda el texto, el diagnóstico se basa en la **estructura** (quién llamó a quién, qué herramienta, si el resultado se repite), no en lo que decían los mensajes.

**Ahorro estimado [Fase 1 – MVP].** Versión simple: coste medio de cada vuelta del bucle × vueltas que faltaban hasta el límite de la sesión. Se muestra **como un rango**, porque es una estimación.

**[Arquitectura objetivo]:**
- **Detección semántica:** compara el **significado** del contenido nuevo (usando *embeddings*, ver glosario) para detectar bucles en los que el agente repite lo mismo con otras palabras.
- **Efecto de cada intervención:** compara qué pasa después de cada tipo de respuesta (avisar al agente, cortar, cambiar de modelo) para saber cuál detiene mejor los bucles con menos daño.
- **Ahorro contrafactual:** estima con un modelo causal cuánto habría gastado la sesión sin la intervención. Así el ahorro se calcula de forma rigurosa.

La explicación de por qué esto es IA causal está en 7.4.

### 5.7. Escudo MCP y grafo de contexto

**Cómo ve Unburn las herramientas.** Cuando un agente usa MCP, su programa traduce las herramientas MCP a una lista de "funciones" que envía al modelo en cada petición. Esa lista **pasa por Unburn**, igual que la respuesta del modelo cuando decide usar una herramienta. Lo que **no** pasa por Unburn es la ejecución de la herramienta: el programa del agente habla con el servidor MCP directamente.

```
  Programa del agente ──(petición con lista de herramientas)──► UNBURN ──► Modelo de IA
          ▲                                                        │
          │◄──────(respuesta: "quiero usar la herramienta X")──────┘
          │
          └──(ejecuta la herramienta X)──► Servidor MCP ──► Base de datos
                     ▲
                     └── este tramo NO pasa por Unburn en el MVP
```

**Descubrimiento y modos [Fase 1 – MVP].**
1. **Modo aprendizaje** (primeros días *(ejemplo)*): Unburn **no bloquea nada**. Registra qué herramientas usa cada agente y las muestra en el panel.
2. El administrador asigna a cada herramienta una **categoría de datos** (por ejemplo, `buscar_factura` → "Datos de facturación") y define qué puede usar cada agente.
3. **Modo protección:** lo que no está permitido se **deniega**. Si aparece una herramienta nueva, se bloquea y se avisa al administrador, que puede aprobarla con un clic. Es el principio de **confianza cero** (*zero trust*): nada está permitido hasta que se autoriza.

**El grafo de contexto [Fase 1 – MVP].** Los permisos se representan como un **grafo**: puntos (nodos) unidos por flechas (aristas).
- **Nodos:** agentes, herramientas y categorías de datos.
- **Aristas:** "puede usar" (agente → herramienta), "accede a" (herramienta → datos) y "puede delegar en" (agente → agente).

Ejemplo *(ejemplo)*:
```
Agente Soporte ──puede usar──► buscar_manual ──accede a──► [Manuales]
Agente Soporte ──puede usar──► ver_ticket    ──accede a──► [Tickets]
Agente Soporte ──puede delegar en──► Agente Facturación
Agente Facturación ──puede usar──► ver_factura ──accede a──► [Datos de facturación]
```

**Por qué un grafo y no una simple lista: los caminos indirectos.** El administrador puede fijar reglas como *"el Agente Soporte nunca debe llegar a [Datos de facturación]"*. Con una lista de permisos, esa regla parece cumplirse, porque el Agente Soporte no tiene `ver_factura`. Pero el grafo revela un **camino indirecto**: Soporte → delega en Facturación → `ver_factura` → [Datos de facturación]. Un atacante que engañe al Agente Soporte podría pedirle que "le pase la tarea" al de Facturación. Unburn analiza el grafo **cada vez que cambia la configuración** y avisa en el panel de estos caminos indirectos, para que el administrador decida si los corta.

**Comprobación en tiempo real.** Cada vez que cambia la configuración, el grafo se "compila" en una tabla de permisos (agente + herramienta → sí o no) que se guarda en Redis. Durante las peticiones, comprobar un permiso es **una consulta directa a esa tabla**: tarda lo mismo sea cual sea el tamaño del grafo (tiempo constante). No hace falta preguntar a otro modelo de IA si la acción "parece segura", algo que sería más lento, más caro y menos fiable.

**Dónde actúa:**
1. **En la petición:** quita las herramientas no permitidas (paso 5 de 5.4).
2. **En la respuesta:** si el modelo pide una herramienta no permitida, la bloquea (paso 9 de 5.4).

**Qué protege y qué no (MVP):**
- **Protege** frente a la amenaza principal de la inyección de instrucciones: que el **modelo** sea engañado para usar herramientas que no debe.
- **No protege** frente a que el **propio programa del agente** llame al servidor MCP por su cuenta (por un error de programación o porque alguien lo haya modificado), porque ese tráfico no pasa por Unburn.
- **No controla los argumentos** de las herramientas permitidas. Por ejemplo, no impide que `buscar_cliente` se pida con un filtro que devuelva todos los clientes.
- **No ve los datos** que devuelve la herramienta antes de que salgan de la base de datos.

**Proxy MCP completo [Arquitectura objetivo].** Unburn se coloca **también delante de los servidores MCP**, de modo que cada ejecución de herramienta pasa por él. Esto permite:
- Controlar las llamadas aunque el programa del agente intente saltarse el modelo.
- Aplicar **reglas sobre los argumentos** (por ejemplo, "máximo 50 resultados por consulta").
- Limitar el **volumen de datos** que devuelve cada herramienta.

La versión actual de la especificación MCP (2026-07-28) facilita este proxy: cada mensaje lleva cabeceras HTTP que indican la operación y la herramienta, así que Unburn puede decidir sin abrir el contenido. **Limitación:** solo funciona con servidores MCP **remotos** (transporte *Streamable HTTP*). Los servidores **locales**, que se ejecutan en el mismo ordenador que el agente (transporte *stdio*), no pasan por la red y ningún proxy puede interceptarlos.

### 5.8. Sistema inmunológico digital [Fase 1 – MVP]

Funciona como el sistema inmunitario del cuerpo: **detecta** algo anómalo, **responde** de forma proporcional (sin "matar" todo el organismo) y **recuerda** el incidente para reaccionar mejor la próxima vez.

**1. Detectar.**
- Mide la **velocidad de consumo** (euros por minuto y tokens por minuto) por clave virtual, por sesión y por usuario final (si se envía su seudónimo).
- La compara con la **línea base** de los últimos 7 días *(ejemplo)*. Las claves nuevas, sin historial, usan valores por defecto del plan.
- Hay anomalía si el consumo supera la línea base en más de 3 veces su variabilidad habitual durante 2 minutos seguidos *(ejemplo)*.

**2. Responder de forma gradual** (configurable), siempre **sobre la parte afectada** (un usuario final, una sesión o una clave), nunca sobre todo el cliente:

| Nivel | Respuesta |
|---|---|
| 1 | Alerta al administrador |
| 2 | Límite de velocidad: se frenan las peticiones de esa parte con **429** y se indica cuánto esperar |
| 3 | Cambio a modelo económico, **solo si el cliente lo ha configurado** (qué modelo sustituye a cuál), y siempre indicado en la cabecera `X-Unburn-Model-Substituted` |
| 4 | Bloqueo temporal de esa parte |

**3. Recordar.** Tras un incidente, se aplican límites más estrictos a esa parte durante 24 horas *(ejemplo)*.

**Barreras preventivas:**
- Límite de tamaño de respuesta inyectado si falta (ver 5.4, paso 3).
- Rechazo de peticiones con una entrada mayor que el máximo configurado.

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
| **401** | Clave virtual inválida o revocada | No |
| **402** | Presupuesto agotado o cuota del plan agotada | No (a propósito: reintentar no lo arregla) |
| **403** | El modelo pidió una herramienta no permitida (sin streaming) | No |
| **422** | Bucle detectado en modo bloqueo | No |
| **429** | Frenado por el sistema inmunológico | Sí, tras esperar |
| **502** | El proveedor devolvió un error o no está disponible | Sí |
| **503** | Unburn no puede comprobar presupuestos o permisos por un fallo interno (en modo bloqueo) | Sí |
| **504** | El proveedor tardó demasiado | Sí |

Los errores que genera el propio proveedor (por ejemplo, una petición mal formada) se reenvían al cliente tal cual.

### 5.10. Panel web y API de administración [Fase 1 – MVP]

**Secciones del panel:**
- **Inicio:** gasto del día y del mes, ahorro estimado (como rango) e incidentes recientes.
- **Claves virtuales:** crear, revocar, asignar presupuestos y políticas.
- **Presupuestos y alertas.**
- **Sesiones e incidentes:** con el diagnóstico causal de cada uno.
- **Grafo de contexto:** vista visual de agentes, herramientas y datos, con avisos de caminos indirectos.
- **Auditoría:** búsqueda y exportación.
- **Facturación:** plan, consumo de peticiones y facturas.
- **Ajustes:** política ante fallos y usuarios del panel.

**Roles:** administrador (puede cambiarlo todo) y lector (solo consulta).

**API de administración:** permite hacer lo mismo que el panel desde código, para automatizar la configuración.

### 5.11. Comportamiento ante fallos [Fase 1 – MVP]

- **Si el proveedor falla o tarda demasiado:** se cancela la petición, se libera la reserva y se responde 502 o 504.
- **Si falla un componente interno** (por ejemplo, Redis no responde): cada clave virtual tiene una **política ante fallos**:
  - **Bloquear** (*fail-closed*), **la opción por defecto**: si Unburn no puede garantizar que la petición está dentro del presupuesto y es segura, la rechaza (503). Protege el dinero y los datos, pero **la IA del cliente deja de funcionar** mientras dure el fallo.
  - **Dejar pasar** (*fail-open*), opcional: la petición pasa sin controles y se registra en cuanto el sistema se recupera. Mantiene el servicio, pero sin protección durante el fallo.
- **[Arquitectura objetivo]: cambio automático de proveedor.** Si OpenAI falla, la petición se envía a Anthropic, o al revés. Exige **traducir** entre formatos, porque cada proveedor organiza los mensajes, las herramientas y el streaming de forma distinta.

---

## 6. Capa tecnológica

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
              ElastiCache (Valkey/Redis)            AWS KMS (llave maestra)
              con réplica en la otra zona
                               │
           Amazon SQS ──► Servicios de apoyo (Go): auditoría, diagnóstico,
                          alertas, facturación ──► Amazon RDS PostgreSQL (con réplica)
                               │
           Panel web (React) ──► API de administración

Salidas externas: OpenAI · Anthropic · Stripe (pagos) · Amazon SES (email)
                  · Slack / Microsoft Teams (webhooks)
Observabilidad: OpenTelemetry ──► Grafana
Todo dentro de una red privada (VPC) en AWS, región Europa (Irlanda).
```

### 6.2. Proveedor de nube y región

- **Proveedor:** **Amazon Web Services (AWS)**.
- **Región:** **Europa (Irlanda)**, para que los datos se queden en la UE. Además, es una de las dos regiones de AWS donde se pueden lanzar máquinas virtuales confidenciales (AMD SEV-SNP) en servidores compartidos, lo que facilita el paso a la arquitectura objetivo (ver 6.11).
- **Zonas de disponibilidad:** el MVP usa **dos zonas** de la misma región (centros de datos separados físicamente), para que un fallo en uno no tumbe el servicio.
- **[Arquitectura objetivo]:** una **segunda región de la UE** (por ejemplo, Frankfurt) para recuperarse ante desastres.

### 6.3. Lenguajes

| Pieza | Lenguaje | Por qué |
|---|---|---|
| Gateway y servicios de apoyo | **Go** | Compilado, rápido, muy usado en proxies y servicios de red, y más rápido de desarrollar que alternativas como Rust |
| Panel web | **TypeScript con React** | Estándar para interfaces web |

### 6.4. Ejecución (cómputo)

- **Contenedores Docker:** cada componente se empaqueta con todo lo que necesita para funcionar igual en cualquier entorno.
- **Amazon ECS con Fargate:** AWS ejecuta los contenedores sin que haya que gestionar servidores. Escala automáticamente, añadiendo contenedores cuando sube el tráfico y quitándolos cuando baja.
- **Application Load Balancer:** reparte las peticiones entre los contenedores de las dos zonas y deja de enviar tráfico a los que fallan.

### 6.5. Almacenamiento y mensajería

| Servicio | Uso | Configuración |
|---|---|---|
| **Amazon ElastiCache (Valkey, compatible con Redis)** | Contadores, reservas, sesiones activas, huellas, líneas base | Réplica en la segunda zona y copias periódicas |
| **Amazon RDS for PostgreSQL** | Datos permanentes (fuente de verdad) | Réplica en la segunda zona, copias de seguridad diarias, cifrado en reposo |
| **Amazon SQS** | Cola de eventos de auditoría | Entrega garantizada con reintentos |
| **AWS KMS** | Llave maestra para cifrar las claves reales | La llave nunca sale de KMS |

### 6.6. Servicios externos

| Servicio | Para qué |
|---|---|
| **APIs de OpenAI y Anthropic** | Proveedores de modelos de IA (el cliente paga con su propia clave) |
| **Stripe** (pasarela de pagos) | Cobro de suscripciones |
| **Amazon SES** | Envío de emails de alertas y avisos |
| **Webhooks de Slack y Microsoft Teams** | Alertas en los canales del cliente |

### 6.7. Seguridad de la infraestructura

- **Cifrado en tránsito:** todas las conexiones usan HTTPS/TLS, tanto con los clientes como con los proveedores.
- **Cifrado en reposo:** bases de datos y copias de seguridad cifradas.
- **Red privada (VPC):** las bases de datos no son accesibles desde internet; solo los componentes de Unburn pueden hablar con ellas.
- **AWS WAF** (cortafuegos de aplicaciones web): filtra en la entrada ataques básicos y volúmenes abusivos. Esto también protege **a Unburn**: un ataque masivo cuesta recursos aunque luego se bloquee.
- **Mínimo privilegio:** cada componente tiene solo los permisos de AWS que necesita. Por ejemplo, solo el gateway puede pedir a KMS que descifre.
- **Registros técnicos sin contenido:** los logs de los servidores **nunca** incluyen el texto de las peticiones ni claves.

### 6.8. Observabilidad

**OpenTelemetry** (estándar abierto para recoger métricas, trazas y logs) con paneles y alertas en **Grafana**. Vigila:
- latencia que añade Unburn;
- errores;
- uso de CPU y memoria;
- tamaño de la cola de auditoría;
- tiempos de respuesta de los proveedores.

El equipo de guardia recibe un aviso si algo se sale de lo normal.

### 6.9. Disponibilidad

- **Meta de disponibilidad: 99,9%** *(ejemplo)*, es decir, como máximo unas **8,8 horas** de caída al año.
- **Por qué no 99,99%** (menos de 1 hora al año):
  - Con la política de bloquear ante fallos, cualquier fallo interno detiene el servicio.
  - Los proveedores de IA tampoco garantizan ese nivel, así que prometerlo no sería realista.
- **Medidas:** dos zonas de disponibilidad, réplicas de las bases de datos, reconstrucción de contadores (ver 4.9) y escalado automático.
- **[Arquitectura objetivo]:** compromisos contractuales de disponibilidad (**SLA**) para clientes Enterprise y una segunda región de la UE.

### 6.10. Desarrollo y despliegue del software

- **Integración y despliegue continuos (CI/CD) con GitHub Actions:** cada cambio de código se compila y pasa pruebas automáticas antes de publicarse.
- **Despliegue canario:** la nueva versión recibe primero un 5% del tráfico *(ejemplo)*. Si los indicadores de observabilidad se mantienen bien durante un tiempo, pasa gradualmente al 100%. Si empeoran, se vuelve automáticamente a la versión anterior. Así se actualiza sin parar el servicio.

### 6.11. Unburn Cloud Confidencial [Arquitectura objetivo]

Es la modalidad Enterprise para empresas que quieren usar la nube de Unburn, pero sin que **ni Unburn ni AWS** puedan inspeccionar por software lo que se procesa.

- **Dónde se ejecuta:** el gateway se ejecuta en un clúster separado de **máquinas virtuales confidenciales** de AWS (instancias EC2 con **AMD SEV-SNP** activado), en la región de Irlanda. Esta tecnología cifra la memoria de la máquina con una clave que solo conoce el procesador.
- **Atestación remota:** antes de enviar tráfico, el cliente puede pedir un **informe de atestación** firmado con una cadena de confianza que lleva hasta AMD (el fabricante del procesador). Ese informe demuestra **qué software exacto** se está ejecutando (su huella).
- **Builds reproducibles:** para que la atestación tenga valor, Unburn publica cómo construir exactamente la imagen del gateway. Así el cliente o un auditor puede comprobar que la huella corresponde al código revisado.
- **Claves reales:** las claves de los proveedores solo se descifran **dentro** de las máquinas confidenciales. El mecanismo concreto de liberación de claves condicionado a la atestación se definirá en el diseño detallado.
- **Coste:** AWS cobra un recargo por usar SEV-SNP en servidores compartidos (un 10% sobre el precio de la instancia, según su documentación). Se repercute en el precio del contrato Enterprise.
- **Qué NO protege** (ver también 7.7 y sección 10):
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
| **Context Graphs** (grafos de contexto) | Representan permisos y relaciones de agentes, herramientas y datos | Grafo de contexto y grafo de sesión | MVP |
| **Causal AI** (IA causal) | Encontrar la causa de bucles y picos de gasto, y medir el efecto de las intervenciones | Diagnóstico causal (5.6) | MVP (causa raíz) y Objetivo (intervenciones y contrafactuales) |
| **Digital Immune System** (sistema inmunológico digital) | Detectar anomalías y responder de forma automática y gradual | Sistema inmunológico (5.8) | MVP |
| **Confidential Computing** (computación confidencial) | Proteger los datos mientras se procesan | Unburn Cloud Confidencial (6.11) | Objetivo |

### 7.2. AI Agents y Multiagent Systems

**Qué son.** Un **agente de IA** es un programa que usa un modelo de IA para decidir y actuar por su cuenta: buscar información, ejecutar herramientas, escribir código. Un **sistema multiagente** es un conjunto de agentes que colaboran y se reparten el trabajo. Por ejemplo, un agente planificador divide la tarea, un programador escribe el código, un auditor lo revisa y otro ejecuta las pruebas.

**Por qué son un riesgo nuevo.**
- Trabajan **sin supervisión humana constante**, a veces de noche o durante horas.
- Cada paso implica una o varias peticiones de pago al modelo.
- Los errores se encadenan: un agente puede atascar a otro, y dos agentes pueden quedarse en bucle.
- Un **gateway tradicional** solo ve peticiones sueltas, sin saber que diez peticiones forman parte de la misma conversación entre máquinas.

**Cómo los usa Unburn.** Unburn entiende **sesiones** y **agentes** (gracias a las cabeceras de 5.3). Así puede:
- poner límites por tarea y no solo por petición;
- detectar bucles entre agentes;
- reconstruir qué agente provocó un problema;
- vigilar la **delegación** entre agentes, que puede abrir caminos indirectos a datos protegidos (5.7).

### 7.3. Model Context Protocol (MCP)

**Qué es.** Un **estándar abierto** que define cómo una aplicación de IA se conecta con herramientas y fuentes de datos externas: bases de datos, archivos, servicios. Lo presentó Anthropic en noviembre de 2024 y en diciembre de 2025 lo cedió a la **Agentic AI Foundation**, dentro de la **Linux Foundation**, que lo gobierna de forma neutral. Sus mensajes usan el formato JSON-RPC. Hay dos formas de conexión:
- **stdio**, para servidores locales que se ejecutan en el mismo ordenador que el agente;
- **Streamable HTTP**, para servidores remotos accesibles por la red.

La especificación se versiona por fechas. La revisión del **28 de julio de 2026** hizo el protocolo **sin estado** (cada mensaje es independiente y ya no hay un "saludo" inicial) y añadió cabeceras HTTP que indican la operación y la herramienta de cada mensaje.

**El riesgo.** MCP da a los agentes acceso real a datos y acciones. Si un atacante consigue que el modelo lea instrucciones maliciosas (inyección de instrucciones), puede intentar que use herramientas indebidas.

**Cómo lo usa Unburn.**
- **[Fase 1 – MVP]:** escudo MCP que controla qué herramientas ve y puede pedir el modelo, según el grafo de contexto.
- **[Arquitectura objetivo]:** proxy MCP completo delante de los servidores MCP remotos, con reglas sobre los argumentos y el volumen de datos (5.7).

### 7.4. Causal AI (IA causal)

**Qué es.** La mayoría de la IA aprende **correlaciones** ("cuando pasa A, suele pasar B"). La **IA causal** intenta entender **causas** ("A provoca B"). Usa tres herramientas:

1. **Grafo causal:** un mapa de qué cosas provocan cuáles.
2. **Intervenciones:** "si hago X, ¿qué cambia?".
3. **Contrafactuales:** "¿qué habría pasado si no hubiera hecho X?".

**Cómo la usa Unburn:**

| Herramienta causal | Aplicación en Unburn | Fase |
|---|---|---|
| Grafo causal | El **grafo de sesión** registra qué llamada provocó cuál y qué agente encargó qué. Recorriéndolo hacia atrás se encuentra la **causa raíz** de un bucle o de un pico de gasto. | MVP |
| Intervenciones | Unburn **interviene** en los bucles (avisando al agente, cortando o cambiando de modelo). Comparando sistemáticamente qué ocurre después de cada intervención, mide **cuál funciona mejor**. | Objetivo |
| Contrafactuales | El **ahorro** de Unburn es una pregunta contrafactual: ¿cuánto habría gastado la sesión si no se hubiera detenido? Un modelo causal permite estimarlo con rigor y un margen de error. | Objetivo (en el MVP se usa una estimación simple, ver 5.6) |

**Nota honesta.** **Detectar** un bucle no requiere IA causal: se hace con reglas (5.6). La IA causal se aplica al **diagnóstico** (por qué ocurrió y dónde empezó) y a la **medición del efecto** de las intervenciones. Presentarla como el detector de bucles sería incorrecto.

### 7.5. Context Graphs (grafos de contexto)

**Qué son.** Un grafo es una estructura de **nodos** (puntos) unidos por **aristas** (relaciones). En el mundo de los agentes de IA, "grafo de contexto" se usa para representar el **contexto en el que actúa un agente**: qué entidades existen, cómo se relacionan y qué ha ocurrido. El término todavía no tiene una definición única en la industria. Este documento usa la de Unburn:

**Cómo los usa Unburn [Fase 1 – MVP]:**
1. **Grafo de contexto (permisos):** agentes, herramientas y categorías de datos, unidos por "puede usar", "accede a" y "puede delegar en". Sirve para:
   - aplicar el **mínimo privilegio**: cada agente solo accede a lo que necesita;
   - descubrir **caminos indirectos** hacia datos protegidos, algo que una lista de permisos no puede hacer (5.7).
2. **Grafo de sesión (traza):** las llamadas de cada tarea y cómo se provocan entre sí. Es la base del diagnóstico causal (7.4).

### 7.6. Digital Immune System (sistema inmunológico digital)

**Qué es.** Un enfoque que combina **observación continua**, **respuesta automática** y **resiliencia**, para que un sistema detecte problemas y se recupere solo, sin depender de que un humano reaccione a tiempo. La comparación con el sistema inmunitario es literal: detectar lo anómalo, responder en proporción y recordar.

**Cómo lo usa Unburn [Fase 1 – MVP]:**
- **Observación:** velocidad de consumo por clave, sesión y usuario final, comparada con su comportamiento normal.
- **Respuesta gradual y localizada:** avisar, frenar, cambiar a un modelo económico (si el cliente lo ha configurado) o bloquear, **solo** la parte afectada. Así no se corta el servicio a usuarios legítimos.
- **Memoria:** límites más estrictos durante un tiempo tras un incidente.

Ver 5.8 para el detalle.

### 7.7. Confidential Computing (computación confidencial)

**Qué es.** Los datos pueden estar en tres estados:
- **en tránsito**, viajando por la red (se protegen con TLS);
- **en reposo**, guardados en disco (se protegen con cifrado);
- **en uso**, mientras un programa los procesa en memoria.

Hasta hace poco, los datos en uso estaban necesariamente **sin cifrar** en la memoria. La computación confidencial crea **entornos de ejecución confiables** (TEE) con ayuda del procesador: la memoria se cifra con una clave que solo conoce el chip, y ni el sistema operativo ni el administrador del servidor ni el proveedor de nube pueden leerla por software. Además ofrece **atestación remota**: una prueba firmada de qué software exacto se está ejecutando.

**Cómo la usa Unburn [Arquitectura objetivo]:** en **Unburn Cloud Confidencial** (6.11), el gateway se ejecuta en máquinas virtuales confidenciales (AMD SEV-SNP). Las claves reales de los proveedores y el texto de las peticiones solo existen en claro **dentro** de esa zona protegida. El cliente puede verificar mediante atestación qué código procesa sus datos. Es la respuesta al principal freno de los sectores regulados para usar un intermediario en la nube.

**Límites honestos:**
- **No protege frente a ataques físicos sofisticados** con acceso al hardware: en 2025 se demostraron ataques así (por ejemplo, *TEE.Fail*) contra las tecnologías de AMD e Intel.
- **No protege frente al proveedor de IA**, que sigue recibiendo el texto.
- La atestación demuestra **qué código** se ejecuta, **no que ese código sea seguro**. Por eso hacen falta builds reproducibles y revisiones de código.

---

## 8. Hoja de ruta

> **Regla de uso:** en las entregas se presenta la hoja de ruta completa. Para implementar el MVP, solo la Fase 1.

En TOGAF, la hoja de ruta describe cómo se pasa de la arquitectura de partida a la arquitectura objetivo mediante **arquitecturas de transición**. Las duraciones son *(ejemplo)*.

| Fase | Duración *(ejemplo)* | Contenido |
|---|---|---|
| **Fase 1 – MVP** | Meses 0–6 | Todo lo marcado como [Fase 1 – MVP]: gateway para OpenAI y Anthropic, claves virtuales, reservar y liquidar, presupuestos de dos niveles, límite de respuesta, detección de bucles por reglas, diagnóstico de causa raíz con ahorro estimado simple, escudo MCP básico con grafo de contexto y caminos indirectos, sistema inmunológico, auditoría con cadena de huellas, alertas, panel web, facturación con plan Gratis y Pro. Región de Irlanda con dos zonas. |
| **Fase 2 – Crecimiento** | Meses 6–18 | Proxy MCP completo con reglas de argumentos y de volumen. Detección semántica de bucles. Medición del efecto de las intervenciones y ahorro contrafactual (IA causal completa). Caché semántica opcional. Google Gemini y *Responses API* de OpenAI. Cambio automático entre proveedores. Nivel "proyecto" en los presupuestos. Conciliación con los informes de los proveedores. Dominio propio del cliente. Nodo verificado de n8n. |
| **Fase 3 – Enterprise** | Meses 18–36 | Unburn Cloud Confidencial (computación confidencial con atestación). Despliegue privado. Segunda región de la UE. SLA contractuales. Retención configurable. Venta a través del *marketplace* de AWS. |

---

## 9. Alcance del MVP

> Esta sección es la referencia para **implementar** el MVP. Para las entregas, ver la regla de uso (0.2).

### 9.1. Qué entra y qué no

| Entra en el MVP | No entra en el MVP (arquitectura objetivo) |
|---|---|
| Gateway en Go para OpenAI (*Chat Completions*) y Anthropic (*Messages*), con y sin streaming | Google Gemini, *Responses API* de OpenAI, cambio automático entre proveedores |
| Claves virtuales (crear, revocar, políticas) | Dominio propio del cliente |
| Reservar y liquidar con presupuestos organización → clave, diarios y mensuales, blandos y duros | Nivel "proyecto"; conciliación con informes de proveedores |
| Inyección y ajuste del límite de respuesta | — |
| Cabeceras de sesión, agente, agente padre y usuario final | — |
| Detección de bucles por reglas (R1, R2, R3), en modo aviso o bloqueo | Detección semántica con *embeddings* |
| Diagnóstico de causa raíz y ahorro estimado simple | Efecto de intervenciones y ahorro contrafactual |
| Escudo MCP básico: modo aprendizaje y modo protección, grafo de contexto, caminos indirectos, filtrado de herramientas en petición y respuesta | Proxy MCP completo con reglas de argumentos y volumen |
| Sistema inmunológico: líneas base, respuesta gradual, memoria | Caché semántica |
| Auditoría con entrega garantizada y cadena de huellas, exportación | Retención configurable por contrato |
| Alertas por email, Slack, Teams y webhook | — |
| Panel web y API de administración | — |
| Planes Gratis y Pro con Stripe | Contratos Enterprise |
| AWS Irlanda, dos zonas de disponibilidad | Segunda región, Cloud Confidencial, despliegue privado |

### 9.2. Criterios de éxito del MVP *(ejemplos)*

- Un desarrollador integra Unburn en **menos de 15 minutos**.
- Unburn añade **menos de 50 ms** de retraso (en el 95% de las peticiones), sin contar lo que tarda el proveedor.
- Ningún presupuesto se supera por peticiones simultáneas.
- En el escenario de demostración, se detecta el bucle y se muestra el diagnóstico correcto.
- En el escenario de demostración, se bloquea el intento de usar una herramienta no permitida.

### 9.3. Escenarios de demostración sugeridos

1. **Bucle entre agentes:** un agente programador y un agente auditor se rechazan mutuamente la misma propuesta. Unburn detecta el bucle (regla R2), avisa en Slack y el panel muestra el origen, el coste y el ahorro estimado.
2. **Inyección de instrucciones:** un ticket de soporte contiene un texto que ordena al agente "consultar las facturas del cliente". El escudo MCP ya había quitado `ver_factura` de la lista de herramientas del Agente Soporte, así que el modelo no puede usarla. Si aun así la pide, Unburn bloquea la respuesta y lo registra en la auditoría.
3. **Ataque de agotamiento de costes:** un script lanza cientos de peticiones con el mismo usuario final. El sistema inmunológico frena solo a ese usuario y el resto sigue funcionando.
4. **Presupuesto agotado:** una clave de pruebas alcanza su límite duro y recibe el error 402, mientras las demás claves siguen funcionando.

---

## 10. Limitaciones conocidas

Lo que Unburn **no** hace o **no** garantiza. Es importante tenerlo claro para no prometer de más en las entregas.

1. **Solo controla el tráfico que pasa por Unburn.** Si una aplicación del cliente usa la clave real directamente, Unburn no la ve. Por eso se recomienda guardar la clave real solo en Unburn y **mantener también los límites nativos del proveedor** como segunda barrera.
2. **Escudo MCP (MVP):**
   - no impide que el programa del agente llame a un servidor MCP por su cuenta;
   - no controla los argumentos;
   - no ve los datos en su origen.

   El proxy MCP (objetivo) cubre los tres puntos, pero solo con servidores MCP remotos que únicamente sean accesibles a través de Unburn, nunca con servidores locales (5.7).
3. **No detecta todas las inyecciones de instrucciones.** No existe una solución completa a este problema. Unburn **reduce su impacto** limitando lo que un agente engañado puede hacer (mínimo privilegio), pero no lee ni juzga el contenido.
4. **La detección de bucles no es perfecta:**
   - las reglas del MVP no detectan bucles en los que el agente repite lo mismo con otras palabras;
   - una tarea legítima muy repetitiva puede parecer un bucle.

   Por eso el modo por defecto es avisar, no bloquear.
5. **Sin las cabeceras de sesión y agente**, Unburn funciona solo por petición: no hay detección de bucles por sesión, ni diagnóstico causal, ni permisos por agente.
6. **Los costes son estimaciones** hasta que el proveedor informa del consumo real, y pueden diferir ligeramente de la factura oficial (descuentos, redondeos, conexiones cortadas). La tabla de precios hay que mantenerla actualizada.
7. **El ahorro es siempre una estimación**, porque mide algo que no llegó a pasar.
8. **La reserva es pesimista:** cerca del límite, puede rechazar peticiones que en realidad habrían cabido (5.5).
9. **Unburn añade un pequeño retraso** a cada petición, algo mayor en las respuestas que piden herramientas (5.4, paso 9).
10. **Con la política de bloquear ante fallos, si Unburn falla, la IA del cliente se detiene.** Es una decisión consciente: se prioriza la protección sobre la disponibilidad, salvo que el cliente elija lo contrario.
11. **La IP que ve Unburn suele ser la del servidor del cliente.** Para frenar a usuarios finales concretos, el cliente debe enviar su seudónimo.
12. **Computación confidencial (objetivo):**
    - no protege frente a ataques físicos sofisticados ni frente al proveedor de IA;
    - la atestación demuestra qué código se ejecuta, no que sea seguro.
13. **Unburn no puede ofrecer más disponibilidad que la de los proveedores de IA:** si OpenAI cae, las peticiones a OpenAI fallan.
14. **Las referencias legales son orientativas** y deben revisarse con un abogado.
15. **La comparación con la competencia y el contexto normativo** reflejan octubre de 2026 y pueden cambiar.

---

## 11. Glosario

| Término | Significado |
|---|---|
| **AI Gateway** | Intermediario especializado en tráfico de IA que se coloca entre las aplicaciones y los proveedores de modelos. |
| **API** | Interfaz que permite que un programa use los servicios de otro. |
| **Arista** | En un grafo, la relación o flecha que une dos nodos. |
| **Arquitectura de partida (*baseline*)** | En TOGAF, la situación actual. |
| **Arquitectura de transición** | En TOGAF, un paso intermedio entre la situación actual y la objetivo. El MVP es la primera. |
| **Arquitectura objetivo (*target*)** | En TOGAF, la situación completa a la que se quiere llegar. |
| **Atestación remota** | Prueba firmada por el hardware de qué software exacto se está ejecutando en un entorno confidencial. |
| **Cabecera HTTP** | Campo de información adicional que viaja con una petición o respuesta web. |
| **Caché semántica** | Almacén de respuestas que se reutilizan cuando llega una pregunta con el mismo significado. |
| **Camino indirecto** | En el grafo de contexto, una ruta por la que un agente puede llegar a datos protegidos a través de otro agente. |
| **CI/CD** | Integración y despliegue continuos: automatización que compila, prueba y publica el software. |
| **Cifrado por sobres** | Técnica en la que los datos se cifran con una llave de datos, y esa llave se cifra a su vez con una llave maestra guardada en un servicio seguro. |
| **Clave real** | La clave de API del proveedor (OpenAI, Anthropic), asociada a la facturación del cliente. |
| **Clave virtual** | Clave emitida por Unburn para un equipo, agente o entorno. Se puede limitar y revocar sin afectar a las demás. |
| **CNAME** | Registro de DNS que hace que un dominio sea un alias de otro. |
| **Confianza cero (*zero trust*)** | Principio de seguridad según el cual nada está permitido por defecto: todo se verifica y se autoriza explícitamente. |
| **Contrafactual** | Lo que habría pasado en una situación que no ocurrió ("¿y si no hubiéramos actuado?"). |
| **Denegación de cartera (*denial of wallet*)** | Ataque cuyo objetivo es hacer gastar dinero a la víctima. También se llama ataque de agotamiento de costes. |
| **DORA** | Reglamento europeo de resiliencia operativa digital del sector financiero. |
| ***Embeddings*** | Representación de un texto como una lista de números (vector), de forma que textos con significado parecido den vectores parecidos. |
| **Encargado del tratamiento** | En el RGPD, quien trata datos personales por cuenta de otro (el responsable). |
| ***Fail-closed* / *fail-open*** | Ante un fallo interno, bloquear todo (cerrado) o dejar pasar todo (abierto). |
| **FinOps** | Disciplina de gestión y optimización del gasto en servicios de nube, aplicada aquí al gasto en IA. |
| **Grafo** | Estructura de nodos unidos por aristas. |
| **Grafo de contexto** | En Unburn, el grafo de permisos que relaciona agentes, herramientas y categorías de datos. |
| **Grafo de sesión** | En Unburn, el registro de las llamadas de una tarea y de cuáles provocaron a cuáles. |
| **Herramienta (*tool*)** | Función que un agente puede ejecutar, como consultar una base de datos. |
| **HMAC** | Forma de calcular huellas usando una clave secreta, para que nadie sin la clave pueda calcular la misma huella. |
| **Huella (*hash*)** | Código corto calculado a partir de un contenido. Permite saber si dos contenidos son idénticos sin guardarlos, y no permite reconstruir el original. |
| **Inyección de instrucciones (*prompt injection*)** | Ataque que mete instrucciones maliciosas en un texto que lee el modelo para que haga algo indebido. |
| **Latencia** | Tiempo de espera o retraso. |
| **Límite blando / duro** | Umbral de presupuesto que avisa (blando) o que corta (duro). |
| **Línea base** | El comportamiento normal de consumo de una clave, sesión o usuario, con el que se comparan los valores actuales. |
| **LLM (modelo de lenguaje)** | Modelo de IA que genera texto, como GPT o Claude. |
| **MCP (Model Context Protocol)** | Estándar abierto para que los agentes usen herramientas y datos externos. |
| **Mínimo privilegio** | Principio de dar a cada componente solo los permisos imprescindibles. |
| **MVP** | Producto mínimo viable: la primera versión con lo esencial. |
| **Nodo** | En un grafo, cada punto o entidad. |
| **Operación atómica** | Operación que se ejecuta entera o no se ejecuta, sin que otra pueda colarse en medio. |
| **Petición** | Cada mensaje que una aplicación envía a la API de un modelo. |
| **Proxy** | Servidor intermediario por el que pasa el tráfico. |
| **Reservar y liquidar** | Patrón que aparta el coste máximo antes de la petición y ajusta al coste real al terminar. |
| **Responsable del tratamiento** | En el RGPD, quien decide para qué y cómo se tratan los datos personales. En este caso, el cliente. |
| **RGPD** | Reglamento General de Protección de Datos de la UE. |
| **SaaS** | Software como servicio: se usa por internet pagando una suscripción. |
| **Seudónimo** | Identificador que no revela directamente quién es una persona. |
| **Sesión** | Conjunto de peticiones que forman una misma tarea de uno o varios agentes. |
| **Sistema multiagente** | Varios agentes de IA que colaboran. |
| **SLA** | Acuerdo de nivel de servicio: compromiso contractual de disponibilidad y tiempos. |
| **Streaming** | Envío de la respuesta a trozos, según se genera. |
| **TEE** | Entorno de ejecución confiable: zona protegida por el procesador para procesar datos sin que se puedan leer desde fuera. |
| **TLS / HTTPS** | Protocolo que cifra las comunicaciones por internet. |
| **TOGAF** | Marco de arquitectura empresarial. Organiza la arquitectura en capas: negocio, datos, aplicación y tecnología. |
| **Token** | Unidad de texto con la que los modelos miden y cobran el trabajo. Puede ser de entrada, de salida o de razonamiento. |
| **Webhook** | Mensaje automático que un sistema envía a otro (por ejemplo, a Slack) cuando ocurre algo. |
| **Zona de disponibilidad** | Centro de datos independiente dentro de una región de nube. |

---

## 12. Registro de decisiones

Decisiones tomadas por el equipo. No deben cambiarse sin acordarlo y actualizar este documento.

| # | Decisión | Motivo |
|---|---|---|
| D1 | En las entregas se incluye todo (MVP y arquitectura objetivo). En la implementación técnica del MVP, solo el MVP. En caso de duda, se incluye todo. | El profesor quiere el planteamiento de una empresa real. TOGAF distingue entre arquitectura objetivo y de transición. |
| D2 | Clientes: desarrolladores individuales, startups, PYMES y grandes empresas que usan agentes de IA. | Modelo de suscripción válido para todos; las grandes empresas, con contrato personalizado. |
| D3 | Diferenciación: foco en sistemas multiagente y en MCP. Claves virtuales y presupuestos son funciones base. | Las funciones base ya las ofrece la competencia. |
| D4 | Siete tecnologías emergentes: AI Agents, Multiagent Systems, MCP, Context Graphs, Causal AI, Digital Immune System y Confidential Computing. No se añaden más. | Proyecto acotado. |
| D5 | Suscripción por peticiones procesadas: Gratis (corte al agotar la cuota), Pro (excedente con tope) y Enterprise (contrato). Las cifras son ejemplos. | Simplicidad y modelo habitual del sector. |
| D6 | Las peticiones frenadas por el sistema inmunológico (429) no cuentan para la cuota. | Evitar que un atacante agote la cuota del cliente. |
| D7 | Núcleo regional en AWS Europa (Irlanda), dos zonas, contenedores en ECS con Fargate. Se descarta el edge. | Los presupuestos necesitan un contador central. Irlanda ofrece máquinas confidenciales para la arquitectura objetivo. |
| D8 | Lenguaje Go para el gateway y los servicios; React con TypeScript para el panel. | Rapidez de desarrollo y adecuación a proxies de red. |
| D9 | Proveedores en el MVP: OpenAI (*Chat Completions*) y Anthropic (*Messages*) en su formato nativo. Gemini y el cambio automático entre proveedores, en la arquitectura objetivo. | Cada proveedor usa un formato distinto; traducir entre ellos es mucho trabajo. |
| D10 | Ante fallos internos, bloquear por defecto, configurable por clave. Disponibilidad objetivo: 99,9%. | El valor principal es la protección; 99,99% no sería realista. |
| D11 | Presupuestos de dos niveles (organización → clave virtual), diarios y mensuales, blandos y duros, reservas con caducidad. Error 402 al agotarse. | Simplicidad. El 429 se reintenta solo y crearía bucles. |
| D12 | Bucles: detección por reglas en el MVP, modo aviso por defecto. La IA causal se usa para el diagnóstico, no para la detección. | Evitar falsos positivos y usar la IA causal de forma correcta. |
| D13 | Escudo MCP básico en el MVP (filtrado de herramientas y grafo de contexto); proxy MCP completo en la arquitectura objetivo. | Lo que no pasa por Unburn no se puede controlar sin un proxy MCP. |
| D14 | Caché semántica opcional y desactivada por defecto, solo en la arquitectura objetivo. | Choca con la promesa de no guardar contenido. |
| D15 | El cambio de modelo es opcional, lo configura el cliente y se indica en una cabecera. No se nombran modelos concretos en la documentación. | Cambiar el modelo en silencio puede romper la aplicación del cliente; los nombres de modelos caducan pronto. |
| D16 | Enterprise: Unburn Cloud Confidencial (computación confidencial) como modalidad principal y despliegue privado como alternativa, ambos en la arquitectura objetivo. | Mantener la computación confidencial con promesas honestas y cubrir a quien no puede usar una nube externa. |
| D17 | Datos solo en la UE, sin guardar el texto por defecto, retención por plan, Unburn como encargado del tratamiento. | RGPD y minimización de datos. |
| D18 | El dominio no forma parte del planteamiento; los ejemplos usan direcciones ficticias. | No aporta a la idea. |
| D19 | Integración con n8n cambiando la dirección base, sin alianza formal. Socios: canal de venta, ecosistema e infraestructura. | Funciona sin acuerdos; las alianzas se plantean como propuestas. |
| D20 | El README es la fuente única de contexto, escrita para personas con conocimientos básicos de informática y para IAs. | Se comparte con el equipo y se usa como contexto en cualquier tarea del proyecto. |
