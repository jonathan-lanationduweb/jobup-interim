/* ==========================================================================
   jobs.js — Job data, list rendering & detail panel (Offres d'emploi)
   ========================================================================== */
window.JobBoard = (function () {
  "use strict";

  var I = {
    pin: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    case: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    euro: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 7a6 6 0 1 0 0 10"/><path d="M4 11h8M4 14h7"/></svg>',
    bookmark: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    arrow: '<svg class="icon arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  var JOBS = [
    {
      id: "macon", title: "Maçon traditionnel H/F", company: "BTP Solutions Group",
      city: "Lyon", dept: "69", contract: "Intérim", duration: "3 mois", sector: "BTP",
      salary: "13,50 €/h", salaryMonth: 2050, tags: ["CACES R408", "Permis B"],
      ageDays: 2, posted: "Publié il y a 2j", isNew: true,
      desc: "Mission de 3 mois renouvelable sur chantier de construction d'immeuble R+4. Maçonnerie traditionnelle, lecture de plans, travail en équipe.",
      missions: "Réalisation de murs en parpaings et briques, coffrages traditionnels, ferraillage et coulage de béton. Lecture de plans, prises de cotes, implantation.",
      profile: ["CAP/BEP Maçonnerie ou équivalent", "3 ans d'expérience minimum", "Habilitation travail en hauteur appréciée", "Permis B"],
      perks: ["13,50 €/h + paniers + déplacements", "Prime de fin de mission", "Mutuelle intérim", "Possibilité CDI en fin de mission"]
    },
    {
      id: "chef-chantier", title: "Chef de chantier TP H/F", company: "Routes & Réseaux",
      city: "Paris", dept: "75", contract: "CDI", duration: "", sector: "BTP",
      salary: "42–48 K€", salaryMonth: 3750, tags: ["10 ans XP", "Permis B+C"], tagStyle: "green",
      ageDays: 0.2, posted: "Publié il y a 5h", isNew: true,
      desc: "Direction de chantiers de travaux publics (voirie, réseaux). Management d'équipes de 5 à 10 compagnons. Reporting hebdomadaire.",
      missions: "Organisation et suivi des chantiers de voirie et réseaux divers. Encadrement des équipes, gestion des approvisionnements, respect des délais et de la sécurité.",
      profile: ["Formation BTP / conducteur de travaux", "10 ans d'expérience en TP", "Maîtrise lecture de plans VRD", "Permis B et C"],
      perks: ["Salaire 42–48 K€ selon profil", "Véhicule de fonction", "Primes et 13e mois", "Mutuelle famille"]
    },
    {
      id: "comptable", title: "Comptable expérimenté(e) H/F", company: "Fiducial Expertise",
      city: "Bordeaux", dept: "33", contract: "CDD", duration: "6 mois", sector: "Tertiaire",
      salary: "2 600 €/mois", salaryMonth: 2600, tags: ["Sage 100", "TVA"],
      ageDays: 1, posted: "Publié il y a 1j", isNew: true,
      desc: "Remplacement congé maternité dans un cabinet d'expertise comptable. Tenue de la comptabilité d'un portefeuille de clients TPE/PME.",
      missions: "Saisie et révision comptable, déclarations de TVA, rapprochements bancaires, préparation des bilans en lien avec l'expert-comptable.",
      profile: ["BTS Comptabilité ou DCG", "5 ans en cabinet apprécié", "Maîtrise de Sage 100", "Rigueur et autonomie"],
      perks: ["2 600 €/mois sur 12 mois", "Tickets restaurant", "Télétravail 2j/semaine", "Cadre de travail moderne"]
    },
    {
      id: "cariste", title: "Cariste CACES 1-3-5 H/F", company: "LogiDis France",
      city: "Lille", dept: "59", contract: "Intérim", duration: "6 mois", sector: "Environnement",
      salary: "14,20 €/h", salaryMonth: 2155, tags: ["CACES 1-3-5", "2×8"], tagStyle: "amber",
      ageDays: 3, posted: "Publié il y a 3j", isNew: false,
      desc: "Préparation de commandes, chargement/déchargement de camions, gerbage sur racks. Entrepôt de 12 000 m². Horaires en 2×8.",
      missions: "Conduite de chariots élévateurs (CACES 1, 3 et 5), réception et stockage des marchandises, préparation de commandes, gestion des emplacements.",
      profile: ["CACES 1-3-5 à jour", "Expérience en entrepôt", "Disponible en 2×8", "Sérieux et ponctualité"],
      perks: ["14,20 €/h + prime de productivité", "Paniers repas", "Heures supplémentaires majorées", "Mission longue durée"]
    },
    {
      id: "electricien", title: "Électricien bâtiment H/F", company: "Élec Confort",
      city: "Nantes", dept: "44", contract: "Intérim", duration: "4 mois", sector: "BTP",
      salary: "14,80 €/h", salaryMonth: 2245, tags: ["Habilitation B1V", "Permis B"],
      ageDays: 4, posted: "Publié il y a 4j", isNew: false,
      desc: "Installation et raccordement électrique sur chantiers tertiaires neufs. Tirage de câbles, pose d'appareillages, mise en service.",
      missions: "Pose de chemins de câbles, tirage et raccordement, installation de tableaux et appareillages, contrôle et mise en service des installations.",
      profile: ["CAP/BEP Électrotechnique", "Habilitations électriques à jour", "Lecture de schémas", "Permis B"],
      perks: ["14,80 €/h + déplacements", "Outillage fourni", "Prime de fin de mission", "Formations habilitations"]
    },
    {
      id: "assistant", title: "Assistant administratif H/F", company: "Altys Gestion",
      city: "La Défense", dept: "92", contract: "CDD", duration: "3 mois", sector: "Tertiaire",
      salary: "2 100 €/mois", salaryMonth: 2100, tags: ["Pack Office", "Accueil"],
      ageDays: 5, posted: "Publié il y a 5j", isNew: false,
      desc: "Accueil téléphonique, suivi des dossiers, gestion administrative et mise à jour des documents internes au sein d'un service RH.",
      missions: "Gestion du standard et de l'accueil, traitement du courrier, classement et archivage, mise à jour des bases de données et reporting.",
      profile: ["Bac+2 assistanat / gestion", "Aisance relationnelle", "Maîtrise du Pack Office", "Organisation et discrétion"],
      perks: ["2 100 €/mois", "Tickets restaurant", "Transports remboursés 50%", "Équipe bienveillante"]
    },
    {
      id: "chauffeur", title: "Chauffeur PL/SPL H/F", company: "Trans Express",
      city: "Lyon", dept: "69", contract: "CDI", duration: "", sector: "Environnement",
      salary: "2 400 €/mois", salaryMonth: 2400, tags: ["Permis CE", "FIMO/FCO"],
      ageDays: 6, posted: "Publié il y a 6j", isNew: false,
      desc: "Livraison régionale de marchandises en messagerie. Chargement, contrôle et déchargement. Relation client sur les points de livraison.",
      missions: "Conduite d'un porteur ou ensemble SPL, organisation de la tournée, chargement et arrimage, livraison et remontée d'informations.",
      profile: ["Permis C/CE valides", "FIMO/FCO et carte conducteur à jour", "Expérience en messagerie", "Bon relationnel"],
      perks: ["2 400 €/mois + primes", "Découchés indemnisés", "Mutuelle entreprise", "Matériel récent"]
    },
    {
      id: "grutier", title: "Grutier H/F", company: "Levage & Co",
      city: "Marseille", dept: "13", contract: "Intérim", duration: "5 mois", sector: "BTP",
      salary: "15,50 €/h", salaryMonth: 2350, tags: ["CACES R487", "GME"], tagStyle: "amber",
      ageDays: 8, posted: "Publié il y a 8j", isNew: false,
      desc: "Conduite de grue à tour sur chantier de construction de logements collectifs. Manutention et levage en sécurité.",
      missions: "Conduite de grue à tour GME, levage et déplacement des charges, vérifications quotidiennes, coordination avec les équipes au sol.",
      profile: ["CACES R487 catégorie 1", "Expérience confirmée en levage", "Vigilance et sang-froid", "Respect strict des consignes"],
      perks: ["15,50 €/h + paniers", "Prime de hauteur", "Mission longue", "Suivi sécurité dédié"]
    },
    {
      id: "plombier", title: "Plombier chauffagiste H/F", company: "Therm'Eau",
      city: "Toulouse", dept: "31", contract: "Intérim", duration: "3 mois", sector: "BTP",
      salary: "14,00 €/h", salaryMonth: 2125, tags: ["Soudure", "Permis B"],
      ageDays: 9, posted: "Publié il y a 9j", isNew: false,
      desc: "Installation et entretien de réseaux de plomberie et chauffage en rénovation. Travail soigné chez des particuliers et tertiaire.",
      missions: "Pose de réseaux cuivre/PER, installation de chaudières et radiateurs, soudure, mise en service et dépannage.",
      profile: ["CAP Installateur sanitaire/thermique", "Maîtrise de la soudure", "Autonomie sur chantier", "Permis B"],
      perks: ["14,00 €/h + déplacements", "Véhicule de service", "Prime de fin de mission", "Formations régulières"]
    },
    {
      id: "preparateur", title: "Préparateur de commandes H/F", company: "Logistock",
      city: "Rungis", dept: "94", contract: "Intérim", duration: "2 mois", sector: "Environnement",
      salary: "12,50 €/h", salaryMonth: 1900, tags: ["CACES 1", "Frais"],
      ageDays: 10, posted: "Publié il y a 10j", isNew: false,
      desc: "Préparation de commandes en environnement frais (2–4°C). Utilisation du scan et du transpalette électrique.",
      missions: "Préparation des commandes au scan, palettisation et filmage, contrôle qualité, gestion des emplacements en zone froide.",
      profile: ["CACES 1 apprécié", "Résistance au froid", "Rythme soutenu", "Esprit d'équipe"],
      perks: ["12,50 €/h + prime froid", "Paniers repas", "Heures sup majorées", "Mission renouvelable"]
    },
    {
      id: "rh", title: "Chargé(e) de recrutement H/F", company: "TalentLink",
      city: "Paris", dept: "75", contract: "CDI", duration: "", sector: "Tertiaire",
      salary: "32–36 K€", salaryMonth: 2800, tags: ["Sourcing", "ATS"], tagStyle: "green",
      ageDays: 12, posted: "Publié il y a 12j", isNew: false,
      desc: "Pilotage du cycle de recrutement complet pour des clients BTP et tertiaire. Sourcing, entretiens, suivi des candidats.",
      missions: "Rédaction et diffusion des annonces, sourcing multicanal, présélection et entretiens, suivi des intégrations et reporting.",
      profile: ["Bac+3/5 RH ou équivalent", "2 ans en recrutement/intérim", "Maîtrise des outils ATS", "Excellent relationnel"],
      perks: ["32–36 K€ + variable", "Télétravail hybride", "RTT", "Parcours d'évolution"]
    },
    {
      id: "magasinier", title: "Magasinier gestionnaire stock H/F", company: "IndusPro",
      city: "Strasbourg", dept: "67", contract: "CDD", duration: "8 mois", sector: "Environnement",
      salary: "2 050 €/mois", salaryMonth: 2050, tags: ["ERP", "CACES 3"],
      ageDays: 15, posted: "Publié il y a 15j", isNew: false,
      desc: "Gestion des stocks de pièces industrielles, réception et expédition, inventaires tournants et saisie sur ERP.",
      missions: "Réception et contrôle des marchandises, rangement et préparation, gestion des entrées/sorties sur ERP, inventaires.",
      profile: ["Expérience en magasinage", "CACES 3 à jour", "Aisance informatique (ERP)", "Organisation"],
      perks: ["2 050 €/mois", "Tickets restaurant", "Prime d'objectifs", "Horaires de journée"]
    }
  ];

  var listEl, detailEl, state = { activeId: null };

  function metaIcons(job) {
    return (
      '<span class="meta">' + I.pin + job.city + " (" + job.dept + ")</span>" +
      '<span class="meta">' + I.case + job.contract + (job.duration ? " · " + job.duration : "") + "</span>" +
      '<span class="meta">' + I.euro + job.salary + "</span>"
    );
  }

  function tagsHtml(job) {
    var cls = job.tagStyle === "green" ? "chip--green" : job.tagStyle === "amber" ? "chip--amber" : "chip--tag";
    return job.tags.map(function (t) { return '<span class="chip ' + cls + '">' + t + "</span>"; }).join("");
  }

  /* Secteurs → couleur + libellé affiché */
  var SECTOR = {
    "BTP": { label: "BTP & Construction", color: "#F59E0B" },
    "Tertiaire": { label: "Tertiaire", color: "#D946EF" },
    "Environnement": { label: "Environnement", color: "#22C55E" }
  };
  function sectorOf(job) { return SECTOR[job.sector] || { label: job.sector, color: "#0D5BD7" }; }
  function sectorBadge(job) {
    var s = sectorOf(job);
    return '<span class="sector-badge" style="--sc:' + s.color + '">' + s.label + "</span>";
  }

  function renderList(jobs) {
    if (!listEl) return;
    if (!jobs.length) {
      listEl.innerHTML = '<div class="card jobs-empty">Aucune offre ne correspond à vos critères.<br>Essayez d\'élargir votre recherche.</div>';
      if (detailEl) detailEl.style.display = "none";
      return;
    }
    if (detailEl) detailEl.style.display = "";
    listEl.innerHTML = jobs.map(function (job) {
      return (
        '<article class="card card--hover job-card" data-id="' + job.id + '" style="--sc:' + sectorOf(job).color + '" tabindex="0" role="button" aria-label="Voir l\'offre ' + job.title + '">' +
          '<div class="job-card__top">' +
            "<div><h3 class=\"job-card__title\">" + job.title + "</h3>" +
            '<p class="job-card__company">' + job.company + "</p></div>" +
          "</div>" +
          '<div class="meta-row job-card__meta">' + metaIcons(job) + "</div>" +
          '<div class="job-card__tags">' + sectorBadge(job) + tagsHtml(job) + "</div>" +
          '<p class="job-card__desc">' + job.desc + "</p>" +
          '<div class="job-card__foot"><span>' + job.posted + "</span>" +
            (job.isNew ? '<span class="badge--new">Nouveau</span>' : "") +
          "</div>" +
        "</article>"
      );
    }).join("");

    // wire selection
    listEl.querySelectorAll(".job-card").forEach(function (card) {
      var act = function () { selectJob(card.getAttribute("data-id")); };
      card.addEventListener("click", act);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); }
      });
    });

    // keep active selection if still present, else select first
    var stillThere = jobs.some(function (j) { return j.id === state.activeId; });
    selectJob(stillThere ? state.activeId : jobs[0].id);
  }

  function applyUrl(job) {
    var params = new URLSearchParams({
      apply: "1",
      job: job.id,
      poste: job.title,
      entreprise: job.company,
      lieu: job.city + " (" + job.dept + ")",
      contrat: job.contract + (job.duration ? " · " + job.duration : ""),
      remu: job.salary,
      secteur: job.sector
    });
    return "contact.html?" + params.toString();
  }

  function renderDetail(job) {
    if (!detailEl || !job) return;
    detailEl.style.setProperty("--sc", sectorOf(job).color);
    detailEl.innerHTML =
      '<div class="job-detail__sector">' + sectorBadge(job) + "</div>" +
      '<h2 class="job-detail__title">' + job.title + "</h2>" +
      '<p class="job-detail__company">' + job.company + "</p>" +
      '<div class="meta-row job-detail__meta">' +
        '<span class="meta-row__item">' + I.pin + job.city + " (" + job.dept + ")</span>" +
        '<span class="meta-row__item">' + I.case + job.posted + "</span>" +
      "</div>" +
      '<div class="job-detail__actions">' +
        '<a class="btn btn--deep" href="' + applyUrl(job) + '">Postuler ' + I.arrow + "</a>" +
      "</div>" +
      '<dl class="job-detail__summary">' +
        "<div><dt>Contrat</dt><dd>" + job.contract + (job.duration ? " · " + job.duration : "") + "</dd></div>" +
        "<div><dt>Rémunération</dt><dd>" + job.salary + "</dd></div>" +
      "</dl>" +
      "<h3>À propos de la mission</h3><p>" + job.desc + "</p>" +
      "<h3>Vos missions</h3><p>" + job.missions + "</p>" +
      "<h3>Profil recherché</h3><ul class=\"ticked\">" + job.profile.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>" +
      "<h3>Ce que nous offrons</h3><ul class=\"ticked\">" + job.perks.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>";
    detailEl.scrollTop = 0;
  }

  function selectJob(id) {
    state.activeId = id;
    var job = JOBS.filter(function (j) { return j.id === id; })[0];
    if (listEl) {
      listEl.querySelectorAll(".job-card").forEach(function (c) {
        c.classList.toggle("is-active", c.getAttribute("data-id") === id);
      });
    }
    renderDetail(job);
  }

  function init() {
    listEl = document.querySelector("[data-jobs-list]");
    detailEl = document.querySelector("[data-job-detail]");
    if (!listEl) return;
    // Pré-sélection d'une offre depuis l'accueil (?job=ID)
    var jobParam = new URLSearchParams(window.location.search).get("job");
    if (jobParam && JOBS.some(function (j) { return j.id === jobParam; })) state.activeId = jobParam;
    renderList(JOBS);
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    JOBS: JOBS,
    render: renderList,
    selectJob: selectJob,
    state: state
  };
})();
