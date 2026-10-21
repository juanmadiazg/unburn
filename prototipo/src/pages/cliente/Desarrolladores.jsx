import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, KeyRound, Plus, RefreshCw, Send } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { aleatorio, fechaHora, haceCuanto } from '../../lib/format'
import { ahoraIso } from '../../lib/tiempo'
import {
  Badge, Button, Callout, Card, CardHeader, ConfirmModal, CopyButton, DataTable, Field, Input, Modal, Mono, PageHeader, Section, Segmented, Select, Table, Tabs, Td, Tag,
} from '../../components/ui'

const CODIGOS = [
  ['400', 'Petición no admitida: modelo no permitido, opción sin precio registrado o tamaño excesivo. También los rechazos de entrada del proveedor, tal cual.'],
  ['401', 'Clave virtual inválida o revocada.'],
  ['402', 'Presupuesto agotado, cuota agotada o tope de excedente alcanzado. No se arregla reintentando (DEC-06).'],
  ['403', 'Agente o delegación no permitidos, o herramienta prohibida (escudo MCP).'],
  ['422', 'Bucle detectado en una clave con política «bloquear».'],
  ['429', 'Solo exceso de velocidad o freno del sistema inmunológico. Las librerías lo reintentan solas.'],
  ['502', 'Fallo a medias del proveedor; se liquida con estimación.'],
  ['503', 'Fallo interno de Unburn con la política «bloquear» de la clave (DEC-08).'],
  ['504', 'Tiempo agotado esperando al proveedor.'],
]

const ENDPOINTS = [
  ['GET', '/keys', 'Listar claves virtuales', 'BP-05'], ['POST', '/keys', 'Crear clave (la completa solo en esta respuesta)', 'BP-05'], ['POST', '/keys/{id}/rotate', 'Rotar clave', 'BP-05'], ['POST', '/keys/{id}/revoke', 'Revocar clave', 'BP-05'],
  ['GET', '/budgets', 'Listar presupuestos', 'BP-06'], ['PUT', '/budgets/{id}', 'Cambiar límites', 'BP-06'], ['PUT', '/alert-channels/{id}', 'Configurar un canal de alertas', 'BP-06'],
  ['GET', '/authorization-graph', 'Grafo de autorización y caminos indirectos', 'BP-07'], ['PATCH', '/authorization-graph', 'Cambiar permisos y delegaciones', 'BP-07'],
  ['GET', '/spend?granularity=15m', 'Gasto por clave e intervalo', 'BP-10'], ['GET', '/incidents', 'Incidentes con su diagnóstico', 'BP-10'], ['POST', '/incidents/{id}/review', 'Marcar un incidente como revisado', 'BP-09'],
  ['GET', '/audit/events', 'Buscar en el registro', 'BP-11'], ['POST', '/audit/verify', 'Verificar el registro con los sellos', 'BP-11'], ['POST', '/exports', 'Exportar registro y configuración', 'BP-11'],
  ['GET', '/users', 'Usuarios del panel', 'BP-04'], ['GET', '/subscription', 'Plan, cuota y facturas', 'BP-03'],
]

export default function Desarrolladores() {
  const [tab, setTab] = useState('integracion')
  return (
    <>
      <PageHeader title="API y webhooks" refs={['2.3', 'AP-02', 'IF-01', 'IF-18', 'OF-12', 'DEC-11']}
        description="Todo lo que haces en el panel también se puede hacer desde código: el panel usa la misma API de administración." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'integracion', label: 'Conectar una aplicación' }, { id: 'api', label: 'API de administración' }, { id: 'tokens', label: 'Tokens de API' }, { id: 'webhooks', label: 'Webhooks' }]} />
      {tab === 'integracion' && <Integracion />}
      {tab === 'api' && <ApiAdmin />}
      {tab === 'tokens' && <Tokens />}
      {tab === 'webhooks' && <Webhooks />}
    </>
  )
}

function Integracion() {
  const { deOrg } = useApp()
  const [lenguaje, setLenguaje] = useState('python')
  const [proveedor, setProveedor] = useState('openai')
  const clave = deOrg('clavesVirtuales').find((k) => k.estado === 'activa')
  const pref = clave ? `${clave.prefijo}…` : 'ub_live_…'
  const codigo = {
    python: proveedor === 'openai' ? `from openai import OpenAI

client = OpenAI(
    base_url="https://gateway.unburn.eu/v1",
    api_key=os.environ["UNBURN_KEY"],  # ${pref}
)

respuesta = client.responses.create(
    model="gpt-4.1-mini",
    input="Resume este ticket…",
    extra_headers={
        "X-Unburn-Session": tarea.id,       # agrupa la tarea: detección de bucles
        "X-Unburn-Agent": "agente-soporte", # solo si varios agentes comparten clave
    },
)` : `import anthropic

client = anthropic.Anthropic(
    base_url="https://gateway.unburn.eu",
    api_key=os.environ["UNBURN_KEY"],  # ${pref}
)

mensaje = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "…"}],
    extra_headers={"X-Unburn-Session": tarea.id},
)`,
    node: proveedor === 'openai' ? `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://gateway.unburn.eu/v1',
  apiKey: process.env.UNBURN_KEY, // ${pref}
  defaultHeaders: { 'X-Unburn-Session': tarea.id },
})

const respuesta = await client.responses.create({ model: 'gpt-4.1-mini', input: '…' })` : `import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  baseURL: 'https://gateway.unburn.eu',
  apiKey: process.env.UNBURN_KEY, // ${pref}
  defaultHeaders: { 'X-Unburn-Session': tarea.id },
})

const mensaje = await client.messages.create({ model: 'claude-sonnet-4-5', max_tokens: 1024, messages: [{ role: 'user', content: '…' }] })`,
    curl: proveedor === 'openai' ? `curl https://gateway.unburn.eu/v1/responses \\
  -H "Authorization: Bearer $UNBURN_KEY" \\
  -H "X-Unburn-Session: tarea-4821" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "gpt-4.1-mini", "input": "…"}'` : `curl https://gateway.unburn.eu/v1/messages \\
  -H "x-api-key: $UNBURN_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "X-Unburn-Session: tarea-4821" \\
  -d '{"model": "claude-sonnet-4-5", "max_tokens": 1024, "messages": [{"role": "user", "content": "…"}]}'`,
  }[lenguaje]
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader title="Solo cambian la dirección y la clave" subtitle="Usa el SDK oficial de tu proveedor; no hace falta ninguna librería de Unburn"
            actions={<><Segmented value={proveedor} onChange={setProveedor} options={[{ id: 'openai', label: 'OpenAI' }, { id: 'anthropic', label: 'Anthropic' }]} /><Segmented value={lenguaje} onChange={setLenguaje} options={[{ id: 'python', label: 'Python' }, { id: 'node', label: 'Node' }, { id: 'curl', label: 'curl' }]} /><CopyButton text={codigo} /></>} />
          <pre className="overflow-x-auto bg-ink-50 px-4 py-4 font-mono text-[12px] leading-relaxed text-ink-800" data-codigo={lenguaje}>{codigo}</pre>
        </Card>
        <Section title="Códigos de respuesta" description="Cada rechazo lleva un mensaje con el motivo y la regla aplicada">
          <Card><Table head={['Código', 'Cuándo']}>{CODIGOS.map(([c, d]) => <tr key={c}><Td className="w-20"><Mono className="text-ink-950">{c}</Mono></Td><Td className="text-ink-700">{d}</Td></tr>)}</Table></Card>
        </Section>
      </div>
      <div className="space-y-4">
        <Card className="p-4">
          <p className="text-sm font-medium text-ink-950">Cabeceras recomendadas</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div><dt><Mono className="text-ink-950">X-Unburn-Session</Mono></dt><dd className="mt-0.5 text-ink-600">Identificador de la tarea. Agrupa las peticiones en una sesión: sin ella Unburn trabaja petición a petición y no puede detectar ni diagnosticar bucles.</dd></div>
            <div><dt><Mono className="text-ink-950">X-Unburn-Agent</Mono></dt><dd className="mt-0.5 text-ink-600">Nombre del agente. Solo se admite si varios agentes comparten la clave y está en su lista (DEC-11). Lo recomendable es una clave por agente.</dd></div>
          </dl>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-ink-950">Cabeceras que devuelve Unburn</p>
          <ul className="mt-2 space-y-1.5 text-xs text-ink-600">
            <li><Mono className="text-ink-900">X-Unburn-Request-Id</Mono> · para citarla en un ticket</li>
            <li><Mono className="text-ink-900">X-Unburn-Decision</Mono> · permitida, bloqueada, frenada o modelo sustituido</li>
            <li><Mono className="text-ink-900">X-Unburn-Loop-Warning</Mono> · bucle detectado en modo aviso</li>
            <li><Mono className="text-ink-900">X-Unburn-Tools-Removed</Mono> · herramientas quitadas por el escudo</li>
          </ul>
        </Card>
        <Card className="p-4 text-sm text-ink-600">
          <p className="font-medium text-ink-950">APIs admitidas</p>
          <p className="mt-1.5">OpenAI Chat Completions y Responses, y Anthropic Messages, con streaming. Otros proveedores, como Google, llegarán con la arquitectura objetivo.</p>
          <Link to="/app/probador" className="mt-3 inline-block text-xs font-medium text-ink-950 hover:underline">Probar una petición en el probador →</Link>
        </Card>
      </div>
    </div>
  )
}

function ApiAdmin() {
  const ejemplo = `curl -X PUT https://api.unburn.eu/admin/v1/budgets/pre_chatbot_dia \\
  -H "Authorization: Bearer $UNBURN_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"limite_blando": 25, "limite_duro": 30}'

# 200 OK · se aplica en el Gateway al momento
{ "id": "pre_chatbot_dia", "version_config": "cfg-v49", ... }`
  return (
    <div className="space-y-6">
      <Callout tone="neutral" title="https://api.unburn.eu/admin/v1">Autenticación con un token de API (pestaña «Tokens de API»). Cada operación comprueba el rol del token y los límites del plan, y registra el cambio con su versión de configuración en el registro de auditoría (IF-20).</Callout>
      <Card>
        <Table head={['Método', 'Ruta', 'Qué hace', 'Proceso']}>
          {ENDPOINTS.map(([m, r, d, bp]) => (
            <tr key={m + r}><Td className="w-20"><Tag mono>{m}</Tag></Td><Td><Mono className="text-ink-950">{r}</Mono></Td><Td className="text-ink-700">{d}</Td><Td className="text-xs text-ink-500">{bp}</Td></tr>
          ))}
        </Table>
      </Card>
      <Card className="overflow-hidden"><CardHeader title="Ejemplo: cambiar un presupuesto desde código" actions={<CopyButton text={ejemplo} />} /><pre className="overflow-x-auto bg-ink-50 px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-800">{ejemplo}</pre></Card>
    </div>
  )
}

function Tokens() {
  const { deOrg, mutar, org, usuario, toast, esAdmin } = useApp()
  const [crear, setCrear] = useState(false)
  const [nuevo, setNuevo] = useState(null)
  const [revocar, setRevocar] = useState(null)
  const [f, setF] = useState({ nombre: '', alcance: 'lectura' })
  const tokens = deOrg('tokensApi')
  return (
    <>
      <DataTable rows={tokens} search={(t) => t.nombre} searchPlaceholder="Buscar token…" initialSort={{ id: 'uso', dir: 'desc' }}
        toolbar={<Button size="sm" variant="brand" icon={Plus} requiereAdmin onClick={() => setCrear(true)}>Crear token</Button>}
        empty={{ title: 'Sin tokens de API', description: 'Crea uno para configurar Unburn desde Terraform, CI o tus scripts.' }}
        columns={[
          { id: 'nombre', header: 'Nombre', sort: (t) => t.nombre, cell: (t) => <div><p className="text-ink-950">{t.nombre}</p><Mono className="text-ink-400">{t.prefijo}…</Mono></div> },
          { id: 'alcance', header: 'Alcance', cell: (t) => <Tag>{t.alcance === 'administracion' ? 'Administración' : 'Solo lectura'}</Tag> },
          { id: 'estado', header: 'Estado', cell: (t) => <Badge tone={t.estado === 'activo' ? 'green' : 'red'}>{t.estado === 'activo' ? 'Activo' : 'Revocado'}</Badge> },
          { id: 'por', header: 'Creado por', cell: (t) => <span className="text-ink-600">{t.creadoPor}</span> },
          { id: 'uso', header: 'Último uso', align: 'right', sort: (t) => t.ultimoUso || '', cell: (t) => <span className="text-ink-500">{t.ultimoUso ? haceCuanto(t.ultimoUso) : 'Nunca'}</span> },
          { id: 'acc', header: '', align: 'right', cell: (t) => t.estado === 'activo' && <Button size="xs" variant="ghost" requiereAdmin onClick={() => setRevocar(t)}>Revocar</Button> },
        ]} />
      {!esAdmin && <p className="mt-3 text-xs text-ink-500">Los tokens los crea un administrador.</p>}
      <Modal open={crear} onClose={() => setCrear(false)} title="Crear token de API" footer={<><Button onClick={() => setCrear(false)}>Cancelar</Button><Button variant="primary" disabled={!f.nombre.trim()} onClick={() => {
        const completo = `ub_${f.alcance === 'lectura' ? 'read' : 'admin'}_${aleatorio(4)}${aleatorio(32)}`
        mutar('tokensApi', (l) => [...l, { id: `tok_${aleatorio(5)}`, orgId: org.id, nombre: f.nombre, prefijo: completo.slice(0, f.alcance === 'lectura' ? 12 : 13), alcance: f.alcance, creado: ahoraIso().slice(0, 10), ultimoUso: null, creadoPor: `${usuario.nombre} ${usuario.apellidos.split(' ')[0]}`, estado: 'activo' }])
        setCrear(false); setNuevo(completo); setF({ nombre: '', alcance: 'lectura' })
      }}>Crear</Button></>}>
        <div className="space-y-4">
          <Field label="Nombre"><Input autoFocus value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="terraform-produccion" /></Field>
          <Field label="Alcance" hint="Solo lectura no puede cambiar la configuración"><Select value={f.alcance} onChange={(e) => setF({ ...f, alcance: e.target.value })}><option value="lectura">Solo lectura</option><option value="administracion">Administración</option></Select></Field>
        </div>
      </Modal>
      <Modal open={!!nuevo} onClose={() => setNuevo(null)} title="Token creado" footer={<Button variant="primary" onClick={() => setNuevo(null)}>Hecho</Button>}>
        <Callout tone="warn" icon={AlertTriangle} title="Cópialo ahora. No volverás a verlo." />
        <div className="mt-4 flex items-center gap-2 rounded-md border border-ink-200 bg-ink-50 p-2 pl-3"><KeyRound className="h-4 w-4 text-ink-400" /><code className="flex-1 break-all font-mono text-[12.5px] text-ink-950">{nuevo}</code><CopyButton text={nuevo || ''} /></div>
      </Modal>
      <ConfirmModal open={!!revocar} onClose={() => setRevocar(null)} title={`Revocar ${revocar?.nombre}`} confirmLabel="Revocar token" palabra={revocar?.nombre}
        onConfirm={() => { mutar('tokensApi', (l) => l.map((x) => (x.id === revocar.id ? { ...x, estado: 'revocado' } : x))); toast('Token revocado', 'exito', 'Las llamadas con él recibirán 401'); setRevocar(null) }}>
        Los scripts que lo usen dejarán de funcionar al momento.
      </ConfirmModal>
    </>
  )
}

function Webhooks() {
  const { deOrg, aplicar, toast, plan, org } = useApp()
  const canales = deOrg('canales').filter((c) => c.tipo === 'webhook')
  const entregas = deOrg('entregasWebhook')
  const [secreto, setSecreto] = useState(`whsec_${aleatorio(24)}`)
  const payload = `POST ${canales[0]?.destino || 'https://tu-servidor/hooks/unburn'}
X-Unburn-Signature: t=1761058000,v1=5d1f…a9c2
Content-Type: application/json

{
  "type": "incident.created",
  "incident": {
    "id": "inc_R4t8Wm", "kind": "loop", "virtual_key": "prod-equipo-research",
    "session": "ses_7Hq2Lw", "response": "blocked_422",
    "cost_eur": 17.07, "saved_eur": { "min": 96, "max": 158 },
    "url": "https://app.unburn.eu/incidentes/inc_R4t8Wm"
  }
}`
  if (!plan.canalesAlerta.includes('webhook')) return <Callout tone="neutral" title="Los webhooks están disponibles en el plan Pro" actions={<Link to="/app/suscripcion" className="text-sm font-medium text-ink-950 hover:underline">Ver planes</Link>}>En el plan Gratis las alertas solo llegan por email.</Callout>
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Destinos" subtitle="Se configuran como canales de alerta" actions={<Link to="/app/alertas"><Button size="sm">Gestionar canales</Button></Link>} />
        {canales.length === 0 ? <p className="px-4 py-6 text-sm text-ink-500">No tienes ningún webhook configurado.</p> : (
          <ul className="divide-y divide-ink-100">
            {canales.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1"><Mono className="text-ink-950">{c.destino}</Mono><p className="mt-0.5 text-xs text-ink-500">Eventos: {c.avisos.join(', ')}</p></div>
                <Badge tone={c.activo ? 'green' : 'gray'}>{c.activo ? 'Activo' : 'En pausa'}</Badge>
                <Button size="sm" icon={Send} onClick={() => { aplicar((d) => ({ ...d, entregasWebhook: [{ id: `whd_${aleatorio(5)}`, orgId: org.id, fecha: ahoraIso(), evento: 'test.ping', estado: c.activo ? 200 : 0, intentos: 1, duracion: 84 }, ...d.entregasWebhook] })); toast(c.activo ? 'Evento de prueba entregado (200)' : 'El canal está en pausa', c.activo ? 'exito' : 'aviso') }}>Enviar prueba</Button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-150 px-4 py-3 text-sm">
          <span className="text-ink-600">Secreto de firma</span><Mono className="text-ink-950">{secreto.slice(0, 10)}••••••••••••</Mono>
          <Button size="xs" variant="ghost" icon={RefreshCw} requiereAdmin onClick={() => { setSecreto(`whsec_${aleatorio(24)}`); toast('Secreto rotado', 'exito', 'El anterior sigue siendo válido 24 h') }}>Rotar</Button>
        </div>
      </Card>
      <Section title="Entregas recientes">
        <DataTable rows={entregas} pageSize={6} initialSort={{ id: 'fecha', dir: 'desc' }}
          columns={[
            { id: 'evento', header: 'Evento', cell: (e) => <Mono className="text-ink-950">{e.evento}</Mono> },
            { id: 'estado', header: 'Respuesta', cell: (e) => <Badge tone={e.estado >= 200 && e.estado < 300 ? 'green' : 'red'}>{e.estado || 'sin envío'}</Badge> },
            { id: 'intentos', header: 'Intentos', align: 'right', cell: (e) => e.intentos },
            { id: 'duracion', header: 'Duración', align: 'right', cell: (e) => `${e.duracion} ms` },
            { id: 'fecha', header: 'Fecha', align: 'right', sort: (e) => e.fecha, cell: (e) => <span className="text-ink-500" title={fechaHora(e.fecha)}>{haceCuanto(e.fecha)}</span> },
            { id: 'r', header: '', align: 'right', cell: (e) => e.estado >= 300 && <Button size="xs" variant="ghost" onClick={() => toast('Reenviado', 'exito', `${e.evento} · 200 OK`)}>Reenviar</Button> },
          ]} />
      </Section>
      <Card className="overflow-hidden"><CardHeader title="Ejemplo de entrega" subtitle="Verifica la firma HMAC-SHA256 con tu secreto antes de procesarla" actions={<CopyButton text={payload} />} /><pre className="overflow-x-auto bg-ink-50 px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-800">{payload}</pre></Card>
    </div>
  )
}
