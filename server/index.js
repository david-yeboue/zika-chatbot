require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');
const chatRouter = require('./routes/chat');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Sécurité ──────────────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les appels sans origin (curl, Postman, mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqué pour l'origine : ${origin}`));
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs : parseInt(process.env.RATE_LIMIT_WINDOW  || '60000'),  // 1 minute
  max      : parseInt(process.env.RATE_LIMIT_MAX     || '30'),     // 30 req/min
  standardHeaders: true,
  legacyHeaders  : false,
  message: { error: 'Trop de requêtes. Veuillez patienter une minute.' },
});
app.use('/api/', limiter);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', chatRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status : 'ok',
    service: 'ZIKA Backend',
    version: '1.0.0',
    uptime : Math.floor(process.uptime()) + 's',
  });
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

// Erreur globale
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

// ── Démarrage ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ ZIKA Backend démarré sur le port ${PORT}`);
  console.log(`   Mode        : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Origines    : ${allowedOrigins.join(', ')}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY manquante — les appels IA seront refusés.');
  }
});
