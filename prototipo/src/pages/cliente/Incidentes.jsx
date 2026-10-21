import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AppStore'
import { nombreClave } from '../../lib/hooks'
import { TIPOS_INCIDENTE } from '../../lib/dominio'
import { euros, fechaHora, haceCuanto, rangoEuros } from '../../lib/format'
import { haceDias } from '../../lib/tiempo'
import { Badge, DataTable, Mono, PageHeader, Stat } from '../../components/ui'

export const estadoIncidente = (i) => (i.estado === 'abierto' ? <Badge tone="red">Abierto</Badge> : <Badge tone="gray">Revisado</Badge>)

export default function Incidentes() {
  const { deOrg, datos } = useApp()
  const navigate = useNavigate()
  const incidentes = deOrg('incidentes')
  const claves = deOrg('clavesVirtuales')
  const mes = incidentes.filter((i) => haceDias(i.fecha, 30))
  const conAhorro = mes.filter((i) => i.ahorro)
  const abiertos = incidentes.filter((i) => i.estado === 'abierto')

  return (
    <>
      <PageHeader title="Incidentes" refs={['BP-09', 'OF-05', 'OF-06', 'OF-10', 'IC-20', 'AP-09']}
        description="Bucles, consumos anómalos, presupuestos agotados y herramientas denegadas. Cada incidente explica su causa, lo que costó y, si Unburn lo detuvo, el gasto evitado." />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Abiertos" value={abiertos.length} sub="Pendientes de revisar por un administrador" />
        <Stat label="Coste de los incidentes · 30 días" value={euros(mes.reduce((a, i) => a + i.costeIncidente, 0))} sub={`${mes.length} incidentes en 30 días`} />
        <Stat label="Gasto evitado (estimado) · 30 días" value={rangoEuros({ min: conAhorro.reduce((a, i) => a + i.ahorro.min, 0), max: conAhorro.reduce((a, i) => a + i.ahorro.max, 0) })} sub="Solo cuenta cuando Unburn detiene o frena el gasto" />
      </div>

      <DataTable rows={incidentes} initialSort={{ id: 'fecha', dir: 'desc' }} rowClassName={(i) => Date.now() - new Date(i.fecha).getTime() < 8000 && 'animate-fila-nueva'} onRowClick={(i) => navigate(`/app/incidentes/${i.id}`)}
        search={(i) => `${i.id} ${i.titulo} ${i.agente || ''} ${i.sesionId || ''}`} searchPlaceholder="Buscar por ID, agente o sesión…"
        filters={[
          { id: 'tipo', label: 'Tipo', options: Object.entries(TIPOS_INCIDENTE).map(([id, t]) => ({ id, label: t.nombre })), value: (i) => i.tipo },
          { id: 'estado', label: 'Estado', options: [{ id: 'abierto', label: 'Abierto' }, { id: 'cerrado', label: 'Revisado' }], value: (i) => i.estado },
          { id: 'clave', label: 'Clave', options: claves.filter((k) => incidentes.some((i) => i.claveId === k.id)).map((k) => ({ id: k.id, label: k.nombre })), value: (i) => i.claveId },
        ]}
        empty={{ title: 'Sin incidentes', description: 'Cuando Unburn detecte un bucle, un consumo anómalo, un presupuesto agotado o una herramienta denegada, aparecerá aquí.' }}
        columns={[
          { id: 'inc', header: 'Incidente', sort: (i) => i.titulo, cell: (i) => <div className="min-w-[240px]"><p className="text-ink-950">{i.titulo}</p><Mono className="text-ink-400">{i.id}</Mono>{i.ocurrencias > 1 && <span className="ml-2 text-xs text-ink-400">· {i.ocurrencias} avisos agrupados</span>}</div> },
          { id: 'tipo', header: 'Tipo', cell: (i) => <Badge tone={TIPOS_INCIDENTE[i.tipo].tono}>{TIPOS_INCIDENTE[i.tipo].nombre}</Badge> },
          { id: 'clave', header: 'Clave', cell: (i) => <span className="text-ink-600">{nombreClave(datos.clavesVirtuales, i.claveId)}</span> },
          { id: 'coste', header: 'Coste', align: 'right', sort: (i) => i.costeIncidente, cell: (i) => euros(i.costeIncidente) },
          { id: 'ahorro', header: 'Evitado / previsto', align: 'right', sort: (i) => i.ahorro?.max || 0, cell: (i) => (i.ahorro ? <span className="text-emerald-700">{rangoEuros(i.ahorro)}</span> : i.costePrevisto ? <span className="text-ink-500">{euros(i.costePrevisto.valor, 0)} previsto</span> : <span className="text-ink-300">—</span>) },
          { id: 'estado', header: 'Estado', cell: estadoIncidente },
          { id: 'fecha', header: 'Detectado', align: 'right', sort: (i) => i.fecha, cell: (i) => <span className="text-ink-500" title={fechaHora(i.fecha)}>{haceCuanto(i.fecha)}</span> },
        ]} />
    </>
  )
}
