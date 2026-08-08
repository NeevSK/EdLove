/** Canonical public destinations used by core deep-link and QR contracts. */
export const GURUDEVI_PLATFORM_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GURUDEVI_APP_URL) ||
  'https://platform.gurudevi.edlove.org';

export const GURUDEVI_QR_URL = `${GURUDEVI_PLATFORM_URL}/qr`;
