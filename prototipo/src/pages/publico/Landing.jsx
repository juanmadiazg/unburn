import { Link } from 'react-router-dom'
import { ArrowRight, Check, GitBranch, KeyRound, Lock, Network, Repeat2, ShieldCheck, Activity, Wallet } from 'lucide-react'
import { useApp } from '../../store/AppStore'
import Logo from '../../components/Logo'
import { numero } from '../../lib/format'

const FUNCIONES = [
  { icon: Wallet, titulo: 'Presupuestos que se cumplen', texto: 'Límites diarios y mensuales por empresa y por clave. Antes de cada petición se aparta su coste máximo y al terminar se cobra lo real: las peticiones simultáneas nunca superan el límite.' },
  { icon: Repeat2, titulo: 'Bucles detenidos y explicados', texto: 'Detecta cuando dos agentes se pasan lo mismo una y otra vez. Avisa o corta, señala el paso que lo provocó y calcula cuánto costó y cuánto se evitó.' },
  { icon: ShieldCheck, titulo: 'Escudo de herramientas', texto: 'Cada agente solo ve las herramientas que tiene permitidas, aunque una inyección de instrucciones engañe al modelo. Y te avisa si un agente puede llegar a datos prohibidos a través de otro.' },
  { icon: Activity, titulo: 'Sistema inmunológico', texto: 'Ante un pico anómalo responde por grados: avisa, frena, cambia a un modelo más barato o bloquea. Solo sobre la parte afectada; el resto sigue funcionando.' },
  { icon: Network, titulo: 'El porqué de cada decisión', texto: 'Grafo de contexto de cada tarea y registro de auditoría encadenado y sellado. Exportable en cualquier momento, sin el texto de las peticiones.' },
  { icon: KeyRound, titulo: 'Claves virtuales', texto: 'Tu clave real se queda cifrada en Unburn. Cada equipo, agente o entorno usa la suya, y se revoca o rota en menos de un minuto sin tocar las demás.' },
]

const PASOS = [
  ['Comprueba', 'Clave, agente, modelo, consumo, herramientas y bucles. Con reglas y tablas, sin un modelo de IA en medio.'],
  ['Reserva', 'Aparta el coste máximo en todos los presupuestos afectados a la vez. Si no cabe, responde 402 sin llamar al proveedor.'],
  ['Reenvía y revisa', 'Llama a OpenAI o Anthropic con tu clave real y bloquea la respuesta si pide una herramienta no permitida.'],
  ['Liquida y registra', 'Cobra solo lo que costó, libera el resto y deja el motivo de la decisión en el registro de auditoría.'],
]

const PREGUNTAS = [
  ['¿Unburn guarda mis prompts?', 'No. Solo guarda metadatos: quién hizo cada petición, cuándo, cuánto costó y qué se decidió. Todo se almacena en la Unión Europea (Irlanda).'],
  ['¿Qué peticiones cuentan para la cuota?', 'Solo las de generación que Unburn reenvía al proveedor, aunque fallen o se bloquee su respuesta. Las que Unburn rechaza antes de reenviarlas no cuentan, así que un atacante no puede agotarte la cuota.'],
  ['¿Cuánto retraso añade?', 'El objetivo es menos de 50 ms en el 95 % de las peticiones, sin contar lo que tarda el proveedor, y un 99,9 % de disponibilidad.'],
  ['¿Qué pasa si Unburn falla?', 'Por defecto protege tu presupuesto y tus datos: rechaza las peticiones (503). Cada clave puede configurarse para dejarlas pasar sin control.'],
  ['¿Y el gasto en IA?', 'Lo sigue cobrando tu proveedor. Unburn solo cobra su suscripción y te muestra el gasto que ha evitado, siempre como un rango con su hipótesis.'],
]

export default function Landing() {
  const { datos } = useApp()
  return (
    <div className="min-h-screen bg-surface text-ink-800">
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-5">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-ink-600 md:flex">
            <a href="#producto" className="hover:text-ink-950">Producto</a>
            <a href="#como-funciona" className="hover:text-ink-950">Cómo funciona</a>
            <a href="#precios" className="hover:text-ink-950">Precios</a>
            <a href="#preguntas" className="hover:text-ink-950">Preguntas</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="h-8 rounded-md px-3 text-sm leading-8 text-ink-700 hover:bg-ink-100">Iniciar sesión</Link>
            <Link to="/registro" className="h-8 rounded-md bg-brand-500 px-3 text-sm font-medium leading-8 text-white hover:bg-brand-600">Empezar gratis</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-20">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-3 py-1 text-xs text-ink-600"><Lock className="h-3 w-3" /> AI Gateway con estado · datos en la UE</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-[52px] sm:leading-[1.05]">Controla el gasto y los permisos de tus agentes de IA.</h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-600">Unburn se coloca entre tus agentes y OpenAI o Anthropic. Corta el gasto en tiempo real, detiene los bucles entre agentes y decide qué herramientas puede usar cada uno. En tu código cambian dos líneas.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/registro" className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600">Crear cuenta gratis <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/login" className="inline-flex h-10 items-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-800 hover:bg-ink-50">Ver la demo del panel</Link>
          </div>
          <p className="mt-4 text-xs text-ink-500">Plan Gratis con 10.000 peticiones al mes. Sin tarjeta. Alta en menos de 15 minutos.</p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-5">
          <div className="overflow-hidden rounded-lg border border-ink-200 lg:col-span-3">
            <div className="flex items-center gap-2 border-b border-ink-150 bg-ink-50 px-4 py-2 text-xs text-ink-500"><GitBranch className="h-3.5 w-3.5" /> agente.py</div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed text-ink-800">{`client = OpenAI(
`}<span className="block bg-red-500/10 text-red-700 dark:text-red-400">{`-   api_key=os.environ["OPENAI_API_KEY"],`}</span><span className="block bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">{`+   base_url="https://gateway.unburn.eu/v1",
+   api_key=os.environ["UNBURN_KEY"],          # ub_live_…
+   default_headers={"X-Unburn-Session": task_id},`}</span>{`)`}</pre>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 lg:col-span-2">
            {[['< 50 ms', 'de retraso añadido (p95)'], ['99,9 %', 'de disponibilidad objetivo'], ['0', 'prompts guardados'], ['UE', 'residencia de los datos']].map(([v, t]) => (
              <div key={t} className="bg-surface p-5"><p className="text-2xl font-semibold tracking-[-0.02em] text-ink-950">{v}</p><p className="mt-1 text-xs text-ink-500">{t}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="producto" className="border-t border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-ink-950">Control del gasto y seguridad de los agentes, en el mismo producto.</h2>
          <p className="mt-3 max-w-2xl text-ink-600">Las claves virtuales y los presupuestos son la base. Lo que nos diferencia es lo que pasa cuando trabajan varios agentes a la vez.</p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
            {FUNCIONES.map((f) => (
              <div key={f.titulo} className="bg-surface p-6">
                <f.icon className="h-5 w-5 text-ink-500" strokeWidth={1.75} />
                <h3 className="mt-4 text-sm font-semibold text-ink-950">{f.titulo}</h3>
                <p className="mt-1.5 text-sm text-ink-600">{f.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink-950">Qué pasa con cada petición</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {PASOS.map(([t, d], i) => (
            <li key={t} className="border-t border-ink-950 pt-4">
              <p className="font-mono text-xs text-ink-400">0{i + 1}</p>
              <h3 className="mt-2 text-sm font-semibold text-ink-950">{t}</h3>
              <p className="mt-1.5 text-sm text-ink-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="precios" className="border-t border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink-950">Precios</h2>
          <p className="mt-3 max-w-2xl text-ink-600">Pagas por las peticiones que Unburn reenvía a tu proveedor. Las que Unburn rechaza no cuentan. El gasto en IA lo sigues pagando a tu proveedor.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {datos.planes.map((p) => (
              <div key={p.id} className={`flex flex-col rounded-lg border bg-surface p-6 ${p.id === 'pro' ? 'border-ink-950' : 'border-ink-200'}`}>
                <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-ink-950">{p.nombre}</h3>{p.id === 'pro' && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">El más elegido</span>}</div>
                <p className="mt-1 text-xs text-ink-500">{p.pensadoPara}</p>
                <p className="mt-5 text-3xl font-semibold tracking-[-0.02em] text-ink-950">{p.precioMensual === 0 ? '0 €' : p.precioMensual ? `${p.precioMensual} €` : 'A medida'}<span className="text-sm font-normal text-ink-500">{p.precioMensual != null ? ' / mes' : ''}</span></p>
                <p className="text-xs text-ink-500">{p.peticionesIncluidas ? `${numero(p.peticionesIncluidas)} peticiones al mes` : 'Contrato con un comercial'}</p>
                <ul className="mt-6 flex-1 space-y-2">{p.funciones.map((f) => <li key={f} className="flex gap-2 text-sm text-ink-700"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />{f}</li>)}</ul>
                <p className="mt-5 text-xs text-ink-500">{p.alAgotarCuota}</p>
                <Link to={p.id === 'enterprise' ? '/login' : '/registro'} className={`mt-4 inline-flex h-9 items-center justify-center rounded-md text-sm font-medium ${p.id === 'pro' ? 'bg-navy text-on-navy hover:bg-navy-800' : 'border border-ink-200 text-ink-800 hover:bg-ink-50'}`}>{p.id === 'enterprise' ? 'Hablar con Ventas' : p.id === 'pro' ? 'Empezar con Pro' : 'Crear cuenta gratis'}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preguntas" className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink-950">Preguntas frecuentes</h2>
        <div className="mt-8 divide-y divide-ink-200 border-y border-ink-200">
          {PREGUNTAS.map(([p, r]) => (
            <details key={p} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink-950">{p}<span className="text-ink-400 transition-transform group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm text-ink-600">{r}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-5 py-8 text-xs text-ink-500">
          <Logo tamano="sm" />
          <span>Datos en la UE · RGPD · registros útiles para el Reglamento Europeo de IA y DORA</span>
          <span className="ml-auto">Prototipo académico · Universidad de Málaga · 2026/2027</span>
        </div>
      </footer>
    </div>
  )
}
