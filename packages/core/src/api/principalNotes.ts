/**
 * Principal Notes API.
 *
 * Principal notes use the authoritative Sanctuary API highway. Authorization,
 * persistence, and response shaping live in the server handler; this module
 * is intentionally only a transport adapter for existing callers.
 */

import { orpcClient } from '@repo/core/api/orpcClient';
import type { PrincipalNote } from '@repo/core/types/PrincipalNote';

function asPrincipalNote(value: unknown): PrincipalNote {
  return value as PrincipalNote;
}

export const principalNotesAPI = {
  async getAll(schoolId: string): Promise<PrincipalNote[]> {
    return (await orpcClient.principalNotes.getAll({ query: { schoolId } })).map(asPrincipalNote);
  },

  async getRecent(schoolId: string, limit = 3): Promise<PrincipalNote[]> {
    return (await orpcClient.principalNotes.getRecent({ query: { schoolId, limit } })).map(asPrincipalNote);
  },

  async create(note: {
    school_id: string;
    content: string;
    note_type: PrincipalNote['note_type'];
    context_teacher_id?: string | null;
    context_classroom_id?: string | null;
    target_date?: string | null;
  }): Promise<PrincipalNote> {
    return asPrincipalNote(
      await orpcClient.principalNotes.create({
        body: {
        schoolId: note.school_id,
        content: note.content,
        noteType: note.note_type,
        contextTeacherId: note.context_teacher_id ?? null,
        contextClassroomId: note.context_classroom_id ?? null,
        targetDate: note.target_date ?? null,
        },
      }),
    );
  },

  async update(
    id: string,
    updates: Partial<Pick<PrincipalNote, 'content' | 'is_pinned' | 'is_done'>>,
  ): Promise<PrincipalNote> {
    return asPrincipalNote(
      await orpcClient.principalNotes.update({
        params: { id },
        body: {
        ...(updates.content !== undefined ? { content: updates.content } : {}),
        ...(updates.is_pinned !== undefined ? { isPinned: updates.is_pinned } : {}),
        ...(updates.is_done !== undefined ? { isDone: updates.is_done } : {}),
        },
      }),
    );
  },

  async delete(id: string): Promise<void> {
    await orpcClient.principalNotes.delete({ params: { id } });
  },
};
