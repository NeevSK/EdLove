import type { StateCreator } from 'zustand';
import { featureFlags } from '../../logic/managers/featureFlag.factory';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from '../types/featureFlags';
import type { UserContext } from '../../logic/schemas/user.schema';

export interface FeatureSlice {
  flags: FeatureFlags;
  globalConfigs: Record<string, string | boolean>;

  setGlobalConfigs: (configs: Record<string, string | boolean>) => void;

  recomputeFlags: (context: UserContext) => void;
}

function toBoolean(value: boolean | string): boolean {
  if (typeof value === 'boolean') return value;
  return value === 'true';
}

function applyFeatureFlags(
  base: FeatureFlags,
  overrides: Record<string, boolean | string>,
): FeatureFlags {
  const result = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (key in result) {
      (result as Record<string, unknown>)[key] = toBoolean(value);
    }
  }
  return result;
}

export const createFeatureSlice: StateCreator<FeatureSlice> = (set, get) => ({
  flags: { ...DEFAULT_FEATURE_FLAGS },

  globalConfigs: {},

  setGlobalConfigs: (configs) => {
    set({ globalConfigs: configs });
  },

  recomputeFlags: (context) => {
    featureFlags
      .resolveFlags(context)
      .then((snapshot) => {
        const flags = applyFeatureFlags(DEFAULT_FEATURE_FLAGS, snapshot.flags);
        const globalOverrides = get().globalConfigs;
        if (Object.keys(globalOverrides).length > 0) {
          set({ flags: applyFeatureFlags(flags, globalOverrides) });
        } else {
          set({ flags });
        }
      })
      .catch((err) => {
        console.warn('[FeatureSlice] resolveFlags failed, keeping defaults:', err);
      });
  },
});
