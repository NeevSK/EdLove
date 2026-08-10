vi.mock('../supabase', () => ({
  supabaseClient: {
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

vi.mock('../identity', () => ({
  identityAPI: {
    identifyActiveCitizen: vi.fn(),
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

  test('classroom notes routes carry policy metadata', () => {
    expect(classroomNotesContract.listVisibleNotes.metadata?.policy).toEqual({
      action: 'read',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.getVisibleNotesSnapshot.metadata?.policy).toEqual({
      action: 'read',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.createClassroomNote.metadata?.policy).toEqual({
      action: 'create',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.updateClassroomNote.metadata?.policy).toEqual({
      action: 'update',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.deleteClassroomNote.metadata?.policy).toEqual({
      action: 'delete',
      subject: 'ClassroomNote',
    });
    expect(classroomNotesContract.getClassroomNoteTimeline.metadata?.policy).toEqual({
      action: 'read',
      subject: 'ClassroomNote',
    });
  });
});
