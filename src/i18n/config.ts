// Locale registry — the single source of truth for which languages exist,
// where they live, and how they are labelled.
//
// Internal codes are BCP-47 so they can be used directly for <html lang> and
// hreflang. URL segments are kept separate so the marketing-facing paths can
// change without touching the language codes search engines consume.
//
// Mirrors the registry in hc-property (thekaruizawaestate.com) on purpose —
// same shape, same helper names, so anyone moving between the two Hirafu
// Capital property sites is reading the same file twice.

/**
 * Every locale the codebase has a dictionary for. This is the TYPE source —
 * it does not decide what gets built.
 */
const allLocales = ['en', 'ja', 'zh-Hans', 'zh-Hant'] as const;
export type Locale = (typeof allLocales)[number];

/**
 * The locales that are actually built, linked, and indexed. ← THE ONE SWITCH.
 *
 *   English-only launch:  export const locales: readonly Locale[] = ['en'];
 *   Full four-language:   export const locales: readonly Locale[] = allLocales;
 *
 * Everything downstream reads this array and nothing else — getStaticPaths,
 * the sitemap, the hreflang alternates, and the language switcher. Flipping
 * this line adds or removes three languages across the whole site at once.
 *
 * The ja / zh-Hans / zh-Hant dictionaries stay on disk either way. They are
 * simply not rendered, so an English-only build ships no half-translated page
 * and no hreflang pointing at a URL that does not exist. Freeze the English
 * copy first, then flip this back to `allLocales`.
 */
export const locales: readonly Locale[] = ['en'];

export const defaultLocale: Locale = 'en';

/** URL segment for each locale. The default locale sits at the root. */
export const localePath: Record<Locale, string> = {
    en: '',
    ja: 'jp',
    'zh-Hans': 'zh',
    'zh-Hant': 'zh-hant',
};

/** Name shown in the desktop dropdown, always written in its own language. */
export const localeName: Record<Locale, string> = {
    en: 'English',
    ja: '日本語',
    'zh-Hans': '简体中文',
    'zh-Hant': '繁體中文',
};

/** Compact label for the mobile menu and the current-language indicator. */
export const localeShort: Record<Locale, string> = {
    en: 'EN',
    ja: 'JP',
    'zh-Hans': '简',
    'zh-Hant': '繁',
};

/**
 * Which Noto family supplies the CJK glyphs. Latin still resolves from
 * Cormorant/Jakarta, so only CJK codepoints fall through — see global.css.
 */
export const cjkFonts: Partial<Record<Locale, { serif: string; sans: string }>> = {
    ja: { serif: 'Noto Serif JP', sans: 'Noto Sans JP' },
    'zh-Hans': { serif: 'Noto Serif SC', sans: 'Noto Sans SC' },
    'zh-Hant': { serif: 'Noto Serif TC', sans: 'Noto Sans TC' },
};

/**
 * Browser `navigator.language` prefixes mapped onto our locales, used by the
 * first-visit language suggestion in Navigation.astro.
 *
 * Order matters: the longest, most specific prefix has to be tested first, or
 * `zh-TW` would match the bare `zh` entry and send a Taiwanese visitor to the
 * Simplified page. The lookup helper walks this array in order.
 */
const languageHints: ReadonlyArray<readonly [string, Locale]> = [
    ['zh-hant', 'zh-Hant'],
    ['zh-tw', 'zh-Hant'],
    ['zh-hk', 'zh-Hant'],
    ['zh-mo', 'zh-Hant'],
    ['zh-hans', 'zh-Hans'],
    ['zh-cn', 'zh-Hans'],
    ['zh-sg', 'zh-Hans'],
    ['zh', 'zh-Hans'],
    ['ja', 'ja'],
    ['en', 'en'],
];

/** Best-effort locale for a `navigator.language` string. Null when unknown. */
export function localeFromNavigator(tag: string | undefined): Locale | null {
    const lower = (tag ?? '').toLowerCase();
    if (!lower) return null;
    for (const [prefix, locale] of languageHints) {
        if (lower.startsWith(prefix)) return locale;
    }
    return null;
}

/** Absolute site path for a locale, always with a trailing slash. */
export function localeHref(locale: Locale): string {
    const segment = localePath[locale];
    return segment ? `/${segment}/` : '/';
}

/** Resolve a built URL segment back to its locale. */
export function localeFromPath(segment: string | undefined): Locale {
    const clean = (segment ?? '').replace(/^\/|\/$/g, '');
    return locales.find((l) => localePath[l] === clean) ?? defaultLocale;
}

/** Fill {name} placeholders in a dictionary string. */
export function fmt(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) =>
        key in values ? String(values[key]) : match
    );
}
