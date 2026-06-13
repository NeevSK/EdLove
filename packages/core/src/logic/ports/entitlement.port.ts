export interface EntitlementSnapshot {
  pricingTier: 'FREE' | 'PRO' | 'INSTITUTIONAL';
  activeEntitlements: string[];
  expirationDate: string | null;
}

export interface IEntitlementPort {
  getEntitlements(userId: string): Promise<EntitlementSnapshot>;
  syncPurchases(userId: string): Promise<EntitlementSnapshot>;
  subscribeToEntitlementChanges(
    userId: string,
    callback: (snapshot: EntitlementSnapshot) => void
  ): () => void;
}
