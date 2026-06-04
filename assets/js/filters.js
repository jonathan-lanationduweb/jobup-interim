/* ==========================================================================
   filters.js — Dynamic filtering, search & sorting for the job board
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.JobBoard) return;
    var JOBS = window.JobBoard.JOBS;

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

    /* ---- Inject dynamic category counts ---- */
    function countBy(field, value) {
      return JOBS.filter(function (j) { return j[field] === value; }).length;
    }
    document.querySelectorAll("[data-count-for]").forEach(function (el) {
      var spec = el.getAttribute("data-count-for").split(":"); // field:value
      el.textContent = countBy(spec[0], spec[1]);
    });

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

      var list = JOBS.filter(function (j) {
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
        els.count.innerHTML = "<b>" + list.length + "</b> offre" + (list.length > 1 ? "s" : "") + " trouvée" + (list.length > 1 ? "s" : "");
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

    apply();
  });
})();
