# KrediZeka Canlıya Alma (Deployment) Rehberi

Projemizin tüm kodlarını bilgisayarınızda başarıyla oluşturduk ve test ettik. Şimdi bu projeyi internet ortamında tüm dünyanın erişebileceği bir şekilde canlıya alacağız.

Bu rehberde **Backend (FastAPI)** için **Render**, **Frontend (React)** için ise **Vercel** platformlarını kullanacağız. Bunlar modern, ücretsiz paketleri olan ve CI/CD (Sürekli Entegrasyon) destekleyen çok popüler platformlardır.

---

## 🏗️ Hazırlık: GitHub Deposu (Repository) Oluşturma

Projeyi canlıya almanın en modern ve kolay yolu kodlarınızı GitHub'a yüklemektir. Vercel ve Render, GitHub'daki deponuzu (repository) okuyarak kodda bir değişiklik yaptığınızda otomatik olarak sitenizi günceller.

1. [GitHub](https://github.com/)'a gidin ve yeni, boş bir **Private (Gizli)** veya **Public (Açık)** depo oluşturun.
2. Terminalinizi (Komut İstemi/VS Code Terminal) açın ve `/Users/olcaybaba/Desktop/proje` dizininde olduğunuzdan emin olun.
3. Aşağıdaki komutları sırasıyla çalıştırarak kodlarınızı GitHub'a gönderin:

```bash
# Proje ana dizininde olduğunuzdan emin olun
git init
git add .
git commit -m "İlk yükleme: KrediZeka Projesi"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/DEPO_ADINIZ.git
git push -u origin main
```

*(Not: `backend/venv` ve `frontend/node_modules` klasörlerinin `.gitignore` dosyasında olduğundan emin olun, ki zaten React ve Python kurulumlarında otomatik olarak eklenirler.)*

---

## 🚀 ADIM 1: Backend'i (FastAPI) Render.com'da Canlıya Alma

FastAPI arka yüzümüzü ücretsiz ve hızlı bir şekilde [Render](https://render.com) üzerinde yayınlayacağız.

### 1. Render Ayarları
1. Render.com'a gidin ve GitHub hesabınızla giriş yapın.
2. Sağ üstten **New +** butonuna tıklayıp **Web Service** seçeneğini seçin.
3. "Build and deploy from a Git repository" seçeneğiyle devam edin ve az önce oluşturduğunuz GitHub deponuzu bağlayın.
4. Çıkan ayarlar sayfasında şu bilgileri doldurun:
   - **Name:** kredizeka-backend
   - **Root Directory:** `backend` *(Çok önemli! Çünkü backend kodlarımız bu klasörde)*
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && python train_model.py` 
     *(Bu komut, sunucu kurulurken gerekli kütüphaneleri kurar ve Machine Learning modelini - `.pkl` dosyasını - eğitip hazır hale getirir.)*
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Free (Ücretsiz)** planı seçin ve en alttaki **Create Web Service** butonuna tıklayın.

### 2. Canlı URL'yi Alma
Render işlemi bitirdiğinde (birkaç dakika sürebilir), size `https://kredizeka-backend.onrender.com` gibi bir adres verecektir. **Bu adresi kopyalayın, birazdan Frontend ve CORS ayarları için kullanacağız.**

---

## 🌐 ADIM 2: Frontend'i (React) Vercel'de Canlıya Alma

Ön yüzümüzü yayınlamak için en iyi seçenek olan [Vercel](https://vercel.com)'i kullanacağız. Ancak bundan önce kodumuzda ufak bir düzenleme yapmalıyız.

### 1. API Bağlantılarını Güncelleme
Şu anda React kodlarınızda (`LoginPage.jsx`, `RegisterPage.jsx` vb.) istekler `http://localhost:8000` adresine gidiyor. Bunları Render'dan aldığımız canlı adresle değiştirmeliyiz.

**Profesyonel Çözüm (.env kullanımı):**
1. `frontend` klasörü içine `.env` adında yeni bir dosya oluşturun:
```env
VITE_API_URL=https://kredizeka-backend.onrender.com
```

2. Ardından `frontend/src/pages/` içindeki tüm sayfalarda bulunan `http://localhost:8000` kısımlarını şu şekilde değiştirin:
```javascript
// ESKİ:
const response = await fetch("http://localhost:8000/api/login", ...)

// YENİ:
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, ...)
```

*Değişiklikleri yaptıktan sonra kodlarınızı tekrar GitHub'a pushlayın:*
```bash
git add .
git commit -m "API URL Vercel için güncellendi"
git push
```

### 2. Vercel Ayarları
1. Vercel.com'a gidin ve GitHub ile giriş yapın.
2. **Add New... > Project** tıklayın.
3. GitHub deponuzu seçip **Import** deyin.
4. Gelen ekranda:
   - **Framework Preset:** `Vite` (Otomatik algılamalıdır)
   - **Root Directory:** Edit (Düzenle) butonuna tıklayıp listeden `frontend` klasörünü seçin.
5. **Environment Variables** (Çevre Değişkenleri) sekmesini açın ve şunu ekleyin:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://kredizeka-backend.onrender.com` (Render'dan aldığınız adres)
6. **Deploy** butonuna tıklayın!

Bir dakika içinde Vercel size `https://kredizeka-frontend.vercel.app` gibi canlı bir web adresi verecektir.

---

## 🔐 ADIM 3: CORS (Güvenlik) Ayarlarını Güncelleme

Şu anda Frontend'iniz (Vercel) canlıda, Backend'iniz (Render) canlıda. Ancak birisi Vercel adresinizden giriş yapmaya çalıştığında tarayıcı bunu "CORS Hatası" vererek engelleyecektir. Çünkü Backend'e, "Sadece benim Vercel adresimden gelen isteklere izin ver" dememiz gerekiyor.

Bilgisayarınızdaki `backend/main.py` dosyasını açın ve **186. satırdaki** CORS ayarlarını şu şekilde güncelleyin:

```python
# =============================================================================
# CORS AYARLARI
# =============================================================================
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"], # Bunu yoruma alın veya silin
    
    # Vercel'den aldığınız URL'yi BURAYA EKLEYİN (Sonunda '/' (slash) olmamalıdır!)
    allow_origins=[
        "http://localhost:5173", # Geliştirme için kalsın
        "https://kredizeka-frontend.vercel.app" # SİZİN VERCEL ADRESİNİZ
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Bu değişikliği de GitHub'a gönderin:
```bash
cd backend
git add main.py
git commit -m "CORS ayarları Vercel için eklendi"
git push
```

*Not: Siz GitHub'a push yaptığınız anda Render.com değişikliği algılayacak ve Backend sunucunuzu otomatik olarak güncelleyecektir.*

---

## 🎉 Tebrikler!

KrediZeka uygulamanız artık tüm dünyadan erişilebilir durumda! 
1. Uygulama veritabanı SQLite olduğu için Render her kapanıp açıldığında sıfırlanabilir. Üretim ortamında (Production) SQLite yerine PostgreSQL kullanmak daha profesyoneldir (Render ücretsiz PostgreSQL de sağlar).
2. Makine öğrenmesi modeli (pkl) Render sunucusu başlarken `train_model.py` tarafından yeniden oluşturulacağı için sorunsuz çalışacaktır.
