import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';

export const linkedProvidersFlow: FeatureJTBDGraph = {
  featureId: 'account.linked_providers',
  jobTitle: 'Federated Identity Provider Linking & Management',
  jobStory:
    'When managing my citizen account, I want to link external identity providers (Google, Apple, etc.) or unlink unneeded ones, so that I have multiple secure sign-in vectors while preserving single canonical account integrity.',
  targetPersonas: ['teacher', 'principal', 'student', 'guardian'],
  lifecycleStage: 'mastery_governance',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'manage_linked_providers',
      surfaceId: 'SecuritySettings',
    },
    {
      type: 'deep_link',
      urlPattern: 'https://gurudevi.app/profile/security*',
    },
    {
      type: 'deep_link',
      urlPattern: 'https://sanctuary.gurudevi.app/profile/security*',
    },
  ],
  nodes: [
    {
      stepId: 'provider_inventory',
      title: 'Linked Identity Providers & Sign-In Methods',
      purpose: 'sub_detail',
      mobileRoute: '/(tabs)/self/settings',
      webRoute: '/profile/security',
      primaryAction: 'Review Connected Providers',
      fallbacks: [
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'security_offline',
          fallbackRoute: '/profile/security',
          guidancePrompt: 'Unable to refresh credential inventory while offline.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'initiate_provider_link',
      title: 'Connect External Provider',
      purpose: 'on_ramp',
      mobileRoute: '/(tabs)/self/settings',
      webRoute: '/profile/security',
      primaryAction: 'Authorize with External Provider',
      fallbacks: [
        {
          condition: 'permission_denied',
          fallbackScreenId: 'identity_conflict_notice',
          fallbackRoute: '/profile/security',
          guidancePrompt:
            'This external account is already bound to another citizen profile. Please sign in with that profile or use a different account.',
          recoveryAction: 'retry',
        },
        {
          condition: 'server_503',
          fallbackScreenId: 'provider_unreachable',
          fallbackRoute: '/profile/security',
          guidancePrompt: 'Identity provider handshake timed out or was cancelled.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'unlink_provider_confirmation',
      title: 'Unlink Sign-In Provider',
      purpose: 'sub_detail',
      mobileRoute: '/(tabs)/self/settings',
      webRoute: '/profile/security',
      primaryAction: 'Confirm Provider Disconnection',
      fallbacks: [
        {
          condition: 'permission_denied',
          fallbackScreenId: 'lockout_prevention_notice',
          fallbackRoute: '/profile/security',
          guidancePrompt:
            'Cannot unlink your only remaining sign-in method. Add another login method first.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'providers_synced',
      title: 'Sign-In Methods Updated',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/self/settings',
      webRoute: '/profile/security',
      primaryAction: 'Return to Account Security',
      fallbacks: [],
    },
  ],
  completion: {
    nextCircadianRoute: '/profile/security',
    sensoryProfile: {
      tutiiMode: 'guiding',
      tutiiRole: 'guide',
      haptic: 'success',
      soundChime: 'celebration',
    },
    scaffoldDismissalKey: 'linked_providers_intro',
  },
};
