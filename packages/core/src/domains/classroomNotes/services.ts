import type {
    ClassroomNoteCreate,
    ClassroomNoteLifecycleEvent,
    ClassroomNoteRecord,
    ClassroomNoteUpdate,
} from '../../api/schemas/classroom-note.schema';
import type { ClassroomNotesRepository } from './ports';

export interface ClassroomNotesServices {
    listVisibleNotes(classroomId: string): Promise<ClassroomNoteRecord[]>;
    listVisibleNotesAsOf(classroomId: string, viewDate: string): Promise<ClassroomNoteRecord[]>;
    createNote(authorId: string, input: ClassroomNoteCreate): Promise<ClassroomNoteRecord>;
    updateNote(id: string, updates: ClassroomNoteUpdate): Promise<ClassroomNoteRecord>;
    deleteNote(id: string): Promise<void>;
    getNoteTimeline(noteId: string): Promise<ClassroomNoteLifecycleEvent[]>;
}

export const createClassroomNotesServices = (
    repository: ClassroomNotesRepository,
): ClassroomNotesServices => ({
    listVisibleNotes: (classroomId) => repository.listVisibleNotes(classroomId),
    listVisibleNotesAsOf: (classroomId, viewDate) => repository.listVisibleNotesAsOf(classroomId, viewDate),
    createNote: (authorId, input) => repository.createNote(authorId, input),
    updateNote: (id, updates) => repository.updateNote(id, updates),
    deleteNote: (id) => repository.deleteNote(id),
    getNoteTimeline: (noteId) => repository.getNoteTimeline(noteId),
});
