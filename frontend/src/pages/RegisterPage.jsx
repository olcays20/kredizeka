/**
 * KrediZeka - Kayıt Ol Sayfası
 * ==============================
 * Yeni kullanıcı kaydı formu. Regex ile canlı karakter engelleme validasyonu içerir.
 * Ad Soyad: sadece harf, T.C. No: sadece 11 hane rakam, Telefon: sadece 11 hane rakam.
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, CreditCard, Phone, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', tc_no: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  // --- CANLI KARAKTER ENGELLEME VALİDASYONLARI ---

  // Ad Soyad: Sadece harf ve boşluk (Türkçe karakterler dahil)
  // Regex: [^a-zA-ZçÇğĞıİöÖşŞüÜ\s] → bunlar dışındaki her karakteri siler
  const handleNameInput = (e) => {
    const val = e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, '');
    setForm((p) => ({ ...p, full_name: val }));
  };

  // T.C. Kimlik No: Sadece rakam, maksimum 11 hane
  // Regex: [^0-9] → rakam olmayan her karakteri siler
  // slice(0, 11) → 11 haneden fazlasını keser
  const handleTcInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setForm((p) => ({ ...p, tc_no: val }));
  };

  // Telefon: Sadece rakam, maksimum 11 hane
  const handlePhoneInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setForm((p) => ({ ...p, phone: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.full_name.trim().length < 2) return toast.error('Ad Soyad en az 2 karakter olmalıdır.');
    if (form.tc_no.length !== 11) return toast.error('T.C. Kimlik No 11 hane olmalıdır.');
    if (form.tc_no.startsWith('0')) return toast.error('T.C. Kimlik No 0 ile başlayamaz.');
    if (form.phone.length !== 11) return toast.error('Telefon numarası 11 hane olmalıdır.');
    if (form.password.length < 6) return toast.error('Parola en az 6 karakter olmalıdır.');

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
      toast.error(err.message);
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
          {/* Başlık */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Hesap Oluşturun</h1>
            <p className="text-sm text-slate-500 mt-1">KrediZeka'ya katılın, finansal gücünüzü keşfedin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <User className="w-4 h-4 text-primary-500" /> Ad Soyad
              </label>
              <input type="text" value={form.full_name} onInput={handleNameInput} placeholder="Adınız Soyadınız" className="input-field" required />
              <p className="text-xs text-slate-400 mt-1">Sadece harf ve boşluk girebilirsiniz</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <CreditCard className="w-4 h-4 text-primary-500" /> T.C. Kimlik No
              </label>
              <input type="text" value={form.tc_no} onInput={handleTcInput} placeholder="11 haneli T.C. Kimlik No" className="input-field" required />
              <p className="text-xs text-slate-400 mt-1">{form.tc_no.length}/11 hane</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Phone className="w-4 h-4 text-primary-500" /> Cep Telefonu
              </label>
              <input type="text" value={form.phone} onInput={handlePhoneInput} placeholder="05XX XXX XX XX" className="input-field" required />
              <p className="text-xs text-slate-400 mt-1">{form.phone.length}/11 hane</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Lock className="w-4 h-4 text-primary-500" /> Parola
              </label>
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="En az 6 karakter" className="input-field" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Kayıt Yapılıyor...</>
              ) : (
                <>Kayıt Ol <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Zaten hesabınız var mı?{' '}
            <Link to="/giris" className="text-primary-600 font-semibold hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
