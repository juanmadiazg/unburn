import { Component, Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, Check, CheckCheck, ChevronsUpDown, CircleUser, Keyboard, Loader2, LogOut, Menu, Monitor, Moon, Pause, Play, Plus, RotateCcw,
  Search, Settings, ShieldAlert, Sun, X,
} from 'lucide-react'
import { ETIQUETAS, NAV_CLIENTE, inicioDe, navBackoffice, puedeAcceder } from './nav'
import { PERSONAS, useApp } from '../store/AppStore'
import { Button, EmptyState, Kbd, Modal, PageSkeleton, PlanBadge, PuntoVivo, Segmented, Toasts, Toggle, Tooltip, cx } from './ui'
import Logo from './Logo'
import CommandPalette from './CommandPalette'
import { haceCuanto } from '../lib/format'
import { caminosIndirectos } from '../lib/dominio'
import { recomendacionesPendientes } from '../lib/recomendaciones'
import { ESCENARIOS } from '../sim/escenarios'

export { inicioDe }

function useFuera(ref, cerrar) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && cerrar()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, cerrar])
}

function Desplegable({ abierto, children, className }) {
  if (!abierto) return null
  return <div className={cx('absolute z-50 mt-1.5 rounded-lg bg-surface p-1 shadow-pop animate-slide-in', className)}>{children}</div>
}
const TituloMenu = ({ children }) => <p className="px-2 pb-1 pt-2 text-2xs font-medium uppercase tracking-wide text-ink-400">{children}</p>

// ------------------------------------------------------------------ selector de la demo
function MenuDemo() {
  const { persona, cambiarPersona, reiniciar, mostrarRefs, alternarRefs, lanzarEscenario, escenario, esCliente } = useApp()
  const [abierto, setAbierto] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)
  useFuera(ref, () => setAbierto(false))
  const elegir = (p) => { cambiarPersona(p.id); setAbierto(false); navigate(inicioDe(p)) }
  const grupos = [['Cliente · Panel web (AP-01)', PERSONAS.filter((p) => p.tipo === 'cliente')], ['Unburn · Back-office (AP-12)', PERSONAS.filter((p) => p.tipo === 'backoffice')]]
  const enCurso = escenario?.estado === 'en curso'
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAbierto(!abierto)} data-demo className="flex h-8 items-center gap-2 rounded-md border border-dashed border-ink-300 bg-surface pl-2 pr-1.5 text-sm hover:border-ink-400" aria-haspopup="menu">
        <span className="text-2xs font-semibold uppercase tracking-wide text-brand-600">Demo</span>
        <span className="hidden max-w-[200px] truncate text-ink-800 md:inline">{persona.etiqueta}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-ink-400" />
      </button>
      <Desplegable abierto={abierto} className="right-0 max-h-[80vh] w-[360px] overflow-y-auto">
        {grupos.map(([titulo, lista]) => (
          <div key={titulo}>
            <TituloMenu>{titulo}</TituloMenu>
            {lista.map((p) => (
              <button key={p.id} onClick={() => elegir(p)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-ink-100">
                <span className="min-w-0 flex-1"><span className="block truncate text-sm text-ink-900">{p.etiqueta}</span><span className="block truncate text-xs text-ink-500">{p.detalle}</span></span>
                {p.id === persona.id && <Check className="h-4 w-4 text-ink-900" />}
              </button>
            ))}
          </div>
        ))}
        <div className="mt-1 border-t border-ink-150">
          <TituloMenu>Escenarios de demostración</TituloMenu>
          {!esCliente && <p className="px-2 pb-1 text-xs text-ink-500">Cambia a un usuario de cliente para lanzarlos.</p>}
          {ESCENARIOS.map((e) => (
            <button key={e.id} disabled={!esCliente || enCurso} onClick={() => { setAbierto(false); lanzarEscenario(e.id) }} data-escenario={e.id}
              className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-50">
              <Play className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-500" />
              <span className="min-w-0"><span className="block text-sm text-ink-900">{e.titulo}</span><span className="block text-xs text-ink-500">{e.refs}</span></span>
            </button>
          ))}
        </div>
        <div className="mt-1 border-t border-ink-150 py-1">
          <div className="flex items-center justify-between px-2 py-1.5 text-sm text-ink-700">Mostrar referencias al documento <Toggle checked={mostrarRefs} onChange={alternarRefs} label="Mostrar referencias" /></div>
          <Link to="/" onClick={() => setAbierto(false)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-100"><Monitor className="h-3.5 w-3.5" /> Web pública y precios</Link>
          <Link to="/alta" onClick={() => setAbierto(false)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-100"><Plus className="h-3.5 w-3.5" /> Alta de cliente (onboarding)</Link>
          <button onClick={() => { reiniciar(); setAbierto(false) }} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-100"><RotateCcw className="h-3.5 w-3.5" /> Restablecer datos de ejemplo</button>
        </div>
      </Desplegable>
    </div>
  )
}

// ------------------------------------------------------------------ indicador «En directo»
function EnDirecto() {
  const { sim, setSim } = useApp()
  return (
    <div className="flex h-8 items-center rounded-md border border-ink-200 bg-surface text-xs">
      <Tooltip texto={sim.activo ? 'El Gateway atiende tráfico simulado. Pulsa para pausar (Espacio).' : 'Simulación en pausa. Pulsa para reanudar.'} lado="abajo">
        <button onClick={() => setSim({ activo: !sim.activo })} data-en-directo className="flex h-full items-center gap-2 rounded-l-md px-2.5 hover:bg-ink-50" aria-label={sim.activo ? 'Pausar la simulación' : 'Reanudar la simulación'}>
          <PuntoVivo activo={sim.activo} />
          <span className="hidden font-medium text-ink-800 sm:inline">{sim.activo ? 'En directo' : 'En pausa'}</span>
          {sim.activo ? <Pause className="h-3 w-3 text-ink-400" /> : <Play className="h-3 w-3 text-ink-400" />}
        </button>
      </Tooltip>
      <div className="h-4 w-px bg-ink-200" />
      {[1, 10].map((v) => (
        <button key={v} onClick={() => setSim({ velocidad: v })} className={cx('h-full px-2 tabular-nums', sim.velocidad === v ? 'font-semibold text-ink-950' : 'text-ink-400 hover:text-ink-700', v === 10 && 'rounded-r-md')} aria-pressed={sim.velocidad === v}>{v}×</button>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ centro de notificaciones
function Campana() {
  const { notificaciones, marcarLeidas, esCliente } = useApp()
  const [abierto, setAbierto] = useState(false)
  const [filtro, setFiltro] = useState('todas')
  const navigate = useNavigate()
  const ref = useRef(null)
  useFuera(ref, () => setAbierto(false))
  const sinLeer = notificaciones.filter((n) => !n.leida).length
  const lista = [...notificaciones].sort((a, b) => b.fecha.localeCompare(a.fecha)).filter((n) => filtro === 'todas' || !n.leida).slice(0, 8)
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAbierto(!abierto)} data-campana className="relative flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900" aria-label={`Notificaciones (${sinLeer} sin leer)`}>
        <Bell className="h-4 w-4" />
        {sinLeer > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">{sinLeer > 9 ? '9+' : sinLeer}</span>}
      </button>
      <Desplegable abierto={abierto} className="right-0 w-[400px] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b border-ink-150 px-3.5 py-2.5">
          <p className="text-sm font-medium text-ink-950">Notificaciones</p>
          <div className="flex items-center gap-2">
            <Segmented value={filtro} onChange={setFiltro} options={[{ id: 'todas', label: 'Todas' }, { id: 'sin', label: sinLeer ? `Sin leer · ${sinLeer}` : 'Sin leer' }]} />
            <Tooltip texto="Marcar todas como leídas" lado="abajo"><button onClick={() => marcarLeidas()} className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-800" aria-label="Marcar todas como leídas"><CheckCheck className="h-4 w-4" /></button></Tooltip>
          </div>
        </div>
        <ul className="max-h-96 overflow-y-auto py-1">
          {lista.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink-500">Estás al día. No hay notificaciones sin leer.</li>}
          {lista.map((n) => (
            <li key={n.id}>
              <button onClick={() => { marcarLeidas([n.id]); setAbierto(false); if (n.enlace) navigate(n.enlace) }} className="flex w-full gap-2.5 px-3.5 py-2.5 text-left hover:bg-ink-50">
                <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', n.leida ? 'bg-transparent' : 'bg-brand-500')} />
                <span className="min-w-0 flex-1">
                  <span className={cx('block text-sm', n.leida ? 'text-ink-600' : 'text-ink-950')}>{n.titulo}</span>
                  {n.detalle && <span className="mt-0.5 block truncate text-xs text-ink-500">{n.detalle}</span>}
                  <span className="mt-0.5 block text-xs text-ink-400">{haceCuanto(n.fecha)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-ink-150 px-3.5 py-2">
          <Link to={esCliente ? '/app/notificaciones' : '/bo/notificaciones'} onClick={() => setAbierto(false)} className="text-xs font-medium text-ink-700 hover:text-ink-950">Ver todas las notificaciones</Link>
        </div>
      </Desplegable>
    </div>
  )
}

// ------------------------------------------------------------------ selector de organización
function SelectorOrganizacion() {
  const { esCliente, org, plan, empleado } = useApp()
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  useFuera(ref, () => setAbierto(false))
  const nombre = esCliente ? org.nombre : 'Unburn'
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAbierto(!abierto)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-ink-150/70">
        <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold', esCliente ? 'bg-surface text-ink-700 ring-1 ring-ink-200' : 'bg-navy text-on-navy')}>{nombre[0]}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink-950">{nombre}</span>
          <span className="flex items-center gap-1 truncate text-2xs text-ink-500">{esCliente ? <>Plan <PlanBadge plan={plan.id} /></> : `Back-office · ${empleado.departamento}`}</span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-ink-400" />
      </button>
      <Desplegable abierto={abierto} className="left-0 right-0">
        <TituloMenu>{esCliente ? 'Organizaciones' : 'Espacio de trabajo'}</TituloMenu>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-900"><span className="flex-1 truncate">{nombre}</span><Check className="h-4 w-4" /></div>
        {esCliente && <Link to="/alta" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-600 hover:bg-ink-100"><Plus className="h-3.5 w-3.5" /> Crear organización</Link>}
      </Desplegable>
    </div>
  )
}

// ------------------------------------------------------------------ menú de usuario
function MenuUsuario({ abrirAtajos }) {
  const { usuario, empleado, esCliente, tema, setTema } = useApp()
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  useFuera(ref, () => setAbierto(false))
  const p = usuario || empleado
  const base = esCliente ? '/app' : '/bo'
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAbierto(!abierto)} data-menu-usuario className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-ink-150/70" aria-haspopup="menu">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-2xs font-semibold text-on-navy">{p.nombre[0]}{p.apellidos[0]}</span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium text-ink-900">{p.nombre} {p.apellidos.split(' ')[0]}</span>
          <span className="block truncate text-xs text-ink-500">{usuario ? (usuario.rol === 'administrador' ? 'Administrador' : 'Lector') : empleado.rol}</span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-ink-400" />
      </button>
      {abierto && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-1.5 rounded-lg bg-surface p-1 shadow-pop animate-slide-in">
          <p className="truncate px-2 py-1.5 text-xs text-ink-500">{p.email}</p>
          <Link to={`${base}/cuenta`} onClick={() => setAbierto(false)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-100"><CircleUser className="h-3.5 w-3.5" /> Mi cuenta</Link>
          {esCliente && <Link to="/app/ajustes" onClick={() => setAbierto(false)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-100"><Settings className="h-3.5 w-3.5" /> Ajustes de la organización</Link>}
          <button onClick={() => { setAbierto(false); abrirAtajos() }} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-100"><Keyboard className="h-3.5 w-3.5" /> Atajos de teclado <Kbd className="ml-auto">?</Kbd></button>
          <div className="flex items-center justify-between px-2 py-1.5 text-sm text-ink-700">
            Tema
            <Segmented value={tema} onChange={setTema} options={[{ id: 'claro', label: <Sun className="h-3.5 w-3.5" aria-label="Claro" /> }, { id: 'oscuro', label: <Moon className="h-3.5 w-3.5" aria-label="Oscuro" /> }, { id: 'sistema', label: <Monitor className="h-3.5 w-3.5" aria-label="Sistema" /> }]} />
          </div>
          <div className="my-1 border-t border-ink-150" />
          <button onClick={() => navigate('/login')} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-100"><LogOut className="h-3.5 w-3.5" /> Cerrar sesión</button>
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ barra lateral
function Sidebar({ onNavigate, abrirPaleta, abrirAtajos }) {
  const { esCliente, org, plan, deOrg, datos, empleado } = useApp()
  const nav = esCliente ? NAV_CLIENTE : navBackoffice(empleado.departamento)
  const contadores = useMemo(() => ({
    incidentes: deOrg('incidentes').filter((i) => i.estado === 'abierto').length,
    caminos: org && plan.escudoCompleto ? caminosIndirectos(datos.grafos[org.id], deOrg('herramientas')).length : 0,
    recomendaciones: org ? recomendacionesPendientes(datos, org, plan).length : 0,
    tickets: datos.tickets.filter((t) => t.estado !== 'cerrado').length,
    incidencias: datos.incidenciasTecnicas.filter((i) => i.estado !== 'resuelta').length,
    cobros: datos.clientes.filter((c) => c.cobro === 'fallido').length,
  }), [datos, org, plan, deOrg])
  return (
    <div className="flex h-full flex-col border-r border-ink-200 bg-ink-50">
      <div className="flex h-12 items-center px-4"><Link to={esCliente ? '/app' : '/bo'} aria-label="Inicio"><Logo tamano="sm" /></Link></div>
      <div className="px-2"><SelectorOrganizacion /></div>
      <div className="px-2 pt-2">
        <button onClick={abrirPaleta} className="flex h-8 w-full items-center gap-2 rounded-md border border-ink-200 bg-surface px-2 text-sm text-ink-400 hover:border-ink-300">
          <Search className="h-3.5 w-3.5" /><span className="flex-1 text-left">Buscar…</span><Kbd>Ctrl K</Kbd>
        </button>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4" aria-label="Navegación principal">
        {nav.map((g, i) => (
          <div key={i}>
            {g.grupo && <p className="mb-1 px-2 text-2xs font-medium text-ink-400">{g.grupo}</p>}
            <ul className="space-y-px">
              {g.items.map((it) => (
                <li key={it.to}>
                  <NavLink to={it.to} end={it.end} onClick={onNavigate}
                    className={({ isActive }) => cx('flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors', isActive ? 'bg-surface font-medium text-ink-950 shadow-xs ring-1 ring-ink-200' : 'text-ink-600 hover:bg-ink-150/70 hover:text-ink-900')}>
                    {({ isActive }) => (<>
                      <it.icon className={cx('h-4 w-4', isActive ? 'text-brand-500' : 'text-ink-400')} strokeWidth={1.75} />
                      <span className="flex-1 truncate">{it.label}</span>
                      {contadores[it.contador] > 0 && <span className="text-xs tabular-nums text-ink-500">{contadores[it.contador]}</span>}
                    </>)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-ink-200 p-2"><MenuUsuario abrirAtajos={abrirAtajos} /></div>
    </div>
  )
}

function Breadcrumbs() {
  const { pathname } = useLocation()
  const { esCliente, org } = useApp()
  const partes = pathname.split('/').filter(Boolean)
  const migas = [{ to: esCliente ? '/app' : '/bo', label: esCliente ? org.nombre : 'Back-office' }]
  if (partes.length >= 2) {
    const base = `/${partes[0]}/${partes[1]}`
    migas.push({ to: base, label: ETIQUETAS[base] || partes[1] })
  } else if (esCliente) migas.push({ to: '/app', label: 'Resumen' })
  if (partes.length >= 3) migas.push({ to: pathname, label: decodeURIComponent(partes[2]), mono: true })
  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Migas de pan">
      {migas.map((m, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="hidden text-ink-300 sm:inline">/</span>}
          {i === migas.length - 1
            ? <span className={cx('truncate font-medium text-ink-950', m.mono && 'font-mono text-[12.5px]')}>{m.label}</span>
            : <Link to={m.to} className="hidden truncate text-ink-500 hover:text-ink-900 sm:inline">{m.label}</Link>}
        </Fragment>
      ))}
    </nav>
  )
}

// ------------------------------------------------------------------ progreso del escenario
function ProgresoEscenario() {
  const { escenario, cancelarEscenario, cerrarEscenario } = useApp()
  const navigate = useNavigate()
  if (!escenario) return null
  const terminado = escenario.estado !== 'en curso'
  return (
    <div className="fixed bottom-4 left-4 z-[55] w-[340px] max-w-[calc(100vw-2rem)] rounded-lg bg-surface p-3 shadow-pop animate-slide-in lg:left-[256px]" role="status" data-escenario-estado={escenario.estado}>
      <div className="flex items-start gap-2.5">
        {terminado ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-brand-500" />}
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-medium uppercase tracking-wide text-ink-400">Escenario {terminado ? 'terminado' : 'en curso'}</p>
          <p className="text-sm font-medium text-ink-950">{escenario.titulo}</p>
          <p className="mt-0.5 text-xs text-ink-600">{escenario.paso}</p>
          <div className="mt-2 flex gap-2">
            {terminado && escenario.enlace && <Button size="xs" variant="primary" onClick={() => { navigate(escenario.enlace); cerrarEscenario() }}>Ver resultado</Button>}
            <Button size="xs" variant="ghost" onClick={terminado ? cerrarEscenario : cancelarEscenario}>{terminado ? 'Cerrar' : 'Detener'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ atajos y errores
const ATAJOS = [
  ['Ctrl K', 'Abrir la paleta de comandos'], ['/', 'Buscar en la tabla de la pantalla'], ['?', 'Ver los atajos'],
  ['g r', 'Ir a Resumen'], ['g i', 'Ir a Incidentes'], ['g c', 'Ir a Claves virtuales'], ['g p', 'Ir a Presupuestos'], ['g a', 'Ir al registro de auditoría'], ['g g', 'Ir a Gasto y sesiones'],
  ['Espacio', 'Pausar o reanudar la simulación'], ['Esc', 'Cerrar menús, modales y paneles'],
]
const DESTINOS_G = { r: '/app', i: '/app/incidentes', c: '/app/claves', p: '/app/presupuestos', a: '/app/auditoria', g: '/app/gasto' }

class LimiteErrores extends Component {
  constructor(p) { super(p); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) { console.error(error) }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="rounded-lg border border-ink-200">
        <EmptyState icon={ShieldAlert} title="No se ha podido cargar esta pantalla" action={<Button onClick={() => this.setState({ error: null })}>Reintentar</Button>}>
          La API de administración no ha respondido como se esperaba. Si vuelve a pasar, abre un ticket con la hora y la pantalla.
        </EmptyState>
      </div>
    )
  }
}

function SinAcceso() {
  return (
    <div className="rounded-lg border border-ink-200">
      <h1 className="sr-only">Sin acceso</h1>
      <EmptyState icon={ShieldAlert} title="Esta sección no es de tu departamento" action={<Link to="/bo"><Button>Volver al inicio</Button></Link>}>
        En la consola de back-office cada empleado solo accede a la parte que le corresponde (AP-12).
      </EmptyState>
    </div>
  )
}

export default function Layout({ zona }) {
  const { persona, esCliente, empleado, sim, setSim } = useApp()
  const [menuMovil, setMenuMovil] = useState(false)
  const [paleta, setPaleta] = useState(false)
  const [atajos, setAtajos] = useState(false)
  const [cargando, setCargando] = useState(true)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const correcta = (zona === 'cliente') === esCliente
  const pendienteG = useRef(0)

  useEffect(() => { if (!correcta) navigate(inicioDe(persona), { replace: true }) }, [correcta, persona, navigate])
  // Simula la carga de cada pantalla (la API de administración respondería aquí)
  useEffect(() => {
    window.scrollTo(0, 0)
    setCargando(true)
    const t = setTimeout(() => setCargando(false), 240)
    return () => clearTimeout(t)
  }, [pathname, persona.id])

  useEffect(() => {
    const h = (e) => {
      const enCampo = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaleta((v) => !v); return }
      if (enCampo || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === '?') { setAtajos(true); return }
      if (e.key === '/') { const b = document.querySelector('[data-buscar]'); if (b) { e.preventDefault(); b.focus() } return }
      if (e.key === ' ' && e.target === document.body && !document.querySelector('[role=dialog]')) { e.preventDefault(); setSim({ activo: !sim.activo }); return }
      if (e.key === 'g') { pendienteG.current = Date.now(); return }
      if (Date.now() - pendienteG.current < 900 && DESTINOS_G[e.key] && esCliente) { pendienteG.current = 0; navigate(DESTINOS_G[e.key]) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [navigate, esCliente, sim.activo, setSim])

  if (!correcta) return null
  const permitido = esCliente || puedeAcceder(empleado.departamento, pathname)

  return (
    <div className="min-h-screen bg-surface">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[80] focus:rounded focus:bg-surface focus:px-3 focus:py-2">Saltar al contenido</a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block"><Sidebar abrirPaleta={() => setPaleta(true)} abrirAtajos={() => setAtajos(true)} /></aside>
      {menuMovil && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy/30" onClick={() => setMenuMovil(false)} />
          <div className="absolute inset-y-0 left-0 w-60"><Sidebar onNavigate={() => setMenuMovil(false)} abrirPaleta={() => { setMenuMovil(false); setPaleta(true) }} abrirAtajos={() => setAtajos(true)} /></div>
          <button className="absolute left-[15.5rem] top-3 rounded-md bg-surface p-1.5" onClick={() => setMenuMovil(false)} aria-label="Cerrar menú"><X className="h-4 w-4" /></button>
        </div>
      )}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-ink-200 bg-surface/95 px-4 backdrop-blur sm:px-6">
          <button className="rounded-md p-1.5 text-ink-600 hover:bg-ink-100 lg:hidden" onClick={() => setMenuMovil(true)} aria-label="Abrir menú"><Menu className="h-4 w-4" /></button>
          <Breadcrumbs />
          <div className="ml-auto flex items-center gap-1.5">
            <EnDirecto />
            <Campana />
            <MenuDemo />
          </div>
        </header>
        <main id="contenido" className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8">
          {cargando ? <PageSkeleton /> : !permitido ? <SinAcceso /> : <LimiteErrores key={pathname}><div className="animate-fade-in"><Outlet /></div></LimiteErrores>}
        </main>
      </div>
      <CommandPalette abierta={paleta} onClose={() => setPaleta(false)} />
      <Modal open={atajos} onClose={() => setAtajos(false)} title="Atajos de teclado" size="sm">
        <ul className="divide-y divide-ink-100">
          {ATAJOS.map(([k, d]) => <li key={k} className="flex items-center justify-between py-2 text-sm"><span className="text-ink-700">{d}</span><span className="flex gap-1">{k.split(' ').map((x) => <Kbd key={x}>{x}</Kbd>)}</span></li>)}
        </ul>
      </Modal>
      <ProgresoEscenario />
      <Toasts />
    </div>
  )
}
