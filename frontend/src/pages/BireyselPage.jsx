/**
 * KrediZeka - Bireysel Bankacılık Sayfası
 * =========================================
 * Tüm metinler i18n çeviri sisteminden (TR/EN) okunur.
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  User, CreditCard, PiggyBank, TrendingUp, Shield, Globe,
  Wallet, Umbrella, ArrowRight
} from 'lucide-react';

export default function BireyselPage() {
  const { t } = useTranslation();

  const services = [
    { icon: Wallet, key: 'feature_credit', color: 'from-blue-500 to-blue-600' },
    { icon: PiggyBank, key: 'feature_savings', color: 'from-emerald-500 to-emerald-600' },
    { icon: CreditCard, key: 'feature_card', color: 'from-violet-500 to-violet-600' },
    { icon: TrendingUp, key: 'feature_invest', color: 'from-amber-500 to-amber-600' },
    { icon: Umbrella, key: 'feature_insurance', color: 'from-pink-500 to-pink-600' },
    { icon: Globe, key: 'feature_digital', color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-primary-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-semibold mb-6">
            <User className="w-4 h-4" /> {t('bireysel.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {t('bireysel.title_part1')} <span className="gradient-text">{t('bireysel.title_part2')}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            {t('bireysel.subtitle')}
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> {t('bireysel.cta_button')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(({ icon: Icon, key, color }, i) => (
            <div key={i} className="card p-8 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t(`bireysel.${key}_title`)}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t(`bireysel.${key}_desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center rounded-3xl">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3">{t('bireysel.cta_title')}</h3>
          <p className="text-primary-100 max-w-lg mx-auto mb-6">{t('bireysel.cta_desc')}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-bold hover:bg-primary-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xl">
            {t('bireysel.cta_button')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
