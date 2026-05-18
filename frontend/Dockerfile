# =============================================================================
# KrediZeka Frontend - Dockerfile (Multi-stage build)
# =============================================================================
# Stage 1: Vite ile React projesini build et
# Stage 2: Statik dosyaları Nginx ile sun
#
# Sonuç: ~25MB nihai imaj (Node sadece build için kullanılır)
# =============================================================================

# ─── Stage 1: Build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# package.json + lockfile önce kopyala (Docker cache optimizasyonu)
COPY package.json package-lock.json* ./
RUN npm ci

# Tüm kaynak kodu kopyala
COPY . .

# VITE_API_URL build-time argümanı (docker-compose'tan gelir)
# import.meta.env.VITE_API_URL üzerinden React koduna gömülür
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Üretim build'i — dist/ klasörüne çıkar
RUN npm run build

# ─── Stage 2: Production (Nginx) ───────────────────────────────────────────
FROM nginx:alpine AS production

# Default Nginx ayarını silip kendi config'imizi koy
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build çıktısını Nginx'in serve klasörüne kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Nginx foreground modunda çalışsın (container açık kalır)
CMD ["nginx", "-g", "daemon off;"]
