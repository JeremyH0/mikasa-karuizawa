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
| `hero-forest.jpg` | ~3:2 | **2560 px** | Full-screen hero + social preview |
| `approach-lane.jpg` | 3:4 | **1400 px** | Overview, left column |
| `location-map.png` | 3:2 | **2400 px** | Location section |
| `site-survey.png` | ~1:1 | **2000 px** | Land section |
| `villa-aerial.jpg` | ~7:5 | **2560 px** | Concept, large plate |
| `villa-exterior.jpg` | 3:2 | **1600 px** | Concept band, left |
| `villa-bathroom.jpg` | 3:2 | **1600 px** | Concept band, centre |
| `villa-bedroom.jpg` | 3:2 | **1600 px** | Concept band, right |

**Minimum width** is what a 2× (retina) render of that slot actually needs.
Below it the image visibly softens on a MacBook or a modern phone. Above it is
fine — just watch the file size.

The ratios are what the slots are built to. A file at a different ratio is
cropped centrally to fit rather than distorted, so a little variance is fine;
a lot will lose the edges of the composition.

---

## Notes on specific slots

### `hero-forest.jpg` — the one that matters most
Doubles as the `og:image`, so it is what appears when the link is pasted into
WhatsApp, LINE, WeChat or Slack.

Built from `src/assets/images/mikasa-hero-upscaled.png` (2714 px), **not** from
the deck's own `mikasa-photo-01.png` — that export is only 1357 px, under half
the width this slot needs, and `withoutEnlargement` in the optimiser correctly
refused to invent the missing pixels. Output is 2560×1700 at ~545 KB. If a true
high-resolution original is ever delivered, point the hero job in
`scripts/optimize-images.mjs` at it and re-run `npm run images`; the declared
`height` in `Hero.astro` must match the new intrinsic ratio.

Keep the ridgelines in the **middle third**: the headline sits over the lower
left, and social crops take the centre. This is the only image where going
above the minimum is worth the bytes — aim 2560–3200 px wide.

### `location-map.png` — PNG, not JPEG
Line-and-flat-colour artwork. JPEG turns the road edges and the lake outline to
mush at any reasonable quality setting.

The three labels — *Site location*, *Old Ginza Street*, *Karuizawa Station* —
are **not** part of this image. They sit over it as live HTML so they stay
sharp, animate in, and translate. Coordinates are percentages in
`src/components/Location.astro`:

```
site     30% / 22%
ginza    57% / 62%
station  63% / 86%
```

If the map is exported at a different crop, re-tune those three pairs. That is
the only thing that needs touching.

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
