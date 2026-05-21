/**
 * KrediZeka - Hukuki Sayfalar Veri Kaynağı (Çift Dilli)
 * ========================================================
 * Gizlilik Politikası ve Kullanım Koşulları sayfalarının accordion
 * bölümleri burada {tr, en} formatında tutulur. Sayfalar bu veriyi
 * aktif dile göre yerelleştirerek tüketir.
 */

// ─── Gizlilik Politikası Bölümleri ──────────────────────────────────────
export const privacySections = [
  {
    id: 1,
    title: {
      tr: '1. Veri Sorumlusu',
      en: '1. Data Controller',
    },
    content: {
      tr: `KrediZeka Finansal Teknoloji A.Ş. (bundan böyle "KrediZeka" olarak anılacaktır), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatını taşımaktadır. Merkezi Levent, İstanbul, Türkiye'de bulunan şirketimiz, bu politikada belirtilen esaslar çerçevesinde kişisel verilerinizi işlemektedir.

Şirket iletişim bilgileri: kredizeka.destek@gmail.com | +90 850 123 45 67`,
      en: `KrediZeka Financial Technology Inc. (hereinafter referred to as "KrediZeka") acts as the data controller under the Personal Data Protection Law No. 6698 ("KVKK"). Our company, headquartered in Levent, Istanbul, Türkiye, processes your personal data within the framework set forth in this policy.

Company contact: kredizeka.destek@gmail.com | +90 850 123 45 67`,
    },
  },
  {
    id: 2,
    title: {
      tr: '2. Toplanan Kişisel Veriler',
      en: '2. Collected Personal Data',
    },
    content: {
      tr: `Hizmetlerimizden yararlanmanız amacıyla aşağıdaki kişisel verilerinizi toplamaktayız:

• Kimlik Verileri: T.C. Kimlik Numarası, Ad Soyad
• İletişim Verileri: Cep telefonu numarası
• Finansal Veriler: Aylık net gelir, toplam borç miktarı, talep edilen kredi tutarı
• Mesleki Veriler: Meslek bilgisi (opsiyonel, profil güncellemesinde)
• Adres Bilgisi: İkametgâh adresi (opsiyonel, profil güncellemesinde)

Bu verilerin tamamı ya da bir kısmı, platform kayıt ve analiz süreçlerinde tarafınızca açıkça paylaşılmaktadır.`,
      en: `In order to provide our services, we collect the following personal data:

• Identity Data: T.C. ID Number, Full Name
• Contact Data: Mobile phone number
• Financial Data: Monthly net income, total debt amount, requested loan amount
• Professional Data: Occupation information (optional, on profile update)
• Address Information: Residential address (optional, on profile update)

All or part of this data is shared by you explicitly during platform registration and analysis processes.`,
    },
  },
  {
    id: 3,
    title: {
      tr: '3. Verilerin İşlenme Amacı',
      en: '3. Purpose of Data Processing',
    },
    content: {
      tr: `Kişisel verileriniz aşağıdaki amaçlar doğrultusunda işlenmektedir:

• Hesap oluşturma ve kimlik doğrulama işlemlerinin gerçekleştirilmesi
• Kredi risk analizi hizmetinin sunulması ve yapay zeka modelinin çalıştırılması
• Kullanıcı profili yönetimi ve güncelleme işlemleri
• Yasal yükümlülüklerin yerine getirilmesi ve denetim süreçleri
• Hizmet kalitesinin artırılması ve müşteri deneyiminin iyileştirilmesi

Verileriniz, yukarıda belirtilen amaçların dışında kullanılmamaktadır.`,
      en: `Your personal data is processed for the following purposes:

• Account creation and identity verification operations
• Providing credit risk analysis service and running the AI model
• User profile management and update operations
• Compliance with legal obligations and audit processes
• Improving service quality and customer experience

Your data is not used for purposes other than those listed above.`,
    },
  },
  {
    id: 4,
    title: {
      tr: '4. Verilerin Saklanması ve Güvenliği',
      en: '4. Data Storage and Security',
    },
    content: {
      tr: `KrediZeka, kişisel verilerinizin güvenliğini sağlamak amacıyla sektörün en güncel teknik ve idari tedbirlerini uygulamaktadır:

• Şifre Güvenliği: Parolalarınız Bcrypt algoritması ile tuzlanmış (salted) hash formatında saklanır; düz metin olarak hiçbir sistemde yer almaz.
• Veritabanı Güvenliği: Tüm veriler parametreli SQL sorguları ile işlenir; SQL enjeksiyonu saldırılarına karşı tam koruma sağlanır.
• Erişim Kısıtlaması: Verilerinize yalnızca yetkilendirilmiş personel erişebilir.
• Saklama Süresi: Hesabınızı silmeniz halinde verileriniz KVKK'nın öngördüğü süreler içinde sistemden kalıcı olarak silinir.`,
      en: `KrediZeka applies the most up-to-date technical and administrative measures in the industry to ensure the security of your personal data:

• Password Security: Your passwords are stored in salted hash format using the Bcrypt algorithm; they are never stored as plain text anywhere.
• Database Security: All data is processed with parameterized SQL queries; full protection against SQL injection attacks is provided.
• Access Restriction: Only authorized personnel can access your data.
• Retention Period: If you delete your account, your data is permanently deleted from the system within the periods stipulated by KVKK.`,
    },
  },
  {
    id: 5,
    title: {
      tr: '5. Üçüncü Taraflarla Paylaşım',
      en: '5. Sharing with Third Parties',
    },
    content: {
      tr: `Kişisel verileriniz aşağıdaki koşullar dışında hiçbir üçüncü tarafla paylaşılmaz:

• Yasal Zorunluluk: Mahkeme kararı veya yetkili kamu kurumu talebi halinde, ilgili mevzuat çerçevesinde yasal mercilerle paylaşılabilir.
• Hizmet Sağlayıcılar: Sunucu altyapısı ve teknik hizmet sağlayıcılarımız, yalnızca hizmeti sunmak amacıyla ve gizlilik sözleşmesi kapsamında sınırlı veri erişimine sahiptir.
• Reklam veya Pazarlama: Kişisel verileriniz pazarlama, reklam veya üçüncü taraf profilleme amacıyla kesinlikle paylaşılmamaktadır.`,
      en: `Your personal data is not shared with any third party except under the following conditions:

• Legal Obligation: In the case of a court order or request from an authorized public institution, it may be shared with legal authorities within the framework of relevant legislation.
• Service Providers: Our server infrastructure and technical service providers have limited data access solely for the purpose of providing the service and under a non-disclosure agreement.
• Advertising or Marketing: Your personal data is never shared for marketing, advertising, or third-party profiling purposes.`,
    },
  },
  {
    id: 6,
    title: {
      tr: '6. Çerezler (Cookie) Politikası',
      en: '6. Cookie Policy',
    },
    content: {
      tr: `KrediZeka platformu, oturum yönetimi ve kullanıcı deneyimini iyileştirmek amacıyla yalnızca zorunlu ve işlevsel çerezler kullanmaktadır:

• Oturum Çerezleri: Tarayıcı kapatıldığında otomatik silinen, kimlik doğrulama için kullanılan geçici çerezler.
• localStorage: T.C. No ve profil bilgileri, tarayıcınızın yerel depolama alanında şifresiz JSON formatında tutulur. Bu veriler yalnızca cihazınızda saklanır; sunucuya gönderilmez.
• Analitik Çerezler: Anonim kullanım istatistikleri için Google Analytics gibi araçlar henüz entegre edilmemiştir.

Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz; ancak zorunlu çerezlerin devre dışı bırakılması oturum açma işlevini etkileyebilir.`,
      en: `The KrediZeka platform uses only essential and functional cookies for session management and to improve user experience:

• Session Cookies: Temporary cookies used for authentication, automatically deleted when the browser is closed.
• localStorage: T.C. No and profile information are kept in unencrypted JSON format in your browser's local storage. This data is stored only on your device; it is not sent to the server.
• Analytics Cookies: Tools such as Google Analytics for anonymous usage statistics have not yet been integrated.

You can manage cookies from your browser settings; however, disabling essential cookies may affect the sign-in functionality.`,
    },
  },
  {
    id: 7,
    title: {
      tr: '7. Haklarınız (KVKK Madde 11)',
      en: '7. Your Rights (KVKK Article 11)',
    },
    content: {
      tr: `6698 sayılı KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:

• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme
• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
• Eksik veya yanlış işlenmiş verilerinizin düzeltilmesini isteme
• KVKK'nın 7. maddesi çerçevesinde silinmesini veya yok edilmesini isteme
• Otomatik sistemler vasıtasıyla aleyhine bir sonuç doğurması halinde buna itiraz etme
• Kanuna aykırı işleme nedeniyle zarara uğraması halinde zararın giderilmesini talep etme

Bu haklarınızı kullanmak için kredizeka.destek@gmail.com adresine yazılı başvuruda bulunabilirsiniz. Başvurularınız 30 gün içinde yanıtlanır.`,
      en: `Under Article 11 of KVKK No. 6698, you have the following rights:

• Learn whether your personal data is being processed
• Request information if it has been processed
• Learn the purpose of processing and whether it is used in accordance with its purpose
• Know the third parties to whom it has been transferred domestically or abroad
• Request correction of incomplete or incorrectly processed data
• Request deletion or destruction within the framework of KVKK Article 7
• Object if it produces an unfavorable result against you via automated systems
• Request compensation if you suffer damage due to unlawful processing

To exercise these rights, you can apply in writing to kredizeka.destek@gmail.com. Your applications will be answered within 30 days.`,
    },
  },
];

// ─── Kullanım Koşulları Bölümleri ────────────────────────────────────────
export const termsSections = [
  {
    id: 1,
    title: {
      tr: '1. Hizmetlerin Kapsamı',
      en: '1. Scope of Services',
    },
    content: {
      tr: `KrediZeka Finansal Teknoloji A.Ş. ("KrediZeka") tarafından sunulan platform, kullanıcılara aşağıdaki hizmetleri sunan bir finansal teknoloji danışmanlık platformudur:

• Yapay zeka destekli kredi risk analizi ve skorlama
• Kişiselleştirilmiş finansal tavsiyeler
• Kullanıcı profili yönetimi (meslek, adres, iletişim bilgileri)
• Borç-gelir ve kredi-gelir oranı hesaplamaları

Platform yalnızca bilgilendirme amaçlı olup kesin kredi kararı vermemektedir. Sunulan skorlar ve tavsiyeler, olası senaryoları modellemek için tasarlanmış tahminsel değerlendirmelerdir; resmi bir kredi başvurusu ya da bankacılık hizmeti niteliği taşımaz.`,
      en: `The platform offered by KrediZeka Financial Technology Inc. ("KrediZeka") is a financial technology consulting platform that offers users the following services:

• AI-powered credit risk analysis and scoring
• Personalized financial recommendations
• User profile management (occupation, address, contact information)
• Debt-to-income and loan-to-income ratio calculations

The platform is for informational purposes only and does not make definitive credit decisions. The scores and recommendations provided are predictive assessments designed to model possible scenarios; they do not constitute an official loan application or banking service.`,
    },
  },
  {
    id: 2,
    title: {
      tr: '2. Kullanıcı Yükümlülükleri',
      en: '2. User Obligations',
    },
    content: {
      tr: `Platform hizmetlerinden yararlanan her kullanıcı aşağıdaki yükümlülükleri kabul etmiş sayılır:

• Platforma kayıt sırasında verilen bilgilerin (T.C. No, Ad Soyad, Telefon) doğru, güncel ve eksiksiz olduğunu beyan eder.
• Hesabın yalnızca kendi adına ve yasal amaçlarla kullanılacağını taahhüt eder.
• Başka kullanıcıların hesabına yetkisiz erişim girişiminde bulunmayacağını kabul eder.
• Platformun işleyişini bozacak, aşırı yük oluşturacak veya güvenlik açığı yaratacak herhangi bir eylemde bulunmayacağını beyan eder.
• 18 yaşını doldurmuş olduğunu teyit eder; 18 yaş altı bireyler platformu kullanamaz.`,
      en: `Every user who benefits from the platform services is deemed to have accepted the following obligations:

• Declares that the information provided during registration (T.C. No, Full Name, Phone) is accurate, up-to-date, and complete.
• Commits to use the account only in their own name and for legal purposes.
• Agrees not to attempt unauthorized access to other users' accounts.
• Declares that they will not take any action that would disrupt the platform's operation, cause excessive load, or create security vulnerabilities.
• Confirms that they are at least 18 years old; individuals under 18 cannot use the platform.`,
    },
  },
  {
    id: 3,
    title: {
      tr: '3. Fikri Mülkiyet',
      en: '3. Intellectual Property',
    },
    content: {
      tr: `Platform üzerindeki tüm içerik, tasarım, yazılım kodu, algoritmalar, grafikler, logolar ve marka unsurları KrediZeka Finansal Teknoloji A.Ş.'ye aittir ve Türk Ticaret Kanunu, Fikir ve Sanat Eserleri Kanunu ile ilgili uluslararası sözleşmeler kapsamında korunmaktadır.

Kullanıcılar;
• Platformu yalnızca kişisel ve ticari olmayan amaçlarla kullanabilir.
• Platform içeriğini izinsiz kopyalayamaz, dağıtamaz, çoğaltamaz veya tersine mühendislik yöntemiyle analiz edemez.
• KrediZeka markasını, logosunu veya içeriğini yazılı izin alınmaksızın üçüncü taraflarla paylaşamaz ya da ticari amaçlarla kullanamaz.`,
      en: `All content, designs, software code, algorithms, graphics, logos, and brand elements on the platform belong to KrediZeka Financial Technology Inc. and are protected under the Turkish Commercial Code, Intellectual and Artistic Works Law, and relevant international agreements.

Users;
• May use the platform only for personal and non-commercial purposes.
• May not copy, distribute, reproduce, or reverse-engineer the platform content without permission.
• May not share the KrediZeka brand, logo, or content with third parties or use them for commercial purposes without written permission.`,
    },
  },
  {
    id: 4,
    title: {
      tr: '4. Sorumluluk Sınırlaması',
      en: '4. Limitation of Liability',
    },
    content: {
      tr: `KrediZeka, yapay zeka tabanlı risk skorlamanın doğruluğu için azami çabayı göstermekle birlikte aşağıdaki hususları beyan eder:

• Platform çıktıları (risk skoru, tavsiyeler) birer tahmin olup garanti niteliği taşımaz.
• Kullanıcının platforma girdiği yanlış veya eksik verilerden kaynaklanan hatalı sonuçlardan KrediZeka sorumlu tutulamaz.
• Kullanıcı, alınan analiz sonuçlarına dayanarak verdiği finansal kararların tüm sorumluluğunu kabul eder.
• Platform, teknik bakım, güncelleme veya mücbir sebep hallerinde geçici olarak hizmet dışı kalabilir; bu durum tazminat talebine konu olamaz.`,
      en: `While KrediZeka makes its best effort to ensure the accuracy of AI-based risk scoring, it declares the following:

• Platform outputs (risk score, recommendations) are predictions and do not constitute guarantees.
• KrediZeka cannot be held responsible for erroneous results arising from incorrect or incomplete data entered by the user.
• The user accepts full responsibility for the financial decisions made based on the analysis results.
• The platform may temporarily be out of service due to technical maintenance, updates, or force majeure; this cannot be subject to compensation claims.`,
    },
  },
  {
    id: 5,
    title: {
      tr: '5. Hesap Güvenliği',
      en: '5. Account Security',
    },
    content: {
      tr: `Hesabınızın güvenliğinden kullanıcı olarak sizin sorumluluğunuzdasınız. Aşağıdaki kurallara uymanız gerekmektedir:

• Hesap parolanızı kimseyle paylaşmayınız. KrediZeka hiçbir koşulda kullanıcıdan parolasını talep etmez.
• Parolanızın ele geçirildiğini düşündüğünüzde derhal kredizeka.destek@gmail.com adresine bildiriniz.
• Kamu bilgisayarı veya paylaşımlı cihaz kullandıktan sonra oturumunuzu kapatınız.
• Hesabınızın başkası tarafından yetkisiz kullanıldığını fark etmeniz durumunda KrediZeka'yı derhal bilgilendiriniz.
• Güvenlik ihlaline neden olabilecek davranışlar tespit edilmesi halinde KrediZeka hesabınızı geçici veya kalıcı olarak askıya alma hakkını saklı tutar.`,
      en: `You as the user are responsible for the security of your account. You must comply with the following rules:

• Do not share your account password with anyone. KrediZeka never requests your password under any circumstances.
• If you suspect that your password has been compromised, immediately notify kredizeka.destek@gmail.com.
• Close your session after using a public computer or shared device.
• If you notice unauthorized use of your account by someone else, immediately inform KrediZeka.
• KrediZeka reserves the right to temporarily or permanently suspend your account if behaviors that may cause security breaches are detected.`,
    },
  },
  {
    id: 6,
    title: {
      tr: '6. Değişiklikler ve Fesih',
      en: '6. Changes and Termination',
    },
    content: {
      tr: `KrediZeka, bu kullanım koşullarını önceden bildirimde bulunmaksızın değiştirme, güncelleme veya kaldırma hakkını saklı tutar.

• Koşullardaki önemli değişiklikler, kayıtlı e-posta adresi veya platform üzerinden duyuru yoluyla kullanıcılara bildirilir.
• Değişikliklerin yürürlüğe girmesinden sonra platformu kullanmaya devam etmek, güncel koşulların kabul edildiği anlamına gelir.
• KrediZeka, kullanım koşullarına aykırı davranan kullanıcıların hesabını önceden uyarı vermeksizin kapatabilir.
• Kullanıcı, hesabını istediği zaman kredizeka.destek@gmail.com adresi üzerinden kapatma talebinde bulunabilir.

Bu koşullar Türk Hukuku'na tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
      en: `KrediZeka reserves the right to change, update, or remove these terms of use without prior notice.

• Significant changes to the terms are notified to users via registered email address or through announcements on the platform.
• Continuing to use the platform after the changes take effect means acceptance of the current terms.
• KrediZeka may close the account of users who act contrary to the terms of use without prior warning.
• The user may request to close their account at any time via kredizeka.destek@gmail.com.

These terms are subject to Turkish Law. Istanbul Courts and Enforcement Offices have jurisdiction in disputes.`,
    },
  },
];

/**
 * Bir bölümü seçili dile göre düz objeye dönüştürür.
 */
export function localizeSection(section, lang = 'tr') {
  if (!section) return null;
  const l = lang === 'en' ? 'en' : 'tr';
  return {
    id: section.id,
    title: section.title?.[l] ?? section.title?.tr ?? '',
    content: section.content?.[l] ?? section.content?.tr ?? '',
  };
}
