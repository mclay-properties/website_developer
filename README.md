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

## Adding the drone footage

The **Aerial Views** section (`#aerial`) is a reserved cinematic showcase, currently showing an animated "coming soon" placeholder. When the footage is ready:

1. Add the video to the repo, e.g. `media/aspen-square-drone.mp4` (and ideally a poster frame `media/drone-poster.jpg`).
2. In `index.html`, find the `DRONE FOOTAGE DROP-IN POINT` comment and replace the contents of `<div class="aerial__frame" id="droneFrame">` with:

   ```html
   <video class="aerial__video" src="media/aspen-square-drone.mp4"
          poster="media/drone-poster.jpg" controls playsinline></video>
   ```

The animated golden frame around the section stays and will wrap the video automatically. For a large file, consider hosting the video on a CDN or as an unlisted YouTube/Vimeo embed instead and placing the `<iframe>` in the same spot.

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
- Phones: 608-774-8945 · 608-774-8718 · 608-756-2926
- Tagline retained from the original site: "Condo living without the maintenance fees."
