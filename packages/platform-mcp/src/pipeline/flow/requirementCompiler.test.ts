import { describe, it, expect } from 'vitest';
import { RequirementCompiler } from './requirementCompiler.js';
import { GranularJourneySimulator } from './simulator.js';

describe('RequirementCompiler (Dynamic Requirement Ingestion at Scale)', () => {
  it('dynamically compiles an unseen attendance requirement into a verified 4-layer flow', () => {
    // Brand new domain that never existed in the engine!
    const attendanceFlow = RequirementCompiler.compile({
      journeyId: 'attendance.mark_morning_roll',
      domain: 'classroom.attendance',
      riskTier: 'sensitive',
      title: 'Morning Roll Call Attendance',
      primaryActor: 'Class Teacher',
      primaryScreen: 'AttendanceRosterFloor',
      primaryTable: 'student_attendance_records',
      pattern: 'MUTATION_WITH_OFFLINE_SYNC',
    });

    expect(attendanceFlow.metadata.id).toBe('journey:attendance.mark_morning_roll');
    expect(attendanceFlow.metadata.domain).toBe('classroom.attendance');
    expect(attendanceFlow.states['idle_state']).toBeDefined();
    expect(attendanceFlow.states['offline_queued']).toBeDefined();
    expect(attendanceFlow.invariants.rlsPolicy).toBe('tenant_id = public.get_my_tenant_id()');

    // Run simulator on the dynamically generated flow!
    const simulator = new GranularJourneySimulator(attendanceFlow);
    const offlineResult = simulator.runScenario('offline_recovery');
    expect(offlineResult.success).toBe(true);
    expect(offlineResult.steps.length).toBe(4);
    expect(offlineResult.finalTerminal).toBe('terminal_success');
  });

  it('dynamically compiles an unseen financial approval requirement with a reviewer loop', () => {
    // Multi-actor finance approval flow
    const financeFlow = RequirementCompiler.compile({
      journeyId: 'finance.bursary_disbursement',
      domain: 'finance.bursary',
      riskTier: 'critical',
      title: 'Student Bursary Application',
      primaryActor: 'Student Applicant',
      reviewerRole: 'School Bursar',
      primaryScreen: 'BursaryApplicationFloor',
      primaryTable: 'bursary_disbursements',
      pattern: 'MULTI_ACTOR_REVIEW',
    });

    expect(financeFlow.metadata.multiActor).toBe(true);
    expect(financeFlow.states['draft_view']).toBeDefined();
    expect(financeFlow.states['under_review']).toBeDefined();

    const simulator = new GranularJourneySimulator(financeFlow);
    const result = simulator.runScenario('happy_path');
    expect(result.success).toBe(true);
    expect(result.steps[0]?.actor).toBe('author');
    expect(result.steps[1]?.actor).toBe('reviewer');
    expect(result.finalTerminal).toBe('terminal_approved');
  });
});
