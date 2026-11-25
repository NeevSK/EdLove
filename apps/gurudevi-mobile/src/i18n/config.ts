import { SUPPORTED_LNGS } from '@repo/core/logic/i18n/language';
import { getLocales } from 'expo-localization';
import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en.json';

function deviceLanguage(): string {
  const code = getLocales()[0]?.languageCode;
  return code && SUPPORTED_LNGS.includes(code as (typeof SUPPORTED_LNGS)[number]) ? code : 'en';
}

/**
 * Loads non-English locale bundles on demand so cold boot only parses English
 * plus the device's active language instead of all three locale JSON catalogs.
 */
function loadLocaleBundle(lng: string): Record<string, unknown> | null {
  switch (lng) {
    case 'si':
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('@/i18n/locales/si.json') as Record<string, unknown>;
    case 'ta':
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('@/i18n/locales/ta.json') as Record<string, unknown>;
    default:
      return null;
  }
}

function buildInitialResources(initialLng: string): Resource {
  const resources: Resource = {
    en: { translation: en },
  };
  if (initialLng !== 'en') {
    const activeBundle = loadLocaleBundle(initialLng);
    if (activeBundle) {
      resources[initialLng] = { translation: activeBundle };
    }
  }
  return resources;
}

// i18n configuration
if (!i18n.isInitialized && !i18n.isInitializing) {
  const initialLng = deviceLanguage();

  i18n.on('languageChanged', (nextLng: string) => {
    if (i18n.hasResourceBundle(nextLng, 'translation')) return;
    const bundle = loadLocaleBundle(nextLng);
    if (bundle) {
      i18n.addResourceBundle(nextLng, 'translation', bundle, true, true);
    }
  });

  void i18n
    .use(initReactI18next) // Pass i18n down to react-i18next
    .init({
      // Detect from device (Sinhala/Tamil/English); English if unsupported.
      lng: initialLng,

      // Fallback language if translation missing.
      // Keep runtime fallbacks in i18n config + locale files (never inline t-key, default).
      fallbackLng: 'en',

      // Available languages
      supportedLngs: SUPPORTED_LNGS,

      // Resources (English fallback + active device locale only; others load on switch)
      resources: buildInitialResources(initialLng),

      // Interpolation settings
      interpolation: {
        escapeValue: false, // React already escapes values
      },

      // React specific settings
      react: {
        useSuspense: false, //  Don't use suspense in React Native
      },

      // The complete locale catalogue is large. Emitting it in development
      // serialises every translation through Logcat during bootstrap without
      // adding user-facing diagnostic value.
      debug: false,

      // Namespace
      defaultNS: 'translation',
      ns: ['translation'],
    });
}

export default i18n;
