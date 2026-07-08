import { useState, useRef, useEffect, useCallback } from "react";

const ECT_LOGO_URL = "/Logo_ect.png";
const BACKEND_URL  = "https://zika-chatbot-1.onrender.com";

// ─── Appel Backend ────────────────────────────────────────────────────────────
async function callBackend(messages) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const data = await res.json();
    return data.reply || "Je n'ai pas pu générer une réponse. Contactez-nous à commercial@ect.ci.";
  } catch {
    return "Une erreur de connexion est survenue. Contactez-nous au (+225) 21.50.00.41.57 ou commercial@ect.ci.";
  }
}

async function sendLead(data) {
  try {
    await fetch(`${BACKEND_URL}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {}
}

// ─── Icons ────────────────────────────────────────────────────────────────────
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

// ─── Quick actions d'accueil ──────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Nos formations",      desc: "Explorer le catalogue 2026",      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { label: "Demander un conseil", desc: "Audit & diagnostic personnalisé",  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
  { label: "Portage salarial",    desc: "Gestion RH simplifiée",            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: "Nos outils d'audit",  desc: "SECTINEL, SAFE Supplier, EMA…",   icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { label: "Nous contacter",      desc: "RDV, téléphone & WhatsApp",        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.07 6.07l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
];

// ─── Formatage texte avec liens cliquables ───────────────────────────────────
function renderLineWithLinks(line) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = line.split(urlRegex);
  return parts.map((part, idx) => {
    if (/^https?:\/\//.test(part)) {
      return <a key={idx} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#E8690B", textDecoration: "underline", wordBreak: "break-all" }}>{part}</a>;
    }
    return <span key={idx}>{part}</span>;
  });
}

function formatText(text) {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
    const hasUrl = line.includes("http");
    return (
      <div key={i} style={{ marginBottom: 3, lineHeight: 1.65, paddingLeft: line.startsWith("•") ? 4 : 0 }}>
        {hasUrl ? renderLineWithLinks(line) : line}
      </div>
    );
  });
}

// ─── Logo ECT ─────────────────────────────────────────────────────────────────
function ECTLogo() {
  return (
    <div style={{ background: "#FFF", borderRadius: 12, padding: "5px 10px", display: "flex", alignItems: "center", height: 48, flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.18)" }}>
      <img src={ECT_LOGO_URL} alt="ECT" style={{ height: 36, width: "auto", objectFit: "contain" }} onError={e => e.currentTarget.closest("div").style.display = "none"} />
    </div>
  );
}

// ─── Formulaire de capture de leads ──────────────────────────────────────────
function LeadForm({ onSubmit, onSkip }) {
  const [form, setForm] = useState({ nom: "", email: "", telephone: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const valid = form.nom.trim() && form.email.includes("@");
  return (
    <div style={{ background: "#FFF8F2", border: "1.5px solid #E8690B", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#E8690B" }}>📋 Laisser vos coordonnées</div>
      {[["nom","Prénom et Nom *","text"],["email","Email professionnel *","email"],["telephone","Téléphone","tel"]].map(([k,ph,t]) => (
        <input key={k} type={t} placeholder={ph} value={form[k]} onChange={set(k)}
          style={{ border: "1.5px solid #EDEAE6", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => valid && onSubmit(form)} disabled={!valid}
          style={{ flex: 1, background: valid ? "linear-gradient(145deg,#E8690B,#C85000)" : "#E5E2DF", color: valid ? "#FFF" : "#AAA", border: "none", borderRadius: 10, padding: "9px 0", fontSize: 13, fontWeight: 600, cursor: valid ? "pointer" : "default", fontFamily: "inherit" }}>
          Envoyer ✓
        </button>
        <button onClick={onSkip} style={{ padding: "9px 14px", background: "transparent", border: "1.5px solid #EDEAE6", borderRadius: 10, fontSize: 12, color: "#999", cursor: "pointer", fontFamily: "inherit" }}>
          Ignorer
        </button>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ZikaChatbot() {
  // history = tableau {role:"user"|"assistant", content:string}
  const [history,      setHistory]      = useState([]);
  const [messages,     setMessages]     = useState([]); // affichage: {role, content, options, type}
  const [input,        setInput]        = useState("");
  const [isLoading,    setIsLoading]    = useState(false);
  const [showWelcome,  setShowWelcome]  = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const addBotMsg = useCallback((content, options = null, type = "text") => {
    setMessages(prev => [...prev, { role: "bot", content, options, type }]);
  }, []);

  const addUserMsg = useCallback((content) => {
    setMessages(prev => [...prev, { role: "user", content }]);
  }, []);

  // Envoie un message à Claude avec tout l'historique
  const chat = useCallback(async (userText) => {
    const newHistory = [...history, { role: "user", content: userText }];
    setIsLoading(true);
    const reply = await callBackend(newHistory);
    setIsLoading(false);
    setHistory([...newHistory, { role: "assistant", content: reply }]);
    addBotMsg(reply);
    // Proposer capture lead si le prospect semble intéressé
    const triggerLead = /contact|rappel|devis|rendez-vous|rdv|intéresse|souhait|besoin/i.test(userText + reply);
    if (triggerLead && !showLeadForm) {
      setTimeout(() => setShowLeadForm(true), 800);
    }
  }, [history, addBotMsg, showLeadForm]);

  const handleSend = useCallback(async (text = null) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setShowWelcome(false);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    addUserMsg(msg);
    await chat(msg);
  }, [input, isLoading, addUserMsg, chat]);

  const handleReset = useCallback(() => {
    setMessages([]); setHistory([]); setShowWelcome(true);
    setIsLoading(false); setShowLeadForm(false);
  }, []);

  const handleLeadSubmit = useCallback(async (formData) => {
    setShowLeadForm(false);
    await sendLead({ ...formData, source: "ZIKA Chat", date: new Date().toISOString() });
    addBotMsg(`Merci ${formData.nom} ! ✅\n\nVotre demande a été enregistrée. Un consultant ECT vous contactera à ${formData.email} dans les 24h ouvrées.\n\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50\n📧 commercial@ect.ci`);
  }, [addBotMsg]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: 'Plus Jakarta Sans', sans-serif; }
        .zk { font-family:'Plus Jakarta Sans',system-ui,sans-serif; width:100%; max-width:460px; height:100vh; max-height:800px; display:flex; flex-direction:column; background:#FAFAF8; border-radius:24px; overflow:hidden; margin:0 auto; box-shadow:0 32px 80px rgba(0,0,0,0.13); }
        .zk-header { background:linear-gradient(140deg,#F07020 0%,#C85000 100%); height:74px; padding:0 18px; display:flex; align-items:center; gap:14px; position:relative; overflow:hidden; flex-shrink:0; }
        .zk-header::before { content:''; position:absolute; top:-50px; right:-50px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.07); }
        .hd-text { flex:1; z-index:1; }
        .hd-name { font-family:'Syne',sans-serif; font-weight:800; font-size:21px; color:#FFF; letter-spacing:2.5px; display:flex; align-items:center; gap:8px; }
        .hd-badge { font-size:9px; font-weight:600; background:rgba(255,255,255,0.17); color:rgba(255,255,255,0.88); border:1px solid rgba(255,255,255,0.25); padding:2px 9px; border-radius:20px; font-family:'Plus Jakarta Sans',sans-serif; }
        .hd-sub { color:rgba(255,255,255,0.72); font-size:11px; margin-top:3px; }
        .hd-status { display:flex; align-items:center; gap:5px; color:rgba(255,255,255,0.78); font-size:10px; margin-top:4px; }
        .hd-dot { width:6px; height:6px; border-radius:50%; background:#4ADE80; box-shadow:0 0 7px #4ADE80; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .hd-btn { margin-left:auto; z-index:1; width:36px; height:36px; background:rgba(255,255,255,0.13); border:1px solid rgba(255,255,255,0.2); border-radius:10px; cursor:pointer; color:#FFF; display:flex; align-items:center; justify-content:center; transition:all .2s; }
        .hd-btn:hover { background:rgba(255,255,255,0.24); transform:rotate(180deg); }
        .zk-msgs { flex:1; overflow-y:auto; padding:20px 16px 10px; display:flex; flex-direction:column; gap:14px; }
        .zk-msgs::-webkit-scrollbar { width:3px; }
        .zk-msgs::-webkit-scrollbar-thumb { background:#E2DDD8; border-radius:4px; }
        .welcome { display:flex; flex-direction:column; align-items:center; flex:1; padding:8px 6px 18px; gap:20px; animation:fadeUp .5s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .w-avatar { width:72px; height:72px; border-radius:22px; background:linear-gradient(145deg,#E8690B,#F5A03B); display:flex; align-items:center; justify-content:center; color:#FFF; box-shadow:0 12px 38px rgba(232,105,11,0.33),0 0 0 8px rgba(232,105,11,0.09); }
        .w-title { font-family:'Syne',sans-serif; font-size:23px; font-weight:800; color:#181818; text-align:center; }
        .w-title span { color:#E8690B; }
        .w-sub { font-size:12.5px; color:#999; margin-top:6px; text-align:center; line-height:1.65; }
        .w-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; width:100%; }
        .w-card { background:#FFF; border:1.5px solid #EDEAE6; border-radius:16px; padding:15px 13px; cursor:pointer; text-align:left; transition:all .25s; box-shadow:0 2px 8px rgba(0,0,0,0.035); }
        .w-card-full { grid-column:1/-1; }
        .w-card:hover { border-color:#E8690B; box-shadow:0 6px 22px rgba(232,105,11,0.13); transform:translateY(-3px); }
        .w-card-icon { width:42px; height:42px; border-radius:12px; background:linear-gradient(145deg,#FFF3EB,#FFE4CC); display:flex; align-items:center; justify-content:center; color:#E8690B; margin-bottom:10px; }
        .w-card-label { font-size:12.5px; font-weight:700; color:#181818; margin-bottom:3px; }
        .w-card-desc { font-size:10.5px; color:#AAAAAA; }
        .w-footer { display:flex; align-items:center; gap:5px; color:#CCCCCC; font-size:10px; font-weight:500; }
        .msg-row { display:flex; gap:9px; align-items:flex-end; animation:msgIn .3s ease; }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .msg-row.user { flex-direction:row-reverse; }
        .msg-av { width:30px; height:30px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; margin-bottom:2px; }
        .msg-av.bot { background:linear-gradient(145deg,#E8690B,#F5A03B); color:#FFF; }
        .msg-av.user { background:#1C1C1C; color:#FFF; }
        .msg-wrap { max-width:83%; display:flex; flex-direction:column; gap:8px; }
        .msg-bbl { padding:11px 15px; font-size:13.5px; line-height:1.65; border-radius:18px; }
        .msg-bbl.bot { background:#FFF; color:#252525; border-radius:18px 18px 18px 4px; border:1px solid #EFECEA; box-shadow:0 2px 10px rgba(0,0,0,0.045); }
        .msg-bbl.user { background:linear-gradient(145deg,#E8690B,#C85000); color:#FFF; border-radius:18px 18px 4px 18px; box-shadow:0 4px 16px rgba(232,105,11,0.27); }
        .loading { display:flex; gap:9px; align-items:flex-end; }
        .loading-bbl { background:#FFF; border-radius:18px 18px 18px 4px; padding:13px 18px; display:flex; gap:5px; border:1px solid #EFECEA; }
        .dot { width:7px; height:7px; border-radius:50%; background:#E8690B; opacity:.3; animation:bnc 1.2s ease-in-out infinite; }
        .dot:nth-child(2){animation-delay:.15s} .dot:nth-child(3){animation-delay:.3s}
        @keyframes bnc { 0%,60%,100%{transform:translateY(0);opacity:.3} 30%{transform:translateY(-7px);opacity:1} }
        .zk-input { padding:11px 14px 15px; background:#FFF; border-top:1px solid #EFECEA; flex-shrink:0; }
        .inp-wrap { display:flex; align-items:flex-end; gap:10px; background:#F6F4F1; border-radius:18px; padding:8px 8px 8px 18px; border:1.5px solid #ECEAE6; transition:border-color .2s,box-shadow .2s; }
        .inp-wrap.focus { border-color:#E8690B; box-shadow:0 0 0 3px rgba(232,105,11,0.09); }
        .zk-ta { flex:1; border:none; outline:none; background:transparent; resize:none; font-size:14px; line-height:1.5; font-family:'Plus Jakarta Sans',sans-serif; color:#252525; padding:5px 0; max-height:120px; min-height:24px; }
        .zk-ta::placeholder { color:#BBBBBB; }
        .send { width:40px; height:40px; border-radius:13px; border:none; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:all .22s; }
        .send.on { background:linear-gradient(145deg,#E8690B,#C85000); color:#FFF; box-shadow:0 4px 14px rgba(232,105,11,0.33); }
        .send.on:hover { transform:scale(1.06); }
        .send.off { background:#E5E2DF; color:#BBBBBB; cursor:default; }
        .inp-footer { display:flex; align-items:center; justify-content:center; gap:5px; margin-top:8px; color:#CCCCCC; font-size:10px; font-weight:500; }
      `}</style>

      <div className="zk">
        {/* Header */}
        <div className="zk-header">
          <div style={{ zIndex: 1, flexShrink: 0 }}><ECTLogo /></div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.22)", zIndex: 1 }} />
          <div className="hd-text">
            <div className="hd-name">ZIKA <span className="hd-badge">by ECT</span></div>
            <div className="hd-sub">Assistant Conseil • Formation • Support</div>
            <div className="hd-status"><div className="hd-dot" /> En ligne</div>
          </div>
          <button className="hd-btn" onClick={handleReset} title="Nouvelle conversation"><RefreshIcon /></button>
        </div>

        {/* Messages */}
        <div className="zk-msgs">
          {showWelcome && (
            <div className="welcome">
              <div className="w-avatar"><BotIcon s={34} /></div>
              <div style={{ textAlign: "center" }}>
                <div className="w-title">Bienvenue !<br />Je suis <span>Zika</span></div>
                <div className="w-sub">Votre expert ECT. Posez-moi n'importe quelle question<br />sur nos formations, outils, méthodes ou services.</div>
              </div>
              <div className="w-grid">
                {QUICK_ACTIONS.map((a, i) => (
                  <button key={i}
                    className={`w-card${QUICK_ACTIONS.length % 2 !== 0 && i === QUICK_ACTIONS.length - 1 ? " w-card-full" : ""}`}
                    onClick={() => handleSend(a.label)}>
                    <div className="w-card-icon">{a.icon}</div>
                    <div className="w-card-label">{a.label}</div>
                    <div className="w-card-desc">{a.desc}</div>
                  </button>
                ))}
              </div>
              <div className="w-footer"><SparkleIcon /> Propulsé par l'IA · Eburnis Conseil & Technologies</div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`msg-row ${msg.role}`}>
              <div className={`msg-av ${msg.role}`}>{msg.role === "bot" ? <BotIcon s={15} /> : <UserIcon />}</div>
              <div className="msg-wrap">
                <div className={`msg-bbl ${msg.role}`}>{formatText(msg.content)}</div>
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

          {showLeadForm && !isLoading && (
            <div className="msg-row bot">
              <div className="msg-av bot"><BotIcon s={15} /></div>
              <div className="msg-wrap">
                <LeadForm onSubmit={handleLeadSubmit} onSkip={() => setShowLeadForm(false)} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="zk-input">
          <div className={`inp-wrap ${inputFocused ? "focus" : ""}`}>
            <textarea ref={inputRef} className="zk-ta" value={input}
              placeholder="Posez votre question à Zika..."
              rows={1}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <button className={`send ${input.trim() && !isLoading ? "on" : "off"}`}
              onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
              <SendIcon />
            </button>
          </div>
          <div className="inp-footer"><SparkleIcon /> ECT © 2026 &nbsp;·&nbsp; www.ect.ci</div>
        </div>
      </div>
    </>
  );
}