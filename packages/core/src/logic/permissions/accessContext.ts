import type {
  EntitlementReadiness,
  EntitlementSnapshot,
} from '@repo/core/logic/ports/entitlement.port';
import type { CitizenshipLevel } from '@repo/core/logic/registry/citizenship';

/**
 * Shared, pure access context consumed by local presentation and operation
 * gates. Adapters populate this context; the evaluator never reads stores,
 * headers, or network state directly.
 */
export interface FeatureAccessContext {
  userId?: string | null;
  activeBondId?: string | null;
  activeEntityId?: string | null;
  activeEntityType?: string | null;
  schoolId?: string | null;
  primaryCapacity?: string | null;
  cedarSnapshotLoaded: boolean;
  entitlementManifestLoaded: boolean;
  entitlementReadiness?: EntitlementReadiness;
  citizenship: CitizenshipLevel;
  entitlement: EntitlementSnapshot;
  cedarDecision: 'allow' | 'deny' | 'no_decision';
  cedarPolicy?: string;
  flagActive: boolean;
  flagKey: string;
  flagType: 'operational' | 'release' | 'development' | 'beta' | 'experiment';
}

export function isFeatureAccessContextReady(ctx: FeatureAccessContext): boolean {
  const entitlementReady = ctx.entitlementReadiness
    ? ctx.entitlementReadiness === 'verified' || ctx.entitlementReadiness === 'cached'
    : ctx.entitlementManifestLoaded;

  return ctx.cedarSnapshotLoaded && entitlementReady;
}
