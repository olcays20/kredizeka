"""
KrediZeka - API Birim Testleri (test_api.py)
==============================================
FastAPI uç noktalarının (endpoint) beklendiği gibi çalıştığını
kanıtlayan birim testleri.

Test edilen uç noktalar:
  - POST /api/register      → Kullanıcı kaydı
  - POST /api/login         → Kullanıcı girişi
  - POST /api/bireysel/analyze  → Bireysel finansal analiz
  - POST /api/ticari/analyze    → Ticari şirket sağlık analizi
  - POST /api/urunler/analyze   → Ürün getiri/prim analizi
  - GET  /                  → Sağlık kontrolü

Kalite Yaklaşımı:
  Her test tek bir davranışı (assertion) doğrular — bir test
  başarısız olduğunda hangi özelliğin bozulduğu net anlaşılır.
  Testler 'conftest.py' içindeki izole SQLite veritabanını kullanır;
  gerçek üretim verisine asla dokunulmaz.
"""

import pytest


# =============================================================================
# 1) SAĞLIK KONTROLÜ TESTLERİ
# =============================================================================

class TestHealthCheck:
    """Kök endpoint (/) — API'nin ayakta olduğunu doğrular."""

    def test_root_returns_200(self, client):
        """Kök endpoint HTTP 200 dönmeli."""
        response = client.get("/")
        assert response.status_code == 200

    def test_root_returns_expected_json(self, client):
        """Kök endpoint, beklenen JSON alanlarını içermeli."""
        response = client.get("/")
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["version"] == "2.0.0"


# =============================================================================
# 2) KAYIT (REGISTER) TESTLERİ
# =============================================================================

class TestRegister:
    """POST /api/register — Kullanıcı kayıt senaryoları."""

    def test_register_success(self, client, unique_tc):
        """
        Geçerli bilgilerle kayıt başarılı olmalı (HTTP 200).
        Yanıt 'success: true' içermelidir.
        """
        response = client.post("/api/register", json={
            "tc_no": unique_tc,
            "full_name": "Ahmet Yılmaz",
            "email": "ahmet.yilmaz@kredizeka.com",
            "phone": "05551112233",
            "password": "Guvenli123!",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data

    def test_register_duplicate_tc_returns_conflict(self, client, unique_tc):
        """
        Aynı T.C. Kimlik No ile İKİNCİ kez kayıt denemesi reddedilmeli.
        Backend, var olan kaynak için HTTP 409 (Conflict) döner.
        """
        user = {
            "tc_no": unique_tc,
            "full_name": "Zeynep Kaya",
            "email": "zeynep.kaya@kredizeka.com",
            "phone": "05559998877",
            "password": "Parola456!",
        }
        # İlk kayıt → başarılı
        first = client.post("/api/register", json=user)
        assert first.status_code == 200

        # İkinci kayıt (aynı TC) → reddedilmeli
        second = client.post("/api/register", json=user)
        assert second.status_code == 409
        assert "zaten" in second.json()["detail"].lower()

    def test_register_invalid_tc_non_digit(self, client):
        """
        T.C. No rakam dışı karakter içeriyorsa Pydantic validasyonu
        devreye girer ve HTTP 422 (Unprocessable Entity) döner.
        """
        response = client.post("/api/register", json={
            "tc_no": "1234567890A",  # Son karakter harf — geçersiz
            "full_name": "Hatalı Kullanıcı",
            "email": "hatali@kredizeka.com",
            "phone": "05551234567",
            "password": "Parola123!",
        })
        assert response.status_code == 422

    def test_register_invalid_tc_starts_with_zero(self, client):
        """
        T.C. Kimlik No 0 ile başlayamaz — validasyon HTTP 422 döndürür.
        """
        response = client.post("/api/register", json={
            "tc_no": "01234567890",  # 0 ile başlıyor — geçersiz
            "full_name": "Sıfır Kullanıcı",
            "email": "sifir@kredizeka.com",
            "phone": "05551234567",
            "password": "Parola123!",
        })
        assert response.status_code == 422

    def test_register_short_password(self, client, unique_tc):
        """
        Parola 6 karakterden kısaysa kayıt reddedilmeli (HTTP 422).
        """
        response = client.post("/api/register", json={
            "tc_no": unique_tc,
            "full_name": "Kısa Parola",
            "email": "kisa.parola@kredizeka.com",
            "phone": "05551234567",
            "password": "123",  # 3 karakter — minimum 6 gerekli
        })
        assert response.status_code == 422

    def test_register_invalid_email_returns_422(self, client, unique_tc):
        """
        Geçersiz formatta bir e-posta adresi ile kayıt reddedilmeli.
        E-posta '@' ve geçerli bir alan adı içermiyorsa Pydantic
        validasyonu devreye girer ve HTTP 422 döner.
        """
        response = client.post("/api/register", json={
            "tc_no": unique_tc,
            "full_name": "Gecersiz Eposta",
            "email": "bu-bir-eposta-degil",  # '@' yok — geçersiz format
            "phone": "05551234567",
            "password": "Parola123!",
        })
        assert response.status_code == 422

    def test_register_weak_password_returns_422(self, client, unique_tc):
        """
        Güçlü parola kriterlerini sağlamayan bir şifre ile kayıt reddedilmeli.
        'alfabeta123' yeterince uzun olsa da büyük harf ve özel karakter
        içermediğinden validasyon HTTP 422 döndürür.
        """
        response = client.post("/api/register", json={
            "tc_no": unique_tc,
            "full_name": "Zayif Parola",
            "email": "zayif.parola@kredizeka.com",
            "phone": "05551234567",
            "password": "alfabeta123",  # büyük harf ve özel karakter yok
        })
        assert response.status_code == 422


# =============================================================================
# 3) GİRİŞ (LOGIN) TESTLERİ
# =============================================================================

class TestLogin:
    """POST /api/login — Kullanıcı giriş senaryoları."""

    def test_login_success(self, client, registered_user):
        """
        Kayıtlı bir kullanıcı doğru parolayla giriş yapabilmeli (HTTP 200).
        Yanıt, parola hash'i HARİÇ kullanıcı bilgilerini içermelidir.
        """
        response = client.post("/api/login", json={
            "tc_no": registered_user["tc_no"],
            "password": registered_user["password"],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["tc_no"] == registered_user["tc_no"]
        # Güvenlik: parola veya hash'i ASLA yanıtta yer almamalı
        assert "password" not in data["user"]
        assert "password_hash" not in data["user"]

    def test_login_wrong_password(self, client, registered_user):
        """
        Yanlış parola ile giriş reddedilmeli (HTTP 401 Unauthorized).
        """
        response = client.post("/api/login", json={
            "tc_no": registered_user["tc_no"],
            "password": "yanlis_parola",
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        """
        Kayıtlı olmayan bir T.C. No ile giriş reddedilmeli (HTTP 401).
        """
        response = client.post("/api/login", json={
            "tc_no": "98765432109",  # Sistemde olmayan TC
            "password": "herhangi123",
        })
        assert response.status_code == 401


# =============================================================================
# 4) BİREYSEL ANALİZ TESTLERİ
# =============================================================================

class TestBireyselAnalyze:
    """POST /api/bireysel/analyze — Bireysel finansal analiz senaryoları."""

    def test_kredi_yonetimi_returns_200(self, client, registered_user):
        """
        Kredi Yönetimi analizi geçerli girdiyle HTTP 200 dönmeli ve
        beklenen JSON yapısını içermelidir.
        """
        response = client.post("/api/bireysel/analyze", json={
            "tc_no": registered_user["tc_no"],
            "hizmet_turu": "Kredi_Yonetimi",
            "girdi_verileri": {
                "aylik_gelir": 15000,
                "toplam_borc": 5000,
                "talep_kredi": 50000,
            },
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Sonuç yapısı doğrulaması
        result = data["result"]
        assert "score" in result
        assert "ai_advice" in result
        assert "chart_data" in result

    def test_kredi_yonetimi_score_in_valid_range(self, client, registered_user):
        """
        Kredi Yönetimi skoru, mantıklı bir aralıkta (0-100) olmalıdır.
        """
        response = client.post("/api/bireysel/analyze", json={
            "tc_no": registered_user["tc_no"],
            "hizmet_turu": "Kredi_Yonetimi",
            "girdi_verileri": {
                "aylik_gelir": 20000,
                "toplam_borc": 3000,
                "talep_kredi": 40000,
            },
        })
        assert response.status_code == 200
        score = response.json()["result"]["score"]
        assert 0 <= score <= 100, f"Skor 0-100 aralığında olmalı, gelen: {score}"

    def test_birikim_returns_prediction(self, client, registered_user):
        """
        Birikim analizi 'tahmin' ve 'tahmin_label' alanlarını döndürmeli
        (risk skoru değil — birikim bir getiri tahminidir).
        """
        response = client.post("/api/bireysel/analyze", json={
            "tc_no": registered_user["tc_no"],
            "hizmet_turu": "Birikim",
            "girdi_verileri": {
                "anapara": 20000,
                "vade_ay": 24,
                "aylik_ekleme": 1000,
            },
        })
        assert response.status_code == 200
        result = response.json()["result"]
        assert "tahmin" in result
        assert "tahmin_label" in result
        assert result["tahmin"] > 0  # Pozitif bir getiri beklenir

    def test_invalid_service_type_returns_400(self, client, registered_user):
        """
        Tanımsız bir hizmet türü gönderilince HTTP 400 (Bad Request) dönmeli.
        """
        response = client.post("/api/bireysel/analyze", json={
            "tc_no": registered_user["tc_no"],
            "hizmet_turu": "Olmayan_Hizmet",
            "girdi_verileri": {"x": 1},
        })
        assert response.status_code == 400

    def test_analyze_with_nonexistent_user_returns_404(self, client):
        """
        Kayıtlı olmayan bir kullanıcı analiz yapamaz — HTTP 404 dönmeli.
        """
        response = client.post("/api/bireysel/analyze", json={
            "tc_no": "90909090909",  # Sistemde olmayan TC
            "hizmet_turu": "Kredi_Yonetimi",
            "girdi_verileri": {
                "aylik_gelir": 15000,
                "toplam_borc": 5000,
                "talep_kredi": 50000,
            },
        })
        assert response.status_code == 404


# =============================================================================
# 5) TİCARİ ANALİZ TESTLERİ
# =============================================================================

class TestTicariAnalyze:
    """POST /api/ticari/analyze — Ticari şirket sağlık analizi senaryoları."""

    def test_ticari_kredi_returns_health_score(self, client, registered_user):
        """
        Ticari Kredi analizi, 'sirket_saglik_skoru' alanını döndürmeli ve
        skor 0-100 aralığında olmalıdır.
        """
        response = client.post("/api/ticari/analyze", json={
            "tc_no": registered_user["tc_no"],
            "hizmet_turu": "Ticari_Kredi",
            "girdi_verileri": {
                "yillik_ciro": 5000000,
                "calisan_sayisi": 25,
                "aylik_pos_hacmi": 300000,
                "sirket_yasi": 8,
                "mevcut_borc": 1000000,
            },
        })
        assert response.status_code == 200
        result = response.json()["result"]
        assert "sirket_saglik_skoru" in result
        skor = result["sirket_saglik_skoru"]
        assert 0 <= skor <= 100, f"Sağlık skoru 0-100 aralığında olmalı: {skor}"

    def test_ticari_weak_company_lower_score(self, client, registered_user):
        """
        Zayıf finansallara sahip bir şirket (yüksek borç, kısa geçmiş),
        güçlü bir şirkete göre DAHA DÜŞÜK sağlık skoru almalıdır.
        Bu, simülasyon motorunun gerçekten ayrım yaptığını kanıtlar.
        """
        # Zayıf şirket: yüksek borç/ciro, kısa geçmiş
        weak = client.post("/api/ticari/analyze", json={
            "tc_no": registered_user["tc_no"],
            "hizmet_turu": "Ticari_Kredi",
            "girdi_verileri": {
                "yillik_ciro": 800000,
                "calisan_sayisi": 5,
                "aylik_pos_hacmi": 40000,
                "sirket_yasi": 1,
                "mevcut_borc": 700000,
            },
        }).json()["result"]["sirket_saglik_skoru"]

        # Güçlü şirket: düşük borç, uzun geçmiş, yüksek POS
        strong = client.post("/api/ticari/analyze", json={
            "tc_no": registered_user["tc_no"],
            "hizmet_turu": "Ticari_Kredi",
            "girdi_verileri": {
                "yillik_ciro": 20000000,
                "calisan_sayisi": 80,
                "aylik_pos_hacmi": 1500000,
                "sirket_yasi": 15,
                "mevcut_borc": 1000000,
            },
        }).json()["result"]["sirket_saglik_skoru"]

        assert weak < strong, (
            f"Zayıf şirket skoru ({weak}) güçlü şirketten ({strong}) "
            f"düşük olmalıydı."
        )


# =============================================================================
# 6) ÜRÜN ANALİZ TESTLERİ
# =============================================================================

class TestUrunAnalyze:
    """POST /api/urunler/analyze — Ürün getiri/prim analizi senaryoları."""

    def test_mevduat_returns_prediction(self, client, registered_user):
        """
        Mevduat analizi 'tahmin' alanı döndürmeli ve getiri pozitif olmalı.
        """
        response = client.post("/api/urunler/analyze", json={
            "tc_no": registered_user["tc_no"],
            "urun_turu": "Mevduat_Hesabi",
            "girdi_verileri": {
                "mevduat_tutari": 100000,
                "vade_ay": 12,
            },
        })
        assert response.status_code == 200
        result = response.json()["result"]
        assert "tahmin" in result
        assert result["tahmin"] > 0

    def test_kampanya_returns_200(self, client, registered_user):
        """
        Kampanya analizi geçerli girdiyle HTTP 200 dönmeli.
        """
        response = client.post("/api/urunler/analyze", json={
            "tc_no": registered_user["tc_no"],
            "urun_turu": "Kampanyalar",
            "girdi_verileri": {
                "aylik_harcama": 8000,
                "kampanya_tipi": "cashback",
            },
        })
        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_invalid_urun_type_returns_400(self, client, registered_user):
        """
        Tanımsız bir ürün türü gönderilince HTTP 400 dönmeli.
        """
        response = client.post("/api/urunler/analyze", json={
            "tc_no": registered_user["tc_no"],
            "urun_turu": "Olmayan_Urun",
            "girdi_verileri": {"x": 1},
        })
        assert response.status_code == 400


# =============================================================================
# 7) ANALİZ GEÇMİŞİ TESTİ
# =============================================================================

class TestAnalyticsHistory:
    """GET /api/analytics/history/{tc_no} — Analiz geçmişi senaryoları."""

    def test_history_after_analysis(self, client, registered_user):
        """
        Bir kullanıcı analiz yaptıktan sonra, geçmişi o analizi içermelidir.
        Bu test, sonuçların PostgreSQL'e kalıcı olarak yazıldığını kanıtlar.
        """
        # Önce bir analiz yap
        client.post("/api/bireysel/analyze", json={
            "tc_no": registered_user["tc_no"],
            "hizmet_turu": "Kredi_Yonetimi",
            "girdi_verileri": {
                "aylik_gelir": 15000,
                "toplam_borc": 5000,
                "talep_kredi": 50000,
            },
        })

        # Geçmişi sorgula
        response = client.get(f"/api/analytics/history/{registered_user['tc_no']}")
        assert response.status_code == 200
        data = response.json()
        assert "bireysel" in data
        assert "ticari" in data
        assert "urunler" in data
        # En az 1 bireysel analiz kayıtlı olmalı
        assert len(data["bireysel"]) >= 1
        assert data["toplam_analiz"] >= 1


# =============================================================================
# 8) ŞİFRE SIFIRLAMA TESTLERİ
# =============================================================================

class TestPasswordReset:
    """POST /api/forgot-password & /api/reset-password — Şifre sıfırlama akışı."""

    def test_forgot_password_registered_returns_200(self, client, registered_user):
        """Kayıtlı bir e-posta için sıfırlama talebi HTTP 200 dönmeli."""
        response = client.post("/api/forgot-password", json={
            "email": "test.kullanici@kredizeka.com",
        })
        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_forgot_password_unregistered_same_response(self, client):
        """
        Kayıtsız bir e-posta da kayıtlı biriyle AYNI yanıtı almalı.
        Bu, hangi e-postaların kayıtlı olduğunu sızdırmamak (user
        enumeration koruması) için kritik bir güvenlik davranışıdır.
        """
        response = client.post("/api/forgot-password", json={
            "email": "kesinlikle-kayitsiz@ornek.com",
        })
        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_reset_password_invalid_token_returns_400(self, client):
        """Geçersiz bir jeton ile şifre sıfırlama HTTP 400 dönmeli."""
        response = client.post("/api/reset-password", json={
            "token": "bu-gecersiz-bir-jeton-xyz",
            "new_password": "YeniSifre123!",
        })
        assert response.status_code == 400

    def test_reset_password_full_flow(self, client, unique_tc):
        """
        Uçtan uca akış: kayıt → sıfırlama talebi → jetonla yeni şifre →
        eski şifre artık geçersiz, yeni şifre ile giriş başarılı.
        """
        # main.py'nin kullandığı aynı test veritabanı oturumu
        from database import SessionLocal
        from models import PasswordResetToken, User

        email = f"akis.testi.{unique_tc}@kredizeka.com"

        # 1) Kayıt ol
        reg = client.post("/api/register", json={
            "tc_no": unique_tc,
            "full_name": "Akis Testi",
            "email": email,
            "phone": "05551234567",
            "password": "EskiSifre1!",
        })
        assert reg.status_code == 200

        # Giriş yapabilmek için e-postayı doğrulanmış işaretle
        with SessionLocal() as db:
            u = db.query(User).filter(User.tc_no == unique_tc).first()
            u.email_verified = True
            db.commit()

        # 2) Şifre sıfırlama talebinde bulun
        forgot = client.post("/api/forgot-password", json={"email": email})
        assert forgot.status_code == 200

        # 3) Üretilen jetonu veritabanından oku (e-posta simülasyonu yerine)
        db = SessionLocal()
        token_row = db.query(PasswordResetToken).filter(
            PasswordResetToken.tc_no == unique_tc
        ).order_by(PasswordResetToken.id.desc()).first()
        token_value = token_row.token
        db.close()
        assert token_value, "Sıfırlama jetonu oluşturulmuş olmalı"

        # 4) Jeton ile yeni şifre belirle
        reset = client.post("/api/reset-password", json={
            "token": token_value,
            "new_password": "YeniSifre2!",
        })
        assert reset.status_code == 200

        # 5) Eski şifre artık çalışmamalı
        old_login = client.post("/api/login", json={
            "tc_no": unique_tc,
            "password": "EskiSifre1!",
        })
        assert old_login.status_code == 401

        # 6) Yeni şifre ile giriş başarılı olmalı
        new_login = client.post("/api/login", json={
            "tc_no": unique_tc,
            "password": "YeniSifre2!",
        })
        assert new_login.status_code == 200

        # 7) Aynı jeton ikinci kez kullanılamamalı (tek kullanımlık)
        reuse = client.post("/api/reset-password", json={
            "token": token_value,
            "new_password": "BaskaSifre3!",
        })
        assert reuse.status_code == 400


# =============================================================================
# 9) E-POSTA DOĞRULAMA TESTLERİ
# =============================================================================

class TestEmailVerification:
    """E-posta doğrulama akışı: kayıt → doğrulama → giriş."""

    def test_login_unverified_returns_403(self, client, unique_tc):
        """Doğrulanmamış bir hesapla giriş HTTP 403 dönmeli."""
        client.post("/api/register", json={
            "tc_no": unique_tc,
            "full_name": "Dogrulanmamis Kullanici",
            "email": f"dogrulanmamis.{unique_tc}@kredizeka.com",
            "phone": "05551234567",
            "password": "Parola123!",
        })
        # Doğrulama yapılmadan giriş denemesi
        response = client.post("/api/login", json={
            "tc_no": unique_tc,
            "password": "Parola123!",
        })
        assert response.status_code == 403

    def test_verify_email_invalid_token_returns_400(self, client):
        """Geçersiz doğrulama jetonu HTTP 400 dönmeli."""
        response = client.post("/api/verify-email", json={
            "token": "gecersiz-dogrulama-jetonu",
        })
        assert response.status_code == 400

    def test_verify_email_full_flow(self, client, unique_tc):
        """Kayıt → jetonla doğrulama → giriş başarılı olmalı."""
        from database import SessionLocal
        from models import EmailVerificationToken

        client.post("/api/register", json={
            "tc_no": unique_tc,
            "full_name": "Dogrulama Akisi",
            "email": f"dogrulama.{unique_tc}@kredizeka.com",
            "phone": "05551234567",
            "password": "Parola123!",
        })

        # Kayıt sırasında üretilen doğrulama jetonunu DB'den oku
        db = SessionLocal()
        token_row = db.query(EmailVerificationToken).filter(
            EmailVerificationToken.tc_no == unique_tc
        ).order_by(EmailVerificationToken.id.desc()).first()
        token_value = token_row.token
        db.close()

        # Jeton ile e-postayı doğrula
        verify = client.post("/api/verify-email", json={"token": token_value})
        assert verify.status_code == 200

        # Artık giriş yapılabilmeli
        login = client.post("/api/login", json={
            "tc_no": unique_tc,
            "password": "Parola123!",
        })
        assert login.status_code == 200
        assert login.json()["user"]["email_verified"] is True

    def test_change_email_wrong_password_returns_401(self, client, registered_user):
        """Yanlış mevcut şifre ile e-posta değişikliği reddedilmeli."""
        response = client.post("/api/change-email", json={
            "tc_no": registered_user["tc_no"],
            "current_password": "YanlisSifre9!",
            "new_email": "yeni.adres@kredizeka.com",
        })
        assert response.status_code == 401

    def test_change_email_success(self, client, registered_user):
        """Doğru şifre ile e-posta değişikliği başarılı; yeni adres doğrulanmamış olmalı."""
        response = client.post("/api/change-email", json={
            "tc_no": registered_user["tc_no"],
            "current_password": registered_user["password"],
            "new_email": f"degisen.{registered_user['tc_no']}@kredizeka.com",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == f"degisen.{registered_user['tc_no']}@kredizeka.com"
        # Yeni adres yeniden doğrulanmalı
        assert data["user"]["email_verified"] is False
