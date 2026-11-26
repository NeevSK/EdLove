import type {
  EntitlementRequirement,
  EntitlementScope,
  EntitlementSnapshot,
  SubscriptionTier,
} from '@repo/core/logic/ports/entitlement.port';

/**
 * Entitlement decisions (Tier 2, pure). The port (logic/ports/entitlement.port.ts) only describes
 * the data an entitlement source provides; deciding what it allows lives here.
 */

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
