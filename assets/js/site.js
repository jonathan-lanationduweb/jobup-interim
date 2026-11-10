/* ==========================================================================
   site.js — Contenus pilotés depuis le back-office
   - [data-site="chemin"]       : texte (ex. coordonnees.horaires)
   - [data-site-tel]            : téléphone (texte + lien tel:)
   - [data-site-email]          : e-mail (texte + lien mailto:)
   - [data-site-title]          : titre « Début, <em>fin.</em> »
   - [data-faq-list]            : questions fréquentes
   Sans API ou en cas d'erreur, le contenu du HTML reste affiché.
   ========================================================================== */
(function () {
  "use strict";

  var api = (window.JOBUP_CONFIG || {}).apiUrl;
  if (!api) return;

  function getJson(path) {
    return fetch(api + path, { headers: { Accept: "application/json" } }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function pick(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }

  function filled(v) { return typeof v === "string" && v.trim() !== ""; }

  // Texte multi-lignes : chaque ligne devient un saut de ligne, sans HTML injecté.
  function setLines(el, text) {
    el.textContent = "";
    text.split(/\r?\n/).forEach(function (line, i) {
      if (i) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(line));
    });
  }

  function apply(data) {
    if (data.maintenance && data.maintenance.active) { showMaintenance(data); return; }

    document.querySelectorAll("[data-site]").forEach(function (el) {
      var v = pick(data, el.getAttribute("data-site"));
      if (filled(v)) setLines(el, v);
    });

    var c = data.coordonnees || {};
    if (filled(c.telephone)) {
      document.querySelectorAll("[data-site-tel]").forEach(function (a) {
        a.textContent = c.telephone;
        a.href = "tel:" + c.telephone.replace(/[^0-9+]/g, "");
      });
    }
    if (filled(c.email)) {
      document.querySelectorAll("[data-site-email]").forEach(function (a) {
        var at = c.email.indexOf("@");
        a.textContent = "";
        a.appendChild(document.createTextNode(c.email.slice(0, at + 1)));
        a.appendChild(document.createElement("wbr"));
        a.appendChild(document.createTextNode(c.email.slice(at + 1)));
        a.href = "mailto:" + c.email;
      });
    }

    document.querySelectorAll("[data-site-title]").forEach(function (el) {
      var t = pick(data, el.getAttribute("data-site-title"));
      if (!filled(t)) return;
      var cut = t.indexOf(", ");
      el.textContent = "";
      if (cut === -1) { el.textContent = t; return; }
      el.appendChild(document.createTextNode(t.slice(0, cut + 1)));
      el.appendChild(document.createElement("br"));
      var em = document.createElement("em");
      em.textContent = t.slice(cut + 2);
      el.appendChild(em);
    });
  }

  function showMaintenance(data) {
    var m = data.maintenance;
    var box = document.createElement("div");
    box.className = "site-maintenance";
    box.setAttribute("role", "alert");
    var inner = document.createElement("div");
    inner.className = "site-maintenance__box";
    var h = document.createElement("h1");
    h.textContent = m.titre || "Site en maintenance";
    var p = document.createElement("p");
    p.textContent = m.message || "";
    inner.appendChild(h);
    inner.appendChild(p);
    var c = data.coordonnees || {};
    if (filled(c.telephone)) {
      var a = document.createElement("a");
      a.className = "btn btn--deep";
      a.href = "tel:" + c.telephone.replace(/[^0-9+]/g, "");
      a.textContent = c.telephone;
      inner.appendChild(a);
    }
    box.appendChild(inner);
    document.body.appendChild(box);
    document.documentElement.classList.add("is-maintenance");
  }

  function renderFaq(list, questions) {
    list.textContent = "";
    questions.forEach(function (q, i) {
      var item = document.createElement("div");
      item.className = "faq-item" + (i === 0 ? " is-open" : "");
      var btn = document.createElement("button");
      btn.className = "faq-item__btn";
      btn.type = "button";
      btn.setAttribute("aria-expanded", i === 0 ? "true" : "false");
      btn.appendChild(document.createTextNode(q.question));
      var toggle = document.createElement("span");
      toggle.className = "faq-item__toggle";
      toggle.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
      btn.appendChild(toggle);
      var panel = document.createElement("div");
      panel.className = "faq-item__panel";
      var panelInner = document.createElement("div");
      panelInner.className = "faq-item__panel-inner";
      panelInner.innerHTML = q.reponse; // HTML déjà filtré par WordPress (wp_kses_post)
      panel.appendChild(panelInner);
      item.appendChild(btn);
      item.appendChild(panel);
      list.appendChild(item);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    getJson("/site").then(apply).catch(function () { /* contenu du HTML conservé */ });

    var faqList = document.querySelector("[data-faq-list]");
    if (faqList) {
      getJson("/faq").then(function (d) {
        if (d.questions && d.questions.length) renderFaq(faqList, d.questions);
      }).catch(function () {});
    }
  });
})();
