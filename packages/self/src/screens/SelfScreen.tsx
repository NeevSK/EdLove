import { useTracking } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';

import { useEffect } from 'react';
import {
  AdminSelfView,
  FounderSelfView,
  GuardianSelfView,
  PrincipalSelfView,
  StudentSelfView,
  TeacherSelfView,
} from '@repo/self/screens/self';
import { resolveSelfViewRole } from '@repo/self/screens/self/roleResolution';

/**
 * SelfScreen  declarative entry point for the user's sanctuary.
 * Capability-driven (POA) instead of registry-intent based.
 */
export default function SelfScreen() {
  const { discoverFeature } = useTracking();
  const { can, context } = usePermissions();

  useEffect(() => {
    void discoverFeature('section_self');
  }, [discoverFeature]);

  const role = resolveSelfViewRole(context.capacity, can);

  switch (role) {
    case 'admin':
      return <AdminSelfView />;
    case 'founder':
      return <FounderSelfView />;
    case 'principal':
      return <PrincipalSelfView />;
    case 'teacher':
      return <TeacherSelfView />;
    case 'guardian':
      return <GuardianSelfView />;
    case 'student':
      return <StudentSelfView />;
    default:
      return <StudentSelfView />;
  }
}
