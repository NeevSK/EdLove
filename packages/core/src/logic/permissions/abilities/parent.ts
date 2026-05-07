import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';

export const defineParentAbilities = (user: UserContext, builder: AbilityBuilder<AppAbility>) => {
  const { can } = builder;
  // Parents see their student's data
  can('read', 'StudentProfile', { parent_id: user.user_id } as any);
  can('read', 'Attendance', { student_parent_id: user.user_id } as any);
  can('read', 'Assignment', { student_parent_id: user.user_id } as any);
  can('read', 'AssignmentSubmission', { student_parent_id: user.user_id } as any);
  can('read', 'Grade');

  can('read', 'School', { id: user.school_id } as any);
  can('read', 'CommunityFeed');
  can('read', 'LibrarySearch');
  can('manage', 'Library');
  // Note: child-linking logic should be handled by RLS, but CASL provides the boundary
  can('read', 'Student', { guardian_ids: { $contains: user.user_id } } as any);
  can('read', 'Attendance', {
    student_id: { $in: ['child_ids_handled_by_rls'] },
  } as any);
  can('read', 'Assignment', { school_id: user.school_id } as any);
  can('read', 'Report', { school_id: user.school_id } as any);
  can('create', 'Communication', { type: 'to_teacher' });
};
