"""
KrediZeka - ORM Model Tanımları (SQLAlchemy)
=============================================
PostgreSQL'de fiziksel tabloya karşılık gelen Python sınıfları.

Tablolar:
  - users               → Platform kullanıcıları (normal + admin)
  - bireysel_analytics  → Bireysel hizmet analiz geçmişi
  - ticari_analytics    → Ticari hizmet analiz geçmişi
  - urunler_analytics   → Ürün/sigorta analiz geçmişi

JSONB Notu:
  girdi_verileri sütunları PostgreSQL'de gerçek JSONB tipinde tutulur
  (indekslenebilir, sorgulanabilir). SQLite fallback'inde generic JSON'a
  düşer — .with_variant() ile bu cross-uyumluluk sağlanır.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, JSON
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base


# JSONB tipi: PostgreSQL'de JSONB, SQLite'da generic JSON
# Bu sayede aynı model her iki veritabanında da çalışır
JSONBType = JSONB().with_variant(JSON(), "sqlite")


class User(Base):
    """
    'users' tablosu — Platform kullanıcıları (normal + admin).

    Sütunlar:
      - id              : Otomatik artan PK
      - tc_no           : Türkiye Cumhuriyeti Kimlik No (unique, 11 hane)
      - full_name       : Ad Soyad
      - phone           : Cep telefonu (11 hane)
      - password_hash   : Bcrypt ile hash'lenmiş parola
      - occupation      : Meslek (opsiyonel)
      - address         : Adres (opsiyonel)
      - profile_picture : Base64 kodlu görsel (data:image/...)
      - is_admin        : RBAC: True ise yönetici
      - created_at      : Kayıt tarihi (UTC)

    İlişkiler:
      - bireysel_analytics : 1-N (bir kullanıcının birden çok bireysel analizi)
      - ticari_analytics   : 1-N
      - urunler_analytics  : 1-N
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tc_no = Column(String(11), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(11), nullable=False)
    password_hash = Column(String(255), nullable=False)
    occupation = Column(String(200), default="", nullable=False)
    address = Column(String(500), default="", nullable=False)
    # Profil fotoğrafı Base64 string olduğundan TEXT türü (sınırsız uzunluk)
    profile_picture = Column(Text, default="", nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ─── İlişkiler (cascade: kullanıcı silinince analizleri de silinir) ──
    bireysel_kayitlar = relationship(
        "BireyselAnalytics",
        back_populates="kullanici",
        cascade="all, delete-orphan",
    )
    ticari_kayitlar = relationship(
        "TicariAnalytics",
        back_populates="kullanici",
        cascade="all, delete-orphan",
    )
    urun_kayitlar = relationship(
        "UrunlerAnalytics",
        back_populates="kullanici",
        cascade="all, delete-orphan",
    )

    def to_dict(self, include_picture: bool = True) -> dict:
        """API yanıtına çevirir (parola hash'i hariç tutulur)."""
        data = {
            "tc_no": self.tc_no,
            "full_name": self.full_name,
            "phone": self.phone,
            "occupation": self.occupation or "",
            "address": self.address or "",
            "is_admin": bool(self.is_admin),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_picture:
            data["profile_picture"] = self.profile_picture or ""
        return data


class BireyselAnalytics(Base):
    """
    'bireysel_analytics' tablosu — Bireysel hizmet analiz geçmişi.

    Bireysel sekmesindeki kartların (Kredi Yönetimi, Birikim, Kredi Kartı,
    Yatırım, Sigorta) her çalıştırılışında bir satır kaydedilir.

    Sütunlar:
      - id                   : Otomatik artan PK
      - tc_no                : users.tc_no'ya Foreign Key
      - hizmet_turu          : Kredi_Yonetimi | Birikim | Kredi_Karti | Yatirim | Sigorta
      - girdi_verileri       : Kullanıcının doldurduğu form verileri (JSONB)
      - hesaplanan_skor      : Simülasyon motorunun ürettiği skor (0-100)
      - yapay_zeka_tavsiyesi : Kurumsal Türkçe AI tavsiye metni
      - created_at           : Kayıt tarihi (UTC)
    """

    __tablename__ = "bireysel_analytics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tc_no = Column(String(11), ForeignKey("users.tc_no", ondelete="CASCADE"),
                   nullable=False, index=True)
    hizmet_turu = Column(String(50), nullable=False, index=True)
    girdi_verileri = Column(JSONBType, nullable=False)
    hesaplanan_skor = Column(Float, nullable=False, default=0.0)
    yapay_zeka_tavsiyesi = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # users tablosuyla ilişki
    kullanici = relationship("User", back_populates="bireysel_kayitlar")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "tc_no": self.tc_no,
            "hizmet_turu": self.hizmet_turu,
            "girdi_verileri": self.girdi_verileri,
            "hesaplanan_skor": self.hesaplanan_skor,
            "yapay_zeka_tavsiyesi": self.yapay_zeka_tavsiyesi,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class TicariAnalytics(Base):
    """
    'ticari_analytics' tablosu — Ticari hizmet analiz geçmişi.

    Ticari sekmesindeki kartların (Ticari Kredi, POS & Tahsilat, Maaş & Bordro,
    Dış Ticaret) her çalıştırılışında bir satır kaydedilir.

    Sütunlar:
      - id                   : Otomatik artan PK
      - tc_no                : users.tc_no'ya Foreign Key
      - hizmet_turu          : Ticari_Kredi | POS_Tahsilat | Maas_Bordro | Dis_Ticaret
      - girdi_verileri       : Şirket form verileri (JSONB)
      - sirket_saglik_skoru  : XGBoost tabanlı kurgusal Şirket Sağlık Skoru (0-100)
      - yapay_zeka_tavsiyesi : Kurumsal Türkçe AI tavsiye metni
      - created_at           : Kayıt tarihi (UTC)
    """

    __tablename__ = "ticari_analytics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tc_no = Column(String(11), ForeignKey("users.tc_no", ondelete="CASCADE"),
                   nullable=False, index=True)
    hizmet_turu = Column(String(50), nullable=False, index=True)
    girdi_verileri = Column(JSONBType, nullable=False)
    sirket_saglik_skoru = Column(Float, nullable=False, default=0.0)
    yapay_zeka_tavsiyesi = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    kullanici = relationship("User", back_populates="ticari_kayitlar")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "tc_no": self.tc_no,
            "hizmet_turu": self.hizmet_turu,
            "girdi_verileri": self.girdi_verileri,
            "sirket_saglik_skoru": self.sirket_saglik_skoru,
            "yapay_zeka_tavsiyesi": self.yapay_zeka_tavsiyesi,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class UrunlerAnalytics(Base):
    """
    'urunler_analytics' tablosu — Ürün/sigorta analiz geçmişi.

    Ürünler sekmesindeki kartların (Mevduat Hesabı, Sigorta Ürünleri,
    Kampanyalar) her çalıştırılışında bir satır kaydedilir.

    Sütunlar:
      - id                          : Otomatik artan PK
      - tc_no                       : users.tc_no'ya Foreign Key
      - urun_turu                   : Mevduat_Hesabi | Sigorta_Urunleri | Kampanyalar
      - girdi_verileri              : Ürün form verileri (JSONB)
      - tahmin_edilen_getiri_veya_prim : Linear Regression tabanlı kurgusal getiri/prim
      - yapay_zeka_tavsiyesi        : Kurumsal Türkçe AI tavsiye metni
      - created_at                  : Kayıt tarihi (UTC)
    """

    __tablename__ = "urunler_analytics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tc_no = Column(String(11), ForeignKey("users.tc_no", ondelete="CASCADE"),
                   nullable=False, index=True)
    urun_turu = Column(String(50), nullable=False, index=True)
    girdi_verileri = Column(JSONBType, nullable=False)
    tahmin_edilen_getiri_veya_prim = Column(Float, nullable=False, default=0.0)
    yapay_zeka_tavsiyesi = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    kullanici = relationship("User", back_populates="urun_kayitlar")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "tc_no": self.tc_no,
            "urun_turu": self.urun_turu,
            "girdi_verileri": self.girdi_verileri,
            "tahmin_edilen_getiri_veya_prim": self.tahmin_edilen_getiri_veya_prim,
            "yapay_zeka_tavsiyesi": self.yapay_zeka_tavsiyesi,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
