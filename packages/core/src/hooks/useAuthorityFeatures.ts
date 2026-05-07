import { useMemo } from 'react';
import { usePermissions } from '../logic/permissions/hooks/usePermissions';
import type { AuthorityTier } from '../types/Authority';
import { useFeatureAccess } from './useFeatureAccess';

export interface AuthorityFeatures {
  // Visibility flags
  showClassroom: boolean;
  showCommunity: boolean;
  showLibrary: boolean;
  showSelf: boolean;
  showManagement: boolean;

  // Action flags
  canCreateContent: boolean;
  canInteract: boolean;
  canManageSchool: boolean;

  // Status flags
  isAnonymous: boolean;
  capacity: string | null;
}

/**
 * Hook to provide authority-specific feature sets, accounting for anonymity.
 * This should be the primary interface for UI-level feature gating.
 */
export function useAuthorityFeatures(): AuthorityFeatures {
  const { can, context } = usePermissions();
  const isUserAnonymous = !context.user_id;
  const { isGuest } = useFeatureAccess();

  // Combining store anonymity with feature-level guest status
  const isAnonymous = isUserAnonymous || isGuest;
  const capacity = context.active_bond?.capacity || null;

  const features = useMemo(() => {
    // Base features for everyone
    const base = {
      showClassroom: true,
      showCommunity: true,
      showLibrary: true,
      showSelf: true,
      showManagement: false,
      canCreateContent: !isAnonymous,
      canInteract: !isAnonymous,
      canManageSchool: false,
      isAnonymous,
      capacity,
    };

    // Capacity-specific overrides
    switch (capacity) {
      case 'founder':
      case 'admin':
      case 'developer':
      case 'principal':
        return {
          ...base,
          showManagement: true,
          canManageSchool: true,
          canCreateContent: true,
        };
      case 'teacher':
        return {
          ...base,
          canCreateContent: true,
        };
      case 'student':
        return {
          ...base,
          canCreateContent: false, // Students usually interact but don't "create" core objects
          canInteract: true,
        };
      default:
        // Guests or undefined authority
        return {
          ...base,
          showManagement: false,
          canCreateContent: false,
          canInteract: false,
        };
    }
  }, [capacity, isAnonymous]);

  return features;
}
