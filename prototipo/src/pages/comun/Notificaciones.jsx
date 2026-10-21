import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import { fechaHora, haceCuanto } from '../../lib/format'
import { Button, Card, EmptyState, PageHeader, Segmented, Tag, cx } from '../../components/ui'

const TIPOS = { incidente: 'Incidente', limite_blando: 'Presupuesto', cuota: 'Cuota', tope_excedente: 'Excedente', seguridad: 'Seguridad', ticket: 'Ticket', cobro: 'Cobro', incidencia: 'Incidencia técnica', informe: 'Informe', sistema: 'Sistema' }

export default function Notificaciones() {
  const { notificaciones, marcarLeidas } = useApp()
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('todas')
  const lista = [...notificaciones].sort((a, b) => b.fecha.localeCompare(a.fecha)).filter((n) => filtro === 'todas' || (filtro === 'sin' ? !n.leida : n.tipo === filtro))
  const sinLeer = notificaciones.filter((n) => !n.leida).length
  const tipos = [...new Set(notificaciones.map((n) => n.tipo))]
  return (
    <>
      <PageHeader title="Notificaciones" description="Todo lo que Unburn te ha avisado. Las alertas también llegan por los canales configurados." refs={['IC-23', 'AP-10']}
        actions={<Button icon={CheckCheck} disabled={!sinLeer} onClick={() => marcarLeidas()}>Marcar todas como leídas</Button>} />
      <div className="mb-4"><Segmented value={filtro} onChange={setFiltro} options={[{ id: 'todas', label: 'Todas' }, { id: 'sin', label: `Sin leer${sinLeer ? ` · ${sinLeer}` : ''}` }, ...tipos.map((t) => ({ id: t, label: TIPOS[t] || t }))]} /></div>
      <Card>
        {lista.length === 0 ? <EmptyState icon={Bell} title="Nada por aquí">Cuando Unburn detecte un incidente, cruces de presupuesto o avisos de cuota, aparecerán aquí.</EmptyState> : (
          <ul className="divide-y divide-ink-100">
            {lista.map((n) => (
              <li key={n.id}>
                <button onClick={() => { marcarLeidas([n.id]); if (n.enlace) navigate(n.enlace) }} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ink-50">
                  <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', n.leida ? 'bg-transparent' : 'bg-brand-500')} />
                  <span className="min-w-0 flex-1">
                    <span className={cx('block text-sm', n.leida ? 'text-ink-700' : 'font-medium text-ink-950')}>{n.titulo}</span>
                    {n.detalle && <span className="mt-0.5 block text-xs text-ink-500">{n.detalle}</span>}
                  </span>
                  <Tag>{TIPOS[n.tipo] || n.tipo}</Tag>
                  <span className="w-24 shrink-0 text-right text-xs text-ink-400" title={fechaHora(n.fecha)}>{haceCuanto(n.fecha)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
