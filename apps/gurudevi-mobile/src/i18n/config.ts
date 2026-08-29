import { SUPPORTED_LNGS } from '@repo/core/logic/i18n/language';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en.json';
// Import translation files
import si from '@/i18n/locales/si.json';
import ta from '@/i18n/locales/ta.json';

function deviceLanguage(): string {
  const code = getLocales()[0]?.languageCode;
  return code && SUPPORTED_LNGS.includes(code) ? code : 'en';
}

// i18n configuration
if (!i18n.isInitialized && !i18n.isInitializing) {
  void i18n
    .use(initReactI18next) // Pass i18n down to react-i18next
    .init({
      // Detect from device (Sinhala/Tamil/English); English if unsupported.
      lng: deviceLanguage(),

      // Fallback language if translation missing.
      // Keep runtime fallbacks in i18n config + locale files (never inline t-key, default).
      fallbackLng: 'en',

      // Available languages
      supportedLngs: SUPPORTED_LNGS,

      // Resources (translation files)
      resources: {
        si: { translation: si },
        ta: { translation: ta },
        en: { translation: en },
      },

      // Interpolation settings
      interpolation: {
        escapeValue: false, // React already escapes values
      },

      // React specific settings
      react: {
        useSuspense: false, //  Don't use suspense in React Native
      },

      // Debugging (set to true during development)
      debug: __DEV__,

      // Namespace
      defaultNS: 'translation',
      ns: ['translation'],
    });
}

export default i18n;
