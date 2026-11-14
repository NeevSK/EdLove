import { identityAPI } from '@repo/core/api/identity';
import { educational } from '@repo/core/logic/managers/factory';
import type { ClassroomNoteLifecycleEvent } from '@repo/core/logic/schemas/classroom-note.schema';
import { APIError } from '@repo/core/types/API';
import type { ClassroomNote } from '@repo/core/types/ClassroomNote';

export const classroomNotesAPI = {
  /**
   * @policy read ClassroomNote
   */
  async getAll(classroomId: string): Promise<ClassroomNote[]> {
    return educational.classroomNotes.getAll(classroomId) as Promise<ClassroomNote[]>;
  },

  /**
   * @policy read ClassroomNote
   */
  async getSnapshotAsOf(classroomId: string, viewDate: string): Promise<ClassroomNote[]> {
    return educational.classroomNotes.getSnapshotAsOf(classroomId, viewDate) as Promise<
      ClassroomNote[]
    >;
  },

  /**
   * @policy create ClassroomNote
   */
  async create(note: {
    classroom_id: string;
    content: string;
    note_type: ClassroomNote['note_type'];
    visibility: ClassroomNote['visibility'];
  }): Promise<ClassroomNote> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    return educational.classroomNotes.create(identity.id, {
      ...note,
      author_id: identity.id,
      is_pinned: false,
    }) as Promise<ClassroomNote>;
  },

  /**
   * @policy update ClassroomNote
   */
  async update(
    id: string,
    updates: Partial<Pick<ClassroomNote, 'content' | 'is_pinned' | 'visibility'>>,
  ): Promise<ClassroomNote> {
    return educational.classroomNotes.update(id, updates) as Promise<ClassroomNote>;
  },

  /**
   * @policy delete ClassroomNote
   */
  async delete(id: string): Promise<void> {
    await educational.classroomNotes.delete(id);
  },

  /**
   * @policy read ClassroomNote
   */
  async getTimeline(id: string): Promise<ClassroomNoteLifecycleEvent[]> {
    return educational.classroomNotes.getTimeline(id) as Promise<ClassroomNoteLifecycleEvent[]>;
  },
};

import { isEmptyArray, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_CLASSROOM_NOTES } from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'classroomNotes',
  ghostMethods: ['getAll', 'getSnapshotAsOf'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: () => MOCK_CLASSROOM_NOTES,
});
