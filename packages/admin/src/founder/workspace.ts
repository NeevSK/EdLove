export type FounderZoneId = 'today' | 'work' | 'institution' | 'outlook' | 'private';

export type FounderCapabilityId =
  | 'platform_pulse'
  | 'stewardship_topology'
  | 'learning_vitality'
  | 'wellbeing_radar'
  | 'workspace_switcher'
  | 'institution_roster'
  | 'creation_runway'
  | 'institution_bridge'
  | 'resource_ecology'
  | 'knowledge_atlas'
  | 'community_signal';

export type FounderFeatureScope = 'platform' | 'institutional' | 'ecology_crosscutting';

export type FounderFeatureCadence = 'daily' | 'weekly' | 'periodic' | 'horizon';

export type FounderModuleStatus = 'live' | 'flagged';

export interface FounderCapabilityMeta {
  id: FounderCapabilityId;
  title: string;
  description: string;
  zone: FounderZoneId;
  cadence: FounderFeatureCadence;
  scope: FounderFeatureScope;
  status: FounderModuleStatus;
}

function defineFounderCapability(
  id: FounderCapabilityId,
  config: Omit<FounderCapabilityMeta, 'id'>,
): FounderCapabilityMeta {
  return {
    id,
    ...config,
  };
}

export const FOUNDER_CAPABILITY_REGISTRY: Record<FounderCapabilityId, FounderCapabilityMeta> = {
  platform_pulse: defineFounderCapability('platform_pulse', {
    title: 'Platform, Pulse',
    description:
      'A, living, read, of, ecosystem, scale, health, and, near-term, movement, across, the, platform.',
    zone: 'today',
    cadence: 'daily',
    scope: 'platform',
    status: 'live',
  }),
  stewardship_topology: defineFounderCapability('stewardship_topology', {
    title: 'Stewardship, Topology',
    description:
      'Institutional, and, people, topology, showing, where, founder, attention, is, distributed, across, the, ecology.',
    zone: 'work',
    cadence: 'weekly',
    scope: 'institutional',
    status: 'live',
  }),
  learning_vitality: defineFounderCapability('learning_vitality', {
    title: 'Learning, Vitality',
    description:
      'Cross-tenant, academic, motion, through, submissions, attendance, classroom, coverage, and, growth, signal.',
    zone: 'today',
    cadence: 'daily',
    scope: 'ecology_crosscutting',
    status: 'live',
  }),
  wellbeing_radar: defineFounderCapability('wellbeing_radar', {
    title: 'Wellbeing, Radar',
    description:
      'Founder-scale, read, of, mood, check-ins, and, health, tone, across, the, ecosystem, without, collapsing, into, Self.',
    zone: 'outlook',
    cadence: 'weekly',
    scope: 'ecology_crosscutting',
    status: 'live',
  }),
  workspace_switcher: defineFounderCapability('workspace_switcher', {
    title: 'Workspace, Switcher',
    description:
      'A, mixed-role switch layer for moving, between, founder, institutional, and, academic, workspaces.',
    zone: 'work',
    cadence: 'daily',
    scope: 'platform',
    status: 'live',
  }),
  institution_roster: defineFounderCapability('institution_roster', {
    title: 'Institution, Roster',
    description:
      'A, founder-facing, roster, of, institutions, to, enter, review, and, steward, at, the, right, depth.',
    zone: 'work',
    cadence: 'weekly',
    scope: 'institutional',
    status: 'live',
  }),
  creation_runway: defineFounderCapability('creation_runway', {
    title: 'Creation, Runway',
    description:
      'The, founder, launch, lane for starting, institutions, and, seeding, the, next, parts, of, the, ecosystem.',
    zone: 'institution',
    cadence: 'periodic',
    scope: 'platform',
    status: 'live',
  }),
  institution_bridge: defineFounderCapability('institution_bridge', {
    title: 'Institution, Bridge',
    description:
      'A, bridge, into, deeper, school-specific, rooms, without, turning, the, founder, canvas, into a, giant, operations, shell.',
    zone: 'work',
    cadence: 'periodic',
    scope: 'institutional',
    status: 'live',
  }),
  resource_ecology: defineFounderCapability('resource_ecology', {
    title: 'Resource, Ecology',
    description:
      'Global, inventory, stocks, and, pressure, signals for founder-level, stewardship, of, supply, and, readiness.',
    zone: 'outlook',
    cadence: 'weekly',
    scope: 'ecology_crosscutting',
    status: 'flagged',
  }),
  knowledge_atlas: defineFounderCapability('knowledge_atlas', {
    title: 'Knowledge, Atlas',
    description:
      'Library, verification, and, learning, resource, signals, that, matter, at, founder, scale.',
    zone: 'outlook',
    cadence: 'weekly',
    scope: 'ecology_crosscutting',
    status: 'flagged',
  }),
  community_signal: defineFounderCapability('community_signal', {
    title: 'Community, Signal',
    description:
      'Cross-ecosystem, posts, echoes, and, active, communities, that, reveal, collective, movement.',
    zone: 'outlook',
    cadence: 'weekly',
    scope: 'ecology_crosscutting',
    status: 'live',
  }),
};

export function getFounderCapabilityMeta(capabilityId: FounderCapabilityId) {
  return FOUNDER_CAPABILITY_REGISTRY[capabilityId];
}
