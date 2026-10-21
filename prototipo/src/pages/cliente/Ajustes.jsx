import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Cloud, Download, Lock, Server, ShieldCheck } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { Badge, Button, Card, ConfirmModal, Field, Input, KV, PageHeader, PlanBadge, Section, Select, Toggle, cx } from '../../components/ui'

// Funciones de la arquitectura objetivo (12.3): se muestran, pero aún no se pueden activar
const PROXIMAMENTE = [
  ['Caché de respuestas', 'Reutiliza respuestas a preguntas equivalentes para no pagar dos veces. Vendrá desactivada: guardar respuestas es opcional (OF-10, DEC-13).'],
  ['Detección de bucles por significado', 'Además de las reglas exactas, detectará repeticiones expresadas con otras palabras (OF-05, DEC-07).'],
  ['Proveedor alternativo', 'Si un proveedor de IA falla, la petición podrá enviarse a otro, como Google (OF-14).'],
  ['Proxy MCP', 'Revisará cada llamada de un agente a tus servidores MCP accesibles por la red: argumentos y volumen de datos (OF-09, AP-13).'],
  ['Credenciales firmadas de agentes', 'Identificará a cada agente con credenciales de tu sistema de identidad, además de la clave virtual (DEC-11).'],
  ['Medir qué intervención funciona mejor', 'Con los datos acumulados, el diagnóstico causal medirá qué tipo de intervención detiene mejor los bucles (OF-06).'],
]

export default function Ajustes() {
  const { org, plan, mutar, toast, esAdmin } = useApp()
  const [f, setF] = useState({ nombre: org.nombre, cif: org.cif, direccionFiscal: org.direccionFiscal, zonaHoraria: org.zonaHoraria, politicaFallosDefecto: org.politicaFallosDefecto })
  const [baja, setBaja] = useState(false)
  const [anticipado, setAnticipado] = useState(false)
  const cambiado = Object.keys(f).some((k) => f[k] !== org[k])
  const guardar = () => { mutar('organizaciones', (l) => l.map((o) => (o.id === org.id ? { ...o, ...f } : o))); toast('Ajustes guardados') }
  const enterprise = plan.id === 'enterprise'
  return (
    <>
      <PageHeader title="Ajustes de la organización" refs={['BP-03', 'IC-01', 'OF-14', 'OF-15', 'DEC-08', 'DEC-13', 'DEC-17', '12.3']}
        description="Datos de la organización, cómo se tratan tus datos y la modalidad de servicio." />

      <Section title="General">
        <Card className="grid gap-4 p-4 sm:grid-cols-2">
          <Field label="Razón social" className="sm:col-span-2"><Input disabled={!esAdmin} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
          <Field label="CIF / NIF"><Input disabled={!esAdmin} value={f.cif} onChange={(e) => setF({ ...f, cif: e.target.value })} /></Field>
          <Field label="Zona horaria" hint="Marca cuándo se reinician los presupuestos diarios"><Select disabled={!esAdmin} value={f.zonaHoraria} onChange={(e) => setF({ ...f, zonaHoraria: e.target.value })}><option>Europe/Madrid</option><option>Atlantic/Canary</option><option>Europe/Lisbon</option></Select></Field>
          <Field label="Dirección fiscal" className="sm:col-span-2"><Input disabled={!esAdmin} value={f.direccionFiscal} onChange={(e) => setF({ ...f, direccionFiscal: e.target.value })} /></Field>
          <Field label="Política ante fallos para las claves nuevas" className="sm:col-span-2" hint="Si un fallo interno impide comprobar presupuestos o permisos (DEC-08). Cada clave puede cambiarla.">
            <Select disabled={!esAdmin} value={f.politicaFallosDefecto} onChange={(e) => setF({ ...f, politicaFallosDefecto: e.target.value })}><option value="bloquear">Bloquear las peticiones (503) · recomendado</option><option value="dejar_pasar">Dejarlas pasar sin control</option></Select>
          </Field>
          {esAdmin && <div className="flex justify-end gap-2 sm:col-span-2"><Button disabled={!cambiado} onClick={() => setF({ nombre: org.nombre, cif: org.cif, direccionFiscal: org.direccionFiscal, zonaHoraria: org.zonaHoraria, politicaFallosDefecto: org.politicaFallosDefecto })}>Descartar</Button><Button variant="primary" disabled={!cambiado} onClick={guardar}>Guardar</Button></div>}
        </Card>
      </Section>

      <Section title="Datos y privacidad">
        <Card className="p-4">
          <KV cols={3} items={[
            ['Contenido de las peticiones', <span key="c" className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-ink-400" /> No se guarda (DEC-13)</span>],
            ['Residencia de los datos', 'Unión Europea · AWS Irlanda (eu-west-1)'],
            ['Retención del registro de auditoría', <span key="r">{plan.diasRetencion >= 180 ? '6 meses o más' : `${plan.diasRetencion} días`} <PlanBadge plan={plan.id} /></span>],
            ['Agregados de gasto', '13 meses, en intervalos de 15 minutos'],
            ['Clave real del proveedor', 'Cifrada con KMS; nadie puede volver a verla'],
            ['Contrato de tratamiento de datos', `Aceptado el ${new Date(org.suscripcion.contratoTratamientoAceptado).toLocaleDateString('es-ES')}`],
          ]} />
        </Card>
      </Section>

      <Section title="Modalidad de servicio" description="La nube confidencial y el despliegue privado se contratan con Enterprise (DEC-17)">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['nube', Cloud, 'Nube de Unburn', 'Servicio estándar en la UE, gestionado por Unburn.', true],
            ['confidencial', ShieldCheck, 'Nube confidencial', 'El gateway se ejecuta en máquinas protegidas por hardware y te entrega una prueba firmada de qué software trata tus datos (atestación, OF-15).', false],
            ['privado', Server, 'Despliegue privado', 'Instalación central dentro de tu red: ningún dato sale de ella. Licencia anual.', false],
          ].map(([id, I, t, d, actual]) => (
            <div key={id} className={cx('rounded-lg border p-4', actual ? 'border-navy' : 'border-ink-200')}>
              <div className="flex items-center justify-between"><I className="h-4 w-4 text-ink-500" />{actual ? <Badge tone="green">Actual</Badge> : <Badge tone="navy">Enterprise</Badge>}</div>
              <p className="mt-3 text-sm font-medium text-ink-950">{t}</p>
              <p className="mt-1 text-xs text-ink-600">{d}</p>
              {!actual && !enterprise && <Link to="/app/suscripcion" className="mt-3 inline-block text-xs font-medium text-ink-900 hover:underline">Hablar con Ventas</Link>}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Próximamente" description="Funciones de la arquitectura objetivo. Los clientes Pro pueden probarlas antes con el programa de acceso anticipado.">
        <Card className="divide-y divide-ink-100">
          {PROXIMAMENTE.map(([t, d]) => (
            <div key={t} className="flex items-start justify-between gap-6 px-4 py-3">
              <div><p className="text-sm text-ink-950">{t}</p><p className="mt-0.5 max-w-2xl text-xs text-ink-500">{d}</p></div>
              <div className="flex shrink-0 items-center gap-3"><Badge tone="gray" dot={false}>Próximamente</Badge><Toggle checked={false} disabled label={t} onChange={() => {}} /></div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-6 bg-ink-50 px-4 py-3">
            <div><p className="text-sm text-ink-950">Programa de acceso anticipado</p><p className="mt-0.5 text-xs text-ink-500">Probar funciones nuevas antes que nadie y contarnos qué tal (4.4, OT 3.3).</p></div>
            <Button size="sm" variant={anticipado ? 'secondary' : 'primary'} icon={anticipado ? Check : undefined} disabled={plan.id === 'gratis' || !esAdmin} title={plan.id === 'gratis' ? 'Disponible para clientes Pro y Enterprise' : undefined} onClick={() => { setAnticipado(!anticipado); toast(anticipado ? 'Has salido del programa' : 'Te has apuntado al acceso anticipado', 'exito') }}>{anticipado ? 'Apuntado' : 'Apuntarme'}</Button>
          </div>
        </Card>
      </Section>

      {esAdmin && (
        <Section title="Exportar datos y baja">
          <Card className="divide-y divide-ink-100">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div><p className="text-sm text-ink-950">Exportar todos los datos</p><p className="text-xs text-ink-500">Registro de auditoría y configuración, por ejemplo para cambiar de proveedor (IC-24, Data Act).</p></div>
              <Button size="sm" icon={Download} onClick={() => toast('Exportación preparada', 'exito', 'Te enviaremos un enlace de descarga por email en unos minutos')}>Exportar</Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div><p className="text-sm text-ink-950">Dar de baja la organización</p><p className="text-xs text-ink-500">Los datos se borran en 30 días, salvo las facturas, los agregados de gasto y los sellos de auditoría (BP-19).</p></div>
              <Button size="sm" variant="danger-soft" onClick={() => setBaja(true)}>Dar de baja</Button>
            </div>
          </Card>
        </Section>
      )}

      <ConfirmModal open={baja} onClose={() => setBaja(false)} title="Dar de baja la organización" confirmLabel="Dar de baja" palabra={org.nombre}
        onConfirm={() => { setBaja(false); toast('Solicitud de baja registrada (simulada)', 'aviso', 'En un entorno real, todas las claves dejarían de funcionar ahora') }}>
        Todas las claves virtuales dejarán de funcionar al momento. Exporta antes tus datos. Pasados 30 días se borra todo salvo las facturas, los agregados de gasto (hasta cerrar la última factura) y los sellos de auditoría (hasta que vence su bloqueo).
      </ConfirmModal>
    </>
  )
}
