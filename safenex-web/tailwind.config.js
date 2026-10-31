/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        safenex: {
          bg: '#070D12',
          secondary: '#0B151D',
          card: '#101F29',
          elevated: '#142B35',
          border: '#24434A',
          emerald: '#00E6A0',
          mint: '#78FFD0',
          cyan: '#35DDF2',
          emergencyRed: '#FF304F',
          darkRed: '#B80F2E',
          text: '#F4FAFA',
          secondaryText: '#A2B5BF',
          muted: '#708792',
        }
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'emerald-glow': '0 0 25px rgba(0, 230, 160, 0.25)',
        'cyan-glow': '0 0 25px rgba(53, 221, 242, 0.25)',
        'red-glow': '0 0 35px rgba(255, 48, 79, 0.55)',
        'red-glow-lg': '0 0 55px rgba(255, 48, 79, 0.75)',
        'card': '0 12px 32px -8px rgba(7, 13, 18, 0.7)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}