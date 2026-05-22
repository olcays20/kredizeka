/**
 * KrediZeka - İş Başvurusu Sayfası (ATS Tarzı)
 * ===============================================
 * Kurumsal bir Aday Takip Sistemi (Applicant Tracking System) görünümünde
 * iş başvuru formu. Tüm metinler i18n çeviri sisteminden okunur.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import {
  ClipboardList, User, Mail, Phone, Link2, Briefcase, Upload,
  FileText, CheckCircle2, ChevronLeft, Send, X, Shield, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_CV_SIZE_MB = 5;

export default function IsBasvurusuPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  // Pozisyon listesi çeviriden okunur — KariyerPage ile senkron
  const positionKeys = [
    'kariyer.pos_backend',
    'kariyer.pos_frontend',
    'kariyer.pos_ml',
    'kariyer.pos_data',
    'kariyer.pos_pm',
    'basvuru.position_open',
  ];
  const positions = positionKeys.map((k) => t(k));

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    linkedin: '',
    position: '',
    cover_letter: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const positionParam = searchParams.get('pozisyon');
    if (positionParam) {
      const decoded = decodeURIComponent(positionParam);
      const match = positions.find((p) => p === decoded);
      setForm((p) => ({ ...p, position: match || t('basvuru.position_open') }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePhoneInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setForm((p) => ({ ...p, phone: val }));
  };

  const handleNameInput = (field) => (e) => {
    const val = e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, '');
    setForm((p) => ({ ...p, [field]: val }));
  };

  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error(t('basvuru.cv_invalid_type'));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_CV_SIZE_MB * 1024 * 1024) {
      toast.error(t('basvuru.cv_too_large', { size: MAX_CV_SIZE_MB }));
      e.target.value = '';
      return;
    }
    setCvFile(file);
    toast.success(t('basvuru.cv_uploaded_toast', { name: file.name }));
  };

  const handleCvRemove = () => {
    setCvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.first_name.trim().length < 2) return toast.error(t('basvuru.validation_first'));
    if (form.last_name.trim().length < 2) return toast.error(t('basvuru.validation_last'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error(t('basvuru.validation_email'));
    if (form.phone.length !== 11) return toast.error(t('basvuru.validation_phone'));
    if (!form.position) return toast.error(t('basvuru.validation_position'));
    if (form.cover_letter.trim().length < 50) return toast.error(t('basvuru.validation_cover'));

    setSubmitting(true);
    setTimeout(() => {
      toast.success(t('basvuru.success_toast', { name: form.first_name }), { duration: 5000 });
      setSubmitting(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-slate-50 via-white to-primary-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/kariyer" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> {t('basvuru.back_to_career')}
        </Link>

        <div className="card-static overflow-hidden mb-8 animate-fade-in-up">
          <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                  {t('basvuru.page_title')}
                </h1>
                {/* <strong> etiketi <Trans> ile güvenli (React elemanı) olarak render edilir */}
                <p className="text-primary-100 leading-relaxed">
                  <Trans i18nKey="basvuru.page_desc" />
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-6 bg-slate-50">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{t('basvuru.trust_kvkk')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{t('basvuru.trust_response')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>{t('basvuru.trust_transparent')}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-static p-8 md:p-10 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">{t('basvuru.section_personal')}</h2>
            <p className="text-xs text-slate-500 mb-5">{t('basvuru.section_personal_desc')}</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <User className="w-4 h-4 text-primary-500" /> {t('basvuru.first_name')} <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.first_name} onInput={handleNameInput('first_name')} placeholder={t('basvuru.first_name_placeholder')} className="input-field" required maxLength={50} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <User className="w-4 h-4 text-primary-500" /> {t('basvuru.last_name')} <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.last_name} onInput={handleNameInput('last_name')} placeholder={t('basvuru.last_name_placeholder')} className="input-field" required maxLength={50} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="w-4 h-4 text-primary-500" /> {t('basvuru.email')} <span className="text-red-500">*</span>
                </label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder={t('basvuru.email_placeholder')} className="input-field" required maxLength={100} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="w-4 h-4 text-primary-500" /> {t('basvuru.phone')} <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.phone} onInput={handlePhoneInput} placeholder={t('basvuru.phone_placeholder')} className="input-field" required />
                <p className="text-xs text-slate-400 mt-1">{t('basvuru.phone_hint', { count: form.phone.length })}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">{t('basvuru.section_professional')}</h2>
            <p className="text-xs text-slate-500 mb-5">{t('basvuru.section_professional_desc')}</p>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Link2 className="w-4 h-4 text-primary-500" /> {t('basvuru.linkedin')}
                  <span className="text-xs font-normal text-slate-400">{t('basvuru.optional')}</span>
                </label>
                <input type="url" value={form.linkedin} onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/kullaniciadi" className="input-field" maxLength={200} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Briefcase className="w-4 h-4 text-primary-500" /> {t('basvuru.position')} <span className="text-red-500">*</span>
                </label>
                <select value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} className="input-field appearance-none bg-white cursor-pointer" required>
                  <option value="" disabled>{t('basvuru.position_placeholder')}</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 text-primary-500" /> {t('basvuru.cv_label')}
                  <span className="text-xs font-normal text-slate-400">{t('basvuru.cv_hint', { size: MAX_CV_SIZE_MB })}</span>
                </label>

                {!cvFile ? (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 group">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{t('basvuru.cv_upload_main')}</p>
                      <p className="text-xs text-slate-400">{t('basvuru.cv_upload_sub', { size: MAX_CV_SIZE_MB })}</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-900 truncate">{cvFile.name}</p>
                      <p className="text-xs text-emerald-700">{(cvFile.size / 1024).toFixed(1)} KB · {t('basvuru.cv_uploaded')}</p>
                    </div>
                    <button type="button" onClick={handleCvRemove} className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors" aria-label={t('basvuru.cv_remove')}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input ref={fileInputRef} type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleCvChange} className="hidden" />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">{t('basvuru.section_cover')}</h2>
            <p className="text-xs text-slate-500 mb-5">{t('basvuru.section_cover_desc')}</p>

            <textarea value={form.cover_letter} onChange={(e) => setForm((p) => ({ ...p, cover_letter: e.target.value }))}
              placeholder={t('basvuru.cover_placeholder')} className="input-field min-h-[180px] resize-y" required maxLength={2000} />
            <p className="text-xs text-slate-400 mt-1">
              {t('basvuru.cover_count', { count: form.cover_letter.length })}
              {form.cover_letter.length < 50 && (
                <span className="text-amber-600 ml-2">{t('basvuru.cover_min_warning')}</span>
              )}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
              <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">{t('basvuru.kvkk_notice')}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> {t('basvuru.submitting')}</>
              ) : (
                <><Send className="w-5 h-5" /> {t('basvuru.submit')}</>
              )}
            </button>
            <Link to="/kariyer" className="btn-secondary flex items-center justify-center gap-2">
              <X className="w-4 h-4" /> {t('basvuru.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
