jest.mock('../native/runtimes/teacherInsights.runtime', () => ({
  teacherInsightsServices: {
    listPrivateNotes: jest.fn(),
    createPrivateNote: jest.fn(),
    deletePrivateNote: jest.fn(),
    listStudentObservations: jest.fn(),
    listStudentObservationsForEnrollment: jest.fn(),
    listStudentObservationsForStudent: jest.fn(),
    createStudentObservation: jest.fn(),
    finalizeStudentObservation: jest.fn(),
    deleteStudentObservation: jest.fn(),
    shareStudentObservation: jest.fn(),
    revokeStudentObservationShare: jest.fn(),
    promoteStudentObservation: jest.fn(),
    getStudentPotential: jest.fn(),
    upsertStudentPotential: jest.fn(),
    getInsightAuditTrail: jest.fn(),
    getInsightTimeline: jest.fn(),
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

  test('teacher insights routes carry authority metadata', () => {
    expect(teacherInsightsContract.listPrivateNotes.metadata?.authority).toEqual({
      action: 'read',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.createPrivateNote.metadata?.authority).toEqual({
      action: 'create',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.finalizeStudentObservation.metadata?.authority).toEqual({
      action: 'update',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.deleteStudentObservation.metadata?.authority).toEqual({
      action: 'delete',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.shareStudentObservation.metadata?.authority).toEqual({
      action: 'update',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.promoteStudentObservation.metadata?.authority).toEqual({
      action: 'create',
      subject: 'TeacherInsightPromotion',
    });
    expect(teacherInsightsContract.getInsightAuditTrail.metadata?.authority).toEqual({
      action: 'read',
      subject: 'TeacherInsightAudit',
    });
    expect(teacherInsightsContract.getInsightTimeline.metadata?.authority).toEqual({
      action: 'read',
      subject: 'TeacherInsight',
    });
    expect(teacherInsightsContract.upsertStudentPotential.metadata?.authority).toEqual({
      action: 'update',
      subject: 'TeacherInsight',
    });
  });
});
