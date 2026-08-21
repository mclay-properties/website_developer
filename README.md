# McLay Properties — Aspen Square Apartments

A modern redesign of [mclayproperties.com](https://mclayproperties.com): a fast, single-page static site with no build step or dependencies. Host it anywhere (Netlify, Vercel, GitHub Pages, or any web server) by serving the repo root.

## Structure

```
index.html        — the entire site (all sections)
css/styles.css    — design system + all styling
js/main.js        — scroll reveals, counters, mobile nav, parallax, contact form
```

## Sections

Hero · Intro · Amenities · **Aerial Views (drone)** · Now Leasing · Floor Plans · Gallery · Neighborhood · Contact

## Hero drone video

The hero background is real drone footage (`media/hero-drone.webm` + `media/hero-drone.mp4`, muted auto-playing loop, ~5 MB each) compressed from "Aspen Square Overhead Fly Through - Home Page.MP4". `img/hero-poster.jpg` shows while it loads and `img/hero.jpg` is the static fallback. To swap the clip, re-encode with ffmpeg (scale to 1280px, strip audio, `-movflags +faststart` for the mp4) and replace both files.

## Aerial Views section

Five drone flights live in the Aerial Views section (`#aerial`) with a tab selector: Community Overhead, Sign Ascent, Front Entrance, Park Entrance, and Kiwanis Park. Files are `media/aerial-*.mp4` (1280p, muted, streaming-optimized) with poster frames in `img/aerial/`. To add or swap a flight, add the compressed MP4 + poster and a matching `.aerial__tab` button in `index.html` (`data-video` / `data-poster`).


## Photography

All photos in `img/` are the real property images from the current mclayproperties.com (exterior/sign, living room, laundry room, garages, the two-bedroom furniture plan, the community site map, and the annotated aerial area map). To swap any of them, replace the file in `img/` keeping the same name, or update the URLs in `css/styles.css` (`.hero__media`, `.gallery__img--1` through `--5`, `.hood__media`, `.tour__media`) and `index.html` (`img/floor-plan.jpg`).

## Adding the Zillow 3D Home virtual tour

The Floor Plans section ends with a "Walk Through in 360°" block whose button opens a lightbox. Until a tour link is configured, the lightbox shows a "coming soon" message.

1. Capture the unit with the free [Zillow 3D Home app](https://www.zillow.com/z/3d-home/) and publish the tour.
2. Copy the tour's share link (looks like `https://www.zillow.com/view-3d-home/XXXXXXXX/`).
3. In `index.html`, find `id="tour"` and paste the link into the empty `data-tour-url=""` attribute.

The lightbox then loads the tour in an embedded frame the first time it's opened.

## Contact form

The form currently opens the visitor's email app (`mailto:`) pre-filled with their inquiry — no backend needed. Update the address in `js/main.js` (search for `mailto:`) or wire it to a form service (Formspree, Netlify Forms, etc.) by swapping the submit handler.

## Content notes

- Address: 2605 N. Pontiac Dr., Janesville, WI
- Phone: 608-774-8718
- Tagline retained from the original site: "Condo living without the maintenance fees."
