import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { euros, fecha, numero } from '../lib/format'
import { UNA_SERIE } from '../lib/dominio'
import { useColores } from '../lib/hooks'

// Ejes y rejilla recesivos; una sola escala por gráfica.
const ejeY = { tickLine: false, axisLine: false, width: 52 }
const ejeXDe = (c) => ({ tickLine: false, axisLine: { stroke: c.eje }, tickMargin: 8 })
const rejillaDe = (c) => <CartesianGrid vertical={false} stroke={c.rejilla} />

function Caja({ titulo, filas, total }) {
  return (
    <div className="min-w-[190px] rounded-md bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="mb-1 font-medium text-ink-950">{titulo}</p>
      {filas.map((f) => (
        <div key={f.nombre} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-ink-600">{f.color && <span className="h-2 w-2 rounded-sm" style={{ background: f.color }} />}{f.nombre}</span>
          <span className="tabular-nums text-ink-950">{f.valor}</span>
        </div>
      ))}
      {total && <div className="mt-1 flex justify-between border-t border-ink-150 pt-1 font-medium text-ink-950"><span>Total</span><span className="tabular-nums">{total}</span></div>}
    </div>
  )
}

/** Gasto total diario (una serie) */
export function GastoTotalChart({ datos, alto = 240 }) {
  const c = useColores()
  const ejeX = ejeXDe(c)
  const rejilla = rejillaDe(c)
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <AreaChart data={datos} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="relleno-total" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={UNA_SERIE} stopOpacity={0.14} />
            <stop offset="100%" stopColor={UNA_SERIE} stopOpacity={0} />
          </linearGradient>
        </defs>
        {rejilla}
        <XAxis dataKey="dia" {...ejeX} tickFormatter={(d) => fecha(d, { anio: false })} interval={6} />
        <YAxis {...ejeY} tickFormatter={(v) => `${Math.round(v)} €`} />
        <Tooltip cursor={{ stroke: c.cursor, strokeWidth: 1, strokeDasharray: '3 3' }}
          content={({ active, payload, label }) => active && payload?.length ? <Caja titulo={fecha(label)} filas={[{ nombre: 'Gasto', color: UNA_SERIE, valor: euros(payload[0].value) }]} /> : null} />
        <Area type="monotone" dataKey="total" stroke={UNA_SERIE} strokeWidth={2} fill="url(#relleno-total)" isAnimationActive={false} activeDot={{ r: 4, stroke: c.superficie, strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** Gasto diario apilado por clave virtual (IC-21) */
export function GastoDiarioChart({ datos, series, colores, alto = 260 }) {
  const c = useColores()
  const ejeX = ejeXDe(c)
  const rejilla = rejillaDe(c)
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <AreaChart data={datos} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        {rejilla}
        <XAxis dataKey="dia" {...ejeX} tickFormatter={(d) => fecha(d, { anio: false })} interval={6} />
        <YAxis {...ejeY} tickFormatter={(v) => `${Math.round(v)} €`} />
        <Tooltip cursor={{ stroke: c.cursor, strokeWidth: 1, strokeDasharray: '3 3' }}
          content={({ active, payload, label }) => active && payload?.length ? (
            <Caja titulo={fecha(label)} total={euros(payload.reduce((a, p) => a + (p.value || 0), 0))}
              filas={[...payload].reverse().map((p) => ({ nombre: series.find((s) => s.id === p.dataKey)?.nombre, color: colores[p.dataKey], valor: euros(p.value) }))} />
          ) : null} />
        {series.map((s) => (
          <Area key={s.id} type="monotone" dataKey={s.id} stackId="1" stroke={colores[s.id]} strokeWidth={1.5} fill={colores[s.id]} fillOpacity={0.16} isAnimationActive={false} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** Gasto de hoy en intervalos de 15 minutos (IC-21) */
export function IntervalosChart({ datos, alto = 240 }) {
  const c = useColores()
  const ejeX = ejeXDe(c)
  const rejilla = rejillaDe(c)
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={datos} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap={2}>
        {rejilla}
        <XAxis dataKey="hora" {...ejeX} interval={7} />
        <YAxis {...ejeY} tickFormatter={(v) => `${v.toFixed(1)} €`} />
        <Tooltip cursor={{ fill: c.rejilla }} content={({ active, payload, label }) => active && payload?.length ? (
          <Caja titulo={`Hoy, ${label}–${siguiente(label)}`} filas={[{ nombre: 'Gasto', color: UNA_SERIE, valor: euros(payload[0].value) }, { nombre: 'Peticiones facturables', valor: numero(payload[0].payload.peticiones) }]} />
        ) : null} />
        <Bar dataKey="euros" fill={UNA_SERIE} radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
const siguiente = (h) => { const [a, b] = h.split(':').map(Number); const m = a * 60 + b + 15; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` }

/** Barras horizontales de una sola serie con etiqueta directa */
export function BarrasSimples({ datos, formato = (v) => v }) {
  const max = Math.max(...datos.map((d) => d.valor), 1)
  return (
    <ul className="space-y-3">
      {datos.map((d) => (
        <li key={d.nombre} title={`${d.nombre}: ${formato(d.valor)}`}>
          <div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-ink-700">{d.nombre}</span><span className="tabular-nums text-ink-950">{formato(d.valor)}</span></div>
          <div className="h-1.5 rounded-full bg-ink-100"><div className="h-full rounded-full" style={{ width: `${(d.valor / max) * 100}%`, background: d.color || UNA_SERIE }} /></div>
        </li>
      ))}
    </ul>
  )
}

/** Serie mensual en barras verticales (back-office). dataKey: string o [{key, nombre, color}] apiladas */
export function BarrasMensuales({ datos, dataKey, formato, alto = 200 }) {
  const c = useColores()
  const ejeX = ejeXDe(c)
  const rejilla = rejillaDe(c)
  const series = Array.isArray(dataKey) ? dataKey : [{ key: dataKey, nombre: dataKey, color: UNA_SERIE }]
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={datos} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="35%">
        {rejilla}
        <XAxis dataKey="etiqueta" {...ejeX} />
        <YAxis {...ejeY} tickFormatter={formato} />
        <Tooltip cursor={{ fill: c.rejilla }} content={({ active, payload, label }) => active && payload?.length ? (
          <Caja titulo={label} filas={[...payload].reverse().map((p) => ({ nombre: p.name, color: p.color || p.fill, valor: formato(p.value) }))}
            total={payload.length > 1 ? formato(payload.reduce((a, p) => a + p.value, 0)) : null} />
        ) : null} />
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.nombre} stackId="a" fill={s.color} isAnimationActive={false} stroke={c.superficie} strokeWidth={1}
            radius={i === series.length - 1 ? [2, 2, 0, 0] : 0} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Leyenda({ items }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((i) => (
        <span key={i.nombre} className="flex items-center gap-1.5 text-xs text-ink-600"><span className="h-2 w-2 rounded-sm" style={{ background: i.color }} />{i.nombre}</span>
      ))}
    </div>
  )
}
