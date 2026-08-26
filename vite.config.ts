import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/gym-os-frontend/',
  server: {
    port: 3000,
    host: true
  }
})
