import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages build sets VITE_BASE=/gym-os-frontend/ in CI; Vercel builds at root
  base: process.env.VITE_BASE ?? '/',
  server: {
    port: 3000,
    host: true
  }
})
