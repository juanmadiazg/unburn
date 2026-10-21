import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { euros, fecha } from '../../lib/format'
import { ahoraIso } from '../../lib/tiempo'
import { Badge, Button, Callout, Checkbox, ConfirmModal, DataTable, Field, Input, Modal, PageHeader, Stat, Textarea } from '../../components/ui'

/** BP-18 Gestionar proveedores: Finanzas y Legal (IC-30). Los proveedores de IA los contrata el cliente. */
export default function Proveedores() {
  const { datos, aplicar, toast, empleado } = useApp()
  const [nuevo, setNuevo] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [baja, setBaja] = useState(null)
  const total = datos.proveedores.filter((p) => p.estado === 'activo').reduce((a, p) => a + p.costeMensual, 0)
  const legal = empleado.departamento.startsWith('Legal')
  return (
    <>
      <PageHeader title="Proveedores" refs={['BP-18', 'IC-30', '9.3.5']}
        description="Empresas cuyos servicios usa Unburn para funcionar. Finanzas controla su coste y Legal sus contratos; si cambia uno que trata datos de clientes, hay que avisarles."
        actions={<Button variant="brand" icon={Plus} onClick={() => setNuevo(true)}>Dar de alta proveedor</Button>} />
      <Callout tone="neutral" className="mb-6">Los proveedores de modelos de IA no aparecen aquí: los contrata y les paga directamente cada cliente.</Callout>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Coste mensual" value={euros(total, 0)} sub="Proveedores activos" />
        <Stat label="Tratan datos de clientes" value={datos.proveedores.filter((p) => p.trataDatos && p.estado === 'activo').length} sub="Subencargados del tratamiento" />
        <Stat label="Pendientes de revisar" value={datos.proveedores.filter((p) => new Date(p.revision) < new Date(Date.now() - 60 * 864e5)).length} sub="Última revisión hace más de 60 días" />
      </div>
      <DataTable rows={datos.proveedores} initialSort={{ id: 'coste', dir: 'desc' }}
        columns={[
          { id: 'nombre', header: 'Proveedor', sort: (p) => p.nombre, cell: (p) => <div><p className="text-ink-950">{p.nombre}</p><p className="max-w-[380px] text-xs text-ink-500">{p.servicio}</p></div> },
          { id: 'cond', header: 'Condiciones', cell: (p) => <span className="block max-w-[260px] text-xs text-ink-600">{p.condiciones}</span> },
          { id: 'datos', header: 'Datos de clientes', cell: (p) => (p.trataDatos ? <Badge tone="amber">Los trata</Badge> : <Badge tone="gray">No</Badge>) },
          { id: 'coste', header: 'Coste / mes', align: 'right', sort: (p) => p.costeMensual, cell: (p) => euros(p.costeMensual, 0) },
          { id: 'rev', header: 'Revisado', align: 'right', sort: (p) => p.revision, cell: (p) => <span className="text-ink-500">{fecha(p.revision)}</span> },
          { id: 'estado', header: 'Estado', cell: (p) => <Badge tone={p.estado === 'activo' ? 'green' : 'gray'}>{p.estado === 'activo' ? 'Activo' : 'De baja'}</Badge> },
          { id: 'acc', header: '', align: 'right', cell: (p) => p.estado === 'activo' && (
            <div className="flex justify-end gap-1">
              <Button size="xs" variant="ghost" onClick={() => { aplicar((d) => ({ ...d, proveedores: d.proveedores.map((x) => (x.id === p.id ? { ...x, revision: ahoraIso().slice(0, 10) } : x)) })); toast(`Condiciones de ${p.nombre} revisadas`, 'exito', legal ? 'Contrato y cláusulas UE al día' : 'Coste y ofertas comparados') }}>Revisar</Button>
              {p.trataDatos && <Button size="xs" variant="ghost" onClick={() => setAviso(p)}>Avisar a clientes</Button>}
              <Button size="xs" variant="ghost" onClick={() => setBaja(p)}>Dar de baja</Button>
            </div>
          ) },
        ]} />
      {nuevo && <NuevoProveedor onClose={() => setNuevo(false)} onGuardar={(f) => { aplicar((d) => ({ ...d, proveedores: [...d.proveedores, { id: `prov_${Math.random().toString(36).slice(2, 7)}`, ...f, costeMensual: Number(f.costeMensual) || 0, estado: 'activo', revision: ahoraIso().slice(0, 10), responsable: empleado.departamento }] })); setNuevo(false); toast('Proveedor dado de alta', 'exito', f.trataDatos ? 'Trata datos de clientes: avisa a los clientes antes de usarlo' : undefined) }} />}
      <ConfirmModal open={!!aviso} onClose={() => setAviso(null)} danger={false} title={`Avisar del cambio en ${aviso?.nombre}`} confirmLabel="Enviar aviso"
        onConfirm={() => { toast('Aviso enviado a todos los clientes', 'exito', 'Por email, con 30 días de antelación (contrato de tratamiento de datos)'); setAviso(null) }}>
        {aviso?.nombre} trata datos de los clientes. Cualquier cambio de subencargado se comunica a todos los clientes con antelación para que puedan oponerse.
      </ConfirmModal>
      <ConfirmModal open={!!baja} onClose={() => setBaja(null)} title={`Dar de baja ${baja?.nombre}`} confirmLabel="Dar de baja" palabra={baja?.nombre}
        onConfirm={() => { aplicar((d) => ({ ...d, proveedores: d.proveedores.map((x) => (x.id === baja.id ? { ...x, estado: 'de baja' } : x)) })); toast(`${baja.nombre} dado de baja`, 'aviso'); setBaja(null) }}>
        Unburn depende de este proveedor para funcionar. Asegúrate de que hay un sustituto antes de darlo de baja.
      </ConfirmModal>
    </>
  )
}

function NuevoProveedor({ onClose, onGuardar }) {
  const [f, setF] = useState({ nombre: '', servicio: '', condiciones: '', costeMensual: '', trataDatos: false })
  return (
    <Modal open onClose={onClose} title="Dar de alta proveedor" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!f.nombre.trim() || !f.servicio.trim()} onClick={() => onGuardar(f)}>Dar de alta</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre"><Input autoFocus value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
        <Field label="Coste mensual (€)"><Input type="number" value={f.costeMensual} onChange={(e) => setF({ ...f, costeMensual: e.target.value })} /></Field>
        <Field label="Servicio que presta" className="sm:col-span-2"><Input value={f.servicio} onChange={(e) => setF({ ...f, servicio: e.target.value })} /></Field>
        <Field label="Condiciones del contrato" className="sm:col-span-2"><Textarea value={f.condiciones} onChange={(e) => setF({ ...f, condiciones: e.target.value })} className="min-h-[64px]" /></Field>
        <div className="sm:col-span-2"><Checkbox checked={f.trataDatos} onChange={(v) => setF({ ...f, trataDatos: v })} label="Trata datos de clientes" description="Será un subencargado: Legal revisa el contrato y hay que avisar a los clientes" /></div>
      </div>
    </Modal>
  )
}
