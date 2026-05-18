"""
KrediZeka - E-posta Servisi (Background Task)
==============================================
FastAPI BackgroundTasks ile asenkron çalışan e-posta simülasyon servisi.

Bu modül, kayıt ve analiz sonrası e-posta gönderimini *kullanıcıyı bekletmeden*
arka planda gerçekleştirir. Şu anda sadece terminale log yazar; gelecekte
SMTP veya transactional e-posta sağlayıcısı (SendGrid, Mailgun vb.) ile
genişletilebilir.

Kullanım:
    from fastapi import BackgroundTasks
    from services.email_service import send_welcome_email

    @app.post("/register")
    async def register(req: ..., background_tasks: BackgroundTasks):
        # ... DB kaydı ...
        background_tasks.add_task(send_welcome_email, user.email, user.full_name)
        return {"success": True}
"""

import logging
import time
from datetime import datetime

# Logger yapılandırması — production'da JSON log driver'a yönlendirilebilir
logger = logging.getLogger("kredizeka.email")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(asctime)s] [%(name)s] %(message)s"))
    logger.addHandler(handler)


def _simulate_smtp_delay():
    """
    Gerçek SMTP gecikmesini taklit eder (50-150ms).
    Background task olduğu için bu gecikme HTTP yanıtını etkilemez.
    """
    time.sleep(0.05)


def send_welcome_email(recipient: str, full_name: str) -> None:
    """
    Yeni kayıt olan kullanıcıya hoş geldin e-postası gönderir.

    Args:
        recipient: Alıcı adresi (şu an: TC No / gelecekte: gerçek e-posta)
        full_name: Kullanıcının tam adı (kişiselleştirme için)
    """
    _simulate_smtp_delay()
    timestamp = datetime.utcnow().isoformat()
    logger.info(
        "📧 [HOŞ GELDİN E-POSTASI] | Alıcı: %s | Ad: %s | Zaman: %s | "
        "Konu: 'KrediZeka'ya Hoş Geldiniz!' | Durum: ✓ Gönderildi (simülasyon)",
        recipient, full_name, timestamp
    )


def send_analysis_report_email(recipient: str, full_name: str, score: int) -> None:
    """
    Risk analizi sonucunu e-posta ile gönderir.

    Args:
        recipient: Alıcı adresi
        full_name: Kullanıcı adı
        score: Hesaplanan kredi skoru (0-100)
    """
    _simulate_smtp_delay()
    timestamp = datetime.utcnow().isoformat()
    risk_label = (
        "Düşük Risk" if score >= 75 else
        "Orta Risk" if score >= 50 else
        "Yüksek Risk" if score >= 25 else
        "Çok Yüksek Risk"
    )
    logger.info(
        "📧 [ANALİZ RAPORU] | Alıcı: %s | Ad: %s | Skor: %d/100 (%s) | "
        "Zaman: %s | Durum: ✓ Gönderildi (simülasyon)",
        recipient, full_name, score, risk_label, timestamp
    )


def send_login_notification(recipient: str, full_name: str, ip: str = "unknown") -> None:
    """
    Yeni cihazdan/IP'den giriş yapıldığında bildirim e-postası.

    Args:
        recipient: Alıcı adresi
        full_name: Kullanıcı adı
        ip: Giriş yapan IP adresi
    """
    _simulate_smtp_delay()
    timestamp = datetime.utcnow().isoformat()
    logger.info(
        "📧 [GİRİŞ BİLDİRİMİ] | Alıcı: %s | Ad: %s | IP: %s | Zaman: %s | "
        "Konu: 'Hesabınıza giriş yapıldı' | Durum: ✓ Gönderildi (simülasyon)",
        recipient, full_name, ip, timestamp
    )
