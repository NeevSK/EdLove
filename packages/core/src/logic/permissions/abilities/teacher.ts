import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../..//schemas/user.schema';
import type { AppAbility } from './base';

export const defineTeacherAbilities = (user: UserContext, builder: AbilityBuilder<AppAbility>) => {
  const { can } = builder;
  const schoolId = user.schoolId;
  const userId = user.userId;
  const activeBondStatus = user.activeBond?.status ?? null;

  // HEAL 2026: Teachers should ALWAYS have access to their Pulse and Dashboard
  // even as anonymous Wanderers (Guest Mode).
  can('read', 'TeacherPulse');
  can('manage', 'TeacherDashboard');
  can('manage', 'Wellbeing');
  can('read', 'ClassroomList'); // Global view visibility
  can('read', 'LibrarySearch');

  if (!schoolId) return;

  const isActive = activeBondStatus === 'active';
  const isArchived = activeBondStatus === 'archived';

  // --- CORE VISIBILITY (Shared) ---
  can('read', 'ClassroomList');
  can('read', 'School', { id: schoolId } as any);
  can('read', 'Classroom', { school_id: schoolId } as any);
  can('read', 'Lesson', { school_id: schoolId } as any);
  can('read', 'Material', { school_id: schoolId } as any);

  // --- ACTIVE POWERS (Manage) ---
  if (isActive) {
    can('manage', 'Classroom', { teacher_id: userId } as any);
    can('read', 'Grade');
    can('grade', 'Grade');

    // Student oversight
    can('read', 'Student', { school_id: schoolId } as any);
    can('manage', 'Attendance', { classroom_teacher_id: userId } as any);

    // Content creation
    can('create', 'Assignment', { teacher_id: userId } as any);
    can('manage', 'Assignment', { teacher_id: userId } as any);

    // Resource handling
    can('create', 'ClassroomResource', { owner_id: userId } as any);
    can('manage', 'ClassroomResource', { owner_id: userId } as any);
    can('create', 'LibraryResource', { owner_id: userId } as any);
    can('manage', 'LibraryResource', { owner_id: userId } as any);

    can('manage', 'Library');
    can('manage', 'LibraryReview');
    can('manage', 'Wellbeing');
  }

  // --- ARCHIVED POWERS (History) ---
  if (isArchived) {
    // Archived teachers can only see their past, not change it
    can('read', 'TeachingHistory');
    // They can still read their old materials
    can('read', 'Assignment', { teacher_id: userId } as any);
    can('read', 'ClassroomResource', { owner_id: userId } as any);
  }
};
