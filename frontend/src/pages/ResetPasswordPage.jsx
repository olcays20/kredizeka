/**
 * KrediZeka - Yeni Şifre Belirleme Sayfası (ResetPasswordPage.jsx)
 * =================================================================
 * Şifre sıfırlama akışının İKİNCİ adımı.
 *
 * Kullanıcı, e-postasındaki sıfırlama bağlantısına tıklayarak bu sayfaya gelir.
 * Bağlantı, URL'de bir 'token' sorgu parametresi taşır:
 *   /sifre-sifirla?token=XXXXXXXX
 *
 * Kullanıcı yeni şifresini (iki kez, doğrulama için) girer; backend
 * (/api/reset-password) jetonu doğrular ve şifreyi günceller.
 *
 * Tüm metinler i18n çeviri sisteminden okunur.
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, ShieldCheck, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // URL'deki ?token=... değerini oku — sıfırlama jetonu buradadır
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // İstemci tarafı doğrulamalar
    if (form.password.length < 6) {
      return toast.error(t('reset_password.validation_length'));
    }
    if (form.password !== form.confirm) {
      return toast.error(t('reset_password.validation_match'));
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t('common.unexpected_error'));

      // Başarılı → kullanıcıyı bilgilendir ve giriş sayfasına yönlendir
      toast.success(t('reset_password.success_toast'));
      setTimeout(() => navigate('/giris'), 1800);
    } catch (err) {
      const msg = err instanceof TypeError
        ? t('common.server_unreachable')
        : (err.message || t('common.unexpected_error'));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-60 h-60 bg-accent-200/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-lg mx-4 animate-fade-in-up">
        <div className="card-static p-10">

          {!token ? (
            /* ═══════════ GEÇERSİZ / EKSİK TOKEN EKRANI ═══════════ */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{t('reset_password.invalid_title')}</h1>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                {t('reset_password.missing_token')}
              </p>
              <Link
                to="/sifremi-unuttum"
                className="btn-primary mt-8 inline-flex items-center justify-center gap-2"
              >
                {t('reset_password.request_new')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* ═══════════ YENİ ŞİFRE FORMU ═══════════ */
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900">{t('reset_password.title')}</h1>
                <p className="text-sm text-slate-500 mt-1">{t('reset_password.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Lock className="w-4 h-4 text-primary-500" /> {t('reset_password.password_label')}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder={t('reset_password.password_placeholder')}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Lock className="w-4 h-4 text-primary-500" /> {t('reset_password.confirm_label')}
                  </label>
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder={t('reset_password.confirm_placeholder')}
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? (
                    <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> {t('reset_password.submitting')}</>
                  ) : (
                    <>{t('reset_password.submit')} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                <Link to="/giris" className="inline-flex items-center gap-1 text-primary-600 font-semibold hover:underline">
                  <ArrowLeft className="w-4 h-4" /> {t('reset_password.back_to_login')}
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
