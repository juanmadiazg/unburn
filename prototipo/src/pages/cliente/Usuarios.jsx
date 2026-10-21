import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { aleatorio, fechaHora, haceCuanto } from '../../lib/format'
import { Badge, Button, ConfirmModal, DataTable, Field, Input, Modal, PageHeader, Select, Tag } from '../../components/ui'

export default function Usuarios() {
  const { deOrg, mutar, org, usuario, esAdmin, toast } = useApp()
  const usuarios = deOrg('usuariosPanel')
  const [invitar, setInvitar] = useState(false)
  const [quitar, setQuitar] = useState(null)
  const admins = usuarios.filter((u) => u.rol === 'administrador').length

  const cambiarRol = (u, rol) => {
    if (u.rol === 'administrador' && rol === 'lector' && admins === 1) return toast('Debe quedar al menos un administrador', 'error')
    mutar('usuariosPanel', (l) => l.map((x) => (x.id === u.id ? { ...x, rol } : x)))
    toast(`${u.nombre} ahora es ${rol}`, 'exito')
  }

  return (
    <>
      <PageHeader title="Usuarios" refs={['BP-04', 'IC-02', 'OF-12']}
        description="Personas con acceso al panel. El administrador puede cambiarlo todo; el lector solo consulta. Los auditores entran como lectores."
        actions={<Button variant="brand" icon={UserPlus} requiereAdmin onClick={() => setInvitar(true)}>Invitar usuario</Button>} />

      <DataTable rows={usuarios} search={(u) => `${u.nombre} ${u.apellidos} ${u.email}`} searchPlaceholder="Buscar por nombre o email…"
        filters={[{ id: 'rol', label: 'Rol', options: [{ id: 'administrador', label: 'Administrador' }, { id: 'lector', label: 'Lector' }], value: (u) => u.rol }]}
        columns={[
          { id: 'nombre', header: 'Usuario', sort: (u) => u.nombre, cell: (u) => (
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 text-2xs font-semibold text-ink-700">{u.nombre[0]}{u.apellidos[0]}</span>
              <div><p className="text-ink-950">{u.nombre} {u.apellidos} {u.id === usuario.id && <span className="text-xs text-ink-400">(tú)</span>}</p><p className="text-xs text-ink-500">{u.email}</p></div>
            </div>
          ) },
          { id: 'cargo', header: 'Cargo', cell: (u) => <span className="text-ink-600">{u.cargo}</span> },
          { id: 'rol', header: 'Rol', cell: (u) => (esAdmin && u.id !== usuario.id
            ? <Select className="h-7 w-36 text-xs" value={u.rol} onChange={(e) => cambiarRol(u, e.target.value)}><option value="administrador">Administrador</option><option value="lector">Lector</option></Select>
            : <Tag>{u.rol === 'administrador' ? 'Administrador' : 'Lector'}</Tag>) },
          { id: 'estado', header: 'Estado', cell: (u) => (u.pendiente ? <Badge tone="amber">Invitación enviada</Badge> : <Badge tone="green">Activo</Badge>) },
          { id: 'acceso', header: 'Último acceso', align: 'right', sort: (u) => u.ultimoAcceso || '', cell: (u) => <span className="text-ink-500" title={fechaHora(u.ultimoAcceso)}>{u.ultimoAcceso ? haceCuanto(u.ultimoAcceso) : '—'}</span> },
          { id: 'acc', header: '', align: 'right', cell: (u) => u.id !== usuario.id && <Button size="xs" variant="ghost" requiereAdmin onClick={() => setQuitar(u)}>Quitar acceso</Button> },
        ]} />

      {invitar && <InvitarModal onClose={() => setInvitar(false)} onInvitar={(f) => {
        mutar('usuariosPanel', (l) => [...l, { id: `u_${aleatorio(6)}`, orgId: org.id, nombre: f.email.split('@')[0].split('.')[0].replace(/^\w/, (c) => c.toUpperCase()), apellidos: '—', email: f.email, rol: f.rol, cargo: f.rol === 'lector' ? 'Invitado' : '—', ultimoAcceso: null, pendiente: true }])
        setInvitar(false)
        toast('Invitación enviada', 'exito', f.email)
      }} />}
      <ConfirmModal open={!!quitar} onClose={() => setQuitar(null)} title="Quitar acceso" confirmLabel="Quitar acceso"
        onConfirm={() => { mutar('usuariosPanel', (l) => l.filter((x) => x.id !== quitar.id)); toast(`${quitar.nombre} ya no tiene acceso`, 'exito'); setQuitar(null) }}>
        {quitar?.nombre} {quitar?.apellidos} ({quitar?.email}) dejará de poder entrar en el panel de {org.nombre}.
      </ConfirmModal>
    </>
  )
}

function InvitarModal({ onClose, onInvitar }) {
  const [f, setF] = useState({ email: '', rol: 'lector' })
  return (
    <Modal open onClose={onClose} title="Invitar usuario" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!/.+@.+\..+/.test(f.email)} onClick={() => onInvitar(f)}>Enviar invitación</Button></>}>
      <div className="space-y-4">
        <Field label="Email"><Input autoFocus type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="nombre@empresa.es" /></Field>
        <Field label="Rol" hint={f.rol === 'lector' ? 'Puede consultar gasto, incidentes, grafo de contexto, auditoría y facturas, exportar el registro y abrir tickets.' : 'Puede cambiar toda la configuración, la suscripción y los usuarios.'}>
          <Select value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })}><option value="lector">Lector</option><option value="administrador">Administrador</option></Select>
        </Field>
      </div>
    </Modal>
  )
}
