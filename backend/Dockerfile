# =============================================================================
# KrediZeka Backend - Dockerfile (Multi-stage build için optimize edilmiş)
# =============================================================================
# Python 3.11 — XGBoost ve scikit-learn ile tam uyumlu LTS sürüm
# slim varyantı: ~150MB (full imajdan ~5x küçük)
# =============================================================================

FROM python:3.11-slim AS base

# Sistem güncellemeleri ve gerekli build araçları
# libgomp1 → XGBoost'un OpenMP runtime'ı (paralel ağaç üretimi için zorunlu)
# gcc/g++ → bazı paketlerin native uzantılarını derlemek için
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgomp1 \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Uygulama dizini
WORKDIR /app

# Python ortam değişkenleri:
# PYTHONUNBUFFERED=1 → stdout/stderr anlık akar (logları gerçek zamanlı görmek için)
# PYTHONDONTWRITEBYTECODE=1 → .pyc dosyaları üretilmesin (image boyutu için)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Önce sadece requirements.txt'i kopyala (cache optimizasyonu)
# Bu sayede kod değişse bile bağımlılıklar yeniden yüklenmez
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Kalan kaynak kodu kopyala
COPY . .

# ML modelini build sırasında üret (varsa atla)
# Bu adım, container ilk başlatıldığında modelin hazır olmasını sağlar
RUN if [ ! -f loan_risk_pipeline.pkl ]; then \
        python train_model.py || echo "Model eğitimi başarısız - runtime'da denenecek"; \
    fi

# 8000 portunu dışarı aç
EXPOSE 8000

# Healthcheck: uvicorn ayakta mı?
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/').read()" || exit 1

# Üretim modunda uvicorn başlat (reload yok, çoklu worker)
# --workers 2 → tek thread'den fazlasını kullanır (CPU çekirdek sayısı kadar artırılabilir)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
