import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';

export const defineStudentAbilities = (user: UserContext, { can }: AbilityBuilder<AppAbility>) => {
  const schoolId = user.schoolId;
  const userId = user.userId;
  const activeBondStatus = user.activeBond?.status ?? null;

  // HEAL 2026: Student sanctuary access for Wanderers
  can('read', 'StudentPulse');
  can('manage', 'StudentDashboard');
  can('manage', 'Wellbeing');

  if (!schoolId) return;

  const isActive = activeBondStatus === 'active';
  const isArchived = activeBondStatus === 'archived';

  // --- CORE VISIBILITY (Shared) ---
  can('read', 'School', { id: schoolId } as any);
  can('read', 'StudentProfile', { user_id: userId } as any);

  // --- ACTIVE POWERS ---
  if (isActive) {
    can('read', 'Classroom', {
      members: { $elemMatch: { user_id: userId } },
    } as any);
    can('update', 'StudentProfile', { user_id: userId } as any);
    can('read', 'StudentPulse');
    can('manage', 'StudentDashboard');
    can('read', 'ClassroomList');
    can('read', 'Lesson', { school_id: schoolId } as any);
    can('read', 'Material', { school_id: schoolId } as any);
    can('read', 'Grade');
    can('create', 'AssignmentSubmission', { student_id: userId } as any);

    // Community & Library access
    can('read', 'CommunityFeed');
    can('read', 'CommunityGroups');
    can('read', 'LibrarySearch');
    can('manage', 'Library');
  }

  // --- ARCHIVED POWERS (History) ---
  if (isArchived) {
    // Archived students can only see their past record at this school
    can('read', 'AcademicHistory');
    can('read', 'StudentAcademicRecord', {
      student_id: userId,
      school_id: schoolId,
    } as any);
  }
};
