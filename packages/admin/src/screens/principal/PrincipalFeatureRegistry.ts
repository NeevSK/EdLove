import {
  PRINCIPAL_CAPABILITY_REGISTRY,
  type PrincipalCapabilityId,
  type PrincipalFeatureScope,
} from '@/principal/workspace';

export interface FeatureInfo {
  title: string;
  description: string;
  howToUse?: string;
  establishment?: string;
  daily?: string;
  scope: PrincipalFeatureScope;
  scopeBadgeLabelKey: string;
  scopeHelpTextKey: string;
}

const FEATURE_OVERRIDES: Partial<
  Record<
    PrincipalCapabilityId,
    Omit<FeatureInfo, 'title' | 'description' | 'scope' | 'scopeBadgeLabelKey' | 'scopeHelpTextKey'>
  >
> = {
  morning_brief: {
    daily:
      'Start here each morning to understand attendance risk, staffing gaps, and approvals that need attention.',
  },
  faculty_overview: {
    daily: 'Monitor which staff are present and where coverage pressure may appear during the day.',
  },
  student_pulse: {
    daily:
      'Use the aggregated pulse to spot attendance or wellbeing risk without dropping into surveillance.',
  },
  hierarchy: {
    establishment: 'Define grades, sections, and structural scaffolding for the institution.',
  },
  invites: {
    establishment: 'Invite faculty and leadership roles with the right institutional permissions.',
  },
  log: {
    daily:
      'Capture leadership notes, decisions, and follow-ups that should stay in the institutional memory.',
  },
  cycles: {
    establishment: 'Shape terms and academic cycles before the year settles into routine.',
  },
  resource_needs: {
    daily: 'Review aggregated teacher requests and surface emerging resource pressure early.',
  },
  ecosystem_resonance: {
    daily:
      'Read the climate of the school community through aggregated echo and feedback patterns.',
  },
};

export const PRINCIPAL_FEATURE_REGISTRY: Record<string, FeatureInfo> = Object.fromEntries(
  Object.values(PRINCIPAL_CAPABILITY_REGISTRY).map((capability) => [
    capability.id,
    {
      title: capability.title,
      description: capability.description,
      scope: capability.scope,
      scopeBadgeLabelKey: capability.scopeBadgeLabelKey,
      scopeHelpTextKey: capability.scopeHelpTextKey,
      ...FEATURE_OVERRIDES[capability.id],
    },
  ]),
);
