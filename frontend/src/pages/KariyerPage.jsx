/**
 * KrediZeka - Kariyer Sayfası
 * =============================
 * Tüm metinler i18n çeviri sisteminden (TR/EN) okunur.
 * "Başvur" butonları /is-basvurusu sayfasına pozisyon parametresiyle yönlendirir.
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Briefcase, Clock, TrendingUp, Banknote, Gift, MapPin,
  CheckCircle2, ArrowRight, Heart, GraduationCap, Laptop, Coffee,
} from 'lucide-react';

export default function KariyerPage() {
  const { t } = useTranslation();

  const reasons = [
    { icon: Clock, key: 'reason_flex', color: 'from-blue-500 to-blue-600' },
    { icon: TrendingUp, key: 'reason_growth', color: 'from-emerald-500 to-emerald-600' },
    { icon: Banknote, key: 'reason_salary', color: 'from-amber-500 to-amber-600' },
    { icon: Gift, key: 'reason_perks', color: 'from-violet-500 to-violet-600' },
  ];

  // Pozisyonlar: titleKey + departmanKey + lokasyonKey ile çeviriye bağlı
  const positions = [
    { titleKey: 'pos_backend', deptKey: 'dept_engineering', locKey: 'loc_istanbul_hybrid', deptColor: 'bg-blue-100 text-blue-700' },
    { titleKey: 'pos_frontend', deptKey: 'dept_engineering', locKey: 'loc_remote', deptColor: 'bg-blue-100 text-blue-700' },
    { titleKey: 'pos_ml', deptKey: 'dept_ai', locKey: 'loc_istanbul_remote', deptColor: 'bg-violet-100 text-violet-700' },
    { titleKey: 'pos_data', deptKey: 'dept_data', locKey: 'loc_istanbul_hybrid', deptColor: 'bg-emerald-100 text-emerald-700' },
    { titleKey: 'pos_pm', deptKey: 'dept_product', locKey: 'loc_istanbul', deptColor: 'bg-amber-100 text-amber-700' },
  ];

  const perks = [
    { icon: Heart, key: 'perk_health' },
    { icon: Coffee, key: 'perk_meal' },
    { icon: Laptop, key: 'perk_remote' },
    { icon: GraduationCap, key: 'perk_edu' },
    { icon: TrendingUp, key: 'perk_equity' },
    { icon: Gift, key: 'perk_birthday' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-teal-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 text-emerald-700 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Briefcase className="w-4 h-4" /> {t('kariyer.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {t('kariyer.title_part1')} <span className="gradient-text">{t('kariyer.title_part2')}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">{t('kariyer.subtitle')}</p>
          <div className="flex items-center justify-center flex-wrap gap-4">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('kariyer.chip_salary')}
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('kariyer.chip_remote')}
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('kariyer.chip_equity')}
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            {t('kariyer.reasons_title_part1')} <span className="gradient-text">{t('kariyer.reasons_title_part2')}</span>?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{t('kariyer.reasons_subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map(({ icon: Icon, key, color }) => (
            <div key={key} className="card p-6 group text-center">
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{t(`kariyer.${key}_title`)}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t(`kariyer.${key}_desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            {t('kariyer.positions_title_part1')} <span className="gradient-text">{t('kariyer.positions_title_part2')}</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{t('kariyer.positions_subtitle')}</p>
        </div>
        <div className="flex flex-col gap-4">
          {positions.map(({ titleKey, deptKey, locKey, deptColor }) => {
            const title = t(`kariyer.${titleKey}`);
            return (
              <div key={titleKey} className="card-static p-6 rounded-2xl border border-slate-100 hover:border-primary-200 transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${deptColor}`}>
                      {t(`kariyer.${deptKey}`)}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                    <div className="flex items-center flex-wrap gap-3">
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t(`kariyer.${locKey}`)}
                      </span>
                      <span className="text-slate-200">|</span>
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {t('kariyer.type_fulltime')}
                      </span>
                    </div>
                  </div>
                  <div className="md:flex-shrink-0">
                    <Link to={`/is-basvurusu?pozisyon=${encodeURIComponent(title)}`} className="btn-primary inline-flex items-center gap-2 py-2.5 px-6 text-sm">
                      {t('kariyer.apply_button')} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-sm text-slate-400 mt-6">
          {t('kariyer.open_application_hint')}{' '}
          <Link to={`/is-basvurusu?pozisyon=${encodeURIComponent(t('basvuru.position_open'))}`} className="text-primary-600 font-semibold hover:underline">
            {t('kariyer.open_application_link')}
          </Link>
          {' '}{t('kariyer.open_application_tail')}
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-3xl text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">{t('kariyer.perks_title')}</h2>
            <p className="text-primary-100 max-w-lg mx-auto">{t('kariyer.perks_subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-start gap-4 bg-white/10 rounded-2xl p-5 hover:bg-white/15 transition-colors duration-300">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">{t(`kariyer.${key}`)}</p>
                  <p className="text-sm text-primary-100 leading-relaxed">{t(`kariyer.${key}_desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
