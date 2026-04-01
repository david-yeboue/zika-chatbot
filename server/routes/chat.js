const express    = require('express');
const router     = express.Router();
const { matchFAQ } = require('../services/faqMatcher');
const { askClaude } = require('../services/claudeService');

/**
 * POST /api/chat
 *
 * Body attendu :
 * {
 *   message     : string   (obligatoire)
 *   contextHint : string   (optionnel – synthèse du flux en cours côté client)
 * }
 *
 * Réponse :
 * {
 *   reply  : string
 *   source : 'faq' | 'ai' | 'error'
 * }
 */
router.post('/chat', async (req, res) => {
  const { message, contextHint } = req.body;

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Le champ "message" est requis.' });
  }
  if (message.trim().length > 1000) {
    return res.status(400).json({ error: 'Message trop long (max 1000 caractères).' });
  }

  const userMsg = message.trim();

  try {
    // ── 1. Tentative de matching FAQ local ─────────────────────────────────
    const faqResult = matchFAQ(userMsg);
    if (faqResult) {
      return res.json({ reply: faqResult.answer, source: 'faq' });
    }

    // ── 2. Fallback IA (API Claude) ────────────────────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: 'Service IA non configuré. Contactez ECT au (+225) 21.50.00.41.57.',
        source: 'error',
      });
    }

    const reply = await askClaude(userMsg, contextHint || '');
    return res.json({ reply, source: 'ai' });

  } catch (err) {
    console.error('[/api/chat] Erreur :', err.message);
    return res.status(500).json({
      reply : 'Une erreur est survenue. Veuillez réessayer ou contacter ECT directement au (+225) 21.50.00.41.57.',
      source: 'error',
    });
  }
});

module.exports = router;
