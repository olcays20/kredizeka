/**
 * KrediZeka - Kariyer Sayfası
 * =============================
 * Açık iş pozisyonları, şirket avantajları ve yan hakları listeleyen
 * kurumsal kariyer tanıtım sayfası.
 */

import {
  Briefcase,
  Clock,
  TrendingUp,
  Banknote,
  Gift,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Heart,
  GraduationCap,
  Laptop,
  Coffee,
} from 'lucide-react';

// Neden KrediZeka? kartları
const reasons = [
  {
    icon: Clock,
    title: 'Esnek Çalışma',
    desc: 'Hibrit ve uzaktan çalışma modelleriyle iş-yaşam dengenizi kendiniz belirleyin.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Kariyer Gelişimi',
    desc: 'Yıllık eğitim bütçesi, konferans katılımları ve dahili mentorluk programları.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Banknote,
    title: 'Rekabetçi Maaş',
    desc: 'Sektör üzerinde maaş politikası, yıllık performans zammı ve ikramiyeler.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: Gift,
    title: 'Kapsamlı Yan Haklar',
    desc: 'Özel sağlık sigortası, yemek kartı, ulaşım desteği ve şirket hisseleri.',
    color: 'from-violet-500 to-violet-600',
  },
];

// Açık pozisyonlar
const positions = [
  {
    title: 'Kıdemli Backend Geliştirici',
    department: 'Mühendislik',
    location: 'İstanbul (Hibrit)',
    type: 'Tam Zamanlı',
    deptColor: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Frontend Geliştirici (React)',
    department: 'Mühendislik',
    location: 'Remote',
    type: 'Tam Zamanlı',
    deptColor: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Makine Öğrenmesi Mühendisi',
    department: 'Yapay Zeka',
    location: 'İstanbul / Remote',
    type: 'Tam Zamanlı',
    deptColor: 'bg-violet-100 text-violet-700',
  },
  {
    title: 'Kıdemli Veri Analisti',
    department: 'Veri',
    location: 'İstanbul (Hibrit)',
    type: 'Tam Zamanlı',
    deptColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Ürün Müdürü',
    department: 'Ürün',
    location: 'İstanbul',
    type: 'Tam Zamanlı',
    deptColor: 'bg-amber-100 text-amber-700',
  },
];

// Yan haklar
const perks = [
  { icon: Heart, label: 'Özel Sağlık Sigortası', desc: 'Siz ve aileniz için kapsamlı özel sağlık sigortası.' },
  { icon: Coffee, label: 'Yemek Kartı', desc: 'Aylık 3.000₺ yemek desteği, tüm restoranlarda geçerli.' },
  { icon: Laptop, label: 'Uzaktan Çalışma', desc: 'Haftada 3 gün uzaktan çalışma imkânı.' },
  { icon: GraduationCap, label: 'Eğitim Bütçesi', desc: 'Yıllık 15.000₺ kişisel gelişim ve eğitim bütçesi.' },
  { icon: TrendingUp, label: 'Şirket Hisseleri', desc: 'Tüm çalışanlara ESOP programı kapsamında hisse opsiyon hakkı.' },
  { icon: Gift, label: 'Doğum Günü İzni', desc: 'Doğum gününüzde tam gün izin ve sürpriz hediye.' },
];

export default function KariyerPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-teal-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 text-emerald-700 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Briefcase className="w-4 h-4" />
            Kariyer
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Kariyerinizi <span className="gradient-text">Şekillendirin</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            Finansal teknolojiyi yeniden tanımlayan KrediZeka ekibine katılın. Fintech'in geleceğini
            birlikte inşa edelim — yetenekli, tutkulu ve meraklı kişileri arıyoruz.
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Rekabetçi maaş
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Uzaktan çalışma
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Şirket hisseleri
            </span>
          </div>
        </div>
      </section>

      {/* ─── NEDEN KREDİZEKA? ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            Neden <span className="gradient-text">KrediZeka</span>?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Çalışanlarımızın mutluluğu ve gelişimi bizim için her şeyden önce gelir.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card p-6 group text-center">
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── AÇIK POZİSYONLAR ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            Açık <span className="gradient-text">Pozisyonlar</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Aşağıdaki pozisyonlardan size uygun olanı seçin ve başvurunuzu gönderin.
            Tüm başvurular 5 iş günü içinde değerlendirilir.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {positions.map(({ title, department, location, type, deptColor }) => (
            <div
              key={title}
              className="card-static p-6 rounded-2xl border border-slate-100 hover:border-primary-200 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Sol: Pozisyon Detayları */}
                <div className="flex-1">
                  {/* Departman badge */}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${deptColor}`}>
                    {department}
                  </span>
                  {/* Pozisyon adı */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  {/* Konum ve tür chip'leri */}
                  <div className="flex items-center flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {location}
                    </span>
                    <span className="text-slate-200">|</span>
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {type}
                    </span>
                  </div>
                </div>
                {/* Sağ: Başvur Butonu */}
                <div className="md:flex-shrink-0">
                  <button
                    className="btn-primary flex items-center gap-2 py-2.5 px-6 text-sm"
                    onClick={() => window.open(`mailto:kariyer@kredizeka.com?subject=${encodeURIComponent(title + ' - Başvuru')}`, '_blank')}
                  >
                    Başvur
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-400 mt-6">
          Uygun bir pozisyon bulamadınız mı?{' '}
          <a href="mailto:kariyer@kredizeka.com" className="text-primary-600 font-semibold hover:underline">
            Açık başvuru gönderin
          </a>
          {' '}— iyi bir yeteneği asla kaçırmayız.
        </p>
      </section>

      {/* ─── YAN HAKLAR ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-3xl text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">Yan Haklar ve Avantajlar</h2>
            <p className="text-primary-100 max-w-lg mx-auto">
              Çalışanlarımızın mutluluğuna yaptığımız yatırım, sunduğumuz ürünler kadar önemlidir.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 bg-white/10 rounded-2xl p-5 hover:bg-white/15 transition-colors duration-300">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">{label}</p>
                  <p className="text-sm text-primary-100 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
