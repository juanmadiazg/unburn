import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../store/AppStore'
import { nombreClave, useColores } from '../../lib/hooks'
import { euros, fechaHora, numero } from '../../lib/format'
import { Badge, Card, CardHeader, EmptyState, KV, Mono, PageHeader, PuntoVivo, cx } from '../../components/ui'

const decisiones = (c) => ({
  permitida: { borde: c.borde, fondo: c.superficie, tono: 'green', nombre: 'Permitida' },
  bloqueada: { borde: c.rojo, fondo: c.rojoFondo, tono: 'red', nombre: 'Bloqueada' },
  frenada: { borde: c.ambar, fondo: c.ambarFondo, tono: 'amber', nombre: 'Frenada' },
  'modelo sustituido': { borde: c.azul, fondo: c.azulFondo, tono: 'blue', nombre: 'Modelo sustituido' },
})
const CARRIL = 180, FILA = 46, NODO_W = 160, NODO_H = 30, CAB = 44, MARGEN_X = 64

export default function Contexto() {
  const { sesionId } = useParams()
  const navigate = useNavigate()
  const { deOrg, datos } = useApp()
  const c = useColores()
  const DEC = decisiones(c)
  const sesiones = deOrg('sesiones')
  const sesion = sesiones.find((s) => s.id === sesionId) || sesiones[0]
  const [sel, setSel] = useState(null)
  const incidente = sesion && deOrg('incidentes').find((i) => i.id === sesion.incidenteId)

  const layout = useMemo(() => {
    if (!sesion) return null
    const carriles = [...new Set(sesion.llamadas.map((c) => c.agente))]
    const pos = {}
    sesion.llamadas.forEach((c, i) => { pos[c.id] = [MARGEN_X + carriles.indexOf(c.agente) * CARRIL + CARRIL / 2, CAB + 16 + i * FILA + NODO_H / 2] })
    return { carriles, pos, ancho: MARGEN_X + carriles.length * CARRIL + 8, alto: CAB + 24 + sesion.llamadas.length * FILA }
  }, [sesion])

  if (!sesion) return <><PageHeader title="Grafo de contexto" /><Card><EmptyState title="Sin sesiones">Envía la cabecera X-Unburn-Session para que Unburn agrupe las llamadas de cada tarea.</EmptyState></Card></>
  const llamada = sesion.llamadas.find((c) => c.id === sel) || null
  const evento = llamada && datos.eventos.find((e) => e.id === `evt_${sesion.id.slice(4)}_${llamada.id}`)
  const total = sesion.llamadas.reduce((a, c) => a + c.coste, 0)

  return (
    <>
      <PageHeader title="Grafo de contexto" refs={['OF-02', 'OF-12', 'IC-15', 'IC-16', 'IF-20']}
        description="Cada llamada de una tarea, de qué otras depende, qué agente la encargó y por qué Unburn la permitió o la bloqueó. Sin el texto de las peticiones." />

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <Card className="self-start">
          <CardHeader title="Sesiones" />
          <ul className="p-1">
            {sesiones.map((s) => (
              <li key={s.id}>
                <button onClick={() => { setSel(null); navigate(`/app/contexto/${s.id}`) }} className={cx('w-full rounded-md px-3 py-2 text-left', s.id === sesion.id ? 'bg-ink-100' : 'hover:bg-ink-50')}>
                  <p className="flex items-center gap-1.5 truncate text-sm text-ink-950">{s.enDirecto && <PuntoVivo />}{s.titulo}</p>
                  <p className="flex items-center justify-between text-xs text-ink-500"><Mono>{s.id}</Mono><span>{s.llamadas.length} llamadas</span></p>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="min-w-0">
          <CardHeader title={sesion.titulo}
            subtitle={<span><Mono>{sesion.id}</Mono> · {nombreClave(datos.clavesVirtuales, sesion.claveId)} · {fechaHora(sesion.inicio)} · {sesion.llamadas.length} llamadas · {euros(total)}</span>}
            actions={incidente && <Link to={`/app/incidentes/${incidente.id}`} className="text-xs font-medium text-red-700 hover:underline">{incidente.id} →</Link>} />
          <div className="overflow-x-auto p-3">
            <svg width={layout.ancho} height={layout.alto} className="block" role="img" aria-label="Grafo de la sesión">
              <defs><marker id="pc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill={c.cursor} /></marker></defs>
              {layout.carriles.map((a, i) => (
                <g key={a}>
                  {i > 0 && <line x1={MARGEN_X + i * CARRIL} x2={MARGEN_X + i * CARRIL} y1={8} y2={layout.alto} stroke={c.rejilla} />}
                  <text x={MARGEN_X + i * CARRIL + CARRIL / 2} y={24} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill={c.texto}>{a}</text>
                </g>
              ))}
              <line x1={8} x2={layout.ancho} y1={CAB} y2={CAB} stroke={c.eje} />
              {sesion.llamadas.map((ll) => ll.dependeDe.filter((d) => layout.pos[d]).map((d) => {
                const [x1, y1] = layout.pos[d], [x2, y2] = layout.pos[ll.id]
                const bucle = ll.enBucle
                return <path key={`${d}-${ll.id}`} d={x1 === x2 ? `M${x1} ${y1 + NODO_H / 2} L${x2} ${y2 - NODO_H / 2 - 1}` : `M${x1} ${y1 + NODO_H / 2} C${x1} ${y1 + 30}, ${x2} ${y2 - 34}, ${x2} ${y2 - NODO_H / 2 - 1}`}
                  fill="none" stroke={bucle ? c.rojo : c.borde} strokeWidth={bucle ? 1.5 : 1} markerEnd="url(#pc)" />
              }))}
              {sesion.llamadas.map((ll) => {
                const [x, y] = layout.pos[ll.id]
                const d = DEC[ll.decision] || DEC.permitida
                const activo = sel === ll.id
                return (
                  <g key={ll.id} transform={`translate(${x - NODO_W / 2} ${y - NODO_H / 2})`} onClick={() => setSel(ll.id)} className="cursor-pointer">
                    <rect width={NODO_W} height={NODO_H} rx="6" fill={d.fondo} stroke={activo ? c.tinta : ll.causaRaiz ? c.rojo : d.borde} strokeWidth={activo || ll.causaRaiz ? 1.75 : 1} strokeDasharray={ll.enBucle && ll.decision === 'permitida' ? '4 2' : '0'} />
                    <text x="10" y={NODO_H / 2 + 4} fontSize="11" fontFamily="JetBrains Mono, monospace" fill={c.tinta}>{ll.id}</text>
                    <text x="36" y={NODO_H / 2 + 4} fontSize="10.5" fill={c.texto}>{(ll.herramienta || ll.modelo).slice(0, 14)}</text>
                    <text x={NODO_W - 8} y={NODO_H / 2 + 4} textAnchor="end" fontSize="10" fill={c.texto}>{ll.coste ? `${ll.coste.toFixed(2).replace('.', ',')} €` : '0 €'}</text>
                  </g>
                )
              })}
              {sesion.llamadas.map((ll, i) => <text key={`h${ll.id}`} x={10} y={CAB + 16 + i * FILA + NODO_H / 2 + 4} fontSize="10" fill={c.cursor} className="tabular-nums">{ll.hora.slice(0, 5)}</text>)}
            </svg>
          </div>
          <div className="flex flex-wrap gap-4 border-t border-ink-150 px-4 py-2.5 text-xs text-ink-500">
            {Object.entries(DEC).map(([k, d]) => <span key={k} className="flex items-center gap-1.5"><span className="h-3 w-4 rounded-sm border" style={{ borderColor: d.borde, background: d.fondo }} />{d.nombre}</span>)}
            <span className="flex items-center gap-1.5"><span className="h-3 w-4 rounded-sm border border-dashed border-ink-400" />En bucle</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-4 rounded-sm border-[1.75px] border-red-600" />Causa raíz</span>
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title={llamada ? `Llamada ${llamada.id}` : 'Detalle de la llamada'} subtitle={llamada ? `${llamada.hora} · evento de auditoría` : 'Selecciona un nodo del grafo'} />
          {!llamada ? <p className="px-4 py-8 text-center text-sm text-ink-500">Haz clic en una llamada para ver qué decidió Unburn y por qué.</p> : (
            <div className="space-y-4 px-4 py-4">
              <Badge tone={DEC[llamada.decision].tono}>{DEC[llamada.decision].nombre}</Badge>
              <div><p className="text-xs text-ink-500">Motivo o regla aplicada</p><p className="mt-0.5 text-sm text-ink-900">{llamada.motivo}</p></div>
              {llamada.causaRaiz && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">Señalada por el diagnóstico causal como el paso que originó el bucle.</p>}
              {llamada.caminoIndirecto && <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">Esta delegación aprovecha un camino indirecto del grafo de autorización.</p>}
              <KV cols={1} items={[
                ['Agente', <Mono key="a">{llamada.agente}</Mono>],
                ['Encargada por', llamada.encargadoPor ? <Mono key="e">{llamada.encargadoPor}</Mono> : 'Usuario / aplicación'],
                ['Depende de', llamada.dependeDe.length ? <Mono key="d">{llamada.dependeDe.join(', ')}</Mono> : '—'],
                ['Modelo', <Mono key="m">{llamada.modelo}</Mono>],
                ['Herramienta pedida', llamada.herramienta ? <Mono key="h">{llamada.herramienta}</Mono> : '—'],
                ['Tokens (entrada · salida · razonamiento · caché)', <span key="t" className="tabular-nums">{llamada.tokens.map(numero).join(' · ')}</span>],
                ['Coste real', euros(llamada.coste)],
                ['Latencia', `${numero(llamada.latencia)} ms`],
                ['Huella', <Mono key="hu">{llamada.huella}</Mono>],
                evento && ['Versión de la configuración', <Mono key="v">{evento.versionConfig}</Mono>],
              ]} />
              {evento && <Link to={`/app/auditoria?evento=${evento.id}`} className="block text-xs font-medium text-ink-900 hover:underline">Ver en el registro de auditoría →</Link>}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
