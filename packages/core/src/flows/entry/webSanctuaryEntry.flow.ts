import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';

export const webSanctuaryEntryFlow: FeatureJTBDGraph = {
  featureId: 'entry.web_sanctuary',
  jobTitle: 'Web Browser Sanctuary Ingress & Onboarding',
  jobStory:
    'When visiting the Gurudevi Web Sanctuary, I want a tranquil, accessible gateway where guests can explore and registered participants can sign in and enter their workspaces.',
  targetPersonas: ['teacher', 'principal', 'student', 'guardian'],
  lifecycleStage: 'day_0_onboarding',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'web_sanctuary_enter',
      surfaceId: 'MarketingPortal',
    },
    {
      type: 'deep_link',
      urlPattern: 'https://sanctuary.gurudevi.app/*',
    },
    {
      type: 'scaffold_onboarding',
      dayStage: 'day_0_onboarding',
    },
  ],
  nodes: [
    {
      stepId: 'guest_house_welcome',
      title: 'Sanctuary Guest House',
      purpose: 'on_ramp',
      mobileRoute: '/welcome',
      webRoute: '/welcome',
      primaryAction: 'Choose Role or Sign In',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'vanity_invite',
          fallbackRoute: '/c',
          guidancePrompt: 'Arrived with class or community invite link.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'auth_sign_in',
      title: 'Web Credentials & Passwordless Entry',
      purpose: 'input_form',
      mobileRoute: '/auth',
      webRoute: '/sign-in',
      primaryAction: 'Verify Credentials',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'sign_up',
          fallbackRoute: '/sign-up',
          guidancePrompt: 'New participant creating an account.',
          recoveryAction: 'retry',
        },
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'account_recovery',
          fallbackRoute: '/account-recovery',
          guidancePrompt: 'Account inactive or credential recovery required.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'account_recovery',
      title: 'Account Status & Lifecycle Recovery',
      purpose: 'sub_detail',
      mobileRoute: '/account-recovery',
      webRoute: '/account-recovery',
      primaryAction: 'Review Status & Sign Out',
      fallbacks: [],
    },
    {
      stepId: 'role_onboarding',
      title: 'Sanctuary Capacity Enrollment',
      purpose: 'input_form',
      mobileRoute: '/onboarding',
      webRoute: '/onboarding',
      primaryAction: 'Complete Enrollment',
      fallbacks: [],
    },
    {
      stepId: 'browser_workspace',
      title: 'Living Browser Workspace',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace',
      webRoute: '/workspace',
      primaryAction: 'Open Living Floor',
      fallbacks: [],
    },
  ],
  completion: {
    nextCircadianRoute: '/workspace',
    sensoryProfile: {
      tutiiMode: 'guiding',
      tutiiRole: 'guide',
      haptic: 'selection',
      soundChime: 'arrival',
      scaffoldDismissalKey: 'web_entry_complete',
      scaffoldThreshold: 1,
    },
  },
};
