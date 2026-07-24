import { getDomainEntry } from './appCatalog';
import { useSanctuaryFeature } from '../permissions/hooks/useSanctuaryFeature';
import type { DomainEntry } from './domainEntry';
import type { SanctuaryFeatureResult } from '../permissions/sanctuaryFeature';

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

  const result = useSanctuaryFeature(
    entry.capabilityRequirement.action,
    entry.capabilityRequirement.subject,
    {
      citizenshipRequired: entry.citizenshipRequired,
      entitlementModule: entry.entitlementModule,
      entitlementTier: entry.entitlementTier,
      flagKey: entry.flagKey,
    },
  );

  return { entry, result };
}

/**
 * useDomainFeatures — evaluate multiple domains at once.
 * Useful for tab bars that need to know which tabs to show.
 */
export function useDomainFeatures(
  domainIds: string[],
): Record<string, DomainFeatureResult> {
  return Object.fromEntries(
    domainIds.map((id) => [id, useDomainFeature(id)]),
  );
}
