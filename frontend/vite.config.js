import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/products': 'http://localhost:8001',
      '/visualizations': 'http://localhost:8001',
    },
  },
})