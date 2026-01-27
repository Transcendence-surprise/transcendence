import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Frontend uses server block only in local npm run dev
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    },
    '/socket.io': {
      target: 'http://localhost:3003',
      ws: true,
      changeOrigin: true
    },
  },
  },
})
