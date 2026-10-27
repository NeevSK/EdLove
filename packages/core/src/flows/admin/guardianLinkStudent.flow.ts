import type { FeatureJTBDGraph } from '@repo/core/types/FlowDAG';

export const guardianLinkStudentFlow: FeatureJTBDGraph = {
  featureId: 'guardian.student_link',
  jobTitle: 'Guardian Child Account Bond',
  jobStory:
    "When linking to my child's school, I want to scan their Student Pass QR, so I receive verified attendance pulses and academic notices.",
  targetPersonas: ['guardian', 'parent'],
  lifecycleStage: 'day_0_onboarding',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'link_student_action',
      surfaceId: 'GuardianDashboard',
    },
    {
      type: 'scaffold_onboarding',
      dayStage: 'day_0_onboarding',
    },
    {
      type: 'deep_link',
      urlPattern: 'gurudevi://guardian/link?studentId=:studentId',
    },
  ],
  nodes: [
    {
      stepId: 'scan_qr',
      title: 'Scan Student Pass QR',
      purpose: 'input_form',
      mobileRoute: '/(tabs)/workspace/link-student',
      webRoute: '/workspace/link-student',
      primaryAction: 'Scan QR or Enter ID',
      fallbacks: [
        {
          condition: 'permission_denied',
          fallbackScreenId: 'manual_student_lookup',
          fallbackRoute: '/(tabs)/workspace/link-student/manual',
          guidancePrompt: 'Camera permission denied. Type the student reference number manually.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'confirm_relationship',
      title: 'Guardian Verification Request',
      purpose: 'preview_confirm',
      mobileRoute: '/(tabs)/workspace/link-student/confirm',
      webRoute: '/workspace/link-student/confirm',
      primaryAction: 'Submit Verification',
      fallbacks: [
        {
          condition: 'account_unlinked',
          fallbackScreenId: 'pending_verification_view',
          fallbackRoute: '/(tabs)/workspace',
          guidancePrompt: 'Link request submitted to school administration for verification.',
          recoveryAction: 'switch_role',
        },
      ],
    },
    {
      stepId: 'guardian_active_room',
      title: 'Family Room Attendance Watch',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace',
      webRoute: '/workspace',
      primaryAction: 'Open Family Feed',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'guiding',
      haptic: 'selection',
      soundChime: 'arrival',
      scaffoldDismissalKey: 'guardian_first_link_scaffold',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/workspace',
  },
};
