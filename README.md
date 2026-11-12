# McLay Properties — Aspen Square Apartments

A modern redesign of [mclayproperties.com](https://mclayproperties.com): a fast, single-page static site with no build step or dependencies. Host it anywhere (Netlify, Vercel, GitHub Pages, or any web server) by serving the repo root.

## Structure

```
index.html        — the entire site (all sections)
css/styles.css    — design system + all styling
js/main.js        — scroll reveals, counters, mobile nav, parallax, contact form
api/inquiry.js    — Vercel Function that emails contact form inquiries (see Contact form)
```

## Sections

Hero · Intro · Amenities · **Aerial Views (drone)** · Now Leasing · Floor Plans · Gallery · Neighborhood · Contact

## Hero drone video

The hero background is real drone footage (`media/hero-drone.webm` + `media/hero-drone.mp4`, muted auto-playing loop, ~5 MB each) compressed from "Aspen Square Overhead Fly Through - Home Page.MP4". `img/hero-poster.jpg` shows while it loads and `img/hero.jpg` is the static fallback. To swap the clip, re-encode with ffmpeg (scale to 1280px, strip audio, `-movflags +faststart` for the mp4) and replace both files.

## Aerial Views section

Three drone flights live in the Aerial Views section (`#aerial`) with a tab selector: Community Overhead, Kiwanis Park Flyover, and Kiwanis Park to Aspen Square. Files are `media/aerial-*.mp4` (1280p, muted, streaming-optimized) with poster frames in `img/aerial/`. To add or swap a flight, add the compressed MP4 + poster and a matching `.aerial__tab` button in `index.html` (`data-video` / `data-poster`).


## Photography

All photos in `img/` are the real property images from the current mclayproperties.com (exterior/sign, living room, laundry room, garages, the two-bedroom furniture plan, the community site map, and the annotated aerial area map). To swap any of them, replace the file in `img/` keeping the same name, or update the URLs in `css/styles.css` (`.hero__media`, `.gallery__img--1` through `--5`, `.hood__media`, `.tour__media`) and `index.html` (`img/floor-plan.jpg`).

## Adding the Zillow 3D Home virtual tour

The Floor Plans section ends with a "Walk Through in 360°" block whose button opens a lightbox. Until a tour link is configured, the lightbox shows a "coming soon" message.

1. Capture the unit with the free [Zillow 3D Home app](https://www.zillow.com/z/3d-home/) and publish the tour.
2. Copy the tour's share link (looks like `https://www.zillow.com/view-3d-home/XXXXXXXX/`).
3. In `index.html`, find `id="tour"` and paste the link into the empty `data-tour-url=""` attribute.

The lightbox then loads the tour in an embedded frame the first time it's opened.

## Contact form

The "Send Inquiry" form posts to `/api/inquiry` (`api/inquiry.js`, a Vercel Function), which emails the leasing inbox through [Resend](https://resend.com). It has no dependencies and needs these environment variables in Vercel (Project → Settings → Environment Variables; redeploy after changing them):

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | Resend API key. Secret: keep it out of the repo and the page. |
| `INQUIRY_TO` | yes | Inbox that receives inquiries. Comma-separate for several. |
| `INQUIRY_FROM` | no | Sender, e.g. `Aspen Square Website <website@mclayproperties.com>`. Needs the domain verified in Resend; leave unset until then to use Resend's shared test sender, which only delivers to the Resend account's own address. |

Until the two required variables exist, or on a host with no function, the form falls back to opening the visitor's email app (`mailto:`), so the page works as a plain static site too. If a send fails, the visitor is told to call or email instead, and the reason is written to the Vercel function logs. A hidden field (`trap`) and a per-visitor limit of 5 sends per 10 minutes cut down on bot submissions. The fallback address and phone number are at the top of the contact form block in `js/main.js`.

## Content notes

- Address: 2605 N. Pontiac Dr., Janesville, WI
- Phone: 608-774-8718
- Tagline retained from the original site: "Condo living without the maintenance fees."
