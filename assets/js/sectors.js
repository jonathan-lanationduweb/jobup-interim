/* ==========================================================================
   sectors.js — Carousel "Nos expertises" (BTP / Tertiaire / Environnement)
   Seuls changent : image principale, ordre des images secondaires, titre,
   description, points clés, couleur d'accent et lien du bouton.
   ========================================================================== */
(function () {
  "use strict";

  var SECTORS = [
    {
      key: "btp",
      name: "BTP & Construction",
      color: "#F59E0B",
      text: "Rejoignez nos équipes sur des chantiers variés, en neuf comme en rénovation.",
      points: ["Gros œuvre", "Travaux publics", "Second œuvre", "Encadrement de chantier"],
      href: "contact.html#postuler"
    },
    {
      key: "tertiaire",
      name: "Tertiaire",
      color: "#D946EF",
      text: "Comptabilité, administration, accueil, ressources humaines : des postes pour tous les métiers de bureau.",
      points: ["Comptabilité & gestion", "Administration", "Accueil & secrétariat", "Ressources humaines"],
      href: "contact.html#postuler"
    },
    {
      key: "environnement",
      name: "Environnement",
      color: "#22C55E",
      text: "Espaces verts, propreté, tri et valorisation : engagez-vous dans des métiers utiles et durables.",
      points: ["Espaces verts", "Propreté & tri", "Valorisation des déchets", "Entretien des sites"],
      href: "contact.html#postuler"
    }
  ];

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector("[data-sector-carousel]");
    if (!root) return;

    var nameEl = root.querySelector("[data-sector-name]");
    var textEl = root.querySelector("[data-sector-text]");
    var pointsEl = root.querySelector("[data-sector-points]");
    var ctaEl = root.querySelector("[data-sector-cta]");
    var imgs = Array.prototype.slice.call(root.querySelectorAll("[data-sector-img]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-sector-dot]"));
    var timer = null;
    var DELAY = 4500;

    var tick = '<span class="tick"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>';
    var current = 0;
    var POS = ["is-main", "is-top", "is-bottom"];

    function render(i) {
      current = (i + SECTORS.length) % SECTORS.length;
      var s = SECTORS[current];

      root.style.setProperty("--accent", s.color);
      if (nameEl) nameEl.textContent = s.name;
      if (textEl) textEl.textContent = s.text;
      if (pointsEl) pointsEl.innerHTML = s.points.map(function (p) { return "<li>" + tick + p + "</li>"; }).join("");
      if (ctaEl) ctaEl.setAttribute("href", s.href);

      // Stacked images: active = main, others fall behind (rotating order)
      imgs.forEach(function (img) {
        var idx = parseInt(img.getAttribute("data-sector-img"), 10);
        var rel = (idx - current + SECTORS.length) % SECTORS.length; // 0 main, 1 top, 2 bottom
        POS.forEach(function (c) { img.classList.remove(c); });
        img.classList.add(POS[rel]);
      });

      dots.forEach(function (d, idx) {
        var active = idx === current;
        d.classList.toggle("is-active", active);
        d.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function start() { stop(); timer = setInterval(function () { render(current + 1); }, DELAY); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (d) {
      d.addEventListener("click", function () { render(parseInt(d.getAttribute("data-sector-dot"), 10)); start(); });
    });
    // Secondary images are clickable to bring them forward
    imgs.forEach(function (img) {
      img.addEventListener("click", function () {
        if (!img.classList.contains("is-main")) { render(parseInt(img.getAttribute("data-sector-img"), 10)); start(); }
      });
    });
    // Pause the auto-rotation on hover for readability
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    /* ---- Glisser au doigt (ou à la souris) pour changer de secteur ----
       Les points et le toucher des photos restent possibles : un simple
       appui n'est pas un glissement. Le défilement vertical de la page
       n'est pas bloqué (touch-action: pan-y). */
    var SWIPE_MIN = 40;
    var drag = null;
    var swiped = false;
    function mainImg() { return root.querySelector(".sector-stack__img.is-main"); }

    root.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId, horizontal: null };
      swiped = false;
      stop();
    });
    root.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      var dy = e.clientY - drag.y;
      if (drag.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) drag.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!drag.horizontal) return;
      // La photo principale suit légèrement le doigt.
      var img = mainImg();
      if (img) { img.style.transition = "none"; img.style.transform = "translateX(" + dx * 0.35 + "px)"; }
    });
    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      var horizontal = drag.horizontal;
      drag = null;
      var img = mainImg();
      if (img) { img.style.transition = ""; img.style.transform = ""; }
      if (horizontal && Math.abs(dx) >= SWIPE_MIN) {
        swiped = true;
        render(current + (dx < 0 ? 1 : -1));
      }
      start();
    }
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);
    // Après un glissement, le « clic » qui suit n'ouvre ni lien ni photo.
    root.addEventListener("click", function (e) {
      if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; }
    }, true);

    render(0);
    if (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) start();
  });
})();
