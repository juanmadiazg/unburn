// Grafo de autorización (IC-11): agentes a la izquierda, herramientas a la derecha agrupadas por
// categoría de datos. Aristas: «puede usar» (gris) y «puede delegar en» (discontinua con flecha).
// Un camino indirecto seleccionado se resalta en rojo.

export const COLOR_CATEGORIA = { personales: '#c0566b', financieros: '#d9893f', internos: '#3b6fb6', publicos: '#2e9c84', null: '#A1A1AA' }
const ORDEN_CAT = ['personales', 'financieros', 'internos', 'publicos', null]

import { useColores } from '../lib/hooks'

const AG_W = 156, AG_H = 34, HT_W = 186, HT_H = 28, X_HERR = 600

export default function GrafoAutorizacion({ grafo, agentes, herramientas, categorias, camino, seleccionado, onAgente }) {
  const c = useColores()
  const pos = grafo.posiciones
  const usadas = herramientas.filter((h) => grafo.puedeUsar.some(([, t]) => t === h.id) || h.estado !== 'bloqueada')
  const ordenadas = [...usadas].sort((a, b) => ORDEN_CAT.indexOf(a.categoria) - ORDEN_CAT.indexOf(b.categoria) || a.nombre.localeCompare(b.nombre))
  const alto = Math.max(600, ordenadas.length * 44 + 40)
  const posH = Object.fromEntries(ordenadas.map((h, i) => [h.id, [X_HERR, 40 + i * ((alto - 80) / Math.max(1, ordenadas.length - 1))]]))
  const nombreCat = (id) => categorias.find((c) => c.id === id)?.nombre

  // Aristas del camino resaltado
  const enCamino = new Set()
  if (camino) {
    for (let i = 0; i < camino.ruta.length - 1; i++) enCamino.add(`d:${camino.ruta[i]}>${camino.ruta[i + 1]}`)
    enCamino.add(`u:${camino.ruta[camino.ruta.length - 1]}>${camino.herramienta}`)
  }
  const nodosCamino = new Set(camino ? [...camino.ruta, camino.herramienta] : [])

  return (
    <svg viewBox={`0 0 ${X_HERR + HT_W / 2 + 20} ${alto}`} className="h-auto w-full" role="img" aria-label="Grafo de autorización">
      <defs>
        <marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={c.texto} /></marker>
        <marker id="flecha-roja" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={c.rojo} /></marker>
      </defs>

      {/* puede usar */}
      {grafo.puedeUsar.map(([a, t]) => {
        if (!pos[a] || !posH[t]) return null
        const [x1, y1] = pos[a], [x2, y2] = posH[t]
        const rojo = enCamino.has(`u:${a}>${t}`)
        const sx = x1 + AG_W / 2, ex = x2 - HT_W / 2
        return <path key={`u${a}${t}`} d={`M${sx} ${y1} C${sx + 90} ${y1}, ${ex - 90} ${y2}, ${ex} ${y2}`} fill="none" stroke={rojo ? c.rojo : c.borde} strokeWidth={rojo ? 2 : 1} opacity={camino && !rojo ? 0.45 : 1} />
      })}

      {/* puede delegar en */}
      {grafo.puedeDelegar.map(([a, b]) => {
        if (!pos[a] || !pos[b]) return null
        const [x1, y1] = pos[a], [x2, y2] = pos[b]
        const rojo = enCamino.has(`d:${a}>${b}`)
        const mismaColumna = Math.abs(x1 - x2) < 10
        const dir = y2 > y1 ? 1 : -1
        const d = mismaColumna
          ? `M${x1 - AG_W / 2} ${y1 + 6 * dir} C${x1 - AG_W / 2 - 60} ${y1}, ${x2 - AG_W / 2 - 60} ${y2}, ${x2 - AG_W / 2} ${y2 - 6 * dir}`
          : `M${x1 + (x2 > x1 ? AG_W / 2 : -AG_W / 2)} ${y1} C${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2 + (x2 > x1 ? -AG_W / 2 : AG_W / 2)} ${y2 + (y2 > y1 ? -8 : 8)}`
        // Si la delegación es recíproca, separa ligeramente las dos curvas
        const reciproca = grafo.puedeDelegar.some(([p, q]) => p === b && q === a)
        return <path key={`d${a}${b}`} d={d} transform={reciproca ? `translate(${a < b ? -5 : 5} 0)` : undefined} fill="none" stroke={rojo ? c.rojo : c.texto} strokeWidth={rojo ? 2 : 1.25} strokeDasharray={rojo ? '0' : '4 3'} markerEnd={`url(#${rojo ? 'flecha-roja' : 'flecha'})`} opacity={camino && !rojo ? 0.35 : 1} />
      })}

      {/* agentes */}
      {agentes.map((ag) => {
        const p = pos[ag.id]
        if (!p) return null
        const prohibidas = grafo.prohibidas.filter(([a]) => a === ag.id).map(([, c]) => nombreCat(c))
        const activo = seleccionado === ag.id || nodosCamino.has(ag.id)
        return (
          <g key={ag.id} transform={`translate(${p[0] - AG_W / 2} ${p[1] - AG_H / 2})`} onClick={() => onAgente?.(ag.id)} className="cursor-pointer">
            <rect width={AG_W} height={AG_H} rx="6" fill={c.superficie} stroke={nodosCamino.has(ag.id) ? c.rojo : activo ? c.tinta : c.borde} strokeWidth={activo ? 1.5 : 1} />
            <text x={AG_W / 2} y={AG_H / 2 + 4} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill={c.tinta}>{ag.id}</text>
            {prohibidas.length > 0 && <text x={AG_W / 2} y={AG_H + 13} textAnchor="middle" fontSize="10" fill={c.rojo}>sin acceso: {prohibidas.join(', ')}</text>}
          </g>
        )
      })}

      {/* herramientas */}
      {ordenadas.map((h) => {
        const [x, y] = posH[h.id]
        const resaltada = nodosCamino.has(h.id)
        return (
          <g key={h.id} transform={`translate(${x - HT_W / 2} ${y - HT_H / 2})`} opacity={camino && !resaltada ? 0.55 : 1}>
            <rect width={HT_W} height={HT_H} rx="6" fill={c.superficie} stroke={resaltada ? c.rojo : c.bordeSuave} strokeWidth={resaltada ? 1.5 : 1} strokeDasharray={h.estado === 'pendiente' ? '3 3' : '0'} />
            <rect x="0" y="0" width="4" height={HT_H} rx="2" fill={COLOR_CATEGORIA[h.categoria]} />
            <text x="14" y={HT_H / 2 + 4} fontSize="11" fontFamily="JetBrains Mono, monospace" fill={c.textoFuerte}>{h.nombre}</text>
            {h.ejecuta === 'proveedor' && <text x={HT_W - 8} y={HT_H / 2 + 3.5} textAnchor="end" fontSize="9" fill={c.texto}>PROV.</text>}
          </g>
        )
      })}
    </svg>
  )
}
