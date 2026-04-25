vi.mock('../../lib/supabase', () => ({
  supabase: {},
}));

vi.mock('../identity', () => ({
  identityAPI: {
    getMyInternalId: vi.fn(),
  },
}));

import { classroomNotesAPI as rawClassroomNotesAPI } from '../classroomNotes';
import { classroomNotesContract } from '../classroomNotes.contract';
import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';

describe('classroom notes POA coverage', () => {
  test('classroom notes public API methods are fully contract-covered', () => {
    const coverage = assertContractCoverage(
      rawClassroomNotesAPI,
      defineContractCoverage({
        moduleName: 'classroomNotes-test',
        contract: classroomNotesContract,
        methodMapping: {
          getAll: 'listVisibleNotes',
          getSnapshotAsOf: 'getVisibleNotesSnapshot',
          create: 'createClassroomNote',
          update: 'updateClassroomNote',
          delete: 'deleteClassroomNote',
          getTimeline: 'getClassroomNoteTimeline',
        },
      }),
    );

    expect(coverage.contract).toBe(classroomNotesContract);
  });

  test('classroom notes routes carry authority metadata', () => {
    expect(classroomNotesContract.listVisibleNotes.metadata?.authority).toEqual({
      action: 'read',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.getVisibleNotesSnapshot.metadata?.authority).toEqual({
      action: 'read',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.createClassroomNote.metadata?.authority).toEqual({
      action: 'create',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.updateClassroomNote.metadata?.authority).toEqual({
      action: 'update',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.deleteClassroomNote.metadata?.authority).toEqual({
      action: 'delete',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.getClassroomNoteTimeline.metadata?.authority).toEqual({
      action: 'read',
      subject: 'ClassroomNote',
    });
  });
});
