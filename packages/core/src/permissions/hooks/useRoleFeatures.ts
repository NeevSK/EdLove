import { useMemo } from 'react';
import { usePermissions } from './usePermissions';

/**
 * useRoleFeatures: Context-aware role metadata.
 * @deprecated Use usePermissions().context for authoritative flags.
 */
export const useRoleFeatures = () => {
  const { context } = usePermissions();

  return useMemo(() => ({
    isGuest: context.isAnonymous,
    isWanderer: context.isAnonymous,
    hasGlobalAccess: context.hasGlobalAccess,
    isPersonal: context.isPersonal,
  }), [context]);
};
