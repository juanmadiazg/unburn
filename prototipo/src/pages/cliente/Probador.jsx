import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Check, CircleSlash, Loader2, Minus, Play, RotateCcw, X } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { costeTokens } from '../../sim/generar'
import { presupuestosAfectados, registrarIncidente } from '../../sim/motor'
import { euros, numero } from '../../lib/format'
import { Badge, Button, Card, CardHeader, ChipSelect, CopyButton, Field, Input, Mono, PageHeader, Select, Toggle, cx } from '../../components/ui'

// Casos que fuerzan una salida concreta de BP-08 (10.4). Los demás controles salen de la configuración real.
const CASOS = [
  { grupo: 'Llega al proveedor', items: [
    ['normal', 'Petición normal'], ['auxiliar', 'Petición auxiliar (listar modelos)'], ['sustituido', 'Consumo anómalo → modelo económico'], ['bucle_aviso', 'Bucle con política «avisar»'],
  ] },
  { grupo: 'La rechaza Unburn antes de reenviarla', items: [
    ['volumen', 'Avalancha de peticiones (429)'], ['agente', 'Agente no permitido en la clave (403)'], ['modelo', 'Modelo no permitido (400)'], ['opcion', 'Opción sin precio registrado (400)'],
    ['freno', 'Consumo anómalo → freno (429)'], ['forzada', 'Obliga a usar una herramienta quitada (403)'], ['bucle_bloqueo', 'Bucle con política «bloquear» (422)'], ['presupuesto', 'No cabe en el presupuesto (402)'],
  ] },
  { grupo: 'Después de reenviar', items: [
    ['respuesta_herramienta', 'La respuesta pide una herramienta prohibida (403)'], ['proveedor_rechaza', 'El proveedor rechaza la entrada (400)'], ['fallo_medias', 'Fallo a medias del proveedor (502)'],
    ['timeout', 'Tiempo agotado (504)'], ['fallo_interno', 'Fallo interno de Unburn (503 o sin control)'],
  ] },
]

const PASOS = [
  ['recibir', '1', 'Petición recibida', 'IF-01 · API compatible con OpenAI y Anthropic'],
  ['acceso', '2', 'Validar acceso', 'Límite de volumen, rechazo barato, clave, API y cuota'],
  ['sesion', '3', 'Identificar sesión y agente', 'Añade la llamada al grafo de sesión (IC-15)'],
  ['normalizar', '4', 'Normalizar petición', 'Modelo, opciones con precio, cadenas, tamaño máximo'],
  ['generacion', '5', '¿Petición de generación?', 'Las auxiliares saltan al reenvío sin reservar'],
  ['inmune', '6', 'Analizar consumo', 'Sistema inmunológico: línea base de 7 días (IC-19)'],
  ['escudo', '7', 'Filtrar herramientas', 'Escudo MCP según el grafo de autorización (IC-11)'],
  ['bucles', '8', 'Comprobar bucles', 'Reglas exactas sobre el contenido nuevo (DEC-07)'],
  ['reserva', '9', 'Reservar presupuesto', 'Peor caso en todos los presupuestos a la vez (IF-03)'],
  ['reenvio', '10', 'Reenviar al proveedor', 'IF-02 · con la clave real, cifrada en Unburn'],
  ['respuesta', '11', 'Esperar el primer evento', 'Respuesta, rechazo, fallo a medias, tiempo o desconexión'],
  ['revisar', '12', 'Revisar la respuesta', 'Bloquea si pide una herramienta no permitida'],
  ['liquidar', '13', 'Liquidar gasto', 'Coste real a los presupuestos y libera el resto'],
  ['registrar', '14', 'Registrar y actualizar', 'Auditoría, grafo de sesión, agregados y cuota (IF-05)'],
]

function planificar({ datos, org, plan, clave, agente, modelo, herramientas, maxTokens, caso, sesion }) {
  const r = {}
  const set = (id, estado, detalle, ms) => { r[id] = { estado, detalle, ms } }
  const fin = (codigo, decision, motivo, extra = {}) => ({ pasos: r, codigo, decision, motivo, ...extra })
  const gw = () => Math.round(1 + Math.random() * 3)
  const grafo = datos.grafos[org.id]
  const herrCliente = datos.herramientas.filter((h) => h.orgId === org.id)
  const tokens = [1800 + Math.round(Math.random() * 2400), Math.min(maxTokens, 300 + Math.round(Math.random() * 700)), modelo === 'o4-mini' ? 900 : 0, 0]
  const costeReal = costeTokens(datos.modelos, modelo, tokens)
  const reserva = costeTokens(datos.modelos, modelo, [tokens[0], maxTokens, modelo === 'o4-mini' ? 4000 : 0, 0]) + 0.002
  const s = org.suscripcion

  set('recibir', 'ok', `POST /v1/${modelo.startsWith('claude') ? 'messages' : 'responses'} · ${numero(tokens[0])} tokens estimados`, 1)
  // 2. Validar acceso
  if (caso === 'volumen') { set('acceso', 'fail', 'Límite de volumen: más de 50 peticiones por segundo desde esta clave', gw()); return fin(429, 'frenada', 'Avalancha de peticiones frenada antes de procesarla · 429') }
  if (clave.estado !== 'activa') { set('acceso', 'fail', `La clave ${clave.prefijo}… está ${clave.estado}`, gw()); return fin(401, 'bloqueada', `Clave ${clave.estado} · 401`) }
  if (s.estado === 'cuota agotada' || s.estado === 'tope de excedente alcanzado') { set('acceso', 'fail', `Rechazo barato: ${s.estado}`, gw()); return fin(402, 'bloqueada', `Rechazo barato: ${s.estado} · 402`, { barato: true }) }
  set('acceso', 'ok', `Clave ${clave.prefijo}… válida · suscripción ${s.estado}`, gw())
  // 3. Sesión y agente
  if (caso === 'agente' || (clave.agentes.length && agente !== '(sin declarar)' && !clave.agentes.includes(agente))) { set('sesion', 'fail', `${agente} no está entre los agentes de la clave`, gw()); return fin(403, 'bloqueada', `Agente ${agente} no permitido para la clave · 403`) }
  set('sesion', sesion ? 'ok' : 'warn', sesion ? `Sesión ${sesion} · agente ${agente}` : 'Sin X-Unburn-Session: no se podrán detectar bucles', gw())
  // 4. Normalizar
  if (caso === 'modelo' || !clave.modelos.includes(modelo)) { set('normalizar', 'fail', `${modelo} no está permitido en la clave (${clave.modelos.join(', ')})`, gw()); return fin(400, 'bloqueada', `Modelo ${modelo} no permitido · 400`) }
  if (caso === 'opcion') { set('normalizar', 'fail', 'service_tier=priority no tiene precio registrado: el peor caso no sería fiable (OF-04)', gw()); return fin(400, 'bloqueada', 'Opción service_tier=priority sin precio registrado · 400') }
  set('normalizar', 'ok', `max_output_tokens ajustado a ${numero(Math.min(maxTokens, clave.maxRespuesta))} · entrada máx. ${numero(clave.maxEntrada)}`, gw())
  // 5. Generación o auxiliar
  if (caso === 'auxiliar') {
    set('generacion', 'skip', 'Auxiliar: no reserva, no cuenta en la cuota', 0)
    for (const id of ['inmune', 'escudo', 'bucles', 'reserva']) set(id, 'skip', 'Se salta en peticiones auxiliares', 0)
    set('reenvio', 'ok', 'GET /v1/models', 180); set('respuesta', 'ok', 'Respuesta recibida', 0); set('revisar', 'skip', 'Sin herramientas', 0); set('liquidar', 'skip', 'Las auxiliares no liquidan nada', 0); set('registrar', 'ok', 'Evento de auditoría (auxiliar)', 1)
    return fin(200, 'permitida', 'Petición auxiliar (listar modelos): no reserva ni cuenta en la cuota', { auxiliar: true, tokens: [0, 0, 0, 0], costeReal: 0, reserva: 0 })
  }
  set('generacion', 'ok', 'Sí: sigue el recorrido completo', 0)
  // 6. Sistema inmunológico
  let modeloUsado = modelo
  if (caso === 'freno') { set('inmune', 'fail', 'Consumo 6,2× la línea base · respuesta: frenar', gw()); return fin(429, 'frenada', 'Sistema inmunológico: consumo 6,2× la línea base · frenar · 429') }
  if (caso === 'sustituido') {
    if (!plan.respuestasInmunologico.includes('modelo') || !clave.modeloSustituto) set('inmune', 'warn', 'Consumo 9,1× la línea base · aviso (tu plan o la clave no permiten cambiar de modelo)', gw())
    else { modeloUsado = clave.modeloSustituto; set('inmune', 'warn', `Consumo 9,1× la línea base · cambio a ${clave.modeloSustituto}`, gw()) }
  } else set('inmune', 'ok', `Normal (${clave.lineaBase?.eurosMin?.toFixed(3).replace('.', ',') || '0'} €/min de media)`, gw())
  // 7. Escudo MCP
  const permitidas = plan.escudoCompleto && clave.agentes.length ? grafo.puedeUsar.filter(([a]) => a === agente).map(([, t]) => herrCliente.find((h) => h.id === t)?.nombre) : null
  const proveedorAut = clave.herramientasProveedor
  const quitadas = herramientas.filter((h) => {
    const def = herrCliente.find((x) => x.nombre === h)
    if (def?.ejecuta === 'proveedor' || ['web_search', 'code_execution', 'file_search'].includes(h)) return !proveedorAut.includes(h)
    if (!plan.escudoCompleto || grafo.modo !== 'proteccion') return false
    return permitidas ? !permitidas.includes(h) : false
  })
  if (caso === 'forzada') { set('escudo', 'fail', `tool_choice obliga a usar ${quitadas[0] || 'consultar_bd_clientes'}, que se ha quitado`, gw()); return fin(403, 'bloqueada', 'Escudo MCP: la petición obliga a usar una herramienta no permitida · 403', { incidente: 'herramienta' }) }
  set('escudo', quitadas.length ? 'warn' : 'ok', quitadas.length ? `Quitadas de la petición: ${quitadas.join(', ')}` : herramientas.length ? `Todas permitidas (${grafo.modo === 'proteccion' ? 'modo protección' : 'modo aprendizaje'})` : 'Sin herramientas', gw())
  // 8. Bucles
  if (caso === 'bucle_bloqueo' || (caso === 'bucle_aviso' && clave.politicaBucles === 'bloqueo')) { set('bucles', 'fail', '4 intercambios con la misma huella · política de la clave: bloqueo', gw()); return fin(422, 'bloqueada', 'Regla bucle.ping_pong · política: bloqueo · 422', { quitadas }) }
  const marcada = caso === 'bucle_aviso'
  set('bucles', marcada ? 'warn' : 'ok', marcada ? '4 repeticiones · política «avisar»: la respuesta irá marcada' : sesion ? 'Sin repeticiones en la sesión' : 'Sin sesión: no se comprueba', gw())
  // 9. Reserva
  const afectados = presupuestosAfectados(datos, org.id, clave.id)
  const sinHueco = caso === 'presupuesto' ? afectados[0] || { periodo: 'diario', limiteDuro: 0, ambito: 'clave' } : afectados.find((b) => b.gastado + b.reservado + reserva > b.limiteDuro)
  if (sinHueco) { set('reserva', 'fail', `No cabe en el presupuesto ${sinHueco.periodo} (${sinHueco.limiteDuro} €): no se reenvía`, 2); return fin(402, 'bloqueada', `Presupuesto ${sinHueco.periodo} sin hueco · 402`, { quitadas }) }
  set('reserva', 'ok', `${euros(reserva, 4)} apartados en ${afectados.length} presupuestos`, 2)
  // 10–12. Proveedor
  const lat = 500 + Math.round(Math.random() * 1600)
  set('reenvio', 'ok', `${modeloUsado} · ${modeloUsado.startsWith('claude') ? 'Anthropic' : 'OpenAI'}`, 0)
  if (caso === 'proveedor_rechaza') { set('respuesta', 'fail', 'Rechazo de entrada del proveedor: se libera la reserva sin gasto', 240); set('revisar', 'skip', '—', 0); set('liquidar', 'ok', 'Reserva liberada · 0 €', 1); set('registrar', 'ok', 'Cuenta en la cuota aunque no tenga gasto (DEC-03)', 1); return fin(400, 'bloqueada', 'Rechazo del proveedor devuelto tal cual · 400', { reenviada: true, costeReal: 0, reserva, quitadas, tokens }) }
  if (caso === 'fallo_medias') { set('respuesta', 'fail', 'La generación había empezado: se liquida con estimación', lat); set('revisar', 'skip', '—', 0); set('liquidar', 'warn', `Liquidado con estimación: ${euros(costeReal * 0.6, 4)}`, 1); set('registrar', 'ok', 'Cuenta en la cuota y tiene gasto estimado', 1); return fin(502, 'bloqueada', 'Fallo a medias del proveedor · liquidado con estimación · 502', { reenviada: true, costeReal: costeReal * 0.6, reserva, quitadas, tokens }) }
  if (caso === 'timeout') { set('respuesta', 'fail', 'Tiempo agotado (60 s): se cancela la petición', 60000); set('revisar', 'skip', '—', 0); set('liquidar', 'warn', `Liquidado con estimación: ${euros(costeReal * 0.8, 4)}`, 1); set('registrar', 'ok', 'Cuenta en la cuota y tiene gasto estimado', 1); return fin(504, 'bloqueada', 'Tiempo agotado · cancelada y liquidada con estimación · 504', { reenviada: true, costeReal: costeReal * 0.8, reserva, quitadas, tokens }) }
  if (caso === 'fallo_interno') {
    const pasa = clave.politicaFallos === 'dejar_pasar'
    set('respuesta', pasa ? 'warn' : 'fail', pasa ? 'El Motor de presupuestos no responde: la clave deja pasar sin control' : 'El Motor de presupuestos no responde: política de la clave «bloquear» (DEC-08)', 3)
    if (!pasa) { set('revisar', 'skip', '—', 0); set('liquidar', 'skip', '—', 0); set('registrar', 'ok', 'Evento con el motivo del rechazo', 1); return fin(503, 'bloqueada', 'Fallo interno · política ante fallos: bloquear · 503', { quitadas }) }
  } else set('respuesta', 'ok', `Respuesta recibida · ${numero(tokens[1])} tokens de salida`, lat)
  if (caso === 'respuesta_herramienta') {
    set('revisar', 'fail', 'El modelo pidió consultar_bd_clientes, no permitida para el agente: respuesta bloqueada', 1)
    set('liquidar', 'ok', `Coste real ${euros(costeReal, 4)} · liberado ${euros(reserva - costeReal, 4)}`, 2); set('registrar', 'ok', 'Evento + incidente «herramienta denegada»', 1)
    return fin(403, 'bloqueada', 'Escudo MCP: la respuesta pedía una herramienta no permitida · respuesta bloqueada · 403', { reenviada: true, costeReal, reserva, quitadas, tokens, incidente: 'herramienta' })
  }
  set('revisar', 'ok', marcada ? 'Respuesta marcada con X-Unburn-Loop-Warning' : 'Sin herramientas prohibidas', 1)
  const real = modeloUsado !== modelo ? costeTokens(datos.modelos, modeloUsado, tokens) : costeReal
  set('liquidar', 'ok', `Coste real ${euros(real, 4)} · liberado ${euros(reserva - real, 4)}`, 2)
  set('registrar', 'ok', 'Auditoría, grafo de sesión, agregados de 15 min y cuota', 1)
  return fin(200, modeloUsado !== modelo ? 'modelo sustituido' : 'permitida', modeloUsado !== modelo ? `Sistema inmunológico: cambio a ${modeloUsado}` : marcada ? 'Bucle detectado · política: aviso (respuesta marcada)' : quitadas.length ? `Escudo MCP: quitadas ${quitadas.join(', ')}` : 'Sin reglas aplicables', { reenviada: true, costeReal: real, reserva, quitadas, tokens, modeloUsado })
}

const ICONOS = { ok: [Check, 'text-emerald-600 border-emerald-300 dark:border-emerald-500/40'], warn: [AlertTriangle, 'text-amber-600 border-amber-300 dark:border-amber-500/40'], fail: [X, 'text-red-600 border-red-300 dark:border-red-500/40'], skip: [Minus, 'text-ink-400 border-ink-200'] }

export default function Probador() {
  const { org, plan, datos, deOrg, ejecutarPeticion, esLector, aplicar } = useApp()
  const claves = deOrg('clavesVirtuales')
  const [claveId, setClaveId] = useState(claves.find((k) => k.estado === 'activa')?.id)
  const clave = claves.find((k) => k.id === claveId) || claves[0]
  const [agente, setAgente] = useState(clave.agentes[0] || '(sin declarar)')
  const [modelo, setModelo] = useState(clave.modelos[0])
  const [herramientas, setHerramientas] = useState([])
  const [sesion, setSesion] = useState('ses_prueba01')
  const [maxTokens, setMaxTokens] = useState(1024)
  const [streaming, setStreaming] = useState(true)
  const [caso, setCaso] = useState('normal')
  const [resultado, setResultado] = useState(null)
  const [visibles, setVisibles] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [eventoId, setEventoId] = useState(null)
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => { setAgente(clave.agentes[0] || '(sin declarar)'); setModelo(clave.modelos[0]) }, [claveId]) // eslint-disable-line react-hooks/exhaustive-deps

  const herramientasPosibles = useMemo(() => [...new Set([...datos.herramientas.filter((h) => h.orgId === org.id).map((h) => h.nombre), 'web_search', 'code_execution'])], [datos.herramientas, org.id])
  const modelosCatalogo = datos.modelos.filter((m) => m.estado === 'activo').map((m) => m.modelo)

  const enviar = () => {
    timers.current.forEach(clearTimeout)
    const r = planificar({ datos, org, plan, clave, agente, modelo, herramientas, maxTokens, caso, sesion: sesion.trim() })
    setResultado(r); setVisibles(0); setEnviando(true); setEventoId(null)
    const ids = PASOS.map(([id]) => id).filter((id) => r.pasos[id])
    ids.forEach((id, i) => timers.current.push(setTimeout(() => setVisibles(i + 1), 280 * (i + 1) + (r.pasos.respuesta && ids.indexOf('respuesta') <= i ? 500 : 0))))
    timers.current.push(setTimeout(() => {
      setEnviando(false)
      // Se registra de verdad: aparece en el registro de auditoría y, si llegó al proveedor, cuenta en la cuota (DEC-03)
      const evId = `evt_${Math.random().toString(36).slice(2, 10)}`
      ejecutarPeticion({ eventoId: evId,
        orgId: org.id, claveId: clave.id, agente, sesionId: sesion.trim() || null, modeloPedido: modelo, modeloUsado: r.modeloUsado || modelo,
        tipo: r.auxiliar ? 'auxiliar' : 'generacion', tokens: r.tokens || [0, 0, 0, 0], costeReal: r.costeReal || 0, costeEstimado: r.reserva || 0,
        decision: r.decision, codigo: r.codigo, motivo: `${r.motivo} · enviada desde el probador`, herramientasQuitadas: r.quitadas || [], reenviada: r.reenviada,
        decisionForzada: !r.barato, latenciaMs: 900, ip: 'probador', origen: 'probador',
      })
      setEventoId(evId)
      if (r.incidente === 'herramienta') aplicar((d) => registrarIncidente(d, { orgId: org.id, tipo: 'herramienta_denegada', subtipo: 'probador', titulo: `${agente} pidió una herramienta no permitida (probador)`, claveId: clave.id, sesionId: sesion.trim() || null, agente, parteAfectada: `Petición de prueba desde el probador (${clave.nombre})`, respuestaAplicada: r.motivo, costeIncidente: r.costeReal || 0 }))
    }, 280 * (ids.length + 1) + 600))
  }

  const curl = `curl https://gateway.unburn.eu/v1/${modelo.startsWith('claude') ? 'messages' : 'responses'} \\
  -H "Authorization: Bearer ${clave.prefijo}…" \\
  -H "X-Unburn-Session: ${sesion || '—'}" \\${clave.agentes.length > 1 ? `\n  -H "X-Unburn-Agent: ${agente}" \\` : ''}
  -d '{"model": "${modelo}", "max_output_tokens": ${maxTokens}, "stream": ${streaming},
       "tools": [${herramientas.map((h) => `"${h}"`).join(', ')}], "input": "…"}'`

  const total = resultado ? Object.values(resultado.pasos).filter((p) => p.ms < 10000).reduce((a, p) => a + p.ms, 0) : 0
  const latGw = resultado ? Object.entries(resultado.pasos).filter(([id]) => !['reenvio', 'respuesta'].includes(id)).reduce((a, [, p]) => a + p.ms, 0) : 0
  const terminado = resultado && !enviando

  return (
    <>
      <PageHeader title="Probador de peticiones" refs={['BP-08', '10.4', 'OF-03', 'OF-04', 'OF-07', 'DEC-03', 'DEC-06']}
        description="Envía una petición de prueba con una de tus claves y mira, paso a paso, qué decide el Gateway. Usa tu configuración real: si cambias una política, el resultado cambia." />
      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="space-y-4 p-4">
            <Field label="Qué quieres probar">
              <Select value={caso} onChange={(e) => setCaso(e.target.value)} data-caso>
                {CASOS.map((g) => <optgroup key={g.grupo} label={g.grupo}>{g.items.map(([id, n]) => <option key={id} value={id}>{n}</option>)}</optgroup>)}
              </Select>
            </Field>
            <Field label="Clave virtual"><Select value={claveId} onChange={(e) => setClaveId(e.target.value)}>{claves.map((k) => <option key={k.id} value={k.id}>{k.nombre} · {k.estado}</option>)}</Select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Agente (X-Unburn-Agent)"><Select value={agente} onChange={(e) => setAgente(e.target.value)}>{[...new Set([...(clave.agentes.length ? clave.agentes : ['(sin declarar)']), ...deOrg('agentes').map((a) => a.id)])].map((a) => <option key={a}>{a}</option>)}</Select></Field>
              <Field label="Modelo"><Select value={modelo} onChange={(e) => setModelo(e.target.value)}>{modelosCatalogo.map((m) => <option key={m}>{m}</option>)}</Select></Field>
              <Field label="Sesión (X-Unburn-Session)"><Input value={sesion} onChange={(e) => setSesion(e.target.value)} placeholder="vacío = sin sesión" className="font-mono" /></Field>
              <Field label="max_output_tokens"><Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value) || 1)} /></Field>
            </div>
            <div><p className="mb-1.5 text-xs font-medium text-ink-700">Herramientas ofrecidas al modelo</p><ChipSelect mono options={herramientasPosibles} value={herramientas} onChange={setHerramientas} /></div>
            <label className="flex items-center justify-between text-sm text-ink-700">Streaming <Toggle checked={streaming} onChange={setStreaming} label="Streaming" /></label>
            <Button variant="brand" className="w-full" icon={enviando ? Loader2 : Play} disabled={enviando} onClick={enviar} data-enviar>{enviando ? 'Enviando…' : 'Enviar petición de prueba'}</Button>
            {esLector && <p className="text-xs text-ink-500">Como lector puedes usar el probador: no cambia ninguna configuración.</p>}
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title="Equivalente en curl" actions={<CopyButton text={curl} />} />
            <pre className="overflow-x-auto bg-ink-50 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-ink-800">{curl}</pre>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Recorrido de la petición (BP-08)" subtitle={resultado ? `${terminado ? 'Terminado' : 'En curso'} · Gateway ${latGw} ms${total > latGw ? ` · total ${numero(total)} ms` : ''}` : 'Elige un caso y envía la petición'} />
            <ol className="px-4 py-3" data-recorrido>
              {PASOS.map(([id, n, titulo, sub], i) => {
                const p = resultado?.pasos[id]
                const orden = resultado ? PASOS.filter(([x]) => resultado.pasos[x]).findIndex(([x]) => x === id) : -1
                const visible = p && orden < visibles
                const actual = p && orden === visibles && enviando
                const [I, c] = visible ? ICONOS[p.estado] : [null, 'border-ink-200 text-ink-300']
                return (
                  <li key={id} className={cx('relative flex gap-3 pb-3 last:pb-0', !p && resultado && 'opacity-40')}>
                    {i < PASOS.length - 1 && <span className="absolute left-[11px] top-6 h-[calc(100%-18px)] w-px bg-ink-150" />}
                    <span className={cx('relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-surface text-2xs font-medium', c)}>
                      {visible ? <I className="h-3.5 w-3.5" /> : actual ? <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" /> : n}
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={cx('text-sm', visible ? 'text-ink-950' : 'text-ink-500')}>{titulo}</p>
                        {visible && p.ms > 0 && <span className="shrink-0 font-mono text-[11px] text-ink-400">{p.ms >= 1000 ? `${(p.ms / 1000).toFixed(p.ms >= 10000 ? 0 : 1).replace('.', ',')} s` : `${p.ms} ms`}</span>}
                      </div>
                      <p className={cx('text-xs', visible ? (p.estado === 'fail' ? 'text-red-600 dark:text-red-400' : p.estado === 'warn' ? 'text-amber-700 dark:text-amber-400' : 'text-ink-500') : 'text-ink-400')}>{visible ? p.detalle : sub}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </Card>

          {terminado && (
            <Card className="animate-slide-in" data-respuesta={resultado.codigo}>
              <CardHeader title={<span className="flex items-center gap-2">Respuesta <Badge tone={resultado.codigo === 200 ? 'green' : resultado.codigo >= 500 ? 'amber' : 'red'}>HTTP {resultado.codigo}</Badge></span>}
                actions={<Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => { setResultado(null); setVisibles(0) }}>Limpiar</Button>} />
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-ink-700">Cabeceras</p>
                  <pre className="overflow-x-auto rounded-md bg-ink-50 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-ink-800">{`X-Unburn-Request-Id: req_${Math.random().toString(36).slice(2, 10)}
X-Unburn-Decision: ${resultado.decision}
X-Unburn-Config-Version: cfg-v${datos.grafos[org.id].version}${resultado.motivo.includes('marcada') ? '\nX-Unburn-Loop-Warning: ping_pong' : ''}${resultado.quitadas?.length ? `\nX-Unburn-Tools-Removed: ${resultado.quitadas.join(',')}` : ''}`}</pre>
                  <p className="mb-1.5 mt-3 text-xs font-medium text-ink-700">Cuerpo</p>
                  <pre className="overflow-x-auto rounded-md bg-ink-50 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-ink-800">{resultado.codigo === 200 ? '{ "id": "resp_…", "output": "…", "usage": { … } }' : JSON.stringify({ error: { type: 'unburn_' + resultado.decision.replace(' ', '_'), code: resultado.codigo, message: resultado.motivo } }, null, 2)}</pre>
                </div>
                <dl className="space-y-2 text-sm">
                  {[['Decisión', resultado.decision], ['Motivo', resultado.motivo], ['Reservado', resultado.reserva ? euros(resultado.reserva, 4) : '—'], ['Coste real', euros(resultado.costeReal || 0, 4)], ['Liberado', resultado.reserva ? euros(Math.max(0, resultado.reserva - (resultado.costeReal || 0)), 4) : '—'],
                    ['¿Cuenta en la cuota?', resultado.reenviada && !resultado.auxiliar ? 'Sí: llegó al proveedor (DEC-03)' : 'No: Unburn la rechazó o es auxiliar'], ['Latencia añadida por el Gateway', `${latGw} ms`]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-ink-100 pb-2"><dt className="text-ink-500">{k}</dt><dd className="text-right text-ink-900">{v}</dd></div>
                  ))}
                  <p className="pt-1 text-xs text-ink-500">Registrada en el <Link to={eventoId ? `/app/auditoria?evento=${eventoId}` : '/app/auditoria'} className="font-medium text-ink-900 hover:underline">registro de auditoría</Link> como una petición más{eventoId ? <> (<Mono>{eventoId}</Mono>)</> : ''}.</p>
                </dl>
              </div>
            </Card>
          )}
          {!resultado && <Card className="p-6 text-sm text-ink-500"><CircleSlash className="mb-2 h-4 w-4 text-ink-400" />Prueba, por ejemplo, «No cabe en el presupuesto» con la clave <span className="text-ink-800">equipo-datos</span>: Unburn responde 402 sin llegar a llamar al proveedor.</Card>}
        </div>
      </div>
    </>
  )
}
