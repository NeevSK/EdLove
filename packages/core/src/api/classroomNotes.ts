import type { ClassroomNoteLifecycleEvent } from '../logic/schemas/classroom-note.schema';
import { APIError } from '../types/API';
import type { ClassroomNote } from '../types/ClassroomNote';
import { educational, identity } from '../logic/managers/factory';

export type { ClassroomNote };

export const classroomNotesAPI = {
  /**
   * @authority read ClassroomNote
   */
  async getAll(classroomId: string): Promise<ClassroomNote[]> {
    return educational.classroomNotes.getAll(classroomId) as Promise<ClassroomNote[]>;
  },

  /**
   * @authority read ClassroomNote
   */
  async getSnapshotAsOf(classroomId: string, viewDate: string): Promise<ClassroomNote[]> {
    return educational.classroomNotes.getSnapshotAsOf(classroomId, viewDate) as Promise<ClassroomNote[]>;
  },

  /**
   * @authority create ClassroomNote
   */
  async create(note: {
    classroom_id: string;
    content: string;
    note_type: ClassroomNote['note_type'];
    visibility: ClassroomNote['visibility'];
  }): Promise<ClassroomNote> {
    const myId = await identity.getMyInternalId();
    if (!myId) throw new APIError('Not authenticated', 'AUTH_REQUIRED');
    
    return educational.classroomNotes.create(myId, {
      ...note,
      author_id: myId,
      is_pinned: false,
    }) as Promise<ClassroomNote>;
  },

  /**
   * @authority update ClassroomNote
   */
  async update(
    id: string,
    updates: Partial<Pick<ClassroomNote, 'content' | 'is_pinned' | 'visibility'>>,
  ): Promise<ClassroomNote> {
    return educational.classroomNotes.update(id, updates) as Promise<ClassroomNote>;
  },

  /**
   * @authority delete ClassroomNote
   */
  async delete(id: string): Promise<void> {
    await educational.classroomNotes.delete(id);
  },

  /**
   * @authority read ClassroomNote
   */
  async getTimeline(id: string): Promise<ClassroomNoteLifecycleEvent[]> {
    return educational.classroomNotes.getTimeline(id) as Promise<ClassroomNoteLifecycleEvent[]>;
  },
};
