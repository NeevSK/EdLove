import { socialORPCContract } from '@repo/core/api/social.orpc.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(socialORPCContract).$context<ORPCContext>();
const iso = (value: unknown) => new Date(value as string | number | Date).toISOString();
const mapNotification = (row: any) => ({
  id: String(row.id),
  user_id: String(row.user_id),
  type: String(row.type),
  title: String(row.title),
  message: row.body ?? null,
  reference_id: row.reference_id ?? null,
  reference_type: row.reference_type ?? null,
  is_read: row.is_read === true,
  read_at: null,
  created_at: iso(row.created_at),
});

export const socialRouter = impl.router({
  getNotifications: impl.getNotifications
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const rows = await (context.db as any).notification.findMany({
        where: {
          user_id: context.user.id,
          created_at: input.query.viewDate ? { lte: new Date(input.query.viewDate) } : undefined,
        },
        take: input.query.limit ?? 30,
        orderBy: { created_at: 'desc' },
      });
      return rows.map(mapNotification);
    }),
  getUnreadNotificationCount: impl.getUnreadNotificationCount
    .use(doubleGateMiddleware)
    .handler(async ({ context }) => {
      return Number(
        await (context.db as any).notification.count({
          where: { user_id: context.user.id, is_read: false },
        }),
      );
    }),
  markNotificationRead: impl.markNotificationRead
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      await (context.db as any).notification.updateMany({
        where: { id: input.body.notificationId, user_id: context.user.id },
        data: { is_read: true },
      });
      return { success: true };
    }),
  markAllNotificationsRead: impl.markAllNotificationsRead
    .use(doubleGateMiddleware)
    .handler(async ({ context }) => {
      await (context.db as any).notification.updateMany({
        where: { user_id: context.user.id, is_read: false },
        data: { is_read: true },
      });
      return { success: true };
    }),
  blockUser: impl.blockUser.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (input.body.targetUserId === context.user.id) {
      throw SovereignError.invalidInput('Cannot block yourself.');
    }
    const db = context.db as any;
    const existing = await db.userBlock.findUnique({
      where: {
        blocker_id_blocked_id: { blocker_id: context.user.id, blocked_id: input.body.targetUserId },
      },
    });
    if (!existing)
      await db.userBlock.create({
        data: { blocker_id: context.user.id, blocked_id: input.body.targetUserId },
      });
    return { success: true };
  }),
  unblockUser: impl.unblockUser.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    await (context.db as any).userBlock.deleteMany({
      where: { blocker_id: context.user.id, blocked_id: input.body.targetUserId },
    });
    return { success: true };
  }),
  isBlockingActive: impl.isBlockingActive
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const db = context.db as any;
      const row = await db.userBlock.findFirst({
        where: {
          OR: [
            { blocker_id: context.user.id, blocked_id: input.query.targetUserId },
            { blocker_id: input.query.targetUserId, blocked_id: context.user.id },
          ],
        },
      });
      return Boolean(row);
    }),
  getBlockedUsers: impl.getBlockedUsers.use(doubleGateMiddleware).handler(async ({ context }) => {
    const rows = await (context.db as any).userBlock.findMany({
      where: { blocker_id: context.user.id },
      include: {
        blocked: { select: { id: true, full_name: true, avatar_url: true, capacity: true } },
      },
    });
    return rows.map((row: any) => ({
      id: String(row.blocked.id),
      full_name: String(row.blocked.full_name),
      avatar_url: row.blocked.avatar_url ?? null,
      capacity: row.blocked.capacity ?? null,
    }));
  }),
});
