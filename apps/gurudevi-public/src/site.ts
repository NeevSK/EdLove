import { getTranslation } from '@repo/core/logic/i18n/web-dictionaries';
import { LANGUAGES, type SupportedLocale } from '@repo/core/logic/i18n/web-locales';

export { LANGUAGES, type SupportedLocale };

/** Every locale gets its own URL, so search engines and agents index all three languages. */
export function localePath(locale: SupportedLocale, path = '/'): string {
  const clean = path === '/' ? '' : path;
  return locale === 'en' ? path : `/${locale}${clean}`;
}

/** Translation bound to one locale, resolved while the page is built. */
export function translator(locale: SupportedLocale) {
  const t = (key: string, fallbackOrParams?: string | Record<string, string | number>): string => {
    const params = typeof fallbackOrParams === 'object' ? fallbackOrParams : undefined;
    const value = getTranslation(locale, key, params);
    // getTranslation answers a missing key with the key itself.
    return value === key && typeof fallbackOrParams === 'string' ? fallbackOrParams : value;
  };
  return t;
}

/**
 * The app surfaces. A static page has no request host to inspect, so the hosts come from the
 * build environment; production values are the defaults.
 */
const EXPLORE = import.meta.env.PUBLIC_EXPLORE_ORIGIN ?? 'https://explore.gurudevi.app';
const SANCTUARY = import.meta.env.PUBLIC_SANCTUARY_ORIGIN ?? 'https://sanctuary.gurudevi.app';

export function surfaceUrl(surface: 'explore' | 'sanctuary', path: string): string {
  return `${surface === 'explore' ? EXPLORE : SANCTUARY}${path}`;
}
