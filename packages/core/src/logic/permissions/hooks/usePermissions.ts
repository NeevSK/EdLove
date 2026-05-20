import { useMemo, useCallback } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useFeatureStore } from '../../../store/useFeatureStore';
import { useTenantStore } from '../../../store/useTenantStore';
import { usePermissionStore } from '../../../store/usePermissionStore';
import { type TenantKind, type UserContext, UserContextSchema } from '../../schemas/user.schema';
import type { Actions, SubjectType } from '../abilities/base';

/**
 * usePermissions: The ONLY interface components ever touch for POA.
 * Decoupled from legacy CASL abilities, utilizing the new cryptographically-signed
 * PermissionSnapshot architecture.
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const schoolType = useTenantStore((state) => state.schoolType);
  const flags = useFeatureStore((state) => state.flags);
  const permissionsMap = usePermissionStore((state) => state.permissionsMap);

  // Build a single canonical context from the current identity state.
  const context: UserContext = useMemo(() => {
    const activePerspective = useAuthStore.getState().activePerspective;
    const availableBonds = useAuthStore.getState().availableBonds;
    const activeBond = activePerspective?.activeBond ?? null;
    const isPersonal = schoolType === 'personal_workspace';

    const rawContext: UserContext = {
      userId: user?.id || null,
      email: user?.email || null,

      // Sovereign ReBAC Context
      bonds: availableBonds as UserContext['bonds'],
      primaryCapacity: availableBonds[0]?.capacity || null,
      activeBond: activeBond as UserContext['activeBond'],
      capacity: activeBond?.capacity || null,
      traits: activeBond?.capacity ? [`capacity:${activeBond.capacity}`] : [],
      tier: user?.tier || 'free',
      citizenship:
        user?.citizenship === 'SECOND_CLASS' || user?.citizenship === 'FIRST_CLASS'
          ? user.citizenship
          : 'WANDERER',
      pricing_tier:
        user?.pricing_tier === 'PRO' || user?.pricing_tier === 'INSTITUTIONAL'
          ? user.pricing_tier
          : 'FREE',
      features: user?.features || [],
      flags: user?.flags || {},

      schoolId: activeBond?.entity_type === 'SCHOOL' ? activeBond.entity_id : null,
      tenancyName: null,
      tenancy: {
        kind: 'customer' as TenantKind,
        isPersonal,
      },
      tenantKind: 'customer' as TenantKind,
      isAnonymous: !user,
      hasGlobalAccess: activeBond?.capacity === 'founder' || activeBond?.capacity === 'admin',
      isPersonal,
      sectionId: null,
      gradeId: null,
      classroomId:
        activeBond?.entity_type === 'CLASSROOM'
          ? activeBond.entity_id
          : null,
    };

    // Strict validation via Zod
    return UserContextSchema.parse(rawContext);
  }, [user, schoolType]);

  /**
   * can: Check if action on subject is allowed.
   */
  const can = useCallback(
    (action: Actions, subject: SubjectType) => {
      // Snapshot-first evaluation: if the permission matrix is missing, deny.
      if (!permissionsMap) {
        return false;
      }

      const isAllowed = permissionsMap[subject as string]?.[action as string];
      return isAllowed === true;
    },
    [permissionsMap],
  );

  /**
   * cannot: Check if action on subject is forbidden.
   */
  const cannot = useCallback(
    (action: Actions, subject: SubjectType) => {
      return !can(action, subject);
    },
    [can],
  );

  return useMemo(
    () => ({
      context,
      flags,
      can,
      cannot,
    }),
    [context, flags, can, cannot],
  );
};
