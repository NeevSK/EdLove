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

const TIER_RANK: Record<SubscriptionTier, number> = { FREE: 0, PRO: 1, INSTITUTIONAL: 2 };

export function resolveScopedEntitlement(
  snapshot: EntitlementSnapshot,
  scope: EntitlementScope = 'individual',
): { pricingTier: SubscriptionTier; activeEntitlements: string[] } {
  if (scope === 'individual') {
    return {
      pricingTier: snapshot.pricingTier,
      activeEntitlements: snapshot.activeEntitlements,
    };
  }

  const grants = (snapshot.grants ?? []).filter(
    (grant) => grant.scope === scope && grant.status === 'ACTIVE',
  );
  const tier = grants.reduce<SubscriptionTier>(
    (highest, grant) => (TIER_RANK[grant.tier] > TIER_RANK[highest] ? grant.tier : highest),
    'FREE',
  );
  const modules = [...new Set(grants.flatMap((grant) => grant.modules))];
  return { pricingTier: tier, activeEntitlements: modules };
}

export function meetsSubscriptionTier(
  current: SubscriptionTier,
  required: SubscriptionTier,
): boolean {
  const rank: Record<SubscriptionTier, number> = { FREE: 0, PRO: 1, INSTITUTIONAL: 2 };
  return rank[current] >= rank[required];
}

export function satisfiesEntitlementRequirement(
  snapshot: EntitlementSnapshot,
  requirement: EntitlementRequirement,
): boolean {
  const scoped = resolveScopedEntitlement(snapshot, requirement.scope);
  const tierSatisfied = requirement.tierAtLeast
    ? meetsSubscriptionTier(scoped.pricingTier, requirement.tierAtLeast)
    : true;
  const modulesSatisfied = requirement.modulesAllOf
    ? requirement.modulesAllOf.every((module) => scoped.activeEntitlements.includes(module))
    : true;
  return tierSatisfied && modulesSatisfied;
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
