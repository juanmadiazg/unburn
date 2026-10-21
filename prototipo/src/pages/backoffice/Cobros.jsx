import { useState } from 'react'
import { useApp } from '../../store/AppStore'
import { euros, mesLargo, numero } from '../../lib/format'
import { mesActual } from '../../lib/tiempo'
import { Badge, Button, Callout, ConfirmModal, DataTable, Mono, PageHeader, PlanBadge, Stat } from '../../components/ui'

const COBRO = { pagado: ['green', 'Cobrado'], fallido: ['red', 'Fallido'], pendiente: ['amber', 'Pendiente'] }

/** BP-12 Generar facturas: el Servicio de facturación calcula y emite, la plataforma de pagos cobra y Finanzas gestiona los fallidos (IF-30) */
export default function Cobros() {
  const { datos, mutar, toast } = useApp()
  const [cierre, setCierre] = useState(false)
  const filas = datos.clientes.filter((c) => c.plan !== 'gratis' && c.estado !== 'de baja').map((c) => ({ ...c, base: c.ingresoMes, total: Math.round(c.ingresoMes * 1.21 * 100) / 100 }))
  const suma = (f) => filas.filter(f).reduce((a, c) => a + c.total, 0)
  const reintentar = (c) => { mutar('clientes', (l) => l.map((x) => (x.id === c.id ? { ...x, cobro: 'pagado' } : x))); toast('Cobro reintentado con éxito', 'exito', `${c.nombre} · ${euros(c.total)} · confirmado por la plataforma de pagos`) }
  return (
    <>
      <PageHeader title="Cobros" refs={['BP-12', 'IC-06', 'IF-25', 'IF-30', 'AP-11', 'AP-14']}
        description={`Suscripciones, excedentes y contratos de ${mesLargo(mesActual()).toLowerCase()}. Unburn no ve los datos de las tarjetas: los cobra la plataforma de pagos.`}
        actions={<Button variant="brand" onClick={() => setCierre(true)}>Cerrar el mes</Button>} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Facturado (IVA incluido)" value={euros(suma(() => true), 0)} sub={`${filas.length} clientes de pago`} />
        <Stat label="Cobrado" value={euros(suma((c) => c.cobro === 'pagado'), 0)} />
        <Stat label="Fallido" value={euros(suma((c) => c.cobro === 'fallido'), 0)} sub="Requiere acción de Finanzas" />
        <Stat label="Pendiente" value={euros(suma((c) => c.cobro === 'pendiente'), 0)} sub="Altas recientes y contratos" />
      </div>
      {filas.some((c) => c.cobro === 'fallido') && <Callout tone="danger" className="mb-4" title="Hay cobros fallidos">La plataforma de pagos ha rechazado el cargo. Reintenta el cobro o contacta con el cliente; si no se resuelve, el servicio sigue activo hasta el cierre del mes siguiente.</Callout>}
      <DataTable rows={filas} initialSort={{ id: 'total', dir: 'desc' }} search={(c) => c.nombre} searchPlaceholder="Buscar cliente…"
        filters={[{ id: 'cobro', label: 'Cobro', options: Object.entries(COBRO).map(([id, [, l]]) => ({ id, label: l })), value: (c) => c.cobro }, { id: 'plan', label: 'Plan', options: [{ id: 'pro', label: 'Pro' }, { id: 'enterprise', label: 'Enterprise' }], value: (c) => c.plan }]}
        columns={[
          { id: 'cliente', header: 'Cliente', sort: (c) => c.nombre, cell: (c) => <div><p className="text-ink-950">{c.nombre}</p><Mono className="text-ink-400">{c.contrato || c.id}</Mono></div> },
          { id: 'plan', header: 'Plan', cell: (c) => <PlanBadge plan={c.plan} /> },
          { id: 'pet', header: 'Peticiones', align: 'right', cell: (c) => (c.peticionesMes != null ? numero(c.peticionesMes) : 'Licencia') },
          { id: 'base', header: 'Base', align: 'right', cell: (c) => euros(c.base) },
          { id: 'total', header: 'Total', align: 'right', sort: (c) => c.total, cell: (c) => <span className="font-medium text-ink-950">{euros(c.total)}</span> },
          { id: 'cobro', header: 'Estado', cell: (c) => <Badge tone={COBRO[c.cobro]?.[0] || 'gray'}>{COBRO[c.cobro]?.[1] || c.cobro}</Badge> },
          { id: 'acc', header: '', align: 'right', cell: (c) => c.cobro === 'fallido' && <div className="flex justify-end gap-1"><Button size="xs" variant="ghost" onClick={() => toast('Email enviado al cliente', 'exito', 'Con el enlace para actualizar el medio de pago')}>Contactar</Button><Button size="xs" onClick={() => reintentar(c)}>Reintentar</Button></div> },
        ]} />
      <ConfirmModal open={cierre} onClose={() => setCierre(false)} title="Cerrar el mes" danger={false} confirmLabel="Cerrar y emitir facturas"
        onConfirm={() => { setCierre(false); toast('Cierre de mes programado', 'exito', 'El Servicio de facturación emitirá las facturas el día 1 con las peticiones facturables agregadas (IF-26)') }}>
        El Servicio de facturación tomará las peticiones facturables agregadas del mes, calculará el importe de cada suscripción con sus excedentes y lo cobrará a través de la plataforma de pagos. Los cobros fallidos volverán a esta pantalla.
      </ConfirmModal>
    </>
  )
}
