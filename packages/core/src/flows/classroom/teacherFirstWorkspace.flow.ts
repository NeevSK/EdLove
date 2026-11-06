import type { FeatureJTBDGraph } from '@repo/core/types/FlowDAG';

/** Proposed contract. The listed routes exist; the proposed provisioning interaction is not wired. */
export const teacherFirstWorkspaceFlow: FeatureJTBDGraph = {
  featureId: 'classroom.teacher_first_workspace',
  jobTitle: 'Start teaching in a workspace',
  jobStory:
    'When I first open Workspace, I want to find or establish my teaching context so I can begin work with the right classroom.',
  targetPersonas: ['teacher'],
  lifecycleStage: 'day_0_onboarding',
  triggers: [{ type: 'tab_navigation', tab: 'workspace', floor: 'teacher' }],
  nodes: [
    {
      stepId: 'workspace',
      title: 'Workspace entry',
      purpose: 'on_ramp',
      mobileRoute: '/(tabs)/workspace',
      webRoute: '/workspace',
      primaryAction: 'Open workspace',
      fallbacks: [],
    },
    {
      stepId: 'self',
      title: 'Personal Self',
      purpose: 'terminal_success',
      mobileRoute: '/(tabs)/workspace',
      webRoute: '/self',
      primaryAction: 'Return to Self',
      fallbacks: [],
    },
  ],
  completion: {
    nextCircadianRoute: '/workspace',
    sensoryProfile: { tutiiMode: 'guiding', haptic: 'selection' },
  },
  journeyPilot: {
    status: 'proposed',
    intent: 'Enter an authorized teaching workspace or establish an independent classroom.',
    developmentContext: {
      mode: 'brownfield',
      existingBehavior: [
        'Web workspace shows a personal-scope state before institutional attendance.',
        'Server provisioning can create a teacher-owned classroom and bond using an idempotent receipt.',
      ],
      integrationPoints: [
        {
          reference: 'apps/gurudevi-web/app/(sanctuary)/workspace/page.tsx',
          role: 'Authenticated workspace entry and personal-scope state',
        },
        {
          reference: 'apps/gurudevi-web/lib/sanctuary/workspaceScopes.ts',
          role: 'Account-bound scope loading and selection',
        },
        {
          reference: 'packages/core/src/api/workspace-provisioning.orpc.contract.ts',
          role: 'Teacher provisioning input and receipt contract',
        },
        {
          reference: 'apps/sanctuary-api/src/core/handlers/workspaceProvisioning.ts',
          role: 'Server-side active teacher bond check and transaction',
        },
        {
          reference: 'packages/policies/src/policies/school/teacher.cedar',
          role: 'School and classroom authorization policies',
        },
        {
          reference: 'apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx',
          role: 'Native workspace dispatcher and permission states',
        },
        {
          reference: 'packages/core/src/logic/workspace/provisionalWorkspace.ts',
          role: 'Existing durable provisioning queue; teacher classroom commands are not supported',
        },
        {
          reference: 'packages/core/src/adapters/supabase/schoolInviteRepository.ts',
          role: 'Existing school invitation redemption and scope selection',
        },
      ],
      invariants: [
        'The selected account and server-verified bond govern authority; a local draft never grants access.',
        'A personal teaching context is distinct from an institutional school role.',
        'A teacher may optionally contact the founder for a school; opening WhatsApp is not message delivery or an authorization grant.',
        'Existing teaching, onboarding, school and personal flows are preserved.',
      ],
      openQuestions: [
        'How should a teacher provisioning command persist and reconcile across offline interruptions and account switches on web?',
        'How should the bootstrap provisioning boundary align with Cedar and existing teacher bond checks?',
        'Which existing school invitation and claim flows support teacher onboarding end to end?',
        'Can signed Cedar snapshots, account-scoped draft persistence and outbox reconciliation support this journey on both platforms?',
      ],
    },
    entryStep: 'resolve',
    steps: [
      {
        id: 'resolve',
        title: 'Resolve teaching context',
        interaction: 'Check the authenticated account and available scopes.',
        terminal: false,
      },
      {
        id: 'choose',
        title: 'Choose a teaching context',
        interaction: 'Select an existing permitted context or begin a supported setup.',
        terminal: false,
      },
      {
        id: 'workspace',
        title: 'Teaching workspace',
        interaction: 'Open a server-confirmed teaching scope.',
        terminal: true,
      },
      {
        id: 'failure',
        title: 'Unable to confirm context',
        interaction: 'Explain the problem and offer safe recovery.',
        terminal: true,
      },
      {
        id: 'self',
        title: 'Personal Self',
        interaction: 'Return to personal Self.',
        terminal: true,
      },
    ],
    transitions: [
      {
        id: 'selected',
        from: 'resolve',
        to: 'workspace',
        action: 'A permitted teaching scope is selected',
        feedback: 'Show the selected teaching context.',
      },
      {
        id: 'personal',
        from: 'resolve',
        to: 'choose',
        action: 'Personal scope is selected',
        feedback: 'Offer supported teaching setup and existing scope selection.',
      },
      {
        id: 'failure',
        from: 'resolve',
        to: 'failure',
        action: 'Identity or scope lookup fails',
        feedback: 'Explain that the workspace could not be confirmed.',
      },
      {
        id: 'return_self',
        from: 'choose',
        to: 'self',
        action: 'Return to Self',
        feedback: 'Keep personal Self available.',
      },
      {
        id: 'confirmed',
        from: 'choose',
        to: 'workspace',
        action: 'A new teaching bond is confirmed and selected',
        feedback: 'Open the verified teaching workspace.',
      },
    ],
    scenarios: [
      { id: 'existing', title: 'Existing teaching scope', transitions: ['selected'], evidence: [] },
      {
        id: 'first_visit',
        title: 'Personal scope at first visit',
        transitions: ['personal'],
        evidence: [],
      },
      { id: 'failure', title: 'Scope lookup failure', transitions: ['failure'], evidence: [] },
      {
        id: 'self',
        title: 'Return to Self',
        transitions: ['personal', 'return_self'],
        evidence: [],
      },
      {
        id: 'provision',
        title: 'Provision and select a teaching scope',
        transitions: ['personal', 'confirmed'],
        evidence: [],
      },
    ],
    bindings: [
      {
        kind: 'web',
        status: 'planned',
        reference: 'apps/gurudevi-web/app/(sanctuary)/workspace/page.tsx',
        note: 'The personal-scope state exists; classroom provisioning is not wired there.',
      },
      {
        kind: 'mobile',
        status: 'unknown',
        reference: 'apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx',
        note: 'The native first-day journey requires end-to-end verification.',
      },
      {
        kind: 'api',
        status: 'implemented',
        reference: 'packages/core/src/api/workspace-provisioning.orpc.contract.ts',
        note: 'Provisioning contract exists; UI and real seam evidence are not established.',
      },
      {
        kind: 'data',
        status: 'implemented',
        reference: 'packages/schema/schema.zmodel',
        note: 'Classroom, personal classroom, school and bond models exist; deployed schema not checked.',
      },
      {
        kind: 'authorization',
        status: 'unknown',
        reference: 'apps/sanctuary-api/src/core/handlers/workspaceProvisioning.ts',
        note: 'Server checks an active teacher bond; Cedar alignment and real database isolation need verification.',
      },
    ],
  },
};
