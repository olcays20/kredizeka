<div align="center">

# KrediZeka

### Makine Öğrenmesi Destekli Finansal Risk ve Kredi Asistanı

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 5.1. Proje Özeti

**KrediZeka**, bireylerin kredi başvurusu yapmadan önce kendi finansal risklerini ölçmelerini sağlayan, yapay zeka destekli modern bir web uygulamasıdır.

### Hedef Kullanıcı Kitlesi

Türkiye'de her yıl milyonlarca kişi banka kredisi başvurusunda bulunmakta; ancak başvuruların önemli bir kısmı ön değerlendirme aşamasında reddedilmektedir. Bu durumun temel nedeni, kullanıcıların kendi finansal profillerini nesnel olarak değerlendirememesidir. KrediZeka; başvuru öncesinde riskleri fark etmek isteyen bireysel kullanıcılar, finansal danışmanlık ihtiyacı duyanlar ve ön değerlendirme yapmak isteyen KOBİ sahipleri için tasarlanmıştır.

### Çözülen Problem

Geleneksel kredi değerlendirme süreçleri opak ve kullanıcıya kapalıdır. KrediZeka bu sorunu üç adımda çözer:

1. **Anlık Risk Skoru** — Kullanıcının gelir, borç ve istediği kredi tutarına göre 0–100 arası bir onaylanma skoru üretilir.
2. **Finansal Oran Analizi** — DTI (Borç/Gelir) ve LTI (Kredi/Gelir) oranları hesaplanarak sektör standartlarıyla karşılaştırılır.
3. **Kişiselleştirilmiş Tavsiye** — Kural tabanlı bir AI motoru, kullanıcının profiline özgü Türkçe öneriler sunar.

### Uygulama Özellikleri

| Özellik | Açıklama |
|---|---|
| ML Tabanlı Risk Skoru | Random Forest modeli ile 0–100 arası kredi onaylanma skoru |
| Findeks Tarzı Görselleştirme | Renkli ilerleme çubuğu ve dairesel skor gösterimi |
| Yapay Zeka Tavsiyesi | DTI ve LTI oranlarına dayalı kişiselleştirilmiş finansal öneriler |
| Güvenli Kimlik Doğrulama | Bcrypt şifreleme ile T.C. No + Parola tabanlı giriş/kayıt |
| Kullanıcı Profili | Meslek ve adres güncelleme imkânı |
| Form Validasyonu | Regex ile anlık karakter engelleme |
| Duyarlı Tasarım | Kurumsal bankacılık UI tarzı |

---

## 5.2. Kullanılan AI Araçları

Bu proje geliştirilirken aşağıdaki yapay zekâ araçları kullanılmıştır:

### Kod Üretimi
- **Claude Code (Anthropic)** — Tüm backend (FastAPI, ML pipeline, SQLite entegrasyonu) ve frontend (React bileşenleri, Tailwind stilleri, routing) kodları Claude Code CLI aracılığıyla üretilmiştir. Proje sıfırdan, hiç placeholder kod içermeyecek şekilde, Production-ready standartlarda geliştirilmiştir.

### Veri Üretimi
- **Claude (Anthropic)** — ML modelini eğitmek için gereken 5.000 kayıtlık sentetik finansal veri seti Claude ile üretilmiştir. Veri seti; gerçekçi gelir, borç ve kredi tutarı dağılımları içermekte ve finansal kurallara dayalı onay/red etiketleriyle oluşturulmuştur.

### İçerik Üretimi
- **Claude (Anthropic)** — Kullanım Koşulları, Gizlilik Politikası (KVKK uyumlu), Hakkımızda, Kariyer ve Basın Odası sayfalarının Türkçe içerikleri Claude ile üretilmiştir.

### UI Tasarımı
- **Claude (Anthropic)** — Tüm UI bileşenleri ve sayfa düzenleri, Claude'a verilen detaylı tasarım promptları aracılığıyla Tailwind CSS utility sınıfları kullanılarak oluşturulmuştur. Referans olarak Findeks ve modern Türk bankacılık arayüzleri esas alınmıştır.

---

## 5.3. Prompt Kütüphanesi

Aşağıda proje geliştirme sürecinde kullanılan en etkili prompt örnekleri kategorilere göre listelenmiştir.

### Kod Üretim Promptları

**Backend — ML Analiz Endpoint'i:**
```
Python FastAPI + scikit-learn Random Forest kullanarak 0-100 arası kredi risk skoru
döndüren bir /api/analyze endpoint'i yaz. Gelir, borç ve talep edilen kredi tutarı
girdi olarak alınsın. DTI (Borç/Gelir) ve LTI (Kredi/Gelir) oranlarını hesapla.
predict_proba() ile onaylanma olasılığını 0-100 skalaya dönüştür. Kural tabanlı
Türkçe kişiselleştirilmiş tavsiyeler üret: DTI > %40 ise uyar, LTI > 10x ise uyar.
FastAPI HTTPException ile hata yönetimi ekle. run_in_threadpool ile CPU-bound ML
inference'ı asenkron çalıştır.
```

**Backend — Güvenli Kayıt Endpoint'i:**
```
FastAPI ile kullanıcı kayıt endpoint'i yaz. Pydantic v2 field_validator kullanarak
TC No'nun sadece rakam içerdiğini ve 0 ile başlamadığını doğrula. Telefon için de
sadece rakam validasyonu ekle. Bcrypt ile parola hashle. SQLite'a parameterized query
ile kaydet. TC No zaten kayıtlıysa 409 Conflict döndür. try/finally bloğu ile
veritabanı bağlantısını mutlaka kapat.
```

**Frontend — Skor Göstergesi Bileşeni:**
```
React + Tailwind CSS ile Findeks tarzı renkli bir kredi skoru göstergesi oluştur.
Skor 75+ yeşil (emerald), 50-74 sarı (amber), 25-49 turuncu (orange), 0-24 kırmızı
(red) olsun. Dairesel skor kartı ortada büyük sayı ile, altında animasyonlu yatay
ilerleme çubuğu olsun. 0/25/50/75/100 etiketleri göster. CSS transition ile
canlandır. Yan yana DTI ve LTI oran kartları ekle.
```

**Frontend — ProtectedRoute + ScrollToTop:**
```
React Router DOM v7 ile iki yardımcı bileşen yaz:
1. ScrollToTop: Her route değişiminde window.scrollTo({ top: 0, behavior: 'instant' })
çalıştırsın.
2. ProtectedRoute: useAuth hook'undan user alıp null ise <Navigate to="/giris" replace />
döndürsün, değilse children render etsin.
App.jsx'te /profil route'unu ProtectedRoute ile sar.
```

### Veri Üretim Promptları

**Sentetik ML Eğitim Verisi:**
```
5000 kayıtlık sentetik finansal veri seti oluştur. Her kayıt şu alanları içersin:
- income: 2000 ile 100000 TL arası rastgele gelir
- debt: 0 ile gelirin %60'ı arası mevcut borç
- loan_amount: 1000 ile 500000 TL arası talep edilen kredi

Etiket (approved) için şu finansal kuralları uygula:
- DTI (debt/income*100) > 50 → büyük ihtimalle red
- LTI (loan/income) > 15 → büyük ihtimalle red
- Hem DTI hem LTI düşükse → büyük ihtimalle onay
Sonuçları pandas DataFrame olarak oluştur ve CSV'e kaydet.
```

### İçerik Üretim Promptları

**KVKK Uyumlu Gizlilik Politikası:**
```
KrediZeka Finansal Teknoloji A.Ş. için KVKK (6698 sayılı Kişisel Verilerin Korunması
Kanunu) uyumlu Türkçe Gizlilik Politikası metni yaz. 7 bölüm olsun: Veri Sorumlusu,
Toplanan Kişisel Veriler, İşlenme Amacı ve Hukuki Dayanağı, Saklama Süresi ve
Güvenlik, Üçüncü Taraflarla Paylaşım, Çerezler Politikası, KVKK 11. Madde Kapsamında
Haklarınız. Her bölüm gerçekçi, hukuki terminoloji içeren 3-5 cümlelik metin içersin.
```

**Kariyer İlan Metinleri:**
```
Bir fintech startup'ı için 5 açık pozisyon ilanı oluştur:
Kıdemli Backend Geliştirici (Python/FastAPI), Frontend Geliştirici (React/TypeScript),
ML Mühendisi (scikit-learn/PyTorch), Veri Analisti, Ürün Müdürü.
Her ilan için: departman, konum (İstanbul/Hibrit), çalışma türü (Tam Zamanlı).
Kurumsal ama sıcak bir ton kullan.
```

### UI Üretim Promptları

**Kurumsal Landing Page Hero Bölümü:**
```
Türk bankacılık sektörüne uygun kurumsal bir hero bölümü tasarla. Tailwind CSS
kullan. Solda: büyük başlık (gradient text ile vurgulu kelime), açıklama paragrafı,
2 CTA butonu (btn-primary + btn-secondary), 3 istatistik kartı. Sağda: animasyonlu
özellik kartları listesi (her satırda lucide-react ikonu + başlık + açıklama).
Arka plan: from-primary-50 via-white to-accent-50 gradient. Blur efektli dekor daireler ekle.
```

**Accordion Bileşeni (Hukuki Sayfalar):**
```
React useState ile tek bölüm açık accordion bileşeni yaz. Tıklanan bölüm zaten açıksa
kapat, farklıysa aç. ChevronDown ikonu rotate-180 animasyonu yapsın. Açık bölüm
amber border ve shadow alsın. max-h-[2000px] / max-h-0 CSS transition ile smooth
açılma/kapanma efekti. Her bölümün içeriği whitespace-pre-line ile formatlanmış metin.
```

---

## 5.4. Kurulum ve Çalıştırma

### Gereksinimler

- **Python 3.10+** — [python.org](https://python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)

### Backend Kurulumu

**1. Projeyi klonlayın:**
```bash
git clone https://github.com/KULLANICI_ADINIZ/kredizeka.git
cd kredizeka
```

**2. Python sanal ortamı oluşturun ve aktive edin:**
```bash
# macOS / Linux
cd backend
python3 -m venv venv
source venv/bin/activate

# Windows
cd backend
python -m venv venv
venv\Scripts\activate
```

**3. Bağımlılıkları yükleyin:**
```bash
pip install -r requirements.txt
```

**4. ML modelini eğitin** *(ilk çalıştırmada zorunlu)*:
```bash
python train_model.py
```
> Bu komut `loan_risk_pipeline.pkl` dosyasını oluşturur. Eğitim tamamlandığında model doğruluk skoru ve özellik önemleri ekrana yazdırılır.

**5. API sunucusunu başlatın:**
```bash
uvicorn main:app --reload --port 8000
```

API sunucusu `http://localhost:8000` adresinde çalışmaya başlar.  
Swagger dokümantasyonu: `http://localhost:8000/docs`

### Frontend Kurulumu

Yeni bir terminal penceresi açın:

```bash
cd frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

### Üretim Derlemesi

```bash
# Frontend
cd frontend && npm run build

# Backend (reload olmadan)
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 5.5. Gelecek Vizyonu

### Geliştirilebilecek AI Özellikleri

| Özellik | Açıklama |
|---|---|
| **LLM Destekli Tavsiye Motoru** | Kural tabanlı mesajların yerine GPT-4o / Claude 3.5 ile kişiye özel, konuşma tarzında finansal danışmanlık |
| **Belge Analizi (OCR + AI)** | Kullanıcının maaş bordrosu veya vergi levhasını yüklemesi, AI'ın belgeyi okuyarak gelir verisini otomatik doldurması |
| **Zaman Serisi Risk Takibi** | Kullanıcının aylık analizlerini kaydedip gelir/borç trendini zaman serisi grafiğiyle gösterme |
| **Gelişmiş ML Modeli** | XGBoost veya LightGBM ile daha fazla özellik (yaş, meslek kategorisi, şehir) eklenerek model doğruluğunu artırma |
| **Çoklu Kredi Senaryosu** | "Eğer borcumu şu kadar azaltırsam skor ne olur?" sorusuna yanıt veren interaktif senaryo simülatörü |

### Çözülebilecek Kullanıcı Problemleri

- **Finansal Okuryazarlık Eksikliği** — Kullanıcıların DTI/LTI gibi teknik kavramları anlamalarına yardımcı olan eğitici içerikler ve video açıklamalar
- **Erişilebilirlik** — Ekran okuyucu uyumlu WCAG 2.1 AA standardına geçiş; düşük bant genişliğine uygun hafif mod
- **Çoklu Dil Desteği** — Türkiye'deki yabancı uyruklu kullanıcılar için İngilizce arayüz seçeneği
- **Banka API Entegrasyonu** — Open Banking (BDDK onaylı) entegrasyonu ile banka hesabından otomatik gelir/borç verisi çekme

### Ölçeklenebilirlik

Uygulama şu anda tek sunucu üzerinde SQLite ile çalışmaktadır. Gerçek bir üretim ortamı için önerilen mimari:

```
Kullanıcı
   ↓
CDN (Cloudflare) → React SPA (Vercel / S3 + CloudFront)
   ↓
Load Balancer
   ↓
FastAPI Cluster (3+ instance, Docker + Kubernetes)
   ↓
PostgreSQL (AWS RDS) + Redis (önbellek + oturum)
   ↓
ML Inference Servisi (ayrı mikroservis, GPU destekli)
```

Beklenen ölçek: 100.000 aktif kullanıcı, günde 50.000+ analiz isteği.

---

## Mimari (Tech Stack)

```
kredizeka/
├── backend/
│   ├── main.py               # API uç noktaları
│   ├── train_model.py        # ML model eğitim scripti
│   ├── requirements.txt      # Python bağımlılıkları
│   ├── loan_risk_pipeline.pkl # Eğitilmiş ML pipeline
│   └── kredizeka.db          # SQLite veritabanı
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Yönlendirme
    │   ├── context/AuthContext.jsx
    │   ├── hooks/useAuth.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── Footer.jsx
    │   └── pages/
    │       ├── RiskReportPage.jsx
    │       ├── RegisterPage.jsx
    │       ├── LoginPage.jsx
    │       ├── ProfilePage.jsx
    │       ├── HakkimizdaPage.jsx
    │       ├── KariyerPage.jsx
    │       ├── BasinOdasiPage.jsx
    │       ├── GizlilikPolitikasiPage.jsx
    │       └── KullanimKosullariPage.jsx
    └── tailwind.config.js
```

---

## API Dokümantasyonu

Sunucu çalışırken Swagger UI: `http://localhost:8000/docs`

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/` | Sağlık kontrolü |
| `POST` | `/api/register` | Yeni kullanıcı kaydı |
| `POST` | `/api/login` | Kullanıcı girişi |
| `GET` | `/api/profile/{tc_no}` | Profil bilgilerini getir |
| `PUT` | `/api/profile` | Meslek ve adres güncelle |
| `POST` | `/api/analyze` | ML tabanlı risk analizi |

**Örnek — Risk Analizi:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"income": 15000, "debt": 3000, "loan_amount": 50000}'
```

**Yanıt:**
```json
{
  "score": 72,
  "risk_status": "Orta Risk",
  "dti": 20.0,
  "lti": 3.3,
  "ai_advice": "Kredi onaylanma skorunuz 72/100..."
}
```

| Skor | Durum | Renk |
|---|---|---|
| 75–100 | Düşük Risk | Yeşil |
| 50–74 | Orta Risk | Sarı |
| 25–49 | Yüksek Risk | Turuncu |
| 0–24 | Çok Yüksek Risk | Kırmızı |

---

## Güvenlik

- **Bcrypt** — Parolalar asla düz metin saklanmaz; her kayıtta benzersiz salt eklenir
- **Parameterized Queries** — SQL enjeksiyonu saldırılarına karşı korumalı
- **Pydantic Doğrulama** — TC No yalnızca rakam ve 0 ile başlayamaz kuralı, tüm API girdileri tip doğrulamasından geçer
- **ProtectedRoute** — Giriş yapmadan /profil sayfasına erişim engellenir

---

## Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

<div align="center">

**KrediZeka** — Finansal kararlarınızda yapay zekanın gücünden yararlanın.

*Python + FastAPI + React + scikit-learn + Claude Code ile geliştirilmiştir.*

</div>
