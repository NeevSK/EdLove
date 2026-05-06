import type {
  ClassroomNoteCreate,
  ClassroomNoteLifecycleEvent,
  ClassroomNoteRecord,
  ClassroomNoteUpdate,
} from '../../schemas/classroom-note.schema';

export interface ClassroomNotesRepository {
  listVisibleNotes(classroomId: string): Promise<ClassroomNoteRecord[]>;
  listVisibleNotesAsOf(classroomId: string, viewDate: string): Promise<ClassroomNoteRecord[]>;
  createNote(authorId: string, input: ClassroomNoteCreate): Promise<ClassroomNoteRecord>;
  updateNote(id: string, updates: ClassroomNoteUpdate): Promise<ClassroomNoteRecord>;
  deleteNote(id: string): Promise<void>;
  getNoteTimeline(noteId: string): Promise<ClassroomNoteLifecycleEvent[]>;
}
