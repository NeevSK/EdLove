import { identityAPI } from './identity';
import { APIError } from './types';
import type { ClassroomNote } from '../types/ClassroomNote';
import { classroomNotesContract } from './classroomNotes.contract';
import { classroomNotesServices } from '../domains/classroomNotes/runtime';
import type { ClassroomNoteLifecycleEvent } from './schemas/classroom-note.schema';

export type { ClassroomNote };

export const classroomNotesAPI = {
    /**
     * @authority read ClassroomNote
     */
    async getAll(classroomId: string): Promise<ClassroomNote[]> {
        return classroomNotesServices.listVisibleNotes(classroomId);
    },

    /**
     * @authority read ClassroomNote
     */
    async getSnapshotAsOf(classroomId: string, viewDate: string): Promise<ClassroomNote[]> {
        return classroomNotesServices.listVisibleNotesAsOf(classroomId, viewDate);
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
        return classroomNotesServices.createNote(myId, note);
    },

    /**
     * @authority update ClassroomNote
     */
    async update(
        id: string,
        updates: Partial<Pick<ClassroomNote, 'content' | 'is_pinned' | 'visibility'>    ): Promise<ClassroomNote> {
        return classroomNotesServices.updateNote(id, updates);
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
