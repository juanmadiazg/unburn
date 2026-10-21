import { Link, useLocation } from 'react-router-dom'
import Logo from '../../components/Logo'

export default function NoEncontrada({ dentro }) {
  const { pathname } = useLocation()
  const contenido = (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="font-mono text-sm text-ink-400">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-[-0.015em] text-ink-950">Esta página no existe</h1>
      <p className="mt-2 text-sm text-ink-500">No hay nada en <span className="font-mono text-ink-700">{pathname}</span>. Puede que el enlace sea antiguo.</p>
      <Link to={dentro ? (pathname.startsWith('/bo') ? '/bo' : '/app') : '/'} className="mt-6 inline-flex h-8 items-center rounded-md border border-ink-200 px-3 text-sm font-medium text-ink-800 hover:bg-ink-50">Volver al inicio</Link>
    </div>
  )
  if (dentro) return contenido
  return <div className="min-h-screen bg-surface px-5 py-8"><Link to="/"><Logo /></Link>{contenido}</div>
}
