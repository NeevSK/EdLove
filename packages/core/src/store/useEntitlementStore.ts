import { SupabaseEntitlementAdapter } from '@repo/core/adapters/supabase/supabaseEntitlement.adapter';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import type {
  EntitlementGrant,
  EntitlementReadiness,
  EntitlementScopeContext,
  EntitlementSnapshot,
} from '@repo/core/logic/ports/entitlement.port';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Cached commercial access may support offline continuity for one day. */
export const ENTITLEMENT_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface EntitlementState {
  activeEntitlements: string[];
  grants: EntitlementGrant[];
  pricingTier: 'FREE' | 'PRO' | 'INSTITUTIONAL';
  manifestLoaded: boolean;
  readiness: EntitlementReadiness;
  snapshotRefreshedAt: string | null;
  snapshotUserId: string | null;
  snapshotActiveBondId: string | null;
  isLoading: boolean;
  error: string | null;

  loadEntitlements: (userId: string, scope?: EntitlementScopeContext) => Promise<void>;

  clearEntitlements: () => void;
}

const _adapter = new SupabaseEntitlementAdapter();

export function isEntitlementSnapshotFresh(refreshedAt: string | null, now = Date.now()): boolean {
  if (!refreshedAt) return false;
  const parsed = Date.parse(refreshedAt);
  return Number.isFinite(parsed) && now - parsed <= ENTITLEMENT_SNAPSHOT_MAX_AGE_MS;
}

function snapshotFields(
  snapshot: EntitlementSnapshot,
  userId: string,
  scope: EntitlementScopeContext,
) {
  return {
    activeEntitlements: snapshot.activeEntitlements,
    grants: [...(snapshot.grants ?? [])],
    pricingTier: snapshot.pricingTier,
    manifestLoaded: true,
    readiness: 'verified' as const,
    snapshotRefreshedAt: snapshot.refreshedAt ?? new Date().toISOString(),
    snapshotUserId: userId,
    snapshotActiveBondId: scope.activeBondId ?? null,
    isLoading: false,
    error: null,
  };
}

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set, get) => ({
      activeEntitlements: [],
      grants: [],
      pricingTier: 'FREE',
      manifestLoaded: false,
      readiness: 'unknown',
      snapshotRefreshedAt: null,
      snapshotUserId: null,
      snapshotActiveBondId: null,
      isLoading: false,
      error: null,

      loadEntitlements: async (userId: string, scope: EntitlementScopeContext = {}) => {
        const current = get();
        if (!userId) {
          get().clearEntitlements();
          return;
        }

        if (current.snapshotUserId && current.snapshotUserId !== userId) {
          set({
            activeEntitlements: [],
            grants: [],
            pricingTier: 'FREE',
            manifestLoaded: false,
            readiness: 'unknown',
            snapshotRefreshedAt: null,
            snapshotUserId: null,
            snapshotActiveBondId: null,
          });
        } else if (current.snapshotActiveBondId !== (scope.activeBondId ?? null)) {
          set({ manifestLoaded: false, readiness: 'unknown', grants: [] });
        } else if (
          current.manifestLoaded &&
          !isEntitlementSnapshotFresh(current.snapshotRefreshedAt)
        ) {
          set({ readiness: 'stale', manifestLoaded: false });
        }

        set({ isLoading: true, error: null });

        try {
          const snapshot = await _adapter.getEntitlements(userId, scope);
          set(snapshotFields(snapshot, userId, scope));
        } catch (err) {
          const cached = get();
          const canUseCache =
            cached.snapshotUserId === userId &&
            isEntitlementSnapshotFresh(cached.snapshotRefreshedAt);
          set({
            manifestLoaded: canUseCache,
            readiness: canUseCache ? 'cached' : 'error',
            isLoading: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      },

      clearEntitlements: () =>
        set({
          activeEntitlements: [],
          grants: [],
          pricingTier: 'FREE',
          manifestLoaded: false,
          readiness: 'unknown',
          snapshotRefreshedAt: null,
          snapshotUserId: null,
          snapshotActiveBondId: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'gurudevi-entitlement-storage',
      storage: createJSONStorage(() => SafeZustandStorage),
      partialize: (state) => ({
        activeEntitlements: state.activeEntitlements,
        grants: state.grants,
        pricingTier: state.pricingTier,
        manifestLoaded: state.manifestLoaded,
        readiness: state.readiness,
        snapshotRefreshedAt: state.snapshotRefreshedAt,
        snapshotUserId: state.snapshotUserId,
        snapshotActiveBondId: state.snapshotActiveBondId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.snapshotUserId || !state.manifestLoaded) return;
        const fresh = isEntitlementSnapshotFresh(state.snapshotRefreshedAt);
        useEntitlementStore.setState({
          manifestLoaded: fresh,
          readiness: fresh ? 'cached' : 'stale',
        });
      },
    },
  ),
);
