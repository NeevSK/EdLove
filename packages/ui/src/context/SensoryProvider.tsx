import { storage } from '@repo/core/lib/storage';
import { setHapticsEnabled } from '@repo/ui/utils/haptics';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { SensoryPreferences } from './experiencePolicy';

export type SensoryPreferenceKey = keyof Required<SensoryPreferences>;

export interface SensoryContextValue {
  preferences: Required<SensoryPreferences>;
  setPreference: (key: SensoryPreferenceKey, value: boolean) => Promise<void>;
}

const DEFAULT_PREFERENCES: Required<SensoryPreferences> = {
  hapticsEnabled: true,
  soundEnabled: false,
  quietMode: false,
};

const SENSORY_KEY = '@gurudevi/sensory_preferences';
const SensoryContext = createContext<SensoryContextValue | undefined>(undefined);

function readPreferences(value: string | null): Required<SensoryPreferences> {
  if (!value) return DEFAULT_PREFERENCES;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PREFERENCES;
    const record = parsed as Record<string, unknown>;
    return {
      hapticsEnabled:
        typeof record.hapticsEnabled === 'boolean'
          ? record.hapticsEnabled
          : DEFAULT_PREFERENCES.hapticsEnabled,
      soundEnabled:
        typeof record.soundEnabled === 'boolean'
          ? record.soundEnabled
          : DEFAULT_PREFERENCES.soundEnabled,
      quietMode:
        typeof record.quietMode === 'boolean' ? record.quietMode : DEFAULT_PREFERENCES.quietMode,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function SensoryProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Required<SensoryPreferences>>(DEFAULT_PREFERENCES);

  useEffect(() => {
    setHapticsEnabled(preferences.hapticsEnabled);
  }, [preferences.hapticsEnabled]);

  useEffect(() => {
    void storage
      .getStringAsync(SENSORY_KEY)
      .then((value) => setPreferences(readPreferences(value ?? null)))
      .catch((error: unknown) => {
        console.warn('[SensoryProvider] Load error:', error);
      });
  }, []);

  const setPreference = useCallback(
    async (key: SensoryPreferenceKey, value: boolean) => {
      const next = { ...preferences, [key]: value };
      setPreferences(next);
      try {
        storage.set(SENSORY_KEY, JSON.stringify(next));
      } catch (error: unknown) {
        console.warn('[SensoryProvider] Save error:', error);
      }
    },
    [preferences],
  );

  const value = useMemo(() => ({ preferences, setPreference }), [preferences, setPreference]);

  return <SensoryContext value={value}>{children}</SensoryContext>;
}

export function useSensoryPreferences(): SensoryContextValue {
  const context = useContext(SensoryContext);
  if (!context) throw new Error('useSensoryPreferences must be used within a SensoryProvider');
  return context;
}

export function useSensoryPreferencesOptional(): SensoryPreferences {
  return useContext(SensoryContext)?.preferences ?? DEFAULT_PREFERENCES;
}
