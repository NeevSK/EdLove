export const GURUDEVI_MARKETING_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_MARKETING_URL) ||
  'https://gurudevi.app';

export const GURUDEVI_PLATFORM_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_APP_URL) ||
  'https://gurudevi.app';

export const GURUDEVI_APP = GURUDEVI_PLATFORM_URL;

export const GURUDEVI_SANCTUARY_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_SANCTUARY_URL) ||
  'https://sanctuary.gurudevi.app';

export const GURUDEVI_EXPLORE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_EXPLORE_URL) ||
  'https://explore.gurudevi.app';

export const GURUDEVI_QR_URL = `${GURUDEVI_PLATFORM_URL}/qr`;

export const GURUDEVI_SUPPORT_EMAIL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_SUPPORT_EMAIL) ||
  'support@gurudevi.app';

export const GURUDEVI_GRATITUDE_EMAIL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_GRATITUDE_EMAIL) ||
  'gratitude@gurudevi.app';

export const GURUDEVI_INSTITUTIONAL_EMAIL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_INSTITUTIONAL_EMAIL) ||
  'institutional@gurudevi.app';
