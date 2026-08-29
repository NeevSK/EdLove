import { detectLanguageCode, SUPPORTED_LNGS } from '@repo/core/logic/i18n/language';
import en from '@repo/core/logic/i18n/locales/en.json';
// Import translation files from local directory
import si from '@repo/core/logic/i18n/locales/si.json';
import ta from '@repo/core/logic/i18n/locales/ta.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// i18n configuration for Core
if (!i18n.isInitialized && !i18n.isInitializing) {
  void i18n
    .use(initReactI18next)
    .init({
      lng: detectLanguageCode(),
      fallbackLng: 'en',
      supportedLngs: [...SUPPORTED_LNGS],
      resources: {
        si: { translation: si },
        ta: { translation: ta },
        en: { translation: en },
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      debug: false,
      defaultNS: 'translation',
      ns: ['translation'],
    })
    .catch((err) => {
      console.error('[i18n] Initialization failed:', err);
    });
}

export default i18n;
