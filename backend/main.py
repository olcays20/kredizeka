"""
KrediZeka - FastAPI Backend (Enterprise Edition)
==================================================
Bu sürümle birlikte:
  • PostgreSQL + SQLAlchemy 2.0 ORM (SQLite fallback ile geriye uyumlu)
  • XGBoost + SHAP açıklanabilir yapay zekâ
  • slowapi tabanlı rate limiting (login/register/analyze)
  • BackgroundTasks ile e-posta simülasyonu (asenkron)
  • Pydantic Settings ile ortam değişkeni yönetimi
  • Idempotent schema migration + ilk açılışta admin oluşturma

Çalıştırma:
    Yerel  :  uvicorn main:app --reload --port 8000
    Docker :  docker compose up --build
"""

import os
from datetime import datetime
from typing import Optional, List, Dict

import bcrypt
import joblib
import numpy as np
import pandas as pd
from fastapi import (
    FastAPI, HTTPException, Header, Depends, BackgroundTasks, Request
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from database import engine, SessionLocal, Base, get_db
from models import User
from services.email_service import (
    send_welcome_email, send_analysis_report_email, send_login_notification
)


# =============================================================================
# RATE LIMITER (slowapi)
# =============================================================================
# get_remote_address: İstemci IP'sini X-Forwarded-For veya direct connection'dan alır
# Limit aşılırsa otomatik HTTP 429 döndürülür
limiter = Limiter(key_func=get_remote_address)


# =============================================================================
# ML MODEL BUNDLE (Singleton)
# =============================================================================
# Sunucu başlangıcında yüklenir; sonraki istekler bellekten kullanır
ml_bundle: Optional[dict] = None

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), settings.model_path)


# =============================================================================
# ŞEMA OLUŞTURMA + İLK ADMİN
# =============================================================================

def init_database() -> None:
    """
    Veritabanı şemasını oluşturur ve gerekli ilk verileri yükler.

    1. Tüm ORM modellerini tablolara dönüştürür (CREATE IF NOT EXISTS).
    2. Sistemde admin yoksa varsayılan admin'i oluşturur.
    3. (Geriye uyumluluk) Eski SQLite şemasında eksik kolonları ekler.
    """
    Base.metadata.create_all(bind=engine)
    print("✅ Veritabanı şeması hazır: tüm tablolar kontrol edildi.")

    # Eski SQLite veritabanlarında schema migration (yeni kolonlar)
    # PostgreSQL'de CREATE_ALL zaten doğru sütunları oluşturduğu için no-op olur
    _legacy_migrate()

    # İlk admin'i oluştur
    with SessionLocal() as db:
        admin_count = db.query(User).filter(User.is_admin.is_(True)).count()
        if admin_count == 0:
            existing = db.query(User).filter(User.tc_no == settings.default_admin_tc).first()
            if existing:
                existing.is_admin = True
                db.commit()
                print(f"🛡️  Mevcut kullanıcı admin yapıldı: TC={settings.default_admin_tc}")
            else:
                password_hash = bcrypt.hashpw(
                    settings.default_admin_password.encode("utf-8"),
                    bcrypt.gensalt()
                ).decode("utf-8")
                admin = User(
                    tc_no=settings.default_admin_tc,
                    full_name=settings.default_admin_name,
                    phone="00000000000",
                    password_hash=password_hash,
                    is_admin=True,
                )
                db.add(admin)
                db.commit()
                print(
                    f"🛡️  Varsayılan admin oluşturuldu → "
                    f"TC: {settings.default_admin_tc} | "
                    f"Şifre: {settings.default_admin_password}"
                )


def _legacy_migrate() -> None:
    """
    Eski SQLite kurulumlarda eksik kolonları ekler.
    PostgreSQL üzerinde Base.metadata.create_all bunu zaten halleder.
    """
    if not settings.database_url.startswith("sqlite"):
        return  # PostgreSQL — gerek yok

    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_cols = {col["name"] for col in inspector.get_columns("users")}
    migrations = {
        "profile_picture": "ALTER TABLE users ADD COLUMN profile_picture TEXT DEFAULT ''",
        "is_admin": "ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0",
        "created_at": "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT ''",
    }
    with engine.begin() as conn:
        for col, sql in migrations.items():
            if col not in existing_cols:
                conn.execute(text(sql))
                print(f"🔄 SQLite migration: '{col}' kolonu eklendi.")


# =============================================================================
# PYDANTIC ŞEMALAR
# =============================================================================

class RegisterRequest(BaseModel):
    tc_no: str = Field(..., min_length=11, max_length=11)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=6, max_length=100)

    @field_validator("tc_no")
    @classmethod
    def validate_tc_no(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("T.C. Kimlik Numarası yalnızca rakamlardan oluşmalıdır.")
        if v[0] == "0":
            raise ValueError("T.C. Kimlik Numarası 0 ile başlayamaz.")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("Telefon numarası yalnızca rakamlardan oluşmalıdır.")
        return v


class LoginRequest(BaseModel):
    tc_no: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=6)


class ProfileUpdateRequest(BaseModel):
    tc_no: str = Field(..., min_length=11, max_length=11)
    occupation: str = Field("", max_length=200)
    address: str = Field("", max_length=500)
    profile_picture: Optional[str] = Field(None)

    @field_validator("profile_picture")
    @classmethod
    def validate_profile_picture(cls, v):
        if v is None or v == "":
            return v
        if not v.startswith("data:image/"):
            raise ValueError("Profil fotoğrafı 'data:image/...' formatında olmalıdır.")
        if len(v) > 2_800_000:
            raise ValueError("Profil fotoğrafı 2 MB'tan büyük olamaz.")
        return v


class AnalyzeRequest(BaseModel):
    """
    Risk analizi için gerekli finansal veriler.

    Ana 3 alan (income/debt/loan_amount) zorunlu;
    geri kalan demografik bilgiler opsiyoneldir — sağlanmazsa makul varsayılanlar
    atanır (sektör ortalamaları).
    """
    income: float = Field(..., gt=0, description="Aylık net gelir (TL)")
    debt: float = Field(..., ge=0, description="Toplam mevcut borç (TL)")
    loan_amount: float = Field(..., gt=0, description="Talep edilen kredi tutarı (TL)")

    # Opsiyonel demografik özellikler
    age: Optional[int] = Field(35, ge=18, le=75, description="Yaş")
    employment_years: Optional[int] = Field(5, ge=0, le=50, description="İş tecrübesi (yıl)")
    credit_history: Optional[int] = Field(3, ge=0, le=5, description="Kredi geçmişi puanı (0-5)")
    dependents: Optional[int] = Field(1, ge=0, le=10, description="Bakmakla yükümlü sayısı")
    savings_balance: Optional[float] = Field(0, ge=0, description="Birikim hesabı bakiyesi (TL)")


# =============================================================================
# FASTAPI UYGULAMA
# =============================================================================

app = FastAPI(
    title="KrediZeka API",
    description="Enterprise-grade AI-powered credit risk assessment platform.",
    version="2.0.0",
)

# slowapi entegrasyonu
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip
app.add_middleware(GZipMiddleware, minimum_size=1000)


# =============================================================================
# STARTUP / SHUTDOWN
# =============================================================================

@app.on_event("startup")
def on_startup():
    """
    Sunucu başlatıldığında DB hazırla ve ML modelini yükle.

    Tüm adımlar try/except ile sarılı — herhangi biri çökerse uvicorn
    yine de yukarı kalkar ve sağlık endpoint'leri yanıt verir.
    """
    global ml_bundle

    print("\n" + "=" * 60)
    print("🚀 KrediZeka API Sunucusu Başlatılıyor (v2.0.0)")
    print(f"   • DB         : {settings.database_url.split('@')[-1] if '@' in settings.database_url else settings.database_url}")
    print(f"   • CORS       : {settings.cors_origin_list}")
    print("=" * 60)

    # 1) Veritabanı şeması
    try:
        init_database()
    except Exception as e:
        print(f"❌ Veritabanı başlatma hatası: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

    # 2) ML modeli yükle (varsa) — Render gibi düşük bellekli ortamda
    #    startup'ta eğitim yapmıyoruz, dosya yoksa /api/analyze 503 döner
    try:
        if os.path.exists(MODEL_PATH):
            loaded = joblib.load(MODEL_PATH)
            # Eski format kontrolü: v1 modelinde {"model": ...} vardı,
            # v2'de {"pipeline": ..., "explainer": ...}. Uyumsuzsa atla.
            if isinstance(loaded, dict) and "pipeline" in loaded and "explainer" in loaded:
                ml_bundle = loaded
                metrics = ml_bundle.get("metrics", {})
                print(f"✅ ML Modeli yüklendi (v2 - XGBoost+SHAP): {MODEL_PATH}")
                print(f"   • Accuracy: %{metrics.get('accuracy', 0) * 100:.2f}")
                print(f"   • ROC AUC : {metrics.get('roc_auc', 0):.4f}")
            else:
                print(f"⚠️  Model dosyası eski formatta (v1). v2 (XGBoost+SHAP) gerekli.")
                print(f"   Çözüm: 'python train_model.py' ile yeniden eğitip git'e ekleyin.")
                ml_bundle = None
        else:
            print(f"⚠️  Model dosyası yok: {MODEL_PATH}")
            print("   Çözüm: 'python train_model.py' ile eğitip git'e ekleyin")
            print("   /api/analyze 503 dönecek; diğer endpoint'ler çalışır.")
    except Exception as e:
        print(f"❌ Model yükleme hatası: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

    print("\n✅ Sunucu hazır → http://localhost:8000")
    print("📖 API Docs    → http://localhost:8000/docs")
    print("=" * 60 + "\n")


@app.on_event("shutdown")
def on_shutdown():
    print("\n🔴 KrediZeka API Sunucusu kapatılıyor...")


# =============================================================================
# ENDPOINT'LER
# =============================================================================

@app.get("/")
async def root():
    """Sağlık kontrolü."""
    return {
        "message": "KrediZeka API çalışıyor",
        "version": "2.0.0",
        "docs": "/docs",
        "model_loaded": ml_bundle is not None,
    }


# ─── 1) KAYIT ──────────────────────────────────────────────────────────────
@app.post("/api/register")
@limiter.limit(settings.auth_rate_limit)
async def register(
    request: Request,                       # slowapi için zorunlu (key_func ile kullanılır)
    req: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Yeni kullanıcı kaydı oluşturur.

    Rate limit: 5/dakika (IP başına)
    Background: Hoş geldin e-postası asenkron gönderilir.
    """
    existing = db.query(User).filter(User.tc_no == req.tc_no).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Bu T.C. Kimlik Numarası ile zaten bir hesap bulunmaktadır."
        )

    password_hash = bcrypt.hashpw(
        req.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user = User(
        tc_no=req.tc_no,
        full_name=req.full_name,
        phone=req.phone,
        password_hash=password_hash,
    )
    db.add(user)
    db.commit()

    # Background: kullanıcıyı bekletmeden hoş geldin e-postası
    background_tasks.add_task(send_welcome_email, req.tc_no, req.full_name)

    return {
        "success": True,
        "message": f"Hoş geldiniz {req.full_name}! Hesabınız başarıyla oluşturuldu."
    }


# ─── 2) GİRİŞ ──────────────────────────────────────────────────────────────
@app.post("/api/login")
@limiter.limit(settings.auth_rate_limit)
async def login(
    request: Request,
    req: LoginRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Kullanıcı girişi (T.C. No + Parola).

    Rate limit: 5/dakika
    Background: Giriş bildirimi asenkron gönderilir.
    """
    user = db.query(User).filter(User.tc_no == req.tc_no).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Bu T.C. Kimlik Numarası ile kayıtlı bir hesap bulunamadı."
        )

    is_valid = bcrypt.checkpw(
        req.password.encode("utf-8"),
        user.password_hash.encode("utf-8")
    )
    if not is_valid:
        raise HTTPException(status_code=401, detail="Parola hatalı. Lütfen tekrar deneyiniz.")

    # Asenkron giriş bildirimi
    client_ip = get_remote_address(request)
    background_tasks.add_task(send_login_notification, user.tc_no, user.full_name, client_ip)

    return {
        "success": True,
        "message": f"Giriş başarılı! Hoş geldiniz {user.full_name}.",
        "user": user.to_dict(),
    }


# ─── 3) PROFİL GETİR ───────────────────────────────────────────────────────
@app.get("/api/profile/{tc_no}")
async def get_profile(tc_no: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.tc_no == tc_no).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return user.to_dict()


# ─── 4) PROFİL GÜNCELLE ────────────────────────────────────────────────────
@app.put("/api/profile")
async def update_profile(req: ProfileUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.tc_no == req.tc_no).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    user.occupation = req.occupation
    user.address = req.address
    if req.profile_picture is not None:
        user.profile_picture = req.profile_picture
    db.commit()

    return {
        "success": True,
        "message": "Profil bilgileriniz başarıyla güncellendi.",
    }


# ─── 5) RİSK ANALİZİ (SHAP destekli) ───────────────────────────────────────
@app.post("/api/analyze")
@limiter.limit(settings.analyze_rate_limit)
async def analyze_risk(
    request: Request,
    req: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    x_user_tc: Optional[str] = Header(None, alias="X-User-TC"),
):
    """
    Risk analizi + SHAP açıklaması.

    Rate limit: 10/dakika (IP başına)
    Background: Analiz raporu e-postası asenkron gönderilir (login'liyse).

    Yanıt:
      {
        "score": 72,
        "risk_status": "Orta Risk",
        "dti": 20.0,
        "lti": 3.3,
        "ai_advice": "...",
        "top_factors": [
          { "feature": "income", "label_tr": "Aylık Gelir",
            "label_en": "Monthly Income",
            "impact": "positive", "shap_value": 0.42, "abs_value": 0.42 },
          ...
        ]
      }
    """
    global ml_bundle
    if ml_bundle is None:
        raise HTTPException(
            status_code=503,
            detail="ML modeli yüklenmemiş. Lütfen önce 'python train_model.py' çalıştırın."
        )

    pipeline = ml_bundle["pipeline"]
    explainer = ml_bundle["explainer"]
    features: List[str] = ml_bundle["features"]
    labels_tr = ml_bundle["labels_tr"]
    labels_en = ml_bundle["labels_en"]

    # Türetilmiş özellikleri hesapla
    dti = round((req.debt / req.income) * 100, 2) if req.income > 0 else 999.0
    lti = round(req.loan_amount / req.income, 2) if req.income > 0 else 999.0

    # Model girdisini hazırla (FEATURE_NAMES sırasına uy)
    input_dict = {
        "income": req.income,
        "debt": req.debt,
        "loan_amount": req.loan_amount,
        "age": req.age,
        "employment_years": req.employment_years,
        "credit_history": req.credit_history,
        "dependents": req.dependents,
        "savings_balance": req.savings_balance,
        "dti_ratio": dti,
        "lti_ratio": lti,
    }
    input_df = pd.DataFrame([{f: input_dict[f] for f in features}])

    # ─── Tahmin + SHAP (CPU-bound → threadpool) ────────────────────────
    def _predict_and_explain():
        # 1) Olasılık tahmini
        proba = pipeline.predict_proba(input_df)[:, 1][0]

        # 2) SHAP değerleri (scaled girdi üzerinde)
        scaler = pipeline.named_steps["scaler"]
        scaled = scaler.transform(input_df)
        shap_values = explainer.shap_values(scaled)
        # shap_values: shape (1, n_features)
        return float(proba), np.asarray(shap_values)[0]

    approval_probability, shap_vec = await run_in_threadpool(_predict_and_explain)
    score = int(round(approval_probability * 100))

    # ─── Risk durumu ────────────────────────────────────────────────────
    if score >= 75:
        risk_status, risk_color = "Düşük Risk", "green"
    elif score >= 50:
        risk_status, risk_color = "Orta Risk", "yellow"
    elif score >= 25:
        risk_status, risk_color = "Yüksek Risk", "orange"
    else:
        risk_status, risk_color = "Çok Yüksek Risk", "red"

    # ─── SHAP top 3 faktör ─────────────────────────────────────────────
    # Mutlak SHAP değerine göre sırala — en etkili 3 faktör
    factor_list = []
    for i, feat in enumerate(features):
        sv = float(shap_vec[i])
        factor_list.append({
            "feature": feat,
            "label_tr": labels_tr.get(feat, feat),
            "label_en": labels_en.get(feat, feat),
            "shap_value": round(sv, 4),
            "abs_value": round(abs(sv), 4),
            "impact": "positive" if sv >= 0 else "negative",
            "input_value": float(input_dict[feat]),
        })
    factor_list.sort(key=lambda x: x["abs_value"], reverse=True)
    top_factors = factor_list[:5]  # Frontend'de 3 göstersek de tam liste yararlı

    # ─── Kural tabanlı AI tavsiyesi ────────────────────────────────────
    advice_parts = []
    if score >= 75:
        advice_parts.append(
            f"🎉 Tebrikler! Kredi onaylanma skorunuz {score}/100 ile oldukça güçlü. "
            f"Finansal profiliniz, kredi kuruluşları tarafından olumlu değerlendirilecek düzeydedir."
        )
    elif score >= 50:
        advice_parts.append(
            f"⚠️ Kredi onaylanma skorunuz {score}/100 ile orta seviyede. "
            f"Krediniz onaylanabilir, ancak faiz oranınız yüksek olabilir."
        )
    elif score >= 25:
        advice_parts.append(
            f"🔶 Kredi onaylanma skorunuz {score}/100 ile düşük seviyede. "
            f"Mevcut finansal durumunuzda kredi başvurusunun reddedilme olasılığı yüksektir."
        )
    else:
        advice_parts.append(
            f"🔴 Kredi onaylanma skorunuz {score}/100 ile kritik seviyededir. "
            f"Mevcut koşullarla kredi almanız oldukça güçtür."
        )

    if dti > 50:
        advice_parts.append(f"📊 Borç/Gelir oranınız %{dti} ile kritik seviyededir (ideal: <%40).")
    elif dti > 35:
        advice_parts.append(f"📊 Borç/Gelir oranınız %{dti} seviyesindedir. %35'in altı önerilir.")
    else:
        advice_parts.append(f"✅ Borç/Gelir oranınız %{dti} ile sağlıklı bir seviyededir.")

    if lti > 12:
        advice_parts.append(f"💰 Talep ettiğiniz kredi gelirinizin {lti} katıdır — çok yüksek.")
    elif lti > 6:
        advice_parts.append(f"💰 Talep ettiğiniz kredi gelirinizin {lti} katıdır — kabul edilebilir.")
    else:
        advice_parts.append(f"✅ Talep ettiğiniz kredi gelirinizin {lti} katı — makul.")

    ai_advice = "\n\n".join(advice_parts)

    # ─── Background: kullanıcı login'liyse analiz raporu mail simülasyonu ──
    if x_user_tc:
        user = db.query(User).filter(User.tc_no == x_user_tc).first()
        if user:
            background_tasks.add_task(
                send_analysis_report_email, user.tc_no, user.full_name, score
            )

    return {
        "score": score,
        "risk_status": risk_status,
        "risk_color": risk_color,
        "dti": dti,
        "lti": lti,
        "ai_advice": ai_advice,
        "top_factors": top_factors,                # ← SHAP açıklamaları
        "input_summary": {
            "income": req.income,
            "debt": req.debt,
            "loan_amount": req.loan_amount,
        },
        "model_meta": {
            "version": "2.0",
            "algorithm": "XGBoost",
            "explainability": "SHAP TreeExplainer",
        },
    }


# =============================================================================
# ADMIN ENDPOINT'LERİ
# =============================================================================

def require_admin(
    x_user_tc: Optional[str] = Header(None, alias="X-User-TC"),
    db: Session = Depends(get_db),
) -> dict:
    """X-User-TC header'ı ile admin doğrulaması (RBAC)."""
    if not x_user_tc:
        raise HTTPException(status_code=401, detail="Yetkilendirme bilgisi eksik (X-User-TC).")

    user = db.query(User).filter(User.tc_no == x_user_tc).first()
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı.")
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Bu işlem için yönetici yetkisi gerekiyor.")

    return {"tc_no": user.tc_no, "full_name": user.full_name, "is_admin": True}


@app.get("/api/admin/stats")
async def admin_stats(
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Yönetici paneli için sistem istatistikleri."""
    total_users = db.query(User).count()
    total_admins = db.query(User).filter(User.is_admin.is_(True)).count()
    regular_users = total_users - total_admins

    users_with_picture = db.query(User).filter(
        User.profile_picture != ""
    ).count()
    users_with_complete = db.query(User).filter(
        User.occupation != "", User.address != ""
    ).count()

    now = datetime.utcnow()
    all_users = db.query(User).order_by(User.id.desc()).all()
    last_24h = sum(
        1 for u in all_users
        if u.created_at and (now - u.created_at).total_seconds() <= 86400
    )
    last_7d = sum(
        1 for u in all_users
        if u.created_at and (now - u.created_at).total_seconds() <= 604800
    )

    # Son 5 kayıt (TC No maskeli)
    recent_users = []
    for u in all_users[:5]:
        tc = u.tc_no
        masked = (tc[:3] + "*****" + tc[-3:]) if len(tc) >= 11 else tc
        recent_users.append({
            "tc_no_masked": masked,
            "full_name": u.full_name,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "is_admin": bool(u.is_admin),
        })

    return {
        "total_users": total_users,
        "total_admins": total_admins,
        "regular_users": regular_users,
        "users_with_profile_picture": users_with_picture,
        "users_with_complete_profile": users_with_complete,
        "last_24h_registrations": last_24h,
        "last_7d_registrations": last_7d,
        "recent_users": recent_users,
        "generated_at": datetime.utcnow().isoformat(),
    }


# =============================================================================
# Üretim için uvicorn entry point
# =============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
