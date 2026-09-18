/* Aspen Square — online application
 * ACTIVATION (one-line each; leave blank until the account exists):
 *   endpoint     — a form backend that receives POSTed applications, e.g. Formspree: "https://formspree.io/f/XXXXXXXX"
 *                  (blank = hand off to the leasing inbox via the applicant's email app, same as the contact form)
 *   screeningUrl — the secure, hosted page where the applicant pays the screening fee and authorizes the credit
 *                  check, e.g. a Stripe Payment Link, Zillow Applications, or TransUnion SmartMove invite link.
 *                  Card details are entered THERE — never on this site.
 */
var APPLY_CONFIG = {
  /* FormSubmit relays the posted application to the leasing inbox — no account, one-time
     "Activate" click from that inbox on the first submission. Change the address here if
     Quin wants applications at a different email. */
  endpoint: "https://formsubmit.co/ajax/info@mclayproperties.com",
  /* Zillow Applications: paste Quin's "Apply" link from Zillow Rental Manager here.
     Applicant pays Zillow's fee there (covers credit + background + eviction); card details never touch this site. */
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
    copy.textContent += " The leasing office will text or email you the Zillow screening link as soon as your application is received.";
  }


  /* ---------- Live input formatting ---------- */
  function formatPhone(raw) {
    var d = raw.replace(/\D/g, "");
    if (d.length === 11 && d.charAt(0) === "1") { d = d.slice(1); }
    d = d.slice(0, 10);
    if (d.length < 4) { return d; }
    if (d.length < 7) { return "(" + d.slice(0, 3) + ") " + d.slice(3); }
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }
  function formatMoney(raw) {
    var cleaned = raw.replace(/[^\d.]/g, "");
    var parts = cleaned.split(".");
    var whole = parts[0].replace(/^0+(?=\d)/, "");
    var dec = parts.length > 1 ? "." + parts.slice(1).join("").slice(0, 2) : "";
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return whole + dec;
  }
  function liveFormat(el, fn) {
    el.addEventListener("input", function () {
      var atEnd = el.selectionStart === el.value.length;
      el.value = fn(el.value);
      if (atEnd) { el.setSelectionRange(el.value.length, el.value.length); }
    });
    el.addEventListener("blur", function () { el.value = fn(el.value); });
  }
  document.querySelectorAll("#applyForm input[type=tel]").forEach(function (el) {
    el.placeholder = "(608) 555-0123";
    liveFormat(el, formatPhone);
  });
  var incomeEl = document.querySelector("#applyForm input[name=income]");
  if (incomeEl) { incomeEl.placeholder = "4,200"; liveFormat(incomeEl, formatMoney); }

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
      var payload = {};
      data.forEach(function (v, k) { payload[k] = (k.indexOf("consent_") === 0 && v === "on") ? "Yes" : v; });
      payload._subject = subject;
      payload._template = "table";
      payload._captcha = "false";
      fetch(APPLY_CONFIG.endpoint, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (!res || String(res.success) !== "true") { throw new Error("relay rejected"); }
        done("Application received — thank you, " + data.get("first_name") + ". Next: complete screening below.");
      }).catch(function () {
        done("We couldn't submit that automatically. Please call " + APPLY_CONFIG.leasingPhone + " and we'll take your application by phone.");
      });
    } else {
      done("Online submission isn't active yet. Please call " + APPLY_CONFIG.leasingPhone + " to apply.");
    }
  });
})();
