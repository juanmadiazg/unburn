import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpRight, Check, CheckCircle2, ChevronLeft, ChevronRight, ChevronsUpDown, Copy, Info, Lock, Search, X, XCircle } from 'lucide-react'
import { useApp } from '../store/AppStore'

export const cx = (...c) => c.filter(Boolean).join(' ')

// ---------- Botones ----------
// El naranja (brand) se reserva para la acción principal de cada pantalla.
const VARIANTES = {
  primary: 'bg-navy text-on-navy hover:bg-navy-800 border border-navy',
  brand: 'bg-brand-500 text-white hover:bg-brand-600 border border-brand-500',
  secondary: 'bg-surface text-ink-800 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 shadow-xs',
  ghost: 'text-ink-600 border border-transparent hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-red-600 text-white border border-red-600 hover:bg-red-700',
  'danger-soft': 'bg-surface text-red-700 border border-ink-200 hover:border-red-300 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:border-red-500/40',
}
const TAMANOS = { xs: 'h-6 px-2 text-xs gap-1', sm: 'h-7 px-2.5 text-xs gap-1.5', md: 'h-8 px-3 text-sm gap-1.5', lg: 'h-10 px-4 text-sm gap-2' }

/** Botón. Con `requiereAdmin`, se desactiva para el rol lector (OF-12: el lector solo consulta). */
export function Button({ variant = 'secondary', size = 'md', icon: Icon, children, className, requiereAdmin, disabled, title, kbd, ...props }) {
  const { esLector } = useApp()
  const bloqueado = requiereAdmin && esLector
  return (
    <button
      type="button"
      disabled={disabled || bloqueado}
      title={bloqueado ? 'Solo lectura: tu rol es lector' : title}
      className={cx(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTES[variant], TAMANOS[size], className,
      )}
      {...props}
    >
      {bloqueado ? <Lock className="h-3.5 w-3.5" /> : Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
      {children}
      {kbd && <Kbd className="ml-1">{kbd}</Kbd>}
    </button>
  )
}

export const Kbd = ({ children, className }) => <kbd className={cx('rounded border border-ink-200 bg-ink-50 px-1 font-sans text-2xs font-medium text-ink-500', className)}>{children}</kbd>

// ---------- Contenedores ----------
export function Card({ children, className, ...props }) {
  return <div className={cx('rounded-lg border border-ink-200 bg-surface', className)} {...props}>{children}</div>
}

export function CardHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cx('flex flex-wrap items-center justify-between gap-3 border-b border-ink-150 px-4 py-3', className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-ink-950">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PageHeader({ title, description, actions, refs }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-[-0.015em] text-ink-950">{title}</h1>
          {refs && <RefChips refs={refs} />}
        </div>
        {description && <p className="mt-1 max-w-3xl text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** IDs del documento de arquitectura (AP/BP/OF/IC). Solo se ven con «Mostrar referencias» activado. */
export function RefChips({ refs }) {
  const { mostrarRefs } = useApp()
  if (!mostrarRefs) return null
  return (
    <div className="flex flex-wrap gap-1">
      {refs.map((r) => <span key={r} className="rounded border border-dashed border-brand-300 bg-brand-50 px-1.5 font-mono text-2xs text-brand-700">{r}</span>)}
    </div>
  )
}

export function Section({ title, description, actions, children, className }) {
  return (
    <section className={cx('mb-8', className)}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-ink-950">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

// ---------- Etiquetas de estado (sobrias: punto de color + texto) ----------
const PUNTOS = {
  gray: 'bg-ink-400', green: 'bg-emerald-500', red: 'bg-red-500', amber: 'bg-amber-500', orange: 'bg-brand-500',
  blue: 'bg-sky-500', violet: 'bg-violet-500', navy: 'bg-navy',
}
export function Badge({ tone = 'gray', children, className, dot = true }) {
  return (
    <span className={cx('inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded border border-ink-200 bg-surface px-1.5 text-xs font-medium text-ink-700', className)}>
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', PUNTOS[tone] || PUNTOS.gray)} />}
      {children}
    </span>
  )
}

/** Etiqueta neutra sin punto (para tipos, modelos, agentes…) */
export const Tag = ({ children, className, mono }) => (
  <span className={cx('inline-flex h-5 items-center whitespace-nowrap rounded bg-ink-100 px-1.5 text-xs text-ink-700', mono && 'font-mono text-[11.5px]', className)}>{children}</span>
)

export function PlanBadge({ plan, oscuro }) {
  const n = { gratis: 'Gratis', pro: 'Pro', enterprise: 'Enterprise' }[plan] || plan
  return (
    <span className={cx('inline-flex h-[18px] items-center rounded px-1.5 text-2xs font-semibold uppercase tracking-wide',
      plan === 'pro' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' : plan === 'enterprise' ? 'bg-navy text-on-navy' : 'bg-ink-100 text-ink-600')}>{n}</span>
  )
}

// ---------- Datos ----------
export function Stat({ label, value, sub, delta, children, href }) {
  const contenido = (
    <>
      <p className="flex items-center justify-between text-xs text-ink-500">{label}{href && <ArrowUpRight className="h-3.5 w-3.5 text-ink-400" />}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-ink-950 tabular-nums">{value}</p>
      {(sub || delta) && <p className="mt-1 text-xs text-ink-500">{delta}{sub}</p>}
      {children}
    </>
  )
  return href
    ? <Link to={href} className="block rounded-lg border border-ink-200 bg-surface p-4 transition-colors hover:border-ink-300">{contenido}</Link>
    : <div className="rounded-lg border border-ink-200 bg-surface p-4">{contenido}</div>
}

/** Barra de consumo con marca del límite blando; lo rayado es lo reservado (IC-17) */
export function UsageBar({ gastado, reservado = 0, blando, duro, className }) {
  const max = duro || 1
  const pG = Math.min(100, (gastado / max) * 100)
  const pR = Math.min(100 - pG, (reservado / max) * 100)
  const pB = blando ? (blando / max) * 100 : null
  const color = gastado >= duro ? 'bg-red-500' : blando && gastado >= blando ? 'bg-amber-500' : 'bg-navy'
  return (
    <div className={cx('relative h-1.5 w-full rounded-full bg-ink-150', className)}>
      <div className={cx('absolute inset-y-0 left-0 rounded-full', color)} style={{ width: `${pG}%` }} />
      {pR > 0 && <div className="absolute inset-y-0 bg-[repeating-linear-gradient(135deg,#A1A1AA_0_2px,transparent_2px_4px)]" style={{ left: `${pG}%`, width: `${Math.max(pR, 0.8)}%` }} title="Reservado" />}
      {pB != null && <div className="absolute -bottom-1 -top-1 w-px bg-ink-500" style={{ left: `${pB}%` }} title="Límite blando" />}
    </div>
  )
}

export function Progress({ value, max = 100, tone = 'navy', className }) {
  const p = Math.min(100, (value / max) * 100)
  const c = { navy: 'bg-navy', amber: 'bg-amber-500', red: 'bg-red-500', green: 'bg-emerald-500' }[tone]
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-ink-150', className)}>
      <div className={cx('h-full rounded-full transition-all', c)} style={{ width: `${p}%` }} />
    </div>
  )
}

export function KV({ items, cols = 2 }) {
  return (
    <dl className={cx('grid gap-x-6 gap-y-3.5', cols === 2 ? 'sm:grid-cols-2' : cols === 3 ? 'sm:grid-cols-3' : '')}>
      {items.filter(Boolean).map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs text-ink-500">{k}</dt>
          <dd className="mt-0.5 break-words text-sm text-ink-900">{v ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export const Mono = ({ children, className }) => <span className={cx('font-mono text-[12px] tracking-tight', className)}>{children}</span>

export function Skeleton({ className }) { return <div className={cx('skeleton', className)} /> }

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-6 w-56" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="rounded-lg border border-ink-200 p-4"><Skeleton className="h-3 w-24" /><Skeleton className="mt-3 h-7 w-32" /><Skeleton className="mt-3 h-1.5 w-full" /></div>)}
      </div>
      <div className="mt-6 rounded-lg border border-ink-200">
        <div className="border-b border-ink-150 px-4 py-3"><Skeleton className="h-4 w-40" /></div>
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="flex gap-6 border-b border-ink-100 px-4 py-3 last:border-0"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-20" /></div>)}
      </div>
    </div>
  )
}

// ---------- Avisos ----------
export function Callout({ tone = 'info', title, children, icon, actions, className }) {
  const estilos = {
    info: ['border-ink-200 bg-ink-50', Info, 'text-ink-500'],
    warn: ['border-amber-200 bg-amber-50/60 dark:border-amber-500/25 dark:bg-amber-500/[.07]', AlertTriangle, 'text-amber-600 dark:text-amber-400'],
    danger: ['border-red-200 bg-red-50/60 dark:border-red-500/25 dark:bg-red-500/[.07]', XCircle, 'text-red-600 dark:text-red-400'],
    success: ['border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/[.07]', CheckCircle2, 'text-emerald-600 dark:text-emerald-400'],
    neutral: ['border-ink-200 bg-surface', Info, 'text-ink-400'],
  }
  const [clase, IconoDef, colorIcono] = estilos[tone]
  const Icono = icon || IconoDef
  return (
    <div className={cx('flex gap-2.5 rounded-lg border px-3.5 py-2.5', clase, className)}>
      <Icono className={cx('mt-0.5 h-4 w-4 shrink-0', colorIcono)} />
      <div className="min-w-0 flex-1 text-sm text-ink-700">
        {title && <p className="font-medium text-ink-950">{title}</p>}
        {children && <div className={cx(title && 'mt-0.5')}>{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Función no incluida en el plan actual (IC-03) */
export function PlanLock({ planNecesario = 'Pro', children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-300 px-6 py-10 text-center">
      <Lock className="h-4 w-4 text-ink-400" />
      <p className="mt-2 text-sm font-medium text-ink-950">Disponible en el plan {planNecesario}</p>
      {children && <p className="mt-1 max-w-md text-sm text-ink-500">{children}</p>}
      <Link to="/app/suscripcion" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">Comparar planes</Link>
    </div>
  )
}

export function EmptyState({ icon: Icon = Info, title, children, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="rounded-md border border-ink-200 p-2 text-ink-400"><Icon className="h-4 w-4" /></span>
      <p className="mt-3 text-sm font-medium text-ink-950">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-ink-500">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ---------- Superposiciones ----------
function useEscape(onClose) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', dismissable = true }) {
  useEscape(dismissable ? onClose : null)
  if (!open) return null
  const w = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/30 p-4 pt-[10vh] animate-fade-in" onMouseDown={(e) => dismissable && e.target === e.currentTarget && onClose()}>
      <div className={cx('w-full rounded-lg bg-surface shadow-pop animate-slide-in', w)} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-4">
          <div>
            <h2 className="text-base font-semibold text-ink-950">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          {dismissable && <button onClick={onClose} className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Cerrar"><X className="h-4 w-4" /></button>}
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 rounded-b-lg border-t border-ink-150 bg-ink-50 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

/** Confirmación antes de acciones destructivas: exige escribir el nombre */
export function ConfirmModal({ open, onClose, onConfirm, title, children, confirmLabel = 'Confirmar', palabra, danger = true }) {
  const [texto, setTexto] = useState('')
  useEffect(() => { if (open) setTexto('') }, [open])
  const ok = !palabra || texto.trim() === palabra
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant={danger ? 'danger' : 'primary'} disabled={!ok} onClick={onConfirm}>{confirmLabel}</Button></>}>
      <div className="text-sm text-ink-700">{children}</div>
      {palabra && (
        <Field label={<>Escribe <Mono className="rounded bg-ink-100 px-1 text-ink-900">{palabra}</Mono> para confirmar</>} className="mt-4">
          <Input autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ok && onConfirm()} />
        </Field>
      )}
    </Modal>
  )
}

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-xl' }) {
  useEscape(onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-navy/20 animate-fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx('flex h-full w-full flex-col border-l border-ink-200 bg-surface shadow-pop animate-drawer-in', width)}>
        <div className="flex items-start justify-between gap-4 border-b border-ink-150 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-ink-950">{title}</h2>
            {subtitle && <div className="mt-0.5 text-sm text-ink-500">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Cerrar"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-150 bg-ink-50 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts, cerrarToast } = useApp()
  const navigate = useNavigate()
  const iconos = { exito: [CheckCircle2, 'text-emerald-600'], error: [XCircle, 'text-red-600'], aviso: [AlertTriangle, 'text-amber-600'], info: [Info, 'text-ink-500'] }
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const [I, c] = iconos[t.tipo] || iconos.info
        return (
          <div key={t.id} role="status" className="pointer-events-auto flex gap-2.5 rounded-lg bg-surface px-3.5 py-3 text-sm shadow-pop animate-slide-in">
            <I className={cx('mt-0.5 h-4 w-4 shrink-0', c)} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink-950">{t.mensaje}</p>
              {t.detalle && <p className="mt-0.5 text-xs text-ink-500">{t.detalle}</p>}
              {t.enlace && <button onClick={() => { navigate(t.enlace); cerrarToast(t.id) }} className="mt-1.5 text-xs font-medium text-ink-950 underline decoration-ink-300 underline-offset-2 hover:decoration-ink-500">Ver detalle</button>}
            </div>
            <button onClick={() => cerrarToast(t.id)} className="self-start text-ink-400 hover:text-ink-700" aria-label="Cerrar"><X className="h-3.5 w-3.5" /></button>
          </div>
        )
      })}
    </div>
  )
}

/** Tooltip ligero: aparece al pasar el ratón o con el foco del teclado */
export function Tooltip({ texto, children, lado = 'arriba', className }) {
  if (!texto) return children
  const pos = { arriba: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2', abajo: 'top-full left-1/2 mt-1.5 -translate-x-1/2', izquierda: 'right-full top-1/2 mr-1.5 -translate-y-1/2', derecha: 'left-full top-1/2 ml-1.5 -translate-y-1/2' }[lado]
  return (
    <span className={cx('group/tt relative inline-flex', className)}>
      {children}
      <span role="tooltip" className={cx('pointer-events-none absolute z-[70] w-max max-w-[260px] rounded-md bg-ink-900 px-2 py-1 text-xs font-normal leading-snug text-ink-50 opacity-0 shadow-pop transition-opacity delay-150 duration-100 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100', pos)}>{texto}</span>
    </span>
  )
}

/** Icono de información con explicación (para KPIs y términos del documento) */
export function Ayuda({ texto }) {
  return <Tooltip texto={texto}><span tabIndex={0} className="inline-flex cursor-help text-ink-400 hover:text-ink-600"><Info className="h-3.5 w-3.5" /></span></Tooltip>
}

/** Cifra que cambia en directo: destello breve al actualizarse */
export function Cifra({ valor, formato = (v) => v, className }) {
  const previo = useRef(valor)
  const [clave, setClave] = useState(0)
  useEffect(() => {
    if (previo.current !== valor) { previo.current = valor; setClave((k) => k + 1) }
  }, [valor])
  return <span key={clave} className={cx('tabular-nums', clave > 0 && 'cifra-cambia', className)}>{formato(valor)}</span>
}

/** Punto de estado «en directo» */
export const PuntoVivo = ({ activo = true, className }) => (
  <span className={cx('relative inline-flex h-2 w-2', className)}>
    {activo && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />}
    <span className={cx('relative inline-flex h-2 w-2 rounded-full', activo ? 'bg-emerald-500' : 'bg-ink-400')} />
  </span>
)

// ---------- Navegación interna ----------
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-5 flex gap-4 overflow-x-auto border-b border-ink-200">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cx('-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors',
            value === t.id ? 'border-navy text-ink-950' : 'border-transparent text-ink-500 hover:text-ink-800')}>
          {t.label}
          {t.count != null && <span className="text-xs font-normal tabular-nums text-ink-400">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-md border border-ink-200 bg-ink-50 p-0.5">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)} className={cx('h-6 rounded px-2.5 text-xs font-medium transition-colors', value === o.id ? 'bg-surface text-ink-950 shadow-xs ring-1 ring-ink-200' : 'text-ink-500 hover:text-ink-800')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ---------- Formularios ----------
export function Field({ label, hint, children, error, className }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1.5 block text-xs font-medium text-ink-700">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
const baseInput = 'w-full rounded-md border border-ink-200 bg-surface px-2.5 text-sm text-ink-900 shadow-xs placeholder:text-ink-400 focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-ink-50 disabled:text-ink-500'
export const Input = ({ className, ...p }) => <input className={cx(baseInput, 'h-8', className)} {...p} />
export const Textarea = ({ className, ...p }) => <textarea className={cx(baseInput, 'min-h-[96px] py-2', className)} {...p} />
export const Select = ({ className, children, ...p }) => <select className={cx(baseInput, 'h-8 pr-8', className)} {...p}>{children}</select>

export function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={cx('relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors disabled:opacity-50', checked ? 'bg-navy' : 'bg-ink-300')}>
      <span className={cx('inline-block h-3.5 w-3.5 transform rounded-full bg-surface shadow-xs transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )
}

export function Checkbox({ checked, onChange, label, description, disabled }) {
  return (
    <label className={cx('flex items-start gap-2.5', disabled ? 'opacity-50' : 'cursor-pointer')}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 rounded border-ink-300 accent-navy" />
      <span className="text-sm">
        <span className="text-ink-800">{label}</span>
        {description && <span className="block text-xs text-ink-500">{description}</span>}
      </span>
    </label>
  )
}

/** Selector de opciones en forma de etiquetas (modelos, agentes…) */
export function ChipSelect({ options, value, onChange, disabled, mono }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button key={o} type="button" disabled={disabled} onClick={() => toggle(o)}
            className={cx('inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs transition-colors disabled:cursor-default', mono && 'font-mono',
              on ? 'border-navy bg-navy text-on-navy' : 'border-ink-200 bg-surface text-ink-700 hover:border-ink-300')}>
            {on && <Check className="h-3 w-3" />}{o}
          </button>
        )
      })}
    </div>
  )
}

export function CopyButton({ text, label = 'Copiar', size = 'sm' }) {
  const [ok, setOk] = useState(false)
  const copiar = async () => {
    try { await navigator.clipboard.writeText(text) } catch { /* portapapeles no disponible */ }
    setOk(true)
    setTimeout(() => setOk(false), 1600)
  }
  return <Button size={size} variant="secondary" icon={ok ? Check : Copy} onClick={copiar}>{ok ? 'Copiado' : label}</Button>
}

// ---------- Tablas ----------
export function Table({ head, children, className }) {
  return (
    <div className={cx('overflow-x-auto', className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-150 bg-ink-50/60">
            {head.map((h, i) => <th key={i} className={cx('h-8 whitespace-nowrap px-4 text-xs font-medium text-ink-500', typeof h === 'object' && h?.className)}>{typeof h === 'object' ? h?.label : h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">{children}</tbody>
      </table>
    </div>
  )
}
export const Td = ({ children, className, ...p }) => <td className={cx('h-10 px-4 py-2 align-middle', className)} {...p}>{children}</td>

/**
 * Tabla de datos con búsqueda, filtros, ordenación y paginación (estado local).
 * columns: [{ id, header, cell(row), sort?(row) , align?, className? }]
 * filters: [{ id, label, options: [{id, label}], value(row) }]
 */
export function DataTable({ columns, rows, rowKey = (r) => r.id, search, searchPlaceholder = 'Buscar…', filters = [], pageSize = 10, onRowClick, toolbar, initialSort, empty, dense, initialFilters = {}, initialSearch = '', rowClassName }) {
  const [q, setQ] = useState(initialSearch)
  const [f, setF] = useState(initialFilters)
  const [orden, setOrden] = useState(initialSort || null)
  const [pagina, setPagina] = useState(0)
  useEffect(() => setPagina(0), [q, f, rows.length])

  const visibles = useMemo(() => {
    let r = rows
    if (q && search) { const t = q.toLowerCase(); r = r.filter((x) => search(x).toLowerCase().includes(t)) }
    for (const fi of filters) if (f[fi.id] && f[fi.id] !== 'todos') r = r.filter((x) => String(fi.value(x)) === f[fi.id])
    if (orden) {
      const col = columns.find((c) => c.id === orden.id)
      if (col?.sort) r = [...r].sort((a, b) => { const va = col.sort(a), vb = col.sort(b); const c = va < vb ? -1 : va > vb ? 1 : 0; return orden.dir === 'asc' ? c : -c })
    }
    return r
  }, [rows, q, f, orden, columns, filters, search])

  const total = visibles.length
  const paginas = Math.max(1, Math.ceil(total / pageSize))
  const pag = visibles.slice(pagina * pageSize, pagina * pageSize + pageSize)
  const ordenar = (c) => c.sort && setOrden((o) => (o?.id === c.id ? { id: c.id, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { id: c.id, dir: 'desc' }))
  const hayFiltros = q || Object.values(f).some((v) => v && v !== 'todos')

  return (
    <div className="rounded-lg border border-ink-200 bg-surface">
      {(search || filters.length > 0 || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-150 px-3 py-2">
          {search && (
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
              <input data-buscar aria-label={searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="h-7 w-full rounded-md border border-ink-200 bg-surface pl-8 pr-2 text-sm placeholder:text-ink-400 focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
          )}
          {filters.map((fi) => (
            <select key={fi.id} value={f[fi.id] || 'todos'} onChange={(e) => setF({ ...f, [fi.id]: e.target.value })}
              className={cx('h-7 rounded-md border bg-surface pl-2 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20', f[fi.id] && f[fi.id] !== 'todos' ? 'border-ink-400 font-medium text-ink-900' : 'border-ink-200 text-ink-600')}>
              <option value="todos">{fi.label}: todos</option>
              {fi.options.map((o) => <option key={o.id} value={o.id}>{fi.label}: {o.label}</option>)}
            </select>
          ))}
          {hayFiltros && <button onClick={() => { setQ(''); setF({}) }} className="h-7 px-1.5 text-xs text-ink-500 hover:text-ink-900">Limpiar</button>}
          {toolbar && <div className="ml-auto flex items-center gap-2">{toolbar}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-150 bg-ink-50/60">
              {columns.map((c) => (
                <th key={c.id} className={cx('h-8 whitespace-nowrap px-4 text-xs font-medium text-ink-500', c.align === 'right' && 'text-right', c.headClassName)}>
                  {c.sort ? (
                    <button onClick={() => ordenar(c)} className={cx('inline-flex items-center gap-1 hover:text-ink-900', orden?.id === c.id && 'text-ink-900')}>
                      {c.header}
                      {orden?.id === c.id ? (orden.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ChevronsUpDown className="h-3 w-3 text-ink-300" />}
                    </button>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {pag.map((r) => (
              <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cx(onRowClick && 'cursor-pointer', 'hover:bg-ink-50/70', rowClassName?.(r))}>
                {columns.map((c) => <td key={c.id} className={cx(dense ? 'h-9' : 'h-11', 'px-4 py-1.5 align-middle', c.align === 'right' && 'text-right tabular-nums', c.className)}>{c.cell(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {total === 0 && (
          <EmptyState icon={Search} title={hayFiltros ? 'Ningún resultado con estos filtros' : empty?.title || 'No hay datos'}
            action={hayFiltros && <Button size="sm" onClick={() => { setQ(''); setF({}) }}>Limpiar filtros</Button>}>
            {!hayFiltros && empty?.description}
          </EmptyState>
        )}
      </div>
      {total > 0 && (
        <div className="flex items-center justify-between border-t border-ink-150 px-4 py-2 text-xs text-ink-500">
          <span className="tabular-nums">{pagina * pageSize + 1}–{Math.min(total, (pagina + 1) * pageSize)} de {total}</span>
          <div className="flex items-center gap-1">
            <button disabled={pagina === 0} onClick={() => setPagina(pagina - 1)} className="rounded p-1 hover:bg-ink-100 disabled:opacity-30" aria-label="Anterior"><ChevronLeft className="h-4 w-4" /></button>
            <span className="tabular-nums">{pagina + 1} / {paginas}</span>
            <button disabled={pagina >= paginas - 1} onClick={() => setPagina(pagina + 1)} className="rounded p-1 hover:bg-ink-100 disabled:opacity-30" aria-label="Siguiente"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
