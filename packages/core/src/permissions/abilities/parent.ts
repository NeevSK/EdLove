import { AbilityBuilder } from '@casl/ability';
import { UserContext } from '../schemas/user.schema';
import { AppAbility } from './student';

export const defineParentAbilities = (user: UserContext, { can }: AbilityBuilder<AppAbility>) => {
  // Parents see their student's data
  can('read', 'StudentProfile', { parentId: user.userId } as any);
  can('read', 'Attendance', { studentParentId: user.userId } as any);
  can('read', 'Assignment', { studentParentId: user.userId } as any);
  can('read', 'AssignmentSubmission', { studentParentId: user.userId } as any);
  
  can('read', 'School', { id: user.schoolId } as any);
  can('read', 'CommunityFeed');
  can('read', 'LibrarySearch');
  can('manage', 'Library');
  // Note: child-linking logic should be handled by RLS, but CASL provides the boundary
  can('read', 'Student', { guardianIds: { $contains: user.userId } } as any);
  can('read', 'Attendance', { studentId: { $in: ['child_ids_handled_by_rls'] } } as any);
  can('read', 'Assignment', { schoolId: user.schoolId } as any);
  can('read', 'Report', { schoolId: user.schoolId } as any);
  can('create', 'Communication', { type: 'to_teacher' });
};
