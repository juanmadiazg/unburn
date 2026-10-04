# Stakeholders de Unburn

## Stakeholders internos

1. **Fundadores y Dirección.** Son los creadores de la startup (por ejemplo, el CEO y el CTO). Deciden la estrategia, las prioridades del producto y en qué se gasta el dinero.
    - **Importancia (alta):** su trabajo y su patrimonio dependen de que Unburn crezca, sea rentable y se diferencie de la competencia.
    - **Influencia (alta):** toman las decisiones finales sobre qué se construye, cuándo y con qué recursos.

2. **Ingeniería y Ciberseguridad.** Diseñan, construyen y mantienen la plataforma, vigilan que funcione en todo momento y la protegen frente a ataques.
    - **Importancia (alta):** son responsables de que la plataforma funcione y sea segura, algo crítico porque Unburn guarda las claves de los clientes y ve todo su tráfico de IA, lo que lo convierte en un objetivo valioso para los atacantes.
    - **Influencia (alta):** deciden cómo se construye el producto y qué es técnicamente posible.

3. **Soporte.** Ayudan a los clientes a conectar sus aplicaciones a Unburn y a resolver dudas e incidencias, por ejemplo por qué se ha bloqueado una petición.
    - **Importancia (alta):** su trabajo diario depende de cómo funcione el producto: cuanto más claro y fiable sea, menos incidencias tienen que resolver.
    - **Influencia (media):** no deciden sobre el producto, pero trasladan al resto del equipo las quejas y necesidades reales de los clientes.

4. **Ventas.** Venden los contratos para grandes empresas y gestionan las relaciones con los socios que ayudan a vender Unburn.
    - **Importancia (alta):** su trabajo depende de tener funciones diferenciales y demostraciones convincentes que ofrecer.
    - **Influencia (media):** lo que piden los grandes clientes puede cambiar las prioridades del producto.

5. **Finanzas.** Cobran las suscripciones de los clientes, pagan las comisiones de los socios y controlan los costes de la propia Unburn. Gestionan el dinero de Unburn, no el que los clientes gastan en IA, que pagan directamente al proveedor de modelos de IA.
    - **Importancia (media):** el producto define qué tienen que cobrar y cuánto cuesta mantenerlo, por ejemplo el plan gratuito.
    - **Influencia (media):** sus cifras condicionan los precios de los planes y el gasto en infraestructura.

6. **Legal y cumplimiento.** Se encargan de los contratos con clientes y proveedores y de que Unburn cumpla la normativa: protección de datos (RGPD), Reglamento Europeo de IA, Data Act, DORA y Cyber Resilience Act. En una startup suele ser un asesor externo.
    - **Importancia (media):** cada función nueva puede crear obligaciones legales que tienen que revisar, aunque no participan en el desarrollo diario.
    - **Influencia (alta):** pueden frenar un lanzamiento o una función si no cumple la ley.

## Stakeholders externos

7. **Cliente.** La empresa o persona que contrata y paga Unburn: desarrolladores individuales, startups, PYMES y grandes empresas. Dentro del cliente, la compra la deciden sus responsables: el director financiero, el responsable de seguridad y el responsable de protección de datos.
    - **Importancia (alta):** todo su tráfico de IA pasa por Unburn, así que de él dependen su gasto en IA, la seguridad de sus datos y herramientas, y que su IA siga funcionando.
    - **Influencia (alta):** es quien paga, y puede irse a la competencia si el producto no le convence.

8. **Administrador del cliente.** La persona que configura Unburn en el panel web: crea las claves, fija los presupuestos, da permisos a cada agente y recibe las alertas.
    - **Importancia (alta):** es quien usa Unburn a diario y quien responde si la IA de su empresa gasta de más o hace algo indebido.
    - **Influencia (alta):** su experiencia con el producto decide en gran parte si su empresa sigue usándolo.

9. **Desarrollador del cliente.** La persona que conecta la aplicación de su empresa a Unburn cambiando una dirección y una clave en el código.
    - **Importancia (alta):** su aplicación depende de Unburn: si Unburn es lento, falla o devuelve errores poco claros, el problema le llega a él.
    - **Influencia (media):** no decide la compra, pero suele ser quien descubre Unburn y lo propone en su empresa, así que es clave para que el producto se extienda.

10. **Usuario final del cliente.** La persona que usa la aplicación de IA del cliente, por ejemplo un chatbot. Normalmente no sabe que Unburn existe. Puede ser un usuario normal o un atacante que intenta hacer gastar dinero al cliente.
    - **Importancia (media):** aunque no lo sepa, sus peticiones pasan por Unburn: si Unburn las bloquea o falla, la aplicación deja de responderle.
    - **Influencia (baja):** no decide nada sobre Unburn, aunque su comportamiento, normal o abusivo, es justo lo que Unburn tiene que vigilar y frenar cuando hace falta.

11. **Auditores.** Personas, de la propia empresa cliente o externas, que revisan qué hizo la IA, cuánto costó y por qué se permitió o se bloqueó cada acción.
    - **Importancia (media):** su trabajo depende de que el registro de Unburn sea completo, no se pueda manipular y se conserve el tiempo que exige la ley, pero solo lo usan cuando hay una auditoría.
    - **Influencia (media):** si el registro de Unburn no les sirve, el cliente puede descartar el producto, sobre todo en sectores regulados.

12. **Proveedores de modelos de IA.** Empresas que ejecutan los modelos de IA y cobran al cliente por su uso.
    - **Importancia (baja):** Unburn les afecta poco: les hace llegar algo más de uso de sus modelos y compite en parte con ellos, porque ellos ofrecen sus propios límites de gasto.
    - **Influencia (alta):** Unburn solo funciona si sus servicios funcionan, y cualquier cambio en sus precios o funciones obliga a adaptar Unburn.

13. **Proveedores tecnológicos de Unburn.** Las empresas cuyos servicios usa Unburn para funcionar: el proveedor de cloud (servidores y almacenamiento de datos), la plataforma de pagos (cobro de suscripciones) y la plataforma de desarrollo (guarda el código y lo prueba y publica de forma automática).
    - **Importancia (baja):** para ellos, Unburn es un cliente más que usa y paga sus servicios.
    - **Influencia (alta):** si fallan o cambian sus condiciones, Unburn deja de funcionar o tiene que adaptarse.

14. **Socios.** Empresas que ayudan a Unburn a llegar a más clientes: agencias que montan agentes de IA para PYMES, plataformas de automatización y de agentes como n8n o LangChain, y el marketplace de AWS. Por ahora son propuestas, no acuerdos firmados.
    - **Importancia (media):** pueden ganar comisiones por cada cliente que traen o una integración útil para sus propios usuarios, pero su negocio no depende de Unburn.
    - **Influencia (media):** pueden acelerar mucho la llegada de clientes, sobre todo PYMES, pero Unburn puede crecer también sin ellos.

15. **Inversores.** Aportan el dinero para que la startup funcione a cambio de una parte de la empresa.
    - **Importancia (alta):** el éxito o el fracaso del proyecto decide si recuperan su inversión con beneficios o la pierden.
    - **Influencia (alta):** pueden condicionar la estrategia y decidir si aportan más dinero en el futuro.

16. **Reguladores y autoridades.** Organismos públicos que vigilan que se cumpla la ley: la Agencia Española de Protección de Datos, la Agencia Española de Supervisión de la Inteligencia Artificial (AESIA) y la Oficina Europea de IA, entre otros. En banca y seguros también afectan los supervisores financieros, de forma indirecta a través de los clientes.
    - **Importancia (baja):** Unburn es una empresa más de las muchas que supervisan; lo que les importa es que se cumpla la ley en general.
    - **Influencia (alta):** las normas que aplican obligan a diseñar el producto de una forma concreta (por ejemplo, minimizar los datos, que lleva a Unburn a no guardar el texto de las peticiones, o permitir que los clientes conserven sus registros el tiempo que exige el Reglamento Europeo de IA), y pueden imponer sanciones.