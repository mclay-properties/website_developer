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

  /* ---------- Contact form ----------
     Posts to /api/inquiry (api/inquiry.js), which emails the leasing inbox. If that
     function is missing or not yet configured, falls back to opening the visitor's
     own email app, which is how the form worked before the function existed. */
  var form = document.getElementById("contactForm");
  var sendBtn = form.querySelector("button[type=submit]");
  var sendLabel = sendBtn.textContent;
  var CONTACT_PHONE = "608-774-8718";
  var CONTACT_EMAIL = "info@mclayproperties.com";

  function formNote(msg) {
    var note = form.querySelector(".form__success");
    if (!note) {
      note = document.createElement("p");
      note.className = "form__success";
      note.setAttribute("role", "status");
      form.appendChild(note);
    }
    note.textContent = msg;
  }

  function openEmailApp(data) {
    var body =
      "Name: " + data.name + "\n" +
      "Phone: " + data.phone + "\n" +
      "Email: " + (data.email || "—") + "\n\n" +
      (data.message || "I'd like to schedule a tour of Aspen Square.");
    window.location.href =
      "mailto:" + CONTACT_EMAIL + "?subject=" +
      encodeURIComponent("Aspen Square inquiry from " + data.name) +
      "&body=" +
      encodeURIComponent(body);
    formNote("Opening your email app… If it doesn't open, call us at " + CONTACT_PHONE + ".");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sendBtn.disabled) return;

    var fd = new FormData(form);
    var data = {
      name: (fd.get("name") || "").trim(),
      phone: (fd.get("phone") || "").trim(),
      email: (fd.get("email") || "").trim(),
      message: (fd.get("message") || "").trim(),
      trap: fd.get("trap") || ""
    };

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";

    fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (json) {
        return { status: r.status, body: json || {} };
      });
    }).then(function (res) {
      if (res.status === 200 && res.body.ok) {
        form.reset();
        formNote("Thank you, " + data.name + ". Your inquiry was sent and we'll be in touch soon.");
      } else if (res.status === 404 || res.status === 405 || res.status === 501 ||
                 (res.status === 503 && res.body.error === "not_configured")) {
        openEmailApp(data);
      } else if (res.status === 422) {
        formNote(res.body.error === "bad_email"
          ? "That email address doesn't look right. Please check it and try again."
          : "Please enter your name and phone number, then try again.");
      } else if (res.status === 429) {
        formNote("We've received several inquiries from you already. For anything else, please call " + CONTACT_PHONE + ".");
      } else {
        throw new Error("send failed");
      }
    }).catch(function () {
      formNote("Sorry, we couldn't send that. Please call us at " + CONTACT_PHONE + " or email " + CONTACT_EMAIL + ".");
    }).then(function () {
      sendBtn.disabled = false;
      sendBtn.textContent = sendLabel;
    });
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

  /* ---------- Aerial video selector ---------- */
  var aerialPlayer = document.getElementById("aerialPlayer");
  var aerialTabs = document.querySelectorAll(".aerial__tab");
  aerialTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (tab.classList.contains("is-active")) return;
      aerialTabs.forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      aerialPlayer.poster = tab.getAttribute("data-poster");
      var source = aerialPlayer.querySelector("source");
      source.src = tab.getAttribute("data-video");
      aerialPlayer.load();
      aerialPlayer.play().catch(function () { /* wait for the visitor to press play */ });
    });
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
