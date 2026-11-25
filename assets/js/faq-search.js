/* ==========================================================================
   faq-search.js — Recherche dans les questions fréquentes
   Filtre les questions au fil de la frappe (sans tenir compte des accents)
   et masque les thèmes qui n'ont plus de réponse.
   ========================================================================== */
(function () {
  "use strict";

  var input = document.querySelector("[data-faq-search]");
  var list = document.querySelector("[data-faq-list]");
  var count = document.querySelector("[data-faq-count]");
  var empty = document.querySelector("[data-faq-empty]");
  if (!input || !list) return;

  function normalize(text) {
    return (text || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function plural(n) {
    return n + (n > 1 ? " questions" : " question");
  }

  function update() {
    var query = normalize(input.value.trim());
    var items = list.querySelectorAll(".faq-item");
    var shown = 0;
    items.forEach(function (item) {
      var match = !query || normalize(item.textContent).indexOf(query) !== -1;
      item.hidden = !match;
      if (match) shown++;
    });
    // Un thème sans question visible disparaît avec son titre.
    list.querySelectorAll(".faq-group").forEach(function (group) {
      var visible = group.querySelector(".faq-item:not([hidden])");
      group.hidden = !visible;
      var title = group.previousElementSibling;
      if (title && title.classList.contains("faq-group__title")) title.hidden = !visible;
    });
    if (count) count.textContent = query ? plural(shown) + " trouvée" + (shown > 1 ? "s" : "") : plural(items.length) + " au total";
    if (empty) empty.hidden = shown !== 0;
  }

  input.addEventListener("input", update);
  // Les questions peuvent être remplacées par celles du back-office après le chargement.
  new MutationObserver(update).observe(list, { childList: true });
  update();
})();
