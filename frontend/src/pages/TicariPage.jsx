/**
 * KrediZeka - Ticari Bankacılık Sayfası
 * =======================================
 * Statik tanıtım kartları yerine, arkasında XGBoost mantığıyla çalışan
 * "Şirket Finansal Sağlık Skoru" simülasyon motoru bulunan interaktif
 * hizmet kartları (ServiceGrid) kullanır.
 * Tüm metinler i18n çeviri sisteminden okunur.
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Building2, TrendingUp, ArrowRight, Shield } from 'lucide-react';
import ServiceGrid from '../components/ServiceGrid';
import { ticariServices } from '../data/serviceCatalog';

export default function TicariPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 text-indigo-700 text-sm font-semibold mb-6">
            <Building2 className="w-4 h-4" /> {t('ticari.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {t('ticari.title_part1')} <span className="gradient-text">{t('ticari.title_part2')}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            {t('ticari.subtitle')}
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> {t('ticari.cta_button')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── İNTERAKTİF HİZMET KARTLARI ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
            {t('ticari.title_part1')} <span className="gradient-text">{t('ticari.title_part2')}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {t('ticari.subtitle')}
          </p>
        </div>

        {/* ServiceGrid: XGBoost destekli şirket sağlık skoru analizi */}
        <ServiceGrid services={ticariServices} />
      </section>

      {/* ─── İSTATİSTİKLER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: '15K+', label: 'Kurumsal Müşteri' },
              { val: '₺2.5M+', label: 'Kullandırılan Kredi' },
              { val: '%98', label: 'Müşteri Memnuniyeti' },
              { val: '24/7', label: 'Destek Hattı' },
            ].map(({ val, label }, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{val}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center rounded-3xl">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3">{t('ticari.cta_title')}</h3>
          <p className="text-primary-100 max-w-lg mx-auto mb-6">{t('ticari.cta_desc')}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-bold hover:bg-primary-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xl">
            {t('ticari.cta_button')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
