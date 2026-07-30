import { useFeatureStore, usePermissions } from '@repo/core/logic';
import { getDomainsByTab } from '@repo/core/logic/registry/appCatalog';
import { useMemo } from 'react';
import type { SelfDomain } from '@repo/self/constants/selfRegistry';

/**
 * Hook to resolve available Sanctuary domains based on user traits and bonds.
 * This is the heart of the ReBAC-driven capability discovery.
 */
export function useSanctuaryRegistry() {
  const { context, can } = usePermissions();
  const flags = useFeatureStore((state) => state.flags);
  const catalogDomains = useMemo(() => getDomainsByTab('self'), []);

  const availableDomains = useMemo(() => {
    return catalogDomains
      .filter((domain) => {
        if (domain.state !== 'live' && domain.state !== 'beta') return false;
        if (
          domain.flagKey &&
          Object.prototype.hasOwnProperty.call(flags, domain.flagKey) &&
          flags[domain.flagKey as keyof typeof flags] === false
        ) {
          return false;
        }
        if (!domain.capabilityRequirement) return true;
        const { action, subject } = domain.capabilityRequirement;
        return can(action as any, subject as any);
      })
      .map<SelfDomain>((domain) => ({
        id: domain.id,
        title: domain.presentation?.title ?? domain.label,
        accentColor: domain.presentation?.accentColor ?? '#8B5CF6',
        energyVibe: domain.presentation?.energyVibe,
        features: domain.presentation?.featureIds ?? [],
      }));
  }, [catalogDomains, can, flags]);

  return {
    domains: availableDomains,
    isAnonymous: context.isAnonymous,
  };
}
