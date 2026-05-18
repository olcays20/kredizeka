/**
 * KrediZeka - i18n (Çoklu Dil) Yapılandırması
 * ===============================================
 * react-i18next + i18next + LanguageDetector ile uygulamanın
 * Türkçe ve İngilizce desteğini sağlar.
 *
 * Davranış:
 *  - İlk yüklemede tarayıcı dilini otomatik algılar
 *  - Önceden seçilmiş dil varsa localStorage'dan okur
 *  - Desteklenmeyen bir dil gelirse Türkçe'ye fallback yapar
 *  - Çeviri anahtarı bulunamazsa anahtarın kendisini döndürür
 *
 * Kullanım (bileşen içinde):
 *   import { useTranslation } from 'react-i18next';
 *   const { t, i18n } = useTranslation();
 *   <h1>{t('navbar.risk_analysis')}</h1>
 *   <button onClick={() => i18n.changeLanguage('en')}>EN</button>
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import tr from './tr.json';
import en from './en.json';

// localStorage anahtarı — kullanıcının seçtiği dil burada saklanır
const LANG_STORAGE_KEY = 'kredizeka_lang';

i18n
  // Tarayıcı dilini algılayıcı eklenti (önce localStorage'a bakar, sonra navigator)
  .use(LanguageDetector)
  // React entegrasyonu
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
    },
    // Dil bulunamazsa fallback olarak Türkçe kullanılır
    fallbackLng: 'tr',
    // Desteklenen dillerin beyaz listesi (güvenlik)
    supportedLngs: ['tr', 'en'],
    // Eksik anahtar geldiğinde anahtarı text olarak göster (geliştirici dostu)
    saveMissing: false,
    interpolation: {
      // React zaten XSS'e karşı escape ediyor; i18next'in escape'ine gerek yok
      escapeValue: false,
    },
    detection: {
      // Dil algılama sırası: önce localStorage, sonra browser navigator
      order: ['localStorage', 'navigator'],
      // Kullanıcı dil seçtiğinde localStorage'a kaydet
      caches: ['localStorage'],
      lookupLocalStorage: LANG_STORAGE_KEY,
    },
  });

export default i18n;
