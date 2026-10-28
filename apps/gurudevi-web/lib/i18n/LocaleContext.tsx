'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import { getTranslation } from './dictionaries';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
  type SupportedLocale,
} from './types';

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (nextLocale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isPending: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function writeLocaleCookie(locale: SupportedLocale) {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  try {
    localStorage.setItem(LOCALE_COOKIE_NAME, locale);
  } catch {
    // Ignore localStorage failures in restricted contexts
  }
}

export function LocaleProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: SupportedLocale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // If client has a stored preference in localStorage that differs from SSR cookie, sync it
    try {
      const stored = localStorage.getItem(LOCALE_COOKIE_NAME);
      if (stored && isSupportedLocale(stored) && stored !== locale) {
        setLocaleState(stored);
        document.documentElement.lang = stored;
        document.documentElement.dataset.locale = stored;
        writeLocaleCookie(stored);
      } else {
        document.documentElement.lang = locale;
        document.documentElement.dataset.locale = locale;
      }
    } catch {
      document.documentElement.lang = locale;
      document.documentElement.dataset.locale = locale;
    }
  }, [locale]);

  const setLocale = useCallback(
    (nextLocale: SupportedLocale) => {
      if (!isSupportedLocale(nextLocale)) return;
      startTransition(() => {
        setLocaleState(nextLocale);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = nextLocale;
          document.documentElement.dataset.locale = nextLocale;
          writeLocaleCookie(nextLocale);
          window.dispatchEvent(new CustomEvent('gd_locale_change', { detail: { locale: nextLocale } }));
        }
      });
    },
    [],
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslation(locale, key, params);
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, isPending }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) {
    // Graceful fallback if invoked outside of LocaleProvider
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: string, params?: Record<string, string | number>) =>
        getTranslation(DEFAULT_LOCALE, key, params),
      isPending: false,
    };
  }
  return context;
}
