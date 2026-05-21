"""
KrediZeka - Uygulama Konfigürasyonu (Settings)
=================================================
Tüm uygulama ayarları .env dosyasından veya ortam değişkenlerinden okunur.
Pydantic Settings sayesinde tipler otomatik doğrulanır ve eksik değerler
açıklayıcı hata mesajlarıyla yakalanır.

Kullanım:
    from config import settings
    print(settings.database_url)
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Uygulama ayarları — ortam değişkenlerinden otomatik yüklenir.

    Öncelik sırası:
      1. Ortam değişkeni (örn. export DATABASE_URL=...)
      2. .env dosyası (varsa)
      3. Aşağıdaki varsayılan değerler
    """

    # ─── Veritabanı ──────────────────────────────────────────────────
    # SQLite fallback (Docker dışında çalıştırırken kolay test için)
    # Üretimde: postgresql+psycopg2://user:pass@host:5432/dbname
    # Not: /tmp altında yazılabilir disk her PaaS'da garantilidir (Render dahil)
    database_url: str = "sqlite:////tmp/kredizeka.db"

    # ─── CORS ────────────────────────────────────────────────────────
    # Virgülle ayrılmış origin listesi ("*" = hepsi)
    cors_origins: str = "*"

    # ─── Redis (Önbellek) ────────────────────────────────────────────
    # fastapi-cache2 bu adres üzerinden Redis'e bağlanır.
    # Yerel geliştirmede localhost; Docker'da 'redis' servis adıdır.
    # Redis erişilemezse uygulama otomatik olarak bellek-içi (in-memory)
    # önbelleğe düşer — bu yüzden Redis olmadan da sistem çalışmaya devam eder.
    redis_url: str = "redis://localhost:6379"

    # ─── ML Modeli ──────────────────────────────────────────────────
    model_path: str = "loan_risk_pipeline.pkl"

    # ─── Gemini (ZekaBot Üretken Yapay Zeka) ────────────────────────
    # ZekaBot sohbet asistanı, bu anahtar TANIMLIYSA gerçek Google Gemini
    # API'sini kullanır. Anahtar boşsa (varsayılan), ZekaBot anahtar kelime
    # eşleştirme tabanlı yerel yedek (fallback) mantığıyla çalışmaya devam eder.
    #
    # GÜVENLİK: API anahtarı ASLA koda veya git deposuna yazılmaz. Yalnızca
    # ortam değişkeni (GEMINI_API_KEY) ile sağlanır — yerelde .env dosyası,
    # üretimde Render ortam değişkeni olarak tanımlanır.
    gemini_api_key: str = ""
    # Kullanılacak Gemini modeli — hız/maliyet için 'flash' sürümü idealdir
    gemini_model: str = "gemini-2.5-flash"

    # ─── Varsayılan Admin ───────────────────────────────────────────
    # İlk başlatmada otomatik oluşturulur (sadece sistemde admin yoksa)
    default_admin_tc: str = "11111111111"
    default_admin_password: str = "admin123"
    default_admin_name: str = "KrediZeka Yönetici"

    # ─── Rate Limiting ───────────────────────────────────────────────
    # slowapi için default rate limit (auth uç noktaları için dakikada N istek)
    auth_rate_limit: str = "5/minute"
    analyze_rate_limit: str = "10/minute"
    # ZekaBot sohbet uç noktası için ayrı (daha cömert) limit
    chat_rate_limit: str = "30/minute"

    # Pydantic Settings yapılandırması
    # protected_namespaces: Pydantic v2'de "model_" prefix'li alan isimleri
    # uyarı verir (BaseModel API ile çakışma riski). Bizim 'model_path' alanımız
    # zararsız, bu yüzden korumalı namespace listesini sadece 'settings_' yapıyoruz.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=('settings_',),
    )

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        """
        Veritabanı URL'ini SQLAlchemy + psycopg2 ile uyumlu hale getirir.

        Render, Heroku gibi sağlayıcılar PostgreSQL bağlantı URL'ini
        'postgres://' veya 'postgresql://' önekiyle verir. SQLAlchemy'nin
        psycopg2 sürücüsünü açıkça kullanması için öneki 'postgresql+psycopg2://'
        olarak düzeltiyoruz. Bu sayede kullanıcı, sağlayıcının verdiği URL'i
        olduğu gibi yapıştırabilir.
        """
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+psycopg2://", 1)
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        """CORS_ORIGINS env değişkenini liste olarak döndür."""
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


# Singleton settings nesnesi — uygulama genelinde tek örnek
settings = Settings()
