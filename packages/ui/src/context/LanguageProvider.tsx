import { storage } from '@repo/core/lib/storage';
import i18n from 'i18next';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Language } from './types';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const LANGUAGE_KEY = '@gurudevi/language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    async function loadLanguage() {
      try {
        const lang = await storage.getStringAsync(LANGUAGE_KEY);
        if (lang) {
          setLanguageState(lang as Language);
          i18n.changeLanguage(lang);
        }
      } catch (e) {
        console.warn('[LanguageProvider] Load error:', e);
      }
    }
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      storage.set(LANGUAGE_KEY, lang);
      await i18n.changeLanguage(lang);
    } catch (e) {
      console.warn('[LanguageProvider] Save error:', e);
    }
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

const DEFAULT_LANGUAGE_VALUE: LanguageContextValue = {
  language: 'en',
  setLanguage: async () => {},
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

export function useLanguageOptional(): LanguageContextValue {
  return useContext(LanguageContext) ?? DEFAULT_LANGUAGE_VALUE;
}
