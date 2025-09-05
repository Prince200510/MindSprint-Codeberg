/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)'
      },
      backgroundImage: {
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))'
      }
    }
  },
  darkMode: 'class',
  plugins: []
}
