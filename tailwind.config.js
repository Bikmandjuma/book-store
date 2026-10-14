/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: { 50: '#FFFDF8', 100: '#FFFAF0', 200: '#F7F1E1' },
        sand: { 100: '#F3F0E4', 200: '#EBE7D5', 300: '#DDD7BF' },
        ink: { DEFAULT: '#24211D', 700: '#3D3830', 500: '#6B645A', 400: '#8A8378' },
        gold: { DEFAULT: '#B27C3A', 100: '#F4E6CE', 600: '#9A6A2F', 700: '#7E5524' },
        charcoal: { DEFAULT: '#1E1C19', 800: '#2A2723' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 32px -16px rgba(70, 45, 10, 0.28)',
        cover: '0 18px 28px -14px rgba(40, 25, 5, 0.5)',
        lift: '0 24px 44px -20px rgba(60, 40, 10, 0.4)',
      },
      keyframes: {
        toastIn: { from: { opacity: 0, transform: 'translateY(10px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        sheetUp: { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'none' } },
        drawerIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
      },
      animation: {
        toastIn: 'toastIn .25s ease-out both',
        fadeIn: 'fadeIn .2s ease-out both',
        sheetUp: 'sheetUp .28s cubic-bezier(.2,.8,.2,1) both',
        drawerIn: 'drawerIn .3s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [],
}
