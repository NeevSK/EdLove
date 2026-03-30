import { AbilityBuilder } from '@casl/ability';
import { UserContext } from '../schemas/user.schema';
import { AppAbility } from './base';

export const defineTeacherAbilities = (user: UserContext, builder: AbilityBuilder<AppAbility>) => {
  const { can } = builder;
  if (!user.schoolId) return;

  can('read', 'TeacherPulse');
  can('manage', 'TeacherDashboard');
  can('read', 'ClassroomList');
  can('read', 'School', { id: user.schoolId } as any);
  
  // Classroom management
  can('read', 'Classroom', { school_id: user.schoolId } as any);
  can('manage', 'Classroom', { teacher_id: user.userId } as any);
  can('read', 'Lesson', { school_id: user.schoolId } as any);
  can('read', 'Material', { school_id: user.schoolId } as any);
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
  
  // Library POA refinement
  can('read', 'LibrarySearch');
  can('manage', 'Library'); // 1st class citizen full access
  can('manage', 'LibraryReview'); // Specialist power
  
  // Wellbeing
  can('manage', 'Wellbeing');
};
