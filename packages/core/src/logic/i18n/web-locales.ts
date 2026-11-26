export type SupportedLocale = 'en' | 'si' | 'ta';

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'si', 'ta'] as const;

export const LOCALE_COOKIE_NAME = 'gd_locale';
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export interface LanguageMeta {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  shortLabel: string;
}

export const LANGUAGES: readonly LanguageMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල', shortLabel: 'සි' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', shortLabel: 'த' },
] as const;

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
