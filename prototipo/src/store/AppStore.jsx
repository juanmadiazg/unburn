import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import planes from '../data/planes.json'
import organizaciones from '../data/organizaciones.json'
import usuarios from '../data/usuarios.json'
import claves from '../data/claves.json'
import agentes from '../data/agentes.json'
import presupuestosAlertas from '../data/presupuestos-alertas.json'
import incidentes from '../data/incidentes.json'
import sesiones from '../data/sesiones.json'
import facturasTickets from '../data/facturas-tickets.json'
import backoffice from '../data/backoffice.json'
import { desplazar, desplazarSesiones, ahoraIso, isoLocal } from '../lib/tiempo'
import { generarEventos, generarGasto, generarSellos, costeTokens, huellaHex, corta } from '../sim/generar'
import {
  iniciarPeticion, liquidarPeticion, peticionAleatoria, registrarIncidente, crearSesion, contarFacturables, notificar,
  cerrarReservasVencidas, planDe, registrarEvento,
} from '../sim/motor'
import { ESCENARIOS } from '../sim/escenarios'

// ------------------------------------------------------------------ datos iniciales
// Copia de trabajo en memoria: las acciones y la simulación la modifican, pero nada se
// persiste. «Restablecer datos de ejemplo» vuelve a construirla desde los JSON.
function datosIniciales() {
  const ahora = new Date()
  const base = desplazar(structuredClone({
    planes, organizaciones,
    usuariosPanel: usuarios.usuariosPanel, empleados: usuarios.empleados,
    clavesProveedor: claves.clavesProveedor, clavesVirtuales: claves.clavesVirtuales, tokensApi: claves.tokensApi,
    categoriasDatos: agentes.categoriasDatos, agentes: agentes.agentes, herramientas: agentes.herramientas, grafos: agentes.grafos,
    presupuestos: presupuestosAlertas.presupuestos, canales: presupuestosAlertas.canales, alertas: presupuestosAlertas.alertas,
    incidentes, facturas: facturasTickets.facturas, tickets: facturasTickets.tickets,
    clientes: backoffice.clientes, incidenciasTecnicas: backoffice.incidenciasTecnicas, modelos: backoffice.modelos, informes: backoffice.informes,
    socios: backoffice.socios, oportunidades: backoffice.oportunidades, contratos: backoffice.contratos, proveedores: backoffice.proveedores,
    versiones: backoffice.versiones, plataforma: backoffice.plataforma,
  }))
  const ses = desplazarSesiones(structuredClone(sesiones))
  const d = {
    ...base,
    sesiones: ses,
    eventos: generarEventos({ clavesVirtuales: base.clavesVirtuales, sesiones: ses, grafos: base.grafos, modelos: base.modelos }, ahora),
    sellos: generarSellos(ahora),
    gasto: generarGasto(base.clavesVirtuales, ahora),
    reservas: [],
    recomendaciones: {},
  }
  d.presupuestos = d.presupuestos.map((p) => ({ ...p, avisoBlando: p.gastado >= p.limiteBlando }))
  // Centro de notificaciones: una por alerta (aunque llegue por varios canales)
  const vistas = new Set()
  d.notificaciones = d.alertas.filter((a) => !vistas.has(a.resumen) && vistas.add(a.resumen))
    .map((a, i) => ({ id: `ntf_${a.id}`, destino: a.orgId, fecha: a.fecha, tipo: a.motivo, titulo: a.resumen, detalle: 'Enviada por tus canales de alerta', enlace: a.enlace, leida: i > 2 }))
  const bo = (h, titulo, detalle, enlace, tipo, leida = false) => ({ id: `ntf_bo_${huellaHex(titulo).slice(0, 6)}`, destino: 'bo', fecha: isoLocal(new Date(ahora - h * 3600e3)), tipo, titulo, detalle, enlace, leida })
  d.notificaciones.push(
    bo(0.1, 'Nuevo ticket TCK-1104 de Nexo Analytics', '¿Por qué se bloqueó la llamada del investigador con un 422?', '/bo/tickets/TCK-1104', 'ticket'),
    bo(4.4, 'Cobro fallido: Helix Logística S.A.', 'La plataforma de pagos rechazó el cargo de 59,29 €', '/bo/cobros', 'cobro'),
    bo(28, 'IT-0057 sigue en curso', 'Streaming de Anthropic degradado · v1.14.0 al 25 %', '/bo/incidencias', 'incidencia', true),
    bo(52, 'Informe mensual listo para presentar', 'Finanzas lo ha dejado en borrador', '/bo/informe', 'informe', true),
  )
  // Bandeja simulada de los canales del cliente (lo que habrían recibido Slack, email…)
  d.bandeja = d.alertas.map((a) => {
    const c = d.canales.find((x) => x.id === a.canal)
    return { id: `msg_${a.id}`, orgId: a.orgId, fecha: a.fecha, canal: a.canal, tipo: c?.tipo || 'email', destino: c?.destino || '—', motivo: a.motivo, titulo: a.resumen, detalle: '', enlace: a.enlace, entregado: true }
  })
  d.entregasWebhook = [
    { id: 'whd_1', orgId: 'org_nexo', fecha: isoLocal(new Date(ahora - 38 * 60e3)), evento: 'incident.created', estado: 410, intentos: 3, duracion: 212 },
    { id: 'whd_2', orgId: 'org_nexo', fecha: isoLocal(new Date(ahora - 6.1 * 3600e3)), evento: 'incident.created', estado: 200, intentos: 1, duracion: 96 },
    { id: 'whd_3', orgId: 'org_nexo', fecha: isoLocal(new Date(ahora - 30 * 3600e3)), evento: 'budget.soft_limit', estado: 200, intentos: 1, duracion: 88 },
  ]
  return d
}

export const PERSONAS = usuarios.personasDemo

const AppContext = createContext(null)
const leerLS = (k, def) => { try { return localStorage.getItem(k) ?? def } catch { return def } }
const escribirLS = (k, v) => { try { localStorage.setItem(k, v) } catch { /* sin almacenamiento */ } }

export function AppProvider({ children }) {
  const [datos, setDatos] = useState(datosIniciales)
  const ref = useRef(datos)
  const [personaId, setPersonaId] = useState(() => leerLS('unburn.persona', 'laura'))
  const personaRef = useRef(personaId)
  const [toasts, setToasts] = useState([])
  const [mostrarRefs, setMostrarRefs] = useState(() => leerLS('unburn.refs', '0') === '1')
  const [tema, setTemaState] = useState(() => leerLS('unburn.tema', 'sistema'))
  const [sistemaOscuro, setSistemaOscuro] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false)
  const [sim, setSimState] = useState({ activo: true, velocidad: 1 })
  const simRef = useRef(sim)
  const [escenario, setEscenario] = useState(null)
  const cancelRef = useRef(null)
  const [reloj, setReloj] = useState(0)

  // ---------------------------------------------------------------- toasts
  const toast = useCallback((mensaje, tipo = 'exito', detalle, enlace) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t.slice(-3), { id, mensaje, tipo, detalle, enlace }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), enlace ? 6500 : 4200)
  }, [])
  const cerrarToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  // ---------------------------------------------------------------- aplicar cambios al estado
  // Todas las modificaciones pasan por aquí: la referencia mantiene el estado al día de forma
  // síncrona (el motor encadena varios pasos seguidos) y los efectos se ejecutan una sola vez.
  const orgVisible = useCallback(() => {
    const p = PERSONAS.find((x) => x.id === personaRef.current)
    return p?.tipo === 'cliente' ? ref.current.usuariosPanel.find((u) => u.id === p.usuarioId)?.orgId : null
  }, [])
  const aplicar = useCallback((fn) => {
    const r = fn(ref.current)
    const nuevo = r && r.planes ? r : r.datos
    ref.current = nuevo
    setDatos(nuevo)
    for (const e of r?.efectos || []) {
      if (e.tipo === 'toast' && e.orgId === orgVisible()) toast(e.mensaje, e.nivel, e.detalle, e.enlace)
    }
    return r
  }, [toast, orgVisible])

  const mutar = useCallback((coleccion, fn) => aplicar((d) => ({ ...d, [coleccion]: fn(d[coleccion]) })), [aplicar])

  // ---------------------------------------------------------------- BP-08 en vivo
  const ejecutarPeticion = useCallback((p) => {
    let res
    aplicar((d) => { res = iniciarPeticion(d, { latenciaGatewayMs: Math.round(6 + Math.random() * 26), latenciaMs: 1500, tipo: 'generacion', decision: 'permitida', codigo: 200, ...p }); return res })
    if (!res.terminada) {
      const espera = Math.min(4000, res.peticion.latenciaMs || 1200) / simRef.current.velocidad
      setTimeout(() => aplicar((d) => liquidarPeticion(d, res.peticion)), espera)
    }
    return { ...res.peticion, terminada: res.terminada }
  }, [aplicar])

  const setSim = useCallback((cambios) => setSimState((s) => { const n = { ...s, ...cambios }; simRef.current = n; return n }), [])

  // Tráfico de fondo: una petición cada 1–3 s (a 10×, diez veces más rápido)
  useEffect(() => {
    let t
    const ciclo = () => {
      if (simRef.current.activo) {
        const p = peticionAleatoria(ref.current, 'org_nexo')
        if (p) ejecutarPeticion(p)
        if (Math.random() < 0.2) { const q = peticionAleatoria(ref.current, 'org_pmartin'); if (q) ejecutarPeticion(q) }
      }
      t = setTimeout(ciclo, (1000 + Math.random() * 2000) / simRef.current.velocidad)
    }
    t = setTimeout(ciclo, 1200)
    return () => clearTimeout(t)
  }, [ejecutarPeticion])

  // Mantenimiento periódico (BP-19): sellos cada 5 min y reservas vencidas; refresco de fechas relativas
  useEffect(() => {
    const i = setInterval(() => {
      setReloj((r) => r + 1)
      if (!simRef.current.activo) return
      aplicar((d) => {
        let n = cerrarReservasVencidas(d)
        const ultimo = n.sellos[0]
        if (ultimo && Date.now() - new Date(ultimo.fecha).getTime() >= 5 * 60e3) {
          const fecha = ahoraIso()
          const nuevos = ['org_nexo', 'org_pmartin'].map((orgId) => {
            const h = huellaHex(orgId + fecha)
            return { id: `sel_${h.slice(0, 10)}`, orgId, fecha, resumen: corta(h), firma: `ed25519:${h.slice(4, 16)}…`, eventos: n.eventos.filter((e) => e.orgId === orgId && new Date(e.fecha) > new Date(ultimo.fecha)).length, almacen: 'S3 Object Lock' }
          })
          n = { ...n, sellos: [...nuevos, ...n.sellos] }
        }
        return n
      })
    }, 15000)
    return () => clearInterval(i)
  }, [aplicar])

  // ---------------------------------------------------------------- escenarios de demostración
  const lanzarEscenario = useCallback(async (escId) => {
    if (cancelRef.current && !cancelRef.current.terminado) return
    const def = ESCENARIOS.find((e) => e.id === escId)
    const orgId = orgVisible() || 'org_nexo'
    const ficha = { cancelado: false, terminado: false }
    cancelRef.current = ficha
    const api = {
      orgId,
      datos: () => ref.current,
      plan: () => planDe(ref.current, orgId),
      esperar: (ms) => new Promise((resolver, rechazar) => {
        const intentar = () => {
          if (ficha.cancelado) return rechazar(new Error('cancelado'))
          if (!simRef.current.activo) return setTimeout(intentar, 250)
          setTimeout(() => (ficha.cancelado ? rechazar(new Error('cancelado')) : resolver()), ms / simRef.current.velocidad)
        }
        intentar()
      }),
      sesion: (titulo, claveId) => { let sid; aplicar((d) => { const r = crearSesion(d, { orgId, claveId, titulo }); sid = r.sesionId; return r.datos }); return sid },
      peticion: (p) => ejecutarPeticion({ orgId, ...p }),
      peticionAleatoria: () => peticionAleatoria(ref.current, orgId),
      incidente: (inc) => { let r; aplicar((d) => { r = registrarIncidente(d, inc); return r }); return r.incidente },
      actualizarIncidente: (iid, cambios) => mutar('incidentes', (l) => l.map((i) => (i.id === iid ? { ...i, ...cambios, ultimaActividad: ahoraIso(), ocurrencias: (i.ocurrencias || 1) + 1 } : i))),
      notificar: (titulo, detalle, enlace) => aplicar((d) => notificar(d, orgId, titulo, detalle, enlace, 'seguridad')),
      toast: (m, n, det, enl) => toast(m, n, det, enl),
      mutar: (fn) => aplicar(fn),
      coste: (modelo, t) => costeTokens(ref.current.modelos, modelo, t),
      rafaga: (n) => aplicar((d) => {
        const ks = d.clavesVirtuales.filter((k) => k.orgId === orgId && k.estado === 'activa')
        const total = ks.reduce((a, k) => a + Math.max(1, k.peticionesMes), 0)
        const d2 = { ...d, clavesVirtuales: d.clavesVirtuales.map((k) => (ks.includes(k) ? { ...k, peticionesMes: k.peticionesMes + Math.round((n * Math.max(1, k.peticionesMes)) / total) } : k)) }
        return contarFacturables(d2, orgId, n)
      }),
      paso: (texto) => setEscenario((e) => (e ? { ...e, paso: texto, pasos: (e.pasos || 0) + 1 } : e)),
      fin: (texto, enlace) => { ficha.terminado = true; setEscenario((e) => (e ? { ...e, estado: 'terminado', paso: texto, enlace } : e)) },
    }
    setEscenario({ id: escId, titulo: def.titulo, estado: 'en curso', paso: 'Preparando…', pasos: 0, orgId })
    try {
      await def.ejecutar(api)
    } catch (e) {
      if (e.message !== 'cancelado') { console.error(e); toast('El escenario se ha detenido por un error', 'error', e.message) }
    }
    ficha.terminado = true
    setEscenario((e) => (e && e.estado === 'en curso' ? { ...e, estado: 'terminado' } : e))
  }, [aplicar, ejecutarPeticion, mutar, toast, orgVisible])

  const cancelarEscenario = useCallback(() => { if (cancelRef.current) cancelRef.current.cancelado = true; setEscenario(null) }, [])
  const cerrarEscenario = useCallback(() => setEscenario(null), [])

  // ---------------------------------------------------------------- persona, tema y referencias
  const cambiarPersona = useCallback((pid) => { personaRef.current = pid; setPersonaId(pid); escribirLS('unburn.persona', pid) }, [])
  const alternarRefs = useCallback(() => setMostrarRefs((v) => { escribirLS('unburn.refs', v ? '0' : '1'); return !v }), [])
  const setTema = useCallback((t) => { setTemaState(t); escribirLS('unburn.tema', t) }, [])
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const h = (e) => setSistemaOscuro(e.matches)
    mq?.addEventListener?.('change', h)
    return () => mq?.removeEventListener?.('change', h)
  }, [])
  const oscuro = tema === 'oscuro' || (tema === 'sistema' && sistemaOscuro)
  useEffect(() => {
    const raiz = document.documentElement
    raiz.classList.add('sin-transiciones')
    raiz.classList.toggle('dark', oscuro)
    const t = setTimeout(() => raiz.classList.remove('sin-transiciones'), 50)
    return () => clearTimeout(t)
  }, [oscuro])

  const reiniciar = useCallback(() => {
    if (cancelRef.current) cancelRef.current.cancelado = true
    setEscenario(null)
    const d = datosIniciales()
    ref.current = d
    setDatos(d)
    toast('Datos de ejemplo restablecidos', 'info')
  }, [toast])

  const valor = useMemo(() => {
    const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0]
    const usuario = persona.tipo === 'cliente' ? datos.usuariosPanel.find((u) => u.id === persona.usuarioId) : null
    const empleado = persona.tipo === 'backoffice' ? datos.empleados.find((e) => e.id === persona.empleadoId) : null
    const org = usuario ? datos.organizaciones.find((o) => o.id === usuario.orgId) : null
    const plan = org ? datos.planes.find((p) => p.id === org.suscripcion.plan) : null
    const registrarCambio = (mensaje) => {
      const v = (ref.current.grafos[org.id].version || 0) + 1
      const autor = usuario ? `${usuario.nombre} ${usuario.apellidos.split(' ')[0]}` : '—'
      // Cada cambio publica una versión nueva en el Gateway y queda en el registro de auditoría (IF-20)
      aplicar((d) => registrarEvento({ ...d, grafos: { ...d.grafos, [org.id]: { ...d.grafos[org.id], version: v } } }, {
        id: `evt_cfg${v}_${Math.random().toString(36).slice(2, 6)}`, orgId: org.id, tipo: 'cambio de configuración', fecha: ahoraIso(), claveId: null, sesionId: null, llamada: null,
        agente: autor, encargadoPor: null, dependeDe: [], proveedor: '—', api: 'admin', modeloPedido: '—', modeloUsado: null, herramienta: null, herramientasQuitadas: [],
        tokens: { entrada: 0, salida: 0, razonamiento: 0, cache: 0 }, usosHerramientasProveedor: 0, costeEstimado: 0, costeReal: 0, latenciaMs: 0, latenciaGatewayMs: 0,
        decision: 'configuración', codigo: 0, motivo: `${mensaje} · por ${autor} desde el panel (API de administración)`, versionConfig: `cfg-v${v}`, ip: '81.44.12.9', usuarioFinal: null,
      }))
      toast(mensaje, 'exito', `Configuración cfg-v${v} publicada en el Gateway`)
      return v
    }
    const destinoNotif = org ? org.id : 'bo'
    return {
      datos, aplicar, mutar, registrarCambio, toast, toasts, cerrarToast, reiniciar,
      mostrarRefs, alternarRefs, tema, setTema, oscuro, reloj,
      sim, setSim, escenario, lanzarEscenario, cancelarEscenario, cerrarEscenario, ejecutarPeticion,
      persona, cambiarPersona, usuario, empleado, org, plan,
      esCliente: persona.tipo === 'cliente',
      esAdmin: usuario?.rol === 'administrador',
      esLector: usuario?.rol === 'lector',
      deOrg: (coleccion) => (org ? datos[coleccion].filter((x) => x.orgId === org.id) : []),
      notificaciones: datos.notificaciones.filter((n) => n.destino === destinoNotif),
      marcarLeidas: (ids) => aplicar((d) => ({ ...d, notificaciones: d.notificaciones.map((n) => (n.destino === destinoNotif && (!ids || ids.includes(n.id)) ? { ...n, leida: true } : n)) })),
    }
  }, [datos, aplicar, mutar, toast, toasts, cerrarToast, reiniciar, mostrarRefs, alternarRefs, tema, setTema, oscuro, reloj, sim, setSim, escenario, lanzarEscenario, cancelarEscenario, cerrarEscenario, ejecutarPeticion, personaId, cambiarPersona])

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
