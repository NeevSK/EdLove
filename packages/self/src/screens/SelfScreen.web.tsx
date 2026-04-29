import { usePermissions } from '@repo/core';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';

import {
  AdminSelfView,
  FounderSelfView,
  GuardianSelfView,
  PrincipalSelfView,
  StudentSelfView,
  TeacherSelfView,
} from './self';

/**
 * SelfScreenWeb declarative entry point for the user's sanctuary on Web.
 * Now capability-driven (POA) instead of registry-intent based.
 */
export default function SelfScreenWeb() {
  const { can, context } = usePermissions();

  const getHeaderDetails = () => {
    if (can('manage', 'StudentDashboard')) {
      return { title: 'Mastery Hub', note: 'Personal Growth Stream' };
    }
    if (context.roles.includes('guardian') || context.roles.includes('parent')) {
      return { title: 'Sadhana', note: 'Guardian Sanctuary' };
    }
    if (can('manage', 'PrincipalDashboard')) {
      return { title: 'Sadhana', note: "Principal's Inner Sanctuary" };
    }
    if (can('manage', 'FounderDashboard')) {
      return { title: 'Sadhana', note: "Founder's Vision Lab" };
    }
    return { title: 'Sadhana', note: 'Personal Growth Stream' };
  };

  const renderDashboard = () => {
    if (can('manage', 'FounderDashboard')) return <FounderSelfView />;
    if (can('manage', 'AdminDashboard')) return <AdminSelfView />;
    if (can('manage', 'PrincipalDashboard')) return <PrincipalSelfView />;
    if (can('manage', 'TeacherDashboard')) return <TeacherSelfView />;
    if (context.roles.includes('guardian') || context.roles.includes('parent'))
      return <GuardianSelfView />;
    if (can('manage', 'StudentDashboard')) return <StudentSelfView />;
    return <StudentSelfView />;
  };

  const { title, note } = getHeaderDetails();

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container">
        <WebScreenHeader title={title} note={note} showPersonalizedGreeting />
        <div style={{ marginTop: 24 }}>{renderDashboard()}</div>
      </div>
    </div>
  );
}
