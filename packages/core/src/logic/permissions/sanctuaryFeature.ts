import {
  type FeatureAccessContext,
  isFeatureAccessContextReady,
} from '@repo/core/logic/permissions/accessContext';
import {
  isBaselineReadCapability,
  isLocalOnlyMutation,
} from '@repo/core/logic/permissions/baselineCapabilities';
import {
  type EntitlementScope,
  type EntitlementSnapshot,
  meetsSubscriptionTier,
  resolveScopedEntitlement,
} from '@repo/core/logic/ports/entitlement.port';
import {
  CITIZENSHIP,
  type CitizenshipLevel,
  type CitizenshipName,
  meetsCitizenship,
} from '@repo/core/logic/registry/citizenship';

export { CITIZENSHIP, type CitizenshipLevel, type CitizenshipName, meetsCitizenship };

export type PricingTier = EntitlementSnapshot['pricingTier'];
export type FlagType = 'operational' | 'release' | 'development' | 'beta' | 'experiment';
export type FeatureLifecycleState = 'development' | 'beta' | 'live' | 'deprecated';

/** Subscription tiers are ordered; higher tiers include lower-tier access. */
export function meetsPricingTier(current: PricingTier, required: PricingTier): boolean {
  return meetsSubscriptionTier(current, required);
}

export type SanctuaryFeatureResult =
  | { permitted: true; featureKey?: string }
  | { permitted: false; reason: 'not_initialized'; featureKey?: string }
  | {
      permitted: false;
      reason: 'citizenship';
      required: CitizenshipLevel;
      current: CitizenshipLevel;
      featureKey?: string;
    }
  | {
      permitted: false;
      reason: 'entitlement';
      required: PricingTier;
      current: PricingTier;
      scope?: EntitlementScope;
      featureKey?: string;
    }
  | { permitted: false; reason: 'authz'; policy?: string; featureKey?: string }
  | {
      permitted: false;
      reason: 'feature';
      flagKey: string;
      flagType: FlagType;
      featureKey?: string;
    }
  | { permitted: false; reason: 'platform'; featureKey?: string };

export type SanctuaryEvaluationContext = FeatureAccessContext;

export interface FeatureRequirement {
  action?: string;
  subject?: string;
  citizenshipRequired: CitizenshipLevel;
  platformSupported?: boolean;
  entitlementModule?: string;
  entitlementTier?: PricingTier;
  entitlementScope?: EntitlementScope;
  flagKey?: string;
  lifecycleState?: FeatureLifecycleState;
  /** Allow a safe read-only shell before remote capability hydration completes. */
  allowDuringBootstrap?: boolean;
}

export function sanctuaryFeature(
  ctx: SanctuaryEvaluationContext,
  requirement: FeatureRequirement,
): SanctuaryFeatureResult {
  if (!isFeatureAccessContextReady(ctx)) {
    if (
      ctx.isLocalOnly &&
      Boolean(ctx.userId) &&
      isLocalOnlyMutation(requirement.action ?? '', requirement.subject ?? '') &&
      ctx.flagActive
    ) {
      return { permitted: true };
    }
    if (
      requirement.allowDuringBootstrap &&
      isBaselineReadCapability(requirement.action ?? '', requirement.subject ?? '') &&
      Boolean(ctx.userId) &&
      !requirement.entitlementTier &&
      !requirement.entitlementModule &&
      ctx.flagActive &&
      meetsCitizenship(ctx.citizenship, CITIZENSHIP.THIRD_CLASS)
    ) {
      return { permitted: true };
    }
    return { permitted: false, reason: 'not_initialized' };
  }

  if (requirement.platformSupported === false) {
    return { permitted: false, reason: 'platform' };
  }

  // Gate 1 — citizenship
  if (!meetsCitizenship(ctx.citizenship, requirement.citizenshipRequired)) {
    return {
      permitted: false,
      reason: 'citizenship',
      required: requirement.citizenshipRequired,
      current: ctx.citizenship,
    };
  }

  // Gate 2 — Cedar. Cedar is the authoritative security boundary and must
  // take precedence over commercial failure reasons for protected UI actions.
  if (ctx.cedarDecision === 'deny' || ctx.cedarDecision === 'no_decision') {
    return { permitted: false, reason: 'authz', policy: ctx.cedarPolicy };
  }

  // Gate 3 — entitlement. Entitlement controls commercial access; it never
  // grants authorization and is evaluated only after Cedar permits the actor.
  // A tier is the subscription level; a module is an independent add-on or
  // capability entitlement. When both are declared, both must pass.
  const entitlement = resolveScopedEntitlement(
    ctx.entitlement,
    requirement.entitlementScope ?? 'individual',
  );
  if (
    requirement.entitlementTier &&
    !meetsPricingTier(entitlement.pricingTier, requirement.entitlementTier)
  ) {
    return {
      permitted: false,
      reason: 'entitlement',
      required: requirement.entitlementTier,
      current: entitlement.pricingTier,
      ...(requirement.entitlementScope ? { scope: requirement.entitlementScope } : {}),
    };
  }

  if (
    requirement.entitlementModule &&
    !entitlement.activeEntitlements.includes(requirement.entitlementModule)
  ) {
    return {
      permitted: false,
      reason: 'entitlement',
      required: requirement.entitlementTier ?? 'PRO',
      current: entitlement.pricingTier,
      ...(requirement.entitlementScope ? { scope: requirement.entitlementScope } : {}),
    };
  }

  // Cross-cut — feature lifecycle and rollout
  if (requirement.lifecycleState === 'development' || requirement.lifecycleState === 'deprecated') {
    return {
      permitted: false,
      reason: 'feature',
      flagKey: requirement.flagKey ?? 'lifecycle',
      flagType: requirement.lifecycleState === 'development' ? 'development' : 'operational',
    };
  }

  if (ctx.flagKey && !ctx.flagActive) {
    return {
      permitted: false,
      reason: 'feature',
      flagKey: ctx.flagKey,
      flagType: ctx.flagType,
    };
  }

  return { permitted: true };
}
