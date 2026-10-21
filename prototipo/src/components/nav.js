import {
  BarChart3, Bell, Briefcase, Building2, Code2, CreditCard, FileText, FlaskConical, Gauge, Handshake, KeyRound, LayoutDashboard,
  Lightbulb, LifeBuoy, Network, Receipt, ScrollText, Server, Settings, ShieldCheck, Siren, Tags, Ticket, Truck, Users, Wallet, Wrench,
} from 'lucide-react'

// Navegación de cada zona: Panel web (AP-01) y Consola de back-office (AP-12)
export const NAV_CLIENTE = [
  { grupo: null, items: [
    { to: '/app', label: 'Resumen', icon: Gauge, end: true, atajo: 'g r' },
    { to: '/app/recomendaciones', label: 'Recomendaciones', icon: Lightbulb, contador: 'recomendaciones' },
    { to: '/app/gasto', label: 'Gasto y sesiones', icon: BarChart3, atajo: 'g g' },
    { to: '/app/incidentes', label: 'Incidentes', icon: Siren, contador: 'incidentes', atajo: 'g i' },
  ] },
  { grupo: 'Control', items: [
    { to: '/app/claves', label: 'Claves virtuales', icon: KeyRound, atajo: 'g c' },
    { to: '/app/presupuestos', label: 'Presupuestos', icon: Wallet, atajo: 'g p' },
    { to: '/app/agentes', label: 'Agentes y permisos', icon: ShieldCheck, contador: 'caminos' },
  ] },
  { grupo: 'Trazabilidad', items: [
    { to: '/app/contexto', label: 'Grafo de contexto', icon: Network },
    { to: '/app/auditoria', label: 'Registro de auditoría', icon: ScrollText, atajo: 'g a' },
  ] },
  { grupo: 'Desarrolladores', items: [
    { to: '/app/probador', label: 'Probador de peticiones', icon: FlaskConical },
    { to: '/app/desarrolladores', label: 'API y webhooks', icon: Code2 },
  ] },
  { grupo: 'Organización', items: [
    { to: '/app/alertas', label: 'Canales de alerta', icon: Bell },
    { to: '/app/suscripcion', label: 'Suscripción y facturas', icon: CreditCard },
    { to: '/app/usuarios', label: 'Usuarios', icon: Users },
    { to: '/app/soporte', label: 'Soporte', icon: LifeBuoy },
    { to: '/app/ajustes', label: 'Ajustes', icon: Settings },
  ] },
]

// Cada empleado solo accede a la parte de la consola que le corresponde (AP-12, 12.5)
const SOP = 'Soporte', ING = 'Ingeniería y Ciberseguridad', VEN = 'Ventas', FIN = 'Finanzas', LEG = 'Legal y cumplimiento', DIR = 'Dirección'
export const NAV_BACKOFFICE = [
  { grupo: null, items: [
    { to: '/bo/direccion', label: 'Cuadro de mando', icon: LayoutDashboard, acceso: [DIR] },
    { to: '/bo/clientes', label: 'Clientes', icon: Building2, acceso: [SOP, ING, VEN, FIN, LEG, DIR] },
  ] },
  { grupo: 'Soporte e Ingeniería', items: [
    { to: '/bo/tickets', label: 'Tickets', icon: Ticket, contador: 'tickets', acceso: [SOP, ING] },
    { to: '/bo/incidencias', label: 'Incidencias técnicas', icon: Wrench, contador: 'incidencias', acceso: [ING, LEG] },
    { to: '/bo/modelos', label: 'Modelos y precios', icon: Tags, acceso: [ING] },
  ] },
  { grupo: 'Ventas', items: [
    { to: '/bo/enterprise', label: 'Contratos Enterprise', icon: Briefcase, acceso: [VEN, LEG] },
    { to: '/bo/socios', label: 'Socios', icon: Handshake, acceso: [VEN, FIN] },
  ] },
  { grupo: 'Finanzas y Legal', items: [
    { to: '/bo/cobros', label: 'Cobros', icon: Receipt, contador: 'cobros', acceso: [FIN] },
    { to: '/bo/proveedores', label: 'Proveedores', icon: Truck, acceso: [FIN, LEG] },
    { to: '/bo/informe', label: 'Informe mensual', icon: FileText, acceso: [FIN, DIR] },
  ] },
]

export const ETIQUETAS = Object.fromEntries([...NAV_CLIENTE, ...NAV_BACKOFFICE].flatMap((g) => g.items.map((i) => [i.to, i.label])))
Object.assign(ETIQUETAS, { '/app/notificaciones': 'Notificaciones', '/app/cuenta': 'Mi cuenta', '/bo/notificaciones': 'Notificaciones', '/bo/cuenta': 'Mi cuenta' })

export const puedeAcceder = (departamento, ruta) => {
  const item = NAV_BACKOFFICE.flatMap((g) => g.items).find((i) => ruta === i.to || ruta.startsWith(i.to + '/'))
  return !item || item.acceso.includes(departamento)
}

export const navBackoffice = (departamento) =>
  NAV_BACKOFFICE.map((g) => ({ ...g, items: g.items.filter((i) => i.acceso.includes(departamento)) })).filter((g) => g.items.length)

export const inicioDe = (persona) => {
  if (persona.tipo === 'cliente') return '/app'
  return { sergio: '/bo/direccion', marta: '/bo/tickets', diego: '/bo/incidencias', javier: '/bo/enterprise', elena: '/bo/cobros', lucia: '/bo/enterprise' }[persona.id] || '/bo/clientes'
}

export const ICONO_SERVIDOR = Server
