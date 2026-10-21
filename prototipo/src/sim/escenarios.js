// Escenarios de demostración. Cada uno recorre de punta a punta procesos del documento
// usando el mismo motor que el tráfico normal, así que respetan la configuración actual
// (política de bucles de la clave, modo del escudo, delegaciones, plan contratado…).
import { caminosIndirectos } from '../lib/dominio'
import { isoLocal } from '../lib/tiempo'

const r2 = (n) => Math.round(n * 100) / 100

export const ESCENARIOS = [
  {
    id: 'bucle', titulo: 'Bucle entre dos agentes', refs: 'BP-08 → BP-09 · OF-02, OF-05, OF-06',
    descripcion: 'Dos agentes se pasan la misma tarea. Unburn agrupa la sesión, detecta la repetición por su huella, aplica la política de la clave (avisar o bloquear con 422), diagnostica la causa raíz y estima el gasto evitado.',
    ejecutar: escenarioBucle,
  },
  {
    id: 'ataque', titulo: 'Ataque de consumo (denial of wallet)', refs: 'BP-08 → BP-09 · OF-10',
    descripcion: 'Un usuario final dispara peticiones enormes contra el chatbot. El sistema inmunológico responde por grados solo sobre ese usuario: avisa, frena (429) y, en Pro y Enterprise, cambia a un modelo más barato, bloquea y endurece los límites 24 h.',
    ejecutar: escenarioAtaque,
  },
  {
    id: 'presupuesto', titulo: 'Presupuesto al límite', refs: 'BP-06, BP-08 · OF-03 · DEC-05, DEC-06',
    descripcion: 'Un agente lanza una tarea masiva. Las reservas suben y bajan al liquidarse, salta la alerta del límite blando y, al llegar al duro, Unburn corta con 402 sin reenviar al proveedor.',
    ejecutar: escenarioPresupuesto,
  },
  {
    id: 'inyeccion', titulo: 'Prompt injection y camino indirecto', refs: 'BP-07, BP-08 · OF-07, OF-08 · DEC-10, DEC-12',
    descripcion: 'Un mensaje manipulado intenta que el chatbot consulte la base de datos de clientes. El escudo MCP quita la herramienta y bloquea la respuesta (403); después el agente lo intenta delegando en otro agente con acceso.',
    ejecutar: escenarioInyeccion,
  },
  {
    id: 'cuota', titulo: 'Cuota de la suscripción al 80 % y al 100 %', refs: 'BP-12 → BP-03 · OF-13 · DEC-03',
    descripcion: 'El tráfico agota las peticiones incluidas. En Gratis el servicio se corta (402) hasta cambiar de plan; en Pro empieza el excedente y se avisa al 80 % y al 100 % del tope.',
    ejecutar: escenarioCuota,
  },
]

// ------------------------------------------------------------------ 1. Bucle
async function escenarioBucle(api) {
  const d = api.datos()
  const nexo = api.orgId === 'org_nexo'
  const claveId = nexo ? 'kv_research' : 'kv_tfg'
  const clave = d.clavesVirtuales.find((k) => k.id === claveId)
  if (!clave || clave.estado !== 'activa') return api.toast('La clave del escenario no está activa', 'error', 'Restablece los datos de ejemplo')
  const modelo = clave.modelos[0]
  const sid = api.sesion(nexo ? 'Informe trimestral de competencia' : 'Script de resumen de apuntes (TFG)', claveId)
  const base = { claveId, sesionId: sid, modeloPedido: modelo, modeloUsado: modelo }
  const huella = 'b7e2…19fa'
  const pasos = nexo ? [
    { llamada: 'c01', agente: 'agente-orquestador', t: [6200, 900, 0, 0] },
    { llamada: 'c02', agente: 'agente-investigador', encargadoPor: 'agente-orquestador', herramienta: 'buscar_documentos', t: [9400, 1200, 0, 4200], motivo: 'Delegación permitida (orquestador → investigador)' },
    { llamada: 'c03', agente: 'agente-redactor', encargadoPor: 'agente-orquestador', t: [15200, 2900, 0, 9000], motivo: 'Delegación permitida (orquestador → redactor)' },
    { llamada: 'c04', agente: 'agente-investigador', encargadoPor: 'agente-redactor', herramienta: 'buscar_documentos', t: [22800, 1500, 0, 15200], causaRaiz: true, huella, motivo: 'Delegación permitida (redactor → investigador)' },
    { llamada: 'c05', agente: 'agente-redactor', encargadoPor: 'agente-investigador', t: [30100, 1900, 0, 22800], enBucle: true, huella },
    { llamada: 'c06', agente: 'agente-investigador', encargadoPor: 'agente-redactor', herramienta: 'buscar_documentos', t: [37600, 1500, 0, 30100], enBucle: true, huella },
    { llamada: 'c07', agente: 'agente-redactor', encargadoPor: 'agente-investigador', t: [45200, 1950, 0, 37600], enBucle: true, huella },
    { llamada: 'c08', agente: 'agente-investigador', encargadoPor: 'agente-redactor', herramienta: 'buscar_documentos', t: [52700, 1520, 0, 45200], enBucle: true, huella },
  ] : [
    { llamada: 'c01', agente: '(sin declarar)', t: [4200, 600, 0, 0] },
    { llamada: 'c02', agente: '(sin declarar)', herramienta: 'web_search', t: [5100, 640, 0, 0], causaRaiz: true, huella },
    { llamada: 'c03', agente: '(sin declarar)', herramienta: 'web_search', t: [5180, 640, 0, 0], enBucle: true, huella },
    { llamada: 'c04', agente: '(sin declarar)', herramienta: 'web_search', t: [5240, 640, 0, 0], enBucle: true, huella },
    { llamada: 'c05', agente: '(sin declarar)', herramienta: 'web_search', t: [5300, 640, 0, 0], enBucle: true, huella },
  ]
  api.paso('Agentes trabajando en la sesión ' + sid)
  let costeBucle = 0
  const implicadas = []
  for (const p of pasos) {
    await api.esperar(1300)
    const coste = api.coste(modelo, p.t)
    if (p.enBucle || p.causaRaiz) { costeBucle += coste; implicadas.push(p.llamada) }
    api.peticion({ ...base, ...p, tokens: p.t, costeReal: coste, costeEstimado: coste * 1.8 + 0.01, latenciaMs: 4000 + Math.random() * 3000 })
  }
  await api.esperar(1300)
  const bloquea = clave.politicaBucles === 'bloqueo'
  const ultima = pasos[pasos.length - 1]
  const sig = { llamada: `c${String(pasos.length + 1).padStart(2, '0')}`, agente: nexo ? 'agente-redactor' : '(sin declarar)', encargadoPor: nexo ? 'agente-investigador' : null, herramienta: nexo ? null : 'web_search', enBucle: true, huella }
  const regla = nexo ? `Regla bucle.ping_pong: 4 intercambios con la misma huella (${huella}) entre agente-redactor y agente-investigador` : `Regla bucle.repeticion: misma acción con el mismo resultado 4 veces (${huella})`
  implicadas.push(sig.llamada)
  if (bloquea) {
    api.paso('Bucle detectado: la política de la clave es «bloquear»')
    api.peticion({ ...base, ...sig, tokens: [0, 0, 0, 0], decision: 'bloqueada', codigo: 422, motivo: `${regla} · política de la clave: bloqueo · 422`, costeReal: 0, costeEstimado: 0, latenciaMs: 4 })
  } else {
    api.paso('Bucle detectado: la política de la clave es «avisar» (respuesta marcada)')
    const coste = api.coste(modelo, ultima.t)
    costeBucle += coste
    api.peticion({ ...base, ...sig, tokens: ultima.t, costeReal: coste, costeEstimado: coste * 1.8, motivo: `${regla} · política: aviso (respuesta marcada con X-Unburn-Loop-Warning)` })
  }
  await api.esperar(900)
  api.paso('BP-09: registrando el incidente y diagnosticando la causa')
  const pro = api.plan().diagnosticoCausal
  const inc = api.incidente({
    orgId: api.orgId, tipo: 'bucle', subtipo: nexo ? 'ping_pong' : 'repeticion',
    titulo: nexo ? 'Bucle entre agente-redactor y agente-investigador' : `Bucle en ${clave.nombre}`,
    claveId, sesionId: sid, agente: nexo ? 'agente-redactor' : null, parteAfectada: `Sesión ${sid} (clave ${clave.nombre})`,
    respuestaAplicada: bloquea ? `Bloqueo (422) de la llamada ${sig.llamada}. La política de bucles de la clave es «bloqueo».` : 'Solo aviso: la política de bucles de la clave es «aviso». Las respuestas van marcadas y el gasto continúa.',
    costeIncidente: r2(costeBucle), cotaSuperior: pro ? r2(costeBucle * 1.12) : null,
    ahorro: bloquea ? { min: Math.round(costeBucle * 5), max: Math.round(costeBucle * 8.5), hipotesis: 'Si Unburn no hubiera bloqueado la llamada, el intercambio habría seguido al ritmo observado (una llamada cada 1,3 s, cada vez más cara porque el historial crece) hasta que alguien lo detectara a mano, entre 2 y 3 horas fuera de horario.' } : null,
    costePrevisto: bloquea ? null : { valor: r2(costeBucle * 40), hipotesis: 'Al ritmo observado durante las próximas 2 horas.' },
    causaRaiz: pro ? (nexo ? { llamadaId: 'c04', agente: 'agente-redactor', explicacion: 'En c04, agente-redactor encargó a agente-investigador confirmar una cifra que no aparece en ninguna fuente. El investigador devolvió siempre «no confirmado» y el redactor volvió a encargarlo: las llamadas siguientes tienen la misma huella.', recomendacion: 'Limitar a 2 los reintentos de verificación en el prompt del redactor, o quitar la delegación redactor → investigador.' } : null) : null,
    huellas: [huella], llamadasImplicadas: implicadas,
  })
  api.mutar((d) => ({ ...d, sesiones: d.sesiones.map((s) => (s.id === sid ? { ...s, incidenteId: inc.id, estado: bloquea ? 'bloqueada' : 'activa', enDirecto: false } : s)) }))
  api.fin(`Incidente ${inc.id} creado`, `/app/incidentes/${inc.id}`)
}

// ------------------------------------------------------------------ 2. Ataque de consumo
async function escenarioAtaque(api) {
  const d = api.datos()
  const nexo = api.orgId === 'org_nexo'
  const claveId = nexo ? 'kv_chatbot' : 'kv_telegram'
  const clave = d.clavesVirtuales.find((k) => k.id === claveId)
  if (!clave || clave.estado !== 'activa') return api.toast('La clave del escenario no está activa', 'error')
  const plan = api.plan()
  const modelo = clave.modelos[0]
  const atacante = 'usr_9c41…d7'
  const legitimo = () => ({ claveId, agente: clave.agentes[0] || '(sin declarar)', modeloPedido: modelo, modeloUsado: modelo, usuarioFinal: ['usr_02bd…71', 'usr_4c1e…a9', 'usr_b310…5f'][Math.floor(Math.random() * 3)], tokens: [2400, 300, 0, 0], costeReal: api.coste(modelo, [2400, 300, 0, 0]), costeEstimado: 0.02 })
  const grande = [clave.maxEntrada - 200, clave.maxRespuesta, 0, 0]
  const ataque = (extra) => ({ claveId, agente: clave.agentes[0] || '(sin declarar)', modeloPedido: modelo, modeloUsado: modelo, usuarioFinal: atacante, tokens: grande, costeReal: api.coste(modelo, grande), costeEstimado: api.coste(modelo, grande) * 1.1, ...extra })
  const parte = `Usuario final ${atacante} (seudónimo) en ${clave.nombre}`
  let coste = 0

  api.paso('Tráfico normal del chatbot')
  for (let i = 0; i < 2; i++) { await api.esperar(900); api.peticion(legitimo()) }
  api.paso(`Ráfaga de peticiones enormes del usuario ${atacante}`)
  for (let i = 0; i < 3; i++) { await api.esperar(500); const p = ataque({}); coste += p.costeReal; api.peticion(p) }
  await api.esperar(700)
  const pa = ataque({ motivo: 'Sistema inmunológico: consumo 3,4× la línea base del usuario final · respuesta: aviso' })
  coste += pa.costeReal; api.peticion(pa)
  const incA = api.incidente({ orgId: api.orgId, tipo: 'consumo_anomalo', subtipo: 'usuario_final', titulo: `Consumo anómalo de un usuario final en ${clave.nombre}`, claveId, sesionId: null, agente: clave.agentes[0] || null, parteAfectada: parte, respuestaAplicada: 'Aviso (3,4× la línea base). El resto del tráfico de la clave no se ve afectado.', costeIncidente: r2(coste), lineaBase: { eurosMinuto: clave.lineaBase.eurosMin, observado: r2(clave.lineaBase.eurosMin * 3.4), factor: 3.4 } })
  await api.esperar(1000)
  api.peticion(legitimo())
  api.paso('Respuesta gradual: frenar con 429')
  for (let i = 0; i < 2; i++) { await api.esperar(700); api.peticion(ataque({ decision: 'frenada', codigo: 429, motivo: 'Sistema inmunológico: consumo 6,2× la línea base del usuario final · respuesta: frenar · 429', costeReal: 0, costeEstimado: 0, latenciaMs: 3 })) }
  api.actualizarIncidente(incA.id, { respuestaAplicada: 'Aviso (3,4×) → freno 429 (6,2×). Solo sobre este usuario final.', lineaBase: { eurosMinuto: clave.lineaBase.eurosMin, observado: r2(clave.lineaBase.eurosMin * 6.2), factor: 6.2 } })
  await api.esperar(900)
  api.peticion(legitimo())
  const respuestas = plan.respuestasInmunologico || ['aviso', 'freno']
  if (respuestas.includes('modelo') && clave.modeloSustituto) {
    api.paso(`Cambio a un modelo más económico (${clave.modeloSustituto})`)
    for (let i = 0; i < 2; i++) {
      await api.esperar(800)
      const c = api.coste(clave.modeloSustituto, grande)
      coste += c
      api.peticion(ataque({ decision: 'modelo sustituido', modeloUsado: clave.modeloSustituto, costeReal: c, motivo: `Sistema inmunológico: consumo 9,1× la línea base · respuesta: cambiar a modelo económico (${modelo} → ${clave.modeloSustituto})` }))
    }
    api.paso('Bloqueo temporal del usuario final')
    for (let i = 0; i < 2; i++) { await api.esperar(700); api.peticion(ataque({ decision: 'bloqueada', codigo: 429, motivo: 'Sistema inmunológico: consumo 14,3× la línea base · respuesta: bloqueo temporal del usuario final (15 min) · 429', costeReal: 0, costeEstimado: 0, latenciaMs: 2 })) }
    const hasta = new Date(Date.now() + 24 * 3600e3)
    api.mutar((dd) => ({ ...dd, clavesVirtuales: dd.clavesVirtuales.map((k) => (k.id === claveId ? { ...k, lineaBase: { ...k.lineaBase, endurecidoHasta: isoLocal(hasta) } } : k)) }))
    api.actualizarIncidente(incA.id, {
      respuestaAplicada: `Respuesta por grados: aviso (3,4×) → freno 429 (6,2×) → modelo económico ${clave.modeloSustituto} (9,1×) → bloqueo temporal (14,3×). Límites endurecidos 24 h solo para este usuario final; el resto del chatbot sigue funcionando.`,
      endurecidoHasta: isoLocal(hasta), costeIncidente: r2(coste),
      ahorro: { min: Math.round(coste * 18 + 12), max: Math.round(coste * 28 + 20), hipotesis: 'Peticiones del tamaño máximo cada pocos segundos, como las observadas antes de la respuesta, mantenidas durante el resto de la jornada (6 h). Es el patrón de un ataque para hacer gastar dinero.' },
      lineaBase: { eurosMinuto: clave.lineaBase.eurosMin, observado: r2(clave.lineaBase.eurosMin * 14.3), factor: 14.3 },
    })
  } else {
    api.actualizarIncidente(incA.id, { respuestaAplicada: 'Aviso (3,4×) → freno 429 (6,2×). En el plan Gratis la respuesta se limita a avisar y frenar: sin modelo económico, bloqueo temporal ni límites endurecidos.', ahorro: { min: Math.round(coste * 6 + 1), max: Math.round(coste * 10 + 2), hipotesis: 'Ráfaga mantenida 2 horas al ritmo observado antes del freno.' } })
  }
  await api.esperar(900)
  api.peticion(legitimo())
  api.fin(`Consumo anómalo contenido (${incA.id})`, `/app/incidentes/${incA.id}`)
}

// ------------------------------------------------------------------ 3. Presupuesto
async function escenarioPresupuesto(api) {
  const d = api.datos()
  const nexo = api.orgId === 'org_nexo'
  const claveId = nexo ? 'kv_chatbot' : 'kv_telegram'
  const clave = d.clavesVirtuales.find((k) => k.id === claveId)
  const pres = d.presupuestos.find((b) => b.claveId === claveId && b.periodo === 'diario')
  if (!clave || clave.estado !== 'activa' || !pres) return api.toast('Falta la clave o el presupuesto diario del escenario', 'error', 'Restablece los datos de ejemplo')
  const modelo = clave.modelos[0]
  const t = [clave.maxEntrada - 100, clave.maxRespuesta, 0, 0]
  const c = api.coste(modelo, t)
  api.paso(`Tarea masiva en ${clave.nombre}: presupuesto diario ${pres.limiteBlando} € / ${pres.limiteDuro} €`)
  let rechazos = 0
  for (let ronda = 0; ronda < 60 && rechazos < 4; ronda++) {
    await api.esperar(550)
    for (let i = 0; i < 12; i++) {
      const p = api.peticion({ claveId, agente: clave.agentes[0] || '(sin declarar)', modeloPedido: modelo, modeloUsado: modelo, tokens: t, costeReal: c, costeEstimado: c * 1.6, latenciaMs: 1500 + Math.random() * 2500 })
      if (p?.codigo === 402) rechazos++
      if (rechazos >= 4) break
    }
    const b = api.datos().presupuestos.find((x) => x.id === pres.id)
    api.paso(`Gastado ${b.gastado.toFixed(2).replace('.', ',')} € · reservado ${b.reservado.toFixed(2).replace('.', ',')} € de ${b.limiteDuro} €`)
  }
  const inc = api.datos().incidentes.find((i) => i.claveId === claveId && i.tipo === 'presupuesto_agotado' && i.estado === 'abierto')
  api.fin('Presupuesto agotado: las peticiones se rechazan con 402', inc ? `/app/incidentes/${inc.id}` : '/app/presupuestos')
}

// ------------------------------------------------------------------ 4. Prompt injection
async function escenarioInyeccion(api) {
  const d = api.datos()
  const nexo = api.orgId === 'org_nexo'
  if (!nexo) return escenarioInyeccionGratis(api)
  const clave = d.clavesVirtuales.find((k) => k.id === 'kv_chatbot')
  if (!clave || clave.estado !== 'activa') return api.toast('La clave del escenario no está activa', 'error')
  const grafo = d.grafos.org_nexo
  const modelo = clave.modelos[0]
  const sid = api.sesion('Chat web · reclamación de una factura', 'kv_chatbot')
  const base = { claveId: 'kv_chatbot', sesionId: sid, modeloPedido: modelo, modeloUsado: modelo, usuarioFinal: 'usr_77ae…10' }
  api.paso('El usuario final pega un texto con instrucciones ocultas')
  await api.esperar(1100)
  api.peticion({ ...base, llamada: 'c01', agente: 'agente-soporte', tokens: [4100, 260, 0, 0], costeReal: api.coste(modelo, [4100, 260, 0, 0]), costeEstimado: 0.04, herramientasQuitadas: grafo.modo === 'proteccion' ? ['consultar_bd_clientes', 'generar_factura'] : [], motivo: grafo.modo === 'proteccion' ? 'Escudo MCP: quitadas de la petición consultar_bd_clientes y generar_factura (no permitidas para agente-soporte); el modelo no sabe que existen' : 'Modo aprendizaje: no se quita ninguna herramienta, solo se registran' })
  await api.esperar(1400)
  api.paso('El modelo, engañado, pide consultar_bd_clientes')
  const tk = [4400, 180, 0, 4100]
  if (grafo.modo === 'proteccion') {
    api.peticion({ ...base, llamada: 'c02', agente: 'agente-soporte', herramienta: 'consultar_bd_clientes', tokens: tk, costeReal: api.coste(modelo, tk), costeEstimado: 0.04, reenviada: true, decision: 'bloqueada', codigo: 403, motivo: 'Escudo MCP · modo protección: la respuesta pedía consultar_bd_clientes, no permitida para agente-soporte (categoría prohibida: Datos personales) · respuesta bloqueada · 403' })
    api.incidente({ orgId: api.orgId, tipo: 'herramienta_denegada', subtipo: 'respuesta_bloqueada', titulo: 'agente-soporte pidió consultar_bd_clientes (posible inyección)', claveId: 'kv_chatbot', sesionId: sid, agente: 'agente-soporte', parteAfectada: `Llamada c02 de la sesión ${sid}`, respuestaAplicada: 'Respuesta del modelo bloqueada (403) en modo protección: la herramienta no está permitida para este agente. La inyección no llegó a ejecutarse.', costeIncidente: r2(api.coste(modelo, tk)), huellas: ['3f0a…c9d1'], llamadasImplicadas: ['c02', 'c03'] })
  } else {
    api.peticion({ ...base, llamada: 'c02', agente: 'agente-soporte', herramienta: 'consultar_bd_clientes', tokens: tk, costeReal: api.coste(modelo, tk), costeEstimado: 0.04, motivo: 'Modo aprendizaje: herramienta pedida y solo registrada (no se bloquea)' })
    api.toast('Modo aprendizaje: la herramienta solo se ha registrado', 'aviso', 'Activa el modo protección en Agentes y permisos para bloquearla')
  }
  await api.esperar(1500)
  api.paso('El agente lo intenta delegando en agente-sql')
  const caminos = caminosIndirectos(api.datos().grafos.org_nexo, api.datos().herramientas.filter((h) => h.orgId === 'org_nexo'))
  const ci = caminos.find((c) => c.agente === 'agente-soporte' && c.categoria === 'personales')
  const puede = api.datos().grafos.org_nexo.puedeDelegar.some(([a, b]) => a === 'agente-soporte' && b === 'agente-sql')
  const t3 = [5200, 420, 0, 0]
  if (puede) {
    api.peticion({ ...base, llamada: 'c03', agente: 'agente-sql', encargadoPor: 'agente-soporte', herramienta: 'consultar_bd_clientes', tokens: t3, costeReal: api.coste(modelo, t3), costeEstimado: 0.04, caminoIndirecto: true, motivo: `Delegación permitida (soporte → sql). Atención: camino indirecto${ci ? ` ${ci.id}` : ''} a Datos personales` })
    api.notificar('Se ha usado un camino indirecto', `agente-soporte llegó a Datos personales a través de agente-sql en ${sid}. Quita la delegación para cerrarlo.`, '/app/agentes')
    api.toast('Camino indirecto usado: agente-soporte → agente-sql', 'aviso', 'El grafo de autorización ya lo avisaba. Quita la delegación para cerrarlo.', '/app/agentes')
    api.fin('Inyección contenida; el camino indirecto sigue abierto', '/app/agentes')
  } else {
    api.peticion({ ...base, llamada: 'c03', agente: 'agente-soporte', tokens: t3, costeReal: 0, costeEstimado: 0, decision: 'bloqueada', codigo: 403, motivo: 'Delegación no permitida: agente-soporte no puede encargar tareas a agente-sql · 403' })
    api.fin('Inyección contenida y camino indirecto cerrado', `/app/contexto/${sid}`)
  }
}

async function escenarioInyeccionGratis(api) {
  const d = api.datos()
  const clave = d.clavesVirtuales.find((k) => k.id === 'kv_tfg')
  const modelo = clave.modelos[0]
  const sid = api.sesion('Resumen de una página web externa', 'kv_tfg')
  const base = { claveId: 'kv_tfg', sesionId: sid, modeloPedido: modelo, modeloUsado: modelo, agente: '(sin declarar)' }
  api.paso('La página resumida contiene instrucciones ocultas')
  await api.esperar(1200)
  api.peticion({ ...base, llamada: 'c01', tokens: [6100, 400, 0, 0], costeReal: api.coste(modelo, [6100, 400, 0, 0]), costeEstimado: 0.01, herramientasQuitadas: ['code_execution'], motivo: 'Herramientas del proveedor: quitada code_execution (no autorizada en la clave; denegada por defecto, DEC-10)' })
  await api.esperar(1400)
  api.paso('El modelo pide ejecutar código')
  api.peticion({ ...base, llamada: 'c02', herramienta: 'code_execution', tokens: [6300, 120, 0, 6100], costeReal: api.coste(modelo, [6300, 120, 0, 6100]), costeEstimado: 0.01, reenviada: true, decision: 'bloqueada', codigo: 403, motivo: 'Respuesta bloqueada: pedía code_execution, herramienta del proveedor no autorizada en proyecto-tfg · 403' })
  const inc = api.incidente({ orgId: api.orgId, tipo: 'herramienta_denegada', subtipo: 'respuesta_bloqueada', titulo: 'El modelo pidió code_execution en proyecto-tfg', claveId: 'kv_tfg', sesionId: sid, agente: null, parteAfectada: `Llamada c02 de la sesión ${sid}`, respuestaAplicada: 'Respuesta bloqueada (403): las herramientas del proveedor están denegadas por defecto. En el plan Gratis no hay grafo de agentes ni análisis de caminos indirectos.', costeIncidente: 0.01, llamadasImplicadas: ['c02'] })
  api.fin(`Inyección contenida (${inc.id})`, `/app/incidentes/${inc.id}`)
}

// ------------------------------------------------------------------ 5. Cuota
async function escenarioCuota(api) {
  const plan = api.plan()
  const org = api.datos().organizaciones.find((o) => o.id === api.orgId)
  const incluidas = plan.peticionesIncluidas
  const actual = org.suscripcion.mesActual.peticionesFacturables
  api.paso(`Peticiones facturables: ${actual.toLocaleString('es-ES')} de ${incluidas.toLocaleString('es-ES')}`)
  if (plan.id === 'gratis') {
    const objetivo = incluidas + 3
    const pasos = 6
    for (let i = 1; i <= pasos; i++) {
      await api.esperar(1100)
      const n = Math.round((objetivo - actual) / pasos)
      api.rafaga(n)
      const s = api.datos().organizaciones.find((o) => o.id === api.orgId).suscripcion
      api.paso(`Ráfaga de ${n} peticiones · ${s.mesActual.peticionesFacturables.toLocaleString('es-ES')} / ${incluidas.toLocaleString('es-ES')}`)
    }
    for (let i = 0; i < 3; i++) { await api.esperar(800); const p = api.peticionAleatoria(); if (p) api.peticion(p) }
    api.fin('Cuota agotada: el servicio se corta hasta el mes siguiente o hasta pasar a Pro', '/app/suscripcion')
  } else {
    const ex = plan.excedente
    const tope = org.suscripcion.topeExcedente || 0
    const objetivo = incluidas + Math.ceil(tope / ex.precioBloque) * ex.bloque + 10
    const pasos = 9
    for (let i = 1; i <= pasos; i++) {
      await api.esperar(1200)
      const n = Math.max(1, Math.round((objetivo - api.datos().organizaciones.find((o) => o.id === api.orgId).suscripcion.mesActual.peticionesFacturables) / (pasos - i + 1)))
      api.rafaga(n)
      const s = api.datos().organizaciones.find((o) => o.id === api.orgId).suscripcion
      api.paso(`Ráfaga de ${n.toLocaleString('es-ES')} peticiones · ${s.mesActual.peticionesFacturables.toLocaleString('es-ES')} facturables`)
    }
    for (let i = 0; i < 3; i++) { await api.esperar(800); const p = api.peticionAleatoria(); if (p) api.peticion(p) }
    api.fin('Tope de excedente alcanzado: las peticiones se rechazan con 402', '/app/suscripcion')
  }
}
