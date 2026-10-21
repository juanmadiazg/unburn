import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { decimal, fecha, fechaHora, haceCuanto, numero } from '../../lib/format'
import { ahoraIso } from '../../lib/tiempo'
import { Badge, Button, Callout, Card, CardHeader, ConfirmModal, DataTable, Drawer, Field, Input, KV, Modal, Mono, PageHeader, Progress, Select, Tabs, Textarea } from '../../components/ui'

const GRAVEDAD = { baja: 'gray', media: 'amber', alta: 'red', critica: 'red' }
const ESTADO_VERSION = { publicada: 'green', 'en despliegue gradual': 'blue', revertida: 'red', 'en pruebas': 'amber' }

/** BP-17 (incidencias técnicas, IC-27) y BP-16 (versiones, IC-28) desde la consola de back-office */
export default function Incidencias() {
  const { datos, mutar, empleado, toast, aplicar } = useApp()
  const ing = empleado.departamento.startsWith('Ingeniería')
  const legal = empleado.departamento.startsWith('Legal')
  const [tab, setTab] = useState('incidencias')
  const [selId, setSelId] = useState(null)
  const [nueva, setNueva] = useState(false)
  const [revertir, setRevertir] = useState(null)
  const sel = datos.incidenciasTecnicas.find((i) => i.id === selId)
  const p = datos.plataforma
  const act = (id, cambios, msg) => { mutar('incidenciasTecnicas', (l) => l.map((i) => (i.id === id ? { ...i, ...cambios } : i))); if (msg) toast(msg) }

  return (
    <>
      <PageHeader title="Incidencias técnicas" refs={['BP-16', 'BP-17', 'IC-27', 'IC-28', 'AP-16']}
        description="Fallos de la propia plataforma (no del tráfico del cliente, que va a Incidentes) y versiones publicadas. La observabilidad avisa al equipo de guardia; aquí se documenta."
        actions={ing && <Button variant="brand" icon={Plus} onClick={() => setNueva(true)}>Registrar incidencia</Button>} />

      <Card className="mb-6">
        <CardHeader title="Estado de la plataforma" subtitle={`${p.region} · plataforma de observabilidad (AP-16)`} />
        <div className="grid gap-px bg-ink-200 sm:grid-cols-2 xl:grid-cols-4">
          {[['Disponibilidad 30 días', `${decimal(p.disponibilidad30d)} %`, `objetivo ${decimal(p.metaDisponibilidad)} %`], ['Latencia añadida (p95)', `${p.latenciaAnadidaP95} ms`, `objetivo < ${p.metaLatencia} ms`], ['Cola de auditoría', numero(p.colaAuditoria), 'eventos pendientes'], ['Contadores de presupuestos', p.contadores, 'Redis frente a la base de datos']].map(([k, v, s]) => (
            <div key={k} className="bg-surface p-4"><p className="text-xs text-ink-500">{k}</p><p className="mt-1 text-lg font-semibold tabular-nums text-ink-950">{v}</p><p className="text-xs text-ink-400">{s}</p></div>
          ))}
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-ink-150 px-4 py-3">
          {p.componentes.map((c) => <li key={c.nombre} className="flex items-center gap-1.5 text-xs text-ink-700"><span className={`h-1.5 w-1.5 rounded-full ${c.estado === 'operativo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />{c.nombre}{c.estado !== 'operativo' && <span className="text-amber-700 dark:text-amber-400">· {c.estado}</span>}</li>)}
        </ul>
      </Card>

      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'incidencias', label: 'Incidencias', count: datos.incidenciasTecnicas.length }, { id: 'versiones', label: 'Versiones', count: datos.versiones.length }]} />

      {tab === 'incidencias' && (
        <DataTable rows={datos.incidenciasTecnicas} initialSort={{ id: 'fecha', dir: 'desc' }} onRowClick={(i) => setSelId(i.id)} search={(i) => `${i.id} ${i.componente} ${i.causa}`} searchPlaceholder="Buscar incidencia…"
          filters={[{ id: 'estado', label: 'Estado', options: [{ id: 'en curso', label: 'En curso' }, { id: 'resuelta', label: 'Resuelta' }], value: (i) => i.estado }]}
          columns={[
            { id: 'id', header: 'Incidencia', cell: (i) => <div><p className="text-ink-950">{i.componente}</p><Mono className="text-ink-400">{i.id}</Mono></div> },
            { id: 'grav', header: 'Gravedad', cell: (i) => <Badge tone={GRAVEDAD[i.gravedad]}>{i.gravedad[0].toUpperCase() + i.gravedad.slice(1)}</Badge> },
            { id: 'origen', header: 'Origen', cell: (i) => <span className="text-xs text-ink-600">{i.origen}</span> },
            { id: 'clientes', header: 'Clientes afectados', align: 'right', sort: (i) => i.clientesAfectados, cell: (i) => i.clientesAfectados },
            { id: 'estado', header: 'Estado', cell: (i) => <Badge tone={i.estado === 'resuelta' ? 'green' : 'amber'}>{i.estado === 'resuelta' ? 'Resuelta' : 'En curso'}</Badge> },
            { id: 'fecha', header: 'Inicio', align: 'right', sort: (i) => i.fecha, cell: (i) => <span className="text-ink-500" title={fechaHora(i.fecha)}>{haceCuanto(i.fecha)}</span> },
          ]} />
      )}

      {tab === 'versiones' && (
        <>
          <p className="mb-3 max-w-3xl text-sm text-ink-600">La plataforma de desarrollo prueba cada cambio, firma la versión y genera su SBOM. Legal revisa si crea obligaciones legales y Dirección aprueba la publicación (8.3); después se publica poco a poco y vuelve atrás si empeoran los indicadores (BP-16).</p>
          <DataTable rows={datos.versiones} rowKey={(v) => v.numero} initialSort={{ id: 'fecha', dir: 'desc' }}
            columns={[
              { id: 'n', header: 'Versión', cell: (v) => <div><Mono className="text-ink-950">{v.numero}</Mono><p className="max-w-[360px] truncate text-xs text-ink-500">{v.cambios}</p></div> },
              { id: 'estado', header: 'Estado', cell: (v) => <Badge tone={ESTADO_VERSION[v.estado]}>{v.estado[0].toUpperCase() + v.estado.slice(1)}</Badge> },
              { id: 'trafico', header: 'Tráfico', cell: (v) => <div className="w-28"><div className="mb-1 text-xs tabular-nums text-ink-500">{v.trafico} %</div><Progress value={v.trafico} tone={v.estado === 'revertida' ? 'red' : 'navy'} /></div> },
              { id: 'ind', header: 'p95 · errores', align: 'right', cell: (v) => <span className={v.indicadores.latenciaP95 >= 50 ? 'text-red-600' : 'text-ink-700'}>{v.indicadores.latenciaP95} ms · {decimal(v.indicadores.errores)} %</span> },
              { id: 'firma', header: 'Firma · SBOM', cell: (v) => <span className="text-xs text-ink-600">{v.firma} · {v.sbom}</span> },
              { id: 'legal', header: 'Revisión legal', cell: (v) => (v.revisionLegalHecha ? <Badge tone="green">Hecha</Badge> : legal ? <Button size="xs" onClick={() => { aplicar((d) => ({ ...d, versiones: d.versiones.map((x) => (x.numero === v.numero ? { ...x, revisionLegalHecha: true, revisionLegal: 'Sin obligaciones nuevas (revisado por Legal)' } : x)) })); toast(`Revisión legal de ${v.numero} completada`, 'exito', 'Pendiente de que Dirección apruebe la publicación') }}>Marcar revisada</Button> : <Badge tone="amber">Pendiente</Badge>) },
              { id: 'aprob', header: 'Aprobación', cell: (v) => (v.aprobadaPor ? <span className="text-xs text-ink-600">Dirección · {v.aprobadaPor}</span> : <Badge tone="amber">Pendiente de Dirección</Badge>) },
              { id: 'fecha', header: 'Fecha', align: 'right', sort: (v) => v.fecha, cell: (v) => <span className="text-ink-500">{fecha(v.fecha)}</span> },
              { id: 'acc', header: '', align: 'right', cell: (v) => v.estado === 'en pruebas' ? (ing && <Button size="xs" disabled={!v.aprobadaPor || !v.revisionLegalHecha} title={!v.revisionLegalHecha ? 'Falta la revisión de Legal' : !v.aprobadaPor ? 'Falta la aprobación de Dirección (8.3)' : undefined} onClick={() => { aplicar((d) => ({ ...d, versiones: d.versiones.map((x) => (x.numero === v.numero ? { ...x, estado: 'en despliegue gradual', trafico: 5 } : x)) })); toast(`${v.numero} publicada al 5 % del tráfico`) }}>Iniciar despliegue</Button>) : v.estado === 'en despliegue gradual' && ing && (
                <div className="flex justify-end gap-1">
                  <Button size="xs" variant="ghost" onClick={() => setRevertir(v)}>Revertir</Button>
                  <Button size="xs" onClick={() => { const t = v.trafico >= 50 ? 100 : 50; aplicar((d) => ({ ...d, versiones: d.versiones.map((x) => (x.numero === v.numero ? { ...x, trafico: t, estado: t === 100 ? 'publicada' : x.estado } : x)) })); toast(`${v.numero} al ${t} % del tráfico`, 'exito', 'Indicadores estables en la plataforma de observabilidad') }}>Avanzar al {v.trafico >= 50 ? 100 : 50} %</Button>
                </div>
              ) },
            ]} />
        </>
      )}

      <Drawer open={!!sel} onClose={() => setSelId(null)} title={sel?.componente} subtitle={sel && <Mono>{sel.id}</Mono>}
        footer={sel && sel.estado !== 'resuelta' && <>
          {(ing || legal) && sel.gravedad !== 'baja' && <Button disabled={!legal && !ing} onClick={() => act(sel.id, { notificadaReguladores: true }, 'Notificación preparada para el regulador (con Legal)')}>{sel.notificadaReguladores ? 'Reguladores notificados' : 'Notificar a reguladores'}</Button>}
          {ing && <Button onClick={() => act(sel.id, { clientesAvisados: true }, `Aviso enviado a ${sel.clientesAfectados} clientes afectados`)} disabled={sel.clientesAvisados || !sel.clientesAfectados}>{sel.clientesAvisados ? 'Clientes avisados' : 'Avisar a los clientes'}</Button>}
          {ing && <Button variant="primary" onClick={() => act(sel.id, { estado: 'resuelta', acciones: [...sel.acciones, 'Servicio recuperado y documentado'] }, `${sel.id} resuelta`)}>Marcar como resuelta</Button>}
        </>}>
        {sel && (
          <div className="space-y-5">
            <KV items={[
              ['Gravedad', <Badge key="g" tone={GRAVEDAD[sel.gravedad]}>{sel.gravedad}</Badge>], ['Estado', sel.estado], ['Inicio', fechaHora(sel.fecha)], ['Origen', sel.origen],
              ['Clientes afectados', sel.clientesAfectados], ['Clientes avisados', sel.clientesAvisados ? 'Sí' : 'No'], ['Notificada a reguladores', sel.notificadaReguladores ? 'Sí' : 'No'],
            ]} />
            <div><p className="text-xs text-ink-500">Causa</p><p className="mt-0.5 text-sm text-ink-900">{sel.causa}</p></div>
            <div>
              <p className="mb-2 text-xs text-ink-500">Acciones de recuperación</p>
              <ol className="space-y-1.5 text-sm text-ink-800">{sel.acciones.map((a, i) => <li key={i} className="flex gap-2"><span className="font-mono text-xs text-ink-400">{i + 1}.</span>{a}</li>)}</ol>
              {ing && sel.estado !== 'resuelta' && <AccionNueva onAnadir={(t) => act(sel.id, { acciones: [...sel.acciones, t] }, 'Acción añadida')} />}
            </div>
            {legal && <Callout tone="neutral">Legal decide con Ingeniería si una incidencia grave se notifica a los reguladores (AEPD, AESIA, Oficina Europea de IA) y, en clientes financieros, prepara la información para DORA.</Callout>}
            <p className="text-xs text-ink-400">Estos avisos no pasan por el Servicio de alertas, que solo avisa de problemas del tráfico del cliente (12.5).</p>
          </div>
        )}
      </Drawer>

      {nueva && <NuevaIncidencia onClose={() => setNueva(false)} onGuardar={(f) => {
        const n = `IT-${String(58 + datos.incidenciasTecnicas.filter((i) => i.id >= 'IT-0058').length).padStart(4, '0')}`
        mutar('incidenciasTecnicas', (l) => [{ id: n, fecha: ahoraIso(), origen: 'Registrada por el equipo de guardia', componente: f.componente, gravedad: f.gravedad, causa: f.causa || 'En investigación', acciones: [], clientesAfectados: Number(f.clientes) || 0, notificadaReguladores: false, clientesAvisados: false, estado: 'en curso' }, ...l])
        setNueva(false); toast(`${n} registrada`)
      }} />}
      <ConfirmModal open={!!revertir} onClose={() => setRevertir(null)} title={`Revertir ${revertir?.numero}`} confirmLabel="Revertir" onConfirm={() => { aplicar((d) => ({ ...d, versiones: d.versiones.map((x) => (x.numero === revertir.numero ? { ...x, trafico: 0, estado: 'revertida' } : x)) })); toast(`${revertir.numero} revertida`, 'aviso', 'Todo el tráfico vuelve a la versión anterior'); setRevertir(null) }}>
        Todo el tráfico volverá a la versión publicada anterior.
      </ConfirmModal>
    </>
  )
}

function AccionNueva({ onAnadir }) {
  const [t, setT] = useState('')
  return <div className="mt-3 flex gap-2"><Input value={t} onChange={(e) => setT(e.target.value)} placeholder="Nueva acción de recuperación" /><Button disabled={!t.trim()} onClick={() => { onAnadir(t); setT('') }}>Añadir</Button></div>
}

function NuevaIncidencia({ onClose, onGuardar }) {
  const [f, setF] = useState({ componente: 'Gateway (AP-03)', gravedad: 'media', causa: '', clientes: 0 })
  return (
    <Modal open onClose={onClose} title="Registrar incidencia técnica" footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => onGuardar(f)}>Registrar</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Componente"><Select value={f.componente} onChange={(e) => setF({ ...f, componente: e.target.value })}>{['Gateway (AP-03)', 'Motor de presupuestos (AP-04)', 'Servicio de auditoría (AP-07)', 'Servicio de alertas (AP-10)', 'Servicio de facturación (AP-11)', 'Proveedor de IA'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Gravedad"><Select value={f.gravedad} onChange={(e) => setF({ ...f, gravedad: e.target.value })}><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option></Select></Field>
        <Field label="Clientes afectados"><Input type="number" value={f.clientes} onChange={(e) => setF({ ...f, clientes: e.target.value })} /></Field>
        <Field label="Causa (si se conoce)" className="sm:col-span-2"><Textarea value={f.causa} onChange={(e) => setF({ ...f, causa: e.target.value })} className="min-h-[64px]" /></Field>
      </div>
    </Modal>
  )
}
