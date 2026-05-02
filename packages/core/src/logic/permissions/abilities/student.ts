import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';

export const defineStudentAbilities = (user: UserContext, { can }: AbilityBuilder<AppAbility>) => {
  if (!user.schoolId) return; // 2nd class citizen - handled in composer.ts

  can('read', 'School', { id: user.schoolId } as any);
  can('read', 'Classroom', {
    members: { $elemMatch: { user_id: user.userId } },
  } as any);
  can('read', 'StudentProfile', { user_id: user.userId } as any);
  can('update', 'StudentProfile', { user_id: user.userId } as any);
  can('read', 'StudentPulse');
  can('manage', 'StudentDashboard');
  can('read', 'ClassroomList');
  can('read', 'Lesson', { school_id: user.schoolId } as any);
  can('read', 'Material', { school_id: user.schoolId } as any);
  can('read', 'Grade');
  can('create', 'AssignmentSubmission', { student_id: user.userId } as any);

  // Community & Library access for 1st class citizens
  can('read', 'CommunityFeed');
  can('read', 'CommunityGroups');
  can('read', 'LibrarySearch');
  can('manage', 'Library');
};
