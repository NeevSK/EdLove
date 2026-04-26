import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { Language } from '../types';

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
        const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
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
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      await i18n.changeLanguage(lang);
    } catch (e) {
      console.warn('[LanguageProvider] Save error:', e);
    }
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
