import type { FeatureJTBDGraph } from '@repo/core/types/FlowDAG';

/**
 * AI Assistant & Ambient Companion Flow Contract
 *
 * Grounded in:
 * - user-journey-orchestration: Enforcing Actor-Authority/Passive Router pattern.
 * - brownfield-feature-integration: Consolidating FAB & Community DM entry points.
 * - computational-generations-and-agent-taxonomy: Gen 2/3 Chat vs. Gen 4 Agent Pro Gating.
 */
export const aiAssistantFlow: FeatureJTBDGraph = {
  featureId: 'ai.assistant_companion',
  jobTitle: 'Ambient AI Assistant & Autonomous Mission Companion',
  jobStory:
    'When I need pedagogical guidance, quick lesson brainstorming, or autonomous multi-step preparation, I want to access the AI assistant through the global FAB or Community DM, so I can accelerate administrative work while retaining full human approval and privacy control.',
  targetPersonas: ['teacher', 'principal', 'student', 'guardian'],
  lifecycleStage: 'daily_circadian',
  triggers: [
    {
      type: 'dashboard_action',
      buttonId: 'global_fab_ai_trigger',
      surfaceId: 'LotusPetalFAB',
    },
    {
      type: 'tab_navigation',
      tab: 'community',
      floor: 'direct_messages',
    },
    {
      type: 'dashboard_action',
      buttonId: 'classroom_lesson_draft_trigger',
      surfaceId: 'ClassroomWorkbench',
    },
  ],
  nodes: [
    {
      stepId: 'entry_resolution',
      title: 'AI Ingress & Admission Guard',
      purpose: 'on_ramp',
      mobileRoute: '/a-i-assistant',
      webRoute: '/ai',
      primaryAction: 'Initialize Session',
      fallbacks: [
        {
          condition: 'account_unlinked',
          fallbackScreenId: 'auth_landing',
          fallbackRoute: '/auth',
          guidancePrompt: 'Sign in to access your AI assistant and saved history.',
          recoveryAction: 'link_account',
        },
      ],
    },
    {
      stepId: 'chat_stream',
      title: 'Conversational Co-Pilot (Gen 2/3)',
      purpose: 'input_form',
      mobileRoute: '/a-i-assistant',
      webRoute: '/ai',
      primaryAction: 'Send Message',
      fallbacks: [
        {
          condition: 'offline_no_cache',
          fallbackScreenId: 'local_offline_notes',
          fallbackRoute: '/a-i-assistant',
          guidancePrompt:
            'You are offline. Live streaming is unavailable, but your local notes and drafts are safely stored on device.',
          recoveryAction: 'view_cached',
        },
        {
          condition: 'feature_disabled',
          fallbackScreenId: 'volatile_session',
          fallbackRoute: '/a-i-assistant',
          guidancePrompt:
            'Incognito mode is active. This session will not be saved to your account history.',
          recoveryAction: 'open_demo_sandbox',
        },
      ],
    },
    {
      stepId: 'agent_mission_dispatch',
      title: 'Autonomous Enduring Mission (Gen 4 Pro)',
      purpose: 'sub_detail',
      mobileRoute: '/a-i-assistant',
      webRoute: '/ai',
      primaryAction: 'Dispatch Mission',
      fallbacks: [
        {
          condition: 'permission_denied',
          fallbackScreenId: 'pro_upgrade_moment',
          fallbackRoute: '/a-i-assistant',
          guidancePrompt:
            'Autonomous Deep Work is a Gurudevi Pro feature. Upgrade your account or provide a personal BYOK provider key to proceed.',
          recoveryAction: 'switch_role',
        },
      ],
    },
    {
      stepId: 'proposal_review_gate',
      title: 'Human-in-the-Loop Proposal Review',
      purpose: 'preview_confirm',
      mobileRoute: '/a-i-assistant',
      webRoute: '/ai',
      primaryAction: 'Review Proposal Card',
      fallbacks: [
        {
          condition: 'prerequisite_missing',
          fallbackScreenId: 'return_to_chat',
          fallbackRoute: '/a-i-assistant',
          guidancePrompt: 'Draft discarded. No records were modified.',
          recoveryAction: 'retry',
        },
      ],
    },
    {
      stepId: 'terminal_commit',
      title: 'Sovereign Transaction Commit',
      purpose: 'terminal_success',
      mobileRoute: '/a-i-assistant',
      webRoute: '/ai',
      primaryAction: 'Return to Floor',
      fallbacks: [],
    },
  ],
  completion: {
    sensoryProfile: {
      tutiiMode: 'guiding',
      haptic: 'success',
      soundChime: 'arrival',
      scaffoldDismissalKey: 'ai_assistant_first_interaction',
      scaffoldThreshold: 1,
    },
    nextCircadianRoute: '/(tabs)/workspace',
  },
};
