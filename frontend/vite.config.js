import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // AGREGAR ESTO:
  base: '/eulertec/', 
  server: {
    proxy: {
      '/api': {
        target: 'https://senk.host/eulertec/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})