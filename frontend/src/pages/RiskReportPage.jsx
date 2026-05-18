/**
 * KrediZeka - Risk Raporu Sayfası (Stepper + SHAP + Dark Mode)
 * ===============================================================
 * 3 adımlı (Wizard) yatay stepper formu:
 *   1. Kişisel Durum (yaş, tecrübe, kredi geçmişi, bakmakla yükümlü, birikim)
 *   2. Finansal Veriler (gelir, borç, kredi tutarı)
 *   3. Analiz Sonucu (skor, oranlar, pasta grafiği, SHAP BarChart, AI tavsiye, PDF)
 *
 * Yeni özellikler:
 *   - Recharts ile yatay SHAP "Etki Grafiği" (top 5 faktör)
 *   - Tüm bileşenler dark mode uyumlu
 *   - X-User-TC header'ı ile analiz e-posta simülasyonu tetiklenir
 *   - PDF export (html2canvas + jsPDF) tüm kartları yakalar
 */

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import {
  BarChart3, ShieldCheck, ArrowRight, ArrowLeft, Sparkles,
  DollarSign, CreditCard, Wallet, Brain, Target, Zap,
  Lock, LogIn, UserPlus, Download, PieChart as PieIcon,
  User as UserIcon, Briefcase, Award, Users, PiggyBank,
  CheckCircle2, Activity, TrendingUp, TrendingDown, RotateCcw,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Pasta grafiği renkleri (kurumsal: lacivert/mavi/yeşil)
const CHART_COLORS = {
  income: '#10b981',
  debt:   '#3b82f6',
  loan:   '#1e3a8a',
};

// SHAP grafik renkleri (light + dark uyumlu)
const SHAP_COLORS = {
  positive: '#10b981',  // emerald-500
  negative: '#ef4444',  // red-500
};

export default function RiskReportPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  // ─── STEPPER DURUMU ────────────────────────────────────────────────
  // currentStep: 0 = Step1 (kişisel), 1 = Step2 (finansal), 2 = Step3 (sonuç)
  const [currentStep, setCurrentStep] = useState(0);

  // Form alanları (iki adıma bölünmüş)
  const [form, setForm] = useState({
    // Step 1 - Kişisel
    age: '',
    employment_years: '',
    credit_history: '',
    dependents: '',
    savings_balance: '',
    // Step 2 - Finansal
    income: '',
    debt: '',
    loan_amount: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const reportRef = useRef(null);

  // ─── INPUT HANDLERS ───────────────────────────────────────────────
  const handleNumber = (field, decimalAllowed = false) => (e) => {
    let val = e.target.value;
    if (decimalAllowed) {
      val = val.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    } else {
      val = val.replace(/[^0-9]/g, '');
    }
    setForm((p) => ({ ...p, [field]: val }));
  };

  // ─── ADIM VALİDASYONU ──────────────────────────────────────────────
  const validateStep1 = () => {
    if (!form.age || form.age < 18 || form.age > 75) {
      toast.error('Geçerli bir yaş giriniz (18-75).');
      return false;
    }
    if (form.employment_years === '' || form.employment_years < 0) {
      toast.error('İş tecrübesi 0 veya pozitif olmalıdır.');
      return false;
    }
    if (form.credit_history === '' || form.credit_history < 0 || form.credit_history > 5) {
      toast.error('Kredi geçmişi 0-5 arası olmalıdır.');
      return false;
    }
    if (form.dependents === '' || form.dependents < 0) {
      toast.error('Bakmakla yükümlü sayısı negatif olamaz.');
      return false;
    }
    if (form.savings_balance === '' || form.savings_balance < 0) {
      toast.error('Birikim bakiyesi negatif olamaz.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const income = parseFloat(form.income);
    const debt = parseFloat(form.debt);
    const loan = parseFloat(form.loan_amount);
    if (!income || income <= 0) { toast.error(t('risk_report.validation_invalid_income')); return false; }
    if (isNaN(debt) || debt < 0) { toast.error(t('risk_report.validation_invalid_debt')); return false; }
    if (!loan || loan <= 0) { toast.error(t('risk_report.validation_invalid_loan')); return false; }
    return true;
  };

  // ─── ADIM GEÇİŞLERİ ────────────────────────────────────────────────
  const goNext = async () => {
    if (currentStep === 0) {
      if (!validateStep1()) return;
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!validateStep2()) return;
      await runAnalysis(); // Step 2 → 3'e geçişte API çağrısı
    }
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const restartWizard = () => {
    setCurrentStep(0);
    setResult(null);
    setForm({
      age: '', employment_years: '', credit_history: '', dependents: '', savings_balance: '',
      income: '', debt: '', loan_amount: '',
    });
  };

  // ─── API ÇAĞRISI ───────────────────────────────────────────────────
  const runAnalysis = async () => {
    if (!user) {
      toast.error(t('risk_report.validation_login_required'));
      return;
    }

    setLoading(true);
    toast.loading(t('risk_report.toast_analyzing'), { id: 'analyze-toast' });

    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Header: kullanıcı TC → backend'de admin guard ve email simulation için
          'X-User-TC': user.tc_no,
        },
        body: JSON.stringify({
          income: parseFloat(form.income),
          debt: parseFloat(form.debt),
          loan_amount: parseFloat(form.loan_amount),
          age: parseInt(form.age),
          employment_years: parseInt(form.employment_years),
          credit_history: parseInt(form.credit_history),
          dependents: parseInt(form.dependents),
          savings_balance: parseFloat(form.savings_balance),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Bir hata oluştu');

      setResult(data);
      setCurrentStep(2); // Sonuç adımına geç
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

  // ─── SKOR RENGİ ────────────────────────────────────────────────────
  const getScoreColor = (score) => {
    if (score >= 75) return { bar: 'from-emerald-400 to-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', ring: 'ring-emerald-500' };
    if (score >= 50) return { bar: 'from-amber-400 to-amber-600', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', ring: 'ring-amber-500' };
    if (score >= 25) return { bar: 'from-orange-400 to-orange-600', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', ring: 'ring-orange-500' };
    return { bar: 'from-red-400 to-red-600', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', ring: 'ring-red-500' };
  };

  // ─── PASTA + SHAP GRAFİK VERİSİ ───────────────────────────────────
  const buildChartData = () => {
    if (!result?.input_summary) return [];
    return [
      { name: t('risk_report.chart_income'), value: result.input_summary.income, color: CHART_COLORS.income },
      { name: t('risk_report.chart_debt'),   value: result.input_summary.debt,   color: CHART_COLORS.debt },
      { name: t('risk_report.chart_loan'),   value: result.input_summary.loan_amount, color: CHART_COLORS.loan },
    ].filter((d) => d.value > 0);
  };

  // SHAP verisini Recharts BarChart formatına dönüştür
  // Mutlak değere göre sıralı (top 5), dile göre label
  const buildShapData = () => {
    if (!result?.top_factors) return [];
    const labelKey = i18n.language === 'en' ? 'label_en' : 'label_tr';
    return result.top_factors.slice(0, 5).map((f) => ({
      name: f[labelKey],
      value: f.shap_value,
      absValue: f.abs_value,
      impact: f.impact,
      fill: f.impact === 'positive' ? SHAP_COLORS.positive : SHAP_COLORS.negative,
    }));
  };

  // ─── PDF İNDİRME ───────────────────────────────────────────────────
  const downloadPdf = async () => {
    if (!reportRef.current || !result) { toast.error(t('risk_report.toast_pdf_error')); return; }
    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        useCORS: true,
        logging: false,
      });
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pdfWidth - (margin * 2);
      const imageRatio = canvas.height / canvas.width;
      const imageWidth = usableWidth;
      const imageHeight = usableWidth * imageRatio;

      if (imageHeight <= pdfHeight - (margin * 2)) {
        pdf.addImage(imageData, 'JPEG', margin, margin, imageWidth, imageHeight);
      } else {
        let remainingHeight = imageHeight;
        let yPosition = margin;
        const pageContentHeight = pdfHeight - (margin * 2);
        pdf.addImage(imageData, 'JPEG', margin, yPosition, imageWidth, imageHeight);
        remainingHeight -= pageContentHeight;
        while (remainingHeight > 0) {
          pdf.addPage();
          yPosition = -(imageHeight - remainingHeight) + margin;
          pdf.addImage(imageData, 'JPEG', margin, yPosition, imageWidth, imageHeight);
          remainingHeight -= pageContentHeight;
        }
      }
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(
          `KrediZeka — ${new Date().toLocaleString('tr-TR')}  |  Sayfa ${i}/${pageCount}`,
          margin, pdfHeight - 5
        );
      }
      const today = new Date().toISOString().split('T')[0];
      pdf.save(`kredizeka-risk-raporu-${today}.pdf`);
      toast.success(t('risk_report.toast_pdf_success'));
    } catch (err) {
      console.error('PDF üretim hatası:', err);
      toast.error(t('risk_report.toast_pdf_error'));
    } finally {
      setGeneratingPdf(false);
    }
  };

  // ─── STEPPER İLERLEME GÖSTERGESİ ──────────────────────────────────
  const steps = [
    { num: 1, title: t('risk_report.step1_title'), subtitle: t('risk_report.step1_subtitle'), icon: UserIcon },
    { num: 2, title: t('risk_report.step2_title'), subtitle: t('risk_report.step2_subtitle'), icon: Wallet },
    { num: 3, title: t('risk_report.step3_title'), subtitle: t('risk_report.step3_subtitle'), icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-accent-200/30 dark:bg-accent-900/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* HERO BAŞLIK */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6 backdrop-blur-sm">
              <Brain className="w-4 h-4" /> {t('risk_report.badge')}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
              {t('risk_report.title_part1')} <span className="gradient-text">{t('risk_report.title_part2')}</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{t('risk_report.subtitle')}</p>
          </div>

          {/* ─── ZİYARETÇİ: ÜYELİK CTA ─── */}
          {!user ? (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <div className="card-static p-10 md:p-14 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-200/30 dark:bg-primary-900/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-200/30 dark:bg-accent-900/30 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/30 mb-6">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
                    {t('risk_report.members_only_title_part1')} <span className="gradient-text">{t('risk_report.members_only_title_part2')}</span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-md mx-auto">
                    {t('risk_report.members_only_desc')}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link to="/giris" className="btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                      <LogIn className="w-5 h-5" /> {t('navbar.login')}
                    </Link>
                    <Link to="/kayit" className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                      <UserPlus className="w-5 h-5" /> {t('risk_report.free_register')} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {t('risk_report.trust_encryption')}</span>
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {t('risk_report.trust_kvkk')}</span>
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {t('risk_report.trust_quick')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─── GİRİŞ YAPMIŞ KULLANICI: WIZARD ─── */
            <div className="max-w-4xl mx-auto">

              {/* ═══ STEPPER İLERLEME GÖSTERGESİ ═══ */}
              <div className="card-static p-6 mb-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, idx) => {
                    const isActive = currentStep === idx;
                    const isComplete = currentStep > idx;
                    const Icon = step.icon;
                    return (
                      <div key={step.num} className="flex items-center flex-1">
                        {/* Adım Dairesi */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                              isComplete
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                : isActive
                                  ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/40 scale-110'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                          </div>
                          <div className="mt-2 text-center hidden sm:block">
                            <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                              isActive ? 'text-primary-600 dark:text-primary-400' :
                              isComplete ? 'text-emerald-600 dark:text-emerald-400' :
                              'text-slate-400 dark:text-slate-500'
                            }`}>
                              {step.title}
                            </p>
                          </div>
                        </div>
                        {/* Bağlantı çizgisi */}
                        {idx < steps.length - 1 && (
                          <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ═══ ADIM İÇERİĞİ ═══ */}

              {/* STEP 1: Kişisel Durum */}
              {currentStep === 0 && (
                <div className="card-static p-8 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('risk_report.step1_title')}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('risk_report.step1_subtitle')}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <UserIcon className="w-4 h-4 text-primary-500" /> {t('risk_report.age_label')}
                      </label>
                      <input type="text" value={form.age} onInput={handleNumber('age')} placeholder={t('risk_report.age_placeholder')} className="input-field" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <Briefcase className="w-4 h-4 text-primary-500" /> {t('risk_report.employment_years_label')}
                      </label>
                      <input type="text" value={form.employment_years} onInput={handleNumber('employment_years')} placeholder={t('risk_report.employment_years_placeholder')} className="input-field" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <Award className="w-4 h-4 text-primary-500" /> {t('risk_report.credit_history_label')}
                      </label>
                      <input type="text" value={form.credit_history} onInput={handleNumber('credit_history')} placeholder={t('risk_report.credit_history_placeholder')} className="input-field" />
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('risk_report.credit_history_hint')}</p>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <Users className="w-4 h-4 text-primary-500" /> {t('risk_report.dependents_label')}
                      </label>
                      <input type="text" value={form.dependents} onInput={handleNumber('dependents')} placeholder={t('risk_report.dependents_placeholder')} className="input-field" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <PiggyBank className="w-4 h-4 text-primary-500" /> {t('risk_report.savings_label')}
                      </label>
                      <input type="text" value={form.savings_balance} onInput={handleNumber('savings_balance', true)} placeholder={t('risk_report.savings_placeholder')} className="input-field" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Finansal Veriler */}
              {currentStep === 1 && (
                <div className="card-static p-8 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('risk_report.step2_title')}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('risk_report.step2_subtitle')}</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <Wallet className="w-4 h-4 text-primary-500" /> {t('risk_report.income_label')}
                      </label>
                      <input type="text" value={form.income} onInput={handleNumber('income', true)} placeholder={t('risk_report.income_placeholder')} className="input-field" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <CreditCard className="w-4 h-4 text-orange-500" /> {t('risk_report.debt_label')}
                      </label>
                      <input type="text" value={form.debt} onInput={handleNumber('debt', true)} placeholder={t('risk_report.debt_placeholder')} className="input-field" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" /> {t('risk_report.loan_label')}
                      </label>
                      <input type="text" value={form.loan_amount} onInput={handleNumber('loan_amount', true)} placeholder={t('risk_report.loan_placeholder')} className="input-field" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Sonuç */}
              {currentStep === 2 && result && (() => {
                const colors = getScoreColor(result.score);
                const chartData = buildChartData();
                const shapData = buildShapData();

                return (
                  <div className="animate-fade-in-up space-y-5">
                    {/* PDF Butonu */}
                    <div className="flex justify-end">
                      <button type="button" onClick={downloadPdf} disabled={generatingPdf}
                        className="btn-secondary inline-flex items-center gap-2 text-sm disabled:opacity-60">
                        {generatingPdf ? (
                          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> {t('risk_report.downloading_pdf')}</>
                        ) : (<><Download className="w-4 h-4" /> {t('risk_report.download_pdf')}</>)}
                      </button>
                    </div>

                    {/* PDF Yakalama Alanı */}
                    <div ref={reportRef} className="space-y-5 bg-white dark:bg-slate-800 p-2 rounded-2xl">

                      {/* Skor Kartı */}
                      <div className="card-static p-8 text-center">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{t('risk_report.score_label')}</p>
                        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ring-8 ${colors.ring}/20 ${colors.bg} mb-4 animate-score-count`}>
                          <span className={`text-5xl font-black ${colors.text}`}>{result.score}</span>
                        </div>
                        <p className={`text-xl font-bold ${colors.text}`}>{result.risk_status}</p>
                        <div className="mt-6">
                          <div className="flex justify-between text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
                            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                          </div>
                          <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${colors.bar} animate-progress-fill`} style={{ width: `${result.score}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Oranlar */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="card-static p-5 text-center">
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t('risk_report.dti_label')}</p>
                          <p className={`text-2xl font-black ${result.dti > 40 ? 'text-red-600 dark:text-red-400' : result.dti > 30 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>%{result.dti}</p>
                        </div>
                        <div className="card-static p-5 text-center">
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t('risk_report.lti_label')}</p>
                          <p className={`text-2xl font-black ${result.lti > 10 ? 'text-red-600 dark:text-red-400' : result.lti > 6 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{result.lti}x</p>
                        </div>
                      </div>

                      {/* ─── SHAP "ETKİ GRAFİĞİ" (Yatay BarChart) ─── */}
                      {shapData.length > 0 && (
                        <div className="card-static p-6">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('risk_report.shap_title')}</h3>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('risk_report.shap_subtitle')}</p>

                          {/* Yatay BarChart — her bar pozitif/negatif renkli */}
                          <div className="w-full" style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                <XAxis type="number" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={130} tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                    borderRadius: '12px',
                                    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                  }}
                                  formatter={(value) => [
                                    `${value > 0 ? '+' : ''}${value.toFixed(3)}`,
                                    value > 0 ? t('risk_report.shap_positive') : t('risk_report.shap_negative')
                                  ]}
                                />
                                <Bar dataKey="value" animationDuration={800}>
                                  {shapData.map((entry, idx) => (
                                    <Cell key={`shap-${idx}`} fill={entry.fill} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Legend */}
                          <div className="flex items-center justify-center gap-6 mt-3 text-xs font-medium">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <TrendingUp className="w-3.5 h-3.5" /> {t('risk_report.shap_positive')}
                            </span>
                            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                              <TrendingDown className="w-3.5 h-3.5" /> {t('risk_report.shap_negative')}
                            </span>
                          </div>
                          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3 italic">{t('risk_report.model_info')}</p>
                        </div>
                      )}

                      {/* Pasta Grafiği */}
                      <div className="card-static p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <PieIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('risk_report.chart_title')}</h3>
                        </div>
                        <div className="w-full" style={{ height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                innerRadius={50} outerRadius={95} paddingAngle={3}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                animationDuration={800} animationBegin={100}>
                                {chartData.map((entry, idx) => (<Cell key={`pie-${idx}`} fill={entry.color} />))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`}
                                contentStyle={{
                                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                  borderRadius: '12px',
                                  border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                                  color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                  fontSize: '13px',
                                }}
                              />
                              <Legend verticalAlign="bottom" height={36} iconType="circle"
                                wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: theme === 'dark' ? '#cbd5e1' : '#334155' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* AI Tavsiye */}
                      <div className="card-static p-6 border-l-4 border-primary-500">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('risk_report.ai_advice_title')}</h3>
                        </div>
                        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {result.ai_advice.split('\n\n').map((p, i) => (<p key={i}>{p}</p>))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ═══ NAVİGASYON BUTONLARI ═══ */}
              {currentStep < 2 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentStep === 0}
                    className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" /> {t('risk_report.prev')}
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={loading}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                        {t('risk_report.submitting')}
                      </>
                    ) : currentStep === 1 ? (
                      <><Sparkles className="w-4 h-4" /> {t('risk_report.submit')} <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>{t('risk_report.next')} <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              )}

              {/* ═══ STEP 3'TE: YENİ ANALİZ BUTONU ═══ */}
              {currentStep === 2 && (
                <div className="flex justify-center mt-6">
                  <button type="button" onClick={restartWizard} className="btn-secondary inline-flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> {t('risk_report.restart')}
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </section>

      {/* ═══ ÖZELLİKLER BÖLÜMÜ ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
            {t('risk_report.why_title_part1')} <span className="gradient-text">{t('risk_report.why_title_part2')}</span>?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t('risk_report.why_subtitle')}</p>
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
