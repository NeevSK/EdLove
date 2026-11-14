import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';

export const studentProfileSoulViewFlow: FeatureJTBDGraph = {
  featureId: 'classroom.student_profile_soul_view',
  jobTitle: 'Learner Soul & Potential Reflection',
  jobStory:
    'When reflecting on my academic journey, I want to view my holistic growth radar, passions, and silver linings rather than deficit scores, so I understand my unfolding capacity.',
  targetPersonas: ['student'],
  lifecycleStage: 'daily_circadian',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'view_soul_radar',
      surfaceId: 'StudentClassroomDashboard',
    },
    {
      type: 'tab_navigation',
      tab: 'workspace',
      floor: 'classroom',
    },
  ],
  nodes: [
    {
      stepId: 'student_classroom_hub',
      title: 'Learner Sanctuary Floor',
      purpose: 'on_ramp',
      mobileRoute: '/(tabs)/workspace/classroom/student/[classroomId]',
      webRoute: '/workspace/classroom/[id]',
      primaryAction: 'Open Soul Profile',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'classroom_desk_claim',
          fallbackRoute: '/(tabs)/workspace/classroom',
          guidancePrompt: 'Claim or join your classroom desk pass to view your potential radar.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'soul_radar_display',
      title: 'Multidimensional Resonance Polygon',
      purpose: 'preview_confirm',
      mobileRoute: '/(tabs)/workspace/classroom/student/[classroomId]',
      webRoute: '/workspace/classroom/[id]',
      primaryAction: 'Explore Silver Linings & Sparks',
      fallbacks: [],
    },
    {
      stepId: 'terminal_soul_reflection_anchored',
      title: 'Reflection Anchored',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace/classroom/student/[classroomId]',
      webRoute: '/workspace/classroom/[id]',
      primaryAction: 'Continue Study Journey',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'somatic_calm',
      tutiiRole: 'guide',
      haptic: 'selection',
      soundChime: 'pulse',
      scaffoldDismissalKey: 'first_soul_radar_view',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/workspace/classroom/student/[classroomId]',
  },
};
