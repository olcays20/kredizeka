/**
 * KrediZeka - Basın Odası Sayfası
 * ==================================
 * Basın bültenleri (öne çıkan haberler), medya kit ve basın iletişim
 * bilgilerini içeren kurumsal basın odası sayfası.
 *
 * Haber kaynağı: src/data/newsData.js (tek kaynak prensibi - single source of truth).
 * "Devamını Oku" tıklanan haberi NewsModal bileşeniyle modal olarak gösterir.
 * "Tüm Haberler" linki /haberler sayfasına yönlendirir.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  Calendar,
  ChevronRight,
  Download,
  Image,
  BookOpen,
  Mail,
  Phone,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { news } from '../data/newsData';
import NewsModal from '../components/NewsModal';

// Basın Odası sayfasında ilk 4 haberi göster (en yeniler)
const featuredNews = news.slice(0, 4);

// Medya kit indirimleri
const mediaKit = [
  {
    icon: Download,
    title: 'Logo Paketi',
    desc: 'SVG, PNG ve AI formatlarında tüm logo varyantları (renkli, beyaz, siyah)',
    size: '4.2 MB',
  },
  {
    icon: Image,
    title: 'Basın Fotoğrafları',
    desc: 'Ürün ekran görüntüleri, ekip fotoğrafları ve ofis görselleri (yüksek çözünürlük)',
    size: '38.7 MB',
  },
  {
    icon: BookOpen,
    title: 'Marka Rehberi',
    desc: 'Renk paleti, tipografi, logo kullanım kuralları ve yasaklanan kullanımlar',
    size: '2.1 MB',
  },
];

export default function BasinOdasiPage() {
  // Aktif modal'da gösterilen haber (null → modal kapalı)
  const [selectedNews, setSelectedNews] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-16">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-indigo-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Newspaper className="w-4 h-4" />
            Basın Odası
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Basın <span className="gradient-text">Odası</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            KrediZeka hakkındaki son haberler, basın bültenleri, medya kaynakları ve
            basın iletişim bilgilerine bu sayfadan ulaşabilirsiniz.
          </p>
        </div>
      </section>

      {/* ─── SON HABERLER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-1">
              Son <span className="gradient-text">Haberler</span>
            </h2>
            <p className="text-slate-500 text-sm">En güncel basın bültenlerimiz ve haberlerimiz</p>
          </div>
          <Link
            to="/haberler"
            className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors group"
          >
            Tümünü Gör
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {featuredNews.map((item) => (
            <article key={item.id} className="card p-8 group flex flex-col">
              {/* Üst: tarih + tag */}
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.tagColor}`}>
                  {item.tag}
                </span>
              </div>
              {/* Başlık */}
              <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-primary-700 transition-colors duration-300">
                {item.title}
              </h3>
              {/* Özet */}
              <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5">
                {item.summary}
              </p>
              {/* Devamını Oku */}
              <button
                type="button"
                onClick={() => setSelectedNews(item)}
                className="self-start flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors duration-300 group/btn"
              >
                Devamını Oku
                <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </button>
            </article>
          ))}
        </div>

        {/* Mobile: Tümünü Gör butonu altta */}
        <div className="mt-10 text-center">
          <Link
            to="/haberler"
            className="btn-secondary inline-flex items-center gap-2"
          >
            Tüm Haberleri Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── MEDYA KİT ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            Medya <span className="gradient-text">Kit</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            KrediZeka logolarını, görselleri ve marka kılavuzunu aşağıdan indirebilirsiniz.
            Ticari kullanımlar için lütfen basın departmanımızla iletişime geçin.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {mediaKit.map(({ icon: Icon, title, desc, size }) => (
            <div key={title} className="card p-8 group text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-2">{desc}</p>
              <p className="text-xs text-slate-400 mb-5">Dosya boyutu: {size}</p>
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2 text-sm py-2.5 px-5"
              >
                <Download className="w-4 h-4" />
                İndir
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BASIN İLETİŞİM ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl text-white text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Basın İletişim</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            Röportaj talepleri, etkinlik daveti ve basın bültenlerimiz için
            basın ekibimize doğrudan ulaşabilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <a
              href="mailto:basin@kredizeka.com"
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors duration-300 px-6 py-3.5 rounded-xl"
            >
              <Mail className="w-5 h-5 text-primary-400" />
              <span className="font-semibold">basin@kredizeka.com</span>
            </a>
            <a
              href="tel:+908501234567"
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors duration-300 px-6 py-3.5 rounded-xl"
            >
              <Phone className="w-5 h-5 text-primary-400" />
              <span className="font-semibold">+90 850 123 45 67</span>
            </a>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            İş günleri içinde 4 saat içinde yanıt garantisi
          </div>
        </div>
      </section>

      {/* Haber Detay Modalı */}
      <NewsModal item={selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  );
}
