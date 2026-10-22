import { storage } from '@repo/core/lib/storage';
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
  const themeMode = useStore((state: any) => state.themeMode ?? state.theme ?? 'system');
  const setStoredThemeMode = useStore((state: any) => state.setTheme ?? state.setThemeMode);

  const [temporalPhase, setTemporalPhase] = useState<TemporalPhase>(() => getTemporalPhase());
  const [isVeilActive, setIsVeilActive] = useState(false);
  const [enableLivingTheme, setEnableLivingThemeState] = useState<boolean>(true);
  // Read synchronously so a chosen world paints on the first frame, with no flash of Sanctuary.
  const [worldId, setWorldState] = useState<WorldId>(() => {
    try {
      const saved = storage.getString?.(STORAGE_KEYS.WORLD);
      return isWorldId(saved) ? saved : DEFAULT_WORLD;
    } catch {
      return DEFAULT_WORLD;
    }
  });
  const systemColorScheme = useColorScheme();

  // Derived
  const isDark = useMemo(
    () =>
      themeMode === 'dark' ||
      (themeMode === 'system' && systemColorScheme === 'dark') ||
      (themeMode === 'auto' && shouldUseDarkTheme(temporalPhase)),
    [themeMode, systemColorScheme, temporalPhase],
  );

  // Load Persisted
  useEffect(() => {
    async function loadThemeSettings() {
      try {
        const [veil, living, world] = await Promise.all([
          storage.getStringAsync(STORAGE_KEYS.IS_VEIL_ACTIVE),
          storage.getStringAsync(STORAGE_KEYS.ENABLE_LIVING_THEME),
          storage.getStringAsync(STORAGE_KEYS.WORLD),
        ]);
        if (veil !== undefined) setIsVeilActive(veil === 'true');
        if (living !== undefined) setEnableLivingThemeState(living === 'true');
        if (isWorldId(world)) setWorldState(world);
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
    async (
      mode: ThemeMode,
      transitionType?: import('../theme/nitroThemeTransition.types').ThemeTransitionType,
    ) => {
      const applyChange = () => {
        if (typeof setStoredThemeMode === 'function') {
          setStoredThemeMode(mode);
        } else {
          console.warn('[ThemeProvider] setThemeMode store action is unavailable');
        }
        if (mode === 'auto') setTemporalPhase(getTemporalPhase());
      };

      const { startThemeTransition } = await import('../theme/nitroThemeTransition');
      await startThemeTransition(applyChange, { type: transitionType || 'circularReveal' });
    },
    [setStoredThemeMode],
  );

  const toggleVeil = useCallback(async () => {
    const newValue = !isVeilActive;
    setIsVeilActive(newValue);
    try {
      storage.set(STORAGE_KEYS.IS_VEIL_ACTIVE, String(newValue));
    } catch (e) {
      console.warn('[ThemeProvider] Veil error:', e);
    }
  }, [isVeilActive]);

  const setEnableLivingTheme = useCallback(async (enabled: boolean) => {
    setEnableLivingThemeState(enabled);
    try {
      storage.set(STORAGE_KEYS.ENABLE_LIVING_THEME, String(enabled));
    } catch (e) {
      console.warn('[ThemeProvider] Living error:', e);
    }
  }, []);

  const setWorld = useCallback(async (world: WorldId) => {
    if (!isWorldId(world)) return;
    setWorldState(world);
    try {
      storage.set(STORAGE_KEYS.WORLD, world);
    } catch (e) {
      console.warn('[ThemeProvider] World error:', e);
    }
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
