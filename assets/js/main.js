/* ==========================================================================
   main.js — Header behaviour, mobile nav, footer year
   ========================================================================== */
(function () {
  "use strict";

  /* ---- Sticky header shadow on scroll ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    // Première lecture au prochain rendu, quand les styles sont prêts (pas de recalcul forcé).
    window.requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Menu des pages : caché en descendant, visible dès qu'on remonte ---- */
  var subNav = document.querySelector(".sub-nav");
  if (subNav) {
    var lastY = 0;
    var ticking = false;
    // Le menu suit directement l'en-tête : sa place d'origine = hauteur de l'en-tête.
    // Hauteur lue une fois au premier rendu, puis seulement après un redimensionnement
    // (jamais pendant le défilement).
    var navTop = 0;
    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { navTop = header ? header.offsetHeight : 0; }, 150);
    });
    var updateNav = function () {
      var y = window.scrollY;
      var delta = y - lastY;
      var stuck = y > 1;
      subNav.classList.toggle("is-stuck", stuck);
      if (y < navTop + 120) subNav.classList.remove("is-hidden"); // près du haut : toujours visible
      else if (delta > 6) subNav.classList.add("is-hidden");      // on descend
      else if (delta < -6) subNav.classList.remove("is-hidden");  // on remonte
      if (Math.abs(delta) > 6) lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateNav); }
    }, { passive: true });
    // Le menu reprend sa place si on navigue au clavier dedans.
    subNav.addEventListener("focusin", function () { subNav.classList.remove("is-hidden"); });
    window.requestAnimationFrame(function () {
      navTop = header ? header.offsetHeight : 0;
      lastY = window.scrollY;
      updateNav();
    });
  }

  /* ---- Mobile navigation drawer ---- */
  var burger = document.querySelector(".burger");
  var drawer = document.querySelector(".mobile-nav");
  if (burger && drawer) {
    var setOpen = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      drawer.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  /* ---- Questions « Avant de postuler » : dépliables sur téléphone uniquement ---- */
  var cards = document.querySelectorAll(".faq-card");
  if (cards.length) {
    var mobile = window.matchMedia("(max-width: 768px)");
    var sync = function () {
      // Sur ordinateur toutes les réponses sont visibles ; sur téléphone elles suivent l'état ouvert/fermé.
      cards.forEach(function (card) {
        var btn = card.querySelector(".faq-card__btn");
        if (btn) btn.setAttribute("aria-expanded", String(!mobile.matches || card.classList.contains("is-open")));
      });
    };
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-card__btn");
      if (!btn || !mobile.matches) return;
      var card = btn.closest(".faq-card");
      var open = !card.classList.contains("is-open");
      // Une seule réponse ouverte à la fois pour garder la page courte.
      cards.forEach(function (other) { other.classList.remove("is-open"); });
      card.classList.toggle("is-open", open);
      sync();
    });
    if (mobile.addEventListener) mobile.addEventListener("change", sync);
    else if (mobile.addListener) mobile.addListener(sync);
    sync();
  }

  /* ---- Footer current year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
