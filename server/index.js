import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({ limit: "20kb" }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://chat.ect.ci").split(",");
app.use(cors({ origin: (origin, cb) => (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error("CORS refusé")) }));
app.use(rateLimit({ windowMs: 60000, max: 30, message: { error: "Trop de requêtes." } }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

// ─── Chargement FAQ ────────────────────────────────────────────────────────────
let faqData = [];
try {
  faqData = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "faq.json"), "utf-8"));
  console.log(`✅ FAQ : ${faqData.length} entrées`);
} catch (e) { console.error("FAQ non chargée :", e.message); }

function findFAQMatch(userMsg) {
  const lower = userMsg.toLowerCase().trim();
  let best = null, bestScore = 0;

  for (const entry of faqData) {
    const kws = Array.isArray(entry.keywords)
      ? entry.keywords
      : (entry.keywords || "").toLowerCase().split(",").map(k => k.trim()).filter(Boolean);

    let score = 0;

    // Score par mots-clés
    const kwMatches = kws.filter(kw => kw.length > 3 && lower.includes(kw));
    score += kwMatches.length;

    // Bonus fort si la question utilisateur ressemble à la question FAQ
    const faqQ = entry.question.toLowerCase();
    const faqWords = faqQ.replace(/[?]/g, "").split(/\s+/).filter(w => w.length > 3);
    const userWords = lower.split(/\s+/).filter(w => w.length > 3);
    const questionOverlap = faqWords.filter(w => userWords.includes(w)).length;
    if (questionOverlap >= 3) score += 4;
    else if (questionOverlap >= 2) score += 2;

    // Seuil élevé : 5 minimum pour éviter les faux positifs
    if (score > bestScore && score >= 5) {
      bestScore = score;
      best = entry;
    }
  }
  return best;
}

function getFAQContext(userMsg) {
  const lower = userMsg.toLowerCase();
  return faqData.map(e => {
    const kws = Array.isArray(e.keywords) ? e.keywords : (e.keywords || "").split(",").map(k => k.trim()).filter(Boolean);
    const score = kws.filter(kw => kw.length > 3 && lower.includes(kw)).length;
    return { e, score };
  }).filter(x => x.score >= 2).sort((a, b) => b.score - a.score).slice(0, 3)
    .map(x => `[Référence ECT — thème : ${x.e.theme}]\nQ : ${x.e.question}\nR : ${x.e.answer}`)
    .join("\n\n---\n\n");
}

// ─── PROMPT SYSTÈME — EXPERT + COMMERCIAL ────────────────────────────────────
const SYSTEM_PROMPT = `Tu es ZIKA, l'assistant expert d'Eburnis Conseil & Technologies (ECT).
ECT est un cabinet d'audit, conseil et formation basé à Abidjan, spécialisé en Achats, Supply Chain, QHSE, Asset Management et Lean Management.

══ RÈGLE ABSOLUE N°1 — RÉPONDRE EXACTEMENT À LA QUESTION ══
Lis attentivement la question. Réponds UNIQUEMENT à ce qui est demandé. Ne réponds pas à une autre question.

══ RÈGLE N°2 — DOUBLE RÔLE ══
1. EXPERT D'ABORD : réponds toujours RÉELLEMENT à la question posée.
   - Si on demande ce qu'est la matrice de Kraljic → explique-la clairement en 3-4 phrases.
   - Si on demande la différence entre CAIP et CAIM → explique-la.
   - Si on demande comment réduire les stocks → donne des méthodes concrètes (ABC, EOQ, juste-à-temps…).
   - Si on demande sur un outil ECT → décris-le précisément.
   Ne JAMAIS ignorer une question pour ouvrir un menu ou présenter ECT.
2. COMMERCIAL ENSUITE : après avoir répondu, relie naturellement à l'offre ECT.
   Exemple : "ECT applique cette méthode dans ses diagnostics — souhaitez-vous qu'un consultant vous accompagne ?"

══ OUTILS ECT PROPRIÉTAIRES ══
- EMA : diagnostic de maturité de la fonction Achats (gouvernance, processus, compétences) → feuille de route d'amélioration
- PSA : auto-évaluation des compétences des acheteurs vs meilleures pratiques → plan de formation ciblé
- ENVA : stratégie d'achats durables et responsables (RSE, critères environnementaux et sociaux)
- Sectinel Upstream : visibilité précise et dynamique du flux amont (fournisseur → entreprise)
- Sectinel i55 : gestion des actifs selon ISO 55001 (identifier, valoriser, renouveler de façon proactive)
- Sectinel i28 : mesures de sûreté tout au long de la Supply Chain (ISO 28000)
- SAFE Supplier : gestion pragmatique des risques fournisseurs (cartographier, évaluer, prioriser, traiter)
- Stock Skills : évaluation des compétences des gestionnaires de stocks + plans de progrès
- KM-360 : identification et préservation des connaissances critiques (savoir et savoir-faire)

══ FORMATIONS ECT ══
6 types : Certificats Professionnels (30-50h, 5 filières), Certificats Pratiques (40h), Séminaires Intra/Inter (2-3j), Formations à la Carte (1-5j, 70+ thèmes), Séminaires Internationaux (11 programmes, Paris/Dubaï/Casablanca), Certifications PECB ISO (12 mois max, 14 normes dont CAIP/CAIM).
Agrément FDFP. Catalogue : https://catalogue-formations-ect-2026.netlify.app/

══ CONSEIL & AUDIT ══
- Audit Supply Chain (ISO 28000:2022), audit fournisseur, audit de maturité
- Accompagnement certifications ISO : 9001, 14001, 22301, 27001, 28000, 31000, 45001, 50001, 55001
- Élaboration PCA, plans de sûreté, politique RSE
- Diagnostics Achats, Supply Chain, Lean, Asset Management

══ PORTAGE SALARIAL ══
ECT prend en charge toutes les formalités : feuilles de temps, bulletins de paie, congés, CNPS/CMU, charges sociales. Avantages : accès rapide aux experts, gestion simplifiée, maîtrise budgétaire, évaluation avant embauche.

══ RÈGLES DE RÉPONSE ══
- Réponds en français, avec précision et expertise
- Ne jamais inventer tarifs ni dates → renvoyer à commercial@ect.ci
- Réponses de 3-6 phrases pour les questions techniques ; plus courtes pour les demandes simples
- Toujours proposer une action concrète en fin de réponse
- Si tu ne sais pas → l'admettre et proposer un expert ECT

══ CONTACTS ECT ══
📞 (+225) 21.50.00.41.57 / 05.75.98.50.50 | 📧 commercial@ect.ci | ect@ect.ci
🌐 www.ect.ci | 💬 WhatsApp : https://wa.me/2250575985050
🏢 Route de Bingerville, Quartier Ayopoumin, Abidjan — BP 1636 Abidjan 22
RCCM : CI-ABJ-2013-B-4423 | Agréé FDFP | PECB Authorized Partner`;

// ─── /api/chat ────────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ error: "Messages invalides." });

    // Message utilisateur le plus récent
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";

    // 1. Tentative FAQ stricte (économise des tokens)
    const faqMatch = findFAQMatch(lastUserMsg);
    if (faqMatch) {
      console.log(`[FAQ] "${lastUserMsg.slice(0, 40)}" → match`);
      return res.json({ reply: faqMatch.answer, source: "faq" });
    }

    // 2. Enrichir le système avec les entrées FAQ pertinentes (RAG niveau 1)
    const faqCtx = getFAQContext(lastUserMsg);
    const systemWithCtx = faqCtx
      ? `${SYSTEM_PROMPT}\n\n══ RÉFÉRENCES ECT PERTINENTES (utilise UNIQUEMENT si la question porte sur ce sujet) ══\n${faqCtx}\n\nATTENTION : Ces références ne sont là qu'en appui. Réponds toujours DIRECTEMENT à ce que l'utilisateur a demandé.`
      : SYSTEM_PROMPT;

    // 3. Appel Claude avec historique complet
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: parseInt(process.env.MAX_TOKENS || "1024"),
      system: systemWithCtx,
      messages: messages.slice(-10), // max 10 tours pour le contexte
    });

    const reply = response.content[0]?.text
      || "Je n'ai pas pu générer une réponse. Contactez-nous à commercial@ect.ci.";
    console.log(`[AI] "${lastUserMsg.slice(0, 40)}" → ${reply.slice(0, 60)}...`);
    res.json({ reply, source: "ai" });

  } catch (err) {
    console.error("[ERROR /api/chat]", err.message);
    res.status(500).json({
      reply: "Une erreur est survenue. Contactez-nous : commercial@ect.ci ou (+225) 21.50.00.41.57.",
      source: "error"
    });
  }
});

// ─── /api/lead — capture des coordonnées prospects ───────────────────────────
app.post("/api/lead", async (req, res) => {
  try {
    const { nom, email, telephone, secteur, ca, problematique, source, date } = req.body;
    if (!email || !nom) return res.status(400).json({ error: "Nom et email requis." });

    const log = `[LEAD] ${date} | ${nom} | ${email} | ${telephone} | ${secteur} | ${ca} | ${problematique} | ${source}`;
    console.log(log);

    // Email de notification si SMTP configuré
    if (process.env.SMTP_HOST) {
      const { default: nodemailer } = await import("nodemailer");
      const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: 587, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await t.sendMail({
        from: `"ZIKA ECT" <${process.env.SMTP_USER}>`,
        to: process.env.LEAD_EMAIL || "commercial@ect.ci",
        subject: `[ZIKA] Nouveau lead : ${nom}`,
        text: `Nom: ${nom}\nEmail: ${email}\nTél: ${telephone}\nSecteur: ${secteur}\nCA: ${ca}\nProblème: ${problematique}\nSource: ${source}\nDate: ${date}`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[ERROR /api/lead]", err.message);
    res.status(500).json({ error: "Erreur lead." });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok", faq: faqData.length, model: MODEL }));
app.listen(PORT, () => console.log(`🚀 ZIKA v10 — port ${PORT} — ${faqData.length} FAQ`));