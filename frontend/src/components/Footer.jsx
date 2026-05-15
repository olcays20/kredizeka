/**
 * KrediZeka - Footer (Alt Bilgi) Bileşeni
 * ==========================================
 * Kurumsal görünüm sağlayan, linkler ve bilgi içeren footer bileşeni.
 * Gradient arka plan ve cam efekti ile modern bir tasarıma sahiptir.
 */

import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';

// Sosyal medya ikonları için inline SVG bileşenleri (Lucide marka ikonu içermediğinden)
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.859-8.114-10.641H8.08l4.259 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

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
              {[
                { Icon: LinkedInIcon,  href: 'https://linkedin.com/company/kredizeka', label: 'LinkedIn' },
                { Icon: XIcon,        href: 'https://x.com/kredizeka',                label: 'X (Twitter)' },
                { Icon: InstagramIcon, href: 'https://instagram.com/kredizeka',       label: 'Instagram' },
                { Icon: GitHubIcon,   href: 'https://github.com/kredizeka',           label: 'GitHub' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon />
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
                { label: 'Hakkımızda',          path: '/hakkimizda' },
                { label: 'Kariyer',             path: '/kariyer' },
                { label: 'Basın Odası',         path: '/basin-odasi' },
                { label: 'Gizlilik Politikası', path: '/gizlilik-politikasi' },
                { label: 'Kullanım Koşulları',  path: '/kullanim-kosullari' },
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
