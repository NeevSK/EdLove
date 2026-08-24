import { announcementsORPCContract } from '@repo/core/api/announcements.orpc.contract';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(announcementsORPCContract).$context<ORPCContext>();
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
      const rows = await (context.db as any).announcement.findMany({
        where: { school_id: input.schoolId },
        orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
        include: { author: { select: { full_name: true, avatar_url: true } } },
      });
      return rows.map(mapAnnouncement);
    }),
  createAnnouncement: impl.createAnnouncement
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const row = await (context.db as any).announcement.create({
        data: {
          school_id: input.schoolId,
          author_id: context.user.id,
          title: input.title ?? '',
          content: input.content,
          is_pinned: input.isPinned === true,
        },
        include: { author: { select: { full_name: true, avatar_url: true } } },
      });
      return mapAnnouncement(row);
    }),
});
