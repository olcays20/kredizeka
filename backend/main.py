"""
KrediZeka - FastAPI Arka Yüz (Backend) Sunucusu
=================================================
Bu dosya, KrediZeka uygulamasının tüm API uç noktalarını (endpoints) içerir.
SQLite veritabanı, kullanıcı kimlik doğrulaması ve ML model tahminlemesi
bu sunucu üzerinden yönetilir.

Çalıştırma:
    uvicorn main:app --reload --port 8000

Swagger Dokümantasyonu:
    http://localhost:8000/docs
"""

import os
import sqlite3
import joblib
import bcrypt
import pandas as pd
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel, Field, field_validator
from typing import Optional

# =============================================================================
# GLOBAL DEĞİŞKENLER
# =============================================================================
# Veritabanı ve ML modeli sunucu başlatılırken yüklenir ve burada saklanır.
DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kredizeka.db")
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "loan_risk_pipeline.pkl")

# ML modeli bellekte tutulacak (her istekte diskten okumamak için)
ml_model = None

# =============================================================================
# VERİTABANI İŞLEMLERİ
# =============================================================================

def get_db_connection():
    """
    SQLite veritabanına yeni bir bağlantı oluşturur.
    
    row_factory = sqlite3.Row ayarı, sorgu sonuçlarının sözlük (dict) gibi
    erişilebilir olmasını sağlar. Örn: row['full_name'] şeklinde kullanılır.
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """
    Uygulama ilk çalıştırıldığında veritabanı tablosunu oluşturur.
    
    'users' tablosu:
      - id: Otomatik artan birincil anahtar (primary key)
      - tc_no: T.C. Kimlik Numarası (benzersiz - unique)
      - full_name: Ad Soyad
      - phone: Cep telefonu numarası
      - password_hash: Bcrypt ile şifrelenmiş (hash'lenmiş) parola
      - occupation: Meslek bilgisi (isteğe bağlı, sonradan güncellenebilir)
      - address: Adres bilgisi (isteğe bağlı, sonradan güncellenebilir)
    
    IF NOT EXISTS: Tablo zaten varsa tekrar oluşturmaz, hata vermez.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tc_no TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            occupation TEXT DEFAULT '',
            address TEXT DEFAULT ''
        )
    """)
    conn.commit()
    conn.close()
    print("✅ Veritabanı hazır: users tablosu kontrol edildi/oluşturuldu.")

# =============================================================================
# PYDANTIC MODELLER (Veri Şemaları)
# =============================================================================
# Pydantic modelleri, API'ye gelen isteklerin otomatik doğrulanmasını sağlar.
# Yanlış tipte veri geldiğinde FastAPI otomatik olarak 422 hatası döndürür.

class RegisterRequest(BaseModel):
    """Kayıt olma isteği için beklenen veri yapısı"""
    tc_no: str = Field(..., min_length=11, max_length=11, description="11 haneli T.C. Kimlik No")
    full_name: str = Field(..., min_length=2, max_length=100, description="Ad Soyad")
    phone: str = Field(..., min_length=11, max_length=11, description="11 haneli cep telefonu")
    password: str = Field(..., min_length=6, max_length=100, description="Parola (min 6 karakter)")

    @field_validator('tc_no')
    @classmethod
    def validate_tc_no(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("T.C. Kimlik Numarası yalnızca rakamlardan oluşmalıdır.")
        if v[0] == '0':
            raise ValueError("T.C. Kimlik Numarası 0 ile başlayamaz.")
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("Telefon numarası yalnızca rakamlardan oluşmalıdır.")
        return v

class LoginRequest(BaseModel):
    """Giriş yapma isteği için beklenen veri yapısı"""
    tc_no: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=6)

class ProfileUpdateRequest(BaseModel):
    """Profil güncelleme isteği için beklenen veri yapısı"""
    tc_no: str = Field(..., min_length=11, max_length=11)
    occupation: str = Field("", max_length=200, description="Meslek")
    address: str = Field("", max_length=500, description="Adres")

class AnalyzeRequest(BaseModel):
    """
    Risk analizi isteği için beklenen veri yapısı.
    
    income: Aylık gelir (TL)
    debt: Toplam borç (TL)
    loan_amount: Talep edilen kredi tutarı (TL)
    
    gt (greater than) 0: Tüm değerlerin 0'dan büyük olması zorunlu.
    """
    income: float = Field(..., gt=0, description="Aylık gelir (TL)")
    debt: float = Field(..., ge=0, description="Toplam borç (TL)")
    loan_amount: float = Field(..., gt=0, description="Talep edilen kredi tutarı (TL)")

# =============================================================================
# FASTAPI LIFESPAN (Yaşam Döngüsü)
# =============================================================================
# lifespan, uygulamanın başlatılma ve kapatılma anlarında çalışacak kodları tanımlar.
# "yield" öncesi: Uygulama başlarken çalışır (startup)
# "yield" sonrası: Uygulama kapanırken çalışır (shutdown)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI yaşam döngüsü yöneticisi.
    
    Başlatma sırasında:
    1. SQLite veritabanını başlatır (tablo yoksa oluşturur)
    2. Eğitilmiş ML modelini diskten belleğe yükler
    
    Kapatma sırasında:
    - Temizlik işlemleri yapılır (şu an için gerek yok)
    """
    global ml_model
    
    print("\n" + "=" * 60)
    print("🚀 KrediZeka API Sunucusu Başlatılıyor...")
    print("=" * 60)
    
    # Veritabanını başlat
    init_database()
    
    # ML Modelini yükle
    if os.path.exists(MODEL_PATH):
        ml_model = joblib.load(MODEL_PATH)
        print(f"✅ ML Modeli yüklendi: {MODEL_PATH}")
    else:
        print(f"⚠️  UYARI: ML model dosyası bulunamadı: {MODEL_PATH}")
        print("   Önce 'python train_model.py' komutunu çalıştırın!")
    
    print("\n✅ Sunucu hazır! → http://localhost:8000")
    print("📖 API Docs  → http://localhost:8000/docs")
    print("=" * 60 + "\n")
    
    yield  # Uygulama çalışırken burada bekler
    
    # Kapatma (shutdown) işlemleri
    print("\n🔴 KrediZeka API Sunucusu kapatılıyor...")

# =============================================================================
# FASTAPI UYGULAMA OLUŞTURMA
# =============================================================================
app = FastAPI(
    title="KrediZeka API",
    description="Makine Öğrenmesi destekli Finansal Risk ve Kredi Asistanı API'si",
    version="1.0.0",
    lifespan=lifespan
)

# =============================================================================
# CORS AYARLARI
# =============================================================================
# CORS (Cross-Origin Resource Sharing), farklı kaynaklardan (port/domain) gelen
# HTTP isteklerine izin verir. React uygulaması localhost:5173'te çalışırken,
# API localhost:8000'de çalışır. CORS olmadan tarayıcı bu istekleri engeller.
#
# Geliştirme ortamında: Tüm kaynaklara izin veriyoruz (allow_origins=["*"])
# Üretim ortamında: Sadece kendi domain'inize izin verin (aşağıya bakınız)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ÜRETİM İÇİN: ["https://sizin-domain.vercel.app"]
    allow_credentials=False,  # localStorage kullanılıyor; wildcard origin ile credentials=True geçersiz
    allow_methods=["*"],     # Tüm HTTP metotlarına izin ver (GET, POST, PUT, DELETE)
    allow_headers=["*"],     # Tüm HTTP başlıklarına izin ver
)

# GZIP Sıkıştırma Middleware'i (Performans Optimizasyonu)
# Sunucudan dönen büyük JSON verilerini sıkıştırarak ağ gecikmesini ve bant genişliği kullanımını azaltır.
app.add_middleware(GZipMiddleware, minimum_size=1000)

# =============================================================================
# API UC NOKTALARI (ENDPOINTS)
# =============================================================================

@app.get("/")
async def root():
    """
    Kök endpoint - API'nin çalışıp çalışmadığını kontrol etmek için kullanılır.
    """
    return {
        "message": "KrediZeka API çalışıyor",
        "version": "1.0.0",
        "docs": "/docs"
    }

# ─── 1) KAYIT OL (REGISTER) ─────────────────────────────────────────────────
@app.post("/api/register")
async def register(req: RegisterRequest):
    """
    Yeni kullanıcı kaydı oluşturur.
    
    İşlem Adımları:
    1. T.C. No'nun daha önce kayıtlı olup olmadığını kontrol eder
    2. Parolayı Bcrypt ile şifreler (hash'ler)
    3. Kullanıcıyı veritabanına kaydeder
    
    Bcrypt Şifreleme Neden Önemli?
    - Parolalar veritabanında asla düz metin olarak saklanmamalıdır
    - Bcrypt, her şifreleme için benzersiz bir "tuz" (salt) ekler
    - Bu sayede aynı parola bile farklı hash değerleri üretir
    - Kaba kuvvet (brute force) saldırılarına karşı yavaşlatma mekanizması içerir
    
    Hata Durumları:
    - 409: Aynı T.C. No ile daha önce kayıt yapılmışsa
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # T.C. No benzersizlik kontrolü
        existing = cursor.execute("SELECT id FROM users WHERE tc_no = ?", (req.tc_no,)).fetchone()
        if existing:
            raise HTTPException(
                status_code=409,
                detail="Bu T.C. Kimlik Numarası ile zaten bir hesap bulunmaktadır."
            )

        # Parolayı Bcrypt ile şifrele
        # gensalt(): Rastgele bir tuz (salt) üretir
        # hashpw(): Parola + tuz birleşimini hash'ler
        # encode('utf-8'): String'i byte dizisine çevirir (bcrypt byte dizisi bekler)
        password_hash = bcrypt.hashpw(
            req.password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')  # Byte dizisini tekrar string'e çeviriyoruz (veritabanında saklamak için)

        # Kullanıcıyı veritabanına kaydet
        cursor.execute(
            "INSERT INTO users (tc_no, full_name, phone, password_hash) VALUES (?, ?, ?, ?)",
            (req.tc_no, req.full_name, req.phone, password_hash)
        )
        conn.commit()
    finally:
        conn.close()

    return {
        "success": True,
        "message": f"Hoş geldiniz {req.full_name}! Hesabınız başarıyla oluşturuldu."
    }

# ─── 2) GİRİŞ YAP (LOGIN) ──────────────────────────────────────────────────
@app.post("/api/login")
async def login(req: LoginRequest):
    """
    Kullanıcı girişi yapar (T.C. No ve Parola doğrulaması).
    
    İşlem Adımları:
    1. T.C. No ile kullanıcıyı veritabanından bulur
    2. Girilen parolayı veritabanındaki hash ile karşılaştırır
    3. Başarılıysa kullanıcı bilgilerini döndürür
    
    bcrypt.checkpw() Nasıl Çalışır?
    - Girilen parolayı aynı tuz (salt) ile hash'ler
    - Oluşan hash'i veritabanındakiyle karşılaştırır
    - Eşleşiyorsa True, eşleşmiyorsa False döndürür
    
    Hata Durumları:
    - 401: T.C. No bulunamadıysa veya parola yanlışsa
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Kullanıcıyı T.C. No ile bul
        user = cursor.execute("SELECT * FROM users WHERE tc_no = ?", (req.tc_no,)).fetchone()
    finally:
        conn.close()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Bu T.C. Kimlik Numarası ile kayıtlı bir hesap bulunamadı."
        )
    
    # Parola doğrulaması
    # checkpw: Girilen parolayı veritabanındaki hash ile karşılaştırır
    is_valid = bcrypt.checkpw(
        req.password.encode('utf-8'),
        user['password_hash'].encode('utf-8')
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=401,
            detail="Parola hatalı. Lütfen tekrar deneyiniz."
        )
    
    return {
        "success": True,
        "message": f"Giriş başarılı! Hoş geldiniz {user['full_name']}.",
        "user": {
            "tc_no": user['tc_no'],
            "full_name": user['full_name'],
            "phone": user['phone'],
            "occupation": user['occupation'] or "",
            "address": user['address'] or ""
        }
    }

# ─── 3) PROFİL GETİR (GET PROFILE) ─────────────────────────────────────────
@app.get("/api/profile/{tc_no}")
async def get_profile(tc_no: str):
    """
    Belirtilen T.C. No'ya ait kullanıcı profilini getirir.
    
    Path Parameter: tc_no → URL'de /api/profile/12345678901 şeklinde gönderilir
    
    Hata Durumları:
    - 404: T.C. No ile eşleşen kullanıcı bulunamazsa
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        user = cursor.execute("SELECT * FROM users WHERE tc_no = ?", (tc_no,)).fetchone()
    finally:
        conn.close()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı."
        )
    
    return {
        "tc_no": user['tc_no'],
        "full_name": user['full_name'],
        "phone": user['phone'],
        "occupation": user['occupation'] or "",
        "address": user['address'] or ""
    }

# ─── 4) PROFİL GÜNCELLE (UPDATE PROFILE) ────────────────────────────────────
@app.put("/api/profile")
async def update_profile(req: ProfileUpdateRequest):
    """
    Kullanıcının meslek ve adres bilgilerini günceller.
    
    HTTP PUT Metodu: Kaynağın tamamını veya bir kısmını günceller.
    
    Hata Durumları:
    - 404: T.C. No ile eşleşen kullanıcı bulunamazsa
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Kullanıcının var olup olmadığını kontrol et
        user = cursor.execute("SELECT id FROM users WHERE tc_no = ?", (req.tc_no,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

        # Meslek ve adres bilgilerini güncelle
        cursor.execute(
            "UPDATE users SET occupation = ?, address = ? WHERE tc_no = ?",
            (req.occupation, req.address, req.tc_no)
        )
        conn.commit()
    finally:
        conn.close()

    return {
        "success": True,
        "message": "Profil bilgileriniz başarıyla güncellendi."
    }

# ─── 5) RİSK ANALİZİ (ANALYZE) ─────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze_risk(req: AnalyzeRequest):
    """
    Kredi risk analizi yapar ve yapay zeka destekli tavsiye döndürür.
    
    İşlem Adımları:
    1. ML modeli ile onaylanma olasılığını (0-100 skor) hesaplar
    2. Skora göre risk durumunu belirler (Düşük/Orta/Yüksek Risk veya Çok Riskli)
    3. Kural tabanlı finansal tavsiye (ai_advice) oluşturur
    
    Risk Kategorileri:
    - 75-100: ✅ Düşük Risk (Onaylanma olasılığı çok yüksek)
    - 50-74:  ⚠️ Orta Risk (Onaylanabilir, ama dikkat gerekir)
    - 25-49:  🔶 Yüksek Risk (Reddedilme olasılığı yüksek)
    -  0-24:  🔴 Çok Yüksek Risk (Onaylanması çok zor)
    """
    global ml_model
    
    if ml_model is None:
        raise HTTPException(
            status_code=503,
            detail="ML modeli yüklenmemiş. Lütfen önce 'python train_model.py' çalıştırın."
        )
    
    # ML modeline verilecek giriş verisini hazırla
    # DataFrame formatında olmalı çünkü model eğitilirken DataFrame kullanıldı
    input_data = pd.DataFrame({
        'income': [req.income],
        'debt': [req.debt],
        'loan_amount': [req.loan_amount]
    })
    
    # predict_proba: Her sınıf için olasılık döndürür.
    # Optimizasyon: ML modeli CPU yoğun (CPU-bound) bir işlem olduğu için
    # FastAPI'nin asenkron event-loop'unu bloklamaması adına thread havuzunda (run_in_threadpool) çalıştırılır.
    def get_prediction():
        return ml_model.predict_proba(input_data)[:, 1][0]
        
    approval_probability = await run_in_threadpool(get_prediction)
    
    # 0-100 arası skora çevir ve yuvarlayarak tam sayı yap
    score = int(round(approval_probability * 100))
    
    # ─── Risk Durumu Belirleme ───────────────────────────────────────────
    if score >= 75:
        risk_status = "Düşük Risk"
        risk_color = "green"    # Arayüzde yeşil renk kullanılacak
    elif score >= 50:
        risk_status = "Orta Risk"
        risk_color = "yellow"   # Arayüzde sarı renk kullanılacak
    elif score >= 25:
        risk_status = "Yüksek Risk"
        risk_color = "orange"   # Arayüzde turuncu renk kullanılacak
    else:
        risk_status = "Çok Yüksek Risk"
        risk_color = "red"      # Arayüzde kırmızı renk kullanılacak
    
    # ─── Finansal Oranlar ────────────────────────────────────────────────
    # DTI (Debt-to-Income): Borç/Gelir oranı
    # Bankalar genellikle %40'ın altını tercih eder
    dti = round((req.debt / req.income) * 100, 1) if req.income > 0 else 999
    
    # LTI (Loan-to-Income): Kredi/Gelir oranı
    lti = round(req.loan_amount / req.income, 1) if req.income > 0 else 999
    
    # ─── Kural Tabanlı Yapay Zeka Tavsiyesi ──────────────────────────────
    # Finansal verilere ve risk skoruna göre kişiselleştirilmiş tavsiyeler üretir
    advice_parts = []
    
    # Genel skor değerlendirmesi
    if score >= 75:
        advice_parts.append(
            f"🎉 Tebrikler! Kredi onaylanma skorunuz {score}/100 ile oldukça güçlü. "
            f"Finansal profiliniz, kredi kuruluşları tarafından olumlu değerlendirilecek düzeydedir."
        )
    elif score >= 50:
        advice_parts.append(
            f"⚠️ Kredi onaylanma skorunuz {score}/100 ile orta seviyede. "
            f"Krediniz onaylanabilir, ancak faiz oranınız yüksek olabilir. "
            f"Aşağıdaki önerileri dikkate alarak skorunuzu yükseltebilirsiniz."
        )
    elif score >= 25:
        advice_parts.append(
            f"🔶 Kredi onaylanma skorunuz {score}/100 ile düşük seviyede. "
            f"Mevcut finansal durumunuzda kredi başvurusunun reddedilme olasılığı yüksektir. "
            f"Başvuru öncesinde aşağıdaki adımları uygulamanızı öneririz."
        )
    else:
        advice_parts.append(
            f"🔴 Kredi onaylanma skorunuz {score}/100 ile kritik seviyededir. "
            f"Mevcut koşullarla kredi almanız oldukça güçtür. "
            f"Finansal yapınızda ciddi iyileştirmeler yapmanız gerekmektedir."
        )
    
    # Borç/Gelir oranı değerlendirmesi
    if dti > 50:
        advice_parts.append(
            f"📊 Borç/Gelir oranınız %{dti} ile kritik seviyededir (ideal: <%40). "
            f"Mevcut borçlarınızı en az %{int(dti - 35)} oranında azaltmanız, "
            f"kredi onay şansınızı önemli ölçüde artıracaktır. "
            f"Yüksek faizli borçları öncelikli olarak kapatmanız önerilir."
        )
    elif dti > 35:
        advice_parts.append(
            f"📊 Borç/Gelir oranınız %{dti} seviyesindedir. Bu oran kabul edilebilir "
            f"olmakla birlikte, %35'in altına düşürmeniz durumunda daha uygun faiz "
            f"oranları ve daha yüksek kredi limitleri elde edebilirsiniz."
        )
    else:
        advice_parts.append(
            f"✅ Borç/Gelir oranınız %{dti} ile sağlıklı bir seviyededir. "
            f"Bu oran, kredi kuruluşlarının aradığı ideal aralıktadır."
        )
    
    # Kredi/Gelir oranı değerlendirmesi
    if lti > 12:
        advice_parts.append(
            f"💰 Talep ettiğiniz kredi tutarı, aylık gelirinizin {lti} katıdır. "
            f"Bu çok yüksek bir orandır. Kredi tutarını {int(req.income * 8):,.0f}₺ "
            f"civarına düşürmeniz, onaylanma olasılığınızı artıracaktır."
        )
    elif lti > 6:
        advice_parts.append(
            f"💰 Talep ettiğiniz kredi tutarı, aylık gelirinizin {lti} katıdır. "
            f"Bu oran kabul edilebilir düzeydedir, ancak daha düşük bir tutar "
            f"talep etmeniz halinde daha avantajlı koşullar elde edebilirsiniz."
        )
    else:
        advice_parts.append(
            f"✅ Talep ettiğiniz kredi tutarı, aylık gelirinizin {lti} katı olup "
            f"oldukça makul bir seviyededir."
        )
    
    # Gelir bazlı tavsiye
    if req.income < 8000:
        advice_parts.append(
            "💡 Gelirinizi artırmak için ek gelir kaynakları (freelance, yatırım geliri) "
            "oluşturmanız veya maaş artışı talep etmeniz, uzun vadede kredi "
            "kapasitesinizi önemli ölçüde yükseltecektir."
        )
    
    # Tavsiye metnini birleştir (her maddeyi yeni satırla ayır)
    ai_advice = "\n\n".join(advice_parts)
    
    return {
        "score": score,
        "risk_status": risk_status,
        "risk_color": risk_color,
        "dti": dti,
        "lti": lti,
        "ai_advice": ai_advice,
        "input_summary": {
            "income": req.income,
            "debt": req.debt,
            "loan_amount": req.loan_amount
        }
    }

# =============================================================================
# UYGULAMA ÇALIŞTIRMA
# =============================================================================
# Bu dosya doğrudan çalıştırıldığında uvicorn sunucusunu başlatır.
# --reload: Kod değişikliklerinde otomatik yeniden başlatma (geliştirme modu)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
