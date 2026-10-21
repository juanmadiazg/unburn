import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { useGasto } from '../../lib/hooks'
import { TIPOS_INCIDENTE } from '../../lib/dominio'
import { euros, haceCuanto, numero, porcentaje, rangoEuros } from '../../lib/format'
import { Badge, Callout, Card, CardHeader, Cifra, CopyButton, Mono, PageHeader, Progress, Section, Segmented, Stat, UsageBar } from '../../components/ui'
import Kpis from '../../components/Kpis'
import { nombreMes, primerDiaMesSiguiente } from '../../lib/tiempo'
import { GastoTotalChart, IntervalosChart } from '../../components/charts'

export default function Resumen() {
  const { usuario, org, plan, deOrg } = useApp()
  const g = useGasto()
  const [vista, setVista] = useState('30d')
  const sus = org.suscripcion
  const usoCuota = porcentaje(sus.mesActual.peticionesFacturables, plan.peticionesIncluidas)
  const presupuestos = deOrg('presupuestos')
  const preDia = presupuestos.find((p) => p.ambito === 'organizacion' && p.periodo === 'diario')
  const preMes = presupuestos.find((p) => p.ambito === 'organizacion' && p.periodo === 'mensual')
  const abiertos = deOrg('incidentes').filter((i) => i.estado === 'abierto').sort((a, b) => b.fecha.localeCompare(a.fecha))
  const cercanos = presupuestos.filter((p) => p.gastado >= p.limiteBlando).sort((a, b) => b.gastado / b.limiteDuro - a.gastado / a.limiteDuro)
  const nombre = (id) => g.claves.find((k) => k.id === id)?.nombre
  const variacion = g.ayer ? ((g.gastoHoy - g.ayer) / g.ayer) * 100 : 0
  const mes = nombreMes()
  const h = new Date().getHours()
  const saludo = h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'
  const corte = primerDiaMesSiguiente().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
  const bloqueadaCuota = sus.estado === 'cuota agotada' || sus.estado === 'tope de excedente alcanzado'

  return (
    <>
      <PageHeader title="Resumen" description={`${saludo}, ${usuario.nombre}. El gasto se actualiza con cada petición; los agregados, cada 15 minutos.`} refs={['AP-01', 'BP-10', 'OF-12', '4.2 · 3.2']} />

      {bloqueadaCuota && (
        <Callout tone="danger" className="mb-4" title={sus.estado === 'cuota agotada' ? 'Servicio cortado: cuota del plan Gratis agotada' : 'Tope de excedente alcanzado'}
          actions={<Link to="/app/suscripcion" className="text-sm font-medium text-ink-950 hover:underline">{plan.id === 'gratis' ? 'Pasar a Pro' : 'Subir el tope'}</Link>}>
          Las peticiones se rechazan con 402 sin llegar al proveedor y no cuentan en la cuota (DEC-03, DEC-06).
        </Callout>
      )}

      {usoCuota >= 80 && !bloqueadaCuota && (
        <Callout tone={usoCuota >= 100 ? 'danger' : 'warn'} className="mb-6" title={`Has usado el ${usoCuota} % de las peticiones incluidas en el plan ${plan.nombre}`}
          actions={<Link to="/app/suscripcion" className="text-sm font-medium text-ink-950 hover:underline">Ver suscripción</Link>}>
          {numero(sus.mesActual.peticionesFacturables)} de {numero(plan.peticionesIncluidas)} este mes.{' '}
          {plan.id === 'gratis' ? `Al llegar al 100 % el servicio se corta hasta el ${corte} o hasta que cambies de plan.` : `Después se cobra excedente, como máximo ${euros(sus.topeExcedente, 0)} (tu tope).`}
        </Callout>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Gasto de hoy" value={<Cifra valor={g.gastoHoy} formato={(v) => euros(v)} />}
          delta={<span className="text-ink-700">{variacion >= 0 ? '+' : ''}{Math.round(variacion)} % vs. ayer · </span>}
          sub={preDia ? `límite ${euros(preDia.limiteDuro, 0)}` : 'sin límite diario'}>
          {preDia && <UsageBar className="mt-3" gastado={preDia.gastado} reservado={preDia.reservado} blando={preDia.limiteBlando} duro={preDia.limiteDuro} />}
        </Stat>
        <Stat label={`Gasto de ${mes}`} value={<Cifra valor={g.gastoMes} formato={(v) => euros(v)} />} sub={preMes ? <span data-prevision>Previsión al cierre: <span className={g.previsionMes > preMes.limiteDuro ? 'font-medium text-red-600' : g.previsionMes > preMes.limiteBlando ? 'font-medium text-amber-700' : 'text-ink-700'}>{euros(g.previsionMes, 0)}</span> · límite {euros(preMes.limiteDuro, 0)}</span> : `Previsión al cierre: ${euros(g.previsionMes, 0)}`}>
          {preMes && <UsageBar className="mt-3" gastado={preMes.gastado} reservado={preMes.reservado} blando={preMes.limiteBlando} duro={preMes.limiteDuro} />}
        </Stat>
        <Stat label="Gasto evitado (estimado)" value={g.ahorro.max ? rangoEuros(g.ahorro) : '0 €'} href="/app/incidentes"
          sub={`${g.conAhorro.length} intervenciones en 30 días · rango con hipótesis`} />
        <Stat label="Peticiones facturables" value={<Cifra valor={sus.mesActual.peticionesFacturables} formato={numero} />} sub={`${usoCuota} % de ${numero(plan.peticionesIncluidas)} incluidas`}>
          <Progress className="mt-3" value={usoCuota} tone={usoCuota >= 100 ? 'red' : usoCuota >= 80 ? 'amber' : 'navy'} />
        </Stat>
      </div>

      <Card className="mt-6">
        <CardHeader title={vista === '30d' ? 'Gasto diario' : 'Gasto de hoy'} subtitle={vista === '30d' ? 'Últimos 30 días · todas las claves' : 'Intervalos de 15 minutos'}
          actions={<><Link to="/app/gasto" className="text-xs text-ink-500 hover:text-ink-900">Desglose por clave</Link><Segmented value={vista} onChange={setVista} options={[{ id: '30d', label: '30 días' }, { id: 'hoy', label: 'Hoy' }]} /></>} />
        <div className="px-2 pb-3 pt-3">{vista === '30d' ? <GastoTotalChart datos={g.diario} /> : <IntervalosChart datos={g.intervalos} />}</div>
      </Card>

      <Section title="Indicadores" description="Últimos 7 días · objetivos de 4.2" className="mt-6" actions={<Link to="/app/recomendaciones" className="text-xs text-ink-500 hover:text-ink-900">Ver recomendaciones</Link>}><Kpis compacto /></Section>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Incidentes abiertos" actions={<Link to="/app/incidentes" className="text-xs text-ink-500 hover:text-ink-900">Ver todos</Link>} />
          {abiertos.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-500">No hay incidentes abiertos.</p>}
          <ul className="divide-y divide-ink-100">
            {abiertos.map((i) => (
              <li key={i.id}>
                <Link to={`/app/incidentes/${i.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-50">
                  <Badge tone={TIPOS_INCIDENTE[i.tipo].tono}>{TIPOS_INCIDENTE[i.tipo].nombre}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-900">{i.titulo}</span>
                  <span className="hidden text-sm tabular-nums text-ink-600 sm:inline">{i.ahorro ? `−${rangoEuros(i.ahorro)}` : ''}</span>
                  <span className="w-20 text-right text-xs text-ink-400">{haceCuanto(i.fecha)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Presupuestos al límite" actions={<Link to="/app/presupuestos" className="text-xs text-ink-500 hover:text-ink-900">Ver todos</Link>} />
          <div className="space-y-4 px-4 py-4">
            {cercanos.length === 0 && <p className="py-4 text-center text-sm text-ink-500">Ningún presupuesto ha cruzado su límite blando.</p>}
            {cercanos.map((p) => (
              <div key={p.id}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink-900">{p.ambito === 'organizacion' ? 'Organización' : nombre(p.claveId)} <span className="text-ink-400">· {p.periodo}</span></span>
                  <span className="text-xs tabular-nums text-ink-500">{euros(p.gastado)} / {euros(p.limiteDuro, 0)}</span>
                </div>
                <UsageBar gastado={p.gastado} reservado={p.reservado} blando={p.limiteBlando} duro={p.limiteDuro} />
                {p.gastado >= p.limiteDuro && <p className="mt-1 text-xs text-red-600">Agotado: las peticiones se rechazan con 402</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title={`Gasto por clave · ${mes}`} actions={<Link to="/app/claves" className="text-xs text-ink-500 hover:text-ink-900">Gestionar claves</Link>} />
          <table className="w-full text-sm">
            <tbody className="divide-y divide-ink-100">
              {[...g.claves].filter((k) => k.estado === 'activa').sort((a, b) => b.gastoMes - a.gastoMes).map((k) => (
                <tr key={k.id}>
                  <td className="h-10 px-4"><span className="text-ink-900">{k.nombre}</span></td>
                  <td className="hidden w-1/3 px-4 sm:table-cell"><div className="h-1.5 rounded-full bg-ink-100"><div className="h-full rounded-full bg-[#3b6fb6]" style={{ width: `${(k.gastoMes / g.gastoMes) * 100}%` }} /></div></td>
                  <td className="px-4 text-right text-xs text-ink-500"><Cifra valor={k.gastoHoy} formato={(v) => euros(v)} /> hoy</td>
                  <td className="px-4 text-right font-medium text-ink-950"><Cifra valor={k.gastoMes} formato={(v) => euros(v)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Integracion />
      </div>
    </>
  )
}

function Integracion() {
  const codigo = `client = OpenAI(
  base_url="https://gateway.unburn.eu/v1",
  api_key=os.environ["UNBURN_KEY"],
  default_headers={
    "X-Unburn-Session": task_id,
    "X-Unburn-Agent": "agente-soporte",
  },
)`
  return (
    <Card className="xl:col-span-2">
      <CardHeader title="Conectar una aplicación" subtitle="Solo cambian la dirección y la clave" actions={<CopyButton text={codigo} />} />
      <pre className="overflow-x-auto border-b border-ink-150 bg-ink-50 px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-800">{codigo}</pre>
      <p className="px-4 py-3 text-xs text-ink-500">Sin <Mono>X-Unburn-Session</Mono>, Unburn trabaja petición a petición y no puede detectar ni diagnosticar bucles. <Link to="/app/claves" className="inline-flex items-center gap-0.5 font-medium text-ink-900 hover:underline">Crear una clave <ArrowRight className="h-3 w-3" /></Link></p>
    </Card>
  )
}
