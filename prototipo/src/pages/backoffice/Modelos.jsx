import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { aleatorio, ahoraIso, fecha } from '../../lib/format'
import { Badge, Button, Callout, ConfirmModal, DataTable, Drawer, Field, Input, KV, Modal, Mono, PageHeader, Select, Tag } from '../../components/ui'

const precioTxt = (v) => (v == null ? '—' : `${v.toFixed(2).replace('.', ',')} €`)
const precio = (v) => (v == null ? <span className="text-ink-300">—</span> : v.toFixed(2).replace('.', ','))

export default function Modelos() {
  const { datos, mutar, empleado, toast } = useApp()
  const ingenieria = empleado.departamento.startsWith('Ingeniería')
  const [selId, setSelId] = useState(null)
  const [tarifa, setTarifa] = useState(null)
  const [nuevo, setNuevo] = useState(false)
  const [retirar, setRetirar] = useState(null)
  const [opcion, setOpcion] = useState(null)
  const sel = datos.modelos.find((m) => m.id === selId)
  const pendientes = datos.modelos.flatMap((m) => m.opciones.filter((o) => !o.admitida && !o.efecto.includes('DEC-10')).map((o) => ({ modelo: m, o })))

  const publicar = (m, mensaje) => {
    mutar('modelos', (l) => (l.some((x) => x.id === m.id) ? l.map((x) => (x.id === m.id ? m : x)) : [...l, m]))
    toast(mensaje, 'exito', 'Publicado en el catálogo: el Gateway y el Motor de presupuestos lo usan desde ya')
  }

  return (
    <>
      <PageHeader title="Modelos y precios" refs={['BP-15', 'IC-14', 'AP-06', 'IF-29', 'OF-04']}
        description="Modelos de cada proveedor con sus tarifas por tipo de token, el precio de sus herramientas y las opciones admitidas en cada API. Una opción solo se admite cuando su precio está registrado."
        actions={<Button variant="brand" icon={Plus} disabled={!ingenieria} title={!ingenieria ? 'Solo Ingeniería mantiene el catálogo' : undefined} onClick={() => setNuevo(true)}>Añadir modelo</Button>} />

      <Callout tone={pendientes.length ? 'warn' : 'neutral'} className="mb-6" title={pendientes.length ? `${pendientes.length} ${pendientes.length === 1 ? 'opción' : 'opciones'} sin precio registrado` : 'Catálogo al día'}>
        Si el catálogo se queda atrás, las reservas del Gateway dejan de cubrir el peor caso de cada petición. {pendientes.map(({ modelo, o }) => <span key={modelo.id + o.nombre}><Mono>{o.nombre}</Mono> en <Mono>{modelo.modelo}</Mono>. </span>)}
        {!ingenieria && 'Vista de solo lectura: el catálogo lo mantiene Ingeniería.'}
      </Callout>

      <DataTable rows={datos.modelos} pageSize={12} initialSort={{ id: 'proveedor', dir: 'asc' }} onRowClick={(m) => setSelId(m.id)}
        search={(m) => `${m.proveedor} ${m.modelo}`} searchPlaceholder="Buscar modelo…"
        filters={[
          { id: 'proveedor', label: 'Proveedor', options: [{ id: 'OpenAI', label: 'OpenAI' }, { id: 'Anthropic', label: 'Anthropic' }], value: (m) => m.proveedor },
          { id: 'estado', label: 'Estado', options: [{ id: 'activo', label: 'Activo' }, { id: 'retirado', label: 'Retirado' }], value: (m) => m.estado },
        ]}
        columns={[
          { id: 'modelo', header: 'Modelo', sort: (m) => m.modelo, cell: (m) => <Mono className="text-ink-950">{m.modelo}</Mono> },
          { id: 'proveedor', header: 'Proveedor', sort: (m) => m.proveedor + m.modelo, cell: (m) => <span className="text-ink-600">{m.proveedor}</span> },
          { id: 'entrada', header: 'Entrada', align: 'right', sort: (m) => m.precios.entrada, cell: (m) => precio(m.precios.entrada) },
          { id: 'salida', header: 'Salida', align: 'right', sort: (m) => m.precios.salida, cell: (m) => precio(m.precios.salida) },
          { id: 'razon', header: 'Razonamiento', align: 'right', cell: (m) => precio(m.precios.razonamiento) },
          { id: 'cache', header: 'Caché', align: 'right', cell: (m) => precio(m.precios.cache) },
          { id: 'opc', header: 'Opciones', cell: (m) => <span className="text-xs text-ink-500">{m.opciones.filter((o) => o.admitida).length}/{m.opciones.length} admitidas</span> },
          { id: 'vig', header: 'Vigente desde', align: 'right', sort: (m) => m.vigencia, cell: (m) => <span className="text-ink-500">{fecha(m.vigencia)}</span> },
          { id: 'estado', header: 'Estado', cell: (m) => <Badge tone={m.estado === 'activo' ? 'green' : 'gray'}>{m.estado === 'activo' ? 'Activo' : 'Retirado'}</Badge> },
        ]} />
      <p className="mt-2 text-xs text-ink-500">Precios en € por millón de tokens.</p>

      <Drawer open={!!sel} onClose={() => setSelId(null)} title={sel?.modelo} subtitle={sel && `${sel.proveedor} · vigente desde el ${fecha(sel.vigencia)}`} width="max-w-2xl"
        footer={sel && ingenieria && sel.estado === 'activo' && <><Button variant="danger-soft" onClick={() => setRetirar(sel)}>Retirar modelo</Button><Button variant="primary" onClick={() => setTarifa(sel)}>Nueva tarifa</Button></>}>
        {sel && (
          <div className="space-y-6">
            <KV cols={3} items={[['Entrada', precioTxt(sel.precios.entrada)], ['Salida', precioTxt(sel.precios.salida)], ['Razonamiento', precioTxt(sel.precios.razonamiento)], ['Caché', precioTxt(sel.precios.cache)], ['Recargos', sel.recargos || 'Ninguno']]} />
            <div>
              <p className="mb-2 text-sm font-medium text-ink-950">Herramientas del proveedor</p>
              {sel.herramientas.length === 0 ? <p className="text-sm text-ink-500">Ninguna.</p> : (
                <table className="w-full rounded-lg border border-ink-200 text-sm"><thead><tr className="border-b border-ink-150 bg-ink-50/60 text-xs text-ink-500"><th className="h-8 px-3 text-left font-medium">Herramienta</th><th className="px-3 text-left font-medium">Tarifa por uso</th><th className="px-3 text-right font-medium">Entrada adicional estimada</th></tr></thead>
                  <tbody className="divide-y divide-ink-100">{sel.herramientas.map((h) => <tr key={h.nombre}><td className="h-9 px-3"><Mono>{h.nombre}</Mono></td><td className="px-3">{h.tarifa}</td><td className="px-3 text-right tabular-nums">{h.entradaEstimada.toLocaleString('es-ES')} tokens</td></tr>)}</tbody></table>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink-950">Opciones de la API</p>
              <ul className="divide-y divide-ink-100 rounded-lg border border-ink-200">
                {sel.opciones.map((o) => (
                  <li key={o.nombre} className="flex items-center gap-3 px-3 py-2.5">
                    <Mono className="flex-1 text-ink-950">{o.nombre}</Mono>
                    <span className="max-w-[260px] text-xs text-ink-500">{o.efecto}</span>
                    {o.admitida ? <Badge tone="green">Admitida</Badge> : o.efecto.includes('DEC-10') ? <Badge tone="gray">Denegada</Badge>
                      : <Button size="xs" disabled={!ingenieria} onClick={() => setOpcion({ modelo: sel, o })}>Registrar precio</Button>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>

      {tarifa && <TarifaModal m={tarifa} onClose={() => setTarifa(null)} onGuardar={(p, vigencia) => { publicar({ ...tarifa, precios: p, vigencia }, `Nueva tarifa de ${tarifa.modelo}`); setTarifa(null) }} />}
      {nuevo && <TarifaModal nuevo onClose={() => setNuevo(false)} onGuardar={(p, vigencia, extra) => { publicar({ id: `m_${aleatorio(6)}`, proveedor: extra.proveedor, modelo: extra.modelo, vigencia, estado: 'activo', precios: p, recargos: null, herramientas: [], opciones: [{ nombre: 'max_output_tokens', admitida: true, efecto: 'Acota el peor caso de la reserva' }] }, `${extra.modelo} añadido al catálogo`); setNuevo(false) }} />}
      {opcion && <Modal open onClose={() => setOpcion(null)} title={`Registrar precio de ${opcion.o.nombre}`} description={opcion.modelo.modelo}
        footer={<><Button onClick={() => setOpcion(null)}>Cancelar</Button><Button variant="primary" onClick={() => {
          publicar({ ...opcion.modelo, opciones: opcion.modelo.opciones.map((o) => (o.nombre === opcion.o.nombre ? { ...o, admitida: true, efecto: '×2 en todos los tokens' } : o)) }, `${opcion.o.nombre} admitida en ${opcion.modelo.modelo}`)
          setOpcion(null)
        }}>Registrar y admitir</Button></>}>
        <Field label="Efecto en el precio" hint="El Gateway lo usará para calcular la reserva del peor caso"><Select defaultValue="x2"><option value="x2">×2 en todos los tokens</option><option value="x15">×1,5 en salida</option></Select></Field>
      </Modal>}
      <ConfirmModal open={!!retirar} onClose={() => setRetirar(null)} title={`Retirar ${retirar?.modelo}`} confirmLabel="Retirar" palabra={retirar?.modelo}
        onConfirm={() => { publicar({ ...retirar, estado: 'retirado' }, `${retirar.modelo} retirado`); setRetirar(null); setSelId(null) }}>
        Las claves que lo tengan permitido empezarán a recibir 400 al pedirlo. Avisa antes a los clientes afectados.
      </ConfirmModal>
    </>
  )
}

function TarifaModal({ m, nuevo, onClose, onGuardar }) {
  const [p, setP] = useState(m ? { ...m.precios } : { entrada: '', salida: '', razonamiento: '', cache: '' })
  const [vigencia, setVigencia] = useState(ahoraIso().slice(0, 10))
  const [extra, setExtra] = useState({ proveedor: 'OpenAI', modelo: '' })
  const num = (v) => (v === '' || v == null ? null : Number(String(v).replace(',', '.')))
  const valido = num(p.entrada) > 0 && num(p.salida) > 0 && (!nuevo || extra.modelo.trim())
  return (
    <Modal open onClose={onClose} title={nuevo ? 'Añadir modelo' : `Nueva tarifa de ${m.modelo}`} description="Precios en € por millón de tokens. La tarifa anterior se conserva para recalcular eventos pasados."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!valido} onClick={() => onGuardar({ entrada: num(p.entrada), salida: num(p.salida), razonamiento: num(p.razonamiento), cache: num(p.cache) }, vigencia, extra)}>Publicar</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        {nuevo && <Field label="Proveedor"><Select value={extra.proveedor} onChange={(e) => setExtra({ ...extra, proveedor: e.target.value })}><option>OpenAI</option><option>Anthropic</option></Select></Field>}
        {nuevo && <Field label="Modelo"><Input className="font-mono" value={extra.modelo} onChange={(e) => setExtra({ ...extra, modelo: e.target.value })} placeholder="gpt-5-mini" /></Field>}
        {['entrada', 'salida', 'razonamiento', 'cache'].map((k) => (
          <Field key={k} label={{ entrada: 'Entrada', salida: 'Salida', razonamiento: 'Razonamiento', cache: 'Caché' }[k]}><Input inputMode="decimal" value={p[k] ?? ''} onChange={(e) => setP({ ...p, [k]: e.target.value })} placeholder="0,00" /></Field>
        ))}
        <Field label="Vigente desde"><Input type="date" value={vigencia} onChange={(e) => setVigencia(e.target.value)} /></Field>
      </div>
      {!nuevo && <p className="mt-4 text-xs text-ink-500">Cambio respecto a la tarifa actual en salida: <Tag>{m.precios.salida && num(p.salida) ? `${Math.round(((num(p.salida) - m.precios.salida) / m.precios.salida) * 100)} %` : '—'}</Tag></p>}
    </Modal>
  )
}
