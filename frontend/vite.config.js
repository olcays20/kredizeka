/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// =============================================================================
// KrediZeka - Vite + Vitest Konfigürasyonu (Production-Optimized)
// =============================================================================
// Performans iyileştirmeleri:
//   - manualChunks: Büyük 3rd-party kütüphaneleri ayrı dosyalara böler
//   - chunkSizeWarningLimit: 800KB altındaki chunk'lar için uyarı yok
//   - sourcemap: production'da kapalı (bundle boyutu)
//
// Test yapılandırması (Vitest):
//   - environment: 'jsdom' → tarayıcı DOM'unu Node.js içinde simüle eder
//   - globals: true → describe/it/expect import gerektirmeden kullanılır
//   - setupFiles → her testten önce jest-dom matcher'ları yüklenir
// =============================================================================

export default defineConfig({
  plugins: [react()],

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
