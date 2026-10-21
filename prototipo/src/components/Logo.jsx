// Identidad oficial (public/brand). En la interfaz el logo se compone con el símbolo
// vectorial + la palabra «unburn» en Inter, para que se vea nítido a cualquier tamaño.
// El trazo usa el color de texto «navy», que en modo oscuro pasa a ser claro.

export function Simbolo({ className = 'h-4', blanco = false }) {
  return (
    <svg viewBox="0 0 84 78" className={`${className} ${blanco ? 'text-white' : 'text-navy'}`} aria-hidden="true">
      <path d="M0 0 H20 V36 A22 22 0 0 0 64 36 V22 H84 V36 A42 42 0 0 1 0 36 Z" fill="currentColor" />
      <rect x="64" y="0" width="20" height="13" fill="#FF5A1F" />
    </svg>
  )
}

export default function Logo({ tamano = 'md', blanco = false }) {
  const t = { sm: ['h-3.5', 'text-[15px]', 'gap-1.5'], md: ['h-4', 'text-[17px]', 'gap-2'], lg: ['h-6', 'text-[26px]', 'gap-2.5'] }[tamano]
  return (
    <span className={`inline-flex items-center ${t[2]}`} aria-label="unburn">
      <Simbolo className={t[0]} blanco={blanco} />
      <span className={`${t[1]} font-semibold leading-none tracking-[-0.035em] ${blanco ? 'text-white' : 'text-navy'}`}>unburn</span>
    </span>
  )
}
