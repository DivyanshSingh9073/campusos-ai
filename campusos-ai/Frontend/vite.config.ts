import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy so frontend calls like /api/auth/login reach the backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Proxy every /api/* request to the backend — avoids CORS entirely
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

