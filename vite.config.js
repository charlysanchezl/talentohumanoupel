import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    // Vite 8 / Rolldown realiza code-splitting automático sin enlaces cruzados:
    // exceljs, xlsx y jspdf solo se descargan bajo demanda al pulsar Exportar.
    chunkSizeWarningLimit: 1000
  }
})
