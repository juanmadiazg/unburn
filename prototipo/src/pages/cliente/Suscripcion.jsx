import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, CreditCard, Download, ExternalLink, Loader2 } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { euros, fecha, mesLargo, numero, porcentaje } from '../../lib/format'
import { Badge, Button, Callout, Card, CardHeader, Cifra, DataTable, EmptyState, Field, Input, Modal, PageHeader, PlanBadge, Section, Select, Textarea, cx } from '../../components/ui'
import { estadoCuota } from '../../sim/motor'
import { nombreMes, primerDiaMesSiguiente } from '../../lib/tiempo'
import { BarrasMensuales } from '../../components/charts'

export default function Suscripcion() {
  const { org, plan, datos, deOrg, mutar, toast, esAdmin } = useApp()
  const sus = org.suscripcion
  const facturas = deOrg('facturas')
  const [cambio, setCambio] = useState(null)
  const [tope, setTope] = useState(false)
  const [ventas, setVentas] = useState(false)
  const uso = porcentaje(sus.mesActual.peticionesFacturables, plan.peticionesIncluidas)
  const activas = deOrg('clavesVirtuales').filter((k) => k.estado === 'activa').length
  const ec = estadoCuota(datos, org.id)
  const proxima = primerDiaMesSiguiente().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

  const actualizarOrg = (fn) => mutar('organizaciones', (l) => l.map((o) => (o.id === org.id ? fn(o) : o)))
  const aplicarCambio = (nuevo) => {
    actualizarOrg((o) => ({ ...o, suscripcion: { ...o.suscripcion, plan: nuevo, estado: 'activa', avisos: { cuota80: o.suscripcion.mesActual.peticionesFacturables >= (nuevo === 'pro' ? 400000 : 8000) }, topeExcedente: nuevo === 'pro' ? o.suscripcion.topeExcedente ?? 50 : null, medioPago: o.suscripcion.medioPago || (nuevo === 'pro' ? { marca: 'Mastercard', ultimos4: '8812', caduca: '04/29' } : null) } }))
    setCambio(null)
    toast(nuevo === 'pro' ? 'Ya estás en el plan Pro' : 'Has cambiado al plan Gratis', 'exito', nuevo === 'pro' ? 'Claves ilimitadas, escudo completo y alertas por Slack, Teams o webhook' : 'El cambio se aplica al inicio del próximo periodo')
  }

  const historico = [...sus.historico, sus.mesActual].map((m) => ({ etiqueta: mesLargo(m.mes).slice(0, 3), peticiones: m.peticionesFacturables }))

  return (
    <>
      <PageHeader title="Suscripción y facturas" refs={['BP-03', 'BP-12', 'OF-13', 'IC-03', 'IC-04', 'IC-06', 'AP-11', 'AP-14']}
        description="Unburn cobra una suscripción según las peticiones que reenvía a los proveedores. El gasto en IA lo sigue cobrando cada proveedor." />

      {sus.estado !== 'activa' && (
        <Callout tone="danger" className="mb-6" title={sus.estado === 'cuota agotada' ? 'Cuota agotada: el servicio está cortado' : 'Tope de excedente alcanzado'}>
          {sus.estado === 'cuota agotada' ? `Las peticiones se rechazan con 402 hasta el ${primerDiaMesSiguiente().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} o hasta que pases a Pro.` : 'Las peticiones se rechazan con 402 hasta el mes siguiente. Sube el tope para reanudar el servicio.'} Las rechazadas no cuentan en la cuota.
        </Callout>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title={<span className="flex items-center gap-2">Plan actual <PlanBadge plan={plan.id} /></span>} subtitle={`${plan.precioTexto} · alta el ${fecha(sus.fechaAlta)} · contrato de tratamiento de datos aceptado el ${fecha(sus.contratoTratamientoAceptado)}`}
            actions={<Badge tone={sus.estado === 'activa' ? 'green' : 'red'}>{sus.estado === 'activa' ? 'Activa' : sus.estado[0].toUpperCase() + sus.estado.slice(1)}</Badge>} />
          <div className="grid gap-6 px-4 py-4 md:grid-cols-2">
            <div>
              <div className="flex items-baseline justify-between"><p className="text-xs text-ink-500">Peticiones facturables · {nombreMes()}</p><p className="text-xs tabular-nums text-ink-500">{uso} %</p></div>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] tabular-nums text-ink-950"><Cifra valor={sus.mesActual.peticionesFacturables} formato={numero} /> <span className="text-sm font-normal text-ink-500">/ {numero(plan.peticionesIncluidas)}</span></p>
              <div className="relative mt-3 h-1.5 rounded-full bg-ink-150">
                <div className={cx('h-full rounded-full', uso >= 100 ? 'bg-red-500' : uso >= 80 ? 'bg-amber-500' : 'bg-navy')} style={{ width: `${Math.min(100, uso)}%` }} />
                <div className="absolute -bottom-1 -top-1 left-[80%] w-px bg-ink-500" title="Aviso del 80 %" />
              </div>
              <p className="mt-2 text-xs text-ink-500">Se avisa al 80 % y al 100 %. Solo cuentan las peticiones de generación que Unburn reenvía al proveedor, aunque fallen o se bloquee la respuesta. Las que Unburn rechaza no cuentan.</p>
            </div>
            <div className="space-y-3">
              {plan.id === 'pro' && (
                <div className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2.5">
                  <div><p className="text-xs text-ink-500">Tope de excedente</p><p className="text-sm font-medium text-ink-950">{euros(sus.topeExcedente, 0)} / mes <span className="font-normal text-ink-500">· {plan.excedente.precioBloque} € por cada {numero(plan.excedente.bloque)} peticiones</span></p></div>
                  <Button size="sm" requiereAdmin onClick={() => setTope(true)}>Cambiar</Button>
                </div>
              )}
              {plan.id === 'pro' && ec.exceso > 0 && (
                <div className="rounded-md border border-ink-200 px-3 py-2.5">
                  <div className="flex justify-between text-xs"><span className="text-ink-500">Excedente de este mes · {ec.bloques} {ec.bloques === 1 ? 'bloque' : 'bloques'}</span><span className="tabular-nums text-ink-900">{euros(ec.importeExcedente, 0)} de {euros(sus.topeExcedente, 0)}</span></div>
                  <div className="relative mt-2 h-1.5 rounded-full bg-ink-150"><div className={cx('h-full rounded-full', ec.importeExcedente >= sus.topeExcedente ? 'bg-red-500' : ec.importeExcedente >= sus.topeExcedente * 0.8 ? 'bg-amber-500' : 'bg-navy')} style={{ width: `${Math.min(100, (ec.importeExcedente / (sus.topeExcedente || 1)) * 100)}%` }} /><div className="absolute -bottom-1 -top-1 left-[80%] w-px bg-ink-500" /></div>
                </div>
              )}
              {plan.id === 'gratis' && <p className="rounded-md border border-ink-200 px-3 py-2.5 text-sm text-ink-700">{plan.alAgotarCuota}</p>}
              <div className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2.5">
                <div className="flex items-center gap-2.5"><CreditCard className="h-4 w-4 text-ink-400" />
                  <div><p className="text-xs text-ink-500">Medio de pago</p><p className="text-sm text-ink-950">{sus.medioPago ? `${sus.medioPago.marca} ···· ${sus.medioPago.ultimos4} · caduca ${sus.medioPago.caduca}` : 'Sin medio de pago'}</p></div>
                </div>
                <Button size="sm" icon={ExternalLink} requiereAdmin onClick={() => toast('Abriendo la plataforma de pagos', 'info', 'Los datos de la tarjeta se quedan en la plataforma; Unburn no los ve')}>Gestionar</Button>
              </div>
              <p className="text-xs text-ink-500">Próxima factura: {proxima} · {plan.id === 'pro' ? `${euros(plan.precioMensual + ec.importeExcedente)} + IVA` : '0 €'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Peticiones facturables por mes" />
          <div className="px-2 py-3"><BarrasMensuales datos={historico} dataKey="peticiones" formato={(v) => (v >= 1000 ? `${Math.round(v / 1000)} mil` : v)} alto={190} /></div>
        </Card>
      </div>

      <Section title="Planes" className="mt-8">
        <div className="grid gap-4 md:grid-cols-3">
          {datos.planes.map((p) => {
            const actual = p.id === plan.id
            return (
              <div key={p.id} className={cx('flex flex-col rounded-lg border p-5', actual ? 'border-navy' : 'border-ink-200')}>
                <div className="flex items-center justify-between"><p className="text-sm font-semibold text-ink-950">{p.nombre}</p>{actual && <span className="text-xs font-medium text-ink-500">Plan actual</span>}</div>
                <p className="mt-0.5 text-xs text-ink-500">{p.pensadoPara}</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink-950">{p.precioMensual === 0 ? '0 €' : p.precioMensual ? `${p.precioMensual} €` : 'A medida'}<span className="text-sm font-normal text-ink-500">{p.precioMensual != null ? ' / mes' : ''}</span></p>
                <p className="text-xs text-ink-500">{p.peticionesIncluidas ? `${numero(p.peticionesIncluidas)} peticiones incluidas` : 'Contrato personalizado'}</p>
                <ul className="mt-4 flex-1 space-y-1.5">{p.funciones.map((f) => <li key={f} className="flex gap-2 text-sm text-ink-700"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />{f}</li>)}</ul>
                <div className="mt-5">
                  {actual ? <Button className="w-full" disabled>Plan actual</Button>
                    : p.id === 'enterprise' ? <Button className="w-full" onClick={() => setVentas(true)}>Hablar con Ventas</Button>
                      : <Button className="w-full" variant={p.id === 'pro' ? 'brand' : 'secondary'} requiereAdmin onClick={() => setCambio(p.id)}>{p.id === 'pro' ? 'Pasar a Pro' : 'Cambiar a Gratis'}</Button>}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Facturas" description="Solo incluyen la suscripción a Unburn. El gasto en IA lo factura cada proveedor.">
        {facturas.length === 0 ? <Card><EmptyState title="Todavía no hay facturas">El plan Gratis no genera facturas.</EmptyState></Card> : (
          <DataTable rows={facturas} pageSize={6} initialSort={{ id: 'fecha', dir: 'desc' }}
            columns={[
              { id: 'id', header: 'Nº factura', cell: (f) => <span className="font-mono text-[12px] text-ink-950">{f.id}</span> },
              { id: 'fecha', header: 'Fecha', sort: (f) => f.fecha, cell: (f) => fecha(f.fecha) },
              { id: 'periodo', header: 'Periodo', cell: (f) => mesLargo(f.periodo) },
              { id: 'pet', header: 'Peticiones', align: 'right', sort: (f) => f.peticionesFacturables, cell: (f) => numero(f.peticionesFacturables) },
              { id: 'exc', header: 'Bloques de excedente', align: 'right', cell: (f) => f.bloquesExcedente || '—' },
              { id: 'imp', header: 'Base', align: 'right', cell: (f) => euros(f.importe) },
              { id: 'total', header: 'Total (IVA 21 %)', align: 'right', sort: (f) => f.total, cell: (f) => <span className="font-medium text-ink-950">{euros(f.total)}</span> },
              { id: 'estado', header: 'Cobro', cell: (f) => <Badge tone={f.estadoCobro === 'pagada' ? 'green' : 'red'}>{f.estadoCobro === 'pagada' ? 'Pagada' : 'Fallida'}</Badge> },
              { id: 'pdf', header: '', align: 'right', cell: (f) => <Button size="xs" variant="ghost" icon={Download} onClick={() => toast(`Descargando ${f.id}.pdf`, 'info')}>PDF</Button> },
            ]} />
        )}
      </Section>

      <p className="text-sm text-ink-500">Los datos fiscales, la exportación de datos y la baja están en <Link to="/app/ajustes" className="font-medium text-ink-950 hover:underline">Ajustes de la organización</Link>.</p>

      {cambio && <CambioPlanModal destino={cambio} activas={activas} onClose={() => setCambio(null)} onConfirmar={() => aplicarCambio(cambio)} />}
      {tope && <TopeModal actual={sus.topeExcedente} onClose={() => setTope(false)} onGuardar={(v) => { actualizarOrg((o) => ({ ...o, suscripcion: { ...o.suscripcion, topeExcedente: v, estado: o.suscripcion.estado === 'tope de excedente alcanzado' && ec.importeExcedente < v ? 'activa' : o.suscripcion.estado, avisos: { ...o.suscripcion.avisos, tope80: ec.importeExcedente >= v * 0.8, tope100: ec.importeExcedente >= v } } })); setTope(false); toast('Tope de excedente actualizado', 'exito', `Como máximo ${euros(v, 0)} al mes por encima de las peticiones incluidas`) }} />}
      {ventas && <VentasModal org={org} onClose={() => setVentas(false)} onEnviar={() => { setVentas(false); toast('Solicitud enviada a Ventas', 'exito', 'Un comercial te contactará en 1 día laborable') }} />}
    </>
  )
}

function CambioPlanModal({ destino, activas, onClose, onConfirmar }) {
  const [pagando, setPagando] = useState(false)
  const bloqueado = destino === 'gratis' && activas > 3
  const confirmar = () => { setPagando(true); setTimeout(onConfirmar, 1100) }
  return (
    <Modal open onClose={onClose} title={destino === 'pro' ? 'Pasar al plan Pro' : 'Cambiar al plan Gratis'}
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant={destino === 'pro' ? 'brand' : 'primary'} disabled={bloqueado || pagando} icon={pagando ? Loader2 : undefined} onClick={confirmar}>{pagando ? 'Procesando…' : destino === 'pro' ? 'Confirmar y pagar 49 €/mes' : 'Cambiar a Gratis'}</Button></>}>
      {destino === 'pro' ? (
        <div className="space-y-3 text-sm text-ink-700">
          <p>49 € al mes con 500.000 peticiones incluidas. El primer cargo se prorratea hasta el 1 de noviembre.</p>
          <p>Se te redirigirá a la plataforma de pagos para registrar la tarjeta; sus datos no llegan a Unburn.</p>
          <Callout tone="neutral">Al confirmar se activan al momento las claves ilimitadas, el escudo de herramientas completo, el diagnóstico causal y las alertas por Slack, Teams o webhook.</Callout>
        </div>
      ) : bloqueado ? (
        <Callout tone="warn" title={`Tienes ${activas} claves activas`}>El plan Gratis permite como máximo 3. Revoca {activas - 3} antes de cambiar.</Callout>
      ) : <p className="text-sm text-ink-700">Perderás el escudo completo, el diagnóstico causal y los canales distintos del email. El registro de auditoría pasará a conservarse 7 días.</p>}
    </Modal>
  )
}

function TopeModal({ actual, onClose, onGuardar }) {
  const [v, setV] = useState(actual)
  return (
    <Modal open onClose={onClose} title="Tope de excedente" size="sm" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!(Number(v) >= 0)} onClick={() => onGuardar(Number(v))}>Guardar</Button></>}>
      <Field label="Máximo al mes (€)" hint="Al alcanzarlo, las peticiones se rechazan con 402 hasta el mes siguiente. 0 € = sin excedente."><Input type="number" min="0" step="5" value={v} onChange={(e) => setV(e.target.value)} /></Field>
      <p className="mt-3 text-xs text-ink-500">Avisaremos al llegar al 80 % y al 100 % del tope.</p>
    </Modal>
  )
}

function VentasModal({ org, onClose, onEnviar }) {
  return (
    <Modal open onClose={onClose} title="Hablar con Ventas" description="Enterprise se contrata con un comercial: nube confidencial o despliegue privado, SLA y soporte dedicado."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={onEnviar}>Enviar</Button></>}>
      <div className="space-y-4">
        <Field label="Empresa"><Input defaultValue={org.nombre} /></Field>
        <Field label="Modalidad que os interesa"><Select><option>Nube confidencial</option><option>Despliegue privado</option><option>Aún no lo sé</option></Select></Field>
        <Field label="¿Qué necesitáis?"><Textarea placeholder="Volumen aproximado, requisitos de cumplimiento (DORA, RGPD…), plazos" /></Field>
      </div>
    </Modal>
  )
}
