// Indicadores de 4.2 (3.1 y 3.2): coste medio por sesión resuelta, tasa de peticiones bloqueadas
// por seguridad, latencia añadida por el Gateway, diferencia de coste por modelo sustituto,
// gasto evitado y ROI. Se calculan sobre los eventos y los incidentes de la organización.
import { costeTokens } from '../sim/generar'
import { haceDias } from './tiempo'

const percentil = (valores, p) => {
  if (!valores.length) return 0
  const v = [...valores].sort((a, b) => a - b)
  return v[Math.min(v.length - 1, Math.floor((p / 100) * v.length))]
}

export function calcularKpis(datos, orgId, plan) {
  const eventos = datos.eventos.filter((e) => e.orgId === orgId && haceDias(e.fecha, 7))
  const generacion = eventos.filter((e) => e.tipo === 'generacion')

  const sesiones = {}
  for (const e of generacion) {
    if (!e.sesionId) continue
    const s = (sesiones[e.sesionId] ||= { coste: 0, problema: false })
    s.coste += e.costeReal
    if (e.decision === 'bloqueada' || e.decision === 'frenada') s.problema = true
  }
  const resueltas = Object.values(sesiones).filter((s) => !s.problema)
  const costeMedioSesion = resueltas.length ? resueltas.reduce((a, s) => a + s.coste, 0) / resueltas.length : 0

  const seguridad = generacion.filter((e) => e.decision === 'bloqueada' && (e.codigo === 403 || /escudo|herramienta|delegación/i.test(e.motivo)))
  const tasaBloqueosSeguridad = generacion.length ? (seguridad.length / generacion.length) * 100 : 0
  const quitadas = generacion.filter((e) => e.herramientasQuitadas?.length).length

  const latencias = eventos.map((e) => e.latenciaGatewayMs).filter((x) => x > 0)
  const latenciaP95 = percentil(latencias, 95)
  const latenciaP50 = percentil(latencias, 50)

  const sustituidas = generacion.filter((e) => e.decision === 'modelo sustituido' && e.modeloUsado && e.modeloPedido !== e.modeloUsado)
  let costeOriginal = 0, costeSustituto = 0
  for (const e of sustituidas) {
    const t = [e.tokens.entrada, e.tokens.salida, e.tokens.razonamiento, e.tokens.cache]
    costeOriginal += costeTokens(datos.modelos, e.modeloPedido, t)
    costeSustituto += e.costeReal || costeTokens(datos.modelos, e.modeloUsado, t)
  }
  const diferenciaSustituto = { peticiones: sustituidas.length, ahorro: costeOriginal - costeSustituto, pct: costeOriginal ? ((costeOriginal - costeSustituto) / costeOriginal) * 100 : 0 }

  const incidentes = datos.incidentes.filter((i) => i.orgId === orgId && haceDias(i.fecha, 30))
  const conAhorro = incidentes.filter((i) => i.ahorro)
  const gastoEvitado = { min: conAhorro.reduce((a, i) => a + i.ahorro.min, 0), max: conAhorro.reduce((a, i) => a + i.ahorro.max, 0), n: conAhorro.length }
  const cuota = plan?.precioMensual || 0
  const roi = cuota ? ((gastoEvitado.min + gastoEvitado.max) / 2) / cuota : null

  return { costeMedioSesion, sesionesResueltas: resueltas.length, tasaBloqueosSeguridad, bloqueosSeguridad: seguridad.length, quitadas, latenciaP95, latenciaP50, diferenciaSustituto, gastoEvitado, roi, cuota, peticiones: generacion.length }
}
