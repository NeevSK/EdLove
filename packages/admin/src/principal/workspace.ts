export type PrincipalWorkspaceView =
  | 'main'
  | 'hierarchy'
  | 'invites'
  | 'notes'
  | 'log'
  | 'cycles'
  | 'attendance_report';

export type PrincipalZoneId = 'today' | 'institution' | 'outlook';

export type PrincipalFeatureScope = 'institutional' | 'classroom' | 'ecology_crosscutting';

export type PrincipalModuleStatus = 'live' | 'planned' | 'hidden';

export type PrincipalCapabilityId =
  | 'setup_runway'
  | 'morning_brief'
  | 'faculty_overview'
  | 'student_pulse'
  | 'pending_approvals'
  | 'institutional_calendar'
  | 'observations'
  | 'relief'
  | 'hierarchy'
  | 'invites'
  | 'log'
  | 'notes'
  | 'cycles'
  | 'school_profile'
  | 'resource_needs'
  | 'ecosystem_resonance'
  | 'open_commons'
  | 'inventory'
  | 'finance'
  | 'accounting'
  | 'reporting'
  | 'circulars'
  | 'documents'
  | 'compliance'
  | 'curriculum_pulse'
  | 'timetable'
  | 'workspace_switcher';

export interface PrincipalFeatureScopeMeta {
  scope: PrincipalFeatureScope;
  scopeBadgeLabelKey: string;
  scopeHelpTextKey: string;
}

export interface PrincipalCapabilityMeta extends PrincipalFeatureScopeMeta {
  id: PrincipalCapabilityId;
  title: string;
  description: string;
  zone: PrincipalZoneId;
  status: PrincipalModuleStatus;
  workspaceView?: PrincipalWorkspaceView;
  atlasFamily?: string;
}

function buildScopeMeta(scope: PrincipalFeatureScope): PrincipalFeatureScopeMeta {
  if (scope === 'institutional') {
    return {
      scope,
      scopeBadgeLabelKey: 'principal.ia.scope.institutional',
      scopeHelpTextKey: 'principal.ia.help.institutional'};
  }

  if (scope === 'classroom') {
    return {
      scope,
      scopeBadgeLabelKey: 'principal.ia.scope.classroom',
      scopeHelpTextKey: 'principal.ia.help.classroom'};
  }

  return {
    scope,
    scopeBadgeLabelKey: 'principal.ia.scope.crossEcosystem',
    scopeHelpTextKey: 'principal.ia.help.crossEcosystem'};
}

function definePrincipalCapability(
  id: PrincipalCapabilityId,
  config: Omit<PrincipalCapabilityMeta, 'id' | 'scopeBadgeLabelKey' | 'scopeHelpTextKey'>,
): PrincipalCapabilityMeta {
  return {
    id,
    ...config,
    ...buildScopeMeta(config.scope)};
}

export const PRINCIPAL_CAPABILITY_REGISTRY: Record<PrincipalCapabilityId, PrincipalCapabilityMeta>  = {
  setup_runway: definePrincipalCapability('setup_runway', {
    title: 'Setup Runway',
    description: 'A launch path for school hierarchy, invitations, cycles, and profile configuration.',
    zone: 'institution',
    scope: 'institutional',
    status: 'live'}),
  morning_brief: definePrincipalCapability('morning_brief', {
    title: 'Morning Brief',
    description: 'A daily situational read on staffing, attendance risk, and approvals that need attention now.',
    zone: 'today',
    scope: 'institutional',
    status: 'live'}),
  faculty_overview: definePrincipalCapability('faculty_overview', {
    title: 'Faculty Overview',
    description: 'Live staff presence and teaching coverage so the principal can see who is available today.',
    zone: 'today',
    scope: 'institutional',
    status: 'live'}),
  student_pulse: definePrincipalCapability('student_pulse', {
    title: 'Student Pulse',
    description: 'Aggregated attendance and at-risk signals that surface classroom health without exposing surveillance detail.',
    zone: 'today',
    scope: 'classroom',
    status: 'live'}),
  pending_approvals: definePrincipalCapability('pending_approvals', {
    title: 'Pending Approvals',
    description: 'A principal sign-off queue for leave requests and other operational approvals.',
    zone: 'today',
    scope: 'institutional',
    status: 'live'}),
  institutional_calendar: definePrincipalCapability('institutional_calendar', {
    title: 'Institutional Calendar',
    description: 'Upcoming events, terms, and dates that shape the school day and near-term schedule.',
    zone: 'today',
    scope: 'institutional',
    status: 'live'}),
  observations: definePrincipalCapability('observations', {
    title: 'Observations',
    description: 'Walkthrough notes and principal observations that support follow-up and leadership memory.',
    zone: 'today',
    scope: 'institutional',
    status: 'live'}),
  relief: definePrincipalCapability('relief', {
    title: 'Relief Management',
    description: 'Coordination space for handling coverage, absences, and operational continuity during the school day.',
    zone: 'today',
    scope: 'institutional',
    status: 'live'}),
  hierarchy: definePrincipalCapability('hierarchy', {
    title: 'Institutional Hierarchy',
    description: 'Grades, sections, and structural organization for the school as an institution.',
    zone: 'institution',
    scope: 'institutional',
    status: 'live',
    workspaceView: 'hierarchy'}),
  invites: definePrincipalCapability('invites', {
    title: 'Governance Invites',
    description: 'Invite teachers and leadership roles into the school with official role-aware onboarding.',
    zone: 'institution',
    scope: 'institutional',
    status: 'live',
    workspaceView: 'invites'}),
  log: definePrincipalCapability('log', {
    title: 'Institutional Logbook',
    description: 'Official notes, observations, and leadership memory for the school.',
    zone: 'institution',
    scope: 'institutional',
    status: 'live',
    workspaceView: 'log'}),
  notes: definePrincipalCapability('notes', {
    title: 'Principal Notes',
    description: 'Private working notes and decisions for the principals daily institutional practice.',
    zone: 'institution',
    scope: 'institutional',
    status: 'live',
    workspaceView: 'notes'}),
  cycles: definePrincipalCapability('cycles', {
    title: 'Academic Cycles',
    description: 'Terms, semesters, and institutional academic periods used to govern the school year.',
    zone: 'institution',
    scope: 'institutional',
    status: 'live',
    workspaceView: 'cycles'}),
  school_profile: definePrincipalCapability('school_profile', {
    title: 'School Profile',
    description: 'The institutions core identity, profile, and public-facing structure.',
    zone: 'institution',
    scope: 'institutional',
    status: 'live'}),
  resource_needs: definePrincipalCapability('resource_needs', {
    title: 'Resource Needs',
    description: 'Aggregated classroom and staff requests that reveal resource pressure across the institution.',
    zone: 'outlook',
    scope: 'classroom',
    status: 'live'}),
  ecosystem_resonance: definePrincipalCapability('ecosystem_resonance', {
    title: 'Ecosystem Resonance',
    description: 'Community health and qualitative echo signals that help the principal read the school climate.',
    zone: 'outlook',
    scope: 'ecology_crosscutting',
    status: 'live'}),
  open_commons: definePrincipalCapability('open_commons', {
    title: 'Community Commons',
    description: 'The schools community and mission-facing commons for communication and culture stewardship.',
    zone: 'outlook',
    scope: 'ecology_crosscutting',
    status: 'live'}),
  inventory: definePrincipalCapability('inventory', {
    title: 'Inventory',
    description: 'Future ERP family for institutional stock, assets, supplies, and maintenance visibility.',
    zone: 'outlook',
    scope: 'institutional',
    status: 'planned',
    atlasFamily: 'Operations ERP'}),
  finance: definePrincipalCapability('finance', {
    title: 'Finance',
    description: 'Future ERP family for school finance views, budgets, and principal-level financial awareness.',
    zone: 'outlook',
    scope: 'institutional',
    status: 'planned',
    atlasFamily: 'Finance ERP'}),
  accounting: definePrincipalCapability('accounting', {
    title: 'Accounting',
    description: 'Future ERP family for entries, reconciliation, and the formal accounting layer of the institution.',
    zone: 'outlook',
    scope: 'institutional',
    status: 'planned',
    atlasFamily: 'Finance ERP'}),
  reporting: definePrincipalCapability('reporting', {
    title: 'Reporting',
    description: 'Future ERP family for school reporting, exports, dashboards, and periodic operational reports.',
    zone: 'outlook',
    scope: 'institutional',
    status: 'planned',
    atlasFamily: 'Governance ERP'}),
  circulars: definePrincipalCapability('circulars', {
    title: 'Circulars',
    description: 'Future official workflow for circulars, notices, and school-wide institutional communication.',
    zone: 'outlook',
    scope: 'institutional',
    status: 'planned',
    atlasFamily: 'Governance ERP'}),
  documents: definePrincipalCapability('documents', {
    title: 'Documents',
    description: 'Future official artifact family for forms, letters, and principal document workflows.',
    zone: 'outlook',
    scope: 'institutional',
    status: 'planned',
    atlasFamily: 'Governance ERP'}),
  compliance: definePrincipalCapability('compliance', {
    title: 'Compliance',
    description: 'Future governance layer for policy tracking, compliance checks, and institutional obligations.',
    zone: 'outlook',
    scope: 'institutional',
    status: 'planned',
    atlasFamily: 'Governance ERP'}),
  curriculum_pulse: definePrincipalCapability('curriculum_pulse', {
    title: 'Curriculum Pulse',
    description: 'Future strategic lens on curriculum progress and grade-level learning trends.',
    zone: 'outlook',
    scope: 'classroom',
    status: 'planned',
    atlasFamily: 'Learning Outlook'}),
  timetable: definePrincipalCapability('timetable', {
    title: 'Timetable',
    description: 'Future planning surface for annual scheduling, timetable completion, and AI-assisted drafting.',
    zone: 'outlook',
    scope: 'institutional',
    status: 'planned',
    atlasFamily: 'Operations ERP'}),
  workspace_switcher: definePrincipalCapability('workspace_switcher', {
    title: 'Workspace Switcher',
    description: 'Switch between different institutional roles and workspaces.',
    zone: 'institution',
    scope: 'institutional',
    status: 'live'})};

export const PRINCIPAL_FEATURE_SCOPE_MAP: Record<PrincipalCapabilityId, PrincipalFeatureScopeMeta> =
  Object.fromEntries(
    Object.entries(PRINCIPAL_CAPABILITY_REGISTRY).map(([featureId, meta]) => [
      featureId,
      {
        scope: meta.scope,
        scopeBadgeLabelKey: meta.scopeBadgeLabelKey,
        scopeHelpTextKey: meta.scopeHelpTextKey}]),
  ) as Record<PrincipalCapabilityId, PrincipalFeatureScopeMeta>;

export function getPrincipalFeatureScopeMeta(featureId: string): PrincipalFeatureScopeMeta | undefined {
  return PRINCIPAL_FEATURE_SCOPE_MAP[featureId as PrincipalCapabilityId];
}

export function getPrincipalCapabilityMeta(featureId: string): PrincipalCapabilityMeta | undefined {
  return PRINCIPAL_CAPABILITY_REGISTRY[featureId as PrincipalCapabilityId];
}

export function getPrincipalCapabilitiesByZone(
  zone: PrincipalZoneId,
  status?: PrincipalModuleStatus,
): PrincipalCapabilityMeta[] {
  return Object.values(PRINCIPAL_CAPABILITY_REGISTRY).filter((capability) => {
    if (capability.zone !== zone) return false;
    if (status && capability.status !== status) return false;
    return true;
  });
}

export const LEAVE_STATUS_COLORS: Record<string, string>  = {
  pending: 'var(--amber-glow)',
  approved: 'var(--moss)',
  rejected: 'var(--ember)'};

export const PRESENCE_STATUS_COLORS: Record<string, string>  = {
  present: 'var(--moss)',
  absent: 'var(--ember)',
  on_leave: 'var(--amber-glow)',
  late: 'var(--water)',
  half_day: 'var(--lotus)'};

export function resolvePrincipalWorkspaceView(featureId: string): PrincipalWorkspaceView {
  const capability = getPrincipalCapabilityMeta(featureId);
  if (capability?.workspaceView === 'notes') return 'notes';
  if (capability?.workspaceView) return capability.workspaceView;
  if (featureId === 'log' || featureId === 'notes') return 'log';
  return 'main';
}
