import { AbilityClass, createMongoAbility, MongoAbility } from '@casl/ability';
import { 
    User, 
    Classroom, 
    StudentGrade, 
    Assignment, 
    Lesson, 
    LessonMaterial,
    School,
    AttendanceRecord,
    InventoryItem,
    Group,
    Post,
    GroupMember,
    GroupMessage,
    CommunityReaction,
    ThuthimalGift
} from '../../types';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'submit' | 'send' | 'verify' | 'grade' | 'resolve';

export type Subjects = 
  | 'StudentProfile' 
  | 'TeacherProfile'
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
  | 'AdminDashboard'
  | 'ClassroomList' 
  | 'Classroom' 
  | 'School' 
  | 'Attendance' 
  | 'Staff' 
  | 'Inventory' 
  | 'Report' 
  | 'ClassroomResource' 
  | 'Material'
  | 'Group'
  | 'Post'
  | 'User'
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
  | 'Student'
  | 'Communication'
  | 'LeaveApproval'
  | 'WorkforceRoster'
  | 'Wellbeing'
  | 'Grade'
  | 'ClassroomGradingSettings'
  | 'all';

/**
 * Subject type definitions for conditional checks.
 * This allows us to avoid 'any' in subject conditions.
 */
export type SubjectType = 
    | 'all' 
    | Subjects 
    | User 
    | Classroom 
    | StudentGrade 
    | Assignment 
    | Lesson 
    | LessonMaterial 
    | School
    | AttendanceRecord
    | InventoryItem
    | Group
    | Post
    | GroupMember
    | GroupMessage
    | CommunityReaction
    | ThuthimalGift;

export type AppAbilities = [Actions, SubjectType];
export type AppAbility = MongoAbility<AppAbilities>;

export const AppAbility = createMongoAbility as unknown as AbilityClass<AppAbility>;
