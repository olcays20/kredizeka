/**
 * KrediZeka - Hakkımızda Sayfası
 * ================================
 * Tüm metinler i18n çeviri sisteminden (TR/EN) okunur.
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Info, Target, Eye, Shield, Lightbulb, Users,
  TrendingUp, ArrowRight, BarChart3, Calendar, Award,
} from 'lucide-react';

export default function HakkimizdaPage() {
  const { t } = useTranslation();

  const stats = [
    { key: 'stat_users', value: '50.000+', icon: Users },
    { key: 'stat_volume', value: '₺1.2 Milyar', icon: BarChart3 },
    { key: 'stat_accuracy', value: '%98.5', icon: Award },
    { key: 'stat_founded', value: '2023', icon: Calendar },
  ];

  const values = [
    { icon: Eye, key: 'value_transparency', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, key: 'value_trust', color: 'from-emerald-500 to-emerald-600' },
    { icon: Lightbulb, key: 'value_innovation', color: 'from-violet-500 to-violet-600' },
  ];

  const team = [
    { name: 'Cenk Yılmaz', titleKey: 'team_member1_title', bioKey: 'team_member1_bio', initials: 'CY', from: 'from-primary-500', to: 'to-primary-700' },
    { name: 'Kaan Demir', titleKey: 'team_member2_title', bioKey: 'team_member2_bio', initials: 'KD', from: 'from-accent-500', to: 'to-accent-700' },
    { name: 'Burak Aydın', titleKey: 'team_member3_title', bioKey: 'team_member3_bio', initials: 'BA', from: 'from-violet-500', to: 'to-violet-700' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-primary-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 text-indigo-700 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Info className="w-4 h-4" /> {t('hakkimizda.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {t('hakkimizda.title_part1')} <span className="gradient-text">{t('hakkimizda.title_part2')}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">{t('hakkimizda.subtitle')}</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> {t('hakkimizda.cta_hero')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* MİSYON & VİZYON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            {t('hakkimizda.mv_title_part1')} <span className="gradient-text">{t('hakkimizda.mv_title_part2')}</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{t('hakkimizda.mv_subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-8 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('hakkimizda.mission_title')}</h3>
            <p className="text-slate-600 leading-relaxed">{t('hakkimizda.mission_body')}</p>
            <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-2 text-sm font-semibold text-primary-600">
              <Shield className="w-4 h-4" /> {t('hakkimizda.mission_tag')}
            </div>
          </div>
          <div className="card p-8 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/25 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('hakkimizda.vision_title')}</h3>
            <p className="text-slate-600 leading-relaxed">{t('hakkimizda.vision_body')}</p>
            <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-2 text-sm font-semibold text-accent-600">
              <TrendingUp className="w-4 h-4" /> {t('hakkimizda.vision_tag')}
            </div>
          </div>
        </div>
      </section>

      {/* İSTATİSTİKLER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              {t('hakkimizda.stats_title_part1')} <span className="text-primary-400">{t('hakkimizda.stats_title_part2')}</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">{t('hakkimizda.stats_subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ key, value, icon: Icon }) => (
              <div key={key} className="group">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
                <p className="text-sm font-medium text-slate-400">{t(`hakkimizda.${key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEĞERLERİMİZ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            {t('hakkimizda.values_title_part1')} <span className="gradient-text">{t('hakkimizda.values_title_part2')}</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{t('hakkimizda.values_subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map(({ icon: Icon, key, color }) => (
            <div key={key} className="card p-8 text-center group">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{t(`hakkimizda.${key}_title`)}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t(`hakkimizda.${key}_desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EKİBİMİZ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            {t('hakkimizda.team_title_part1')} <span className="gradient-text">{t('hakkimizda.team_title_part2')}</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{t('hakkimizda.team_subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map(({ name, titleKey, bioKey, initials, from, to }) => (
            <div key={name} className="card p-8 text-center group">
              <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${from} ${to} flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4 group-hover:scale-105 transition-transform duration-300`}>
                <span className="text-2xl font-black text-white">{initials}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{name}</h3>
              <p className="text-sm font-medium text-primary-600 mb-3">{t(`hakkimizda.${titleKey}`)}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{t(`hakkimizda.${bioKey}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center rounded-3xl">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3">{t('hakkimizda.cta_title')}</h3>
          <p className="text-primary-100 max-w-lg mx-auto mb-6">{t('hakkimizda.cta_desc')}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-bold hover:bg-primary-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xl">
            {t('hakkimizda.cta_button')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
