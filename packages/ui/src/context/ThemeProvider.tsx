import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '@repo/core/logic';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import type { TemporalPhase, ThemeMode } from './types';
import { getTemporalPhase, shouldUseDarkTheme } from './utils';

interface ThemeContextValue {
  themeMode: ThemeMode;
  temporalPhase: TemporalPhase;
  isDark: boolean;
  isVeilActive: boolean;
  enableLivingTheme: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleVeil: () => Promise<void>;
  setEnableLivingTheme: (enabled: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  IS_VEIL_ACTIVE: '@gurudevi/is_veil_active',
  ENABLE_LIVING_THEME: '@gurudevi/enable_living_theme',
};

const ENABLE_EXPERIMENTAL_DARK_MODE = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeMode = useStore((state: any) => state.themeMode ?? state.theme ?? 'system');
  const setStoredThemeMode = useStore((state: any) => state.setTheme ?? state.setThemeMode);

  const [temporalPhase, setTemporalPhase] = useState<TemporalPhase>(() => getTemporalPhase());
  const [isVeilActive, setIsVeilActive] = useState(false);
  const [enableLivingTheme, setEnableLivingThemeState] = useState<boolean>(true);
  const systemColorScheme = useColorScheme();

  // Derived
  const isDark = useMemo(
    () =>
      ENABLE_EXPERIMENTAL_DARK_MODE &&
      (themeMode === 'dark' ||
        (themeMode === 'system' && systemColorScheme === 'dark') ||
        (themeMode === 'auto' && shouldUseDarkTheme(temporalPhase))),
    [themeMode, systemColorScheme, temporalPhase],
  );

  // Load Persisted
  useEffect(() => {
    async function loadThemeSettings() {
      try {
        const [veil, living] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.IS_VEIL_ACTIVE),
          AsyncStorage.getItem(STORAGE_KEYS.ENABLE_LIVING_THEME),
        ]);
        if (veil) setIsVeilActive(veil === 'true');
        if (living !== null) setEnableLivingThemeState(living === 'true');
      } catch (e) {
        console.warn('[ThemeProvider] Load error:', e);
      }
    }
    loadThemeSettings();
  }, []);

  // Temporal Sync
  useEffect(() => {
    const update = () => {
      const next = getTemporalPhase();
      setTemporalPhase((prev) => (prev !== next ? next : prev));
    };
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      if (typeof setStoredThemeMode === 'function') {
        setStoredThemeMode(mode);
      } else {
        console.warn('[ThemeProvider] setThemeMode store action is unavailable');
      }
      if (mode === 'auto') setTemporalPhase(getTemporalPhase());
    },
    [setStoredThemeMode],
  );

  const toggleVeil = useCallback(async () => {
    const newValue = !isVeilActive;
    setIsVeilActive(newValue);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_VEIL_ACTIVE, String(newValue));
    } catch (e) {
      console.warn('[ThemeProvider] Veil error:', e);
    }
  }, [isVeilActive]);

  const setEnableLivingTheme = useCallback(async (enabled: boolean) => {
    setEnableLivingThemeState(enabled);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ENABLE_LIVING_THEME, String(enabled));
    } catch (e) {
      console.warn('[ThemeProvider] Living error:', e);
    }
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      temporalPhase,
      isDark,
      isVeilActive,
      enableLivingTheme,
      setThemeMode,
      toggleVeil,
      setEnableLivingTheme,
    }),
    [
      themeMode,
      temporalPhase,
      isDark,
      isVeilActive,
      enableLivingTheme,
      setThemeMode,
      toggleVeil,
      setEnableLivingTheme,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within a ThemeProvider');
  return context;
}
