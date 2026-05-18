/**
 * KrediZeka - Ürünler Sayfası
 * ==============================
 * Tüm metinler i18n çeviri sisteminden (TR/EN) okunur.
 * NOT: Yalnızca web tabanlı platform — mobil/app store yönlendirmesi yoktur.
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Package, CreditCard, PiggyBank, TrendingUp, Shield, Globe,
  Wallet, BadgePercent, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function UrunlerPage() {
  const { t } = useTranslation();

  const products = [
    { icon: CreditCard, key: 'cat_card', color: 'from-violet-500 to-violet-600' },
    { icon: PiggyBank, key: 'cat_deposit', color: 'from-emerald-500 to-emerald-600' },
    { icon: TrendingUp, key: 'cat_invest', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, key: 'cat_insurance', color: 'from-amber-500 to-amber-600' },
    { icon: Globe, key: 'cat_online', color: 'from-pink-500 to-pink-600' },
    { icon: BadgePercent, key: 'cat_promo', color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(({ icon: Icon, key, color }, i) => (
            <div key={i} className="card p-8 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">{t(`urunler.${key}_title`)}</h3>
              <ul className="space-y-2.5">
                {['f1', 'f2', 'f3', 'f4'].map((fid) => (
                  <li key={fid} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {t(`urunler.${key}_${fid}`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

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
