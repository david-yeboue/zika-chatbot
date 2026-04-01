# ZIKA – Chatbot Intelligent ECT

> Assistant virtuel d'Eburnis Conseil & Technologies, propulsé par l'API Claude d'Anthropic.

---

## Structure du projet

```
zika-chatbot/
├── client/                  # Frontend React (Vite)
│   ├── src/
│   │   ├── ZikaChatbot.jsx  # Composant chatbot principal
│   │   └── main.jsx         # Point d'entrée React
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                  # Backend Node.js / Express
│   ├── data/
│   │   ├── faq.json         # Base FAQ ECT
│   │   ├── formations.json  # Catalogue formations
│   │   └── systemPrompt.txt # Prompt système ZIKA
│   ├── routes/
│   │   └── chat.js          # Endpoint POST /api/chat
│   ├── services/
│   │   ├── claudeService.js # Appels API Anthropic
│   │   └── faqMatcher.js    # Matching FAQ local
│   ├── Dockerfile
│   ├── index.js             # Serveur Express
│   └── package.json
├── nginx/
│   ├── nginx.conf           # Reverse proxy + SSL
│   └── ssl/                 # Certificats (à placer ici)
├── scripts/
│   └── deploy.sh            # Script de déploiement
├── .env.example             # Template des variables d'environnement
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 18 LTS |
| Docker | 24+ |
| Docker Compose | v2+ |
| Git | 2+ |

---

## Installation rapide

### 1. Cloner le projet

```bash
git clone https://github.com/ect-ci/zika-chatbot.git
cd zika-chatbot
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env   # ou vim .env
```

Remplir obligatoirement :

```env
ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_ICI
ALLOWED_ORIGINS=https://www.ect.ci,https://ect.ci
```

### 3. Obtenir la clé API Anthropic

1. Aller sur [console.anthropic.com](https://console.anthropic.com)
2. Créer un compte ou se connecter
3. **Settings → API Keys → Create Key**
4. Copier la clé (visible une seule fois) dans `.env`
5. Ajouter un moyen de paiement (facturation à l'usage)
6. Configurer une limite de dépense mensuelle (recommandé)

> ⚠️ La clé API ne doit **jamais** apparaître dans le code source ni être commitée sur Git.

### 4. Certificat SSL (production)

```bash
# Installer certbot
apt install certbot

# Obtenir le certificat (port 80 doit être libre)
certbot certonly --standalone -d chat.ect.ci

# Copier dans le dossier nginx/ssl/
cp /etc/letsencrypt/live/chat.ect.ci/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/chat.ect.ci/privkey.pem  nginx/ssl/
```

### 5. Déployer

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## Développement local

```bash
# Terminal 1 – Backend
cd server
npm install
cp ../.env.example .env   # puis remplir ANTHROPIC_API_KEY
node index.js

# Terminal 2 – Frontend
cd client
npm install
npm run dev
```

Le frontend Vite proxy automatiquement `/api/*` vers `http://localhost:3001`.

Ouvrir : [http://localhost:5173](http://localhost:5173)

---

## Architecture

```
Utilisateur
    │
    ▼
Widget React (ZikaChatbot.jsx)
    │   POST /api/chat  { message, contextHint }
    ▼
Backend Express (server/index.js)
    │
    ├── faqMatcher.js  ──→  Réponse FAQ locale (rapide, sans coût API)
    │
    └── claudeService.js ──→  API Claude Anthropic (si pas de match FAQ)
                                  │
                                  └── Réponse IA enrichie du contexte ECT
```

**Règle de priorité :**
1. Matching FAQ local (score ≥ 2) → réponse instantanée, 0 token consommé
2. Sinon → appel API Claude avec le prompt système ZIKA

---

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/chat` | Envoyer un message à ZIKA |
| `GET` | `/api/health` | Vérifier l'état du service |

### POST /api/chat

**Corps de la requête :**
```json
{
  "message": "Je cherche une formation en Supply Chain",
  "contextHint": "Thématique choisie : Achats & Supply Chain"
}
```

**Réponse :**
```json
{
  "reply": "ECT propose plusieurs formations en Supply Chain...",
  "source": "ai"
}
```

`source` peut être `"faq"`, `"ai"` ou `"error"`.

---

## Mise à jour de la FAQ

Éditer `server/data/faq.json` — aucun redémarrage nécessaire si le serveur relit le fichier.

Structure d'une entrée FAQ :
```json
{
  "theme": "Formation",
  "question": "Question telle qu'elle est posée en interne",
  "answer": "Réponse complète affichée à l'utilisateur.",
  "keywords": ["mot1", "mot2", "mot3"]
}
```

> Plus les `keywords` sont précis, plus la FAQ est sollicitée et moins l'API Claude est appelée (réduction des coûts).

---

## Commandes Docker utiles

```bash
# Voir l'état des services
docker compose ps

# Logs en temps réel
docker compose logs -f zika-backend

# Redémarrer un service
docker compose restart zika-backend

# Arrêter tout
docker compose down

# Reconstruire après modification du code
docker compose build zika-backend && docker compose up -d zika-backend
```

---

## Estimation des coûts API

| Scénario | Conversations/mois | Coût estimé/mois |
|----------|--------------------|------------------|
| Faible trafic | 500 | 5 – 15 $ |
| Trafic moyen | 2 000 | 20 – 60 $ |
| Fort trafic | 5 000+ | 50 – 150 $ |

> L'optimisation FAQ réduit les appels IA de 40 à 70 % selon la complétude de la base.

---

## Maintenance

| Fréquence | Action |
|-----------|--------|
| Quotidien | `docker compose logs` – vérifier les erreurs |
| Hebdomadaire | Revue des questions non résolues |
| Mensuel | Enrichir `faq.json` avec les nouvelles questions récurrentes |
| Trimestriel | Mettre à jour `systemPrompt.txt` si l'offre ECT évolue |
| Semestriel | `npm audit` + mise à jour des dépendances |

---

## Support

- **Développement & déploiement :** David Laurent Yéboué – david@agencerevelation.ci
- **Contenu & FAQ :** Équipe ECT – commercial@ect.ci
- **Urgence technique :** (+225) [à définir avec ECT]
