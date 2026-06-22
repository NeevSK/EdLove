import type { UserContext } from '../schemas/user.schema';
import type { FeatureFlags } from './feature-engine';

export type SanctuaryFeatureReason = 'not_initialized' | 'feature_disabled' | 'authz_denied';

export interface SanctuaryFeatureResult {
  permitted: boolean;
  reason?: SanctuaryFeatureReason;
  featureKey?: keyof FeatureFlags | string;
}

export interface SanctuaryFeatureRequirement {
  featureKey?: keyof FeatureFlags | string;
}

export interface SanctuaryFeatureContext {
  context: UserContext;
  flags: FeatureFlags;
  permissionsMap: Record<string, Record<string, boolean>> | null;
  initialized?: boolean;
}

export function sanctuaryFeature(
  ctx: SanctuaryFeatureContext,
  action: string,
  subject: string,
  requirement: SanctuaryFeatureRequirement = {},
): SanctuaryFeatureResult {
  if (ctx.initialized === false) {
    return { permitted: false, reason: 'not_initialized', featureKey: requirement.featureKey };
  }

  const featureKey = requirement.featureKey;
  if (featureKey && !ctx.flags[featureKey as keyof FeatureFlags]) {
    return { permitted: false, reason: 'feature_disabled', featureKey };
  }

  if (ctx.permissionsMap) {
    const isAllowed = ctx.permissionsMap[subject]?.[action];
    if (isAllowed !== true) {
      return { permitted: false, reason: 'authz_denied', featureKey };
    }
  }

  return { permitted: true, featureKey };
}
