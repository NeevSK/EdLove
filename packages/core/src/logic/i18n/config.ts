import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
// Import translation files from local directory
import si from './locales/si.json';
import ta from './locales/ta.json';

// i18n configuration for Core
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['si', 'ta', 'en'],
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
}).catch((err) => {
  console.error('[i18n] Initialization failed:', err);
});

export default i18n;
