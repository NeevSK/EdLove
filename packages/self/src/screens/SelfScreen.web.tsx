import { usePermissions } from '@repo/core/logic';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';

import {
  AdminSelfView,
  FounderSelfView,
  GuardianSelfView,
  PrincipalSelfView,
  StudentSelfView,
  TeacherSelfView,
} from '@repo/self/screens/self';
import { resolveSelfViewRole, selfRoleHeader } from '@repo/self/screens/self/roleResolution';

/**
 * SelfScreenWeb declarative entry point for the user's sanctuary on Web.
 * Now capability-driven (POA) instead of registry-intent based.
 */
export default function SelfScreenWeb() {
  const { can, context } = usePermissions();

  const role = resolveSelfViewRole(context.capacity, can);
  const headerDetails = role ? selfRoleHeader(role) : { title: 'Sadhana', note: 'Personal Sanctuary' };

  const renderDashboard = () => {
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
  };

  const { title, note } = headerDetails;

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container">
        <WebScreenHeader title={title} note={note} showPersonalizedGreeting />
        <div style={{ marginTop: 24 }}>{renderDashboard()}</div>
      </div>
    </div>
  );
}
