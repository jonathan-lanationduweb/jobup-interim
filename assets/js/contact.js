/* ==========================================================================
   contact.js — Multi-step form, validation & CV upload
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

    /* ---- Segmented controls ---- */
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

    /* ---- Render step visibility & buttons ---- */
    function show(i, animate) {
      current = i;
      steps.forEach(function (s, idx) {
        s.classList.toggle("is-active", idx === i);
        s.classList.remove("is-entering");
      });
      if (animate) {
        void steps[i].offsetWidth;
        steps[i].classList.add("is-entering");
      }
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
        if (!valid) {
          ok = false;
          field.classList.add("has-error");
          if (err) err.hidden = false;
        } else {
          field.classList.remove("has-error");
          if (err) err.hidden = true;
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
    if (backBtn) {
      backBtn.addEventListener("click", function () { show(Math.max(current - 1, 0), true); });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(steps[current])) { focusFirstError(steps[current]); return; }
      steps.forEach(function (s) { s.classList.remove("is-active"); });
      var actions = form.querySelector(".form-actions");
      if (actions) actions.style.display = "none";
      var stepperEl = form.querySelector(".stepper");
      if (stepperEl) stepperEl.style.display = "none";
      if (success) success.classList.add("is-visible");
    });

    function focusFirstError(stepEl) {
      var f = stepEl.querySelector(".has-error");
      if (f) f.focus();
    }

    // clear error on input
    form.querySelectorAll("input, textarea, select").forEach(function (f) {
      f.addEventListener("input", function () {
        f.classList.remove("has-error");
        var wrap = f.closest(".field") || f.parentElement;
        var err = wrap && wrap.querySelector(".field-error");
        if (err) err.hidden = true;
      });
    });

    /* ---- CV dropzone ---- */
    var dropzone = form.querySelector("[data-dropzone]");
    if (dropzone) {
      var input = dropzone.querySelector("input[type='file']");
      var nameEl = dropzone.querySelector("[data-file-name]");
      var removeBtn = dropzone.querySelector("[data-file-remove]");
      var hintEl = dropzone.querySelector(".dropzone__hint");
      var ALLOWED = [".pdf", ".doc", ".docx"];
      var MAX = 5 * 1024 * 1024;

      var setFile = function (file) {
        var ext = "." + file.name.split(".").pop().toLowerCase();
        if (ALLOWED.indexOf(ext) === -1) {
          if (hintEl) { hintEl.textContent = "Format non supporté. PDF, DOC ou DOCX uniquement."; hintEl.style.color = "#DC2626"; }
          return;
        }
        if (file.size > MAX) {
          if (hintEl) { hintEl.textContent = "Fichier trop volumineux (max 5 Mo)."; hintEl.style.color = "#DC2626"; }
          return;
        }
        dropzone.classList.add("has-file");
        if (nameEl) nameEl.textContent = file.name;
      };

      dropzone.addEventListener("click", function (e) {
        if (e.target.closest("[data-file-remove]")) return;
        input.click();
      });
      dropzone.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
      });
      input.addEventListener("change", function () { if (input.files[0]) setFile(input.files[0]); });
      ["dragenter", "dragover"].forEach(function (ev) {
        dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add("is-dragover"); });
      });
      ["dragleave", "drop"].forEach(function (ev) {
        dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove("is-dragover"); });
      });
      dropzone.addEventListener("drop", function (e) {
        var file = e.dataTransfer && e.dataTransfer.files[0];
        if (file) { input.files = e.dataTransfer.files; setFile(file); }
      });
      if (removeBtn) {
        removeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          input.value = "";
          dropzone.classList.remove("has-file");
        });
      }
    }

    show(0);
  });
})();
