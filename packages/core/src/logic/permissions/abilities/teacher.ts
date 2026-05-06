import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';

export const defineTeacherAbilities = (user: UserContext, builder: AbilityBuilder<AppAbility>) => {
  const { can } = builder;
  if (!user.schoolId) return;

  const isActive = user.activeBondStatus === 'active';
  const isArchived = user.activeBondStatus === 'archived';

  // --- CORE VISIBILITY (Shared) ---
  can('read', 'TeacherPulse');
  can('read', 'ClassroomList');
  can('read', 'School', { id: user.schoolId } as any);
  can('read', 'Classroom', { school_id: user.schoolId } as any);
  can('read', 'Lesson', { school_id: user.schoolId } as any);
  can('read', 'Material', { school_id: user.schoolId } as any);

  // --- ACTIVE POWERS (Manage) ---
  if (isActive) {
    can('manage', 'TeacherDashboard');
    can('manage', 'Classroom', { teacher_id: user.userId } as any);
    can('read', 'Grade');
    can('grade', 'Grade');

    // Student oversight
    can('read', 'Student', { school_id: user.schoolId } as any);
    can('manage', 'Attendance', { classroom_teacher_id: user.userId } as any);

    // Content creation
    can('create', 'Assignment', { teacher_id: user.userId } as any);
    can('manage', 'Assignment', { teacher_id: user.userId } as any);

    // Resource handling
    can('create', 'ClassroomResource', { owner_id: user.userId } as any);
    can('manage', 'ClassroomResource', { owner_id: user.userId } as any);
    can('create', 'LibraryResource', { owner_id: user.userId } as any);
    can('manage', 'LibraryResource', { owner_id: user.userId } as any);

    can('manage', 'Library');
    can('manage', 'LibraryReview');
    can('manage', 'Wellbeing');
  }

  // --- ARCHIVED POWERS (History) ---
  if (isArchived) {
    // Archived teachers can only see their past, not change it
    can('read', 'TeachingHistory');
    // They can still read their old materials
    can('read', 'Assignment', { teacher_id: user.userId } as any);
    can('read', 'ClassroomResource', { owner_id: user.userId } as any);
  }
};
