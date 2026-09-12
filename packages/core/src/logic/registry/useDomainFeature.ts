import { isBaselineReadCapability } from '@repo/core/logic/permissions/baselineCapabilities';
import { useSanctuaryFeature } from '@repo/core/logic/permissions/hooks/useSanctuaryFeature';
import type { SanctuaryFeatureResult } from '@repo/core/logic/permissions/sanctuaryFeature';
import { getDomainEntry } from '@repo/core/logic/registry/appCatalog';
import type { DomainEntry } from '@repo/core/logic/registry/domainEntry';

export interface DomainFeatureResult {
  entry: DomainEntry;
  result: SanctuaryFeatureResult;
}

/**
 * useDomainFeature — reads a domain entry from the AppCatalog
 * and evaluates it through useSanctuaryFeature.
 *
 * This is the primary way components and hooks determine whether
 * a domain is accessible to the current user.
 *
 * Never call useSanctuaryFeature directly with inline requirements
 * for a domain — always go through useDomainFeature so requirements
 * stay in sync with the registry.
 */
export function useDomainFeature(domainId: string): DomainFeatureResult {
  const entry = getDomainEntry(domainId);
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

  const result = useSanctuaryFeature(
    entry.capabilityRequirement.action,
    entry.capabilityRequirement.subject,
    {
      action: entry.capabilityRequirement.action,
      subject: entry.capabilityRequirement.subject,
      citizenshipRequired: entry.citizenshipRequired,
      platformSupported: isWeb ? entry.webSupport : entry.mobileSupport,
      entitlementModule: entry.entitlementModule,
      entitlementTier: entry.entitlementTier,
      flagKey: entry.flagKey,
      lifecycleState: entry.state,
      allowDuringBootstrap: isBaselineReadCapability(
        entry.capabilityRequirement.action,
        entry.capabilityRequirement.subject,
      ),
    },
  );

  return { entry, result };
}
