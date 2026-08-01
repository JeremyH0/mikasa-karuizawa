// Sitemap, generated at build time from the locale registry.
//
// Written as an endpoint rather than a static public/sitemap.xml so it can
// never drift: change the published `locales` and this follows automatically.
// That matters more than usual on a multilingual site, because the sitemap is
// where the xhtml:link hreflang alternates are declared — a hand-maintained
// file would silently ship a stale set the first time someone forgot.
//
// It also means an English-only build emits an English-only sitemap, with no
// alternates pointing at pages that were never generated.
import type { APIRoute } from 'astro';
import { locales, defaultLocale, localeHref } from '../i18n';

export const GET: APIRoute = ({ site }) => {
    if (!site) {
        throw new Error(
            'sitemap.xml needs `site` set in astro.config.mjs to build absolute URLs.'
        );
    }

    const abs = (path: string) => new URL(path, site).href;

    // Every locale points at the same set of alternates, including itself —
    // that self-reference is required by the spec, not an oversight. Skipped
    // entirely on a single-locale build, where alternates are meaningless.
    const alternates =
        locales.length > 1
            ? locales
                  .map(
                      (l) =>
                          `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(localeHref(l))}"/>`
                  )
                  .join('\n')
            : '';

    const urls = locales
        .map((locale) =>
            [
                '  <url>',
                `    <loc>${abs(localeHref(locale))}</loc>`,
                ...(alternates ? [alternates] : []),
                ...(locales.length > 1
                    ? [
                          `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(localeHref(defaultLocale))}"/>`,
                      ]
                    : []),
                '    <changefreq>monthly</changefreq>',
                // The English page is the source of truth and the entry point.
                `    <priority>${locale === defaultLocale ? '1.0' : '0.9'}</priority>`,
                '  </url>',
            ].join('\n')
        )
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

    return new Response(xml, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
};
