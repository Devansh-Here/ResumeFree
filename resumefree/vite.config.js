// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    proxy: {
      '/api/improve-bullet': 'http://localhost:3001',
      '/api/jd-match': 'http://localhost:3001',
      '/api/generate-cover-letter': 'http://localhost:3001',
      '/api/create-order': 'http://localhost:3001',
      '/api/verify-payment': 'http://localhost:3001',
    }
  }
})