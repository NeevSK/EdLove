export type StudentWorkspaceView =
  | 'main'
  | 'assignment_queue'
  | 'goals'
  | 'grades'
  | 'progress'
  | 'rewards'
  | 'timetable';

export type StudentZoneId = 'today' | 'work' | 'outlook' | 'private';

export type StudentFeatureScope =
  | 'academic_work'
  | 'learning_navigation'
  | 'personal_academic'
  | 'community_bridge';

export type StudentModuleStatus = 'live' | 'planned' | 'hidden';

export type StudentFeatureCadence = 'daily' | 'weekly' | 'periodic' | 'horizon';

export type StudentCapabilityId =
  | 'temporal_context'
  | 'learning_shortcuts'
  | 'learning_pulse'
  | 'sanctuary_registry'
  | 'assignment_queue'
  | 'growth_goals'
  | 'rewards_pulse'
  | 'growth_progress'
  | 'timetable'
  | 'attendance_history'
  | 'grades_overview'
  | 'reflection_bridge';

export interface StudentFeatureScopeMeta {
  scope: StudentFeatureScope;
  scopeBadgeLabelKey: string;
  scopeHelpTextKey: string;
}

export interface StudentCapabilityMeta extends StudentFeatureScopeMeta {
  id: StudentCapabilityId;
  title: string;
  description: string;
  zone: StudentZoneId;
  cadence: StudentFeatureCadence;
  status: StudentModuleStatus;
  workspaceView?: StudentWorkspaceView;
}

function buildScopeMeta(scope: StudentFeatureScope): StudentFeatureScopeMeta {
  if (scope === 'academic_work') {
    return {
      scope,
      scopeBadgeLabelKey: 'student.ia.scope.academicWork',
      scopeHelpTextKey: 'student.ia.help.academicWork'
    };
  }

  if (scope === 'learning_navigation') {
    return {
      scope,
      scopeBadgeLabelKey: 'student.ia.scope.learningNavigation',
      scopeHelpTextKey: 'student.ia.help.learningNavigation'
    };
  }

  if (scope === 'personal_academic') {
    return {
      scope,
      scopeBadgeLabelKey: 'student.ia.scope.personalAcademic',
      scopeHelpTextKey: 'student.ia.help.personalAcademic'
    };
  }

  return {
    scope,
    scopeBadgeLabelKey: 'student.ia.scope.communityBridge',
    scopeHelpTextKey: 'student.ia.help.communityBridge'
  };
}

function defineStudentCapability(
  id: StudentCapabilityId,
  config: Omit<StudentCapabilityMeta, 'id' | 'scopeBadgeLabelKey' | 'scopeHelpTextKey'>,
): StudentCapabilityMeta {
  return {
    id,
    ...config,
    ...buildScopeMeta(config.scope)
  };
}

export const STUDENT_CAPABILITY_REGISTRY: Record<StudentCapabilityId, StudentCapabilityMeta> = {
  temporal_context: defineStudentCapability('temporal_context', {
    title: 'Temporal Context',
    description: 'A lightweight read on the students current learning moment before choosing the next study action.',
    zone: 'today',
    cadence: 'daily',
    scope: 'learning_navigation',
    status: 'live'
  }),
  learning_shortcuts: defineStudentCapability('learning_shortcuts', {
    title: 'Learning Shortcuts',
    description: 'Fast entry points into library, community, timetable, breathing, and adjacent learning tools.',
    zone: 'work',
    cadence: 'daily',
    scope: 'learning_navigation',
    status: 'live'
  }),
  learning_pulse: defineStudentCapability('learning_pulse', {
    title: 'Learning Pulse',
    description: 'High-signal metrics for classes, pending assignments, and study momentum that orient the student without replacing real work.',
    zone: 'today',
    cadence: 'daily',
    scope: 'academic_work',
    status: 'live'
  }),
  sanctuary_registry: defineStudentCapability('sanctuary_registry', {
    title: 'Sanctuary Registry',
    description: 'The list of active classrooms where the student enters lessons, assignments, and classroom participation.',
    zone: 'work',
    cadence: 'daily',
    scope: 'academic_work',
    status: 'live'
  }),
  assignment_queue: defineStudentCapability('assignment_queue', {
    title: 'Assignment Queue',
    description: 'Upcoming submissions and due pressure that should stay visible during active study weeks.',
    zone: 'outlook',
    cadence: 'daily',
    scope: 'academic_work',
    status: 'live',
    workspaceView: 'assignment_queue'
  }),
  growth_goals: defineStudentCapability('growth_goals', {
    title: 'Growth Goals',
    description: 'Private academic commitments such as learning goals and progress targets. This is school work but privately held.',
    zone: 'private',
    cadence: 'weekly',
    scope: 'personal_academic',
    status: 'live',
    workspaceView: 'goals'
  }),
  rewards_pulse: defineStudentCapability('rewards_pulse', {
    title: 'Rewards Pulse',
    description: 'Visible encouragement through points and earned badges that reflect participation and study consistency.',
    zone: 'outlook',
    cadence: 'periodic',
    scope: 'personal_academic',
    status: 'live',
    workspaceView: 'rewards'
  }),
  growth_progress: defineStudentCapability('growth_progress', {
    title: 'Growth Progress',
    description: 'A student-facing academic progress view that reflects momentum without collapsing into pressure or surveillance.',
    zone: 'private',
    cadence: 'weekly',
    scope: 'personal_academic',
    status: 'live',
    workspaceView: 'progress'
  }),
  timetable: defineStudentCapability('timetable', {
    title: 'Timetable',
    description: 'A structured view of class rhythm and daily study schedule for the student.',
    zone: 'work',
    cadence: 'daily',
    scope: 'academic_work',
    status: 'planned',
    workspaceView: 'timetable'
  }),
  attendance_history: defineStudentCapability('attendance_history', {
    title: 'Attendance History',
    description: 'A student-facing read of their own attendance patterns over time.',
    zone: 'outlook',
    cadence: 'periodic',
    scope: 'academic_work',
    status: 'planned'
  }),
  grades_overview: defineStudentCapability('grades_overview', {
    title: 'Grades Overview',
    description: 'A student-facing view of graded submissions and academic standing.',
    zone: 'outlook',
    cadence: 'periodic',
    scope: 'academic_work',
    status: 'live',
    workspaceView: 'grades'
  }),
  reflection_bridge: defineStudentCapability('reflection_bridge', {
    title: 'Reflection Bridge',
    description: 'A bridge from academic work into Self when the student wants reflective or self-regulation support.',
    zone: 'private',
    cadence: 'periodic',
    scope: 'community_bridge',
    status: 'planned'
  })
};

export const STUDENT_FEATURE_SCOPE_MAP: Record<StudentCapabilityId, StudentFeatureScopeMeta> =
  Object.fromEntries(
    Object.entries(STUDENT_CAPABILITY_REGISTRY).map(([featureId, meta]) => [
      featureId,
      {
        scope: meta.scope,
        scopeBadgeLabelKey: meta.scopeBadgeLabelKey,
        scopeHelpTextKey: meta.scopeHelpTextKey
      },
    ]),
  ) as Record<StudentCapabilityId, StudentFeatureScopeMeta>;

export function getStudentFeatureScopeMeta(featureId: string): StudentFeatureScopeMeta | undefined {
  return STUDENT_FEATURE_SCOPE_MAP[featureId as StudentCapabilityId];
}

export function getStudentCapabilityMeta(featureId: string): StudentCapabilityMeta | undefined {
  return STUDENT_CAPABILITY_REGISTRY[featureId as StudentCapabilityId];
}

export function getStudentCapabilitiesByZone(
  zone: StudentZoneId,
  status?: StudentModuleStatus,
): StudentCapabilityMeta[] {
  return Object.values(STUDENT_CAPABILITY_REGISTRY).filter((capability) => {
    if (capability.zone !== zone) return false;
    if (status && capability.status !== status) return false;
    return true;
  });
}

export function getStudentCapabilitiesByCadence(
  cadence: StudentFeatureCadence,
  zone?: StudentZoneId,
): StudentCapabilityMeta[] {
  return Object.values(STUDENT_CAPABILITY_REGISTRY).filter((capability) => {
    if (capability.cadence !== cadence) return false;
    if (zone && capability.zone !== zone) return false;
    return capability.status !== 'hidden';
  });
}

export function resolveStudentWorkspaceView(featureId: string): StudentWorkspaceView {
  const capability = getStudentCapabilityMeta(featureId);
  return capability?.workspaceView ?? 'main';
}

export const STUDENT_FEATURE_SCOPE_MAP: Record<StudentCapabilityId, StudentFeatureScopeMeta> =
  Object.fromEntries(
    Object.entries(STUDENT_CAPABILITY_REGISTRY).map(([featureId, meta]) => [
      featureId,
      {
        scope: meta.scope,
        scopeBadgeLabelKey: meta.scopeBadgeLabelKey,
        scopeHelpTextKey: meta.scopeHelpTextKey},
    ]),
  ) as Record<StudentCapabilityId, StudentFeatureScopeMeta>;

export function getStudentFeatureScopeMeta(featureId: string): StudentFeatureScopeMeta | undefined {
  return STUDENT_FEATURE_SCOPE_MAP[featureId as StudentCapabilityId];
}

export function getStudentCapabilityMeta(featureId: string): StudentCapabilityMeta | undefined {
  return STUDENT_CAPABILITY_REGISTRY[featureId as StudentCapabilityId];
}

export function getStudentCapabilitiesByZone(
  zone: StudentZoneId,
  status?: StudentModuleStatus,
): StudentCapabilityMeta[] {
  return Object.values(STUDENT_CAPABILITY_REGISTRY).filter((capability) => {
    if (capability.zone !== zone) return false;
    if (status && capability.status !== status) return false;
    return true;
  });
}

export function getStudentCapabilitiesByCadence(
  cadence: StudentFeatureCadence,
  zone?: StudentZoneId,
): StudentCapabilityMeta[] {
  return Object.values(STUDENT_CAPABILITY_REGISTRY).filter((capability) => {
    if (capability.cadence !== cadence) return false;
    if (zone && capability.zone !== zone) return false;
    return capability.status !== 'hidden';
  });
}

export function resolveStudentWorkspaceView(featureId: string): StudentWorkspaceView {
  const capability = getStudentCapabilityMeta(featureId);
  return capability?.workspaceView ?? 'main';
}
