import { useState, useRef, useEffect, useCallback } from "react";

// ─── Config logo ──────────────────────────────────────────────────────────────
// Pour utiliser le vrai logo ECT, remplacer null par le chemin :
// exemple : "/logo-ect.png"  (fichier à placer dans client/public/)
const ECT_LOGO_URL = "/Logo_ect.png";

const THEMATIQUES = [
  "Achats & Supply Chain",
  "QHSE",
  "Asset Management",
  "Digital & IA",
  "RH & Management",
];

// ─── Appel Backend ────────────────────────────────────────────────────────────
async function callBackend(message, contextHint = "") {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, contextHint }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur ${res.status}`);
    }
    const data = await res.json();
    return data.reply || "Je suis désolé, je n'ai pas obtenu de réponse. Veuillez contacter ECT au (+225) 21.50.00.41.57.";
  } catch {
    return "Une erreur de connexion est survenue. Veuillez réessayer ou nous contacter directement au (+225) 21.50.00.41.57 ou à ect@ect.ci.";
  }
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const BotIcon = ({ s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="3"/>
    <circle cx="9" cy="16" r="1.2" fill="currentColor"/>
    <circle cx="15" cy="16" r="1.2" fill="currentColor"/>
    <path d="M8.5 7.5C8.5 4.5 12 2 12 2s3.5 2.5 3.5 5.5"/>
    <line x1="12" y1="2" x2="12" y2="11"/>
  </svg>
);
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
  </svg>
);
const SparkleIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z"/>
  </svg>
);

const quickIcons = {
  "Nos formations": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  "Demander un conseil": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  "Nos outils d'audit": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  "Nous contacter": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.07 6.07l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
};

const quickDesc = {
  "Nos formations":      "Explorer le catalogue 2026",
  "Demander un conseil": "Audit & diagnostic personnalisé",
  "Nos outils d'audit":  "Sectinel, SAFE Supplier…",
  "Nous contacter":      "RDV, téléphone & adresse",
};

// ─── Logo ECT ─────────────────────────────────────────────────────────────────
function ECTLogo() {
  if (ECT_LOGO_URL) {
    return (
      <div style={{
        background: "#FFFFFF",
        borderRadius: 12,
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        flexShrink: 0,
        boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
        border: "1px solid rgba(255,255,255,0.4)",
      }}>
        <img
          src={ECT_LOGO_URL}
          alt="Logo ECT"
          style={{
            height: 36,
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
          onError={e => { e.currentTarget.closest("div").style.display = "none"; }}
        />
      </div>
    );
  }
  // Fallback — icône robot si pas de logo
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 13,
      background: "rgba(255,255,255,0.18)",
      border: "1.5px solid rgba(255,255,255,0.28)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#FFF", flexShrink: 0,
    }}>
      <BotIcon s={22} />
    </div>
  );
}

// ─── Formatage texte ──────────────────────────────────────────────────────────
function formatText(text) {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
    const isBullet = line.startsWith("•") || line.startsWith("📞") ||
                     line.startsWith("📧") || line.startsWith("🏢") ||
                     line.startsWith("🌐");
    return (
      <div key={i} style={{
        marginBottom: isBullet ? 4 : 2,
        lineHeight: 1.65,
        paddingLeft: line.startsWith("•") ? 4 : 0,
      }}>
        {line}
      </div>
    );
  });
}

// ─── Composant Principal ──────────────────────────────────────────────────────
export default function ZikaChatbot() {
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [isLoading,    setIsLoading]    = useState(false);
  const [flowState,    setFlowState]    = useState(null);
  const [showWelcome,  setShowWelcome]  = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((role, content, options = null) => {
    setMessages(prev => [...prev, { role, content, options }]);
  }, []);

  const processMessage = useCallback(async (text) => {
    const lower = text.toLowerCase();

    if (flowState) {
      if (flowState.type === "conseil") {
        const d = { ...flowState.data };
        if (flowState.step === 1) {
          d.secteur = text;
          setFlowState({ type: "conseil", step: 2, data: d });
          addMessage("bot", "Merci. Quel est le chiffre d'affaires annuel approximatif de votre structure ?",
            ["Moins de 500 M FCFA", "500 M – 2 Mds FCFA", "2 – 10 Mds FCFA", "Plus de 10 Mds FCFA"]);
          return;
        }
        if (flowState.step === 2) {
          d.ca = text;
          setFlowState({ type: "conseil", step: 3, data: d });
          addMessage("bot", "Parfait. Quelle est la problématique principale que vous rencontrez ?");
          return;
        }
        if (flowState.step === 3) {
          d.problematique = text;
          setFlowState(null);
          setIsLoading(true);
          const synthese = `• Secteur : ${d.secteur}\n• CA : ${d.ca}\n• Problématique : ${d.problematique}`;
          const reply = await callBackend(
            `Un prospect a complété un diagnostic ECT :\n${synthese}\n\nRécapitule, propose un axe d'analyse et invite à prendre RDV.`,
            synthese
          );
          setIsLoading(false);
          addMessage("bot", reply);
          return;
        }
      }
      if (flowState.type === "formation" && flowState.step === 1) {
        setFlowState(null);
        setIsLoading(true);
        const reply = await callBackend(
          `Un prospect cherche une formation en "${text}" chez ECT. Présente les types disponibles et invite à contacter commercial@ect.ci.`,
          `Thématique : ${text}`
        );
        setIsLoading(false);
        addMessage("bot", reply);
        return;
      }
    }

    if (lower.match(/(conseil|diagnostic|audit|accompagn|certif|iso)/)) {
      setFlowState({ type: "conseil", step: 1, data: {} });
      addMessage("bot",
        "Je vais recueillir quelques informations pour orienter votre demande.\n\nDans quel secteur d'activité évolue votre entreprise ?",
        ["Industrie / Manufacture", "Commerce / Distribution", "Services / Tertiaire", "Énergie / Mines", "BTP / Immobilier", "Autre"]
      );
      return;
    }
    if (lower.match(/(formation|séminaire|certificat|apprendre|cours|programme|inscription|inscrire)/)) {
      setFlowState({ type: "formation", step: 1, data: {} });
      addMessage("bot", "Très bien ! Dans quelle thématique souhaitez-vous vous former ?", THEMATIQUES);
      return;
    }
    if (lower.match(/(contact|rdv|rendez.vous|appel|téléphone|joindre|parler)/)) {
      addMessage("bot",
        "Vous pouvez nous joindre par les canaux suivants :\n\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50\n📧 ect@ect.ci — commercial@ect.ci\n🏢 Route de Bingerville, Quartier Ayopoumin, Abidjan\n🌐 www.ect.ci",
        ["Service commercial", "Service formation", "Direction générale"]
      );
      return;
    }

    setIsLoading(true);
    const reply = await callBackend(text);
    setIsLoading(false);
    addMessage("bot", reply);
  }, [flowState, addMessage]);

  const handleSend = useCallback(async (text = null) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setShowWelcome(false);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    addMessage("user", msg);
    await processMessage(msg);
  }, [input, isLoading, addMessage, processMessage]);

  const handleOption = useCallback(async (opt) => {
    if (isLoading) return;
    setShowWelcome(false);
    addMessage("user", opt);
    await processMessage(opt);
  }, [isLoading, addMessage, processMessage]);

  const handleReset = useCallback(() => {
    setMessages([]); setFlowState(null);
    setShowWelcome(true); setIsLoading(false);
  }, []);

  const quickActions = ["Nos formations", "Demander un conseil", "Nos outils d'audit", "Nous contacter"];

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: 'Plus Jakarta Sans', sans-serif; }

        .zk { font-family:'Plus Jakarta Sans',system-ui,sans-serif; width:100%; max-width:460px;
          height:100vh; max-height:800px; display:flex; flex-direction:column;
          background:#FAFAF8; border-radius:24px; overflow:hidden; margin:0 auto;
          box-shadow:0 32px 80px rgba(0,0,0,0.13),0 8px 32px rgba(232,105,11,0.07); }

        /* HEADER */
        .zk-header {
          background:linear-gradient(140deg,#F07020 0%,#C85000 100%);
          height:74px; padding:0 18px; display:flex; align-items:center; gap:14px;
          position:relative; overflow:hidden; flex-shrink:0;
        }
        .zk-header::before { content:''; position:absolute; top:-50px; right:-50px;
          width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.07); }
        .zk-header::after  { content:''; position:absolute; bottom:-40px; left:35%;
          width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.04); }

        .hd-logo { z-index:1; flex-shrink:0; }
        .hd-sep  { width:1px; height:34px; background:rgba(255,255,255,0.22); z-index:1; }
        .hd-text { flex:1; z-index:1; }
        .hd-name { font-family:'Syne',sans-serif; font-weight:800; font-size:21px;
          color:#FFF; letter-spacing:2.5px; display:flex; align-items:center; gap:8px; }
        .hd-badge { font-size:9px; font-weight:600; background:rgba(255,255,255,0.17);
          color:rgba(255,255,255,0.88); border:1px solid rgba(255,255,255,0.25);
          padding:2px 9px; border-radius:20px; letter-spacing:0.5px; font-family:'Plus Jakarta Sans',sans-serif; }
        .hd-sub  { color:rgba(255,255,255,0.72); font-size:11px; font-weight:400;
          margin-top:3px; letter-spacing:0.3px; }
        .hd-status { display:flex; align-items:center; gap:5px;
          color:rgba(255,255,255,0.78); font-size:10px; margin-top:4px; }
        .hd-dot { width:6px; height:6px; border-radius:50%; background:#4ADE80;
          box-shadow:0 0 7px #4ADE80; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }

        .hd-btn { margin-left:auto; z-index:1; width:36px; height:36px;
          background:rgba(255,255,255,0.13); border:1px solid rgba(255,255,255,0.2);
          border-radius:10px; cursor:pointer; color:#FFF;
          display:flex; align-items:center; justify-content:center;
          transition:all .2s; flex-shrink:0; }
        .hd-btn:hover { background:rgba(255,255,255,0.24); transform:rotate(180deg); }

        /* MESSAGES */
        .zk-msgs { flex:1; overflow-y:auto; padding:20px 16px 10px;
          display:flex; flex-direction:column; gap:14px; }
        .zk-msgs::-webkit-scrollbar { width:3px; }
        .zk-msgs::-webkit-scrollbar-thumb { background:#E2DDD8; border-radius:4px; }

        /* WELCOME */
        .welcome { display:flex; flex-direction:column; align-items:center;
          flex:1; padding:8px 6px 18px; gap:20px;
          animation:fadeUp .5s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .w-avatar { width:72px; height:72px; border-radius:22px;
          background:linear-gradient(145deg,#E8690B,#F5A03B);
          display:flex; align-items:center; justify-content:center; color:#FFF;
          box-shadow:0 12px 38px rgba(232,105,11,0.33),0 0 0 8px rgba(232,105,11,0.09); }

        .w-title { font-family:'Syne',sans-serif; font-size:23px; font-weight:800;
          color:#181818; text-align:center; line-height:1.25; }
        .w-title span { color:#E8690B; }
        .w-sub { font-size:12.5px; color:#999; margin-top:6px; text-align:center;
          line-height:1.65; font-weight:400; }

        .w-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; width:100%; }
        .w-card { background:#FFF; border:1.5px solid #EDEAE6; border-radius:16px;
          padding:15px 13px; cursor:pointer; text-align:left;
          transition:all .25s ease; box-shadow:0 2px 8px rgba(0,0,0,0.035); }
        .w-card:hover { border-color:#E8690B; box-shadow:0 6px 22px rgba(232,105,11,0.13);
          transform:translateY(-3px); }
        .w-card-icon { width:42px; height:42px; border-radius:12px;
          background:linear-gradient(145deg,#FFF3EB,#FFE4CC);
          display:flex; align-items:center; justify-content:center;
          color:#E8690B; margin-bottom:10px; }
        .w-card-label { font-size:12.5px; font-weight:700; color:#181818; margin-bottom:3px; }
        .w-card-desc  { font-size:10.5px; color:#AAAAAA; font-weight:400; }

        .w-footer { display:flex; align-items:center; gap:5px;
          color:#CCCCCC; font-size:10px; font-weight:500; }

        /* BULLES */
        .msg-row { display:flex; gap:9px; align-items:flex-end;
          animation:msgIn .3s ease; }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .msg-row.user { flex-direction:row-reverse; }

        .msg-av { width:30px; height:30px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; margin-bottom:2px; }
        .msg-av.bot  { background:linear-gradient(145deg,#E8690B,#F5A03B); color:#FFF; }
        .msg-av.user { background:#1C1C1C; color:#FFF; }

        .msg-wrap { max-width:83%; display:flex; flex-direction:column; gap:8px; }

        .msg-bbl { padding:11px 15px; font-size:13.5px; line-height:1.65; border-radius:18px; }
        .msg-bbl.bot  { background:#FFF; color:#252525; border-radius:18px 18px 18px 4px;
          border:1px solid #EFECEA; box-shadow:0 2px 10px rgba(0,0,0,0.045); }
        .msg-bbl.user { background:linear-gradient(145deg,#E8690B,#C85000); color:#FFF;
          border-radius:18px 18px 4px 18px; box-shadow:0 4px 16px rgba(232,105,11,0.27); }

        .opts { display:flex; flex-wrap:wrap; gap:7px; }
        .opt-btn { background:#FFF; border:1.5px solid #E8E3DE; border-radius:22px;
          padding:7px 14px; font-size:12px; font-weight:500; color:#555;
          cursor:pointer; transition:all .2s; white-space:nowrap; }
        .opt-btn:hover { border-color:#E8690B; color:#E8690B; background:#FFF8F2; }

        /* LOADING */
        .loading { display:flex; gap:9px; align-items:flex-end; }
        .loading-bbl { background:#FFF; border-radius:18px 18px 18px 4px;
          padding:13px 18px; display:flex; gap:5px;
          border:1px solid #EFECEA; box-shadow:0 2px 10px rgba(0,0,0,0.045); }
        .dot { width:7px; height:7px; border-radius:50%; background:#E8690B;
          opacity:.3; animation:bnc 1.2s ease-in-out infinite; }
        .dot:nth-child(2){animation-delay:.15s} .dot:nth-child(3){animation-delay:.3s}
        @keyframes bnc { 0%,60%,100%{transform:translateY(0);opacity:.3}
          30%{transform:translateY(-7px);opacity:1} }

        /* INPUT */
        .zk-input { padding:11px 14px 15px; background:#FFF;
          border-top:1px solid #EFECEA; flex-shrink:0; }
        .inp-wrap { display:flex; align-items:flex-end; gap:10px;
          background:#F6F4F1; border-radius:18px; padding:8px 8px 8px 18px;
          border:1.5px solid #ECEAE6; transition:border-color .2s, box-shadow .2s; }
        .inp-wrap.focus { border-color:#E8690B; box-shadow:0 0 0 3px rgba(232,105,11,0.09); }
        .zk-ta { flex:1; border:none; outline:none; background:transparent; resize:none;
          font-size:14px; line-height:1.5; font-family:'Plus Jakarta Sans',sans-serif;
          color:#252525; padding:5px 0; max-height:120px; min-height:24px; }
        .zk-ta::placeholder { color:#BBBBBB; }
        .send { width:40px; height:40px; border-radius:13px; border:none;
          cursor:pointer; flex-shrink:0; display:flex; align-items:center;
          justify-content:center; transition:all .22s; }
        .send.on  { background:linear-gradient(145deg,#E8690B,#C85000); color:#FFF;
          box-shadow:0 4px 14px rgba(232,105,11,0.33); }
        .send.on:hover { transform:scale(1.06); }
        .send.off { background:#E5E2DF; color:#BBBBBB; cursor:default; }
        .inp-footer { display:flex; align-items:center; justify-content:center; gap:5px;
          margin-top:8px; color:#CCCCCC; font-size:10px; font-weight:500; letter-spacing:.3px; }
      `}</style>

      <div className="zk">

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="zk-header">
          <div className="hd-logo"><ECTLogo /></div>
          <div className="hd-sep" />
          <div className="hd-text">
            <div className="hd-name">
              ZIKA <span className="hd-badge">by ECT</span>
            </div>
            <div className="hd-sub">Assistant Conseil • Formation • Support</div>
            <div className="hd-status">
              <div className="hd-dot" /> En ligne
            </div>
          </div>
          <button className="hd-btn" onClick={handleReset} title="Nouvelle conversation">
            <RefreshIcon />
          </button>
        </div>

        {/* ── MESSAGES ──────────────────────────────────────────────────── */}
        <div className="zk-msgs">

          {showWelcome && (
            <div className="welcome">
              <div className="w-avatar"><BotIcon s={34} /></div>
              <div style={{ textAlign: "center" }}>
                <div className="w-title">Bienvenue !<br />Je suis <span>Zika</span></div>
                <div className="w-sub">
                  Votre assistant ECT. Je vous accompagne<br />
                  en conseil, formation et bien plus encore.
                </div>
              </div>
              <div className="w-grid">
                {quickActions.map((label, i) => (
                  <button key={i} className="w-card" onClick={() => handleOption(label)}>
                    <div className="w-card-icon">{quickIcons[label]}</div>
                    <div className="w-card-label">{label}</div>
                    <div className="w-card-desc">{quickDesc[label]}</div>
                  </button>
                ))}
              </div>
              <div className="w-footer">
                <SparkleIcon />
                Propulsé par l'IA · Eburnis Conseil & Technologies
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`msg-row ${msg.role}`}>
              <div className={`msg-av ${msg.role}`}>
                {msg.role === "bot" ? <BotIcon s={15} /> : <UserIcon />}
              </div>
              <div className="msg-wrap">
                <div className={`msg-bbl ${msg.role}`}>{formatText(msg.content)}</div>
                {msg.options && msg.role === "bot" && (
                  <div className="opts">
                    {msg.options.map((opt, j) => (
                      <button key={j} className="opt-btn" onClick={() => handleOption(opt)}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="loading">
              <div className="msg-av bot"><BotIcon s={15} /></div>
              <div className="loading-bbl">
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT ─────────────────────────────────────────────────────── */}
        <div className="zk-input">
          <div className={`inp-wrap ${inputFocused ? "focus" : ""}`}>
            <textarea
              ref={inputRef}
              className="zk-ta"
              value={input}
              placeholder="Posez votre question à Zika..."
              rows={1}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <button
              className={`send ${input.trim() && !isLoading ? "on" : "off"}`}
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <SendIcon />
            </button>
          </div>
          <div className="inp-footer">
            <SparkleIcon /> ECT © 2026 &nbsp;·&nbsp; www.ect.ci
          </div>
        </div>

      </div>
    </>
  );
}
