/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// KrediZeka - Vite + Vitest + PWA yapılandırması

export default defineConfig({
  plugins: [
    react(),

    // PWA — Service Worker + Web App Manifest üretir
    VitePWA({
      registerType: 'autoUpdate',
      // Vitest sırasında PWA üretimini kapat
      disable: process.env.VITEST === 'true',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'KrediZeka Finans',
        short_name: 'KrediZeka',
        description:
          'Yapay zeka destekli finansal risk ve kredi analizi platformu.',
        theme_color: '#1e1b4b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'tr',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],

  // Vitest test yapılandırması
  test: {
    globals: true,
    environment: 'jsdom',
    // jsdom'a geçerli URL — aksi halde localStorage erişilemez
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    setupFiles: './src/test/setup.js',
    css: true,
    exclude: ['node_modules', 'dist'],
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Büyük 3rd-party kütüphaneleri ayrı chunk'lara böl
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('victory')) {
              return 'vendor-charts';
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf';
            }
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react';
            }
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
        },
      },
    },
  },

  server: {
    port: 5173,
    strictPort: false,
  },
})
