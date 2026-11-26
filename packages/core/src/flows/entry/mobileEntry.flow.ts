import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';

export const mobileEntryFlow: FeatureJTBDGraph = {
  featureId: 'entry.mobile_sanctuary',
  jobTitle: 'Mobile Native Cold Launch & Orientation',
  jobStory:
    'When launching Gurudevi Mobile, I want to be safely routed based on active credentials, so unauthenticated visitors land on welcome orientation and authenticated users enter their circadian workspace without friction.',
  targetPersonas: ['student', 'teacher', 'principal', 'guardian'],
  lifecycleStage: 'day_0_onboarding',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'cold_boot_launch',
      surfaceId: 'MobileAppRoot',
    },
    {
      type: 'deep_link',
      urlPattern: 'gurudevi://*',
    },
    {
      type: 'scaffold_onboarding',
      dayStage: 'day_0_onboarding',
    },
  ],
  nodes: [
    {
      stepId: 'cold_boot',
      title: 'Session & Offline Sentinel',
      purpose: 'on_ramp',
      mobileRoute: '/',
      webRoute: '/',
      primaryAction: 'Evaluate Session',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'welcome',
          fallbackRoute: '/welcome',
          guidancePrompt: 'Unauthenticated or guest user. Please select an entry path.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'welcome',
      title: 'Sanctuary Orientation & Ingress',
      purpose: 'on_ramp',
      mobileRoute: '/welcome',
      webRoute: '/welcome',
      primaryAction: 'Enter Credentials',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'invitation_welcome',
          fallbackRoute: '/invitation-welcome',
          guidancePrompt: 'Arrived with invite link or desk pass QR.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'auth_gate',
      title: 'Unified Credentials Gate',
      purpose: 'input_form',
      mobileRoute: '/auth',
      webRoute: '/sign-in',
      primaryAction: 'Authenticate & Verify',
      fallbacks: [
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'account_recovery',
          fallbackRoute: '/account-recovery',
          guidancePrompt: 'Trouble signing in or recovering account credentials.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'onboarding',
      title: 'Day-0 Capacity & Bond Selection',
      purpose: 'input_form',
      mobileRoute: '/onboarding',
      webRoute: '/onboarding',
      primaryAction: 'Confirm Role & Profile',
      fallbacks: [],
    },
    {
      stepId: 'workspace_floor',
      title: 'Circadian Workspace Floor',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace',
      webRoute: '/workspace',
      primaryAction: 'Start Work',
      fallbacks: [],
    },
  ],
  completion: {
    nextCircadianRoute: '/(tabs)/workspace',
    sensoryProfile: {
      tutiiMode: 'guiding',
      tutiiRole: 'guide',
      haptic: 'success',
      soundChime: 'arrival',
      scaffoldDismissalKey: 'mobile_entry_complete',
      scaffoldThreshold: 1,
    },
  },
};
