// Recomendaciones de ajuste (OF-17, DEC-34, BP-10): reglas sobre los metadatos del propio cliente.
// Solo los cuatro tipos del documento: modelo más económico, crear o ajustar un presupuesto, quitar
// una delegación que abre un camino indirecto y revisar herramientas nuevas. Nunca se aplican solas:
// el administrador las aplica (BP-05, BP-06 o BP-07) o las descarta.
import { costeTokens } from '../sim/generar'
import { caminosIndirectos } from './dominio'
import { haceDias } from './tiempo'

const euros0 = (v) => `${Math.round(v).toLocaleString('es-ES')} €`

export function calcularRecomendaciones(datos, org, plan) {
  if (!org) return []
  const orgId = org.id
  const claves = datos.clavesVirtuales.filter((k) => k.orgId === orgId && k.estado === 'activa')
  const eventos = datos.eventos.filter((e) => e.orgId === orgId && haceDias(e.fecha, 7) && e.tipo === 'generacion')
  const recs = []

  // 1. Modelo de razonamiento usado para tareas sencillas (OF-04, 4.2 3.1)
  for (const k of claves.filter((x) => x.modelos.includes('o4-mini'))) {
    const delModelo = eventos.filter((e) => e.claveId === k.id && e.modeloUsado === 'o4-mini')
    const sencillas = delModelo.filter((e) => e.tokens.salida < 1500)
    if (!sencillas.length) continue
    const destino = 'gpt-4.1-mini'
    const ahorroPorPeticion = sencillas.reduce((a, e) => {
      const t = [e.tokens.entrada, e.tokens.salida, e.tokens.razonamiento, e.tokens.cache]
      return a + (costeTokens(datos.modelos, 'o4-mini', t) - costeTokens(datos.modelos, destino, [t[0], t[1], 0, t[3]]))
    }, 0) / sencillas.length
    const cuota = sencillas.length / Math.max(1, eventos.filter((e) => e.claveId === k.id).length)
    const mensual = ahorroPorPeticion * k.peticionesMes * cuota * 1.3
    if (mensual < 1) continue
    const agente = k.agentes[0] || k.nombre
    recs.push({
      id: `modelo-${k.id}`, tipo: 'Coste', prioridad: 1,
      titulo: `Probar un modelo más económico en ${agente}`,
      descripcion: `El ${Math.round(cuota * 100)} % de sus peticiones con o4-mini (un modelo de razonamiento) devuelven respuestas cortas, menos de 1.500 tokens, lo que apunta a tareas sencillas. Unburn no lee el contenido, así que no puede saber si ${destino} responde igual de bien: propone probarlo en la clave ${k.nombre}, con un ahorro estimado de unos ${euros0(mensual)} al mes (DEC-34).`,
      evidencia: [`${sencillas.length} de ${delModelo.length} peticiones de los últimos 7 días con o4-mini fueron sencillas`, `Ahorro medio por petición: ${(ahorroPorPeticion * 100).toFixed(2).replace('.', ',')} céntimos`],
      impacto: `−${euros0(mensual)}/mes`, ahorroMensual: mensual,
      accion: { etiqueta: `Probar ${destino}`, aplicar: ({ mutar, registrarCambio }) => { mutar('clavesVirtuales', (l) => l.map((x) => (x.id === k.id ? { ...x, modelos: [...new Set(x.modelos.map((m) => (m === 'o4-mini' ? destino : m)))] } : x))); registrarCambio(`${k.nombre}: o4-mini sustituido por ${destino}`) } },
      enlace: `/app/claves?clave=${k.id}`,
    })
  }

  // 2. Presupuesto que se agota de forma recurrente (BP-06)
  for (const b of datos.presupuestos.filter((p) => p.orgId === orgId && p.gastado >= p.limiteDuro)) {
    const clave = claves.find((k) => k.id === b.claveId)
    const inc = datos.incidentes.find((i) => i.orgId === orgId && i.tipo === 'presupuesto_agotado' && i.claveId === b.claveId)
    const nuevoDuro = Math.ceil((b.limiteDuro * 1.3) / 5) * 5
    recs.push({
      id: `presupuesto-${b.id}`, tipo: 'Presupuesto', prioridad: 2,
      titulo: `${clave ? clave.nombre : 'La organización'} agota su presupuesto ${b.periodo}`,
      descripcion: `El límite duro de ${b.limiteDuro} € ya se ha alcanzado${inc ? ` y lleva ${inc.ocurrencias || 1} peticiones rechazadas con 402` : ''}. Si el gasto es legítimo, súbelo a ${nuevoDuro} €; si no, revisa qué hace ${clave?.agentes[0] || 'el agente'} antes de tocarlo.`,
      evidencia: [`Gastado ${b.gastado.toFixed(2).replace('.', ',')} € de ${b.limiteDuro} €`, inc ? `Incidente ${inc.id} abierto` : 'Sin incidente abierto'],
      impacto: 'Evita cortes de servicio', accion: { etiqueta: `Subir el límite duro a ${nuevoDuro} €`, aplicar: ({ mutar, registrarCambio }) => { mutar('presupuestos', (l) => l.map((x) => (x.id === b.id ? { ...x, limiteDuro: nuevoDuro, limiteBlando: Math.round(nuevoDuro * 0.8) } : x))); registrarCambio(`Presupuesto ${b.periodo} ajustado a ${nuevoDuro} €`) } },
      enlace: '/app/presupuestos',
    })
  }

  // 3. Caminos indirectos hacia datos prohibidos (OF-08)
  if (plan.escudoCompleto) {
    const herramientas = datos.herramientas.filter((h) => h.orgId === orgId)
    const nombre = (id) => herramientas.find((h) => h.id === id)?.nombre
    for (const c of caminosIndirectos(datos.grafos[orgId], herramientas)) {
      const [de, a] = c.ruta
      recs.push({
        id: `camino-${de}-${a}-${c.herramienta}`, tipo: 'Seguridad', prioridad: 0,
        titulo: `${de} puede llegar a datos prohibidos a través de ${c.ruta[c.ruta.length - 1]}`,
        descripcion: `Tiene prohibida la categoría «${datos.categoriasDatos.find((x) => x.id === c.categoria)?.nombre}», pero puede delegar en ${a}, que usa ${nombre(c.herramienta)}. Si un atacante engaña a ${de}, podría llegar a esos datos. Quita la delegación si no es imprescindible.`,
        evidencia: [`Camino ${c.ruta.join(' → ')} → ${nombre(c.herramienta)}`],
        impacto: 'Cierra un camino indirecto', accion: { etiqueta: `Quitar la delegación ${de.replace('agente-', '')} → ${a.replace('agente-', '')}`, aplicar: ({ aplicar, registrarCambio }) => { aplicar((d) => ({ ...d, grafos: { ...d.grafos, [orgId]: { ...d.grafos[orgId], puedeDelegar: d.grafos[orgId].puedeDelegar.filter(([p, q]) => !(p === de && q === a)) } } })); registrarCambio(`Delegación ${de} → ${a} eliminada`) } },
        enlace: '/app/agentes',
      })
    }
  }

  // 6. Claves con tráfico y sin presupuesto propio (OG-01)
  for (const k of claves.filter((x) => x.peticionesMes > 200 && !datos.presupuestos.some((p) => p.claveId === x.id))) {
    const diario = Math.max(2, Math.ceil(((k.gastoMes / 21) * 2) / 1) * 1)
    recs.push({
      id: `sinpresupuesto-${k.id}`, tipo: 'Presupuesto', prioridad: 2,
      titulo: `${k.nombre} no tiene presupuesto propio`,
      descripcion: `Solo la limitan los presupuestos de la organización. Un límite diario de ${diario} € (el doble de su media) cortaría un bucle o un abuso sin afectar a las demás claves.`,
      evidencia: [`Gasto medio diario: ${(k.gastoMes / 21).toFixed(2).replace('.', ',')} €`], impacto: 'Acota el peor caso',
      accion: { etiqueta: `Crear límite diario de ${diario} €`, aplicar: ({ mutar, registrarCambio }) => { mutar('presupuestos', (l) => [...l, { id: `pre_${k.id}_dia`, orgId, ambito: 'clave', claveId: k.id, periodo: 'diario', limiteBlando: Math.round(diario * 0.8 * 100) / 100, limiteDuro: diario, gastado: k.gastoHoy, reservado: 0 }]); registrarCambio(`Presupuesto diario de ${diario} € para ${k.nombre}`) } },
      enlace: '/app/presupuestos',
    })
  }

  // 8. Herramientas descubiertas pendientes de revisar (BP-07)
  const pendientes = datos.herramientas.filter((h) => h.orgId === orgId && h.estado === 'pendiente')
  if (pendientes.length && plan.escudoCompleto) {
    recs.push({
      id: 'herramientas-pendientes', tipo: 'Seguridad', prioridad: 2,
      titulo: `${pendientes.length} herramientas nuevas esperan revisión`,
      descripcion: `${pendientes.map((h) => h.nombre).join(' y ')} aparecieron en los últimos días. Mientras no les asignes una categoría de datos, el análisis de caminos indirectos no las tiene en cuenta.`,
      evidencia: pendientes.map((h) => `${h.nombre} · vista en ${(h.vistaEn || []).join(', ')}`), impacto: 'Permisos completos',
      accion: { etiqueta: 'Revisar herramientas', ir: '/app/agentes' }, enlace: '/app/agentes',
    })
  }

  return recs.sort((a, b) => a.prioridad - b.prioridad)
}

export const recomendacionesPendientes = (datos, org, plan) =>
  calcularRecomendaciones(datos, org, plan).filter((r) => !datos.recomendaciones[r.id])
