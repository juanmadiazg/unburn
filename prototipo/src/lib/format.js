// Formato es-ES. Las fechas relativas usan la hora real del navegador.
export { ahoraIso } from './tiempo'

const eur2 = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const eur4 = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 4, maximumFractionDigits: 4 })
const eur0 = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('es-ES')
const num1 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })

export const euros = (v, decimales = 2) => (v == null ? '—' : decimales === 0 ? eur0.format(v) : decimales === 4 ? eur4.format(v) : eur2.format(v))
export const numero = (v) => (v == null ? '—' : num.format(Math.round(v)))
export const decimal = (v) => (v == null ? '—' : num1.format(v))
export const porcentaje = (v, total) => (total ? Math.round((v / total) * 100) : 0)
export const rangoEuros = (r) => (r ? `${euros(r.min, 0)} – ${euros(r.max, 0)}` : '—')
export const compacto = (v) => (v >= 1e6 ? `${decimal(v / 1e6)} M` : v >= 1e4 ? `${decimal(v / 1e3)} mil` : numero(v))

export function fecha(iso, opciones = {}) {
  if (!iso) return '—'
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: opciones.anio === false ? undefined : 'numeric' })
}

export function fechaHora(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}, ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
}

export function hora(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function haceCuanto(iso) {
  if (!iso) return '—'
  const seg = Math.round((Date.now() - new Date(iso)) / 1000)
  if (seg < 0) return 'en un momento'
  if (seg < 10) return 'ahora mismo'
  if (seg < 60) return `hace ${seg} s`
  const min = Math.round(seg / 60)
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'ayer' : d < 30 ? `hace ${d} días` : fecha(iso)
}

export const mesLargo = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  const s = new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}
export const mesCorto = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
}

export const aleatorio = (n = 4) => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < n; i++) s += abc[Math.floor(Math.random() * abc.length)]
  return s
}
