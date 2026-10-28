import type { FeatureJTBDGraph } from '@repo/core/types/FlowDAG';

export const teacherStudentRadarAttunementFlow: FeatureJTBDGraph = {
  featureId: 'classroom.teacher_student_radar_attunement',
  jobTitle: 'Tactile Student Potential & Radar Attunement',
  jobStory:
    'When observing a learner during classroom flow, I want to quickly tune their multi-dimensional radar dimensions and log a silver lining note in 8 seconds, so their latent gifts compound without administrative fatigue.',
  targetPersonas: ['teacher', 'sectionHead', 'gradeHead'],
  lifecycleStage: 'daily_circadian',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'open_student_analysis',
      surfaceId: 'TeacherClassroomDashboard',
    },
    {
      type: 'tab_navigation',
      tab: 'workspace',
      floor: 'classroom',
    },
  ],
  nodes: [
    {
      stepId: 'select_student_roster',
      title: 'Classroom Roster Selection',
      purpose: 'on_ramp',
      mobileRoute: '/(tabs)/workspace/classroom/[classroomId]',
      webRoute: '/workspace/classroom/[id]',
      primaryAction: 'Select Learner',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'classroom_list_floor',
          fallbackRoute: '/(tabs)/workspace/classroom',
          guidancePrompt: 'Select an active classroom sanctuary first to view learners.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'radar_attunement_modal',
      title: 'Tactile Potential & Silver Lining Attunement',
      purpose: 'input_form',
      mobileRoute: '/(tabs)/workspace/classroom/[classroomId]',
      webRoute: '/workspace/classroom/[id]',
      primaryAction: 'Save Resonance Snapshot',
      fallbacks: [
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'cached_classroom_roster',
          fallbackRoute: '/(tabs)/workspace/classroom/[classroomId]',
          guidancePrompt: 'Offline mode active. Radar updates saved to local device SQLite vault.',
          recoveryAction: 'view_cached',
        },
      ],
    },
    {
      stepId: 'terminal_attunement_confirmed',
      title: 'Potential Compounded',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace/classroom/[classroomId]',
      webRoute: '/workspace/classroom/[id]',
      primaryAction: 'Return to Sanctuary Flow',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'celebrating',
      tutiiRole: 'companion',
      haptic: 'success',
      soundChime: 'subtle_tap',
      scaffoldDismissalKey: 'first_potential_attunement',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/workspace/classroom/[classroomId]',
  },
};
