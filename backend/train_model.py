"""
KrediZeka - ML Model Eğitim Scripti (XGBoost + SHAP)
======================================================
Üretim seviyesinde XGBoost tabanlı kredi risk modeli.

Bu script:
  1. "German Credit Risk" benzeri zengin sentetik veri seti üretir (6000 satır)
  2. Train/test split + StandardScaler ile ön işleme
  3. XGBoost + GridSearchCV ile hiperparametre optimizasyonu
  4. SHAP TreeExplainer'ı modelle birlikte serialize eder
  5. Sonuçları ve özellik önemlerini terminale yazdırır

Kullanım:
    python train_model.py

Çıktı:
    loan_risk_pipeline.pkl  → {"pipeline": ..., "explainer": ..., "features": ...}
"""

import os
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score
from xgboost import XGBClassifier
import shap

# =============================================================================
# SABİTLER
# =============================================================================
RANDOM_SEED = 42
N_SAMPLES = 6000
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "loan_risk_pipeline.pkl")

# Modelin eğitileceği özellikler (sıralama önemli — predict ederken aynı sırada gönderilmeli)
FEATURE_NAMES = [
    "income",            # Aylık gelir (TL)
    "debt",              # Mevcut toplam borç (TL)
    "loan_amount",       # Talep edilen kredi tutarı (TL)
    "age",               # Yaş
    "employment_years",  # Mevcut işteki yıl
    "credit_history",    # Önceki kredi geçmişi (0-5: kötü→mükemmel)
    "dependents",        # Bakmakla yükümlü kişi sayısı
    "savings_balance",   # Birikim hesabı bakiyesi
    "dti_ratio",         # Borç/Gelir oranı (% türetilmiş özellik)
    "lti_ratio",         # Kredi/Gelir oranı (× türetilmiş özellik)
]

# Frontend'de gösterilecek insan okuyabilir etiketler (i18n)
FEATURE_LABELS_TR = {
    "income":            "Aylık Gelir",
    "debt":              "Mevcut Borç",
    "loan_amount":       "Kredi Tutarı",
    "age":               "Yaş",
    "employment_years":  "İş Tecrübesi (Yıl)",
    "credit_history":    "Kredi Geçmişi",
    "dependents":        "Bakmakla Yükümlü",
    "savings_balance":   "Birikim Bakiyesi",
    "dti_ratio":         "Borç/Gelir Oranı",
    "lti_ratio":         "Kredi/Gelir Oranı",
}

FEATURE_LABELS_EN = {
    "income":            "Monthly Income",
    "debt":              "Existing Debt",
    "loan_amount":       "Loan Amount",
    "age":               "Age",
    "employment_years":  "Employment (Years)",
    "credit_history":    "Credit History",
    "dependents":        "Dependents",
    "savings_balance":   "Savings Balance",
    "dti_ratio":         "Debt-to-Income Ratio",
    "lti_ratio":         "Loan-to-Income Ratio",
}


# =============================================================================
# SENTETİK VERİ ÜRETİMİ
# =============================================================================

def generate_synthetic_dataset(n_samples: int = N_SAMPLES, seed: int = RANDOM_SEED) -> pd.DataFrame:
    """
    German Credit Risk veri setine benzer, gerçekçi finansal özellikler içeren
    sentetik veri seti üretir.

    Dağılım Karakteristikleri:
      - income: log-normal (gerçek maaş dağılımına benzer)
      - age: normal dağılım, 18-75 arası
      - debt: gelirin %0-150 arası
      - loan_amount: log-normal, gelirle korelasyon
      - dependents: Poisson(0.8)
      - credit_history: beta dağılım × 5 (0-5)
      - approved: Çok faktörlü lojistik fonksiyon → ~%55 onay
    """
    rng = np.random.default_rng(seed)

    # 1) GELİR
    income = np.clip(rng.lognormal(mean=9.7, sigma=0.55, size=n_samples), 2_000, 200_000)

    # 2) YAŞ
    age = np.clip(rng.normal(loc=38, scale=12, size=n_samples).astype(int), 18, 75)

    # 3) İŞ TECRÜBESİ — yaşa bağlı üst sınır
    max_emp = np.maximum(age - 18, 0)
    employment_years = np.clip(
        rng.normal(loc=max_emp * 0.4, scale=3, size=n_samples).astype(int),
        0, max_emp
    )

    # 4) BORÇ
    debt_ratio = rng.beta(a=2, b=4, size=n_samples) * 1.5
    debt = np.clip(income * debt_ratio, 0, 500_000)

    # 5) KREDİ TUTARI
    base_loan = rng.lognormal(mean=10.5, sigma=0.7, size=n_samples)
    loan_amount = np.clip(base_loan + income * 0.5 * rng.uniform(0, 1, n_samples),
                          1_000, 1_000_000)

    # 6) BAKMAKLA YÜKÜMLÜ
    dependents = rng.poisson(lam=0.8, size=n_samples).clip(0, 6)

    # 7) KREDİ GEÇMİŞİ
    credit_history = (rng.beta(a=3, b=2, size=n_samples) * 5).round().astype(int)
    credit_history = np.clip(credit_history, 0, 5)

    # 8) BİRİKİM
    savings_balance = np.clip(
        rng.lognormal(mean=8.5, sigma=1.2, size=n_samples) + income * 0.3,
        0, 2_000_000
    )

    # 9) TÜRETİLMİŞ ORANLAR
    dti_ratio = np.where(income > 0, (debt / income) * 100, 999).round(2)
    lti_ratio = np.where(income > 0, loan_amount / income, 999).round(2)

    # ─── ETİKET (approved) — Lojistik fonksiyonla puan üret ─────────────
    age_bonus = np.where((age >= 25) & (age <= 55), 0.8, 0.0)
    score = (
        # Pozitif faktörler
        (credit_history / 5) * 3.5
        + np.minimum(employment_years / 15, 1) * 2.0
        + np.minimum(np.log10(savings_balance + 1) / 5, 1) * 1.5
        + age_bonus
        # Negatif faktörler
        - (dti_ratio / 100) * 2.5
        - np.minimum(lti_ratio / 10, 1) * 2.0
        - (dependents * 0.15)
        + rng.normal(0, 0.5, size=n_samples)
    )
    probability = 1 / (1 + np.exp(-score))
    approved = (probability > 0.5).astype(int)

    df = pd.DataFrame({
        "income": income.round(2),
        "debt": debt.round(2),
        "loan_amount": loan_amount.round(2),
        "age": age,
        "employment_years": employment_years,
        "credit_history": credit_history,
        "dependents": dependents,
        "savings_balance": savings_balance.round(2),
        "dti_ratio": dti_ratio,
        "lti_ratio": lti_ratio,
        "approved": approved,
    })
    return df


# =============================================================================
# MODEL EĞİTİMİ
# =============================================================================

def train_xgboost_pipeline(df: pd.DataFrame):
    """
    XGBoost + GridSearchCV ile hiperparametre optimize edilmiş model üret.
    Returns: (best_pipeline, X_train, X_test, y_train, y_test, best_params)
    """
    X = df[FEATURE_NAMES]
    y = df["approved"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("xgb", XGBClassifier(
            random_state=RANDOM_SEED,
            eval_metric="logloss",
            tree_method="hist",
            n_jobs=-1,
        )),
    ])

    # Hiperparametre ızgarası — 16 kombinasyon × 3 fold = 48 fit (~1-2 dk)
    param_grid = {
        "xgb__n_estimators": [200, 300],
        "xgb__max_depth": [4, 6],
        "xgb__learning_rate": [0.05, 0.1],
        "xgb__subsample": [0.8, 1.0],
    }

    n_combos = 1
    for v in param_grid.values():
        n_combos *= len(v)

    grid = GridSearchCV(
        pipeline,
        param_grid,
        cv=3,
        scoring="roc_auc",
        n_jobs=-1,
        verbose=1,
    )

    print(f"🔍 GridSearchCV başlıyor ({n_combos} kombinasyon × 3 fold)...")
    start = time.time()
    grid.fit(X_train, y_train)
    print(f"✅ GridSearchCV tamamlandı ({time.time() - start:.1f}s)")

    return grid.best_estimator_, X_train, X_test, y_train, y_test, grid.best_params_


# =============================================================================
# ANA
# =============================================================================

def main():
    print("\n" + "=" * 70)
    print("🚀 KrediZeka — ML Pipeline Eğitimi (XGBoost + SHAP)")
    print("=" * 70 + "\n")

    # 1) VERİ ÜRET
    print(f"📊 Sentetik veri üretiliyor ({N_SAMPLES} satır)...")
    df = generate_synthetic_dataset()
    approval_rate = df["approved"].mean()
    print(f"   • Onay oranı : %{approval_rate * 100:.1f}")
    print(f"   • Boyut      : {df.shape}")
    print(f"   • Özellikler : {len(FEATURE_NAMES)}")

    # 2) MODEL EĞİT
    print("\n🧠 XGBoost + GridSearchCV ile model eğitiliyor...")
    pipeline, X_train, X_test, y_train, y_test, best_params = train_xgboost_pipeline(df)

    # 3) DEĞERLENDİR
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)

    print(f"\n📈 Performans Metrikleri")
    print(f"   • Doğruluk (Accuracy) : %{acc * 100:.2f}")
    print(f"   • ROC AUC             : {auc:.4f}")
    print(f"   • En İyi Parametreler : {best_params}")
    print(f"\n   Sınıflandırma Raporu:")
    print(classification_report(y_test, y_pred, target_names=["Red", "Onay"], digits=3))

    # 4) ÖZELLİK ÖNEMİ
    xgb_model = pipeline.named_steps["xgb"]
    feature_importance = pd.DataFrame({
        "feature": FEATURE_NAMES,
        "importance": xgb_model.feature_importances_,
    }).sort_values("importance", ascending=False)

    print("   📌 Özellik Önem Sıralaması:")
    for _, row in feature_importance.iterrows():
        bar = "█" * int(row["importance"] * 50)
        print(f"      {row['feature']:20s} {row['importance']:.4f}  {bar}")

    # 5) SHAP TREE EXPLAINER — XGBoost ağaçları için en hızlı
    print("\n🔍 SHAP TreeExplainer hazırlanıyor...")
    explainer = shap.TreeExplainer(xgb_model)
    # Sanity check (scaled X ile)
    scaler = pipeline.named_steps["scaler"]
    sample_scaled = scaler.transform(X_train.iloc[:5])
    sample_shap = explainer.shap_values(sample_scaled)
    print(f"   • Explainer hazır. Örnek SHAP boyutu: {np.array(sample_shap).shape}")

    # 6) BUNDLE KAYDET — pipeline + explainer + metadata tek dosyada
    bundle = {
        "pipeline": pipeline,
        "explainer": explainer,
        "features": FEATURE_NAMES,
        "labels_tr": FEATURE_LABELS_TR,
        "labels_en": FEATURE_LABELS_EN,
        "metrics": {
            "accuracy": float(acc),
            "roc_auc": float(auc),
            "best_params": best_params,
        },
        "feature_importance": feature_importance.to_dict("records"),
    }
    joblib.dump(bundle, MODEL_PATH, compress=3)
    file_size = os.path.getsize(MODEL_PATH) / 1024
    print(f"\n💾 Model kaydedildi: {MODEL_PATH} ({file_size:.1f} KB)")
    print("\n" + "=" * 70)
    print("✅ Eğitim başarıyla tamamlandı.")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
