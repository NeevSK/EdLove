import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
// Import translation files
import si from "./locales/si.json";
import ta from "./locales/ta.json";

// i18n configuration
i18n
	.use(initReactI18next) // Pass i18n down to react-i18next
	.init({
		// Default language (English for dev)
		lng: "en",

		// Fallback language if translation missing.
		// Keep runtime fallbacks in i18n config + locale files (never inline t('key', 'default')).
		fallbackLng: "en",

		// Available languages
		supportedLngs: ["si", "ta", "en"],

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
		defaultNS: "translation",
		ns: ["translation"],
	});

export default i18n;
