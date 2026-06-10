import { usePermissions } from '@repo/core/logic';
import { useMemo } from 'react';
import { SANCTUARY_DOMAINS } from '../constants/selfRegistry';

/**
 * Hook to resolve available Sanctuary domains based on user traits and bonds.
 * This is the heart of the ReBAC-driven capability discovery.
 */
export function useSanctuaryRegistry() {
  const { context, can } = usePermissions();
  const role = context.capacity;

  const availableDomains = useMemo(() => {
    const traits = context.traits || [];
    return Object.values(SANCTUARY_DOMAINS).filter((domain) => {
      // 1. Dynamic Cedar/ReBAC Snapshot evaluation takes absolute priority
      if (domain.capabilityRequirement) {
        const { action, subject } = domain.capabilityRequirement;
        return can(action as any, subject as any);
      }

      // 2. Legacy/Static Trait requirement check fallback
      if (!domain.traitRequirement) return true;

      // Check for role-based requirement
      if (domain.traitRequirement.startsWith('role:')) {
        const requiredRole = domain.traitRequirement.split(':')[1];
        return role === requiredRole;
      }

      // Check for specific trait requirement
      return traits.includes(domain.traitRequirement);
    });
  }, [role, context.traits, can]);

  return {
    domains: availableDomains,
    isAnonymous: context.isAnonymous,
  };
}
