import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/oteguiobras2/api'),
      },
      '/images': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/images/, '/oteguiobras2/images'),
      },
    },
  },
})
