jest.mock('../../domains/educational/runtime', () => ({
  educationalServices: {
    grading: {
      submitGrade: jest.fn(),
      getById: jest.fn(),
      reviseGrade: jest.fn(),
      getReportCard: jest.fn(),
      getClassroomGrades: jest.fn(),
      getGradingSettings: jest.fn(),
      updateGradingSettings: jest.fn(),
      deleteGrade: jest.fn(),
    },
  },
}));

jest.mock('../../domains/gradingProjection/runtime', () => ({
  gradingProjectionServices: {
    getSchoolGradingCompletion: jest.fn(),
    getSchoolPublishedGradingCompletion: jest.fn(),
  },
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

import type { POAMetadata } from '../contract';
import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { gradingAPI as rawGradingAPI } from '../grading';
import { gradingContract } from '../grading.contract';

describe('grading POA coverage', () => {
  test('grading public API methods are fully contract-covered', () => {
    const coverage = assertContractCoverage(
      rawGradingAPI,
      defineContractCoverage({
        moduleName: 'grading-test',
        contract: gradingContract,
        methodMapping: {
          saveGradeDraft: 'saveGradeDraft',
          getGradebookSnapshot: 'getGradebookSnapshot',
          getStudentGradeTimeline: 'getStudentGradeTimeline',
          getPublishedStudentGrades: 'getPublishedStudentGrades',
          getSchoolGradingCompletion: 'getSchoolGradingCompletion',
          getSchoolPublishedGradingCompletion: 'getSchoolPublishedGradingCompletion',
          publishGrade: 'publishGrade',
          revisePublishedGrade: 'revisePublishedGrade',
          overrideGrade: 'overrideGrade',
        },
      }),
    );

    expect(coverage.contract).toBe(gradingContract);
  });

  test('grading temporal routes carry authority metadata', () => {
    expect((gradingContract.getGradebookSnapshot.metadata as POAMetadata)?.authority).toEqual({
      action: 'read',
      subject: 'Grade',
    });
    expect((gradingContract.getStudentGradeTimeline.metadata as POAMetadata)?.authority).toEqual({
      action: 'read',
      subject: 'Grade',
    });
    expect((gradingContract.getPublishedStudentGrades.metadata as POAMetadata)?.authority).toEqual({
      action: 'read',
      subject: 'Grade',
    });
    expect((gradingContract.getSchoolGradingCompletion.metadata as POAMetadata)?.authority).toEqual(
      {
        action: 'read',
        subject: 'Grade',
      },
    );
    expect(
      (gradingContract.getSchoolPublishedGradingCompletion.metadata as POAMetadata)?.authority,
    ).toEqual({
      action: 'read',
      subject: 'Grade',
    });
    expect((gradingContract.publishGrade.metadata as POAMetadata)?.authority).toEqual({
      action: 'publish',
      subject: 'Grade',
    });
    expect((gradingContract.overrideGrade.metadata as POAMetadata)?.authority).toEqual({
      action: 'override',
      subject: 'Grade',
    });
  });
});
