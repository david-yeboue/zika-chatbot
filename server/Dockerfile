FROM node:18-alpine

WORKDIR /app

# Copie et installation des dépendances
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copie du code source
COPY . .

# Utilisateur non-root pour la sécurité
RUN addgroup -S zika && adduser -S zika -G zika
USER zika

EXPOSE 3001

CMD ["node", "index.js"]
