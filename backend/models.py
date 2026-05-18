"""
KrediZeka - ORM Model Tanımları (SQLAlchemy)
=============================================
PostgreSQL'de fiziksel tabloya karşılık gelen Python sınıfları.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from database import Base


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
