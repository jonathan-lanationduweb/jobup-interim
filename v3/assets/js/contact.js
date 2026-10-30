/* ==========================================================================
   contact.js — Formulaire multi-étapes, validation & uploads
   - Étape 1 : profil · Étape 2 : besoin + uploads · Étape 3 : coordonnées
   - Candidature depuis une offre : ?apply=1&job=… ouvre directement l'étape 2
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("[data-multistep]");
    if (!form) return;

    var steps = Array.prototype.slice.call(form.querySelectorAll(".form-step"));
    var segs = Array.prototype.slice.call(form.querySelectorAll("[data-step-seg]"));
    var kickerTotal = steps.length;
    var current = 0;

    var backBtn = form.querySelector("[data-prev]");
    var nextBtn = form.querySelector("[data-next]");
    var submitBtn = form.querySelector("[data-submit]");
    var success = form.querySelector("[data-success]");

    /* ---- Segmented controls (Vous êtes / Métier) ---- */
    form.querySelectorAll("[data-segmented]").forEach(function (group) {
      var hidden = group.parentElement.querySelector("input[type='hidden']");
      group.querySelectorAll(".segmented__option").forEach(function (opt) {
        opt.addEventListener("click", function () {
          group.querySelectorAll(".segmented__option").forEach(function (o) {
            o.setAttribute("aria-pressed", "false");
            o.classList.remove("is-active");
          });
          opt.setAttribute("aria-pressed", "true");
          opt.classList.add("is-active");
          if (hidden) hidden.value = opt.getAttribute("data-value");
        });
      });
    });

    /* ---- Step visibility & buttons ---- */
    function show(i, animate) {
      current = i;
      steps.forEach(function (s, idx) {
        s.classList.toggle("is-active", idx === i);
        s.classList.remove("is-entering");
      });
      if (animate) { void steps[i].offsetWidth; steps[i].classList.add("is-entering"); }
      segs.forEach(function (seg, idx) {
        seg.classList.toggle("is-done", idx < i);
        seg.classList.toggle("is-current", idx === i);
      });
      if (backBtn) backBtn.style.visibility = i === 0 ? "hidden" : "visible";
      if (nextBtn) nextBtn.style.display = i === steps.length - 1 ? "none" : "inline-flex";
      if (submitBtn) submitBtn.style.display = i === steps.length - 1 ? "inline-flex" : "none";
      form.querySelectorAll("[data-step-current]").forEach(function (el) { el.textContent = i + 1; });
      form.querySelectorAll("[data-step-total]").forEach(function (el) { el.textContent = kickerTotal; });
    }

    /* ---- Per-step validation ---- */
    function validate(stepEl) {
      var ok = true;
      stepEl.querySelectorAll("[required]").forEach(function (field) {
        var wrap = field.closest(".field") || field.parentElement;
        var err = wrap.querySelector(".field-error");
        var valid = field.value && field.value.trim() !== "";
        if (field.type === "email") valid = valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (field.type === "checkbox") valid = field.checked;
        if (!valid) { ok = false; field.classList.add("has-error"); if (err) err.hidden = false; }
        else { field.classList.remove("has-error"); if (err) err.hidden = true; }
      });
      // Required file uploads (e.g. lettre de motivation)
      stepEl.querySelectorAll("[data-dropzone][data-required-file]").forEach(function (dz) {
        var wrap = dz.closest(".upload") || dz.parentElement;
        var err = wrap.querySelector(".field-error");
        if (!dz.classList.contains("has-file")) {
          ok = false; dz.classList.add("has-error"); if (err) err.hidden = false;
        } else {
          dz.classList.remove("has-error"); if (err) err.hidden = true;
        }
      });
      return ok;
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (validate(steps[current])) show(Math.min(current + 1, steps.length - 1), true);
        else focusFirstError(steps[current]);
      });
    }
    if (backBtn) backBtn.addEventListener("click", function () { show(Math.max(current - 1, 0), true); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(steps[current])) { focusFirstError(steps[current]); return; }
      steps.forEach(function (s) { s.classList.remove("is-active"); });
      var actions = form.querySelector(".form-actions");
      if (actions) actions.style.display = "none";
      var stepperEl = form.querySelector(".stepper");
      if (stepperEl) stepperEl.style.display = "none";
      var recap = form.querySelector("[data-apply-recap]");
      if (recap) recap.hidden = true;
      if (success) success.classList.add("is-visible");
    });

    function focusFirstError(stepEl) {
      var f = stepEl.querySelector(".has-error");
      if (f && f.focus) f.focus();
    }

    form.querySelectorAll("input, textarea, select").forEach(function (f) {
      f.addEventListener("input", function () {
        f.classList.remove("has-error");
        var wrap = f.closest(".field") || f.parentElement;
        var err = wrap && wrap.querySelector(".field-error");
        if (err) err.hidden = true;
      });
    });

    /* ---- Dropzones (CV / Diplômes / Lettre de motivation) ---- */
    var ALLOWED = [".pdf", ".doc", ".docx"];
    var MAX = 5 * 1024 * 1024;
    form.querySelectorAll("[data-dropzone]").forEach(function (dropzone) {
      var input = dropzone.querySelector("input[type='file']");
      var nameEl = dropzone.querySelector("[data-file-name]");
      var removeBtn = dropzone.querySelector("[data-file-remove]");
      var hintEl = dropzone.querySelector(".dropzone__hint");
      var hintDefault = hintEl ? hintEl.textContent : "";
      if (!input) return;

      function setFile(file) {
        var ext = "." + file.name.split(".").pop().toLowerCase();
        if (ALLOWED.indexOf(ext) === -1) { if (hintEl) { hintEl.textContent = "Format non supporté (PDF, DOC, DOCX)."; hintEl.style.color = "#DC2626"; } return; }
        if (file.size > MAX) { if (hintEl) { hintEl.textContent = "Fichier trop volumineux (max 5 Mo)."; hintEl.style.color = "#DC2626"; } return; }
        if (hintEl) { hintEl.textContent = hintDefault; hintEl.style.color = ""; }
        dropzone.classList.add("has-file");
        dropzone.classList.remove("has-error");
        var err = (dropzone.closest(".upload") || dropzone.parentElement).querySelector(".field-error");
        if (err) err.hidden = true;
        if (nameEl) nameEl.textContent = file.name;
      }

      dropzone.addEventListener("click", function (e) { if (e.target.closest("[data-file-remove]")) return; input.click(); });
      dropzone.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
      input.addEventListener("change", function () { if (input.files[0]) setFile(input.files[0]); });
      ["dragenter", "dragover"].forEach(function (ev) { dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add("is-dragover"); }); });
      ["dragleave", "drop"].forEach(function (ev) { dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove("is-dragover"); }); });
      dropzone.addEventListener("drop", function (e) { var file = e.dataTransfer && e.dataTransfer.files[0]; if (file) { input.files = e.dataTransfer.files; setFile(file); } });
      if (removeBtn) removeBtn.addEventListener("click", function (e) { e.stopPropagation(); input.value = ""; dropzone.classList.remove("has-file"); });
    });

    /* ---- Pré-remplissage depuis une offre (?apply=1&job=…) ---- */
    function applyFromOffer() {
      var q = new URLSearchParams(window.location.search);
      if (q.get("apply") !== "1") return false;

      var poste = q.get("poste") || "";
      var recap = form.querySelector("[data-apply-recap]");
      if (recap) {
        var posteEl = recap.querySelector("[data-apply-poste]");
        var metaEl = recap.querySelector("[data-apply-meta]");
        if (posteEl) posteEl.textContent = poste || "Votre candidature";
        var bits = [q.get("entreprise"), q.get("lieu"), q.get("contrat"), q.get("remu")].filter(Boolean);
        if (metaEl) metaEl.textContent = bits.join(" · ");
        recap.hidden = false;
      }

      // Préremplir le poste
      var posteInput = form.querySelector("input[name='poste']");
      if (posteInput && poste) posteInput.value = poste;

      // Préremplir le métier selon le secteur
      var secteurMap = { "BTP": "BTP & Construction", "BTP & Construction": "BTP & Construction", "Tertiaire": "Tertiaire", "Environnement": "Environnement" };
      var secteur = secteurMap[q.get("secteur")] || "Autre";
      var metierGroup = form.querySelector("input[name='metier']");
      if (metierGroup) {
        metierGroup.value = secteur;
        var groupEl = metierGroup.parentElement.querySelector("[data-segmented]");
        if (groupEl) {
          groupEl.querySelectorAll(".segmented__option").forEach(function (o) {
            var active = o.getAttribute("data-value") === secteur;
            o.classList.toggle("is-active", active);
            o.setAttribute("aria-pressed", active ? "true" : "false");
          });
        }
      }
      return true;
    }

    if (applyFromOffer()) show(1); else show(0);
  });
})();
