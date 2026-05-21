/**
 * KrediZeka - Şifremi Unuttum Sayfası (ForgotPasswordPage.jsx)
 * =============================================================
 * Şifre sıfırlama akışının BİRİNCİ adımı.
 *
 * Kullanıcı e-posta adresini girer; backend (/api/forgot-password) bu adrese
 * — kayıtlıysa — 1 saat geçerli bir sıfırlama bağlantısı gönderir.
 *
 * Güvenlik notu:
 *   Backend, e-posta kayıtlı olsa da olmasa da AYNI yanıtı döndürür. Bu yüzden
 *   bu sayfa da her durumda aynı "e-postanızı kontrol edin" ekranını gösterir —
 *   böylece hangi e-postaların kayıtlı olduğu dışarıya sızdırılmaz.
 *
 * Tüm metinler i18n çeviri sisteminden okunur.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// E-posta format doğrulaması için Regex (backend ile aynı mantık)
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  // İstek başarıyla gönderildiğinde 'true' olur → başarı ekranı gösterilir
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // İstemci tarafı doğrulama: geçerli e-posta formatı
    if (!EMAIL_REGEX.test(email.trim())) {
      return toast.error(t('forgot_password.validation_email'));
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t('common.unexpected_error'));

      // Backend her durumda başarı döner → başarı ekranına geç
      setSent(true);
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
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-accent-200/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-lg mx-4 animate-fade-in-up">
        <div className="card-static p-10">

          {sent ? (
            /* ═══════════ BAŞARI EKRANI ═══════════ */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{t('forgot_password.success_title')}</h1>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                {t('forgot_password.success_message')}
              </p>
              <Link
                to="/giris"
                className="mt-8 inline-flex items-center justify-center gap-2 text-primary-600 font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> {t('forgot_password.back_to_login')}
              </Link>
            </div>
          ) : (
            /* ═══════════ FORM EKRANI ═══════════ */
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900">{t('forgot_password.title')}</h1>
                <p className="text-sm text-slate-500 mt-1">{t('forgot_password.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Mail className="w-4 h-4 text-primary-500" /> {t('forgot_password.email_label')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('forgot_password.email_placeholder')}
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? (
                    <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> {t('forgot_password.submitting')}</>
                  ) : (
                    <>{t('forgot_password.submit')} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                <Link to="/giris" className="inline-flex items-center gap-1 text-primary-600 font-semibold hover:underline">
                  <ArrowLeft className="w-4 h-4" /> {t('forgot_password.back_to_login')}
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
