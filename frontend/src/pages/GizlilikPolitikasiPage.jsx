/**
 * KrediZeka - Gizlilik Politikası Sayfası
 * ==========================================
 * Tüm metinler i18n çevirisinden, accordion bölümleri çift dilli
 * legalData.js'den okunur.
 */

import { useState, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Lock, ChevronDown, Shield, Mail } from 'lucide-react';
import { privacySections, localizeSection } from '../data/legalData';

export default function GizlilikPolitikasiPage() {
  const { t, i18n } = useTranslation();
  const [openId, setOpenId] = useState(1);
  const toggle = (id) => setOpenId(openId === id ? null : id);

  // Aktif dile göre yerelleştirilmiş bölümler
  const sections = useMemo(
    () => privacySections.map((s) => localizeSection(s, i18n.language)),
    [i18n.language]
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary-50" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-slate-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 text-slate-600 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Lock className="w-4 h-4" /> {t('legal.privacy_badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {t('legal.privacy_title_part1')} <span className="gradient-text">{t('legal.privacy_title_part2')}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-3">{t('legal.privacy_subtitle')}</p>
          <p className="text-sm text-slate-400">
            <Trans i18nKey="legal.privacy_last_update" components={{ strong: <strong /> }} />
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-3">
          {sections.map(({ id, title, content }) => {
            const isOpen = openId === id;
            return (
              <div key={id}
                className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isOpen
                    ? 'border-primary-200 shadow-md shadow-primary-100/50'
                    : 'border-slate-200 hover:border-slate-300'
                } bg-white`}>
                <button onClick={() => toggle(id)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left" aria-expanded={isOpen}>
                  <span className={`font-bold text-base transition-colors duration-300 ${isOpen ? 'text-primary-700' : 'text-slate-900'}`}>
                    {title}
                  </span>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-600' : 'text-slate-400'}`} />
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary-100 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{t('legal.cta_title_privacy')}</h3>
          <p className="text-sm text-slate-500 mb-4">{t('legal.cta_desc_privacy')}</p>
          <a href="mailto:destek@kredizeka.com" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-800 transition-colors duration-300">
            <Mail className="w-4 h-4" /> destek@kredizeka.com
          </a>
        </div>
      </section>
    </div>
  );
}
