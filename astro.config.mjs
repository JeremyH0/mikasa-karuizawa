// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    // TODO: replace once the production domain is registered. `site` must be
    // set for canonical URLs, hreflang alternates and sitemap.xml to build
    // absolute links — the sitemap endpoint throws without it.
    site: 'https://mikasa-karuizawa.com',

    // Lets a subpath deploy (e.g. /staging) generate correct asset and link
    // paths without hardcoding a value that has to be reverted for prod.
    // Set via BASE_PATH in .env.deploy; defaults to root for prod/local.
    base: process.env.BASE_PATH || '/',

    vite: {
        plugins: [tailwindcss()]
    }
});
