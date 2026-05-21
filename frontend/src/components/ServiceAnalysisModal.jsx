/**
 * KrediZeka - Servis Analiz Modalı (İnteraktif Stepper Form)
 * ============================================================
 * Bireysel / Ticari / Ürünler sayfalarındaki bir hizmet kartına
 * tıklandığında açılan çok adımlı (stepper) analiz formu.
 *
 * Akış:
 *   Adım 1 (+ varsa Adım 2)  → Form alanları (serviceCatalog'tan dinamik)
 *   Son Adım                 → Analiz sonucu (skor + recharts grafik + AI tavsiye)
 *
 * Veri akışı:
 *   Form gönderilince → ilgili backend endpoint'ine POST
 *     - bireysel  → /api/bireysel/analyze
 *     - ticari    → /api/ticari/analyze
 *     - urunler   → /api/urunler/analyze
 *   Sonuç PostgreSQL'e kaydedilir, yanıt grafiklerle görselleştirilir.
 *
 * Özellikler:
 *   - ESC ve backdrop tıklamasıyla kapanır
 *   - Body scroll kilidi (modal açıkken arka plan kaymaz)
 *   - Karanlık tema uyumlu
 *   - Recharts ile pasta + bar grafiği
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import {
  X, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, RotateCcw,
  TrendingUp, BarChart3,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { splitFieldsIntoSteps } from '../data/serviceCatalog';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Grafik renk paleti (kurumsal: lacivert / mavi / yeşil / mor)
const CHART_COLORS = ['#1e3a8a', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

// Risk rengi → Tailwind sınıf eşlemesi
const RISK_COLOR_MAP = {
  green:  { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', ring: 'ring-emerald-500', bar: 'from-emerald-400 to-emerald-600' },
  yellow: { text: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/30',     ring: 'ring-amber-500',   bar: 'from-amber-400 to-amber-600' },
  orange: { text: 'text-orange-600 dark:text-orange-400',   bg: 'bg-orange-50 dark:bg-orange-900/30',   ring: 'ring-orange-500',  bar: 'from-orange-400 to-orange-600' },
  red:    { text: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/30',         ring: 'ring-red-500',     bar: 'from-red-400 to-red-600' },
};

export default function ServiceAnalysisModal({ service, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();

  // Form alanlarını adımlara böl (çok adımlı stepper)
  const formSteps = useMemo(
    () => (service ? splitFieldsIntoSteps(service.fields) : [[]]),
    [service]
  );
  // Toplam adım = form adımları + 1 sonuç adımı
  const totalSteps = formSteps.length + 1;
  const resultStepIndex = formSteps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ─── ESC tuşu + body scroll kilidi ─────────────────────────────────
  useEffect(() => {
    if (!service) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [service, onClose]);

  if (!service) return null;

  // ─── Input değişimi ────────────────────────────────────────────────
  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Sayı alanı: yalnızca rakam ve tek nokta
  const handleNumberInput = (fieldName) => (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    handleFieldChange(fieldName, val);
  };

  // ─── Adım doğrulaması ──────────────────────────────────────────────
  // Geçerli adımdaki tüm alanlar dolu ve pozitif mi?
  const validateCurrentStep = () => {
    const fields = formSteps[currentStep] || [];
    for (const field of fields) {
      const value = formData[field.name];
      if (value === undefined || value === '' || value === null) {
        toast.error(t('services.validation_required'));
        return false;
      }
      if (field.type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          toast.error(t('services.validation_positive'));
          return false;
        }
      }
    }
    return true;
  };

  // ─── API çağrısı ───────────────────────────────────────────────────
  const runAnalysis = async () => {
    // girdi_verileri: sayısal alanları float'a çevir, select'leri string bırak
    const girdiVerileri = {};
    for (const field of service.fields) {
      const raw = formData[field.name];
      girdiVerileri[field.name] =
        field.type === 'number' ? parseFloat(raw) : raw;
    }

    // Kategoriye göre endpoint ve gövde anahtarı belirlenir
    const endpointMap = {
      bireysel: '/api/bireysel/analyze',
      ticari:   '/api/ticari/analyze',
      urunler:  '/api/urunler/analyze',
    };
    // Backend bireysel/ticari'de "hizmet_turu", ürünlerde "urun_turu" bekler
    const typeKey = service.category === 'urunler' ? 'urun_turu' : 'hizmet_turu';

    const body = {
      tc_no: user.tc_no,
      [typeKey]: service.apiType,
      girdi_verileri: girdiVerileri,
    };

    setLoading(true);
    try {
      const res = await fetch(`${API}${endpointMap[service.category]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Analiz başarısız oldu.');

      setResult(data.result);
      setCurrentStep(resultStepIndex);
      toast.success(t('services.toast_success'));
    } catch (err) {
      const msg = err instanceof TypeError
        ? t('common.server_unreachable')
        : (err.message || t('common.unexpected_error'));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Adım navigasyonu ──────────────────────────────────────────────
  const goNext = () => {
    if (!validateCurrentStep()) return;
    // Son form adımındaysak → analiz çalıştır
    if (currentStep === formSteps.length - 1) {
      runAnalysis();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const restart = () => {
    setCurrentStep(0);
    setFormData({});
    setResult(null);
  };

  // ─── Stepper başlıkları ────────────────────────────────────────────
  const stepLabels = [];
  if (formSteps.length === 1) {
    stepLabels.push(t('services.modal_step_form'));
  } else {
    stepLabels.push(t('services.modal_step_form'));
    stepLabels.push(t('services.modal_step_form2'));
  }
  stepLabels.push(t('services.modal_step_result'));

  const ServiceIcon = service.icon;
  const isResultStep = currentStep === resultStepIndex;

  // ─── Sonuç verilerini normalize et ─────────────────────────────────
  // Bireysel/ticari → skor; ürünler → tahmin
  const score = result
    ? (result.score ?? result.sirket_saglik_skoru ?? null)
    : null;
  const riskColor = result?.risk_color || 'green';
  const colorСss = RISK_COLOR_MAP[riskColor] || RISK_COLOR_MAP.green;
  const chartData = result?.chart_data || [];
  const isPrediction = service.resultKind === 'prediction';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
    >
      {/* Karartılmış arka plan */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal gövdesi */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">

        {/* ─── ÜST BANT ─── */}
        <div className={`relative bg-gradient-to-r ${service.color} p-6 pr-16 flex-shrink-0`}>
          <button
            onClick={onClose}
            aria-label={t('services.close')}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <ServiceIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">{t(service.titleKey)}</h2>
              <p className="text-sm text-white/80">{t(service.descKey)}</p>
            </div>
          </div>
        </div>

        {/* ─── STEPPER GÖSTERGESİ ─── */}
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          {stepLabels.map((label, idx) => {
            const isActive = currentStep === idx;
            const isComplete = currentStep > idx;
            return (
              <div key={idx} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isComplete
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-primary-600 text-white scale-110 shadow-md shadow-primary-500/40'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block transition-colors ${
                    isActive ? 'text-primary-600 dark:text-primary-400'
                    : isComplete ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div className={`w-6 sm:w-10 h-0.5 mx-2 rounded transition-colors duration-300 ${
                    isComplete ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ─── İÇERİK (scroll'lu) ─── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* FORM ADIMLARI */}
          {!isResultStep && (
            <div className="space-y-5 animate-fade-in">
              {(formSteps[currentStep] || []).map((field) => {
                const FieldIcon = field.icon;
                return (
                  <div key={field.name}>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {FieldIcon && <FieldIcon className="w-4 h-4 text-primary-500" />}
                      {t(field.labelKey)}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="input-field appearance-none cursor-pointer"
                      >
                        <option value="" disabled>{t('services.select_placeholder')}</option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {t(opt.labelKey)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formData[field.name] || ''}
                        onChange={handleNumberInput(field.name)}
                        placeholder={field.placeholder}
                        className="input-field"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SONUÇ ADIMI */}
          {isResultStep && result && (
            <div className="space-y-5 animate-fade-in">

              {/* Skor göstergesi (bireysel + ticari) */}
              {!isPrediction && score !== null && (
                <div className="card-static p-6 text-center">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    {service.resultKind === 'health'
                      ? t('services.result_health_label')
                      : t('services.result_score_label')}
                  </p>
                  <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full ring-8 ${colorСss.ring}/20 ${colorСss.bg} mb-3 animate-score-count`}>
                    <span className={`text-4xl font-black ${colorСss.text}`}>
                      {Math.round(score)}
                    </span>
                  </div>
                  {result.risk_status && (
                    <p className={`text-lg font-bold ${colorСss.text}`}>{result.risk_status}</p>
                  )}
                  <div className="mt-4 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colorСss.bar} animate-progress-fill`}
                      style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tahmin göstergesi (ürünler) */}
              {isPrediction && result.tahmin !== undefined && (
                <div className="card-static p-6 text-center">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {result.tahmin_label || t('services.result_score_label')}
                  </p>
                  <p className="text-4xl font-black gradient-text">
                    ₺{Number(result.tahmin).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}

              {/* Metrik kartları */}
              {result.metrics && Object.keys(result.metrics).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(result.metrics).map(([key, val]) => (
                    <div key={key} className="card-static p-3 text-center">
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-base font-black text-slate-800 dark:text-slate-100">
                        {typeof val === 'number'
                          ? val.toLocaleString('tr-TR', { maximumFractionDigits: 1 })
                          : val}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recharts grafik — chart_data'ya göre pasta veya bar */}
              {chartData.length > 0 && (
                <div className="card-static p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {chartData.length <= 4
                      ? <BarChart3 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      : <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {t('services.chart_title')}
                    </h4>
                  </div>
                  <div className="w-full" style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartData.length > 4 ? (
                        // Çok noktalı veri (projeksiyon) → bar grafiği
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                          <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                          <YAxis tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                          <Tooltip
                            formatter={(v) => `₺${Number(v).toLocaleString('tr-TR')}`}
                            contentStyle={{
                              backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                              borderRadius: '12px',
                              border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                              color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800}>
                            {chartData.map((entry, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      ) : (
                        // Az noktalı veri → pasta grafiği
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={85}
                            paddingAngle={3}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            animationDuration={800}
                          >
                            {chartData.map((entry, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v) => `₺${Number(v).toLocaleString('tr-TR')}`}
                            contentStyle={{
                              backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                              borderRadius: '12px',
                              border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                              color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                              fontSize: '12px',
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px', color: theme === 'dark' ? '#cbd5e1' : '#334155' }}
                          />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* AI tavsiyesi */}
              {result.ai_advice && (
                <div className="card-static p-5 border-l-4 border-primary-500">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {t('services.ai_advice_title')}
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.ai_advice.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── ALT BANT: NAVİGASYON ─── */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between flex-shrink-0">
          {!isResultStep ? (
            <>
              <button
                onClick={goPrev}
                disabled={currentStep === 0}
                className="btn-secondary inline-flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> {t('services.prev')}
              </button>
              <button
                onClick={goNext}
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                    {t('services.analyzing')}
                  </>
                ) : currentStep === formSteps.length - 1 ? (
                  <><Sparkles className="w-4 h-4" /> {t('services.analyze')}</>
                ) : (
                  <>{t('services.next')} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </>
          ) : (
            <>
              <button onClick={restart} className="btn-secondary inline-flex items-center gap-2 text-sm">
                <RotateCcw className="w-4 h-4" /> {t('services.new_analysis')}
              </button>
              <button onClick={onClose} className="btn-primary inline-flex items-center gap-2 text-sm">
                <X className="w-4 h-4" /> {t('services.close')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
