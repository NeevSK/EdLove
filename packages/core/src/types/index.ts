import { APIError } from './API';
import { User } from './User';
import { DeviceMetadata } from './runtime';

export type { Actor, ActorRelationship, ActorType, ContactChannel } from './Actor';
export { APIError };
export type { PaginationParams, PaginatedResponse } from './API';
export type { Assignment } from './Assignment';
export type { AttendanceRecord, AttendanceStatus, StudentAttendance } from './Attendance';
export type { AuthorityTier, PlatformAuthority, SchoolAuthority, WorkCapacity, SchoolRole, WorkRole } from './Authority';
export type { Classroom } from './Classroom';
export type { ClassroomNote } from './ClassroomNote';
export type { 
  Group as CommunityGroup, 
  Group, 
  GroupMember as CommunityMember, 
  GroupMember, 
  Post as CommunityPost, 
  Post,
  GroupMessage,
  CommunityReaction, 
  ThuthimalGift 
} from './Community';
export type { FormFieldConfig, FieldDefinition, FormConfig, FormTemplate, FormResponse } from './Form';
export type { StudentGrade, ClassroomGradingSettings } from './Grade';
export type { StudentGroup } from './Group';
export type { ClassroomResourceCategory, ClassroomResourceCondition, ClassroomResourceItem, InventoryItem, InventoryRequest, InstitutionalAsset, ResourceNeedSummary, ResourceOwnerContext } from './Inventory';
export type { Lesson } from './Lesson';
export type { LessonMaterial } from './LessonMaterial';
export type { MediaAsset, MediaProvider, MediaTransformations } from './Media';
export type {
  ClassroomStackParamList,
  CommunityStackParamList,
  FounderStackParamList,
  FullProfileParams,
  GuardianStackParamList,
  LibraryStackParamList,
  ProfileStackParamList,
  SelfStackParamList,
} from './navigation';
export type { SchoolJoinRequest, ClassroomJoinRequest, GroupReport, RequestStatus } from './Onboarding';
export type { CapabilityKey, CapabilityResource, PolicyDecision } from './Policy';
export type { PrincipalNote } from './PrincipalNote';
export {
  type ClaimInvitePayload,
  type JoinClassPayload,
  type JoinGroupPayload,
  type JoinSchoolPayload,
  QR_VERSION,
  type QRAction,
  type QRPayload,
  type ShareResourcePayload,
  type ThuthimalGiftPayload,
  type UserInvitePayload,
} from './QRPayload';
export type { BaseResource, ClassroomResource, ResourceFormat, ResourceType } from './Resource';
export type { CoreRuntimeEnvironment, DeviceMetadata, StorageProvider } from './runtime';
export type {
  AcademicCycle,
  Announcement,
  Grade as SchoolGradeAlias,
  InviteCode,
  School,
  SchoolGrade,
  SchoolStats,
  Section,
} from './School';
export type { PrivacyLevel, SocialLink, SocialPlatform } from './Social';
export type { StaffAttendance, StaffAttendanceStatus } from './StaffAttendance';
export type { LeaveStatus, LeaveType, StaffLeave } from './StaffLeave';
export type { BulkStudent, Student } from './Student';
export type { Task } from './Task';
export type { TeacherNote } from './TeacherNote';
export type { LongitudinalRecord, TemporalBounds, TemporalPoint } from './Temporal';
export type {
  Membership,
  PlatformAccessContext,
  ScopeRef,
  ScopeType,
  TenantContext,
} from './Tenancy';
export type {
  GraphLink,
  GraphNode,
  KnowledgeTopology,
  LayoutResult,
  LinkRelationship,
  PerspectiveId,
} from './topology';
export type { AuthSession, LoginData, SignUpData, User } from './User';
export type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceOwnerPackage,
  WorkspaceRendererConfig,
  WorkspaceRendererMode,
  WorkspaceRendererPlatform,
  WorkspaceRuntimePlatform,
  WorkspaceSurfaceDefinition,
  WorkspaceZoneId,
} from './Workspace';

// Base types
export type DeviceInfo = DeviceMetadata & { uniqueId: string };
export type AppConfig = { env: string; apiHost: string };
export type AppContext = { user?: User; schoolId?: string };
