import { useMemo } from 'react';
import { usePermissions } from '../logic/permissions/hooks/usePermissions';
import { useFeatureAccess } from './useFeatureAccess';

export interface CapacityFeatures {
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
 * Hook to provide capacity-specific feature sets, accounting for anonymity.
 * This should be the primary interface for UI-level feature gating.
 */
export function useCapacityFeatures(): CapacityFeatures {
  const { context } = usePermissions();
  const isUserAnonymous = !context.userId;
  const { isGuest } = useFeatureAccess();

  // Combining store anonymity with feature-level anonymous status
  const isAnonymous = isUserAnonymous || isGuest;
  const capacity = context.activeBond?.capacity || null;

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
        // Guests or undefined capacity
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
