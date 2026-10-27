import type { FeatureJTBDGraph } from '@repo/core/types/FlowDAG';

export const mindfulBreathingFlow: FeatureJTBDGraph = {
  featureId: 'self.breath_guide',
  jobTitle: 'Somatic Mindful Breathing & Equilibrium',
  jobStory:
    'When tension or sensory fatigue arises, I want to engage in a guided breath session, so I restore autonomic nervous system calm and mental clarity.',
  targetPersonas: ['student', 'teacher', 'guardian', 'principal', 'founder'],
  lifecycleStage: 'daily_circadian',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'take_mindful_breath',
      surfaceId: 'SelfDashboard',
    },
    {
      type: 'tab_navigation',
      tab: 'self',
      floor: 'breathing',
    },
    {
      type: 'scaffold_onboarding',
      dayStage: 'day_0_onboarding',
    },
  ],
  nodes: [
    {
      stepId: 'arrival',
      title: 'Somatic Sanctuary Arrival',
      purpose: 'on_ramp',
      mobileRoute: '/(tabs)/self',
      webRoute: '/self',
      primaryAction: 'Begin Breath Cycle',
      fallbacks: [],
    },
    {
      stepId: 'guided_cycle',
      title: 'Harmonic Coherence Pacer',
      purpose: 'input_form',
      mobileRoute: '/(tabs)/self',
      webRoute: '/self',
      primaryAction: 'Conclude Session',
      fallbacks: [
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'local_somatic_timer',
          fallbackRoute: '/(tabs)/self',
          guidancePrompt: 'Local offline breathing cadence running smoothly.',
          recoveryAction: 'view_cached',
        },
      ],
    },
    {
      stepId: 'reflection_completion',
      title: 'Equilibrium & Centered Presence',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/self',
      webRoute: '/self',
      primaryAction: 'Return to Living Hub',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'somatic_calm',
      haptic: 'selection',
      soundChime: 'subtle_tap',
      scaffoldDismissalKey: 'self_day0_reflection_scaffold',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/self',
  },
};
