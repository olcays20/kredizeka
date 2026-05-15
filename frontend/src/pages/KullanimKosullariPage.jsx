/**
 * KrediZeka - Kullanım Koşulları Sayfası
 * =========================================
 * Hizmet kullanım koşullarını accordion bileşeni ile gösteren
 * içerik sayfası. GizlilikPolitikasiPage ile özdeş accordion yapısı.
 */

import { useState } from 'react';
import { FileText, ChevronDown, Shield, Mail } from 'lucide-react';

// Kullanım koşulları bölümleri
const sections = [
  {
    id: 1,
    title: '1. Hizmetlerin Kapsamı',
    content: `KrediZeka Finansal Teknoloji A.Ş. ("KrediZeka") tarafından sunulan platform, kullanıcılara aşağıdaki hizmetleri sunan bir finansal teknoloji danışmanlık platformudur:

• Yapay zeka destekli kredi risk analizi ve skorlama
• Kişiselleştirilmiş finansal tavsiyeler
• Kullanıcı profili yönetimi (meslek, adres, iletişim bilgileri)
• Borç-gelir ve kredi-gelir oranı hesaplamaları

Platform yalnızca bilgilendirme amaçlı olup kesin kredi kararı vermemektedir. Sunulan skorlar ve tavsiyeler, olası senaryoları modellemek için tasarlanmış tahminsel değerlendirmelerdir; resmi bir kredi başvurusu ya da bankacılık hizmeti niteliği taşımaz.`,
  },
  {
    id: 2,
    title: '2. Kullanıcı Yükümlülükleri',
    content: `Platform hizmetlerinden yararlanan her kullanıcı aşağıdaki yükümlülükleri kabul etmiş sayılır:

• Platforma kayıt sırasında verilen bilgilerin (T.C. No, Ad Soyad, Telefon) doğru, güncel ve eksiksiz olduğunu beyan eder.
• Hesabın yalnızca kendi adına ve yasal amaçlarla kullanılacağını taahhüt eder.
• Başka kullanıcıların hesabına yetkisiz erişim girişiminde bulunmayacağını kabul eder.
• Platformun işleyişini bozacak, aşırı yük oluşturacak veya güvenlik açığı yaratacak herhangi bir eylemde bulunmayacağını beyan eder.
• 18 yaşını doldurmuş olduğunu teyit eder; 18 yaş altı bireyler platformu kullanamaz.`,
  },
  {
    id: 3,
    title: '3. Fikri Mülkiyet',
    content: `Platform üzerindeki tüm içerik, tasarım, yazılım kodu, algoritmalar, grafikler, logolar ve marka unsurları KrediZeka Finansal Teknoloji A.Ş.'ye aittir ve Türk Ticaret Kanunu, Fikir ve Sanat Eserleri Kanunu ile ilgili uluslararası sözleşmeler kapsamında korunmaktadır.

Kullanıcılar;
• Platformu yalnızca kişisel ve ticari olmayan amaçlarla kullanabilir.
• Platform içeriğini izinsiz kopyalayamaz, dağıtamaz, çoğaltamaz veya tersine mühendislik yöntemiyle analiz edemez.
• KrediZeka markasını, logosunu veya içeriğini yazılı izin alınmaksızın üçüncü taraflarla paylaşamaz ya da ticari amaçlarla kullanamaz.`,
  },
  {
    id: 4,
    title: '4. Sorumluluk Sınırlaması',
    content: `KrediZeka, yapay zeka tabanlı risk skorlamanın doğruluğu için azami çabayı göstermekle birlikte aşağıdaki hususları beyan eder:

• Platform çıktıları (risk skoru, tavsiyeler) birer tahmin olup garanti niteliği taşımaz.
• Kullanıcının platforma girdiği yanlış veya eksik verilerden kaynaklanan hatalı sonuçlardan KrediZeka sorumlu tutulamaz.
• Kullanıcı, alınan analiz sonuçlarına dayanarak verdiği finansal kararların tüm sorumluluğunu kabul eder.
• Platform, teknik bakım, güncelleme veya mücbir sebep hallerinde geçici olarak hizmet dışı kalabilir; bu durum tazminat talebine konu olamaz.`,
  },
  {
    id: 5,
    title: '5. Hesap Güvenliği',
    content: `Hesabınızın güvenliğinden kullanıcı olarak sizin sorumluluğunuzdasınız. Aşağıdaki kurallara uymanız gerekmektedir:

• Hesap parolanızı kimseyle paylaşmayınız. KrediZeka hiçbir koşulda kullanıcıdan parolasını talep etmez.
• Parolanızın ele geçirildiğini düşündüğünüzde derhal destek@kredizeka.com adresine bildiriniz.
• Kamu bilgisayarı veya paylaşımlı cihaz kullandıktan sonra oturumunuzu kapatınız.
• Hesabınızın başkası tarafından yetkisiz kullanıldığını fark etmeniz durumunda KrediZeka'yı derhal bilgilendiriniz.
• Güvenlik ihlaline neden olabilecek davranışlar tespit edilmesi halinde KrediZeka hesabınızı geçici veya kalıcı olarak askıya alma hakkını saklı tutar.`,
  },
  {
    id: 6,
    title: '6. Değişiklikler ve Fesih',
    content: `KrediZeka, bu kullanım koşullarını önceden bildirimde bulunmaksızın değiştirme, güncelleme veya kaldırma hakkını saklı tutar.

• Koşullardaki önemli değişiklikler, kayıtlı e-posta adresi veya platform üzerinden duyuru yoluyla kullanıcılara bildirilir.
• Değişikliklerin yürürlüğe girmesinden sonra platformu kullanmaya devam etmek, güncel koşulların kabul edildiği anlamına gelir.
• KrediZeka, kullanım koşullarına aykırı davranan kullanıcıların hesabını önceden uyarı vermeksizin kapatabilir.
• Kullanıcı, hesabını istediği zaman destek@kredizeka.com adresi üzerinden kapatma talebinde bulunabilir.

Bu koşullar Türk Hukuku'na tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
  },
];

export default function KullanimKosullariPage() {
  // Açık olan accordion bölümünün id'si (null = hepsi kapalı)
  const [openId, setOpenId] = useState(1);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="min-h-screen pt-24 pb-16">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 text-amber-700 text-sm font-semibold mb-6 backdrop-blur-sm">
            <FileText className="w-4 h-4" />
            Kullanım Koşulları
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Kullanım <span className="gradient-text">Koşulları</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-3">
            KrediZeka platformunu kullanmadan önce lütfen aşağıdaki koşulları dikkatlice
            okuyunuz. Platforma erişim, bu koşulların kabul edildiği anlamına gelir.
          </p>
          <p className="text-sm text-slate-400">
            Son güncelleme: <strong>Ocak 2025</strong> — Türk Ticaret Kanunu ve Tüketici Mevzuatı uyumlu
          </p>
        </div>
      </section>

      {/* ─── ACCORDION ─── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-3">
          {sections.map(({ id, title, content }) => {
            const isOpen = openId === id;
            return (
              <div
                key={id}
                className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isOpen
                    ? 'border-amber-300 shadow-md shadow-amber-100/50'
                    : 'border-slate-200 hover:border-slate-300'
                } bg-white`}
              >
                {/* Başlık butonu */}
                <button
                  onClick={() => toggle(id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`font-bold text-base transition-colors duration-300 ${isOpen ? 'text-amber-700' : 'text-slate-900'}`}>
                    {title}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-amber-600' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* İçerik */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
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

      {/* ─── İLETİŞİM CTA ─── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Kullanım Koşulları Hakkında Sorularınız mı Var?
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Bu koşullarla ilgili herhangi bir sorunuz ya da itirazınız varsa
            müşteri destek ekibimize ulaşabilirsiniz.
          </p>
          <a
            href="mailto:destek@kredizeka.com"
            className="inline-flex items-center gap-2 text-amber-700 font-bold hover:text-amber-900 transition-colors duration-300"
          >
            <Mail className="w-4 h-4" />
            destek@kredizeka.com
          </a>
        </div>
      </section>
    </div>
  );
}
