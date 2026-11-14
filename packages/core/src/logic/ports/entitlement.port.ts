import { Context } from 'effect';

export type EntitlementReadiness =
  | 'unknown'
  | 'loading'
  | 'verified'
  | 'cached'
  | 'stale'
  | 'error';
export type SubscriptionTier = 'FREE' | 'PRO' | 'INSTITUTIONAL';
export type EntitlementScope = 'individual' | 'active_bond' | 'active_entity' | 'add_on';

export interface EntitlementGrant {
  id: string;
  scope: EntitlementScope;
  scopeId: string | null;
  tier: SubscriptionTier;
  modules: readonly string[];
  startsAt?: string;
  expiresAt: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
}

export interface EntitlementScopeContext {
  activeBondId?: string | null;
  activeEntityId?: string | null;
  activeEntityType?: string | null;
}

export interface EntitlementRequirement {
  tierAtLeast?: SubscriptionTier;
  modulesAllOf?: readonly string[];
  /** Defaults to the individual plan; institutional access must opt in. */
  scope?: EntitlementScope;
}

export interface EntitlementSnapshot {
  pricingTier: SubscriptionTier;
  activeEntitlements: string[];
  expirationDate: string | null;
  refreshedAt?: string;
  /** Grants are already restricted to the current user's available scopes. */
  grants?: readonly EntitlementGrant[];
}

export interface IEntitlementPort {
  getEntitlements(userId: string, scope?: EntitlementScopeContext): Promise<EntitlementSnapshot>;
  syncPurchases(userId: string, scope?: EntitlementScopeContext): Promise<EntitlementSnapshot>;
  subscribeToEntitlementChanges(
    userId: string,
    callback: (snapshot: EntitlementSnapshot) => void,
    scope?: EntitlementScopeContext,
  ): () => void;
}

/** The entitlement source, as a service the composition root binds (effect/Layers.ts). */
export class EntitlementPort extends Context.Service<EntitlementPort, IEntitlementPort>()(
  'app/EntitlementPort',
) {}
