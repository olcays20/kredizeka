"""
KrediZeka - Finansal Simülasyon ve ML Motorları
==================================================
Bireysel, Ticari ve Ürün hizmetleri için kurgusal (mock) finansal
simülasyon ve makine öğrenmesi tabanlı tahmin motorları.

⚠️ AKADEMİK PROJE NOTU:
Bu motorlar gerçek banka API'leri veya resmi kurum verileri KULLANMAZ.
Tamamen eğitim ve portföy amaçlı, deterministik ve şeffaf finansal
formüllere dayanan simülasyonlardır. Üretilen skorlar gerçek bir
kredi/sigorta kararı niteliği taşımaz.

Mimari:
  - compute_bireysel_analysis() → hizmet_turu'ne göre 5 farklı senaryo
  - compute_ticari_analysis()   → XGBoost mantığıyla şirket sağlık skoru
  - compute_urun_analysis()     → Linear Regression mantığıyla prim/getiri
"""

import math
from typing import Dict, Any


# =============================================================================
# YARDIMCI FONKSİYONLAR
# =============================================================================

def _clamp(value: float, low: float, high: float) -> float:
    """Bir değeri [low, high] aralığına sıkıştırır."""
    return max(low, min(high, value))


def _sigmoid(x: float) -> float:
    """Lojistik (sigmoid) fonksiyon — skoru 0-1 aralığına dönüştürür."""
    try:
        return 1.0 / (1.0 + math.exp(-x))
    except OverflowError:
        return 0.0 if x < 0 else 1.0


def _safe_float(value: Any, default: float = 0.0) -> float:
    """Girdiyi güvenli biçimde float'a çevirir."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _risk_status_from_score(score: float) -> tuple[str, str]:
    """0-100 skoruna göre risk durumu ve renk kodu döndürür."""
    if score >= 75:
        return "Düşük Risk", "green"
    if score >= 50:
        return "Orta Risk", "yellow"
    if score >= 25:
        return "Yüksek Risk", "orange"
    return "Çok Yüksek Risk", "red"


def _format_currency(amount: float) -> str:
    """Tutarı Türk Lirası biçiminde okunabilir string'e çevirir."""
    return f"{amount:,.0f}₺".replace(",", ".")


# =============================================================================
# BİREYSEL HİZMET MOTORLARI
# =============================================================================

def _engine_kredi_yonetimi(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Kredi Yönetimi simülasyonu — Borç/Gelir analizi.

    Girdi: aylik_gelir, toplam_borc, talep_kredi
    Çıktı: 0-100 onay skoru + DTI/LTI oranları + tavsiye
    """
    income = _safe_float(data.get("aylik_gelir"))
    debt = _safe_float(data.get("toplam_borc"))
    loan = _safe_float(data.get("talep_kredi"))

    dti = (debt / income * 100) if income > 0 else 999.0   # Borç/Gelir %
    lti = (loan / income) if income > 0 else 999.0          # Kredi/Gelir ×

    # Skor: düşük DTI ve LTI yüksek skor üretir
    raw = 5.0 - (dti / 100) * 4.0 - _clamp(lti / 12, 0, 1) * 3.5
    score = round(_sigmoid(raw) * 100, 1)
    status, color = _risk_status_from_score(score)

    advice = (
        f"📊 Borç/Gelir (DTI) oranınız %{dti:.1f}, Kredi/Gelir (LTI) oranınız "
        f"{lti:.1f}× olarak hesaplandı. Bankacılık sektöründe DTI oranının "
        f"%40'ın altında olması ideal kabul edilir.\n\n"
    )
    if dti > 50:
        advice += (
            "🔴 Borç yükünüz kritik seviyede. Yeni bir kredi başvurusundan önce "
            "mevcut borçlarınızı yapılandırmanız veya bir kısmını kapatmanız "
            "önerilir. Yüksek faizli borçları önceliklendirin.\n\n"
        )
    elif dti > 35:
        advice += (
            "🟡 Borç oranınız kabul edilebilir ancak iyileştirilebilir düzeyde. "
            "DTI oranınızı %35'in altına çekerseniz daha uygun faiz oranlarına "
            "erişebilirsiniz.\n\n"
        )
    else:
        advice += (
            "🟢 Borç/Gelir dengeniz sağlıklı. Bu profil, kredi kuruluşları "
            "tarafından olumlu değerlendirilir.\n\n"
        )
    advice += (
        "💡 Finansal Okuryazarlık: Aylık gelirinizin en fazla üçte birini borç "
        "ödemelerine ayırmanız, beklenmedik harcamalara karşı bir tampon "
        "oluşturmanızı sağlar."
    )

    return {
        "score": score,
        "risk_status": status,
        "risk_color": color,
        "metrics": {
            "dti": round(dti, 1),
            "lti": round(lti, 2),
        },
        "chart_data": [
            {"name": "Aylık Gelir", "value": round(income, 2)},
            {"name": "Mevcut Borç", "value": round(debt, 2)},
            {"name": "Talep Edilen Kredi", "value": round(loan, 2)},
        ],
        "ai_advice": advice,
    }


def _engine_birikim(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Birikim Hesabı simülasyonu — Vade ve tutara göre bileşik getiri.

    Girdi: anapara, vade_ay, aylik_ekleme
    Çıktı: tahmini toplam getiri (prediction) + bileşik faiz projeksiyonu

    Not: Birikim bir "getiri tahmini"dir, risk skoru değildir. Bu yüzden
    çıktı 'tahmin' / 'tahmin_label' biçimindedir (resultKind: prediction).
    """
    principal = _safe_float(data.get("anapara"))
    months = int(_safe_float(data.get("vade_ay"), 12))
    monthly_add = _safe_float(data.get("aylik_ekleme"))

    # Kurgusal yıllık faiz: vade uzadıkça hafif artar (sadakat primi)
    annual_rate = 0.30 + min(months / 60, 1) * 0.10   # %30 - %40
    monthly_rate = annual_rate / 12

    # Bileşik faiz + her ay düzenli ekleme (annuity) projeksiyonu
    balance = principal
    projection = []
    for m in range(1, months + 1):
        balance = balance * (1 + monthly_rate) + monthly_add
        if m % max(1, months // 6) == 0 or m == months:
            projection.append({"name": f"{m}. Ay", "value": round(balance, 2)})

    total_deposited = principal + monthly_add * months
    total_return = balance - total_deposited
    return_pct = (total_return / total_deposited * 100) if total_deposited > 0 else 0

    advice = (
        f"💰 {months} ay vade sonunda toplam birikiminizin yaklaşık "
        f"{_format_currency(balance)} seviyesine ulaşması öngörülmektedir.\n\n"
        f"📈 Yatırdığınız toplam {_format_currency(total_deposited)} anaparaya "
        f"karşılık tahmini {_format_currency(total_return)} net getiri "
        f"(%{return_pct:.1f}) elde edebilirsiniz. Hesaplama, kurgusal yıllık "
        f"%{annual_rate * 100:.1f} bileşik faiz oranı üzerinden yapılmıştır.\n\n"
    )
    if monthly_add > 0:
        advice += (
            f"✅ Her ay düzenli olarak {_format_currency(monthly_add)} ekleme "
            f"yapmanız, bileşik faizin gücünden maksimum düzeyde yararlanmanızı "
            f"sağlar. Düzenli birikim, finansal disiplinin en güçlü aracıdır.\n\n"
        )
    advice += (
        "💡 Finansal Okuryazarlık: Bileşik faiz, kazancınızın da kazanç "
        "üretmesidir. Vadeyi uzattıkça getiri üstel olarak büyür — bu yüzden "
        "erken başlamak en değerli yatırım stratejisidir."
    )

    return {
        "tahmin": round(total_return, 2),
        "tahmin_label": "Tahmini Net Getiri",
        "metrics": {
            "tahmini_bakiye": round(balance, 2),
            "net_getiri": round(total_return, 2),
            "getiri_yuzdesi": round(return_pct, 1),
            "yillik_faiz": round(annual_rate * 100, 1),
        },
        "chart_data": projection,
        "ai_advice": advice,
    }


def _engine_kredi_karti(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Kredi Kartı simülasyonu — Uygun limit önerisi.

    Girdi: aylik_gelir, mevcut_kart_borcu, aylik_harcama
    Çıktı: önerilen kart limiti + uygunluk skoru
    """
    income = _safe_float(data.get("aylik_gelir"))
    card_debt = _safe_float(data.get("mevcut_kart_borcu"))
    spending = _safe_float(data.get("aylik_harcama"))

    # Önerilen limit: gelirin 2-4 katı, mevcut borç ile ters orantılı
    debt_ratio = (card_debt / income) if income > 0 else 5.0
    limit_multiplier = _clamp(4.0 - debt_ratio * 2.5, 0.5, 4.0)
    recommended_limit = round(income * limit_multiplier, -2)

    # Uygunluk skoru
    raw = 4.0 - debt_ratio * 3.0 - _clamp(spending / income, 0, 1.5) * 1.5
    score = round(_sigmoid(raw) * 100, 1)
    status, color = _risk_status_from_score(score)

    advice = (
        f"💳 Finansal profilinize göre önerilen kredi kartı limiti yaklaşık "
        f"{_format_currency(recommended_limit)} olarak hesaplanmıştır.\n\n"
        f"📊 Aylık {_format_currency(spending)} harcamanız, gelirinizin "
        f"%{(spending / income * 100) if income > 0 else 0:.0f}'ini "
        f"oluşturuyor.\n\n"
    )
    if debt_ratio > 1.5:
        advice += (
            "🔴 Mevcut kart borcunuz gelirinize göre yüksek. Yeni limit talep "
            "etmeden önce mevcut borcun asgari tutarın üzerinde ödemesini "
            "yapmanız kredi notunuzu korur.\n\n"
        )
    else:
        advice += (
            "🟢 Kart kullanım profiliniz dengeli görünüyor. Limitinizi "
            "harcamalarınızın %30'unun altında kullanmak, kredi notu için "
            "idealdir.\n\n"
        )
    advice += (
        "💡 Finansal Okuryazarlık: Kredi kartı asgari ödeme tuzağına dikkat "
        "edin. Her ay yalnızca asgari tutarı ödemek, borcun faizle katlanarak "
        "büyümesine neden olur. Mümkünse her dönem borcun tamamını kapatın."
    )

    return {
        "score": score,
        "risk_status": status,
        "risk_color": color,
        "metrics": {
            "onerilen_limit": recommended_limit,
            "borc_orani": round(debt_ratio * 100, 1),
        },
        "chart_data": [
            {"name": "Aylık Gelir", "value": round(income, 2)},
            {"name": "Aylık Harcama", "value": round(spending, 2)},
            {"name": "Mevcut Kart Borcu", "value": round(card_debt, 2)},
            {"name": "Önerilen Limit", "value": recommended_limit},
        ],
        "ai_advice": advice,
    }


def _engine_yatirim(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Yatırım Araçları simülasyonu — Risk profiline göre portföy getirisi.

    Girdi: yatirim_tutari, risk_tercihi (dusuk/orta/yuksek), vade_yil
    Çıktı: tahmini portföy değeri (prediction) + yıllık büyüme projeksiyonu

    Not: Yatırım bir "getiri tahmini"dir. Risk tercihi kullanıcının kendi
    seçimidir; bu yüzden çıktı 'tahmin' biçimindedir (resultKind: prediction).
    """
    amount = _safe_float(data.get("yatirim_tutari"))
    risk_pref = str(data.get("risk_tercihi", "orta")).lower()
    years = int(_safe_float(data.get("vade_yil"), 3))

    # Risk profiline göre kurgusal yıllık beklenen getiri (makul aralık)
    risk_profiles = {
        "dusuk":  {"getiri": 0.15, "label": "Düşük Risk / Korumacı"},
        "orta":   {"getiri": 0.24, "label": "Orta Risk / Dengeli"},
        "yuksek": {"getiri": 0.34, "label": "Yüksek Risk / Agresif"},
    }
    profile = risk_profiles.get(risk_pref, risk_profiles["orta"])
    annual_return = profile["getiri"]

    # Yıllık bileşik büyüme projeksiyonu
    projection = []
    balance = amount
    for y in range(1, years + 1):
        balance = balance * (1 + annual_return)
        projection.append({"name": f"{y}. Yıl", "value": round(balance, 2)})

    total_return = balance - amount
    return_pct = (total_return / amount * 100) if amount > 0 else 0

    advice = (
        f"📈 {profile['label']} profilinde, {_format_currency(amount)} "
        f"tutarındaki yatırımınızın {years} yıl sonunda yaklaşık "
        f"{_format_currency(balance)} değerine ulaşması öngörülmektedir "
        f"(kurgusal yıllık %{annual_return * 100:.0f} getiri varsayımıyla).\n\n"
        f"💵 Tahmini net getiri: {_format_currency(total_return)} "
        f"(%{return_pct:.0f}).\n\n"
    )
    if risk_pref == "yuksek":
        advice += (
            "⚠️ Yüksek risk profili, yüksek getiri potansiyeli sunarken "
            "değer kaybı riskini de artırır. Portföyünüzün tamamını tek bir "
            "varlık sınıfına bağlamayın.\n\n"
        )
    elif risk_pref == "dusuk":
        advice += (
            "🛡️ Korumacı profil, sermayenizi enflasyona karşı korumayı "
            "önceler. Getiri mütevazıdır ancak öngörülebilirdir.\n\n"
        )
    else:
        advice += (
            "⚖️ Dengeli profil, risk ve getiri arasında makul bir denge kurar; "
            "uzun vadeli birikim için en sık tercih edilen stratejidir.\n\n"
        )
    advice += (
        "💡 Finansal Okuryazarlık: Çeşitlendirme (diversifikasyon), yatırımın "
        "altın kuralıdır. 'Tüm yumurtaları aynı sepete koymayın' — farklı "
        "varlık sınıflarına dağılmak, riski azaltırken getiriyi dengeler."
    )

    return {
        "tahmin": round(balance, 2),
        "tahmin_label": "Tahmini Portföy Değeri",
        "metrics": {
            "tahmini_deger": round(balance, 2),
            "net_getiri": round(total_return, 2),
            "getiri_yuzdesi": round(return_pct, 1),
            "yillik_getiri": round(annual_return * 100, 1),
        },
        "chart_data": projection,
        "ai_advice": advice,
    }


def _engine_bireysel_sigorta(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Bireysel Sigorta simülasyonu — Yaşa ve teminata göre prim tahmini.

    Girdi: yas, teminat_tutari, sigorta_tipi (hayat/saglik/kasko)
    Çıktı: tahmini aylık prim (prediction)

    Not: Sigorta priminde "risk skoru" kavramı yoktur — bu bir prim
    tahminidir. Çıktı 'tahmin' biçimindedir (resultKind: prediction).
    """
    age = int(_safe_float(data.get("yas"), 35))
    coverage = _safe_float(data.get("teminat_tutari"))
    insurance_type = str(data.get("sigorta_tipi", "saglik")).lower()

    # Linear Regression mantığı: prim = taban + katsayılar × özellikler
    type_base = {"hayat": 180.0, "saglik": 320.0, "kasko": 450.0}
    base = type_base.get(insurance_type, 320.0)

    # Yaş katsayısı (yaş arttıkça prim artar) + teminat katsayısı
    age_coef = max(0, age - 25) * 4.5
    coverage_coef = (coverage / 100_000) * 35.0
    monthly_premium = round(base + age_coef + coverage_coef, 2)

    type_label = {"hayat": "Hayat", "saglik": "Sağlık", "kasko": "Kasko"}.get(
        insurance_type, "Sağlık"
    )

    advice = (
        f"🛡️ {type_label} Sigortası için {_format_currency(coverage)} teminat "
        f"tutarında, tahmini aylık priminiz {_format_currency(monthly_premium)} "
        f"olarak hesaplanmıştır (yıllık ≈ {_format_currency(monthly_premium * 12)}).\n\n"
        f"📊 Hesaplama; {age} yaşınız, teminat tutarınız ve sigorta türünüz "
        f"baz alınarak doğrusal (linear) bir prim modeliyle yapılmıştır.\n\n"
    )
    if age > 50:
        advice += (
            "🟡 İleri yaş, prim tutarını artıran en önemli faktördür. Sigortaya "
            "ne kadar erken başlarsanız, prim maliyetiniz o kadar düşük olur.\n\n"
        )
    advice += (
        "💡 Finansal Okuryazarlık: Sigorta bir gider değil, bir risk transfer "
        "aracıdır. Beklenmedik bir olayın yaratacağı büyük finansal yükü, "
        "öngörülebilir küçük aylık ödemelere dönüştürür."
    )

    return {
        "tahmin": monthly_premium,
        "tahmin_label": "Tahmini Aylık Prim",
        "metrics": {
            "aylik_prim": monthly_premium,
            "yillik_prim": round(monthly_premium * 12, 2),
            "teminat_tutari": round(coverage, 2),
        },
        "chart_data": [
            {"name": "Aylık Prim", "value": monthly_premium},
            {"name": "Yıllık Prim", "value": round(monthly_premium * 12, 2)},
            {"name": "Teminat Tutarı", "value": round(coverage, 2)},
        ],
        "ai_advice": advice,
    }


# Bireysel hizmet türü → motor eşlemesi
_BIREYSEL_ENGINES = {
    "Kredi_Yonetimi": _engine_kredi_yonetimi,
    "Birikim": _engine_birikim,
    "Kredi_Karti": _engine_kredi_karti,
    "Yatirim": _engine_yatirim,
    "Sigorta": _engine_bireysel_sigorta,
}


def compute_bireysel_analysis(hizmet_turu: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Bireysel hizmet analizini hizmet türüne göre ilgili motora yönlendirir.

    Args:
        hizmet_turu: Kredi_Yonetimi | Birikim | Kredi_Karti | Yatirim | Sigorta
        data: Kullanıcının form verileri (dict)

    Returns:
        { score, risk_status, risk_color, metrics, chart_data, ai_advice }

    Raises:
        ValueError: Geçersiz hizmet türü için
    """
    engine = _BIREYSEL_ENGINES.get(hizmet_turu)
    if engine is None:
        raise ValueError(
            f"Geçersiz bireysel hizmet türü: '{hizmet_turu}'. "
            f"Geçerli türler: {', '.join(_BIREYSEL_ENGINES.keys())}"
        )
    return engine(data)


# =============================================================================
# TİCARİ HİZMET MOTORU (XGBoost mantığıyla şirket sağlık skoru)
# =============================================================================

def compute_ticari_analysis(hizmet_turu: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ticari hizmet analizi — Kurgusal "Şirket Finansal Sağlık Skoru".

    XGBoost gradient boosting mantığını taklit eden ağırlıklı bir karar
    fonksiyonu kullanır: her finansal özellik bir "zayıf öğrenici" gibi
    skora katkı verir, toplam katkı sigmoid ile 0-100'e dönüştürülür.

    Args:
        hizmet_turu: Ticari_Kredi | POS_Tahsilat | Maas_Bordro | Dis_Ticaret
        data: Şirket form verileri — yillik_ciro, calisan_sayisi,
              aylik_pos_hacmi, sirket_yasi, mevcut_borc

    Returns:
        { sirket_saglik_skoru, risk_status, risk_color, metrics,
          chart_data, ai_advice }
    """
    ciro = _safe_float(data.get("yillik_ciro"))
    calisan = int(_safe_float(data.get("calisan_sayisi"), 1))
    pos_hacmi = _safe_float(data.get("aylik_pos_hacmi"))
    sirket_yasi = int(_safe_float(data.get("sirket_yasi"), 1))
    mevcut_borc = _safe_float(data.get("mevcut_borc"))

    # ─── "Gradient Boosting" tarzı ağırlıklı zayıf öğreniciler ──────────
    # Her bileşen, XGBoost'taki bir karar ağacı gibi skora katkı sağlar.

    # 1) Çalışan başına ciro verimliliği (yüksek = sağlıklı)
    ciro_per_calisan = (ciro / calisan) if calisan > 0 else 0
    learner_1 = _clamp(math.log10(ciro_per_calisan + 1) / 6, 0, 1) * 2.5

    # 2) POS hacminin ciroya oranı (nakit akışı göstergesi)
    pos_orani = (pos_hacmi * 12 / ciro) if ciro > 0 else 0
    learner_2 = _clamp(pos_orani, 0, 1) * 1.8

    # 3) Şirket yaşı (köklülük / hayatta kalma primi)
    learner_3 = _clamp(sirket_yasi / 15, 0, 1) * 2.0

    # 4) Borç/Ciro oranı (negatif öğrenici — borç arttıkça skor düşer)
    borc_orani = (mevcut_borc / ciro) if ciro > 0 else 2.0
    learner_4 = -_clamp(borc_orani, 0, 1.5) * 3.2

    # 5) Ölçek primi (çalışan sayısı kurumsallaşma göstergesi)
    learner_5 = _clamp(math.log10(calisan + 1) / 3, 0, 1) * 1.4

    # Toplam katkı (bias dahil) → sigmoid → 0-100
    total = -1.0 + learner_1 + learner_2 + learner_3 + learner_4 + learner_5
    saglik_skoru = round(_sigmoid(total) * 100, 1)
    status, color = _risk_status_from_score(saglik_skoru)

    # ─── Hizmet türüne özel ek yorum ───────────────────────────────────
    hizmet_yorumlari = {
        "Ticari_Kredi": (
            "Bu skor, ticari kredi başvurunuzun ön değerlendirmesinde "
            "belirleyici olur. 70 üzeri skorlar avantajlı faiz oranlarına "
            "erişim sağlar."
        ),
        "POS_Tahsilat": (
            "POS tahsilat hacminiz, nakit akışınızın sağlığını gösterir. "
            "Düzenli ve yüksek POS cirosu, komisyon oranlarınızı düşürür."
        ),
        "Maas_Bordro": (
            "Çalışan sayınız ve ciro dengeniz, maaş ödeme kapasitenizin "
            "sürdürülebilirliğini belirler. Toplu maaş anlaşmaları ek "
            "avantajlar sunar."
        ),
        "Dis_Ticaret": (
            "Dış ticaret işlemlerinde şirket sağlık skoru, akreditif ve "
            "teminat mektubu limitlerinizi doğrudan etkiler."
        ),
    }
    hizmet_yorum = hizmet_yorumlari.get(
        hizmet_turu,
        "Şirket sağlık skoru, tüm ticari bankacılık ürünlerinde belirleyicidir."
    )

    advice = (
        f"🏢 Şirketinizin Finansal Sağlık Skoru: {saglik_skoru}/100 "
        f"({status}).\n\n"
        f"📊 Skor; çalışan başına ciro verimliliği ({_format_currency(ciro_per_calisan)}), "
        f"POS hacmi/ciro oranı (%{pos_orani * 100:.0f}), {sirket_yasi} yıllık "
        f"şirket geçmişi ve borç/ciro dengesi (%{borc_orani * 100:.0f}) "
        f"faktörlerinin XGBoost mantığıyla ağırlıklandırılmasıyla "
        f"hesaplanmıştır.\n\n{hizmet_yorum}\n\n"
    )
    if saglik_skoru >= 75:
        advice += (
            "🟢 Şirketiniz güçlü bir finansal yapıya sahip. Büyüme yatırımları "
            "ve yeni kredi olanakları için uygun bir konumdasınız.\n\n"
        )
    elif saglik_skoru >= 50:
        advice += (
            "🟡 Şirketiniz dengeli bir profil sergiliyor. Borç yapınızı "
            "optimize ederek ve nakit akışını güçlendirerek skorunuzu "
            "yükseltebilirsiniz.\n\n"
        )
    else:
        advice += (
            "🔴 Şirketinizin finansal göstergeleri dikkat gerektiriyor. "
            "Maliyet yapısını gözden geçirmeniz, borçları yeniden "
            "yapılandırmanız ve nakit akışını öncelemeniz önerilir.\n\n"
        )
    advice += (
        "💡 Finansal Okuryazarlık: Şirket sağlığının temeli nakit akışıdır. "
        "Kârlı görünen bir şirket bile, nakit akışı yönetilmezse ödeme "
        "güçlüğüne düşebilir. Alacak ve borç vadelerini daima dengeleyin."
    )

    return {
        "sirket_saglik_skoru": saglik_skoru,
        "risk_status": status,
        "risk_color": color,
        "metrics": {
            "ciro_per_calisan": round(ciro_per_calisan, 2),
            "pos_ciro_orani": round(pos_orani * 100, 1),
            "borc_ciro_orani": round(borc_orani * 100, 1),
            "sirket_yasi": sirket_yasi,
        },
        "chart_data": [
            {"name": "Yıllık Ciro", "value": round(ciro, 2)},
            {"name": "Yıllık POS Hacmi", "value": round(pos_hacmi * 12, 2)},
            {"name": "Mevcut Borç", "value": round(mevcut_borc, 2)},
        ],
        "ai_advice": advice,
    }


# =============================================================================
# ÜRÜN MOTORU (Linear Regression mantığıyla prim/getiri)
# =============================================================================

def compute_urun_analysis(urun_turu: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ürün analizi — Linear Regression mantığıyla kurgusal getiri/prim tahmini.

    Doğrusal model:  tahmin = β0 + β1·x1 + β2·x2 + ... + βn·xn
    Katsayılar (β) her ürün türü için önceden kalibre edilmiş sabitlerdir.

    Args:
        urun_turu: Mevduat_Hesabi | Sigorta_Urunleri | Kampanyalar
        data: Ürün form verileri

    Returns:
        { tahmin, tahmin_label, risk_color, metrics, chart_data, ai_advice }
    """
    if urun_turu == "Mevduat_Hesabi":
        return _urun_mevduat(data)
    if urun_turu == "Sigorta_Urunleri":
        return _urun_sigorta(data)
    if urun_turu == "Kampanyalar":
        return _urun_kampanya(data)
    raise ValueError(
        f"Geçersiz ürün türü: '{urun_turu}'. "
        f"Geçerli türler: Mevduat_Hesabi, Sigorta_Urunleri, Kampanyalar"
    )


def _urun_mevduat(data: Dict[str, Any]) -> Dict[str, Any]:
    """Mevduat Hesabı — vade ve tutara göre doğrusal getiri tahmini."""
    tutar = _safe_float(data.get("mevduat_tutari"))
    vade_ay = int(_safe_float(data.get("vade_ay"), 12))

    # Linear Regression katsayıları (kurgusal, yıllık faiz tahmini için)
    # faiz_orani = β0 + β1·log(tutar) + β2·vade
    beta_0 = 0.30
    beta_1 = 0.008   # büyük tutar → hafif daha yüksek faiz
    beta_2 = 0.0035  # uzun vade → daha yüksek faiz
    annual_rate = beta_0 + beta_1 * math.log10(tutar + 1) + beta_2 * vade_ay
    annual_rate = _clamp(annual_rate, 0.30, 0.48)

    # Vade sonu getiri (basit faiz, vadeli mevduat mantığı)
    getiri = tutar * annual_rate * (vade_ay / 12)
    vade_sonu = tutar + getiri

    advice = (
        f"🏦 {_format_currency(tutar)} tutarındaki vadeli mevduatınız, "
        f"{vade_ay} ay vade sonunda yaklaşık {_format_currency(vade_sonu)} "
        f"değerine ulaşır.\n\n"
        f"📈 Tahmini net getiri: {_format_currency(getiri)} "
        f"(kurgusal yıllık %{annual_rate * 100:.1f} faiz oranı, doğrusal "
        f"regresyon modeliyle hesaplandı).\n\n"
        "💡 Finansal Okuryazarlık: Vadeli mevduat, sermayenizi korurken "
        "öngörülebilir bir getiri sağlayan en düşük riskli araçlardandır. "
        "Vadeyi bozmamak, faiz kaybını önler."
    )

    return {
        "tahmin": round(getiri, 2),
        "tahmin_label": "Tahmini Vade Sonu Getirisi",
        "risk_color": "green",
        "metrics": {
            "vade_sonu_bakiye": round(vade_sonu, 2),
            "yillik_faiz": round(annual_rate * 100, 1),
            "vade_ay": vade_ay,
        },
        "chart_data": [
            {"name": "Anapara", "value": round(tutar, 2)},
            {"name": "Net Getiri", "value": round(getiri, 2)},
            {"name": "Vade Sonu", "value": round(vade_sonu, 2)},
        ],
        "ai_advice": advice,
    }


def _urun_sigorta(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sigorta Ürünleri — Linear Regression ile aylık prim tahmini."""
    yas = int(_safe_float(data.get("yas"), 35))
    teminat = _safe_float(data.get("teminat_tutari"))
    sigorta_tipi = str(data.get("sigorta_tipi", "saglik")).lower()

    # Linear Regression: prim = β0 + β1·yas + β2·teminat + tip_sabiti
    tip_sabiti = {"hayat": 150.0, "saglik": 290.0, "kasko": 410.0}
    beta_0 = tip_sabiti.get(sigorta_tipi, 290.0)
    beta_1 = 5.2                              # yaş katsayısı
    beta_2 = 0.00042                          # teminat katsayısı
    aylik_prim = beta_0 + beta_1 * max(0, yas - 20) + beta_2 * teminat
    aylik_prim = round(aylik_prim, 2)

    tip_label = {"hayat": "Hayat", "saglik": "Sağlık", "kasko": "Kasko"}.get(
        sigorta_tipi, "Sağlık"
    )

    advice = (
        f"🛡️ {tip_label} Sigortası için tahmini aylık priminiz "
        f"{_format_currency(aylik_prim)}, yıllık toplam ise "
        f"{_format_currency(aylik_prim * 12)} olarak hesaplanmıştır.\n\n"
        f"📊 Tahmin; {yas} yaşınız ve {_format_currency(teminat)} teminat "
        f"tutarınız üzerinden çok değişkenli doğrusal regresyon (multiple "
        f"linear regression) modeliyle üretilmiştir.\n\n"
        "💡 Finansal Okuryazarlık: Sigorta priminizi belirleyen en büyük "
        "faktör yaştır. Genç yaşta yapılan sigorta sözleşmeleri, ömür boyu "
        "daha düşük prim avantajı sağlayabilir."
    )

    return {
        "tahmin": aylik_prim,
        "tahmin_label": "Tahmini Aylık Prim",
        "risk_color": "yellow",
        "metrics": {
            "aylik_prim": aylik_prim,
            "yillik_prim": round(aylik_prim * 12, 2),
            "teminat_tutari": round(teminat, 2),
        },
        "chart_data": [
            {"name": "Aylık Prim", "value": aylik_prim},
            {"name": "Yıllık Prim", "value": round(aylik_prim * 12, 2)},
            {"name": "Teminat", "value": round(teminat, 2)},
        ],
        "ai_advice": advice,
    }


def _urun_kampanya(data: Dict[str, Any]) -> Dict[str, Any]:
    """Kampanyalar — harcama profiline göre tahmini yıllık kazanç (cashback)."""
    aylik_harcama = _safe_float(data.get("aylik_harcama"))
    kampanya_tipi = str(data.get("kampanya_tipi", "cashback")).lower()

    # Linear Regression: kazanc = β1·harcama (kampanya tipine göre oran)
    cashback_orani = {
        "cashback": 0.025,      # %2.5 nakit iade
        "puan": 0.018,          # %1.8 puan değeri
        "mil": 0.022,           # %2.2 mil değeri
    }
    oran = cashback_orani.get(kampanya_tipi, 0.025)
    yillik_kazanc = round(aylik_harcama * 12 * oran, 2)
    aylik_kazanc = round(aylik_harcama * oran, 2)

    tip_label = {
        "cashback": "Nakit İade (Cashback)",
        "puan": "Puan Kazanımı",
        "mil": "Mil Kazanımı",
    }.get(kampanya_tipi, "Nakit İade")

    advice = (
        f"🎁 {tip_label} kampanyasıyla, aylık {_format_currency(aylik_harcama)} "
        f"harcamanız üzerinden tahmini yıllık {_format_currency(yillik_kazanc)} "
        f"kazanç elde edebilirsiniz (aylık ≈ {_format_currency(aylik_kazanc)}).\n\n"
        f"📊 Hesaplama, harcama tutarınız ile kampanya kazanç oranının "
        f"(%{oran * 100:.1f}) doğrusal çarpımına dayanır.\n\n"
        "💡 Finansal Okuryazarlık: Kampanyalar ancak zaten yapacağınız "
        "harcamalar üzerinden değerlidir. Sırf kazanç için fazladan harcamak, "
        "elde ettiğiniz iadeden çok daha fazlasını kaybettirir."
    )

    return {
        "tahmin": yillik_kazanc,
        "tahmin_label": "Tahmini Yıllık Kazanç",
        "risk_color": "green",
        "metrics": {
            "aylik_kazanc": aylik_kazanc,
            "yillik_kazanc": yillik_kazanc,
            "kazanc_orani": round(oran * 100, 1),
        },
        "chart_data": [
            {"name": "Aylık Harcama", "value": round(aylik_harcama, 2)},
            {"name": "Aylık Kazanç", "value": aylik_kazanc},
            {"name": "Yıllık Kazanç", "value": yillik_kazanc},
        ],
        "ai_advice": advice,
    }
