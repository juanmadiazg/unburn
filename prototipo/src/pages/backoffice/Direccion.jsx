import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { SERIES, TIPOS_INCIDENTE } from '../../lib/dominio'
import { compacto, decimal, euros, mesCorto, mesLargo, numero, rangoEuros } from '../../lib/format'
import { Ayuda, Badge, Button, Card, CardHeader, Cifra, Mono, PageHeader, Section, Stat, Table, Td } from '../../components/ui'
import { margenPorPlan } from './Informe'
import { BarrasMensuales, Leyenda } from '../../components/charts'

/** Cuadro de mando de Dirección (BP-14, 4.2 · 3.1): consulta el informe mensual y decide precios y prioridades */
export default function Direccion() {
  const { datos, aplicar, toast, empleado } = useApp()
  const pendientes = datos.versiones.filter((v) => v.estado === 'en pruebas' && !v.aprobadaPor)
  const informes = datos.informes
  const actual = informes[0]
  const anterior = informes[1]
  const pct = (a, b) => (b ? `${a >= b ? '+' : ''}${Math.round(((a - b) / b) * 100)} % vs. ${mesCorto(anterior.mes)}` : '')
  const total = (i) => Object.values(i.clientesPorPlan).reduce((a, b) => a + b, 0)
  const costes = (i) => Object.values(i.costesPropios).reduce((a, b) => a + b, 0)
  const conversion = (i) => (i.clientesPorPlan.pro / total(i)) * 100
  const peticionesVivas = datos.organizaciones.reduce((a, o) => a + o.suscripcion.mesActual.peticionesFacturables, 0)
  const serie = [...informes].reverse().map((i) => ({ etiqueta: mesCorto(i.mes) + (i.estado === 'en curso' ? '*' : ''), pro: i.ingresosDesglose.pro, excedentes: i.ingresosDesglose.excedentes, enterprise: i.ingresosDesglose.enterprise }))
  const pipeline = datos.oportunidades.filter((o) => o.etapa !== 'firmado')
  const probabilidad = { prospeccion: 0.1, demo: 0.25, revision_seguridad: 0.45, negociacion: 0.7 }
  const ponderado = pipeline.reduce((a, o) => a + o.importeAnual * (probabilidad[o.etapa] || 0), 0)
  const cercaTope = datos.clientes.filter((c) => c.plan === 'pro' && c.cuota && c.peticionesMes / c.cuota >= 0.8)
  const tipoTop = Object.entries(actual.incidentes).sort((a, b) => b[1] - a[1])[0]
  const p = datos.plataforma

  const decisiones = [
    { titulo: `${cercaTope.length} clientes Pro por encima del 80 % de su cuota`, texto: `${cercaTope.map((c) => c.nombre).join(', ')}. Son candidatos a hablar de Enterprise o a revisar el precio del excedente.`, enlace: '/bo/clientes', accion: 'Ver clientes' },
    { titulo: `El plan Gratis cuesta el ${decimal((actual.costesPropios.planGratuito / actual.ingresos) * 100)} % de los ingresos`, texto: `${euros(actual.costesPropios.planGratuito, 0)} este mes para ${numero(actual.clientesPorPlan.gratis)} cuentas. Este mes ${actual.cambiosPlan.gratisAPro} cuentas han pasado de Gratis a Pro y el margen de Pro es de ${euros(margenPorPlan(actual).pro, 0)}: mantener la cuota de 10.000 peticiones sigue siendo rentable.`, enlace: '/bo/informe', accion: 'Ver informe' },
    { titulo: `«${TIPOS_INCIDENTE[tipoTop[0]].nombre}» es el incidente más frecuente`, texto: `${numero(tipoTop[1])} este mes. Priorizar en el roadmap las recomendaciones de presupuesto y los avisos tempranos reduce cortes a los clientes.`, enlace: '/bo/informe', accion: 'Ver incidentes' },
    { titulo: `Pipeline Enterprise ponderado: ${euros(ponderado, 0)} al año`, texto: `${pipeline.length} oportunidades abiertas; la más avanzada es ${pipeline.find((o) => o.etapa === 'negociacion')?.empresa || '—'}.`, enlace: '/bo/enterprise', accion: 'Ver contratos' },
    { titulo: 'Ningún acuerdo con socios firmado', texto: 'n8n y AWS Marketplace están en conversación. Las comisiones siguen a 0 €; el crecimiento viene del autoservicio.', enlace: '/bo/socios', accion: 'Ver socios' },
  ]

  return (
    <>
      <PageHeader title="Cuadro de mando" refs={['BP-14', 'IC-31', '4.2 · 3.1', '12.5']}
        description={`Lo que Dirección necesita para decidir precios, prioridades y gasto. Datos de ${mesLargo(actual.mes).toLowerCase()} (mes en curso) y de los meses cerrados.`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Ingresos del mes" value={euros(actual.ingresos, 0)} sub={pct(actual.ingresos, anterior.ingresos)} href="/bo/informe" />
        <Stat label="Margen tras costes propios" value={euros(actual.ingresos - costes(actual), 0)} sub={`${Math.round(((actual.ingresos - costes(actual)) / actual.ingresos) * 100)} % de los ingresos`} />
        <Stat label="Clientes" value={numero(total(actual))} sub={`${actual.clientesPorPlan.pro} Pro · ${actual.clientesPorPlan.enterprise} Enterprise · conversión ${decimal(conversion(actual))} %`} />
        <Stat label="Peticiones facturables (en directo)" value={<Cifra valor={peticionesVivas + actual.peticionesFacturables} formato={compacto} />} sub="Todas las suscripciones, este mes" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Ingresos por mes" subtitle="* mes en curso" actions={<Leyenda items={[['Pro', SERIES[0]], ['Excedentes', SERIES[1]], ['Enterprise', SERIES[2]]].map(([nombre, color]) => ({ nombre, color }))} />} />
          <div className="px-2 py-3"><BarrasMensuales datos={serie} dataKey={[{ key: 'pro', nombre: 'Pro', color: SERIES[0] }, { key: 'excedentes', nombre: 'Excedentes', color: SERIES[1] }, { key: 'enterprise', nombre: 'Enterprise', color: SERIES[2] }]} formato={(v) => euros(v, 0)} alto={220} /></div>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Servicio" subtitle="Objetivos de OG-07" />
          <dl className="divide-y divide-ink-100">
            {[['Disponibilidad (30 días)', `${decimal(p.disponibilidad30d)} %`, `objetivo ${decimal(p.metaDisponibilidad)} %`, p.disponibilidad30d >= p.metaDisponibilidad],
              ['Latencia añadida (p95)', `${p.latenciaAnadidaP95} ms`, `objetivo < ${p.metaLatencia} ms`, p.latenciaAnadidaP95 < p.metaLatencia],
              ['Incidencias técnicas abiertas', datos.incidenciasTecnicas.filter((i) => i.estado !== 'resuelta').length, 'BP-17', true],
              ['Primera respuesta a tickets', `${decimal(actual.tickets.primeraRespuestaHoras)} h`, `${actual.tickets.escalados} escalados`, actual.tickets.primeraRespuestaHoras < 4]].map(([k, v, s, ok]) => (
              <div key={k} className="flex items-center justify-between px-4 py-3">
                <dt className="text-sm text-ink-600">{k}<span className="block text-xs text-ink-400">{s}</span></dt>
                <dd className="flex items-center gap-2 text-sm font-medium tabular-nums text-ink-950"><span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {pendientes.length > 0 && (
        <Section title="Versiones pendientes de aprobar" description="Dirección aprueba cada publicación después de la revisión de Legal (BP-16, 8.3)" className="mt-8">
          <Card className="divide-y divide-ink-100">
            {pendientes.map((v) => (
              <div key={v.numero} className="flex flex-wrap items-center gap-4 px-4 py-3" data-version-pendiente>
                <div className="min-w-0 flex-1"><p className="text-sm text-ink-950"><Mono>{v.numero}</Mono> · {v.cambios}</p><p className="text-xs text-ink-500">{v.pruebas} · {v.firma} · {v.sbom}</p></div>
                {v.revisionLegalHecha ? <Badge tone="green">Revisión legal hecha</Badge> : <Badge tone="amber">Falta la revisión de Legal</Badge>}
                <Button size="sm" variant="primary" disabled={!v.revisionLegalHecha} title={!v.revisionLegalHecha ? 'Legal debe revisarla antes' : undefined}
                  onClick={() => { aplicar((d) => ({ ...d, versiones: d.versiones.map((x) => (x.numero === v.numero ? { ...x, aprobadaPor: `${empleado.nombre} ${empleado.apellidos.split(' ')[0]}` } : x)) })); toast(`Publicación de ${v.numero} aprobada`, 'exito', 'Ingeniería ya puede iniciar el despliegue gradual') }}>Aprobar publicación</Button>
              </div>
            ))}
          </Card>
        </Section>
      )}

      <Section title="Para decidir" description="Lecturas del informe mensual que piden una decisión de Dirección" className="mt-8">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {decisiones.map((d) => (
            <Card key={d.titulo} className="flex flex-col p-4">
              <p className="text-sm font-semibold text-ink-950">{d.titulo}</p>
              <p className="mt-1 flex-1 text-sm text-ink-600">{d.texto}</p>
              <Link to={d.enlace} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink-900 hover:underline">{d.accion} <ArrowRight className="h-3 w-3" /></Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Indicadores de producto por mes" description="Medias de todos los clientes (4.2 · 3.1): miden si Unburn reduce el gasto innecesario">
        <Card>
          <Table head={['Indicador', ...informes.map((i) => ({ label: mesCorto(i.mes) + (i.estado === 'en curso' ? '*' : ''), className: 'text-right' }))]}>
            {[
              ['Coste medio por sesión resuelta', (i) => euros(i.kpis.costeMedioSesion), 'Coste medio de las tareas que terminan sin bloqueos'],
              ['Tasa de peticiones bloqueadas por seguridad', (i) => `${decimal(i.kpis.tasaBloqueosSeguridad)} %`, 'Escudo de herramientas y delegaciones'],
              ['Latencia añadida (p95)', (i) => `${i.kpis.latenciaP95} ms`, 'Objetivo menor de 50 ms'],
              ['Ahorro por modelo sustituto', (i) => `${decimal(i.kpis.ahorroModeloSustituto)} %`, 'Diferencia de coste en las peticiones cambiadas a un modelo económico'],
              ['ROI medio de los clientes', (i) => `${decimal(i.kpis.roiMedioClientes)}×`, 'Gasto evitado entre el coste de la suscripción'],
              ['Gasto evitado a los clientes', (i) => rangoEuros(i.ahorroEstimadoClientes), 'Suma de los rangos estimados (DEC-04)'],
            ].map(([n, f, ayuda]) => (
              <tr key={n}><Td className="text-ink-800"><span className="flex items-center gap-1.5">{n} <Ayuda texto={ayuda} /></span></Td>{informes.map((i) => <Td key={i.mes} className="text-right tabular-nums text-ink-950">{f(i)}</Td>)}</tr>
            ))}
          </Table>
        </Card>
      </Section>
    </>
  )
}
