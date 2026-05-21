/**
 * KrediZeka - Kurgusal Basın & Haber Verileri (Çift Dilli)
 * ===========================================================
 * Basın Odası ve Haberler sayfalarının haber kaynağı.
 *
 * Yapı (çift dilli):
 *   - id, date, monthLabel, tag, tagKey, tagColor → tek değer
 *   - title, summary, content → { tr, en } objesi
 *
 * ÖNEMLİ NOT:
 * Tüm haberler kurgusaldır ve KrediZeka'nın kendi teknolojik başarılarına
 * odaklanır. Gerçek banka, kurum, devlet dairesi veya kişi ismi içermez.
 */

export const news = [
  {
    id: 'aciklanabilir-yz-shap-2026',
    date: '19 Mayıs 2026',
    monthLabel: 'Mayıs 2026',
    tag: 'Teknoloji',
    tagKey: 'tag_technology',
    tagColor: 'bg-blue-100 text-blue-700',
    title: {
      tr: 'KrediZeka Açıklanabilir Yapay Zekâ (SHAP) Özelliğini Yayına Aldı',
      en: 'KrediZeka Launches Explainable AI (SHAP) Feature',
    },
    summary: {
      tr: 'KrediZeka, risk skorunun arkasındaki kararı şeffaf biçimde gösteren SHAP tabanlı "Etki Grafiği" özelliğini tüm kullanıcılara açtı. Artık her analizde hangi faktörün ne yönde etki ettiği görülebiliyor.',
      en: 'KrediZeka rolled out its SHAP-based "Impact Chart" feature, which transparently shows the decision behind every risk score. Users can now see which factor influenced their score and in which direction.',
    },
    content: {
      tr: [
        'KrediZeka, kullanıcıların en çok talep ettiği özelliklerden biri olan açıklanabilir yapay zekâyı (XAI) platforma entegre ettiğini duyurdu. Yeni "Etki Grafiği", her risk analizinin ardından devreye giriyor.',
        'SHAP (SHapley Additive exPlanations) yöntemiyle hesaplanan grafik; gelir, kredi geçmişi, borç-gelir oranı gibi faktörlerin skoru ne kadar ve hangi yönde etkilediğini yatay bir bar grafikle gösteriyor. Olumlu etkiler yeşil, olumsuz etkiler kırmızı renkle ayrılıyor.',
        'Şirketin ürün ekibinden bir yetkili, "Kullanıcılar yıllardır kredi kararlarının bir kara kutu olmasından şikâyetçiydi. Artık skorunuzun neden o seviyede olduğunu net biçimde görebiliyorsunuz." açıklamasını yaptı.',
        'Özellik, hem masaüstü hem mobil arayüzde ücretsiz olarak kullanılabiliyor. KrediZeka önümüzdeki dönemde bu açıklamaları sesli olarak da sunmayı planlıyor.',
      ],
      en: [
        'KrediZeka announced that it has integrated explainable AI (XAI) — one of its most requested features — into the platform. The new "Impact Chart" appears after every risk analysis.',
        'Computed via SHAP (SHapley Additive exPlanations), the chart shows how much and in which direction factors such as income, credit history, and debt-to-income ratio influence the score, using a horizontal bar chart. Positive impacts are shown in green, negative ones in red.',
        'A representative from the company\'s product team said: "Users have complained for years that credit decisions are a black box. Now you can clearly see why your score is at that level."',
        'The feature is available free of charge on both desktop and mobile interfaces. KrediZeka plans to also offer these explanations via voice in the upcoming period.',
      ],
    },
  },
  {
    id: 'xgboost-model-gecisi-2026',
    date: '6 Mayıs 2026',
    monthLabel: 'Mayıs 2026',
    tag: 'Teknoloji',
    tagKey: 'tag_technology',
    tagColor: 'bg-blue-100 text-blue-700',
    title: {
      tr: 'Risk Modeli XGBoost\'a Taşındı: %98.75 Doğruluk',
      en: 'Risk Model Migrated to XGBoost: 98.75% Accuracy',
    },
    summary: {
      tr: 'KrediZeka, kredi risk skorlama modelini gradient boosting tabanlı XGBoost algoritmasına taşıdı. Yeni model %98.75 doğruluk ve 0.99 ROC AUC değeriyle öncekini geride bıraktı.',
      en: 'KrediZeka migrated its credit risk scoring model to the gradient boosting-based XGBoost algorithm. The new model surpassed its predecessor with 98.75% accuracy and a 0.99 ROC AUC.',
    },
    content: {
      tr: [
        'KrediZeka, risk skorlama motorunun kalbindeki makine öğrenmesi modelini yeniledi. Önceki Random Forest tabanlı model, finans sektörünün altın standardı sayılan XGBoost ile değiştirildi.',
        'Yapılan testlerde yeni model %98.75 doğruluk skoruna ve 0.99 ROC AUC değerine ulaştı. Model, GridSearchCV ile hiperparametre optimizasyonundan geçirilerek en uygun ayarlarla eğitildi.',
        'Yeni modelin en güçlü öngörü faktörleri sırasıyla kredi geçmişi, yaş ve borç-gelir oranı olarak belirlendi. Bu faktörler, kullanıcılara sunulan açıklamalarda da öne çıkıyor.',
        'Model güncellemesi kullanıcı deneyimine yansımayan bir altyapı geçişi olarak gerçekleştirildi; mevcut kullanıcıların ek bir işlem yapmasına gerek kalmadı.',
      ],
      en: [
        'KrediZeka renewed the machine learning model at the heart of its risk scoring engine. The previous Random Forest-based model was replaced with XGBoost, considered the gold standard of the finance industry.',
        'In tests, the new model reached a 98.75% accuracy score and a 0.99 ROC AUC value. The model was trained with optimal settings after hyperparameter optimization via GridSearchCV.',
        'The strongest predictive factors of the new model were identified as credit history, age, and debt-to-income ratio, respectively. These factors also stand out in the explanations presented to users.',
        'The model update was carried out as an infrastructure migration not reflected in the user experience; existing users did not need to take any additional action.',
      ],
    },
  },
  {
    id: 'karanlik-tema-erisim-2026',
    date: '28 Nisan 2026',
    monthLabel: 'Nisan 2026',
    tag: 'Topluluk',
    tagKey: 'tag_community',
    tagColor: 'bg-amber-100 text-amber-700',
    title: {
      tr: 'Karanlık Tema ve Çift Dil Desteği Kullanıma Sunuldu',
      en: 'Dark Mode and Bilingual Support Now Available',
    },
    summary: {
      tr: 'KrediZeka platformu, kullanıcı deneyimini iyileştiren iki büyük güncelleme aldı: göz yormayan karanlık tema ve Türkçe-İngilizce tam çeviri desteği.',
      en: 'The KrediZeka platform received two major updates that improve user experience: an eye-friendly dark theme and full Turkish-English translation support.',
    },
    content: {
      tr: [
        'KrediZeka, kullanıcılarından gelen geri bildirimler doğrultusunda iki yeni özelliği aynı anda devreye aldı. Artık platform, karanlık tema ile gece kullanımında gözleri yormuyor.',
        'Karanlık tema, navigasyon çubuğundaki güneş/ay simgesine tek tıkla etkinleştirilebiliyor. Kullanıcının tercihi tarayıcıda saklanıyor ve sonraki ziyaretlerde otomatik uygulanıyor. Sistem ayrıca cihazın işletim sistemi tercihini de algılayabiliyor.',
        'İkinci büyük yenilik ise çift dil desteği. Platformun tüm arayüzü, haberleri ve hukuki metinleri artık Türkçe ve İngilizce olarak sunuluyor. Dil değişimi anlık olarak gerçekleşiyor.',
        'Şirket, bu güncellemelerin erişilebilirlik yol haritasının ilk adımı olduğunu, önümüzdeki dönemde ekran okuyucu uyumluluğu üzerinde çalışılacağını belirtti.',
      ],
      en: [
        'KrediZeka rolled out two new features simultaneously, in line with feedback from its users. The platform now no longer strains the eyes during nighttime use thanks to the dark theme.',
        'The dark theme can be activated with a single click on the sun/moon icon in the navigation bar. The user\'s preference is stored in the browser and applied automatically on subsequent visits. The system can also detect the device\'s operating system preference.',
        'The second major innovation is bilingual support. The platform\'s entire interface, news, and legal texts are now available in both Turkish and English. Language switching happens instantly.',
        'The company stated that these updates are the first step of its accessibility roadmap, and that screen reader compatibility will be worked on in the upcoming period.',
      ],
    },
  },
  {
    id: 'docker-altyapi-2026',
    date: '14 Nisan 2026',
    monthLabel: 'Nisan 2026',
    tag: 'Teknoloji',
    tagKey: 'tag_technology',
    tagColor: 'bg-blue-100 text-blue-700',
    title: {
      tr: 'Altyapı Konteyner Mimarisine ve PostgreSQL\'e Taşındı',
      en: 'Infrastructure Migrated to Container Architecture and PostgreSQL',
    },
    summary: {
      tr: 'KrediZeka, tüm sistemini Docker konteyner mimarisine ve kurumsal PostgreSQL veritabanına taşıdı. Bu geçiş, platformun ölçeklenebilirliğini ve kararlılığını önemli ölçüde artırdı.',
      en: 'KrediZeka migrated its entire system to Docker container architecture and an enterprise-grade PostgreSQL database. This transition significantly improved the platform\'s scalability and stability.',
    },
    content: {
      tr: [
        'KrediZeka mühendislik ekibi, platformun teknik altyapısında kapsamlı bir modernizasyon gerçekleştirdiğini duyurdu. Sistem artık tamamen konteyner tabanlı (Docker) bir mimaride çalışıyor.',
        'Veritabanı katmanı da hafif dosya tabanlı bir çözümden, kurumsal düzeyde kararlılık sunan PostgreSQL\'e taşındı. Bu sayede eş zamanlı kullanıcı sayısı arttığında bile performans kaybı yaşanmıyor.',
        'Yeni mimari, geliştirme ve canlı ortam arasındaki farkları ortadan kaldırarak hataların erken yakalanmasını sağlıyor. Ayrıca yeni özelliklerin yayına alınma süresi belirgin biçimde kısaldı.',
        'Şirket, bu altyapı yatırımının önümüzdeki dönemde planlanan yüksek trafikli özellikler için sağlam bir temel oluşturduğunu vurguladı.',
      ],
      en: [
        'The KrediZeka engineering team announced a comprehensive modernization of the platform\'s technical infrastructure. The system now runs entirely on a container-based (Docker) architecture.',
        'The database layer was also migrated from a lightweight file-based solution to PostgreSQL, which offers enterprise-grade stability. As a result, there is no performance loss even when the number of concurrent users increases.',
        'The new architecture eliminates differences between the development and production environments, enabling errors to be caught early. The time to release new features has also been noticeably shortened.',
        'The company emphasized that this infrastructure investment establishes a solid foundation for the high-traffic features planned for the upcoming period.',
      ],
    },
  },
  {
    id: 'pdf-rapor-ozelligi-2026',
    date: '25 Mart 2026',
    monthLabel: 'Mart 2026',
    tag: 'Topluluk',
    tagKey: 'tag_community',
    tagColor: 'bg-amber-100 text-amber-700',
    title: {
      tr: 'Risk Analizleri Artık PDF Rapor Olarak İndirilebiliyor',
      en: 'Risk Analyses Can Now Be Downloaded as PDF Reports',
    },
    summary: {
      tr: 'KrediZeka kullanıcıları, yaptıkları risk analizinin sonucunu skor, grafikler ve yapay zekâ tavsiyesi dahil olmak üzere resmi bir PDF belgesi olarak bilgisayarlarına indirebiliyor.',
      en: 'KrediZeka users can download the result of their risk analysis — including the score, charts, and AI recommendation — to their computers as an official PDF document.',
    },
    content: {
      tr: [
        'KrediZeka, analiz sonuçlarının paylaşılmasını ve arşivlenmesini kolaylaştıran yeni bir özelliği hizmete aldı. Kullanıcılar artık risk analizi sonucunu tek tıkla PDF olarak indirebiliyor.',
        'İndirilen rapor; kredi onaylanma skorunu, borç-gelir ve kredi-gelir oranlarını, finansal dağılım grafiğini ve yapay zekâ tavsiyesini yüksek çözünürlükte içeriyor. Belge A4 formatında düzenleniyor.',
        'Bu özellik özellikle finansal danışmanlarına veya aile bireylerine durumlarını göstermek isteyen kullanıcılar tarafından talep edilmişti.',
        'PDF oluşturma işlemi tamamen kullanıcının tarayıcısında gerçekleşiyor; herhangi bir veri sunucuya gönderilmiyor. Bu da gizlilik açısından ek bir güvence sağlıyor.',
      ],
      en: [
        'KrediZeka launched a new feature that makes it easier to share and archive analysis results. Users can now download their risk analysis result as a PDF with a single click.',
        'The downloaded report includes the credit approval score, debt-to-income and loan-to-income ratios, the financial breakdown chart, and the AI recommendation in high resolution. The document is formatted in A4 size.',
        'This feature was particularly requested by users who want to show their situation to their financial advisors or family members.',
        'The PDF generation process takes place entirely in the user\'s browser; no data is sent to the server. This provides an additional guarantee in terms of privacy.',
      ],
    },
  },
  {
    id: 'guvenlik-rate-limit-2026',
    date: '10 Mart 2026',
    monthLabel: 'Mart 2026',
    tag: 'Güvenlik',
    tagKey: 'tag_security',
    tagColor: 'bg-slate-100 text-slate-700',
    title: {
      tr: 'Hesap Güvenliği İçin Yeni Koruma Katmanları Eklendi',
      en: 'New Protection Layers Added for Account Security',
    },
    summary: {
      tr: 'KrediZeka, kötü niyetli erişim denemelerine karşı IP tabanlı istek sınırlandırması ve gelişmiş şifre koruması içeren yeni güvenlik katmanlarını devreye aldı.',
      en: 'KrediZeka activated new security layers, including IP-based rate limiting and enhanced password protection against malicious access attempts.',
    },
    content: {
      tr: [
        'KrediZeka, kullanıcı hesaplarının güvenliğini artırmak amacıyla bir dizi yeni koruma mekanizmasını hizmete aldı. Güncelleme, özellikle otomatik saldırılara karşı platformu güçlendiriyor.',
        'Yeni sistemde giriş ve kayıt işlemleri için IP tabanlı istek sınırı uygulanıyor. Belirli bir süre içinde fazla sayıda deneme yapılması durumunda işlem geçici olarak engelleniyor — bu, kaba kuvvet (brute-force) saldırılarını etkisiz hale getiriyor.',
        'Parolalar, endüstri standardı Bcrypt algoritmasıyla benzersiz tuz (salt) eklenerek saklanmaya devam ediyor. Hiçbir parola düz metin olarak hiçbir sistemde yer almıyor.',
        'Şirketin güvenlik ekibi, bu güncellemelerin yıllık güvenlik yol haritasının parçası olduğunu ve sızma testlerinin düzenli olarak sürdürüleceğini belirtti.',
      ],
      en: [
        'KrediZeka activated a series of new protection mechanisms to enhance the security of user accounts. The update strengthens the platform especially against automated attacks.',
        'In the new system, IP-based request limits are applied for login and registration operations. If too many attempts are made within a certain period, the operation is temporarily blocked — this neutralizes brute-force attacks.',
        'Passwords continue to be stored with a unique salt added using the industry-standard Bcrypt algorithm. No password is stored as plaintext on any system.',
        'The company\'s security team stated that these updates are part of the annual security roadmap and that penetration tests will be conducted regularly.',
      ],
    },
  },
  {
    id: 'yonetici-paneli-2026',
    date: '22 Şubat 2026',
    monthLabel: 'Şubat 2026',
    tag: 'Teknoloji',
    tagKey: 'tag_technology',
    tagColor: 'bg-blue-100 text-blue-700',
    title: {
      tr: 'Kurumsal Yönetici Paneli ve Rol Tabanlı Erişim Devrede',
      en: 'Enterprise Admin Dashboard and Role-Based Access Now Live',
    },
    summary: {
      tr: 'KrediZeka, platform operasyonlarını izlemek için canlı istatistikler sunan bir yönetici paneli ve rol tabanlı erişim kontrolü (RBAC) mimarisini hayata geçirdi.',
      en: 'KrediZeka introduced an admin dashboard with live statistics for monitoring platform operations, along with a role-based access control (RBAC) architecture.',
    },
    content: {
      tr: [
        'KrediZeka, platformun operasyonel yönetimini güçlendiren yeni bir yönetici paneli geliştirdiğini duyurdu. Panel, sisteme yalnızca yetkili yönetici hesaplarının erişebildiği özel bir alanda yer alıyor.',
        'Yönetici paneli; toplam kullanıcı sayısı, son 24 saat ve 7 gün içindeki kayıtlar, profil tamamlama oranları gibi sekiz farklı performans göstergesini (KPI) gerçek zamanlı olarak sunuyor.',
        'Bu güncellemeyle birlikte platform, rol tabanlı erişim kontrolü (RBAC) mimarisine geçti. Artık kullanıcılar normal kullanıcı ve yönetici olmak üzere farklı yetki seviyelerine sahip olabiliyor.',
        'Şirket, panelin önümüzdeki sürümlerde analiz hacmi grafikleri ve detaylı kullanıcı segmentasyonu ile genişletileceğini belirtti.',
      ],
      en: [
        'KrediZeka announced the development of a new admin dashboard that strengthens the platform\'s operational management. The panel is located in a dedicated area accessible only to authorized administrator accounts.',
        'The admin dashboard presents eight different performance indicators (KPIs) in real time, such as total user count, registrations in the last 24 hours and 7 days, and profile completion rates.',
        'With this update, the platform transitioned to a role-based access control (RBAC) architecture. Users can now have different authorization levels: regular user and administrator.',
        'The company stated that the panel will be expanded in future versions with analysis volume charts and detailed user segmentation.',
      ],
    },
  },
  {
    id: 'kullanici-buyume-2026',
    date: '8 Şubat 2026',
    monthLabel: 'Şubat 2026',
    tag: 'Büyüme',
    tagKey: 'tag_growth',
    tagColor: 'bg-pink-100 text-pink-700',
    title: {
      tr: 'KrediZeka Kullanıcı Tabanını Hızla Büyütüyor',
      en: 'KrediZeka Rapidly Grows Its User Base',
    },
    summary: {
      tr: 'KrediZeka, hizmete girişinden bu yana istikrarlı bir büyüme yakaladığını ve yapılan toplam risk analizi sayısının milyonlarla ifade edilen seviyelere ulaştığını açıkladı.',
      en: 'KrediZeka announced that it has achieved steady growth since its launch, with the total number of risk analyses performed reaching levels expressed in millions.',
    },
    content: {
      tr: [
        'KrediZeka, kullanıcı tabanının düzenli olarak büyüdüğünü ve platformun finansal teknoloji alanında giderek daha fazla kişi tarafından tercih edildiğini duyurdu.',
        'Şirket verilerine göre kullanıcılar, kredi başvurusu yapmadan önce platformu bir ön değerlendirme aracı olarak kullanıyor. Bir kullanıcı ortalamada birden fazla senaryo deneyerek farklı kredi tutarları için risklerini karşılaştırıyor.',
        'Büyümenin ardındaki en önemli etkenlerden biri, kullanıcıların platformu çevrelerine tavsiye etmesi. Şirket, organik büyümenin reklam harcamalarından daha güçlü bir kanal olduğunu vurguladı.',
        'KrediZeka, artan kullanıcı ilgisine paralel olarak altyapı kapasitesini önceden genişlettiğini ve hizmet kalitesinde herhangi bir düşüş yaşanmadığını belirtti.',
      ],
      en: [
        'KrediZeka announced that its user base is growing steadily and that the platform is increasingly preferred by more people in the field of financial technology.',
        'According to company data, users use the platform as a pre-assessment tool before applying for a loan. On average, a user tries multiple scenarios, comparing their risks for different loan amounts.',
        'One of the most important factors behind the growth is users recommending the platform to those around them. The company emphasized that organic growth is a stronger channel than advertising spend.',
        'KrediZeka stated that it has expanded its infrastructure capacity in advance in parallel with the increasing user interest, and that there has been no decline in service quality.',
      ],
    },
  },
];

/**
 * Bir haber objesinin çift dilli alanlarını seçili dile göre düzleştirir.
 */
export function localizeNews(item, lang = 'tr') {
  if (!item) return null;
  const l = lang === 'en' ? 'en' : 'tr';
  return {
    ...item,
    title: item.title?.[l] ?? item.title?.tr ?? '',
    summary: item.summary?.[l] ?? item.summary?.tr ?? '',
    content: item.content?.[l] ?? item.content?.tr ?? [],
  };
}

/**
 * Belirli bir haberi id ile bulup yerelleştirir.
 */
export function findNewsById(id, lang = 'tr') {
  const item = news.find((n) => n.id === id);
  return localizeNews(item, lang);
}
