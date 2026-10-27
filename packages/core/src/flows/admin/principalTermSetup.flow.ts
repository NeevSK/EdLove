import type { FeatureJTBDGraph } from '@repo/core/types/FlowDAG';

export const principalTermSetupFlow: FeatureJTBDGraph = {
  featureId: 'admin.academic_cycles',
  jobTitle: 'Academic Term & Hierarchy Provisioning',
  jobStory:
    'When a new academic year arrives, I want to configure terms and sections, so teachers and students can seamlessly transition without lost records.',
  targetPersonas: ['principal', 'assistantPrincipal'],
  lifecycleStage: 'daily_circadian',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'provision_academic_cycle',
      surfaceId: 'PrincipalDashboard',
    },
    {
      type: 'tab_navigation',
      tab: 'workspace',
      floor: 'admin',
    },
  ],
  nodes: [
    {
      stepId: 'set_calendar',
      title: 'Academic Term Dates',
      purpose: 'input_form',
      mobileRoute: '/(tabs)/workspace/admin',
      webRoute: '/admin/analytics',
      primaryAction: 'Define Cycle Calendar',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'school_registry_setup',
          fallbackRoute: '/(tabs)/workspace/admin/school-creation',
          guidancePrompt: 'MoE school profile must be completed before configuring academic terms.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'allocate_sections',
      title: 'Section & Grade Head Allocation',
      purpose: 'input_form',
      mobileRoute: '/(tabs)/workspace/admin',
      webRoute: '/admin/documents',
      primaryAction: 'Assign Sections',
      fallbacks: [],
    },
    {
      stepId: 'publish_schedule',
      title: 'Term Schedule Publication',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace/admin',
      webRoute: '/admin/analytics',
      primaryAction: 'Broadcast Schedule',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'celebrating',
      haptic: 'success',
      soundChime: 'celebration',
      scaffoldDismissalKey: 'principal_first_school_scaffold',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/workspace',
  },
};
