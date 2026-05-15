/**
 * KrediZeka - Footer (Alt Bilgi) Bileşeni
 * ==========================================
 * Kurumsal görünüm sağlayan, linkler ve bilgi içeren footer bileşeni.
 * Gradient arka plan ve cam efekti ile modern bir tasarıma sahiptir.
 */

import { Link } from 'react-router-dom';
import {
  Shield,
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
  Share2,
  Heart,
  ChevronRight
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 text-white overflow-hidden">
      {/* Dekoratif arka plan dairesi */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Üst Kısım: Linkler ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16 border-b border-white/10">
          
          {/* Marka & Açıklama */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight">
                  Kredi<span className="text-primary-400">Zeka</span>
                </h3>
                <p className="text-[10px] font-medium tracking-widest uppercase text-slate-400">
                  Finansal Asistan
                </p>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Yapay zeka destekli finansal risk analizi ile kredi kararlarınızda
              güvenilir bir rehber. Verileriniz güvende, kararlarınız bilinçli.
            </p>
            {/* Sosyal Medya İkonları */}
            <div className="flex items-center gap-3">
              {[Globe, MessageCircle, Share2, Heart].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Hızlı Erişim */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-slate-300 mb-5">
              Hızlı Erişim
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Risk Analizi', path: '/' },
                { label: 'Bireysel Bankacılık', path: '/bireysel' },
                { label: 'Ticari Bankacılık', path: '/ticari' },
                { label: 'Ürünlerimiz', path: '/urunler' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all duration-300 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary-500 group-hover:translate-x-1 transition-transform duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-slate-300 mb-5">
              Kurumsal
            </h4>
            <ul className="space-y-3">
              {[
                'Hakkımızda',
                'Kariyer',
                'Basın Odası',
                'Gizlilik Politikası',
                'Kullanım Koşulları',
              ].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all duration-300 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary-500 group-hover:translate-x-1 transition-transform duration-300" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-slate-300 mb-5">
              İletişim
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Müşteri Hattı</p>
                  <p className="text-white text-sm font-semibold">0850 123 45 67</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">E-Posta</p>
                  <p className="text-white text-sm font-semibold">destek@kredizeka.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Merkez Ofis</p>
                  <p className="text-white text-sm font-semibold">Levent, İstanbul</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Alt Kısım: Telif Hakkı ─── */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs text-center md:text-left">
            © {currentYear} KrediZeka Finansal Teknoloji A.Ş. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <span>BDDK ve KVKK düzenlemelerine uygun olarak hizmet verilmektedir.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
