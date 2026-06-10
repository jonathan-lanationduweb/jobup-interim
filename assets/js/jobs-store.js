/* ==========================================================================
   jobs-store.js — SOURCE UNIQUE des offres + couche service (CRUD)
   --------------------------------------------------------------------------
   Toutes les offres du site (accueil/offres + backoffice admin) proviennent
   d'ici. Ne PAS dupliquer les offres ailleurs.

   ⚠️ PERSISTANCE — IMPORTANT POUR LA PRODUCTION
   GitHub Pages est 100% statique : il n'y a pas de base de données partagée.
   Cette implémentation utilise localStorage = stockage LOCAL AU NAVIGATEUR.
   => Les ajouts/modifs faits dans /admin.html ne sont visibles QUE sur le
      navigateur de la personne qui les a faits. Ce n'est PAS une vraie
      publication multi-utilisateurs.

   POUR LA PRODUCTION, brancher un backend réel (Supabase recommandé) :
     - créer une table `jobs` dans Supabase,
     - remplacer le corps des fonctions ci-dessous (getJobs/createJob/…)
       par des appels supabase.from('jobs').select()/insert()/update()/delete(),
     - protéger /admin via Supabase Auth (voir admin.html).
   La signature des fonctions (getJobs, getJobById, createJob, updateJob,
   deleteJob) est conçue pour être asynchrone-compatible : on peut les passer
   en async/await sans changer les appelants si on adapte un peu.
   ========================================================================== */
window.JobStore = (function () {
  "use strict";

  var KEY = "jobup_jobs_v1";

  /* ---- Seed : jeu d'offres par défaut (source de vérité initiale) ---- */
  var SEED = [
    { id: "macon", title: "Maçon traditionnel H/F", company: "BTP Solutions Group", city: "Lyon", dept: "69", contract: "Intérim", duration: "3 mois", sector: "BTP", salary: "13,50 €/h", salaryMonth: 2050, tags: ["CACES R408", "Permis B"], ageDays: 2, posted: "Publié il y a 2j", isNew: true, status: "publié",
      desc: "Mission de 3 mois renouvelable sur chantier de construction d'immeuble R+4. Maçonnerie traditionnelle, lecture de plans, travail en équipe.",
      missions: "Réalisation de murs en parpaings et briques, coffrages traditionnels, ferraillage et coulage de béton. Lecture de plans, prises de cotes, implantation.",
      profile: ["CAP/BEP Maçonnerie ou équivalent", "3 ans d'expérience minimum", "Habilitation travail en hauteur appréciée", "Permis B"],
      perks: ["13,50 €/h + paniers + déplacements", "Prime de fin de mission", "Mutuelle intérim", "Possibilité CDI en fin de mission"] },
    { id: "chef-chantier", title: "Chef de chantier TP H/F", company: "Routes & Réseaux", city: "Paris", dept: "75", contract: "CDI", duration: "", sector: "BTP", salary: "42–48 K€", salaryMonth: 3750, tags: ["10 ans XP", "Permis B+C"], tagStyle: "green", ageDays: 0.2, posted: "Publié il y a 5h", isNew: true, status: "publié",
      desc: "Direction de chantiers de travaux publics (voirie, réseaux). Management d'équipes de 5 à 10 compagnons. Reporting hebdomadaire.",
      missions: "Organisation et suivi des chantiers de voirie et réseaux divers. Encadrement des équipes, gestion des approvisionnements, respect des délais et de la sécurité.",
      profile: ["Formation BTP / conducteur de travaux", "10 ans d'expérience en TP", "Maîtrise lecture de plans VRD", "Permis B et C"],
      perks: ["Salaire 42–48 K€ selon profil", "Véhicule de fonction", "Primes et 13e mois", "Mutuelle famille"] },
    { id: "comptable", title: "Comptable expérimenté(e) H/F", company: "Fiducial Expertise", city: "Bordeaux", dept: "33", contract: "CDD", duration: "6 mois", sector: "Tertiaire", salary: "2 600 €/mois", salaryMonth: 2600, tags: ["Sage 100", "TVA"], ageDays: 1, posted: "Publié il y a 1j", isNew: true, status: "publié",
      desc: "Remplacement congé maternité dans un cabinet d'expertise comptable. Tenue de la comptabilité d'un portefeuille de clients TPE/PME.",
      missions: "Saisie et révision comptable, déclarations de TVA, rapprochements bancaires, préparation des bilans en lien avec l'expert-comptable.",
      profile: ["BTS Comptabilité ou DCG", "5 ans en cabinet apprécié", "Maîtrise de Sage 100", "Rigueur et autonomie"],
      perks: ["2 600 €/mois sur 12 mois", "Tickets restaurant", "Télétravail 2j/semaine", "Cadre de travail moderne"] },
    { id: "cariste", title: "Cariste CACES 1-3-5 H/F", company: "LogiDis France", city: "Lille", dept: "59", contract: "Intérim", duration: "6 mois", sector: "Environnement", salary: "14,20 €/h", salaryMonth: 2155, tags: ["CACES 1-3-5", "2×8"], tagStyle: "amber", ageDays: 3, posted: "Publié il y a 3j", isNew: false, status: "publié",
      desc: "Préparation de commandes, chargement/déchargement de camions, gerbage sur racks. Entrepôt de 12 000 m². Horaires en 2×8.",
      missions: "Conduite de chariots élévateurs (CACES 1, 3 et 5), réception et stockage des marchandises, préparation de commandes, gestion des emplacements.",
      profile: ["CACES 1-3-5 à jour", "Expérience en entrepôt", "Disponible en 2×8", "Sérieux et ponctualité"],
      perks: ["14,20 €/h + prime de productivité", "Paniers repas", "Heures supplémentaires majorées", "Mission longue durée"] },
    { id: "electricien", title: "Électricien bâtiment H/F", company: "Élec Confort", city: "Nantes", dept: "44", contract: "Intérim", duration: "4 mois", sector: "BTP", salary: "14,80 €/h", salaryMonth: 2245, tags: ["Habilitation B1V", "Permis B"], ageDays: 4, posted: "Publié il y a 4j", isNew: false, status: "publié",
      desc: "Installation et raccordement électrique sur chantiers tertiaires neufs. Tirage de câbles, pose d'appareillages, mise en service.",
      missions: "Pose de chemins de câbles, tirage et raccordement, installation de tableaux et appareillages, contrôle et mise en service des installations.",
      profile: ["CAP/BEP Électrotechnique", "Habilitations électriques à jour", "Lecture de schémas", "Permis B"],
      perks: ["14,80 €/h + déplacements", "Outillage fourni", "Prime de fin de mission", "Formations habilitations"] },
    { id: "assistant", title: "Assistant administratif H/F", company: "Altys Gestion", city: "La Défense", dept: "92", contract: "CDD", duration: "3 mois", sector: "Tertiaire", salary: "2 100 €/mois", salaryMonth: 2100, tags: ["Pack Office", "Accueil"], ageDays: 5, posted: "Publié il y a 5j", isNew: false, status: "publié",
      desc: "Accueil téléphonique, suivi des dossiers, gestion administrative et mise à jour des documents internes au sein d'un service RH.",
      missions: "Gestion du standard et de l'accueil, traitement du courrier, classement et archivage, mise à jour des bases de données et reporting.",
      profile: ["Bac+2 assistanat / gestion", "Aisance relationnelle", "Maîtrise du Pack Office", "Organisation et discrétion"],
      perks: ["2 100 €/mois", "Tickets restaurant", "Transports remboursés 50%", "Équipe bienveillante"] },
    { id: "chauffeur", title: "Chauffeur PL/SPL H/F", company: "Trans Express", city: "Lyon", dept: "69", contract: "CDI", duration: "", sector: "Environnement", salary: "2 400 €/mois", salaryMonth: 2400, tags: ["Permis CE", "FIMO/FCO"], ageDays: 6, posted: "Publié il y a 6j", isNew: false, status: "publié",
      desc: "Livraison régionale de marchandises en messagerie. Chargement, contrôle et déchargement. Relation client sur les points de livraison.",
      missions: "Conduite d'un porteur ou ensemble SPL, organisation de la tournée, chargement et arrimage, livraison et remontée d'informations.",
      profile: ["Permis C/CE valides", "FIMO/FCO et carte conducteur à jour", "Expérience en messagerie", "Bon relationnel"],
      perks: ["2 400 €/mois + primes", "Découchés indemnisés", "Mutuelle entreprise", "Matériel récent"] },
    { id: "grutier", title: "Grutier H/F", company: "Levage & Co", city: "Marseille", dept: "13", contract: "Intérim", duration: "5 mois", sector: "BTP", salary: "15,50 €/h", salaryMonth: 2350, tags: ["CACES R487", "GME"], tagStyle: "amber", ageDays: 8, posted: "Publié il y a 8j", isNew: false, status: "publié",
      desc: "Conduite de grue à tour sur chantier de construction de logements collectifs. Manutention et levage en sécurité.",
      missions: "Conduite de grue à tour GME, levage et déplacement des charges, vérifications quotidiennes, coordination avec les équipes au sol.",
      profile: ["CACES R487 catégorie 1", "Expérience confirmée en levage", "Vigilance et sang-froid", "Respect strict des consignes"],
      perks: ["15,50 €/h + paniers", "Prime de hauteur", "Mission longue", "Suivi sécurité dédié"] },
    { id: "plombier", title: "Plombier chauffagiste H/F", company: "Therm'Eau", city: "Toulouse", dept: "31", contract: "Intérim", duration: "3 mois", sector: "BTP", salary: "14,00 €/h", salaryMonth: 2125, tags: ["Soudure", "Permis B"], ageDays: 9, posted: "Publié il y a 9j", isNew: false, status: "publié",
      desc: "Installation et entretien de réseaux de plomberie et chauffage en rénovation. Travail soigné chez des particuliers et tertiaire.",
      missions: "Pose de réseaux cuivre/PER, installation de chaudières et radiateurs, soudure, mise en service et dépannage.",
      profile: ["CAP Installateur sanitaire/thermique", "Maîtrise de la soudure", "Autonomie sur chantier", "Permis B"],
      perks: ["14,00 €/h + déplacements", "Véhicule de service", "Prime de fin de mission", "Formations régulières"] },
    { id: "preparateur", title: "Préparateur de commandes H/F", company: "Logistock", city: "Rungis", dept: "94", contract: "Intérim", duration: "2 mois", sector: "Environnement", salary: "12,50 €/h", salaryMonth: 1900, tags: ["CACES 1", "Frais"], ageDays: 10, posted: "Publié il y a 10j", isNew: false, status: "publié",
      desc: "Préparation de commandes en environnement frais (2–4°C). Utilisation du scan et du transpalette électrique.",
      missions: "Préparation des commandes au scan, palettisation et filmage, contrôle qualité, gestion des emplacements en zone froide.",
      profile: ["CACES 1 apprécié", "Résistance au froid", "Rythme soutenu", "Esprit d'équipe"],
      perks: ["12,50 €/h + prime froid", "Paniers repas", "Heures sup majorées", "Mission renouvelable"] },
    { id: "rh", title: "Chargé(e) de recrutement H/F", company: "TalentLink", city: "Paris", dept: "75", contract: "CDI", duration: "", sector: "Tertiaire", salary: "32–36 K€", salaryMonth: 2800, tags: ["Sourcing", "ATS"], tagStyle: "green", ageDays: 12, posted: "Publié il y a 12j", isNew: false, status: "publié",
      desc: "Pilotage du cycle de recrutement complet pour des clients BTP et tertiaire. Sourcing, entretiens, suivi des candidats.",
      missions: "Rédaction et diffusion des annonces, sourcing multicanal, présélection et entretiens, suivi des intégrations et reporting.",
      profile: ["Bac+3/5 RH ou équivalent", "2 ans en recrutement/intérim", "Maîtrise des outils ATS", "Excellent relationnel"],
      perks: ["32–36 K€ + variable", "Télétravail hybride", "RTT", "Parcours d'évolution"] },
    { id: "magasinier", title: "Magasinier gestionnaire stock H/F", company: "IndusPro", city: "Strasbourg", dept: "67", contract: "CDD", duration: "8 mois", sector: "Environnement", salary: "2 050 €/mois", salaryMonth: 2050, tags: ["ERP", "CACES 3"], ageDays: 15, posted: "Publié il y a 15j", isNew: false, status: "publié",
      desc: "Gestion des stocks de pièces industrielles, réception et expédition, inventaires tournants et saisie sur ERP.",
      missions: "Réception et contrôle des marchandises, rangement et préparation, gestion des entrées/sorties sur ERP, inventaires.",
      profile: ["Expérience en magasinage", "CACES 3 à jour", "Aisance informatique (ERP)", "Organisation"],
      perks: ["2 050 €/mois", "Tickets restaurant", "Prime d'objectifs", "Horaires de journée"] }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function slugify(s) {
    return (s || "offre").toString().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || ("offre-" + Date.now());
  }

  /* ---- Fallback localStorage (démo, si Supabase indisponible) ---- */
  function lkLoad() { try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {} return clone(SEED); }
  function lkSave(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} }

  /* ---- Client Supabase (clé publique uniquement) ---- */
  var cfg = window.SUPABASE_CONFIG || {};
  var TABLE = cfg.table || "jobs";
  var sb = (window.supabase && cfg.url && cfg.anonKey) ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;
  function rowToJob(row) { var j = Object.assign({}, row.data || {}); j.id = row.id; if (row.status) j.status = row.status; return j; }
  function jobToRow(job) { return { id: job.id, status: job.status || "publié", data: job }; }

  /* ---- API service (async — Supabase si configuré, sinon localStorage) ---- */
  function getPublishedJobs() {
    if (sb) {
      return sb.from(TABLE).select("id,status,data").eq("status", "publié").then(function (res) {
        if (res.error) throw res.error;
        if (res.data && res.data.length) return res.data.map(rowToJob);
        return lkLoad().filter(function (j) { return j.status !== "brouillon"; });
      }).catch(function (e) {
        console.warn("[JobStore] Supabase indisponible → fallback local:", (e && e.message) || e);
        return lkLoad().filter(function (j) { return j.status !== "brouillon"; });
      });
    }
    return Promise.resolve(lkLoad().filter(function (j) { return j.status !== "brouillon"; }));
  }
  function getJobs() {
    if (sb) {
      return sb.from(TABLE).select("id,status,data").then(function (res) {
        if (res.error) throw res.error;
        return (res.data || []).map(rowToJob);
      }).catch(function (e) { console.warn("[JobStore] fallback local:", (e && e.message) || e); return lkLoad(); });
    }
    return Promise.resolve(lkLoad());
  }
  function getJobById(id) {
    if (sb) {
      return sb.from(TABLE).select("id,status,data").eq("id", id).maybeSingle().then(function (res) {
        if (res.error) throw res.error; return res.data ? rowToJob(res.data) : null;
      }).catch(function () { return lkLoad().filter(function (j) { return j.id === id; })[0] || null; });
    }
    return Promise.resolve(lkLoad().filter(function (j) { return j.id === id; })[0] || null);
  }
  function createJob(job) {
    if (!job.id) job.id = slugify(job.title) + "-" + Date.now().toString(36).slice(-4);
    if (!job.posted) job.posted = "Publié aujourd'hui";
    if (job.salaryMonth == null) job.salaryMonth = 0;
    if (!job.tags) job.tags = [];
    if (!job.status) job.status = "publié";
    if (sb) { return sb.from(TABLE).insert(jobToRow(job)).then(function (res) { if (res.error) throw res.error; return job; }); }
    var list = lkLoad(); list.unshift(job); lkSave(list); return Promise.resolve(job);
  }
  function updateJob(id, patch) {
    if (sb) {
      return getJobById(id).then(function (cur) {
        var merged = Object.assign({}, cur || {}, patch); merged.id = id;
        return sb.from(TABLE).update({ status: merged.status || "publié", data: merged }).eq("id", id).then(function (res) { if (res.error) throw res.error; return merged; });
      });
    }
    var list = lkLoad().map(function (j) { return j.id === id ? Object.assign({}, j, patch) : j; });
    lkSave(list); return Promise.resolve(list.filter(function (j) { return j.id === id; })[0]);
  }
  function deleteJob(id) {
    if (sb) { return sb.from(TABLE).delete().eq("id", id).then(function (res) { if (res.error) throw res.error; }); }
    lkSave(lkLoad().filter(function (j) { return j.id !== id; })); return Promise.resolve();
  }
  function setStatus(id, status) { return updateJob(id, { status: status }); }
  function pushSeed() {
    if (sb) { return sb.from(TABLE).upsert(SEED.map(jobToRow)).then(function (res) { if (res.error) throw res.error; }); }
    lkSave(clone(SEED)); return Promise.resolve();
  }
  function resetSeed() { return pushSeed(); }

  /* ---- Auth admin (Supabase Auth) ---- */
  var auth = {
    signIn: function (email, password) {
      if (sb) return sb.auth.signInWithPassword({ email: email, password: password });
      return Promise.resolve({ data: { demo: true }, error: null });
    },
    signOut: function () { return sb ? sb.auth.signOut() : Promise.resolve(); },
    getUser: function () {
      if (!sb) return Promise.resolve(null);
      return sb.auth.getSession().then(function (r) { return r.data && r.data.session ? r.data.session.user : null; });
    }
  };

  return {
    isRemote: !!sb,
    getJobs: getJobs,
    getPublishedJobs: getPublishedJobs,
    getJobById: getJobById,
    createJob: createJob,
    updateJob: updateJob,
    deleteJob: deleteJob,
    setStatus: setStatus,
    pushSeed: pushSeed,
    resetSeed: resetSeed,
    slugify: slugify,
    auth: auth,
    SEED: SEED
  };
})();
