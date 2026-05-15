/**
 * KrediZeka - Giriş Yap Sayfası
 * ================================
 * T.C. Kimlik No ve Parola ile kullanıcı girişi.
 * Başarılı girişte kullanıcı bilgilerini localStorage'a kaydeder.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, CreditCard, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ tc_no: '', password: '' });
  const [loading, setLoading] = useState(false);

  // T.C. No: Sadece rakam, maks 11 hane
  const handleTcInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setForm((p) => ({ ...p, tc_no: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.tc_no.length !== 11) return toast.error('T.C. Kimlik No 11 hane olmalıdır.');
    if (form.password.length < 6) return toast.error('Parola en az 6 karakter olmalıdır.');

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Giriş başarısız.');

      // Context'e ve localStorage'a kaydet
      login(data.user);
      toast.success(`Hoş geldiniz, ${data.user.full_name}!`);
      navigate('/');
    } catch (err) {
      const msg = err instanceof TypeError
        ? 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
        : (err.message || 'Beklenmeyen bir hata oluştu.');
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Giriş Yapın</h1>
            <p className="text-sm text-slate-500 mt-1">Hesabınıza erişin ve analizlerinize devam edin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <CreditCard className="w-4 h-4 text-primary-500" /> T.C. Kimlik No
              </label>
              <input type="text" value={form.tc_no} onInput={handleTcInput} placeholder="11 haneli T.C. Kimlik No" className="input-field" required />
              <p className="text-xs text-slate-400 mt-1">{form.tc_no.length}/11 hane</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Lock className="w-4 h-4 text-primary-500" /> Parola
              </label>
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Parolanızı girin" className="input-field" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Giriş Yapılıyor...</>
              ) : (
                <>Giriş Yap <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">veya</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Henüz hesabınız yok mu?{' '}
            <Link to="/kayit" className="text-primary-600 font-semibold hover:underline">Kayıt Olun</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
