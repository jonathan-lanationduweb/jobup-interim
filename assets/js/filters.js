/* ==========================================================================
   filters.js — Dynamic filtering, search & sorting for the job board
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.JobBoard) return;
    function getJOBS() { return (window.JobBoard && window.JobBoard.JOBS) || []; }

    var els = {
      contract: Array.prototype.slice.call(document.querySelectorAll("[name='contract']")),
      sector: Array.prototype.slice.call(document.querySelectorAll("[name='sector']")),
      date: Array.prototype.slice.call(document.querySelectorAll("[name='date']")),
      salary: document.querySelector("[data-salary]"),
      salaryOut: document.querySelector("[data-salary-out]"),
      metier: document.querySelector("[data-search-metier]"),
      ville: document.querySelector("[data-search-ville]"),
      type: document.querySelector("[data-search-type]"),
      sort: document.querySelector("[data-sort]"),
      reset: document.querySelector("[data-reset]"),
      count: document.querySelector("[data-count]"),
      searchBtn: document.querySelector("[data-search-btn]"),
      form: document.querySelector("[data-search-form]")
    };

    /* ---- Bouton "Filtres" (mobile) ---- */
    (function () {
      var toggle = document.querySelector("[data-filters-toggle]");
      var panel = document.querySelector("[data-filters]");
      if (!toggle || !panel) return;
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    })();

    /* ---- Custom dropdown "Tous types" (options centrées) ---- */
    (function () {
      var dd = document.querySelector("[data-dd]");
      if (!dd) return;
      var btn = dd.querySelector("[data-dd-btn]");
      var label = dd.querySelector("[data-dd-label]");
      var hidden = dd.querySelector("[data-search-type]");
      var opts = Array.prototype.slice.call(dd.querySelectorAll(".search-dd__opt"));
      function setOpen(o) { dd.classList.toggle("is-open", o); if (btn) btn.setAttribute("aria-expanded", o ? "true" : "false"); }
      if (btn) btn.addEventListener("click", function (e) { e.preventDefault(); setOpen(!dd.classList.contains("is-open")); });
      opts.forEach(function (opt) {
        opt.addEventListener("click", function () {
          opts.forEach(function (o) { o.classList.remove("is-active"); o.setAttribute("aria-selected", "false"); });
          opt.classList.add("is-active"); opt.setAttribute("aria-selected", "true");
          if (hidden) hidden.value = opt.getAttribute("data-value");
          if (label) label.textContent = opt.textContent;
          setOpen(false);
          if (hidden) hidden.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      document.addEventListener("click", function (e) { if (!dd.contains(e.target)) setOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
      var resetBtn = document.querySelector("[data-reset]");
      if (resetBtn) resetBtn.addEventListener("click", function () {
        opts.forEach(function (o) { var a = o.getAttribute("data-value") === "all"; o.classList.toggle("is-active", a); o.setAttribute("aria-selected", a ? "true" : "false"); });
        if (label) label.textContent = "Tous types";
        if (hidden) hidden.value = "all";
      });
    })();

    /* ---- Inject dynamic category counts ---- */
    function countBy(field, value) {
      return getJOBS().filter(function (j) { return j[field] === value; }).length;
    }
    function injectCounts() {
      document.querySelectorAll("[data-count-for]").forEach(function (el) {
        var spec = el.getAttribute("data-count-for").split(":"); // field:value
        el.textContent = countBy(spec[0], spec[1]);
      });
    }

    /* ---- Salary slider live label ---- */
    function fmtEuro(n) { return n.toLocaleString("fr-FR") + " €"; }
    if (els.salary && els.salaryOut) {
      var syncSalary = function () { els.salaryOut.textContent = fmtEuro(parseInt(els.salary.value, 10)); };
      syncSalary();
      els.salary.addEventListener("input", function () { syncSalary(); apply(); });
    }

    /* ---- Compute filtered + sorted list ---- */
    function apply() {
      var contracts = els.contract.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
      var sectors = els.sector.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
      var dateSel = (els.date.filter(function (d) { return d.checked; })[0] || {}).value || "all";
      var minSalary = els.salary ? parseInt(els.salary.value, 10) : 0;
      var metier = (els.metier && els.metier.value || "").trim().toLowerCase();
      var ville = (els.ville && els.ville.value || "").trim().toLowerCase();
      var type = els.type && els.type.value || "all";

      var list = getJOBS().filter(function (j) {
        if (contracts.length && contracts.indexOf(j.contract) === -1) return false;
        if (sectors.length && sectors.indexOf(j.sector) === -1) return false;
        if (type !== "all" && j.contract !== type) return false;
        if (dateSel !== "all" && j.ageDays > parseInt(dateSel, 10)) return false;
        if (minSalary && j.salaryMonth < minSalary) return false;
        if (metier) {
          var hay = (j.title + " " + j.company + " " + j.sector + " " + j.tags.join(" ")).toLowerCase();
          if (hay.indexOf(metier) === -1) return false;
        }
        if (ville) {
          var loc = (j.city + " " + j.dept).toLowerCase();
          if (loc.indexOf(ville) === -1) return false;
        }
        return true;
      });

      var sort = els.sort ? els.sort.value : "pertinence";
      if (sort === "recent") list = list.slice().sort(function (a, b) { return a.ageDays - b.ageDays; });
      else if (sort === "salaire") list = list.slice().sort(function (a, b) { return b.salaryMonth - a.salaryMonth; });

      if (els.count) {
        var plural = list.length > 1 ? "s" : "";
        els.count.innerHTML = "<b>" + list.length + "</b> offre" + plural + " trouvée" + plural +
          ' <span class="jobs-toolbar__sectors">en BTP &amp; Construction · Tertiaire · Environnement</span>';
      }
      window.JobBoard.render(list);
    }

    /* ---- Listeners ---- */
    els.contract.concat(els.sector, els.date).forEach(function (input) {
      input.addEventListener("change", apply);
    });
    if (els.sort) els.sort.addEventListener("change", apply);
    if (els.metier) els.metier.addEventListener("input", debounce(apply, 200));
    if (els.ville) els.ville.addEventListener("input", debounce(apply, 200));
    if (els.type) els.type.addEventListener("change", apply);
    if (els.form) els.form.addEventListener("submit", function (e) { e.preventDefault(); apply(); });

    /* ---- Quick chips ---- */
    document.querySelectorAll("[data-chip]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        if (els.metier) { els.metier.value = chip.getAttribute("data-chip"); }
        apply();
        var hero = document.querySelector(".jobs-layout");
        if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    /* ---- Reset ---- */
    if (els.reset) {
      els.reset.addEventListener("click", function () {
        els.contract.concat(els.sector).forEach(function (c) { c.checked = false; });
        els.date.forEach(function (d) { d.checked = d.value === "all"; });
        if (els.salary) { els.salary.value = els.salary.min || 1500; if (els.salaryOut) els.salaryOut.textContent = fmtEuro(parseInt(els.salary.value, 10)); }
        if (els.metier) els.metier.value = "";
        if (els.ville) els.ville.value = "";
        if (els.type) els.type.value = "all";
        if (els.sort) els.sort.value = "pertinence";
        apply();
      });
    }

    function debounce(fn, wait) {
      var t;
      return function () { clearTimeout(t); t = setTimeout(fn, wait); };
    }

    /* ---- Pre-select sector from URL (?secteur=btp|tertiaire|environnement) ---- */
    (function () {
      var map = { btp: "BTP", tertiaire: "Tertiaire", environnement: "Environnement" };
      var param = new URLSearchParams(window.location.search).get("secteur");
      if (!param) return;
      var value = map[param.toLowerCase()];
      if (!value) return;
      els.sector.forEach(function (c) { c.checked = c.value === value; });
    })();

    // Exposé pour jobs.js : (ré)injecte les compteurs + applique le filtrage
    // une fois les offres chargées (Supabase async ou localStorage).
    window.JobFilters = { refresh: function () { injectCounts(); apply(); } };
    window.JobFilters.refresh();

    /* ---- Mettre en évidence l'offre ouverte depuis l'accueil (?job=) ---- */
    (function () {
      var jobParam = new URLSearchParams(window.location.search).get("job");
      if (!jobParam) return;
      setTimeout(function () {
        var card = document.querySelector('.job-card.is-active');
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    })();
  });
})();
