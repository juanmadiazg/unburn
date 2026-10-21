import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Lock } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { DECISIONES, ESTADOS_TICKET } from '../../lib/dominio'
import { ahoraIso, euros, fechaHora, haceCuanto, numero } from '../../lib/format'
import { Badge, Button, Callout, Card, CardHeader, DataTable, Field, KV, Modal, Mono, PageHeader, Select, Tag, Textarea } from '../../components/ui'

const PRIORIDAD = { alta: 'red', media: 'amber', baja: 'gray' }

export default function Tickets() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { datos, empleado } = useApp()
  const ticket = datos.tickets.find((t) => t.id === id)
  if (id && ticket) return <DetalleTicket ticket={ticket} />
  const nombreEmp = (eid) => { const e = datos.empleados.find((x) => x.id === eid); return e ? `${e.nombre} ${e.apellidos.split(' ')[0]}` : null }

  return (
    <>
      <PageHeader title="Tickets" refs={['BP-13', 'BP-17', 'IC-26', 'IC-27', 'IF-27', 'IF-28']}
        description="Dudas e incidencias de los clientes. Soporte las analiza con los metadatos del registro de auditoría y escala a Ingeniería las incidencias técnicas." />
      <DataTable rows={datos.tickets} pageSize={12} initialSort={{ id: 'fecha', dir: 'desc' }} onRowClick={(t) => navigate(`/bo/tickets/${t.id}`)}
        initialFilters={empleado.departamento.startsWith('Ingeniería') ? { estado: 'escalado' } : {}}
        search={(t) => `${t.id} ${t.asunto} ${t.cliente}`} searchPlaceholder="Buscar por ID, asunto o cliente…"
        filters={[
          { id: 'estado', label: 'Estado', options: Object.entries(ESTADOS_TICKET).map(([k, e]) => ({ id: k, label: e.nombre })), value: (t) => t.estado },
          { id: 'prioridad', label: 'Prioridad', options: [{ id: 'alta', label: 'Alta' }, { id: 'media', label: 'Media' }, { id: 'baja', label: 'Baja' }], value: (t) => t.prioridad },
          { id: 'asignado', label: 'Asignado', options: [{ id: 'yo', label: 'A mí' }, { id: 'nadie', label: 'Sin asignar' }], value: (t) => (t.asignadoA === empleado.id ? 'yo' : t.asignadoA ? 'otro' : 'nadie') },
        ]}
        columns={[
          { id: 'asunto', header: 'Ticket', sort: (t) => t.asunto, cell: (t) => <div className="min-w-[260px]"><p className="text-ink-950">{t.asunto}</p><Mono className="text-ink-400">{t.id}</Mono></div> },
          { id: 'cliente', header: 'Cliente', sort: (t) => t.cliente, cell: (t) => <span className="text-ink-700">{t.cliente}</span> },
          { id: 'prioridad', header: 'Prioridad', sort: (t) => ['baja', 'media', 'alta'].indexOf(t.prioridad), cell: (t) => <Badge tone={PRIORIDAD[t.prioridad]}>{t.prioridad[0].toUpperCase() + t.prioridad.slice(1)}</Badge> },
          { id: 'estado', header: 'Estado', cell: (t) => <Badge tone={ESTADOS_TICKET[t.estado].tono}>{ESTADOS_TICKET[t.estado].nombre}</Badge> },
          { id: 'asignado', header: 'Asignado a', cell: (t) => <span className={t.asignadoA ? 'text-ink-700' : 'text-ink-400'}>{nombreEmp(t.asignadoA) || 'Sin asignar'}</span> },
          { id: 'fecha', header: 'Abierto', align: 'right', sort: (t) => t.fecha, cell: (t) => <span className="text-ink-500" title={fechaHora(t.fecha)}>{haceCuanto(t.fecha)}</span> },
        ]} />
    </>
  )
}

function DetalleTicket({ ticket }) {
  const { datos, mutar, empleado, toast } = useApp()
  const [texto, setTexto] = useState('')
  const [escalar, setEscalar] = useState(false)
  const [cerrar, setCerrar] = useState(false)
  const soporte = empleado.departamento === 'Soporte'
  const ingenieria = empleado.departamento.startsWith('Ingeniería')
  const puedeResponder = soporte || (ingenieria && ticket.estado === 'escalado')
  const autor = `${empleado.nombre} ${empleado.apellidos.split(' ')[0]}`
  const nombreEmp = (eid) => { const e = datos.empleados.find((x) => x.id === eid); return e ? `${e.nombre} ${e.apellidos.split(' ')[0]} · ${e.departamento}` : 'Sin asignar' }
  const actualizar = (cambios) => mutar('tickets', (l) => l.map((t) => (t.id === ticket.id ? { ...t, ...cambios } : t)))

  // Metadatos de la petición relacionada (IF-28). Si no está en el registro mock, se muestra un resumen sintético.
  const evento = datos.eventos.find((e) => e.id === ticket.peticionRelacionada)
  const hilo = [{ autor: ticket.abiertoPor, tipo: 'cliente', fecha: ticket.fecha, texto: ticket.descripcion }, ...ticket.mensajes]

  return (
    <>
      <PageHeader title={ticket.asunto} refs={['BP-13', 'IC-26', 'IF-28']}
        description={<span className="flex flex-wrap items-center gap-2"><Mono>{ticket.id}</Mono><Badge tone={ESTADOS_TICKET[ticket.estado].tono}>{ESTADOS_TICKET[ticket.estado].nombre}</Badge><Badge tone={PRIORIDAD[ticket.prioridad]}>Prioridad {ticket.prioridad}</Badge><span>{ticket.cliente}</span></span>}
        actions={ticket.estado !== 'cerrado' && <>
          {ticket.asignadoA !== empleado.id && <Button disabled={!soporte && !ingenieria} onClick={() => { actualizar({ asignadoA: empleado.id }); toast(`${ticket.id} asignado a ti`) }}>Asignarme</Button>}
          {ticket.estado === 'abierto' && <Button disabled={!soporte} title={!soporte ? 'Solo Soporte escala tickets' : undefined} icon={ArrowUpRight} onClick={() => setEscalar(true)}>Escalar a Ingeniería</Button>}
          <Button variant="primary" disabled={!puedeResponder} onClick={() => setCerrar(true)}>Cerrar ticket</Button>
        </>} />

      {!soporte && !ingenieria && <Callout tone="neutral" className="mb-6">Vista de solo lectura: los tickets los atiende Soporte (BP-13).</Callout>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {hilo.map((m, i) => (
            <Card key={i} className={m.tipo === 'soporte' ? 'border-ink-300 bg-ink-50/50' : ''}>
              <div className="flex items-center justify-between border-b border-ink-150 px-4 py-2.5">
                <p className="text-sm font-medium text-ink-950">{m.autor} <span className="ml-1 text-xs font-normal text-ink-500">{m.tipo === 'soporte' ? '· Unburn' : `· ${ticket.cliente}`}</span>{m.interno && <Tag className="ml-2">Nota interna</Tag>}</p>
                <span className="text-xs text-ink-500" title={fechaHora(m.fecha)}>{haceCuanto(m.fecha)}</span>
              </div>
              <p className="whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-ink-800">{m.texto}</p>
            </Card>
          ))}
          {ticket.resolucion && <Callout tone="success" title="Resolución">{ticket.resolucion}</Callout>}
          {ticket.estado !== 'cerrado' && puedeResponder && (
            <Card className="p-3">
              <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={`Responder a ${ticket.abiertoPor}…`} className="border-0 shadow-none focus:ring-0" />
              <div className="mt-2 flex justify-end gap-2">
                <Button disabled={!texto.trim()} onClick={() => { actualizar({ mensajes: [...ticket.mensajes, { autor, tipo: 'soporte', fecha: ahoraIso(), texto, interno: true }] }); setTexto(''); toast('Nota interna guardada') }}>Nota interna</Button>
                <Button variant="primary" disabled={!texto.trim()} onClick={() => { actualizar({ mensajes: [...ticket.mensajes, { autor, tipo: 'soporte', fecha: ahoraIso(), texto }], asignadoA: ticket.asignadoA || empleado.id }); setTexto(''); toast('Respuesta enviada al cliente', 'exito', 'También le llega por email') }}>Responder</Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Detalles" />
            <div className="px-4 py-4"><KV cols={1} items={[
              ['Cliente', <Link key="c" to={`/bo/clientes?cliente=${ticket.orgId}`} className="underline decoration-ink-300 underline-offset-2">{ticket.cliente}</Link>],
              ['Abierto por', ticket.abiertoPor],
              ['Asignado a', nombreEmp(ticket.asignadoA)],
              ['Abierto', fechaHora(ticket.fecha)],
              ticket.incidenciaTecnica && ['Incidencia técnica', <span key="it"><Mono>{ticket.incidenciaTecnica}</Mono> · {datos.incidenciasTecnicas.find((x) => x.id === ticket.incidenciaTecnica)?.estado || 'en curso'}</span>],
            ]} /></div>
          </Card>
          <Card>
            <CardHeader title="Petición relacionada" subtitle="Metadatos del registro de auditoría" />
            {!ticket.peticionRelacionada ? <p className="px-4 py-4 text-sm text-ink-500">El cliente no adjuntó ninguna petición.</p> : (
              <div className="space-y-3 px-4 py-4">
                <Mono className="text-ink-950">{ticket.peticionRelacionada}</Mono>
                {evento ? <KV cols={1} items={[
                  ['Decisión', <span key="d" className="flex items-center gap-1.5"><Badge tone={DECISIONES[evento.decision].tono}>{DECISIONES[evento.decision].nombre}</Badge><Mono className="text-ink-500">{evento.codigo}</Mono></span>],
                  ['Motivo o regla', evento.motivo],
                  ['Fecha', fechaHora(evento.fecha)],
                  ['Agente · modelo', <Mono key="a">{evento.agente} · {evento.modeloUsado || evento.modeloPedido}</Mono>],
                  ['Tokens entrada / salida', `${numero(evento.tokens.entrada)} / ${numero(evento.tokens.salida)}`],
                  ['Coste real', euros(evento.costeReal)],
                  ['Versión de la configuración', <Mono key="v">{evento.versionConfig}</Mono>],
                ]} /> : ticket.metadatosPeticion ? <KV cols={1} items={[
                  ['Decisión', <span key="d" className="flex items-center gap-1.5"><Badge tone={DECISIONES[ticket.metadatosPeticion.decision].tono}>{DECISIONES[ticket.metadatosPeticion.decision].nombre}</Badge><Mono className="text-ink-500">{ticket.metadatosPeticion.codigo}</Mono></span>],
                  ['Motivo o regla', ticket.metadatosPeticion.motivo],
                  ['Fecha', fechaHora(ticket.metadatosPeticion.fecha)],
                  ['Agente · modelo', <Mono key="a">{ticket.metadatosPeticion.agente} · {ticket.metadatosPeticion.modelo}</Mono>],
                  ['Latencia', ticket.metadatosPeticion.latencia],
                  ['Versión de la configuración', <Mono key="v">{ticket.metadatosPeticion.version}</Mono>],
                ]} /> : <p className="text-sm text-ink-500">Fuera del periodo de retención del plan del cliente.</p>}
                <p className="flex items-center gap-1.5 rounded-md bg-ink-50 px-2.5 py-2 text-xs text-ink-500"><Lock className="h-3 w-3" /> Contenido no disponible: Unburn no guarda el texto de las peticiones.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <div className="mt-6"><Link to="/bo/tickets" className="text-sm text-ink-500 hover:text-ink-900">← Volver a los tickets</Link></div>

      {escalar && <EscalarModal ticket={ticket} onClose={() => setEscalar(false)} onEscalar={(f) => {
        const num = String(58 + datos.incidenciasTecnicas.length - 2).padStart(4, '0')
        const it = { id: `IT-${num}`, fecha: ahoraIso(), origen: `Ticket ${ticket.id}`, componente: f.componente, gravedad: f.gravedad, estado: 'en curso', clientesAfectados: 1 }
        mutar('incidenciasTecnicas', (l) => [it, ...l])
        actualizar({ estado: 'escalado', incidenciaTecnica: it.id, asignadoA: 'e_diego', mensajes: [...ticket.mensajes, { autor, tipo: 'soporte', fecha: ahoraIso(), texto: `Escalado a Ingeniería como ${it.id} (${f.componente}). ${f.nota}`.trim(), interno: true }] })
        setEscalar(false)
        toast(`Escalado a Ingeniería como ${it.id}`, 'exito', 'Lo recibe el equipo de guardia (BP-17)')
      }} />}
      {cerrar && <CerrarModal onClose={() => setCerrar(false)} onCerrar={(r) => { actualizar({ estado: 'cerrado', resolucion: r }); setCerrar(false); toast(`${ticket.id} cerrado`, 'exito', 'El cliente recibe la resolución por email') }} />}
    </>
  )
}

function EscalarModal({ ticket, onClose, onEscalar }) {
  const [f, setF] = useState({ componente: 'Gateway (AP-03)', gravedad: ticket.prioridad === 'alta' ? 'alta' : 'media', nota: '' })
  return (
    <Modal open onClose={onClose} title="Escalar a Ingeniería" description="Se abre una incidencia técnica (IC-27) para el equipo de guardia."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => onEscalar(f)}>Escalar</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Componente afectado"><Select value={f.componente} onChange={(e) => setF({ ...f, componente: e.target.value })}>
          {['Gateway (AP-03)', 'Motor de presupuestos (AP-04)', 'Servicio de grafo de autorización (AP-05)', 'Servicio de auditoría (AP-07)', 'Servicio de alertas (AP-10)', 'Servicio de facturación (AP-11)'].map((c) => <option key={c}>{c}</option>)}
        </Select></Field>
        <Field label="Gravedad"><Select value={f.gravedad} onChange={(e) => setF({ ...f, gravedad: e.target.value })}><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option></Select></Field>
        <Field label="Nota para Ingeniería" className="sm:col-span-2"><Textarea value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} placeholder="Qué has comprobado en los metadatos" /></Field>
      </div>
    </Modal>
  )
}

function CerrarModal({ onClose, onCerrar }) {
  const [r, setR] = useState('')
  return (
    <Modal open onClose={onClose} title="Cerrar ticket" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={r.trim().length < 10} onClick={() => onCerrar(r)}>Cerrar ticket</Button></>}>
      <Field label="Resolución" hint="Se envía al cliente"><Textarea autoFocus value={r} onChange={(e) => setR(e.target.value)} placeholder="Qué pasó y cómo se ha resuelto" /></Field>
    </Modal>
  )
}
