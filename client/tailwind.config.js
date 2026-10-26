/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        allstar: {
          dark: '#080d1a',
          card: '#0f172a',
          border: 'rgba(212, 175, 55, 0.25)',
          gold: {
            DEFAULT: '#d4af37',
            light: '#f7e7a9',
            dark: '#997300',
            glow: 'rgba(212, 175, 55, 0.35)',
          },
          navy: {
            900: '#060b17',
            800: '#0c1529',
            700: '#131e3a',
            600: '#1b2a52',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        gold: '0 0 25px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 0 45px rgba(212, 175, 55, 0.4)',
      },
    },
  },
  plugins: [],
};
