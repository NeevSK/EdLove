import { useMemo } from 'react';
import { useAbility } from '@casl/react';
import { composeUserAbilities } from '../composer';
import { AppAbility } from '../abilities/student';
import { UserContext } from '../schemas/user.schema';
import { Role } from '../schemas/role.schema';
import { useStore } from '../../store/useStore';

/**
 * usePermissions: The ONLY interface components ever touch for POA.
 * Re-renders automatically on permission change via useAbility hook.
 */
export const usePermissions = () => {
  const user = useStore(state => state.user);
  const schoolType = useStore(state => state.schoolType);

  // 1. Build context from store (Supabase auth + app state)
  const context: UserContext = useMemo(() => {
    // Note: getPlatformAccessContext logic consolidated here for Zod truth
    const roles = (user?.roles || []) as Role[];
    const hasGlobalAccess = roles.some(r => ['founder', 'developer', 'admin'].includes(r));

    return {
      userId: user?.id || null,
      email: user?.email || null,
      schoolId: user?.school_id || null, // Null = 2nd class citizen
      tenantKind: user?.tenant_kind || 'customer',
      roles,
      isAnonymous: !user || user.is_anonymous,
      hasGlobalAccess,
      isPersonal: schoolType === 'personal_workspace',
      // Scoped context injected from store if available
      sectionId: user?.section_id || null,
      gradeId: user?.grade_id || null,
      classroomId: user?.classroom_id || null,
    };
  }, [user, schoolType]);

  // 2. Compose abilities (CASL)
  const ability = useMemo(() => composeUserAbilities(context), [context]);

  // 3. Use CASL hook for reactivity
  // This ensures components re-render when 'ability' object changes (e.g. via Realtime)
  const reactiveAbility = useAbility(ability);

  return {
    ability: reactiveAbility,
    context,
    /**
     * can: Check if action on subject is allowed.
     * usage: can('read', 'School')
     */
    can: (action: any, subject: any, field?: string) => reactiveAbility.can(action, subject, field),
    /**
     * cannot: Check if action on subject is forbidden.
     */
    cannot: (action: any, subject: any, field?: string) => reactiveAbility.cannot(action, subject, field),
  };
};
