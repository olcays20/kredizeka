/**
 * KrediZeka - Kayıt Ol Sayfası
 * ==============================
 * Yeni kullanıcı kaydı formu. Regex ile canlı karakter engelleme validasyonu içerir.
 * Tüm metinler i18n çeviri sisteminden okunur.
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, User, CreditCard, Phone, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import GoogleLoginButton from '../components/GoogleLoginButton';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ full_name: '', tc_no: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleNameInput = (e) => {
    const val = e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, '');
    setForm((p) => ({ ...p, full_name: val }));
  };

  const handleTcInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setForm((p) => ({ ...p, tc_no: val }));
  };

  const handlePhoneInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setForm((p) => ({ ...p, phone: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.full_name.trim().length < 2) return toast.error(t('register.validation_name'));
    if (form.tc_no.length !== 11) return toast.error(t('register.validation_tc_length'));
    if (form.tc_no.startsWith('0')) return toast.error(t('register.validation_tc_zero'));
    if (form.phone.length !== 11) return toast.error(t('register.validation_phone'));
    if (form.password.length < 6) return toast.error(t('register.validation_password'));

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Kayıt başarısız.');
      toast.success(data.message);
      setTimeout(() => navigate('/giris'), 2000);
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t('register.title')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <User className="w-4 h-4 text-primary-500" /> {t('register.name_label')}
              </label>
              <input type="text" value={form.full_name} onInput={handleNameInput} placeholder={t('register.name_placeholder')} className="input-field" required />
              <p className="text-xs text-slate-400 mt-1">{t('register.name_hint')}</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <CreditCard className="w-4 h-4 text-primary-500" /> {t('register.tc_label')}
              </label>
              <input type="text" value={form.tc_no} onInput={handleTcInput} placeholder={t('register.tc_placeholder')} className="input-field" required />
              <p className="text-xs text-slate-400 mt-1">{t('login.tc_hint', { count: form.tc_no.length })}</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Phone className="w-4 h-4 text-primary-500" /> {t('register.phone_label')}
              </label>
              <input type="text" value={form.phone} onInput={handlePhoneInput} placeholder={t('register.phone_placeholder')} className="input-field" required />
              <p className="text-xs text-slate-400 mt-1">{t('login.tc_hint', { count: form.phone.length })}</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Lock className="w-4 h-4 text-primary-500" /> {t('register.password_label')}
              </label>
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder={t('register.password_placeholder')} className="input-field" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> {t('register.submitting')}</>
              ) : (
                <>{t('register.submit')} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">{t('auth.divider_or')}</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google ile sosyal giriş (OAuth2 — mock) */}
          <GoogleLoginButton />

          <p className="text-center text-sm text-slate-500 mt-6">
            {t('register.have_account')}{' '}
            <Link to="/giris" className="text-primary-600 font-semibold hover:underline">{t('register.login_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
