/** Public, non-secret destinations shared by Gurudevi app surfaces. */
function configuredUrl(name: string, fallback: string): string {
  const value = (typeof process !== 'undefined' && process.env?.[name]) || fallback;
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:') throw new Error(`${name} must use https://`);
  return parsed.toString().replace(/\/$/, '');
}

export const GURUDEVI_WEB = configuredUrl(
  'EXPO_PUBLIC_GURUDEVI_MARKETING_URL',
  'https://gurudevi.app',
);
export const GURUDEVI_APP = configuredUrl(
  'EXPO_PUBLIC_GURUDEVI_APP_URL',
  'https://gurudevi.app',
);
export const GURUDEVI_SUPPORT_EMAIL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_SUPPORT_EMAIL) ||
  'support@gurudevi.lk';

export const EXTERNAL_URLS = {
  privacy: `${GURUDEVI_WEB}/privacy`,
  terms: `${GURUDEVI_WEB}/terms`,
  guidelines: `${GURUDEVI_WEB}/faq#community-boundaries`,
  support: `${GURUDEVI_WEB}/support`,
  deleteAccount: `${GURUDEVI_WEB}/delete-account`,
} as const;
