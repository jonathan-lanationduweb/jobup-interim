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
      href: "offres.html?secteur=btp"
    },
    {
      key: "tertiaire",
      name: "Tertiaire",
      color: "#D946EF",
      text: "Comptabilité, administration, accueil, ressources humaines : des postes pour tous les métiers de bureau.",
      points: ["Comptabilité & gestion", "Administration", "Accueil & secrétariat", "Ressources humaines"],
      href: "offres.html?secteur=tertiaire"
    },
    {
      key: "environnement",
      name: "Environnement",
      color: "#22C55E",
      text: "Espaces verts, propreté, tri et valorisation : engagez-vous dans des métiers utiles et durables.",
      points: ["Espaces verts", "Propreté & tri", "Valorisation des déchets", "Entretien des sites"],
      href: "offres.html?secteur=environnement"
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

    render(0);
    if (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) start();
  });
})();
