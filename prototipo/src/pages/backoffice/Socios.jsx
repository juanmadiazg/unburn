import { useState } from 'react'
import { useApp } from '../../store/AppStore'
import { euros, fecha } from '../../lib/format'
import { ahoraIso } from '../../lib/tiempo'
import { Badge, Button, Callout, DataTable, Drawer, KV, Mono, PageHeader, Select, Stat, Tag } from '../../components/ui'

const ESTADOS = { propuesta: ['gray', 'Propuesta'], 'en conversación': ['blue', 'En conversación'], firmado: ['green', 'Acuerdo firmado'] }

/** BP-01 Gestionar socios: Ventas busca y sigue los acuerdos; Finanzas paga las comisiones (IC-29) */
export default function Socios() {
  const { datos, aplicar, empleado, toast } = useApp()
  const ventas = empleado.departamento === 'Ventas'
  const finanzas = empleado.departamento === 'Finanzas'
  const [selId, setSelId] = useState(null)
  const sel = datos.socios.find((s) => s.id === selId)
  const ingresoDe = (s) => s.clientes.reduce((a, id) => a + (datos.clientes.find((c) => c.id === id)?.ingresoMes || 0), 0)
  const comisionDe = (s) => (s.estado === 'firmado' ? (ingresoDe(s) * s.comision) / 100 : 0)
  const totalComisiones = datos.socios.reduce((a, s) => a + comisionDe(s), 0)
  const firmados = datos.socios.filter((s) => s.estado === 'firmado').length

  return (
    <>
      <PageHeader title="Socios" refs={['BP-01', 'IC-29', 'IF-32', '9.3.4']}
        description="Agencias de automatización, plataformas de agentes y el marketplace del proveedor de cloud que pueden traer clientes a cambio de una comisión." />
      <Callout tone="neutral" className="mb-6">Por ahora todos los socios son propuestas: no hay ningún acuerdo firmado. Las comisiones solo se calculan sobre acuerdos firmados.</Callout>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Socios en seguimiento" value={datos.socios.length} sub={`${firmados} con acuerdo firmado`} />
        <Stat label="Clientes traídos" value={datos.socios.reduce((a, s) => a + s.clientes.length, 0)} sub="Registrados al dar de alta al cliente" />
        <Stat label="Comisiones del mes" value={euros(totalComisiones)} sub="Las paga Finanzas" />
      </div>
      <DataTable rows={datos.socios} onRowClick={(s) => setSelId(s.id)} search={(s) => `${s.nombre} ${s.tipo}`} searchPlaceholder="Buscar socio…"
        filters={[{ id: 'estado', label: 'Estado', options: Object.entries(ESTADOS).map(([id, [, l]]) => ({ id, label: l })), value: (s) => s.estado }]}
        columns={[
          { id: 'nombre', header: 'Socio', sort: (s) => s.nombre, cell: (s) => <div><p className="text-ink-950">{s.nombre}</p><p className="text-xs text-ink-500">{s.tipo}</p></div> },
          { id: 'estado', header: 'Acuerdo', cell: (s) => <Badge tone={ESTADOS[s.estado][0]}>{ESTADOS[s.estado][1]}</Badge> },
          { id: 'com', header: 'Comisión', align: 'right', cell: (s) => (s.comision ? `${s.comision} %` : '—') },
          { id: 'cli', header: 'Clientes', align: 'right', sort: (s) => s.clientes.length, cell: (s) => s.clientes.length },
          { id: 'ing', header: 'Ingresos atribuidos', align: 'right', sort: ingresoDe, cell: (s) => euros(ingresoDe(s), 0) },
          { id: 'contacto', header: 'Último contacto', align: 'right', sort: (s) => s.ultimoContacto, cell: (s) => <span className="text-ink-500">{fecha(s.ultimoContacto)}</span> },
        ]} />
      <Drawer open={!!sel} onClose={() => setSelId(null)} title={sel?.nombre} subtitle={sel?.tipo}
        footer={sel && <>
          {finanzas && <Button disabled={!comisionDe(sel)} title={!comisionDe(sel) ? 'Sin acuerdo firmado no hay comisiones' : undefined} onClick={() => toast('Comisión enviada a pago', 'exito', euros(comisionDe(sel)))}>Pagar comisión</Button>}
        </>}>
        {sel && (
          <div className="space-y-5">
            <KV items={[['Contacto', sel.contacto], ['Último contacto', fecha(sel.ultimoContacto)], ['Comisión acordada', sel.comision ? `${sel.comision} %` : 'Sin definir'], ['Comisión del mes', euros(comisionDe(sel))]]} />
            <div>
              <p className="mb-1.5 text-xs font-medium text-ink-700">Estado del acuerdo</p>
              <Select disabled={!ventas} value={sel.estado} onChange={(e) => { aplicar((d) => ({ ...d, socios: d.socios.map((s) => (s.id === sel.id ? { ...s, estado: e.target.value, ultimoContacto: ahoraIso().slice(0, 10) } : s)) })); toast(`${sel.nombre}: ${ESTADOS[e.target.value][1].toLowerCase()}`) }}>
                {Object.entries(ESTADOS).map(([id, [, l]]) => <option key={id} value={id}>{l}</option>)}
              </Select>
              {!ventas && <p className="mt-1 text-xs text-ink-500">Lo gestiona Ventas.</p>}
            </div>
            <div><p className="text-xs text-ink-500">Notas</p><p className="mt-0.5 text-sm text-ink-800">{sel.nota}</p></div>
            <div>
              <p className="mb-2 text-xs text-ink-500">Clientes que ha traído</p>
              {sel.clientes.length === 0 ? <p className="text-sm text-ink-500">Ninguno todavía.</p> : <div className="flex flex-wrap gap-1.5">{sel.clientes.map((id) => <Tag key={id}>{datos.clientes.find((c) => c.id === id)?.nombre || id}</Tag>)}</div>}
            </div>
            {sel.id === 'soc_aws' && <p className="text-xs text-ink-500">La interfaz con el marketplace (<Mono>IF-32</Mono>) solo existirá si se firma el acuerdo.</p>}
          </div>
        )}
      </Drawer>
    </>
  )
}
