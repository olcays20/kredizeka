/**
 * E-posta Doğrulama sayfası — kullanıcı kayıt e-postasındaki linke
 * tıkladığında açılır. URL'deki ?token=... değerini backend'e gönderip
 * hesabın e-postasını doğrular.
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, ArrowRight, MailCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function EmailVerificationPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  // 'verifying' | 'success' | 'error'
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('email_verification.missing_token'));
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/api/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || t('common.unexpected_error'));
        setStatus('success');
        setMessage(data.message);
      } catch (err) {
        setStatus('error');
        setMessage(
          err instanceof TypeError
            ? t('common.server_unreachable')
            : (err.message || t('common.unexpected_error'))
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-accent-200/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-lg mx-4 animate-fade-in-up">
        <div className="card-static p-10 text-center">

          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
                <MailCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{t('email_verification.verifying_title')}</h1>
              <svg className="animate-spin w-8 h-8 mx-auto text-primary-500 mt-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{t('email_verification.success_title')}</h1>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">{message}</p>
              <Link to="/giris" className="btn-primary mt-8 inline-flex items-center justify-center gap-2">
                {t('email_verification.go_login')} <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{t('email_verification.error_title')}</h1>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">{message}</p>
              <Link to="/giris" className="mt-8 inline-flex items-center justify-center gap-2 text-primary-600 font-semibold hover:underline">
                {t('email_verification.go_login')} <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
