import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../../store/AppStore'
import { ESTADOS_TICKET } from '../../lib/dominio'
import { euros, fecha, haceCuanto, numero, porcentaje } from '../../lib/format'
import { Badge, Button, Callout, DataTable, Drawer, KV, Mono, PageHeader, PlanBadge, Progress, Stat } from '../../components/ui'

const ESTADO_SUS = { activa: 'green', 'cuota agotada': 'amber', 'tope de excedente alcanzado': 'amber', 'de baja': 'gray' }
const COBRO = { pagado: ['green', 'Pagado'], fallido: ['red', 'Fallido'], pendiente: ['amber', 'Pendiente'], '—': ['gray', 'Sin cobro'] }

export default function Clientes() {
  const { datos, mutar, toast, empleado } = useApp()
  const [params, setParams] = useSearchParams()
  const [selId, setSelId] = useState(null)
  const clientes = datos.clientes
  const sel = clientes.find((c) => c.id === selId)
  const esFinanzas = empleado.departamento === 'Finanzas'

  useEffect(() => {
    if (params.get('cliente')) setSelId(params.get('cliente'))
    if (params.toString()) setParams({}, { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activos = clientes.filter((c) => c.estado !== 'de baja')
  const mrr = activos.reduce((a, c) => a + c.ingresoMes, 0)
  const fallidos = clientes.filter((c) => c.cobro === 'fallido')
  const porPlan = (p) => activos.filter((c) => c.plan === p).length

  const reintentar = (c) => {
    mutar('clientes', (l) => l.map((x) => (x.id === c.id ? { ...x, cobro: 'pagado' } : x)))
    toast('Cobro reintentado con éxito', 'exito', `${c.nombre} · ${euros(c.ingresoMes)} · confirmado por la plataforma de pagos`)
  }

  return (
    <>
      <PageHeader title="Clientes" refs={['AP-12', 'IC-01', 'IC-04', 'IC-05', 'BP-03', 'BP-12']}
        description="Organizaciones con su plan, el estado de la suscripción y del cobro. Muestra solo datos de negocio: nunca claves reales ni el texto de las peticiones." />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Clientes activos (muestra)" value={activos.length} sub={`${porPlan('gratis')} Gratis · ${porPlan('pro')} Pro · ${porPlan('enterprise')} Enterprise`} />
        <Stat label="Ingresos recurrentes del mes" value={euros(mrr, 0)} sub="Suscripciones, excedentes y contratos" />
        <Stat label="Cobros fallidos" value={fallidos.length} sub={fallidos.length ? 'Los gestiona Finanzas' : 'Ninguno pendiente'} />
        <Stat label="Tickets abiertos" value={datos.tickets.filter((t) => t.estado !== 'cerrado').length} href="/bo/tickets" sub="Incluye escalados a Ingeniería" />
      </div>

      <DataTable rows={clientes} pageSize={10} initialSort={{ id: 'ingreso', dir: 'desc' }} onRowClick={(c) => setSelId(c.id)}
        search={(c) => `${c.nombre} ${c.id} ${c.socio || ''}`} searchPlaceholder="Buscar cliente…"
        filters={[
          { id: 'plan', label: 'Plan', options: [{ id: 'gratis', label: 'Gratis' }, { id: 'pro', label: 'Pro' }, { id: 'enterprise', label: 'Enterprise' }], value: (c) => c.plan },
          { id: 'estado', label: 'Estado', options: Object.keys(ESTADO_SUS).map((e) => ({ id: e, label: e[0].toUpperCase() + e.slice(1) })), value: (c) => c.estado },
          { id: 'cobro', label: 'Cobro', options: [{ id: 'pagado', label: 'Pagado' }, { id: 'fallido', label: 'Fallido' }, { id: 'pendiente', label: 'Pendiente' }], value: (c) => c.cobro },
        ]}
        columns={[
          { id: 'nombre', header: 'Cliente', sort: (c) => c.nombre, cell: (c) => <div><p className="text-ink-950">{c.nombre}</p><Mono className="text-ink-400">{c.id}</Mono></div> },
          { id: 'plan', header: 'Plan', cell: (c) => <PlanBadge plan={c.plan} /> },
          { id: 'estado', header: 'Suscripción', cell: (c) => <Badge tone={ESTADO_SUS[c.estado]}>{c.estado[0].toUpperCase() + c.estado.slice(1)}</Badge> },
          { id: 'uso', header: 'Uso de la cuota', sort: (c) => (c.cuota ? c.peticionesMes / c.cuota : 0), cell: (c) => c.cuota ? (
            <div className="w-36"><div className="mb-1 flex justify-between text-xs tabular-nums text-ink-500"><span>{numero(c.peticionesMes)}</span><span>{porcentaje(c.peticionesMes, c.cuota)} %</span></div><Progress value={c.peticionesMes} max={c.cuota} tone={c.peticionesMes >= c.cuota ? 'red' : c.peticionesMes / c.cuota >= 0.8 ? 'amber' : 'navy'} /></div>
          ) : <span className="text-xs text-ink-400">{c.modalidad}</span> },
          { id: 'ingreso', header: 'Ingreso / mes', align: 'right', sort: (c) => c.ingresoMes, cell: (c) => euros(c.ingresoMes, 0) },
          { id: 'cobro', header: 'Cobro', cell: (c) => <Badge tone={COBRO[c.cobro][0]}>{COBRO[c.cobro][1]}</Badge> },
          { id: 'alta', header: 'Alta', align: 'right', sort: (c) => c.alta, cell: (c) => <span className="text-ink-500">{fecha(c.alta)}</span> },
        ]} />

      <Drawer open={!!sel} onClose={() => setSelId(null)} title={sel?.nombre} subtitle={sel && <Mono>{sel.id}</Mono>}
        footer={sel?.cobro === 'fallido' && <Button variant="primary" disabled={!esFinanzas} title={!esFinanzas ? 'Solo Finanzas gestiona los cobros fallidos' : undefined} onClick={() => reintentar(sel)}>Reintentar cobro</Button>}>
        {sel && (
          <div className="space-y-6">
            {sel.cobro === 'fallido' && <Callout tone="danger" title="El último cobro ha fallado">La plataforma de pagos rechazó el cargo del 1 de octubre. {esFinanzas ? 'Puedes reintentarlo o contactar con el cliente.' : 'Lo gestiona Finanzas.'}</Callout>}
            <KV items={[
              ['Plan', <PlanBadge key="p" plan={sel.plan} />],
              ['Suscripción', <Badge key="s" tone={ESTADO_SUS[sel.estado]}>{sel.estado}</Badge>],
              ['Alta', fecha(sel.alta)],
              sel.baja && ['Baja', fecha(sel.baja)],
              ['País', sel.pais],
              ['Socio que lo trajo', sel.socio || '—'],
              ['Peticiones facturables (mes)', sel.peticionesMes != null ? numero(sel.peticionesMes) : 'Despliegue privado: no se factura por petición'],
              ['Peticiones incluidas', sel.cuota ? numero(sel.cuota) : '—'],
              ['Ingreso del mes', euros(sel.ingresoMes)],
              ['Cobro', COBRO[sel.cobro][1]],
              sel.contrato && ['Contrato Enterprise', <Mono key="c">{sel.contrato}</Mono>],
              sel.modalidad && ['Modalidad', sel.modalidad],
            ]} />
            <div>
              <p className="mb-2 text-sm font-medium text-ink-950">Tickets</p>
              {datos.tickets.filter((t) => t.orgId === sel.id).length === 0 ? <p className="text-sm text-ink-500">Sin tickets.</p> : (
                <ul className="divide-y divide-ink-100 rounded-lg border border-ink-200">
                  {datos.tickets.filter((t) => t.orgId === sel.id).map((t) => (
                    <li key={t.id}><Link to={`/bo/tickets/${t.id}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-ink-50">
                      <Mono className="text-ink-400">{t.id}</Mono><span className="flex-1 truncate text-sm text-ink-900">{t.asunto}</span><Badge tone={ESTADOS_TICKET[t.estado].tono}>{ESTADOS_TICKET[t.estado].nombre}</Badge><span className="text-xs text-ink-400">{haceCuanto(t.fecha)}</span>
                    </Link></li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-xs text-ink-400">La consola no muestra claves reales, claves virtuales completas ni el contenido de las peticiones (IC-25).</p>
          </div>
        )}
      </Drawer>
    </>
  )
}
