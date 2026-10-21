import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Plus } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { caminosIndirectos } from '../../lib/dominio'
import { ahoraIso, fecha, haceCuanto } from '../../lib/format'
import {
  Badge, Button, Callout, Card, CardHeader, ChipSelect, DataTable, Drawer, Field, Input, Modal, Mono, PageHeader, PlanLock, Segmented, Select, Tabs, Tag, Textarea, cx,
} from '../../components/ui'
import GrafoAutorizacion, { COLOR_CATEGORIA } from '../../components/GrafoAutorizacion'

const ESTADO_HERR = { aprobada: ['green', 'Permitida'], pendiente: ['amber', 'Pendiente de revisar'], bloqueada: ['red', 'Bloqueada'] }

export default function Agentes() {
  const { org, plan, datos, deOrg, mutar, registrarCambio, esAdmin, toast } = useApp()
  const grafo = datos.grafos[org.id]
  const agentes = deOrg('agentes')
  const herramientas = deOrg('herramientas')
  const categorias = datos.categoriasDatos
  const [tab, setTab] = useState(plan.escudoCompleto ? 'grafo' : 'herramientas')
  const [caminoSel, setCaminoSel] = useState(null)
  const [agenteSel, setAgenteSel] = useState(null)
  const [confirmarModo, setConfirmarModo] = useState(null)
  const [nuevoAgente, setNuevoAgente] = useState(false)
  const [autorizar, setAutorizar] = useState(null)

  const caminos = useMemo(() => (plan.escudoCompleto ? caminosIndirectos(grafo, herramientas) : []), [grafo, herramientas, plan])
  const camino = caminos.find((c) => c.id === caminoSel)
  const nombreH = (id) => herramientas.find((h) => h.id === id)?.nombre
  const nombreCat = (id) => categorias.find((c) => c.id === id)?.nombre || 'Sin categoría'

  const actualizarGrafo = (cambios, mensaje) => {
    const antes = caminos.length
    const nuevo = { ...grafo, ...cambios, actualizado: ahoraIso() }
    mutar('grafos', (g) => ({ ...g, [org.id]: nuevo }))
    registrarCambio(mensaje)
    // AP-05 vuelve a analizar el grafo con cada cambio de configuración (OF-08)
    const despues = caminosIndirectos(nuevo, herramientas).length
    if (despues > antes) setTimeout(() => toast(`${despues - antes} camino indirecto nuevo detectado`, 'aviso', 'Revísalo en el grafo de autorización'), 400)
    else if (despues < antes) setTimeout(() => toast('Camino indirecto resuelto', 'exito', `Quedan ${despues}`), 400)
  }

  const quitarDelegacion = (de, a) => {
    actualizarGrafo({ puedeDelegar: grafo.puedeDelegar.filter(([p, q]) => !(p === de && q === a)) }, `Delegación ${de} → ${a} eliminada`)
    setCaminoSel(null)
  }

  const cambiarEstadoHerramienta = (h, estado, categoria) => {
    mutar('herramientas', (l) => l.map((x) => (x.id === h.id ? { ...x, estado, categoria: categoria !== undefined ? categoria : x.categoria } : x)))
    registrarCambio(`${h.nombre}: ${estado === 'aprobada' ? 'permitida' : 'bloqueada'}`)
  }

  const pendientes = herramientas.filter((h) => h.estado === 'pendiente')

  return (
    <>
      <PageHeader title="Agentes y permisos" refs={['BP-07', 'OF-07', 'OF-08', 'IC-09', 'IC-10', 'IC-11', 'AP-05']}
        description="Qué herramientas puede usar cada agente, en quién puede delegar y qué datos tiene prohibidos. Unburn quita de cada petición las herramientas no permitidas y bloquea la respuesta si el modelo pide una."
        actions={plan.escudoCompleto && <Button icon={Plus} requiereAdmin onClick={() => setNuevoAgente(true)}>Dar de alta agente</Button>} />

      {plan.escudoCompleto && (
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-ink-200 px-4 py-3">
          <div>
            <p className="text-xs text-ink-500">Modo del escudo</p>
            <div className="mt-1"><Segmented value={grafo.modo} onChange={(m) => esAdmin && m !== grafo.modo && setConfirmarModo(m)} options={[{ id: 'aprendizaje', label: 'Aprendizaje' }, { id: 'proteccion', label: 'Protección' }]} /></div>
          </div>
          <p className="max-w-xl flex-1 text-xs text-ink-500">
            {grafo.modo === 'proteccion'
              ? 'Se quitan las herramientas no permitidas. Las herramientas nuevas quedan bloqueadas hasta que las apruebes.'
              : 'Solo se observa qué herramientas usa cada agente; no se quita ninguna. Úsalo durante los primeros días.'}
          </p>
          <div className="text-right text-xs text-ink-500">
            <p>Configuración <Mono className="text-ink-900">cfg-v{grafo.version}</Mono></p>
            <p>Analizada {haceCuanto(grafo.actualizado)}</p>
          </div>
        </div>
      )}

      {caminos.length > 0 && (
        <Callout tone="danger" icon={AlertTriangle} className="mb-6" title={`${caminos.length} ${caminos.length === 1 ? 'camino indirecto' : 'caminos indirectos'} hacia datos prohibidos`}
          actions={tab !== 'grafo' && <Button size="sm" onClick={() => setTab('grafo')}>Ver en el grafo</Button>}>
          Un agente puede llegar a datos que tiene prohibidos encargando la tarea a otro agente que sí tiene acceso.
        </Callout>
      )}

      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'grafo', label: 'Grafo de autorización' },
        { id: 'herramientas', label: 'Herramientas', count: herramientas.length },
        { id: 'agentes', label: 'Agentes', count: agentes.length },
      ]} />

      {tab === 'grafo' && !plan.escudoCompleto && <PlanLock>En el plan Gratis solo se autorizan las herramientas del proveedor. El grafo de autorización, la delegación entre agentes y el aviso de caminos indirectos llegan con el escudo completo de Pro.</PlanLock>}

      {tab === 'grafo' && plan.escudoCompleto && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardHeader title="Mapa de permisos" subtitle="Haz clic en un agente para editar sus permisos"
              actions={<div className="flex flex-wrap gap-3">{categorias.map((c) => <span key={c.id} className="flex items-center gap-1.5 text-xs text-ink-600"><span className="h-2 w-2 rounded-sm" style={{ background: COLOR_CATEGORIA[c.id] }} />{c.nombre}</span>)}</div>} />
            <div className="p-4">
              <GrafoAutorizacion grafo={grafo} agentes={agentes} herramientas={herramientas} categorias={categorias} camino={camino} seleccionado={agenteSel} onAgente={setAgenteSel} />
              <div className="mt-2 flex flex-wrap gap-4 border-t border-ink-150 pt-3 text-xs text-ink-500">
                <span className="flex items-center gap-1.5"><span className="h-px w-5 bg-ink-300" />puede usar</span>
                <span className="flex items-center gap-1.5"><span className="w-5 border-t border-dashed border-ink-500" />puede delegar en</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-5 rounded border border-dashed border-ink-400" />herramienta pendiente</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-red-600" />camino indirecto</span>
              </div>
            </div>
          </Card>

          <Card className="self-start">
            <CardHeader title="Caminos indirectos" subtitle="Se recalculan con cada cambio de configuración" />
            {caminos.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-500">No hay caminos indirectos. Ningún agente puede llegar a datos prohibidos a través de otro.</p>}
            <ul className="divide-y divide-ink-100">
              {caminos.map((c) => (
                <li key={c.id} className={cx('px-4 py-3', caminoSel === c.id && 'bg-red-50/50')}>
                  <button className="w-full text-left" onClick={() => setCaminoSel(caminoSel === c.id ? null : c.id)}>
                    <div className="flex items-center justify-between">
                      <Mono className="text-ink-400">{c.id}</Mono>
                      <Badge tone="red">{nombreCat(c.categoria)}</Badge>
                    </div>
                    <p className="mt-1.5 flex flex-wrap items-center gap-1 font-mono text-[11.5px] text-ink-800">
                      {c.ruta.map((a, i) => <span key={a} className="flex items-center gap-1">{i > 0 && <ArrowRight className="h-3 w-3 text-ink-400" />}{a}</span>)}
                      <ArrowRight className="h-3 w-3 text-red-500" /><span className="text-red-700">{nombreH(c.herramienta)}</span>
                    </p>
                    <p className="mt-1 text-xs text-ink-500">{c.agente} tiene prohibidos los {nombreCat(c.categoria).toLowerCase()}, pero puede delegar en {c.ruta[c.ruta.length - 1]}, que usa {nombreH(c.herramienta)}.</p>
                  </button>
                  {caminoSel === c.id && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" requiereAdmin onClick={() => quitarDelegacion(c.ruta[0], c.ruta[1])}>Quitar delegación {c.ruta[0].replace('agente-', '')} → {c.ruta[1].replace('agente-', '')}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAgenteSel(c.ruta[0])}>Editar agente</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'grafo' && plan.escudoCompleto && (
        <div className="mt-6 flex items-start justify-between gap-6 rounded-lg border border-dashed border-ink-300 px-4 py-3">
          <div><p className="text-sm text-ink-950">Proxy MCP</p><p className="mt-0.5 max-w-3xl text-xs text-ink-500">En el MVP, Unburn controla las herramientas desde el tráfico con el modelo: las quita de la petición y bloquea la respuesta que pida una prohibida. Revisar cada llamada del agente a tus servidores MCP (argumentos y volumen de datos) llegará con el proxy MCP de la arquitectura objetivo, usando este mismo grafo (OF-09, DEC-12).</p></div>
          <Badge tone="gray" dot={false}>Próximamente</Badge>
        </div>
      )}

      {tab === 'herramientas' && (
        <>
          {!plan.escudoCompleto && <Callout tone="neutral" className="mb-4">En el plan Gratis se controlan las herramientas que ejecuta el propio proveedor (búsqueda web, ejecución de código, conectores remotos). Están denegadas por defecto y se autorizan por clave (DEC-10).</Callout>}
          {plan.escudoCompleto && pendientes.length > 0 && (
            <Callout tone="warn" className="mb-4" title={`${pendientes.length} herramientas descubiertas pendientes de revisar`}>
              Asígnales una categoría de datos y decide si se permiten. {grafo.modo === 'proteccion' ? 'Mientras tanto están bloqueadas.' : 'En modo aprendizaje solo se registran.'}
            </Callout>
          )}
          <DataTable rows={plan.escudoCompleto ? herramientas : herramientas.filter((h) => h.ejecuta === 'proveedor')} search={(h) => h.nombre} searchPlaceholder="Buscar herramienta…"
            initialSort={{ id: 'vista', dir: 'desc' }}
            filters={[
              { id: 'estado', label: 'Estado', options: Object.entries(ESTADO_HERR).map(([id, [, l]]) => ({ id, label: l })), value: (h) => h.estado },
              { id: 'ejecuta', label: 'Ejecuta', options: [{ id: 'cliente', label: 'Cliente' }, { id: 'proveedor', label: 'Proveedor' }], value: (h) => h.ejecuta },
            ]}
            columns={[
              { id: 'nombre', header: 'Herramienta', sort: (h) => h.nombre, cell: (h) => <Mono className="text-ink-950">{h.nombre}</Mono> },
              { id: 'ejecuta', header: 'La ejecuta', cell: (h) => <Tag>{h.ejecuta === 'cliente' ? 'Tu aplicación' : 'Proveedor de IA'}</Tag> },
              { id: 'cat', header: 'Categoría de datos', cell: (h) => <span className="flex items-center gap-1.5 text-xs text-ink-700"><span className="h-2 w-2 rounded-sm" style={{ background: COLOR_CATEGORIA[h.categoria] }} />{nombreCat(h.categoria)}</span> },
              { id: 'uso', header: plan.escudoCompleto ? 'Agentes' : 'Claves autorizadas', cell: (h) => {
                const lista = plan.escudoCompleto ? [...new Set([...grafo.puedeUsar.filter(([, t]) => t === h.id).map(([a]) => a), ...(h.vistaEn || [])])] : deOrg('clavesVirtuales').filter((k) => k.herramientasProveedor.includes(h.nombre)).map((k) => k.nombre)
                return lista.length ? <span className="block max-w-[220px] truncate text-xs text-ink-600">{lista.join(', ')}</span> : <span className="text-xs text-ink-400">Ninguno</span>
              } },
              { id: 'vista', header: 'Vista por primera vez', align: 'right', sort: (h) => h.vistaPrimeraVez, cell: (h) => <span className="text-ink-500">{fecha(h.vistaPrimeraVez)}</span> },
              { id: 'estado', header: 'Estado', cell: (h) => <Badge tone={ESTADO_HERR[h.estado][0]}>{ESTADO_HERR[h.estado][1]}</Badge> },
              { id: 'acc', header: '', align: 'right', cell: (h) => (
                <div className="flex justify-end gap-1">
                  {!plan.escudoCompleto
                    ? <Button size="xs" requiereAdmin onClick={() => setAutorizar(h)}>Autorizar en claves</Button>
                    : h.estado === 'pendiente'
                      ? <Button size="xs" requiereAdmin onClick={() => setAutorizar(h)}>Revisar</Button>
                      : h.estado === 'aprobada'
                        ? <Button size="xs" variant="ghost" requiereAdmin onClick={() => cambiarEstadoHerramienta(h, 'bloqueada')}>Bloquear</Button>
                        : <Button size="xs" variant="ghost" requiereAdmin onClick={() => setAutorizar(h)}>{h.ejecuta === 'proveedor' ? 'Autorizar' : 'Permitir'}</Button>}
                </div>
              ) },
            ]} />
        </>
      )}

      {tab === 'agentes' && (!plan.escudoCompleto ? <PlanLock>Los permisos por agente y la delegación forman parte del escudo de herramientas completo.</PlanLock> : (
        <DataTable rows={agentes} search={(a) => `${a.id} ${a.descripcion}`} searchPlaceholder="Buscar agente…" onRowClick={(a) => setAgenteSel(a.id)}
          columns={[
            { id: 'id', header: 'Agente', sort: (a) => a.id, cell: (a) => <div><Mono className="text-ink-950">{a.id}</Mono><p className="max-w-[280px] truncate text-xs text-ink-500">{a.descripcion}</p></div> },
            { id: 'herr', header: 'Herramientas', cell: (a) => <span className="text-xs text-ink-600">{grafo.puedeUsar.filter(([x]) => x === a.id).length}</span> },
            { id: 'del', header: 'Puede delegar en', cell: (a) => { const d = grafo.puedeDelegar.filter(([x]) => x === a.id).map(([, y]) => y); return d.length ? <span className="font-mono text-[11.5px] text-ink-600">{d.join(', ')}</span> : <span className="text-xs text-ink-400">—</span> } },
            { id: 'proh', header: 'Datos prohibidos', cell: (a) => { const p = grafo.prohibidas.filter(([x]) => x === a.id); return p.length ? p.map(([, c]) => <Tag key={c} className="mr-1">{nombreCat(c)}</Tag>) : <span className="text-xs text-ink-400">—</span> } },
            { id: 'act', header: 'Actividad', align: 'right', sort: (a) => a.ultimaActividad, cell: (a) => <span className="text-ink-500">{haceCuanto(a.ultimaActividad)}</span> },
          ]} />
      ))}

      <Modal open={!!confirmarModo} onClose={() => setConfirmarModo(null)} title={confirmarModo === 'proteccion' ? 'Activar modo protección' : 'Volver a modo aprendizaje'}
        footer={<><Button onClick={() => setConfirmarModo(null)}>Cancelar</Button><Button variant="primary" onClick={() => { actualizarGrafo({ modo: confirmarModo }, confirmarModo === 'proteccion' ? 'Modo protección activado' : 'Modo aprendizaje activado'); setConfirmarModo(null) }}>Confirmar</Button></>}>
        <p className="text-sm text-ink-700">{confirmarModo === 'proteccion'
          ? `Unburn empezará a quitar de cada petición las herramientas que el agente no tiene permitidas, y las herramientas nuevas quedarán bloqueadas hasta que las apruebes.${pendientes.length ? ` Tienes ${pendientes.length} herramientas pendientes que se bloquearán.` : ''}`
          : 'Unburn dejará de quitar herramientas: solo registrará cuáles usa cada agente. Las herramientas del proveedor siguen necesitando autorización.'}</p>
      </Modal>

      {nuevoAgente && <NuevoAgenteModal onClose={() => setNuevoAgente(false)} claves={deOrg('clavesVirtuales').filter((k) => k.estado === 'activa')} onGuardar={(a) => {
        mutar('agentes', (l) => [...l, { ...a, orgId: org.id, ultimaActividad: null, gastoMes: 0 }])
        mutar('grafos', (g) => ({ ...g, [org.id]: { ...g[org.id], posiciones: { ...g[org.id].posiciones, [a.id]: [120, 320] } } }))
        if (a.claves.length) mutar('clavesVirtuales', (l) => l.map((k) => (a.claves.includes(k.id) ? { ...k, agentes: [...k.agentes, a.id] } : k)))
        registrarCambio(`Agente ${a.id} dado de alta`)
        setNuevoAgente(false)
      }} />}

      {autorizar && <RevisarHerramientaModal h={autorizar} plan={plan} categorias={categorias} claves={deOrg('clavesVirtuales').filter((k) => k.estado === 'activa')} onClose={() => setAutorizar(null)}
        onGuardar={({ categoria, permitir, claves }) => {
          if (!plan.escudoCompleto) {
            mutar('clavesVirtuales', (l) => l.map((k) => (k.orgId !== org.id ? k : { ...k, herramientasProveedor: claves.includes(k.id) ? [...new Set([...k.herramientasProveedor, autorizar.nombre])] : k.herramientasProveedor.filter((x) => x !== autorizar.nombre) })))
            mutar('herramientas', (l) => l.map((x) => (x.id === autorizar.id ? { ...x, estado: claves.length ? 'aprobada' : 'bloqueada' } : x)))
            registrarCambio(`${autorizar.nombre} autorizada en ${claves.length} claves`)
          } else cambiarEstadoHerramienta(autorizar, permitir ? 'aprobada' : 'bloqueada', categoria)
          setAutorizar(null)
        }} />}

      <Drawer open={!!agenteSel} onClose={() => setAgenteSel(null)} title={agenteSel} subtitle={agentes.find((a) => a.id === agenteSel)?.descripcion}>
        {agenteSel && <PermisosAgente key={agenteSel} agente={agenteSel} grafo={grafo} agentes={agentes} herramientas={herramientas.filter((h) => h.estado !== 'bloqueada' || h.ejecuta === 'cliente')} categorias={categorias}
          onGuardar={(cambios) => { actualizarGrafo(cambios, `Permisos de ${agenteSel} actualizados`); setAgenteSel(null) }} />}
      </Drawer>
    </>
  )
}

function PermisosAgente({ agente, grafo, agentes, herramientas, categorias, onGuardar }) {
  const { esAdmin } = useApp()
  const [usa, setUsa] = useState(grafo.puedeUsar.filter(([a]) => a === agente).map(([, t]) => t))
  const [delega, setDelega] = useState(grafo.puedeDelegar.filter(([a]) => a === agente).map(([, b]) => b))
  const [proh, setProh] = useState(grafo.prohibidas.filter(([a]) => a === agente).map(([, c]) => c))
  const nombreDe = Object.fromEntries(herramientas.map((h) => [h.nombre, h.id]))
  const guardar = () => onGuardar({
    puedeUsar: [...grafo.puedeUsar.filter(([a]) => a !== agente), ...usa.map((t) => [agente, t])],
    puedeDelegar: [...grafo.puedeDelegar.filter(([a]) => a !== agente), ...delega.map((b) => [agente, b])],
    prohibidas: [...grafo.prohibidas.filter(([a]) => a !== agente), ...proh.map((c) => [agente, c])],
  })
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-ink-950">Herramientas que puede usar</p>
        <p className="mb-2.5 mt-0.5 text-xs text-ink-500">Las demás se quitan de cada petición en modo protección.</p>
        <ChipSelect mono disabled={!esAdmin} options={herramientas.map((h) => h.nombre)} value={usa.map((id) => herramientas.find((h) => h.id === id)?.nombre).filter(Boolean)} onChange={(v) => setUsa(v.map((n) => nombreDe[n]))} />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-950">Puede delegar en</p>
        <p className="mb-2.5 mt-0.5 text-xs text-ink-500">Agentes a los que puede encargar una tarea.</p>
        <ChipSelect mono disabled={!esAdmin} options={agentes.map((a) => a.id).filter((a) => a !== agente)} value={delega} onChange={setDelega} />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-950">Categorías de datos prohibidas</p>
        <p className="mb-2.5 mt-0.5 text-xs text-ink-500">Unburn avisará si puede llegar a ellas a través de otro agente.</p>
        <ChipSelect disabled={!esAdmin} options={categorias.map((c) => c.nombre)} value={proh.map((id) => categorias.find((c) => c.id === id)?.nombre)} onChange={(v) => setProh(v.map((n) => categorias.find((c) => c.nombre === n).id))} />
      </div>
      {esAdmin && <div className="flex justify-end border-t border-ink-150 pt-4"><Button variant="primary" onClick={guardar}>Guardar y analizar</Button></div>}
    </div>
  )
}

function NuevoAgenteModal({ onClose, onGuardar, claves }) {
  const [f, setF] = useState({ id: 'agente-', descripcion: '', claves: [] })
  const valido = /^[a-z0-9-]{4,40}$/.test(f.id) && f.id !== 'agente-'
  return (
    <Modal open onClose={onClose} title="Dar de alta agente" description="Después podrás darle permisos en el grafo de autorización."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!valido} onClick={() => onGuardar(f)}>Dar de alta</Button></>}>
      <div className="space-y-4">
        <Field label="Nombre" hint="Es el valor que enviará en la cabecera X-Unburn-Agent"><Input autoFocus value={f.id} onChange={(e) => setF({ ...f, id: e.target.value.toLowerCase() })} className="font-mono" /></Field>
        <Field label="Descripción"><Textarea value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} placeholder="Qué hace este agente" className="min-h-[64px]" /></Field>
        <div><p className="mb-1.5 text-xs font-medium text-ink-700">Claves que puede usar</p><ChipSelect options={claves.map((k) => k.nombre)} value={f.claves.map((id) => claves.find((k) => k.id === id)?.nombre)} onChange={(v) => setF({ ...f, claves: v.map((n) => claves.find((k) => k.nombre === n).id) })} /></div>
      </div>
    </Modal>
  )
}

function RevisarHerramientaModal({ h, plan, categorias, claves, onClose, onGuardar }) {
  const [categoria, setCategoria] = useState(h.categoria || '')
  const [sel, setSel] = useState(claves.filter((k) => k.herramientasProveedor.includes(h.nombre)).map((k) => k.id))
  if (!plan.escudoCompleto) {
    return (
      <Modal open onClose={onClose} title={`Autorizar ${h.nombre}`} description={`Herramienta que ejecuta el proveedor · ${h.tarifa || 'tarifa según catálogo'}`}
        footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => onGuardar({ claves: sel })}>Guardar</Button></>}>
        <p className="mb-3 text-sm text-ink-600">El proveedor la ejecuta en sus servidores en cuanto recibe la petición, así que su coste solo se puede estimar. Autorízala solo en las claves que la necesiten.</p>
        <ChipSelect options={claves.map((k) => k.nombre)} value={sel.map((id) => claves.find((k) => k.id === id)?.nombre)} onChange={(v) => setSel(v.map((n) => claves.find((k) => k.nombre === n).id))} />
      </Modal>
    )
  }
  return (
    <Modal open onClose={onClose} title={`Revisar ${h.nombre}`} description={`Vista por primera vez el ${fecha(h.vistaPrimeraVez)}${h.vistaEn ? ` en ${h.vistaEn.join(', ')}` : ''}`}
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="danger-soft" onClick={() => onGuardar({ categoria: categoria || null, permitir: false })}>Bloquear</Button><Button variant="primary" disabled={!categoria} onClick={() => onGuardar({ categoria, permitir: true })}>Permitir</Button></>}>
      <Field label="Categoría de datos" hint="Necesaria para analizar los caminos indirectos">
        <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}><option value="">Elige una categoría</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</Select>
      </Field>
      {h.ejecuta === 'proveedor' && <Callout tone="warn" className="mt-4">La ejecuta el proveedor de IA ({h.tarifa}). Su coste solo se puede estimar antes de enviar la petición.</Callout>}
      <p className="mt-4 text-xs text-ink-500">Permitirla no la asigna a ningún agente: hazlo después desde el grafo.</p>
    </Modal>
  )
}

