# Mapa de la organización de Unburn

## 1. Introducción

El mapa de la organización muestra cómo está organizada Unburn por dentro (unidades de negocio y departamentos), con quién se relaciona por fuera (socios, proveedores y otras entidades) y qué relación hay entre ellos.

Como Unburn es un SaaS, la empresa emprendedora y la que explota el sistema son la misma. La excepción es el despliegue privado, en el que el cliente explota su propia instalación. Aun así, la organización de Unburn es la misma, así que se presenta un único mapa.

## 2. Leyenda

| Color | Tipo de elemento |
|---|---|
| Azul | Organización (Unburn) |
| Verde | Unidad de negocio |
| Morado | Departamento |
| Naranja | Socio |
| Rojo | Proveedor |
| Gris | Otra entidad externa |

## 3. Elementos del mapa

### 3.1. Organización

- **Unburn:** startup que ofrece una plataforma por internet que se coloca entre las aplicaciones de IA de las empresas y los proveedores de modelos de IA. Controla cuánto gastan, qué pueden hacer sus agentes y deja registro de todo.

### 3.2. Unidades de negocio

| Unidad | Qué ofrece |
|---|---|
| **Unburn Autoservicio** | Planes Gratis y Pro, que el cliente contrata solo desde la web. Pensada para desarrolladores, startups y PYMES. |
| **Unburn Enterprise** | Contratos personalizados para grandes empresas y sectores regulados (banca, seguros, salud), con más garantías y más privacidad. Se ofrece en dos modalidades: Unburn Cloud Confidencial (nube con computación confidencial) y despliegue privado en la infraestructura del cliente. |

### 3.3. Departamentos

| Departamento | Qué hace |
|---|---|
| **Dirección** | Los fundadores. Deciden la estrategia y en qué se invierten los recursos. |
| **Ingeniería y Ciberseguridad** | Construye la plataforma, la mantiene funcionando y la protege frente a ataques. |
| **Soporte** | Ayuda a los clientes a empezar a usar Unburn y resuelve sus dudas e incidencias. |
| **Ventas** | Vende los contratos para grandes empresas y gestiona la relación con los socios. |
| **Finanzas** | Cobra las suscripciones y controla los gastos de Unburn. |
| **Legal y cumplimiento** | Prepara los contratos y se asegura de que Unburn cumple la ley (protección de datos, regulación de la IA, etc.). Al principio puede ser un asesor externo. |

### 3.4. Socios

| Socio | Qué aporta |
|---|---|
| **Agencias de automatización** | Montan agentes de IA para PYMES y les recomiendan Unburn a cambio de una comisión. |
| **Plataformas de automatización y de agentes** | Dan a conocer Unburn a sus usuarios en sus guías de integración. |
| **Marketplace del proveedor de cloud** | Tienda online donde las grandes empresas pueden contratar Unburn a través de su cuenta de cloud. |

### 3.5. Proveedores

| Proveedor | Qué servicio da a Unburn |
|---|---|
| **Proveedor de cloud** | Los servidores, las bases de datos y el resto de infraestructura donde funciona Unburn, alojados en la Unión Europea. |
| **Plataforma de pagos** | Cobra las suscripciones de los clientes. |
| **Plataforma de desarrollo** | Guarda el código de Unburn y lo prueba y publica de forma automática. |

### 3.6. Otras entidades externas

| Entidad | Quién es |
|---|---|
| **Clientes** | Empresas y desarrolladores que contratan Unburn. Dentro de cada cliente, el **administrador** configura Unburn y el **desarrollador** conecta su aplicación. |
| **Usuarios finales** | Personas que usan la aplicación de IA del cliente (por ejemplo, un chatbot). No saben que Unburn existe, pero sus peticiones pasan por él. |
| **Proveedores de modelos de IA** | Empresas que ejecutan los modelos de IA. El cliente los contrata y les paga directamente; Unburn solo les reenvía las peticiones. |
| **Auditores** | Revisan qué hizo la IA del cliente, cuánto costó y por qué se permitió o bloqueó cada acción. |
| **Reguladores** | Autoridades que vigilan el cumplimiento de la ley en protección de datos e inteligencia artificial. |
| **Inversores** | Aportan el dinero para que la startup funcione a cambio de una parte de la empresa. |

## 4. Relaciones

| Desde | Hacia | Relación |
|---|---|---|
| Unburn | Unburn Autoservicio y Unburn Enterprise | Se organiza en estas dos líneas de negocio. |
| Unburn | Departamentos | Se organiza internamente en estos seis departamentos. |
| Inversores | Dirección | Aportan dinero e influyen en la estrategia. |
| Dirección | Departamentos | Marca las prioridades y reparte los recursos. |
| Unburn Autoservicio | Clientes | Les da el servicio con los planes Gratis y Pro. |
| Unburn Enterprise | Clientes | Les da el servicio con un contrato personalizado. |
| Ingeniería | Proveedor de cloud | Instala y mantiene la plataforma en su infraestructura. |
| Ingeniería | Plataforma de desarrollo | Desarrolla y publica las nuevas versiones. |
| Unburn | Proveedores de modelos de IA | Les reenvía las peticiones de los clientes. |
| Clientes | Proveedores de modelos de IA | Les pagan directamente por el uso de la IA. |
| Usuarios finales | Clientes | Usan su aplicación de IA, cuyo tráfico pasa por Unburn. |
| Soporte | Clientes | Les ayuda a empezar y resuelve sus incidencias. |
| Ventas | Clientes | Vende los contratos Enterprise a las grandes empresas. |
| Ventas | Socios | Gestiona los acuerdos con agencias, plataformas y el marketplace. |
| Socios | Clientes | Llevan nuevos clientes a Unburn. |
| Marketplace del proveedor de cloud | Unburn Enterprise | Cobra a las grandes empresas las contrataciones hechas en su tienda y después paga a Unburn. |
| Clientes | Plataforma de pagos | Pagan su suscripción a Unburn. |
| Finanzas | Plataforma de pagos | Cobra las suscripciones. |
| Finanzas | Socios | Paga las comisiones por los clientes que traen. |
| Finanzas | Proveedores (de cloud, de pagos y de desarrollo) | Compara ofertas y controla sus costes. |
| Legal | Clientes y proveedores | Firma los contratos con ellos. |
| Legal | Reguladores | Se asegura de que Unburn cumple la ley. |
| Auditores | Clientes | Revisan su uso de la IA con el registro que guarda Unburn. |

## 5. Claves para leer el mapa

- **Hay dos pagos distintos:** el cliente paga a Unburn la suscripción y paga aparte al proveedor de modelos de IA lo que gasta en IA. Unburn no vende IA: controla un gasto que cobra otro.
- **Los proveedores de modelos de IA no son proveedores de Unburn**, porque los contrata el cliente. Aun así, Unburn depende de ellos para funcionar.
- **Los socios son propuestas**, no acuerdos firmados.