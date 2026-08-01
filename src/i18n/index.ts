// Public entry point for the i18n layer.
//
//   import { useTranslations, type Locale } from '../i18n';
//   const t = useTranslations(locale);
//   t.overview.eyebrow

import en, { type Dict } from './en';
import ja from './ja';
import zhHans from './zh-Hans';
import zhHant from './zh-Hant';
import { type Locale } from './config';

const dictionaries: Record<Locale, Dict> = {
    en,
    ja,
    'zh-Hans': zhHans,
    'zh-Hant': zhHant,
};

export function useTranslations(locale: Locale): Dict {
    return dictionaries[locale] ?? en;
}

export type { Dict, Locale };
export {
    locales,
    defaultLocale,
    localePath,
    localeName,
    localeShort,
    cjkFonts,
    localeHref,
    localeFromPath,
    localeFromNavigator,
    fmt,
} from './config';
