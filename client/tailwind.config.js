/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        allstar: {
          dark: '#0a0a0d',
          card: '#141418',
          border: 'rgba(255, 170, 0, 0.25)',
          // Paleta oficial All Star Team:
          yellow: '#FFD700',       // Amarillo Vibrante
          warm: '#FFAA00',         // Amarillo Cálido
          orange: '#FF8800',       // Naranjo Enérgico
          intense: '#FF5500',      // Naranjo Intenso
          darkOrange: '#CC3300',   // Naranjo Oscuro
          gold: {
            DEFAULT: '#FFAA00',
            light: '#FFD700',
            warm: '#FFAA00',
            orange: '#FF8800',
            dark: '#CC3300',
            glow: 'rgba(255, 170, 0, 0.35)',
          },
          navy: {
            900: '#09090b',
            800: '#111114',
            700: '#18181d',
            600: '#222228',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        gold: '0 0 25px rgba(255, 170, 0, 0.3)',
        'gold-lg': '0 0 45px rgba(255, 136, 0, 0.45)',
        orange: '0 0 30px rgba(255, 85, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
