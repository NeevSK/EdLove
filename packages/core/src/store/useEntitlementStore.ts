import { create } from 'zustand';
import { SupabaseEntitlementAdapter } from '../adapters/supabase/supabaseEntitlement.adapter';

const _adapter = new SupabaseEntitlementAdapter();

export interface EntitlementState {
  activeEntitlements: string[];
  pricingTier: string;
  manifestLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  loadEntitlements: (userId: string) => Promise<void>;

  clearEntitlements: () => void;
}

export const useEntitlementStore = create<EntitlementState>((set) => ({
  activeEntitlements: [],
  pricingTier: 'FREE',
  manifestLoaded: false,
  isLoading: false,
  error: null,

  loadEntitlements: async (userId: string) => {
    if (!userId) {
      set({ activeEntitlements: [], pricingTier: 'FREE', manifestLoaded: false, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const snapshot = await _adapter.getEntitlements(userId);
      set({
        activeEntitlements: snapshot.activeEntitlements,
        pricingTier: snapshot.pricingTier,
        manifestLoaded: true,
        isLoading: false,
      });
    } catch (err) {
      console.error('[EntitlementStore] Error loading entitlements:', err);
      set({
        activeEntitlements: [],
        pricingTier: 'FREE',
        manifestLoaded: false,
        error: err instanceof Error ? err.message : String(err),
        isLoading: false,
      });
    }
  },

  clearEntitlements: () =>
    set({
      activeEntitlements: [],
      pricingTier: 'FREE',
      manifestLoaded: false,
      isLoading: false,
      error: null,
    }),
}));
