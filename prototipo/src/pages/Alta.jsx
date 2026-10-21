import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { useApp } from '../store/AppStore'
import { inicioDe } from '../components/nav'
import { aleatorio } from '../lib/format'
import { Button, Callout, Checkbox, ChipSelect, CopyButton, Field, Input, Mono, Select, Toasts, cx } from '../components/ui'
import Logo from '../components/Logo'

const PASOS = ['Cuenta', 'Organización', 'Tratamiento de datos', 'Plan', 'Clave del proveedor', 'Primera clave virtual', 'Conexión']
const MODELOS = { OpenAI: ['gpt-4.1', 'gpt-4.1-mini', 'o4-mini'], Anthropic: ['claude-sonnet-4-5', 'claude-haiku-4-5'] }

/** Alta de autoservicio (BP-03): se completa en menos de 15 minutos sin pasar por un comercial */
export default function Alta() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { toast, persona } = useApp()
  const [paso, setPaso] = useState(0)
  const [f, setF] = useState({
    email: state?.email || '', nombre: state?.nombre || '', password: '', org: '', cif: '', zona: 'Europe/Madrid', dpa: false, plan: 'gratis',
    proveedor: 'OpenAI', cuenta: '', secreto: '', clave: 'prod-mi-agente', modelos: ['gpt-4.1-mini'],
  })
  const [claveCompleta] = useState(() => `ub_live_${aleatorio(4)}${aleatorio(36)}`)
  const [guardada, setGuardada] = useState(false)
  const [conexion, setConexion] = useState('esperando')
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  useEffect(() => {
    if (paso !== 6 || conexion !== 'comprobando') return
    const t = setTimeout(() => setConexion('ok'), 2200)
    return () => clearTimeout(t)
  }, [paso, conexion])

  const validos = [
    /.+@.+\..+/.test(f.email) && f.nombre.trim() && f.password.length >= 10,
    f.org.trim().length > 2 && /^[A-Z0-9]{8,9}$/i.test(f.cif),
    f.dpa,
    !!f.plan && f.plan !== 'enterprise',
    f.secreto.length >= 8,
    /^[a-z0-9][a-z0-9-]{2,40}$/.test(f.clave) && f.modelos.length > 0 && guardada,
    conexion === 'ok',
  ]

  const terminar = () => {
    toast('Organización creada', 'exito', 'Este prototipo vuelve ahora al panel de ejemplo')
    navigate(inicioDe(persona))
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex h-14 items-center justify-between border-b border-ink-200 px-6">
        <Logo />
        <div className="flex items-center gap-4 text-sm text-ink-500">
          <span className="hidden sm:inline">Alta en menos de 15 minutos</span>
          <Link to="/" className="text-ink-700 hover:text-ink-950">Salir</Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 md:grid-cols-[220px_minmax(0,1fr)]">
        <ol className="hidden space-y-1 md:block">
          {PASOS.map((p, i) => (
            <li key={p} className={cx('flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm', i === paso ? 'bg-ink-100 font-medium text-ink-950' : i < paso ? 'text-ink-700' : 'text-ink-400')}>
              <span className={cx('flex h-5 w-5 items-center justify-center rounded-full border text-2xs', i < paso ? 'border-navy bg-navy text-white' : i === paso ? 'border-brand-500 text-brand-600' : 'border-ink-300')}>{i < paso ? <Check className="h-3 w-3" /> : i + 1}</span>
              {p}
            </li>
          ))}
          <li className="pt-6 text-xs text-ink-400">Unburn guarda todos los datos en la UE y nunca guarda el texto de tus peticiones.</li>
        </ol>

        <div className="max-w-xl">
          <p className="text-xs text-ink-500">Paso {paso + 1} de {PASOS.length}</p>
          {paso === 0 && <Paso titulo="Crea tu cuenta" desc="Serás el administrador de la organización.">
            <Field label="Nombre y apellidos"><Input autoFocus value={f.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Laura Gómez" /></Field>
            <Field label="Email de trabajo"><Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="laura@empresa.es" /></Field>
            <Field label="Contraseña" hint="Mínimo 10 caracteres"><Input type="password" value={f.password} onChange={(e) => set('password', e.target.value)} /></Field>
          </Paso>}
          {paso === 1 && <Paso titulo="Tu organización" desc="Los datos fiscales aparecerán en las facturas.">
            <Field label="Razón social o nombre"><Input autoFocus value={f.org} onChange={(e) => set('org', e.target.value)} placeholder="Nexo Analytics S.L." /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CIF / NIF"><Input value={f.cif} onChange={(e) => set('cif', e.target.value.toUpperCase())} placeholder="B12345678" /></Field>
              <Field label="Zona horaria" hint="Para los presupuestos diarios"><Select value={f.zona} onChange={(e) => set('zona', e.target.value)}><option>Europe/Madrid</option><option>Atlantic/Canary</option><option>Europe/Lisbon</option></Select></Field>
            </div>
          </Paso>}
          {paso === 2 && <Paso titulo="Contrato de tratamiento de datos" desc="Unburn trata datos por cuenta de tu organización (RGPD, art. 28).">
            <div className="h-56 overflow-y-auto rounded-md border border-ink-200 bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-700">
              <p className="font-medium text-ink-950">Resumen</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>Unburn solo guarda metadatos de cada petición: quién la hizo, cuándo, cuánto costó y qué se decidió. Nunca el texto de las peticiones ni de las respuestas.</li>
                <li>Todo lo que se almacena se queda en la Unión Europea (región de Irlanda).</li>
                <li>La clave real de tu proveedor se guarda cifrada y nadie puede volver a verla, tampoco el personal de Unburn.</li>
                <li>El registro de auditoría se conserva según tu plan: 7 días (Gratis), 30 días (Pro) o 6 meses o más (Enterprise).</li>
                <li>Puedes exportar tus datos cuando quieras. Tras la baja se borran en 30 días, salvo facturas, agregados de gasto y sellos de auditoría.</li>
                <li>Subencargados: proveedor de cloud (UE), plataforma de pagos y plataforma de desarrollo. Te avisaremos si cambia alguno que trate tus datos.</li>
              </ul>
            </div>
            <Checkbox checked={f.dpa} onChange={(v) => set('dpa', v)} label="Acepto el contrato de tratamiento de datos en nombre de mi organización" />
          </Paso>}
          {paso === 3 && <Paso titulo="Elige un plan" desc="Puedes cambiarlo en cualquier momento.">
            {[
              ['gratis', 'Gratis', '0 €', '10.000 peticiones al mes · hasta 3 claves · alertas por email'],
              ['pro', 'Pro', '49 € / mes', '500.000 peticiones · claves ilimitadas · escudo completo · diagnóstico causal'],
              ['enterprise', 'Enterprise', 'A medida', 'Nube confidencial o despliegue privado · lo prepara Ventas'],
            ].map(([id, n, precio, d]) => (
              <button key={id} onClick={() => set('plan', id)} className={cx('flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left', f.plan === id ? 'border-navy ring-1 ring-navy' : 'border-ink-200 hover:border-ink-300')}>
                <span className={cx('mt-0.5 h-4 w-4 shrink-0 rounded-full border', f.plan === id ? 'border-[5px] border-navy' : 'border-ink-300')} />
                <span className="flex-1"><span className="flex justify-between text-sm font-medium text-ink-950">{n}<span className="font-normal text-ink-600">{precio}</span></span><span className="mt-0.5 block text-xs text-ink-500">{d}</span></span>
              </button>
            ))}
            {f.plan === 'enterprise' && <Callout tone="neutral" title="Enterprise se contrata con un comercial">Ventas prepara el alta junto con la revisión de seguridad y el contrato. Elige Gratis o Pro para empezar ya.</Callout>}
            {f.plan === 'pro' && <p className="text-xs text-ink-500">Al terminar el alta se abrirá la plataforma de pagos para registrar la tarjeta. Sus datos no llegan a Unburn.</p>}
          </Paso>}
          {paso === 4 && <Paso titulo="Clave de tu proveedor de IA" desc="La usará Unburn para reenviar tus peticiones. Tu código dejará de necesitarla.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Proveedor"><Select value={f.proveedor} onChange={(e) => { set('proveedor', e.target.value); set('modelos', []) }}><option>OpenAI</option><option>Anthropic</option></Select></Field>
              <Field label="Cuenta o proyecto (opcional)"><Input value={f.cuenta} onChange={(e) => set('cuenta', e.target.value)} placeholder="proyecto-produccion" /></Field>
            </div>
            <Field label="Clave real"><Input type="password" value={f.secreto} onChange={(e) => set('secreto', e.target.value)} placeholder={f.proveedor === 'OpenAI' ? 'sk-proj-…' : 'sk-ant-…'} autoComplete="off" /></Field>
            <p className="flex items-center gap-1.5 text-xs text-ink-500"><Lock className="h-3 w-3" /> Se cifra al guardarla. Nadie podrá volver a verla, tampoco el personal de Unburn.</p>
          </Paso>}
          {paso === 5 && <Paso titulo="Tu primera clave virtual" desc="Es la que pondrás en tu código en lugar de la clave real.">
            <Field label="Nombre" hint="Recomendamos una clave por agente o entorno"><Input value={f.clave} onChange={(e) => set('clave', e.target.value.toLowerCase())} /></Field>
            <div><p className="mb-1.5 text-xs font-medium text-ink-700">Modelos permitidos</p><ChipSelect mono options={MODELOS[f.proveedor]} value={f.modelos} onChange={(v) => set('modelos', v)} /></div>
            <Callout tone="warn" icon={AlertTriangle} title="Copia la clave ahora. Solo se muestra una vez.">Unburn solo guarda su huella.</Callout>
            <div className="flex items-center gap-2 rounded-md border border-ink-200 bg-ink-50 p-2 pl-3"><code className="flex-1 break-all font-mono text-[12.5px] text-ink-950">{claveCompleta}</code><CopyButton text={claveCompleta} /></div>
            <Checkbox checked={guardada} onChange={setGuardada} label="He guardado la clave en un lugar seguro" />
          </Paso>}
          {paso === 6 && <Paso titulo="Conecta tu aplicación" desc="Solo cambian dos cosas en tu código.">
            <pre className="overflow-x-auto rounded-md border border-ink-200 bg-ink-50 px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-800">{`from openai import OpenAI

client = OpenAI(
    base_url="https://gateway.unburn.eu/v1",   # antes: la del proveedor
    api_key="${claveCompleta.slice(0, 12)}…",           # antes: tu clave real
    default_headers={"X-Unburn-Session": task_id},
)`}</pre>
            <p className="text-xs text-ink-500">La cabecera <Mono>X-Unburn-Session</Mono> agrupa las peticiones de cada tarea. Sin ella, Unburn no puede detectar ni diagnosticar bucles. Si varios agentes comparten la clave, añade <Mono>X-Unburn-Agent</Mono>.</p>
            <div className="flex items-center gap-3 rounded-lg border border-ink-200 px-4 py-3">
              {conexion === 'esperando' && <><span className="h-2 w-2 rounded-full bg-ink-300" /><span className="flex-1 text-sm text-ink-700">Envía una petición de prueba desde tu aplicación.</span><Button size="sm" onClick={() => setConexion('comprobando')}>Comprobar conexión</Button></>}
              {conexion === 'comprobando' && <><Loader2 className="h-4 w-4 animate-spin text-ink-500" /><span className="text-sm text-ink-700">Esperando la primera petición…</span></>}
              {conexion === 'ok' && <><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="text-sm text-ink-900">Primera petición recibida · <Mono>{f.modelos[0] || 'gpt-4.1-mini'}</Mono> · 200 · 0,0021 € · 412 ms</span></>}
            </div>
          </Paso>}

          <div className="mt-8 flex items-center justify-between border-t border-ink-150 pt-5">
            <Button variant="ghost" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>Atrás</Button>
            {paso < PASOS.length - 1
              ? <Button variant="primary" disabled={!validos[paso]} onClick={() => setPaso(paso + 1)}>Continuar</Button>
              : <Button variant="brand" disabled={!validos[paso]} onClick={terminar}>Ir al panel</Button>}
          </div>
        </div>
      </div>
      <Toasts />
    </div>
  )
}

function Paso({ titulo, desc, children }) {
  return (
    <>
      <h1 className="mt-1 text-xl font-semibold tracking-[-0.015em] text-ink-950">{titulo}</h1>
      {desc && <p className="mt-1 text-sm text-ink-500">{desc}</p>}
      <div className="mt-6 space-y-4">{children}</div>
    </>
  )
}
