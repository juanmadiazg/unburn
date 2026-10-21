import { useState } from 'react'
import { Download, Send } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { SERIES, TIPOS_INCIDENTE } from '../../lib/dominio'
import { decimal, euros, mesLargo, numero, rangoEuros } from '../../lib/format'
import { Badge, Button, Card, CardHeader, Field, Input, Modal, PageHeader, Select, Stat } from '../../components/ui'
import { BarrasMensuales, BarrasSimples, Leyenda } from '../../components/charts'

const SERIES_INGRESOS = [
  { key: 'pro', nombre: 'Suscripciones Pro', color: SERIES[0] },
  { key: 'excedentes', nombre: 'Excedentes', color: SERIES[1] },
  { key: 'enterprise', nombre: 'Contratos Enterprise', color: SERIES[2] },
]

/** Margen de cada plan (OF-18): ingresos del plan menos los costes propios que se le atribuyen */
export function margenPorPlan(inf) {
  const c = inf.costesPropios
  const pro = inf.ingresosDesglose.pro + inf.ingresosDesglose.excedentes - (c.infraestructura - c.planGratuito) * 0.55 - c.plataformas * 0.6 - c.comisionesSocios
  const enterprise = inf.ingresosDesglose.enterprise - (c.infraestructura - c.planGratuito) * 0.45 - c.plataformas * 0.4
  return { gratis: -c.planGratuito, pro, enterprise }
}

export default function Informe() {
  const { datos, mutar, empleado, toast } = useApp()
  const finanzas = empleado.departamento === 'Finanzas'
  const informes = datos.informes
  const [mes, setMes] = useState(informes[1].mes)
  const [precios, setPrecios] = useState(false)
  const inf = informes.find((i) => i.mes === mes)
  const costes = Object.values(inf.costesPropios).reduce((a, b) => a + b, 0)
  const margen = inf.ingresos - costes
  const totalClientes = Object.values(inf.clientesPorPlan).reduce((a, b) => a + b, 0)
  const serie = [...informes].reverse().map((i) => ({ etiqueta: mesLargo(i.mes).slice(0, 3) + (i.estado === 'en curso' ? '*' : ''), ...i.ingresosDesglose }))
  const anterior = informes[informes.findIndex((i) => i.mes === mes) + 1]
  const delta = (a, b) => (b ? `${a >= b ? '+' : ''}${Math.round(((a - b) / b) * 100)} % vs. mes anterior` : '')

  const presentar = () => {
    mutar('informes', (l) => l.map((i) => (i.mes === mes ? { ...i, estado: 'presentado', nota: 'Presentado a Dirección hoy.' } : i)))
    toast('Informe presentado a Dirección', 'exito', `${mesLargo(mes)} · enviado a Fundadores y Dirección`)
  }

  return (
    <>
      <PageHeader title="Informe mensual" refs={['BP-14', 'IC-31', 'IF-30', 'IF-31']}
        description="Ingresos, clientes por plan, peticiones, incidentes, tickets y costes propios. Lo prepara Finanzas para Dirección, que decide precios, prioridades y gasto."
        actions={<>
          <Select className="w-44" value={mes} onChange={(e) => setMes(e.target.value)}>{informes.map((i) => <option key={i.mes} value={i.mes}>{mesLargo(i.mes)}</option>)}</Select>
          <Button icon={Download} onClick={() => toast(`Informe-${mes}.pdf generado`, 'info')}>PDF</Button>
          {inf.estado === 'en curso'
            ? <Button variant="brand" disabled>Se cierra el 1 nov</Button>
            : inf.estado !== 'presentado' ? <Button variant="brand" icon={Send} disabled={!finanzas} onClick={presentar}>Presentar a Dirección</Button>
              : <Button variant="brand" disabled={!finanzas} title={!finanzas ? 'Solo Finanzas actualiza los planes' : undefined} onClick={() => setPrecios(true)}>Actualizar precios de los planes</Button>}
        </>} />

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-600">
        <Badge tone={inf.estado === 'presentado' ? 'green' : inf.estado === 'en curso' ? 'amber' : 'blue'}>{inf.estado === 'presentado' ? 'Presentado' : inf.estado === 'en curso' ? 'Mes en curso' : 'Borrador'}</Badge>
        <span>{inf.nota}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Ingresos" value={euros(inf.ingresos, 0)} sub={delta(inf.ingresos, anterior?.ingresos)} />
        <Stat label="Margen tras costes propios" value={euros(margen, 0)} sub={`${Math.round((margen / inf.ingresos) * 100)} % de los ingresos`} />
        <Stat label="Clientes" value={numero(totalClientes)} sub={`${inf.clientesPorPlan.pro} Pro · ${inf.clientesPorPlan.enterprise} Enterprise · conversión a Pro ${decimal((inf.clientesPorPlan.pro / totalClientes) * 100)} %`} />
        <Stat label="Peticiones facturables" value={`${decimal(inf.peticionesFacturables / 1e6)} M`} sub={`Disponibilidad ${decimal(inf.disponibilidad)} % (meta 99,9 %)`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Ingresos por mes" subtitle="* mes en curso" actions={<Leyenda items={SERIES_INGRESOS.map((s) => ({ nombre: s.nombre, color: s.color }))} />} />
          <div className="px-2 py-3"><BarrasMensuales datos={serie} dataKey={SERIES_INGRESOS} formato={(v) => euros(v, 0)} alto={230} /></div>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Clientes por plan" />
          <table className="w-full text-sm">
            <thead><tr className="border-b border-ink-150 bg-ink-50/60 text-xs text-ink-500"><th className="h-8 px-4 text-left font-medium">Plan</th><th className="px-4 text-right font-medium">Clientes</th><th className="px-4 text-right font-medium">Altas</th><th className="px-4 text-right font-medium">Bajas</th><th className="px-4 text-right font-medium">Margen</th></tr></thead>
            <tbody className="divide-y divide-ink-100">
              {['gratis', 'pro', 'enterprise'].map((p) => (
                <tr key={p}><td className="h-10 px-4 capitalize text-ink-900">{p}</td><td className="px-4 text-right">{numero(inf.clientesPorPlan[p])}</td><td className="px-4 text-right text-ink-600">+{inf.altas[p]}</td><td className="px-4 text-right text-ink-600">−{inf.bajas[p]}</td><td className={`px-4 text-right tabular-nums ${margenPorPlan(inf)[p] < 0 ? 'text-red-600' : 'text-ink-950'}`}>{euros(margenPorPlan(inf)[p], 0)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-ink-150 px-4 py-3 text-xs text-ink-600" data-cambios-plan>
            <p className="font-medium text-ink-950">Cambios de plan</p>
            <p className="mt-1">Gratis → Pro: <span className="tabular-nums font-medium text-ink-950">{inf.cambiosPlan.gratisAPro}</span> · Pro → Gratis: <span className="tabular-nums">{inf.cambiosPlan.proAGratis}</span> · Pro → Enterprise: <span className="tabular-nums">{inf.cambiosPlan.proAEnterprise}</span></p>
            <p className="mt-1 text-ink-500">Margen del plan Gratis = su coste: es la inversión en captación. Gasto evitado estimado a los clientes: {rangoEuros(inf.ahorroEstimadoClientes)}</p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Incidentes de clientes" subtitle="Detectados por el Gateway (BP-09)" />
          <div className="px-4 py-4"><BarrasSimples datos={Object.entries(inf.incidentes).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ nombre: TIPOS_INCIDENTE[k].nombre, valor: v }))} formato={numero} /></div>
        </Card>
        <Card>
          <CardHeader title="Tickets de soporte" />
          <dl className="divide-y divide-ink-100">
            {[['Cerrados', numero(inf.tickets.cerrados)], ['Abiertos al cierre', numero(inf.tickets.abiertos)], ['Escalados a Ingeniería', numero(inf.tickets.escalados)], ['Primera respuesta (media)', `${decimal(inf.tickets.primeraRespuestaHoras)} h`]].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-2.5 text-sm"><dt className="text-ink-600">{k}</dt><dd className="tabular-nums text-ink-950">{v}</dd></div>
            ))}
          </dl>
        </Card>
        <Card>
          <CardHeader title="Costes propios" />
          <dl className="divide-y divide-ink-100">
            {[['Infraestructura (cloud)', inf.costesPropios.infraestructura], ['Coste del plan Gratis', inf.costesPropios.planGratuito], ['Plataformas de pagos y desarrollo', inf.costesPropios.plataformas], ['Comisiones de socios', inf.costesPropios.comisionesSocios]].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-2.5 text-sm"><dt className="text-ink-600">{k}</dt><dd className="tabular-nums text-ink-950">{euros(v, 0)}</dd></div>
            ))}
            <div className="flex justify-between px-4 py-2.5 text-sm font-medium"><dt className="text-ink-950">Total</dt><dd className="tabular-nums text-ink-950">{euros(costes, 0)}</dd></div>
          </dl>
          <p className="border-t border-ink-150 px-4 py-3 text-xs text-ink-500">Comisiones a 0 €: los socios son propuestas, sin acuerdos firmados.</p>
        </Card>
      </div>

      {precios && <PreciosModal planes={datos.planes} onClose={() => setPrecios(false)} onGuardar={(nuevos) => {
        mutar('planes', (l) => l.map((p) => (p.id === 'pro' ? { ...p, precioMensual: nuevos.pro, precioTexto: `${nuevos.pro} € / mes`, excedente: { ...p.excedente, precioBloque: nuevos.bloque } } : p)))
        setPrecios(false)
        toast('Planes actualizados', 'exito', 'Se aplicarán a las nuevas suscripciones y, con 30 días de aviso, a las actuales')
      }} />}
    </>
  )
}

function PreciosModal({ planes, onClose, onGuardar }) {
  const pro = planes.find((p) => p.id === 'pro')
  const [f, setF] = useState({ pro: pro.precioMensual, bloque: pro.excedente.precioBloque })
  return (
    <Modal open onClose={onClose} title="Actualizar precios de los planes" description="Solo tras una decisión de Dirección (BP-14)."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => onGuardar({ pro: Number(f.pro), bloque: Number(f.bloque) })}>Publicar precios</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Plan Pro (€/mes)"><Input type="number" value={f.pro} onChange={(e) => setF({ ...f, pro: e.target.value })} /></Field>
        <Field label="Bloque de excedente (€ por 50.000 peticiones)"><Input type="number" value={f.bloque} onChange={(e) => setF({ ...f, bloque: e.target.value })} /></Field>
      </div>
    </Modal>
  )
}
