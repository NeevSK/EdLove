import { isBaselineReadCapability } from '@repo/core/logic/permissions/baselineCapabilities';
import {
  type FeaturePresentationMode,
  resolveFeaturePresentation,
} from '@repo/core/logic/permissions/featurePresentation';
import type {
  FeatureRequirement,
  SanctuaryFeatureResult,
} from '@repo/core/logic/permissions/sanctuaryFeature';
import type { DomainEntry } from '@repo/core/logic/registry/domainEntry';

/** What a catalog entry asks of SanctuaryFeature on one platform. */
export function requirementOf(entry: DomainEntry, web: boolean): FeatureRequirement {
  const { action, subject } = entry.capabilityRequirement;
  return {
    action,
    subject,
    citizenshipRequired: entry.citizenshipRequired,
    platformSupported: web ? entry.webSupport : entry.mobileSupport,
    entitlementModule: entry.entitlementModule,
    entitlementTier: entry.entitlementTier,
    flagKey: entry.flagKey,
    lifecycleState: entry.state,
    allowDuringBootstrap: isBaselineReadCapability(action, subject),
  };
}

export type FeatureEvaluator = (
  action: string,
  subject: string,
  requirement?: FeatureRequirement,
) => SanctuaryFeatureResult;

/**
 * SanctuaryFeature's decision for each feature, as the floor's presentation
 * (available, locked, hidden...). The phone passes its hook's evaluate; the
 * web server passes evaluateFeatureFor over the person it verified.
 */
export function roomPresentationOf(
  features: readonly DomainEntry[],
  evaluate: FeatureEvaluator,
  web: boolean,
): Record<string, FeaturePresentationMode> {
  const out: Record<string, FeaturePresentationMode> = {};
  for (const entry of features) {
    const { action, subject } = entry.capabilityRequirement;
    out[entry.id] = resolveFeaturePresentation(
      evaluate(action, subject, requirementOf(entry, web)),
      entry.state,
    ).mode;
  }
  return out;
}
