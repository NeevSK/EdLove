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

  const role = context.capacity;

  if (can('manage', 'FounderDashboard')) {
    return <FounderSelfView />;
  }

  if (can('manage', 'AdminDashboard')) {
    return <AdminSelfView />;
  }

  if (can('manage', 'PrincipalDashboard')) {
    return <PrincipalSelfView />;
  }

  if (can('manage', 'TeacherDashboard') || role === 'teacher') {
    return <TeacherSelfView />;
  }

  if (role === 'guardian' || role === 'parent') {
    return <GuardianSelfView />;
  }

  if (can('manage', 'StudentDashboard') || role === 'student') {
    return <StudentSelfView />;
  }

  return <StudentSelfView />;
}
