/* Aspen Square — online application
 * ACTIVATION (one-line each; leave blank until the account exists):
 *   endpoint     — a form backend that receives POSTed applications, e.g. Formspree: "https://formspree.io/f/XXXXXXXX"
 *                  (blank = hand off to the leasing inbox via the applicant's email app, same as the contact form)
 *   screeningUrl — the secure, hosted page where the applicant pays the screening fee and authorizes the credit
 *                  check, e.g. a Stripe Payment Link, Zillow Applications, or TransUnion SmartMove invite link.
 *                  Card details are entered THERE — never on this site.
 */
var APPLY_CONFIG = {
  endpoint: "",
  screeningUrl: "",
  leasingEmail: "info@mclayproperties.com",
  leasingPhone: "608-774-8718"
};

(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  /* Screening step: show the secure button once a hosted payment/screening page exists */
  var btn = document.getElementById("screeningBtn");
  var copy = document.getElementById("screeningCopy");
  if (APPLY_CONFIG.screeningUrl) {
    btn.href = APPLY_CONFIG.screeningUrl;
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.hidden = false;
  } else {
    copy.textContent += " The leasing office will text or email you the secure payment link as soon as your application is received.";
  }

  /* Application submit */
  var form = document.getElementById("applyForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var data = new FormData(form);
    var lines = [];
    data.forEach(function (v, k) {
      if (k.indexOf("consent_") === 0) { v = v === "on" ? "Yes" : v; }
      lines.push(k.replace(/_/g, " ") + ": " + (v || "—"));
    });
    var name = data.get("first_name") + " " + data.get("last_name");
    var subject = "Aspen Square rental application — " + name;
    var body = "Rental application for Aspen Square Apartments\n\n" + lines.join("\n");

    function done(msg) {
      var note = form.querySelector(".form__success") || document.createElement("p");
      note.className = "form__success";
      note.textContent = msg;
      form.appendChild(note);
      form.querySelector("button[type=submit]").disabled = true;
      document.querySelectorAll(".app__steps li").forEach(function (li, i) {
        li.classList.toggle("is-current", i === 1);
        li.classList.toggle("is-done", i === 0);
      });
      document.getElementById("screening").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (APPLY_CONFIG.endpoint) {
      fetch(APPLY_CONFIG.endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      }).then(function (r) {
        if (!r.ok) { throw new Error("bad status"); }
        done("Application received — thank you, " + data.get("first_name") + ". Next: complete screening below.");
      }).catch(function () {
        done("We couldn't send that automatically. Please call " + APPLY_CONFIG.leasingPhone + " and we'll take your application by phone.");
      });
    } else {
      window.location.href = "mailto:" + APPLY_CONFIG.leasingEmail +
        "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      done("Opening your email app to send your application… If it doesn't open, call " + APPLY_CONFIG.leasingPhone + ". Next: screening below.");
    }
  });
})();
