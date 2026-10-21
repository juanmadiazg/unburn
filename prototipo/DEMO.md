# Guion de demostración (6–7 minutos)

Este guion sirve para enseñar Unburn al profesor siguiendo el documento. Cada paso indica qué hacer, qué decir y qué parte del documento se está viendo.

## Antes de empezar (1 minuto, sin público)

1. Arranca el prototipo: `npm run dev` y abre http://localhost:5173.
2. En el menú **Demo**, elige **Administradora · Nexo Analytics** y pulsa **Restablecer datos de ejemplo**.
3. Deja la velocidad en **1×** y el tema en claro. Si proyectas en una sala oscura, usa el tema oscuro desde el menú de usuario.
4. Opcional: **Demo → Mostrar referencias al documento**, para que junto a cada título se vean los IDs (AP, BP, OF…).

---

## 1. La propuesta (30 s) · 1.2, 2.4

- Abre `/#/` (la landing).
- **Qué decir:** «Unburn se pone entre los agentes y OpenAI o Anthropic; el desarrollador solo cambia la dirección y la clave».
- **Qué señalar:** el cambio de dos líneas de código y la tabla de precios de 2.4 (Gratis, Pro y Enterprise).
- Pulsa **Ver la demo del panel** y entra como **Laura** desde los accesos de demostración.

## 2. El producto está vivo (45 s) · BP-08, BP-10, 4.2

- En el **Resumen**, señala el indicador **«En directo»**: el gasto de hoy y las peticiones facturables suben con cada petición.
- **Qué decir:** «Los agregados son cada 15 minutos; el gasto se ve con menos de 5 segundos de retraso».
- Muestra la fila de **Indicadores** (4.2):
  - coste medio por sesión resuelta;
  - bloqueos por seguridad;
  - latencia añadida p95, frente al objetivo de menos de 50 ms;
  - ahorro por modelo sustituto;
  - gasto evitado;
  - ROI.
- Señala la **previsión al cierre del mes** en la tarjeta de gasto (OF-16).
- Ve a **Presupuestos**: las **reservas en curso** aparecen y desaparecen al liquidarse, y cada presupuesto muestra su previsión al cierre y el día en que llegaría al límite.
- **Qué decir:** «Esto es reservar y liquidar: se aparta el peor caso y se cobra lo real».

## 3. Bucle entre agentes (1 min 15 s) · OF-05, OF-06, BP-09

- Pon la velocidad en **10×** para no esperar.
- **Demo → Escenarios → Bucle entre dos agentes.** Mientras corre, abre **Grafo de contexto**: la sesión nueva se dibuja en directo y el redactor y el investigador se pasan la misma tarea.
- Llega la alerta (campana y toast). Pulsa **Ver resultado**.
- En el **detalle del incidente**, señala:
  - la **causa raíz** (c04) y la recomendación;
  - el coste y la cota superior;
  - el **gasto evitado como rango con su hipótesis** (DEC-04);
  - la línea de tiempo de **BP-09**.
- Opcional: en **Canales de alerta → Bandeja**, enseña cómo ha llegado a Slack y por email.

## 4. Escudo de herramientas y caminos indirectos (1 min) · OF-07, OF-08

- **Demo → Escenarios → Prompt injection y camino indirecto.**
- **Qué decir:** «El escudo quita la herramienta de la petición y bloquea la respuesta que la pide (403). Después el agente lo intenta a través de otro agente».
- Pulsa **Ver resultado**, que lleva a **Agentes y permisos**. Señala:
  - el **grafo de autorización** y el aviso de caminos indirectos;
  - el camino **CI-01** (agente-soporte → agente-sql → datos personales).
- Haz clic en **CI-01** en la lista de caminos y pulsa **Quitar delegación soporte → sql**: el aviso desaparece porque se recalcula en vivo con cada cambio.

## 5. Sistema inmunológico (45 s) · OF-10

- **Demo → Escenarios → Ataque de consumo** (sigue a 10×).
- En el incidente resultante, enseña la **respuesta por grados** sobre un solo usuario final: aviso → 429 → modelo económico → bloqueo temporal, y límites endurecidos 24 h.
- **Qué decir:** «El resto del chatbot sigue funcionando: solo se actúa sobre la parte afectada».

## 6. Probador de peticiones (45 s) · BPMN de BP-08

- Abre **Probador de peticiones**.
- Elige **«No cabe en el presupuesto (402)»**, la clave `equipo-datos`, y pulsa **Enviar**.
- **Qué decir:** «Este es el BPMN de 10.4, paso a paso, con la latencia de cada paso. Corta en la reserva con un 402 y no llega a llamar al proveedor, así que no cuenta en la cuota (DEC-03)».
- Si hay tiempo, prueba **«Petición normal»** para ver el recorrido completo y la liquidación.

## 7. Soporte a la decisión (45 s) · OF-16, OF-17, DEC-34

- Abre **Recomendaciones**. Señala:
  - «Probar un modelo más económico en agente-…», con el ahorro mensual estimado. Unburn no lee el contenido, así que solo propone probarlo (DEC-34);
  - la evidencia («Ver los datos»).
- Pulsa el botón de la recomendación: se publica una nueva versión de la configuración en el Gateway (toast con `cfg-vNN`) y el cambio aparece en el **registro de auditoría**.
- Opcional: **Gasto y sesiones → Por modelo**.

## 8. Roles y planes (30 s) · 8, 2.4

- **Demo → Lector · Nexo Analytics:** las mismas pantallas, con los botones de cambio bloqueados con candado. El auditor sí puede exportar y verificar el registro de auditoría.
- **Demo → Administrador · cuenta personal (Gratis):**
  - el botón de crear clave está desactivado (3/3);
  - las alertas solo van por email;
  - el diagnóstico causal está bloqueado.
- Opcional: **Escenario de cuota** → el servicio se corta con 402 → **Pasar a Pro** lo reactiva.

## 9. Back-office (45 s) · AP-12

- **Demo → Unburn · Dirección:** **Cuadro de mando** con ingresos, objetivos de servicio, **versiones pendientes de aprobar** (BP-16) y la sección **«Para decidir»**. En **Informe mensual**, señala los cambios de plan y el margen de cada plan (OF-18).
- **Demo → Unburn · Ventas → Contratos Enterprise:** embudo de oportunidades. La firma exige la **revisión de Legal** y, al firmar, **prepara el alta** del cliente.
- Cierra mencionando que cada departamento solo ve su parte de la consola: Soporte (tickets), Ingeniería (incidencias, versiones y catálogo), Finanzas (cobros y proveedores) y Legal.

---

## Si algo sale distinto

- **Un escenario no se puede lanzar:** hay otro en curso. Espera a que termine o pulsa **Detener**.
- **Los datos han quedado raros tras varios escenarios:** usa **Demo → Restablecer datos de ejemplo**.
- **Quieres repetir el bucle con aviso en lugar de bloqueo:** en **Claves virtuales → prod-equipo-research**, cambia «Si detecta un bucle» a «Avisar» y vuelve a lanzarlo.
