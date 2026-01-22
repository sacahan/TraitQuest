import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-charts': ['chart.js', 'react-chartjs-2'],
            'vendor-auth': ['@react-oauth/google'],
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
    server: {
      port: parseInt(env.FRONTEND_PORT || env.PORT || '3000'),
    },
  };
})
