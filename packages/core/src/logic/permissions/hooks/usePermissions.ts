import { useMemo } from 'react';
import type { Role } from '../../schemas/role.schema';
import {
  type TenantKind,
  type UserContext,
  UserContextSchema,
} from '../../schemas/user.schema';
import { useFeatureStore } from '../../../store/useFeatureStore';
import { type TotalState, useStore } from '../../../store/useStore';
import type { Actions, SubjectType } from '../abilities/base';
import { composeUserAbilities } from '../composer';

/**
 * usePermissions: The ONLY interface components ever touch for POA.
 * Re-renders automatically on permission change via store updates.
 */
export const usePermissions = () => {
  const { user, schoolType } = useStore((state: TotalState) => ({
    user: state.user,
    schoolType: state.schoolType,
  }));
  const flags = useFeatureStore((state) => state.flags);

  // 1. Build context from store (Supabase auth + app state)
  const context: UserContext = useMemo(() => {
    const roles = (user?.roles || []) as Role[];
    const hasGlobalAccess = roles.some((r) => ['founder', 'developer', 'admin'].includes(r));
    const isPersonal = schoolType === 'personal_workspace';

    const rawContext = {
      userId: user?.id || null,
      email: user?.email || null,
      schoolId: user?.school_id || null, // Null = 2nd class citizen
      tenancyName: user?.organization_name || null,
      tenancy: {
        kind: (user?.tenant_kind || 'customer') as TenantKind,
        isPersonal,
      },
      tenantKind: (user?.tenant_kind || 'customer') as TenantKind,
      roles,
      authority: (user?.authority as Role) || roles[0] || null,
      isAnonymous: !user || !!user?.is_anonymous,
      hasGlobalAccess,
      isPersonal,
      // Scoped context injected from store if available
      sectionId: user?.section_id || null,
      gradeId: user?.grade_id || null,
      classroomId: user?.classroom_id || null,
    };

    // Strict validation via Zod
    return UserContextSchema.parse(rawContext);
  }, [user, schoolType]);

  // 2. Compose abilities (CASL)
  const ability = useMemo(() => composeUserAbilities(context), [context]);

  // 3. Return ability and context
  return {
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
  };
};


