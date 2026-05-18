"""
KrediZeka - Veritabanı Bağlantı Katmanı (SQLAlchemy 2.0)
=========================================================
PostgreSQL ve SQLite (geriye uyumluluk) ile çalışan ORM altyapısı.

Bileşenler:
  - engine    : SQLAlchemy bağlantı havuzunu yöneten ana nesne
  - SessionLocal : Her istek için açılacak DB oturumlarının fabrikası
  - Base      : Tüm ORM modellerinin türeyeceği taban sınıf
  - get_db()  : FastAPI dependency injection için generator
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

# ─── Engine Oluşturma ───────────────────────────────────────────────
# SQLite için ekstra parametre gerekiyor (multi-thread için)
# PostgreSQL için standart havuz ayarları yeterli
connect_args = {}
if settings.database_url.startswith("sqlite"):
    # SQLite multi-thread uyumluluğu için
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    # Pool ayarları: PostgreSQL için yüksek trafik desteği
    pool_pre_ping=True,    # Çürük bağlantıları otomatik yenile
    pool_size=5,           # Aynı anda 5 bağlantı
    max_overflow=10,       # Pic'te 10 bağlantı daha açılabilir
    echo=False,            # SQL loglarını kapalı tut (debug için True yapılabilir)
)

# ─── Session Fabrikası ──────────────────────────────────────────────
# autocommit=False → Her transaction manuel olarak commit edilir
# autoflush=False  → Sorgu öncesi otomatik flush yapma (performans)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ─── ORM Taban Sınıfı ───────────────────────────────────────────────
# Tüm model sınıfları (örn. User) bundan türeyecek
Base = declarative_base()


def get_db():
    """
    FastAPI Dependency: Her istek başına yeni bir DB oturumu açar
    ve istek sonunda otomatik kapatır.

    Kullanım:
        @app.get("/items")
        def list_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
