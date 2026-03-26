import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // o '0.0.0.0' → acepta conexiones remotas
    port: 5173,       // opcional, usa el que quieras
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080', // backend en el mismo equipo
        changeOrigin: true
      }
    }
  }
})

