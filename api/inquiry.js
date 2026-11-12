/* Aspen Square — contact form relay (Vercel Function, served at /api/inquiry).
 *
 * The "Send Inquiry" form POSTs JSON here and this function emails it to the
 * leasing inbox through Resend (https://resend.com). No dependencies.
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY  required  Resend API key. Secret: never commit it or put it in the page.
 *   INQUIRY_TO      required  Inbox that receives inquiries. Comma-separate to send to several.
 *   INQUIRY_FROM    optional  Sender, e.g. "Aspen Square Website <website@mclayproperties.com>".
 *                             Needs the domain verified in Resend. Until then, leave it unset to
 *                             use Resend's shared test sender.
 *
 * Until RESEND_API_KEY and INQUIRY_TO exist the function answers 503 "not_configured" and the
 * page falls back to opening the visitor's email app, so deploying this file changes nothing
 * for visitors until the keys are added.
 */

var RESEND_URL = "https://api.resend.com/emails";
var DEFAULT_FROM = "Aspen Square Website <onboarding@resend.dev>";
var SEND_TIMEOUT_MS = 8000;

var MAX = { name: 100, phone: 40, email: 254, message: 4000 };
var EMAIL_RE = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

/* Best-effort flood guard: at most RATE_MAX sends per visitor per window. It lives in this
   instance's memory, so it resets when the instance recycles and is not shared between
   instances. It stops a simple script hammering the form; it is not a hard quota. */
var RATE_WINDOW_MS = 10 * 60 * 1000;
var RATE_MAX = 5;
var hits = new Map();

function rateLimited(ip, now) {
  if (hits.size > 5000) { hits.clear(); }
  var recent = (hits.get(ip) || []).filter(function (t) { return now - t < RATE_WINDOW_MS; });
  if (recent.length >= RATE_MAX) { hits.set(ip, recent); return true; }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clientIp(req) {
  var fwd = req.headers["x-forwarded-for"];
  if (Array.isArray(fwd)) { fwd = fwd[0]; }
  if (typeof fwd === "string" && fwd) { return fwd.split(",")[0].trim(); }
  return req.headers["x-real-ip"] || "unknown";
}

/* Trim a field to a string of at most `max` characters. */
function field(value, max) {
  if (typeof value !== "string") { return ""; }
  return value.trim().slice(0, max);
}

/* Collapse line breaks so a value is safe in a subject line or header. */
function oneLine(value) {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

function readBody(req) {
  var body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { return null; }
  }
  return body && typeof body === "object" && !Array.isArray(body) ? body : null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  var apiKey = process.env.RESEND_API_KEY;
  var to = (process.env.INQUIRY_TO || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
  if (!apiKey || !to.length) {
    return res.status(503).json({ ok: false, error: "not_configured" });
  }

  var body = readBody(req);
  if (!body) {
    return res.status(400).json({ ok: false, error: "bad_request" });
  }

  /* Hidden field real visitors never see. A bot that fills it gets a normal-looking
     success so it has no reason to adapt, and nothing is sent. */
  if (field(body.trap, 200)) {
    return res.status(200).json({ ok: true });
  }

  var name = oneLine(field(body.name, MAX.name));
  var phone = oneLine(field(body.phone, MAX.phone));
  var email = oneLine(field(body.email, MAX.email));
  var message = field(body.message, MAX.message);

  if (!name || !phone) {
    return res.status(422).json({ ok: false, error: "missing_fields" });
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(422).json({ ok: false, error: "bad_email" });
  }

  if (rateLimited(clientIp(req), Date.now())) {
    return res.status(429).json({ ok: false, error: "rate_limited" });
  }

  var text =
    "New inquiry from the Aspen Square website\n\n" +
    "Name:  " + name + "\n" +
    "Phone: " + phone + "\n" +
    "Email: " + (email || "(not provided)") + "\n\n" +
    "Message:\n" +
    (message || "I'd like to schedule a tour of Aspen Square.") + "\n\n" +
    "--\n" +
    (email
      ? "Reply to this email to answer " + name + " directly."
      : "No email address was given, so please follow up by phone.");

  var payload = {
    from: process.env.INQUIRY_FROM || DEFAULT_FROM,
    to: to,
    subject: "Aspen Square inquiry from " + name,
    text: text
  };
  if (email) { payload.reply_to = email; }

  try {
    var r = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS)
    });
    if (!r.ok) {
      var detail = await r.text().catch(function () { return ""; });
      /* Visible in Vercel → Logs. Holds Resend's reason, never the visitor's details. */
      console.error("inquiry: Resend rejected the send", r.status, detail.slice(0, 500));
      return res.status(502).json({ ok: false, error: "send_failed" });
    }
  } catch (err) {
    console.error("inquiry: could not reach Resend", err && err.name, err && err.message);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }

  return res.status(200).json({ ok: true });
};
