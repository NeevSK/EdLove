import { usePermissions } from '@repo/core/logic';
import { useTracking } from '@repo/core/hooks';

import {
  AdminSelfView,
  FounderSelfView,
  PrincipalSelfView,
  StudentSelfView,
  TeacherSelfView,
} from './self';

/**
 * SelfScreen  declarative entry point for the user's sanctuary.
 * Now capability-driven (POA) instead of registry-intent based.
 */
export default function SelfScreen() {
  const { discoverFeature } = useTracking();
  const { can } = usePermissions();

  React.useEffect(() => {
    discoverFeature('section_self');
  }, [discoverFeature]);

  if (can('manage', 'FounderDashboard')) {
    return <FounderSelfView />;
  }

  if (can('manage', 'AdminDashboard')) {
    return <AdminSelfView />;
  }

  if (can('manage', 'PrincipalDashboard')) {
    return <PrincipalSelfView />;
  }

  if (can('manage', 'TeacherDashboard')) {
    return <TeacherSelfView />;
  }

  if (can('manage', 'StudentDashboard')) {
    return <StudentSelfView />;
  }

  // Default or Fallback
  return <StudentSelfView />;
}
