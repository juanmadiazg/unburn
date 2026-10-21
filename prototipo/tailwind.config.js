/** @type {import('tailwindcss').Config} */
// Los colores neutros, la superficie y el azul marino son variables CSS (src/index.css),
// así el modo oscuro se resuelve cambiando las variables, sin duplicar clases.
const v = (nombre) => `rgb(var(--${nombre}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Escala compacta de producto: base de 13 px
        '2xs': ['11px', '16px'],
        xs: ['12px', '16px'],
        sm: ['13px', '20px'],
        base: ['14px', '22px'],
        lg: ['16px', '24px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '30px'],
        '3xl': ['32px', '38px'],
        '4xl': ['44px', '50px'],
      },
      colors: {
        // Identidad Unburn: azul marino #0B1526 y acento naranja #FF5A1F (solo acción principal, foco y estado activo)
        navy: { DEFAULT: v('navy'), 800: v('navy-800') },
        'on-navy': v('on-navy'),
        surface: v('surface'),
        brand: {
          50: '#FFF4EF', 100: '#FFE6DB', 200: '#FFC9B3', 300: '#FFA580', 400: '#FF7A47',
          500: '#FF5A1F', 600: '#E8460E', 700: '#C1370B', 800: '#9A2E10', 900: '#7C2911',
        },
        ink: {
          50: v('ink-50'), 100: v('ink-100'), 150: v('ink-150'), 200: v('ink-200'), 300: v('ink-300'), 400: v('ink-400'),
          500: v('ink-500'), 600: v('ink-600'), 700: v('ink-700'), 800: v('ink-800'), 900: v('ink-900'), 950: v('ink-950'),
        },
      },
      borderRadius: { DEFAULT: '6px', md: '6px', lg: '8px' },
      boxShadow: {
        xs: '0 1px 2px rgb(0 0 0 / .05)',
        pop: '0 8px 24px -6px rgb(0 0 0 / var(--sombra)), 0 0 0 1px rgb(var(--ink-200))',
      },
      keyframes: {
        'slide-in': { from: { transform: 'translateY(4px)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'drawer-in': { from: { transform: 'translateX(16px)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
        'fila-nueva': { from: { backgroundColor: 'rgb(255 90 31 / .10)' }, to: { backgroundColor: 'transparent' } },
        pulso: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
      },
      animation: {
        'slide-in': 'slide-in .14s ease-out',
        'fade-in': 'fade-in .12s ease-out',
        'drawer-in': 'drawer-in .16s ease-out',
        'fila-nueva': 'fila-nueva 1.6s ease-out',
        pulso: 'pulso 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
