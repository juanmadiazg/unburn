import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Ban, Lock, Plus, RefreshCw } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { ESTADOS_CLAVE } from '../../lib/dominio'
import { aleatorio, ahoraIso, euros, fecha, fechaHora, haceCuanto, numero } from '../../lib/format'
import {
  Badge, Button, Callout, Card, CardHeader, Checkbox, ChipSelect, Cifra, ConfirmModal, CopyButton, DataTable, Drawer, Field, Input, KV, Modal, Mono, PageHeader, Select, Tag,
} from '../../components/ui'

const MODELOS_POR_PROVEEDOR = {
  OpenAI: ['gpt-4.1', 'gpt-4.1-mini', 'o4-mini'],
  Anthropic: ['claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-opus-4-1'],
}

const nuevaClaveCompleta = (entorno) => `ub_${entorno === 'test' ? 'test' : 'live'}_${aleatorio(4)}${aleatorio(36)}`
const huella = () => `${aleatorio(4).toLowerCase()}…${aleatorio(4).toLowerCase()}`

export default function Claves() {
  const { deOrg, plan, mutar, org, registrarCambio, toast, esAdmin } = useApp()
  const [params, setParams] = useSearchParams()
  const claves = deOrg('clavesVirtuales')
  const proveedores = deOrg('clavesProveedor')
  const agentes = deOrg('agentes')
  const [crear, setCrear] = useState(false)
  const [revelar, setRevelar] = useState(null) // { clave, completa, rotada }
  const [detalleId, setDetalleId] = useState(null)
  const [rotar, setRotar] = useState(null)
  const [revocar, setRevocar] = useState(null)
  const [proveedorModal, setProveedorModal] = useState(null)

  const activas = claves.filter((k) => k.estado === 'activa')
  const limite = plan.maxClavesVirtuales
  const enLimite = limite != null && activas.length >= limite
  const detalle = claves.find((k) => k.id === detalleId)

  // Enlaces profundos desde la paleta de comandos y otras pantallas
  useEffect(() => {
    if (params.get('nueva') && esAdmin && !enLimite) setCrear(true)
    if (params.get('clave')) setDetalleId(params.get('clave'))
    if (params.toString()) setParams({}, { replace: true })
  }, [params, setParams, esAdmin, enLimite])

  const crearClave = (form) => {
    const completa = nuevaClaveCompleta(form.entorno)
    const k = {
      id: `kv_${aleatorio(6)}`, orgId: org.id, nombre: form.nombre, tipo: form.tipo, prefijo: completa.slice(0, 12), huella: huella(),
      estado: 'activa', claveProveedorId: form.claveProveedorId, modelos: form.modelos, agentes: form.agentes, herramientasProveedor: [],
      politicaBucles: form.politicaBucles, politicaFallos: form.politicaFallos, modeloSustituto: form.modeloSustituto || null,
      maxEntrada: Number(form.maxEntrada), maxRespuesta: Number(form.maxRespuesta), sustituyeA: null,
      creada: ahoraIso().slice(0, 10), ultimoUso: null, gastoHoy: 0, gastoMes: 0, peticionesMes: 0,
    }
    mutar('clavesVirtuales', (l) => [...l, k])
    registrarCambio(`Clave ${k.nombre} creada`)
    setCrear(false)
    setRevelar({ clave: k, completa })
  }

  const confirmarRotacion = () => {
    const vieja = rotar
    const completa = nuevaClaveCompleta(vieja.prefijo.includes('test') ? 'test' : 'live')
    // La nueva hereda configuración, gasto del periodo, línea base y cadenas de respuestas (BP-05)
    const nueva = { ...vieja, id: `kv_${aleatorio(6)}`, prefijo: completa.slice(0, 12), huella: huella(), sustituyeA: vieja.id, creada: ahoraIso().slice(0, 10) }
    mutar('clavesVirtuales', (l) => [...l.map((k) => (k.id === vieja.id ? { ...k, estado: 'sustituida', gastoHoy: 0, gastoMes: 0, peticionesMes: 0 } : k)), nueva])
    registrarCambio(`Clave ${vieja.nombre} rotada`)
    setRotar(null)
    setDetalleId(null)
    setRevelar({ clave: nueva, completa, rotada: vieja })
  }

  const confirmarRevocacion = () => {
    mutar('clavesVirtuales', (l) => l.map((k) => (k.id === revocar.id ? { ...k, estado: 'revocada' } : k)))
    registrarCambio(`Clave ${revocar.nombre} revocada`)
    setRevocar(null)
    setDetalleId(null)
  }

  return (
    <>
      <PageHeader title="Claves virtuales" refs={['BP-05', 'OF-01', 'IC-07', 'IC-08', 'AP-02']}
        description="Cada equipo, agente o entorno usa su propia clave de Unburn, que se puede limitar, revocar o rotar sin tocar las demás."
        actions={<Button variant="brand" icon={Plus} requiereAdmin disabled={enLimite} onClick={() => setCrear(true)} title={enLimite ? `El plan ${plan.nombre} permite hasta ${limite} claves` : undefined}>Crear clave</Button>} />

      {limite != null && (
        <Callout tone={enLimite ? 'warn' : 'neutral'} className="mb-5" title={`${activas.length} de ${limite} claves del plan ${plan.nombre}`}
          actions={<a href="#/app/suscripcion" className="text-sm font-medium text-ink-950 hover:underline">Pasar a Pro</a>}>
          {enLimite ? 'Has llegado al máximo. Revoca una clave que no uses o pasa a Pro, que tiene claves ilimitadas.' : 'El plan Pro no tiene límite de claves.'}
        </Callout>
      )}

      <DataTable rows={claves} initialFilters={{ estado: 'activa' }} initialSort={{ id: 'mes', dir: 'desc' }}
        search={(k) => `${k.nombre} ${k.prefijo} ${k.agentes.join(' ')}`} searchPlaceholder="Buscar por nombre, prefijo o agente…"
        onRowClick={(k) => setDetalleId(k.id)}
        filters={[
          { id: 'estado', label: 'Estado', options: Object.entries(ESTADOS_CLAVE).map(([id, e]) => ({ id, label: e.nombre })), value: (k) => k.estado },
          { id: 'tipo', label: 'Tipo', options: [{ id: 'agente', label: 'Agente' }, { id: 'equipo', label: 'Equipo' }, { id: 'entorno', label: 'Entorno' }], value: (k) => k.tipo },
        ]}
        empty={{ title: 'Todavía no hay claves', description: 'Crea una clave para que tu aplicación empiece a pasar por Unburn.' }}
        columns={[
          { id: 'nombre', header: 'Nombre', sort: (k) => k.nombre, cell: (k) => <div><p className="text-ink-950">{k.nombre}</p><Mono className="text-ink-400">{k.prefijo}…</Mono></div> },
          { id: 'estado', header: 'Estado', cell: (k) => <Badge tone={ESTADOS_CLAVE[k.estado].tono}>{ESTADOS_CLAVE[k.estado].nombre}</Badge> },
          { id: 'tipo', header: 'Tipo', cell: (k) => <Tag>{k.tipo}</Tag> },
          { id: 'modelos', header: 'Modelos', cell: (k) => <span className="block max-w-[180px] truncate font-mono text-[11.5px] text-ink-600">{k.modelos.join(', ')}</span> },
          { id: 'agentes', header: 'Agentes', cell: (k) => (k.agentes.length ? <span className="block max-w-[180px] truncate text-xs text-ink-600">{k.agentes.join(', ')}</span> : <span className="text-xs text-ink-400">Sin lista</span>) },
          { id: 'bucles', header: 'Bucles', cell: (k) => <span className="text-xs text-ink-600">{k.politicaBucles === 'bloqueo' ? 'Bloquear' : 'Avisar'}</span> },
          { id: 'mes', header: 'Este mes', align: 'right', sort: (k) => k.gastoMes, cell: (k) => <Cifra valor={k.gastoMes} formato={(v) => euros(v)} /> },
          { id: 'uso', header: 'Último uso', align: 'right', sort: (k) => k.ultimoUso || '', cell: (k) => <span className="text-ink-500">{k.ultimoUso ? haceCuanto(k.ultimoUso) : 'Nunca'}</span> },
          { id: 'acc', header: '', align: 'right', cell: (k) => k.estado === 'activa' && (
            <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
              <Button size="xs" variant="ghost" icon={RefreshCw} requiereAdmin onClick={() => setRotar(k)}>Rotar</Button>
              <Button size="xs" variant="ghost" icon={Ban} requiereAdmin onClick={() => setRevocar(k)}>Revocar</Button>
            </div>
          ) },
        ]} />

      <Card className="mt-8">
        <CardHeader title="Claves de proveedor" subtitle="La clave real de cada proveedor de IA se guarda cifrada. Nadie puede volver a verla, tampoco el personal de Unburn."
          actions={<Button size="sm" icon={Plus} requiereAdmin onClick={() => setProveedorModal({ nueva: true })}>Añadir</Button>} />
        <ul className="divide-y divide-ink-100">
          {proveedores.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-950">{p.proveedor} <span className="text-ink-500">· {p.cuenta}</span></p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500"><Lock className="h-3 w-3" /> Cifrada · huella <Mono>{p.huella}</Mono> · sustituida por última vez el {fecha(p.ultimaRotacion)}</p>
              </div>
              <span className="text-xs tabular-nums text-ink-500">{claves.filter((k) => k.claveProveedorId === p.id && k.estado === 'activa').length} claves virtuales</span>
              <Button size="sm" requiereAdmin onClick={() => setProveedorModal(p)}>Sustituir clave real</Button>
            </li>
          ))}
        </ul>
      </Card>

      {crear && <CrearClaveModal onClose={() => setCrear(false)} onCrear={crearClave} proveedores={proveedores} agentes={agentes} />}
      {revelar && <RevelarClaveModal {...revelar} onClose={() => setRevelar(null)} />}

      <Modal open={!!rotar} onClose={() => setRotar(null)} title={`Rotar ${rotar?.nombre}`} description="Se emite una clave nueva y la actual deja de funcionar al momento."
        footer={<><Button onClick={() => setRotar(null)}>Cancelar</Button><Button variant="primary" icon={RefreshCw} onClick={confirmarRotacion}>Rotar clave</Button></>}>
        <p className="text-sm text-ink-700">La clave nueva hereda de la anterior:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>la configuración: modelos, agentes, herramientas y políticas;</li>
          <li>el gasto del periodo, para que los presupuestos sigan cuadrando;</li>
          <li>la línea base de consumo del sistema inmunológico;</li>
          <li>la propiedad de sus cadenas de respuestas.</li>
        </ul>
        <p className="mt-3 text-sm text-ink-500">Tu equipo tendrá que poner la clave nueva en el código. Solo se mostrará una vez.</p>
      </Modal>

      <ConfirmModal open={!!revocar} onClose={() => setRevocar(null)} onConfirm={confirmarRevocacion} title={`Revocar ${revocar?.nombre}`} confirmLabel="Revocar clave" palabra={revocar?.nombre}>
        Las peticiones con <Mono>{revocar?.prefijo}…</Mono> se rechazarán al momento con un 401. Las demás claves no se ven afectadas. Esta acción no se puede deshacer; las peticiones con claves revocadas siguen quedando en el registro de auditoría.
      </ConfirmModal>

      {proveedorModal && (
        <ProveedorModal p={proveedorModal} onClose={() => setProveedorModal(null)} onGuardar={(prov) => {
          if (proveedorModal.nueva) mutar('clavesProveedor', (l) => [...l, { id: `kp_${aleatorio(5)}`, orgId: org.id, proveedor: prov.proveedor, cuenta: prov.cuenta || '—', huella: huella(), fechaAlta: ahoraIso().slice(0, 10), ultimaRotacion: ahoraIso().slice(0, 10) }])
          else mutar('clavesProveedor', (l) => l.map((x) => (x.id === proveedorModal.id ? { ...x, huella: huella(), ultimaRotacion: ahoraIso().slice(0, 10) } : x)))
          setProveedorModal(null)
          toast('Clave real guardada cifrada', 'exito', 'Nadie podrá volver a verla. Las claves virtuales no cambian.')
        }} />
      )}

      <Drawer open={!!detalle} onClose={() => setDetalleId(null)} title={detalle?.nombre} subtitle={detalle && <Mono>{detalle.prefijo}…</Mono>}
        footer={detalle?.estado === 'activa' && esAdmin && <><Button icon={Ban} variant="danger-soft" onClick={() => setRevocar(detalle)}>Revocar</Button><Button icon={RefreshCw} onClick={() => setRotar(detalle)}>Rotar</Button></>}>
        {detalle && <DetalleClave key={detalle.id} clave={detalle} proveedores={proveedores} agentes={agentes} claves={claves} />}
      </Drawer>
    </>
  )
}

function CrearClaveModal({ onClose, onCrear, proveedores, agentes }) {
  const [f, setF] = useState({
    nombre: '', tipo: 'agente', entorno: 'live', claveProveedorId: proveedores[0]?.id, modelos: [], agentes: [],
    politicaBucles: 'aviso', politicaFallos: 'bloquear', modeloSustituto: '', maxEntrada: 32000, maxRespuesta: 4000,
  })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const proveedor = proveedores.find((p) => p.id === f.claveProveedorId)?.proveedor || 'OpenAI'
  const modelos = MODELOS_POR_PROVEEDOR[proveedor]
  const valido = /^[a-z0-9][a-z0-9-]{2,40}$/.test(f.nombre) && f.modelos.length
  return (
    <Modal open onClose={onClose} size="lg" title="Crear clave virtual" description="Recomendamos una clave por agente: la identidad del agente se basa en su clave (DEC-11)."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="brand" disabled={!valido} onClick={() => onCrear(f)}>Crear clave</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" hint="Minúsculas, números y guiones" className="sm:col-span-2"><Input autoFocus placeholder="prod-agente-ventas" value={f.nombre} onChange={(e) => set('nombre', e.target.value.toLowerCase())} /></Field>
        <Field label="Tipo"><Select value={f.tipo} onChange={(e) => set('tipo', e.target.value)}><option value="agente">Agente</option><option value="equipo">Equipo</option><option value="entorno">Entorno</option></Select></Field>
        <Field label="Entorno"><Select value={f.entorno} onChange={(e) => set('entorno', e.target.value)}><option value="live">Producción · ub_live_</option><option value="test">Pruebas · ub_test_</option></Select></Field>
        <Field label="Clave de proveedor" className="sm:col-span-2"><Select value={f.claveProveedorId} onChange={(e) => { set('claveProveedorId', e.target.value); set('modelos', []); set('modeloSustituto', '') }}>{proveedores.map((p) => <option key={p.id} value={p.id}>{p.proveedor} · {p.cuenta}</option>)}</Select></Field>
        <div className="sm:col-span-2"><p className="mb-1.5 text-xs font-medium text-ink-700">Modelos permitidos</p><ChipSelect mono options={modelos} value={f.modelos} onChange={(v) => set('modelos', v)} /></div>
        {agentes.length > 0 && <div className="sm:col-span-2"><p className="mb-1.5 text-xs font-medium text-ink-700">Agentes permitidos <span className="font-normal text-ink-400">· vacío = sin lista de agentes</span></p><ChipSelect mono options={agentes.map((a) => a.id)} value={f.agentes} onChange={(v) => set('agentes', v)} /></div>}
        <Field label="Si detecta un bucle" hint="Por defecto avisa; bloquear es opcional (DEC-07)"><Select value={f.politicaBucles} onChange={(e) => set('politicaBucles', e.target.value)}><option value="aviso">Avisar</option><option value="bloqueo">Bloquear (422)</option></Select></Field>
        <Field label="Si falla un componente interno" hint="Por defecto bloquea (DEC-08)"><Select value={f.politicaFallos} onChange={(e) => set('politicaFallos', e.target.value)}><option value="bloquear">Rechazar peticiones (503)</option><option value="dejar_pasar">Dejar pasar sin control</option></Select></Field>
        <Field label="Modelo sustituto" hint="El sistema inmunológico cambia a este modelo ante un consumo anómalo"><Select value={f.modeloSustituto} onChange={(e) => set('modeloSustituto', e.target.value)}><option value="">Ninguno</option>{modelos.map((m) => <option key={m}>{m}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Máx. entrada (tokens)"><Input type="number" value={f.maxEntrada} onChange={(e) => set('maxEntrada', e.target.value)} /></Field>
          <Field label="Máx. respuesta (tokens)"><Input type="number" value={f.maxRespuesta} onChange={(e) => set('maxRespuesta', e.target.value)} /></Field>
        </div>
      </div>
      {f.politicaFallos === 'dejar_pasar' && <Callout tone="warn" className="mt-4">Si falla un componente interno, las peticiones de esta clave pasarán sin comprobar presupuestos ni permisos.</Callout>}
    </Modal>
  )
}

function RevelarClaveModal({ clave, completa, rotada, onClose }) {
  const [guardada, setGuardada] = useState(false)
  return (
    <Modal open dismissable={false} onClose={onClose} title={rotada ? 'Clave rotada' : 'Clave creada'} description={`${clave.nombre} ya está activa en el Gateway.`}
      footer={<Button variant="primary" disabled={!guardada} onClick={onClose}>Hecho</Button>}>
      <Callout tone="warn" icon={AlertTriangle} title="Copia la clave ahora. No volverás a verla.">Unburn solo guarda su huella. Si la pierdes, tendrás que rotarla.</Callout>
      <div className="mt-4 flex items-center gap-2 rounded-md border border-ink-200 bg-ink-50 p-2 pl-3">
        <code className="flex-1 break-all font-mono text-[12.5px] text-ink-950">{completa}</code>
        <CopyButton text={completa} />
      </div>
      {rotada && <p className="mt-3 text-sm text-ink-600"><Mono>{rotada.prefijo}…</Mono> ha dejado de funcionar y queda como «sustituida».</p>}
      <p className="mt-3 text-xs text-ink-500">En el código solo cambian <Mono>base_url="https://gateway.unburn.eu/v1"</Mono> y la clave. Envía también <Mono>X-Unburn-Session</Mono> con el identificador de cada tarea.</p>
      <div className="mt-4 border-t border-ink-150 pt-4"><Checkbox checked={guardada} onChange={setGuardada} label="He guardado la clave en un lugar seguro" /></div>
    </Modal>
  )
}

function ProveedorModal({ p, onClose, onGuardar }) {
  const [f, setF] = useState({ proveedor: p.proveedor || 'OpenAI', cuenta: '', secreto: '' })
  return (
    <Modal open onClose={onClose} title={p.nueva ? 'Añadir clave de proveedor' : `Sustituir clave real de ${p.proveedor}`} description="Se cifra al guardarla y después nadie puede volver a verla."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" icon={Lock} disabled={f.secreto.length < 8} onClick={() => onGuardar(f)}>Guardar cifrada</Button></>}>
      <div className="space-y-4">
        {p.nueva && <Field label="Proveedor"><Select value={f.proveedor} onChange={(e) => setF({ ...f, proveedor: e.target.value })}><option>OpenAI</option><option>Anthropic</option></Select></Field>}
        {p.nueva && <Field label="Cuenta o proyecto al que se carga el gasto"><Input value={f.cuenta} onChange={(e) => setF({ ...f, cuenta: e.target.value })} placeholder="proyecto nexo-prod" /></Field>}
        <Field label="Clave real"><Input type="password" value={f.secreto} onChange={(e) => setF({ ...f, secreto: e.target.value })} placeholder="sk-…" autoComplete="off" /></Field>
      </div>
    </Modal>
  )
}

function DetalleClave({ clave, proveedores, agentes, claves }) {
  const { mutar, registrarCambio, esAdmin, plan } = useApp()
  const prov = proveedores.find((p) => p.id === clave.claveProveedorId)
  const editable = esAdmin && clave.estado === 'activa'
  const inicial = { agentes: clave.agentes, politicaBucles: clave.politicaBucles, politicaFallos: clave.politicaFallos }
  const [form, setForm] = useState(inicial)
  const cambiado = JSON.stringify(form) !== JSON.stringify(inicial)
  const guardar = () => {
    mutar('clavesVirtuales', (l) => l.map((k) => (k.id === clave.id ? { ...k, ...form } : k)))
    registrarCambio(`Clave ${clave.nombre} actualizada`)
  }
  const sustituye = claves.find((k) => k.id === clave.sustituyeA)
  return (
    <div className="space-y-6">
      <KV items={[
        ['Estado', <Badge key="e" tone={ESTADOS_CLAVE[clave.estado].tono}>{ESTADOS_CLAVE[clave.estado].nombre}</Badge>],
        ['Tipo', <span key="t" className="capitalize">{clave.tipo}</span>],
        ['Clave de proveedor', prov ? `${prov.proveedor} · ${prov.cuenta}` : '—'],
        ['Huella', <Mono key="h">{clave.huella}</Mono>],
        ['Creada', fecha(clave.creada)],
        ['Último uso', fechaHora(clave.ultimoUso)],
        ['Gasto de este mes', euros(clave.gastoMes)],
        ['Peticiones de este mes', numero(clave.peticionesMes)],
        ['Modelos permitidos', <span key="m" className="font-mono text-[12px]">{clave.modelos.join(', ')}</span>],
        ['Modelo sustituto', clave.modeloSustituto],
        ['Máx. entrada', `${numero(clave.maxEntrada)} tokens`],
        ['Máx. respuesta', `${numero(clave.maxRespuesta)} tokens`],
        ['Herramientas del proveedor', clave.herramientasProveedor.length ? clave.herramientasProveedor.join(', ') : 'Ninguna (denegadas por defecto)'],
        ['Cadenas de respuestas (IC-18)', `${numero(clave.cadenasRespuestas || 0)} conversaciones guardadas por el proveedor; solo esta clave puede continuarlas`],
        ['Peticiones sin sesión', `${clave.pctSinSesion ?? 0} %`],
        sustituye && ['Sustituye a', <span key="s">{sustituye.nombre} · <Mono>{sustituye.prefijo}…</Mono></span>],
      ]} />

      {clave.lineaBase && (
        <div className="border-t border-ink-150 pt-5">
          <p className="text-sm font-medium text-ink-950">Línea base de consumo (IC-19)</p>
          <p className="mb-3 mt-0.5 text-xs text-ink-500">Consumo normal de los últimos 7 días. El sistema inmunológico responde cuando se desvía más de tres veces su variabilidad.</p>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 text-sm">
            <div className="bg-surface p-3"><p className="text-xs text-ink-500">Euros por minuto</p><p className="mt-0.5 tabular-nums text-ink-950">{clave.lineaBase.eurosMin.toFixed(3).replace('.', ',')} € ± {clave.lineaBase.varEurosMin.toFixed(3).replace('.', ',')}</p></div>
            <div className="bg-surface p-3"><p className="text-xs text-ink-500">Tokens por minuto</p><p className="mt-0.5 tabular-nums text-ink-950">{numero(clave.lineaBase.tokensMin)} ± {numero(clave.lineaBase.varTokensMin)}</p></div>
          </div>
          {clave.lineaBase.endurecidoHasta && new Date(clave.lineaBase.endurecidoHasta) > new Date() && <Callout tone="warn" className="mt-3">Límites endurecidos hasta el {fechaHora(clave.lineaBase.endurecidoHasta)} tras un consumo anómalo (solo sobre la parte afectada).</Callout>}
        </div>
      )}

      <div className="border-t border-ink-150 pt-5">
        <p className="text-sm font-medium text-ink-950">Agentes de la clave</p>
        <p className="mb-3 mt-0.5 text-xs text-ink-500">Si varios agentes comparten clave, la cabecera <Mono>X-Unburn-Agent</Mono> solo se admite para estos (DEC-11).{!plan.escudoCompleto && ' En tu plan, las herramientas se autorizan a nivel de clave.'}</p>
        {agentes.length === 0 ? <p className="text-sm text-ink-500">Tu organización no tiene agentes declarados.</p>
          : <ChipSelect mono disabled={!editable} options={agentes.map((a) => a.id)} value={form.agentes} onChange={(v) => setForm({ ...form, agentes: v })} />}
      </div>

      <div className="grid gap-4 border-t border-ink-150 pt-5 sm:grid-cols-2">
        <Field label="Si detecta un bucle"><Select disabled={!editable} value={form.politicaBucles} onChange={(e) => setForm({ ...form, politicaBucles: e.target.value })}><option value="aviso">Avisar</option><option value="bloqueo">Bloquear (422)</option></Select></Field>
        <Field label="Si falla un componente interno"><Select disabled={!editable} value={form.politicaFallos} onChange={(e) => setForm({ ...form, politicaFallos: e.target.value })}><option value="bloquear">Rechazar (503)</option><option value="dejar_pasar">Dejar pasar sin control</option></Select></Field>
      </div>
      <div className="flex items-center justify-between rounded-md border border-dashed border-ink-300 px-3 py-2.5">
        <div><p className="text-sm text-ink-900">Proveedor alternativo si el principal falla</p><p className="text-xs text-ink-500">Arquitectura objetivo (OF-14): reenviar a otro proveedor, como Google.</p></div>
        <Badge tone="gray" dot={false}>Próximamente</Badge>
      </div>
      {editable && <div className="flex justify-end gap-2"><Button disabled={!cambiado} onClick={() => setForm(inicial)}>Descartar</Button><Button variant="primary" disabled={!cambiado} onClick={guardar}>Guardar cambios</Button></div>}
    </div>
  )
}
