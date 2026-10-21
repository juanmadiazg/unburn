import { useMemo } from 'react'
import { useApp } from '../store/AppStore'
import { calcularKpis } from '../lib/kpis'
import { decimal, euros, rangoEuros } from '../lib/format'
import { Ayuda, Cifra, cx } from './ui'

/** Tira de indicadores de 4.2 (3.1 y 3.2) para el cliente */
export default function Kpis({ compacto }) {
  const { datos, org, plan } = useApp()
  const k = useMemo(() => calcularKpis(datos, org.id, plan), [datos, org.id, plan])
  const items = [
    { label: 'Coste medio por sesión resuelta', valor: <Cifra valor={k.costeMedioSesion} formato={(v) => euros(v, v < 0.1 ? 4 : 2)} />, sub: `${k.sesionesResueltas} sesiones sin bloqueos · 7 días`, ayuda: 'Gasto medio de las tareas (sesiones) que terminaron sin ningún bloqueo ni freno. Sirve para comparar el coste real de cada tarea entre agentes y modelos.' },
    { label: 'Bloqueos por seguridad', valor: <Cifra valor={k.tasaBloqueosSeguridad} formato={(v) => `${decimal(v)} %`} />, sub: `${k.bloqueosSeguridad} bloqueadas · ${k.quitadas} con herramientas quitadas`, ayuda: 'Porcentaje de peticiones de generación que el escudo de herramientas o las reglas de delegación bloquearon (403).' },
    { label: 'Latencia añadida (p95)', valor: <Cifra valor={k.latenciaP95} formato={(v) => `${v} ms`} />, sub: `Mediana ${k.latenciaP50} ms · objetivo < 50 ms`, ayuda: 'Retraso que añade el Gateway sin contar lo que tarda el proveedor. Objetivo OG-07: menos de 50 ms en el 95 % de las peticiones.', barra: Math.min(100, (k.latenciaP95 / 50) * 100) },
    { label: 'Ahorro por modelo sustituto', valor: <Cifra valor={k.diferenciaSustituto.ahorro} formato={(v) => euros(v)} />, sub: k.diferenciaSustituto.peticiones ? `−${Math.round(k.diferenciaSustituto.pct)} % en ${k.diferenciaSustituto.peticiones} peticiones cambiadas` : 'Ninguna petición cambiada esta semana', ayuda: 'Diferencia entre lo que habrían costado las peticiones con el modelo pedido y lo que costaron con el modelo económico al que las cambió el sistema inmunológico.' },
    { label: 'Gasto evitado · 30 días', valor: rangoEuros(k.gastoEvitado), sub: `${k.gastoEvitado.n} intervenciones · rango con hipótesis`, ayuda: 'Solo cuenta cuando Unburn detiene o frena algo: un bucle bloqueado, un corte por presupuesto o un freno por consumo anómalo (DEC-04).' },
    { label: 'ROI de la suscripción', valor: k.roi != null ? `${decimal(k.roi)}×` : '—', sub: k.roi != null ? `Gasto evitado medio frente a ${euros(k.cuota, 0)} al mes` : 'El plan Gratis no tiene coste', ayuda: 'Punto medio del gasto evitado en 30 días dividido entre lo que cuesta la suscripción al mes.' },
  ]
  return (
    <div className={cx('grid gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200', compacto ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'sm:grid-cols-2 xl:grid-cols-3')}>
      {items.map((i) => (
        <div key={i.label} className="bg-surface p-4">
          <p className="flex items-center gap-1.5 text-xs text-ink-500">{i.label} <Ayuda texto={i.ayuda} /></p>
          <p className={cx('mt-1.5 font-semibold tracking-[-0.02em] text-ink-950', compacto ? 'text-lg' : 'text-2xl')}>{i.valor}</p>
          <p className="mt-1 text-xs text-ink-500">{i.sub}</p>
          {i.barra != null && <div className="mt-2 h-1 rounded-full bg-ink-150"><div className={cx('h-full rounded-full', i.barra > 90 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${i.barra}%` }} /></div>}
        </div>
      ))}
    </div>
  )
}
