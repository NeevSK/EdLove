import { FeatureJTBDGraphSchema } from '@repo/core/logic/registry/domainEntry';
import { describe, expect, it } from 'vitest';
import { principalConnectSchoolFlow } from './admin/principalConnectSchool.flow';
import { teacherFirstWorkspaceFlow } from './classroom/teacherFirstWorkspace.flow';
import { inspectJourneyContract, inspectJourneyPilot } from './journeyPilot';

describe('principal school connection journey pilot', () => {
  it('registers a valid contract and exposes minimal and expanded views', () => {
    expect(FeatureJTBDGraphSchema.safeParse(principalConnectSchoolFlow).success).toBe(true);
    const report = inspectJourneyPilot('flow:principal:connect_school');
    expect(report.valid).toBe(true);
    expect(report.minimal?.intent).toContain('correct school');
    expect(report.expanded?.scenarios.map((item) => item.id)).toContain('authority_failure');
    expect(report.gaps).toContain('Scenario pending_request has no evidence');
    expect(report.gaps).toContain('web binding is planned');
    expect(report.expanded?.developmentContext?.mode).toBe('brownfield');
    expect(report.expanded?.developmentContext?.invariants).toContain(
      'Principal authority is institutional or commercial, never a personal principal workspace.',
    );
    expect(report.gaps.some((gap) => gap.includes('commercial tuition institutes'))).toBe(true);
  });

  it('does not imply that legacy flows have a pilot contract', () => {
    expect(inspectJourneyPilot('flow:principal:term_setup').valid).toBe(false);
  });

  it('reports broken step and scenario references', () => {
    const journey = principalConnectSchoolFlow.journeyPilot!;
    const report = inspectJourneyContract('example', {
      ...principalConnectSchoolFlow,
      journeyPilot: {
        ...journey,
        transitions: [
          ...journey.transitions,
          { id: 'broken', from: 'resolve', to: 'missing', action: 'Open', feedback: 'Wait' },
        ],
        scenarios: [
          ...journey.scenarios,
          { id: 'broken_scenario', title: 'Broken', transitions: ['missing'], evidence: [] },
        ],
      },
    });
    expect(report.valid).toBe(false);
    expect(report.errors).toContain('Unknown step in transition broken');
    expect(report.errors).toContain('Unknown transition missing in scenario broken_scenario');
  });
});

describe('teacher first workspace journey', () => {
  it('records the existing provisioning seam without claiming Cedar or UI verification', () => {
    expect(FeatureJTBDGraphSchema.safeParse(teacherFirstWorkspaceFlow).success).toBe(true);
    const report = inspectJourneyPilot('flow:teacher:first_workspace');
    expect(report.valid).toBe(true);
    expect(report.gaps).toContain('web binding is planned');
    expect(report.gaps).toContain('authorization binding is unknown');
    expect(report.expanded?.developmentContext?.invariants.join(' ')).toContain('server-verified bond');
  });
});
