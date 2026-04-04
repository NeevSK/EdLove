import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import { Role } from '../schemas/role.schema';

/**
 * useUserRole: A canonical wrapper for current user authority.
 * @deprecated Use usePermissions() directly for more granular control.
 */
export const useUserRole = () => {
  const { context } = usePermissions();
  
  return useMemo(() => ({
    role: context.authority as Role,
    roles: context.roles as Role[],
    isPrincipal: context.authority === 'principal',
    isTeacher: context.authority === 'teacher',
    isStudent: context.authority === 'student',
    isFounder: context.authority === 'founder',
  }), [context]);
};
