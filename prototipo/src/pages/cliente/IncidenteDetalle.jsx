import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, CheckCircle2, Network } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { nombreClave } from '../../lib/hooks'
import { SUBTIPOS_BUCLE, TIPOS_INCIDENTE } from '../../lib/dominio'
import { ahoraIso, euros, fechaHora, haceCuanto, rangoEuros } from '../../lib/format'
import { Badge, Button, Callout, Card, CardHeader, EmptyState, KV, Modal, Mono, PageHeader, PlanLock, UsageBar, cx } from '../../components/ui'
import { estadoIncidente } from './Incidentes'

export default function IncidenteDetalle() {
  const { id } = useParams()
  const { deOrg, datos, mutar, plan, usuario, toast } = useApp()
  const [revisar, setRevisar] = useState(false)
  const inc = deOrg('incidentes').find((i) => i.id === id)
  if (!inc) return <Card><EmptyState title="Incidente no encontrado">{id} no existe en esta organización.</EmptyState></Card>
  const sesion = datos.sesiones.find((s) => s.id === inc.sesionId)
  const tipo = TIPOS_INCIDENTE[inc.tipo]
  const alertas = deOrg('alertas').filter((a) => a.enlace.endsWith(inc.id))
  const canal = (cid) => deOrg('canales').find((c) => c.id === cid)
  const ajustes = { bucle: ['/app/claves', 'Cambiar política de bucles'], consumo_anomalo: ['/app/claves', 'Revisar modelo sustituto'], presupuesto_agotado: ['/app/presupuestos', 'Ajustar presupuesto'], herramienta_denegada: ['/app/agentes', 'Revisar permisos'] }[inc.tipo]

  const marcarRevisado = () => {
    mutar('incidentes', (l) => l.map((i) => (i.id === inc.id ? { ...i, estado: 'cerrado', revisadoPor: `${usuario.nombre} ${usuario.apellidos.split(' ')[0]}`, revisadoEl: ahoraIso() } : i)))
    setRevisar(false)
    toast(`Incidente ${inc.id} revisado y cerrado`, 'exito', 'Unburn deja de mantener la alerta abierta')
  }

  return (
    <>
      <PageHeader title={inc.titulo} refs={['BP-09', 'OF-06', 'IC-20', 'AP-09', 'DEC-04']}
        description={<span className="flex flex-wrap items-center gap-2"><Mono className="text-ink-500">{inc.id}</Mono><span className="text-ink-300">·</span><Badge tone={tipo.tono}>{tipo.nombre}</Badge>{estadoIncidente(inc)}<span className="text-ink-500">Detectado {haceCuanto(inc.fecha)}</span></span>}
        actions={<>
          <Link to={ajustes[0]}><Button>{ajustes[1]}</Button></Link>
          {inc.estado === 'abierto' && <Button variant="brand" icon={Check} requiereAdmin onClick={() => setRevisar(true)}>Marcar como revisado</Button>}
        </>} />

      {inc.estado === 'cerrado' && <Callout tone="success" icon={CheckCircle2} className="mb-6">Revisado por {inc.revisadoPor} el {fechaHora(inc.revisadoEl)}.</Callout>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Qué ha pasado" />
            <div className="space-y-4 px-4 py-4">
              <p className="text-sm text-ink-800">{inc.respuestaAplicada}</p>
              <KV cols={3} items={[
                ['Parte afectada', inc.parteAfectada],
                ['Clave', nombreClave(datos.clavesVirtuales, inc.claveId)],
                ['Agente', inc.agente ? <Mono key="a">{inc.agente}</Mono> : '—'],
                ['Sesión', inc.sesionId ? (sesion ? <Link key="s" to={`/app/contexto/${inc.sesionId}`} className="font-mono text-[12px] text-ink-950 underline decoration-ink-300 underline-offset-2">{inc.sesionId}</Link> : <Mono key="s">{inc.sesionId}</Mono>) : '—'],
                ['Detectado', fechaHora(inc.fecha)],
                ['Última actividad', fechaHora(inc.ultimaActividad)],
              ]} />
              {inc.nota && <Callout tone="warn">{inc.nota} <Link to="/app/agentes" className="font-medium text-ink-950 hover:underline">Ver grafo de autorización</Link></Callout>}
            </div>
          </Card>

          {inc.tipo === 'bucle' && <Diagnostico inc={inc} sesion={sesion} plan={plan} />}
          {inc.tipo === 'consumo_anomalo' && <Inmunologico inc={inc} sesion={sesion} plan={plan} />}
          {inc.tipo === 'presupuesto_agotado' && <Presupuesto inc={inc} />}
          {inc.tipo === 'herramienta_denegada' && sesion && <Llamadas sesion={sesion} destacadas={inc.llamadasImplicadas} titulo="Llamadas implicadas" />}
        </div>

        <div className="space-y-6">
          <ProcesoBP09 inc={inc} plan={plan} alertas={alertas.length} />
          <Card>
            <CardHeader title="Coste" />
            <dl className="divide-y divide-ink-100">
              <Fila k="Coste del incidente" v={euros(inc.costeIncidente)} />
              {inc.cotaSuperior != null && <Fila k="Cota superior atribuible" v={euros(inc.cotaSuperior)} />}
            </dl>
            {inc.ahorro && (
              <div className="border-t border-ink-150 px-4 py-4">
                <p className="text-xs text-ink-500">Gasto evitado (estimado)</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-emerald-700 tabular-nums">{rangoEuros(inc.ahorro)}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-600"><span className="font-medium text-ink-800">Hipótesis. </span>{inc.ahorro.hipotesis}</p>
              </div>
            )}
            {inc.costePrevisto && (
              <div className="border-t border-ink-150 px-4 py-4">
                <p className="text-xs text-ink-500">Coste previsto si continúa</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink-950 tabular-nums">{euros(inc.costePrevisto.valor)}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-600"><span className="font-medium text-ink-800">Hipótesis. </span>{inc.costePrevisto.hipotesis}</p>
                <p className="mt-2 text-xs text-ink-500">Unburn solo avisó, así que no se muestra ahorro (DEC-04).</p>
              </div>
            )}
            {inc.tipo === 'herramienta_denegada' && <p className="border-t border-ink-150 px-4 py-3 text-xs text-ink-500">En las herramientas denegadas no se estima ahorro.</p>}
          </Card>

          <Card>
            <CardHeader title="Alertas enviadas" />
            {alertas.length === 0 ? <p className="px-4 py-4 text-sm text-ink-500">No se envió ninguna alerta: había un incidente abierto con la misma causa en la última hora.</p> : (
              <ul className="divide-y divide-ink-100">
                {alertas.map((a) => <li key={a.id} className="flex items-center justify-between px-4 py-2.5 text-sm"><span className="text-ink-800">{canal(a.canal)?.destino || a.canal}</span><span className="text-xs text-ink-500">{haceCuanto(a.fecha)}</span></li>)}
              </ul>
            )}
          </Card>

          {inc.huellas.length > 0 && (
            <Card>
              <CardHeader title="Huellas de las llamadas" subtitle="Unburn compara huellas, nunca el texto" />
              <div className="flex flex-wrap gap-1.5 px-4 py-3">{inc.huellas.map((h) => <Mono key={h} className="rounded bg-ink-100 px-1.5 py-0.5 text-ink-700">{h}</Mono>)}</div>
            </Card>
          )}
        </div>
      </div>

      <Modal open={revisar} onClose={() => setRevisar(false)} title="Marcar como revisado" size="sm"
        footer={<><Button onClick={() => setRevisar(false)}>Cancelar</Button><Button variant="primary" onClick={marcarRevisado}>Marcar como revisado</Button></>}>
        <p className="text-sm text-ink-700">El incidente se cerrará. Si vuelve a ocurrir lo mismo, Unburn abrirá un incidente nuevo y enviará otra alerta.</p>
      </Modal>
    </>
  )
}

/** Pasos del BPMN de BP-09 (10.5) que ha seguido este incidente */
function ProcesoBP09({ inc, plan, alertas }) {
  const pasos = [
    ['Incidente detectado', `Mensaje del Gateway (IF-04) · ${fechaHora(inc.fecha)}`, true],
    ['Registrado', inc.ocurrencias > 1 ? `Actualizado ${inc.ocurrencias - 1} ${inc.ocurrencias === 2 ? 'vez' : 'veces'} sin nueva alerta: misma causa y misma parte en la última hora` : 'Incidente nuevo', true],
    inc.tipo === 'consumo_anomalo' && ['Endurecer límites 24 h', plan.respuestasInmunologico?.includes('bloqueo') ? (inc.endurecidoHasta ? `Hasta el ${fechaHora(inc.endurecidoHasta)} sobre la parte afectada` : 'Pendiente') : 'No aplica en el plan Gratis', !!inc.endurecidoHasta],
    ['Calcular coste', `${euros(inc.costeIncidente)}${inc.cotaSuperior ? ` · cota superior ${euros(inc.cotaSuperior)}` : ''}`, true],
    inc.tipo === 'bucle' && ['Diagnosticar causa', plan.diagnosticoCausal ? (inc.causaRaiz ? `Causa raíz en ${inc.causaRaiz.llamadaId}` : 'Sin causa concluyente') : 'Disponible en Pro y Enterprise', !!inc.causaRaiz],
    inc.tipo !== 'herramienta_denegada' && [inc.ahorro ? 'Estimar ahorro' : 'Calcular coste previsto', inc.ahorro ? rangoEuros(inc.ahorro) : inc.costePrevisto ? euros(inc.costePrevisto.valor) : '—', !!(inc.ahorro || inc.costePrevisto)],
    ['Publicar diagnóstico y avisar', alertas ? `${alertas} ${alertas === 1 ? 'alerta enviada' : 'alertas enviadas'} con enlace al panel` : 'Sin alertas: no había canales para este aviso', true],
    ['Revisado por el administrador', inc.estado === 'cerrado' ? `${inc.revisadoPor} · ${fechaHora(inc.revisadoEl)}` : 'Pendiente: Unburn mantiene la respuesta configurada', inc.estado === 'cerrado'],
  ].filter(Boolean)
  return (
    <Card>
      <CardHeader title="Proceso BP-09" subtitle="Gestionar incidente (10.5)" />
      <ol className="px-4 py-3">
        {pasos.map(([t, d, hecho], i) => (
          <li key={t} className="relative flex gap-3 pb-3 last:pb-0">
            {i < pasos.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-ink-200" />}
            <span className={cx('relative mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2', hecho ? 'border-navy bg-navy' : 'border-ink-300 bg-surface')} />
            <div className="min-w-0"><p className={cx('text-sm', hecho ? 'text-ink-950' : 'text-ink-500')}>{t}</p><p className="text-xs text-ink-500">{d}</p></div>
          </li>
        ))}
      </ol>
    </Card>
  )
}

const Fila = ({ k, v }) => <div className="flex items-center justify-between px-4 py-2.5"><dt className="text-sm text-ink-600">{k}</dt><dd className="text-sm font-medium tabular-nums text-ink-950">{v}</dd></div>

function Diagnostico({ inc, sesion, plan }) {
  if (!plan.diagnosticoCausal) {
    return (
      <Card>
        <CardHeader title="Diagnóstico causal" />
        <div className="p-4">
          <p className="mb-4 text-sm text-ink-700">{SUBTIPOS_BUCLE[inc.subtipo]}.</p>
          <PlanLock>En Pro, Unburn recorre el grafo de la sesión con IA causal para señalar el paso que originó el bucle y la cota superior del coste que provocó.</PlanLock>
        </div>
        {sesion && <div className="border-t border-ink-150"><Llamadas sesion={sesion} destacadas={inc.llamadasImplicadas} sinCard /></div>}
      </Card>
    )
  }
  const raiz = inc.causaRaiz
  return (
    <Card>
      <CardHeader title="Diagnóstico causal" subtitle={SUBTIPOS_BUCLE[inc.subtipo]}
        actions={sesion && <Link to={`/app/contexto/${sesion.id}`}><Button size="sm" icon={Network}>Abrir en el grafo de contexto</Button></Link>} />
      {raiz && (
        <div className="border-b border-ink-150 px-4 py-4">
          <p className="text-xs text-ink-500">Paso que originó el bucle</p>
          <p className="mt-1 text-sm text-ink-950"><Mono className="rounded bg-red-50 px-1.5 py-0.5 text-red-700">{raiz.llamadaId}</Mono> <span className="ml-1">{raiz.agente}</span></p>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{raiz.explicacion}</p>
          <p className="mt-3 text-sm text-ink-700"><span className="font-medium text-ink-950">Recomendación. </span>{raiz.recomendacion}</p>
        </div>
      )}
      {sesion && <Llamadas sesion={sesion} destacadas={inc.llamadasImplicadas} raiz={raiz?.llamadaId} sinCard />}
    </Card>
  )
}

function Llamadas({ sesion, destacadas = [], raiz, titulo, sinCard }) {
  const max = Math.max(...sesion.llamadas.map((c) => c.coste), 0.01)
  const contenido = (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-ink-150 bg-ink-50/60 text-xs text-ink-500">
        <th className="h-8 px-4 text-left font-medium">Llamada</th><th className="px-4 text-left font-medium">Agente</th><th className="hidden px-4 text-left font-medium md:table-cell">Encargada por</th>
        <th className="px-4 text-left font-medium">Decisión</th><th className="px-4 text-right font-medium">Coste</th><th className="hidden w-32 px-4 md:table-cell" />
      </tr></thead>
      <tbody className="divide-y divide-ink-100">
        {sesion.llamadas.map((c) => {
          const en = destacadas.includes(c.id)
          return (
            <tr key={c.id} className={cx(c.id === raiz && 'bg-red-50/60', !en && destacadas.length > 0 && 'text-ink-400')}>
              <td className="h-9 px-4"><Mono className={cx(c.id === raiz ? 'text-red-700' : en ? 'text-ink-950' : 'text-ink-400')}>{c.id}</Mono><span className="ml-2 text-xs text-ink-400">{c.hora}</span></td>
              <td className="px-4 font-mono text-[12px]">{c.agente}</td>
              <td className="hidden px-4 font-mono text-[12px] md:table-cell">{c.encargadoPor || '—'}</td>
              <td className="px-4">{c.decision === 'permitida' ? <span className="text-xs">Permitida</span> : <Badge tone={c.decision === 'bloqueada' ? 'red' : c.decision === 'frenada' ? 'amber' : 'blue'}>{c.decision[0].toUpperCase() + c.decision.slice(1)}</Badge>}</td>
              <td className="px-4 text-right tabular-nums">{euros(c.coste)}</td>
              <td className="hidden px-4 md:table-cell"><div className="h-1.5 rounded-full bg-ink-100"><div className={cx('h-full rounded-full', en ? 'bg-red-400' : 'bg-ink-300')} style={{ width: `${(c.coste / max) * 100}%` }} /></div></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
  if (sinCard) return <div className="overflow-x-auto">{contenido}</div>
  return <Card><CardHeader title={titulo} /><div className="overflow-x-auto">{contenido}</div></Card>
}

function Inmunologico({ inc, sesion, plan }) {
  const pasos = sesion?.llamadas.filter((c) => c.decision !== 'permitida' || c.motivo.includes('inmunológico')) || []
  return (
    <Card>
      <CardHeader title="Sistema inmunológico" subtitle="Respuesta por grados sobre la parte afectada" />
      {inc.lineaBase && (
        <div className="grid grid-cols-3 divide-x divide-ink-100 border-b border-ink-150">
          <div className="px-4 py-3"><p className="text-xs text-ink-500">Línea base (7 días)</p><p className="mt-1 text-lg font-semibold tabular-nums text-ink-950">{euros(inc.lineaBase.eurosMinuto, 2)}/min</p></div>
          <div className="px-4 py-3"><p className="text-xs text-ink-500">Observado</p><p className="mt-1 text-lg font-semibold tabular-nums text-ink-950">{euros(inc.lineaBase.observado, 2)}/min</p></div>
          <div className="px-4 py-3"><p className="text-xs text-ink-500">Desviación</p><p className="mt-1 text-lg font-semibold tabular-nums text-red-600">×{String(inc.lineaBase.factor).replace('.', ',')}</p></div>
        </div>
      )}
      <ol className="space-y-0 px-4 py-4">
        {pasos.map((c, i) => (
          <li key={c.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < pasos.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-ink-200" />}
            <span className={cx('relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 bg-surface', c.decision === 'frenada' ? 'border-red-500' : c.decision === 'modelo sustituido' ? 'border-sky-500' : 'border-amber-500')} />
            <div><p className="text-sm text-ink-900">{c.motivo}</p><p className="text-xs text-ink-500">{c.hora} · <Mono>{c.id}</Mono></p></div>
          </li>
        ))}
      </ol>
      {inc.endurecidoHasta && (
        <div className="border-t border-ink-150 px-4 py-3 text-sm text-ink-700">
          {plan.inmunologicoCompleto ? <>Límites endurecidos para esta parte hasta el <span className="font-medium text-ink-950">{fechaHora(inc.endurecidoHasta)}</span>. El resto del servicio funciona con normalidad.</> : 'En el plan Gratis no se endurecen los límites tras el incidente.'}
        </div>
      )}
    </Card>
  )
}

function Presupuesto({ inc }) {
  const { deOrg } = useApp()
  const p = deOrg('presupuestos').find((x) => x.claveId === inc.claveId && x.periodo === 'diario')
  if (!p) return null
  return (
    <Card>
      <CardHeader title="Presupuesto afectado" actions={<Link to="/app/presupuestos"><Button size="sm">Editar límites</Button></Link>} />
      <div className="px-4 py-4">
        <div className="mb-2 flex justify-between text-sm"><span className="text-ink-700">Diario · límite duro {euros(p.limiteDuro, 0)}</span><span className="tabular-nums text-ink-950">{euros(p.gastado)}</span></div>
        <UsageBar gastado={p.gastado} reservado={p.reservado} blando={p.limiteBlando} duro={p.limiteDuro} />
        <p className="mt-3 text-xs text-ink-500">Los rechazos baratos (402) se registran agrupados cada pocos segundos y no cuentan en la cuota de peticiones (DEC-03).</p>
      </div>
    </Card>
  )
}
