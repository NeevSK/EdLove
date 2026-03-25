import { AbilityBuilder } from '@casl/ability';
import { UserContext } from '../schemas/user.schema';
import { AppAbility } from './student';

export const defineTeacherAbilities = (user: UserContext, { can }: AbilityBuilder<AppAbility>) => {
  if (!user.schoolId) return;

  can('read', 'TeacherPulse');
  can('manage', 'TeacherDashboard');
  can('read', 'ClassroomList');
  can('read', 'School', { id: user.schoolId } as any);
  
  // Classroom management
  can('read', 'Classroom', { schoolId: user.schoolId } as any);
  can('manage', 'Classroom', { teacherId: user.userId } as any);
  
  // Student oversight
  can('read', 'Student', { schoolId: user.schoolId } as any);
  can('manage', 'Attendance', { classroomTeacherId: user.userId } as any);
  
  // Content creation
  can('create', 'Assignment', { teacherId: user.userId } as any);
  can('manage', 'Assignment', { teacherId: user.userId } as any);
  
  // Resource handling
  can('create', 'ClassroomResource', { ownerId: user.userId } as any);
  can('manage', 'ClassroomResource', { ownerId: user.userId } as any);

  can('create', 'LibraryResource', { ownerId: user.userId } as any);
  can('manage', 'LibraryResource', { ownerId: user.userId } as any);
  
  // Library POA refinement
  can('read', 'LibrarySearch');
  can('manage', 'Library'); // 1st class citizen full access
  can('manage', 'LibraryReview'); // Specialist power
};
