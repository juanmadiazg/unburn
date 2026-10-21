import { useMemo } from 'react'
import { useApp } from '../store/AppStore'
import { OTRAS, SERIES } from './dominio'
import { haceDias } from './tiempo'

/**
 * Gasto de la organización actual. Las 4 claves con más gasto del mes llevan color
 * (fijo por clave, en orden de gasto) y el resto se agrupa en «Otras».
 */
export function useGasto() {
  const { datos, org, deOrg } = useApp()
  return useMemo(() => {
    const claves = deOrg('clavesVirtuales')
    const diarioOrg = datos.gasto.diario[org.id] || {}
    const conSerie = claves.filter((k) => Object.values(diarioOrg)[0]?.[k.id] != null).sort((a, b) => b.gastoMes - a.gastoMes)
    const principales = conSerie.slice(0, 4)
    const resto = conSerie.slice(4)
    const colores = {}
    principales.forEach((k, i) => { colores[k.id] = SERIES[i] })
    if (resto.length) colores.otras = OTRAS
    const series = [...principales.map((k) => ({ id: k.id, nombre: k.nombre })), ...(resto.length ? [{ id: 'otras', nombre: `Otras (${resto.length})` }] : [])]
    const diario = Object.entries(diarioOrg).map(([dia, v]) => {
      const fila = { dia, total: Object.values(v).reduce((a, b) => a + b, 0) }
      principales.forEach((k) => { fila[k.id] = v[k.id] })
      if (resto.length) fila.otras = resto.reduce((a, k) => a + (v[k.id] || 0), 0)
      return fila
    })
    const gastoHoy = claves.reduce((a, k) => a + k.gastoHoy, 0)
    const gastoMes = claves.reduce((a, k) => a + k.gastoMes, 0)
    const ayer = diario.length > 1 ? diario[diario.length - 2].total : 0
    const incidentesMes = deOrg('incidentes').filter((i) => haceDias(i.fecha, 30))
    const conAhorro = incidentesMes.filter((i) => i.ahorro)
    const ahorro = { min: conAhorro.reduce((a, i) => a + i.ahorro.min, 0), max: conAhorro.reduce((a, i) => a + i.ahorro.max, 0) }
    // Previsión del cierre de mes (OF-16): ritmo medio de los últimos 7 días completos
    const ahora = new Date()
    const diasMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate()
    const fraccionHoy = (ahora.getHours() * 60 + ahora.getMinutes()) / 1440
    const quedan = diasMes - ahora.getDate() + (1 - fraccionHoy)
    const ultimos = Object.keys(diarioOrg).sort().slice(-8, -1)
    const ritmoClave = {}
    for (const k of claves) ritmoClave[k.id] = ultimos.reduce((a, d) => a + (diarioOrg[d]?.[k.id] || 0), 0) / Math.max(1, ultimos.length)
    const ritmoDiario = Object.values(ritmoClave).reduce((a, b) => a + b, 0)
    const previsionMes = gastoMes + ritmoDiario * quedan
    const previsionClave = (id) => { const k = claves.find((x) => x.id === id); return k ? k.gastoMes + (ritmoClave[id] || 0) * quedan : 0 }
    /** Previsión al cierre del periodo de un presupuesto y día en que superaría el límite duro */
    const previsionPresupuesto = (b) => {
      if (b.periodo === 'diario') {
        const prev = fraccionHoy > 0.05 ? b.gastado / fraccionHoy : b.gastado
        return { prevision: prev, supera: prev > b.limiteDuro, cuando: null }
      }
      const ritmo = b.ambito === 'organizacion' ? ritmoDiario : ritmoClave[b.claveId] || 0
      const prev = b.gastado + ritmo * quedan
      const dias = ritmo > 0 ? Math.ceil((b.limiteDuro - b.gastado) / ritmo) : null
      const cuando = prev > b.limiteDuro && dias != null ? new Date(ahora.getFullYear(), ahora.getMonth(), Math.min(diasMes, ahora.getDate() + Math.max(0, dias))) : null
      return { prevision: prev, supera: prev > b.limiteDuro, cuando }
    }
    return { claves, colores, series, diario, intervalos: datos.gasto.intervalosHoy[org.id] || [], gastoHoy, gastoMes, ayer, ahorro, conAhorro, ritmoDiario, ritmoClave, previsionMes, previsionClave, previsionPresupuesto }
  }, [datos, org, deOrg])
}

export const nombreClave = (claves, id) => claves.find((k) => k.id === id)?.nombre || id

/** Colores de las gráficas y diagramas SVG según el tema (los atributos SVG no leen variables CSS) */
export function useColores() {
  const { oscuro } = useApp()
  return oscuro
    ? { rejilla: '#202127', eje: '#2A2B31', texto: '#8B8C95', textoFuerte: '#EDEDF0', superficie: '#0E0F12', sutil: '#131418', borde: '#3A3B42', bordeSuave: '#2A2B31', tinta: '#F7F7F8', cursor: '#5C5D66', rojo: '#f87171', rojoFondo: '#2a1215', ambar: '#fbbf24', ambarFondo: '#2a2010', azulFondo: '#111c2e', azul: '#6b9be0' }
    : { rejilla: '#F4F4F5', eje: '#E4E4E7', texto: '#71717A', textoFuerte: '#27272A', superficie: '#FFFFFF', sutil: '#FAFAFA', borde: '#D4D4D8', bordeSuave: '#E4E4E7', tinta: '#0B1526', cursor: '#A1A1AA', rojo: '#dc2626', rojoFondo: '#FEF2F2', ambar: '#d97706', ambarFondo: '#FFFBEB', azulFondo: '#EFF6FF', azul: '#3b6fb6' }
}
