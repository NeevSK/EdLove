import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';

export const studentDailyPrepFlow: FeatureJTBDGraph = {
  featureId: 'self.learner_growth',
  jobTitle: 'Learner Tomorrow Prep & Gentle Rhythm',
  jobStory:
    'When winding down in the evening, I want to capture three gentle prep intentions and review my timetable, so I approach tomorrow centered and prepared.',
  targetPersonas: ['student'],
  lifecycleStage: 'daily_circadian',
  triggers: [
    {
      type: 'tab_navigation',
      tab: 'self',
      floor: 'prep',
    },
    {
      type: 'dashboard_action',
      buttonId: 'open_tomorrow_prep',
      surfaceId: 'SelfDashboard',
    },
  ],
  nodes: [
    {
      stepId: 'prep_arrival',
      title: 'Self Sanctuary Wind-Down',
      purpose: 'on_ramp',
      mobileRoute: '/(tabs)/self',
      webRoute: '/self',
      primaryAction: 'Open Tomorrow Prep',
      fallbacks: [],
    },
    {
      stepId: 'add_prep_goal',
      title: 'Three Gentle Things',
      purpose: 'input_form',
      mobileRoute: '/(tabs)/self',
      webRoute: '/self',
      primaryAction: 'Commit Prep Goal',
      fallbacks: [
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'local_offline_prep',
          fallbackRoute: '/(tabs)/self',
          guidancePrompt: 'Offline mode active. Tomorrow prep items are saved to local SQLite.',
          recoveryAction: 'view_cached',
        },
      ],
    },
    {
      stepId: 'complete_prep_goal',
      title: 'Tactile Completion & Evening Rest',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/self',
      webRoute: '/self',
      primaryAction: 'Conclude Evening Rhythm',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'somatic_calm',
      haptic: 'selection',
      soundChime: 'arrival',
      scaffoldDismissalKey: 'self_tomorrow_prep_scaffold',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/self',
  },
};
