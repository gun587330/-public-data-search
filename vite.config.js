import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/openapi': {
        target: 'http://211.237.50.150:7080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  }
})

