import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL ?? 'http://localhost:8000'

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      proxy: {
        // All /api/* requests are forwarded to the Django backend.
        // The browser never sees a CORS preflight — Vite handles it.
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          // Strip /api prefix if Django routes don't include it.
          // Comment out if Django is mounted under /api/.
          // rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
  }
})