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
    gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => {
        gsap.to(el, {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.5,
            ease: 'power2.inOut',
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
        // The opening push-out. Long and nearly linear on purpose.
        //
        // `power2.out` over 2.6s spent most of its travel in the first second
        // and then crawled — which reads as a quick zoom that stalls, not as a
        // camera settling. `power1.out` over 6s keeps the rate close to even
        // for most of the move and takes the speed out only at the very end,
        // so the frame drifts open continuously and comes to rest without a
        // visible stop.
        //
        // force3D pins the layer to the GPU for the whole tween. Left on
        // "auto" GSAP hands it back at the end, and re-rasterising a
        // full-bleed 2560px plate at the moment it lands is exactly where a
        // scaling image shows a hitch.
        gsap.fromTo(
            img,
            { scale: 1.14 },
            { scale: 1, duration: 6, ease: 'power1.out', force3D: true }
        );

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
