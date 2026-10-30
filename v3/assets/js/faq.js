/* ==========================================================================
   faq.js — Accessible accordion
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var items = document.querySelectorAll(".faq-item");
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector(".faq-item__btn");
      var panel = item.querySelector(".faq-item__panel");
      if (!btn || !panel) return;

      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        // close all (single-open accordion)
        items.forEach(function (other) {
          other.classList.remove("is-open");
          var b = other.querySelector(".faq-item__btn");
          if (b) b.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  });
})();
