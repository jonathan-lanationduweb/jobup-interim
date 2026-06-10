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

  var JOBS = (window.JobStore ? window.JobStore.getPublishedJobs() : []);

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
