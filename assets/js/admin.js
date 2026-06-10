/* ==========================================================================
   admin.js — Backoffice de gestion des offres
   --------------------------------------------------------------------------
   ⚠️ SÉCURITÉ — À LIRE
   L'authentification ci-dessous est une SIMPLE PORTE CÔTÉ CLIENT (démo).
   Elle n'est PAS sécurisée : le mot de passe est dans le JS public.
   => En production, remplacer par une vraie authentification serveur :
      Supabase Auth, Firebase Auth, Netlify Identity, etc., et protéger
      les écritures (RLS Supabase). Voir aussi assets/js/jobs-store.js.
   ========================================================================== */
(function () {
  "use strict";

  // DÉMO uniquement — à supprimer en production (auth serveur).
  var DEMO_PASSWORD = "jobup2026";
  var SESSION_KEY = "jobup_admin_ok";

  var SECTOR_LABEL = { "BTP": "BTP & Construction", "Tertiaire": "Tertiaire", "Environnement": "Environnement" };

  document.addEventListener("DOMContentLoaded", function () {
    var gate = document.querySelector("[data-gate]");
    var app = document.querySelector("[data-app]");
    var gateForm = document.querySelector("[data-gate-form]");
    var gateInput = document.querySelector("[data-gate-input]");
    var gateError = document.querySelector("[data-gate-error]");

    function openApp() { gate.hidden = true; app.hidden = false; render(); }

    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      openApp();
    }
    gateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (gateInput.value === DEMO_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "1");
        openApp();
      } else {
        gateError.hidden = false;
      }
    });

    /* ---------------- Table ---------------- */
    var rows = document.querySelector("[data-rows]");

    function render() {
      var jobs = window.JobStore.getJobs();
      if (!jobs.length) { rows.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#6B7280">Aucune offre. Cliquez sur « Ajouter une offre ».</td></tr>'; return; }
      rows.innerHTML = jobs.map(function (j) {
        var statusCls = j.status === "brouillon" ? "is-draft" : "is-live";
        return '<tr>' +
          '<td data-label="Poste"><strong>' + esc(j.title) + '</strong></td>' +
          '<td data-label="Entreprise">' + esc(j.company || "") + '</td>' +
          '<td data-label="Secteur">' + esc(SECTOR_LABEL[j.sector] || j.sector || "") + '</td>' +
          '<td data-label="Contrat">' + esc(j.contract || "") + '</td>' +
          '<td data-label="Lieu">' + esc(j.city || "") + (j.dept ? " (" + esc(j.dept) + ")" : "") + '</td>' +
          '<td data-label="Statut"><span class="admin-status ' + statusCls + '">' + (j.status === "brouillon" ? "Brouillon" : "Publié") + '</span></td>' +
          '<td class="admin-table__actions">' +
            '<button class="admin-link" data-edit="' + j.id + '">Modifier</button>' +
            '<button class="admin-link" data-toggle="' + j.id + '">' + (j.status === "brouillon" ? "Publier" : "Mettre en brouillon") + '</button>' +
            '<button class="admin-link admin-link--danger" data-del="' + j.id + '">Supprimer</button>' +
          '</td>' +
        '</tr>';
      }).join("");
    }

    rows.addEventListener("click", function (e) {
      var t = e.target;
      if (t.dataset.edit) openForm(window.JobStore.getJobById(t.dataset.edit));
      else if (t.dataset.toggle) {
        var j = window.JobStore.getJobById(t.dataset.toggle);
        window.JobStore.setStatus(j.id, j.status === "brouillon" ? "publié" : "brouillon");
        render();
      } else if (t.dataset.del) {
        var job = window.JobStore.getJobById(t.dataset.del);
        if (confirm("Supprimer l'offre « " + (job ? job.title : "") + " » ?")) { window.JobStore.deleteJob(t.dataset.del); render(); }
      }
    });

    document.querySelector("[data-add]").addEventListener("click", function () { openForm(null); });
    document.querySelector("[data-reset-seed]").addEventListener("click", function () {
      if (confirm("Réinitialiser toutes les offres avec le jeu de démonstration ? (efface vos modifications)")) { window.JobStore.resetSeed(); render(); }
    });

    /* ---------------- Modale formulaire ---------------- */
    var modal = document.querySelector("[data-modal]");
    var form = document.querySelector("[data-job-form]");
    var formTitle = document.querySelector("[data-form-title]");

    function openForm(job) {
      formTitle.textContent = job ? "Modifier l'offre" : "Ajouter une offre";
      form.reset();
      form.elements.id.value = job ? job.id : "";
      if (job) {
        ["title","company","sector","contract","duration","city","dept","salary","salaryMonth","posted","status","desc","missions"].forEach(function (k) {
          if (form.elements[k] != null && job[k] != null) form.elements[k].value = job[k];
        });
        form.elements.profile.value = (job.profile || []).join("\n");
        form.elements.perks.value = (job.perks || []).join("\n");
        form.elements.tags.value = (job.tags || []).join(", ");
      } else {
        form.elements.status.value = "publié";
        form.elements.posted.value = "Publié aujourd'hui";
      }
      modal.hidden = false;
    }
    function closeForm() { modal.hidden = true; }
    Array.prototype.forEach.call(document.querySelectorAll("[data-modal-close]"), function (b) { b.addEventListener("click", closeForm); });

    function lines(v) { return (v || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean); }
    function commas(v) { return (v || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var data = {
        title: f.title.value.trim(),
        company: f.company.value.trim(),
        sector: f.sector.value,
        contract: f.contract.value,
        duration: f.duration.value.trim(),
        city: f.city.value.trim(),
        dept: f.dept.value.trim(),
        salary: f.salary.value.trim(),
        salaryMonth: parseInt(f.salaryMonth.value, 10) || 0,
        posted: f.posted.value.trim() || "Publié aujourd'hui",
        status: f.status.value,
        desc: f.desc.value.trim(),
        missions: f.missions.value.trim(),
        profile: lines(f.profile.value),
        perks: lines(f.perks.value),
        tags: commas(f.tags.value),
        ageDays: 0,
        isNew: true
      };
      if (!data.title) { alert("Le titre est obligatoire."); return; }
      var id = f.id.value;
      if (id) window.JobStore.updateJob(id, data);
      else window.JobStore.createJob(data);
      closeForm();
      render();
    });

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  });
})();
