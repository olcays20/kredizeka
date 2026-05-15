<div align="center">

# 🛡️ KrediZeka

### Makine Öğrenmesi Destekli Finansal Risk ve Kredi Asistanı

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**KrediZeka**, bireylerin kredi başvurusu yapmadan önce kendi finansal risklerini ölçmelerini sağlayan, yapay zeka destekli modern bir web uygulamasıdır. Random Forest algoritmasıyla eğitilmiş bir ML modeli, kullanıcının gelir, borç ve talep ettiği kredi tutarına göre 0–100 arası bir onaylanma skoru üretir ve kişiselleştirilmiş finansal tavsiyeler sunar.

[Demo](#-ekran-görüntüleri) • [Kurulum](#-kurulum-ve-çalıştırma) • [API Dokümantasyonu](#-api-dokümantasyonu) • [Katkı Sağlama](#-katkı-sağlama)

</div>

---

## ✨ Özellikler

| Özellik | Açıklama |
|---|---|
| 🤖 **ML Tabanlı Risk Skoru** | Random Forest modeli ile 0–100 arası kredi onaylanma skoru |
| 📊 **Findeks Tarzı Görselleştirme** | Renkli ilerleme çubuğu ve dairesel skor gösterimi |
| 🧠 **Yapay Zeka Tavsiyesi** | DTI ve LTI oranlarına dayalı kişiselleştirilmiş finansal öneriler |
| 🔐 **Güvenli Kimlik Doğrulama** | Bcrypt şifreleme ile T.C. No + Parola tabanlı giriş/kayıt |
| 👤 **Kullanıcı Profili** | Meslek ve adres güncelleme imkânı |
| 🛡️ **Form Validasyonu** | Regex ile anlık karakter engelleme (isimde sadece harf, TC'de sadece rakam) |
| 📱 **Duyarlı Tasarım** | Masaüstü odaklı, kurumsal bankacılık UI'ı |
| ⚡ **Yüksek Performans** | Lazy loading, GZip sıkıştırma, asenkron threadpool |

---

## 🏗️ Mimari (Tech Stack)

```
kredizeka/
├── backend/                  # Python + FastAPI API Sunucusu
│   ├── main.py               # API uç noktaları (Register/Login/Profile/Analyze)
│   ├── train_model.py        # ML model eğitim scripti (Random Forest)
│   ├── requirements.txt      # Python bağımlılıkları
│   ├── loan_risk_pipeline.pkl # Eğitilmiş ML pipeline (git ignore)
│   └── kredizeka.db          # SQLite veritabanı (git ignore)
│
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── App.jsx            # Yönlendirme (React Router DOM)
    │   ├── context/
    │   │   └── AuthContext.jsx # Uygulama geneli oturum yönetimi
    │   ├── hooks/
    │   │   └── useAuth.jsx    # Özel kimlik doğrulama hook'u
    │   ├── components/
    │   │   ├── Navbar.jsx     # Duyarlı, scroll-aware gezinme çubuğu
    │   │   └── Footer.jsx     # Kurumsal alt bilgi
    │   └── pages/
    │       ├── RiskReportPage.jsx  # Ana risk analizi sayfası
    │       ├── RegisterPage.jsx    # Kullanıcı kaydı (Regex validasyonlu)
    │       ├── LoginPage.jsx       # Kullanıcı girişi
    │       ├── ProfilePage.jsx     # Profil görüntüleme & güncelleme
    │       ├── BireyselPage.jsx    # Bireysel bankacılık tanıtım
    │       ├── TicariPage.jsx      # Ticari bankacılık tanıtım
    │       └── UrunlerPage.jsx     # Ürün kataloğu
    ├── tailwind.config.js     # Özel renk paleti (primary, accent)
    └── vite.config.js         # Vite yapılandırması
```

### Kullanılan Teknolojiler

**Backend**
- **FastAPI** — Modern, yüksek performanslı Python web framework
- **scikit-learn** — Random Forest sınıflandırma modeli
- **pandas / numpy** — Veri işleme ve model girdisi hazırlama
- **SQLite + sqlite3** — Hafif, kurulum gerektirmeyen ilişkisel veritabanı
- **Bcrypt** — Endüstri standardı parola şifreleme
- **Uvicorn** — ASGI tabanlı yüksek performanslı sunucu

**Frontend**
- **React 19** — Bileşen tabanlı UI kütüphanesi
- **Vite** — Anlık HMR destekli modern derleme aracı
- **Tailwind CSS 3** — Utility-first CSS framework
- **React Router DOM** — İstemci taraflı yönlendirme (SPA)
- **Lucide React** — Tutarlı ve hafif ikon kütüphanesi
- **react-hot-toast** — Kullanıcı dostu bildirim sistemi

**Makine Öğrenmesi**
- **Algoritma:** Random Forest Classifier (200 karar ağacı)
- **Ön İşleme:** StandardScaler (özellik normalizasyonu)
- **Pipeline:** scikit-learn Pipeline (ön işleme + model tek nesne)
- **Eğitim Verisi:** 5.000 sentetik finansal kayıt
- **Özellikler:** Aylık gelir, toplam borç, talep edilen kredi tutarı
- **Çıktı:** 0–100 arası onaylanma olasılık skoru

---

## 📸 Ekran Görüntüleri

> Uygulamayı yerel ortamda çalıştırdıktan sonra ekran görüntülerinizi aşağıya ekleyebilirsiniz.

| Risk Analizi | Kayıt Ol | Profil |
|:---:|:---:|:---:|
| ![Risk Analizi](docs/screenshots/risk-report.png) | ![Kayıt](docs/screenshots/register.png) | ![Profil](docs/screenshots/profile.png) |

| Bireysel | Ticari | Ürünler |
|:---:|:---:|:---:|
| ![Bireysel](docs/screenshots/bireysel.png) | ![Ticari](docs/screenshots/ticari.png) | ![Ürünler](docs/screenshots/urunler.png) |

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- **Python 3.10+** — [python.org](https://python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)

---

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
> Bu komut `loan_risk_pipeline.pkl` dosyasını oluşturur. Komut tamamlandığında model doğruluk skoru ve özellik önemleri ekrana yazdırılır.

**5. API sunucusunu başlatın:**
```bash
uvicorn main:app --reload --port 8000
```

API sunucusu `http://localhost:8000` adresinde çalışmaya başlar.
Swagger dokümantasyonu: `http://localhost:8000/docs`

---

### Frontend Kurulumu

Yeni bir terminal penceresi açın:

**1. Frontend dizinine gidin:**
```bash
cd frontend
```

**2. Node.js bağımlılıklarını yükleyin:**
```bash
npm install
```

**3. Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

---

### Üretim (Production) Derlemesi

```bash
# Frontend'i derleyin
cd frontend
npm run build

# Backend'i üretim modunda başlatın (reload olmadan)
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 📡 API Dokümantasyonu

Sunucu çalışırken Swagger UI'a erişin: `http://localhost:8000/docs`

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/` | Sağlık kontrolü |
| `POST` | `/api/register` | Yeni kullanıcı kaydı |
| `POST` | `/api/login` | Kullanıcı girişi |
| `GET` | `/api/profile/{tc_no}` | Profil bilgilerini getir |
| `PUT` | `/api/profile` | Meslek ve adres güncelle |
| `POST` | `/api/analyze` | ML tabanlı risk analizi |

### Örnek: Risk Analizi İsteği

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "income": 15000,
    "debt": 3000,
    "loan_amount": 50000
  }'
```

**Örnek Yanıt:**
```json
{
  "score": 72,
  "risk_status": "Orta Risk",
  "risk_color": "yellow",
  "dti": 20.0,
  "lti": 3.3,
  "ai_advice": "⚠️ Kredi onaylanma skorunuz 72/100 ile orta seviyede...\n\n✅ Borç/Gelir oranınız %20.0 ile sağlıklı...",
  "input_summary": {
    "income": 15000,
    "debt": 3000,
    "loan_amount": 50000
  }
}
```

### Risk Skoru Kategorileri

| Skor Aralığı | Durum | Renk |
|---|---|---|
| 75 – 100 | ✅ Düşük Risk | Yeşil |
| 50 – 74 | ⚠️ Orta Risk | Sarı |
| 25 – 49 | 🔶 Yüksek Risk | Turuncu |
| 0 – 24 | 🔴 Çok Yüksek Risk | Kırmızı |

---

## 🔒 Güvenlik

- **Bcrypt** — Parolalar asla düz metin olarak saklanmaz; her kayıtta benzersiz tuz (salt) eklenir
- **Parameterized Queries** — SQL enjeksiyonu (SQL Injection) saldırılarına karşı tüm sorgular parametreli yazılmıştır
- **CORS** — Geliştirme ortamında tüm kaynaklara açık; üretimde kısıtlanmalıdır
- **Pydantic Doğrulama** — Tüm API girdileri tip ve aralık doğrulamasından geçer
- **Form Validasyonu** — Frontend'de Regex ile anlık karakter engelleme uygulanır

---

## 🤝 Katkı Sağlama

Katkılarınızı memnuniyetle karşılarız!

```bash
# 1. Projeyi fork edin
# 2. Feature branch oluşturun
git checkout -b ozellik/yeni-ozellik

# 3. Değişikliklerinizi commit edin
git commit -m "feat: yeni özellik açıklaması"

# 4. Branch'ı push edin
git push origin ozellik/yeni-ozellik

# 5. Pull Request açın
```

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

<div align="center">

**KrediZeka** — Finansal kararlarınızda yapay zekanın gücünden yararlanın.

*Python + FastAPI + React + scikit-learn ile geliştirilmiştir.*

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

</div>
