import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'app-icon.png'],
        manifest: {
          name: 'TraitQuest - 靈魂試煉',
          short_name: 'TraitQuest',
          description: '心理學驅動的黑暗奇幻 RPG，將枯燥的心理測評轉化為具有靈魂深度的覺醒之旅。',
          theme_color: '#102216',
          background_color: '#102216',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'maskable-icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
        }
      })
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
