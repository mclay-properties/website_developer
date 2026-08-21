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
    var heroIndex = 0;
    fadeEls.forEach(function (el, i) {
      if (el.closest(".hero")) {
        el.style.transitionDelay = 150 + heroIndex * 160 + "ms";
        heroIndex += 1;
      } else {
        el.style.transitionDelay = (i % 3) * 90 + "ms";
      }
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
        "Opening your email app… If it doesn't open, call us at 608-774-8718.";
      form.appendChild(note);
    }
  });

  /* ---------- Background music toggle ---------- */
  var music = document.getElementById("bgMusic");
  var audioToggle = document.getElementById("audioToggle");
  music.volume = 0.45;
  audioToggle.addEventListener("click", function () {
    if (music.paused) {
      music.play().then(function () {
        audioToggle.setAttribute("aria-pressed", "true");
        audioToggle.setAttribute("aria-label", "Pause background music");
      }).catch(function () { /* playback blocked — leave toggled off */ });
    } else {
      music.pause();
      audioToggle.setAttribute("aria-pressed", "false");
      audioToggle.setAttribute("aria-label", "Play background music");
    }
  });

  /* ---------- Virtual tour modal ---------- */
  var tourModal = document.getElementById("tourModal");
  var tourBody = document.getElementById("tourBody");
  var tourSection = document.getElementById("tour");
  var tourLoaded = false;
  var openTour = function () {
    var url = tourSection.getAttribute("data-tour-url");
    if (url && !tourLoaded) {
      var frame = document.createElement("iframe");
      frame.src = url;
      frame.allow = "fullscreen; gyroscope; accelerometer";
      frame.title = "Zillow 3D Home virtual tour of an Aspen Square two-bedroom apartment";
      tourBody.replaceChildren(frame);
      tourLoaded = true;
    }
    tourModal.hidden = false;
    document.body.style.overflow = "hidden";
  };
  var closeTour = function () {
    tourModal.hidden = true;
    document.body.style.overflow = "";
  };
  document.getElementById("tourOpen").addEventListener("click", openTour);
  document.getElementById("tourClose").addEventListener("click", closeTour);
  tourModal.querySelector(".modal__backdrop").addEventListener("click", closeTour);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !tourModal.hidden) closeTour();
  });

  /* ---------- Look & Lease promo banner ---------- */
  var promo = document.getElementById("promoBanner");
  var promoClose = document.getElementById("promoClose");
  var promoDismissed = false;
  try {
    promoDismissed = sessionStorage.getItem("promoDismissed") === "1";
  } catch (err) { /* storage unavailable — show the banner */ }
  var positionAudioToggle = function () {
    if (!promo.hidden && promo.classList.contains("is-open")) {
      audioToggle.style.bottom = promo.offsetHeight + 16 + "px";
    } else {
      audioToggle.style.bottom = "";
    }
  };
  window.addEventListener("resize", positionAudioToggle, { passive: true });
  if (!promoDismissed) {
    promo.hidden = false;
    window.setTimeout(function () {
      promo.classList.add("is-open");
      window.setTimeout(positionAudioToggle, 520);
    }, 1200);
  }
  promoClose.addEventListener("click", function () {
    promo.classList.remove("is-open");
    window.setTimeout(function () { promo.hidden = true; }, 500);
    try { sessionStorage.setItem("promoDismissed", "1"); } catch (err) { /* ignore */ }
    positionAudioToggle();
  });
  promo.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".promo__btn")) {
      promoClose.click();
    }
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
