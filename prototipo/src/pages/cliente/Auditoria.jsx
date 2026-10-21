import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Download, Loader2, ShieldCheck } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { nombreClave } from '../../lib/hooks'
import { DECISIONES } from '../../lib/dominio'
import { euros, fechaHora, haceCuanto, hora, numero } from '../../lib/format'
import { Badge, Button, Callout, Card, CardHeader, Checkbox, Cifra, PuntoVivo, DataTable, Drawer, Field, KV, Modal, Mono, PageHeader, Segmented, Select, Tabs, cx } from '../../components/ui'

export default function Auditoria() {
  const { deOrg, datos, plan, toast, org } = useApp()
  const [params, setParams] = useSearchParams()
  const eventos = deOrg('eventos')
  const sellos = deOrg('sellos')
  const claves = deOrg('clavesVirtuales')
  const [tab, setTab] = useState('eventos')
  const [eventoId, setEventoId] = useState(null)
  const [verificar, setVerificar] = useState(false)
  const [exportar, setExportar] = useState(false)
  const [filtroInicial] = useState(() => params.get('sesion') || '')
  const evento = eventos.find((e) => e.id === eventoId)

  useEffect(() => {
    if (params.get('evento')) setEventoId(params.get('evento'))
    if (params.toString()) setParams({}, { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const retencion = plan.diasRetencion >= 180 ? '6 meses o más' : `${plan.diasRetencion} días`

  return (
    <>
      <PageHeader title="Registro de auditoría" refs={['BP-11', 'OF-11', 'IC-16', 'IC-22', 'IC-24', 'AP-07']}
        description="Qué hizo la IA, cuánto costó y por qué Unburn permitió o bloqueó cada petición. Solo metadatos: Unburn nunca guarda el texto de las peticiones ni de las respuestas."
        actions={<><Button icon={ShieldCheck} onClick={() => setVerificar(true)}>Verificar integridad</Button><Button variant="brand" icon={Download} onClick={() => setExportar(true)}>Exportar</Button></>} />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-ink-200 px-4 py-3"><p className="text-xs text-ink-500">Retención en el plan {plan.nombre}</p><p className="mt-1 text-sm font-medium text-ink-950">{retencion}</p></div>
        <div className="rounded-lg border border-ink-200 px-4 py-3"><p className="text-xs text-ink-500">Último sello firmado</p><p className="mt-1 text-sm font-medium text-ink-950">{sellos[0] ? <>{haceCuanto(sellos[0].fecha)} · <Mono>{sellos[0].resumen}</Mono></> : '—'}</p></div>
        <div className="rounded-lg border border-ink-200 px-4 py-3"><p className="flex items-center gap-1.5 text-xs text-ink-500"><PuntoVivo /> Eventos en el periodo visible</p><p className="mt-1 text-sm font-medium tabular-nums text-ink-950"><Cifra valor={eventos.length} formato={numero} /></p></div>
      </div>

      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'eventos', label: 'Eventos', count: eventos.length }, { id: 'sellos', label: 'Sellos', count: sellos.length }]} />

      {tab === 'eventos' && (
        <DataTable rows={eventos} pageSize={15} dense initialSort={{ id: 'fecha', dir: 'desc' }} onRowClick={(e) => setEventoId(e.id)} rowClassName={(e) => e.nuevo && Date.now() - new Date(e.fecha).getTime() < 6000 && 'animate-fila-nueva'}
          search={(e) => `${e.id} ${e.sesionId || ''} ${e.agente || ''} ${e.motivo} ${e.modeloUsado || ''} ${e.herramienta || ''}`}
          searchPlaceholder="Buscar ID, sesión, agente, regla…"
          filters={[
            { id: 'decision', label: 'Decisión', options: Object.entries(DECISIONES).map(([id, d]) => ({ id, label: d.nombre })), value: (e) => e.decision },
            { id: 'clave', label: 'Clave', options: claves.map((k) => ({ id: k.id, label: k.nombre })), value: (e) => e.claveId },
            { id: 'tipo', label: 'Tipo', options: [{ id: 'generacion', label: 'Generación' }, { id: 'auxiliar', label: 'Auxiliar' }, { id: 'rechazo agrupado', label: 'Rechazo agrupado' }, { id: 'cierre estimado', label: 'Cierre estimado (BP-19)' }, { id: 'cambio de configuración', label: 'Cambio de configuración' }], value: (e) => e.tipo },
          ]}
          initialSearch={filtroInicial}
          columns={[
            { id: 'fecha', header: 'Fecha', sort: (e) => e.fecha, cell: (e) => <span className="whitespace-nowrap tabular-nums text-ink-600">{fechaHora(e.fecha).replace(',', '')}<span className="text-ink-400">:{e.fecha.slice(17, 19)}</span></span> },
            { id: 'decision', header: 'Decisión', cell: (e) => <span className="flex items-center gap-1.5"><Badge tone={DECISIONES[e.decision].tono}>{DECISIONES[e.decision].nombre}</Badge><span className="text-xs tabular-nums text-ink-400">{e.codigo}</span></span> },
            { id: 'clave', header: 'Clave', cell: (e) => <span className="text-ink-700">{nombreClave(datos.clavesVirtuales, e.claveId)}</span> },
            { id: 'agente', header: 'Agente', cell: (e) => <Mono className="text-ink-600">{e.agente}</Mono> },
            { id: 'modelo', header: 'Modelo', cell: (e) => <Mono className="text-ink-600">{e.modeloUsado || e.modeloPedido}</Mono> },
            { id: 'coste', header: 'Coste', align: 'right', sort: (e) => e.costeReal, cell: (e) => <span className={e.costeReal ? 'text-ink-900' : 'text-ink-400'}>{euros(e.costeReal, 2)}</span> },
            { id: 'motivo', header: 'Motivo', cell: (e) => <span className="block max-w-[300px] truncate text-xs text-ink-500" title={e.motivo}>{e.motivo}</span> },
          ]}
        />
      )}

      {tab === 'sellos' && (
        <>
          <p className="mb-3 max-w-3xl text-sm text-ink-600">Cada pocos minutos Unburn firma un resumen de todas las cadenas con eventos nuevos y lo guarda en un almacenamiento que nadie puede modificar ni borrar hasta que vence su plazo. Así se puede demostrar ante un auditor que el registro no se ha manipulado.</p>
          <DataTable rows={sellos} pageSize={12} initialSort={{ id: 'fecha', dir: 'desc' }}
            columns={[
              { id: 'fecha', header: 'Fecha', sort: (s) => s.fecha, cell: (s) => <span className="tabular-nums text-ink-700">{fechaHora(s.fecha)}</span> },
              { id: 'resumen', header: 'Resumen', cell: (s) => <Mono className="text-ink-950">{s.resumen}</Mono> },
              { id: 'firma', header: 'Firma', cell: (s) => <Mono className="text-ink-500">{s.firma}</Mono> },
              { id: 'eventos', header: 'Eventos', align: 'right', sort: (s) => s.eventos, cell: (s) => numero(s.eventos) },
              { id: 'almacen', header: 'Almacenamiento', cell: (s) => <span className="text-xs text-ink-500">{s.almacen}</span> },
            ]} />
        </>
      )}

      <Drawer open={!!evento} onClose={() => setEventoId(null)} title="Evento de auditoría" subtitle={evento && <Mono>{evento.id}</Mono>}>
        {evento && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><Badge tone={DECISIONES[evento.decision].tono}>{DECISIONES[evento.decision].nombre}</Badge><Mono className="text-ink-500">HTTP {evento.codigo}</Mono></div>
            <div><p className="text-xs text-ink-500">Motivo o regla aplicada</p><p className="mt-0.5 text-sm text-ink-950">{evento.motivo}</p></div>
            <KV items={[
              ['Fecha y hora', `${fechaHora(evento.fecha)}:${evento.fecha.slice(17, 19)}`],
              ['Tipo', evento.tipo + (evento.agrupados ? ` (${evento.agrupados} peticiones)` : '')],
              ['Clave virtual', nombreClave(datos.clavesVirtuales, evento.claveId)],
              ['Sesión', evento.sesionId ? (datos.sesiones.some((s) => s.id === evento.sesionId) ? <Link key="s" to={`/app/contexto/${evento.sesionId}`} className="font-mono text-[12px] underline decoration-ink-300 underline-offset-2">{evento.sesionId}</Link> : <Mono key="s">{evento.sesionId}</Mono>) : '—'],
              ['Agente', <Mono key="a">{evento.agente}</Mono>],
              ['Encargado por', evento.encargadoPor ? <Mono key="e">{evento.encargadoPor}</Mono> : '—'],
              ['Proveedor · API', `${evento.proveedor} · ${evento.api}`],
              ['Modelo pedido → usado', <Mono key="m">{evento.modeloPedido}{evento.modeloUsado && evento.modeloUsado !== evento.modeloPedido ? ` → ${evento.modeloUsado}` : ''}</Mono>],
              ['Herramienta pedida', evento.herramienta ? <Mono key="h">{evento.herramienta}</Mono> : '—'],
              ['Herramientas quitadas por el escudo', evento.herramientasQuitadas?.length ? <Mono key="hq">{evento.herramientasQuitadas.join(', ')}</Mono> : '—'],
              ['Latencia añadida por el Gateway', `${evento.latenciaGatewayMs ?? '—'} ms`],
              ['Usos de herramientas del proveedor', evento.usosHerramientasProveedor],
              ['Tokens entrada · salida', `${numero(evento.tokens.entrada)} · ${numero(evento.tokens.salida)}`],
              ['Tokens razonamiento · caché', `${numero(evento.tokens.razonamiento)} · ${numero(evento.tokens.cache)}`],
              ['Coste reservado (peor caso)', euros(evento.costeEstimado)],
              ['Coste real', euros(evento.costeReal, 2)],
              ['Latencia', `${numero(evento.latenciaMs)} ms`],
              ['Versión de la configuración', <Mono key="v">{evento.versionConfig}</Mono>],
              ['IP de origen', <Mono key="ip">{evento.ip}</Mono>],
              ['Usuario final (seudónimo)', evento.usuarioFinal ? <Mono key="u">{evento.usuarioFinal}</Mono> : '—'],
            ]} />
            <div className="rounded-md border border-ink-200 bg-ink-50 px-3 py-2.5">
              <p className="text-xs font-medium text-ink-700">Encadenado</p>
              <p className="mt-1 text-xs text-ink-500">Huella anterior <Mono className="text-ink-800">{evento.huellaAnterior}</Mono></p>
              <p className="text-xs text-ink-500">Huella de este evento <Mono className="text-ink-800">{evento.huella}</Mono></p>
            </div>
            <p className="text-xs text-ink-400">El contenido de la petición no está disponible: Unburn no lo guarda (DEC-13).</p>
          </div>
        )}
      </Drawer>

      {verificar && <VerificarModal onClose={() => setVerificar(false)} eventos={eventos.length} sellos={sellos.length} />}
      {exportar && <ExportarModal onClose={() => setExportar(false)} plan={plan} onExportar={(opc) => {
        const desde = opc.dias
        const datosExp = {
          organizacion: org.nombre, generado: new Date().toISOString(), retencion: `${plan.diasRetencion} días`,
          eventos: eventos.slice(0, opc.dias === 1 ? 40 : eventos.length),
          ...(opc.config ? { configuracion: {
            clavesVirtuales: claves.map(({ nombre, prefijo, estado, modelos, agentes, politicaBucles, politicaFallos }) => ({ nombre, prefijo, estado, modelos, agentes, politicaBucles, politicaFallos })),
            presupuestos: deOrg('presupuestos').map(({ ambito, claveId, periodo, limiteBlando, limiteDuro }) => ({ ambito, clave: claveId && nombreClave(claves, claveId), periodo, limiteBlando, limiteDuro })),
            grafoAutorizacion: datos.grafos[org.id],
          } } : {}),
        }
        const contenido = opc.formato === 'json' ? JSON.stringify(datosExp, null, 2)
          : ['id;fecha;decision;codigo;clave;agente;modelo;coste;motivo;version_config;huella', ...datosExp.eventos.map((e) => [e.id, e.fecha, e.decision, e.codigo, nombreClave(claves, e.claveId), e.agente, e.modeloUsado, e.costeReal, `"${e.motivo}"`, e.versionConfig, e.huella].join(';'))].join('\n')
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([contenido], { type: opc.formato === 'json' ? 'application/json' : 'text/csv' }))
        a.download = `unburn-auditoria-${desde}d.${opc.formato}`
        a.click()
        setExportar(false)
        toast('Exportación descargada', 'exito', `${datosExp.eventos.length} eventos${opc.config ? ' + configuración' : ''} · nunca incluye la clave real ni la clave virtual completa`)
      }} />}
    </>
  )
}

function VerificarModal({ onClose, eventos, sellos }) {
  const [paso, setPaso] = useState(0)
  useEffect(() => {
    const ts = [setTimeout(() => setPaso(1), 700), setTimeout(() => setPaso(2), 1500), setTimeout(() => setPaso(3), 2200)]
    return () => ts.forEach(clearTimeout)
  }, [])
  const pasos = [`Recalculando la cadena de huellas de ${numero(eventos)} eventos`, `Comparando con ${sellos} sellos firmados`, 'Comprobando las firmas de los sellos']
  return (
    <Modal open onClose={onClose} title="Verificar integridad del registro" footer={<Button variant="primary" disabled={paso < 3} onClick={onClose}>Cerrar</Button>}>
      <ul className="space-y-3">
        {pasos.map((p, i) => (
          <li key={p} className={cx('flex items-center gap-2.5 text-sm', paso >= i ? 'text-ink-900' : 'text-ink-400')}>
            {paso > i ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : paso === i ? <Loader2 className="h-4 w-4 animate-spin text-ink-500" /> : <span className="h-4 w-4 rounded-full border border-ink-300" />}
            {p}
          </li>
        ))}
      </ul>
      {paso >= 3 && <Callout tone="success" className="mt-5" title="El registro está íntegro">Ningún evento se ha modificado ni borrado desde que se selló. Hora de la verificación: {hora(new Date().toISOString())}.</Callout>}
    </Modal>
  )
}

function ExportarModal({ onClose, onExportar, plan }) {
  const [opc, setOpc] = useState({ dias: plan.diasRetencion >= 30 ? 30 : 7, formato: 'json', config: true })
  return (
    <Modal open onClose={onClose} title="Exportar registro" description="Incluye los eventos de auditoría y, si quieres, la configuración (por ejemplo, para cambiar de proveedor)."
      footer={<><Button onClick={onClose}>Cancelar</Button><Button variant="primary" icon={Download} onClick={() => onExportar(opc)}>Exportar</Button></>}>
      <div className="space-y-4">
        <Field label="Periodo"><Select value={opc.dias} onChange={(e) => setOpc({ ...opc, dias: Number(e.target.value) })}>
          <option value={1}>Últimas 24 horas</option><option value={7}>Últimos 7 días</option>{plan.diasRetencion >= 30 && <option value={30}>Últimos 30 días</option>}{plan.diasRetencion >= 180 && <option value={180}>Últimos 6 meses</option>}
        </Select></Field>
        <div><p className="mb-1.5 text-xs font-medium text-ink-700">Formato</p><Segmented value={opc.formato} onChange={(f) => setOpc({ ...opc, formato: f })} options={[{ id: 'json', label: 'JSON' }, { id: 'csv', label: 'CSV' }]} /></div>
        <Checkbox checked={opc.config} onChange={(v) => setOpc({ ...opc, config: v })} label="Incluir la configuración" description="Claves virtuales con su nombre y prefijo, presupuestos y permisos de los agentes. Nunca la clave real ni la clave virtual completa." />
      </div>
    </Modal>
  )
}
