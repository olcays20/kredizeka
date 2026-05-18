/**
 * KrediZeka - Tüm Haberler Sayfası
 * ====================================
 * Tüm metinler i18n çevirisinden okunur. Haberler newsData.js'den
 * çift dilli olarak alınır (localizeNews).
 *
 * Filtre: tagKey (örn. 'tag_technology') üzerinden — UI etiketi dile göre
 * t('haberler.tag_technology') ile gösterilir, eşitlik tagKey üzerinden yapılır.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper, Calendar, ChevronRight, ChevronLeft, Filter } from 'lucide-react';
import { news, localizeNews } from '../data/newsData';
import NewsModal from '../components/NewsModal';

export default function HaberlerPage() {
  const { t, i18n } = useTranslation();
  // Aktif filtre tag KEY'i ('all' = filtre yok)
  const [activeTagKey, setActiveTagKey] = useState('all');
  const [selectedNews, setSelectedNews] = useState(null);

  // Aktif dile göre yerelleştirilmiş haberler
  const localizedNews = useMemo(
    () => news.map((item) => localizeNews(item, i18n.language)),
    [i18n.language]
  );

  // Benzersiz tagKey listesi (haberlerden otomatik üret)
  const tagKeys = useMemo(() => {
    const unique = Array.from(new Set(news.map((n) => n.tagKey)));
    return ['all', ...unique];
  }, []);

  // Aktif filtreye göre haberleri süzer
  const filteredNews = useMemo(() => {
    if (activeTagKey === 'all') return localizedNews;
    return localizedNews.filter((n) => n.tagKey === activeTagKey);
  }, [activeTagKey, localizedNews]);

  // Filtre etiketinin görünür dilde metni
  const tagLabel = (key) => key === 'all' ? t('haberler.filter_all') : t(`haberler.${key}`);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-indigo-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Link to="/basin-odasi" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> {t('haberler.back_to_press')}
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Newspaper className="w-4 h-4" /> {t('haberler.badge')}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {t('haberler.title_part1')} <span className="gradient-text">{t('haberler.title_part2')}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('haberler.subtitle')}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="card-static p-5 flex items-center flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5" /> {t('haberler.filter_label')}
          </span>
          {tagKeys.map((key) => {
            const isActive = activeTagKey === key;
            return (
              <button key={key} onClick={() => setActiveTagKey(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {tagLabel(key)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredNews.length === 0 ? (
          <div className="card-static p-14 text-center">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">{t('haberler.no_results_title')}</h3>
            <p className="text-sm text-slate-500">{t('haberler.no_results_desc')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <article key={item.id} className="card p-7 group flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.tagColor}`}>
                    {t(`haberler.${item.tagKey}`)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug group-hover:text-primary-700 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5 line-clamp-4">
                  {item.summary}
                </p>
                <button type="button" onClick={() => setSelectedNews(item)}
                  className="self-start flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors duration-300 group/btn">
                  {t('basin.read_more')}
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </button>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          {t('haberler.total_count', { count: filteredNews.length })}
          {activeTagKey !== 'all' && t('haberler.filter_active', { tag: tagLabel(activeTagKey) })}
        </p>
      </section>

      <NewsModal item={selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  );
}
