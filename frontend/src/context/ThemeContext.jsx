/**
 * KrediZeka - Tema Bağlamı (Dark/Light Mode)
 * ============================================
 * Sistem genelinde tema durumunu yönetir.
 *
 * Davranış:
 *  - İlk yükleme: localStorage > sistem tercihi (prefers-color-scheme) > 'light'
 *  - Tema değiştiğinde <html> elementine 'dark' sınıfı eklenir/çıkarılır
 *  - Seçim localStorage'a kaydedilir (cihaz başına kalıcı)
 *
 * Kullanım:
 *   import { useTheme } from '../hooks/useTheme';
 *   const { theme, toggleTheme } = useTheme();
 *   <button onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
 */

import { createContext, useEffect, useState, useCallback } from 'react';

export const ThemeContext = createContext(null);

const STORAGE_KEY = 'kredizeka_theme';

/**
 * İlk tema değerini akıllıca belirler:
 *  1. localStorage'daki seçim (varsa)
 *  2. İşletim sistemi tercihi
 *  3. Varsayılan 'light'
 */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // localStorage erişilemez (private mode vs.)
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Tema değiştiğinde <html> sınıfını güncelle
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Sessiz başarısızlık
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setLight = useCallback(() => setTheme('light'), []);
  const setDark = useCallback(() => setTheme('dark'), []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLight, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
