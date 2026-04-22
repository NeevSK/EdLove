import { classroomNotesServices } from '../domains/classroomNotes/runtime';
import type { ClassroomNote } from '../types/ClassroomNote';
import { classroomNotesContract } from './classroomNotes.contract';
import { identityAPI } from './identity';
import type { ClassroomNoteLifecycleEvent } from './schemas/classroom-note.schema';
import { APIError } from './types';

export type { ClassroomNote };

export const classroomNotesAPI = {
  /**
   * @authority read ClassroomNote
   */
  async getAll(classroomId: string): Promise<ClassroomNote[]> {
    return (await classroomNotesServices.listVisibleNotes(classroomId)) as ClassroomNote[];
  },

  /**
   * @authority read ClassroomNote
   */
  async getSnapshotAsOf(classroomId: string, viewDate: string): Promise<ClassroomNote[]> {
    return (await classroomNotesServices.listVisibleNotesAsOf(
      classroomId,
      viewDate,
    )) as ClassroomNote[];
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
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new APIError('Not authenticated', 'AUTH_REQUIRED');
    return (await classroomNotesServices.createNote(myId, note)) as ClassroomNote;
  },

  /**
   * @authority update ClassroomNote
   */
  async update(
    id: string,
    updates: Partial<Pick<ClassroomNote, 'content' | 'is_pinned' | 'visibility'>>,
  ): Promise<ClassroomNote> {
    return (await classroomNotesServices.updateNote(id, updates)) as ClassroomNote;
  },

  /**
   * @authority delete ClassroomNote
   */
  async delete(id: string): Promise<void> {
    await classroomNotesServices.deleteNote(id);
  },

  /**
   * @authority read ClassroomNote
   */
  async getTimeline(id: string): Promise<ClassroomNoteLifecycleEvent[]> {
    return classroomNotesServices.getNoteTimeline(id);
  },
};

void classroomNotesContract;
