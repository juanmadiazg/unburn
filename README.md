## 1. Visión General de Unburn

### 1.1. ¿Qué es Unburn?

Unburn es una plataforma de infraestructura B2B (orientada a vender a otras empresas) que funciona como un *API Gateway* o pasarela inteligente. En términos sencillos, es un servidor intermediario que se coloca estratégicamente en el centro de las comunicaciones de una empresa: justo en medio de los sistemas de Inteligencia Artificial del cliente y sus proveedores finales (como los modelos de lenguaje de OpenAI o Anthropic, o sus propias bases de datos).

En lugar de que la aplicación de una empresa hable directamente con OpenAI, habla primero con Unburn. Esta posición privilegiada nos permite interceptar, auditar y decidir sobre cada petición en milisegundos antes de dejarla pasar. Nuestra plataforma actúa como un cortafuegos dual: uno diseñado para proteger el presupuesto de la empresa y otro diseñado para blindar sus datos corporativos.

### 1.2. El problema que resolvemos: Descontrol financiero y brechas de datos en IA

La adopción masiva de la inteligencia artificial ha introducido dos vulnerabilidades críticas que las empresas tradicionales no están preparadas para gestionar:

En primer lugar, el descontrol financiero provocado por los ataques de agotamiento de costes corporativos, conocidos como *cost exhaustion attacks*. Se trata de ataques donde actores maliciosos lanzan miles de peticiones automatizadas a la IA de una empresa, no para robar información, sino con el objetivo deliberado de inflar la factura del proveedor de IA hasta agotar el presupuesto de la víctima. A esto se suma el riesgo interno de los sistemas multiagente (IAs que interactúan entre sí de forma autónoma), los cuales pueden sufrir errores lógicos, entrar en bucles conversacionales infinitos y quemar miles de euros en una sola madrugada al realizar peticiones inútiles continuas.

En segundo lugar, las brechas de datos asociadas a los nuevos estándares de conexión. Con la llegada de protocolos como el *Model Context Protocol* (MCP, un estándar que permite a la IA conectarse y extraer información directamente de las bases de datos o herramientas de la empresa), el riesgo de fuga de información se multiplica. Si un usuario introduce comandos engañosos (*prompt injections*) para confundir a la IA, esta podría ejecutar consultas masivas en la base de datos y exponer información confidencial a la que no debería tener acceso.

### 1.3. ¿Qué vendemos exactamente?: Supervivencia financiera y seguridad (Zero-Trust)

Vendemos gobernanza absoluta sobre los sistemas de inteligencia artificial. Nuestro producto ofrece supervivencia operativa y predictibilidad financiera mediante la aplicación de controles *FinOps* (prácticas de gestión financiera en la nube) en tiempo real. En lugar de que la empresa reciba una factura sorpresa a final de mes, Unburn corta el gasto abusivo en el mismo instante en que se produce.

Junto al ahorro, vendemos seguridad bajo un modelo *Zero-Trust* (arquitectura de confianza cero, donde el sistema asume que ninguna petición es segura por defecto y verifica cada acción antes de permitirla). Garantizamos que los agentes de IA solo accedan a los datos estrictamente necesarios para su tarea, bloqueando cualquier extracción de información anómala o desproporcionada.

### 1.4. El origen y significado del nombre "Unburn"

En el ecosistema tecnológico y financiero de las startups, el término *burn rate* (tasa de quema) define la velocidad a la que una empresa gasta su capital disponible antes de generar beneficios. Quedarse sin caja por culpa de sobrecostes imprevistos de infraestructura es el mayor miedo de cualquier equipo directivo.

La palabra "Unburn" significa, literalmente, dejar de quemar dinero. Es un nombre nativo del entorno digital, provocador y directo, que conecta inmediatamente con la psicología de supervivencia de los fundadores y directores técnicos. No suena a un aburrido producto burocrático de cumplimiento normativo, sino a un alivio financiero inmediato y a eficiencia operativa.

## 2. Modelo de Negocio y Entrega del Servicio

### 2.1. Enfoque SaaS B2B (Software como Servicio)

Unburn se distribuye bajo un modelo SaaS (*Software as a Service*), lo que significa que los clientes no necesitan instalar hardware ni mantener servidores físicos complejos; nosotros alojamos toda la infraestructura en la nube. El servicio se entrega mediante suscripciones recurrentes de pago por uso (transaccional), lo que permite a las empresas pagar de forma proporcional al volumen de peticiones que nuestra pasarela procesa y protege.

### 2.2. Adopción mediante Product-Led Growth (Desarrolladores y plan Freemium)

Para penetrar en el mercado sin requerir un presupuesto de marketing multimillonario, emplearemos una estrategia de *Product-Led Growth* (crecimiento liderado por el propio producto). Esto significa que el producto es tan fácil de usar que se vende solo a través de la experiencia del usuario.

Para lograrlo, ofreceremos un plan *Freemium* (una capa básica totalmente gratuita, por ejemplo, hasta 10.000 peticiones al mes). Nuestro objetivo aquí son los desarrolladores físicos, *indie hackers* y pequeños programadores. Al ofrecerles una herramienta gratuita para proteger sus proyectos personales de facturas imprevistas, ellos mismos adoptan y prueban la tecnología. Una vez se enamoran de la simplicidad y el ahorro que genera Unburn, estos mismos desarrolladores se convierten en nuestros mejores comerciales, recomendando e introduciendo la herramienta en las medianas y grandes empresas donde trabajan.

### 2.3. Planes para PYMES, Startups y grandes Corporaciones

El modelo de precios se estructurará en distintos niveles (*Tiers*) para acompañar el crecimiento del cliente:

* **Plan Pro (PYMES y Startups):** Una suscripción mensual fija basada en paquetes de volumen (por ejemplo, 49€ al mes por asegurar y enrutar hasta 500.000 peticiones de IA). Este plan incluye acceso al panel de control completo, alertas en tiempo real y bloqueo avanzado de bucles.
* **Plan Enterprise (Corporaciones y Sectores Regulados):** Diseñado para empresas con agentes de IA críticos (como bancos, aseguradoras o clínicas de salud). Este nivel no tiene un precio público, sino que se negocia a medida. Incluye acuerdos de nivel de servicio garantizados (SLA, compromisos legales de tiempo de actividad), soporte técnico dedicado y acceso a nuestra arquitectura de máxima privacidad (Computación Confidencial).

### 2.4. Estrategia de venta: El ahorro demostrable como gancho y la seguridad como retención

La mayor barrera para vender ciberseguridad es que las empresas suelen ignorar el peligro hasta que sufren un ataque. Por ello, nuestra estrategia comercial no se basa en infundir miedo, sino en las matemáticas.

Usamos el ahorro directo como gancho de entrada. Ofrecemos a los clientes probar Unburn para que vean en su propio panel de control web métricas traducidas a impacto real, como "Hoy Unburn ha bloqueado 40 peticiones inútiles por un bucle infinito y te ha ahorrado 85€". Cuando el directivo comprueba que la suscripción de Unburn se paga sola con el dinero que le ahorra la plataforma, la decisión de compra es automática. Una vez que el cliente está integrado en nuestro sistema gracias al alivio financiero, lo retenemos a largo plazo gracias a la barrera de seguridad, la estabilidad operativa y el blindaje de sus datos corporativos.

