/**
 * KrediZeka - Kurgusal Basın & Haber Verileri (Çift Dilli)
 * ===========================================================
 * Bu dosya, Basın Odası ve Haberler sayfalarında kullanılan tüm haber
 * verilerini tek bir kaynaktan sağlar.
 *
 * Yapı (çift dilli içerik):
 *   - id, date, monthLabel, tag, tagColor, tagKey → tek değer
 *   - title, summary, content → { tr, en } objesi olarak çift dilde tutulur
 *
 * Yardımcı fonksiyon localizeNews(item, lang), bir haberi seçilen dile
 * göre düz objeye dönüştürür (kullanım: tüketici bileşenlerde t() ile uyumlu).
 *
 * ÖNEMLİ NOT:
 * Tüm haberler kurgusaldır ve KrediZeka'nın kendi teknolojik başarılarına
 * odaklanır. Gerçek banka, kurum, devlet dairesi veya kişi ismi içermez.
 */

export const news = [
  {
    id: 'yeni-yz-altyapisi-2026',
    date: '12 Mayıs 2026',
    monthLabel: 'Mayıs 2026',
    tag: 'Teknoloji',
    tagKey: 'tag_technology',
    tagColor: 'bg-blue-100 text-blue-700',
    title: {
      tr: 'KrediZeka, Yeni Nesil Yapay Zekâ Altyapısını Duyurdu',
      en: 'KrediZeka Announces Next-Generation AI Infrastructure',
    },
    summary: {
      tr: 'KrediZeka, kredi risk skorlama hızını 3 kat artıran yeni nesil yapay zekâ altyapısını tanıttı. Yeni sistem, kullanıcıların finansal verilerini saniyenin onda biri içinde analiz ediyor.',
      en: 'KrediZeka unveiled its next-generation AI infrastructure that triples credit risk scoring speed. The new system analyzes users\' financial data in a tenth of a second.',
    },
    content: {
      tr: [
        'KrediZeka, Ar-Ge ekibinin son 14 ay boyunca üzerinde çalıştığı yeni nesil yapay zekâ altyapısını resmi olarak hizmete aldığını duyurdu. Yeni altyapı; aynı kalitede risk değerlendirmesini, önceki sürüme kıyasla yaklaşık 3 kat daha hızlı sunabiliyor.',
        'Şirketin baş teknoloji sorumlusu (CTO), yeni altyapının yalnızca hız değil aynı zamanda enerji verimliliği konusunda da önemli bir adım olduğunu vurguladı. Yeni model, eski sürüme göre işlem başına %42 daha az hesaplama kaynağı tüketiyor.',
        'KrediZeka kullanıcıları, yeni altyapıdan otomatik olarak yararlanmaya başladı. Sistem değişikliği şeffaf bir şekilde gerçekleştirildiği için kullanıcıların ek bir işlem yapmasına gerek bulunmuyor.',
        'Şirket önümüzdeki çeyrekte yapay zekâ altyapısının açıklanabilirlik (explainability) modülünü de devreye alacağını duyurdu. Bu modül sayesinde kullanıcılar, aldıkları risk skorunun arkasındaki kararı oluşturan faktörleri tek tek görebilecek.',
      ],
      en: [
        'KrediZeka announced that the next-generation AI infrastructure its R&D team has been working on for the past 14 months has officially gone live. The new infrastructure can deliver the same quality risk assessment about 3 times faster than the previous version.',
        'The company\'s Chief Technology Officer (CTO) emphasized that the new infrastructure is an important step not only in speed but also in energy efficiency. The new model consumes 42% less computing resources per transaction compared to the older version.',
        'KrediZeka users automatically began benefiting from the new infrastructure. Because the system change was carried out transparently, users do not need to take any additional action.',
        'The company also announced that it will roll out an explainability module of the AI infrastructure in the next quarter. With this module, users will be able to see, one by one, the factors that drive the decision behind their risk score.',
      ],
    },
  },
  {
    id: 'kullanici-deneyimi-odul-2026',
    date: '24 Nisan 2026',
    monthLabel: 'Nisan 2026',
    tag: 'Ödül',
    tagKey: 'tag_award',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: {
      tr: 'KrediZeka, Yılın En İyi Kullanıcı Deneyimi Ödülünü Kazandı',
      en: 'KrediZeka Wins Best User Experience Award of the Year',
    },
    summary: {
      tr: 'KrediZeka platformu, finans teknolojileri kategorisinde "Yılın En İyi Kullanıcı Deneyimi" ödülünü kazandı. Jürinin değerlendirmesinde sade arayüz ve anlaşılır finansal terminoloji belirleyici oldu.',
      en: 'The KrediZeka platform won the "Best User Experience of the Year" award in the financial technology category. The jury\'s evaluation was decided by its clean interface and clear financial terminology.',
    },
    content: {
      tr: [
        'KrediZeka, uluslararası bir kullanıcı deneyimi tasarım yarışmasında "Yılın En İyi Finansal Teknoloji Arayüzü" ödülüne layık görüldü. Ödül töreni, dijital olarak gerçekleştirildi ve KrediZeka tasarım ekibi kendi stüdyosundan canlı yayınla katıldı.',
        'Jüri değerlendirmesinde özellikle Findeks benzeri renkli skor görselleştirmesinin, kullanıcıların finansal durumlarını ilk bakışta anlamasını kolaylaştırdığı vurgulandı. Ayrıca platformun teknik finans terimlerini sade Türkçe açıklamalarla destekleme yaklaşımı da öne çıktı.',
        'KrediZeka ürün müdürü, ödülün ekibin temel felsefesini doğruladığını söyledi: "Finansal okuryazarlık bir ayrıcalık değil, herkesin hakkı. Karmaşık bir konuyu anlaşılır kılmak, en az algoritmanın kendisi kadar önemli."',
        'Şirket önümüzdeki dönemde özellikle erişilebilirlik (WCAG 2.1 AA) standartlarına geçiş için çalışacağını duyurdu. Ekran okuyucu uyumluluğu ve düşük bant genişliğine uygun hafif mod yakında devreye girecek.',
      ],
      en: [
        'KrediZeka was awarded the "Best Financial Technology Interface of the Year" in an international user experience design competition. The award ceremony was held digitally, and the KrediZeka design team participated live from their own studio.',
        'In the jury\'s evaluation, it was particularly highlighted that the Findeks-like colored score visualization makes it easier for users to understand their financial situation at a glance. The platform\'s approach to supporting technical financial terms with plain-language explanations also stood out.',
        'KrediZeka\'s Product Manager said the award validates the team\'s core philosophy: "Financial literacy is not a privilege, it is everyone\'s right. Making a complex topic understandable is at least as important as the algorithm itself."',
        'The company announced that it will be working on transitioning to accessibility (WCAG 2.1 AA) standards in the coming period. Screen reader compatibility and a lightweight mode suitable for low bandwidth will go live soon.',
      ],
    },
  },
  {
    id: 'aciklanabilir-yz-arastirma-2026',
    date: '7 Nisan 2026',
    monthLabel: 'Nisan 2026',
    tag: 'Araştırma',
    tagKey: 'tag_research',
    tagColor: 'bg-violet-100 text-violet-700',
    title: {
      tr: 'Açıklanabilir Yapay Zekâ Araştırma Raporu Yayımlandı',
      en: 'Explainable AI Research Report Published',
    },
    summary: {
      tr: 'KrediZeka Ar-Ge ekibi, finansal yapay zekâ modellerinin açıklanabilirliği üzerine 80 sayfalık bir araştırma raporu yayımladı. Rapor, sektördeki şeffaflık tartışmalarına katkı sunmayı amaçlıyor.',
      en: 'The KrediZeka R&D team published an 80-page research report on the explainability of financial AI models. The report aims to contribute to industry-wide transparency discussions.',
    },
    content: {
      tr: [
        'KrediZeka, açıklanabilir yapay zekâ (XAI) alanında yürüttüğü 18 aylık araştırmanın sonuçlarını içeren kapsamlı bir raporu kamuoyu ile paylaştı. Rapor, kredi karar verme süreçlerinde kullanılan ML modellerinin nasıl daha şeffaf hale getirilebileceğine odaklanıyor.',
        'Araştırma; SHAP, LIME ve KrediZeka\'nın geliştirdiği tescilli bir gradient-based yöntemin karşılaştırmalı analizini içeriyor. KrediZeka yönteminin, kullanıcılara sunulan açıklamaların hem doğruluk hem de anlaşılırlık açısından %23 daha iyi performans gösterdiği belirlendi.',
        'Rapor herhangi bir ücret talep edilmeden açık erişime sunuldu. Ar-Ge başkanı, "Bu alandaki ilerleme yalnızca açık bilim yaklaşımıyla mümkün. Bulgularımızı paylaşarak topluluğa katkı sunmak istiyoruz." açıklamasını yaptı.',
        'KrediZeka, bu çalışmadan elde edilen yöntemi 2026 yılı sonuna kadar kendi platformuna entegre etmeyi planlıyor. Kullanıcılar böylece her risk skorunun gerisindeki katkı faktörlerini doğrudan görebilecek.',
      ],
      en: [
        'KrediZeka shared a comprehensive report containing the results of its 18-month research on Explainable AI (XAI). The report focuses on how ML models used in credit decision-making processes can be made more transparent.',
        'The research includes a comparative analysis of SHAP, LIME, and a proprietary gradient-based method developed by KrediZeka. The KrediZeka method was found to perform 23% better in terms of both accuracy and clarity of explanations provided to users.',
        'The report was made open-access without any charge. The Head of R&D stated: "Progress in this field is only possible with an open-science approach. By sharing our findings, we want to contribute to the community."',
        'KrediZeka plans to integrate the methodology from this study into its own platform by the end of 2026. Users will thus be able to directly see the contributing factors behind every risk score.',
      ],
    },
  },
  {
    id: 'kvkk-iso-sertifikalari-2026',
    date: '15 Mart 2026',
    monthLabel: 'Mart 2026',
    tag: 'Güvenlik',
    tagKey: 'tag_security',
    tagColor: 'bg-slate-100 text-slate-700',
    title: {
      tr: 'KVKK ve ISO 27001 Sertifikalarının Yenilenmesi Tamamlandı',
      en: 'KVKK and ISO 27001 Certifications Successfully Renewed',
    },
    summary: {
      tr: 'KrediZeka, üçüncü taraf bağımsız denetim sonucunda KVKK uyumluluk ve ISO 27001 bilgi güvenliği yönetim sistemi sertifikalarını başarıyla yeniledi.',
      en: 'Following a third-party independent audit, KrediZeka successfully renewed its KVKK compliance and ISO 27001 information security management system certifications.',
    },
    content: {
      tr: [
        'KrediZeka, yıllık zorunlu bağımsız denetimini başarıyla tamamladığını ve KVKK uyumluluk ile ISO 27001 sertifikalarının yenilendiğini duyurdu. Denetim sürecinde altyapı güvenliği, veri saklama politikaları ve olay müdahale prosedürleri detaylı olarak incelendi.',
        'Denetim sonuç raporunda; Bcrypt tabanlı parola şifreleme, parametreli SQL sorguları ve uçtan uca HTTPS kullanımı gibi güvenlik uygulamaları örnek gösterildi. Ayrıca KrediZeka\'nın olay müdahale süresinin sektör ortalamasının yarısı kadar olduğu belirtildi.',
        'Şirketin güvenlikten sorumlu yöneticisi, "Bu sertifikalar bizim için sadece birer belge değil; kullanıcılarımıza verdiğimiz sözün doğrulamasıdır. Güvenlik kültürünü tüm ekibimize yaymak için sürekli eğitimlere devam ediyoruz." dedi.',
        'KrediZeka önümüzdeki dönemde sızma testlerinin (penetration test) sıklığını artıracağını ve bug bounty programını genişleteceğini açıkladı.',
      ],
      en: [
        'KrediZeka announced that it has successfully completed its annual mandatory independent audit and renewed its KVKK compliance and ISO 27001 certifications. During the audit, infrastructure security, data retention policies, and incident response procedures were examined in detail.',
        'The audit report highlighted security practices such as Bcrypt-based password encryption, parameterized SQL queries, and end-to-end HTTPS as exemplary. It was also noted that KrediZeka\'s incident response time is half the industry average.',
        'The company\'s Head of Security said: "These certifications are not just documents for us; they are the verification of the promise we made to our users. We continue ongoing training to spread the security culture throughout our entire team."',
        'KrediZeka announced that it will increase the frequency of penetration tests and expand its bug bounty program in the upcoming period.',
      ],
    },
  },
  {
    id: 'sentetik-veri-2026',
    date: '28 Şubat 2026',
    monthLabel: 'Şubat 2026',
    tag: 'Teknoloji',
    tagKey: 'tag_technology',
    tagColor: 'bg-blue-100 text-blue-700',
    title: {
      tr: 'Sentetik Veri Üretim Motoru Açık Kaynak Olarak Yayımlandı',
      en: 'Synthetic Data Generation Engine Released as Open Source',
    },
    summary: {
      tr: 'KrediZeka, ML modellerini eğitmek için kullandığı sentetik finansal veri üretim motorunun temel sürümünü açık kaynak olarak yayımladı. Geliştiriciler kütüphaneyi GitHub üzerinden kullanmaya başlayabilir.',
      en: 'KrediZeka released the core version of its synthetic financial data generation engine used to train ML models as open source. Developers can start using the library via GitHub.',
    },
    content: {
      tr: [
        'KrediZeka, içeride geliştirdiği sentetik finansal veri üretim kütüphanesinin temel sürümünü MIT lisansı ile açık kaynak olarak paylaştı. Kütüphane; gelir, borç ve kredi tutarı gibi finansal alanlarda gerçekçi dağılımlar üretebiliyor.',
        'Bu motor, finans alanında çalışan araştırmacıların ve eğitim kurumlarının gerçek müşteri verilerine ihtiyaç duymadan model geliştirmesine olanak tanıyor. Üretilen veri seti, hassasiyet açısından eğitim ve test ortamları için uygundur.',
        'Açık kaynak adımı, KrediZeka\'nın bilim topluluğuna katkı stratejisinin bir parçası. Şirket önümüzdeki bir yıl içinde özellik mühendisliği yardımcı araçlarını da topluluğa açacağını duyurdu.',
        'GitHub üzerinde yayımlanan repo ilk 48 saatte 1.200\'den fazla yıldız aldı ve geliştirici topluluğu tarafından sıcak karşılandı.',
      ],
      en: [
        'KrediZeka released the core version of its internally developed synthetic financial data generation library as open source under the MIT license. The library can produce realistic distributions across financial fields such as income, debt, and loan amounts.',
        'This engine enables researchers and educational institutions working in the financial field to develop models without needing real customer data. The generated dataset is suitable for training and testing environments in terms of sensitivity.',
        'The open-source move is part of KrediZeka\'s strategy to contribute to the scientific community. The company also announced that it will open its feature engineering helper tools to the community within the next year.',
        'The repository published on GitHub received more than 1,200 stars in the first 48 hours and was warmly welcomed by the developer community.',
      ],
    },
  },
  {
    id: 'finans-okuryazarligi-2026',
    date: '5 Şubat 2026',
    monthLabel: 'Şubat 2026',
    tag: 'Topluluk',
    tagKey: 'tag_community',
    tagColor: 'bg-amber-100 text-amber-700',
    title: {
      tr: 'Ücretsiz Finansal Okuryazarlık Eğitim Serisi Başlatıldı',
      en: 'Free Financial Literacy Education Series Launched',
    },
    summary: {
      tr: 'KrediZeka, kullanıcılarına yönelik ücretsiz 8 bölümlük finansal okuryazarlık eğitim serisini hayata geçirdi. Video derslerle bütçe planlama, borç yönetimi ve yatırım temelleri ele alınıyor.',
      en: 'KrediZeka launched a free 8-part financial literacy education series for its users. Video lessons cover budget planning, debt management, and investment fundamentals.',
    },
    content: {
      tr: [
        'KrediZeka, kullanıcılarının finansal kararlarını daha bilinçli almasına yardımcı olmak için 8 bölümlük bir video eğitim serisi yayımladı. Seri tamamen ücretsiz ve herkesin erişimine açık.',
        'Eğitim serisi sırasıyla şu konuları ele alıyor: bütçe planlama temelleri, borç-gelir dengesi, kredi kartı kullanımı, faiz hesaplama, acil durum fonu oluşturma, basit yatırım kavramları, emeklilik planlaması ve dijital güvenlik.',
        'Şirketin eğitim ekibinden bir yetkili, "Finansal okuryazarlık eksikliği Türkiye\'de hâlâ çok büyük bir sorun. Kullanıcılarımızı sadece bir araçla değil, bilgiyle de güçlendirmek istiyoruz." dedi.',
        'Eğitim videoları KrediZeka platformuna giriş yapıldıktan sonra Profil sekmesindeki "Eğitim" alanından izlenebiliyor. İlk üç bölüm zaten yayımlandı; geri kalan bölümler haftalık olarak yayımlanmaya devam edecek.',
      ],
      en: [
        'KrediZeka published an 8-part video education series to help its users make more informed financial decisions. The series is completely free and accessible to everyone.',
        'The education series covers the following topics in order: budget planning fundamentals, debt-to-income balance, credit card usage, interest calculation, emergency fund creation, simple investment concepts, retirement planning, and digital security.',
        'A representative from the company\'s education team said: "Lack of financial literacy is still a huge problem in Turkey. We want to empower our users not only with a tool but also with knowledge."',
        'The educational videos can be watched from the "Education" area in the Profile tab after logging in to the KrediZeka platform. The first three episodes have already been published; the remaining episodes will continue to be released weekly.',
      ],
    },
  },
  {
    id: 'random-forest-v2-2026',
    date: '18 Ocak 2026',
    monthLabel: 'Ocak 2026',
    tag: 'Teknoloji',
    tagKey: 'tag_technology',
    tagColor: 'bg-blue-100 text-blue-700',
    title: {
      tr: 'Random Forest Modeli v2 Yayımlandı: %98.7 Doğruluk',
      en: 'Random Forest Model v2 Released: 98.7% Accuracy',
    },
    summary: {
      tr: 'KrediZeka risk skorlama modelinin ikinci sürümü hizmete girdi. Yeni model, önceki sürüme göre 1.2 puan daha yüksek doğrulukla çalışıyor.',
      en: 'The second version of KrediZeka\'s risk scoring model went live. The new model runs with 1.2 points higher accuracy compared to the previous version.',
    },
    content: {
      tr: [
        'KrediZeka, kredi onaylanma olasılığı tahmin modelinin ikinci nesil sürümünü duyurdu. Random Forest tabanlı yeni model, %98.7 doğruluk skoru ile öncekine göre belirgin bir iyileşme sundu.',
        'Model bu sürümle birlikte; ağaç sayısı (200\'den 350\'ye), derinlik optimizasyonu ve dengesizlik düzeltmesi (class balancing) gibi alanlarda iyileştirildi. Aynı zamanda eğitim veri seti 5.000 örnekten 12.500 örneğe genişletildi.',
        'Yeni model ayrıca uç (edge) finansal senaryolarda — özellikle çok yüksek borç-gelir oranına sahip kullanıcılarda — daha tutarlı tahminler sunabiliyor.',
        'Şirket, model yenilenmesinin kullanıcı deneyimine yansımayan bir altyapı güncellemesi olduğunu vurguladı. Geliştirici Swagger dokümantasyonu da güncel sürüme uyarlanmış durumda.',
      ],
      en: [
        'KrediZeka announced the second-generation version of its credit approval probability prediction model. The new Random Forest-based model delivered a noticeable improvement over the previous one, achieving a 98.7% accuracy score.',
        'With this version, the model has been improved in areas such as tree count (from 200 to 350), depth optimization, and class balancing. The training dataset was also expanded from 5,000 examples to 12,500 examples.',
        'The new model can also deliver more consistent predictions in edge financial scenarios — especially for users with very high debt-to-income ratios.',
        'The company emphasized that the model renewal is an infrastructure update that is not reflected in the user experience. The developer Swagger documentation has also been adapted to the current version.',
      ],
    },
  },
  {
    id: 'kullanici-100bin-2026',
    date: '3 Ocak 2026',
    monthLabel: 'Ocak 2026',
    tag: 'Büyüme',
    tagKey: 'tag_growth',
    tagColor: 'bg-pink-100 text-pink-700',
    title: {
      tr: 'KrediZeka 100.000 Kullanıcı Eşiğini Aştı',
      en: 'KrediZeka Surpasses 100,000 Users',
    },
    summary: {
      tr: 'KrediZeka, hizmete girişinin 24. ayında kayıtlı kullanıcı sayısı 100.000 eşiğini geçti. Şirket, ilk 100 bin kullanıcısına teşekkür kampanyası başlattı.',
      en: 'In the 24th month of its launch, KrediZeka exceeded the 100,000 registered user threshold. The company launched a thank-you campaign for its first 100 thousand users.',
    },
    content: {
      tr: [
        'KrediZeka, kayıtlı kullanıcı sayısının 100.000\'i aştığını duyurdu. Bu rakam, platformun hizmete girişinin yalnızca 24. ayında ulaşıldı ve şirketin büyüme hızını gösteren önemli bir kilometre taşı olarak değerlendirildi.',
        'Kullanıcı sayısının yanı sıra yapılan toplam analiz adedi de 2.4 milyona ulaştı. Bir kullanıcı ortalamada 24 farklı analiz senaryosu deneyerek finansal durumunu çeşitli açılardan değerlendiriyor.',
        'KrediZeka, ilk 100 bin kullanıcısına teşekkür amacıyla "Erken Üye Rozeti" kampanyası başlattı. Bu kullanıcılar profil sayfalarında özel bir rozet ile öne çıkarılıyor.',
        'Şirketin CEO\'su, hedefin 2027 sonuna kadar 500 bin aktif kullanıcı seviyesine ulaşmak olduğunu açıkladı. Bu büyüme stratejisi kapsamında 2026 yılı içinde mobil uyumlu (responsive) web platformu daha da geliştirilecek.',
      ],
      en: [
        'KrediZeka announced that its registered user count exceeded 100,000. This figure was reached in just the 24th month since the platform went live and was hailed as a significant milestone showing the company\'s growth pace.',
        'In addition to the user count, the total number of analyses performed reached 2.4 million. A user runs an average of 24 different analysis scenarios to evaluate their financial situation from various angles.',
        'KrediZeka launched the "Early Member Badge" campaign to thank its first 100,000 users. These users are highlighted with a special badge on their profile pages.',
        'The company\'s CEO stated that the goal is to reach 500,000 active users by the end of 2027. As part of this growth strategy, the responsive web platform will be further developed in 2026.',
      ],
    },
  },
];

/**
 * Bir haber objesinin tüm çift dilli alanlarını seçili dile göre düzleştirir.
 * Tüketici bileşenleri (Modal, kart) artık item.title yerine localized.title kullanır.
 *
 * @param {Object} item - news dizisinden bir öğe
 * @param {string} lang - 'tr' veya 'en'
 * @returns {Object} - Düzleştirilmiş haber objesi
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
