/**
 * Şifre güçlülük kuralları + canlı kontrol listesi bileşeni.
 * Kayıt ve şifre sıfırlama sayfalarında ortak kullanılır.
 * Kurallar backend'deki _validate_password_strength ile aynıdır.
 */

import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const passwordRules = [
  { key: 'length',    test: (p) => p.length >= 8 },
  { key: 'uppercase', test: (p) => /\p{Lu}/u.test(p) },
  { key: 'lowercase', test: (p) => /\p{Ll}/u.test(p) },
  { key: 'digit',     test: (p) => /\p{Nd}/u.test(p) },
  { key: 'special',   test: (p) => /[^\p{L}\p{N}\s]/u.test(p) },
];

// Tüm kuralları sağlıyor mu? — form gönderiminden önce kullanılır.
export function isStrongPassword(password) {
  return passwordRules.every((rule) => rule.test(password || ''));
}

export default function PasswordChecklist({ password = '' }) {
  const { t } = useTranslation();

  return (
    <div className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3">
      <p className="text-xs font-semibold text-slate-500 mb-1.5">
        {t('password_rules.title')}
      </p>
      <ul className="space-y-1">
        {passwordRules.map((rule) => {
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
