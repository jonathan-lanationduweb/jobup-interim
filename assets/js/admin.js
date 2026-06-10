/* ==========================================================================
   admin.js — Backoffice de gestion des offres
   --------------------------------------------------------------------------
   AUTH :
   - Si Supabase est configuré (assets/js/supabase-config.js + lib chargée),
     la connexion se fait via Supabase Auth (email + mot de passe). Créez
     l'utilisateur admin dans Supabase → Authentication → Users.
   - Sinon (démo locale), une simple porte par mot de passe (NON sécurisée).
   Les écritures sont protégées côté serveur par les RLS policies Supabase.
   ========================================================================== */
(function () {
  "use strict";

  var DEMO_PASSWORD = "jobup2026"; // utilisé UNIQUEMENT si Supabase non configuré
  var SESSION_KEY = "jobup_admin_ok";
  var SECTOR_LABEL = { "BTP": "BTP & Construction", "Tertiaire": "Tertiaire", "Environnement": "Environnement" };

  document.addEventListener("DOMContentLoaded", function () {
    var store = window.JobStore;
    var remote = store && store.isRemote;

    var gate = document.querySelector("[data-gate]");
    var app = document.querySelector("[data-app]");
    var gateForm = document.querySelector("[data-gate-form]");
    var gateInput = document.querySelector("[data-gate-input]");
    var gateEmail = document.querySelector("[data-gate-email]");
    var gateEmailWrap = document.querySelector("[data-gate-email-wrap]");
    var gateError = document.querySelector("[data-gate-error]");
    var rows = document.querySelector("[data-rows]");
    var cache = [];

    // En mode démo (pas de Supabase), masquer le champ email
    if (!remote && gateEmailWrap) gateEmailWrap.hidden = true;

    function openApp() { gate.hidden = true; app.hidden = false; render(); }

    // Session déjà ouverte ?
    if (remote) {
      store.auth.getUser().then(function (u) { if (u) openApp(); });
    } else if (sessionStorage.getItem(SESSION_KEY) === "1") {
      openApp();
    }

    gateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      gateError.hidden = true;
      if (remote) {
        store.auth.signIn((gateEmail.value || "").trim(), gateInput.value).then(function (res) {
          if (res && res.error) { gateError.textContent = "Connexion refusée : " + res.error.message; gateError.hidden = false; }
          else openApp();
        });
      } else {
        if (gateInput.value === DEMO_PASSWORD) { sessionStorage.setItem(SESSION_KEY, "1"); openApp(); }
        else { gateError.textContent = "Mot de passe incorrect."; gateError.hidden = false; }
      }
    });

    /* ---------------- Table ---------------- */
    function render() {
      rows.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#6B7280">Chargement…</td></tr>';
      store.getJobs().then(function (jobs) {
        cache = jobs || [];
        if (!cache.length) { rows.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#6B7280">Aucune offre. Cliquez sur « Ajouter une offre ».</td></tr>'; return; }
        rows.innerHTML = cache.map(function (j) {
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
      });
    }
    function fromCache(id) { return cache.filter(function (j) { return j.id === id; })[0]; }

    rows.addEventListener("click", function (e) {
      var t = e.target;
      if (t.dataset.edit) { openForm(fromCache(t.dataset.edit)); }
      else if (t.dataset.toggle) {
        var j = fromCache(t.dataset.toggle);
        store.setStatus(j.id, j.status === "brouillon" ? "publié" : "brouillon").then(render);
      } else if (t.dataset.del) {
        var job = fromCache(t.dataset.del);
        if (confirm("Supprimer l'offre « " + (job ? job.title : "") + " » ?")) store.deleteJob(t.dataset.del).then(render);
      }
    });

    document.querySelector("[data-add]").addEventListener("click", function () { openForm(null); });
    document.querySelector("[data-reset-seed]").addEventListener("click", function () {
      var msg = remote ? "Importer les offres de démonstration dans Supabase ? (remplace celles ayant le même identifiant)" : "Réinitialiser toutes les offres avec le jeu de démonstration ?";
      if (confirm(msg)) store.resetSeed().then(render).catch(function (e) { alert("Erreur : " + ((e && e.message) || e)); });
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
        title: f.title.value.trim(), company: f.company.value.trim(),
        sector: f.sector.value, contract: f.contract.value,
        duration: f.duration.value.trim(), city: f.city.value.trim(), dept: f.dept.value.trim(),
        salary: f.salary.value.trim(), salaryMonth: parseInt(f.salaryMonth.value, 10) || 0,
        posted: f.posted.value.trim() || "Publié aujourd'hui", status: f.status.value,
        desc: f.desc.value.trim(), missions: f.missions.value.trim(),
        profile: lines(f.profile.value), perks: lines(f.perks.value), tags: commas(f.tags.value),
        ageDays: 0, isNew: true
      };
      if (!data.title) { alert("Le titre est obligatoire."); return; }
      var id = f.id.value;
      var op = id ? store.updateJob(id, data) : store.createJob(data);
      op.then(function () { closeForm(); render(); }).catch(function (e) { alert("Erreur d'enregistrement : " + ((e && e.message) || e)); });
    });

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  });
})();
