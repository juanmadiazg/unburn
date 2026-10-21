// Etiquetas y reglas de negocio del documento de arquitectura, centralizadas.

export const TIPOS_INCIDENTE = {
  bucle: { nombre: 'Bucle', tono: 'violet' },
  consumo_anomalo: { nombre: 'Consumo anómalo', tono: 'amber' },
  presupuesto_agotado: { nombre: 'Presupuesto agotado', tono: 'orange' },
  herramienta_denegada: { nombre: 'Herramienta denegada', tono: 'red' },
}

export const SUBTIPOS_BUCLE = {
  repeticion: 'Un agente repite la misma acción con el mismo resultado',
  ping_pong: 'Dos agentes se pasan lo mismo una y otra vez',
  limites_tarea: 'La tarea superó sus límites de llamadas, gasto o duración',
}

export const DECISIONES = {
  permitida: { nombre: 'Permitida', tono: 'green' },
  bloqueada: { nombre: 'Bloqueada', tono: 'red' },
  frenada: { nombre: 'Frenada', tono: 'amber' },
  'modelo sustituido': { nombre: 'Modelo sustituido', tono: 'blue' },
  'configuración': { nombre: 'Cambio de configuración', tono: 'gray' },
}

export const ESTADOS_CLAVE = {
  activa: { nombre: 'Activa', tono: 'green' },
  revocada: { nombre: 'Revocada', tono: 'red' },
  sustituida: { nombre: 'Sustituida (rotada)', tono: 'gray' },
}

export const CANALES = {
  email: { nombre: 'Email' },
  slack: { nombre: 'Slack' },
  teams: { nombre: 'Microsoft Teams' },
  webhook: { nombre: 'Webhook' },
}

export const AVISOS = {
  incidente: 'Incidentes nuevos (con enlace al diagnóstico)',
  limite_blando: 'Cruce del límite blando de un presupuesto',
  cuota: 'Llegada al 80 % y al 100 % de la cuota',
  tope_excedente: 'Llegada al 80 % y al 100 % del tope de excedente',
}

export const ESTADOS_TICKET = {
  abierto: { nombre: 'Abierto', tono: 'blue' },
  escalado: { nombre: 'Escalado a Ingeniería', tono: 'amber' },
  cerrado: { nombre: 'Cerrado', tono: 'gray' },
}

// Paleta de gráficas: tonos apagados validados (lightness, croma, daltonismo y contraste) con
// scripts/validate_palette.js. Máximo 4 series con color; el resto se agrupa en «Otras» (gris).
export const SERIES = ['#3b6fb6', '#d9893f', '#2e9c84', '#9b6bb5']
export const OTRAS = '#c4c4cc'
export const UNA_SERIE = '#3b6fb6'

/**
 * Caminos indirectos (OF-08): un agente A con una categoría de datos prohibida puede llegar
 * a ella si delega (directa o transitivamente) en otro agente B que usa una herramienta de
 * esa categoría. Se recalcula con cada cambio del grafo, como hace AP-05.
 */
export function caminosIndirectos(grafo, herramientas) {
  const delega = {}
  for (const [de, a] of grafo.puedeDelegar) (delega[de] ||= []).push(a)
  const usa = {}
  for (const [ag, t] of grafo.puedeUsar) (usa[ag] ||= []).push(t)
  const catDe = Object.fromEntries(herramientas.map((h) => [h.id, h.categoria]))
  const caminos = []
  for (const [agente, categoria] of grafo.prohibidas) {
    // BFS sobre delegaciones guardando la ruta
    const cola = [[agente]]
    const visto = new Set([agente])
    while (cola.length) {
      const ruta = cola.shift()
      const ultimo = ruta[ruta.length - 1]
      for (const sig of delega[ultimo] || []) {
        if (visto.has(sig)) continue
        visto.add(sig)
        const nueva = [...ruta, sig]
        for (const t of usa[sig] || []) {
          if (catDe[t] === categoria) caminos.push({ agente, categoria, ruta: nueva, herramienta: t })
        }
        cola.push(nueva)
      }
    }
  }
  return caminos.map((c, i) => ({ ...c, id: `CI-${String(i + 1).padStart(2, '0')}` }))
}
