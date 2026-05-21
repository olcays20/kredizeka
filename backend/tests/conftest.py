"""
KrediZeka - Pytest Ortak Fixture'ları (conftest.py)
======================================================
conftest.py, pytest tarafından otomatik yüklenen özel bir dosyadır.
İçindeki fixture'lar, aynı dizindeki ve alt dizinlerdeki tüm test
dosyalarına otomatik olarak sunulur.

Bu dosya iki kritik görev üstlenir:
  1. İzolasyon: Testlerin gerçek (production) PostgreSQL veritabanını
     KİRLETMEMESİ için ayrı bir geçici SQLite test veritabanı kullanılır.
  2. Ortam hazırlığı: Backend modülleri import edilmeden ÖNCE ortam
     değişkenleri ayarlanır (config.py modül seviyesinde okuduğu için).
"""

import os
import pathlib
import random

# =============================================================================
# KRİTİK SIRA: Ortam değişkenleri, backend modülleri import edilmeden
# ÖNCE ayarlanmalıdır. config.py, modül yüklenirken Settings() ile bu
# değerleri okur — bu yüzden importlardan önce environment'a yazıyoruz.
# =============================================================================

# 1) İzole test veritabanı — gerçek veriye asla dokunulmaz
_TEST_DB_PATH = pathlib.Path(__file__).resolve().parent.parent / "test_kredizeka.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH}"

# 2) Rate limiting'i test sırasında devre dışı bırak (çok yüksek limit).
#    Aksi halde çok sayıda register/login çağrısı HTTP 429 dönebilir.
os.environ["AUTH_RATE_LIMIT"] = "100000/minute"
os.environ["ANALYZE_RATE_LIMIT"] = "100000/minute"

# 3) Varsayılan admin bilgileri (testlerde admin senaryoları için)
os.environ["DEFAULT_ADMIN_TC"] = "11111111111"
os.environ["DEFAULT_ADMIN_PASSWORD"] = "admin123"

# ─── Artık ortam hazır; backend modülleri güvenle import edilebilir ──────
import pytest
from fastapi.testclient import TestClient

from main import app  # noqa: E402  (import sırası kasıtlı)


# =============================================================================
# FIXTURE'LAR
# =============================================================================

@pytest.fixture(scope="session")
def client():
    """
    Oturum (session) kapsamlı FastAPI test istemcisi.

    'with TestClient(app)' bloğu, uygulamanın startup ve shutdown
    yaşam döngüsü olaylarını tetikler. startup sırasında:
      - Veritabanı tabloları oluşturulur (init_database)
      - ML modeli belleğe yüklenir
      - Varsayılan admin hesabı oluşturulur

    Test oturumu başlamadan ve bittikten sonra geçici test veritabanı
    dosyası silinir — böylece her çalıştırma temiz başlar.
    """
    # Önceki testlerden kalmış test DB'sini temizle
    if _TEST_DB_PATH.exists():
        _TEST_DB_PATH.unlink()

    # TestClient'ı context manager olarak aç → startup event'leri çalışır
    with TestClient(app) as test_client:
        yield test_client

    # Test oturumu bitti — geçici veritabanını sil
    if _TEST_DB_PATH.exists():
        _TEST_DB_PATH.unlink()


@pytest.fixture
def unique_tc():
    """
    Her test için benzersiz, geçerli bir T.C. Kimlik Numarası üretir.

    Kurallar:
      - 11 haneli
      - Yalnızca rakam
      - 0 ile başlayamaz (backend validasyon kuralı)

    Benzersizlik, "aynı T.C. ile tekrar kayıt" gibi senaryolarda
    testlerin birbirini etkilememesini sağlar.
    """
    # 10^10 (11 haneli, 1 ile başlar) ile 10^11-1 arası rastgele sayı
    return str(random.randint(10_000_000_000, 99_999_999_999))


@pytest.fixture
def registered_user(client, unique_tc):
    """
    Önceden kaydedilmiş bir test kullanıcısı oluşturur ve bilgilerini döndürür.

    Giriş (login) veya analiz (analyze) gibi, var olan bir kullanıcı
    gerektiren testler bu fixture'ı kullanarak hazır bir hesapla başlar.

    Returns:
        dict: { tc_no, full_name, phone, password }
    """
    user_data = {
        "tc_no": unique_tc,
        "full_name": "Test Kullanıcı",
        "phone": "05551234567",
        "password": "test1234",
    }
    response = client.post("/api/register", json=user_data)
    # Kaydın başarılı olduğunu doğrula (fixture kurulumu güvencesi)
    assert response.status_code == 200, f"Fixture kaydı başarısız: {response.text}"
    return user_data
