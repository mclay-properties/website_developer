# McLay Properties — Aspen Square Apartments

A modern redesign of [mclayproperties.com](https://mclayproperties.com): a fast, single-page static site with no build step or dependencies. Host it anywhere (Netlify, Vercel, GitHub Pages, or any web server) by serving the repo root.

## Structure

```
index.html        — the entire site (all sections)
css/styles.css    — design system + all styling
js/main.js        — scroll reveals, counters, mobile nav, parallax, contact form
```

## Sections

Hero · Stats · Residences · Amenities · **Aerial Views (drone)** · Floor Plan · Gallery · Location · Apply CTA · Contact

## Adding the drone footage

The **Aerial Views** section (`#aerial`) is a reserved cinematic showcase, currently showing an animated "coming soon" placeholder. When the footage is ready:

1. Add the video to the repo, e.g. `media/aspen-square-drone.mp4` (and ideally a poster frame `media/drone-poster.jpg`).
2. In `index.html`, find the `DRONE FOOTAGE DROP-IN POINT` comment and replace the contents of `<div class="aerial__frame" id="droneFrame">` with:

   ```html
   <video class="aerial__video" src="media/aspen-square-drone.mp4"
          poster="media/drone-poster.jpg" controls playsinline></video>
   ```

The animated golden frame around the section stays and will wrap the video automatically. For a large file, consider hosting the video on a CDN or as an unlisted YouTube/Vimeo embed instead and placing the `<iframe>` in the same spot.

## Replacing placeholder photography

The hero, "Residences" photos, and gallery currently use stock photography (Unsplash CDN) as stand-ins. To use real property photos:

1. Add images to an `img/` folder.
2. Update the `background-image` URLs in `css/styles.css` — search for `images.unsplash.com` to find all of them (`.hero__img`, `.about__photo--a/b`, `.gallery__img--1` through `--5`).

Each image spot has a colored fallback, so nothing breaks if a URL is missing.

## Contact form

The form currently opens the visitor's email app (`mailto:`) pre-filled with their inquiry — no backend needed. Update the address in `js/main.js` (search for `mailto:`) or wire it to a form service (Formspree, Netlify Forms, etc.) by swapping the submit handler.

## Content notes

- Address: 2605 N. Pontiac Dr., Janesville, WI
- Phones: 608-774-8945 · 608-774-8718 · 608-756-2926
- Tagline retained from the original site: "Condo living without the maintenance fees."
