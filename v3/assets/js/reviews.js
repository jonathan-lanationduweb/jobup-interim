/* ==========================================================================
   reviews.js — Avis clients / Google Reviews module
   --------------------------------------------------------------------------
   The component is FULLY built (HTML + CSS + JS) but stays HIDDEN until:
     1) the feature flag below is turned ON, AND
     2) at least one REAL review is returned by fetchReviews().
   No fake / generated reviews are ever displayed.

   ▶ To go live later, simply:
       - set ENABLE_REVIEWS = true
       - point REVIEWS_CONFIG to your provider (Google Business Profile,
         Google Reviews API, Trustpilot, Avis Vérifiés) via a small backend
         proxy that returns the normalised review array (see fetchReviews()).
   No further development is required.
   ========================================================================== */
window.Reviews = (function () {
  "use strict";

  /* ----------------------- FEATURE FLAG / CONFIG ------------------------ */
  var ENABLE_REVIEWS = false; // ◀ master switch — keep false until real avis exist

  var REVIEWS_CONFIG = {
    provider: "google",        // "google" | "trustpilot" | "avis-verifies"
    // A backend proxy URL that calls the provider API server-side and returns
    // JSON: { rating, total, reviews: [ {author, avatar, rating, date, text} ] }
    // (calling provider APIs directly from the browser is not allowed —
    //  the API key must stay on the server).
    proxyUrl: "",              // e.g. "/api/reviews"
    googlePlaceId: "",         // Google Business Profile place_id
    trustpilotBusinessId: "",
    avisVerifiesAccount: ""
  };

  /* In-memory store of REAL reviews. Empty by design — populated by fetchReviews(). */
  var REVIEWS = [];
  var AGGREGATE = { rating: 0, total: 0 };

  var section, track, ratingEl, summaryValueEl, summaryCountEl;

  /* ----------------------------- ICONS --------------------------------- */
  var starFull = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2Z"/></svg>';
  var starEmpty = '<svg class="star-empty" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2Z"/></svg>';
  var gLogo = '<svg class="g-logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.6-.05-1.2-.16-1.8H12v3.4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.24c1.9-1.75 2.96-4.33 2.96-7.1Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.42 13.92a6 6 0 0 1 0-3.84V7.5H3.06a10 10 0 0 0 0 9l3.36-2.58Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A10 10 0 0 0 3.06 7.5l3.36 2.58C7.2 7.72 9.4 5.96 12 5.96Z"/></svg>';

  /* ----------------------- STAR RENDERING ------------------------------ */
  function starsHtml(value, large) {
    var rounded = Math.round(value);
    var out = '<span class="rating' + (large ? " rating--lg" : "") + '" aria-label="' + value + " sur 5 étoiles\">";
    for (var i = 1; i <= 5; i++) out += i <= rounded ? starFull : starEmpty;
    return out + "</span>";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ----------------------------- FETCH --------------------------------- */
  // Returns a Promise resolving to a normalised review array.
  // Wire a provider here when going live.
  function fetchReviews() {
    if (REVIEWS_CONFIG.proxyUrl) {
      return fetch(REVIEWS_CONFIG.proxyUrl)
        .then(function (r) { return r.ok ? r.json() : { reviews: [] }; })
        .then(function (data) {
          AGGREGATE.rating = data.rating || 0;
          AGGREGATE.total = data.total || (data.reviews ? data.reviews.length : 0);
          return data.reviews || [];
        })
        .catch(function () { return []; });
    }
    // No proxy configured yet → no real reviews available.
    return Promise.resolve(REVIEWS.slice());
  }

  /* ----------------------------- RENDER -------------------------------- */
  function renderReviews(reviews) {
    if (!track) return;
    track.innerHTML = reviews.map(function (rv) {
      var initials = (rv.author || "?").trim().charAt(0).toUpperCase();
      var avatar = rv.avatar
        ? '<img src="' + escapeHtml(rv.avatar) + '" alt="" loading="lazy" />'
        : initials;
      return (
        '<article class="review-card">' +
          '<div class="review-card__top">' +
            '<span class="review-card__avatar">' + avatar + "</span>" +
            "<div><p class=\"review-card__name\">" + escapeHtml(rv.author || "") + "</p>" +
            '<p class="review-card__date">' + escapeHtml(rv.date || "") + "</p></div>" +
            '<span class="review-card__source">' + gLogo + "</span>" +
          "</div>" +
          starsHtml(rv.rating || 0) +
          '<p class="review-card__text">' + escapeHtml(rv.text || "") + "</p>" +
        "</article>"
      );
    }).join("");

    if (ratingEl) ratingEl.innerHTML = starsHtml(AGGREGATE.rating, true);
    if (summaryValueEl) summaryValueEl.textContent = AGGREGATE.rating ? AGGREGATE.rating.toFixed(1) : "";
    if (summaryCountEl) summaryCountEl.textContent = AGGREGATE.total ? AGGREGATE.total + " avis vérifiés" : "";
  }

  /* --------------------- SHOW / HIDE SECTION --------------------------- */
  function hideReviewsSection() {
    if (section) { section.hidden = true; section.setAttribute("aria-hidden", "true"); }
  }
  function showReviewsSection() {
    if (section) { section.hidden = false; section.removeAttribute("aria-hidden"); }
  }

  /* ------------------------- SLIDER NAV -------------------------------- */
  function wireSlider() {
    if (!track) return;
    var step = function () {
      var c = track.querySelector(".review-card");
      return c ? c.offsetWidth + 24 : 320;
    };
    if (section) {
      section.querySelectorAll("[data-reviews-prev]").forEach(function (b) {
        b.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
      });
      section.querySelectorAll("[data-reviews-next]").forEach(function (b) {
        b.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
      });
    }
  }

  /* ------------------------------ INIT --------------------------------- */
  function init() {
    section = document.querySelector("[data-reviews]");
    if (!section) return;
    track = section.querySelector("[data-reviews-track]");
    ratingEl = section.querySelector("[data-reviews-rating]");
    summaryValueEl = section.querySelector("[data-reviews-score]");
    summaryCountEl = section.querySelector("[data-reviews-count]");

    // Honour both the JS flag and the data-enabled attribute.
    var enabled = ENABLE_REVIEWS && section.getAttribute("data-enabled") !== "false";
    if (!enabled) { hideReviewsSection(); return; }

    wireSlider();
    fetchReviews().then(function (reviews) {
      if (!reviews || reviews.length === 0) {
        hideReviewsSection(); // never show an empty / fake section
        return;
      }
      REVIEWS = reviews;
      renderReviews(reviews);
      showReviewsSection();
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  // Public API
  return {
    config: REVIEWS_CONFIG,
    fetchReviews: fetchReviews,
    renderReviews: renderReviews,
    hideReviewsSection: hideReviewsSection,
    showReviewsSection: showReviewsSection
  };
})();
