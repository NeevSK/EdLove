import type { FeaturePresentationMode } from '@repo/core/logic/permissions/featurePresentation';
import { useSanctuaryFeature } from '@repo/core/logic/permissions/hooks/useSanctuaryFeature';
import type { SanctuaryFeatureResult } from '@repo/core/logic/permissions/sanctuaryFeature';
import { getDomainEntry } from '@repo/core/logic/registry/appCatalog';
import type { DomainEntry } from '@repo/core/logic/registry/domainEntry';
import { requirementOf, roomPresentationOf } from '@repo/core/logic/registry/featureRequirement';
import { useCallback, useMemo } from 'react';

export interface DomainFeatureResult {
  entry: DomainEntry;
  result: SanctuaryFeatureResult;
}

const onWeb = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export { requirementOf };

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
  const requirement = useMemo(() => requirementOf(entry, onWeb()), [entry]);
  const result = useSanctuaryFeature(
    entry.capabilityRequirement.action,
    entry.capabilityRequirement.subject,
    requirement,
  );
  return { entry, result };
}

/**
 * SanctuaryFeature's decision for every feature of a room at once, as the
 * floor's presentation (available, locked, hidden...). Rooms pass this to
 * their floor so a feature the person may not have never takes a place.
 */
export function useRoomPresentation(
  features: readonly DomainEntry[],
): (featureId: string) => FeaturePresentationMode {
  const { evaluate } = useSanctuaryFeature();
  const modes = useMemo(
    () => roomPresentationOf(features, evaluate, onWeb()),
    [features, evaluate],
  );
  return useCallback((id: string) => modes[id] ?? 'hidden', [modes]);
}
