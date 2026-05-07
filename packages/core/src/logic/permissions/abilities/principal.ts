import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';

export const definePrincipalAbilities = (
  user: UserContext,
  builder: AbilityBuilder<AppAbility>,
) => {
  const { can } = builder;
  if (!user.school_id) return;

  can('read', 'PrincipalPulse');
  can('read', 'TeacherPulse');
  can('manage', 'PrincipalDashboard');
  can('read', 'ClassroomList');

  // Institutional management
  can('manage', 'School', { id: user.school_id } as any);
  can('manage', 'Classroom', { school_id: user.school_id } as any);
  can('read', 'Lesson', { school_id: user.school_id } as any);
  can('read', 'Material', { school_id: user.school_id } as any);
  can('read', 'Grade');
  can('grade', 'Grade');
  can('manage', 'Student', { school_id: user.school_id } as any);
  can('manage', 'Staff', { school_id: user.school_id } as any);
  can('manage', 'Inventory', { school_id: user.school_id } as any);
  can('read', 'Report', { school_id: user.school_id } as any);

  // Workforce & Leave
  can('manage', 'LeaveApproval');
  can('read', 'WorkforceRoster');
  can('read', 'SchoolForest');
  can('manage', 'SchoolForest');

  // Library POA refinement
  can('read', 'LibrarySearch');
  can('manage', 'Library');
  can('manage', 'LibraryReview');
};
