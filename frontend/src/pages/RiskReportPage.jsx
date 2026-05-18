/**
 * KrediZeka - Risk Raporu Sayfası (Ana Sayfa)
 * =============================================
 * Kullanıcıdan gelir, borç ve kredi tutarı bilgilerini alır,
 * ML API'sine gönderir ve Findeks tarzı renkli skor gösterimi yapar.
 *
 * Erişim Kuralı:
 *   Bu araç yalnızca giriş yapmış kullanıcılara açıktır. Oturum yoksa
 *   form yerine bilgilendirici bir çağrı kartı (login/register CTA) gösterilir.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  BarChart3, ShieldCheck,
  ArrowRight, Sparkles, DollarSign, CreditCard, Wallet,
  Brain, Target, Zap, Lock, LogIn, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function RiskReportPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ income: '', debt: '', loan_amount: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sadece rakam ve tek noktaya izin veren handler
  const handleInput = (field) => (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');

    // Birden fazla nokta girilmesini engelle
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    setForm((p) => ({ ...p, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // İkinci kademe güvenlik kontrolü — UI gizlense de form post edilmesin
    if (!user) {
      toast.error('Risk analizi yapabilmek için lütfen giriş yapın.');
      return;
    }

    setResult(null);

    const income = parseFloat(form.income);
    const debt = parseFloat(form.debt);
    const loan_amount = parseFloat(form.loan_amount);

    if (!income || income <= 0) return toast.error('Geçerli bir gelir giriniz.');
    if (isNaN(debt) || debt < 0) return toast.error('Geçerli bir borç tutarı giriniz.');
    if (!loan_amount || loan_amount <= 0) return toast.error('Geçerli bir kredi tutarı giriniz.');

    setLoading(true);
    toast.loading('Analiz yapılıyor...', { id: 'analyze-toast' });
    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, debt, loan_amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Bir hata oluştu');

      setResult(data);
      toast.success('Analiz tamamlandı!', { id: 'analyze-toast' });
    } catch (err) {
      const msg = err instanceof TypeError
        ? 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
        : (err.message || 'Beklenmeyen bir hata oluştu.');
      toast.error(msg, { id: 'analyze-toast' });
    } finally {
      setLoading(false);
    }
  };

  // Skora göre renk belirleme
  const getScoreColor = (score) => {
    if (score >= 75) return { bar: 'from-emerald-400 to-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-500' };
    if (score >= 50) return { bar: 'from-amber-400 to-amber-600', text: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-500' };
    if (score >= 25) return { bar: 'from-orange-400 to-orange-600', text: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-500' };
    return { bar: 'from-red-400 to-red-600', text: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-500' };
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Bölümü */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-accent-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 text-primary-700 text-sm font-semibold mb-6 backdrop-blur-sm">
              <Brain className="w-4 h-4" />
              Yapay Zeka Destekli Analiz
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Kredi Risk <span className="gradient-text">Analizi</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Finansal verilerinizi girin, yapay zeka modelimiz kredi onaylanma olasılığınızı
              analiz etsin ve size özel tavsiyeler sunsun.
            </p>
          </div>

          {/* ─── ZİYARETÇİ İÇİN: Üyelik Çağrısı (Login/Register CTA) ─── */}
          {!user ? (
            <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="card-static p-10 md:p-14 text-center relative overflow-hidden">
                {/* Dekoratif daireler */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-200/30 rounded-full blur-3xl pointer-events-none" />

                <div className="relative">
                  {/* Kilit ikonu */}
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/30 mb-6">
                    <Lock className="w-10 h-10 text-white" />
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
                    Bu Hizmet <span className="gradient-text">Üyelere Özeldir</span>
                  </h2>
                  <p className="text-slate-500 leading-relaxed mb-8 max-w-md mx-auto">
                    Yapay zekâ destekli kredi risk analizi yapabilmek için lütfen giriş yapın veya
                    saniyeler içinde <strong className="text-primary-700">ücretsiz müşteri olun</strong>.
                    Verileriniz güvende — Bcrypt şifreleme ve KVKK uyumlu altyapı ile korunur.
                  </p>

                  {/* CTA Butonlar */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to="/giris"
                      className="btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <LogIn className="w-5 h-5" />
                      Giriş Yap
                    </Link>
                    <Link
                      to="/kayit"
                      className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <UserPlus className="w-5 h-5" />
                      Ücretsiz Kayıt Ol
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Güven göstergeleri */}
                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Bcrypt şifreleme
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      KVKK uyumlu
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      30 saniyede üyelik
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─── GİRİŞ YAPMIŞ KULLANICI: Form ve Sonuç Alanı ─── */
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Sol: Giriş Formu */}
              <div className="card-static p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Finansal Veriler</h2>
                    <p className="text-sm text-slate-500">Bilgilerinizi girerek analiz başlatın</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Aylık Gelir */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Wallet className="w-4 h-4 text-primary-500" />
                      Aylık Net Gelir (₺)
                    </label>
                    <input
                      type="text"
                      value={form.income}
                      onInput={handleInput('income')}
                      placeholder="Örn: 15000"
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Toplam Borç */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <CreditCard className="w-4 h-4 text-orange-500" />
                      Toplam Mevcut Borç (₺)
                    </label>
                    <input
                      type="text"
                      value={form.debt}
                      onInput={handleInput('debt')}
                      placeholder="Örn: 5000"
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Kredi Tutarı */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      Talep Edilen Kredi Tutarı (₺)
                    </label>
                    <input
                      type="text"
                      value={form.loan_amount}
                      onInput={handleInput('loan_amount')}
                      placeholder="Örn: 50000"
                      className="input-field"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                        Analiz Yapılıyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Risk Analizi Yap
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Sağ: Sonuç */}
              <div className="space-y-6">
                {!result && !loading && (
                  <div className="card-static p-10 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-5">
                      <BarChart3 className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Sonuç Bekleniyor</h3>
                    <p className="text-sm text-slate-500">Finansal bilgilerinizi girerek yapay zeka destekli risk analizinizi başlatın.</p>
                  </div>
                )}

                {result && (() => {
                  const colors = getScoreColor(result.score);
                  return (
                    <div className="space-y-5 animate-fade-in-up">
                      {/* Skor Kartı */}
                      <div className="card-static p-8 text-center">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Kredi Onaylanma Skoru</p>
                        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ring-8 ${colors.ring}/20 ${colors.bg} mb-4 animate-score-count`}>
                          <span className={`text-5xl font-black ${colors.text}`}>{result.score}</span>
                        </div>
                        <p className={`text-xl font-bold ${colors.text}`}>{result.risk_status}</p>
                        {/* İlerleme Çubuğu */}
                        <div className="mt-6">
                          <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                          </div>
                          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${colors.bar} animate-progress-fill`}
                              style={{ width: `${result.score}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Finansal Oranlar */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="card-static p-5 text-center">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Borç/Gelir Oranı</p>
                          <p className={`text-2xl font-black ${result.dti > 40 ? 'text-red-600' : result.dti > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>%{result.dti}</p>
                        </div>
                        <div className="card-static p-5 text-center">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Kredi/Gelir Oranı</p>
                          <p className={`text-2xl font-black ${result.lti > 10 ? 'text-red-600' : result.lti > 6 ? 'text-amber-600' : 'text-emerald-600'}`}>{result.lti}x</p>
                        </div>
                      </div>

                      {/* YZ Tavsiye Kartı */}
                      <div className="card-static p-6 border-l-4 border-primary-500">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-primary-600" />
                          <h3 className="text-lg font-bold text-slate-900">Yapay Zeka Tavsiyesi</h3>
                        </div>
                        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                          {result.ai_advice.split('\n\n').map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Özellikler Bölümü */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Neden <span className="gradient-text">KrediZeka</span>?</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Gelişmiş yapay zeka teknolojimiz ile finansal kararlarınızda yanınızdayız.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Brain, title: 'ML Destekli Analiz', desc: 'Random Forest algoritması ile eğitilmiş modelimiz, kredi onaylanma olasılığınızı yüksek doğrulukla tahmin eder.', color: 'from-primary-500 to-primary-600' },
            { icon: ShieldCheck, title: 'Güvenli Altyapı', desc: 'Verileriniz Bcrypt şifreleme ile korunur. KVKK uyumlu altyapımız ile güvenliğiniz ön plandadır.', color: 'from-emerald-500 to-emerald-600' },
            { icon: Zap, title: 'Anlık Sonuç', desc: 'Saniyeler içinde detaylı risk analizi ve kişiselleştirilmiş finansal tavsiyeler alın.', color: 'from-amber-500 to-amber-600' },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="card p-8 text-center group">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
