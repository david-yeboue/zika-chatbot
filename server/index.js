import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Sécurité ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({ limit: "10kb" }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://chat.ect.ci").split(",");
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error("CORS refusé"));
  }
}));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Trop de requêtes. Réessayez dans une minute." }
}));

// ─── Anthropic ─────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

// ─── FAQ ───────────────────────────────────────────────────────────────────
let faqData = [];
try {
  const raw = fs.readFileSync(path.join(__dirname, "data", "faq.json"), "utf-8");
  faqData = JSON.parse(raw);
  console.log(`✅ FAQ chargée : ${faqData.length} entrées`);
} catch (e) {
  console.error("⚠️ FAQ non chargée :", e.message);
}

function findFAQMatch(userMsg) {
  const lower = userMsg.toLowerCase();
  let best = null, bestScore = 0;
  for (const entry of faqData) {
    let score = 0;
    const keywords = Array.isArray(entry.keywords)
      ? entry.keywords
      : (entry.keywords || "").toLowerCase().split(",").map(k => k.trim());
    for (const kw of keywords) {
      if (kw && lower.includes(kw)) score++;
    }
    // Bonus si la question elle-même apparaît
    if (lower.includes(entry.question.toLowerCase().slice(0, 20))) score += 3;
    if (score > bestScore && score >= 2) { bestScore = score; best = entry; }
  }
  return best;
}

// Sélectionne les 3 entrées FAQ les plus proches pour le contexte IA
function getFAQContext(userMsg) {
  const lower = userMsg.toLowerCase();
  const scored = faqData.map(entry => {
    const keywords = Array.isArray(entry.keywords)
      ? entry.keywords
      : (entry.keywords || "").toLowerCase().split(",").map(k => k.trim());
    const score = keywords.filter(kw => kw && lower.includes(kw)).length;
    return { entry, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  return scored.map(x =>
    `Q: ${x.entry.question}\nR: ${x.entry.answer}`
  ).join("\n\n---\n\n");
}

// ─── Prompt système EXPERT + COMMERCIAL ───────────────────────────────────
const SYSTEM_PROMPT = `Tu es ZIKA, l'assistant expert d'Eburnis Conseil & Technologies (ECT), cabinet d'audit, conseil et formation basé à Abidjan, Côte d'Ivoire.

DOUBLE RÔLE — RÈGLE ABSOLUE :
1. EXPERT D'ABORD : réponds réellement à la question posée. Si quelqu'un demande ce qu'est la matrice de Kraljic, explique-la clairement. Si quelqu'un demande la différence entre CAIP et CAIM, explique-la. Ne contourne JAMAIS une question technique par une présentation d'ECT.
2. COMMERCIAL ENSUITE : une fois la réponse donnée, relie-la naturellement à l'offre ECT ("ECT applique cette méthode dans ses diagnostics", "notre outil EMA vous aide à...").

OUTILS ECT (source de vérité — cite-les avec précision) :
- EMA : diagnostic maturité de la fonction Achats (gouvernance, processus, compétences) → feuille de route
- PSA : auto-évaluation compétences acheteurs vs meilleures pratiques → plan de formation ciblé
- ENVA : stratégie d'achats durables et responsables (RSE, critères environnementaux)
- Sectinel Upstream : visibilité du flux amont fournisseurs → entreprise
- Sectinel i55 : gestion des actifs selon ISO 55001 (identifier, valoriser, renouveler)
- Sectinel i28 : mesures de sûreté Supply Chain (ISO 28000)
- SAFE Supplier : gestion pragmatique des risques fournisseurs
- Stock Skills : évaluation compétences gestionnaires de stocks + plans de progrès
- KM-360 : identification et préservation des connaissances critiques

RÈGLES :
- Réponds en français, avec précision et clarté
- Ne jamais inventer de tarifs, dates ou disponibilités → rediriger vers commercial@ect.ci
- Réponses concises mais substantielles (3-6 phrases pour les questions techniques)
- Toujours terminer par une proposition d'action concrète liée à ECT
- Si la question dépasse tes données : proposer un contact expert

CONTACTS ECT :
📞 (+225) 21.50.00.41.57 / 05.75.98.50.50
📧 commercial@ect.ci | ect@ect.ci
🌐 www.ect.ci | chat.ect.ci`;

// ─── Route principale : /api/chat ─────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { message, contextHint = "" } = req.body;
    if (!message || typeof message !== "string" || message.length > 2000) {
      return res.status(400).json({ error: "Message invalide." });
    }

    // 1. Tentative FAQ stricte
    const faqMatch = findFAQMatch(message);
    if (faqMatch) {
      console.log(`[FAQ MATCH] "${message.slice(0, 40)}" → ${faqMatch.question.slice(0, 40)}`);
      return res.json({ reply: faqMatch.answer, source: "faq" });
    }

    // 2. Contexte FAQ pour enrichir l'IA (RAG niveau 1)
    const faqContext = getFAQContext(message);
    const contextBlock = faqContext
      ? `\n\nENTRÉES FAQ ECT PERTINENTES (utilise-les comme référence) :\n${faqContext}`
      : "";

    // 3. Historique conversationnel (mémoire session)
    const historyBlock = contextHint
      ? `\n\nCONTEXTE DE LA CONVERSATION :\n${contextHint}`
      : "";

    // 4. Appel Claude avec prompt expert
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT + contextBlock + historyBlock,
      messages: [{ role: "user", content: message }],
    });

    const reply = response.content[0]?.text || "Je n'ai pas pu générer une réponse. Contactez-nous à commercial@ect.ci.";
    console.log(`[AI] "${message.slice(0, 40)}" → ${reply.slice(0, 60)}...`);
    res.json({ reply, source: "ai" });

  } catch (err) {
    console.error("[ERROR /api/chat]", err.message);
    res.status(500).json({
      reply: "Une erreur est survenue. Contactez-nous directement : commercial@ect.ci ou (+225) 21.50.00.41.57.",
      source: "error"
    });
  }
});

// ─── Route capture leads : /api/lead ──────────────────────────────────────
app.post("/api/lead", async (req, res) => {
  try {
    const { nom, email, telephone, secteur, ca, problematique, source, date } = req.body;
    if (!email || !nom) return res.status(400).json({ error: "Nom et email requis." });

    const leadText = `
🎯 NOUVEAU LEAD ZIKA — ${date || new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Nom       : ${nom}
📧 Email     : ${email}
📞 Téléphone : ${telephone || "Non fourni"}
🏭 Secteur   : ${secteur || "Non précisé"}
💰 CA        : ${ca || "Non précisé"}
❓ Problème  : ${problematique || "Non précisé"}
📍 Source    : ${source || "ZIKA Chat"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    console.log("[LEAD CAPTÉ]\n" + leadText);

    // Envoi email si configuré
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"ZIKA — ECT" <${process.env.SMTP_USER}>`,
        to: process.env.LEAD_EMAIL || "commercial@ect.ci",
        subject: `[ZIKA] Nouveau lead : ${nom} — ${secteur}`,
        text: leadText,
        html: `<pre style="font-family:monospace">${leadText}</pre>`,
      });
      console.log(`[LEAD EMAIL] Envoyé à ${process.env.LEAD_EMAIL || "commercial@ect.ci"}`);
    }

    res.json({ success: true, message: "Lead enregistré." });
  } catch (err) {
    console.error("[ERROR /api/lead]", err.message);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du lead." });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", faq: faqData.length }));

app.listen(PORT, () => console.log(`🚀 ZIKA backend — port ${PORT} — ${faqData.length} FAQ`));