/* ==========================================================================
   config.js — Adresse de l'API du back-office (WordPress JOBUP)
   - Vide : le site fonctionne seul (textes du HTML, formulaire non transmis)
   - En local, le back-office de test tourne sur http://localhost:8090
   ========================================================================== */
window.JOBUP_CONFIG = {
  apiUrl: (function () {
    var host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "http://localhost:8090/wp-json/jobup/v1";
    // À renseigner à la mise en ligne du back-office, par ex. :
    // return "https://admin.jobup-interim.fr/wp-json/jobup/v1";
    return "";
  })()
};
