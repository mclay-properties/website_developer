/* McLay Properties — interactions */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById("header");
  var onScroll = function () {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("headerNav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Fade-in reveal ---------- */
  var fadeEls = document.querySelectorAll(".fade");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    fadeEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      observer.observe(el);
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Contact form (mailto handoff until a backend is wired up) ---------- */
  var form = document.getElementById("contactForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var body =
      "Name: " + data.get("name") + "\n" +
      "Phone: " + data.get("phone") + "\n" +
      "Email: " + (data.get("email") || "—") + "\n\n" +
      (data.get("message") || "I'd like to schedule a tour of Aspen Square.");
    var subject = "Aspen Square inquiry from " + data.get("name");
    window.location.href =
      "mailto:info@mclayproperties.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    if (!form.querySelector(".form__success")) {
      var note = document.createElement("p");
      note.className = "form__success";
      note.textContent =
        "Opening your email app… If it doesn't open, call us at 608-774-8945.";
      form.appendChild(note);
    }
  });

  /* ---------- Look & Lease promo banner ---------- */
  var promo = document.getElementById("promoBanner");
  var promoClose = document.getElementById("promoClose");
  var promoDismissed = false;
  try {
    promoDismissed = sessionStorage.getItem("promoDismissed") === "1";
  } catch (err) { /* storage unavailable — show the banner */ }
  if (!promoDismissed) {
    promo.hidden = false;
    window.setTimeout(function () {
      promo.classList.add("is-open");
    }, 1200);
  }
  promoClose.addEventListener("click", function () {
    promo.classList.remove("is-open");
    window.setTimeout(function () { promo.hidden = true; }, 500);
    try { sessionStorage.setItem("promoDismissed", "1"); } catch (err) { /* ignore */ }
  });
  promo.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".promo__btn")) {
      promoClose.click();
    }
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
