// Tiempo del prototipo. Los datos mock se escribieron con una hora de referencia
// (ANCLA = 21/10/2026, 16:45). Al arrancar, todas sus fechas se desplazan para que
// esa referencia coincida con la hora real del navegador: lo que pasó «hace 8 min»
// sigue pasando hace 8 min, sea el día que sea.

export const ANCLA = new Date('2026-10-21T16:45:00')
const ARRANQUE = new Date()

const inicioDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const DESFASE_MS = ARRANQUE.getTime() - ANCLA.getTime()
export const DESFASE_DIAS = Math.round((inicioDia(ARRANQUE) - inicioDia(ANCLA)) / 864e5)
export const DESFASE_MESES = (ARRANQUE.getFullYear() - ANCLA.getFullYear()) * 12 + ARRANQUE.getMonth() - ANCLA.getMonth()

const p2 = (n) => String(n).padStart(2, '0')
/** Fecha local en formato ISO sin zona: 2026-10-21T16:45:00 */
export const isoLocal = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`
export const diaLocal = (d) => isoLocal(d).slice(0, 10)
export const ahora = () => new Date()
export const ahoraIso = () => isoLocal(new Date())
export const hoyIso = () => diaLocal(new Date())
export const mesActual = () => hoyIso().slice(0, 7)

const RE_FECHA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/
const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/
const RE_MES = /^\d{4}-\d{2}$/

export function desplazarFecha(s) {
  if (RE_FECHA_HORA.test(s)) return isoLocal(new Date(new Date(s).getTime() + DESFASE_MS))
  if (RE_FECHA.test(s)) { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + DESFASE_DIAS); return diaLocal(d) }
  if (RE_MES.test(s)) { const [y, m] = s.split('-').map(Number); const d = new Date(y, m - 1 + DESFASE_MESES, 1); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}` }
  return s
}

/** Recorre un objeto y desplaza todas las fechas que encuentra (valores, no claves) */
export function desplazar(valor) {
  if (typeof valor === 'string') return desplazarFecha(valor)
  if (Array.isArray(valor)) return valor.map(desplazar)
  if (valor && typeof valor === 'object') {
    const r = {}
    for (const [k, v] of Object.entries(valor)) r[k] = desplazar(v)
    return r
  }
  return valor
}

/** Las llamadas de cada sesión guardan solo la hora: se calcula su fecha completa y se desplaza */
export function desplazarSesiones(sesiones) {
  return sesiones.map((s) => {
    const dia = s.inicio.slice(0, 10)
    const llamadas = s.llamadas.map((c) => {
      const fecha = desplazarFecha(`${dia}T${c.hora}`)
      return { ...c, fecha, hora: fecha.slice(11, 19) }
    })
    return { ...desplazar({ ...s, llamadas: [] }), llamadas }
  })
}

export const nombreMes = (ym = mesActual()) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long' })
}
export const esMesActual = (iso) => !!iso && iso.startsWith(mesActual())
export const haceDias = (iso, dias) => !!iso && new Date(iso) >= new Date(Date.now() - dias * 864e5)
export const primerDiaMesSiguiente = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1) }
export const diaDelMes = () => new Date().getDate()
export const diasDelMes = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() }
