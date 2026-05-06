import { useMemo } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useFeatureStore } from '../../../store/useFeatureStore';
import { useTenantStore } from '../../../store/useTenantStore';
import { type TenantKind, type UserContext, UserContextSchema } from '../../schemas/user.schema';
import type { Actions, SubjectType } from '../abilities/base';
import { composeUserAbilities } from '../composer';

/**
 * usePermissions: The ONLY interface components ever touch for POA.
 * Re-renders automatically on permission change via store updates.
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const schoolType = useTenantStore((state) => state.schoolType);
  const flags = useFeatureStore((state) => state.flags);

  // 1. Build context from store (Perspective-aware)
  const context: UserContext = useMemo(() => {
    const activePerspective = useAuthStore.getState().activePerspective;
    const availableBonds = useAuthStore.getState().availableBonds;
    const activeBond = activePerspective?.activeBond || null;
    const isPersonal = schoolType === 'personal_workspace';

    const rawContext = {
      userId: user?.id || null,
      email: user?.email || null,
      
      // Sovereign ReBAC Context
      // 1. The Reality: All bonds the user holds
      bonds: availableBonds,
      
      // 2. The Anchor: The primary identity from onboarding (first bond)
      primaryCapacity: availableBonds[0]?.capacity || null,

      // 3. The Focus: The currently active bond
      activeBond,
      activeBondStatus: activeBond?.status || 'active',

      schoolId: activeBond?.entityType === 'SCHOOL' ? activeBond.entityId : user?.school_id || null,
      tenancyName: user?.organization_name || null,
      tenancy: {
        kind: (user?.tenant_kind || 'customer') as TenantKind,
        isPersonal,
      },
      tenantKind: (user?.tenant_kind || 'customer') as TenantKind,
      isAnonymous: !user || !!user?.is_anonymous,
      hasGlobalAccess: activeBond?.capacity === 'founder' || activeBond?.capacity === 'admin',
      isPersonal,
      // Scoped context injected from store if available
      sectionId: user?.section_id || null,
      gradeId: user?.grade_id || null,
      classroomId: activeBond?.entityType === 'CLASSROOM' ? activeBond.entityId : user?.classroom_id || null,
    };

    // Strict validation via Zod
    return UserContextSchema.parse(rawContext);
  }, [user, schoolType]);

  // 2. Compose abilities (CASL)
  const ability = useMemo(() => composeUserAbilities(context), [context]);

  // 3. Return ability and context (10 Pillars: Referential Stability)
  return useMemo(
    () => ({
      ability,
      context,
      flags,
      /**
       * can: Check if action on subject is allowed.
       * usage: can('read', 'School')
       */
      can: (action: Actions, subject: SubjectType, field?: string) =>
        ability.can(action, subject as any, field),
      /**
       * cannot: Check if action on subject is forbidden.
       */
      cannot: (action: Actions, subject: SubjectType, field?: string) =>
        ability.cannot(action, subject as any, field),
    }),
    [ability, context, flags],
  );
};
