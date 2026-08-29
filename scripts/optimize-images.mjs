#!/usr/bin/env node
/**
 * Build web-ready images in public/images/ from the originals in
 * src/assets/images/.
 *
 *   npm run images
 *
 * Idempotent — safe to re-run. Drop a better original into src/assets/images/
 * under the same name, re-run, and the deployed file is replaced.
 *
 * WHY THIS EXISTS
 * The originals are 4300 px camera/render exports and multi-megabyte PNGs. The
 * site is hosted on Xserver shared hosting and sold to buyers browsing on
 * phones, sometimes on mobile data in Japan or China. Shipping a 3.5 MB PNG of
 * a watercolour map is the single easiest way to make an expensive-looking
 * site feel cheap.
 *
 * FORMAT CHOICES
 * Photographs and renders → JPEG. Obvious.
 * The illustrated map → JPEG too, despite being artwork: it is watercolour
 *   wash with soft gradients, which is exactly what JPEG is good at, and
 *   exactly what PNG is bad at. It drops from ~3.5 MB to ~250 KB.
 * The survey drawing → PNG with a reduced palette. This one IS hard line art
 *   on a flat cream ground: JPEG rings visibly along every boundary line and
 *   dimension figure, and this is the image buyers zoom into. A palette PNG
 *   keeps the lines crisp and still lands under 400 KB.
 *
 * Sharp comes in with Astro, so there is no extra dependency to install.
 */

import sharp from 'sharp';
import { mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/assets/images');
const OUT = path.join(ROOT, 'public/images');

/**
 * `width` is the max width; images smaller than it are left at native size
 * rather than upscaled, because upscaling only adds bytes.
 */
const JOBS = [
    // --- Deck plates -------------------------------------------------------
    // The hero source is the UPSCALED plate, not the deck's own export.
    // mikasa-photo-01.png is only 1357px wide, which is under half the width of
    // the slot it fills — this is a full-bleed 100svh image and the LCP element
    // on every page. mikasa-hero-upscaled.png is 2714px, so it actually feeds
    // the 2560 target instead of being left at native size by
    // withoutEnlargement. Keep the deck original on disk as the provenance
    // copy; if a true high-resolution export is ever delivered, point this
    // `in:` at that and re-run.
    { in: 'mikasa-hero-upscaled.png', out: 'hero-forest.jpg', width: 2560, format: 'jpeg', quality: 84 },
    { in: 'mikasa-photo-02.png', out: 'location-map.jpg', width: 2000, format: 'jpeg', quality: 86 },
    { in: 'mikasa-photo-03.png', out: 'approach-lane.jpg', width: 1800, format: 'jpeg', quality: 84 },
    { in: 'mikasa-photo-04.png', out: 'site-survey.png', width: 2000, format: 'palette', colours: 128 },

    // --- Social share card -------------------------------------------------
    // 1200x630 because that is the ratio every platform crops to. Handing them
    // the raw hero (2560x1700, a 1.5:1 frame) meant each one cropped it
    // differently and none of them the way we would: Facebook and LinkedIn take
    // a 1.91:1 band, so the sky and the foreground both went. Cropping it here
    // means the frame that gets shared is the frame we chose.
    //
    // Size matters as much as shape. The hero is 545 KB, and several of the
    // messengers this listing will actually travel through — LINE and WeChat
    // above all — are unreliable about fetching a preview that large over a
    // mobile connection. This lands around a tenth of it.
    { in: 'mikasa-hero-upscaled.png', out: 'og-cover.jpg', width: 1200, height: 630, format: 'jpeg', quality: 82 },

    // --- Deck p.4 concept renders ------------------------------------------
    // The single-storey pavilion scheme. This is the design the site shows.
    { in: 'mikasa-photo-05.png', out: 'villa-aerial.jpg', width: 2560, format: 'jpeg', quality: 84 },
    { in: 'mikasa-photo-08.png', out: 'villa-exterior.jpg', width: 1600, format: 'jpeg', quality: 86 },
    { in: 'mikasa-photo-06.png', out: 'villa-bathroom.jpg', width: 1600, format: 'jpeg', quality: 86 },
    { in: 'mikasa-photo-07.png', out: 'villa-bedroom.jpg', width: 1600, format: 'jpeg', quality: 86 },

    // NOT BUILT — `01.jpg` / `02.jpg` are 4300 px renders of a DIFFERENT,
    // two-storey scheme, matching the Realize Co. drawings dated 2026.03.31–
    // 04.03. They are kept in src/assets/images/ in case the offering ever
    // switches to that design, but they are not the house this site sells and
    // must not be mixed with the four above. See Concept.astro.
];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

/**
 * Raster icons, rendered from public/favicon.svg.
 *
 * The SVG alone is not enough. It is the best favicon a modern browser can
 * have — one file, sharp at any size — but Safari's pinned tabs, older Android
 * browsers and, most importantly, the iOS "Add to Home Screen" flow all want a
 * PNG, and iOS will not take an SVG at all. An agent who saves this listing to
 * a phone home screen currently gets a blank tile.
 *
 * 180px is the size iOS asks for and downscales from. 32px is the classic
 * favicon slot. Both are drawn from the vector, so they stay in step with it.
 */
const ICONS = [
    { size: 32, out: 'favicon-32.png' },
    { size: 180, out: 'apple-touch-icon.png' },
];

async function buildIcons() {
    const src = path.join(ROOT, 'public/favicon.svg');
    if (!existsSync(src)) {
        console.warn('  skip   icons                      (no public/favicon.svg)');
        return;
    }
    for (const icon of ICONS) {
        const outPath = path.join(ROOT, 'public', icon.out);
        // density lifts the rasteriser's sampling rate before it draws, so the
        // 1.35px strokes in the mark stay clean at 180px instead of being
        // rendered at 32 and scaled up.
        await sharp(src, { density: 384 })
            .resize(icon.size, icon.size)
            .png({ compressionLevel: 9 })
            .toFile(outPath);
        const after = (await stat(outPath)).size;
        console.log(`  ok     ${icon.out.padEnd(26)} ${String(icon.size).padStart(4)}×${String(icon.size).padEnd(4)}  ${kb(after).padStart(19)}`);
    }
}

async function run() {
    if (!existsSync(SRC)) {
        console.error(`No source directory at ${SRC}`);
        process.exit(1);
    }
    await mkdir(OUT, { recursive: true });

    const available = new Set(await readdir(SRC));
    let totalIn = 0;
    let totalOut = 0;
    let missing = 0;

    for (const job of JOBS) {
        if (!available.has(job.in)) {
            console.warn(`  skip   ${job.out.padEnd(26)} (no ${job.in})`);
            missing++;
            continue;
        }

        const inPath = path.join(SRC, job.in);
        const outPath = path.join(OUT, job.out);

        const image = sharp(inPath, { limitInputPixels: false });
        const meta = await image.metadata();

        // Two sizing modes.
        //
        // Default: `width` is a MAXIMUM and the aspect ratio is kept, with
        // withoutEnlargement so a small original stays at its native size
        // instead of having pixels invented for it.
        //
        // `job.height`: an exact box, cropped to fill. Only the share image
        // uses this, because a social card has a ratio the platforms enforce
        // and being the right shape matters more than keeping the original's.
        let pipeline = job.height
            ? image.resize({
                  width: job.width,
                  height: job.height,
                  fit: 'cover',
                  position: job.position ?? 'centre',
              })
            : image.resize({
                  width: job.width,
                  withoutEnlargement: true,
                  fit: 'inside',
              });

        if (job.format === 'jpeg') {
            // mozjpeg buys roughly 10% at identical visual quality.
            // 4:2:0 chroma is right for photographs and renders — the eye has
            // far less colour resolution than luminance resolution. (4:4:4
            // would only be worth the bytes for images carrying fine coloured
            // text or line work, and those go down the palette path instead.)
            pipeline = pipeline.jpeg({ quality: job.quality, mozjpeg: true, chromaSubsampling: '4:2:0' });
        } else if (job.format === 'palette') {
            pipeline = pipeline.png({ palette: true, colours: job.colours, effort: 9 });
        }

        // EXIF is stripped by default, which also drops any GPS coordinates a
        // camera may have written — relevant for a private-sale listing.
        await pipeline.toFile(outPath);

        const before = (await stat(inPath)).size;
        const after = (await stat(outPath)).size;
        totalIn += before;
        totalOut += after;

        const outMeta = await sharp(outPath).metadata();
        const note = meta.width < job.width ? `  ← original only ${meta.width}px wide` : '';

        console.log(
            `  ok     ${job.out.padEnd(26)} ${String(outMeta.width).padStart(4)}×${String(outMeta.height).padEnd(4)}  ` +
                `${kb(before).padStart(8)} → ${kb(after).padStart(8)}${note}`
        );
    }

    await buildIcons();

    console.log(
        `\n  ${JOBS.length - missing}/${JOBS.length} written  ${kb(totalIn)} → ${kb(totalOut)} ` +
            `(${(100 - (totalOut / totalIn) * 100).toFixed(0)}% smaller)`
    );

    if (missing) {
        console.log(`  ${missing} missing — see public/images/ASSETS.md`);
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
