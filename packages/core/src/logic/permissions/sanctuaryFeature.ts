import {
  CITIZENSHIP,
  type CitizenshipLevel,
  type CitizenshipName,
  meetsCitizenship,
} from '@/logic/registry/citizenship';
import type { EntitlementSnapshot } from '@/logic/ports/entitlement.port';

export {
  CITIZENSHIP,
  type CitizenshipLevel,
  type CitizenshipName,
  meetsCitizenship,
};

export type PricingTier = 'FREE' | 'PRO' | 'INSTITUTIONAL';
export type FlagType = 'operational' | 'development' | 'beta' | 'experiment';

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
  | { permitted: false; reason: 'feature'; flagKey: string; flagType: FlagType; featureKey?: string };

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

  // Gate 2 — entitlement
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

  // Gate 3 — Cedar
  if (ctx.cedarDecision === 'deny' || ctx.cedarDecision === 'no_decision') {
    return { permitted: false, reason: 'authz', policy: ctx.cedarPolicy };
  }

  // Cross-cut — feature flag
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
