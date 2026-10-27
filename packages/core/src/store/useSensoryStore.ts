import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SensoryPreferencesState {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  quietMode: boolean;

  setHapticsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setQuietMode: (enabled: boolean) => void;
  setPreference: (key: 'hapticsEnabled' | 'soundEnabled' | 'quietMode', value: boolean) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES = {
  hapticsEnabled: true,
  soundEnabled: false,
  quietMode: false,
};

export const useSensoryStore = create<SensoryPreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,

      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setQuietMode: (quietMode) => set({ quietMode }),
      setPreference: (key, value) => set({ [key]: value }),
      resetPreferences: () => set(DEFAULT_PREFERENCES),
    }),
    {
      name: 'gurudevi_sensory_preferences_v1',
      storage: createJSONStorage(() => SafeZustandStorage),
    },
  ),
);
