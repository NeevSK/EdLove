import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';

export const qrResolutionFlow: FeatureJTBDGraph = {
  featureId: 'qr.resolve_action',
  jobTitle: 'Universal QR Scanner & Intent Dispatch',
  jobStory:
    'When I scan a Gurudevi QR code or open a public QR link, I want to safely preview and execute the action, so I join my classroom, school, or resource without manual configuration.',
  targetPersonas: ['student', 'teacher', 'guardian', 'principal'],
  lifecycleStage: 'daily_circadian',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'global_header_scan_qr',
      surfaceId: 'GlobalAppHeader',
    },
    {
      type: 'deep_link',
      urlPattern: 'https://gurudevi.app/qr?v=1&action=:action',
    },
    {
      type: 'deep_link',
      urlPattern: 'gurudevi://qr?v=1&action=:action',
    },
  ],
  nodes: [
    {
      stepId: 'scanner_viewfinder',
      title: 'Optical Viewfinder & Upload',
      purpose: 'on_ramp',
      mobileRoute: '/qr',
      webRoute: '/qr',
      primaryAction: 'Scan Code',
      fallbacks: [
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'manual_code_entry',
          fallbackRoute: '/qr',
          guidancePrompt: 'Camera unavailable. Enter the alphanumeric enrollment code manually.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'quishing_preview',
      title: 'Security Verification & Intent Preview',
      purpose: 'preview_confirm',
      mobileRoute: '/qr',
      webRoute: '/qr',
      primaryAction: 'Confirm & Enter',
      fallbacks: [
        {
          condition: 'account_unlinked',
          fallbackScreenId: 'auth_welcome',
          fallbackRoute: '/welcome',
          guidancePrompt: 'Sign in to confirm your identity before completing this action.',
          recoveryAction: 'link_account',
        },
      ],
    },
    {
      stepId: 'action_fulfillment',
      title: 'Sanctuary Destination Landing',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace',
      webRoute: '/workspace',
      primaryAction: 'Explore Workspace',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'guiding',
      tutiiRole: 'guide',
      haptic: 'success',
      soundChime: 'arrival',
      scaffoldDismissalKey: 'qr_first_scan_success',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/workspace',
  },
};
