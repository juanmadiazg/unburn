import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CornerDownLeft, KeyRound, Network, Search, Siren, Ticket, Building2, UserRound, Plus, Play, Moon, Sun, Pause } from 'lucide-react'
import { ESCENARIOS } from '../sim/escenarios'
import { PERSONAS, useApp } from '../store/AppStore'
import { NAV_CLIENTE, inicioDe, navBackoffice } from './nav'
import { cx, Kbd } from './ui'

/** Paleta de comandos (Ctrl+K): navegar, buscar entidades y lanzar acciones */
export default function CommandPalette({ abierta, onClose }) {
  const { esCliente, deOrg, datos, cambiarPersona, esLector, empleado, lanzarEscenario, oscuro, setTema, sim, setSim } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef(null)
  useEffect(() => { if (abierta) { setQ(''); setSel(0); setTimeout(() => input.current?.focus(), 0) } }, [abierta])

  const comandos = useMemo(() => {
    const ir = (to) => () => navigate(to)
    const paginas = (esCliente ? NAV_CLIENTE : navBackoffice(empleado.departamento)).flatMap((g) => g.items).map((i) => ({ grupo: 'Ir a', label: i.label, icon: i.icon, run: ir(i.to) }))
    const acciones = esCliente && !esLector ? [
      { grupo: 'Acciones', label: 'Crear clave virtual', icon: Plus, run: ir('/app/claves?nueva=1') },
      { grupo: 'Acciones', label: 'Crear presupuesto', icon: Plus, run: ir('/app/presupuestos?nuevo=1') },
      { grupo: 'Acciones', label: 'Abrir ticket de soporte', icon: Plus, run: ir('/app/soporte?nuevo=1') },
      { grupo: 'Acciones', label: 'Probar una petición en el probador', icon: Play, run: ir('/app/probador') },
    ] : []
    const generales = [
      { grupo: 'Acciones', label: oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro', icon: oscuro ? Sun : Moon, run: () => setTema(oscuro ? 'claro' : 'oscuro') },
      { grupo: 'Acciones', label: sim.activo ? 'Pausar la simulación' : 'Reanudar la simulación', icon: sim.activo ? Pause : Play, run: () => setSim({ activo: !sim.activo }) },
      ...(esCliente ? ESCENARIOS.map((e) => ({ grupo: 'Escenarios de demostración', label: e.titulo, hint: e.refs, icon: Play, run: () => lanzarEscenario(e.id) })) : []),
    ]
    const entidades = esCliente ? [
      ...deOrg('incidentes').map((i) => ({ grupo: 'Incidentes', label: `${i.titulo}`, hint: i.id, icon: Siren, run: ir(`/app/incidentes/${i.id}`) })),
      ...deOrg('clavesVirtuales').map((k) => ({ grupo: 'Claves', label: k.nombre, hint: `${k.prefijo}…`, icon: KeyRound, run: ir(`/app/claves?clave=${k.id}`) })),
      ...deOrg('sesiones').map((s) => ({ grupo: 'Sesiones', label: s.titulo, hint: s.id, icon: Network, run: ir(`/app/contexto/${s.id}`) })),
    ] : [
      ...datos.clientes.map((c) => ({ grupo: 'Clientes', label: c.nombre, hint: c.id, icon: Building2, run: ir(`/bo/clientes?cliente=${c.id}`) })),
      ...datos.tickets.map((t) => ({ grupo: 'Tickets', label: t.asunto, hint: t.id, icon: Ticket, run: ir(`/bo/tickets/${t.id}`) })),
    ]
    const personas = PERSONAS.map((p) => ({ grupo: 'Cambiar de usuario (demo)', label: p.etiqueta, hint: p.detalle, icon: UserRound, run: () => { cambiarPersona(p.id); navigate(inicioDe(p)) } }))
    return [...paginas, ...acciones, ...generales, ...entidades, ...personas]
  }, [esCliente, esLector, deOrg, datos, navigate, cambiarPersona, empleado, lanzarEscenario, oscuro, setTema, sim, setSim])

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase()
    const r = t ? comandos.filter((c) => `${c.label} ${c.hint || ''} ${c.grupo}`.toLowerCase().includes(t)) : comandos.filter((c) => c.grupo === 'Ir a' || c.grupo === 'Acciones' || c.grupo === 'Escenarios de demostración')
    return r.slice(0, 40)
  }, [q, comandos])
  useEffect(() => setSel(0), [q])

  if (!abierta) return null
  const ejecutar = (c) => { onClose(); c.run() }
  const teclas = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(filtrados.length - 1, s + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)) }
    if (e.key === 'Enter' && filtrados[sel]) ejecutar(filtrados[sel])
    if (e.key === 'Escape') onClose()
  }
  let grupoPrevio = null
  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center bg-navy/30 p-4 pt-[14vh] animate-fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl overflow-hidden rounded-lg bg-surface shadow-pop animate-slide-in" role="dialog" aria-label="Paleta de comandos">
        <div className="flex items-center gap-2.5 border-b border-ink-150 px-4">
          <Search className="h-4 w-4 text-ink-400" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={teclas} placeholder="Busca pantallas, incidentes, claves, sesiones…" className="h-12 flex-1 bg-transparent text-base text-ink-900 placeholder:text-ink-400 focus:outline-none" />
          <Kbd>Esc</Kbd>
        </div>
        <ul className="max-h-[360px] overflow-y-auto p-1.5">
          {filtrados.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-500">Sin resultados para «{q}»</li>}
          {filtrados.map((c, i) => {
            const cabecera = c.grupo !== grupoPrevio
            grupoPrevio = c.grupo
            return (
              <li key={`${c.grupo}-${c.label}-${i}`}>
                {cabecera && <p className="px-2.5 pb-1 pt-2 text-2xs font-medium text-ink-400">{c.grupo}</p>}
                <button onMouseEnter={() => setSel(i)} onClick={() => ejecutar(c)} className={cx('flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm', i === sel ? 'bg-ink-100 text-ink-950' : 'text-ink-700')}>
                  <c.icon className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={1.75} />
                  <span className="flex-1 truncate">{c.label}</span>
                  {c.hint && <span className="max-w-[45%] truncate font-mono text-[11.5px] text-ink-400">{c.hint}</span>}
                  {i === sel && <CornerDownLeft className="h-3.5 w-3.5 text-ink-400" />}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center gap-3 border-t border-ink-150 bg-ink-50 px-4 py-2 text-xs text-ink-500">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> moverse</span>
          <span className="flex items-center gap-1"><Kbd>Enter</Kbd> abrir</span>
          <span className="ml-auto flex items-center gap-1">Navegación rápida <ArrowRight className="h-3 w-3" /></span>
        </div>
      </div>
    </div>
  )
}
