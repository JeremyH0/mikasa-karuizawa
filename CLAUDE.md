# CLAUDE.md

One-page, four-language marketing site for a bare-land estate in Old Karuizawa
(Hirafu Capital GK). Astro 6 SSG + Tailwind v4 + GSAP/Lenis, deployed as static
files by rsync to an Apache/PHP box (Xserver).

**`README.md` is the project document and it is detailed — read it for the
stack, the i18n switch, the font policy, the motion vocabulary and the deploy.**
This file covers only what that document does not: the conventions to follow and
the traps that have already cost real bugs here.

```bash
npm run dev      # localhost:4321
npm run build    # → dist/
npm run preview  # serve dist/
npx astro check  # types + Astro diagnostics — run before calling anything done
```

Node ≥ 22.12.

---

## Verify visually, not by reading

Every serious bug in this codebase so far has been invisible in the source and
obvious in a browser. The markup read correctly in all of them.

There is no test suite. Screenshot the built site at **390 (phone), 834
(tablet) and 1440 (desktop)** before claiming a layout change works, and drive
the burger menu for real rather than assuming a class toggle is enough. Note
that `prefers-reduced-motion` lands every animation in its final state, which
makes captures deterministic.

Do not trust `#top`-anchored element screenshots while the mobile menu exists in
the DOM — it is `position: fixed` and off-screen, and it bleeds into captures.
Remove it first.

---

## Tailwind v4: `translate` is not `transform`

v4 compiles `translate-y-*`, `scale-*` and `rotate-*` to the **individual** CSS
properties (`translate:`, `scale:`, `rotate:`), not to `transform`. Those are
separate properties and **both apply** — the individual ones compose first.

So this silently does nothing:

```css
/* element has Tailwind's translate-y-[-100%] → translate: 0 -100% */
.is-open { transform: translateY(0); }   /* adds an identity matrix. That's all. */
```

That exact pattern shipped the mobile menu and the language prompt in a state
where the button worked, `aria-expanded` flipped, the class landed — and nothing
ever appeared on screen. Both are now written with `translate:` on **one**
property for both the open and closed state, in the component's `<style>` block.

**Rule: never mix a Tailwind `translate-*`/`scale-*`/`rotate-*` class with a
hand-written `transform` for the same element.** Pick one property and write
both states on it. (`transition-transform` is fine — in v4 it already covers
transform, translate, scale and rotate.)

## Tailwind v4: class order in the attribute means nothing

Utilities win by their position in the generated stylesheet, not by the order
you type them. Tailwind emits the position utilities as `static, fixed,
absolute, relative, sticky`, so a hardcoded `relative` on a component **beats**
an `absolute` a caller passes in.

`Figure.astro` did exactly that. `Hero.astro` positions the figure
`absolute inset-0` so the headline can sit over it; `relative` won, the image
dropped into normal flow, the headline was pushed a full viewport down, and the
section's `overflow-hidden` clipped it — **the hero headline was invisible on
every page and every breakpoint.**

`Figure.astro` now detects an unprefixed position utility in the incoming class
and drops its own `relative`. If you add another component that takes a `class`
prop and sets its own layout, do the same. Variant-prefixed classes
(`lg:absolute`) are unaffected — media queries already outrank the base rule.

---

## Breakpoints

`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.

**`lg` is the real layout switch** — every two-column composition on this site
collapses there, so 768–1023 (tablet) is a full-width single column and is the
width most likely to look neglected. Check it explicitly; it will not look like
a wide phone or a narrow desktop.

Two consequences that are easy to miss:

- A column sized for a desktop measure (`max-w-[46ch]`) becomes a left-hugging
  block with dead space beside it when it is suddenly the whole page. Centre it
  below `lg` (`mx-auto … lg:mx-0`) rather than letting it rag left.
- A portrait plate left to its own aspect ratio is ~520px tall on a phone and
  over 1100px on a tablet. Cap it (`h-[52svh] max-h-[30rem]`) and keep
  `object-cover`.

**1024 sits inside a tablet's rotation** (iPad Air is 820 × 1180). Anything that
is `lg:hidden` and also holds global state — a scroll lock, a Lenis stop — must
release that state when the viewport crosses the breakpoint, or rotating the
device leaves the page frozen with no visible control to unfreeze it. The mobile
menu has a `matchMedia('(width >= 64rem)')` listener for this; keep the `64rem`
in step with `lg`.

---

## Section order is deliberate, in two ways

`src/pages/[...locale].astro` sets it: Hero → Overview → Concept → Land →
Location → Inquiry. Narratively it moves atmosphere → vision → facts → ask.
Tonally it runs dark → dark → dark → hinge → light, closing on a dark footer.
The Land section is the hinge: a dark panel left, bone right.

Reordering means re-checking that tonal run **and** the header colour states
below.

### The header is transparent and flips colour per section

`motion.ts` reads `data-nav-dark` on each section and toggles a class on the
bar. Three states, chosen by contrast measurement, not taste:

| Marker | Beneath the bar | Text |
|---|---|---|
| *(none)* | light section | ink |
| `data-nav-dark` | flat green | nav gold |
| `data-nav-dark="left"` | green left / bone right | gold wordmark only, dark links |
| `data-nav-dark="photo"` | photography | bone + text-shadow |

The long comment at the top of `Navigation.astro`'s `<style>` has the measured
ratios and explains why gold is never used over a photograph. **Read it before
adding a fourth state or changing a colour.** `is-over-photo` must stay defined
after `is-over-dark` — the nested sentinel in `Concept.astro` relies on it
winning when both are active.

`is-menu-open` pins the bar to menu colours while the panel is open, because the
scroll-derived colour is meaningless once a full-screen green panel covers the
page (it produced a dark-ink close button on dark green).

### Fixed chrome shares one z stack

Three things float over the page. The order is deliberate — check it before
adding a fourth:

| z | Element | Why there |
|---|---|---|
| 60 | `[data-lang-prompt]` | Must never be covered; it is a one-time decision |
| 50 | `[data-nav]` | Above the menu so the close button stays hittable |
| 40 | `[data-mobile-menu]` | Covers the page, sits under the header |

Back to top is a plain link at the end of the footer, **not** a floating
button — that was tried and removed. A disc pinned to the corner sits over the
photography for the whole page and fights the language bar for the same corner.

---

## One page width: `max-w-shell`

`--container-shell` in `global.css` (currently 1920px) is the single page
width, exposed by Tailwind as `max-w-shell`. Five things use it: the header,
the hero, Concept, Location and the footer.

They are **not** independent. The header is fixed and transparent, so its
wordmark and Enquire button float directly above section content the whole way
down. Give one of the five a different width and the bar goes visibly out of
register with whatever is under it mid-scroll. Change the token, never a call
site.

---

## Images: Astro does NOT optimise these

This is the single most important thing to know before dropping a photograph in.

`Figure.astro` references images from `/public` **by URL**, not through
`astro:assets`. That is deliberate — a static import of a file that has not been
delivered yet is a build *error*, so the site could not build at all until every
photograph existed. The cost is that Astro applies no processing whatsoever:
everything in `public/` is copied to `dist/` byte for byte. No format
conversion, no resizing, no compression. An 8 MB PNG dropped there ships as an
8 MB PNG to every visitor, and the hero is `loading="eager"` +
`fetchpriority="high"`, so it is the LCP element on every page.

`scripts/optimize-images.mjs` (`npm run images`) is what does the work. Put the
original in `src/assets/images/`, add or edit a job, re-run. It is idempotent.
The current run takes 21 MB of originals down to 1.9 MB.

Two things to get right when changing a source image:

- `withoutEnlargement: true` means a source **narrower than the target is left
  at native size**, silently. That is why the hero was shipping at 1357px into
  a 2560px slot until the upscaled plate replaced it. Check the reported output
  width, not just that the job succeeded.
- The `width`/`height` props in the component must match the new intrinsic
  ratio. `Figure.astro` turns them into `aspect-ratio`, which is what reserves
  space against layout shift before the file arrives.

---

## The Concept plate switcher is desktop-only, by design

At `lg` the four renders become a stage plus a selectable row. Below `lg` the
same markup renders as it always did: the aerial large, the three interiors
stacked underneath, static.

The part that is easy to break: the three interior buttons are still in the DOM
below `lg`, so they are switched off with the `disabled` property from a
`matchMedia` listener, not with `pointer-events: none`. CSS alone would leave a
keyboard user able to focus and press a control that does nothing. The aerial's
button is `hidden lg:block`, and `hidden` already removes it from the tab order,
so it needs no such handling.

The stage holds the aerial's aspect ratio whatever is showing — a box that
resized per image would shunt the rest of the page up and down on every click.

---

## Two tokens that are measurements, not preferences

- **`--color-paper`** is sampled from `site-survey.png` (palette index 0,
  `#F3EEE7`). The scan is a hair warmer than bone, and the plan is a large
  rectangle with hard straight edges, so on bone those edges ruled a visible
  seam around the drawing. The Land plan column is surfaced in the paper tone
  instead so the plate dissolves into it. **Re-sample this if the survey scan
  is ever replaced.**
- **The pointer** is a brass arrow drawn as an inline SVG data URI on
  `cursor:`, not a JavaScript element chasing the mouse. A scripted cursor is
  painted by the page and therefore always trails the real pointer, worst
  exactly while the main thread is busy with Lenis and ScrollTrigger. This one
  is composited by the OS. It is gated to `(hover: hover) and (pointer: fine)`,
  and text fields keep the native I-beam on purpose — the only conversion point
  on this site is a form.

---

## Content rules that are not style opinions

- **Two different buildings exist in the supplied material.** The deck's
  single-storey L-shaped pavilion is the scheme this site shows. The Realize Co.
  drawings and the `01.jpg` / `02.jpg` renders are a *different* two-storey
  house and are deliberately not built. Do not mix the two sets — see the header
  comment in `Concept.astro`.
- The villa imagery is **renders of a house that does not exist on a plot sold
  as bare land**. `t.concept.note` says so plainly. Keep that note whatever else
  changes.
- **No third-party requests, ever.** Fonts are self-hosted, CJK comes from the
  reader's device. `fonts.googleapis.com` is blocked in mainland China and a
  render-blocking `<link>` would hang the Simplified Chinese page. Adding a font
  CDN, analytics tag or map embed breaks that guarantee and also requires
  editing the CSP in `public/.htaccess`.
- Headline line breaks are authored per-language in the dictionaries. Never add
  a runtime text splitter.

---

## i18n

`src/i18n/config.ts` holds the one switch — `locales` decides what is built,
linked, indexed and prompted. `en.ts` is the **type source** (`Dict`); adding a
key there makes `astro check` fail until all four dictionaries have it. That is
the intended workflow, not an obstacle.

**Currently EN + JA.** The Chinese dictionaries are complete, still type-checked
and simply not rendered. Switching a locale on or off is that one array and
nothing else: routes, sitemap, hreflang, `og:locale:alternate`, the header
switcher, the footer, the mobile menu and the first-visit prompt all read it.

The prompt is worth understanding before touching it. It maps the browser's
language to an internal locale and then looks that locale up in the BUILT list —
so a zh-CN visitor to an EN+JA build is offered nothing, rather than a link to a
page that no longer exists. The browser-language lookup table still ships for
every locale the codebase knows about; that is a few hundred bytes and it is
what keeps re-enabling a language a one-line change.

---

## Enquiry form

Posts to `public/inquiry.php` with a real `action`/`method`, upgraded to `fetch`
when JS is available. It works with JavaScript disabled and must keep working
that way.

⚠️ **The recipient mailbox is still not set.** Config lives outside the web root
— see `inquiry-config.sample.php` and the header of `public/inquiry.php`.

---

## Known documentation drift

`README.md` is stale in two places and worth correcting when convenient:

- It says the display/body faces are Cormorant Garamond and Plus Jakarta Sans.
  They are **Marcellus and Manrope** — `global.css` explains that the type was
  chosen specifically *not* to match the sibling hc-property site.
- It says only English is built; `config.ts` now builds all four.
