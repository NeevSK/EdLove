import i18n from '@/logic/i18n/config';
import type { IStorage } from '@/logic/ports/storage';

const LANGUAGE_STORAGE_KEY = 'gurudevi-user-language';

let _storage: IStorage | null = null;

/**
 * LanguageUtils
 *
 * Handles persistent language selection and i18n helper functions.
 */
export const LanguageUtils = {
  /**
   * Inject storage implementation.
   * Usually called in a native provider or top-level bridge.
   */
  setStorage(storage: IStorage) {
    _storage = storage;
  },

  /**
   * Initializes the app language from persistent storage.
   */
  async init() {
    if (!_storage) {
      console.warn('[LanguageUtils] No storage implementation injected. Skipping initialization.');
      return;
    }

    try {
      const savedLanguage = await _storage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('[LanguageUtils] Failed to load language:', error);
    }
  },

  /**
   * Changes the app language and persists it.
   */
  async setLanguage(lang: 'en' | 'si' | 'ta') {
    try {
      await i18n.changeLanguage(lang);
      if (_storage) {
        await _storage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }
    } catch (error) {
      console.error('[LanguageUtils] Failed to save language:', error);
    }
  },

  /**
   * Returns the current language code.
   */
  getCurrentLanguage() {
    return i18n.language;
  },

  /**
   * Helper to detect if a translation key is missing in the current language.
   */
  isKeyMissing(key: string) {
    return !i18n.exists(key);
  },

  /**
   * Returns the language name in its native script.
   */
  getNativeName(lang: string) {
    switch (lang) {
      case 'si':
        return '\u0DC3\u0DD2\u0D82\u0DC4\u0DBD';
      case 'ta':
        return '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD';
      case 'en':
        return 'English';
      default:
        return lang;
    }
  },
};
