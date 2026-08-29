/**
 * Device-language detection without a native dependency.
 *
 * Hermes ships Intl on both native and web, so the resolved locale tag of the
 * default formatter maps to the OS/device language without importing
 * expo-localization into packages that do not already depend on it.
 */

export const SUPPORTED_LNGS = ['si', 'ta', 'en'] as const;

export function detectLanguageCode(
  supported: readonly string[] = SUPPORTED_LNGS,
  fallback = 'en',
): string {
  let code: string | undefined;
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale;
    code = tag.split('-')[0];
  } catch {
    code = undefined;
  }
  return code && supported.includes(code) ? code : fallback;
}
