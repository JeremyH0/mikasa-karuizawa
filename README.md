# Old Karuizawa · Mikasa

One-page marketing site for a 2,926.84 m² (878.6 tsubo) woodland estate site in
the Mikasa district of Old Karuizawa, Nagano. Hirafu Capital GK.

Built as a sibling of `thekaruizawaestate.com/hc-property` — same Astro + Tailwind
v4 stack, same i18n registry shape, same self-hosted font strategy, same rsync
deploy. Moving between the two should feel like reading the same codebase twice.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve dist/ locally
npm run deploy   # build + rsync to Xserver (needs .env.deploy)
```

Requires Node ≥ 22.12.

---

## Current state

| | |
|---|---|
| **Languages built** | English only — see *Languages* below |
| **Photography** | Awaiting high-resolution finals. All 8 slots laid out, each rendering a placeholder at the correct ratio. Filenames + minimum resolutions in [`public/images/ASSETS.md`](public/images/ASSETS.md) |
| **Domain** | ⚠️ Placeholder (`mikasa-karuizawa.com`) in `astro.config.mjs` and `public/robots.txt` |
| **Unverified copy** | ⚠️ Travel times, contact address — see [`docs/CONTENT.md`](docs/CONTENT.md) |

Payload, English build: **~68 KB gzipped** total (51 KB JS, 7 KB CSS, 10 KB HTML),
plus Latin fonts. No third-party requests of any kind.

---

## Languages

Four dictionaries exist and are complete: `en`, `ja`, `zh-Hans`, `zh-Hant`.
Only English is currently **built**.

The switch is one line — `src/i18n/config.ts`:

```ts
export const locales: readonly Locale[] = ['en'];        // now
export const locales: readonly Locale[] = allLocales;    // all four
```

Everything downstream reads that array and nothing else: route generation, the
sitemap, hreflang alternates, the header switcher, the footer, and the
first-visit language suggestion. Flipping it adds or removes three languages
across the whole site at once, and an English-only build ships **no** stale
hreflang, **no** switcher, and none of the language-prompt JS.

| Locale | URL |
|---|---|
| `en` | `/` |
| `ja` | `/jp/` |
| `zh-Hans` | `/zh/` |
| `zh-Hant` | `/zh-hant/` |

**Iterating on English copy never touches the other three files.** Freeze the
English wording first, then flip the switch and do one translation pass.

### Why the language prompt never redirects
On first visit, if the browser's language is one we publish and it is not the
page on screen, a dismissible bar offers the alternative. It does **not**
redirect. Auto-redirecting on `Accept-Language` would mean a Japanese-speaking
agent sending the English page to an overseas buyer watches it bounce to `/jp/`,
and crawlers that follow the redirect can index the wrong language at the
canonical URL.

---

## Fonts, and why nothing loads from Google

Cormorant Garamond (display) and Plus Jakarta Sans (body) are **self-hosted**
from `src/assets/fonts/`. CJK glyphs come from the **reader's own system fonts**,
never a webfont.

This is not an optimisation, it is a requirement:

- `fonts.googleapis.com` is **blocked in mainland China**. A stylesheet `<link>`
  is render-blocking, so the Simplified Chinese page — the one built for that
  market — would hang until the request timed out.
- One weight of one Noto CJK family is ~3.5 MB across 124 files. The full set
  this design would call for adds ~73 MB to the repo and to every deploy.
- Every device that can read Japanese or Chinese already ships good fonts for
  it. CJK text paints on the first frame.

The Latin faces stay **first** in each stack, so only the codepoints they lack
fall through. Mixed strings like `2,926.84㎡` keep the English page's exact look.

See the long comment in `src/styles/global.css`. **Adding a font CDN, an
analytics tag or a map embed breaks the mainland-China guarantee** and requires
editing the CSP in `public/.htaccess`.

---

## Motion

GSAP + ScrollTrigger + Lenis. Page authors never import GSAP — they mark up
intent with data attributes and `src/scripts/motion.ts` wires the behaviour, so
the animation vocabulary lives in one place.

| Attribute | Effect |
|---|---|
| `data-hero` | On-load stagger (hero only) |
| `data-hero-lines` / `data-lines` | Masked line-by-line reveal |
| `data-animate` | Scroll-triggered fade + rise (`data-animate-delay` in seconds) |
| `data-reveal-img` | Clip-path curtain wipe |
| `data-parallax-img` | Vertical drift (`data-parallax-depth`, % of height) |
| `data-hero-img` | Slow push-in, then parallax on scroll |
| `data-draw` | SVG path draws itself (needs `pathLength="1"`) |
| `data-count` | Number counts up, locale-formatted |
| `data-nav-dark` | Marks a dark section so the header flips to light text |

**Headline line breaks are authored in the dictionaries, not split at runtime.**
Each language breaks at completely different points, and a character-count
splitter would put them in the wrong place. It also means the split survives
with JS disabled.

### The three-layer fallback
Animated elements start hidden — but only under `html.motion-ready`, and that
class is added by an inline script in `<head>` *before first paint*. So:

1. **No JS** → the class never lands → content paints fully visible.
2. **JS on, motion.ts fails to boot** → a 2.5 s failsafe removes the class.
3. **`prefers-reduced-motion`** → a hard override lands everything in its final
   state, and Lenis is never started at all. Not a shorter duration — someone
   setting that flag for vestibular reasons is not helped by a faster parallax.

---

## The site plan is two layers

The **real survey drawing** (`public/images/site-survey.png`) sits on top. It is
authoritative — true bearings, boundary markers, adjoining parcel references —
and it wins whenever it is present. Buyers zoom into this one, so it is the
slot where resolution pays off most after the hero.

Underneath is `src/components/SitePlan.astro`, a **vector reconstruction** of
parcel 1369-11 that shows through until the scan is dropped in, so the section
is never empty. Its viewBox is in metres — 1 user unit = 1 m — so the scale bar
and dimension labels are guaranteed to agree with the shape.

⚠️ The vector geometry is fitted to the deck's surveyed edge lengths and lands
~0.8% over on area, because the deck gives lengths and an area but no bearings.
True to the surveyed figures, indicative as to shape — and the page says so.
**The real drawing carries no such caveat**, which is why it takes precedence.

Once the scan is permanent, `SitePlan.astro` can be deleted outright; nothing
else imports it. Vector CAD (DXF/SVG) would be better still.

## Icons

`src/components/FeatureIcon.astro` holds the four marks from deck page 1 — pin,
globe, forest, compass rose — redrawn as vector to the deck's own conventions:
outline only, one hairline weight, round joins, all four optically balanced
inside a 26-unit circle. The compass rose matches the rose on the survey
drawing and the illustrated map, and is the only one that uses fill, because it
does on the source artwork too. Read the style rules at the top of that file
before drawing a fifth.

---

## Deploy (Xserver)

```bash
cp .env.deploy.example .env.deploy   # fill in, it is gitignored
npm run deploy
```

Builds to `dist/`, then rsyncs over SSH. Xserver SSH is **port 10022** and must
be enabled in サーバーパネル first.

- `DEPLOY_DELETE=false` by default. Turn it on only once you have confirmed the
  docroot holds nothing else — on a domain that previously ran WordPress, this
  deletes it permanently.
- `BASE_PATH=/staging` + `AUTH_USER_FILE` gives a password-protected staging
  deploy. `deploy.sh` refuses to apply Basic Auth to a root deploy, so promoting
  to production can never accidentally lock the live site.

`public/.htaccess` handles HTTPS canonicalisation (via `X-Forwarded-Proto`,
because Xserver terminates TLS upstream and `%{HTTPS}` is unreliable there),
compression, caching and a strict CSP.

---

## Layout

```
src/
├── i18n/            config.ts ← the locale switch; en · ja · zh-Hans · zh-Hant
├── layouts/         Layout.astro — head, meta, hreflang, motion primer
├── components/      Hero · Overview · Location · Land · SitePlan · Concept ·
│                    Inquiry · Footer · Navigation · LanguagePrompt · Figure
├── pages/           [...locale].astro · sitemap.xml.ts · 404.astro
├── scripts/         motion.ts — the whole animation engine
├── styles/          global.css (tokens, CJK, motion primitives) · fonts.css
└── assets/fonts/    self-hosted woff2
public/
├── images/          ← drop photography here; see ASSETS.md
└── .htaccess · robots.txt · favicon.svg
docs/CONTENT.md      copy provenance + everything still unverified
```

Palette is sampled from the deck: `bone #F2F1EC`, `forest #3A4133`,
`brass #B9A57C`, `ink #26261F`, `stone #8A897E`.
