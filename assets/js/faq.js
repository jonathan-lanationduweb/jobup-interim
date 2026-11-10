/* ==========================================================================
   faq.js — Accessible accordion
   Délégation d'événements : fonctionne aussi pour les questions chargées
   depuis le back-office après l'affichage de la page.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".faq-item__btn");
    if (!btn) return;
    var item = btn.closest(".faq-item");
    var list = item.parentElement;
    var isOpen = item.classList.contains("is-open");
    // close all (single-open accordion)
    list.querySelectorAll(".faq-item").forEach(function (other) {
      other.classList.remove("is-open");
      var b = other.querySelector(".faq-item__btn");
      if (b) b.setAttribute("aria-expanded", "false");
    });
    if (!isOpen) {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
})();
