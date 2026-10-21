// Generación determinista (semilla fija) de los datos voluminosos a partir de los JSON
// escritos a mano: eventos de auditoría (IC-16) encadenados con huellas, sellos (IC-22)
// y gasto diario y por intervalos de 15 minutos (IC-21). Se ejecuta al arrancar con la
// hora real, de modo que el historial siempre termina «ahora».
import { diaLocal, isoLocal } from '../lib/tiempo'

export function crearRng(semilla = 20261021) {
  let s = semilla
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Huella hexadecimal de 16 caracteres (cyrb53 doble). Sustituye a SHA-256 en el navegador. */
export function huellaHex(str) {
  const cyrb = (seed) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677) }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return ((h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0'))
  }
  return cyrb(1) + cyrb(2)
}
export const corta = (h) => `${h.slice(0, 4)}…${h.slice(-4)}`

export const proveedorDe = (modelo) => (modelo?.startsWith('claude') ? 'Anthropic' : 'OpenAI')
export const apiDe = (modelo) => (modelo?.startsWith('claude') ? 'messages' : 'responses')

/** Coste real en € a partir del catálogo de modelos (IC-14): tokens [entrada, salida, razonamiento, caché] */
export function costeTokens(modelos, nombre, t) {
  const m = modelos.find((x) => x.modelo === nombre) || modelos[0]
  const p = m.precios
  return ((t[0] - (t[3] || 0)) * p.entrada + (t[3] || 0) * (p.cache ?? p.entrada) + t[1] * p.salida + (t[2] || 0) * (p.razonamiento ?? p.salida)) / 1e6
}

const redondear = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d

export function generarEventos({ clavesVirtuales, sesiones, grafos, modelos }, ahora = new Date()) {
  const rnd = crearRng()
  const entre = (a, b) => a + rnd() * (b - a)
  const elegir = (arr) => arr[Math.floor(rnd() * arr.length)]
  const version = (orgId) => `cfg-v${grafos[orgId].version}`
  const ip = (orgId) => (orgId === 'org_nexo' ? elegir(['81.44.12.9', '81.44.12.10', '34.250.18.77']) : '88.27.140.3')
  const latGw = () => Math.round(entre(6, 34) + (rnd() < 0.04 ? entre(10, 30) : 0))
  const eventos = []

  for (const s of sesiones) {
    for (const c of s.llamadas) {
      const codigo = c.decision === 'bloqueada' ? (c.motivo.includes('422') ? 422 : 403) : c.decision === 'frenada' ? 429 : 200
      eventos.push({
        id: `evt_${s.id.slice(4)}_${c.id}`, orgId: s.orgId, tipo: 'generacion', fecha: c.fecha,
        claveId: s.claveId, sesionId: s.id, llamada: c.id, agente: c.agente, encargadoPor: c.encargadoPor,
        dependeDe: c.dependeDe.map((d) => `evt_${s.id.slice(4)}_${d}`), proveedor: proveedorDe(c.modelo), api: apiDe(c.modelo),
        modeloPedido: c.decision === 'modelo sustituido' ? 'gpt-4.1' : c.modelo, modeloUsado: c.modelo, herramienta: c.herramienta, herramientasQuitadas: [],
        tokens: { entrada: c.tokens[0], salida: c.tokens[1], razonamiento: c.tokens[2], cache: c.tokens[3] },
        usosHerramientasProveedor: c.herramienta === 'web_search' ? 1 : 0,
        costeEstimado: redondear(c.coste * 1.6 + 0.05, 2), costeReal: c.coste, latenciaMs: c.latencia, latenciaGatewayMs: latGw(),
        decision: c.decision, codigo, motivo: c.motivo, versionConfig: version(s.orgId), ip: ip(s.orgId),
        usuarioFinal: s.id === 'ses_A2n4Vb' ? 'usr_7f3a…e1' : null,
      })
    }
  }

  const herramientasPorAgente = {}
  for (const [ag, t] of grafos.org_nexo.puedeUsar) (herramientasPorAgente[ag] ||= []).push(t.replace(/^t_/, ''))
  const usuariosFinales = ['usr_02bd…71', 'usr_4c1e…a9', 'usr_9a77…03', 'usr_b310…5f', 'usr_e8d2…c4']

  for (const k of clavesVirtuales.filter((x) => x.estado === 'activa')) {
    const n = k.orgId === 'org_nexo' ? Math.round(10 + k.peticionesMes / 9000) : 12
    for (let i = 0; i < n; i++) {
      const dias = Math.floor(rnd() ** 1.6 * 7)
      const fecha = new Date(ahora.getTime() - dias * 864e5 - Math.floor(entre(0.02, dias === 0 ? Math.max(0.1, ahora.getHours() - 0.2) : 23.9) * 36e5))
      const modelo = elegir(k.modelos)
      const agente = k.agentes.length ? elegir(k.agentes) : '(sin declarar)'
      const auxiliar = rnd() < 0.05
      const tokens = auxiliar ? [0, 0, 0, 0] : [Math.round(entre(800, k.maxEntrada * 0.4)), Math.round(entre(120, k.maxRespuesta * 0.5)), modelo === 'o4-mini' ? Math.round(entre(400, 3000)) : 0, rnd() < 0.5 ? Math.round(entre(0, 600)) : 0]
      let decision = 'permitida', codigo = 200, motivo = 'Sin reglas aplicables', herramienta = null
      const herrs = herramientasPorAgente[agente] || []
      if (!auxiliar && herrs.length && rnd() < 0.35) herramienta = elegir(herrs)
      const r = rnd()
      if (auxiliar) motivo = 'Petición auxiliar (listar modelos): no reserva ni cuenta en la cuota'
      else if (r < 0.03) { decision = 'bloqueada'; codigo = 403; motivo = `Escudo MCP: herramienta no permitida para ${agente}` }
      else if (r < 0.05 && k.id === 'kv_chatbot') { decision = 'frenada'; codigo = 429; motivo = 'Sistema inmunológico: avalancha de peticiones frenada antes de procesarla · 429' }
      else if (r < 0.065 && k.modeloSustituto) { decision = 'modelo sustituido'; motivo = `Sistema inmunológico: consumo 7,${Math.floor(entre(1, 9))}× la línea base · cambio a ${k.modeloSustituto}` }
      const modeloUsado = decision === 'modelo sustituido' ? k.modeloSustituto : modelo
      const real = decision === 'permitida' || decision === 'modelo sustituido' ? redondear(costeTokens(modelos, modeloUsado, tokens), 4) : 0
      eventos.push({
        id: `evt_${huellaHex(k.id + i).slice(0, 8)}`, orgId: k.orgId, tipo: auxiliar ? 'auxiliar' : 'generacion', fecha: isoLocal(fecha),
        claveId: k.id, sesionId: rnd() < 0.55 ? `ses_${huellaHex(k.id + i + 's').slice(0, 6)}` : null, llamada: null, agente, encargadoPor: null,
        dependeDe: [], proveedor: proveedorDe(modelo), api: auxiliar ? 'models.list' : apiDe(modelo), modeloPedido: modelo, modeloUsado, herramienta, herramientasQuitadas: [],
        tokens: { entrada: tokens[0], salida: tokens[1], razonamiento: tokens[2], cache: tokens[3] }, usosHerramientasProveedor: herramienta === 'web_search' ? 1 : 0,
        costeEstimado: auxiliar ? 0 : redondear(costeTokens(modelos, modelo, [k.maxEntrada * 0.5, k.maxRespuesta, 0, 0]) + 0.01, 2), costeReal: real,
        latenciaMs: decision === 'permitida' || decision === 'modelo sustituido' ? Math.round(entre(600, 9000)) : Math.round(entre(2, 9)), latenciaGatewayMs: latGw(),
        decision, codigo, motivo, versionConfig: version(k.orgId), ip: ip(k.orgId), usuarioFinal: k.id === 'kv_chatbot' ? elegir(usuariosFinales) : null,
      })
    }
  }

  // Rechazos baratos de equipo-datos tras agotar su presupuesto diario: se registran agrupados (nota de BP-08)
  for (const [minutos, n] of [[167, 9], [159, 14], [134, 14]]) {
    eventos.push({
      id: `evt_${huellaHex('datos402' + minutos).slice(0, 8)}`, orgId: 'org_nexo', tipo: 'rechazo agrupado', fecha: isoLocal(new Date(ahora.getTime() - minutos * 60e3)),
      claveId: 'kv_datos', sesionId: null, llamada: null, agente: 'agente-sql', encargadoPor: null, dependeDe: [], proveedor: 'OpenAI', api: 'responses',
      modeloPedido: 'gpt-4.1', modeloUsado: null, herramienta: null, herramientasQuitadas: [], tokens: { entrada: 0, salida: 0, razonamiento: 0, cache: 0 }, usosHerramientasProveedor: 0,
      costeEstimado: 0, costeReal: 0, latenciaMs: 2, latenciaGatewayMs: 2, decision: 'bloqueada', codigo: 402, agrupados: n,
      motivo: `Rechazo barato: presupuesto diario de la clave agotado (límite duro 50 €) · ${n} peticiones agrupadas · 402`, versionConfig: version('org_nexo'), ip: '81.44.12.10', usuarioFinal: null,
    })
  }

  return encadenar(eventos.sort((a, b) => a.fecha.localeCompare(b.fecha))).reverse()
}

/** Encadena los eventos de cada organización con huellas (OF-11, DEC-14). Entrada en orden cronológico. */
export function encadenar(eventos, ultimas = {}) {
  for (const e of eventos) {
    const anterior = ultimas[e.orgId] || 'génesis'
    e.huellaAnterior = anterior === 'génesis' ? anterior : corta(anterior)
    const h = huellaHex(anterior + e.id + e.fecha + e.decision + e.costeReal)
    e.huella = corta(h)
    e._h = h
    ultimas[e.orgId] = h
  }
  return eventos
}

export function generarSellos(ahora = new Date()) {
  const rnd = crearRng(7)
  const sellos = []
  const base = new Date(ahora); base.setSeconds(0, 0); base.setMinutes(base.getMinutes() - (base.getMinutes() % 5))
  for (const orgId of ['org_nexo', 'org_pmartin']) {
    for (let i = 0; i < 24; i++) {
      const t = new Date(base.getTime() - i * 5 * 60e3)
      const h = huellaHex(orgId + isoLocal(t))
      const bloqueo = new Date(t.getTime() + (orgId === 'org_nexo' ? 30 : 7) * 864e5)
      sellos.push({ id: `sel_${h.slice(0, 10)}`, orgId, fecha: isoLocal(t), resumen: corta(h), firma: `ed25519:${h.slice(4, 16)}…`, eventos: Math.round(orgId === 'org_nexo' ? 180 + rnd() * 340 : rnd() * 9), almacen: `S3 Object Lock hasta el ${diaLocal(bloqueo).split('-').reverse().join('/')}` })
    }
  }
  return sellos
}

/** Gasto diario (30 días hasta hoy) por clave e intervalos de 15 min de hoy hasta ahora (IC-21) */
export function generarGasto(clavesVirtuales, ahora = new Date()) {
  const rnd = crearRng(99)
  const entre = (a, b) => a + rnd() * (b - a)
  const dias = []
  for (let i = 29; i >= 0; i--) { const d = new Date(ahora); d.setDate(d.getDate() - i); dias.push(diaLocal(d)) }
  const hoy = dias[dias.length - 1]
  const pesoDia = (d) => { const wd = new Date(d + 'T12:00:00').getDay(); return wd === 0 || wd === 6 ? 0.45 : 1 }
  const diario = {}
  for (const k of clavesVirtuales.filter((x) => x.estado === 'activa')) {
    const media = (k.gastoMes - k.gastoHoy) / 20
    for (const d of dias) {
      const v = d === hoy ? k.gastoHoy : media * pesoDia(d) * entre(0.65, 1.25)
      ;((diario[k.orgId] ||= {})[d] ||= {})[k.id] = redondear(v, 2)
    }
  }
  const intervalosHoy = {}
  const buckets = Math.max(1, Math.floor((ahora.getHours() * 60 + ahora.getMinutes()) / 15) + 1)
  for (const orgId of Object.keys(diario)) {
    const totalHoy = clavesVirtuales.filter((k) => k.orgId === orgId).reduce((a, k) => a + k.gastoHoy, 0)
    const pesos = []
    for (let i = 0; i < 96; i++) {
      const h = i / 4
      pesos.push(i < buckets ? (h < 7 ? 0.15 : h < 9 ? 0.6 : 1) * entre(0.6, 1.4) : 0)
    }
    const suma = pesos.reduce((a, b) => a + b, 0) || 1
    intervalosHoy[orgId] = pesos.map((p, i) => ({
      hora: `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
      euros: redondear((totalHoy * p) / suma, 3),
      peticiones: Math.round(((orgId === 'org_nexo' ? 19600 : 280) * p) / suma * 2.2),
    }))
  }
  return { diario, intervalosHoy, dias }
}
