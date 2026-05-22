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
import re
import asyncio
import random
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

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

# Redis önbellek (fastapi-cache2)
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
from redis import asyncio as aioredis

# ZekaBot için Google Gemini SDK
from google import genai
from google.genai import types as genai_types

from config import settings
from database import engine, SessionLocal, Base, get_db
from models import (
    User, BireyselAnalytics, TicariAnalytics, UrunlerAnalytics,
    PasswordResetToken, EmailVerificationToken
)
from services.email_service import (
    send_analysis_report_email, send_login_notification,
    send_password_reset_email, send_verification_email
)
from services.finance_engines import (
    compute_bireysel_analysis, compute_ticari_analysis, compute_urun_analysis
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


# Redis istemcisi — lifespan'de bağlanır, bağlanamazsa None kalır.
redis_client: Optional["aioredis.Redis"] = None


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
                    email_verified=True,
                )
                db.add(admin)
                db.commit()
                print(
                    f"🛡️  Varsayılan admin oluşturuldu → "
                    f"TC: {settings.default_admin_tc} | "
                    f"Şifre: {settings.default_admin_password}"
                )


def _legacy_migrate() -> None:
    """Var olan tablolara sonradan eklenen kolonları ALTER TABLE ile ekler."""
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_cols = {col["name"] for col in inspector.get_columns("users")}

    # 'email' kolonu — hem PostgreSQL hem SQLite'da geçerli sözdizimi
    if "email" not in existing_cols:
        with engine.begin() as conn:
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT ''"
            ))
        print("🔄 Migration: 'email' kolonu users tablosuna eklendi.")

    # 'email_verified' kolonu — var olan kullanıcılar doğrulanmış sayılır (DEFAULT TRUE)
    if "email_verified" not in existing_cols:
        with engine.begin() as conn:
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT TRUE"
            ))
        print("🔄 Migration: 'email_verified' kolonu users tablosuna eklendi.")

    # Yalnızca eski SQLite kurulumları için ek kolonlar
    if settings.database_url.startswith("sqlite"):
        sqlite_migrations = {
            "profile_picture": "ALTER TABLE users ADD COLUMN profile_picture TEXT DEFAULT ''",
            "is_admin": "ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0",
            "created_at": "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT ''",
        }
        with engine.begin() as conn:
            for col, sql in sqlite_migrations.items():
                if col not in existing_cols:
                    conn.execute(text(sql))
                    print(f"🔄 SQLite migration: '{col}' kolonu eklendi.")


# =============================================================================
# PYDANTIC ŞEMALAR
# =============================================================================

# E-posta format deseni (ad@alan.com)
_EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_password_strength(v: str) -> str:
    """Güçlü parola kriterlerini doğrular; sağlanmazsa ValueError fırlatır."""
    if len(v) < 8:
        raise ValueError("Şifre en az 8 karakter olmalıdır.")
    if not any(c.isupper() for c in v):
        raise ValueError("Şifre en az bir büyük harf içermelidir.")
    if not any(c.islower() for c in v):
        raise ValueError("Şifre en az bir küçük harf içermelidir.")
    if not any(c.isdigit() for c in v):
        raise ValueError("Şifre en az bir rakam içermelidir.")
    if not any((not c.isalnum()) and (not c.isspace()) for c in v):
        raise ValueError(
            "Şifre en az bir özel karakter içermelidir (örn. ! @ # $ %)."
        )
    return v


class RegisterRequest(BaseModel):
    tc_no: str = Field(..., min_length=11, max_length=11)
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    phone: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., max_length=100)

    @field_validator("tc_no")
    @classmethod
    def validate_tc_no(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("T.C. Kimlik Numarası yalnızca rakamlardan oluşmalıdır.")
        if v[0] == "0":
            raise ValueError("T.C. Kimlik Numarası 0 ile başlayamaz.")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not _EMAIL_REGEX.match(v):
            raise ValueError("Geçerli bir e-posta adresi giriniz (örn. ad@alan.com).")
        return v.lower()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("Telefon numarası yalnızca rakamlardan oluşmalıdır.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password_strength(v)


class LoginRequest(BaseModel):
    tc_no: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=6)


class ForgotPasswordRequest(BaseModel):
    """Şifre sıfırlama bağlantısı talebi."""
    email: str = Field(..., min_length=5, max_length=255)


class ResetPasswordRequest(BaseModel):
    """E-postadaki jeton ile yeni şifrenin belirlenmesi."""
    token: str = Field(..., min_length=10, max_length=255)
    new_password: str = Field(..., max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return _validate_password_strength(v)


class VerifyEmailRequest(BaseModel):
    """E-posta doğrulama jetonu."""
    token: str = Field(..., min_length=10, max_length=255)


class ResendVerificationRequest(BaseModel):
    """Doğrulama e-postasının yeniden gönderilmesi talebi."""
    tc_no: str = Field(..., min_length=11, max_length=11)


class ChangeEmailRequest(BaseModel):
    """Profilden e-posta değişikliği — mevcut şifre doğrulaması gerektirir."""
    tc_no: str = Field(..., min_length=11, max_length=11)
    current_password: str = Field(..., min_length=1)
    new_email: str = Field(..., min_length=5, max_length=255)

    @field_validator("new_email")
    @classmethod
    def validate_new_email(cls, v: str) -> str:
        v = v.strip()
        if not _EMAIL_REGEX.match(v):
            raise ValueError("Geçerli bir e-posta adresi giriniz (örn. ad@alan.com).")
        return v.lower()


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


class BireyselAnalyzeRequest(BaseModel):
    """
    Bireysel hizmet analizi isteği.

    tc_no          : Analizi yapan kullanıcının T.C. No'su (FK)
    hizmet_turu    : Kredi_Yonetimi | Birikim | Kredi_Karti | Yatirim | Sigorta
    girdi_verileri : Karta özel form verileri (serbest yapılı JSON)
    """
    tc_no: str = Field(..., min_length=11, max_length=11)
    hizmet_turu: str = Field(..., description="Bireysel hizmet türü")
    girdi_verileri: Dict[str, Any] = Field(..., description="Form verileri (JSON)")


class TicariAnalyzeRequest(BaseModel):
    """
    Ticari hizmet analizi isteği.

    tc_no          : Analizi yapan kullanıcının T.C. No'su (FK)
    hizmet_turu    : Ticari_Kredi | POS_Tahsilat | Maas_Bordro | Dis_Ticaret
    girdi_verileri : Şirket form verileri (serbest yapılı JSON)
    """
    tc_no: str = Field(..., min_length=11, max_length=11)
    hizmet_turu: str = Field(..., description="Ticari hizmet türü")
    girdi_verileri: Dict[str, Any] = Field(..., description="Şirket form verileri (JSON)")


class UrunAnalyzeRequest(BaseModel):
    """
    Ürün analizi isteği.

    tc_no          : Analizi yapan kullanıcının T.C. No'su (FK)
    urun_turu      : Mevduat_Hesabi | Sigorta_Urunleri | Kampanyalar
    girdi_verileri : Ürün form verileri (serbest yapılı JSON)
    """
    tc_no: str = Field(..., min_length=11, max_length=11)
    urun_turu: str = Field(..., description="Ürün türü")
    girdi_verileri: Dict[str, Any] = Field(..., description="Ürün form verileri (JSON)")


class ChatRequest(BaseModel):
    """ZekaBot sohbet asistanı isteği."""
    message: str = Field(..., min_length=1, max_length=500)


# =============================================================================
# UYGULAMA YAŞAM DÖNGÜSÜ (LIFESPAN)
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Açılışta DB + ML modeli + Redis hazırlar, kapanışta Redis'i kapatır."""
    global ml_bundle, redis_client

    print("\n" + "=" * 60)
    print("🚀 KrediZeka API Sunucusu Başlatılıyor (v2.1.0)")
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

    # 2) ML modeli yükle (yoksa /api/analyze 503 döner)
    try:
        if os.path.exists(MODEL_PATH):
            loaded = joblib.load(MODEL_PATH)
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

    # 3) Redis önbelleği — bağlanamazsa bellek-içi yedeğe düşülür
    try:
        redis_client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=False,   # RedisBackend bytes bekler
        )
        await redis_client.ping()
        FastAPICache.init(RedisBackend(redis_client), prefix="fastapi-cache")
        print(f"✅ Redis önbellek bağlandı → {settings.redis_url}")
    except Exception as e:
        redis_client = None
        FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
        print(f"⚠️  Redis erişilemedi ({type(e).__name__}). "
              f"Bellek-içi önbellek devreye alındı.")

    print("\n✅ Sunucu hazır → http://localhost:8000")
    print("📖 API Docs    → http://localhost:8000/docs")
    print("=" * 60 + "\n")

    yield

    print("\n🔴 KrediZeka API Sunucusu kapatılıyor...")
    if redis_client is not None:
        try:
            await redis_client.close()
            print("   • Redis bağlantısı kapatıldı.")
        except Exception:
            # Kapanış sırasındaki hatalar süreci durdurmamalı
            pass


# =============================================================================
# FASTAPI UYGULAMA
# =============================================================================

app = FastAPI(
    title="KrediZeka API",
    description="Enterprise-grade AI-powered credit risk assessment platform.",
    version="2.1.0",
    lifespan=lifespan,
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


def _send_email_verification(user: User, db: Session,
                             background_tasks: BackgroundTasks) -> None:
    """Doğrulama jetonu üretir ve doğrulama e-postasını arka planda gönderir."""
    # Önceki kullanılmamış jetonları iptal et
    db.query(EmailVerificationToken).filter(
        EmailVerificationToken.tc_no == user.tc_no,
        EmailVerificationToken.used.is_(False),
    ).update({"used": True})

    token = secrets.token_urlsafe(32)
    db.add(EmailVerificationToken(
        tc_no=user.tc_no,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=24),
        used=False,
    ))
    db.commit()

    verify_link = f"{settings.frontend_url.rstrip('/')}/eposta-dogrula?token={token}"
    background_tasks.add_task(
        send_verification_email, user.email, user.full_name, verify_link
    )


# ─── 1) KAYIT ──────────────────────────────────────────────────────────────
@app.post("/api/register")
@limiter.limit(settings.auth_rate_limit)
async def register(
    request: Request,                       # slowapi için zorunlu (key_func ile kullanılır)
    req: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Yeni kullanıcı kaydı oluşturur ve doğrulama e-postası gönderir."""
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
        email=req.email,
        phone=req.phone,
        password_hash=password_hash,
    )
    db.add(user)
    db.commit()

    # Doğrulama jetonu üret + doğrulama e-postası gönder
    _send_email_verification(user, db, background_tasks)

    return {
        "success": True,
        "message": f"Hesabınız oluşturuldu, {req.full_name}! Giriş yapabilmek için "
                   f"e-posta adresinize gönderdiğimiz doğrulama bağlantısına tıklayın.",
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

    # E-posta doğrulanmadan giriş yapılamaz (403 → frontend yeniden gönder seçeneği sunar)
    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="E-posta adresiniz henüz doğrulanmadı. Lütfen e-postanıza "
                   "gönderilen doğrulama bağlantısına tıklayın."
        )

    # Asenkron giriş bildirimi
    client_ip = get_remote_address(request)
    background_tasks.add_task(send_login_notification, user.tc_no, user.full_name, client_ip)

    return {
        "success": True,
        "message": f"Giriş başarılı! Hoş geldiniz {user.full_name}.",
        "user": user.to_dict(),
    }


# ─── ŞİFREMİ UNUTTUM (1/2): SIFIRLAMA BAĞLANTISI TALEBİ ────────────────────
@app.post("/api/forgot-password")
@limiter.limit(settings.auth_rate_limit)
async def forgot_password(
    request: Request,
    req: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Şifre sıfırlama akışını başlatır: jeton üretir ve e-postayla link yollar.

    Güvenlik: E-posta kayıtlı olsa da olmasa da aynı yanıt döner — böylece
    hangi e-postaların kayıtlı olduğu sızdırılmaz (user enumeration koruması).
    """
    email = req.email.strip().lower()

    # Kayıtlı e-postaları sızdırmamak için her durumda aynı yanıt
    generic_response = {
        "success": True,
        "message": "Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama "
                   "bağlantısı gönderilmiştir. Lütfen gelen kutunuzu kontrol edin.",
    }

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return generic_response

    # Önceki kullanılmamış jetonları iptal et — yalnızca son link geçerli kalsın
    db.query(PasswordResetToken).filter(
        PasswordResetToken.tc_no == user.tc_no,
        PasswordResetToken.used.is_(False),
    ).update({"used": True})

    token = secrets.token_urlsafe(32)
    reset_record = PasswordResetToken(
        tc_no=user.tc_no,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1),
        used=False,
    )
    db.add(reset_record)
    db.commit()

    reset_link = f"{settings.frontend_url.rstrip('/')}/sifre-sifirla?token={token}"
    background_tasks.add_task(
        send_password_reset_email, user.email, user.full_name, reset_link
    )

    return generic_response


# ─── ŞİFREMİ UNUTTUM (2/2): YENİ ŞİFRENİN BELİRLENMESİ ─────────────────────
@app.post("/api/reset-password")
@limiter.limit(settings.auth_rate_limit)
async def reset_password(
    request: Request,
    req: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Sıfırlama jetonunu doğrular (var/kullanılmamış/süresi dolmamış) ve
    geçerliyse kullanıcının şifresini günceller; jetonu kullanıldı işaretler.
    """
    reset_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == req.token
    ).first()

    if not reset_record:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz sıfırlama bağlantısı. Lütfen yeniden talep edin."
        )

    if reset_record.used:
        raise HTTPException(
            status_code=400,
            detail="Bu sıfırlama bağlantısı zaten kullanılmış. "
                   "Lütfen yeni bir bağlantı talep edin."
        )

    if reset_record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Sıfırlama bağlantısının süresi dolmuş (1 saat). "
                   "Lütfen yeniden talep edin."
        )

    user = db.query(User).filter(User.tc_no == reset_record.tc_no).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    # Yeni şifreyi bcrypt ile hash'le ve kaydet
    user.password_hash = bcrypt.hashpw(
        req.new_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Jeton tek kullanımlık olduğu için "kullanıldı" olarak işaretlenir
    reset_record.used = True
    db.commit()

    return {
        "success": True,
        "message": "Şifreniz başarıyla güncellendi. "
                   "Artık yeni şifrenizle giriş yapabilirsiniz.",
    }


# ─── E-POSTA DOĞRULAMA ─────────────────────────────────────────────────────
@app.post("/api/verify-email")
@limiter.limit(settings.auth_rate_limit)
async def verify_email(
    request: Request,
    req: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    """Doğrulama jetonunu kontrol eder ve hesabın e-postasını doğrular."""
    record = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token == req.token
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Geçersiz doğrulama bağlantısı.")

    if record.used:
        raise HTTPException(
            status_code=400,
            detail="Bu bağlantı zaten kullanılmış. Hesabınız muhtemelen doğrulanmıştır."
        )

    if record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Doğrulama bağlantısının süresi dolmuş. Lütfen yeni bir bağlantı isteyin."
        )

    user = db.query(User).filter(User.tc_no == record.tc_no).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    user.email_verified = True
    record.used = True
    db.commit()

    return {
        "success": True,
        "message": "E-posta adresiniz doğrulandı! Artık giriş yapabilirsiniz.",
    }


@app.post("/api/resend-verification")
@limiter.limit(settings.auth_rate_limit)
async def resend_verification(
    request: Request,
    req: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Doğrulanmamış bir hesaba doğrulama e-postasını yeniden gönderir."""
    generic_response = {
        "success": True,
        "message": "Hesabınız henüz doğrulanmamışsa, doğrulama bağlantısı "
                   "e-posta adresinize yeniden gönderilmiştir.",
    }
    user = db.query(User).filter(User.tc_no == req.tc_no).first()
    if user and not user.email_verified and user.email:
        _send_email_verification(user, db, background_tasks)
    return generic_response


@app.post("/api/change-email")
@limiter.limit(settings.auth_rate_limit)
async def change_email(
    request: Request,
    req: ChangeEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Profilden e-posta değiştirir.

    Mevcut şifre doğrulanır; yeni adres "doğrulanmamış" olarak işaretlenip
    o adrese yeni bir doğrulama bağlantısı gönderilir.
    """
    user = db.query(User).filter(User.tc_no == req.tc_no).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    is_valid = bcrypt.checkpw(
        req.current_password.encode("utf-8"),
        user.password_hash.encode("utf-8")
    )
    if not is_valid:
        raise HTTPException(status_code=401, detail="Mevcut şifreniz hatalı.")

    if req.new_email == (user.email or "").lower():
        raise HTTPException(
            status_code=400,
            detail="Yeni e-posta adresi mevcut adresinizle aynı."
        )

    user.email = req.new_email
    user.email_verified = False
    db.commit()

    # Yeni adrese doğrulama bağlantısı gönder
    _send_email_verification(user, db, background_tasks)

    return {
        "success": True,
        "message": "E-posta adresiniz güncellendi. Yeni adresinize bir doğrulama "
                   "bağlantısı gönderildi; bir sonraki girişten önce doğrulayın.",
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
# İNTERAKTİF MODÜL ENDPOINT'LERİ (Bireysel / Ticari / Ürünler)
# =============================================================================
# Bu uç noktalar, finance_engines.py içindeki simülasyon motorlarını çalıştırır
# ve sonuçları ilgili PostgreSQL analytics tablosuna kaydeder.
#
# Ortak güvenlik: Her istek, geçerli bir kullanıcıya (tc_no) ait olmalıdır.
# Kullanıcı bulunamazsa 404 döner — frontend zaten oturum guard'ı uygular.


def _ensure_user_exists(tc_no: str, db: Session) -> User:
    """
    Verilen T.C. No'ya ait kullanıcıyı döndürür; yoksa 404 fırlatır.
    İnteraktif modül endpoint'leri için ortak kullanıcı doğrulaması.
    """
    user = db.query(User).filter(User.tc_no == tc_no).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Bu işlem için geçerli bir kullanıcı oturumu gereklidir."
        )
    return user


# ─── 6) BİREYSEL HİZMET ANALİZİ ────────────────────────────────────────────
@app.post("/api/bireysel/analyze")
@limiter.limit(settings.analyze_rate_limit)
async def bireysel_analyze(
    request: Request,
    req: BireyselAnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Bireysel sekmesindeki hizmet kartlarının analiz motorunu çalıştırır.

    Desteklenen hizmet_turu değerleri:
      Kredi_Yonetimi | Birikim | Kredi_Karti | Yatirim | Sigorta

    İşleyiş:
      1. Kullanıcı doğrulanır (tc_no)
      2. finance_engines.compute_bireysel_analysis() çağrılır
      3. Sonuç bireysel_analytics tablosuna JSONB olarak kaydedilir
      4. Hesaplama sonucu + AI tavsiyesi JSON olarak döndürülür

    Rate limit: settings.analyze_rate_limit (IP başına)
    """
    user = _ensure_user_exists(req.tc_no, db)

    # Simülasyon motorunu çalıştır (geçersiz hizmet türü ValueError fırlatır)
    try:
        result = await run_in_threadpool(
            compute_bireysel_analysis, req.hizmet_turu, req.girdi_verileri
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Sonucu PostgreSQL bireysel_analytics tablosuna kaydet
    # Risk skorlu motorlar 'score', tahmin motorları 'tahmin' döndürür;
    # hesaplanan_skor sütununa hangisi varsa o yazılır.
    hesaplanan = result.get("score")
    if hesaplanan is None:
        hesaplanan = result.get("tahmin", 0.0)
    kayit = BireyselAnalytics(
        tc_no=req.tc_no,
        hizmet_turu=req.hizmet_turu,
        girdi_verileri=req.girdi_verileri,
        hesaplanan_skor=float(hesaplanan),
        yapay_zeka_tavsiyesi=result.get("ai_advice", ""),
    )
    db.add(kayit)
    db.commit()
    db.refresh(kayit)

    # Asenkron bilgilendirme e-postası (kullanıcı bekletilmez)
    background_tasks.add_task(
        send_analysis_report_email, user.tc_no, user.full_name,
        int(result.get("score", 0))
    )

    return {
        "success": True,
        "kayit_id": kayit.id,
        "hizmet_turu": req.hizmet_turu,
        "result": result,
        "created_at": kayit.created_at.isoformat(),
    }


# ─── 7) TİCARİ HİZMET ANALİZİ ──────────────────────────────────────────────
@app.post("/api/ticari/analyze")
@limiter.limit(settings.analyze_rate_limit)
async def ticari_analyze(
    request: Request,
    req: TicariAnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Ticari sekmesindeki hizmet kartlarının analiz motorunu çalıştırır.

    Desteklenen hizmet_turu değerleri:
      Ticari_Kredi | POS_Tahsilat | Maas_Bordro | Dis_Ticaret

    İşleyiş:
      1. Kullanıcı doğrulanır (tc_no)
      2. finance_engines.compute_ticari_analysis() — XGBoost mantığıyla
         "Şirket Finansal Sağlık Skoru" hesaplar
      3. Sonuç ticari_analytics tablosuna JSONB olarak kaydedilir
      4. Skor + risk durumu + AI tavsiyesi JSON olarak döndürülür

    Rate limit: settings.analyze_rate_limit (IP başına)
    """
    user = _ensure_user_exists(req.tc_no, db)

    try:
        result = await run_in_threadpool(
            compute_ticari_analysis, req.hizmet_turu, req.girdi_verileri
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    kayit = TicariAnalytics(
        tc_no=req.tc_no,
        hizmet_turu=req.hizmet_turu,
        girdi_verileri=req.girdi_verileri,
        sirket_saglik_skoru=float(result.get("sirket_saglik_skoru", 0.0)),
        yapay_zeka_tavsiyesi=result.get("ai_advice", ""),
    )
    db.add(kayit)
    db.commit()
    db.refresh(kayit)

    background_tasks.add_task(
        send_analysis_report_email, user.tc_no, user.full_name,
        int(result.get("sirket_saglik_skoru", 0))
    )

    return {
        "success": True,
        "kayit_id": kayit.id,
        "hizmet_turu": req.hizmet_turu,
        "result": result,
        "created_at": kayit.created_at.isoformat(),
    }


# ─── 8) ÜRÜN ANALİZİ ───────────────────────────────────────────────────────
@app.post("/api/urunler/analyze")
@limiter.limit(settings.analyze_rate_limit)
async def urunler_analyze(
    request: Request,
    req: UrunAnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Ürünler sekmesindeki kartların analiz motorunu çalıştırır.

    Desteklenen urun_turu değerleri:
      Mevduat_Hesabi | Sigorta_Urunleri | Kampanyalar

    İşleyiş:
      1. Kullanıcı doğrulanır (tc_no)
      2. finance_engines.compute_urun_analysis() — Linear Regression
         mantığıyla kurgusal getiri/prim tahmini hesaplar
      3. Sonuç urunler_analytics tablosuna JSONB olarak kaydedilir
      4. Tahmin + AI tavsiyesi JSON olarak döndürülür

    Rate limit: settings.analyze_rate_limit (IP başına)
    """
    _ensure_user_exists(req.tc_no, db)

    try:
        result = await run_in_threadpool(
            compute_urun_analysis, req.urun_turu, req.girdi_verileri
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    kayit = UrunlerAnalytics(
        tc_no=req.tc_no,
        urun_turu=req.urun_turu,
        girdi_verileri=req.girdi_verileri,
        tahmin_edilen_getiri_veya_prim=float(result.get("tahmin", 0.0)),
        yapay_zeka_tavsiyesi=result.get("ai_advice", ""),
    )
    db.add(kayit)
    db.commit()
    db.refresh(kayit)

    return {
        "success": True,
        "kayit_id": kayit.id,
        "urun_turu": req.urun_turu,
        "result": result,
        "created_at": kayit.created_at.isoformat(),
    }


# ─── 9) KULLANICININ ANALİZ GEÇMİŞİ ────────────────────────────────────────
@app.get("/api/analytics/history/{tc_no}")
async def analytics_history(tc_no: str, db: Session = Depends(get_db)):
    """
    Bir kullanıcının tüm interaktif modül analiz geçmişini döndürür.
    Bireysel, ticari ve ürün analizlerini tek yanıtta birleştirir.
    """
    _ensure_user_exists(tc_no, db)

    bireysel = db.query(BireyselAnalytics).filter(
        BireyselAnalytics.tc_no == tc_no
    ).order_by(BireyselAnalytics.id.desc()).limit(20).all()

    ticari = db.query(TicariAnalytics).filter(
        TicariAnalytics.tc_no == tc_no
    ).order_by(TicariAnalytics.id.desc()).limit(20).all()

    urunler = db.query(UrunlerAnalytics).filter(
        UrunlerAnalytics.tc_no == tc_no
    ).order_by(UrunlerAnalytics.id.desc()).limit(20).all()

    return {
        "bireysel": [k.to_dict() for k in bireysel],
        "ticari": [k.to_dict() for k in ticari],
        "urunler": [k.to_dict() for k in urunler],
        "toplam_analiz": len(bireysel) + len(ticari) + len(urunler),
    }


# =============================================================================
# ZEKABOT — SOHBET ASİSTANI
# =============================================================================

# Keyword tabanlı yedek niyetler — Gemini erişilemezse kullanılır.
_ZEKABOT_INTENTS = [
    {
        "keywords": ["merhaba", "selam", "gunaydin", "günaydın", "iyi gunler",
                     "iyi günler", "naber", "nasılsın", "nasilsin", "hey"],
        "intent": "greeting",
        "reply": (
            "Merhaba! Ben ZekaBot 🤖 — KrediZeka'nın finansal asistanıyım. "
            "Kredi notu, borç/gelir oranı, faiz, yatırım veya konut kredisi "
            "gibi konularda size yardımcı olabilirim. Aklınızdaki soruyu yazın!"
        ),
    },
    {
        "keywords": ["kredi notu", "kredi puanı", "kredi puani", "kredi skoru",
                     "findeks", "sicil", "not yükselt", "puanımı", "skorumu"],
        "intent": "credit_score",
        "reply": (
            "Kredi notunuzu yükseltmek için 3 temel kural: (1) Borç/gelir "
            "oranınızı %30'un altında tutun. (2) Kredi kartı ekstrenizi her ay "
            "tam ödeyin — asgari ödeme notu düşürür. (3) Mevcut kredilerinizi "
            "düzenli ve gününde ödeyin. Düzenli ödeme geçmişi, kredi notunun "
            "en güçlü belirleyicisidir."
        ),
    },
    {
        "keywords": ["borç", "borc", "borçluluk", "borcluluk", "dti",
                     "borç/gelir", "borc/gelir", "gelir oranı"],
        "intent": "debt_ratio",
        "reply": (
            "Borç/Gelir (DTI) oranı, aylık borç ödemelerinizin gelirinize "
            "bölümüdür. Sağlıklı sınır %30-35'tir; %40'ı aşarsa kredi "
            "başvurularınız riskli görülür. Oranı düşürmek için önce en yüksek "
            "faizli borcu kapatın ve yeni taksitli harcamalardan kaçının."
        ),
    },
    {
        "keywords": ["faiz", "faizi", "faiz oranı", "faiz orani", "yıllık faiz"],
        "intent": "interest_rate",
        "reply": (
            "Faiz oranı, ödeyeceğiniz toplam maliyeti doğrudan etkiler. "
            "Düşük faiz için: kredi notunuzu yüksek tutun, kısa vade seçin "
            "(uzun vade aylık taksiti düşürür ama toplam faizi artırır) ve "
            "birden fazla teklifi karşılaştırın. Yıllık maliyet oranını (effektif "
            "faiz) mutlaka kontrol edin — gerçek maliyet odur."
        ),
    },
    {
        "keywords": ["yatırım", "yatirim", "birikim", "tasarruf", "mevduat",
                     "altın", "altin", "döviz", "doviz", "portföy", "portfoy"],
        "intent": "investment",
        "reply": (
            "Sağlıklı bir yatırımın ilk kuralı çeşitlendirmedir — tüm birikimi "
            "tek bir araca koymayın. Önce 3-6 aylık giderinizi karşılayacak bir "
            "acil durum fonu oluşturun, ardından risk profilinize göre mevduat, "
            "fon ve değerli varlıklar arasında dengeli dağıtım yapın. Düzenli ve "
            "küçük tutarlarla yatırım, zamanlama yapmaktan daha güvenilirdir."
        ),
    },
    {
        "keywords": ["konut", "ev kredisi", "mortgage", "ipotek", "ev almak",
                     "ev alma"],
        "intent": "housing_loan",
        "reply": (
            "Konut kredisinde peşinat oranı kritiktir: ne kadar yüksek peşinat "
            "verirseniz, faiz yükü ve aylık taksit o kadar düşer. İdeal olarak "
            "konut bedelinin en az %25'ini peşin ödemeyi hedefleyin. Aylık "
            "taksitin, net gelirinizin %35'ini aşmamasına dikkat edin."
        ),
    },
    {
        "keywords": ["kredi kartı", "kredi karti", "kart", "ekstre", "asgari",
                     "asgari ödeme", "nakit avans"],
        "intent": "credit_card",
        "reply": (
            "Kredi kartını doğru kullanmanın anahtarı: ekstreyi her ay TAM "
            "ödemek. Asgari ödeme yapmak, kalan borca yüksek faiz işletir ve "
            "kredi notunuzu düşürür. Nakit avanstan kaçının — anında faiz "
            "başlatır. Kart limitinizin en fazla %30'unu kullanmak, kredi "
            "notunuz için idealdir."
        ),
    },
    {
        # 'about', 'loan_application'dan önce gelmeli: "kredizeka" içinde
        # "kredi" geçtiği için aksi halde yanlış eşleşir.
        "keywords": ["kredizeka", "sen kimsin", "ne yapabilirsin", "nedir",
                     "yardım", "yardim", "ne işe yarar", "kimsin"],
        "intent": "about",
        "reply": (
            "KrediZeka, yapay zeka destekli bir finansal risk asistanıdır. "
            "Ben ZekaBot olarak kredi notu, borç yönetimi, faiz, yatırım ve "
            "konut kredisi konularında rehberlik ederim. Ayrıca ana sayfadaki "
            "Risk Analizi aracıyla kredi onaylanma olasılığınızı hesaplayabilir; "
            "Bireysel ve Ticari modüllerle finansal simülasyonlar yapabilirsiniz."
        ),
    },
    {
        "keywords": ["kredi", "kredi çek", "kredi cek", "kredi başvuru",
                     "kredi basvuru", "başvuru", "basvuru", "kredi al"],
        "intent": "loan_application",
        "reply": (
            "Kredi başvurusu öncesi 3 hazırlık yapın: (1) Kredi notunuzu "
            "öğrenin. (2) Borç/gelir oranınızı %35'in altına çekin. (3) Talep "
            "ettiğiniz tutarı gelirinizin makul bir katıyla sınırlayın. "
            "KrediZeka'nın ana sayfasındaki Risk Analizi aracı, onaylanma "
            "olasılığınızı saniyeler içinde hesaplar — başvurudan önce deneyin!"
        ),
    },
    {
        "keywords": ["teşekkür", "tesekkur", "sağ ol", "sag ol", "eyvallah",
                     "sağol", "sagol"],
        "intent": "thanks",
        "reply": (
            "Rica ederim! 😊 Finansal sağlığınız için her zaman buradayım. "
            "Başka bir sorunuz olursa çekinmeden yazın."
        ),
    },
]

# Hiçbir niyet eşleşmezse döndürülecek varsayılan yanıt
_ZEKABOT_FALLBACK = (
    "Sorunuzu tam çözümleyemedim 🤔 ama yardımcı olmak isterim! "
    "Şu konularda bana soru sorabilirsiniz: kredi notu yükseltme, "
    "borç/gelir oranı, faiz oranları, yatırım & birikim, konut kredisi "
    "veya kredi kartı kullanımı. Örneğin: \"Kredi notumu nasıl yükseltirim?\""
)


def _normalize_tr(text: str) -> str:
    """Mesajı küçük harfe indirir (Türkçe karakter düzeltmesiyle)."""
    replacements = {"İ": "i", "I": "ı", "Ş": "ş", "Ğ": "ğ",
                    "Ü": "ü", "Ö": "ö", "Ç": "ç"}
    for big, small in replacements.items():
        text = text.replace(big, small)
    return text.lower().strip()


def _zekabot_generate_reply(message: str) -> dict:
    """Mesajı niyetlerle eşleştirir; eşleşme yoksa fallback döner."""
    normalized = _normalize_tr(message)

    for entry in _ZEKABOT_INTENTS:
        for keyword in entry["keywords"]:
            if keyword in normalized:
                return {"reply": entry["reply"], "intent": entry["intent"]}

    return {"reply": _ZEKABOT_FALLBACK, "intent": "fallback"}


# Gemini'ye verilen rol talimatı (system instruction)
_GEMINI_SYSTEM_PROMPT = (
    "Sen ZekaBot'sun — 'KrediZeka' adlı yapay zeka destekli finansal risk "
    "analizi platformunun sohbet asistanısın. Kullanıcılara kredi, kredi notu, "
    "borç yönetimi, faiz, yatırım, birikim, konut kredisi ve kredi kartı gibi "
    "kişisel finans konularında yardımcı olursun.\n\n"
    "Uyman gereken kurallar:\n"
    "1. Her zaman Türkçe ve sade, anlaşılır bir dille yanıt ver.\n"
    "2. Yanıtların kısa ve öz olsun — en fazla 4-5 cümle. Yanıtın küçük bir "
    "sohbet balonunda gösterilecek.\n"
    "3. Yalnızca finans, bankacılık ve ekonomi konularında yardımcı ol. "
    "Konu dışı sorularda kibarca finans konularına geri yönlendir.\n"
    "4. Gerçek banka/kurum ismi verme; kesin yatırım garantisi vaat etme; "
    "tavsiyelerini bağlayıcı emir değil, genel bilgi olarak sun.\n"
    "5. Uygun olduğunda kullanıcıyı KrediZeka ana sayfasındaki ücretsiz "
    "'Risk Analizi' aracını denemeye yönlendir."
)


def _call_gemini(message: str) -> str:
    """Gemini API'sini çağırır (senkron — threadpool'da çalıştırılır)."""
    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=message,
        config=genai_types.GenerateContentConfig(
            system_instruction=_GEMINI_SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=800,
            # thinking_budget=0: Gemini 2.5'in düşünme aşamasını kapatır —
            # yanıt yarıda kesilmez, daha hızlı gelir.
            thinking_config=genai_types.ThinkingConfig(thinking_budget=0),
        ),
    )
    return (response.text or "").strip()


@app.post("/api/chat")
@limiter.limit(settings.chat_rate_limit)
async def chat(request: Request, req: ChatRequest):
    """
    ZekaBot uç noktası.

    Önce Gemini denenir; anahtar yoksa veya çağrı başarısız olursa keyword
    tabanlı yedeğe düşülür — böylece her durumda yanıt döner.
    """
    # 1) Gemini'yi dene (20 sn zaman aşımı)
    if settings.gemini_api_key:
        try:
            reply = await asyncio.wait_for(
                run_in_threadpool(_call_gemini, req.message),
                timeout=20.0,
            )
            if reply:
                return {
                    "success": True,
                    "reply": reply,
                    "intent": "ai_generated",
                    "source": "gemini",
                }
        except Exception as e:
            print(f"⚠️  Gemini çağrısı başarısız ({type(e).__name__}: {e}). "
                  f"Anahtar kelime yedeğine geçiliyor.")

    # 2) Yedek: keyword eşleştirme (sahte "düşünme" gecikmesiyle)
    await asyncio.sleep(1.0)
    payload = _zekabot_generate_reply(req.message)
    return {
        "success": True,
        "reply": payload["reply"],
        "intent": payload["intent"],
        "source": "keyword",
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


def admin_stats_cache_key(
    func,
    namespace: str = "",
    *,
    request=None,
    response=None,
    args=(),
    kwargs=None,
) -> str:
    """
    /api/admin/stats için sabit önbellek anahtarı.

    Varsayılan anahtar üretici argümanları (her istekte değişen db oturumu
    gibi) hesaba kattığından önbellek hiç isabet etmez; sabit anahtar bunu çözer.
    """
    return f"{namespace}:admin-stats:v1"


@app.get("/api/admin/stats")
@cache(expire=60, namespace="kredizeka", key_builder=admin_stats_cache_key)
async def admin_stats(
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Yönetici paneli istatistikleri — 60 sn önbelleklenir."""
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


@app.get("/api/admin/users")
async def admin_list_users(
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Yönetici paneli için kullanıcı listesi (en yeniden eskiye)."""
    users = db.query(User).order_by(User.id.desc()).limit(200).all()
    return {
        "users": [
            {
                "tc_no": u.tc_no,
                "full_name": u.full_name,
                "email": u.email or "",
                "email_verified": bool(u.email_verified),
                "is_admin": bool(u.is_admin),
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": len(users),
    }


@app.delete("/api/admin/users/{tc_no}")
async def admin_delete_user(
    tc_no: str,
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Bir kullanıcıyı (ve ilişkili kayıtlarını) siler.

    Güvenlik: Yönetici hesapları silinemez — bu kural, bir admin'in kendini
    veya tüm yöneticileri yanlışlıkla silmesini de engeller.
    """
    user = db.query(User).filter(User.tc_no == tc_no).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    if user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Yönetici hesapları silinemez."
        )

    target_name = user.full_name

    # İlişkili jeton kayıtlarını temizle (her iki veritabanında da güvenli)
    db.query(PasswordResetToken).filter(PasswordResetToken.tc_no == tc_no).delete()
    db.query(EmailVerificationToken).filter(EmailVerificationToken.tc_no == tc_no).delete()
    # Analiz kayıtları, User ilişkilerindeki cascade ile birlikte silinir
    db.delete(user)
    db.commit()

    return {
        "success": True,
        "message": f"'{target_name}' adlı kullanıcı kalıcı olarak silindi.",
    }


# =============================================================================
# Üretim için uvicorn entry point
# =============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
