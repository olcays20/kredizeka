<div align="center">

# KrediZeka

### Enterprise-Grade AI Powered Financial Risk & Credit Assistant
### Yapay Zekâ Destekli Kurumsal Finansal Risk ve Kredi Asistanı

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.1-FF6F00?style=for-the-badge)](https://xgboost.ai)
[![SHAP](https://img.shields.io/badge/SHAP-0.46-E91E63?style=for-the-badge)](https://shap.readthedocs.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**🇹🇷 [Türkçe](#-türkçe) · 🇬🇧 [English](#-english)**

</div>

---

## 🇹🇷 Türkçe

> Açıklanabilir yapay zekâ (XAI), PostgreSQL kalıcı veri katmanı, Docker konteyner mimarisi ve çift dil desteğiyle uçtan uca üretilmiş bir akademik portföy projesi.

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
| **XGBoost ML Modeli** | GridSearchCV ile hiperparametre optimize edilmiş, %98+ doğruluğa sahip gradient boosting modeli |
| **SHAP Açıklanabilirlik** | Her tahminin arkasındaki kararı oluşturan en etkili 5 faktörü yatay bar grafikle gösterir |
| **PostgreSQL + SQLAlchemy** | Üretim seviyesinde kalıcı veri katmanı (SQLite fallback ile yerel test desteği) |
| **Docker Compose** | 3 servis (db/backend/frontend) tek komutla ayağa kalkar |
| **Rate Limiting** | `slowapi` ile IP tabanlı brute-force koruması (giriş: 5/dk, analiz: 10/dk) |
| **Background Tasks** | FastAPI BackgroundTasks ile asenkron e-posta simülasyonu — kullanıcı bekletilmez |
| **JWT-Hazır RBAC** | `is_admin` rolü ile yönetici paneli ve `X-User-TC` header tabanlı yetki guard |
| **Çoklu Dil (i18n)** | react-i18next ile TR/EN tam çeviri, localStorage cache |
| **Dark Mode** | Tailwind class-based dark theme, Sun/Moon toggle, sistem tercihi algılama |
| **Stepper Form** | 3 adımlı wizard ile risk analizi (kişisel → finansal → sonuç) |
| **PDF Export** | html2canvas + jsPDF ile yüksek çözünürlüklü A4 rapor indirme |
| **Recharts Grafikler** | Pasta grafiği (finansal dağılım) + yatay bar grafiği (SHAP etki) |
| **Bcrypt Şifreleme** | Parolalar tuzlu hash olarak saklanır; düz metin asla |
| **Profil Fotoğrafı** | Base64 yükleme + boyut/format doğrulama |

---

### Kullanılan AI Araçları

Bu projeyi geliştirirken, üretkenliği artırmak amacıyla aşağıdaki yapay zekâ araçlarından yararlandım. Tasarım kararları, mimari seçimler, problem tanımı ve uygulama testleri tamamen kendi sorumluluğumdadır; AI araçları yardımcı bir hızlandırıcı olarak konumlandırılmıştır.

#### Kod Üretimi
- **Claude Code (Anthropic)** — Tekrarlayan kalıpların (CRUD endpoint'leri, Tailwind sınıfları, i18n çevirileri) hızlı şekilde yazılmasında yardımcı olarak kullandım. Üretilen tüm kodları proje gereksinimlerime göre düzenleyip test ettim.
- **GitHub Copilot** — VS Code içinde satır içi öneriler ve docstring tamamlama için kullandım.

#### UI Tasarımı
- **Claude (Anthropic)** — Tailwind utility sınıflarıyla bileşen iskeleti üretmek için kullandım. Referans olarak Findeks ve modern Türk bankacılık arayüzlerini esas aldım; renk paleti, tipografi ve düzen kararlarını kendim verdim.

#### Veri Üretimi
- **Claude (Anthropic)** — Model eğitiminde kullanılacak sentetik finansal veri setini (German Credit Risk benzeri, 6.000 satır) üretmek için yardım aldım. Veri dağılımları ve etiket kurallarını finansal mantığa uygun şekilde kendim doğruladım.

#### İçerik Üretimi
- **Claude (Anthropic)** — KVKK uyumlu hukuki metinler (Gizlilik Politikası, Kullanım Koşulları) ve haber/blog metinleri için ilk taslakları üretmekte kullandım. Tüm içerikleri marka diline ve akademik proje kapsamına göre yeniden düzenledim.

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

**Backend — Rate Limiting + Background Tasks:**
```
FastAPI'de slowapi entegre et. /api/login ve /api/register için IP başına 5/dakika
limit koy. Limit aşılınca 429 dönsün. Ayrıca her başarılı kayıttan sonra
BackgroundTasks ile asenkron bir e-posta simülasyon servisi tetikle (şimdilik
sadece terminale log atsın).
```

**Backend — SQLAlchemy + PostgreSQL Migration:**
```
SQLite kullanan mevcut backend'i SQLAlchemy 2.0 + PostgreSQL'e taşı. database.py
ve models.py ayrı dosyalar olsun. pydantic-settings ile DATABASE_URL env'den
okunsun. Geriye uyumluluk için SQLite fallback bırak. Eski şemaya migration
(ALTER TABLE) yap.
```

**Frontend — Stepper Wizard:**
```
React + Tailwind ile 3 adımlı (Kişisel / Finansal / Sonuç) yatay stepper formu
oluştur. Her adımda validation yap, sonra "İleri" butonu sonraki adıma geçsin.
Tamamlanan adımlar yeşil tikli görünsün, aktif adım büyütülmüş primary renkli,
sonraki adımlar gri. Animasyonlu geçiş ve "Geri" butonu olsun.
```

**Frontend — Dark Mode Context:**
```
React Context ile dark/light tema yönetimi yaz. İlk yükleme önceliği:
localStorage > prefers-color-scheme > 'light'. Tema değişiminde <html> sınıfına
'dark' ekle/çıkar. useTheme custom hook'u sağla. Tailwind class-based dark mode
ile uyumlu olsun.
```

#### Veri Üretim Promptları

**Sentetik German Credit Risk Veri Seti:**
```
Numpy + Pandas ile 6000 satırlık sentetik finansal veri seti üret. Sütunlar:
income (log-normal), debt (gelirin %0-150'si), loan_amount (log-normal),
age (normal 18-75), employment_years (yaşa bağlı), credit_history (0-5 beta),
dependents (Poisson), savings_balance (log-normal). Etiket için lojistik
fonksiyon kullan: pozitif faktörler (geçmiş, tecrübe, birikim) ve negatif
faktörler (DTI, LTI, bakmakla yükümlü) puanı belirlesin. ~%55 onay oranı hedefle.
```

#### UI Üretim Promptları

**Recharts Yatay SHAP BarChart:**
```
Recharts ile yatay BarChart oluştur. SHAP değerlerine göre top 5 faktörü göster.
Pozitif değerler emerald (#10b981), negatif değerler red (#ef4444) renkli olsun.
Y ekseni feature ismi (Türkçe etiket), X ekseni SHAP değeri. Tooltip'te
"+0.420 → Olumlu Etki" formatında göster. Dark mode'da CartesianGrid ve text
renkleri otomatik adapte olsun.
```

#### İçerik Üretim Promptları

**KVKK Uyumlu Gizlilik Politikası:**
```
KrediZeka için KVKK (6698) uyumlu Türkçe Gizlilik Politikası metni yaz. 7 bölüm:
Veri Sorumlusu, Toplanan Veriler, İşlenme Amacı, Saklama ve Güvenlik, Üçüncü
Taraflarla Paylaşım, Çerezler Politikası, KVKK Madde 11 Hakları. Gerçekçi hukuki
terminoloji kullan. Hem TR hem EN versiyonları üret.
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
# (.env içindeki şifreleri istersen güncelle)

# 3. Tüm servisleri başlat
docker compose up --build
```

Erişim:
- **Frontend** → http://localhost
- **Backend API** → http://localhost:8000
- **Swagger Docs** → http://localhost:8000/docs
- **PostgreSQL** → localhost:5432

İlk açılışta backend, modeli (`loan_risk_pipeline.pkl`) otomatik eğitir ve veritabanı şemasını oluşturur. Varsayılan admin hesabı: `11111111111` / `admin123`.

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

#### API Örnekleri

**Risk Analizi:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-User-TC: 12345678901" \
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
  "ai_advice": "🎉 Tebrikler! Kredi onaylanma skorunuz 78/100...",
  "top_factors": [
    {
      "feature": "credit_history",
      "label_tr": "Kredi Geçmişi",
      "label_en": "Credit History",
      "shap_value": 0.42,
      "abs_value": 0.42,
      "impact": "positive",
      "input_value": 4
    },
    {
      "feature": "dti_ratio",
      "label_tr": "Borç/Gelir Oranı",
      "label_en": "Debt-to-Income Ratio",
      "shap_value": -0.18,
      "abs_value": 0.18,
      "impact": "negative",
      "input_value": 20.0
    }
  ],
  "model_meta": {
    "version": "2.0",
    "algorithm": "XGBoost",
    "explainability": "SHAP TreeExplainer"
  }
}
```

#### Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────┐
│                    Kullanıcı (Tarayıcı)                  │
└────────────────────────┬────────────────────────────────┘
                         │
                ┌────────▼─────────┐
                │  Nginx (Port 80) │  ← Frontend container
                │  React SPA       │
                │  - Stepper Form  │
                │  - SHAP BarChart │
                │  - Dark Mode     │
                │  - i18n TR/EN    │
                └────────┬─────────┘
                         │ HTTP (CORS)
                ┌────────▼─────────┐
                │  FastAPI (8000)  │  ← Backend container
                │  - XGBoost +SHAP │
                │  - Rate Limit    │
                │  - BgTasks       │
                │  - SQLAlchemy    │
                └────────┬─────────┘
                         │ TCP
                ┌────────▼─────────┐
                │  PostgreSQL 15   │  ← DB container
                │  - users tablosu │
                │  - kalıcı volume │
                └──────────────────┘
```

---

### Gelecek Vizyonu

#### Geliştirilebilecek AI Özellikleri

| Özellik | Açıklama |
|---|---|
| **LLM Destekli Tavsiye Motoru** | Kural tabanlı mesajların yerine GPT-4o / Claude ile kişiye özel konuşma tarzında finansal danışmanlık |
| **Belge OCR + AI** | Maaş bordrosu/vergi levhası yükleme → AI ile otomatik gelir doğrulama |
| **Zaman Serisi Risk Takibi** | Aylık analizlerin geçmişi → gelir/borç trend grafiği |
| **Çoklu Model Ensemble** | XGBoost + LightGBM + CatBoost stacking ile %99+ doğruluk hedefi |
| **What-If Senaryoları** | "Borcumu %30 azaltırsam skor ne olur?" interaktif simülatör |
| **Sesli Asistan** | Whisper STT + GPT TTS ile sesli soru-cevap arayüzü |

#### Çözülebilecek Kullanıcı Problemleri

- **Finansal Okuryazarlık** — Eğitici video serisi, etkileşimli quiz'ler ile kullanıcıyı eğitme
- **Erişilebilirlik** — WCAG 2.1 AA standardına geçiş, ekran okuyucu uyumluluğu
- **Banka API Entegrasyonu** — Open Banking (BDDK onaylı) ile gerçek banka verisinden otomatik gelir/borç çekme
- **Mobil Uygulama** — React Native ile iOS/Android native uygulamalar (web kodu paylaşımıyla)

#### Ölçeklenebilirlik Yol Haritası

Mevcut Docker Compose mimarisi tek sunucu için optimize edilmiştir. Gerçek üretim ölçeği için:

```
Kullanıcı
   ↓
CDN (Cloudflare) → Vercel (React SPA)
   ↓
AWS ALB (Load Balancer)
   ↓
ECS / Kubernetes → FastAPI cluster (3+ instance, auto-scaling)
   ↓
RDS PostgreSQL Multi-AZ + Redis ElastiCache (oturum + cache)
   ↓
ML Inference Service (ayrı SageMaker endpoint, GPU destekli)
   ↓
S3 (PDF arşivi, model artifact'ları) + CloudWatch (loglar, metrikler)
```

**Beklenen Ölçek:** 100.000 aktif kullanıcı, günde 50.000+ analiz, p95 latency < 300ms.

---

## 🇬🇧 English

> An academic portfolio project built end-to-end with Explainable AI (XAI), a persistent PostgreSQL data layer, Docker container architecture, and full bilingual support.

---

### Project Overview

**KrediZeka** is a modern, AI-powered web application that helps individuals assess their own credit risk before applying for a loan.

#### Target Audience

In Turkey, millions of credit applications are submitted every year, yet a significant portion is rejected at the pre-evaluation stage. The root cause is that applicants cannot objectively evaluate their own financial profile. KrediZeka is designed for individual users who want to recognize risks beforehand, people seeking financial guidance, and SMB owners who need a pre-assessment tool.

#### The Problem It Solves

Traditional credit evaluation processes are opaque and inaccessible to end users. KrediZeka tackles this in four steps:

1. **Instant Risk Score** — A 0-100 approval probability is generated based on income, debt, requested loan amount, age, credit history, and savings.
2. **Explainable AI (XAI)** — SHAP TreeExplainer transparently shows *why* each score was produced and which factors had positive/negative impact.
3. **Financial Ratio Analysis** — DTI (Debt-to-Income) and LTI (Loan-to-Income) ratios are compared to industry benchmarks.
4. **Personalized Recommendation** — A rule-based engine provides advice tailored to the user's profile.

#### Highlight Features

| Feature | Description |
|---|---|
| **XGBoost ML Model** | Gradient boosting model with GridSearchCV hyperparameter tuning, 98%+ accuracy |
| **SHAP Explainability** | Top 5 most influential factors visualized via horizontal bar chart |
| **PostgreSQL + SQLAlchemy** | Production-grade persistent data layer (SQLite fallback for local dev) |
| **Docker Compose** | 3 services (db / backend / frontend) start with a single command |
| **Rate Limiting** | IP-based brute-force protection via `slowapi` (login: 5/min, analyze: 10/min) |
| **Background Tasks** | Async email simulation via FastAPI BackgroundTasks — user is never blocked |
| **JWT-Ready RBAC** | `is_admin` role with admin panel and `X-User-TC` header-based authorization guard |
| **Multi-Language (i18n)** | Full TR/EN translation with react-i18next, localStorage caching |
| **Dark Mode** | Tailwind class-based dark theme, Sun/Moon toggle, system preference detection |
| **Stepper Form** | 3-step wizard for risk analysis (personal → financial → result) |
| **PDF Export** | High-resolution A4 report download via html2canvas + jsPDF |
| **Recharts Visualizations** | Pie chart (financial breakdown) + horizontal bar chart (SHAP impact) |
| **Bcrypt Encryption** | Passwords stored as salted hashes; never plaintext |
| **Profile Picture Upload** | Base64 upload with size/format validation |

---

### AI Tools Used

While building this project, I leveraged the following AI tools to boost productivity. Design decisions, architectural choices, problem definition, and testing remain entirely my own responsibility; AI tools served as helpful accelerators.

#### Code Generation
- **Claude Code (Anthropic)** — Used as an assistant for quickly writing repetitive patterns (CRUD endpoints, Tailwind classes, i18n translations). All generated code was reviewed, adapted to project requirements, and tested by me.
- **GitHub Copilot** — Used inside VS Code for inline suggestions and docstring completion.

#### UI Design
- **Claude (Anthropic)** — Used to generate component scaffolds with Tailwind utility classes. I made the color palette, typography, and layout decisions myself, with Findeks and modern Turkish banking interfaces as references.

#### Data Generation
- **Claude (Anthropic)** — Helped produce the synthetic financial dataset (German Credit Risk-style, 6,000 rows) used for model training. I validated the data distributions and labeling rules to ensure they aligned with sound financial logic.

#### Content Generation
- **Claude (Anthropic)** — Used to draft initial versions of KVKK-compliant legal texts (Privacy Policy, Terms of Use) and news/blog copy. All content was revised to fit the brand voice and academic project scope.

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

**Backend — Rate Limiting + Background Tasks:**
```
Integrate slowapi into FastAPI. Set a 5/minute IP limit on /api/login and
/api/register. Return HTTP 429 when exceeded. Also fire an async email
simulation via BackgroundTasks after a successful registration (just log to
the terminal for now).
```

**Backend — SQLAlchemy + PostgreSQL Migration:**
```
Migrate the existing SQLite backend to SQLAlchemy 2.0 + PostgreSQL. Put database.py
and models.py in separate files. Read DATABASE_URL from env via pydantic-settings.
Keep a SQLite fallback for backward compatibility. Provide ALTER TABLE migration
for the legacy schema.
```

**Frontend — Stepper Wizard:**
```
Build a 3-step (Personal / Financial / Result) horizontal stepper form with
React + Tailwind. Validate each step before allowing Next. Completed steps
show a green check, the active step is enlarged in primary color, upcoming
steps are gray. Add smooth transitions and a Back button.
```

**Frontend — Dark Mode Context:**
```
Write a React Context for dark/light theme management. Initial priority:
localStorage > prefers-color-scheme > 'light'. Toggle the 'dark' class on <html>
when theme changes. Expose a useTheme custom hook. Must be compatible with
Tailwind class-based dark mode.
```

#### Data Generation Prompts

**Synthetic German Credit Risk Dataset:**
```
Use NumPy + Pandas to generate a 6000-row synthetic financial dataset. Columns:
income (log-normal), debt (0-150% of income), loan_amount (log-normal),
age (normal, 18-75), employment_years (depends on age), credit_history (0-5 beta),
dependents (Poisson), savings_balance (log-normal). For the label, use a logistic
function: positive factors (history, tenure, savings) and negative factors
(DTI, LTI, dependents) determine the score. Target ~55% approval rate.
```

#### UI Generation Prompts

**Recharts Horizontal SHAP BarChart:**
```
Build a horizontal Recharts BarChart. Show the top 5 features by SHAP value.
Positive values in emerald (#10b981), negative in red (#ef4444). Y-axis: feature
name (translated label). X-axis: SHAP value. Tooltip format: "+0.420 → Positive
Impact". CartesianGrid and text colors should adapt to dark mode automatically.
```

#### Content Generation Prompts

**KVKK-Compliant Privacy Policy:**
```
Write a Turkish Privacy Policy compliant with KVKK (Law No. 6698) for KrediZeka.
7 sections: Data Controller, Collected Data, Processing Purpose, Storage &
Security, Third-Party Sharing, Cookie Policy, KVKK Article 11 Rights. Use
realistic legal terminology. Produce both TR and EN versions.
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
# (Optionally edit passwords in .env)

# 3. Start all services
docker compose up --build
```

Access points:
- **Frontend** → http://localhost
- **Backend API** → http://localhost:8000
- **Swagger Docs** → http://localhost:8000/docs
- **PostgreSQL** → localhost:5432

On first startup, the backend automatically trains the model (`loan_risk_pipeline.pkl`) and creates the database schema. Default admin account: `11111111111` / `admin123`.

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

**Risk Analysis:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-User-TC: 12345678901" \
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
    "version": "2.0",
    "algorithm": "XGBoost",
    "explainability": "SHAP TreeExplainer"
  }
}
```

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User (Browser)                        │
└────────────────────────┬────────────────────────────────┘
                         │
                ┌────────▼─────────┐
                │  Nginx (Port 80) │  ← Frontend container
                │  React SPA       │
                └────────┬─────────┘
                         │ HTTP (CORS)
                ┌────────▼─────────┐
                │  FastAPI (8000)  │  ← Backend container
                │  XGBoost + SHAP  │
                │  slowapi + BgTasks│
                └────────┬─────────┘
                         │ TCP
                ┌────────▼─────────┐
                │  PostgreSQL 15   │  ← DB container
                └──────────────────┘
```

---

### Future Vision

#### Possible AI Enhancements

| Feature | Description |
|---|---|
| **LLM-Powered Advisor** | Replace rule-based messages with GPT-4o / Claude conversational financial guidance |
| **Document OCR + AI** | Upload payslip/tax document → automatic income verification with AI |
| **Time-Series Risk Tracking** | Monthly analysis history → income/debt trend visualization |
| **Multi-Model Ensemble** | XGBoost + LightGBM + CatBoost stacking targeting 99%+ accuracy |
| **What-If Scenarios** | Interactive simulator: "What if I reduce my debt by 30%?" |
| **Voice Assistant** | Whisper STT + GPT TTS for spoken Q&A interface |

#### User Problems to Solve

- **Financial Literacy** — Educational video series and interactive quizzes
- **Accessibility** — Transition to WCAG 2.1 AA standard, screen reader compatibility
- **Bank API Integration** — Open Banking (BDDK-approved) for automatic income/debt fetching
- **Mobile App** — Native iOS/Android apps with React Native (sharing web code)

#### Scalability Roadmap

The current Docker Compose architecture is optimized for a single server. For production scale:

```
User
  ↓
CDN (Cloudflare) → Vercel (React SPA)
  ↓
AWS ALB (Load Balancer)
  ↓
ECS / Kubernetes → FastAPI cluster (3+ instances, auto-scaling)
  ↓
RDS PostgreSQL Multi-AZ + Redis ElastiCache (session + cache)
  ↓
ML Inference Service (separate SageMaker endpoint, GPU-backed)
  ↓
S3 (PDF archive, model artifacts) + CloudWatch (logs, metrics)
```

**Target Scale:** 100,000 active users, 50,000+ analyses per day, p95 latency < 300ms.

---

## 🔒 Security

- **Bcrypt** — Passwords are never stored in plaintext; unique salt per record
- **Parameterized Queries** — Protected against SQL injection via SQLAlchemy ORM
- **Pydantic Validation** — TC No must be digits-only and cannot start with 0
- **Rate Limiting** — IP-based limits prevent brute-force on auth endpoints
- **ProtectedRoute + AdminRoute** — Frontend route guards (`is_admin` check)
- **CORS** — Configurable via `CORS_ORIGINS` environment variable

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**KrediZeka** — Make informed financial decisions with the power of AI.
**KrediZeka** — Finansal kararlarınızda yapay zekânın gücünden yararlanın.

</div>
