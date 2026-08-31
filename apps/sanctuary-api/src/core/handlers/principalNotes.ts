import { principalNotesORPCContract } from '@repo/core/api/server';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(principalNotesORPCContract).$context<ORPCContext>();
const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value ?? ''));

const mapNote = (row: any) => ({
  id: String(row.id),
  school_id: String(row.school_id),
  author_id: String(row.author_id),
  content: String(row.content ?? ''),
  note_type: row.note_type ?? 'note',
  is_pinned: Boolean(row.is_pinned),
  is_done: Boolean(row.is_done),
  context_teacher_id: row.context_teacher_id ?? null,
  context_classroom_id: row.context_classroom_id ?? null,
  ...(row.target_date !== undefined
    ? { target_date: row.target_date ? iso(row.target_date) : null }
    : {}),
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

export const principalNotesRouter = impl.router({
  getAll: impl.getAll.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const rows = await (context.db as any).principalNote.findMany({
      where: { school_id: input.query.schoolId, author_id: context.user.id },
      orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
    });
    return rows.map(mapNote);
  }),
  getRecent: impl.getRecent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const rows = await (context.db as any).principalNote.findMany({
      where: { school_id: input.query.schoolId, author_id: context.user.id, is_done: false },
      orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
      take: input.query.limit ?? 3,
    });
    return rows.map(mapNote);
  }),
  create: impl.create.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const row = await (context.db as any).principalNote.create({
      data: {
        school_id: input.body.schoolId,
        author_id: context.user.id,
        content: input.body.content,
        note_type: input.body.noteType,
        is_pinned: false,
        is_done: false,
        context_teacher_id: input.body.contextTeacherId ?? null,
        context_classroom_id: input.body.contextClassroomId ?? null,
        target_date: input.body.targetDate ?? null,
      },
    });
    return mapNote(row);
  }),
  update: impl.update.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const row = await (context.db as any).principalNote.update({
      where: { id: input.params.id },
      data: {
        ...(input.body.content !== undefined ? { content: input.body.content } : {}),
        ...(input.body.isPinned !== undefined ? { is_pinned: input.body.isPinned } : {}),
        ...(input.body.isDone !== undefined ? { is_done: input.body.isDone } : {}),
      },
    });
    return mapNote(row);
  }),
  delete: impl.delete.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    await (context.db as any).principalNote.delete({ where: { id: input.params.id } });
    return { success: true };
  }),
});
