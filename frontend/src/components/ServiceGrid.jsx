/**
 * KrediZeka - İnteraktif Servis Kartları Izgarası (ServiceGrid)
 * ===============================================================
 * Bireysel, Ticari ve Ürünler sayfalarında ortak kullanılan,
 * tıklanabilir hizmet kartları bileşeni.
 *
 * Davranış:
 *   - Kullanıcı GİRİŞ YAPMIŞSA:
 *       Kartlar tıklanabilir → ServiceAnalysisModal açılır
 *   - Kullanıcı GİRİŞ YAPMAMIŞSA (Auth Guard):
 *       Kartlar bulanıklaştırılır (blur), tıklama engellenir,
 *       üzerlerine "giriş yapın" çağrı katmanı (overlay) yerleştirilir
 *
 * Bu, "risk analizi gibi finansal araçların giriş yapmadan
 * kullanılamaması" güvenlik gereksinimini karşılar.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Lock, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import ServiceAnalysisModal from './ServiceAnalysisModal';

export default function ServiceGrid({ services }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Modal'da açık olan servis (null → modal kapalı)
  const [selectedService, setSelectedService] = useState(null);

  // Oturum yoksa kartlar etkileşime kapalı + bulanık
  const locked = !user;

  return (
    <div className="relative">

      {/* ─── KART IZGARASI ─── */}
      <div
        className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${
          locked ? 'blur-[3px] pointer-events-none select-none' : ''
        }`}
        aria-hidden={locked}
      >
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => !locked && setSelectedService(svc)}
              disabled={locked}
              className="card p-7 text-left group flex flex-col h-full focus:outline-none focus:ring-4 focus:ring-primary-500/20"
            >
              {/* İkon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${svc.color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>

              {/* Başlık + açıklama */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t(svc.titleKey)}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1 mb-5">
                {t(svc.descKey)}
              </p>

              {/* Çağrı (CTA) */}
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2.5 transition-all duration-300">
                {t('services.card_cta')}
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── AUTH GUARD KATMANI (Oturum yoksa) ─── */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="card-static p-8 md:p-10 text-center max-w-md mx-auto shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/30 mb-5">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              {t('services.auth_required_title')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {t('services.auth_required_desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/giris"
                className="btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
              >
                <LogIn className="w-4 h-4" />
                {t('services.login_button')}
              </Link>
              <Link
                to="/kayit"
                className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
              >
                <UserPlus className="w-4 h-4" />
                {t('services.register_button')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── ANALİZ MODALI ─── */}
      {selectedService && (
        <ServiceAnalysisModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
