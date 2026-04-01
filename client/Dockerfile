# ── Étape 1 : build React ─────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Variable d'env pour pointer vers le backend en production
# L'URL sera proxifiée par Nginx, donc /api suffira
RUN npm run build

# ── Étape 2 : servir avec Nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Config Nginx minimale pour SPA React (redirection sur index.html)
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
  location /api { return 404; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
