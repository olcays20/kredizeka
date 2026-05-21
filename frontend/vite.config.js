/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// =============================================================================
// KrediZeka - Vite + Vitest + PWA Konfigürasyonu (Production-Optimized)
// =============================================================================
// Performans iyileştirmeleri:
//   - manualChunks: Büyük 3rd-party kütüphaneleri ayrı dosyalara böler
//   - chunkSizeWarningLimit: 800KB altındaki chunk'lar için uyarı yok
//   - sourcemap: production'da kapalı (bundle boyutu)
//
// PWA (Progressive Web App):
//   - VitePWA eklentisi, uygulamayı telefona "indirilebilir" bir web
//     uygulamasına dönüştürür (Service Worker + Web App Manifest üretir).
//   - registerType: 'autoUpdate' → yeni sürüm yayınlandığında kullanıcının
//     uygulaması arka planda otomatik güncellenir.
//   - disable: Vitest testleri sırasında Service Worker üretimi kapatılır;
//     böylece birim testleri gereksiz yere yavaşlamaz/etkilenmez.
//
// Test yapılandırması (Vitest):
//   - environment: 'jsdom' → tarayıcı DOM'unu Node.js içinde simüle eder
//   - globals: true → describe/it/expect import gerektirmeden kullanılır
//   - setupFiles → her testten önce jest-dom matcher'ları yüklenir
// =============================================================================

export default defineConfig({
  plugins: [
    react(),

    // ─── PWA Eklentisi ───────────────────────────────────────────────
    VitePWA({
      // Yeni sürüm çıkınca kullanıcının uygulaması otomatik güncellensin
      registerType: 'autoUpdate',

      // Vitest testleri sırasında PWA üretimini devre dışı bırak
      // (process.env.VITEST, 'vitest run' çalışırken 'true' olur)
      disable: process.env.VITEST === 'true',

      // Service Worker önbelleğine alınacak ek statik dosyalar
      includeAssets: ['favicon.svg'],

      // ─── Web App Manifest ──────────────────────────────────────────
      // Telefona eklendiğinde uygulamanın adı, rengi ve ikonu buradan okunur.
      manifest: {
        name: 'KrediZeka Finans',
        short_name: 'KrediZeka',
        description:
          'Yapay zeka destekli finansal risk ve kredi analizi platformu.',
        // theme_color: Mobilde tarayıcı/uygulama çubuğunun rengi (koyu lacivert)
        theme_color: '#1e1b4b',
        // background_color: Açılış (splash) ekranının arka plan rengi
        background_color: '#ffffff',
        // standalone: Adres çubuğu olmadan, gerçek bir uygulama gibi açılır
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'tr',
        // Uygulama ikonları (kurgusal yollar — mevcut favicon.svg kullanılır).
        // SVG ölçeklenebilir olduğundan tek dosya tüm boyutları karşılar.
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

      // ─── Workbox (Service Worker) Ayarları ─────────────────────────
      workbox: {
        // Hangi dosya tipleri çevrimdışı (offline) kullanım için önbelleğe alınsın
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        // Eski Service Worker önbelleklerini otomatik temizle
        cleanupOutdatedCaches: true,
      },
    }),
  ],

  // ─── Vitest Test Yapılandırması ──────────────────────────────────────
  test: {
    globals: true,
    environment: 'jsdom',
    // jsdom'a geçerli bir URL verilir — aksi halde 'about:blank' opaque
    // origin'inde localStorage erişilemez (SecurityError / undefined).
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    setupFiles: './src/test/setup.js',
    css: true,                    // CSS importları test sırasında hata vermesin
    // node_modules ve build çıktısı test taramasından hariç tutulur
    exclude: ['node_modules', 'dist'],
  },

  build: {
    // Üretimde source map gerekmez (geliştirici aracında debug için)
    sourcemap: false,

    // Chunk uyarı eşiği — recharts+jspdf birlikte ~700KB
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Manuel chunk bölme stratejisi:
        //   - vendor-charts  → recharts (~100KB) + d3 dependency'leri
        //   - vendor-pdf     → jspdf + html2canvas (~400KB) — yalnızca PDF indirilince yüklenir
        //   - vendor-react   → React DOM + Router (~150KB)
        //   - vendor-i18n    → i18next + react-i18next (~50KB)
        //   - vendor-icons   → lucide-react (~50KB)
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

  // Dev server ayarları (sadece geliştirme)
  server: {
    port: 5173,
    strictPort: false,
  },
})
