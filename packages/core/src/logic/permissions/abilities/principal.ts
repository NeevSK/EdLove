import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../../schemas/user.schema';
import type { AppAbility } from './base';

export const definePrincipalAbilities = (
  user: UserContext,
  builder: AbilityBuilder<AppAbility>,
) => {
  const { can } = builder;
  const schoolId = user.schoolId;

  // HEAL 2026: Core visibility even for Wanderers
  can('read', 'PrincipalPulse');
  can('manage', 'PrincipalDashboard');
  can('manage', 'Wellbeing');
  can('read', 'ClassroomList');
  can('read', 'LibrarySearch');

  if (!schoolId) return;

  can('read', 'TeacherPulse');
  can('read', 'ClassroomList');

  // Institutional management
  can('manage', 'School', { id: schoolId } as any);
  can('manage', 'Classroom', { school_id: schoolId } as any);
  can('read', 'Lesson', { school_id: schoolId } as any);
  can('read', 'Material', { school_id: schoolId } as any);
  can('read', 'Grade');
  can('grade', 'Grade');
  can('manage', 'Student', { school_id: schoolId } as any);
  can('manage', 'Staff', { school_id: schoolId } as any);
  can('manage', 'Inventory', { school_id: schoolId } as any);
  can('read', 'Report', { school_id: schoolId } as any);

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
