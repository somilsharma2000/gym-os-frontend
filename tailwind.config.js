/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef3fc',
          100: '#d9e4f7',
          200: '#b3c9ef',
          300: '#80a3e0',
          400: '#4d7dd0',
          500: '#2659c4',
          600: '#1d47a8',
          700: '#173a8a',
          800: '#122c68',
          900: '#0d1f47',
          950: '#08132e'
        }
      }
    }
  },
  plugins: []
}
