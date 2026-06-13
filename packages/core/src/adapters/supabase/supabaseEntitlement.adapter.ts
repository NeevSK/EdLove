import type { IEntitlementPort, EntitlementSnapshot } from '../../logic/ports/entitlement.port';
import { useAuthStore } from '../../store/useAuthStore';

export class SupabaseEntitlementAdapter implements IEntitlementPort {
  async getEntitlements(userId: string): Promise<EntitlementSnapshot> {
    const user = useAuthStore.getState().user;

    // Fallback if the user object in store doesn't match the requested userId
    if (!user || user.id !== userId) {
      return {
        pricingTier: 'FREE',
        activeEntitlements: [],
        expirationDate: null,
      };
    }

    return {
      pricingTier: (user.pricing_tier as 'FREE' | 'PRO' | 'INSTITUTIONAL') || 'FREE',
      activeEntitlements: user.features || [],
      expirationDate: null,
    };
  }

  async syncPurchases(userId: string): Promise<EntitlementSnapshot> {
    // Under web-only payments, sync is automatic via PowerSync.
    // We simply return the current state from the store.
    return this.getEntitlements(userId);
  }

  subscribeToEntitlementChanges(
    userId: string,
    callback: (snapshot: EntitlementSnapshot) => void
  ): () => void {
    return useAuthStore.subscribe((state) => {
      const user = state.user;
      if (user && user.id === userId) {
        callback({
          pricingTier: (user.pricing_tier as 'FREE' | 'PRO' | 'INSTITUTIONAL') || 'FREE',
          activeEntitlements: user.features || [],
          expirationDate: null,
        });
      }
    });
  }
}
