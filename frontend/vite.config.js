import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // DELETE it if everything works
    // Allow requests proxied from docker Compose service names
    // allowedHosts: ['frontend', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://backend:3000', // backend for docker network, localhost for local
        changeOrigin: true,
      },
      '/game': {                // <-- add this
        target: 'http://backend:3000', // backend for docker network, localhost for local
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
