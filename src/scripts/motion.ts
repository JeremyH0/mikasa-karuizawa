/**
 * Motion engine.
 *
 * Page authors never import GSAP. They mark up intent with data attributes and
 * this file wires the behaviour, so the animation vocabulary stays in one
 * place and a component can never ship a bespoke tween that drifts from the
 * site's easing.
 *
 *   data-hero                on-load stagger (hero only, runs immediately)
 *   data-lines               container whose .line-mask children reveal in sequence
 *   data-animate             scroll-triggered fade + rise
 *   data-animate-delay="0.2" optional delay, seconds
 *   data-reveal-img          clip-path curtain wipe, opens upward
 *   data-parallax-img        slow vertical drift against the scroll
 *   data-parallax-depth="20" optional travel in % of element height (default 12)
 *   data-draw                SVG path that draws itself (needs pathLength="1")
 *   data-count="2926.84"     number counts up to the value, locale-formatted
 *   data-nav                 sticky header that gains a background once scrolled
 *   data-nav-dark            section that flips the header to light-on-dark
 *   data-float-scene         container whose pointer position drives the below
 *   data-float               plate that drifts and tilts toward the pointer
 *   data-float-depth="1.4"   how strongly, relative to its siblings (default 1)
 *   data-float-zoom          image that breathes slowly inside its own frame
 *   data-to-top              back-to-top control, revealed past the first screen
 *
 * Start states live in global.css under `html.motion-ready`, NOT here — see
 * the comment there for why the ordering matters.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Shared easing. Matches --ease-estate in global.css. */
const EASE = 'power3.out';

// ---------------------------------------------------------------------------
// Smooth scroll
// ---------------------------------------------------------------------------
// Lenis and ScrollTrigger both want to own the scroll position, so Lenis is
// driven from GSAP's ticker rather than its own rAF loop. Running two loops
// makes ScrollTrigger read a stale position and triggers fire a frame late.

let lenis: Lenis | null = null;

function initSmoothScroll() {
    if (prefersReduced) return;

    lenis = new Lenis({
        lerp: 0.085,
        wheelMultiplier: 1,
        smoothWheel: true,
        // Touch devices already have momentum scrolling that users expect;
        // overriding it feels laggy and breaks pull-to-refresh.
        syncTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis?.raf(time * 1000);
    });

    // GSAP's lag smoothing pauses the ticker after a stall, which strands
    // Lenis mid-tween because its rAF is now our ticker.
    gsap.ticker.lagSmoothing(0);

    (window as unknown as { lenis: Lenis }).lenis = lenis;
}

/** Anchor links, routed through Lenis so they inherit the same easing. */
function initAnchors() {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;

            const target = document.querySelector(id);
            if (!target) return;

            event.preventDefault();

            if (lenis) {
                lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.4 });
            } else {
                // Reduced motion: jump, don't glide.
                target.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        });
    });
}

// ---------------------------------------------------------------------------
// Reveals
// ---------------------------------------------------------------------------

/** Masked line reveal. Lines are pre-split in the markup, not at runtime. */
function revealLines(container: Element, delay = 0) {
    const lines = container.querySelectorAll('.line-mask > span');
    if (!lines.length) return null;

    return gsap.to(lines, {
        y: '0%',
        duration: 1.1,
        ease: EASE,
        stagger: 0.09,
        delay,
    });
}

function initHero() {
    const heroEls = gsap.utils.toArray<HTMLElement>('[data-hero]');
    const heroLines = document.querySelector('[data-hero-lines]');

    const tl = gsap.timeline({ delay: 0.15 });

    if (heroLines) {
        const lines = heroLines.querySelectorAll('.line-mask > span');
        if (lines.length) {
            tl.to(lines, {
                y: '0%',
                duration: 1.3,
                ease: EASE,
                stagger: 0.11,
            });
        }
    }

    if (heroEls.length) {
        tl.to(
            heroEls,
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: EASE,
                stagger: 0.12,
            },
            // Overlap the hero furniture with the tail of the headline rather
            // than waiting for it — sequential feels slow at this scale.
            '-=0.7'
        );
    }
}

function initScrollReveals() {
    // Generic fade + rise.
    gsap.utils.toArray<HTMLElement>('[data-animate]').forEach((el) => {
        const delay = parseFloat(el.dataset.animateDelay ?? '0');

        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: EASE,
            delay,
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true,
            },
        });
    });

    // Line groups outside the hero.
    gsap.utils.toArray<HTMLElement>('[data-lines]').forEach((el) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 82%',
            once: true,
            onEnter: () => revealLines(el),
        });
    });

    // Curtain wipe on images.
    //
    // `data-reveal-delay` lets one wipe trail another. It exists for the gold
    // mounts in Concept.astro: the frame carries the same wipe as the picture
    // it surrounds, a fifth of a second behind, so the photograph opens and the
    // gold edge closes in after it. Both on the same clock would read as one
    // flat card arriving.
    gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => {
        gsap.to(el, {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.5,
            ease: 'power2.inOut',
            delay: parseFloat(el.dataset.revealDelay ?? '0'),
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                once: true,
            },
        });
    });
}

// ---------------------------------------------------------------------------
// Continuous scroll effects
// ---------------------------------------------------------------------------

function initParallax() {
    if (prefersReduced) return;

    gsap.utils.toArray<HTMLElement>('[data-parallax-img]').forEach((el) => {
        const depth = parseFloat(el.dataset.parallaxDepth ?? '12');

        // Fade in once, then drift for as long as the element is on screen.
        gsap.to(el, {
            opacity: 1,
            duration: 1.2,
            ease: EASE,
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });

        gsap.fromTo(
            el,
            { yPercent: -depth / 2 },
            {
                yPercent: depth / 2,
                ease: 'none',
                scrollTrigger: {
                    trigger: el.parentElement ?? el,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            }
        );
    });
}

/** Hero image: a slow push-in that resolves as the section scrolls away. */
function initHeroImage() {
    const img = document.querySelector<HTMLElement>('[data-hero-img]');
    if (!img) return;

    if (!prefersReduced) {
        // The opening push-out, then a very slow breath that never stops.
        //
        // ── Why it is not a zoom-out-then-zoom-back-in.
        // A reversal big enough to notice reads as a bounce: the frame arrives,
        // stops, and visibly changes its mind. On a still photograph that looks
        // like a mistake rather than a camera move, and it undermines exactly
        // the calm this section is trying to establish. What works instead is a
        // return so slow and so small that it is never perceived as a
        // direction change at all — you only notice the frame is not quite
        // where you left it.
        //
        // ── The numbers, and why they are what they are.
        // The intro runs 9s from 1.14, nearly linear (`power1.out`), so the
        // frame opens at an even rate and settles without a hard stop. An
        // earlier `power2.out` over 2.6s spent most of its travel in the first
        // second and then crawled, which read as a quick zoom that stalled.
        //
        // The breath that follows travels 4.5% over 20s each way on a
        // sine.inOut, i.e. ~0.2% per second at its fastest. That is under the
        // threshold at which motion is consciously tracked, which is the whole
        // point — it keeps the plate feeling alive without ever asking to be
        // watched. Raising either number is what would make this look weird;
        // if it is ever retuned, move the DURATION, not the distance.
        //
        // force3D pins the layer to the GPU for the whole sequence. Left on
        // "auto" GSAP hands it back at the end, and re-rasterising a full-bleed
        // 2560px plate is exactly where a scaling image shows a hitch.
        const camera = gsap.timeline();

        camera
            .fromTo(img, { scale: 1.14 }, { scale: 1, duration: 9, ease: 'power1.out', force3D: true })
            .to(img, {
                scale: 1.045,
                duration: 20,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                force3D: true,
            });

        // The breath repeats forever, so it must not burn frames on a section
        // nobody is looking at. This parks the whole timeline once the hero has
        // left the viewport and resumes it if the visitor scrolls back up.
        ScrollTrigger.create({
            trigger: img.closest('section') ?? img,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => (self.isActive ? camera.play() : camera.pause()),
        });

        gsap.to(img, {
            yPercent: 14,
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('section') ?? img,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });
    }
}

/**
 * Pointer-reactive float.
 *
 *   data-float-scene        the container the pointer is measured against
 *   data-float              a plate inside it that reacts
 *   data-float-depth="1.4"  how strongly, relative to the others (default 1)
 *
 * Three separate movements, all small, all flat — there is no 3D rotation
 * anywhere here on purpose (see the note on `apply`):
 *
 *   1. pointer   each plate slides toward the cursor, scaled by its depth
 *   2. scroll    a slow vertical drift, again scaled by depth
 *   3. breath    a very slow zoom on the image inside its frame
 *
 * Because the depths differ, the group separates into layers as you move
 * across or scroll past it. That separation IS the effect; a uniform shift
 * would just look like the whole block sliding.
 *
 * Peak pointer travel is ~24px on the deepest plate. `quickTo` lerps toward
 * each new pointer position over ~0.9s rather than tracking it directly, so
 * fast mouse movement produces a smooth glide instead of jitter.
 *
 * Only the POINTER half is gated to desktop and real pointers — there is
 * nothing to follow on a touchscreen. Scroll parallax and the breath run
 * everywhere, since neither needs a cursor.
 */
function initFloat() {
    if (prefersReduced) return;
    // One call per scene. There are two — the Overview lane and the Concept
    // cascade — and each measures the pointer against ITS OWN box, so a plate
    // reacts to where the cursor is inside its own section rather than to some
    // shared origin halfway down the page.
    document.querySelectorAll<HTMLElement>('[data-float-scene]').forEach(initFloatScene);
}

function initFloatScene(scene: HTMLElement) {
    // Scoped to this scene, not the document: `[data-float]` appears in more
    // than one section now.
    const plates = gsap.utils.toArray<HTMLElement>(scene.querySelectorAll('[data-float]'));
    if (!plates.length) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const desktop = window.matchMedia('(width >= 64rem)');

    // `data-float-lag` is how long this layer takes to catch up to the pointer.
    // Leaving it at the 0.9s default keeps a layer in step with its neighbours;
    // raising it makes that layer visibly trail the others. The gold mounts in
    // Concept.astro use a longer lag on purpose, so each frame arrives a beat
    // after the photograph it is behind — a frame that tracks its own picture
    // perfectly is just a border, one that lags is a separate sheet.
    const layers = plates.map((el) => {
        const lag = parseFloat(el.dataset.floatLag ?? '0.9');
        return {
            el,
            depth: parseFloat(el.dataset.floatDepth ?? '1'),
            x: gsap.quickTo(el, 'x', { duration: lag, ease: 'power3' }),
            y: gsap.quickTo(el, 'y', { duration: lag, ease: 'power3' }),
        };
    });

    // Translation only — no rotation. A tilted plate has to fake perspective,
    // and against a hard rectangular crop that reads as a card trick rather
    // than as depth. Layers sliding at different rates give the same volume
    // and stay honest to the flat, printed feel of the rest of the page.
    const apply = (nx: number, ny: number) => {
        for (const l of layers) {
            l.x(nx * 24 * l.depth);
            l.y(ny * 18 * l.depth);
        }
    };

    // --- Scroll parallax ---------------------------------------------------
    // Uses yPercent, while the pointer above uses y. They are separate parts of
    // the same transform and compose cleanly, so the two effects never fight
    // over one property. Runs at every width and on touch — it is scroll, not
    // pointer, so there is nothing to gate.
    for (const l of layers) {
        gsap.fromTo(
            l.el,
            { yPercent: -3.5 * l.depth },
            {
                yPercent: 3.5 * l.depth,
                ease: 'none',
                scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: true },
            }
        );
    }

    // --- The breath --------------------------------------------------------
    // A slow zoom on the IMAGE inside each frame. The frame is overflow-hidden
    // and never scales itself, so the cascade's overlaps stay exactly where
    // they were laid out — only the picture moves within its window.
    //
    // Durations are deliberately unequal (17/21/19/23s). Matched durations
    // would put all four in lockstep, which stops reading as four separate
    // photographs breathing and starts reading as one animation.
    const zooms = gsap.utils.toArray<HTMLElement>(scene.querySelectorAll('[data-float-zoom]'));
    const spans = [17, 21, 19, 23];
    zooms.forEach((el, i) => {
        gsap.fromTo(
            el,
            { scale: 1 },
            {
                scale: 1.055,
                duration: spans[i % spans.length],
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                force3D: true,
                scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', toggleActions: 'play pause resume pause' },
            }
        );
    });

    const onMove = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        const r = scene.getBoundingClientRect();
        // Normalised to -1..1 from the centre of the scene.
        apply((e.clientX - (r.left + r.width / 2)) / (r.width / 2), (e.clientY - (r.top + r.height / 2)) / (r.height / 2));
    };

    // Ease back to rest when the pointer leaves rather than freezing mid-tilt.
    const onLeave = () => apply(0, 0);

    let bound = false;
    const sync = () => {
        const on = fine.matches && desktop.matches;
        if (on === bound) return;
        if (on) {
            scene.addEventListener('pointermove', onMove);
            scene.addEventListener('pointerleave', onLeave);
        } else {
            scene.removeEventListener('pointermove', onMove);
            scene.removeEventListener('pointerleave', onLeave);
            // Clear the transforms outright — below lg the plates are a plain
            // stacked column and must not be left holding a tilt from before
            // the viewport was resized.
            gsap.set(plates, { x: 0, y: 0 });
        }
        bound = on;
    };

    fine.addEventListener('change', sync);
    desktop.addEventListener('change', sync);
    sync();
}

/** The site-plan boundary draws itself, then the area figure counts up. */
function initDraw() {
    gsap.utils.toArray<SVGPathElement>('[data-draw]').forEach((path) => {
        gsap.to(path, {
            strokeDashoffset: 0,
            duration: 2.2,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: path.closest('svg') ?? path,
                start: 'top 75%',
                once: true,
            },
        });
    });
}

function initCounters() {
    gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count ?? '0');
        if (!Number.isFinite(target)) return;

        // Decimal places are inferred from the authored value, so the counter
        // never shows more precision than the source figure claims.
        const decimals = (el.dataset.count ?? '').split('.')[1]?.length ?? 0;
        const locale = document.documentElement.lang || 'en';
        const format = (n: number) =>
            n.toLocaleString(locale, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });

        if (prefersReduced) {
            el.textContent = format(target);
            return;
        }

        const counter = { value: 0 };

        gsap.to(counter, {
            value: target,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
                el.textContent = format(counter.value);
            },
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true,
            },
        });
    });
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
// The header is transparent over the hero and gains a bone background once
// past it. It also flips to light text over any [data-nav-dark] section, so a
// dark band scrolling under it never swallows the wordmark.

function initNav() {
    const nav = document.querySelector<HTMLElement>('[data-nav]');
    if (!nav) return;

    ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => {
            nav.classList.toggle('is-scrolled', self.scroll() > 80);
        },
    });

    // `data-nav-dark` marks a section as dark so the transparent header flips
    // its text to bone. An optional value says HOW MUCH of the width is dark:
    //
    //   data-nav-dark           flat green, full width → gold, whole bar
    //   data-nav-dark="left"    flat green, left column → gold, wordmark only
    //   data-nav-dark="photo"   photography beneath → bone, whole bar
    //
    // "left" exists for the Land section, a dark spec panel against bone on
    // desktop; flipping the whole bar there would put gold links on a bone
    // background. "photo" exists because gold needs roughly twice the scrim
    // bone does to stay legible over an image. Both are explained in full in
    // Navigation.astro — read that before adding a fourth.
    const variants: Record<string, string> = {
        left: 'is-over-dark-left',
        photo: 'is-over-photo',
    };

    gsap.utils.toArray<HTMLElement>('[data-nav-dark]').forEach((section) => {
        const className = variants[section.dataset.navDark ?? ''] ?? 'is-over-dark';

        ScrollTrigger.create({
            trigger: section,
            start: 'top top+=64',
            end: 'bottom top+=64',
            onToggle: (self) => nav.classList.toggle(className, self.isActive),
        });
    });
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function boot() {
    initSmoothScroll();
    initAnchors();
    initHero();
    initHeroImage();
    initScrollReveals();
    initParallax();
    initDraw();
    initCounters();
    initFloat();
    initNav();

    // Tell the failsafe in Layout.astro that motion took over, so it stops
    // counting down to force-revealing the page.
    document.documentElement.classList.add('motion-active');

    // Late-loading images change section heights and every scroll trigger is
    // measured from those heights. One refresh after load is cheaper and more
    // reliable than per-image listeners.
    window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
