/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          900: '#0b0d10',
          800: '#13161b',
          700: '#1a1e25',
          600: '#242932',
        },
        ink: {
          100: '#f4f1e8',
          200: '#cdc7b6',
          300: '#9a9382',
          400: '#6f6a5d',
        },
        gold: {
          400: '#f6cf6b',
          500: '#e6b84a',
          600: '#c79a2b',
          700: '#9a751c',
        },
        silver: {
          300: '#dadfe5',
          400: '#a9b0b8',
          500: '#7a8089',
        },
        blood: {
          400: '#ef5350',
          500: '#d4302b',
          600: '#a91d1a',
          700: '#7a1311',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(230,184,74,.35), 0 8px 24px -8px rgba(230,184,74,.25)',
        blood: '0 0 0 1px rgba(212,48,43,.35), 0 8px 24px -8px rgba(212,48,43,.25)',
      },
    },
  },
  plugins: [],
}
