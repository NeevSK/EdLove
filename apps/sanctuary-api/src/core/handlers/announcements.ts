import { ORPCError } from '@orpc/server';
import { announcementsORPCContract } from '@repo/core/api/announcements.orpc.contract';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(announcementsORPCContract).$context<ORPCContext>();
// The Announcement model now exists in schema.zmodel (PB0). This board shows
// published school-wide posts only; grade-class notices, drafts and scheduled
// notices belong to planBridge and must not leak here.
const requireOwnSchool = (schoolId: string, context: ORPCContext) => {
  if (!context.schoolId || context.schoolId !== schoolId) {
    throw new ORPCError('FORBIDDEN', { message: 'Announcements are limited to your school.' });
  }
};
const iso = (value: unknown) => new Date(value as string | number | Date).toISOString();
const mapAnnouncement = (row: any) => ({
  id: String(row.id),
  school_id: String(row.school_id),
  author_id: row.author_id ?? null,
  title: String(row.title ?? ''),
  content: String(row.content ?? ''),
  is_pinned: row.is_pinned === true,
  created_at: iso(row.created_at),
  author_name: row.author?.full_name ?? null,
  author_avatar: row.author?.avatar_url ?? null,
});

export const announcementsRouter = impl.router({
  getAnnouncements: impl.getAnnouncements
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireOwnSchool(input.query.schoolId, context);
      const rows = await (context.db as any).announcement.findMany({
        where: { school_id: input.query.schoolId, audience_scope: 'school', status: 'sent' },
        orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
        include: { author: { select: { full_name: true, avatar_url: true } } },
      });
      return rows.map(mapAnnouncement);
    }),
  createAnnouncement: impl.createAnnouncement
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireOwnSchool(input.body.schoolId, context);
      const now = new Date();
      const row = await (context.db as any).announcement.create({
        data: {
          audience_scope: 'school',
          status: 'sent',
          sent_at: now,
          school_id: input.body.schoolId,
          author_id: context.user.id,
          title: input.body.title ?? '',
          content: input.body.content,
          is_pinned: input.body.isPinned === true,
        },
        include: { author: { select: { full_name: true, avatar_url: true } } },
      });
      return mapAnnouncement(row);
    }),
});
