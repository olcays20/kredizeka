/**
 * KrediZeka - Google ile Giriş Butonu (GoogleLoginButton.jsx)
 * ============================================================
 * "Google ile Devam Et" sosyal giriş butonu. Hem Giriş (Login) hem de
 * Kayıt (Register) sayfasında kullanıldığından, tekrarı önlemek için
 * ortak (paylaşılan) bir bileşen olarak tasarlanmıştır.
 *
 * OAuth2 — Mock (Simülasyon) Akışı:
 *   Gerçek bir OAuth2 akışında bu buton, Google'ın oturum penceresini açar
 *   ve Google'dan imzalı bir kimlik jetonu (credential) alır. Bu akademik
 *   projede gerçek Google Client ID kullanılmadığından, sahte bir jeton
 *   üretilip backend'deki '/api/auth/google-mock' uç noktasına gönderilir.
 *   Backend, kullanıcıya rastgele bir hesap açar ve oturum bilgisini döner.
 *
 * Backend ile sözleşme (API kontratı):
 *   İstek : POST /api/auth/google-mock   { "credential": "..." }
 *   Yanıt : { "success": true, "user": {...}, "token": "..." }
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Backend adresi — üretimde ortam değişkeninden, geliştirmede localhost'tan
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Google'ın resmi 4 renkli "G" logosu (inline SVG).
 * Lucide-react bir marka (brand) ikonu içermediğinden, tanınabilir
 * Google logosu doğrudan SVG olarak gömülmüştür.
 */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8
           c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039
           l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20
           s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12
           c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4
           C16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238
           C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946
           l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571
           c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24
           c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/**
 * Google ile Giriş butonu bileşeni.
 *
 * Props almaz — gerekli her şeyi (oturum açma, yönlendirme, çeviri)
 * kendi içinde hook'lar aracılığıyla yönetir. Sayfada şu şekilde kullanılır:
 *   <GoogleLoginButton />
 */
export default function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // İstek sürerken butonu devre dışı bırakmak için yükleniyor durumu
  const [loading, setLoading] = useState(false);

  /**
   * Google ile giriş akışını başlatır (mock).
   *
   *   1. Sahte bir Google kimlik jetonu (credential) üretilir.
   *   2. Backend'deki '/api/auth/google-mock' uç noktasına gönderilir.
   *   3. Dönen kullanıcı bilgisiyle oturum açılır (login).
   *   4. Kullanıcı ana sayfaya yönlendirilir.
   */
  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1) Sahte (mock) Google kimlik jetonu — gerçek akışta Google üretirdi
      const mockCredential =
        'mock-google-credential.' + Math.random().toString(36).slice(2);

      // 2) Backend'deki mock OAuth2 uç noktasına istek gönder
      const res = await fetch(`${API}/api/auth/google-mock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: mockCredential }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || t('auth.google_error'));
      }

      // 3) Oturumu kur — yanıt formatı normal giriş (/api/login) ile aynıdır
      login(data.user);

      // 4) Karşılama mesajı göster ve ana sayfaya yönlendir
      toast.success(t('auth.google_success', { name: data.user.full_name }));
      navigate('/');
    } catch (err) {
      // Sunucuya ulaşılamazsa veya başka bir hata olursa kullanıcıyı bilgilendir
      const message =
        err instanceof TypeError
          ? t('common.server_unreachable')
          : err.message || t('auth.google_error');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3
                 py-3 px-6 rounded-xl font-semibold
                 bg-white dark:bg-slate-800
                 text-slate-700 dark:text-slate-200
                 border-2 border-slate-200 dark:border-slate-600
                 transition-all duration-300
                 hover:border-slate-300 dark:hover:border-slate-500
                 hover:shadow-lg hover:-translate-y-0.5
                 active:translate-y-0
                 disabled:opacity-60 disabled:cursor-not-allowed
                 disabled:hover:translate-y-0 disabled:hover:shadow-none
                 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
    >
      {loading ? (
        // İstek sürerken dönen yükleniyor animasyonu
        <>
          <svg className="animate-spin w-5 h-5 text-slate-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {t('auth.google_connecting')}
        </>
      ) : (
        <>
          <GoogleIcon />
          {t('auth.google_continue')}
        </>
      )}
    </button>
  );
}
