import type { FeatureJTBDGraph } from '@repo/core/types/FlowDAG';

export const teacherRollCallFlow: FeatureJTBDGraph = {
  featureId: 'classroom.teacher_attendance',
  jobTitle: 'Daily Roll Call & Arrival Notification',
  jobStory:
    'When morning roll call begins, I want to batch-mark student presence, so guardians receive immediate verified arrival confirmations.',
  targetPersonas: ['teacher', 'sectionHead'],
  lifecycleStage: 'daily_circadian',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'launch_roll_call',
      surfaceId: 'TeacherDashboard',
    },
    {
      type: 'push_notification',
      category: 'morning_attendance_ping',
      payloadKey: 'section_id',
    },
    {
      type: 'tab_navigation',
      tab: 'workspace',
      floor: 'attendance',
    },
  ],
  nodes: [
    {
      stepId: 'select_roster',
      title: 'Classroom & Period Selection',
      purpose: 'on_ramp',
      mobileRoute: '/(tabs)/workspace/attendance',
      webRoute: '/workspace/attendance',
      primaryAction: 'Load Roster',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'claim_desk_pass',
          fallbackRoute: '/(tabs)/workspace/claim-pass',
          guidancePrompt: 'You do not have an active classroom roster assigned.',
          recoveryAction: 'switch_role',
        },
      ],
    },
    {
      stepId: 'batch_mark',
      title: 'Tactile Presence Grid',
      purpose: 'input_form',
      mobileRoute: '/(tabs)/workspace/attendance/register',
      webRoute: '/workspace/attendance/register',
      primaryAction: 'Confirm Roll Call',
      fallbacks: [
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'offline_attendance_vault',
          fallbackRoute: '/(tabs)/workspace/attendance/offline-queue',
          guidancePrompt: 'Offline mode active. Attendance saved to local SQLite vault.',
          recoveryAction: 'view_cached',
        },
      ],
    },
    {
      stepId: 'confirm_completion',
      title: 'Roll Call Summary & Broadcast',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace/attendance/complete',
      webRoute: '/workspace/attendance/complete',
      primaryAction: 'Return to Hub',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'celebrating',
      haptic: 'success',
      soundChime: 'pulse',
      scaffoldDismissalKey: 'teacher_first_roll_call',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/workspace',
  },
};
