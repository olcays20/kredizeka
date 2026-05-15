"""
KrediZeka - Makine Öğrenmesi Model Eğitim Scripti
===================================================
Bu script, sahte (sentetik) finansal veriler üreterek bir Random Forest sınıflandırıcı
modeli eğitir ve dışa aktarır. Model, kredi başvurularının onaylanma olasılığını
tahmin etmek için kullanılır.

Kullanım:
    python train_model.py

Çıktı:
    loan_risk_pipeline.pkl - Eğitilmiş ML pipeline dosyası
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# =============================================================================
# 1) SAHTE (SENTETİK) VERİ ÜRETİMİ
# =============================================================================
# Gerçek bankacılık verilerine benzer sahte veriler üretiyoruz.
# Bu veriler: aylık gelir, toplam borç, talep edilen kredi tutarı ve
# kredi onay durumu (0 = Reddedildi, 1 = Onaylandı) bilgilerini içerir.

def generate_synthetic_data(n_samples=5000, random_state=42):
    """
    Sahte finansal veri seti oluşturur.
    
    Parametreler:
        n_samples (int): Üretilecek örnek sayısı. Varsayılan: 5000
        random_state (int): Tekrarlanabilirlik için rastgele tohum değeri
    
    Döndürür:
        pd.DataFrame: Gelir, borç, kredi tutarı ve onay durumu içeren veri seti
    """
    np.random.seed(random_state)
    
    # --- Aylık Gelir (TL) ---
    # Normal dağılım ile gelir üretimi (ortalama: 15.000 TL, std: 8.000 TL)
    # Minimum 3.000 TL olarak sınırlandırıyoruz (asgari ücret seviyesi)
    income = np.random.normal(loc=15000, scale=8000, size=n_samples)
    income = np.clip(income, 3000, 100000)  # 3.000 - 100.000 TL arası
    
    # --- Toplam Borç (TL) ---
    # Borç miktarı gelire orantılı olarak üretiliyor
    # Bazı kişilerin hiç borcu yok, bazılarının gelirinden fazla borcu var
    debt_ratio = np.random.beta(a=2, b=5, size=n_samples)  # 0-1 arası oran
    debt = income * debt_ratio * np.random.uniform(0, 2, size=n_samples)
    debt = np.clip(debt, 0, 500000)  # Maksimum 500.000 TL borç
    
    # --- Talep Edilen Kredi Tutarı (TL) ---
    # Kredi tutarı genellikle gelirin 1-24 katı arasında olur
    loan_multiplier = np.random.uniform(1, 24, size=n_samples)
    loan_amount = income * loan_multiplier
    loan_amount = np.clip(loan_amount, 5000, 2000000)  # 5.000 - 2.000.000 TL arası
    
    # --- Onay Durumu (0 veya 1) ---
    # Gerçekçi bir kredi değerlendirme mantığı oluşturuyoruz:
    # - Borç/Gelir oranı düşükse → onay olasılığı yüksek
    # - Kredi/Gelir oranı makul ise → onay olasılığı yüksek
    # - Gelir yüksekse → onay olasılığı yüksek
    
    # Borç/Gelir oranı (DTI - Debt to Income)
    dti = debt / (income + 1)  # +1 sıfıra bölünmeyi önler
    
    # Kredi/Gelir oranı (LTI - Loan to Income)
    lti = loan_amount / (income + 1)
    
    # Onay olasılığını hesaplayan formül
    # DTI düştükçe, LTI düştükçe ve gelir arttıkça onay olasılığı artar
    approval_score = (
        -1.5 * dti           # Borç oranı arttıkça olumsuz etki
        - 0.08 * lti          # Kredi/gelir oranı arttıkça olumsuz etki
        + 0.00005 * income    # Gelir arttıkça olumlu etki
        + np.random.normal(0, 0.5, n_samples)  # Rastgele gürültü
        + 1.0                 # Temel sapma (bias)
    )
    
    # Sigmoid fonksiyonu ile 0-1 arası olasılığa çevirme
    approval_probability = 1 / (1 + np.exp(-approval_score))
    
    # Olasılığa göre ikili (binary) karar üretme
    approved = (approval_probability > 0.5).astype(int)
    
    # DataFrame oluşturma
    df = pd.DataFrame({
        'income': np.round(income, 2),
        'debt': np.round(debt, 2),
        'loan_amount': np.round(loan_amount, 2),
        'approved': approved
    })
    
    return df

# =============================================================================
# 2) MODEL EĞİTİMİ
# =============================================================================
def train_model():
    """
    Random Forest modeli eğitir ve pipeline olarak dışa aktarır.
    
    Pipeline şu adımları içerir:
    1. StandardScaler: Verileri ölçeklendirir (ortalaması 0, std sapması 1 olur)
    2. RandomForestClassifier: Karar ağaçları topluluğu ile sınıflandırma yapar
    
    Random Forest Neden Seçildi?
    - Aşırı öğrenmeye (overfitting) karşı dayanıklıdır
    - Özellik önemlerini (feature importance) gösterebilir
    - Olasılık tahmini (predict_proba) yapabilir
    - Finansal risk modellerinde yaygın olarak kullanılır
    """
    print("=" * 60)
    print("KrediZeka - ML Model Eğitim Süreci Başlıyor")
    print("=" * 60)
    
    # Veri üretimi
    print("\n[1/5] Sentetik veri seti oluşturuluyor...")
    df = generate_synthetic_data(n_samples=5000)
    print(f"  → Toplam {len(df)} örnek üretildi")
    print(f"  → Onaylanan: {df['approved'].sum()} | Reddedilen: {len(df) - df['approved'].sum()}")
    print(f"  → Onay Oranı: %{df['approved'].mean() * 100:.1f}")
    
    # Özellikler (X) ve hedef değişken (y) ayrımı
    print("\n[2/5] Veri seti eğitim ve test olarak ayrılıyor...")
    X = df[['income', 'debt', 'loan_amount']]  # Bağımsız değişkenler
    y = df['approved']                           # Bağımlı değişken (hedef)
    
    # Veriyi eğitim (%80) ve test (%20) olarak ayır
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  → Eğitim seti: {len(X_train)} örnek")
    print(f"  → Test seti: {len(X_test)} örnek")
    
    # Pipeline oluşturma
    # Pipeline, veri ön işleme ve model eğitimini tek bir nesne olarak birleştirir.
    # Bu sayede tahmin yaparken de aynı ön işleme adımları otomatik uygulanır.
    print("\n[3/5] ML Pipeline oluşturuluyor ve eğitiliyor...")
    pipeline = Pipeline([
        # Adım 1: Veri Ölçekleme
        # StandardScaler, her özelliği ortalaması 0, standart sapması 1 olacak şekilde dönüştürür.
        # Bu, farklı ölçekteki özelliklerin (örn: gelir binlerce TL, borç oranı 0-1 arası)
        # modeli eşit şekilde etkilemesini sağlar.
        ('scaler', StandardScaler()),
        
        # Adım 2: Random Forest Sınıflandırıcı
        # n_estimators: Toplulukta kaç karar ağacı olacağını belirler (200 ağaç)
        # max_depth: Her ağacın maksimum derinliği (aşırı öğrenmeyi önler)
        # min_samples_split: Bir düğümün bölünmesi için gereken minimum örnek sayısı
        # min_samples_leaf: Bir yaprak düğümde bulunması gereken minimum örnek sayısı
        # random_state: Tekrarlanabilirlik için rastgele tohum
        # n_jobs: Paralel işlem sayısı (-1 = tüm CPU çekirdeklerini kullan)
        ('classifier', RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            n_jobs=-1
        ))
    ])
    
    # Modeli eğitim verisi ile eğit
    pipeline.fit(X_train, y_train)
    print("  → Model başarıyla eğitildi!")
    
    # Model performans değerlendirmesi
    print("\n[4/5] Model performansı değerlendiriliyor...")
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"  → Doğruluk (Accuracy): %{accuracy * 100:.2f}")
    print("\n  Detaylı Sınıflandırma Raporu:")
    print("  " + "-" * 50)
    report = classification_report(y_test, y_pred, target_names=['Reddedildi', 'Onaylandı'])
    for line in report.split('\n'):
        print(f"  {line}")
    
    # Özellik önemlerini göster
    # Random Forest, her özelliğin karar verme sürecine ne kadar katkıda bulunduğunu ölçer.
    feature_importances = pipeline.named_steps['classifier'].feature_importances_
    feature_names = ['Gelir (income)', 'Borç (debt)', 'Kredi Tutarı (loan_amount)']
    print("\n  Özellik Önemleri (Feature Importances):")
    print("  " + "-" * 50)
    for name, importance in sorted(zip(feature_names, feature_importances), key=lambda x: -x[1]):
        bar = "█" * int(importance * 40)
        print(f"  {name:30s} → {importance:.4f} {bar}")
    
    # Pipeline'ı diske kaydet
    print("\n[5/5] Model pipeline dosya olarak kaydediliyor...")
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'loan_risk_pipeline.pkl')
    joblib.dump(pipeline, model_path)
    file_size = os.path.getsize(model_path) / (1024 * 1024)  # MB cinsinden
    print(f"  → Kaydedildi: {model_path}")
    print(f"  → Dosya boyutu: {file_size:.2f} MB")
    
    # Test: Kayıtlı modeli yükle ve örnek tahmin yap
    print("\n" + "=" * 60)
    print("DOĞRULAMA TESTİ - Örnek Tahmin")
    print("=" * 60)
    loaded_pipeline = joblib.load(model_path)
    
    # Örnek bir başvuru verisi
    test_data = pd.DataFrame({
        'income': [12000],       # Aylık 12.000 TL gelir
        'debt': [5000],          # 5.000 TL toplam borç
        'loan_amount': [50000]   # 50.000 TL kredi talebi
    })
    
    # predict_proba: Her sınıf için olasılık döndürür
    # [:, 1] → "Onaylandı" sınıfının olasılığını alır
    prediction_proba = loaded_pipeline.predict_proba(test_data)[:, 1][0]
    score = round(prediction_proba * 100, 1)  # 0-100 arası skora çevir
    
    print(f"  Girdi  → Gelir: 12.000₺ | Borç: 5.000₺ | Kredi: 50.000₺")
    print(f"  Sonuç  → Onaylanma Skoru: {score}/100")
    print(f"  Durum  → {'✅ Onaylanma olasılığı yüksek' if score >= 50 else '❌ Reddedilme riski yüksek'}")
    
    print("\n" + "=" * 60)
    print("✅ Model eğitimi başarıyla tamamlandı!")
    print("=" * 60)

# =============================================================================
# 3) SCRIPT ÇALIŞTIRMA
# =============================================================================
if __name__ == "__main__":
    train_model()
