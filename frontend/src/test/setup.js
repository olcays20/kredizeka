/**
 * KrediZeka - Vitest Test Kurulum Dosyası (setup.js)
 * =====================================================
 * Bu dosya, her test dosyası çalıştırılmadan ÖNCE bir kez yüklenir
 * (vite.config.js içindeki test.setupFiles ayarıyla bağlanmıştır).
 *
 * Görevleri:
 *   1. @testing-library/jest-dom matcher'larını global olarak ekler.
 *      Böylece testlerde 'toBeInTheDocument()', 'toHaveValue()' gibi
 *      okunabilir ve anlamlı doğrulamalar (assertion) kullanılabilir.
 *   2. Her testten sonra DOM'u temizler (testler birbirini etkilemesin).
 *   3. Tarayıcıya özgü API'leri (matchMedia gibi) test ortamında taklit eder.
 */

import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Her test bittiğinde render edilen bileşenleri DOM'dan temizle.
// Bu, bir testin diğerini "kirletmesini" (test isolation ihlali) önler.
afterEach(() => {
  cleanup();
});

// ─── Tarayıcı API Taklitleri (Mock) ──────────────────────────────────
// jsdom bazı tarayıcı API'lerini içermez. Uygulama kodu bunları
// kullandığı için (örn. ThemeContext → prefers-color-scheme),
// test ortamında basit birer taklit (mock) sağlıyoruz.

// ─── localStorage Polyfill ───────────────────────────────────────────
// jsdom, ortamına göre global 'localStorage' nesnesini güvenilir biçimde
// sağlamayabilir (opaque origin / global expose sorunları). AuthProvider
// ve ThemeContext localStorage'a bağımlı olduğundan, deterministik ve
// her testte sıfırlanabilir bir taklit (mock) kuruyoruz.
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? this.store[key]
      : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  key(index) {
    return Object.keys(this.store)[index] ?? null;
  }
  get length() {
    return Object.keys(this.store).length;
  }
}

const localStorageMock = new LocalStorageMock();

// defineProperty ile zorla tanımlanır — jsdom'un getter'ı atamayı
// engelleyebileceğinden doğrudan atama yerine bu yöntem kullanılır.
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
}

// window.matchMedia — dark mode / prefers-color-scheme algılaması için
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},      // eski API (geriye uyumluluk)
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// window.scrollTo — sayfa geçişlerinde ScrollToTop bileşeni çağırır
if (!window.scrollTo) {
  window.scrollTo = () => {};
}
