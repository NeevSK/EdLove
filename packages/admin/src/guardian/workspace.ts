export type GuardianWorkspaceView = 'main';

export type GuardianZoneId = 'today' | 'work' | 'institution' | 'outlook' | 'private';

export type GuardianFeatureScope = 'family' | 'student_linked' | 'school_bridge';

export type GuardianModuleStatus = 'live' | 'planned' | 'hidden';

export type GuardianFeatureCadence = 'daily' | 'weekly' | 'periodic' | 'horizon';

export type GuardianCapabilityId =
  | 'workspace_switcher'
  | 'family_snapshot'
  | 'children'
  | 'attendance_watch'
  | 'learning_pulse'
  | 'school_feed'
  | 'upcoming_events'
  | 'communication_bridge'
  | 'visibility_boundaries';

export interface GuardianCapabilityMeta {
  id: GuardianCapabilityId;
  title: string;
  description: string;
  zone: GuardianZoneId;
  cadence: GuardianFeatureCadence;
  scope: GuardianFeatureScope;
  status: GuardianModuleStatus;
  workspaceView?: GuardianWorkspaceView;
}

function defineGuardianCapability(
  id: GuardianCapabilityId,
  config: Omit<GuardianCapabilityMeta, 'id'>,
): GuardianCapabilityMeta {
  return {
    id,
    ...config,
  };
}

export const GUARDIAN_CAPABILITY_REGISTRY: Record<GuardianCapabilityId, GuardianCapabilityMeta> = {
  workspace_switcher: defineGuardianCapability('workspace_switcher', {
    title: 'Workspace Switcher',
    description:
      'Some guardians also carry founder, principal, teacher, or student responsibilities and need a clean handoff across workspaces.',
    zone: 'institution',
    cadence: 'daily',
    scope: 'school_bridge',
    status: 'live',
  }),
  family_snapshot: defineGuardianCapability('family_snapshot', {
    title: 'Family Snapshot',
    description:
      'A warm orientation layer that shows how many children are linked, what needs attention today, and where the school-family bridge is active.',
    zone: 'today',
    cadence: 'daily',
    scope: 'family',
    status: 'live',
  }),
  children: defineGuardianCapability('children', {
    title: 'Children',
    description:
      'Linked learners with enough daily context to move from care into action without exposing unnecessary school internals.',
    zone: 'work',
    cadence: 'daily',
    scope: 'student_linked',
    status: 'live',
  }),
  attendance_watch: defineGuardianCapability('attendance_watch', {
    title: 'Attendance Watch',
    description:
      'A lightweight family-facing view of presence, absence, and lateness, so school attendance becomes a shared rhythm.',
    zone: 'today',
    cadence: 'daily',
    scope: 'student_linked',
    status: 'live',
  }),
  learning_pulse: defineGuardianCapability('learning_pulse', {
    title: 'Learning Pulse',
    description:
      'Recent grades and upcoming assignments translated into a guardian-friendly pulse rather than a full academic control room.',
    zone: 'work',
    cadence: 'weekly',
    scope: 'student_linked',
    status: 'live',
  }),
  school_feed: defineGuardianCapability('school_feed', {
    title: 'School Feed',
    description:
      'Announcements, notices, and family-facing signals from the school held in one place instead of scattered channels.',
    zone: 'today',
    cadence: 'daily',
    scope: 'school_bridge',
    status: 'live',
  }),
  upcoming_events: defineGuardianCapability('upcoming_events', {
    title: 'Upcoming Events',
    description:
      'School events that families need to plan around, from meetings and cultural moments to academic checkpoints.',
    zone: 'outlook',
    cadence: 'periodic',
    scope: 'school_bridge',
    status: 'live',
  }),
  communication_bridge: defineGuardianCapability('communication_bridge', {
    title: 'Communication Bridge',
    description:
      'A guided bridge into community and school channels, so families can stay connected without hunting through the product.',
    zone: 'institution',
    cadence: 'periodic',
    scope: 'school_bridge',
    status: 'live',
  }),
  visibility_boundaries: defineGuardianCapability('visibility_boundaries', {
    title: 'Visibility Boundaries',
    description:
      'A quiet reminder that the guardian workspace is intentionally scoped around linked children and family-safe visibility.',
    zone: 'private',
    cadence: 'horizon',
    scope: 'family',
    status: 'live',
  }),
};

export function getGuardianCapabilityMeta(featureId: string): GuardianCapabilityMeta | undefined {
  return GUARDIAN_CAPABILITY_REGISTRY[featureId as GuardianCapabilityId];
}
