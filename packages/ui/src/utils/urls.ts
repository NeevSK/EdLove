/** Public, non-secret destinations shared by Gurudevi app surfaces. */
function configuredUrl(name: string, fallback: string): string {
  const value = (typeof process !== 'undefined' && process.env?.[name]) || fallback;
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:') throw new Error(`${name} must use https://`);
  return parsed.toString().replace(/\/$/, '');
}

export const GURUDEVI_MARKETING_URL = configuredUrl(
  'EXPO_PUBLIC_GURUDEVI_MARKETING_URL',
  'https://gurudevi.app',
);
export const GURUDEVI_WEB = GURUDEVI_MARKETING_URL;

export const GURUDEVI_APP = configuredUrl('EXPO_PUBLIC_GURUDEVI_APP_URL', 'https://gurudevi.app');

export const GURUDEVI_SANCTUARY_URL = configuredUrl(
  'EXPO_PUBLIC_GURUDEVI_SANCTUARY_URL',
  'https://sanctuary.gurudevi.app',
);

export const GURUDEVI_SUPPORT_EMAIL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_SUPPORT_EMAIL) ||
  'support@gurudevi.app';

export const GURUDEVI_GRATITUDE_EMAIL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_GRATITUDE_EMAIL) ||
  'gratitude@gurudevi.app';

export const GURUDEVI_INSTITUTIONAL_EMAIL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_INSTITUTIONAL_EMAIL) ||
  'institutional@gurudevi.app';

export const EXTERNAL_URLS = {
  marketing: GURUDEVI_MARKETING_URL,
  app: GURUDEVI_APP,
  sanctuary: GURUDEVI_SANCTUARY_URL,
  privacy: `${GURUDEVI_MARKETING_URL}/privacy`,
  terms: `${GURUDEVI_MARKETING_URL}/terms`,
  guidelines: `${GURUDEVI_MARKETING_URL}/faq#community-boundaries`,
  support: `${GURUDEVI_MARKETING_URL}/support`,
  deleteAccount: `${GURUDEVI_MARKETING_URL}/delete-account`,
  about: `${GURUDEVI_MARKETING_URL}/about`,
  faq: `${GURUDEVI_MARKETING_URL}/faq`,
  thuthimal: `${GURUDEVI_MARKETING_URL}/thuthimal`,
  journal: `${GURUDEVI_MARKETING_URL}/journal`,
} as const;
