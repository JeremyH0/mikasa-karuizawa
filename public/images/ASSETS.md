# Image manifest

Drop files into **this folder** using the exact names below and they appear —
no code change, no config, nothing to wire up.

Until a file exists, its slot renders a placeholder at the correct proportions,
so the layout, rhythm and scroll distances you see now are the real ones.
Nothing shifts when the photography lands.

---

## The eight files

| Filename | Ratio | Minimum width | Where it appears |
|---|---|---|---|
| `hero-forest.jpg` | ~3:2 | **2560 px** | Full-screen hero |
| `approach-lane.jpg` | 3:4 | **1400 px** | Overview, left column |
| `location-map.jpg` | 3:2 | **2400 px** | Location section |
| `site-survey.png` | ~1:1 | **2000 px** | Land section |
| `villa-aerial.jpg` | ~7:5 | **2560 px** | Concept, large plate |
| `villa-exterior.jpg` | 3:2 | **1600 px** | Concept band, left |
| `villa-bathroom.jpg` | 3:2 | **1600 px** | Concept band, centre |
| `villa-bedroom.jpg` | 3:2 | **1600 px** | Concept band, right |
| `og-cover.jpg` | 1.91:1 | **1200×630** | Social share card — generated, do not hand-edit |

**Minimum width** is what a 2× (retina) render of that slot actually needs.
Below it the image visibly softens on a MacBook or a modern phone. Above it is
fine — just watch the file size.

The ratios are what the slots are built to. A file at a different ratio is
cropped centrally to fit rather than distorted, so a little variance is fine;
a lot will lose the edges of the composition.

---

## Notes on specific slots

### `hero-forest.jpg` — the one that matters most
It no longer doubles as the `og:image`. Share previews use `og-cover.jpg`, a
1200×630 crop generated from the same source — see *Generated assets* below.

Built from `src/assets/images/mikasa-hero-upscaled.png` (2714 px), **not** from
the deck's own `mikasa-photo-01.png` — that export is only 1357 px, under half
the width this slot needs, and `withoutEnlargement` in the optimiser correctly
refused to invent the missing pixels. Output is 2560×1700 at ~545 KB. If a true
high-resolution original is ever delivered, point the hero job in
`scripts/optimize-images.mjs` at it and re-run `npm run images`; the declared
`height` in `Hero.astro` must match the new intrinsic ratio.

Keep the ridgelines in the **middle third**: the headline sits over the lower
left, and the share card is cut from the centre band. This is the only image
where going above the minimum is worth the bytes — aim 2560–3200 px wide.

### `location-map.jpg` — the deck's artwork, shown as drawn

⚠️ This file is a **JPEG**, despite being artwork. That is deliberate and is
explained in `scripts/optimize-images.mjs`: it is watercolour wash with soft
gradients, which is what JPEG is good at and what PNG is bad at. It drops from
~3.5 MB to ~250 KB. (The survey drawing below is the opposite case and stays a
PNG.)

**Nothing is drawn on top of it except two text labels.** The artwork already
carries a gold star on the site, "OLD GINZA STREET" beside its own shop glyph,
route shields and a compass rose. Numbered pins and a legend were built over it
once and removed — two labelling systems arguing over one picture. See the
header comment in `src/components/Location.astro`.

The two labels that remain are live HTML so they stay sharp and translate:

```
Site location       40.5% / 21.9%
Karuizawa Station   55%   / 90.5%
```

⚠️ Those are percentages of the **visible box, not of this file**. The plate is
a 4:3 window onto a 3:2 image, so `object-cover` trims ~6.5% off each side. If
this map is re-exported at a different crop — or the declared 1600×1200 in
`Location.astro` changes — re-measure both pairs.

### `site-survey.png` — PNG, and worth chasing at high resolution
The survey drawing. Buyers **zoom into this one**, so it is the slot where
resolution pays off most after the hero. 2000 px minimum, more if you have it.

It layers over a vector reconstruction in `src/components/SitePlan.astro`,
which is a faithful sketch fitted to the surveyed edge lengths but lands ~0.8%
off on area, because the deck gives lengths and an area but no bearings. **The
real drawing has no such caveat and wins whenever it is present.** Until then
the vector shows through so the section is never empty.

If the survey scan becomes permanent, `SitePlan.astro` can be deleted outright
— nothing else imports it. Vector CAD (DXF/SVG) would be better still.

### The four `villa-*` images
Renders of a house that does not exist, on a plot sold as bare land. The page
says so explicitly (`concept.note` in the dictionaries). **Keep that
disclaimer** whatever else changes.

---

## Weight

`.htaccess` caches images for 7 days, not the year it gives fingerprinted CSS
and JS — these filenames are stable, so a long cache would strand a replaced
photograph in every visitor's browser.

Target **under 400 KB** per image after export; the hero can go to ~600 KB.
Export JPEG at quality 80–85 — above that you are paying bytes for differences
nobody can see.

### If you want AVIF/WebP generated automatically
Move these into `src/assets/` and switch `src/components/Figure.astro` to
Astro's `<Image>`. Worth doing **once the finals are in** — it typically halves
the payload.

It was deliberately not done up front because a static import of a file that
does not exist is a hard build error, which would have meant the site could not
build at all until every photograph had been delivered.

---

## Generated assets

Three files in this project are built by `npm run images` rather than
delivered, and hand-editing them is pointless because the next run overwrites
them:

- **`og-cover.jpg`** — a 1200×630 crop of the hero, used for `og:image` and
  `twitter:image`. It exists because every platform crops a share image to its
  own ratio; giving them the 2560×1700 hero meant each chose a different frame.
  It is also 105 KB against the hero's 545 KB, which matters on LINE and WeChat
  where a large preview often just fails to fetch.
- **`../favicon-32.png`** and **`../apple-touch-icon.png`** — rasterised from
  `public/favicon.svg`. The SVG is what modern browsers use; the 32px PNG is
  the fallback, and the 180px Apple icon is what iOS wants for "Add to Home
  Screen", which will not accept an SVG at all.

Change `public/favicon.svg` or the hero source and re-run `npm run images`;
all three regenerate from it.
