import type { FeatureJTBDGraph } from '@repo/core/types/FlowDAG';

export const studentClaimPassFlow: FeatureJTBDGraph = {
  featureId: 'classroom.student_desk_pass',
  jobTitle: 'Day 0 Student Desk Pass Claim',
  jobStory:
    'When invited to a course, I want to enter my 6-character invitation desk pass, so my learning desk is provisioned with zero teacher manual entry.',
  targetPersonas: ['student'],
  lifecycleStage: 'day_0_onboarding',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'enter_invitation_code',
      surfaceId: 'StudentDashboard',
    },
    {
      type: 'deep_link',
      urlPattern: 'gurudevi://invite/claim?code=:code',
    },
    {
      type: 'scaffold_onboarding',
      dayStage: 'day_0_onboarding',
    },
  ],
  nodes: [
    {
      stepId: 'input_passcode',
      title: 'Desk Pass Verification',
      purpose: 'input_form',
      mobileRoute: '/(tabs)/workspace/claim-pass',
      webRoute: '/workspace/claim-pass',
      primaryAction: 'Verify Passcode',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'desk_pass_help',
          fallbackRoute: '/(tabs)/workspace/support',
          guidancePrompt: 'Passcode expired or not found. Request an invite link from your section teacher.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'preview_classroom',
      title: 'Classroom & Teacher Preview',
      purpose: 'preview_confirm',
      mobileRoute: '/(tabs)/workspace/claim-pass/preview',
      webRoute: '/workspace/claim-pass/preview',
      primaryAction: 'Confirm & Enter Desk',
      fallbacks: [],
    },
    {
      stepId: 'student_hub',
      title: 'Learner Hub Active View',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace',
      webRoute: '/workspace',
      primaryAction: 'Start Learning',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'guiding',
      tutiiRole: 'guide',
      haptic: 'success',
      soundChime: 'arrival',
      scaffoldDismissalKey: 'student_first_claim',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/workspace',
  },
};
