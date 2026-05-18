/**
 * KrediZeka - Hakkımızda Sayfası
 * ================================
 * Şirket tanıtımı, misyon/vizyon, istatistikler, değerler ve ekip bölümlerini
 * içeren kurumsal tanıtım sayfası.
 */

import { Link } from 'react-router-dom';
import {
  Info,
  Target,
  Eye,
  Shield,
  Lightbulb,
  Users,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Calendar,
  Award,
} from 'lucide-react';

// Şirket istatistikleri
const stats = [
  { label: 'Aktif Kullanıcı', value: '50.000+', icon: Users },
  { label: 'Analiz Hacmi', value: '₺1.2 Milyar', icon: BarChart3 },
  { label: 'Model Doğruluğu', value: '%98.5', icon: Award },
  { label: 'Kuruluş Yılı', value: '2023', icon: Calendar },
];

// Şirket değerleri
const values = [
  {
    icon: Eye,
    title: 'Şeffaflık',
    desc: 'Her analizimizde kullandığımız yöntemi ve gerekçeyi açıkça paylaşırız. Kullanıcılarımız nasıl bir sonuç aldıklarını ve neden aldıklarını her zaman anlayabilir.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Shield,
    title: 'Güvenilirlik',
    desc: 'BDDK ve KVKK düzenlemelerine tam uyum sağlarız. Verileriniz Bcrypt şifreleme ve güvenli sunucu altyapısı ile korunur; asla üçüncü taraflarla paylaşılmaz.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Lightbulb,
    title: 'Yenilikçilik',
    desc: 'Makine öğrenmesi modellerimizi sürekli güncelliyor, yeni finansal göstergeler ve algoritmalar ekleyerek tahmin doğruluğumuzu artırmayı hedefliyoruz.',
    color: 'from-violet-500 to-violet-600',
  },
];

// Kurucu ekip üyeleri (kurumsal Türk erkek isimleri)
const team = [
  {
    name: 'Cenk Yılmaz',
    title: 'CEO & Kurucu Ortak',
    initials: 'CY',
    from: 'from-primary-500',
    to: 'to-primary-700',
    bio: '15 yıllık fintech ve dijital bankacılık sektörü deneyimi. Stratejik liderlik ve yapay zekâ tabanlı finansal ürün geliştirme alanlarında uzmanlık.',
  },
  {
    name: 'Kaan Demir',
    title: 'CTO & Kurucu Ortak',
    initials: 'KD',
    from: 'from-accent-500',
    to: 'to-accent-700',
    bio: 'Bilgisayar Mühendisliği doktorası. 12 yıllık makine öğrenmesi ve büyük veri altyapısı deneyimi. KrediZeka ML pipeline mimarisinin baş tasarımcısı.',
  },
  {
    name: 'Burak Aydın',
    title: 'CPO — Ürün Yöneticisi',
    initials: 'BA',
    from: 'from-violet-500',
    to: 'to-violet-700',
    bio: 'Endüstri Mühendisliği mezunu. Kullanıcı odaklı ürün geliştirme ve veriye dayalı karar süreçleri uzmanı. 8 yıllık finansal ürün stratejisi tecrübesi.',
  },
];

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-primary-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 text-indigo-700 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Info className="w-4 h-4" />
            Kurumsal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Finansal Geleceği{' '}
            <span className="gradient-text">Şekillendiriyoruz</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            KrediZeka, yapay zeka ve makine öğrenmesi teknolojilerini kullanarak bireylerin
            finansal kararlarını daha bilinçli ve güvenli almalarına yardımcı olan bir
            finansal teknoloji şirketidir.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Risk Analizi Yap
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── MİSYON & VİZYON ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            Misyonumuz ve <span className="gradient-text">Vizyonumuz</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Finansal kararları herkes için daha erişilebilir ve şeffaf kılmak için çalışıyoruz.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Misyon */}
          <div className="card p-8 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Misyonumuz</h3>
            <p className="text-slate-600 leading-relaxed">
              Bireylerin kredi başvurusu yapmadan önce finansal profillerini nesnel bir gözle
              değerlendirebilmelerini sağlamak. Yapay zeka destekli analizlerimiz ile
              vatandaşların mali okuryazarlığını artırmak ve gereksiz kredi redlerini
              minimize etmek için çalışıyoruz.
            </p>
            <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-2 text-sm font-semibold text-primary-600">
              <Shield className="w-4 h-4" />
              Güvenilir · Şeffaf · Erişilebilir
            </div>
          </div>

          {/* Vizyon */}
          <div className="card p-8 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/25 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Vizyonumuz</h3>
            <p className="text-slate-600 leading-relaxed">
              2030 yılına kadar Türkiye'nin en güvenilen finansal yapay zeka platformu olmak.
              Her bireyin gerçek zamanlı, kişiselleştirilmiş ve tarafsız bir finansal danışmana
              erişebildiği bir dünya inşa etmek için teknolojimizi sürekli geliştiriyoruz.
            </p>
            <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-2 text-sm font-semibold text-accent-600">
              <TrendingUp className="w-4 h-4" />
              Büyüme · Liderlik · Etki
            </div>
          </div>
        </div>
      </section>

      {/* ─── İSTATİSTİKLER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Rakamlarla <span className="text-primary-400">KrediZeka</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Kısa sürede elde ettiğimiz başarılar, güvenilirliğimizin ve teknolojimizin kanıtıdır.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="group">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
                <p className="text-sm font-medium text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEĞERLERİMİZ ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            Temel <span className="gradient-text">Değerlerimiz</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Her kararımızda ve geliştirdiğimiz her özellikte bu değerler bize rehberlik eder.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card p-8 text-center group">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── EKİBİMİZ ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            Kurucu <span className="gradient-text">Ekibimiz</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Fintech, yapay zeka ve ürün geliştirme alanlarında deneyimli uzmanlardan oluşan güçlü bir ekip.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map(({ name, title, initials, from, to, bio }) => (
            <div key={name} className="card p-8 text-center group">
              {/* Avatar */}
              <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${from} ${to} flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4 group-hover:scale-105 transition-transform duration-300`}>
                <span className="text-2xl font-black text-white">{initials}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{name}</h3>
              <p className="text-sm font-medium text-primary-600 mb-3">{title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center rounded-3xl">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3">
            Kredi Uygunluğunuzu Öğrenin
          </h3>
          <p className="text-primary-100 max-w-lg mx-auto mb-6">
            Yapay zeka destekli risk analiz sistemimiz ile kredi onaylanma olasılığınızı
            saniyeler içinde hesaplayın.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-bold hover:bg-primary-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xl"
          >
            Hemen Başla
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
