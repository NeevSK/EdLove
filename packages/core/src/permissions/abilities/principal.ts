import { AbilityBuilder } from '@casl/ability';
import { UserContext } from '../schemas/user.schema';
import { AppAbility } from './student';

export const definePrincipalAbilities = (user: UserContext, { can }: AbilityBuilder<AppAbility>) => {
  if (!user.schoolId) return;

  can('read', 'PrincipalPulse');
  can('read', 'TeacherPulse');
  can('manage', 'PrincipalDashboard');
  can('read', 'ClassroomList');
  
  // Institutional management
  can('manage', 'School', { id: user.schoolId } as any);
  can('manage', 'Classroom', { schoolId: user.schoolId } as any);
  can('manage', 'Student', { schoolId: user.schoolId } as any);
  can('manage', 'Staff', { schoolId: user.schoolId } as any);
  can('manage', 'Inventory', { schoolId: user.schoolId } as any);
  can('read', 'Report', { schoolId: user.schoolId } as any);

  // Workforce & Leave
  can('manage', 'LeaveApproval');
  can('read', 'WorkforceRoster');

  // Library POA refinement
  can('read', 'LibrarySearch');
  can('manage', 'Library');
  can('manage', 'LibraryReview');
};
