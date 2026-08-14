/**
 * Principal Notes API.
 *
 * Principal notes use the authoritative Sanctuary API highway. Authorization,
 * persistence, and response shaping live in the server handler; this module
 * is intentionally only a transport adapter for existing callers.
 */

import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { assertHighway } from '@repo/core/api/highways';
import { APIError } from '@repo/core/types/API';
import type { PrincipalNote } from '@repo/core/types/PrincipalNote';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

function assertPrincipalNotesHighway() {
  assertHighway('principal_notes_core', 'direct-api');
}

async function throwApiError(res: Response, operation: string): Promise<never> {
  throw new APIError(operation, res.status.toString());
}

function asPrincipalNote(value: unknown): PrincipalNote {
  return value as PrincipalNote;
}

export const principalNotesAPI = {
  async getAll(schoolId: string): Promise<PrincipalNote[]> {
    assertPrincipalNotesHighway();
    const res = await (client.api as any)['principal-notes'].$get({
      query: { schoolId },
    });
    if (!res.ok) await throwApiError(res, 'Failed to fetch principal notes');
    return ((await res.json()) as unknown[]).map(asPrincipalNote);
  },

  async getRecent(schoolId: string, limit = 3): Promise<PrincipalNote[]> {
    assertPrincipalNotesHighway();
    const res = await (client.api as any)['principal-notes'].recent.$get({
      query: { schoolId, limit },
    });
    if (!res.ok) await throwApiError(res, 'Failed to fetch recent principal notes');
    return ((await res.json()) as unknown[]).map(asPrincipalNote);
  },

  async create(note: {
    school_id: string;
    content: string;
    note_type: PrincipalNote['note_type'];
    context_teacher_id?: string | null;
    context_classroom_id?: string | null;
    target_date?: string | null;
  }): Promise<PrincipalNote> {
    assertPrincipalNotesHighway();
    const res = await (client.api as any)['principal-notes'].$post({
      json: {
        schoolId: note.school_id,
        content: note.content,
        noteType: note.note_type,
        contextTeacherId: note.context_teacher_id ?? null,
        contextClassroomId: note.context_classroom_id ?? null,
        targetDate: note.target_date ?? null,
      },
    });
    if (!res.ok) await throwApiError(res, 'Failed to create principal note');
    return asPrincipalNote(await res.json());
  },

  async update(
    id: string,
    updates: Partial<Pick<PrincipalNote, 'content' | 'is_pinned' | 'is_done'>>,
  ): Promise<PrincipalNote> {
    assertPrincipalNotesHighway();
    const res = await (client.api as any)['principal-notes'][':id'].$patch({
      param: { id },
      json: {
        ...(updates.content !== undefined ? { content: updates.content } : {}),
        ...(updates.is_pinned !== undefined ? { isPinned: updates.is_pinned } : {}),
        ...(updates.is_done !== undefined ? { isDone: updates.is_done } : {}),
      },
    });
    if (!res.ok) await throwApiError(res, 'Failed to update principal note');
    return asPrincipalNote(await res.json());
  },

  async delete(id: string): Promise<void> {
    assertPrincipalNotesHighway();
    const res = await (client.api as any)['principal-notes'][':id'].$delete({
      param: { id },
    });
    if (!res.ok) await throwApiError(res, 'Failed to delete principal note');
  },
};
