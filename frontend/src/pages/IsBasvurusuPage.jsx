/**
 * KrediZeka - İş Başvurusu Sayfası (ATS Tarzı)
 * ===============================================
 * Kurumsal bir Aday Takip Sistemi (Applicant Tracking System) görünümünde
 * iş başvuru formu.
 *
 * URL Parametresi: ?pozisyon=<encoded_title>
 *   KariyerPage'den geldiğinde Pozisyon dropdown'u otomatik seçilir.
 *
 * Davranış:
 *   - Tüm alanlar zorunlu (CV hariç — sadece UI demo)
 *   - Form submit edildiğinde başarı toast'u gösterir
 *   - Ardından kullanıcıyı anasayfaya yönlendirir
 *   - Backend'e veri gönderilmez (frontend-only demo)
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  User,
  Mail,
  Phone,
  Link2,
  Briefcase,
  Upload,
  FileText,
  CheckCircle2,
  ChevronLeft,
  Send,
  X,
  Shield,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

// KariyerPage'deki pozisyon listesiyle senkron olmalı
const positions = [
  'Kıdemli Backend Geliştirici',
  'Frontend Geliştirici (React)',
  'Makine Öğrenmesi Mühendisi',
  'Kıdemli Veri Analisti',
  'Ürün Müdürü',
  'Açık Başvuru — Diğer',
];

// CV dosya boyutu limiti (sadece görsel doğrulama için)
const MAX_CV_SIZE_MB = 5;

export default function IsBasvurusuPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    linkedin: '',
    position: '',
    cover_letter: '',
  });
  const [cvFile, setCvFile] = useState(null); // sadece UI olarak görüntülenir
  const [submitting, setSubmitting] = useState(false);

  // URL'den gelen pozisyon parametresi varsa dropdown'u önceden doldur
  useEffect(() => {
    const positionParam = searchParams.get('pozisyon');
    if (positionParam) {
      const decoded = decodeURIComponent(positionParam);
      // Listedeki pozisyonlarla eşleşiyorsa seç, eşleşmiyorsa "Açık Başvuru"
      const match = positions.find((p) => p === decoded);
      setForm((p) => ({ ...p, position: match || 'Açık Başvuru — Diğer' }));
    }
  }, [searchParams]);

  // Sadece rakam ve maksimum 11 hane → telefon
  const handlePhoneInput = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setForm((p) => ({ ...p, phone: val }));
  };

  // Sadece harf ve boşluk → isim/soyad
  const handleNameInput = (field) => (e) => {
    const val = e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, '');
    setForm((p) => ({ ...p, [field]: val }));
  };

  // CV dosyası seçimi (sadece UI doğrulaması)
  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // PDF veya DOC kontrolü
    const validTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Lütfen PDF veya Word (.doc/.docx) formatında bir dosya seçin.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_CV_SIZE_MB * 1024 * 1024) {
      toast.error(`CV dosyası ${MAX_CV_SIZE_MB} MB'tan büyük olamaz.`);
      e.target.value = '';
      return;
    }

    setCvFile(file);
    toast.success(`CV yüklendi: ${file.name}`);
  };

  // CV'yi kaldır
  const handleCvRemove = () => {
    setCvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form gönderimi
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasyonlar
    if (form.first_name.trim().length < 2) return toast.error('Lütfen geçerli bir ad girin.');
    if (form.last_name.trim().length < 2) return toast.error('Lütfen geçerli bir soyad girin.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Lütfen geçerli bir e-posta adresi girin.');
    if (form.phone.length !== 11) return toast.error('Telefon numarası 11 hane olmalıdır.');
    if (!form.position) return toast.error('Lütfen başvurmak istediğiniz pozisyonu seçin.');
    if (form.cover_letter.trim().length < 50) return toast.error('Ön yazı en az 50 karakter olmalıdır.');

    setSubmitting(true);

    // Başvuru "gönderimi" simülasyonu (gerçek backend yok — frontend demo)
    setTimeout(() => {
      toast.success(
        `Başvurunuz başarıyla alındı, ${form.first_name}! 7 iş günü içinde dönüş yapacağız.`,
        { duration: 5000 }
      );
      setSubmitting(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-slate-50 via-white to-primary-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Geri Dön Linki */}
        <Link
          to="/kariyer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kariyer Sayfasına Dön
        </Link>

        {/* ─── BAŞLIK KARTI ─── */}
        <div className="card-static overflow-hidden mb-8 animate-fade-in-up">
          <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                  İş Başvuru Formu
                </h1>
                <p className="text-primary-100 leading-relaxed">
                  KrediZeka ekibine katılmak için aşağıdaki formu eksiksiz doldurun.
                  Tüm başvurular insan kaynakları ekibimiz tarafından <strong>7 iş günü içinde</strong>
                  {' '}değerlendirilir.
                </p>
              </div>
            </div>
          </div>

          {/* Güven Göstergeleri */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-6 bg-slate-50">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Verileriniz KVKK ile korunur</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>7 iş günü içinde dönüş</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>Şeffaf süreç</span>
            </div>
          </div>
        </div>

        {/* ─── BAŞVURU FORMU ─── */}
        <form onSubmit={handleSubmit} className="card-static p-8 md:p-10 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

          {/* Bölüm: Kişisel Bilgiler */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Kişisel Bilgiler</h2>
            <p className="text-xs text-slate-500 mb-5">Sizinle iletişim kurabilmemiz için kullanılacaktır.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Ad */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <User className="w-4 h-4 text-primary-500" />
                  Ad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.first_name}
                  onInput={handleNameInput('first_name')}
                  placeholder="Adınız"
                  className="input-field"
                  required
                  maxLength={50}
                />
              </div>

              {/* Soyad */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <User className="w-4 h-4 text-primary-500" />
                  Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onInput={handleNameInput('last_name')}
                  placeholder="Soyadınız"
                  className="input-field"
                  required
                  maxLength={50}
                />
              </div>

              {/* E-posta */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="ornek@email.com"
                  className="input-field"
                  required
                  maxLength={100}
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onInput={handlePhoneInput}
                  placeholder="05XX XXX XX XX"
                  className="input-field"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">{form.phone.length}/11 hane</p>
              </div>
            </div>
          </div>

          {/* Bölüm: Profesyonel Bilgiler */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">Profesyonel Bilgiler</h2>
            <p className="text-xs text-slate-500 mb-5">Başvurduğunuz pozisyon ve profesyonel profiliniz.</p>

            <div className="space-y-4">
              {/* LinkedIn URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Link2 className="w-4 h-4 text-primary-500" />
                  LinkedIn Profil URL'si
                  <span className="text-xs font-normal text-slate-400">(isteğe bağlı)</span>
                </label>
                <input
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/kullaniciadi"
                  className="input-field"
                  maxLength={200}
                />
              </div>

              {/* Pozisyon */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Briefcase className="w-4 h-4 text-primary-500" />
                  Başvurulan Pozisyon <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.position}
                  onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                  className="input-field appearance-none bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Pozisyon seçin...</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              {/* CV Yükleme */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  Özgeçmiş (CV)
                  <span className="text-xs font-normal text-slate-400">(PDF veya Word, max {MAX_CV_SIZE_MB} MB)</span>
                </label>

                {!cvFile ? (
                  // Yükleme alanı
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        CV dosyanızı buraya tıklayarak yükleyin
                      </p>
                      <p className="text-xs text-slate-400">
                        PDF, DOC veya DOCX formatında, en fazla {MAX_CV_SIZE_MB} MB
                      </p>
                    </div>
                  </button>
                ) : (
                  // Yüklenmiş dosya görünümü
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-900 truncate">{cvFile.name}</p>
                      <p className="text-xs text-emerald-700">
                        {(cvFile.size / 1024).toFixed(1)} KB · Yüklendi
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCvRemove}
                      className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                      aria-label="CV'yi kaldır"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleCvChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Bölüm: Ön Yazı */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">Ön Yazı</h2>
            <p className="text-xs text-slate-500 mb-5">
              Kendinizi, deneyimlerinizi ve neden bizimle çalışmak istediğinizi anlatın.
            </p>

            <textarea
              value={form.cover_letter}
              onChange={(e) => setForm((p) => ({ ...p, cover_letter: e.target.value }))}
              placeholder="Kısaca kendinizden bahsedin: hangi projelerde yer aldınız, hangi teknolojilerde deneyimlisiniz, neden KrediZeka'da çalışmak istiyorsunuz?"
              className="input-field min-h-[180px] resize-y"
              required
              maxLength={2000}
            />
            <p className="text-xs text-slate-400 mt-1">
              {form.cover_letter.length}/2000 karakter
              {form.cover_letter.length < 50 && (
                <span className="text-amber-600 ml-2">(en az 50 karakter gerekli)</span>
              )}
            </p>
          </div>

          {/* KVKK Bilgilendirmesi */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
              <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Başvurunuzu göndererek, kişisel verilerinizin KrediZeka Finansal Teknoloji A.Ş.
                tarafından işe alım süreci kapsamında işlenmesine onay verdiğinizi kabul edersiniz.
                Verileriniz KVKK kapsamında en geç 12 ay sonra silinir.
              </p>
            </div>
          </div>

          {/* Gönder Butonu */}
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Başvuruyu Tamamla
                </>
              )}
            </button>
            <Link
              to="/kariyer"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Vazgeç
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
