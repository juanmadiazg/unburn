import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Lightbulb, RotateCcw } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { calcularRecomendaciones } from '../../lib/recomendaciones'
import { euros } from '../../lib/format'
import { Button, Card, EmptyState, PageHeader, Section, Tabs, Tag, cx } from '../../components/ui'
import Kpis from '../../components/Kpis'

const TONO = { Seguridad: 'text-red-600 dark:text-red-400', Coste: 'text-emerald-700 dark:text-emerald-400', Presupuesto: 'text-amber-700 dark:text-amber-400', Fiabilidad: 'text-sky-700 dark:text-sky-400', Plan: 'text-brand-600' }

export default function Recomendaciones() {
  const { datos, org, plan, aplicar, mutar, registrarCambio, toast, esAdmin } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('pendientes')
  const [abierta, setAbierta] = useState(null)
  const todas = useMemo(() => calcularRecomendaciones(datos, org, plan), [datos, org, plan])
  const estado = datos.recomendaciones
  const pendientes = todas.filter((r) => !estado[r.id])
  const historico = Object.entries(estado).filter(([, v]) => v.estado === (tab === 'aplicadas' ? 'aplicada' : 'descartada')).map(([id, v]) => ({ id, ...v }))
  const ahorroPosible = pendientes.reduce((a, r) => a + (r.ahorroMensual || 0), 0)

  const marcar = (r, nuevo) => aplicar((d) => ({ ...d, recomendaciones: { ...d.recomendaciones, [r.id]: { estado: nuevo, titulo: r.titulo, tipo: r.tipo, impacto: r.impacto, fecha: new Date().toISOString() } } }))
  const ejecutar = (r) => {
    if (r.accion.ir) return navigate(r.accion.ir)
    r.accion.aplicar({ aplicar, mutar, registrarCambio })
    marcar(r, 'aplicada')
  }

  return (
    <>
      <PageHeader title="Recomendaciones" refs={['12.5', '4.2 · 3.1', 'BP-05', 'BP-06', 'BP-07']}
        description="Qué cambiar para gastar menos y reducir riesgos, calculado con los datos de tu tráfico. Cada recomendación muestra su evidencia y se puede aplicar desde aquí." />

      <Section title="Indicadores" description="Últimos 7 días, salvo el gasto evitado (30 días)"><Kpis /></Section>

      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'pendientes', label: 'Pendientes', count: pendientes.length },
        { id: 'aplicadas', label: 'Aplicadas', count: Object.values(estado).filter((v) => v.estado === 'aplicada').length },
        { id: 'descartadas', label: 'Descartadas', count: Object.values(estado).filter((v) => v.estado === 'descartada').length },
      ]} />

      {tab === 'pendientes' && (
        <>
          {ahorroPosible > 0 && <p className="mb-4 text-sm text-ink-600">Aplicando las recomendaciones de coste ahorrarías unos <span className="font-semibold text-ink-950">{euros(ahorroPosible, 0)} al mes</span>.</p>}
          {pendientes.length === 0 ? <Card><EmptyState icon={Lightbulb} title="No hay recomendaciones pendientes">Tu configuración está al día. Volveremos a analizar el tráfico con cada cambio.</EmptyState></Card> : (
            <div className="space-y-3">
              {pendientes.map((r) => (
                <Card key={r.id} className="p-4" data-recomendacion={r.id}>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className={cx('text-xs font-medium', TONO[r.tipo])}>{r.tipo}</p>
                      <h3 className="mt-1 text-sm font-semibold text-ink-950">{r.titulo}</h3>
                      <p className="mt-1 max-w-3xl text-sm text-ink-600">{r.descripcion}</p>
                      <button onClick={() => setAbierta(abierta === r.id ? null : r.id)} className="mt-2 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-900">
                        Ver los datos <ChevronDown className={cx('h-3 w-3 transition-transform', abierta === r.id && 'rotate-180')} />
                      </button>
                      {abierta === r.id && <ul className="mt-2 space-y-1 rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-600">{r.evidencia.map((e) => <li key={e}>{e}</li>)}</ul>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-semibold tabular-nums text-ink-950">{r.impacto}</span>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" requiereAdmin onClick={() => { marcar(r, 'descartada'); toast('Recomendación descartada', 'info') }}>Descartar</Button>
                        <Button size="sm" variant={r.accion.ir ? 'secondary' : 'primary'} requiereAdmin={!r.accion.ir} onClick={() => ejecutar(r)}>{r.accion.etiqueta}</Button>
                      </div>
                      <Link to={r.enlace} className="text-xs text-ink-500 hover:text-ink-900">Ver en su pantalla</Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {!esAdmin && <p className="mt-4 text-xs text-ink-500">Tu rol es lector: puedes consultar las recomendaciones, pero aplicarlas lo hace un administrador.</p>}
        </>
      )}

      {tab !== 'pendientes' && (
        <Card>
          {historico.length === 0 ? <EmptyState title={tab === 'aplicadas' ? 'Aún no has aplicado ninguna' : 'No has descartado ninguna'} /> : (
            <ul className="divide-y divide-ink-100">
              {historico.map((h) => (
                <li key={h.id} className="flex items-center gap-3 px-4 py-3">
                  <Tag>{h.tipo}</Tag>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-900">{h.titulo}</span>
                  <span className="text-xs text-ink-500">{h.impacto}</span>
                  {tab === 'descartadas' && <Button size="xs" variant="ghost" icon={RotateCcw} onClick={() => aplicar((d) => { const n = { ...d.recomendaciones }; delete n[h.id]; return { ...d, recomendaciones: n } })}>Recuperar</Button>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  )
}
