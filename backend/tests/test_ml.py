"""
KrediZeka - Makine Öğrenmesi Birim Testleri (test_ml.py)
==========================================================
ML modelinin ve finansal simülasyon motorlarının doğru ve mantıklı
sonuçlar ürettiğini kanıtlayan birim testleri.

Test edilen bileşenler:
  1. XGBoost + SHAP modeli (loan_risk_pipeline.pkl)
     - Belleğe başarıyla yükleniyor mu?
     - Test verisiyle 0-100 arası mantıklı skor üretiyor mu?
     - Düşük riskli profil, yüksek riskli profilden daha yüksek skor alıyor mu?
  2. Finansal simülasyon motorları (finance_engines.py)
     - Bireysel / Ticari / Ürün motorları doğru çıktı veriyor mu?

Kalite Yaklaşımı:
  ML testlerinde sabit (deterministik) doğrulama zordur — bu yüzden
  "aralık" (skorun 0-100 arasında olması) ve "sıralama" (mantıklı
  girdinin mantıksız girdiden daha iyi skor alması) doğrulanır.
"""

import os
import pathlib

import joblib
import pandas as pd
import pytest

from services.finance_engines import (
    compute_bireysel_analysis,
    compute_ticari_analysis,
    compute_urun_analysis,
)


# Eğitilmiş model dosyasının yolu
MODEL_PATH = pathlib.Path(__file__).resolve().parent.parent / "loan_risk_pipeline.pkl"


# =============================================================================
# 1) ML MODEL DOSYASI TESTLERİ
# =============================================================================

class TestModelLoading:
    """loan_risk_pipeline.pkl — Model dosyasının yüklenmesi ve yapısı."""

    def test_model_file_exists(self):
        """
        Eğitilmiş model dosyası diskte mevcut olmalıdır.
        (Yoksa: 'python train_model.py' ile üretilmelidir.)
        """
        assert MODEL_PATH.exists(), (
            f"Model dosyası bulunamadı: {MODEL_PATH}\n"
            f"Çözüm: backend dizininde 'python train_model.py' çalıştırın."
        )

    def test_model_loads_into_memory(self):
        """
        Model dosyası joblib ile belleğe sorunsuz yüklenebilmelidir.
        """
        bundle = joblib.load(MODEL_PATH)
        assert bundle is not None
        assert isinstance(bundle, dict)

    def test_model_bundle_has_required_keys(self):
        """
        Model paketi (bundle), v2 mimarisinin gerektirdiği tüm
        bileşenleri içermelidir: pipeline, explainer, features.
        """
        bundle = joblib.load(MODEL_PATH)
        assert "pipeline" in bundle, "Pipeline (scaler + XGBoost) eksik"
        assert "explainer" in bundle, "SHAP TreeExplainer eksik"
        assert "features" in bundle, "Özellik listesi eksik"
        # Özellik listesi boş olmamalı
        assert len(bundle["features"]) > 0

    def test_model_metrics_are_reasonable(self):
        """
        Modelin eğitim metrikleri (accuracy, roc_auc) mantıklı
        aralıkta olmalıdır — iyi eğitilmiş bir model %50'nin
        (rastgele tahmin) belirgin üzerinde olmalıdır.
        """
        bundle = joblib.load(MODEL_PATH)
        metrics = bundle.get("metrics", {})
        assert "accuracy" in metrics
        # Accuracy en az %70 olmalı (rastgele tahminden çok daha iyi)
        assert metrics["accuracy"] >= 0.70, (
            f"Model doğruluğu beklenenden düşük: {metrics['accuracy']}"
        )


# =============================================================================
# 2) ML MODEL TAHMİN TESTLERİ
# =============================================================================

class TestModelPrediction:
    """Model tahminlerinin mantıklı ve tutarlı olması."""

    @pytest.fixture(scope="class")
    def bundle(self):
        """Model paketini bir kez yükleyip tüm sınıf testlerine sunar."""
        return joblib.load(MODEL_PATH)

    def _build_input(self, bundle, **overrides):
        """
        Modelin beklediği özellik sırasına uygun bir girdi DataFrame'i kurar.
        overrides ile belirli özellikler test senaryosuna göre değiştirilebilir.
        """
        # Makul varsayılan değerler (orta profilli bir başvuran)
        defaults = {
            "income": 15000,
            "debt": 5000,
            "loan_amount": 50000,
            "age": 35,
            "employment_years": 5,
            "credit_history": 3,
            "dependents": 1,
            "savings_balance": 20000,
            "dti_ratio": 33.3,
            "lti_ratio": 3.33,
        }
        defaults.update(overrides)
        features = bundle["features"]
        return pd.DataFrame([{f: defaults[f] for f in features}])

    def test_prediction_returns_probability(self, bundle):
        """
        Model, predict_proba ile 0-1 aralığında bir olasılık üretmelidir.
        """
        pipeline = bundle["pipeline"]
        input_df = self._build_input(bundle)
        proba = pipeline.predict_proba(input_df)[:, 1][0]
        assert 0.0 <= proba <= 1.0, f"Olasılık 0-1 aralığında olmalı: {proba}"

    def test_score_in_valid_range(self, bundle):
        """
        Olasılık 0-100 skoruna çevrildiğinde, sonuç geçerli aralıkta olmalı.
        """
        pipeline = bundle["pipeline"]
        input_df = self._build_input(bundle)
        proba = pipeline.predict_proba(input_df)[:, 1][0]
        score = int(round(proba * 100))
        assert 0 <= score <= 100, f"Skor 0-100 aralığında olmalı: {score}"

    def test_good_profile_scores_higher_than_bad(self, bundle):
        """
        İYİ bir finansal profil (yüksek gelir, düşük borç, iyi kredi
        geçmişi), KÖTÜ bir profilden DAHA YÜKSEK skor almalıdır.

        Bu, modelin sadece sayı üretmediğini, finansal mantığı
        gerçekten öğrendiğini kanıtlayan en kritik testtir.
        """
        pipeline = bundle["pipeline"]

        # İyi profil: yüksek gelir, az borç, mükemmel kredi geçmişi
        good = self._build_input(
            bundle,
            income=50000, debt=2000, loan_amount=30000,
            credit_history=5, employment_years=15,
            savings_balance=200000, dependents=0,
            dti_ratio=4.0, lti_ratio=0.6,
        )
        good_score = pipeline.predict_proba(good)[:, 1][0]

        # Kötü profil: düşük gelir, çok borç, kötü kredi geçmişi
        bad = self._build_input(
            bundle,
            income=8000, debt=12000, loan_amount=200000,
            credit_history=0, employment_years=0,
            savings_balance=0, dependents=5,
            dti_ratio=150.0, lti_ratio=25.0,
        )
        bad_score = pipeline.predict_proba(bad)[:, 1][0]

        assert good_score > bad_score, (
            f"İyi profil skoru ({good_score:.3f}) kötü profilden "
            f"({bad_score:.3f}) yüksek olmalıydı — model finansal "
            f"mantığı öğrenememiş olabilir."
        )

    def test_shap_explainer_produces_values(self, bundle):
        """
        SHAP TreeExplainer, her özellik için bir katkı değeri üretmelidir.
        Üretilen SHAP vektörü, özellik sayısı kadar eleman içermelidir.
        """
        pipeline = bundle["pipeline"]
        explainer = bundle["explainer"]
        features = bundle["features"]

        input_df = self._build_input(bundle)
        # Pipeline'ın scaler'ından geçirilmiş veri SHAP'a verilir
        scaler = pipeline.named_steps["scaler"]
        scaled = scaler.transform(input_df)
        shap_values = explainer.shap_values(scaled)

        # SHAP değerleri (1 örnek × N özellik) boyutunda olmalı
        assert len(shap_values[0]) == len(features), (
            f"SHAP değer sayısı ({len(shap_values[0])}) özellik sayısına "
            f"({len(features)}) eşit olmalı."
        )


# =============================================================================
# 3) BİREYSEL SİMÜLASYON MOTORU TESTLERİ
# =============================================================================

class TestBireyselEngines:
    """finance_engines.py — Bireysel hizmet motorları."""

    def test_kredi_yonetimi_score_range(self):
        """Kredi Yönetimi motoru 0-100 aralığında skor üretmeli."""
        result = compute_bireysel_analysis("Kredi_Yonetimi", {
            "aylik_gelir": 15000,
            "toplam_borc": 5000,
            "talep_kredi": 50000,
        })
        assert 0 <= result["score"] <= 100
        assert "ai_advice" in result
        assert len(result["ai_advice"]) > 0

    def test_kredi_yonetimi_low_debt_higher_score(self):
        """
        Düşük borçlu bir profil, yüksek borçlu profilden daha yüksek
        kredi skoru almalıdır (motorun mantıklı çalıştığının kanıtı).
        """
        low_debt = compute_bireysel_analysis("Kredi_Yonetimi", {
            "aylik_gelir": 20000, "toplam_borc": 1000, "talep_kredi": 30000,
        })["score"]
        high_debt = compute_bireysel_analysis("Kredi_Yonetimi", {
            "aylik_gelir": 20000, "toplam_borc": 25000, "talep_kredi": 200000,
        })["score"]
        assert low_debt > high_debt

    def test_birikim_positive_return(self):
        """Birikim motoru, pozitif bir getiri tahmini üretmeli."""
        result = compute_bireysel_analysis("Birikim", {
            "anapara": 20000, "vade_ay": 24, "aylik_ekleme": 1000,
        })
        assert result["tahmin"] > 0
        assert result["tahmin_label"] == "Tahmini Net Getiri"

    def test_invalid_service_raises_value_error(self):
        """
        Tanımsız bir hizmet türü ValueError fırlatmalıdır.
        """
        with pytest.raises(ValueError):
            compute_bireysel_analysis("Olmayan_Hizmet", {})


# =============================================================================
# 4) TİCARİ SİMÜLASYON MOTORU TESTLERİ
# =============================================================================

class TestTicariEngine:
    """finance_engines.py — Ticari şirket sağlık skoru motoru."""

    def test_health_score_range(self):
        """Şirket sağlık skoru 0-100 aralığında olmalı."""
        result = compute_ticari_analysis("Ticari_Kredi", {
            "yillik_ciro": 5000000,
            "calisan_sayisi": 25,
            "aylik_pos_hacmi": 300000,
            "sirket_yasi": 8,
            "mevcut_borc": 1000000,
        })
        assert 0 <= result["sirket_saglik_skoru"] <= 100

    def test_pos_ratio_capped_at_100(self):
        """
        POS hacmi ciroyu aşsa bile, pos_ciro_orani metriği %100 ile
        sınırlandırılmalıdır (mantıksız değer gösterimi engellenir).
        """
        result = compute_ticari_analysis("POS_Tahsilat", {
            "yillik_ciro": 1000000,
            "calisan_sayisi": 2,
            "aylik_pos_hacmi": 300000,  # Yıllık 3.6M > ciro 1M
            "sirket_yasi": 2,
            "mevcut_borc": 0,
        })
        assert result["metrics"]["pos_ciro_orani"] <= 100.0


# =============================================================================
# 5) ÜRÜN SİMÜLASYON MOTORU TESTLERİ
# =============================================================================

class TestUrunEngine:
    """finance_engines.py — Ürün getiri/prim tahmin motoru."""

    def test_mevduat_positive_prediction(self):
        """Mevduat motoru pozitif bir getiri tahmini üretmeli."""
        result = compute_urun_analysis("Mevduat_Hesabi", {
            "mevduat_tutari": 100000,
            "vade_ay": 12,
        })
        assert result["tahmin"] > 0
        assert "tahmin_label" in result

    def test_kampanya_positive_prediction(self):
        """Kampanya motoru pozitif bir kazanç tahmini üretmeli."""
        result = compute_urun_analysis("Kampanyalar", {
            "aylik_harcama": 8000,
            "kampanya_tipi": "cashback",
        })
        assert result["tahmin"] > 0

    def test_invalid_urun_raises_value_error(self):
        """Tanımsız bir ürün türü ValueError fırlatmalıdır."""
        with pytest.raises(ValueError):
            compute_urun_analysis("Olmayan_Urun", {})
