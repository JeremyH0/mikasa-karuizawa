# Old Karuizawa · Mikasa

One-page marketing site for a 2,926.84 m² (878.6 tsubo) woodland estate site in
the Mikasa district of Old Karuizawa, Nagano. Hirafu Capital GK.

Built as a sibling of `thekaruizawaestate.com/hc-property` — same Astro + Tailwind
v4 stack, same i18n registry shape, same self-hosted font strategy, same rsync
deploy. Moving between the two should feel like reading the same codebase twice.

Working on this codebase? Read [`CLAUDE.md`](CLAUDE.md) as well — it carries the
conventions and the specific traps (Tailwind v4's `translate` vs `transform`,
the shared `max-w-shell` width, why `public/` images are never optimised by
Astro) that this file does not.

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
| **Languages built** | English + Japanese. The two Chinese dictionaries are complete but held back pending a native review — one line in `src/i18n/config.ts` |
| **Photography** | All 8 slots filled from the deck. The hero is built from an upscaled plate; the three interior renders are still 678 px originals and are the weakest assets on the page — see [`public/images/ASSETS.md`](public/images/ASSETS.md) |
| **Enquiry form** | ⚠️ Wired end to end, but **no recipient mailbox is set**, and it needs PHP — see *Deploy* |
| **Domain** | ⚠️ Placeholder (`mikasa-karuizawa.com`) in `astro.config.mjs` and `public/robots.txt` |
| **Unverified copy** | ⚠️ Travel times, contact address — see [`docs/CONTENT.md`](docs/CONTENT.md) |

Payload, per page: **~75 KB gzipped** (49 KB JS, 8 KB CSS, 16 KB HTML) plus
72 KB of Latin fonts. Images are the real weight — 2.0 MB across all eight,
of which the hero is 545 KB. No third-party requests of any kind.

---

## Languages

Four dictionaries exist and are complete: `en`, `ja`, `zh-Hans`, `zh-Hant`.
**English and Japanese are currently built.**

The switch is one line — `src/i18n/config.ts`:

```ts
export const locales: readonly Locale[] = ['en', 'ja'];  // now
export const locales: readonly Locale[] = allLocales;    // add Chinese back
export const locales: readonly Locale[] = ['en'];        // English only
```

The unbuilt dictionaries stay on disk and stay type-checked, so they cannot rot
while they are switched off — adding a key to `en.ts` still fails the build
until all four have it.

⚠️ The `ja`, `zh-Hans` and `zh-Hant` files are marked in their own headers as
drafts that have **not had a native review**. Japanese is live in that state;
getting it reviewed is the most immediate outstanding content task.

⚠️ Removing a locale makes its URLs 404. That is correct rather than a bug, but
if `/zh/` or `/zh-hant/` have already been crawled on a live domain, redirect
them to the English page instead of serving a bare 404.

Everything downstream reads that array and nothing else: route generation, the
sitemap, hreflang alternates, `og:locale:alternate`, the header switcher, the
footer, the mobile menu and the first-visit language suggestion. A reduced build
ships **no** stale hreflang and **no** switcher entry pointing at a page that
was not generated; a single-locale build drops the prompt and its JS entirely.

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

**Marcellus** (display) and **Manrope** (body) are self-hosted from
`src/assets/fonts/`. CJK glyphs come from the **reader's own system fonts**,
never a webfont.

The faces are deliberately *not* hc-property's Cormorant Garamond + Plus Jakarta
Sans. Two separate properties under one vendor should not read as the same
listing — see the note at the top of `src/styles/global.css`.

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
| `data-reveal-delay` | Delays that wipe, so one can trail another (the gold mounts) |
| `data-parallax-img` | Vertical drift (`data-parallax-depth`, % of height) — no current callers; superseded by `data-float` |
| `data-hero-img` | Slow push-in, then a very slow breath, plus scroll parallax |
| `data-float-scene` | Container whose pointer position drives the floats inside it |
| `data-float` | Drifts toward the pointer and on scroll (`data-float-depth`, `data-float-lag`) |
| `data-float-zoom` | Image that breathes slowly inside a fixed frame |
| `data-draw` | SVG path draws itself (needs `pathLength="1"`) |
| `data-count` | Number counts up, locale-formatted |
| `data-nav-dark` | Marks a dark section so the header flips to light text |

The float primitives are **desktop and real-pointer only** for the pointer half;
scroll drift and the breath run everywhere. Section headings float too, at about
a tenth of the strength of the images — body copy, tables and form fields
deliberately do not, because text that shifts while you read it is a
readability problem rather than an effect.

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

## Deploy

There are **two** targets, and they are not equivalent.

### Vercel — preview (what `git push` does today)

`main` tracks the `vercel` remote, so pushing deploys a preview build. The site
is static, so everything renders correctly there **except the enquiry form**:
`public/inquiry.php` is PHP, and Vercel does not execute PHP. The form will fail
to send on any Vercel URL. It fails *visibly* — the client shows the error
message rather than a false success — but it does not work.

Treat Vercel as a way to review design and copy, never as the place a buyer
submits an enquiry.

### Xserver — production

```bash
cp .env.deploy.example .env.deploy   # fill in, it is gitignored
npm run deploy
```

This is the target the site is actually built for: Apache + PHP, which is what
the enquiry form needs. `.env.deploy` is **not** in the repo, so this cannot run
until the SSH credentials are filled in.

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
│                    Inquiry · Footer · Navigation · LanguagePrompt · Figure ·
│                    FeatureIcon · StructuredData
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
`brass #B9A57C`, `ink #26261F`, `stone #8A897E`. Two further tokens in
`global.css` are measured rather than chosen — `--color-paper #F3EEE7`, sampled
from the survey scan so its edges dissolve into the panel behind it, and
`--container-shell 1920px`, the one page width every section and the header
share.

---

## Images are optimised by a script, not by Astro

`Figure.astro` loads from `/public` by URL, so **Astro applies no processing at
all** — files there are copied byte for byte into `dist/`. Dropping an 8 MB PNG
in `public/images/` ships an 8 MB PNG to every visitor.

```bash
npm run images   # src/assets/images/ → public/images/, via sharp
```

Originals live in `src/assets/images/`; jobs are declared in
`scripts/optimize-images.mjs`. The current run takes 21 MB down to 1.9 MB. It is
idempotent, so re-run it after replacing any original.

Two traps worth knowing before swapping a source image are written up in
[`CLAUDE.md`](CLAUDE.md) — silent non-enlargement of undersized sources, and
keeping the component's `width`/`height` in step with the new ratio.
