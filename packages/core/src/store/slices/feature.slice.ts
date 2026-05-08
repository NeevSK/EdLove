import type { StateCreator } from 'zustand';
import { type FeatureFlags, resolveFeatureFlags } from '../../logic/permissions/feature-engine';
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
  flags: resolveFeatureFlags({
    user_id: null,
    userId: null,
    email: null,
    // Sovereign ReBAC fields — required by UserContext schema
    bonds: [],
    primary_capacity: null,
    primaryCapacity: null,
    active_bond: null,
    activeBond: null,
    active_bond_status: 'active',
    role: null,
    traits: [],
    school_id: null,
    schoolId: null,
    tenancy_name: null,
    tenancy: null,
    tenant_kind: 'customer',
    tier: 'free',
    citizenship: 'WANDERER',
    pricing_tier: 'FREE',
    is_anonymous: true,
    isAnonymous: true,
    has_global_access: false,
    is_personal: false,
    features: [],
    flags: {},
    section_id: null,
    grade_id: null,
    classroom_id: null,
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
