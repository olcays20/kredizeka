/**
 * KrediZeka - Gizlilik Politikası Sayfası
 * ==========================================
 * KVKK uyumlu gizlilik politikası metnini accordion bileşeni
 * ile gösteren içerik sayfası. useState ile tek bölüm açık kalır.
 */

import { useState } from 'react';
import { Lock, ChevronDown, Shield, Mail } from 'lucide-react';

// Gizlilik politikası bölümleri
const sections = [
  {
    id: 1,
    title: '1. Veri Sorumlusu',
    content: `KrediZeka Finansal Teknoloji A.Ş. (bundan böyle "KrediZeka" olarak anılacaktır), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatını taşımaktadır. Merkezi Levent, İstanbul, Türkiye'de bulunan şirketimiz, bu politikada belirtilen esaslar çerçevesinde kişisel verilerinizi işlemektedir.

Şirket iletişim bilgileri: destek@kredizeka.com | +90 850 123 45 67`,
  },
  {
    id: 2,
    title: '2. Toplanan Kişisel Veriler',
    content: `Hizmetlerimizden yararlanmanız amacıyla aşağıdaki kişisel verilerinizi toplamaktayız:

• Kimlik Verileri: T.C. Kimlik Numarası, Ad Soyad
• İletişim Verileri: Cep telefonu numarası
• Finansal Veriler: Aylık net gelir, toplam borç miktarı, talep edilen kredi tutarı
• Mesleki Veriler: Meslek bilgisi (opsiyonel, profil güncellemesinde)
• Adres Bilgisi: İkametgâh adresi (opsiyonel, profil güncellemesinde)

Bu verilerin tamamı ya da bir kısmı, platform kayıt ve analiz süreçlerinde tarafınızca açıkça paylaşılmaktadır.`,
  },
  {
    id: 3,
    title: '3. Verilerin İşlenme Amacı',
    content: `Kişisel verileriniz aşağıdaki amaçlar doğrultusunda işlenmektedir:

• Hesap oluşturma ve kimlik doğrulama işlemlerinin gerçekleştirilmesi
• Kredi risk analizi hizmetinin sunulması ve yapay zeka modelinin çalıştırılması
• Kullanıcı profili yönetimi ve güncelleme işlemleri
• Yasal yükümlülüklerin yerine getirilmesi ve denetim süreçleri
• Hizmet kalitesinin artırılması ve müşteri deneyiminin iyileştirilmesi

Verileriniz, yukarıda belirtilen amaçların dışında kullanılmamaktadır.`,
  },
  {
    id: 4,
    title: '4. Verilerin Saklanması ve Güvenliği',
    content: `KrediZeka, kişisel verilerinizin güvenliğini sağlamak amacıyla sektörün en güncel teknik ve idari tedbirlerini uygulamaktadır:

• Şifre Güvenliği: Parolalarınız Bcrypt algoritması ile tuzlanmış (salted) hash formatında saklanır; düz metin olarak hiçbir sistemde yer almaz.
• Veritabanı Güvenliği: Tüm veriler parametreli SQL sorguları ile işlenir; SQL enjeksiyonu saldırılarına karşı tam koruma sağlanır.
• Erişim Kısıtlaması: Verilerinize yalnızca yetkilendirilmiş personel erişebilir.
• Saklama Süresi: Hesabınızı silmeniz halinde verileriniz KVKK'nın öngördüğü süreler içinde sistemden kalıcı olarak silinir.`,
  },
  {
    id: 5,
    title: '5. Üçüncü Taraflarla Paylaşım',
    content: `Kişisel verileriniz aşağıdaki koşullar dışında hiçbir üçüncü tarafla paylaşılmaz:

• Yasal Zorunluluk: Mahkeme kararı veya yetkili kamu kurumu talebi halinde, ilgili mevzuat çerçevesinde yasal mercilerle paylaşılabilir.
• Hizmet Sağlayıcılar: Sunucu altyapısı ve teknik hizmet sağlayıcılarımız, yalnızca hizmeti sunmak amacıyla ve gizlilik sözleşmesi kapsamında sınırlı veri erişimine sahiptir.
• Reklam veya Pazarlama: Kişisel verileriniz pazarlama, reklam veya üçüncü taraf profilleme amacıyla kesinlikle paylaşılmamaktadır.`,
  },
  {
    id: 6,
    title: '6. Çerezler (Cookie) Politikası',
    content: `KrediZeka platformu, oturum yönetimi ve kullanıcı deneyimini iyileştirmek amacıyla yalnızca zorunlu ve işlevsel çerezler kullanmaktadır:

• Oturum Çerezleri: Tarayıcı kapatıldığında otomatik silinen, kimlik doğrulama için kullanılan geçici çerezler.
• localStorage: T.C. No ve profil bilgileri, tarayıcınızın yerel depolama alanında şifresiz JSON formatında tutulur. Bu veriler yalnızca cihazınızda saklanır; sunucuya gönderilmez.
• Analitik Çerezler: Anonim kullanım istatistikleri için Google Analytics gibi araçlar henüz entegre edilmemiştir.

Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz; ancak zorunlu çerezlerin devre dışı bırakılması oturum açma işlevini etkileyebilir.`,
  },
  {
    id: 7,
    title: '7. Haklarınız (KVKK Madde 11)',
    content: `6698 sayılı KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:

• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme
• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
• Eksik veya yanlış işlenmiş verilerinizin düzeltilmesini isteme
• KVKK'nın 7. maddesi çerçevesinde silinmesini veya yok edilmesini isteme
• Otomatik sistemler vasıtasıyla aleyhine bir sonuç doğurması halinde buna itiraz etme
• Kanuna aykırı işleme nedeniyle zarara uğraması halinde zararın giderilmesini talep etme

Bu haklarınızı kullanmak için destek@kredizeka.com adresine yazılı başvuruda bulunabilirsiniz. Başvurularınız 30 gün içinde yanıtlanır.`,
  },
];

export default function GizlilikPolitikasiPage() {
  // Açık olan accordion bölümünün id'si (null = hepsi kapalı)
  const [openId, setOpenId] = useState(1);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="min-h-screen pt-24 pb-16">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary-50" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-slate-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 text-slate-600 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Lock className="w-4 h-4" />
            Gizlilik
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Gizlilik <span className="gradient-text">Politikası</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-3">
            Kişisel verilerinizin nasıl toplandığını, işlendiğini ve korunduğunu açıkça
            anlatmak önceliklerimizden biridir.
          </p>
          <p className="text-sm text-slate-400">
            Son güncelleme: <strong>Ocak 2025</strong> — KVKK 6698 sayılı Kanun uyumlu
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
                    ? 'border-primary-200 shadow-md shadow-primary-100/50'
                    : 'border-slate-200 hover:border-slate-300'
                } bg-white`}
              >
                {/* Başlık butonu */}
                <button
                  onClick={() => toggle(id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`font-bold text-base transition-colors duration-300 ${isOpen ? 'text-primary-700' : 'text-slate-900'}`}>
                    {title}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-primary-600' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* İçerik — yükseklik animasyonu için max-height kullanılıyor */}
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
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary-100 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Gizlilik ile İlgili Sorularınız mı Var?
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            KVKK kapsamındaki haklarınızı kullanmak veya bu politika hakkında
            bilgi almak için aşağıdaki adrese yazabilirsiniz.
          </p>
          <a
            href="mailto:destek@kredizeka.com"
            className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-800 transition-colors duration-300"
          >
            <Mail className="w-4 h-4" />
            destek@kredizeka.com
          </a>
        </div>
      </section>
    </div>
  );
}
