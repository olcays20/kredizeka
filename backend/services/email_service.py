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

import httpx

from config import settings

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


# =============================================================================
# GERÇEK E-POSTA GÖNDERİMİ — BREVO (Transactional Email API)
# =============================================================================
# Yukarıdaki fonksiyonlar yalnızca log yazar (simülasyon). Aşağıdaki bölüm,
# şifre sıfırlama gibi KRİTİK e-postaları Brevo servisi üzerinden GERÇEKTEN
# gönderir. Brevo, HTTPS (443 portu) üzerinden çalıştığı için Render gibi
# SMTP portlarını kısıtlayan platformlarda da sorunsuz iletim sağlar.


def _send_via_brevo(to_email: str, to_name: str, subject: str,
                    html_content: str) -> bool:
    """
    Brevo Transactional Email API'si ile gerçek bir e-posta gönderir.

    API uç noktası: POST https://api.brevo.com/v3/smtp/email

    Args:
        to_email     : Alıcının e-posta adresi
        to_name      : Alıcının adı (kişiselleştirme)
        subject      : E-posta konusu
        html_content : E-postanın HTML gövdesi

    Returns:
        bool: Gönderim başarılıysa True.

    Raises:
        Exception: Ağ hatası veya API hatası durumunda (çağıran taraf yakalar).
    """
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": settings.brevo_api_key,
        "Content-Type": "application/json",
        "accept": "application/json",
    }
    payload = {
        # Gönderen: Brevo panelinde doğrulanmış adres olmalıdır
        "sender": {
            "name": settings.brevo_sender_name,
            "email": settings.brevo_sender_email,
        },
        "to": [{"email": to_email, "name": to_name}],
        "subject": subject,
        "htmlContent": html_content,
    }
    # 15 sn zaman aşımı — Brevo yanıt vermezse sonsuza dek beklemeyiz
    response = httpx.post(url, json=payload, headers=headers, timeout=15.0)
    # 2xx dışı bir durum kodu gelirse istisna fırlatılır
    response.raise_for_status()
    return True


def _password_reset_html(full_name: str, reset_link: str) -> str:
    """
    Şifre sıfırlama e-postasının HTML gövdesini üretir.

    Kurumsal görünümlü, butonlu ve mobil uyumlu basit bir şablon döndürür.
    """
    return f"""\
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;
             font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Başlık -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);
                       padding:28px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">KrediZeka</h1>
          <p style="margin:4px 0 0;color:#e0e7ff;font-size:13px;">
            Finansal Risk Asistanı</p>
        </td></tr>
        <!-- İçerik -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">
            Şifre Sıfırlama Talebi</h2>
          <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
            Merhaba <strong>{full_name}</strong>,</p>
          <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
            Hesabınız için bir şifre sıfırlama talebi aldık. Yeni şifrenizi
            belirlemek için aşağıdaki butona tıklayın. Bu bağlantı
            <strong>1 saat</strong> boyunca geçerlidir.</p>
          <!-- Buton -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="border-radius:10px;
                           background:linear-gradient(135deg,#4f46e5,#7c3aed);">
              <a href="{reset_link}"
                 style="display:inline-block;padding:14px 32px;color:#ffffff;
                        font-size:15px;font-weight:bold;text-decoration:none;">
                Şifremi Sıfırla</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;line-height:1.6;">
            Buton çalışmazsa bu bağlantıyı tarayıcınıza yapıştırın:</p>
          <p style="margin:0 0 24px;color:#4f46e5;font-size:12px;
                    word-break:break-all;">{reset_link}</p>
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
            Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz;
            şifreniz değişmeden kalır.</p>
        </td></tr>
        <!-- Alt bilgi -->
        <tr><td style="background:#f8fafc;padding:20px 32px;
                       border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">
            © KrediZeka — Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def send_password_reset_email(to_email: str, full_name: str,
                              reset_link: str) -> None:
    """
    Kullanıcıya şifre sıfırlama e-postasını gönderir.

    Davranış:
      • Brevo yapılandırılmışsa (api_key + sender_email tanımlı) e-posta
        GERÇEKTEN gönderilir.
      • Yapılandırılmamışsa veya Brevo hata verirse, akış bozulmaz: sıfırlama
        linki sunucu log'una yazılır (simülasyon yedeği). Böylece geliştirme
        ortamında da özellik test edilebilir.

    Bu fonksiyon FastAPI BackgroundTasks ile çağrılır — kullanıcı bekletilmez.

    Args:
        to_email   : Alıcının e-posta adresi
        full_name  : Kullanıcının tam adı
        reset_link : Şifre sıfırlama sayfasının tam URL'i (token dahil)
    """
    subject = "KrediZeka — Şifre Sıfırlama Talebi"
    html = _password_reset_html(full_name, reset_link)

    # Brevo yapılandırılmışsa gerçek gönderimi dene
    if settings.brevo_api_key and settings.brevo_sender_email:
        try:
            _send_via_brevo(to_email, full_name, subject, html)
            logger.info(
                "📧 [ŞİFRE SIFIRLAMA] | Alıcı: %s | Ad: %s | "
                "Durum: ✓ Brevo ile GÖNDERİLDİ",
                to_email, full_name
            )
            return
        except Exception as e:
            # Brevo başarısız → akışı kesme, simülasyon yedeğine düş
            logger.error(
                "❌ [ŞİFRE SIFIRLAMA] Brevo gönderimi başarısız (%s: %s). "
                "Simülasyon yedeğine geçiliyor.",
                type(e).__name__, e
            )

    # Simülasyon yedeği: sıfırlama linkini log'a yaz (geliştirme/test için)
    logger.info(
        "📧 [ŞİFRE SIFIRLAMA — SİMÜLASYON] | Alıcı: %s | Ad: %s | "
        "SIFIRLAMA LİNKİ: %s",
        to_email, full_name, reset_link
    )
