import { useState } from 'react'
import { Laptop, Monitor, Moon, Smartphone, Sun } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { haceCuanto } from '../../lib/format'
import { isoLocal } from '../../lib/tiempo'
import { Badge, Button, Card, Checkbox, ConfirmModal, Field, Input, Kbd, PageHeader, Section, Toggle, cx } from '../../components/ui'

const hace = (min) => isoLocal(new Date(Date.now() - min * 60e3))

export default function Cuenta() {
  const { usuario, empleado, tema, setTema, toast, esCliente } = useApp()
  const p = usuario || empleado
  const [perfil, setPerfil] = useState({ nombre: p.nombre, apellidos: p.apellidos })
  const [dosPasos, setDosPasos] = useState(true)
  const [avisos, setAvisos] = useState({ resumenSemanal: true, incidentes: true, producto: false })
  const [sesiones, setSesiones] = useState([
    { id: 1, disp: 'Chrome · Windows', lugar: 'Madrid, España', fecha: hace(0), actual: true, icon: Laptop },
    { id: 2, disp: 'Safari · iPhone', lugar: 'Madrid, España', fecha: hace(190), icon: Smartphone },
    { id: 3, disp: 'Firefox · Ubuntu', lugar: 'Valencia, España', fecha: hace(60 * 26), icon: Monitor },
  ])
  const [cerrar, setCerrar] = useState(false)
  return (
    <>
      <PageHeader title="Mi cuenta" description={`${p.email} · ${usuario ? (usuario.rol === 'administrador' ? 'Administrador' : 'Lector') : `${empleado.departamento} · ${empleado.rol}`}`} />

      <Section title="Perfil">
        <Card className="grid gap-4 p-4 sm:grid-cols-3">
          <Field label="Nombre"><Input value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} /></Field>
          <Field label="Apellidos"><Input value={perfil.apellidos} onChange={(e) => setPerfil({ ...perfil, apellidos: e.target.value })} /></Field>
          <Field label="Email" hint="Lo gestiona el administrador de tu organización"><Input value={p.email} disabled /></Field>
          <div className="sm:col-span-3 flex justify-end"><Button variant="primary" onClick={() => toast('Perfil guardado')}>Guardar</Button></div>
        </Card>
      </Section>

      <Section title="Apariencia" description="Se guarda en este navegador">
        <div className="grid gap-3 sm:grid-cols-3">
          {[['claro', 'Claro', Sun], ['oscuro', 'Oscuro', Moon], ['sistema', 'Igual que el sistema', Monitor]].map(([id, n, I]) => (
            <button key={id} onClick={() => setTema(id)} aria-pressed={tema === id} className={cx('flex items-center gap-3 rounded-lg border p-4 text-left transition-colors', tema === id ? 'border-navy ring-1 ring-navy' : 'border-ink-200 hover:border-ink-300')}>
              <I className="h-4 w-4 text-ink-500" /><span className="text-sm text-ink-900">{n}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Seguridad">
        <Card className="divide-y divide-ink-100">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div><p className="text-sm text-ink-950">Verificación en dos pasos</p><p className="text-xs text-ink-500">Código de una aplicación de autenticación al iniciar sesión</p></div>
            <div className="flex items-center gap-3">{dosPasos && <Badge tone="green">Activada</Badge>}<Toggle checked={dosPasos} label="Verificación en dos pasos" onChange={(v) => { setDosPasos(v); toast(v ? 'Verificación en dos pasos activada' : 'Verificación en dos pasos desactivada', v ? 'exito' : 'aviso') }} /></div>
          </div>
          <div className="px-4 py-3">
            <div className="mb-2 flex items-center justify-between"><p className="text-sm text-ink-950">Sesiones abiertas</p><Button size="sm" variant="danger-soft" onClick={() => setCerrar(true)} disabled={sesiones.length === 1}>Cerrar las demás</Button></div>
            <ul className="divide-y divide-ink-100 rounded-md border border-ink-200">
              {sesiones.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                  <s.icon className="h-4 w-4 text-ink-400" />
                  <div className="min-w-0 flex-1"><p className="text-sm text-ink-900">{s.disp} {s.actual && <span className="text-xs text-ink-400">· esta sesión</span>}</p><p className="text-xs text-ink-500">{s.lugar} · {s.actual ? 'activa ahora' : haceCuanto(s.fecha)}</p></div>
                  {!s.actual && <Button size="xs" variant="ghost" onClick={() => { setSesiones((l) => l.filter((x) => x.id !== s.id)); toast('Sesión cerrada', 'exito', s.disp) }}>Cerrar</Button>}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Section>

      <Section title="Avisos por email" description="Las alertas operativas se configuran en Canales de alerta">
        <Card className="space-y-3 p-4">
          <Checkbox checked={avisos.resumenSemanal} onChange={(v) => setAvisos({ ...avisos, resumenSemanal: v })} label="Resumen semanal" description={esCliente ? 'Gasto, incidentes, gasto evitado y recomendaciones de la semana' : 'Actividad de tu departamento'} />
          <Checkbox checked={avisos.incidentes} onChange={(v) => setAvisos({ ...avisos, incidentes: v })} label="Incidentes asignados o mencionados" />
          <Checkbox checked={avisos.producto} onChange={(v) => setAvisos({ ...avisos, producto: v })} label="Novedades del producto y programa de acceso anticipado" />
        </Card>
      </Section>

      <Section title="Atajos de teclado">
        <Card className="grid gap-2 p-4 text-sm sm:grid-cols-2">
          {[['Ctrl K', 'Paleta de comandos'], ['?', 'Todos los atajos'], ['g i', 'Ir a Incidentes'], ['Espacio', 'Pausar la simulación']].map(([k, d]) => <div key={k} className="flex items-center justify-between"><span className="text-ink-700">{d}</span><span className="flex gap-1">{k.split(' ').map((x) => <Kbd key={x}>{x}</Kbd>)}</span></div>)}
        </Card>
      </Section>

      <ConfirmModal open={cerrar} onClose={() => setCerrar(false)} title="Cerrar las demás sesiones" confirmLabel="Cerrar sesiones" onConfirm={() => { setSesiones((l) => l.filter((s) => s.actual)); setCerrar(false); toast('Se han cerrado las demás sesiones') }}>
        Tendrás que volver a iniciar sesión en esos dispositivos.
      </ConfirmModal>
    </>
  )
}
