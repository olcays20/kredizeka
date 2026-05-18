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

    # ─── ML Modeli ──────────────────────────────────────────────────
    model_path: str = "loan_risk_pipeline.pkl"

    # ─── Varsayılan Admin ───────────────────────────────────────────
    # İlk başlatmada otomatik oluşturulur (sadece sistemde admin yoksa)
    default_admin_tc: str = "11111111111"
    default_admin_password: str = "admin123"
    default_admin_name: str = "KrediZeka Yönetici"

    # ─── Rate Limiting ───────────────────────────────────────────────
    # slowapi için default rate limit (auth uç noktaları için dakikada N istek)
    auth_rate_limit: str = "5/minute"
    analyze_rate_limit: str = "10/minute"

    # Pydantic Settings yapılandırması
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Tanımlı olmayan env'leri yoksay
    )

    @property
    def cors_origin_list(self) -> list[str]:
        """CORS_ORIGINS env değişkenini liste olarak döndür."""
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


# Singleton settings nesnesi — uygulama genelinde tek örnek
settings = Settings()
