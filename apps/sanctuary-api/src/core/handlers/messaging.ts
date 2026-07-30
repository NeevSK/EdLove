import { implement } from '@orpc/server';
import { messagingORPCContract } from '@repo/core/api/messaging.orpc.contract';
import type { ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(messagingORPCContract).$context<ORPCContext>();
const iso = (value: unknown) => new Date(value as string | number | Date).toISOString();

const mapConversation = (row: any, userId: string) => {
  const other = row.user1_id === userId ? row.user2 : row.user1;
  const other_user_id = row.user1_id === userId ? row.user2_id : row.user1_id;
  return {
    id: String(row.id), user1_id: String(row.user1_id), user2_id: String(row.user2_id),
    created_at: iso(row.created_at), updated_at: iso(row.updated_at),
    other_user_id: String(other_user_id), other_user_name: other?.full_name ?? 'Anonymous User', other_user_avatar: other?.avatar_url ?? null,
  };
};

const mapMessage = (row: any) => ({
  id: String(row.id), conversation_id: String(row.conversation_id), author_id: String(row.author_id),
  content: String(row.content), created_at: iso(row.created_at),
  author_name: row.author?.full_name ?? null, author_avatar_url: row.author?.avatar_url ?? null,
});

export const messagingRouter = impl.router({
  getConversations: impl.getConversations.use(doubleGateMiddleware).handler(async ({ context }) => {
    const rows = await (context.db as any).directConversation.findMany({
      where: { OR: [{ user1_id: context.user.id }, { user2_id: context.user.id }] },
      orderBy: { updated_at: 'desc' }, include: { user1: true, user2: true },
    });
    return rows.map((row: any) => mapConversation(row, context.user.id));
  }),
  getOrCreateConversation: impl.getOrCreateConversation.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (input.targetUserId === context.user.id) throw new Error('Cannot create a conversation with yourself');
    const [user1_id, user2_id] = [context.user.id, input.targetUserId].sort();
    const db = context.db as any;
    const existing = await db.directConversation.findUnique({ where: { user1_id_user2_id: { user1_id, user2_id } } });
    if (existing) return String(existing.id);
    const row = await db.directConversation.create({ data: { user1_id, user2_id } });
    return String(row.id);
  }),
  getMessages: impl.getMessages.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).directMessage.findMany({
      where: { conversation_id: input.conversationId, created_at: input.viewDate ? { lte: new Date(input.viewDate) } : undefined },
      take: input.limit ?? 60, orderBy: { created_at: 'asc' },
      include: { author: { select: { full_name: true, avatar_url: true } } },
    });
    return rows.map(mapMessage);
  }),
  sendMessage: impl.sendMessage.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).directMessage.create({
      data: { conversation_id: input.conversationId, author_id: context.user.id, content: input.content },
      include: { author: { select: { full_name: true, avatar_url: true } } },
    });
    return mapMessage(row);
  }),
});
