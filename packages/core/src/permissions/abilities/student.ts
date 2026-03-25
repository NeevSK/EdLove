import { Ability, AbilityBuilder } from '@casl/ability';
import { UserContext } from '../schemas/user.schema';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'submit' | 'send';
export type Subjects = 
  | 'StudentProfile' 
  | 'Lesson' 
  | 'Assignment' 
  | 'AssignmentSubmission' 
  | 'PublicLibrary' 
  | 'CommunityFeed' 
  | 'CommunityPost'
  | 'CommunityGroups' 
  | 'CommunityGroup'
  | 'DirectMessages' 
  | 'DirectMessage'
  | 'Thuthimal'
  | 'Ecosystem'
  | 'LibraryCuratorDashboard' 
  | 'FounderDashboard' 
  | 'PrincipalDashboard' 
  | 'TeacherDashboard' 
  | 'StudentDashboard' 
  | 'GradeHeadDashboard'
  | 'SectionHeadDashboard'
  | 'AssistantPrincipalDashboard'
  | 'ClassroomList' 
  | 'Classroom' 
  | 'School' 
  | 'Attendance' 
  | 'Staff' 
  | 'Inventory' 
  | 'Report' 
  | 'ClassroomResource' 
  | 'StudentPulse' 
  | 'TeacherPulse' 
  | 'PrincipalPulse' 
  | 'FounderPulse' 
  | 'AdminPulse' 
  | 'AIAssistantScale'
  | 'SchoolForest'
  | 'HealthRecords' 
  | 'Library' 
  | 'LibraryResource' 
  | 'LibrarySearch'
  | 'LibraryReview'
  | 'Announcement'
  | 'all';

export type AppAbilities = [Actions, Subjects | any];
export type AppAbility = Ability<AppAbilities>;

export const defineStudentAbilities = (user: UserContext, { can }: AbilityBuilder<AppAbility>) => {
  if (!user.schoolId) return; // 2nd class citizen - handled in composer.ts

  can('read', 'School', { id: user.schoolId } as any);
  can('read', 'Classroom', { members: { $elemMatch: { userId: user.userId } } } as any);
  can('read', 'StudentProfile', { userId: user.userId } as any);
  can('read', 'StudentPulse');
  can('manage', 'StudentDashboard');
  can('read', 'ClassroomList');
  can('read', 'Lesson', { schoolId: user.schoolId } as any);
  can('create', 'AssignmentSubmission', { studentId: user.userId } as any);
  
  // Community & Library access for 1st class citizens
  can('read', 'CommunityFeed');
  can('read', 'CommunityGroups');
  can('read', 'LibrarySearch');
  can('manage', 'Library');
};
