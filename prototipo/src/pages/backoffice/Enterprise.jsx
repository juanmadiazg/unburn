import { useState } from 'react'
import { ArrowRight, Check, Plus } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { euros, fecha, haceCuanto, numero } from '../../lib/format'
import { ahoraIso } from '../../lib/tiempo'
import { Badge, Button, Callout, Card, CardHeader, Checkbox, DataTable, Drawer, Field, Input, KV, Modal, Mono, PageHeader, Section, Select, cx } from '../../components/ui'

const ETAPAS = [
  ['prospeccion', 'Prospección'], ['demo', 'Demostración'], ['revision_seguridad', 'Revisión de seguridad'], ['negociacion', 'Negociación'], ['firmado', 'Firmado'],
]
const REVISION_LEGAL = ['Contrato de tratamiento de datos (RGPD art. 28)', 'Estrategia de salida y portabilidad (Data Act)', 'Resiliencia operativa y subcontratación (DORA)', 'Retención del registro (Reglamento Europeo de IA)', 'SLA y penalizaciones']

/** BP-02 Vender contrato Enterprise: lo hacen Ventas y Legal (IC-05) */
export default function Enterprise() {
  const { datos, aplicar, empleado, toast } = useApp()
  const ventas = empleado.departamento === 'Ventas'
  const legal = empleado.departamento.startsWith('Legal')
  const [selId, setSelId] = useState(null)
  const [nueva, setNueva] = useState(false)
  const sel = datos.oportunidades.find((o) => o.id === selId)
  const actualizar = (id, cambios) => aplicar((d) => ({ ...d, oportunidades: d.oportunidades.map((o) => (o.id === id ? { ...o, ...cambios, actualizado: ahoraIso().slice(0, 10) } : o)) }))
  const avanzar = (o) => {
    const i = ETAPAS.findIndex(([e]) => e === o.etapa)
    const sig = ETAPAS[Math.min(i + 1, ETAPAS.length - 2)][0]
    actualizar(o.id, { etapa: sig })
    toast(`${o.empresa} pasa a ${ETAPAS.find(([e]) => e === sig)[1].toLowerCase()}`)
  }
  const firmar = (o) => {
    const c = o.contrato
    aplicar((d) => ({
      ...d,
      oportunidades: d.oportunidades.map((x) => (x.id === o.id ? { ...x, etapa: 'firmado', contrato: { ...c, fechaFirma: ahoraIso().slice(0, 10) } } : x)),
      contratos: [{ ...c, clienteId: `org_${o.id.slice(4)}`, cliente: o.empresa, fechaFirma: ahoraIso().slice(0, 10) }, ...d.contratos],
      // IF-27: la consola envía a la API de administración el alta preparada del cliente Enterprise (BP-03)
      clientes: [{ id: `org_${o.id.slice(4)}`, nombre: o.empresa, plan: 'enterprise', modalidad: c.modalidad, estado: 'alta preparada', cobro: 'pendiente', peticionesMes: 0, cuota: c.peticionesIncluidas, ingresoMes: c.precio, socio: null, alta: ahoraIso().slice(0, 10), pais: 'España', ticketsAbiertos: 0, contrato: c.numero }, ...d.clientes],
    }))
    setSelId(null)
    toast(`Contrato ${c.numero} firmado`, 'exito', 'Alta del cliente preparada en la API de administración (IF-27)', '/bo/clientes')
  }
  const columnas = ETAPAS.slice(0, 4)
  const valor = (e) => datos.oportunidades.filter((o) => o.etapa === e).reduce((a, o) => a + o.importeAnual, 0)

  return (
    <>
      <PageHeader title="Contratos Enterprise" refs={['BP-02', 'IC-05', 'IF-27', 'DEC-17']}
        description="Venta consultiva a grandes empresas y sectores regulados: demostración, revisión de seguridad, contrato personalizado y elección entre nube confidencial y despliegue privado."
        actions={ventas && <Button variant="brand" icon={Plus} onClick={() => setNueva(true)}>Nueva oportunidad</Button>} />

      <div className="grid gap-3 lg:grid-cols-4">
        {columnas.map(([e, n]) => (
          <div key={e} className="rounded-lg border border-ink-200 bg-ink-50 p-2">
            <div className="flex items-baseline justify-between px-1.5 pb-2 pt-1"><p className="text-xs font-medium text-ink-700">{n}</p><p className="text-xs tabular-nums text-ink-500">{euros(valor(e), 0)}/año</p></div>
            <div className="space-y-2">
              {datos.oportunidades.filter((o) => o.etapa === e).map((o) => (
                <button key={o.id} onClick={() => setSelId(o.id)} className="block w-full rounded-md border border-ink-200 bg-surface p-3 text-left hover:border-ink-300">
                  <p className="text-sm font-medium text-ink-950">{o.empresa}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{o.sector} · {o.modalidad}</p>
                  <p className="mt-2 text-xs text-ink-700">{o.proximoPaso}</p>
                  <p className="mt-2 flex justify-between text-xs text-ink-400"><span className="tabular-nums">{euros(o.importeAnual, 0)}/año</span><span>{haceCuanto(o.actualizado + 'T12:00:00')}</span></p>
                </button>
              ))}
              {!datos.oportunidades.some((o) => o.etapa === e) && <p className="px-1.5 py-4 text-center text-xs text-ink-400">Ninguna</p>}
            </div>
          </div>
        ))}
      </div>

      <Section title="Contratos firmados" className="mt-8">
        <DataTable rows={datos.contratos} rowKey={(c) => c.numero} initialSort={{ id: 'firma', dir: 'desc' }}
          columns={[
            { id: 'n', header: 'Contrato', cell: (c) => <div><p className="text-ink-950">{c.cliente}</p><Mono className="text-ink-400">{c.numero}</Mono></div> },
            { id: 'mod', header: 'Modalidad', cell: (c) => <span className="text-ink-700">{c.modalidad}</span> },
            { id: 'precio', header: 'Precio / mes', align: 'right', sort: (c) => c.precio, cell: (c) => euros(c.precio, 0) },
            { id: 'pet', header: 'Peticiones incluidas', align: 'right', cell: (c) => (c.peticionesIncluidas ? numero(c.peticionesIncluidas) : 'Licencia') },
            { id: 'sla', header: 'SLA', cell: (c) => c.sla },
            { id: 'ret', header: 'Retención', align: 'right', cell: (c) => `${c.diasRetencion} días` },
            { id: 'firma', header: 'Firma', align: 'right', sort: (c) => c.fechaFirma, cell: (c) => <span className="text-ink-500">{fecha(c.fechaFirma)}</span> },
          ]} />
      </Section>

      <Drawer open={!!sel} onClose={() => setSelId(null)} title={sel?.empresa} subtitle={sel && `${sel.sector} · ${ETAPAS.find(([e]) => e === sel.etapa)?.[1]}`} width="max-w-2xl"
        footer={sel && sel.etapa !== 'firmado' && <>
          {sel.etapa !== 'negociacion' && <Button disabled={!ventas} title={!ventas ? 'Lo hace Ventas' : undefined} icon={ArrowRight} onClick={() => avanzar(sel)}>Pasar a la siguiente etapa</Button>}
          {sel.etapa === 'negociacion' && <Button variant="primary" disabled={!ventas || !sel.revisionLegal || sel.revisionLegal.length < REVISION_LEGAL.length || !sel.contrato} title={!sel.revisionLegal || sel.revisionLegal.length < REVISION_LEGAL.length ? 'Falta la revisión de Legal' : undefined} onClick={() => firmar(sel)}>Firmar y preparar el alta</Button>}
        </>}>
        {sel && (
          <div className="space-y-6">
            <KV items={[['Importe anual', euros(sel.importeAnual, 0)], ['Peticiones al mes', sel.peticionesMes ? numero(sel.peticionesMes) : 'Despliegue privado (licencia)'], ['Modalidad', sel.modalidad], ['Próximo paso', sel.proximoPaso]]} />
            <div className="flex gap-1">{ETAPAS.map(([e, n]) => { const i = ETAPAS.findIndex(([x]) => x === sel.etapa), j = ETAPAS.findIndex(([x]) => x === e); return <div key={e} className="flex-1"><div className={cx('h-1 rounded-full', j <= i ? 'bg-navy' : 'bg-ink-150')} /><p className="mt-1 text-2xs text-ink-500">{n}</p></div> })}</div>
            {sel.contrato ? (
              <Card>
                <CardHeader title={`Contrato ${sel.contrato.numero}`} subtitle="Concepto de información IC-05" />
                <div className="p-4"><KV items={[['Precio mensual', euros(sel.contrato.precio, 0)], ['Peticiones incluidas', numero(sel.contrato.peticionesIncluidas)], ['Disponibilidad (SLA)', sel.contrato.sla], ['Soporte', sel.contrato.soporte], ['Retención del registro', `${sel.contrato.diasRetencion} días`], ['Estrategia de salida', sel.contrato.estrategiaSalida], ['Modalidad', sel.contrato.modalidad], ['Firma', sel.contrato.fechaFirma ? fecha(sel.contrato.fechaFirma) : 'Pendiente']]} /></div>
              </Card>
            ) : <Callout tone="neutral">El contrato se redacta en la negociación.</Callout>}
            {['revision_seguridad', 'negociacion'].includes(sel.etapa) && (
              <div>
                <p className="mb-2 text-sm font-medium text-ink-950">Revisión de Legal</p>
                <div className="space-y-2">
                  {REVISION_LEGAL.map((r) => <Checkbox key={r} label={r} disabled={!legal} checked={(sel.revisionLegal || []).includes(r)} onChange={(v) => actualizar(sel.id, { revisionLegal: v ? [...(sel.revisionLegal || []), r] : (sel.revisionLegal || []).filter((x) => x !== r) })} />)}
                </div>
                {!legal && <p className="mt-2 text-xs text-ink-500">Solo Legal y cumplimiento puede marcar la revisión.</p>}
                {(sel.revisionLegal || []).length === REVISION_LEGAL.length && <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400"><Check className="h-3.5 w-3.5" /> Revisión legal completa</p>}
              </div>
            )}
          </div>
        )}
      </Drawer>

      {nueva && <NuevaOportunidad onClose={() => setNueva(false)} onGuardar={(f) => { aplicar((d) => ({ ...d, oportunidades: [{ id: `opp_${Math.floor(105 + Math.random() * 800)}`, ...f, importeAnual: Number(f.importeAnual) || 0, peticionesMes: Number(f.peticionesMes) || null, etapa: 'prospeccion', responsable: empleado.id, actualizado: ahoraIso().slice(0, 10) }, ...d.oportunidades] })); setNueva(false); toast('Oportunidad creada') }} />}
    </>
  )
}

function NuevaOportunidad({ onClose, onGuardar }) {
  const [f, setF] = useState({ empresa: '', sector: 'Banca', modalidad: 'Nube confidencial', importeAnual: 48000, peticionesMes: 10000000, proximoPaso: 'Primera llamada' })
  return (
    <Modal open onClose={onClose} title="Nueva oportunidad Enterprise" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!f.empresa.trim()} onClick={() => onGuardar(f)}>Crear</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Empresa" className="sm:col-span-2"><Input autoFocus value={f.empresa} onChange={(e) => setF({ ...f, empresa: e.target.value })} /></Field>
        <Field label="Sector"><Select value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })}>{['Banca', 'Seguros', 'Salud', 'Logística', 'Administración pública', 'Otro'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Modalidad"><Select value={f.modalidad} onChange={(e) => setF({ ...f, modalidad: e.target.value })}><option>Nube confidencial</option><option>Despliegue privado</option><option>Por decidir</option></Select></Field>
        <Field label="Importe anual estimado (€)"><Input type="number" value={f.importeAnual} onChange={(e) => setF({ ...f, importeAnual: e.target.value })} /></Field>
        <Field label="Peticiones al mes"><Input type="number" value={f.peticionesMes} onChange={(e) => setF({ ...f, peticionesMes: e.target.value })} /></Field>
      </div>
    </Modal>
  )
}
