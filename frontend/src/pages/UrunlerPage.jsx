/**
 * KrediZeka - Ürünler Sayfası
 * ==============================
 * Statik ürün kartları yerine, arkasında Linear Regression mantığıyla
 * çalışan getiri/prim tahmin motorları bulunan interaktif kartlar
 * (ServiceGrid) kullanır.
 * Tüm metinler i18n çeviri sisteminden okunur.
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, Wallet, ArrowRight } from 'lucide-react';
import ServiceGrid from '../components/ServiceGrid';
import { urunServices } from '../data/serviceCatalog';

export default function UrunlerPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/80 text-violet-700 text-sm font-semibold mb-6">
            <Package className="w-4 h-4" /> {t('urunler.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {t('urunler.title_part1')} <span className="gradient-text">{t('urunler.title_part2')}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('urunler.subtitle')}</p>
        </div>
      </section>

      {/* ─── İNTERAKTİF ÜRÜN KARTLARI ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
            {t('urunler.title_part1')} <span className="gradient-text">{t('urunler.title_part2')}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {t('urunler.subtitle')}
          </p>
        </div>

        {/* ServiceGrid: Linear Regression destekli getiri/prim tahmini */}
        <ServiceGrid services={urunServices} />
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-center rounded-3xl">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3">{t('urunler.cta_title')}</h3>
          <p className="text-white/80 max-w-lg mx-auto mb-6">{t('urunler.cta_desc')}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-bold hover:bg-primary-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xl">
            {t('urunler.cta_button')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
