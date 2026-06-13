// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // DairyBook design system (master prompt palette)
        primary: '#1B5E20', // main actions, header
        accent: '#E65100', // alerts, warnings
        sky: '#0277BD', // milk, water
        rose: '#AD1457', // breeding, female
        gold: '#F9A825', // finance, money
        grape: '#4527A0', // reports, calendar
        cream: '#FFF8F0', // background — easy in sunlight
        surface: '#FFFFFF', // card surfaces
        ink: '#1A1A1A', // primary text
        muted: '#5D4037', // secondary text
        ok: '#2E7D32', // success
        warn: '#F57F17', // warning
        danger: '#B71C1C', // danger
      },
      fontFamily: {
        urdu: ['"Noto Nastaliq Urdu"', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)',
      },
      minHeight: {
        touch: '56px',
      },
      minWidth: {
        touch: '56px',
      },
    },
  },
  plugins: [],
}
