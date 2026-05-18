/**
 * KrediZeka - Haber Detay Modal Bileşeni
 * ========================================
 * Haberler ve Basın Odası sayfalarında "Devamını Oku" tıklandığında açılır.
 *
 * Özellikler:
 *  - Sayfa scroll'unu kilitler (modal açıkken arka plan kaymaz)
 *  - ESC tuşu ile kapatılabilir
 *  - Arka plan (backdrop) tıklamasıyla kapatılır
 *  - Erişilebilirlik: role="dialog", aria-modal
 */

import { useEffect } from 'react';
import { X, Calendar, Tag } from 'lucide-react';

export default function NewsModal({ item, onClose }) {
  // ESC tuşu ile kapatma ve body scroll kilidi
  useEffect(() => {
    if (!item) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    // Modal açıkken arka plan scroll'unu kilitle
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
    >
      {/* Karartılmış arka plan */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal İçeriği */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        {/* Üst Bant: Gradient + Kapat */}
        <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-6 pr-16 flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center flex-wrap gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              {item.date}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
              <Tag className="w-3.5 h-3.5" />
              {item.tag}
            </span>
          </div>

          <h2 id="news-modal-title" className="text-xl md:text-2xl font-extrabold text-white leading-tight">
            {item.title}
          </h2>
        </div>

        {/* İçerik (Scroll'lu) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="space-y-4">
            {/* Özet vurgu kutusu */}
            <div className="p-4 rounded-xl bg-primary-50 border-l-4 border-primary-500">
              <p className="text-sm md:text-base text-slate-700 leading-relaxed italic">
                {item.summary}
              </p>
            </div>

            {/* Haber gövdesi */}
            <div className="prose prose-slate max-w-none space-y-4">
              {item.content.map((paragraph, i) => (
                <p key={i} className="text-sm md:text-base text-slate-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Alt bilgi */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400 text-center">
              Bu içerik KrediZeka Basın Odası tarafından hazırlanmıştır.
              Tüm hakları saklıdır.
            </div>
          </div>
        </div>

        {/* Alt: Kapat Butonu */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="btn-secondary w-full md:w-auto md:ml-auto md:flex inline-flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
