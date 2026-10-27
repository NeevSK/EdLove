import { useStorageString } from '@repo/core/hooks/useStorageString';
import {
  DEVICE_THEME_MODE_KEY,
  ensureDeviceThemePreference,
  isDeviceThemeMode,
} from '@repo/core/lib/devicePreferences';
import { storage } from '@repo/core/lib/storage';

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
import { DEFAULT_WORLD, isWorldId } from '../world/worlds';
import type { WorldId } from '../world/types';
import type { TemporalPhase, ThemeMode } from './types';
import { getTemporalPhase, shouldUseDarkTheme } from './utils';

interface ThemeContextValue {
  themeMode: ThemeMode;
  temporalPhase: TemporalPhase;
  isDark: boolean;
  isVeilActive: boolean;
  enableLivingTheme: boolean;
  /** The world that dresses every component (see packages/ui/src/world). */
  worldId: WorldId;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleVeil: () => Promise<void>;
  setEnableLivingTheme: (enabled: boolean) => Promise<void>;
  setWorld: (world: WorldId) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  IS_VEIL_ACTIVE: '@gurudevi/is_veil_active',
  ENABLE_LIVING_THEME: '@gurudevi/enable_living_theme',
  WORLD: '@gurudevi/world',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const savedThemeMode = useStorageString(DEVICE_THEME_MODE_KEY);
  const savedVeil = useStorageString(STORAGE_KEYS.IS_VEIL_ACTIVE);
  const savedLivingTheme = useStorageString(STORAGE_KEYS.ENABLE_LIVING_THEME);
  const savedWorld = useStorageString(STORAGE_KEYS.WORLD);
  const themeMode = isDeviceThemeMode(savedThemeMode) ? savedThemeMode : 'system';
  const isVeilActive = savedVeil === 'true';
  const enableLivingTheme = savedLivingTheme !== 'false';
  const worldId = isWorldId(savedWorld) ? savedWorld : DEFAULT_WORLD;
  const [temporalPhase, setTemporalPhase] = useState<TemporalPhase>(() => getTemporalPhase());
  const systemColorScheme = useColorScheme();

  // Derived
  const isDark = useMemo(
    () =>
      themeMode === 'dark' ||
      (themeMode === 'system' && systemColorScheme === 'dark') ||
      (themeMode === 'auto' && shouldUseDarkTheme(temporalPhase)),
    [themeMode, systemColorScheme, temporalPhase],
  );

  useEffect(() => {
    void ensureDeviceThemePreference().catch((error: unknown) => {
      console.error('[ThemeProvider] Preference migration failed', error);
    });
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
    async (
      mode: ThemeMode,
      transitionType?: import('../theme/nitroThemeTransition.types').ThemeTransitionType,
    ) => {
      const applyChange = async () => {
        await storage.setAsync(DEVICE_THEME_MODE_KEY, mode);
        if (mode === 'auto') setTemporalPhase(getTemporalPhase());
      };

      const { startThemeTransition } = await import('../theme/nitroThemeTransition');
      await startThemeTransition(applyChange, { type: transitionType || 'circularReveal' });
    },
    [],
  );

  const toggleVeil = useCallback(async () => {
    await storage.setAsync(STORAGE_KEYS.IS_VEIL_ACTIVE, String(!isVeilActive));
  }, [isVeilActive]);

  const setEnableLivingTheme = useCallback(async (enabled: boolean) => {
    await storage.setAsync(STORAGE_KEYS.ENABLE_LIVING_THEME, String(enabled));
  }, []);

  const setWorld = useCallback(async (world: WorldId) => {
    if (!isWorldId(world)) throw new Error('Unknown theme world.');
    await storage.setAsync(STORAGE_KEYS.WORLD, world);
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      temporalPhase,
      isDark,
      isVeilActive,
      enableLivingTheme,
      worldId,
      setThemeMode,
      toggleVeil,
      setEnableLivingTheme,
      setWorld,
    }),
    [
      themeMode,
      temporalPhase,
      isDark,
      isVeilActive,
      enableLivingTheme,
      worldId,
      setThemeMode,
      toggleVeil,
      setEnableLivingTheme,
      setWorld,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

const DEFAULT_THEME_VALUE: ThemeContextValue = {
  themeMode: 'system',
  temporalPhase: 'dawn',
  isDark: false,
  isVeilActive: false,
  enableLivingTheme: true,
  worldId: DEFAULT_WORLD,
  setThemeMode: async () => {},
  toggleVeil: async () => {},
  setEnableLivingTheme: async () => {},
  setWorld: async () => {},
};

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within a ThemeProvider');
  return context;
}

export function useThemeContextOptional(): ThemeContextValue {
  return useContext(ThemeContext) ?? DEFAULT_THEME_VALUE;
}
