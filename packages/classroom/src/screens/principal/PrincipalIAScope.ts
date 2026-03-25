export type PrincipalFeatureScope = 'institutional' | 'classroom' | 'ecology_crosscutting';

export interface PrincipalFeatureScopeMeta {
  scope: PrincipalFeatureScope;
  scopeBadgeLabelKey: string;
  scopeHelpTextKey: string;
}

function buildScopeMeta(scope: PrincipalFeatureScope): PrincipalFeatureScopeMeta {
  if (scope === 'institutional') {
    return {
      scope,
      scopeBadgeLabelKey: 'principal.ia.scope.institutional',
      scopeHelpTextKey: 'principal.ia.help.institutional',
    };
  }
  if (scope === 'classroom') {
    return {
      scope,
      scopeBadgeLabelKey: 'principal.ia.scope.classroom',
      scopeHelpTextKey: 'principal.ia.help.classroom',
    };
  }
  return {
    scope,
    scopeBadgeLabelKey: 'principal.ia.scope.crossEcosystem',
    scopeHelpTextKey: 'principal.ia.help.crossEcosystem',
  };
}

const SCOPE_DEFINITIONS: Record<string, PrincipalFeatureScope> = {
  morning_brief: 'institutional',
  faculty_overview: 'institutional',
  student_pulse: 'classroom',
  hierarchy: 'institutional',
  inventory: 'institutional',
  invites: 'institutional',
  log: 'institutional',
  cycles: 'institutional',
  pending_approvals: 'institutional',
  relief: 'institutional',
  governance_notes: 'institutional',
  institutional_calendar: 'institutional',
  curriculum_pulse: 'classroom',
  resource_needs: 'classroom',
  ecosystem_resonance: 'ecology_crosscutting',
  open_commons: 'ecology_crosscutting',
  school_profile: 'institutional',
  timetable: 'institutional',
};

export const PRINCIPAL_FEATURE_SCOPE_MAP: Record<string, PrincipalFeatureScopeMeta> = Object.fromEntries(
  Object.entries(SCOPE_DEFINITIONS).map(([featureId, scope]) => [featureId, buildScopeMeta(scope)]),
);

export function getPrincipalFeatureScopeMeta(featureId: string): PrincipalFeatureScopeMeta | undefined {
  return PRINCIPAL_FEATURE_SCOPE_MAP[featureId];
}
