import { describe, expect, it } from 'vitest';
import { CITIZENSHIP } from '@repo/core/logic/registry/citizenship';
import {
  DomainEntrySchema,
  FeatureJTBDGraphSchema,
} from '@repo/core/logic/registry/domainEntry';
import {
  type FeatureJTBDGraph,
  validateFlowDAG,
} from '@repo/core/types/FlowDAG';

describe('FeatureJTBDGraph Contract & FlowDAG Validation', () => {
  const sampleTeacherAttendanceFlow: FeatureJTBDGraph = {
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

  it('validates a schema-compliant JTBD Flow graph', () => {
    const parsed = FeatureJTBDGraphSchema.parse(sampleTeacherAttendanceFlow);
    expect(parsed.featureId).toBe('classroom.teacher_attendance');
    expect(parsed.nodes).toHaveLength(3);
    expect(parsed.triggers).toHaveLength(2);
  });

  it('verifies that a valid DAG passes validation without errors', () => {
    const result = validateFlowDAG(sampleTeacherAttendanceFlow);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects duplicate stepIds in a flow graph', () => {
    const invalidFlow: FeatureJTBDGraph = {
      ...sampleTeacherAttendanceFlow,
      nodes: [
        sampleTeacherAttendanceFlow.nodes[0]!,
        { ...sampleTeacherAttendanceFlow.nodes[1]!, stepId: 'select_roster' }, // duplicate!
      ],
    };
    const result = validateFlowDAG(invalidFlow);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate stepId'))).toBe(true);
  });

  it('detects missing terminal nodes when all nodes have open fallbacks', () => {
    const nonTerminalFlow: FeatureJTBDGraph = {
      ...sampleTeacherAttendanceFlow,
      nodes: [
        {
          stepId: 'step_1',
          title: 'Step 1',
          purpose: 'input_form',
          mobileRoute: '/step1',
          webRoute: '/step1',
          primaryAction: 'Next',
          fallbacks: [
            {
              condition: 'server_503',
              fallbackScreenId: 'err',
              fallbackRoute: '/err',
              guidancePrompt: 'Error',
              recoveryAction: 'retry',
            },
          ],
        },
      ],
    };
    const result = validateFlowDAG(nonTerminalFlow);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('must have at least one terminal node'))).toBe(true);
  });

  it('attaches cleanly into DomainEntrySchema without breaking existing catalog entries', () => {
    const entry = {
      id: 'classroom.teacher_attendance',
      label: 'Teacher Roll Call',
      ownerPackage: 'classroom',
      mobileSupport: true,
      webSupport: true,
      state: 'live',
      lifecycle: {
        owner: 'classroom',
        createdAt: '2026-10-26',
        reviewAt: '2026-12-31',
        permanentJustification: 'Core attendance flow.',
      },
      citizenshipRequired: CITIZENSHIP.FIRST_CLASS,
      capabilityRequirement: { action: 'take', subject: 'Attendance' },
      tabDomain: 'workspace',
      surfaceId: 'attendance',
      defaultOrder: 1,
      analyticsKey: 'workspace.teacher_attendance',
      jtbdFlow: sampleTeacherAttendanceFlow,
    };

    const parsed = DomainEntrySchema.parse(entry);
    expect(parsed.jtbdFlow).toBeDefined();
    expect(parsed.jtbdFlow?.jobTitle).toBe('Daily Roll Call & Arrival Notification');
  });
});
