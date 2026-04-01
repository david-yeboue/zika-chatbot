const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Chargement du prompt système une seule fois au démarrage
let SYSTEM_PROMPT = '';
try {
  SYSTEM_PROMPT = fs.readFileSync(
    path.join(__dirname, '../data/systemPrompt.txt'),
    'utf-8'
  );
} catch {
  console.warn('[claudeService] systemPrompt.txt introuvable – prompt par défaut utilisé.');
  SYSTEM_PROMPT = `Tu es ZIKA, l'assistant virtuel d'Eburnis Conseil & Technologies (ECT), cabinet d'audit, conseil et formation basé à Abidjan. Réponds toujours en français, de façon formelle mais chaleureuse. En cas de doute, redirige vers ect@ect.ci ou (+225) 21.50.00.41.57.`;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Envoie un message à l'API Claude et retourne la réponse texte.
 *
 * @param {string} userMessage   – message de l'utilisateur
 * @param {string} contextHint  – contexte additionnel (synthèse flux)
 * @returns {Promise<string>}
 */
async function askClaude(userMessage, contextHint = '') {
  const systemWithContext = contextHint
    ? `${SYSTEM_PROMPT}\n\nCONTEXTE ADDITIONNEL :\n${contextHint}`
    : SYSTEM_PROMPT;

  const response = await client.messages.create({
    model     : process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: parseInt(process.env.MAX_TOKENS || '1024'),
    system    : systemWithContext,
    messages  : [{ role: 'user', content: userMessage }],
  });

  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
    || 'Je suis désolé, je n\'ai pas pu traiter votre demande. Veuillez contacter ECT directement.';
}

module.exports = { askClaude };
