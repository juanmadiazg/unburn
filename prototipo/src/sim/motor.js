// Motor de simulación del Gateway. Funciones puras: reciben el estado (`datos`) y devuelven
// { datos, efectos }. Los efectos (toasts) los ejecuta el store. Reproduce BP-08 (atender
// petición: rechazo barato → reservar → reenviar → liquidar → registrar) y la parte de BP-09
// que crea o actualiza incidentes y envía alertas (IC-20, IC-23).
import { huellaHex, corta, costeTokens, proveedorDe, apiDe } from './generar'
import { ahoraIso, hoyIso } from '../lib/tiempo'

const MAX_EVENTOS = 900
const r2 = (n) => Math.round(n * 1e4) / 1e4
const id = (pref, n = 6) => `${pref}_${Math.random().toString(36).slice(2, 2 + n)}`
const sustituir = (lista, idx, nuevo) => { const c = lista.slice(); c[idx] = nuevo; return c }

export const planDe = (datos, orgId) => {
  const org = datos.organizaciones.find((o) => o.id === orgId)
  return datos.planes.find((p) => p.id === org.suscripcion.plan)
}

/** Presupuestos que afectan a una petición: los de la organización y los de su clave */
export const presupuestosAfectados = (datos, orgId, claveId) =>
  datos.presupuestos.filter((p) => p.orgId === orgId && (p.ambito === 'organizacion' || p.claveId === claveId))

// ---------------------------------------------------------------- alertas (IC-23)
const TEXTOS_CANAL = { email: 'Email', slack: 'Slack', teams: 'Microsoft Teams', webhook: 'Webhook' }

/** Envía una alerta por los canales activos que reciben ese aviso (en Gratis, solo email) */
export function alertar(datos, orgId, motivo, resumen, enlace, detalle) {
  const plan = planDe(datos, orgId)
  const fecha = ahoraIso()
  const canales = datos.canales.filter((c) => c.orgId === orgId && c.activo && c.avisos.includes(motivo) && plan.canalesAlerta.includes(c.tipo))
  const alertas = canales.map((c) => ({ id: id('al'), orgId, fecha, canal: c.id, motivo, resumen, enlace }))
  const bandeja = canales.map((c) => ({ id: id('msg'), orgId, fecha, canal: c.id, tipo: c.tipo, destino: c.destino, motivo, titulo: resumen, detalle: detalle || '', enlace, entregado: c.tipo !== 'webhook' || Math.random() > 0.05 }))
  const notificacion = { id: id('ntf'), destino: orgId, fecha, tipo: motivo, titulo: resumen, detalle: detalle || `Enviada por ${canales.map((c) => TEXTOS_CANAL[c.tipo]).join(', ') || 'el panel'}`, enlace, leida: false }
  return {
    datos: { ...datos, alertas: [...alertas, ...datos.alertas], bandeja: [...bandeja, ...datos.bandeja], notificaciones: [notificacion, ...datos.notificaciones] },
    efectos: [{ tipo: 'toast', orgId, mensaje: resumen, nivel: motivo === 'incidente' ? 'aviso' : 'info', detalle: canales.length ? `Alerta enviada por ${[...new Set(canales.map((c) => TEXTOS_CANAL[c.tipo]))].join(', ')}` : undefined, enlace, canales: canales.length }],
  }
}

/** Notificación interna (back-office o panel) sin pasar por los canales del cliente */
export function notificar(datos, destino, titulo, detalle, enlace, tipo = 'sistema') {
  return { ...datos, notificaciones: [{ id: id('ntf'), destino, fecha: ahoraIso(), tipo, titulo, detalle, enlace, leida: false }, ...datos.notificaciones] }
}

// ---------------------------------------------------------------- incidentes (BP-09)
/**
 * Registra o actualiza un incidente. No es nuevo si hay uno abierto con la misma causa y la
 * misma parte afectada con actividad en la última hora: entonces se actualiza sin otra alerta.
 */
export function registrarIncidente(datos, inc) {
  const hace1h = Date.now() - 3600e3
  const idx = datos.incidentes.findIndex((i) => i.orgId === inc.orgId && i.estado === 'abierto' && i.tipo === inc.tipo && i.claveId === inc.claveId && i.parteAfectada === inc.parteAfectada && new Date(i.ultimaActividad).getTime() >= hace1h)
  if (idx >= 0) {
    const previo = datos.incidentes[idx]
    const act = { ...previo, ...inc.actualizar, id: previo.id, ultimaActividad: ahoraIso(), ocurrencias: (previo.ocurrencias || 1) + 1, costeIncidente: r2(previo.costeIncidente + (inc.costeIncidente || 0)) }
    return { datos: { ...datos, incidentes: sustituir(datos.incidentes, idx, act) }, efectos: [], incidente: act, nuevo: false }
  }
  const nuevo = {
    id: inc.id || `inc_${huellaHex(String(Math.random())).slice(0, 6)}`, estado: 'abierto', fecha: ahoraIso(), ultimaActividad: ahoraIso(), ocurrencias: 1,
    cotaSuperior: null, ahorro: null, costePrevisto: null, causaRaiz: null, huellas: [], llamadasImplicadas: [], endurecidoHasta: null, ...inc, actualizar: undefined,
  }
  let d = { ...datos, incidentes: [nuevo, ...datos.incidentes] }
  const r = alertar(d, inc.orgId, 'incidente', `${nuevo.id} · ${nuevo.titulo}`, `/app/incidentes/${nuevo.id}`, nuevo.respuestaAplicada)
  return { datos: r.datos, efectos: r.efectos, incidente: nuevo, nuevo: true }
}

// ---------------------------------------------------------------- registro de auditoría (IC-16)
export function registrarEvento(datos, ev) {
  const previo = datos.eventos.find((e) => e.orgId === ev.orgId)
  const anterior = previo?._h || 'génesis'
  const h = huellaHex(anterior + ev.id + ev.fecha + ev.decision + ev.costeReal)
  const evento = { ...ev, huellaAnterior: anterior === 'génesis' ? anterior : corta(anterior), huella: corta(h), _h: h, nuevo: true }
  const eventos = [evento, ...datos.eventos]
  if (eventos.length > MAX_EVENTOS) eventos.length = MAX_EVENTOS
  return { ...datos, eventos }
}

// ---------------------------------------------------------------- cuota de la suscripción (IC-04, BP-12)
export function estadoCuota(datos, orgId) {
  const org = datos.organizaciones.find((o) => o.id === orgId)
  const plan = planDe(datos, orgId)
  const s = org.suscripcion
  const usadas = s.mesActual.peticionesFacturables
  const incluidas = plan.peticionesIncluidas || Infinity
  const exceso = Math.max(0, usadas - incluidas)
  const bloques = plan.excedente ? Math.ceil(exceso / plan.excedente.bloque) : 0
  const importeExcedente = plan.excedente ? bloques * plan.excedente.precioBloque : 0
  return { org, plan, usadas, incluidas, exceso, bloques, importeExcedente, tope: s.topeExcedente, estado: s.estado }
}

/** Suma peticiones facturables y aplica los avisos del 80 % y 100 % de la cuota y del tope (DEC-03, DEC-06) */
export function contarFacturables(datos, orgId, n = 1) {
  let efectos = []
  const antes = estadoCuota(datos, orgId)
  const org = antes.org
  const s = { ...org.suscripcion, mesActual: { ...org.suscripcion.mesActual, peticionesFacturables: org.suscripcion.mesActual.peticionesFacturables + n }, avisos: { ...(org.suscripcion.avisos || {}) } }
  let d = { ...datos, organizaciones: datos.organizaciones.map((o) => (o.id === orgId ? { ...o, suscripcion: s } : o)) }
  const desp = estadoCuota(d, orgId)
  const aviso = (clave, motivo, texto) => {
    if (s.avisos[clave]) return
    s.avisos[clave] = true
    const r = alertar(d, orgId, motivo, texto, '/app/suscripcion')
    d = r.datos; efectos = efectos.concat(r.efectos)
  }
  const pct = desp.usadas / desp.incluidas
  if (pct >= 0.8) aviso('cuota80', 'cuota', `Has llegado al 80 % de las peticiones incluidas en tu plan ${desp.plan.nombre}`)
  if (pct >= 1) {
    if (desp.plan.id === 'gratis') {
      aviso('cuota100', 'cuota', 'Cuota del plan Gratis agotada: el servicio se corta hasta el mes siguiente o hasta que cambies de plan')
      s.estado = 'cuota agotada'
    } else aviso('cuota100', 'cuota', `Has llegado al 100 % de las peticiones incluidas: a partir de ahora se cobra excedente (tope ${desp.tope} €)`)
  }
  if (desp.plan.excedente && desp.tope) {
    const pt = desp.importeExcedente / desp.tope
    if (pt >= 0.8) aviso('tope80', 'tope_excedente', `Excedente al 80 % del tope (${desp.importeExcedente} € de ${desp.tope} €)`)
    if (pt >= 1) { aviso('tope100', 'tope_excedente', `Tope de excedente alcanzado (${desp.tope} €): las peticiones se rechazan con 402 hasta el mes siguiente`); s.estado = 'tope de excedente alcanzado' }
  }
  return { datos: d, efectos }
}

// ---------------------------------------------------------------- BP-08: atender petición
/**
 * Paso 2 (rechazo barato) y 9 (reservar). Devuelve la petición con su decisión y, si pasa,
 * la reserva hecha en todos los presupuestos afectados a la vez (IC-17).
 */
export function iniciarPeticion(datos, p) {
  let efectos = []
  const fecha = ahoraIso()
  p = { ...p, id: p.id || id('req', 8), fechaInicio: fecha }
  const org = datos.organizaciones.find((o) => o.id === p.orgId)
  const clave = datos.clavesVirtuales.find((k) => k.id === p.claveId)
  const afectados = presupuestosAfectados(datos, p.orgId, p.claveId)

  // Rechazo barato: cuota agotada, tope alcanzado o presupuesto que no cabe (402, DEC-06)
  if (p.tipo !== 'auxiliar' && !p.decisionForzada) {
    let motivo = null
    if (org.suscripcion.estado === 'cuota agotada') motivo = 'Rechazo barato: cuota del plan Gratis agotada · 402'
    else if (org.suscripcion.estado === 'tope de excedente alcanzado') motivo = 'Rechazo barato: tope de excedente alcanzado · 402'
    else {
      const sinHueco = afectados.find((b) => b.gastado + b.reservado + p.costeEstimado > b.limiteDuro)
      if (sinHueco) motivo = `Rechazo barato: no cabe en el presupuesto ${sinHueco.periodo} de ${sinHueco.ambito === 'organizacion' ? 'la organización' : clave?.nombre} (límite duro ${sinHueco.limiteDuro} €) · 402`
      if (sinHueco) p.presupuestoAgotado = sinHueco
    }
    if (motivo) return rechazarBarato(datos, { ...p, decision: 'bloqueada', codigo: 402, motivo })
  }
  if (p.decision && p.decision !== 'permitida' && p.decision !== 'modelo sustituido' && !p.reenviada) {
    // Rechazos del propio Gateway antes de reenviar (401, 400, 403, 422, 429…): sin reserva ni cuota
    let d = registrarEvento(datos, eventoDe(datos, p, fecha))
    return { datos: d, efectos, peticion: p, terminada: true }
  }
  if (p.tipo === 'auxiliar') return { datos, efectos, peticion: { ...p, reserva: 0 }, terminada: false }

  // Reservar el peor caso en todos los presupuestos afectados a la vez
  const ids = afectados.map((b) => b.id)
  let d = {
    ...datos,
    presupuestos: datos.presupuestos.map((b) => (ids.includes(b.id) ? { ...b, reservado: r2(b.reservado + p.costeEstimado) } : b)),
    reservas: [{ id: id('res', 8), peticionId: p.id, orgId: p.orgId, claveId: p.claveId, agente: p.agente, importe: p.costeEstimado, presupuestos: ids, inicio: fecha, caduca: new Date(Date.now() + 120e3).toISOString() }, ...datos.reservas],
  }
  // Aviso si con la reserva se cruza un límite blando (lo pide el Motor de presupuestos, IF-15)
  for (const b of d.presupuestos.filter((x) => ids.includes(x.id))) {
    if (!b.avisoBlando && b.gastado + b.reservado >= b.limiteBlando) {
      d = { ...d, presupuestos: d.presupuestos.map((x) => (x.id === b.id ? { ...x, avisoBlando: true } : x)) }
      const nombre = b.ambito === 'organizacion' ? 'La organización' : clave?.nombre
      const r = alertar(d, p.orgId, 'limite_blando', `${nombre} ha cruzado el límite blando ${b.periodo === 'diario' ? 'diario' : 'mensual'} (${b.limiteBlando} €)`, '/app/presupuestos')
      d = r.datos; efectos = efectos.concat(r.efectos)
    }
  }
  return { datos: d, efectos, peticion: { ...p, reserva: p.costeEstimado, presupuestos: ids }, terminada: false }
}

/** Pasos 13 y 14: liquidar el coste real, liberar el resto y registrar */
export function liquidarPeticion(datos, p) {
  let efectos = []
  const fecha = ahoraIso()
  const real = p.costeReal || 0
  let d = {
    ...datos,
    reservas: datos.reservas.filter((r) => r.peticionId !== p.id),
    presupuestos: datos.presupuestos.map((b) => ((p.presupuestos || []).includes(b.id) ? { ...b, reservado: Math.max(0, r2(b.reservado - (p.reserva || 0))), gastado: r2(b.gastado + real) } : b)),
  }
  if (p.tipo !== 'auxiliar') {
    const hoy = hoyIso()
    d.clavesVirtuales = d.clavesVirtuales.map((k) => (k.id === p.claveId ? { ...k, gastoHoy: r2(k.gastoHoy + real), gastoMes: r2(k.gastoMes + real), peticionesMes: k.peticionesMes + 1, ultimoUso: fecha } : k))
    d.agentes = d.agentes.map((a) => (a.id === p.agente && a.orgId === p.orgId ? { ...a, gastoMes: r2(a.gastoMes + real), ultimaActividad: fecha } : a))
    const diario = d.gasto.diario[p.orgId] || {}
    const dia = { ...(diario[hoy] || {}) }
    dia[p.claveId] = r2((dia[p.claveId] || 0) + real)
    const ahora = new Date()
    const b = Math.floor((ahora.getHours() * 60 + ahora.getMinutes()) / 15)
    const ints = (d.gasto.intervalosHoy[p.orgId] || []).slice()
    if (ints[b]) ints[b] = { ...ints[b], euros: r2(ints[b].euros + real), peticiones: ints[b].peticiones + 1 }
    d.gasto = { ...d.gasto, diario: { ...d.gasto.diario, [p.orgId]: { ...diario, [hoy]: dia } }, intervalosHoy: { ...d.gasto.intervalosHoy, [p.orgId]: ints } }
    // Cuentan las de generación reenviadas al proveedor, aunque fallen o se bloquee la respuesta (DEC-03)
    if (p.reenviada !== false) { const r = contarFacturables(d, p.orgId, 1); d = r.datos; efectos = efectos.concat(r.efectos) }
  }
  d = registrarEvento(d, eventoDe(d, { ...p, costeReal: real }, fecha))
  if (p.sesionId) d = anotarEnSesion(d, p, fecha)
  return { datos: d, efectos }
}

function rechazarBarato(datos, p) {
  let efectos = []
  const fecha = ahoraIso()
  // Los rechazos baratos se agrupan cada pocos segundos (nota de BP-08)
  const ultimo = datos.eventos.find((e) => e.orgId === p.orgId && e.claveId === p.claveId)
  let d
  if (ultimo && ultimo.tipo === 'rechazo agrupado' && Date.now() - new Date(ultimo.fecha).getTime() < 15000) {
    const n = (ultimo.agrupados || 1) + 1
    d = { ...datos, eventos: datos.eventos.map((e) => (e.id === ultimo.id ? { ...e, agrupados: n, motivo: e.motivo.replace(/· \d+ peticiones agrupadas · 402|· 402$/, `· ${n} peticiones agrupadas · 402`) } : e)) }
  } else {
    d = registrarEvento(datos, { ...eventoDe(datos, p, fecha), tipo: 'rechazo agrupado', agrupados: 1 })
  }
  if (p.presupuestoAgotado) {
    const b = p.presupuestoAgotado
    const clave = d.clavesVirtuales.find((k) => k.id === p.claveId)
    const r = registrarIncidente(d, {
      orgId: p.orgId, tipo: 'presupuesto_agotado', subtipo: b.periodo === 'diario' ? 'diario_clave' : 'mensual', titulo: `Presupuesto ${b.periodo} agotado en ${b.ambito === 'organizacion' ? 'la organización' : clave?.nombre}`,
      claveId: p.claveId, sesionId: null, agente: p.agente, parteAfectada: `${b.ambito === 'organizacion' ? 'Organización' : `Clave ${clave?.nombre}`} (presupuesto ${b.periodo} de ${b.limiteDuro} €)`,
      respuestaAplicada: 'Corte por límite duro: las peticiones se rechazan con 402 hasta que empiece el siguiente periodo o se suba el límite. El resto de claves sigue funcionando.',
      costeIncidente: 0, ahorro: { min: 1, max: 2, hipotesis: 'Peticiones rechazadas desde el corte, al coste medio de las últimas 2 horas de esta clave. Es gasto que superaba el límite fijado por el propio cliente.' },
      actualizar: {},
    })
    d = r.datos; efectos = efectos.concat(r.efectos)
    // El ahorro estimado crece con cada petición rechazada
    d = { ...d, incidentes: d.incidentes.map((i) => (i.id === r.incidente.id && i.ahorro ? { ...i, ahorro: { ...i.ahorro, min: r2(i.ahorro.min + p.costeEstimado * 0.4), max: r2(i.ahorro.max + p.costeEstimado * 0.7) } } : i)) }
  }
  return { datos: d, efectos, peticion: p, terminada: true }
}

export function eventoDe(datos, p, fecha) {
  const grafo = datos.grafos[p.orgId]
  return {
    id: p.eventoId || (p.sesionId && p.llamada ? `evt_${p.sesionId.slice(4)}_${p.llamada}` : `evt_${huellaHex(p.id + fecha).slice(0, 8)}`), orgId: p.orgId, tipo: p.tipo || 'generacion', fecha,
    claveId: p.claveId, sesionId: p.sesionId || null, llamada: p.llamada || null, agente: p.agente, encargadoPor: p.encargadoPor || null, dependeDe: p.dependeDe || [],
    proveedor: proveedorDe(p.modeloPedido), api: p.tipo === 'auxiliar' ? 'models.list' : apiDe(p.modeloPedido), modeloPedido: p.modeloPedido, modeloUsado: p.modeloUsado || null,
    herramienta: p.herramienta || null, herramientasQuitadas: p.herramientasQuitadas || [],
    tokens: { entrada: p.tokens?.[0] || 0, salida: p.tokens?.[1] || 0, razonamiento: p.tokens?.[2] || 0, cache: p.tokens?.[3] || 0 },
    usosHerramientasProveedor: p.herramienta === 'web_search' ? 1 : 0, costeEstimado: r2(p.costeEstimado || 0), costeReal: r2(p.costeReal || 0),
    latenciaMs: p.latenciaMs || 3, latenciaGatewayMs: p.latenciaGatewayMs || 12, decision: p.decision || 'permitida', codigo: p.codigo || 200, motivo: p.motivo || 'Sin reglas aplicables',
    versionConfig: `cfg-v${grafo?.version ?? 1}`, ip: p.ip || (p.orgId === 'org_nexo' ? '81.44.12.9' : '88.27.140.3'), usuarioFinal: p.usuarioFinal || null, origen: p.origen,
  }
}

/** Añade la llamada al grafo de su sesión (IC-15), para el grafo de contexto */
function anotarEnSesion(datos, p, fecha) {
  const idx = datos.sesiones.findIndex((s) => s.id === p.sesionId)
  if (idx < 0) return datos
  const s = datos.sesiones[idx]
  const llamada = {
    id: p.llamada || `c${String(s.llamadas.length + 1).padStart(2, '0')}`, agente: p.agente, encargadoPor: p.encargadoPor || null, modelo: p.modeloUsado || p.modeloPedido,
    herramienta: p.herramienta || null, dependeDe: p.dependeDe || (s.llamadas.length ? [s.llamadas[s.llamadas.length - 1].id] : []), decision: p.decision || 'permitida', motivo: p.motivo || 'Sin reglas aplicables',
    coste: r2(p.costeReal || 0), tokens: p.tokens || [0, 0, 0, 0], latencia: p.latenciaMs || 3, hora: fecha.slice(11, 19), fecha, huella: p.huella || corta(huellaHex(p.id)),
    enBucle: !!p.enBucle, causaRaiz: !!p.causaRaiz, caminoIndirecto: !!p.caminoIndirecto,
  }
  const act = { ...s, llamadas: [...s.llamadas, llamada], fin: fecha, estado: p.decision === 'bloqueada' ? 'bloqueada' : p.decision === 'frenada' ? 'frenada' : s.estado }
  return { ...datos, sesiones: sustituir(datos.sesiones, idx, act) }
}

export function crearSesion(datos, { orgId, claveId, titulo }) {
  const sid = `ses_${huellaHex(String(Math.random())).slice(0, 6)}`
  const s = { id: sid, orgId, claveId, titulo, inicio: ahoraIso(), fin: null, estado: 'activa', incidenteId: null, llamadas: [], enDirecto: true }
  return { datos: { ...datos, sesiones: [s, ...datos.sesiones] }, sesionId: sid }
}

// ---------------------------------------------------------------- tráfico de fondo
const SESIONES_VIVAS = {}
const pesoAleatorio = (items, peso, rnd) => {
  const total = items.reduce((a, x) => a + peso(x), 0)
  let r = rnd() * total
  for (const x of items) { r -= peso(x); if (r <= 0) return x }
  return items[items.length - 1]
}

/** Construye una petición verosímil de los agentes de una organización */
export function peticionAleatoria(datos, orgId, rnd = Math.random) {
  const claves = datos.clavesVirtuales.filter((k) => k.orgId === orgId && k.estado === 'activa')
  if (!claves.length) return null
  const k = pesoAleatorio(claves, (x) => (x.id === 'kv_datos' ? 3000 : Math.max(500, x.peticionesMes)), rnd)
  const agente = k.agentes.length ? k.agentes[Math.floor(rnd() * k.agentes.length)] : '(sin declarar)'
  const modelo = rnd() < 0.7 ? k.modelos[0] : k.modelos[Math.floor(rnd() * k.modelos.length)]
  const entrada = Math.round(800 + rnd() * k.maxEntrada * 0.25)
  const salida = Math.round(120 + rnd() * k.maxRespuesta * 0.35)
  const tokens = [entrada, salida, modelo === 'o4-mini' ? Math.round(300 + rnd() * 2400) : 0, rnd() < 0.5 ? Math.round(entrada * 0.6) : 0]
  const costeReal = costeTokens(datos.modelos, modelo, tokens)
  const costeEstimado = costeTokens(datos.modelos, modelo, [entrada, k.maxRespuesta, tokens[2] ? 4000 : 0, 0]) + 0.002
  // Sesiones: la mayoría de peticiones reutilizan una tarea en curso de su clave
  const vivas = (SESIONES_VIVAS[k.id] ||= [])
  let sesionId = null
  if (k.pctSinSesion < 100 && rnd() * 100 >= k.pctSinSesion) {
    if (!vivas.length || rnd() < 0.15) { vivas.unshift(`ses_${huellaHex(k.id + Date.now() + rnd()).slice(0, 6)}`); vivas.length = Math.min(vivas.length, 3) }
    sesionId = vivas[Math.floor(rnd() * vivas.length)]
  }
  const grafo = datos.grafos[orgId]
  const herrs = grafo.puedeUsar.filter(([a]) => a === agente).map(([, t]) => datos.herramientas.find((h) => h.id === t)?.nombre).filter(Boolean)
  const herramienta = herrs.length && rnd() < 0.3 ? herrs[Math.floor(rnd() * herrs.length)] : null
  const quitadas = grafo.modo === 'proteccion' && herrs.length && rnd() < 0.08 ? ['exportar_csv_s3'] : []
  const auxiliar = rnd() < 0.03
  const usuarios = ['usr_02bd…71', 'usr_4c1e…a9', 'usr_9a77…03', 'usr_b310…5f', 'usr_e8d2…c4', 'usr_51f0…2b']
  return {
    orgId, claveId: k.id, agente, sesionId, tipo: auxiliar ? 'auxiliar' : 'generacion', modeloPedido: modelo, modeloUsado: modelo, herramienta, herramientasQuitadas: quitadas,
    tokens: auxiliar ? [0, 0, 0, 0] : tokens, costeReal: auxiliar ? 0 : costeReal, costeEstimado: auxiliar ? 0 : costeEstimado,
    latenciaMs: auxiliar ? Math.round(80 + rnd() * 200) : Math.round(700 + rnd() * 5200), latenciaGatewayMs: Math.round(6 + rnd() * 26 + (rnd() < 0.04 ? 18 : 0)),
    decision: 'permitida', codigo: 200, motivo: auxiliar ? 'Petición auxiliar (listar modelos): no reserva ni cuenta en la cuota' : quitadas.length ? `Escudo MCP: quitada de la petición ${quitadas.join(', ')} (no permitida para ${agente})` : 'Sin reglas aplicables',
    usuarioFinal: k.id === 'kv_chatbot' ? usuarios[Math.floor(rnd() * usuarios.length)] : null,
  }
}

/** Convierte en gasto estimado las reservas que vencen sin liquidar (BP-19) */
export function cerrarReservasVencidas(datos) {
  const ahora = Date.now()
  const vencidas = datos.reservas.filter((r) => new Date(r.caduca).getTime() < ahora)
  if (!vencidas.length) return datos
  let d = { ...datos, reservas: datos.reservas.filter((r) => !vencidas.includes(r)) }
  for (const r of vencidas) {
    d = { ...d, presupuestos: d.presupuestos.map((b) => (r.presupuestos.includes(b.id) ? { ...b, reservado: Math.max(0, r2(b.reservado - r.importe)), gastado: r2(b.gastado + r.importe * 0.5) } : b)) }
    d = registrarEvento(d, { id: `evt_${huellaHex(r.id).slice(0, 8)}`, orgId: r.orgId, tipo: 'cierre estimado', fecha: ahoraIso(), claveId: r.claveId, sesionId: null, agente: r.agente, dependeDe: [], proveedor: '—', api: '—', modeloPedido: '—', modeloUsado: null, herramienta: null, herramientasQuitadas: [], tokens: { entrada: 0, salida: 0, razonamiento: 0, cache: 0 }, usosHerramientasProveedor: 0, costeEstimado: r.importe, costeReal: r2(r.importe * 0.5), latenciaMs: 0, latenciaGatewayMs: 0, decision: 'permitida', codigo: 0, motivo: 'BP-19: reserva vencida sin liquidar, cerrada con gasto estimado', versionConfig: `cfg-v${d.grafos[r.orgId].version}`, ip: '—', usuarioFinal: null })
  }
  return d
}
