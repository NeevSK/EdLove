import { useMemo } from 'react';
import { composeUserAbilities } from '../composer';
import { Actions, Subjects } from '../abilities/base';
import { UserContext, UserContextSchema, TenantKind } from '../schemas/user.schema';
import { Role } from '../schemas/role.schema';
import { useStore, TotalState } from '../../store/useStore';

/**
 * usePermissions: The ONLY interface components ever touch for POA.
 * Re-renders automatically on permission change via store updates.
 */
export const usePermissions = () => {
  const { user, schoolType } = useStore((state: TotalState) => ({
    user: state.user,
    schoolType: state.schoolType
  }));

  // 1. Build context from store (Supabase auth + app state)
  const context: UserContext = useMemo(() => {
    const roles = (user?.roles || []) as Role[];
    const hasGlobalAccess = roles.some(r => ['founder', 'developer', 'admin'].includes(r));
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
    /**
     * can: Check if action on subject is allowed.
     * usage: can('read', 'School')
     */
    can: (action: Actions, subject: Subjects, field?: string) => ability.can(action, subject, field),
    /**
     * cannot: Check if action on subject is forbidden.
     */
    cannot: (action: Actions, subject: Subjects, field?: string) => ability.cannot(action, subject, field),
  };
};
