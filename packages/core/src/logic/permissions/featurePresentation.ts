import type { SanctuaryFeatureResult } from '@repo/core/logic/permissions/sanctuaryFeature';
import type { FeatureState } from '@repo/core/logic/registry/domainEntry';

type FeatureDenial = Exclude<SanctuaryFeatureResult, { permitted: true }>;

export type FeaturePresentationMode =
  | 'available'
  | 'loading'
  | 'hidden'
  | 'locked'
  | 'upgrade_required'
  | 'coming_soon'
  | 'disabled'
  | 'unsupported';

export interface FeaturePresentation {
  mode: FeaturePresentationMode;
  requiredTier?: string;
  requiredScope?: string;
  reason?: FeatureDenial['reason'];
}

/**
 * Maps an access decision to UI intent. It never evaluates authorization,
 * entitlement, lifecycle, or rollout rules itself.
 */
export function resolveFeaturePresentation(
  result: SanctuaryFeatureResult,
  state?: FeatureState,
): FeaturePresentation {
  if (result.permitted) return { mode: 'available' };

  switch (result.reason) {
    case 'not_initialized':
      return { mode: 'loading', reason: result.reason };
    case 'platform':
      return { mode: 'unsupported', reason: result.reason };
    case 'entitlement':
      return {
        mode: 'upgrade_required',
        requiredTier: result.required,
        requiredScope: result.scope,
        reason: result.reason,
      };
    case 'citizenship':
      return { mode: 'locked', reason: result.reason };
    case 'authz':
      return { mode: 'hidden', reason: result.reason };
    case 'feature':
      if (state === 'development' || state === 'deprecated') {
        return { mode: 'hidden', reason: result.reason };
      }
      if (result.flagType === 'operational') {
        return { mode: 'disabled', reason: result.reason };
      }
      return { mode: 'coming_soon', reason: result.reason };
  }
}
