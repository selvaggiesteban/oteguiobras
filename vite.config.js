import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      // Dev only: forward API + static assets from Vite (5173) to Apache (80).
      // Prod: Apache at oteguiobras.com serves /api and /images directly.
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/oteguiobras/api'),
      },
      '/images': {
        // Dev: serve from local XAMPP (C:\xampp\htdocs\oteguiobras\images).
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/images/, '/oteguiobras/images'),
      },
    },
  },
})
