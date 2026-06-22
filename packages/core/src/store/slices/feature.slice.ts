import type { StateCreator } from 'zustand';
import { type FeatureFlags, resolveFeatureFlags } from '../../logic/permissions/feature-engine';
import { readFeatureRolloutCache } from '../../logic/permissions/feature-rollout-cache';
import type { UserContext } from '../../logic/schemas/user.schema';

/**
 * FeatureSlice - FAANG-level state management for feature flags.
 *
 * Separates Global Configuration from User-specific Resolution.
 */
export interface FeatureSlice {
  flags: FeatureFlags;
  globalConfigs: Record<string, string | boolean>;

  /** Update the global kill-switches / remote config */
  setGlobalConfigs: (configs: Record<string, string | boolean>) => void;

  /** Trigger a re-computation of all flags based on current user context and global config */
  recomputeFlags: (context: UserContext) => void;
}

export const createFeatureSlice: StateCreator<FeatureSlice> = (set, get) => ({
  // Default values before any context is resolved
  flags:
    (readFeatureRolloutCache()?.flags as FeatureFlags | undefined) ??
    resolveFeatureFlags({
      userId: null,
      email: null,
      // Sovereign ReBAC fields — required by UserContext schema
      bonds: [],
      primaryCapacity: null,
      activeBond: null,
      capacity: null,
      traits: [],
      schoolId: null,
      pricing_tier: 'FREE',
      tenancyName: null,
      tenancy: null,
      tenantKind: 'customer',
      tier: 'free',
      citizenship: 'WANDERER',
      isAnonymous: true,
      hasGlobalAccess: false,
      isPersonal: false,
      features: [],
      flags: {},
      sectionId: null,
      gradeId: null,
      classroomId: null,
    }),

  globalConfigs: {},

  setGlobalConfigs: (configs) => {
    set({ globalConfigs: configs });
    // Note: recomputeFlags should be called manually after this to update flags
  },

  recomputeFlags: (context) => {
    const newFlags = resolveFeatureFlags(context, get().globalConfigs);
    set({ flags: newFlags });
  },
});
