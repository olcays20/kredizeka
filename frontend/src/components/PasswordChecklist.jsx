/**
 * KrediZeka - Şifre Güçlülük Kontrol Listesi (PasswordChecklist.jsx)
 * ===================================================================
 * Kullanıcı şifresini yazarken, güçlü parola kriterlerinin hangilerini
 * karşıladığını CANLI olarak (✓ / ✗) gösteren bileşen.
 *
 * Hem Kayıt (RegisterPage) hem de Şifre Sıfırlama (ResetPasswordPage)
 * sayfalarında kullanıldığından, kuralları tek bir yerde tanımlamak için
 * ortak (paylaşılan) bir bileşen olarak tasarlanmıştır.
 *
 * Buradaki kurallar, backend'deki '_validate_password_strength' fonksiyonuyla
 * birebir AYNIDIR — böylece istemci ve sunucu doğrulaması tutarlı çalışır.
 */

import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Güçlü parola kuralları.
 * Her kural; bir 'key' (i18n çeviri anahtarı) ve bir 'test' fonksiyonu içerir.
 *
 * Regex notları (Unicode duyarlı — 'u' bayrağı):
 *   \p{Lu} → herhangi bir BÜYÜK harf (Türkçe dahil)
 *   \p{Ll} → herhangi bir küçük harf (Türkçe dahil)
 *   \p{Nd} → herhangi bir ondalık rakam
 *   [^\p{L}\p{N}\s] → harf, rakam ve boşluk DIŞINDAKİ her karakter (özel karakter)
 */
export const passwordRules = [
  { key: 'length',    test: (p) => p.length >= 8 },
  { key: 'uppercase', test: (p) => /\p{Lu}/u.test(p) },
  { key: 'lowercase', test: (p) => /\p{Ll}/u.test(p) },
  { key: 'digit',     test: (p) => /\p{Nd}/u.test(p) },
  { key: 'special',   test: (p) => /[^\p{L}\p{N}\s]/u.test(p) },
];

/**
 * Verilen şifrenin TÜM güçlülük kriterlerini sağlayıp sağlamadığını döndürür.
 * Form gönderiminden önce doğrulama amacıyla kullanılır.
 *
 * @param {string} password - Kontrol edilecek şifre
 * @returns {boolean} Tüm kurallar sağlanıyorsa true
 */
export function isStrongPassword(password) {
  return passwordRules.every((rule) => rule.test(password || ''));
}

/**
 * Şifre kurallarını canlı olarak gösteren kontrol listesi bileşeni.
 *
 * @param {string} password - O an girilmekte olan şifre (canlı izlenir)
 */
export default function PasswordChecklist({ password = '' }) {
  const { t } = useTranslation();

  return (
    <div className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3">
      <p className="text-xs font-semibold text-slate-500 mb-1.5">
        {t('password_rules.title')}
      </p>
      <ul className="space-y-1">
        {passwordRules.map((rule) => {
          // Kural o anki şifre tarafından sağlanıyor mu?
          const met = rule.test(password || '');
          return (
            <li
              key={rule.key}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                met
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {met
                ? <Check className="w-3.5 h-3.5 flex-shrink-0" />
                : <X className="w-3.5 h-3.5 flex-shrink-0" />}
              <span>{t(`password_rules.${rule.key}`)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
