/**
 * KrediZeka - Risk Raporu Sayfası (Ana Sayfa)
 * =============================================
 * Kullanıcıdan gelir, borç ve kredi tutarı bilgilerini alır,
 * ML API'sine gönderir ve Findeks tarzı renkli skor gösterimi yapar.
 *
 * Bu sürümde eklenenler:
 *   1. Çoklu dil desteği (react-i18next)
 *   2. Recharts ile finansal dağılım pasta grafiği (PieChart)
 *   3. html2canvas + jsPDF ile sonuç kartının PDF olarak indirilmesi
 *
 * Erişim Kuralı:
 *   Bu araç yalnızca giriş yapmış kullanıcılara açıktır. Oturum yoksa
 *   form yerine bilgilendirici bir çağrı kartı (login/register CTA) gösterilir.
 */

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import {
  BarChart3, ShieldCheck,
  ArrowRight, Sparkles, DollarSign, CreditCard, Wallet,
  Brain, Target, Zap, Lock, LogIn, UserPlus, Download, PieChart as PieIcon
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Pasta Grafiği Renk Paleti (kurumsal: lacivert, mavi, yeşil) ───────────
// Bu renkler Tailwind primary/accent paletiyle uyumlu seçildi
const CHART_COLORS = {
  income: '#10b981',  // emerald-500  → Gelir (yeşil = pozitif)
  debt:   '#3b82f6',  // blue-500     → Borç (mavi)
  loan:   '#1e3a8a',  // blue-900     → Kredi (lacivert)
};

export default function RiskReportPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [form, setForm] = useState({ income: '', debt: '', loan_amount: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  // PDF üretimi sırasında butonun "yükleniyor" durumu
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // PDF'e dönüştürülecek DOM elementinin referansı
  // html2canvas bu DOM'u canvas'a çekecek
  const reportRef = useRef(null);

  // Sadece rakam ve tek noktaya izin veren handler
  const handleInput = (field) => (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    setForm((p) => ({ ...p, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // İkinci kademe güvenlik kontrolü
    if (!user) {
      toast.error(t('risk_report.validation_login_required'));
      return;
    }

    setResult(null);

    const income = parseFloat(form.income);
    const debt = parseFloat(form.debt);
    const loan_amount = parseFloat(form.loan_amount);

    if (!income || income <= 0) return toast.error(t('risk_report.validation_invalid_income'));
    if (isNaN(debt) || debt < 0) return toast.error(t('risk_report.validation_invalid_debt'));
    if (!loan_amount || loan_amount <= 0) return toast.error(t('risk_report.validation_invalid_loan'));

    setLoading(true);
    toast.loading(t('risk_report.toast_analyzing'), { id: 'analyze-toast' });
    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, debt, loan_amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Bir hata oluştu');

      setResult(data);
      toast.success(t('risk_report.toast_done'), { id: 'analyze-toast' });
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

  // ─── PASTA GRAFİĞİ İÇİN VERİ DÖNÜŞÜMÜ ──────────────────────────────────
  // result.input_summary backend'den geldiği için onu kullanıyoruz
  // Bu, Recharts'in beklediği [{ name, value, color }] formatına çevrilir
  const buildChartData = () => {
    if (!result?.input_summary) return [];
    return [
      { name: t('risk_report.chart_income'), value: result.input_summary.income, color: CHART_COLORS.income },
      { name: t('risk_report.chart_debt'),   value: result.input_summary.debt,   color: CHART_COLORS.debt   },
      { name: t('risk_report.chart_loan'),   value: result.input_summary.loan_amount, color: CHART_COLORS.loan },
    ].filter((d) => d.value > 0); // 0 olan dilimleri çizmeye gerek yok
  };

  // ─── PDF İNDİRME FONKSİYONU ────────────────────────────────────────────
  // İşleyiş:
  //   1. html2canvas, reportRef DOM elementini yüksek çözünürlüklü bir
  //      canvas'a çevirir (scale: 2 → retina kalitesi)
  //   2. canvas, JPEG formatında base64 data URL'ye dönüştürülür
  //   3. jsPDF ile A4 boyutunda yeni bir PDF oluşturulur
  //   4. Görüntü, sayfa kenarlarına saygılı şekilde PDF'e yerleştirilir
  //   5. Çıktı 'kredizeka-risk-raporu-YYYY-MM-DD.pdf' olarak indirilir
  const downloadPdf = async () => {
    if (!reportRef.current || !result) {
      toast.error(t('risk_report.toast_pdf_error'));
      return;
    }

    setGeneratingPdf(true);
    try {
      // html2canvas: DOM'u görsele dönüştür
      // scale: 2 → 2x çözünürlük, ekrandaki kaliteyi koruyarak büyütür
      // backgroundColor: PDF'de saydam yerine beyaz arka plan
      // useCORS: dış kaynaklı görseller (varsa) için CORS desteği
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      // Canvas'ı JPEG'e çevir (PNG'ye göre ~5x küçük; yine de kaliteli)
      const imageData = canvas.toDataURL('image/jpeg', 0.95);

      // A4 boyutunda dikey (portrait) PDF oluştur
      // A4: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Sayfa boyutları ve kenar boşlukları
      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297
      const margin = 10;
      const usableWidth = pdfWidth - (margin * 2);

      // Görüntü en/boy oranını koru → orantılı yükseklik hesapla
      const imageRatio = canvas.height / canvas.width;
      const imageWidth = usableWidth;
      const imageHeight = usableWidth * imageRatio;

      // Eğer görsel tek sayfaya sığıyorsa direkt ekle
      if (imageHeight <= pdfHeight - (margin * 2)) {
        pdf.addImage(imageData, 'JPEG', margin, margin, imageWidth, imageHeight);
      } else {
        // Çok uzunsa: birden fazla sayfaya böl
        // İlk sayfayı ekle, geri kalan kısımları sayfa sayfa böler
        let remainingHeight = imageHeight;
        let yPosition = margin;
        const pageContentHeight = pdfHeight - (margin * 2);

        // İlk sayfa
        pdf.addImage(imageData, 'JPEG', margin, yPosition, imageWidth, imageHeight);
        remainingHeight -= pageContentHeight;

        // Sonraki sayfalar
        while (remainingHeight > 0) {
          pdf.addPage();
          yPosition = -(imageHeight - remainingHeight) + margin;
          pdf.addImage(imageData, 'JPEG', margin, yPosition, imageWidth, imageHeight);
          remainingHeight -= pageContentHeight;
        }
      }

      // Alt bilgi: PDF üretim zamanı + KrediZeka watermark
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        const generatedAt = new Date().toLocaleString('tr-TR');
        pdf.text(
          `KrediZeka — ${generatedAt}  |  Sayfa ${i}/${pageCount}`,
          margin,
          pdfHeight - 5
        );
      }

      // Dosya adı: kredizeka-risk-raporu-YYYY-MM-DD.pdf
      const today = new Date().toISOString().split('T')[0];
      const fileName = `kredizeka-risk-raporu-${today}.pdf`;

      pdf.save(fileName);
      toast.success(t('risk_report.toast_pdf_success'));
    } catch (err) {
      console.error('PDF üretim hatası:', err);
      toast.error(t('risk_report.toast_pdf_error'));
    } finally {
      setGeneratingPdf(false);
    }
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
              {t('risk_report.badge')}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {t('risk_report.title_part1')} <span className="gradient-text">{t('risk_report.title_part2')}</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              {t('risk_report.subtitle')}
            </p>
          </div>

          {/* ─── ZİYARETÇİ İÇİN: Üyelik Çağrısı (Login/Register CTA) ─── */}
          {!user ? (
            <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="card-static p-10 md:p-14 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-200/30 rounded-full blur-3xl pointer-events-none" />

                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/30 mb-6">
                    <Lock className="w-10 h-10 text-white" />
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
                    {t('risk_report.members_only_title_part1')} <span className="gradient-text">{t('risk_report.members_only_title_part2')}</span>
                  </h2>
                  <p className="text-slate-500 leading-relaxed mb-8 max-w-md mx-auto">
                    {t('risk_report.members_only_desc')}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link to="/giris" className="btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                      <LogIn className="w-5 h-5" />
                      {t('navbar.login')}
                    </Link>
                    <Link to="/kayit" className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                      <UserPlus className="w-5 h-5" />
                      {t('risk_report.free_register')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {t('risk_report.trust_encryption')}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {t('risk_report.trust_kvkk')}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {t('risk_report.trust_quick')}
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
                    <h2 className="text-xl font-bold text-slate-900">{t('risk_report.form_title')}</h2>
                    <p className="text-sm text-slate-500">{t('risk_report.form_subtitle')}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Wallet className="w-4 h-4 text-primary-500" />
                      {t('risk_report.income_label')}
                    </label>
                    <input
                      type="text"
                      value={form.income}
                      onInput={handleInput('income')}
                      placeholder={t('risk_report.income_placeholder')}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <CreditCard className="w-4 h-4 text-orange-500" />
                      {t('risk_report.debt_label')}
                    </label>
                    <input
                      type="text"
                      value={form.debt}
                      onInput={handleInput('debt')}
                      placeholder={t('risk_report.debt_placeholder')}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      {t('risk_report.loan_label')}
                    </label>
                    <input
                      type="text"
                      value={form.loan_amount}
                      onInput={handleInput('loan_amount')}
                      placeholder={t('risk_report.loan_placeholder')}
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
                        {t('risk_report.submitting')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        {t('risk_report.submit')}
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
                    <h3 className="text-lg font-bold text-slate-700 mb-2">{t('risk_report.result_waiting_title')}</h3>
                    <p className="text-sm text-slate-500">{t('risk_report.result_waiting_desc')}</p>
                  </div>
                )}

                {result && (() => {
                  const colors = getScoreColor(result.score);
                  const chartData = buildChartData();
                  return (
                    <div className="space-y-5 animate-fade-in-up">
                      {/* ─── PDF İNDİRME BUTONU ─── */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={downloadPdf}
                          disabled={generatingPdf}
                          className="btn-secondary inline-flex items-center gap-2 text-sm disabled:opacity-60"
                          title={t('risk_report.download_pdf')}
                        >
                          {generatingPdf ? (
                            <>
                              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                              {t('risk_report.downloading_pdf')}
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              {t('risk_report.download_pdf')}
                            </>
                          )}
                        </button>
                      </div>

                      {/* ─── PDF'e DAHİL EDİLECEK ALAN (reportRef ile) ─── */}
                      <div ref={reportRef} className="space-y-5 bg-white p-2 rounded-2xl">

                        {/* Skor Kartı */}
                        <div className="card-static p-8 text-center">
                          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('risk_report.score_label')}</p>
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
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('risk_report.dti_label')}</p>
                            <p className={`text-2xl font-black ${result.dti > 40 ? 'text-red-600' : result.dti > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>%{result.dti}</p>
                          </div>
                          <div className="card-static p-5 text-center">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('risk_report.lti_label')}</p>
                            <p className={`text-2xl font-black ${result.lti > 10 ? 'text-red-600' : result.lti > 6 ? 'text-amber-600' : 'text-emerald-600'}`}>{result.lti}x</p>
                          </div>
                        </div>

                        {/* ─── PASTA GRAFİĞİ (Recharts) ─── */}
                        <div className="card-static p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <PieIcon className="w-5 h-5 text-primary-600" />
                            <h3 className="text-lg font-bold text-slate-900">{t('risk_report.chart_title')}</h3>
                          </div>
                          {/* ResponsiveContainer: parent boyutuna otomatik adapte olur
                              height: sabit, mobil/desktop'ta tutarlı kalır */}
                          <div className="w-full" style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={95}
                                  paddingAngle={3}
                                  // Dilim üzerinde değeri etiket olarak göster
                                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                  // Animasyon süresi (ms) — Recharts default 1500
                                  animationDuration={800}
                                  animationBegin={100}
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                {/* Tooltip: dilim üzerine gelince tutar gösterir */}
                                <Tooltip
                                  formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`}
                                  contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    fontSize: '13px',
                                  }}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  height={36}
                                  iconType="circle"
                                  wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* YZ Tavsiye Kartı */}
                        <div className="card-static p-6 border-l-4 border-primary-500">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-primary-600" />
                            <h3 className="text-lg font-bold text-slate-900">{t('risk_report.ai_advice_title')}</h3>
                          </div>
                          <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                            {result.ai_advice.split('\n\n').map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
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
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            {t('risk_report.why_title_part1')} <span className="gradient-text">{t('risk_report.why_title_part2')}</span>?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{t('risk_report.why_subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Brain, title: t('risk_report.feature_ml_title'), desc: t('risk_report.feature_ml_desc'), color: 'from-primary-500 to-primary-600' },
            { icon: ShieldCheck, title: t('risk_report.feature_security_title'), desc: t('risk_report.feature_security_desc'), color: 'from-emerald-500 to-emerald-600' },
            { icon: Zap, title: t('risk_report.feature_speed_title'), desc: t('risk_report.feature_speed_desc'), color: 'from-amber-500 to-amber-600' },
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
