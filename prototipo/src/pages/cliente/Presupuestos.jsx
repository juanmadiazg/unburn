import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { nombreClave, useGasto } from '../../lib/hooks'
import { aleatorio, euros, haceCuanto, porcentaje } from '../../lib/format'
import { Badge, Button, Card, Cifra, ConfirmModal, Field, Input, Modal, Mono, PageHeader, PuntoVivo, Section, Select, UsageBar } from '../../components/ui'

export default function Presupuestos() {
  const { deOrg, mutar, org, registrarCambio, datos, esAdmin } = useApp()
  const [params, setParams] = useSearchParams()
  const presupuestos = deOrg('presupuestos')
  const claves = deOrg('clavesVirtuales').filter((k) => k.estado === 'activa')
  const [editar, setEditar] = useState(null)
  const [borrar, setBorrar] = useState(null)
  const nuevo = () => setEditar({ ambito: 'clave', claveId: claves[0]?.id, periodo: 'diario', limiteBlando: '', limiteDuro: '' })

  useEffect(() => {
    if (params.get('nuevo') && esAdmin) nuevo()
    if (params.toString()) setParams({}, { replace: true })
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  const guardar = (p) => {
    if (p.id) mutar('presupuestos', (l) => l.map((x) => (x.id === p.id ? p : x)))
    else mutar('presupuestos', (l) => [...l, { ...p, id: `pre_${aleatorio(6)}`, orgId: org.id, gastado: 0, reservado: 0 }])
    registrarCambio(p.id ? 'Presupuesto actualizado' : 'Presupuesto creado')
    setEditar(null)
  }
  const eliminar = () => {
    mutar('presupuestos', (l) => l.filter((x) => x.id !== borrar.id))
    registrarCambio('Presupuesto eliminado')
    setBorrar(null)
  }
  const reservas = deOrg('reservas')
  const g = useGasto()
  const nombre = (p) => (p.ambito === 'organizacion' ? 'Toda la organización' : nombreClave(datos.clavesVirtuales, p.claveId))

  const grupos = [
    ['Organización', 'Afectan a todas las claves', presupuestos.filter((p) => p.ambito === 'organizacion')],
    ['Por clave virtual', 'Solo a la clave indicada', presupuestos.filter((p) => p.ambito === 'clave')],
  ]

  return (
    <>
      <PageHeader title="Presupuestos" refs={['BP-06', 'OF-03', 'IC-12', 'IC-17', 'AP-04']}
        description="Límites de gasto diarios o mensuales, con la previsión de gasto al cierre del periodo si se mantiene el ritmo actual (OF-16). El límite blando envía una alerta; el duro corta con un 402."
        actions={<Button variant="brand" icon={Plus} requiereAdmin onClick={nuevo}>Crear presupuesto</Button>} />

      <p className="mb-6 max-w-3xl text-sm text-ink-600">
        Antes de cada petición, Unburn aparta su coste máximo posible en todos los presupuestos afectados a la vez y, al terminar, descuenta lo que de verdad costó y libera el resto. La parte rayada de cada barra es lo reservado en este momento; la línea vertical marca el límite blando.
      </p>

      <Section title="Reservas en curso" description="Peticiones que ya han reservado su peor caso y esperan la respuesta del proveedor (IC-17)">
        <Card>
          <div className="flex items-center gap-2 border-b border-ink-150 px-4 py-2.5 text-xs text-ink-500">
            <PuntoVivo activo={reservas.length > 0} /> {reservas.length ? `${reservas.length} ${reservas.length === 1 ? 'reserva abierta' : 'reservas abiertas'} · ${euros(reservas.reduce((a, r) => a + r.importe, 0), 4)} apartados` : 'Ninguna reserva abierta en este momento'}
          </div>
          <ul className="max-h-[188px] divide-y divide-ink-100 overflow-y-auto" data-reservas>
            {reservas.slice(0, 12).map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-2 text-sm animate-fila-nueva">
                <Mono className="text-ink-400">{r.id}</Mono>
                <span className="min-w-0 flex-1 truncate text-ink-800">{datos.clavesVirtuales.find((k) => k.id === r.claveId)?.nombre} · <span className="font-mono text-[12px] text-ink-500">{r.agente}</span></span>
                <span className="text-xs text-ink-500">{r.presupuestos.length} presupuestos</span>
                <span className="w-24 text-right font-mono text-[12px] tabular-nums text-ink-950">{euros(r.importe, 4)}</span>
                <span className="w-20 text-right text-xs text-ink-400">{haceCuanto(r.inicio)}</span>
              </li>
            ))}
          </ul>
          <p className="border-t border-ink-150 px-4 py-2.5 text-xs text-ink-500">Si una reserva caduca sin liquidarse, se cierra con un gasto estimado (BP-19). El sobrepaso posible queda acotado y registrado (DEC-05).</p>
        </Card>
      </Section>

      {grupos.map(([titulo, desc, lista]) => (
        <Section key={titulo} title={titulo} description={desc}>
          {lista.length === 0 ? <Card className="px-4 py-8 text-center text-sm text-ink-500">Sin presupuestos.</Card> : (
            <Card>
              <ul className="divide-y divide-ink-100">
                {lista.map((p) => {
                  const agotado = p.gastado >= p.limiteDuro
                  const blando = p.gastado >= p.limiteBlando
                  return (
                    <li key={p.id} className="grid items-center gap-4 px-4 py-3.5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_auto]">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink-950">{nombre(p)}</p>
                        <p className="text-xs text-ink-500">{p.periodo === 'diario' ? 'Diario · se reinicia a las 00:00' : 'Mensual · se reinicia el día 1'}</p>
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="tabular-nums text-ink-950"><Cifra valor={p.gastado} formato={(v) => euros(v)} /> <span className="text-ink-400">de {euros(p.limiteDuro, 0)} · {porcentaje(p.gastado, p.limiteDuro)} %</span></span>
                          <span className="tabular-nums text-ink-500">aviso a {euros(p.limiteBlando, 0)} · reservado <Cifra valor={p.reservado} formato={(v) => euros(v)} /></span>
                        </div>
                        <UsageBar gastado={p.gastado} reservado={p.reservado} blando={p.limiteBlando} duro={p.limiteDuro} />
                        {(() => { const f = g.previsionPresupuesto(p); return (
                          <p className={`mt-1.5 text-xs ${f.supera ? 'text-red-600' : 'text-ink-500'}`} data-prevision>
                            Previsión al cierre {p.periodo === 'diario' ? 'del día' : 'del mes'}: <span className="tabular-nums font-medium">{euros(f.prevision)}</span>
                            {f.supera ? (f.cuando ? ` · al ritmo actual llegaría al límite duro el ${f.cuando.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}` : ' · superaría el límite duro') : ` · ${porcentaje(f.prevision, p.limiteDuro)} % del límite`}
                          </p>
                        ) })()}
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {agotado ? <Badge tone="red">Agotado · 402</Badge> : blando ? <Badge tone="amber">Aviso enviado</Badge> : <Badge tone="green">En rango</Badge>}
                        <Button size="sm" requiereAdmin onClick={() => setEditar(p)}>Editar</Button>
                        <Button size="sm" variant="ghost" requiereAdmin onClick={() => setBorrar(p)}>Eliminar</Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}
        </Section>
      ))}

      {editar && <EditarModal p={editar} claves={claves} onClose={() => setEditar(null)} onGuardar={guardar} />}
      <ConfirmModal open={!!borrar} onClose={() => setBorrar(null)} onConfirm={eliminar} title="Eliminar presupuesto" confirmLabel="Eliminar">
        Sin el presupuesto {borrar && `${borrar.periodo} de ${nombre(borrar)}`}, ese gasto solo quedará limitado por los demás presupuestos que le afecten.
      </ConfirmModal>
    </>
  )
}

function EditarModal({ p, claves, onClose, onGuardar }) {
  const [f, setF] = useState(p)
  const blando = Number(f.limiteBlando), duro = Number(f.limiteDuro)
  const error = f.limiteBlando !== '' && f.limiteDuro !== '' && blando >= duro ? 'Debe ser mayor que el límite blando' : null
  const valido = blando > 0 && duro > 0 && !error
  return (
    <Modal open onClose={onClose} title={p.id ? 'Editar presupuesto' : 'Crear presupuesto'} description="El cambio se aplica en el Gateway al momento."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!valido} onClick={() => onGuardar({ ...f, limiteBlando: blando, limiteDuro: duro })}>Guardar</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ámbito"><Select disabled={!!p.id} value={f.ambito} onChange={(e) => setF({ ...f, ambito: e.target.value })}><option value="organizacion">Organización</option><option value="clave">Clave virtual</option></Select></Field>
        <Field label="Periodo"><Select disabled={!!p.id} value={f.periodo} onChange={(e) => setF({ ...f, periodo: e.target.value })}><option value="diario">Diario</option><option value="mensual">Mensual</option></Select></Field>
        {f.ambito === 'clave' && <Field label="Clave" className="sm:col-span-2"><Select disabled={!!p.id} value={f.claveId || ''} onChange={(e) => setF({ ...f, claveId: e.target.value })}>{claves.map((k) => <option key={k.id} value={k.id}>{k.nombre}</option>)}</Select></Field>}
        <Field label="Límite blando (€)" hint="Envía una alerta al cruzarlo"><Input type="number" min="0" step="1" value={f.limiteBlando} onChange={(e) => setF({ ...f, limiteBlando: e.target.value })} /></Field>
        <Field label="Límite duro (€)" hint="Corta con 402 al llegar" error={error}><Input type="number" min="0" step="1" value={f.limiteDuro} onChange={(e) => setF({ ...f, limiteDuro: e.target.value })} /></Field>
      </div>
    </Modal>
  )
}
