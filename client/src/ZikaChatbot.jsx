import { useState, useRef, useEffect, useCallback } from "react";

// ─── Config logo ──────────────────────────────────────────────────────────────
// Pour utiliser le vrai logo ECT, remplacer null par le chemin :
// exemple : "/logo-ect.png"  (fichier à placer dans client/public/)
const ECT_LOGO_URL = "/Logo_ect.png";

// Catégories formations du catalogue 2026
const THEMATIQUES = [
  "Certificats Professionnels",
  "Certificats Pratiques",
  "Séminaires Intra/Inter",
  "Formations à la Carte",
  "Séminaires Internationaux",
  "Certifications PECB",
];

// Outils ECT
const OUTILS_ECT = [
  "SECTINEL Upstream (IA Achats)",
  "Si55 Execution (Asset Management)",
  "PSA Grid™ (Compétences Achats)",
  "STOCK SKILLS™ (Gestion Stocks)",
  "K-Map 360 (Capital Savoir)",
  "SAFE Supplier (Risques Fournisseurs)",
];

// ─── Données spécifiques par type de formation (Catalogue 2026) ──────────────
const FORMATION_DATA = {
  "Certificats Professionnels": {
    desc: "15 parcours certifiants en 5 filières stratégiques — 3 niveaux de maîtrise.",
    duree: "Débutant : 30h | Avancé : 40h | Expert : 50h",
    horaires: "Samedis 08H–14H (présentiel/en ligne) | Mardis & Jeudis 19H–21H (en ligne)",
    filières: [
      "🛒 Responsable Achats (CPACH-1/2/3)",
      "📦 Responsable Approvisionnement (CPAPP-1/2/3)",
      "🚛 Responsable Logistique & ADV (CPLOG-1/2/3)",
      "⚙️ Responsable de Production (CPPRO-1/2/3)",
      "🔗 Responsable Supply Chain (CPSCM-1/2/3)",
    ],
    note: "Chaque filière comporte 3 niveaux progressifs : Débutant → Avancé → Expert.",
    lien: "https://catalogue-formations-ect-2026.netlify.app/section_certificats_professionnels",
  },
  "Certificats Pratiques": {
    desc: "6 certificats opérationnels pour renforcer les compétences terrain.",
    duree: "40 heures par certificat",
    horaires: "Samedis 08H–14H (présentiel/en ligne) | Mardis & Jeudis 19H–21H (en ligne)",
    filières: [
      "🛒 Acheteur Opérationnel",
      "📦 Approvisionneur",
      "🚛 Logisticien",
      "🚢 Transitaire",
      "✅ Qualité",
      "📋 Autres spécialités opérationnelles",
    ],
    note: "Ces certificats sont idéals pour les praticiens qui veulent valider rapidement leurs compétences.",
    lien: "https://catalogue-formations-ect-2026.netlify.app/section_certificats_pratiques",
  },
  "Séminaires Intra/Inter": {
    desc: "15 séminaires intensifs sur des thématiques Achats, QHSE, Supply Chain et Gestion Industrielle — avec études de cas.",
    duree: "2 à 3 jours",
    horaires: "Sessions planifiées en présentiel à Abidjan ou dans vos locaux (intra-entreprise)",
    filières: [
      "🏢 Achats & Patrimoine",
      "⚙️ Gestion Industrielle",
      "🔗 Supply Chain",
      "🌿 QHSE",
      "📊 Et 11 autres thèmes disponibles",
    ],
    note: "Format intra : formation dans vos locaux, contenu adapté à votre secteur. Format inter : sessions ouvertes avec d'autres entreprises.",
    lien: "https://catalogue-formations-ect-2026.netlify.app/section_seminaires_intra",
  },
  "Formations à la Carte": {
    desc: "70+ thèmes disponibles — Administration, Audit, Normes ISO, QHSE, Informatique, Excel, Supply Chain, Achats, Logistique.",
    duree: "1 à 5 jours selon le thème choisi",
    horaires: "Planifiées selon vos disponibilités — présentiel ou en ligne",
    filières: [
      "📋 Administration & Gestion",
      "🔍 Audit & Conformité",
      "📊 Normes ISO",
      "🌿 QHSE",
      "💻 Informatique & Excel",
      "🔗 Supply Chain & Logistique",
      "🛒 Achats opérationnels",
      "Et bien d'autres sur demande...",
    ],
    note: "Vous choisissez le thème, la durée et le format — ECT adapte le contenu à votre contexte.",
    lien: "https://catalogue-formations-ect-2026.netlify.app/section_formations_carte",
  },
  "Séminaires Internationaux": {
    desc: "11 programmes intensifs dans des destinations prestigieuses.",
    duree: "2 à 3 semaines",
    horaires: "Sessions annuelles — Abidjan & Assinie | Paris | Dubaï | Casablanca",
    filières: [
      "🏛️ INT01 — Gestion du Patrimoine (3 sem.)",
      "🚛 INT02 — Logistique & Moyens Généraux (3 sem.)",
      "📦 INT03 — Gestion des Stocks & Approvisionnements (2 sem.)",
      "⚡ INT04 — Zéro Rupture, Zéro Sur-stock (2 sem.)",
      "💰 INT05 — Maîtrise du Risque Crédit (2 sem.)",
      "💵 INT06 — Stratégies de Trésorerie (2 sem.)",
      "🌍 INT07 — ZLECAF : Opportunités Douanières (2 sem.)",
      "🛡️ INT08 — Business Résilience ISO 22301 (2 sem.)",
      "⚠️ INT09 — Gestion des Risques ISO 31000 (2 sem.)",
      "🌱 INT10 — Efficacité Énergétique (2 sem.)",
      "📈 INT11 — Pilotage de la Performance Industrielle (2 sem.)",
    ],
    note: "Programmes intensifs combinant apports théoriques, visites d'entreprises et networking international.",
    lien: "https://catalogue-formations-ect-2026.netlify.app/section_seminaires_internationaux",
  },
  "Certifications PECB": {
    desc: "Certifications ISO internationales reconnues mondialement dans 150+ pays — via PECB, partenaire officiel d'ECT.",
    duree: "À son rythme — maximum 12 mois | Formules : Foundation, Lead Implementer, Lead Auditor",
    horaires: "Auto-formation en ligne + examens planifiés",
    filières: [
      "✅ ISO 9001 — Management de la qualité",
      "✅ ISO 14001 — Management environnemental",
      "✅ ISO 22301 — Continuité des activités",
      "✅ ISO 27001 — Sécurité de l'information",
      "✅ ISO 28000 — Sûreté Supply Chain",
      "✅ ISO 31000 — Gestion des risques",
      "✅ ISO 45001 — Santé & sécurité au travail",
      "✅ ISO 50001 — Management de l'énergie",
      "✅ ISO 55001 — Gestion des actifs",
      "Et 5 autres normes disponibles...",
    ],
    note: "ECT est agréé FDFP — vos certifications peuvent être prises en charge financièrement.",
    lien: "https://catalogue-formations-ect-2026.netlify.app/section_pecb",
  },
};


// ─── Filières par type de formation ──────────────────────────────────────────
const FILIERES_DATA = {
  "Certificats Professionnels": [
    "Responsable Achats",
    "Responsable Approvisionnement",
    "Responsable Logistique & ADV",
    "Responsable de Production",
    "Responsable Supply Chain",
  ],
  "Certificats Pratiques": [
    "Acheteur Opérationnel",
    "Approvisionneur",
    "Logisticien",
    "Transitaire",
    "Qualité",
  ],
  "Séminaires Intra/Inter": [
    "Achats & Patrimoine",
    "Gestion Industrielle",
    "Supply Chain",
    "QHSE",
    "Autres thèmes disponibles",
  ],
  "Formations à la Carte": [
    "Administration & Gestion",
    "Audit & Conformité",
    "Normes ISO",
    "QHSE",
    "Informatique & Excel",
    "Supply Chain & Logistique",
    "Achats opérationnels",
  ],
  "Séminaires Internationaux": [
    "INT01 — Gestion du Patrimoine",
    "INT02 — Logistique & Moyens Généraux",
    "INT03 — Gestion des Stocks & Approvisionnements",
    "INT04 — Zéro Rupture, Zéro Sur-stock",
    "INT05 — Maîtrise du Risque Crédit",
    "INT06 — Stratégies de Trésorerie",
    "INT07 — ZLECAF : Opportunités Douanières",
    "INT08 — Business Résilience ISO 22301",
    "INT09 — Gestion des Risques ISO 31000",
    "INT10 — Efficacité Énergétique",
    "INT11 — Pilotage de la Performance Industrielle",
  ],
  "Certifications PECB": [
    "ISO 9001 — Management Qualité",
    "ISO 14001 — Environnement",
    "ISO 22301 — Continuité d'Activité",
    "ISO 27001 — Sécurité de l'Information",
    "ISO 28000 — Sûreté Supply Chain",
    "ISO 31000 — Gestion des Risques",
    "ISO 45001 — Santé & Sécurité",
    "ISO 50001 — Management Énergie",
    "ISO 55001 — Gestion des Actifs",
  ],
};

// ─── Détails par filière — Contenu réel du Catalogue 2026 ECT ───────────────
const DETAILS_FILIERES = {

  // ── Certificats Professionnels ─────────────────────────────────────────────
  "Responsable Achats": {
    niveaux: [
      { code: "CPACH-1", niveau: "Débutant", duree: "30h", contenu: ["Situer la fonction achats dans la chaîne de valeur", "Structurer un processus d'achat complet", "Maîtriser les techniques de négociation", "Évaluer, sélectionner et suivre les fournisseurs"] },
      { code: "CPACH-2", niveau: "Avancé", duree: "40h", contenu: ["Aligner les achats sur les objectifs stratégiques", "Outils avancés d'analyse des coûts et KPI", "Négociations stratégiques et partenariats clés", "Achats responsables et transformation digitale"] },
      { code: "CPACH-3", niveau: "Expert", duree: "50h", contenu: ["Politique achats stratégiques et compétitivité", "Résilience et collaboration en environnements complexes", "Technologies innovantes pour moderniser les processus", "Performance économique, sociale et environnementale"] },
    ],
  },
  "Responsable Approvisionnement": {
    niveaux: [
      { code: "CPAPP-1", niveau: "Débutant", duree: "30h", contenu: ["Maîtriser stock, réapprovisionnement et flux logistiques", "Planifier les commandes et gérer les fournisseurs", "Équilibrer disponibilité et coûts de stockage", "Excel et ERP pour la gestion des données"] },
      { code: "CPAPP-2", niveau: "Avancé", duree: "40h", contenu: ["Aligner sur objectifs coûts, délais et qualité", "JAT, ABC, réapprovisionnement automatique", "Indicateurs clés de performance", "Plans de continuité et gestion des risques"] },
      { code: "CPAPP-3", niveau: "Expert", duree: "50h", contenu: ["Stratégies internationales, durabilité et innovation", "Flux intégrés, résilients et collaboratifs", "IA, machine learning et blockchain", "Impact économique et stratégique"] },
    ],
  },
  "Responsable Logistique & ADV": {
    niveaux: [
      { code: "CPLOG-1", niveau: "Débutant", duree: "30h", contenu: ["Flux physiques et processus ADV", "Traiter commandes, organiser expéditions et suivi", "Disponibilité des produits et maîtrise des coûts", "Outils bureautiques et ERP"] },
      { code: "CPLOG-2", niveau: "Avancé", duree: "40h", contenu: ["Démarche orientée client", "ABC, FIFO, LIFO et productivité entrepôt", "Planification transport et satisfaction client", "KPI de performance logistique"] },
      { code: "CPLOG-3", niveau: "Expert", duree: "50h", contenu: ["Enjeux internationaux, durabilité et optimisation", "WMS, TMS, IA et blockchain", "Anticiper disruptions et sécuriser approvisionnements", "Concilier coûts, satisfaction client et normes environnementales"] },
    ],
  },
  "Responsable de Production": {
    niveaux: [
      { code: "CPPRO-1", niveau: "Débutant", duree: "30h", contenu: ["Bases de planification, ordonnancement et suivi", "Affectation des ressources efficacement", "Étapes critiques et réduction des pertes", "Indicateurs TRS, délais, taux de rebuts"] },
      { code: "CPPRO-2", niveau: "Avancé", duree: "40h", contenu: ["Plannings optimisés selon contraintes et prévisions", "Lean, Kaizen et Six Sigma", "Compétences managériales pour les équipes", "Leviers de réduction des coûts"] },
      { code: "CPPRO-3", niveau: "Expert", duree: "50h", contenu: ["Politiques de production stratégiques", "ERP, IoT, automatisation et amélioration continue", "Stratégies de résilience face aux disruptions", "Équilibre coûts, délais, qualité et environnement"] },
    ],
  },
  "Responsable Supply Chain": {
    niveaux: [
      { code: "CPSCM-1", niveau: "Débutant", duree: "30h", contenu: ["Flux physiques, d'information et financiers", "Approvisionnements, stocks et flux logistiques", "Identifier les inefficacités et proposer des solutions", "Excel et ERP"] },
      { code: "CPSCM-2", niveau: "Avancé", duree: "40h", contenu: ["Aligner sur objectifs coûts, délais et qualité", "MRP et gestion avancée des stocks", "Relations fournisseurs, transporteurs et parties prenantes", "KPI d'efficacité et d'agilité"] },
      { code: "CPSCM-3", niveau: "Expert", duree: "50h", contenu: ["Stratégies intégrées internationales", "IoT, blockchain, IA et écoresponsabilité", "Modèles agiles face aux changements du marché", "Impacts financiers, opérationnels et environnementaux"] },
    ],
  },

  // ── Certificats Pratiques ──────────────────────────────────────────────────
  "Acheteur Opérationnel": {
    desc: "Certificat Pratique Acheteur (FPACH) — 40 heures",
    modules: [
      "Processus fondamentaux des achats jusqu'à la gestion des fournisseurs",
      "Négocier efficacement pour les meilleures conditions coût, qualité, délais",
      "Identifier, évaluer et sélectionner les fournisseurs",
      "Outils pratiques de suivi des coûts et mesure des performances",
    ],
    horaires: "Samedis 08H–14H (présentiel/en ligne) | Lundis & Mercredis 19H–21H (en ligne)",
  },
  "Approvisionneur": {
    desc: "Certificat Pratique Approvisionneur & Gestionnaire de Stock (FPAPP) — 40 heures",
    modules: [
      "Processus d'approvisionnement de l'identification des besoins à la réception",
      "Équilibrer disponibilité des produits et coûts de stockage",
      "Exploiter Excel ou ERP pour suivre, analyser et automatiser",
      "Indicateurs clés : rotations, taux de rupture, taux de service",
    ],
    horaires: "Samedis 08H–14H (présentiel/en ligne) | Lundis & Mercredis 19H–21H (en ligne)",
  },
  "Logisticien": {
    desc: "Certificat Pratique Logisticien d'Entrepôt (FPLOG) — 40 heures",
    modules: [
      "Principes de stockage, manutention et gestion des flux",
      "Organiser les zones de stockage et maximiser l'espace",
      "WMS, Excel, codes-barres et RFID pour le suivi",
      "Optimisation des processus et normes de sécurité",
    ],
    horaires: "Samedis 08H–14H (présentiel/en ligne) | Lundis & Mercredis 19H–21H (en ligne)",
  },
  "Transitaire": {
    desc: "Certificat Pratique Agent Transit / Transitaire (FPATD) — 40 heures",
    modules: [
      "Processus et réglementations du transport international et dédouanement",
      "Préparer et contrôler les documents requis",
      "Coordonner les flux en respectant délais et coûts",
      "Collaborer avec transporteurs, douanes et parties prenantes",
    ],
    horaires: "Samedis 08H–14H (présentiel/en ligne) | Lundis & Mercredis 19H–21H (en ligne)",
  },
  "Qualité": {
    desc: "Certificat Pratique Assistant / Responsable Qualité (FPQUA) — 40 heures",
    modules: [
      "Fondements du management de la qualité",
      "Norme ISO 9001 et ses exigences clés",
      "Outils et techniques d'évaluation et d'amélioration",
      "Préparer, réaliser et documenter des audits qualité",
      "Faciliter les réunions et promouvoir l'amélioration continue",
    ],
    horaires: "Samedis 08H–14H (présentiel/en ligne) | Lundis & Mercredis 19H–21H (en ligne)",
  },

  // ── Séminaires Intra/Inter ─────────────────────────────────────────────────
  "Achats & Patrimoine": {
    desc: "Séminaires Achats & Patrimoine — 2 à 3 jours",
    modules: [
      "ACH01 — Définir et conduire une stratégie d'achats efficace (3j)",
      "ACH02 — Programme de gestion du patrimoine selon ISO 55001 (3j)",
      "ACH03 — Plan de sûreté chaîne d'approvisionnement selon ISO 28000 (3j)",
      "ACH04 — Exigences environnementales ISO 14001 dans le processus Achat (2j)",
      "ACH05 — Exigences énergétiques ISO 50001 dans le processus Achat (2j)",
      "ACH06 — Gérer efficacement les risques fournisseurs (2j)",
    ],
    horaires: "Sessions planifiées en présentiel à Abidjan ou dans vos locaux",
  },
  "Gestion Industrielle": {
    desc: "Séminaires Gestion Industrielle — 3 jours",
    modules: [
      "IND01 — Planifier et piloter sa production (3j)",
      "IND02 — Ordonnancement et planning d'atelier (3j)",
      "IND03 — Automatiser la mesure du TRS et améliorer la productivité (3j)",
    ],
    horaires: "Sessions planifiées en présentiel à Abidjan ou dans vos locaux",
  },
  "Supply Chain": {
    desc: "Séminaires Supply Chain — 3 jours",
    modules: [
      "SUP-01 — Stratégie pour conduire un projet de réduction des stocks (3j)",
      "SUP-02 — Tableau de bord avec Excel & PowerQuery (3j)",
      "SUP-03 — Construire et fiabiliser ses prévisions de vente (3j)",
      "SUP-04 — Conduire et piloter un processus Demand Planning (3j)",
    ],
    horaires: "Sessions planifiées en présentiel à Abidjan ou dans vos locaux",
  },
  "QHSE": {
    desc: "Séminaires QHSE — 20 heures chacun",
    modules: [
      "QUA-01 — Exigences et bonnes pratiques de l'ISO 9001 (20h)",
      "QUA-02 — Exigences et bonnes pratiques de l'ISO 14001 (20h)",
    ],
    horaires: "Sessions planifiées en présentiel à Abidjan ou dans vos locaux",
  },
  "Autres thèmes disponibles": {
    desc: "D'autres thèmes sur mesure sont disponibles selon vos besoins.",
    modules: [
      "Contactez-nous pour un programme adapté à votre secteur",
      "Format intra : dans vos locaux, contenu personnalisé",
      "Format inter : sessions ouvertes, échanges entre entreprises",
    ],
    horaires: "Sessions planifiées selon vos disponibilités",
  },

  // ── Formations à la Carte ──────────────────────────────────────────────────
  "Administration & Gestion": {
    desc: "Formations Administration & Gestion — 2 à 3 jours",
    modules: [
      "GES-01 — Assistant Audit Interne & Contrôle (3j)",
      "GES-02 — Gestion des Risques PME (3j)",
      "GES-03 — Comptabilité pratique et déclarations fiscales (3j)",
      "GES-04 — Analyse de données — Business Intelligence (3j)",
      "ADM-01 — Secrétariat de Direction et Archivage numérique (3j)",
      "ADM-02 — Conduite et rapportage de réunions (2j)",
      "ADM-04 — Bureautique avancée : Maîtrise du Pack Office (3j)",
      "ADM-05 — Élaboration d'un Business Plan (3j)",
    ],
    horaires: "Planifiées selon vos disponibilités — présentiel ou en ligne",
  },
  "Audit & Conformité": {
    desc: "Formations Audit & Conformité — 3 jours",
    modules: [
      "GES-05 — Les fondamentaux de l'Audit Interne (3j)",
      "GES-06 — Outils d'analyse de problèmes (Ishikawa, 5 Pourquoi, QQOQCP) (3j)",
      "GES-07 — Rédaction efficace de rapports d'audit (3j)",
      "GES-08 — Initiation au Contrôle Interne et cartographie des risques (3j)",
      "GES-09 — Audit et Communication : Conduite d'entretien et restitution (3j)",
    ],
    horaires: "Planifiées selon vos disponibilités — présentiel ou en ligne",
  },
  "Normes ISO": {
    desc: "Formations Normes & Certifications ISO — 1 à 3 jours",
    modules: [
      "NOR-01 — Sûreté de la chaîne d'approvisionnement selon ISO 28000 (3j)",
      "NOR-02 — Gestion des actifs selon ISO 55001 (3j)",
      "NOR-03 — Management anti-corruption selon ISO 37001 (3j)",
      "NOR-04 — Continuité des activités selon ISO 22301 (3j)",
      "NOR-05 — Management de la qualité selon ISO 9001 (3j)",
      "NOR-09 — Système de management intégré QHSE (3j)",
      "NOR-12 — MQAS pour la chaîne d'approvisionnement pharmaceutique (3j)",
    ],
    horaires: "Planifiées selon vos disponibilités — présentiel ou en ligne",
  },
  "Informatique & Excel": {
    desc: "Formations Informatique & Digital — 3 jours",
    modules: [
      "INF-01 — Community Management & Marketing Digital (3j)",
      "INF-02 — Maintenance Informatique et Réseaux (3j)",
      "INF-03 — Bureautique Avancée Excel Expert (3j)",
      "INF-04 — Développement Web WordPress/No-Code (3j)",
      "INF-05 — Infographie et Design publicitaire (3j)",
      "INF-06 — L'IA pour le jeune entrepreneur (3j)",
      "EXP-01 — Maîtriser Excel et Gagner en Efficacité (3j)",
      "EXP-02 — Construire des Reportings et Tableaux de Bord sous Excel (3j)",
    ],
    horaires: "Planifiées selon vos disponibilités — présentiel ou en ligne",
  },
  "Supply Chain & Logistique": {
    desc: "Formations Supply Chain, Logistique & Distribution — 2 à 5 jours",
    modules: [
      "SCP-01 — Fondamentaux du Management Industriel et Supply Chain (5j)",
      "SCP-02 — Mettre en place et Pilotage du Processus S&OP (3j)",
      "SCP-03 — Techniques de Prévisions de la Demande (3j)",
      "SCP-04 — Analyser et Optimiser les Coûts Logistiques (3j)",
      "LOD-01 — Mesurer et Animer la Performance OTIF (3j)",
      "LOD-02 — Manager et Piloter la Performance d'un Entrepôt (3j)",
      "LOD-05 — Gestion des Transports et de la Distribution (3j)",
      "LOD-06 — Gestion des Entrepôts et Logistique Interne (3j)",
    ],
    horaires: "Planifiées selon vos disponibilités — présentiel ou en ligne",
  },
  "Achats opérationnels": {
    desc: "Formations Sourcing & Achats — 2 jours",
    modules: [
      "SAC01 — Construire une Stratégie Achats — Levier Stratégique (2j)",
      "SAC02 — Maîtriser les Techniques d'Optimisation des Achats (2j)",
      "SAC03 — Stratégies de Sourcing et Gestion des Fournisseurs (2j)",
      "SAC10 — Le cycle Achat complet : Du besoin à la facturation (2j)",
      "SAC11 — Techniques de négociation Achat pour débutants (2j)",
      "SAC12 — Transit et Douane (Procédures import-export) (2j)",
      "AGS-01 — Optimisation des Approvisionnements et Réduction des Stocks (3j)",
      "AGS-05 — Assistant Achat et Approvisionnement (3j)",
    ],
    horaires: "Planifiées selon vos disponibilités — présentiel ou en ligne",
  },

  // ── Séminaires Internationaux ──────────────────────────────────────────────
  "INT01 — Gestion du Patrimoine": {
    desc: "Séminaire International — Gestion du Patrimoine (3 semaines)",
    modules: ["Stratégie et politique de gestion des actifs", "Norme ISO 55001 appliquée", "Audit et valorisation du patrimoine", "Renouvellement et performance des actifs"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT02 — Logistique & Moyens Généraux": {
    desc: "Séminaire International — Logistique & Moyens Généraux (3 semaines)",
    modules: ["Gestion opérationnelle des moyens généraux", "Optimisation des flux logistiques", "Gestion des contrats et prestataires", "Pratiques écoresponsables et innovation"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT03 — Gestion des Stocks & Approvisionnements": {
    desc: "Séminaire International — Gestion des Stocks & Approvisionnements (2 semaines)",
    modules: ["Optimisation des niveaux de stocks", "Planification des approvisionnements MRP", "Indicateurs de performance stocks", "Réduction des ruptures et sur-stocks"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT04 — Zéro Rupture, Zéro Sur-stock": {
    desc: "Séminaire International — Zéro Rupture, Zéro Sur-stock (2 semaines)",
    modules: ["Techniques avancées de prévision de la demande", "S&OP et planification collaborative", "Outils de pilotage Excel et PowerQuery", "Construire un tableau de bord Supply Chain"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT05 — Maîtrise du Risque Crédit": {
    desc: "Séminaire International — Maîtrise du Risque Crédit (2 semaines)",
    modules: ["Analyse et évaluation du risque client", "Outils de couverture et garanties", "Gestion du recouvrement", "Stratégies de trésorerie face aux risques"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT06 — Stratégies de Trésorerie": {
    desc: "Séminaire International — Stratégies de Trésorerie & Culture Cash (2 semaines)",
    modules: ["Gestion prévisionnelle de la trésorerie", "Optimisation du besoin en fonds de roulement", "Culture cash dans l'entreprise", "Instruments financiers et couverture de change"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT07 — ZLECAF : Opportunités Douanières": {
    desc: "Séminaire International — ZLECAF & Opportunités Douanières (2 semaines)",
    modules: ["Enjeux et opportunités de la Zone de Libre-Échange Continentale Africaine", "Procédures douanières import-export", "Réglementation et conformité commerciale", "Stratégies d'expansion en Afrique"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT08 — Business Résilience ISO 22301": {
    desc: "Séminaire International — Business Résilience ISO 22301 (2 semaines)",
    modules: ["Comprendre la norme ISO 22301", "Plan de continuité des activités (PCA)", "Analyse d'impact métier (BIA)", "Exercices de simulation de crise"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT09 — Gestion des Risques ISO 31000": {
    desc: "Séminaire International — Gestion des Risques Projets ISO 31000 (2 semaines)",
    modules: ["Cadre de management des risques ISO 31000", "Identification et évaluation des risques projets", "Cartographie et traitement des risques", "Intégration dans les processus de l'entreprise"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT10 — Efficacité Énergétique": {
    desc: "Séminaire International — Efficacité Énergétique (2 semaines)",
    modules: ["Diagnostic énergétique de l'entreprise", "Norme ISO 50001 — Management de l'énergie", "Leviers de réduction de la consommation", "Suivi et mesure de la performance énergétique"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },
  "INT11 — Pilotage de la Performance Industrielle": {
    desc: "Séminaire International — Pilotage de la Performance Industrielle (2 semaines)",
    modules: ["Indicateurs de performance industrielle (TRS, OEE)", "Lean Manufacturing et amélioration continue", "Planification et ordonnancement de production", "Stratégie de performance globale"],
    horaires: "Sessions annuelles — Abidjan & Assinie / Paris / Dubaï / Casablanca",
  },

  // ── Certifications PECB ───────────────────────────────────────────────────
  "ISO 9001 — Management Qualité": {
    desc: "Certification PECB — ISO 9001 Lead Auditor / Lead Implementer",
    modules: ["Exigences de la norme ISO 9001:2015", "Mise en place d'un SMQ", "Conduite d'audits internes et externes", "Formules : Foundation / Lead Implementer / Lead Auditor"],
    horaires: "Auto-formation en ligne — max 12 mois | Examens planifiés par PECB",
  },
  "ISO 14001 — Environnement": {
    desc: "Certification PECB — ISO 14001 Lead Auditor / Lead Implementer",
    modules: ["Exigences du management environnemental", "Identification des aspects et impacts", "Système de management environnemental (SME)", "Formules : Foundation / Lead Implementer / Lead Auditor"],
    horaires: "Auto-formation en ligne — max 12 mois | Examens planifiés par PECB",
  },
  "ISO 22301 — Continuité d'Activité": {
    desc: "Certification PECB — ISO 22301 Lead Auditor / Lead Implementer",
    modules: ["Plan de continuité des activités (PCA)", "Analyse d'impact métier (BIA)", "Tests et exercices de continuité", "Formules : Foundation / Lead Implementer / Lead Auditor"],
    horaires: "Auto-formation en ligne — max 12 mois | Examens planifiés par PECB",
  },
  "ISO 27001 — Sécurité de l'Information": {
    desc: "Certification PECB — ISO 27001 Lead Auditor / Lead Implementer",
    modules: ["Exigences de sécurité de l'information", "Évaluation et traitement des risques SI", "Mise en place d'un SMSI", "Formules : Foundation / Lead Implementer / Lead Auditor"],
    horaires: "Auto-formation en ligne — max 12 mois | Examens planifiés par PECB",
  },
  "ISO 28000 — Sûreté Supply Chain": {
    desc: "Certification PECB — ISO 28000 Lead Auditor / Lead Implementer",
    modules: ["Sûreté de la chaîne d'approvisionnement", "Analyse des menaces et vulnérabilités", "Plan de sûreté et mesures de protection", "Formules : Foundation / Lead Implementer / Lead Auditor"],
    horaires: "Auto-formation en ligne — max 12 mois | Examens planifiés par PECB",
  },
  "ISO 31000 — Gestion des Risques": {
    desc: "Certification PECB — ISO 31000 Lead Risk Manager",
    modules: ["Cadre et principes du management des risques", "Processus d'identification et d'évaluation", "Traitement et surveillance des risques", "Formules : Foundation / Lead Risk Manager"],
    horaires: "Auto-formation en ligne — max 12 mois | Examens planifiés par PECB",
  },
  "ISO 45001 — Santé & Sécurité": {
    desc: "Certification PECB — ISO 45001 Lead Auditor / Lead Implementer",
    modules: ["Exigences santé et sécurité au travail", "Identification des dangers et évaluation des risques", "Système de management SST", "Formules : Foundation / Lead Implementer / Lead Auditor"],
    horaires: "Auto-formation en ligne — max 12 mois | Examens planifiés par PECB",
  },
  "ISO 50001 — Management Énergie": {
    desc: "Certification PECB — ISO 50001 Lead Auditor / Lead Implementer",
    modules: ["Exigences du management de l'énergie", "Revue énergétique et baseline", "Objectifs et plans d'action énergie", "Formules : Foundation / Lead Implementer / Lead Auditor"],
    horaires: "Auto-formation en ligne — max 12 mois | Examens planifiés par PECB",
  },
  "ISO 55001 — Gestion des Actifs": {
    desc: "Certification PECB — ISO 55001 Lead Auditor / Lead Implementer",
    modules: ["Exigences du management des actifs", "Plan stratégique de gestion des actifs (SAMP)", "Cycle de vie des actifs et performance", "Formules : Foundation / Lead Implementer / Lead Auditor"],
    horaires: "Auto-formation en ligne — max 12 mois | Examens planifiés par PECB",
  },
};

// Filière courante sélectionnée (pour le flow étape 2→3)
let _selectedType = null;

// ─── Données outils ECT avec liens ───────────────────────────────────────────
const OUTILS_DATA = {
  "SECTINEL Upstream (IA Achats)": {
    desc: "Solution IA tout-en-un pour automatiser le cycle des achats.",
    points: ["🤖 Veille stratégique automatisée", "📄 Génération d'appels d'offres", "📊 Analyse multicritères fournisseurs", "⚠️ Gestion des risques fournisseurs", "🌍 Multi-devises FCFA/EUR/USD — Conforme OHADA"],
    lien: "https://catalogue-outils-ect.netlify.app/",
    demo: "commercial@ect.ci",
  },
  "Si55 Execution (Asset Management)": {
    desc: "Plateforme opérationnelle de gestion des actifs conforme ISO 55001 — 8 modules.",
    points: ["📦 Inventaire des actifs", "🔧 Maintenance préventive & corrective", "🔄 Renouvellement des actifs", "⚠️ Gestion des risques", "💰 Suivi financier"],
    lien: "https://si55.ect.ci/",
    demo: "commercial@ect.ci",
  },
  "PSA Grid™ (Compétences Achats)": {
    desc: "Grille d'évaluation des compétences achats — 35 compétences, 7 domaines, Méthode Hay.",
    points: ["📊 35 compétences évaluées", "🎯 7 domaines stratégiques", "📈 Analyses croisées automatisées", "📋 Plan de progrès individuel", "⚖️ Pesée des postes (Méthode Hay)"],
    lien: "https://catalogue-outils-ect.netlify.app/",
    demo: "commercial@ect.ci",
  },
  "STOCK SKILLS™ (Gestion Stocks)": {
    desc: "Grille d'évaluation certifiée pour les compétences en gestion des stocks.",
    points: ["📦 6 domaines d'évaluation", "📊 5 niveaux de maturité", "🎯 Plan de développement personnalisé", "✅ Évaluation certifiée"],
    lien: "https://catalogue-outils-ect.netlify.app/",
    demo: "commercial@ect.ci",
  },
  "K-Map 360 (Capital Savoir)": {
    desc: "Cartographie et protection du capital savoir de votre entreprise.",
    points: ["🗺️ Cartographie des connaissances critiques", "🔄 Évaluation 360°", "⚠️ Calcul du Bus Factor", "🚀 Offboarding intelligent", "📊 Data visualisation avancée"],
    lien: "https://catalogue-outils-ect.netlify.app/",
    demo: "commercial@ect.ci",
  },
  "SAFE Supplier (Risques Fournisseurs)": {
    desc: "Gestion et évaluation des risques fournisseurs pour sécuriser votre Supply Chain.",
    points: ["⚠️ Évaluation des risques fournisseurs", "📊 Scoring multicritères", "🔍 Suivi et surveillance continues", "📋 Rapports d'audit fournisseurs"],
    lien: "https://catalogue-outils-ect.netlify.app/",
    demo: "commercial@ect.ci",
  },
};

// ─── Appel Backend ────────────────────────────────────────────────────────────
async function callBackend(message, contextHint = "") {
  try {
    const res = await fetch("https://zika-chatbot.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, contextHint }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur ${res.status}`);
    }
    const data = await res.json();
    return data.reply || "Je suis désolé, je n'ai pas obtenu de réponse. Veuillez contacter ECT au (+225) 21.50.00.41.57 / 05.75.98.50.50.";
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
  "Portage salarial": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
  "Demander un conseil": "Audit & conseil sur mesure",
  "Portage salarial":    "Gestion RH simplifiée",
  "Nos outils d'audit":  "SECTINEL, Si55, PSA Grid…",
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
function renderLineWithLinks(line) {
  // Regex to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = line.split(urlRegex);
  return parts.map((part, idx) => {
    if (urlRegex.test(part)) {
      // Reset regex lastIndex
      urlRegex.lastIndex = 0;
      return (
        <a key={idx} href={part} target="_blank" rel="noopener noreferrer"
          style={{ color: "#E8690B", textDecoration: "underline", wordBreak: "break-all" }}>
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function formatText(text) {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
    const isBullet = line.startsWith("•") || line.startsWith("📞") ||
                     line.startsWith("📧") || line.startsWith("🏢") ||
                     line.startsWith("🌐") || line.startsWith("🔗");
    const hasUrl = line.includes("http");
    return (
      <div key={i} style={{
        marginBottom: isBullet ? 4 : 2,
        lineHeight: 1.65,
        paddingLeft: line.startsWith("•") ? 4 : 0,
      }}>
        {hasUrl ? renderLineWithLinks(line) : line}
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
            ["Moins de 500 Millions FCFA", "500 Millions – 2 Milliards FCFA", "2 – 10 Milliards FCFA", "Plus de 10 Milliards FCFA"]);
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
        const fd = FORMATION_DATA[text];
        const filieresOpts = FILIERES_DATA[text];
        if (fd && filieresOpts) {
          _selectedType = text;
          setFlowState({ type: "formation_filiere", step: 2, data: { type: text } });
          const msg = `📚 ${text}\n\n${fd.desc}\n\n⏱️ Durée : ${fd.duree}\n🗓️ Horaires : ${fd.horaires}\n\n💡 ${fd.note}\n🔗 ${fd.lien}\n\nChoisissez un domaine pour les détails :`;
          addMessage("bot", msg, filieresOpts);
        } else if (fd) {
          setFlowState(null);
          const filieres = fd.filières.join("\n");
          const msg = `📚 ${text}\n\n${fd.desc}\n\n⏱️ ${fd.duree}\n🗓️ ${fd.horaires}\n\n📋 Contenu :\n${filieres}\n\n💡 ${fd.note}\n🔗 ${fd.lien}\n\n📧 commercial@ect.ci\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50`;
          addMessage("bot", msg);
        } else {
          setFlowState(null);
          setIsLoading(true);
          const reply = await callBackend(`Un prospect ECT s'intéresse aux "${text}" du Catalogue 2026.`, `Type : ${text}`);
          setIsLoading(false);
          addMessage("bot", reply);
        }
        return;
      }

      // Étape 2 : filière choisie → contenu réel du catalogue
      if (flowState.type === "formation_filiere" && flowState.step === 2) {
        setFlowState(null);
        const details = DETAILS_FILIERES[text];
        const typeChoisi = flowState.data?.type || _selectedType;
        const fd = FORMATION_DATA[typeChoisi];
        const lien = fd ? fd.lien : "https://catalogue-formations-ect-2026.netlify.app/";

        if (details && details.niveaux) {
          // Certificats Professionnels — 3 niveaux
          let msg = `🎓 ${text}\n\n`;
          details.niveaux.forEach(n => {
            msg += `━━ ${n.code} — ${n.niveau} (${n.duree}) ━━\n`;
            n.contenu.forEach(c => { msg += `  • ${c}\n`; });
            msg += "\n";
          });
          msg += `🗓️ Horaires : ${fd ? fd.horaires : "Samedis 08H–14H | Mardis & Jeudis 19H–21H"}\n`;
          msg += `🔗 ${lien}\n📧 commercial@ect.ci\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50`;
          addMessage("bot", msg);
        } else if (details && details.modules) {
          // Autres filières — contenu réel du catalogue
          const modules = details.modules.map(m => `  • ${m}`).join("\n");
          const msg = `📋 ${details.desc}\n\n📌 Modules / Thèmes :\n${modules}\n\n🗓️ ${details.horaires}\n🔗 ${lien}\n📧 commercial@ect.ci\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50`;
          addMessage("bot", msg);
        } else {
          // Fallback IA
          setIsLoading(true);
          const reply = await callBackend(
            `Un prospect ECT s'intéresse à la formation "${text}" dans la catégorie "${typeChoisi}". Donne les détails spécifiques du catalogue ECT 2026 et invite à contacter commercial@ect.ci.`,
            `Filière : ${text} | Catégorie : ${typeChoisi}`
          );
          setIsLoading(false);
          addMessage("bot", reply + `\n\n🔗 ${lien}\n📧 commercial@ect.ci\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50`);
        }
        return;
      }

      if (flowState.type === "portage" && flowState.step === 1) {
        setFlowState(null);
        if (text === "Nous contacter") {
          addMessage("bot",
            "Pour toute demande de portage salarial, contactez notre équipe :\n\n📧 commercial@ect.ci\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50\n🌐 www.ect.ci\n🏢 Route de Bingerville, Quartier Ayopoumin, Abidjan\n\nNos conseillers vous répondent dans les 24h ouvrées."
          );
          return;
        }
        if (text === "Obtenir un devis") {
          const link = document.createElement("a");
          link.href = "/fiche-portage-salarial.xltx";
          link.download = "Fiche_Renseignement_Portage_Salarial_ECT.xltx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          addMessage("bot",
            "📥 Le téléchargement de votre fiche de renseignement a démarré !\n\n📋 Remplissez la fiche avec :\n• Les postes et intitulés\n• Les salaires nets souhaités (FCFA)\n• Les dates de contrat\n• La situation de chaque salarié\n\nRetournez-la remplie à :\n📧 commercial@ect.ci\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50\n\nNos consultants vous enverront un devis précis sous 24h."
          );
          return;
        }
        setIsLoading(true);
        const reply = await callBackend(
          `Un prospect s'intéresse au portage salarial ECT et veut savoir : "${text}". Donne une réponse complète et professionnelle, puis invite à contacter commercial@ect.ci ou le (+225) 21.50.00.41.57.`,
          `Question portage salarial : ${text}`
        );
        setIsLoading(false);
        addMessage("bot", reply);
        return;
      }

      if (flowState.type === "outils" && flowState.step === 1) {
        setFlowState(null);
        const od = OUTILS_DATA[text];
        if (od) {
          const points = od.points.join("\n");
          const msg = `🔧 ${text}\n\n${od.desc}\n\n✨ Fonctionnalités :\n${points}\n\n🔗 En savoir plus : ${od.lien}\n📧 Demander une démo : ${od.demo}\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50`;
          addMessage("bot", msg);
        } else {
          setIsLoading(true);
          const reply = await callBackend(
            `Un prospect ECT s'intéresse à l'outil : "${text}". Présente-le en détail et invite à contacter commercial@ect.ci pour une démo.`,
            `Outil : ${text}`
          );
          setIsLoading(false);
          addMessage("bot", reply);
        }
        return;
      }
    }

    // ── Priorité 1 : Outils (avant tout) ────────────────────────────────────
    if (text === "Nos outils d'audit" || lower.match(/(nos outils|outils d.audit)/i) ||
        lower.match(/(outil|sectinel|si55|psa|stock skills|kmap|safe supplier)/)) {
      const apercu = Object.entries(OUTILS_DATA).map(([nom, data]) =>
        `▸ ${nom}\n  ${data.desc}`
      ).join("\n\n");
      addMessage("bot",
        `ECT propose 6 solutions technologiques propriétaires :\n\n${apercu}\n\n👉 Cliquez sur un outil pour en savoir plus.`,
        OUTILS_ECT
      );
      setFlowState({ type: "outils", step: 1, data: {} });
      return;
    }

    // ── Priorité 2 : Formations ──────────────────────────────────────────────
    // Type de formation exact → infos complètes + filières en une réponse
    if (FORMATION_DATA[text]) {
      const fd = FORMATION_DATA[text];
      const filieresOpts = FILIERES_DATA[text];
      if (filieresOpts) {
        _selectedType = text;
        setFlowState({ type: "formation_filiere", step: 2, data: { type: text } });
        const msg = `📚 ${text}\n\n${fd.desc}\n\n⏱️ Durée : ${fd.duree}\n🗓️ Horaires : ${fd.horaires}\n\n💡 ${fd.note}\n🔗 ${fd.lien}\n\nChoisissez un domaine pour les détails :`;
        addMessage("bot", msg, filieresOpts);
      } else {
        setFlowState(null);
        const filieres = fd.filières.join("\n");
        const msg = `📚 ${text}\n\n${fd.desc}\n\n⏱️ ${fd.duree}\n🗓️ ${fd.horaires}\n\n📋 Contenu :\n${filieres}\n\n💡 ${fd.note}\n🔗 ${fd.lien}\n\n📧 commercial@ect.ci\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50`;
        addMessage("bot", msg);
      }
      return;
    }
    // Si type sans filières → réponse directe (fallback)
    if (FORMATION_DATA[text]) {
      setFlowState(null);
      const fd = FORMATION_DATA[text];
      const filieres = fd.filières.join("\n");
      const msg = `📚 ${text}\n\n${fd.desc}\n\n⏱️ Durée : ${fd.duree}\n🗓️ Horaires : ${fd.horaires}\n\n📋 Contenu :\n${filieres}\n\n💡 ${fd.note}\n\n🔗 Voir le détail : ${fd.lien}\n\n📧 Inscription : commercial@ect.ci\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50`;
      addMessage("bot", msg);
      return;
    }
    // Mot-clé formation → afficher le menu des types
    if (lower.match(/(^nos formations$|formation|séminaire|certificat|certif|apprendre|cours|programme|inscription|inscrire|pecb)/)) {
      setFlowState({ type: "formation", step: 1, data: {} });
      addMessage("bot",
        "ECT propose 80+ formations dans le Catalogue 2026 !\n\nQuel type de formation vous intéresse ?",
        THEMATIQUES
      );
      return;
    }

    // ── Priorité 3 : Conseil & Audit ─────────────────────────────────────────
    if (lower.match(/(conseil|diagnostic|accompagn|audit)/) && !text.includes("outils")) {
      setFlowState({ type: "conseil", step: 1, data: {} });
      addMessage("bot",
        "ECT propose des audits et conseils personnalisés pour renforcer la performance de votre organisation.\n\nDans quel secteur d'activité évolue votre entreprise ?",
        ["Industrie / Manufacture", "Commerce / Distribution", "Services / Tertiaire", "Énergie / Mines", "BTP / Immobilier", "Agriculture", "Établissement financier", "Autre"]
      );
      return;
    }



    if (lower.match(/(portage|salarial|paie|bulletin|cnps|cmu|ressources humaines|rh externalisation)/)) {
      setFlowState({ type: "portage", step: 1, data: {} });
      addMessage("bot",
        "Le portage salarial ECT vous libère des contraintes administratives RH pour vous concentrer sur votre cœur de métier.\n\nQue souhaitez-vous savoir ?",
        ["Ce que ça inclut", "Les avantages pour mon entreprise", "Pourquoi choisir ECT", "Obtenir un devis", "Nous contacter"]
      );
      return;
    }


    if (lower.match(/(contact|rdv|rendez.vous|appel|téléphone|joindre|parler)/)) {
      addMessage("bot",
        "Vous pouvez nous joindre par les canaux suivants :\n\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50\n📧 ect@ect.ci — commercial@ect.ci\n🏢 Route de Bingerville, Quartier Ayopoumin, Abidjan\n🌐 www.ect.ci"
      );
      return;
    }

    // Fallback : tenter FAQ/IA, si réponse vague → rediriger commercial
    setIsLoading(true);
    const reply = await callBackend(text);
    setIsLoading(false);
    // Si la réponse IA semble vague ou si question complexe → ajouter redirection
    const vagueKeywords = ["je ne sais pas", "je n'ai pas", "je suis désolé", "contactez", "n'ai pas pu", "pas d'information"];
    const isVague = vagueKeywords.some(k => reply.toLowerCase().includes(k));
    if (isVague) {
      addMessage("bot",
        reply + "\n\n📞 (+225) 21.50.00.41.57 / 05.75.98.50.50\n📧 commercial@ect.ci\n🌐 www.ect.ci"
      );
    } else {
      addMessage("bot", reply);
    }
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

  const quickActions = ["Nos formations", "Demander un conseil", "Portage salarial", "Nos outils d'audit", "Nous contacter"];

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
        .w-card-full { grid-column: 1 / -1; }
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
                  <button key={i} className={`w-card${quickActions.length % 2 !== 0 && i === quickActions.length - 1 ? " w-card-full" : ""}`} onClick={() => handleOption(label)}>
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