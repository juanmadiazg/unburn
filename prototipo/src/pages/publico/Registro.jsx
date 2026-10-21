import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import Logo from '../../components/Logo'
import { Button, Checkbox, Field, Input } from '../../components/ui'

/** Registro de autoservicio: lleva al alta guiada (BP-03), sin pasar por un comercial (OG-08) */
export default function Registro() {
  const navigate = useNavigate()
  const [f, setF] = useState({ nombre: '', email: '', password: '', terminos: false })
  const valido = f.nombre.trim() && /.+@.+\..+/.test(f.email) && f.password.length >= 10 && f.terminos
  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-2">
      <div className="flex flex-col px-6 py-10 sm:px-12">
        <Link to="/" aria-label="Inicio"><Logo /></Link>
        <div className="my-auto w-full max-w-sm py-10">
          <h1 className="text-xl font-semibold tracking-[-0.015em] text-ink-950">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-ink-500">¿Ya tienes una? <Link to="/login" className="font-medium text-ink-950 hover:underline">Inicia sesión</Link></p>
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (valido) navigate('/alta', { state: { nombre: f.nombre, email: f.email } }) }}>
            <Field label="Nombre y apellidos"><Input autoFocus value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
            <Field label="Email de trabajo"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Contraseña" hint="Mínimo 10 caracteres"><Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
            <Checkbox checked={f.terminos} onChange={(v) => setF({ ...f, terminos: v })} label="Acepto las condiciones del servicio y la política de privacidad" />
            <Button type="submit" variant="brand" className="w-full" disabled={!valido}>Crear cuenta y configurar</Button>
          </form>
        </div>
      </div>
      <div className="hidden border-l border-ink-200 bg-ink-50 px-12 py-10 lg:flex lg:flex-col lg:justify-center">
        <p className="text-sm font-semibold text-ink-950">En menos de 15 minutos</p>
        <ul className="mt-4 space-y-3 text-sm text-ink-700">
          {['Registras tu organización y aceptas el contrato de tratamiento de datos', 'Guardas la clave real de tu proveedor (se cifra)', 'Creas tu primera clave virtual', 'Cambias la dirección y la clave en tu código', 'Ves tu primera petición en el panel'].map((t, i) => (
            <li key={t} className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink-300 text-2xs text-ink-500">{i + 1}</span>{t}</li>
          ))}
        </ul>
        <p className="mt-8 flex items-center gap-2 text-xs text-ink-500"><Check className="h-3.5 w-3.5" /> Plan Gratis: 10.000 peticiones al mes, sin tarjeta</p>
      </div>
    </div>
  )
}
