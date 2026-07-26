import { APIError } from '@/types/API';
import type { DeviceMetadata } from '@/types/runtime';
import type { User } from '@/types/User';

export type {
  Actor,
  ActorRelationship,
  ActorType,
  ContactChannel,
} from '@/types/Actor';
export type { PaginatedResponse, PaginationParams } from '@/types/API';
export type { Assignment } from '@/types/Assignment';
export type {
  AttendanceRecord,
  AttendanceStatus,
  StudentAttendance,
} from '@/types/Attendance';
export type { AuthorityTier, Capacity } from '@/types/Authority';
export type { Classroom, ClassroomStudent, StudentAcademicRecord } from '@/types/Classroom';
export type { ClassroomNote } from '@/types/ClassroomNote';
export type {
  AnnouncementWithAuthor,
  Comment,
  CommunityGroup,
  CommunityPost,
  CommunityReaction,
  DirectConversation,
  DirectMessage,
  FeedbackStatus,
  Group,
  GroupJoinPolicy,
  GroupJoinRequest,
  GroupMember,
  GroupMessage,
  GroupReport,
  GroupType,
  ManifestoStatus,
  PollData,
  PollOption,
  PollStatus,
  Post,
  PostType,
  PostVisibility,
  ReportContentInput,
  ReportStatus,
  SanctuaryGroup,
  Urgency,
} from '@/types/Community';
export type {
  FieldDefinition,
  FormConfig,
  FormFieldConfig,
  FormResponse,
  FormTemplate,
} from '@/types/Form';
export type { ClassroomGradingSettings, StudentGrade } from '@/types/Grade';
export type { StudentGroup } from '@/types/Group';
export type { Bond, Perspective } from '@/types/Identity';
export type {
  FieldAnalytics,
  InstitutionalAsset,
  InventoryCategory,
  InventoryCondition,
  InventoryItem,
  InventoryRequest,
  ResourceNeedSummary,
  ResourceOwnerContext,
} from '@/types/Inventory';
export type { Lesson } from '@/types/Lesson';
export type { LessonMaterial } from '@/types/LessonMaterial';
export type { MediaAsset, MediaProvider, MediaTransformations } from '@/types/Media';
export type {
  ClassroomStackParamList,
  CommunityStackParamList,
  FounderStackParamList,
  FullProfileParams,
  GuardianStackParamList,
  LibraryStackParamList,
  ProfileStackParamList,
  SelfStackParamList,
} from '@/types/navigation';
export type {
  ClassroomJoinRequest,
  RequestStatus,
  SchoolJoinRequest,
} from '@/types/Onboarding';
export type {
  CapabilityKey,
  CapabilityResource,
  PolicyDecision,
} from '@/types/Policy';
export type { PrincipalNote } from '@/types/PrincipalNote';
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
} from '@/types/QRPayload';
export type {
  BaseResource,
  ClassroomResource,
  ResourceFormat,
  ResourceType,
} from '@/types/Resource';
export type {
  CoreRuntimeEnvironment,
  DeviceMetadata,
  StorageProvider,
} from '@/types/runtime';
export {
  BackgroundTaskResult,
  BackgroundTaskStatus,
} from '@/types/runtime';
export type {
  AcademicCycle,
  Announcement,
  Grade as SchoolGradeAlias,
  InviteCode,
  School,
  SchoolGrade,
  SchoolStats,
  Section,
} from '@/types/School';
export type { PrivacyLevel, SocialLink, SocialPlatform } from '@/types/Social';
export type { StaffAttendance, StaffAttendanceStatus } from '@/types/StaffAttendance';
export type { LeaveStatus, LeaveType, StaffLeave } from '@/types/StaffLeave';
export type { BulkStudent, Student } from '@/types/Student';
export type { Task } from '@/types/Task';
export type { TeacherNote } from '@/types/TeacherNote';
export type {
  LongitudinalRecord,
  TemporalBounds,
  TemporalPoint,
} from '@/types/Temporal';
export type {
  Membership,
  PlatformAccessContext,
  ScopeRef,
  ScopeType,
  TenantContext,
} from '@/types/Tenancy';
export type { ThuthimalGift } from '@/types/Thuthimal';
export type {
  GraphLink,
  GraphNode,
  KnowledgeTopology,
  LayoutResult,
  LinkRelationship,
  MappingTopologyZod,
  PerspectiveId,
  PulseMetricsZod,
} from '@/types/topology';
export type { AuthSession, LoginData, ProfileStats, SignUpData, User } from '@/types/User';
export type {
  PerspectiveRenderer,
  PerspectiveViewProps,
} from '@/types/visualization';
export type {
  DomainFeature,
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceOwnerPackage,
  WorkspaceRendererConfig,
  WorkspaceRendererMode,
  WorkspaceRendererPlatform,
  WorkspaceRuntimePlatform,
  WorkspaceSurfaceDefinition,
  WorkspaceSwitcherDestination,
  WorkspaceSwitcherTarget,
  WorkspaceSwitcherTargetId,
  WorkspaceZoneId,
} from '@/types/Workspace';
export { APIError };

// Base types
export type DeviceInfo = DeviceMetadata & { uniqueId: string };
export type AppConfig = { env: string; apiHost: string };
export type AppContext = { user?: User; schoolId?: string };
export * from '@/types/Growth';
export type { AppNotification, NotificationStatus } from '@/types/notifications';
