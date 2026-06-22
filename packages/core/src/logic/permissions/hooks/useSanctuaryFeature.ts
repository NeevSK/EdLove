import { useMemo } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useFeatureStore } from '../../../store/useFeatureStore';
import { usePermissionStore } from '../../../store/usePermissionStore';
import { type SanctuaryFeatureRequirement, sanctuaryFeature } from '../sanctuaryFeature';
import { usePermissions } from './usePermissions';

export function useSanctuaryFeature(
  action: string,
  subject: string,
  requirement: SanctuaryFeatureRequirement = {},
) {
  const { context, flags } = usePermissions();
  const permissionsMap = usePermissionStore((state) => state.permissionsMap);
  const featureFlags = useFeatureStore((state) => state.flags);
  const isStoreHydrated = useAuthStore((state) => state.isStoreHydrated);

  return useMemo(
    () =>
      sanctuaryFeature(
        {
          context,
          flags: featureFlags ?? flags,
          permissionsMap,
          initialized: isStoreHydrated,
        },
        action,
        subject,
        requirement,
      ),
    [action, subject, requirement, context, featureFlags, flags, permissionsMap, isStoreHydrated],
  );
}
