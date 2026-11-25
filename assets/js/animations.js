/* ==========================================================================
   animations.js — Reveal-on-scroll
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Reveal on scroll ---- */
  var targets = document.querySelectorAll("[data-animate]");
  if (targets.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      targets.forEach(function (el) { io.observe(el); });
    }
  }
})();
