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
    { in: 'mikasa-photo-01.png', out: 'hero-forest.jpg', width: 2560, format: 'jpeg', quality: 84 },
    { in: 'mikasa-photo-02.png', out: 'location-map.jpg', width: 2000, format: 'jpeg', quality: 86 },
    { in: 'mikasa-photo-03.png', out: 'approach-lane.jpg', width: 1800, format: 'jpeg', quality: 84 },
    { in: 'mikasa-photo-04.png', out: 'site-survey.png', width: 2000, format: 'palette', colours: 128 },

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

        // withoutEnlargement keeps a small original at its native size instead
        // of inventing pixels that were never captured.
        let pipeline = image.resize({
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
