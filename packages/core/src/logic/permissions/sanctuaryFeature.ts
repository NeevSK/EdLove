import type { EntitlementSnapshot } from '@/logic/ports/entitlement.port';
import {
  CITIZENSHIP,
  type CitizenshipLevel,
  type CitizenshipName,
  meetsCitizenship,
} from '@/logic/registry/citizenship';

export { CITIZENSHIP, type CitizenshipLevel, type CitizenshipName, meetsCitizenship };

export type PricingTier = 'FREE' | 'PRO' | 'INSTITUTIONAL';
export type FlagType = 'operational' | 'release' | 'development' | 'beta' | 'experiment';
export type FeatureLifecycleState = 'development' | 'beta' | 'live' | 'deprecated';

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
      featureKey?: string;
    }
  | { permitted: false; reason: 'authz'; policy?: string; featureKey?: string }
  | {
      permitted: false;
      reason: 'feature';
      flagKey: string;
      flagType: FlagType;
      featureKey?: string;
    };

export interface SanctuaryEvaluationContext {
  cedarSnapshotLoaded: boolean;
  entitlementManifestLoaded: boolean;
  citizenship: CitizenshipLevel;
  entitlement: EntitlementSnapshot;
  cedarDecision: 'allow' | 'deny' | 'no_decision';
  cedarPolicy?: string;
  flagActive: boolean;
  flagKey: string;
  flagType: FlagType;
}

export interface FeatureRequirement {
  citizenshipRequired: CitizenshipLevel;
  entitlementModule?: string;
  entitlementTier?: PricingTier;
  flagKey?: string;
  lifecycleState?: FeatureLifecycleState;
}

export function sanctuaryFeature(
  ctx: SanctuaryEvaluationContext,
  requirement: FeatureRequirement,
): SanctuaryFeatureResult {
  if (!ctx.cedarSnapshotLoaded || !ctx.entitlementManifestLoaded) {
    return { permitted: false, reason: 'not_initialized' };
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
  if (requirement.entitlementModule) {
    if (!ctx.entitlement.activeEntitlements.includes(requirement.entitlementModule)) {
      const requiredTier = requirement.entitlementTier ?? 'PRO';
      return {
        permitted: false,
        reason: 'entitlement',
        required: requiredTier,
        current: ctx.entitlement.pricingTier,
      };
    }
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
