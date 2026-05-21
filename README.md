<div align="center">

# KrediZeka

### Enterprise-Grade AI Powered Financial Risk & Credit Assistant
### Yapay Zekâ Destekli Kurumsal Finansal Risk ve Kredi Asistanı

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-FF6F00?style=for-the-badge)](https://xgboost.ai)
[![SHAP](https://img.shields.io/badge/SHAP-0.45-E91E63?style=for-the-badge)](https://shap.readthedocs.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />

[![Live Demo](https://img.shields.io/badge/🌐_Canlı_Demo-kredizeka.vercel.app-000000?style=for-the-badge)](https://kredizeka.vercel.app)
[![ML Model](https://img.shields.io/badge/🧠_Model-XGBoost%20%2B%20SHAP-FF6F00?style=for-the-badge)](#kullanılan-ai-araçları)
[![Accuracy](https://img.shields.io/badge/Doğruluk-%2098.75-success?style=for-the-badge)](#proje-özeti)

**🇹🇷 [Türkçe](#-türkçe) · 🇬🇧 [English](#-english)**

</div>

---

## 🇹🇷 Türkçe

> Açıklanabilir yapay zekâ (XAI), PostgreSQL kalıcı veri katmanı, Docker konteyner mimarisi ve çift dil desteğiyle uçtan uca geliştirilmiş bir akademik portföy projesi.

### İçindekiler

- [Proje Özeti](#proje-özeti)
- [Kullanılan AI Araçları](#kullanılan-ai-araçları)
- [Prompt Kütüphanesi](#prompt-kütüphanesi)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
- [Gelecek Vizyonu](#gelecek-vizyonu)

---

### Proje Özeti

**KrediZeka**, bireylerin kredi başvurusu yapmadan önce kendi finansal risklerini ölçmelerini sağlayan, yapay zekâ destekli modern bir web uygulamasıdır.

#### Hedef Kullanıcı Kitlesi

Türkiye'de her yıl milyonlarca kişi banka kredisi başvurusunda bulunmakta; ancak başvuruların önemli bir kısmı ön değerlendirme aşamasında reddedilmektedir. Bu durumun temel nedeni, kullanıcıların kendi finansal profillerini nesnel olarak değerlendirememesidir. KrediZeka; başvuru öncesinde riskleri fark etmek isteyen bireysel kullanıcılar, finansal danışmanlık ihtiyacı duyanlar ve ön değerlendirme yapmak isteyen KOBİ sahipleri için tasarlanmıştır.

#### Çözülen Problem

Geleneksel kredi değerlendirme süreçleri opak ve kullanıcıya kapalıdır. KrediZeka bu sorunu dört adımda çözer:

1. **Anlık Risk Skoru** — Kullanıcının gelir, borç, talep edilen kredi tutarı, yaş, kredi geçmişi ve birikim bilgilerine göre 0–100 arası bir onaylanma skoru üretilir.
2. **Açıklanabilir Yapay Zekâ (XAI)** — SHAP TreeExplainer ile her skor için *neden* o skorun üretildiği, hangi faktörlerin pozitif/negatif yönde etki ettiği şeffaf şekilde gösterilir.
3. **Finansal Oran Analizi** — DTI (Borç/Gelir) ve LTI (Kredi/Gelir) oranları sektör standartlarıyla karşılaştırılır.
4. **Kişiselleştirilmiş Tavsiye** — Kural tabanlı bir motor, kullanıcının profiline özgü Türkçe öneriler sunar.

#### Öne Çıkan Özellikler

| Özellik | Açıklama |
|---|---|
| **XGBoost ML Modeli** | GridSearchCV ile hiperparametre optimize edilmiş, %98.75 doğruluğa sahip gradient boosting modeli |
| **SHAP Açıklanabilirlik** | Her tahminin arkasındaki en etkili faktörleri yatay bar grafikle gösterir |
| **Adımlı Risk Analizi** | 3 aşamalı sihirbaz form: Kişisel Durum → Finansal Veriler → Sonuç |
| **İnteraktif Finansal Modüller** | Bireysel, Ticari ve Ürünler sekmelerinde 12 ayrı simülasyon motoru (Kredi Yönetimi, Birikim, Yatırım, Şirket Sağlık Skoru, Mevduat, Sigorta vb.) |
| **PostgreSQL + SQLAlchemy** | İlişkisel veri katmanı: `users` + 3 analiz tablosu (1-N ilişkiler, JSONB sütunlar) |
| **Docker Compose** | 3 servis (veritabanı / backend / frontend) tek komutla ayağa kalkar |
| **Rate Limiting** | IP tabanlı brute-force koruması (kayıt/giriş ve analiz uç noktalarında) |
| **Asenkron İşlemler** | FastAPI BackgroundTasks ile e-posta bildirimleri — kullanıcı bekletilmez |
| **Rol Tabanlı Erişim** | Yönetici paneli ve `is_admin` rolü ile RBAC mimarisi |
| **Çoklu Dil (i18n)** | react-i18next ile tam Türkçe/İngilizce çeviri, tercih kaydı |
| **Karanlık Tema** | Tailwind class-based dark mode, sistem tercihi algılama |
| **PDF Rapor** | Analiz sonucunu yüksek çözünürlüklü A4 belge olarak indirme |
| **Veri Görselleştirme** | Recharts ile pasta grafiği, bar grafiği ve SHAP etki grafiği |
| **Güvenli Kimlik Doğrulama** | Bcrypt ile tuzlu hash; parolalar asla düz metin saklanmaz |
| **Profil Yönetimi** | Profil fotoğrafı yükleme, meslek ve adres güncelleme |

#### İnteraktif Finansal Modül Mimarisi

"Bireysel", "Ticari" ve "Ürünler" sekmelerindeki tüm hizmet kartları statik
görseller değil, arkasında gerçek veri modelleri ve simülasyon motorları
çalışan interaktif modüllerdir. Her kart tıklandığında çok adımlı bir
analiz formu açılır; sonuçlar PostgreSQL'e kaydedilir ve grafiklerle
görselleştirilir.

> ⚠️ **Akademik Proje Notu:** Bu modüller gerçek banka veya resmi kurum
> API'leri **kullanmaz**. Tamamen eğitim ve portföy amaçlı, deterministik
> ve şeffaf finansal formüllere dayanan kurgusal (mock) simülasyonlardır.

| Modül | API Endpoint | Simülasyon Motoru | Çıktı |
|---|---|---|---|
| **Bireysel** (5 hizmet) | `POST /api/bireysel/analyze` | Borç/gelir analizi, bileşik faiz, portföy projeksiyonu | 0–100 skor + grafik |
| **Ticari** (4 hizmet) | `POST /api/ticari/analyze` | XGBoost mantığıyla **Şirket Finansal Sağlık Skoru** | 0–100 skor + risk durumu |
| **Ürünler** (3 ürün) | `POST /api/urunler/analyze` | **Linear Regression** ile getiri/prim tahmini | Tahmini tutar + grafik |
| **Geçmiş** | `GET /api/analytics/history/{tc_no}` | Tüm modül analiz geçmişi | Birleşik liste |

#### PostgreSQL İlişkisel Şema

```
┌────────────────────┐
│       users        │  (PK: id, UNIQUE: tc_no)
│  - tc_no           │
│  - full_name       │
│  - is_admin        │
└─────────┬──────────┘
          │ 1
          │
   ┌──────┼──────────────────┬──────────────────┐
   │ N    │ N                │ N                │
┌──▼───────────────┐ ┌───────▼──────────┐ ┌─────▼────────────┐
│ bireysel_        │ │ ticari_          │ │ urunler_         │
│   analytics      │ │   analytics      │ │   analytics      │
│ - hizmet_turu    │ │ - hizmet_turu    │ │ - urun_turu      │
│ - girdi_verileri │ │ - girdi_verileri │ │ - girdi_verileri │
│   (JSONB)        │ │   (JSONB)        │ │   (JSONB)        │
│ - hesaplanan_    │ │ - sirket_saglik_ │ │ - tahmin_edilen_ │
│   skor           │ │   skoru          │ │   getiri/prim    │
│ - FK: tc_no      │ │ - FK: tc_no      │ │ - FK: tc_no      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

Her analiz tablosu `users.tc_no`'ya **Foreign Key** ile bağlıdır
(`ON DELETE CASCADE`). Kullanıcının form verileri **JSONB** sütununda
yarı-yapılı (semi-structured) biçimde saklanır — bu sayede her hizmet
türü kendi alan setine sahip olabilir.

---

### Kullanılan AI Araçları

Bu projeyi geliştirirken, üretkenliği artırmak amacıyla aşağıdaki yapay zekâ araçlarından yararlandım. Tasarım kararları, mimari seçimler, problem tanımı ve uygulama testleri tamamen kendi sorumluluğumdadır; AI araçları yardımcı bir hızlandırıcı olarak konumlandırılmıştır.

#### Kod Üretimi
- **Claude Code (Anthropic)** — Tekrarlayan kalıpların (CRUD endpoint'leri, Tailwind sınıfları, i18n çevirileri) hızlı yazılmasında yardımcı olarak kullandım. Üretilen tüm kodları proje gereksinimlerime göre düzenleyip test ettim.
- **GitHub Copilot** — VS Code içinde satır içi öneriler ve docstring tamamlama için kullandım.

#### UI Tasarımı
- **Claude (Anthropic)** — Tailwind utility sınıflarıyla bileşen iskeleti üretmek için kullandım. Renk paleti, tipografi ve düzen kararlarını kendim verdim; referans olarak modern Türk bankacılık arayüzlerini esas aldım.

#### Veri Üretimi
- **Claude (Anthropic)** — Model eğitiminde kullanılacak sentetik finansal veri setini (German Credit Risk benzeri, 6.000 satır) üretmek için yardım aldım. Veri dağılımlarını ve etiket kurallarını finansal mantığa uygun şekilde kendim doğruladım.

#### İçerik Üretimi
- **Claude (Anthropic)** — KVKK uyumlu hukuki metinler (Gizlilik Politikası, Kullanım Koşulları) ve haber metinleri için ilk taslakları üretmekte kullandım. Tüm içerikleri marka diline ve akademik proje kapsamına göre yeniden düzenledim.

---

### Prompt Kütüphanesi

Geliştirme sürecinde en verimli sonuçları aldığım prompt örneklerinden seçkiler:

#### Kod Üretim Promptları

**Backend — XGBoost + SHAP entegrasyonu:**
```
FastAPI'de bir /api/analyze endpoint'i yaz. XGBoost modeliyle 0-100 arası risk skoru
üret. SHAP TreeExplainer ile her tahmin için en etkili 5 faktörü (pozitif/negatif
etki) JSON olarak döndür. CPU-bound işlemleri run_in_threadpool ile asenkron çalıştır.
Türetilmiş özellikler (dti_ratio, lti_ratio) backend'de hesaplansın.
```

**Backend — Rate Limiting + Asenkron İşlemler:**
```
FastAPI'de slowapi entegre et. Kayıt ve giriş uç noktaları için IP başına dakikalık
istek limiti koy. Limit aşılınca 429 dönsün. Ayrıca her başarılı kayıttan sonra
BackgroundTasks ile asenkron bir e-posta bildirim servisi tetikle.
```

**Backend — SQLAlchemy + PostgreSQL Geçişi:**
```
SQLite kullanan mevcut backend'i SQLAlchemy 2.0 + PostgreSQL'e taşı. database.py
ve models.py ayrı dosyalar olsun. pydantic-settings ile DATABASE_URL ortam
değişkeninden okunsun. Geriye uyumluluk için SQLite fallback bırak.
```

**Frontend — Adımlı Sihirbaz Form:**
```
React + Tailwind ile 3 adımlı (Kişisel / Finansal / Sonuç) yatay stepper formu
oluştur. Her adımda doğrulama yap, sonra "İleri" butonu sonraki adıma geçsin.
Tamamlanan adımlar yeşil tikli, aktif adım büyütülmüş primary renkli görünsün.
Animasyonlu geçiş ve "Geri" butonu olsun.
```

**Frontend — Karanlık Tema Yönetimi:**
```
React Context ile dark/light tema yönetimi yaz. İlk yükleme önceliği:
localStorage > prefers-color-scheme > 'light'. Tema değişiminde <html> sınıfına
'dark' ekle/çıkar. useTheme custom hook'u sağla. Tailwind class-based dark mode
ile uyumlu olsun.
```

#### Veri Üretim Promptları

**Sentetik Finansal Veri Seti:**
```
NumPy + Pandas ile 6000 satırlık sentetik finansal veri seti üret. Sütunlar:
income (log-normal), debt (gelirin %0-150'si), loan_amount (log-normal),
age (normal 18-75), employment_years (yaşa bağlı), credit_history (0-5 beta),
dependents (Poisson), savings_balance (log-normal). Etiket için lojistik
fonksiyon kullan: pozitif faktörler (geçmiş, tecrübe, birikim) ve negatif
faktörler (DTI, LTI, bakmakla yükümlü) puanı belirlesin.
```

#### UI Üretim Promptları

**Recharts Yatay SHAP Grafiği:**
```
Recharts ile yatay BarChart oluştur. SHAP değerlerine göre en etkili 5 faktörü
göster. Pozitif değerler emerald, negatif değerler red renkli olsun. Y ekseni
faktör ismi, X ekseni SHAP değeri. Tooltip'te "+0.420 → Olumlu Etki" formatında
göster. Karanlık tema ile uyumlu olsun.
```

#### İçerik Üretim Promptları

**KVKK Uyumlu Gizlilik Politikası:**
```
KrediZeka için KVKK (6698) uyumlu Türkçe Gizlilik Politikası metni yaz. 7 bölüm:
Veri Sorumlusu, Toplanan Veriler, İşlenme Amacı, Saklama ve Güvenlik, Üçüncü
Taraflarla Paylaşım, Çerezler Politikası, KVKK Madde 11 Hakları. Gerçekçi hukuki
terminoloji kullan. Hem Türkçe hem İngilizce versiyonları üret.
```

---

### Kurulum ve Çalıştırma

#### Yöntem 1: Docker Compose (Önerilen)

Tüm sistem (PostgreSQL + FastAPI + React/Nginx) tek komutla ayağa kalkar:

```bash
# 1. Repoyu klonla
git clone https://github.com/olcays20/kredizeka.git
cd kredizeka

# 2. Ortam değişkenlerini hazırla
cp .env.example .env

# 3. Tüm servisleri başlat
docker compose up --build
```

Erişim noktaları:
- **Frontend** → http://localhost
- **Backend API** → http://localhost:8000
- **API Dokümantasyonu (Swagger)** → http://localhost:8000/docs

İlk açılışta backend, veritabanı şemasını otomatik oluşturur. Varsayılan yönetici hesabı, `.env` dosyasındaki `DEFAULT_ADMIN_*` değişkenleri kullanılarak otomatik tanımlanır.

#### Yöntem 2: Yerel Geliştirme (Docker'sız)

**Backend (Python 3.11+):**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate           # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_model.py              # ML modelini eğit (~1-2 dakika)
uvicorn main:app --reload --port 8000
```

**Frontend (Node.js 18+):**
```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` adresinde açılır, backend'e `http://localhost:8000` üzerinden bağlanır.

#### API Örneği

**Risk Analizi İsteği:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "income": 15000,
    "debt": 3000,
    "loan_amount": 50000,
    "age": 32,
    "employment_years": 5,
    "credit_history": 4,
    "dependents": 1,
    "savings_balance": 25000
  }'
```

**Yanıt (SHAP açıklamaları dahil):**
```json
{
  "score": 78,
  "risk_status": "Düşük Risk",
  "dti": 20.0,
  "lti": 3.33,
  "ai_advice": "Tebrikler! Kredi onaylanma skorunuz...",
  "top_factors": [
    {
      "feature": "credit_history",
      "label_tr": "Kredi Geçmişi",
      "shap_value": 0.42,
      "impact": "positive"
    }
  ],
  "model_meta": {
    "algorithm": "XGBoost",
    "explainability": "SHAP TreeExplainer"
  }
}
```

#### Mimari Genel Bakış

```
┌──────────────────────────────────────────────────┐
│                Kullanıcı (Tarayıcı)               │
└─────────────────────────┬────────────────────────┘
                          │
                 ┌────────▼─────────┐
                 │  Nginx (Port 80) │   Frontend container
                 │  React SPA       │
                 │  • Stepper Form  │
                 │  • SHAP Grafiği  │
                 │  • Karanlık Tema │
                 │  • i18n TR/EN    │
                 └────────┬─────────┘
                          │ HTTP (CORS)
                 ┌────────▼─────────┐
                 │  FastAPI (8000)  │   Backend container
                 │  • XGBoost+SHAP  │
                 │  • Rate Limit    │
                 │  • BackgroundTask│
                 │  • SQLAlchemy    │
                 └────────┬─────────┘
                          │ TCP
                 ┌────────▼─────────┐
                 │  PostgreSQL 15   │   Database container
                 │  • Kalıcı volume │
                 └──────────────────┘
```

---

### Gelecek Vizyonu

#### Geliştirilebilecek AI Özellikleri

| Özellik | Açıklama |
|---|---|
| **LLM Destekli Tavsiye Motoru** | Kural tabanlı mesajların yerine büyük dil modeli ile kişiye özel, konuşma tarzında finansal danışmanlık |
| **Belge OCR + AI** | Maaş bordrosu/vergi levhası yükleme → AI ile otomatik gelir doğrulama |
| **Zaman Serisi Risk Takibi** | Aylık analizlerin geçmişi → gelir/borç trend grafiği |
| **Çoklu Model Ensemble** | XGBoost + LightGBM + CatBoost birleşimi ile daha yüksek doğruluk |
| **Senaryo Simülatörü** | "Borcumu %30 azaltırsam skor ne olur?" interaktif analiz |

#### Çözülebilecek Kullanıcı Problemleri

- **Finansal Okuryazarlık** — Eğitici video serisi ve etkileşimli testlerle kullanıcıyı bilinçlendirme
- **Erişilebilirlik** — WCAG 2.1 AA standardına geçiş, ekran okuyucu uyumluluğu
- **Banka API Entegrasyonu** — Open Banking ile gerçek banka verisinden otomatik gelir/borç çekme
- **Mobil Uygulama** — React Native ile iOS/Android native uygulamalar

#### Ölçeklenebilirlik Yol Haritası

Mevcut Docker Compose mimarisi tek sunucu için optimize edilmiştir. Gerçek üretim ölçeği için önerilen mimari:

```
Kullanıcı
   ↓
CDN (Cloudflare) → React SPA (Vercel)
   ↓
Load Balancer
   ↓
Kubernetes → FastAPI cluster (3+ instance, otomatik ölçekleme)
   ↓
PostgreSQL (Multi-AZ) + Redis (önbellek + oturum)
   ↓
ML Inference Servisi (ayrı GPU destekli endpoint)
```

**Hedef Ölçek:** 100.000 aktif kullanıcı, günde 50.000+ analiz, p95 gecikme < 300ms.

---

## 🇬🇧 English

> An academic portfolio project built end-to-end with Explainable AI (XAI), a persistent PostgreSQL data layer, Docker container architecture, and full bilingual support.

### Table of Contents

- [Project Overview](#project-overview)
- [AI Tools Used](#ai-tools-used)
- [Prompt Library](#prompt-library)
- [Installation & Running](#installation--running)
- [Future Vision](#future-vision)

---

### Project Overview

**KrediZeka** is a modern, AI-powered web application that helps individuals assess their own credit risk before applying for a loan.

#### Target Audience

In Turkey, millions of credit applications are submitted every year, yet a significant portion is rejected at the pre-evaluation stage. The root cause is that applicants cannot objectively evaluate their own financial profile. KrediZeka is designed for individual users who want to recognize risks beforehand, people seeking financial guidance, and SMB owners who need a pre-assessment tool.

#### The Problem It Solves

Traditional credit evaluation processes are opaque and inaccessible to end users. KrediZeka tackles this in four steps:

1. **Instant Risk Score** — A 0-100 approval probability based on income, debt, requested loan amount, age, credit history, and savings.
2. **Explainable AI (XAI)** — SHAP TreeExplainer transparently shows *why* each score was produced and which factors had positive/negative impact.
3. **Financial Ratio Analysis** — DTI (Debt-to-Income) and LTI (Loan-to-Income) ratios compared to industry benchmarks.
4. **Personalized Recommendation** — A rule-based engine provides advice tailored to the user's profile.

#### Highlight Features

| Feature | Description |
|---|---|
| **XGBoost ML Model** | Gradient boosting model with GridSearchCV hyperparameter tuning, 98.75% accuracy |
| **SHAP Explainability** | Most influential factors per prediction, visualized via horizontal bar chart |
| **Step-by-Step Analysis** | 3-stage wizard form: Personal Profile → Financial Data → Result |
| **Interactive Financial Modules** | 12 distinct simulation engines across Personal, Commercial & Products tabs (Loan Management, Savings, Investment, Company Health Score, Deposit, Insurance, etc.) |
| **PostgreSQL + SQLAlchemy** | Relational data layer: `users` + 3 analytics tables (1-N relations, JSONB columns) |
| **Docker Compose** | 3 services (database / backend / frontend) start with a single command |
| **Rate Limiting** | IP-based brute-force protection on auth and analysis endpoints |
| **Async Operations** | Email notifications via FastAPI BackgroundTasks — user is never blocked |
| **Role-Based Access** | Admin dashboard and RBAC architecture with `is_admin` role |
| **Multi-Language (i18n)** | Full Turkish/English translation with react-i18next, preference persistence |
| **Dark Mode** | Tailwind class-based dark theme with system preference detection |
| **PDF Report** | Download analysis result as a high-resolution A4 document |
| **Data Visualization** | Pie chart, bar chart, and SHAP impact chart via Recharts |
| **Secure Authentication** | Bcrypt salted hashing; passwords never stored as plaintext |
| **Profile Management** | Profile picture upload, occupation and address updates |

#### Interactive Financial Module Architecture

All service cards in the "Personal", "Commercial", and "Products" tabs are not
static graphics — they are interactive modules backed by real data models and
simulation engines. Clicking a card opens a multi-step analysis form; results
are persisted to PostgreSQL and visualized with charts.

> ⚠️ **Academic Project Note:** These modules **do not** use real bank or
> official institution APIs. They are entirely fictional (mock) simulations
> based on deterministic, transparent financial formulas for educational and
> portfolio purposes.

| Module | API Endpoint | Simulation Engine | Output |
|---|---|---|---|
| **Personal** (5 services) | `POST /api/bireysel/analyze` | Debt/income analysis, compound interest, portfolio projection | 0–100 score + chart |
| **Commercial** (4 services) | `POST /api/ticari/analyze` | XGBoost-style **Company Financial Health Score** | 0–100 score + risk status |
| **Products** (3 products) | `POST /api/urunler/analyze` | **Linear Regression** for return/premium estimation | Estimated amount + chart |
| **History** | `GET /api/analytics/history/{tc_no}` | All module analysis history | Combined list |

#### PostgreSQL Relational Schema

```
┌────────────────────┐
│       users        │  (PK: id, UNIQUE: tc_no)
└─────────┬──────────┘
          │ 1
   ┌──────┼──────────────────┬──────────────────┐
   │ N    │ N                │ N                │
┌──▼───────────────┐ ┌───────▼──────────┐ ┌─────▼────────────┐
│ bireysel_        │ │ ticari_          │ │ urunler_         │
│   analytics      │ │   analytics      │ │   analytics      │
│ - hizmet_turu    │ │ - hizmet_turu    │ │ - urun_turu      │
│ - girdi_verileri │ │ - girdi_verileri │ │ - girdi_verileri │
│   (JSONB)        │ │   (JSONB)        │ │   (JSONB)        │
│ - FK: tc_no      │ │ - FK: tc_no      │ │ - FK: tc_no      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

Each analytics table is linked to `users.tc_no` via a **Foreign Key**
(`ON DELETE CASCADE`). The user's form inputs are stored in a **JSONB**
column in a semi-structured manner, allowing each service type to have its
own field set.

---

### AI Tools Used

While building this project, I leveraged the following AI tools to boost productivity. Design decisions, architectural choices, problem definition, and testing remain entirely my own responsibility; AI tools served as helpful accelerators.

#### Code Generation
- **Claude Code (Anthropic)** — Used as an assistant for quickly writing repetitive patterns (CRUD endpoints, Tailwind classes, i18n translations). All generated code was reviewed, adapted to project requirements, and tested by me.
- **GitHub Copilot** — Used inside VS Code for inline suggestions and docstring completion.

#### UI Design
- **Claude (Anthropic)** — Used to generate component scaffolds with Tailwind utility classes. I made the color palette, typography, and layout decisions myself, using modern Turkish banking interfaces as references.

#### Data Generation
- **Claude (Anthropic)** — Helped produce the synthetic financial dataset (German Credit Risk-style, 6,000 rows) used for model training. I validated the data distributions and labeling rules to ensure they aligned with sound financial logic.

#### Content Generation
- **Claude (Anthropic)** — Used to draft initial versions of KVKK-compliant legal texts (Privacy Policy, Terms of Use) and news copy. All content was revised to fit the brand voice and academic project scope.

---

### Prompt Library

A selection of the prompts that produced the most useful results during development:

#### Code Generation Prompts

**Backend — XGBoost + SHAP integration:**
```
Write a FastAPI /api/analyze endpoint. Generate a 0-100 risk score with an
XGBoost model. Use SHAP TreeExplainer to return the top 5 most impactful
features per prediction (positive/negative) as JSON. Run CPU-bound work in
run_in_threadpool. Compute derived features (dti_ratio, lti_ratio) on the backend.
```

**Backend — Rate Limiting + Async Operations:**
```
Integrate slowapi into FastAPI. Set a per-minute IP request limit on the
registration and login endpoints. Return HTTP 429 when exceeded. Also fire an
async email notification service via BackgroundTasks after a successful sign-up.
```

**Backend — SQLAlchemy + PostgreSQL Migration:**
```
Migrate the existing SQLite backend to SQLAlchemy 2.0 + PostgreSQL. Put database.py
and models.py in separate files. Read DATABASE_URL from an environment variable
via pydantic-settings. Keep a SQLite fallback for backward compatibility.
```

**Frontend — Stepper Wizard Form:**
```
Build a 3-step (Personal / Financial / Result) horizontal stepper form with
React + Tailwind. Validate each step before allowing Next. Completed steps
show a green check, the active step is enlarged in primary color. Add smooth
transitions and a Back button.
```

**Frontend — Dark Theme Management:**
```
Write a React Context for dark/light theme management. Initial priority:
localStorage > prefers-color-scheme > 'light'. Toggle the 'dark' class on <html>
when theme changes. Expose a useTheme custom hook. Must be compatible with
Tailwind class-based dark mode.
```

#### Data Generation Prompts

**Synthetic Financial Dataset:**
```
Use NumPy + Pandas to generate a 6000-row synthetic financial dataset. Columns:
income (log-normal), debt (0-150% of income), loan_amount (log-normal),
age (normal, 18-75), employment_years (depends on age), credit_history (0-5 beta),
dependents (Poisson), savings_balance (log-normal). For the label, use a logistic
function: positive factors (history, tenure, savings) and negative factors
(DTI, LTI, dependents) determine the score.
```

#### UI Generation Prompts

**Recharts Horizontal SHAP Chart:**
```
Build a horizontal Recharts BarChart. Show the top 5 features by SHAP value.
Positive values in emerald, negative in red. Y-axis: feature name, X-axis:
SHAP value. Tooltip format: "+0.420 → Positive Impact". Must be compatible
with dark mode.
```

#### Content Generation Prompts

**KVKK-Compliant Privacy Policy:**
```
Write a Turkish Privacy Policy compliant with KVKK (Law No. 6698) for KrediZeka.
7 sections: Data Controller, Collected Data, Processing Purpose, Storage &
Security, Third-Party Sharing, Cookie Policy, KVKK Article 11 Rights. Use
realistic legal terminology. Produce both Turkish and English versions.
```

---

### Installation & Running

#### Method 1: Docker Compose (Recommended)

The entire system (PostgreSQL + FastAPI + React/Nginx) comes up with a single command:

```bash
# 1. Clone the repo
git clone https://github.com/olcays20/kredizeka.git
cd kredizeka

# 2. Prepare environment variables
cp .env.example .env

# 3. Start all services
docker compose up --build
```

Access points:
- **Frontend** → http://localhost
- **Backend API** → http://localhost:8000
- **API Documentation (Swagger)** → http://localhost:8000/docs

On first startup, the backend automatically creates the database schema. The default administrator account is automatically defined using the `DEFAULT_ADMIN_*` variables in the `.env` file.

#### Method 2: Local Development (without Docker)

**Backend (Python 3.11+):**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate           # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_model.py              # Train the ML model (~1-2 min)
uvicorn main:app --reload --port 8000
```

**Frontend (Node.js 18+):**
```bash
cd frontend
npm install
npm run dev
```

The frontend opens at `http://localhost:5173` and connects to the backend at `http://localhost:8000`.

#### API Example

**Risk Analysis Request:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "income": 15000,
    "debt": 3000,
    "loan_amount": 50000,
    "age": 32,
    "employment_years": 5,
    "credit_history": 4,
    "dependents": 1,
    "savings_balance": 25000
  }'
```

**Response (with SHAP explanations):**
```json
{
  "score": 78,
  "risk_status": "Düşük Risk",
  "dti": 20.0,
  "lti": 3.33,
  "ai_advice": "...",
  "top_factors": [
    {
      "feature": "credit_history",
      "label_en": "Credit History",
      "shap_value": 0.42,
      "impact": "positive"
    }
  ],
  "model_meta": {
    "algorithm": "XGBoost",
    "explainability": "SHAP TreeExplainer"
  }
}
```

#### Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                  User (Browser)                   │
└─────────────────────────┬────────────────────────┘
                          │
                 ┌────────▼─────────┐
                 │  Nginx (Port 80) │   Frontend container
                 │  React SPA       │
                 └────────┬─────────┘
                          │ HTTP (CORS)
                 ┌────────▼─────────┐
                 │  FastAPI (8000)  │   Backend container
                 │  XGBoost + SHAP  │
                 │  Rate Limit      │
                 │  BackgroundTasks │
                 └────────┬─────────┘
                          │ TCP
                 ┌────────▼─────────┐
                 │  PostgreSQL 15   │   Database container
                 └──────────────────┘
```

---

### Future Vision

#### Possible AI Enhancements

| Feature | Description |
|---|---|
| **LLM-Powered Advisor** | Replace rule-based messages with conversational financial guidance from a large language model |
| **Document OCR + AI** | Upload payslip/tax document → automatic income verification with AI |
| **Time-Series Risk Tracking** | Monthly analysis history → income/debt trend visualization |
| **Multi-Model Ensemble** | Combine XGBoost + LightGBM + CatBoost for higher accuracy |
| **Scenario Simulator** | Interactive analysis: "What if I reduce my debt by 30%?" |

#### User Problems to Solve

- **Financial Literacy** — Educational video series and interactive quizzes
- **Accessibility** — Transition to WCAG 2.1 AA standard, screen reader compatibility
- **Bank API Integration** — Open Banking for automatic income/debt fetching
- **Mobile App** — Native iOS/Android apps with React Native

#### Scalability Roadmap

The current Docker Compose architecture is optimized for a single server. The recommended architecture for production scale:

```
User
  ↓
CDN (Cloudflare) → React SPA (Vercel)
  ↓
Load Balancer
  ↓
Kubernetes → FastAPI cluster (3+ instances, auto-scaling)
  ↓
PostgreSQL (Multi-AZ) + Redis (cache + session)
  ↓
ML Inference Service (separate GPU-backed endpoint)
```

**Target Scale:** 100,000 active users, 50,000+ analyses per day, p95 latency < 300ms.

---

## 🔒 Güvenlik / Security

- **Bcrypt** — Parolalar tuzlu hash olarak saklanır, asla düz metin / Passwords stored as salted hashes, never plaintext
- **Parameterized Queries** — SQLAlchemy ORM ile SQL enjeksiyonuna karşı koruma / Protected against SQL injection
- **Pydantic Doğrulama** — Tüm API girdileri tip ve format doğrulamasından geçer / All API inputs are type and format validated
- **Rate Limiting** — IP tabanlı brute-force koruması / IP-based brute-force protection
- **RBAC** — Rol tabanlı erişim kontrolü (`ProtectedRoute` + `AdminRoute`) / Role-based access control
- **CORS** — `CORS_ORIGINS` ortam değişkeni ile yapılandırılabilir / Configurable via environment variable

---

## 📄 Lisans / License

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır. / Licensed under the [MIT License](LICENSE).

> **Yasal Uyarı:** Bu proje yalnızca eğitim, akademik portföy ve teknoloji simülasyonu amacıyla geliştirilmiştir. Sitedeki veriler, haberler ve analiz sonuçları gerçek dışıdır; finansal tavsiye niteliği taşımaz.
>
> **Disclaimer:** This project was developed solely for educational, academic portfolio, and technology simulation purposes. The data, news, and analysis results are fictional and do not constitute financial advice.

---

<div align="center">

**KrediZeka** — Finansal kararlarınızda yapay zekânın gücünden yararlanın.
**KrediZeka** — Make informed financial decisions with the power of AI.

</div>
