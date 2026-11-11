import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';

export const founderCommandDeckFlow: FeatureJTBDGraph = {
  featureId: 'platform.founder_cockpit',
  jobTitle: 'Founder Command Deck & Platform Fleet Directives',
  jobStory:
    'When guiding the platform, I want to capture strategic priorities and monitor school fleet pulse, so our institutions, classrooms, and learners flourish.',
  targetPersonas: ['founder'],
  lifecycleStage: 'daily_circadian',
  triggers: [
    {
      type: 'tab_navigation',
      tab: 'workspace',
      floor: 'founder',
    },
    {
      type: 'dashboard_action',
      buttonId: 'launch_founder_deck',
      surfaceId: 'WorkspaceHub',
    },
  ],
  nodes: [
    {
      stepId: 'cockpit_entry',
      title: 'Founder Command Deck Arrival',
      purpose: 'on_ramp',
      mobileRoute: '/(tabs)/workspace/founder',
      webRoute: '/admin/founder',
      primaryAction: 'Review Strategic Priorities',
      fallbacks: [
        {
          condition: 'permission_denied',
          fallbackScreenId: 'workspace_hub',
          fallbackRoute: '/(tabs)/workspace',
          guidancePrompt: 'Founder command deck is restricted to sovereign platform stewards (founder, co-founder, director).',
          recoveryAction: 'switch_role',
        },
      ],
    },
    {
      stepId: 'add_directive',
      title: 'Strategic Directive Triage',
      purpose: 'input_form',
      mobileRoute: '/(tabs)/workspace/founder',
      webRoute: '/admin/founder',
      primaryAction: 'Commit Directive',
      fallbacks: [
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'local_sqlite_deck',
          fallbackRoute: '/(tabs)/workspace/founder',
          guidancePrompt: 'Offline mode active. Directives queue safely in local SQLite WAL.',
          recoveryAction: 'view_cached',
        },
      ],
    },
    {
      stepId: 'directives_settled',
      title: 'Directives Committed & Synchronized',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace/founder',
      webRoute: '/admin/founder',
      primaryAction: 'Return to Command Deck',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'guiding',
      haptic: 'success',
      soundChime: 'subtle_tap',
      scaffoldDismissalKey: 'founder_cockpit_scaffold',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/workspace/founder',
  },
};
