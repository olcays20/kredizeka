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
    # Yalnızca güvenilen origin'lere izin verilir (yerel geliştirme +
    # Vercel üretim domaini). Gerekirse CORS_ORIGINS ortam değişkeniyle
    # virgülle ayrılmış başka adresler eklenebilir.
    cors_origins: str = (
        "http://localhost:5173,http://localhost:3000,"
        "https://kredizeka.vercel.app"
    )

    # ─── Redis (Önbellek) ────────────────────────────────────────────
    # Erişilemezse uygulama bellek-içi önbelleğe düşer.
    redis_url: str = "redis://localhost:6379"

    # ─── ML Modeli ──────────────────────────────────────────────────
    model_path: str = "loan_risk_pipeline.pkl"

    # ─── Gemini (ZekaBot) ───────────────────────────────────────────
    # Anahtar tanımlıysa ZekaBot gerçek Gemini'yi, yoksa keyword yedeğini kullanır.
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # ─── Brevo (Şifre Sıfırlama E-postası) ──────────────────────────
    # Anahtar tanımlıysa e-posta gerçekten gönderilir, yoksa simüle edilir.
    brevo_api_key: str = ""
    # Brevo panelinde doğrulanmış gönderen adresi.
    brevo_sender_email: str = "kredizeka.destek@gmail.com"
    brevo_sender_name: str = "KrediZeka Destek"

    # ─── Frontend Adresi ────────────────────────────────────────────
    # Şifre sıfırlama linki bu adres üzerinden oluşturulur.
    frontend_url: str = "http://localhost:5173"

    # ─── Varsayılan Admin ───────────────────────────────────────────
    # İlk başlatmada otomatik oluşturulur (sadece sistemde admin yoksa).
    # default_admin_password boş bırakılırsa, açılışta rastgele güçlü bir
    # parola üretilir — koda hiçbir zaman sabit (hardcoded) parola yazılmaz.
    default_admin_tc: str = "11111111111"
    default_admin_password: str = ""
    default_admin_name: str = "KrediZeka Yönetici"

    # ─── Rate Limiting ───────────────────────────────────────────────
    # slowapi için default rate limit (auth uç noktaları için dakikada N istek)
    auth_rate_limit: str = "5/minute"
    analyze_rate_limit: str = "10/minute"
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

    @field_validator(
        "brevo_api_key", "brevo_sender_email", "brevo_sender_name",
        "gemini_api_key", "gemini_model", "frontend_url", "redis_url",
    )
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        # Panele yapıştırılan değerlerin sonuna kaçabilen '\n' gibi görünmez
        # karakterleri temizler — aksi halde HTTP başlığında hataya yol açar.
        return v.strip() if isinstance(v, str) else v

    @property
    def cors_origin_list(self) -> list[str]:
        """CORS_ORIGINS env değişkenini liste olarak döndür."""
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


# Singleton settings nesnesi — uygulama genelinde tek örnek
settings = Settings()
