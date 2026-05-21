/**
 * KrediZeka - İnteraktif Servis Kataloğu
 * ========================================
 * Bireysel, Ticari ve Ürünler sayfalarındaki tüm hizmet kartlarının
 * tek kaynaktan (single source of truth) tanımı.
 *
 * Her servis nesnesi:
 *   - id          : Benzersiz kart kimliği
 *   - apiType     : Backend'in beklediği hizmet_turu / urun_turu değeri
 *   - category    : 'bireysel' | 'ticari' | 'urunler' (hangi API endpoint'i)
 *   - icon        : Lucide ikon bileşeni
 *   - color       : Tailwind gradient sınıfı (kart ikonu için)
 *   - titleKey    : i18n başlık anahtarı
 *   - descKey     : i18n açıklama anahtarı
 *   - resultKind  : 'score' | 'health' | 'prediction' (sonuç gösterim tipi)
 *   - fields      : Form alanları dizisi
 *
 * Form alanı (field):
 *   - name        : Backend'e gönderilecek anahtar (girdi_verileri içindeki key)
 *   - labelKey    : i18n etiket anahtarı
 *   - type        : 'number' | 'select'
 *   - placeholder : (number için) örnek değer
 *   - options     : (select için) [{ value, labelKey }]
 *   - icon        : Lucide ikon (alan başında gösterilir)
 */

import {
  Wallet, PiggyBank, CreditCard, TrendingUp, Umbrella, Landmark,
  Receipt, Users, Globe, Banknote, ShieldCheck, BadgePercent,
  Calendar, Building2, Briefcase, DollarSign, Percent, Target,
} from 'lucide-react';

// =============================================================================
// BİREYSEL HİZMETLER (5 kart)
// =============================================================================
export const bireyselServices = [
  {
    id: 'kredi-yonetimi',
    apiType: 'Kredi_Yonetimi',
    category: 'bireysel',
    icon: Wallet,
    color: 'from-blue-500 to-blue-600',
    titleKey: 'services.kredi_yonetimi_title',
    descKey: 'services.kredi_yonetimi_desc',
    resultKind: 'score',
    fields: [
      { name: 'aylik_gelir', labelKey: 'services.f_aylik_gelir', type: 'number', placeholder: '15000', icon: Wallet },
      { name: 'toplam_borc', labelKey: 'services.f_toplam_borc', type: 'number', placeholder: '5000', icon: CreditCard },
      { name: 'talep_kredi', labelKey: 'services.f_talep_kredi', type: 'number', placeholder: '50000', icon: DollarSign },
    ],
  },
  {
    id: 'birikim',
    apiType: 'Birikim',
    category: 'bireysel',
    icon: PiggyBank,
    color: 'from-emerald-500 to-emerald-600',
    titleKey: 'services.birikim_title',
    descKey: 'services.birikim_desc',
    resultKind: 'score',
    fields: [
      { name: 'anapara', labelKey: 'services.f_anapara', type: 'number', placeholder: '20000', icon: PiggyBank },
      { name: 'vade_ay', labelKey: 'services.f_vade_ay', type: 'number', placeholder: '24', icon: Calendar },
      { name: 'aylik_ekleme', labelKey: 'services.f_aylik_ekleme', type: 'number', placeholder: '1000', icon: Wallet },
    ],
  },
  {
    id: 'kredi-karti',
    apiType: 'Kredi_Karti',
    category: 'bireysel',
    icon: CreditCard,
    color: 'from-violet-500 to-violet-600',
    titleKey: 'services.kredi_karti_title',
    descKey: 'services.kredi_karti_desc',
    resultKind: 'score',
    fields: [
      { name: 'aylik_gelir', labelKey: 'services.f_aylik_gelir', type: 'number', placeholder: '15000', icon: Wallet },
      { name: 'mevcut_kart_borcu', labelKey: 'services.f_mevcut_kart_borcu', type: 'number', placeholder: '3000', icon: CreditCard },
      { name: 'aylik_harcama', labelKey: 'services.f_aylik_harcama', type: 'number', placeholder: '6000', icon: Receipt },
    ],
  },
  {
    id: 'yatirim',
    apiType: 'Yatirim',
    category: 'bireysel',
    icon: TrendingUp,
    color: 'from-amber-500 to-amber-600',
    titleKey: 'services.yatirim_title',
    descKey: 'services.yatirim_desc',
    resultKind: 'score',
    fields: [
      { name: 'yatirim_tutari', labelKey: 'services.f_yatirim_tutari', type: 'number', placeholder: '50000', icon: DollarSign },
      {
        name: 'risk_tercihi', labelKey: 'services.f_risk_tercihi', type: 'select', icon: Target,
        options: [
          { value: 'dusuk', labelKey: 'services.opt_risk_dusuk' },
          { value: 'orta', labelKey: 'services.opt_risk_orta' },
          { value: 'yuksek', labelKey: 'services.opt_risk_yuksek' },
        ],
      },
      { name: 'vade_yil', labelKey: 'services.f_vade_yil', type: 'number', placeholder: '5', icon: Calendar },
    ],
  },
  {
    id: 'bireysel-sigorta',
    apiType: 'Sigorta',
    category: 'bireysel',
    icon: Umbrella,
    color: 'from-pink-500 to-pink-600',
    titleKey: 'services.bireysel_sigorta_title',
    descKey: 'services.bireysel_sigorta_desc',
    resultKind: 'score',
    fields: [
      { name: 'yas', labelKey: 'services.f_yas', type: 'number', placeholder: '35', icon: Users },
      { name: 'teminat_tutari', labelKey: 'services.f_teminat_tutari', type: 'number', placeholder: '500000', icon: ShieldCheck },
      {
        name: 'sigorta_tipi', labelKey: 'services.f_sigorta_tipi', type: 'select', icon: Umbrella,
        options: [
          { value: 'hayat', labelKey: 'services.opt_sigorta_hayat' },
          { value: 'saglik', labelKey: 'services.opt_sigorta_saglik' },
          { value: 'kasko', labelKey: 'services.opt_sigorta_kasko' },
        ],
      },
    ],
  },
];

// =============================================================================
// TİCARİ HİZMETLER (4 kart) — hepsi aynı 5 şirket alanını kullanır
// =============================================================================

// Ticari kartların ortak form alanları (XGBoost şirket sağlık motoru girdileri)
const ticariOrtakAlanlar = [
  { name: 'yillik_ciro', labelKey: 'services.f_yillik_ciro', type: 'number', placeholder: '5000000', icon: TrendingUp },
  { name: 'calisan_sayisi', labelKey: 'services.f_calisan_sayisi', type: 'number', placeholder: '25', icon: Users },
  { name: 'aylik_pos_hacmi', labelKey: 'services.f_aylik_pos_hacmi', type: 'number', placeholder: '300000', icon: CreditCard },
  { name: 'sirket_yasi', labelKey: 'services.f_sirket_yasi', type: 'number', placeholder: '8', icon: Calendar },
  { name: 'mevcut_borc', labelKey: 'services.f_mevcut_borc', type: 'number', placeholder: '1000000', icon: Landmark },
];

export const ticariServices = [
  {
    id: 'ticari-kredi',
    apiType: 'Ticari_Kredi',
    category: 'ticari',
    icon: Landmark,
    color: 'from-indigo-500 to-indigo-600',
    titleKey: 'services.ticari_kredi_title',
    descKey: 'services.ticari_kredi_desc',
    resultKind: 'health',
    fields: ticariOrtakAlanlar,
  },
  {
    id: 'pos-tahsilat',
    apiType: 'POS_Tahsilat',
    category: 'ticari',
    icon: CreditCard,
    color: 'from-cyan-500 to-cyan-600',
    titleKey: 'services.pos_tahsilat_title',
    descKey: 'services.pos_tahsilat_desc',
    resultKind: 'health',
    fields: ticariOrtakAlanlar,
  },
  {
    id: 'maas-bordro',
    apiType: 'Maas_Bordro',
    category: 'ticari',
    icon: Briefcase,
    color: 'from-emerald-500 to-emerald-600',
    titleKey: 'services.maas_bordro_title',
    descKey: 'services.maas_bordro_desc',
    resultKind: 'health',
    fields: ticariOrtakAlanlar,
  },
  {
    id: 'dis-ticaret',
    apiType: 'Dis_Ticaret',
    category: 'ticari',
    icon: Globe,
    color: 'from-orange-500 to-orange-600',
    titleKey: 'services.dis_ticaret_title',
    descKey: 'services.dis_ticaret_desc',
    resultKind: 'health',
    fields: ticariOrtakAlanlar,
  },
];

// =============================================================================
// ÜRÜNLER (3 interaktif kart)
// =============================================================================
export const urunServices = [
  {
    id: 'mevduat-hesabi',
    apiType: 'Mevduat_Hesabi',
    category: 'urunler',
    icon: Banknote,
    color: 'from-emerald-500 to-emerald-600',
    titleKey: 'services.mevduat_title',
    descKey: 'services.mevduat_desc',
    resultKind: 'prediction',
    fields: [
      { name: 'mevduat_tutari', labelKey: 'services.f_mevduat_tutari', type: 'number', placeholder: '100000', icon: Banknote },
      { name: 'vade_ay', labelKey: 'services.f_vade_ay', type: 'number', placeholder: '12', icon: Calendar },
    ],
  },
  {
    id: 'sigorta-urunleri',
    apiType: 'Sigorta_Urunleri',
    category: 'urunler',
    icon: ShieldCheck,
    color: 'from-amber-500 to-amber-600',
    titleKey: 'services.sigorta_urun_title',
    descKey: 'services.sigorta_urun_desc',
    resultKind: 'prediction',
    fields: [
      { name: 'yas', labelKey: 'services.f_yas', type: 'number', placeholder: '35', icon: Users },
      { name: 'teminat_tutari', labelKey: 'services.f_teminat_tutari', type: 'number', placeholder: '300000', icon: ShieldCheck },
      {
        name: 'sigorta_tipi', labelKey: 'services.f_sigorta_tipi', type: 'select', icon: Umbrella,
        options: [
          { value: 'hayat', labelKey: 'services.opt_sigorta_hayat' },
          { value: 'saglik', labelKey: 'services.opt_sigorta_saglik' },
          { value: 'kasko', labelKey: 'services.opt_sigorta_kasko' },
        ],
      },
    ],
  },
  {
    id: 'kampanyalar',
    apiType: 'Kampanyalar',
    category: 'urunler',
    icon: BadgePercent,
    color: 'from-teal-500 to-teal-600',
    titleKey: 'services.kampanya_title',
    descKey: 'services.kampanya_desc',
    resultKind: 'prediction',
    fields: [
      { name: 'aylik_harcama', labelKey: 'services.f_aylik_harcama', type: 'number', placeholder: '8000', icon: Receipt },
      {
        name: 'kampanya_tipi', labelKey: 'services.f_kampanya_tipi', type: 'select', icon: Percent,
        options: [
          { value: 'cashback', labelKey: 'services.opt_kampanya_cashback' },
          { value: 'puan', labelKey: 'services.opt_kampanya_puan' },
          { value: 'mil', labelKey: 'services.opt_kampanya_mil' },
        ],
      },
    ],
  },
];

/**
 * Bir servisin form alanlarını N adıma böler (çok adımlı stepper için).
 * Son adım her zaman "sonuç" adımıdır; bu fonksiyon yalnızca form
 * adımlarını döndürür.
 *
 * Davranış:
 *   - 1-2 alan → tek form adımı
 *   - 3+ alan → iki form adımına bölünür
 *
 * @param {Array} fields - servis.fields dizisi
 * @returns {Array<Array>} - alan gruplarının dizisi
 */
export function splitFieldsIntoSteps(fields) {
  if (!fields || fields.length === 0) return [[]];
  if (fields.length <= 2) return [fields];
  const mid = Math.ceil(fields.length / 2);
  return [fields.slice(0, mid), fields.slice(mid)];
}
