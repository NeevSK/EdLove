import { selectLatestTemporalRecordsAsOf } from '@repo/core/lib/temporalEvents';
import type { ClassroomNotesRepository } from '@repo/core/logic/domains/classroomNotes/ports';
import {
  type ClassroomNoteCreate,
  ClassroomNoteCreateSchema,
  type ClassroomNoteLifecycleEvent,
  ClassroomNoteLifecycleEventSchema,
  type ClassroomNoteRecord,
  ClassroomNoteSchema,
  type ClassroomNoteUpdate,
  ClassroomNoteUpdateSchema,
} from '@repo/core/logic/schemas/classroom-note.schema';
import { APIError } from '@repo/core/types/API';
import type { SupabaseClient } from '@supabase/supabase-js';

type ClassroomNoteRow = Record<string, unknown> & {
  id: string;
  classroom_id: string;
  author_id: string;
  content: string;
  note_type: ClassroomNoteRecord['note_type'];
  visibility: ClassroomNoteRecord['visibility'];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: { full_name: string; capacity: string };
};

const selectNoteFields = '*, author:users(full_name, capacity)';

const sortNotes = (notes: ClassroomNoteRecord[]) =>
  [...notes].sort((left, right) => {
    if (left.is_pinned !== right.is_pinned) {
      return left.is_pinned ? -1 : 1;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });

export const createSupabaseClassroomNotesRepository = (
  supabase: SupabaseClient,
): ClassroomNotesRepository => {
  const logClassroomNoteEvent = async ({
    note,
    eventType,
    recordedBy,
    occurredAt,
    effectiveFrom,
    effectiveTo,
  }: {
    note: ClassroomNoteRow;
    eventType: 'create' | 'update' | 'delete';
    recordedBy?: string | null;
    occurredAt?: string;
    effectiveFrom?: string | null;
    effectiveTo?: string | null;
  }) => {
    const snapshot = {
      id: note.id,
      classroom_id: note.classroom_id,
      author_id: note.author_id,
      content: note.content,
      note_type: note.note_type,
      visibility: note.visibility,
      is_pinned: note.is_pinned,
      created_at: note.created_at,
      updated_at: note.updated_at,
      author: note.author ?? null,
    };

    const { error } = await supabase.from('classroom_note_events').insert({
      entity_id: note.id,
      classroom_id: note.classroom_id,
      author_id: note.author_id,
      operation: eventType,
      note_type: note.note_type,
      visibility: note.visibility,
      is_pinned: note.is_pinned,
      metadata: snapshot,
      occurred_at: occurredAt ?? new Date().toISOString(),
      effective_from: effectiveFrom ?? note.created_at ?? new Date().toISOString(),
      effective_to: effectiveTo ?? null,
      recorded_by: recordedBy ?? note.author_id,
    });

    if (error) {
      console.warn('Failed to record classroom note lifecycle event', error);
    }
  };

  return {
    async listVisibleNotes(classroomId) {
      const { data, error } = await supabase
        .from('classroom_notes')
        .select(selectNoteFields)
        .eq('classroom_id', classroomId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw new APIError('Failed to fetch classroom notes', error.code, error);
      return (data ?? []).map((row) => ClassroomNoteSchema.parse(row)) as ClassroomNoteRecord[];
    },

    async listVisibleNotesAsOf(classroomId, viewDate) {
      const { data, error } = await supabase
        .from('classroom_note_events')
        .select('*')
        .eq('classroom_id', classroomId)
        .lte('occurred_at', viewDate)
        .order('occurred_at', { ascending: false })
        .order('recorded_at', { ascending: false });

      if (error) throw new APIError('Failed to fetch classroom note snapshot', error.code, error);

      const latestByNote = selectLatestTemporalRecordsAsOf(
        (data ?? []).map((row) => {
          const parsed = ClassroomNoteLifecycleEventSchema.parse(row);
          return parsed;
        }),
        viewDate,
        {
          getEntityKey: (event) => `classroom_note:${event.entity_id}`,
          getEffectiveTo: (event) => event.effective_to,
        },
      );

      const visible = latestByNote
        .filter((event) => event.operation !== 'delete')
        .map((event) => ClassroomNoteSchema.parse(event.metadata));

      return sortNotes(visible) as ClassroomNoteRecord[];
    },

    async createNote(authorId, input) {
      const payload = ClassroomNoteCreateSchema.parse(input) as ClassroomNoteCreate;
      const { data, error } = await supabase
        .from('classroom_notes')
        .insert([{ ...payload, author_id: authorId, is_pinned: false }])
        .select(selectNoteFields)
        .single();

      if (error) throw new APIError('Failed to create classroom note', error.code, error);

      await logClassroomNoteEvent({
        note: data as ClassroomNoteRow,
        eventType: 'create',
        recordedBy: authorId,
        occurredAt: String((data as ClassroomNoteRow).created_at ?? new Date().toISOString()),
        effectiveFrom: String((data as ClassroomNoteRow).created_at ?? new Date().toISOString()),
      });

      return ClassroomNoteSchema.parse(data) as ClassroomNoteRecord;
    },

    async updateNote(id, updates) {
      const payload = ClassroomNoteUpdateSchema.parse(updates) as ClassroomNoteUpdate;
      const updatedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from('classroom_notes')
        .update({ ...payload, updated_at: updatedAt })
        .eq('id', id)
        .select(selectNoteFields)
        .single();

      if (error) throw new APIError('Failed to update classroom note', error.code, error);

      await logClassroomNoteEvent({
        note: data as ClassroomNoteRow,
        eventType: 'update',
        recordedBy: String((data as ClassroomNoteRow).author_id),
        occurredAt: updatedAt,
        effectiveFrom: String((data as ClassroomNoteRow).created_at ?? updatedAt),
      });

      return ClassroomNoteSchema.parse(data) as ClassroomNoteRecord;
    },

    async deleteNote(id) {
      const { data: existing, error: existingError } = await supabase
        .from('classroom_notes')
        .select(selectNoteFields)
        .eq('id', id)
        .maybeSingle();

      if (existingError) {
        throw new APIError(
          'Failed to fetch classroom note before delete',
          existingError.code,
          existingError,
        );
      }

      const { error } = await supabase.from('classroom_notes').delete().eq('id', id);
      if (error) throw new APIError('Failed to delete classroom note', error.code, error);

      if (existing) {
        const deletedAt = new Date().toISOString();
        await logClassroomNoteEvent({
          note: existing as ClassroomNoteRow,
          eventType: 'delete',
          recordedBy: String((existing as ClassroomNoteRow).author_id),
          occurredAt: deletedAt,
          effectiveFrom: String((existing as ClassroomNoteRow).created_at ?? deletedAt),
          effectiveTo: deletedAt,
        });
      }
    },

    async getNoteTimeline(noteId) {
      const { data, error } = await supabase
        .from('classroom_note_events')
        .select('*')
        .eq('entity_id', noteId)
        .order('occurred_at', { ascending: false })
        .order('recorded_at', { ascending: false });

      if (error) throw new APIError('Failed to fetch classroom note timeline', error.code, error);
      return (data ?? []).map((row) =>
        ClassroomNoteLifecycleEventSchema.parse(row),
      ) as ClassroomNoteLifecycleEvent[];
    },
  };
};
