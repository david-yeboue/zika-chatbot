const FAQ_DATA = require('../data/faq.json');

/**
 * Normalise un texte : minuscules + suppression des diacritiques.
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Recherche la meilleure correspondance dans la base FAQ.
 *
 * Algorithme de scoring :
 *  +2 pts  par mot-clé exact trouvé dans le message
 *  +1 pt   par mot (>3 chars) de la question FAQ trouvé dans le message
 *
 * Seuil de validation : score >= 2
 *
 * @param {string} input  – message utilisateur brut
 * @returns {{ answer: string } | null}
 */
function matchFAQ(input) {
  const lower = normalize(input);
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of FAQ_DATA) {
    let score = 0;

    // Mots-clés définis
    for (const kw of (faq.keywords || [])) {
      if (lower.includes(normalize(kw))) score += 2;
    }

    // Mots de la question
    const questionWords = normalize(faq.question).split(/\s+/);
    for (const w of questionWords) {
      if (w.length > 3 && lower.includes(w)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

module.exports = { matchFAQ };
