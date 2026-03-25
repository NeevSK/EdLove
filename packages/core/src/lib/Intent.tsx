import React from 'react';
import { IntentProps } from '../types/Protocol';
import { protocolRegistry } from './ProtocolRegistry';
import { useTenantContext } from '../hooks/useTenantContext';
import { usePermissions } from '../permissions/hooks/usePermissions';
import { UserContext } from '../permissions/schemas/user.schema';

/**
 * Intent Component: The declarative entry point for Protocol-Oriented Authority (POA).
 * 
 * Instead of hard-wiring components or using generic Slots, we express an "Intent".
 * The Intent is fulfilled by a "Vow" registered in the ProtocolRegistry.
 * 
 * Example:
 * <Intent name="institutional.briefing" props={{ schoolId: '123' }} />
 */
export function Intent<P = any>({ intent, props, resource, fallback }: IntentProps<P>) {
  const { ability, context: permissionContext } = usePermissions();
  const { schoolId: currentSchoolId } = useTenantContext();
  
  const context: UserContext = {
    ...permissionContext,
    schoolId: (resource?.schoolId || permissionContext.schoolId || currentSchoolId || '') as string,
    sectionId: (resource?.sectionId || permissionContext.sectionId) as string | undefined,
    gradeId: (resource?.gradeId || permissionContext.gradeId) as string | undefined,
    classroomId: (resource?.classroomId || permissionContext.classroomId) as string | undefined,
  };

  const vow = protocolRegistry.resolve<P>(intent, context, resource, ability);

  if (!vow) {
    return <>{fallback || null}</>;
  }

  const Component = vow.component;
  return <Component {...(props as any)} />;
}
