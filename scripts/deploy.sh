#!/bin/bash
# ─── deploy.sh – Script de déploiement ZIKA sur serveur ECT ─────────────────
# Usage : chmod +x scripts/deploy.sh && ./scripts/deploy.sh
set -e

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║        DÉPLOIEMENT CHATBOT ZIKA – ECT            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Vérifications préalables ─────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo "❌ Fichier .env manquant. Copier .env.example en .env et remplir les valeurs."
  exit 1
fi

if ! grep -q "ANTHROPIC_API_KEY=sk-ant" .env; then
  echo "❌ ANTHROPIC_API_KEY non configurée dans .env."
  exit 1
fi

if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
  echo "⚠️  Certificats SSL manquants dans nginx/ssl/"
  echo "   Obtenir avec : certbot certonly --standalone -d chat.ect.ci"
  echo "   Puis copier : cp /etc/letsencrypt/live/chat.ect.ci/fullchain.pem nginx/ssl/"
  echo "                 cp /etc/letsencrypt/live/chat.ect.ci/privkey.pem nginx/ssl/"
  echo ""
  read -p "Continuer en HTTP uniquement (développement) ? [o/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Oo]$ ]]; then exit 1; fi
fi

echo "🔨 Construction des images Docker..."
docker compose build --no-cache

echo ""
echo "🚀 Lancement des services..."
docker compose up -d

echo ""
echo "⏳ Attente du démarrage (15s)..."
sleep 15

echo ""
echo "🏥 Vérification de l'état des services..."
docker compose ps

echo ""
echo "🧪 Test du health check backend..."
HEALTH=$(curl -s http://localhost:3001/api/health 2>/dev/null || echo '{"status":"error"}')
echo "   Réponse : $HEALTH"

if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo ""
  echo "✅ ZIKA est opérationnel !"
  echo ""
  echo "   📡 Backend  : http://localhost:3001/api/health"
  echo "   🌐 Frontend : https://chat.ect.ci"
  echo ""
else
  echo ""
  echo "❌ Le backend ne répond pas correctement."
  echo "   Vérifier les logs : docker compose logs zika-backend"
fi
