import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, Network } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { useGasto, nombreClave } from '../../lib/hooks'
import { euros, fechaHora, haceCuanto, numero } from '../../lib/format'
import { nombreMes, haceDias } from '../../lib/tiempo'
import { SERIES, OTRAS } from '../../lib/dominio'
import { Badge, Button, Card, CardHeader, Cifra, DataTable, EmptyState, Mono, PageHeader, Tabs, Tag } from '../../components/ui'
import { BarrasSimples, GastoDiarioChart, Leyenda } from '../../components/charts'

const ESTADO_SESION = { bloqueada: 'red', frenada: 'amber', finalizada: 'gray', activa: 'green' }
const NOMBRE_SESION = { bloqueada: 'Bloqueada', frenada: 'Frenada', finalizada: 'Finalizada', activa: 'En curso' }

export default function Gasto() {
  const { datos, deOrg, plan, toast } = useApp()
  const g = useGasto()
  const navigate = useNavigate()
  const [tab, setTab] = useState('claves')
  const agentes = deOrg('agentes')
  const sesionesManuales = deOrg('sesiones')

  // Sesiones: las documentadas (con grafo de contexto) y las del tráfico de fondo, agrupadas desde el registro
  const sesiones = useMemo(() => {
    const manuales = sesionesManuales.map((s) => ({
      id: s.id, titulo: s.titulo, claveId: s.claveId, inicio: s.inicio, llamadas: s.llamadas.length,
      coste: s.llamadas.reduce((a, c) => a + c.coste, 0), agentes: [...new Set(s.llamadas.map((c) => c.agente))], estado: s.estado, grafo: true,
    }))
    const ids = new Set(manuales.map((s) => s.id))
    const grupos = {}
    for (const e of deOrg('eventos')) {
      if (!e.sesionId || ids.has(e.sesionId)) continue
      const s = (grupos[e.sesionId] ||= { id: e.sesionId, titulo: null, claveId: e.claveId, inicio: e.fecha, llamadas: 0, coste: 0, agentes: new Set(), estado: 'finalizada', grafo: false })
      s.llamadas++; s.coste += e.costeReal; s.agentes.add(e.agente)
      if (e.fecha < s.inicio) s.inicio = e.fecha
    }
    return [...manuales, ...Object.values(grupos).map((s) => ({ ...s, agentes: [...s.agentes] }))]
  }, [sesionesManuales, deOrg])

  const exportar = () => {
    const filas = [['clave', 'dia', 'euros'], ...g.diario.flatMap((d) => g.claves.filter((k) => datos.gasto.diario[k.orgId]?.[d.dia]?.[k.id] != null).map((k) => [k.nombre, d.dia, datos.gasto.diario[k.orgId][d.dia][k.id]]))]
    const blob = new Blob([filas.map((f) => f.join(';')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'unburn-gasto-30-dias.csv'; a.click()
    toast('Exportación descargada', 'exito', 'unburn-gasto-30-dias.csv')
  }

  // Gasto por modelo (OF-16) con los eventos del registro de los últimos 7 días
  const porModelo = useMemo(() => {
    const ev = deOrg('eventos').filter((e) => e.tipo === 'generacion' && e.modeloUsado && haceDias(e.fecha, 7))
    const m = {}
    const dias = {}
    for (const e of ev) {
      const x = (m[e.modeloUsado] ||= { modelo: e.modeloUsado, coste: 0, peticiones: 0, entrada: 0, salida: 0, sustituidas: 0 })
      x.coste += e.costeReal; x.peticiones++; x.entrada += e.tokens.entrada; x.salida += e.tokens.salida
      if (e.decision === 'modelo sustituido') x.sustituidas++
      const d = e.fecha.slice(0, 10)
      ;(dias[d] ||= { dia: d })[e.modeloUsado] = ((dias[d] || {})[e.modeloUsado] || 0) + e.costeReal
    }
    const filas = Object.values(m).sort((a, b) => b.coste - a.coste)
    const colores = Object.fromEntries(filas.map((f, i) => [f.modelo, SERIES[i] || OTRAS]))
    return { filas, colores, serie: Object.values(dias).sort((a, b) => a.dia.localeCompare(b.dia)), series: filas.map((f) => ({ id: f.modelo, nombre: f.modelo })) }
  }, [deOrg])

  const activas = g.claves.filter((k) => k.estado === 'activa')
  const opcionesClave = activas.map((k) => ({ id: k.id, label: k.nombre }))

  return (
    <>
      <PageHeader title="Gasto y sesiones" refs={['BP-10', 'OF-02', 'IC-15', 'IC-21']}
        description="Gasto por clave y, dentro de la retención de tu plan, por agente y por sesión. El gasto lo cobra cada proveedor de IA; Unburn lo vigila y lo limita."
        actions={<Button icon={Download} onClick={exportar}>Exportar CSV</Button>} />

      <Card className="mb-6">
        <CardHeader title="Gasto diario por clave" subtitle={`Últimos 30 días · ${euros(g.gastoMes)} en ${nombreMes()}`} actions={<Leyenda items={g.series.map((s) => ({ nombre: s.nombre, color: g.colores[s.id] }))} />} />
        <div className="px-2 py-3"><GastoDiarioChart datos={g.diario} series={g.series} colores={g.colores} alto={230} /></div>
      </Card>

      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'claves', label: 'Por clave', count: activas.length },
        { id: 'agentes', label: 'Por agente', count: agentes.length },
        { id: 'modelos', label: 'Por modelo', count: porModelo.filas.length },
        { id: 'sesiones', label: 'Sesiones', count: sesiones.length },
      ]} />

      {tab === 'claves' && (
        <DataTable rows={activas} search={(k) => `${k.nombre} ${k.prefijo}`} searchPlaceholder="Buscar clave…" initialSort={{ id: 'mes', dir: 'desc' }}
          onRowClick={(k) => navigate(`/app/claves?clave=${k.id}`)}
          filters={[{ id: 'tipo', label: 'Tipo', options: [{ id: 'agente', label: 'Agente' }, { id: 'equipo', label: 'Equipo' }, { id: 'entorno', label: 'Entorno' }], value: (k) => k.tipo }]}
          columns={[
            { id: 'nombre', header: 'Clave', sort: (k) => k.nombre, cell: (k) => <div><p className="text-ink-950">{k.nombre}</p><Mono className="text-ink-400">{k.prefijo}…</Mono></div> },
            { id: 'tipo', header: 'Tipo', cell: (k) => <Tag>{k.tipo}</Tag> },
            { id: 'hoy', header: 'Hoy', align: 'right', sort: (k) => k.gastoHoy, cell: (k) => <Cifra valor={k.gastoHoy} formato={(v) => euros(v)} /> },
            { id: 'mes', header: 'Este mes', align: 'right', sort: (k) => k.gastoMes, cell: (k) => <span className="font-medium text-ink-950"><Cifra valor={k.gastoMes} formato={(v) => euros(v)} /></span> },
            { id: 'prev', header: 'Previsión mes', align: 'right', sort: (k) => g.previsionClave(k.id), cell: (k) => <span className="text-ink-600">{euros(g.previsionClave(k.id), 0)}</span> },
            { id: 'pet', header: 'Peticiones', align: 'right', sort: (k) => k.peticionesMes, cell: (k) => <Cifra valor={k.peticionesMes} formato={numero} /> },
            { id: 'medio', header: 'Coste / 1.000 pet.', align: 'right', sort: (k) => (k.peticionesMes ? k.gastoMes / k.peticionesMes : 0), cell: (k) => (k.peticionesMes ? euros((k.gastoMes / k.peticionesMes) * 1000) : '—') },
            { id: 'uso', header: 'Último uso', align: 'right', sort: (k) => k.ultimoUso || '', cell: (k) => <span className="text-ink-500">{haceCuanto(k.ultimoUso)}</span> },
          ]} />
      )}

      {tab === 'agentes' && (agentes.length === 0 ? (
        <Card><EmptyState title="No hay agentes declarados" icon={Network}>Tus claves no tienen lista de agentes, así que el gasto se atribuye a cada clave. Si varios agentes comparten clave, envía la cabecera <Mono>X-Unburn-Agent</Mono>.</EmptyState></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader title={`Gasto de ${nombreMes()} por agente`} />
            <div className="px-4 py-4"><BarrasSimples datos={[...agentes].sort((a, b) => b.gastoMes - a.gastoMes).map((a) => ({ nombre: a.id, valor: a.gastoMes }))} formato={(v) => euros(v)} /></div>
          </Card>
          <div className="lg:col-span-3">
            <DataTable rows={agentes} initialSort={{ id: 'mes', dir: 'desc' }} search={(a) => `${a.id} ${a.descripcion}`} searchPlaceholder="Buscar agente…"
              columns={[
                { id: 'agente', header: 'Agente', sort: (a) => a.id, cell: (a) => <div><p className="font-mono text-[12.5px] text-ink-950">{a.id}</p><p className="max-w-[260px] truncate text-xs text-ink-500">{a.descripcion}</p></div> },
                { id: 'claves', header: 'Claves', cell: (a) => a.claves.map((c) => <Tag key={c} className="mr-1">{nombreClave(datos.clavesVirtuales, c)}</Tag>) },
                { id: 'mes', header: 'Este mes', align: 'right', sort: (a) => a.gastoMes, cell: (a) => <span className="font-medium text-ink-950"><Cifra valor={a.gastoMes} formato={(v) => euros(v)} /></span> },
                { id: 'act', header: 'Actividad', align: 'right', sort: (a) => a.ultimaActividad, cell: (a) => <span className="text-ink-500">{haceCuanto(a.ultimaActividad)}</span> },
              ]} />
          </div>
        </div>
      ))}

      {tab === 'modelos' && (
        <div className="space-y-6" data-por-modelo>
          <Card>
            <CardHeader title="Evolución del gasto por modelo" subtitle="Últimos 7 días · registro de auditoría" actions={<Leyenda items={porModelo.series.map((x) => ({ nombre: x.nombre, color: porModelo.colores[x.id] }))} />} />
            <div className="px-2 py-3"><GastoDiarioChart datos={porModelo.serie} series={porModelo.series} colores={porModelo.colores} alto={200} /></div>
          </Card>
          <DataTable rows={porModelo.filas} rowKey={(f) => f.modelo} initialSort={{ id: 'coste', dir: 'desc' }}
            columns={[
              { id: 'modelo', header: 'Modelo', cell: (f) => <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: porModelo.colores[f.modelo] }} /><Mono className="text-ink-950">{f.modelo}</Mono></span> },
              { id: 'coste', header: 'Gasto (7 días)', align: 'right', sort: (f) => f.coste, cell: (f) => <span className="font-medium text-ink-950">{euros(f.coste)}</span> },
              { id: 'pet', header: 'Peticiones', align: 'right', sort: (f) => f.peticiones, cell: (f) => numero(f.peticiones) },
              { id: 'medio', header: 'Coste medio', align: 'right', sort: (f) => f.coste / f.peticiones, cell: (f) => euros(f.coste / f.peticiones, 4) },
              { id: 'tok', header: 'Tokens entrada · salida', align: 'right', cell: (f) => `${numero(f.entrada)} · ${numero(f.salida)}` },
              { id: 'sust', header: 'Por modelo sustituto', align: 'right', cell: (f) => (f.sustituidas ? numero(f.sustituidas) : '—') },
            ]} />
        </div>
      )}

      {tab === 'sesiones' && (
        <>
          <p className="mb-3 text-xs text-ink-500">Retención del detalle en el plan {plan.nombre}: {plan.diasRetencion >= 180 ? '6 meses o más' : `${plan.diasRetencion} días`}. Las sesiones se agrupan con la cabecera <Mono>X-Unburn-Session</Mono>.</p>
          <DataTable rows={sesiones} pageSize={12} initialSort={{ id: 'inicio', dir: 'desc' }} search={(s) => `${s.id} ${s.titulo || ''} ${s.agentes.join(' ')}`} searchPlaceholder="Buscar sesión o agente…"
            onRowClick={(s) => navigate(s.grafo ? `/app/contexto/${s.id}` : `/app/auditoria?sesion=${s.id}`)}
            filters={[
              { id: 'clave', label: 'Clave', options: opcionesClave, value: (s) => s.claveId },
              { id: 'estado', label: 'Estado', options: [{ id: 'activa', label: 'En curso' }, { id: 'finalizada', label: 'Finalizada' }, { id: 'bloqueada', label: 'Bloqueada' }, { id: 'frenada', label: 'Frenada' }], value: (s) => s.estado },
            ]}
            columns={[
              { id: 'id', header: 'Sesión', sort: (s) => s.id, cell: (s) => <div><Mono className="text-ink-950">{s.id}</Mono>{s.titulo && <p className="max-w-[260px] truncate text-xs text-ink-500">{s.titulo}</p>}</div> },
              { id: 'clave', header: 'Clave', cell: (s) => <span className="text-ink-600">{nombreClave(datos.clavesVirtuales, s.claveId)}</span> },
              { id: 'agentes', header: 'Agentes', cell: (s) => <span className="block max-w-[200px] truncate text-xs text-ink-500">{s.agentes.join(', ')}</span> },
              { id: 'llamadas', header: 'Llamadas', align: 'right', sort: (s) => s.llamadas, cell: (s) => s.llamadas },
              { id: 'coste', header: 'Coste', align: 'right', sort: (s) => s.coste, cell: (s) => <span className="text-ink-950">{euros(s.coste)}</span> },
              { id: 'estado', header: 'Estado', cell: (s) => <Badge tone={ESTADO_SESION[s.estado]}>{NOMBRE_SESION[s.estado] || s.estado}</Badge> },
              { id: 'inicio', header: 'Inicio', align: 'right', sort: (s) => s.inicio, cell: (s) => <span className="text-ink-500" title={fechaHora(s.inicio)}>{haceCuanto(s.inicio)}</span> },
              { id: 'ir', header: '', align: 'right', cell: (s) => (s.grafo ? <Link to={`/app/contexto/${s.id}`} onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-ink-900 hover:underline">Ver grafo</Link> : <span className="text-xs text-ink-400">Eventos</span>) },
            ]} />
        </>
      )}
    </>
  )
}
