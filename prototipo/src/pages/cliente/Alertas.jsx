import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Hash, Mail, MessagesSquare, Plus, Send, Webhook, ExternalLink } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { AVISOS, CANALES } from '../../lib/dominio'
import { aleatorio, fechaHora, haceCuanto } from '../../lib/format'
import { Button, Callout, Card, Checkbox, ConfirmModal, DataTable, Field, Input, Modal, PageHeader, Section, Select, Tag, Toggle } from '../../components/ui'

const ICONOS = { email: Mail, slack: Hash, teams: MessagesSquare, webhook: Webhook }
const MOTIVOS = { incidente: 'Incidente', limite_blando: 'Límite blando', cuota: 'Cuota', tope_excedente: 'Tope de excedente' }
const PLACEHOLDER = { email: 'equipo@empresa.es', slack: '#canal (workspace)', teams: 'Equipo › Canal', webhook: 'https://…' }

export default function Alertas() {
  const { deOrg, plan, mutar, org, registrarCambio, toast, esAdmin } = useApp()
  const bandeja = deOrg('bandeja')
  const [vistaBandeja, setVistaBandeja] = useState('todos')
  const canales = deOrg('canales')
  const alertas = deOrg('alertas')
  const [editar, setEditar] = useState(null)
  const [borrar, setBorrar] = useState(null)
  const permitido = (tipo) => plan.canalesAlerta.includes(tipo)

  const guardar = (c) => {
    if (c.id) mutar('canales', (l) => l.map((x) => (x.id === c.id ? c : x)))
    else mutar('canales', (l) => [...l, { ...c, id: `can_${aleatorio(6)}`, orgId: org.id, activo: true }])
    registrarCambio(c.id ? 'Canal actualizado' : `Canal de ${CANALES[c.tipo].nombre} añadido`)
    setEditar(null)
  }

  return (
    <>
      <PageHeader title="Canales de alerta" refs={['BP-06', 'OF-12', 'IC-13', 'IC-23', 'AP-10']}
        description="Dónde avisa Unburn de cada incidente nuevo, del cruce de un límite blando y de la llegada al 80 % y al 100 % de la cuota o del tope de excedente. Cada alerta enlaza a su diagnóstico en el panel."
        actions={<Button variant="brand" icon={Plus} requiereAdmin onClick={() => setEditar({ tipo: 'email', destino: '', avisos: ['incidente', 'limite_blando', 'cuota'] })}>Añadir canal</Button>} />

      {plan.id === 'gratis' && (
        <Callout tone="neutral" className="mb-6" actions={<Link to="/app/suscripcion" className="text-sm font-medium text-ink-950 hover:underline">Pasar a Pro</Link>}>
          En el plan Gratis las alertas solo llegan por email. Slack, Microsoft Teams y webhook están disponibles en Pro.
        </Callout>
      )}

      <Section title="Canales" description={`${canales.filter((c) => c.activo).length} activos`}>
        <Card>
          <ul className="divide-y divide-ink-100">
            {canales.map((c) => {
              const I = ICONOS[c.tipo]
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-500"><I className="h-4 w-4" strokeWidth={1.75} /></span>
                  <div className="min-w-[200px] flex-1">
                    <p className="text-sm text-ink-950">{c.destino}</p>
                    <p className="text-xs text-ink-500">{CANALES[c.tipo].nombre}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">{c.avisos.map((a) => <Tag key={a}>{MOTIVOS[a]}</Tag>)}</div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" icon={Send} disabled={!c.activo} onClick={() => toast('Alerta de prueba enviada', 'exito', `${CANALES[c.tipo].nombre} · ${c.destino}`)}>Probar</Button>
                    <Button size="sm" requiereAdmin onClick={() => setEditar(c)}>Editar</Button>
                    <Button size="sm" variant="ghost" requiereAdmin onClick={() => setBorrar(c)}>Eliminar</Button>
                    <span className="ml-2"><Toggle checked={c.activo} disabled={!esAdmin} label="Activo" onChange={(v) => { mutar('canales', (l) => l.map((x) => (x.id === c.id ? { ...x, activo: v } : x))); toast(v ? 'Canal activado' : 'Canal pausado', 'info', c.destino) }} /></span>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </Section>

      <Section title="Bandeja de los canales" description="Simulación de lo que han recibido Slack, Teams, el email y el webhook. Cada aviso enlaza a su diagnóstico en el panel."
        actions={<div className="flex gap-1">{['todos', ...new Set(bandeja.map((m) => m.tipo))].map((t) => <button key={t} onClick={() => setVistaBandeja(t)} className={`rounded-md px-2 py-1 text-xs ${vistaBandeja === t ? 'bg-ink-100 font-medium text-ink-950' : 'text-ink-500 hover:text-ink-900'}`}>{t === 'todos' ? 'Todos' : CANALES[t].nombre}</button>)}</div>}>
        <Card className="max-h-[420px] overflow-y-auto" data-bandeja>
          {bandeja.length === 0 ? <p className="px-4 py-8 text-center text-sm text-ink-500">Aún no ha llegado nada a tus canales.</p> : (
            <ul className="divide-y divide-ink-100">
              {[...bandeja].sort((a, b) => b.fecha.localeCompare(a.fecha)).filter((m) => vistaBandeja === 'todos' || m.tipo === vistaBandeja).slice(0, 30).map((m) => <MensajeCanal key={m.id} m={m} />)}
            </ul>
          )}
        </Card>
      </Section>

      <Section title="Alertas enviadas" description="Historial (IC-23)">
        <DataTable rows={alertas} pageSize={8} initialSort={{ id: 'fecha', dir: 'desc' }} search={(a) => a.resumen} searchPlaceholder="Buscar en el historial…"
          filters={[{ id: 'motivo', label: 'Motivo', options: Object.entries(MOTIVOS).map(([id, label]) => ({ id, label })), value: (a) => a.motivo }]}
          columns={[
            { id: 'fecha', header: 'Enviada', sort: (a) => a.fecha, cell: (a) => <span className="whitespace-nowrap text-ink-600" title={fechaHora(a.fecha)}>{haceCuanto(a.fecha)}</span> },
            { id: 'motivo', header: 'Motivo', cell: (a) => <Tag>{MOTIVOS[a.motivo]}</Tag> },
            { id: 'resumen', header: 'Resumen', cell: (a) => <span className="text-ink-900">{a.resumen}</span> },
            { id: 'canal', header: 'Canal', cell: (a) => <span className="text-xs text-ink-500">{canales.find((c) => c.id === a.canal)?.destino || '—'}</span> },
            { id: 'ir', header: '', align: 'right', cell: (a) => <Link to={a.enlace} className="text-xs font-medium text-ink-900 hover:underline">Abrir</Link> },
          ]} />
      </Section>

      {editar && <CanalModal c={editar} permitido={permitido} onClose={() => setEditar(null)} onGuardar={guardar} />}
      <ConfirmModal open={!!borrar} onClose={() => setBorrar(null)} title="Eliminar canal" confirmLabel="Eliminar" onConfirm={() => { mutar('canales', (l) => l.filter((x) => x.id !== borrar.id)); registrarCambio('Canal eliminado'); setBorrar(null) }}>
        Dejarás de recibir alertas en {borrar?.destino}.
      </ConfirmModal>
    </>
  )
}

function CanalModal({ c, permitido, onClose, onGuardar }) {
  const [f, setF] = useState(c)
  const valido = f.destino.trim().length > 3 && f.avisos.length > 0 && (f.tipo !== 'email' || /.+@.+\..+/.test(f.destino)) && (f.tipo !== 'webhook' || f.destino.startsWith('https://'))
  return (
    <Modal open onClose={onClose} title={c.id ? 'Editar canal' : 'Añadir canal'}
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!valido} onClick={() => onGuardar(f)}>Guardar</Button></>}>
      <div className="space-y-4">
        <Field label="Tipo">
          <Select value={f.tipo} disabled={!!c.id} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
            {Object.entries(CANALES).map(([id, x]) => <option key={id} value={id} disabled={!permitido(id)}>{x.nombre}{!permitido(id) ? ' · plan Pro' : ''}</option>)}
          </Select>
        </Field>
        <Field label="Destino" hint={f.tipo === 'webhook' ? 'Unburn firma cada envío con una cabecera X-Unburn-Signature' : undefined}><Input value={f.destino} onChange={(e) => setF({ ...f, destino: e.target.value })} placeholder={PLACEHOLDER[f.tipo]} /></Field>
        <div>
          <p className="mb-2 text-xs font-medium text-ink-700">Avisos que recibe</p>
          <div className="space-y-2">
            {Object.entries(AVISOS).map(([id, label]) => (
              <Checkbox key={id} label={label} checked={f.avisos.includes(id)} onChange={(v) => setF({ ...f, avisos: v ? [...f.avisos, id] : f.avisos.filter((x) => x !== id) })} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function MensajeCanal({ m }) {
  const I = ICONOS[m.tipo]
  const enlace = `https://app.unburn.eu${m.enlace.replace('/app', '')}`
  return (
    <li className="flex gap-3 px-4 py-3 animate-fila-nueva">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-ink-200 text-ink-500"><I className="h-3.5 w-3.5" strokeWidth={1.75} /></span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-ink-500"><span className="font-medium text-ink-900">{m.tipo === 'email' ? 'alertas@unburn.eu' : m.tipo === 'webhook' ? `POST ${m.destino}` : 'Unburn (app)'}</span><span>→ {m.destino}</span><span>{haceCuanto(m.fecha)}</span>{m.entregado === false && <span className="text-red-600">· entrega fallida, se reintentará</span>}</p>
        {m.tipo === 'webhook'
          ? <pre className="mt-1 overflow-x-auto rounded bg-ink-50 px-2 py-1.5 font-mono text-[11px] text-ink-700">{JSON.stringify({ type: m.motivo === 'incidente' ? 'incident.created' : m.motivo === 'limite_blando' ? 'budget.soft_limit' : 'quota.threshold', summary: m.titulo, url: enlace })}</pre>
          : <div className={m.tipo === 'email' ? 'mt-1' : 'mt-1 border-l-2 border-brand-400 pl-2.5'}>
              {m.tipo === 'email' && <p className="text-sm font-medium text-ink-950">[Unburn] {m.titulo}</p>}
              {m.tipo !== 'email' && <p className="text-sm text-ink-950">{m.titulo}</p>}
              {m.detalle && <p className="mt-0.5 text-xs text-ink-600">{m.detalle}</p>}
              <Link to={m.enlace} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-ink-900 hover:underline">{m.tipo === 'email' ? 'Ver el diagnóstico en el panel' : 'Abrir en Unburn'} <ExternalLink className="h-3 w-3" /></Link>
            </div>}
      </div>
    </li>
  )
}
