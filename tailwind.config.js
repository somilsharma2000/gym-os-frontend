/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4f8',
          100: '#dae4f0',
          200: '#b8cce4',
          300: '#8da8d2',
          400: '#6b87c0',
          500: '#506ba8',
          600: '#3d548d',
          700: '#334575',
          800: '#2c3b62',
          900: '#1e2842',
          950: '#141c2f'
        }
      }
    }
  },
  plugins: []
}
