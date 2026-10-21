import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { ESTADOS_TICKET } from '../../lib/dominio'
import { ahoraIso, fechaHora, haceCuanto } from '../../lib/format'
import { Badge, Button, Callout, Card, CardHeader, DataTable, Field, Input, KV, Modal, Mono, PageHeader, Select, Textarea } from '../../components/ui'

export default function Soporte() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { deOrg, mutar, org, usuario, toast, datos } = useApp()
  const tickets = deOrg('tickets')
  const [nuevo, setNuevo] = useState(false)
  const ticket = tickets.find((t) => t.id === id)

  useEffect(() => {
    if (params.get('nuevo')) setNuevo(true)
    if (params.toString()) setParams({}, { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const crear = (f) => {
    const num = Math.max(...datos.tickets.map((t) => Number(t.id.slice(4)))) + 1
    const t = { id: `TCK-${num}`, orgId: org.id, cliente: org.nombre, abiertoPor: `${usuario.nombre} ${usuario.apellidos.split(' ')[0]}`, asignadoA: null, fecha: ahoraIso(), asunto: f.asunto, descripcion: f.descripcion, peticionRelacionada: f.peticion || null, estado: 'abierto', prioridad: f.prioridad, resolucion: null, mensajes: [] }
    mutar('tickets', (l) => [t, ...l])
    setNuevo(false)
    toast(`Ticket ${t.id} abierto`, 'exito', 'Soporte suele responder en menos de 3 horas laborables')
    navigate(`/app/soporte/${t.id}`)
  }

  if (id) {
    if (!ticket) return <Callout tone="warn">El ticket {id} no existe.</Callout>
    return <DetalleTicket ticket={ticket} />
  }

  return (
    <>
      <PageHeader title="Soporte" refs={['BP-13', 'IC-26', 'IF-27']}
        description="Dudas e incidencias con Unburn, por ejemplo por qué se ha bloqueado una petición. Soporte las analiza con los metadatos del registro, sin ver nunca el texto de tus peticiones ni tus claves."
        actions={<Button variant="brand" icon={Plus} onClick={() => setNuevo(true)}>Abrir ticket</Button>} />
      <DataTable rows={tickets} initialSort={{ id: 'fecha', dir: 'desc' }} onRowClick={(t) => navigate(`/app/soporte/${t.id}`)} search={(t) => `${t.id} ${t.asunto}`} searchPlaceholder="Buscar ticket…"
        filters={[{ id: 'estado', label: 'Estado', options: Object.entries(ESTADOS_TICKET).map(([id, e]) => ({ id, label: e.nombre })), value: (t) => t.estado }]}
        empty={{ title: 'No has abierto ningún ticket', description: 'Si algo no funciona como esperas, abre un ticket y adjunta el ID de la petición.' }}
        columns={[
          { id: 'asunto', header: 'Asunto', sort: (t) => t.asunto, cell: (t) => <div><p className="text-ink-950">{t.asunto}</p><Mono className="text-ink-400">{t.id}</Mono></div> },
          { id: 'estado', header: 'Estado', cell: (t) => <Badge tone={ESTADOS_TICKET[t.estado].tono}>{ESTADOS_TICKET[t.estado].nombre}</Badge> },
          { id: 'por', header: 'Abierto por', cell: (t) => <span className="text-ink-600">{t.abiertoPor}</span> },
          { id: 'resp', header: 'Respuestas', align: 'right', cell: (t) => t.mensajes.length },
          { id: 'fecha', header: 'Abierto', align: 'right', sort: (t) => t.fecha, cell: (t) => <span className="text-ink-500">{haceCuanto(t.fecha)}</span> },
        ]} />
      {nuevo && <NuevoTicketModal eventos={deOrg('eventos').filter((e) => e.decision !== 'permitida').slice(0, 12)} onClose={() => setNuevo(false)} onCrear={crear} />}
    </>
  )
}

function DetalleTicket({ ticket }) {
  const { mutar, usuario, toast, datos } = useApp()
  const [texto, setTexto] = useState('')
  const empleado = (id) => datos.empleados.find((e) => e.id === id)
  const responder = () => {
    mutar('tickets', (l) => l.map((t) => (t.id === ticket.id ? { ...t, mensajes: [...t.mensajes, { autor: `${usuario.nombre} ${usuario.apellidos.split(' ')[0]}`, tipo: 'cliente', fecha: ahoraIso(), texto }] } : t)))
    setTexto('')
    toast('Respuesta enviada', 'exito')
  }
  const hilo = [{ autor: ticket.abiertoPor, tipo: 'cliente', fecha: ticket.fecha, texto: ticket.descripcion }, ...ticket.mensajes]
  return (
    <>
      <PageHeader title={ticket.asunto} refs={['BP-13', 'IC-26']}
        description={<span className="flex flex-wrap items-center gap-2"><Mono>{ticket.id}</Mono><Badge tone={ESTADOS_TICKET[ticket.estado].tono}>{ESTADOS_TICKET[ticket.estado].nombre}</Badge><span>Abierto por {ticket.abiertoPor} {haceCuanto(ticket.fecha)}</span></span>} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {hilo.map((m, i) => (
            <Card key={i} className={m.tipo === 'soporte' ? 'border-ink-300 bg-ink-50/50' : ''}>
              <div className="flex items-center justify-between border-b border-ink-150 px-4 py-2.5">
                <p className="text-sm font-medium text-ink-950">{m.autor} {m.tipo === 'soporte' && <span className="ml-1 text-xs font-normal text-ink-500">· Soporte de Unburn</span>}</p>
                <span className="text-xs text-ink-500" title={fechaHora(m.fecha)}>{haceCuanto(m.fecha)}</span>
              </div>
              <p className="whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-ink-800">{m.texto}</p>
            </Card>
          ))}
          {ticket.resolucion && <Callout tone="success" title="Resolución">{ticket.resolucion}</Callout>}
          {ticket.estado !== 'cerrado' && (
            <Card className="p-3">
              <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe una respuesta…" className="border-0 shadow-none focus:ring-0" />
              <div className="mt-2 flex justify-end"><Button variant="primary" disabled={!texto.trim()} onClick={responder}>Responder</Button></div>
            </Card>
          )}
        </div>
        <Card className="self-start">
          <CardHeader title="Detalles" />
          <div className="px-4 py-4">
            <KV cols={1} items={[
              ['Prioridad', <span key="p" className="capitalize">{ticket.prioridad}</span>],
              ['Asignado a', empleado(ticket.asignadoA) ? `${empleado(ticket.asignadoA).nombre} (${empleado(ticket.asignadoA).departamento})` : 'Sin asignar'],
              ['Petición relacionada', ticket.peticionRelacionada ? (datos.eventos.some((e) => e.id === ticket.peticionRelacionada) ? <Link key="e" to={`/app/auditoria?evento=${ticket.peticionRelacionada}`} className="font-mono text-[12px] underline decoration-ink-300 underline-offset-2">{ticket.peticionRelacionada}</Link> : <Mono key="e">{ticket.peticionRelacionada}</Mono>) : '—'],
              ticket.incidenciaTecnica && ['Incidencia técnica', <Mono key="it">{ticket.incidenciaTecnica}</Mono>],
            ]} />
            <p className="mt-4 text-xs text-ink-500">Soporte solo ve los metadatos de la petición (quién, cuándo, cuánto y qué decidió Unburn), nunca su contenido.</p>
          </div>
        </Card>
      </div>
      <div className="mt-6"><Link to="/app/soporte" className="text-sm text-ink-500 hover:text-ink-900">← Volver a los tickets</Link></div>
    </>
  )
}

function NuevoTicketModal({ eventos, onClose, onCrear }) {
  const [f, setF] = useState({ asunto: '', descripcion: '', peticion: '', prioridad: 'media' })
  return (
    <Modal open onClose={onClose} size="lg" title="Abrir ticket" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={f.asunto.trim().length < 5 || f.descripcion.trim().length < 10} onClick={() => onCrear(f)}>Abrir ticket</Button></>}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Asunto" className="sm:col-span-2"><Input autoFocus value={f.asunto} onChange={(e) => setF({ ...f, asunto: e.target.value })} placeholder="¿Por qué se bloqueó…?" /></Field>
        <Field label="Prioridad"><Select value={f.prioridad} onChange={(e) => setF({ ...f, prioridad: e.target.value })}><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></Select></Field>
        <Field label="Descripción" className="sm:col-span-3"><Textarea value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} placeholder="Qué esperabas que pasara y qué ha pasado" /></Field>
        <Field label="Petición relacionada (opcional)" className="sm:col-span-3" hint="Soporte la analizará con sus metadatos, sin ver su contenido">
          <Select value={f.peticion} onChange={(e) => setF({ ...f, peticion: e.target.value })}>
            <option value="">Ninguna</option>
            {eventos.map((e) => <option key={e.id} value={e.id}>{e.id} · {e.decision} {e.codigo} · {haceCuanto(e.fecha)}</option>)}
          </Select>
        </Field>
      </div>
    </Modal>
  )
}
