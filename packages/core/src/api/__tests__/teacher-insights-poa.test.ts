vi.mock('../supabase', () => ({
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-1' }, error: null })),
          insert: vi.fn(() => Promise.resolve({ data: { id: 'test-1' }, error: null })),
        })),
      })),
    })),
  },
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-1' }, error: null })),
          insert: vi.fn(() => Promise.resolve({ data: { id: 'test-1' }, error: null })),
        })),
      })),
    })),
  },
}));

vi.mock('../runtimes/teacherInsights.runtime', () => ({
  teacherInsightsServices: {
    listPrivateNotes: vi.fn(),
    createPrivateNote: vi.fn(),
    deletePrivateNote: vi.fn(),
    listStudentObservations: vi.fn(),
    listStudentObservationsForEnrollment: vi.fn(),
    listStudentObservationsForStudent: vi.fn(),
    createStudentObservation: vi.fn(),
    finalizeStudentObservation: vi.fn(),
    deleteStudentObservation: vi.fn(),
    shareStudentObservation: vi.fn(),
    revokeStudentObservationShare: vi.fn(),
    promoteStudentObservation: vi.fn(),
    getStudentPotential: vi.fn(),
    upsertStudentPotential: vi.fn(),
    getInsightAuditTrail: vi.fn(),
    getInsightTimeline: vi.fn(),
  },
}));

import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { teacherInsightsAPI as rawTeacherInsightsAPI } from '../teacherInsights';
import { teacherInsightsContract } from '../teacherInsights.contract';

describe('teacher insights POA coverage', () => {
  test('teacher insights public API methods are fully contract-covered', () => {
    const coverage = assertContractCoverage(
      rawTeacherInsightsAPI,
      defineContractCoverage({
        moduleName: 'teacherInsights-test',
        contract: teacherInsightsContract,
      }),
    );

    expect(coverage.contract).toBe(teacherInsightsContract);
  });

  test('teacher insights routes carry policy metadata', () => {
    expect(teacherInsightsContract.listPrivateNotes.metadata?.policy).toEqual({
      action: 'read',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.createPrivateNote.metadata?.policy).toEqual({
      action: 'create',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.finalizeStudentObservation.metadata?.policy).toEqual({
      action: 'update',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.deleteStudentObservation.metadata?.policy).toEqual({
      action: 'delete',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.shareStudentObservation.metadata?.policy).toEqual({
      action: 'update',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.promoteStudentObservation.metadata?.policy).toEqual({
      action: 'create',
      subject: 'TeacherInsightPromotion',
    });
    expect(teacherInsightsContract.getInsightAuditTrail.metadata?.policy).toEqual({
      action: 'read',
      subject: 'TeacherInsightAudit',
    });
    expect(teacherInsightsContract.getInsightTimeline.metadata?.policy).toEqual({
      action: 'read',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.upsertStudentPotential.metadata?.policy).toEqual({
      action: 'update',
      subject: 'TeacherInsight',
    });
  });
});
