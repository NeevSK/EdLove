import { APIError } from './API';
import type { DeviceMetadata } from './runtime';
import type { User } from './User';

export type {
  AcademicCycleLeadershipAssignment,
  AcademicCycleLeadershipRole,
  AttendanceSession,
  AttendanceSessionKind,
  DailyAttendance,
  DailyAttendanceStatus,
  GradeClassSubject,
} from './AcademicLifecycle';
export type {
  Actor,
  ActorRelationship,
  ActorType,
  ContactChannel,
} from './Actor';
export type { PaginatedResponse, PaginationParams } from './API';
export type { Assignment } from './Assignment';
export type {
  AttendanceRecord,
  AttendanceStatus,
  StudentAttendance,
} from './Attendance';
export type { AuthorityTier, Capacity } from './Authority';
export type { Classroom, ClassroomStudent, StudentAcademicRecord } from './Classroom';
export type { ClassroomNote } from './ClassroomNote';
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
} from './Community';
export type {
  FieldDefinition,
  FormConfig,
  FormFieldConfig,
  FormResponse,
  FormTemplate,
} from './Form';
export type { ClassroomGradingSettings, StudentGrade } from './Grade';
export type {
  AcademicCycleContract,
  GradeClass,
  GradeClassTeacherAssignment,
  GradeLevel,
  GradeMark,
  GradeMarkPublicationState,
  Term,
} from './GradeDomain';
export type { StudentGroup } from './Group';
export type { Bond, Perspective } from './Identity';
export type {
  FieldAnalytics,
  InstitutionalAsset,
  InventoryCategory,
  InventoryCondition,
  InventoryItem,
  InventoryRequest,
  ResourceNeedSummary,
  ResourceOwnerContext,
} from './Inventory';
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
export type {
  ClassroomJoinRequest,
  RequestStatus,
  SchoolJoinRequest,
} from './Onboarding';
export type {
  CapabilityKey,
  CapabilityResource,
  PolicyDecision,
} from './Policy';
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
export type {
  BaseResource,
  ClassroomResource,
  ResourceFormat,
  ResourceType,
} from './Resource';
export type {
  CoreRuntimeEnvironment,
  DeviceMetadata,
  StorageProvider,
} from './runtime';
export {
  BackgroundTaskResult,
  BackgroundTaskStatus,
} from './runtime';
export type {
  AcademicCycle,
  Announcement,
  EduSchool,
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
export type {
  LongitudinalRecord,
  TemporalBounds,
  TemporalPoint,
} from './Temporal';
export type {
  Membership,
  PlatformAccessContext,
  ScopeRef,
  ScopeType,
  TenantContext,
} from './Tenancy';
export type { ThuthimalGift } from './Thuthimal';
export type {
  GraphLink,
  GraphNode,
  KnowledgeTopology,
  LayoutResult,
  LinkRelationship,
  MappingTopologyZod,
  PerspectiveId,
  PulseMetricsZod,
} from './topology';
export type { AuthSession, LoginData, ProfileStats, SignUpData, User } from './User';
export type {
  PerspectiveRenderer,
  PerspectiveViewProps,
} from './visualization';
export type {
  DomainTemporalHorizon,
  DomainWorkbenchState,
  TaskTemporalBinding,
  TemporalAnchor,
  TemporalIntent,
  WorkbenchDomain,
  WorkbenchRestorationSnapshot,
  WorkbenchTaskCreation,
  WorkbenchTaskDescriptor,
  WorkbenchTaskDescriptorIssue,
  WorkbenchTaskInput,
  WorkbenchTaskLocalStatePolicy,
  WorkbenchTaskResource,
} from './Workbench';
export type {
  DomainFeature,
  FeatureJourneySpec,
  FeatureLifecycleStage,
  FloorWallpaperConfig,
  ResolvedWorkspaceSurface,
  ScreenSequenceStep,
  SensoryFeedbackProfile,
  WallpaperPlaybackMode,
  WorkspaceAppearance,
  WorkspaceAppearanceMotion,
  WorkspaceAppearancePreset,
  WorkspaceLayout,
  WorkspaceOwnerPackage,
  WorkspaceRendererConfig,
  WorkspaceRendererMode,
  WorkspaceRendererPlatform,
  WorkspaceRolePersona,
  WorkspaceRuntimePlatform,
  WorkspaceSurfaceDefinition,
  WorkspaceSwitcherDestination,
  WorkspaceSwitcherTarget,
  WorkspaceSwitcherTargetId,
  WorkspaceWallpaper,
  WorkspaceZoneId,
} from './Workspace';
export { APIError };

// Base types
export type DeviceInfo = DeviceMetadata & { uniqueId: string };
export type AppConfig = { env: string; apiHost: string };
export type AppContext = { user?: User; schoolId?: string };
export * from './Growth';
export type { AppNotification, NotificationStatus } from './notifications';
export * from './Perspective';
export * from './EducationalEconomics';
export * from './FlowDAG';
