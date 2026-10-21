import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { PERSONAS, useApp } from '../../store/AppStore'
import { inicioDe } from '../../components/nav'
import Logo from '../../components/Logo'
import { Button, Field, Input } from '../../components/ui'

/** Pantalla de acceso con segundo factor (DEC-27, Amazon Cognito). En el prototipo cualquier contraseña de 6 o más caracteres y cualquier código de 6 cifras valen. */
export default function Login() {
  const { cambiarPersona } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('laura.gomez@nexoanalytics.es')
  const [clave, setClave] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [error, setError] = useState('')
  const [paso, setPaso] = useState('credenciales')
  const [codigo, setCodigo] = useState('')
  const entrar = (personaId) => {
    const p = PERSONAS.find((x) => x.id === personaId)
    cambiarPersona(p.id)
    navigate(inicioDe(p))
  }
  const enviar = (e) => {
    e.preventDefault()
    if (clave.length < 6) return setError('Escribe tu contraseña (en la demo vale cualquiera de 6 caracteres o más).')
    setError('')
    setEntrando(true)
    setTimeout(() => { setEntrando(false); setPaso('codigo') }, 600)
  }
  const verificar = (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(codigo)) return setError('Escribe los 6 dígitos de tu aplicación de autenticación.')
    setError('')
    setEntrando(true)
    setTimeout(() => entrar(email.includes('pablo') ? 'pablo' : email.includes('carlos') ? 'carlos' : 'laura'), 500)
  }
  return (
    <div className="flex min-h-screen bg-ink-50">
      <div className="m-auto w-full max-w-sm px-5 py-12">
        <Link to="/" aria-label="Inicio"><Logo /></Link>
        <h1 className="mt-8 text-xl font-semibold tracking-[-0.015em] text-ink-950">Inicia sesión</h1>
        <p className="mt-1 text-sm text-ink-500">¿No tienes cuenta? <Link to="/registro" className="font-medium text-ink-950 hover:underline">Crea una gratis</Link></p>
        {paso === 'codigo' ? (
          <form onSubmit={verificar} className="mt-6 space-y-4 rounded-lg border border-ink-200 bg-surface p-5" data-segundo-factor>
            <p className="text-sm text-ink-700">Verificación en dos pasos: introduce el código de 6 dígitos de tu aplicación de autenticación.</p>
            <Field label="Código" error={error}><Input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} className="text-center font-mono text-lg tracking-[0.5em]" /></Field>
            <Button type="submit" variant="primary" className="w-full" disabled={entrando}>{entrando ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verificando…</> : 'Verificar y entrar'}</Button>
            <button type="button" onClick={() => { setPaso('credenciales'); setCodigo(''); setError('') }} className="w-full text-center text-xs text-ink-500 hover:text-ink-900">Volver</button>
          </form>
        ) : (
        <form onSubmit={enviar} className="mt-6 space-y-4 rounded-lg border border-ink-200 bg-surface p-5">
          <Field label="Email de trabajo"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
          <Field label="Contraseña" error={error}><Input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" autoFocus /></Field>
          <Button type="submit" variant="primary" className="w-full" disabled={entrando}>{entrando ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Entrando…</> : 'Continuar'}</Button>
          <div className="relative py-1 text-center text-xs text-ink-400"><span className="relative z-10 bg-surface px-2">o</span><span className="absolute inset-x-0 top-1/2 h-px bg-ink-150" /></div>
          <Button className="w-full" onClick={() => entrar('laura')}>Continuar con SSO de la empresa</Button>
        </form>
        )}
        <div className="mt-6">
          <p className="text-xs font-medium text-ink-500">Accesos de demostración</p>
          <ul className="mt-2 divide-y divide-ink-150 rounded-lg border border-ink-200 bg-surface">
            {PERSONAS.map((p) => (
              <li key={p.id}>
                <button onClick={() => entrar(p.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-ink-50">
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm text-ink-900">{p.etiqueta}</span><span className="block truncate text-xs text-ink-500">{p.detalle}</span></span>
                  <ArrowRight className="h-3.5 w-3.5 text-ink-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
